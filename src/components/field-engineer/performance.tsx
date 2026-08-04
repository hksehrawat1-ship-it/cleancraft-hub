import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Wrench, PhoneCall, Star } from "lucide-react";
import { type Bi, type Lang } from "./data";

const KPIS: {
  label: Bi;
  value: string;
  sub: Bi;
  pct: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[] = [
  {
    label: { en: "Jobs Closed", hi: "पूरे किए कार्य" },
    value: "48",
    sub: { en: "This month", hi: "इस महीने" },
    pct: 100,
    icon: CheckCircle2,
    tone: "text-emerald-600",
  },
  {
    label: { en: "First Visit Fix", hi: "पहली विज़िट में ठीक" },
    value: "82%",
    sub: { en: "Target 80%", hi: "लक्ष्य 80%" },
    pct: 82,
    icon: Wrench,
    tone: "text-emerald-600",
  },
  {
    label: { en: "Avg. Resolution", hi: "औसत समाधान समय" },
    value: "1.4 d",
    sub: { en: "Target under 2 days", hi: "लक्ष्य 2 दिन से कम" },
    pct: 88,
    icon: Clock,
    tone: "text-sky-600",
  },
  {
    label: { en: "Resolved On Call", hi: "कॉल पर हल" },
    value: "31%",
    sub: { en: "No visit needed", hi: "विज़िट की ज़रूरत नहीं" },
    pct: 31,
    icon: PhoneCall,
    tone: "text-sky-600",
  },
  {
    label: { en: "Owner Rating", hi: "मालिक की रेटिंग" },
    value: "4.6",
    sub: { en: "Out of 5", hi: "5 में से" },
    pct: 92,
    icon: Star,
    tone: "text-emerald-600",
  },
  {
    label: { en: "Reports Pending", hi: "लंबित रिपोर्ट" },
    value: "2",
    sub: { en: "Submit same day", hi: "उसी दिन जमा करें" },
    pct: 40,
    icon: Clock,
    tone: "text-amber-600",
  },
];

const WEEKS: { week: Bi; closed: number; onTime: number; reopened: number }[] = [
  { week: { en: "Week 1", hi: "सप्ताह 1" }, closed: 11, onTime: 10, reopened: 1 },
  { week: { en: "Week 2", hi: "सप्ताह 2" }, closed: 13, onTime: 12, reopened: 1 },
  { week: { en: "Week 3", hi: "सप्ताह 3" }, closed: 12, onTime: 12, reopened: 0 },
  { week: { en: "Week 4", hi: "सप्ताह 4" }, closed: 12, onTime: 11, reopened: 1 },
];

const NOTES: Bi[] = [
  { en: "Strength: quick response on machine breakdown calls.", hi: "मज़बूती: मशीन खराबी कॉल पर तेज़ प्रतिक्रिया।" },
  { en: "Improve: submit the work report before leaving the store.", hi: "सुधार: स्टोर छोड़ने से पहले कार्य रिपोर्ट जमा करें।" },
  { en: "Expense bills must be uploaded within 24 hours.", hi: "खर्च के बिल 24 घंटे में अपलोड करें।" },
];

export function FieldEngineerPerformance({ lang }: { lang: Lang }) {
  const t = (b: Bi) => b[lang];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{lang === "hi" ? "मेरा प्रदर्शन" : "My Performance"}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "hi"
            ? "आपके कार्य, समाधान समय और स्टोर मालिकों की रेटिंग।"
            : "Your jobs, resolution speed and store owner ratings."}
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
          <CardTitle className="text-base">{lang === "hi" ? "सप्ताह अनुसार" : "Week by week"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {WEEKS.map((w) => (
            <div key={w.week.en} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
              <span className="text-sm font-medium">{t(w.week)}</span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                  {lang === "hi" ? "बंद" : "Closed"} {w.closed}
                </Badge>
                <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600">
                  {lang === "hi" ? "समय पर" : "On time"} {w.onTime}
                </Badge>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600">
                  {lang === "hi" ? "फिर खुला" : "Reopened"} {w.reopened}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{lang === "hi" ? "समीक्षा नोट्स" : "Review notes"}</CardTitle>
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
