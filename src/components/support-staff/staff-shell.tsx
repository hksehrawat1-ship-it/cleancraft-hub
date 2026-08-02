import { useState } from "react";
import { Home, ListChecks, Boxes, AlertTriangle, HelpCircle } from "lucide-react";
import { ROLE_META, type StaffRole } from "./data";
import { StaffWorkspace, type StaffSection } from "./staff-workspace";
import { PackingHome } from "./packing-home";
import { PackingMyTasks } from "./packing-my-tasks";
import { PackingSupplies } from "./packing-supplies";
import { PackingReportProblem } from "./packing-report-problem";
import { PackingHelp } from "./packing-help";

import type { Lang } from "./pantry-cleaning-data";

const NAV_BASE: { key: StaffSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "tasks", label: "My Tasks", icon: ListChecks },
  { key: "supplies", label: "Supplies", icon: Boxes },
  { key: "problem", label: "Report a Problem", icon: AlertTriangle },
  { key: "help", label: "Help", icon: HelpCircle },
];

export function StaffShell({
  role,
  roles,
  title,
}: {
  role: StaffRole;
  /** When provided, the shell shows a switch between these roles (e.g. Pantry & Cleaning). */
  roles?: StaffRole[];
  title?: string;
}) {
  const [active, setActive] = useState<StaffSection>("home");
  const [current, setCurrent] = useState<StaffRole>(role);
  const [lang, setLang] = useState<Lang>("en");
  const [problemPreset, setProblemPreset] = useState<string | null>(null);
  const activeRole = roles && roles.length ? current : role;

  const meta = ROLE_META[activeRole];
  const RoleIcon = meta.icon;
  const heading = title ?? meta.label;
  const nav = NAV_BASE.map((n) =>
    n.key === "supplies" ? { ...n, label: meta.suppliesLabel } : n,
  );

  const roleSwitch =
    roles && roles.length > 1 ? (
      <div className="flex gap-2">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setCurrent(r)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeRole === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {ROLE_META[r].label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full flex-col bg-muted/30 md:flex-row">
      <div className="border-b bg-background md:hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <RoleIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-semibold">{heading}</span>
        </div>
        {roleSwitch && <div className="px-3 pb-2">{roleSwitch}</div>}
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
        <div className="space-y-2 border-b p-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Support Staff</div>
            <div className="flex items-center gap-2 font-semibold">
              <RoleIcon className="h-4 w-4 text-primary" />
              {heading}
            </div>
          </div>
          {roleSwitch}
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
        {activeRole === "packing" && active === "home" ? (
          <PackingHome lang={lang} setLang={setLang} />
        ) : activeRole === "packing" && active === "tasks" ? (
          <PackingMyTasks lang={lang} setLang={setLang} />
        ) : activeRole === "packing" && active === "supplies" ? (
          <PackingSupplies lang={lang} setLang={setLang} />
        ) : activeRole === "packing" && active === "problem" ? (
          <PackingReportProblem
            lang={lang}
            setLang={setLang}
            presetCat={problemPreset}
            onPresetHandled={() => setProblemPreset(null)}
          />
        ) : activeRole === "packing" && active === "help" ? (
          <PackingHelp
            lang={lang}
            setLang={setLang}
            onReportProblem={(catId) => {
              setProblemPreset(catId);
              setActive("problem");
            }}
          />

        ) : (
          <StaffWorkspace role={activeRole} section={active} onGo={setActive} />
        )}
      </main>
    </div>
  );
}
