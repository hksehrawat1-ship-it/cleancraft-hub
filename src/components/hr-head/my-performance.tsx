import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Info,
  Download,
  Eye,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Minus,
  Lock,
  AlertTriangle,
  MessageSquarePlus,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  PERIOD_LABELS,
  PERIOD_RECORDS,
  PREVIOUS_RECORDS,
  SEED_ACCESS_LOG,
  SEED_FEEDBACK,
  STATUS_BAR,
  STATUS_TONE,
  TARGET_HISTORY,
  buildKpis,
  buildResponsibilities,
  buildRisks,
  pct,
  type AccessLog,
  type Feedback,
  type FeedbackKind,
  type PeriodKey,
  type Status,
} from "./my-performance-data";

const FEEDBACK_KINDS: FeedbackKind[] = [
  "Private Note",
  "Recognition",
  "Corrective Action",
  "Improvement Goal",
  "Review Scheduled",
];

function Tip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="How this is calculated" className="text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

function StatusChip({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={`border ${STATUS_TONE[status]}`}>
      {status}
    </Badge>
  );
}

function Delta({ cur, prev, lowerIsBetter }: { cur: number; prev: number; lowerIsBetter?: boolean }) {
  const diff = Math.round((cur - prev) * 10) / 10;
  if (diff === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> no change
      </span>
    );
  const good = lowerIsBetter ? diff < 0 : diff > 0;
  const Icon = diff > 0 ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        good ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(diff)} vs previous
    </span>
  );
}

export function HrMyPerformance({ isCeo = false }: { isCeo?: boolean }) {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [from, setFrom] = useState("2026-06-01");
  const [to, setTo] = useState("2026-08-03");
  const [ceoMode, setCeoMode] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>(SEED_FEEDBACK);
  const [log, setLog] = useState<AccessLog[]>(SEED_ACCESS_LOG);
  const [fbOpen, setFbOpen] = useState(false);
  const [fbKind, setFbKind] = useState<FeedbackKind>("Private Note");
  const [fbBody, setFbBody] = useState("");
  const [fbTarget, setFbTarget] = useState("");
  const [fbDue, setFbDue] = useState("");
  const [ackFor, setAckFor] = useState<Feedback | null>(null);
  const [ackText, setAckText] = useState("");

  const cur = PERIOD_RECORDS[period];
  const prev = PREVIOUS_RECORDS[period];
  const kpis = useMemo(() => buildKpis(cur, prev), [cur, prev]);
  const responsibilities = useMemo(() => buildResponsibilities(cur), [cur]);
  const risks = useMemo(() => buildRisks(cur), [cur]);

  const rangeLabel =
    period === "custom"
      ? `${from || "start"} → ${to || "today"}`
      : cur.range;

  const record = (action: string) =>
    setLog((l) => [{ at: "3 Aug 2026, now", who: ceoMode ? "CEO" : "Neha Sharma (HR Head)", action }, ...l]);

  const totalDelays = cur.delaysHrControl + cur.delaysAwaitingCeo + cur.delaysAwaitingManager;

  const addFeedback = () => {
    if (!fbBody.trim()) {
      toast.error("Feedback note is required");
      return;
    }
    const fb: Feedback = {
      id: `fb-${Date.now()}`,
      kind: fbKind,
      at: "3 Aug 2026",
      body: fbBody.trim(),
      target: fbTarget.trim() || undefined,
      dueDate: fbDue || undefined,
      discussed: false,
    };
    setFeedback((f) => [fb, ...f]);
    record(`Added private CEO feedback (${fbKind})`);
    setFbOpen(false);
    setFbBody("");
    setFbTarget("");
    setFbDue("");
    toast.success("Private feedback saved");
  };

  const submitAck = () => {
    if (!ackFor) return;
    setFeedback((f) =>
      f.map((x) =>
        x.id === ackFor.id ? { ...x, ack: { at: "3 Aug 2026", response: ackText.trim() || "Acknowledged." } } : x,
      ),
    );
    record(`HR Head acknowledged CEO feedback (${ackFor.kind})`);
    setAckFor(null);
    setAckText("");
    toast.success("Feedback acknowledged");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HR Head Performance</h1>
            <p className="text-sm text-muted-foreground">
              Reporting period: <span className="font-medium text-foreground">{PERIOD_LABELS[period]}</span> ({rangeLabel}) ·
              compared with {prev.label} ({prev.range})
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Visible to HR Head and CEO only. Every view, export and feedback entry is recorded.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ceoMode && <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400">CEO review mode</Badge>}
            {isCeo && (
              <Button
                variant={ceoMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const next = !ceoMode;
                  setCeoMode(next);
                  record(next ? "Opened dashboard in CEO review mode" : "Exited CEO review mode");
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {ceoMode ? "Exit CEO view" : "View as CEO"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                record(`Exported performance report — ${PERIOD_LABELS[period]}`);
                toast.success("Report exported (aggregated figures only)");
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* FILTERS */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-end">
            <div className="w-full md:w-56">
              <Label className="text-xs">Reporting period</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PERIOD_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div className="w-full md:w-44">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
                </div>
                <div className="w-full md:w-44">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
                </div>
              </>
            )}
            <div className="text-xs text-muted-foreground md:ml-auto md:text-right">
              Figures calculated from HR workflow records. Excluded from this period:{" "}
              {cur.excluded.test} test and {cur.excluded.duplicate} duplicate records.
              <br />
              Historical figures stay locked when targets or workflows change.
            </div>
          </CardContent>
        </Card>

        {/* KPI CARDS */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.key}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
                  <Tip text={`${k.formula} Source: ${k.source}`} />
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{k.value}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <Delta cur={k.numeric} prev={k.prev} lowerIsBetter={k.unit === "days"} />
                  <StatusChip status={k.status} />
                </div>
                {k.unit === "%" && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${STATUS_BAR[k.status]}`}
                      style={{ width: `${Math.min(100, k.numeric)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DELAY ATTRIBUTION */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              Delay attribution
              <Tip text="Delays caused by pending CEO or manager approvals are reported separately and are not counted against HR performance." />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 pt-0 md:grid-cols-3">
            {[
              { label: "Within HR control", count: cur.delaysHrControl, tone: "bg-amber-500" },
              { label: "Awaiting CEO approval", count: cur.delaysAwaitingCeo, tone: "bg-blue-500" },
              { label: "Awaiting manager action", count: cur.delaysAwaitingManager, tone: "bg-muted-foreground" },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm">{d.label}</span>
                  <span className="text-lg font-semibold tabular-nums">{d.count}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${d.tone}`} style={{ width: `${pct(d.count, totalDelays)}%` }} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{pct(d.count, totalDelays)}% of all delayed items</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RESPONSIBILITY SECTIONS */}
        <div className="grid gap-4 lg:grid-cols-2">
          {responsibilities.map((r) => (
            <Card key={r.key}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <StatusChip status={r.status} />
                </div>
                <p className="text-xs text-muted-foreground">{r.headline}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="divide-y">
                  {r.metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between gap-3 py-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm">{m.label}</span>
                        <Tip text={m.tip} />
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{m.value}</span>
                        {m.status && <StatusChip status={m.status} />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RISK SUMMARY */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> HR Risk Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead className="w-24 text-right">Count</TableHead>
                  <TableHead className="w-32">Owner</TableHead>
                  <TableHead className="w-40">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.map((r) => (
                  <TableRow key={r.label}>
                    <TableCell className="text-sm">{r.label}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{r.count}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {r.owner === "HR" ? "HR control" : `Awaiting ${r.owner}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={r.count === 0 ? "On Track" : r.severity} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CEO FEEDBACK */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" /> CEO Feedback
                <Badge variant="secondary" className="text-xs">Private</Badge>
              </CardTitle>
              {ceoMode && (
                <Button size="sm" onClick={() => setFbOpen(true)}>
                  <MessageSquarePlus className="mr-2 h-4 w-4" /> Add feedback
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Feedback is visible only to the CEO and the HR Head. Other employees and department heads cannot access it.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {feedback.length === 0 && <p className="text-sm text-muted-foreground">No feedback recorded yet.</p>}
            {feedback.map((f) => (
              <div key={f.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{f.kind}</Badge>
                  <span className="text-xs text-muted-foreground">{f.at}</span>
                  {f.discussed ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Discussed</Badge>
                  ) : (
                    ceoMode && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setFeedback((list) => list.map((x) => (x.id === f.id ? { ...x, discussed: true } : x)));
                          record(`Marked feedback as discussed (${f.kind})`);
                        }}
                      >
                        <Check className="mr-1 h-3 w-3" /> Mark as discussed
                      </Button>
                    )
                  )}
                </div>
                <p className="mt-2 text-sm">{f.body}</p>
                {(f.target || f.dueDate) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {f.target && <>Goal: {f.target}. </>}
                    {f.dueDate && <>Due {f.dueDate}.</>}
                  </p>
                )}
                {f.ack ? (
                  <div className="mt-2 rounded-md bg-muted/60 p-2 text-xs">
                    <span className="font-medium">HR Head response ({f.ack.at}):</span> {f.ack.response}
                  </div>
                ) : (
                  !ceoMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setAckFor(f);
                        setAckText("");
                      }}
                    >
                      Acknowledge & respond
                    </Button>
                  )
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* GOVERNANCE */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Target change history</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="divide-y text-sm">
                {TARGET_HISTORY.map((t) => (
                  <div key={t.metric} className="py-2">
                    <div className="font-medium">{t.metric}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.from} → {t.to} · effective {t.effective} · set by {t.by}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground">
                Calculated figures cannot be edited manually. Reports generated before a target change keep the target that
                applied on their effective date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Access &amp; activity log</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="max-h-64 space-y-2 overflow-auto text-sm">
                {log.map((l, i) => (
                  <div key={`${l.at}-${i}`} className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">{l.at}</div>
                    <div>{l.action}</div>
                    <div className="text-xs text-muted-foreground">{l.who}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ADD FEEDBACK DIALOG */}
        <Dialog open={fbOpen} onOpenChange={setFbOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add CEO feedback</DialogTitle>
              <DialogDescription>Private to the CEO and HR Head. Recorded in the activity log.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Feedback type</Label>
                <Select value={fbKind} onValueChange={(v) => setFbKind(v as FeedbackKind)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Feedback</Label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  value={fbBody}
                  onChange={(e) => setFbBody(e.target.value)}
                  placeholder="What went well, or what must change…"
                />
              </div>
              {(fbKind === "Improvement Goal" || fbKind === "Corrective Action" || fbKind === "Review Scheduled") && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Goal / expectation</Label>
                    <Input className="mt-1" value={fbTarget} onChange={(e) => setFbTarget(e.target.value)} placeholder="e.g. 90% reviews on time" />
                  </div>
                  <div>
                    <Label className="text-xs">{fbKind === "Review Scheduled" ? "Review date" : "Due date"}</Label>
                    <Input className="mt-1" type="date" value={fbDue} onChange={(e) => setFbDue(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFbOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addFeedback}>Save feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ACK DIALOG */}
        <Dialog open={!!ackFor} onOpenChange={(o) => !o && setAckFor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Acknowledge CEO feedback</DialogTitle>
              <DialogDescription>{ackFor?.body}</DialogDescription>
            </DialogHeader>
            <div>
              <Label className="text-xs">Your response</Label>
              <Textarea className="mt-1" rows={4} value={ackText} onChange={(e) => setAckText(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAckFor(null)}>
                Cancel
              </Button>
              <Button onClick={submitAck}>Acknowledge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default HrMyPerformance;
