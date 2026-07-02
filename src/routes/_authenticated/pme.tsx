import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  UserCircle2,
  ListChecks,
  Store,
  ClipboardList,
  TrendingUp,
  MapPin,
  Megaphone,
  Video,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/pme")({
  head: () => ({
    meta: [
      { title: "Performance Marketing — Clean Craft OS" },
      { name: "description", content: "Performance Marketing Executive dashboard" },
    ],
  }),
  component: PMEDashboard,
});

type SectionKey =
  | "overview"
  | "roles"
  | "mind"
  | "stores"
  | "rm-tasks"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Performance Overview", icon: LayoutDashboard },
  { key: "roles", label: "Roles & Responsibilities", icon: UserCircle2 },
  { key: "mind", label: "Mind & Tasks", icon: ListChecks },
  { key: "stores", label: "Stores Assigned", icon: Store },
  { key: "rm-tasks", label: "Tasks by R.M.", icon: ClipboardList },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function PMEDashboard() {
  const [active, setActive] = useState<SectionKey>("overview");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Performance Marketing</div>
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
        {active === "overview" && <OverviewSection />}
        {active === "roles" && <RolesSection />}
        {active === "mind" && <MindSection />}
        {active === "stores" && <StoresSection />}
        {active === "rm-tasks" && <RMTasksSection />}
        {active === "performance" && <PerformanceSection />}
      </main>
    </div>
  );
}

/* ---------------- Overview ---------------- */
function OverviewSection() {
  const stats = [
    { key: "A", label: "Stores to Work On Today", value: 5, icon: Store, tint: "bg-blue-500/10 text-blue-600" },
    { key: "B", label: "New Store Adds", value: 2, icon: Plus, tint: "bg-emerald-500/10 text-emerald-600" },
    { key: "C", label: "Campaigns Ending", value: 1, icon: Megaphone, tint: "bg-amber-500/10 text-amber-600" },
    { key: "D", label: "GMB Pending", value: 3, icon: MapPin, tint: "bg-rose-500/10 text-rose-600" },
    { key: "E", label: "Influencer Follow-up", value: 4, icon: Video, tint: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance Overview</h1>
        <p className="text-sm text-muted-foreground">Your snapshot for today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {s.key}. {s.label}
                    </div>
                    <div className="mt-2 text-3xl font-bold">{s.value}</div>
                  </div>
                  <div className={`p-2 rounded-md ${s.tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's Focus</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Prioritize the 5 stores due for work, close out the ending campaign, and clear GMB verifications before EOD.
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Roles ---------------- */
function RolesSection() {
  const items = [
    "Plan and launch performance campaigns across Meta & Google.",
    "Manage store-level Google My Business listings and updates.",
    "Coordinate with influencers and track deliverables.",
    "Monitor daily spend, CPL, ROAS and optimize creatives.",
    "Report weekly performance to the Reporting Manager.",
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Roles & Responsibilities</h1>
      <Card>
        <CardContent className="p-6">
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            {items.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Mind & Tasks ---------------- */
function MindSection() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review ad creatives for Store #12", done: false },
    { id: 2, text: "Approve GMB posts", done: true },
    { id: 3, text: "Follow up with 2 influencers", done: false },
  ]);
  const [note, setNote] = useState("");

  const toggle = (id: number) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const add = () => {
    if (!note.trim()) return;
    setTasks((ts) => [...ts, { id: Date.now(), text: note.trim(), done: false }]);
    setNote("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Mind & Tasks</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick add</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="What's on your mind?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-md border p-3 bg-background"
            >
              <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
              <span className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>
                {t.text}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Stores Assigned ---------------- */
function StoresSection() {
  const stores = [
    { name: "Clean Craft — Andheri", status: "Active", campaigns: 3 },
    { name: "Clean Craft — Bandra", status: "GMB Pending", campaigns: 1 },
    { name: "Clean Craft — Powai", status: "Active", campaigns: 2 },
    { name: "Clean Craft — Thane", status: "Onboarding", campaigns: 0 },
    { name: "Clean Craft — Vashi", status: "Active", campaigns: 4 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Stores Assigned</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => (
          <Card key={s.name}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.campaigns} active campaigns
                  </div>
                </div>
                <Badge
                  variant={
                    s.status === "Active"
                      ? "default"
                      : s.status === "GMB Pending"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {s.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Tasks by R.M. ---------------- */
function RMTasksSection() {
  const tasks = [
    { title: "Prepare weekly ROAS report", due: "Today", priority: "High" },
    { title: "Onboard 2 new influencers", due: "Tomorrow", priority: "Medium" },
    { title: "Audit GMB listings for Thane", due: "Fri", priority: "High" },
    { title: "Reduce CPL for Store #14", due: "Next week", priority: "Low" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tasks by R.M.</h1>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {tasks.map((t) => (
              <div key={t.title} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-sm">{t.title}</div>
                  <div className="text-xs text-muted-foreground">Due: {t.due}</div>
                </div>
                <Badge
                  variant={
                    t.priority === "High"
                      ? "destructive"
                      : t.priority === "Medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {t.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Performance ---------------- */
function PerformanceSection() {
  const kpis = [
    { label: "ROAS", value: "3.4x", delta: "+0.4", up: true },
    { label: "CPL", value: "₹128", delta: "-₹12", up: true },
    { label: "Spend (MTD)", value: "₹4.2L", delta: "+8%", up: true },
    { label: "Leads", value: "1,284", delta: "-3%", up: false },
  ];

  const goals = [
    { label: "Monthly Leads Target", value: 64 },
    { label: "GMB Coverage", value: 82 },
    { label: "Influencer Deliverables", value: 48 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Performance</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="mt-2 text-2xl font-bold">{k.value}</div>
              <div
                className={`mt-1 flex items-center gap-1 text-xs ${
                  k.up ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {k.up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {k.delta}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goals progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((g) => (
            <div key={g.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{g.label}</span>
                <span className="text-muted-foreground">{g.value}%</span>
              </div>
              <Progress value={g.value} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
