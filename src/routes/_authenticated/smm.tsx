import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  ListChecks,
  CheckSquare,
  CalendarDays,
  AtSign,
  Users,
  BarChart3,
  FolderOpen,
  TrendingUp,
  AlertTriangle,
  Megaphone,
} from "lucide-react";
import { SmmContentQueuePage } from "@/components/smm/content-queue";
import { SmmReviewPage } from "@/components/smm/review-approval";
import { SmmCalendarPage } from "@/components/smm/calendar";
import { SmmAccountsPage } from "@/components/smm/accounts";
import { SmmLeadsPage } from "@/components/smm/leads";
import { SmmAnalyticsPage } from "@/components/smm/analytics";
import { SmmTasksResourcesPage } from "@/components/smm/tasks-resources";
import { SmmPerformancePage } from "@/components/smm/performance";
import { SectionHead } from "@/components/smm/ui";
import { CONTENT_QUEUE, SOCIAL_LEADS, APPROVALS } from "@/components/smm/data";

export const Route = createFileRoute("/_authenticated/smm")({
  head: () => ({
    meta: [
      { title: "Social Media Manager Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "Social Media Account Manager workspace: content queue, approvals, publishing calendar, accounts, leads, analytics and performance.",
      },
      { property: "og:title", content: "Social Media Manager Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content: "Plan, approve, publish and measure social content and leads for Clean Craft.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SmmDashboard,
});

type SectionKey =
  | "dashboard"
  | "queue"
  | "review"
  | "calendar"
  | "accounts"
  | "leads"
  | "analytics"
  | "tasks"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "queue", label: "Content Queue", icon: ListChecks },
  { key: "review", label: "Review & Approval", icon: CheckSquare },
  { key: "calendar", label: "Publishing Calendar", icon: CalendarDays },
  { key: "accounts", label: "Social Accounts", icon: AtSign },
  { key: "leads", label: "Leads & Handover", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "tasks", label: "Tasks & Resources", icon: FolderOpen },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function SmmDashboard() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Social Media Manager</div>
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
          {active === "dashboard" && <DashboardSection />}
          {active === "queue" && <SmmContentQueuePage />}
          {active === "review" && <SmmReviewPage />}
          {active === "calendar" && <SmmCalendarPage />}
          {active === "accounts" && <SmmAccountsPage />}
          {active === "leads" && <SmmLeadsPage />}
          {active === "analytics" && <SmmAnalyticsPage />}
          {active === "tasks" && <SmmTasksResourcesPage />}
          {active === "performance" && <SmmPerformancePage />}
        </main>
      </div>
    </div>
  );
}

function DashboardSection() {
  const inProduction = CONTENT_QUEUE.filter((c) =>
    ["Script", "Design", "Editing"].includes(c.stage),
  ).length;
  const pendingApproval = APPROVALS.filter((a) => a.status === "Pending").length;
  const newLeads = SOCIAL_LEADS.filter((l) => l.status === "New").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-primary" />
        <SectionHead title="Dashboard" sub="Your content engine at a glance — today." />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Planned This Week", v: "12", s: "11 published" },
          { l: "In Production", v: String(inProduction), s: "Script / Design / Editing" },
          { l: "Pending Approval", v: String(pendingApproval), s: "Waiting on leadership" },
          { l: "Leads to Hand Over", v: String(newLeads), s: "From DMs & comments" },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.l}</div>
              <div className="text-3xl font-bold tabular-nums mt-1">{k.v}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{k.s}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Calendar completion — this week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">Planned</div>
              <div className="text-2xl font-bold tabular-nums">12</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">Published</div>
              <div className="text-2xl font-bold tabular-nums">11</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">Completion</div>
              <div className="text-2xl font-bold tabular-nums text-emerald-600">92%</div>
            </div>
          </div>
          <Progress value={92} className="h-2 mt-3" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Today's focus</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { t: "Jaipur owner reel stuck in editing since 2 days", tone: "text-destructive" },
              { t: `${pendingApproval} items waiting for CEO / Sales Head approval`, tone: "text-amber-600" },
              { t: `${newLeads} new leads not yet handed to sales`, tone: "text-amber-600" },
              { t: "2 open slots in this week's calendar", tone: "text-muted-foreground" },
            ].map((r) => (
              <div key={r.t} className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`h-4 w-4 ${r.tone}`} />
                <span>{r.t}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Content produced this week</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Reels", v: 8 },
                { l: "Carousels", v: 3 },
                { l: "Posts", v: 2 },
                { l: "Stories", v: 14 },
              ].map((p) => (
                <div key={p.l} className="border rounded-md p-3 bg-muted/20">
                  <div className="text-xs text-muted-foreground">{p.l}</div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">{p.v}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">Instagram 42 leads</Badge>
              <Badge variant="outline">YouTube 18 leads</Badge>
              <Badge variant="outline">Facebook 7 leads</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
