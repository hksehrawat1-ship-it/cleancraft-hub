import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Video, MapPin, Clock, CheckCircle2, XCircle, RotateCcw, Plus, Eye, Phone,
  CalendarDays, CalendarRange, ListChecks, AlertTriangle, Users, Target, BookOpen,
} from "lucide-react";

/* ------------------------------- model ------------------------------- */

const MEETING_TYPES = [
  "Discovery Call", "Franchise Consultation", "Online Presentation", "Office Meeting",
  "Store Visit", "Proposal Discussion", "Negotiation", "Payment Discussion", "Follow-up Meeting",
] as const;
type MeetingType = (typeof MEETING_TYPES)[number];

const STAGES = [
  "New Lead", "Contacted", "Qualified", "Meeting Scheduled", "Meeting Completed",
  "Proposal Sent", "Negotiation", "Payment Pending", "Won", "Lost",
] as const;

const OWNERS = ["Rahul Mehta", "Priya Sharma", "Amit Verma", "Sneha Kulkarni"] as const;
const DURATIONS = [15, 30, 45, 60, 90] as const;
const REMINDERS = ["15 min before", "30 min before", "1 hour before", "1 day before"] as const;
const INTEREST = ["Very High", "High", "Medium", "Low"] as const;

type Confirmation = "Awaiting Confirmation" | "Confirmed";
type MeetingStatus = "Scheduled" | "Completed" | "Rescheduled" | "Cancelled" | "No-Show";

type Meeting = {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  city: string;
  stage: string;
  type: MeetingType;
  mode: "Online" | "In-person";
  startAt: string; // ISO
  durationMin: number;
  linkOrLocation: string;
  owner: string;
  participants: string;
  objective: string;
  agenda: string;
  reminder: string;
  confirmation: Confirmation;
  notes: string;
  status: MeetingStatus;
  // prep
  preferredCity: string;
  timeline: string;
  lastInteraction: string;
  objections: string;
  expectedOutcome: string;
  resources: string[];
  // outcome
  outcome?: {
    summary: string;
    interest: string;
    objections: string;
    stage: string;
    nextAction: string;
    nextDueAt: string;
    reason?: string;
  };
  history: { at: string; text: string }[];
};

/* ------------------------------ sample data ------------------------------ */

function iso(dayOffset: number, hour: number, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}
const soon = () => new Date(Date.now() + 40 * 60 * 1000).toISOString();

const SEED: Meeting[] = [
  {
    id: "m1", leadId: "CC-1042", leadName: "Ankit Bansal", phone: "9812345670", city: "Jaipur",
    stage: "Qualified", type: "Franchise Consultation", mode: "Online", startAt: soon(),
    durationMin: 45, linkOrLocation: "https://meet.cleancraft.in/ankit-1042", owner: "Rahul Mehta",
    participants: "Ankit Bansal, Spouse", objective: "Explain franchise model and unit economics",
    agenda: "Brand intro • Investment breakup • ROI • Support model • Next steps",
    reminder: "30 min before", confirmation: "Confirmed", notes: "Prefers Hindi conversation.",
    status: "Scheduled", preferredCity: "Jaipur", timeline: "30–45 days",
    lastInteraction: "Call on 2 days ago — asked for ROI sheet",
    objections: "Worried about manpower availability",
    expectedOutcome: "Agreement to receive proposal",
    resources: ["Franchise Brochure", "ROI Calculator", "Store Walkthrough Video"],
    history: [{ at: iso(-3, 11), text: "Meeting scheduled" }],
  },
  {
    id: "m2", leadId: "CC-1051", leadName: "Meera Nair", phone: "9898001122", city: "Kochi",
    stage: "Meeting Scheduled", type: "Discovery Call", mode: "Online", startAt: iso(0, 17),
    durationMin: 30, linkOrLocation: "https://meet.cleancraft.in/meera-1051", owner: "Priya Sharma",
    participants: "Meera Nair", objective: "Understand budget and timeline",
    agenda: "Background • Budget • Location preference • Timeline",
    reminder: "15 min before", confirmation: "Awaiting Confirmation", notes: "",
    status: "Scheduled", preferredCity: "Kochi", timeline: "60 days",
    lastInteraction: "WhatsApp yesterday — shared brochure",
    objections: "None yet", expectedOutcome: "Qualify the lead",
    resources: ["Franchise Brochure", "FAQ Sheet"],
    history: [{ at: iso(-1, 10), text: "Meeting scheduled" }],
  },
  {
    id: "m3", leadId: "CC-1033", leadName: "Suresh Patil", phone: "9765432100", city: "Pune",
    stage: "Proposal Sent", type: "Proposal Discussion", mode: "In-person",
    startAt: iso(1, 12, 30), durationMin: 60, linkOrLocation: "Clean Craft HO, Pune — Conf Room 2",
    owner: "Amit Verma", participants: "Suresh Patil, Business partner",
    objective: "Walk through proposal and close commercial terms",
    agenda: "Proposal walkthrough • Fee structure • Territory • Timeline",
    reminder: "1 day before", confirmation: "Confirmed", notes: "Bring printed proposal.",
    status: "Scheduled", preferredCity: "Pune", timeline: "30 days",
    lastInteraction: "Proposal emailed 3 days ago",
    objections: "Fee seems high vs competitor",
    expectedOutcome: "Move to Negotiation",
    resources: ["Proposal PDF", "Competitor Comparison", "Case Study — Pune 1"],
    history: [{ at: iso(-4, 15), text: "Meeting scheduled" }],
  },
  {
    id: "m4", leadId: "CC-1060", leadName: "Farhan Qureshi", phone: "9900112233", city: "Indore",
    stage: "Negotiation", type: "Payment Discussion", mode: "Online", startAt: iso(2, 11),
    durationMin: 30, linkOrLocation: "https://meet.cleancraft.in/farhan-1060", owner: "Rahul Mehta",
    participants: "Farhan Qureshi", objective: "Confirm booking amount and payment date",
    agenda: "Booking amount • Payment mode • Agreement signing date",
    reminder: "1 hour before", confirmation: "Awaiting Confirmation", notes: "",
    status: "Scheduled", preferredCity: "Indore", timeline: "15 days",
    lastInteraction: "Negotiation meeting last week", objections: "Wants EMI on booking fee", expectedOutcome: "Move to Payment Pending",
    resources: ["Payment Terms Sheet", "Engagement Letter Draft"],
    history: [{ at: iso(-2, 16), text: "Meeting scheduled" }],
  },
  {
    id: "m5", leadId: "CC-1017", leadName: "Divya Raghav", phone: "9811223344", city: "Delhi",
    stage: "Meeting Completed", type: "Office Meeting", mode: "In-person", startAt: iso(-1, 15),
    durationMin: 60, linkOrLocation: "Clean Craft HO, Delhi", owner: "Sneha Kulkarni",
    participants: "Divya Raghav, Father", objective: "Present franchise model in person",
    agenda: "Model • Investment • Support", reminder: "1 day before", confirmation: "Confirmed",
    notes: "", status: "Completed", preferredCity: "Delhi", timeline: "45 days",
    lastInteraction: "Office meeting yesterday", objections: "Wanted a smaller format store", expectedOutcome: "Proposal request",
    resources: ["Brochure", "Small Format Deck"],
    outcome: {
      summary: "Positive meeting. Family aligned. Asked for small format proposal.",
      interest: "High", objections: "Store size", stage: "Proposal Sent",
      nextAction: "Send small format proposal", nextDueAt: iso(0, 18),
    },
    history: [{ at: iso(-6, 12), text: "Meeting scheduled" }, { at: iso(-1, 16), text: "Marked Completed" }],
  },
  {
    id: "m6", leadId: "CC-1024", leadName: "Rohit Sethi", phone: "9822334455", city: "Nagpur",
    stage: "Contacted", type: "Online Presentation", mode: "Online", startAt: iso(-2, 12),
    durationMin: 30, linkOrLocation: "https://meet.cleancraft.in/rohit-1024", owner: "Amit Verma",
    participants: "Rohit Sethi", objective: "Present the franchise deck",
    agenda: "Deck walkthrough", reminder: "30 min before", confirmation: "Confirmed", notes: "",
    status: "No-Show", preferredCity: "Nagpur", timeline: "90 days",
    lastInteraction: "No response on meeting day", objections: "—",
    expectedOutcome: "Qualify", resources: ["Franchise Deck"],
    outcome: {
      summary: "Lead did not join the call and did not respond.", interest: "Low",
      objections: "—", stage: "Contacted", nextAction: "Call to reschedule",
      nextDueAt: iso(0, 11), reason: "Lead unreachable at meeting time",
    },
    history: [
      { at: iso(-5, 10), text: "Meeting scheduled" },
      { at: iso(-2, 12, 40), text: "Marked No-Show — follow-up task created" },
    ],
  },
  {
    id: "m7", leadId: "CC-1071", leadName: "Kavita Joshi", phone: "9765001199", city: "Surat",
    stage: "Qualified", type: "Store Visit", mode: "In-person", startAt: iso(3, 10, 30),
    durationMin: 90, linkOrLocation: "Clean Craft Store, Surat — Adajan", owner: "Priya Sharma",
    participants: "Kavita Joshi, Husband", objective: "Show live store operations",
    agenda: "Store tour • Machine demo • Owner interaction", reminder: "1 day before",
    confirmation: "Awaiting Confirmation", notes: "Confirm store owner availability.",
    status: "Scheduled", preferredCity: "Surat", timeline: "60 days",
    lastInteraction: "Call 2 days ago", objections: "Doubts on daily footfall", expectedOutcome: "Confidence build → proposal",
    resources: ["Store Visit Checklist", "Footfall Data Sheet"],
    history: [{ at: iso(-1, 17), text: "Meeting scheduled" }],
  },
  {
    id: "m8", leadId: "CC-1080", leadName: "Imran Shaikh", phone: "9700112255", city: "Mumbai",
    stage: "Qualified", type: "Follow-up Meeting", mode: "Online", startAt: iso(4, 16),
    durationMin: 30, linkOrLocation: "https://meet.cleancraft.in/imran-1080", owner: "Rahul Mehta",
    participants: "Imran Shaikh", objective: "Clarify pending questions",
    agenda: "Open questions • Next steps", reminder: "30 min before",
    confirmation: "Confirmed", notes: "", status: "Scheduled",
    preferredCity: "Mumbai", timeline: "45 days", lastInteraction: "Consultation last week",
    objections: "Location approval process",
    expectedOutcome: "Proposal acceptance", resources: ["Site Selection Guide"],
    history: [{ at: iso(-2, 9), text: "Meeting scheduled" }],
  },
];

/* ------------------------------ helpers ------------------------------ */

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString([], { day: "2-digit", month: "short" });
const dayKey = (s: string) => new Date(s).toDateString();
const minsUntil = (s: string) => Math.round((new Date(s).getTime() - Date.now()) / 60000);

type Visual = "amber" | "blue" | "purple" | "green" | "red" | "grey";

function visualOf(m: Meeting): Visual {
  if (m.status === "Completed") return "green";
  if (m.status === "No-Show") return "red";
  if (m.status === "Cancelled" || m.status === "Rescheduled") return "grey";
  const mins = minsUntil(m.startAt);
  if (mins >= 0 && mins <= 60) return "purple";
  return m.confirmation === "Confirmed" ? "blue" : "amber";
}

const VISUAL_CLS: Record<Visual, { bar: string; chip: string; label: string }> = {
  amber: { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200", label: "Awaiting confirmation" },
  blue: { bar: "bg-blue-500", chip: "bg-blue-50 text-blue-700 border-blue-200", label: "Confirmed" },
  purple: { bar: "bg-purple-500", chip: "bg-purple-50 text-purple-700 border-purple-200", label: "Starting soon" },
  green: { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completed" },
  red: { bar: "bg-red-500", chip: "bg-red-50 text-red-700 border-red-200", label: "No-Show" },
  grey: { bar: "bg-muted-foreground/40", chip: "bg-muted text-muted-foreground border-border", label: "Cancelled" },
};

/* ------------------------------ component ------------------------------ */

type ViewMode = "agenda" | "week" | "month" | "list";

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>(SEED);
  const [mode, setMode] = useState<ViewMode>("agenda");
  const [fType, setFType] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [q, setQ] = useState("");

  const [openId, setOpenId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [outcomeFor, setOutcomeFor] = useState<Meeting | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<Meeting | null>(null);

  const today = new Date().toDateString();

  const stats = useMemo(() => {
    const active = meetings.filter((m) => m.status === "Scheduled");
    return {
      today: active.filter((m) => dayKey(m.startAt) === today).length,
      upcoming: active.filter((m) => new Date(m.startAt).getTime() > Date.now()).length,
      awaiting: active.filter((m) => m.confirmation === "Awaiting Confirmation").length,
      completed: meetings.filter((m) => m.status === "Completed").length,
      noShow: meetings.filter((m) => m.status === "No-Show").length,
    };
  }, [meetings, today]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return meetings
      .filter((m) => (fType === "all" ? true : m.type === fType))
      .filter((m) => (fOwner === "all" ? true : m.owner === fOwner))
      .filter((m) => (fStatus === "all" ? true : m.status === fStatus))
      .filter((m) =>
        !term ? true : `${m.leadName} ${m.leadId} ${m.city}`.toLowerCase().includes(term),
      )
      .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  }, [meetings, fType, fOwner, fStatus, q]);

  const open = meetings.find((m) => m.id === openId) ?? null;

  function patch(id: string, fn: (m: Meeting) => Meeting) {
    setMeetings((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
  }

  function confirm(m: Meeting) {
    patch(m.id, (x) => ({
      ...x,
      confirmation: "Confirmed",
      history: [...x.history, { at: new Date().toISOString(), text: "Confirmation received" }],
    }));
    toast.success("Meeting confirmed");
  }

  function saveOutcome(m: Meeting, data: NonNullable<Meeting["outcome"]>, status: MeetingStatus) {
    patch(m.id, (x) => ({
      ...x,
      status,
      stage: data.stage,
      outcome: data,
      history: [
        ...x.history,
        { at: new Date().toISOString(), text: `Marked ${status}${data.reason ? ` — ${data.reason}` : ""}` },
      ],
    }));
    setOutcomeFor(null);
    setOpenId(null);
    if (status === "No-Show") {
      toast.success("No-Show recorded — follow-up task created in Follow-ups & Reminders");
    } else if (status === "Cancelled") {
      toast.success("Meeting cancelled — lead timeline updated");
    } else {
      toast.success(`Meeting completed — stage set to ${data.stage}, next action scheduled`);
    }
  }

  function doReschedule(m: Meeting, startAt: string, reason: string) {
    patch(m.id, (x) => ({
      ...x,
      startAt,
      confirmation: "Awaiting Confirmation",
      status: "Scheduled",
      history: [
        ...x.history,
        {
          at: new Date().toISOString(),
          text: `Rescheduled from ${fmtDate(x.startAt)} ${fmtTime(x.startAt)} to ${fmtDate(startAt)} ${fmtTime(startAt)}${reason ? ` — ${reason}` : ""}`,
        },
      ],
    }));
    setRescheduleFor(null);
    toast.success("Meeting rescheduled — original date preserved in timeline");
  }

  function addMeeting(m: Meeting) {
    setMeetings((prev) => [...prev, m]);
    setScheduleOpen(false);
    toast.success("Meeting scheduled — My Leads, Follow-ups and Pipeline updated");
  }

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Meetings</h2>
          <p className="text-sm text-muted-foreground">
            Schedule, prepare, run and close every sales meeting.
          </p>
        </div>
        <Button onClick={() => setScheduleOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <HeadStat label="Meetings Today" value={stats.today} tone="purple" icon={CalendarDays} />
        <HeadStat label="Upcoming" value={stats.upcoming} tone="blue" icon={Clock} />
        <HeadStat label="Awaiting Confirmation" value={stats.awaiting} tone="amber" icon={AlertTriangle} />
        <HeadStat label="Completed" value={stats.completed} tone="green" icon={CheckCircle2} />
        <HeadStat label="No-Shows" value={stats.noShow} tone="red" icon={XCircle} />
      </div>

      {/* views + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border p-0.5">
          {([
            ["agenda", "Daily agenda", ListChecks],
            ["week", "Weekly", CalendarRange],
            ["month", "Monthly", CalendarDays],
            ["list", "List", ListChecks],
          ] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-[5px] inline-flex items-center gap-1.5",
                mode === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[180px]">
          <Input placeholder="Search lead, ID or city…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <FilterSelect value={fType} onChange={setFType} placeholder="Type" options={[...MEETING_TYPES]} />
        <FilterSelect value={fOwner} onChange={setFOwner} placeholder="Salesperson" options={[...OWNERS]} />
        <FilterSelect
          value={fStatus}
          onChange={setFStatus}
          placeholder="Status"
          options={["Scheduled", "Completed", "Cancelled", "No-Show"]}
        />
      </div>

      {/* body */}
      {mode === "agenda" && (
        <AgendaView
          meetings={filtered}
          onOpen={setOpenId}
          onConfirm={confirm}
          onComplete={setOutcomeFor}
          onReschedule={setRescheduleFor}
        />
      )}
      {mode === "list" && (
        <div className="space-y-3">
          {filtered.length === 0 && <Empty />}
          {filtered.map((m) => (
            <MeetingCard
              key={m.id}
              m={m}
              onOpen={setOpenId}
              onConfirm={confirm}
              onComplete={setOutcomeFor}
              onReschedule={setRescheduleFor}
            />
          ))}
        </div>
      )}
      {mode === "week" && <CalendarView meetings={filtered} days={7} onOpen={setOpenId} />}
      {mode === "month" && <CalendarView meetings={filtered} days={35} onOpen={setOpenId} />}

      {/* detail drawer */}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.leadName} · {open.type}</SheetTitle>
              </SheetHeader>
              <MeetingDetail
                m={open}
                onConfirm={() => confirm(open)}
                onComplete={() => setOutcomeFor(open)}
                onReschedule={() => setRescheduleFor(open)}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} onCreate={addMeeting} />
      <OutcomeDialog meeting={outcomeFor} onClose={() => setOutcomeFor(null)} onSave={saveOutcome} />
      <RescheduleDialog meeting={rescheduleFor} onClose={() => setRescheduleFor(null)} onSave={doReschedule} />
    </div>
  );
}

/* ------------------------------ sub views ------------------------------ */

function Empty() {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        No meetings match the current filters.
      </CardContent>
    </Card>
  );
}

function HeadStat({
  label, value, tone, icon: Icon,
}: {
  label: string; value: number; tone: Visual; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className={cn("w-1.5 h-6 rounded-full", VISUAL_CLS[tone].bar)} />
          <span className="text-2xl font-semibold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[170px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function AgendaView({
  meetings, onOpen, onConfirm, onComplete, onReschedule,
}: {
  meetings: Meeting[];
  onOpen: (id: string) => void;
  onConfirm: (m: Meeting) => void;
  onComplete: (m: Meeting) => void;
  onReschedule: (m: Meeting) => void;
}) {
  const today = new Date().toDateString();
  const startingSoon = meetings.filter((m) => m.status === "Scheduled" && minsUntil(m.startAt) >= 0 && minsUntil(m.startAt) <= 60);
  const todays = meetings.filter((m) => dayKey(m.startAt) === today && !startingSoon.includes(m));
  const upcoming = meetings.filter(
    (m) => new Date(m.startAt).getTime() > Date.now() && dayKey(m.startAt) !== today,
  );
  const past = meetings.filter(
    (m) => new Date(m.startAt).getTime() < Date.now() && dayKey(m.startAt) !== today,
  );

  const groups: [string, Meeting[]][] = [
    ["Starting within the next hour", startingSoon],
    ["Today", todays],
    ["Upcoming", upcoming],
    ["Past meetings", past],
  ];

  return (
    <div className="space-y-6">
      {groups.every(([, g]) => g.length === 0) && <Empty />}
      {groups.map(([title, list]) =>
        list.length === 0 ? null : (
          <div key={title} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{title}</h3>
              <Badge variant="outline">{list.length}</Badge>
            </div>
            {list.map((m) => (
              <MeetingCard
                key={m.id}
                m={m}
                onOpen={onOpen}
                onConfirm={onConfirm}
                onComplete={onComplete}
                onReschedule={onReschedule}
              />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

function MeetingCard({
  m, onOpen, onConfirm, onComplete, onReschedule,
}: {
  m: Meeting;
  onOpen: (id: string) => void;
  onConfirm: (m: Meeting) => void;
  onComplete: (m: Meeting) => void;
  onReschedule: (m: Meeting) => void;
}) {
  const v = visualOf(m);
  const cls = VISUAL_CLS[v];
  const mins = minsUntil(m.startAt);
  const active = m.status === "Scheduled";

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className={cn("w-1.5 shrink-0", cls.bar)} />
        <CardContent className="p-4 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">
                  {fmtDate(m.startAt)} · {fmtTime(m.startAt)} · {m.durationMin} min
                </span>
                <Badge variant="outline" className={cls.chip}>
                  {m.status === "Scheduled" ? cls.label : m.status}
                </Badge>
                {active && mins >= 0 && mins <= 60 && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    in {mins} min
                  </Badge>
                )}
              </div>
              <div className="mt-1 text-base font-medium">
                {m.leadName} <span className="text-xs text-muted-foreground">({m.leadId})</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{m.type}</Badge>
                <Badge variant="outline">{m.mode}</Badge>
                <Badge variant="outline">{m.stage}</Badge>
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {m.owner}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                {m.mode === "Online" ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                <span className="truncate">{m.linkOrLocation}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {m.mode === "Online" && active && (
                <Button size="sm" onClick={() => toast.info("Meeting link opened (integration not enabled yet)")}>
                  <Video className="w-4 h-4 mr-1" /> Join
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onOpen(m.id)}>
                <Eye className="w-4 h-4 mr-1" /> View Lead
              </Button>
              {active && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onReschedule(m)}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Reschedule
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onComplete(m)}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Completed
                  </Button>
                  {m.confirmation === "Awaiting Confirmation" && (
                    <Button size="sm" variant="outline" onClick={() => onConfirm(m)}>
                      Confirm
                    </Button>
                  )}
                </>
              )}
              <a href={`tel:${m.phone}`}>
                <Button size="sm" variant="ghost"><Phone className="w-4 h-4" /></Button>
              </a>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function CalendarView({
  meetings, days, onOpen,
}: { meetings: Meeting[]; days: number; onOpen: (id: string) => void }) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (days > 7) start.setDate(1);
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <div className={cn("grid gap-2", days > 7 ? "grid-cols-7" : "grid-cols-1 md:grid-cols-7")}>
      {cells.map((d) => {
        const list = meetings.filter((m) => dayKey(m.startAt) === d.toDateString());
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <Card key={d.toISOString()} className={cn("min-h-[110px]", isToday && "ring-2 ring-primary")}>
            <CardContent className="p-2">
              <div className="text-[11px] font-medium text-muted-foreground">
                {d.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" })}
              </div>
              <div className="mt-1.5 space-y-1">
                {list.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onOpen(m.id)}
                    className={cn(
                      "w-full text-left text-[11px] rounded px-1.5 py-1 border truncate",
                      VISUAL_CLS[visualOf(m)].chip,
                    )}
                  >
                    {fmtTime(m.startAt)} {m.leadName}
                  </button>
                ))}
                {list.length === 0 && <div className="text-[11px] text-muted-foreground/60">—</div>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MeetingDetail({
  m, onConfirm, onComplete, onReschedule,
}: { m: Meeting; onConfirm: () => void; onComplete: () => void; onReschedule: () => void }) {
  const cls = VISUAL_CLS[visualOf(m)];
  return (
    <div className="mt-4 space-y-5 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={cls.chip}>{m.status === "Scheduled" ? cls.label : m.status}</Badge>
        <Badge variant="outline">{m.stage}</Badge>
        <Badge variant="outline">{m.mode}</Badge>
      </div>

      <Block title="Meeting" icon={CalendarDays}>
        <KV k="When" v={`${fmtDate(m.startAt)} ${fmtTime(m.startAt)} · ${m.durationMin} min`} />
        <KV k={m.mode === "Online" ? "Link" : "Location"} v={m.linkOrLocation} />
        <KV k="Salesperson" v={m.owner} />
        <KV k="Participants" v={m.participants} />
        <KV k="Reminder" v={m.reminder} />
      </Block>

      <Block title="Meeting preparation" icon={Target}>
        <KV k="Preferred city" v={m.preferredCity} />
        <KV k="Purchase timeline" v={m.timeline} />
        <KV k="Previous interaction" v={m.lastInteraction} />
        <KV k="Questions / objections" v={m.objections} />
        <KV k="Objective" v={m.objective} />
        <KV k="Expected outcome" v={m.expectedOutcome} />
        <div className="pt-1">
          <div className="text-xs text-muted-foreground mb-1 inline-flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Recommended resources
          </div>
          <div className="flex flex-wrap gap-1.5">
            {m.resources.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
          </div>
        </div>
      </Block>

      <Block title="Agenda" icon={ListChecks}>
        <p className="whitespace-pre-wrap">{m.agenda}</p>
        {m.notes && <p className="text-muted-foreground mt-2">Notes: {m.notes}</p>}
      </Block>

      {m.outcome && (
        <Block title="Outcome" icon={CheckCircle2}>
          <KV k="Summary" v={m.outcome.summary} />
          <KV k="Interest level" v={m.outcome.interest} />
          <KV k="Objections" v={m.outcome.objections} />
          <KV k="Updated stage" v={m.outcome.stage} />
          <KV k="Next action" v={`${m.outcome.nextAction} · ${fmtDate(m.outcome.nextDueAt)} ${fmtTime(m.outcome.nextDueAt)}`} />
          {m.outcome.reason && <KV k="Reason" v={m.outcome.reason} />}
        </Block>
      )}

      <Block title="Meeting history" icon={Clock}>
        <ol className="relative border-l pl-4 space-y-2">
          {m.history.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary" />
              <div>{h.text}</div>
              <div className="text-xs text-muted-foreground">{fmtDate(h.at)} {fmtTime(h.at)}</div>
            </li>
          ))}
        </ol>
      </Block>

      {m.status === "Scheduled" && (
        <div className="flex flex-wrap gap-2 pb-6">
          <Button size="sm" onClick={onComplete}><CheckCircle2 className="w-4 h-4 mr-1" /> Mark Completed</Button>
          <Button size="sm" variant="outline" onClick={onReschedule}><RotateCcw className="w-4 h-4 mr-1" /> Reschedule</Button>
          {m.confirmation === "Awaiting Confirmation" && (
            <Button size="sm" variant="outline" onClick={onConfirm}>Mark Confirmed</Button>
          )}
        </div>
      )}
    </div>
  );
}

function Block({
  title, icon: Icon, children,
}: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold inline-flex items-center gap-1.5 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" /> {title}
      </div>
      <div className="space-y-1.5">{children}</div>
      <Separator className="mt-4" />
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 justify-between">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="text-right font-medium">{v || "—"}</span>
    </div>
  );
}

/* ------------------------------ dialogs ------------------------------ */

const LEAD_OPTIONS = SEED.map((s) => ({
  leadId: s.leadId, leadName: s.leadName, phone: s.phone, city: s.city, stage: s.stage,
  timeline: s.timeline,
}));

function ScheduleDialog({
  open, onOpenChange, onCreate,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (m: Meeting) => void }) {
  const [leadId, setLeadId] = useState("");
  const [type, setType] = useState<MeetingType>("Discovery Call");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");
  const [duration, setDuration] = useState("30");
  const [mode, setMode] = useState<"Online" | "In-person">("Online");
  const [where, setWhere] = useState("");
  const [owner, setOwner] = useState<string>(OWNERS[0]);
  const [participants, setParticipants] = useState("");
  const [objective, setObjective] = useState("");
  const [agenda, setAgenda] = useState("");
  const [reminder, setReminder] = useState<string>(REMINDERS[1]);
  const [confirmation, setConfirmation] = useState<Confirmation>("Awaiting Confirmation");
  const [notes, setNotes] = useState("");

  function submit() {
    const lead = LEAD_OPTIONS.find((l) => l.leadId === leadId);
    if (!lead) return toast.error("Select a lead — every meeting must belong to a lead");
    if (!date) return toast.error("Select a meeting date");
    if (!objective.trim()) return toast.error("Meeting objective is required");
    if (!where.trim()) return toast.error(mode === "Online" ? "Meeting link is required" : "Location is required");

    const startAt = new Date(`${date}T${time}:00`).toISOString();
    onCreate({
      id: `m${Date.now()}`, leadId: lead.leadId, leadName: lead.leadName, phone: lead.phone,
      city: lead.city, stage: "Meeting Scheduled", type, mode, startAt,
      durationMin: Number(duration), linkOrLocation: where, owner, participants,
      objective, agenda, reminder, confirmation, notes, status: "Scheduled",
      preferredCity: lead.city, timeline: lead.timeline,
      lastInteraction: "—", objections: "—",
      expectedOutcome: objective, resources: ["Franchise Brochure"],
      history: [{ at: new Date().toISOString(), text: "Meeting scheduled" }],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Schedule Meeting</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Lead">
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
              <SelectContent>
                {LEAD_OPTIONS.map((l) => (
                  <SelectItem key={l.leadId} value={l.leadId}>{l.leadName} · {l.leadId}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Meeting type">
            <Select value={type} onValueChange={(v) => setType(v as MeetingType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Start time"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          <Field label="Duration">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mode">
            <Select value={mode} onValueChange={(v) => setMode(v as "Online" | "In-person")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="In-person">In-person</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={mode === "Online" ? "Meeting link" : "Location"} full>
            <Input value={where} onChange={(e) => setWhere(e.target.value)} placeholder={mode === "Online" ? "https://…" : "Address"} />
          </Field>
          <Field label="Assigned salesperson">
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Participants">
            <Input value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Names" />
          </Field>
          <Field label="Meeting objective" full>
            <Input value={objective} onChange={(e) => setObjective(e.target.value)} />
          </Field>
          <Field label="Agenda" full>
            <Textarea rows={2} value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </Field>
          <Field label="Reminder timing">
            <Select value={reminder} onValueChange={setReminder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{REMINDERS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Confirmation status">
            <Select value={confirmation} onValueChange={(v) => setConfirmation(v as Confirmation)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Awaiting Confirmation">Awaiting Confirmation</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Notes" full>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Schedule Meeting</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("space-y-1", full && "sm:col-span-2")}>
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function OutcomeDialog({
  meeting, onClose, onSave,
}: {
  meeting: Meeting | null;
  onClose: () => void;
  onSave: (m: Meeting, data: NonNullable<Meeting["outcome"]>, status: MeetingStatus) => void;
}) {
  const [status, setStatus] = useState<MeetingStatus>("Completed");
  const [summary, setSummary] = useState("");
  const [interest, setInterest] = useState<string>("High");
  const [objections, setObjections] = useState("");
  const [stage, setStage] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("11:00");
  const [reason, setReason] = useState("");

  if (!meeting) return null;

  const suggestedStage =
    meeting.type === "Proposal Discussion" ? "Proposal Sent"
      : meeting.type === "Negotiation" ? "Negotiation"
        : meeting.type === "Payment Discussion" ? "Payment Pending"
          : "Meeting Completed";

  function submit() {
    const m = meeting!;
    const needsReason = status === "Cancelled" || status === "No-Show";
    if (needsReason && !reason.trim()) return toast.error(`A reason is required for ${status}`);
    if (!summary.trim()) return toast.error("Meeting summary is required");
    if (status === "Completed" && !nextAction.trim()) return toast.error("Completed meetings need a next action");
    if (status === "Completed" && !nextDate) return toast.error("Next action due date is required");

    const nextDueAt = nextDate
      ? new Date(`${nextDate}T${nextTime}:00`).toISOString()
      : new Date(Date.now() + 864e5).toISOString();

    onSave(
      m,
      {
        summary,
        interest,
        objections: objections || "—",
        stage: stage || (status === "Completed" ? suggestedStage : m.stage),
        nextAction: nextAction || (status === "No-Show" ? "Call to reschedule meeting" : "Follow up"),
        nextDueAt,
        reason: needsReason ? reason : undefined,
      },
      status,
    );
    setSummary(""); setObjections(""); setStage(""); setNextAction("");
    setNextDate(""); setReason(""); setStatus("Completed");
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Meeting outcome — {meeting.leadName}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Result">
            <Select value={status} onValueChange={(v) => setStatus(v as MeetingStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No-Show">No-Show</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Customer interest level">
            <Select value={interest} onValueChange={setInterest}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INTEREST.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          {(status === "Cancelled" || status === "No-Show") && (
            <Field label={`Reason for ${status}`} full>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
          )}
          <Field label="Meeting summary" full>
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>
          <Field label="Objections raised" full>
            <Input value={objections} onChange={(e) => setObjections(e.target.value)} />
          </Field>
          <Field label="Updated pipeline stage">
            <Select value={stage || suggestedStage} onValueChange={setStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Next action" full>
            <Input
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder={status === "No-Show" ? "Call to reschedule meeting" : "e.g. Send proposal"}
            />
          </Field>
          <Field label="Next action date"><Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} /></Field>
          <Field label="Next action time"><Input type="time" value={nextTime} onChange={(e) => setNextTime(e.target.value)} /></Field>
        </div>
        <p className="text-xs text-muted-foreground">
          Saving updates the lead timeline, Sales Pipeline stage, Follow-ups & Reminders, Dashboard and Performance.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save outcome</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({
  meeting, onClose, onSave,
}: {
  meeting: Meeting | null;
  onClose: () => void;
  onSave: (m: Meeting, startAt: string, reason: string) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");
  const [reason, setReason] = useState("");
  if (!meeting) return null;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Reschedule — {meeting.leadName}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-xs text-muted-foreground">
            Current: {fmtDate(meeting.startAt)} {fmtTime(meeting.startAt)} — original date is preserved in the timeline.
          </p>
          <Field label="New date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="New time"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          <Field label="Reason"><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!date) return toast.error("Select a new date");
              onSave(meeting, new Date(`${date}T${time}:00`).toISOString(), reason);
              setDate(""); setReason("");
            }}
          >
            Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
