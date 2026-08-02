// Field Engineer — "My Jobs" (mobile-first, bilingual, simple).
// Uses the shared JOBS data so every status change stays on the same master ticket.
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  LifeBuoy,
  MapPin,
  Mic,
  Phone,
  Search,
  Truck,
  Video,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  JOBS,
  JOB_STATUS_LABEL,
  PRIORITY_LABEL,
  type Bi,
  type Job,
  type Lang,
  type WorkStage,
} from "@/components/field-engineer/data";

type TabKey = "today" | "upcoming" | "pending" | "completed";

const T = {
  title: { en: "My Jobs", hi: "मेरे कार्य" },
  sub: {
    en: "Jobs given to you by Relationship Manager or Technical Support.",
    hi: "रिलेशनशिप मैनेजर या टेक्निकल सपोर्ट द्वारा दिए गए कार्य।",
  },
  jobsToday: { en: "Jobs Today", hi: "आज के कार्य" },
  urgent: { en: "Urgent Jobs", hi: "अत्यावश्यक कार्य" },
  pending: { en: "Pending Jobs", hi: "लंबित कार्य" },
  completed: { en: "Completed Jobs", hi: "पूर्ण कार्य" },
  tabs: {
    today: { en: "Today", hi: "आज" },
    upcoming: { en: "Upcoming", hi: "आगामी" },
    pending: { en: "Pending", hi: "लंबित" },
    completed: { en: "Completed", hi: "पूर्ण" },
  },
  search: { en: "Search customer, job no. or machine", hi: "ग्राहक, कार्य नं. या मशीन खोजें" },
  call: { en: "Call Customer", hi: "ग्राहक को कॉल करें" },
  location: { en: "Open Location", hi: "पता खोलें" },
  startJob: { en: "Start Job", hi: "कार्य शुरू करें" },
  details: { en: "View Details", hi: "पूरी जानकारी" },
  none: { en: "No jobs here.", hi: "यहाँ कोई कार्य नहीं।" },
  statusNow: { en: "Status", hi: "स्थिति" },
  changeStatus: { en: "Change Status", hi: "स्थिति बदलें" },
  phone: { en: "Phone", hi: "फ़ोन" },
  address: { en: "Full Address", hi: "पूरा पता" },
  machine: { en: "Machine", hi: "मशीन" },
  model: { en: "Model", hi: "मॉडल" },
  serial: { en: "Serial No.", hi: "सीरियल नं." },
  problem: { en: "Problem", hi: "समस्या" },
  media: { en: "Photos & Videos", hi: "फ़ोटो और वीडियो" },
  tsNotes: { en: "Technical Support Notes", hi: "टेक्निकल सपोर्ट के नोट्स" },
  rmNotes: { en: "Relationship Manager Instructions", hi: "रिलेशनशिप मैनेजर के निर्देश" },
  parts: { en: "Parts / Tools Suggested", hi: "सुझाए गए पार्ट्स / औज़ार" },
  visit: { en: "Visit Date & Time", hi: "विज़िट तिथि और समय" },
  history: { en: "Previous Service History", hi: "पिछली सर्विस का इतिहास" },
  photo: { en: "Add Photo", hi: "फ़ोटो जोड़ें" },
  video: { en: "Add Video", hi: "वीडियो जोड़ें" },
  voice: { en: "Voice Note", hi: "वॉइस नोट" },
  soon: { en: "Will be enabled soon", hi: "जल्द चालू होगा" },
  ticket: { en: "Ticket", hi: "टिकट" },
  reschedNew: { en: "New date", hi: "नई तिथि" },
  reschedTime: { en: "New time", hi: "नया समय" },
  reason: { en: "Reason (short)", hi: "कारण (छोटा)" },
  save: { en: "Save", hi: "सहेजें" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
  reschedTitle: { en: "Reschedule Visit", hi: "विज़िट पुनर्निर्धारित करें" },
  callToast: { en: "Calling", hi: "कॉल किया जा रहा है" },
  mapToast: { en: "Opening map for", hi: "नक्शा खोला जा रहा है" },
  helpToast: {
    en: "Alert sent to Technical Support",
    hi: "टेक्निकल सपोर्ट को अलर्ट भेजा गया",
  },
  reportToast: {
    en: "Work done. Please submit work report.",
    hi: "कार्य पूर्ण। कृपया वर्क रिपोर्ट भेजें।",
  },
  savedToast: { en: "Saved on ticket", hi: "टिकट पर सहेजा गया" },
} as const;

const STAGE: { key: WorkStage | "received" | "resched"; label: Bi; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "received", label: { en: "Job Received", hi: "कार्य प्राप्त" }, icon: FileText },
  { key: "going", label: { en: "Going to Site", hi: "साइट जा रहे हैं" }, icon: Truck },
  { key: "reached", label: { en: "Reached Site", hi: "साइट पहुँचे" }, icon: MapPin },
  { key: "started", label: { en: "Work Started", hi: "कार्य शुरू" }, icon: Wrench },
  { key: "help", label: { en: "Need Help", hi: "मदद चाहिए" }, icon: LifeBuoy },
  { key: "completed", label: { en: "Work Completed", hi: "कार्य पूर्ण" }, icon: CheckCircle2 },
  { key: "resched", label: { en: "Visit Rescheduled", hi: "विज़िट पुनर्निर्धारित" }, icon: Clock },
];

type Extra = {
  tab: TabKey;
  date: Bi;
  model: string;
  serial: string;
  tsNote: Bi;
  parts: Bi;
  history: Bi[];
};

const EXTRA: Record<string, Extra> = {
  "FE-2041": {
    tab: "today",
    date: { en: "Today, 10:00 AM", hi: "आज, सुबह 10:00" },
    model: "CC-W12X",
    serial: "SN-W12-88214",
    tsNote: {
      en: "Remote check done. Error E04 means drum imbalance. Check bolts and shock absorber.",
      hi: "रिमोट जाँच पूर्ण। E04 का मतलब ड्रम असंतुलन। बोल्ट और शॉक अब्ज़ॉर्बर जाँचें।",
    },
    parts: { en: "Drum bolt set, spanner kit, level gauge", hi: "ड्रम बोल्ट सेट, स्पैनर किट, लेवल गेज" },
    history: [
      { en: "12 Jun — Drum belt replaced", hi: "12 जून — ड्रम बेल्ट बदली गई" },
      { en: "02 Mar — Routine service", hi: "02 मार्च — नियमित सर्विस" },
    ],
  },
  "FE-2042": {
    tab: "today",
    date: { en: "Today, 12:30 PM", hi: "आज, दोपहर 12:30" },
    model: "CC-D10H",
    serial: "SN-D10-44190",
    tsNote: {
      en: "Heating coil reading is zero. Likely coil failure or thermostat cut.",
      hi: "हीटिंग कॉइल रीडिंग शून्य। संभवतः कॉइल ख़राब या थर्मोस्टेट कट।",
    },
    parts: { en: "Heating coil, multimeter, thermostat", hi: "हीटिंग कॉइल, मल्टीमीटर, थर्मोस्टेट" },
    history: [{ en: "20 May — Filter cleaning", hi: "20 मई — फ़िल्टर सफ़ाई" }],
  },
  "FE-2043": {
    tab: "upcoming",
    date: { en: "Tomorrow, 3:00 PM", hi: "कल, दोपहर 3:00" },
    model: "CC-SI4",
    serial: "SN-SI4-11002",
    tsNote: {
      en: "Owner says pressure drops after 20 minutes. Clean boiler filter first.",
      hi: "मालिक के अनुसार 20 मिनट बाद प्रेशर गिरता है। पहले बॉयलर फ़िल्टर साफ़ करें।",
    },
    parts: { en: "Boiler filter, steam valve washer", hi: "बॉयलर फ़िल्टर, स्टीम वाल्व वॉशर" },
    history: [{ en: "08 Apr — Boiler descaling", hi: "08 अप्रैल — बॉयलर डीस्केलिंग" }],
  },
  "FE-2036": {
    tab: "pending",
    date: { en: "On hold — part awaited", hi: "रोका गया — पार्ट की प्रतीक्षा" },
    model: "CC-W08S",
    serial: "SN-W08-77310",
    tsNote: {
      en: "Control board ordered. Visit only after part reaches store.",
      hi: "कंट्रोल बोर्ड ऑर्डर हो गया। पार्ट स्टोर पहुँचने के बाद ही विज़िट करें।",
    },
    parts: { en: "Control board, screwdriver kit", hi: "कंट्रोल बोर्ड, स्क्रूड्राइवर किट" },
    history: [{ en: "18 Jul — Wiring check", hi: "18 जुलाई — वायरिंग जाँच" }],
  },
  "FE-2039": {
    tab: "completed",
    date: { en: "Yesterday, 11:00 AM", hi: "कल, सुबह 11:00" },
    model: "CC-SETUP",
    serial: "SN-SET-90011",
    tsNote: { en: "Installation approved. No pending point.", hi: "इंस्टॉलेशन स्वीकृत। कोई बिंदु लंबित नहीं।" },
    parts: { en: "Installation kit", hi: "इंस्टॉलेशन किट" },
    history: [{ en: "Store opened last month", hi: "स्टोर पिछले महीने खुला" }],
  },
};

function tabOf(job: Job): TabKey {
  return EXTRA[job.id]?.tab ?? "upcoming";
}

function priorityBadge(job: Job) {
  return job.priority === "safety"
    ? "bg-destructive text-destructive-foreground"
    : job.priority === "breakdown"
      ? "bg-amber-500 text-white"
      : "bg-muted text-muted-foreground";
}

function cardTone(job: Job, tab: TabKey) {
  if (tab === "completed") return "border-emerald-300 bg-emerald-50/60";
  if (job.priority === "safety") return "border-destructive bg-destructive/5";
  if (tab === "pending") return "border-amber-300 bg-amber-50/60";
  if (job.status === "transit") return "border-primary bg-primary/5";
  return "border-border bg-muted/20";
}

export function FieldEngineerMyJobs({ lang, onGo }: { lang: Lang; onGo?: (s: "report") => void }) {
  const [tab, setTab] = useState<TabKey>("today");
  const [query, setQuery] = useState("");
  const [stages, setStages] = useState<Record<string, string>>({});
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reschedId, setReschedId] = useState<string | null>(null);
  const [reDate, setReDate] = useState("");
  const [reTime, setReTime] = useState("");
  const [reReason, setReReason] = useState("");

  const counts = useMemo(() => {
    const t = JOBS.filter((j) => tabOf(j) === "today").length;
    return {
      today: t,
      urgent: JOBS.filter((j) => j.priority === "safety").length,
      pending: JOBS.filter((j) => tabOf(j) === "pending").length,
      completed: JOBS.filter((j) => tabOf(j) === "completed").length,
    };
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS.filter((j) => tabOf(j) === tab)
      .filter(
        (j) =>
          !q ||
          j.id.toLowerCase().includes(q) ||
          j.owner.toLowerCase().includes(q) ||
          j.store[lang].toLowerCase().includes(q) ||
          j.store.en.toLowerCase().includes(q) ||
          j.machine[lang].toLowerCase().includes(q) ||
          j.machine.en.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const rank = (j: Job) => (j.priority === "safety" ? 0 : j.priority === "breakdown" ? 1 : 2);
        if (rank(a) !== rank(b)) return rank(a) - rank(b);
        return a.id.localeCompare(b.id); // oldest ticket number first
      });
  }, [tab, query, lang]);

  const detail = JOBS.find((j) => j.id === detailId) ?? null;

  const setStage = (job: Job, key: string, label: Bi) => {
    if (key === "resched") {
      setReschedId(job.id);
      return;
    }
    setStages((s) => ({ ...s, [job.id]: key }));
    const stamp = new Date().toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (key === "help") {
      toast.error(`${T.helpToast[lang]} · ${job.id}`);
      return;
    }
    if (key === "completed") {
      toast.success(`${T.reportToast[lang]} · ${job.id}`);
      onGo?.("report");
      return;
    }
    if (key === "going" || key === "reached" || key === "started") {
      toast.success(`${label[lang]} · ${stamp} · ${T.ticket[lang]} ${job.id}`);
      return;
    }
    toast.success(`${label[lang]} · ${T.ticket[lang]} ${job.id}`);
  };

  const kpis = [
    { label: T.jobsToday[lang], value: counts.today, tone: "text-primary", tab: "today" as TabKey },
    { label: T.urgent[lang], value: counts.urgent, tone: "text-destructive", tab: "today" as TabKey },
    { label: T.pending[lang], value: counts.pending, tone: "text-amber-600", tab: "pending" as TabKey },
    {
      label: T.completed[lang],
      value: counts.completed,
      tone: "text-emerald-600",
      tab: "completed" as TabKey,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{T.title[lang]}</h1>
        <p className="text-sm text-muted-foreground">{T.sub[lang]}</p>
      </div>

      {/* KPI cards double as quick filters */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => setTab(k.tab)} className="text-left">
            <Card className="h-full">
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${k.tone}`}>{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={T.search[lang]}
          className="h-12 pl-9 text-base"
        />
      </div>

      {/* Four large tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["today", "upcoming", "pending", "completed"] as TabKey[]).map((k) => (
          <Button
            key={k}
            variant={tab === k ? "default" : "outline"}
            onClick={() => setTab(k)}
            className="h-12 text-sm font-semibold"
          >
            {T.tabs[k][lang]}
          </Button>
        ))}
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {list.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {T.none[lang]}
            </CardContent>
          </Card>
        )}

        {list.map((job) => {
          const jt = tabOf(job);
          const extra = EXTRA[job.id];
          const stageKey = stages[job.id];
          const stageLabel = STAGE.find((s) => s.key === stageKey)?.label;
          return (
            <Card key={job.id} className={`border-2 ${cardTone(job, jt)}`}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={priorityBadge(job)}>
                    {job.priority === "normal" ? PRIORITY_LABEL.normal[lang] : PRIORITY_LABEL[job.priority][lang]}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">{job.id}</span>
                </div>

                <div>
                  <div className="text-base font-bold">{job.store[lang]}</div>
                  <div className="text-sm text-muted-foreground">{job.owner}</div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{job.machine[lang]}</span>
                  </div>
                  <div>{job.issue[lang]}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{job.city[lang]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{extra?.date[lang] ?? job.slot[lang]}</span>
                  </div>
                </div>

                <div className="rounded-md bg-background/70 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{T.statusNow[lang]}: </span>
                  <span className="font-semibold">
                    {stageLabel ? stageLabel[lang] : JOB_STATUS_LABEL[job.status][lang]}
                  </span>
                </div>

                {/* Large action buttons */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    className="h-12 text-base"
                    onClick={() => toast.success(`${T.callToast[lang]} ${job.owner} · ${job.phone}`)}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    {T.call[lang]}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 text-base"
                    onClick={() => toast(`${T.mapToast[lang]} ${job.store[lang]}`)}
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    {T.location[lang]}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 border-primary text-base text-primary"
                    onClick={() => setStage(job, "going", STAGE[1].label)}
                  >
                    <Truck className="mr-2 h-5 w-5" />
                    {T.startJob[lang]}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 text-base"
                    onClick={() => setDetailId(job.id)}
                  >
                    <ChevronRight className="mr-2 h-5 w-5" />
                    {T.details[lang]}
                  </Button>
                </div>

                {/* Simple status buttons */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {T.changeStatus[lang]}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {STAGE.map((s) => {
                      const Icon = s.icon;
                      const active = stageKey === s.key;
                      const danger = s.key === "help";
                      const done = s.key === "completed";
                      return (
                        <Button
                          key={s.key}
                          size="sm"
                          variant={active ? "default" : "outline"}
                          className={`h-11 justify-start text-xs ${
                            !active && danger ? "border-destructive text-destructive" : ""
                          } ${!active && done ? "border-emerald-500 text-emerald-600" : ""}`}
                          onClick={() => setStage(job, s.key, s.label)}
                        >
                          <Icon className="mr-1.5 h-4 w-4 shrink-0" />
                          <span className="truncate">{s.label[lang]}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Job details */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {detail.store[lang]} · {detail.id}
                </DialogTitle>
                <DialogDescription>{detail.owner}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <Row label={T.phone[lang]} value={detail.phone} />
                <Row label={T.address[lang]} value={detail.address[lang]} />
                <Row label={T.machine[lang]} value={detail.machine[lang]} />
                <Row label={T.model[lang]} value={EXTRA[detail.id]?.model ?? "—"} />
                <Row label={T.serial[lang]} value={EXTRA[detail.id]?.serial ?? "—"} />
                <Row label={T.problem[lang]} value={detail.issue[lang]} />
                <Row label={T.visit[lang]} value={EXTRA[detail.id]?.date[lang] ?? detail.slot[lang]} />

                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    {T.media[lang]}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Camera, label: T.photo[lang] },
                      { icon: Video, label: T.video[lang] },
                      { icon: Mic, label: T.voice[lang] },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <Button
                          key={m.label}
                          variant="outline"
                          className="h-16 flex-col gap-1 text-xs"
                          onClick={() => toast(`${m.label} · ${T.soon[lang]}`)}
                        >
                          <Icon className="h-5 w-5" />
                          {m.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <NoteBox
                  title={T.tsNotes[lang]}
                  body={EXTRA[detail.id]?.tsNote[lang] ?? "—"}
                  tone="bg-primary/5 border-primary/20"
                />
                <NoteBox
                  title={`${T.rmNotes[lang]} · ${detail.rmName}`}
                  body={detail.rmNote[lang]}
                  tone="bg-amber-50 border-amber-200"
                />
                <NoteBox
                  title={T.parts[lang]}
                  body={EXTRA[detail.id]?.parts[lang] ?? "—"}
                  tone="bg-muted border-border"
                />

                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    {T.history[lang]}
                  </div>
                  <ul className="space-y-1">
                    {(EXTRA[detail.id]?.history ?? []).map((h) => (
                      <li key={h.en} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        {h[lang]}
                      </li>
                    ))}
                  </ul>
                </div>

                {detail.priority === "safety" && (
                  <div className="flex items-start gap-2 rounded-md border-2 border-destructive bg-destructive/5 p-3 text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">
                      {lang === "hi"
                        ? "सुरक्षा कार्य — जाँच से पहले बिजली बंद करें।"
                        : "Safety job — switch off power before checking."}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule */}
      <Dialog
        open={!!reschedId}
        onOpenChange={(o) => {
          if (!o) {
            setReschedId(null);
            setReDate("");
            setReTime("");
            setReReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{T.reschedTitle[lang]}</DialogTitle>
            <DialogDescription>
              {T.ticket[lang]} {reschedId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{T.reschedNew[lang]}</Label>
              <Input type="date" value={reDate} onChange={(e) => setReDate(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-1">
              <Label>{T.reschedTime[lang]}</Label>
              <Input type="time" value={reTime} onChange={(e) => setReTime(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-1">
              <Label>{T.reason[lang]}</Label>
              <Textarea
                rows={2}
                value={reReason}
                onChange={(e) => setReReason(e.target.value)}
                placeholder={lang === "hi" ? "जैसे: स्टोर बंद था" : "e.g. Store was closed"}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-12" onClick={() => setReschedId(null)}>
              {T.cancel[lang]}
            </Button>
            <Button
              className="h-12"
              disabled={!reDate || !reTime || !reReason.trim()}
              onClick={() => {
                const id = reschedId!;
                setStages((s) => ({ ...s, [id]: "resched" }));
                toast.success(`${T.savedToast[lang]} ${id} · ${reDate} ${reTime}`);
                setReschedId(null);
                setReDate("");
                setReTime("");
                setReReason("");
              }}
            >
              {T.save[lang]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-2 border-b pb-2">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function NoteBox({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide">{title}</div>
      <div className="text-sm">{body}</div>
    </div>
  );
}
