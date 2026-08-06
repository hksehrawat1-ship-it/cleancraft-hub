import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Filter,
  Grid2x2,
  Image as ImageIcon,
  Link2,
  Plus,
  Rows3,
  Search,
  Send,
  Share2,
  Upload,
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
  CREATIVES_FULL,
  CREATIVE_FLOW,
  CREATIVE_PLATFORMS,
  CREATIVE_TYPES,
  approvedVersion,
  canDeliver,
  canShare,
  canSubmitForReview,
  creativeAlerts,
  creativeStatusMeta,
  isExpired,
  isOverdue,
  latestVersion,
  type CreativeRecord,
  type CreativeStatus,
} from "./creatives-data";

const TABS = [
  { id: "all", label: "All Creatives" },
  { id: "new", label: "New Requests" },
  { id: "progress", label: "In Progress" },
  { id: "review", label: "Under Review" },
  { id: "corrections", label: "Corrections" },
  { id: "approved", label: "Approved" },
  { id: "delivered", label: "Delivered" },
  { id: "expired", label: "Expired" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const BRIEF_FIELDS: { label: string; key: keyof CreativeRecord["brief"] }[] = [
  { label: "Business objective", key: "objective" },
  { label: "Store or campaign", key: "storeOrCampaign" },
  { label: "Target customer", key: "targetCustomer" },
  { label: "Main message", key: "mainMessage" },
  { label: "Offer details", key: "offerDetails" },
  { label: "Required wording", key: "requiredWording" },
  { label: "Call to action", key: "cta" },
  { label: "Platform", key: "platform" },
  { label: "Required size", key: "size" },
  { label: "Language", key: "language" },
  { label: "Brand instructions", key: "brandInstructions" },
  { label: "Deadline", key: "deadline" },
];

function StatusBadge({ status }: { status: CreativeStatus }) {
  const meta = creativeStatusMeta[status];
  return (
    <Badge variant="outline" className={cn("font-medium", toneClasses[meta.tone])}>
      {meta.label}
    </Badge>
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

function Thumb({ c, className }: { c: CreativeRecord; className?: string }) {
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden rounded-md border", className)}
      style={{ background: `linear-gradient(135deg, hsl(${c.thumbnailHue} 70% 92%), hsl(${c.thumbnailHue} 60% 78%))` }}
      aria-label={`${c.title} preview placeholder`}
    >
      <ImageIcon className="h-6 w-6 opacity-50" />
      {isExpired(c) ? (
        <span className="absolute inset-x-0 bottom-0 bg-red-600/90 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
          Do not use
        </span>
      ) : null}
    </div>
  );
}

export function PerfMktCreatives() {
  const [creatives] = useState<CreativeRecord[]>(CREATIVES_FULL);
  const [tab, setTab] = useState<TabId>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [store, setStore] = useState("all");
  const [type, setType] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [reviewer, setReviewer] = useState("all");
  const [language, setLanguage] = useState("all");
  const [deadlineBy, setDeadlineBy] = useState("");
  const [expiryBy, setExpiryBy] = useState("");
  const [campaign, setCampaign] = useState("all");

  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const selected = creatives.find((c) => c.id === openId) ?? null;

  const opts = useMemo(
    () => ({
      stores: Array.from(new Set(creatives.map((c) => c.store))),
      assignees: Array.from(new Set(creatives.map((c) => c.assignedTo))),
      reviewers: Array.from(new Set(creatives.map((c) => c.reviewer))),
      languages: Array.from(new Set(creatives.map((c) => c.language))),
      campaigns: Array.from(new Set(creatives.map((c) => c.campaignId).filter(Boolean) as string[])),
    }),
    [creatives],
  );

  const summary = useMemo(
    () => ({
      new: creatives.filter((c) => c.status === "request_received").length,
      progress: creatives.filter((c) => ["brief_ready", "in_progress"].includes(c.status)).length,
      review: creatives.filter((c) => c.status === "under_review").length,
      corrections: creatives.filter((c) => c.status === "correction_required").length,
      approved: creatives.filter((c) => c.status === "approved").length,
      overdue: creatives.filter(isOverdue).length,
    }),
    [creatives],
  );

  const filtered = useMemo(
    () =>
      creatives.filter((c) => {
        if (tab === "new" && c.status !== "request_received") return false;
        if (tab === "progress" && !["brief_ready", "in_progress"].includes(c.status)) return false;
        if (tab === "review" && c.status !== "under_review") return false;
        if (tab === "corrections" && c.status !== "correction_required") return false;
        if (tab === "approved" && c.status !== "approved") return false;
        if (tab === "delivered" && c.status !== "delivered") return false;
        if (tab === "expired" && !isExpired(c)) return false;

        if (store !== "all" && c.store !== store) return false;
        if (type !== "all" && c.type !== type) return false;
        if (platform !== "all" && c.platform !== platform) return false;
        if (status !== "all" && c.status !== status) return false;
        if (priority !== "all" && c.priority !== priority) return false;
        if (assignee !== "all" && c.assignedTo !== assignee) return false;
        if (reviewer !== "all" && c.reviewer !== reviewer) return false;
        if (language !== "all" && c.language !== language) return false;
        if (deadlineBy && c.deadline > deadlineBy) return false;
        if (expiryBy && (c.offerExpiry ?? "9999-12-31") > expiryBy) return false;
        if (campaign !== "all" && c.campaignId !== campaign) return false;

        const q = query.trim().toLowerCase();
        if (
          q &&
          ![c.id, c.title, c.storeId, c.store, c.requestId, c.campaignId ?? ""].some((v) =>
            v.toLowerCase().includes(q),
          )
        )
          return false;
        return true;
      }),
    [creatives, tab, store, type, platform, status, priority, assignee, reviewer, language, deadlineBy, expiryBy, campaign, query],
  );

  const resetFilters = () => {
    setStore("all");
    setType("all");
    setPlatform("all");
    setStatus("all");
    setPriority("all");
    setAssignee("all");
    setReviewer("all");
    setLanguage("all");
    setDeadlineBy("");
    setExpiryBy("");
    setCampaign("all");
  };

  const cards: { label: string; value: number; tone: keyof typeof toneClasses; tab: TabId }[] = [
    { label: "New Requests", value: summary.new, tone: "attention", tab: "new" },
    { label: "In Progress", value: summary.progress, tone: "active", tab: "progress" },
    { label: "Awaiting Approval", value: summary.review, tone: "attention", tab: "review" },
    { label: "Corrections Required", value: summary.corrections, tone: "overdue", tab: "corrections" },
    { label: "Approved", value: summary.approved, tone: "healthy", tab: "approved" },
    { label: "Overdue", value: summary.overdue, tone: "overdue", tab: "all" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Creatives &amp; Graphics</h1>
          <p className="text-sm text-muted-foreground">
            Create, review, approve and deliver marketing creatives for assigned franchise stores.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Creative
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => setTab(c.tab)} className="text-left">
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{c.value}</p>
                <Badge variant="outline" className={cn("mt-2 text-[11px]", toneClasses[c.tone])}>
                  Filter list
                </Badge>
              </CardContent>
            </Card>
          </button>
        ))}
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
                placeholder="Search Creative ID, title, Store ID, Request ID or Campaign ID"
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
            <Button variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
            <div className="flex rounded-md border">
              <Button
                size="sm"
                variant={view === "grid" ? "secondary" : "ghost"}
                className="rounded-r-none"
                onClick={() => setView("grid")}
              >
                <Grid2x2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={view === "table" ? "secondary" : "ghost"}
                className="rounded-l-none"
                onClick={() => setView("table")}
              >
                <Rows3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters ? (
            <div className="grid gap-3 border-t pt-3 md:grid-cols-3 xl:grid-cols-4">
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger><SelectValue placeholder="Store" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stores</SelectItem>
                  {opts.stores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Creative type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All creative types</SelectItem>
                  {CREATIVE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  {CREATIVE_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(creativeStatusMeta).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {["Urgent", "High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue placeholder="Assigned executive" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All executives</SelectItem>
                  {opts.assignees.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={reviewer} onValueChange={setReviewer}>
                <SelectTrigger><SelectValue placeholder="Reviewer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reviewers</SelectItem>
                  {opts.reviewers.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  {opts.languages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={campaign} onValueChange={setCampaign}>
                <SelectTrigger><SelectValue placeholder="Campaign" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All campaigns</SelectItem>
                  {opts.campaigns.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Deadline on or before</Label>
                <Input type="date" value={deadlineBy} onChange={(e) => setDeadlineBy(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Offer expiry on or before</Label>
                <Input type="date" value={expiryBy} onChange={(e) => setExpiryBy(e.target.value)} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const v = latestVersion(c);
            return (
              <Card key={c.id} className={cn(isExpired(c) && "border-red-500/40")}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex gap-3">
                    <Thumb c={c} className="h-20 w-20 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.id} · {c.storeId} · {c.requestId}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{c.store}</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className={toneClasses.draft}>{c.platform}</Badge>
                        <Badge variant="outline" className={toneClasses.draft}>{c.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className={cn(isOverdue(c) && "font-medium text-red-600")}>
                      <Clock className="mr-1 inline h-3 w-3" /> Due {c.deadline}
                    </span>
                    <span>Version {v ? v.version : "—"}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(c.id)}>
                    Open creative
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 ? (
            <p className="col-span-full rounded-lg border p-10 text-center text-sm text-muted-foreground">
              No creatives match the selected filters.
            </p>
          ) : null}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Creatives ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Creative</th>
                    <th className="px-4 py-2">Store</th>
                    <th className="px-4 py-2">Type / Platform</th>
                    <th className="px-4 py-2">Deadline</th>
                    <th className="px-4 py-2">Offer expiry</th>
                    <th className="px-4 py-2">Version</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.id} · {c.requestId}{c.campaignId ? ` · ${c.campaignId}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {c.store}
                        <p className="text-xs text-muted-foreground">{c.storeId}</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.type}
                        <p className="text-xs text-muted-foreground">{c.platform} · {c.dimensions}</p>
                      </td>
                      <td className={cn("px-4 py-3", isOverdue(c) && "text-red-600")}>{c.deadline}</td>
                      <td className="px-4 py-3">{c.offerExpiry ?? "—"}</td>
                      <td className="px-4 py-3">{latestVersion(c)?.version ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => setOpenId(c.id)}>Open</Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No creatives match the selected filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Design tool integrations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["Canva", "Figma", "Adobe Express", "Cloud storage"].map((t) => (
            <Badge key={t} variant="outline" className={toneClasses.draft}>
              {t} — placeholder, not connected
            </Badge>
          ))}
        </CardContent>
      </Card>

      <CreativeSheet creative={selected} onClose={() => setOpenId(null)} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Creative</DialogTitle>
            <DialogDescription>
              A permanent Creative ID is generated and linked to the selected Store ID and Marketing Request ID.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2"><Label>Creative title</Label><Input placeholder="Short descriptive title" /></div>
            <div className="space-y-1">
              <Label>Store</Label>
              <Select defaultValue="STR-1042">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(CREATIVES_FULL.map((c) => `${c.storeId}|${c.store}`))).map((v) => {
                    const [id, name] = v.split("|");
                    return <SelectItem key={id} value={id}>{name} ({id})</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Marketing Request ID</Label><Input placeholder="REQ-…" /></div>
            <div className="space-y-1"><Label>Campaign ID (optional)</Label><Input placeholder="CMP-…" /></div>
            <div className="space-y-1">
              <Label>Creative type</Label>
              <Select defaultValue="Offer Graphic">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CREATIVE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Platform</Label>
              <Select defaultValue="Meta">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CREATIVE_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Format</Label><Input placeholder="Static / carousel / reel cover" /></div>
            <div className="space-y-1"><Label>Dimensions</Label><Input defaultValue="1080 x 1080 px" /></div>
            <div className="space-y-1"><Label>Language</Label><Input defaultValue="Hindi + English" /></div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select defaultValue="Medium">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Urgent", "High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Deadline</Label><Input type="date" /></div>
            <div className="space-y-1"><Label>Offer start date</Label><Input type="date" /></div>
            <div className="space-y-1"><Label>Offer expiry date</Label><Input type="date" /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Objective</Label><Input placeholder="Business objective of this creative" /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Target audience</Label><Input placeholder="Who should see it" /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Offer or message</Label><Textarea placeholder="Main message and offer wording" /></div>
            <div className="space-y-1"><Label>Call to action</Label><Input defaultValue="Book pickup" /></div>
            <div className="space-y-1"><Label>Reviewer</Label><Input defaultValue="Marketing Head" readOnly /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Internal notes</Label><Textarea placeholder="Notes visible to the marketing team only" /></div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success("Creative created", {
                  description: "Status set to Request Received. Complete the brief and upload a draft before review.",
                });
              }}
            >
              Create creative
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreativeSheet({ creative, onClose }: { creative: CreativeRecord | null; onClose: () => void }) {
  if (!creative) return null;
  const c = creative;
  const alerts = creativeAlerts(c);
  const approved = approvedVersion(c);
  const expired = isExpired(c);
  const flowIndex = CREATIVE_FLOW.indexOf(c.status);

  const act = (title: string, description?: string) => () => toast.success(title, { description });

  const download = () => {
    if (expired) {
      toast.warning("Offer has expired — DO NOT USE", {
        description: "Update the offer dates and get the creative reapproved before downloading for any new use.",
      });
      return;
    }
    if (!approved) {
      toast.error("No approved version", { description: "Only the latest approved version can be downloaded." });
      return;
    }
    toast.success(`Downloading ${approved.version}`, { description: approved.file });
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="pr-8">{c.title}</SheetTitle>
          <SheetDescription>
            {c.id} · {c.storeId} · {c.store} · {c.requestId}
            {c.campaignId ? ` · ${c.campaignId}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          <div className="flex gap-3">
            <Thumb c={c} className="h-24 w-24 shrink-0" />
            <div className="flex flex-wrap items-start gap-2">
              <StatusBadge status={c.status} />
              <Badge variant="outline" className={toneClasses.draft}>{c.type}</Badge>
              <Badge variant="outline" className={toneClasses.draft}>{c.platform}</Badge>
              <Badge variant="outline" className={toneClasses.attention}>{c.priority} priority</Badge>
            </div>
          </div>

          {expired ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
              <p className="font-semibold uppercase tracking-wide">Do not use — offer expired</p>
              <p>
                Offer expired on {c.offerExpiry}. Sharing is disabled and this creative cannot be selected for a new
                campaign until the dates are updated and it is reapproved.
              </p>
            </div>
          ) : null}

          {alerts.length ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <AlertTriangle className="h-4 w-4" /> Notifications
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-amber-600">
                {alerts.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600">
              <CheckCircle2 className="mr-2 inline h-4 w-4" /> No alerts on this creative.
            </div>
          )}

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Status timeline</h3>
            <div className="flex flex-wrap gap-1">
              {CREATIVE_FLOW.map((s, i) => (
                <Badge
                  key={s}
                  variant="outline"
                  className={cn(
                    "text-[11px]",
                    flowIndex >= 0 && i <= flowIndex ? toneClasses.active : toneClasses.draft,
                    s === c.status && toneClasses[creativeStatusMeta[s].tone],
                  )}
                >
                  {creativeStatusMeta[s].label}
                </Badge>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Creative record</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Creative ID" value={c.id} />
              <Field label="Store ID" value={c.storeId} />
              <Field label="Marketing Request ID" value={c.requestId} />
              <Field label="Campaign ID" value={c.campaignId} />
              <Field label="Requested by" value={c.requestedBy} />
              <Field label="Assigned executive" value={c.assignedTo} />
              <Field label="Reviewer" value={c.reviewer} />
              <Field label="Creative type" value={c.type} />
              <Field label="Platform" value={c.platform} />
              <Field label="Format" value={c.format} />
              <Field label="Dimensions" value={c.dimensions} />
              <Field label="Language" value={c.language} />
              <Field label="Objective" value={c.objective} />
              <Field label="Target audience" value={c.audience} />
              <Field label="Offer or message" value={c.message} />
              <Field label="Call to action" value={c.cta} />
              <Field label="Offer start" value={c.offerStart} />
              <Field label="Offer expiry" value={c.offerExpiry} />
              <Field label="Priority" value={c.priority} />
              <Field label="Deadline" value={c.deadline} />
              <Field label="Current version" value={latestVersion(c)?.version ?? "No draft yet"} />
              <Field label="Internal notes" value={c.notes} />
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Creative brief</h3>
              <Badge variant="outline" className={c.brief.complete ? toneClasses.healthy : toneClasses.overdue}>
                {c.brief.complete ? "Brief complete" : "Brief incomplete"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              {BRIEF_FIELDS.map((f) => (
                <Field key={f.key} label={f.label} value={String(c.brief[f.key] ?? "")} />
              ))}
              <Field
                label="Reference files"
                value={c.brief.referenceFiles.length ? c.brief.referenceFiles.join(", ") : "None attached"}
              />
            </div>
            <Button size="sm" variant="outline" onClick={act("Brief opened for editing", `Brief for ${c.id} — changes are audited.`)}>
              {c.brief.complete ? "Edit brief" : "Create brief"}
            </Button>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Version history</h3>
            {c.versions.length === 0 ? (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                No draft uploaded yet. A creative cannot enter review without a completed brief and an uploaded draft.
              </p>
            ) : (
              c.versions.map((v) => (
                <div key={v.version} className="space-y-1 rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{v.version} · {v.file}</p>
                    <Badge
                      variant="outline"
                      className={
                        v.decision === "approved"
                          ? toneClasses.healthy
                          : v.decision === "correction"
                            ? toneClasses.overdue
                            : toneClasses.attention
                      }
                    >
                      {v.decision === "correction" ? "Correction requested" : v.decision === "approved" ? "Approved" : "Pending review"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Uploaded by {v.uploadedBy} · {v.uploadedAt}
                    {v.reviewer ? ` · Reviewer ${v.reviewer}` : ""}
                  </p>
                  {v.note ? <p>{v.note}</p> : null}
                  {v.comments.map((cm, i) => (
                    <p key={i} className="rounded-md bg-muted/50 p-2 text-xs">
                      <span className="font-medium">{cm.by}</span> · {cm.at}
                      <br />
                      {cm.text}
                    </p>
                  ))}
                </div>
              ))
            )}
            <p className="text-xs text-muted-foreground">
              Earlier versions are never overwritten — the Creative ID stays the same across V1, V2, V3.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Actions</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={act("Draft uploaded", `Saved as the next version of ${c.id}.`)}>
                <Upload className="mr-2 h-4 w-4" /> Upload draft / corrected version
              </Button>
              <Button
                variant="outline"
                onClick={
                  canSubmitForReview(c)
                    ? act("Submitted for review", `${c.reviewer} has been notified.`)
                    : () =>
                        toast.error("Cannot submit for review", {
                          description: "A completed brief and an uploaded draft are required first.",
                        })
                }
              >
                <Send className="mr-2 h-4 w-4" /> Submit for review
              </Button>
              <Button variant="outline" onClick={download}>
                <Download className="mr-2 h-4 w-4" /> Download approved file
              </Button>
              <Button
                variant="outline"
                onClick={
                  canShare(c)
                    ? act("Share link created", `Latest approved version (${approved?.version}) shared.`)
                    : () =>
                        toast.error("Sharing disabled", {
                          description: expired
                            ? "This creative has expired — update dates and get it reapproved."
                            : "Only an approved version can be shared.",
                        })
                }
              >
                <Share2 className="mr-2 h-4 w-4" /> Share approved creative
              </Button>
              <Button
                variant="outline"
                onClick={
                  canDeliver(c)
                    ? act("Marked delivered", "Recipient, channel and delivery time recorded in the audit trail.")
                    : () =>
                        toast.error("Cannot mark delivered", {
                          description: "Only an approved, unexpired creative can be marked delivered or used.",
                        })
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark delivered / used
              </Button>
              <Button
                variant="outline"
                onClick={
                  expired
                    ? () =>
                        toast.error("Cannot link an expired creative", {
                          description: "Update the offer dates and get it reapproved first.",
                        })
                    : act("Linked to campaign", "Creative ID attached to the campaign without creating a duplicate record.")
                }
              >
                <Link2 className="mr-2 h-4 w-4" /> Link to campaign
              </Button>
              <Button variant="outline" onClick={act("Brief duplicated", "Copied to another assigned store with a new Creative ID.")}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate brief for another store
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Review &amp; approval</h3>
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                Reviewer on record: {c.reviewer}. Only authorised reviewers can approve or request corrections;
                executives cannot approve their own work or delete approved records.
              </p>
              <Textarea placeholder="Comment against the latest version" />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={
                    c.status === "under_review"
                      ? act("Creative approved", `${latestVersion(c)?.version} marked approved by ${c.reviewer}.`)
                      : () =>
                          toast.error("Nothing to approve", {
                            description: "Only a creative that is under review can be approved.",
                          })
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={act("Correction requested", `Returned to ${c.assignedTo} with a deadline and notification.`)}
                >
                  Request correction
                </Button>
                <Button size="sm" variant="ghost" onClick={act("Comment added", "Recorded against the current version.")}>
                  Add comment
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Delivery record</h3>
            {c.delivery ? (
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
                <Field label="Recipient" value={c.delivery.recipient} />
                <Field label="Channel" value={c.delivery.channel} />
                <Field label="Delivered at" value={c.delivery.deliveredAt} />
              </div>
            ) : (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">Not delivered yet.</p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Performance data (for later scoring)</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Brief completion time" value={c.metrics.briefHours ? `${c.metrics.briefHours} hours` : "Pending"} />
              <Field label="Creative turnaround" value={c.metrics.turnaroundHours ? `${c.metrics.turnaroundHours} hours` : "In progress"} />
              <Field label="Delivered on time" value={c.metrics.onTime === null ? "Pending" : c.metrics.onTime ? "Yes" : "No"} />
              <Field
                label="Approved at first review"
                value={c.metrics.firstReviewApproved === null ? "Pending" : c.metrics.firstReviewApproved ? "Yes" : "No"}
              />
              <Field label="Correction rounds" value={c.metrics.correctionRounds} />
              <Field label="Overdue" value={isOverdue(c) ? "Yes" : "No"} />
              <Field label="Campaigns using this creative" value={c.metrics.campaignsUsing.join(", ") || "None yet"} />
              <Field label="Leads attributed" value={c.metrics.leads ?? "Not available"} />
              <Field label="Orders attributed" value={c.metrics.orders ?? "Not available"} />
              <Field label="Sales attributed" value={c.metrics.sales === null ? "Not available" : inr(c.metrics.sales)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Final employee KPI scores are calculated on the Performance page, not here.
            </p>
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Audit trail</h3>
            <ul className="space-y-2">
              {c.audit.map((a, i) => (
                <li key={i} className="rounded-lg border p-2 text-sm">
                  <span className="font-medium">{a.at}</span> · {a.by}
                  <p className="text-xs text-muted-foreground">{a.action}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
