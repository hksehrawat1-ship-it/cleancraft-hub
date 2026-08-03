import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BarChart3,
  ShieldAlert,
  Download,
  Printer,
  FileSpreadsheet,
  Send,
  Plus,
  Check,
  Lock,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Eye,
} from "lucide-react";
import {
  REPORTS,
  REPORT_TYPES,
  REPORT_STAGES,
  PERIODS,
  LOCATIONS,
  STAGE_TONE,
  PRIVACY_NOTE,
  summaryCards,
  workforce,
  recruitment,
  attendance,
  performance,
  movement,
  access,
  risks,
  buildSnapshot,
  nowStamp,
  type CeoReport,
  type ReportType,
  type ReportStage,
  type Period,
} from "./reports-data";
import { DEPTS } from "./data";

const LEVEL_TONE: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  ok: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

function Kpi({ k, v, hint }: { k: string; v: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{v}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
      <div className="min-w-0">
        <div className="truncate text-sm">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <div className="shrink-0 text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="space-y-1 py-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <Progress value={max ? (value / max) * 100 : 0} className="h-1.5" />
    </div>
  );
}

function Calculated() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
      <Lock className="h-3 w-3" /> Calculated
    </span>
  );
}

export function HrReports() {
  const [reports, setReports] = useState<CeoReport[]>(REPORTS);
  const [period, setPeriod] = useState<Period>("July 2026");
  const [openId, setOpenId] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [exportFor, setExportFor] = useState<CeoReport | null>(null);
  const [reply, setReply] = useState("");

  const cards = useMemo(() => summaryCards(), []);
  const w = useMemo(() => workforce(), []);
  const r = useMemo(() => recruitment(), []);
  const a = useMemo(() => attendance(), []);
  const p = useMemo(() => performance(), []);
  const mv = useMemo(() => movement(), []);
  const ac = useMemo(() => access(), []);
  const rk = useMemo(() => risks(), []);

  const drafts = reports.filter((x) => x.stage === "Draft").length;
  const awaiting = reports.filter((x) => x.stage === "Ready for Review").length;
  const last = reports[0];
  const open = reports.find((x) => x.id === openId) ?? null;

  const log = (id: string, text: string, by = "Anjali Kapoor (HR Head)") =>
    setReports((prev) =>
      prev.map((x) => (x.id === id ? { ...x, audit: [...x.audit, { at: nowStamp(), by, text }] } : x)),
    );

  const setStage = (id: string, stage: ReportStage, note: string) => {
    setReports((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              stage,
              submittedOn: stage === "Submitted to CEO" ? nowStamp() : x.submittedOn,
              viewedOn: stage === "Viewed by CEO" ? nowStamp() : x.viewedOn,
              reviewedOn: stage === "Closed" ? nowStamp() : x.reviewedOn,
              audit: [...x.audit, { at: nowStamp(), by: "Anjali Kapoor (HR Head)", text: note }],
            }
          : x,
      ),
    );
    toast.success(note);
  };

  const respond = (id: string, index: number, text: string) => {
    setReports((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              ceoComments: x.ceoComments.map((c, i) =>
                i === index ? { ...c, hrResponse: text, hrRespondedAt: nowStamp() } : c,
              ),
              audit: [...x.audit, { at: nowStamp(), by: "Anjali Kapoor (HR Head)", text: "Responded to CEO comment" }],
            }
          : x,
      ),
    );
    setReply("");
    toast.success("Response recorded in the report");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BarChart3 className="h-6 w-6 text-primary" /> Reports to CEO
          </h1>
          <p className="text-sm text-muted-foreground">
            Reporting period <span className="font-medium text-foreground">{period}</span> · Last report{" "}
            <span className="font-medium text-foreground">
              {last ? `${last.id} · ${last.createdOn}` : "—"}
            </span>{" "}
            · Generated {nowStamp()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{drafts} draft</Badge>
          <Badge variant="secondary">{awaiting} awaiting review</Badge>
          <Button onClick={() => setWizard(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create CEO Report
          </Button>
        </div>
      </div>

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="flex items-start gap-2 p-3 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-600" />
          <span>{PRIVACY_NOTE}</span>
        </CardContent>
      </Card>

      {/* CEO summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Kpi key={c.k} k={c.k} v={c.v} hint={c.hint} />
        ))}
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="reports">Report Library</TabsTrigger>
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="attendance">Attendance & Leave</TabsTrigger>
          <TabsTrigger value="performance">Performance & Training</TabsTrigger>
          <TabsTrigger value="movement">Employee Movement</TabsTrigger>
          <TabsTrigger value="risk">HR Risk</TabsTrigger>
          <TabsTrigger value="access">User Access</TabsTrigger>
        </TabsList>

        {/* Library */}
        <TabsContent value="reports" className="mt-4 space-y-3">
          {reports.map((x) => (
            <Card key={x.id}>
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{x.type}</span>
                    <Badge className={STAGE_TONE[x.stage]} variant="secondary">
                      {x.stage}
                    </Badge>
                    {x.ceoComments.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <MessageSquare className="h-3 w-3" /> {x.ceoComments.length} CEO comment
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {x.id} · {x.period} · {x.scope} · generated {x.generatedAt}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {x.snapshot.map((s) => (
                      <div key={s.label} className="rounded border px-2 py-1 text-xs">
                        <span className="text-muted-foreground">{s.label}: </span>
                        <span className="font-semibold tabular-nums">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOpenId(x.id)}>
                    <Eye className="mr-2 h-4 w-4" /> Open
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setExportFor(x)}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Workforce */}
        <TabsContent value="workforce" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                Employees by department <Calculated />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {w.byDept.map(([d, n]) => (
                <BarRow key={d} label={d} value={n} max={w.byDept[0]?.[1] ?? 1} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Employees by location</CardTitle>
            </CardHeader>
            <CardContent>
              {w.byLoc.map(([d, n]) => (
                <BarRow key={d} label={d} value={n} max={w.byLoc[0]?.[1] ?? 1} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Employment type</CardTitle>
            </CardHeader>
            <CardContent>
              {w.byType.map(([d, n]) => (
                <Row key={d} label={d} value={n} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status & turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Probation employees" value={w.probation} />
              <Row label="Confirmed employees" value={w.confirmed} />
              <Row label="Notice-period employees" value={w.notice} />
              <Row label="New joiners" value={w.joiners.length} sub={w.joiners.map((e) => e.dept).join(", ") || "—"} />
              <Row label="Exits" value={w.exits.length} />
              <Row label="Employee turnover rate" value={`${w.turnover}%`} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruitment */}
        <TabsContent value="recruitment" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                Hiring funnel <Calculated />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Open positions" value={r.openPositions} sub={`${r.requisitions} active requisitions`} />
              <Row label="Applications received" value={r.applications} />
              <Row label="Candidates shortlisted" value={r.shortlisted} />
              <Row label="Interviews completed" value={r.interviewsDone} />
              <Row label="Offers issued" value={r.offers} />
              <Row label="Offers accepted" value={r.accepted} />
              <Row label="Employees joined" value={r.joined} />
              <Row label="Average time to hire" value={`${r.timeToHire} days`} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hiring source performance</CardTitle>
            </CardHeader>
            <CardContent>
              {r.bySource.map(([s, v]) => (
                <Row key={s} label={s} value={`${v.joined}/${v.total}`} sub="Joined / candidates" />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                Attendance summary <Calculated />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Present rate" value={`${a.presentRate}%`} />
              <Row label="Absence rate" value={`${a.absenceRate}%`} />
              <Row label="Late-arrival rate" value={`${a.lateRate}%`} />
              <Row label="Employees on leave" value={a.onLeave} />
              <Row label="Leave requests pending" value={a.leavesPending} />
              <Row label="Regularisations pending" value={a.regsPending} />
              <div className="mt-2 text-xs text-muted-foreground">
                Leave reasons, including medical details, are not shown in CEO summaries.
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Department-level trends</CardTitle>
            </CardHeader>
            <CardContent>
              {a.byDept.map(([d, v]) => (
                <BarRow key={d} label={`${d} — ${Math.round((v.present / v.total) * 100)}% present`} value={v.total} max={Math.max(...a.byDept.map(([, x]) => x.total))} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                Reviews & goals <Calculated />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Reviews due" value={p.reviewsDue} />
              <Row label="Reviews completed" value={p.reviewsCompleted} />
              <Row label="Goal-completion rate" value={`${p.goalRate}%`} />
              <Row label="Improvement plans active" value={p.pipsActive} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Training</CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Training assigned" value={p.trainingAssigned} />
              <Row label="Training completed" value={p.trainingCompleted} />
              <Row label="Training overdue" value={p.trainingOverdue} />
              <Row label="Mandatory training completion" value={`${p.mandatoryRate}%`} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Performance risks requiring leadership attention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {p.risks.length === 0 && <div className="text-sm text-muted-foreground">No performance risks flagged.</div>}
              {p.risks.map((x, i) => (
                <div key={i} className="rounded border p-2 text-sm">
                  {x.text}
                </div>
              ))}
              <div className="text-xs text-muted-foreground">
                Individual employees are never ranked publicly. Names and ratings stay inside Performance & Training.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movement */}
        <TabsContent value="movement" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                Movement summary <Calculated />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="New joiners" value={mv.joiners.length} />
              <Row label="Confirmations" value={mv.confirmations} />
              <Row label="Promotions" value={mv.promotions} />
              <Row label="Transfers" value={mv.transfers} />
              <Row label="Resignations" value={mv.resignations} />
              <Row label="Terminations" value={mv.terminations} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notice period & upcoming exits</CardTitle>
            </CardHeader>
            <CardContent>
              {mv.upcomingExits.length === 0 && (
                <div className="text-sm text-muted-foreground">No upcoming exits in this period.</div>
              )}
              {mv.upcomingExits.map((e) => (
                <Row
                  key={e.empId}
                  label={`${e.dept} · ${e.designation}`}
                  value={e.status}
                  sub={e.exitDate ? `Exit ${e.exitDate}` : "Serving notice"}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk */}
        <TabsContent value="risk" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                HR Risk Report <Calculated />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rk.items.map((x) => (
                <div key={x.label} className="flex items-center justify-between gap-3 rounded border p-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{x.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{x.note || "—"}</div>
                  </div>
                  <Badge className={LEVEL_TONE[x.level]} variant="secondary">
                    {x.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access */}
        <TabsContent value="access" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                Access status <Calculated />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Accounts pending creation" value={ac.pendingCreation} />
              <Row label="Invitations not accepted" value={ac.invitesNotAccepted} />
              <Row label="Locked or suspended accounts" value={ac.lockedSuspended} />
              <Row label="Privileged-role changes" value={ac.privilegedChanges} />
              <Row label="Accounts pending deactivation" value={ac.pendingDeactivation} />
              <Row label="Access-review actions due" value={ac.reviewsDue} />
            </CardContent>
          </Card>
          <Card className={ac.exitedWithAccess.length ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Exited employees with active access</CardTitle>
            </CardHeader>
            <CardContent>
              {ac.exitedWithAccess.length === 0 && (
                <div className="text-sm text-muted-foreground">None — all exit access has been closed.</div>
              )}
              {ac.exitedWithAccess.map((u) => (
                <Row key={u.id} label={`${u.dept} · ${u.designation}`} value={u.role} sub="Deactivate immediately" />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report detail */}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {open.type}
                  <Badge className={STAGE_TONE[open.stage]} variant="secondary">
                    {open.stage}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  {open.id} · {open.period} · {open.scope} · generated {open.generatedAt}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {open.snapshot.map((s) => (
                    <div key={s.label} className="rounded border p-2">
                      <div className="text-[11px] uppercase text-muted-foreground">{s.label}</div>
                      <div className="text-lg font-semibold tabular-nums">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Numbers are locked to the generation time and stay unchanged even if HR records change later.
                </div>

                <Separator />
                <div>
                  <div className="mb-1 text-sm font-semibold">HR Head comments</div>
                  <Textarea
                    value={open.hrComments}
                    placeholder="Add context and explanation for the CEO…"
                    onChange={(e) =>
                      setReports((prev) =>
                        prev.map((x) => (x.id === open.id ? { ...x, hrComments: e.target.value } : x)),
                      )
                    }
                    rows={4}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {open.stage === "Draft" && (
                    <Button size="sm" onClick={() => setStage(open.id, "Ready for Review", "Marked ready for review")}>
                      <Check className="mr-2 h-4 w-4" /> Mark ready
                    </Button>
                  )}
                  {(open.stage === "Draft" || open.stage === "Ready for Review") && (
                    <Button size="sm" onClick={() => setStage(open.id, "Submitted to CEO", "Submitted to CEO")}>
                      <Send className="mr-2 h-4 w-4" /> Submit to CEO
                    </Button>
                  )}
                  {open.stage === "CEO Feedback Received" && (
                    <Button size="sm" onClick={() => setStage(open.id, "Closed", "Report closed after CEO review")}>
                      <Check className="mr-2 h-4 w-4" /> Close report
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setExportFor(open)}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>

                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-semibold">CEO comments & clarifications</div>
                  {open.ceoComments.length === 0 && (
                    <div className="text-sm text-muted-foreground">No CEO comments yet.</div>
                  )}
                  {open.ceoComments.map((c, i) => (
                    <div key={i} className="rounded border p-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {c.by} · {c.at}
                        </span>
                        <Badge variant="outline">{c.kind}</Badge>
                      </div>
                      <div className="mt-1 text-sm">{c.text}</div>
                      {c.hrResponse ? (
                        <div className="mt-2 rounded bg-muted p-2 text-xs">
                          <span className="font-medium">HR response ({c.hrRespondedAt}): </span>
                          {c.hrResponse}
                        </div>
                      ) : (
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Respond to the CEO…"
                          />
                          <Button size="sm" disabled={!reply.trim()} onClick={() => respond(open.id, i, reply.trim())}>
                            Send
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-semibold">CEO actions (preview)</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStage(open.id, "Viewed by CEO", "CEO viewed the report")}
                    >
                      Mark viewed by CEO
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReports((prev) =>
                          prev.map((x) =>
                            x.id === open.id
                              ? {
                                  ...x,
                                  stage: "CEO Feedback Received",
                                  ceoComments: [
                                    ...x.ceoComments,
                                    {
                                      at: nowStamp(),
                                      by: "CEO",
                                      kind: "Clarification requested",
                                      text: "Please share more detail on this period's key numbers.",
                                    },
                                  ],
                                  audit: [...x.audit, { at: nowStamp(), by: "CEO", text: "Clarification requested" }],
                                }
                              : x,
                          ),
                        );
                        toast.success("Clarification requested by CEO");
                      }}
                    >
                      Request clarification
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setStage(open.id, "Closed", "CEO marked report reviewed")}>
                      Mark reviewed
                    </Button>
                  </div>
                </div>

                <Separator />
                <div>
                  <div className="mb-1 text-sm font-semibold">Access & change record</div>
                  <div className="space-y-1">
                    {open.audit.map((h, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{h.at}</span> · {h.by} — {h.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Export dialog */}
      <Dialog open={!!exportFor} onOpenChange={(v) => !v && setExportFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export report</DialogTitle>
            <DialogDescription>
              Exports follow your permissions, the applied period and department filters, and all privacy rules.
              Salary, bank, Aadhaar, PAN, medical and disciplinary details are excluded.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { label: "Export PDF", icon: Download },
                { label: "Export Excel", icon: FileSpreadsheet },
                { label: "Print Report", icon: Printer },
              ] as const
            ).map((o) => (
              <Button
                key={o.label}
                variant="outline"
                onClick={() => {
                  if (exportFor) log(exportFor.id, `${o.label} — export recorded`);
                  toast.success(`${o.label}: ${exportFor?.id} prepared`);
                  setExportFor(null);
                }}
              >
                <o.icon className="mr-2 h-4 w-4" /> {o.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <CreateWizard
        open={wizard}
        onClose={() => setWizard(false)}
        onCreate={(rep) => {
          setReports((prev) => [rep, ...prev]);
          setWizard(false);
          setOpenId(rep.id);
          toast.success(`${rep.type} created for ${rep.period}`);
        }}
      />
    </div>
  );
}

/* ---------------- guided creation ---------------- */
function CreateWizard({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (r: CeoReport) => void;
}) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<ReportType>("Monthly HR Summary");
  const [period, setPeriod] = useState<Period>("July 2026");
  const [depts, setDepts] = useState<string[]>([]);
  const [locs, setLocs] = useState<string[]>([]);
  const [comments, setComments] = useState("");

  const snapshot = useMemo(() => buildSnapshot(type), [type]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const build = (stage: ReportStage): CeoReport => ({
    id: `RPT-2026-${Math.floor(100 + Math.random() * 800)}`,
    type,
    period,
    scope: `${depts.length ? depts.join(", ") : "All departments"} · ${locs.length ? locs.join(", ") : "All locations"}`,
    stage,
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: nowStamp().split(",")[0] ?? nowStamp(),
    generatedAt: nowStamp(),
    hrComments: comments,
    submittedOn: stage === "Submitted to CEO" ? nowStamp() : undefined,
    ceoComments: [],
    snapshot,
    audit: [
      { at: nowStamp(), by: "Anjali Kapoor (HR Head)", text: "Report generated from live HR records" },
      ...(stage === "Submitted to CEO"
        ? [{ at: nowStamp(), by: "Anjali Kapoor (HR Head)", text: "Submitted to CEO" }]
        : []),
    ],
  });

  const reset = () => {
    setStep(1);
    setDepts([]);
    setLocs([]);
    setComments("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create CEO Report — Step {step} of 6</DialogTitle>
          <DialogDescription>
            {step === 1 && "Select the report type."}
            {step === 2 && "Select the reporting period."}
            {step === 3 && "Select departments or locations (optional)."}
            {step === 4 && "Review automatically calculated data. These numbers cannot be edited."}
            {step === 5 && "Add your comments and explanations."}
            {step === 6 && "Save as draft or submit to the CEO."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {step === 1 &&
            REPORT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`w-full rounded border p-3 text-left text-sm ${type === t ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
              >
                {t}
              </button>
            ))}

          {step === 2 && (
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((x) => (
                  <SelectItem key={x} value={x}>
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {step === 3 && (
            <>
              <div className="text-xs font-medium uppercase text-muted-foreground">Departments</div>
              <div className="flex flex-wrap gap-2">
                {DEPTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggle(depts, setDepts, d)}
                    className={`rounded-full border px-3 py-1 text-xs ${depts.includes(d) ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs font-medium uppercase text-muted-foreground">Locations</div>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggle(locs, setLocs, d)}
                    className={`rounded-full border px-3 py-1 text-xs ${locs.includes(d) ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {snapshot.map((s) => (
                  <div key={s.label} className="rounded border p-2">
                    <div className="text-[11px] uppercase text-muted-foreground">{s.label}</div>
                    <div className="text-lg font-semibold tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Calculated from shared HR records — manual editing is not allowed.
              </div>
            </div>
          )}

          {step === 5 && (
            <Textarea
              rows={5}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Explain the numbers, risks and the plan for next month…"
            />
          )}

          {step === 6 && (
            <div className="space-y-2 text-sm">
              <Row label="Report type" value={type} />
              <Row label="Period" value={period} />
              <Row label="Scope" value={`${depts.length || "All"} dept · ${locs.length || "All"} loc`} />
              <Row label="Generated at" value={nowStamp()} />
              <div className="text-xs text-muted-foreground">{PRIVACY_NOTE}</div>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < 6 ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onCreate(build("Draft"));
                  reset();
                }}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onCreate(build("Submitted to CEO"));
                  reset();
                }}
              >
                <Send className="mr-2 h-4 w-4" /> Submit to CEO
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
