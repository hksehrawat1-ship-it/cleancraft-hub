import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { AlertTriangle, Bug, Clock, Search, ShieldAlert } from "lucide-react";
import { SectionHead, StatCard } from "@/components/smm/ui";

/* --------------------------------- types --------------------------------- */

export const TASK_TYPES = [
  "New Feature",
  "Feature Improvement",
  "App Configuration",
  "POS Configuration",
  "Store Launch Requirement",
  "Data Setup",
  "Report Development",
  "Integration",
  "User Access Setup",
  "Technical Research",
  "Maintenance",
  "Documentation",
  "Other",
] as const;

export const TASK_STATUSES = [
  "New",
  "Accepted",
  "In Progress",
  "Blocked",
  "Testing",
  "Awaiting Approval",
  "Completed",
  "Returned for Clarification",
] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

const APPROVAL_STAGES = [
  "Developer Completed",
  "Testing Passed",
  "Requester Review",
  "CTO Approval Required",
  "Approved",
  "Rejected or Returned",
] as const;
type ApprovalStage = (typeof APPROVAL_STAGES)[number];

const SYSTEM_AREAS = [
  "Customer App",
  "Franchise App",
  "POS",
  "Admin Panel",
  "CRM",
  "Website",
  "API or Integration",
  "Database",
  "Reporting",
] as const;

const DEFAULT_CRITERIA = [
  "Required function completed",
  "Correct users can access it",
  "Data displays correctly",
  "Mobile and desktop checked",
  "Error handling added",
  "Security considerations reviewed",
  "Testing completed",
  "Documentation updated",
  "Requester acceptance received",
];

type Priority = "Critical" | "High" | "Medium" | "Low";
type Activity = { at: string; who: string; text: string };

type Task = {
  id: string;
  title: string;
  project: string;
  store: string;
  unit: string;
  type: (typeof TASK_TYPES)[number];
  area: (typeof SYSTEM_AREAS)[number];
  requestedBy: string;
  approvedBy: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  approval: ApprovalStage | "—";
  start: string;
  deadline: string;
  deadlineISO: string;
  deadlineChanges: number;
  effort: string;
  nextAction: string;
  requirement: string;
  outcome: string;
  criteria: { text: string; done: boolean }[];
  dependencies: { text: string; overdue: boolean }[];
  relatedTickets: string[];
  relatedBugs: string[];
  release: string;
  files: string[];
  highRisk: boolean;
  launchBlocker: boolean;
  testingFailed?: boolean;
  returned?: boolean;
  blocked?: {
    reason: string;
    person: string;
    needed: string;
    expected: string;
    followUp: string;
  };
  timeline: Activity[];
  restrictedNote?: string;
};

/* ------------------------------- sample data ------------------------------ */

const crit = (n = 9, done = 0) =>
  DEFAULT_CRITERIA.slice(0, n).map((c, i) => ({ text: c, done: i < done }));

const SEED: Task[] = [
  {
    id: "TSK-4101",
    title: "POS tariff master setup for Jaipur launch",
    project: "Jaipur Franchise Launch",
    store: "Jaipur — Vaishali Nagar",
    unit: "Franchise Operations",
    type: "Store Launch Requirement",
    area: "POS",
    requestedBy: "Kavita Rao (Project Coordinator)",
    approvedBy: "Arjun Mehta (CTO)",
    assignee: "You (Rahul D.)",
    priority: "Critical",
    status: "In Progress",
    approval: "—",
    start: "1 Aug 2026",
    deadline: "3 Aug 2026",
    deadlineISO: "2026-08-03",
    deadlineChanges: 3,
    effort: "2 days",
    nextAction: "Complete tariff import and verify on store device",
    requirement:
      "Store cannot start billing until the tariff master, tax rules and service categories are configured in POS.",
    outcome: "Counter staff can bill all services with correct pricing and GST.",
    criteria: crit(9, 5),
    dependencies: [{ text: "Final tariff sheet from Project Coordinator", overdue: true }],
    relatedTickets: ["TKT-2046"],
    relatedBugs: [],
    release: "v3.4.0",
    files: ["tariff_master_jaipur.xlsx", "gst_rules_note.pdf"],
    highRisk: false,
    launchBlocker: true,
    timeline: [
      { at: "1 Aug 10:00", who: "Kavita Rao (PC)", text: "Task raised for Jaipur launch." },
      { at: "1 Aug 10:20", who: "You (Rahul D.)", text: "Task accepted. Work started." },
      { at: "2 Aug 16:30", who: "You (Rahul D.)", text: "Deadline revised (3rd change) awaiting tariff sheet." },
    ],
  },
  {
    id: "TSK-4102",
    title: "Store transfer module — API and UI",
    project: "Clean Craft OS",
    store: "Head Office",
    unit: "Technology",
    type: "New Feature",
    area: "CRM",
    requestedBy: "Arjun Mehta (CTO)",
    approvedBy: "Arjun Mehta (CTO)",
    assignee: "You (Rahul D.)",
    priority: "High",
    status: "Testing",
    approval: "Developer Completed",
    start: "24 Jul 2026",
    deadline: "7 Aug 2026",
    deadlineISO: "2026-08-07",
    deadlineChanges: 1,
    effort: "6 days",
    nextAction: "Fix failed test case on ownership history",
    requirement: "Project Coordinator must be able to transfer a store between Project Managers with full history.",
    outcome: "Transfers complete in under a minute and ownership history is preserved.",
    criteria: crit(9, 7),
    dependencies: [],
    relatedTickets: [],
    relatedBugs: ["BUG-89"],
    release: "v3.4.0",
    files: ["transfer_flow.png"],
    highRisk: true,
    launchBlocker: false,
    testingFailed: true,
    timeline: [
      { at: "24 Jul 09:00", who: "Arjun Mehta (CTO)", text: "Task created and approved for development." },
      { at: "3 Aug 12:00", who: "QA", text: "Testing failed — ownership history missing for re-transfer." },
    ],
    restrictedNote: "Internal: role-escalation path reviewed with CTO; details restricted to Developer and CTO.",
  },
  {
    id: "TSK-4103",
    title: "Offline billing sync queue for POS v3",
    project: "POS v3",
    store: "Head Office",
    unit: "Technology",
    type: "Feature Improvement",
    area: "POS",
    requestedBy: "Arjun Mehta (CTO)",
    approvedBy: "Arjun Mehta (CTO)",
    assignee: "You (Rahul D.)",
    priority: "High",
    status: "Blocked",
    approval: "—",
    start: "28 Jul 2026",
    deadline: "12 Aug 2026",
    deadlineISO: "2026-08-12",
    deadlineChanges: 0,
    effort: "8 days",
    nextAction: "Follow up with vendor for sandbox access",
    requirement: "POS must queue bills offline and sync automatically when the connection returns.",
    outcome: "No bill is lost during network outage at stores.",
    criteria: crit(9, 3),
    dependencies: [{ text: "Payment vendor sandbox access", overdue: true }],
    relatedTickets: ["TKT-2051"],
    relatedBugs: [],
    release: "v3.5.0",
    files: [],
    highRisk: true,
    launchBlocker: false,
    blocked: {
      reason: "Vendor sandbox credentials not provisioned",
      person: "Arjun Mehta (CTO)",
      needed: "Vendor to enable sandbox environment for sync testing",
      expected: "6 Aug 2026",
      followUp: "5 Aug 2026",
    },
    timeline: [
      { at: "28 Jul 11:00", who: "Arjun Mehta (CTO)", text: "Task created." },
      { at: "2 Aug 09:30", who: "You (Rahul D.)", text: "Marked blocked — vendor sandbox pending. CTO notified." },
    ],
  },
  {
    id: "TSK-4104",
    title: "Store-wise complaints report",
    project: "Clean Craft OS",
    store: "Head Office",
    unit: "Operations",
    type: "Report Development",
    area: "Reporting",
    requestedBy: "Arjun Mehta (CTO)",
    approvedBy: "—",
    assignee: "You (Rahul D.)",
    priority: "Medium",
    status: "New",
    approval: "—",
    start: "—",
    deadline: "10 Aug 2026",
    deadlineISO: "2026-08-10",
    deadlineChanges: 0,
    effort: "3 days",
    nextAction: "Accept task and confirm acceptance criteria",
    requirement: "Relationship Managers need complaint counts and resolution time per store.",
    outcome: "Report available with store, month and status filters.",
    criteria: [],
    dependencies: [],
    relatedTickets: [],
    relatedBugs: [],
    release: "v3.5.0",
    files: [],
    highRisk: false,
    launchBlocker: false,
    timeline: [{ at: "3 Aug 17:00", who: "Arjun Mehta (CTO)", text: "Task assigned to Developer." }],
  },
  {
    id: "TSK-4105",
    title: "User access setup for Indore store team",
    project: "Indore Franchise Launch",
    store: "Indore — Vijay Nagar",
    unit: "Franchise Operations",
    type: "User Access Setup",
    area: "Admin Panel",
    requestedBy: "Kavita Rao (Project Coordinator)",
    approvedBy: "Arjun Mehta (CTO)",
    assignee: "You (Rahul D.)",
    priority: "High",
    status: "Returned for Clarification",
    approval: "—",
    start: "—",
    deadline: "6 Aug 2026",
    deadlineISO: "2026-08-06",
    deadlineChanges: 1,
    effort: "1 day",
    nextAction: "Awaiting role list and official email IDs from PC",
    requirement: "Create owner, manager and counter roles for the Indore store team.",
    outcome: "Each staff member has the correct least-privilege role.",
    criteria: crit(5),
    dependencies: [{ text: "Official email IDs from HR", overdue: false }],
    relatedTickets: ["TKT-2042"],
    relatedBugs: [],
    release: "Configuration",
    files: [],
    highRisk: false,
    launchBlocker: true,
    returned: true,
    timeline: [
      { at: "2 Aug 14:00", who: "Kavita Rao (PC)", text: "Task raised for Indore launch." },
      { at: "2 Aug 15:10", who: "You (Rahul D.)", text: "Returned for clarification — role list not provided. Credentials are never stored in task notes." },
    ],
  },
  {
    id: "TSK-4106",
    title: "Field engineer work-report wizard",
    project: "Mobile App",
    store: "Head Office",
    unit: "Service",
    type: "New Feature",
    area: "Franchise App",
    requestedBy: "Arjun Mehta (CTO)",
    approvedBy: "Arjun Mehta (CTO)",
    assignee: "You (Rahul D.)",
    priority: "Medium",
    status: "Accepted",
    approval: "—",
    start: "4 Aug 2026",
    deadline: "20 Aug 2026",
    deadlineISO: "2026-08-20",
    deadlineChanges: 0,
    effort: "10 days",
    nextAction: "Start work on step 1 of wizard",
    requirement: "Field engineers must submit a 5-step service report from mobile.",
    outcome: "Reports captured with photos and parts used.",
    criteria: crit(9, 0),
    dependencies: [],
    relatedTickets: [],
    relatedBugs: [],
    release: "v3.6.0",
    files: ["wizard_wireframe.pdf"],
    highRisk: false,
    launchBlocker: false,
    timeline: [{ at: "4 Aug 09:00", who: "You (Rahul D.)", text: "Task accepted." }],
  },
  {
    id: "TSK-4107",
    title: "GST configuration for invoice export",
    project: "Clean Craft OS",
    store: "Mumbai — Andheri",
    unit: "Accounts",
    type: "App Configuration",
    area: "Reporting",
    requestedBy: "Kavita Rao (Project Coordinator)",
    approvedBy: "Arjun Mehta (CTO)",
    assignee: "You (Rahul D.)",
    priority: "Low",
    status: "Awaiting Approval",
    approval: "Requester Review",
    start: "26 Jul 2026",
    deadline: "1 Aug 2026",
    deadlineISO: "2026-08-01",
    deadlineChanges: 0,
    effort: "1 day",
    nextAction: "Awaiting requester approval since 1 Aug",
    requirement: "Invoice export must include a GST column for accounting reconciliation.",
    outcome: "Accounts team can reconcile GST without manual entry.",
    criteria: crit(9, 9),
    dependencies: [],
    relatedTickets: ["TKT-2049"],
    relatedBugs: [],
    release: "v3.3.2",
    files: ["export_sample.csv"],
    highRisk: false,
    launchBlocker: false,
    timeline: [
      { at: "26 Jul 10:00", who: "Kavita Rao (PC)", text: "Task raised from ticket TKT-2049." },
      { at: "1 Aug 12:00", who: "You (Rahul D.)", text: "Submitted for approval after testing passed." },
    ],
  },
  {
    id: "TSK-4108",
    title: "Documentation — POS installation runbook update",
    project: "POS v3",
    store: "Head Office",
    unit: "Technology",
    type: "Documentation",
    area: "POS",
    requestedBy: "Arjun Mehta (CTO)",
    approvedBy: "Arjun Mehta (CTO)",
    assignee: "You (Rahul D.)",
    priority: "Low",
    status: "Completed",
    approval: "Approved",
    start: "20 Jul 2026",
    deadline: "31 Jul 2026",
    deadlineISO: "2026-07-31",
    deadlineChanges: 0,
    effort: "2 days",
    nextAction: "None — approved",
    requirement: "Runbook must cover printer configuration for 80mm devices.",
    outcome: "Support team can install POS without developer help.",
    criteria: crit(9, 9),
    dependencies: [],
    relatedTickets: [],
    relatedBugs: [],
    release: "Documentation",
    files: ["pos_runbook_v4.pdf"],
    highRisk: false,
    launchBlocker: false,
    timeline: [{ at: "31 Jul 16:00", who: "Arjun Mehta (CTO)", text: "Approved and closed." }],
  },
];

/* -------------------------------- helpers -------------------------------- */

const P_ORDER: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const prioTone = (p: Priority) =>
  p === "Critical"
    ? "bg-destructive text-destructive-foreground"
    : p === "High"
    ? "bg-amber-500 text-white"
    : p === "Medium"
    ? "bg-blue-500 text-white"
    : "bg-muted text-muted-foreground";

const statusTone = (s: TaskStatus) =>
  s === "Completed"
    ? "text-emerald-600"
    : ["Blocked", "Returned for Clarification"].includes(s)
    ? "text-destructive"
    : ["New", "Awaiting Approval"].includes(s)
    ? "text-amber-600"
    : "text-blue-600";

const TAB_MAP: Record<string, TaskStatus[]> = {
  All: [...TASK_STATUSES],
  New: ["New"],
  Accepted: ["Accepted"],
  "In Progress": ["In Progress", "Returned for Clarification"],
  Blocked: ["Blocked"],
  Testing: ["Testing"],
  "Awaiting Approval": ["Awaiting Approval"],
  Completed: ["Completed"],
};
const TABS = Object.keys(TAB_MAP);

const TODAY = "2026-08-04";
const isOverdue = (t: Task) => t.deadlineISO < TODAY && t.status !== "Completed";
const isDueToday = (t: Task) => t.deadlineISO === TODAY && t.status !== "Completed";

const attention = (t: Task): string[] => {
  const a: string[] = [];
  if (t.launchBlocker && isOverdue(t)) a.push("Critical launch task overdue");
  if (t.launchBlocker && ["Blocked", "Returned for Clarification"].includes(t.status))
    a.push("Store launch blocked");
  if (!t.criteria.length) a.push("Task without acceptance criteria");
  if (t.status === "Returned for Clarification") a.push("Task waiting for clarification");
  if (t.dependencies.some((d) => d.overdue)) a.push("Dependency overdue");
  if (t.testingFailed) a.push("Testing failed");
  if (t.returned) a.push("Task returned after review");
  if (t.deadlineChanges >= 3) a.push("Deadline changed multiple times");
  if (t.status === "Awaiting Approval") a.push("Completed task not approved");
  return a;
};

/* ------------------------------- component -------------------------------- */

export function DevProjectTasks() {
  const [tasks, setTasks] = useState<Task[]>(SEED);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [fProject, setFProject] = useState("all");
  const [fStore, setFStore] = useState("all");
  const [fDev, setFDev] = useState("all");
  const [fReq, setFReq] = useState("all");
  const [fType, setFType] = useState("all");
  const [fPrio, setFPrio] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fDeadline, setFDeadline] = useState("");
  const [fRelease, setFRelease] = useState("all");
  const [fUnit, setFUnit] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "block" | "testing" | "note" | "bug" | "return" | "criteria">(null);

  const open = tasks.find((t) => t.id === openId) ?? null;

  const update = (id: string, patch: Partial<Task>, log?: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...patch,
              timeline: log ? [...t.timeline, { at: "Just now", who: "You (Rahul D.)", text: log }] : t.timeline,
            }
          : t,
      ),
    );

  const uniq = (fn: (t: Task) => string) => Array.from(new Set(tasks.map(fn)));

  const filtered = useMemo(() => {
    const allowed = TAB_MAP[tab];
    return tasks
      .filter((t) => allowed.includes(t.status))
      .filter((t) =>
        q.trim() ? (t.id + t.title + t.project + t.store + t.requestedBy).toLowerCase().includes(q.toLowerCase()) : true,
      )
      .filter((t) => (fProject === "all" ? true : t.project === fProject))
      .filter((t) => (fStore === "all" ? true : t.store === fStore))
      .filter((t) => (fDev === "all" ? true : t.assignee === fDev))
      .filter((t) => (fReq === "all" ? true : t.requestedBy === fReq))
      .filter((t) => (fType === "all" ? true : t.type === fType))
      .filter((t) => (fPrio === "all" ? true : t.priority === fPrio))
      .filter((t) => (fStatus === "all" ? true : t.status === fStatus))
      .filter((t) => (fDeadline ? t.deadlineISO === fDeadline : true))
      .filter((t) => (fRelease === "all" ? true : t.release === fRelease))
      .filter((t) => (fUnit === "all" ? true : t.unit === fUnit))
      .sort((a, b) => P_ORDER[a.priority] - P_ORDER[b.priority] || a.deadlineISO.localeCompare(b.deadlineISO));
  }, [tasks, tab, q, fProject, fStore, fDev, fReq, fType, fPrio, fStatus, fDeadline, fRelease, fUnit]);

  const count = (fn: (t: Task) => boolean) => tasks.filter(fn).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHead
          title="Project Tasks"
          sub="Planned development and configuration work assigned by the CTO or Project Coordinator. Issue tickets stay separate — linked, never duplicated."
        />
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search task ID, title, project, store" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="New Tasks" value={String(count((t) => t.status === "New"))} sub="Not accepted" />
        <StatCard label="Due Today" value={String(count(isDueToday))} sub="Deadline today" tone="warn" />
        <StatCard label="In Progress" value={String(count((t) => t.status === "In Progress"))} sub="Active work" />
        <StatCard label="Blocked" value={String(count((t) => t.status === "Blocked"))} sub="Needs escalation" tone="bad" />
        <StatCard label="Waiting for Testing" value={String(count((t) => t.status === "Testing"))} sub="With QA" />
        <StatCard label="Completed This Month" value={String(count((t) => t.status === "Completed"))} sub="August 2026" tone="good" />
      </div>

      <Card className="border-amber-500/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks
            .filter((t) => attention(t).length)
            .slice(0, 6)
            .map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-2 text-sm">
                <button className="font-medium underline underline-offset-2" onClick={() => setOpenId(t.id)}>{t.id}</button>
                <span className="text-muted-foreground truncate max-w-[20rem]">{t.title}</span>
                {attention(t).map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px] border-amber-500 text-amber-700">{a}</Badge>
                ))}
              </div>
            ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              tab === tb ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
            }`}
          >
            {tb}
            <span className="ml-1.5 opacity-70">{tasks.filter((t) => TAB_MAP[tb].includes(t.status)).length}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <Filter label="Project" value={fProject} onChange={setFProject} options={uniq((t) => t.project)} />
          <Filter label="Store" value={fStore} onChange={setFStore} options={uniq((t) => t.store)} />
          <Filter label="Assigned developer" value={fDev} onChange={setFDev} options={uniq((t) => t.assignee)} />
          <Filter label="Requested by" value={fReq} onChange={setFReq} options={uniq((t) => t.requestedBy)} />
          <Filter label="Task type" value={fType} onChange={setFType} options={[...TASK_TYPES]} />
          <Filter label="Priority" value={fPrio} onChange={setFPrio} options={["Critical", "High", "Medium", "Low"]} />
          <Filter label="Status" value={fStatus} onChange={setFStatus} options={[...TASK_STATUSES]} />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Deadline</Label>
            <Input type="date" value={fDeadline} onChange={(e) => setFDeadline(e.target.value)} />
          </div>
          <Filter label="Release" value={fRelease} onChange={setFRelease} options={uniq((t) => t.release)} />
          <Filter label="Business unit" value={fUnit} onChange={setFUnit} options={uniq((t) => t.unit)} />
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setFProject("all"); setFStore("all"); setFDev("all"); setFReq("all"); setFType("all");
                setFPrio("all"); setFStatus("all"); setFDeadline(""); setFRelease("all"); setFUnit("all"); setQ("");
              }}
            >
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* desktop table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                {["Priority","Task ID","Task title","Project / store","Task type","Requested by","Deadline","Effort","Status","Next action",""].map((h) => (
                  <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><Badge className={prioTone(t.priority)}>{t.priority}</Badge></td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{t.id}</td>
                  <td className="px-3 py-2 max-w-[18rem] truncate">{t.title}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div>{t.project}</div>
                    <div className="text-xs text-muted-foreground">{t.store}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.type}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.requestedBy}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${isOverdue(t) ? "text-destructive font-medium" : ""}`}>{t.deadline}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.effort}</td>
                  <td className={`px-3 py-2 whitespace-nowrap font-medium ${statusTone(t.status)}`}>{t.status}</td>
                  <td className="px-3 py-2 max-w-[14rem] truncate">{t.nextAction}</td>
                  <td className="px-3 py-2"><Button size="sm" variant="outline" onClick={() => setOpenId(t.id)}>View Task</Button></td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">No tasks match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge className={prioTone(t.priority)}>{t.priority}</Badge>
                <span className="text-xs text-muted-foreground">{t.id}</span>
              </div>
              <div className="font-medium text-sm">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.project} · {t.store}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span>{t.type}</span>
                <span className="text-muted-foreground">By {t.requestedBy}</span>
                <span className={isOverdue(t) ? "text-destructive" : "text-muted-foreground"}>Due {t.deadline}</span>
                <span className="text-muted-foreground">Effort {t.effort}</span>
                <span className={statusTone(t.status)}>{t.status}</span>
              </div>
              <div className="text-xs">Next: {t.nextAction}</div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(t.id)}>View Task</Button>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && <div className="text-sm text-muted-foreground">No tasks match these filters.</div>}
      </div>

      <p className="text-xs text-muted-foreground">
        Security: never store passwords, tokens, API keys or secret credentials in task descriptions. Sensitive technical notes stay restricted to the Developer and CTO. Ownership history is preserved on every reassignment.
      </p>

      {/* details */}
      <Sheet open={!!open} onOpenChange={(v) => { if (!v) { setOpenId(null); setDialog(null); } }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  <span>{open.id}</span>
                  <Badge className={prioTone(open.priority)}>{open.priority}</Badge>
                  <span className={`text-sm ${statusTone(open.status)}`}>{open.status}</span>
                </SheetTitle>
                <SheetDescription>{open.title}</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5 text-sm">
                {!!attention(open).length && (
                  <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 space-y-1">
                    {attention(open).map((a) => (
                      <div key={a} className="flex items-center gap-2 text-amber-800 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" /> {a}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Field k="Project or store" v={`${open.project} · ${open.store}`} />
                  <Field k="Business unit" v={open.unit} />
                  <Field k="Task type" v={open.type} />
                  <Field k="System area" v={open.area} />
                  <Field k="Requested by" v={open.requestedBy} />
                  <Field k="Approved by" v={open.approvedBy} />
                  <Field k="Assigned developer" v={open.assignee} />
                  <Field k="Estimated effort" v={open.effort} />
                  <Field k="Start date" v={open.start} />
                  <Field k="Deadline" v={`${open.deadline}${open.deadlineChanges ? ` (changed ${open.deadlineChanges}×)` : ""}`} />
                  <Field k="Target release" v={open.release} />
                  <Field k="Approval stage" v={open.approval} />
                </div>

                <Block title="Business requirement">{open.requirement}</Block>
                <Block title="Expected outcome">{open.outcome}</Block>

                <Block title="Acceptance criteria">
                  {open.criteria.length ? (
                    <>
                      <Progress
                        className="h-2 mb-2"
                        value={(open.criteria.filter((c) => c.done).length / open.criteria.length) * 100}
                      />
                      <div className="space-y-1.5">
                        {open.criteria.map((c, i) => (
                          <label key={c.text} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={c.done}
                              onCheckedChange={() =>
                                update(open.id, {
                                  criteria: open.criteria.map((x, xi) => (xi === i ? { ...x, done: !x.done } : x)),
                                })
                              }
                            />
                            <span className={c.done ? "line-through text-muted-foreground" : ""}>{c.text}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="text-destructive text-xs">No acceptance criteria defined — add criteria before starting work.</span>
                  )}
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setDialog("criteria")}>Add Checklist Item</Button>
                </Block>

                <Block title="Dependencies">
                  {open.dependencies.length ? (
                    <ul className="space-y-1">
                      {open.dependencies.map((d) => (
                        <li key={d.text} className={`text-sm ${d.overdue ? "text-destructive" : ""}`}>
                          • {d.text} {d.overdue && "(overdue)"}
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-muted-foreground text-xs">No dependencies</span>}
                </Block>

                <Block title="Related tickets, bugs and files">
                  <div className="flex flex-wrap gap-2">
                    {open.relatedTickets.map((r) => <Badge key={r} variant="secondary">Ticket {r}</Badge>)}
                    {open.relatedBugs.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
                    {open.files.map((f) => <Badge key={f} variant="outline">{f}</Badge>)}
                    {!open.relatedTickets.length && !open.relatedBugs.length && !open.files.length && (
                      <span className="text-muted-foreground text-xs">No linked records</span>
                    )}
                  </div>
                </Block>

                {open.blocked && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs space-y-1">
                    <div className="font-medium text-destructive">Blocked</div>
                    <div>Reason: {open.blocked.reason}</div>
                    <div>Responsible: {open.blocked.person}</div>
                    <div>Required: {open.blocked.needed}</div>
                    <div>Expected resolution: {open.blocked.expected}</div>
                    <div>Next follow-up: {open.blocked.followUp}</div>
                  </div>
                )}

                {open.restrictedNote && (
                  <div className="rounded-md border p-3 text-xs flex gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{open.restrictedNote} <span className="text-muted-foreground">(Restricted: Developer and CTO only)</span></span>
                  </div>
                )}

                <Block title="Activity history">
                  <div className="space-y-2">
                    {open.timeline.map((a, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-muted-foreground">{a.at} · {a.who}</span>
                          <div>{a.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Block>

                <Separator />

                <div>
                  <div className="text-xs font-medium mb-2">Developer actions</div>
                  <div className="flex flex-wrap gap-2">
                    {open.status === "New" && (
                      <Button size="sm" onClick={() => update(open.id, { status: "Accepted", nextAction: "Start work" }, "Task accepted.")}>Accept Task</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setDialog("return")}>Return for Clarification</Button>
                    {["Accepted", "Blocked", "Returned for Clarification"].includes(open.status) && (
                      <Button size="sm" onClick={() => update(open.id, { status: "In Progress", blocked: undefined, nextAction: "Complete acceptance criteria" }, "Work started.")}>Start Work</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setDialog("note")}>Add Progress Note</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("criteria")}>Add Checklist Item</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("block")}>Mark Blocked</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("bug")}><Bug className="h-3.5 w-3.5 mr-1" />Create Bug</Button>
                    {["In Progress", "Testing"].includes(open.status) && (
                      <Button size="sm" variant="outline" onClick={() => setDialog("testing")}>Submit for Testing</Button>
                    )}
                    {open.status === "Testing" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          update(open.id, {
                            status: "Awaiting Approval",
                            approval: open.highRisk ? "CTO Approval Required" : "Requester Review",
                            testingFailed: false,
                            nextAction: open.highRisk ? "CTO approval required before release" : "Awaiting requester approval",
                          }, `Submitted for approval. ${open.highRisk ? "High-risk task — CTO approval required before release." : "Requester review requested."}`)
                        }
                      >
                        Submit for Approval
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={open.status !== "Awaiting Approval"}
                      onClick={() => {
                        if (open.highRisk && open.approval !== "Approved" && open.approval === "CTO Approval Required") {
                          toast.error("High-risk task needs CTO approval before completion.");
                          return;
                        }
                        update(open.id, { status: "Completed", approval: "Approved", nextAction: "None — approved" }, "Task marked completed. Requester notified.");
                        toast.success("Task completed. Requester notified.");
                      }}
                    >
                      Mark Completed
                    </Button>
                  </div>
                </div>

                {open.status === "Awaiting Approval" && (
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="text-xs font-medium">Approval decision ({open.approval})</div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => update(open.id, { status: "Completed", approval: "Approved", nextAction: "None — approved" }, "Approved by requester/CTO. Requester notified of completion.")}>Approve</Button>
                      <RejectButton onReject={(c) => update(open.id, { status: "In Progress", approval: "Rejected or Returned", returned: true, nextAction: "Address review comments" }, `Work rejected and returned to In Progress: ${c}`)} />
                    </div>
                  </div>
                )}
              </div>

              {/* dialogs */}
              <BlockDialog
                open={dialog === "block"}
                onClose={() => setDialog(null)}
                onSubmit={(b) => {
                  update(open.id, { status: "Blocked", blocked: b, nextAction: `Follow up with ${b.person} by ${b.followUp}` },
                    `Marked blocked: ${b.reason}. CTO / Project Coordinator notified.`);
                  toast.success("Task blocked. CTO and Project Coordinator notified.");
                  setDialog(null);
                }}
              />
              <TestingDialog
                open={dialog === "testing"}
                onClose={() => setDialog(null)}
                onSubmit={(summary) => {
                  update(open.id, { status: "Testing", approval: "Developer Completed", nextAction: "Awaiting test result" },
                    `Submitted for testing on the same task record. ${summary}`);
                  toast.success("Sent for testing");
                  setDialog(null);
                }}
              />
              <SimpleDialog
                open={dialog === "note"}
                title="Add progress note"
                desc="Never include passwords, tokens, API keys or secret credentials."
                placeholder="Progress update"
                onClose={() => setDialog(null)}
                onSubmit={(v) => { update(open.id, {}, `Progress note: ${v}`); toast.success("Note added"); setDialog(null); }}
              />
              <SimpleDialog
                open={dialog === "criteria"}
                title="Add checklist item"
                desc="Adds a completion requirement to this task's acceptance criteria."
                placeholder="e.g. Verified on store POS device"
                onClose={() => setDialog(null)}
                onSubmit={(v) => {
                  update(open.id, { criteria: [...open.criteria, { text: v, done: false }] }, `Acceptance criterion added: ${v}`);
                  toast.success("Checklist item added"); setDialog(null);
                }}
              />
              <SimpleDialog
                open={dialog === "bug"}
                title="Create bug"
                desc={`The bug will be permanently linked to ${open.id}. No duplicate task is created.`}
                placeholder="Bug summary"
                onClose={() => setDialog(null)}
                onSubmit={(v) => {
                  const bug = `BUG-${100 + Math.floor(Math.random() * 90)}`;
                  update(open.id, { relatedBugs: [...open.relatedBugs, bug] }, `Bug ${bug} created and linked: ${v}`);
                  toast.success(`${bug} linked to ${open.id}`); setDialog(null);
                }}
              />
              <SimpleDialog
                open={dialog === "return"}
                title="Return for clarification"
                desc="The requester is notified. The same Task ID is retained."
                placeholder="What clarification is required?"
                onClose={() => setDialog(null)}
                onSubmit={(v) => {
                  update(open.id, { status: "Returned for Clarification", nextAction: `Awaiting clarification: ${v}` }, `Returned for clarification: ${v}`);
                  toast.success("Returned to requester"); setDialog(null);
                }}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------ small pieces ------------------------------ */

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{title}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function SimpleDialog({ open, title, desc, placeholder, onClose, onSubmit }: {
  open: boolean; title: string; desc: string; placeholder: string;
  onClose: () => void; onSubmit: (v: string) => void;
}) {
  const [v, setV] = useState("");
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <Textarea value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!v.trim()} onClick={() => { onSubmit(v.trim()); setV(""); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectButton({ onReject }: { onReject: (comments: string) => void }) {
  const [o, setO] = useState(false);
  const [c, setC] = useState("");
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setO(true)}>Reject / Return</Button>
      <Dialog open={o} onOpenChange={setO}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject or return work</DialogTitle>
            <DialogDescription>Clear comments are required. The task returns to In Progress on the same Task ID.</DialogDescription>
          </DialogHeader>
          <Textarea value={c} onChange={(e) => setC(e.target.value)} placeholder="What must be corrected?" />
          <DialogFooter>
            <Button disabled={!c.trim()} onClick={() => { onReject(c.trim()); setO(false); setC(""); }}>Return to developer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BlockDialog({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void;
  onSubmit: (b: NonNullable<Task["blocked"]>) => void;
}) {
  const [f, setF] = useState({ reason: "", person: "", needed: "", expected: "", followUp: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const ok = Object.values(f).every((v) => v.trim());
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark task blocked</DialogTitle>
          <DialogDescription>All fields are required. The CTO and Project Coordinator are notified.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Ta label="Blocking reason *" v={f.reason} on={(v) => set("reason", v)} />
          <In label="Responsible person *" v={f.person} on={(v) => set("person", v)} />
          <Ta label="Information or action required *" v={f.needed} on={(v) => set("needed", v)} />
          <div className="grid grid-cols-2 gap-3">
            <InDate label="Expected resolution date *" v={f.expected} on={(v) => set("expected", v)} />
            <InDate label="Next follow-up date *" v={f.followUp} on={(v) => set("followUp", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!ok} onClick={() => onSubmit(f)}>Mark Blocked</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestingDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (summary: string) => void }) {
  const [f, setF] = useState({ summary: "", instructions: "", env: "Staging", areas: "", limits: "", media: "" });
  const [selfCheck, setSelfCheck] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const ok = f.summary && f.instructions && f.env && f.areas && selfCheck;
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Testing handoff</DialogTitle>
          <DialogDescription>Testing results update this same task record — no new task is created.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Ta label="Work summary *" v={f.summary} on={(v) => set("summary", v)} />
          <Ta label="Test instructions *" v={f.instructions} on={(v) => set("instructions", v)} />
          <div className="space-y-1">
            <Label className="text-xs">Test environment *</Label>
            <Select value={f.env} onValueChange={(v) => set("env", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Staging", "Pre-production", "Store test device", "Production (read-only)"].map((x) => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <In label="Areas affected *" v={f.areas} on={(v) => set("areas", v)} />
          <Ta label="Known limitations" v={f.limits} on={(v) => set("limits", v)} />
          <In label="Supporting screenshots or video" v={f.media} on={(v) => set("media", v)} />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={selfCheck} onCheckedChange={(v) => setSelfCheck(!!v)} />
            Developer self-check completed
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!ok} onClick={() => onSubmit(`Work summary: ${f.summary} · Environment: ${f.env}`)}>Submit for Testing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Ta({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Textarea value={v} onChange={(e) => on(e.target.value)} rows={2} />
    </div>
  );
}
function In({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
function InDate({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="date" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
