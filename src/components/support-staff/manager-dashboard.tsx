import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CheckSquare,
  Clock,
  Image as ImageIcon,
  ListChecks,
  Plus,
  Timer,
} from "lucide-react";
import { ROLE_META, STAFF, type StaffRole } from "./data";
import type { AdminSection } from "./admin-manager-workspace";

type Lang = "en" | "hi";

const T = {
  welcome: { en: "Welcome", hi: "स्वागत है" },
  manager: { en: "Anil Mehta", hi: "अनिल मेहता" },
  addTask: { en: "Add Task", hi: "नया काम" },
  tasksToday: { en: "Tasks Today", hi: "आज के काम" },
  notStarted: { en: "Not Started", hi: "शुरू नहीं" },
  inProgress: { en: "In Progress", hi: "चल रहा है" },
  waiting: { en: "Waiting for Review", hi: "जाँच बाकी" },
  overdue: { en: "Overdue", hi: "देर हो गई" },
  completedToday: { en: "Completed Today", hi: "आज पूरा" },
  quickActions: { en: "Quick Actions", hi: "तुरंत काम" },
  assignTask: { en: "Assign Task", hi: "काम सौंपें" },
  reviewWork: { en: "Review Work", hi: "काम जाँचें" },
  viewStaffTasks: { en: "View Staff Tasks", hi: "स्टाफ के काम" },
  checkSupply: { en: "Check Supply Requests", hi: "सामान की मांग" },
  staffStatus: { en: "Staff Status", hi: "स्टाफ स्थिति" },
  assigned: { en: "Assigned", hi: "सौंपे" },
  completed: { en: "Completed", hi: "पूरे" },
  pending: { en: "Pending", hi: "बाकी" },
  viewWork: { en: "View Work", hi: "काम देखें" },
  reviewQueue: { en: "Work Waiting for Review", hi: "जाँच के लिए काम" },
  approve: { en: "Approve", hi: "मंज़ूर" },
  returnWork: { en: "Return for Correction", hi: "सुधार के लिए भेजें" },
  view: { en: "View", hi: "देखें" },
  priority: { en: "Today's Priority Work", hi: "आज का ज़रूरी काम" },
  supplyRequests: { en: "Supply Requests", hi: "सामान की मांग" },
  reject: { en: "Reject", hi: "मना करें" },
  photoProof: { en: "Photo proof", hi: "फोटो सबूत" },
} as const;

const tr = (k: keyof typeof T, lang: Lang) => T[k][lang];

type WorkflowStatus =
  | "assigned"
  | "accepted"
  | "in-progress"
  | "completed"
  | "waiting-review"
  | "approved"
  | "returned"
  | "cancelled";

type Availability = "available" | "busy" | "absent" | "off-duty";

type MgrTask = {
  id: string;
  title: string;
  icon: string;
  instructions: string;
  due: string;
  priority: "urgent" | "high" | "normal";
  role: StaffRole;
  assignee: string;
  status: WorkflowStatus;
  completedAt?: string;
  photo?: string;
  overdue?: boolean;
  dueWithinHour?: boolean;
  repeatMisses?: number;
  history: string[];
};

const AVAILABILITY: Record<string, Availability> = {
  "Ramesh Kumar": "busy",
  "Sunita Devi": "available",
  "Arjun Yadav": "off-duty",
  "Mohit Sharma": "busy",
  "Pooja Verma": "absent",
};

const AVAIL_LABEL: Record<Availability, { en: string; hi: string; cls: string }> = {
  available: { en: "Available", hi: "उपलब्ध", cls: "bg-emerald-500/15 text-emerald-600" },
  busy: { en: "Busy", hi: "व्यस्त", cls: "bg-blue-500/15 text-blue-600" },
  absent: { en: "Absent", hi: "अनुपस्थित", cls: "bg-destructive/15 text-destructive" },
  "off-duty": { en: "Off Duty", hi: "ड्यूटी नहीं", cls: "bg-muted text-muted-foreground" },
};

const SEED: MgrTask[] = [
  { id: "M-101", title: "Morning tea & coffee service", icon: "☕", instructions: "Serve floors 1 and 2 with covered trays.", due: "9:30 AM", priority: "normal", role: "pantry", assignee: "Ramesh Kumar", status: "approved", completedAt: "9:28 AM", photo: "tea-counter.jpg", history: ["Assigned 8:00 AM", "Accepted 8:05 AM", "Completed 9:28 AM", "Approved 9:40 AM"] },
  { id: "M-102", title: "Refill water dispensers", icon: "🚰", instructions: "All floors, check filter light.", due: "11:00 AM", priority: "normal", role: "pantry", assignee: "Ramesh Kumar", status: "in-progress", history: ["Assigned 8:00 AM", "Accepted 8:06 AM", "Started 10:50 AM"] },
  { id: "M-103", title: "Guest refreshments – CEO cabin", icon: "🫖", instructions: "Serve within 5 minutes of guest arrival.", due: "12:30 PM", priority: "urgent", role: "pantry", assignee: "Ramesh Kumar", status: "assigned", dueWithinHour: true, history: ["Assigned 9:00 AM"] },
  { id: "M-104", title: "Evening snack setup", icon: "🍪", instructions: "Cafeteria counter, 40 people.", due: "4:30 PM", priority: "normal", role: "pantry", assignee: "Ramesh Kumar", status: "assigned", repeatMisses: 2, history: ["Assigned 9:05 AM"] },
  { id: "M-201", title: "Washroom deep clean", icon: "🧼", instructions: "Floor 1 washrooms, use toilet cleaner only.", due: "8:30 AM", priority: "high", role: "cleaning", assignee: "Sunita Devi", status: "waiting-review", completedAt: "8:52 AM", photo: "washroom-f1.jpg", history: ["Assigned 7:30 AM", "Accepted 7:35 AM", "Completed 8:52 AM"] },
  { id: "M-202", title: "Workstation dusting", icon: "🧹", instructions: "Floor 2 Ops desks, dry cloth only.", due: "10:00 AM", priority: "normal", role: "cleaning", assignee: "Sunita Devi", status: "waiting-review", completedAt: "10:35 AM", photo: "ops-desks.jpg", history: ["Assigned 8:00 AM", "Accepted 8:10 AM", "Completed 10:35 AM"] },
  { id: "M-203", title: "Floor mopping – reception", icon: "🪣", instructions: "Place wet-floor sign before mopping.", due: "10:30 AM", priority: "high", role: "cleaning", assignee: "Arjun Yadav", status: "assigned", overdue: true, history: ["Assigned 8:15 AM"] },
  { id: "M-204", title: "Dustbin clearance", icon: "🗑️", instructions: "All floors, replace liners.", due: "6:00 PM", priority: "normal", role: "cleaning", assignee: "Arjun Yadav", status: "accepted", history: ["Assigned 8:20 AM", "Accepted 8:25 AM"] },
  { id: "M-301", title: "Pack franchise starter bundles (6)", icon: "📦", instructions: "1 branding kit, 2 uniform sets, stationery, POS box, folder.", due: "10:00 AM", priority: "urgent", role: "packing", assignee: "Mohit Sharma", status: "in-progress", history: ["Assigned 7:45 AM", "Accepted 7:50 AM", "Started 9:10 AM"] },
  { id: "M-302", title: "Label dispatch cartons – Jaipur", icon: "🏷️", instructions: "Top-right label, double-tape base. Courier pickup 12:30 PM.", due: "11:30 AM", priority: "urgent", role: "packing", assignee: "Mohit Sharma", status: "assigned", dueWithinHour: true, history: ["Assigned 8:30 AM"] },
  { id: "M-303", title: "Branding kit packing – Indore", icon: "📦", instructions: "Bubble-wrap acrylic boards.", due: "9:30 AM", priority: "high", role: "packing", assignee: "Pooja Verma", status: "assigned", overdue: true, repeatMisses: 3, history: ["Assigned 8:00 AM"] },
  { id: "M-304", title: "Quality check packed boxes", icon: "✅", instructions: "Check tape, label and weight of 12 boxes.", due: "4:00 PM", priority: "high", role: "packing", assignee: "Pooja Verma", status: "waiting-review", completedAt: "3:44 PM", photo: "qc-boxes.jpg", history: ["Assigned 9:00 AM", "Accepted 9:05 AM", "Completed 3:44 PM"] },
  { id: "M-305", title: "Re-tape damaged carton", icon: "📦", instructions: "Carton 7 base tape came off.", due: "2:00 PM", priority: "high", role: "packing", assignee: "Mohit Sharma", status: "returned", completedAt: "1:30 PM", photo: "carton-7.jpg", history: ["Assigned 11:00 AM", "Completed 1:30 PM", "Returned 1:50 PM – base tape not double-layered"] },
];

type SupplyRequest = {
  id: string;
  item: string;
  by: string;
  role: StaffRole;
  qty: string;
  reason: string;
  urgency: "urgent" | "normal";
  status: "pending" | "approved" | "rejected";
};

const SEED_REQUESTS: SupplyRequest[] = [
  { id: "R-1", item: "Packing tape", by: "Mohit Sharma", role: "packing", qty: "12 rolls", reason: "Only 2 rolls left, Jaipur dispatch pending", urgency: "urgent", status: "pending" },
  { id: "R-2", item: "Toilet cleaner", by: "Sunita Devi", role: "cleaning", qty: "6 bottles", reason: "Below minimum level for all washrooms", urgency: "urgent", status: "pending" },
  { id: "R-3", item: "Coffee sachets", by: "Ramesh Kumar", role: "pantry", qty: "3 boxes", reason: "Guest visits scheduled this week", urgency: "normal", status: "pending" },
  { id: "R-4", item: "Paper cups", by: "Ramesh Kumar", role: "pantry", qty: "5 packs", reason: "Stock 2 packs vs minimum 4", urgency: "normal", status: "pending" },
];

const PRIORITY_CLS: Record<MgrTask["priority"], string> = {
  urgent: "bg-destructive/15 text-destructive",
  high: "bg-amber-500/15 text-amber-600",
  normal: "bg-muted text-muted-foreground",
};

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

export function ManagerDashboard({ onGo }: { onGo?: (s: AdminSection) => void }) {
  const [lang, setLang] = useState<Lang>("en");
  const [tasks, setTasks] = useState<MgrTask[]>(SEED);
  const [requests, setRequests] = useState<SupplyRequest[]>(SEED_REQUESTS);

  const [addOpen, setAddOpen] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nStaff, setNStaff] = useState("");
  const [nDue, setNDue] = useState("");
  const [nInstr, setNInstr] = useState("");
  const [nPriority, setNPriority] = useState<MgrTask["priority"]>("normal");

  const [returnFor, setReturnFor] = useState<MgrTask | null>(null);
  const [returnNote, setReturnNote] = useState("");
  const [viewTask, setViewTask] = useState<MgrTask | null>(null);
  const [staffFor, setStaffFor] = useState<string | null>(null);

  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const notStarted = tasks.filter((t) => t.status === "assigned" || t.status === "accepted");
  const working = tasks.filter((t) => t.status === "in-progress");
  const review = tasks.filter((t) => t.status === "waiting-review" || t.status === "completed");
  const overdue = tasks.filter((t) => t.overdue && t.status !== "approved");
  const doneToday = tasks.filter((t) => t.status === "approved");

  const cards = [
    { l: tr("tasksToday", lang), v: tasks.length, i: ListChecks, cls: "text-foreground" },
    { l: tr("notStarted", lang), v: notStarted.length, i: Clock, cls: "text-amber-600" },
    { l: tr("inProgress", lang), v: working.length, i: Timer, cls: "text-blue-600" },
    { l: tr("waiting", lang), v: review.length, i: CheckSquare, cls: "text-amber-600" },
    { l: tr("overdue", lang), v: overdue.length, i: AlertTriangle, cls: "text-destructive" },
    { l: tr("completedToday", lang), v: doneToday.length, i: CheckCircle2, cls: "text-emerald-600" },
  ];

  const priorityList = useMemo(() => {
    const rows: { task: MgrTask; reason: string }[] = [];
    tasks.forEach((t) => {
      if (t.status === "approved" || t.status === "cancelled") return;
      if (t.overdue) rows.push({ task: t, reason: lang === "hi" ? "देर हो गई" : "Overdue" });
      else if (t.priority === "urgent")
        rows.push({ task: t, reason: lang === "hi" ? "ज़रूरी काम" : "Urgent task" });
      else if (t.dueWithinHour)
        rows.push({ task: t, reason: lang === "hi" ? "एक घंटे में" : "Due within 1 hour" });
      else if ((t.repeatMisses ?? 0) >= 2)
        rows.push({
          task: t,
          reason: lang === "hi" ? `${t.repeatMisses} बार अधूरा` : `Incomplete ${t.repeatMisses}x`,
        });
    });
    return rows;
  }, [tasks, lang]);

  const addTask = () => {
    const member = STAFF.find((s) => s.name === nStaff);
    if (!nTitle || !member || !nDue) {
      toast.error(lang === "hi" ? "काम, स्टाफ और समय भरें" : "Fill task, staff and due time");
      return;
    }
    setTasks((prev) => [
      {
        id: `M-${900 + prev.length}`,
        title: nTitle,
        icon: nPriority === "urgent" ? "⚡" : "📝",
        instructions: nInstr || "-",
        due: nDue,
        priority: nPriority,
        role: member.role,
        assignee: member.name,
        status: "assigned",
        history: [`Assigned to ${member.name}`],
      },
      ...prev,
    ]);
    setNTitle("");
    setNStaff("");
    setNDue("");
    setNInstr("");
    setNPriority("normal");
    setAddOpen(false);
    toast.success(
      lang === "hi" ? `${member.name} को काम सौंपा गया` : `Task assigned to ${member.name}`,
    );
  };

  const approve = (t: MgrTask) => {
    setTasks((prev) =>
      prev.map((x) =>
        x.id === t.id
          ? { ...x, status: "approved", overdue: false, history: [...x.history, "Approved by manager"] }
          : x,
      ),
    );
    toast.success(lang === "hi" ? "काम मंज़ूर, प्रदर्शन अपडेट" : "Approved · performance updated");
  };

  const submitReturn = () => {
    if (!returnFor) return;
    if (!returnNote.trim()) {
      toast.error(lang === "hi" ? "सुधार का निर्देश लिखें" : "Add a correction instruction");
      return;
    }
    setTasks((prev) =>
      prev.map((x) =>
        x.id === returnFor.id
          ? {
              ...x,
              status: "returned",
              history: [...x.history, `Returned – ${returnNote.trim()}`],
            }
          : x,
      ),
    );
    toast.success(lang === "hi" ? "सुधार के लिए भेजा गया" : "Returned for correction");
    setReturnFor(null);
    setReturnNote("");
  };

  const decideRequest = (id: string, status: "approved" | "rejected") => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(
      status === "approved"
        ? lang === "hi"
          ? "मांग मंज़ूर"
          : "Request approved"
        : lang === "hi"
          ? "मांग अस्वीकार"
          : "Request rejected",
    );
  };

  const quick = [
    { l: tr("assignTask", lang), i: Plus, s: "assign" as AdminSection },
    { l: tr("reviewWork", lang), i: CheckSquare, s: "review" as AdminSection },
    { l: tr("viewStaffTasks", lang), i: ListChecks, s: "staff-tasks" as AdminSection },
    { l: tr("checkSupply", lang), i: Boxes, s: "supplies" as AdminSection },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            {tr("welcome", lang)}, {tr("manager", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border">
            {(["en", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {l === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {tr("addTask", lang)}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((k) => (
          <Card key={k.l}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <k.i className={`h-4 w-4 ${k.cls}`} />
                <span className="leading-tight">{k.l}</span>
              </div>
              <div className={`mt-1 text-3xl font-semibold tabular-nums ${k.cls}`}>{k.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quick.map((q) => (
          <button
            key={q.l}
            onClick={() => onGo?.(q.s)}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-background p-5 text-center text-sm font-medium transition-colors hover:bg-muted"
          >
            <q.i className="h-6 w-6 text-primary" />
            {q.l}
          </button>
        ))}
      </div>

      {/* Staff status */}
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tr("staffStatus", lang)}
        </h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {(Object.keys(ROLE_META) as StaffRole[]).map((role) => {
            const Icon = ROLE_META[role].icon;
            const members = STAFF.filter((s) => s.role === role);
            return (
              <Card key={role}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {ROLE_META[role].label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {members.map((m) => {
                    const list = tasks.filter((t) => t.assignee === m.name);
                    const comp = list.filter((t) => t.status === "approved").length;
                    const pend = list.filter(
                      (t) => !["approved", "cancelled"].includes(t.status),
                    ).length;
                    const od = list.filter((t) => t.overdue && t.status !== "approved").length;
                    const av = AVAILABILITY[m.name] ?? "available";
                    return (
                      <div key={m.id} className="rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{m.name}</div>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${AVAIL_LABEL[av].cls}`}
                            >
                              {AVAIL_LABEL[av][lang]}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-1 text-center text-xs">
                          <div>
                            <div className="font-semibold tabular-nums">{list.length}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {tr("assigned", lang)}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold tabular-nums text-emerald-600">{comp}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {tr("completed", lang)}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold tabular-nums text-amber-600">{pend}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {tr("pending", lang)}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold tabular-nums text-destructive">{od}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {tr("overdue", lang)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => setStaffFor(m.name)}
                        >
                          {tr("viewWork", lang)}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Review queue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{tr("reviewQueue", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {review.slice(0, 5).map((t) => (
            <div key={t.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span>{t.icon}</span>
                <span className="text-sm font-medium">{t.title}</span>
                <Badge variant="outline" className="text-[10px]">
                  {ROLE_META[t.role].label}
                </Badge>
                <Badge className="bg-amber-500/15 text-[10px] text-amber-600 hover:bg-amber-500/15">
                  {tr("waiting", lang)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.assignee} · {t.completedAt}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" />
                {tr("photoProof", lang)}: {t.photo ?? "—"}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => approve(t)}>
                  {tr("approve", lang)}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReturnFor(t)}>
                  {tr("returnWork", lang)}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setViewTask(t)}>
                  {tr("view", lang)}
                </Button>
              </div>
            </div>
          ))}
          {review.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {lang === "hi" ? "जाँच के लिए कुछ नहीं।" : "Nothing waiting for review."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Priority work */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{tr("priority", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {priorityList.map(({ task, reason }) => (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>{task.icon}</span>
                  <span className="truncate">{task.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.assignee} · {ROLE_META[task.role].label} · {task.due}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    task.overdue ? "bg-destructive/15 text-destructive" : PRIORITY_CLS[task.priority]
                  }`}
                >
                  {reason}
                </span>
                <Button size="sm" variant="outline" onClick={() => setViewTask(task)}>
                  {tr("view", lang)}
                </Button>
              </div>
            </div>
          ))}
          {priorityList.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {lang === "hi" ? "कोई ज़रूरी काम नहीं।" : "No priority work right now."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Supply requests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{tr("supplyRequests", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{r.item}</span>
                <Badge variant="outline" className="text-[10px]">
                  {r.qty}
                </Badge>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    r.urgency === "urgent"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.urgency === "urgent"
                    ? lang === "hi"
                      ? "ज़रूरी"
                      : "Urgent"
                    : lang === "hi"
                      ? "सामान्य"
                      : "Normal"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.by} · {ROLE_META[r.role].label} · {r.reason}
              </p>
              {r.status === "pending" ? (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => decideRequest(r.id, "approved")}>
                    {tr("approve", lang)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decideRequest(r.id, "rejected")}
                  >
                    {tr("reject", lang)}
                  </Button>
                </div>
              ) : (
                <Badge
                  className={`mt-2 text-[10px] ${
                    r.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15"
                      : "bg-destructive/15 text-destructive hover:bg-destructive/15"
                  }`}
                >
                  {r.status === "approved"
                    ? lang === "hi"
                      ? "मंज़ूर"
                      : "Approved"
                    : lang === "hi"
                      ? "अस्वीकार"
                      : "Rejected"}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add task dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr("addTask", lang)}</DialogTitle>
            <DialogDescription>
              {lang === "hi"
                ? "एक काम एक स्टाफ को सौंपें।"
                : "Assign one task to one staff member."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={lang === "hi" ? "काम का नाम" : "Task title"}
              value={nTitle}
              onChange={(e) => setNTitle(e.target.value)}
            />
            <Select value={nStaff} onValueChange={setNStaff}>
              <SelectTrigger>
                <SelectValue placeholder={lang === "hi" ? "स्टाफ चुनें" : "Select staff"} />
              </SelectTrigger>
              <SelectContent>
                {STAFF.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name} — {ROLE_META[s.role].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder={lang === "hi" ? "समय (जैसे 3:00 PM)" : "Due time (e.g. 3:00 PM)"}
                value={nDue}
                onChange={(e) => setNDue(e.target.value)}
              />
              <Select
                value={nPriority}
                onValueChange={(v) => setNPriority(v as MgrTask["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{lang === "hi" ? "सामान्य" : "Normal"}</SelectItem>
                  <SelectItem value="high">{lang === "hi" ? "ज़्यादा" : "High"}</SelectItem>
                  <SelectItem value="urgent">{lang === "hi" ? "ज़रूरी" : "Urgent"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder={lang === "hi" ? "आसान निर्देश" : "Simple instructions"}
              value={nInstr}
              onChange={(e) => setNInstr(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={addTask}>{tr("assignTask", lang)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return for correction dialog */}
      <Dialog open={!!returnFor} onOpenChange={(o) => !o && setReturnFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr("returnWork", lang)}</DialogTitle>
            <DialogDescription>{returnFor?.title}</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={
              lang === "hi" ? "क्या सुधारना है (आसान भाषा)" : "What to correct (simple words)"
            }
            value={returnNote}
            onChange={(e) => setReturnNote(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={submitReturn}>{tr("returnWork", lang)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task detail dialog */}
      <Dialog open={!!viewTask} onOpenChange={(o) => !o && setViewTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {viewTask?.icon} {viewTask?.title}
            </DialogTitle>
            <DialogDescription>
              {viewTask?.assignee} · {viewTask && ROLE_META[viewTask.role].label} ·{" "}
              {viewTask?.due}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">{viewTask?.instructions}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px] uppercase">
                {viewTask?.status.replace("-", " ")}
              </Badge>
              <Badge className={`text-[10px] ${viewTask ? PRIORITY_CLS[viewTask.priority] : ""}`}>
                {viewTask?.priority}
              </Badge>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                {lang === "hi" ? "इतिहास" : "History"}
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {viewTask?.history.map((h, i) => <li key={i}>• {h}</li>)}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Staff work dialog */}
      <Dialog open={!!staffFor} onOpenChange={(o) => !o && setStaffFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{staffFor}</DialogTitle>
            <DialogDescription>
              {lang === "hi" ? "आज सौंपे गए काम" : "Tasks assigned today"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.assignee === staffFor)
              .map((t) => (
                <div key={t.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {t.icon} {t.title}
                    </span>
                    <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                      {t.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.due}
                    {t.overdue ? ` · ${lang === "hi" ? "देर" : "overdue"}` : ""}
                  </p>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
