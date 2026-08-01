import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertTriangle, Clock, Eye, UserPlus, CheckSquare, CalendarClock, Filter, X,
  ShieldAlert, Wallet, PhoneCall, MessageSquareWarning, Timer, CheckCircle2,
} from "lucide-react";

/* ------------------------------- types ------------------------------- */

export type Severity = "Critical" | "High" | "Medium" | "Low";

export type EscType =
  | "New Lead Not Contacted"
  | "Overdue Follow-up"
  | "High-Value Lead at Risk"
  | "Stalled Opportunity"
  | "Payment Delay"
  | "Customer Complaint"
  | "Executive Support Request";

type Stage =
  | "New Lead" | "Contacted" | "Qualified" | "Proposal Sent"
  | "Meeting Scheduled" | "Payment Pending" | "Negotiation" | "Won" | "Lost";

export type Escalation = {
  id: string;
  leadId: string;
  leadName: string;
  city: string;
  unit: string;
  type: EscType;
  severity: Severity;
  rule: string;
  reason: string;
  value: number;
  stage: Stage;
  owner: string;
  createdAt: string; // ISO
  lastInteraction: string; // ISO
  recommended: string;
  dueAt: string; // ISO
  status: "Open" | "Resolved" | "Dismissed";
  instructions: string[];
  activity: { at: string; note: string }[];
  resolution?: {
    outcome: string;
    notes: string;
    actionTaken: string;
    responsible: string;
    nextAction: string;
    nextDue: string;
    rootCause: string;
    at: string;
  };
};

export const ESC_EXECUTIVES = ["Rahul Mehta", "Amit Sharma", "Deepak Nair", "Priya Verma", "Sana Khan"];

const UNITS = ["Franchise", "Master Franchise", "Corporate Tie-up"];

const TYPES: EscType[] = [
  "New Lead Not Contacted",
  "Overdue Follow-up",
  "High-Value Lead at Risk",
  "Stalled Opportunity",
  "Payment Delay",
  "Customer Complaint",
  "Executive Support Request",
];

const TYPE_ICON: Record<EscType, React.ComponentType<{ className?: string }>> = {
  "New Lead Not Contacted": PhoneCall,
  "Overdue Follow-up": Timer,
  "High-Value Lead at Risk": ShieldAlert,
  "Stalled Opportunity": Clock,
  "Payment Delay": Wallet,
  "Customer Complaint": MessageSquareWarning,
  "Executive Support Request": UserPlus,
};

export const ESCALATION_RULES: { id: string; label: string; type: EscType; severity: Severity; enabled: boolean }[] = [
  { id: "R1", label: "New lead not contacted within 10 minutes", type: "New Lead Not Contacted", severity: "High", enabled: true },
  { id: "R2", label: "High-score lead not contacted within 5 minutes", type: "New Lead Not Contacted", severity: "Critical", enabled: true },
  { id: "R3", label: "Follow-up overdue by more than 2 hours", type: "Overdue Follow-up", severity: "High", enabled: true },
  { id: "R4", label: "No next action assigned to an active lead", type: "Stalled Opportunity", severity: "Medium", enabled: true },
  { id: "R5", label: "High-value opportunity inactive for 24 hours", type: "High-Value Lead at Risk", severity: "Critical", enabled: true },
  { id: "R6", label: "Lead stalled beyond allowed stage duration", type: "Stalled Opportunity", severity: "Medium", enabled: true },
  { id: "R7", label: "Meeting outcome not recorded within 2 hours", type: "Overdue Follow-up", severity: "Medium", enabled: true },
  { id: "R8", label: "Proposal not followed up within 24 hours", type: "Stalled Opportunity", severity: "High", enabled: true },
  { id: "R9", label: "Payment commitment missed", type: "Payment Delay", severity: "Critical", enabled: true },
  { id: "R10", label: "Lead reassigned 3 or more times", type: "High-Value Lead at Risk", severity: "Medium", enabled: true },
  { id: "R11", label: "Three consecutive unsuccessful call attempts", type: "Overdue Follow-up", severity: "Medium", enabled: true },
  { id: "R12", label: "Customer complaint or negative response", type: "Customer Complaint", severity: "High", enabled: true },
  { id: "R13", label: "Executive manually requesting manager assistance", type: "Executive Support Request", severity: "Low", enabled: true },
];

const RESOLUTION_OUTCOMES = [
  "Lead contacted",
  "Follow-up completed",
  "Meeting scheduled",
  "Proposal updated",
  "Payment issue resolved",
  "Lead reassigned",
  "Customer complaint resolved",
  "Invalid escalation",
  "Lead marked Won",
  "Lead marked Lost",
];

const ROOT_CAUSES = [
  "Executive delay",
  "Lead unresponsive",
  "Pricing objection",
  "Documentation issue",
  "Payment / finance issue",
  "Process gap",
  "System / data error",
  "Competitor pressure",
];

/* ------------------------------- helpers ------------------------------- */

const now = Date.now();
const mins = (m: number) => new Date(now - m * 60_000).toISOString();
const future = (m: number) => new Date(now + m * 60_000).toISOString();

function ageMinutes(iso: string) {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
}
function ageLabel(iso: string) {
  const m = ageMinutes(iso);
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h`;
}
function ageTone(iso: string) {
  const m = ageMinutes(iso);
  if (m < 30) return { chip: "bg-sky-500/15 text-sky-600 border-sky-500/30", band: "border-l-sky-500", label: "< 30 min" };
  if (m < 120) return { chip: "bg-amber-500/15 text-amber-600 border-amber-500/30", band: "border-l-amber-500", label: "30m – 2h" };
  if (m < 1440) return { chip: "bg-red-500/15 text-red-600 border-red-500/30", band: "border-l-red-500", label: "2h – 24h" };
  return { chip: "bg-red-900/20 text-red-800 border-red-900/40", band: "border-l-red-900", label: "> 24h" };
}
const SEV_ORDER: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const sevTone = (s: Severity) =>
  s === "Critical" ? "bg-red-500/15 text-red-600 border-red-500/30"
    : s === "High" ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
      : s === "Medium" ? "bg-sky-500/15 text-sky-600 border-sky-500/30"
        : "bg-muted text-muted-foreground border-border";

const inr = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`);
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/* ------------------------------- sample data ------------------------------- */

const SEED: Escalation[] = [
  {
    id: "ESC-1041", leadId: "LD-2291", leadName: "Imran Qureshi", city: "Lucknow", unit: "Master Franchise",
    type: "Payment Delay", severity: "Critical", rule: "R9 · Payment commitment missed",
    reason: "Engagement letter fee of ₹2.5L committed for 28 Jul is still unpaid; partner now asking to change payment terms.",
    value: 2500000, stage: "Payment Pending", owner: "Rahul Mehta",
    createdAt: mins(3120), lastInteraction: mins(2880),
    recommended: "Sales Head to call partner directly and confirm revised payment date in writing today.",
    dueAt: future(120), status: "Open", instructions: [],
    activity: [{ at: mins(3120), note: "Auto-escalated: payment commitment missed" }, { at: mins(2880), note: "Rahul called — partner requested terms change" }],
  },
  {
    id: "ESC-1042", leadId: "LD-2310", leadName: "Neha Agarwal", city: "Indore", unit: "Franchise",
    type: "High-Value Lead at Risk", severity: "Critical", rule: "R5 · High-value opportunity inactive 24h",
    reason: "₹18L opportunity with no interaction for 31 hours. Competitor has quoted a lower franchise fee.",
    value: 1800000, stage: "Negotiation", owner: "Amit Sharma",
    createdAt: mins(1860), lastInteraction: mins(1860),
    recommended: "Approve a value-add bundle (branding + extra training) instead of a fee discount; joint call today.",
    dueAt: future(45), status: "Open", instructions: [],
    activity: [{ at: mins(1860), note: "Auto-escalated: inactive 24h on high-value deal" }],
  },
  {
    id: "ESC-1043", leadId: "LD-2402", leadName: "Vikram Singh", city: "Surat", unit: "Franchise",
    type: "Stalled Opportunity", severity: "High", rule: "R8 · Proposal not followed up in 24h",
    reason: "Proposal sent 5 days ago, 3 consecutive unanswered calls, no next action on the record.",
    value: 1200000, stage: "Proposal Sent", owner: "Deepak Nair",
    createdAt: mins(430), lastInteraction: mins(4300),
    recommended: "Reassign to Priya Verma for a fresh voice and schedule a decision-maker call within 24 hours.",
    dueAt: future(300), status: "Open", instructions: [],
    activity: [{ at: mins(430), note: "Auto-escalated: proposal follow-up breach" }],
  },
  {
    id: "ESC-1044", leadId: "LD-2455", leadName: "Sandeep Rao", city: "Pune", unit: "Franchise",
    type: "Customer Complaint", severity: "High", rule: "R12 · Negative response logged",
    reason: "Lead complained about repeated calls from two different executives and demanded city exclusivity.",
    value: 900000, stage: "Qualified", owner: "Deepak Nair",
    createdAt: mins(150), lastInteraction: mins(140),
    recommended: "Single point of contact assignment + apology call from Sales Head; clarify territory policy.",
    dueAt: future(90), status: "Open", instructions: [],
    activity: [{ at: mins(150), note: "Auto-escalated: complaint recorded on call disposition" }],
  },
  {
    id: "ESC-1045", leadId: "LD-2501", leadName: "Kavita Joshi", city: "Nagpur", unit: "Franchise",
    type: "New Lead Not Contacted", severity: "Critical", rule: "R2 · High-score lead not contacted in 5 min",
    reason: "Score 92 inbound lead from Google Ads is 22 minutes old with zero call attempts.",
    value: 1500000, stage: "New Lead", owner: "Sana Khan",
    createdAt: mins(22), lastInteraction: mins(22),
    recommended: "Call within the next 10 minutes or reassign to the next available executive.",
    dueAt: future(10), status: "Open", instructions: [],
    activity: [{ at: mins(22), note: "Auto-escalated: speed-to-lead breach" }],
  },
  {
    id: "ESC-1046", leadId: "LD-2508", leadName: "Rohit Bansal", city: "Jaipur", unit: "Franchise",
    type: "New Lead Not Contacted", severity: "High", rule: "R1 · New lead not contacted in 10 min",
    reason: "Website enquiry unattended for 18 minutes during peak calling hours.",
    value: 800000, stage: "New Lead", owner: "Priya Verma",
    createdAt: mins(18), lastInteraction: mins(18),
    recommended: "Assign a call task now; expected first contact within 10 minutes.",
    dueAt: future(10), status: "Open", instructions: [],
    activity: [{ at: mins(18), note: "Auto-escalated: speed-to-lead breach" }],
  },
  {
    id: "ESC-1047", leadId: "LD-2377", leadName: "Farhan Ali", city: "Bhopal", unit: "Franchise",
    type: "Overdue Follow-up", severity: "High", rule: "R3 · Follow-up overdue > 2h",
    reason: "Committed callback at 10:30 AM missed; lead had asked for site-cost breakdown.",
    value: 700000, stage: "Contacted", owner: "Amit Sharma",
    createdAt: mins(200), lastInteraction: mins(1500),
    recommended: "Complete the callback today with the cost sheet attached before 6 PM.",
    dueAt: future(180), status: "Open", instructions: [],
    activity: [{ at: mins(200), note: "Auto-escalated: follow-up overdue" }],
  },
  {
    id: "ESC-1048", leadId: "LD-2340", leadName: "Meera Iyer", city: "Kochi", unit: "Corporate Tie-up",
    type: "Overdue Follow-up", severity: "Medium", rule: "R7 · Meeting outcome not recorded in 2h",
    reason: "Discovery meeting finished 3 hours ago; no outcome, no next action recorded.",
    value: 2200000, stage: "Meeting Scheduled", owner: "Rahul Mehta",
    createdAt: mins(190), lastInteraction: mins(370),
    recommended: "Executive to record the meeting outcome and set the next action within the hour.",
    dueAt: future(60), status: "Open", instructions: [],
    activity: [{ at: mins(190), note: "Auto-escalated: missing meeting outcome" }],
  },
  {
    id: "ESC-1049", leadId: "LD-2288", leadName: "Gurpreet Sethi", city: "Ludhiana", unit: "Franchise",
    type: "Stalled Opportunity", severity: "Medium", rule: "R10 · Lead reassigned 3+ times",
    reason: "Lead has changed owner 3 times in 12 days and is losing continuity.",
    value: 950000, stage: "Qualified", owner: "Sana Khan",
    createdAt: mins(2600), lastInteraction: mins(1200),
    recommended: "Freeze ownership with Sana Khan and add manager instructions on handover context.",
    dueAt: future(600), status: "Open", instructions: [],
    activity: [{ at: mins(2600), note: "Auto-escalated: excessive reassignment" }],
  },
  {
    id: "ESC-1050", leadId: "LD-2467", leadName: "Anil Kulkarni", city: "Nashik", unit: "Franchise",
    type: "Executive Support Request", severity: "Low", rule: "R13 · Manager assistance requested",
    reason: "Priya Verma requested Sales Head to join the negotiation call for ROI objections.",
    value: 1100000, stage: "Negotiation", owner: "Priya Verma",
    createdAt: mins(75), lastInteraction: mins(70),
    recommended: "Block 20 minutes today and join the call with the ROI model.",
    dueAt: future(240), status: "Open", instructions: [],
    activity: [{ at: mins(75), note: "Support requested by Priya Verma" }],
  },
  {
    id: "ESC-1039", leadId: "LD-2201", leadName: "Suresh Pillai", city: "Coimbatore", unit: "Franchise",
    type: "Payment Delay", severity: "High", rule: "R9 · Payment commitment missed",
    reason: "Booking amount delayed by a day due to bank transfer limit.",
    value: 1400000, stage: "Payment Pending", owner: "Rahul Mehta",
    createdAt: mins(600), lastInteraction: mins(200),
    recommended: "Confirm NEFT reference and update finance.",
    dueAt: mins(60), status: "Resolved", instructions: ["Share alternate payment link"],
    activity: [{ at: mins(600), note: "Auto-escalated: payment commitment missed" }],
    resolution: {
      outcome: "Payment issue resolved", notes: "Partner transferred ₹1.4L via RTGS, UTR shared with accounts.",
      actionTaken: "Called partner and finance, shared RTGS details", responsible: "Rahul Mehta",
      nextAction: "Confirm receipt with accounts", nextDue: future(300), rootCause: "Payment / finance issue", at: mins(90),
    },
  },
  {
    id: "ESC-1040", leadId: "LD-2255", leadName: "Divya Menon", city: "Mysuru", unit: "Franchise",
    type: "Overdue Follow-up", severity: "Medium", rule: "R3 · Follow-up overdue > 2h",
    reason: "Callback missed in the morning slot.",
    value: 650000, stage: "Contacted", owner: "Deepak Nair",
    createdAt: mins(500), lastInteraction: mins(150),
    recommended: "Complete callback and set the next follow-up.",
    dueAt: mins(30), status: "Resolved", instructions: [],
    activity: [{ at: mins(500), note: "Auto-escalated: follow-up overdue" }],
    resolution: {
      outcome: "Follow-up completed", notes: "Spoke to lead, rescheduled site discussion for Monday.",
      actionTaken: "Callback completed", responsible: "Deepak Nair",
      nextAction: "Site discussion call", nextDue: future(2800), rootCause: "Executive delay", at: mins(150),
    },
  },
];

const SECTIONS: { key: EscType | "immediate"; label: string; hint: string }[] = [
  { key: "immediate", label: "Immediate Attention", hint: "Critical items and anything already past its due time" },
  { key: "New Lead Not Contacted", label: "New Leads Not Contacted", hint: "Speed-to-lead breaches" },
  { key: "Overdue Follow-up", label: "Overdue Follow-ups", hint: "Missed commitments and unrecorded outcomes" },
  { key: "High-Value Lead at Risk", label: "High-Value Leads at Risk", hint: "Large opportunities losing momentum" },
  { key: "Stalled Opportunity", label: "Stalled Opportunities", hint: "No next action or stage duration exceeded" },
  { key: "Payment Delay", label: "Payment Delays", hint: "Missed fee and booking commitments" },
  { key: "Customer Complaint", label: "Customer Complaints", hint: "Negative responses needing a manager" },
  { key: "Executive Support Request", label: "Executive Support Requests", hint: "Manager assistance asked for" },
];

/* ------------------------------- page ------------------------------- */

export function EscalationsPage() {
  const [rows, setRows] = useState<Escalation[]>(SEED);
  const [rules, setRules] = useState(ESCALATION_RULES);
  const [showFilters, setShowFilters] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [detail, setDetail] = useState<Escalation | null>(null);
  const [resolving, setResolving] = useState<Escalation | null>(null);
  const [dismissing, setDismissing] = useState<Escalation | null>(null);
  const [assigning, setAssigning] = useState<Escalation | null>(null);

  const [f, setF] = useState({
    severity: "all", type: "all", exec: "all", unit: "all", stage: "all",
    value: "all", created: "all", status: "open", q: "",
  });

  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        if (f.status === "open" && r.status !== "Open") return false;
        if (f.status === "resolved" && r.status !== "Resolved") return false;
        if (f.status === "dismissed" && r.status !== "Dismissed") return false;
        if (f.severity !== "all" && r.severity !== f.severity) return false;
        if (f.type !== "all" && r.type !== f.type) return false;
        if (f.exec !== "all" && r.owner !== f.exec) return false;
        if (f.unit !== "all" && r.unit !== f.unit) return false;
        if (f.stage !== "all" && r.stage !== f.stage) return false;
        if (f.value === "lt10" && r.value >= 1000000) return false;
        if (f.value === "10to20" && (r.value < 1000000 || r.value > 2000000)) return false;
        if (f.value === "gt20" && r.value <= 2000000) return false;
        const age = ageMinutes(r.createdAt);
        if (f.created === "today" && age > 1440) return false;
        if (f.created === "week" && age > 10080) return false;
        if (f.created === "older" && age <= 10080) return false;
        if (f.q) {
          const q = f.q.toLowerCase();
          if (![r.leadName, r.leadId, r.id, r.city, r.owner, r.type].some((x) => x.toLowerCase().includes(q)))
            return false;
        }
        return true;
      })
      .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || ageMinutes(b.createdAt) - ageMinutes(a.createdAt));
  }, [rows, f]);

  const open = rows.filter((r) => r.status === "Open");
  const resolvedToday = rows.filter((r) => r.status === "Resolved" && r.resolution && ageMinutes(r.resolution.at) < 1440);
  const avgRes = resolvedToday.length
    ? resolvedToday.reduce((s, r) => s + (new Date(r.resolution!.at).getTime() - new Date(r.createdAt).getTime()) / 3600000, 0) / resolvedToday.length
    : 0;

  const kpis = [
    { label: "Critical Items", value: open.filter((r) => r.severity === "Critical").length, tone: "text-red-600" },
    { label: "High-Priority Items", value: open.filter((r) => r.severity === "High").length, tone: "text-amber-600" },
    { label: "Unresolved Escalations", value: open.length, tone: "" },
    { label: "Resolved Today", value: resolvedToday.length, tone: "text-emerald-600" },
    { label: "Avg Resolution Time", value: `${avgRes.toFixed(1)}h`, tone: "" },
  ];

  function patch(id: string, fn: (e: Escalation) => Escalation) {
    setRows((s) => s.map((r) => (r.id === id ? fn(r) : r)));
  }
  function log(id: string, note: string) {
    patch(id, (e) => ({ ...e, activity: [{ at: new Date().toISOString(), note }, ...e.activity] }));
  }

  const sectionItems = (key: (typeof SECTIONS)[number]["key"]) =>
    key === "immediate"
      ? filtered.filter((r) => r.status === "Open" && (r.severity === "Critical" || new Date(r.dueAt).getTime() < now))
      : filtered.filter((r) => r.type === key);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Priority &amp; Escalations</h1>
          <p className="text-sm text-muted-foreground">
            Risks and exceptions only — most critical and oldest unresolved items first.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowRules(true)}>
            <ShieldAlert className="h-4 w-4 mr-1" /> Escalation rules
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="h-4 w-4 mr-1" /> Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className={cn("text-2xl font-bold tabular-nums mt-1", k.tone)}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ageing legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Ageing:</span>
        {[
          ["< 30 min", "bg-sky-500"],
          ["30m – 2h", "bg-amber-500"],
          ["2h – 24h", "bg-red-500"],
          ["> 24h", "bg-red-900"],
        ].map(([l, c]) => (
          <span key={l} className="inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5">
            <span className={cn("h-2 w-2 rounded-full", c)} /> {l}
          </span>
        ))}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Search lead, ID, city…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
            <Sel label="Severity" value={f.severity} onChange={(v) => setF({ ...f, severity: v })}
              options={[["all", "All severities"], ["Critical", "Critical"], ["High", "High"], ["Medium", "Medium"], ["Low", "Low"]]} />
            <Sel label="Type" value={f.type} onChange={(v) => setF({ ...f, type: v })}
              options={[["all", "All types"], ...TYPES.map((t) => [t, t] as [string, string])]} />
            <Sel label="Executive" value={f.exec} onChange={(v) => setF({ ...f, exec: v })}
              options={[["all", "All executives"], ...ESC_EXECUTIVES.map((e) => [e, e] as [string, string])]} />
            <Sel label="Business unit" value={f.unit} onChange={(v) => setF({ ...f, unit: v })}
              options={[["all", "All units"], ...UNITS.map((u) => [u, u] as [string, string])]} />
            <Sel label="Pipeline stage" value={f.stage} onChange={(v) => setF({ ...f, stage: v })}
              options={[["all", "All stages"], ...["New Lead", "Contacted", "Qualified", "Proposal Sent", "Meeting Scheduled", "Payment Pending", "Negotiation"].map((s) => [s, s] as [string, string])]} />
            <Sel label="Opportunity value" value={f.value} onChange={(v) => setF({ ...f, value: v })}
              options={[["all", "Any value"], ["lt10", "Below ₹10L"], ["10to20", "₹10L – ₹20L"], ["gt20", "Above ₹20L"]]} />
            <Sel label="Created" value={f.created} onChange={(v) => setF({ ...f, created: v })}
              options={[["all", "Any date"], ["today", "Last 24 hours"], ["week", "Last 7 days"], ["older", "Older than 7 days"]]} />
            <Sel label="Resolution status" value={f.status} onChange={(v) => setF({ ...f, status: v })}
              options={[["open", "Unresolved"], ["resolved", "Resolved"], ["dismissed", "Dismissed"], ["all", "All"]]} />
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => setF({ severity: "all", type: "all", exec: "all", unit: "all", stage: "all", value: "all", created: "all", status: "open", q: "" })}>
                <X className="h-4 w-4 mr-1" /> Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {SECTIONS.map((s) => {
        const items = sectionItems(s.key);
        if (!items.length) return null;
        return (
          <div key={s.key} className="space-y-2">
            <div className="flex items-baseline gap-2 pt-1">
              <h2 className="text-base font-semibold">{s.label}</h2>
              <Badge variant="secondary">{items.length}</Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">{s.hint}</span>
            </div>
            <div className="grid gap-3">
              {items.map((e) => (
                <EscalationCard
                  key={`${s.key}-${e.id}`}
                  e={e}
                  onView={() => setDetail(e)}
                  onAssign={() => setAssigning(e)}
                  onResolve={() => setResolving(e)}
                  onDismiss={() => setDismissing(e)}
                  onPriority={(sev) => { patch(e.id, (x) => ({ ...x, severity: sev })); log(e.id, `Priority changed to ${sev}`); toast.success(`Priority set to ${sev}`); }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {!filtered.length && (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
          No escalations match these filters.
        </CardContent></Card>
      )}

      {/* detail drawer */}
      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.leadName} · {detail.leadId}</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("border", sevTone(detail.severity))} variant="outline">{detail.severity}</Badge>
                  <Badge variant="outline">{detail.type}</Badge>
                  <Badge variant="outline">{detail.stage}</Badge>
                  <Badge variant="outline">{inr(detail.value)}</Badge>
                </div>
                <Field k="Escalation ID" v={detail.id} />
                <Field k="Rule triggered" v={detail.rule} />
                <Field k="Reason" v={detail.reason} />
                <Field k="Assigned executive" v={detail.owner} />
                <Field k="Business unit / city" v={`${detail.unit} · ${detail.city}`} />
                <Field k="Time unresolved" v={ageLabel(detail.createdAt)} />
                <Field k="Last interaction" v={fmtTime(detail.lastInteraction)} />
                <Field k="Due" v={fmtTime(detail.dueAt)} />
                <Field k="Recommended action" v={detail.recommended} />
                {detail.instructions.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Manager instructions</div>
                    <ul className="list-disc pl-5 space-y-1">{detail.instructions.map((i, n) => <li key={n}>{i}</li>)}</ul>
                  </div>
                )}
                {detail.resolution && (
                  <>
                    <Separator />
                    <div className="font-medium">Resolution</div>
                    <Field k="Outcome" v={detail.resolution.outcome} />
                    <Field k="Action taken" v={detail.resolution.actionTaken} />
                    <Field k="Responsible" v={detail.resolution.responsible} />
                    <Field k="Next action" v={`${detail.resolution.nextAction} · ${fmtTime(detail.resolution.nextDue)}`} />
                    <Field k="Root cause" v={detail.resolution.rootCause} />
                    <Field k="Notes" v={detail.resolution.notes} />
                  </>
                )}
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Activity &amp; audit trail</div>
                  <ul className="space-y-2">
                    {detail.activity.map((a, n) => (
                      <li key={n} className="flex gap-2">
                        <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <div>{a.note}</div>
                          <div className="text-xs text-muted-foreground">{fmtTime(a.at)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {assigning && (
        <AssignDialog
          e={assigning}
          onClose={() => setAssigning(null)}
          onSubmit={(payload) => {
            patch(assigning.id, (x) => ({
              ...x,
              owner: payload.reassign ? payload.executive : x.owner,
              severity: payload.priority as Severity,
              dueAt: payload.deadline,
              instructions: payload.instructions ? [payload.instructions, ...x.instructions] : x.instructions,
            }));
            log(assigning.id, `${payload.action} assigned to ${payload.executive}${payload.reassign ? " (lead reassigned)" : ""}`);
            toast.success(
              `${payload.action} assigned to ${payload.executive}. It now appears in their ${queueOf(payload.action)}.`,
            );
            setAssigning(null);
          }}
        />
      )}

      {resolving && (
        <ResolveDialog
          e={resolving}
          onClose={() => setResolving(null)}
          onSubmit={(r) => {
            patch(resolving.id, (x) => ({ ...x, status: "Resolved", resolution: { ...r, at: new Date().toISOString() } }));
            log(resolving.id, `Resolved — ${r.outcome} (root cause: ${r.rootCause})`);
            toast.success("Escalation resolved and kept in history for audit.");
            setResolving(null);
          }}
        />
      )}

      {dismissing && (
        <DismissDialog
          e={dismissing}
          onClose={() => setDismissing(null)}
          onSubmit={(reason) => {
            patch(dismissing.id, (x) => ({ ...x, status: "Dismissed" }));
            log(dismissing.id, `Dismissed by Sales Head — ${reason}`);
            toast.success("Escalation dismissed with reason recorded.");
            setDismissing(null);
          }}
        />
      )}

      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Automatic escalation rules</DialogTitle>
            <DialogDescription>Transparent, rule-based triggers. Toggle a rule to stop it creating new escalations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {rules.map((r) => (
              <label key={r.id} className="flex items-start gap-3 border rounded-md p-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={r.enabled}
                  onChange={() => setRules((s) => s.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)))}
                />
                <span className="flex-1">
                  <span className="font-medium">{r.label}</span>
                  <span className="block text-xs text-muted-foreground">{r.type}</span>
                </span>
                <Badge variant="outline" className={cn("border", sevTone(r.severity))}>{r.severity}</Badge>
              </label>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function queueOf(action: string) {
  if (action.includes("Call")) return "Priority Call Queue";
  if (action.includes("Meeting")) return "Meetings";
  if (action.includes("Follow-up")) return "Follow-ups & Reminders";
  return "task list";
}

/* ------------------------------- card ------------------------------- */

function EscalationCard({
  e, onView, onAssign, onResolve, onDismiss, onPriority,
}: {
  e: Escalation;
  onView: () => void;
  onAssign: () => void;
  onResolve: () => void;
  onDismiss: () => void;
  onPriority: (s: Severity) => void;
}) {
  const tone = ageTone(e.createdAt);
  const Icon = TYPE_ICON[e.type];
  const overdue = new Date(e.dueAt).getTime() < now;
  return (
    <Card className={cn("border-l-4", tone.band, e.status !== "Open" && "opacity-70")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("border", sevTone(e.severity))}>{e.severity}</Badge>
              <span className="font-semibold truncate">{e.leadName}</span>
              <span className="text-xs text-muted-foreground">{e.leadId}</span>
              {e.status !== "Open" && <Badge variant="secondary">{e.status}</Badge>}
            </div>
            <div className="flex items-center gap-1.5 text-sm mt-1">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{e.type}</span>
              <span className="text-xs text-muted-foreground">· {e.rule}</span>
            </div>
          </div>
          <span className={cn("text-xs border rounded-full px-2 py-0.5 whitespace-nowrap", tone.chip)}>
            Unresolved {ageLabel(e.createdAt)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{e.reason}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Meta k="Opportunity" v={inr(e.value)} />
          <Meta k="Stage" v={e.stage} />
          <Meta k="Executive" v={e.owner} />
          <Meta k="Last interaction" v={fmtTime(e.lastInteraction)} />
        </div>

        <div className="rounded-md bg-muted/40 border p-2.5 text-sm">
          <span className="font-medium">Recommended: </span>{e.recommended}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-xs inline-flex items-center gap-1", overdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
            <CalendarClock className="h-3.5 w-3.5" /> Due {fmtTime(e.dueAt)}{overdue ? " · overdue" : ""}
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={onView}><Eye className="h-4 w-4 mr-1" /> View Lead</Button>
          {e.status === "Open" && (
            <>
              <Button size="sm" variant="outline" onClick={onAssign}><CheckSquare className="h-4 w-4 mr-1" /> Assign Action</Button>
              <Select value={e.severity} onValueChange={(v) => onPriority(v as Severity)}>
                <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Critical", "High", "Medium", "Low"] as Severity[]).map((s) => (
                    <SelectItem key={s} value={s}>{s} priority</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={onResolve}><CheckCircle2 className="h-4 w-4 mr-1" /> Resolve</Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>Dismiss</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- dialogs ------------------------------- */

function AssignDialog({
  e, onClose, onSubmit,
}: {
  e: Escalation;
  onClose: () => void;
  onSubmit: (p: { action: string; executive: string; instructions: string; deadline: string; priority: string; reassign: boolean }) => void;
}) {
  const [action, setAction] = useState("Priority Call");
  const [executive, setExecutive] = useState(e.owner);
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState(new Date(e.dueAt).toISOString().slice(0, 16));
  const [priority, setPriority] = useState<string>(e.severity);
  const [reassign, setReassign] = useState(false);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign action — {e.leadName}</DialogTitle>
          <DialogDescription>Linked to {e.leadId}. This creates work on the existing lead, never a new one.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Sel label="Action" value={action} onChange={setAction}
            options={[["Priority Call", "Schedule a call"], ["Follow-up", "Schedule a follow-up"], ["Meeting", "Schedule a meeting"], ["Update Proposal", "Update proposal"], ["Collect Payment", "Collect payment"]]} />
          <Sel label="Executive" value={executive} onChange={setExecutive}
            options={ESC_EXECUTIVES.map((x) => [x, x] as [string, string])} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={reassign} onChange={(ev) => setReassign(ev.target.checked)} />
            Also reassign the lead to this executive (updates Team Leads and My Leads)
          </label>
          <Sel label="Priority" value={priority} onChange={setPriority}
            options={["Critical", "High", "Medium", "Low"].map((x) => [x, x] as [string, string])} />
          <div>
            <div className="text-xs text-muted-foreground mb-1">Resolution deadline</div>
            <Input type="datetime-local" value={deadline} onChange={(ev) => setDeadline(ev.target.value)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Manager instructions</div>
            <Textarea rows={3} value={instructions} onChange={(ev) => setInstructions(ev.target.value)} placeholder="What exactly should the executive do?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit({ action, executive, instructions, deadline: new Date(deadline).toISOString(), priority, reassign })}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResolveDialog({
  e, onClose, onSubmit,
}: {
  e: Escalation;
  onClose: () => void;
  onSubmit: (r: Omit<NonNullable<Escalation["resolution"]>, "at">) => void;
}) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [responsible, setResponsible] = useState(e.owner);
  const [nextAction, setNextAction] = useState("");
  const [nextDue, setNextDue] = useState(new Date(now + 86400000).toISOString().slice(0, 16));
  const [rootCause, setRootCause] = useState("");

  const valid = outcome && notes.trim() && actionTaken.trim() && nextAction.trim() && rootCause;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resolve escalation — {e.id}</DialogTitle>
          <DialogDescription>All fields are required. The record stays in history for audit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Sel label="Resolution outcome" value={outcome} onChange={setOutcome} placeholder="Select outcome"
            options={RESOLUTION_OUTCOMES.map((x) => [x, x] as [string, string])} />
          <div>
            <div className="text-xs text-muted-foreground mb-1">Action taken</div>
            <Input value={actionTaken} onChange={(ev) => setActionTaken(ev.target.value)} placeholder="What was done" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Resolution notes</div>
            <Textarea rows={3} value={notes} onChange={(ev) => setNotes(ev.target.value)} />
          </div>
          <Sel label="Responsible person" value={responsible} onChange={setResponsible}
            options={[...ESC_EXECUTIVES, "Sales Head"].map((x) => [x, x] as [string, string])} />
          <div>
            <div className="text-xs text-muted-foreground mb-1">Next action</div>
            <Input value={nextAction} onChange={(ev) => setNextAction(ev.target.value)} placeholder="e.g. Confirm payment with accounts" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Next action due</div>
            <Input type="datetime-local" value={nextDue} onChange={(ev) => setNextDue(ev.target.value)} />
          </div>
          <Sel label="Root-cause category" value={rootCause} onChange={setRootCause} placeholder="Select root cause"
            options={ROOT_CAUSES.map((x) => [x, x] as [string, string])} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() => onSubmit({ outcome, notes, actionTaken, responsible, nextAction, nextDue: new Date(nextDue).toISOString(), rootCause })}
          >
            Resolve escalation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DismissDialog({ e, onClose, onSubmit }: { e: Escalation; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dismiss escalation — {e.id}</DialogTitle>
          <DialogDescription>
            Only Sales Heads and administrators can dismiss. A reason is mandatory and is stored in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <Textarea rows={3} value={reason} onChange={(ev) => setReason(ev.target.value)} placeholder="Reason for dismissal" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())}>Dismiss</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- small bits ------------------------------- */

function Sel({
  label, value, onChange, options, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  placeholder?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder ?? label} /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="border rounded-md p-2 bg-muted/30">
      <div className="text-[11px] text-muted-foreground">{k}</div>
      <div className="font-medium truncate">{v}</div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div>{v}</div>
    </div>
  );
}

export const ESCALATION_ALERT_ICON = AlertTriangle;
