import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Phone, MessageCircle, ExternalLink, Pencil,
  LayoutDashboard, Users, CalendarClock, Video,
  PackageCheck, BookOpen, HelpCircle, Headphones, BarChart3, Search, Star, ClipboardList, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LeadDialog, classificationVariant, type Lead,
} from "./leads";

export const Route = createFileRoute("/_authenticated/my-sales")({
  head: () => ({ meta: [{ title: "Franchise Sales Operating Dashboard — Clean Craft OS" }] }),
  component: SalesOpsDashboard,
});

const PIPELINE_STAGES = [
  "New Lead", "Contacted", "Qualified", "Proposal Sent", "Follow-up",
  "Meeting Done", "Engagement Letter Pending", "Booking Received", "Handover Completed",
];

const CLASSIFICATIONS = ["Hot", "Warm", "Cold", "Dangerous", "Time Waster"] as const;
type Classification = (typeof CLASSIFICATIONS)[number];

type ViewKey =
  | "dashboard" | "roles" | "leads" | "followups" | "meetings" | "bookings"
  | "knowledge" | "questions" | "audio" | "reports";

const MENU: { key: ViewKey; label: string; icon: any; star?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "roles", label: "Roles & Responsibilities", icon: ClipboardList },
  { key: "leads", label: "Leads", icon: Users, star: true },
  { key: "followups", label: "Follow-ups", icon: CalendarClock, star: true },
  { key: "meetings", label: "Meetings", icon: Video },
  { key: "bookings", label: "Bookings", icon: PackageCheck },
  { key: "knowledge", label: "Knowledge Center", icon: BookOpen, star: true },
  { key: "questions", label: "Question Bank", icon: HelpCircle, star: true },
  { key: "audio", label: "Audio Library", icon: Headphones, star: true },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

function todayISO() { return new Date().toISOString().slice(0, 10); }
function startOfMonthISO() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); }
function addDaysISO(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function isTerminal(stage: string) { return stage === "Lost" || stage === "Handover Completed" || stage === "Handover Done"; }
function isHandoverDone(stage: string) { return stage === "Handover Completed" || stage === "Handover Done"; }

function SalesOpsDashboard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");

  const { data: leads = [], isLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ["my-leads", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads").select("*").eq("assigned_to", user!.id)
        .order("followup_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("profiles").select("id, full_name").order("full_name");
      if (error) throw error;
      return data as { id: string; full_name: string }[];
    },
  });

  function refresh() { qc.invalidateQueries({ queryKey: ["my-leads"] }); }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clean Craft OS</h1>
        <p className="text-sm text-muted-foreground">Salesperson dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Submenu — styled like the reference image */}
        <aside className="md:sticky md:top-4 self-start">
          <Card className="shadow-sm border rounded-2xl">
            <CardContent className="p-3">
              <nav className="flex md:flex-col gap-1.5 overflow-x-auto">
                {MENU.map((m) => {
                  const Icon = m.icon;
                  const active = view === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setView(m.key)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all text-left whitespace-nowrap",
                        active
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-slate-500")} />
                      <span className="flex-1">{m.label}</span>
                      {m.star && <Star className={cn("w-3.5 h-3.5", active ? "text-white fill-white" : "text-amber-500 fill-amber-500")} />}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Right side content */}
        <div className="min-w-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <ViewRouter view={view} leads={leads} profiles={profiles} onSaved={refresh} />
          )}
        </div>
      </div>
    </div>
  );
}

function ViewRouter({ view, leads, profiles, onSaved }: {
  view: ViewKey; leads: Lead[]; profiles: { id: string; full_name: string }[]; onSaved: () => void;
}) {
  switch (view) {
    case "dashboard": return <DashboardView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "roles": return <RolesView />;
    case "leads": return <LeadsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "followups": return <FollowupsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "meetings": return <MeetingsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "bookings": return <BookingsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "knowledge": return <KnowledgeCenterView />;
    case "questions": return <QuestionBankView />;
    case "audio": return <AudioLibraryView />;
    case "reports": return <ReportsView leads={leads} />;
  }
}

/* ============== Views ============== */

function DashboardView({ leads, profiles, onSaved }: ViewProps) {
  const today = todayISO();
  const monthStart = startOfMonthISO();
  const in7 = addDaysISO(7);

  const m = useMemo(() => {
    const newToday = leads.filter((l) => l.created_at.slice(0, 10) === today).length;
    const dueToday = leads.filter((l) => l.followup_date === today).length;
    const overdue = leads.filter((l) => l.followup_date && l.followup_date < today && !isTerminal(l.lead_stage)).length;
    const meetingsToday = leads.filter((l) => l.meeting_date === today).length;
    const hotAction = leads.filter((l) => l.lead_classification === "Hot" && !isTerminal(l.lead_stage)).length;
    const elFeePending = leads.filter((l) => l.engagement_letter_fee_status === "Pending" || l.engagement_letter_fee_status === "Partially Received").length;
    const bookingsMonth = leads.filter((l) => (l.booking_date && l.booking_date >= monthStart) || (l.lead_stage === "Booking Received" && l.created_at.slice(0, 10) >= monthStart)).length;

    const qualified = leads.filter((l) => ["Qualified", "Proposal Sent", "Follow-up", "Meeting Done", "Engagement Letter Pending", "Booking Received", "Handover Completed", "Handover Done"].includes(l.lead_stage)).length;
    const proposalSent = leads.filter((l) => !!l.proposal_sent_date).length;
    const meetingsDone = leads.filter((l) => l.lead_stage === "Meeting Done" || ["Engagement Letter Pending", "Booking Received", "Handover Completed", "Handover Done"].includes(l.lead_stage)).length;
    const feesCollected = leads.filter((l) => l.engagement_letter_fee_status === "Received");
    const bookingsReceived = leads.filter((l) => !!l.booking_date || l.lead_stage === "Booking Received" || isHandoverDone(l.lead_stage)).length;
    const handoverCount = leads.filter((l) => isHandoverDone(l.lead_stage)).length;
    const conversion = leads.length ? Math.round((handoverCount / leads.length) * 100) : 0;
    const sumAmt = (arr: Lead[]) => arr.reduce((s, l) => s + (Number(l.engagement_letter_fee_amount) || 0), 0);

    return {
      newToday, dueToday, overdue, meetingsToday, hotAction, elFeePending, bookingsMonth,
      kpi: { total: leads.length, qualified, proposalSent, meetingsDone,
        feesCollected: { count: feesCollected.length, value: sumAmt(feesCollected) },
        bookingsReceived, conversion, overdue },
    };
  }, [leads, today, monthStart]);

  const myFollowups = useMemo(
    () => leads.filter((l) => l.followup_date && l.followup_date <= in7 && !isTerminal(l.lead_stage))
      .sort((a, b) => (a.followup_date ?? "9999").localeCompare(b.followup_date ?? "9999")).slice(0, 10),
    [leads, in7],
  );
  const myMeetings = useMemo(
    () => leads.filter((l) => l.meeting_date && l.meeting_date >= today)
      .sort((a, b) => (a.meeting_date ?? "9999").localeCompare(b.meeting_date ?? "9999")).slice(0, 10),
    [leads, today],
  );

  return (
    <div className="space-y-8">
      <Section title="Today's Action Center">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <Stat label="New Leads Today" value={m.newToday} />
          <Stat label="Follow-ups Due Today" value={m.dueToday} tone="text-blue-600" />
          <Stat label="Overdue Follow-ups" value={m.overdue} tone="text-red-600" />
          <Stat label="Meetings Today" value={m.meetingsToday} />
          <Stat label="Hot Leads Action" value={m.hotAction} tone="text-emerald-600" />
          <Stat label="EL Fee Pending" value={m.elFeePending} tone="text-orange-600" />
          <Stat label="Bookings This Month" value={m.bookingsMonth} tone="text-emerald-700" />
        </div>
      </Section>

      <Section title="My KPIs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Stat label="Total Leads" value={m.kpi.total} />
          <Stat label="Qualified Leads" value={m.kpi.qualified} />
          <Stat label="Proposal Sent" value={m.kpi.proposalSent} />
          <Stat label="Meetings Done" value={m.kpi.meetingsDone} />
          <Stat label="Engagement Fees Collected" value={m.kpi.feesCollected.count} sub={`₹${m.kpi.feesCollected.value.toLocaleString("en-IN")}`} tone="text-emerald-700" />
          <Stat label="Bookings Received" value={m.kpi.bookingsReceived} tone="text-emerald-600" />
          <Stat label="Conversion %" value={m.kpi.conversion} sub="Handover / Total" />
          <Stat label="Overdue Follow-ups" value={m.kpi.overdue} tone="text-red-600" />
        </div>
      </Section>

      <Section title="My Follow-ups (Next 7 Days)">
        <LeadTable leads={myFollowups} profiles={profiles} onSaved={onSaved} />
      </Section>

      <Section title="My Meetings (Upcoming)">
        <LeadTable leads={myMeetings} profiles={profiles} onSaved={onSaved} columns={["name","phone","meeting","stage","actions"]} />
      </Section>
    </div>
  );
}

function LeadsView(_props: ViewProps) {
  return <LeadTrackerSheet />;
}

/* ============== Excel-like Lead Tracker Sheet ============== */

type Temp = "Hot" | "Warm" | "Cold" | "Time Waster" | "Dangerous";
const TEMPS: Temp[] = ["Hot", "Warm", "Cold", "Time Waster", "Dangerous"];
const TEMP_COLORS: Record<Temp, string> = {
  Hot: "bg-red-100 text-red-700 border-red-200",
  Warm: "bg-orange-100 text-orange-700 border-orange-200",
  Cold: "bg-blue-100 text-blue-700 border-blue-200",
  "Time Waster": "bg-slate-100 text-slate-600 border-slate-200",
  Dangerous: "bg-purple-100 text-purple-700 border-purple-200",
};

type FinalMeetKind = "" | "Google Meet" | "Store Visit";

type SheetRow = {
  id: string;
  name: string;
  phone: string;
  temp: Temp | "";
  proposalSent: boolean;
  explCompleted: boolean;
  finalMeetKind: FinalMeetKind;
  finalMeetStore: string;
  eaSent: boolean;
  bookingReceived: boolean;
  followupAt: string;
  handedOver: boolean;
};

function emptyRow(): SheetRow {
  return {
    id: crypto.randomUUID(),
    name: "", phone: "", temp: "",
    proposalSent: false, explCompleted: false,
    finalMeetKind: "", finalMeetStore: "",
    eaSent: false, bookingReceived: false,
    followupAt: "", handedOver: false,
  };
}

const STORAGE_KEY = "ccos.lead-tracker.v1";

function loadRows(): SheetRow[] {
  if (typeof window === "undefined") return [emptyRow()];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [emptyRow()];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length ? arr : [emptyRow()];
  } catch { return [emptyRow()]; }
}

function isStarted(r: SheetRow) {
  return !!(r.temp || r.proposalSent || r.explCompleted || r.finalMeetKind || r.eaSent || r.bookingReceived || r.followupAt);
}

function completionSteps(r: SheetRow) {
  return [
    { label: "Lead Temp.", done: !!r.temp },
    { label: "Proposal Sent", done: r.proposalSent },
    { label: "Expl. Completed", done: r.explCompleted },
    { label: "Final Meet", done: !!r.finalMeetKind && (r.finalMeetKind === "Google Meet" || !!r.finalMeetStore) },
    { label: "EA Sent via Email", done: r.eaSent },
    { label: "Booking Amount Received", done: r.bookingReceived },
    { label: "Follow-up Scheduled", done: !!r.followupAt },
  ];
}

function LeadTrackerSheet() {
  const [rows, setRows] = useState<SheetRow[]>(() => loadRows());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showHandoverForm, setShowHandoverForm] = useState(false);

  useMemo(() => {
    if (typeof window === "undefined") return;
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  function persist(next: SheetRow[]) {
    setRows(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  function update(id: string, patch: Partial<SheetRow>) {
    persist(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() { persist([...rows, emptyRow()]); setSelectedId(null); }
  function removeRow(id: string) {
    const next = rows.filter((r) => r.id !== id);
    persist(next.length ? next : [emptyRow()]);
    if (selectedId === id) setSelectedId(null);
  }
  function openHandover() {
    if (!selectedId) return;
    setShowHandoverForm(true);
  }
  function completeHandover(id: string, payload: HandoverPayload) {
    update(id, { handedOver: true });
    try {
      const key = "ccos.handovers.v1";
      const prev = JSON.parse(window.localStorage.getItem(key) || "[]");
      prev.push({ ...payload, leadId: id, submittedAt: new Date().toISOString() });
      window.localStorage.setItem(key, JSON.stringify(prev));
    } catch {}
    setShowHandoverForm(false);
    alert("Submitted to Account Department.");
  }

  const selected = rows.find((r) => r.id === selectedId) || null;

  return (
    <div className="space-y-4">
      {selected && <CompletionBar row={selected} />}

      <Section title="Lead Tracker">
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-muted/60 text-left">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium [&>th]:text-muted-foreground [&>th]:border-b [&>th]:border-r [&>th]:whitespace-nowrap">
                  <th className="w-10 text-center">#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Lead Temp.</th>
                  <th className="text-center">Proposal Sent</th>
                  <th className="text-center">Expl. Completed</th>
                  <th>Final Meet</th>
                  <th className="text-center">EA Sent (Email)</th>
                  <th className="text-center">Booking Amt. Received</th>
                  <th>Follow-up Date &amp; Time</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const frozen = isStarted(r);
                  const fuMs = r.followupAt ? new Date(r.followupAt).getTime() : 0;
                  const fuDue = fuMs > 0 && fuMs <= now;
                  const isSel = r.id === selectedId;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={cn(
                        "[&>td]:px-3 [&>td]:py-2 [&>td]:border-b [&>td]:border-r [&>td]:align-middle cursor-pointer",
                        isSel ? "bg-blue-50/60" : "hover:bg-muted/30",
                        r.handedOver && "opacity-60",
                      )}
                    >
                      <td className="text-center text-muted-foreground">{i + 1}</td>
                      <td>
                        <input
                          value={r.name}
                          readOnly={frozen}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => update(r.id, { name: e.target.value })}
                          placeholder="Name"
                          className={cn("w-40 bg-transparent outline-none px-1 py-1 rounded",
                            frozen ? "cursor-not-allowed" : "focus:bg-white focus:ring-1 focus:ring-blue-300")}
                        />
                      </td>
                      <td>
                        <input
                          value={r.phone}
                          readOnly={frozen}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => update(r.id, { phone: e.target.value })}
                          placeholder="Phone"
                          inputMode="tel"
                          className={cn("w-36 bg-transparent outline-none px-1 py-1 rounded",
                            frozen ? "cursor-not-allowed" : "focus:bg-white focus:ring-1 focus:ring-blue-300")}
                        />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          value={r.temp}
                          onChange={(e) => update(r.id, { temp: e.target.value as Temp | "" })}
                          disabled={!r.name || !r.phone}
                          className={cn("rounded border px-2 py-1 text-xs",
                            r.temp ? TEMP_COLORS[r.temp as Temp] : "bg-white")}
                        >
                          <option value="">—</option>
                          {TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={r.proposalSent}
                          onChange={(e) => update(r.id, { proposalSent: e.target.checked })} />
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={r.explCompleted}
                          onChange={(e) => update(r.id, { explCompleted: e.target.checked })} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <select
                            value={r.finalMeetKind}
                            onChange={(e) => update(r.id, { finalMeetKind: e.target.value as FinalMeetKind, finalMeetStore: e.target.value === "Store Visit" ? r.finalMeetStore : "" })}
                            className="rounded border px-2 py-1 text-xs bg-white"
                          >
                            <option value="">—</option>
                            <option value="Google Meet">Google Meet</option>
                            <option value="Store Visit">Store Visit</option>
                          </select>
                          {r.finalMeetKind === "Store Visit" && (
                            <input
                              value={r.finalMeetStore}
                              onChange={(e) => update(r.id, { finalMeetStore: e.target.value })}
                              placeholder="Store name"
                              className="w-32 rounded border px-2 py-1 text-xs bg-white"
                            />
                          )}
                        </div>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={r.eaSent}
                          onChange={(e) => update(r.id, { eaSent: e.target.checked })} />
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={r.bookingReceived}
                          onChange={(e) => update(r.id, { bookingReceived: e.target.checked })} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="datetime-local"
                          value={r.followupAt}
                          onChange={(e) => update(r.id, { followupAt: e.target.value })}
                          className={cn("rounded border px-2 py-1 text-xs",
                            fuDue ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-medium" : "bg-white")}
                        />
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600"
                          onClick={() => removeRow(r.id)}>Del</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3 mt-3">
          <Button onClick={addRow} variant="outline" size="sm">+ Add New Lead</Button>
          <Button
            onClick={() => selected && handover(selected.id)}
            disabled={!selected || selected.handedOver || !selected.bookingReceived}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {selected?.handedOver ? "Handed Over ✓" : "Hand Over to Account Dept."}
          </Button>
        </div>
        {!selected && (
          <p className="text-xs text-muted-foreground mt-2">
            Click any row to see its completion status and enable the Hand Over button.
          </p>
        )}
      </Section>
    </div>
  );
}

function CompletionBar({ row }: { row: SheetRow }) {
  const steps = completionSteps(row);
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">
            {row.name || "Unnamed lead"} — Completion: <span className="text-emerald-700">{done}/7</span>
          </div>
          <div className="text-xs text-muted-foreground">{pct}%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-3">
          {steps.map((s, i) => (
            <div key={i} className={cn(
              "text-[11px] px-2 py-1 rounded border text-center",
              s.done ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted/40 border-muted text-muted-foreground",
            )}>
              {i + 1}. {s.label} {s.done ? "✓" : ""}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FollowupsView({ leads, profiles, onSaved }: ViewProps) {
  const today = todayISO();
  const in14 = addDaysISO(14);
  const due = leads.filter((l) => l.followup_date === today);
  const overdue = leads.filter((l) => l.followup_date && l.followup_date < today && !isTerminal(l.lead_stage));
  const upcoming = leads.filter((l) => l.followup_date && l.followup_date > today && l.followup_date <= in14);
  const completed = leads.filter((l) => isTerminal(l.lead_stage) && l.followup_date && l.followup_date <= today);

  return (
    <Section title="Follow-ups">
      <Tabs defaultValue="due">
        <TabsList>
          <TabsTrigger value="due">Due Today ({due.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="due" className="mt-3"><LeadTable leads={due} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="overdue" className="mt-3"><LeadTable leads={overdue} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="upcoming" className="mt-3"><LeadTable leads={upcoming} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="completed" className="mt-3"><LeadTable leads={completed} profiles={profiles} onSaved={onSaved} /></TabsContent>
      </Tabs>
    </Section>
  );
}

function MeetingsView({ leads, profiles, onSaved }: ViewProps) {
  const today = todayISO();
  const scheduled = leads.filter((l) => l.meeting_date && l.meeting_date >= today);
  const completed = leads.filter((l) => l.lead_stage === "Meeting Done" || ["Engagement Letter Pending", "Booking Received", "Handover Completed", "Handover Done"].includes(l.lead_stage));
  const missed = leads.filter((l) => l.meeting_date && l.meeting_date < today && l.lead_stage !== "Meeting Done" && !isTerminal(l.lead_stage));

  return (
    <Section title="Meetings">
      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="missed">Missed ({missed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="scheduled" className="mt-3"><LeadTable leads={scheduled} profiles={profiles} onSaved={onSaved} columns={["name","phone","meeting","meet_link","stage","actions"]} /></TabsContent>
        <TabsContent value="completed" className="mt-3"><LeadTable leads={completed} profiles={profiles} onSaved={onSaved} columns={["name","phone","meeting","stage","actions"]} /></TabsContent>
        <TabsContent value="missed" className="mt-3"><LeadTable leads={missed} profiles={profiles} onSaved={onSaved} columns={["name","phone","meeting","stage","actions"]} /></TabsContent>
      </Tabs>
    </Section>
  );
}

function ProposalsView({ leads, profiles, onSaved }: ViewProps) {
  const notSent = leads.filter((l) => !l.proposal_sent_date && ["Qualified", "Contacted", "New Lead", "Follow-up"].includes(l.lead_stage));
  const sent = leads.filter((l) => !!l.proposal_sent_date);
  const viewed = leads.filter((l) => !!l.proposal_sent_date && l.lead_stage === "Follow-up");
  const pending = leads.filter((l) => !!l.proposal_sent_date && !isTerminal(l.lead_stage) && !["Engagement Letter Pending","Booking Received","Handover Completed","Handover Done"].includes(l.lead_stage));

  return (
    <Section title="Proposals">
      <Tabs defaultValue="not_sent">
        <TabsList>
          <TabsTrigger value="not_sent">Not Sent ({notSent.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
          <TabsTrigger value="viewed">Viewed ({viewed.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Decision ({pending.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="not_sent" className="mt-3"><LeadTable leads={notSent} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="sent" className="mt-3"><LeadTable leads={sent} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="viewed" className="mt-3"><LeadTable leads={viewed} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="pending" className="mt-3"><LeadTable leads={pending} profiles={profiles} onSaved={onSaved} /></TabsContent>
      </Tabs>
    </Section>
  );
}

function EngagementView({ leads, profiles, onSaved }: ViewProps) {
  const pending = leads.filter((l) => l.lead_stage === "Engagement Letter Pending" && !l.engagement_letter_sent_date);
  const sent = leads.filter((l) => !!l.engagement_letter_sent_date);
  const feePending = leads.filter((l) => l.engagement_letter_fee_status === "Pending" || l.engagement_letter_fee_status === "Partially Received");
  const feeReceived = leads.filter((l) => l.engagement_letter_fee_status === "Received");

  return (
    <Section title="Engagement Letters">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
          <TabsTrigger value="fee_pending">Fee Pending ({feePending.length})</TabsTrigger>
          <TabsTrigger value="fee_received">Fee Received ({feeReceived.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-3"><LeadTable leads={pending} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="sent" className="mt-3"><LeadTable leads={sent} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="fee_pending" className="mt-3"><LeadTable leads={feePending} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="fee_received" className="mt-3"><LeadTable leads={feeReceived} profiles={profiles} onSaved={onSaved} /></TabsContent>
      </Tabs>
    </Section>
  );
}

function BookingsView({ leads, profiles, onSaved }: ViewProps) {
  const monthStart = startOfMonthISO();
  const newBookings = leads.filter((l) => (l.booking_date && l.booking_date >= monthStart) || (l.lead_stage === "Booking Received"));
  const handoverPending = leads.filter((l) => l.lead_stage === "Booking Received" && !isHandoverDone(l.lead_stage));
  const handoverDone = leads.filter((l) => isHandoverDone(l.lead_stage));

  return (
    <Section title="Bookings">
      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Bookings ({newBookings.length})</TabsTrigger>
          <TabsTrigger value="handover_pending">Handover Pending ({handoverPending.length})</TabsTrigger>
          <TabsTrigger value="handover_done">Handover Complete ({handoverDone.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-3"><LeadTable leads={newBookings} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="handover_pending" className="mt-3"><LeadTable leads={handoverPending} profiles={profiles} onSaved={onSaved} /></TabsContent>
        <TabsContent value="handover_done" className="mt-3"><LeadTable leads={handoverDone} profiles={profiles} onSaved={onSaved} /></TabsContent>
      </Tabs>
    </Section>
  );
}

function LostView({ leads, profiles, onSaved }: ViewProps) {
  const lost = leads.filter((l) => l.lead_stage === "Lost");
  const totalValue = lost.reduce((s, l) => s + (Number(l.engagement_letter_fee_amount) || 0), 0);

  return (
    <div className="space-y-6">
      <Section title="Lost Leads Summary">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Total Lost" value={lost.length} tone="text-red-600" />
          <Stat label="Lost Value" value={`₹${totalValue.toLocaleString("en-IN")}`} tone="text-red-600" />
          <Stat label="Most Common Stage" value={mostCommon(lost.map((l) => l.lead_stage)) ?? "—"} />
        </div>
      </Section>
      <Section title="Lost Leads">
        <Card><CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr><Th>Name</Th><Th>City</Th><Th>Lost Reason</Th><Th>Lost Stage</Th><Th>Lost Value</Th><Th></Th></tr>
            </thead>
            <tbody>
              {lost.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">No lost leads.</td></tr>}
              {lost.map((l) => (
                <tr key={l.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3">{l.city ?? "—"}</td>
                  <td className="px-4 py-3">{(l as any).lost_reason ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{(l as any).lost_stage ?? l.lead_stage}</Badge></td>
                  <td className="px-4 py-3">₹{(Number(l.engagement_letter_fee_amount) || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/leads/$id" params={{ id: l.id }}>
                      <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                    </Link>
                    <LeadDialog lead={l} profiles={profiles} onSaved={onSaved}>
                      <Button size="sm" variant="ghost"><Pencil className="w-4 h-4" /></Button>
                    </LeadDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      </Section>
    </div>
  );
}

function HandoverView({ leads, profiles, onSaved }: ViewProps) {
  const handoverPending = leads.filter((l) => l.lead_stage === "Booking Received" && !isHandoverDone(l.lead_stage));
  const handoverDone = leads.filter((l) => isHandoverDone(l.lead_stage));
  const sumAmt = (arr: Lead[]) => arr.reduce((s, l) => s + (Number(l.engagement_letter_fee_amount) || 0), 0);

  return (
    <div className="space-y-6">
      <Section title="Hand Over to Account Department">
        <div className="grid grid-cols-2 gap-3">
          <BookingStat label="Pending Handover" count={handoverPending.length} value={sumAmt(handoverPending)} tone="text-orange-600" />
          <BookingStat label="Handover Complete" count={handoverDone.length} value={sumAmt(handoverDone)} tone="text-emerald-600" />
        </div>
      </Section>
      <Section title="Pending Handover">
        <LeadTable leads={handoverPending} profiles={profiles} onSaved={onSaved} />
      </Section>
      <Section title="Completed Handover">
        <LeadTable leads={handoverDone} profiles={profiles} onSaved={onSaved} />
      </Section>
    </div>
  );
}

/* ============== Shared types & components ============== */

type ViewProps = {
  leads: Lead[];
  profiles: { id: string; full_name: string }[];
  onSaved: () => void;
};

function mostCommon(arr: string[]): string | null {
  if (!arr.length) return null;
  const counts: Record<string, number> = {};
  arr.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function Section({ title, children, subtitle, right }: { title: string; children: React.ReactNode; subtitle?: string; right?: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, tone, sub }: { label: string; value: number | string; tone?: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-semibold mt-1 ${tone ?? ""}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function BookingStat({ label, count, value, tone }: { label: string; count: number; value: number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-semibold mt-1 ${tone ?? ""}`}>{count}</div>
        <div className="text-xs text-muted-foreground mt-0.5">₹{value.toLocaleString("en-IN")}</div>
      </CardContent>
    </Card>
  );
}

function FilterChip({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
        active ? "bg-primary text-primary-foreground border-primary" : `bg-card hover:bg-muted ${className ?? ""}`,
      )}
    >
      {children}
    </button>
  );
}

type Col = "name" | "phone" | "city" | "stage" | "next" | "followup" | "meeting" | "meet_link" | "actions";

function LeadTable({ leads, profiles, onSaved, columns }: {
  leads: Lead[]; profiles: { id: string; full_name: string }[]; onSaved: () => void; columns?: Col[];
}) {
  const cols: Col[] = columns ?? ["name", "phone", "city", "stage", "next", "followup", "actions"];
  const today = todayISO();
  if (leads.length === 0) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">Nothing here.</CardContent></Card>;
  }
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {cols.map((c) => <Th key={c}>{headerLabel(c)}</Th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const overdue = l.followup_date && l.followup_date < today && !isTerminal(l.lead_stage);
              const dueToday = l.followup_date === today;
              return (
                <tr key={l.id} className="border-t hover:bg-muted/30">
                  {cols.map((c) => {
                    switch (c) {
                      case "name": return (
                        <td key={c} className="px-4 py-3 font-medium">
                          {l.name}
                          {l.lead_classification && (
                            <Badge variant="outline" className={`ml-2 ${classificationVariant(l.lead_classification)}`}>{l.lead_classification}</Badge>
                          )}
                        </td>
                      );
                      case "phone": return <td key={c} className="px-4 py-3">{l.phone ?? "—"}</td>;
                      case "city": return <td key={c} className="px-4 py-3">{l.city ?? "—"}</td>;
                      case "stage": return <td key={c} className="px-4 py-3"><Badge variant="outline">{l.lead_stage}</Badge></td>;
                      case "next": return <td key={c} className="px-4 py-3">{l.next_action ?? "—"}</td>;
                      case "followup": return (
                        <td key={c} className="px-4 py-3">
                          {l.followup_date ? (
                            <span className={overdue ? "text-red-600 font-medium" : dueToday ? "text-blue-600 font-medium" : ""}>
                              {l.followup_date}
                            </span>
                          ) : "—"}
                        </td>
                      );
                      case "meeting": return <td key={c} className="px-4 py-3">{l.meeting_date ?? "—"}</td>;
                      case "meet_link": return (
                        <td key={c} className="px-4 py-3">
                          {(l as any).meeting_link ? (
                            <a href={(l as any).meeting_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                              <Video className="w-3.5 h-3.5" /> Join
                            </a>
                          ) : "—"}
                        </td>
                      );
                      case "actions": return (
                        <td key={c} className="px-4 py-3 text-right whitespace-nowrap">
                          {l.phone && (
                            <a href={`tel:${l.phone}`}><Button size="sm" variant="ghost"><Phone className="w-4 h-4" /></Button></a>
                          )}
                          {l.phone && (
                            <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="ghost" className="text-emerald-700"><MessageCircle className="w-4 h-4" /></Button>
                            </a>
                          )}
                          <Link to="/leads/$id" params={{ id: l.id }}>
                            <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                          </Link>
                          <LeadDialog lead={l} profiles={profiles} onSaved={onSaved}>
                            <Button size="sm" variant="ghost"><Pencil className="w-4 h-4" /></Button>
                          </LeadDialog>
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function headerLabel(c: Col): string {
  switch (c) {
    case "name": return "Name";
    case "phone": return "Mobile";
    case "city": return "City";
    case "stage": return "Stage";
    case "next": return "Next Action";
    case "followup": return "Follow-up";
    case "meeting": return "Meeting";
    case "meet_link": return "Meet Link";
    case "actions": return "";
  }
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2 font-medium text-muted-foreground">{children}</th>;
}

/* ============== New Sales Modules ============== */

const KNOWLEDGE_SECTIONS = [
  { title: "Sales Pitch", desc: "Master scripts and pitch templates for franchise sales." },
  { title: "Proposal", desc: "Standard proposal templates and customization guides." },
  { title: "FAQ", desc: "Frequently asked questions from prospects with verified answers." },
  { title: "Competitor Comparison", desc: "Side-by-side comparisons with key competitors." },
  { title: "Objection Handling", desc: "Proven responses to the most common objections." },
  { title: "Training Videos", desc: "On-demand video training from senior salespeople." },
  { title: "Laundry Industry Data", desc: "Market size, growth, and industry benchmarks." },
];

function KnowledgeCenterView() {
  return (
    <Section title="Knowledge Center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {KNOWLEDGE_SECTIONS.map((s) => (
          <Card key={s.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const SAMPLE_QA: { q: string; a: string }[] = [
  { q: "Royalty", a: "Royalty is 6% of monthly gross revenue, billed monthly in arrears." },
  { q: "Territory", a: "Exclusive territory of 3 km radius around the store location, protected for 5 years." },
  { q: "Manpower", a: "Typical store needs 4–6 staff: 1 manager, 2–3 operators, 1–2 delivery." },
  { q: "ROI", a: "Average payback period is 18–24 months at standard footfall assumptions." },
];

function QuestionBankView() {
  const [query, setQuery] = useState("");
  const [submitOpen, setSubmitOpen] = useState(false);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_QA;
    return SAMPLE_QA.filter((x) => x.q.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <Section title="Question Bank">
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search: "Royalty", "Territory", "Manpower", "ROI"…'
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-sm text-muted-foreground">No answer found for "{query}".</div>
                <Button onClick={() => setSubmitOpen(true)}>Submit Question to Sales Head</Button>
              </CardContent>
            </Card>
          ) : (
            matches.map((x) => (
              <Card key={x.q}>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold">{x.q}</div>
                  <div className="text-sm text-muted-foreground mt-1">{x.a}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {submitOpen && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-sm font-medium">Submit new question</div>
              <Input placeholder="Type your question…" />
              <div className="flex gap-2">
                <Button size="sm">Send to Sales Head</Button>
                <Button size="sm" variant="ghost" onClick={() => setSubmitOpen(false)}>Cancel</Button>
              </div>
              <div className="text-xs text-muted-foreground">Approved answers will appear in the bank.</div>
            </CardContent>
          </Card>
        )}
      </div>
    </Section>
  );
}

const AUDIO_CATEGORIES = [
  { title: "Best Qualification Calls", count: 0 },
  { title: "Best Closing Calls", count: 0 },
  { title: "Lost Calls", count: 0 },
  { title: "Competitor Comparison Calls", count: 0 },
  { title: "Training Calls", count: 0 },
];

function AudioLibraryView() {
  return (
    <Section title="Audio Library">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AUDIO_CATEGORIES.map((c) => (
          <Card key={c.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.count} recording{c.count === 1 ? "" : "s"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">New salespeople learn here. Upload best calls to share with the team.</p>
    </Section>
  );
}

function ReportsView({ leads }: { leads: Lead[] }) {
  const closures = leads.filter((l) => isHandoverDone(l.lead_stage)).length;
  const elCollected = leads.filter((l) => l.engagement_letter_fee_status === "Received");
  const elValue = elCollected.reduce((s, l) => s + (Number(l.engagement_letter_fee_amount) || 0), 0);
  const followups = leads.filter((l) => !!l.followup_date).length;
  const conversion = leads.length ? Math.round((closures / leads.length) * 100) : 0;

  return (
    <Section title="Personal Reports">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat label="Leads" value={leads.length} />
        <Stat label="Closures" value={closures} tone="text-emerald-700" />
        <Stat label="Follow-ups" value={followups} />
        <Stat label="Conversion %" value={conversion} sub="Handover / Total" />
        <Stat label="EL Collection" value={elCollected.length} sub={`₹${elValue.toLocaleString("en-IN")}`} tone="text-emerald-700" />
      </div>
    </Section>
  );
}

/* ============== Roles & Responsibilities ============== */

const ROLES_STORAGE_KEY = "ccos.sales-roles.v1";

type RolesContent = {
  title: string;
  sections: { heading: string; body: string }[];
};

const DEFAULT_ROLES: RolesContent = {
  title: "Role: Franchise Investment Consultant at Clean Craft",
  sections: [
    {
      heading: "Role Definition",
      body: "Responsible for converting qualified franchise enquiries into signed Clean Craft franchise partners.",
    },
    {
      heading: "Trigger Point",
      body: "Call within 10 mins after you get leads:\n1. Website\n2. Google Ads\n3. IVR\n4. Referral\n5. Organic enquiry",
    },
    {
      heading: "Responsibility Deliverable",
      body: "A. Lead Qualification\nB. Business Consultation\nC. Franchise Conversion\nD. Operations Handover",
    },
    {
      heading: "Tasks & Activities",
      body: "Lead Qualification\nProposal Process\nConversion Process\n1. Collect booking amount.\n2. Inform Accounts.\n3. Inform Project Coordinator.\n4. Clarity call after F.E.A — Handle after sales query if needed.",
    },
    {
      heading: "Hand-over Matrix",
      body: "A. After Booking Amt. Received\n• Create Franchise WhatsApp Group.\n• Fill Franchise Handover Form.\n• Mention the below in WhatsApp Group:\n   A. Send final payable at personal level\n   B. Discount\n   C. Machine model\n   D. Timeline\n   E. Special commitments if any\n• Hand over to Project Coordinator.",
    },
    {
      heading: "Completion Matrix",
      body: "1. Payment received proof sent to accounts.\n2. WhatsApp Group created.\n3. Hand-over form submitted.\n4. Accounts informed.\n5. Project coordinator informed.\n6. Sample franchise agreement and other docs. shared via mail for reading.\n7. Update CRM software.",
    },
    {
      heading: "KPI & KRA",
      body: "Daily KPI\n• Number of leads contacted\n• Number of follow-ups completed\n• Number of meetings scheduled\n\nWeekly KPI\n• Number of proposals sent\n• Number of Google Meets conducted\n\nMonthly KPI\n• Number of franchise closures\n• Number of booking amount collected\n• Conversion %\n• Proposal to conversion %\n\nKRA: 5 Franchise Closures Per Month",
    },
    {
      heading: "What Not To Do",
      body: "❌ Promise anything not approved.\n❌ Offer unauthorized discount.\n❌ Commit launch date without Operations approval.\n❌ Leave CRM incomplete.\n❌ Skip handover form.\n❌ Discuss competitors negatively.\n❌ Commit for more than 4 manpower and stay of Project Manager.\n\n# Follow Decision Authority Matrix before committing any exception.",
    },
    {
      heading: "Escalation Matrix",
      body: "• Discount request\n• Agreement change\n• Territory issue\n• Legal question\n• ROI guarantee request\n• Special support request\n\nThis prevents future disputes.",
    },
    {
      heading: "A Successful Closer",
      body: "A successful closer does NOT sell franchises. A successful closer:\n1. Identifies the right partner.\n2. Educates the investor.\n3. Builds trust.\n4. Removes confusion.\n5. Converts qualified investors.\n6. Hands over accurately.\n\nThis creates the right culture.",
    },
  ],
};

function loadRoles(): RolesContent {
  if (typeof window === "undefined") return DEFAULT_ROLES;
  try {
    const raw = window.localStorage.getItem(ROLES_STORAGE_KEY);
    if (!raw) return DEFAULT_ROLES;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.sections)) return parsed as RolesContent;
  } catch {}
  return DEFAULT_ROLES;
}

function RolesView() {
  const { isLeadership } = useAuth();
  const [content, setContent] = useState<RolesContent>(() => loadRoles());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RolesContent>(content);

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(content)));
    setEditing(true);
  }
  function cancel() { setEditing(false); }
  function save() {
    setContent(draft);
    try { window.localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(draft)); } catch {}
    setEditing(false);
    toast.success("Roles & Responsibilities updated");
  }
  function resetDefaults() {
    setDraft(JSON.parse(JSON.stringify(DEFAULT_ROLES)));
  }

  return (
    <Section
      title="Roles & Responsibilities"
      subtitle={isLeadership ? "Editable by CEO/Leadership" : "Read-only — contact CEO for changes"}
      right={
        isLeadership && (
          editing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={resetDefaults}>Reset</Button>
              <Button size="sm" variant="ghost" onClick={cancel}><X className="w-4 h-4 mr-1" />Cancel</Button>
              <Button size="sm" onClick={save}><Save className="w-4 h-4 mr-1" />Save</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={startEdit}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
          )
        )
      }
    >
      <Card className="border rounded-2xl">
        <CardContent className="p-6 space-y-5">
          {editing ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="mt-1 font-semibold"
                />
              </div>
              {draft.sections.map((s, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2 bg-slate-50/50">
                  <Input
                    value={s.heading}
                    onChange={(e) => {
                      const next = [...draft.sections];
                      next[i] = { ...next[i], heading: e.target.value };
                      setDraft({ ...draft, sections: next });
                    }}
                    className="font-semibold bg-white"
                  />
                  <Textarea
                    value={s.body}
                    onChange={(e) => {
                      const next = [...draft.sections];
                      next[i] = { ...next[i], body: e.target.value };
                      setDraft({ ...draft, sections: next });
                    }}
                    rows={Math.min(14, Math.max(4, s.body.split("\n").length + 1))}
                    className="bg-white font-mono text-sm"
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 border-b pb-3">{content.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-x-6 gap-y-5">
                {content.sections.map((s, i) => (
                  <div key={i} className="contents">
                    <div className="font-semibold text-slate-800 pt-1">{s.heading}</div>
                    <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed border-l-2 border-slate-200 pl-4">
                      {s.body}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}
