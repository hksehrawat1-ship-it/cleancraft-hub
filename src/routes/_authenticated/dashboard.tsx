import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  Users, Flame, Store, Hammer, CalendarClock, AlertTriangle,
  MessageSquareWarning, Siren, Wallet, ListChecks,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clean Craft OS" }] }),
  component: Dashboard,
});

function startOfDayISO() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString();
}
function startOfMonthISO() {
  const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}
function endOfMonthISO() {
  const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
}

async function loadMetrics() {
  const sb = supabase as any;
  const today = startOfDayISO();
  const monthStart = startOfMonthISO();
  const monthEnd = endOfMonthISO();

  const [
    leadsToday, hotLeads, franchiseMonth, storesSetup, storesOpening,
    delayedProjects, openComplaints, redStores, pendingPayments, tasksByDept,
  ] = await Promise.all([
    sb.from("leads").select("id", { count: "exact", head: true }).gte("created_at", today),
    sb.from("leads").select("id", { count: "exact", head: true }).eq("status", "hot"),
    sb.from("franchise_bookings").select("id", { count: "exact", head: true })
      .gte("booked_at", monthStart).lte("booked_at", monthEnd),
    sb.from("stores").select("id", { count: "exact", head: true }).eq("status", "setup"),
    sb.from("stores").select("id", { count: "exact", head: true })
      .gte("opening_date", monthStart.slice(0, 10)).lte("opening_date", monthEnd.slice(0, 10)),
    sb.from("projects").select("id", { count: "exact", head: true }).eq("status", "delayed"),
    sb.from("complaints").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    sb.from("stores").select("id", { count: "exact", head: true }).eq("status", "red"),
    sb.from("payments").select("id, amount", { count: "exact" }).in("status", ["pending", "overdue"]),
    sb.from("tasks").select("department").neq("status", "completed").neq("status", "cancelled"),
  ]);

  const pendingAmount = (pendingPayments.data ?? []).reduce(
    (a: number, b: any) => a + Number(b.amount ?? 0), 0
  );

  const deptMap: Record<string, number> = {};
  for (const t of tasksByDept.data ?? []) {
    const k = t.department || "Unassigned";
    deptMap[k] = (deptMap[k] ?? 0) + 1;
  }

  return {
    leadsToday: leadsToday.count ?? 0,
    hotLeads: hotLeads.count ?? 0,
    franchiseMonth: franchiseMonth.count ?? 0,
    storesSetup: storesSetup.count ?? 0,
    storesOpening: storesOpening.count ?? 0,
    delayedProjects: delayedProjects.count ?? 0,
    openComplaints: openComplaints.count ?? 0,
    redStores: redStores.count ?? 0,
    pendingPaymentsCount: pendingPayments.count ?? 0,
    pendingPaymentsAmount: pendingAmount,
    deptMap,
  };
}

function Metric({
  icon: Icon, label, value, tone = "default", hint,
}: {
  icon: any; label: string; value: string | number; tone?: "default" | "danger" | "warning" | "success"; hint?: string;
}) {
  const toneClass =
    tone === "danger" ? "text-destructive bg-destructive/10" :
    tone === "warning" ? "text-warning bg-warning/10" :
    tone === "success" ? "text-success bg-success/10" :
    "text-primary bg-primary/10";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
            <div className="text-3xl font-semibold mt-2">{value}</div>
            {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user, isLeadership } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-metrics"], queryFn: loadMetrics });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Master Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {isLeadership ? "Leadership overview across all departments." : `Welcome back${user?.email ? `, ${user.email}` : ""}.`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Metric icon={Users} label="Leads today" value={isLoading ? "…" : data!.leadsToday} />
        <Metric icon={Flame} label="Hot leads" value={isLoading ? "…" : data!.hotLeads} tone="warning" />
        <Metric icon={Store} label="Franchise bookings" value={isLoading ? "…" : data!.franchiseMonth} hint="This month" tone="success" />
        <Metric icon={Hammer} label="Stores under setup" value={isLoading ? "…" : data!.storesSetup} />
        <Metric icon={CalendarClock} label="Opening this month" value={isLoading ? "…" : data!.storesOpening} />
        <Metric icon={AlertTriangle} label="Delayed projects" value={isLoading ? "…" : data!.delayedProjects} tone="warning" />
        <Metric icon={MessageSquareWarning} label="Open complaints" value={isLoading ? "…" : data!.openComplaints} tone="warning" />
        <Metric icon={Siren} label="Red stores" value={isLoading ? "…" : data!.redStores} tone="danger" />
        <Metric
          icon={Wallet}
          label="Pending payments"
          value={isLoading ? "…" : `₹${data!.pendingPaymentsAmount.toLocaleString()}`}
          hint={isLoading ? "" : `${data!.pendingPaymentsCount} entries`}
          tone="danger"
        />
        <Metric icon={ListChecks} label="Departments active" value={isLoading ? "…" : Object.keys(data!.deptMap).length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending tasks by department</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : Object.keys(data!.deptMap).length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending tasks. </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(data!.deptMap)
                .sort((a, b) => b[1] - a[1])
                .map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between border rounded-lg p-3">
                    <span className="text-sm font-medium">{dept}</span>
                    <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
