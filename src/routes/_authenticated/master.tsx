import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  Megaphone,
  Video,
  Briefcase,
  UserCheck,
  ClipboardList,
  HardHat,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  Tent,
  MessageSquare,
  Cpu,
  Calculator,
  Truck,
  Package,
  Building2,
  Crown,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/master")({
  head: () => ({ meta: [{ title: "Clean Craft Master Dashboard" }] }),
  component: MasterDashboard,
});

type Item = { key: string; label: string; icon: LucideIcon; blurb: string };
type Group = { key: string; label: string; icon: LucideIcon; items: Item[] };

const GROUPS: Group[] = [
  {
    key: "revenue",
    label: "Revenue Engine",
    icon: TrendingUp,
    items: [
      { key: "smm", label: "Social Media Account Manager", icon: Megaphone, blurb: "Content calendar, reach, engagement, lead generation from organic social." },
      { key: "video", label: "Video Editor", icon: Video, blurb: "Edit pipeline, deliverables, turnaround time, asset library." },
      { key: "sales-head", label: "Sales Head", icon: Briefcase, blurb: "Team pipeline, conversion %, revenue forecast, coaching notes." },
      { key: "sales-exec", label: "Sales Executive", icon: UserCheck, blurb: "Personal leads, follow-ups, bookings, win rate vs target." },
    ],
  },
  {
    key: "ops",
    label: "Operation Engine",
    icon: ClipboardList,
    items: [
      { key: "proj-coord", label: "Project Coordinator", icon: ClipboardList, blurb: "Project intake, scheduling, vendor coordination, status reports." },
      { key: "proj-mgr", label: "Project Manager", icon: HardHat, blurb: "Active sites, milestones, risk log, on-time delivery rate." },
      { key: "tnl", label: "Trainer & Launch Executive", icon: GraduationCap, blurb: "Launch plan, training completion, store readiness checklist." },
    ],
  },
  {
    key: "store-success",
    label: "Store Success Engine",
    icon: HeartHandshake,
    items: [
      { key: "rm", label: "Relationship Manager", icon: HeartHandshake, blurb: "Store health, NPS, escalations, monthly review notes." },
      { key: "perf-mkt", label: "Performance Marketing Executive", icon: TrendingUp, blurb: "Ad spend, CAC, ROAS, campaign performance by store." },
      { key: "btl", label: "BTL Executive", icon: Tent, blurb: "Activations, footfall generated, cost per lead, geo coverage." },
      { key: "crm", label: "CRM Executive", icon: MessageSquare, blurb: "Retention cohorts, repeat rate, win-back campaigns, churn signals." },
    ],
  },
  {
    key: "tech",
    label: "Tech Engine",
    icon: Cpu,
    items: [
      { key: "engineer", label: "Engineer", icon: Cpu, blurb: "Sprint board, uptime, incidents, release notes." },
    ],
  },
  {
    key: "accounts",
    label: "Accounts",
    icon: Calculator,
    items: [
      { key: "accountant", label: "Accountant", icon: Calculator, blurb: "P&L snapshot, receivables, payables, cash position." },
    ],
  },
  {
    key: "supply",
    label: "Supply Chain & Logistics",
    icon: Truck,
    items: [
      { key: "logistics", label: "Logistic Executive", icon: Truck, blurb: "Dispatches, in-transit, delivery SLA, freight cost." },
      { key: "packing", label: "Packing Boy", icon: Package, blurb: "Daily packed units, defects, pending orders, productivity." },
    ],
  },
  {
    key: "facility",
    label: "Facility",
    icon: Building2,
    items: [
      { key: "facility-exec", label: "Facility Executive", icon: Building2, blurb: "Maintenance log, utilities, vendor AMC status, compliance." },
    ],
  },
];

function MasterDashboard() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUPS.map((g) => [g.key, true])),
  );
  const [selected, setSelected] = useState<{ group: string; item: string } | null>(null);

  const current = (() => {
    if (!selected) return null;
    const g = GROUPS.find((x) => x.key === selected.group);
    const i = g?.items.find((x) => x.key === selected.item);
    return g && i ? { g, i } : null;
  })();

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-4 border-b bg-muted/40 flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <div>
            <div className="font-semibold text-sm leading-tight">Master Dashboard</div>
            <div className="text-[11px] text-muted-foreground">CEO control room</div>
          </div>
        </div>
        <nav className="p-2 space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {GROUPS.map((g, idx) => {
            const open = openGroups[g.key];
            const GIcon = g.icon;
            return (
              <div key={g.key}>
                <button
                  type="button"
                  onClick={() => setOpenGroups((s) => ({ ...s, [g.key]: !s[g.key] }))}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-sm font-medium hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground tabular-nums text-xs w-4">{idx + 1}.</span>
                    <GIcon className="w-4 h-4" />
                    {g.label}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", open ? "rotate-0" : "-rotate-90")} />
                </button>
                {open && (
                  <ul className="mt-0.5 mb-1 ml-6 border-l pl-2 space-y-0.5">
                    {g.items.map((it) => {
                      const Icon = it.icon;
                      const active = selected?.group === g.key && selected.item === it.key;
                      return (
                        <li key={it.key}>
                          <button
                            type="button"
                            onClick={() => setSelected({ group: g.key, item: it.key })}
                            className={cn(
                              "w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors",
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="truncate">{it.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <section className="flex-1 min-w-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clean Craft Master Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Pick a function on the left to drill into that role's metrics.
          </p>
        </div>

        {!current ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {GROUPS.map((g) => {
              const GIcon = g.icon;
              return (
                <Card key={g.key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GIcon className="w-4 h-4 text-primary" />
                      {g.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {g.items.map((it) => (
                      <button
                        key={it.key}
                        onClick={() => setSelected({ group: g.key, item: it.key })}
                        className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted/60 flex items-center gap-2"
                      >
                        <it.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        {it.label}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <current.i.icon className="w-5 h-5 text-primary" />
                {current.i.label}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{current.g.label}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{current.i.blurb}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["KPI 1", "KPI 2", "KPI 3", "KPI 4"].map((k) => (
                  <div key={k} className="border rounded-md p-3 bg-muted/30">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
                    <div className="text-2xl font-semibold mt-1">—</div>
                  </div>
                ))}
              </div>
              <div className="border rounded-md p-4 text-sm text-muted-foreground bg-muted/20">
                Detailed dashboard for <b className="text-foreground">{current.i.label}</b> goes here.
                Hook this up to the relevant tables and charts next.
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
