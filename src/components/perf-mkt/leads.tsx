import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Download,
  ExternalLink,
  Filter,
  Flag,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { toneClasses } from "./data";
import {
  CAMPAIGN_RESULTS,
  DATE_RANGES,
  FUNNEL,
  HANDOVER_FLOW,
  INTEGRATION_PLACEHOLDERS,
  LEADS,
  LEADS_PERFORMANCE_PREP,
  LEAD_QUALITY,
  LEAD_SOURCES,
  OFFLINE_RESULTS,
  SOURCE_RESULTS,
  STORE_RESULTS,
  leadAlerts,
  maskPhone,
  pct,
  qualityMeta,
  salesStatusMeta,
  statusMeta,
  type DateRangeId,
  type LeadRecord,
} from "./leads-data";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "stores", label: "Results by Store" },
  { id: "sources", label: "Results by Source" },
  { id: "campaigns", label: "Campaign Results" },
  { id: "leads", label: "Lead Records" },
  { id: "offline", label: "Offline Results" },
  { id: "alerts", label: "Alerts" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const ALL = "all";

function Metric({
  label,
  value,
  sub,
  tone = "draft",
  onClick,
  active,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof toneClasses;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-3 text-left transition hover:border-primary/50 hover:shadow-sm",
        active && "border-primary ring-1 ring-primary/30",
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {sub ? (
        <Badge variant="outline" className={cn("mt-1.5 text-[10px] font-medium", toneClasses[tone])}>
          {sub}
        </Badge>
      ) : null}
    </button>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">
        {value === undefined || value === null || value === "" ? "—" : value}
      </p>
    </div>
  );
}

export function LeadsSalesPage() {
  const [tab, setTab] = useState<TabId>("overview");
  const [range, setRange] = useState<DateRangeId>("last30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [fStore, setFStore] = useState(ALL);
  const [fCity, setFCity] = useState(ALL);
  const [fRm, setFRm] = useState(ALL);
  const [fExec, setFExec] = useState(ALL);
  const [fSalesExec, setFSalesExec] = useState(ALL);
  const [fSource, setFSource] = useState(ALL);
  const [fCampaign, setFCampaign] = useState(ALL);
  const [fCreative, setFCreative] = useState(ALL);
  const [fCreator, setFCreator] = useState(ALL);
  const [fQuality, setFQuality] = useState(ALL);
  const [fSalesStatus, setFSalesStatus] = useState(ALL);
  const [fOutcome, setFOutcome] = useState(ALL);
  const [fVerified, setFVerified] = useState(ALL);

  const [openLead, setOpenLead] = useState<LeadRecord | null>(null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [attrOpen, setAttrOpen] = useState<LeadRecord | null>(null);
  const [attrReason, setAttrReason] = useState("");

  const alerts = useMemo(() => leadAlerts(), []);

  const totals = useMemo(() => {
    const leads = SOURCE_RESULTS.reduce((s, r) => s + r.leads, 0);
    const qualified = SOURCE_RESULTS.reduce((s, r) => s + r.qualified, 0);
    const orders = SOURCE_RESULTS.reduce((s, r) => s + r.orders, 0);
    const unassigned = LEADS.filter((l) => !l.assignedTo).length;
    return { leads, qualified, orders, unassigned };
  }, []);

  const cities = useMemo(() => [...new Set(STORE_RESULTS.map((s) => s.city))], []);
  const rms = useMemo(() => [...new Set(STORE_RESULTS.map((s) => s.rm))], []);
  const salesExecs = useMemo(
    () => [...new Set(LEADS.map((l) => l.assignedTo).filter(Boolean) as string[])],
    [],
  );
  const creatives = useMemo(
    () => [...new Set(LEADS.map((l) => l.creativeId).filter(Boolean) as string[])],
    [],
  );
  const creators = useMemo(
    () => [...new Set(LEADS.map((l) => l.collabId).filter(Boolean) as string[])],
    [],
  );

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LEADS.filter((l) => {
      if (q && ![l.id, l.customer, l.storeName, l.storeId, l.city, l.campaignId ?? "", l.requirement].join(" ").toLowerCase().includes(q)) return false;
      if (fStore !== ALL && l.storeId !== fStore) return false;
      if (fCity !== ALL && l.city !== fCity) return false;
      if (fRm !== ALL && STORE_RESULTS.find((s) => s.storeId === l.storeId)?.rm !== fRm) return false;
      if (fSalesExec !== ALL && l.assignedTo !== fSalesExec) return false;
      if (fSource !== ALL && l.firstSource !== fSource) return false;
      if (fCampaign !== ALL && l.campaignId !== fCampaign) return false;
      if (fCreative !== ALL && l.creativeId !== fCreative) return false;
      if (fCreator !== ALL && l.collabId !== fCreator) return false;
      if (fQuality !== ALL && l.quality !== fQuality) return false;
      if (fSalesStatus !== ALL && l.salesStatus !== fSalesStatus) return false;
      if (fOutcome === "won" && l.salesStatus !== "won") return false;
      if (fOutcome === "lost" && l.salesStatus !== "lost") return false;
      if (fOutcome === "unassigned" && l.assignedTo) return false;
      if (fOutcome === "qualified" && l.quality !== "Qualified") return false;
      return true;
    });
  }, [search, fStore, fCity, fRm, fSalesExec, fSource, fCampaign, fCreative, fCreator, fQuality, fSalesStatus, fOutcome]);

  const filteredStores = useMemo(
    () =>
      STORE_RESULTS.filter((s) => {
        const q = search.trim().toLowerCase();
        if (q && !`${s.storeId} ${s.store} ${s.city} ${s.rm}`.toLowerCase().includes(q)) return false;
        if (fStore !== ALL && s.storeId !== fStore) return false;
        if (fCity !== ALL && s.city !== fCity) return false;
        if (fRm !== ALL && s.rm !== fRm) return false;
        if (fExec !== ALL && s.executive !== fExec) return false;
        return true;
      }),
    [search, fStore, fCity, fRm, fExec],
  );

  const filteredOffline = useMemo(
    () =>
      OFFLINE_RESULTS.filter((o) => {
        if (fStore !== ALL && o.storeId !== fStore) return false;
        if (fVerified === "verified" && o.verification !== "verified") return false;
        if (fVerified === "unverified" && o.verification === "verified") return false;
        return true;
      }),
    [fStore, fVerified],
  );

  const resetFilters = () => {
    [setFStore, setFCity, setFRm, setFExec, setFSalesExec, setFSource, setFCampaign, setFCreative, setFCreator, setFQuality, setFSalesStatus, setFOutcome, setFVerified].forEach((f) => f(ALL));
    setSearch("");
  };

  const sourceChart = SOURCE_RESULTS.map((s) => ({
    name: s.source.replace(" or YouTuber", "").replace("Google Business Profile", "GMB").replace(" Organic", " Org."),
    qualified: s.qualified,
    orders: s.orders,
  }));

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads &amp; Sales Results</h1>
          <p className="text-sm text-muted-foreground">
            Track marketing-generated leads, conversions and store sales results.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Authorised report exported (sample)")}>
            <Download className="mr-1.5 h-4 w-4" /> Export Report
          </Button>
          <Button size="sm" onClick={() => setOfflineOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Offline Result
          </Button>
        </div>
      </div>

      <p className="rounded-md border border-dashed bg-muted/40 p-2.5 text-xs text-muted-foreground">
        This page is for marketing attribution and improvement only. Calling, nurturing and closing leads stays with the
        Sales CRM — marketing cannot change sales ownership, mark a lead won or lost, or edit confirmed order values.
      </p>

      {/* Date filters */}
      <div className="flex flex-wrap items-center gap-2">
        {DATE_RANGES.map((r) => (
          <Button
            key={r.id}
            size="sm"
            variant={range === r.id ? "default" : "outline"}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </Button>
        ))}
        {range === "custom" ? (
          <div className="flex items-center gap-2">
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 w-[140px]" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 w-[140px]" />
          </div>
        ) : null}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Total Leads" value={String(totals.leads)} sub="All sources" tone="active" onClick={() => { setTab("leads"); resetFilters(); }} />
        <Metric label="Qualified Leads" value={String(totals.qualified)} sub={`${pct(totals.qualified, totals.leads)}% of leads`} tone="healthy" onClick={() => { setTab("leads"); setFQuality("Qualified"); }} />
        <Metric label="Orders" value={String(totals.orders)} sub={`${pct(totals.orders, totals.leads)}% conversion`} tone="healthy" onClick={() => { setTab("leads"); setFOutcome("won"); }} />
        <Metric label="Unassigned Leads" value={String(totals.unassigned)} sub="Waiting with Sales Head" tone="overdue" onClick={() => { setTab("leads"); setFOutcome("unassigned"); }} />
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lead, store, city, campaign…" className="pl-8" />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
          <Filter className="mr-1.5 h-4 w-4" /> Filters
        </Button>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RefreshCw className="mr-1.5 h-4 w-4" /> Reset
        </Button>
      </div>

      {showFilters ? (
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Store", value: fStore, set: setFStore, options: STORE_RESULTS.map((s) => ({ v: s.storeId, l: `${s.storeId} — ${s.city}` })) },
              { label: "City", value: fCity, set: setFCity, options: cities.map((c) => ({ v: c, l: c })) },
              { label: "Relationship Manager", value: fRm, set: setFRm, options: rms.map((r) => ({ v: r, l: r })) },
              { label: "Marketing Executive", value: fExec, set: setFExec, options: [{ v: "Nikhil Arora", l: "Nikhil Arora" }] },
              { label: "Sales Executive", value: fSalesExec, set: setFSalesExec, options: salesExecs.map((s) => ({ v: s, l: s })) },
              { label: "Source", value: fSource, set: setFSource, options: LEAD_SOURCES.map((s) => ({ v: s, l: s })) },
              { label: "Campaign", value: fCampaign, set: setFCampaign, options: CAMPAIGN_RESULTS.map((c) => ({ v: c.campaignId, l: `${c.campaignId} — ${c.name}` })) },
              { label: "Creative", value: fCreative, set: setFCreative, options: creatives.map((c) => ({ v: c, l: c })) },
              { label: "Creator Collaboration", value: fCreator, set: setFCreator, options: creators.map((c) => ({ v: c, l: c })) },
              { label: "Lead Quality", value: fQuality, set: setFQuality, options: LEAD_QUALITY.map((q) => ({ v: q, l: q })) },
              { label: "Sales Status", value: fSalesStatus, set: setFSalesStatus, options: Object.entries(salesStatusMeta).map(([v, m]) => ({ v, l: m.label })) },
              { label: "Outcome", value: fOutcome, set: setFOutcome, options: [{ v: "won", l: "Won" }, { v: "lost", l: "Lost" }, { v: "qualified", l: "Qualified" }, { v: "unassigned", l: "Unassigned" }] },
              { label: "Offline Verification", value: fVerified, set: setFVerified, options: [{ v: "verified", l: "Verified" }, { v: "unverified", l: "Unverified" }] },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <Select value={f.value} onValueChange={f.set}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All</SelectItem>
                    {f.options.map((o) => (
                      <SelectItem key={o.v} value={o.v}>
                        {o.l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
              {t.id === "alerts" && alerts.length ? (
                <Badge variant="outline" className={cn("ml-1.5 text-[10px]", toneClasses.overdue)}>{alerts.length}</Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Overview */}
      {tab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Performance Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {FUNNEL.map((stage, i) => {
                const prevStage = i > 0 ? FUNNEL[i - 1] : null;
                const conv = prevStage ? pct(stage.value, prevStage.value) : null;
                const change = pct(stage.value - stage.previous, stage.previous);
                const width = Math.max(12, 100 - i * 14);
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{stage.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">
                          {stage.value.toLocaleString("en-IN")}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px]", change >= 0 ? toneClasses.healthy : toneClasses.overdue)}>
                          {change >= 0 ? <TrendingUp className="mr-1 inline h-3 w-3" /> : <TrendingDown className="mr-1 inline h-3 w-3" />}
                          {change >= 0 ? "+" : ""}{change}% vs previous
                        </Badge>
                      </span>
                    </div>
                    <div className="h-6 rounded bg-muted">
                      <div className="h-6 rounded bg-primary/70" style={{ width: `${width}%` }} />
                    </div>
                    {conv !== null ? (
                      <p className="text-xs text-muted-foreground">
                        {conv}% moved from {prevStage!.label} · {Math.round((100 - conv) * 10) / 10}% drop-off
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Lead Handover Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {HANDOVER_FLOW.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">{i + 1}</span>
                    <span>{s}</span>
                  </div>
                ))}
                <p className="pt-1 text-xs text-muted-foreground">
                  One Lead ID is created at capture and kept through every handover. Source, campaign and creative
                  attribution are preserved; duplicates are merged with full touch history.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Qualified Leads &amp; Orders by Source</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceChart} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={54} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ReTooltip />
                    <Bar dataKey="qualified" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]}>
                      {sourceChart.map((e) => (
                        <Cell key={e.name} />
                      ))}
                    </Bar>
                    <Bar dataKey="orders" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Performance Data Preparation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LEADS_PERFORMANCE_PREP.map((p) => (
                <div key={p.label} className="rounded-md border p-2.5">
                  <p className="text-xs text-muted-foreground">{p.label}</p>
                  <p className="text-lg font-semibold">{p.value}</p>
                  <p className="text-[11px] text-muted-foreground">{p.note}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-3">
                Recorded for future employee performance measurement. The final KPI score is not calculated here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Integration Placeholders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {INTEGRATION_PLACEHOLDERS.map((p) => (
                <div key={p} className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs">
                  <span>{p}</span>
                  <Badge variant="outline" className={toneClasses.draft}>Not connected</Badge>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">
                Until integrations are active, all figures are entered manually and need supporting proof.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Results by store */}
      {tab === "stores" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Results by Store</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["Store ID", "Store / City", "RM", "Marketing Exec", "Leads", "Qualified", "Orders", "Lead→Order", "% of Target", "Status", "Next Action"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((s) => (
                  <tr key={s.storeId} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{s.storeId}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{s.store}</p>
                      <p className="text-xs text-muted-foreground">{s.city}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{s.rm}</td>
                    <td className="whitespace-nowrap px-3 py-2">{s.executive}</td>
                    <td className="px-3 py-2">{s.leads}</td>
                    <td className="px-3 py-2">{s.qualified}</td>
                    <td className="px-3 py-2">{s.orders}</td>
                    <td className="px-3 py-2">{pct(s.orders, s.leads)}%</td>
                    <td className="px-3 py-2">{pct(s.orders, s.targetOrders)}%</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={toneClasses[statusMeta[s.status].tone]}>{statusMeta[s.status].label}</Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{s.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {/* Results by source */}
      {tab === "sources" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Results by Source</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["Source", "Leads", "Qualified", "Orders", "Conversion", "Tracking"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOURCE_RESULTS.filter((s) => fSource === ALL || s.source === fSource).map((s) => (
                  <tr key={s.source} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">{s.source}</td>
                    <td className="px-3 py-2">{s.leads}</td>
                    <td className="px-3 py-2">{s.qualified}</td>
                    <td className="px-3 py-2">{s.orders}</td>
                    <td className="px-3 py-2">{pct(s.orders, s.leads)}%</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={s.tracked ? toneClasses.healthy : toneClasses.attention}>
                        {s.tracked ? "Tracked" : "Manual / partial"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {/* Campaign results */}
      {tab === "campaigns" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Campaign Results</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1150px] text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["Campaign ID", "Campaign", "Store", "Platform", "Objective", "Dates", "Leads", "Qualified", "Orders", "Conversion", "Status", ""].map((h, i) => (
                    <th key={`${h}-${i}`} className="whitespace-nowrap px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAMPAIGN_RESULTS.filter((c) => (fCampaign === ALL || c.campaignId === fCampaign) && (fStore === ALL || c.storeId === fStore)).map((c) => (
                  <tr key={c.campaignId} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{c.campaignId}</td>
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">{c.storeId === "COMPANY" ? "Company campaign" : c.storeId}</td>
                    <td className="whitespace-nowrap px-3 py-2">{c.platform}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">{c.objective}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">{c.startDate} → {c.endDate ?? "Ongoing"}</td>
                    <td className="px-3 py-2">{c.leads}</td>
                    <td className="px-3 py-2">{c.qualified}</td>
                    <td className="px-3 py-2">{c.orders}</td>
                    <td className="px-3 py-2">{pct(c.orders, c.leads)}%</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={c.status === "Running" ? toneClasses.active : c.status === "Needs Review" ? toneClasses.overdue : c.status === "Completed" ? toneClasses.healthy : toneClasses.draft}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Opening ${c.campaignId} in Campaigns`)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {/* Lead records */}
      {tab === "leads" ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Showing {filteredLeads.length} lead record(s). Customer phone numbers are masked — full numbers are visible
            only to the assigned Sales user.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredLeads.map((l) => (
              <Card key={l.id} className="cursor-pointer transition hover:border-primary/50" onClick={() => setOpenLead(l)}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{l.id}</p>
                      <p className="font-medium">{l.customer}</p>
                      <p className="text-xs text-muted-foreground">{maskPhone(l.phone)} · {l.city}</p>
                    </div>
                    <Badge variant="outline" className={toneClasses[qualityMeta[l.quality].tone]}>{l.quality}</Badge>
                  </div>
                  <p className="text-xs">{l.requirement}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{l.firstSource}</Badge>
                    {l.campaignId ? <Badge variant="outline" className="text-[10px]">{l.campaignId}</Badge> : null}
                    {l.collabId ? <Badge variant="outline" className="text-[10px]">{l.collabId}</Badge> : null}
                    <Badge variant="outline" className={cn("text-[10px]", toneClasses[salesStatusMeta[l.salesStatus].tone])}>
                      {salesStatusMeta[l.salesStatus].label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{l.storeId === "COMPANY" ? "Company franchise" : l.storeId}</span>
                    <span>{l.orderStatus === "Order Placed" ? "Order placed" : l.receivedAt}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!filteredLeads.length ? (
              <p className="text-sm text-muted-foreground">No leads match the selected filters.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Offline results */}
      {tab === "offline" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Offline Sales Entries</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["Entry ID", "Store", "Reference", "Order Date", "Lead ID", "Source / Promo", "Proof", "Submitted By", "Verification"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOffline.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{o.id}</td>
                    <td className="whitespace-nowrap px-3 py-2">{o.storeId}</td>
                    <td className="whitespace-nowrap px-3 py-2">{o.reference}</td>
                    <td className="whitespace-nowrap px-3 py-2">{o.orderDate}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{o.leadId ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{o.sourceOrPromo}</td>
                    <td className="px-3 py-2 text-xs">{o.proof}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">{o.submittedBy}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={o.verification === "verified" ? toneClasses.healthy : o.verification === "rejected" ? toneClasses.overdue : toneClasses.attention}>
                        {o.verification === "verified" ? `Verified — ${o.verifiedBy}` : o.verification === "rejected" ? "Rejected" : "Awaiting verification"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="p-3 text-xs text-muted-foreground">
              Manually entered results appear in final sales totals only after an authorised user verifies them.
              Confirmed sales results cannot be deleted by executives.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Alerts */}
      {tab === "alerts" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className={cn("mt-0.5 h-4 w-4", a.severity === "high" ? "text-red-500" : "text-amber-500")} />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                  {a.ref ? <p className="font-mono text-[11px] text-muted-foreground">{a.ref}</p> : null}
                </div>
              </CardContent>
            </Card>
          ))}
          {!alerts.length ? <p className="text-sm text-muted-foreground">No alerts right now.</p> : null}
        </div>
      ) : null}

      {/* Lead detail sheet */}
      <Sheet open={!!openLead} onOpenChange={(o) => !o && setOpenLead(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {openLead ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {openLead.customer}
                  <Badge variant="outline" className={toneClasses[qualityMeta[openLead.quality].tone]}>{openLead.quality}</Badge>
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {openLead.id} · received {openLead.receivedAt}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone (protected)" value={maskPhone(openLead.phone)} />
                  <Field label="City" value={openLead.city} />
                  <Field label="Store ID" value={openLead.storeId} />
                  <Field label="Store" value={openLead.storeName} />
                  <Field label="Enquiry type" value={openLead.enquiryType} />
                  <Field label="Requirement" value={openLead.requirement} />
                </div>

                <Separator />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attribution</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First source (permanent)" value={openLead.firstSource} />
                  <Field label="Latest source" value={openLead.latestSource} />
                  <Field label="Campaign ID" value={openLead.campaignId} />
                  <Field label="Creative ID" value={openLead.creativeId} />
                  <Field label="Collaboration ID" value={openLead.collabId} />
                  <Field label="Tracking link / promo code" value={openLead.trackingRef} />
                </div>
                <div className="space-y-1.5">
                  {openLead.touchHistory.map((t) => (
                    <div key={t.at} className="rounded-md border p-2 text-xs">
                      <p className="font-medium">{t.source}</p>
                      <p className="text-muted-foreground">{t.at} — {t.detail}</p>
                    </div>
                  ))}
                </div>

                <Separator />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Handover status</p>
                <div className="space-y-1.5">
                  {HANDOVER_FLOW.map((s, i) => {
                    const currentIdx = HANDOVER_FLOW.indexOf(openLead.stage);
                    const done = i <= currentIdx;
                    return (
                      <div key={s} className="flex items-center gap-2 text-sm">
                        <span className={cn("h-2 w-2 rounded-full", done ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                        <span className={cn(done ? "" : "text-muted-foreground")}>{s}</span>
                        {i === currentIdx ? <Badge variant="outline" className={cn("text-[10px]", toneClasses.active)}>Current</Badge> : null}
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Assigned to" value={openLead.assignedTo ? `${openLead.assignedTo} (${openLead.assignedRole})` : "Not assigned"} />
                  <Field label="Handover date & time" value={openLead.handoverAt} />
                </div>

                <Separator />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sales feedback (read-only for marketing)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Sales status" value={salesStatusMeta[openLead.salesStatus].label} />
                  <Field label="Contacted" value={openLead.contacted ? "Yes" : "No"} />
                  <Field label="Qualified / unqualified" value={openLead.quality} />
                  <Field label="Reason" value={openLead.qualityReason} />
                  <Field label="Order status" value={openLead.orderStatus} />
                  <Field label="Lost reason" value={openLead.lostReason} />
                  <Field label="Last CRM update" value={openLead.lastCrmUpdate} />
                </div>
                {openLead.salesNotes ? (
                  <p className="rounded-md border bg-muted/40 p-2 text-xs">{openLead.salesNotes}</p>
                ) : null}

                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Sales status update requested for ${openLead.id}`)}>
                    <RefreshCw className="mr-1.5 h-4 w-4" /> Request Sales Update
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setAttrOpen(openLead); setAttrReason(""); }}>
                    <Flag className="mr-1.5 h-4 w-4" /> Report Incorrect Attribution
                  </Button>
                  {openLead.campaignId ? (
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Opening ${openLead.campaignId}`)}>
                      <ExternalLink className="mr-1.5 h-4 w-4" /> Open Campaign
                    </Button>
                  ) : null}
                  {openLead.creativeId ? (
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Opening ${openLead.creativeId}`)}>
                      <ExternalLink className="mr-1.5 h-4 w-4" /> Open Creative
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Opening ${openLead.storeId}`)}>
                    <ArrowRight className="mr-1.5 h-4 w-4" /> Open Store
                  </Button>
                </div>
                <p className="flex items-start gap-2 rounded-md border border-dashed p-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Marketing cannot change sales ownership, mark this lead won or lost, or edit confirmed order values.
                  Every view and action is recorded in the audit trail.
                </p>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Report attribution dialog */}
      <Dialog open={!!attrOpen} onOpenChange={(o) => !o && setAttrOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report incorrect attribution</DialogTitle>
            <DialogDescription>
              {attrOpen?.id} — the original first source is kept permanently; your report goes to the manager for review.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={attrReason} onChange={(e) => setAttrReason(e.target.value)} placeholder="What looks wrong? (source, campaign, creative, store…)" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttrOpen(null)}>Cancel</Button>
            <Button
              disabled={attrReason.trim().length < 5}
              onClick={() => {
                toast.success("Attribution issue reported for review");
                setAttrOpen(null);
              }}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offline result dialog */}
      <Dialog open={offlineOpen} onOpenChange={setOfflineOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Offline Result</DialogTitle>
            <DialogDescription>
              For authorised manual entries only. The result is counted in sales totals after verification.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Store ID</Label>
              <Select defaultValue={STORE_RESULTS[0].storeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STORE_RESULTS.map((s) => (
                    <SelectItem key={s.storeId} value={s.storeId}>{s.storeId} — {s.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Customer or order reference</Label>
              <Input placeholder="INV-…" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Order date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Related Lead ID (if available)</Label>
              <Input placeholder="LEAD-…" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Source or promo code</Label>
              <Input placeholder="e.g. GMB offer post / JPRAUG" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Supporting proof</Label>
              <Input type="file" />
              <p className="text-[11px] text-muted-foreground">Bill photo, POS screenshot or store register photo.</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Submitted by</Label>
              <Input defaultValue="Nikhil Arora (Performance Marketing Executive)" readOnly />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-dashed p-2 text-[11px] text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5" /> Verification status will be set to “Awaiting verification”.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfflineOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast.success("Offline result submitted for verification");
                setOfflineOpen(false);
              }}
            >
              Submit for Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lead Quality Mix</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEAD_QUALITY.map((q) => {
            const count = LEADS.filter((l) => l.quality === q).length;
            return (
              <div key={q} className="space-y-1 rounded-md border p-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{q}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <Progress value={pct(count, LEADS.length)} className="h-1.5" />
                {qualityMeta[q].reasonRequired ? (
                  <p className="text-[11px] text-muted-foreground">Reason required when marked</p>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default LeadsSalesPage;
