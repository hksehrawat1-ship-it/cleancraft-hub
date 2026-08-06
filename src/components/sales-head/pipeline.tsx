import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Filter, X, Eye, LayoutGrid, Table2, TrendingUp, BarChart3, AlertTriangle,
  Clock, StickyNote, CheckSquare, UserPlus, CalendarClock, ArrowUpRight, Flag,
} from "lucide-react";

/* --------------------------------- model --------------------------------- */

export const PIPE_STAGES = [
  "New Lead", "Attempting Contact", "Contacted", "Qualified", "Meeting Scheduled",
  "Meeting Completed", "Proposal Sent", "Negotiation", "Payment Pending", "Won", "Lost",
] as const;
export type PipeStage = (typeof PIPE_STAGES)[number];

const STAGE_PROB: Record<PipeStage, number> = {
  "New Lead": 5, "Attempting Contact": 8, "Contacted": 12, "Qualified": 25,
  "Meeting Scheduled": 35, "Meeting Completed": 50, "Proposal Sent": 60,
  "Negotiation": 75, "Payment Pending": 90, "Won": 100, "Lost": 0,
};

/** Maximum allowed days in a stage before an opportunity counts as stalled. */
const STAGE_MAX_DAYS: Record<PipeStage, number> = {
  "New Lead": 1, "Attempting Contact": 2, "Contacted": 4, "Qualified": 7,
  "Meeting Scheduled": 5, "Meeting Completed": 4, "Proposal Sent": 5,
  "Negotiation": 7, "Payment Pending": 3, "Won": 999, "Lost": 999,
};

const STAGE_TONE: Record<PipeStage, string> = {
  "New Lead": "bg-slate-500", "Attempting Contact": "bg-slate-400", "Contacted": "bg-sky-500",
  "Qualified": "bg-indigo-500", "Meeting Scheduled": "bg-violet-500", "Meeting Completed": "bg-purple-500",
  "Proposal Sent": "bg-amber-500", "Negotiation": "bg-orange-500", "Payment Pending": "bg-teal-500",
  "Won": "bg-emerald-500", "Lost": "bg-red-500",
};

type Priority = "Urgent" | "High" | "Medium" | "Low";

export type Opportunity = {
  id: string;
  leadId: string;
  name: string;
  city: string;
  state: string;
  unit: string;
  source: string;
  campaign: string;
  stage: PipeStage;
  priority: Priority;
  score: number;
  owner: string;
  paymentDueAt?: string;
  lostReason?: string;
  stageSince: string;
  lastInteraction: string;
  nextAction: string | null;
  followupAt: string | null;
  expectedCloseAt: string;
  closeDateChanges: number;
  createdAt: string;
  meetingOutcome?: string;
  qualified?: boolean;
  proposalFollowedUpAt?: string | null;
  notes: string[];
  history: { at: string; note: string }[];
};

export const PIPE_EXECUTIVES = ["Rahul Mehta", "Amit Sharma", "Deepak Nair", "Priya Verma", "Sana Khan"];
const UNITS = ["Franchise", "Master Franchise", "Corporate Tie-up"];
const SOURCES = ["Google Ads", "Meta Ads", "Website", "Referral", "Exhibition", "Walk-in"];
const CAMPAIGNS = ["FR-Q3-Search", "FR-Q3-Social", "Expo-Mumbai", "Referral Drive", "Organic"];

const MONTH_TARGET_DEALS = 8; // deals target for the month

/* --------------------------------- helpers -------------------------------- */

const now = Date.now();
const dAgo = (d: number) => new Date(now - d * 86400000).toISOString();
const dAhead = (d: number) => new Date(now + d * 86400000).toISOString();
const hAgo = (h: number) => new Date(now - h * 3600000).toISOString();
/** A date inside the current calendar month, never in the future. */
const thisMonthDay = (day: number) => {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), Math.min(d.getDate(), Math.max(1, day)), 12).toISOString();
};

const daysSince = (iso: string) => Math.max(0, Math.round((now - new Date(iso).getTime()) / 86400000));
const hoursSince = (iso: string) => Math.max(0, Math.round((now - new Date(iso).getTime()) / 3600000));

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const prioTone = (p: Priority) =>
  p === "Urgent" ? "bg-red-500/15 text-red-600 border-red-500/30"
    : p === "High" ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
      : p === "Medium" ? "bg-sky-500/15 text-sky-600 border-sky-500/30"
        : "bg-muted text-muted-foreground border-border";

/* --------------------------------- data ---------------------------------- */

function mk(
  n: number, name: string, city: string, state: string, stage: PipeStage, owner: string,
  score: number, priority: Priority, extra: Partial<Opportunity> = {},
): Opportunity {
  return {
    id: `OPP-${3000 + n}`,
    leadId: `LD-${2200 + n}`,
    name, city, state,
    unit: UNITS[n % UNITS.length],
    source: SOURCES[n % SOURCES.length],
    campaign: CAMPAIGNS[n % CAMPAIGNS.length],
    stage, priority, score, owner,
    stageSince: dAgo((n % 9) + 1),
    lastInteraction: hAgo(((n * 7) % 60) + 2),
    nextAction: "Follow-up call",
    followupAt: dAhead((n % 5) - 1),
    expectedCloseAt: dAhead((n % 26) + 2),
    closeDateChanges: n % 4,
    createdAt: dAgo(((n * 3) % 45) + 5),
    notes: [],
    history: [{ at: dAgo((n % 9) + 1), note: `Moved to ${stage}` }],
    ...extra,
  };
}

const SEED: Opportunity[] = [
  mk(1, "Kavita Joshi", "Nagpur", "Maharashtra", "New Lead", "Sana Khan", 92, "Urgent", { nextAction: null, followupAt: null }),
  mk(2, "Rohit Bansal", "Jaipur", "Rajasthan", "New Lead", "Priya Verma", 71, "High"),
  mk(3, "Tanvi Shah", "Rajkot", "Gujarat", "Attempting Contact", "Amit Sharma", 64, "Medium"),
  mk(4, "Harish Reddy", "Vijayawada", "Andhra Pradesh", "Attempting Contact", "Deepak Nair", 58, "Medium", { nextAction: null }),
  mk(5, "Farhan Ali", "Bhopal", "Madhya Pradesh", "Contacted", "Amit Sharma", 66, "High", { followupAt: dAgo(1) }),
  mk(6, "Divya Menon", "Mysuru", "Karnataka", "Contacted", "Deepak Nair", 55, "Low"),
  mk(7, "Gurpreet Sethi", "Ludhiana", "Punjab", "Qualified", "Sana Khan", 74, "Medium", { qualified: true }),
  mk(8, "Anita Desai", "Nashik", "Maharashtra", "Qualified", "Rahul Mehta", 80, "High", { qualified: true }),
  mk(9, "Meera Iyer", "Kochi", "Kerala", "Meeting Scheduled", "Rahul Mehta", 88, "Urgent", { qualified: true }),
  mk(10, "Sandeep Rao", "Pune", "Maharashtra", "Meeting Scheduled", "Deepak Nair", 69, "Medium", { qualified: true }),
  mk(11, "Vivek Chandra", "Raipur", "Chhattisgarh", "Meeting Completed", "Priya Verma", 77, "High", { qualified: true, meetingOutcome: "Positive — wants ROI sheet" }),
  mk(12, "Shalini Gupta", "Kanpur", "Uttar Pradesh", "Meeting Completed", "Amit Sharma", 62, "Medium", { qualified: true, meetingOutcome: "" }),
  mk(13, "Vikram Singh", "Surat", "Gujarat", "Proposal Sent", "Deepak Nair", 70, "Urgent", { qualified: true, proposalFollowedUpAt: null, lastInteraction: dAgo(5) }),
  mk(14, "Nikhil Prasad", "Patna", "Bihar", "Proposal Sent", "Sana Khan", 73, "High", { qualified: true, proposalFollowedUpAt: hAgo(20) }),
  mk(15, "Neha Agarwal", "Indore", "Madhya Pradesh", "Negotiation", "Amit Sharma", 86, "Urgent", { qualified: true, lastInteraction: hAgo(31), closeDateChanges: 3 }),
  mk(16, "Anil Kulkarni", "Nashik", "Maharashtra", "Negotiation", "Priya Verma", 75, "High", { qualified: true }),
  mk(17, "Imran Qureshi", "Lucknow", "Uttar Pradesh", "Payment Pending", "Rahul Mehta", 90, "Urgent", { qualified: true, paymentDueAt: dAgo(4) }),
  mk(18, "Suresh Pillai", "Coimbatore", "Tamil Nadu", "Payment Pending", "Rahul Mehta", 81, "High", { qualified: true, paymentDueAt: dAhead(2) }),
  mk(19, "Pooja Chawla", "Chandigarh", "Punjab", "Won", "Sana Khan", 94, "Medium", { qualified: true, expectedCloseAt: thisMonthDay(4) }),
  mk(20, "Ramesh Yadav", "Agra", "Uttar Pradesh", "Won", "Priya Verma", 89, "Medium", { qualified: true, expectedCloseAt: thisMonthDay(9) }),
  mk(21, "Bhavna Rathi", "Udaipur", "Rajasthan", "Won", "Rahul Mehta", 91, "High", { qualified: true, expectedCloseAt: thisMonthDay(14) }),
  mk(22, "Deepak Bhatt", "Dehradun", "Uttarakhand", "Lost", "Deepak Nair", 44, "Low", { lostReason: "Budget constraint" }),
  mk(23, "Sneha Kapoor", "Noida", "Uttar Pradesh", "Lost", "Amit Sharma", 51, "Low", { lostReason: "Chose competitor" }),
  mk(24, "Manoj Tiwari", "Varanasi", "Uttar Pradesh", "Qualified", "Priya Verma", 60, "Medium", { qualified: true, nextAction: null }),
  mk(25, "Alok Jain", "Gwalior", "Madhya Pradesh", "Contacted", "Sana Khan", 48, "Low", { followupAt: dAgo(2) }),
];

const LOSS_REASONS = ["Budget constraint", "Chose competitor", "Location unavailable", "Not decision maker", "Timeline too long", "No response", "Not interested"];

/* -------------------------------- risk rules ------------------------------ */

type Risk = { key: string; label: string; test: (o: Opportunity) => boolean };

const RISKS: Risk[] = [
  { key: "hv-idle", label: "High-priority, no recent activity", test: (o) => (o.priority === "Urgent" || o.score >= 85) && hoursSince(o.lastInteraction) >= 24 && !["Won", "Lost"].includes(o.stage) },
  { key: "no-next", label: "No next action assigned", test: (o) => !o.nextAction && !["Won", "Lost"].includes(o.stage) },
  { key: "overdue-fu", label: "Overdue follow-up", test: (o) => !!o.followupAt && new Date(o.followupAt).getTime() < now && !["Won", "Lost"].includes(o.stage) },
  { key: "stalled", label: "Stalled beyond stage duration", test: (o) => daysSince(o.stageSince) > STAGE_MAX_DAYS[o.stage] },
  { key: "proposal", label: "Proposal awaiting follow-up", test: (o) => o.stage === "Proposal Sent" && !o.proposalFollowedUpAt },
  { key: "meeting", label: "Meeting without outcome", test: (o) => o.stage === "Meeting Completed" && !o.meetingOutcome },
  { key: "payment", label: "Missed payment commitment", test: (o) => o.stage === "Payment Pending" && !!o.paymentDueAt && new Date(o.paymentDueAt).getTime() < now },
  { key: "slip", label: "Closing date changed repeatedly", test: (o) => o.closeDateChanges >= 3 && !["Won", "Lost"].includes(o.stage) },
];

const risksOf = (o: Opportunity) => RISKS.filter((r) => r.test(o));

/* ---------------------------------- page ---------------------------------- */

type View = "kanban" | "table" | "forecast" | "analysis";

export function SalesHeadPipelinePage() {
  const [rows, setRows] = useState<Opportunity[]>(SEED);
  const [view, setView] = useState<View>("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [gate, setGate] = useState<{ o: Opportunity; to: PipeStage } | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [probs, setProbs] = useState<Record<PipeStage, number>>(STAGE_PROB);

  const [f, setF] = useState({
    exec: "all", unit: "all", stage: "all", priority: "all", score: "all",
    source: "all", campaign: "all", place: "all", close: "all", created: "all", q: "",
  });

  const filtered = useMemo(
    () =>
      rows.filter((o) => {
        if (f.exec !== "all" && o.owner !== f.exec) return false;
        if (f.unit !== "all" && o.unit !== f.unit) return false;
        if (f.stage !== "all" && o.stage !== f.stage) return false;
        if (f.priority !== "all" && o.priority !== f.priority) return false;
        if (f.score === "hot" && o.score < 80) return false;
        if (f.score === "warm" && (o.score < 60 || o.score >= 80)) return false;
        if (f.score === "cold" && o.score >= 60) return false;
        if (f.source !== "all" && o.source !== f.source) return false;
        if (f.campaign !== "all" && o.campaign !== f.campaign) return false;
        if (f.place !== "all" && o.state !== f.place) return false;
        const cd = (new Date(o.expectedCloseAt).getTime() - now) / 86400000;
        if (f.close === "week" && (cd < 0 || cd > 7)) return false;
        if (f.close === "month" && (cd < 0 || cd > 31)) return false;
        if (f.close === "overdue" && cd >= 0) return false;
        if (f.created === "30" && daysSince(o.createdAt) > 30) return false;
        if (f.created === "7" && daysSince(o.createdAt) > 7) return false;
        if (f.q) {
          const q = f.q.toLowerCase();
          if (![o.name, o.leadId, o.id, o.city, o.owner].some((x) => x.toLowerCase().includes(q))) return false;
        }
        return true;
      }),
    [rows, f],
  );

  const open = filtered.filter((o) => !["Won", "Lost"].includes(o.stage));
  const weightedConversions = open.reduce((s, o) => s + probs[o.stage] / 100, 0);
  const thisMonth = (iso: string) => {
    const d = new Date(iso), n = new Date(now);
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  };
  const expectedThisMonth = open.filter((o) => thisMonth(o.expectedCloseAt)).reduce((s, o) => s + probs[o.stage] / 100, 0);
  const wonThisMonth = filtered.filter((o) => o.stage === "Won" && thisMonth(o.expectedCloseAt)).length;
  const achievement = Math.round((wonThisMonth / MONTH_TARGET_DEALS) * 100);

  const kpis = [
    { label: "Active Opportunities", value: String(open.length) },
    { label: "Weighted Expected Conversions", value: weightedConversions.toFixed(1) },
    { label: "Expected Conversions This Month", value: expectedThisMonth.toFixed(1) },
    { label: "Deals Won This Month", value: String(wonThisMonth), tone: "text-emerald-600" },
    { label: "Target Achievement", value: `${achievement}%`, tone: achievement >= 80 ? "text-emerald-600" : "text-amber-600" },
  ];

  function patch(id: string, fn: (o: Opportunity) => Opportunity) {
    setRows((s) => s.map((o) => (o.id === id ? fn(o) : o)));
    setDetail((d) => (d && d.id === id ? fn(d) : d));
  }
  function logHistory(id: string, note: string) {
    patch(id, (o) => ({ ...o, history: [{ at: new Date().toISOString(), note }, ...o.history] }));
  }

  function requestMove(o: Opportunity, to: PipeStage) {
    if (o.stage === to) return;
    setGate({ o, to });
  }

  function commitMove(o: Opportunity, to: PipeStage, data: Record<string, string>) {
    patch(o.id, (x) => ({
      ...x,
      stage: to,
      stageSince: new Date().toISOString(),
      qualified: to === "Qualified" ? true : x.qualified,
      meetingOutcome: data.outcome ?? x.meetingOutcome,
      paymentDueAt: data.paymentDueAt ? new Date(data.paymentDueAt).toISOString() : x.paymentDueAt,
      expectedCloseAt: data.expectedCloseAt ? new Date(data.expectedCloseAt).toISOString() : x.expectedCloseAt,
      lostReason: data.lostReason ?? x.lostReason,
      history: [{ at: new Date().toISOString(), note: `Stage ${x.stage} → ${to} (approved by Sales Head)` }, ...x.history],
    }));
    toast.success(`${o.name} moved to ${to}. Dashboard, Performance and Reports updated.`);
    setGate(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Team-wide opportunities on the same master lead records as the executives' CRM.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="h-4 w-4 mr-1" /> Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className={cn("text-xl font-bold tabular-nums mt-1", k.tone)}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ["kanban", "Kanban Board", LayoutGrid],
          ["table", "Table View", Table2],
          ["forecast", "Revenue Forecast", TrendingUp],
          ["analysis", "Stage Analysis", BarChart3],
        ] as [View, string, React.ComponentType<{ className?: string }>][]).map(([v, label, Icon]) => (
          <Button key={v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => setView(v)}>
            <Icon className="h-4 w-4 mr-1" /> {label}
          </Button>
        ))}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Search name, lead ID, city…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
            <Sel label="Sales executive" value={f.exec} onChange={(v) => setF({ ...f, exec: v })}
              options={[["all", "All executives"], ...PIPE_EXECUTIVES.map((e) => [e, e] as [string, string])]} />
            <Sel label="Business unit" value={f.unit} onChange={(v) => setF({ ...f, unit: v })}
              options={[["all", "All units"], ...UNITS.map((u) => [u, u] as [string, string])]} />
            <Sel label="Pipeline stage" value={f.stage} onChange={(v) => setF({ ...f, stage: v })}
              options={[["all", "All stages"], ...PIPE_STAGES.map((s) => [s, s] as [string, string])]} />
            <Sel label="Priority" value={f.priority} onChange={(v) => setF({ ...f, priority: v })}
              options={[["all", "All priorities"], ...["Urgent", "High", "Medium", "Low"].map((p) => [p, p] as [string, string])]} />
            <Sel label="Lead score" value={f.score} onChange={(v) => setF({ ...f, score: v })}
              options={[["all", "Any score"], ["hot", "Hot (80+)"], ["warm", "Warm (60–79)"], ["cold", "Cold (< 60)"]]} />
            <Sel label="Lead source" value={f.source} onChange={(v) => setF({ ...f, source: v })}
              options={[["all", "All sources"], ...SOURCES.map((s) => [s, s] as [string, string])]} />
            <Sel label="Campaign" value={f.campaign} onChange={(v) => setF({ ...f, campaign: v })}
              options={[["all", "All campaigns"], ...CAMPAIGNS.map((c) => [c, c] as [string, string])]} />
            <Sel label="City / state" value={f.place} onChange={(v) => setF({ ...f, place: v })}
              options={[["all", "All states"], ...Array.from(new Set(SEED.map((o) => o.state))).sort().map((s) => [s, s] as [string, string])]} />
            <Sel label="Expected closing" value={f.close} onChange={(v) => setF({ ...f, close: v })}
              options={[["all", "Any date"], ["week", "Next 7 days"], ["month", "This month"], ["overdue", "Past due"]]} />
            <Sel label="Created" value={f.created} onChange={(v) => setF({ ...f, created: v })}
              options={[["all", "Any time"], ["7", "Last 7 days"], ["30", "Last 30 days"]]} />
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => setF({ exec: "all", unit: "all", stage: "all", priority: "all", score: "all", source: "all", campaign: "all", place: "all", close: "all", created: "all", q: "" })}>
                <X className="h-4 w-4 mr-1" /> Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {view === "kanban" && (
        <Kanban
          rows={filtered}
          probs={probs}
          onOpen={setDetail}
          onDrop={(id, stage) => {
            const o = rows.find((x) => x.id === id);
            if (o) requestMove(o, stage);
          }}
          drag={drag}
          setDrag={setDrag}
        />
      )}
      {view === "table" && <TableView rows={filtered} probs={probs} onOpen={setDetail} />}
      {view === "forecast" && <Forecast rows={filtered} probs={probs} setProbs={setProbs} target={MONTH_TARGET_DEALS} />}
      {view === "analysis" && <Analysis rows={filtered} all={rows} probs={probs} />}

      <PipelineHealth rows={filtered} onOpen={setDetail} />

      {/* opportunity drawer */}
      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detail && (
            <OpportunityDetail
              o={detail}
              onNote={(n) => { patch(detail.id, (x) => ({ ...x, notes: [n, ...x.notes] })); logHistory(detail.id, `Manager note added`); toast.success("Manager note saved on the lead record."); }}
              onTask={(t, who) => { logHistory(detail.id, `Task "${t}" assigned to ${who}`); toast.success(`Task assigned to ${who} — appears in their work queue.`); }}
              onReassign={(who, reason) => {
                patch(detail.id, (x) => ({ ...x, owner: who }));
                logHistory(detail.id, `Reassigned to ${who} — ${reason}`);
                toast.success(`Reassigned to ${who}. Ownership history preserved; Team Leads and My Leads updated.`);
              }}
              onSchedule={(kind, when) => {
                patch(detail.id, (x) => ({ ...x, nextAction: kind, followupAt: new Date(when).toISOString() }));
                logHistory(detail.id, `${kind} scheduled for ${fmtDateTime(new Date(when).toISOString())}`);
                toast.success(kind === "Meeting" ? "Meeting created — visible in Meetings." : "Follow-up created — visible in Follow-ups & Reminders.");
              }}
              onPriority={(p) => { patch(detail.id, (x) => ({ ...x, priority: p })); logHistory(detail.id, `Priority changed to ${p}`); toast.success(`Priority set to ${p}`); }}
              onCloseDate={(d) => {
                patch(detail.id, (x) => ({ ...x, expectedCloseAt: new Date(d).toISOString(), closeDateChanges: x.closeDateChanges + 1 }));
                logHistory(detail.id, `Expected closing date changed to ${fmtDate(new Date(d).toISOString())}`);
                toast.success("Expected closing date updated.");
              }}
              onEscalate={() => { logHistory(detail.id, "Escalated to Priority & Escalations"); toast.success("Escalation raised — visible in Priority & Escalations."); }}
              onMove={(to) => requestMove(detail, to)}
            />
          )}
        </SheetContent>
      </Sheet>

      {gate && (
        <StageGateDialog
          o={gate.o}
          to={gate.to}
          onCancel={() => setGate(null)}
          onConfirm={(data) => commitMove(gate.o, gate.to, data)}
        />
      )}
    </div>
  );
}

/* --------------------------------- kanban --------------------------------- */

function Kanban({
  rows, probs, onOpen, onDrop, drag, setDrag,
}: {
  rows: Opportunity[];
  probs: Record<PipeStage, number>;
  onOpen: (o: Opportunity) => void;
  onDrop: (id: string, stage: PipeStage) => void;
  drag: string | null;
  setDrag: (id: string | null) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {PIPE_STAGES.map((stage, idx) => {
          const items = rows.filter((o) => o.stage === stage);
          const weightedCount = items.length * (probs[stage] / 100);
          const avgDays = items.length ? Math.round(items.reduce((s, o) => s + daysSince(o.stageSince), 0) / items.length) : 0;
          const prevCount = idx === 0 ? items.length : rows.filter((o) => o.stage === PIPE_STAGES[idx - 1]).length;
          const conv = prevCount ? Math.round((items.length / prevCount) * 100) : 0;
          return (
            <div
              key={stage}
              className="w-[280px] shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (drag) onDrop(drag, stage); setDrag(null); }}
            >
              <div className="rounded-md border bg-muted/30 p-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", STAGE_TONE[stage])} />
                  <span className="text-sm font-semibold flex-1 truncate">{stage}</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                  <div>Weighted count <span className="block font-medium text-foreground">{weightedCount.toFixed(1)}</span></div>
                  <div>Avg in stage <span className="block font-medium text-foreground">{avgDays}d</span></div>
                  <div>Conversion <span className="block font-medium text-foreground">{idx === 0 ? "—" : `${conv}%`}</span></div>
                </div>
              </div>
              <div className="space-y-2">
                {items.map((o) => (
                  <OpportunityCard key={o.id} o={o} onOpen={() => onOpen(o)} onDragStart={() => setDrag(o.id)} />
                ))}
                {!items.length && (
                  <div className="text-xs text-muted-foreground border border-dashed rounded-md p-4 text-center">
                    Drop an opportunity here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityCard({ o, onOpen, onDragStart }: { o: Opportunity; onOpen: () => void; onDragStart: () => void }) {
  const rs = risksOf(o);
  const overdueClose = new Date(o.expectedCloseAt).getTime() < now && !["Won", "Lost"].includes(o.stage);
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className={cn("cursor-grab active:cursor-grabbing", rs.length && "border-amber-500/50")}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{o.name}</div>
            <div className="text-[11px] text-muted-foreground">{o.leadId} · {o.city}</div>
          </div>
          <Badge variant="outline" className={cn("border text-[10px]", prioTone(o.priority))}>{o.priority}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-xs text-muted-foreground">Score {o.score}</span>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-0.5">
          <div>{o.owner} · in stage {daysSince(o.stageSince)}d</div>
          <div>Last touch {fmtDate(o.lastInteraction)} · Next: {o.nextAction ?? "not set"}</div>
          <div className={cn(overdueClose && "text-red-600 font-medium")}>Close {fmtDate(o.expectedCloseAt)}</div>
        </div>
        {rs.length > 0 && (
          <div className="flex items-start gap-1 text-[11px] text-amber-600">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{rs.map((r) => r.label).join(" · ")}</span>
          </div>
        )}
        <Button size="sm" variant="outline" className="w-full h-8" onClick={onOpen}>
          <Eye className="h-3.5 w-3.5 mr-1" /> View Opportunity
        </Button>
      </CardContent>
    </Card>
  );
}

/* --------------------------------- table ---------------------------------- */

function TableView({ rows, probs, onOpen }: { rows: Opportunity[]; probs: Record<PipeStage, number>; onOpen: (o: Opportunity) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-2 px-3">Lead</th>
                <th className="py-2 px-3">Stage</th>
                <th className="py-2 px-3">Weighted</th>
                <th className="py-2 px-3">Score</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Executive</th>
                <th className="py-2 px-3">In stage</th>
                <th className="py-2 px-3">Next action</th>
                <th className="py-2 px-3">Close</th>
                <th className="py-2 px-3">Risk</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const rs = risksOf(o);
                return (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-2 px-3">
                      <div className="font-medium">{o.name}</div>
                      <div className="text-[11px] text-muted-foreground">{o.leadId} · {o.city}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", STAGE_TONE[o.stage])} />{o.stage}
                      </span>
                    </td>
                    <td className="py-2 px-3 tabular-nums text-muted-foreground">{(probs[o.stage] / 100).toFixed(2)}</td>
                    <td className="py-2 px-3 tabular-nums">{o.score}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className={cn("border", prioTone(o.priority))}>{o.priority}</Badge>
                    </td>
                    <td className="py-2 px-3">{o.owner}</td>
                    <td className="py-2 px-3 tabular-nums">{daysSince(o.stageSince)}d</td>
                    <td className="py-2 px-3">{o.nextAction ?? <span className="text-red-600">Not set</span>}</td>
                    <td className="py-2 px-3">{fmtDate(o.expectedCloseAt)}</td>
                    <td className="py-2 px-3">
                      {rs.length ? <Badge variant="outline" className="border-amber-500/40 text-amber-600">{rs.length}</Badge> : "—"}
                    </td>
                    <td className="py-2 px-3">
                      <Button size="sm" variant="ghost" onClick={() => onOpen(o)}><Eye className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------- forecast -------------------------------- */

function Forecast({
  rows, probs, setProbs, target,
}: {
  rows: Opportunity[];
  probs: Record<PipeStage, number>;
  setProbs: (p: Record<PipeStage, number>) => void;
  target: number;
}) {
  const open = rows.filter((o) => !["Won", "Lost"].includes(o.stage));
  const committed = open.filter((o) => probs[o.stage] >= 75).length;
  const best = open.length;
  const weighted = open.reduce((s, o) => s + probs[o.stage] / 100, 0);
  const atRisk = open.filter((o) => risksOf(o).length > 0).length;
  const won = rows.filter((o) => o.stage === "Won").length;

  const weeks = [0, 1, 2, 3].map((w) => {
    const from = now + w * 7 * 86400000;
    const to = from + 7 * 86400000;
    const items = open.filter((o) => {
      const t = new Date(o.expectedCloseAt).getTime();
      return t >= from && t < to;
    });
    return { label: `Week ${w + 1}`, count: items.length };
  });

  const byPerson = PIPE_EXECUTIVES.map((p) => {
    const mine = open.filter((o) => o.owner === p);
    return {
      name: p,
      count: mine.length,
      weighted: mine.reduce((s, o) => s + probs[o.stage] / 100, 0),
      won: rows.filter((o) => o.owner === p && o.stage === "Won").length,
    };
  });

  const forecastTotal = won + weighted;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        All forecast numbers are estimates derived from configurable stage probabilities — expected deal counts, not committed revenue.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Committed deals" value={String(committed)} hint="Payment Pending & above" />
        <Stat label="Best-case deals" value={String(best)} hint="All open opportunities" />
        <Stat label="Weighted pipeline" value={weighted.toFixed(1)} hint="Probability adjusted" />
        <Stat label="Deals at risk" value={String(atRisk)} hint="Opportunities with warnings" tone="text-red-600" />
        <Stat label="Won so far" value={String(won)} tone="text-emerald-600" />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Target vs forecast</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Forecast {forecastTotal.toFixed(1)} deals</span>
            <span className="text-muted-foreground">Target {target} deals</span>
          </div>
          <Progress value={Math.min(100, (forecastTotal / target) * 100)} />
          <div className="text-xs text-muted-foreground">
            Won {won} + weighted pipeline {weighted.toFixed(1)} = {Math.round((forecastTotal / target) * 100)}% of target.
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Expected closures by week</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {weeks.map((w) => (
              <div key={w.label} className="flex items-center gap-3 text-sm">
                <span className="w-16 text-muted-foreground">{w.label}</span>
                <Progress className="flex-1" value={Math.min(100, (w.count / (best || 1)) * 100 * 3)} />
                <span className="w-24 text-right tabular-nums">{w.count} deals</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Forecast by salesperson</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                  <th className="py-1.5">Executive</th><th className="py-1.5">Open</th><th className="py-1.5">Weighted</th><th className="py-1.5">Won</th>
                </tr>
              </thead>
              <tbody>
                {byPerson.map((p) => (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="py-1.5">{p.name}</td>
                    <td className="py-1.5 tabular-nums">{p.count}</td>
                    <td className="py-1.5 tabular-nums">{p.weighted.toFixed(1)}</td>
                    <td className="py-1.5 tabular-nums text-emerald-600">{p.won}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Stage probabilities (configurable)</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PIPE_STAGES.filter((s) => s !== "Won" && s !== "Lost").map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-sm flex-1 truncate">{s}</span>
              <Input
                type="number" min={0} max={100} className="w-20 h-8"
                value={probs[s]}
                onChange={(e) => setProbs({ ...probs, [s]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

function Analysis({ rows, all, probs }: { rows: Opportunity[]; all: Opportunity[]; probs: Record<PipeStage, number> }) {
  const open = rows.filter((o) => !["Won", "Lost"].includes(o.stage));
  const byExec = PIPE_EXECUTIVES.map((p) => {
    const mine = rows.filter((o) => o.owner === p);
    const openMine = mine.filter((o) => !["Won", "Lost"].includes(o.stage));
    const wonMine = mine.filter((o) => o.stage === "Won");
    const cycle = wonMine.length ? Math.round(wonMine.reduce((s, o) => s + daysSince(o.createdAt), 0) / wonMine.length) : 0;
    return {
      name: p,
      count: openMine.length,
      won: wonMine.length,
      lost: mine.filter((o) => o.stage === "Lost").length,
      stalled: openMine.filter((o) => daysSince(o.stageSince) > STAGE_MAX_DAYS[o.stage]).length,
      cycle,
    };
  });
  const maxPipeline = Math.max(1, ...byExec.map((b) => b.count));

  const wonAll = all.filter((o) => o.stage === "Won");
  const avgCycle = wonAll.length ? Math.round(wonAll.reduce((s, o) => s + daysSince(o.createdAt), 0) / wonAll.length) : 0;
  const monthlyClosures = open.filter((o) => {
    const d = new Date(o.expectedCloseAt), n = new Date(now);
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Average sales cycle" value={`${avgCycle} days`} hint="Created → Won" />
        <Stat label="Expected monthly closures" value={String(monthlyClosures)} />
        <Stat label="Deals won" value={String(byExec.reduce((s, b) => s + b.won, 0))} tone="text-emerald-600" />
        <Stat label="Deals lost" value={String(byExec.reduce((s, b) => s + b.lost, 0))} tone="text-red-600" />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Open opportunities by executive</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {byExec.map((b) => (
            <div key={b.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{b.name} <span className="text-muted-foreground text-xs">· cycle {b.cycle}d</span></span>
                <span className="tabular-nums">{b.count} open</span>
              </div>
              <Progress value={(b.count / maxPipeline) * 100} />
              <div className="text-[11px] text-muted-foreground">
                Won {b.won} · Lost {b.lost} · Stalled {b.stalled}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Opportunities by stage &amp; conversion</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                  <th className="py-2">Stage</th><th className="py-2">Count</th>
                  <th className="py-2">Weighted</th><th className="py-2">Avg in stage</th><th className="py-2">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {PIPE_STAGES.map((s, i) => {
                  const items = rows.filter((o) => o.stage === s);
                  const prev = i === 0 ? items.length : rows.filter((o) => o.stage === PIPE_STAGES[i - 1]).length;
                  const avg = items.length ? Math.round(items.reduce((a, o) => a + daysSince(o.stageSince), 0) / items.length) : 0;
                  return (
                    <tr key={s} className="border-b last:border-0">
                      <td className="py-2">
                        <span className="inline-flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", STAGE_TONE[s])} />{s}</span>
                      </td>
                      <td className="py-2 tabular-nums">{items.length}</td>
                      <td className="py-2 tabular-nums text-muted-foreground">{(items.length * probs[s] / 100).toFixed(1)}</td>
                      <td className="py-2 tabular-nums">{avg}d</td>
                      <td className="py-2 tabular-nums">{i === 0 || !prev ? "—" : `${Math.round((items.length / prev) * 100)}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------ pipeline health --------------------------- */

function PipelineHealth({ rows, onOpen }: { rows: Opportunity[]; onOpen: (o: Opportunity) => void }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Pipeline Health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {RISKS.map((r) => {
          const items = rows.filter(r.test);
          return (
            <div key={r.key} className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.label}</span>
                <Badge variant={items.length ? "destructive" : "secondary"}>{items.length}</Badge>
              </div>
              <div className="mt-2 space-y-1">
                {items.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => onOpen(o)}
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground flex justify-between gap-2"
                  >
                    <span className="truncate">{o.name} · {o.stage}</span>
                    <span className="tabular-nums shrink-0">{o.priority}</span>
                  </button>
                ))}
                {items.length > 3 && <div className="text-[11px] text-muted-foreground">+{items.length - 3} more</div>}
                {!items.length && <div className="text-xs text-muted-foreground">All clear</div>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ------------------------------- detail drawer ---------------------------- */

function OpportunityDetail({
  o, onNote, onTask, onReassign, onSchedule, onPriority, onCloseDate, onEscalate, onMove,
}: {
  o: Opportunity;
  onNote: (n: string) => void;
  onTask: (t: string, who: string) => void;
  onReassign: (who: string, reason: string) => void;
  onSchedule: (kind: "Follow-up" | "Meeting", when: string) => void;
  onPriority: (p: Priority) => void;
  onCloseDate: (d: string) => void;
  onEscalate: () => void;
  onMove: (to: PipeStage) => void;
}) {
  const [note, setNote] = useState("");
  const [task, setTask] = useState("");
  const [taskWho, setTaskWho] = useState(o.owner);
  const [newOwner, setNewOwner] = useState(o.owner);
  const [reason, setReason] = useState("");
  const [schedKind, setSchedKind] = useState<"Follow-up" | "Meeting">("Follow-up");
  const [schedWhen, setSchedWhen] = useState(new Date(now + 86400000).toISOString().slice(0, 16));
  const [closeDate, setCloseDate] = useState(o.expectedCloseAt.slice(0, 10));
  const rs = risksOf(o);

  return (
    <>
      <SheetHeader>
        <SheetTitle>{o.name} · {o.leadId}</SheetTitle>
      </SheetHeader>
      <div className="p-4 space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline"><span className={cn("h-2 w-2 rounded-full mr-1.5", STAGE_TONE[o.stage])} />{o.stage}</Badge>
          <Badge variant="outline" className={cn("border", prioTone(o.priority))}>{o.priority}</Badge>
          <Badge variant="outline">Score {o.score}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <F k="Opportunity ID" v={o.id} />
          <F k="Executive" v={o.owner} />
          <F k="Unit" v={o.unit} />
          <F k="Source / campaign" v={`${o.source} · ${o.campaign}`} />
          <F k="City / state" v={`${o.city}, ${o.state}`} />
          <F k="Time in stage" v={`${daysSince(o.stageSince)} days`} />
          <F k="Last interaction" v={fmtDateTime(o.lastInteraction)} />
          <F k="Next action" v={o.nextAction ?? "Not set"} />
          <F k="Expected close" v={fmtDate(o.expectedCloseAt)} />
          <F k="Close date changes" v={String(o.closeDateChanges)} />
          {o.paymentDueAt ? <F k="Payment committed by" v={fmtDate(o.paymentDueAt)} /> : null}
          {o.lostReason ? <F k="Loss reason" v={o.lostReason} /> : null}
        </div>

        {rs.length > 0 && (
          <div className="border border-amber-500/40 bg-amber-500/5 rounded-md p-3">
            <div className="font-medium text-amber-600 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-4 w-4" /> Risks
            </div>
            <ul className="list-disc pl-5 text-xs space-y-0.5">{rs.map((r) => <li key={r.key}>{r.label}</li>)}</ul>
          </div>
        )}

        <Separator />
        <div className="space-y-2">
          <div className="font-medium">Move stage (approval required)</div>
          <Select value={o.stage} onValueChange={(v) => onMove(v as PipeStage)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PIPE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Separator />
        <div className="space-y-2">
          <div className="font-medium flex items-center gap-1.5"><StickyNote className="h-4 w-4" /> Manager notes</div>
          {o.notes.map((n, i) => <div key={i} className="text-xs bg-muted/40 border rounded p-2">{n}</div>)}
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a manager note" />
          <Button size="sm" disabled={!note.trim()} onClick={() => { onNote(note.trim()); setNote(""); }}>Save note</Button>
        </div>

        <Separator />
        <div className="space-y-2">
          <div className="font-medium flex items-center gap-1.5"><CheckSquare className="h-4 w-4" /> Assign a task</div>
          <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Task for the executive" />
          <Select value={taskWho} onValueChange={setTaskWho}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PIPE_EXECUTIVES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" disabled={!task.trim()} onClick={() => { onTask(task.trim(), taskWho); setTask(""); }}>Assign task</Button>
        </div>

        <Separator />
        <div className="space-y-2">
          <div className="font-medium flex items-center gap-1.5"><CalendarClock className="h-4 w-4" /> Schedule</div>
          <Select value={schedKind} onValueChange={(v) => setSchedKind(v as "Follow-up" | "Meeting")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Follow-up">Follow-up</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>
          <Input type="datetime-local" value={schedWhen} onChange={(e) => setSchedWhen(e.target.value)} />
          <Button size="sm" onClick={() => onSchedule(schedKind, schedWhen)}>Schedule {schedKind.toLowerCase()}</Button>
        </div>

        <Separator />
        <div className="space-y-2">
          <div className="font-medium flex items-center gap-1.5"><UserPlus className="h-4 w-4" /> Reassign opportunity</div>
          <Select value={newOwner} onValueChange={setNewOwner}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PIPE_EXECUTIVES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for reassignment (required)" />
          <Button size="sm" disabled={!reason.trim() || newOwner === o.owner} onClick={() => { onReassign(newOwner, reason.trim()); setReason(""); }}>
            Reassign
          </Button>
        </div>

        <Separator />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Priority</div>
            <Select value={o.priority} onValueChange={(v) => onPriority(v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(["Urgent", "High", "Medium", "Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Expected closing date</div>
            <Input type="date" value={closeDate} onChange={(e) => { setCloseDate(e.target.value); onCloseDate(e.target.value); }} />
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={onEscalate}>
          <ArrowUpRight className="h-4 w-4 mr-1" /> Escalate opportunity
        </Button>

        <Separator />
        <div>
          <div className="text-xs text-muted-foreground mb-2">Opportunity history</div>
          <ul className="space-y-2">
            {o.history.map((h, i) => (
              <li key={i} className="flex gap-2">
                <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <div>{h.note}</div>
                  <div className="text-xs text-muted-foreground">{fmtDateTime(h.at)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ------------------------------ stage gate -------------------------------- */

const GATES: Partial<Record<PipeStage, { field: string; label: string; type: string; options?: string[] }[]>> = {
  "Qualified": [{ field: "qualification", label: "Qualification details (budget, city, decision maker)", type: "textarea" }],
  "Meeting Scheduled": [
    { field: "meetingWhen", label: "Meeting date & time", type: "datetime-local" },
    { field: "meetingMode", label: "Meeting mode", type: "select", options: ["In person", "Video call", "Store visit"] },
  ],
  "Meeting Completed": [{ field: "outcome", label: "Meeting outcome", type: "textarea" }],
  "Negotiation": [{ field: "expectedCloseAt", label: "Expected closing date", type: "date" }],
  "Payment Pending": [
    { field: "paymentDueAt", label: "Expected payment date", type: "date" },
  ],
  "Lost": [{ field: "lostReason", label: "Loss reason", type: "select", options: LOSS_REASONS }],
};

function StageGateDialog({
  o, to, onCancel, onConfirm,
}: {
  o: Opportunity;
  to: PipeStage;
  onCancel: () => void;
  onConfirm: (data: Record<string, string>) => void;
}) {
  const fields = GATES[to] ?? [];
  const [data, setData] = useState<Record<string, string>>({});
  const valid = fields.every((f) => (data[f.field] ?? "").toString().trim().length > 0);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move to {to}</DialogTitle>
          <DialogDescription>
            {o.name} · {o.leadId} — {fields.length ? "Stage rules require the details below before this move." : "Confirm this stage movement."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.field}>
              <div className="text-xs text-muted-foreground mb-1">{f.label}</div>
              {f.type === "textarea" ? (
                <Textarea rows={3} value={data[f.field] ?? ""} onChange={(e) => setData({ ...data, [f.field]: e.target.value })} />
              ) : f.type === "select" ? (
                <Select value={data[f.field] ?? ""} onValueChange={(v) => setData({ ...data, [f.field]: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{f.options!.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input type={f.type} value={data[f.field] ?? ""} onChange={(e) => setData({ ...data, [f.field]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Flag className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            The move is recorded in the opportunity history and updates the shared lead record — no duplicate records are created.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button disabled={!valid} onClick={() => onConfirm(data)}>Approve move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- bits ----------------------------------- */

function Sel({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
        <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("text-xl font-bold tabular-nums mt-1", tone)}>{value}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function F({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
