import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  FileSearch,
  Info,
  Lightbulb,
  Lock,
  MessageSquare,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SectionHead } from "./ui";
import {
  ACCOUNT_HEALTH,
  ANNUAL_AVERAGE,
  AUDIT_TRAIL,
  DATA_SOURCES,
  EMPLOYEE,
  ERROR_FREE_RATE,
  FAIRNESS_RULES,
  HANDOVER_REPORT,
  IMPROVEMENT_PLAN,
  INCREMENT_BANDS,
  KRAS,
  MANAGER_COMMENT,
  MONTHLY_TREND,
  ONTIME_HANDOVER_RATE,
  ONTIME_PUBLISHING_RATE,
  PERF_PERIODS,
  PREVIOUS_SCORE,
  PUBLISHING_REPORT,
  REVIEW_FLOW,
  REVIEW_REPORT,
  SOCIAL_RESULTS,
  ceoSummary,
  incrementBand,
  kraApplicableWeight,
  kraEarned,
  ratingLabel,
  statusLabel,
  totalScore,
  type Kpi,
  type KpiStatus,
  type PeriodKey,
} from "./performance-data";

const TABS = [
  { key: "scorecard", label: "Scorecard" },
  { key: "kpi", label: "KPI Table" },
  { key: "reports", label: "Detail Reports" },
  { key: "review", label: "Review & Approval" },
  { key: "plan", label: "Improvement Plan" },
  { key: "audit", label: "Fairness & Audit" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const statusTone: Record<KpiStatus, string> = {
  on_track: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  attention: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  below: "bg-red-500/10 text-red-600 border-red-500/30",
  na: "bg-muted text-muted-foreground border-border",
};

function StatusBadge({ status }: { status: KpiStatus }) {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap text-[11px] font-medium", statusTone[status])}>
      {statusLabel[status]}
    </Badge>
  );
}

function Tile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "warn" | "bad";
}) {
  const cls =
    tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-destructive" : "";
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold tabular-nums", cls)}>{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function KpiEvidence({ k }: { k: Kpi }) {
  const lost = Math.round((k.weight - k.points) * 100) / 100;
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-xs">
      <div className="grid gap-2 sm:grid-cols-2">
        <p><span className="text-muted-foreground">Target: </span>{k.target}</p>
        <p><span className="text-muted-foreground">Actual: </span>{k.actual}</p>
        <p><span className="text-muted-foreground">Points earned: </span>{k.points} of {k.weight}</p>
        <p><span className="text-muted-foreground">Points lost: </span>{lost > 0 ? lost : "None"}</p>
        <p className="sm:col-span-2"><span className="text-muted-foreground">Data source: </span>{k.source}</p>
        {k.formula ? (
          <p className="sm:col-span-2"><span className="text-muted-foreground">Formula: </span>{k.formula}</p>
        ) : null}
        {k.reason ? (
          <p className="sm:col-span-2"><span className="text-muted-foreground">Reason for lost points: </span>{k.reason}</p>
        ) : null}
      </div>
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Linked evidence</p>
        {k.evidence.map((e) => (
          <p key={e} className="rounded border bg-background px-2 py-1 font-mono text-[11px]">{e}</p>
        ))}
      </div>
    </div>
  );
}

export function SmmPerformancePage() {
  const [period, setPeriod] = useState<PeriodKey>("monthly");
  const [tab, setTab] = useState<TabKey>("scorecard");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const score = useMemo(() => totalScore(), []);
  const band = incrementBand(score);
  const ceo = useMemo(() => ceoSummary(), []);

  const kraSummary = useMemo(
    () =>
      KRAS.map((k) => ({
        name: k.name,
        earned: Math.round(kraEarned(k) * 100) / 100,
        weight: kraApplicableWeight(k),
        share: Math.round((kraEarned(k) / kraApplicableWeight(k)) * 1000) / 10,
      })),
    [],
  );
  const best = [...kraSummary].sort((a, b) => b.share - a.share)[0];
  const worst = [...kraSummary].sort((a, b) => a.share - b.share)[0];
  const lostPoints = Math.round((100 - score) * 10) / 10;
  const spanLabel = PERF_PERIODS.find((p) => p.key === period)!.span;

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHead
          title="Performance"
          sub={`${EMPLOYEE.name} · ${EMPLOYEE.role} · ${EMPLOYEE.employeeId} — every score comes from CRM records, not manual reporting.`}
        />
        <Button variant="outline" size="sm" onClick={() => toast.success("Performance report exported (sample)")}>
          <Download className="mr-1.5 h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* Period filters */}
      <div className="flex flex-wrap items-center gap-2">
        {PERF_PERIODS.map((p) => (
          <Button key={p.key} size="sm" variant={period === p.key ? "default" : "outline"} onClick={() => setPeriod(p.key)}>
            {p.label}
          </Button>
        ))}
        {period === "custom" ? (
          <div className="flex items-center gap-2">
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 w-[140px]" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 w-[140px]" />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{spanLabel}</span>
        )}
      </div>

      {/* Scorecard header */}
      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Score</p>
            <p className="text-5xl font-bold tabular-nums">{score}</p>
            <p className="text-xs text-muted-foreground">out of 100</p>
            <Progress value={score} className="mt-3 h-2" />
            <Badge
              variant="outline"
              className={cn("mt-3", score >= 80 ? statusTone.on_track : score >= 70 ? statusTone.attention : statusTone.below)}
            >
              <Award className="mr-1 h-3.5 w-3.5" /> {ratingLabel(score)}
            </Badge>
            <p className="mt-2 text-xs font-medium">{band.outcome}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Tile label="Previous period" value={String(PREVIOUS_SCORE)} sub={score >= PREVIOUS_SCORE ? "Improving" : "Slight decline"} tone={score >= PREVIOUS_SCORE ? "good" : "warn"} />
            <Tile label="Annual average" value={String(ANNUAL_AVERAGE)} sub="Used for increment decisions" />
            <Tile label="Points lost" value={String(lostPoints)} sub="Every deduction has evidence" tone="warn" />
            <Tile label="Best KRA" value={best.name} sub={`${best.earned}/${best.weight} points`} tone="good" />
            <Tile label="Lowest KRA" value={worst.name} sub={`${worst.earned}/${worst.weight} points`} tone="warn" />
            <Tile label="Increment eligibility" value={band.label} sub={band.outcome} tone={band.tone === "good" ? "good" : band.tone === "warn" ? "warn" : "bad"} />
            <div className="col-span-2 rounded-lg border bg-background p-3 md:col-span-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold"><Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Next recommended action</p>
              <p className="mt-1 text-sm">
                Publish every approved item in its scheduled slot and hand over social leads inside 60 minutes — those two
                fixes recover {Math.round((15 - KRAS[0].kpis[0].points + 10 - KRAS[2].kpis[1].points) * 10) / 10} points next month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Trend — builds the annual increment score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 overflow-x-auto pb-1">
            {MONTHLY_TREND.map((m) => (
              <div key={m.month} className="flex min-w-[52px] flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted-foreground">{m.score}</span>
                <div
                  className={cn(
                    "w-full rounded-t",
                    m.score >= 90 ? "bg-emerald-500/70" : m.score >= 80 ? "bg-emerald-500/45" : m.score >= 70 ? "bg-amber-500/60" : "bg-red-500/60",
                  )}
                  style={{ height: `${Math.max(12, m.score)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            One strong or weak month does not hide the full history — the annual average ({ANNUAL_AVERAGE}) decides increment eligibility.
          </p>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Scorecard tab — KRA breakdown */}
      {tab === "scorecard" ? (
        <div className="space-y-3">
          {KRAS.map((kra) => {
            const earned = Math.round(kraEarned(kra) * 100) / 100;
            const applicable = kraApplicableWeight(kra);
            return (
              <Card key={kra.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {kra.name} <span className="text-muted-foreground">— {kra.weight} points</span>
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={earned / applicable >= 0.9 ? statusTone.on_track : earned / applicable >= 0.75 ? statusTone.attention : statusTone.below}
                    >
                      {earned} / {applicable} points
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{kra.intent}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={(earned / applicable) * 100} className="h-1.5" />
                  <Accordion type="multiple" className="w-full">
                    {kra.kpis.map((k) => (
                      <AccordionItem key={k.id} value={k.id}>
                        <AccordionTrigger className="py-2 text-left text-sm hover:no-underline">
                          <div className="flex w-full flex-wrap items-center justify-between gap-2 pr-2">
                            <span>{k.kpi}</span>
                            <span className="flex items-center gap-2">
                              <span className="tabular-nums text-xs text-muted-foreground">{k.points}/{k.weight} pts</span>
                              <StatusBadge status={k.status} />
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <KpiEvidence k={k} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {kra.notes?.length ? (
                    <div className="space-y-1">
                      {kra.notes.map((n) => (
                        <p key={n} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <Info className="mt-0.5 h-3 w-3 shrink-0" /> {n}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Increment Eligibility Framework</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {INCREMENT_BANDS.map((b) => (
                <div
                  key={b.label}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 rounded-md border p-2.5 text-sm",
                    b.label === band.label && "border-primary bg-primary/5",
                  )}
                >
                  <span className="font-medium tabular-nums">{b.label}</span>
                  <span className="text-muted-foreground">{b.outcome}</span>
                  {b.label === band.label ? <Badge variant="outline" className={statusTone.on_track}>Your band</Badge> : null}
                </div>
              ))}
              <p className="rounded-md border border-dashed bg-muted/40 p-2.5 text-xs text-muted-foreground">
                The score determines increment eligibility, not the final salary increase. The final increment remains
                subject to company performance, salary structure, attendance and disciplinary rules communicated
                separately in advance.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* KPI table */}
      {tab === "kpi" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">KPI Table — {spanLabel}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1150px] text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["KRA", "KPI", "Weight", "Target", "Actual", "Achievement", "Points", "Data Source", "Lost", "Reason", "Status"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KRAS.flatMap((kra) =>
                  kra.kpis.map((k, i) => (
                    <tr key={k.id} className="border-t align-top">
                      <td className="px-3 py-2 text-xs">{i === 0 ? kra.name : ""}</td>
                      <td className="px-3 py-2">{k.kpi}</td>
                      <td className="px-3 py-2 tabular-nums">{k.weight}</td>
                      <td className="px-3 py-2 text-xs">{k.target}</td>
                      <td className="px-3 py-2 text-xs">{k.actual}</td>
                      <td className="px-3 py-2 tabular-nums">{k.status === "na" ? "—" : `${k.achievement}%`}</td>
                      <td className="px-3 py-2 tabular-nums font-medium">{k.points}</td>
                      <td className="px-3 py-2 text-xs">{k.source}</td>
                      <td className="px-3 py-2 tabular-nums">{Math.round((k.weight - k.points) * 100) / 100}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{k.reason ?? "—"}</td>
                      <td className="px-3 py-2"><StatusBadge status={k.status} /></td>
                    </tr>
                  )),
                )}
                <tr className="border-t bg-muted/40 font-semibold">
                  <td className="px-3 py-2" colSpan={2}>Total</td>
                  <td className="px-3 py-2 tabular-nums">100</td>
                  <td className="px-3 py-2" colSpan={3} />
                  <td className="px-3 py-2 tabular-nums">{score}</td>
                  <td className="px-3 py-2 text-xs" colSpan={2}>{DATA_SOURCES.length} CRM sources</td>
                  <td className="px-3 py-2 tabular-nums" colSpan={2}>{lostPoints} lost</td>
                </tr>
              </tbody>
            </table>
            <p className="p-3 text-xs text-muted-foreground">
              When a KPI is marked Not Applicable, its weight is removed and the remaining KPI weights are re-based
              proportionately to 100.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Detail reports */}
      {tab === "reports" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { title: "Publishing Report", rows: PUBLISHING_REPORT, note: `On-time publishing rate ${ONTIME_PUBLISHING_RATE}%` },
            { title: "Review Report", rows: REVIEW_REPORT, note: `Error-free publishing rate ${ERROR_FREE_RATE}%` },
            { title: "Lead Handover Report", rows: HANDOVER_REPORT, note: `On-time handover rate ${ONTIME_HANDOVER_RATE}% — original Lead ID kept on handover` },
          ].map((b) => (
            <Card key={b.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{b.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {b.rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between border-b py-1.5 text-sm last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-semibold tabular-nums">{r.value}</span>
                  </div>
                ))}
                <p className="pt-1 text-xs text-muted-foreground">{b.note}</p>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Social Results vs Approved Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SOCIAL_RESULTS.map((r) => {
                const p = Math.round((r.actual / r.target) * 100);
                return (
                  <div key={r.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{r.label}</span>
                      <span className="tabular-nums">
                        {r.actual.toLocaleString("en-IN")}{r.unit} / {r.target.toLocaleString("en-IN")}{r.unit}
                        <span className={cn("ml-2 text-xs", p >= 100 ? "text-emerald-600" : p >= 90 ? "text-amber-600" : "text-destructive")}>{p}%</span>
                      </span>
                    </div>
                    <Progress value={Math.min(100, p)} className="h-1.5" />
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                Followers bought, fake engagement, unrelated viral reach and clickbait earn no points. Reported
                dependency gaps (content volume, budget, resources) are excluded from scoring.
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Account Health</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    {["Account", "Status", "Unresolved issues", "Response SLA", "Security alert"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACCOUNT_HEALTH.map((a) => (
                    <tr key={a.account} className="border-t">
                      <td className="px-3 py-2 font-medium">{a.account}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={a.status === "healthy" ? statusTone.on_track : statusTone.attention}>
                          {a.status === "healthy" ? "Healthy" : "Attention Required"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{a.issues}</td>
                      <td className="px-3 py-2 tabular-nums">{a.sla}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{a.alert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Review & approval */}
      {tab === "review" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Review and Approval Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {REVIEW_FLOW.map((s) => (
                <div key={s.stage} className="flex items-start gap-2 rounded-md border p-2.5 text-sm">
                  {s.done || (s.stage === "Employee Acknowledges" && acknowledged) ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  ) : (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-muted-foreground/40" />
                  )}
                  <div>
                    <p className="font-medium">{s.stage}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.stage === "Employee Acknowledges" && acknowledged ? "Acknowledged just now" : s.at} · {s.by}
                    </p>
                  </div>
                </div>
              ))}
              <p className="flex items-start gap-1.5 rounded-md border border-dashed p-2 text-[11px] text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                After HR locks the score, nobody can edit it without an authorised reopening recorded in the audit log.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Manager Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="rounded-md border bg-muted/30 p-3 text-sm">{MANAGER_COMMENT}</p>
              <p className="text-xs text-muted-foreground">
                Manager comments are recorded separately and cannot change the system-generated score. Targets, formulas,
                verified outcomes and manager comments cannot be edited by the employee.
              </p>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setCommentOpen(true)}>
                  <MessageSquare className="mr-1.5 h-4 w-4" /> Add Employee Comment
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)}>
                  <FileSearch className="mr-1.5 h-4 w-4" /> Submit Score-Review Request
                </Button>
                <Button
                  size="sm"
                  disabled={acknowledged}
                  onClick={() => {
                    setAcknowledged(true);
                    toast.success("Review acknowledged — sent to HR for audit");
                  }}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> {acknowledged ? "Acknowledged" : "Acknowledge Review"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                A score-review request must be raised before HR locks the score.
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">CEO Dashboard Summary (consolidated only)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Employee", ceo.employee],
                ["Role", ceo.role],
                ["Current score", String(ceo.score)],
                ["Annual average", String(ceo.annualAverage)],
                ["Increment eligibility", ceo.eligibility],
                ["Publishing compliance", ceo.publishingCompliance],
                ["Content error rate", ceo.contentErrorRate],
                ["Lead handover compliance", ceo.handoverCompliance],
                ["Qualified organic leads", String(ceo.qualifiedOrganicLeads)],
                ["Major account risks", ceo.accountRisks],
                ["Improvement plan", ceo.improvementPlan],
                ["Score trend", ceo.trend],
                ["Critical exceptions", ceo.exceptions],
              ].map(([l, v]) => (
                <div key={l} className="rounded-md border p-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{l}</p>
                  <p className="text-sm font-medium">{v}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
                The CEO can open the supporting evidence for any figure above; no personal or raw data is shared.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Improvement plan */}
      {tab === "plan" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Improvement Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={cn(
                "flex items-start gap-2 rounded-md border p-3 text-sm",
                score < 70 ? statusTone.below : statusTone.on_track,
              )}
            >
              {score < 70 ? <AlertTriangle className="mt-0.5 h-4 w-4" /> : <CheckCircle2 className="mt-0.5 h-4 w-4" />}
              <p>
                {score < 70
                  ? "Score is below 70 — HR or the authorised manager must create an improvement plan."
                  : `No improvement plan required. Current score ${score} is above the 70-point threshold.`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{IMPROVEMENT_PLAN.triggerNote}</p>
            <Separator />
            <p className="text-sm font-medium">Plan structure (used when triggered)</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {IMPROVEMENT_PLAN.template.map((f) => (
                <div key={f} className="rounded-md border bg-muted/30 p-2.5 text-sm">
                  {f}
                  <p className="text-[11px] text-muted-foreground">Created by HR / authorised manager</p>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" disabled={score >= 70} onClick={() => toast.info("Improvement plan draft created for HR review")}>
              Create Improvement Plan
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Fairness & audit */}
      {tab === "audit" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fairness Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {FAIRNESS_RULES.map((r) => (
                <p key={r} className="flex items-start gap-1.5 text-sm">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {r}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evidence and Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {DATA_SOURCES.map((d) => (
                  <Badge key={d} variant="outline">{d}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Scores are pulled automatically — no duplicate manual reporting. Every deduction links to a Content ID,
                Task ID, Lead ID, account issue, deadline or approval record.
              </p>
              <Separator />
              <p className="text-sm font-medium">Targets</p>
              <p className="text-xs text-muted-foreground">
                Approved by {EMPLOYEE.targetsApprovedBy} on {EMPLOYEE.targetsApprovedOn}, before the review period
                started. Formulas and weights are visible to {EMPLOYEE.name} and cannot be changed retrospectively.
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {AUDIT_TRAIL.map((a) => (
                <div key={a.at} className="rounded-md border p-2.5 text-sm">
                  <p className="font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.at} · {a.actor}</p>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">
                Final lock date: pending HR audit. Reopening a locked score requires authorisation and is recorded here.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Score review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit score-review request</DialogTitle>
            <DialogDescription>
              Explain which KPI looks wrong and attach the record ID. The manager must respond before HR locks the score.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Your request</Label>
            <Textarea rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="e.g. C-221 was delayed by an approved schedule change on 18 Jul…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button
              disabled={reviewText.trim().length < 5}
              onClick={() => {
                toast.success("Score-review request sent to manager and HR");
                setReviewOpen(false);
                setReviewText("");
              }}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee comment dialog */}
      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add employee comment</DialogTitle>
            <DialogDescription>Your comment is recorded with the review. It does not change the score.</DialogDescription>
          </DialogHeader>
          <Textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add context for the manager and HR…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentOpen(false)}>Cancel</Button>
            <Button
              disabled={comment.trim().length < 3}
              onClick={() => {
                toast.success("Comment added to the performance record");
                setCommentOpen(false);
                setComment("");
              }}
            >
              Save Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SmmPerformancePage;
