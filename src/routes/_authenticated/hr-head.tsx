import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FileCheck2,
  CalendarClock,
  TrendingUp,
  FileWarning,
  ShieldCheck,
  BarChart3,
  Settings2,
  Search,
  Check,
  X,
  Download,
  Send,
  Clock,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import {
  CANDIDATES,
  DEPTS,
  DOC_LIST,
  EMPLOYEES,
  LEAVES,
  LETTERS,
  LETTER_KINDS,
  OPENINGS,
  POLICIES,
  TRAININGS,
  type Dept,
  type Employee,
  type LeaveReq,
  type Letter,
  type LetterKind,
} from "@/components/hr-head/data";
import { HrHeadDashboardHome } from "@/components/hr-head/dashboard";
import { HrRecruitment } from "@/components/hr-head/recruitment";
import { HrEmployees } from "@/components/hr-head/employees";
import { HrOnboarding } from "@/components/hr-head/onboarding";
import { HrAttendance } from "@/components/hr-head/attendance";


export const Route = createFileRoute("/_authenticated/hr-head")({
  head: () => ({
    meta: [
      { title: "HR Head Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "HR Head workspace: recruitment, employees, onboarding, attendance, performance, letters, user access and CEO reports.",
      },
      { property: "og:title", content: "HR Head Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content:
          "Run hiring, people operations, attendance, discipline and HR policy for Clean Craft from one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HrHeadDashboard,
});

type SectionKey =
  | "dashboard"
  | "recruitment"
  | "employees"
  | "onboarding"
  | "attendance"
  | "performance"
  | "letters"
  | "access"
  | "reports"
  | "policies";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "recruitment", label: "Recruitment", icon: UserPlus },
  { key: "employees", label: "Employees", icon: Users },
  { key: "onboarding", label: "Onboarding & Documents", icon: FileCheck2 },
  { key: "attendance", label: "Attendance & Leave", icon: CalendarClock },
  { key: "performance", label: "Performance & Training", icon: TrendingUp },
  { key: "letters", label: "Letters, Notices & Warnings", icon: FileWarning },
  { key: "access", label: "User Access", icon: ShieldCheck },
  { key: "reports", label: "Reports to CEO", icon: BarChart3 },
  { key: "policies", label: "HR Policies & Settings", icon: Settings2 },
];

function HrHeadDashboard() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
        <div className="border-b p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">HR Head</div>
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
                <Icon className="h-4 w-4" />
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
          {active === "dashboard" && <HrHeadDashboardHome onGo={setActive} />}
          {active === "recruitment" && <HrRecruitment />}
          {active === "employees" && <HrEmployees />}
          {active === "onboarding" && <HrOnboarding />}
          {active === "attendance" && <HrAttendance />}
          {active === "performance" && <HrPerformanceTraining />}
          {active === "letters" && <LettersSection />}
          {active === "access" && <AccessSection />}
          {active === "reports" && <ReportsSection />}
          {active === "policies" && <PoliciesSection />}
        </main>
      </div>
    </div>
  );
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function Kpi({ k, v, hint }: { k: string; v: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{v}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

/* ---------------- Dashboard ---------------- */
function DashboardSection({ onGo }: { onGo: (k: SectionKey) => void }) {
  const active = EMPLOYEES.filter((e) => e.status !== "Exited");
  const openRoles = OPENINGS.reduce((s, o) => s + o.openings, 0);
  const avgAtt = Math.round(active.reduce((s, e) => s + e.attendance, 0) / active.length);
  const pendingLeaves = LEAVES.filter((l) => l.status === "Pending").length;
  const docsPending = EMPLOYEES.filter((e) => e.docsDone < e.docsTotal).length;

  const alerts = [
    { text: "Field Engineer role open for 26 days — hiring delayed", go: "recruitment" as SectionKey },
    { text: `${docsPending} employees have incomplete joining documents`, go: "onboarding" as SectionKey },
    { text: `${pendingLeaves} leave requests waiting for approval`, go: "attendance" as SectionKey },
    { text: "Vikas Yadav probation review due — confirmation letter in draft", go: "letters" as SectionKey },
  ];

  return (
    <div className="space-y-5">
      <Head title="HR Head Dashboard" sub="People, hiring, discipline and compliance at a glance." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi k="Total Employees" v={active.length} hint="Across 8 departments" />
        <Kpi k="Open Positions" v={openRoles} hint={`${OPENINGS.length} active requisitions`} />
        <Kpi k="Attendance (Avg)" v={`${avgAtt}%`} hint="Last 30 days" />
        <Kpi k="Attrition (30d)" v="2" hint="1 exit + 1 on notice" />
        <Kpi k="Pending Leaves" v={pendingLeaves} hint="Awaiting HR approval" />
        <Kpi k="Docs Pending" v={docsPending} hint="Onboarding incomplete" />
        <Kpi k="On Probation" v={EMPLOYEES.filter((e) => e.status === "Probation").length} hint="Review before confirmation" />
        <Kpi k="Trainings This Month" v={TRAININGS.length} hint="1 running, 2 planned" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Needs Your Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <button
                key={a.text}
                onClick={() => onGo(a.go)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted"
              >
                <span>{a.text}</span>
                <Badge variant="outline">Open</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Headcount by Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEPTS.map((d) => {
              const n = active.filter((e) => e.dept === d).length;
              return (
                <div key={d} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{d}</span>
                    <span className="tabular-nums text-muted-foreground">{n}</span>
                  </div>
                  <Progress value={(n / active.length) * 100} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Recruitment ---------------- */
function RecruitmentSection() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const cands = CANDIDATES.filter(
    (c) =>
      (stage === "all" || c.stage === stage) &&
      `${c.name} ${c.role}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <Head title="Recruitment" sub="Open requisitions, candidate pipeline and hiring speed." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Kpi k="Requisitions" v={OPENINGS.length} />
        <Kpi k="Positions Open" v={OPENINGS.reduce((s, o) => s + o.openings, 0)} />
        <Kpi k="In Interview" v={CANDIDATES.filter((c) => c.stage === "Interview").length} />
        <Kpi k="Offers Pending" v={CANDIDATES.filter((c) => c.stage === "Offer").length} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Open Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {OPENINGS.map((o) => (
            <div key={o.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">
                    {o.role} · {o.openings} {o.openings > 1 ? "posts" : "post"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.dept} · {o.location} · open {o.ageDays} days
                  </div>
                </div>
                <Badge variant={o.priority === "High" ? "destructive" : o.priority === "Medium" ? "default" : "secondary"}>
                  {o.priority}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
                {[
                  ["Applied", o.applied],
                  ["Screened", o.screened],
                  ["Interview", o.interviewed],
                  ["Offered", o.offered],
                  ["Joined", o.joined],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-md bg-muted/60 p-2">
                    <div className="text-base font-semibold tabular-nums">{v as number}</div>
                    <div className="text-muted-foreground">{l as string}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search candidate or role" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {["Applied", "Screening", "Interview", "Offer", "Joined", "Rejected"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {cands.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  {c.role} · {c.source} · {c.next}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={c.stage === "Rejected" ? "secondary" : c.stage === "Joined" ? "default" : "outline"}>
                  {c.stage}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Interview scheduled for ${c.name}`)}>
                  Schedule
                </Button>
              </div>
            </div>
          ))}
          {!cands.length && <p className="text-sm text-muted-foreground">No candidates match this filter.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Employees ---------------- */
function EmployeesSection() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [view, setView] = useState<Employee | null>(null);

  const rows = EMPLOYEES.filter(
    (e) =>
      (dept === "all" || e.dept === dept) &&
      `${e.name} ${e.role} ${e.id}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <Head title="Employees" sub="Full directory with department, role and status." />
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search name, role or ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((e) => (
          <Card key={e.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.role} · {e.dept} · {e.id}
                  </div>
                </div>
                <Badge
                  variant={
                    e.status === "Active" ? "default" : e.status === "Probation" ? "outline" : "destructive"
                  }
                >
                  {e.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-muted/60 p-2">
                  <div className="text-sm font-semibold">{e.attendance}%</div>
                  <div className="text-muted-foreground">Attendance</div>
                </div>
                <div className="rounded-md bg-muted/60 p-2">
                  <div className="text-sm font-semibold">{e.rating}</div>
                  <div className="text-muted-foreground">Rating</div>
                </div>
                <div className="rounded-md bg-muted/60 p-2">
                  <div className="text-sm font-semibold">
                    {e.docsDone}/{e.docsTotal}
                  </div>
                  <div className="text-muted-foreground">Docs</div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setView(e)}>
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {!rows.length && <p className="text-sm text-muted-foreground">No employees match this filter.</p>}

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          {view && (
            <>
              <DialogHeader>
                <DialogTitle>{view.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                {[
                  ["Employee ID", view.id],
                  ["Role", view.role],
                  ["Department", view.dept],
                  ["Email", view.email],
                  ["Phone", view.phone],
                  ["Date of Joining", view.doj],
                  ["Status", view.status],
                  ["Leave Balance", `${view.leaveBalance} days`],
                  ["Login Access", view.access],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-3 border-b py-1">
                    <span className="text-muted-foreground">{k as string}</span>
                    <span className="font-medium">{v as string}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Onboarding & Documents ---------------- */
function OnboardingSection() {
  const [docs, setDocs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    EMPLOYEES.forEach((e) =>
      DOC_LIST.forEach((d, i) => {
        init[`${e.id}-${d}`] = i < e.docsDone;
      }),
    );
    return init;
  });
  const pending = EMPLOYEES.filter((e) => DOC_LIST.some((d) => !docs[`${e.id}-${d}`]));

  return (
    <div className="space-y-5">
      <Head title="Onboarding & Documents" sub="Joining checklist and document collection status." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi k="Joined This Month" v="3" />
        <Kpi k="Docs Incomplete" v={pending.length} />
        <Kpi k="Fully Onboarded" v={EMPLOYEES.length - pending.length} />
      </div>

      {EMPLOYEES.filter((e) => e.status !== "Exited").map((e) => {
        const done = DOC_LIST.filter((d) => docs[`${e.id}-${d}`]).length;
        return (
          <Card key={e.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span>
                  {e.name} <span className="text-xs font-normal text-muted-foreground">· {e.role}</span>
                </span>
                <Badge variant={done === DOC_LIST.length ? "default" : "destructive"}>
                  {done}/{DOC_LIST.length} documents
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {DOC_LIST.map((d) => {
                const key = `${e.id}-${d}`;
                const ok = docs[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setDocs((p) => ({ ...p, [key]: !p[key] }));
                      toast.success(`${d} marked ${ok ? "pending" : "received"} for ${e.name}`);
                    }}
                    className={`flex items-center justify-between gap-2 rounded-md border p-2 text-sm ${
                      ok ? "border-primary/40 bg-primary/5" : ""
                    }`}
                  >
                    <span>{d}</span>
                    {ok ? <Check className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Attendance & Leave ---------------- */
function AttendanceSection() {
  const [leaves, setLeaves] = useState<LeaveReq[]>(LEAVES);
  const decide = (id: string, status: "Approved" | "Rejected") => {
    setLeaves((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success(`Leave ${id} ${status.toLowerCase()}`);
  };

  return (
    <div className="space-y-5">
      <Head title="Attendance & Leave" sub="Daily attendance summary and leave approvals." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Kpi k="Present Today" v="10" />
        <Kpi k="On Leave" v="1" />
        <Kpi k="Late Marks (Month)" v="7" />
        <Kpi k="Absent Today" v="1" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaves.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <div className="font-medium">
                  {l.emp} <span className="text-xs text-muted-foreground">· {l.dept}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {l.type} leave · {l.from} – {l.to} · {l.days} day(s) · {l.reason}
                </div>
              </div>
              {l.status === "Pending" ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide(l.id, "Approved")}>
                    <Check className="mr-1 h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide(l.id, "Rejected")}>
                    <X className="mr-1 h-4 w-4" /> Reject
                  </Button>
                </div>
              ) : (
                <Badge variant={l.status === "Approved" ? "default" : "secondary"}>{l.status}</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Attendance by Employee (30 days)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {EMPLOYEES.map((e) => (
            <div key={e.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>
                  {e.name} <span className="text-xs text-muted-foreground">· {e.dept}</span>
                </span>
                <span className="tabular-nums">{e.attendance}%</span>
              </div>
              <Progress value={e.attendance} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Performance & Training ---------------- */
function PerformanceSection() {
  const top = [...EMPLOYEES].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const low = [...EMPLOYEES].sort((a, b) => a.rating - b.rating).slice(0, 3);

  return (
    <div className="space-y-5">
      <Head title="Performance & Training" sub="Appraisal ratings, probation reviews and training calendar." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Kpi k="Avg Rating" v={(EMPLOYEES.reduce((s, e) => s + e.rating, 0) / EMPLOYEES.length).toFixed(1)} />
        <Kpi k="Reviews Due" v="4" hint="Probation + half-yearly" />
        <Kpi k="Trainings Planned" v={TRAININGS.filter((t) => t.status === "Planned").length} />
        <Kpi k="Needs Improvement" v={EMPLOYEES.filter((e) => e.rating < 4).length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {top.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>
                  {e.name} <span className="text-xs text-muted-foreground">· {e.role}</span>
                </span>
                <Badge>{e.rating}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Needs Coaching</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {low.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>
                  {e.name} <span className="text-xs text-muted-foreground">· {e.role}</span>
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{e.rating}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Training assigned to ${e.name}`)}>
                    Assign Training
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4 text-primary" /> Training Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TRAININGS.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">
                  {t.dept} · Trainer {t.trainer} · {t.date} · {t.enrolled}/{t.seats} seats
                </div>
              </div>
              <Badge variant={t.status === "Completed" ? "secondary" : t.status === "Running" ? "default" : "outline"}>
                {t.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Letters, Notices & Warnings ---------------- */
function LettersSection() {
  const [letters, setLetters] = useState<Letter[]>(LETTERS);
  const [kind, setKind] = useState<LetterKind>("Warning Letter");
  const [emp, setEmp] = useState<string>(EMPLOYEES[0].name);
  const [reason, setReason] = useState("");

  const issue = () => {
    if (!reason.trim()) return toast.error("Add a reason before issuing");
    const id = `LT-${75 + letters.length}`;
    setLetters((p) => [
      { id, kind, emp, date: "02 Aug 2026", reason: reason.trim(), status: "Issued" },
      ...p,
    ]);
    setReason("");
    toast.success(`${kind} issued to ${emp}`);
  };

  return (
    <div className="space-y-5">
      <Head title="Letters, Notices & Warnings" sub="Issue and track official HR communication." />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Issue a New Letter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Select value={kind} onValueChange={(v) => setKind(v as LetterKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LETTER_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={emp} onValueChange={setEmp}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEES.map((e) => (
                  <SelectItem key={e.id} value={e.name}>
                    {e.name} · {e.dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Reason / body of the letter"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={issue}>
              <Send className="mr-2 h-4 w-4" /> Issue Letter
            </Button>
            <Button variant="outline" onClick={() => toast.success("Saved as draft")}>
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Letter History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {letters.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <div className="font-medium">
                  {l.kind} <span className="text-xs text-muted-foreground">· {l.emp}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {l.id} · {l.date} · {l.reason}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    l.kind.includes("Warning") || l.kind.includes("Show Cause")
                      ? "destructive"
                      : l.status === "Draft"
                        ? "outline"
                        : "default"
                  }
                >
                  {l.status}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${l.id} downloaded (PDF)`)}>
                  <Download className="mr-1 h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- User Access ---------------- */
function AccessSection() {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(EMPLOYEES.map((e) => [e.id, e.access === "Enabled"])),
  );

  return (
    <div className="space-y-5">
      <Head title="User Access" sub="Enable or disable dashboard logins for each employee." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi k="Logins Enabled" v={Object.values(state).filter(Boolean).length} />
        <Kpi k="Logins Disabled" v={Object.values(state).filter((v) => !v).length} />
        <Kpi k="Password Resets (7d)" v="3" />
      </div>
      <Card>
        <CardContent className="space-y-2 p-4">
          {EMPLOYEES.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-muted-foreground">
                  {e.email} · {e.role}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => toast.success(`Reset link sent to ${e.email}`)}>
                  Reset Password
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{state[e.id] ? "Enabled" : "Disabled"}</span>
                  <Switch
                    checked={state[e.id]}
                    onCheckedChange={(v) => {
                      setState((p) => ({ ...p, [e.id]: v }));
                      toast.success(`${e.name} login ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Reports to CEO ---------------- */
function ReportsSection() {
  const [note, setNote] = useState("");
  const summary = useMemo(
    () => [
      ["Headcount", `${EMPLOYEES.filter((e) => e.status !== "Exited").length} active`],
      ["Hiring", `${OPENINGS.reduce((s, o) => s + o.openings, 0)} open positions, 6 joined this quarter`],
      ["Attendance", `${Math.round(EMPLOYEES.reduce((s, e) => s + e.attendance, 0) / EMPLOYEES.length)}% average`],
      ["Attrition", "2 in last 30 days (1 exit, 1 notice)"],
      ["Discipline", `${LETTERS.filter((l) => l.kind.includes("Warning") || l.kind.includes("Show Cause")).length} warnings / notices issued`],
      ["Training", `${TRAININGS.filter((t) => t.status === "Completed").length} completed, ${TRAININGS.filter((t) => t.status === "Planned").length} planned`],
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <Head title="Reports to CEO" sub="Weekly and monthly HR report pack." />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">This Week's HR Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {summary.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b py-2 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">HR Head Remarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Key wins, risks, hiring blockers and people issues to flag to the CEO"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                if (!note.trim()) return toast.error("Add remarks before sending");
                setNote("");
                toast.success("HR report sent to CEO");
              }}
            >
              <Send className="mr-2 h-4 w-4" /> Send to CEO
            </Button>
            <Button variant="outline" onClick={() => toast.success("Report exported (PDF)")}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- HR Policies & Settings ---------------- */
function PoliciesSection() {
  const [settings, setSettings] = useState({
    autoLatePenalty: true,
    selfLeaveApply: true,
    docReminders: true,
    probationAlerts: true,
  });

  const rows: { key: keyof typeof settings; label: string; hint: string }[] = [
    { key: "autoLatePenalty", label: "Auto late-mark penalty", hint: "3 late marks = 1 half-day deduction" },
    { key: "selfLeaveApply", label: "Employee self leave apply", hint: "Staff can raise leave from their dashboard" },
    { key: "docReminders", label: "Document reminders", hint: "Weekly reminder for pending joining documents" },
    { key: "probationAlerts", label: "Probation review alerts", hint: "Alert HR 15 days before probation ends" },
  ];

  return (
    <div className="space-y-5">
      <Head title="HR Policies & Settings" sub="Policy library and HR automation rules." />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Policy Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {POLICIES.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">
                  Updated {p.updated} · {p.note}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success(`${p.title} downloaded`)}>
                  <Download className="mr-1 h-4 w-4" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${p.title} shared with all staff`)}>
                  Share
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">HR Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.hint}</div>
              </div>
              <Switch
                checked={settings[r.key]}
                onCheckedChange={(v) => {
                  setSettings((p) => ({ ...p, [r.key]: v }));
                  toast.success(`${r.label} ${v ? "enabled" : "disabled"}`);
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
