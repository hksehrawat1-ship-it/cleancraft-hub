import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  FileCheck2,
  FileWarning,
  GraduationCap,
  Lock,
  Mail,
  Megaphone,
  Search,
  Send,
  ShieldCheck,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { DEPTS, EMPLOYEES, LEAVES, OPENINGS, TRAININGS, type Dept } from "./data";

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

const TODAY = "Sunday, 02 August 2026";

const MANDATORY_DOCS = [
  "Aadhaar card",
  "PAN card",
  "Bank details",
  "Education documents",
  "Experience letters",
  "Previous salary slips",
  "Address proof",
  "Signed appointment letter",
];

/* ---------- small building blocks ---------- */

type Tone = "done" | "active" | "pending" | "urgent" | "muted";

const TONE: Record<Tone, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "",
};

function Kpi({
  label,
  value,
  hint,
  tone = "muted",
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-colors hover:bg-muted/60 ${TONE[tone]}`}
    >
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs opacity-70">{hint}</div>}
    </button>
  );
}

function Row({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <Badge
        variant={tone === "urgent" ? "destructive" : tone === "done" ? "default" : "outline"}
        className="tabular-nums"
      >
        {value}
      </Badge>
    </div>
  );
}

/* ---------- dashboard ---------- */

export function HrHeadDashboardHome({ onGo }: { onGo: (k: SectionKey) => void }) {
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", dept: "Sales" as Dept, email: "", phone: "" });
  const [invite, setInvite] = useState({ name: EMPLOYEES[0].name, email: EMPLOYEES[0].email });

  const active = EMPLOYEES.filter((e) => e.status !== "Exited");
  const openPositions = OPENINGS.reduce((s, o) => s + o.openings, 0);
  const docsPending = EMPLOYEES.filter((e) => e.docsDone < e.docsTotal);
  const pendingLeaves = LEAVES.filter((l) => l.status === "Pending").length;

  const matches = useMemo(
    () =>
      q.trim()
        ? EMPLOYEES.filter((e) =>
            `${e.name} ${e.id} ${e.role} ${e.dept}`.toLowerCase().includes(q.trim().toLowerCase()),
          ).slice(0, 6)
        : [],
    [q],
  );

  const priorities: { text: string; tone: Tone; go: SectionKey; count: number }[] = [
    { text: "Interviews scheduled today", tone: "active", go: "recruitment", count: 3 },
    { text: "Joining formalities pending", tone: "pending", go: "onboarding", count: 2 },
    { text: "Documents awaiting verification", tone: "pending", go: "onboarding", count: docsPending.length },
    { text: "Appointment letters pending", tone: "pending", go: "letters", count: 2 },
    { text: "Attendance / leave approvals pending", tone: "pending", go: "attendance", count: pendingLeaves },
    { text: "Performance reviews due", tone: "urgent", go: "performance", count: 4 },
    { text: "Warnings awaiting acknowledgement", tone: "urgent", go: "letters", count: 1 },
    { text: "User accounts awaiting activation", tone: "active", go: "access", count: 2 },
    { text: "Employee exits requiring clearance", tone: "urgent", go: "access", count: 1 },
  ];

  const alerts: { text: string; tone: Tone; go: SectionKey }[] = [
    { text: "Mohit Kumar joined with incomplete documentation", tone: "urgent", go: "onboarding" },
    { text: "3 employees missing mandatory documents (masked)", tone: "urgent", go: "onboarding" },
    { text: "Vikas Yadav probation review overdue by 6 days", tone: "urgent", go: "performance" },
    { text: "Half-yearly review overdue for 2 employees", tone: "pending", go: "performance" },
    { text: "Warning letter LT-74 not acknowledged", tone: "pending", go: "letters" },
    { text: "Sanjay Patil on notice — access not deactivated", tone: "urgent", go: "access" },
    { text: "1 user account has permissions above its role", tone: "pending", go: "access" },
    { text: "Sensitive document opened outside office hours (logged)", tone: "pending", go: "access" },
    { text: "2 HR actions overdue beyond 48 hours", tone: "urgent", go: "reports" },
  ];

  const quick: { label: string; icon: React.ComponentType<{ className?: string }>; run: () => void }[] = [
    { label: "Add Employee", icon: UserPlus, run: () => setAddOpen(true) },
    { label: "Create Job Opening", icon: BriefcaseBusiness, run: () => onGo("recruitment") },
    { label: "Upload Employee Document", icon: Upload, run: () => onGo("onboarding") },
    { label: "Send HR Letter", icon: Send, run: () => onGo("letters") },
    { label: "Start Performance Review", icon: GraduationCap, run: () => onGo("performance") },
    { label: "Create User Account", icon: ShieldCheck, run: () => setInviteOpen(true) },
    {
      label: "Publish Announcement",
      icon: Megaphone,
      run: () => toast.success("Announcement published to all employee dashboards"),
    },
    { label: "Generate CEO Report", icon: FileCheck2, run: () => onGo("reports") },
  ];

  const statusCount = (s: string) => EMPLOYEES.filter((e) => e.status === s).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">Welcome, Anjali Kapoor</h1>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" /> {TODAY} · HR Head · Reports to CEO
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Notifications" onClick={() => setNotifOpen(true)}>
                <Bell className="h-4 w-4" />
              </Button>
              <Button onClick={() => setAddOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search employee by name, ID, role or department"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {!!matches.length && (
            <div className="space-y-2">
              {matches.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onGo("employees")}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted"
                >
                  <span>
                    <span className="font-medium">{e.name}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      · {e.role} · {e.dept} · {e.id}
                    </span>
                  </span>
                  <Badge variant="outline">{e.status}</Badge>
                </button>
              ))}
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Aadhaar, PAN, bank and salary details stay masked in search results.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total Employees" value={active.length} hint="8 departments" onClick={() => onGo("employees")} />
        <Kpi label="Open Positions" value={openPositions} tone="active" hint={`${OPENINGS.length} requisitions`} onClick={() => onGo("recruitment")} />
        <Kpi label="Candidates in Process" value={5} tone="active" hint="Screening to offer" onClick={() => onGo("recruitment")} />
        <Kpi label="New Joiners This Month" value={3} tone="done" hint="1 in onboarding" onClick={() => onGo("onboarding")} />
        <Kpi label="On Leave Today" value={1} tone="pending" hint={`${pendingLeaves} approvals pending`} onClick={() => onGo("attendance")} />
        <Kpi label="Pending Reviews" value={4} tone="pending" hint="Probation + half-yearly" onClick={() => onGo("performance")} />
        <Kpi label="Docs Awaiting Verification" value={docsPending.length} tone="pending" hint="Masked in summaries" onClick={() => onGo("onboarding")} />
        <Kpi label="HR Actions Overdue" value={2} tone="urgent" hint="Beyond 48 hours" onClick={() => onGo("reports")} />
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quick.map((a) => (
            <Button key={a.label} variant="outline" className="h-auto justify-start py-3" onClick={a.run}>
              <a.icon className="mr-2 h-4 w-4 shrink-0 text-primary" />
              <span className="text-left text-xs sm:text-sm">{a.label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Priorities + alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Today's HR Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorities.map((p) => (
              <button
                key={p.text}
                onClick={() => onGo(p.go)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted/60 ${TONE[p.tone]}`}
              >
                <span>{p.text}</span>
                <span className="rounded-md bg-background/70 px-2 py-0.5 text-xs font-semibold tabular-nums">
                  {p.count}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileWarning className="h-4 w-4 text-destructive" /> Dashboard Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <button
                key={a.text}
                onClick={() => onGo(a.go)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted/60 ${TONE[a.tone]}`}
              >
                <span>{a.text}</span>
                <Badge variant={a.tone === "urgent" ? "destructive" : "outline"}>
                  {a.tone === "urgent" ? "Urgent" : "Pending"}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Employee summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" /> Employee Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DEPTS.map((d) => (
              <div key={d} className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{d}</div>
                <div className="text-xl font-semibold tabular-nums">
                  {active.filter((e) => e.dept === d).length}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Kpi label="New Joiners" value={3} tone="active" />
            <Kpi label="Probation" value={statusCount("Probation")} tone="pending" />
            <Kpi label="Confirmed" value={statusCount("Active")} tone="done" />
            <Kpi label="Notice Period" value={statusCount("Notice Period")} tone="urgent" />
            <Kpi label="Exited" value={statusCount("Exited")} />
          </div>
        </CardContent>
      </Card>

      {/* Recruitment + onboarding */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recruitment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Row label="Open positions" value={openPositions} tone="active" />
            <Row label="New applications (7 days)" value={26} />
            <Row label="Interviews today" value={3} tone="active" />
            <Row label="Candidates awaiting decision" value={2} tone="pending" />
            <Row label="Offers sent" value={4} />
            <Row label="Joining confirmations pending" value={2} tone="pending" />
            <Button className="mt-3 w-full" variant="outline" onClick={() => onGo("recruitment")}>
              View Recruitment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding & Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Employees joining soon" value={2} tone="active" />
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Onboarding completion</span>
                <span className="tabular-nums">78%</span>
              </div>
              <Progress value={78} />
            </div>
            <Row label="Missing documents" value={7} tone="urgent" />
            <Row label="Documents awaiting verification" value={docsPending.length} tone="pending" />
            <Row label="Expiring documents (60 days)" value={2} tone="pending" />
            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Numbers masked — full values open only in the employee record
              </div>
              <div className="grid gap-1 text-xs sm:grid-cols-2">
                {MANDATORY_DOCS.map((d) => (
                  <div key={d} className="flex justify-between gap-2">
                    <span>{d}</span>
                    <span className="text-muted-foreground">
                      {d.includes("Aadhaar")
                        ? "XXXX XXXX 4821"
                        : d.includes("PAN")
                          ? "XXXXX1234X"
                          : d.includes("Bank")
                            ? "XXXXXX7790"
                            : "On file"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => onGo("onboarding")}>
              View Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance + letters */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Row label="Reviews due this month" value={4} tone="pending" />
            <Row label="Reviews completed" value={7} tone="done" />
            <Row label="Meeting expectations" value={9} tone="done" />
            <Row label="Improvement plans active" value={2} tone="pending" />
            <Row label="Training assigned" value={TRAININGS.length} tone="active" />
            <Row label="Manager feedback pending" value={3} tone="pending" />
            <p className="pt-2 text-xs text-muted-foreground">
              Individual ratings and feedback stay private to the employee, their manager, HR and the CEO.
            </p>
            <Button className="mt-2 w-full" variant="outline" onClick={() => onGo("performance")}>
              View Performance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Letters, Notices & Warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Row label="Joining letters pending" value={1} tone="pending" />
            <Row label="Appointment letters pending" value={2} tone="pending" />
            <Row label="Confirmation letters pending" value={1} tone="pending" />
            <Row label="Feedback awaiting acknowledgement" value={3} tone="pending" />
            <Row label="Notices / warnings awaiting acknowledgement" value={1} tone="urgent" />
            <div className="mt-3 space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Recently issued</div>
              {[
                ["LT-74", "Confidential notice", "22 Jul 2026"],
                ["LT-72", "Appreciation letter", "26 Jul 2026"],
                ["LT-71", "Confidential warning", "28 Jul 2026"],
              ].map(([id, kind, date]) => (
                <div key={id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs">
                  <span>
                    {id} · {kind}
                  </span>
                  <span className="text-muted-foreground">{date}</span>
                </div>
              ))}
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Employee names and details hidden on sensitive items.
              </p>
            </div>
            <Button className="mt-3 w-full" variant="outline" onClick={() => onGo("letters")}>
              View Letters
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Access + CEO snapshot */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" /> User Access Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Row label="Accounts awaiting creation" value={2} tone="pending" />
            <Row label="Invitations sent" value={4} tone="active" />
            <Row label="Accounts not activated" value={2} tone="pending" />
            <Row label="Password-reset requests" value={3} tone="active" />
            <Row label="Deactivated accounts" value={3} />
            <Row label="Suspicious access alerts" value={1} tone="urgent" />
            <div className="mt-3 rounded-lg border p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1 font-medium text-foreground">
                <Lock className="h-3 w-3" /> Password policy
              </div>
              HR creates the account and sends a secure setup invitation only. Passwords are never created, viewed or
              stored by HR. Setup and reset links expire, and every account action is written to the audit log.
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button onClick={() => setInviteOpen(true)}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Create User Account
              </Button>
              <Button variant="outline" onClick={() => onGo("access")}>
                View User Access
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">CEO Report Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Row label="Total workforce" value={active.length} />
            <Row label="Hiring progress" value={`6 of ${openPositions + 6} closed`} tone="active" />
            <Row label="Employee turnover (30d)" value="2" tone="pending" />
            <Row
              label="Attendance rate"
              value={`${Math.round(EMPLOYEES.reduce((s, e) => s + e.attendance, 0) / EMPLOYEES.length)}%`}
              tone="done"
            />
            <Row label="Performance reviews completed" value="7 of 11" tone="pending" />
            <Row label="Open HR risks" value={3} tone="urgent" />
            <Row label="Workforce changes this month" value="+3 joined / -1 exit" tone="active" />
            <Button className="mt-3 w-full" variant="outline" onClick={() => onGo("reports")}>
              View CEO Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add employee dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Designation / role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <Select value={form.dept} onValueChange={(v) => setForm({ ...form, dept: v as Dept })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Work email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              One master employee record is created. Onboarding and document collection start automatically. No password
              is set here — the employee receives a secure setup invitation.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                if (!form.name.trim() || !form.email.trim())
                  return toast.error("Name and work email are required");
                setAddOpen(false);
                toast.success(`${form.name.trim()} added — onboarding workflow started`);
                setForm({ name: "", role: "", dept: "Sales", email: "", phone: "" });
              }}
            >
              Create Employee Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create user account dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select
              value={invite.name}
              onValueChange={(v) => {
                const e = EMPLOYEES.find((x) => x.name === v)!;
                setInvite({ name: e.name, email: e.email });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEES.map((e) => (
                  <SelectItem key={e.id} value={e.name}>
                    {e.name} · {e.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={invite.email} readOnly />
            <div className="rounded-lg border p-3 text-xs text-muted-foreground">
              A secure setup link will be sent to this employee. HR cannot set or see the password. The link expires in
              24 hours and this action is recorded in the audit log.
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setInviteOpen(false);
                toast.success(`Secure setup invitation sent to ${invite.name}`);
              }}
            >
              <Mail className="mr-2 h-4 w-4" /> Send Secure Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {[
              "Farhan Ali accepted the Field Engineer offer",
              "Priya Verma applied for 2 days casual leave",
              "Warning letter LT-74 still not acknowledged",
              "Probation review for Vikas Yadav is overdue",
              "2 setup invitations are still not activated",
            ].map((n) => (
              <div key={n} className="rounded-lg border p-3">
                {n}
              </div>
            ))}
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Confidential details are never shown in notification previews.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
