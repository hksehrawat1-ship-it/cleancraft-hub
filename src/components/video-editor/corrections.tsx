import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileImage,
  HelpCircle,
  MessageSquare,
  Play,
  Send,
  Upload,
} from "lucide-react";
import { SectionHead } from "./ui";
import {
  EDITOR_NAME,
  PRIORITY_TONE,
  STATUS_TONE,
  VE_RECORDS,
  currentVersion,
  requirementsFor,
  type VeRecord,
} from "./dashboard-data";

const CATEGORIES = [
  "Cut or Timing",
  "Subtitle",
  "Spelling",
  "Audio",
  "Music",
  "Colour",
  "Logo or Branding",
  "Aspect Ratio",
  "Thumbnail",
  "Call-to-Action",
  "Missing Content",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

type CorrPointState = {
  completed: boolean;
  response: string;
  completedBy?: string;
  completedAt?: string;
};

type Stage =
  | "Correction Received"
  | "Correction Opened"
  | "Editing Started"
  | "Correction Points Completed"
  | "Ready to Resubmit"
  | "Resubmitted"
  | "Approved";

const STAGES: Stage[] = [
  "Correction Received",
  "Correction Opened",
  "Editing Started",
  "Correction Points Completed",
  "Ready to Resubmit",
  "Resubmitted",
  "Approved",
];

type TabKey = "new" | "progress" | "ready" | "resubmitted" | "approved";

const TABS: { key: TabKey; label: string }[] = [
  { key: "new", label: "New Corrections" },
  { key: "progress", label: "In Progress" },
  { key: "ready", label: "Ready to Resubmit" },
  { key: "resubmitted", label: "Resubmitted" },
  { key: "approved", label: "Approved" },
];

const RESUB_CHECKS = [
  "All correction points completed",
  "Previous reviewer comments checked",
  "Subtitles and spelling rechecked",
  "Audio rechecked",
  "Branding rechecked",
  "Export settings rechecked",
  "Corrected video watched completely",
];

function inferCategory(text: string): Category {
  const t = text.toLowerCase();
  if (/subtitle|caption/.test(t)) return "Subtitle";
  if (/spelling|typo|text says|₹|figure/.test(t)) return "Spelling";
  if (/music|bgm|background music/.test(t)) return "Music";
  if (/audio|voice|db|sound|mic/.test(t)) return "Audio";
  if (/logo|brand/.test(t)) return "Logo or Branding";
  if (/colour|color|grade|grading/.test(t)) return "Colour";
  if (/aspect|9:16|16:9|crop|frame/.test(t)) return "Aspect Ratio";
  if (/thumbnail/.test(t)) return "Thumbnail";
  if (/cta|call-to-action|end card/.test(t)) return "Call-to-Action";
  if (/missing|add /.test(t)) return "Missing Content";
  if (/hook|cut|trim|timing|fast|slow|pace/.test(t)) return "Cut or Timing";
  return "Other";
}

function pointTimestamp(index: number) {
  const secs = 3 + index * 11;
  return `00:${String(secs).padStart(2, "0")}`;
}

function pointKey(contentId: string, round: number, index: number) {
  return `${contentId}::${round}::${index}`;
}

export function VeCorrectionsPage() {
  const [records, setRecords] = useState<VeRecord[]>(VE_RECORDS);
  const [tab, setTab] = useState<TabKey>("new");
  const [openId, setOpenId] = useState<string | null>(null);
  const [points, setPoints] = useState<Record<string, CorrPointState>>({});
  const [stages, setStages] = useState<Record<string, Stage>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Record<string, string[]>>({});
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [resubChecks, setResubChecks] = useState<Record<string, string[]>>({});

  /** Only videos assigned to the logged-in editor that carry reviewer feedback. */
  const corrRecords = useMemo(
    () => records.filter((r) => r.corrections.length > 0),
    [records],
  );

  const stageOf = (r: VeRecord): Stage => {
    if (r.status === "Approved" || r.status === "Scheduled" || r.status === "Published") return "Approved";
    if (r.status === "Resubmitted" || r.status === "Submitted for Review") return "Resubmitted";
    return stages[r.contentId] ?? "Correction Received";
  };

  const activeRound = (r: VeRecord) => r.corrections.length - 1;

  const roundPoints = (r: VeRecord) => {
    const round = activeRound(r);
    return r.corrections[round].points.map((text, i) => ({
      text,
      index: i,
      key: pointKey(r.contentId, round, i),
      category: inferCategory(text),
      timestamp: pointTimestamp(i),
      reference: i % 2 === 0 ? `${r.contentId}_ref_${i + 1}.png` : "Reviewer voice note",
    }));
  };

  const completedCount = (r: VeRecord) =>
    roundPoints(r).filter((p) => points[p.key]?.completed || r.corrections[activeRound(r)].resolved).length;

  const allDone = (r: VeRecord) => completedCount(r) === roundPoints(r).length;

  const tabOf = (r: VeRecord): TabKey => {
    const s = stageOf(r);
    if (s === "Approved") return "approved";
    if (s === "Resubmitted") return "resubmitted";
    if (s === "Ready to Resubmit" || s === "Correction Points Completed") return "ready";
    if (s === "Correction Received") return "new";
    return "progress";
  };

  const counts = {
    urgent: corrRecords.filter((r) => r.priority === "Urgent" && tabOf(r) !== "approved").length,
    dueToday: corrRecords.filter((r) => r.dueToday && tabOf(r) !== "approved").length,
    progress: corrRecords.filter((r) => tabOf(r) === "progress").length,
    ready: corrRecords.filter((r) => tabOf(r) === "ready").length,
    completed: corrRecords.filter((r) => tabOf(r) === "resubmitted" || tabOf(r) === "approved").length,
  };

  const visible = corrRecords.filter((r) => tabOf(r) === tab);
  const open = records.find((r) => r.contentId === openId) ?? null;
  const readOnly = open ? tabOf(open) === "approved" || tabOf(open) === "resubmitted" : false;

  const alertsFor = (r: VeRecord): { text: string; tone: "bad" | "warn" }[] => {
    const a: { text: string; tone: "bad" | "warn" }[] = [];
    const round = r.corrections[activeRound(r)];
    if (round.urgent) a.push({ text: "Urgent correction", tone: "bad" });
    if (r.overdue) a.push({ text: `Correction overdue — ${r.deadline}`, tone: "bad" });
    else if (r.hoursToDeadline !== null && r.hoursToDeadline <= 2)
      a.push({ text: `Deadline within two hours — ${r.deadline}`, tone: "warn" });
    if ((questions[r.contentId]?.length ?? 0) > 0)
      a.push({ text: "Reviewer question is still unanswered", tone: "warn" });
    if (!allDone(r) && tabOf(r) !== "approved")
      a.push({
        text: `${roundPoints(r).length - completedCount(r)} correction point(s) not completed`,
        tone: "warn",
      });
    if (r.corrections.length > 2) a.push({ text: "Video returned more than twice", tone: "bad" });
    if (r.versions.filter((v) => v.status === "Correction Required").length > 1)
      a.push({ text: "A previous resubmission was rejected", tone: "bad" });
    return a;
  };

  const setStage = (id: string, s: Stage) => setStages((p) => ({ ...p, [id]: s }));

  const markPoint = (r: VeRecord, key: string) => {
    if (readOnly) return;
    setPoints((p) => ({
      ...p,
      [key]: {
        completed: true,
        response: p[key]?.response ?? "",
        completedBy: EDITOR_NAME,
        completedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      },
    }));
    const remaining = roundPoints(r).filter((p) => p.key !== key && !points[p.key]?.completed).length;
    setStage(r.contentId, remaining === 0 ? "Correction Points Completed" : "Editing Started");
    toast.success("Correction point marked completed", { description: `${r.contentId} · ${EDITOR_NAME}` });
  };

  const resubmit = (r: VeRecord) => {
    const checks = resubChecks[r.contentId] ?? [];
    if (!allDone(r)) {
      toast.error("Complete every correction point before resubmitting.");
      return;
    }
    if (checks.length < RESUB_CHECKS.length) {
      toast.error("Confirm all resubmission checks first.");
      return;
    }
    if (!uploads[r.contentId]) {
      toast.error("Upload the corrected version before resubmitting.");
      return;
    }
    const next = `v${r.versions.length + 1}`;
    const at = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    setRecords((prev) =>
      prev.map((x) =>
        x.contentId === r.contentId
          ? {
              ...x,
              status: "Resubmitted",
              corrections: x.corrections.map((c, i) =>
                i === activeRound(x) ? { ...c, resolved: true } : c,
              ),
              versions: [
                ...x.versions,
                {
                  version: next,
                  submittedOn: `Today, ${at.split(", ").pop()}`,
                  status: "Waiting for Review" as const,
                  reviewer: x.corrections[activeRound(x)].reviewer.split(" (")[0],
                  comments:
                    notes[x.contentId] ||
                    `All ${roundPoints(x).length} correction points completed by ${EDITOR_NAME}.`,
                },
              ],
            }
          : x,
      ),
    );
    setStage(r.contentId, "Resubmitted");
    setTab("resubmitted");
    setOpenId(null);
    toast.success(`Resubmitted for review — ${next}`, {
      description: `${r.contentId} kept · previous versions preserved · Social Media Account Manager notified (${at}).`,
    });
  };

  return (
    <div className="space-y-4">
      <SectionHead
        title="Corrections"
        sub="Reviewer feedback, correction checklists and resubmission — all on the original content record."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Urgent Corrections", v: counts.urgent, c: "text-destructive" },
          { l: "Due Today", v: counts.dueToday, c: "text-amber-600" },
          { l: "In Progress", v: counts.progress, c: "text-blue-600" },
          { l: "Ready to Resubmit", v: counts.ready, c: "text-primary" },
          { l: "Completed Corrections", v: counts.completed, c: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={`text-2xl font-bold tabular-nums mt-1 ${s.c}`}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">
              {t.label} ({corrRecords.filter((r) => tabOf(r) === t.key).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {visible.map((r) => {
          const round = r.corrections[activeRound(r)];
          const alerts = alertsFor(r);
          return (
            <Card key={r.contentId} className={round.urgent && tabOf(r) !== "approved" ? "border-destructive/40" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="h-24 rounded-md bg-muted flex items-center justify-center text-4xl">{r.thumbnail}</div>
                <div>
                  <div className="text-sm font-semibold leading-tight">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.contentId} · current {currentVersion(r)} · {r.platform}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Reviewer: {round.reviewer}</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={PRIORITY_TONE[r.priority]}>
                    {r.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={r.overdue ? "bg-destructive/15 text-destructive border-destructive/30" : ""}
                  >
                    <Clock className="h-3 w-3 mr-1" /> {round.deadline}
                  </Badge>
                  <Badge variant="outline">{round.points.length} points</Badge>
                  <Badge variant="outline" className={STATUS_TONE[r.status]}>
                    {stageOf(r)}
                  </Badge>
                </div>
                <Progress value={(completedCount(r) / round.points.length) * 100} className="h-1.5" />
                {alerts.slice(0, 2).map((a) => (
                  <div
                    key={a.text}
                    className={`text-[11px] rounded px-2 py-1 border ${
                      a.tone === "bad"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    {a.text}
                  </div>
                ))}
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setOpenId(r.contentId);
                    if (stageOf(r) === "Correction Received") setStage(r.contentId, "Correction Opened");
                  }}
                >
                  Open Corrections
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No corrections in this tab.</p>
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {open && (
            <CorrectionDetail
              r={open}
              stage={stageOf(open)}
              readOnly={readOnly}
              pointsState={points}
              roundPoints={roundPoints(open)}
              completed={completedCount(open)}
              alerts={alertsFor(open)}
              note={notes[open.contentId] ?? ""}
              questionsAsked={questions[open.contentId] ?? []}
              upload={uploads[open.contentId] ?? ""}
              checks={resubChecks[open.contentId] ?? []}
              onStart={() => setStage(open.contentId, "Editing Started")}
              onAsk={(q) =>
                setQuestions((p) => ({ ...p, [open.contentId]: [...(p[open.contentId] ?? []), q] }))
              }
              onMark={(key) => markPoint(open, key)}
              onResponse={(key, v) =>
                setPoints((p) => ({ ...p, [key]: { ...(p[key] ?? { completed: false, response: "" }), response: v } }))
              }
              onNote={(v) => setNotes((p) => ({ ...p, [open.contentId]: v }))}
              onUpload={() =>
                setUploads((p) => ({
                  ...p,
                  [open.contentId]: `${open.contentId}_v${open.versions.length + 1}_corrected.mp4`,
                }))
              }
              onToggleCheck={(c, on) =>
                setResubChecks((p) => {
                  const cur = p[open.contentId] ?? [];
                  return { ...p, [open.contentId]: on ? [...cur, c] : cur.filter((x) => x !== c) };
                })
              }
              onReady={() => setStage(open.contentId, "Ready to Resubmit")}
              onResubmit={() => resubmit(open)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

type DetailProps = {
  r: VeRecord;
  stage: Stage;
  readOnly: boolean;
  pointsState: Record<string, CorrPointState>;
  roundPoints: {
    text: string;
    index: number;
    key: string;
    category: Category;
    timestamp: string;
    reference: string;
  }[];
  completed: number;
  alerts: { text: string; tone: "bad" | "warn" }[];
  note: string;
  questionsAsked: string[];
  upload: string;
  checks: string[];
  onStart: () => void;
  onAsk: (q: string) => void;
  onMark: (key: string) => void;
  onResponse: (key: string, v: string) => void;
  onNote: (v: string) => void;
  onUpload: () => void;
  onToggleCheck: (c: string, on: boolean) => void;
  onReady: () => void;
  onResubmit: () => void;
};

function CorrectionDetail(p: DetailProps) {
  const { r } = p;
  const round = r.corrections[r.corrections.length - 1];
  const req = requirementsFor(r);
  const [question, setQuestion] = useState("");
  const allDone = p.completed === p.roundPoints.length;

  return (
    <>
      <SheetHeader className="mb-4">
        <SheetTitle className="text-left pr-8">{r.title}</SheetTitle>
        <div className="text-xs text-muted-foreground text-left">
          {r.contentId} · submitted version {currentVersion(r)} · {r.platform}
        </div>
      </SheetHeader>

      <div className="space-y-4">
        {p.readOnly && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs">
            This correction round is read-only. Approval, scheduling, publishing and deletion stay with the Social Media
            Account Manager.
          </div>
        )}

        {p.alerts.length > 0 && (
          <div className="space-y-1.5">
            {p.alerts.map((a) => (
              <div
                key={a.text}
                className={`text-xs rounded px-2 py-1.5 border ${
                  a.tone === "bad"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                }`}
              >
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                {a.text}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className={
                STAGES.indexOf(s) <= STAGES.indexOf(p.stage)
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "text-muted-foreground"
              }
            >
              {s}
            </Badge>
          ))}
        </div>

        <div className="h-36 rounded-lg border bg-muted flex flex-col items-center justify-center text-muted-foreground">
          <Play className="h-7 w-7 mb-1" />
          <span className="text-xs">Video preview placeholder — {currentVersion(r)}</span>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Reviewer feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row l="Reviewer" v={round.reviewer} />
            <Row l="Review date & time" v={round.raisedOn} />
            <Row l="Correction deadline" v={round.deadline} />
            <div className="rounded-md border bg-muted/30 p-2 text-sm">
              {r.versions[r.versions.length - 1]?.comments ?? "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Original editing brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p>{r.brief}</p>
            <div className="text-xs text-muted-foreground">
              {req.aspectRatio} · {req.resolution} · {req.duration} · {req.logo}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" disabled={p.readOnly} onClick={p.onStart}>
            Start Corrections
          </Button>
          <Button size="sm" variant="outline" disabled={p.readOnly} onClick={p.onUpload}>
            <Upload className="h-4 w-4 mr-1" /> {p.upload ? "Re-attach" : "Upload Corrected Version"}
          </Button>
        </div>
        {p.upload && <div className="text-xs text-emerald-700">Attached: {p.upload}</div>}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Correction points ({p.completed}/{p.roundPoints.length} completed)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {p.roundPoints.map((pt) => {
              const st = p.pointsState[pt.key];
              const done = st?.completed || round.resolved;
              return (
                <div
                  key={pt.key}
                  className={`rounded-lg border p-3 space-y-2 ${
                    done ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold tabular-nums mt-0.5">#{pt.index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          {pt.timestamp}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {pt.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            done
                              ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]"
                              : "bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]"
                          }
                        >
                          {done ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm">{pt.text}</p>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                        <FileImage className="h-3 w-3" /> {pt.reference}
                      </div>
                      {done && st?.completedBy && (
                        <div className="text-[11px] text-emerald-700 mt-1">
                          Completed by {st.completedBy} · {st.completedAt}
                        </div>
                      )}
                    </div>
                  </div>
                  <Textarea
                    rows={2}
                    disabled={p.readOnly}
                    placeholder="Editor response for this point"
                    value={st?.response ?? ""}
                    onChange={(e) => p.onResponse(pt.key, e.target.value)}
                  />
                  {!done && (
                    <Button size="sm" variant="outline" disabled={p.readOnly} onClick={() => p.onMark(pt.key)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Point Completed
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Editor note to reviewer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              rows={3}
              disabled={p.readOnly}
              value={p.note}
              onChange={(e) => p.onNote(e.target.value)}
              placeholder="Summarise what changed in this version"
            />
            <Separator />
            <div className="space-y-2">
              <Textarea
                rows={2}
                disabled={p.readOnly}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask the reviewer a question"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={p.readOnly || !question.trim()}
                onClick={() => {
                  p.onAsk(question.trim());
                  setQuestion("");
                  toast.success("Question sent to the reviewer", { description: r.contentId });
                }}
              >
                <HelpCircle className="h-4 w-4 mr-1" /> Ask Reviewer a Question
              </Button>
              {p.questionsAsked.map((q, i) => (
                <div key={`${q}-${i}`} className="text-xs rounded border px-2 py-1 flex items-start gap-1">
                  <MessageSquare className="h-3 w-3 mt-0.5" /> {q} — awaiting reviewer reply
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resubmission check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RESUB_CHECKS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  disabled={p.readOnly}
                  checked={p.checks.includes(c)}
                  onCheckedChange={(v) => p.onToggleCheck(c, !!v)}
                />
                <span>{c}</span>
              </label>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button size="sm" variant="outline" disabled={p.readOnly || !allDone} onClick={p.onReady}>
                Mark Ready to Resubmit
              </Button>
              <Button size="sm" disabled={p.readOnly} onClick={p.onResubmit}>
                <Send className="h-4 w-4 mr-1" /> Resubmit for Review
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Resubmission creates version v{r.versions.length + 1} under the same Content ID, attaches the completed
              correction points and editor notes, preserves earlier versions, and alerts the Social Media Account
              Manager.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Version history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.versions.map((v) => (
              <div key={v.version} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{v.version}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {v.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {v.submittedOn} · reviewer {v.reviewer}
                </div>
                <p className="text-xs mt-1">{v.comments}</p>
              </div>
            ))}
            {r.corrections.map((c, i) => (
              <div key={`${c.version}-${i}`} className="rounded-md border border-dashed p-2 text-xs">
                Correction round {i + 1} on {c.version} · {c.reviewer} · {c.raisedOn} · {c.points.length} points
                {c.resolved ? " · resolved" : " · open"}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground shrink-0">{l}:</span>
      <span className="font-medium min-w-0">{v}</span>
    </div>
  );
}
