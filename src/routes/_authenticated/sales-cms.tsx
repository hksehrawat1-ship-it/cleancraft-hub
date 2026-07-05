import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Phone, MessageCircle, Clock, Flame, AlertTriangle, CalendarClock, Search,
  PhoneCall, Sparkles, CheckCircle2, ChevronRight, Plus, User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LeadDialog, classificationVariant, type Lead } from "./leads";

export const Route = createFileRoute("/_authenticated/sales-cms")({
  head: () => ({ meta: [{ title: "Sales CMS — Clean Craft OS" }] }),
  component: SalesCmsPage,
});

/* ============== Auto-cadence rules (MNC-style) ==============
   Given a call outcome + current stage, compute:
   - the next follow-up date (days from today)
   - optional new stage
   - the next action verb
============================================================ */

type Outcome =
  | "not_answered"
  | "answered_interested"
  | "needs_proposal"
  | "meeting_scheduled"
  | "callback_requested"
  | "not_interested";

const OUTCOME_LABEL: Record<Outcome, string> = {
  not_answered: "Not Answered",
  answered_interested: "Answered — Interested",
  needs_proposal: "Wants a Proposal",
  meeting_scheduled: "Meeting Scheduled",
  callback_requested: "Callback Requested",
  not_interested: "Not Interested",
};

type CadenceRule = {
  addDays: number | null; // null = don't auto-schedule (Lost/Meeting has explicit date)
  nextStage?: string;
  nextAction?: string;
  newClassification?: string;
};

function cadence(outcome: Outcome, attempts: number): CadenceRule {
  switch (outcome) {
    case "not_answered": {
      // Escalating cadence: 1d, 2d, 3d, 7d
      const table = [1, 2, 3, 7];
      const d = table[Math.min(attempts, table.length - 1)];
      return { addDays: d, nextAction: "Call" };
    }
    case "answered_interested":
      return { addDays: 3, nextStage: "Qualified", nextAction: "Follow-up" };
    case "needs_proposal":
      return { addDays: 2, nextStage: "Proposal Sent", nextAction: "Send Proposal" };
    case "meeting_scheduled":
      return { addDays: 0, nextStage: "Meeting Done", nextAction: "Schedule Meeting" };
    case "callback_requested":
      return { addDays: 1, nextAction: "Call" };
    case "not_interested":
      return { addDays: null, nextStage: "Lost", nextAction: "Disqualify", newClassification: "Time Waster" };
  }
}

/* ============== Talking scripts per stage ============== */

const SCRIPTS: Record<string, { pitch: string; ask: string[] }> = {
  "New Lead": {
    pitch:
      "Introduce yourself, confirm they filled the enquiry, and ask what got them interested in the Clean Craft franchise.",
    ask: [
      "Are you the decision maker?",
      "What is your budget range?",
      "Which city / location are you looking at?",
      "Timeline to start — 1 month, 3 months, 6 months?",
    ],
  },
  "Contacted": {
    pitch:
      "You have already introduced. Now qualify hard — budget, location, timeline, decision maker.",
    ask: [
      "Have you shortlisted a location?",
      "Are you buying solo or with a partner?",
      "What's more important to you — profitability, brand, or training?",
    ],
  },
  "Qualified": {
    pitch:
      "They fit the profile. Sell the value: profitability, tech, training, brand. Push for the proposal request.",
    ask: [
      "Can I share the detailed franchise proposal on WhatsApp?",
      "Best email to send the deck?",
    ],
  },
  "Proposal Sent": {
    pitch:
      "Confirm they received & read the proposal. Handle objections. Nudge toward a Google Meet with Sales Head.",
    ask: [
      "Did you go through the ROI section?",
      "Any questions on the fee structure?",
      "Can we lock a Google Meet with our Sales Head this week?",
    ],
  },
  "Follow-up": {
    pitch: "Reference the last conversation. Do NOT restart from zero. Move them one step forward.",
    ask: [
      "Last time we discussed X — where do you stand now?",
      "What's blocking the next step?",
    ],
  },
  "Meeting Done": {
    pitch:
      "Post-meeting close. Send Engagement Letter, ask for booking amount confirmation.",
    ask: [
      "Are you comfortable moving ahead with the Engagement Letter?",
      "Can I share account details for the booking amount?",
    ],
  },
  "Engagement Letter Pending": {
    pitch:
      "Chase the engagement fee. Create urgency — mention pipeline, next batch, city availability.",
    ask: [
      "By when can we expect the engagement fee transfer?",
      "Do you need me to share the account details again?",
    ],
  },
  "Booking Received": {
    pitch: "Congratulate. Set expectations for handover to Projects team.",
    ask: [
      "Great — I'll now connect you with our Projects Coordinator.",
      "Any preferred launch date in mind?",
    ],
  },
};

function scriptFor(stage: string) {
  return (
    SCRIPTS[stage] ?? {
      pitch: "Consult the CRM notes and last remark before dialing.",
      ask: ["Pick up from where you left last time."],
    }
  );
}

/* ============== Helpers ============== */

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function isTerminal(stage: string) {
  return stage === "Lost" || stage === "Handover Completed" || stage === "Handover Done";
}

type QueueBucket = "overdue" | "today" | "hot" | "upcoming";

function bucketOf(l: Lead): QueueBucket | null {
  if (isTerminal(l.lead_stage)) return null;
  const t = todayISO();
  if (l.followup_date && l.followup_date < t) return "overdue";
  if (l.followup_date === t) return "today";
  if (l.lead_classification === "Hot") return "hot";
  if (l.followup_date && l.followup_date > t) return "upcoming";
  return "upcoming";
}

const BUCKET_META: Record<QueueBucket, { label: string; icon: any; tone: string; ring: string }> = {
  overdue: { label: "Overdue", icon: AlertTriangle, tone: "text-red-600", ring: "ring-red-200 bg-red-50/60" },
  today: { label: "Due Today", icon: CalendarClock, tone: "text-blue-600", ring: "ring-blue-200 bg-blue-50/60" },
  hot: { label: "Hot Untouched", icon: Flame, tone: "text-orange-600", ring: "ring-orange-200 bg-orange-50/60" },
  upcoming: { label: "Upcoming", icon: Clock, tone: "text-slate-600", ring: "ring-slate-200 bg-slate-50/60" },
};

/* ============== Page ============== */

function SalesCmsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"queue" | "customers">("queue");
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles").select("id, full_name").order("full_name");
      if (error) throw error;
      return data as { id: string; full_name: string }[];
    },
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["sales-cms-leads", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads").select("*")
        .order("followup_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["sales-cms-leads"] });
  };

  const filteredLeads = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) =>
      `${l.name} ${l.phone ?? ""} ${l.city ?? ""} ${l.email ?? ""}`.toLowerCase().includes(s),
    );
  }, [leads, search]);

  const queue = useMemo(() => {
    const g: Record<QueueBucket, Lead[]> = { overdue: [], today: [], hot: [], upcoming: [] };
    for (const l of filteredLeads) {
      const b = bucketOf(l);
      if (b) g[b].push(l);
    }
    // Sort each: overdue by oldest, today by hot first, upcoming by soonest
    g.overdue.sort((a, b) => (a.followup_date ?? "").localeCompare(b.followup_date ?? ""));
    g.today.sort((a, b) => (a.lead_classification === "Hot" ? -1 : 1) - (b.lead_classification === "Hot" ? -1 : 1));
    g.upcoming.sort((a, b) => (a.followup_date ?? "9999").localeCompare(b.followup_date ?? "9999"));
    return g;
  }, [filteredLeads]);

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeLeadId) ?? null,
    [leads, activeLeadId],
  );

  const counts = {
    overdue: queue.overdue.length,
    today: queue.today.length,
    hot: queue.hot.length,
    upcoming: queue.upcoming.length,
    total: filteredLeads.filter((l) => !isTerminal(l.lead_stage)).length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales CMS</h1>
          <p className="text-sm text-muted-foreground">
            Auto-prioritised call queue with MNC-style follow-up cadence. Know exactly who to call next and what to say.
          </p>
        </div>
        <LeadDialog profiles={profiles} onSaved={refresh}>
          <Button><Plus className="w-4 h-4 mr-1" /> Add Customer</Button>
        </LeadDialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={AlertTriangle} label="Overdue" value={counts.overdue} tone="text-red-600" />
        <KpiCard icon={CalendarClock} label="Due Today" value={counts.today} tone="text-blue-600" />
        <KpiCard icon={Flame} label="Hot Untouched" value={counts.hot} tone="text-orange-600" />
        <KpiCard icon={Clock} label="Upcoming" value={counts.upcoming} tone="text-slate-700" />
        <KpiCard icon={User} label="Active Customers" value={counts.total} tone="text-emerald-700" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search customer by name, phone, city, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="queue"><PhoneCall className="w-4 h-4 mr-1" /> Call Queue</TabsTrigger>
          <TabsTrigger value="customers"><User className="w-4 h-4 mr-1" /> Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
              {/* Left: buckets */}
              <div className="space-y-6">
                {(["overdue", "today", "hot", "upcoming"] as QueueBucket[]).map((b) => (
                  <BucketList
                    key={b}
                    bucket={b}
                    leads={queue[b]}
                    activeId={activeLeadId}
                    onPick={setActiveLeadId}
                  />
                ))}
              </div>

              {/* Right: active call panel */}
              <div className="lg:sticky lg:top-4 self-start">
                {activeLead ? (
                  <CallPanel
                    lead={activeLead}
                    onLogged={() => { refresh(); }}
                    profiles={profiles}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-10 text-center text-sm text-muted-foreground">
                      Pick a customer from the queue on the left to start calling.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <CustomerTable leads={filteredLeads} profiles={profiles} onSaved={refresh} onOpenCall={(id) => { setActiveLeadId(id); setTab("queue"); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============== Bucket list ============== */

function BucketList({
  bucket, leads, activeId, onPick,
}: {
  bucket: QueueBucket;
  leads: Lead[];
  activeId: string | null;
  onPick: (id: string) => void;
}) {
  const meta = BUCKET_META[bucket];
  const Icon = meta.icon;
  if (!leads.length) {
    return (
      <div>
        <div className={cn("flex items-center gap-2 text-sm font-semibold mb-2", meta.tone)}>
          <Icon className="w-4 h-4" /> {meta.label} <span className="text-muted-foreground font-normal">· 0</span>
        </div>
        <Card><CardContent className="p-4 text-xs text-muted-foreground">Nothing here. Nice.</CardContent></Card>
      </div>
    );
  }
  return (
    <div>
      <div className={cn("flex items-center gap-2 text-sm font-semibold mb-2", meta.tone)}>
        <Icon className="w-4 h-4" /> {meta.label} <span className="text-muted-foreground font-normal">· {leads.length}</span>
      </div>
      <div className="space-y-2">
        {leads.map((l) => (
          <button
            key={l.id}
            onClick={() => onPick(l.id)}
            className={cn(
              "w-full text-left border rounded-xl p-3 bg-card hover:bg-muted/40 transition",
              activeId === l.id && `ring-2 ${meta.ring}`,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{l.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {l.phone ?? "no phone"} · {l.city ?? "—"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {l.lead_classification && (
                  <Badge variant="outline" className={classificationVariant(l.lead_classification)}>
                    {l.lead_classification}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px]">{l.lead_stage}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Follow-up: {l.followup_date ?? "—"}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============== Call Panel ============== */

function CallPanel({
  lead, onLogged, profiles,
}: {
  lead: Lead;
  onLogged: () => void;
  profiles: { id: string; full_name: string }[];
}) {
  const { user } = useAuth();
  const [outcome, setOutcome] = useState<Outcome>("not_answered");
  const [remarks, setRemarks] = useState("");
  const [customDate, setCustomDate] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const script = scriptFor(lead.lead_stage);

  // count previous "not answered" attempts to escalate cadence
  const { data: activities = [] } = useQuery({
    queryKey: ["lead_activities", lead.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lead_activities").select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const notAnsweredCount = activities.filter(
    (a) => a.action === "Call Logged" && a.details?.outcome === "not_answered",
  ).length;

  const preview = useMemo(() => {
    const rule = cadence(outcome, notAnsweredCount);
    const nextDate =
      customDate ||
      (outcome === "meeting_scheduled"
        ? todayISO()
        : rule.addDays == null
        ? null
        : addDaysISO(rule.addDays));
    return { rule, nextDate };
  }, [outcome, notAnsweredCount, customDate]);

  async function logCall() {
    setSaving(true);
    const rule = preview.rule;
    const nextDate = preview.nextDate;

    const patch: any = {};
    if (nextDate !== undefined) patch.followup_date = nextDate;
    if (rule.nextStage) patch.lead_stage = rule.nextStage;
    if (rule.nextAction) patch.next_action = rule.nextAction;
    if (rule.newClassification) patch.lead_classification = rule.newClassification;
    if (remarks.trim()) {
      const stamp = `[${new Date().toLocaleString()}] ${OUTCOME_LABEL[outcome]}: ${remarks.trim()}`;
      patch.remarks = lead.remarks ? `${stamp}\n---\n${lead.remarks}` : stamp;
    }

    const { error: updErr } = await (supabase as any)
      .from("leads").update(patch).eq("id", lead.id);
    if (updErr) { setSaving(false); return toast.error(updErr.message); }

    const { error: actErr } = await (supabase as any).from("lead_activities").insert({
      lead_id: lead.id,
      actor_id: user?.id ?? null,
      action: "Call Logged",
      details: {
        outcome,
        remarks: remarks.trim() || null,
        next_followup: nextDate,
        stage_after: rule.nextStage ?? lead.lead_stage,
      },
    });
    if (actErr) { setSaving(false); return toast.error(actErr.message); }

    setSaving(false);
    setRemarks("");
    setCustomDate("");
    setOutcome("not_answered");
    toast.success(
      nextDate
        ? `Call logged. Next follow-up scheduled for ${nextDate}.`
        : "Call logged. Lead marked as closed.",
    );
    onLogged();
  }

  const phoneHref = lead.phone ? `tel:${lead.phone.replace(/\s+/g, "")}` : undefined;
  const waHref = lead.phone
    ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`
    : undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg truncate">{lead.name}</CardTitle>
            <div className="text-xs text-muted-foreground truncate">
              {lead.phone ?? "no phone"} · {lead.city ?? "—"}{lead.state ? `, ${lead.state}` : ""}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {lead.lead_classification && (
              <Badge variant="outline" className={classificationVariant(lead.lead_classification)}>
                {lead.lead_classification}
              </Badge>
            )}
            <Badge variant="outline">{lead.lead_stage}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {phoneHref && (
            <a href={phoneHref}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Phone className="w-4 h-4 mr-1" /> Call now
              </Button>
            </a>
          )}
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
              </Button>
            </a>
          )}
          <LeadDialog lead={lead} profiles={profiles} onSaved={onLogged}>
            <Button size="sm" variant="ghost">Edit full profile</Button>
          </LeadDialog>
        </div>

        {/* Script */}
        <div className="rounded-lg border bg-blue-50/50 border-blue-200 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-1">
            <Sparkles className="w-4 h-4" /> What to talk about
          </div>
          <p className="text-sm text-blue-900/90">{script.pitch}</p>
          <ul className="mt-2 space-y-1">
            {script.ask.map((q, i) => (
              <li key={i} className="text-sm text-blue-900/90 flex gap-2">
                <span className="text-blue-700">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Previous remarks */}
        {lead.remarks && (
          <div>
            <Label>Previous notes</Label>
            <div className="mt-1 rounded-md border bg-muted/30 p-3 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
              {lead.remarks}
            </div>
          </div>
        )}

        {/* Log call */}
        <div className="rounded-lg border p-3 space-y-3">
          <div className="text-sm font-semibold flex items-center gap-2">
            <PhoneCall className="w-4 h-4" /> Log this call
          </div>
          <div>
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as Outcome)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(OUTCOME_LABEL) as Outcome[]).map((k) => (
                  <SelectItem key={k} value={k}>{OUTCOME_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Remarks</Label>
            <Textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="What did they say? Objections, budget, timeline…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Override next follow-up (optional)</Label>
              <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
            </div>
            <div className="text-xs text-muted-foreground flex items-end">
              <div className="rounded-md bg-muted/40 border p-2 w-full">
                <div className="font-medium text-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Auto-cadence
                </div>
                <div>
                  {preview.nextDate
                    ? `Next call: ${preview.nextDate}`
                    : "Lead will be marked closed"}
                  {preview.rule.nextStage && ` · Stage → ${preview.rule.nextStage}`}
                  {outcome === "not_answered" && notAnsweredCount > 0 && (
                    <div className="mt-0.5">Attempt #{notAnsweredCount + 1} — spacing out.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={logCall} disabled={saving}>
            {saving ? "Saving…" : "Log call & schedule next follow-up"}
          </Button>
        </div>

        {/* History */}
        {activities.length > 0 && (
          <div>
            <Label>Call history</Label>
            <div className="mt-1 space-y-1.5 max-h-56 overflow-y-auto">
              {activities.slice(0, 12).map((a) => (
                <div key={a.id} className="text-xs border rounded-md p-2 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.action}</span>
                    <span className="text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  {a.details?.outcome && (
                    <div className="text-muted-foreground mt-0.5">
                      {OUTCOME_LABEL[a.details.outcome as Outcome] ?? a.details.outcome}
                      {a.details.next_followup && ` · next: ${a.details.next_followup}`}
                    </div>
                  )}
                  {a.details?.remarks && (
                    <div className="mt-1 whitespace-pre-wrap">{a.details.remarks}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============== Customer Table ============== */

function CustomerTable({
  leads, profiles, onSaved, onOpenCall,
}: {
  leads: Lead[];
  profiles: { id: string; full_name: string }[];
  onSaved: () => void;
  onOpenCall: (id: string) => void;
}) {
  if (!leads.length) {
    return <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No customers yet.</CardContent></Card>;
  }
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Phone</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">City</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Class</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Stage</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Next Follow-up</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3">{l.phone ?? "—"}</td>
                <td className="px-4 py-3">{l.city ?? "—"}</td>
                <td className="px-4 py-3">
                  {l.lead_classification ? (
                    <Badge variant="outline" className={classificationVariant(l.lead_classification)}>
                      {l.lead_classification}
                    </Badge>
                  ) : "—"}
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{l.lead_stage}</Badge></td>
                <td className="px-4 py-3">{l.followup_date ?? "—"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => onOpenCall(l.id)}>
                    <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call
                  </Button>
                  <LeadDialog lead={l} profiles={profiles} onSaved={onSaved}>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </LeadDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

/* ============== KPI card ============== */

function KpiCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="w-3.5 h-3.5" /> {label}
        </div>
        <div className={cn("text-2xl font-semibold mt-1 tabular-nums", tone)}>{value}</div>
      </CardContent>
    </Card>
  );
}
