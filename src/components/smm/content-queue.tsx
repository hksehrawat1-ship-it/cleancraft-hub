import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Columns3,
  Ban,
  FileWarning,
  LayoutGrid,
  List,
  Plus,
  Search,
  Send,
  UserPlus,
  Video,
} from "lucide-react";
import {
  SHARED_CONTENT,
  EDITOR_WORKLOAD,
  CAMPAIGNS,
  BRANDS,
  CONTENT_TYPES,
  PLATFORMS,
  FILE_SLOTS,
  getExtras,
  type SharedContent,
  type ContentStage,
  type ContentType,
  type SmPlatform,
} from "./shared-records";

/* ------------------------------------------------------------------ */
/* tone helpers                                                        */
/* ------------------------------------------------------------------ */

type Tone = "red" | "amber" | "blue" | "green" | "grey";

function toneClasses(tone: Tone) {
  switch (tone) {
    case "red":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "amber":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "blue":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "green":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function stageTone(stage: ContentStage): Tone {
  if (stage === "Correction Required") return "red";
  if (stage === "Submitted for Review") return "amber";
  if (stage === "Approved" || stage === "Published") return "green";
  if (stage === "Scheduled" || stage === "Editing" || stage === "Assigned to Editor") return "blue";
  return "grey";
}

function Pill({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClasses(tone)}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* queue-local record extensions                                       */
/* ------------------------------------------------------------------ */

type QueueItem = SharedContent & {
  cancelled?: boolean;
  managerNotes?: { at: string; text: string }[];
  history: { at: string; event: string }[];
};

const seed: QueueItem[] = SHARED_CONTENT.map((c) => ({
  ...c,
  managerNotes: [],
  history: getExtras(c.contentId).timeline.map((t) => ({ at: t.at, event: `${t.event} — ${t.by}` })),
}));

function displayStatus(c: QueueItem): string {
  if (c.cancelled) return "Cancelled";
  if (c.stage === "Raw Received") return c.editor === "Unassigned" ? "Unassigned" : "Raw Content Received";
  if (c.stage === "Assigned to Editor") return "Assigned";
  if (c.stage === "Submitted for Review") return c.returnCount > 0 ? "Resubmitted" : "Submitted for Review";
  return c.stage;
}

function nextAction(c: QueueItem): string {
  if (c.cancelled) return "No action — cancelled";
  switch (c.stage) {
    case "Raw Received":
      return c.editor === "Unassigned" ? "Assign a Video Editor" : "Confirm raw files";
    case "Assigned to Editor":
      return "Editor to start editing";
    case "Editing":
      return "Await submission";
    case "Submitted for Review":
      return "Review and approve or return";
    case "Correction Required":
      return "Editor to resubmit a new version";
    case "Approved":
      return c.publishTime ? "Confirm publishing slot" : "Schedule content";
    case "Scheduled":
      return c.publishStatus === "Failed" ? "Fix publishing failure" : "Publish at slot time";
    default:
      return "Track performance";
  }
}

function attentionFlags(c: QueueItem): { text: string; tone: Tone }[] {
  const f: { text: string; tone: Tone }[] = [];
  if (c.cancelled) return [{ text: "Cancelled — kept in history", tone: "grey" }];
  const extras = getExtras(c.contentId);
  const missingFiles = FILE_SLOTS.filter((s) => !extras.files[s]);
  if (c.editor === "Unassigned") f.push({ text: "No editor assigned", tone: "red" });
  if (c.stage !== "Published" && missingFiles.length >= 5) f.push({ text: "Raw files missing", tone: "amber" });
  if (!c.hasCaption && c.stage !== "Raw Received") f.push({ text: "Brief incomplete — caption pending", tone: "amber" });
  if (c.overdue) f.push({ text: "Content overdue", tone: "red" });
  if (!c.overdue && c.dueAt.startsWith("Today")) f.push({ text: "Deadline within hours", tone: "amber" });
  if (c.stage === "Submitted for Review") f.push({ text: `Awaiting review ${c.reviewWaitHours ?? 0}h`, tone: (c.reviewWaitHours ?? 0) > 12 ? "red" : "amber" });
  if (c.returnCount >= 2) f.push({ text: `Returned ${c.returnCount}×`, tone: "red" });
  if (c.stage === "Approved" && !c.publishTime) f.push({ text: "Approved but not scheduled", tone: "amber" });
  if (c.publishTime && (!c.hasCaption || !c.hasThumbnail)) f.push({ text: "Scheduled without caption/thumbnail", tone: "amber" });
  if (c.publishStatus === "Failed" || c.publishStatus === "Reschedule Required") f.push({ text: "Publishing date missed", tone: "red" });
  return f;
}

const TABS = [
  "All",
  "Ideas & Raw Content",
  "Unassigned",
  "Editing",
  "Waiting for Review",
  "Corrections",
  "Approved",
  "Scheduled",
  "Published",
] as const;
type TabKey = (typeof TABS)[number];

function matchesTab(c: QueueItem, tab: TabKey) {
  switch (tab) {
    case "All":
      return true;
    case "Ideas & Raw Content":
      return c.stage === "Raw Received";
    case "Unassigned":
      return c.editor === "Unassigned";
    case "Editing":
      return c.stage === "Editing" || c.stage === "Assigned to Editor";
    case "Waiting for Review":
      return c.stage === "Submitted for Review";
    case "Corrections":
      return c.stage === "Correction Required";
    case "Approved":
      return c.stage === "Approved";
    case "Scheduled":
      return c.stage === "Scheduled";
    case "Published":
      return c.stage === "Published";
  }
}

const BOARD_COLUMNS: { title: string; tab: TabKey }[] = [
  { title: "Ideas & Raw", tab: "Ideas & Raw Content" },
  { title: "Editing", tab: "Editing" },
  { title: "Waiting for Review", tab: "Waiting for Review" },
  { title: "Corrections", tab: "Corrections" },
  { title: "Approved", tab: "Approved" },
  { title: "Scheduled", tab: "Scheduled" },
  { title: "Published", tab: "Published" },
];

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export function SmmContentQueuePage() {
  const [items, setItems] = useState<QueueItem[]>(seed);
  const [tab, setTab] = useState<TabKey>("All");
  const [view, setView] = useState<"cards" | "table" | "board">("cards");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<QueueItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<QueueItem | null>(null);
  const [reasonFor, setReasonFor] = useState<{ item: QueueItem; kind: "cancel" | "deadline" } | null>(null);

  const [f, setF] = useState({
    brand: "all",
    type: "all",
    platform: "all",
    editor: "all",
    priority: "all",
    deadline: "all",
    status: "all",
    campaign: "all",
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const patch = (id: string, fn: (c: QueueItem) => QueueItem, event: string) =>
    setItems((list) =>
      list.map((c) => {
        if (c.contentId !== id) return c;
        const next = fn(c);
        const updated = { ...next, history: [{ at: "Just now", event }, ...c.history] };
        setOpen((cur) => (cur && cur.contentId === id ? updated : cur));
        return updated;
      }),
    );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((c) => {
      if (!matchesTab(c, tab)) return false;
      const extras = getExtras(c.contentId);
      if (term && !(c.title.toLowerCase().includes(term) || c.contentId.toLowerCase().includes(term))) return false;
      if (f.brand !== "all" && c.brand !== f.brand) return false;
      if (f.type !== "all" && c.type !== f.type) return false;
      if (f.platform !== "all" && c.platform !== f.platform) return false;
      if (f.editor !== "all" && c.editor !== f.editor) return false;
      if (f.priority !== "all" && c.priority !== f.priority) return false;
      if (f.status !== "all" && displayStatus(c) !== f.status) return false;
      if (f.campaign !== "all" && extras.campaign !== f.campaign) return false;
      if (f.deadline === "today" && !c.dueAt.startsWith("Today")) return false;
      if (f.deadline === "overdue" && !c.overdue) return false;
      if (f.deadline === "later" && (c.dueAt.startsWith("Today") || c.overdue)) return false;
      return true;
    });
  }, [items, tab, q, f]);

  const header = useMemo(() => {
    const active = items.filter((c) => !c.cancelled && c.stage !== "Published");
    return [
      { l: "Total Active Content", v: active.length, tone: "blue" as Tone },
      { l: "Unassigned", v: items.filter((c) => c.editor === "Unassigned" && !c.cancelled).length, tone: "red" as Tone },
      { l: "Editing", v: items.filter((c) => ["Editing", "Assigned to Editor"].includes(c.stage)).length, tone: "blue" as Tone },
      { l: "Waiting for Review", v: items.filter((c) => c.stage === "Submitted for Review").length, tone: "amber" as Tone },
      { l: "Corrections", v: items.filter((c) => c.stage === "Correction Required").length, tone: "red" as Tone },
      { l: "Approved", v: items.filter((c) => c.stage === "Approved").length, tone: "green" as Tone },
    ];
  }, [items]);

  const assign = (item: QueueItem, editor: string, reason: string) => {
    const reassigning = item.editor !== "Unassigned" && item.editor !== editor;
    if (reassigning && !reason.trim()) {
      toast.error("A reason is required for reassignment.");
      return;
    }
    patch(
      item.contentId,
      (c) => ({
        ...c,
        editor,
        stage: c.stage === "Raw Received" ? "Assigned to Editor" : c.stage,
        assignedAt: "Just now",
      }),
      reassigning
        ? `Reassigned from ${item.editor} to ${editor} — reason: ${reason.trim()}`
        : `Assigned to ${editor}`,
    );
    toast.success(
      reassigning
        ? `${item.contentId} reassigned to ${editor}. Previous editor kept in history.`
        : `${item.contentId} assigned to ${editor}.`,
    );
    setAssignFor(null);
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Queue</h1>
          <p className="text-sm text-muted-foreground">
            Every content item from raw material to publication — one permanent Content ID each.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Create Content
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {header.map((h) => (
          <Card key={h.l}>
            <CardContent className="p-3">
              <div className="text-[11px] text-muted-foreground">{h.l}</div>
              <div
                className={`mt-0.5 text-2xl font-bold tabular-nums ${
                  h.v === 0
                    ? "text-muted-foreground"
                    : h.tone === "red"
                    ? "text-destructive"
                    : h.tone === "amber"
                    ? "text-amber-600"
                    : h.tone === "green"
                    ? "text-emerald-600"
                    : "text-blue-600"
                }`}
              >
                {h.v}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* tabs + views */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="flex h-auto flex-wrap justify-start">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t} className="text-xs">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="pl-8" />
          </div>
          {[
            { k: "cards" as const, icon: LayoutGrid, label: "Content Cards" },
            { k: "table" as const, icon: List, label: "Table View" },
            { k: "board" as const, icon: Columns3, label: "Workflow Board" },
          ].map((v) => (
            <Button
              key={v.k}
              size="icon"
              variant={view === v.k ? "default" : "outline"}
              onClick={() => setView(v.k)}
              title={v.label}
            >
              <v.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* filters */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-2 p-3 md:grid-cols-4 lg:grid-cols-8">
          <FilterSelect label="Brand" value={f.brand} onChange={(v) => set("brand", v)} options={BRANDS} />
          <FilterSelect label="Type" value={f.type} onChange={(v) => set("type", v)} options={CONTENT_TYPES} />
          <FilterSelect label="Platform" value={f.platform} onChange={(v) => set("platform", v)} options={PLATFORMS} />
          <FilterSelect
            label="Editor"
            value={f.editor}
            onChange={(v) => set("editor", v)}
            options={[...EDITOR_WORKLOAD.map((e) => e.name), "Unassigned"]}
          />
          <FilterSelect label="Priority" value={f.priority} onChange={(v) => set("priority", v)} options={["High", "Medium", "Low"]} />
          <FilterSelect
            label="Deadline"
            value={f.deadline}
            onChange={(v) => set("deadline", v)}
            options={[
              { value: "today", label: "Due today" },
              { value: "overdue", label: "Overdue" },
              { value: "later", label: "Later" },
            ]}
          />
          <FilterSelect
            label="Status"
            value={f.status}
            onChange={(v) => set("status", v)}
            options={[...new Set(items.map(displayStatus))]}
          />
          <FilterSelect label="Campaign" value={f.campaign} onChange={(v) => set("campaign", v)} options={CAMPAIGNS} />
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {items.length} content records
      </div>

      {/* views */}
      {view === "cards" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ContentCard key={c.contentId} item={c} onOpen={() => setOpen(c)} onAssign={() => setAssignFor(c)} />
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No content matches these filters.</p>}
        </div>
      )}

      {view === "table" && (
        <Card>
          <CardContent className="overflow-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type / Platform</TableHead>
                  <TableHead>Editor</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.contentId}>
                    <TableCell className="font-mono text-xs">{c.contentId}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm">{c.title}</TableCell>
                    <TableCell className="text-xs">
                      {c.type} · {c.platform}
                    </TableCell>
                    <TableCell className="text-xs">{c.editor}</TableCell>
                    <TableCell>
                      <Pill tone={c.priority === "High" ? "red" : c.priority === "Medium" ? "amber" : "grey"}>{c.priority}</Pill>
                    </TableCell>
                    <TableCell className={`text-xs ${c.overdue ? "text-destructive" : ""}`}>{c.dueAt}</TableCell>
                    <TableCell className="text-xs">{c.currentVersion}</TableCell>
                    <TableCell>
                      <Pill tone={c.cancelled ? "grey" : stageTone(c.stage)}>{displayStatus(c)}</Pill>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setOpen(c)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {view === "board" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {BOARD_COLUMNS.map((col) => {
            const cards = filtered.filter((c) => matchesTab(c, col.tab));
            return (
              <Card key={col.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    {col.title}
                    <Badge variant="outline">{cards.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cards.map((c) => (
                    <button
                      key={c.contentId}
                      onClick={() => setOpen(c)}
                      className="w-full rounded-md border p-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="truncate text-xs font-medium">{c.title}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{c.contentId}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Pill tone={c.priority === "High" ? "red" : "grey"}>{c.priority}</Pill>
                        <Pill tone={c.overdue ? "red" : "grey"}>{c.dueAt}</Pill>
                      </div>
                    </button>
                  ))}
                  {cards.length === 0 && <p className="text-[11px] text-muted-foreground">Empty</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* drawer + dialogs */}
      <ContentDrawer
        item={open}
        onClose={() => setOpen(null)}
        onPatch={patch}
        onAssign={(c) => setAssignFor(c)}
        onReason={(item, kind) => setReasonFor({ item, kind })}
      />
      <AssignDialog item={assignFor} onClose={() => setAssignFor(null)} onAssign={assign} />
      <ReasonDialog
        payload={reasonFor}
        onClose={() => setReasonFor(null)}
        onConfirm={(item, kind, reason, value) => {
          if (kind === "cancel") {
            patch(item.contentId, (c) => ({ ...c, cancelled: true }), `Cancelled — reason: ${reason}`);
            toast.success(`${item.contentId} cancelled and retained in history.`);
          } else {
            patch(item.contentId, (c) => ({ ...c, dueAt: value, overdue: false }), `Deadline changed to ${value} — reason: ${reason}`);
            toast.success(`${item.contentId} deadline updated.`);
          }
          setReasonFor(null);
        }}
      />
      <CreateContentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        nextId={`CC-CN-${1052 + items.length - SHARED_CONTENT.length + 1}`}
        onCreate={(item) => {
          setItems((l) => [item, ...l]);
          setCreateOpen(false);
          toast.success(`${item.contentId} created — Content ID is permanent.`);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            return (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function ContentCard({
  item,
  onOpen,
  onAssign,
}: {
  item: QueueItem;
  onOpen: () => void;
  onAssign: () => void;
}) {
  const flags = attentionFlags(item);
  return (
    <Card className={item.overdue && !item.cancelled ? "border-destructive/40" : undefined}>
      <CardContent className="space-y-2 p-3">
        <div className="flex gap-3">
          <div className={`h-16 w-24 shrink-0 rounded-md border bg-gradient-to-br ${item.thumbTone} flex items-center justify-center`}>
            <Video className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{item.title}</div>
            <div className="font-mono text-[10px] text-muted-foreground">{item.contentId}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{item.brand}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              <Pill tone="grey">{item.type}</Pill>
              <Pill tone="grey">{item.platform}</Pill>
              <Pill tone={item.priority === "High" ? "red" : item.priority === "Medium" ? "amber" : "grey"}>
                {item.priority}
              </Pill>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
          <span className="truncate">Editor: {item.editor}</span>
          <span className={item.overdue ? "text-destructive" : ""}>Due: {item.dueAt}</span>
          <span>Version: {item.currentVersion}</span>
          <span>Campaign: {getExtras(item.contentId).campaign}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Pill tone={item.cancelled ? "grey" : stageTone(item.stage)}>{displayStatus(item)}</Pill>
          <span className="text-[11px] text-muted-foreground">Next: {nextAction(item)}</span>
        </div>

        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {flags.slice(0, 3).map((fl) => (
              <span
                key={fl.text}
                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${toneClasses(fl.tone)}`}
              >
                <AlertTriangle className="h-2.5 w-2.5" />
                {fl.text}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1" onClick={onOpen}>
            View Content
          </Button>
          {item.editor === "Unassigned" && !item.cancelled && (
            <Button size="sm" variant="outline" onClick={onAssign}>
              <UserPlus className="mr-1 h-3 w-3" /> Assign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* detail drawer                                                       */
/* ------------------------------------------------------------------ */

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b py-1 text-xs last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}

function ContentDrawer({
  item,
  onClose,
  onPatch,
  onAssign,
  onReason,
}: {
  item: QueueItem | null;
  onClose: () => void;
  onPatch: (id: string, fn: (c: QueueItem) => QueueItem, event: string) => void;
  onAssign: (c: QueueItem) => void;
  onReason: (c: QueueItem, kind: "cancel" | "deadline") => void;
}) {
  const [note, setNote] = useState("");
  const [brief, setBrief] = useState("");

  if (!item) return null;
  const x = getExtras(item.contentId);
  const editingStarted = !["Raw Received", "Assigned to Editor"].includes(item.stage);
  const locked = item.cancelled || item.stage === "Published";

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full overflow-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="pr-6">{item.title}</SheetTitle>
          <SheetDescription>
            <span className="font-mono">{item.contentId}</span> · {item.brand} · {item.type} · {item.platform}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-8">
          <div className={`h-32 rounded-md border bg-gradient-to-br ${item.thumbTone} flex items-center justify-center`}>
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Pill tone={item.cancelled ? "grey" : stageTone(item.stage)}>{displayStatus(item)}</Pill>
            <Pill tone={item.overdue ? "red" : "grey"}>Due {item.dueAt}</Pill>
            <Pill tone="grey">Version {item.currentVersion}</Pill>
            <Pill tone={item.priority === "High" ? "red" : "grey"}>{item.priority}</Pill>
            {item.approvedVersion && <Pill tone="green">Approved {item.approvedVersion} (locked)</Pill>}
          </div>

          <Section title="Content brief">
            <Row k="Brief version" v={`v${x.briefVersion}`} />
            <Row k="Objective" v={x.objective} />
            <Row k="Target audience" v={x.audience} />
            <Row k="Key message" v={x.keyMessage} />
            <Row k="Required duration" v={x.duration} />
            <Row k="Orientation" v={x.orientation} />
            <Row k="Call-to-action" v={x.cta} />
            <Row k="Caption" v={x.captionNeeds} />
            <Row k="Subtitles" v={x.subtitleNeeds} />
            <Row k="Logo & branding" v={x.brandingNeeds} />
            <Row k="Music" v={x.musicDirection} />
            <Row k="Additional instructions" v={x.extraNotes} />
          </Section>

          <Section title="Raw files & references">
            <div className="grid grid-cols-2 gap-1.5">
              {FILE_SLOTS.map((s) => (
                <div
                  key={s}
                  className={`flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] ${
                    x.files[s] ? toneClasses("green") : toneClasses("grey")
                  }`}
                >
                  {x.files[s] ? <CheckCircle2 className="h-3 w-3" /> : <FileWarning className="h-3 w-3" />}
                  {s}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Assignment & schedule">
            <Row k="Assigned editor" v={item.editor} />
            {x.previousEditors.length > 0 && <Row k="Previous editors" v={x.previousEditors.join(", ")} />}
            <Row k="Assigned at" v={item.assignedAt ?? "—"} />
            <Row k="Publishing schedule" v={item.publishTime ?? "Not scheduled"} />
            <Row k="Publishing status" v={item.publishStatus} />
            <Row k="Published link" v={x.publishedLink ?? (item.publishStatus === "Published" ? "instagram.com/cleancraft.india" : "—")} />
            <Row k="Related campaign" v={x.campaign} />
            <Row k="Leads generated" v={x.leadsGenerated} />
          </Section>

          <Section title="Version history">
            {item.versions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No submissions yet.</p>
            ) : (
              item.versions.map((v) => (
                <div key={v.version} className="flex items-center justify-between border-b py-1 text-xs last:border-0">
                  <span>
                    {v.version} · {v.submittedAt} · {v.editor}
                  </span>
                  <Pill tone={v.outcome === "Approved" ? "green" : v.outcome === "Pending Review" ? "amber" : "red"}>
                    {v.outcome}
                  </Pill>
                </div>
              ))
            )}
          </Section>

          <Section title="Reviewer comments & corrections">
            {x.reviewerComments.map((c, i) => (
              <div key={i} className="border-b py-1 text-xs last:border-0">
                <div className="text-muted-foreground">
                  {c.at} · {c.by}
                </div>
                {c.text}
              </div>
            ))}
            {x.corrections.map((c, i) => (
              <div key={`c${i}`} className="mt-1 rounded border border-destructive/30 bg-destructive/5 p-2 text-xs">
                <div className="font-medium text-destructive">
                  {c.version} correction · {c.at}
                </div>
                <ul className="ml-4 list-disc">
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
            {x.reviewerComments.length === 0 && x.corrections.length === 0 && (
              <p className="text-xs text-muted-foreground">No comments or corrections recorded.</p>
            )}
          </Section>

          <Section title="Activity timeline">
            {item.history.map((h, i) => (
              <div key={i} className="border-b py-1 text-xs last:border-0">
                <span className="text-muted-foreground">{h.at}</span> — {h.event}
              </div>
            ))}
          </Section>

          {(item.managerNotes?.length ?? 0) > 0 && (
            <Section title="Manager notes">
              {item.managerNotes!.map((n, i) => (
                <div key={i} className="border-b py-1 text-xs last:border-0">
                  <span className="text-muted-foreground">{n.at}</span> — {n.text}
                </div>
              ))}
            </Section>
          )}

          <Separator />

          <Section title="Manager actions">
            {locked && (
              <p className="mb-2 text-xs text-muted-foreground">
                {item.cancelled
                  ? "Cancelled content is read-only and retained in history."
                  : "Published content cannot be silently replaced — corrections must create a new version."}
              </p>
            )}

            {!editingStarted && !locked && (
              <div className="space-y-1.5">
                <Label className="text-xs">Edit brief (before editing starts)</Label>
                <Textarea rows={2} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Updated brief detail…" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!brief.trim()) return toast.error("Enter the brief change.");
                    onPatch(item.contentId, (c) => c, `Brief updated to v${x.briefVersion + 1}: ${brief.trim()}`);
                    toast.success("Brief saved as a new brief version.");
                    setBrief("");
                  }}
                >
                  Save brief version
                </Button>
              </div>
            )}

            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" disabled={locked} onClick={() => onAssign(item)}>
                <UserPlus className="mr-1 h-3 w-3" /> {item.editor === "Unassigned" ? "Assign editor" : "Reassign editor"}
              </Button>
              <Select
                disabled={locked}
                value={item.priority}
                onValueChange={(v) =>
                  onPatch(item.contentId, (c) => ({ ...c, priority: v as QueueItem["priority"] }), `Priority changed to ${v}`)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {["High", "Medium", "Low"].map((p) => (
                    <SelectItem key={p} value={p}>
                      Priority: {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" disabled={locked} onClick={() => onReason(item, "deadline")}>
                <CalendarClock className="mr-1 h-3 w-3" /> Change deadline
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={locked}
                onClick={() => toast.success("File slot opened — upload placeholder only.")}
              >
                Add files
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={locked || item.stage !== "Editing"}
                onClick={() =>
                  onPatch(
                    item.contentId,
                    (c) => ({ ...c, stage: "Submitted for Review", submittedAt: "Just now", reviewWaitHours: 0 }),
                    "Sent for review",
                  )
                }
              >
                <Send className="mr-1 h-3 w-3" /> Send for review
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={locked || item.stage !== "Submitted for Review"}
                onClick={() =>
                  onPatch(
                    item.contentId,
                    (c) => ({ ...c, stage: "Correction Required", returnCount: c.returnCount + 1, reviewWaitHours: undefined }),
                    "Correction requested — new version required",
                  )
                }
              >
                Request correction
              </Button>
              <Button
                size="sm"
                disabled={locked || item.stage !== "Submitted for Review"}
                onClick={() =>
                  onPatch(
                    item.contentId,
                    (c) => ({ ...c, stage: "Approved", approvedVersion: c.currentVersion, reviewWaitHours: undefined }),
                    "Approved — reviewed version locked",
                  )
                }
              >
                <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
              </Button>
              <Button
                size="sm"
                disabled={locked || item.stage !== "Approved"}
                onClick={() =>
                  onPatch(
                    item.contentId,
                    (c) => ({ ...c, stage: "Scheduled", publishStatus: "Scheduled", publishTime: c.publishTime ?? "Tomorrow, 11:00" }),
                    "Scheduled for publishing",
                  )
                }
              >
                <CalendarClock className="mr-1 h-3 w-3" /> Schedule
              </Button>
              <Button size="sm" variant="destructive" disabled={locked} onClick={() => onReason(item, "cancel")}>
                <Ban className="mr-1 h-3 w-3" /> Cancel content
              </Button>
            </div>

            <div className="mt-3 space-y-1.5">
              <Label className="text-xs">Manager note</Label>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note to this record…" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!note.trim()) return toast.error("Write a note first.");
                  onPatch(
                    item.contentId,
                    (c) => ({ ...c, managerNotes: [{ at: "Just now", text: note.trim() }, ...(c.managerNotes ?? [])] }),
                    `Manager note added`,
                  );
                  setNote("");
                  toast.success("Note added to the content record.");
                }}
              >
                Add manager note
              </Button>
            </div>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-semibold">{title}</div>
      <div className="rounded-md border p-2.5">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* assign dialog                                                       */
/* ------------------------------------------------------------------ */

function AssignDialog({
  item,
  onClose,
  onAssign,
}: {
  item: QueueItem | null;
  onClose: () => void;
  onAssign: (item: QueueItem, editor: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  if (!item) return null;
  const reassigning = item.editor !== "Unassigned";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Video Editor</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{item.contentId}</span> · {item.title} · workload shown for your decision, no
            automatic assignment.
          </DialogDescription>
        </DialogHeader>

        {reassigning && (
          <div className="space-y-1.5">
            <Label className="text-xs">Reason for reassignment (required)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this being reassigned?" />
          </div>
        )}

        <div className="space-y-2">
          {EDITOR_WORKLOAD.map((e) => (
            <div key={e.name} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
              <div className="min-w-0">
                <div className="text-sm font-medium">{e.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {e.activeCount} active · {e.dueToday} due today · {e.overdue} overdue
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill
                  tone={
                    e.availability === "Available"
                      ? "green"
                      : e.availability === "Busy"
                      ? "amber"
                      : e.availability === "Overloaded"
                      ? "red"
                      : "grey"
                  }
                >
                  {e.availability}
                </Pill>
                <Button
                  size="sm"
                  disabled={e.availability === "On Leave" || e.name === item.editor}
                  onClick={() => {
                    onAssign(item, e.name, reason);
                    setReason("");
                  }}
                >
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* reason dialog                                                       */
/* ------------------------------------------------------------------ */

function ReasonDialog({
  payload,
  onClose,
  onConfirm,
}: {
  payload: { item: QueueItem; kind: "cancel" | "deadline" } | null;
  onClose: () => void;
  onConfirm: (item: QueueItem, kind: "cancel" | "deadline", reason: string, value: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [value, setValue] = useState("");
  if (!payload) return null;
  const isCancel = payload.kind === "cancel";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCancel ? "Cancel content" : "Change deadline"}</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{payload.item.contentId}</span> — a reason is mandatory and stored in the record
            history.
          </DialogDescription>
        </DialogHeader>
        {!isCancel && (
          <div className="space-y-1.5">
            <Label className="text-xs">New deadline</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Tomorrow, 16:00" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs">Reason</Label>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain the change…" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={isCancel ? "destructive" : "default"}
            onClick={() => {
              if (!reason.trim()) return toast.error("A reason is required.");
              if (!isCancel && !value.trim()) return toast.error("Enter the new deadline.");
              onConfirm(payload.item, payload.kind, reason.trim(), value.trim());
              setReason("");
              setValue("");
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* create content wizard                                               */
/* ------------------------------------------------------------------ */

const STEPS = ["Basic Information", "Content Brief", "Files and References", "Assign Editor", "Review and Create"];

function CreateContentDialog({
  open,
  onClose,
  nextId,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  nextId: string;
  onCreate: (item: QueueItem) => void;
}) {
  const [step, setStep] = useState(0);
  const [basic, setBasic] = useState({
    title: "",
    brand: BRANDS[0],
    type: "Reel" as ContentType,
    platform: "Instagram" as SmPlatform,
    campaign: CAMPAIGNS[0],
    priority: "Medium" as QueueItem["priority"],
    publishDate: "",
    editDeadline: "",
  });
  const [briefText, setBriefText] = useState({
    objective: "",
    audience: "",
    keyMessage: "",
    duration: "",
    orientation: "Vertical 9:16",
    cta: "",
    caption: "",
    subtitles: "",
    branding: "",
    music: "",
    notes: "",
  });
  const [files, setFiles] = useState<string[]>([]);
  const [editor, setEditor] = useState("Unassigned");

  if (!open) return null;

  const reset = () => {
    setStep(0);
    setBasic({ ...basic, title: "", publishDate: "", editDeadline: "" });
    setFiles([]);
    setEditor("Unassigned");
  };

  const canNext = step !== 0 || (basic.title.trim() !== "" && basic.editDeadline.trim() !== "");

  const create = () => {
    onCreate({
      contentId: nextId,
      title: basic.title.trim(),
      brand: basic.brand,
      type: basic.type,
      platform: basic.platform,
      stage: editor === "Unassigned" ? "Raw Received" : "Assigned to Editor",
      editor,
      assignedAt: editor === "Unassigned" ? undefined : "Just now",
      dueAt: basic.editDeadline,
      overdue: false,
      versions: [],
      currentVersion: "—",
      returnCount: 0,
      hasCaption: briefText.caption.trim() !== "",
      hasThumbnail: files.includes("Thumbnail reference"),
      hasCta: briefText.cta.trim() !== "",
      publishStatus: "Not Scheduled",
      thumbTone: "from-slate-500/25 to-slate-500/5",
      priority: basic.priority,
      managerNotes: [],
      history: [{ at: "Just now", event: `Content created (${nextId})` }],
    });
    reset();
  };

  return (
    <Dialog open onOpenChange={() => { reset(); onClose(); }}>
      <DialogContent className="max-h-[92vh] overflow-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Content — {nextId}</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                i === step ? toneClasses("blue") : i < step ? toneClasses("green") : toneClasses("grey")
              }`}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>

        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Content title">
              <Input value={basic.title} onChange={(e) => setBasic({ ...basic, title: e.target.value })} placeholder="e.g. Owner story — Nagpur" />
            </Field>
            <Field label="Brand / business unit">
              <Picker value={basic.brand} onChange={(v) => setBasic({ ...basic, brand: v })} options={BRANDS} />
            </Field>
            <Field label="Content type">
              <Picker value={basic.type} onChange={(v) => setBasic({ ...basic, type: v as ContentType })} options={CONTENT_TYPES} />
            </Field>
            <Field label="Target platform">
              <Picker value={basic.platform} onChange={(v) => setBasic({ ...basic, platform: v as SmPlatform })} options={PLATFORMS} />
            </Field>
            <Field label="Campaign">
              <Picker value={basic.campaign} onChange={(v) => setBasic({ ...basic, campaign: v })} options={CAMPAIGNS} />
            </Field>
            <Field label="Priority">
              <Picker value={basic.priority} onChange={(v) => setBasic({ ...basic, priority: v as QueueItem["priority"] })} options={["High", "Medium", "Low"]} />
            </Field>
            <Field label="Required publish date">
              <Input value={basic.publishDate} onChange={(e) => setBasic({ ...basic, publishDate: e.target.value })} placeholder="e.g. 8 Aug, 11:00" />
            </Field>
            <Field label="Editing deadline">
              <Input value={basic.editDeadline} onChange={(e) => setBasic({ ...basic, editDeadline: e.target.value })} placeholder="e.g. 7 Aug, 18:00" />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["objective", "Objective"],
                ["audience", "Target audience"],
                ["keyMessage", "Key message"],
                ["duration", "Required duration"],
                ["cta", "Call-to-action"],
                ["caption", "Caption requirements"],
                ["subtitles", "Subtitle requirements"],
                ["branding", "Logo & branding requirements"],
                ["music", "Music direction"],
              ] as const
            ).map(([k, label]) => (
              <Field key={k} label={label}>
                <Input
                  value={briefText[k]}
                  onChange={(e) => setBriefText({ ...briefText, [k]: e.target.value })}
                  placeholder={label}
                />
              </Field>
            ))}
            <Field label="Video orientation">
              <Picker
                value={briefText.orientation}
                onChange={(v) => setBriefText({ ...briefText, orientation: v })}
                options={["Vertical 9:16", "Square 1:1", "Horizontal 16:9"]}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Additional instructions">
                <Textarea rows={2} value={briefText.notes} onChange={(e) => setBriefText({ ...briefText, notes: e.target.value })} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {FILE_SLOTS.map((s) => (
              <label key={s} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <Checkbox
                  checked={files.includes(s)}
                  onCheckedChange={() =>
                    setFiles((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s]))
                  }
                />
                <span>{s}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">placeholder</span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Workload is shown to support your decision. Assignment is never automatic.
            </p>
            {EDITOR_WORKLOAD.map((e) => (
              <div
                key={e.name}
                className={`flex items-center justify-between gap-3 rounded-md border p-2.5 ${
                  editor === e.name ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {e.activeCount} active · {e.dueToday} due today · {e.overdue} overdue
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill
                    tone={
                      e.availability === "Available"
                        ? "green"
                        : e.availability === "Busy"
                        ? "amber"
                        : e.availability === "Overloaded"
                        ? "red"
                        : "grey"
                    }
                  >
                    {e.availability}
                  </Pill>
                  <Button
                    size="sm"
                    variant={editor === e.name ? "default" : "outline"}
                    disabled={e.availability === "On Leave"}
                    onClick={() => setEditor(e.name)}
                  >
                    {editor === e.name ? "Selected" : "Assign"}
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setEditor("Unassigned")}>
              Leave unassigned for now
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2 rounded-md border p-3">
            <Row k="Content ID (permanent)" v={nextId} />
            <Row k="Title" v={basic.title || "—"} />
            <Row k="Brand" v={basic.brand} />
            <Row k="Type / Platform" v={`${basic.type} · ${basic.platform}`} />
            <Row k="Campaign" v={basic.campaign} />
            <Row k="Priority" v={basic.priority} />
            <Row k="Publish date" v={basic.publishDate || "—"} />
            <Row k="Editing deadline" v={basic.editDeadline || "—"} />
            <Row k="Objective" v={briefText.objective || "—"} />
            <Row k="Files attached" v={files.length ? files.join(", ") : "None"} />
            <Row k="Editor" v={editor} />
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => {
                if (!canNext) return toast.error("Title and editing deadline are required.");
                setStep((s) => s + 1);
              }}
            >
              Next
            </Button>
          ) : (
            <Button onClick={create} disabled={!basic.title.trim()}>
              Create content
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Picker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
