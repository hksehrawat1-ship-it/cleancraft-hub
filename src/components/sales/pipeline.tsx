import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  KanbanSquare,
  Table2,
  TrendingUp,
  Trophy,
  Wallet,
  XCircle,
  Phone,
  MessageCircle,
  ShieldAlert,
  Activity,
  Target,
  ListChecks,
} from "lucide-react";

/* ------------------------------ stages ------------------------------ */

const STAGES = [
  "New Lead",
  "Attempting Contact",
  "Contacted",
  "Qualified",
  "Meeting Scheduled",
  "Meeting Completed",
  "Proposal Sent",
  "Negotiation",
  "Payment Pending",
  "Won",
  "Lost",
] as const;
type Stage = (typeof STAGES)[number];

const PROBABILITY: Record<Stage, number> = {
  "New Lead": 5,
  "Attempting Contact": 10,
  Contacted: 15,
  Qualified: 30,
  "Meeting Scheduled": 40,
  "Meeting Completed": 50,
  "Proposal Sent": 65,
  Negotiation: 75,
  "Payment Pending": 90,
  Won: 100,
  Lost: 0,
};

/** Max permitted days in stage before a card is flagged as stalled. */
const STAGE_SLA_DAYS: Record<Stage, number> = {
  "New Lead": 1,
  "Attempting Contact": 2,
  Contacted: 4,
  Qualified: 6,
  "Meeting Scheduled": 5,
  "Meeting Completed": 4,
  "Proposal Sent": 7,
  Negotiation: 10,
  "Payment Pending": 7,
  Won: 999,
  Lost: 999,
};

const STAGE_ACCENT: Record<Stage, string> = {
  "New Lead": "bg-slate-100 text-slate-700 border-slate-200",
  "Attempting Contact": "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-sky-100 text-sky-700 border-sky-200",
  Qualified: "bg-sky-100 text-sky-700 border-sky-200",
  "Meeting Scheduled": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Meeting Completed": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Proposal Sent": "bg-amber-100 text-amber-700 border-amber-200",
  Negotiation: "bg-amber-100 text-amber-700 border-amber-200",
  "Payment Pending": "bg-orange-100 text-orange-700 border-orange-200",
  Won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Lost: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
type Priority = (typeof PRIORITIES)[number];
const PRIORITY_STYLE: Record<Priority, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const UNITS = ["Franchise", "Laundry Services", "Dry Clean"] as const;
const OWNERS = ["Rahul Mehta", "Priya Sharma", "Amit Verma", "Sneha Kulkarni"] as const;
const SOURCES = ["Website", "Meta Ads", "Google Ads", "Referral", "Walk-in", "IndiaMART"] as const;
const CAMPAIGNS = [
  "Franchise Expansion Q3",
  "City Launch — Tier 2",
  "Referral Drive",
  "Brand Search",
  "None",
] as const;
const LOSS_REASONS = [
  "Budget too low",
  "Chose competitor",
  "Location unavailable",
  "Not the decision maker",
  "Timeline too far",
  "Unresponsive",
  "Not interested anymore",
  "Duplicate enquiry",
] as const;

/* ------------------------------ types ------------------------------ */

type StageEvent = { at: string; from: Stage | "—"; to: Stage; user: string; note?: string };
type TimelineItem = {
  at: string;
  kind: "Call" | "Reminder" | "Meeting" | "Task" | "Note" | "Stage";
  text: string;
};

type Opportunity = {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  unit: string;
  source: string;
  campaign: string;
  owner: string;
  stage: Stage;
  score: number;
  scoreReasons: string[];
  priority: Priority;
  stageSince: string;
  lastInteraction: string;
  nextAction: string;
  followupDue: string | null;
  qualification: {
    timeline: string;
    decisionMaker: string;
    preference: string;
  } | null;
  meeting: { at: string; mode: string; confirmed: boolean } | null;
  proposal: { sentAt: string } | null;
  expectedCloseDate: string | null;
  payment: { expectedAt: string; status: "Pending" | "Received" } | null;
  lossReason?: string;
  stageHistory: StageEvent[];
  timeline: TimelineItem[];
};

/* ------------------------------ helpers ------------------------------ */

const ME = "Rahul Mehta";

function daysAgoISO(d: number) {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x.toISOString();
}
function daysAheadISO(d: number) {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString();
}
function dateOnly(d: number) {
  return daysAheadISO(d).slice(0, 10);
}
function fmtDate(s?: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
function fmtDateTime(s: string) {
  const d = new Date(s);
  return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function daysBetween(a: string, b = new Date().toISOString()) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function daysInStage(o: Opportunity) {
  return Math.max(0, daysBetween(o.stageSince));
}
function isOverdue(o: Opportunity) {
  return !!o.followupDue && new Date(o.followupDue).getTime() < Date.now() && !isClosed(o.stage);
}
function isStalled(o: Opportunity) {
  return !isClosed(o.stage) && daysInStage(o) > STAGE_SLA_DAYS[o.stage];
}
function isClosed(s: Stage) {
  return s === "Won" || s === "Lost";
}
function noNextAction(o: Opportunity) {
  return !isClosed(o.stage) && !o.nextAction.trim();
}
function isStaleHighValue(o: Opportunity) {
  return !isClosed(o.stage) && (o.priority === "Urgent" || o.priority === "High") && daysBetween(o.lastInteraction) >= 7;
}
function thisMonth(s?: string | null) {
  if (!s) return false;
  const d = new Date(s);
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}
function monthKey(s?: string | null) {
  return s ? s.slice(0, 7) : "";
}

/* ------------------------------ sample data ------------------------------ */

function mk(
  i: number,
  name: string,
  city: string,
  state: string,
  stage: Stage,
  score: number,
  priority: Priority,
  opts: Partial<Opportunity> = {},
): Opportunity {
  const stageSince = opts.stageSince ?? daysAgoISO(2 + (i % 9));
  return {
    id: `opp-${i}`,
    leadId: `CC-L${1000 + i}`,
    name,
    phone: `+9198${String(10000000 + i * 137).slice(0, 8)}`,
    city,
    state,
    unit: UNITS[i % UNITS.length],
    source: SOURCES[i % SOURCES.length],
    campaign: CAMPAIGNS[i % CAMPAIGNS.length],
    owner: OWNERS[i % OWNERS.length],
    stage,
    score,
    scoreReasons: [
      score >= 75 ? "Budget confirmed" : "Budget not confirmed",
      i % 2 ? "Replied within 1 hour" : "Slow to respond",
      i % 3 ? "Tier-2 city with no existing store" : "City already served",
    ],
    priority,
    stageSince,
    lastInteraction: daysAgoISO(1 + (i % 10)),
    nextAction: "Follow-up call",
    followupDue: dateOnly((i % 5) - 2),
    qualification: null,
    meeting: null,
    proposal: null,
    expectedCloseDate: dateOnly(5 + (i % 40)),
    payment: null,
    stageHistory: [{ at: stageSince, from: "—", to: stage, user: ME, note: "Imported from CRM" }],
    timeline: [
      {
        at: daysAgoISO(1 + (i % 10)),
        kind: "Call",
        text: "Discussed investment range and ROI expectations.",
      },
      {
        at: daysAgoISO(4 + (i % 6)),
        kind: "Note",
        text: "Prefers a high-street location near a residential belt.",
      },
    ],
    ...opts,
  };
}

const QUAL = {
  timeline: "Within 60 days",
  decisionMaker: "Yes — self",
  preference: "High street",
};

function seed(): Opportunity[] {
  return [
    mk(1, "Rakesh Agarwal", "Jaipur", "Rajasthan", "New Lead", 62, "High", {
      nextAction: "First call",
      followupDue: dateOnly(0),
    }),
    mk(2, "Neha Bhatia", "Indore", "Madhya Pradesh", "New Lead", 48, "Medium", {
      nextAction: "",
      followupDue: dateOnly(1),
    }),
    mk(3, "Sandeep Rao", "Nagpur", "Maharashtra", "Attempting Contact", 55, "High", {
      nextAction: "Retry call (3rd attempt)",
      followupDue: dateOnly(-1),
    }),
    mk(4, "Vikram Singh", "Lucknow", "Uttar Pradesh", "Attempting Contact", 41, "Low", {
      nextAction: "WhatsApp intro",
      followupDue: dateOnly(2),
    }),
    mk(5, "Farhan Qureshi", "Surat", "Gujarat", "Contacted", 68, "High", {
      nextAction: "Send brochure",
      followupDue: dateOnly(0),
    }),
    mk(6, "Deepa Nair", "Kochi", "Kerala", "Contacted", 58, "Medium", {
      nextAction: "Qualification call",
      followupDue: dateOnly(3),
    }),
    mk(7, "Arvind Kulkarni", "Pune", "Maharashtra", "Qualified", 81, "Urgent", {
      qualification: QUAL,
      nextAction: "Fix meeting slot",
      followupDue: dateOnly(-2),
    }),
    mk(8, "Shalini Gupta", "Bhopal", "Madhya Pradesh", "Qualified", 76, "High", {
      qualification: QUAL,
      nextAction: "Share location checklist",
      followupDue: dateOnly(1),
    }),
    mk(9, "Mohit Jain", "Ahmedabad", "Gujarat", "Meeting Scheduled", 84, "Urgent", {
      qualification: QUAL,
      meeting: { at: daysAheadISO(1), mode: "Google Meet", confirmed: false },
      nextAction: "Confirm meeting",
      followupDue: dateOnly(0),
    }),
    mk(10, "Priyanka Desai", "Vadodara", "Gujarat", "Meeting Scheduled", 79, "High", {
      qualification: QUAL,
      meeting: { at: daysAheadISO(3), mode: "Store Visit", confirmed: true },
      nextAction: "Send location pin",
      followupDue: dateOnly(2),
    }),
    mk(11, "Harish Menon", "Coimbatore", "Tamil Nadu", "Meeting Completed", 82, "High", {
      qualification: QUAL,
      meeting: { at: daysAgoISO(3), mode: "Store Visit", confirmed: true },
      nextAction: "Prepare proposal",
      followupDue: dateOnly(-3),
      stageSince: daysAgoISO(9),
    }),
    mk(12, "Kavita Sharma", "Kanpur", "Uttar Pradesh", "Proposal Sent", 86, "Urgent", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(5) },
      nextAction: "Proposal follow-up",
      followupDue: dateOnly(0),
    }),
    mk(13, "Rohit Malhotra", "Ludhiana", "Punjab", "Proposal Sent", 74, "High", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(12) },
      nextAction: "",
      followupDue: dateOnly(-4),
      stageSince: daysAgoISO(12),
      lastInteraction: daysAgoISO(11),
    }),
    mk(14, "Sunil Patil", "Nashik", "Maharashtra", "Negotiation", 89, "Urgent", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(16) },
      expectedCloseDate: dateOnly(6),
      nextAction: "Discuss royalty terms",
      followupDue: dateOnly(1),
    }),
    mk(15, "Anita Reddy", "Vijayawada", "Andhra Pradesh", "Negotiation", 83, "High", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(20) },
      expectedCloseDate: dateOnly(12),
      nextAction: "Send revised quote",
      followupDue: dateOnly(-1),
      stageSince: daysAgoISO(14),
    }),
    mk(16, "Gaurav Tiwari", "Patna", "Bihar", "Payment Pending", 92, "Urgent", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(24) },
      expectedCloseDate: dateOnly(4),
      payment: { expectedAt: dateOnly(2), status: "Pending" },
      nextAction: "Payment follow-up",
      followupDue: dateOnly(0),
    }),
    mk(17, "Meera Iyer", "Mysuru", "Karnataka", "Payment Pending", 88, "High", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(28) },
      expectedCloseDate: dateOnly(9),
      payment: { expectedAt: dateOnly(5), status: "Pending" },
      nextAction: "Share payment link",
      followupDue: dateOnly(3),
    }),
    mk(18, "Ajay Chauhan", "Jodhpur", "Rajasthan", "Won", 95, "High", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(34) },
      payment: { expectedAt: dateOnly(-6), status: "Received" },
      nextAction: "Handover to Project Coordinator",
      followupDue: null,
      expectedCloseDate: dateOnly(-4),
      stageSince: daysAgoISO(4),
    }),
    mk(19, "Swati Kapoor", "Raipur", "Chhattisgarh", "Won", 91, "Medium", {
      qualification: QUAL,
      proposal: { sentAt: daysAgoISO(40) },
      payment: { expectedAt: dateOnly(-11), status: "Received" },
      nextAction: "Handover to Project Coordinator",
      followupDue: null,
      expectedCloseDate: dateOnly(-9),
      stageSince: daysAgoISO(9),
    }),
    mk(20, "Imran Shaikh", "Aurangabad", "Maharashtra", "Lost", 44, "Low", {
      lossReason: "Budget too low",
      nextAction: "",
      followupDue: null,
      stageSince: daysAgoISO(6),
    }),
  ];
}

/* ------------------------------ page ------------------------------ */

type ViewMode = "kanban" | "table" | "forecast";

export function SalesPipeline() {
  const [opps, setOpps] = useState<Opportunity[]>(seed);
  const [mode, setMode] = useState<ViewMode>("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [move, setMove] = useState<{ id: string; to: Stage } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const [f, setF] = useState({
    unit: "all",
    owner: "all",
    source: "all",
    campaign: "all",
    city: "all",
    priority: "all",
    score: "all",
    closeMonth: "all",
    stage: "all",
    q: "",
  });

  const cities = useMemo(() => Array.from(new Set(seed().map((o) => o.city))).sort(), []);
  const closeMonths = useMemo(
    () =>
      Array.from(new Set(opps.map((o) => monthKey(o.expectedCloseDate)).filter(Boolean))).sort(),
    [opps],
  );

  const filtered = useMemo(
    () =>
      opps.filter((o) => {
        if (f.unit !== "all" && o.unit !== f.unit) return false;
        if (f.owner !== "all" && o.owner !== f.owner) return false;
        if (f.source !== "all" && o.source !== f.source) return false;
        if (f.campaign !== "all" && o.campaign !== f.campaign) return false;
        if (f.city !== "all" && o.city !== f.city) return false;
        if (f.priority !== "all" && o.priority !== f.priority) return false;
        if (f.stage !== "all" && o.stage !== f.stage) return false;
        if (f.score === "high" && o.score < 80) return false;
        if (f.score === "mid" && (o.score < 50 || o.score >= 80)) return false;
        if (f.score === "low" && o.score >= 50) return false;
        if (f.closeMonth !== "all" && monthKey(o.expectedCloseDate) !== f.closeMonth) return false;
        if (f.q.trim()) {
          const q = f.q.toLowerCase();
          if (!`${o.name} ${o.leadId} ${o.city} ${o.phone}`.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [opps, f],
  );

  const active = filtered.filter((o) => !isClosed(o.stage));
  const weightedConversions = active.reduce((s, o) => s + PROBABILITY[o.stage] / 100, 0);
  const closuresThisMonth = active.filter((o) => thisMonth(o.expectedCloseDate)).length;
  const wonThisMonth = filtered.filter((o) => o.stage === "Won" && thisMonth(o.stageSince)).length;

  const detail = opps.find((o) => o.id === detailId) ?? null;

  function applyMove(id: string, to: Stage, patch: Partial<Opportunity>, note: string) {
    setOpps((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const now = new Date().toISOString();
        const next: Opportunity = {
          ...o,
          ...patch,
          stage: to,
          stageSince: now,
          followupDue: isClosed(to) ? null : (patch.followupDue ?? o.followupDue),
          stageHistory: [{ at: now, from: o.stage, to, user: ME, note }, ...o.stageHistory],
          timeline: [
            {
              at: now,
              kind: "Stage",
              text: `Stage moved ${o.stage} → ${to}${note ? ` · ${note}` : ""}`,
            },
            ...o.timeline,
          ],
        };
        if (!isClosed(to) && !next.nextAction.trim()) {
          toast.warning(`${o.name} has no next action — add one to keep it in the work queues.`);
        }
        return next;
      }),
    );
    const o = opps.find((x) => x.id === id)!;
    toast.success(`${o.name} moved to ${to}`);
    if (isClosed(to)) toast.info(`${o.name} removed from Call Queue, Follow-ups and Meetings`);
    else toast.info("Synced to Dashboard, Performance and Follow-ups & Reminders");
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Sales Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Every opportunity, its stage, value and likelihood of conversion.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border p-0.5">
            {(
              [
                ["kanban", "Kanban", KanbanSquare],
                ["table", "Table", Table2],
                ["forecast", "Forecast", TrendingUp],
              ] as const
            ).map(([k, label, Icon]) => (
              <Button
                key={k}
                size="sm"
                variant={mode === k ? "default" : "ghost"}
                className="h-8"
                onClick={() => setMode(k as ViewMode)}
              >
                <Icon className="w-4 h-4 mr-1" /> {label}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="w-4 h-4 mr-1" /> Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat icon={Target} label="Active opportunities" value={String(active.length)} />
        <Stat icon={Wallet} label="Pipeline value" value={inr(totalValue)} />
        <Stat
          icon={Activity}
          label="Weighted value (est.)"
          value={inr(Math.round(weighted))}
          hint="Estimate"
        />
        <Stat
          icon={CalendarClock}
          label="Expected closures (this month)"
          value={String(closuresThisMonth)}
        />
        <Stat
          icon={Trophy}
          label="Won revenue (this month)"
          value={inr(wonRevenue)}
          tone="emerald"
        />
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <Input
              placeholder="Search name / lead ID / city"
              value={f.q}
              onChange={(e) => setF({ ...f, q: e.target.value })}
              className="col-span-2"
            />
            <Pick
              label="Business unit"
              value={f.unit}
              onChange={(v) => setF({ ...f, unit: v })}
              options={UNITS as unknown as string[]}
            />
            <Pick
              label="Salesperson"
              value={f.owner}
              onChange={(v) => setF({ ...f, owner: v })}
              options={OWNERS as unknown as string[]}
            />
            <Pick
              label="Lead source"
              value={f.source}
              onChange={(v) => setF({ ...f, source: v })}
              options={SOURCES as unknown as string[]}
            />
            <Pick
              label="Campaign"
              value={f.campaign}
              onChange={(v) => setF({ ...f, campaign: v })}
              options={CAMPAIGNS as unknown as string[]}
            />
            <Pick
              label="City / state"
              value={f.city}
              onChange={(v) => setF({ ...f, city: v })}
              options={cities}
            />
            <Pick
              label="Priority"
              value={f.priority}
              onChange={(v) => setF({ ...f, priority: v })}
              options={PRIORITIES as unknown as string[]}
            />
            <Pick
              label="Stage"
              value={f.stage}
              onChange={(v) => setF({ ...f, stage: v })}
              options={STAGES as unknown as string[]}
            />
            <Pick
              label="Lead score"
              value={f.score}
              onChange={(v) => setF({ ...f, score: v })}
              options={[
                { v: "high", l: "80+" },
                { v: "mid", l: "50–79" },
                { v: "low", l: "Below 50" },
              ]}
            />
            <Pick
              label="Opportunity value"
              value={f.value}
              onChange={(v) => setF({ ...f, value: v })}
              options={[
                { v: "gt25", l: "₹25L+" },
                { v: "15to25", l: "₹15L–25L" },
                { v: "lt15", l: "Below ₹15L" },
              ]}
            />
            <Pick
              label="Expected closing month"
              value={f.closeMonth}
              onChange={(v) => setF({ ...f, closeMonth: v })}
              options={closeMonths.map((m) => ({
                v: m,
                l: new Date(`${m}-01`).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                }),
              }))}
            />
          </CardContent>
        </Card>
      )}

      {mode === "kanban" && (
        <KanbanBoard
          opps={filtered}
          all={opps}
          dragId={dragId}
          setDragId={setDragId}
          onOpen={setDetailId}
          onRequestMove={(id, to) => setMove({ id, to })}
        />
      )}
      {mode === "table" && (
        <TableView
          opps={filtered}
          onOpen={setDetailId}
          onRequestMove={(id, to) => setMove({ id, to })}
        />
      )}
      {mode === "forecast" && <ForecastView opps={filtered} />}

      <PipelineHealth opps={filtered} onOpen={setDetailId} />

      <StageChangeDialog
        open={!!move}
        move={move}
        opp={move ? (opps.find((o) => o.id === move.id) ?? null) : null}
        onClose={() => setMove(null)}
        onConfirm={(patch, note) => {
          if (move) applyMove(move.id, move.to, patch, note);
          setMove(null);
        }}
      />

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetailId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">
                  {detail.name} · {detail.leadId}
                </SheetTitle>
              </SheetHeader>
              <DetailBody opp={detail} onRequestMove={(to) => setMove({ id: detail.id, to })} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------ small pieces ------------------------------ */

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  tone?: "emerald";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className={cn("w-4 h-4", tone === "emerald" && "text-emerald-600")} />
          <span className="leading-tight">{label}</span>
        </div>
        <div
          className={cn(
            "text-2xl font-bold mt-1 tabular-nums",
            tone === "emerald" && "text-emerald-700",
          )}
        >
          {value}
        </div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Pick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { v: string; l: string })[];
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.v;
            const l = typeof o === "string" ? o : o.l;
            return (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function Flags({ o }: { o: Opportunity }) {
  const flags: string[] = [];
  if (isOverdue(o)) flags.push("Follow-up overdue");
  if (isStalled(o)) flags.push(`Stalled ${daysInStage(o)}d in stage`);
  if (noNextAction(o)) flags.push("No next action");
  if (isStaleHighValue(o)) flags.push("High value · no recent activity");
  if (o.meeting && !o.meeting.confirmed) flags.push("Meeting unconfirmed");
  if (!flags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 text-[11px] rounded border border-red-200 bg-red-50 text-red-700 px-1.5 py-0.5"
        >
          <AlertTriangle className="w-3 h-3" /> {t}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------ kanban ------------------------------ */

function KanbanBoard({
  opps,
  all,
  dragId,
  setDragId,
  onOpen,
  onRequestMove,
}: {
  opps: Opportunity[];
  all: Opportunity[];
  dragId: string | null;
  setDragId: (v: string | null) => void;
  onOpen: (id: string) => void;
  onRequestMove: (id: string, to: Stage) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {STAGES.map((stage) => {
          const items = opps.filter((o) => o.stage === stage);
          const value = items.reduce((s, o) => s + o.value, 0);
          // Conversion rate = share of all opportunities that reached this stage or beyond.
          const idx = STAGES.indexOf(stage);
          const reached = all.filter(
            (o) => STAGES.indexOf(o.stage) >= idx && o.stage !== "Lost",
          ).length;
          const conv = all.length ? Math.round((reached / all.length) * 100) : 0;
          const avgDays = items.length
            ? Math.round(items.reduce((s, o) => s + daysInStage(o), 0) / items.length)
            : 0;
          return (
            <div
              key={stage}
              className="w-[268px] shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  const o = opps.find((x) => x.id === dragId);
                  if (o && o.stage !== stage) onRequestMove(dragId, stage);
                }
                setDragId(null);
              }}
            >
              <div className="rounded-xl border bg-muted/30 p-2 space-y-2">
                <div className="px-1 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={cn("font-medium", STAGE_ACCENT[stage])}>
                      {stage}
                    </Badge>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-3 gap-1 text-[11px] text-muted-foreground">
                    <div>
                      <div className="font-semibold text-foreground tabular-nums">{inr(value)}</div>
                      value
                    </div>
                    <div>
                      <div className="font-semibold text-foreground tabular-nums">{conv}%</div>
                      reached
                    </div>
                    <div>
                      <div className="font-semibold text-foreground tabular-nums">{avgDays}d</div>
                      avg in stage
                    </div>
                  </div>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  {items.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground px-1 py-4 text-center">
                      No opportunities
                    </div>
                  ) : (
                    items.map((o) => (
                      <OppCard
                        key={o.id}
                        o={o}
                        onOpen={onOpen}
                        onRequestMove={onRequestMove}
                        setDragId={setDragId}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OppCard({
  o,
  onOpen,
  onRequestMove,
  setDragId,
}: {
  o: Opportunity;
  onOpen: (id: string) => void;
  onRequestMove: (id: string, to: Stage) => void;
  setDragId: (v: string | null) => void;
}) {
  const warn = isOverdue(o) || isStalled(o) || noNextAction(o) || isStaleHighValue(o);
  return (
    <div
      draggable
      onDragStart={() => setDragId(o.id)}
      onDragEnd={() => setDragId(null)}
      className={cn(
        "rounded-lg border bg-background p-2.5 space-y-2 cursor-grab active:cursor-grabbing shadow-sm",
        warn ? "border-red-200" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{o.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {o.leadId} · {o.city}
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px]", PRIORITY_STYLE[o.priority])}>
          {o.priority}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold tabular-nums">{inr(o.value)}</span>
        <span className="text-muted-foreground">Score {o.score}</span>
      </div>

      <div className="text-[11px] text-muted-foreground space-y-0.5">
        <div className="truncate">Owner: {o.owner}</div>
        <div>
          In stage: {daysInStage(o)}d · Last: {fmtDate(o.lastInteraction)}
        </div>
        <div className="truncate">Next: {o.nextAction || "—"}</div>
        <div>Due: {fmtDate(o.followupDue)}</div>
      </div>

      <Flags o={o} />

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px]"
          onClick={() => onOpen(o.id)}
        >
          <Eye className="w-3 h-3 mr-1" /> Open
        </Button>
        <div className="flex-1 md:hidden">
          <Select value="" onValueChange={(v) => onRequestMove(o.id, v as Stage)}>
            <SelectTrigger className="h-7 text-[11px]">
              <SelectValue placeholder="Move stage" />
            </SelectTrigger>
            <SelectContent>
              {STAGES.filter((s) => s !== o.stage).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ table ------------------------------ */

function TableView({
  opps,
  onOpen,
  onRequestMove,
}: {
  opps: Opportunity[];
  onOpen: (id: string) => void;
  onRequestMove: (id: string, to: Stage) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              {[
                "Lead",
                "City",
                "Stage",
                "Value",
                "Weighted",
                "Score",
                "Priority",
                "Owner",
                "In stage",
                "Next action",
                "Due",
                "",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opps.map((o) => (
              <tr key={o.id} className={cn("border-t", isOverdue(o) && "bg-red-50/50")}>
                <td className="px-3 py-2">
                  <div className="font-medium">{o.name}</div>
                  <div className="text-[11px] text-muted-foreground">{o.leadId}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{o.city}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className={cn("text-[10px]", STAGE_ACCENT[o.stage])}>
                    {o.stage}
                  </Badge>
                </td>
                <td className="px-3 py-2 tabular-nums">{inr(o.value)}</td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">
                  {inr(Math.round((o.value * PROBABILITY[o.stage]) / 100))}
                </td>
                <td className="px-3 py-2 tabular-nums">{o.score}</td>
                <td className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", PRIORITY_STYLE[o.priority])}
                  >
                    {o.priority}
                  </Badge>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{o.owner}</td>
                <td className="px-3 py-2 tabular-nums">{daysInStage(o)}d</td>
                <td className="px-3 py-2">
                  {o.nextAction || <span className="text-red-600">No next action</span>}
                </td>
                <td
                  className={cn(
                    "px-3 py-2 whitespace-nowrap",
                    isOverdue(o) && "text-red-600 font-medium",
                  )}
                >
                  {fmtDate(o.followupDue)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => onOpen(o.id)}
                    >
                      Open
                    </Button>
                    <Select value="" onValueChange={(v) => onRequestMove(o.id, v as Stage)}>
                      <SelectTrigger className="h-7 w-[130px] text-[11px]">
                        <SelectValue placeholder="Change stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.filter((s) => s !== o.stage).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ forecast ------------------------------ */

function ForecastView({ opps }: { opps: Opportunity[] }) {
  const active = opps.filter((o) => !isClosed(o.stage));
  const rows = STAGES.filter((s) => !isClosed(s)).map((s) => {
    const items = active.filter((o) => o.stage === s);
    const value = items.reduce((a, o) => a + o.value, 0);
    return { stage: s, count: items.length, value, weighted: (value * PROBABILITY[s]) / 100 };
  });
  const totalW = rows.reduce((a, r) => a + r.weighted, 0);
  const byMonth = new Map<string, { value: number; weighted: number; count: number }>();
  active.forEach((o) => {
    const k = monthKey(o.expectedCloseDate) || "Unscheduled";
    const cur = byMonth.get(k) ?? { value: 0, weighted: 0, count: 0 };
    cur.value += o.value;
    cur.weighted += (o.value * PROBABILITY[o.stage]) / 100;
    cur.count += 1;
    byMonth.set(k, cur);
  });
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Weighted forecast by stage</div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Estimate only
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Weighted value = opportunity value × stage probability. Probabilities are configurable
            defaults, not commitments.
          </p>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.stage} className="flex items-center gap-3">
                <div className="w-40 text-xs truncate">
                  {r.stage} <span className="text-muted-foreground">({PROBABILITY[r.stage]}%)</span>
                </div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full"
                    style={{ width: `${(r.value / max) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-xs tabular-nums text-right">{r.count} opp</div>
                <div className="w-20 text-xs tabular-nums text-right">{inr(r.value)}</div>
                <div className="w-20 text-xs tabular-nums text-right font-semibold">
                  {inr(Math.round(r.weighted))}
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total weighted pipeline (estimate)</span>
            <span className="font-semibold tabular-nums">{inr(Math.round(totalW))}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-medium">Expected closures by month</div>
          <div className="space-y-2">
            {Array.from(byMonth.entries())
              .sort()
              .map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0"
                >
                  <span>
                    {k === "Unscheduled"
                      ? "Unscheduled"
                      : new Date(`${k}-01`).toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {v.count} opp · {inr(v.value)} · weighted{" "}
                    <span className="font-semibold text-foreground">
                      {inr(Math.round(v.weighted))}
                    </span>
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------ pipeline health ------------------------------ */

function PipelineHealth({ opps, onOpen }: { opps: Opportunity[]; onOpen: (id: string) => void }) {
  const groups: { title: string; icon: any; items: Opportunity[]; tone: string }[] = [
    {
      title: "Overdue follow-ups",
      icon: AlertTriangle,
      tone: "text-red-600",
      items: opps.filter(isOverdue),
    },
    {
      title: "No next action",
      icon: ListChecks,
      tone: "text-red-600",
      items: opps.filter(noNextAction),
    },
    {
      title: "Stalled beyond stage limit",
      icon: Clock,
      tone: "text-orange-600",
      items: opps.filter(isStalled),
    },
    {
      title: "High value · no recent activity",
      icon: ShieldAlert,
      tone: "text-orange-600",
      items: opps.filter(isStaleHighValue),
    },
    {
      title: "Payment pending",
      icon: Wallet,
      tone: "text-amber-600",
      items: opps.filter((o) => o.stage === "Payment Pending"),
    },
    {
      title: "Meetings needing confirmation",
      icon: CalendarClock,
      tone: "text-indigo-600",
      items: opps.filter((o) => o.meeting && !o.meeting.confirmed),
    },
  ];
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="font-medium">Pipeline health</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <g.icon className={cn("w-4 h-4", g.tone)} /> {g.title}
                </div>
                <Badge variant="outline" className="tabular-nums">
                  {g.items.length}
                </Badge>
              </div>
              {g.items.length === 0 ? (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> All clear
                </div>
              ) : (
                <div className="space-y-1">
                  {g.items.slice(0, 4).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => onOpen(o.id)}
                      className="w-full text-left text-xs flex items-center justify-between hover:underline"
                    >
                      <span className="truncate">
                        {o.name} · {o.city}
                      </span>
                      <span className="text-muted-foreground tabular-nums ml-2">
                        {inr(o.value)}
                      </span>
                    </button>
                  ))}
                  {g.items.length > 4 && (
                    <div className="text-[11px] text-muted-foreground">
                      +{g.items.length - 4} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ stage change ------------------------------ */

function StageChangeDialog({
  open,
  move,
  opp,
  onClose,
  onConfirm,
}: {
  open: boolean;
  move: { id: string; to: Stage } | null;
  opp: Opportunity | null;
  onClose: () => void;
  onConfirm: (patch: Partial<Opportunity>, note: string) => void;
}) {
  const to = move?.to;
  const [note, setNote] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [dm, setDm] = useState("");
  const [pref, setPref] = useState("");
  const [meetAt, setMeetAt] = useState("");
  const [meetMode, setMeetMode] = useState("Google Meet");
  const [proposalValue, setProposalValue] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [lossReason, setLossReason] = useState("");

  // Reset when a new move starts.
  const key = `${move?.id}-${move?.to}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setNote("");
    setBudget("");
    setTimeline("");
    setDm("");
    setPref("");
    setMeetAt("");
    setMeetMode("Google Meet");
    setProposalValue("");
    setCloseDate("");
    setPayAmount("");
    setPayDate("");
    setFinalAmount("");
    setLossReason("");
  }

  if (!open || !to || !opp) return null;

  const noteRequired: Stage[] = [
    "Qualified",
    "Proposal Sent",
    "Negotiation",
    "Payment Pending",
    "Won",
    "Lost",
  ];

  function submit() {
    const patch: Partial<Opportunity> = {};
    if (noteRequired.includes(to!) && note.trim().length < 5)
      return toast.error("Notes are required for this stage change");

    if (to === "Qualified") {
      if (!budget || !timeline || !dm || !pref)
        return toast.error("Complete all qualification details");
      patch.qualification = { budget, timeline, decisionMaker: dm, preference: pref };
    }
    if (to === "Meeting Scheduled") {
      if (!meetAt) return toast.error("Meeting date and time are required");
      patch.meeting = { at: new Date(meetAt).toISOString(), mode: meetMode, confirmed: false };
      patch.nextAction = "Confirm meeting";
      patch.followupDue = meetAt.slice(0, 10);
    }
    if (to === "Proposal Sent") {
      if (!proposalValue) return toast.error("Proposal value is required");
      patch.proposal = { value: Number(proposalValue), sentAt: new Date().toISOString() };
      patch.value = Number(proposalValue);
      patch.nextAction = "Proposal follow-up";
    }
    if (to === "Negotiation") {
      if (!closeDate) return toast.error("Expected closing date is required");
      patch.expectedCloseDate = closeDate;
    }
    if (to === "Payment Pending") {
      if (!payAmount || !payDate)
        return toast.error("Payment amount and expected date are required");
      patch.payment = { amount: Number(payAmount), expectedAt: payDate, status: "Pending" };
      patch.nextAction = "Payment follow-up";
      patch.followupDue = payDate;
    }
    if (to === "Won") {
      if (!finalAmount) return toast.error("Final amount is required to mark Won");
      patch.finalAmount = Number(finalAmount);
      patch.value = Number(finalAmount);
      patch.nextAction = "Handover to Project Coordinator";
      if (opp!.payment) patch.payment = { ...opp!.payment, status: "Received" };
    }
    if (to === "Lost") {
      if (!lossReason) return toast.error("Select a standardised loss reason");
      patch.lossReason = lossReason;
      patch.nextAction = "";
    }
    onConfirm(patch, note.trim());
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {opp.stage} <ArrowRight className="w-4 h-4" /> {to}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground -mt-2">
          {opp.name} · {opp.leadId} · {opp.city}
        </div>

        <div className="space-y-3">
          {to === "Qualified" && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Budget range">
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="₹18L – ₹25L"
                />
              </Field>
              <Field label="Timeline">
                <Input
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="Within 60 days"
                />
              </Field>
              <Field label="Decision maker">
                <Input
                  value={dm}
                  onChange={(e) => setDm(e.target.value)}
                  placeholder="Yes — self"
                />
              </Field>
              <Field label="Location preference">
                <Input
                  value={pref}
                  onChange={(e) => setPref(e.target.value)}
                  placeholder="High street"
                />
              </Field>
            </div>
          )}
          {to === "Meeting Scheduled" && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Meeting date & time">
                <Input
                  type="datetime-local"
                  value={meetAt}
                  onChange={(e) => setMeetAt(e.target.value)}
                />
              </Field>
              <Field label="Mode">
                <Select value={meetMode} onValueChange={setMeetMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Google Meet", "Store Visit", "Office Visit", "Phone"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
          {to === "Proposal Sent" && (
            <Field label="Proposal value (₹)">
              <Input
                type="number"
                value={proposalValue}
                onChange={(e) => setProposalValue(e.target.value)}
                placeholder="2500000"
              />
            </Field>
          )}
          {to === "Negotiation" && (
            <Field label="Expected closing date">
              <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
            </Field>
          )}
          {to === "Payment Pending" && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Payment amount (₹)">
                <Input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </Field>
              <Field label="Expected payment date">
                <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
              </Field>
            </div>
          )}
          {to === "Won" && (
            <Field label="Final amount (₹)">
              <Input
                type="number"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                placeholder="3000000"
              />
            </Field>
          )}
          {to === "Lost" && (
            <Field label="Loss reason">
              <Select value={lossReason} onValueChange={setLossReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {LOSS_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field label={`Notes${noteRequired.includes(to) ? " (required)" : " (optional)"}`}>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What changed and why?"
            />
          </Field>

          {noNextAction(opp) && !isClosed(to) && (
            <div className="text-xs rounded border border-amber-200 bg-amber-50 text-amber-800 px-2 py-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> This lead has no next action set.
            </div>
          )}
          <div className="text-[11px] text-muted-foreground">
            Old stage, new stage, user and timestamp are recorded automatically.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Confirm move</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}

/* ------------------------------ detail drawer ------------------------------ */

function DetailBody({
  opp: o,
  onRequestMove,
}: {
  opp: Opportunity;
  onRequestMove: (to: Stage) => void;
}) {
  const nba = useMemo(() => {
    if (o.stage === "Lost") return "Archive and nurture after 90 days.";
    if (o.stage === "Won") return "Handover to Project Coordinator and confirm documentation.";
    if (isOverdue(o)) return `Call now — follow-up was due ${fmtDate(o.followupDue)}.`;
    if (o.meeting && !o.meeting.confirmed)
      return "Confirm the scheduled meeting over call and WhatsApp.";
    if (o.stage === "Payment Pending")
      return "Follow up on the pending payment and share the receipt format.";
    if (o.stage === "Proposal Sent") return "Walk through the proposal and handle objections.";
    if (!o.nextAction) return "Set a next action so this opportunity stays in the work queues.";
    return `Proceed with: ${o.nextAction}.`;
  }, [o]);

  return (
    <div className="mt-4 space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn(STAGE_ACCENT[o.stage])}>
          {o.stage}
        </Badge>
        <Badge variant="outline" className={cn(PRIORITY_STYLE[o.priority])}>
          {o.priority}
        </Badge>
        <Badge variant="outline">Score {o.score}</Badge>
        <Badge variant="outline">{PROBABILITY[o.stage]}% probability</Badge>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="text-xs font-medium text-muted-foreground mb-1">Next Best Action</div>
        <div>{nba}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`tel:${o.phone}`}>
          <Button size="sm" variant="outline">
            <Phone className="w-4 h-4 mr-1" /> Call
          </Button>
        </a>
        <a href={`https://wa.me/${o.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline">
            <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
          </Button>
        </a>
        <Select value="" onValueChange={(v) => onRequestMove(v as Stage)}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Change stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.filter((s) => s !== o.stage).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onRequestMove("Won")}
        >
          <Trophy className="w-4 h-4 mr-1" /> Mark Won
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200"
          onClick={() => onRequestMove("Lost")}
        >
          <XCircle className="w-4 h-4 mr-1" /> Mark Lost
        </Button>
      </div>

      <Flags o={o} />

      <Block title="Contact & qualification">
        <KV k="Phone" v={o.phone} />
        <KV k="City / state" v={`${o.city}, ${o.state}`} />
        <KV k="Business unit" v={o.unit} />
        <KV k="Source" v={o.source} />
        <KV k="Campaign" v={o.campaign} />
        <KV k="Assigned to" v={o.owner} />
        <KV k="Budget" v={o.qualification?.budget} />
        <KV k="Timeline" v={o.qualification?.timeline} />
        <KV k="Decision maker" v={o.qualification?.decisionMaker} />
        <KV k="Preference" v={o.qualification?.preference} />
      </Block>

      <Block title="Opportunity & score">
        <KV k="Opportunity value" v={inr(o.value)} />
        <KV k="Weighted value (est.)" v={inr(Math.round((o.value * PROBABILITY[o.stage]) / 100))} />
        <KV k="Expected closing" v={fmtDate(o.expectedCloseDate)} />
        <KV k="Lead score" v={`${o.score}/100`} />
        <div className="pt-1 space-y-1">
          {o.scoreReasons.map((r) => (
            <div key={r} className="text-xs text-muted-foreground">
              • {r}
            </div>
          ))}
        </div>
      </Block>

      <Block title="Proposal & payment">
        <KV k="Proposal value" v={o.proposal ? inr(o.proposal.value) : undefined} />
        <KV k="Proposal sent" v={o.proposal ? fmtDate(o.proposal.sentAt) : undefined} />
        <KV k="Payment amount" v={o.payment ? inr(o.payment.amount) : undefined} />
        <KV k="Payment expected" v={o.payment ? fmtDate(o.payment.expectedAt) : undefined} />
        <KV k="Payment status" v={o.payment?.status} />
        <KV k="Final amount" v={o.finalAmount ? inr(o.finalAmount) : undefined} />
        <KV k="Loss reason" v={o.lossReason} />
      </Block>

      <Block title="Meetings, calls, reminders & tasks">
        <KV
          k="Meeting"
          v={o.meeting ? `${fmtDateTime(o.meeting.at)} · ${o.meeting.mode}` : undefined}
        />
        <KV
          k="Meeting confirmed"
          v={o.meeting ? (o.meeting.confirmed ? "Yes" : "No") : undefined}
        />
        <KV k="Next action" v={o.nextAction || undefined} />
        <KV k="Follow-up due" v={fmtDate(o.followupDue)} />
        <KV k="Last interaction" v={fmtDate(o.lastInteraction)} />
      </Block>

      <Block title="Stage history">
        <ol className="space-y-2">
          {o.stageHistory.map((h, i) => (
            <li key={i} className="text-xs">
              <div className="font-medium">
                {h.from} → {h.to}
              </div>
              <div className="text-muted-foreground">
                {fmtDateTime(h.at)} · {h.user}
                {h.note ? ` · ${h.note}` : ""}
              </div>
            </li>
          ))}
        </ol>
      </Block>

      <Block title="Interaction timeline">
        <ol className="relative border-l pl-5 space-y-3">
          {o.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-primary" />
              <div className="text-xs font-medium">{t.kind}</div>
              <div className="text-xs">{t.text}</div>
              <div className="text-[11px] text-muted-foreground">{fmtDateTime(t.at)}</div>
            </li>
          ))}
        </ol>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3 space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        {title}
      </div>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v && v !== "—" ? v : "—"}</span>
    </div>
  );
}
