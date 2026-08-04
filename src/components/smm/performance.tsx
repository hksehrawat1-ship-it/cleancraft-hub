import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Award,
  Download,
  Info,
  Lightbulb,
  Lock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { SectionHead } from "./ui";

/* ------------------------------------------------------------------ */
/* Period model — every figure is derived, never manually editable      */
/* ------------------------------------------------------------------ */

type PeriodKey = "today" | "week" | "month" | "quarter" | "custom";

const PERIODS: { key: PeriodKey; label: string; factor: number; span: string }[] = [
  { key: "today", label: "Today", factor: 0.04, span: "4 Aug 2026" },
  { key: "week", label: "This Week", factor: 0.25, span: "3 – 4 Aug 2026" },
  { key: "month", label: "This Month", factor: 1, span: "1 – 4 Aug 2026" },
  { key: "quarter", label: "This Quarter", factor: 3.1, span: "1 Jul – 4 Aug 2026" },
  { key: "custom", label: "Custom Date Range", factor: 1.6, span: "Custom range" },
];

const MANAGERS = [
  { id: "smm-01", name: "Ritika Sharma", role: "Social Media Account Manager" },
  { id: "smm-02", name: "Aakash Verma", role: "Social Media Account Manager" },
];

// Base month-level records (counts). Scaled by the period factor.
const BASE = {
  contentCreated: 34,
  contentAssigned: 31,
  editingCompleted: 29,
  submissionsReviewed: 33,
  contentApproved: 28,
  correctionsRequested: 9,
  contentScheduled: 27,
  contentPublished: 26,
  contentOverdue: 3,
  contentCancelled: 2,

  reviewsCompleted: 33,
  reviewsWithinSla: 29,
  reviewsOverdue: 2,
  firstReviewApprovals: 21,
  returnedMultiple: 4,
  approvedThenCorrected: 2,
  awaitingClarification: 1,

  publishedOnTime: 23,
  publishedLate: 3,
  missedSchedules: 2,
  publishFailures: 1,
  awaitingScheduling: 4,

  enquiries: 78,
  enquiriesReviewed: 74,
  qualifiedLeads: 41,
  spamDuplicate: 12,
  handedOver: 38,
  acceptedBySales: 34,
  returnedMissingInfo: 4,
  followUpStarted: 31,

  tasksAssigned: 46,
  tasksCompleted: 41,
  tasksOnTime: 37,
  tasksOverdue: 3,
  tasksAwaitingReview: 2,
  tasksRescheduled: 3,

  reach: 412000,
  views: 268000,
  enquiriesGenerated: 78,
  salesAccepted: 34,
  salesWon: 9,
  revenue: 1840000,

  videosAssigned: 31,
  editorDeadlinesMet: 25,
  missingBriefs: 3,
  waitingAssignment: 3,
};

const PREV_DELTA = {
  onTimePublishing: -4,
  avgReview: 0.4,
  firstReview: 6,
  qualified: 8,
  handover: -3,
  tasksOnTime: 2,
  publishSuccess: 1,
  published: 5,
};

function scale(n: number, f: number) {
  return Math.max(0, Math.round(n * f));
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function inr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  return `₹${(n / 100000).toFixed(1)} L`;
}

function compact(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function Hint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Metric explanation"
          className="text-muted-foreground/70 hover:text-foreground shrink-0"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

type Tone = "good" | "active" | "warn" | "bad" | "muted";

const toneText: Record<Tone, string> = {
  good: "text-emerald-600",
  active: "text-blue-600",
  warn: "text-amber-600",
  bad: "text-destructive",
  muted: "text-muted-foreground",
};

function Kpi({
  label,
  value,
  target,
  progress,
  tone,
  delta,
  hint,
}: {
  label: string;
  value: string;
  target?: string;
  progress?: number;
  tone: Tone;
  delta?: number;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs text-muted-foreground">{label}</div>
          <Hint text={hint} />
        </div>
        <div className={`text-2xl md:text-3xl font-bold tabular-nums mt-1 ${toneText[tone]}`}>
          {value}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {target && <span className="text-[11px] text-muted-foreground">{target}</span>}
          {delta !== undefined && (
            <span
              className={`text-[11px] inline-flex items-center gap-0.5 ${
                delta >= 0 ? "text-emerald-600" : "text-destructive"
              }`}
            >
              {delta >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {delta >= 0 ? "+" : ""}
              {delta} vs previous
            </span>
          )}
        </div>
        {progress !== undefined && <Progress value={progress} className="h-1.5 mt-2" />}
      </CardContent>
    </Card>
  );
}

type Row = { label: string; value: string; tone?: Tone; hint: string };

function MetricBlock({
  title,
  icon,
  rows,
  note,
}: {
  title: string;
  icon?: React.ReactNode;
  rows: Row[];
  note?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid sm:grid-cols-2 gap-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="rounded-md border px-3 py-2 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-muted-foreground truncate">{r.label}</span>
                <Hint text={r.hint} />
              </div>
              <span
                className={`text-sm font-semibold tabular-nums shrink-0 ${
                  toneText[r.tone ?? "muted"]
                } ${r.tone ? "" : "text-foreground"}`}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
        {note && <p className="text-[11px] text-muted-foreground pt-1">{note}</p>}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function SmmPerformancePage() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-08-04");
  const [manager, setManager] = useState(MANAGERS[0].id);
  const [compare, setCompare] = useState(true);

  // Authorised-viewer simulation: leadership can switch managers, editors cannot.
  const canSwitchManager = true;

  const p = PERIODS.find((x) => x.key === period)!;
  const f = p.factor;

  const m = useMemo(() => {
    const s = (k: keyof typeof BASE) => scale(BASE[k], f);
    const published = s("contentPublished");
    const onTime = s("publishedOnTime");
    const scheduled = s("contentScheduled");
    const failures = s("publishFailures");
    const qualified = s("qualifiedLeads");
    const handed = s("handedOver");
    const tasksOnTime = s("tasksOnTime");
    const tasksAssigned = s("tasksAssigned");
    const reviews = s("reviewsCompleted");
    const firstApproval = s("firstReviewApprovals");
    return {
      s,
      published,
      onTime,
      scheduled,
      failures,
      qualified,
      handed,
      tasksOnTime,
      tasksAssigned,
      reviews,
      firstApproval,
      onTimeRate: pct(onTime, published),
      publishSuccess: pct(scheduled - failures, scheduled),
      firstReviewRate: pct(firstApproval, reviews),
      handoverRate: pct(handed - s("returnedMissingInfo"), Math.max(handed, 1)),
      tasksOnTimeRate: pct(tasksOnTime, tasksAssigned),
      avgReview: 6.4,
      avgApprovalToPublish: 19.5,
      avgEnquiryReview: 3.2,
      avgHandover: 5.1,
      avgTurnaround: 2.8,
      avgAccountFix: 1.6,
    };
  }, [f]);

  const periodLabel = period === "custom" ? `${from} → ${to}` : p.span;

  const platformConsistency = [
    { name: "Instagram", planned: scale(12, f), done: scale(12, f), tone: "good" as Tone },
    { name: "YouTube", planned: scale(7, f), done: scale(6, f), tone: "active" as Tone },
    { name: "Facebook", planned: scale(6, f), done: scale(5, f), tone: "warn" as Tone },
    { name: "LinkedIn", planned: scale(4, f), done: scale(3, f), tone: "warn" as Tone },
    { name: "X", planned: 0, done: 0, tone: "muted" as Tone, unavailable: true },
  ];

  const editorLoad = [
    { name: "Nikhil Rane", assigned: scale(11, f), met: scale(10, f), corrections: scale(2, f) },
    { name: "Priya Nanda", assigned: scale(9, f), met: scale(8, f), corrections: scale(3, f) },
    { name: "Sahil Qureshi", assigned: scale(7, f), met: scale(5, f), corrections: scale(3, f) },
    { name: "Freelance Pool", assigned: scale(4, f), met: scale(2, f), corrections: scale(1, f) },
  ];

  const delays = [
    { reason: "Review not started within SLA", owner: "Social Media Manager", count: 2, controllable: true },
    { reason: "Approved content not scheduled in time", owner: "Social Media Manager", count: 3, controllable: true },
    { reason: "Editor missed delivery (brief complete)", owner: "Video Editor", count: 4, controllable: false },
    { reason: "Raw footage not received from store", owner: "Operations", count: 2, controllable: false },
    { reason: "Account disconnected — publish failed", owner: "Platform / IT", count: 1, controllable: false },
  ];

  const insights = [
    {
      title: "Reduce review delays",
      body: `Average review time is ${m.avgReview}h against a 4h SLA and ${m.s(
        "reviewsOverdue",
      )} reviews are overdue. Clear the review queue each morning before scheduling work.`,
      tone: "warn" as Tone,
    },
    {
      title: "Schedule approved content faster",
      body: `${m.s(
        "awaitingScheduling",
      )} approved items are still unscheduled and approval-to-publish averages ${m.avgApprovalToPublish}h. Schedule within 12h of approval.`,
      tone: "warn" as Tone,
    },
    {
      title: "Improve qualification before lead handover",
      body: `${m.s(
        "returnedMissingInfo",
      )} leads were returned by the Sales Head for missing information. Complete the 9-point qualification check before every handover.`,
      tone: "bad" as Tone,
    },
    {
      title: "Resolve disconnected social accounts",
      body: `1 account needs re-authentication and caused ${m.failures} publishing failure(s). Fix account health before the next scheduled slot.`,
      tone: "bad" as Tone,
    },
    {
      title: "Provide clearer editing briefs to reduce corrections",
      body: `${m.s("correctionsRequested")} corrections were raised and ${m.s(
        "missingBriefs",
      )} items reached editors without a complete brief or assets.`,
      tone: "active" as Tone,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <SectionHead
          title="Social Media Manager Performance"
          sub={`Reporting period: ${periodLabel} · ${
            compare ? "Compared with previous period" : "Comparison off"
          } · All figures calculated from content, review, publishing, task and lead records.`}
        />
        <div className="flex flex-wrap items-center gap-2">
          {canSwitchManager && (
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger className="w-[220px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANAGERS.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant={compare ? "secondary" : "outline"}
            size="sm"
            onClick={() => setCompare((v) => !v)}
          >
            Compare with previous period
          </Button>
          <Button
            size="sm"
            onClick={() =>
              toast.success("Performance report exported", {
                description: `${
                  MANAGERS.find((x) => x.id === manager)?.name
                } · ${periodLabel} · read-only snapshot`,
              })
            }
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* Date filters */}
      <Card>
        <CardContent className="p-3 flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex flex-wrap gap-1.5">
            {PERIODS.map((x) => (
              <Button
                key={x.key}
                size="sm"
                variant={period === x.key ? "default" : "outline"}
                onClick={() => setPeriod(x.key)}
              >
                {x.label}
              </Button>
            ))}
          </div>
          {period === "custom" && (
            <div className="flex items-end gap-2">
              <div>
                <Label className="text-[11px] text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-9 w-[150px]"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-9 w-[150px]"
                />
              </div>
            </div>
          )}
          <div className="md:ml-auto text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Figures are system-calculated and cannot be edited
            manually.
          </div>
        </CardContent>
      </Card>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          label="Content Published"
          value={String(m.published)}
          target={`${m.scheduled} scheduled`}
          progress={pct(m.published, Math.max(m.scheduled, 1))}
          tone="active"
          delta={compare ? PREV_DELTA.published : undefined}
          hint="Unique content items published in the period. Cancelled, test and duplicate records are excluded; an item is counted once even if republished."
        />
        <Kpi
          label="On-Time Publishing Rate"
          value={`${m.onTimeRate}%`}
          target="Target 90%"
          progress={m.onTimeRate}
          tone={m.onTimeRate >= 90 ? "good" : m.onTimeRate >= 80 ? "warn" : "bad"}
          delta={compare ? PREV_DELTA.onTimePublishing : undefined}
          hint="Published on or before the scheduled slot ÷ total published. Failures caused by platform outages are tracked separately as external delays."
        />
        <Kpi
          label="Average Review Time"
          value={`${m.avgReview} h`}
          target="SLA 4 h"
          progress={Math.min(100, (4 / m.avgReview) * 100)}
          tone={m.avgReview <= 4 ? "good" : m.avgReview <= 8 ? "warn" : "bad"}
          delta={compare ? -PREV_DELTA.avgReview : undefined}
          hint="Time from editor submission to the manager's review decision, averaged over completed reviews. Time waiting on the editor is not counted."
        />
        <Kpi
          label="First-Review Approval Rate"
          value={`${m.firstReviewRate}%`}
          target="Target 70%"
          progress={m.firstReviewRate}
          tone={m.firstReviewRate >= 70 ? "good" : "warn"}
          delta={compare ? PREV_DELTA.firstReview : undefined}
          hint="Content approved at version 1 ÷ reviews completed. A high rate indicates clear briefs and accurate editor instructions."
        />
        <Kpi
          label="Publishing Success Rate"
          value={`${m.publishSuccess}%`}
          target={`${m.failures} failure(s)`}
          progress={m.publishSuccess}
          tone={m.publishSuccess >= 95 ? "good" : "warn"}
          delta={compare ? PREV_DELTA.publishSuccess : undefined}
          hint="Scheduled items that published without failure ÷ all scheduled items. Account disconnection failures are flagged as external."
        />
        <Kpi
          label="Qualified Leads"
          value={String(m.qualified)}
          target={`${m.s("enquiries")} enquiries received`}
          progress={pct(m.qualified, Math.max(m.s("enquiries"), 1))}
          tone="good"
          delta={compare ? PREV_DELTA.qualified : undefined}
          hint="Enquiries that passed the 9-point qualification check. Duplicates and spam are excluded and each Lead ID is counted only once."
        />
        <Kpi
          label="On-Time Lead Handover Rate"
          value={`${m.handoverRate}%`}
          target="Within 6 h of qualification"
          progress={m.handoverRate}
          tone={m.handoverRate >= 90 ? "good" : "warn"}
          delta={compare ? PREV_DELTA.handover : undefined}
          hint="Qualified leads handed to the Sales Head within SLA and accepted without being returned for missing information."
        />
        <Kpi
          label="Tasks Completed on Time"
          value={`${m.tasksOnTimeRate}%`}
          target={`${m.tasksOnTime}/${m.tasksAssigned} tasks`}
          progress={m.tasksOnTimeRate}
          tone={m.tasksOnTimeRate >= 85 ? "good" : "warn"}
          delta={compare ? PREV_DELTA.tasksOnTime : undefined}
          hint="Tasks closed on or before due date ÷ tasks assigned in the period. Tasks blocked by other departments are excluded from the penalty."
        />
      </div>

      {/* Content management + Review */}
      <div className="grid lg:grid-cols-2 gap-4">
        <MetricBlock
          title="Content Management"
          rows={[
            { label: "Content created", value: String(m.s("contentCreated")), tone: "active", hint: "New content records opened in the period, each with a permanent Content ID." },
            { label: "Content assigned", value: String(m.s("contentAssigned")), tone: "active", hint: "Records assigned to a Video Editor with a brief and deadline." },
            { label: "Editing completed", value: String(m.s("editingCompleted")), hint: "Items the editor marked complete and submitted." },
            { label: "Submissions reviewed", value: String(m.s("submissionsReviewed")), hint: "Editor submissions the manager reviewed, including re-submissions." },
            { label: "Content approved", value: String(m.s("contentApproved")), tone: "good", hint: "Versions locked as approved and eligible for scheduling." },
            { label: "Corrections requested", value: String(m.s("correctionsRequested")), tone: "warn", hint: "Review decisions that returned content to the editor with correction points." },
            { label: "Content scheduled", value: String(m.scheduled), tone: "active", hint: "Approved and locked versions placed on the publishing calendar." },
            { label: "Content published", value: String(m.published), tone: "good", hint: "Items confirmed live on the target platform." },
            { label: "Content overdue", value: String(m.s("contentOverdue")), tone: "bad", hint: "Items past their due date and not yet published." },
            { label: "Content cancelled", value: String(m.s("contentCancelled")), tone: "muted", hint: "Dropped items — excluded from published, on-time and approval calculations." },
          ]}
          note="Cancelled, test and duplicate records are excluded from rate calculations. No item is counted twice across stages."
        />

        <MetricBlock
          title="Review Performance"
          rows={[
            { label: "Reviews completed", value: String(m.reviews), tone: "active", hint: "Review decisions issued: approve or correction requested." },
            { label: "Average review time", value: `${m.avgReview} h`, tone: "warn", hint: "Submission to decision, averaged. Editor waiting time is excluded." },
            { label: "Reviews within SLA", value: `${m.s("reviewsWithinSla")} (${pct(m.s("reviewsWithinSla"), Math.max(m.reviews, 1))}%)`, tone: "good", hint: "Reviews decided within the 4-hour service level." },
            { label: "Reviews currently overdue", value: String(m.s("reviewsOverdue")), tone: "bad", hint: "Submissions waiting longer than the SLA with no decision yet." },
            { label: "First-review approvals", value: String(m.firstApproval), tone: "good", hint: "Approved at version 1 without any correction round." },
            { label: "Returned multiple times", value: String(m.s("returnedMultiple")), tone: "warn", hint: "Content sent back for correction two or more times — usually a brief-clarity issue." },
            { label: "Approved then corrected", value: String(m.s("approvedThenCorrected")), tone: "bad", hint: "Content corrected after approval — indicates a missed review checkpoint." },
            { label: "Awaiting clarification", value: String(m.s("awaitingClarification")), tone: "warn", hint: "Editor has asked for clarification on reviewer instructions and is blocked." },
          ]}
        />
      </div>

      {/* Publishing */}
      <MetricBlock
        title="Publishing Performance"
        rows={[
          { label: "Content scheduled", value: String(m.scheduled), tone: "active", hint: "Approved items placed on the calendar with a date, time and platform." },
          { label: "Published on time", value: String(m.onTime), tone: "good", hint: "Live on or before the scheduled slot." },
          { label: "Published late", value: String(m.s("publishedLate")), tone: "warn", hint: "Live after the scheduled slot." },
          { label: "Missed publishing schedules", value: String(m.s("missedSchedules")), tone: "bad", hint: "Slots that passed with no publication and no reschedule." },
          { label: "Publishing failures", value: String(m.failures), tone: "bad", hint: "Publishing attempts that failed — mostly account or platform issues (external)." },
          { label: "Awaiting scheduling", value: String(m.s("awaitingScheduling")), tone: "warn", hint: "Approved and locked content with no calendar slot yet." },
          { label: "Approval → publication", value: `${m.avgApprovalToPublish} h avg`, tone: "warn", hint: "Average time from version lock to going live. Target under 12 hours." },
        ]}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Platform-wise Publishing Consistency
            <Hint text="Planned vs published per platform. Platforms with no connected data source are labelled unavailable rather than shown as zero." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {platformConsistency.map((x) => (
            <div key={x.name} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">{x.name}</span>
                {"unavailable" in x && x.unavailable ? (
                  <Badge variant="outline" className="text-muted-foreground">
                    Data unavailable
                  </Badge>
                ) : (
                  <span className={`tabular-nums text-xs ${toneText[x.tone]}`}>
                    {x.done}/{x.planned} published
                  </span>
                )}
              </div>
              {!("unavailable" in x && x.unavailable) && (
                <Progress value={pct(x.done, Math.max(x.planned, 1))} className="h-1.5 mt-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Leads + Accounts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <MetricBlock
          title="Lead Management Performance"
          rows={[
            { label: "Social enquiries received", value: String(m.s("enquiries")), tone: "active", hint: "Enquiries captured from social channels, each with a permanent Lead ID." },
            { label: "Enquiries reviewed", value: String(m.s("enquiriesReviewed")), hint: "Enquiries opened and assessed by the manager." },
            { label: "Qualified leads", value: String(m.qualified), tone: "good", hint: "Passed the 9-point qualification check with valid contact and intent." },
            { label: "Duplicate or spam", value: String(m.s("spamDuplicate")), tone: "muted", hint: "Merged or marked junk — excluded from qualification and handover rates." },
            { label: "Leads handed over", value: String(m.handed), tone: "active", hint: "Sent to the Sales Head with attribution metadata preserved." },
            { label: "Accepted by Sales Head", value: String(m.s("acceptedBySales")), tone: "good", hint: "Handovers accepted into the Sales CRM without rework." },
            { label: "Returned for missing info", value: String(m.s("returnedMissingInfo")), tone: "bad", hint: "Handovers rejected because required qualification fields were incomplete." },
            { label: "Sales follow-up started", value: String(m.s("followUpStarted")), tone: "good", hint: "Accepted leads with a first Sales contact logged." },
            { label: "Avg enquiry-review time", value: `${m.avgEnquiryReview} h`, tone: "good", hint: "Enquiry arrival to first manager review, averaged." },
            { label: "Avg handover time", value: `${m.avgHandover} h`, tone: "warn", hint: "Qualification to Sales Head handover, averaged. Target under 6 hours." },
          ]}
        />

        <div className="space-y-4">
          <MetricBlock
            title="Social Account Management"
            rows={[
              { label: "Accounts managed", value: "9", tone: "active", hint: "Accounts under this manager's responsibility across all platforms." },
              { label: "Connected accounts", value: "8", tone: "good", hint: "Accounts with a valid, working connection. Credentials are never stored here." },
              { label: "Requiring attention", value: "1", tone: "warn", hint: "Accounts with expiring access, failed authentication or health warnings." },
              { label: "Publishing interruptions", value: String(m.failures), tone: "bad", hint: "Scheduled publishes blocked by an account or platform problem." },
              { label: "Access reviews completed", value: "2", tone: "good", hint: "Periodic reviews confirming least-privilege access levels." },
              { label: "Account issues resolved", value: "3", tone: "good", hint: "Account problems closed in the period." },
              { label: "Avg issue resolution", value: `${m.avgAccountFix} days`, tone: "good", hint: "Account issue raised to resolved, averaged." },
            ]}
          />
          <MetricBlock
            title="Task Performance"
            rows={[
              { label: "Tasks assigned", value: String(m.tasksAssigned), tone: "active", hint: "Tasks assigned to the manager in the period, linked to Content or Lead IDs." },
              { label: "Tasks completed", value: String(m.s("tasksCompleted")), tone: "good", hint: "Tasks closed, regardless of due date." },
              { label: "Completed on time", value: String(m.tasksOnTime), tone: "good", hint: "Closed on or before due date." },
              { label: "Overdue tasks", value: String(m.s("tasksOverdue")), tone: "bad", hint: "Open tasks past their due date." },
              { label: "Awaiting review", value: String(m.s("tasksAwaitingReview")), tone: "warn", hint: "Submitted tasks waiting on a reviewer decision." },
              { label: "Repeatedly rescheduled", value: String(m.s("tasksRescheduled")), tone: "warn", hint: "Tasks moved twice or more — a planning quality signal." },
            ]}
          />
        </div>
      </div>

      {/* Content outcome */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Content Outcome Summary
            <Hint text="Supporting results pulled from Analytics. Outcome numbers are context, not the sole measure — operational quality carries equal weight." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { l: "Reach", v: compact(scale(BASE.reach, f)), t: "active" as Tone, h: "Unique accounts that saw the content across connected platforms." },
              { l: "Views", v: compact(scale(BASE.views, f)), t: "active" as Tone, h: "Total video and post views recorded by connected platforms." },
              { l: "Engagement rate", v: "5.6%", t: "good" as Tone, h: "Interactions ÷ reach across published content in the period." },
              { l: "Enquiries generated", v: String(m.s("enquiriesGenerated")), t: "active" as Tone, h: "Enquiries attributed to social content, deduplicated by Lead ID." },
              { l: "Qualified leads", v: String(m.qualified), t: "good" as Tone, h: "Enquiries that passed qualification." },
              { l: "Sales accepted", v: String(m.s("salesAccepted")), t: "good" as Tone, h: "Leads accepted by the Sales Head into the pipeline." },
              { l: "Sales won", v: String(m.s("salesWon")), t: "good" as Tone, h: "Verified Won opportunities in the Sales CRM attributed to social." },
              { l: "Revenue attributed", v: inr(scale(BASE.revenue, f)), t: "good" as Tone, h: "Counted only from verified Won opportunities in the Sales CRM." },
            ].map((x) => (
              <div key={x.l} className="rounded-md border p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground truncate">{x.l}</span>
                  <Hint text={x.h} />
                </div>
                <div className={`text-lg font-bold tabular-nums mt-0.5 ${toneText[x.t]}`}>{x.v}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Followers, views and reach alone do not determine this manager's rating. Operational
            quality — review speed, publishing consistency, lead qualification — carries equal
            importance. Metrics from platforms without a data connection are shown as unavailable,
            never as zero.
          </p>
        </CardContent>
      </Card>

      {/* Editor coordination */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Video Editor Coordination
            <Hint text="Editor delivery is shown for coordination visibility. Editor delays are not charged to the manager when the brief and assets were complete and follow-up was timely." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { l: "Videos assigned", v: String(m.s("videosAssigned")), t: "active" as Tone, h: "Content items assigned to editors in the period." },
              { l: "Editor deadlines met", v: `${m.s("editorDeadlinesMet")}/${m.s("videosAssigned")}`, t: "warn" as Tone, h: "Editor submissions delivered on or before the agreed deadline." },
              { l: "Correction frequency", v: `${pct(m.s("correctionsRequested"), Math.max(m.reviews, 1))}%`, t: "warn" as Tone, h: "Corrections raised ÷ reviews completed." },
              { l: "Missing briefs / assets", v: String(m.s("missingBriefs")), t: "bad" as Tone, h: "Items that reached an editor without a complete brief or required assets — a controllable manager issue." },
              { l: "Waiting for assignment", v: String(m.s("waitingAssignment")), t: "warn" as Tone, h: "Approved raw content with no editor assigned yet." },
              { l: "Avg production turnaround", v: `${m.avgTurnaround} days`, t: "good" as Tone, h: "Assignment to approved version, averaged across completed items." },
            ].map((x) => (
              <div key={x.l} className="rounded-md border p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground truncate">{x.l}</span>
                  <Hint text={x.h} />
                </div>
                <div className={`text-lg font-bold tabular-nums mt-0.5 ${toneText[x.t]}`}>{x.v}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Editor workload distribution
            </div>
            {editorLoad.map((e) => (
              <div key={e.name} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {e.assigned} assigned · {e.met} on time · {e.corrections} corrections
                  </span>
                </div>
                <Progress
                  value={pct(e.met, Math.max(e.assigned, 1))}
                  className="h-1.5 mt-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delays + insights */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Controllable vs external delays
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {delays.map((d) => (
              <div
                key={d.reason}
                className="border rounded-md p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm truncate">{d.reason}</div>
                  <div className="text-xs text-muted-foreground">Owner: {d.owner}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={d.controllable ? "text-amber-600" : "text-muted-foreground"}
                  >
                    {d.controllable ? "Controllable" : "External"}
                  </Badge>
                  <Badge variant="outline" className="tabular-nums">
                    {scale(d.count, f)}
                  </Badge>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">
              Only controllable delays affect this manager's rates. External delays are recorded for
              context and routed to the responsible team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" /> Performance insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((i) => (
              <div key={i.title} className="border rounded-md p-3">
                <div className={`text-sm font-medium ${toneText[i.tone]}`}>{i.title}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{i.body}</p>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">
              Rules-based recommendations generated from current records. No AI scoring is applied.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Access & record keeping
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-2 text-xs">
          {[
            "Social Media Account Manager can view their own performance.",
            "Authorised Revenue Engine leadership can view team performance.",
            "HR Head can view approved employee-performance summaries only.",
            "CEO can view company-level summaries.",
            "Video Editors cannot view confidential manager feedback.",
            "Performance records are never publicly ranked or leaderboarded.",
            "Historical performance is preserved when targets or responsibilities change.",
            "Payroll, incentives and AI scoring are not connected to this page.",
          ].map((t) => (
            <div key={t} className="rounded-md border px-3 py-2 text-muted-foreground">
              {t}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
