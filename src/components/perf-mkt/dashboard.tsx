import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Image as ImageIcon,
  IndianRupee,
  Inbox,
  MapPin,
  Megaphone,
  Plus,
  Search,
  Store,
  Target,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import {
  ALERTS,
  CAMPAIGNS,
  CREATIVES,
  EXECUTIVE,
  INFLUENCERS,
  LEADS_SUMMARY,
  PROFILE_HEALTH,
  REQUESTS,
  STORES,
  TODAY_PRIORITIES,
  campaignStatusMeta,
  derived,
  influencerStageMeta,
  inr,
  requestStatusTone,
  toneClasses,
  type MarketingRequest,
  type RequestStatus,
} from "./data";

const today = new Date("2026-08-06T09:35:00Z");
const todayLabel = today.toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "healthy" | "active" | "attention" | "overdue";
}) {
  const ring =
    tone === "healthy"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "active"
        ? "border-sky-500/30 bg-sky-500/5"
        : tone === "attention"
          ? "border-amber-500/30 bg-amber-500/5"
          : tone === "overdue"
            ? "border-red-500/30 bg-red-500/5"
            : "bg-muted/20";
  return (
    <div className={`rounded-lg border p-3 ${ring}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: keyof typeof toneClasses }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

const statusLabel: Record<RequestStatus, string> = {
  new: "New",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  returned: "Returned",
};

export function PerfMktDashboard() {
  const [query, setQuery] = useState("");
  const [showAllStores, setShowAllStores] = useState(false);
  const [requests, setRequests] = useState<MarketingRequest[]>(REQUESTS);
  const [returnFor, setReturnFor] = useState<MarketingRequest | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [missingInfo, setMissingInfo] = useState("");

  const nextAction = requests.find((r) => r.status === "new") ?? requests[0];

  const q = query.trim().toLowerCase();
  const filteredStores = useMemo(
    () =>
      STORES.filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q),
      ),
    [q],
  );
  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (r) =>
          !q ||
          r.store.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q),
      ),
    [q, requests],
  );
  const filteredCampaigns = useMemo(
    () =>
      CAMPAIGNS.filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.store.toLowerCase().includes(q),
      ),
    [q],
  );

  const newRequests = requests.filter((r) => r.status === "new").length;
  const running = CAMPAIGNS.filter((c) => c.status === "running").length;
  const attentionCampaigns = CAMPAIGNS.filter(
    (c) => c.status === "low_balance" || c.status === "needs_optimisation",
  ).length;
  const leadsMonth = STORES.reduce((s, x) => s + x.leadsThisMonth, 0);
  const ordersMonth = STORES.reduce((s, x) => s + x.ordersThisMonth, 0);

  function accept(r: MarketingRequest) {
    setRequests((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, status: "accepted" } : x)),
    );
    toast.success(`${r.id} accepted`, {
      description: `${r.store} · ${r.storeId} — ${r.requestedBy} notified.`,
    });
  }

  function submitReturn() {
    if (!returnFor) return;
    if (!returnReason.trim() || !missingInfo.trim()) {
      toast.error("Reason and missing-information list are both required.");
      return;
    }
    setRequests((prev) =>
      prev.map((x) => (x.id === returnFor.id ? { ...x, status: "returned" } : x)),
    );
    toast.success(`${returnFor.id} returned to ${returnFor.requestedBy}`, {
      description: "Ownership history preserved on the same Request ID.",
    });
    setReturnFor(null);
    setReturnReason("");
    setMissingInfo("");
  }

  const quickActions = [
    { label: "Review Marketing Request", icon: Inbox },
    { label: "Create Campaign", icon: Megaphone },
    { label: "Request Creative", icon: ImageIcon },
    { label: "Update Store Profile", icon: MapPin },
    { label: "Add Influencer Activity", icon: Video },
    { label: "Record Lead", icon: Users },
    { label: "Record Sales Result", icon: IndianRupee },
    { label: "View Performance", icon: TrendingUp },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
            Welcome, {EXECUTIVE.name}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {todayLabel} · {STORES.length} assigned stores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 text-[10px] px-1 rounded-full bg-red-500 text-primary-foreground">
                  {newRequests + attentionCampaigns}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-3 border-b text-sm font-medium">Notifications</div>
              <div className="max-h-72 overflow-auto divide-y">
                {ALERTS.slice(0, 6).map((a) => (
                  <div key={a.id} className="p-3">
                    <div className="text-sm">{a.label}</div>
                    <div className="text-[11px] text-muted-foreground">{a.ref}</div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button className="shrink-0" onClick={() => toast.success("New campaign draft created", { description: "Assign Store ID, objective, budget and dates to continue." })}>
            <Plus className="w-4 h-4" /> Create Campaign
          </Button>
        </div>
        <div className="col-span-2 relative w-full sm:order-last sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search store, campaign or request"
            className="pl-9"
          />
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Assigned Stores" value={String(STORES.length)} icon={Store} />
        <Kpi label="New Marketing Requests" value={String(newRequests)} icon={Inbox} tone="attention" />
        <Kpi label="Campaigns Running" value={String(running)} icon={Megaphone} tone="healthy" />
        <Kpi
          label="Campaigns Requiring Attention"
          value={String(attentionCampaigns)}
          icon={AlertTriangle}
          tone="overdue"
        />
        <Kpi label="Leads Generated This Month" value={String(leadsMonth)} icon={Users} tone="active" />
        <Kpi
          label="Qualified Leads"
          value={String(LEADS_SUMMARY.qualified)}
          sub={`${Math.round((LEADS_SUMMARY.qualified / LEADS_SUMMARY.total) * 100)}% qualified rate`}
          icon={Target}
          tone="active"
        />
        <Kpi label="Orders Generated" value={String(ordersMonth)} icon={IndianRupee} tone="healthy" />
        <Kpi label="Active Campaigns" value={String(running)} sub="This month" icon={TrendingUp} />
      </div>

      {/* Next priority action */}
      {nextAction && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" /> Next Priority Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Store</div>
                <div className="text-sm font-medium">{nextAction.store}</div>
                <div className="text-[11px] text-muted-foreground">{nextAction.storeId}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Relationship Manager</div>
                <div className="text-sm font-medium">{nextAction.requestedBy}</div>
                <div className="text-[11px] text-muted-foreground">{nextAction.id}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Request</div>
                <div className="text-sm font-medium">{nextAction.type}</div>
                <div className="text-[11px] text-muted-foreground">
                  Due {nextAction.dueDate}
                </div>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <Pill tone={nextAction.priority === "high" ? "overdue" : "attention"}>
                  {nextAction.priority === "high" ? "High priority" : "Medium priority"}
                </Pill>
                <Pill tone={requestStatusTone[nextAction.status]}>
                  {statusLabel[nextAction.status]}
                </Pill>
              </div>
            </div>
            <p className="text-sm">
              <span className="font-medium">Required action: </span>
              {nextAction.detail}
            </p>
            <p className="text-xs text-muted-foreground">
              Reason for priority: store enquiries are below target and the request due date is
              closest.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => accept(nextAction)} disabled={nextAction.status !== "new"}>
                Accept Request
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReturnFor(nextAction)}>
                Return Request
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info(`Opening campaign for ${nextAction.storeId}`)}>
                Open Campaign
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Creative upload opened")}>
                Upload Creative
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info(`Profile update for ${nextAction.storeId}`)}>
                Update Profile
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.info(`${nextAction.id} details`, { description: nextAction.detail })}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's priorities + alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Today’s Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TODAY_PRIORITIES.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-md border p-2.5"
              >
                <span className="text-sm min-w-0">{p.label}</span>
                <Pill tone={p.tone}>{p.count}</Pill>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Attention Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ALERTS.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
                <div className="min-w-0">
                  <div className="text-sm truncate">{a.label}</div>
                  <div className="text-[11px] text-muted-foreground">{a.ref}</div>
                </div>
                <Pill tone={a.tone}>{a.tone === "overdue" ? "Urgent" : a.tone === "draft" ? "Draft" : "Check"}</Pill>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* My stores */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" /> My Stores Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(showAllStores ? filteredStores : filteredStores.slice(0, 5)).map((s) => (
              <div key={s.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.id} · {s.city} · RM {s.rm}
                    </div>
                  </div>
                  <Pill
                    tone={
                      s.marketingStatus === "healthy"
                        ? "healthy"
                        : s.marketingStatus === "attention"
                          ? "attention"
                          : s.marketingStatus === "declining"
                            ? "overdue"
                            : "draft"
                    }
                  >
                    {s.marketingStatus === "setup" ? "Setup" : s.marketingStatus}
                  </Pill>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Active campaigns</div>
                    <div className="font-medium tabular-nums">{s.activeCampaigns}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Leads this month</div>
                    <div className="font-medium tabular-nums">{s.leadsThisMonth}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Orders this month</div>
                    <div className="font-medium tabular-nums text-emerald-600">
                      {s.ordersThisMonth}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Target achieved</div>
                    <div className="font-medium tabular-nums">{s.targetAchievedPct}%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Pill tone={s.pendingRequests > 0 ? "attention" : "healthy"}>
                    {s.pendingRequests} pending request{s.pendingRequests === 1 ? "" : "s"}
                  </Pill>
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Opening ${s.id}`, { description: s.name })}>
                    View Store
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {filteredStores.length > 5 && (
            <Button variant="outline" onClick={() => setShowAllStores((v) => !v)}>
              {showAllStores ? "Show top 5 stores" : `View All Stores (${filteredStores.length})`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Marketing requests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" /> Marketing Requests
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Latest requests from Relationship Managers — every request stays linked to its Store ID.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredRequests.slice(0, 5).map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border p-3 sm:flex sm:justify-between"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {r.type} — {r.store}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {r.id} · {r.storeId} · by {r.requestedBy} · due {r.dueDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone={r.priority === "high" ? "overdue" : r.priority === "medium" ? "attention" : "draft"}>
                  {r.priority}
                </Pill>
                <Pill tone={requestStatusTone[r.status]}>{statusLabel[r.status]}</Pill>
                {r.status === "new" ? (
                  <>
                    <Button size="sm" onClick={() => accept(r)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReturnFor(r)}>
                      Return
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => toast.info(r.id, { description: r.detail })}>
                    View
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">No requests match your search.</p>
          )}
        </CardContent>
      </Card>

      {/* Campaign summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" /> Campaign Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
            {[
              { l: "Active Google", v: CAMPAIGNS.filter((c) => c.platform === "Google Ads" && c.status !== "completed").length, t: "healthy" as const },
              { l: "Active Meta", v: CAMPAIGNS.filter((c) => c.platform === "Meta Ads" && c.status !== "completed").length, t: "healthy" as const },
              { l: "Awaiting approval", v: CAMPAIGNS.filter((c) => c.status === "awaiting_approval").length, t: "attention" as const },
              { l: "Low balance", v: CAMPAIGNS.filter((c) => c.status === "low_balance").length, t: "overdue" as const },
              { l: "Needs optimisation", v: CAMPAIGNS.filter((c) => c.status === "needs_optimisation").length, t: "overdue" as const },
              { l: "Completed this month", v: CAMPAIGNS.filter((c) => c.status === "completed").length, t: "active" as const },
            ].map((x) => (
              <div key={x.l} className={`rounded-md border p-2.5 ${toneClasses[x.t]}`}>
                <div className="text-[11px]">{x.l}</div>
                <div className="text-xl font-semibold tabular-nums">{x.v}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {filteredCampaigns
              .filter((c) => c.status !== "completed")
              .map((c) => {
                const meta = campaignStatusMeta[c.status];
                const util = c.targetAchievedPct;
                return (
                  <div key={c.id} className="rounded-md border p-3 space-y-2">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.id} · {c.storeId} · {c.store} · {c.platform} · {c.objective}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={meta.tone}>{meta.label}</Pill>
                        <Button size="sm" variant="outline" onClick={() => toast.info(c.id, { description: `${c.name} · ${c.platform}` })}>
                          View Campaign
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                      <div>
                        <div className="text-muted-foreground">Reach / Clicks</div>
                        <div className="font-medium tabular-nums">
                          {c.reach.toLocaleString("en-IN")} / {c.clicks.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Leads</div>
                        <div className="font-medium tabular-nums">{c.leads}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Qualified</div>
                        <div className="font-medium tabular-nums">{c.qualified}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Orders</div>
                        <div className="font-medium tabular-nums text-emerald-600">{c.orders}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Creative ready</div>
                        <div className={`font-medium ${c.creativeReady ? "text-emerald-600" : "text-red-600"}`}>
                          {c.creativeReady ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                    <Progress value={util} />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Creatives + profiles */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Creatives & Graphics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { l: "Requests pending", v: CREATIVES.pending, t: "attention" as const },
                { l: "Under preparation", v: CREATIVES.preparing, t: "active" as const },
                { l: "Awaiting approval", v: CREATIVES.awaitingApproval, t: "attention" as const },
                { l: "Approved", v: CREATIVES.approved, t: "healthy" as const },
                { l: "Needs correction", v: CREATIVES.correction, t: "overdue" as const },
              ].map((x) => (
                <div key={x.l} className={`rounded-md border p-2.5 ${toneClasses[x.t]}`}>
                  <div className="text-[11px]">{x.l}</div>
                  <div className="text-xl font-semibold tabular-nums">{x.v}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => toast.success("Creative request raised", { description: "Linked to the selected Store ID." })}>
                Request Creative
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Upload creative")}>
                Upload Creative
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.info("Creative library")}>
                View Creative Library
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Google Business & Social Profile Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PROFILE_HEALTH.map((p) => (
              <div key={p.storeId} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.store}</div>
                    <div className="text-[11px] text-muted-foreground">{p.storeId}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Profile update for ${p.storeId}`)}>
                    Update Profile
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone={p.gmbComplete ? "healthy" : "attention"}>
                    GMB {p.gmbComplete ? "complete" : "incomplete"}
                  </Pill>
                  {p.verificationPending && <Pill tone="attention">Verification pending</Pill>}
                  {p.infoIncomplete && <Pill tone="attention">Store info incomplete</Pill>}
                  {p.facebookDue && <Pill tone="active">Facebook update due</Pill>}
                  {p.instagramDue && <Pill tone="active">Instagram update due</Pill>}
                  {p.reviewsToAnswer > 0 && <Pill tone="attention">{p.reviewsToAnswer} reviews to answer</Pill>}
                  {p.detailsReported && <Pill tone="overdue">Incorrect details reported</Pill>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Influencers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" /> Influencer & YouTuber Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {INFLUENCERS.map((i) => {
            const meta = influencerStageMeta[i.stage];
            return (
              <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {i.name} · {i.platform} · {i.followers}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {i.id} · {i.storeId} · {i.store} · due {i.dueDate}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={meta.tone}>{meta.label}</Pill>
                  <Button size="sm" variant="outline" onClick={() => toast.info(i.id, { description: `${i.name} · ${i.store}` })}>
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Leads & sales */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Leads & Sales Summary
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Store ID → Campaign ID → Lead ID → Order or Sale. Each Lead ID is counted once only.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Kpi label="Total leads" value={String(LEADS_SUMMARY.total)} icon={Users} />
            <Kpi label="Qualified leads" value={String(LEADS_SUMMARY.qualified)} icon={Target} tone="active" />
            <Kpi label="Leads handed over" value={String(LEADS_SUMMARY.handedOver)} icon={ArrowRight} tone="active" />
            <Kpi label="Leads contacted" value={String(LEADS_SUMMARY.contacted)} icon={CheckCircle2} tone="active" />
            <Kpi label="Orders generated" value={String(LEADS_SUMMARY.orders)} icon={CheckCircle2} tone="healthy" />
            <Kpi label="Target achieved" value={`${LEADS_SUMMARY.targetAchievedPct}%`} icon={TrendingUp} tone="healthy" />
            <Kpi label="Lead-to-sale conversion" value={`${derived.conversion}%`} icon={TrendingUp} tone="healthy" />
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {quickActions.map((a) => (
              <Button
                key={a.label}
                variant="outline"
                className="justify-start h-auto py-2.5"
                onClick={() => toast.info(a.label)}
              >
                <a.icon className="w-4 h-4" />
                <span className="truncate text-xs sm:text-sm">{a.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Return request dialog */}
      <Dialog open={!!returnFor} onOpenChange={(o) => !o && setReturnFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return request {returnFor?.id}</DialogTitle>
            <DialogDescription>
              {returnFor?.store} · {returnFor?.storeId} · to {returnFor?.requestedBy}. A reason and
              missing-information list are mandatory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason for return</Label>
              <Textarea
                id="reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Why the request cannot be processed as submitted"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="missing">Missing information</Label>
              <Textarea
                id="missing"
                value={missingInfo}
                onChange={(e) => setMissingInfo(e.target.value)}
                placeholder="e.g. offer validity dates, approved price, store photos"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnFor(null)}>
              Cancel
            </Button>
            <Button onClick={submitReturn}>Return to Relationship Manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
