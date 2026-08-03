import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Settings2,
  ShieldAlert,
  FileText,
  Building2,
  BriefcaseBusiness,
  FileCheck2,
  CalendarClock,
  TrendingUp,
  FileSignature,
  Bell,
  ShieldCheck,
  History,
  Plus,
  Lock,
  Check,
  Save,
  Archive,
  Upload,
  Send,
  AlertTriangle,
} from "lucide-react";
import {
  HR_POLICIES,
  POLICY_CATEGORIES,
  POLICY_TONE,
  DEPT_SETTINGS,
  EMPLOYMENT_SETTINGS,
  ONB_DOC_LIST,
  ONB_PROFILES,
  ONB_MATRIX,
  ATTENDANCE_SETTINGS,
  PERFORMANCE_SETTINGS,
  LETTER_TEMPLATES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENTS,
  PERM_ROLES,
  PERM_AREAS,
  PERM_MATRIX,
  isLockedPerm,
  SETTINGS_AUDIT,
  SAFETY_NOTE,
  nowStamp,
  type AuditEntry,
  type HrPolicy,
  type PolicyCategory,
  type PolicyStage,
  type PermRole,
  type OnbProfile,
} from "./settings-data";

type SectionKey =
  | "policies"
  | "departments"
  | "employment"
  | "onboarding"
  | "attendance"
  | "performance"
  | "templates"
  | "notifications"
  | "permissions"
  | "audit";

const SECTIONS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }>; sub: string }[] = [
  { key: "policies", label: "HR Policies", icon: FileText, sub: "Create, approve, publish and archive policies" },
  { key: "departments", label: "Departments & Designations", icon: Building2, sub: "Structure, heads and reporting" },
  { key: "employment", label: "Employment Settings", icon: BriefcaseBusiness, sub: "Types, probation, notice, checklists" },
  { key: "onboarding", label: "Onboarding Requirements", icon: FileCheck2, sub: "Mandatory documents by employment type" },
  { key: "attendance", label: "Attendance & Leave Rules", icon: CalendarClock, sub: "Working days, shifts, leave rules" },
  { key: "performance", label: "Performance Settings", icon: TrendingUp, sub: "Cycles, areas, ratings, training rules" },
  { key: "templates", label: "Letter Templates", icon: FileSignature, sub: "Approved templates and versions" },
  { key: "notifications", label: "Notifications", icon: Bell, sub: "Channels, reminders and escalation" },
  { key: "permissions", label: "Permissions", icon: ShieldCheck, sub: "Least-privilege role access" },
  { key: "audit", label: "Audit Log", icon: History, sub: "Every change with reason and approval" },
];

type PendingChange = {
  area: string;
  item: string;
  from: string;
  to: string;
  warning?: string;
  needsApproval?: boolean;
  apply: () => void;
};

export function HrSettings() {
  const [section, setSection] = useState<SectionKey>("policies");
  const [audit, setAudit] = useState<AuditEntry[]>(SETTINGS_AUDIT);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [reason, setReason] = useState("");

  const record = (e: Omit<AuditEntry, "at" | "by">) =>
    setAudit((prev) => [{ at: nowStamp(), by: "Anjali Kapoor (HR Head)", ...e }, ...prev]);

  const confirmChange = (c: PendingChange) => {
    setReason("");
    setPending(c);
  };

  const Section = SECTIONS.find((s) => s.key === section)!;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Settings2 className="h-6 w-6 text-primary" /> HR Policies & Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure company policies, structures and HR rules. Changes are versioned and recorded.
        </p>
      </div>

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="flex items-start gap-2 p-3 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-600" />
          <span>{SAFETY_NOTE}</span>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* settings submenu */}
        <div>
          <div className="lg:hidden">
            <Select value={section} onValueChange={(v) => setSection(v as SectionKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card className="hidden lg:block">
            <CardContent className="space-y-1 p-2">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const on = s.key === section;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSection(s.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      on ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{Section.label}</h2>
            <p className="text-sm text-muted-foreground">{Section.sub}</p>
          </div>

          {section === "policies" && <PoliciesPane onRecord={record} onConfirm={confirmChange} />}
          {section === "departments" && <DepartmentsPane onConfirm={confirmChange} />}
          {section === "employment" && <EmploymentPane onConfirm={confirmChange} />}
          {section === "onboarding" && <OnboardingPane onConfirm={confirmChange} />}
          {section === "attendance" && <AttendancePane onConfirm={confirmChange} />}
          {section === "performance" && <PerformancePane onConfirm={confirmChange} />}
          {section === "templates" && <TemplatesPane onConfirm={confirmChange} />}
          {section === "notifications" && <NotificationsPane onConfirm={confirmChange} />}
          {section === "permissions" && <PermissionsPane onConfirm={confirmChange} />}
          {section === "audit" && <AuditPane rows={audit} />}
        </div>
      </div>

      {/* confirmation */}
      <Dialog open={!!pending} onOpenChange={(v) => !v && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm change</DialogTitle>
            <DialogDescription>
              {pending?.item} — {pending?.area}
            </DialogDescription>
          </DialogHeader>
          {pending && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded border p-2">
                  <div className="text-[11px] uppercase text-muted-foreground">Previous</div>
                  <div className="font-medium">{pending.from || "—"}</div>
                </div>
                <div className="rounded border p-2">
                  <div className="text-[11px] uppercase text-muted-foreground">New</div>
                  <div className="font-medium">{pending.to || "—"}</div>
                </div>
              </div>
              {pending.warning && (
                <div className="flex items-start gap-2 rounded border border-amber-500/40 bg-amber-500/5 p-2 text-xs">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                  <span>{pending.warning}</span>
                </div>
              )}
              {pending.needsApproval && (
                <div className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/5 p-2 text-xs">
                  <Lock className="mt-0.5 h-4 w-4 text-destructive" />
                  <span>This change requires CEO or System Administrator approval before it takes effect.</span>
                </div>
              )}
              <div>
                <Label className="text-xs">Reason for change (required)</Label>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this change needed?" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPending(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!reason.trim()}
                  onClick={() => {
                    pending.apply();
                    record({
                      area: pending.area,
                      item: pending.item,
                      from: pending.from,
                      to: pending.to,
                      reason: reason.trim(),
                      approval: pending.needsApproval ? "Sent for CEO approval" : "HR Head authorised",
                    });
                    toast.success(
                      pending.needsApproval ? "Change sent for approval and recorded" : "Change saved and recorded",
                    );
                    setPending(null);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" /> Confirm change
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- HR Policies ---------------- */
function PoliciesPane({
  onRecord,
  onConfirm,
}: {
  onRecord: (e: Omit<AuditEntry, "at" | "by">) => void;
  onConfirm: (c: PendingChange) => void;
}) {
  const [policies, setPolicies] = useState<HrPolicy[]>(HR_POLICIES);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const open = policies.find((p) => p.id === openId) ?? null;

  const setStage = (id: string, stage: PolicyStage, note: string, needsApproval = false) => {
    const p = policies.find((x) => x.id === id)!;
    onConfirm({
      area: "HR Policies",
      item: `${p.title} (${p.version})`,
      from: p.stage,
      to: stage,
      needsApproval,
      warning:
        stage === "Published"
          ? "Publishing makes this policy visible privately on applicable employee dashboards and locks this version from editing."
          : stage === "Archived"
            ? "Archiving hides the policy from employees but keeps it and its acknowledgement history permanently."
            : undefined,
      apply: () => {
        setPolicies((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  stage,
                  updatedOn: nowStamp(),
                  versions: x.versions.map((v) => (v.v === x.version ? { ...v, locked: stage !== "Draft" } : v)),
                }
              : x,
          ),
        );
        toast.success(note);
      },
    });
  };

  const newVersion = (id: string) => {
    const p = policies.find((x) => x.id === id)!;
    const next = `v${Number(p.version.replace("v", "").split(".")[0]) + 1}.0`;
    onConfirm({
      area: "HR Policies",
      item: p.title,
      from: p.version,
      to: next,
      warning: "The published version stays locked and preserved. Employees will be asked to acknowledge the new version.",
      apply: () => {
        setPolicies((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  version: next,
                  stage: "Draft",
                  ackDone: 0,
                  updatedOn: nowStamp(),
                  versions: [
                    { v: next, at: nowStamp(), by: "Anjali Kapoor (HR Head)", note: "New version uploaded", document: `${x.id.toLowerCase()}-${next}.pdf`, locked: false },
                    ...x.versions,
                  ],
                }
              : x,
          ),
        );
        toast.success(`New draft version ${next} created`);
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create policy
        </Button>
      </div>

      {policies.map((p) => (
        <Card key={p.id}>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{p.title}</span>
                <Badge variant="secondary" className={POLICY_TONE[p.stage]}>
                  {p.stage}
                </Badge>
                <Badge variant="outline">{p.version}</Badge>
                <Badge variant="outline">{p.category}</Badge>
              </div>
              <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Effective {p.effectiveDate} · {p.applicability} · Approval: {p.approver}
                {p.ackRequired && ` · Acknowledgement by ${p.ackDeadline}`}
              </div>
              {p.ackRequired && (
                <div className="mt-2 max-w-xs">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Acknowledged</span>
                    <span>
                      {p.ackDone}/{p.ackTotal}
                    </span>
                  </div>
                  <Progress value={p.ackTotal ? (p.ackDone / p.ackTotal) * 100 : 0} className="mt-1 h-1.5" />
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {p.stage === "Draft" && (
                <Button size="sm" variant="outline" onClick={() => setStage(p.id, "Awaiting Approval", "Submitted for approval", true)}>
                  <Send className="mr-2 h-4 w-4" /> Submit for approval
                </Button>
              )}
              {p.stage === "Awaiting Approval" && (
                <Button size="sm" variant="outline" onClick={() => setStage(p.id, "Approved", "Approval recorded", true)}>
                  <Check className="mr-2 h-4 w-4" /> Record approval
                </Button>
              )}
              {p.stage === "Approved" && (
                <Button size="sm" onClick={() => setStage(p.id, "Published", "Policy published to applicable employees")}>
                  Publish
                </Button>
              )}
              {p.stage === "Published" && (
                <Button size="sm" onClick={() => setStage(p.id, "Acknowledgement Pending", "Acknowledgement requested")}>
                  Request acknowledgement
                </Button>
              )}
              {p.stage === "Acknowledgement Pending" && (
                <Button size="sm" onClick={() => setStage(p.id, "Active", "Policy marked active")}>
                  Mark active
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => newVersion(p.id)}>
                <Upload className="mr-2 h-4 w-4" /> New version
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpenId(p.id)}>
                Details
              </Button>
              {p.stage !== "Archived" && (
                <Button size="sm" variant="ghost" onClick={() => setStage(p.id, "Archived", "Policy archived")}>
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.title}</SheetTitle>
                <SheetDescription>
                  {open.category} · {open.version} · {open.stage}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <div>{open.description}</div>
                <Separator />
                <Field label="Effective date" value={open.effectiveDate} />
                <Field label="Applicable employees" value={open.applicability} />
                <Field label="Policy document" value={open.document} />
                <Field label="Approval authority" value={open.approver} />
                <Field label="Acknowledgement deadline" value={open.ackDeadline} />
                <Field label="Acknowledgements" value={`${open.ackDone}/${open.ackTotal} employees`} />
                <Separator />
                <div className="text-sm font-semibold">Version history (preserved)</div>
                {open.versions.map((v) => (
                  <div key={v.v} className="rounded border p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {v.v} · {v.document}
                      </span>
                      {v.locked ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" /> Locked
                        </Badge>
                      ) : (
                        <Badge variant="outline">Editable draft</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {v.at} · {v.by} — {v.note}
                    </div>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground">
                  Published versions cannot be edited. Corrections must be issued as a new version, and employee
                  acknowledgement history is never removed.
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CreatePolicy
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(p) => {
          setPolicies((prev) => [p, ...prev]);
          onRecord({ area: "HR Policies", item: p.title, from: "—", to: "Draft created", reason: "New policy drafted" });
          setCreating(false);
          toast.success("Policy saved as draft");
        }}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-1.5 last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function CreatePolicy({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (p: HrPolicy) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PolicyCategory>("Attendance & Leave");
  const [description, setDescription] = useState("");
  const [effective, setEffective] = useState("");
  const [applicability, setApplicability] = useState("All departments · All locations");
  const [approver, setApprover] = useState("CEO");
  const [deadline, setDeadline] = useState("");
  const [ack, setAck] = useState(true);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create policy</DialogTitle>
          <DialogDescription>Saved as a draft. Approval is required before publishing.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Policy title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mobile & Device Use Policy" />
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PolicyCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POLICY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Effective date</Label>
              <Input value={effective} onChange={(e) => setEffective(e.target.value)} placeholder="01 Sep 2026" />
            </div>
            <div>
              <Label className="text-xs">Acknowledgement deadline</Label>
              <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="15 Sep 2026" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Applicable employees, roles or departments</Label>
            <Input value={applicability} onChange={(e) => setApplicability(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Approval authority</Label>
            <Select value={approver} onValueChange={setApprover}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="System Administrator">System Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded border p-2">
            <div className="text-sm">Request employee acknowledgement</div>
            <Switch checked={ack} onCheckedChange={setAck} />
          </div>
          <div className="rounded border p-2 text-xs text-muted-foreground">
            Policy document upload is captured as a file reference. Version v1.0 is created automatically.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!title.trim() || !effective.trim()}
              onClick={() =>
                onCreate({
                  id: `POL-${Math.floor(10 + Math.random() * 80)}`,
                  title: title.trim(),
                  category,
                  description: description.trim() || "—",
                  effectiveDate: effective.trim(),
                  applicability,
                  document: `${title.trim().toLowerCase().replace(/\s+/g, "-")}-v1.pdf`,
                  version: "v1.0",
                  approver,
                  ackDeadline: deadline.trim() || "—",
                  ackRequired: ack,
                  stage: "Draft",
                  ackDone: 0,
                  ackTotal: 26,
                  updatedOn: nowStamp(),
                  versions: [
                    { v: "v1.0", at: nowStamp(), by: "Anjali Kapoor (HR Head)", note: "Draft created", document: "draft.pdf", locked: false },
                  ],
                  history: [],
                })
              }
            >
              <Save className="mr-2 h-4 w-4" /> Save draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Departments ---------------- */
function DepartmentsPane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [rows, setRows] = useState(DEPT_SETTINGS);

  const toggle = (id: string) => {
    const d = rows.find((x) => x.id === id)!;
    onConfirm({
      area: "Departments & Designations",
      item: d.name,
      from: d.active ? "Active" : "Inactive",
      to: d.active ? "Inactive" : "Active",
      warning: d.linkedEmployees
        ? `${d.linkedEmployees} employee records are linked to this department. Records are preserved — the department is only hidden from new selections.`
        : undefined,
      apply: () => setRows((prev) => prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x))),
    });
  };

  return (
    <div className="space-y-3">
      {rows.map((d) => (
        <Card key={d.id}>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{d.name}</span>
                <Badge variant="secondary" className={d.active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : ""}>
                  {d.active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">{d.linkedEmployees} linked records</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Head: {d.head} · Reports to {d.reportsTo} · {d.location}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {d.designations.map((x) => (
                  <span key={x} className="rounded-full border px-2 py-0.5 text-xs">
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">Active</span>
              <Switch checked={d.active} onCheckedChange={() => toggle(d.id)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="text-xs text-muted-foreground">
        Departments and designations linked to historical employee records can be deactivated but never deleted.
      </div>
    </div>
  );
}

/* ---------------- Employment ---------------- */
function EmploymentPane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [s, setS] = useState(EMPLOYMENT_SETTINGS);
  const [probation, setProbation] = useState(String(s.probationMonths));
  const [notice, setNotice] = useState(String(s.noticeDays));
  const [idFormat, setIdFormat] = useState(s.idFormat);
  const [confirmDays, setConfirmDays] = useState(String(s.confirmationReviewDays));

  const save = () =>
    onConfirm({
      area: "Employment Settings",
      item: "Employment rules",
      from: `Probation ${s.probationMonths}m · Notice ${s.noticeDays}d · ID ${s.idFormat} · Review ${s.confirmationReviewDays}d`,
      to: `Probation ${probation}m · Notice ${notice}d · ID ${idFormat} · Review ${confirmDays}d`,
      warning:
        "New rules apply to future joiners and future confirmations only. Existing employee records keep the terms recorded at joining.",
      apply: () =>
        setS((p) => ({
          ...p,
          probationMonths: Number(probation) || p.probationMonths,
          noticeDays: Number(notice) || p.noticeDays,
          idFormat,
          confirmationReviewDays: Number(confirmDays) || p.confirmationReviewDays,
        })),
    });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Core rules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Probation duration (months)</Label>
            <Input value={probation} onChange={(e) => setProbation(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Notice period (days)</Label>
            <Input value={notice} onChange={(e) => setNotice(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Employee ID format</Label>
            <Input value={idFormat} onChange={(e) => setIdFormat(e.target.value)} />
            <div className="mt-1 text-xs text-muted-foreground">Example: CC-SALES-2026-0062</div>
          </div>
          <div>
            <Label className="text-xs">Confirmation review before probation end (days)</Label>
            <Input value={confirmDays} onChange={(e) => setConfirmDays(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button size="sm" onClick={save}>
              <Save className="mr-2 h-4 w-4" /> Save employment settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToggleList
          title="Employment types"
          items={s.types.map((t) => ({ label: t.name, on: t.active }))}
          onToggle={(label, next) =>
            onConfirm({
              area: "Employment Settings",
              item: `Employment type · ${label}`,
              from: next ? "Inactive" : "Active",
              to: next ? "Active" : "Inactive",
              warning: "Existing employees on this type are unaffected.",
              apply: () => setS((p) => ({ ...p, types: p.types.map((t) => (t.name === label ? { ...t, active: next } : t)) })),
            })
          }
        />
        <ToggleList
          title="Working locations"
          items={s.locations.map((t) => ({ label: t.name, on: t.active }))}
          onToggle={(label, next) =>
            onConfirm({
              area: "Employment Settings",
              item: `Location · ${label}`,
              from: next ? "Inactive" : "Active",
              to: next ? "Active" : "Inactive",
              apply: () => setS((p) => ({ ...p, locations: p.locations.map((t) => (t.name === label ? { ...t, active: next } : t)) })),
            })
          }
        />
        <ToggleList
          title="Joining checklist"
          items={s.joining.map((t) => ({ label: t.item, on: t.on }))}
          onToggle={(label, next) =>
            onConfirm({
              area: "Employment Settings",
              item: `Joining checklist · ${label}`,
              from: next ? "Off" : "On",
              to: next ? "On" : "Off",
              warning: "Active onboarding records will show this change in their checklist.",
              apply: () => setS((p) => ({ ...p, joining: p.joining.map((t) => (t.item === label ? { ...t, on: next } : t)) })),
            })
          }
        />
        <ToggleList
          title="Exit checklist"
          items={s.exit.map((t) => ({ label: t.item, on: t.on }))}
          onToggle={(label, next) =>
            onConfirm({
              area: "Employment Settings",
              item: `Exit checklist · ${label}`,
              from: next ? "Off" : "On",
              to: next ? "On" : "Off",
              warning: "Employees currently serving notice will see the updated clearance list.",
              apply: () => setS((p) => ({ ...p, exit: p.exit.map((t) => (t.item === label ? { ...t, on: next } : t)) })),
            })
          }
        />
      </div>
    </div>
  );
}

function ToggleList({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: { label: string; on: boolean }[];
  onToggle: (label: string, next: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((i) => (
          <div key={i.label} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
            <span className="text-sm">{i.label}</span>
            <Switch checked={i.on} onCheckedChange={(v) => onToggle(i.label, v)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ---------------- Onboarding requirements ---------------- */
function OnboardingPane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [profile, setProfile] = useState<OnbProfile>("Full-time");
  const [matrix, setMatrix] = useState(ONB_MATRIX);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Mandatory documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={profile} onValueChange={(v) => setProfile(v as OnbProfile)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ONB_PROFILES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-1">
          {ONB_DOC_LIST.map((d) => (
            <div key={d} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
              <span className="text-sm">{d}</span>
              <Switch
                checked={!!matrix[profile][d]}
                onCheckedChange={(v) =>
                  onConfirm({
                    area: "Onboarding Requirements",
                    item: `${profile} · ${d}`,
                    from: matrix[profile][d] ? "Mandatory" : "Optional",
                    to: v ? "Mandatory" : "Optional",
                    warning: "Employees already onboarding will see this requirement change in their checklist.",
                    apply: () =>
                      setMatrix((prev) => ({ ...prev, [profile]: { ...prev[profile], [d]: v } })),
                  })
                }
              />
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Only document requirements are configured here. Document numbers and scans stay inside Onboarding & Documents.
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Attendance ---------------- */
function AttendancePane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [s, setS] = useState(ATTENDANCE_SETTINGS);
  const [grace, setGrace] = useState(String(s.graceMinutes));
  const [lateMarks, setLateMarks] = useState(String(s.lateMarksForHalfDay));
  const [halfHours, setHalfHours] = useState(String(s.halfDayMinHours));
  const [cutOff, setCutOff] = useState(String(s.cutOffDay));
  const [regWindow, setRegWindow] = useState(String(s.regularisationWindowDays));

  return (
    <div className="space-y-4">
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="p-3 text-xs text-muted-foreground">
          Rule changes apply from the next attendance cycle only. Historical attendance and approved leave are never
          recalculated.
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ToggleList
          title="Working days"
          items={s.workingDays.map((d) => ({ label: d.day, on: d.on }))}
          onToggle={(label, next) =>
            onConfirm({
              area: "Attendance & Leave",
              item: `Working day · ${label}`,
              from: next ? "Non-working" : "Working",
              to: next ? "Working" : "Non-working",
              warning: "Affects future attendance calculations and shift rosters.",
              apply: () => setS((p) => ({ ...p, workingDays: p.workingDays.map((d) => (d.day === label ? { ...d, on: next } : d)) })),
            })
          }
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shift timings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {s.shifts.map((sh) => (
              <div key={sh.name} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
                <div>
                  <div className="text-sm">{sh.name}</div>
                  <div className="text-xs text-muted-foreground">{sh.timing}</div>
                </div>
                <Badge variant={sh.active ? "secondary" : "outline"}>{sh.active ? "Active" : "Inactive"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Late, half-day & cut-off rules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Grace period (minutes)</Label>
              <Input value={grace} onChange={(e) => setGrace(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Late marks equal to one half-day</Label>
              <Input value={lateMarks} onChange={(e) => setLateMarks(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Minimum hours for half-day</Label>
              <Input value={halfHours} onChange={(e) => setHalfHours(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Attendance cut-off (day of month)</Label>
              <Input value={cutOff} onChange={(e) => setCutOff(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Regularisation window (days)</Label>
              <Input value={regWindow} onChange={(e) => setRegWindow(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                onClick={() =>
                  onConfirm({
                    area: "Attendance & Leave",
                    item: "Attendance rules",
                    from: `Grace ${s.graceMinutes}m · ${s.lateMarksForHalfDay} late marks · cut-off ${s.cutOffDay} · window ${s.regularisationWindowDays}d`,
                    to: `Grace ${grace}m · ${lateMarks} late marks · cut-off ${cutOff} · window ${regWindow}d`,
                    warning: "Applies to the next cycle. Past attendance stays unchanged.",
                    apply: () =>
                      setS((p) => ({
                        ...p,
                        graceMinutes: Number(grace) || p.graceMinutes,
                        lateMarksForHalfDay: Number(lateMarks) || p.lateMarksForHalfDay,
                        halfDayMinHours: Number(halfHours) || p.halfDayMinHours,
                        cutOffDay: Number(cutOff) || p.cutOffDay,
                        regularisationWindowDays: Number(regWindow) || p.regularisationWindowDays,
                      })),
                  })
                }
              >
                <Save className="mr-2 h-4 w-4" /> Save rules
              </Button>
            </div>
            <div className="text-xs text-muted-foreground sm:col-span-2">
              Regularisation approval flow: {s.regularisationApproval}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Holiday calendar 2026</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {s.holidays.map((hd) => (
              <div key={hd.date} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
                <span>{hd.name}</span>
                <span className="text-muted-foreground">{hd.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leave types, entitlement & carry-forward</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2">Leave type</th>
                    <th>Entitlement</th>
                    <th>Carry-forward</th>
                    <th>Approval workflow</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {s.leaveTypes.map((l) => (
                    <tr key={l.name} className="border-b last:border-0">
                      <td className="py-2">{l.name}</td>
                      <td className="tabular-nums">{l.entitlement} days</td>
                      <td className="tabular-nums">{l.carryForward} days</td>
                      <td className="text-muted-foreground">{l.approval}</td>
                      <td>
                        <Badge variant={l.active ? "secondary" : "outline"}>{l.active ? "Active" : "Inactive"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Performance ---------------- */
function PerformancePane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [s, setS] = useState(PERFORMANCE_SETTINGS);
  const [pipWeeks, setPipWeeks] = useState(String(s.pipReviewWeeks));
  const [trainDays, setTrainDays] = useState(String(s.mandatoryTrainingDays));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Review cycles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {s.cycles.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
              <div>
                <div className="text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.months}</div>
              </div>
              <Switch
                checked={c.active}
                onCheckedChange={(v) =>
                  onConfirm({
                    area: "Performance Settings",
                    item: `Review cycle · ${c.name}`,
                    from: c.active ? "Active" : "Inactive",
                    to: v ? "Active" : "Inactive",
                    warning: "Open review cycles already in progress are not affected.",
                    apply: () => setS((p) => ({ ...p, cycles: p.cycles.map((x) => (x.name === c.name ? { ...x, active: v } : x)) })),
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <ToggleList
        title="Performance areas"
        items={s.areas.map((a) => ({ label: a.name, on: a.on }))}
        onToggle={(label, next) =>
          onConfirm({
            area: "Performance Settings",
            item: `Performance area · ${label}`,
            from: next ? "Off" : "On",
            to: next ? "On" : "Off",
            warning: "Completed reviews keep the areas they were rated on.",
            apply: () => setS((p) => ({ ...p, areas: p.areas.map((a) => (a.name === label ? { ...a, on: next } : a)) })),
          })
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rating labels & goal period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {s.ratings.map((r) => (
              <Badge key={r} variant="outline">
                {r}
              </Badge>
            ))}
          </div>
          <div>
            <Label className="text-xs">Goal period</Label>
            <Select
              value={s.goalPeriod}
              onValueChange={(v) =>
                onConfirm({
                  area: "Performance Settings",
                  item: "Goal period",
                  from: s.goalPeriod,
                  to: v,
                  apply: () => setS((p) => ({ ...p, goalPeriod: v })),
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Monthly", "Quarterly", "Half-yearly", "Annual"].map((x) => (
                  <SelectItem key={x} value={x}>
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Review responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {s.responsibilities.map((r) => (
            <div key={r.role} className="border-b py-2 text-sm last:border-0">
              <div className="font-medium">{r.role}</div>
              <div className="text-xs text-muted-foreground">{r.duty}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Improvement plans & mandatory training</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs">Improvement-plan review frequency (weeks)</Label>
            <Input value={pipWeeks} onChange={(e) => setPipWeeks(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Mandatory training completion window (days)</Label>
            <Input value={trainDays} onChange={(e) => setTrainDays(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              size="sm"
              onClick={() =>
                onConfirm({
                  area: "Performance Settings",
                  item: "Improvement & training rules",
                  from: `PIP ${s.pipReviewWeeks}w · Training ${s.mandatoryTrainingDays}d`,
                  to: `PIP ${pipWeeks}w · Training ${trainDays}d`,
                  apply: () =>
                    setS((p) => ({
                      ...p,
                      pipReviewWeeks: Number(pipWeeks) || p.pipReviewWeeks,
                      mandatoryTrainingDays: Number(trainDays) || p.mandatoryTrainingDays,
                    })),
                })
              }
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
          <div className="sm:col-span-3">
            <div className="flex items-center justify-between rounded border border-destructive/40 bg-destructive/5 p-3">
              <div>
                <div className="text-sm font-medium">Automated disciplinary decisions</div>
                <div className="text-xs text-muted-foreground">
                  Permanently disabled. Warnings and improvement plans always require human review and written evidence.
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" /> Off
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Templates ---------------- */
function TemplatesPane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [rows, setRows] = useState(LETTER_TEMPLATES);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = rows.find((r) => r.id === openId) ?? null;

  const newVersion = (id: string) => {
    const t = rows.find((x) => x.id === id)!;
    const next = `v${Number(t.version.replace("v", "").split(".")[0]) + 1}.0`;
    onConfirm({
      area: "Letter Templates",
      item: t.name,
      from: t.version,
      to: next,
      warning: "The published version is preserved and stays available for previously issued letters.",
      apply: () =>
        setRows((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  version: next,
                  status: "Draft",
                  updatedOn: nowStamp(),
                  versions: [{ v: next, at: nowStamp(), by: "Anjali Kapoor (HR Head)", note: "New draft version" }, ...x.versions],
                }
              : x,
          ),
        ),
    });
  };

  return (
    <div className="space-y-3">
      {rows.map((t) => (
        <Card key={t.id}>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{t.name}</span>
                <Badge variant="outline">{t.version}</Badge>
                <Badge
                  variant="secondary"
                  className={
                    t.status === "Published"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : t.status === "Draft"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : ""
                  }
                >
                  {t.status}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Updated {t.updatedOn} · Approval: {t.approver} · Fields: {t.fields.join(", ")}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpenId(t.id)}>
                Versions
              </Button>
              <Button size="sm" variant="outline" onClick={() => newVersion(t.id)}>
                <Upload className="mr-2 h-4 w-4" /> New version
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.name}</SheetTitle>
                <SheetDescription>Version history is preserved permanently.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {open.versions.map((v) => (
                  <div key={v.v} className="rounded border p-2 text-xs">
                    <div className="font-medium">{v.v}</div>
                    <div className="text-muted-foreground">
                      {v.at} · {v.by} — {v.note}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------------- Notifications ---------------- */
function NotificationsPane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [channels, setChannels] = useState(NOTIFICATION_CHANNELS);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {channels.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
              <div>
                <div className="text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.note}</div>
              </div>
              <Switch
                checked={c.on}
                disabled={!c.ready}
                onCheckedChange={(v) =>
                  onConfirm({
                    area: "Notifications",
                    item: c.name,
                    from: c.on ? "On" : "Off",
                    to: v ? "On" : "Off",
                    apply: () => setChannels((prev) => prev.map((x) => (x.name === c.name ? { ...x, on: v } : x))),
                  })
                }
              />
            </div>
          ))}
          <div className="pt-2 text-xs text-muted-foreground">
            Email, SMS and WhatsApp are placeholders. External delivery is not activated yet.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Reminders & escalation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIFICATION_EVENTS.map((e) => (
            <div key={e.name} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
              <span>{e.name}</span>
              <span className="text-muted-foreground">{e.frequency}</span>
            </div>
          ))}
          <div className="pt-2 text-xs text-muted-foreground">
            Notification previews never include salary, identity, medical or disciplinary details.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Permissions ---------------- */
function PermissionsPane({ onConfirm }: { onConfirm: (c: PendingChange) => void }) {
  const [matrix, setMatrix] = useState(PERM_MATRIX);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Role access (least privilege)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="py-2">Access area</th>
                {PERM_ROLES.map((r) => (
                  <th key={r} className="px-2 text-center">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERM_AREAS.map((a) => (
                <tr key={a} className="border-b last:border-0">
                  <td className="py-2 pr-2">{a}</td>
                  {PERM_ROLES.map((r) => {
                    const locked = isLockedPerm(r as PermRole, a);
                    return (
                      <td key={r} className="px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Switch
                            checked={!!matrix[r as PermRole][a]}
                            disabled={locked}
                            onCheckedChange={(v) =>
                              onConfirm({
                                area: "Permissions",
                                item: `${r} · ${a}`,
                                from: matrix[r as PermRole][a] ? "Allowed" : "Not allowed",
                                to: v ? "Allowed" : "Not allowed",
                                needsApproval: r === "CEO" || r === "System Administrator",
                                warning: "Access changes take effect at the next sign-in for affected users.",
                                apply: () =>
                                  setMatrix((prev) => ({
                                    ...prev,
                                    [r as PermRole]: { ...prev[r as PermRole], [a]: v },
                                  })),
                              })
                            }
                          />
                          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Locked cells cannot be changed by the HR Head. CEO and System Administrator privileges can only be granted with
          CEO approval, and the HR Head can never grant these privileges silently.
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Audit ---------------- */
function AuditPane({ rows }: { rows: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Change record</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="rounded border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium">
                {r.area} — {r.item}
              </div>
              <div className="text-xs text-muted-foreground">
                {r.at} · {r.by}
              </div>
            </div>
            <div className="mt-1 text-xs">
              <span className="text-muted-foreground">Previous: </span>
              {r.from || "—"}
              <span className="mx-2 text-muted-foreground">→</span>
              <span className="text-muted-foreground">New: </span>
              {r.to || "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Reason: {r.reason}</div>
            {r.approval && <div className="text-xs text-muted-foreground">Approval: {r.approval}</div>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
