import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Download,
  Info,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { SectionHead } from "./ui";

/* ---------------- sample analytics data (front-end only) ---------------- */

type Trend = { value: number | null; prev: number | null };
const NA = "Data delayed";

const BRANDS = ["All Brands", "Clean Craft Franchise", "Clean Craft Services", "GILM Institute"];
const PLATFORMS = ["All Platforms", "Instagram", "Facebook", "YouTube", "LinkedIn", "X", "Other"];
const PERIODS = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "This Quarter",
  "Custom Date Range",
];

const KPIS: {
  label: string;
  value: number | null;
  prev: number | null;
  fmt?: "int" | "pct";
  tip: string;
}[] = [
  { label: "Content Published", value: 46, prev: 39, tip: "Unique content items published in the period, counted once by Content ID. Excludes test and deleted records." },
  { label: "Total Reach", value: 1284000, prev: 1102000, tip: "Unique accounts that saw the content, as reported by each platform. Organic and paid shown separately below." },
  { label: "Total Views", value: 2143000, prev: 1998000, tip: "Total video/post views. Platforms count a view differently, so views are never merged with reach." },
  { label: "Engagement Rate", value: 5.4, prev: 4.8, fmt: "pct", tip: "(Likes + comments + shares + saves) divided by reach, averaged across platforms with comparable definitions." },
  { label: "Followers Gained", value: 4820, prev: 3960, tip: "Net new followers across connected accounts in the period." },
  { label: "Enquiries Generated", value: 168, prev: 141, tip: "Social enquiries captured on Leads & Handover, counted once by Lead ID." },
  { label: "Qualified Leads", value: 96, prev: 78, tip: "Enquiries that passed the qualification check. Duplicates and spam are excluded." },
  { label: "Leads Accepted by Sales", value: 71, prev: 60, tip: "Leads accepted by the Sales Head in the Sales CRM. Sourced from the same Lead ID — never recreated." },
];

type PlatformRow = {
  platform: string;
  published: number;
  reach: number | null;
  views: number | null;
  watchTime: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number | null;
  profileVisits: number | null;
  followers: number;
  enquiries: number;
  qualified: number;
  note?: string;
};

const PLATFORM_ROWS: PlatformRow[] = [
  { platform: "Instagram", published: 18, reach: 612000, views: 940000, watchTime: "11.2 hrs", likes: 38200, comments: 2140, shares: 3160, saves: 4180, profileVisits: 22800, followers: 2410, enquiries: 78, qualified: 44 },
  { platform: "Facebook", published: 11, reach: 318000, views: 452000, watchTime: "5.4 hrs", likes: 14100, comments: 980, shares: 1620, saves: 640, profileVisits: 8100, followers: 860, enquiries: 34, qualified: 17 },
  { platform: "YouTube", published: 7, reach: 214000, views: 601000, watchTime: "1,940 hrs", likes: 9800, comments: 1120, shares: 740, saves: null, profileVisits: 6400, followers: 1180, enquiries: 31, qualified: 22, note: "Saves are not reported by this platform." },
  { platform: "LinkedIn", published: 6, reach: 96000, views: 118000, watchTime: "1.8 hrs", likes: 3400, comments: 410, shares: 520, saves: 210, profileVisits: 3900, followers: 320, enquiries: 19, qualified: 11 },
  { platform: "X", published: 3, reach: 34000, views: 32000, watchTime: "0.4 hrs", likes: 810, comments: 96, shares: 210, saves: 44, profileVisits: 610, followers: 50, enquiries: 4, qualified: 2 },
  { platform: "Other", published: 1, reach: null, views: null, watchTime: NA, likes: 0, comments: 0, shares: 0, saves: null, profileVisits: null, followers: 0, enquiries: 2, qualified: 0, note: "Pinterest insights delayed — values not shown as zero." },
];

type ContentRow = {
  id: string;
  title: string;
  platform: string;
  type: string;
  date: string;
  reach: number;
  views: number;
  er: number;
  avgWatch: string;
  completion: number | null;
  enquiries: number;
  qualified: number;
  followUp: number;
  paid: boolean;
  brand: string;
};

const CONTENT_ROWS: ContentRow[] = [
  { id: "CC-CN-1049", title: "Franchise Owner Story — Jaipur", platform: "Instagram", type: "Testimonials", date: "2 Aug 2026", reach: 214000, views: 341000, er: 7.9, avgWatch: "0:22", completion: 61, enquiries: 42, qualified: 28, followUp: 19, paid: true, brand: "Clean Craft Franchise" },
  { id: "CC-CN-1044", title: "Machine Walkthrough — Full Plant", platform: "YouTube", type: "Long Videos", date: "29 Jul 2026", reach: 128000, views: 291000, er: 4.1, avgWatch: "4:38", completion: 44, enquiries: 26, qualified: 19, followUp: 13, paid: false, brand: "Clean Craft Franchise" },
  { id: "CC-CN-1052", title: "Fabric Care in 30 Seconds", platform: "Instagram", type: "Short Videos", date: "4 Aug 2026", reach: 268000, views: 402000, er: 6.2, avgWatch: "0:14", completion: 72, enquiries: 14, qualified: 5, followUp: 3, paid: false, brand: "Clean Craft Services" },
  { id: "CC-CN-1050", title: "GILM Webinar Promo", platform: "Facebook", type: "Advertisements", date: "1 Aug 2026", reach: 141000, views: 176000, er: 3.4, avgWatch: "0:19", completion: 51, enquiries: 22, qualified: 12, followUp: 8, paid: true, brand: "GILM Institute" },
  { id: "CC-CN-1046", title: "Corporate Laundry Cost Sheet", platform: "LinkedIn", type: "Educational Videos", date: "31 Jul 2026", reach: 62000, views: 71000, er: 5.8, avgWatch: "1:05", completion: 48, enquiries: 19, qualified: 11, followUp: 9, paid: false, brand: "Clean Craft Services" },
  { id: "CC-CN-1043", title: "Steam Iron Product Demo", platform: "Instagram", type: "Product Videos", date: "27 Jul 2026", reach: 88000, views: 121000, er: 4.6, avgWatch: "0:17", completion: 58, enquiries: 9, qualified: 3, followUp: 2, paid: false, brand: "Clean Craft Services" },
  { id: "CC-CN-1041", title: "Franchise Training Day 1", platform: "YouTube", type: "Training Videos", date: "24 Jul 2026", reach: 41000, views: 96000, er: 3.1, avgWatch: "6:12", completion: 39, enquiries: 7, qualified: 5, followUp: 4, paid: false, brand: "Clean Craft Franchise" },
  { id: "CC-CN-1038", title: "Why Franchise With Clean Craft", platform: "Facebook", type: "Franchise Videos", date: "21 Jul 2026", reach: 97000, views: 118000, er: 4.9, avgWatch: "0:41", completion: 46, enquiries: 18, qualified: 10, followUp: 7, paid: true, brand: "Clean Craft Franchise" },
];

const TYPE_ROWS = [
  { type: "Short Videos", published: 14, reach: 486000, er: 6.1, enquiries: 34, qualified: 12 },
  { type: "Long Videos", published: 6, reach: 198000, er: 4.0, enquiries: 33, qualified: 24 },
  { type: "Advertisements", published: 8, reach: 302000, er: 3.6, enquiries: 41, qualified: 21 },
  { type: "Testimonials", published: 5, reach: 261000, er: 7.6, enquiries: 46, qualified: 31 },
  { type: "Educational Videos", published: 6, reach: 141000, er: 5.5, enquiries: 22, qualified: 13 },
  { type: "Product Videos", published: 4, reach: 112000, er: 4.4, enquiries: 11, qualified: 4 },
  { type: "Franchise Videos", published: 2, reach: 118000, er: 4.9, enquiries: 18, qualified: 10 },
  { type: "Training Videos", published: 1, reach: 41000, er: 3.1, enquiries: 7, qualified: 5 },
];

const CAMPAIGN_ROWS = [
  { name: "Franchise Aug — Reel Ads", published: 9, reach: 421000, engagement: 31200, enquiries: 58, qualified: 34, accepted: 27, won: 6, revenue: 4200000, cpl: null, roas: null, paid: true },
  { name: "Service Awareness", published: 12, reach: 388000, engagement: 22800, enquiries: 31, qualified: 11, accepted: 8, won: 2, revenue: 260000, cpl: null, roas: null, paid: false },
  { name: "B2B Corporate Laundry", published: 7, reach: 158000, engagement: 9100, enquiries: 24, qualified: 16, accepted: 14, won: 3, revenue: 1850000, cpl: null, roas: null, paid: false },
  { name: "Webinar Promo", published: 6, reach: 196000, engagement: 8400, enquiries: 29, qualified: 18, accepted: 13, won: 4, revenue: 420000, cpl: null, roas: null, paid: true },
  { name: "Machine Tour Organic", published: 5, reach: 121000, engagement: 6600, enquiries: 26, qualified: 17, accepted: 9, won: 1, revenue: 700000, cpl: null, roas: null, paid: false },
];

const ATTRIBUTION = [
  { label: "Leads generated", value: 168, tip: "Unique Lead IDs created from social enquiries." },
  { label: "Duplicate leads", value: 14, tip: "Enquiries merged into an existing lead — never counted twice in totals." },
  { label: "Qualified leads", value: 96, tip: "Passed the qualification check on Leads & Handover." },
  { label: "Leads handed over", value: 88, tip: "Sent to the Sales Head as the same lead record." },
  { label: "Accepted by Sales Head", value: 71, tip: "Accepted in the Sales CRM and assigned to an executive." },
  { label: "Meetings generated", value: 39, tip: "Meetings logged in the Sales CRM against a social-sourced lead." },
  { label: "Sales won", value: 16, tip: "Won opportunities in the Sales CRM linked to a social Lead ID." },
  { label: "Revenue attributed", value: 7430000, tip: "Only verified Won opportunity value from the Sales CRM. Never estimated.", money: true },
];

const AUDIENCE = {
  age: [
    { k: "18–24", v: 14 },
    { k: "25–34", v: 41 },
    { k: "35–44", v: 28 },
    { k: "45–54", v: 12 },
    { k: "55+", v: 5 },
  ],
  gender: [
    { k: "Male", v: 62 },
    { k: "Female", v: 37 },
    { k: "Not specified", v: 1 },
  ],
  cities: ["Jaipur", "Pune", "Delhi NCR", "Bhopal", "Kochi", "Ludhiana"],
  languages: ["Hindi 54%", "English 33%", "Marathi 7%", "Other 6%"],
  activeTime: "19:00 – 22:00 IST",
  newReturning: "New 68% · Returning 32%",
  followerReach: "Followers 41% · Non-followers 59%",
};

const TIME_PERF = [
  { slot: "07–10", er: 3.1, reach: 96000 },
  { slot: "10–13", er: 4.2, reach: 148000 },
  { slot: "13–16", er: 3.8, reach: 131000 },
  { slot: "16–19", er: 5.1, reach: 214000 },
  { slot: "19–22", er: 7.4, reach: 396000 },
  { slot: "22–07", er: 2.6, reach: 68000 },
];

const DAY_PERF = [
  { day: "Mon", er: 4.1 },
  { day: "Tue", er: 4.8 },
  { day: "Wed", er: 5.6 },
  { day: "Thu", er: 5.1 },
  { day: "Fri", er: 6.4 },
  { day: "Sat", er: 6.9 },
  { day: "Sun", er: 5.2 },
];

const INSIGHTS = [
  { tone: "good", text: "Testimonials generate the most qualified leads — 31 from only 5 posts (highest qualified-lead rate of any content type)." },
  { tone: "warn", text: "Short videos receive the highest reach (486K) but the lowest lead conversion — 12 qualified from 34 enquiries (35%)." },
  { tone: "warn", text: "Facebook is producing enquiries with poor qualification — 34 enquiries but only 17 qualified (50% vs 56% company average)." },
  { tone: "good", text: "Publishing between 19:00 and 22:00 shows the strongest engagement (7.4% vs 4.6% average)." },
  { tone: "bad", text: "3 approved content items have been waiting more than 4 days before publication — schedule them on the Publishing Calendar." },
  { tone: "warn", text: "2 publishing failures recorded this period (token expiry on Pinterest). Platform data for 'Other' is delayed and is not shown as zero." },
];

function fmtInt(n: number) {
  return n.toLocaleString("en-IN");
}
function fmtCompact(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
function fmtMoney(n: number) {
  return `₹${(n / 100000).toFixed(1)}L`;
}

function Metric({ tip }: { tip: string }) {
  return (
    <UiTooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs">{tip}</TooltipContent>
    </UiTooltip>
  );
}

export function SmmAnalyticsPage() {
  const [period, setPeriod] = useState("Last 30 Days");
  const [brand, setBrand] = useState("All Brands");
  const [platform, setPlatform] = useState("All Platforms");
  const [compare, setCompare] = useState(true);
  const [paidView, setPaidView] = useState<"all" | "organic" | "paid">("all");
  const [detail, setDetail] = useState<ContentRow | null>(null);
  const [from, setFrom] = useState("2026-07-06");
  const [to, setTo] = useState("2026-08-04");

  const platformRows = useMemo(
    () => (platform === "All Platforms" ? PLATFORM_ROWS : PLATFORM_ROWS.filter((p) => p.platform === platform)),
    [platform],
  );

  const contentRows = useMemo(
    () =>
      CONTENT_ROWS.filter(
        (c) =>
          (platform === "All Platforms" || c.platform === platform) &&
          (brand === "All Brands" || c.brand === brand) &&
          (paidView === "all" || (paidView === "paid" ? c.paid : !c.paid)),
      ),
    [platform, brand, paidView],
  );

  const campaignRows = useMemo(
    () => CAMPAIGN_ROWS.filter((c) => paidView === "all" || (paidView === "paid" ? c.paid : !c.paid)),
    [paidView],
  );

  const top = useMemo(() => {
    const best = (fn: (c: ContentRow) => number) =>
      [...CONTENT_ROWS].sort((a, b) => fn(b) - fn(a))[0];
    const watchSec = (c: ContentRow) => {
      const [m, s] = c.avgWatch.split(":").map(Number);
      return m * 60 + s;
    };
    return [
      { label: "Highest reach", tip: "Unique accounts reached.", c: best((c) => c.reach), val: (c: ContentRow) => fmtCompact(c.reach) },
      { label: "Highest engagement", tip: "Engagement rate, not raw views.", c: best((c) => c.er), val: (c: ContentRow) => `${c.er}%` },
      { label: "Highest watch time", tip: "Average watch time per viewer.", c: best(watchSec), val: (c: ContentRow) => c.avgWatch },
      { label: "Most enquiries", tip: "Unique Lead IDs attributed to this Content ID.", c: best((c) => c.enquiries), val: (c: ContentRow) => `${c.enquiries} enquiries` },
      { label: "Most qualified leads", tip: "Enquiries that passed qualification.", c: best((c) => c.qualified), val: (c: ContentRow) => `${c.qualified} qualified` },
      { label: "Best conversion to sales follow-up", tip: "Share of enquiries that reached Sales follow-up in the Sales CRM.", c: best((c) => c.followUp / Math.max(c.enquiries, 1)), val: (c: ContentRow) => `${Math.round((c.followUp / c.enquiries) * 100)}% follow-up` },
    ];
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHead
            title="Social Media Analytics"
            sub="Which platforms, campaigns and content generate real engagement, enquiries, qualified leads and sales results."
          />
          <Button
            variant="outline"
            onClick={() => toast.success("Report prepared for download (front-end preview).")}
          >
            <Download className="h-4 w-4 mr-1" /> Export Report
          </Button>
        </div>

        <Card>
          <CardContent className="pt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs">Reporting period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Brand / business unit</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <div className="flex items-center gap-2">
                <Switch id="cmp" checked={compare} onCheckedChange={setCompare} />
                <Label htmlFor="cmp" className="text-xs">
                  Compare with previous period
                </Label>
              </div>
              <div className="flex gap-1">
                {(["all", "organic", "paid"] as const).map((v) => (
                  <Button
                    key={v}
                    size="sm"
                    variant={paidView === v ? "default" : "outline"}
                    className="h-7 text-xs capitalize"
                    onClick={() => setPaidView(v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
            {period === "Custom Date Range" && (
              <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-end gap-2">
                <div>
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
                </div>
              </div>
            )}
            <p className="sm:col-span-2 lg:col-span-4 text-[11px] text-muted-foreground">
              Showing <b>{period === "Custom Date Range" ? `${from} to ${to}` : period}</b> · {brand} · {platform} ·{" "}
              {paidView === "all" ? "organic and paid shown separately in tables" : `${paidView} only`}
              {compare && " · compared with the previous equivalent period"}
            </p>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k) => {
            const delta =
              k.value !== null && k.prev !== null ? ((k.value - k.prev) / k.prev) * 100 : null;
            const up = (delta ?? 0) >= 0;
            return (
              <div key={k.label} className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {k.label} <Metric tip={k.tip} />
                </div>
                <div className="text-2xl font-bold tabular-nums mt-1">
                  {k.value === null ? NA : k.fmt === "pct" ? `${k.value}%` : fmtCompact(k.value)}
                </div>
                {compare && delta !== null && (
                  <div
                    className={`text-[11px] mt-0.5 inline-flex items-center gap-1 ${
                      up ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}
                    {delta.toFixed(1)}% vs previous
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Platform analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1">
              Platform Analytics <Metric tip="Metrics are shown per platform and never merged, because platforms define reach, views and watch time differently." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformRows.map((p) => ({ name: p.platform, Reach: p.reach ?? 0, Enquiries: p.enquiries * 2000, Qualified: p.qualified * 2000 }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v: number) => fmtCompact(v)} />
                  <Tooltip formatter={(v: number, n: string) => (n === "Reach" ? fmtInt(v) : fmtInt(v / 2000))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Reach" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Enquiries" fill="hsl(var(--chart-2, 190 80% 45%))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Qualified" fill="hsl(var(--chart-3, 145 60% 40%))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[900px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    {["Platform", "Published", "Reach", "Views", "Watch time", "Likes", "Comments", "Shares", "Saves", "Profile visits", "Followers", "Enquiries", "Qualified"].map((h) => (
                      <th key={h} className="text-left py-2 pr-3 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {platformRows.map((p) => (
                    <tr key={p.platform} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium whitespace-nowrap">
                        {p.platform}
                        {p.note && <Metric tip={p.note} />}
                      </td>
                      <td className="py-2 pr-3">{p.published}</td>
                      <td className="py-2 pr-3">{p.reach === null ? <span className="text-amber-600">{NA}</span> : fmtInt(p.reach)}</td>
                      <td className="py-2 pr-3">{p.views === null ? <span className="text-amber-600">{NA}</span> : fmtInt(p.views)}</td>
                      <td className="py-2 pr-3">{p.watchTime}</td>
                      <td className="py-2 pr-3">{fmtInt(p.likes)}</td>
                      <td className="py-2 pr-3">{fmtInt(p.comments)}</td>
                      <td className="py-2 pr-3">{fmtInt(p.shares)}</td>
                      <td className="py-2 pr-3">{p.saves === null ? <span className="text-muted-foreground">Not reported</span> : fmtInt(p.saves)}</td>
                      <td className="py-2 pr-3">{p.profileVisits === null ? <span className="text-amber-600">{NA}</span> : fmtInt(p.profileVisits)}</td>
                      <td className="py-2 pr-3">+{p.followers}</td>
                      <td className="py-2 pr-3">{p.enquiries}</td>
                      <td className="py-2 pr-3 font-medium">{p.qualified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top content */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1">
              Top Content <Metric tip="Winners are chosen on reach, engagement, watch time, enquiries, qualified leads and sales follow-up — never on views alone." />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((t) => (
              <div key={t.label} className="rounded-lg border p-3">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  {t.label} <Metric tip={t.tip} />
                </div>
                <div className="font-medium text-sm mt-1">{t.c.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {t.c.id} · {t.c.platform} · {t.c.type}
                </div>
                <Badge variant="secondary" className="mt-2">
                  {t.val(t.c)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {/* desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-xs min-w-[1050px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    {["", "Content", "Content ID", "Platform", "Type", "Published", "Reach", "Views", "Eng. rate", "Avg watch", "Completion", "Enquiries", "Qualified", ""].map((h, i) => (
                      <th key={i} className="text-left py-2 pr-3 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contentRows.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <div className="h-9 w-14 rounded bg-muted grid place-items-center text-[9px] text-muted-foreground">
                          {c.type.split(" ")[0]}
                        </div>
                      </td>
                      <td className="py-2 pr-3 font-medium max-w-[220px]">{c.title}</td>
                      <td className="py-2 pr-3">{c.id}</td>
                      <td className="py-2 pr-3">{c.platform}</td>
                      <td className="py-2 pr-3">
                        {c.type} {c.paid && <Badge variant="secondary" className="ml-1">Paid</Badge>}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">{c.date}</td>
                      <td className="py-2 pr-3">{fmtInt(c.reach)}</td>
                      <td className="py-2 pr-3">{fmtInt(c.views)}</td>
                      <td className="py-2 pr-3">{c.er}%</td>
                      <td className="py-2 pr-3">{c.avgWatch}</td>
                      <td className="py-2 pr-3">{c.completion === null ? NA : `${c.completion}%`}</td>
                      <td className="py-2 pr-3">{c.enquiries}</td>
                      <td className="py-2 pr-3 font-medium">{c.qualified}</td>
                      <td className="py-2">
                        <Button size="sm" variant="outline" onClick={() => setDetail(c)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* mobile cards */}
            <div className="grid gap-3 lg:hidden">
              {contentRows.map((c) => (
                <div key={c.id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex gap-3">
                    <div className="h-12 w-16 rounded bg-muted grid place-items-center text-[9px] text-muted-foreground shrink-0">
                      {c.type.split(" ")[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.id} · {c.platform} · {c.date}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <div>Reach {fmtCompact(c.reach)}</div>
                    <div>Views {fmtCompact(c.views)}</div>
                    <div>ER {c.er}%</div>
                    <div>Watch {c.avgWatch}</div>
                    <div>Compl. {c.completion ?? "—"}%</div>
                    <div>Qual. {c.qualified}</div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setDetail(c)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content type analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content-Type Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TYPE_ROWS.map((t) => ({ name: t.type.replace(" Videos", ""), Reach: t.reach, Qualified: t.qualified * 8000 }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={10} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis fontSize={11} tickFormatter={(v: number) => fmtCompact(v)} />
                  <Tooltip formatter={(v: number, n: string) => (n === "Reach" ? fmtInt(v) : fmtInt(v / 8000))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Reach" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Qualified" fill="hsl(var(--chart-3, 145 60% 40%))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[620px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    {["Content type", "Published", "Reach", "Engagement rate", "Enquiries", "Qualified leads", "Qualification %"].map((h) => (
                      <th key={h} className="text-left py-2 pr-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TYPE_ROWS.map((t) => (
                    <tr key={t.type} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{t.type}</td>
                      <td className="py-2 pr-3">{t.published}</td>
                      <td className="py-2 pr-3">{fmtInt(t.reach)}</td>
                      <td className="py-2 pr-3">{t.er}%</td>
                      <td className="py-2 pr-3">{t.enquiries}</td>
                      <td className="py-2 pr-3 font-medium">{t.qualified}</td>
                      <td className="py-2 pr-3">{Math.round((t.qualified / t.enquiries) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Campaign analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1">
              Campaign Analytics <Metric tip="Cost per lead and ROAS stay blank until verified advertising spend and Sales CRM revenue are connected." />
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  {["Campaign", "Published", "Reach", "Engagement", "Enquiries", "Qualified", "Accepted", "Sales won", "Revenue attributed", "Cost per lead", "ROAS"].map((h) => (
                    <th key={h} className="text-left py-2 pr-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaignRows.map((c) => (
                  <tr key={c.name} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium whitespace-nowrap">
                      {c.name} {c.paid && <Badge variant="secondary" className="ml-1">Paid</Badge>}
                    </td>
                    <td className="py-2 pr-3">{c.published}</td>
                    <td className="py-2 pr-3">{fmtInt(c.reach)}</td>
                    <td className="py-2 pr-3">{fmtInt(c.engagement)}</td>
                    <td className="py-2 pr-3">{c.enquiries}</td>
                    <td className="py-2 pr-3">{c.qualified}</td>
                    <td className="py-2 pr-3">{c.accepted}</td>
                    <td className="py-2 pr-3 font-medium">{c.won}</td>
                    <td className="py-2 pr-3">{fmtMoney(c.revenue)}</td>
                    <td className="py-2 pr-3 text-muted-foreground">Awaiting verified spend</td>
                    <td className="py-2 pr-3 text-muted-foreground">Awaiting verified spend</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-muted-foreground mt-2">
              Revenue shown comes only from Won opportunities in the Sales CRM. Advertising ROI is not calculated without verified spend.
            </p>
          </CardContent>
        </Card>

        {/* Lead attribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead Attribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-muted p-2 text-[11px] overflow-x-auto whitespace-nowrap">
              Platform → Social Account → Campaign → Advertisement → Content ID → Lead ID → Sales Pipeline → Won or Lost
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ATTRIBUTION.map((a) => (
                <div key={a.label} className="rounded-lg border p-3">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {a.label} <Metric tip={a.tip} />
                  </div>
                  <div className="text-xl font-bold tabular-nums">
                    {a.money ? fmtMoney(a.value) : fmtInt(a.value)}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div className="rounded-md border p-2">
                <b>First-touch source</b> — Instagram · Franchise Aug — Reel Ads · CC-CN-1049 (preserved on the lead record)
              </div>
              <div className="rounded-md border p-2">
                <b>Latest-touch source</b> — YouTube · Machine Tour Organic · CC-CN-1044 (stored separately, never overwrites first touch)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audience + publishing */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1">
                Audience Insights <Metric tip="Only aggregated demographic data received legally from authorised platforms. No individual customer data is shown." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <div className="font-medium mb-1">Age group</div>
                {AUDIENCE.age.map((a) => (
                  <div key={a.k} className="flex items-center gap-2 mb-1">
                    <span className="w-14 text-muted-foreground">{a.k}</span>
                    <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${a.v}%` }} />
                    </div>
                    <span className="w-8 text-right">{a.v}%</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Gender</div>
                  {AUDIENCE.gender.map((g) => (
                    <div key={g.k}>{g.k} {g.v}%</div>
                  ))}
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Top cities</div>
                  {AUDIENCE.cities.join(", ")}
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Language</div>
                  {AUDIENCE.languages.join(" · ")}
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Most active time</div>
                  {AUDIENCE.activeTime}
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">New vs returning viewers</div>
                  {AUDIENCE.newReturning}
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Follower vs non-follower reach</div>
                  {AUDIENCE.followerReach}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                LinkedIn and X do not share age or gender breakdowns — those platforms are excluded from this view rather than shown as zero.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Publishing Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TIME_PERF}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="slot" fontSize={11} />
                    <YAxis fontSize={11} unit="%" />
                    <Tooltip formatter={(v: number) => `${v}% engagement`} />
                    <Line type="monotone" dataKey="er" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Best publishing days</div>
                  Saturday (6.9%), Friday (6.4%)
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Best publishing times</div>
                  19:00 – 22:00 IST
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Content frequency</div>
                  1.5 posts / day (target 2)
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Missed schedules</div>
                  <span className="text-amber-600">3 in this period</span>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Publishing failures</div>
                  <span className="text-destructive">2 (token expiry)</span>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Weekday engagement</div>
                  {DAY_PERF.map((d) => `${d.day} ${d.er}%`).join(" · ")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practical insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Practical Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {INSIGHTS.map((i, idx) => (
              <div
                key={idx}
                className={`text-xs rounded-md border px-2 py-2 ${
                  i.tone === "bad"
                    ? "border-destructive/40 text-destructive"
                    : i.tone === "warn"
                    ? "border-amber-300 text-amber-800"
                    : "border-emerald-300 text-emerald-800"
                }`}
              >
                {i.text}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Data Rules & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground space-y-1">
            <p>Attribution uses Content ID and Lead ID. Each content item and lead is counted once in primary totals. Test posts, deleted-platform records and verified duplicates are excluded.</p>
            <p>Organic and paid performance are reported separately. Missing or delayed platform data is labelled and never replaced with zero. Incompatible platform metrics are not combined. Historical snapshots are preserved when platforms restate data.</p>
            <p>Social Media Account Manager sees assigned brands and accounts · Sales Head sees lead and sales-attribution summaries · CEO sees company-level summaries · Video Editors see approved content-performance summaries only. Lead contact details are never shown on analytics screens.</p>
          </CardContent>
        </Card>

        {/* Content detail */}
        <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent className="max-w-lg">
            {detail && (
              <>
                <DialogHeader>
                  <DialogTitle>{detail.title}</DialogTitle>
                  <DialogDescription>
                    {detail.id} · {detail.platform} · {detail.type} · published {detail.date}
                    {detail.paid ? " · paid" : " · organic"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Reach", fmtInt(detail.reach)],
                    ["Views", fmtInt(detail.views)],
                    ["Engagement rate", `${detail.er}%`],
                    ["Average watch time", detail.avgWatch],
                    ["Completion rate", detail.completion === null ? NA : `${detail.completion}%`],
                    ["Enquiries generated", String(detail.enquiries)],
                    ["Qualified leads", String(detail.qualified)],
                    ["Reached sales follow-up", String(detail.followUp)],
                    ["Brand", detail.brand],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border p-2">
                      <div className="text-muted-foreground">{k}</div>
                      <div className="font-medium">{v}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Attribution chain: {detail.platform} → account → campaign → advertisement → {detail.id} → Lead IDs → Sales pipeline. Lead contact details are not shown here.
                </p>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
