import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Boxes,
  Camera,
  CheckCircle2,
  Clock,
  HelpCircle,
  Home,
  ListChecks,
  Mic,
  PlayCircle,
  RotateCcw,
  Volume2,
} from "lucide-react";
import {
  L,
  SAMPLE_TASKS,
  STAFF,
  URG_RING,
  isFinished,
  isOpen,
  nowTime,
  sortTasks,
  type Bi,
  type Lang,
  type Task,
} from "./pantry-cleaning-data";
import { KindBadge, StatusBadge } from "./pantry-cleaning-ui";
import { PantryCleaningMyTasks } from "./pantry-cleaning-my-tasks";
import { PantryCleaningReportProblem } from "./pantry-cleaning-report-problem";
import { PantryCleaningHelp } from "./pantry-cleaning-help";
import { PantryCleaningSupplies } from "./pantry-cleaning-supplies";

const SUPPLY_ALERTS: {
  id: string;
  item: Bi;
  state: "requested" | "approved" | "ready" | "unavailable";
}[] = [
  { id: "S1", item: { en: "Toilet cleaner – 2 bottles", hi: "टॉयलेट क्लीनर – 2 बोतल" }, state: "ready" },
  { id: "S2", item: { en: "Paper cups – 4 packs", hi: "पेपर कप – 4 पैकेट" }, state: "approved" },
  { id: "S3", item: { en: "Tea powder – 2 kg", hi: "चाय पत्ती – 2 किलो" }, state: "requested" },
  { id: "S4", item: { en: "Mop refill", hi: "पोछा रिफिल" }, state: "unavailable" },
];

const STATE_LABEL = {
  requested: { en: "Supply requested", hi: "सामान माँगा गया", cls: "bg-muted text-foreground" },
  approved: { en: "Request approved", hi: "मंज़ूरी मिली", cls: "bg-blue-500/15 text-blue-600" },
  ready: { en: "Ready to collect", hi: "लेने के लिए तैयार", cls: "bg-emerald-500/15 text-emerald-600" },
  unavailable: { en: "Item unavailable", hi: "सामान नहीं है", cls: "bg-destructive/15 text-destructive" },
};

type Section = "home" | "tasks" | "supplies" | "problem" | "help";

export function PantryCleaningDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [section, setSection] = useState<Section>("home");
  const [status, setStatus] = useState<"available" | "busy" | "off">("available");
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [completing, setCompleting] = useState<Task | null>(null);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [voiceAdded, setVoiceAdded] = useState(false);
  const [helpFor, setHelpFor] = useState<Task | null>(null);
  const [helpNote, setHelpNote] = useState("");
  const [probType, setProbType] = useState("");
  const [probNote, setProbNote] = useState("");

  const t = (v: Bi) => v[lang];
  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const doneCount = tasks.filter((x) => isFinished(x.status)).length;
  const remaining = tasks.filter((x) => isOpen(x.status)).length;
  const urgentCount = tasks.filter(
    (x) => (x.priority === "urgent" || x.urgency === "overdue") && isOpen(x.status),
  ).length;
  const next = sorted.find((x) => isOpen(x.status));

  const patch = (id: string, upd: Partial<Task>, log?: Bi) =>
    setTasks((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, ...upd, history: log ? [...x.history, { at: nowTime(), text: log }] : x.history }
          : x,
      ),
    );

  /** Only one active task at a time; records the start time. Returns false when blocked. */
  const startTask = (id: string) => {
    const activeOther = tasks.find((x) => x.status === "started" && x.id !== id);
    if (activeOther) return false;
    patch(
      id,
      { status: "started", startedAt: nowTime() },
      { en: "Work started", hi: "काम शुरू किया" },
    );
    setStatus("busy");
    return true;
  };

  const submitWork = (id: string) => {
    patch(
      id,
      { status: "review" },
      { en: "Sent to manager for review", hi: "मैनेजर की जाँच के लिए भेजा" },
    );
    setStatus("available");
  };

  const logHelp = (id: string, reason: string) =>
    patch(id, {}, { en: `Help requested: ${reason}`, hi: `मदद माँगी: ${reason}` });

  const startWorkHome = (task: Task) => {
    if (startTask(task.id)) toast.success(lang === "hi" ? "काम शुरू हो गया" : "Work started");
    else toast.error(t(L.oneAtATime));
  };

  const openComplete = (task: Task) => {
    setPhotoAdded(false);
    setVoiceAdded(false);
    setCompleting(task);
  };

  const submitComplete = () => {
    if (!completing) return;
    if (completing.photoRequired && !photoAdded) {
      toast.error(lang === "hi" ? "पहले फोटो लगाएं" : "Please add the completion photo");
      return;
    }
    submitWork(completing.id);
    toast.success(t(L.submitted));
    setCompleting(null);
  };

  const sendHelp = () => {
    if (!helpFor) return;
    logHelp(helpFor.id, helpNote || "no note");
    toast.success(lang === "hi" ? "मैनेजर को मदद का संदेश गया" : "Help request sent to manager");
    setHelpFor(null);
    setHelpNote("");
  };

  const speak = () =>
    toast.info(lang === "hi" ? "आवाज़ निर्देश जल्द आएगा" : "Voice instruction coming soon");

  const nav: { key: Section; label: Bi; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "home", label: L.home, icon: Home },
    { key: "tasks", label: L.tasks, icon: ListChecks },
    { key: "supplies", label: L.supplies, icon: Boxes },
    { key: "problem", label: L.problem, icon: AlertTriangle },
    { key: "help", label: L.help, icon: HelpCircle },
  ];

  const TaskCard = ({ task }: { task: Task }) => {
    const Icon = task.icon;
    return (
      <Card className={`border-2 ${URG_RING[task.urgency]}`}>
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              task.urgency === "urgent" || task.urgency === "overdue"
                ? "bg-destructive/10 text-destructive"
                : task.urgency === "soon"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-muted text-foreground"
            }`}
          >
            <Icon className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={task.kind} lang={lang} />
              {task.priority === "urgent" && (
                <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                  {t(L.urgent)}
                </span>
              )}
            </div>
            <div className="text-lg font-bold leading-tight">{t(task.title)}</div>
            <p className="text-sm text-muted-foreground">
              {t(task.location)} · {t(L.due)} {task.newDue ?? task.due}
            </p>
            <StatusBadge s={task.status} lang={lang} />
          </div>
        </CardContent>
      </Card>
    );
  };

  const Header = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4">
      <div className="flex items-center gap-3">
        <img
          src={STAFF.photo}
          alt={STAFF.name}
          loading="lazy"
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <div className="text-lg font-bold">{STAFF.name}</div>
          <div className="text-sm text-muted-foreground">{today}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-full border">
          {(["en", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 text-sm font-semibold ${
                lang === l ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
            >
              {l === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="h-11 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">{lang === "hi" ? "उपलब्ध" : "Available"}</SelectItem>
            <SelectItem value="busy">{lang === "hi" ? "व्यस्त" : "Busy"}</SelectItem>
            <SelectItem value="off">{lang === "hi" ? "ड्यूटी बंद" : "Off Duty"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const summary = [
    { l: L.tasksToday, v: tasks.length, i: Clock, c: "text-foreground" },
    { l: L.remaining, v: remaining, i: PlayCircle, c: "text-blue-600" },
    { l: L.urgentTasks, v: urgentCount, i: AlertTriangle, c: "text-destructive" },
    { l: L.completed, v: doneCount, i: CheckCircle2, c: "text-emerald-600" },
  ];

  const homeView = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((k) => (
          <Card key={k.l.en}>
            <CardContent className="p-4">
              <k.i className={`h-7 w-7 ${k.c}`} />
              <div className="mt-2 text-4xl font-bold tabular-nums">{k.v}</div>
              <div className="text-sm text-muted-foreground">{t(k.l)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {next ? (
        <Card className={`border-4 ${URG_RING[next.urgency]}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              {t(L.nextTask)}
              <button onClick={speak} aria-label={t(L.listen)}>
                <Volume2 className="h-5 w-5 text-primary" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {next.status === "redo" && next.correction && (
              <div className="rounded-xl border-2 border-destructive/60 bg-destructive/10 p-4">
                <div className="flex items-center gap-2 text-lg font-bold text-destructive">
                  <RotateCcw className="h-5 w-5" /> {t(L.doAgain)}
                </div>
                <p className="mt-1 text-base">{t(next.correction)}</p>
                {next.newDue && (
                  <p className="mt-1 text-sm font-semibold">
                    {t(L.newTime)}: {next.newDue}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl ${
                  next.kind === "pantry" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                }`}
              >
                <next.icon className="h-16 w-16" />
              </div>
              <div className="space-y-2">
                <KindBadge kind={next.kind} lang={lang} />
                <div className="text-2xl font-bold leading-tight">{t(next.title)}</div>
                <p className="text-base text-muted-foreground">{t(next.location)}</p>
                <p className="text-base font-semibold">
                  {t(L.due)}: {next.newDue ?? next.due}
                </p>
                <StatusBadge s={next.status} lang={lang} />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-muted p-4">
              <button onClick={speak} aria-label={t(L.listen)}>
                <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              </button>
              <p className="text-base">{t(next.instructions)}</p>
            </div>

            {next.refPhoto && (
              <img
                src={next.refPhoto}
                alt={t(next.title)}
                loading="lazy"
                className="h-44 w-full rounded-xl object-cover"
              />
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                size="lg"
                className="h-20 text-lg"
                onClick={() => startWorkHome(next)}
                disabled={next.status === "started"}
              >
                <PlayCircle className="mr-2 h-7 w-7" />
                {next.status === "redo" ? t(L.startAgain) : t(L.start)}
              </Button>
              <Button
                size="lg"
                className="h-20 bg-emerald-600 text-lg text-white hover:bg-emerald-700"
                onClick={() => openComplete(next)}
              >
                <CheckCircle2 className="mr-2 h-7 w-7" />
                {t(L.done)}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-20 text-lg"
                onClick={() => setHelpFor(next)}
              >
                <HelpCircle className="mr-2 h-7 w-7" />
                {t(L.needHelp)}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-emerald-500/50">
          <CardContent className="flex items-center gap-3 p-6 text-lg font-semibold text-emerald-700">
            <CheckCircle2 className="h-8 w-8" /> {t(L.allDone)}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-bold">{t(L.todays)}</h2>
        {sorted.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );

  const suppliesView = (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(L.supplyAlert)}</h1>
      {SUPPLY_ALERTS.map((s) => (
        <Card key={s.id}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Boxes className="h-8 w-8 text-primary" />
              <div className="text-lg font-semibold">{t(s.item)}</div>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${STATE_LABEL[s.state].cls}`}>
              {t(STATE_LABEL[s.state])}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const problemView = (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(L.problem)}</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          <Select value={probType} onValueChange={setProbType}>
            <SelectTrigger className="h-14 text-base">
              <SelectValue placeholder={lang === "hi" ? "समस्या चुनें" : "Choose a problem"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-material">{lang === "hi" ? "सामान खत्म" : "Material finished"}</SelectItem>
              <SelectItem value="machine">{lang === "hi" ? "मशीन खराब" : "Machine not working"}</SelectItem>
              <SelectItem value="area-locked">{lang === "hi" ? "जगह बंद है" : "Area is locked"}</SelectItem>
              <SelectItem value="other">{lang === "hi" ? "अन्य" : "Other"}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={probNote}
            onChange={(e) => setProbNote(e.target.value)}
            placeholder={lang === "hi" ? "छोटा नोट (वैकल्पिक)" : "Short note (optional)"}
            className="min-h-24 text-base"
          />
          <Button variant="outline" size="lg" className="h-14 w-full" onClick={speak}>
            <Mic className="mr-2 h-6 w-6" /> {t(L.voice)}
          </Button>
          <Button
            size="lg"
            className="h-16 w-full text-lg"
            onClick={() => {
              if (!probType) {
                toast.error(lang === "hi" ? "पहले समस्या चुनें" : "Please choose a problem");
                return;
              }
              setProbType("");
              setProbNote("");
              toast.success(lang === "hi" ? "मैनेजर को भेज दिया" : "Sent to your manager");
            }}
          >
            {t(L.submit)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const helpView = (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(L.help)}</h1>
      {[
        {
          q: { en: "How do I start a task?", hi: "काम कैसे शुरू करूँ?" },
          a: {
            en: "Open Home. The big card is your next task. Press the blue Start Work button.",
            hi: "होम खोलें। बड़ा कार्ड आपका अगला काम है। नीला बटन दबाएं।",
          },
        },
        {
          q: { en: "How do I finish a task?", hi: "काम कैसे पूरा करूँ?" },
          a: {
            en: "Press the green Work Completed button, tick the checklist, add a photo if asked, then press Submit.",
            hi: "हरा बटन दबाएं, जाँच सूची टिक करें, फोटो माँगे तो लगाएं, फिर भेजें दबाएं।",
          },
        },
        {
          q: { en: "Manager returned my work", hi: "मैनेजर ने काम वापस भेजा" },
          a: {
            en: "The task moves to Do Again with the correction and a new time. Press Start Again.",
            hi: "काम 'दोबारा करें' में जाएगा, सुधार और नया समय भी दिखेगा। 'फिर से शुरू करें' दबाएं।",
          },
        },
        {
          q: { en: "Safety rules", hi: "सुरक्षा नियम" },
          a: {
            en: "Wear gloves with chemicals. Put the wet floor sign. Never mix two cleaning liquids.",
            hi: "केमिकल के साथ दस्ताने पहनें। गीला फर्श का बोर्ड रखें। दो लिक्विड कभी न मिलाएं।",
          },
        },
      ].map((h, i) => (
        <Card key={i}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <button onClick={speak} aria-label={t(L.listen)}>
                <Volume2 className="h-5 w-5 text-primary" />
              </button>
              {t(h.q)}
            </div>
            <p className="text-base text-muted-foreground">{t(h.a)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full flex-col bg-muted/30 md:flex-row">
      <div className="border-b bg-background md:hidden">
        <nav className="flex gap-2 overflow-x-auto p-3">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => setSection(n.key)}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold ${
                section === n.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <n.icon className="h-6 w-6" />
              {t(n.label)}
            </button>
          ))}
        </nav>
      </div>

      <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
        <div className="border-b p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Support Staff</div>
          <div className="font-semibold">
            {lang === "hi" ? "पैंट्री और सफाई" : "Pantry & Cleaning"}
          </div>
        </div>
        <nav className="space-y-1 p-2">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => setSection(n.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium ${
                section === n.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <n.icon className="h-6 w-6" />
              {t(n.label)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
        {section !== "tasks" && Header}
        {section === "home" && homeView}
        {section === "tasks" && (
          <PantryCleaningMyTasks
            tasks={tasks}
            lang={lang}
            setLang={setLang}
            onStart={startTask}
            onSubmitWork={submitWork}
            onHelp={logHelp}
          />
        )}
        {section === "supplies" && <PantryCleaningSupplies lang={lang} setLang={setLang} />}
        {section === "problem" && (
          <PantryCleaningReportProblem lang={lang} setLang={setLang} />
        )}
        {section === "help" && (
          <PantryCleaningHelp
            lang={lang}
            setLang={setLang}
            onReportProblem={() => setSection("problem")}
          />
        )}
      </main>

      {/* completion dialog (Home) */}
      <Dialog open={!!completing} onOpenChange={(o) => !o && setCompleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">{completing ? t(completing.title) : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {completing?.photoRequired && (
              <Button
                variant={photoAdded ? "secondary" : "outline"}
                size="lg"
                className="h-16 w-full text-base"
                onClick={() => {
                  setPhotoAdded(true);
                  toast.success(t(L.photoAdded));
                }}
              >
                <Camera className="mr-2 h-6 w-6" />
                {photoAdded ? t(L.photoAdded) : t(L.photo)}
              </Button>
            )}
            <Button
              variant={voiceAdded ? "secondary" : "outline"}
              size="lg"
              className="h-16 w-full text-base"
              onClick={() => {
                setVoiceAdded(true);
                toast.info(lang === "hi" ? "आवाज़ नोट जल्द आएगा" : "Voice note coming soon");
              }}
            >
              <Mic className="mr-2 h-6 w-6" /> {t(L.voice)}
            </Button>
          </div>
          <DialogFooter>
            <Button size="lg" className="h-16 w-full text-lg" onClick={submitComplete}>
              {t(L.submit)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* help dialog (Home) */}
      <Dialog open={!!helpFor} onOpenChange={(o) => !o && setHelpFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">{t(L.needHelp)}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={helpNote}
            onChange={(e) => setHelpNote(e.target.value)}
            placeholder={lang === "hi" ? "क्या दिक्कत है? (वैकल्पिक)" : "What is the problem? (optional)"}
            className="min-h-24 text-base"
          />
          <DialogFooter>
            <Button size="lg" className="h-16 w-full text-lg" onClick={sendHelp}>
              {t(L.submit)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
