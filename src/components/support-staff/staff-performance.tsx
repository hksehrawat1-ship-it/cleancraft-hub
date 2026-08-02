import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  MessageSquarePlus,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROLE_META, STAFF, type StaffRole } from "./data";

type Lang = "en" | "hi";
type Period = "today" | "week" | "month" | "custom";

/** One record per assigned task. Performance is derived only from these. */
type PerfRecord = {
  id: string;
  staff: string;
  role: StaffRole;
  type: string;
  date: string; // ISO date
  /** approved = counted complete · awaiting-review = neutral · returned/late/overdue/pending/cancelled */
  outcome: "approved" | "awaiting-review" | "returned" | "pending" | "overdue" | "cancelled";
  onTime: boolean;
  returns: number;
  minutes: number; // time taken
};

type Feedback = {
  id: string;
  staff: string;
  kind: "good" | "improve" | "verbal" | "training" | "general";
  note: string;
  date: string;
  by: string;
};

const iso = (offset: number) => {
  const x = new Date();
  x.setDate(x.getDate() - offset);
  return x.toISOString().slice(0, 10);
};

const TASK_TYPES: Record<StaffRole, string[]> = {
  pantry: ["Tea & coffee service", "Water refill", "Guest refreshments", "Pantry cleaning"],
  cleaning: ["Washroom cleaning", "Floor mopping", "Workstation dusting", "Dustbin clearance"],
  packing: ["Bundle packing", "Carton labelling", "Dispatch handover", "Store room arrangement"],
};

/** Realistic sample task records for the last ~30 days. */
const RECORDS: PerfRecord[] = (() => {
  const out: PerfRecord[] = [];
  // deterministic pseudo-random
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const profile: Record<string, { vol: number; ok: number; late: number; ret: number; over: number }> = {
    "Ramesh Kumar": { vol: 5, ok: 0.86, late: 0.08, ret: 0.04, over: 0.02 },
    "Sunita Devi": { vol: 4, ok: 0.9, late: 0.05, ret: 0.03, over: 0.02 },
    "Arjun Yadav": { vol: 3, ok: 0.6, late: 0.14, ret: 0.12, over: 0.14 },
    "Mohit Sharma": { vol: 6, ok: 0.8, late: 0.08, ret: 0.07, over: 0.05 },
    "Pooja Verma": { vol: 1, ok: 0.75, late: 0.1, ret: 0.1, over: 0.05 },
  };
  let n = 0;
  for (let day = 0; day < 30; day++) {
    STAFF.forEach((s) => {
      const p = profile[s.name];
      const count = Math.max(0, Math.round(p.vol - 1 + rnd() * 2));
      for (let k = 0; k < count; k++) {
        const r = rnd();
        let outcome: PerfRecord["outcome"] = "approved";
        let onTime = true;
        let returns = 0;
        if (r < p.over) {
          outcome = day <= 2 ? "overdue" : "returned";
          onTime = false;
          returns = outcome === "returned" ? 1 : 0;
        } else if (r < p.over + p.ret) {
          outcome = "returned";
          onTime = false;
          returns = rnd() < 0.35 ? 2 : 1;
        } else if (r < p.over + p.ret + p.late) {
          outcome = "approved";
          onTime = false;
        } else if (day <= 1 && rnd() < 0.18) {
          outcome = "awaiting-review";
        } else if (day === 0 && rnd() < 0.15) {
          outcome = "pending";
        } else if (rnd() < 0.03) {
          outcome = "cancelled";
        }
        const types = TASK_TYPES[s.role];
        out.push({
          id: `P-${++n}`,
          staff: s.name,
          role: s.role,
          type: types[Math.floor(rnd() * types.length)],
          date: iso(day),
          outcome,
          onTime,
          returns,
          minutes: 25 + Math.round(rnd() * 55),
        });
      }
    });
  }
  return out;
})();

const FEEDBACK_SEED: Feedback[] = [
  { id: "F1", staff: "Sunita Devi", kind: "good", note: "Washroom deep clean consistently on time.", date: iso(3), by: "Administration Manager" },
  { id: "F2", staff: "Arjun Yadav", kind: "improve", note: "Evening dustbin clearance delayed twice this week.", date: iso(2), by: "Administration Manager" },
  { id: "F3", staff: "Arjun Yadav", kind: "verbal", note: "Discussed importance of finishing before shift end.", date: iso(1), by: "Administration Manager" },
  { id: "F4", staff: "Mohit Sharma", kind: "good", note: "Handled Jaipur dispatch load smoothly.", date: iso(5), by: "Administration Manager" },
  { id: "F5", staff: "Ramesh Kumar", kind: "training", note: "Needs refresher on guest refreshment setup.", date: iso(8), by: "Administration Manager" },
];

const FB_META = {
  good: { en: "Good Work", hi: "अच्छा काम", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  improve: { en: "Needs Improvement", hi: "सुधार की ज़रूरत", cls: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  verbal: { en: "Verbal Guidance Given", hi: "मौखिक मार्गदर्शन दिया", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  training: { en: "Training Required", hi: "ट्रेनिंग चाहिए", cls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200" },
  general: { en: "General Feedback", hi: "सामान्य फीडबैक", cls: "bg-muted text-muted-foreground" },
} as const;

const OUTCOME_LABEL: Record<PerfRecord["outcome"], { en: string; hi: string; cls: string }> = {
  approved: { en: "Approved", hi: "मंज़ूर", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  "awaiting-review": { en: "Awaiting review", hi: "समीक्षा बाकी", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  returned: { en: "Returned", hi: "वापस भेजा", cls: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  pending: { en: "Pending", hi: "बाकी", cls: "bg-muted text-muted-foreground" },
  overdue: { en: "Overdue", hi: "देरी", cls: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
  cancelled: { en: "Cancelled", hi: "रद्द", cls: "bg-muted text-muted-foreground" },
};

const T = {
  title: { en: "Staff Performance", hi: "स्टाफ प्रदर्शन" },
  sub: {
    en: "Work consistency, punctuality and quality taken directly from task and review records.",
    hi: "काम की निरंतरता, समय-पालन और गुणवत्ता — सीधे टास्क और समीक्षा रिकॉर्ड से।",
  },
  today: { en: "Today", hi: "आज" },
  week: { en: "This Week", hi: "इस हफ़्ते" },
  month: { en: "This Month", hi: "इस महीने" },
  custom: { en: "Custom Date Range", hi: "तिथि सीमा चुनें" },
  allCat: { en: "All categories", hi: "सभी श्रेणियां" },
  allStaff: { en: "All staff", hi: "सभी स्टाफ" },
  assigned: { en: "Tasks Assigned", hi: "दिए गए टास्क" },
  approvedC: { en: "Tasks Approved", hi: "मंज़ूर टास्क" },
  onTime: { en: "Completed on Time", hi: "समय पर पूरे" },
  overdue: { en: "Overdue Tasks", hi: "देरी वाले टास्क" },
  returned: { en: "Tasks Returned", hi: "वापस भेजे टास्क" },
  rate: { en: "Overall Completion Rate", hi: "कुल पूर्णता दर" },
  category: { en: "Category performance", hi: "श्रेणी प्रदर्शन" },
  attention: { en: "Attention list", hi: "ध्यान देने योग्य" },
  details: { en: "View Details", hi: "विवरण देखें" },
  feedback: { en: "Manager feedback", hi: "मैनेजर फीडबैक" },
  addFb: { en: "Add Feedback", hi: "फीडबैक जोड़ें" },
  history: { en: "Task history", hi: "टास्क इतिहास" },
  pending: { en: "Pending now", hi: "अभी बाकी" },
  avgTime: { en: "Average completion time", hi: "औसत समय" },
  common: { en: "Most common task", hi: "सबसे आम टास्क" },
  late: { en: "Completed late", hi: "देर से पूरे" },
};

const STATUS = {
  excellent: { en: "Excellent", hi: "बहुत अच्छा", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  good: { en: "Good", hi: "अच्छा", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  attention: { en: "Needs Attention", hi: "ध्यान चाहिए", cls: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
} as const;

/** Category-specific expectations — volumes are not compared across roles. */
const ROLE_EXPECT: Record<StaffRole, { perDay: number; note: { en: string; hi: string } }> = {
  pantry: { perDay: 5, note: { en: "Pantry work is high-frequency and time-bound.", hi: "पैंट्री का काम बार-बार और समय-आधारित है।" } },
  cleaning: { perDay: 4, note: { en: "Cleaning work is area-based with fixed slots.", hi: "सफाई का काम एरिया और तय समय पर आधारित है।" } },
  packing: { perDay: 6, note: { en: "Packing volume depends on dispatch load.", hi: "पैकिंग की संख्या डिस्पैच लोड पर निर्भर है।" } },
};

const initials = (n: string) =>
  n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function statusFor(onTimeRate: number, returned: number, overdue: number) {
  if (onTimeRate >= 90 && returned <= 1 && overdue === 0) return "excellent" as const;
  if (onTimeRate >= 75 && overdue <= 2) return "good" as const;
  return "attention" as const;
}

export function StaffPerformance() {
  const [lang, setLang] = useState<Lang>("en");
  const [period, setPeriod] = useState<Period>("month");
  const [from, setFrom] = useState(iso(14));
  const [to, setTo] = useState(iso(0));
  const [cat, setCat] = useState<"all" | StaffRole>("all");
  const [who, setWho] = useState<"all" | string>("all");
  const [openStaff, setOpenStaff] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>(FEEDBACK_SEED);
  const [fbOpen, setFbOpen] = useState<string | null>(null);
  const [fbKind, setFbKind] = useState<Feedback["kind"]>("good");
  const [fbNote, setFbNote] = useState("");

  const t = (k: keyof typeof T) => T[k][lang];

  const range = useMemo(() => {
    if (period === "today") return { from: iso(0), to: iso(0) };
    if (period === "week") return { from: iso(6), to: iso(0) };
    if (period === "month") return { from: iso(29), to: iso(0) };
    return { from, to };
  }, [period, from, to]);

  const scoped = useMemo(
    () =>
      RECORDS.filter(
        (r) =>
          r.date >= range.from &&
          r.date <= range.to &&
          (cat === "all" || r.role === cat) &&
          (who === "all" || r.staff === who),
      ),
    [range, cat, who],
  );

  /** Cancelled tasks never affect performance. */
  const counted = (list: PerfRecord[]) => list.filter((r) => r.outcome !== "cancelled");

  const stats = (list: PerfRecord[]) => {
    const c = counted(list);
    const assigned = c.length;
    const approved = c.filter((r) => r.outcome === "approved").length;
    const onTimeDone = c.filter((r) => r.outcome === "approved" && r.onTime).length;
    const overdue = c.filter((r) => r.outcome === "overdue").length;
    const returned = c.filter((r) => r.returns > 0).length;
    const awaiting = c.filter((r) => r.outcome === "awaiting-review").length;
    const pending = c.filter((r) => r.outcome === "pending" || r.outcome === "overdue").length;
    // work awaiting review is excluded from the denominator so it never reduces performance
    const base = assigned - awaiting;
    const completion = base ? Math.round((approved / base) * 100) : 0;
    const onTimeRate = approved ? Math.round((onTimeDone / approved) * 100) : 0;
    const late = approved - onTimeDone;
    const avgMin = approved
      ? Math.round(
          c.filter((r) => r.outcome === "approved").reduce((s, r) => s + r.minutes, 0) / approved,
        )
      : 0;
    return { assigned, approved, onTimeDone, overdue, returned, awaiting, pending, completion, onTimeRate, late, avgMin };
  };

  const overall = stats(scoped);

  const perStaff = useMemo(
    () =>
      STAFF.filter((s) => (cat === "all" || s.role === cat) && (who === "all" || s.name === who)).map(
        (s) => {
          const list = scoped.filter((r) => r.staff === s.name);
          const st = stats(list);
          return { staff: s, ...st, status: statusFor(st.onTimeRate, st.returned, st.overdue), list };
        },
      ),
    [scoped, cat, who],
  );

  const avgAssigned = perStaff.length
    ? perStaff.reduce((s, p) => s + p.assigned, 0) / perStaff.length
    : 0;

  const attention = useMemo(() => {
    const out: { text: string; hi: string; level: "warn" | "danger" }[] = [];
    perStaff.forEach((p) => {
      if (p.overdue >= 3)
        out.push({ text: `${p.staff.name}: ${p.overdue} overdue tasks in this period.`, hi: `${p.staff.name}: इस अवधि में ${p.overdue} टास्क देरी से।`, level: "danger" });
      const multi = p.list.filter((r) => r.returns >= 2).length;
      if (multi > 0)
        out.push({ text: `${p.staff.name}: ${multi} task(s) returned more than once.`, hi: `${p.staff.name}: ${multi} टास्क एक से ज़्यादा बार वापस भेजे गए।`, level: "warn" });
      if (p.pending > 3)
        out.push({ text: `${p.staff.name}: ${p.pending} tasks still incomplete.`, hi: `${p.staff.name}: ${p.pending} टास्क अभी अपूर्ण।`, level: "warn" });
      if (avgAssigned && p.assigned > avgAssigned * 1.4)
        out.push({ text: `${p.staff.name} has an unusually high workload (${p.assigned} tasks).`, hi: `${p.staff.name} पर काम का बोझ ज़्यादा है (${p.assigned} टास्क)।`, level: "warn" });
      if (p.assigned === 0)
        out.push({ text: `${p.staff.name} has no tasks assigned in this period.`, hi: `${p.staff.name} को इस अवधि में कोई टास्क नहीं मिला।`, level: "warn" });
      if (p.awaiting > 0)
        out.push({ text: `${p.staff.name}: ${p.awaiting} task(s) waiting for your review — not counted yet.`, hi: `${p.staff.name}: ${p.awaiting} टास्क समीक्षा के इंतज़ार में — अभी नहीं गिने गए।`, level: "warn" });
    });
    return out;
  }, [perStaff, avgAssigned]);

  const categoryRows = (Object.keys(ROLE_META) as StaffRole[]).map((role) => {
    const list = scoped.filter((r) => r.role === role);
    return { role, ...stats(list) };
  });

  const detail = perStaff.find((p) => p.staff.name === openStaff) || null;

  const submitFeedback = () => {
    if (!fbOpen) return;
    if (!fbNote.trim()) {
      toast.error(lang === "en" ? "Please write a short note" : "कृपया छोटा नोट लिखें");
      return;
    }
    setFeedback((prev) => [
      {
        id: `F${prev.length + 1}`,
        staff: fbOpen,
        kind: fbKind,
        note: fbNote.trim(),
        date: iso(0),
        by: "Administration Manager",
      },
      ...prev,
    ]);
    toast.success(
      lang === "en" ? `Feedback saved for ${fbOpen}` : `${fbOpen} के लिए फीडबैक सेव हुआ`,
    );
    setFbNote("");
    setFbOpen(null);
  };

  const cards = [
    { label: t("assigned"), value: overall.assigned, hint: { en: "Tasks given in the selected period (cancelled tasks excluded).", hi: "चुनी अवधि में दिए गए टास्क (रद्द टास्क शामिल नहीं)।" } },
    { label: t("approvedC"), value: overall.approved, hint: { en: "Counted complete only after manager approval.", hi: "मैनेजर की मंज़ूरी के बाद ही पूरा माना जाता है।" } },
    { label: t("onTime"), value: overall.onTimeDone, hint: { en: "Approved tasks finished before the due time.", hi: "समय से पहले पूरे हुए मंज़ूर टास्क।" } },
    { label: t("overdue"), value: overall.overdue, hint: { en: "Past due time and still not submitted.", hi: "समय बीत गया, अभी जमा नहीं।" } },
    { label: t("returned"), value: overall.returned, hint: { en: "Returned for correction — counted once only.", hi: "सुधार के लिए वापस — एक ही बार गिना जाता है।" } },
    { label: t("rate"), value: `${overall.completion}%`, hint: { en: "Approved ÷ tasks reviewed. Work awaiting review is excluded.", hi: "मंज़ूर ÷ समीक्षित टास्क। समीक्षा बाकी काम शामिल नहीं।" } },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("sub")}</p>
        </div>
        <div className="flex overflow-hidden rounded-md border">
          {(["en", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-xs font-medium ${lang === l ? "bg-primary text-primary-foreground" : "bg-background"}`}
            >
              {l === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">{lang === "en" ? "Period" : "अवधि"}</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t("today")}</SelectItem>
                <SelectItem value="week">{t("week")}</SelectItem>
                <SelectItem value="month">{t("month")}</SelectItem>
                <SelectItem value="custom">{t("custom")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{lang === "en" ? "Staff category" : "स्टाफ श्रेणी"}</Label>
            <Select value={cat} onValueChange={(v) => { setCat(v as typeof cat); setWho("all"); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCat")}</SelectItem>
                {(Object.keys(ROLE_META) as StaffRole[]).map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{lang === "en" ? "Staff member" : "स्टाफ सदस्य"}</Label>
            <Select value={who} onValueChange={setWho}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStaff")}</SelectItem>
                {STAFF.filter((s) => cat === "all" || s.role === cat).map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {period === "custom" ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{lang === "en" ? "From" : "से"}</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{lang === "en" ? "To" : "तक"}</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">{lang === "en" ? "Selected period" : "चुनी अवधि"}</Label>
              <div className="rounded-md border px-3 py-2 text-sm">
                {range.from} → {range.to}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold tabular-nums">{c.value}</div>
              <div className="text-xs font-medium">{c.label}</div>
              <div className="mt-1 flex gap-1 text-[11px] leading-snug text-muted-foreground">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{c.hint[lang]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {attention.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              {t("attention")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {attention.map((a, i) => (
              <div
                key={i}
                className={`rounded-md border p-2 text-sm ${a.level === "danger" ? "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200" : "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"}`}
              >
                {lang === "en" ? a.text : a.hi}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {perStaff.map((p) => {
          const st = STATUS[p.status];
          return (
            <Card key={p.staff.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(p.staff.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{p.staff.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ROLE_META[p.staff.role].label} · {p.staff.shift}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className={st.cls}>{st[lang]}</Badge>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{lang === "en" ? "On-time completion" : "समय पर पूर्णता"}</span>
                    <span>{p.onTimeRate}%</span>
                  </div>
                  <Progress value={p.onTimeRate} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div className="rounded-md border p-2 text-center">
                    <div className="text-base font-semibold tabular-nums">{p.assigned}</div>
                    {t("assigned")}
                  </div>
                  <div className="rounded-md border p-2 text-center">
                    <div className="text-base font-semibold tabular-nums text-emerald-600">{p.approved}</div>
                    {t("approvedC")}
                  </div>
                  <div className="rounded-md border p-2 text-center">
                    <div className="text-base font-semibold tabular-nums text-amber-600">{p.returned}</div>
                    {t("returned")}
                  </div>
                  <div className="rounded-md border p-2 text-center">
                    <div className="text-base font-semibold tabular-nums">{p.pending}</div>
                    {t("pending")}
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {ROLE_EXPECT[p.staff.role].note[lang]}
                </p>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpenStaff(p.staff.name)}>
                    {t("details")}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setFbOpen(p.staff.name)}>
                    <MessageSquarePlus className="mr-1 h-4 w-4" />
                    {t("addFb")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("category")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {categoryRows.map((c) => (
            <div key={c.role} className="space-y-2 rounded-md border p-3">
              <div className="font-medium">{ROLE_META[c.role].label}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">{lang === "en" ? "Total tasks" : "कुल टास्क"}: </span>{c.assigned}</div>
                <div><span className="text-muted-foreground">{lang === "en" ? "Completion" : "पूर्णता"}: </span>{c.completion}%</div>
                <div><span className="text-muted-foreground">{lang === "en" ? "On-time" : "समय पर"}: </span>{c.onTimeRate}%</div>
                <div><span className="text-muted-foreground">{t("returned")}: </span>{c.returned}</div>
                <div><span className="text-muted-foreground">{t("overdue")}: </span>{c.overdue}</div>
                <div><span className="text-muted-foreground">{lang === "en" ? "Expected/day" : "प्रति दिन अपेक्षित"}: </span>{ROLE_EXPECT[c.role].perDay}</div>
              </div>
              <p className="text-[11px] text-muted-foreground">{ROLE_EXPECT[c.role].note[lang]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Individual staff view */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setOpenStaff(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.staff.name}</DialogTitle>
                <DialogDescription>
                  {ROLE_META[detail.staff.role].label} · {range.from} → {range.to}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                {[
                  { l: t("assigned"), v: detail.assigned },
                  { l: lang === "en" ? "Completed" : "पूरे किए", v: detail.approved + detail.awaiting },
                  { l: t("approvedC"), v: detail.approved },
                  { l: t("late"), v: detail.late },
                  { l: t("returned"), v: detail.returned },
                  { l: t("avgTime"), v: `${detail.avgMin} min` },
                ].map((x) => (
                  <div key={x.l} className="rounded-md border p-3">
                    <div className="text-lg font-semibold tabular-nums">{x.v}</div>
                    <div className="text-xs text-muted-foreground">{x.l}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-md border p-3 text-sm">
                <span className="text-muted-foreground">{t("common")}: </span>
                {(() => {
                  const tally: Record<string, number> = {};
                  detail.list.forEach((r) => (tally[r.type] = (tally[r.type] || 0) + 1));
                  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
                  return top ? `${top[0]} (${top[1]})` : "-";
                })()}
              </div>

              <Separator />

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{t("feedback")}</span>
                  <Button size="sm" variant="outline" onClick={() => setFbOpen(detail.staff.name)}>
                    {t("addFb")}
                  </Button>
                </div>
                <div className="space-y-1 text-xs">
                  {feedback.filter((f) => f.staff === detail.staff.name).slice(0, 5).map((f) => (
                    <div key={f.id} className="rounded-md border p-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className={FB_META[f.kind].cls}>
                          {FB_META[f.kind][lang]}
                        </Badge>
                        <span className="text-muted-foreground">{f.date} · {f.by}</span>
                      </div>
                      <p className="mt-1">{f.note}</p>
                    </div>
                  ))}
                  {feedback.filter((f) => f.staff === detail.staff.name).length === 0 && (
                    <p className="text-muted-foreground">
                      {lang === "en" ? "No feedback recorded yet." : "अभी कोई फीडबैक नहीं।"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium">{t("history")}</div>
                <div className="max-h-64 space-y-1 overflow-y-auto text-xs">
                  {detail.list.slice(0, 40).map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                      <span>
                        {r.date} · {r.type}
                        {r.returns > 1 && (
                          <span className="ml-1 inline-flex items-center text-amber-600">
                            <RotateCcw className="mr-0.5 h-3 w-3" />×{r.returns}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        {r.outcome === "approved" && (
                          r.onTime ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                          )
                        )}
                        <Badge variant="secondary" className={OUTCOME_LABEL[r.outcome].cls}>
                          {OUTCOME_LABEL[r.outcome][lang]}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {lang === "en"
                  ? "All numbers are calculated from task and review records only. They cannot be edited manually. Cancelled tasks and work awaiting review are not counted."
                  : "सभी आंकड़े केवल टास्क और समीक्षा रिकॉर्ड से बनते हैं। इन्हें हाथ से बदला नहीं जा सकता। रद्द टास्क और समीक्षा-प्रतीक्षित काम नहीं गिने जाते।"}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback dialog */}
      <Dialog open={!!fbOpen} onOpenChange={(o) => !o && setFbOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addFb")}</DialogTitle>
            <DialogDescription>{fbOpen}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">{lang === "en" ? "Feedback type" : "फीडबैक प्रकार"}</Label>
              <Select value={fbKind} onValueChange={(v) => setFbKind(v as Feedback["kind"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(FB_META) as Feedback["kind"][]).map((k) => (
                    <SelectItem key={k} value={k}>{FB_META[k][lang]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{lang === "en" ? "Note" : "नोट"}</Label>
              <Textarea rows={3} value={fbNote} onChange={(e) => setFbNote(e.target.value)} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {lang === "en"
                ? `Will be saved as ${iso(0)} by Administration Manager.`
                : `${iso(0)} को Administration Manager द्वारा सेव होगा।`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFbOpen(null)}>
              {lang === "en" ? "Cancel" : "रद्द करें"}
            </Button>
            <Button onClick={submitFeedback}>{lang === "en" ? "Save Feedback" : "फीडबैक सेव करें"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
