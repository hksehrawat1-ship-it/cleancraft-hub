import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Facebook,
  Filter,
  Instagram,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Star,
  Upload,
  UserCog,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  CHECKLIST_ITEMS,
  PERFORMANCE_PREP,
  PLATFORMS,
  PROFILE_TASKS,
  PROFILE_TODAY,
  REVIEWS,
  STORE_PROFILES,
  TASK_FLOW,
  TASK_TYPES,
  completionPct,
  healthTone,
  isTaskOverdue,
  latestUpdate,
  platformShort,
  profileStateMeta,
  storeAlerts,
  storeCompletionPct,
  storeHealth,
  taskStatusMeta,
  type Platform,
  type ProfileTask,
  type ReviewItem,
  type StoreProfileRecord,
  type TaskStatus,
} from "./profiles-data";

const ALL = "all";

const platformIcon = (p: Platform, className = "h-4 w-4") =>
  p === "Facebook Page" ? (
    <Facebook className={className} />
  ) : p === "Instagram Business Profile" ? (
    <Instagram className={className} />
  ) : (
    <MapPin className={className} />
  );

type CardKey =
  | "to_create"
  | "verification"
  | "updates"
  | "issues"
  | "reviews"
  | "healthy"
  | null;

export function ProfilesPage() {
  const [cardFilter, setCardFilter] = useState<CardKey>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState(ALL);
  const [platform, setPlatform] = useState(ALL);
  const [profileStatus, setProfileStatus] = useState(ALL);
  const [health, setHealth] = useState(ALL);
  const [taskType, setTaskType] = useState(ALL);
  const [executive, setExecutive] = useState(ALL);
  const [rm, setRm] = useState(ALL);
  const [verification, setVerification] = useState(ALL);
  const [due, setDue] = useState(ALL);
  const [rating, setRating] = useState(ALL);
  const [tab, setTab] = useState("stores");

  const [openStore, setOpenStore] = useState<StoreProfileRecord | null>(null);
  const [openTask, setOpenTask] = useState<ProfileTask | null>(null);
  const [openReview, setOpenReview] = useState<ReviewItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const cities = Array.from(new Set(STORE_PROFILES.map((s) => s.city)));
  const rms = Array.from(new Set(STORE_PROFILES.map((s) => s.rm)));
  const execs = Array.from(new Set(STORE_PROFILES.map((s) => s.executive)));

  const counts = useMemo(() => {
    const flat = STORE_PROFILES.flatMap((s) => s.profiles);
    return {
      to_create: flat.filter((p) => p.state === "not_created").length,
      verification: flat.filter((p) => p.state === "verification_pending").length,
      updates: flat.filter((p) => p.state === "update_due").length,
      issues: flat.filter((p) => ["suspended", "restricted", "duplicate"].includes(p.state)).length,
      reviews: REVIEWS.filter((r) => ["awaiting reply", "draft ready", "approval pending"].includes(r.responseStatus))
        .length,
      healthy: STORE_PROFILES.filter((s) => storeHealth(s) === "Healthy").length,
    };
  }, []);

  const summary: { key: Exclude<CardKey, null>; label: string; value: number; tone: keyof typeof toneClasses }[] = [
    { key: "to_create", label: "Profiles to Create", value: counts.to_create, tone: "attention" },
    { key: "verification", label: "Verification Pending", value: counts.verification, tone: "attention" },
    { key: "updates", label: "Updates Due", value: counts.updates, tone: "attention" },
    { key: "issues", label: "Issues & Suspensions", value: counts.issues, tone: "overdue" },
    { key: "reviews", label: "Reviews Awaiting Reply", value: counts.reviews, tone: "active" },
    { key: "healthy", label: "Profiles Healthy", value: counts.healthy, tone: "healthy" },
  ];

  const matchText = (s: StoreProfileRecord) =>
    !search ||
    [s.store, s.storeId, s.city, s.rm, s.executive].join(" ").toLowerCase().includes(search.toLowerCase());

  const stores = useMemo(() => {
    return STORE_PROFILES.filter((s) => {
      if (!matchText(s)) return false;
      if (city !== ALL && s.city !== city) return false;
      if (rm !== ALL && s.rm !== rm) return false;
      if (executive !== ALL && s.executive !== executive) return false;
      if (health !== ALL && storeHealth(s) !== health) return false;
      if (platform !== ALL && !s.profiles.some((p) => p.platform === platform && p.state !== "not_created"))
        return false;
      if (profileStatus !== ALL && !s.profiles.some((p) => p.state === profileStatus)) return false;
      if (verification !== ALL) {
        const has = s.profiles.some((p) =>
          verification === "verified" ? p.state === "verified" : p.state === "verification_pending",
        );
        if (!has) return false;
      }
      if (due === "overdue" && !(s.deadline < PROFILE_TODAY)) return false;
      if (due === "week" && !(s.deadline >= PROFILE_TODAY && s.deadline <= "2026-08-13")) return false;
      if (cardFilter === "to_create" && !s.profiles.some((p) => p.state === "not_created")) return false;
      if (cardFilter === "verification" && !s.profiles.some((p) => p.state === "verification_pending")) return false;
      if (cardFilter === "updates" && !s.profiles.some((p) => p.state === "update_due")) return false;
      if (
        cardFilter === "issues" &&
        !s.profiles.some((p) => ["suspended", "restricted", "duplicate"].includes(p.state))
      )
        return false;
      if (cardFilter === "healthy" && storeHealth(s) !== "Healthy") return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, city, rm, executive, health, platform, profileStatus, verification, due, cardFilter]);

  const tasks = useMemo(() => {
    return PROFILE_TASKS.filter((t) => {
      if (
        search &&
        ![t.id, t.store, t.storeId, t.type, t.assignedTo].join(" ").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (city !== ALL && t.city !== city) return false;
      if (platform !== ALL && t.platform !== platform) return false;
      if (taskType !== ALL && t.type !== taskType) return false;
      if (executive !== ALL && t.assignedTo !== executive) return false;
      if (rm !== ALL && t.rm !== rm) return false;
      if (due === "overdue" && !isTaskOverdue(t)) return false;
      if (due === "week" && !(t.dueDate >= PROFILE_TODAY && t.dueDate <= "2026-08-13")) return false;
      if (cardFilter === "verification" && t.status !== "verification_pending") return false;
      if (cardFilter === "issues" && !["platform_issue", "suspended"].includes(t.status)) return false;
      if (cardFilter === "to_create" && t.type !== "Create New Profile") return false;
      return true;
    });
  }, [search, city, platform, taskType, executive, rm, due, cardFilter]);

  const reviews = useMemo(() => {
    return REVIEWS.filter((r) => {
      if (search && ![r.store, r.customer, r.text].join(" ").toLowerCase().includes(search.toLowerCase()))
        return false;
      if (platform !== ALL && r.platform !== platform) return false;
      if (executive !== ALL && r.assignedTo !== executive) return false;
      if (rating !== ALL && r.rating !== Number(rating)) return false;
      if (cardFilter === "reviews" && ["responded", "escalated"].includes(r.responseStatus)) return false;
      return true;
    });
  }, [search, platform, executive, rating, cardFilter]);

  const allAlerts = useMemo(
    () =>
      STORE_PROFILES.flatMap((s) =>
        storeAlerts(s).map((a) => ({ ...a, store: s.store, storeId: s.storeId, rm: s.rm })),
      ).sort((a, b) => Number(b.critical) - Number(a.critical)),
    [],
  );

  const resetFilters = () => {
    setSearch("");
    setCity(ALL);
    setPlatform(ALL);
    setProfileStatus(ALL);
    setHealth(ALL);
    setTaskType(ALL);
    setExecutive(ALL);
    setRm(ALL);
    setVerification(ALL);
    setDue(ALL);
    setRating(ALL);
    setCardFilter(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Google Business &amp; Social Profiles</h1>
          <p className="text-sm text-muted-foreground">
            Manage the online profiles of your assigned franchise stores.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Profile Task
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {summary.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              setCardFilter(cardFilter === c.key ? null : c.key);
              setTab(c.key === "reviews" ? "reviews" : c.key === "healthy" ? "stores" : "tasks");
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

      {/* Search + filters */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search store, Store ID, task ID, customer…"
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            <FilterSelect value={city} onChange={setCity} label="City" options={cities} />
            <FilterSelect value={platform} onChange={setPlatform} label="Platform" options={[...PLATFORMS]} />
            <FilterSelect
              value={profileStatus}
              onChange={setProfileStatus}
              label="Profile status"
              options={Object.keys(profileStateMeta)}
              render={(v) => profileStateMeta[v as keyof typeof profileStateMeta].label}
            />
            <FilterSelect
              value={health}
              onChange={setHealth}
              label="Health"
              options={["Healthy", "Attention Required", "Critical"]}
            />
            <FilterSelect value={taskType} onChange={setTaskType} label="Task type" options={[...TASK_TYPES]} />
            <FilterSelect value={executive} onChange={setExecutive} label="Executive" options={execs} />
            <FilterSelect value={rm} onChange={setRm} label="Relationship Manager" options={rms} />
            <FilterSelect
              value={verification}
              onChange={setVerification}
              label="Verification"
              options={["verified", "verification_pending"]}
              render={(v) => (v === "verified" ? "Verified" : "Pending")}
            />
            <FilterSelect
              value={due}
              onChange={setDue}
              label="Due date"
              options={["overdue", "week"]}
              render={(v) => (v === "overdue" ? "Overdue" : "Next 7 days")}
            />
            <FilterSelect
              value={rating}
              onChange={setRating}
              label="Review rating"
              options={["1", "2", "3", "4", "5"]}
              render={(v) => `${v} star`}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="stores">Store Profile Health ({stores.length})</TabsTrigger>
          <TabsTrigger value="tasks">Profile Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="reviews">Review Inbox ({reviews.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({allAlerts.length})</TabsTrigger>
          <TabsTrigger value="data">Performance Data</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "stores" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {stores.map((s) => {
            const h = storeHealth(s);
            return (
              <Card key={s.storeId} className="cursor-pointer transition hover:shadow-md" onClick={() => setOpenStore(s)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{s.store}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {s.storeId} · {s.city} · RM {s.rm}
                      </p>
                    </div>
                    <Badge variant="outline" className={toneClasses[healthTone[h]]}>
                      {h}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {s.profiles.map((p) => (
                      <div key={p.platform} className="rounded-md border p-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {platformIcon(p.platform, "h-3.5 w-3.5")}
                          {platformShort[p.platform]}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("mt-1 text-[10px]", toneClasses[profileStateMeta[p.state].tone])}
                        >
                          {profileStateMeta[p.state].label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Profile completion</span>
                      <span className="font-medium text-foreground">{storeCompletionPct(s)}%</span>
                    </div>
                    <Progress value={storeCompletionPct(s)} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Latest update</span>
                      <div className="font-medium">{latestUpdate(s)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline</span>
                      <div className={cn("font-medium", s.deadline < PROFILE_TODAY && "text-red-600")}>
                        {s.deadline}
                      </div>
                    </div>
                  </div>
                  <p className="rounded-md bg-muted/50 p-2 text-xs">
                    <span className="text-muted-foreground">Next action: </span>
                    {s.nextAction}
                  </p>
                </CardContent>
              </Card>
            );
          })}
          {stores.length === 0 && <EmptyState />}
        </div>
      )}

      {tab === "tasks" && (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id} className="cursor-pointer transition hover:shadow-md" onClick={() => setOpenTask(t)}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                    <span className="font-medium">{t.type}</span>
                    <Badge variant="outline" className={toneClasses[taskStatusMeta[t.status].tone]}>
                      {taskStatusMeta[t.status].label}
                    </Badge>
                    {isTaskOverdue(t) && (
                      <Badge variant="outline" className={toneClasses.overdue}>
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {t.store} · {t.storeId} · {platformShort[t.platform]}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">Next: {t.nextAction}</p>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <div className="font-medium">{t.priority}</div>
                  <div className="text-muted-foreground">Due {t.dueDate}</div>
                  <div className="text-muted-foreground">{t.assignedTo}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {tasks.length === 0 && <EmptyState />}
        </div>
      )}

      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="cursor-pointer transition hover:shadow-md" onClick={() => setOpenReview(r)}>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {platformIcon(r.platform, "h-4 w-4")}
                  <span className="font-medium">{r.customer}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating && "fill-current")} />
                    ))}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      toneClasses[
                        r.sentiment === "Negative" ? "overdue" : r.sentiment === "Neutral" ? "attention" : "healthy"
                      ]
                    }
                  >
                    {r.sentiment}
                  </Badge>
                  <Badge variant="outline" className={toneClasses[r.responseStatus === "responded" ? "healthy" : "attention"]}>
                    {r.responseStatus}
                  </Badge>
                </div>
                <p className="text-sm">{r.text}</p>
                <p className="text-xs text-muted-foreground">
                  {r.store} · {r.date} · Reply by {r.replyDeadline} · {r.assignedTo}
                </p>
              </CardContent>
            </Card>
          ))}
          {reviews.length === 0 && <EmptyState />}
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-2">
          {allAlerts.map((a, i) => (
            <Card key={i} className={cn("border", a.critical && "border-red-500/40")}>
              <CardContent className="flex items-start gap-3 p-4">
                {a.critical ? (
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.store} · {a.storeId} · RM {a.rm}
                    {a.critical && " · Critical — Relationship Manager notified"}
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
              Recorded here for measurement. The final employee KPI score is calculated on the Performance page.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Stat label="Profiles created" value={PERFORMANCE_PREP.profilesCreated} />
              <Stat label="Profiles verified" value={PERFORMANCE_PREP.profilesVerified} />
              <Stat label="Average setup time" value={`${PERFORMANCE_PREP.avgSetupDays} days`} />
              <Stat label="Profile completion rate" value={`${PERFORMANCE_PREP.profileCompletionRate}%`} />
              <Stat label="On-time update rate" value={`${PERFORMANCE_PREP.onTimeUpdateRate}%`} />
              <Stat label="Review response time" value={`${PERFORMANCE_PREP.avgReviewResponseHours} hrs`} />
              <Stat label="Negative reviews resolved" value={PERFORMANCE_PREP.negativeReviewsResolved} />
              <Stat label="Suspensions resolved" value={PERFORMANCE_PREP.suspensionsResolved} />
              <Stat label="Profile health score" value={`${PERFORMANCE_PREP.profileHealthScore}/100`} />
            </div>
            <Separator />
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Integration placeholders</p>
              <p className="mt-1">
                Official Google Business Profile and Meta integrations are not connected yet. Store visibility, calls,
                direction requests and website clicks are entered manually with a supporting screenshot.
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.info("Manual metric entry saved (sample)")}>
                <Upload className="mr-2 h-3.5 w-3.5" /> Enter metrics manually
              </Button>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              Security: the CRM never stores Google, Facebook or Instagram passwords. Only public profile links,
              platform account IDs and authorised access status are kept, with a full audit history. Completed records
              cannot be deleted by executives.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Store detail sheet */}
      <Sheet open={!!openStore} onOpenChange={(o) => !o && setOpenStore(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {openStore && (
            <>
              <SheetHeader>
                <SheetTitle>{openStore.store}</SheetTitle>
                <SheetDescription>
                  {openStore.storeId} · {openStore.city} · RM {openStore.rm} · Executive {openStore.executive}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={toneClasses[healthTone[storeHealth(openStore)]]}>
                    {storeHealth(openStore)}
                  </Badge>
                  <Badge variant="outline">Completion {storeCompletionPct(openStore)}%</Badge>
                  <Badge variant="outline">Deadline {openStore.deadline}</Badge>
                </div>

                {openStore.profiles.map((p) => (
                  <Card key={p.platform}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          {platformIcon(p.platform)} {p.platform}
                        </CardTitle>
                        <Badge variant="outline" className={toneClasses[profileStateMeta[p.state].tone]}>
                          {profileStateMeta[p.state].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {p.publicLink ? (
                          <a
                            href={p.publicLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open public profile
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No public link yet</span>
                        )}
                        {p.accountId && <Badge variant="outline">Account {p.accountId}</Badge>}
                        <Badge variant="outline" className="capitalize">
                          <UserCog className="mr-1 h-3 w-3" /> {p.authorisedAccess}
                        </Badge>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-muted-foreground">Setup checklist</span>
                          <span className="font-medium">{completionPct(p)}%</span>
                        </div>
                        <Progress value={completionPct(p)} className="h-2" />
                        <div className="mt-2 grid gap-1 sm:grid-cols-2">
                          {CHECKLIST_ITEMS.map((item) => {
                            const key = `${openStore.storeId}-${p.platform}-${item}`;
                            const done = checked[key] ?? p.checklist.includes(item);
                            return (
                              <label key={item} className="flex items-center gap-2">
                                <Checkbox
                                  checked={done}
                                  onCheckedChange={(v) => setChecked((c) => ({ ...c, [key]: !!v }))}
                                />
                                <span className={cn(done && "text-muted-foreground line-through")}>{item}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {p.google && (
                        <div className="grid gap-1.5 rounded-md bg-muted/40 p-3 sm:grid-cols-2">
                          <Field label="Profile creation" value={p.google.created ? "Created" : "Not created"} />
                          <Field label="Ownership request" value={p.google.ownershipRequest} />
                          <Field label="Verification method" value={p.google.verificationMethod} />
                          <Field label="Verification status" value={p.google.verificationStatus} />
                          <Field label="Business information" value={p.google.businessInfo} />
                          <Field label="Categories" value={p.google.categories} />
                          <Field label="Services" value={p.google.services} />
                          <Field label="Opening hours" value={p.google.openingHours} />
                          <Field label="Holiday hours" value={p.google.holidayHours} />
                          <Field label="Photos and videos" value={p.google.photosVideos} />
                          <Field label="Posts" value={p.google.posts} />
                          <Field label="Questions and answers" value={p.google.qAndA} />
                          <Field
                            label="Customer reviews"
                            value={`${p.google.reviewCount} reviews${p.google.rating ? ` · ${p.google.rating}★` : ""}`}
                          />
                          <Field label="Review response status" value={p.google.reviewResponseStatus} />
                          {p.google.issue && <Field label="Rejection or suspension" value={p.google.issue} />}
                          {p.google.reinstatement && <Field label="Reinstatement request" value={p.google.reinstatement} />}
                          <Field label="Last audit date" value={p.lastAudit} />
                        </div>
                      )}

                      {p.social && (
                        <div className="grid gap-1.5 rounded-md bg-muted/40 p-3 sm:grid-cols-2">
                          <Field label="Account or page created" value={p.social.created ? "Yes" : "No"} />
                          <Field
                            label="Business account connection"
                            value={p.social.businessAccountConnected ? "Connected" : "Not connected"}
                          />
                          <Field label="Store details" value={p.social.storeDetails} />
                          <Field label="Logo and cover image" value={p.social.logoCover} />
                          <Field label="Bio" value={p.social.bio} />
                          <Field label="Contact buttons" value={p.social.contactButtons} />
                          <Field label="Website link" value={p.social.websiteLink} />
                          <Field label="Location" value={p.social.location} />
                          <Field label="Business hours" value={p.social.businessHours} />
                          <Field label="Page roles" value={p.social.pageRoles} />
                          <Field label="Profile quality" value={p.social.profileQuality} />
                          <Field label="Last post date" value={p.lastPost ?? "—"} />
                          {p.social.warning && <Field label="Account warning" value={p.social.warning} />}
                          <Field label="Last audit date" value={p.lastAudit} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Visibility (manual entry)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <Stat label="Views" value={openStore.visibility.views ?? "—"} />
                    <Stat label="Calls" value={openStore.visibility.calls ?? "—"} />
                    <Stat label="Directions" value={openStore.visibility.directions ?? "—"} />
                    <Stat label="Website clicks" value={openStore.visibility.websiteClicks ?? "—"} />
                    <p className="col-span-full text-muted-foreground">{openStore.visibility.source}</p>
                  </CardContent>
                </Card>

                {storeAlerts(openStore).length > 0 && (
                  <div className="space-y-1">
                    {storeAlerts(openStore).map((a, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-start gap-2 rounded-md border p-2 text-xs",
                          a.critical ? toneClasses.overdue : toneClasses.attention,
                        )}
                      >
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          {a.text}
                          {a.critical && " — Critical, RM notified"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add profile task
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Information requested from the Relationship Manager")}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Request information
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Next profile audit scheduled")}>
                    <CalendarClock className="mr-2 h-4 w-4" /> Schedule next audit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Escalated to the Relationship Manager")}>
                    <ShieldAlert className="mr-2 h-4 w-4" /> Escalate issue
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Task detail sheet */}
      <Sheet open={!!openTask} onOpenChange={(o) => !o && setOpenTask(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {openTask && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {platformIcon(openTask.platform)} {openTask.type}
                </SheetTitle>
                <SheetDescription>
                  {openTask.id} · {openTask.store} · {openTask.storeId}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-xs">
                <div className="flex flex-wrap gap-1">
                  {TASK_FLOW.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        s === openTask.status ? toneClasses[taskStatusMeta[s].tone] : "text-muted-foreground",
                      )}
                    >
                      {taskStatusMeta[s].label}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-1.5 rounded-md bg-muted/40 p-3 sm:grid-cols-2">
                  <Field label="Platform" value={openTask.platform} />
                  <Field label="Requested by" value={openTask.requestedBy} />
                  <Field label="Assigned executive" value={openTask.assignedTo} />
                  <Field label="Relationship Manager" value={openTask.rm} />
                  <Field label="Priority" value={openTask.priority} />
                  <Field label="Request date" value={openTask.requestDate} />
                  <Field label="Due date" value={openTask.dueDate} />
                  <Field label="Current status" value={taskStatusMeta[openTask.status].label} />
                  <Field label="Required information" value={openTask.requiredInformation} />
                  <Field label="Attachments" value={openTask.attachments.join(", ") || "None"} />
                  <Field label="Next action" value={openTask.nextAction} />
                  <Field label="Internal notes" value={openTask.notes} />
                  <Field label="Completion proof" value={openTask.proof ?? "Not uploaded"} />
                </div>

                <div>
                  <p className="mb-1 font-medium">Audit history</p>
                  <div className="space-y-1">
                    {openTask.audit.map((a, i) => (
                      <div key={i} className="rounded-md border p-2">
                        <span className="text-muted-foreground">{a.at} · {a.by} — </span>
                        {a.action}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Task reassigned")}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Assign / reassign
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Proof uploaded")}>
                    <Upload className="mr-2 h-4 w-4" /> Upload proof
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Information requested from RM")}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Request information
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Submitted for review")}>
                    <Send className="mr-2 h-4 w-4" /> Submit for review
                  </Button>
                  <Button
                    size="sm"
                    disabled={!openTask.proof}
                    onClick={() => toast.success("Task marked completed")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark completed
                  </Button>
                </div>
                {!openTask.proof && (
                  <p className="text-muted-foreground">
                    A task cannot be marked completed until completion proof is uploaded.
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Review sheet */}
      <Sheet open={!!openReview} onOpenChange={(o) => !o && setOpenReview(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {openReview && (
            <>
              <SheetHeader>
                <SheetTitle>Review response</SheetTitle>
                <SheetDescription>
                  {openReview.store} · {platformShort[openReview.platform]} · {openReview.date}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{openReview.customer}</span>
                    <span className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3.5 w-3.5", i < openReview.rating && "fill-current")} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{openReview.text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Reply deadline {openReview.replyDeadline} · {openReview.assignedTo}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Draft response</Label>
                  <Textarea defaultValue={openReview.draft ?? ""} rows={5} placeholder="Write a reply for this customer…" />
                  <p className="text-xs text-muted-foreground">
                    Suggested replies are drafts only. Nothing is published automatically — a person must review and
                    approve every response.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Draft saved")}>
                    Save draft
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Sent for approval")}>
                    <Send className="mr-2 h-4 w-4" /> Submit for approval
                  </Button>
                  <Button size="sm" onClick={() => toast.success("Marked as responded")}>
                    <BadgeCheck className="mr-2 h-4 w-4" /> Mark as responded
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => toast.success("Escalated to the Relationship Manager")}>
                    <ShieldAlert className="mr-2 h-4 w-4" /> Escalate to RM
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add profile task */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Profile Task</DialogTitle>
            <DialogDescription>
              Every task links to one permanent Store ID. Only one active profile record per store per platform is
              allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Store</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_PROFILES.map((s) => (
                    <SelectItem key={s.storeId} value={s.storeId}>
                      {s.storeId} — {s.store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Platform</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
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
              <div className="space-y-1">
                <Label>Task type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Urgent"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Due date</Label>
                <Input type="date" defaultValue="2026-08-12" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Required information</Label>
              <Textarea rows={2} placeholder="What is needed from the store or Relationship Manager?" />
            </div>
            <div className="space-y-1">
              <Label>Next action</Label>
              <Input placeholder="e.g. Submit video verification to Google" />
            </div>
            <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              Never enter platform passwords. Save only public profile links, account IDs and authorised access status.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success("Profile task created and linked to the Store ID");
              }}
            >
              Create task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function EmptyState() {
  return (
    <Card className="col-span-full">
      <CardContent className="p-8 text-center text-sm text-muted-foreground">
        No records match the current filters.
      </CardContent>
    </Card>
  );
}

export type { TaskStatus };
