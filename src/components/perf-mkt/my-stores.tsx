import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Image as ImageIcon,
  IndianRupee,
  Inbox,
  Link2,
  MapPin,
  Megaphone,
  Minus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Store as StoreIcon,
  Users,
  Video,
} from "lucide-react";
import {
  CAMPAIGNS,
  REQUESTS,
  STORES,
  campaignStatusMeta,
  inr,
  requestStatusTone,
  toneClasses,
  type StoreCard,
  type Tone,
} from "./data";
import {
  CITY_STATE,
  STORE_DETAILS,
  computeHealth,
  healthMeta,
  type MarketingHealth,
} from "./stores-data";

const TABS = [
  { id: "all", label: "All Stores" },
  { id: "active", label: "Active Marketing" },
  { id: "attention", label: "Attention Required" },
  { id: "new", label: "New Stores" },
  { id: "no_campaign", label: "No Active Campaign" },
  { id: "profile_pending", label: "Profile Setup Pending" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Pill({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

function TrendIcon({ trend }: { trend: "up" | "flat" | "down" }) {
  if (trend === "up") return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />;
  if (trend === "down") return <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

function StoreLogo({ name }: { name: string }) {
  const short = name.replace("Clean Craft ", "").slice(0, 2).toUpperCase();
  return (
    <div className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-br from-primary/70 to-primary/30 grid place-items-center text-sm font-bold text-primary-foreground">
      {short}
    </div>
  );
}

function activeCampaignsFor(storeId: string) {
  return CAMPAIGNS.filter(
    (c) => c.storeId === storeId && c.status !== "completed" && c.status !== "awaiting_approval",
  );
}

const setupLabel: Record<string, { label: string; tone: Tone }> = {
  complete: { label: "Complete", tone: "healthy" },
  partial: { label: "Partial", tone: "attention" },
  not_started: { label: "Not started", tone: "draft" },
};

export function PerfMktMyStores() {
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [detailSection, setDetailSection] = useState("overview");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Record<string, string[]>>({});

  const [fCity, setFCity] = useState("all");
  const [fRm, setFRm] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fPlatform, setFPlatform] = useState("all");
  const [fTrend, setFTrend] = useState("all");
  const [fProfile, setFProfile] = useState("all");
  const [fRequests, setFRequests] = useState("all");
  const [fAssigned, setFAssigned] = useState("all");

  const enriched = useMemo(
    () =>
      STORES.map((s) => {
        const detail = STORE_DETAILS[s.id]!;
        const { health, reasons } = computeHealth(s.id);
        const active = activeCampaignsFor(s.id);
        const completeness = Math.round(
          detail.profiles.reduce((a, p) => a + p.completeness, 0) / detail.profiles.length,
        );
        return { store: s, detail, health, reasons, active, completeness };
      }),
    [],
  );

  const filtersActive =
    [fCity, fRm, fStatus, fPlatform, fTrend, fProfile, fRequests, fAssigned].filter(
      (v) => v !== "all",
    ).length;

  const q = query.trim().toLowerCase();
  const rows = enriched.filter(({ store, detail, health, active, completeness }) => {
    if (
      q &&
      !(
        store.name.toLowerCase().includes(q) ||
        store.id.toLowerCase().includes(q) ||
        store.city.toLowerCase().includes(q) ||
        detail.owner.toLowerCase().includes(q)
      )
    )
      return false;

    if (tab === "active" && active.length === 0) return false;
    if (tab === "attention" && !(health === "needs_attention" || health === "critical")) return false;
    if (tab === "new" && detail.assignedDate < "2026-07-01") return false;
    if (tab === "no_campaign" && active.length > 0) return false;
    if (tab === "profile_pending" && !detail.profiles.some((p) => p.setup !== "complete"))
      return false;

    if (fCity !== "all" && store.city !== fCity && detail.state !== fCity) return false;
    if (fRm !== "all" && store.rm !== fRm) return false;
    if (fStatus !== "all" && health !== fStatus) return false;
    if (fPlatform !== "all" && !active.some((c) => c.platform === fPlatform)) return false;
    if (fTrend !== "all" && detail.salesTrend !== fTrend) return false;
    if (fProfile === "complete" && completeness < 90) return false;
    if (fProfile === "incomplete" && completeness >= 90) return false;
    if (fRequests === "pending" && store.pendingRequests === 0) return false;
    if (fRequests === "none" && store.pendingRequests > 0) return false;
    if (fAssigned === "recent" && detail.assignedDate < "2026-07-01") return false;
    if (fAssigned === "older" && detail.assignedDate >= "2026-07-01") return false;
    return true;
  });

  const totals = {
    assigned: enriched.length,
    withCampaigns: enriched.filter((e) => e.active.length > 0).length,
    attention: enriched.filter((e) => e.health === "needs_attention" || e.health === "critical")
      .length,
    noMarketing: enriched.filter((e) => e.active.length === 0).length,
  };

  const open = openId ? enriched.find((e) => e.store.id === openId) : null;

  function resetFilters() {
    setFCity("all");
    setFRm("all");
    setFStatus("all");
    setFPlatform("all");
    setFTrend("all");
    setFProfile("all");
    setFRequests("all");
    setFAssigned("all");
  }

  function saveNote() {
    if (!noteFor || !note.trim()) {
      toast.error("Write a note before saving.");
      return;
    }
    setNotes((p) => ({ ...p, [noteFor]: [note.trim(), ...(p[noteFor] ?? [])] }));
    toast.success(`Note added to ${noteFor}`, { description: "Recorded in activity history." });
    setNote("");
    setNoteFor(null);
  }

  const quickActions = (storeId: string) => [
    { label: "View Marketing Requests", icon: Inbox, run: () => setDetailSection("requests") },
    { label: "Create Campaign", icon: Megaphone, run: () => toast.success(`Campaign draft created for ${storeId}`) },
    { label: "Request Creative", icon: ImageIcon, run: () => toast.success(`Creative request raised for ${storeId}`) },
    { label: "Update Store Profile", icon: MapPin, run: () => setDetailSection("profiles") },
    { label: "Add Influencer Activity", icon: Video, run: () => toast.success(`Influencer activity added for ${storeId}`) },
    { label: "Record Lead", icon: Users, run: () => toast.success(`Lead recorded against ${storeId}`) },
    { label: "Record Sales Result", icon: IndianRupee, run: () => toast.success(`Sales result linked to ${storeId}`) },
    { label: "Add Store Note", icon: History, run: () => setNoteFor(storeId) },
  ];

  const cities = Array.from(new Set(STORES.map((s) => s.city)));
  const rms = Array.from(new Set(STORES.map((s) => s.rm)));

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">My Stores</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Franchise stores assigned to you — one primary Performance Marketing Executive per
              store, permanent Store ID across every module.
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
                Filter{filtersActive ? ` (${filtersActive})` : ""}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-3">
              {[
                { label: "City / State", value: fCity, set: setFCity, options: [...cities, ...Array.from(new Set(Object.values(CITY_STATE)))] },
                { label: "Relationship Manager", value: fRm, set: setFRm, options: rms },
              ].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Select value={f.value} onValueChange={f.set}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {f.options.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs">Store status</Label>
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="setup_pending">Setup Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Active campaign platform</Label>
                <Select value={fPlatform} onValueChange={setFPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sales trend</Label>
                <Select value={fTrend} onValueChange={setFTrend}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="up">Increasing</SelectItem>
                    <SelectItem value="flat">Stable</SelectItem>
                    <SelectItem value="down">Declining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Profile completion</Label>
                <Select value={fProfile} onValueChange={setFProfile}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="complete">90% and above</SelectItem>
                    <SelectItem value="incomplete">Below 90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pending marketing requests</Label>
                <Select value={fRequests} onValueChange={setFRequests}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Has pending requests</SelectItem>
                    <SelectItem value="none">No pending requests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Assigned date</Label>
                <Select value={fAssigned} onValueChange={setFAssigned}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="recent">Assigned recently</SelectItem>
                    <SelectItem value="older">Assigned earlier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
                Clear filters
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { l: "Total Assigned Stores", v: totals.assigned, cls: "bg-muted/20" },
            { l: "Stores with Active Campaigns", v: totals.withCampaigns, cls: "bg-sky-500/5 border-sky-500/30" },
            { l: "Stores Requiring Attention", v: totals.attention, cls: "bg-amber-500/5 border-amber-500/30" },
            { l: "Stores without Active Marketing", v: totals.noMarketing, cls: "bg-red-500/5 border-red-500/30" },
          ].map((k) => (
            <div key={k.l} className={`rounded-lg border p-3 ${k.cls}`}>
              <div className="text-xs text-muted-foreground">{k.l}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{k.v}</div>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search store name, Store ID, city or owner"
            className="pl-9"
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      {/* Store cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ store, detail, health, reasons, active, completeness }) => (
          <Card key={store.id} className="overflow-hidden">
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-start gap-3">
                <StoreLogo name={store.name} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{store.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {store.id} · {store.city}, {detail.state}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Owner {detail.owner} · RM {store.rm}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Marketing Executive: {detail.executive}
                  </div>
                </div>
                <Pill tone={healthMeta[health].tone}>{healthMeta[health].label}</Pill>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Active campaigns</div>
                  <div className="font-medium tabular-nums">{active.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Leads this month</div>
                  <div className="font-medium tabular-nums">{store.leadsThisMonth}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Orders this month</div>
                  <div className="font-medium tabular-nums text-emerald-600 flex items-center gap-1">
                    {store.ordersThisMonth} <TrendIcon trend={detail.salesTrend} />
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Profile completeness</div>
                  <div className="font-medium tabular-nums">{completeness}%</div>
                </div>
              </div>
              <Progress value={completeness} />

              {detail.attention.length > 0 && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 space-y-1">
                  {detail.attention.slice(0, 2).map((a) => (
                    <div key={a} className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-500">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {a}
                    </div>
                  ))}
                  {detail.attention.length > 2 && (
                    <div className="text-[11px] text-muted-foreground">
                      +{detail.attention.length - 2} more
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">Health reason: {reasons[0]}</p>

              <div className="flex items-center justify-between gap-2">
                <Pill tone={store.pendingRequests > 0 ? "attention" : "healthy"}>
                  {store.pendingRequests} pending request{store.pendingRequests === 1 ? "" : "s"}
                </Pill>
                <Button
                  size="sm"
                  onClick={() => {
                    setOpenId(store.id);
                    setDetailSection("overview");
                  }}
                >
                  View Store
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No assigned stores match this tab, search or filter.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Store detail */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <StoreIcon className="w-4 h-4 text-primary" /> {open.store.name}
                </SheetTitle>
                <SheetDescription>
                  {open.store.id} · {open.store.city}, {open.detail.state} · Health:{" "}
                  {healthMeta[open.health].label}
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-8 space-y-4">
                <Tabs value={detailSection} onValueChange={setDetailSection}>
                  <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                    {[
                      ["overview", "Overview"],
                      ["requests", "Requests"],
                      ["campaigns", "Campaigns"],
                      ["creatives", "Creatives"],
                      ["profiles", "Profiles"],
                      ["influencers", "Influencers"],
                      ["leads", "Leads & Sales"],
                      ["history", "Activity History"],
                    ].map(([id, label]) => (
                      <TabsTrigger key={id} value={id} className="text-xs">
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {detailSection === "overview" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Store ID", open.store.id],
                      ["Store name", open.store.name],
                      ["Franchise owner", open.detail.owner],
                      ["Contact", `${open.detail.ownerPhone} · ${open.detail.ownerEmail}`],
                      ["Address", open.detail.address],
                      ["City / State", `${open.store.city}, ${open.detail.state}`],
                      ["Launch date", open.detail.launchDate],
                      ["Relationship Manager", open.store.rm],
                      ["Performance Marketing Executive", open.detail.executive],
                      ["Operating status", open.detail.operatingStatus],
                      ["Primary marketing objective", open.detail.objective],
                      ["Target service area", open.detail.serviceArea],
                      ["Monthly lead target", String(open.detail.monthlyLeadTarget)],
                      [
                        "Current sales trend",
                        open.detail.salesTrend === "up"
                          ? "Increasing"
                          : open.detail.salesTrend === "down"
                            ? "Declining"
                            : "Stable",
                      ],
                      ["Assigned to executive on", open.detail.assignedDate],
                    ].map(([l, v]) => (
                      <div key={l} className="rounded-md border p-2.5">
                        <div className="text-[11px] text-muted-foreground">{l}</div>
                        <div className="text-sm font-medium break-words">{v}</div>
                      </div>
                    ))}
                    <div className="sm:col-span-2 rounded-md border p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Advertising and social credentials are never displayed or stored here — access
                      is granted through official platform connections only.
                    </div>
                  </div>
                )}

                {detailSection === "requests" && (
                  <div className="space-y-2">
                    {REQUESTS.filter((r) => r.storeId === open.store.id).map((r) => (
                      <div key={r.id} className="rounded-md border p-3 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium">{r.type}</div>
                          <Pill tone={requestStatusTone[r.status]}>{r.status.replace("_", " ")}</Pill>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {r.id} · submitted by {r.requestedBy} · priority {r.priority} · due{" "}
                          {r.dueDate}
                        </div>
                        <div className="text-xs">
                          Next action:{" "}
                          {r.status === "new"
                            ? "Accept or return the request"
                            : r.status === "returned"
                              ? "Awaiting RM response"
                              : "Complete and notify Relationship Manager"}
                        </div>
                      </div>
                    ))}
                    {REQUESTS.filter((r) => r.storeId === open.store.id).length === 0 && (
                      <p className="text-sm text-muted-foreground">No requests for this store.</p>
                    )}
                  </div>
                )}

                {detailSection === "campaigns" && (
                  <div className="space-y-2">
                    {CAMPAIGNS.filter((c) => c.storeId === open.store.id).map((c) => (
                      <div key={c.id} className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{c.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {c.id} · {c.platform} · {c.objective} · from {c.startDate}
                            </div>
                          </div>
                          <Pill tone={campaignStatusMeta[c.status].tone}>
                            {campaignStatusMeta[c.status].label}
                          </Pill>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          <div>
                            <div className="text-muted-foreground">Reach / Clicks</div>
                            <div className="font-medium tabular-nums">
                              {c.reach.toLocaleString("en-IN")} / {c.clicks.toLocaleString("en-IN")}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Leads / Qualified</div>
                            <div className="font-medium tabular-nums">
                              {c.leads} / {c.qualified}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Orders</div>
                            <div className="font-medium tabular-nums text-emerald-600">
                              {c.orders}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Creative ready</div>
                            <div className={c.creativeReady ? "text-emerald-600" : "text-red-600"}>
                              {c.creativeReady ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                        <Progress value={c.targetAchievedPct} />
                      </div>
                    ))}
                    {CAMPAIGNS.filter((c) => c.storeId === open.store.id).length === 0 && (
                      <p className="text-sm text-muted-foreground">No campaigns yet for this store.</p>
                    )}
                  </div>
                )}

                {detailSection === "creatives" && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      { l: "Approved store graphics", v: open.detail.creatives.storeGraphics, t: "healthy" as Tone },
                      { l: "Festival creatives", v: open.detail.creatives.festival, t: "healthy" as Tone },
                      { l: "Offer creatives", v: open.detail.creatives.offer, t: "healthy" as Tone },
                      { l: "Campaign creatives", v: open.detail.creatives.campaign, t: "active" as Tone },
                      { l: "Awaiting approval", v: open.detail.creatives.awaitingApproval, t: "attention" as Tone },
                      { l: "Requiring correction", v: open.detail.creatives.correction, t: "overdue" as Tone },
                    ].map((c) => (
                      <div key={c.l} className={`rounded-md border p-2.5 ${toneClasses[c.t]}`}>
                        <div className="text-[11px]">{c.l}</div>
                        <div className="text-xl font-semibold tabular-nums">{c.v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {detailSection === "profiles" && (
                  <div className="space-y-2">
                    {open.detail.profiles.map((p) => (
                      <div key={p.network} className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{p.network}</div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <Link2 className="w-3 h-3 shrink-0" /> {p.url}
                            </div>
                          </div>
                          <Pill tone={setupLabel[p.setup].tone}>{setupLabel[p.setup].label}</Pill>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                          <div>
                            <div className="text-muted-foreground">Last updated</div>
                            <div className="font-medium">{p.lastUpdated}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Completeness</div>
                            <div className="font-medium tabular-nums">{p.completeness}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Verification</div>
                            <div className="font-medium">
                              {p.verification === "verified"
                                ? "Verified"
                                : p.verification === "pending"
                                  ? "Pending"
                                  : "—"}
                            </div>
                          </div>
                        </div>
                        {p.issue && (
                          <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-500">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {p.issue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {detailSection === "influencers" && (
                  <div className="space-y-2">
                    {open.detail.influencers.map((i) => (
                      <div key={i.id} className="rounded-md border p-3 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium truncate">
                            {i.name} · {i.platform}
                          </div>
                          <Pill tone={i.contentStatus === "overdue" ? "overdue" : i.contentStatus === "published" ? "healthy" : "attention"}>
                            {i.contentStatus.replace("_", " ")}
                          </Pill>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {i.id} · {i.activity} · planned {i.plannedDate} · {i.status}
                        </div>
                        <div className="text-xs">
                          Leads {i.leads} · Orders {i.orders}
                          {i.publishedLink && (
                            <span className="text-muted-foreground"> · {i.publishedLink}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {open.detail.influencers.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No influencer activity for this store yet.
                      </p>
                    )}
                  </div>
                )}

                {detailSection === "leads" && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(() => {
                      const l = open.detail.leadsSales;
                      const conv = l.leads ? Math.round((l.orders / l.leads) * 1000) / 10 : 0;
                      return [
                        ["Leads generated", String(l.leads)],
                        ["Qualified leads", String(l.qualified)],
                        ["Leads handed over", String(l.handedOver)],
                        ["Leads contacted", String(l.contacted)],
                        ["Orders generated", String(l.orders)],
                        ["Target achieved", `${l.targetAchievedPct}%`],
                        ["Conversion rate", `${conv}%`],
                      ].map(([l2, v]) => (
                        <div key={l2} className="rounded-md border p-2.5 bg-muted/20">
                          <div className="text-[11px] text-muted-foreground">{l2}</div>
                          <div className="text-lg font-semibold tabular-nums">{v}</div>
                        </div>
                      ));
                    })()}
                    <p className="sm:col-span-3 text-[11px] text-muted-foreground">
                      Store ID → Campaign ID → Lead ID → Order or Sale. Each Lead ID is counted once.
                    </p>
                  </div>
                )}

                {detailSection === "history" && (
                  <div className="space-y-2">
                    {(notes[open.store.id] ?? []).map((n, i) => (
                      <div key={`note-${i}`} className="rounded-md border p-3">
                        <div className="text-[11px] text-muted-foreground">
                          Today · {open.detail.executive} · Store note
                        </div>
                        <div className="text-sm">{n}</div>
                      </div>
                    ))}
                    {open.detail.activity.map((a) => (
                      <div key={a.at + a.detail} className="rounded-md border p-3">
                        <div className="text-[11px] text-muted-foreground">
                          {a.at} · {a.actor}
                        </div>
                        <div className="text-sm">{a.detail}</div>
                      </div>
                    ))}
                    <p className="text-[11px] text-muted-foreground">
                      Assignment, campaign, profile and status changes stay on this Store ID even
                      after reassignment.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm font-medium">Quick Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions(open.store.id).map((a) => (
                      <Button
                        key={a.label}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-2"
                        onClick={a.run}
                      >
                        <a.icon className="w-4 h-4" />
                        <span className="truncate text-xs">{a.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Store note */}
      <Dialog open={!!noteFor} onOpenChange={(o) => !o && setNoteFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add store note — {noteFor}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Marketing observation, owner feedback or next step"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteFor(null)}>
              Cancel
            </Button>
            <Button onClick={saveNote}>Save note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { StoreCard, MarketingHealth };
