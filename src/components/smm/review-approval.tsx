import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Film,
  History,
  Lock,
  MessageSquare,
  Pause,
  Plus,
  Trash2,
} from "lucide-react";
import { SectionHead, StatCard } from "./ui";
import {
  SHARED_CONTENT,
  REVIEW_CHECKLIST_FULL,
  CORRECTION_CATEGORIES,
  getSubmissionDetails,
  type SharedContent,
  type CorrectionPoint,
  type CorrectionCategory,
} from "./shared-records";

type Decision = "Approved" | "Correction Required" | "On Hold";

type ReviewState = {
  status: "New" | "Under Review" | "Correction Required" | "Approved" | "On Hold";
  checks: boolean[];
  points: CorrectionPoint[];
  decision?: Decision;
  approvedVersion?: string;
  audit: string[];
};

const TABS = [
  "New Submissions",
  "Urgent",
  "Resubmissions",
  "Under Review",
  "Correction Required",
  "Approved",
] as const;
type Tab = (typeof TABS)[number];

function baseStatus(c: SharedContent): ReviewState["status"] {
  if (c.stage === "Correction Required") return "Correction Required";
  if (c.stage === "Approved" || c.stage === "Scheduled" || c.stage === "Published")
    return "Approved";
  return "New";
}

const REVIEW_POOL = SHARED_CONTENT.filter((c) =>
  ["Submitted for Review", "Correction Required", "Approved", "Scheduled", "Published"].includes(
    c.stage,
  ),
);

export function SmmReviewPage() {
  const [tab, setTab] = useState<Tab>("New Submissions");
  const [openId, setOpenId] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, ReviewState>>(() =>
    Object.fromEntries(
      REVIEW_POOL.map((c) => [
        c.contentId,
        {
          status: baseStatus(c),
          checks: REVIEW_CHECKLIST_FULL.map(() => false),
          points: getSubmissionDetails(c.contentId).priorPoints.filter((p) => !p.done),
          approvedVersion: c.approvedVersion,
          audit: [
            `${c.submittedAt ?? "—"} — ${c.editor} submitted ${c.currentVersion} for review`,
          ],
        } as ReviewState,
      ]),
    ),
  );

  const rows = useMemo(() => {
    return REVIEW_POOL.filter((c) => {
      const s = state[c.contentId]!;
      switch (tab) {
        case "New Submissions":
          return s.status === "New";
        case "Urgent":
          return (
            (s.status === "New" || s.status === "Under Review") &&
            (c.priority === "High" || c.overdue || (c.reviewWaitHours ?? 0) > 12)
          );
        case "Resubmissions":
          return s.status !== "Approved" && c.versions.length > 1;
        case "Under Review":
          return s.status === "Under Review" || s.status === "On Hold";
        case "Correction Required":
          return s.status === "Correction Required";
        case "Approved":
          return s.status === "Approved";
      }
    });
  }, [tab, state]);

  const waiting = REVIEW_POOL.filter((c) => state[c.contentId]!.status === "New").length;
  const urgent = REVIEW_POOL.filter(
    (c) =>
      state[c.contentId]!.status === "New" &&
      (c.priority === "High" || c.overdue || (c.reviewWaitHours ?? 0) > 12),
  ).length;
  const resubs = REVIEW_POOL.filter(
    (c) => state[c.contentId]!.status !== "Approved" && c.versions.length > 1,
  ).length;
  const approvedToday = REVIEW_POOL.filter(
    (c) => state[c.contentId]!.decision === "Approved",
  ).length;

  const open = openId ? REVIEW_POOL.find((c) => c.contentId === openId) ?? null : null;

  function update(id: string, patch: Partial<ReviewState>, auditLine?: string) {
    setState((prev) => {
      const cur = prev[id]!;
      return {
        ...prev,
        [id]: {
          ...cur,
          ...patch,
          audit: auditLine ? [...cur.audit, auditLine] : cur.audit,
        },
      };
    });
  }

  if (open) {
    return (
      <ReviewWorkspace
        item={open}
        state={state[open.contentId]!}
        onBack={() => setOpenId(null)}
        onUpdate={(patch, line) => update(open.contentId, patch, line)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHead
        title="Review & Approval"
        sub="Review edited versions, add correction points, approve final cuts and prepare content for scheduling."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Waiting for Review" value={String(waiting)} tone={waiting ? "warn" : "good"} />
        <StatCard label="Urgent Reviews" value={String(urgent)} tone={urgent ? "bad" : "good"} />
        <StatCard label="Corrections Resubmitted" value={String(resubs)} />
        <StatCard label="Approved Today" value={String(approvedToday)} tone="good" />
        <StatCard label="Avg Review Time" value="4.2 h" sub="Target under 6 h" tone="good" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "outline"}
            onClick={() => setTab(t)}
            className="shrink-0"
          >
            {t}
          </Button>
        ))}
      </div>

      {rows.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nothing in this queue right now.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => {
          const s = state[c.contentId]!;
          return (
            <Card key={c.contentId} className="overflow-hidden">
              <div
                className={`h-28 bg-gradient-to-br ${c.thumbTone} flex items-center justify-center border-b`}
              >
                <Film className="h-7 w-7 text-muted-foreground" />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold leading-tight text-sm">{c.title}</div>
                  <Badge
                    variant={
                      c.priority === "High"
                        ? "destructive"
                        : c.priority === "Medium"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {c.priority}
                  </Badge>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">{c.contentId}</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{c.brand}</Badge>
                  <Badge variant="outline">{c.type}</Badge>
                  <Badge variant="outline">{c.platform}</Badge>
                  <Badge variant="secondary">{c.currentVersion}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>Editor: {c.editor}</div>
                  <div>Submitted: {c.submittedAt ?? "—"}</div>
                  <div className={c.overdue ? "text-destructive font-medium" : ""}>
                    Publish deadline: {c.dueAt}
                  </div>
                </div>
                {s.status === "Approved" ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium pt-1">
                    <Lock className="h-3.5 w-3.5" /> {s.approvedVersion ?? c.currentVersion} locked &
                    sent to Publishing Calendar
                  </div>
                ) : (
                  <Button size="sm" className="w-full mt-1" onClick={() => setOpenId(c.contentId)}>
                    {s.status === "New" ? "Start Review" : "Open Review"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Every review is linked to one Content ID and version. Previous versions are never
        overwritten, comments stay attached to the reviewed version, and only authorised managers can
        approve. Video Editors cannot approve, schedule or publish.
      </p>
    </div>
  );
}

/* ------------------------- workspace ------------------------- */

function ReviewWorkspace({
  item,
  state,
  onBack,
  onUpdate,
}: {
  item: SharedContent;
  state: ReviewState;
  onBack: () => void;
  onUpdate: (patch: Partial<ReviewState>, auditLine?: string) => void;
}) {
  const details = getSubmissionDetails(item.contentId);
  const [showApprove, setShowApprove] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showHold, setShowHold] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const allChecked = state.checks.every(Boolean);
  const started = state.status !== "New";

  function toggle(i: number) {
    const next = [...state.checks];
    next[i] = !next[i];
    onUpdate({ checks: next, status: started ? state.status : "Under Review" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-1">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to queue
          </Button>
          <h1 className="text-xl font-bold">{item.title}</h1>
          <div className="text-xs text-muted-foreground font-mono">
            {item.contentId} · {item.currentVersion} · Editor {item.editor}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={state.status === "On Hold" ? "secondary" : "outline"}>{state.status}</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowCompare(true)}>
            <History className="h-4 w-4 mr-1" /> Compare Versions
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div
              className={`aspect-video bg-gradient-to-br ${item.thumbTone} flex flex-col items-center justify-center border-b gap-2`}
            >
              <Film className="h-10 w-10 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Video preview placeholder — streaming not enabled yet
              </span>
            </div>
            <CardContent className="p-4 grid gap-3 sm:grid-cols-2 text-sm">
              <Field label="Target platform" value={item.platform} />
              <Field label="Content type" value={item.type} />
              <Field
                label="Required duration / format"
                value={item.type === "Long Video" ? "3–5 min · 16:9 · 1080p" : "20–35 s · 9:16 · 1080p"}
              />
              <Field label="Brand" value={item.brand} />
              <Field label="Submitted" value={item.submittedAt ?? "—"} />
              <Field label="Publishing deadline" value={item.dueAt} />
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground">Original content brief</div>
                <p className="mt-1">
                  Highlight the {item.brand} story for {item.platform}. Keep the hook in the first 2
                  seconds, add subtitles throughout, close with the enquiry call-to-action and keep
                  the logo bug in the top-right.
                </p>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground">Video Editor's notes</div>
                <p className="mt-1">{details.editorNotes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Review Checklist ({state.checks.filter(Boolean).length}/{REVIEW_CHECKLIST_FULL.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {REVIEW_CHECKLIST_FULL.map((label, i) => (
                <label
                  key={label}
                  className="flex items-start gap-2 rounded-md border p-2 text-sm cursor-pointer"
                >
                  <Checkbox checked={state.checks[i]} onCheckedChange={() => toggle(i)} />
                  <span>{label}</span>
                </label>
              ))}
              {!allChecked && (
                <p className="sm:col-span-2 text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> All mandatory checks must be completed
                  before approval.
                </p>
              )}
            </CardContent>
          </Card>

          <CorrectionBuilder
            points={state.points}
            onChange={(points) => onUpdate({ points })}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Review Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                disabled={!allChecked || state.status === "Approved"}
                onClick={() => setShowApprove(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={state.status === "Approved"}
                onClick={() => setShowCorrect(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1" /> Request Corrections
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={state.status === "Approved"}
                onClick={() => setShowHold(true)}
              >
                <Pause className="h-4 w-4 mr-1" /> Hold for Discussion
              </Button>
              {state.status === "Approved" && (
                <div className="text-xs text-emerald-600 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> Version {state.approvedVersion} locked.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Previous Versions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {item.versions.map((v) => (
                <div key={v.version} className="rounded-md border p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{v.version}</span>
                    <Badge variant="outline">{v.outcome}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {v.submittedAt} · {v.editor}
                  </div>
                  {v.note && <div className="text-xs mt-1">{v.note}</div>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Previous Correction Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {details.priorPoints.length === 0 && (
                <p className="text-muted-foreground text-xs">No earlier correction points.</p>
              )}
              {details.priorPoints.map((p) => (
                <div key={p.id} className="rounded-md border p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs">{p.timestamp}</span>
                    <Badge variant={p.done ? "secondary" : "destructive"}>
                      {p.done ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                  <div>{p.instruction}</div>
                  {p.editorResponse && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Editor: {p.editorResponse}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> Audit History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              {state.audit.map((a, i) => (
                <div key={i}>• {a}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ApproveDialog
        open={showApprove}
        onOpenChange={setShowApprove}
        item={item}
        onConfirm={(note, date) => {
          onUpdate(
            { status: "Approved", decision: "Approved", approvedVersion: item.currentVersion },
            `Today — Manager approved ${item.currentVersion} (checklist 15/15). Publish suggested ${date}. Note: ${note || "—"}`,
          );
          setShowApprove(false);
          toast.success(
            `${item.currentVersion} approved and locked. Sent to Publishing Calendar.`,
          );
        }}
      />

      <CorrectionsDialog
        open={showCorrect}
        onOpenChange={setShowCorrect}
        points={state.points}
        onConfirm={(deadline, note, priority) => {
          onUpdate(
            { status: "Correction Required", decision: "Correction Required" },
            `Today — Corrections requested on ${item.currentVersion}: ${state.points.length} point(s), ${priority} priority, due ${deadline}. Note: ${note}`,
          );
          setShowCorrect(false);
          toast.success(
            `Status set to Correction Required. ${state.points.length} point(s) sent to ${item.editor}'s Corrections page.`,
          );
        }}
      />

      <HoldDialog
        open={showHold}
        onOpenChange={setShowHold}
        onConfirm={(reason, owner, next, due) => {
          onUpdate(
            { status: "On Hold", decision: "On Hold" },
            `Today — Held for discussion: ${reason}. Owner ${owner}. Next: ${next} by ${due}`,
          );
          setShowHold(false);
          toast.success("Submission held for discussion.");
        }}
      />

      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version Comparison — {item.contentId}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {[item.versions[item.versions.length - 2], item.versions[item.versions.length - 1]].map(
              (v, i) =>
                v ? (
                  <div key={v.version} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {i === 0 ? "Previous" : "Current"} — {v.version}
                      </span>
                      <Badge variant="outline">{v.outcome}</Badge>
                    </div>
                    <div className={`aspect-video rounded bg-gradient-to-br ${item.thumbTone}`} />
                    <div className="text-xs text-muted-foreground">
                      {v.submittedAt} · {v.editor}
                    </div>
                    {v.note && <div className="text-xs">{v.note}</div>}
                  </div>
                ) : (
                  <div
                    key={i}
                    className="rounded-lg border p-3 text-sm text-muted-foreground flex items-center justify-center"
                  >
                    No previous version — this is the first submission.
                  </div>
                ),
            )}
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Correction points from previous review</div>
            {details.priorPoints.length === 0 && (
              <p className="text-xs text-muted-foreground">None recorded.</p>
            )}
            {details.priorPoints.map((p) => (
              <div key={p.id} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span>
                    <span className="font-mono text-xs">{p.timestamp}</span> · {p.category}
                  </span>
                  <Badge variant={p.done ? "secondary" : "destructive"}>
                    {p.done ? "Completed" : "Incomplete"}
                  </Badge>
                </div>
                <div>{p.instruction}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Editor response: {p.editorResponse ?? "No response yet"}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

/* ------------------------- correction builder ------------------------- */

function CorrectionBuilder({
  points,
  onChange,
}: {
  points: CorrectionPoint[];
  onChange: (p: CorrectionPoint[]) => void;
}) {
  const [timestamp, setTimestamp] = useState("");
  const [category, setCategory] = useState<CorrectionCategory>("Cut or Timing");
  const [instruction, setInstruction] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");
  const [reference, setReference] = useState("");
  const [dueBy, setDueBy] = useState("");

  function add() {
    if (!timestamp.trim() || !instruction.trim() || !dueBy.trim()) {
      toast.error("Timestamp, instruction and required completion date are mandatory.");
      return;
    }
    onChange([
      ...points,
      {
        id: `N${Date.now()}`,
        timestamp,
        category,
        instruction,
        priority,
        reference: reference || undefined,
        dueBy,
      },
    ]);
    setTimestamp("");
    setInstruction("");
    setReference("");
    toast.success("Correction point added.");
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Correction Comments ({points.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {points.map((p) => (
          <div key={p.id} className="rounded-md border p-2 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs">{p.timestamp}</span> ·{" "}
                <span className="text-xs text-muted-foreground">{p.category}</span>
                <div>{p.instruction}</div>
                <div className="text-xs text-muted-foreground">
                  {p.priority} priority · due {p.dueBy}
                  {p.reference ? ` · ref: ${p.reference}` : ""}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange(points.filter((x) => x.id !== p.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="grid gap-2 sm:grid-cols-2 border-t pt-3">
          <div>
            <Label className="text-xs">Timestamp</Label>
            <Input
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="00:07 or Slide 3"
            />
          </div>
          <div>
            <Label className="text-xs">Correction category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CorrectionCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CORRECTION_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Clear instruction</Label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Describe exactly what the editor must change."
            />
          </div>
          <div>
            <Label className="text-xs">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Required completion date</Label>
            <Input value={dueBy} onChange={(e) => setDueBy(e.target.value)} placeholder="Today, 18:00" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Reference image or file (optional)</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="reference-frame.png"
            />
          </div>
          <Button onClick={add} className="sm:col-span-2">
            <Plus className="h-4 w-4 mr-1" /> Add Correction Point
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------- dialogs ------------------------- */

function ApproveDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: SharedContent;
  onConfirm: (note: string, date: string) => void;
}) {
  const [confirmVersion, setConfirmVersion] = useState(false);
  const [confirmThumb, setConfirmThumb] = useState(false);
  const [caption, setCaption] = useState("Ready");
  const [date, setDate] = useState(item.dueAt);
  const [note, setNote] = useState("");
  const ready = confirmVersion && confirmThumb && date.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approve {item.currentVersion} — {item.contentId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2 rounded-md border p-2">
            <Checkbox checked={confirmVersion} onCheckedChange={(v) => setConfirmVersion(!!v)} />
            Approved video version is {item.currentVersion}
          </label>
          <label className="flex items-center gap-2 rounded-md border p-2">
            <Checkbox checked={confirmThumb} onCheckedChange={(v) => setConfirmThumb(!!v)} />
            Approved thumbnail confirmed
          </label>
          <div>
            <Label className="text-xs">Caption status</Label>
            <Select value={caption} onValueChange={setCaption}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Needs minor edit">Needs minor edit</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Target platform" value={item.platform} />
          <div>
            <Label className="text-xs">Suggested publishing date</Label>
            <Input value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Manager approval note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            Approval locks this version. Later changes require a new version.
          </p>
        </div>
        <DialogFooter>
          <Button disabled={!ready} onClick={() => onConfirm(note, date)}>
            Confirm Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CorrectionsDialog({
  open,
  onOpenChange,
  points,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  points: CorrectionPoint[];
  onConfirm: (deadline: string, note: string, priority: string) => void;
}) {
  const [deadline, setDeadline] = useState("Tomorrow, 12:00");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("High");
  const ready = points.length > 0 && deadline.trim() && note.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Corrections</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {points.length === 0 && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Add at least one correction point first.
            </p>
          )}
          <div className="text-xs text-muted-foreground">
            {points.length} correction point(s) will be sent to the Video Editor's Corrections page.
          </div>
          <div>
            <Label className="text-xs">Correction deadline</Label>
            <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Overall reviewer note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!ready} onClick={() => onConfirm(deadline, note, priority)}>
            Send Corrections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HoldDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string, owner: string, next: string, due: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [owner, setOwner] = useState("Sales Head");
  const [next, setNext] = useState("");
  const [due, setDue] = useState("Tomorrow, 11:00");
  const ready = reason.trim() && next.trim() && due.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hold for Discussion</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <Label className="text-xs">Hold reason</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Person responsible for clarification</Label>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales Head">Sales Head</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="Brand Team">Brand Team</SelectItem>
                <SelectItem value="Video Editor">Video Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Next action</Label>
            <Input value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Due date and time</Label>
            <Input value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!ready} onClick={() => onConfirm(reason, owner, next, due)}>
            Place on Hold
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
