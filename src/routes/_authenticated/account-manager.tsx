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
  Receipt,
  PhoneCall,
  Truck,
  MonitorSmartphone,
  TrendingUp,
} from "lucide-react";
import {
  AmDashboard,
  AmPaymentRequests,
  AmFollowups,
  AmDispatchClearance,
  AmBillingPos,
  AmPerformance,
} from "@/components/account-manager/pages";

export const Route = createFileRoute("/_authenticated/account-manager")({
  head: () => ({
    meta: [
      { title: "Account Manager Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "Account Manager workspace: project payment requests, follow-ups and verification, dispatch clearance, billing POS and performance.",
      },
      { property: "og:title", content: "Account Manager Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content: "Track payment requests, collections, dispatch clearance and account performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountManagerWorkspace,
});

type SectionKey = "dashboard" | "requests" | "followups" | "dispatch" | "billing" | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "requests", label: "Project Payment Requests", icon: Receipt },
  { key: "followups", label: "Payment Follow-ups & Verification", icon: PhoneCall },
  { key: "dispatch", label: "Dispatch Clearance", icon: Truck },
  { key: "billing", label: "Billing POS (Phase 2)", icon: MonitorSmartphone },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function AccountManagerWorkspace() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Account Manager</div>
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
          {active === "dashboard" && <AmDashboard />}
          {active === "requests" && <AmPaymentRequests />}
          {active === "followups" && <AmFollowups />}
          {active === "dispatch" && <AmDispatchClearance />}
          {active === "billing" && <AmBillingPos />}
          {active === "performance" && <AmPerformance />}
        </main>
      </div>
    </div>
  );
}
