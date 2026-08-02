import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  CalendarClock,
  CheckCircle2,
  FileText,
  GraduationCap,
  History,
  IdCard,
  Lock,
  LogOut,
  Mail,
  Search,
  Shield,
  Star,
  Upload,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { DEPTS, type Dept } from "./data";
import {
  ACCOUNT_STATUSES,
  ACCOUNT_TONE,
  EMPLOYMENT_TYPES,
  EMP_STATUSES,
  MASTER_EMPLOYEES,
  STATUS_TONE,
  nextEmpId,
  type AccountStatus,
  type EmpStatus,
  type EmploymentType,
  type MasterEmployee,
} from "./employee-data";

const TONE: Record<string, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "",
};

const TODAY = "02 Aug 2026";
const ANY = "__any__";
const LOCATIONS = ["Delhi HO", "Indore", "Pune", "Jaipur", "Bengaluru"];

type TabKey = "All" | "Active" | EmpStatus;
const TABS: TabKey[] = [
  "All",
  "Active",
  "Onboarding",
  "Probation",
  "Confirmed",
  "On Leave",
  "Notice Period",
  "Exited",
];

function Kpi({ label, value, tone = "muted" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className={`rounded-xl border p-3 ${TONE[tone]}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Pill({ text, tone }: { text: string; tone: string }) {
  return (
    <Badge variant="outline" className={`text-[11px] ${TONE[tone]}`}>
      {text}
    </Badge>
  );
}

function Avatar({ initials, muted }: { initials: string; muted?: boolean }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
        muted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
      }`}
    >
      {initials}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border p-2.5">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-medium ${mono ? "tabular-nums" : ""}`}>{value}</div>
    </div>
  );
}

function alertsFor(e: MasterEmployee) {
  const out: { text: string; tone: string }[] = [];
  const missing = e.docs.filter((d) => !d.ok).length;
  if (missing) out.push({ text: `${missing} mandatory document${missing > 1 ? "s" : ""} missing`, tone: "urgent" });
  if (e.status === "Probation") out.push({ text: `Probation ends ${e.probationEnd}`, tone: "pending" });
  if (e.status === "Probation" && e.confirmationDate === "—")
    out.push({ text: "Confirmation decision pending", tone: "pending" });
  if (e.reviewStatus === "Overdue") out.push({ text: "Performance review overdue", tone: "urgent" });
  if (e.trainings.some((t) => t.status !== "Completed")) out.push({ text: "Training incomplete", tone: "pending" });
  if (e.letters.some((l) => l.ack === "Pending"))
    out.push({ text: "Letter awaiting acknowledgement", tone: "pending" });
  if (e.account !== "Active" && e.status !== "Exited")
    out.push({ text: "User account not activated", tone: "pending" });
  if (e.status === "Exited" && e.account === "Active")
    out.push({ text: "Exited employee still has active access", tone: "urgent" });
  if (e.bankMasked === "Not submitted" || e.panMasked === "Not submitted")
    out.push({ text: "Employee record missing required information", tone: "urgent" });
  return out;
}

export function HrEmployees() {
  const [rows, setRows] = useState<MasterEmployee[]>(MASTER_EMPLOYEES);
  const [tab, setTab] = useState<TabKey>("All");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState(ANY);
  const [desig, setDesig] = useState(ANY);
  const [mgr, setMgr] = useState(ANY);
  const [loc, setLoc] = useState(ANY);
  const [type, setType] = useState(ANY);
  const [joinYear, setJoinYear] = useState(ANY);
  const [statusF, setStatusF] = useState(ANY);
  const [acctF, setAcctF] = useState(ANY);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [revealSalary, setRevealSalary] = useState(false);

  const designations = useMemo(() => [...new Set(rows.map((r) => r.designation))].sort(), [rows]);
  const managers = useMemo(() => [...new Set(rows.map((r) => r.manager))].sort(), [rows]);
  const years = useMemo(() => [...new Set(rows.map((r) => r.doj.slice(-4)))].sort().reverse(), [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((e) => {
      if (tab === "Active" && (e.status === "Exited" || e.status === "Onboarding")) return false;
      if (tab !== "All" && tab !== "Active" && e.status !== tab) return false;
      if (dept !== ANY && e.dept !== dept) return false;
      if (desig !== ANY && e.designation !== desig) return false;
      if (mgr !== ANY && e.manager !== mgr) return false;
      if (loc !== ANY && e.location !== loc) return false;
      if (type !== ANY && e.employmentType !== type) return false;
      if (joinYear !== ANY && !e.doj.endsWith(joinYear)) return false;
      if (statusF !== ANY && e.status !== statusF) return false;
      if (acctF !== ANY && e.account !== acctF) return false;
      if (!needle) return true;
      return [e.name, e.empId, e.designation, e.dept, e.location, e.manager]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [rows, tab, q, dept, desig, mgr, loc, type, joinYear, statusF, acctF]);

  const total = rows.length;
  const active = rows.filter((e) => e.status !== "Exited").length;
  const probation = rows.filter((e) => e.status === "Probation").length;
  const notice = rows.filter((e) => e.status === "Notice Period").length;

  const attention = useMemo(
    () =>
      rows
        .map((e) => ({ e, list: alertsFor(e) }))
        .filter((x) => x.list.length)
        .sort((a, b) => b.list.filter((l) => l.tone === "urgent").length - a.list.filter((l) => l.tone === "urgent").length),
    [rows],
  );

  const current = rows.find((r) => r.empId === openId) ?? null;

  const update = (empId: string, patch: Partial<MasterEmployee>, log: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.empId === empId
          ? {
              ...r,
              ...patch,
              history: [{ at: TODAY, by: "Anjali Kapoor (HR Head)", text: log }, ...r.history],
            }
          : r,
      ),
    );

  const resetFilters = () => {
    setDept(ANY);
    setDesig(ANY);
    setMgr(ANY);
    setLoc(ANY);
    setType(ANY);
    setJoinYear(ANY);
    setStatusF(ANY);
    setAcctF(ANY);
    setQ("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">
            One master record per person. Confidential fields stay masked until access is logged.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              placeholder="Search name, employee ID, role…"
              className="pl-8 sm:w-72"
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total Employees" value={total} />
        <Kpi label="Active Employees" value={active} tone="done" />
        <Kpi label="On Probation" value={probation} tone="pending" />
        <Kpi label="On Notice Period" value={notice} tone="urgent" />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-2 p-3 md:grid-cols-4 xl:grid-cols-8">
          <FilterSelect label="Department" value={dept} onChange={setDept} options={DEPTS} />
          <FilterSelect label="Designation" value={desig} onChange={setDesig} options={designations} />
          <FilterSelect label="Reporting manager" value={mgr} onChange={setMgr} options={managers} />
          <FilterSelect label="Work location" value={loc} onChange={setLoc} options={LOCATIONS} />
          <FilterSelect label="Employment type" value={type} onChange={setType} options={[...EMPLOYMENT_TYPES]} />
          <FilterSelect label="Joining year" value={joinYear} onChange={setJoinYear} options={years} />
          <FilterSelect label="Employee status" value={statusF} onChange={setStatusF} options={[...EMP_STATUSES]} />
          <FilterSelect label="User account" value={acctF} onChange={setAcctF} options={[...ACCOUNT_STATUSES]} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filtered.length} of {total} employees
        </span>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

      {/* Desktop table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Reporting manager</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Joining date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Account</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.empId} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar initials={e.photo} muted={e.status === "Exited"} />
                        <div>
                          <div className="font-medium">{e.name}</div>
                          <div className="text-[11px] tabular-nums text-muted-foreground">{e.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{e.designation}</td>
                    <td className="p-3">{e.dept}</td>
                    <td className="p-3 text-xs">{e.manager}</td>
                    <td className="p-3">{e.location}</td>
                    <td className="p-3 tabular-nums">{e.doj}</td>
                    <td className="p-3">
                      <Pill text={e.status} tone={STATUS_TONE[e.status]} />
                    </td>
                    <td className="p-3">
                      <Pill text={e.account} tone={ACCOUNT_TONE[e.account]} />
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setOpenId(e.empId)}>
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">
                      No employees match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((e) => (
          <Card key={e.empId}>
            <CardContent className="space-y-3 p-3">
              <div className="flex items-start gap-3">
                <Avatar initials={e.photo} muted={e.status === "Exited"} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{e.name}</div>
                  <div className="text-[11px] tabular-nums text-muted-foreground">{e.empId}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.designation} · {e.dept}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>Manager: {e.manager.split(" (")[0]}</span>
                <span>Location: {e.location}</span>
                <span>Joined: {e.doj}</span>
                <span>Type: {e.employmentType}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill text={e.status} tone={STATUS_TONE[e.status]} />
                <Pill text={`Account: ${e.account}`} tone={ACCOUNT_TONE[e.account]} />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setOpenId(e.empId)}>
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No employees match these filters.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Attention alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Attention needed ({attention.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {attention.map(({ e, list }) => (
            <div key={e.empId} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  {e.name} <span className="text-[11px] text-muted-foreground">· {e.empId}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setOpenId(e.empId)}>
                  Open
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {list.map((a) => (
                  <Pill key={a.text} text={a.text} tone={a.tone} />
                ))}
              </div>
            </div>
          ))}
          {!attention.length && (
            <div className="text-sm text-muted-foreground">All employee records are complete and up to date.</div>
          )}
        </CardContent>
      </Card>

      <ProfileSheet
        emp={current}
        onClose={() => {
          setOpenId(null);
          setRevealSalary(false);
        }}
        revealSalary={revealSalary}
        setRevealSalary={setRevealSalary}
        update={update}
      />

      <AddEmployeeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(emp) => setRows((p) => [emp, ...p])}
        rows={rows}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1 h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ---------------- Profile ---------------- */

const SECTIONS = [
  "Personal Details",
  "Employment Details",
  "Documents",
  "Attendance & Leave",
  "Performance & Training",
  "Letters, Notices & Warnings",
  "User Access",
  "Activity History",
] as const;
type SectionKey = (typeof SECTIONS)[number];

function ProfileSheet({
  emp,
  onClose,
  revealSalary,
  setRevealSalary,
  update,
}: {
  emp: MasterEmployee | null;
  onClose: () => void;
  revealSalary: boolean;
  setRevealSalary: (v: boolean) => void;
  update: (empId: string, patch: Partial<MasterEmployee>, log: string) => void;
}) {
  const [section, setSection] = useState<SectionKey>("Personal Details");
  const [confirm, setConfirm] = useState<null | { title: string; body: string; apply: () => void }>(null);
  const [statusDraft, setStatusDraft] = useState<EmpStatus>("Confirmed");
  const [mgrDraft, setMgrDraft] = useState("");
  const [revealDocs, setRevealDocs] = useState(false);

  if (!emp) return null;
  const alerts = alertsFor(emp);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Avatar initials={emp.photo} muted={emp.status === "Exited"} />
            <div className="text-left">
              <div>{emp.name}</div>
              <div className="text-xs font-normal text-muted-foreground">
                {emp.designation} · {emp.empId}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Pill text={emp.status} tone={STATUS_TONE[emp.status]} />
            <Pill text={`Account: ${emp.account}`} tone={ACCOUNT_TONE[emp.account]} />
            <Pill text={emp.employmentType} tone="muted" />
          </div>

          {!!alerts.length && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Attention</div>
              <ul className="mt-1 list-disc pl-4 text-xs text-amber-700 dark:text-amber-400">
                {alerts.map((a) => (
                  <li key={a.text}>{a.text}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success("Edit form opened for " + emp.name)}>
              <UserCog className="mr-1.5 h-3.5 w-3.5" /> Edit details
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setSection("Documents"); toast.info("Upload documents"); }}>
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload document
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("HR letter drafted for " + emp.name)}>
              <Mail className="mr-1.5 h-3.5 w-3.5" /> Send HR letter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => update(emp.empId, { reviewStatus: "Due" }, "Performance review started")}
            >
              <Star className="mr-1.5 h-3.5 w-3.5" /> Start review
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                update(
                  emp.empId,
                  { trainings: [...emp.trainings, { name: "Assigned training module", status: "Not Started" }] },
                  "Training assigned",
                )
              }
            >
              <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Assign training
            </Button>
            {emp.status !== "Exited" && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() =>
                  setConfirm({
                    title: "Start exit process?",
                    body: `${emp.name} will move to Notice Period. Clearance checklist and user-access deactivation will start. The record is never deleted.`,
                    apply: () =>
                      update(
                        emp.empId,
                        {
                          status: "Notice Period",
                          clearance: emp.clearance ?? [
                            { item: "Return company assets", done: false },
                            { item: "Handover pending work", done: false },
                            { item: "Deactivate dashboard access", done: false },
                            { item: "Final settlement to Accounts", done: false },
                          ],
                        },
                        "Exit process started — clearance checklist created",
                      ),
                  })
                }
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Start exit
              </Button>
            )}
          </div>

          {/* Section nav */}
          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  section === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {section === "Personal Details" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Full name" value={emp.name} />
              <Field label="Date of birth" value={emp.dob} />
              <Field label="Gender" value={emp.gender} />
              <Field label="Mobile number" value={emp.mobile} />
              <Field label="Personal email" value={emp.personalEmail} />
              <Field label="Blood group" value={emp.bloodGroup} />
              <Field label="Current address" value={emp.currentAddress} />
              <Field label="Permanent address" value={emp.permanentAddress} />
              <Field label="Emergency contact" value={emp.emergencyContact} />
              <Field label="Profile photo" value={`Initials avatar (${emp.photo})`} />
            </div>
          )}

          {section === "Employment Details" && (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Employee ID" value={emp.empId} mono />
                <Field label="Designation" value={emp.designation} />
                <Field label="Department" value={emp.dept} />
                <Field label="Reporting manager" value={emp.manager} />
                <Field label="Work location" value={emp.location} />
                <Field label="Employment type" value={emp.employmentType} />
                <Field label="Joining date" value={emp.doj} />
                <Field label="Probation end date" value={emp.probationEnd} />
                <Field label="Confirmation date" value={emp.confirmationDate} />
                <Field label="Current status" value={emp.status} />
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" /> Restricted: salary & bank
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Reveal</Label>
                    <Switch
                      checked={revealSalary}
                      onCheckedChange={(v) => {
                        setRevealSalary(v);
                        if (v) toast.info("Sensitive view logged in audit trail");
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <Field label="Annual CTC" value={revealSalary ? emp.ctc : "₹ ••••••"} />
                  <Field label="Bank account" value={revealSalary ? emp.bankMasked : "••••••"} />
                  <Field label="PAN" value={revealSalary ? emp.panMasked : "••••••"} />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">Change employment status</Label>
                  <div className="mt-2 flex gap-2">
                    <Select value={statusDraft} onValueChange={(v) => setStatusDraft(v as EmpStatus)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMP_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() =>
                        setConfirm({
                          title: "Change employment status?",
                          body: `${emp.name}: ${emp.status} → ${statusDraft}. Previous status is preserved in activity history.`,
                          apply: () =>
                            update(
                              emp.empId,
                              { status: statusDraft },
                              `Status changed: ${emp.status} → ${statusDraft}`,
                            ),
                        })
                      }
                    >
                      Apply
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <Label className="text-xs">Change reporting manager</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={mgrDraft}
                      onChange={(ev) => setMgrDraft(ev.target.value)}
                      placeholder="New manager name"
                      className="h-9 text-xs"
                    />
                    <Button
                      size="sm"
                      disabled={!mgrDraft.trim()}
                      onClick={() =>
                        setConfirm({
                          title: "Change reporting manager?",
                          body: `${emp.name}: ${emp.manager} → ${mgrDraft}. History is preserved.`,
                          apply: () => {
                            update(
                              emp.empId,
                              { manager: mgrDraft },
                              `Reporting manager changed: ${emp.manager} → ${mgrDraft}`,
                            );
                            setMgrDraft("");
                          },
                        })
                      }
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "Documents" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" /> Identity numbers are masked. Every view is logged.
                </div>
                <Switch
                  checked={revealDocs}
                  onCheckedChange={(v) => {
                    setRevealDocs(v);
                    if (v) toast.info("Document view recorded in audit log");
                  }}
                />
              </div>
              {emp.docs.map((d) => (
                <div key={d.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-muted-foreground" /> {d.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {d.ok ? `Uploaded ${d.updatedOn}` : "Not uploaded"}
                      {d.masked ? ` · ${revealDocs ? d.masked : "••••••"}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill text={d.ok ? "Verified" : "Missing"} tone={d.ok ? "done" : "urgent"} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update(
                          emp.empId,
                          {
                            docs: emp.docs.map((x) =>
                              x.name === d.name ? { ...x, ok: true, updatedOn: TODAY } : x,
                            ),
                          },
                          `Document updated: ${d.name}`,
                        )
                      }
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "Attendance & Leave" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Kpi label="Attendance" value={`${emp.attendancePct}%`} tone={emp.attendancePct >= 92 ? "done" : "pending"} />
                <Kpi label="Present days" value={emp.presentDays} />
                <Kpi label="Leaves taken" value={emp.leavesTaken} />
                <Kpi label="Leave balance" value={emp.leaveBalance} tone={emp.leaveBalance <= 1 ? "urgent" : "muted"} />
              </div>
              <Progress value={emp.attendancePct} />
              <div className="rounded-lg border p-3 text-sm">
                {emp.onLeaveToday
                  ? "On approved leave today."
                  : emp.status === "Exited"
                    ? "No attendance tracked after exit."
                    : "Present today · marked at 09:42 AM."}
              </div>
            </div>
          )}

          {section === "Performance & Training" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Kpi label="Rating" value={emp.rating ? emp.rating.toFixed(1) : "—"} />
                <Kpi label="Last review" value={emp.lastReview} />
                <Kpi label="Next review" value={emp.reviewDue} />
                <Kpi
                  label="Review status"
                  value={emp.reviewStatus}
                  tone={emp.reviewStatus === "Overdue" ? "urgent" : emp.reviewStatus === "Due" ? "pending" : "done"}
                />
              </div>
              <div className="space-y-2">
                {emp.trainings.map((t) => (
                  <div key={t.name} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>{t.name}</span>
                    <Pill
                      text={t.status}
                      tone={t.status === "Completed" ? "done" : t.status === "In Progress" ? "active" : "pending"}
                    />
                  </div>
                ))}
                {!emp.trainings.length && (
                  <div className="text-sm text-muted-foreground">No training assigned yet.</div>
                )}
              </div>
            </div>
          )}

          {section === "Letters, Notices & Warnings" && (
            <div className="space-y-2">
              {emp.letters.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">
                      {l.confidential ? "Confidential HR record" : l.kind}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {l.id} · Issued {l.issuedOn}
                      {l.confidential ? " · restricted to HR Head and CEO" : ""}
                    </div>
                  </div>
                  <Pill text={l.ack} tone={l.ack === "Acknowledged" ? "done" : "pending"} />
                </div>
              ))}
              {!emp.letters.length && (
                <div className="text-sm text-muted-foreground">No letters or notices on record.</div>
              )}
            </div>
          )}

          {section === "User Access" && (
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Dashboard account</div>
                    <div className="text-[11px] text-muted-foreground">{emp.workEmail}</div>
                  </div>
                  <Pill text={emp.account} tone={ACCOUNT_TONE[emp.account]} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update(emp.empId, { account: "Invited" }, "Secure account setup invitation sent (expires in 24h)")
                    }
                  >
                    Send setup invite
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => update(emp.empId, {}, "Password reset link sent (expires in 60 minutes)")}
                  >
                    Send password reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() =>
                      update(emp.empId, { account: "Deactivated" }, "User account deactivated")
                    }
                  >
                    Deactivate access
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  HR never creates, views or stores a password. Employees set their own password through an expiring
                  secure link.
                </p>
              </div>

              {emp.clearance && (
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Exit clearance</div>
                  <div className="mt-2 space-y-1.5">
                    {emp.clearance.map((c) => (
                      <div key={c.item} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle2
                            className={`h-4 w-4 ${c.done ? "text-emerald-600" : "text-muted-foreground"}`}
                          />
                          {c.item}
                        </span>
                        {!c.done && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              update(
                                emp.empId,
                                {
                                  clearance: emp.clearance!.map((x) =>
                                    x.item === c.item ? { ...x, done: true } : x,
                                  ),
                                },
                                `Clearance completed: ${c.item}`,
                              )
                            }
                          >
                            Mark done
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {section === "Activity History" && (
            <div className="space-y-2">
              {emp.history.map((h, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <History className="h-4 w-4 text-muted-foreground" /> {h.text}
                  </div>
                  <div className="mt-0.5 pl-6 text-[11px] text-muted-foreground">
                    {h.at} · by {h.by}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirm?.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{confirm?.body}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  confirm?.apply();
                  setConfirm(null);
                  toast.success("Change saved and recorded in activity history");
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- Add employee ---------------- */

function AddEmployeeDialog({
  open,
  onOpenChange,
  onCreate,
  rows,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (e: MasterEmployee) => void;
  rows: MasterEmployee[];
}) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [dept, setDept] = useState<Dept>("Sales");
  const [manager, setManager] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [empType, setEmpType] = useState<EmploymentType>("Full-time");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const previewId = nextEmpId(dept, rows);
  const dup = rows.find(
    (r) => r.mobile.replace(/\D/g, "") === mobile.replace(/\D/g, "") && mobile.replace(/\D/g, "").length >= 10,
  );

  const submit = () => {
    if (!name.trim() || !designation.trim()) {
      toast.error("Name and designation are required");
      return;
    }
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    onCreate({
      empId: previewId,
      name: name.trim(),
      photo: initials,
      dob: "—",
      gender: "Other",
      mobile: mobile || "—",
      personalEmail: email || "—",
      workEmail: `${name.trim().toLowerCase().replace(/\s+/g, ".")}@cleancraft.in`,
      currentAddress: "—",
      permanentAddress: "—",
      emergencyContact: "—",
      bloodGroup: "—",
      designation: designation.trim(),
      dept,
      manager: manager || "Anjali Kapoor (HR Head)",
      location,
      employmentType: empType,
      doj: TODAY,
      probationEnd: "02 Nov 2026",
      confirmationDate: "—",
      ctc: "Not set",
      bankMasked: "Not submitted",
      aadhaarMasked: "Not submitted",
      panMasked: "Not submitted",
      status: "Onboarding",
      account: "Not Created",
      docs: [
        "Aadhaar card",
        "PAN card",
        "Bank details",
        "Education documents",
        "Experience letters",
        "Previous salary slips",
        "Address proof",
        "Signed appointment letter",
      ].map((n) => ({ name: n, ok: false })),
      attendancePct: 100,
      presentDays: 0,
      leaveBalance: 0,
      leavesTaken: 0,
      onLeaveToday: false,
      lastReview: "—",
      reviewDue: "02 Nov 2026",
      reviewStatus: "Due",
      rating: 0,
      trainings: [],
      letters: [],
      history: [
        { at: TODAY, by: "Anjali Kapoor (HR Head)", text: `Employee record created${notes ? ` — ${notes}` : ""}` },
      ],
    });
    toast.success(`Employee created with ID ${previewId}`);
    onOpenChange(false);
    setName("");
    setDesignation("");
    setMobile("");
    setEmail("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Add employee
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IdCard className="h-4 w-4" /> Employee ID (permanent, never reused)
            </div>
            <div className="mt-1 font-mono text-sm font-semibold">{previewId}</div>
          </div>
          {dup && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              Possible duplicate: {dup.name} ({dup.empId}) already has this mobile number.
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Designation</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Department</Label>
              <Select value={dept} onValueChange={(v) => setDept(v as Dept)}>
                <SelectTrigger className="mt-1 h-9">
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
            </div>
            <div>
              <Label className="text-xs">Work location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Employment type</Label>
              <Select value={empType} onValueChange={(v) => setEmpType(v as EmploymentType)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Reporting manager</Label>
              <Input value={manager} onChange={(e) => setManager(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Mobile number</Label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Personal email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notes for activity history</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} />
          </div>
          <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5" />
            The record starts in Onboarding with an empty document checklist. No password is created here — send a
            secure setup invite from User Access.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
