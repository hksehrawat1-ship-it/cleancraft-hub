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
  Ticket,
  ListChecks,
  MonitorSmartphone,
  Bug,
  Rocket,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { DevDashboard } from "@/components/developer/dashboard";
import { DevDocs, DevPerformance } from "@/components/developer/pages";
import { DevBugs } from "@/components/developer/bugs";
import { DevReleases } from "@/components/developer/releases";
import { DevTickets } from "@/components/developer/tickets";
import { DevProjectTasks } from "@/components/developer/project-tasks";
import { DevStorePos } from "@/components/developer/store-pos";

export const Route = createFileRoute("/_authenticated/developer")({
  head: () => ({
    meta: [
      { title: "Developer Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "Developer workspace: tickets, project tasks, store and POS setup, bugs and testing, releases, documentation and performance.",
      },
      { property: "og:title", content: "Developer Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content: "Track development tickets, store POS setups, bugs, releases and performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeveloperWorkspace,
});

type SectionKey =
  | "dashboard"
  | "tickets"
  | "tasks"
  | "store"
  | "bugs"
  | "releases"
  | "docs"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tickets", label: "My Tickets", icon: Ticket },
  { key: "tasks", label: "Project Tasks", icon: ListChecks },
  { key: "store", label: "Store & POS Setup", icon: MonitorSmartphone },
  { key: "bugs", label: "Bugs & Testing", icon: Bug },
  { key: "releases", label: "Releases & Updates", icon: Rocket },
  { key: "docs", label: "Knowledge & Documentation", icon: BookOpen },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function DeveloperWorkspace() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Developer</div>
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
          {active === "dashboard" && <DevDashboard />}
          {active === "tickets" && <DevTickets />}
          {active === "tasks" && <DevProjectTasks />}
          {active === "store" && <DevStorePos />}
          {active === "bugs" && <DevBugs />}
          {active === "releases" && <DevReleases />}
          {active === "docs" && <DevDocs />}
          {active === "performance" && <DevPerformance />}
        </main>
      </div>
    </div>
  );
}
