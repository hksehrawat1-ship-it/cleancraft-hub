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
  CalendarCheck,
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
  | "daily"
  | "rm-tasks"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Performance Overview", icon: LayoutDashboard },
  { key: "roles", label: "Roles & Responsibilities", icon: UserCircle2 },
  { key: "mind", label: "Mind & Tasks", icon: ListChecks },
  { key: "stores", label: "Stores Assigned", icon: Store },
  { key: "daily", label: "Weekly Activity", icon: CalendarCheck },
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
        {active === "daily" && <DailyActivitySection />}
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
  const deliverables = [
    "Store Lead Generation through ads and GMB setup",
    "Customer Acquisition",
    "Paid Advertising Campaign Management",
    "Campaign Optimization",
    "Store Revenue Growth Support",
    "Marketing Performance Reporting",
    "Graphic creation",
  ];

  const tasks = [
    "Create, manage, monitor, and optimize Google Ads, Meta Ads and other approved digital campaigns for franchise stores.",
    "Coordinate with the Relationship Manager on store requirements and campaign objectives.",
    "Plan and execute customer acquisition, app download, offer, seasonal and store-launch campaigns.",
    "Monitor campaign performance, cost per lead, cost per acquisition and return on ad spend.",
    "Analyze customer behavior and campaign results, and continuously optimize for better performance.",
    "Coordinate with Social Media Manager, CRM Retention Executive and BTL Team to support store growth.",
    "Submit regular performance reports and recommendations to management.",
  ];

  const completeMatrix = [
    "Campaign created",
    "Budget approved",
    "Ads launched",
    "Tracking verified",
    "Leads generated",
    "Performance reviewed",
    "Optimization completed",
    "Report submitted",
    "RM informed",
  ];

  const kra = [
    "Generate qualified customers for stores.",
    "Improve store revenue through paid marketing.",
    "Achieve target ROAS.",
    "Reduce customer acquisition cost.",
    "Support successful store launches and growth campaigns.",
  ];

  const kpiDaily = ["Campaigns monitored", "Leads generated", "Campaign optimizations completed"];
  const kpiWeekly = [
    "Campaign performance reviews completed",
    "Cost per lead achieved",
    "Customer acquisition targets achieved",
  ];
  const kpiMonthly = [
    "Leads generated",
    "Customer acquisition cost (CAC)",
    "Return on Ad Spend (ROAS)",
    "App downloads generated",
    "Orders generated",
    "Store revenue contribution",
  ];

  const whatNotToDo = [
    "Launch campaigns without approval.",
    "Change offers without approval.",
    "Overspend marketing budget.",
    "Hide poor campaign performance.",
    "Use misleading advertisements.",
    "Ignore campaign optimization.",
    "Run campaigns without proper tracking.",
    "Commit sales guarantees to franchise partners.",
  ];

  const escalation = [
    "Customer complaint received",
    "Negative review received",
    "CRM system issue",
    "Campaign failure",
    "High-value customer dissatisfaction",
    "Data privacy issue",
    "Mass campaign error",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles & Responsibilities</h1>
        <p className="text-sm text-muted-foreground">Performance Marketing Executive — Clean Craft</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role Definition</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Responsible for generating B2C sales, leads, app downloads, and customer acquisition for franchise stores
          through paid digital marketing campaigns while ensuring maximum return on advertising spend.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trigger Point</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          New store opening, marketing campaign approval, monthly marketing plan, store performance improvement
          requirement, seasonal campaign, festival campaign, or growth activity assigned by the Store Success Team.
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responsibility Deliverables</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-[upper-alpha] pl-5 space-y-1.5 text-sm">
              {deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks & Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              {tasks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Handover Matrix</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <span className="font-medium">Receives: </span>
            <span className="text-muted-foreground">
              Campaign requirements, budgets, offers and store objectives from Management.
            </span>
          </div>
          <div>
            <span className="font-medium">Shares: </span>
            <span className="text-muted-foreground">
              Campaign results, leads, customer acquisition data and performance reports with R.M and Management.
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complete Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              {completeMatrix.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">KRA</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-[upper-alpha] pl-5 space-y-1.5 text-sm">
              {kra.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">KPIs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <div className="font-semibold mb-1.5">Daily</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {kpiDaily.map((k) => <li key={k}>{k}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1.5">Weekly</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {kpiWeekly.map((k) => <li key={k}>{k}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1.5">Monthly</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {kpiMonthly.map((k) => <li key={k}>{k}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">What Not To Do</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            {whatNotToDo.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Escalation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-[upper-alpha] pl-5 space-y-1.5 text-sm">
            {escalation.map((e) => (
              <li key={e}>{e}</li>
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
type StoreInfo = {
  id: string;
  name: string;
  status: string;
  owner: string;
  storePhone: string;
  ownerPhone: string;
  address: string;
  email: string;
};

const INITIAL_STORES: StoreInfo[] = [
  {
    id: "andheri",
    name: "Clean Craft — Andheri",
    status: "Active",
    owner: "Rahul Sharma",
    storePhone: "+91 22 4000 1201",
    ownerPhone: "+91 98200 11201",
    address: "Shop 4, Link Road, Andheri West, Mumbai 400053",
    email: "andheri@cleancraft.in",
  },
  {
    id: "bandra",
    name: "Clean Craft — Bandra",
    status: "GMB Pending",
    owner: "Neha Kapoor",
    storePhone: "+91 22 4000 1202",
    ownerPhone: "+91 98200 11202",
    address: "Hill Road, Bandra West, Mumbai 400050",
    email: "bandra@cleancraft.in",
  },
  {
    id: "powai",
    name: "Clean Craft — Powai",
    status: "Active",
    owner: "Amit Verma",
    storePhone: "+91 22 4000 1203",
    ownerPhone: "+91 98200 11203",
    address: "Central Ave, Hiranandani, Powai, Mumbai 400076",
    email: "powai@cleancraft.in",
  },
  {
    id: "thane",
    name: "Clean Craft — Thane",
    status: "Onboarding",
    owner: "Priya Nair",
    storePhone: "+91 22 4000 1204",
    ownerPhone: "+91 98200 11204",
    address: "Ghodbunder Road, Thane West 400607",
    email: "thane@cleancraft.in",
  },
  {
    id: "vashi",
    name: "Clean Craft — Vashi",
    status: "Active",
    owner: "Sanjay Iyer",
    storePhone: "+91 22 4000 1205",
    ownerPhone: "+91 98200 11205",
    address: "Sector 17, Vashi, Navi Mumbai 400703",
    email: "vashi@cleancraft.in",
  },
];

type ActivityItem = { id: string; label: string; children?: ActivityItem[] };

const PRE_MARKETING: ActivityItem[] = [
  {
    id: "graphics",
    label: "Create all graphics for the new store",
    children: [
      { id: "graphics-a", label: "A. Opening Soon Banner" },
      { id: "graphics-b", label: "B. Visiting Card" },
      { id: "graphics-c", label: "C. Cake" },
      { id: "graphics-d", label: "D. Grand Opening" },
      { id: "graphics-e", label: "E. Flyer" },
      { id: "graphics-f", label: "F. Cashbook" },
    ],
  },
  { id: "ig-ads", label: "Instagram ads (Pre-marketing)" },
  { id: "influencer", label: "Influencer setup" },
  { id: "gmail", label: "Create Gmail" },
];

const POST_MARKETING: ActivityItem[] = [
  { id: "gmb-live", label: "Go live on Google My Business" },
  { id: "ig-live-post", label: "Instagram launch post" },
  { id: "meta-ads", label: "Meta ads campaign live" },
  { id: "google-ads", label: "Google Search / Local ads live" },
  { id: "influencer-visit", label: "Influencer store visits" },
  { id: "review-drive", label: "Review collection drive" },
];

function flattenIds(items: ActivityItem[]): string[] {
  return items.flatMap((i) => [i.id, ...(i.children ? flattenIds(i.children) : [])]);
}

function StoresSection() {
  const [openId, setOpenId] = useState<string | null>(INITIAL_STORES[0]?.id ?? null);
  // checks: storeId -> activityId -> ISO timestamp string
  const [checks, setChecks] = useState<Record<string, Record<string, string>>>({});

  const toggle = (storeId: string, actId: string) => {
    setChecks((prev) => {
      const store = { ...(prev[storeId] ?? {}) };
      if (store[actId]) delete store[actId];
      else store[actId] = new Date().toISOString();
      return { ...prev, [storeId]: store };
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Stores Assigned</h1>
      <p className="text-sm text-muted-foreground">
        Click a store to view details and update marketing activities.
      </p>

      <div className="space-y-3">
        {INITIAL_STORES.map((s) => {
          const isOpen = openId === s.id;
          const storeChecks = checks[s.id] ?? {};
          const allIds = [...flattenIds(PRE_MARKETING), ...flattenIds(POST_MARKETING)];
          const doneCount = allIds.filter((id) => storeChecks[id]).length;

          return (
            <Card key={s.id} className="overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : s.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {doneCount}/{allIds.length} activities complete
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                  <span className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t bg-muted/20 p-5 grid gap-6 lg:grid-cols-2">
                  {/* Left: details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Store Details
                    </h3>
                    <DetailRow label="Name of Owner" value={s.owner} />
                    <DetailRow label="Store Phone" value={s.storePhone} />
                    <DetailRow label="Owner Phone" value={s.ownerPhone} />
                    <DetailRow label="Address" value={s.address} />
                    <DetailRow label="Email" value={s.email} />
                  </div>

                  {/* Right: activities */}
                  <div className="space-y-5">
                    <ActivityList
                      title="Pre-marketing Activities"
                      items={PRE_MARKETING}
                      checks={storeChecks}
                      onToggle={(id) => toggle(s.id, id)}
                    />
                    <ActivityList
                      title="Post-opening Marketing"
                      items={POST_MARKETING}
                      checks={storeChecks}
                      onToggle={(id) => toggle(s.id, id)}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function formatStamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityList({
  title,
  items,
  checks,
  onToggle,
}: {
  title: string;
  items: ActivityItem[];
  checks: Record<string, string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </h3>
      <ol className="space-y-2 list-decimal pl-5">
        {items.map((item) => (
          <li key={item.id}>
            <ActivityRow item={item} checks={checks} onToggle={onToggle} />
            {item.children && (
              <ul className="mt-2 ml-2 space-y-1.5 border-l pl-3">
                {item.children.map((child) => (
                  <li key={child.id} className="list-none">
                    <ActivityRow item={child} checks={checks} onToggle={onToggle} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ActivityRow({
  item,
  checks,
  onToggle,
}: {
  item: ActivityItem;
  checks: Record<string, string>;
  onToggle: (id: string) => void;
}) {
  const stamp = checks[item.id];
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        checked={!!stamp}
        onCheckedChange={() => onToggle(item.id)}
        className="mt-0.5"
      />
      <div>
        <div className={`text-sm ${stamp ? "line-through text-muted-foreground" : ""}`}>
          {item.label}
        </div>
        {stamp && (
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Completed {formatStamp(stamp)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tasks by R.M. ---------------- */
type RMTaskStatus = "open" | "resolved" | "unresolved";

function RMTasksSection() {
  const initialTasks = [
    { id: "t1", title: "Prepare weekly ROAS report", due: "Today", priority: "High" },
    { id: "t2", title: "Onboard 2 new influencers", due: "Tomorrow", priority: "Medium" },
    { id: "t3", title: "Audit GMB listings for Thane", due: "Fri", priority: "High" },
    { id: "t4", title: "Reduce CPL for Store #14", due: "Next week", priority: "Low" },
  ];

  const [state, setState] = useState<
    Record<string, { status: RMTaskStatus; remark: string }>
  >(() =>
    Object.fromEntries(initialTasks.map((t) => [t.id, { status: "open", remark: "" }])),
  );

  const setStatus = (id: string, status: RMTaskStatus) =>
    setState((p) => ({ ...p, [id]: { ...p[id], status } }));

  const setRemark = (id: string, remark: string) =>
    setState((p) => ({ ...p, [id]: { ...p[id], remark } }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tasks by R.M.</h1>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {initialTasks.map((t) => {
              const s = state[t.id];
              return (
                <div key={t.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-medium text-sm">{t.title}</div>
                      <div className="text-xs text-muted-foreground">Due: {t.due}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                      <Button
                        size="sm"
                        onClick={() => setStatus(t.id, "resolved")}
                        className={
                          s.status === "resolved"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-400"
                        }
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setStatus(t.id, "unresolved")}
                        className={
                          s.status === "unresolved"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-700 dark:text-blue-400"
                        }
                      >
                        Not Resolved
                      </Button>
                    </div>
                  </div>
                  {s.status === "unresolved" && (
                    <div className="pl-1">
                      <label className="text-xs text-muted-foreground">Remarks</label>
                      <Input
                        placeholder="Why is this not resolved?"
                        value={s.remark}
                        onChange={(e) => setRemark(t.id, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                  {s.status === "resolved" && (
                    <div className="text-xs text-emerald-600 font-medium pl-1">
                      ✓ Marked resolved
                    </div>
                  )}
                </div>
              );
            })}
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

/* ---------------- Weekly Activity (Weekly view) ---------------- */
const DEFAULT_WEEKLY_ACTS: { id: string; label: string }[] = [
  { id: "inf", label: "Influencer follow-up" },
  { id: "gmb", label: "GMB follow-up" },
  { id: "gfx", label: "Send graphics to franchise" },
];

type WeekState = {
  checks: Record<string, boolean>;
  custom: { id: string; label: string }[];
};

type DailyStore = { name: string; openingDate?: string };

const INITIAL_DAILY_STORES: DailyStore[] = [
  {
    name: "Clean Craft — Andheri",
    openingDate: new Date(Date.now() - 21 * 86400000).toISOString().slice(0, 10),
  },
  {
    name: "Clean Craft — Bandra",
    openingDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
  },
  { name: "Clean Craft — Powai" },
  { name: "Clean Craft — Thane" },
  { name: "Clean Craft — Vashi" },
];

function computeCurrentWeek(openingDate?: string): number | null {
  if (!openingDate) return null;
  const d = new Date(openingDate);
  if (isNaN(d.getTime())) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 0) return null;
  return Math.min(48, Math.max(1, Math.floor(days / 7) + 1));
}

function DailyActivitySection() {
  const [stores, setStores] = useState<DailyStore[]>(INITIAL_DAILY_STORES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewWeek, setViewWeek] = useState<Record<string, number>>({});
  const [data, setData] = useState<Record<string, Record<number, WeekState>>>({});
  const [newActInput, setNewActInput] = useState<Record<string, string>>({});

  const getWeek = (store: string, w: number): WeekState =>
    data[store]?.[w] ?? { checks: {}, custom: [] };

  const setWeek = (store: string, w: number, updater: (s: WeekState) => WeekState) => {
    setData((prev) => {
      const forStore = { ...(prev[store] ?? {}) };
      forStore[w] = updater(forStore[w] ?? { checks: {}, custom: [] });
      return { ...prev, [store]: forStore };
    });
  };

  const toggle = (store: string, w: number, id: string) =>
    setWeek(store, w, (s) => ({ ...s, checks: { ...s.checks, [id]: !s.checks[id] } }));

  const addCustom = (store: string, w: number) => {
    const label = (newActInput[`${store}-${w}`] ?? "").trim();
    if (!label) return;
    const id = `c-${Date.now()}`;
    setWeek(store, w, (s) => ({ ...s, custom: [...s.custom, { id, label }] }));
    setNewActInput((p) => ({ ...p, [`${store}-${w}`]: "" }));
  };

  const setOpeningDate = (store: string, date: string) => {
    setStores((prev) =>
      prev.map((s) => (s.name === store ? { ...s, openingDate: date } : s)),
    );
  };

  // Carry-forward: unchecked items from week w-1 shown in week w (linked to prior week).
  const carriedFrom = (store: string, w: number) => {
    if (w <= 1) return [] as { id: string; label: string; fromWeek: number }[];
    const prev = getWeek(store, w - 1);
    const prevAll = [...DEFAULT_WEEKLY_ACTS, ...prev.custom];
    return prevAll
      .filter((a) => !prev.checks[a.id])
      .map((a) => ({ id: a.id, label: a.label, fromWeek: w - 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly Activity</h1>
        <p className="text-sm text-muted-foreground">
          Store weekly checklist — 48 weeks after opening. Unchecked tasks carry forward
          automatically.
        </p>
      </div>

      <div className="space-y-3">
        {stores.map((store) => {
          const isOpen = expanded === store.name;
          const currentWeek = computeCurrentWeek(store.openingDate);
          const w = viewWeek[store.name] ?? currentWeek ?? 1;
          const ws = getWeek(store.name, w);
          const carried = carriedFrom(store.name, w);
          const baseActs = [...DEFAULT_WEEKLY_ACTS, ...ws.custom];
          const doneCount = baseActs.filter((a) => ws.checks[a.id]).length;

          return (
            <Card key={store.name}>
              <button
                onClick={() => setExpanded(isOpen ? null : store.name)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-medium">{store.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {store.openingDate
                        ? `Opened ${store.openingDate} · Week ${currentWeek}/48`
                        : "Opening date not set"}
                    </div>
                  </div>
                </div>
                {currentWeek && (
                  <Badge variant="secondary">
                    W{w} · {doneCount}/{baseActs.length}
                  </Badge>
                )}
              </button>

              {isOpen && (
                <CardContent className="border-t pt-4 space-y-4">
                  {!store.openingDate ? (
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">
                          Store opening date
                        </label>
                        <Input
                          type="date"
                          onChange={(e) => setOpeningDate(store.name, e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground pb-2">
                        Set opening date to unlock the 48-week checklist.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Week selector */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={w <= 1}
                            onClick={() =>
                              setViewWeek((p) => ({ ...p, [store.name]: Math.max(1, w - 1) }))
                            }
                          >
                            ← Prev
                          </Button>
                          <div className="text-sm font-medium">
                            Week {w}{" "}
                            <span className="text-muted-foreground">
                              of 48
                              {currentWeek === w ? " · current" : ""}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={w >= 48}
                            onClick={() =>
                              setViewWeek((p) => ({
                                ...p,
                                [store.name]: Math.min(48, w + 1),
                              }))
                            }
                          >
                            Next →
                          </Button>
                        </div>
                        <select
                          className="border rounded-md text-sm px-2 py-1 bg-background"
                          value={w}
                          onChange={(e) =>
                            setViewWeek((p) => ({
                              ...p,
                              [store.name]: Number(e.target.value),
                            }))
                          }
                        >
                          {Array.from({ length: 48 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              Jump to Week {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Activities */}
                      <div className="space-y-2">
                        {baseActs.map((a) => {
                          const checked = !!ws.checks[a.id];
                          return (
                            <label
                              key={a.id}
                              className="flex items-center gap-2 text-sm cursor-pointer border rounded-md p-2 bg-muted/20"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggle(store.name, w, a.id)}
                              />
                              <span
                                className={
                                  checked ? "line-through text-muted-foreground" : ""
                                }
                              >
                                {a.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Carried forward */}
                      {carried.length > 0 && (
                        <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30 space-y-2">
                          <div className="text-xs font-medium text-amber-700 dark:text-amber-400">
                            Carried forward from Week {w - 1} ({carried.length})
                          </div>
                          {carried.map((c) => (
                            <label
                              key={`carry-${c.id}`}
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              <Checkbox
                                checked={false}
                                onCheckedChange={() =>
                                  toggle(store.name, w - 1, c.id)
                                }
                              />
                              <span>
                                {c.label}{" "}
                                <span className="text-xs text-muted-foreground">
                                  (from W{c.fromWeek})
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Add custom activity */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom activity for this week…"
                          value={newActInput[`${store.name}-${w}`] ?? ""}
                          onChange={(e) =>
                            setNewActInput((p) => ({
                              ...p,
                              [`${store.name}-${w}`]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustom(store.name, w);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => addCustom(store.name, w)}
                          className="gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
