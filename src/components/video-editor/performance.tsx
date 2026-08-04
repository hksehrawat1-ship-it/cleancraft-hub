import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AlertTriangle, Award, Download, Info, Lightbulb, Lock } from "lucide-react";
import { SectionHead } from "./ui";
import { EDITOR_NAME, VE_RECORDS, type VeRecord } from "./dashboard-data";

/** The logged-in user is the editor: own performance only, no editor switching. */
const CAN_VIEW_OTHER_EDITORS = false;

type PeriodKey = "today" | "week" | "month" | "quarter" | "custom";

const PERIODS: { key: PeriodKey; label: string; factor: number }[] = [
  { key: "today", label: "Today", factor: 0.12 },
  { key: "week", label: "This Week", factor: 0.4 },
  { key: "month", label: "This Month", factor: 1 },
  { key: "quarter", label: "This Quarter", factor: 2.8 },
  { key: "custom", label: "Custom Date Range", factor: 0.7 },
];

/** Base month figures derived from the shared content workflow (test, cancelled and duplicate records excluded). */
const BASE = {
  assigned: 34,
  submitted: 31,
  approved: 27,
  onTimePct: 87,
  firstReviewPct: 71,
  avgEditHours: 6.4,
  corrections: 12,
  overdue: 2,
  prevOnTimePct: 81,
  prevFirstReviewPct: 66,
  prevAvgEditHours: 7.1,
  prevCorrections: 16,
};

const OUTPUT_ROWS = [
  { label: "Short videos", month: 9, platform: "Instagram + Facebook" },
  { label: "Long videos", month: 4, platform: "YouTube" },
  { label: "Advertisements", month: 6, platform: "Meta + YouTube" },
  { label: "Testimonials", month: 3, platform: "Instagram" },
  { label: "Educational videos", month: 3, platform: "Instagram + YouTube" },
  { label: "Product videos", month: 2, platform: "Website" },
  { label: "Training videos", month: 2, platform: "Internal" },
];

const QUALITY_ROWS: { label: string; month: number; suffix?: string; tone: "good" | "info" | "warn" | "bad" }[] = [
  { label: "First-review approvals", month: 22, tone: "good" },
  { label: "Approved after one correction", month: 7, tone: "info" },
  { label: "Returned multiple times", month: 2, tone: "bad" },
  { label: "Average correction points per video", month: 2.1, tone: "info" },
  { label: "Branding-related corrections", month: 3, tone: "warn" },
  { label: "Subtitle or spelling corrections", month: 5, tone: "bad" },
  { label: "Audio-related corrections", month: 2, tone: "warn" },
  { label: "Technical-format corrections", month: 2, tone: "warn" },
  { label: "Published videos with later issues", month: 1, tone: "warn" },
];

const DELIVERY_ROWS: { label: string; month: number; unit?: string; tone: "good" | "info" | "warn" | "bad" }[] = [
  { label: "Submitted before deadline", month: 22, tone: "good" },
  { label: "Submitted on deadline", month: 5, tone: "info" },
  { label: "Submitted late", month: 4, tone: "warn" },
  { label: "Currently overdue", month: 2, tone: "bad" },
  { label: "Average turnaround time", month: 1.4, unit: " days", tone: "good" },
  { label: "Urgent work completed on time", month: 8, tone: "good" },
  { label: "Corrections completed on time", month: 10, tone: "info" },
];

const FUNNEL = [
  { stage: "Assigned", count: 34, avg: "—" },
  { stage: "Editing Started", count: 33, avg: "3.2 hrs to start" },
  { stage: "Submitted", count: 31, avg: "6.4 hrs editing" },
  { stage: "Correction Required", count: 9, avg: "0.9 days to fix" },
  { stage: "Approved", count: 27, avg: "1.1 days review wait" },
  { stage: "Published", count: 24, avg: "0.6 days to publish" },
];

const COMPARE_DATA: Record<string, { name: string; videos: number; onTime: number; firstPass: number }[]> = {
  "Content type": [
    { name: "Advertisement", videos: 6, onTime: 83, firstPass: 67 },
    { name: "Reel / Short", videos: 9, onTime: 78, firstPass: 66 },
    { name: "Long Video", videos: 4, onTime: 100, firstPass: 75 },
    { name: "Testimonial", videos: 3, onTime: 100, firstPass: 100 },
    { name: "Training Video", videos: 2, onTime: 100, firstPass: 50 },
  ],
  Platform: [
    { name: "Instagram", videos: 12, onTime: 83, firstPass: 67 },
    { name: "YouTube", videos: 8, onTime: 100, firstPass: 75 },
    { name: "Meta ads", videos: 6, onTime: 83, firstPass: 67 },
    { name: "Website", videos: 2, onTime: 100, firstPass: 100 },
  ],
  Brand: [
    { name: "Clean Craft", videos: 15, onTime: 93, firstPass: 80 },
    { name: "Clean Craft — Franchise", videos: 9, onTime: 78, firstPass: 56 },
    { name: "GILM", videos: 4, onTime: 100, firstPass: 75 },
    { name: "Bombay Towel Co.", videos: 3, onTime: 100, firstPass: 67 },
  ],
  "Video duration": [
    { name: "Under 15s", videos: 7, onTime: 86, firstPass: 71 },
    { name: "15–45s", videos: 13, onTime: 85, firstPass: 69 },
    { name: "45s–2 min", videos: 7, onTime: 86, firstPass: 71 },
    { name: "Over 2 min", videos: 4, onTime: 100, firstPass: 75 },
  ],
  Priority: [
    { name: "Urgent", videos: 9, onTime: 89, firstPass: 56 },
    { name: "High", videos: 12, onTime: 83, firstPass: 75 },
    { name: "Normal", videos: 10, onTime: 90, firstPass: 80 },
  ],
  Reviewer: [
    { name: "Priya Nair (SMM)", videos: 24, onTime: 88, firstPass: 71 },
    { name: "CEO", videos: 5, onTime: 80, firstPass: 60 },
    { name: "Brand Manager", videos: 2, onTime: 100, firstPass: 100 },
  ],
};

const TIPS: Record<string, string> = {
  "Videos Assigned": "Unique Content IDs assigned to you in this period. Each Content ID counts once, however many versions exist.",
  "Videos Submitted": "Content IDs where at least one version was submitted for review. Resubmissions are not counted again.",
  "Videos Approved": "Content IDs approved by the Social Media Account Manager in this period.",
  "On-Time Submission Rate": "Submissions made on or before the deadline. Time spent waiting for manager review is not counted as editor delay.",
  "First-Review Approval Rate": "Content approved on version 1 without any correction round.",
  "Average Editing Time": "Editing-started to submitted, excluding review wait time and time blocked on missing files, briefs or assets.",
  "Corrections Received": "Correction rounds raised by reviewers. Corrections are never counted as separate completed videos.",
  "Overdue Videos": "Content still unsubmitted past deadline where the delay is preventable by the editor.",
};

const INSIGHTS = [
  {
    text: "Improve subtitle and spelling checks — 5 of 12 corrections this month were caption or spelling issues.",
    tone: "bad" as const,
  },
  {
    text: "Reduce late short-video submissions — reels are your lowest on-time category at 78%.",
    tone: "warn" as const,
  },
  {
    text: "Review brand guidelines before export — 3 branding corrections came from logo placement and old offer cards.",
    tone: "warn" as const,
  },
  {
    text: "Prioritise urgent corrections — urgent first-pass approval is 56%, well below your 71% average.",
    tone: "warn" as const,
  },
  {
    text: "Ask for missing assets earlier — 2 delays were caused by raw files arriving late, and those are logged as non-preventable.",
    tone: "info" as const,
  },
];

const TONE_TEXT = {
  good: "text-emerald-600",
  info: "text-blue-600",
  warn: "text-amber-600",
  bad: "text-destructive",
};

const TONE_BOX = {
  good: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
  info: "border-blue-500/30 bg-blue-500/5 text-blue-700",
  warn: "border-amber-500/30 bg-amber-500/5 text-amber-700",
  bad: "border-destructive/30 bg-destructive/5 text-destructive",
};

const scale = (n: number, f: number, decimals = 0) => {
  const v = n * f;
  return decimals ? Number(v.toFixed(decimals)) : Math.max(0, Math.round(v));
};

export function VePerformancePage() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [compare, setCompare] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dimension, setDimension] = useState("Content type");

  const factor = PERIODS.find((p) => p.key === period)!.factor;
  const periodLabel = PERIODS.find((p) => p.key === period)!.label;

  const workload = useMemo(() => {
    const live = VE_RECORDS.filter((r) => r.status !== "Cancelled");
    const by = (fn: (r: VeRecord) => boolean) => live.filter(fn).length;
    return {
      newWork: by((r) => r.status === "New" || r.status === "Assigned"),
      editing: by((r) => r.status === "Editing" || r.status === "Ready for Review"),
      waiting: by((r) => r.status === "Submitted for Review" || r.status === "Resubmitted"),
      corrections: by((r) => r.status === "Correction Required"),
      approved: by((r) => r.status === "Approved" || r.status === "Scheduled" || r.status === "Published"),
      upcoming: live
        .filter((r) => r.dueToday || r.overdue || (r.hoursToDeadline ?? 99) <= 24)
        .sort((a, b) => (a.hoursToDeadline ?? 99) - (b.hoursToDeadline ?? 99)),
    };
  }, []);

  const kpis = [
    { label: "Videos Assigned", value: `${scale(BASE.assigned, factor)}`, tone: "info" as const, prev: `${scale(BASE.assigned * 0.9, factor)} last period` },
    { label: "Videos Submitted", value: `${scale(BASE.submitted, factor)}`, tone: "info" as const, prev: `${scale(BASE.submitted * 0.87, factor)} last period` },
    { label: "Videos Approved", value: `${scale(BASE.approved, factor)}`, tone: "good" as const, prev: `${scale(BASE.approved * 0.85, factor)} last period` },
    { label: "On-Time Submission Rate", value: `${BASE.onTimePct}%`, tone: "good" as const, prev: `${BASE.prevOnTimePct}% last period`, pct: BASE.onTimePct },
    { label: "First-Review Approval Rate", value: `${BASE.firstReviewPct}%`, tone: "warn" as const, prev: `${BASE.prevFirstReviewPct}% last period`, pct: BASE.firstReviewPct },
    { label: "Average Editing Time", value: `${BASE.avgEditHours} hrs`, tone: "good" as const, prev: `${BASE.prevAvgEditHours} hrs last period` },
    { label: "Corrections Received", value: `${scale(BASE.corrections, factor)}`, tone: "warn" as const, prev: `${scale(BASE.prevCorrections, factor)} last period` },
    { label: "Overdue Videos", value: `${scale(BASE.overdue, factor)}`, tone: "bad" as const, prev: `${scale(3, factor)} last period` },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHead
            title="Video Editor Performance"
            sub={`${EDITOR_NAME} · ${periodLabel} · calculated from live content assignments, versions and review records.`}
          />
          <div className="flex flex-wrap items-center gap-2">
            {CAN_VIEW_OTHER_EDITORS ? (
              <Select defaultValue={EDITOR_NAME}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EDITOR_NAME}>{EDITOR_NAME}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="h-9 px-3 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Own performance only
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.success("Performance report exported", {
                  description: `${periodLabel} · ${EDITOR_NAME} · figures are read-only and cannot be edited manually.`,
                })
              }
            >
              <Download className="h-4 w-4 mr-1" /> Export Report
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
              <TabsList className="flex flex-wrap h-auto">
                {PERIODS.map((p) => (
                  <TabsTrigger key={p.key} value={p.key} className="text-xs">
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex flex-wrap items-end gap-3">
              {period === "custom" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">From</Label>
                    <Input type="date" className="h-9" value={from} onChange={(e) => setFrom(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">To</Label>
                    <Input type="date" className="h-9" value={to} onChange={(e) => setTo(e.target.value)} />
                  </div>
                </>
              )}
              <Button size="sm" variant={compare ? "default" : "outline"} onClick={() => setCompare((v) => !v)}>
                Compare with previous period
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {k.label}
                  <MetricInfo text={TIPS[k.label]} />
                </div>
                <div className={`text-2xl font-bold tabular-nums mt-1 ${TONE_TEXT[k.tone]}`}>{k.value}</div>
                {compare && <div className="text-[11px] text-muted-foreground mt-0.5">{k.prev}</div>}
                {"pct" in k && typeof k.pct === "number" && <Progress value={k.pct} className="h-1.5 mt-2" />}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1">
                Content output
                <MetricInfo text="Completed work by content type. Each Content ID counts once; corrections and resubmissions are not extra videos." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {OUTPUT_ROWS.map((o) => (
                <div key={o.label} className="flex items-center justify-between gap-2 text-sm border rounded-md px-3 py-2">
                  <div className="min-w-0">
                    <div className="font-medium">{o.label}</div>
                    <div className="text-[11px] text-muted-foreground">{o.platform}</div>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-blue-600">{scale(o.month, factor)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1">
                Quality metrics
                <MetricInfo text="Derived from reviewer correction rounds attached to each version. Editors are not penalised for missing raw files, briefs or assets." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {QUALITY_ROWS.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-2 text-sm border-b last:border-0 py-1.5">
                  <span className="min-w-0">{r.label}</span>
                  <span className={`font-bold tabular-nums ${TONE_TEXT[r.tone]}`}>
                    {r.label.startsWith("Average") ? scale(r.month, 1, 1) : scale(r.month, factor)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1">
                Delivery performance
                <MetricInfo text="Deadline comparison per submitted version. Manager review wait time is excluded from editor delay." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {DELIVERY_ROWS.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-2 text-sm border-b last:border-0 py-1.5">
                  <span className="min-w-0">{r.label}</span>
                  <span className={`font-bold tabular-nums ${TONE_TEXT[r.tone]}`}>
                    {r.unit ? `${scale(r.month, 1, 1)}${r.unit}` : scale(r.month, factor)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2">
                  <div className="text-[11px] text-muted-foreground">Preventable delays</div>
                  <div className="text-lg font-bold tabular-nums text-amber-600">{scale(3, factor)}</div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-[11px] text-muted-foreground">Non-preventable delays</div>
                  <div className="text-lg font-bold tabular-nums">{scale(2, factor)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1">
                Workload right now
                <MetricInfo text="Live counts from your assigned content records. History is preserved even if content is reassigned." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "New assignments", v: workload.newWork, t: "info" as const },
                  { l: "Editing in progress", v: workload.editing, t: "info" as const },
                  { l: "Waiting for review", v: workload.waiting, t: "warn" as const },
                  { l: "Corrections in progress", v: workload.corrections, t: "bad" as const },
                  { l: "Approved videos", v: workload.approved, t: "good" as const },
                  {
                    l: "Total estimated workload",
                    v: workload.newWork + workload.editing + workload.corrections,
                    t: "info" as const,
                  },
                ].map((w) => (
                  <div key={w.l} className="rounded-md border p-2">
                    <div className="text-[11px] text-muted-foreground">{w.l}</div>
                    <div className={`text-xl font-bold tabular-nums ${TONE_TEXT[w.t]}`}>{w.v}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Upcoming deadlines</div>
                {workload.upcoming.map((r) => (
                  <div key={r.contentId} className="text-xs border rounded px-2 py-1.5 flex justify-between gap-2">
                    <span className="min-w-0 truncate">
                      {r.contentId} · {r.title}
                    </span>
                    <span className={r.overdue ? "text-destructive shrink-0" : "text-amber-600 shrink-0"}>
                      {r.deadline}
                    </span>
                  </div>
                ))}
                {workload.upcoming.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nothing due in the next 24 hours.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1">
              Review outcome funnel
              <MetricInfo text="Each Content ID passes through the funnel once. Corrections and resubmissions do not create new records." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {FUNNEL.map((f, i) => {
              const pct = (f.count / FUNNEL[0].count) * 100;
              const tone =
                f.stage === "Correction Required" ? "bg-amber-500" : i >= 4 ? "bg-emerald-500" : "bg-blue-500";
              return (
                <div key={f.stage} className="space-y-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-medium">{f.stage}</span>
                    <span className="text-muted-foreground text-xs">
                      {f.count} · {f.avg}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content-type performance comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={dimension} onValueChange={setDimension}>
              <SelectTrigger className="h-9 w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(COMPARE_DATA).map((d) => (
                  <SelectItem key={d} value={d}>
                    Compare by {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              {COMPARE_DATA[dimension].map((row) => (
                <div key={row.name} className="rounded-md border p-3 space-y-1.5">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-medium">{row.name}</span>
                    <span className="text-xs text-muted-foreground">{row.videos} videos</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>On time</span>
                        <span className={row.onTime >= 90 ? "text-emerald-600" : row.onTime >= 80 ? "text-amber-600" : "text-destructive"}>
                          {row.onTime}%
                        </span>
                      </div>
                      <Progress value={row.onTime} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>First-review approval</span>
                        <span className={row.firstPass >= 75 ? "text-emerald-600" : row.firstPass >= 60 ? "text-amber-600" : "text-destructive"}>
                          {row.firstPass}%
                        </span>
                      </div>
                      <Progress value={row.firstPass} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Practical insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {INSIGHTS.map((i) => (
              <div key={i.text} className={`rounded-md border px-3 py-2 text-sm ${TONE_BOX[i.tone]}`}>
                {i.tone === "info" ? (
                  <Award className="h-4 w-4 inline mr-1" />
                ) : (
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                )}
                {i.text}
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">
              Rules-based only — no AI scoring. Every figure comes from content assignments, versions and review records
              and cannot be edited manually. Completed workflow activity is never deleted. Editors see only their own
              performance; the Social Media Account Manager sees assigned editors and HR sees approved summaries.
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

function MetricInfo({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <UiTooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="Metric information" className="text-muted-foreground hover:text-foreground">
          <Info className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
    </UiTooltip>
  );
}
