import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Phone, MessageCircle, Eye, AlertTriangle, Clock, CheckCircle2, CalendarClock,
  Plus, RotateCcw, XCircle, ListChecks, CalendarDays, Bell, Mail, MonitorSmartphone,
  ShieldAlert, Wallet, Filter,
} from "lucide-react";

/* ------------------------------ types ------------------------------ */

const FOLLOWUP_TYPES = [
  "Call", "WhatsApp", "Email", "Meeting confirmation", "Proposal follow-up",
  "Payment follow-up", "Document collection", "General task",
] as const;
type FollowupType = (typeof FOLLOWUP_TYPES)[number];

const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
type Priority = (typeof PRIORITIES)[number];

const STAGES = [
  "New Lead", "Contacted", "Qualified", "Proposal Sent", "Follow-up",
  "Meeting Done", "Engagement Letter Pending", "Booking Received", "Won", "Lost",
] as const;

const OWNERS = ["Rahul Mehta", "Priya Sharma", "Amit Verma", "Sneha Kulkarni"] as const;
const UNITS = ["Franchise", "Laundry Services", "Dry Clean"] as const;
const SOURCES = ["Website", "Meta Ads", "Google Ads", "Referral", "Walk-in", "IndiaMART"] as const;
const ALERT_TIMINGS = ["At due time", "15 min before", "30 min before", "1 hour before", "1 day before"] as const;
const REPEATS = ["None", "Daily", "Every 3 days", "Weekly", "Monthly"] as const;

type Status = "Open" | "Completed" | "Rescheduled" | "Cancelled";

type Reminder = {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  city: string;
  unit: string;
  source: string;
  stage: string;
  type: FollowupType;
  priority: Priority;
  purpose: string;
  dueAt: string; // ISO
  originalDueAt?: string;
  owner: string;
  alertTiming: string;
  repeat: string;
  notes: string;
  lastInteraction: string;
  status: Status;
  rescheduleCount: number;
  completedAt?: string;
  outcome?: string;
  cancelReason?: string;
  timeline: { at: string; text: string }[];
};

/* ------------------------------ helpers ------------------------------ */

function iso(offsetMinutes: number) {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}
function fmtDateTime(s: string) {
  const d = new Date(s);
  return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function dayKey(s: string) { return new Date(s).toDateString(); }
function minutesFromNow(s: string) { return Math.round((new Date(s).getTime() - Date.now()) / 60000); }
function humanDelta(mins: number) {
  const a = Math.abs(mins);
  if (a < 60) return `${a} min`;
  if (a < 60 * 24) return `${Math.floor(a / 60)}h ${a % 60}m`;
  return `${Math.floor(a / 1440)}d ${Math.floor((a % 1440) / 60)}h`;
}

type Escalation = "none" | "soon" | "overdue" | "critical";
function escalationOf(r: Reminder): Escalation {
  if (r.status !== "Open") return "none";
  const m = minutesFromNow(r.dueAt);
  if (m < -1440) return "critical";
  if (m < 0) return "overdue";
  if (m <= 30) return "soon";
  return "none";
}
function needsManager(r: Reminder) {
  return escalationOf(r) === "critical" || (r.status === "Open" && r.rescheduleCount >= 3);
}

const PRIORITY_STYLE: Record<Priority, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const ESC_CARD: Record<Escalation, string> = {
  none: "border-slate-200",
  soon: "border-amber-300 bg-amber-50/50",
  overdue: "border-red-300 bg-red-50/50",
  critical: "border-red-700 bg-red-100/60",
};

/* ------------------------------ sample data ------------------------------ */

function seed(): Reminder[] {
  const base: Omit<Reminder, "id" | "timeline" | "status" | "rescheduleCount" | "originalDueAt">[] = [
    { leadId: "CC-1042", leadName: "Rakesh Jain", phone: "9876543210", city: "Jaipur", unit: "Franchise", source: "Meta Ads", stage: "Proposal Sent", type: "Proposal follow-up", priority: "Urgent", purpose: "Confirm proposal review and close on investment slab", dueAt: iso(-2100), owner: "Rahul Mehta", alertTiming: "30 min before", repeat: "None", notes: "Asked for ROI break-up of 2 machines model.", lastInteraction: "Call · 3 days ago" },
    { leadId: "CC-1051", leadName: "Meena Agarwal", phone: "9823012345", city: "Indore", unit: "Franchise", source: "Website", stage: "Engagement Letter Pending", type: "Payment follow-up", priority: "Urgent", purpose: "Collect ₹50,000 engagement letter fee", dueAt: iso(-320), owner: "Rahul Mehta", alertTiming: "1 hour before", repeat: "Daily", notes: "Said payment would be done from HDFC account.", lastInteraction: "WhatsApp · yesterday" },
    { leadId: "CC-1066", leadName: "Sandeep Rao", phone: "9900112233", city: "Pune", unit: "Franchise", source: "Referral", stage: "Qualified", type: "Call", priority: "High", purpose: "Discuss shortlisted shop locations", dueAt: iso(-45), owner: "Rahul Mehta", alertTiming: "At due time", repeat: "None", notes: "Prefers Baner / Aundh area.", lastInteraction: "Call · 4 days ago" },
    { leadId: "CC-1071", leadName: "Farhan Sheikh", phone: "9811223344", city: "Delhi", unit: "Laundry Services", source: "Google Ads", stage: "Contacted", type: "WhatsApp", priority: "Medium", purpose: "Share brochure and pricing deck", dueAt: iso(18), owner: "Priya Sharma", alertTiming: "15 min before", repeat: "None", notes: "Wants Hindi brochure.", lastInteraction: "WhatsApp · 2 days ago" },
    { leadId: "CC-1078", leadName: "Nisha Patel", phone: "9727711223", city: "Surat", unit: "Franchise", source: "IndiaMART", stage: "Follow-up", type: "Meeting confirmation", priority: "High", purpose: "Confirm Google Meet with franchise head at 4 PM", dueAt: iso(140), owner: "Rahul Mehta", alertTiming: "1 hour before", repeat: "None", notes: "Husband will join the call.", lastInteraction: "Call · today" },
    { leadId: "CC-1080", leadName: "Vikram Singh", phone: "9990011223", city: "Lucknow", unit: "Franchise", source: "Website", stage: "Qualified", type: "Document collection", priority: "Medium", purpose: "Collect Aadhaar, PAN and shop photos", dueAt: iso(600), owner: "Amit Verma", alertTiming: "1 day before", repeat: "Every 3 days", notes: "Shop photos pending from owner.", lastInteraction: "WhatsApp · today" },
    { leadId: "CC-1085", leadName: "Kavya Reddy", phone: "9701122334", city: "Hyderabad", unit: "Dry Clean", source: "Meta Ads", stage: "New Lead", type: "Call", priority: "High", purpose: "First connect and qualification", dueAt: iso(1500), owner: "Sneha Kulkarni", alertTiming: "At due time", repeat: "None", notes: "New enquiry from campaign CC-HYD-07.", lastInteraction: "None yet" },
    { leadId: "CC-1090", leadName: "Ajay Bhatia", phone: "9856001122", city: "Ludhiana", unit: "Franchise", source: "Referral", stage: "Proposal Sent", type: "Email", priority: "Low", purpose: "Send revised proposal with 3-machine model", dueAt: iso(3000), owner: "Priya Sharma", alertTiming: "1 day before", repeat: "None", notes: "Comparing with a competing brand.", lastInteraction: "Email · 5 days ago" },
    { leadId: "CC-1093", leadName: "Rohit Malhotra", phone: "9833445566", city: "Mumbai", unit: "Franchise", source: "Walk-in", stage: "Booking Received", type: "General task", priority: "Medium", purpose: "Handover briefing to project coordinator", dueAt: iso(-90), owner: "Rahul Mehta", alertTiming: "At due time", repeat: "None", notes: "Booking amount received on 12th.", lastInteraction: "Call · today" },
    { leadId: "CC-1097", leadName: "Suresh Nair", phone: "9846677889", city: "Kochi", unit: "Laundry Services", source: "Website", stage: "Follow-up", type: "Call", priority: "Medium", purpose: "Re-engage after price objection", dueAt: iso(-4200), owner: "Amit Verma", alertTiming: "At due time", repeat: "Weekly", notes: "Rescheduled thrice, low responsiveness.", lastInteraction: "Call · 6 days ago" },
  ];

  const list: Reminder[] = base.map((b, i) => ({
    ...b,
    id: `R-${100 + i}`,
    status: "Open",
    rescheduleCount: b.leadId === "CC-1097" ? 3 : 0,
    timeline: [{ at: iso(-4320), text: `Reminder created · ${b.type}` }],
  }));

  // completed + cancelled samples
  list.push({
    leadId: "CC-1035", leadName: "Deepak Chauhan", phone: "9812344556", city: "Bhopal", unit: "Franchise",
    source: "Google Ads", stage: "Meeting Done", type: "Call", priority: "High",
    purpose: "Post-meeting confirmation of documents", dueAt: iso(-180), owner: "Rahul Mehta",
    alertTiming: "At due time", repeat: "None", notes: "", lastInteraction: "Call · today",
    id: "R-201", status: "Completed", rescheduleCount: 0, completedAt: iso(-120),
    outcome: "Connected — Interested",
    timeline: [{ at: iso(-1440), text: "Reminder created · Call" }, { at: iso(-120), text: "Completed · Connected — Interested" }],
  });
  list.push({
    leadId: "CC-1029", leadName: "Anita Joshi", phone: "9867001122", city: "Nashik", unit: "Dry Clean",
    source: "Referral", stage: "Lost", type: "Proposal follow-up", priority: "Low",
    purpose: "Proposal follow-up", dueAt: iso(-60), owner: "Priya Sharma",
    alertTiming: "At due time", repeat: "None", notes: "", lastInteraction: "Call · 2 days ago",
    id: "R-202", status: "Cancelled", rescheduleCount: 1, cancelReason: "Lead marked Lost — budget not available",
    timeline: [{ at: iso(-2880), text: "Reminder created" }, { at: iso(-60), text: "Cancelled · Lead marked Lost" }],
  });
  list.push({
    leadId: "CC-1060", leadName: "Imran Qureshi", phone: "9820011223", city: "Nagpur", unit: "Franchise",
    source: "Meta Ads", stage: "Qualified", type: "Call", priority: "Medium",
    purpose: "Discuss investment readiness", dueAt: iso(2880), originalDueAt: iso(-1440), owner: "Amit Verma",
    alertTiming: "30 min before", repeat: "None", notes: "Travelling this week.", lastInteraction: "Call · yesterday",
    id: "R-203", status: "Rescheduled", rescheduleCount: 1,
    timeline: [{ at: iso(-2880), text: "Reminder created" }, { at: iso(-1440), text: `Rescheduled from ${fmtDateTime(iso(-1440))} to ${fmtDateTime(iso(2880))}` }],
  });
  return list;
}

const OUTCOMES = [
  "Connected — Interested", "Connected — Not interested", "No answer", "Busy — call later",
  "Meeting scheduled", "Proposal shared", "Payment committed", "Documents received",
] as const;

const NEXT_ACTIONS = [
  "Call again", "Send WhatsApp", "Send proposal", "Schedule meeting",
  "Collect payment", "Collect documents", "No further action",
] as const;

/* ------------------------------ page ------------------------------ */

export function FollowupsReminders() {
  const [items, setItems] = useState<Reminder[]>(seed);
  const [tab, setTab] = useState<"all" | "overdue" | "today" | "upcoming" | "completed" | "rescheduled" | "cancelled">("all");
  const [viewMode, setViewMode] = useState<"list" | "day" | "week">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [f, setF] = useState({ type: "all", priority: "all", stage: "all", owner: "all", unit: "all", due: "all", source: "all", completion: "all" });

  const [createOpen, setCreateOpen] = useState(false);
  const [completeFor, setCompleteFor] = useState<Reminder | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<Reminder | null>(null);
  const [cancelFor, setCancelFor] = useState<Reminder | null>(null);
  const [detailFor, setDetailFor] = useState<Reminder | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const today = new Date().toDateString();

  const counts = useMemo(() => {
    const open = items.filter((r) => r.status === "Open");
    return {
      all: items.length,
      overdue: open.filter((r) => minutesFromNow(r.dueAt) < 0).length,
      today: open.filter((r) => dayKey(r.dueAt) === today && minutesFromNow(r.dueAt) >= 0).length,
      upcoming: open.filter((r) => dayKey(r.dueAt) !== today && minutesFromNow(r.dueAt) > 0).length,
      completed: items.filter((r) => r.status === "Completed").length,
      completedToday: items.filter((r) => r.status === "Completed" && r.completedAt && dayKey(r.completedAt) === today).length,
      rescheduled: items.filter((r) => r.status === "Rescheduled").length,
      cancelled: items.filter((r) => r.status === "Cancelled").length,
      manager: items.filter(needsManager).length,
    };
  }, [items, today]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (tab === "overdue") list = list.filter((r) => r.status === "Open" && minutesFromNow(r.dueAt) < 0);
    if (tab === "today") list = list.filter((r) => r.status === "Open" && dayKey(r.dueAt) === today && minutesFromNow(r.dueAt) >= 0);
    if (tab === "upcoming") list = list.filter((r) => r.status === "Open" && dayKey(r.dueAt) !== today && minutesFromNow(r.dueAt) > 0);
    if (tab === "completed") list = list.filter((r) => r.status === "Completed");
    if (tab === "rescheduled") list = list.filter((r) => r.status === "Rescheduled");
    if (tab === "cancelled") list = list.filter((r) => r.status === "Cancelled");

    if (f.type !== "all") list = list.filter((r) => r.type === f.type);
    if (f.priority !== "all") list = list.filter((r) => r.priority === f.priority);
    if (f.stage !== "all") list = list.filter((r) => r.stage === f.stage);
    if (f.owner !== "all") list = list.filter((r) => r.owner === f.owner);
    if (f.unit !== "all") list = list.filter((r) => r.unit === f.unit);
    if (f.source !== "all") list = list.filter((r) => r.source === f.source);
    if (f.completion !== "all") list = list.filter((r) => (f.completion === "Completed" ? r.status === "Completed" : r.status !== "Completed"));
    if (f.due !== "all") {
      list = list.filter((r) => {
        const m = minutesFromNow(r.dueAt);
        if (f.due === "today") return dayKey(r.dueAt) === today;
        if (f.due === "next7") return m > 0 && m <= 7 * 1440;
        if (f.due === "past") return m < 0;
        return true;
      });
    }

    const rank = (r: Reminder) => {
      if (r.status !== "Open") return 4;
      const m = minutesFromNow(r.dueAt);
      if (m < -1440) return 0;
      if (m < 0) return 1;
      if (dayKey(r.dueAt) === today) return 2;
      return 3;
    };
    return list.sort((a, b) => rank(a) - rank(b) || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [items, tab, f, today]);

  function patch(id: string, fn: (r: Reminder) => Reminder) {
    setItems((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));
  }

  function handleCreate(r: Reminder) {
    setItems((prev) => [r, ...prev]);
    setCreateOpen(false);
    toast.success(`Reminder created for ${r.leadName} (${r.leadId})`);
  }

  function handleComplete(r: Reminder, data: { outcome: string; notes: string; newStage: string; nextAction: string; nextDue: string }) {
    const now = new Date().toISOString();
    patch(r.id, (x) => ({
      ...x,
      status: "Completed",
      completedAt: now,
      outcome: data.outcome,
      stage: data.newStage || x.stage,
      timeline: [...x.timeline, { at: now, text: `Completed · ${data.outcome} — ${data.notes}` }],
    }));

    const sync: string[] = [];
    if (r.type === "Call" || data.outcome.startsWith("Connected") || data.outcome === "No answer") sync.push("Priority Call Queue");
    if (data.outcome === "Meeting scheduled" || data.nextAction === "Schedule meeting") sync.push("Meetings");
    if (data.newStage && data.newStage !== r.stage) sync.push("Sales Pipeline");
    sync.push("Dashboard & Performance");

    if (data.nextAction !== "No further action" && data.nextDue) {
      const next: Reminder = {
        ...r,
        id: `R-${Math.floor(Math.random() * 9000) + 1000}`,
        type: data.nextAction === "Send WhatsApp" ? "WhatsApp"
          : data.nextAction === "Send proposal" ? "Proposal follow-up"
          : data.nextAction === "Schedule meeting" ? "Meeting confirmation"
          : data.nextAction === "Collect payment" ? "Payment follow-up"
          : data.nextAction === "Collect documents" ? "Document collection"
          : "Call",
        purpose: data.nextAction,
        dueAt: new Date(data.nextDue).toISOString(),
        status: "Open",
        rescheduleCount: 0,
        completedAt: undefined,
        outcome: undefined,
        stage: data.newStage || r.stage,
        lastInteraction: `${r.type} · just now`,
        notes: data.notes,
        timeline: [{ at: now, text: `Auto-created from completed ${r.type}` }],
      };
      setItems((prev) => [next, ...prev]);
    } else if (!["Won", "Lost"].includes(data.newStage || r.stage)) {
      toast.warning("Active lead left without a next action — add one soon.");
    }

    if (["Won", "Lost"].includes(data.newStage)) {
      setItems((prev) => prev.map((x) =>
        x.leadId === r.leadId && x.status === "Open"
          ? { ...x, status: "Cancelled", cancelReason: `Lead marked ${data.newStage}`, timeline: [...x.timeline, { at: now, text: `Cancelled · lead marked ${data.newStage}` }] }
          : x));
    }

    setCompleteFor(null);
    toast.success(`Follow-up completed · synced to ${sync.join(", ")}`);
  }

  function handleReschedule(r: Reminder, newDue: string, reason: string) {
    const now = new Date().toISOString();
    patch(r.id, (x) => ({
      ...x,
      originalDueAt: x.originalDueAt ?? x.dueAt,
      dueAt: new Date(newDue).toISOString(),
      status: "Open",
      rescheduleCount: x.rescheduleCount + 1,
      timeline: [...x.timeline, { at: now, text: `Rescheduled from ${fmtDateTime(x.dueAt)} to ${fmtDateTime(new Date(newDue).toISOString())}${reason ? ` · ${reason}` : ""}` }],
    }));
    setRescheduleFor(null);
    if (r.rescheduleCount + 1 >= 3) toast.warning("Rescheduled 3+ times — flagged for manager attention.");
    else toast.success("Follow-up rescheduled. Original date kept in the timeline.");
  }

  function handleCancel(r: Reminder, reason: string) {
    const now = new Date().toISOString();
    patch(r.id, (x) => ({
      ...x, status: "Cancelled", cancelReason: reason,
      timeline: [...x.timeline, { at: now, text: `Cancelled · ${reason}` }],
    }));
    setCancelFor(null);
    toast.success("Reminder cancelled.");
  }

  const TABS: { key: typeof tab; label: string; n: number }[] = [
    { key: "all", label: "All", n: counts.all },
    { key: "overdue", label: "Overdue", n: counts.overdue },
    { key: "today", label: "Due Today", n: counts.today },
    { key: "upcoming", label: "Upcoming", n: counts.upcoming },
    { key: "completed", label: "Completed", n: counts.completed },
    { key: "rescheduled", label: "Rescheduled", n: counts.rescheduled },
    { key: "cancelled", label: "Cancelled", n: counts.cancelled },
  ];

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#2563EB]" /> Follow-ups &amp; Reminders
          </h2>
          <p className="text-sm text-muted-foreground">Every commitment stays tied to a lead, an owner and a due time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setNotifOpen(true)}>
            <Bell className="w-4 h-4 mr-1" /> Notifications
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Reminder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <HeadStat label="Overdue" value={counts.overdue} icon={AlertTriangle} tone="red" />
        <HeadStat label="Due Today" value={counts.today} icon={Clock} tone="amber" />
        <HeadStat label="Upcoming" value={counts.upcoming} icon={CalendarDays} tone="blue" />
        <HeadStat label="Completed Today" value={counts.completedToday} icon={CheckCircle2} tone="green" />
      </div>

      {counts.manager > 0 && (
        <Card className="border-red-300 bg-red-50/60">
          <CardContent className="p-3 flex items-center gap-2 text-sm text-red-800">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span><strong>{counts.manager}</strong> follow-up(s) need manager attention (overdue 24h+ or rescheduled 3 times).</span>
          </CardContent>
        </Card>
      )}

      {/* view options */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border p-1 bg-muted/40">
          {([["list", "Action List", ListChecks], ["day", "Daily View", CalendarDays], ["week", "Weekly View", CalendarDays]] as const).map(([k, label, Icon]) => (
            <button key={k} onClick={() => setViewMode(k)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                viewMode === k ? "bg-white shadow-sm text-[#2563EB]" : "text-slate-600")}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters((s) => !s)}>
          <Filter className="w-4 h-4 mr-1" /> Filters
        </Button>
      </div>

      {/* status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium border",
              tab === t.key ? "bg-[#2563EB] text-white border-[#2563EB]" : "bg-white text-slate-600 hover:bg-slate-50")}>
            {t.label} <span className="tabular-nums opacity-80">({t.n})</span>
          </button>
        ))}
      </div>

      {showFilters && (
        <Card><CardContent className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <FilterSelect label="Follow-up type" value={f.type} onChange={(v) => setF({ ...f, type: v })} options={[...FOLLOWUP_TYPES]} />
          <FilterSelect label="Priority" value={f.priority} onChange={(v) => setF({ ...f, priority: v })} options={[...PRIORITIES]} />
          <FilterSelect label="Lead stage" value={f.stage} onChange={(v) => setF({ ...f, stage: v })} options={[...STAGES]} />
          <FilterSelect label="Salesperson" value={f.owner} onChange={(v) => setF({ ...f, owner: v })} options={[...OWNERS]} />
          <FilterSelect label="Business unit" value={f.unit} onChange={(v) => setF({ ...f, unit: v })} options={[...UNITS]} />
          <FilterSelect label="Lead source" value={f.source} onChange={(v) => setF({ ...f, source: v })} options={[...SOURCES]} />
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Due date</label>
            <Select value={f.due} onValueChange={(v) => setF({ ...f, due: v })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any date</SelectItem>
                <SelectItem value="past">Past due</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="next7">Next 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Completion status</label>
            <Select value={f.completion} onValueChange={(v) => setF({ ...f, completion: v })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Not completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 md:col-span-4">
            <Button variant="ghost" size="sm" onClick={() => setF({ type: "all", priority: "all", stage: "all", owner: "all", unit: "all", due: "all", source: "all", completion: "all" })}>
              Clear filters
            </Button>
          </div>
        </CardContent></Card>
      )}

      {/* body */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filtered.length === 0 && <EmptyState />}
          {filtered.map((r) => (
            <FollowupCard key={r.id} r={r}
              onComplete={() => setCompleteFor(r)}
              onReschedule={() => setRescheduleFor(r)}
              onCancel={() => setCancelFor(r)}
              onView={() => setDetailFor(r)} />
          ))}
        </div>
      )}

      {viewMode !== "list" && (
        <CalendarView mode={viewMode} items={filtered} onOpen={setDetailFor} />
      )}

      {/* dialogs */}
      <CreateReminderDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      {completeFor && <CompleteDialog r={completeFor} onClose={() => setCompleteFor(null)} onSubmit={handleComplete} />}
      {rescheduleFor && <RescheduleDialog r={rescheduleFor} onClose={() => setRescheduleFor(null)} onSubmit={handleReschedule} />}
      {cancelFor && <CancelDialog r={cancelFor} onClose={() => setCancelFor(null)} onSubmit={handleCancel} />}
      <DetailSheet r={detailFor} onClose={() => setDetailFor(null)} />
      <NotificationsDialog open={notifOpen} onOpenChange={setNotifOpen} />
    </div>
  );
}

/* ------------------------------ pieces ------------------------------ */

function HeadStat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: "red" | "amber" | "blue" | "green" }) {
  const tones = {
    red: "text-red-600 bg-red-50 border-red-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-emerald-600 bg-emerald-50 border-emerald-200",
  }[tone];
  return (
    <Card className={cn("border", tones.split(" ").slice(2).join(" "))}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", tones)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function EmptyState() {
  return (
    <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
      No follow-ups here. Nothing pending in this view.
    </CardContent></Card>
  );
}

function FollowupCard({ r, onComplete, onReschedule, onCancel, onView }: {
  r: Reminder; onComplete: () => void; onReschedule: () => void; onCancel: () => void; onView: () => void;
}) {
  const esc = escalationOf(r);
  const mins = minutesFromNow(r.dueAt);
  const manager = needsManager(r);

  return (
    <Card className={cn("border-2", ESC_CARD[esc], r.status !== "Open" && "opacity-90")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{r.leadName}</span>
              <span className="text-xs text-muted-foreground font-mono">{r.leadId}</span>
              <Badge variant="outline" className={PRIORITY_STYLE[r.priority]}>{r.priority}</Badge>
              <Badge variant="outline">{r.type}</Badge>
              {r.type === "Payment follow-up" && mins < 0 && r.status === "Open" && (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200"><Wallet className="w-3 h-3 mr-1" /> Payment overdue</Badge>
              )}
              {r.status !== "Open" && <Badge variant="outline" className="bg-slate-100 text-slate-600">{r.status}</Badge>}
              {manager && <Badge variant="outline" className="bg-red-700 text-white border-red-700">Manager attention</Badge>}
            </div>
            <p className="text-sm mt-1">{r.purpose}</p>
            <div className="text-xs text-muted-foreground mt-1">
              {r.stage} · {r.owner} · {r.city} · Last: {r.lastInteraction}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-medium">{fmtDateTime(r.dueAt)}</div>
            {r.status === "Open" ? (
              <div className={cn("text-xs font-semibold",
                esc === "critical" ? "text-red-800" : esc === "overdue" ? "text-red-600" : esc === "soon" ? "text-amber-600" : "text-muted-foreground")}>
                {mins < 0 ? `Overdue by ${humanDelta(mins)}` : `In ${humanDelta(mins)}`}
              </div>
            ) : r.status === "Completed" ? (
              <div className="text-xs text-emerald-600 font-semibold">{r.outcome}</div>
            ) : (
              <div className="text-xs text-muted-foreground">{r.cancelReason ?? "Rescheduled"}</div>
            )}
            {r.rescheduleCount > 0 && <div className="text-[11px] text-muted-foreground">Rescheduled {r.rescheduleCount}×</div>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {r.status === "Open" && (
            <>
              <Button size="sm" onClick={onComplete}><CheckCircle2 className="w-4 h-4 mr-1" /> Complete</Button>
              <Button size="sm" variant="outline" onClick={onReschedule}><RotateCcw className="w-4 h-4 mr-1" /> Reschedule</Button>
            </>
          )}
          <a href={`tel:${r.phone}`}><Button size="sm" variant="outline"><Phone className="w-4 h-4 mr-1" /> Call</Button></a>
          <a href={`https://wa.me/91${r.phone}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200"><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button>
          </a>
          <Button size="sm" variant="ghost" onClick={onView}><Eye className="w-4 h-4 mr-1" /> View Lead</Button>
          {r.status === "Open" && (
            <Button size="sm" variant="ghost" className="text-red-600" onClick={onCancel}><XCircle className="w-4 h-4 mr-1" /> Cancel</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarView({ mode, items, onOpen }: { mode: "day" | "week"; items: Reminder[]; onOpen: (r: Reminder) => void }) {
  const days = useMemo(() => {
    const n = mode === "day" ? 1 : 7;
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [mode]);

  return (
    <div className={cn("grid gap-3", mode === "day" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
      {days.map((d) => {
        const list = items.filter((r) => dayKey(r.dueAt) === d.toDateString());
        return (
          <Card key={d.toISOString()} className="min-h-[140px]">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</div>
                <Badge variant="outline" className="text-[11px]">{list.length}</Badge>
              </div>
              <Separator />
              {list.length === 0 && <div className="text-xs text-muted-foreground py-2">No follow-ups</div>}
              {list.map((r) => {
                const esc = escalationOf(r);
                return (
                  <button key={r.id} onClick={() => onOpen(r)}
                    className={cn("w-full text-left rounded-lg border p-2 hover:shadow-sm transition", ESC_CARD[esc])}>
                    <div className="text-xs font-semibold truncate">{new Date(r.dueAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {r.leadName}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{r.type} · {r.owner}</div>
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

/* ------------------------------ dialogs ------------------------------ */

const SAMPLE_LEADS = [
  { id: "CC-1042", name: "Rakesh Jain", phone: "9876543210", city: "Jaipur", unit: "Franchise", source: "Meta Ads", stage: "Proposal Sent" },
  { id: "CC-1051", name: "Meena Agarwal", phone: "9823012345", city: "Indore", unit: "Franchise", source: "Website", stage: "Engagement Letter Pending" },
  { id: "CC-1066", name: "Sandeep Rao", phone: "9900112233", city: "Pune", unit: "Franchise", source: "Referral", stage: "Qualified" },
  { id: "CC-1085", name: "Kavya Reddy", phone: "9701122334", city: "Hyderabad", unit: "Dry Clean", source: "Meta Ads", stage: "New Lead" },
  { id: "CC-1090", name: "Ajay Bhatia", phone: "9856001122", city: "Ludhiana", unit: "Franchise", source: "Referral", stage: "Proposal Sent" },
];

function CreateReminderDialog({ open, onOpenChange, onCreate }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreate: (r: Reminder) => void;
}) {
  const [leadId, setLeadId] = useState("");
  const [type, setType] = useState<FollowupType>("Call");
  const [purpose, setPurpose] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("11:00");
  const [owner, setOwner] = useState<string>(OWNERS[0]);
  const [alertTiming, setAlertTiming] = useState<string>(ALERT_TIMINGS[1]);
  const [repeat, setRepeat] = useState<string>(REPEATS[0]);
  const [notes, setNotes] = useState("");

  function submit() {
    const lead = SAMPLE_LEADS.find((l) => l.id === leadId);
    if (!lead) return toast.error("Select a lead — every reminder must belong to a lead.");
    if (!owner) return toast.error("Assign an owner.");
    if (!purpose.trim()) return toast.error("Add the purpose of this follow-up.");
    const dueAt = new Date(`${date}T${time}`).toISOString();
    onCreate({
      id: `R-${Math.floor(Math.random() * 9000) + 1000}`,
      leadId: lead.id, leadName: lead.name, phone: lead.phone, city: lead.city,
      unit: lead.unit, source: lead.source, stage: lead.stage,
      type, priority, purpose: purpose.trim(), dueAt, owner, alertTiming, repeat,
      notes, lastInteraction: "—", status: "Open", rescheduleCount: 0,
      timeline: [{ at: new Date().toISOString(), text: `Reminder created · ${type}` }],
    });
    setPurpose(""); setNotes(""); setLeadId("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Reminder</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Select lead *">
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue placeholder="Search existing lead" /></SelectTrigger>
              <SelectContent>
                {SAMPLE_LEADS.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} · {l.id} · {l.city}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Follow-up type">
              <Select value={type} onValueChange={(v) => setType(v as FollowupType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FOLLOWUP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Purpose *"><Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="What must be achieved in this follow-up?" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Due time"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assigned owner *">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Reminder alert">
              <Select value={alertTiming} onValueChange={setAlertTiming}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALERT_TIMINGS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          {["Payment follow-up", "Document collection", "General task", "Call"].includes(type) && (
            <Field label="Repeat">
              <Select value={repeat} onValueChange={setRepeat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REPEATS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Notes"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context for the next conversation" /></Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit}>Save Reminder</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompleteDialog({ r, onClose, onSubmit }: {
  r: Reminder; onClose: () => void;
  onSubmit: (r: Reminder, d: { outcome: string; notes: string; newStage: string; nextAction: string; nextDue: string }) => void;
}) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [newStage, setNewStage] = useState(r.stage);
  const [nextAction, setNextAction] = useState<string>("Call again");
  const [nextDate, setNextDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [nextTime, setNextTime] = useState("11:00");

  function submit() {
    if (!outcome) return toast.error("Select an outcome.");
    if (notes.trim().length < 5) return toast.error("Activity notes are required.");
    const needsNext = nextAction !== "No further action";
    if (needsNext && (!nextDate || !nextTime)) return toast.error("Set the next due date and time.");
    if (!needsNext && !["Won", "Lost"].includes(newStage)) {
      return toast.error("Active leads cannot be left without a next action.");
    }
    onSubmit(r, { outcome, notes: notes.trim(), newStage, nextAction, nextDue: needsNext ? `${nextDate}T${nextTime}` : "" });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Complete follow-up · {r.leadName}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">{r.type} · {r.leadId} · due {fmtDateTime(r.dueAt)}</div>
          <Field label="Outcome *">
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
              <SelectContent>{OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Activity notes *"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was discussed / agreed?" /></Field>
          <Field label="Updated lead stage">
            <Select value={newStage} onValueChange={setNewStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Next action *">
            <Select value={nextAction} onValueChange={setNextAction}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{NEXT_ACTIONS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          {nextAction !== "No further action" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Next due date"><Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} /></Field>
              <Field label="Next due time"><Input type="time" value={nextTime} onChange={(e) => setNextTime(e.target.value)} /></Field>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            On save: Priority Call Queue, Meetings, Sales Pipeline, Dashboard and Performance are updated automatically.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit}>Save &amp; Complete</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({ r, onClose, onSubmit }: {
  r: Reminder; onClose: () => void; onSubmit: (r: Reminder, newDue: string, reason: string) => void;
}) {
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState("11:00");
  const [reason, setReason] = useState("");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Reschedule · {r.leadName}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">Current due: {fmtDateTime(r.dueAt)} — kept in the activity timeline.</div>
          {r.rescheduleCount >= 2 && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              Already rescheduled {r.rescheduleCount}×. One more will flag this for manager attention.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="New date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="New time"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          </div>
          <Field label="Reason"><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is it moving?" /></Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSubmit(r, `${date}T${time}`, reason.trim())}>Reschedule</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ r, onClose, onSubmit }: { r: Reminder; onClose: () => void; onSubmit: (r: Reminder, reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Cancel reminder · {r.leadName}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Reason for cancellation *">
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mandatory — why is this follow-up no longer needed?" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Back</Button>
            <Button variant="destructive" onClick={() => reason.trim().length >= 5 ? onSubmit(r, reason.trim()) : toast.error("A cancellation reason is required.")}>
              Cancel Reminder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailSheet({ r, onClose }: { r: Reminder | null; onClose: () => void }) {
  return (
    <Sheet open={!!r} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {r && (
          <>
            <SheetHeader><SheetTitle>{r.leadName} · {r.leadId}</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Info k="Type" v={r.type} /><Info k="Priority" v={r.priority} />
                <Info k="Stage" v={r.stage} /><Info k="Owner" v={r.owner} />
                <Info k="Business unit" v={r.unit} /><Info k="Source" v={r.source} />
                <Info k="Due" v={fmtDateTime(r.dueAt)} /><Info k="Alert" v={r.alertTiming} />
                <Info k="Repeat" v={r.repeat} /><Info k="Status" v={r.status} />
              </div>
              <div><div className="text-xs text-muted-foreground">Purpose</div><div>{r.purpose}</div></div>
              {r.notes && <div><div className="text-xs text-muted-foreground">Notes</div><div>{r.notes}</div></div>}
              <Separator />
              <div>
                <div className="font-medium mb-2">Activity timeline</div>
                <ol className="relative border-l pl-5 space-y-3">
                  {r.timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-[#2563EB]" />
                      <div className="text-sm">{t.text}</div>
                      <div className="text-[11px] text-muted-foreground">{fmtDateTime(t.at)}</div>
                    </li>
                  ))}
                </ol>
              </div>
              {r.originalDueAt && (
                <div className="text-xs text-muted-foreground">Original due date: {fmtDateTime(r.originalDueAt)}</div>
              )}
              <div className="flex gap-2">
                <a href={`tel:${r.phone}`}><Button size="sm" variant="outline"><Phone className="w-4 h-4 mr-1" /> Call</Button></a>
                <a href={`https://wa.me/91${r.phone}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200"><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button>
                </a>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function NotificationsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [state, setState] = useState({ inApp: true, browser: false, email: false, whatsapp: false });
  const rows = [
    { k: "inApp" as const, label: "In-app alert", icon: Bell, note: "Active — alerts appear inside the CRM" },
    { k: "browser" as const, label: "Browser notification", icon: MonitorSmartphone, note: "Placeholder — not connected yet" },
    { k: "email" as const, label: "Email notification", icon: Mail, note: "Placeholder — not connected yet" },
    { k: "whatsapp" as const, label: "WhatsApp notification", icon: MessageCircle, note: "Placeholder — not connected yet" },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Reminder notifications</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.k} className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div className="flex items-start gap-2">
                <row.icon className="w-4 h-4 mt-0.5 text-slate-500" />
                <div>
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="text-[11px] text-muted-foreground">{row.note}</div>
                </div>
              </div>
              <Switch checked={state[row.k]} onCheckedChange={(v) => {
                setState({ ...state, [row.k]: v });
                if (v && row.k !== "inApp") toast.info(`${row.label} will be enabled once the channel is connected.`);
              }} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}
function Info({ k, v }: { k: string; v: string }) {
  return <div><div className="text-xs text-muted-foreground">{k}</div><div className="font-medium">{v}</div></div>;
}
