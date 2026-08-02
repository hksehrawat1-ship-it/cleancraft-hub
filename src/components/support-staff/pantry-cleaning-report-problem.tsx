import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import {
  AlertTriangle,
  Ban,
  Boxes,
  Camera,
  CheckCircle2,
  Clock,
  DoorClosed,
  Droplets,
  Eye,
  HelpCircle,
  Mic,
  Package,
  PhoneCall,
  Plug,
  Search,
  ShieldAlert,
  Siren,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import type { Bi, Lang } from "./pantry-cleaning-data";
import { SAMPLE_TASKS } from "./pantry-cleaning-data";
import { LangSwitch } from "./pantry-cleaning-ui";

type Status = "sent" | "checking" | "coming" | "solved" | "closed";

type Problem = {
  id: string;
  label: Bi;
  icon: React.ComponentType<{ className?: string }>;
  safety?: boolean;
};

const PROBLEMS: Problem[] = [
  { id: "supply", label: { en: "Supply Missing", hi: "सामान नहीं है" }, icon: Boxes },
  { id: "damaged", label: { en: "Item Damaged", hi: "सामान टूटा है" }, icon: Package },
  { id: "machine", label: { en: "Machine Not Working", hi: "मशीन नहीं चल रही" }, icon: Wrench },
  { id: "water", label: { en: "Water Problem", hi: "पानी की दिक्कत" }, icon: Droplets },
  { id: "power", label: { en: "Electricity Problem", hi: "बिजली की दिक्कत" }, icon: Plug },
  { id: "access", label: { en: "Area Not Accessible", hi: "जगह बंद है" }, icon: DoorClosed },
  { id: "safety", label: { en: "Safety Problem", hi: "सुरक्षा की दिक्कत" }, icon: ShieldAlert, safety: true },
  { id: "other", label: { en: "Other Problem", hi: "अन्य दिक्कत" }, icon: HelpCircle },
];

const LOCATIONS: { id: string; label: Bi; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "pantry", label: { en: "Pantry", hi: "पैंट्री" }, icon: Boxes },
  { id: "reception", label: { en: "Reception", hi: "रिसेप्शन" }, icon: Sparkles },
  { id: "office", label: { en: "Office", hi: "ऑफिस" }, icon: DoorClosed },
  { id: "washroom", label: { en: "Washroom", hi: "वॉशरूम" }, icon: Droplets },
  { id: "packing", label: { en: "Packing Area", hi: "पैकिंग एरिया" }, icon: Truck },
  { id: "store", label: { en: "Store Room", hi: "स्टोर रूम" }, icon: Package },
  { id: "other", label: { en: "Other", hi: "अन्य" }, icon: HelpCircle },
];

const T = {
  title: { en: "Report a Problem", hi: "दिक्कत बताएं" },
  emergency: { en: "Emergency Help", hi: "आपातकालीन मदद" },
  myReports: { en: "My Reports", hi: "मेरी रिपोर्ट" },
  step1: { en: "Step 1 · Select Problem", hi: "चरण 1 · दिक्कत चुनें" },
  step2: { en: "Step 2 · Select Location", hi: "चरण 2 · जगह चुनें" },
  step3: { en: "Step 3 · Add Photo or Voice Note", hi: "चरण 3 · फोटो या आवाज़ नोट" },
  step4: { en: "Step 4 · Submit", hi: "चरण 4 · भेजें" },
  next: { en: "Next", hi: "आगे" },
  back: { en: "Back", hi: "पीछे" },
  submit: { en: "Submit Report", hi: "रिपोर्ट भेजें" },
  relatedTask: { en: "Related task (optional)", hi: "जुड़ा काम (वैकल्पिक)" },
  noTask: { en: "No task", hi: "कोई काम नहीं" },
  note: { en: "Short note (optional)", hi: "छोटा नोट (वैकल्पिक)" },
  photo: { en: "Take Photo", hi: "फोटो लें" },
  voice: { en: "Record Voice Note", hi: "आवाज़ नोट रिकॉर्ड करें" },
  urgent: { en: "Urgent", hi: "ज़रूरी" },
  normal: { en: "Normal", hi: "सामान्य" },
  safetyWarn: {
    en: "Stop work and move away from danger. Inform the manager immediately.",
    hi: "काम रोकें और खतरे से दूर हट जाएं। मैनेजर को तुरंत बताएं।",
  },
  sentOk: { en: "Report sent to your manager", hi: "रिपोर्ट मैनेजर को भेज दी" },
  dup: { en: "This problem is already reported and open", hi: "यह दिक्कत पहले से भेजी हुई है" },
  chooseProblem: { en: "Please choose a problem", hi: "पहले दिक्कत चुनें" },
  chooseLocation: { en: "Please choose a location", hi: "पहले जगह चुनें" },
  view: { en: "View", hi: "देखें" },
  managerMsg: { en: "Manager's message", hi: "मैनेजर का संदेश" },
  history: { en: "History", hi: "इतिहास" },
  soon: { en: "Coming soon", hi: "जल्द आएगा" },
  none: { en: "No reports yet", hi: "अभी कोई रिपोर्ट नहीं" },
  alertSent: { en: "Emergency alert sent to manager", hi: "आपातकालीन सूचना मैनेजर को भेजी" },
  location: { en: "Location", hi: "जगह" },
  newReport: { en: "New Report", hi: "नई रिपोर्ट" },
  photoAdded: { en: "Photo added", hi: "फोटो जुड़ी" },
  voiceAdded: { en: "Voice note added", hi: "आवाज़ नोट जुड़ा" },
};

const STATUS_META: Record<
  Status,
  { label: Bi; cls: string; icon: React.ComponentType<{ className?: string }> }
> = {
  sent: { label: { en: "Sent", hi: "भेजा गया" }, cls: "bg-amber-500/15 text-amber-700", icon: Clock },
  checking: {
    label: { en: "Manager Checking", hi: "मैनेजर देख रहे हैं" },
    cls: "bg-amber-500/15 text-amber-700",
    icon: Search,
  },
  coming: {
    label: { en: "Help Coming", hi: "मदद आ रही है" },
    cls: "bg-blue-500/15 text-blue-700",
    icon: Truck,
  },
  solved: {
    label: { en: "Problem Solved", hi: "दिक्कत ठीक हुई" },
    cls: "bg-emerald-500/15 text-emerald-700",
    icon: CheckCircle2,
  },
  closed: {
    label: { en: "Closed", hi: "बंद" },
    cls: "bg-muted text-muted-foreground",
    icon: Ban,
  },
};

type Report = {
  id: string;
  problemId: string;
  locationId: string;
  urgent: boolean;
  note?: string;
  taskTitle?: string;
  status: Status;
  at: string;
  managerMsg?: Bi;
  history: { at: string; text: Bi }[];
};

const SAMPLE: Report[] = [
  {
    id: "P-208",
    problemId: "machine",
    locationId: "pantry",
    urgent: true,
    note: "Water dispenser not cooling",
    status: "coming",
    at: "Today, 10:05 AM",
    managerMsg: { en: "Engineer will reach by 1 PM", hi: "इंजीनियर 1 बजे तक आएगा" },
    history: [
      { at: "10:05 AM", text: { en: "Report sent", hi: "रिपोर्ट भेजी" } },
      { at: "10:20 AM", text: { en: "Manager checking", hi: "मैनेजर देख रहे हैं" } },
      { at: "10:45 AM", text: { en: "Help assigned", hi: "मदद भेजी गई" } },
    ],
  },
  {
    id: "P-207",
    problemId: "supply",
    locationId: "washroom",
    urgent: false,
    note: "Floor cleaner finished",
    taskTitle: "Clean washroom",
    status: "checking",
    at: "Today, 9:30 AM",
    history: [
      { at: "9:30 AM", text: { en: "Report sent", hi: "रिपोर्ट भेजी" } },
      { at: "9:55 AM", text: { en: "Manager checking", hi: "मैनेजर देख रहे हैं" } },
    ],
  },
  {
    id: "P-206",
    problemId: "access",
    locationId: "office",
    urgent: false,
    note: "Meeting room was locked",
    status: "solved",
    at: "Yesterday, 4:10 PM",
    managerMsg: { en: "Key kept at reception", hi: "चाबी रिसेप्शन पर रखी है" },
    history: [
      { at: "4:10 PM", text: { en: "Report sent", hi: "रिपोर्ट भेजी" } },
      { at: "4:35 PM", text: { en: "Problem solved", hi: "दिक्कत ठीक हुई" } },
    ],
  },
  {
    id: "P-205",
    problemId: "safety",
    locationId: "packing",
    urgent: true,
    note: "Wet floor near packing table",
    status: "closed",
    at: "Yesterday, 11:00 AM",
    managerMsg: { en: "Area dried and mat placed", hi: "जगह सुखाई और मैट लगाई" },
    history: [
      { at: "11:00 AM", text: { en: "Report sent", hi: "रिपोर्ट भेजी" } },
      { at: "11:10 AM", text: { en: "Help came", hi: "मदद आई" } },
      { at: "12:05 PM", text: { en: "Closed by manager", hi: "मैनेजर ने बंद किया" } },
    ],
  },
];

const OPEN: Status[] = ["sent", "checking", "coming"];

export function PantryCleaningReportProblem({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const t = (v: Bi) => v[lang];
  const [reports, setReports] = useState<Report[]>(SAMPLE);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [problemId, setProblemId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>("none");
  const [note, setNote] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [voice, setVoice] = useState(false);
  const [detail, setDetail] = useState<Report | null>(null);

  const problem = PROBLEMS.find((p) => p.id === problemId) ?? null;
  const openCount = reports.filter((r) => OPEN.includes(r.status)).length;
  const soon = () => toast.info(t(T.soon));

  const myTasks = useMemo(
    () => SAMPLE_TASKS.map((x) => x.title[lang]).slice(0, 8),
    [lang],
  );

  const start = (pid?: string) => {
    setStep(pid ? 2 : 1);
    setProblemId(pid ?? null);
    setLocationId(null);
    setTaskTitle("none");
    setNote("");
    setUrgent(pid === "safety");
    setPhoto(false);
    setVoice(false);
    setOpen(true);
  };

  const submit = () => {
    if (!problem) return toast.error(t(T.chooseProblem));
    if (!locationId) return toast.error(t(T.chooseLocation));
    const dup = reports.some(
      (r) => r.problemId === problem.id && r.locationId === locationId && OPEN.includes(r.status),
    );
    if (dup) {
      toast.error(t(T.dup));
      return;
    }
    const now = new Date().toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setReports((prev) => [
      {
        id: `P-${209 + prev.length}`,
        problemId: problem.id,
        locationId,
        urgent: urgent || !!problem.safety,
        note: note || undefined,
        taskTitle: taskTitle === "none" ? undefined : taskTitle,
        status: "sent",
        at: now,
        history: [{ at: now, text: { en: "Report sent", hi: "रिपोर्ट भेजी" } }],
      },
      ...prev,
    ]);
    setOpen(false);
    toast.success(t(T.sentOk));
  };

  const emergency = () => toast.error(t(T.alertSent));

  const Tile = ({
    icon: Icon,
    label,
    active,
    danger,
    onClick,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    danger?: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : danger
            ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/10"
            : "border-border bg-background hover:bg-muted"
      }`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          danger ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-9 w-9" />
      </span>
      <span className="text-center text-sm font-semibold leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="space-y-3 rounded-xl border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <AlertTriangle className="h-7 w-7 text-destructive" />
            {t(T.title)}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <LangSwitch lang={lang} setLang={setLang} />
            <Button size="lg" variant="destructive" className="h-12" onClick={emergency}>
              <Siren className="mr-2 h-5 w-5" /> {t(T.emergency)}
            </Button>
            <Button size="lg" className="h-12" onClick={() => start()}>
              {t(T.newReport)}
            </Button>
          </div>
        </div>
        <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-3">
          <div className="text-3xl font-bold tabular-nums text-amber-600">{openCount}</div>
          <div className="text-sm text-muted-foreground">
            {lang === "hi" ? "खुली रिपोर्ट" : "Open reports"} · {t(T.myReports)}
          </div>
        </div>
      </div>

      {/* categories */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROBLEMS.map((p) => (
          <Tile
            key={p.id}
            icon={p.icon}
            label={t(p.label)}
            danger={p.safety}
            onClick={() => start(p.id)}
          />
        ))}
      </div>

      {/* my reports */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">{t(T.myReports)}</h2>
        {reports.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-lg text-muted-foreground">
              {t(T.none)}
            </CardContent>
          </Card>
        )}
        {reports.map((r) => {
          const p = PROBLEMS.find((x) => x.id === r.problemId)!;
          const loc = LOCATIONS.find((x) => x.id === r.locationId)!;
          const meta = STATUS_META[r.status];
          const danger = r.urgent || p.safety;
          return (
            <Card
              key={r.id}
              className={`border-2 ${
                r.status === "solved"
                  ? "border-emerald-500/50"
                  : r.status === "coming"
                    ? "border-blue-500/50"
                    : danger && OPEN.includes(r.status)
                      ? "border-destructive/60"
                      : "border-border"
              }`}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                      danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <p.icon className="h-9 w-9" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold">{t(p.label)}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          r.urgent
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.urgent ? t(T.urgent) : t(T.normal)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(loc.label)} · {r.at}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}
                    >
                      <meta.icon className="h-3.5 w-3.5" />
                      {t(meta.label)}
                    </span>
                  </div>
                </div>
                {r.managerMsg && (
                  <p className="rounded-lg bg-muted p-3 text-sm">
                    <span className="font-semibold">{t(T.managerMsg)}: </span>
                    {t(r.managerMsg)}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full"
                  onClick={() => setDetail(r)}
                >
                  <Eye className="mr-2 h-5 w-5" /> {t(T.view)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* wizard */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {step === 1 ? t(T.step1) : step === 2 ? t(T.step2) : step === 3 ? t(T.step3) : t(T.step4)}
            </DialogTitle>
          </DialogHeader>

          {problem?.safety && (
            <div className="space-y-3 rounded-xl border-2 border-destructive bg-destructive/10 p-4">
              <p className="flex items-start gap-2 text-base font-semibold text-destructive">
                <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0" />
                {t(T.safetyWarn)}
              </p>
              <Button
                variant="destructive"
                size="lg"
                className="h-16 w-full text-lg"
                onClick={emergency}
              >
                <Siren className="mr-2 h-6 w-6" /> {t(T.emergency)}
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PROBLEMS.map((p) => (
                  <Tile
                    key={p.id}
                    icon={p.icon}
                    label={t(p.label)}
                    danger={p.safety}
                    active={problemId === p.id}
                    onClick={() => {
                      setProblemId(p.id);
                      if (p.safety) setUrgent(true);
                    }}
                  />
                ))}
              </div>
              <Button
                size="lg"
                className="h-16 w-full text-lg"
                onClick={() => (problemId ? setStep(2) : toast.error(t(T.chooseProblem)))}
              >
                {t(T.next)}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {LOCATIONS.map((l) => (
                  <Tile
                    key={l.id}
                    icon={l.icon}
                    label={t(l.label)}
                    active={locationId === l.id}
                    onClick={() => setLocationId(l.id)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-14" onClick={() => setStep(1)}>
                  {t(T.back)}
                </Button>
                <Button
                  size="lg"
                  className="h-14"
                  onClick={() => (locationId ? setStep(3) : toast.error(t(T.chooseLocation)))}
                >
                  {t(T.next)}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Button
                variant={photo ? "secondary" : "outline"}
                size="lg"
                className="h-16 w-full text-base"
                onClick={() => {
                  setPhoto(true);
                  soon();
                }}
              >
                <Camera className="mr-2 h-7 w-7" /> {photo ? t(T.photoAdded) : t(T.photo)}
              </Button>
              <Button
                variant={voice ? "secondary" : "outline"}
                size="lg"
                className="h-16 w-full text-base"
                onClick={() => {
                  setVoice(true);
                  soon();
                }}
              >
                <Mic className="mr-2 h-7 w-7" /> {voice ? t(T.voiceAdded) : t(T.voice)}
              </Button>

              <div className="space-y-2">
                <p className="text-sm font-semibold">{t(T.relatedTask)}</p>
                <Select value={taskTitle} onValueChange={setTaskTitle}>
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t(T.noTask)}</SelectItem>
                    {myTasks.map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t(T.note)}
                className="min-h-20 text-base"
              />

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-14" onClick={() => setStep(2)}>
                  {t(T.back)}
                </Button>
                <Button size="lg" className="h-14" onClick={() => setStep(4)}>
                  {t(T.next)}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && problem && locationId && (
            <div className="space-y-4">
              <div className="space-y-1 rounded-xl bg-muted p-4">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <problem.icon className="h-6 w-6 text-primary" />
                  {t(problem.label)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(T.location)}: {t(LOCATIONS.find((l) => l.id === locationId)!.label)}
                </p>
                {taskTitle !== "none" && (
                  <p className="text-sm text-muted-foreground">{taskTitle}</p>
                )}
                {note && <p className="text-sm">{note}</p>}
                <p className="text-xs text-muted-foreground">
                  {[photo && t(T.photoAdded), voice && t(T.voiceAdded)].filter(Boolean).join(" · ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUrgent(false)}
                  disabled={!!problem.safety}
                  className={`rounded-xl border-2 p-4 text-base font-bold disabled:opacity-50 ${
                    !urgent ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  {t(T.normal)}
                </button>
                <button
                  onClick={() => setUrgent(true)}
                  className={`rounded-xl border-2 p-4 text-base font-bold ${
                    urgent ? "border-destructive bg-destructive/10 text-destructive" : "border-border"
                  }`}
                >
                  {t(T.urgent)}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-16" onClick={() => setStep(3)}>
                  {t(T.back)}
                </Button>
                <Button size="lg" className="h-16 text-lg" onClick={submit}>
                  {t(T.submit)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          {detail &&
            (() => {
              const p = PROBLEMS.find((x) => x.id === detail.problemId)!;
              const loc = LOCATIONS.find((x) => x.id === detail.locationId)!;
              const meta = STATUS_META[detail.status];
              return (
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <p.icon className="h-6 w-6 text-primary" />
                      {t(p.label)}
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    {t(loc.label)} · {detail.at} · {detail.urgent ? t(T.urgent) : t(T.normal)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${meta.cls}`}
                  >
                    <meta.icon className="h-4 w-4" />
                    {t(meta.label)}
                  </span>
                  {detail.taskTitle && <p className="text-sm">{detail.taskTitle}</p>}
                  {detail.note && <p className="rounded-lg bg-muted p-3 text-sm">{detail.note}</p>}
                  {detail.managerMsg && (
                    <p className="rounded-lg border-2 border-blue-500/40 bg-blue-500/5 p-3 text-sm">
                      <span className="font-semibold">{t(T.managerMsg)}: </span>
                      {t(detail.managerMsg)}
                    </p>
                  )}
                  <div>
                    <p className="mb-2 text-sm font-semibold">{t(T.history)}</p>
                    <ul className="space-y-1">
                      {detail.history.map((h, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          {h.at} — {t(h.text)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 w-full"
                    onClick={soon}
                  >
                    <PhoneCall className="mr-2 h-5 w-5" />
                    {lang === "hi" ? "मैनेजर को कॉल करें" : "Call Manager"}
                  </Button>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
