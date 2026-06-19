import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Phone, MessageCircle, ExternalLink, Pencil,
  LayoutDashboard, Users, CalendarClock, Video, FileText, FileSignature,
  PackageCheck, XCircle, Handshake } from "lucide-react";
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
  | "dashboard" | "leads" | "followups" | "meetings" | "proposals"
  | "engagement" | "bookings" | "lost" | "handover";

const MENU: { key: ViewKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "leads", label: "Leads", icon: Users },
  { key: "followups", label: "Follow-ups", icon: CalendarClock },
  { key: "meetings", label: "Meetings", icon: Video },
  { key: "proposals", label: "Proposals", icon: FileText },
  { key: "engagement", label: "Engagement Letters", icon: FileSignature },
  { key: "bookings", label: "Bookings", icon: PackageCheck },
  { key: "lost", label: "Lost Leads", icon: XCircle },
  { key: "handover", label: "Hand over", icon: Handshake },
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
        <h1 className="text-2xl font-semibold tracking-tight">Franchise Sales Operating Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your active sales board.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Submenu */}
        <aside className="md:sticky md:top-4 self-start">
          <Card>
            <CardContent className="p-2">
              <nav className="flex md:flex-col gap-1 overflow-x-auto">
                {MENU.map((m) => {
                  const Icon = m.icon;
                  const active = view === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setView(m.key)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left whitespace-nowrap",
                        active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground/80",
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {m.label}
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
    case "leads": return <LeadsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "followups": return <FollowupsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "meetings": return <MeetingsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "proposals": return <ProposalsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "engagement": return <EngagementView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "bookings": return <BookingsView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "lost": return <LostView leads={leads} profiles={profiles} onSaved={onSaved} />;
    case "handover": return <HandoverView leads={leads} profiles={profiles} onSaved={onSaved} />;
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

function LeadsView({ leads, profiles, onSaved }: ViewProps) {
  const [filter, setFilter] = useState<Classification | "All">("All");
  const stageCounts: Record<string, number> = {};
  PIPELINE_STAGES.forEach((s) => { stageCounts[s] = 0; });
  leads.forEach((l) => {
    const s = l.lead_stage === "Handover Done" ? "Handover Completed" : l.lead_stage;
    if (stageCounts[s] != null) stageCounts[s]++;
  });
  const filtered = filter === "All" ? leads : leads.filter((l) => l.lead_classification === filter);

  return (
    <div className="space-y-6">
      <Section title="Sales Pipeline">
        <Card><CardContent className="p-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-lg border bg-card min-w-[140px]">
                  <div className="text-[11px] uppercase tracking-wide opacity-80">{s}</div>
                  <div className="text-xl font-semibold">{stageCounts[s] ?? 0}</div>
                </div>
                {i < PIPELINE_STAGES.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </CardContent></Card>
      </Section>

      <Section title="All Leads">
        <div className="flex flex-wrap gap-2 mb-3">
          <FilterChip active={filter === "All"} onClick={() => setFilter("All")}>All ({leads.length})</FilterChip>
          {CLASSIFICATIONS.map((c) => {
            const n = leads.filter((l) => l.lead_classification === c).length;
            return (
              <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)} className={classificationVariant(c)}>
                {c} ({n})
              </FilterChip>
            );
          })}
        </div>
        <LeadTable leads={filtered} profiles={profiles} onSaved={onSaved} />
      </Section>
    </div>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</h2>
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
