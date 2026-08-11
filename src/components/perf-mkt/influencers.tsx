import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Facebook,
  FileText,
  Filter,
  Instagram,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Star,
  Upload,
  Users,
  Youtube,
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

import { toneClasses } from "./data";
import {
  COLLABORATIONS,
  COLLAB_FLOW,
  COLLAB_PERFORMANCE_PREP,
  COLLAB_TODAY,
  CONTENT_FORMATS,
  CREATORS,
  CREATOR_PLATFORMS,
  canComplete,
  collabAlerts,
  collabStatusMeta,
  creatorById,
  isCollabOverdue,
  isCommercialApproved,
  isContentApproved,
  type Collaboration,
  type CollabStatus,
  type Creator,
  type CreatorPlatform,
} from "./influencers-data";

const ALL = "all";

const platformIcon = (p: CreatorPlatform, className = "h-4 w-4") =>
  p === "YouTube" ? (
    <Youtube className={className} />
  ) : p === "Facebook" ? (
    <Facebook className={className} />
  ) : (
    <Instagram className={className} />
  );

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const compact = (n: number) =>
  n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

type CardKey = "shortlisted" | "approval" | "active" | "review" | "scheduled" | "overdue" | "completed" | null;

const ACTIVE_STATUSES: CollabStatus[] = [
  "creator_contacted",
  "negotiation",
  "confirmed",
  "brief_shared",
  "content_received",
  "scheduled",
  "published",
  "results_recorded",
];

export function InfluencersPage() {
  const [tab, setTab] = useState("all");
  const [cardFilter, setCardFilter] = useState<CardKey>(null);
  const [search, setSearch] = useState("");
  const [creatorF, setCreatorF] = useState(ALL);
  const [platform, setPlatform] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [language, setLanguage] = useState(ALL);
  const [store, setStore] = useState(ALL);
  const [campaign, setCampaign] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [executive, setExecutive] = useState(ALL);
  const [publishF, setPublishF] = useState(ALL);
  const [payment, setPayment] = useState(ALL);
  const [ratingF, setRatingF] = useState(ALL);

  const [openCollab, setOpenCollab] = useState<Collaboration | null>(null);
  const [openCreator, setOpenCreator] = useState<Creator | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [comment, setComment] = useState("");

  const counts = useMemo(
    () => ({
      shortlisted: COLLABORATIONS.filter((c) => c.status === "shortlisted").length + CREATORS.filter((c) => c.status === "Active").length,
      approval: COLLABORATIONS.filter((c) => c.status === "internal_approval").length,
      active: COLLABORATIONS.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
      review: COLLABORATIONS.filter((c) => ["content_received", "under_review", "correction_required"].includes(c.status)).length,
      scheduled: COLLABORATIONS.filter((c) => c.status === "scheduled").length,
      overdue: COLLABORATIONS.filter(isCollabOverdue).length,
      completed: COLLABORATIONS.filter((c) => c.status === "completed").length,
    }),
    [],
  );

  const summary: { key: Exclude<CardKey, null>; label: string; value: number; tone: keyof typeof toneClasses }[] = [
    { key: "shortlisted", label: "Creators Shortlisted", value: counts.shortlisted, tone: "draft" },
    { key: "approval", label: "Approval Pending", value: counts.approval, tone: "attention" },
    { key: "active", label: "Active Collaborations", value: counts.active, tone: "active" },
    { key: "review", label: "Content Awaiting Review", value: counts.review, tone: "attention" },
    { key: "scheduled", label: "Scheduled to Publish", value: counts.scheduled, tone: "active" },
    { key: "overdue", label: "Overdue Deliverables", value: counts.overdue, tone: "overdue" },
    { key: "completed", label: "Completed Collaborations", value: counts.completed, tone: "healthy" },
  ];

  const cities = Array.from(new Set([...CREATORS.map((c) => c.city), ...COLLABORATIONS.map((c) => c.city)]));
  const languages = Array.from(new Set(CREATORS.flatMap((c) => c.languages)));
  const stores = Array.from(new Set(COLLABORATIONS.filter((c) => c.store).map((c) => `${c.storeId} — ${c.store}`)));
  const campaigns = Array.from(new Set(COLLABORATIONS.map((c) => c.campaignId).filter(Boolean) as string[]));
  const execs = Array.from(new Set(COLLABORATIONS.map((c) => c.executive)));

  const collabs = useMemo(() => {
    return COLLABORATIONS.filter((c) => {
      const cr = creatorById(c.creatorId);
      if (
        search &&
        ![c.id, c.title, c.store ?? "", c.storeId ?? "", c.campaignId ?? "", cr?.name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (creatorF !== ALL && c.creatorId !== creatorF) return false;
      if (platform !== ALL && c.platform !== platform) return false;
      if (city !== ALL && c.city !== city && cr?.city !== city) return false;
      if (language !== ALL && !cr?.languages.includes(language)) return false;
      if (store !== ALL && `${c.storeId} — ${c.store}` !== store) return false;
      if (campaign !== ALL && c.campaignId !== campaign) return false;
      if (status !== ALL && c.status !== status) return false;
      if (executive !== ALL && c.executive !== executive) return false;
      if (payment !== ALL && c.paymentStatus !== payment) return false;
      if (ratingF !== ALL && (cr?.qualityRating ?? 0) < Number(ratingF)) return false;
      if (publishF === "overdue" && !(c.publishDate !== "—" && c.publishDate < COLLAB_TODAY && c.status !== "completed"))
        return false;
      if (publishF === "week" && !(c.publishDate >= COLLAB_TODAY && c.publishDate <= "2026-08-13")) return false;

      if (cardFilter === "approval" && c.status !== "internal_approval") return false;
      if (cardFilter === "active" && !ACTIVE_STATUSES.includes(c.status)) return false;
      if (cardFilter === "review" && !["content_received", "under_review", "correction_required"].includes(c.status))
        return false;
      if (cardFilter === "scheduled" && c.status !== "scheduled") return false;
      if (cardFilter === "overdue" && !isCollabOverdue(c)) return false;
      if (cardFilter === "completed" && c.status !== "completed") return false;

      if (tab === "shortlisted" && c.status !== "shortlisted") return false;
      if (tab === "approval" && c.status !== "internal_approval") return false;
      if (tab === "active" && !ACTIVE_STATUSES.includes(c.status)) return false;
      if (tab === "review" && !["content_received", "under_review", "correction_required"].includes(c.status))
        return false;
      if (tab === "scheduled" && c.status !== "scheduled") return false;
      if (tab === "completed" && c.status !== "completed") return false;
      if (tab === "rejected" && !["rejected", "cancelled"].includes(c.status)) return false;
      return true;
    });
  }, [search, creatorF, platform, city, language, store, campaign, status, executive, payment, ratingF, publishF, cardFilter, tab]);

  const directory = useMemo(
    () =>
      CREATORS.filter((c) => {
        if (search && ![c.id, c.name, c.contactPerson, c.category].join(" ").toLowerCase().includes(search.toLowerCase()))
          return false;
        if (creatorF !== ALL && c.id !== creatorF) return false;
        if (city !== ALL && c.city !== city) return false;
        if (language !== ALL && !c.languages.includes(language)) return false;
        if (platform !== ALL && !c.platforms.includes(platform as CreatorPlatform)) return false;
        if (ratingF !== ALL && c.qualityRating < Number(ratingF)) return false;
        return true;
      }),
    [search, creatorF, city, language, platform, ratingF],
  );

  const allAlerts = useMemo(
    () =>
      COLLABORATIONS.flatMap((c) => collabAlerts(c).map((a) => ({ ...a, collab: c }))).sort(
        (a, b) => Number(b.critical) - Number(a.critical),
      ),
    [],
  );

  const reset = () => {
    setSearch("");
    setCreatorF(ALL);
    setPlatform(ALL);
    setCity(ALL);
    setLanguage(ALL);
    setStore(ALL);
    setCampaign(ALL);
    setStatus(ALL);
    setExecutive(ALL);
    setPublishF(ALL);
    setPayment(ALL);
    setRatingF(ALL);
    setCardFilter(null);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Influencers &amp; YouTubers</h1>
          <p className="text-sm text-muted-foreground">Manage creator collaborations, deliverables, costs and results.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Collaboration
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
        {summary.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              const next = cardFilter === c.key ? null : c.key;
              setCardFilter(next);
              setTab(next === "shortlisted" ? "directory" : "all");
            }}
            className={cn(
              "rounded-lg border p-3 text-left transition hover:shadow-sm",
              cardFilter === c.key ? "ring-2 ring-primary" : "",
              toneClasses[c.tone],
            )}
          >
            <div className="text-2xl font-semibold">{c.value}</div>
            <div className="text-xs font-medium leading-tight">{c.label}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search creator, collaboration ID, store or campaign…"
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={reset}>
              <Filter className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <FilterSelect
              value={creatorF}
              onChange={setCreatorF}
              label="Creator"
              options={CREATORS.map((c) => c.id)}
              render={(v) => creatorById(v)?.name ?? v}
            />
            <FilterSelect value={platform} onChange={setPlatform} label="Platform" options={[...CREATOR_PLATFORMS]} />
            <FilterSelect value={city} onChange={setCity} label="City" options={cities} />
            <FilterSelect value={language} onChange={setLanguage} label="Language" options={languages} />
            <FilterSelect value={store} onChange={setStore} label="Store" options={stores} />
            <FilterSelect value={campaign} onChange={setCampaign} label="Campaign" options={campaigns} />
            <FilterSelect
              value={status}
              onChange={setStatus}
              label="Status"
              options={Object.keys(collabStatusMeta)}
              render={(v) => collabStatusMeta[v as CollabStatus].label}
            />
            <FilterSelect value={executive} onChange={setExecutive} label="Executive" options={execs} />
            <FilterSelect
              value={publishF}
              onChange={setPublishF}
              label="Publishing date"
              options={["overdue", "week"]}
              render={(v) => (v === "overdue" ? "Past due" : "Next 7 days")}
            />
            <FilterSelect
              value={payment}
              onChange={setPayment}
              label="Payment"
              options={["Not due", "Pending", "Partly paid", "Paid", "On hold"]}
            />
            <FilterSelect
              value={ratingF}
              onChange={setRatingF}
              label="Performance rating"
              options={["3", "4", "4.5"]}
              render={(v) => `${v}★ and above`}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="all">All ({collabs.length})</TabsTrigger>
          <TabsTrigger value="directory">Creator Directory ({directory.length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="approval">Approval Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="review">Content Review</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({allAlerts.length})</TabsTrigger>
          <TabsTrigger value="data">Performance Data</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "directory" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {directory.map((c) => (
            <Card key={c.id} className="cursor-pointer transition hover:shadow-md" onClick={() => setOpenCreator(c)}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.id} · {c.type} · {c.city}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {c.platforms.map((p) => (
                    <Badge key={p} variant="outline" className="gap-1 text-[10px]">
                      {platformIcon(p, "h-3 w-3")} {p}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className={toneClasses[c.status === "Active" ? "healthy" : c.status === "On Hold" ? "attention" : "overdue"]}
                  >
                    {c.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <MiniStat label="Followers" value={compact(c.followers)} />
                  <MiniStat label="Avg views" value={compact(c.avgViews)} />
                  <MiniStat label="Engagement" value={`${c.engagementRate}%`} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {c.qualityRating} quality
                  </span>
                  <span>{c.reliabilityRating} reliability</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {directory.length === 0 && <Empty />}
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-2">
          {allAlerts.map((a, i) => (
            <Card key={i} className={cn(a.critical && "border-red-500/40")}>
              <CardContent
                className="flex cursor-pointer items-start gap-3 p-4"
                onClick={() => setOpenCollab(a.collab)}
              >
                {a.critical ? (
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.collab.id} · {a.collab.title}
                    {a.critical && " · Escalated to the authorised manager"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "data" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Data Preparation</CardTitle>
            <p className="text-xs text-muted-foreground">
              Recorded for measurement only. The final employee KPI score is calculated on the Performance page.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Stat label="Collaborations completed" value={COLLAB_PERFORMANCE_PREP.collaborationsCompleted} />
              <Stat label="On-time coordination rate" value={`${COLLAB_PERFORMANCE_PREP.onTimeCoordinationRate}%`} />
              <Stat label="Content approval turnaround" value={`${COLLAB_PERFORMANCE_PREP.avgApprovalTurnaroundHours} hrs`} />
              <Stat label="Overdue deliverables" value={COLLAB_PERFORMANCE_PREP.overdueDeliverables} />
              <Stat label="Average correction rounds" value={COLLAB_PERFORMANCE_PREP.avgCorrectionRounds} />
              <Stat label="Qualified leads generated" value={COLLAB_PERFORMANCE_PREP.qualifiedLeads} />
              <Stat label="Orders generated" value={COLLAB_PERFORMANCE_PREP.orders} />
              <Stat label="Creator campaign return" value={`${COLLAB_PERFORMANCE_PREP.creatorReturn}x`} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium">High-performing creators identified</p>
              <div className="flex flex-wrap gap-1.5">
                {COLLAB_PERFORMANCE_PREP.highPerformingCreators.map((n) => (
                  <Badge key={n} variant="outline" className={toneClasses.healthy}>
                    {n}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Integration placeholders</p>
              <p className="mt-1">{COLLAB_PERFORMANCE_PREP.source}. Authorised users may enter results manually with screenshots or links as proof.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.info("Manual result entry saved (sample)")}>
                <Upload className="mr-2 h-3.5 w-3.5" /> Enter results manually
              </Button>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              Security: creator platform passwords are never stored. Only public profile links, contact details and agreed
              commercials are kept, with a complete audit trail. Completed records cannot be deleted by executives.
            </div>
          </CardContent>
        </Card>
      )}

      {!["directory", "alerts", "data"].includes(tab) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {collabs.map((c) => {
            const cr = creatorById(c.creatorId);
            const meta = collabStatusMeta[c.status];
            const step = COLLAB_FLOW.indexOf(c.status);
            return (
              <Card key={c.id} className="cursor-pointer transition hover:shadow-md" onClick={() => setOpenCollab(c)}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(cr?.name ?? c.title)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[11px] text-muted-foreground">{c.id}</span>
                        <Badge variant="outline" className={toneClasses[meta.tone]}>
                          {meta.label}
                        </Badge>
                        {isCollabOverdue(c) && (
                          <Badge variant="outline" className={toneClasses.overdue}>
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {cr?.name} · {platformShortLabel(c.platform)} · {c.format}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <Badge variant="outline">{c.scope === "Store" ? `${c.storeId}` : c.campaignRef}</Badge>
                    {c.campaignId && <Badge variant="outline">{c.campaignId}</Badge>}
                    {c.requestRef && <Badge variant="outline">{c.requestRef}</Badge>}
                    <Badge variant="outline">{c.paymentStatus}</Badge>
                  </div>

                  {step >= 0 && (
                    <div>
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>Workflow progress</span>
                        <span>
                          Step {step + 1} of {COLLAB_FLOW.length}
                        </span>
                      </div>
                      <Progress value={((step + 1) / COLLAB_FLOW.length) * 100} className="h-1.5" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Submission</span>
                      <div className="font-medium">{c.submissionDeadline}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Publishing</span>
                      <div className="font-medium">{c.publishDate}</div>
                    </div>
                  </div>
                  <p className="rounded-md bg-muted/50 p-2 text-xs">
                    <span className="text-muted-foreground">Next action: </span>
                    {c.nextAction}
                    <span className={cn("ml-1", c.nextActionDue < COLLAB_TODAY && "text-red-600")}>
                      (by {c.nextActionDue})
                    </span>
                  </p>
                  {c.results && (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <MiniStat label="Qualified leads" value={c.results.qualifiedLeads} />
                      <MiniStat label="Orders" value={c.results.orders} />
                      <MiniStat label="Sales" value={c.results.orders} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {collabs.length === 0 && <Empty />}
        </div>
      )}

      {/* Collaboration detail */}
      <Sheet open={!!openCollab} onOpenChange={(o) => !o && setOpenCollab(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {openCollab && (
            <CollabDetail
              c={openCollab}
              comment={comment}
              setComment={setComment}
              onOpenCreator={(cr) => {
                setOpenCollab(null);
                setOpenCreator(cr);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Creator detail */}
      <Sheet open={!!openCreator} onOpenChange={(o) => !o && setOpenCreator(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {openCreator && <CreatorDetail c={openCreator} />}
        </SheetContent>
      </Sheet>

      {/* Add collaboration */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Collaboration</DialogTitle>
            <DialogDescription>
              Store collaborations link to a Store ID and campaign collaborations link to a Campaign ID. Duplicate
              creators are checked by name, phone number and profile link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Creator</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select creator from directory" />
                </SelectTrigger>
                <SelectContent>
                  {CREATORS.filter((c) => c.status !== "Blocked").map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Collaboration title</Label>
              <Input placeholder="e.g. Jaipur festive care reel" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Scope</Label>
                <Select defaultValue="Store">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Store">Store</SelectItem>
                    <SelectItem value="Company Campaign">Company Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Store ID or Campaign ID</Label>
                <Input placeholder="STR-1042 or CMP-8860" />
              </div>
              <div className="space-y-1">
                <Label>Platform</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATOR_PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Content format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Submission deadline</Label>
                <Input type="date" defaultValue="2026-08-14" />
              </div>
              <div className="space-y-1">
                <Label>Planned publishing date</Label>
                <Input type="date" defaultValue="2026-08-18" />
              </div>
              <div className="space-y-1">
                <Label>Agreed amount (₹)</Label>
                <Input type="number" placeholder="25000" />
              </div>
              <div className="space-y-1">
                <Label>Payment terms</Label>
                <Input placeholder="50% advance, 50% after publishing" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Objective and required message</Label>
              <Textarea rows={2} placeholder="What must the creator communicate?" />
            </div>
            <div className="space-y-1">
              <Label>Next action and deadline</Label>
              <Input placeholder="e.g. Send for internal approval by 08 Aug" />
            </div>
            <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              The collaboration starts as Shortlisted. A creator cannot be confirmed without internal manager approval,
              and creator platform passwords must never be entered here.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success("Collaboration created and sent for internal approval");
              }}
            >
              Create collaboration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function platformShortLabel(p: CreatorPlatform) {
  return p;
}

function CollabDetail({
  c,
  comment,
  setComment,
  onOpenCreator,
}: {
  c: Collaboration;
  comment: string;
  setComment: (v: string) => void;
  onOpenCreator: (cr: Creator) => void;
}) {
  const cr = creatorById(c.creatorId);
  const step = COLLAB_FLOW.indexOf(c.status);
  const approved = isContentApproved(c);
  const alerts = collabAlerts(c);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {platformIcon(c.platform)} {c.title}
        </SheetTitle>
        <SheetDescription>
          {c.id} · {cr?.name} · {c.scope === "Store" ? `${c.storeId} ${c.store}` : c.campaignRef}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-4 space-y-5 text-xs">
        {/* Timeline */}
        <div className="rounded-md border p-3">
          <p className="mb-2 text-xs font-medium">Workflow timeline</p>
          <ol className="space-y-1">
            {COLLAB_FLOW.map((s, i) => {
              const done = step >= 0 && i < step;
              const current = i === step;
              return (
                <li key={s} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]",
                      done && "border-emerald-500 bg-emerald-500/15 text-emerald-600",
                      current && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={cn(current ? "font-medium" : "text-muted-foreground")}>
                    {collabStatusMeta[s].label}
                  </span>
                </li>
              );
            })}
          </ol>
          {!COLLAB_FLOW.includes(c.status) && (
            <Badge variant="outline" className={cn("mt-2", toneClasses[collabStatusMeta[c.status].tone])}>
              {collabStatusMeta[c.status].label}
            </Badge>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="space-y-1">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-md border p-2",
                  a.critical ? toneClasses.overdue : toneClasses.attention,
                )}
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {a.text}
                  {a.critical && " — escalated to the authorised manager"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Record */}
        <Section title="Collaboration record">
          <Field label="Creator" value={`${c.creatorId} — ${cr?.name ?? ""}`} />
          <Field label="Scope" value={c.scope === "Store" ? `${c.storeId} · ${c.store}` : (c.campaignRef ?? "Company campaign")} />
          <Field label="Marketing Request ID" value={c.requestRef ?? "—"} />
          <Field label="Campaign ID" value={c.campaignId ?? "—"} />
          <Field label="Relationship Manager" value={c.rm ?? "Not applicable"} />
          <Field label="Assigned executive" value={c.executive} />
          <Field label="Objective" value={c.objective} />
          <Field label="Target audience" value={c.targetAudience} />
          <Field label="Platform" value={c.platform} />
          <Field label="Content format" value={c.format} />
          <Field label="Deliverables" value={c.deliverables.join(" · ")} />
          <Field label="Required message" value={c.requiredMessage} />
          <Field label="Offer or promo code" value={c.promoCode} />
          <Field label="Call to action" value={c.callToAction} />
          <Field label="Submission deadline" value={c.submissionDeadline} />
          <Field label="Planned publishing date" value={c.publishDate} />
          <Field label="Payment terms" value={c.paymentTerms} />
          <Field label="Payment status" value={c.paymentStatus} />
          <Field label="Next action" value={`${c.nextAction} (by ${c.nextActionDue})`} />
          <Field label="Attachments" value={c.attachments.join(", ") || "None"} />
          <Field label="Notes" value={c.notes} />
        </Section>

        {/* Selection and approval */}
        <Section title="Selection and approval">
          <Field label="Audience relevance" value={c.approval.audienceRelevance} />
          <Field label="Location relevance" value={c.approval.locationRelevance} />
          <Field label="Average views" value={compact(c.approval.avgViews)} />
          <Field label="Engagement" value={`${c.approval.engagement}%`} />
          <Field label="Previous performance" value={c.approval.previousPerformance} />
          <Field label="Estimated reach" value={compact(c.approval.estimatedReach)} />
          <Field label="Brand suitability" value={c.approval.brandSuitability} />
          <Field label="Risk notes" value={c.approval.riskNotes} />
          <Field label="Expected leads" value={`${c.approval.expectedLeads}`} />
          <Field
            label="Commercial approval"
            value={
              isCommercialApproved(c)
                ? `${c.approval.approvedBy} on ${c.approval.approvedOn}`
                : "Pending — only an authorised manager can approve"
            }
          />
        </Section>

        {/* Brief */}
        {c.brief ? (
          <Section title="Content brief">
            <Field label="Campaign objective" value={c.objective} />
            <Field label="Key talking points" value={c.brief.talkingPoints.join(" · ")} />
            <Field label="Mandatory claims" value={c.brief.mandatoryClaims.join(" · ")} />
            <Field label="Prohibited claims" value={c.brief.prohibitedClaims.join(" · ")} />
            <Field label="Offer details" value={c.brief.offerDetails} />
            <Field label="Promo code / tracking link" value={`${c.promoCode} · ${c.brief.trackingLink}`} />
            <Field label="Call to action" value={c.callToAction} />
            <Field label="Brand guidelines" value={c.brief.brandGuidelines} />
            <Field label="Required shots" value={c.brief.requiredShots.join(" · ")} />
            <Field label="Format and duration" value={`${c.format} · ${c.brief.duration}`} />
            <Field label="Submission deadline" value={c.submissionDeadline} />
            <Field label="Publishing deadline" value={c.publishDate} />
            <Field label="Disclosure requirement" value={c.brief.disclosure} />
            <Field label="Brief shared on" value={c.brief.sharedOn ?? "Not shared"} />
          </Section>
        ) : (
          <div className="rounded-md border border-dashed p-3 text-muted-foreground">
            Content brief not shared yet.
            <Button size="sm" variant="outline" className="ml-2" onClick={() => toast.success("Content brief shared with the creator")}>
              <FileText className="mr-2 h-3.5 w-3.5" /> Share brief
            </Button>
          </div>
        )}

        {/* Content review */}
        <div className="space-y-2">
          <p className="text-xs font-medium">Content review and version history</p>
          {c.versions.length === 0 && <p className="text-muted-foreground">No content submitted yet.</p>}
          {c.versions.map((v) => (
            <div key={v.version} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{v.version}</Badge>
                <span className="text-muted-foreground">Submitted {v.submittedOn}</span>
                <Badge
                  variant="outline"
                  className={
                    toneClasses[
                      v.decision === "approved" ? "healthy" : v.decision === "under review" ? "attention" : "overdue"
                    ]
                  }
                >
                  {v.decision}
                </Badge>
                <a href={v.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                  <ExternalLink className="h-3 w-3" /> Preview
                </a>
              </div>
              <div className="mt-2 space-y-1">
                {v.comments.map((cm, i) => (
                  <p key={i} className="text-muted-foreground">
                    <span className="font-medium text-foreground">{cm.by}</span> · {cm.at} — {cm.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <Textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a timestamped comment, e.g. 01:24 — remove prohibited claim"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setComment(""); toast.success("Comment added to the version"); }}>
              <MessageSquare className="mr-2 h-4 w-4" /> Add comment
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Correction requested from the creator")}>
              Request correction
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Revised version uploaded")}>
              <Upload className="mr-2 h-4 w-4" /> Upload revised version
            </Button>
            <Button size="sm" onClick={() => toast.success("Content approved by the authorised manager")}>
              <BadgeCheck className="mr-2 h-4 w-4" /> Approve content
            </Button>
          </div>
        </div>

        {/* Publishing proof */}
        <Section title="Publishing proof">
          {c.publishProof ? (
            <>
              <Field label="Live content link" value={c.publishProof.liveLink} />
              <Field label="Platform" value={c.publishProof.platform} />
              <Field label="Published at" value={c.publishProof.publishedAt} />
              <Field label="Screenshot" value={c.publishProof.screenshot} />
              <Field label="Promo code / tracking link" value={c.publishProof.trackingRef} />
              <Field label="Payment status" value={c.paymentStatus} />
            </>
          ) : (
            <p className="text-muted-foreground">
              {approved
                ? "Not published yet. Live link, platform, publishing date and time, screenshot, tracking reference, final amount and payment status are required to mark it published."
                : "Content is not approved yet — it cannot be scheduled or published."}
            </p>
          )}
        </Section>

        {/* Results */}
        <Section title="Results">
          {c.results ? (
            <>
              <Field label="Reach" value={compact(c.results.reach)} />
              <Field label="Views" value={compact(c.results.views)} />
              <Field label="Watch time" value={`${c.results.watchTimeHours} hrs`} />
              <Field label="Likes" value={compact(c.results.likes)} />
              <Field label="Comments" value={`${c.results.comments}`} />
              <Field label="Shares" value={`${c.results.shares}`} />
              <Field label="Link clicks" value={`${c.results.linkClicks}`} />
              <Field label="Enquiries" value={`${c.results.enquiries}`} />
              <Field label="Qualified leads" value={`${c.results.qualifiedLeads}`} />
              <Field label="Orders" value={`${c.results.orders}`} />
              <Field label="Measurement period" value={c.results.period} />
              <Field label="Data source" value={c.results.source} />
            </>
          ) : (
            <p className="text-muted-foreground">
              Results not recorded. Qualified leads, orders and sales matter more than followers or likes.
            </p>
          )}
        </Section>

        {/* Audit */}
        <div>
          <p className="mb-1 text-xs font-medium">Audit trail</p>
          <div className="space-y-1">
            {c.audit.map((a, i) => (
              <div key={i} className="rounded-md border p-2">
                <span className="text-muted-foreground">
                  {a.at} · {a.by} —{" "}
                </span>
                {a.action}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {cr && (
            <Button size="sm" variant="outline" onClick={() => onOpenCreator(cr)}>
              <Users className="mr-2 h-4 w-4" /> View creator profile
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => toast.success("Sent for manager approval")}>
            <Send className="mr-2 h-4 w-4" /> Send for approval
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!approved}
            onClick={() => toast.success("Publishing scheduled")}
          >
            Schedule publishing
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Publishing proof uploaded")}>
            <Upload className="mr-2 h-4 w-4" /> Upload publishing proof
          </Button>
          <Button size="sm" disabled={!canComplete(c)} onClick={() => toast.success("Collaboration completed")}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark completed
          </Button>
          <Button size="sm" variant="destructive" onClick={() => toast.success("Escalated to the authorised manager")}>
            <ShieldAlert className="mr-2 h-4 w-4" /> Escalate
          </Button>
        </div>
        {!canComplete(c) && (
          <p className="text-muted-foreground">
            A collaboration cannot be completed until publishing proof and results are recorded.
          </p>
        )}
      </div>
    </>
  );
}

function CreatorDetail({ c }: { c: Creator }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{c.name}</SheetTitle>
        <SheetDescription>
          {c.id} · {c.type} · {c.city}
        </SheetDescription>
      </SheetHeader>
      <div className="mt-4 space-y-4 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {c.platforms.map((p) => (
            <Badge key={p} variant="outline" className="gap-1">
              {platformIcon(p, "h-3 w-3")} {p}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className={toneClasses[c.status === "Active" ? "healthy" : c.status === "On Hold" ? "attention" : "overdue"]}
          >
            {c.status}
          </Badge>
        </div>
        <Section title="Creator profile">
          <Field label="Contact person" value={c.contactPerson} />
          <Field label="City" value={c.city} />
          <Field label="Service area" value={c.serviceArea} />
          <Field label="Languages" value={c.languages.join(", ")} />
          <Field label="Content category" value={c.category} />
          <Field label="Followers or subscribers" value={compact(c.followers)} />
          <Field label="Average views" value={compact(c.avgViews)} />
          <Field label="Engagement rate" value={`${c.engagementRate}%`} />
          <Field label="Audience location" value={c.audienceLocation} />
          <Field label="Previous Clean Craft collaborations" value={`${c.pastCollabs}`} />
          <Field label="Quality rating" value={`${c.qualityRating}/5`} />
          <Field label="Reliability rating" value={`${c.reliabilityRating}/5`} />
          <Field label="Notes" value={c.notes} />
        </Section>
        <div>
          <p className="mb-1 font-medium">Public profile links</p>
          <div className="space-y-1">
            {c.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary underline"
              >
                {platformIcon(l.platform, "h-3.5 w-3.5")} {l.url}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 font-medium">Collaborations</p>
          <div className="space-y-1">
            {COLLABORATIONS.filter((x) => x.creatorId === c.id).map((x) => (
              <div key={x.id} className="flex items-center justify-between rounded-md border p-2">
                <span className="truncate">{x.title}</span>
                <Badge variant="outline" className={toneClasses[collabStatusMeta[x.status].tone]}>
                  {collabStatusMeta[x.status].label}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        <p className="rounded-md bg-muted/50 p-2 text-muted-foreground">
          Social-media passwords are never stored. Contact and commercial details are visible only to authorised users.
        </p>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium">{title}</p>
      <div className="grid gap-1.5 rounded-md bg-muted/40 p-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
  render,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {render ? render(o) : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-1.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Empty() {
  return (
    <Card className="col-span-full">
      <CardContent className="p-8 text-center text-sm text-muted-foreground">
        No records match the current filters.
      </CardContent>
    </Card>
  );
}
