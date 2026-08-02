import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, ClipboardList, ListChecks, CheckSquare, CalendarDays, Boxes, BarChart3 } from "lucide-react";
import { AdminManagerWorkspace, type AdminSection } from "@/components/support-staff/admin-manager-workspace";

export const Route = createFileRoute("/_authenticated/administration-manager")({
  head: () => ({
    meta: [
      { title: "Administration Manager — Clean Craft OS" },
      {
        name: "description",
        content:
          "Administration Manager workspace to assign support staff tasks, review work, manage schedules and supplies.",
      },
      { property: "og:title", content: "Administration Manager — Clean Craft OS" },
      {
        property: "og:description",
        content: "Assign tasks, review staff work, track schedules, supplies and performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminManagerDashboard,
});

const NAV: { key: AdminSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: ClipboardList },
  { key: "assign", label: "Assign Tasks", icon: ListChecks },
  { key: "staff-tasks", label: "Staff Tasks", icon: ListChecks },
  { key: "review", label: "Review Work", icon: CheckSquare },
  { key: "schedule", label: "Work Schedule", icon: CalendarDays },
  { key: "supplies", label: "Supplies & Requests", icon: Boxes },
  { key: "performance", label: "Staff Performance", icon: BarChart3 },
];

function AdminManagerDashboard() {
  const [active, setActive] = useState<AdminSection>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full flex-col bg-muted/30 md:flex-row">
      <div className="border-b bg-background md:hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-semibold">Administration Manager</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                active === item.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
        <div className="border-b p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Support Staff</div>
          <div className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-primary" />
            Administration Manager
          </div>
        </div>
        <nav className="space-y-1 p-2">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active === item.key
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-left">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
        <AdminManagerWorkspace section={active} />
      </main>
    </div>
  );
}
