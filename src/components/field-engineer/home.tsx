import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Phone,
  MapPin,
  Truck,
  FileText,
  Receipt,
  CalendarDays,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bell,
  Mic,
  Camera,
  Video,
  Play,
  LifeBuoy,
  Languages,
  User,
} from "lucide-react";
import { JOBS, PRIORITY_LABEL, priorityTone, type Bi, type Lang, type WorkStage } from "./data";

type SectionKey = "home" | "jobs" | "schedule" | "report" | "expenses" | "help";

const L = {
  hello: { en: "Hello", hi: "नमस्ते" },
  available: { en: "Available", hi: "उपलब्ध" },
  busy: { en: "Busy", hi: "व्यस्त" },
  offDuty: { en: "Off Duty", hi: "ड्यूटी पर नहीं" },
  jobsToday: { en: "Jobs Today", hi: "आज के कार्य" },
  urgentJobs: { en: "Urgent Jobs", hi: "अत्यावश्यक कार्य" },
  nextVisit: { en: "Next Visit", hi: "अगली विज़िट" },
  pendingReports: { en: "Pending Reports", hi: "लंबित रिपोर्ट" },
  pendingExpenses: { en: "Pending Expenses", hi: "लंबित खर्च" },
  nextJob: { en: "Your Next Job", hi: "आपका अगला कार्य" },
  rmInstructions: { en: "Instructions", hi: "निर्देश" },
  callCustomer: { en: "Call Customer", hi: "ग्राहक को कॉल करें" },
  openLocation: { en: "Open Location", hi: "लोकेशन खोलें" },
  startTravel: { en: "Start Travel", hi: "यात्रा शुरू करें" },
  viewJob: { en: "View Job", hi: "कार्य देखें" },
  quickActions: { en: "Quick Actions", hi: "तुरंत कार्य" },
  startNextJob: { en: "Start Next Job", hi: "अगला कार्य शुरू करें" },
  todaysVisits: { en: "Today's Visits", hi: "आज की विज़िट" },
  submitReport: { en: "Submit Report", hi: "रिपोर्ट जमा करें" },
  addExpense: { en: "Add Expense", hi: "खर्च जोड़ें" },
  jobStatus: { en: "Update Job Status", hi: "कार्य की स्थिति बदलें" },
  going: { en: "Going to Site", hi: "साइट जा रहे हैं" },
  reached: { en: "Reached Site", hi: "साइट पर पहुँचे" },
  started: { en: "Work Started", hi: "कार्य शुरू" },
  completedWork: { en: "Work Completed", hi: "कार्य पूर्ण" },
  needHelp: { en: "Need Help", hi: "मदद चाहिए" },
  attachments: { en: "Add proof (optional)", hi: "प्रमाण जोड़ें (वैकल्पिक)" },
  voiceNote: { en: "Voice Note", hi: "वॉइस नोट" },
  photo: { en: "Photo", hi: "फोटो" },
  video: { en: "Video", hi: "वीडियो" },
  shortNote: { en: "Short note (optional)", hi: "छोटी टिप्पणी (वैकल्पिक)" },
  urgentAlert: { en: "Urgent Job", hi: "अत्यावश्यक कार्य" },
  callNow: { en: "Call Now", hi: "अभी कॉल करें" },
  reminders: { en: "Reminders", hi: "रिमाइंडर" },
  remUpcoming: { en: "Upcoming visit", hi: "आने वाली विज़िट" },
  remReport: { en: "Work report pending", hi: "कार्य रिपोर्ट लंबित" },
  remExpense: { en: "Expense bill missing", hi: "खर्च का बिल नहीं लगा" },
  ticket: { en: "Ticket", hi: "टिकट" },
  savedGoing: { en: "Status saved: Going to Site", hi: "स्थिति सहेजी: साइट जा रहे हैं" },
  savedReached: { en: "Arrival time recorded", hi: "पहुँचने का समय दर्ज हुआ" },
  savedStarted: { en: "Work started", hi: "कार्य शुरू हुआ" },
  savedCompleted: {
    en: "Work completed — please submit the work report",
    hi: "कार्य पूर्ण — कृपया कार्य रिपोर्ट जमा करें",
  },
  savedHelp: {
    en: "Technical Support has been alerted",
    hi: "तकनीकी सहायता को सूचित कर दिया गया है",
  },
  calling: { en: "Calling", hi: "कॉल कर रहे हैं" },
  locationSoon: { en: "Location will open in the map app", hi: "लोकेशन मैप ऐप में खुलेगी" },
  voiceSoon: { en: "Voice note added (sample)", hi: "वॉइस नोट जोड़ा गया (नमूना)" },
  photoSoon: { en: "Photo added (sample)", hi: "फोटो जोड़ी गई (नमूना)" },
  videoSoon: { en: "Video added (sample)", hi: "वीडियो जोड़ा गया (नमूना)" },
  statusNow: { en: "Current status", hi: "वर्तमान स्थिति" },
} satisfies Record<string, Bi>;

const AVAIL: { key: "available" | "busy" | "offDuty"; tone: string }[] = [
  { key: "available", tone: "bg-emerald-600 text-white" },
  { key: "busy", tone: "bg-primary text-primary-foreground" },
  { key: "offDuty", tone: "bg-muted text-muted-foreground" },
];

export function FieldEngineerHome({
  lang,
  setLang,
  onGo,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  onGo: (k: SectionKey) => void;
}) {
  const [avail, setAvail] = useState<"available" | "busy" | "offDuty">("available");
  const [stage, setStage] = useState<WorkStage>("none");
  const [note, setNote] = useState("");

  const next = JOBS[0];
  const urgent = JOBS.find((j) => j.priority === "safety");
  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const cards = [
    { label: L.jobsToday[lang], value: 3, icon: CalendarDays, tone: "text-primary" },
    { label: L.urgentJobs[lang], value: 1, icon: AlertTriangle, tone: "text-destructive" },
    { label: L.nextVisit[lang], value: next.slot[lang], icon: Clock, tone: "text-primary" },
    { label: L.pendingReports[lang], value: 2, icon: FileText, tone: "text-amber-600" },
    { label: L.pendingExpenses[lang], value: 2, icon: Receipt, tone: "text-amber-600" },
  ];

  function setStatus(s: WorkStage, msg: Bi) {
    setStage(s);
    toast.success(msg[lang]);
    if (s === "completed") onGo("report");
  }

  const statusButtons: {
    key: WorkStage;
    label: Bi;
    msg: Bi;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }[] = [
    {
      key: "going",
      label: L.going,
      msg: L.savedGoing,
      icon: Truck,
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    {
      key: "reached",
      label: L.reached,
      msg: L.savedReached,
      icon: MapPin,
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    {
      key: "started",
      label: L.started,
      msg: L.savedStarted,
      icon: Wrench,
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    {
      key: "completed",
      label: L.completedWork,
      msg: L.savedCompleted,
      icon: CheckCircle2,
      className: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    {
      key: "help",
      label: L.needHelp,
      msg: L.savedHelp,
      icon: LifeBuoy,
      className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
  ];

  const currentStatus = statusButtons.find((s) => s.key === stage);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">{L.hello[lang]}, Ramesh</h1>
              <p className="truncate text-sm text-muted-foreground">{today}</p>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-background p-1">
            <Languages className="ml-1 h-4 w-4 text-muted-foreground" />
            <Button
              size="sm"
              variant={lang === "en" ? "default" : "ghost"}
              onClick={() => setLang("en")}
            >
              EN
            </Button>
            <Button
              size="sm"
              variant={lang === "hi" ? "default" : "ghost"}
              onClick={() => setLang("hi")}
            >
              हिन्दी
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {AVAIL.map((a) => (
            <button
              key={a.key}
              onClick={() => setAvail(a.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                avail === a.key ? a.tone : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {L[a.key][lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent alert */}
      {urgent && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="font-bold">{L.urgentAlert[lang]}</span>
            </div>
            <div>
              <div className="text-base font-semibold">{urgent.store[lang]}</div>
              <div className="text-sm text-muted-foreground">{urgent.issue[lang]}</div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                size="lg"
                variant="destructive"
                className="h-12 text-base"
                onClick={() => toast.success(`${L.calling[lang]} ${urgent.owner}`)}
              >
                <Phone className="mr-2 h-5 w-5" /> {L.callNow[lang]}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 text-base"
                onClick={() => onGo("jobs")}
              >
                <Wrench className="mr-2 h-5 w-5" /> {L.viewJob[lang]}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <Icon className={`h-6 w-6 ${tone}`} />
              <div className="mt-2 text-xl font-bold tabular-nums">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next job — largest */}
      <Card className="border-2 border-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" /> {L.nextJob[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold">{next.store[lang]}</span>
              <Badge className={priorityTone(next.priority)}>
                {PRIORITY_LABEL[next.priority][lang]}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {L.ticket[lang]} {next.id} · {next.owner}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
              {next.machine[lang]}
            </div>
            <div className="text-base">{next.issue[lang]}</div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {next.address[lang]}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              {next.slot[lang]}
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {L.rmInstructions[lang]} · {next.rmName}
            </div>
            <p className="mt-1 text-sm">{next.rmNote[lang]}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              size="lg"
              className="h-14 text-base"
              onClick={() => toast.success(`${L.calling[lang]} ${next.owner}`)}
            >
              <Phone className="mr-2 h-5 w-5" /> {L.callCustomer[lang]}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 text-base"
              onClick={() => toast.success(L.locationSoon[lang])}
            >
              <MapPin className="mr-2 h-5 w-5" /> {L.openLocation[lang]}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 text-base"
              onClick={() => setStatus("going", L.savedGoing)}
            >
              <Truck className="mr-2 h-5 w-5" /> {L.startTravel[lang]}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 text-base"
              onClick={() => onGo("jobs")}
            >
              <Wrench className="mr-2 h-5 w-5" /> {L.viewJob[lang]}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{L.quickActions[lang]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: L.startNextJob[lang],
                icon: Play,
                onClick: () => setStatus("going", L.savedGoing),
              },
              {
                label: L.todaysVisits[lang],
                icon: CalendarDays,
                onClick: () => onGo("schedule"),
              },
              { label: L.submitReport[lang], icon: FileText, onClick: () => onGo("report") },
              { label: L.addExpense[lang], icon: Receipt, onClick: () => onGo("expenses") },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 text-center transition-colors hover:bg-muted"
              >
                <a.icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{L.jobStatus[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStatus && (
            <div className="text-sm text-muted-foreground">
              {L.statusNow[lang]}:{" "}
              <span className="font-semibold text-foreground">{currentStatus.label[lang]}</span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {statusButtons.map((s) => (
              <button
                key={s.key}
                onClick={() => setStatus(s.key, s.msg)}
                className={`flex h-14 items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors ${
                  stage === s.key ? s.className : "border bg-background hover:bg-muted"
                }`}
              >
                <s.icon className="h-5 w-5" /> {s.label[lang]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">{L.attachments[lang]}</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => toast.success(L.voiceSoon[lang])}
              >
                <Mic className="mr-2 h-5 w-5" /> {L.voiceNote[lang]}
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => toast.success(L.photoSoon[lang])}
              >
                <Camera className="mr-2 h-5 w-5" /> {L.photo[lang]}
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => toast.success(L.videoSoon[lang])}
              >
                <Video className="mr-2 h-5 w-5" /> {L.video[lang]}
              </Button>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={L.shortNote[lang]}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> {L.reminders[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              title: L.remUpcoming[lang],
              detail: `${JOBS[1].store[lang]} · ${JOBS[1].slot[lang]}`,
              tone: "text-primary",
              icon: Clock,
              go: "schedule" as SectionKey,
            },
            {
              title: L.remReport[lang],
              detail: `${L.ticket[lang]} ${JOBS[2].id} · ${JOBS[2].store[lang]}`,
              tone: "text-amber-600",
              icon: FileText,
              go: "report" as SectionKey,
            },
            {
              title: L.remExpense[lang],
              detail: lang === "hi" ? "बेयरिंग किट ₹1,850" : "Bearing kit ₹1,850",
              tone: "text-amber-600",
              icon: Receipt,
              go: "expenses" as SectionKey,
            },
          ].map((r) => (
            <button
              key={r.title}
              onClick={() => onGo(r.go)}
              className="flex w-full items-center gap-3 rounded-md border bg-muted/20 p-3 text-left transition-colors hover:bg-muted"
            >
              <r.icon className={`h-5 w-5 shrink-0 ${r.tone}`} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{r.title}</div>
                <div className="truncate text-xs text-muted-foreground">{r.detail}</div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
