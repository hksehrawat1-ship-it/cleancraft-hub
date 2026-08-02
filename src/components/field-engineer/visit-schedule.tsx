// Field Engineer — "Visit Schedule" (mobile-first, bilingual, very simple).
// Uses the shared JOBS master data so visits and jobs never duplicate.
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Route,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { JOBS, type Bi, type Job, type Lang } from "@/components/field-engineer/data";

type DayKey = "today" | "tomorrow" | "week";
type VisitStatus =
  | "scheduled"
  | "confirmed"
  | "going"
  | "reached"
  | "started"
  | "completed"
  | "rescheduled";

const T = {
  title: { en: "Visit Schedule", hi: "विज़िट शेड्यूल" },
  sub: {
    en: "Where to go, whom to meet and at what time.",
    hi: "कहाँ जाना है, किससे मिलना है और कितने बजे।",
  },
  todayVisits: { en: "Today's Visits", hi: "आज की विज़िट" },
  nextVisit: { en: "Next Visit", hi: "अगली विज़िट" },
  done: { en: "Visits Completed", hi: "पूर्ण विज़िट" },
  remaining: { en: "Visits Remaining", hi: "शेष विज़िट" },
  tabs: {
    today: { en: "Today", hi: "आज" },
    tomorrow: { en: "Tomorrow", hi: "कल" },
    week: { en: "This Week", hi: "इस सप्ताह" },
  },
  urgent: { en: "Urgent", hi: "अत्यावश्यक" },
  normal: { en: "Normal", hi: "सामान्य" },
  call: { en: "Call Customer", hi: "ग्राहक को कॉल करें" },
  location: { en: "Open Location", hi: "पता खोलें" },
  startTravel: { en: "Start Travel", hi: "यात्रा शुरू करें" },
  viewJob: { en: "View Job", hi: "कार्य देखें" },
  contact: { en: "Contact Person", hi: "संपर्क व्यक्ति" },
  machine: { en: "Machine", hi: "मशीन" },
  problem: { en: "Problem", hi: "समस्या" },
  area: { en: "Area", hi: "क्षेत्र" },
  status: { en: "Status", hi: "स्थिति" },
  distance: { en: "Distance", hi: "दूरी" },
  view: { en: "View", hi: "देखें" },
  none: { en: "No visits here.", hi: "यहाँ कोई विज़िट नहीं।" },
  reached: { en: "Reached Site", hi: "साइट पर पहुँचा" },
  workStarted: { en: "Work Started", hi: "काम शुरू" },
  complete: { en: "Complete Visit", hi: "विज़िट पूर्ण करें" },
  reschedule: { en: "Reschedule", hi: "पुनर्निर्धारित करें" },
  newDate: { en: "New date", hi: "नई तिथि" },
  newTime: { en: "New time", hi: "नया समय" },
  reason: { en: "Simple reason", hi: "सरल कारण" },
  informed: { en: "Customer informed?", hi: "ग्राहक को बताया?" },
  yes: { en: "Yes", hi: "हाँ" },
  no: { en: "No", hi: "नहीं" },
  save: { en: "Save", hi: "सेव करें" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
  soon: { en: "Will be enabled soon", hi: "जल्द चालू होगा" },
  travelToast: { en: "Travel started. Job status updated.", hi: "यात्रा शुरू। कार्य स्थिति अपडेट हुई।" },
  reachedToast: { en: "Arrival time recorded", hi: "पहुँचने का समय दर्ज हुआ" },
  startedToast: { en: "Work started", hi: "काम शुरू हुआ" },
  completeToast: {
    en: "Visit completed. Open Submit Work Report.",
    hi: "विज़िट पूर्ण। कार्य रिपोर्ट भेजें।",
  },
  reschedToast: {
    en: "Visit rescheduled. Relationship Manager alerted (in-app).",
    hi: "विज़िट पुनर्निर्धारित। रिलेशनशिप मैनेजर को सूचित किया गया (ऐप में)।",
  },
  original: { en: "Original schedule", hi: "मूल शेड्यूल" },
  arrived: { en: "Arrived at", hi: "पहुँचे" },
  assignedBy: { en: "Assigned by", hi: "सौंपा गया" },
};

const STATUS_LABEL: Record<VisitStatus, Bi> = {
  scheduled: { en: "Scheduled", hi: "निर्धारित" },
  confirmed: { en: "Confirmed", hi: "पुष्ट" },
  going: { en: "Going to Site", hi: "साइट जा रहे हैं" },
  reached: { en: "Reached Site", hi: "साइट पर पहुँचे" },
  started: { en: "Work Started", hi: "काम शुरू" },
  completed: { en: "Completed", hi: "पूर्ण" },
  rescheduled: { en: "Rescheduled", hi: "पुनर्निर्धारित" },
};

function statusTone(s: VisitStatus) {
  if (s === "completed") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "rescheduled") return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "going" || s === "reached" || s === "started")
    return "bg-primary/10 text-primary border-primary/20";
  return "bg-muted text-muted-foreground";
}

type Visit = {
  jobId: string;
  day: DayKey;
  order: number;
  time: Bi;
  distanceKm: number;
  initial: VisitStatus;
};

const VISITS: Visit[] = [
  { jobId: "FE-2041", day: "today", order: 1, time: { en: "10:00 AM", hi: "सुबह 10:00" }, distanceKm: 4.2, initial: "going" },
  { jobId: "FE-2042", day: "today", order: 2, time: { en: "12:30 PM", hi: "दोपहर 12:30" }, distanceKm: 9.6, initial: "confirmed" },
  { jobId: "FE-2043", day: "today", order: 3, time: { en: "3:00 PM", hi: "दोपहर 3:00" }, distanceKm: 12.1, initial: "scheduled" },
  { jobId: "FE-2039", day: "today", order: 0, time: { en: "9:00 AM", hi: "सुबह 9:00" }, distanceKm: 2.4, initial: "completed" },
  { jobId: "FE-2036", day: "tomorrow", order: 1, time: { en: "11:00 AM", hi: "सुबह 11:00" }, distanceKm: 6.8, initial: "scheduled" },
  { jobId: "FE-2042", day: "tomorrow", order: 2, time: { en: "4:00 PM", hi: "शाम 4:00" }, distanceKm: 9.6, initial: "scheduled" },
  { jobId: "FE-2043", day: "week", order: 1, time: { en: "Thu, 9:30 AM", hi: "गुरु, सुबह 9:30" }, distanceKm: 12.1, initial: "scheduled" },
  { jobId: "FE-2036", day: "week", order: 2, time: { en: "Fri, 2:00 PM", hi: "शुक्र, दोपहर 2:00" }, distanceKm: 6.8, initial: "scheduled" },
];

function jobOf(id: string): Job {
  return JOBS.find((j) => j.id === id) ?? JOBS[0];
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function FieldEngineerVisitSchedule({
  lang,
  onGo,
}: {
  lang: Lang;
  onGo?: (key: "report" | "jobs") => void;
}) {
  const [tab, setTab] = useState<DayKey>("today");
  const [status, setStatus] = useState<Record<string, VisitStatus>>({});
  const [arrival, setArrival] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Record<string, string>>({});
  const [reschedFor, setReschedFor] = useState<string | null>(null);
  const [form, setForm] = useState({ date: "", time: "", reason: "", informed: "yes" });

  const key = (v: Visit) => `${v.day}-${v.jobId}-${v.order}`;
  const st = (v: Visit) => status[key(v)] ?? v.initial;

  const dayVisits = useMemo(() => {
    const list = VISITS.filter((v) => v.day === tab);
    return [...list].sort((a, b) => {
      const ua = jobOf(a.jobId).priority === "safety" ? 0 : 1;
      const ub = jobOf(b.jobId).priority === "safety" ? 0 : 1;
      if (ua !== ub) return ua - ub;
      return a.order - b.order;
    });
  }, [tab, status]);

  const todays = VISITS.filter((v) => v.day === "today");
  const completedCount = todays.filter((v) => st(v) === "completed").length;
  const remaining = todays.length - completedCount;
  const next =
    dayVisits.find((v) => st(v) !== "completed" && st(v) !== "rescheduled") ?? dayVisits[0];

  const setSt = (v: Visit, s: VisitStatus) => setStatus((p) => ({ ...p, [key(v)]: s }));

  const startTravel = (v: Visit) => {
    setSt(v, "going");
    toast.success(T.travelToast[lang]);
  };
  const markReached = (v: Visit) => {
    setSt(v, "reached");
    const t = nowTime();
    setArrival((p) => ({ ...p, [key(v)]: t }));
    toast.success(`${T.reachedToast[lang]} — ${t}`);
  };
  const markStarted = (v: Visit) => {
    setSt(v, "started");
    toast.success(T.startedToast[lang]);
  };
  const markCompleted = (v: Visit) => {
    setSt(v, "completed");
    toast.success(T.completeToast[lang]);
    onGo?.("report");
  };

  const submitResched = () => {
    if (!reschedFor) return;
    const v = VISITS.find((x) => key(x) === reschedFor);
    if (v) {
      setHistory((p) => ({ ...p, [reschedFor]: `${v.time[lang]}` }));
      setStatus((p) => ({ ...p, [reschedFor]: "rescheduled" }));
    }
    setReschedFor(null);
    setForm({ date: "", time: "", reason: "", informed: "yes" });
    toast.success(T.reschedToast[lang]);
  };

  const soon = () => toast.info(T.soon[lang]);

  const kpis = [
    { label: T.todayVisits[lang], value: String(todays.length), icon: CalendarDays },
    { label: T.nextVisit[lang], value: next ? next.time[lang] : "—", icon: Clock },
    { label: T.done[lang], value: String(completedCount), icon: CheckCircle2 },
    { label: T.remaining[lang], value: String(remaining), icon: Route },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{T.title[lang]}</h1>
        <p className="text-sm text-muted-foreground">{T.sub[lang]}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <k.icon className="w-4 h-4 text-primary" /> {k.label}
              </div>
              <div className="text-2xl font-bold mt-1">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["today", "tomorrow", "week"] as DayKey[]).map((k) => (
          <Button
            key={k}
            size="lg"
            variant={tab === k ? "default" : "outline"}
            className="h-12 text-sm"
            onClick={() => setTab(k)}
          >
            {T.tabs[k][lang]}
          </Button>
        ))}
      </div>

      {next && <NextVisitCard visit={next} />}

      <div className="space-y-3">
        {dayVisits.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {T.none[lang]}
            </CardContent>
          </Card>
        )}
        {dayVisits.map((v) => {
          const j = jobOf(v.jobId);
          const s = st(v);
          return (
            <Card key={key(v)} className={j.priority === "safety" ? "border-destructive/40" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-lg font-bold tabular-nums">{v.time[lang]}</div>
                    <div className="text-sm font-medium">{j.store[lang]}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {j.city[lang]} · {j.machine[lang]}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {j.priority === "safety" ? (
                      <Badge className="bg-destructive text-destructive-foreground">
                        {T.urgent[lang]}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{T.normal[lang]}</Badge>
                    )}
                    <Badge variant="outline" className={statusTone(s)}>
                      {STATUS_LABEL[s][lang]}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {T.distance[lang]}: {v.distanceKm} km
                  </span>
                  <span>
                    {T.assignedBy[lang]}: {j.rmName}
                  </span>
                  {arrival[key(v)] && (
                    <span className="text-primary">
                      {T.arrived[lang]}: {arrival[key(v)]}
                    </span>
                  )}
                  {history[key(v)] && (
                    <span className="text-amber-600">
                      {T.original[lang]}: {history[key(v)]}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button className="h-11" variant="outline" onClick={() => onGo?.("jobs")}>
                    {T.view[lang]} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  {s === "completed" ? (
                    <Button className="h-11" variant="ghost" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> {STATUS_LABEL.completed[lang]}
                    </Button>
                  ) : s === "going" ? (
                    <Button className="h-11" onClick={() => markReached(v)}>
                      <MapPin className="w-4 h-4 mr-1" /> {T.reached[lang]}
                    </Button>
                  ) : s === "reached" ? (
                    <Button className="h-11" onClick={() => markStarted(v)}>
                      {T.workStarted[lang]}
                    </Button>
                  ) : s === "started" ? (
                    <Button className="h-11" onClick={() => markCompleted(v)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> {T.complete[lang]}
                    </Button>
                  ) : (
                    <Button className="h-11" onClick={() => startTravel(v)}>
                      <Truck className="w-4 h-4 mr-1" /> {T.startTravel[lang]}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="h-10 w-full text-amber-700"
                  onClick={() => setReschedFor(key(v))}
                >
                  {T.reschedule[lang]}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!reschedFor} onOpenChange={(o) => !o && setReschedFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{T.reschedule[lang]}</DialogTitle>
            <DialogDescription>{T.reschedToast[lang]}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{T.newDate[lang]}</Label>
              <Input
                type="date"
                className="h-11"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Label>{T.newTime[lang]}</Label>
              <Input
                type="time"
                className="h-11"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div>
              <Label>{T.reason[lang]}</Label>
              <Textarea
                rows={2}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div>
              <Label>{T.informed[lang]}</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Button
                  className="h-11"
                  variant={form.informed === "yes" ? "default" : "outline"}
                  onClick={() => setForm({ ...form, informed: "yes" })}
                >
                  {T.yes[lang]}
                </Button>
                <Button
                  className="h-11"
                  variant={form.informed === "no" ? "default" : "outline"}
                  onClick={() => setForm({ ...form, informed: "no" })}
                >
                  {T.no[lang]}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReschedFor(null)}>
              {T.cancel[lang]}
            </Button>
            <Button onClick={submitResched} disabled={!form.date || !form.time}>
              {T.save[lang]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function NextVisitCard({ visit }: { visit: Visit }) {
    const j = jobOf(visit.jobId);
    const s = st(visit);
    return (
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4" /> {T.nextVisit[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xl font-bold">{j.store[lang]}</div>
              <div className="text-3xl font-bold tabular-nums mt-1">{visit.time[lang]}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {j.address[lang]}
              </div>
            </div>
            {j.priority === "safety" ? (
              <Badge className="bg-destructive text-destructive-foreground">{T.urgent[lang]}</Badge>
            ) : (
              <Badge variant="outline">{T.normal[lang]}</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">{T.machine[lang]}</div>
              <div className="font-medium">{j.machine[lang]}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{T.contact[lang]}</div>
              <div className="font-medium">
                {j.owner} · {j.phone}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">{T.problem[lang]}</div>
              <div className="font-medium">{j.issue[lang]}</div>
            </div>
          </div>

          <Badge variant="outline" className={statusTone(s)}>
            {STATUS_LABEL[s][lang]}
          </Badge>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button className="h-14 text-base" onClick={soon}>
              <Phone className="w-5 h-5 mr-2" /> {T.call[lang]}
            </Button>
            <Button className="h-14 text-base" variant="outline" onClick={soon}>
              <MapPin className="w-5 h-5 mr-2" /> {T.location[lang]}
            </Button>
            <Button
              className="h-14 text-base"
              variant="secondary"
              onClick={() => startTravel(visit)}
            >
              <Truck className="w-5 h-5 mr-2" /> {T.startTravel[lang]}
            </Button>
            <Button className="h-14 text-base" variant="outline" onClick={() => onGo?.("jobs")}>
              {T.viewJob[lang]} <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}
