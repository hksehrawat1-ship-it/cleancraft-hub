import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TeamLeadsPage } from "@/components/sales-head/team-leads";
import { EscalationsPage } from "@/components/sales-head/escalations";
import { SalesHeadPipelinePage } from "@/components/sales-head/pipeline";
import { SalesHeadMeetingsPage } from "@/components/sales-head/meetings";
import { SalesHeadTeamTasksPage } from "@/components/sales-head/team-tasks";
import { SalesHeadPerformancePage } from "@/components/sales-head/performance";
import {
  UserCircle2,
  LayoutDashboard,
  Users,
  AlertTriangle,
  TrendingDown,
  CalendarClock,
  ListChecks,
  TrendingUp,
  FolderOpen,
  Phone,
  CheckCircle2,
  Clock,
  ArrowDown,
  Flame,
  Download,
  Share2,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/sales-head")({
  head: () => ({
    meta: [
      { title: "Sales Head Dashboard — Clean Craft OS" },
      { name: "description", content: "Sales Head workspace: team leads, escalations, pipeline, meetings, tasks and performance." },
      { property: "og:title", content: "Sales Head Dashboard — Clean Craft OS" },
      { property: "og:description", content: "Manage the franchise sales team: leads, escalations, pipeline and performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesHeadDashboard,
});

type SectionKey =
  | "roles"
  | "dashboard"
  | "team-leads"
  | "escalations"
  | "pipeline"
  | "meetings"
  | "tasks"
  | "performance"
  | "resources";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "roles", label: "Roles & Responsibilities", icon: UserCircle2 },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "team-leads", label: "Team Leads", icon: Users },
  { key: "escalations", label: "Priority & Escalations", icon: AlertTriangle },
  { key: "pipeline", label: "Sales Pipeline", icon: TrendingDown },
  { key: "meetings", label: "Meetings", icon: CalendarClock },
  { key: "tasks", label: "Team Tasks", icon: ListChecks },
  { key: "performance", label: "Performance", icon: TrendingUp },
  { key: "resources", label: "Resources", icon: FolderOpen },
];

function SalesHeadDashboard() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Sales Head</div>
        </div>
        <nav className="p-2 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden border-b bg-background p-3">
          <Select value={active} onValueChange={(v) => setActive(v as SectionKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NAV.map((n) => (
                <SelectItem key={n.key} value={n.key}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <main className="p-4 md:p-6 overflow-auto">
          {active === "roles" && <RolesSection />}
          {active === "dashboard" && <DashboardSection />}
          {active === "team-leads" && <TeamLeadsPage />}
          {active === "escalations" && <EscalationsPage />}
          {active === "pipeline" && <SalesHeadPipelinePage />}
          {active === "meetings" && <SalesHeadMeetingsPage />}
          {active === "tasks" && <SalesHeadTeamTasksPage />}
          {active === "performance" && <SalesHeadPerformancePage />}
          {active === "resources" && <ResourcesSection />}
        </main>
      </div>
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

/* -------------------- Roles -------------------- */
function RolesSection() {
  const items = [
    "Own the franchise sales number: weekly bookings and monthly revenue target",
    "Distribute and re-balance incoming leads across the sales team daily",
    "Review the priority call queue and clear every overdue lead each morning",
    "Audit lead quality (Hot / Warm / Cold / Dangerous) and kill junk early",
    "Run daily huddles and weekly 1-on-1 reviews with each salesperson",
    "Personally close high-value and escalated deals",
    "Track stage leakage and fix the biggest drop-off stage every week",
    "Report funnel, closure % and forecast to the CEO every Monday",
  ];
  return (
    <div className="space-y-4">
      <SectionHead title="Roles & Responsibilities" sub="Your charter as Sales Head." />
      <Card>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {items.map((t) => (
              <li key={t} className="flex gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------- Dashboard -------------------- */
const KPIS = [
  { label: "Bookings This Week", value: "28", sub: "Target 32" },
  { label: "Leads Received", value: "420", sub: "This month" },
  { label: "Team Closure %", value: "10.4%", sub: "Target 12%" },
  { label: "Revenue Booked", value: "₹18L", sub: "Month to date" },
];

const FUNNEL = [
  { label: "Leads Received", value: 420 },
  { label: "Qualified", value: 265 },
  { label: "Proposal Sent", value: 180 },
  { label: "Meeting Done", value: 118 },
  { label: "EL Fee Received", value: 41 },
  { label: "Bookings", value: 28 },
];

const QUALITY = [
  { label: "Hot", value: "42%", color: "bg-red-500" },
  { label: "Warm", value: "31%", color: "bg-orange-500" },
  { label: "Cold", value: "17%", color: "bg-sky-500" },
  { label: "Dangerous", value: "10%", color: "bg-rose-700" },
];

function DashboardSection() {
  return (
    <div className="space-y-4">
      <SectionHead title="Dashboard" sub="Today's sales picture at a glance." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIS.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-3xl font-bold tabular-nums mt-1">{k.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" /> Sales Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-md mx-auto">
              {FUNNEL.map((f, i) => (
                <div key={f.label}>
                  <div
                    className="mx-auto rounded-md bg-primary/15 border border-primary/30 px-3 py-2 flex items-center justify-between"
                    style={{ width: `${Math.max(24, (f.value / FUNNEL[0].value) * 100)}%` }}
                  >
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-sm font-semibold tabular-nums">{f.value}</span>
                  </div>
                  {i < FUNNEL.length - 1 && (
                    <div className="flex justify-center text-muted-foreground">
                      <ArrowDown className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" /> Lead Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {QUALITY.map((q) => (
                  <div key={q.label} className="border rounded-md p-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${q.color}`} />
                      <span className="text-xs text-muted-foreground">{q.label}</span>
                    </div>
                    <div className="text-2xl font-semibold tabular-nums mt-1">{q.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today's Priorities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { t: "9 overdue calls in team queue", tone: "text-red-500" },
                { t: "3 proposals pending > 5 days", tone: "text-amber-500" },
                { t: "2 escalated deals need your call", tone: "text-red-500" },
                { t: "Weekly review with Deepak (red)", tone: "text-muted-foreground" },
              ].map((r) => (
                <div key={r.t} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className={`h-4 w-4 ${r.tone}`} />
                  <span>{r.t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* Priority & Escalations lives in src/components/sales-head/escalations.tsx */


/* Sales Pipeline lives in src/components/sales-head/pipeline.tsx */

/* Meetings lives in src/components/sales-head/meetings.tsx */

/* -------------------- Team Tasks -------------------- */
type Task = { id: string; title: string; owner: string; due: string; status: "Pending" | "Done" };

const INITIAL_TASKS: Task[] = [
  { id: "T-1", title: "Clear all overdue calls in queue", owner: "Rahul", due: "Today", status: "Pending" },
  { id: "T-2", title: "Re-verify budget for Dangerous leads", owner: "Deepak", due: "Today", status: "Pending" },
  { id: "T-3", title: "Send 5 proposals from qualified pool", owner: "Amit", due: "Tomorrow", status: "Pending" },
  { id: "T-4", title: "Update CRM remarks for last week's leads", owner: "Rahul", due: "Yesterday", status: "Done" },
];

function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("Rahul");
  const [due, setDue] = useState("");

  const add = () => {
    if (!title.trim()) { toast.error("Add a task title"); return; }
    setTasks((t) => [{ id: `T-${Date.now()}`, title, owner, due: due || "Today", status: "Pending" }, ...t]);
    setTitle(""); setDue("");
    toast.success(`Task assigned to ${owner}`);
  };

  return (
    <div className="space-y-4">
      <SectionHead title="Team Tasks" sub="Assign, track and close work across the sales team." />
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Assign a task</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-3">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Rahul", "Amit", "Deepak"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Due (e.g. Today)" value={due} onChange={(e) => setDue(e.target.value)} className="md:w-44" />
          <Button onClick={add}>Assign</Button>
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {tasks.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className={`text-sm font-medium ${t.status === "Done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.owner} · Due {t.due}</div>
              </div>
              {t.status === "Done" ? (
                <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Done</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTasks((s) => s.map((x) => (x.id === t.id ? { ...x, status: "Done" } : x)));
                    toast.success("Task completed");
                  }}
                >
                  Mark done
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Performance -------------------- */
const TEAM = [
  { name: "Rahul", leads: 45, bookings: 7, closure: 15.5, status: "green" as const },
  { name: "Amit", leads: 42, bookings: 4, closure: 9.5, status: "yellow" as const },
  { name: "Deepak", leads: 38, bookings: 2, closure: 5.2, status: "red" as const },
];

const statusDot = (s: "green" | "yellow" | "red") =>
  s === "green" ? "bg-emerald-500" : s === "yellow" ? "bg-yellow-400" : "bg-red-500";

function PerformanceSection() {
  return (
    <div className="space-y-4">
      <SectionHead title="Performance" sub="Team and personal performance against target." />
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { label: "Bookings vs Target", value: 28, target: 32 },
          { label: "Revenue vs Target (₹L)", value: 18, target: 22 },
          { label: "Closure % vs Target", value: 10.4, target: 12 },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3.5 w-3.5" /> {m.label}
              </div>
              <div className="text-2xl font-bold tabular-nums">
                {m.value} <span className="text-sm text-muted-foreground font-normal">/ {m.target}</span>
              </div>
              <Progress value={(m.value / m.target) * 100} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-2 pr-4">Salesperson</th>
                  <th className="py-2 pr-4">Hot+Warm Leads</th>
                  <th className="py-2 pr-4">Bookings</th>
                  <th className="py-2 pr-4">Closure %</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {TEAM.map((t) => (
                  <tr key={t.name} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{t.name}</td>
                    <td className="py-2 pr-4 tabular-nums">{t.leads}</td>
                    <td className="py-2 pr-4 tabular-nums">{t.bookings}</td>
                    <td className="py-2 pr-4 tabular-nums">{t.closure}%</td>
                    <td className="py-2"><span className={`inline-block w-3 h-3 rounded-full ${statusDot(t.status)}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

