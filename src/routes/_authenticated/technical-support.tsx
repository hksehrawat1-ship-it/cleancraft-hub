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
                  <Badge variant={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "default" : "secondary"}>{t.priority}</Badge>
                  <Badge variant="outline">{t.status}</Badge>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Priority Queue ---------------- */
function PriorityQueueSection() {
  const queue = [
    { store: "Jaipur", issue: "POS sync failure", sla: "15 min", type: "Remote", wait: "2 min" },
    { store: "Agra", issue: "Generator auto-start fault", sla: "30 min", type: "Electrician", wait: "5 min" },
    { store: "Indore", issue: "Steam iron pressure drop", sla: "45 min", type: "On-call", wait: "8 min" },
    { store: "Lucknow", issue: "Payment retry loop", sla: "20 min", type: "Remote", wait: "12 min" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Priority Queue</h1>
        <p className="text-sm text-muted-foreground">SLA-sensitive tickets sorted by urgency.</p>
      </div>

      <div className="grid gap-3">
        {queue.map((q, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{q.issue}</div>
                  <div className="text-xs text-muted-foreground">{q.store} · Waiting {q.wait}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{q.type}</Badge>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">SLA Target</div>
                  <div className="text-sm font-medium">{q.sla}</div>
                </div>
                <Button size="sm">Accept</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Remote Troubleshooting ---------------- */
function RemoteSection() {
  const sessions = [
    { store: "Jaipur", status: "Live", duration: "12:34" },
    { store: "Surat", status: "Scheduled", duration: "—" },
    { store: "Lucknow", status: "Completed", duration: "08:15" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Remote Troubleshooting</h1>
        <p className="text-sm text-muted-foreground">Live and scheduled remote support sessions.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {sessions.map((s, idx) => (
          <Card key={idx}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{s.store}</div>
                <Badge variant={s.status === "Live" ? "default" : s.status === "Scheduled" ? "secondary" : "outline"}>{s.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Duration: {s.duration}</div>
              <div className="flex gap-2">
                {s.status === "Live" ? (
                  <>
                    <Button size="sm" variant="destructive" className="gap-1"><Pause className="w-3 h-3" /> End</Button>
                    <Button size="sm" variant="outline">Annotate</Button>
                  </>
                ) : s.status === "Scheduled" ? (
                  <Button size="sm" className="gap-1"><Play className="w-3 h-3" /> Start</Button>
                ) : (
                  <Button size="sm" variant="outline">View Notes</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Electrician Coordination ---------------- */
function ElectricianSection() {
  const requests = [
    { store: "Agra", issue: "Generator auto-start", electrician: "Ravi Kumar", eta: "20 min", status: "Assigned" },
    { store: "Indore", issue: "Steam iron wiring", electrician: "Amit Sharma", eta: "45 min", status: "On Site" },
    { store: "Jaipur", issue: "New machine install", electrician: "Pending", eta: "—", status: "Open" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Electrician Coordination</h1>
        <p className="text-sm text-muted-foreground">Track on-site electrical support requests.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Wrench className="w-4 h-4" /> Active Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">{r.store}</div>
                <div className="text-xs text-muted-foreground">{r.issue}</div>
              </div>
              <div className="text-right text-sm">
                <div>{r.electrician}</div>
                <div className="text-xs text-muted-foreground">ETA {r.eta}</div>
              </div>
              <Badge variant={r.status === "On Site" ? "default" : r.status === "Assigned" ? "secondary" : "outline"}>{r.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="gap-2"><UserCog className="w-4 h-4" /> Raise New Electrician Request</Button>
    </div>
  );
}

/* ---------------- Follow-ups & Reminders ---------------- */
function FollowUpsSection() {
  const reminders = [
    { label: "Call Jaipur store for POS update", due: "Today, 2:00 PM", type: "Call" },
    { label: "Confirm electrician reached Agra", due: "Today, 3:30 PM", type: "Check" },
    { label: "Follow up on Surat CCTV replacement", due: "Tomorrow, 10:00 AM", type: "Call" },
    { label: "Update knowledge base — payment retry", due: "Tomorrow, 12:00 PM", type: "Task" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Follow-ups & Reminders</h1>
        <p className="text-sm text-muted-foreground">Pending callbacks and scheduled checks.</p>
      </div>

      <div className="grid gap-3">
        {reminders.map((r, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarClock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-xs text-muted-foreground">{r.due}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.type}</Badge>
                <Button size="sm" variant="outline">Done</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Knowledge Centre ---------------- */
function KnowledgeSection() {
  const articles = [
    { title: "POS Sync Troubleshooting", category: "POS", reads: 124 },
    { title: "Steam Iron Pressure Guide", category: "Machine", reads: 89 },
    { title: "Payment Gateway Error Codes", category: "Payments", reads: 156 },
    { title: "Generator Auto-Start Setup", category: "Electrical", reads: 67 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Centre</h1>
          <p className="text-sm text-muted-foreground">Approved SOPs and troubleshooting guides.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-9 w-64" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {articles.map((a, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex items-start justify-between">
              <div>
                <div className="font-medium text-sm">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.reads} reads · {a.category}</div>
              </div>
              <Button size="sm" variant="ghost">Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Performance ---------------- */
function PerformanceSection() {
  const metrics = [
    { label: "Tickets Resolved", value: 86, target: 100, unit: "" },
    { label: "Avg Resolution Time", value: 1.4, target: 2.0, unit: " days" },
    { label: "First Contact Resolution", value: 72, target: 80, unit: "%" },
    { label: "Customer Satisfaction", value: 4.7, target: 4.5, unit: "/5" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
        <p className="text-sm text-muted-foreground">Your support metrics this month.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-semibold mt-1">{m.value}{m.unit}</p>
              <p className="text-xs text-muted-foreground mt-1">Target: {m.target}{m.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-2">
            {[45, 52, 48, 60, 55, 68, 72].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/80 rounded-t" style={{ height: `${v * 2}px` }} />
                <span className="text-[10px] text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
