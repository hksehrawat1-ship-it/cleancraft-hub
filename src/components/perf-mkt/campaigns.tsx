import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeIndianRupee,
  CheckCircle2,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  LineChart,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

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

import { inr, toneClasses } from "./data";
import {
  APPROVAL_CHECKLIST,
  CAMPAIGNS_FULL,
  CAMPAIGN_TODAY,
  OBJECTIVES,
  budgetUsedPct,
  campaignAlerts,
  campaignStageMeta,
  conversion,
  cpc,
  cpl,
  cpql,
  cps,
  ctr,
  roas,
  type CampaignRecord,
  type CampaignStage,
} from "./campaigns-data";

const TABS = [
  { id: "all", label: "All Campaigns" },
  { id: "google", label: "Google Ads" },
  { id: "meta", label: "Meta Ads" },
  { id: "drafts", label: "Drafts" },
  { id: "active", label: "Active" },
  { id: "attention", label: "Attention Required" },
  { id: "completed", label: "Completed" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const LIVE: CampaignStage[] = ["active", "optimisation_required", "budget_exhausted"];
const DONE: CampaignStage[] = ["completed", "report_submitted", "closed"];
const DRAFTY: CampaignStage[] = ["draft", "information_required", "rejected", "cancelled"];

const WIZARD_STEPS = [
  "Select Store",
  "Define Objective",
  "Define Audience",
  "Budget and Dates",
  "Creative and Offer",
  "Lead Handover",
  "Review and Submit",
];

function StageBadge({ stage }: { stage: CampaignStage }) {
  const meta = campaignStageMeta[stage];
  return (
    <Badge variant="outline" className={cn("font-medium", toneClasses[meta.tone])}>
      {meta.label}
    </Badge>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "draft",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? (
          <Badge variant="outline" className={cn("mt-2 text-[11px]", toneClasses[tone])}>
            {hint}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value === undefined || value === null || value === "" ? "—" : value}</p>
    </div>
  );
}

export function PerfMktCampaigns() {
  const [campaigns] = useState<CampaignRecord[]>(CAMPAIGNS_FULL);
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [store, setStore] = useState("all");
  const [rm, setRm] = useState("all");
  const [exec, setExec] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [objective, setObjective] = useState("all");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [budgetBand, setBudgetBand] = useState("all");
  const [perf, setPerf] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);

  const selected = campaigns.find((c) => c.id === openId) ?? null;

  const options = useMemo(
    () => ({
      stores: Array.from(new Set(campaigns.map((c) => c.store))),
      rms: Array.from(new Set(campaigns.map((c) => c.rm))),
      execs: Array.from(new Set(campaigns.map((c) => c.executive))),
    }),
    [campaigns],
  );

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const alerts = campaignAlerts(c);
      if (tab === "google" && c.platform !== "Google Ads") return false;
      if (tab === "meta" && c.platform !== "Meta Ads") return false;
      if (tab === "drafts" && !DRAFTY.includes(c.stage)) return false;
      if (tab === "active" && !LIVE.includes(c.stage)) return false;
      if (tab === "attention" && alerts.length === 0) return false;
      if (tab === "completed" && !DONE.includes(c.stage)) return false;

      if (store !== "all" && c.store !== store) return false;
      if (rm !== "all" && c.rm !== rm) return false;
      if (exec !== "all" && c.executive !== exec) return false;
      if (platform !== "all" && c.platform !== platform) return false;
      if (objective !== "all" && c.objective !== objective) return false;
      if (status !== "all" && c.stage !== status) return false;
      if (fromDate && c.budget.startDate < fromDate) return false;
      if (toDate && c.budget.endDate > toDate) return false;
      if (budgetBand === "low" && c.budget.total >= 20000) return false;
      if (budgetBand === "mid" && (c.budget.total < 20000 || c.budget.total > 40000)) return false;
      if (budgetBand === "high" && c.budget.total <= 40000) return false;
      if (perf === "healthy" && alerts.length > 0) return false;
      if (perf === "attention" && alerts.length === 0) return false;

      const q = query.trim().toLowerCase();
      if (
        q &&
        ![c.id, c.name, c.storeId, c.store, c.requestId ?? "", c.city].some((v) =>
          v.toLowerCase().includes(q),
        )
      )
        return false;
      return true;
    });
  }, [campaigns, tab, store, rm, exec, platform, objective, status, fromDate, toDate, budgetBand, perf, query]);

  const header = useMemo(() => {
    const monthDone = campaigns.filter(
      (c) => DONE.includes(c.stage) && c.budget.endDate >= "2026-08-01",
    ).length;
    return {
      active: campaigns.filter((c) => c.stage === "active").length,
      approval: campaigns.filter((c) => c.stage === "approval_pending").length,
      creative: campaigns.filter((c) => c.stage === "creative_pending").length,
      attention: campaigns.filter((c) => campaignAlerts(c).length > 0).length,
      exhausted: campaigns.filter((c) => c.stage === "budget_exhausted").length,
      monthDone,
    };
  }, [campaigns]);

  const resetFilters = () => {
    setStore("all");
    setRm("all");
    setExec("all");
    setPlatform("all");
    setObjective("all");
    setStatus("all");
    setFromDate("");
    setToDate("");
    setBudgetBand("all");
    setPerf("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Google &amp; Meta Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Plan, launch, monitor and report paid campaigns for assigned stores. Every campaign keeps one
            permanent Campaign ID linked to its Store ID.
          </p>
        </div>
        <Button onClick={() => { setStep(0); setWizardOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Active Campaigns" value={header.active} hint="Running now" tone="active" />
        <Kpi label="Approval Pending" value={header.approval} hint="Budget sign-off" tone="attention" />
        <Kpi label="Creative Pending" value={header.creative} hint="Waiting on design" tone="attention" />
        <Kpi label="Attention Required" value={header.attention} hint="Rule triggered" tone="overdue" />
        <Kpi label="Budget Exhausted" value={header.exhausted} hint="Top-up needed" tone="overdue" />
        <Kpi label="Completed This Month" value={header.monthDone} hint="Report stage" tone="healthy" />
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

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Campaign ID, store, Store ID or Request ID"
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
            <Button variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          {showFilters ? (
            <div className="grid gap-3 border-t pt-3 md:grid-cols-3 xl:grid-cols-5">
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger><SelectValue placeholder="Store" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stores</SelectItem>
                  {options.stores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={rm} onValueChange={setRm}>
                <SelectTrigger><SelectValue placeholder="Relationship Manager" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All relationship managers</SelectItem>
                  {options.rms.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={exec} onValueChange={setExec}>
                <SelectTrigger><SelectValue placeholder="Marketing Executive" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All executives</SelectItem>
                  {options.execs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                </SelectContent>
              </Select>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger><SelectValue placeholder="Objective" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All objectives</SelectItem>
                  {OBJECTIVES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Campaign status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(campaignStageMeta).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Start on or after</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">End on or before</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <Select value={budgetBand} onValueChange={setBudgetBand}>
                <SelectTrigger><SelectValue placeholder="Budget range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any budget</SelectItem>
                  <SelectItem value="low">Below ₹20,000</SelectItem>
                  <SelectItem value="mid">₹20,000 – ₹40,000</SelectItem>
                  <SelectItem value="high">Above ₹40,000</SelectItem>
                </SelectContent>
              </Select>
              <Select value={perf} onValueChange={setPerf}>
                <SelectTrigger><SelectValue placeholder="Performance status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All performance</SelectItem>
                  <SelectItem value="healthy">On track</SelectItem>
                  <SelectItem value="attention">Needs attention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card className="hidden lg:block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Campaigns ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Campaign</th>
                  <th className="px-4 py-2">Store</th>
                  <th className="px-4 py-2">Platform / Objective</th>
                  <th className="px-4 py-2">Budget &amp; spend</th>
                  <th className="px-4 py-2">Dates</th>
                  <th className="px-4 py-2">Leads / Qualified</th>
                  <th className="px-4 py-2">Orders / Sales</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const alerts = campaignAlerts(c);
                  return (
                    <tr key={c.id} className="border-t align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.id}
                          {c.requestId ? ` · ${c.requestId}` : ""}
                        </p>
                        {alerts.length ? (
                          <Badge variant="outline" className={cn("mt-1 text-[11px]", toneClasses.overdue)}>
                            <AlertTriangle className="mr-1 h-3 w-3" /> {alerts.length} attention
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p>{c.store}</p>
                        <p className="text-xs text-muted-foreground">{c.storeId} · {c.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{c.platform}</p>
                        <p className="text-xs text-muted-foreground">{c.objective}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{inr(c.spend)} <span className="text-xs text-muted-foreground">of {inr(c.budget.total)}</span></p>
                        <Progress value={budgetUsedPct(c)} className="mt-1 h-1.5 w-28" />
                        <p className="text-xs text-muted-foreground">{c.budget.type === "daily" ? `${inr(c.budget.daily)}/day` : "Total budget"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.budget.startDate}<br />to {c.budget.endDate}
                      </td>
                      <td className="px-4 py-3">
                        {c.metrics.leads} / {c.metrics.qualified}
                        <p className="text-xs text-muted-foreground">CPL {c.metrics.leads ? inr(Math.round(cpl(c))) : "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.metrics.orders} / {inr(c.metrics.salesAmount)}
                        {!c.metrics.salesVerified && c.metrics.orders > 0 ? (
                          <p className="text-xs text-amber-600">Sales unverified</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3"><StageBadge stage={c.stage} /></td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => setOpenId(c.id)}>
                          View Campaign
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No campaigns match the selected filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((c) => {
          const alerts = campaignAlerts(c);
          return (
            <Card key={c.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.id} · {c.storeId}</p>
                  </div>
                  <StageBadge stage={c.stage} />
                </div>
                <p className="text-sm">{c.store}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>{c.platform}</span>
                  <span>{c.objective}</span>
                  <span>Spend {inr(c.spend)} / {inr(c.budget.total)}</span>
                  <span>{c.budget.startDate} → {c.budget.endDate}</span>
                  <span>Leads {c.metrics.leads} · Qualified {c.metrics.qualified}</span>
                  <span>Orders {c.metrics.orders} · {inr(c.metrics.salesAmount)}</span>
                </div>
                <Progress value={budgetUsedPct(c)} className="h-1.5" />
                {alerts.length ? (
                  <Badge variant="outline" className={cn("text-[11px]", toneClasses.overdue)}>
                    <AlertTriangle className="mr-1 h-3 w-3" /> {alerts[0]}
                  </Badge>
                ) : null}
                <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(c.id)}>
                  View Campaign <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CampaignSheet campaign={selected} onClose={() => setOpenId(null)} />

      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Campaign — step {step + 1} of {WIZARD_STEPS.length}</DialogTitle>
            <DialogDescription>{WIZARD_STEPS[step]}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-1">
            {WIZARD_STEPS.map((s, i) => (
              <Badge
                key={s}
                variant="outline"
                className={cn("text-[11px]", i <= step ? toneClasses.active : toneClasses.draft)}
              >
                {i + 1}. {s}
              </Badge>
            ))}
          </div>

          <WizardStep step={step} />

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < WIZARD_STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button
                onClick={() => {
                  setWizardOpen(false);
                  toast.success("Campaign submitted for approval", {
                    description:
                      "A permanent Campaign ID is reserved and linked to the selected Store ID. Launch stays blocked until budget approval.",
                  });
                }}
              >
                Submit for Approval
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WizardStep({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Store</Label>
          <Select defaultValue="STR-1042">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from(new Set(CAMPAIGNS_FULL.map((c) => `${c.storeId}|${c.store}`))).map((v) => {
                const [id, name] = v.split("|");
                return <SelectItem key={id} value={id}>{name} ({id})</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Related Marketing Request ID</Label><Input defaultValue="REQ-3388" /></div>
        <div className="space-y-1"><Label>Relationship Manager</Label><Input defaultValue="Ritika Bansal" readOnly /></div>
        <div className="space-y-1"><Label>Performance Marketing Executive</Label><Input defaultValue="Nikhil Arora" readOnly /></div>
        <div className="space-y-1"><Label>Store city</Label><Input defaultValue="Jaipur" /></div>
        <div className="space-y-1"><Label>Service area</Label><Input defaultValue="Vaishali Nagar — 8 km" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Business problem</Label><Textarea placeholder="What business problem is this campaign solving?" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Expected business outcome</Label><Textarea placeholder="Leads, orders or sales expected" /></div>
      </div>
    );

  if (step === 1)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Platform</Label>
          <Select defaultValue="Meta Ads">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Google Ads">Google Ads</SelectItem>
              <SelectItem value="Meta Ads">Meta Ads</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Campaign objective</Label>
          <Select defaultValue="Lead Generation">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {OBJECTIVES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2"><Label>Campaign name</Label><Input placeholder="City — objective — month" /></div>
      </div>
    );

  if (step === 2)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><Label>Target city</Label><Input defaultValue="Jaipur" /></div>
        <div className="space-y-1"><Label>Target radius (km)</Label><Input type="number" defaultValue={8} /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Target locations</Label><Input placeholder="Areas and pin codes" /></div>
        <div className="space-y-1"><Label>Age range</Label><Input defaultValue="28–55" /></div>
        <div className="space-y-1"><Label>Language</Label><Input defaultValue="Hindi, English" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Audience interests</Label><Input placeholder="Interests and behaviours" /></div>
        <div className="space-y-1">
          <Label>Customer type</Label>
          <Select defaultValue="new">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New customers</SelectItem>
              <SelectItem value="existing">Existing customers</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Excluded locations / audiences</Label><Input placeholder="Exclusions" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Retargeting audience (if applicable)</Label><Input placeholder="Website visitors, engagers" /></div>
      </div>
    );

  if (step === 3)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Budget type</Label>
          <Select defaultValue="daily">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily budget</SelectItem>
              <SelectItem value="total">Total budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Daily budget (₹)</Label><Input type="number" defaultValue={1500} /></div>
        <div className="space-y-1"><Label>Total budget (₹)</Label><Input type="number" defaultValue={45000} /></div>
        <div className="space-y-1"><Label>Budget approver</Label><Input defaultValue="Marketing Head" /></div>
        <div className="space-y-1"><Label>Start date</Label><Input type="date" defaultValue={CAMPAIGN_TODAY} /></div>
        <div className="space-y-1"><Label>End date</Label><Input type="date" defaultValue="2026-09-05" /></div>
        <div className="space-y-1"><Label>Expected cost per lead (₹)</Label><Input type="number" defaultValue={600} /></div>
        <div className="space-y-1"><Label>Expected lead target</Label><Input type="number" defaultValue={75} /></div>
        <div className="space-y-1"><Label>Expected sales target (₹)</Label><Input type="number" defaultValue={450000} /></div>
        <p className="sm:col-span-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-600">
          Approved budget stays ₹0 until the approver signs off. Launch is blocked without budget approval.
        </p>
      </div>
    );

  if (step === 4)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><Label>Creative ID</Label><Input placeholder="Existing Creative ID, if reused" /></div>
        <div className="space-y-1"><Label>Creative type</Label><Input defaultValue="Static + carousel" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Headline</Label><Input placeholder="Ad headline" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Primary text</Label><Textarea placeholder="Main ad copy" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Input placeholder="Short description" /></div>
        <div className="space-y-1"><Label>Offer</Label><Input placeholder="Offer being promoted" /></div>
        <div className="space-y-1"><Label>Call-to-action</Label><Input defaultValue="Book pickup" /></div>
        <div className="space-y-1"><Label>Destination link</Label><Input placeholder="https://" /></div>
        <div className="space-y-1"><Label>Landing page</Label><Input placeholder="Store landing page" /></div>
        <div className="space-y-1"><Label>Phone number</Label><Input placeholder="+91" /></div>
        <div className="space-y-1"><Label>WhatsApp number</Label><Input placeholder="+91" /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Terms and conditions</Label><Textarea placeholder="Offer terms" /></div>
      </div>
    );

  if (step === 5)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><Label>Lead destination</Label><Input defaultValue="Store CRM queue" /></div>
        <div className="space-y-1"><Label>Store</Label><Input defaultValue="Clean Craft Jaipur — Vaishali" readOnly /></div>
        <div className="space-y-1"><Label>Relationship Manager</Label><Input defaultValue="Ritika Bansal" readOnly /></div>
        <div className="space-y-1"><Label>Sales team (if applicable)</Label><Input defaultValue="Store front desk" /></div>
        <div className="space-y-1"><Label>Required response time (hours)</Label><Input type="number" defaultValue={4} /></div>
        <div className="space-y-1"><Label>Lead notification</Label><Input defaultValue="In-app notification placeholder" readOnly /></div>
        <div className="space-y-1 sm:col-span-2"><Label>Lead qualification fields</Label><Textarea defaultValue="Service required, Garment count, Pickup pin code, Preferred slot" /></div>
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          Duplicate-check is always on: leads matching an existing phone number for this Store ID are merged,
          never created twice.
        </p>
      </div>
    );

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Approval checklist — the campaign moves to Approval Pending once submitted.
      </p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {APPROVAL_CHECKLIST.map((c) => (
          <li key={c} className="flex items-center gap-2 rounded-md border p-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CampaignSheet({ campaign, onClose }: { campaign: CampaignRecord | null; onClose: () => void }) {
  if (!campaign) return null;
  const c = campaign;
  const alerts = campaignAlerts(c);
  const r = roas(c);

  const metricRows: { label: string; value: string }[] = [
    { label: "Impressions", value: c.metrics.impressions.toLocaleString("en-IN") },
    { label: "Reach", value: c.metrics.reach.toLocaleString("en-IN") },
    { label: "Clicks", value: c.metrics.clicks.toLocaleString("en-IN") },
    { label: "Click-through rate", value: `${ctr(c.metrics).toFixed(2)}%` },
    { label: "Cost per click", value: c.metrics.clicks ? inr(Math.round(cpc(c))) : "—" },
    { label: "Leads", value: String(c.metrics.leads) },
    { label: "Cost per lead", value: c.metrics.leads ? inr(Math.round(cpl(c))) : "—" },
    { label: "Qualified leads", value: String(c.metrics.qualified) },
    { label: "Cost per qualified lead", value: c.metrics.qualified ? inr(Math.round(cpql(c))) : "—" },
    { label: "Calls", value: String(c.metrics.calls) },
    { label: "WhatsApp enquiries", value: String(c.metrics.whatsapp) },
    { label: "Orders", value: String(c.metrics.orders) },
    { label: "Sales amount", value: inr(c.metrics.salesAmount) },
    { label: "Cost per sale", value: c.metrics.orders ? inr(Math.round(cps(c))) : "—" },
    { label: "Conversion rate", value: `${conversion(c).toFixed(1)}%` },
    { label: "Return on ad spend", value: r ? `${r.toFixed(2)}x (verified)` : "Not shown — sales not verified" },
  ];

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="pr-8">{c.name}</SheetTitle>
          <SheetDescription>
            {c.id} · {c.storeId} · {c.store}
            {c.requestId ? ` · Request ${c.requestId}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <StageBadge stage={c.stage} />
            <Badge variant="outline" className={toneClasses.active}>{c.platform}</Badge>
            <Badge variant="outline" className={toneClasses.draft}>{c.objective}</Badge>
          </div>

          {alerts.length ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                <AlertTriangle className="h-4 w-4" /> Attention required
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-red-600">
                {alerts.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600">
              <CheckCircle2 className="mr-2 inline h-4 w-4" /> No attention rules triggered.
            </div>
          )}

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Store and request</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Store ID" value={c.storeId} />
              <Field label="Marketing Request ID" value={c.requestId} />
              <Field label="Relationship Manager" value={c.rm} />
              <Field label="Marketing Executive" value={c.executive} />
              <Field label="City" value={`${c.city}, ${c.state}`} />
              <Field label="Service area" value={c.serviceArea} />
              <Field label="Business problem" value={c.problem} />
              <Field label="Expected outcome" value={c.outcome} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <BadgeIndianRupee className="h-4 w-4" /> Budget and dates
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Budget type" value={c.budget.type === "daily" ? "Daily" : "Total"} />
              <Field label="Daily budget" value={inr(c.budget.daily)} />
              <Field label="Total budget" value={inr(c.budget.total)} />
              <Field label="Approved budget" value={c.budget.approved ? inr(c.budget.approved) : "Not approved"} />
              <Field label="Amount spent" value={inr(c.spend)} />
              <Field label="Budget approver" value={c.budget.approver} />
              <Field label="Start date" value={c.budget.startDate} />
              <Field label="End date" value={c.budget.endDate} />
              <Field label="Expected cost per lead" value={inr(c.budget.expectedCpl)} />
              <Field label="Lead target" value={c.budget.leadTarget} />
              <Field label="Sales target" value={inr(c.budget.salesTarget)} />
              <div className="col-span-2">
                <Progress value={budgetUsedPct(c)} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">{budgetUsedPct(c)}% of budget used</p>
              </div>
            </div>
            {c.budget.approved === 0 ? (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-600">
                Launch blocked — budget approval is required before this campaign can go live.
              </p>
            ) : null}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Audience</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Target city" value={c.audience.city} />
              <Field label="Target radius" value={`${c.audience.radiusKm} km`} />
              <Field label="Target locations" value={c.audience.locations} />
              <Field label="Age range" value={c.audience.ageRange} />
              <Field label="Language" value={c.audience.language} />
              <Field label="Interests" value={c.audience.interests} />
              <Field label="Customer type" value={c.audience.customerType} />
              <Field label="Excluded" value={c.audience.excluded} />
              <Field label="Retargeting audience" value={c.audience.retargeting} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="h-4 w-4" /> Creatives and offer
            </h3>
            {c.creatives.length === 0 ? (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">No creative linked yet.</p>
            ) : (
              c.creatives.map((cr) => (
                <div key={cr.creativeId} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{cr.creativeId} · {cr.type}</p>
                    <Badge
                      variant="outline"
                      className={
                        cr.approval === "approved"
                          ? toneClasses.healthy
                          : cr.approval === "rejected"
                            ? toneClasses.overdue
                            : toneClasses.attention
                      }
                    >
                      {cr.approval === "correction" ? "Correction required" : cr.approval}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Headline" value={cr.headline} />
                    <Field label="Call-to-action" value={cr.cta} />
                    <Field label="Primary text" value={cr.primaryText} />
                    <Field label="Description" value={cr.description} />
                    <Field label="Offer" value={cr.offer} />
                    <Field label="Destination link" value={cr.destination} />
                    <Field label="Landing page" value={cr.landingPage} />
                    <Field label="Phone" value={cr.phone} />
                    <Field label="WhatsApp" value={cr.whatsapp} />
                    <Field label="Terms and conditions" value={cr.terms} />
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Lead handover</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Lead destination" value={c.handover.destination} />
              <Field label="Store" value={c.handover.store} />
              <Field label="Relationship Manager" value={c.handover.rm} />
              <Field label="Sales team" value={c.handover.salesTeam} />
              <Field label="Required response time" value={`${c.handover.responseTimeHours} hours`} />
              <Field label="Notification" value={c.handover.notification} />
              <Field label="Duplicate check" value={c.handover.duplicateCheck ? "Enabled" : "Disabled"} />
              <Field label="Qualification fields" value={c.handover.qualificationFields.join(", ")} />
              <Field label="Leads contacted" value={`${c.leadsContacted} of ${c.metrics.leads}`} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Approval checklist</h3>
            <ul className="grid gap-1 rounded-lg border p-3 sm:grid-cols-2">
              {APPROVAL_CHECKLIST.map((item) => {
                const done = c.checklist.includes(item);
                return (
                  <li key={item} className={cn("flex items-center gap-2 text-sm", !done && "text-amber-600")}>
                    <CheckCircle2 className={cn("h-4 w-4", done ? "text-emerald-600" : "text-amber-600")} />
                    {item}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <LineChart className="h-4 w-4" /> Campaign performance
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              {metricRows.map((m) => <Field key={m.label} label={m.label} value={m.value} />)}
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Daily updates</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Daily update recorded", { description: `Appended to ${c.id} history.` })}
              >
                <Plus className="mr-1 h-3 w-3" /> Add update
              </Button>
            </div>
            {c.daily.length === 0 ? (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">No daily updates recorded yet.</p>
            ) : (
              c.daily.map((d) => (
                <div key={d.date} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{d.date}</p>
                  <p className="text-xs text-muted-foreground">
                    Spend {inr(d.spend)} · Leads {d.leads} · Qualified {d.qualified} · Orders {d.orders} · Sales {inr(d.sales)}
                  </p>
                  <p className="mt-1">{d.observation}</p>
                  <p className="text-xs text-muted-foreground">Action: {d.action} · Next review {d.nextReview}</p>
                </div>
              ))
            )}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Optimisation log</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.success("Optimisation entry added", {
                    description: "Previous settings are preserved — history is never overwritten.",
                  })
                }
              >
                <Sparkles className="mr-1 h-3 w-3" /> Log optimisation
              </Button>
            </div>
            {c.optimisations.length === 0 ? (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">No optimisation recorded yet.</p>
            ) : (
              c.optimisations.map((o) => (
                <div key={o.date} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{o.date} — {o.problem}</p>
                  <p>{o.change}</p>
                  <p className="text-xs text-muted-foreground">
                    {[o.budgetChange, o.audienceChange, o.creativeChange, o.bidChange].filter(Boolean).join(" · ") || "No setting change recorded"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expected: {o.expected} · Review {o.reviewDate} · Outcome: {o.outcome ?? "Pending"}
                  </p>
                </div>
              ))
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Campaign completion report</h3>
            {c.report ? (
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
                <Field label="Total spend" value={inr(c.report.spend)} />
                <Field label="Total leads" value={c.report.leads} />
                <Field label="Qualified leads" value={c.report.qualified} />
                <Field label="Orders" value={c.report.orders} />
                <Field label="Sales amount" value={inr(c.report.salesAmount)} />
                <Field label="Cost per lead" value={inr(Math.round(c.report.spend / Math.max(1, c.report.leads)))} />
                <Field label="Cost per sale" value={inr(Math.round(c.report.spend / Math.max(1, c.report.orders)))} />
                <Field label="Verified ROAS" value={r ? `${r.toFixed(2)}x` : "Not verified"} />
                <Field label="Best-performing creative" value={c.report.bestCreative} />
                <Field label="Best-performing audience" value={c.report.bestAudience} />
                <Field label="Key learning" value={c.report.learning} />
                <Field label="Recommended next action" value={c.report.nextAction} />
                <Field label="Relationship Manager review" value={c.report.rmReview} />
              </div>
            ) : (
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">No completion report submitted yet.</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    toast.success("Completion report started", {
                      description: `Report will update Leads & Sales Results and Performance for ${c.id}.`,
                    })
                  }
                >
                  Submit completion report
                </Button>
              </div>
            )}
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Audit history</h3>
            <ul className="space-y-2">
              {c.history.map((h, i) => (
                <li key={i} className="rounded-lg border p-2 text-sm">
                  <span className="font-medium">{h.at}</span> · {h.actor}
                  <p className="text-xs text-muted-foreground">{h.detail}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Advertising account passwords, API keys and access tokens are never stored in this CRM.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
