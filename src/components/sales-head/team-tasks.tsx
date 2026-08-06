import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ListChecks, Clock, AlertTriangle, CheckCircle2, Eye, Plus, Filter, X,
  CalendarDays, Users, KanbanSquare, ShieldAlert, Paperclip, RotateCcw, Ban,
  History, Flame, ArrowRightLeft,
} from "lucide-react";

/* ------------------------------ shared CRM data ------------------------------ */

export const TASK_EXECUTIVES = [
  { name: "Ravi Sharma", territory: "Rajasthan", leads: 34 },
  { name: "Neha Kulkarni", territory: "Maharashtra", leads: 29 },
  { name: "Amit Bansal", territory: "Delhi NCR", leads: 41 },
  { name: "Deepak Verma", territory: "Madhya Pradesh", leads: 22 },
  { name: "Sneha Iyer", territory: "Karnataka", leads: 26 },
];

const TASK_TYPES = [
  "Lead Action",
  "Call Review",
  "Proposal Preparation",
  "Document Collection",
  "Meeting Preparation",
  "Payment Coordination",
  "Customer Issue",
  "Training",
  "Reporting",
  "General Task",
] as const;

const STATUSES = ["Not Started", "In Progress", "Awaiting Review", "Completed", "Cancelled"] as const;
const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

type TaskType = (typeof TASK_TYPES)[number];
type Status = (typeof STATUSES)[number];
type Priority = (typeof PRIORITIES)[number];

type ChecklistItem = { text: string; done: boolean };
type HistoryItem = { at: string; note: string };

export type TeamTask = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  leadId?: string;
  leadName?: string;
  owner: string;
  createdBy: string;
  priority: Priority;
  status: Status;
  startDate: string; // ISO date
  dueAt: string; // ISO datetime
  checklist: ChecklistItem[];
  attachments: string[];
  reviewRequired: boolean;
  reviewSubmittedAt?: string;
  reminder: string;
  instructions: string[];
  progressNotes: { at: string; note: string }[];
  rescheduleCount: number;
  history: HistoryItem[];
  completedAt?: string;
  cancelReason?: string;
};

/* ------------------------------ helpers ------------------------------ */

const NOW = new Date();
const iso = (dayOffset: number, hour: number, min = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};
const dateOnly = (dayOffset: number) => iso(dayOffset, 9).slice(0, 10);
const stamp = () =>
  new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const fmtDue = (s: string) => {
  const d = new Date(s);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function remaining(t: TeamTask) {
  if (t.status === "Completed" || t.status === "Cancelled") return { label: "—", overdue: false, hours: 0 };
  const diffMs = new Date(t.dueAt).getTime() - Date.now();
  const hrs = diffMs / 3_600_000;
  const abs = Math.abs(hrs);
  const txt = abs >= 24 ? `${Math.floor(abs / 24)}d ${Math.floor(abs % 24)}h` : abs >= 1 ? `${Math.floor(abs)}h` : `${Math.max(1, Math.round(abs * 60))}m`;
  return { label: hrs < 0 ? `Overdue by ${txt}` : `${txt} left`, overdue: hrs < 0, hours: hrs };
}

const statusTone: Record<Status, string> = {
  "Not Started": "bg-muted text-foreground",
  "In Progress": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "Awaiting Review": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Cancelled: "bg-muted text-muted-foreground line-through",
};

const priorityTone: Record<Priority, string> = {
  Critical: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  High: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  Medium: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  Low: "bg-muted text-muted-foreground",
};

/* attention rules */
function attentionFlags(t: TeamTask): string[] {
  const f: string[] = [];
  if (t.status === "Completed" || t.status === "Cancelled") return f;
  const r = remaining(t);
  if (t.priority === "Critical" && !r.overdue && r.hours <= 1) f.push("Critical task due within 1 hour");
  if (r.overdue && r.hours > -24) f.push("Overdue");
  if (r.hours <= -24) f.push("Overdue by more than 24 hours");
  if (t.rescheduleCount >= 2) f.push(`Rescheduled ${t.rescheduleCount} times`);
  if (t.status === "Awaiting Review" && t.reviewSubmittedAt && Date.now() - new Date(t.reviewSubmittedAt).getTime() > 24 * 3_600_000)
    f.push("Awaiting review for more than 1 business day");
  if (t.priority === "Critical" && t.progressNotes.length === 0 && t.status === "Not Started")
    f.push("Critical lead task with no progress");
  return f;
}

/* ------------------------------ sample data ------------------------------ */

const INITIAL: TeamTask[] = [
  {
    id: "TSK-1041",
    title: "Prepare franchise proposal — Jaipur (Vaishali Nagar)",
    description: "Build the proposal deck with revised CAPEX, ROI sheet and 3-year projection. Share for review before sending.",
    type: "Proposal Preparation",
    leadId: "LD-2201", leadName: "Mahesh Agarwal — Jaipur",
    owner: "Ravi Sharma", createdBy: "Sales Head",
    priority: "Critical", status: "In Progress",
    startDate: dateOnly(-1), dueAt: iso(0, NOW.getHours() + 1),
    checklist: [
      { text: "Pull latest CAPEX sheet", done: true },
      { text: "Add ROI + payback slide", done: true },
      { text: "Get pricing approved", done: false },
    ],
    attachments: ["capex-v4.xlsx"],
    reviewRequired: true, reminder: "1 hour before",
    instructions: ["Use the new FY26 CAPEX numbers", "Do not commit discount beyond 5%"],
    progressNotes: [{ at: "Today 10:20", note: "Deck 70% ready, waiting on pricing approval." }],
    rescheduleCount: 0,
    history: [{ at: "Yesterday 16:10", note: "Task created and assigned to Ravi Sharma" }],
  },
  {
    id: "TSK-1042",
    title: "Collect KYC + bank documents — Pune lead",
    description: "Franchise partner to share PAN, Aadhaar, GST and cancelled cheque for the booking file.",
    type: "Document Collection",
    leadId: "LD-2244", leadName: "Sanjay Deshpande — Pune",
    owner: "Neha Kulkarni", createdBy: "Sales Head",
    priority: "High", status: "Not Started",
    startDate: dateOnly(-2), dueAt: iso(-2, 18),
    checklist: [
      { text: "PAN + Aadhaar", done: false },
      { text: "GST certificate", done: false },
      { text: "Cancelled cheque", done: false },
    ],
    attachments: [],
    reviewRequired: false, reminder: "1 day before",
    instructions: ["Documents required before the agreement is drafted"],
    progressNotes: [],
    rescheduleCount: 2,
    history: [
      { at: "3 days ago", note: "Task created and assigned to Neha Kulkarni" },
      { at: "2 days ago", note: "Deadline extended by 1 day" },
      { at: "Yesterday", note: "Deadline extended by 1 day" },
    ],
  },
  {
    id: "TSK-1043",
    title: "Review yesterday's 12 discovery calls",
    description: "Listen to call recordings, score pitch quality and log coaching points for the team huddle.",
    type: "Call Review",
    owner: "Amit Bansal", createdBy: "Sales Head",
    priority: "Medium", status: "Awaiting Review",
    startDate: dateOnly(-1), dueAt: iso(0, 13),
    checklist: [
      { text: "Score 12 calls", done: true },
      { text: "Write coaching notes", done: true },
    ],
    attachments: ["call-scorecard.pdf"],
    reviewRequired: true, reviewSubmittedAt: iso(-2, 12), reminder: "2 hours before",
    instructions: ["Focus on objection handling and next-step commitment"],
    progressNotes: [{ at: "Today 09:15", note: "Submitted scorecard for your review." }],
    rescheduleCount: 0,
    history: [{ at: "Yesterday 09:00", note: "Task created and assigned to Amit Bansal" }],
  },
  {
    id: "TSK-1044",
    title: "Meeting prep — Indore store visit (Thu)",
    description: "Prepare the site-visit pack: location study, competitor map, sample P&L and store photos.",
    type: "Meeting Preparation",
    leadId: "LD-2260", leadName: "Rakesh Jain — Indore",
    owner: "Deepak Verma", createdBy: "Sales Head",
    priority: "High", status: "In Progress",
    startDate: dateOnly(0), dueAt: iso(1, 11),
    checklist: [
      { text: "Location footfall study", done: true },
      { text: "Competitor pricing map", done: false },
      { text: "Print sample P&L", done: false },
    ],
    attachments: [],
    reviewRequired: false, reminder: "1 day before",
    instructions: ["Link this prep to the Thursday store-visit meeting"],
    progressNotes: [{ at: "Today 11:40", note: "Footfall data collected from mall management." }],
    rescheduleCount: 0,
    history: [{ at: "Today 08:30", note: "Task created and assigned to Deepak Verma" }],
  },
  {
    id: "TSK-1045",
    title: "Coordinate booking payment — Bengaluru (Whitefield)",
    description: "Follow up on the booking amount, share account details and confirm UTR with accounts.",
    type: "Payment Coordination",
    leadId: "LD-2288", leadName: "Vinay Rao — Bengaluru",
    owner: "Sneha Iyer", createdBy: "Sales Head",
    priority: "Critical", status: "In Progress",
    startDate: dateOnly(-1), dueAt: iso(0, 17),
    checklist: [
      { text: "Share bank details", done: true },
      { text: "Confirm UTR with accounts", done: false },
    ],
    attachments: [],
    reviewRequired: true, reminder: "3 hours before",
    instructions: ["Update Sales Pipeline once payment is confirmed"],
    progressNotes: [{ at: "Today 10:05", note: "Partner confirmed transfer will be done by evening." }],
    rescheduleCount: 1,
    history: [
      { at: "Yesterday 15:00", note: "Task created and assigned to Sneha Iyer" },
      { at: "Today 09:00", note: "Priority changed to Critical" },
    ],
  },
  {
    id: "TSK-1046",
    title: "Resolve pricing complaint — Nagpur partner",
    description: "Partner unhappy about revised royalty slab. Understand concern and propose a resolution.",
    type: "Customer Issue",
    leadId: "LD-2299", leadName: "Anil Thakre — Nagpur",
    owner: "Neha Kulkarni", createdBy: "Sales Head",
    priority: "High", status: "Not Started",
    startDate: dateOnly(0), dueAt: iso(0, 19),
    checklist: [{ text: "Call partner", done: false }, { text: "Draft resolution note", done: false }],
    attachments: [],
    reviewRequired: false, reminder: "2 hours before",
    instructions: ["Escalate to me if the partner asks for a written exception"],
    progressNotes: [],
    rescheduleCount: 0,
    history: [{ at: "Today 09:45", note: "Task created and assigned to Neha Kulkarni" }],
  },
  {
    id: "TSK-1047",
    title: "Objection-handling training module",
    description: "Complete the internal training module and submit the assessment score.",
    type: "Training",
    owner: "Ravi Sharma", createdBy: "Sales Head",
    priority: "Low", status: "Not Started",
    startDate: dateOnly(0), dueAt: iso(3, 18),
    checklist: [{ text: "Watch module", done: false }, { text: "Submit assessment", done: false }],
    attachments: [],
    reviewRequired: false, reminder: "1 day before",
    instructions: [],
    progressNotes: [],
    rescheduleCount: 0,
    history: [{ at: "Today 08:00", note: "Task created and assigned to Ravi Sharma" }],
  },
  {
    id: "TSK-1048",
    title: "Weekly funnel report — Delhi NCR",
    description: "Submit stage-wise funnel movement, closure % and next-week forecast.",
    type: "Reporting",
    owner: "Amit Bansal", createdBy: "Sales Head",
    priority: "Medium", status: "Completed",
    startDate: dateOnly(-3), dueAt: iso(0, 10),
    checklist: [{ text: "Compile numbers", done: true }, { text: "Submit report", done: true }],
    attachments: ["ncr-funnel.pdf"],
    reviewRequired: false, reminder: "None",
    instructions: [],
    progressNotes: [{ at: "Today 09:50", note: "Report submitted." }],
    rescheduleCount: 0,
    completedAt: iso(0, 9),
    history: [{ at: "3 days ago", note: "Task created and assigned to Amit Bansal" }, { at: "Today 09:50", note: "Marked completed" }],
  },
  {
    id: "TSK-1049",
    title: "Re-engage 8 dormant leads — MP territory",
    description: "Call every lead with no contact in 15+ days and update status in the master lead record.",
    type: "Lead Action",
    owner: "Deepak Verma", createdBy: "Sales Head",
    priority: "High", status: "In Progress",
    startDate: dateOnly(-1), dueAt: iso(-1, 18),
    checklist: [{ text: "Call 8 leads", done: false }, { text: "Update statuses", done: false }],
    attachments: [],
    reviewRequired: false, reminder: "2 hours before",
    instructions: ["Log every call outcome against the master lead record"],
    progressNotes: [{ at: "Yesterday 17:20", note: "4 of 8 leads called." }],
    rescheduleCount: 0,
    history: [{ at: "2 days ago", note: "Task created and assigned to Deepak Verma" }],
  },
  {
    id: "TSK-1050",
    title: "Update CRM hygiene — duplicate check",
    description: "Verify flagged duplicates and merge into the master lead record. Never create a new lead record.",
    type: "General Task",
    owner: "Sneha Iyer", createdBy: "Sales Head",
    priority: "Low", status: "Completed",
    startDate: dateOnly(-2), dueAt: iso(0, 12),
    checklist: [{ text: "Review 14 flagged records", done: true }],
    attachments: [],
    reviewRequired: false, reminder: "None",
    instructions: [],
    progressNotes: [],
    rescheduleCount: 0,
    completedAt: iso(0, 11),
    history: [{ at: "2 days ago", note: "Task created" }, { at: "Today 11:05", note: "Marked completed" }],
  },
];

/* ------------------------------ page ------------------------------ */

type View = "list" | "kanban" | "workload" | "calendar";

export function SalesHeadTeamTasksPage() {
  const [tasks, setTasks] = useState<TeamTask[]>(INITIAL);
  const [view, setView] = useState<View>("list");
  const [open, setOpen] = useState<TeamTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [fOwner, setFOwner] = useState("all");
  const [fType, setFType] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [q, setQ] = useState("");

  const update = (id: string, fn: (t: TeamTask) => TeamTask) =>
    setTasks((list) => list.map((t) => (t.id === id ? fn(t) : t)));

  const log = (t: TeamTask, note: string): TeamTask => ({
    ...t, history: [{ at: stamp(), note }, ...t.history],
  });

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (fOwner === "all" || t.owner === fOwner) &&
          (fType === "all" || t.type === fType) &&
          (fStatus === "all" || t.status === fStatus) &&
          (fPriority === "all" || t.priority === fPriority) &&
          (q.trim() === "" ||
            `${t.title} ${t.leadName ?? ""} ${t.id}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [tasks, fOwner, fType, fStatus, fPriority, q]
  );

  const stats = useMemo(() => {
    const active = tasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
    return {
      dueToday: active.filter((t) => isSameDay(new Date(t.dueAt), new Date()) && !remaining(t).overdue).length,
      overdue: active.filter((t) => remaining(t).overdue).length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      awaiting: tasks.filter((t) => t.status === "Awaiting Review").length,
      completedToday: tasks.filter((t) => t.completedAt && isSameDay(new Date(t.completedAt), new Date())).length,
    };
  }, [tasks]);

  const resetFilters = () => { setFOwner("all"); setFType("all"); setFStatus("all"); setFPriority("all"); setQ(""); };

  const completeTask = (t: TeamTask) => {
    if (t.reviewRequired && t.status !== "Completed") {
      update(t.id, (x) => log({ ...x, status: "Awaiting Review", reviewSubmittedAt: new Date().toISOString() }, "Submitted for review"));
      toast.info("Review required — task moved to Awaiting Review");
      return;
    }
    update(t.id, (x) => log({ ...x, status: "Completed", completedAt: new Date().toISOString() }, "Marked completed"));
    toast.success("Task completed — Dashboard & Performance updated");
  };

  const approve = (t: TeamTask) => {
    update(t.id, (x) => log({ ...x, status: "Completed", completedAt: new Date().toISOString() }, "Work approved by Sales Head"));
    toast.success("Completion approved");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Assign, monitor and approve managerial &amp; operational work across the five sales executives.
            Lead follow-ups stay in each executive&apos;s Follow-ups &amp; Reminders.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Task
        </Button>
      </div>

      {/* KPI header */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Due Today" value={stats.dueToday} icon={Clock} tone="amber" />
        <Kpi label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="red" />
        <Kpi label="In Progress" value={stats.inProgress} icon={ListChecks} tone="blue" />
        <Kpi label="Awaiting Review" value={stats.awaiting} icon={ShieldAlert} tone="amber" />
        <Kpi label="Completed Today" value={stats.completedToday} icon={CheckCircle2} tone="green" />
      </div>

      {/* views */}
      <div className="flex flex-wrap gap-2">
        {([
          ["list", "Task List", ListChecks],
          ["kanban", "Kanban Board", KanbanSquare],
          ["workload", "Team Workload", Users],
          ["calendar", "Calendar View", CalendarDays],
        ] as const).map(([k, label, Icon]) => (
          <Button key={k} size="sm" variant={view === k ? "default" : "outline"} onClick={() => setView(k)}>
            <Icon className="h-4 w-4 mr-1" /> {label}
          </Button>
        ))}
      </div>

      {/* filters */}
      {view !== "workload" && (
        <Card>
          <CardContent className="p-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Input placeholder="Search task, lead or ID" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <FilterSelect value={fOwner} onChange={setFOwner} placeholder="Executive" options={TASK_EXECUTIVES.map((e) => e.name)} />
            <FilterSelect value={fType} onChange={setFType} placeholder="Task type" options={[...TASK_TYPES]} />
            <FilterSelect value={fStatus} onChange={setFStatus} placeholder="Status" options={[...STATUSES]} />
            <div className="flex gap-2">
              <FilterSelect value={fPriority} onChange={setFPriority} placeholder="Priority" options={[...PRIORITIES]} />
              <Button variant="ghost" size="icon" onClick={resetFilters} title="Clear filters">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {view === "list" && (
        <div className="grid gap-2">
          {filtered.length === 0 && <EmptyState />}
          {filtered.map((t) => (
            <TaskCard key={t.id} task={t} onOpen={() => setOpen(t)} onComplete={() => completeTask(t)} onApprove={() => approve(t)} />
          ))}
        </div>
      )}

      {view === "kanban" && <KanbanView tasks={filtered} onOpen={setOpen} />}
      {view === "workload" && <WorkloadView tasks={tasks} />}
      {view === "calendar" && <CalendarView tasks={filtered} onOpen={setOpen} />}

      <TaskSheet
        task={open ? tasks.find((t) => t.id === open.id) ?? null : null}
        onClose={() => setOpen(null)}
        onUpdate={update}
        log={log}
        onComplete={completeTask}
        onApprove={approve}
      />

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(t) => {
          setTasks((list) => [t, ...list]);
          toast.success(`Task assigned to ${t.owner}`);
        }}
      />
    </div>
  );
}

/* ------------------------------ small pieces ------------------------------ */

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: "red" | "amber" | "blue" | "green" }) {
  const tones = {
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-emerald-600 dark:text-emerald-400",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className={cn("h-4 w-4", tones[tone])} /> {label}
        </div>
        <div className={cn("text-2xl font-bold mt-1", tones[tone])}>{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2 truncate">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center text-sm text-muted-foreground">
        No tasks match these filters.
      </CardContent>
    </Card>
  );
}

function TaskCard({ task, onOpen, onComplete, onApprove }: { task: TeamTask; onOpen: () => void; onComplete: () => void; onApprove: () => void }) {
  const r = remaining(task);
  const flags = attentionFlags(task);
  const done = task.checklist.filter((c) => c.done).length;

  return (
    <Card className={cn(
      "border-l-4",
      task.status === "Completed" ? "border-l-emerald-500"
        : task.status === "Cancelled" ? "border-l-muted"
        : r.overdue ? "border-l-red-500"
        : task.status === "Awaiting Review" ? "border-l-amber-500"
        : task.status === "In Progress" ? "border-l-blue-500"
        : "border-l-muted-foreground/30"
    )}>
      <CardContent className="p-3 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium text-sm">{task.title}</div>
            <div className="text-xs text-muted-foreground">
              {task.id} · {task.type} · Created by {task.createdBy}
              {task.leadName && <> · Lead: <span className="text-foreground">{task.leadName}</span></>}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={priorityTone[task.priority]}>{task.priority}</Badge>
            <Badge className={statusTone[task.status]} variant="secondary">{task.status}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {task.owner}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Due {fmtDue(task.dueAt)}</span>
          <span className={cn("flex items-center gap-1", r.overdue ? "text-red-600 dark:text-red-400 font-medium" : "")}>
            <Clock className="h-3.5 w-3.5" /> {r.label}
          </span>
          {task.checklist.length > 0 && <span>Checklist {done}/{task.checklist.length}</span>}
        </div>

        {task.progressNotes[0] && (
          <div className="text-xs bg-muted/50 rounded p-2">
            <span className="text-muted-foreground">{task.progressNotes[0].at}:</span> {task.progressNotes[0].note}
          </div>
        )}

        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {flags.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 text-[11px] rounded px-1.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400">
                <Flame className="h-3 w-3" /> {f}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={onOpen}><Eye className="h-4 w-4 mr-1" /> View Task</Button>
          {task.status === "Awaiting Review" ? (
            <Button size="sm" onClick={onApprove}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve Completion</Button>
          ) : task.status !== "Completed" && task.status !== "Cancelled" ? (
            <Button size="sm" onClick={onComplete}><CheckCircle2 className="h-4 w-4 mr-1" /> Complete</Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ kanban ------------------------------ */

function KanbanView({ tasks, onOpen }: { tasks: TeamTask[]; onOpen: (t: TeamTask) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {STATUSES.map((s) => {
        const col = tasks.filter((t) => t.status === s);
        return (
          <div key={s} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{s}</span>
              <Badge variant="secondary" className={statusTone[s]}>{col.length}</Badge>
            </div>
            <div className="space-y-2 min-h-16">
              {col.map((t) => {
                const r = remaining(t);
                return (
                  <button key={t.id} onClick={() => onOpen(t)} className="w-full text-left">
                    <Card className={cn("hover:border-primary transition-colors", r.overdue && "border-red-500/50")}>
                      <CardContent className="p-3 space-y-1.5">
                        <div className="text-sm font-medium leading-snug">{t.title}</div>
                        <div className="text-xs text-muted-foreground">{t.owner} · {t.type}</div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={cn("text-[10px]", priorityTone[t.priority])}>{t.priority}</Badge>
                          <span className={cn("text-[11px]", r.overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>{r.label}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
              {col.length === 0 && <div className="text-xs text-muted-foreground px-1">—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ workload ------------------------------ */

function WorkloadView({ tasks }: { tasks: TeamTask[] }) {
  const rows = TASK_EXECUTIVES.map((e) => {
    const mine = tasks.filter((t) => t.owner === e.name);
    const active = mine.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
    const overdue = active.filter((t) => remaining(t).overdue);
    return {
      ...e,
      active: active.length,
      overdue: overdue.length,
      dueToday: active.filter((t) => isSameDay(new Date(t.dueAt), new Date())).length,
      awaiting: mine.filter((t) => t.status === "Awaiting Review").length,
      completed: mine.filter((t) => t.status === "Completed").length,
    };
  });

  const maxActive = Math.max(1, ...rows.map((r) => r.active));

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const warnings: string[] = [];
        if (r.overdue >= 2) warnings.push("Excessive overdue workload");
        if (r.active >= 4) warnings.push("High active task count");
        if (r.leads >= 35) warnings.push("Heavy lead workload");
        return (
          <Card key={r.name}>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.territory} · {r.leads} active leads</div>
              </div>
              <Progress value={(r.active / maxActive) * 100} />
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Active" value={r.active} />
                <Stat label="Overdue" value={r.overdue} tone={r.overdue > 0 ? "text-red-600 dark:text-red-400" : ""} />
                <Stat label="Due today" value={r.dueToday} tone={r.dueToday > 0 ? "text-amber-600 dark:text-amber-400" : ""} />
                <Stat label="In review" value={r.awaiting} tone={r.awaiting > 0 ? "text-amber-600 dark:text-amber-400" : ""} />
                <Stat label="Completed" value={r.completed} tone="text-emerald-600 dark:text-emerald-400" />
                <Stat label="Leads" value={r.leads} />
              </div>
              {warnings.length > 0 && (
                <div className="space-y-1">
                  {warnings.map((w) => (
                    <div key={w} className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> {w}
                    </div>
                  ))}
                  <div className="text-[11px] text-muted-foreground">Review manually — tasks are never auto-reassigned.</div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className={cn("text-lg font-semibold leading-none", tone)}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

/* ------------------------------ calendar ------------------------------ */

function CalendarView({ tasks, onOpen }: { tasks: TeamTask[]; onOpen: (t: TeamTask) => void }) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((d) => {
        const dayTasks = tasks.filter((t) => isSameDay(new Date(t.dueAt), d));
        const today = isSameDay(d, new Date());
        return (
          <Card key={d.toISOString()} className={cn(today && "border-primary")}>
            <CardContent className="p-2 space-y-1.5 min-h-28">
              <div className={cn("text-xs font-medium", today ? "text-primary" : "text-muted-foreground")}>
                {d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}
              </div>
              {dayTasks.map((t) => {
                const r = remaining(t);
                return (
                  <button key={t.id} onClick={() => onOpen(t)}
                    className={cn(
                      "w-full text-left text-[11px] rounded px-1.5 py-1 leading-tight",
                      t.status === "Completed" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : r.overdue ? "bg-red-500/10 text-red-700 dark:text-red-400"
                        : t.status === "In Progress" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    )}>
                    <div className="font-medium truncate">{t.title}</div>
                    <div className="opacity-80 truncate">{t.owner}</div>
                  </button>
                );
              })}
              {dayTasks.length === 0 && <div className="text-[11px] text-muted-foreground">—</div>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------ detail sheet ------------------------------ */

function TaskSheet({
  task, onClose, onUpdate, log, onComplete, onApprove,
}: {
  task: TeamTask | null;
  onClose: () => void;
  onUpdate: (id: string, fn: (t: TeamTask) => TeamTask) => void;
  log: (t: TeamTask, note: string) => TeamTask;
  onComplete: (t: TeamTask) => void;
  onApprove: (t: TeamTask) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [returnNote, setReturnNote] = useState("");

  if (!task) return null;
  const r = remaining(task);

  return (
    <Sheet open={!!task} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="pr-6">{task.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4 text-sm">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={priorityTone[task.priority]}>{task.priority}</Badge>
            <Badge variant="secondary" className={statusTone[task.status]}>{task.status}</Badge>
            <Badge variant="outline">{task.type}</Badge>
            {task.reviewRequired && <Badge variant="outline">Review required</Badge>}
          </div>

          <p className="text-muted-foreground">{task.description}</p>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Assigned to" value={task.owner} />
            <Field label="Created by" value={task.createdBy} />
            <Field label="Start date" value={new Date(task.startDate).toLocaleDateString("en-IN")} />
            <Field label="Due" value={fmtDue(task.dueAt)} />
            <Field label="Time" value={r.label} tone={r.overdue ? "text-red-600 dark:text-red-400" : ""} />
            <Field label="Reminder" value={task.reminder} />
            {task.leadName && <Field label="Linked lead" value={`${task.leadName} (${task.leadId})`} />}
          </div>

          {task.checklist.length > 0 && (
            <div>
              <div className="font-medium mb-1">Checklist</div>
              <div className="space-y-1.5">
                {task.checklist.map((c, i) => (
                  <label key={c.text} className="flex items-center gap-2">
                    <Checkbox
                      checked={c.done}
                      onCheckedChange={(v) =>
                        onUpdate(task.id, (t) => ({
                          ...t,
                          checklist: t.checklist.map((x, xi) => (xi === i ? { ...x, done: !!v } : x)),
                        }))
                      }
                    />
                    <span className={cn(c.done && "line-through text-muted-foreground")}>{c.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {task.attachments.length > 0 && (
            <div>
              <div className="font-medium mb-1">Attachments</div>
              {task.attachments.map((a) => (
                <div key={a} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5" /> {a}
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* manager controls */}
          <div className="space-y-3">
            <div className="font-medium">Sales Head actions</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reassign</div>
                <Select
                  value={task.owner}
                  onValueChange={(v) =>
                    onUpdate(task.id, (t) => {
                      toast.success(`Reassigned to ${v}`);
                      return log({ ...t, owner: v }, `Reassigned from ${t.owner} to ${v}`);
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_EXECUTIVES.map((e) => <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Priority</div>
                <Select
                  value={task.priority}
                  onValueChange={(v) =>
                    onUpdate(task.id, (t) => {
                      toast.success(`Priority set to ${v}`);
                      return log({ ...t, priority: v as Priority }, `Priority changed from ${t.priority} to ${v}`);
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Change deadline</div>
              <Input
                type="datetime-local"
                value={new Date(new Date(task.dueAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={(e) => {
                  const v = new Date(e.target.value).toISOString();
                  onUpdate(task.id, (t) =>
                    log({ ...t, dueAt: v, rescheduleCount: t.rescheduleCount + 1 }, `Deadline changed to ${fmtDue(v)}`)
                  );
                }}
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Manager instruction</div>
              <div className="flex gap-2">
                <Textarea rows={2} value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Add an instruction for the executive" />
                <Button
                  onClick={() => {
                    if (!instruction.trim()) return toast.error("Write an instruction first");
                    onUpdate(task.id, (t) => log({ ...t, instructions: [...t.instructions, instruction] }, "Manager instruction added"));
                    setInstruction("");
                    toast.success("Instruction added");
                  }}
                >Add</Button>
              </div>
              {task.instructions.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                  {task.instructions.map((i, idx) => <li key={idx}>{i}</li>)}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {task.status === "Awaiting Review" && (
                <>
                  <Button size="sm" onClick={() => { onApprove(task); }}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve completion
                  </Button>
                </>
              )}
              {task.status !== "Completed" && task.status !== "Cancelled" && task.status !== "Awaiting Review" && (
                <Button size="sm" onClick={() => onComplete(task)}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark complete
                </Button>
              )}
              {task.status !== "Cancelled" && task.status !== "Completed" && (
                <Button size="sm" variant="outline" onClick={() =>
                  onUpdate(task.id, (t) => log({ ...t, status: "In Progress" }, "Status set to In Progress"))
                }>
                  <ArrowRightLeft className="h-4 w-4 mr-1" /> Set In Progress
                </Button>
              )}
            </div>

            {task.status === "Awaiting Review" && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Return for correction</div>
                <div className="flex gap-2">
                  <Input value={returnNote} onChange={(e) => setReturnNote(e.target.value)} placeholder="What needs correction?" />
                  <Button variant="outline" onClick={() => {
                    if (!returnNote.trim()) return toast.error("Add a correction note");
                    onUpdate(task.id, (t) => log({ ...t, status: "In Progress", reviewSubmittedAt: undefined, instructions: [...t.instructions, `Correction: ${returnNote}`] }, `Returned for correction: ${returnNote}`));
                    setReturnNote("");
                    toast.info("Returned to executive for correction");
                  }}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Return
                  </Button>
                </div>
              </div>
            )}

            {task.status !== "Cancelled" && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Cancel task (reason required)</div>
                <div className="flex gap-2">
                  <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation" />
                  <Button variant="destructive" onClick={() => {
                    if (!cancelReason.trim()) return toast.error("A cancellation reason is required");
                    onUpdate(task.id, (t) => log({ ...t, status: "Cancelled", cancelReason }, `Cancelled: ${cancelReason}`));
                    setCancelReason("");
                    toast.success("Task cancelled");
                  }}>
                    <Ban className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <div className="font-medium mb-1">Progress notes</div>
            {task.progressNotes.length === 0 && <div className="text-xs text-muted-foreground">No notes yet.</div>}
            <div className="space-y-1">
              {task.progressNotes.map((n, i) => (
                <div key={i} className="text-xs bg-muted/50 rounded p-2">
                  <span className="text-muted-foreground">{n.at}:</span> {n.note}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-medium mb-1 flex items-center gap-1"><History className="h-4 w-4" /> Task history</div>
            <div className="space-y-1">
              {task.history.map((h, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{h.at}</span> — {h.note}
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground border-t pt-3">
            Linked records: {task.leadId ? "master lead record" : "no lead"} ·
            {task.type === "Meeting Preparation" ? " Meetings" : ""}
            {task.type === "Proposal Preparation" || task.type === "Payment Coordination" ? " Sales Pipeline activity" : ""}
            {" "}· appears in {task.owner}&apos;s Notes &amp; Tasks
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("text-sm font-medium", tone)}>{value}</div>
    </div>
  );
}

/* ------------------------------ create dialog ------------------------------ */

function CreateTaskDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (t: TeamTask) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("General Task");
  const [lead, setLead] = useState("");
  const [owner, setOwner] = useState(TASK_EXECUTIVES[0].name);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [startDate, setStartDate] = useState(dateOnly(0));
  const [dueAt, setDueAt] = useState("");
  const [checklist, setChecklist] = useState("");
  const [reviewRequired, setReviewRequired] = useState(false);
  const [reminder, setReminder] = useState("1 day before");

  const submit = () => {
    if (!title.trim()) return toast.error("Task title is required");
    if (!dueAt) return toast.error("Due date and time are required");
    const task: TeamTask = {
      id: `TSK-${Math.floor(1100 + Math.random() * 800)}`,
      title, description, type,
      leadName: lead || undefined,
      leadId: lead ? `LD-${Math.floor(2300 + Math.random() * 99)}` : undefined,
      owner, createdBy: "Sales Head",
      priority, status: "Not Started",
      startDate,
      dueAt: new Date(dueAt).toISOString(),
      checklist: checklist.split("\n").map((s) => s.trim()).filter(Boolean).map((text) => ({ text, done: false })),
      attachments: [],
      reviewRequired, reminder,
      instructions: [],
      progressNotes: [],
      rescheduleCount: 0,
      history: [{ at: stamp(), note: `Task created and assigned to ${owner}` }],
    };
    onCreate(task);
    onOpenChange(false);
    setTitle(""); setDescription(""); setLead(""); setDueAt(""); setChecklist(""); setReviewRequired(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Every task needs one owner, a priority and a due date. It appears in the executive&apos;s Notes &amp; Tasks.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Task type</div>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Assign to</div>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_EXECUTIVES.map((e) => <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Related lead / opportunity (links to the master lead record)</div>
            <Input placeholder="e.g. Mahesh Agarwal — Jaipur" value={lead} onChange={(e) => setLead(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Priority</div>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Start date</div>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Due date &amp; time</div>
              <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Checklist (one item per line)</div>
            <Textarea rows={3} value={checklist} onChange={(e) => setChecklist(e.target.value)} placeholder={"Call partner\nShare documents"} />
          </div>

          <div className="grid grid-cols-2 gap-2 items-end">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Reminder</div>
              <Select value={reminder} onValueChange={setReminder}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["None", "1 hour before", "2 hours before", "3 hours before", "1 day before"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" type="button" className="w-full" onClick={() => toast.info("Attachment upload coming soon")}>
              <Paperclip className="h-4 w-4 mr-1" /> Add attachment
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={reviewRequired} onCheckedChange={(v) => setReviewRequired(!!v)} />
            Review required before completion
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create &amp; Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
