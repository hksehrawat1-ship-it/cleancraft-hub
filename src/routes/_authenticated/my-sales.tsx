import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Phone, MessageCircle, ExternalLink, Pencil } from "lucide-react";
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

function todayISO() { return new Date().toISOString().slice(0, 10); }
function startOfMonthISO() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); }
function addDaysISO(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function isTerminal(stage: string) { return stage === "Lost" || stage === "Handover Completed" || stage === "Handover Done"; }
function isHandoverDone(stage: string) { return stage === "Handover Completed" || stage === "Handover Done"; }

function SalesOpsDashboard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [stageFilter, setStageFilter] = useState<string | null>(null);

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

  const today = todayISO();
  const monthStart = startOfMonthISO();
  const in7 = addDaysISO(7);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["my-leads"] });
  }

  const m = useMemo(() => {
    const newToday = leads.filter((l) => l.created_at.slice(0, 10) === today).length;
    const dueToday = leads.filter((l) => l.followup_date === today).length;
    const overdue = leads.filter((l) => l.followup_date && l.followup_date < today && !isTerminal(l.lead_stage)).length;
    const meetingsToday = leads.filter((l) => l.meeting_date === today).length;
    const hotAction = leads.filter((l) => l.lead_classification === "Hot" && !isTerminal(l.lead_stage)).length;
    const elFeePending = leads.filter((l) => l.engagement_letter_fee_status === "Pending" || l.engagement_letter_fee_status === "Partially Received").length;
    const bookingsMonth = leads.filter((l) => (l.booking_date && l.booking_date >= monthStart) || (l.lead_stage === "Booking Received" && l.created_at.slice(0, 10) >= monthStart)).length;

    const stageCounts: Record<string, number> = {};
    PIPELINE_STAGES.forEach((s) => { stageCounts[s] = 0; });
    leads.forEach((l) => {
      const s = l.lead_stage === "Handover Done" ? "Handover Completed" : l.lead_stage;
      if (stageCounts[s] != null) stageCounts[s]++;
    });

    const elSent = leads.filter((l) => !!l.engagement_letter_sent_date);
    const elFeePendingList = leads.filter((l) => l.engagement_letter_fee_status === "Pending" || l.engagement_letter_fee_status === "Partially Received");
    const elFeeReceivedList = leads.filter((l) => l.engagement_letter_fee_status === "Received");
    const handoverPending = leads.filter((l) => l.lead_stage === "Booking Received" && !isHandoverDone(l.lead_stage));
    const handoverDoneList = leads.filter((l) => isHandoverDone(l.lead_stage));
    const sumAmt = (arr: Lead[]) => arr.reduce((s, l) => s + (Number(l.engagement_letter_fee_amount) || 0), 0);

    const qualified = leads.filter((l) => ["Qualified", "Proposal Sent", "Follow-up", "Meeting Done", "Engagement Letter Pending", "Booking Received", "Handover Completed", "Handover Done"].includes(l.lead_stage)).length;
    const proposalSent = leads.filter((l) => !!l.proposal_sent_date).length;
    const meetingsDone = leads.filter((l) => l.lead_stage === "Meeting Done" || ["Engagement Letter Pending", "Booking Received", "Handover Completed", "Handover Done"].includes(l.lead_stage)).length;
    const feesCollected = leads.filter((l) => l.engagement_letter_fee_status === "Received");
    const bookingsReceived = leads.filter((l) => !!l.booking_date || l.lead_stage === "Booking Received" || isHandoverDone(l.lead_stage)).length;
    const handoverCount = leads.filter((l) => isHandoverDone(l.lead_stage)).length;
    const conversion = leads.length ? Math.round((handoverCount / leads.length) * 100) : 0;

    return {
      newToday, dueToday, overdue, meetingsToday, hotAction, elFeePending, bookingsMonth,
      stageCounts,
      booking: {
        elSent: { count: elSent.length, value: sumAmt(elSent) },
        elFeePending: { count: elFeePendingList.length, value: sumAmt(elFeePendingList) },
        elFeeReceived: { count: elFeeReceivedList.length, value: sumAmt(elFeeReceivedList) },
        handoverPending: { count: handoverPending.length, value: sumAmt(handoverPending) },
        handoverDone: { count: handoverDoneList.length, value: sumAmt(handoverDoneList) },
      },
      kpi: {
        total: leads.length, qualified, proposalSent, meetingsDone,
        feesCollected: { count: feesCollected.length, value: sumAmt(feesCollected) },
        bookingsReceived, conversion, overdue,
      },
    };
  }, [leads, today, monthStart]);

  const hotLeads = useMemo(() => leads
    .filter((l) => l.lead_classification === "Hot" && !isTerminal(l.lead_stage))
    .sort((a, b) => (a.followup_date ?? "9999").localeCompare(b.followup_date ?? "9999"))
    .slice(0, 8), [leads]);

  const tabLists = useMemo(() => ({
    due_today: leads.filter((l) => l.followup_date === today),
    overdue: leads.filter((l) => l.followup_date && l.followup_date < today && !isTerminal(l.lead_stage)),
    next_7: leads.filter((l) => l.followup_date && l.followup_date > today && l.followup_date <= in7),
    payment: leads.filter((l) => l.engagement_letter_fee_status === "Pending" || l.engagement_letter_fee_status === "Partially Received"),
    meeting: leads.filter((l) => l.meeting_date && l.meeting_date >= today),
  }), [leads, today, in7]);

  const stageFiltered = stageFilter
    ? leads.filter((l) => (l.lead_stage === "Handover Done" ? "Handover Completed" : l.lead_stage) === stageFilter)
    : null;

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Franchise Sales Operating Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your active sales board.</p>
      </div>

      {/* Section 1: Today's Action Center */}
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

      {/* Section 2: Sales Pipeline */}
      <Section title="Sales Pipeline">
        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {PIPELINE_STAGES.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <button
                    onClick={() => setStageFilter(stageFilter === s ? null : s)}
                    className={`px-3 py-2 rounded-lg border text-left min-w-[140px] transition ${
                      stageFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wide opacity-80">{s}</div>
                    <div className="text-xl font-semibold">{m.stageCounts[s] ?? 0}</div>
                  </button>
                  {i < PIPELINE_STAGES.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
            {stageFilter && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Leads in “{stageFilter}” ({stageFiltered?.length ?? 0})</div>
                  <Button size="sm" variant="ghost" onClick={() => setStageFilter(null)}>Clear</Button>
                </div>
                <LeadTable leads={stageFiltered ?? []} profiles={profiles} onSaved={refresh} />
              </div>
            )}
          </CardContent>
        </Card>
      </Section>

      {/* Section 3: Hot Leads Requiring Action */}
      <Section title="Hot Leads Requiring Action">
        {hotLeads.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No hot leads pending action.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotLeads.map((l) => <HotLeadCard key={l.id} lead={l} />)}
          </div>
        )}
      </Section>

      {/* Section 4: Follow-up Control Center */}
      <Section title="Follow-up Control Center">
        <Tabs defaultValue="due_today">
          <TabsList>
            <TabsTrigger value="due_today">Due Today ({tabLists.due_today.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({tabLists.overdue.length})</TabsTrigger>
            <TabsTrigger value="next_7">Next 7 Days ({tabLists.next_7.length})</TabsTrigger>
            <TabsTrigger value="payment">Payment Pending ({tabLists.payment.length})</TabsTrigger>
            <TabsTrigger value="meeting">Meeting Scheduled ({tabLists.meeting.length})</TabsTrigger>
          </TabsList>
          {(["due_today", "overdue", "next_7", "payment", "meeting"] as const).map((k) => (
            <TabsContent key={k} value={k} className="mt-3">
              <LeadTable leads={tabLists[k]} profiles={profiles} onSaved={refresh} />
            </TabsContent>
          ))}
        </Tabs>
      </Section>

      {/* Section 5: Booking Tracker */}
      <Section title="Booking Tracker">
        <div className="grid grid-cols-2 gap-3">
          <BookingStat label="EL Fee Received : No." {...m.booking.elFeePending} tone="text-orange-600" />
          <BookingStat label="Hand over to the Account department" {...m.booking.handoverPending} tone="text-blue-600" />
        </div>
      </Section>

      {/* Section 10: KPI Widgets */}
      <Section title="Sales KPIs">
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
    </div>
  );
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

function HotLeadCard({ lead }: { lead: Lead }) {
  const today = todayISO();
  const overdue = lead.followup_date && lead.followup_date < today;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{lead.name}</CardTitle>
            <div className="text-xs text-muted-foreground mt-0.5">{lead.city ?? "—"} · {lead.phone ?? "—"}</div>
          </div>
          <Badge variant="outline" className={classificationVariant(lead.lead_classification)}>{lead.lead_classification}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{lead.lead_stage}</Badge>
          {lead.next_action && <Badge variant="outline">Next: {lead.next_action}</Badge>}
        </div>
        <div className={`text-xs ${overdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
          Follow-up: {lead.followup_date ?? "—"}{overdue && " (overdue)"}
        </div>
        <div className="flex gap-2 pt-1">
          {lead.phone && (
            <>
              <a href={`tel:${lead.phone}`}><Button size="sm" variant="outline"><Phone className="w-3.5 h-3.5 mr-1" /> Call</Button></a>
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200"><MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp</Button>
              </a>
            </>
          )}
          <Link to="/leads/$id" params={{ id: lead.id }}>
            <Button size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Open</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadTable({ leads, profiles, onSaved }: { leads: Lead[]; profiles: { id: string; full_name: string }[]; onSaved: () => void }) {
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
              <Th>Name</Th><Th>Mobile</Th><Th>City</Th><Th>Stage</Th><Th>Next Action</Th><Th>Follow-up</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const overdue = l.followup_date && l.followup_date < today && !isTerminal(l.lead_stage);
              const dueToday = l.followup_date === today;
              return (
                <tr key={l.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {l.name}
                    {l.lead_classification && (
                      <Badge variant="outline" className={`ml-2 ${classificationVariant(l.lead_classification)}`}>{l.lead_classification}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{l.phone ?? "—"}</td>
                  <td className="px-4 py-3">{l.city ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{l.lead_stage}</Badge></td>
                  <td className="px-4 py-3">{l.next_action ?? "—"}</td>
                  <td className="px-4 py-3">
                    {l.followup_date ? (
                      <span className={overdue ? "text-red-600 font-medium" : dueToday ? "text-blue-600 font-medium" : ""}>
                        {l.followup_date}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to="/leads/$id" params={{ id: l.id }}>
                      <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                    </Link>
                    <LeadDialog lead={l} profiles={profiles} onSaved={onSaved}>
                      <Button size="sm" variant="ghost"><Pencil className="w-4 h-4" /></Button>
                    </LeadDialog>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2 font-medium text-muted-foreground">{children}</th>;
}
