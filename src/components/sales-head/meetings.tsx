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
  CalendarClock, Clock, Video, MapPin, Eye, MessageSquarePlus, AlertTriangle,
  CheckCircle2, UserPlus, Filter, X, ShieldAlert, ListChecks, CalendarDays, Users,
} from "lucide-react";

/* ------------------------------ shared data ------------------------------ */

const EXECUTIVES = [
  { name: "Ravi Sharma", territory: "Rajasthan" },
  { name: "Neha Kulkarni", territory: "Maharashtra" },
  { name: "Amit Bansal", territory: "Delhi NCR" },
  { name: "Deepak Verma", territory: "Madhya Pradesh" },
  { name: "Sneha Iyer", territory: "Karnataka" },
];

const UNITS = ["Franchise", "Master Franchise", "Corporate Tie-up", "B2B Laundry"];

const MEETING_TYPES = [
  "Discovery Call",
  "Franchise Consultation",
  "Online Presentation",
  "Office Meeting",
  "Store Visit",
  "Proposal Discussion",
  "Negotiation",
  "Payment Discussion",
  "Follow-up Meeting",
] as const;

const STAGES = [
  "New Lead", "Contacted", "Qualified", "Meeting Scheduled", "Meeting Completed",
  "Proposal Sent", "Negotiation", "Payment Pending", "Won", "Lost",
] as const;

type MeetingType = (typeof MEETING_TYPES)[number];
type Stage = (typeof STAGES)[number];
type Confirmation = "Confirmed" | "Awaiting Confirmation" | "Rescheduled" | "Cancelled";
type Outcome = "Completed" | "Rescheduled" | "Cancelled" | "No-Show";

type Meeting = {
  id: string;
  leadId: string;
  leadName: string;
  city: string;
  unit: string;
  phone: string;
  type: MeetingType;
  mode: "Online" | "In-person";
  link: string;
  owner: string;
  stage: Stage;
  startAt: string; // ISO
  durationMin: number;
  confirmation: Confirmation;
  objective: string;
  prepNotes: string;
  managerJoining: boolean;
  managerNotes: { at: string; note: string }[];
  instructions: string[];
  rescheduleCount: number;
  history: { at: string; note: string }[];
  qualification: { budget: string; city: string; timeline: string; summary: string };
  interactions: { at: string; note: string }[];
  questions: string[];
  resources: string[];
  outcome?: {
    result: Outcome;
    summary: string;
    interest: "High" | "Medium" | "Low";
    objections: string;
    stage: Stage;
      nextAction: string;
    nextDueAt: string;
    reason?: string;
    recordedAt: string;
  };
  followUpTaskCreated: boolean;
  createdBy: "Executive" | "Sales Head";
};

/* ------------------------------ time helpers ------------------------------ */

const dayStart = (offsetDays = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
};
const at = (offsetDays: number, hour: number, min = 0) => {
  const d = dayStart(offsetDays);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
const sameDay = (iso: string, d: Date) => {
  const a = new Date(iso);
  return a.getFullYear() === d.getFullYear() && a.getMonth() === d.getMonth() && a.getDate() === d.getDate();
};
const minsFromNow = (iso: string, now: number) => Math.round((new Date(iso).getTime() - now) / 60000);

/* ------------------------------ sample data ------------------------------ */

const SEED: Meeting[] = [
  {
    id: "MTG-1041", leadId: "LD-2291", leadName: "Rakesh Sharma", city: "Jaipur", unit: "Franchise",
    phone: "+91 98290 11221", type: "Franchise Consultation", mode: "Online",
    link: "https://meet.cleancraft.internal/rakesh-1041", owner: "Ravi Sharma",
    stage: "Qualified", startAt: at(0, 11, 30), durationMin: 45,
    confirmation: "Confirmed",
    objective: "Walk through unit economics and finalise the Jaipur Vaishali Nagar location.",
    prepNotes: "Carry ROI sheet v3 and the Jaipur cluster performance data.",
    managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(-3, 16), note: "Meeting created by Ravi Sharma" }],
    qualification: { budget: "Confirmed", city: "Jaipur", timeline: "30–45 days", summary: "Owns retail space, self-funded, decision maker." },
    interactions: [
      { at: at(-6, 12), note: "Discovery call — strong interest in franchise model" },
      { at: at(-3, 16), note: "Shared FEA document and brochure" },
    ],
    questions: ["What is the breakeven period?", "Who bears machine AMC?"],
    resources: ["FEA Document", "Unit Economics Sheet", "Jaipur cluster case study"],
    followUpTaskCreated: false, createdBy: "Executive",
  },
  {
    id: "MTG-1042", leadId: "LD-2310", leadName: "Neha Agarwal", city: "Pune", unit: "Master Franchise",
    phone: "+91 98220 44112", type: "Payment Discussion", mode: "Online",
    link: "https://meet.cleancraft.internal/neha-1042", owner: "Neha Kulkarni",
    stage: "Payment Pending", startAt: at(0, 15, 0), durationMin: 30,
    confirmation: "Awaiting Confirmation",
    objective: "Confirm booking amount transfer date and agreement signing window.",
    prepNotes: "", managerJoining: true, managerNotes: [], instructions: ["Sales Head to join — key negotiation"],
    rescheduleCount: 1,
    history: [
      { at: at(-5, 11), note: "Meeting created by Neha Kulkarni" },
      { at: at(-1, 10), note: "Rescheduled from yesterday 3:00 PM — client travel" },
    ],
    qualification: { budget: "Confirmed", city: "Pune", timeline: "Immediate", summary: "Master franchise for Pune West, funding approved." },
    interactions: [
      { at: at(-9, 15), note: "Office meeting — master franchise territory discussed" },
      { at: at(-4, 12), note: "Proposal sent" },
    ],
    questions: ["Can the booking be split in two tranches?"],
    resources: ["Master Franchise Agreement", "Territory map"],
    followUpTaskCreated: false, createdBy: "Executive",
  },
  {
    id: "MTG-1043", leadId: "LD-2288", leadName: "Sandeep Rao", city: "Bengaluru", unit: "B2B Laundry",
    phone: "+91 99001 78554", type: "Store Visit", mode: "In-person",
    link: "Cleancraft Indiranagar Store, Bengaluru", owner: "Sneha Iyer",
    stage: "Negotiation", startAt: at(0, 17, 30), durationMin: 60,
    confirmation: "Confirmed",
    objective: "Live store walkthrough followed by commercial negotiation.",
    prepNotes: "Store manager briefed. Keep peak-hour footfall data ready.",
    managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 2,
    history: [
      { at: at(-8, 10), note: "Meeting created by Sneha Iyer" },
      { at: at(-5, 10), note: "Rescheduled — client unavailable" },
      { at: at(-2, 10), note: "Rescheduled — store audit clash" },
    ],
    qualification: { budget: "Confirmed", city: "Bengaluru", timeline: "60 days", summary: "Runs a dry-clean outlet, wants brand conversion." },
    interactions: [{ at: at(-12, 11), note: "Online presentation completed" }],
    questions: ["Conversion support for existing staff?", "Royalty structure?"],
    resources: ["Conversion playbook", "Royalty sheet"],
    followUpTaskCreated: false, createdBy: "Sales Head",
  },
  {
    id: "MTG-1039", leadId: "LD-2260", leadName: "Vikas Mehta", city: "Delhi", unit: "Corporate Tie-up",
    phone: "+91 98110 33221", type: "Proposal Discussion", mode: "Online",
    link: "https://meet.cleancraft.internal/vikas-1039", owner: "Amit Bansal",
    stage: "Proposal Sent", startAt: at(0, 9, 30), durationMin: 45,
    confirmation: "Confirmed",
    objective: "Discuss proposal clauses and corporate SLA expectations.",
    prepNotes: "SLA annexure printed.",
    managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(-4, 14), note: "Meeting created by Amit Bansal" }],
    qualification: { budget: "Confirmed", city: "Delhi NCR", timeline: "45 days", summary: "Corporate tie-up for 4 hotel properties." },
    interactions: [{ at: at(-4, 14), note: "Proposal shared over email" }],
    questions: ["Penalty clause for delayed pickup?"],
    resources: ["Corporate SLA template"],
    followUpTaskCreated: false, createdBy: "Executive",
  },
  {
    id: "MTG-1036", leadId: "LD-2244", leadName: "Pooja Shah", city: "Indore", unit: "Franchise",
    phone: "+91 90390 55441", type: "Discovery Call", mode: "Online",
    link: "https://meet.cleancraft.internal/pooja-1036", owner: "Deepak Verma",
    stage: "Meeting Completed", startAt: at(0, 8, 30), durationMin: 30,
    confirmation: "Confirmed",
    objective: "Understand investment appetite and preferred location.",
    prepNotes: "First interaction — qualification focus.",
    managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(-2, 9), note: "Meeting created by Deepak Verma" }],
    qualification: { budget: "Confirmed", city: "Indore", timeline: "90 days", summary: "First-time investor, needs financing guidance." },
    interactions: [{ at: at(-2, 9), note: "Inbound enquiry from website" }],
    questions: ["Is bank funding supported?"],
    resources: ["Financing partners list"],
    outcome: {
      result: "Completed", summary: "Good fit. Wants a financing referral before proceeding.",
      interest: "Medium", objections: "Needs 60% bank funding", stage: "Qualified",
      nextAction: "Share financing partner contacts and book consultation",
      nextDueAt: at(1, 11), recordedAt: at(0, 9, 15),
    },
    followUpTaskCreated: true, createdBy: "Executive",
  },
  {
    id: "MTG-1030", leadId: "LD-2201", leadName: "Imran Qureshi", city: "Nagpur", unit: "Franchise",
    phone: "+91 88880 22110", type: "Office Meeting", mode: "In-person",
    link: "Clean Craft HO, Jaipur", owner: "Neha Kulkarni",
    stage: "Qualified", startAt: at(-1, 12, 0), durationMin: 60,
    confirmation: "Confirmed",
    objective: "Agreement walkthrough at head office.",
    prepNotes: "", managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(-6, 12), note: "Meeting created by Neha Kulkarni" }],
    qualification: { budget: "Confirmed", city: "Nagpur", timeline: "45 days", summary: "Partner-funded, awaiting family approval." },
    interactions: [{ at: at(-6, 12), note: "Franchise consultation done" }],
    questions: [], resources: ["Franchise Agreement"],
    outcome: {
      result: "No-Show", summary: "Client did not arrive and did not respond to calls.",
      interest: "Low", objections: "—", stage: "Qualified",
      nextAction: "", nextDueAt: "", reason: "Client unreachable on the meeting day",
      recordedAt: at(-1, 14),
    },
    followUpTaskCreated: false, createdBy: "Executive",
  },
  {
    id: "MTG-1028", leadId: "LD-2190", leadName: "Kavita Nair", city: "Kochi", unit: "B2B Laundry",
    phone: "+91 94470 66332", type: "Online Presentation", mode: "Online",
    link: "https://meet.cleancraft.internal/kavita-1028", owner: "Sneha Iyer",
    stage: "Contacted", startAt: at(-1, 16, 0), durationMin: 40,
    confirmation: "Confirmed",
    objective: "Brand and process presentation for hospital laundry contract.",
    prepNotes: "Hospital compliance deck ready.",
    managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(-7, 10), note: "Meeting created by Sneha Iyer" }],
    qualification: { budget: "Confirmed", city: "Kochi", timeline: "120 days", summary: "Hospital chain vendor evaluation." },
    interactions: [{ at: at(-7, 10), note: "Cold outreach — responded positively" }],
    questions: ["Turnaround guarantee?"], resources: ["Compliance deck"],
    followUpTaskCreated: false, createdBy: "Executive",
  },
  {
    id: "MTG-1050", leadId: "LD-2325", leadName: "Harpreet Singh", city: "Ludhiana", unit: "Franchise",
    phone: "+91 98150 77441", type: "Negotiation", mode: "Online",
    link: "https://meet.cleancraft.internal/harpreet-1050", owner: "Amit Bansal",
    stage: "Negotiation", startAt: at(1, 12, 30), durationMin: 45,
    confirmation: "Awaiting Confirmation",
    objective: "Close the royalty and territory exclusivity discussion.",
    prepNotes: "", managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(0, 10), note: "Meeting created by Amit Bansal" }],
    qualification: { budget: "Confirmed", city: "Ludhiana", timeline: "30 days", summary: "Serious buyer, comparing with a competing brand." },
    interactions: [{ at: at(-1, 17), note: "Proposal discussion — asked for 1% royalty cut" }],
    questions: ["Exclusivity radius?"], resources: ["Royalty sheet", "Competitor comparison"],
    followUpTaskCreated: false, createdBy: "Executive",
  },
  {
    id: "MTG-1051", leadId: "LD-2331", leadName: "Ganesh Pillai", city: "Mysuru", unit: "Franchise",
    phone: "+91 90080 33112", type: "Follow-up Meeting", mode: "Online",
    link: "https://meet.cleancraft.internal/ganesh-1051", owner: "Sneha Iyer",
    stage: "Proposal Sent", startAt: at(2, 11, 0), durationMin: 30,
    confirmation: "Confirmed",
    objective: "Follow up on proposal feedback and lock the site visit.",
    prepNotes: "Send reminder a day before.",
    managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(0, 9), note: "Meeting created by Sales Head" }],
    qualification: { budget: "Confirmed", city: "Mysuru", timeline: "60 days", summary: "Retired banker, low risk appetite." },
    interactions: [{ at: at(-2, 15), note: "Proposal sent" }],
    questions: ["Support during first 90 days?"], resources: ["Launch support SOP"],
    followUpTaskCreated: false, createdBy: "Sales Head",
  },
  {
    id: "MTG-1052", leadId: "LD-2338", leadName: "Farhan Ali", city: "Bhopal", unit: "Franchise",
    phone: "+91 93000 11445", type: "Discovery Call", mode: "Online",
    link: "https://meet.cleancraft.internal/farhan-1052", owner: "Deepak Verma",
    stage: "New Lead", startAt: at(3, 10, 30), durationMin: 30,
    confirmation: "Awaiting Confirmation",
    objective: "Qualify budget, location and timeline.",
    prepNotes: "", managerJoining: false, managerNotes: [], instructions: [], rescheduleCount: 0,
    history: [{ at: at(0, 11), note: "Meeting created by Deepak Verma" }],
    qualification: { budget: "Not shared", city: "Bhopal", timeline: "Unknown", summary: "Fresh enquiry, not yet qualified." },
    interactions: [{ at: at(0, 11), note: "Inbound call" }],
    questions: [], resources: ["Brochure"],
    followUpTaskCreated: false, createdBy: "Executive",
  },
];

/* ------------------------------ attention rules ------------------------------ */

type Flag = { label: string; tone: "red" | "amber" | "blue" };

function flagsFor(m: Meeting, now: number): Flag[] {
  const f: Flag[] = [];
  const mins = minsFromNow(m.startAt, now);
  if (!m.outcome && mins > 0 && mins <= 60) f.push({ label: "Starts within 1 hour", tone: "blue" });
  if (!m.outcome && m.confirmation === "Awaiting Confirmation") f.push({ label: "Awaiting confirmation", tone: "amber" });
  if (!m.outcome && mins < -(m.durationMin + 120)) f.push({ label: "Outcome not recorded (2h+)", tone: "red" });
  if (m.outcome?.result === "No-Show" && !m.followUpTaskCreated) f.push({ label: "No-show without follow-up", tone: "red" });
  if (m.rescheduleCount >= 2) f.push({ label: `Rescheduled ${m.rescheduleCount}×`, tone: "amber" });
  if (!m.outcome && (m.type === "Payment Discussion" || m.type === "Negotiation") && !m.managerJoining)
    f.push({ label: "Needs Sales Head participation", tone: "amber" });
  return f;
}

const flagTone = (t: Flag["tone"]) =>
  t === "red"
    ? "bg-red-500/15 text-red-600 border-red-500/30"
    : t === "amber"
      ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
      : "bg-sky-500/15 text-sky-600 border-sky-500/30";

const confTone = (c: Confirmation, outcome?: Outcome) => {
  if (outcome === "Completed") return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
  if (outcome === "No-Show") return "bg-red-500/15 text-red-600 border-red-500/30";
  if (outcome === "Cancelled") return "bg-muted text-muted-foreground";
  if (c === "Awaiting Confirmation") return "bg-amber-500/15 text-amber-600 border-amber-500/30";
  if (c === "Rescheduled") return "bg-purple-500/15 text-purple-600 border-purple-500/30";
  return "bg-sky-500/15 text-sky-600 border-sky-500/30";
};

/* ------------------------------ page ------------------------------ */

type View = "today" | "week" | "month" | "list";

export function SalesHeadMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(SEED);
  const [view, setView] = useState<View>("today");
  const [showFilters, setShowFilters] = useState(false);

  const [fExec, setFExec] = useState("all");
  const [fType, setFType] = useState("all");
  const [fConf, setFConf] = useState("all");
  const [fOutcome, setFOutcome] = useState("all");
  const [fUnit, setFUnit] = useState("all");
  const [fStage, setFStage] = useState("all");
  const [fMode, setFMode] = useState("all");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");

  const [detail, setDetail] = useState<Meeting | null>(null);
  const [scheduleFor, setScheduleFor] = useState<Meeting | "new" | null>(null);
  const [outcomeFor, setOutcomeFor] = useState<Meeting | null>(null);
  const [noteFor, setNoteFor] = useState<Meeting | null>(null);

  const now = useMemo(() => Date.now(), [meetings]);
  const today = useMemo(() => dayStart(0), []);

  const update = (id: string, fn: (m: Meeting) => Meeting) =>
    setMeetings((all) => all.map((m) => (m.id === id ? fn(m) : m)));

  const filtered = useMemo(() => {
    return meetings
      .filter((m) => (fExec === "all" ? true : m.owner === fExec))
      .filter((m) => (fType === "all" ? true : m.type === fType))
      .filter((m) => (fConf === "all" ? true : m.confirmation === fConf))
      .filter((m) => (fOutcome === "all" ? true : fOutcome === "none" ? !m.outcome : m.outcome?.result === fOutcome))
      .filter((m) => (fUnit === "all" ? true : m.unit === fUnit))
      .filter((m) => (fStage === "all" ? true : m.stage === fStage))
      .filter((m) => (fMode === "all" ? true : m.mode === fMode))
      .filter((m) => (fFrom ? new Date(m.startAt) >= new Date(`${fFrom}T00:00:00`) : true))
      .filter((m) => (fTo ? new Date(m.startAt) <= new Date(`${fTo}T23:59:59`) : true))
      .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  }, [meetings, fExec, fType, fConf, fOutcome, fUnit, fStage, fMode, fFrom, fTo]);

  const todays = filtered.filter((m) => sameDay(m.startAt, today));
  const kpis = {
    today: meetings.filter((m) => sameDay(m.startAt, today)).length,
    awaiting: meetings.filter((m) => m.confirmation === "Awaiting Confirmation" && !m.outcome).length,
    completedToday: meetings.filter((m) => sameDay(m.startAt, today) && m.outcome?.result === "Completed").length,
    noShows: meetings.filter((m) => m.outcome?.result === "No-Show").length,
    noOutcome: meetings.filter((m) => !m.outcome && new Date(m.startAt).getTime() < now).length,
  };

  const clearFilters = () => {
    setFExec("all"); setFType("all"); setFConf("all"); setFOutcome("all");
    setFUnit("all"); setFStage("all"); setFMode("all"); setFFrom(""); setFTo("");
  };

  const attention = filtered.filter((m) => flagsFor(m, now).some((f) => f.tone === "red" || f.tone === "amber"));

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Team Meetings</h2>
          <p className="text-sm text-muted-foreground">
            Every meeting the five sales executives are running — preparation, confirmation, outcomes and next actions.
          </p>
        </div>
        <Button onClick={() => setScheduleFor("new")}>
          <CalendarClock className="w-4 h-4 mr-2" /> Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Meetings Today" value={String(kpis.today)} icon={CalendarDays} />
        <Stat label="Awaiting Confirmation" value={String(kpis.awaiting)} tone="amber" icon={Clock} />
        <Stat label="Completed Today" value={String(kpis.completedToday)} tone="green" icon={CheckCircle2} />
        <Stat label="No-Shows" value={String(kpis.noShows)} tone="red" icon={ShieldAlert} />
        <Stat label="Without Outcomes" value={String(kpis.noOutcome)} tone="red" icon={AlertTriangle} />
      </div>

      {/* views + filters */}
      <div className="flex flex-wrap items-center gap-2">
        {([["today", "Today's Agenda"], ["week", "Weekly Calendar"], ["month", "Monthly Calendar"], ["list", "List View"]] as [View, string][]).map(
          ([k, label]) => (
            <Button key={k} size="sm" variant={view === k ? "default" : "outline"} onClick={() => setView(k)}>
              {label}
            </Button>
          ),
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Sel label="Sales executive" value={fExec} onChange={setFExec}
              options={[["all", "All executives"], ...EXECUTIVES.map((e) => [e.name, e.name] as [string, string])]} />
            <Sel label="Meeting type" value={fType} onChange={setFType}
              options={[["all", "All types"], ...MEETING_TYPES.map((t) => [t, t] as [string, string])]} />
            <Sel label="Confirmation" value={fConf} onChange={setFConf}
              options={[["all", "All"], ["Confirmed", "Confirmed"], ["Awaiting Confirmation", "Awaiting Confirmation"], ["Rescheduled", "Rescheduled"], ["Cancelled", "Cancelled"]]} />
            <Sel label="Outcome" value={fOutcome} onChange={setFOutcome}
              options={[["all", "All"], ["none", "Not recorded"], ["Completed", "Completed"], ["Rescheduled", "Rescheduled"], ["Cancelled", "Cancelled"], ["No-Show", "No-Show"]]} />
            <Sel label="Business unit" value={fUnit} onChange={setFUnit}
              options={[["all", "All units"], ...UNITS.map((u) => [u, u] as [string, string])]} />
            <Sel label="Pipeline stage" value={fStage} onChange={setFStage}
              options={[["all", "All stages"], ...STAGES.map((s) => [s, s] as [string, string])]} />
            <Sel label="Mode" value={fMode} onChange={setFMode}
              options={[["all", "Online + In-person"], ["Online", "Online"], ["In-person", "In-person"]]} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">From</div>
                <Input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">To</div>
                <Input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* attention strip */}
      {attention.length > 0 && (
        <Card className="border-amber-500/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-sm">Needs Sales Head attention ({attention.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {attention.map((m) => (
                <button key={m.id} onClick={() => setDetail(m)}
                  className="text-xs border rounded-md px-2 py-1 hover:bg-muted transition-colors">
                  {m.leadName} · {fmtTime(m.startAt)} · {flagsFor(m, now)[0]?.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* views */}
      {view === "today" && (
        <div className="space-y-3">
          {todays.length === 0 && <Empty text="No meetings match the filters for today." />}
          {todays.map((m) => (
            <MeetingCard key={m.id} m={m} now={now} onDetail={setDetail} onOutcome={setOutcomeFor}
              onNote={setNoteFor} onReschedule={setScheduleFor} />
          ))}
        </div>
      )}

      {view === "week" && <CalendarGrid days={7} meetings={filtered} onPick={setDetail} />}
      {view === "month" && <CalendarGrid days={30} meetings={filtered} onPick={setDetail} />}

      {view === "list" && (
        <div className="space-y-3">
          {filtered.length === 0 && <Empty text="No meetings match the current filters." />}
          {filtered.map((m) => (
            <MeetingCard key={m.id} m={m} now={now} onDetail={setDetail} onOutcome={setOutcomeFor}
              onNote={setNoteFor} onReschedule={setScheduleFor} />
          ))}
        </div>
      )}

      {/* dialogs */}
      {detail && (
        <DetailSheet
          m={meetings.find((x) => x.id === detail.id)!}
          now={now}
          onClose={() => setDetail(null)}
          onUpdate={update}
          onOutcome={(m) => { setDetail(null); setOutcomeFor(m); }}
          onReschedule={(m) => { setDetail(null); setScheduleFor(m); }}
        />
      )}

      {scheduleFor && (
        <ScheduleDialog
          existing={scheduleFor === "new" ? null : meetings.find((x) => x.id === (scheduleFor as Meeting).id)!}
          onClose={() => setScheduleFor(null)}
          onSave={(payload, existing) => {
            if (existing) {
              update(existing.id, (m) => ({
                ...m,
                ...payload,
                confirmation: "Rescheduled",
                rescheduleCount: m.rescheduleCount + 1,
                history: [...m.history, { at: new Date().toISOString(), note: `Rescheduled by Sales Head to ${fmtDay(payload.startAt)} ${fmtTime(payload.startAt)} — original kept in history` }],
              }));
              toast.success("Meeting rescheduled — original history preserved");
            } else {
              const created: Meeting = {
                id: `MTG-${Math.floor(Math.random() * 9000 + 1000)}`,
                leadId: payload.leadId || `LD-${Math.floor(Math.random() * 9000 + 1000)}`,
                leadName: payload.leadName, city: payload.city || "—", unit: payload.unit,
                phone: "—", type: payload.type, mode: payload.mode, link: payload.link,
                owner: payload.owner, stage: "Meeting Scheduled",
                startAt: payload.startAt, durationMin: payload.durationMin,
                confirmation: "Awaiting Confirmation", objective: payload.objective,
                prepNotes: payload.prepNotes, managerJoining: payload.managerJoining,
                managerNotes: [], instructions: payload.prepNotes ? [payload.prepNotes] : [],
                rescheduleCount: 0,
                history: [{ at: new Date().toISOString(), note: "Meeting created by Sales Head — added to executive's Meetings page" }],
                qualification: { budget: "—", city: payload.city || "—", timeline: "—", summary: "Linked to master lead record." },
                interactions: [], questions: [], resources: [],
                followUpTaskCreated: false, createdBy: "Sales Head",
              };
              setMeetings((all) => [...all, created]);
              toast.success(`Meeting scheduled for ${payload.owner} — Team Leads and Pipeline updated`);
            }
            setScheduleFor(null);
          }}
        />
      )}

      {outcomeFor && (
        <OutcomeDialog
          m={outcomeFor}
          onClose={() => setOutcomeFor(null)}
          onSave={(o) => {
            update(outcomeFor.id, (m) => ({
              ...m,
              stage: o.stage,
              outcome: { ...o, recordedAt: new Date().toISOString() },
              followUpTaskCreated: !!o.nextAction,
              history: [...m.history, { at: new Date().toISOString(), note: `Outcome recorded by Sales Head: ${o.result}` }],
            }));
            toast.success(
              o.nextAction
                ? "Outcome saved — next action sent to Team Tasks and the executive's Follow-ups"
                : "Outcome saved — pipeline and dashboard updated",
            );
            setOutcomeFor(null);
          }}
        />
      )}

      {noteFor && (
        <NoteDialog
          m={noteFor}
          onClose={() => setNoteFor(null)}
          onSave={(note, asInstruction) => {
            update(noteFor.id, (m) => ({
              ...m,
              managerNotes: [...m.managerNotes, { at: new Date().toISOString(), note }],
              instructions: asInstruction ? [...m.instructions, note] : m.instructions,
            }));
            toast.success(asInstruction ? "Preparation instruction sent to the executive" : "Manager note added");
            setNoteFor(null);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------ meeting card ------------------------------ */

function MeetingCard({
  m, now, onDetail, onOutcome, onNote, onReschedule,
}: {
  m: Meeting; now: number;
  onDetail: (m: Meeting) => void;
  onOutcome: (m: Meeting) => void;
  onNote: (m: Meeting) => void;
  onReschedule: (m: Meeting) => void;
}) {
  const flags = flagsFor(m, now);
  const soon = !m.outcome && minsFromNow(m.startAt, now) > 0 && minsFromNow(m.startAt, now) <= 60;

  return (
    <Card className={cn(soon && "border-sky-500/50", flags.some((f) => f.tone === "red") && "border-red-500/50")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{m.leadName}</span>
              <span className="text-xs text-muted-foreground">{m.leadId}</span>
              <Badge variant="outline">{m.type}</Badge>
              <Badge variant="outline" className={confTone(m.confirmation, m.outcome?.result)}>
                {m.outcome ? m.outcome.result : m.confirmation}
              </Badge>
              {m.managerJoining && <Badge variant="outline" className="bg-purple-500/15 text-purple-600 border-purple-500/30">Sales Head joining</Badge>}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{fmtDay(m.startAt)} · {fmtTime(m.startAt)} · {m.durationMin}m</span>
              <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{m.owner}</span>
              <span>{m.stage}</span>
              <span className="inline-flex items-center gap-1">
                {m.mode === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{m.link}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success(m.mode === "Online" ? "Opening meeting room…" : "Visit details opened")}>
              {m.mode === "Online" ? "Join" : "View"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDetail(m)}>
              <Eye className="w-4 h-4 mr-1" /> View Lead
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNote(m)}>
              <MessageSquarePlus className="w-4 h-4 mr-1" /> Manager Note
            </Button>
            {!m.outcome ? (
              <Button size="sm" onClick={() => onOutcome(m)}>Record outcome</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onReschedule(m)}>Reschedule</Button>
            )}
          </div>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Objective: </span>{m.objective}
        </div>

        {flags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {flags.map((f) => (
              <Badge key={f.label} variant="outline" className={flagTone(f.tone)}>{f.label}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ calendar ------------------------------ */

function CalendarGrid({ days, meetings, onPick }: { days: number; meetings: Meeting[]; onPick: (m: Meeting) => void }) {
  const cells = Array.from({ length: days }, (_, i) => dayStart(i));
  return (
    <div className={cn("grid gap-3", days === 7 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3 lg:grid-cols-5")}>
      {cells.map((d) => {
        const dayMeetings = meetings.filter((m) => sameDay(m.startAt, d));
        return (
          <Card key={d.toISOString()} className={cn(dayMeetings.length === 0 && "opacity-70")}>
            <CardContent className="p-3">
              <div className="text-xs font-semibold mb-2">
                {d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}
              </div>
              {dayMeetings.length === 0 && <div className="text-xs text-muted-foreground">—</div>}
              <div className="space-y-1.5">
                {dayMeetings.map((m) => (
                  <button key={m.id} onClick={() => onPick(m)}
                    className="w-full text-left text-xs border rounded-md px-2 py-1.5 hover:bg-muted transition-colors">
                    <div className="font-medium truncate">{fmtTime(m.startAt)} · {m.leadName}</div>
                    <div className="text-muted-foreground truncate">{m.type} · {m.owner}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------ detail sheet ------------------------------ */

function DetailSheet({
  m, now, onClose, onUpdate, onOutcome, onReschedule,
}: {
  m: Meeting; now: number; onClose: () => void;
  onUpdate: (id: string, fn: (m: Meeting) => Meeting) => void;
  onOutcome: (m: Meeting) => void;
  onReschedule: (m: Meeting) => void;
}) {
  const [owner, setOwner] = useState(m.owner);
  const [prep, setPrep] = useState(m.prepNotes);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{m.leadName} · {m.leadId}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{m.type}</Badge>
            <Badge variant="outline" className={confTone(m.confirmation, m.outcome?.result)}>
              {m.outcome ? m.outcome.result : m.confirmation}
            </Badge>
            <Badge variant="outline">{m.stage}</Badge>
            <Badge variant="outline">{m.mode}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Info label="Date & time" value={`${fmtDay(m.startAt)}, ${fmtTime(m.startAt)}`} />
            <Info label="Duration" value={`${m.durationMin} minutes`} />
            <Info label="Executive" value={m.owner} />
            <Info label="Business unit" value={m.unit} />
            <Info label="Location / link" value={m.link} />
            <Info label="Created by" value={m.createdBy} />
          </div>

          <Separator />
          <Block title="Meeting preparation">
            <Info label="Qualification" value={m.qualification.summary} />
            <Info label="Investment readiness" value={m.qualification.budget} />
            <Info label="Preferred city" value={m.qualification.city} />
            <Info label="Purchase timeline" value={m.qualification.timeline} />
            <Info label="Objective" value={m.objective} />
            <Info label="Executive's prep notes" value={m.prepNotes || "Not added yet"} />
            <Info label="Questions & objections" value={m.questions.length ? m.questions.join(" · ") : "None recorded"} />
            <Info label="Resources" value={m.resources.length ? m.resources.join(", ") : "None attached"} />
          </Block>

          <Block title="Previous interactions">
            {m.interactions.length === 0 && <div className="text-xs text-muted-foreground">No prior interactions logged.</div>}
            {m.interactions.map((i) => (
              <div key={i.at + i.note} className="text-xs text-muted-foreground">
                {fmtDate(i.at)} · {i.note}
              </div>
            ))}
          </Block>

          <Block title="Meeting history">
            {m.history.map((h) => (
              <div key={h.at + h.note} className="text-xs text-muted-foreground">{fmtDate(h.at)} · {h.note}</div>
            ))}
          </Block>

          {m.outcome && (
            <Block title="Outcome">
              <Info label="Result" value={m.outcome.result} />
              <Info label="Summary" value={m.outcome.summary} />
              <Info label="Interest" value={m.outcome.interest} />
              <Info label="Objections" value={m.outcome.objections || "—"} />
              <Info label="Next action" value={m.outcome.nextAction || "Not set"} />
              {m.outcome.nextDueAt && <Info label="Next action due" value={`${fmtDay(m.outcome.nextDueAt)} ${fmtTime(m.outcome.nextDueAt)}`} />}
              {m.outcome.reason && <Info label="Reason" value={m.outcome.reason} />}
            </Block>
          )}

          {m.managerNotes.length > 0 && (
            <Block title="Manager notes">
              {m.managerNotes.map((n) => (
                <div key={n.at + n.note} className="text-xs text-muted-foreground">{fmtDate(n.at)} · {n.note}</div>
              ))}
            </Block>
          )}

          {flagsFor(m, now).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {flagsFor(m, now).map((f) => <Badge key={f.label} variant="outline" className={flagTone(f.tone)}>{f.label}</Badge>)}
            </div>
          )}

          <Separator />
          <Block title="Sales Head actions">
            <div className="grid gap-2">
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <Sel label="Assign / change executive" value={owner} onChange={setOwner}
                  options={EXECUTIVES.map((e) => [e.name, `${e.name} · ${e.territory}`] as [string, string])} />
                <Button size="sm" variant="outline" onClick={() => {
                  if (owner === m.owner) { toast.error("Pick a different executive"); return; }
                  onUpdate(m.id, (x) => ({
                    ...x, owner,
                    history: [...x.history, { at: new Date().toISOString(), note: `Reassigned from ${x.owner} to ${owner} by Sales Head` }],
                  }));
                  toast.success(`Meeting reassigned to ${owner} — synced to their Meetings page`);
                }}>
                  <UserPlus className="w-4 h-4 mr-1" /> Assign
                </Button>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Preparation instructions</div>
                <Textarea rows={2} value={prep} onChange={(e) => setPrep(e.target.value)} placeholder="What must the executive prepare before this meeting?" />
                <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                  onUpdate(m.id, (x) => ({ ...x, prepNotes: prep, instructions: [...x.instructions, prep] }));
                  toast.success("Preparation instructions shared with the executive");
                }}>Send instructions</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  onUpdate(m.id, (x) => ({ ...x, managerJoining: !x.managerJoining }));
                  toast.success(m.managerJoining ? "Removed manager participation" : "Marked for Sales Head participation");
                }}>
                  {m.managerJoining ? "Remove my participation" : "Mark for my participation"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReschedule(m)}>Reschedule</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  onUpdate(m.id, (x) => ({ ...x, followUpTaskCreated: true }));
                  toast.success("Follow-up task created in Team Tasks");
                }}>
                  <ListChecks className="w-4 h-4 mr-1" /> Create follow-up task
                </Button>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                  onUpdate(m.id, (x) => ({
                    ...x,
                    history: [...x.history, { at: new Date().toISOString(), note: "Escalated by Sales Head to Priority & Escalations" }],
                  }));
                  toast.success("Escalated — visible in Priority & Escalations");
                }}>
                  <AlertTriangle className="w-4 h-4 mr-1" /> Escalate
                </Button>
                {!m.outcome && <Button size="sm" onClick={() => onOutcome(m)}>Record outcome</Button>}
              </div>
            </div>
          </Block>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------ schedule dialog ------------------------------ */

type SchedulePayload = {
  leadId: string; leadName: string; city: string; unit: string; type: MeetingType;
  mode: "Online" | "In-person"; link: string; owner: string;
  startAt: string; durationMin: number; objective: string; prepNotes: string; managerJoining: boolean;
};

function ScheduleDialog({
  existing, onClose, onSave,
}: {
  existing: Meeting | null;
  onClose: () => void;
  onSave: (p: SchedulePayload, existing: Meeting | null) => void;
}) {
  const base = existing ? new Date(existing.startAt) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const [leadName, setLeadName] = useState(existing?.leadName ?? "");
  const [leadId, setLeadId] = useState(existing?.leadId ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [unit, setUnit] = useState(existing?.unit ?? UNITS[0]);
  const [type, setType] = useState<MeetingType>(existing?.type ?? "Discovery Call");
  const [mode, setMode] = useState<"Online" | "In-person">(existing?.mode ?? "Online");
  const [link, setLink] = useState(existing?.link ?? "");
  const [owner, setOwner] = useState(existing?.owner ?? EXECUTIVES[0].name);
  const [date, setDate] = useState(`${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`);
  const [time, setTime] = useState(`${pad(base.getHours())}:${pad(base.getMinutes())}`);
  const [duration, setDuration] = useState(String(existing?.durationMin ?? 30));
  const [objective, setObjective] = useState(existing?.objective ?? "");
  const [prepNotes, setPrepNotes] = useState(existing?.prepNotes ?? "");
  const [managerJoining, setManagerJoining] = useState(existing?.managerJoining ?? false);
  const [reason, setReason] = useState("");

  const submit = () => {
    if (!existing && !leadName.trim()) { toast.error("Link the meeting to a lead name"); return; }
    if (!objective.trim()) { toast.error("Add a meeting objective"); return; }
    if (!date || !time) { toast.error("Pick a date and time"); return; }
    if (existing && !reason.trim()) { toast.error("Reason for rescheduling is required"); return; }
    onSave({
      leadId, leadName, city, unit, type, mode, link: link || (mode === "Online" ? "Online meeting room" : "To be confirmed"),
      owner, startAt: new Date(`${date}T${time}:00`).toISOString(),
      durationMin: Number(duration) || 30, objective: existing ? `${objective}` : objective,
      prepNotes: existing ? prepNotes : prepNotes, managerJoining,
    }, existing);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Reschedule meeting" : "Schedule meeting"}</DialogTitle>
          <DialogDescription>
            {existing
              ? "The original schedule is preserved in the meeting history."
              : "The meeting is linked to one master lead and appears in the assigned executive's Meetings page."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Lead name"><Input value={leadName} onChange={(e) => setLeadName(e.target.value)} disabled={!!existing} /></Field>
          <Field label="Lead ID (existing record)"><Input value={leadId} onChange={(e) => setLeadId(e.target.value)} placeholder="LD-0000" disabled={!!existing} /></Field>
          <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} /></Field>
          <Sel label="Business unit" value={unit} onChange={setUnit} options={UNITS.map((u) => [u, u] as [string, string])} />
          <Sel label="Meeting type" value={type} onChange={(v) => setType(v as MeetingType)} options={MEETING_TYPES.map((t) => [t, t] as [string, string])} />
          <Sel label="Assigned executive" value={owner} onChange={setOwner} options={EXECUTIVES.map((e) => [e.name, `${e.name} · ${e.territory}`] as [string, string])} />
          <Sel label="Mode" value={mode} onChange={(v) => setMode(v as "Online" | "In-person")} options={[["Online", "Online"], ["In-person", "In-person"]]} />
          <Field label={mode === "Online" ? "Meeting link" : "Location"}><Input value={link} onChange={(e) => setLink(e.target.value)} /></Field>
          <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Time"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          <Field label="Duration (minutes)"><Input value={duration} onChange={(e) => setDuration(e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Meeting objective"><Textarea rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Preparation instructions for the executive">
              <Textarea rows={2} value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} />
            </Field>
          </div>
          {existing && (
            <div className="sm:col-span-2">
              <Field label="Reason for rescheduling (required)">
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Client travel, internal clash…" />
              </Field>
            </div>
          )}
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={managerJoining} onChange={(e) => setManagerJoining(e.target.checked)} />
            Mark this meeting for Sales Head participation
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{existing ? "Reschedule" : "Schedule meeting"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ outcome dialog ------------------------------ */

function OutcomeDialog({
  m, onClose, onSave,
}: {
  m: Meeting;
  onClose: () => void;
  onSave: (o: Omit<NonNullable<Meeting["outcome"]>, "recordedAt">) => void;
}) {
  const [result, setResult] = useState<Outcome>("Completed");
  const [summary, setSummary] = useState("");
  const [interest, setInterest] = useState<"High" | "Medium" | "Low">("High");
  const [objections, setObjections] = useState("");
  const [stage, setStage] = useState<Stage>(m.stage);
  const [nextAction, setNextAction] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [reason, setReason] = useState("");

  const submit = () => {
    if (!summary.trim()) { toast.error("Meeting summary is required"); return; }
    if ((result === "Cancelled" || result === "No-Show") && !reason.trim()) {
      toast.error(`Reason is required for ${result}`); return;
    }
    if (!nextAction.trim()) { toast.error("Next action is required"); return; }
    if (!nextDate || !nextTime) { toast.error("Next action due date and time are required"); return; }
    onSave({
      result, summary, interest, objections, stage,
      nextAction, nextDueAt: new Date(`${nextDate}T${nextTime}:00`).toISOString(),
      reason: reason || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record outcome · {m.leadName}</DialogTitle>
          <DialogDescription>
            Outcomes update the pipeline, dashboard and performance. The next action reaches the executive's Follow-ups.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Sel label="Result" value={result} onChange={(v) => setResult(v as Outcome)}
            options={[["Completed", "Completed"], ["Rescheduled", "Rescheduled"], ["Cancelled", "Cancelled"], ["No-Show", "No-Show"]]} />
          <Sel label="Customer interest level" value={interest} onChange={(v) => setInterest(v as "High" | "Medium" | "Low")}
            options={[["High", "High"], ["Medium", "Medium"], ["Low", "Low"]]} />
          <div className="sm:col-span-2">
            <Field label="Meeting summary"><Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Objections raised"><Input value={objections} onChange={(e) => setObjections(e.target.value)} /></Field>
          </div>
          <Sel label="Updated pipeline stage" value={stage} onChange={(v) => setStage(v as Stage)}
            options={STAGES.map((s) => [s, s] as [string, string])} />
          <div className="sm:col-span-2">
            <Field label="Next action"><Input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Send revised proposal…" /></Field>
          </div>
          <Field label="Next action due date"><Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} /></Field>
          <Field label="Next action due time"><Input type="time" value={nextTime} onChange={(e) => setNextTime(e.target.value)} /></Field>
          {(result === "Cancelled" || result === "No-Show") && (
            <div className="sm:col-span-2">
              <Field label={`Reason for ${result} (required)`}>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} />
              </Field>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save outcome</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ note dialog ------------------------------ */

function NoteDialog({
  m, onClose, onSave,
}: { m: Meeting; onClose: () => void; onSave: (note: string, asInstruction: boolean) => void }) {
  const [note, setNote] = useState("");
  const [asInstruction, setAsInstruction] = useState(true);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manager note · {m.leadName}</DialogTitle>
          <DialogDescription>Visible to {m.owner} on the same meeting record.</DialogDescription>
        </DialogHeader>
        <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Guidance for this meeting…" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={asInstruction} onChange={(e) => setAsInstruction(e.target.checked)} />
          Also send as a preparation instruction
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!note.trim()) { toast.error("Add a note"); return; } onSave(note, asInstruction); }}>Save note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ small helpers ------------------------------ */

function Stat({
  label, value, tone, icon: Icon,
}: { label: string; value: string; tone?: "amber" | "red" | "green"; icon: React.ComponentType<{ className?: string }> }) {
  const t = tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : tone === "green" ? "text-emerald-600" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="w-3.5 h-3.5" /> {label}
        </div>
        <div className={cn("text-2xl font-semibold tabular-nums mt-1", t)}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Sel({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
