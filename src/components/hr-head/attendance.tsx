import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  CalendarDays,
  Check,
  Clock,
  History,
  Lock,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import {
  ATTENDANCE_TODAY,
  ATT_STATUSES,
  ATT_TONE,
  CUTOFF_NOTE,
  HOLIDAYS,
  LEAVE_REQUESTS,
  LEAVE_TONE,
  PAYROLL_CUTOFF,
  REGULARISATIONS,
  SHIFTS,
  WEEKLY_OFF_NOTE,
  type AttRow,
  type AttStatus,
  type AuditEntry,
  type LeaveRequest,
  type Regularisation,
} from "./attendance-data";

const TONE: Record<string, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

const HR_USER = "Anjali Kapoor (HR Head)";
const NOW = "02 Aug 2026 18:20";

const VIEWS = ["Today", "Monthly Attendance", "Leave Requests", "Regularisation Requests", "Holiday Calendar"] as const;
type View = (typeof VIEWS)[number];

function Avatar({ initials, tone = "muted" }: { initials: string; tone?: string }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${TONE[tone]}`}
    >
      {initials}
    </div>
  );
}

function Kpi({ label, value, hint, tone = "muted" }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return (
    <div className={`rounded-lg border p-3 ${TONE[tone]}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] opacity-75">{hint}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: AttStatus }) {
  return (
    <Badge variant="outline" className={`${TONE[ATT_TONE[status]]} font-medium`}>
      {status}
    </Badge>
  );
}

export function HrAttendance() {
  const [view, setView] = useState<View>("Today");
  const [rows, setRows] = useState<AttRow[]>(ATTENDANCE_TODAY);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [regs, setRegs] = useState<Regularisation[]>(REGULARISATIONS);

  // filters
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [manager, setManager] = useState("All");
  const [location, setLocation] = useState("All");
  const [status, setStatus] = useState("All");
  const [shift, setShift] = useState("All");
  const [from, setFrom] = useState("2026-08-02");
  const [to, setTo] = useState("2026-08-02");

  const [detail, setDetail] = useState<AttRow | null>(null);
  const [leaveDetail, setLeaveDetail] = useState<LeaveRequest | null>(null);
  const [regDetail, setRegDetail] = useState<Regularisation | null>(null);
  const [revealMedical, setRevealMedical] = useState<Record<string, boolean>>({});

  const [action, setAction] = useState<
    | { kind: "leave-approve" | "leave-reject" | "leave-modify"; req: LeaveRequest }
    | { kind: "reg-approve" | "reg-reject"; reg: Regularisation }
    | { kind: "correct"; row: AttRow }
    | null
  >(null);
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState<AttStatus>("Present");
  const [confirmRetro, setConfirmRetro] = useState(false);

  const depts = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.dept)))], [rows]);
  const managers = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.manager)))], [rows]);
  const locations = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.location)))], [rows]);

  const filtered = rows.filter((r) => {
    if (q && !(`${r.name} ${r.empId} ${r.designation}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (dept !== "All" && r.dept !== dept) return false;
    if (manager !== "All" && r.manager !== manager) return false;
    if (location !== "All" && r.location !== location) return false;
    if (status !== "All" && r.status !== status) return false;
    if (shift !== "All" && r.shift !== shift) return false;
    return true;
  });

  const presentToday = rows.filter((r) => ["Present", "Work From Home", "On Duty", "Late", "Half Day"].includes(r.status)).length;
  const absentToday = rows.filter((r) => r.status === "Absent").length;
  const onLeave = rows.filter((r) => r.status === "On Leave").length;
  const lateToday = rows.filter((r) => r.status === "Late").length;
  const pendingLeaves = leaves.filter((l) => ["Submitted", "Manager Review", "HR Review"].includes(l.stage)).length;
  const pendingRegs = regs.filter((r) => r.decision === "Pending").length;

  const alerts = useMemo(() => {
    const list: { text: string; tone: string }[] = [];
    rows
      .filter((r) => r.status === "Absent" && (r.note ?? "").toLowerCase().includes("no information"))
      .forEach((r) => list.push({ text: `${r.name} absent without information`, tone: "urgent" }));
    rows.filter((r) => r.lateStreak >= 3).forEach((r) => list.push({ text: `${r.name} — ${r.lateStreak} late arrivals this month`, tone: "pending" }));
    rows
      .filter((r) => r.status === "Attendance Missing")
      .forEach((r) => list.push({ text: `${r.name} — attendance record incomplete`, tone: "urgent" }));
    if (pendingLeaves) list.push({ text: `${pendingLeaves} leave request(s) awaiting decision`, tone: "pending" });
    leaves
      .filter((l) => l.overlapWith && !["Approved", "Rejected", "Cancelled"].includes(l.stage))
      .forEach((l) => list.push({ text: `Overlapping leave: ${l.name} with ${l.overlapWith}`, tone: "pending" }));
    leaves
      .filter((l) => l.balance < l.days && !["Approved", "Rejected", "Cancelled"].includes(l.stage))
      .forEach((l) => list.push({ text: `${l.name} has insufficient ${l.type} balance (${l.balance}/${l.days} days)`, tone: "urgent" }));
    regs
      .filter((r) => r.decision === "Pending" && r.ageDays > 5)
      .forEach((r) => list.push({ text: `Regularisation ${r.id} pending ${r.ageDays} days`, tone: "urgent" }));
    regs
      .filter((r) => r.afterPayrollCutoff && r.decision !== "Rejected")
      .forEach((r) => list.push({ text: `${r.name} — attendance change dated after payroll cut-off (${PAYROLL_CUTOFF})`, tone: "pending" }));
    return list;
  }, [rows, leaves, regs, pendingLeaves]);

  function log(entry: string): AuditEntry {
    return { at: NOW, by: HR_USER, text: entry };
  }

  function decideLeave(kind: "leave-approve" | "leave-reject" | "leave-modify", req: LeaveRequest, why: string) {
    const stage = kind === "leave-approve" ? "Approved" : kind === "leave-reject" ? "Rejected" : "HR Review";
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === req.id
          ? {
              ...l,
              stage,
              history: [
                ...l.history,
                log(
                  kind === "leave-approve"
                    ? `Approved by HR${why ? ` — ${why}` : ""}`
                    : kind === "leave-reject"
                      ? `Rejected by HR — ${why}`
                      : `Modified by HR — ${why}`,
                ),
              ],
            }
          : l,
      ),
    );
    if (kind === "leave-approve") {
      setRows((prev) =>
        prev.map((r) =>
          r.empId === req.empId
            ? {
                ...r,
                status: "On Leave",
                checkIn: "—",
                checkOut: "—",
                hours: "0h",
                note: `Approved ${req.type}`,
                history: [...r.history, log(`Attendance auto-updated to On Leave for approved ${req.type}`)],
              }
            : r,
        ),
      );
      toast.success("Leave approved — attendance updated automatically");
    } else if (kind === "leave-reject") {
      toast.success("Leave rejected with reason recorded");
    } else {
      toast.success("Leave modification recorded");
    }
  }

  function decideReg(kind: "reg-approve" | "reg-reject", reg: Regularisation, why: string) {
    setRegs((prev) =>
      prev.map((r) =>
        r.id === reg.id
          ? {
              ...r,
              decision: kind === "reg-approve" ? "Approved" : "Rejected",
              history: [
                ...r.history,
                log(
                  kind === "reg-approve"
                    ? `Approved — original record preserved, correction added${why ? ` (${why})` : ""}`
                    : `Rejected — ${why}`,
                ),
              ],
            }
          : r,
      ),
    );
    toast.success(kind === "reg-approve" ? "Regularisation approved — original record preserved" : "Regularisation rejected");
  }

  function submitAction() {
    if (!action) return;
    const needsReason =
      action.kind === "leave-reject" || action.kind === "leave-modify" || action.kind === "reg-reject" || action.kind === "correct";
    if (needsReason && reason.trim().length < 4) {
      toast.error("A reason is required");
      return;
    }
    if (action.kind === "correct" && !confirmRetro) {
      toast.error("Please confirm the retrospective change");
      return;
    }
    if (action.kind === "correct") {
      setRows((prev) =>
        prev.map((r) =>
          r.empId === action.row.empId
            ? {
                ...r,
                status: newStatus,
                note: `Corrected from ${r.status}`,
                history: [...r.history, log(`Attendance corrected ${r.status} → ${newStatus} — ${reason} (original record preserved)`)],
              }
            : r,
        ),
      );
      toast.success("Attendance corrected — original record preserved in history");
    } else if (action.kind === "reg-approve" || action.kind === "reg-reject") {
      decideReg(action.kind, action.reg, reason);
    } else {
      decideLeave(action.kind, action.req, reason);
    }
    setAction(null);
    setReason("");
    setConfirmRetro(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Attendance &amp; Leave</h2>
          <p className="text-sm text-muted-foreground">
            Company-wide attendance, shifts, leave approvals and attendance corrections.
          </p>
        </div>
        <Badge variant="outline" className={TONE.active}>
          <Shield className="mr-1 h-3 w-3" /> HR Head — company-wide access
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Present Today" value={presentToday} tone="done" hint={`of ${rows.length} employees`} />
        <Kpi label="Absent Today" value={absentToday} tone="urgent" hint="After cut-off only" />
        <Kpi label="On Leave" value={onLeave} tone="active" hint="Approved leave" />
        <Kpi label="Late Arrivals" value={lateToday} tone="pending" hint="Today" />
        <Kpi label="Pending Leave Requests" value={pendingLeaves} tone="pending" hint="Awaiting HR" />
        <Kpi label="Regularisation Requests" value={pendingRegs} tone={pendingRegs ? "pending" : "muted"} hint="Pending decision" />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Attention alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {alerts.map((a, i) => (
              <div key={i} className={`rounded-md border px-3 py-2 text-sm ${TONE[a.tone]}`}>
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={view} onValueChange={(v) => setView(v as View)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {VIEWS.map((v) => (
            <TabsTrigger key={v} value={v} className="text-xs">
              {v}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {(view === "Today" || view === "Monthly Attendance") && (
        <Card>
          <CardContent className="grid gap-2 pt-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search name or employee ID" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>{depts.map((d) => <SelectItem key={d} value={d}>{d === "All" ? "All departments" : d}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger><SelectValue placeholder="Reporting manager" /></SelectTrigger>
              <SelectContent>{managers.map((m) => <SelectItem key={m} value={m}>{m === "All" ? "All managers" : m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger><SelectValue placeholder="Work location" /></SelectTrigger>
              <SelectContent>{locations.map((l) => <SelectItem key={l} value={l}>{l === "All" ? "All locations" : l}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Attendance status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {ATT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger><SelectValue placeholder="Shift" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All shifts</SelectItem>
                {SHIFTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-xs text-muted-foreground">to</span>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {view === "Today" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Today&apos;s attendance — 02 Aug 2026
            </CardTitle>
            <p className="text-xs text-muted-foreground">{CUTOFF_NOTE}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No employees match these filters.</p>}
            {filtered.map((r) => (
              <div key={r.empId} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <Avatar initials={r.photo} tone={ATT_TONE[r.status]} />
                <div className="min-w-[180px] flex-1">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.empId} · {r.dept} · {r.location}
                  </div>
                </div>
                <div className="min-w-[140px] text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.shift}</div>
                </div>
                <div className="min-w-[120px] text-xs">
                  <div>In: <span className="font-medium tabular-nums">{r.checkIn}</span></div>
                  <div>Out: <span className="font-medium tabular-nums">{r.checkOut}</span></div>
                </div>
                <div className="min-w-[80px] text-xs">
                  <div className="text-muted-foreground">Hours</div>
                  <div className="font-medium tabular-nums">{r.hours}</div>
                </div>
                <StatusBadge status={r.status} />
                <Button size="sm" variant="outline" onClick={() => setDetail(r)}>View Details</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {view === "Monthly Attendance" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly attendance — August 2026</CardTitle>
            <p className="text-xs text-muted-foreground">{WEEKLY_OFF_NOTE}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {filtered.map((r) => {
              const pct = Math.round(((r.month.present + r.month.leave * 0) / r.month.workingDays) * 100);
              return (
                <div key={r.empId} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar initials={r.photo} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">{r.empId} · {r.dept}</div>
                    </div>
                    <Badge variant="outline" className={pct >= 92 ? TONE.done : pct >= 80 ? TONE.pending : TONE.urgent}>
                      {pct}% attendance
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setDetail(r)}>View Details</Button>
                  </div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4 lg:grid-cols-7">
                    {[
                      ["Working days", r.month.workingDays],
                      ["Present", r.month.present],
                      ["Leave", r.month.leave],
                      ["Absent", r.month.absent],
                      ["Late", r.month.late],
                      ["Half days", r.month.halfDays],
                      ["Total hours", `${r.month.hours}h`],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="rounded-md border bg-muted/30 px-2 py-1">
                        <div className="text-muted-foreground">{k}</div>
                        <div className="font-medium tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {view === "Leave Requests" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {leaves.map((l) => {
            const short = l.balance < l.days;
            return (
              <Card key={l.id}>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar initials={l.photo} tone={LEAVE_TONE[l.stage]} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{l.name}</span>
                        <Badge variant="outline" className={TONE[LEAVE_TONE[l.stage]]}>{l.stage}</Badge>
                        <Badge variant="outline" className={TONE.muted}>{l.id}</Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{l.empId} · {l.dept} · Manager: {l.manager}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div><div className="text-muted-foreground">Leave type</div><div className="font-medium">{l.type}</div></div>
                    <div><div className="text-muted-foreground">From</div><div className="font-medium">{l.from}</div></div>
                    <div><div className="text-muted-foreground">To</div><div className="font-medium">{l.to}</div></div>
                    <div><div className="text-muted-foreground">Days</div><div className="font-medium tabular-nums">{l.days}</div></div>
                  </div>

                  <div className="rounded-md border bg-muted/30 p-2 text-xs">
                    <div className="text-muted-foreground">Reason</div>
                    {l.confidential && !revealMedical[l.id] ? (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-medium">Confidential — not shown in team views</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[11px]"
                          onClick={() => {
                            setRevealMedical((p) => ({ ...p, [l.id]: true }));
                            toast.info("Confidential reason viewed — access logged");
                          }}
                        >
                          <Lock className="mr-1 h-3 w-3" /> Reveal (logged)
                        </Button>
                      </div>
                    ) : (
                      <div className="font-medium">{l.reason}</div>
                    )}
                  </div>

                  <div className="grid gap-2 text-xs sm:grid-cols-2">
                    <div className={`rounded-md border p-2 ${short ? TONE.urgent : TONE.muted}`}>
                      <div className="opacity-80">Available balance</div>
                      <div className="font-medium">{l.balance} day(s) {short && "— insufficient"}</div>
                    </div>
                    <div className={`rounded-md border p-2 ${l.managerRecommendation === "Recommended" ? TONE.done : l.managerRecommendation === "Not Recommended" ? TONE.urgent : TONE.pending}`}>
                      <div className="opacity-80">Manager recommendation</div>
                      <div className="font-medium">{l.managerRecommendation}</div>
                      {l.managerNote && <div className="mt-0.5 text-[11px] opacity-80">{l.managerNote}</div>}
                    </div>
                  </div>

                  {l.overlapWith && (
                    <div className={`rounded-md border p-2 text-xs ${TONE.pending}`}>
                      Overlapping leave with {l.overlapWith}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={["Approved", "Rejected", "Cancelled"].includes(l.stage)}
                      onClick={() => { setAction({ kind: "leave-approve", req: l }); setReason(""); }}
                    >
                      <Check className="mr-1 h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={["Approved", "Rejected", "Cancelled"].includes(l.stage)}
                      onClick={() => { setAction({ kind: "leave-reject", req: l }); setReason(""); }}
                    >
                      <X className="mr-1 h-3 w-3" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={["Approved", "Rejected", "Cancelled"].includes(l.stage)}
                      onClick={() => { setAction({ kind: "leave-modify", req: l }); setReason(""); }}
                    >
                      Modify
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setLeaveDetail(l)}>View Details</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {view === "Regularisation Requests" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {regs.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={r.photo} tone={r.decision === "Approved" ? "done" : r.decision === "Rejected" ? "urgent" : "pending"} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{r.name}</span>
                      <Badge variant="outline" className={TONE[r.decision === "Approved" ? "done" : r.decision === "Rejected" ? "urgent" : "pending"]}>
                        {r.decision}
                      </Badge>
                      <Badge variant="outline" className={TONE.muted}>{r.id}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{r.empId} · {r.dept} · For {r.date}</div>
                  </div>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-md border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Requested correction</div>
                    <div className="font-medium">{r.correction} — {r.requested}</div>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Manager response</div>
                    <div className="font-medium">{r.managerResponse}</div>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-2 sm:col-span-2">
                    <div className="text-muted-foreground">Employee reason</div>
                    <div className="font-medium">{r.reason}</div>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-2 sm:col-span-2">
                    <div className="text-muted-foreground">Supporting document</div>
                    <div className="font-medium">{r.document ?? "Not attached"}</div>
                  </div>
                </div>
                {r.afterPayrollCutoff && (
                  <div className={`rounded-md border p-2 text-xs ${TONE.pending}`}>
                    Retrospective change — date falls after payroll cut-off ({PAYROLL_CUTOFF}). Confirmation required.
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={r.decision !== "Pending"} onClick={() => { setAction({ kind: "reg-approve", reg: r }); setReason(""); }}>
                    <Check className="mr-1 h-3 w-3" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" disabled={r.decision !== "Pending"} onClick={() => { setAction({ kind: "reg-reject", reg: r }); setReason(""); }}>
                    <X className="mr-1 h-3 w-3" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRegDetail(r)}>
                    <History className="mr-1 h-3 w-3" /> Change history
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === "Holiday Calendar" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> Holiday calendar 2026
            </CardTitle>
            <p className="text-xs text-muted-foreground">{WEEKLY_OFF_NOTE}</p>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {HOLIDAYS.map((h) => (
              <div key={h.date} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">{h.name}</div>
                  <div className="text-[11px] text-muted-foreground">{h.date}</div>
                </div>
                <Badge variant="outline" className={TONE.active}>{h.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Attendance detail */}
      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={detail.photo} tone={ATT_TONE[detail.status]} />
                  <div className="text-xs text-muted-foreground">
                    {detail.empId} · {detail.designation} · {detail.dept}
                    <div>Manager: {detail.manager} · {detail.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Shift", detail.shift],
                    ["Status", detail.status],
                    ["Check-in", detail.checkIn],
                    ["Check-out", detail.checkOut],
                    ["Working hours", detail.hours],
                    ["Note", detail.note ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border bg-muted/30 p-2">
                      <div className="text-muted-foreground">{k}</div>
                      <div className="font-medium">{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium">Leave balance</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {Object.entries(detail.leaveBalance).map(([k, v]) => (
                      <div key={k} className="rounded-md border bg-muted/30 p-2">
                        <div className="text-muted-foreground">{k}</div>
                        <div className="font-medium tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setAction({ kind: "correct", row: detail }); setNewStatus(detail.status); setReason(""); setConfirmRetro(false); }}
                >
                  Correct attendance (original preserved)
                </Button>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs font-medium"><History className="h-3 w-3" /> Audit log</div>
                  <div className="space-y-1">
                    {detail.history.length === 0 && <p className="text-xs text-muted-foreground">No changes recorded.</p>}
                    {detail.history.map((h, i) => (
                      <div key={i} className="rounded-md border p-2 text-[11px]">
                        <div className="font-medium">{h.text}</div>
                        <div className="text-muted-foreground">{h.at} · {h.by}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Leave detail */}
      <Sheet open={!!leaveDetail} onOpenChange={(o) => !o && setLeaveDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {leaveDetail && (
            <>
              <SheetHeader><SheetTitle>{leaveDetail.id} — {leaveDetail.name}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Leave type", leaveDetail.type],
                    ["Stage", leaveDetail.stage],
                    ["From", leaveDetail.from],
                    ["To", leaveDetail.to],
                    ["Days", String(leaveDetail.days)],
                    ["Submitted on", leaveDetail.submittedOn],
                    ["Balance", `${leaveDetail.balance} day(s)`],
                    ["Manager", leaveDetail.manager],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border bg-muted/30 p-2">
                      <div className="text-muted-foreground">{k}</div>
                      <div className="font-medium">{v}</div>
                    </div>
                  ))}
                </div>
                {leaveDetail.confidential && (
                  <div className={`rounded-md border p-2 ${TONE.muted}`}>
                    <Lock className="mr-1 inline h-3 w-3" /> Medical / personal documents stay confidential to HR and are never shown in team views.
                  </div>
                )}
                <div>
                  <div className="mb-1 flex items-center gap-1 font-medium"><History className="h-3 w-3" /> Workflow history</div>
                  {leaveDetail.history.map((h, i) => (
                    <div key={i} className="mb-1 rounded-md border p-2 text-[11px]">
                      <div className="font-medium">{h.text}</div>
                      <div className="text-muted-foreground">{h.at} · {h.by}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reg history */}
      <Sheet open={!!regDetail} onOpenChange={(o) => !o && setRegDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {regDetail && (
            <>
              <SheetHeader><SheetTitle>{regDetail.id} — {regDetail.name}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-2 text-xs">
                <div className="rounded-md border bg-muted/30 p-2">
                  <div className="text-muted-foreground">Correction requested</div>
                  <div className="font-medium">{regDetail.correction} — {regDetail.requested}</div>
                </div>
                {(regs.find((r) => r.id === regDetail.id)?.history ?? []).map((h, i) => (
                  <div key={i} className="rounded-md border p-2 text-[11px]">
                    <div className="font-medium">{h.text}</div>
                    <div className="text-muted-foreground">{h.at} · {h.by}</div>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground">
                  Attendance records are never deleted. Approved corrections are stored alongside the original entry.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Action dialog */}
      <Dialog open={!!action} onOpenChange={(o) => { if (!o) { setAction(null); setReason(""); setConfirmRetro(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action?.kind === "leave-approve" && "Approve leave request"}
              {action?.kind === "leave-reject" && "Reject leave request"}
              {action?.kind === "leave-modify" && "Modify leave request"}
              {action?.kind === "reg-approve" && "Approve regularisation"}
              {action?.kind === "reg-reject" && "Reject regularisation"}
              {action?.kind === "correct" && "Correct attendance"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {action?.kind === "correct" && (
              <div className="space-y-1">
                <Label className="text-xs">New status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as AttStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ATT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">
                Reason {action?.kind === "leave-approve" || action?.kind === "reg-approve" ? "(optional)" : "(required)"}
              </Label>
              <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain the decision — recorded in the audit log" />
            </div>
            {action?.kind === "correct" && (
              <label className="flex items-start gap-2 rounded-md border p-2 text-xs">
                <input type="checkbox" checked={confirmRetro} onChange={(e) => setConfirmRetro(e.target.checked)} className="mt-0.5" />
                <span>I confirm this retrospective attendance change. The original record will be preserved and this action is logged.</span>
              </label>
            )}
            <p className="text-[11px] text-muted-foreground">Recorded as {HR_USER} on {NOW}.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAction(null); setReason(""); }}>Cancel</Button>
            <Button onClick={submitAction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
