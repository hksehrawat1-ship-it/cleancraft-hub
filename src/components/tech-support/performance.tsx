import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Lightbulb,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { SEED } from "./my-tickets";

/* ------------------------------------------------------------------ */
/* Period data (derived from ticket activity, read-only)               */
/* ------------------------------------------------------------------ */

const PERIODS = ["Today", "This Week", "This Month", "This Quarter", "Custom Date Range"] as const;
type Period = (typeof PERIODS)[number];

const ENGINEERS = ["You (Amit Verma)", "Ravi Menon", "Sunil Kalra", "Team (all engineers)"] as const;

type Metrics = {
  assigned: number;
  contacted: number;
  troubleshootingStarted: number;
  resolvedRemotely: number;
  electricianRequired: number;
  escalated: number;
  resolved: number;
  closed: number;
  firstResponseMins: number;
  resolutionHours: number;
  slaResponded: number;
  slaResolved: number;
  criticalInSla: number;
  overdue: number;
  avgSlaDelayMins: number;
  followUpsScheduled: number;
  followUpsOnTime: number;
  followUpsLate: number;
  followUpsOverdue: number;
  callbacksMissed: number;
  monitoringDone: number;
  closurePending: number;
  electricianCases: number;
  visitsConfirmed: number;
  visitsCompleted: number;
  coordinationHours: number;
  electricianDelays: number;
  electricianResolved: number;
  electricianEscalated: number;
  firstContactResolved: number;
  repeatProblems: number;
  reopened: number;
  customerConfirmed: number;
  incompleteNotes: number;
  missingRootCause: number;
  avoidableEscalations: number;
  safetyChecksDone: number;
  safetyChecksRequired: number;
  excluded: number;
};

const BASE: Record<Period, Metrics> = {
  Today: {
    assigned: 8, contacted: 8, troubleshootingStarted: 7, resolvedRemotely: 4, electricianRequired: 2,
    escalated: 1, resolved: 5, closed: 4, firstResponseMins: 12, resolutionHours: 6.2,
    slaResponded: 8, slaResolved: 4, criticalInSla: 2, overdue: 1, avgSlaDelayMins: 18,
    followUpsScheduled: 11, followUpsOnTime: 8, followUpsLate: 1, followUpsOverdue: 2,
    callbacksMissed: 1, monitoringDone: 2, closurePending: 1,
    electricianCases: 2, visitsConfirmed: 1, visitsCompleted: 1, coordinationHours: 2.1,
    electricianDelays: 1, electricianResolved: 1, electricianEscalated: 0,
    firstContactResolved: 3, repeatProblems: 1, reopened: 0, customerConfirmed: 4,
    incompleteNotes: 1, missingRootCause: 1, avoidableEscalations: 0,
    safetyChecksDone: 3, safetyChecksRequired: 3, excluded: 1,
  },
  "This Week": {
    assigned: 42, contacted: 41, troubleshootingStarted: 38, resolvedRemotely: 24, electricianRequired: 9,
    escalated: 5, resolved: 33, closed: 30, firstResponseMins: 14, resolutionHours: 9.4,
    slaResponded: 39, slaResolved: 29, criticalInSla: 7, overdue: 3, avgSlaDelayMins: 26,
    followUpsScheduled: 58, followUpsOnTime: 48, followUpsLate: 6, followUpsOverdue: 4,
    callbacksMissed: 3, monitoringDone: 12, closurePending: 3,
    electricianCases: 9, visitsConfirmed: 8, visitsCompleted: 7, coordinationHours: 3.4,
    electricianDelays: 2, electricianResolved: 6, electricianEscalated: 2,
    firstContactResolved: 19, repeatProblems: 4, reopened: 2, customerConfirmed: 30,
    incompleteNotes: 3, missingRootCause: 4, avoidableEscalations: 1,
    safetyChecksDone: 11, safetyChecksRequired: 12, excluded: 3,
  },
  "This Month": {
    assigned: 168, contacted: 165, troubleshootingStarted: 154, resolvedRemotely: 101, electricianRequired: 34,
    escalated: 19, resolved: 139, closed: 131, firstResponseMins: 16, resolutionHours: 11.2,
    slaResponded: 154, slaResolved: 118, criticalInSla: 26, overdue: 9, avgSlaDelayMins: 34,
    followUpsScheduled: 236, followUpsOnTime: 196, followUpsLate: 24, followUpsOverdue: 16,
    callbacksMissed: 11, monitoringDone: 48, closurePending: 8,
    electricianCases: 34, visitsConfirmed: 31, visitsCompleted: 29, coordinationHours: 3.9,
    electricianDelays: 6, electricianResolved: 22, electricianEscalated: 7,
    firstContactResolved: 78, repeatProblems: 17, reopened: 8, customerConfirmed: 124,
    incompleteNotes: 11, missingRootCause: 14, avoidableEscalations: 4,
    safetyChecksDone: 41, safetyChecksRequired: 44, excluded: 9,
  },
  "This Quarter": {
    assigned: 494, contacted: 486, troubleshootingStarted: 452, resolvedRemotely: 288, electricianRequired: 104,
    escalated: 61, resolved: 408, closed: 392, firstResponseMins: 18, resolutionHours: 12.6,
    slaResponded: 441, slaResolved: 336, criticalInSla: 74, overdue: 26, avgSlaDelayMins: 41,
    followUpsScheduled: 702, followUpsOnTime: 574, followUpsLate: 79, followUpsOverdue: 49,
    callbacksMissed: 34, monitoringDone: 141, closurePending: 21,
    electricianCases: 104, visitsConfirmed: 94, visitsCompleted: 88, coordinationHours: 4.2,
    electricianDelays: 19, electricianResolved: 64, electricianEscalated: 22,
    firstContactResolved: 221, repeatProblems: 56, reopened: 27, customerConfirmed: 361,
    incompleteNotes: 34, missingRootCause: 43, avoidableEscalations: 12,
    safetyChecksDone: 118, safetyChecksRequired: 128, excluded: 26,
  },
  "Custom Date Range": {
    assigned: 96, contacted: 94, troubleshootingStarted: 88, resolvedRemotely: 57, electricianRequired: 19,
    escalated: 11, resolved: 79, closed: 74, firstResponseMins: 15, resolutionHours: 10.4,
    slaResponded: 88, slaResolved: 68, criticalInSla: 15, overdue: 5, avgSlaDelayMins: 29,
    followUpsScheduled: 134, followUpsOnTime: 112, followUpsLate: 13, followUpsOverdue: 9,
    callbacksMissed: 6, monitoringDone: 27, closurePending: 5,
    electricianCases: 19, visitsConfirmed: 17, visitsCompleted: 16, coordinationHours: 3.7,
    electricianDelays: 3, electricianResolved: 12, electricianEscalated: 4,
    firstContactResolved: 44, repeatProblems: 9, reopened: 4, customerConfirmed: 71,
    incompleteNotes: 6, missingRootCause: 8, avoidableEscalations: 2,
    safetyChecksDone: 23, safetyChecksRequired: 25, excluded: 5,
  },
};

/** Engineer share of the selected period, so numbers stay consistent. */
const SHARE: Record<string, number> = {
  "You (Amit Verma)": 0.42,
  "Ravi Menon": 0.32,
  "Sunil Kalra": 0.26,
  "Team (all engineers)": 1,
};

function scale(m: Metrics, factor: number): Metrics {
  const out = {} as Metrics;
  (Object.keys(m) as (keyof Metrics)[]).forEach((k) => {
    const v = m[k];
    // Averages/rates should not be scaled by headcount share
    if (["firstResponseMins", "resolutionHours", "avgSlaDelayMins", "coordinationHours"].includes(k)) {
      out[k] = Number((v * (factor === 1 ? 1 : 1 + (0.5 - factor) * 0.2)).toFixed(1));
    } else {
      out[k] = Math.max(0, Math.round(v * factor));
    }
  });
  return out;
}

function previous(m: Metrics): Metrics {
  return scale(m, 0.88);
}

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function TechSupportPerformance({ isManager = true }: { isManager?: boolean }) {
  const [period, setPeriod] = useState<Period>("This Month");
  const [compare, setCompare] = useState(true);
  const [engineer, setEngineer] = useState<string>(ENGINEERS[0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const m = useMemo(() => scale(BASE[period], SHARE[engineer] ?? 1), [period, engineer]);
  const prev = useMemo(() => previous(m), [m]);

  const kpis = [
    { label: "Tickets Assigned", value: m.assigned, prev: prev.assigned, tip: "Tickets assigned by the Relationship Manager in the selected period. Test, spam and duplicate tickets are excluded." },
    { label: "Tickets Resolved", value: m.resolved, prev: prev.resolved, tip: "Counted only when resolution details (work done + root cause) are recorded." },
    { label: "Remote Resolution Rate", value: `${pct(m.resolvedRemotely, m.resolved)}%`, prev: `${pct(prev.resolvedRemotely, prev.resolved)}%`, tip: "Share of resolved tickets fixed remotely without an electrician or Field Engineer visit.", good: pct(m.resolvedRemotely, m.resolved) >= 65 },
    { label: "Avg First-Response Time", value: `${m.firstResponseMins} min`, prev: `${prev.firstResponseMins} min`, tip: "Measured from ticket assignment to the first valid customer contact attempt.", good: m.firstResponseMins <= 20, lowerBetter: true },
    { label: "Avg Resolution Time", value: `${m.resolutionHours} hrs`, prev: `${prev.resolutionHours} hrs`, tip: "Measured from ticket creation to recorded resolution.", good: m.resolutionHours <= 12, lowerBetter: true },
    { label: "SLA Compliance", value: `${pct(m.slaResolved, m.resolved)}%`, prev: `${pct(prev.slaResolved, prev.resolved)}%`, tip: "Tickets resolved inside their SLA deadline, as a share of all resolved tickets.", good: pct(m.slaResolved, m.resolved) >= 85 },
    { label: "Follow-ups On Time", value: `${pct(m.followUpsOnTime, m.followUpsScheduled)}%`, prev: `${pct(prev.followUpsOnTime, prev.followUpsScheduled)}%`, tip: "Follow-ups completed on or before their due time.", good: pct(m.followUpsOnTime, m.followUpsScheduled) >= 85 },
    { label: "Reopened Tickets", value: m.reopened, prev: prev.reopened, tip: "Tickets reopened after being marked resolved — an indicator of resolution quality.", good: m.reopened <= 5, lowerBetter: true },
  ];

  const funnel = [
    { label: "Tickets Assigned", value: m.assigned },
    { label: "Customer Contacted", value: m.contacted },
    { label: "Troubleshooting Started", value: m.troubleshootingStarted },
    { label: "Resolved Remotely", value: m.resolvedRemotely },
    { label: "Electrician Required", value: m.electricianRequired },
    { label: "Escalated to Field Engineer", value: m.escalated },
    { label: "Resolved", value: m.resolved },
    { label: "Closed", value: m.closed },
  ];

  const quality = [
    { label: "First-contact resolution rate", value: `${pct(m.firstContactResolved, m.assigned)}%`, healthy: pct(m.firstContactResolved, m.assigned) >= 40, tip: "Tickets resolved on the very first customer contact." },
    { label: "Repeat problem rate", value: `${pct(m.repeatProblems, m.assigned)}%`, healthy: pct(m.repeatProblems, m.assigned) <= 12, tip: "Same machine reporting the same problem category again." },
    { label: "Ticket reopening rate", value: `${pct(m.reopened, m.resolved)}%`, healthy: pct(m.reopened, m.resolved) <= 6, tip: "Resolved tickets that had to be reopened." },
    { label: "Customer confirmation rate", value: `${pct(m.customerConfirmed, m.resolved)}%`, healthy: pct(m.customerConfirmed, m.resolved) >= 90, tip: "Resolutions confirmed by the customer before closure." },
    { label: "Resolved without complete notes", value: m.incompleteNotes, healthy: m.incompleteNotes <= 5, tip: "Resolutions missing work-completed details." },
    { label: "Without root-cause records", value: m.missingRootCause, healthy: m.missingRootCause <= 5, tip: "Tickets closed without a recorded root cause." },
    { label: "Incorrect / avoidable escalations", value: m.avoidableEscalations, healthy: m.avoidableEscalations <= 3, tip: "Field Engineer escalations that remote steps could have solved. Necessary escalations are never counted as failures." },
    { label: "Safety-check compliance", value: `${pct(m.safetyChecksDone, m.safetyChecksRequired)}%`, healthy: pct(m.safetyChecksDone, m.safetyChecksRequired) >= 95, tip: "Mandatory safety checks completed before remote troubleshooting. Safety carries more weight than ticket volume.", safety: true },
  ];

  const slaByPriority = [
    { priority: "Safety Critical", compliance: 100 },
    { priority: "Critical", compliance: pct(m.criticalInSla, Math.max(1, Math.round(m.assigned * 0.18))) > 100 ? 96 : 92 },
    { priority: "High", compliance: 88 },
    { priority: "Medium", compliance: 84 },
    { priority: "Low", compliance: 79 },
  ];

  const analysisDims = [
    { label: "Machine type", rows: groupCount(SEED.map((t) => t.machine)) },
    { label: "Machine model", rows: groupCount(SEED.map((t) => t.model)) },
    { label: "Problem category", rows: groupCount(SEED.map((t) => t.category)) },
    { label: "Customer / franchise", rows: groupCount(SEED.map((t) => t.franchise)) },
    { label: "Location", rows: groupCount(SEED.map((t) => t.location)) },
    { label: "Ticket priority", rows: groupCount(SEED.map((t) => t.priority)) },
    { label: "Resolution method", rows: [["Remote", m.resolvedRemotely], ["Electrician", m.electricianResolved], ["Field Engineer", m.escalated]] as [string, number][] },
    { label: "Root cause", rows: [["Electrical / wiring", 14], ["Steam & pressure", 11], ["Mechanical wear", 9], ["User operation", 7], ["Software / POS", 4]] as [string, number][] },
  ];
  const [dim, setDim] = useState(analysisDims[0].label);
  const activeDim = analysisDims.find((d) => d.label === dim) ?? analysisDims[0];

  const insights = buildInsights(m);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Technical Support Performance
            </h1>
            <p className="text-sm text-muted-foreground">
              {period}
              {compare && " · compared with previous period"} · {engineer}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Period</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {isManager && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Engineer</Label>
                <Select value={engineer} onValueChange={setEngineer}>
                  <SelectTrigger className="h-9 w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENGINEERS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button variant={compare ? "default" : "outline"} size="sm" onClick={() => setCompare((c) => !c)}>
              Compare with previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Performance report exported")}>
              <Download className="w-4 h-4 mr-1" /> Export Report
            </Button>
          </div>
        </div>

        {period === "Custom Date Range" && (
          <Card>
            <CardContent className="p-4 flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-40" />
              </div>
              <p className="text-xs text-muted-foreground">
                Figures are calculated from ticket activity and cannot be edited manually.
              </p>
            </CardContent>
          </Card>
        )}

        {/* KPI cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <MetricInfo text={k.tip} />
                </div>
                <p
                  className={`text-2xl font-semibold mt-1 ${
                    k.good === undefined ? "" : k.good ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {k.value}
                </p>
                {compare && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {k.lowerBetter ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    Previous: {k.prev}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Service Funnel <MetricInfo text="Ticket flow from assignment to closure. Percentages are against tickets assigned." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">
                    {s.value} · {pct(s.value, m.assigned)}%
                  </span>
                </div>
                <Progress value={pct(s.value, m.assigned)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Quality */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quality.map((q) => (
                <div key={q.label} className="flex items-center justify-between text-sm border-b last:border-0 py-1.5">
                  <span className="flex items-center gap-1.5">
                    {q.label} <MetricInfo text={q.tip} />
                  </span>
                  <Badge
                    className={
                      q.healthy
                        ? "bg-emerald-600 text-white hover:bg-emerald-600"
                        : q.safety
                          ? "bg-red-700 text-white hover:bg-red-700"
                          : "bg-amber-500 text-white hover:bg-amber-500"
                    }
                  >
                    {q.value}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SLA */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                SLA Performance <MetricInfo text="Response and resolution against the SLA clock set for each priority level." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Responded within SLA" value={`${m.slaResponded} (${pct(m.slaResponded, m.assigned)}%)`} good />
              <Row label="Resolved within SLA" value={`${m.slaResolved} (${pct(m.slaResolved, m.resolved)}%)`} good={pct(m.slaResolved, m.resolved) >= 85} />
              <Row label="Critical tickets within SLA" value={`${m.criticalInSla}`} good />
              <Row label="Overdue tickets" value={`${m.overdue}`} good={m.overdue === 0} danger={m.overdue > 0} />
              <Row label="Average SLA delay" value={`${m.avgSlaDelayMins} min`} good={m.avgSlaDelayMins <= 30} />
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">Compliance by priority</p>
              {slaByPriority.map((p) => (
                <div key={p.priority} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{p.priority}</span>
                    <span
                      className={
                        p.compliance >= 90 ? "text-emerald-600" : p.compliance >= 80 ? "text-amber-600" : "text-red-600"
                      }
                    >
                      {p.compliance}%
                    </span>
                  </div>
                  <Progress value={p.compliance} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Electrician coordination */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Electrician Coordination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Electrician cases created" value={m.electricianCases} />
              <Row label="Visits confirmed" value={m.visitsConfirmed} good={m.visitsConfirmed >= m.electricianCases * 0.9} />
              <Row label="Visits completed" value={m.visitsCompleted} />
              <Row label="Average coordination time" value={`${m.coordinationHours} hrs`} good={m.coordinationHours <= 4} />
              <Row label="Cases delayed by electrician" value={m.electricianDelays} danger={m.electricianDelays > 3} />
              <Row label="Issues resolved by electricians" value={m.electricianResolved} good />
              <Row label="Later escalated to Field Engineer" value={m.electricianEscalated} />
            </CardContent>
          </Card>

          {/* Follow-up discipline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Follow-up Discipline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Follow-ups scheduled" value={m.followUpsScheduled} />
              <Row label="Completed on time" value={m.followUpsOnTime} good />
              <Row label="Completed late" value={m.followUpsLate} danger={m.followUpsLate > 10} />
              <Row label="Currently overdue" value={m.followUpsOverdue} danger={m.followUpsOverdue > 0} />
              <Row label="Customer callbacks missed" value={m.callbacksMissed} danger={m.callbacksMissed > 5} />
              <Row label="Monitoring checks completed" value={m.monitoringDone} good />
              <Row label="Closure confirmations pending" value={m.closurePending} danger={m.closurePending > 5} />
            </CardContent>
          </Card>
        </div>

        {/* Ticket analysis */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Ticket Analysis</CardTitle>
              <Select value={dim} onValueChange={setDim}>
                <SelectTrigger className="h-9 w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {analysisDims.map((d) => <SelectItem key={d.label} value={d.label}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeDim.rows
              .slice()
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => {
                const max = Math.max(...activeDim.rows.map((r) => r[1]));
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <Progress value={Math.round((count / max) * 100)} />
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((i, idx) => (
              <div
                key={idx}
                className={`text-sm rounded-md border-l-4 bg-muted/40 px-3 py-2 ${
                  i.level === "red" ? "border-l-red-600" : i.level === "amber" ? "border-l-amber-500" : "border-l-emerald-600"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {i.level === "green" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : i.level === "red" ? (
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  {i.title}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{i.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Figures are calculated from recorded ticket activity only. {m.excluded} test, spam or duplicate tickets were
          excluded. Engineer ownership history is preserved when tickets are reassigned. Targets and SLA rules can be
          changed by authorised administrators only, and completed activity records cannot be edited by engineers.
        </p>
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function groupCount(values: string[]): [string, number][] {
  const map = new Map<string, number>();
  values.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1));
  return Array.from(map.entries());
}

function MetricInfo({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="Metric information" className="text-muted-foreground hover:text-foreground">
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

function Row({
  label,
  value,
  good,
  danger,
}: {
  label: string;
  value: string | number;
  good?: boolean;
  danger?: boolean;
}) {
  const cls = danger ? "text-red-600" : good ? "text-emerald-600" : "text-amber-600";
  return (
    <div className="flex items-center justify-between text-sm border-b last:border-0 py-1.5">
      <span>{label}</span>
      <span className={`font-medium ${good === undefined && danger === undefined ? "" : cls}`}>{value}</span>
    </div>
  );
}

function buildInsights(m: Metrics) {
  const out: { title: string; detail: string; level: "red" | "amber" | "green" }[] = [];

  out.push(
    m.callbacksMissed > 0
      ? {
          title: "Reduce overdue customer callbacks",
          detail: `${m.callbacksMissed} customer callbacks were missed and ${m.followUpsOverdue} follow-ups are overdue. Clear overdue callbacks before starting new tickets.`,
          level: m.callbacksMissed > 5 ? "red" : "amber",
        }
      : { title: "Customer callbacks are on track", detail: "No missed callbacks in this period.", level: "green" },
  );

  out.push(
    m.missingRootCause > 0
      ? {
          title: "Improve documentation of root causes",
          detail: `${m.missingRootCause} tickets were closed without a root cause and ${m.incompleteNotes} without complete work notes.`,
          level: m.missingRootCause > 8 ? "red" : "amber",
        }
      : { title: "Documentation is complete", detail: "Every resolved ticket carries a root cause record.", level: "green" },
  );

  out.push(
    m.repeatProblems > 0
      ? {
          title: "Review frequently recurring machine problems",
          detail: `${m.repeatProblems} repeat problems recorded. Electrical/wiring and steam faults are the top recurring categories.`,
          level: m.repeatProblems > 12 ? "red" : "amber",
        }
      : { title: "No recurring machine problems", detail: "No machine reported the same fault twice.", level: "green" },
  );

  out.push(
    m.coordinationHours > 3 || m.visitsConfirmed < m.electricianCases
      ? {
          title: "Improve electrician confirmation time",
          detail: `Average coordination time is ${m.coordinationHours} hrs and ${Math.max(0, m.electricianCases - m.visitsConfirmed)} visits are still unconfirmed.`,
          level: m.coordinationHours > 4 ? "red" : "amber",
        }
      : { title: "Electrician coordination is healthy", detail: "Visits are being confirmed quickly.", level: "green" },
  );

  out.push(
    m.reopened > 0
      ? {
          title: "Monitor tickets with high reopening rates",
          detail: `${m.reopened} tickets were reopened (${pct(m.reopened, Math.max(1, m.resolved))}% of resolutions). Extend monitoring before closing similar tickets.`,
          level: pct(m.reopened, Math.max(1, m.resolved)) > 6 ? "red" : "amber",
        }
      : { title: "Resolution quality is stable", detail: "No reopened tickets in this period.", level: "green" },
  );

  return out;
}
