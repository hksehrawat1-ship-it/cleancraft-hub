import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  CheckCircle2,
  Users,
  Boxes,
  TrendingUp,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeDashboard } from "@/components/logistics-executive/dashboard";
import { LeDispatchPlan } from "@/components/logistics-executive/dispatch-plan";
import { LeInTransit } from "@/components/logistics-executive/in-transit";
import { LeDeliveryConfirmation } from "@/components/logistics-executive/delivery-confirmation";
import { LePackingStaff } from "@/components/logistics-executive/packing-staff";
import { LeSupplies } from "@/components/logistics-executive/supplies";
import { LePerformance } from "@/components/logistics-executive/performance";

export const Route = createFileRoute("/_authenticated/logistics-executive")({
  head: () => ({
    meta: [
      { title: "Logistics Executive Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "Logistics Executive workspace for dispatch planning, in-transit tracking, delivery confirmation, packing staff oversight and performance.",
      },
      { property: "og:title", content: "Logistics Executive Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content:
          "Manage dispatches, packing staff, deliveries and supply inventory from one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LogisticsExecutiveWorkspace,
});

type SectionKey =
  | "dashboard"
  | "dispatch"
  | "in-transit"
  | "delivery"
  | "packing"
  | "supplies"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "dispatch", label: "Dispatch Plan", icon: Truck },
  { key: "in-transit", label: "In-Transit Shipments", icon: MapPin },
  { key: "delivery", label: "Delivery Confirmation", icon: CheckCircle2 },
  { key: "packing", label: "Packing Staff Oversight", icon: Users },
  { key: "supplies", label: "Supplies & Inventory", icon: Boxes },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function LogisticsExecutiveWorkspace() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Logistics Executive</div>
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
                <Icon className="h-4 w-4 shrink-0" />
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
          {active === "dashboard" && <LeDashboard />}
          {active === "dispatch" && <LeDispatchPlan />}
          {active === "in-transit" && <LeInTransit />}
          {active === "delivery" && <LeDeliveryConfirmation />}
          {active === "packing" && <LePackingStaff />}
          {active === "supplies" && <LeSupplies />}
          {active === "performance" && <LePerformance />}
        </main>
      </div>
    </div>
  );
}
