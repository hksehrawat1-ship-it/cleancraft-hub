import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Phone, MessageCircle, Eye, AlertTriangle, Clock, CheckCircle2, PhoneCall, Timer,
  Flame, UserPlus, CalendarClock, PhoneMissed, Wallet, ChevronDown, Target, BookOpen,
} from "lucide-react";

/* ------------------------------ types ------------------------------ */

export type QueueLead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  unit: string;
  source: string;
  stage: string;
  score: number;
  owner: string;
  lastInteraction: string;
  hoursSinceContact: number;
  scheduledAt: string; // ISO
  attempts: number;          // unanswered attempts
  missedInbound: boolean;    // customer called, we missed
  callbackRequested: boolean;
  paymentCommitment: boolean;
  meetingToConfirm: boolean;
  isNew: boolean;            // awaiting first contact
  engagedRecently: boolean;
  investmentReady: boolean;
  timeline: string;          // purchase timeline
  budget: string;
  qualification: string;
  objections: string[];
  previousNotes: string[];
  objective: string;
  script: string;
  done?: boolean;
  outcome?: string;
};

export type CallLogEntry = {
  leadId: string;
  leadName: string;
  outcome: string;
  notes: string;
  nextAction: string;
  nextDue: string;
  at: string;
};

/* ------------------------------ sample data ------------------------------ */

function iso(dayOffset: number, hh = 10, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

const SAMPLE: QueueLead[] = [
  {
    id: "CC-1042", name: "Rohit Agarwal", phone: "+91 98290 11234", city: "Jaipur", unit: "Franchise",
    source: "Meta Ads", stage: "Proposal Sent", score: 96, owner: "Ravi Sharma",
    lastInteraction: "Call · 3 days ago", hoursSinceContact: 72, scheduledAt: iso(-1, 11, 0),
    attempts: 1, missedInbound: true, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: false, isNew: false, engagedRecently: true, investmentReady: true,
    timeline: "Within 30 days", budget: "₹25–30 L",
    qualification: "Budget confirmed ₹25–30L · Site shortlisted in Vaishali Nagar · Decision maker",
    objections: ["Wants lower royalty in year 1", "Concerned about manpower hiring"],
    previousNotes: ["Proposal opened 3 times", "Brother is co-investor", "Prefers calls after 6 PM"],
    objective: "Close proposal feedback and lock agreement date",
    script: "Proposal Closing Script — recap ROI, address royalty objection, ask for agreement date.",
  },
  {
    id: "CC-1039", name: "Meena Sharma", phone: "+91 99300 44521", city: "Indore", unit: "Franchise",
    source: "Referral", stage: "Negotiation", score: 92, owner: "Ravi Sharma",
    lastInteraction: "WhatsApp · yesterday", hoursSinceContact: 20, scheduledAt: iso(0, 11, 30),
    attempts: 0, missedInbound: false, callbackRequested: false, paymentCommitment: true,
    meetingToConfirm: false, isNew: false, engagedRecently: true, investmentReady: true,
    timeline: "Within 15 days", budget: "₹20–25 L",
    qualification: "Referred by Jaipur partner · Engagement letter shared · Booking amount promised",
    objections: ["Wants corner shop location before payment"],
    previousNotes: ["EL sent for signature", "Store visit completed at Indore pilot store"],
    objective: "Collect signed engagement letter and booking amount",
    script: "Payment Follow-up Script — confirm signature status, share payment link, set date.",
  },
  {
    id: "CC-1047", name: "Farhan Qureshi", phone: "+91 90040 88123", city: "Bhopal", unit: "Franchise",
    source: "Meta Ads", stage: "Contacted", score: 71, owner: "Neha Kulkarni",
    lastInteraction: "Call · 5 days ago", hoursSinceContact: 120, scheduledAt: iso(-2, 15, 0),
    attempts: 2, missedInbound: false, callbackRequested: true, paymentCommitment: false,
    meetingToConfirm: false, isNew: false, engagedRecently: false, investmentReady: false,
    timeline: "Within 60 days", budget: "₹20 L",
    qualification: "Answered first call · Qualification incomplete · Budget indicative",
    objections: ["Not sure about location availability"],
    previousNotes: ["Asked to be called back this week"],
    objective: "Complete qualification — budget, city, timeline",
    script: "Qualification Script — 6 discovery questions before pitching numbers.",
  },
  {
    id: "CC-1060", name: "Ankit Gupta", phone: "+91 88006 11220", city: "Pune", unit: "Franchise",
    source: "IndiaMART", stage: "New Lead", score: 61, owner: "Amit Bansal",
    lastInteraction: "—", hoursSinceContact: 4, scheduledAt: iso(0, 18, 0),
    attempts: 0, missedInbound: false, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: false, isNew: true, engagedRecently: true, investmentReady: false,
    timeline: "Exploring", budget: "Not disclosed",
    qualification: "Fresh inbound — no contact yet",
    objections: [],
    previousNotes: ["IndiaMART enquiry received today"],
    objective: "First contact within response SLA — introduce brand, qualify basics",
    script: "First Contact Script — 30 second intro, permission to ask 5 questions.",
  },
  {
    id: "CC-1051", name: "Sandeep Verma", phone: "+91 90050 77812", city: "Lucknow", unit: "Master Franchise",
    source: "Google Ads", stage: "Qualified", score: 84, owner: "Neha Kulkarni",
    lastInteraction: "Call · 2 days ago", hoursSinceContact: 48, scheduledAt: iso(0, 13, 0),
    attempts: 0, missedInbound: false, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: false, isNew: false, engagedRecently: true, investmentReady: true,
    timeline: "1–2 months", budget: "₹40 L+",
    qualification: "Master franchise intent · 3-store territory · Strong capital",
    objections: ["Wants exclusivity for full city"],
    previousNotes: ["Asked for ROI comparison sheet"],
    objective: "Share ROI comparison and move to proposal",
    script: "Master Franchise Script — territory economics and exclusivity terms.",
  },
  {
    id: "CC-1055", name: "Priya Nair", phone: "+91 98765 32109", city: "Surat", unit: "Franchise",
    source: "Website", stage: "Meeting Scheduled", score: 78, owner: "Ravi Sharma",
    lastInteraction: "WhatsApp · today", hoursSinceContact: 6, scheduledAt: iso(0, 16, 0),
    attempts: 0, missedInbound: false, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: true, isNew: false, engagedRecently: true, investmentReady: true,
    timeline: "Within 45 days", budget: "₹18–22 L",
    qualification: "Location finalised in Adajan · Site visit booked tomorrow",
    objections: [],
    previousNotes: ["Confirmed interest over WhatsApp"],
    objective: "Confirm attendance for tomorrow's site visit",
    script: "Meeting Confirmation Script — confirm time, address, attendees.",
  },
  {
    id: "CC-1058", name: "Sneha Patil", phone: "+91 91300 76540", city: "Nashik", unit: "Franchise",
    source: "Website", stage: "Meeting Scheduled", score: 68, owner: "Amit Bansal",
    lastInteraction: "WhatsApp · 2 days ago", hoursSinceContact: 50, scheduledAt: iso(0, 17, 15),
    attempts: 1, missedInbound: false, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: false, isNew: false, engagedRecently: false, investmentReady: false,
    timeline: "Within 45 days", budget: "₹22 L",
    qualification: "Intro meeting booked · Qualification partially done",
    objections: ["Needs spouse approval"],
    previousNotes: ["Agenda to be shared before meeting"],
    objective: "Share meeting agenda and pre-read",
    script: "Pre-Meeting Script — set agenda, ask who else will join.",
  },
  {
    id: "CC-1029", name: "Kavita Rao", phone: "+91 97400 55678", city: "Bengaluru", unit: "B2B Laundry",
    source: "Exhibition", stage: "Contacted", score: 55, owner: "Neha Kulkarni",
    lastInteraction: "Call · 6 days ago", hoursSinceContact: 144, scheduledAt: iso(0, 19, 0),
    attempts: 1, missedInbound: false, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: false, isNew: false, engagedRecently: false, investmentReady: false,
    timeline: "3+ months", budget: "₹15 L",
    qualification: "Low urgency · Budget below threshold",
    objections: ["Budget constrained"],
    previousNotes: ["Met at exhibition booth"],
    objective: "Nurture — share company profile, re-check timeline",
    script: "Nurture Script — light touch, value content, re-qualify timeline.",
  },
  {
    id: "CC-1064", name: "Vikram Chauhan", phone: "+91 99887 45510", city: "Udaipur", unit: "Franchise",
    source: "Referral", stage: "New Lead", score: 88, owner: "Ravi Sharma",
    lastInteraction: "—", hoursSinceContact: 2, scheduledAt: iso(0, 12, 0),
    attempts: 0, missedInbound: false, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: false, isNew: true, engagedRecently: true, investmentReady: true,
    timeline: "Within 30 days", budget: "₹30 L",
    qualification: "Referral from Ludhiana partner · Capital ready",
    objections: [],
    previousNotes: ["Referred this morning — high quality"],
    objective: "First contact — qualify and book discovery meeting",
    script: "Referral First Contact Script — mention referrer, build trust fast.",
  },
  {
    id: "CC-1066", name: "Imran Shaikh", phone: "+91 98220 33441", city: "Aurangabad", unit: "Franchise",
    source: "Google Ads", stage: "Proposal Sent", score: 74, owner: "Amit Bansal",
    lastInteraction: "Call · 8 days ago", hoursSinceContact: 190, scheduledAt: iso(-3, 10, 0),
    attempts: 3, missedInbound: false, callbackRequested: false, paymentCommitment: false,
    meetingToConfirm: false, isNew: false, engagedRecently: false, investmentReady: false,
    timeline: "Within 60 days", budget: "₹18 L",
    qualification: "Proposal shared · Not responding to last 3 attempts",
    objections: ["Comparing with another laundry brand"],
    previousNotes: ["3 unanswered attempts", "Last spoke 8 days ago"],
    objective: "Re-engage — differentiate vs competitor",
    script: "Competitor Objection Script — 4 differentiators + proof points.",
  },
];

/* ------------------------------ priority engine ------------------------------ */

type Bucket =
  | "Call Immediately" | "Overdue" | "New Leads" | "Scheduled Today"
  | "Callbacks Requested" | "Payment Follow-ups" | "Lower Priority";

const BUCKETS: { key: Bucket; icon: any; tone: string }[] = [
  { key: "Call Immediately", icon: Flame, tone: "text-red-600" },
  { key: "Overdue", icon: AlertTriangle, tone: "text-red-600" },
  { key: "New Leads", icon: UserPlus, tone: "text-blue-600" },
  { key: "Scheduled Today", icon: CalendarClock, tone: "text-amber-600" },
  { key: "Callbacks Requested", icon: PhoneMissed, tone: "text-violet-600" },
  { key: "Payment Follow-ups", icon: Wallet, tone: "text-emerald-700" },
  { key: "Lower Priority", icon: Clock, tone: "text-muted-foreground" },
];

type Scored = QueueLead & { points: number; reasons: string[]; bucket: Bucket; level: "Critical" | "High" | "Medium" | "Low" };

function scoreLead(l: QueueLead): Scored {
  const now = Date.now();
  const sched = new Date(l.scheduledAt).getTime();
  const overdue = sched < now;
  const reasons: string[] = [];
  let p = 0;

  if (l.missedInbound) { p += 60; reasons.push("Missed inbound call from customer"); }
  if (l.callbackRequested) { p += 45; reasons.push("Customer requested a callback"); }
  if (overdue) { p += 40; reasons.push("Promised follow-up is overdue"); }
  if (l.isNew) { p += 38; reasons.push("New lead awaiting first contact (response SLA)"); }
  if (l.paymentCommitment) { p += 42; reasons.push("Payment / booking commitment pending"); }
  if (l.meetingToConfirm) { p += 25; reasons.push("Meeting needs confirmation"); }
  if (l.score >= 85) { p += 30; reasons.push(`High lead score (${l.score})`); }
  else if (l.score >= 70) { p += 15; reasons.push(`Good lead score (${l.score})`); }
  if (l.investmentReady) { p += 18; reasons.push("Investment readiness confirmed"); }
  if (/15 days|30 days/.test(l.timeline)) { p += 16; reasons.push(`Short purchase timeline (${l.timeline})`); }
  if (l.engagedRecently) { p += 12; reasons.push("Recent customer engagement"); }
  if (l.attempts >= 3) { p += 14; reasons.push(`${l.attempts} unanswered attempts`); }
  else if (l.attempts > 0) { p += 6; reasons.push(`${l.attempts} unanswered attempt(s)`); }
  if (l.hoursSinceContact >= 120) { p += 12; reasons.push("No contact for 5+ days"); }

  let bucket: Bucket;
  if (l.missedInbound) bucket = "Call Immediately";
  else if (l.callbackRequested) bucket = "Callbacks Requested";
  else if (overdue) bucket = "Overdue";
  else if (l.paymentCommitment) bucket = "Payment Follow-ups";
  else if (l.isNew) bucket = "New Leads";
  else if (p >= 40) bucket = "Scheduled Today";
  else bucket = "Lower Priority";

  const level = p >= 90 ? "Critical" : p >= 60 ? "High" : p >= 35 ? "Medium" : "Low";
  return { ...l, points: p, reasons, bucket, level };
}

const BUCKET_ORDER: Bucket[] = [
  "Call Immediately", "Overdue", "New Leads", "Scheduled Today",
  "Callbacks Requested", "Payment Follow-ups", "Lower Priority",
];

const OUTCOMES = [
  "Connected — Interested",
  "Connected — Follow-up Required",
  "Meeting Scheduled",
  "Proposal Requested",
  "Payment Follow-up",
  "Not Interested",
  "No Answer",
  "Busy",
  "Wrong Number",
  "Call Later",
] as const;
type Outcome = (typeof OUTCOMES)[number];

const LOST_REASONS = [
  "Budget below minimum investment", "Chose competitor", "Location unavailable",
  "Timeline too far", "Not a decision maker", "Other",
];

function fmtTime(s: string) {
  const d = new Date(s);
  return d.toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function isOverdue(s: string) { return new Date(s).getTime() < Date.now(); }
function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ------------------------------ component ------------------------------ */

export function PriorityCallQueue() {
  const [leads, setLeads] = useState<QueueLead[]>(SAMPLE);
  const [log, setLog] = useState<CallLogEntry[]>([]);
  const [active, setActive] = useState<Scored | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const scored = useMemo(
    () => leads.map(scoreLead).sort((a, b) => {
      const ba = BUCKET_ORDER.indexOf(a.bucket), bb = BUCKET_ORDER.indexOf(b.bucket);
      if (ba !== bb) return ba - bb;
      return b.points - a.points;
    }),
    [leads],
  );

  const pending = scored.filter((l) => !l.done);
  const completed = scored.filter((l) => l.done);
  const overdueCount = pending.filter((l) => isOverdue(l.scheduledAt)).length;
  const avgResponse = "2h 15m";

  const positions = new Map(pending.map((l, i) => [l.id, i + 1]));

  function completeCall(entry: CallLogEntry, markDone: boolean) {
    setLog((p) => [entry, ...p]);
    setLeads((prev) => prev.map((l) => l.id === entry.leadId
      ? {
          ...l,
          done: markDone,
          outcome: entry.outcome,
          attempts: markDone ? l.attempts : l.attempts + 1,
          missedInbound: false,
          callbackRequested: entry.outcome === "Call Later" ? true : false,
          hoursSinceContact: 0,
          isNew: false,
          lastInteraction: `Call · just now`,
          scheduledAt: entry.nextDue || l.scheduledAt,
        }
      : l));
    setActive(null);
  }

  const grouped = BUCKET_ORDER.map((b) => ({ bucket: b, items: pending.filter((l) => l.bucket === b) }));
  const progress = scored.length ? Math.round((completed.length / scored.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Priority Call Queue</h2>
          <p className="text-sm text-muted-foreground">
            Rules-based ranking — you never decide whom to call next.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full lg:w-auto"
          disabled={pending.length === 0}
          onClick={() => setActive(pending[0] ?? null)}
        >
          <PhoneCall className="w-4 h-4 mr-2" /> Start Calling
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <HeadStat icon={Phone} label="Calls Remaining Today" value={pending.length} tone="text-blue-600" />
        <HeadStat icon={AlertTriangle} label="Overdue Calls" value={overdueCount} tone="text-red-600" />
        <HeadStat icon={CheckCircle2} label="Calls Completed" value={completed.length} tone="text-emerald-600" />
        <HeadStat icon={Timer} label="Avg Response Time" value={avgResponse} tone="text-amber-600" />
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Today's queue progress</span>
            <span className="text-muted-foreground tabular-nums">{completed.length}/{scored.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* sections */}
      <div className="space-y-5">
        {grouped.map(({ bucket, items }) => {
          const meta = BUCKETS.find((b) => b.key === bucket)!;
          const Icon = meta.icon;
          const isOpen = !collapsed[bucket];
          return (
            <div key={bucket}>
              <button
                type="button"
                onClick={() => setCollapsed((p) => ({ ...p, [bucket]: !!isOpen }))}
                className="w-full flex items-center gap-2 mb-2 text-left"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", !isOpen && "-rotate-90")} />
                <Icon className={cn("w-4 h-4", meta.tone)} />
                <span className="font-semibold text-sm">{bucket}</span>
                <Badge variant="secondary" className="ml-1">{items.length}</Badge>
              </button>
              {isOpen && (
                items.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-6 pb-2">Nothing here right now.</p>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {items.map((l) => (
                      <CallCard key={l.id} lead={l} position={positions.get(l.id)!} onCall={() => setActive(l)} />
                    ))}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-sm">Completed Calls</span>
            <Badge variant="secondary">{completed.length}</Badge>
          </div>
          <div className="space-y-2">
            {completed.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{l.name}</span>
                <span className="text-muted-foreground text-xs">{l.id} · {l.city}</span>
                <Badge variant="outline" className="ml-auto border-emerald-300 text-emerald-800">{l.outcome}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="font-semibold text-sm">Call log (syncs to My Leads, Dashboard &amp; Performance)</div>
            {log.map((e, i) => (
              <div key={i} className="text-xs border-l-2 pl-3 py-1">
                <div className="font-medium">{e.leadName} · {e.outcome}</div>
                {e.notes && <div className="text-muted-foreground">{e.notes}</div>}
                {e.nextAction && (
                  <div className="text-muted-foreground">
                    Next: {e.nextAction}{e.nextDue ? ` · ${fmtTime(e.nextDue)}` : ""}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <CallWorkspace
        lead={active}
        onClose={() => setActive(null)}
        onComplete={completeCall}
      />
    </div>
  );
}

function HeadStat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground leading-tight">{label}</div>
            <div className={cn("text-2xl font-bold mt-1", tone)}>{value}</div>
          </div>
          <Icon className={cn("w-4 h-4 shrink-0", tone)} />
        </div>
      </CardContent>
    </Card>
  );
}

const LEVEL_CLASS: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-amber-100 text-amber-800 border-amber-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  Low: "bg-muted text-muted-foreground",
};

function CallCard({ lead, position, onCall }: { lead: Scored; position: number; onCall: () => void }) {
  const overdue = isOverdue(lead.scheduledAt);
  const soon = !overdue && new Date(lead.scheduledAt).getTime() - Date.now() < 3 * 3600 * 1000;
  return (
    <Card className={cn(
      "border-l-4",
      overdue ? "border-l-red-500" : soon ? "border-l-amber-500" : "border-l-muted",
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
            {position}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold truncate">{lead.name}</span>
              <span className="text-xs text-muted-foreground">{lead.id}</span>
              <Badge variant="outline" className={cn("text-[10px]", LEVEL_CLASS[lead.level])}>{lead.level}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {lead.city} · {lead.unit} · {lead.source}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" className="text-[10px]">{lead.stage}</Badge>
              <Badge variant="outline" className="text-[10px]">Score {lead.score}</Badge>
              <Badge variant="outline" className="text-[10px]">{lead.owner}</Badge>
            </div>
          </div>
        </div>

        <ul className="text-xs space-y-0.5">
          {lead.reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex gap-1.5 text-muted-foreground">
              <span className="text-primary">•</span>{r}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Last: {lead.lastInteraction}</span>
          <span className={cn(overdue ? "text-red-600 font-medium" : soon ? "text-amber-600 font-medium" : "")}>
            Scheduled: {fmtTime(lead.scheduledAt)}{overdue ? " · Overdue" : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onCall}>
            <Phone className="w-3.5 h-3.5 mr-1.5" /> Call Now
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
            </a>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast.info(`${lead.name} · ${lead.id}`, { description: lead.qualification })}>
            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Lead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ workspace ------------------------------ */

function CallWorkspace({
  lead, onClose, onComplete,
}: {
  lead: Scored | null;
  onClose: () => void;
  onComplete: (e: CallLogEntry, markDone: boolean) => void;
}) {
  const [outcome, setOutcome] = useState<Outcome | "">("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [lostReason, setLostReason] = useState("");

  const key = lead?.id ?? "none";

  function reset() {
    setOutcome(""); setNotes(""); setNextAction(""); setNextDue(""); setLostReason("");
  }

  if (!lead) return null;

  const connected = outcome.startsWith("Connected") || ["Meeting Scheduled", "Proposal Requested", "Payment Follow-up"].includes(outcome);
  const isActiveLead = outcome !== "" && !["Not Interested", "Wrong Number"].includes(outcome);
  const needsDateTime = outcome === "Call Later";

  function submit() {
    if (!outcome) { toast.error("Select a call outcome before saving."); return; }
    if (connected && !notes.trim()) { toast.error("Connected calls must include notes."); return; }
    if (outcome === "Not Interested" && !lostReason) { toast.error("Select a reason before marking the lead Lost."); return; }
    if (needsDateTime && !nextDue) { toast.error("'Call Later' requires a specific date and time."); return; }
    if (isActiveLead && (!nextAction.trim() || !nextDue)) {
      toast.error("Active leads need a next action and due date.");
      return;
    }

    let due = nextDue;
    let action = nextAction;
    let markDone = true;

    if (outcome === "No Answer" || outcome === "Busy") {
      const d = new Date(Date.now() + (outcome === "Busy" ? 2 : 4) * 3600 * 1000);
      due = d.toISOString();
      action = `Retry call attempt #${lead.attempts + 2}`;
      markDone = false;
      toast.info("Another call attempt auto-scheduled", { description: fmtTime(due) });
    } else if (needsDateTime) {
      due = new Date(nextDue).toISOString();
      action = nextAction || "Scheduled callback";
      markDone = true;
    } else if (due) {
      due = new Date(due).toISOString();
    }

    if (outcome === "Meeting Scheduled") toast.success("Meeting created in Meetings");
    if (outcome === "Connected — Follow-up Required") toast.success("Reminder created in Follow-ups & Reminders");
    if (outcome === "Proposal Requested") toast.success("Lead timeline updated · Next action: send proposal");
    if (outcome === "Not Interested") toast.success(`Lead marked Lost — ${lostReason}`);

    onComplete({
      leadId: lead.id,
      leadName: lead.name,
      outcome: outcome === "Not Interested" ? `Not Interested — ${lostReason}` : outcome,
      notes: notes.trim(),
      nextAction: action,
      nextDue: due,
      at: new Date().toISOString(),
    }, markDone);
    reset();
  }

  return (
    <Sheet open={!!lead} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto" key={key}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4" /> Call Workspace
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-8 space-y-5">
          <div>
            <div className="text-lg font-semibold">{lead.name}</div>
            <div className="text-sm text-muted-foreground">
              {lead.id} · {lead.city} · {lead.unit} · {lead.phone}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline">{lead.stage}</Badge>
              <Badge variant="outline">Score {lead.score}</Badge>
              <Badge variant="outline" className={LEVEL_CLASS[lead.level]}>{lead.level}</Badge>
              <Badge variant="outline">{lead.owner}</Badge>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" asChild>
                <a href={`tel:${lead.phone.replace(/\s/g, "")}`}><Phone className="w-3.5 h-3.5 mr-1.5" /> Dial</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <Separator />

          <Block title="Qualification summary">{lead.qualification}</Block>
          <Block title="Budget & timeline">{lead.budget} · {lead.timeline}</Block>

          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Previous call notes</div>
            {lead.previousNotes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet.</p> : (
              <ul className="text-sm space-y-1">
                {lead.previousNotes.map((n) => <li key={n} className="flex gap-1.5"><span className="text-primary">•</span>{n}</li>)}
              </ul>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Objections raised</div>
            {lead.objections.length === 0 ? <p className="text-sm text-muted-foreground">None recorded.</p> : (
              <div className="flex flex-wrap gap-1.5">
                {lead.objections.map((o) => <Badge key={o} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">{o}</Badge>)}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-primary/5 p-3 space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div><span className="font-medium">Objective: </span>{lead.objective}</div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div><span className="font-medium">Script: </span>{lead.script}</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Call outcome <span className="text-red-600">*</span></label>
              <Select value={outcome} onValueChange={(v) => setOutcome(v as Outcome)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select outcome" /></SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Call notes {connected && <span className="text-red-600">*</span>}
              </label>
              <Textarea
                className="mt-1" rows={3} value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What was discussed, commitments made, objections…"
              />
            </div>

            {outcome === "Not Interested" && (
              <div>
                <label className="text-sm font-medium">Lost reason <span className="text-red-600">*</span></label>
                <Select value={lostReason} onValueChange={setLostReason}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    {LOST_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {outcome !== "No Answer" && outcome !== "Busy" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Next action {isActiveLead && <span className="text-red-600">*</span>}</label>
                  <Input className="mt-1" value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="e.g. Send ROI sheet" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Due {(isActiveLead || needsDateTime) && <span className="text-red-600">*</span>}
                  </label>
                  <Input
                    type="datetime-local" className="mt-1" value={nextDue}
                    min={toLocalInput(new Date())}
                    onChange={(e) => setNextDue(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(outcome === "No Answer" || outcome === "Busy") && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Another call attempt will be scheduled automatically
                {outcome === "Busy" ? " in 2 hours" : " in 4 hours"} (attempt #{lead.attempts + 2}).
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button className="flex-1" onClick={submit}>Save outcome</Button>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">{title}</div>
      <p className="text-sm">{children}</p>
    </div>
  );
}

export default PriorityCallQueue;
