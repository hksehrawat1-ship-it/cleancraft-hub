import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, RotateCcw, ThumbsUp, CalendarCheck } from "lucide-react";
import type { Bi, Lang } from "./pantry-cleaning-data";

const KPIS: {
  label: Bi;
  value: string;
  sub: Bi;
  pct: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[] = [
  {
    label: { en: "Tasks Completed", hi: "पूरे किए काम" },
    value: "142",
    sub: { en: "This month", hi: "इस महीने" },
    pct: 100,
    icon: CheckCircle2,
    tone: "text-emerald-600",
  },
  {
    label: { en: "On-Time Work", hi: "समय पर काम" },
    value: "94%",
    sub: { en: "133 of 142", hi: "142 में 133" },
    pct: 94,
    icon: Clock,
    tone: "text-emerald-600",
  },
  {
    label: { en: "Approved First Time", hi: "पहली बार में मंज़ूर" },
    value: "89%",
    sub: { en: "Target 90%", hi: "लक्ष्य 90%" },
    pct: 89,
    icon: ThumbsUp,
    tone: "text-sky-600",
  },
  {
    label: { en: "Work Returned", hi: "वापस भेजा काम" },
    value: "6",
    sub: { en: "Redo asked by manager", hi: "मैनेजर ने दोबारा कराया" },
    pct: 40,
    icon: RotateCcw,
    tone: "text-amber-600",
  },
  {
    label: { en: "Attendance", hi: "उपस्थिति" },
    value: "26/27",
    sub: { en: "1 leave taken", hi: "1 छुट्टी ली" },
    pct: 96,
    icon: CalendarCheck,
    tone: "text-emerald-600",
  },
];

const WEEKS: { week: Bi; done: number; onTime: number; returned: number }[] = [
  { week: { en: "Week 1", hi: "सप्ताह 1" }, done: 34, onTime: 33, returned: 1 },
  { week: { en: "Week 2", hi: "सप्ताह 2" }, done: 36, onTime: 34, returned: 2 },
  { week: { en: "Week 3", hi: "सप्ताह 3" }, done: 35, onTime: 33, returned: 1 },
  { week: { en: "Week 4", hi: "सप्ताह 4" }, done: 37, onTime: 33, returned: 2 },
];

const NOTES: Bi[] = [
  { en: "Manager praise: pantry kept ready before every meeting.", hi: "मैनेजर की तारीफ़: हर मीटिंग से पहले पैंट्री तैयार रही।" },
  { en: "Work to improve: add photo proof with every completed task.", hi: "सुधार करें: हर पूरे काम के साथ फोटो लगाएं।" },
  { en: "Safety: gloves and wet floor sign used every time.", hi: "सुरक्षा: हर बार दस्ताने और गीला फर्श बोर्ड इस्तेमाल हुआ।" },
];

export function StaffMyPerformance({ lang }: { lang: Lang }) {
  const t = (b: Bi) => b[lang];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{lang === "hi" ? "मेरा प्रदर्शन" : "My Performance"}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "hi"
            ? "इस महीने आपका काम, समय की पाबंदी और मैनेजर की मंज़ूरी।"
            : "Your work this month — completion, timeliness and manager approvals."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {KPIS.map((k) => (
          <Card key={k.label.en}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t(k.label)}</span>
                <k.icon className={`h-5 w-5 ${k.tone}`} />
              </div>
              <div className="text-3xl font-bold tabular-nums">{k.value}</div>
              <Progress value={k.pct} className="h-2" />
              <p className="text-xs text-muted-foreground">{t(k.sub)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {lang === "hi" ? "सप्ताह अनुसार काम" : "Week by week"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {WEEKS.map((w) => (
            <div key={w.week.en} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
              <span className="text-sm font-medium">{t(w.week)}</span>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                  {lang === "hi" ? "पूरे" : "Done"} {w.done}
                </Badge>
                <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600">
                  {lang === "hi" ? "समय पर" : "On time"} {w.onTime}
                </Badge>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600">
                  {lang === "hi" ? "वापस" : "Returned"} {w.returned}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {lang === "hi" ? "मैनेजर के नोट्स" : "Manager notes"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {NOTES.map((n) => (
            <p key={n.en} className="rounded-md border px-3 py-2 text-sm">
              {t(n)}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
