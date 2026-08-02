import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  Award,
  BookOpen,
  Check,
  ClipboardList,
  History,
  Lock,
  MessageSquare,
  Search,
  Shield,
  Target,
  X,
} from "lucide-react";
import {
  FEEDBACKS,
  FEEDBACK_KINDS,
  FEEDBACK_TONE,
  GOALS,
  GOAL_STATUSES,
  GOAL_TONE,
  PERF_AREAS,
  PIPS,
  PIP_TONE,
  PRIVACY_NOTE,
  RATINGS,
  RATING_TONE,
  REVIEWS,
  REVIEW_STAGES,
  STAGE_TONE,
  TRAININGS,
  TRAINING_STATUSES,
  TRAINING_TONE,
  isNegative,
  type AuditEntry,
  type Feedback,
  type FeedbackKind,
  type Goal,
  type GoalStatus,
  type Pip,
  type Rating,
  type Review,
  type ReviewStage,
  type Training,
  type TrainingStatus,
} from "./perf-training-data";

const TONE: Record<string, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

const HR_USER = "Anjali Kapoor (HR Head)";
const NOW = "02 Aug 2026 18:40";
const log = (text: string): AuditEntry => ({ at: NOW, by: HR_USER, text });

const TABS = ["Performance Reviews", "Goals", "Improvement Plans", "Training", "Feedback History"] as const;
type Tab = (typeof TABS)[number];

function Avatar({ initials, tone = "muted" }: { initials: string; tone?: string }) {
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${TONE[tone]}`}>
      {initials}
    </div>
  );
}

function Kpi({ label, value, hint, tone = "muted" }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return (
    <div className={`rounded-lg border p-3 ${TONE[tone]}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] opacity-75">{hint}</div>}
    </div>
  );
}

export function HrPerformanceTraining() {
  const [tab, setTab] = useState<Tab>("Performance Reviews");
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [goals, setGoals] = useState<Goal[]>(GOALS);
  const [pips, setPips] = useState<Pip[]>(PIPS);
  const [trainings, setTrainings] = useState<Training[]>(TRAININGS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(FEEDBACKS);

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");

  const [openReview, setOpenReview] = useState<Review | null>(null);
  const [openPip, setOpenPip] = useState<Pip | null>(null);
  const [openTraining, setOpenTraining] = useState<Training | null>(null);
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);

  const [startReview, setStartReview] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", empId: "", dept: "Sales", designation: "", manager: "", period: "Jul 2026 – Dec 2026", due: "" });

  const [newTraining, setNewTraining] = useState(false);
  const [tForm, setTForm] = useState({ title: "", description: "", audience: "Employee", target: "", due: "", material: "", mandatory: "No" });

  const [feedbackFor, setFeedbackFor] = useState<{ empId: string; name: string; photo: string; dept: string } | null>(null);
  const [fForm, setFForm] = useState<{ kind: FeedbackKind; note: string; ack: boolean; share: boolean; discussion: string }>({
    kind: "Positive feedback",
    note: "",
    ack: true,
    share: true,
    discussion: "",
  });

  const [correctFor, setCorrectFor] = useState<Review | null>(null);
  const [correctReason, setCorrectReason] = useState("");

  const depts = useMemo(() => ["All", ...Array.from(new Set(reviews.map((r) => r.dept)))], [reviews]);
  const match = (name: string, id: string, d: string) =>
    (dept === "All" || d === dept) && (!q || `${name} ${id}`.toLowerCase().includes(q.toLowerCase()));

  const reviewsDue = reviews.filter((r) => r.stage !== "Completed").length;
  const reviewsCompleted = reviews.filter((r) => r.stage === "Completed").length;
  const pipsActive = pips.filter((p) => ["Active", "Review Due", "Extended"].includes(p.status)).length;
  const trainingAssigned = trainings.filter((t) => t.status !== "Completed").length;
  const trainingOverdue = trainings.filter((t) => t.status === "Overdue").length;

  const alerts = useMemo(() => {
    const list: { text: string; tone: string }[] = [];
    reviews.filter((r) => r.overdue && r.stage !== "Completed").forEach((r) => list.push({ text: `Review overdue — ${r.name} (${r.id}), due ${r.dueDate}`, tone: "urgent" }));
    reviews.filter((r) => r.stage === "Manager Review").forEach((r) => list.push({ text: `Manager feedback pending — ${r.name} (${r.manager})`, tone: "pending" }));
    reviews
      .filter((r) => r.stage === "Feedback Shared" && r.acknowledgement === "Pending")
      .forEach((r) => list.push({ text: `Employee acknowledgement pending — ${r.name}`, tone: "pending" }));
    reviews.forEach((r) => {
      const missing = r.areas.filter((a) => a.rating && isNegative(a.rating as Rating) && !a.evidence.trim());
      if (missing.length) list.push({ text: `${r.name} — ${missing.length} negative rating(s) without written evidence`, tone: "urgent" });
    });
    pips.filter((p) => p.reviewDueNow).forEach((p) => list.push({ text: `Improvement-plan review due — ${p.name} (${p.id})`, tone: "pending" }));
    pips.filter((p) => p.repeatConcern).forEach((p) => list.push({ text: `Repeated performance concerns recorded — ${p.name}`, tone: "pending" }));
    trainings.filter((t) => t.status === "Overdue").forEach((t) => list.push({ text: `Training overdue — ${t.name}: ${t.title}`, tone: "urgent" }));
    trainings
      .filter((t) => t.mandatory && !["Completed"].includes(t.status))
      .forEach((t) => list.push({ text: `Mandatory training incomplete — ${t.name}: ${t.title}`, tone: "pending" }));
    goals.filter((g) => g.overdue && g.status !== "Completed").forEach((g) => list.push({ text: `Goal overdue — ${g.name}: ${g.title}`, tone: "urgent" }));
    return list;
  }, [reviews, pips, trainings, goals]);

  /* --------- review actions --------- */
  function advance(r: Review) {
    if (r.locked) return toast.error("Completed review is locked. Create a correction version instead.");
    const idx = REVIEW_STAGES.indexOf(r.stage);
    const next = REVIEW_STAGES[Math.min(idx + 1, REVIEW_STAGES.length - 1)] as ReviewStage;
    const missing = r.areas.filter((a) => a.rating && isNegative(a.rating as Rating) && !a.evidence.trim());
    if (missing.length && ["HR Review", "Feedback Shared"].includes(next)) {
      return toast.error("Written evidence is required for every negative rating before sharing feedback.");
    }
    setReviews((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? {
              ...x,
              stage: next,
              locked: next === "Completed",
              acknowledgement: next === "Employee Acknowledged" ? "Acknowledged" : x.acknowledgement,
              history: [...x.history, log(`Moved to ${next}`)],
            }
          : x,
      ),
    );
    setOpenReview((o) => (o && o.id === r.id ? { ...o, stage: next, locked: next === "Completed" } : o));
    toast.success(`Review moved to ${next}`);
  }

  function setAck(r: Review, ack: "Acknowledged" | "Refused") {
    setReviews((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? {
              ...x,
              acknowledgement: ack,
              stage: ack === "Acknowledged" ? "Employee Acknowledged" : x.stage,
              history: [
                ...x.history,
                log(ack === "Acknowledged" ? "Employee acknowledged the review" : "Employee declined to acknowledge — recorded, process continues"),
              ],
            }
          : x,
      ),
    );
    setOpenReview(null);
    toast.success(ack === "Acknowledged" ? "Acknowledgement recorded" : "Refusal recorded — process not blocked");
  }

  function rate(r: Review, area: string, rating: Rating) {
    if (r.locked) return toast.error("This review is locked.");
    const upd = (x: Review) => ({
      ...x,
      areas: x.areas.map((a) => (a.area === area ? { ...a, rating } : a)),
      history: [...x.history, log(`Rating set — ${area}: ${rating}`)],
    });
    setReviews((prev) => prev.map((x) => (x.id === r.id ? upd(x) : x)));
    setOpenReview((o) => (o && o.id === r.id ? upd(o) : o));
  }

  function evidence(r: Review, area: string, text: string) {
    const upd = (x: Review) => ({ ...x, areas: x.areas.map((a) => (a.area === area ? { ...a, evidence: text } : a)) });
    setReviews((prev) => prev.map((x) => (x.id === r.id ? upd(x) : x)));
    setOpenReview((o) => (o && o.id === r.id ? upd(o) : o));
  }

  function makeCorrection() {
    if (!correctFor) return;
    if (correctReason.trim().length < 4) return toast.error("A reason is required for the correction.");
    const base = correctFor;
    const copy: Review = {
      ...base,
      id: `${base.id}-v${base.version + 1}`,
      version: base.version + 1,
      locked: false,
      stage: "HR Review",
      history: [...base.history, log(`Correction version ${base.version + 1} created — ${correctReason}. Original version preserved.`)],
    };
    setReviews((prev) => [copy, ...prev.map((x) => (x.id === base.id ? { ...x, locked: true } : x))]);
    setCorrectFor(null);
    setCorrectReason("");
    toast.success("New version created — original review preserved");
  }

  /* --------- feedback --------- */
  function saveFeedback() {
    if (!feedbackFor) return;
    if (fForm.note.trim().length < 4) return toast.error("Please write the feedback note.");
    const fb: Feedback = {
      id: `FB-${1300 + feedbacks.length}`,
      empId: feedbackFor.empId,
      name: feedbackFor.name,
      photo: feedbackFor.photo,
      dept: feedbackFor.dept,
      kind: fForm.kind,
      note: fForm.note,
      by: HR_USER,
      at: NOW,
      sharedToDashboard: fForm.share,
      acknowledgement: fForm.ack ? "Pending" : "Not Requested",
      discussionOn: fForm.discussion || undefined,
    };
    setFeedbacks((p) => [fb, ...p]);
    setFeedbackFor(null);
    setFForm({ kind: "Positive feedback", note: "", ack: true, share: true, discussion: "" });
    toast.success(fForm.share ? "Feedback saved and sent to the employee dashboard (private)" : "Private feedback saved");
  }

  /* --------- training --------- */
  function createTraining() {
    if (!tForm.title.trim() || !tForm.target.trim()) return toast.error("Training title and assignee are required.");
    const t: Training = {
      id: `TR-${910 + trainings.length}`,
      title: tForm.title,
      description: tForm.description,
      audience: `${tForm.audience} — ${tForm.target}`,
      mandatory: tForm.mandatory === "Yes",
      material: tForm.material || "No material attached",
      empId: "CC-NEW-2026-0000",
      name: tForm.target,
      photo: tForm.target.slice(0, 2).toUpperCase(),
      dept: "—",
      assignedBy: HR_USER,
      assignedOn: "02 Aug 2026",
      due: tForm.due || "—",
      progress: 0,
      status: "Assigned",
      assessment: "Not attempted",
      history: [log("Training created and assigned")],
    };
    setTrainings((p) => [t, ...p]);
    setNewTraining(false);
    setTForm({ title: "", description: "", audience: "Employee", target: "", due: "", material: "", mandatory: "No" });
    toast.success("Training created and assigned");
  }

  function updateTraining(t: Training, patch: Partial<Training>, note: string) {
    const upd = (x: Training) => ({ ...x, ...patch, history: [...x.history, log(note)] });
    setTrainings((p) => p.map((x) => (x.id === t.id ? upd(x) : x)));
    setOpenTraining((o) => (o && o.id === t.id ? upd(o) : o));
    if (patch.status === "Completed") toast.success("Training completed — employee profile updated");
    else toast.success(note);
  }

  /* --------- goals --------- */
  function updateGoal(g: Goal, patch: Partial<Goal>, note: string) {
    const upd = (x: Goal) => ({ ...x, ...patch, history: [...x.history, log(note)] });
    setGoals((p) => p.map((x) => (x.id === g.id ? upd(x) : x)));
    setOpenGoal((o) => (o && o.id === g.id ? upd(o) : o));
    toast.success(note);
  }

  /* --------- pips --------- */
  function updatePip(p: Pip, patch: Partial<Pip>, note: string) {
    const upd = (x: Pip) => ({ ...x, ...patch, history: [...x.history, log(note)] });
    setPips((prev) => prev.map((x) => (x.id === p.id ? upd(x) : x)));
    setOpenPip((o) => (o && o.id === p.id ? upd(o) : o));
    toast.success(note);
  }

  function createReview() {
    if (!newReview.name.trim() || !newReview.empId.trim()) return toast.error("Employee name and ID are required.");
    const r: Review = {
      id: `PR-${7010 + reviews.length}`,
      empId: newReview.empId,
      name: newReview.name,
      photo: newReview.name.slice(0, 2).toUpperCase(),
      dept: newReview.dept,
      designation: newReview.designation || "—",
      manager: newReview.manager || HR_USER,
      period: newReview.period,
      stage: "Review Created",
      dueDate: newReview.due || "—",
      overdue: false,
      overall: "Pending",
      locked: false,
      version: 1,
      acknowledgement: "Pending",
      managerComments: "",
      hrComments: "",
      areas: PERF_AREAS.map((a) => ({ area: a, rating: "" as const, evidence: "" })),
      history: [log("Review created")],
    };
    setReviews((p) => [r, ...p]);
    setStartReview(false);
    setNewReview({ name: "", empId: "", dept: "Sales", designation: "", manager: "", period: "Jul 2026 – Dec 2026", due: "" });
    toast.success("Review created");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Performance &amp; Training</h2>
          <p className="text-sm text-muted-foreground">Goals, reviews, feedback, improvement plans and training in one confidential workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={TONE.active}>
            <Shield className="mr-1 h-3 w-3" /> Confidential — HR &amp; authorised managers
          </Badge>
          <Button onClick={() => setStartReview(true)}>
            <ClipboardList className="mr-1 h-4 w-4" /> Start Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Reviews Due" value={reviewsDue} tone="pending" hint="In progress cycles" />
        <Kpi label="Reviews Completed" value={reviewsCompleted} tone="done" hint="Locked records" />
        <Kpi label="Improvement Plans Active" value={pipsActive} tone="active" hint="Under monitoring" />
        <Kpi label="Training Assigned" value={trainingAssigned} tone="active" hint="Not yet completed" />
        <Kpi label="Training Overdue" value={trainingOverdue} tone={trainingOverdue ? "urgent" : "muted"} hint="Past due date" />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Attention alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {alerts.map((a, i) => (
              <div key={i} className={`rounded-md border px-3 py-2 text-sm ${TONE[a.tone]}`}>{a.text}</div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="grid gap-2 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search employee name or ID" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>{depts.map((d) => <SelectItem key={d} value={d}>{d === "All" ? "All departments" : d}</SelectItem>)}</SelectContent>
          </Select>
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
            <Lock className="mr-1 inline h-3 w-3" /> Not shown in team dashboards. No public ranking.
          </div>
        </CardContent>
      </Card>

      {/* ---------- Reviews ---------- */}
      {tab === "Performance Reviews" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {reviews.filter((r) => match(r.name, r.empId, r.dept)).map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={r.photo} tone={STAGE_TONE[r.stage]} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{r.name}</span>
                      <Badge variant="outline" className={TONE[STAGE_TONE[r.stage]]}>{r.stage}</Badge>
                      {r.locked && <Badge variant="outline" className={TONE.muted}><Lock className="mr-1 h-3 w-3" /> Locked</Badge>}
                      {r.version > 1 && <Badge variant="outline" className={TONE.muted}>v{r.version}</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.empId} · {r.designation} · {r.dept}
                      <div>Manager: {r.manager}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <div><div className="text-muted-foreground">Review period</div><div className="font-medium">{r.period}</div></div>
                  <div>
                    <div className="text-muted-foreground">Due date</div>
                    <div className={`font-medium ${r.overdue && r.stage !== "Completed" ? "text-destructive" : ""}`}>{r.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Overall rating</div>
                    <div className="font-medium">
                      {r.overall === "Pending" ? (
                        <Badge variant="outline" className={TONE.muted}>Pending</Badge>
                      ) : (
                        <Badge variant="outline" className={TONE[RATING_TONE[r.overall as Rating]]}>{r.overall}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenReview(r)}>View Review</Button>
                  <Button size="sm" variant="outline" onClick={() => setFeedbackFor({ empId: r.empId, name: r.name, photo: r.photo, dept: r.dept })}>
                    <MessageSquare className="mr-1 h-3 w-3" /> Feedback
                  </Button>
                  {!r.locked ? (
                    <Button size="sm" onClick={() => advance(r)}>Move to next stage</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setCorrectFor(r); setCorrectReason(""); }}>Create correction version</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- Goals ---------- */}
      {tab === "Goals" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {goals.filter((g) => match(g.name, g.empId, g.dept)).map((g) => (
            <Card key={g.id}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={g.photo} tone={GOAL_TONE[g.status]} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{g.title}</span>
                      <Badge variant="outline" className={TONE[GOAL_TONE[g.status]]}>{g.status}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{g.name} · {g.empId} · {g.dept}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{g.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div><div className="text-muted-foreground">Assigned by</div><div className="font-medium">{g.assignedBy}</div></div>
                  <div><div className="text-muted-foreground">Start</div><div className="font-medium">{g.start}</div></div>
                  <div><div className="text-muted-foreground">Due</div><div className={`font-medium ${g.overdue && g.status !== "Completed" ? "text-destructive" : ""}`}>{g.due}</div></div>
                  <div><div className="text-muted-foreground">Progress</div><div className="font-medium tabular-nums">{g.progress}%</div></div>
                </div>
                <Progress value={g.progress} className="h-1.5" />
                <div className="rounded-md border bg-muted/30 p-2 text-xs">
                  <div className="text-muted-foreground">Success measurement</div>
                  <div className="font-medium">{g.measure}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={g.status} onValueChange={(v) => updateGoal(g, { status: v as GoalStatus }, `Goal status changed to ${v}`)}>
                    <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{GOAL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => setOpenGoal(g)}>View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- PIPs ---------- */}
      {tab === "Improvement Plans" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {pips.filter((p) => match(p.name, p.empId, p.dept)).map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={p.photo} tone={PIP_TONE[p.status]} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <Badge variant="outline" className={TONE[PIP_TONE[p.status]]}>{p.status}</Badge>
                      <Badge variant="outline" className={TONE.muted}>{p.id}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{p.empId} · {p.designation} · Manager: {p.manager}</div>
                  </div>
                </div>
                <div className="rounded-md border bg-muted/30 p-2 text-xs">
                  <div className="text-muted-foreground">Reason</div>
                  <div className="font-medium">{p.reason}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <div><div className="text-muted-foreground">Start</div><div className="font-medium">{p.start}</div></div>
                  <div><div className="text-muted-foreground">Review dates</div><div className="font-medium">{p.reviewDates.join(", ")}</div></div>
                  <div><div className="text-muted-foreground">Final review</div><div className="font-medium">{p.finalReview}</div></div>
                </div>
                <div className={`rounded-md border p-2 text-xs ${p.acknowledgement === "Acknowledged" ? TONE.done : p.acknowledgement === "Refused" ? TONE.pending : TONE.muted}`}>
                  Employee acknowledgement: {p.acknowledgement}
                  {p.acknowledgement === "Refused" && " — recorded, process continues"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenPip(p)}>View Plan</Button>
                  {p.status !== "Closed" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updatePip(p, { status: "Extended", reviewDueNow: false }, "Improvement plan extended")}>Extend</Button>
                      <Button size="sm" onClick={() => updatePip(p, { status: "Improved", outcome: "Improvement confirmed at final review.", reviewDueNow: false }, "Marked improved")}>
                        <Check className="mr-1 h-3 w-3" /> Mark improved
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- Training ---------- */}
      {tab === "Training" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => setNewTraining(true)}><BookOpen className="mr-1 h-4 w-4" /> Create Training</Button>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {trainings.filter((t) => match(t.name, t.empId, t.dept)).map((t) => (
              <Card key={t.id}>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar initials={t.photo} tone={TRAINING_TONE[t.status]} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{t.title}</span>
                        <Badge variant="outline" className={TONE[TRAINING_TONE[t.status]]}>{t.status}</Badge>
                        {t.mandatory && <Badge variant="outline" className={TONE.pending}>Mandatory</Badge>}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{t.name} · {t.empId} · {t.audience}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div><div className="text-muted-foreground">Assigned</div><div className="font-medium">{t.assignedOn}</div></div>
                    <div><div className="text-muted-foreground">Due</div><div className={`font-medium ${t.status === "Overdue" ? "text-destructive" : ""}`}>{t.due}</div></div>
                    <div><div className="text-muted-foreground">Material</div><div className="font-medium">{t.material}</div></div>
                    <div><div className="text-muted-foreground">Assessment</div><div className="font-medium">{t.assessment}</div></div>
                  </div>
                  <Progress value={t.progress} className="h-1.5" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={t.status} onValueChange={(v) => updateTraining(t, { status: v as TrainingStatus, progress: v === "Completed" ? 100 : t.progress }, `Training status changed to ${v}`)}>
                      <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{TRAINING_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => setOpenTraining(t)}>View Details</Button>
                    {t.status === "Failed" && (
                      <Button size="sm" variant="outline" onClick={() => updateTraining(t, { status: "Reassigned", progress: 0, assessment: "Not attempted" }, "Training reassigned after failed assessment")}>
                        Reassign
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Feedback history ---------- */}
      {tab === "Feedback History" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4" /> Feedback history</CardTitle>
            <p className="text-xs text-muted-foreground">{PRIVACY_NOTE}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {feedbacks.filter((f) => match(f.name, f.empId, f.dept)).map((f) => (
              <div key={f.id} className="flex flex-wrap items-start gap-3 rounded-lg border p-3">
                <Avatar initials={f.photo} tone={FEEDBACK_TONE[f.kind]} />
                <div className="min-w-[220px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{f.name}</span>
                    <Badge variant="outline" className={TONE[FEEDBACK_TONE[f.kind]]}>{f.kind}</Badge>
                    <Badge variant="outline" className={TONE.muted}>{f.id}</Badge>
                  </div>
                  <p className="mt-1 text-xs">{f.note}</p>
                  {f.discussionOn && <p className="mt-1 text-[11px] text-muted-foreground">Review discussion: {f.discussionOn}</p>}
                  <div className="mt-1 text-[11px] text-muted-foreground">{f.at} · {f.by}</div>
                </div>
                <div className="space-y-1 text-right text-[11px]">
                  <Badge variant="outline" className={f.acknowledgement === "Acknowledged" ? TONE.done : f.acknowledgement === "Refused" ? TONE.pending : f.acknowledgement === "Pending" ? TONE.pending : TONE.muted}>
                    {f.acknowledgement === "Not Requested" ? "No acknowledgement requested" : f.acknowledgement}
                  </Badge>
                  <div className="text-muted-foreground">{f.sharedToDashboard ? "Shared privately to employee dashboard" : "HR-only note"}</div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setFeedbackFor({ empId: "", name: "Select from review card", photo: "NA", dept: "—" })} disabled>
                Add feedback from a review or goal card
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- Review sheet ---------- */}
      <Sheet open={!!openReview} onOpenChange={(o) => !o && setOpenReview(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {openReview && (
            <>
              <SheetHeader><SheetTitle>{openReview.id} — {openReview.name}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className={TONE[STAGE_TONE[openReview.stage]]}>{openReview.stage}</Badge>
                  <span>{openReview.period}</span>
                  <span>· Due {openReview.dueDate}</span>
                  {openReview.locked && <Badge variant="outline" className={TONE.muted}><Lock className="mr-1 h-3 w-3" /> Locked</Badge>}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Performance areas</div>
                  {openReview.areas.map((a) => (
                    <div key={a.area} className="rounded-md border p-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium">{a.area}</span>
                        <Select value={a.rating || undefined} onValueChange={(v) => rate(openReview, a.area, v as Rating)} disabled={openReview.locked}>
                          <SelectTrigger className="h-7 w-[190px] text-[11px]"><SelectValue placeholder="Not rated" /></SelectTrigger>
                          <SelectContent>{RATINGS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {a.rating && isNegative(a.rating as Rating) && (
                        <div className="mt-2">
                          <Label className="text-[11px]">Written evidence (required)</Label>
                          <Textarea
                            rows={2}
                            className="mt-1 text-xs"
                            value={a.evidence}
                            disabled={openReview.locked}
                            placeholder="Describe the specific facts supporting this rating"
                            onChange={(e) => evidence(openReview, a.area, e.target.value)}
                          />
                          {!a.evidence.trim() && <p className="mt-1 text-[11px] text-destructive">Evidence missing — feedback cannot be shared.</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 text-xs">
                  <div className="rounded-md border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Manager comments</div>
                    <div className="font-medium">{openReview.managerComments || "—"}</div>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-2">
                    <div className="text-muted-foreground">HR comments</div>
                    <div className="font-medium">{openReview.hrComments || "—"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setAck(openReview, "Acknowledged")} disabled={openReview.acknowledgement === "Acknowledged"}>
                    <Check className="mr-1 h-3 w-3" /> Record acknowledgement
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAck(openReview, "Refused")}>
                    <X className="mr-1 h-3 w-3" /> Record refusal
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setFeedbackFor({ empId: openReview.empId, name: openReview.name, photo: openReview.photo, dept: openReview.dept })}>
                    Add feedback
                  </Button>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs font-medium"><History className="h-3 w-3" /> Review history</div>
                  {openReview.history.map((h, i) => (
                    <div key={i} className="mb-1 rounded-md border p-2 text-[11px]">
                      <div className="font-medium">{h.text}</div>
                      <div className="text-muted-foreground">{h.at} · {h.by}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">{PRIVACY_NOTE}</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ---------- Goal sheet ---------- */}
      <Sheet open={!!openGoal} onOpenChange={(o) => !o && setOpenGoal(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {openGoal && (
            <>
              <SheetHeader><SheetTitle>{openGoal.title}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3 text-xs">
                <p className="text-muted-foreground">{openGoal.description}</p>
                <div className="space-y-1">
                  <Label className="text-[11px]">Progress: {openGoal.progress}%</Label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={openGoal.progress}
                    className="w-full"
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGoals((p) => p.map((x) => (x.id === openGoal.id ? { ...x, progress: v } : x)));
                      setOpenGoal({ ...openGoal, progress: v });
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={() => updateGoal(openGoal, { progress: openGoal.progress }, `Progress updated to ${openGoal.progress}%`)}>
                    Save progress
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Manager comments</Label>
                  <Textarea rows={3} value={openGoal.managerComments} onChange={(e) => setOpenGoal({ ...openGoal, managerComments: e.target.value })} />
                  <Button size="sm" variant="outline" onClick={() => updateGoal(openGoal, { managerComments: openGoal.managerComments }, "Manager comment saved")}>
                    Save comment
                  </Button>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 font-medium"><History className="h-3 w-3" /> Goal history</div>
                  {openGoal.history.map((h, i) => (
                    <div key={i} className="mb-1 rounded-md border p-2 text-[11px]">
                      <div className="font-medium">{h.text}</div>
                      <div className="text-muted-foreground">{h.at} · {h.by}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ---------- PIP sheet ---------- */}
      <Sheet open={!!openPip} onOpenChange={(o) => !o && setOpenPip(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {openPip && (
            <>
              <SheetHeader><SheetTitle>{openPip.id} — {openPip.name}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3 text-xs">
                {[
                  ["Performance concerns", openPip.concerns],
                  ["Supporting evidence", openPip.evidence],
                  ["Required improvements", openPip.improvements],
                  ["Measurable targets", openPip.targets],
                  ["Training required", openPip.trainingRequired],
                ].map(([label, items]) => (
                  <div key={String(label)} className="rounded-md border bg-muted/30 p-2">
                    <div className="text-muted-foreground">{label}</div>
                    <ul className="mt-1 list-disc pl-4">
                      {(items as string[]).map((i) => <li key={i} className="font-medium">{i}</li>)}
                    </ul>
                  </div>
                ))}
                <div className="rounded-md border bg-muted/30 p-2">
                  <div className="text-muted-foreground">Responsible manager</div>
                  <div className="font-medium">{openPip.manager}</div>
                </div>
                <div className="rounded-md border bg-muted/30 p-2">
                  <div className="text-muted-foreground">Final outcome</div>
                  <div className="font-medium">{openPip.outcome || "Pending final review"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => updatePip(openPip, { acknowledgement: "Acknowledged" }, "Employee acknowledgement recorded")}>Record acknowledgement</Button>
                  <Button size="sm" variant="outline" onClick={() => updatePip(openPip, { acknowledgement: "Refused" }, "Refusal to acknowledge recorded — process continues")}>Record refusal</Button>
                  <Button size="sm" variant="outline" onClick={() => updatePip(openPip, { status: "Closed" }, "Improvement plan closed")}>Close plan</Button>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 font-medium"><History className="h-3 w-3" /> Plan history</div>
                  {openPip.history.map((h, i) => (
                    <div key={i} className="mb-1 rounded-md border p-2 text-[11px]">
                      <div className="font-medium">{h.text}</div>
                      <div className="text-muted-foreground">{h.at} · {h.by}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ---------- Training sheet ---------- */}
      <Sheet open={!!openTraining} onOpenChange={(o) => !o && setOpenTraining(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {openTraining && (
            <>
              <SheetHeader><SheetTitle>{openTraining.title}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3 text-xs">
                <p className="text-muted-foreground">{openTraining.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Employee", openTraining.name],
                    ["Audience", openTraining.audience],
                    ["Assigned by", openTraining.assignedBy],
                    ["Due", openTraining.due],
                    ["Material", openTraining.material],
                    ["Mandatory", openTraining.mandatory ? "Yes" : "No"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border bg-muted/30 p-2">
                      <div className="text-muted-foreground">{k}</div>
                      <div className="font-medium">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Assessment result</Label>
                  <Input
                    className="text-xs"
                    value={openTraining.assessment}
                    onChange={(e) => setOpenTraining({ ...openTraining, assessment: e.target.value })}
                  />
                  <Button size="sm" variant="outline" onClick={() => updateTraining(openTraining, { assessment: openTraining.assessment }, "Assessment result recorded")}>
                    Save result
                  </Button>
                </div>
                <Button size="sm" className="w-full" onClick={() => updateTraining(openTraining, { status: "Completed", progress: 100 }, "Training completed — employee profile updated")}>
                  <Award className="mr-1 h-3 w-3" /> Issue completion
                </Button>
                <div>
                  <div className="mb-1 flex items-center gap-1 font-medium"><History className="h-3 w-3" /> Training history</div>
                  {openTraining.history.map((h, i) => (
                    <div key={i} className="mb-1 rounded-md border p-2 text-[11px]">
                      <div className="font-medium">{h.text}</div>
                      <div className="text-muted-foreground">{h.at} · {h.by}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ---------- Start review dialog ---------- */}
      <Dialog open={startReview} onOpenChange={setStartReview}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Start performance review</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Employee name" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} />
            <Input placeholder="Employee ID (e.g. CC-SALES-2025-0026)" value={newReview.empId} onChange={(e) => setNewReview({ ...newReview, empId: e.target.value })} />
            <Input placeholder="Designation" value={newReview.designation} onChange={(e) => setNewReview({ ...newReview, designation: e.target.value })} />
            <Input placeholder="Reporting manager" value={newReview.manager} onChange={(e) => setNewReview({ ...newReview, manager: e.target.value })} />
            <Select value={newReview.dept} onValueChange={(v) => setNewReview({ ...newReview, dept: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Sales", "Projects", "Training", "Marketing", "Tech", "Accounts", "Support Staff"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Review period" value={newReview.period} onChange={(e) => setNewReview({ ...newReview, period: e.target.value })} />
            <Input placeholder="Due date (e.g. 30 Sep 2026)" value={newReview.due} onChange={(e) => setNewReview({ ...newReview, due: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartReview(false)}>Cancel</Button>
            <Button onClick={createReview}>Create review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Create training dialog ---------- */}
      <Dialog open={newTraining} onOpenChange={setNewTraining}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create training</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Training title" value={tForm.title} onChange={(e) => setTForm({ ...tForm, title: e.target.value })} />
            <Textarea rows={2} placeholder="Description" value={tForm.description} onChange={(e) => setTForm({ ...tForm, description: e.target.value })} />
            <Select value={tForm.audience} onValueChange={(v) => setTForm({ ...tForm, audience: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Employee", "Role", "Department"].map((a) => <SelectItem key={a} value={a}>Assign to {a.toLowerCase()}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Employee / role / department name" value={tForm.target} onChange={(e) => setTForm({ ...tForm, target: e.target.value })} />
            <Input placeholder="Due date (e.g. 30 Aug 2026)" value={tForm.due} onChange={(e) => setTForm({ ...tForm, due: e.target.value })} />
            <Input placeholder="Approved material file name" value={tForm.material} onChange={(e) => setTForm({ ...tForm, material: e.target.value })} />
            <Select value={tForm.mandatory} onValueChange={(v) => setTForm({ ...tForm, mandatory: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="No">Optional training</SelectItem><SelectItem value="Yes">Mandatory training</SelectItem></SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTraining(false)}>Cancel</Button>
            <Button onClick={createTraining}>Create &amp; assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Feedback dialog ---------- */}
      <Dialog open={!!feedbackFor} onOpenChange={(o) => !o && setFeedbackFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Feedback — {feedbackFor?.name}</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Select value={fForm.kind} onValueChange={(v) => setFForm({ ...fForm, kind: v as FeedbackKind })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FEEDBACK_KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea rows={4} placeholder="Write the feedback — facts and examples only" value={fForm.note} onChange={(e) => setFForm({ ...fForm, note: e.target.value })} />
            {fForm.kind === "Review discussion" && (
              <Input placeholder="Discussion date & time (e.g. 15 Aug 2026, 11:00 AM)" value={fForm.discussion} onChange={(e) => setFForm({ ...fForm, discussion: e.target.value })} />
            )}
            <label className="flex items-center gap-2 rounded-md border p-2 text-xs">
              <input type="checkbox" checked={fForm.share} onChange={(e) => setFForm({ ...fForm, share: e.target.checked })} />
              Send privately to the employee dashboard
            </label>
            <label className="flex items-center gap-2 rounded-md border p-2 text-xs">
              <input type="checkbox" checked={fForm.ack} onChange={(e) => setFForm({ ...fForm, ack: e.target.checked })} />
              Request employee acknowledgement
            </label>
            <p className="text-[11px] text-muted-foreground">Feedback stays private to the employee, their manager and HR. Recorded as {HR_USER} on {NOW}.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackFor(null)}>Cancel</Button>
            <Button onClick={saveFeedback}>Save feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Correction dialog ---------- */}
      <Dialog open={!!correctFor} onOpenChange={(o) => !o && setCorrectFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create correction version</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Completed reviews are locked. A correction creates a new version — the original record is preserved permanently.
            </p>
            <Textarea rows={3} placeholder="Reason for the correction (required)" value={correctReason} onChange={(e) => setCorrectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectFor(null)}>Cancel</Button>
            <Button onClick={makeCorrection}>Create version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-[11px] text-muted-foreground">
        <Target className="mt-0.5 h-3 w-3 shrink-0" />
        Attendance data is kept separate from performance judgement unless company policy explicitly links them. Every view, change, sharing action and acknowledgement is recorded in the audit history.
      </p>
    </div>
  );
}
