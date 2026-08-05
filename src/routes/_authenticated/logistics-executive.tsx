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
  ClipboardCheck,
  Boxes,
  Truck,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  LogClearances,
  LogPackingTasks,
  LogDispatchPlanning,
  LogDeliveryConfirmation,
  LogIssuesReturns,
  LogPerformance,
} from "@/components/logistics/pages";
import { LogisticsDispatchPlanning } from "@/components/logistics/dispatch-planning";
import { LogisticsClearances } from "@/components/logistics/clearances";
import { LogisticsDashboard } from "@/components/logistics/dashboard";


export const Route = createFileRoute("/_authenticated/logistics-executive")({
  head: () => ({
    meta: [
      { title: "Logistics Executive Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "Logistics Executive workspace: dispatch clearances, packing tasks, dispatch planning, delivery confirmation, issues & returns and performance.",
      },
      { property: "og:title", content: "Logistics Executive Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content:
          "Move cleared shipments from packing to delivery with POD proof, issue tracking and turnaround performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LogisticsExecutiveWorkspace,
});

type SectionKey =
  | "dashboard"
  | "clearances"
  | "packing"
  | "planning"
  | "delivery"
  | "issues"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clearances", label: "Dispatch Clearances", icon: ClipboardCheck },
  { key: "packing", label: "Packing Tasks", icon: Boxes },
  { key: "planning", label: "Dispatch Planning", icon: Truck },
  { key: "delivery", label: "Delivery Confirmation", icon: PackageCheck },
  { key: "issues", label: "Issues & Returns", icon: AlertTriangle },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function LogisticsExecutiveWorkspace() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
        <div className="border-b p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Logistics Executive</div>
        </div>
        <nav className="space-y-1 p-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b bg-background p-3 md:hidden">
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
        <main className="overflow-auto p-4 md:p-6">
          {active === "dashboard" && <LogisticsDashboard onGo={(k: string) => setActive(k as SectionKey)} />}
          {active === "clearances" && <LogisticsClearances />}
          {active === "packing" && <LogPackingTasks />}
          {active === "planning" && <LogisticsDispatchPlanning />}
          {active === "delivery" && <LogDeliveryConfirmation />}
          {active === "issues" && <LogIssuesReturns />}
          {active === "performance" && <LogPerformance />}
        </main>
      </div>
    </div>
  );
}
