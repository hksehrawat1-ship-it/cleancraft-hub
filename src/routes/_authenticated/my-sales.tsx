import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadDialog, type Lead } from "./leads";

export const Route = createFileRoute("/_authenticated/my-sales")({
  head: () => ({ meta: [{ title: "My Sales Board — Clean Craft OS" }] }),
  component: MySalesPage,
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}
function endOfWeekISO() {
  const d = new Date();
  const diff = 7 - d.getDay();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff).toISOString().slice(0, 10);
}

function classificationVariant(c: string | null) {
  switch (c) {
    case "Hot": return "bg-red-100 text-red-700 border-red-200";
    case "Warm": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Cold": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Dangerous": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Time Waster": return "bg-gray-100 text-gray-600 border-gray-200";
    default: return "bg-muted text-muted-foreground";
  }
}

type Quick = "all" | "due_today" | "overdue" | "hot" | "meetings_week";

function MySalesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [quick, setQuick] = useState<Quick>("all");

  const { data: leads = [], isLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ["my-leads", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads").select("*")
        .eq("assigned_to", user!.id)
        .order("followup_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles").select("id, full_name").order("full_name");
      if (error) throw error;
      return data as { id: string; full_name: string }[];
    },
  });

  const today = todayISO();
  const monthStart = startOfMonthISO();
  const weekEnd = endOfWeekISO();

  const metrics = useMemo(() => ({
    total: leads.length,
    hot: leads.filter((l) => l.lead_classification === "Hot").length,
    warm: leads.filter((l) => l.lead_classification === "Warm").length,
    dueToday: leads.filter((l) => l.followup_date === today).length,
    overdue: leads.filter((l) => l.followup_date && l.followup_date < today && !["Lost", "Handover Done"].includes(l.lead_stage)).length,
    proposals: leads.filter((l) => l.lead_stage === "Proposal Sent").length,
    meetings: leads.filter((l) => l.lead_stage === "Meeting Done").length,
    bookingMonth: leads.filter((l) => l.lead_stage === "Booking Received" && l.created_at >= monthStart).length,
    converted: leads.filter((l) => !!l.converted_to_franchise_at).length,
  }), [leads, today, monthStart]);

  const filtered = useMemo(() => {
    switch (quick) {
      case "due_today": return leads.filter((l) => l.followup_date === today);
      case "overdue": return leads.filter((l) => l.followup_date && l.followup_date < today && !["Lost", "Handover Done"].includes(l.lead_stage));
      case "hot": return leads.filter((l) => l.lead_classification === "Hot");
      case "meetings_week": return leads.filter((l) => l.meeting_date && l.meeting_date >= today && l.meeting_date <= weekEnd);
      default: return leads;
    }
  }, [leads, quick, today, weekEnd]);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["my-leads"] });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Sales Board</h1>
        <p className="text-sm text-muted-foreground">Leads assigned to you.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat label="My Total Leads" value={metrics.total} />
        <Stat label="My Hot Leads" value={metrics.hot} tone="text-red-600" />
        <Stat label="My Warm Leads" value={metrics.warm} tone="text-amber-600" />
        <Stat label="Follow-ups Due Today" value={metrics.dueToday} tone="text-blue-600" />
        <Stat label="Overdue Follow-ups" value={metrics.overdue} tone="text-red-700" />
        <Stat label="Proposals Sent" value={metrics.proposals} />
        <Stat label="Meetings Done" value={metrics.meetings} />
        <Stat label="Bookings This Month" value={metrics.bookingMonth} tone="text-emerald-600" />
        <Stat label="Converted to Franchise" value={metrics.converted} tone="text-emerald-700" />
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ["all", "All"],
          ["due_today", "Due Today"],
          ["overdue", "Overdue"],
          ["hot", "Hot"],
          ["meetings_week", "This Week's Meetings"],
        ] as [Quick, string][]).map(([k, label]) => (
          <Button key={k} size="sm" variant={quick === k ? "default" : "outline"} onClick={() => setQuick(k)}>
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No leads here.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <Th>Name</Th><Th>Phone</Th><Th>Class</Th><Th>Stage</Th><Th>Follow-up</Th><Th></Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const overdue = l.followup_date && l.followup_date < today && !["Lost", "Handover Done"].includes(l.lead_stage);
                  const dueToday = l.followup_date === today;
                  return (
                    <tr key={l.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">
                        {l.name}
                        {l.converted_to_franchise_at && <Badge variant="outline" className="ml-2 text-emerald-700 border-emerald-200">Franchise</Badge>}
                      </td>
                      <td className="px-4 py-3">{l.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        {l.lead_classification ? (
                          <Badge variant="outline" className={classificationVariant(l.lead_classification)}>{l.lead_classification}</Badge>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline">{l.lead_stage}</Badge></td>
                      <td className="px-4 py-3">
                        {l.followup_date ? (
                          <span className={overdue ? "text-red-600 font-medium" : dueToday ? "text-blue-600 font-medium" : ""}>
                            {l.followup_date}{overdue && " (overdue)"}{dueToday && " (today)"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <LeadDialog lead={l} profiles={profiles} onSaved={refresh}>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </LeadDialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2 font-medium text-muted-foreground">{children}</th>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-semibold mt-1 ${tone ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
