import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { SmmContentQueuePage } from "@/components/smm/content-queue";
import { SmmReviewPage } from "@/components/smm/review-approval";
import { SmmCalendarPage } from "@/components/smm/calendar";
import { SmmAccountsPage } from "@/components/smm/accounts";
import { SmmLeadsPage } from "@/components/smm/leads";
import { SmmAnalyticsPage } from "@/components/smm/analytics";
import { SmmTasksResourcesPage } from "@/components/smm/tasks-resources";
import { SmmPerformancePage } from "@/components/smm/performance";
import { SmmManagerDashboard } from "@/components/smm/manager-dashboard";

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
          {active === "dashboard" && <SmmManagerDashboard onNavigate={(k) => setActive(k as SectionKey)} />}
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
