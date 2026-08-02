import { useState } from "react";
import { Home, ListChecks, Boxes, AlertTriangle, HelpCircle } from "lucide-react";
import { ROLE_META, type StaffRole } from "./data";
import { StaffWorkspace, type StaffSection } from "./staff-workspace";

const NAV_BASE: { key: StaffSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "tasks", label: "My Tasks", icon: ListChecks },
  { key: "supplies", label: "Supplies", icon: Boxes },
  { key: "problem", label: "Report a Problem", icon: AlertTriangle },
  { key: "help", label: "Help", icon: HelpCircle },
];

export function StaffShell({ role }: { role: StaffRole }) {
  const [active, setActive] = useState<StaffSection>("home");
  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;
  const nav = NAV_BASE.map((n) =>
    n.key === "supplies" ? { ...n, label: meta.suppliesLabel } : n,
  );

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full flex-col bg-muted/30 md:flex-row">
      <div className="border-b bg-background md:hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <RoleIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-semibold">{meta.label}</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-2">
          {nav.map((item) => (
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
            <RoleIcon className="h-4 w-4 text-primary" />
            {meta.label}
          </div>
        </div>
        <nav className="space-y-1 p-2">
          {nav.map((item) => (
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
        <StaffWorkspace role={role} section={active} onGo={setActive} />
      </main>
    </div>
  );
}
