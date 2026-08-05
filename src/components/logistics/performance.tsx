import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import {
  Info,
  Download,
  Lightbulb,
  ShieldCheck,
  Clock,
  Lock,
} from "lucide-react";
import {
  EXECUTIVES,
  PERIOD_LABELS,
  buildPerformance,
  type Metric,
  type PeriodKey,
} from "./performance-data";

const TONE_TEXT: Record<string, string> = {
  good: "text-emerald-600",
  info: "text-primary",
  warn: "text-amber-600",
  bad: "text-destructive",
  muted: "text-muted-foreground",
};

const TONE_BORDER: Record<string, string> = {
  good: "border-emerald-500/30",
  info: "border-primary/30",
  warn: "border-amber-500/30",
  bad: "border-destructive/30",
  muted: "border-border",
};

function Tip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="Metric explanation" className="text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

function KpiCard({ m }: { m: Metric }) {
  const tone = m.tone ?? "muted";
  return (
    <Card className={TONE_BORDER[tone]}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs text-muted-foreground">{m.label}</div>
          <Tip text={m.tip} />
        </div>
        <div className={`mt-1 text-2xl font-semibold ${TONE_TEXT[tone]}`}>{m.value}</div>
        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          {m.prev !== undefined && <div>Previous period: {m.prev}</div>}
          {m.target && <div>{m.target}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ m }: { m: Metric }) {
  const tone = m.tone ?? "muted";
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-sm">{m.label}</span>
        <Tip text={m.tip} />
      </div>
      <div className="shrink-0 text-right">
        <div className={`text-sm font-semibold ${TONE_TEXT[tone]}`}>{m.value}</div>
        {m.target && <div className="text-[10px] text-muted-foreground">{m.target}</div>}
      </div>
    </div>
  );
}

function Block({
  title,
  desc,
  metrics,
}: {
  title: string;
  desc?: string;
  metrics: Metric[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <MetricRow key={m.label} m={m} />
        ))}
      </CardContent>
    </Card>
  );
}

/* viewer roles decide what is visible — no public ranking */
type Viewer = "self" | "sc_lead" | "hr_head" | "ceo" | "accounts" | "project_coord";

const VIEWERS: { key: Viewer; label: string }[] = [
  { key: "self", label: "Logistics Executive (own performance)" },
  { key: "sc_lead", label: "Supply Chain Leadership (team)" },
  { key: "hr_head", label: "HR Head (approved summary)" },
  { key: "ceo", label: "CEO (company summary)" },
  { key: "accounts", label: "Accounts Manager (clearance outcomes)" },
  { key: "project_coord", label: "Project Coordinator (project outcomes)" },
];

export function LogisticsPerformance() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-07-20");
  const [viewer, setViewer] = useState<Viewer>("self");
  const [execId, setExecId] = useState(EXECUTIVES[0].id);

  const canSelectExec = viewer === "sc_lead" || viewer === "ceo" || viewer === "hr_head";
  const activeExec = canSelectExec ? execId : EXECUTIVES[0].id;
  const exec = EXECUTIVES.find((e) => e.id === activeExec)!;

  const p = useMemo(() => buildPerformance(activeExec, period), [activeExec, period]);

  const summaryOnly = viewer === "hr_head" || viewer === "ceo";
  const outcomeOnly = viewer === "accounts" || viewer === "project_coord";

  const periodText =
    period === "custom" ? `${from} to ${to}` : PERIOD_LABELS[period];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">Logistics Executive Performance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reporting period: <span className="font-medium text-foreground">{periodText}</span> · compared with the
              previous period · {exec.name} ({exec.city})
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success(`Report exported for ${exec.name} — ${periodText}`)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* filters */}
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 p-4">
            <div className="min-w-40 flex-1">
              <label className="text-xs text-muted-foreground">Reporting period</label>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {PERIOD_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {period === "custom" && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
                </div>
              </>
            )}

            <div className="min-w-52 flex-1">
              <label className="text-xs text-muted-foreground">Viewing as</label>
              <Select value={viewer} onValueChange={(v) => setViewer(v as Viewer)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIEWERS.map((v) => (
                    <SelectItem key={v.key} value={v.key}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-48 flex-1">
              <label className="text-xs text-muted-foreground">Logistics Executive</label>
              <Select value={activeExec} onValueChange={setExecId} disabled={!canSelectExec}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXECUTIVES.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} · {e.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!canSelectExec && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Executives can view only their own performance.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* primary KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {p.kpis.map((m) => (
            <KpiCard key={m.label} m={m} />
          ))}
        </div>

        {outcomeOnly ? (
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Outcomes for your records</CardTitle>
              <p className="text-xs text-muted-foreground">
                {viewer === "accounts"
                  ? "Accounts Manager view: clearance acceptance and dispatch outcomes only. Confidential Logistics performance detail is hidden."
                  : "Project Coordinator view: project and launch outcomes only. Confidential Logistics performance detail is hidden."}
              </p>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(viewer === "accounts" ? p.clearance : [...p.impact.own, ...p.impact.others]).map((m) => (
                <MetricRow key={m.label} m={m} />
              ))}
            </CardContent>
          </Card>
        ) : (
          <>
            <Block
              title="Clearance Performance"
              desc="Acceptance of payment-verified clearances from Accounts."
              metrics={p.clearance}
            />
            <Block
              title="Packing Coordination"
              desc="Assignment, review and turnaround of packing work."
              metrics={p.packing}
            />
            <Block
              title="Dispatch Performance"
              desc="Planning, booking and completion of dispatches."
              metrics={p.dispatch}
            />
            <Block
              title="External Booking Summary"
              desc="Reference counts only — external transporter tracking analytics are not recreated here."
              metrics={p.booking}
            />
            <Block
              title="Delivery Performance"
              desc="Confirmation quality carries more weight than dispatch volume."
              metrics={p.delivery}
            />
            <Block
              title="Issues & Returns"
              desc="Investigation, replacement, return and claim closure."
              metrics={p.issues}
            />

            {/* project impact — delays separated by source */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Project Impact</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Delays are separated by responsible source. Only the first group affects this executive's rating.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Logistics-controlled
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {p.impact.own.map((m) => (
                      <MetricRow key={m.label} m={m} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Delays caused by other sources — not charged to Logistics
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {p.impact.others.map((m) => (
                      <MetricRow key={m.label} m={m} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Block
              title="Quality and Control Metrics"
              desc="Control failures are treated as more serious than volume shortfalls."
              metrics={p.control}
            />
            <Block title="Workload Status" desc="Live open work at this moment." metrics={p.workload} />

            {/* elapsed vs controlled */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Total elapsed time vs Logistics-controlled time
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Waiting on Accounts, Project Coordinator, item availability, Packing Staff, transporter or recipient is
                  excluded from controlled time when follow-up was completed correctly.
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.timeSplit.map((t) => (
                  <div key={t.label} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card px-3 py-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      {t.label}
                      <Tip text={t.tip} />
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">Total elapsed: {t.total}</span>
                      <span className="font-semibold text-emerald-600">Controlled: {t.controlled}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* insights */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              Performance Insights
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Simple rules-based recommendations from actual records. No AI scoring is applied.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.insights.map((t, i) => (
              <div key={i} className="flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-sm">
                <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">
                  {i + 1}
                </Badge>
                <span>{t}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* fairness + permissions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Fair calculation rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-muted-foreground">
              <p>Every figure is calculated from actual clearance, packing, dispatch, delivery and issue records.</p>
              <p>Performance figures cannot be edited manually.</p>
              <p>
                Each Clearance ID, Packing Task ID, Dispatch ID and Issue ID is counted once. Replacement dispatches are
                never counted as successful original deliveries.
              </p>
              <p>Quality, accuracy and delivery confirmation carry more importance than dispatch volume.</p>
              <p>Performance history is preserved when work is reassigned.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {p.excluded.map((e) => (
                  <div key={e.label} className="rounded-md border bg-muted/40 px-2 py-1.5">
                    <div className="text-[11px] text-foreground">{e.label}</div>
                    <div className="font-semibold text-foreground">{e.count} excluded</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4" />
                Access and confidentiality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-muted-foreground">
              <p>Logistics Executives can view only their own performance.</p>
              <p>Authorised Supply Chain leadership can view team performance.</p>
              <p>HR Head can view approved employee-performance summaries.</p>
              <p>CEO can view company-level logistics summaries.</p>
              <p>Accounts Manager and Project Coordinator see only outcomes relevant to their clearances and projects.</p>
              <p>Packing Staff cannot view confidential Logistics Executive performance.</p>
              <p>Logistics Executives are never publicly ranked.</p>
              <p>Completed activity records cannot be deleted to change performance figures.</p>
              {summaryOnly && (
                <p className="rounded-md border border-primary/30 bg-primary/5 p-2 text-primary">
                  Summary view active — individual record detail is limited for this role.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
