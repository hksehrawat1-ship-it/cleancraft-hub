import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Coffee,
  HelpCircle,
  Home,
  ListChecks,
  Mic,
  PlayCircle,
  RotateCcw,
  SprayCan,
  Volume2,
  Sparkles,
  Trash2,
  GlassWater,
  Droplets,
  Utensils,
} from "lucide-react";

/* ---------------- types & sample data ---------------- */

type Kind = "pantry" | "cleaning";
type Status = "new" | "started" | "completed" | "review" | "approved" | "redo";
type Urgency = "urgent" | "soon" | "routine";

type Task = {
  id: string;
  kind: Kind;
  title: { en: string; hi: string };
  location: { en: string; hi: string };
  due: string;
  urgency: Urgency;
  status: Status;
  photoRequired: boolean;
  instructions: { en: string; hi: string };
  refPhoto?: string;
  icon: React.ComponentType<{ className?: string }>;
  correction?: { en: string; hi: string };
  newDue?: string;
  history: { at: string; text: { en: string; hi: string } }[];
};

const STAFF = {
  name: "Sunita Devi",
  photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
};

const SAMPLE: Task[] = [
  {
    id: "T-1",
    kind: "pantry",
    title: { en: "Guest tea – CEO cabin", hi: "मेहमान की चाय – सीईओ केबिन" },
    location: { en: "Floor 2 – CEO Cabin", hi: "फ्लोर 2 – सीईओ केबिन" },
    due: "12:30 PM",
    urgency: "urgent",
    status: "new",
    photoRequired: true,
    instructions: {
      en: "Make 3 cups of tea. Use clean covered tray. Serve within 5 minutes.",
      hi: "3 कप चाय बनाएं। साफ ढकी ट्रे लें। 5 मिनट के अंदर पहुँचाएँ।",
    },
    refPhoto:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=400&fit=crop",
    icon: Coffee,
    history: [{ at: "9:05 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } }],
  },
  {
    id: "T-2",
    kind: "cleaning",
    title: { en: "Washroom cleaning – Floor 1", hi: "वॉशरूम सफाई – फ्लोर 1" },
    location: { en: "Floor 1 – Washroom", hi: "फ्लोर 1 – वॉशरूम" },
    due: "1:00 PM",
    urgency: "soon",
    status: "started",
    photoRequired: true,
    instructions: {
      en: "Use toilet cleaner only. Put wet floor sign. Refill soap and tissue.",
      hi: "सिर्फ टॉयलेट क्लीनर लगाएं। गीला फर्श का बोर्ड रखें। साबुन और टिशू भरें।",
    },
    icon: Droplets,
    history: [
      { at: "8:40 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "12:10 PM", text: { en: "Work started", hi: "काम शुरू किया" } },
    ],
  },
  {
    id: "T-3",
    kind: "cleaning",
    title: { en: "Floor mopping – Reception", hi: "फर्श पोछा – रिसेप्शन" },
    location: { en: "Ground Floor – Reception", hi: "ग्राउंड फ्लोर – रिसेप्शन" },
    due: "2:00 PM",
    urgency: "soon",
    status: "redo",
    photoRequired: true,
    correction: {
      en: "Corner near the lift is still dirty. Please mop again.",
      hi: "लिफ्ट के पास कोना अब भी गंदा है। दोबारा पोछा लगाएं।",
    },
    newDue: "3:30 PM",
    instructions: {
      en: "Mop with floor cleaner. Cover all corners near lift and main door.",
      hi: "फ्लोर क्लीनर से पोछा लगाएं। लिफ्ट और मुख्य दरवाजे के सभी कोने साफ करें।",
    },
    icon: Sparkles,
    history: [
      { at: "9:00 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "11:20 AM", text: { en: "Sent for review", hi: "जाँच के लिए भेजा" } },
      { at: "11:50 AM", text: { en: "Returned by manager", hi: "मैनेजर ने वापस भेजा" } },
    ],
  },
  {
    id: "T-4",
    kind: "pantry",
    title: { en: "Refill water dispensers", hi: "पानी की मशीन भरें" },
    location: { en: "All Floors", hi: "सभी फ्लोर" },
    due: "3:00 PM",
    urgency: "routine",
    status: "new",
    photoRequired: false,
    instructions: {
      en: "Check all 4 dispensers. Replace empty bottles.",
      hi: "चारों मशीन देखें। खाली बोतल बदलें।",
    },
    icon: GlassWater,
    history: [{ at: "9:05 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } }],
  },
  {
    id: "T-5",
    kind: "cleaning",
    title: { en: "Dustbin clearance", hi: "कूड़ेदान खाली करें" },
    location: { en: "All Floors", hi: "सभी फ्लोर" },
    due: "6:00 PM",
    urgency: "routine",
    status: "new",
    photoRequired: false,
    instructions: {
      en: "Empty every dustbin. Put a new garbage bag in each one.",
      hi: "हर कूड़ेदान खाली करें। हर एक में नई थैली लगाएं।",
    },
    icon: Trash2,
    history: [{ at: "9:05 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } }],
  },
  {
    id: "T-6",
    kind: "pantry",
    title: { en: "Morning tea service", hi: "सुबह की चाय" },
    location: { en: "Floor 1 – Sales", hi: "फ्लोर 1 – सेल्स" },
    due: "9:30 AM",
    urgency: "routine",
    status: "approved",
    photoRequired: false,
    instructions: { en: "Serve tea to all desks.", hi: "सभी डेस्क पर चाय दें।" },
    icon: Utensils,
    history: [
      { at: "9:00 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "9:35 AM", text: { en: "Sent for review", hi: "जाँच के लिए भेजा" } },
      { at: "10:00 AM", text: { en: "Approved by manager", hi: "मैनेजर ने मंज़ूरी दी" } },
    ],
  },
  {
    id: "T-7",
    kind: "cleaning",
    title: { en: "Workstation dusting – Floor 2", hi: "डेस्क की धूल सफाई – फ्लोर 2" },
    location: { en: "Floor 2 – Ops", hi: "फ्लोर 2 – ऑप्स" },
    due: "11:00 AM",
    urgency: "routine",
    status: "review",
    photoRequired: true,
    instructions: { en: "Dust all desks and screens.", hi: "सभी डेस्क और स्क्रीन साफ करें।" },
    icon: Sparkles,
    history: [
      { at: "9:00 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "11:15 AM", text: { en: "Sent for review", hi: "जाँच के लिए भेजा" } },
    ],
  },
];

const SUPPLY_ALERTS: {
  id: string;
  item: { en: string; hi: string };
  state: "requested" | "approved" | "ready" | "unavailable";
}[] = [
  { id: "S1", item: { en: "Toilet cleaner – 2 bottles", hi: "टॉयलेट क्लीनर – 2 बोतल" }, state: "ready" },
  { id: "S2", item: { en: "Paper cups – 4 packs", hi: "पेपर कप – 4 पैकेट" }, state: "approved" },
  { id: "S3", item: { en: "Tea powder – 2 kg", hi: "चाय पत्ती – 2 किलो" }, state: "requested" },
  { id: "S4", item: { en: "Mop refill", hi: "पोछा रिफिल" }, state: "unavailable" },
];

/* ---------------- labels ---------------- */

const T = {
  home: { en: "Home", hi: "होम" },
  tasks: { en: "My Tasks", hi: "मेरे काम" },
  supplies: { en: "Supplies", hi: "सामान" },
  problem: { en: "Report a Problem", hi: "समस्या बताएं" },
  help: { en: "Help", hi: "मदद" },
  tasksToday: { en: "Tasks Today", hi: "आज के काम" },
  remaining: { en: "Tasks Remaining", hi: "बाकी काम" },
  urgent: { en: "Urgent Tasks", hi: "ज़रूरी काम" },
  completed: { en: "Completed Tasks", hi: "पूरे काम" },
  nextTask: { en: "Next Task", hi: "अगला काम" },
  start: { en: "Start Work", hi: "काम शुरू करें" },
  done: { en: "Work Completed", hi: "काम पूरा हुआ" },
  needHelp: { en: "Need Help", hi: "मदद चाहिए" },
  todays: { en: "Today's Tasks", hi: "आज के काम" },
  doAgain: { en: "Please Do Again", hi: "कृपया दोबारा करें" },
  startAgain: { en: "Start Again", hi: "फिर से शुरू करें" },
  newTime: { en: "New due time", hi: "नया समय" },
  photo: { en: "Add completion photo", hi: "काम की फोटो लगाएं" },
  voice: { en: "Record voice note", hi: "आवाज़ नोट भेजें" },
  submit: { en: "Submit", hi: "भेजें" },
  supplyAlert: { en: "Supply Alerts", hi: "सामान की सूचना" },
  allDone: { en: "All work is done. Well done!", hi: "सारा काम हो गया। बहुत बढ़िया!" },
  listen: { en: "Listen", hi: "सुनें" },
  pantry: { en: "Pantry", hi: "पैंट्री" },
  cleaning: { en: "Cleaning", hi: "सफाई" },
  due: { en: "Due", hi: "समय" },
  history: { en: "History", hi: "इतिहास" },
};

const STATUS_LABEL: Record<Status, { en: string; hi: string }> = {
  new: { en: "New", hi: "नया" },
  started: { en: "Started", hi: "शुरू" },
  completed: { en: "Completed", hi: "पूरा" },
  review: { en: "Waiting for Review", hi: "जाँच बाकी" },
  approved: { en: "Approved", hi: "मंज़ूर" },
  redo: { en: "Do Again", hi: "दोबारा करें" },
};

const STATE_LABEL = {
  requested: { en: "Supply requested", hi: "सामान माँगा गया", cls: "bg-muted text-foreground" },
  approved: { en: "Request approved", hi: "मंज़ूरी मिली", cls: "bg-blue-500/15 text-blue-600" },
  ready: { en: "Ready to collect", hi: "लेने के लिए तैयार", cls: "bg-emerald-500/15 text-emerald-600" },
  unavailable: { en: "Item unavailable", hi: "सामान नहीं है", cls: "bg-destructive/15 text-destructive" },
};

const URG_RING: Record<Urgency, string> = {
  urgent: "border-destructive/60",
  soon: "border-amber-500/60",
  routine: "border-border",
};

const ORDER: Record<Status, number> = {
  redo: 0,
  new: 1,
  started: 1,
  review: 4,
  completed: 4,
  approved: 5,
};

/* ---------------- component ---------------- */

type Section = "home" | "tasks" | "supplies" | "problem" | "help";
type Lang = "en" | "hi";

export function PantryCleaningDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [section, setSection] = useState<Section>("home");
  const [status, setStatus] = useState<"available" | "busy" | "off">("available");
  const [tasks, setTasks] = useState<Task[]>(SAMPLE);
  const [completing, setCompleting] = useState<Task | null>(null);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [voiceAdded, setVoiceAdded] = useState(false);
  const [helpFor, setHelpFor] = useState<Task | null>(null);
  const [helpNote, setHelpNote] = useState("");
  const [probType, setProbType] = useState("");
  const [probNote, setProbNote] = useState("");

  const t = (v: { en: string; hi: string }) => v[lang];
  const now = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const s = ORDER[a.status] - ORDER[b.status];
        if (s !== 0) return s;
        const u = { urgent: 0, soon: 1, routine: 2 };
        return u[a.urgency] - u[b.urgency];
      }),
    [tasks],
  );

  const doneCount = tasks.filter((x) => x.status === "approved" || x.status === "review" || x.status === "completed").length;
  const remaining = tasks.filter((x) => ["new", "started", "redo"].includes(x.status)).length;
  const urgentCount = tasks.filter(
    (x) => x.urgency === "urgent" && ["new", "started", "redo"].includes(x.status),
  ).length;
  const next = sorted.find((x) => ["new", "started", "redo"].includes(x.status));

  const patch = (id: string, upd: Partial<Task>, log?: { en: string; hi: string }) =>
    setTasks((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, ...upd, history: log ? [...x.history, { at: now(), text: log }] : x.history }
          : x,
      ),
    );

  const startWork = (task: Task) => {
    patch(task.id, { status: "started", correction: undefined }, { en: "Work started", hi: "काम शुरू किया" });
    setStatus("busy");
    toast.success(lang === "hi" ? "काम शुरू हो गया" : "Work started");
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
    patch(
      completing.id,
      { status: "review", correction: undefined },
      { en: "Sent to manager for review", hi: "मैनेजर की जाँच के लिए भेजा" },
    );
    toast.success(
      lang === "hi" ? "मैनेजर की जाँच के लिए भेज दिया" : "Sent to manager for review",
    );
    setCompleting(null);
    setStatus("available");
  };

  const sendHelp = () => {
    if (!helpFor) return;
    patch(helpFor.id, {}, { en: `Help requested: ${helpNote || "no note"}`, hi: `मदद माँगी: ${helpNote || "बिना नोट"}` });
    toast.success(lang === "hi" ? "मैनेजर को मदद का संदेश गया" : "Help request sent to manager");
    setHelpFor(null);
    setHelpNote("");
  };

  const speak = () =>
    toast.info(lang === "hi" ? "आवाज़ निर्देश जल्द आएगा" : "Voice instruction coming soon");

  const nav: { key: Section; label: { en: string; hi: string }; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "home", label: T.home, icon: Home },
    { key: "tasks", label: T.tasks, icon: ListChecks },
    { key: "supplies", label: T.supplies, icon: Boxes },
    { key: "problem", label: T.problem, icon: AlertTriangle },
    { key: "help", label: T.help, icon: HelpCircle },
  ];

  const KindBadge = ({ kind }: { kind: Kind }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        kind === "pantry" ? "bg-amber-500/15 text-amber-700" : "bg-blue-500/15 text-blue-700"
      }`}
    >
      {kind === "pantry" ? <Coffee className="h-3.5 w-3.5" /> : <SprayCan className="h-3.5 w-3.5" />}
      {kind === "pantry" ? t(T.pantry) : t(T.cleaning)}
    </span>
  );

  const StatusBadge = ({ s }: { s: Status }) => {
    const cls =
      s === "approved" || s === "completed"
        ? "bg-emerald-500/15 text-emerald-700"
        : s === "started"
          ? "bg-blue-500/15 text-blue-700"
          : s === "redo"
            ? "bg-destructive/15 text-destructive"
            : s === "review"
              ? "bg-amber-500/15 text-amber-700"
              : "bg-muted text-muted-foreground";
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{t(STATUS_LABEL[s])}</span>;
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const Icon = task.icon;
    return (
      <Card className={`border-2 ${URG_RING[task.urgency]}`}>
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              task.urgency === "urgent"
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
              <KindBadge kind={task.kind} />
              {task.urgency === "urgent" && (
                <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                  {t(T.urgent)}
                </span>
              )}
            </div>
            <div className="text-lg font-bold leading-tight">{t(task.title)}</div>
            <p className="text-sm text-muted-foreground">
              {t(task.location)} · {t(T.due)} {task.newDue ?? task.due}
            </p>
            <StatusBadge s={task.status} />
          </div>
        </CardContent>
      </Card>
    );
  };

  /* ---------- sections ---------- */

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
    { l: T.tasksToday, v: tasks.length, i: Clock, c: "text-foreground" },
    { l: T.remaining, v: remaining, i: PlayCircle, c: "text-blue-600" },
    { l: T.urgent, v: urgentCount, i: AlertTriangle, c: "text-destructive" },
    { l: T.completed, v: doneCount, i: CheckCircle2, c: "text-emerald-600" },
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
              {t(T.nextTask)}
              <button onClick={speak} aria-label={t(T.listen)}>
                <Volume2 className="h-5 w-5 text-primary" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {next.status === "redo" && next.correction && (
              <div className="rounded-xl border-2 border-destructive/60 bg-destructive/10 p-4">
                <div className="flex items-center gap-2 text-lg font-bold text-destructive">
                  <RotateCcw className="h-5 w-5" /> {t(T.doAgain)}
                </div>
                <p className="mt-1 text-base">{t(next.correction)}</p>
                {next.newDue && (
                  <p className="mt-1 text-sm font-semibold">
                    {t(T.newTime)}: {next.newDue}
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
                <KindBadge kind={next.kind} />
                <div className="text-2xl font-bold leading-tight">{t(next.title)}</div>
                <p className="text-base text-muted-foreground">{t(next.location)}</p>
                <p className="text-base font-semibold">
                  {t(T.due)}: {next.newDue ?? next.due}
                </p>
                <StatusBadge s={next.status} />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-muted p-4">
              <button onClick={speak} aria-label={t(T.listen)}>
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
                onClick={() => startWork(next)}
                disabled={next.status === "started"}
              >
                <PlayCircle className="mr-2 h-7 w-7" />
                {next.status === "redo" ? t(T.startAgain) : t(T.start)}
              </Button>
              <Button
                size="lg"
                className="h-20 bg-emerald-600 text-lg text-white hover:bg-emerald-700"
                onClick={() => openComplete(next)}
              >
                <CheckCircle2 className="mr-2 h-7 w-7" />
                {t(T.done)}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-20 text-lg"
                onClick={() => setHelpFor(next)}
              >
                <HelpCircle className="mr-2 h-7 w-7" />
                {t(T.needHelp)}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-emerald-500/50">
          <CardContent className="flex items-center gap-3 p-6 text-lg font-semibold text-emerald-700">
            <CheckCircle2 className="h-8 w-8" /> {t(T.allDone)}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-bold">{t(T.todays)}</h2>
        {sorted.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );

  const tasksView = (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(T.tasks)}</h1>
      {sorted.map((task) => (
        <Card key={task.id} className={`border-2 ${URG_RING[task.urgency]}`}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                  task.kind === "pantry" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                }`}
              >
                <task.icon className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <KindBadge kind={task.kind} />
                <div className="text-lg font-bold leading-tight">{t(task.title)}</div>
                <p className="text-sm text-muted-foreground">
                  {t(task.location)} · {t(T.due)} {task.newDue ?? task.due}
                </p>
                <StatusBadge s={task.status} />
              </div>
            </div>

            {task.status === "redo" && task.correction && (
              <div className="rounded-lg border-2 border-destructive/60 bg-destructive/10 p-3">
                <div className="font-bold text-destructive">{t(T.doAgain)}</div>
                <p className="text-sm">{t(task.correction)}</p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
              <button onClick={speak} aria-label={t(T.listen)}>
                <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              </button>
              <p className="text-sm">{t(task.instructions)}</p>
            </div>

            {["new", "started", "redo"].includes(task.status) && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button size="lg" className="h-14" onClick={() => startWork(task)} disabled={task.status === "started"}>
                  {task.status === "redo" ? t(T.startAgain) : t(T.start)}
                </Button>
                <Button
                  size="lg"
                  className="h-14 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => openComplete(task)}
                >
                  {t(T.done)}
                </Button>
              </div>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">{t(T.history)}</summary>
              <ul className="mt-2 space-y-1">
                {task.history.map((h, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {h.at} — {t(h.text)}
                  </li>
                ))}
              </ul>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const suppliesView = (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(T.supplyAlert)}</h1>
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
      <h1 className="text-2xl font-bold">{t(T.problem)}</h1>
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
            <Mic className="mr-2 h-6 w-6" /> {t(T.voice)}
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
            {t(T.submit)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const helpView = (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(T.help)}</h1>
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
            en: "Press the green Work Completed button, add a photo if asked, then press Submit.",
            hi: "हरा बटन दबाएं, फोटो माँगे तो लगाएं, फिर भेजें दबाएं।",
          },
        },
        {
          q: { en: "Manager returned my work", hi: "मैनेजर ने काम वापस भेजा" },
          a: {
            en: "The task will show a red Do Again box with the correction and a new time. Press Start Again.",
            hi: "काम पर लाल 'दोबारा करें' दिखेगा, सुधार और नया समय भी। 'फिर से शुरू करें' दबाएं।",
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
              <button onClick={speak} aria-label={t(T.listen)}>
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
        {Header}
        {section === "home" && homeView}
        {section === "tasks" && tasksView}
        {section === "supplies" && suppliesView}
        {section === "problem" && problemView}
        {section === "help" && helpView}
      </main>

      {/* completion dialog */}
      <Dialog open={!!completing} onOpenChange={(o) => !o && setCompleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {completing ? t(completing.title) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {completing?.photoRequired && (
              <Button
                variant={photoAdded ? "secondary" : "outline"}
                size="lg"
                className="h-16 w-full text-base"
                onClick={() => {
                  setPhotoAdded(true);
                  toast.success(lang === "hi" ? "फोटो जुड़ गई" : "Photo added");
                }}
              >
                <Camera className="mr-2 h-6 w-6" />
                {photoAdded ? (lang === "hi" ? "फोटो जुड़ी" : "Photo added") : t(T.photo)}
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
              <Mic className="mr-2 h-6 w-6" /> {t(T.voice)}
            </Button>
          </div>
          <DialogFooter>
            <Button size="lg" className="h-16 w-full text-lg" onClick={submitComplete}>
              {t(T.submit)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* help dialog */}
      <Dialog open={!!helpFor} onOpenChange={(o) => !o && setHelpFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">{t(T.needHelp)}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={helpNote}
            onChange={(e) => setHelpNote(e.target.value)}
            placeholder={lang === "hi" ? "क्या दिक्कत है? (वैकल्पिक)" : "What is the problem? (optional)"}
            className="min-h-24 text-base"
          />
          <DialogFooter>
            <Button size="lg" className="h-16 w-full text-lg" onClick={sendHelp}>
              {t(T.submit)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
