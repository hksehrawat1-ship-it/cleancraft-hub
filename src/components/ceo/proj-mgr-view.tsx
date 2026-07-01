import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat, CheckCircle2, Clock, AlertTriangle, ClipboardList, MapPin, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Project = {
  name: string;
  siteApproval: number; // 0-3
  designApproval: number;
  civilWork: number;
  machineInstall: number;
  readyBy: string;
  readiness: number; // %
};

type Manager = {
  id: string;
  name: string;
  initials: string;
  assigned: number;
  completed: number;
  underExecution: number;
  delayed: number;
  projects: Project[];
};

const MANAGERS: Manager[] = [
  {
    id: "arjun",
    name: "Arjun Malhotra",
    initials: "AM",
    assigned: 18,
    completed: 12,
    underExecution: 5,
    delayed: 1,
    projects: [
      { name: "Jaipur", siteApproval: 3, designApproval: 3, civilWork: 3, machineInstall: 3, readyBy: "12 Jul 2026", readiness: 98 },
      { name: "Mumbai", siteApproval: 3, designApproval: 3, civilWork: 3, machineInstall: 2, readyBy: "22 Jul 2026", readiness: 92 },
      { name: "Delhi", siteApproval: 2, designApproval: 2, civilWork: 2, machineInstall: 1, readyBy: "05 Aug 2026", readiness: 75 },
    ],
  },
  {
    id: "vikram",
    name: "Vikram Iyer",
    initials: "VI",
    assigned: 14,
    completed: 9,
    underExecution: 4,
    delayed: 1,
    projects: [
      { name: "Indore", siteApproval: 3, designApproval: 3, civilWork: 3, machineInstall: 2, readyBy: "18 Jul 2026", readiness: 92 },
      { name: "Lucknow", siteApproval: 2, designApproval: 2, civilWork: 2, machineInstall: 1, readyBy: "10 Aug 2026", readiness: 75 },
    ],
  },
  {
    id: "sneha",
    name: "Sneha Kapoor",
    initials: "SK",
    assigned: 16,
    completed: 11,
    underExecution: 4,
    delayed: 1,
    projects: [
      { name: "Surat", siteApproval: 2, designApproval: 2, civilWork: 1, machineInstall: 1, readyBy: "25 Aug 2026", readiness: 61 },
      { name: "Ahmedabad", siteApproval: 3, designApproval: 3, civilWork: 2, machineInstall: 2, readyBy: "30 Jul 2026", readiness: 88 },
    ],
  },
  {
    id: "rohit",
    name: "Rohit Deshmukh",
    initials: "RD",
    assigned: 12,
    completed: 8,
    underExecution: 3,
    delayed: 1,
    projects: [
      { name: "Pune", siteApproval: 3, designApproval: 2, civilWork: 2, machineInstall: 1, readyBy: "15 Aug 2026", readiness: 78 },
      { name: "Nagpur", siteApproval: 2, designApproval: 2, civilWork: 2, machineInstall: 2, readyBy: "28 Jul 2026", readiness: 85 },
    ],
  },
  {
    id: "meera",
    name: "Meera Joshi",
    initials: "MJ",
    assigned: 10,
    completed: 6,
    underExecution: 3,
    delayed: 1,
    projects: [
      { name: "Kochi", siteApproval: 3, designApproval: 3, civilWork: 2, machineInstall: 1, readyBy: "20 Aug 2026", readiness: 80 },
      { name: "Chennai", siteApproval: 2, designApproval: 1, civilWork: 1, machineInstall: 0, readyBy: "10 Sep 2026", readiness: 55 },
    ],
  },
];

const PARAMS: { key: keyof Pick<Project, "siteApproval" | "designApproval" | "civilWork" | "machineInstall">; label: string }[] = [
  { key: "siteApproval", label: "Site Approval" },
  { key: "designApproval", label: "Design Approval" },
  { key: "civilWork", label: "Civil Work" },
  { key: "machineInstall", label: "Machine Installation" },
];

function scoreColor(pct: number) {
  if (pct >= 90) return "bg-emerald-500";
  if (pct >= 75) return "bg-sky-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function ProjectManagerCeoView() {
  const [selected, setSelected] = useState<string>(MANAGERS[0].id);
  const mgr = MANAGERS.find((m) => m.id === selected)!;

  const tracker = [
    { label: "Assigned Projects", value: mgr.assigned, icon: ClipboardList, tone: "text-primary" },
    { label: "Completed", value: mgr.completed, icon: CheckCircle2, tone: "text-emerald-500" },
    { label: "Under Execution", value: mgr.underExecution, icon: Clock, tone: "text-sky-500" },
    { label: "Delayed", value: mgr.delayed, icon: AlertTriangle, tone: "text-red-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HardHat className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Project Manager Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            Select a project manager to view their active projects and store readiness.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {MANAGERS.map((m) => {
          const active = m.id === selected;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`text-left border rounded-lg p-3 transition-colors ${
                active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.assigned} projects</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Active Projects — {mgr.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tracker.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="border rounded-md p-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${t.tone}`} />
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t.label}
                    </div>
                  </div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">{t.value}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            Store Readiness Score
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Parameters scored 0–3. Store Ready By date is set by the project manager.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {mgr.projects.map((p) => (
            <div key={p.name} className="border rounded-lg p-3 bg-muted/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div className="font-medium">{p.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    Ready by <span className="font-medium text-foreground">{p.readyBy}</span>
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{p.readiness}%</div>
                </div>
              </div>
              <div>
                <Progress value={p.readiness} className="h-2" />
                <div className={`h-0.5 mt-0 ${scoreColor(p.readiness)} rounded-full`} style={{ width: `${p.readiness}%` }} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PARAMS.map((param) => {
                  const val = p[param.key];
                  return (
                    <div key={param.key} className="border rounded-md p-2 bg-background">
                      <div className="text-[11px] text-muted-foreground">{param.label}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-lg font-semibold tabular-nums">{val}</div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              className={`w-2 h-2 rounded-full ${
                                n <= val ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
