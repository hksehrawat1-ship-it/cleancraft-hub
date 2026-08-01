import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  Ticket,
  ListOrdered,
  MonitorPlay,
  UserCog,
  Bell,
  BookOpen,
  TrendingUp,
  Headphones,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Wrench,
  CalendarClock,
  Filter,
  Play,
  Pause,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/technical-support")({
  head: () => ({
    meta: [
      { title: "Technical Support — Clean Craft OS" },
      { name: "description", content: "Technical Support employee dashboard" },
    ],
  }),
  component: TechnicalSupportDashboard,
});

type SectionKey =
  | "dashboard"
  | "tickets"
  | "priority"
  | "remote"
  | "electrician"
  | "followups"
  | "knowledge"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tickets", label: "My Support Tickets", icon: Ticket },
  { key: "priority", label: "Priority Queue", icon: ListOrdered },
  { key: "remote", label: "Remote Troubleshooting", icon: MonitorPlay },
  { key: "electrician", label: "Electrician Coordination", icon: UserCog },
  { key: "followups", label: "Follow-ups & Reminders", icon: Bell },
  { key: "knowledge", label: "Knowledge Centre", icon: BookOpen },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function TechnicalSupportDashboard() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold flex items-center gap-2">
            <Headphones className="w-4 h-4 text-primary" />
            Technical Support
          </div>
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
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {active === "dashboard" && <DashboardSection />}
        {active === "tickets" && <TicketsSection />}
        {active === "priority" && <PriorityQueueSection />}
        {active === "remote" && <RemoteSection />}
        {active === "electrician" && <ElectricianSection />}
        {active === "followups" && <FollowUpsSection />}
        {active === "knowledge" && <KnowledgeSection />}
        {active === "performance" && <PerformanceSection />}
      </main>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function DashboardSection() {
  const stats = [
    { label: "Open Tickets", value: 12, icon: Ticket, tint: "bg-blue-500/10 text-blue-600" },
    { label: "In Progress", value: 5, icon: Clock, tint: "bg-amber-500/10 text-amber-600" },
    { label: "Resolved Today", value: 8, icon: CheckCircle2, tint: "bg-emerald-500/10 text-emerald-600" },
    { label: "Escalated", value: 2, icon: AlertCircle, tint: "bg-rose-500/10 text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Technical Support Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your daily support operations snapshot.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-semibold mt-1">{s.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${s.tint}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Calls Handled", value: 14, target: 20 },
              { label: "Remote Sessions", value: 6, target: 10 },
              { label: "Electrician Requests", value: 3, target: 5 },
            ].map((a) => (
              <div key={a.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{a.label}</span>
                  <span className="text-muted-foreground">{a.value}/{a.target}</span>
                </div>
                <Progress value={(a.value / a.target) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start gap-2">
              <Phone className="w-4 h-4" /> Call Queue
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <MonitorPlay className="w-4 h-4" /> Start Remote
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <UserCog className="w-4 h-4" /> Raise Electrician
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Bell className="w-4 h-4" /> Set Reminder
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- My Support Tickets ---------------- */
function TicketsSection() {
  const tickets = [
    { id: "#TS-1024", store: "Jaipur", issue: "POS not syncing", status: "Open", priority: "High", time: "10m ago" },
    { id: "#TS-1023", store: "Indore", issue: "Steam iron low pressure", status: "In Progress", priority: "Medium", time: "32m ago" },
    { id: "#TS-1022", store: "Lucknow", issue: "Payment gateway error", status: "Resolved", priority: "High", time: "1h ago" },
    { id: "#TS-1021", store: "Surat", issue: "CCTV offline", status: "Open", priority: "Low", time: "2h ago" },
    { id: "#TS-1020", store: "Agra", issue: "Generator not auto-starting", status: "Escalated", priority: "High", time: "3h ago" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Tickets assigned to you today.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tickets..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{t.issue}</div>
                    <div className="text-xs text-muted-foreground">{t.id} · {t.store} · {t.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "default" : "secondary