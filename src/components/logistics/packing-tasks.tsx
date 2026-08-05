import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Lock,
  MapPin,
  Mic,
  Package,
  Plus,
  ShieldAlert,
  Truck,
  Volume2,
} from "lucide-react";
import {
  ACCEPTED_CLEARANCES,
  CORRECTION_REASONS,
  HELP_TOPICS,
  MATERIALS,
  PACKING_CHECKS,
  PACK_STATUS_LABEL,
  PACK_STATUS_LABEL_HI,
  PACK_STATUS_TONE,
  PACK_TASKS,
  STAFF,
  TODAY,
  type PackStatus,
  type PackTask,
} from "./packing-data";

const TABS: { key: string; label: string; match: PackStatus[] }[] = [
  { key: "unassigned", label: "Not Assigned", match: ["not_assigned"] },
  { key: "assigned", label: "Assigned", match: ["assigned", "accepted", "reassigned"] },
  { key: "progress", label: "In Progress", match: ["in_progress", "info_required", "blocked"] },
  { key: "review", label: "Waiting for Review", match: ["waiting_review"] },
  { key: "correction", label: "Correction Required", match: ["correction_required"] },
  { key: "approved", label: "Approved", match: ["approved", "ready_for_dispatch"] },
  { key: "cancelled", label: "Cancelled", match: ["cancelled"] },
  { key: "all", label: "All", match: [] },
];

const ITEM_TYPES = [
  "Laundry Machine",
  "Dry-Cleaning Machine",
  "Finishing Equipment",
  "POS Equipment",
  "Spare Parts",
  "Chemicals",
  "Consumables",
  "Packaging Materials",
  "Other Approved Item",
];

const ACTIVE: PackStatus[] = [
  "not_assigned",
  "assigned",
  "accepted",
  "in_progress",
  "correction_required",
  "reassigned",
];

const isOverdue = (t: PackTask) =>
  ACTIVE.includes(t.status) &&
  t.deadline < TODAY &&
  !t.clearanceSuspended &&
  !(t.help && !t.help.resolved); // a genuine reported problem pauses the task

const daysTo = (d: string) =>
  Math.round((new Date(d).getTime() - new Date(TODAY).getTime()) / 86400000);

function priorityTone(p: PackTask["priority"]) {
  if (p === "urgent") return "bg-destructive/10 text-destructive border-destructive/20";
  if (p === "high") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
}

export function LogisticsPackingTasks() {
  const [tasks, setTasks] = useState<PackTask[]>(PACK_TASKS);
  const [tab, setTab] = useState("unassigned");
  const [openId, setOpenId] = useState<string | null>(null);
  const [staffMode, setStaffMode] = useState(false);

  // filters
  const [fStaff, setFStaff] = useState("all");
  const [fProject, setFProject] = useState("all");
  const [fStore, setFStore] = useState("all");
  const [fItem, setFItem] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fDue, setFDue] = useState("");
  const [fDispatch, setFDispatch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const patch = (id: string, up: Partial<PackTask>, log?: { by: string; action: string }) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === id
          ? {
              ...t,
              ...up,
              history: log
                ? [...t.history, { at: `${TODAY} now`, by: log.by, action: log.action }]
                : t.history,
            }
          : t,
      ),
    );

  const counts = useMemo(() => {
    const c = (f: (t: PackTask) => boolean) => tasks.filter(f).length;
    return {
      notAssigned: c((t) => t.status === "not_assigned"),
      inProgress: c((t) => ["in_progress", "assigned", "accepted", "reassigned"].includes(t.status)),
      review: c((t) => t.status === "waiting_review"),
      correction: c((t) => t.status === "correction_required"),
      ready: c((t) => ["approved", "ready_for_dispatch"].includes(t.status)),
      overdue: c(isOverdue),
    };
  }, [tasks]);

  const alerts = useMemo(() => {
    const list: { tone: "red" | "amber"; text: string }[] = [];
    tasks.forEach((t) => {
      if (t.clearanceSuspended)
        list.push({ tone: "red", text: `${t.taskId} · Accounts clearance ${t.clearanceId} suspended — packing paused` });
      if (t.status === "not_assigned" && t.priority === "urgent")
        list.push({ tone: "red", text: `${t.taskId} · Urgent packing not assigned (${t.store})` });
      if (isOverdue(t))
        list.push({ tone: "red", text: `${t.taskId} · Packing overdue since ${t.deadline}` });
      else if (ACTIVE.includes(t.status) && daysTo(t.deadline) >= 0 && daysTo(t.deadline) <= 1)
        list.push({ tone: "amber", text: `${t.taskId} · Packing deadline approaching (${t.deadline})` });
      if (t.help && !t.help.resolved)
        list.push({ tone: "amber", text: `${t.taskId} · Staff reported: ${t.help.topic} — task paused` });
      if (t.status === "waiting_review")
        list.push({ tone: "amber", text: `${t.taskId} · Packing waiting for review` });
      if (t.returnCount >= 2)
        list.push({ tone: "amber", text: `${t.taskId} · Returned ${t.returnCount} times — check staff support` });
      if (ACTIVE.includes(t.status) && daysTo(t.launchDate) <= 10)
        list.push({ tone: "amber", text: `${t.taskId} · Launch date approaching (${t.launchDate})` });
    });
    return list;
  }, [tasks]);

  const filtered = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    return tasks.filter((r) => {
      if (t.match.length && !t.match.includes(r.status)) return false;
      if (fStaff !== "all" && r.staff !== fStaff) return false;
      if (fProject !== "all" && r.projectId !== fProject) return false;
      if (fStore !== "all" && r.store !== fStore) return false;
      if (fItem !== "all" && !r.items.some((i) => i.type === fItem)) return false;
      if (fPriority !== "all" && r.priority !== fPriority) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fDue && r.deadline > fDue) return false;
      if (fDispatch && !r.dispatchId.toLowerCase().includes(fDispatch.toLowerCase())) return false;
      return true;
    });
  }, [tasks, tab, fStaff, fProject, fStore, fItem, fPriority, fStatus, fDue, fDispatch]);

  const open = tasks.find((t) => t.taskId === openId) || null;

  if (open) {
    return staffMode ? (
      <StaffScreen
        task={open}
        onBack={() => setStaffMode(false)}
        patch={patch}
      />
    ) : (
      <TaskDetail
        task={open}
        onBack={() => setOpenId(null)}
        onStaffMode={() => setStaffMode(true)}
        patch={patch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Packing Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Create, assign, monitor and review packing after an accepted Accounts dispatch clearance.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Packing Task
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Not Assigned" value={counts.notAssigned} />
        <Kpi label="Packing in Progress" value={counts.inProgress} tone="blue" />
        <Kpi label="Waiting for Review" value={counts.review} tone="amber" />
        <Kpi label="Correction Required" value={counts.correction} tone="amber" />
        <Kpi label="Ready for Dispatch" value={counts.ready} tone="green" />
        <Kpi label="Overdue Tasks" value={counts.overdue} tone="red" />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-md border px-3 py-2 text-sm ${
                  a.tone === "red"
                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">
              {t.label}
              <span className="ml-1 text-muted-foreground">
                ({t.match.length ? tasks.filter((r) => t.match.includes(r.status)).length : tasks.length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Packing Staff" value={fStaff} onChange={setFStaff} options={STAFF} />
          <FilterSelect
            label="Franchise project"
            value={fProject}
            onChange={setFProject}
            options={[...new Set(tasks.map((t) => t.projectId))]}
          />
          <FilterSelect
            label="Store"
            value={fStore}
            onChange={setFStore}
            options={[...new Set(tasks.map((t) => t.store))]}
          />
          <FilterSelect label="Item type" value={fItem} onChange={setFItem} options={ITEM_TYPES} />
          <FilterSelect label="Priority" value={fPriority} onChange={setFPriority} options={["urgent", "high", "normal"]} />
          <FilterSelect
            label="Packing status"
            value={fStatus}
            onChange={setFStatus}
            options={Object.keys(PACK_STATUS_LABEL)}
            render={(k) => PACK_STATUS_LABEL[k as PackStatus]}
          />
          <div className="space-y-1">
            <Label className="text-xs">Due date (on or before)</Label>
            <Input type="date" value={fDue} onChange={(e) => setFDue(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Dispatch ID</Label>
            <Input placeholder="DSP-…" value={fDispatch} onChange={(e) => setFDispatch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((t) => (
          <TaskCard key={t.taskId} task={t} onView={() => setOpenId(t.taskId)} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No packing tasks in this view.</p>
        )}
      </div>

      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(t) => {
          setTasks((prev) => [t, ...prev]);
          toast.success(`${t.taskId} created and linked to ${t.dispatchId} / ${t.clearanceId}`);
        }}
        existing={tasks}
      />
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "blue" | "amber" | "green" | "red" }) {
  const cls =
    tone === "green"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : tone === "red"
          ? "text-destructive"
          : tone === "blue"
            ? "text-primary"
            : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {render ? render(o) : o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TaskCard({ task, onView }: { task: PackTask; onView: () => void }) {
  const overdue = isOverdue(task);
  return (
    <Card className={overdue ? "border-destructive/40" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{task.taskId}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {task.dispatchId} · {task.clearanceId} · {task.projectId}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className={priorityTone(task.priority)}>
              {task.priority}
            </Badge>
            <Badge variant="outline" className={PACK_STATUS_TONE[task.status]}>
              {PACK_STATUS_LABEL[task.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {task.store} · {task.city}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> {task.items.length} items
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Packing Staff</p>
            <p className="font-medium">{task.staff ?? "Not assigned"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Packing deadline</p>
            <p className={`font-medium ${overdue ? "text-destructive" : ""}`}>{task.deadline}</p>
          </div>
        </div>
        {task.clearanceSuspended && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <ShieldAlert className="h-4 w-4" /> Clearance suspended — packing paused
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={onView}>
          View Task
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- Task detail ------------------------------ */

function TaskDetail({
  task,
  onBack,
  onStaffMode,
  patch,
}: {
  task: PackTask;
  onBack: () => void;
  onStaffMode: () => void;
  patch: (id: string, up: Partial<PackTask>, log?: { by: string; action: string }) => void;
}) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [correctOpen, setCorrectOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [appChecks, setAppChecks] = useState<Record<string, boolean>>({});
  const [reviewer, setReviewer] = useState("Logistics Executive");
  const approveGate = ["items", "quality", "labels", "photos", "count"];
  const canApprove = approveGate.every((k) => appChecks[k]);

  const [cReason, setCReason] = useState(CORRECTION_REASONS[0]);
  const [cAffected, setCAffected] = useState(task.items[0]?.packageNo ?? "");
  const [cEn, setCEn] = useState("");
  const [cHi, setCHi] = useState("");
  const [cDeadline, setCDeadline] = useState("");

  const [issueText, setIssueText] = useState("");
  const [newStaff, setNewStaff] = useState(STAFF[0]);
  const [reassignReason, setReassignReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const suspended = task.clearanceSuspended;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Packing Tasks
        </Button>
        <Button variant="outline" size="sm" onClick={onStaffMode}>
          Open Packing Staff screen
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>{task.taskId}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {task.store} · {task.city} · {task.dispatchId} · {task.clearanceId} · {task.projectId}
              </p>
            </div>
            <Badge variant="outline" className={PACK_STATUS_TONE[task.status]}>
              {PACK_STATUS_LABEL[task.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-4">
          <Field label="Packing type" value={task.packingType} />
          <Field label="Packing Staff" value={task.staff ?? "Not assigned"} />
          <Field label="Deadline" value={task.deadline} />
          <Field label="Priority" value={task.priority} />
          <Field label="Photo proof required" value={task.photoProofRequired ? "Yes" : "No"} />
          <Field label="Logistics review required" value={task.reviewRequired ? "Yes" : "No"} />
          <Field label="Start time" value={task.startedAt ?? "—"} />
          <Field label="Completion time" value={task.completedAt ?? "—"} />
          <div className="sm:col-span-4">
            <p className="text-xs text-muted-foreground">Special handling instructions</p>
            <p>{task.instructions}</p>
            <p className="text-muted-foreground">{task.instructionsHi}</p>
          </div>
          <div className="sm:col-span-4">
            <p className="text-xs text-muted-foreground">Label instructions</p>
            <p>{task.labelInstructions}</p>
          </div>
        </CardContent>
      </Card>

      {suspended && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" /> Accounts suspended clearance {task.clearanceId}. Packing is paused
          and review actions are blocked. Existing packing activity is preserved.
        </div>
      )}

      {task.help && !task.help.resolved && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-amber-700">
              <HelpCircle className="h-4 w-4" /> Problem reported by staff — task paused
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">{task.help.topic}</span> — {task.help.detail} ({task.help.at})
            </p>
            <p className="text-xs text-muted-foreground">
              Deadline is not counted against Packing Staff while a genuine problem is open.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                patch(
                  task.taskId,
                  { help: { ...task.help!, resolved: true }, status: "in_progress" },
                  { by: "Logistics Executive", action: `Problem resolved: ${task.help!.topic}. Packing resumed.` },
                )
              }
            >
              Mark problem resolved & resume
            </Button>
          </CardContent>
        </Card>
      )}

      {task.correction && task.status === "correction_required" && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-700">Correction required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Reason:</span> {task.correction.reason}</p>
            <p><span className="text-muted-foreground">Affected:</span> {task.correction.affected}</p>
            <p>{task.correction.en}</p>
            <p className="text-muted-foreground">{task.correction.hi}</p>
            <p className="text-xs text-muted-foreground">New deadline: {task.correction.newDeadline}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Item details & approved quantities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {task.items.map((it) => (
            <div key={it.code} className="rounded-lg border p-3">
              <div className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-3xl">
                  {it.emoji}
                </div>
                <div className="min-w-0 space-y-1 text-sm">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.nameHi} · {it.type}</p>
                  <p className="text-xs">
                    Approved qty <span className="font-semibold">{it.approvedQty}</span> ·{" "}
                    {it.packageNo} · Serial: {it.serialRequired ? (it.serial ?? "to record") : "not applicable"}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {it.fragile && <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Fragile</Badge>}
                    {it.heavy && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Heavy</Badge>}
                    {it.materials.map((m) => (
                      <Badge key={m} variant="secondary" className="font-normal">{m}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Label: {it.label}</p>
                  <p className="text-xs">{it.handling} <span className="text-muted-foreground">/ {it.handlingHi}</span></p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {(task.status === "waiting_review" || task.completedAt) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" /> Packing review submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Staff member" value={task.staff ?? "—"} />
              <Field label="Start time" value={task.startedAt ?? "—"} />
              <Field label="Completion time" value={task.completedAt ?? "—"} />
              <Field label="Package count" value={String(task.packageCount ?? "—")} />
            </div>
            <Separator />
            <div className="grid gap-2 sm:grid-cols-2">
              {PACKING_CHECKS.map((c) => (
                <div key={c.key} className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-4 w-4 ${task.checks[c.key] ? "text-emerald-600" : "text-muted-foreground/40"}`}
                  />
                  <span className={task.checks[c.key] ? "" : "text-muted-foreground"}>{c.en}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-3">
              <PhotoBox label="Item photos" count={task.itemPhotos} />
              <PhotoBox label="Packed-package photos" count={task.packagePhotos} />
              <PhotoBox label="Label photos" count={task.labelPhotos} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Staff comments</p>
              <p>{task.staffComment || "—"}</p>
              {task.voiceNote && (
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Mic className="h-3.5 w-3.5" /> Voice note placeholder (recording not enabled yet)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Logistics review actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={suspended || task.status !== "waiting_review"} onClick={() => setApproveOpen(true)}>
            Approve Packing
          </Button>
          <Button variant="outline" disabled={suspended || task.status !== "waiting_review"} onClick={() => setCorrectOpen(true)}>
            Return for Correction
          </Button>
          <Button variant="outline" disabled={suspended} onClick={() => setIssueOpen(true)}>
            Report Item Issue
          </Button>
          <Button variant="outline" disabled={suspended} onClick={() => setReassignOpen(true)}>
            Reassign Task
          </Button>
          <Button variant="destructive" disabled={task.status === "cancelled"} onClick={() => setCancelOpen(true)}>
            Cancel with Reason
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {task.history.map((h, i) => (
            <div key={i} className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">{h.at} · {h.by}</p>
              <p>{h.action}</p>
            </div>
          ))}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Financial and payment details from Accounts are not shown to Packing Staff.
          </p>
        </CardContent>
      </Card>

      {/* Approve */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve packing — {task.taskId}</DialogTitle>
            <DialogDescription>Confirm all five points before approving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { k: "items", l: "Item and quantity confirmed" },
              { k: "quality", l: "Packing quality confirmed" },
              { k: "labels", l: "Labels confirmed" },
              { k: "photos", l: "Photos reviewed" },
              { k: "count", l: "Package count confirmed" },
            ].map((c) => (
              <label key={c.k} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={!!appChecks[c.k]}
                  onCheckedChange={(v) => setAppChecks((p) => ({ ...p, [c.k]: !!v }))}
                />
                {c.l}
              </label>
            ))}
            <div className="space-y-1 pt-2">
              <Label className="text-xs">Reviewer name</Label>
              <Input value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!canApprove || !reviewer.trim()}
              onClick={() => {
                patch(
                  task.taskId,
                  { status: "ready_for_dispatch", reviewer, approvedAt: `${TODAY} now` },
                  {
                    by: reviewer,
                    action: `Packing approved. Dispatch Planning updated to Ready for Dispatch on ${task.dispatchId}.`,
                  },
                );
                setApproveOpen(false);
                toast.success(`Approved — ${task.dispatchId} is now Ready for Dispatch`);
              }}
            >
              Approve & send to Dispatch Planning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return for correction */}
      <Dialog open={correctOpen} onOpenChange={setCorrectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for correction — {task.taskId}</DialogTitle>
            <DialogDescription>The same Packing Task ID is reused. No new task is created.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Correction reason</Label>
              <Select value={cReason} onValueChange={setCReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CORRECTION_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Item or package affected</Label>
              <Select value={cAffected} onValueChange={setCAffected}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {task.items.map((i) => (
                    <SelectItem key={i.code} value={i.packageNo}>{i.packageNo} · {i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Simple English instruction</Label>
              <Textarea value={cEn} onChange={(e) => setCEn(e.target.value)} placeholder="Add one more layer of bubble wrap." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hindi instruction / हिंदी निर्देश</Label>
              <Textarea value={cHi} onChange={(e) => setCHi(e.target.value)} placeholder="एक और बबल रैप की तह लगाइए।" />
            </div>
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
              Reference photo (optional) — upload placeholder
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New deadline</Label>
              <Input type="date" value={cDeadline} onChange={(e) => setCDeadline(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!cEn.trim() || !cHi.trim() || !cDeadline}
              onClick={() => {
                patch(
                  task.taskId,
                  {
                    status: "correction_required",
                    returnCount: task.returnCount + 1,
                    deadline: cDeadline,
                    correction: { reason: cReason, affected: cAffected, en: cEn, hi: cHi, newDeadline: cDeadline },
                  },
                  { by: "Logistics Executive", action: `Returned for correction — ${cReason} (${cAffected}). Same Packing Task ID retained.` },
                );
                setCorrectOpen(false);
                toast.success("Returned for correction");
              }}
            >
              Send correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report item issue */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report item issue — {task.taskId}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            placeholder="Item unavailable, quantity mismatch, damage found…"
          />
          <DialogFooter>
            <Button
              disabled={!issueText.trim()}
              onClick={() => {
                patch(task.taskId, { status: "blocked" }, { by: "Logistics Executive", action: `Item issue reported: ${issueText}` });
                setIssueOpen(false);
                toast.success("Item issue recorded");
              }}
            >
              Record issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign task — {task.taskId}</DialogTitle>
            <DialogDescription>Previous ownership history is preserved.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">New Packing Staff</Label>
              <Select value={newStaff} onValueChange={setNewStaff}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAFF.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reason</Label>
              <Textarea value={reassignReason} onChange={(e) => setReassignReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!reassignReason.trim()}
              onClick={() => {
                patch(
                  task.taskId,
                  { staff: newStaff, status: "reassigned" },
                  { by: "Logistics Executive", action: `Reassigned from ${task.staff ?? "unassigned"} to ${newStaff} — ${reassignReason}. Same Packing Task ID.` },
                );
                setReassignOpen(false);
                toast.success(`Reassigned to ${newStaff}`);
              }}
            >
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel packing task — {task.taskId}</DialogTitle>
          </DialogHeader>
          <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation" />
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={!cancelReason.trim()}
              onClick={() => {
                patch(task.taskId, { status: "cancelled" }, { by: "Logistics Executive", action: `Cancelled — ${cancelReason}. History preserved.` });
                setCancelOpen(false);
                toast.success("Task cancelled");
              }}
            >
              Cancel task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}

function PhotoBox({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 flex gap-2">
        {count > 0 ? (
          Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex h-12 w-12 items-center justify-center rounded bg-muted">
              <Camera className="h-4 w-4 text-muted-foreground" />
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No photos</span>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Packing Staff screen -------------------------- */

function StaffScreen({
  task,
  onBack,
  patch,
}: {
  task: PackTask;
  onBack: () => void;
  patch: (id: string, up: Partial<PackTask>, log?: { by: string; action: string }) => void;
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>(task.checks);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState(HELP_TOPICS[0].en);
  const [helpDetail, setHelpDetail] = useState("");
  const [photos, setPhotos] = useState({ item: task.itemPhotos, pack: task.packagePhotos, label: task.labelPhotos });
  const [packages, setPackages] = useState(String(task.packageCount ?? task.items.length));

  const allChecked = PACKING_CHECKS.every((c) => checks[c.key]);
  const photosOk = !task.photoProofRequired || (photos.item > 0 && photos.pack > 0 && photos.label > 0);
  const started = ["in_progress", "correction_required"].includes(task.status) || !!task.startedAt;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back / वापस
      </Button>

      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="text-lg font-semibold">{task.store} · {task.city}</p>
          <p className="text-sm text-muted-foreground">{task.taskId}</p>
          <Badge variant="outline" className={PACK_STATUS_TONE[task.status]}>
            {PACK_STATUS_LABEL[task.status]} / {PACK_STATUS_LABEL_HI[task.status]}
          </Badge>
          <p className="pt-2 text-base">{task.instructions}</p>
          <p className="text-base text-muted-foreground">{task.instructionsHi}</p>
          <Button variant="outline" size="sm" className="mt-2">
            <Volume2 className="mr-2 h-4 w-4" /> Listen / सुनिए (audio coming soon)
          </Button>
        </CardContent>
      </Card>

      {task.correction && task.status === "correction_required" && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="space-y-1 p-5 text-amber-900">
            <p className="text-lg font-semibold">Fix this / यह ठीक कीजिए</p>
            <p className="text-base">{task.correction.en}</p>
            <p className="text-base">{task.correction.hi}</p>
          </CardContent>
        </Card>
      )}

      {task.items.map((it) => (
        <Card key={it.code}>
          <CardContent className="space-y-3 p-5">
            <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-7xl">{it.emoji}</div>
            <p className="text-xl font-semibold">{it.name}</p>
            <p className="text-lg text-muted-foreground">{it.nameHi}</p>
            <p className="text-2xl font-bold">
              {it.approvedQty} <span className="text-base font-normal text-muted-foreground">pcs / नग</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {it.fragile && <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Fragile / नाज़ुक</Badge>}
              {it.heavy && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Heavy / भारी</Badge>}
            </div>
            <p className="text-base">Use / लगाइए: {it.materials.join(", ")}</p>
            <p className="text-base">Package: {it.packageNo} · Label: {it.label}</p>
            <p className="text-base">{it.handling} / {it.handlingHi}</p>
          </CardContent>
        </Card>
      ))}

      {!started ? (
        <Button
          size="lg"
          className="h-16 w-full text-lg"
          onClick={() => {
            patch(task.taskId, { status: "in_progress", startedAt: `${TODAY} now` }, { by: task.staff ?? "Packing Staff", action: "Packing started — start time recorded." });
            toast.success("Packing started / पैकिंग शुरू");
          }}
        >
          Start Packing / पैकिंग शुरू करें
        </Button>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Checklist / जाँच सूची</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PACKING_CHECKS.map((c) => (
              <label key={c.key} className="flex items-start gap-3 rounded-lg border p-3">
                <Checkbox
                  className="mt-1 h-6 w-6"
                  checked={!!checks[c.key]}
                  onCheckedChange={(v) => setChecks((p) => ({ ...p, [c.key]: !!v }))}
                />
                <span>
                  <span className="block text-base">{c.en}</span>
                  <span className="block text-base text-muted-foreground">{c.hi}</span>
                </span>
              </label>
            ))}
            <Separator />
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "item" as const, l: "Item photo" },
                { k: "pack" as const, l: "Package photo" },
                { k: "label" as const, l: "Label photo" },
              ].map((p) => (
                <Button
                  key={p.k}
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => setPhotos((prev) => ({ ...prev, [p.k]: prev[p.k] + 1 }))}
                >
                  <Camera className="mb-1 h-5 w-5" />
                  <span className="text-xs">{p.l}</span>
                  <span className="text-xs text-muted-foreground">{photos[p.k]}</span>
                </Button>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-base">Package count / पैकेट की गिनती</Label>
              <Input className="h-12 text-lg" value={packages} onChange={(e) => setPackages(e.target.value)} inputMode="numeric" />
            </div>
            <Button
              size="lg"
              className="h-16 w-full text-lg"
              disabled={!allChecked || !photosOk || !packages}
              onClick={() => {
                patch(
                  task.taskId,
                  {
                    status: "waiting_review",
                    checks,
                    completedAt: `${TODAY} now`,
                    packageCount: Number(packages),
                    itemPhotos: photos.item,
                    packagePhotos: photos.pack,
                    labelPhotos: photos.label,
                    correction: null,
                  },
                  { by: task.staff ?? "Packing Staff", action: `Packing completed and submitted for review — ${packages} packages.` },
                );
                toast.success("Sent for review / जाँच के लिए भेजा");
              }}
            >
              Packing Completed / पैकिंग पूरी हुई
            </Button>
            {(!allChecked || !photosOk) && (
              <p className="text-center text-sm text-muted-foreground">
                Complete all checks and photos first / पहले सारी जाँच और फोटो पूरी कीजिए
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Button variant="outline" size="lg" className="h-16 w-full text-lg" onClick={() => setHelpOpen(true)}>
        <HelpCircle className="mr-2 h-5 w-5" /> Need Help / मदद चाहिए
      </Button>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Truck className="h-3.5 w-3.5" /> You see only your assigned work and approved item information.
      </p>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Need Help / मदद चाहिए</DialogTitle>
            <DialogDescription>Your task will pause. Deadline will not count against you.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {HELP_TOPICS.map((h) => (
              <Button
                key={h.en}
                variant={helpTopic === h.en ? "default" : "outline"}
                className="h-14 w-full justify-start text-base"
                onClick={() => setHelpTopic(h.en)}
              >
                {h.en} / {h.hi}
              </Button>
            ))}
            <Textarea value={helpDetail} onChange={(e) => setHelpDetail(e.target.value)} placeholder="Optional detail / वैकल्पिक" />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                patch(
                  task.taskId,
                  {
                    status: "info_required",
                    help: { topic: helpTopic, detail: helpDetail || "—", at: `${TODAY} now`, resolved: false },
                  },
                  { by: task.staff ?? "Packing Staff", action: `Reported problem: ${helpTopic}. Task paused — deadline not counted against staff.` },
                );
                setHelpOpen(false);
                toast.success("Problem reported / दिक्कत भेज दी");
              }}
            >
              Send / भेजें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Create dialog ------------------------------ */

function CreateDialog({
  open,
  onOpenChange,
  onCreate,
  existing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (t: PackTask) => void;
  existing: PackTask[];
}) {
  const [clearance, setClearance] = useState("");
  const [staff, setStaff] = useState("");
  const [packingType, setPackingType] = useState<PackTask["packingType"]>("Carton Packing");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<PackTask["priority"]>("normal");
  const [instructions, setInstructions] = useState("");
  const [instructionsHi, setInstructionsHi] = useState("");
  const [labelInstructions, setLabelInstructions] = useState("");
  const [materials, setMaterials] = useState<string[]>(["Corrugated Box", "Tape", "Labels"]);
  const [photoProof, setPhotoProof] = useState(true);
  const [reviewReq, setReviewReq] = useState(true);

  const source = ACCEPTED_CLEARANCES.find((c) => c.clearanceId === clearance);
  const duplicate = !!source && existing.some((t) => t.clearanceId === source.clearanceId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create packing task</DialogTitle>
          <DialogDescription>
            Only accepted Dispatch Clearances can start packing. One task per clearance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Accepted Dispatch Clearance</Label>
            <Select value={clearance} onValueChange={setClearance}>
              <SelectTrigger><SelectValue placeholder="Select clearance" /></SelectTrigger>
              <SelectContent>
                {ACCEPTED_CLEARANCES.map((c) => (
                  <SelectItem key={c.clearanceId} value={c.clearanceId}>
                    {c.clearanceId} · {c.dispatchId} · {c.store}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {source && (
            <div className="rounded-md border p-3 text-sm">
              <p><span className="text-muted-foreground">Dispatch ID:</span> {source.dispatchId}</p>
              <p><span className="text-muted-foreground">Project ID:</span> {source.projectId}</p>
              <p><span className="text-muted-foreground">Franchise / store:</span> {source.store}</p>
              <p><span className="text-muted-foreground">Approved items:</span> {source.items} (quantities carried from clearance)</p>
            </div>
          )}

          {duplicate && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> A packing task already exists for this clearance. Duplicate tasks are not allowed.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Packing Staff</Label>
              <Select value={staff} onValueChange={setStaff}>
                <SelectTrigger><SelectValue placeholder="Assign later" /></SelectTrigger>
                <SelectContent>
                  {STAFF.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Packing type</Label>
              <Select value={packingType} onValueChange={(v) => setPackingType(v as PackTask["packingType"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Machine Crating", "Carton Packing", "Mixed Packing", "Fragile Packing"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Packing deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as PackTask["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["urgent", "high", "normal"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Packing materials required</Label>
            <div className="flex flex-wrap gap-2">
              {MATERIALS.map((m) => (
                <Badge
                  key={m}
                  variant={materials.includes(m) ? "default" : "outline"}
                  className="cursor-pointer font-normal"
                  onClick={() =>
                    setMaterials((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]))
                  }
                >
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Special handling instructions (English)</Label>
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Special handling instructions (हिंदी)</Label>
            <Textarea value={instructionsHi} onChange={(e) => setInstructionsHi(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label instructions</Label>
            <Textarea value={labelInstructions} onChange={(e) => setLabelInstructions(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={photoProof} onCheckedChange={(v) => setPhotoProof(!!v)} /> Photo proof required
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={reviewReq} onCheckedChange={(v) => setReviewReq(!!v)} /> Logistics review required
          </label>
        </div>
        <DialogFooter>
          <Button
            disabled={!source || duplicate || !deadline}
            onClick={() => {
              if (!source) return;
              const id = `PKT-${String(300 + existing.length).padStart(6, "0")}`;
              onCreate({
                taskId: id,
                dispatchId: source.dispatchId,
                clearanceId: source.clearanceId,
                projectId: source.projectId,
                store: source.store,
                city: source.store.replace("Clean Craft ", ""),
                staff: staff || null,
                items: Array.from({ length: source.items }).map((_, i) => ({
                  code: `IT-0${i + 1}`,
                  name: `Approved item ${i + 1}`,
                  nameHi: `मंज़ूर सामान ${i + 1}`,
                  type: "Other Approved Item",
                  approvedQty: 1,
                  serial: null,
                  serialRequired: false,
                  fragile: false,
                  heavy: false,
                  materials: materials as PackTask["items"][number]["materials"],
                  packageNo: `PKG-${i + 1}`,
                  label: `${source.store.replace("Clean Craft ", "")} · ${source.projectId} · ${i + 1} of ${source.items}`,
                  handling: instructions || "—",
                  handlingHi: instructionsHi || "—",
                  emoji: "📦",
                })),
                packingType,
                instructions,
                instructionsHi,
                labelInstructions,
                deadline,
                priority,
                photoProofRequired: photoProof,
                reviewRequired: reviewReq,
                status: staff ? "assigned" : "not_assigned",
                checks: {},
                itemPhotos: 0,
                packagePhotos: 0,
                labelPhotos: 0,
                returnCount: 0,
                clearanceSuspended: false,
                launchDate: "2026-09-01",
                history: [
                  {
                    at: `${TODAY} now`,
                    by: "Logistics Executive",
                    action: `Packing task ${id} created from accepted clearance ${source.clearanceId} (Dispatch ${source.dispatchId})${staff ? ` and assigned to ${staff}` : ""}.`,
                  },
                ],
              });
              onOpenChange(false);
            }}
          >
            Create packing task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
