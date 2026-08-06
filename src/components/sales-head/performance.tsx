import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, LineChart, Line,
} from "recharts";
import {
  TrendingUp, Info, Download, Users, Phone, CalendarClock, FileText,
  Trophy, Percent, Clock, AlertTriangle, Target, Eye,
  Lightbulb, ShieldCheck, ArrowUp, ArrowDown,
} from "lucide-react";

/* --------------------------- shared CRM sample data --------------------------- */

type ExecPerf = {
  name: string;
  territory: string;
  unit: string;
  assigned: number;
  contacted: number;
  firstResponseMin: number;
  calls: number;
  callsConnected: number;
  followupsDue: number;
  followupsOnTime: number;
  meetings: number;
  proposals: number;
  won: number;
  target: number; // count of expected conversions in the period
  overdueActions: number;
  avgCycleDays: number;
  stalledCount: number;
  paymentPendingCount: number;
  trend: { m: string; won: number }[];
  history: { at: string; note: string }[];
};

const EXECS: ExecPerf[] = [
  {
    name: "Ravi Sharma", territory: "Rajasthan", unit: "Franchise",
    assigned: 92, contacted: 86, firstResponseMin: 7, calls: 214, callsConnected: 158,
    followupsDue: 74, followupsOnTime: 68, meetings: 26, proposals: 19, won: 7,
    target: 8,
    overdueActions: 3, avgCycleDays: 22, stalledCount: 4, paymentPendingCount: 2,
    trend: [{ m: "Apr", won: 5 }, { m: "May", won: 6 }, { m: "Jun", won: 6 }, { m: "Jul", won: 7 }],
    history: [{ at: "12 Jul", note: "3 leads transferred in from Amit Bansal (conversion credit retained by original owner)" }],
  },
  {
    name: "Neha Kulkarni", territory: "Maharashtra", unit: "Franchise",
    assigned: 84, contacted: 71, firstResponseMin: 19, calls: 168, callsConnected: 102,
    followupsDue: 66, followupsOnTime: 47, meetings: 18, proposals: 13, won: 4,
    target: 8,
    overdueActions: 9, avgCycleDays: 31, stalledCount: 8, paymentPendingCount: 2,
    trend: [{ m: "Apr", won: 4 }, { m: "May", won: 5 }, { m: "Jun", won: 4 }, { m: "Jul", won: 4 }],
    history: [{ at: "04 Jul", note: "Nagpur cluster reassigned from Deepak Verma" }],
  },
  {
    name: "Amit Bansal", territory: "Delhi NCR", unit: "Master Franchise",
    assigned: 108, contacted: 101, firstResponseMin: 5, calls: 248, callsConnected: 191,
    followupsDue: 88, followupsOnTime: 84, meetings: 34, proposals: 27, won: 11,
    target: 10,
    overdueActions: 1, avgCycleDays: 18, stalledCount: 3, paymentPendingCount: 3,
    trend: [{ m: "Apr", won: 8 }, { m: "May", won: 9 }, { m: "Jun", won: 10 }, { m: "Jul", won: 11 }],
    history: [{ at: "12 Jul", note: "3 leads transferred out to Ravi Sharma" }],
  },
  {
    name: "Deepak Verma", territory: "Madhya Pradesh", unit: "Franchise",
    assigned: 68, contacted: 60, firstResponseMin: 14, calls: 141, callsConnected: 94,
    followupsDue: 52, followupsOnTime: 43, meetings: 15, proposals: 11, won: 5,
    target: 7,
    overdueActions: 4, avgCycleDays: 26, stalledCount: 5, paymentPendingCount: 1,
    trend: [{ m: "Apr", won: 3 }, { m: "May", won: 4 }, { m: "Jun", won: 4 }, { m: "Jul", won: 5 }],
    history: [{ at: "04 Jul", note: "Nagpur cluster transferred to Neha Kulkarni" }],
  },
  {
    name: "Sneha Iyer", territory: "Karnataka", unit: "Corporate Tie-up",
    assigned: 76, contacted: 70, firstResponseMin: 9, calls: 182, callsConnected: 128,
    followupsDue: 61, followupsOnTime: 55, meetings: 22, proposals: 16, won: 6,
    target: 8,
    overdueActions: 2, avgCycleDays: 24, stalledCount: 4, paymentPendingCount: 2,
    trend: [{ m: "Apr", won: 4 }, { m: "May", won: 5 }, { m: "Jun", won: 5 }, { m: "Jul", won: 6 }],
    history: [],
  },
];

/* period scaling factors applied to the CRM records */
const PERIODS = {
  today: { label: "Today", factor: 0.045 },
  week: { label: "This Week", factor: 0.24 },
  month: { label: "This Month", factor: 1 },
  quarter: { label: "This Quarter", factor: 2.85 },
  custom: { label: "Custom Date Range", factor: 0.6 },
} as const;
type PeriodKey = keyof typeof PERIODS;

const UNITS = ["Franchise", "Master Franchise", "Corporate Tie-up"];

const SOURCE_ROWS = [
  { group: "Lead Source", name: "Google Ads", leads: 148, won: 14 },
  { group: "Lead Source", name: "Meta Ads", leads: 122, won: 8 },
  { group: "Lead Source", name: "Referral", leads: 46, won: 9 },
  { group: "Lead Source", name: "Website Enquiry", leads: 68, won: 2 },
  { group: "Lead Source", name: "Exhibition", leads: 44, won: 0 },
  { group: "Campaign", name: "Franchise India Jul", leads: 96, won: 11 },
  { group: "Campaign", name: "Tier-2 Expansion", leads: 84, won: 7 },
  { group: "Campaign", name: "Retargeting — Warm", leads: 62, won: 6 },
  { group: "City", name: "Delhi NCR", leads: 108, won: 11 },
  { group: "City", name: "Jaipur", leads: 62, won: 5 },
  { group: "City", name: "Pune", leads: 58, won: 4 },
  { group: "City", name: "Bengaluru", leads: 54, won: 6 },
  { group: "City", name: "Indore", leads: 46, won: 3 },
  { group: "Business Unit", name: "Franchise", leads: 244, won: 16 },
  { group: "Business Unit", name: "Master Franchise", leads: 108, won: 11 },
  { group: "Business Unit", name: "Corporate Tie-up", leads: 76, won: 6 },
  { group: "Lead Score", name: "80–100 (Hot)", leads: 96, won: 21 },
  { group: "Lead Score", name: "60–79 (Warm)", leads: 142, won: 9 },
  { group: "Lead Score", name: "40–59 (Cold)", leads: 128, won: 3 },
  { group: "Lead Score", name: "Below 40", leads: 62, won: 0 },
];

const ACTIVITY_QUALITY = [
  { label: "New leads contacted within 10 minutes", value: "312 / 388", pct: 80, tone: "amber", tip: "Counted from the first outbound call activity logged against a newly assigned lead." },
  { label: "Follow-ups completed on time", value: "297 / 341", pct: 87, tone: "green", tip: "Sourced from Follow-ups & Reminders — completed on or before the scheduled slot." },
  { label: "Leads without a next action", value: "24", pct: 0, tone: "red", tip: "Open leads in the master lead record with no scheduled next action." },
  { label: "Meetings without recorded outcomes", value: "6", pct: 0, tone: "red", tip: "Meetings marked past-time in Meetings with no outcome captured." },
  { label: "Overdue tasks", value: "19", pct: 0, tone: "red", tip: "Pulled live from Team Tasks — status not Completed and past due date." },
  { label: "Lost leads without a loss reason", value: "11", pct: 0, tone: "amber", tip: "Leads moved to Lost in Sales Pipeline history without a reason field." },
  { label: "High-value leads with no activity in 7 days", value: "9", pct: 0, tone: "amber", tip: "Opportunity value ≥ ₹15L with no call, meeting or note in the last 7 days." },
  { label: "Repeatedly rescheduled follow-ups", value: "14", pct: 0, tone: "amber", tip: "Follow-ups rescheduled 3 or more times without a completed call." },
];

/* --------------------------- helpers --------------------------- */

const inr = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)}Cr` : `₹${(n / 100000).toFixed(1)}L`;
const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 1000) / 10);
const scale = (n: number, f: number) => Math.round(n * f);

function toneClass(t: string) {
  return t === "green" ? "text-emerald-600 dark:text-emerald-400"
    : t === "amber" ? "text-amber-600 dark:text-amber-400"
    : t === "red" ? "text-red-600 dark:text-red-400"
    : "text-foreground";
}

function Metric({ label, value, sub, tip, icon: Icon, tone = "", delta }: {
  label: string; value: string; sub?: string; tip: string;
  icon: React.ComponentType<{ className?: string }>; tone?: string; delta?: number;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-1">
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="flex-1 leading-tight">{label}</span>
          <MetricInfo tip={tip} />
        </div>
        <div className={cn("text-xl font-bold", toneClass(tone))}>{value}</div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {sub && <span>{sub}</span>}
          {delta !== undefined && (
            <span className={cn("inline-flex items-center gap-0.5", delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
              {delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(delta)}% vs prev
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricInfo({ tip }: { tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-xs">{tip}</TooltipContent>
    </Tooltip>
  );
}

function SectionTitle({ title, tip }: { title: string; tip?: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {tip && <MetricInfo tip={tip} />}
    </div>
  );
}

/* --------------------------- page --------------------------- */

export function SalesHeadPerformancePage() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [unit, setUnit] = useState("all");
  const [compare, setCompare] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openExec, setOpenExec] = useState<ExecPerf | null>(null);

  const f = PERIODS[period].factor;

  const rows = useMemo(() => {
    const list = EXECS.filter((e) => unit === "all" || e.unit === unit);
    return list.map((e) => ({
      ...e,
      assigned: scale(e.assigned, f),
      contacted: scale(e.contacted, f),
      calls: scale(e.calls, f),
      callsConnected: scale(e.callsConnected, f),
      followupsDue: scale(e.followupsDue, f),
      followupsOnTime: scale(e.followupsOnTime, f),
      meetings: scale(e.meetings, f),
      proposals: scale(e.proposals, f),
      won: scale(e.won, f),
      target: Math.round(e.target * (period === "quarter" ? 3 : period === "month" ? 1 : f)),
    }));
  }, [unit, f, period]);

  const team = useMemo(() => {
    const sum = (k: keyof ExecPerf) => rows.reduce((a, r) => a + (r[k] as number), 0);
    const assigned = sum("assigned");
    const target = sum("target");
    const won = sum("won");
    return {
      assigned,
      contacted: sum("contacted"),
      calls: sum("calls"),
      callsConnected: sum("callsConnected"),
      followupsDue: sum("followupsDue"),
      followupsOnTime: sum("followupsOnTime"),
      meetings: sum("meetings"),
      proposals: sum("proposals"),
      won,
      target,
      stalled: sum("stalledCount"),
      paymentPending: sum("paymentPendingCount"),
      overdue: sum("overdueActions"),
      avgFirstResponse: Math.round(rows.reduce((a, r) => a + r.firstResponseMin, 0) / Math.max(1, rows.length)),
      avgCycle: Math.round(rows.reduce((a, r) => a + r.avgCycleDays, 0) / Math.max(1, rows.length)),
      conversion: pct(won, assigned),
    };
  }, [rows]);

  // records in the selected period represent ~72% of the month's working days elapsed
  const elapsedShare = 0.72;
  const projected = Math.round((period === "month" ? team.won / elapsedShare : team.won));
  const gap = Math.max(0, team.target - projected);
  const salesNeeded = Math.max(0, team.target - team.won);

  const funnel = useMemo(() => {
    const a = team.assigned;
    return [
      { stage: "Leads Assigned", count: a },
      { stage: "Contacted", count: team.contacted },
      { stage: "Qualified", count: Math.round(team.contacted * 0.62) },
      { stage: "Meetings Completed", count: team.meetings },
      { stage: "Proposals Sent", count: team.proposals },
      { stage: "Payment Pending", count: Math.max(team.won, Math.round(team.proposals * 0.42)) },
      { stage: "Won", count: team.won },
    ];
  }, [team]);

  const insights = useMemo(() => {
    const slowest = [...rows].sort((a, b) => b.firstResponseMin - a.firstResponseMin)[0];
    const lowMeetingConv = [...rows].sort((a, b) => pct(a.won, a.meetings) - pct(b.won, b.meetings))[0];
    const mostOverdue = [...rows].sort((a, b) => b.overdueActions - a.overdueActions)[0];
    const sources = SOURCE_ROWS.filter((s) => s.group === "Lead Source");
    const bestSource = [...sources].sort((a, b) => pct(b.won, b.leads) - pct(a.won, a.leads))[0];
    let worstStage = { from: "", to: "", drop: 0 };
    for (let i = 1; i < funnel.length; i++) {
      const drop = funnel[i - 1].count - funnel[i].count;
      if (drop > worstStage.drop) worstStage = { from: funnel[i - 1].stage, to: funnel[i].stage, drop };
    }
    return [
      { tone: "red", title: "Response time needs correction", body: `${slowest?.name} is averaging ${slowest?.firstResponseMin} min first response against the 10-minute standard. Review their morning call block.` },
      { tone: "amber", title: "Low meeting-to-win conversion", body: `${lowMeetingConv?.name} converts only ${pct(lowMeetingConv?.won ?? 0, lowMeetingConv?.meetings ?? 1)}% of completed meetings. Sit in on the next two meetings.` },
      { tone: "red", title: "Excessive overdue follow-ups", body: `${mostOverdue?.name} has ${mostOverdue?.overdueActions} overdue actions. Clear the backlog before new leads are assigned.` },
      { tone: "green", title: "Strongest lead source", body: `${bestSource?.name} converts at ${pct(bestSource?.won ?? 0, bestSource?.leads ?? 1)}% and contributed ${bestSource?.won ?? 0} wins. Push more budget here.` },
      { tone: "amber", title: "Biggest funnel leak", body: worstStage.from ? `Largest drop-off is ${worstStage.from} → ${worstStage.to} (${worstStage.drop} leads lost). Fix this stage first.` : "Funnel movement is balanced this period." },
    ];
  }, [rows, funnel]);

  const exportReport = () => {
    const header = ["Executive", "Assigned", "Contacted", "First Response (min)", "Calls", "Connect %", "On-time Follow-up %", "Meetings", "Proposals", "Won", "Target", "Conversion %", "Target %", "Overdue"];
    const lines = rows.map((r) => [
      r.name, r.assigned, r.contacted, r.firstResponseMin, r.calls,
      pct(r.callsConnected, r.calls), pct(r.followupsOnTime, r.followupsDue),
      r.meetings, r.proposals, r.won, r.target, pct(r.won, r.assigned),
      pct(r.won, r.target), r.overdueActions,
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-performance-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Performance report exported");
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Performance</h1>
            <p className="text-sm text-muted-foreground">
              Measured only from actual CRM records — calls, follow-ups, meetings, tasks and pipeline history.
              Spam, test and verified duplicate leads are excluded.
            </p>
          </div>
          <Button onClick={exportReport}><Download className="h-4 w-4 mr-1" /> Export Performance Report</Button>
        </div>

        <Card>
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PERIODS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {period === "custom" && (
              <>
                <Input type="date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
                <Input type="date" className="w-40" value={to} onChange={(e) => setTo(e.target.value)} />
              </>
            )}

            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Business unit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All business units</SelectItem>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button size="sm" variant={compare ? "default" : "outline"} onClick={() => setCompare((c) => !c)}>
              Compare with previous period
            </Button>

            <Badge variant="secondary" className="ml-auto">
              Period: {PERIODS[period].label}{period === "custom" && from && to ? ` · ${from} → ${to}` : ""}
            </Badge>
          </CardContent>
        </Card>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Metric label="Leads Assigned" value={`${team.assigned}`} icon={Users} delta={compare ? 6 : undefined}
            tip="Leads assigned to the team in the selected period, from the master lead record. Excludes spam, test and verified duplicates." />
          <Metric label="Leads Contacted" value={`${team.contacted}`} sub={`${pct(team.contacted, team.assigned)}% of assigned`} icon={Phone} delta={compare ? 4 : undefined}
            tip="Leads with at least one logged outbound call or meaningful contact activity." />
          <Metric label="Avg First-Response Time" value={`${team.avgFirstResponse} min`} sub="Standard: under 10 min"
            tone={team.avgFirstResponse <= 10 ? "green" : "amber"} icon={Clock} delta={compare ? -8 : undefined}
            tip="Average minutes between lead assignment and the first logged call activity." />
          <Metric label="Calls Completed" value={`${team.calls}`} sub={`${pct(team.callsConnected, team.calls)}% connected`} icon={Phone} delta={compare ? 9 : undefined}
            tip="Counted from call activity only. Manual entry of call numbers is not permitted." />
          <Metric label="Follow-ups On Time" value={`${pct(team.followupsOnTime, team.followupsDue)}%`} sub={`${team.followupsOnTime} of ${team.followupsDue}`}
            tone={pct(team.followupsOnTime, team.followupsDue) >= 85 ? "green" : "amber"} icon={CalendarClock} delta={compare ? 3 : undefined}
            tip="Sourced from Follow-ups & Reminders — completed on or before the scheduled time." />
          <Metric label="Meetings Completed" value={`${team.meetings}`} icon={CalendarClock} delta={compare ? 11 : undefined}
            tip="Meetings with a recorded 'Completed' outcome in the Meetings module." />
          <Metric label="Proposals Sent" value={`${team.proposals}`} icon={FileText} delta={compare ? 7 : undefined}
            tip="Proposal-sent events recorded in Sales Pipeline stage history." />
          <Metric label="Sales Won" value={`${team.won}`} icon={Trophy} tone="green" delta={compare ? 12 : undefined}
            tip="Opportunities moved to Won in Sales Pipeline history." />
          <Metric label="Revenue Achieved" value={inr(team.revenue)} icon={IndianRupee} tone="green" delta={compare ? 14 : undefined}
            tip="Booking value of Won opportunities only. Pipeline and pending payments are excluded." />
          <Metric label="Team Conversion Rate" value={`${team.conversion}%`} sub="Won ÷ Assigned" icon={Percent}
            tone={team.conversion >= 8 ? "green" : "amber"} delta={compare ? 1.2 : undefined}
            tip="Won opportunities divided by leads assigned in the same period." />
        </div>

        {/* target progress */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <SectionTitle title="Target Progress" tip="Targets are set by authorised administrators only; they cannot be edited from this page." />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Cell label="Monthly Team Target" value={inr(team.target)} />
              <Cell label="Revenue Achieved" value={inr(team.revenue)} tone="green" />
              <Cell label="Remaining Target" value={inr(Math.max(0, team.target - team.revenue))} tone="amber" />
              <Cell label="Target Achievement" value={`${pct(team.revenue, team.target)}%`} tone={pct(team.revenue, team.target) >= 100 ? "green" : pct(team.revenue, team.target) >= 70 ? "amber" : "red"} />
              <Cell label="Expected Month-End Revenue" value={inr(projected)} tone={projected >= team.target ? "green" : "amber"} />
              <Cell label="Revenue Gap (projected)" value={gap === 0 ? "On track" : inr(gap)} tone={gap === 0 ? "green" : "red"} />
              <Cell label="Sales Required to Reach Target" value={`${salesNeeded} bookings`} />
              <Cell label="Average Deal Value" value={inr(avgDeal)} />
            </div>
            <Progress value={Math.min(100, pct(team.revenue, team.target))} />
          </CardContent>
        </Card>

        {/* executive scorecard */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <SectionTitle title="Executive Scorecard" tip="Every column is derived from CRM activity. Ownership history is preserved when leads are reassigned." />
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    {["Executive", "Assigned", "Contacted", "1st Resp.", "Calls", "Connect %", "On-time FU %", "Meetings", "Proposals", "Won", "Revenue", "Conv %", "Target %", "Pipeline", "Overdue", ""].map((h) => (
                      <th key={h} className="text-left font-medium py-2 px-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const tAch = pct(r.revenue, r.target);
                    const fu = pct(r.followupsOnTime, r.followupsDue);
                    return (
                      <tr key={r.name} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-2 px-2">
                          <div className="font-medium whitespace-nowrap">{r.name}</div>
                          <div className="text-[11px] text-muted-foreground whitespace-nowrap">{r.territory} · {r.unit}</div>
                        </td>
                        <td className="px-2">{r.assigned}</td>
                        <td className="px-2">{r.contacted}</td>
                        <td className={cn("px-2 whitespace-nowrap", r.firstResponseMin > 10 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>{r.firstResponseMin}m</td>
                        <td className="px-2">{r.calls}</td>
                        <td className="px-2">{pct(r.callsConnected, r.calls)}%</td>
                        <td className={cn("px-2", fu >= 85 ? "text-emerald-600 dark:text-emerald-400" : fu >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>{fu}%</td>
                        <td className="px-2">{r.meetings}</td>
                        <td className="px-2">{r.proposals}</td>
                        <td className="px-2 font-medium">{r.won}</td>
                        <td className="px-2 whitespace-nowrap">{inr(r.revenue)}</td>
                        <td className="px-2">{pct(r.won, r.assigned)}%</td>
                        <td className={cn("px-2", tAch >= 100 ? "text-emerald-600 dark:text-emerald-400" : tAch >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>{tAch}%</td>
                        <td className="px-2 whitespace-nowrap">{inr(r.pipelineValue)}</td>
                        <td className={cn("px-2", r.overdueActions > 5 ? "text-red-600 dark:text-red-400" : r.overdueActions > 2 ? "text-amber-600 dark:text-amber-400" : "")}>{r.overdueActions}</td>
                        <td className="px-2">
                          <Button size="sm" variant="outline" onClick={() => setOpenExec(r)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sales Head sees the full team; executives see only their own numbers. Performance records and completed activities cannot be deleted by executives.
            </p>
          </CardContent>
        </Card>

        {/* funnel + pipeline */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-4 space-y-3">
              <SectionTitle title="Sales Funnel" tip="Stage counts come from Sales Pipeline stage-change history for the selected period." />
              <div className="space-y-2">
                {funnel.map((s, i) => {
                  const prev = i === 0 ? s.count : funnel[i - 1].count;
                  const conv = i === 0 ? 100 : pct(s.count, prev);
                  return (
                    <div key={s.stage}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{s.stage}</span>
                        <span className="text-muted-foreground">
                          {s.count}
                          {i > 0 && (
                            <span className={cn("ml-2", conv >= 60 ? "text-emerald-600 dark:text-emerald-400" : conv >= 35 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
                              {conv}% from previous
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-2.5 rounded bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.max(3, pct(s.count, funnel[0].count))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <SectionTitle title="Pipeline Performance" tip="Weighted pipeline applies stage probability from Sales Pipeline. Revenue at risk = stalled + payment-pending value." />
              <div className="grid grid-cols-2 gap-3">
                <Cell label="Total Pipeline Value" value={inr(team.pipeline)} />
                <Cell label="Weighted Pipeline" value={inr(team.weighted)} />
                <Cell label="Average Sales Cycle" value={`${team.avgCycle} days`} />
                <Cell label="Stalled Opportunity Value" value={inr(team.stalled)} tone="amber" />
                <Cell label="Payment-Pending Value" value={inr(team.paymentPending)} tone="amber" />
                <Cell label="Expected Closures This Month" value={`${Math.max(1, Math.round(team.proposals * 0.35))} deals`} />
                <Cell label="Revenue at Risk" value={inr(team.stalled + team.paymentPending)} tone="red" />
                <Cell label="Overdue Actions" value={`${team.overdue}`} tone={team.overdue > 10 ? "red" : "amber"} />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows.map((r) => ({ name: r.name.split(" ")[0], Pipeline: Math.round(r.pipelineValue / 100000), Weighted: Math.round(r.weightedPipeline / 100000) }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="L" />
                    <RTooltip formatter={(v: number) => `₹${v}L`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Pipeline" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Weighted" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* activity quality */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <SectionTitle title="Activity Quality" tip="Discipline checks computed from call activity, Follow-ups & Reminders, Meetings, Team Tasks and pipeline history." />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ACTIVITY_QUALITY.map((a) => (
                <div key={a.label} className="rounded-md border p-3">
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="flex-1">{a.label}</span>
                    <MetricInfo tip={a.tip} />
                  </div>
                  <div className={cn("text-lg font-semibold mt-1", toneClass(a.tone))}>{a.value}</div>
                  {a.pct > 0 && <Progress className="mt-2" value={a.pct} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* source performance */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <SectionTitle title="Source Performance" tip="Conversion and revenue attributed to the lead's original source, campaign, city, business unit and score band." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {["Lead Source", "Campaign", "City", "Business Unit", "Lead Score"].map((g) => (
                <div key={g}>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">{g}</div>
                  <div className="space-y-1">
                    {SOURCE_ROWS.filter((s) => s.group === g).map((s) => {
                      const c = pct(s.won, s.leads);
                      return (
                        <div key={s.name} className="flex items-center justify-between gap-2 text-xs border rounded px-2 py-1.5">
                          <span className="truncate">{s.name}</span>
                          <span className="flex items-center gap-3 shrink-0 text-muted-foreground">
                            <span>{s.leads} leads</span>
                            <span className={cn(c >= 12 ? "text-emerald-600 dark:text-emerald-400" : c >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>{c}%</span>
                            <span className="text-foreground font-medium">{inr(s.revenue)}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* coaching insights */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <SectionTitle title="Coaching Insights" tip="Rules-based recommendations derived from the metrics above. No AI scoring is used." />
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {insights.map((i) => (
                <div key={i.title} className={cn(
                  "rounded-md border-l-4 border p-3",
                  i.tone === "green" ? "border-l-emerald-500" : i.tone === "amber" ? "border-l-amber-500" : "border-l-red-500"
                )}>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Lightbulb className={cn("h-4 w-4", toneClass(i.tone))} /> {i.title}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{i.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ExecSheet exec={openExec} onClose={() => setOpenExec(null)} />
      </div>
    </TooltipProvider>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-semibold", toneClass(tone ?? ""))}>{value}</div>
    </div>
  );
}

/* --------------------------- individual view --------------------------- */

function ExecSheet({ exec, onClose }: { exec: ExecPerf | null; onClose: () => void }) {
  if (!exec) return null;
  const tAch = pct(exec.revenue, exec.target);
  const fu = pct(exec.followupsOnTime, exec.followupsDue);

  return (
    <Sheet open={!!exec} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="pr-6">{exec.name} — Performance</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="text-xs text-muted-foreground">{exec.territory} · {exec.unit}</div>

          <div className="grid grid-cols-2 gap-2">
            <Cell label="Revenue Achieved" value={inr(exec.revenue)} tone="green" />
            <Cell label="Target Achievement" value={`${tAch}%`} tone={tAch >= 100 ? "green" : tAch >= 70 ? "amber" : "red"} />
            <Cell label="Leads Assigned" value={`${exec.assigned}`} />
            <Cell label="Leads Contacted" value={`${exec.contacted}`} />
            <Cell label="First-Response Time" value={`${exec.firstResponseMin} min`} tone={exec.firstResponseMin <= 10 ? "green" : "red"} />
            <Cell label="Call Connection Rate" value={`${pct(exec.callsConnected, exec.calls)}%`} />
            <Cell label="On-time Follow-ups" value={`${fu}%`} tone={fu >= 85 ? "green" : fu >= 70 ? "amber" : "red"} />
            <Cell label="Meetings Completed" value={`${exec.meetings}`} />
            <Cell label="Proposals Sent" value={`${exec.proposals}`} />
            <Cell label="Sales Won" value={`${exec.won}`} />
            <Cell label="Conversion Rate" value={`${pct(exec.won, exec.assigned)}%`} />
            <Cell label="Active Pipeline" value={inr(exec.pipelineValue)} />
            <Cell label="Average Sales Cycle" value={`${exec.avgCycleDays} days`} />
            <Cell label="Overdue Actions" value={`${exec.overdueActions}`} tone={exec.overdueActions > 5 ? "red" : exec.overdueActions > 2 ? "amber" : "green"} />
          </div>

          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Revenue trend (₹L)
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exec.trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="L" />
                  <RTooltip formatter={(v: number) => `₹${v}L`} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm font-medium mb-1 flex items-center gap-1">
              <Target className="h-4 w-4" /> Focus areas
            </div>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
              {exec.firstResponseMin > 10 && <li>Cut first-response time to under 10 minutes on new leads.</li>}
              {fu < 85 && <li>Follow-up discipline is at {fu}% — clear the pending queue daily.</li>}
              {exec.overdueActions > 2 && <li>{exec.overdueActions} overdue actions pending in Team Tasks.</li>}
              {pct(exec.won, exec.meetings) < 30 && <li>Meeting-to-win conversion is low — review objection handling.</li>}
              {tAch >= 100 && <li>Target achieved — hold the pace and support weaker territories.</li>}
            </ul>
          </div>

          <div>
            <div className="text-sm font-medium mb-1 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Ownership history
            </div>
            {exec.history.length === 0 ? (
              <div className="text-xs text-muted-foreground">No lead reassignments in this period.</div>
            ) : (
              exec.history.map((h, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{h.at}</span> — {h.note}
                </div>
              ))
            )}
          </div>

          <p className="text-[11px] text-muted-foreground border-t pt-3">
            All figures are read-only and computed from CRM records. Manual editing of performance numbers is not permitted.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
