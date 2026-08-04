import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Film,
  History,
  Link2,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { SectionHead, StatCard } from "./ui";
import {
  PUBLISH_RECORDS,
  READINESS_CHECKS,
  CALENDAR_STATUSES,
  SHARED_CONTENT,
  SOCIAL_ACCOUNT_HEALTH,
  CAMPAIGNS,
  BRANDS,
  CONTENT_TYPES,
  PLATFORMS,
  EDITOR_WORKLOAD,
  MANAGER_NAME,
  TODAY_ISO,
  type PublishRecord,
  type CalendarStatus,
} from "./shared-records";

const VIEWS = ["Today", "Week", "Month", "List View"] as const;
type View = (typeof VIEWS)[number];

const WEEK = ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08", "2026-08-09"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${DOW[d.getDay()]} ${d.getDate()} Aug`;
}

function statusTone(s: CalendarStatus) {
  switch (s) {
    case "Published":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "Scheduled":
    case "Ready to Publish":
      return "bg-blue-500/15 text-blue-700 border-blue-500/30";
    case "Publishing Failed":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Reschedule Required":
    case "Ready to Schedule":
    case "Approved":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "Cancelled":
      return "bg-muted text-muted-foreground border-border";
  }
}

const EMPTY_FILTERS = {
  brand: "All",
  platform: "All",
  type: "All",
  campaign: "All",
  status: "All",
  editor: "All",
  from: "",
  to: "",
};

export function SmmCalendarPage() {
  const [view, setView] = useState<View>("Today");
  const [records, setRecords] = useState<PublishRecord[]>(PUBLISH_RECORDS);
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [openId, setOpenId] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (filters.brand !== "All" && r.brand !== filters.brand) return false;
        if (filters.platform !== "All" && r.platform !== filters.platform) return false;
        if (filters.type !== "All" && r.type !== filters.type) return false;
        if (filters.campaign !== "All" && r.campaign !== filters.campaign) return false;
        if (filters.status !== "All" && r.status !== filters.status) return false;
        if (filters.editor !== "All" && r.editor !== filters.editor) return false;
        if (filters.from && r.date < filters.from) return false;
        if (filters.to && r.date > filters.to) return false;
        return true;
      }),
    [records, filters],
  );

  const scheduledToday = records.filter(
    (r) => r.date === TODAY_ISO && (r.status === "Scheduled" || r.status === "Ready to Publish"),
  ).length;
  const publishedToday = records.filter((r) => r.date === TODAY_ISO && r.status === "Published").length;
  const failed = records.filter((r) => r.status === "Publishing Failed").length;
  const readyToSchedule = SHARED_CONTENT.filter(
    (c) => c.stage === "Approved" && !records.some((r) => r.contentId === c.contentId && r.status !== "Cancelled"),
  ).length;

  const alerts = useMemo(() => {
    const out: { tone: "bad" | "warn"; text: string }[] = [];
    SHARED_CONTENT.filter(
      (c) => c.stage === "Approved" && !records.some((r) => r.contentId === c.contentId),
    ).forEach((c) => out.push({ tone: "warn", text: `${c.contentId} is approved but not scheduled.` }));
    records.forEach((r) => {
      if (r.status === "Cancelled" || r.status === "Published") return;
      if (!r.caption.trim()) out.push({ tone: "warn", text: `${r.contentId} scheduled without a caption.` });
      if (!r.thumbnail) out.push({ tone: "warn", text: `${r.contentId} has no thumbnail.` });
      if (!r.link.trim()) out.push({ tone: "warn", text: `${r.contentId} has an invalid or missing destination link.` });
      if (!r.trackingCode.trim()) out.push({ tone: "warn", text: `${r.contentId} has no lead-source tracking code.` });
      if (r.status === "Publishing Failed")
        out.push({ tone: "bad", text: `${r.contentId} publishing failed — ${r.failureReason ?? "check account"}.` });
      if (r.status === "Reschedule Required")
        out.push({ tone: "bad", text: `${r.contentId} publishing time has passed — reschedule required.` });
      const acc = SOCIAL_ACCOUNT_HEALTH.find((a) => a.accountName === r.account);
      if (acc && acc.connection !== "Connected")
        out.push({ tone: "bad", text: `${r.account} is ${acc.connection.toLowerCase()} — ${r.contentId} may fail.` });
      if (r.type === "Reel" && r.platform === "LinkedIn")
        out.push({ tone: "warn", text: `${r.contentId} format may not match ${r.platform} requirements.` });
    });
    // duplicate account + slot
    const seen = new Map<string, string>();
    records
      .filter((r) => r.status === "Scheduled" || r.status === "Ready to Publish")
      .forEach((r) => {
        const key = `${r.account}|${r.date}|${r.time}`;
        if (seen.has(key))
          out.push({
            tone: "bad",
            text: `Two posts are scheduled on ${r.account} at ${r.time} on ${dayLabel(r.date)} (${seen.get(key)}, ${r.contentId}).`,
          });
        else seen.set(key, r.contentId);
      });
    return out.slice(0, 10);
  }, [records]);

  const open = openId ? records.find((r) => r.id === openId) ?? null : null;

  function patch(id: string, p: Partial<PublishRecord>, note?: string) {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...p,
              history: note ? [...r.history, { at: "Today", by: MANAGER_NAME, note }] : r.history,
            }
          : r,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <SectionHead
            title="Publishing Calendar"
            sub="Plan, schedule, verify and track approved content across every authorised account."
          />
        </div>
        <Button className="shrink-0" onClick={() => setWizard(true)}>
          <Plus className="h-4 w-4 mr-1" /> Schedule Content
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scheduled Today" value={String(scheduledToday)} />
        <StatCard label="Ready to Schedule" value={String(readyToSchedule)} tone={readyToSchedule ? "warn" : "good"} />
        <StatCard label="Published Today" value={String(publishedToday)} tone="good" />
        <StatCard label="Publishing Failed" value={String(failed)} tone={failed ? "bad" : "good"} />
      </div>

      {alerts.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Attention Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {alerts.map((a, i) => (
              <div key={i} className={a.tone === "bad" ? "text-destructive" : "text-amber-700"}>
                • {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {VIEWS.map((v) => (
          <Button
            key={v}
            size="sm"
            variant={view === v ? "default" : "outline"}
            onClick={() => setView(v)}
            className="shrink-0"
          >
            {v}
          </Button>
        ))}
      </div>

      <Filters filters={filters} setFilters={setFilters} />

      {view === "Today" && (
        <DayColumn
          iso={TODAY_ISO}
          items={filtered.filter((r) => r.date === TODAY_ISO)}
          onOpen={setOpenId}
          expanded
        />
      )}

      {view === "Week" && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {WEEK.map((iso) => (
            <DayColumn
              key={iso}
              iso={iso}
              items={filtered.filter((r) => r.date === iso)}
              onOpen={setOpenId}
            />
          ))}
        </div>
      )}

      {view === "Month" && <MonthGrid items={filtered} onOpen={setOpenId} />}

      {view === "List View" && <ListView items={filtered} onOpen={setOpenId} />}

      <p className="text-xs text-muted-foreground">
        Only approved and locked versions can be scheduled. The same Content ID travels through
        publishing, rescheduling keeps the original schedule history, and published records are never
        silently replaced or deleted. Video Editors cannot schedule, publish or modify approved
        content.
      </p>

      {open && (
        <DetailDialog
          record={open}
          onClose={() => setOpenId(null)}
          onPatch={(p, note) => patch(open.id, p, note)}
        />
      )}

      <ScheduleWizard
        open={wizard}
        onOpenChange={setWizard}
        existing={records}
        onSchedule={(rec) => {
          setRecords((prev) => [...prev, rec]);
          setWizard(false);
          toast.success(`${rec.contentId} scheduled for ${dayLabel(rec.date)} at ${rec.time}.`);
        }}
      />
    </div>
  );
}

/* ---------------- filters ---------------- */

function Filters({
  filters,
  setFilters,
}: {
  filters: typeof EMPTY_FILTERS;
  setFilters: (f: typeof EMPTY_FILTERS) => void;
}) {
  const set = (k: keyof typeof EMPTY_FILTERS, v: string) => setFilters({ ...filters, [k]: v });
  const sel = (k: keyof typeof EMPTY_FILTERS, label: string, opts: string[]) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={filters[k] as string} onValueChange={(v) => set(k, v)}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {opts.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sel("brand", "Brand", BRANDS)}
        {sel("platform", "Platform", PLATFORMS)}
        {sel("type", "Content type", CONTENT_TYPES)}
        {sel("campaign", "Campaign", CAMPAIGNS)}
        {sel("status", "Publishing status", [...CALENDAR_STATUSES])}
        {sel("editor", "Video Editor", EDITOR_WORKLOAD.map((e) => e.name))}
        <div>
          <Label className="text-xs">From date</Label>
          <Input type="date" className="h-9" value={filters.from} onChange={(e) => set("from", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">To date</Label>
          <Input type="date" className="h-9" value={filters.to} onChange={(e) => set("to", e.target.value)} />
        </div>
        <Button variant="ghost" size="sm" className="lg:col-span-4 justify-self-start" onClick={() => setFilters({ ...EMPTY_FILTERS })}>
          Clear filters
        </Button>
      </CardContent>
    </Card>
  );
}

/* ---------------- views ---------------- */

function ItemRow({
  r,
  onOpen,
  compact,
}: {
  r: PublishRecord;
  onOpen: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={() => onOpen(r.id)}
      className="w-full text-left rounded-md border p-2 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className={`h-9 w-12 shrink-0 rounded bg-gradient-to-br ${r.thumbTone} grid place-items-center`}>
          <Film className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold tabular-nums">{r.time}</div>
          <div className="text-sm truncate">{r.title}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.contentId}</div>
        </div>
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline">{r.brand}</Badge>
          <Badge variant="outline">{r.platform}</Badge>
          <Badge variant="outline">{r.type}</Badge>
          <Badge variant="outline">{r.campaign}</Badge>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 mt-2">
        <span className={`text-[11px] rounded-full border px-2 py-0.5 ${statusTone(r.status)}`}>
          {r.status}
        </span>
        <span className="text-[11px] text-primary underline">View Content</span>
      </div>
    </button>
  );
}

function DayColumn({
  iso,
  items,
  onOpen,
  expanded,
}: {
  iso: string;
  items: PublishRecord[];
  onOpen: (id: string) => void;
  expanded?: boolean;
}) {
  const crowded = items.filter((i) => i.status !== "Cancelled").length > 3;
  return (
    <Card className={iso === TODAY_ISO ? "border-primary/50" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" /> {dayLabel(iso)}
          {iso === TODAY_ISO && <Badge variant="secondary">Today</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {crowded && (
          <div className="text-[11px] text-amber-700 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Heavy day — {items.length} posts scheduled.
          </div>
        )}
        {items.length === 0 && <p className="text-xs text-muted-foreground">No posts scheduled.</p>}
        {items
          .slice()
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((r) => (
            <ItemRow key={r.id} r={r} onOpen={onOpen} compact={!expanded} />
          ))}
      </CardContent>
    </Card>
  );
}

function MonthGrid({ items, onOpen }: { items: PublishRecord[]; onOpen: (id: string) => void }) {
  const days = Array.from({ length: 31 }, (_, i) => `2026-08-${String(i + 1).padStart(2, "0")}`);
  const offset = new Date("2026-08-01T00:00:00").getDay();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">August 2026</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden sm:grid grid-cols-7 gap-1 text-[11px] text-muted-foreground mb-1">
          {DOW.map((d) => (
            <div key={d} className="px-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`p${i}`} className="hidden sm:block" />
          ))}
          {days.map((iso) => {
            const dayItems = items.filter((r) => r.date === iso);
            return (
              <div
                key={iso}
                className={`min-h-20 rounded border p-1 space-y-1 ${iso === TODAY_ISO ? "border-primary/60 bg-primary/5" : ""}`}
              >
                <div className="text-[11px] font-medium tabular-nums">{Number(iso.slice(-2))}</div>
                {dayItems.length > 3 && (
                  <div className="text-[10px] text-amber-700">Heavy day</div>
                )}
                {dayItems.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onOpen(r.id)}
                    className={`w-full text-left text-[10px] rounded border px-1 py-0.5 truncate ${statusTone(r.status)}`}
                  >
                    {r.time} {r.platform} · {r.title}
                  </button>
                ))}
                {dayItems.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{dayItems.length - 3} more</div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ListView({ items, onOpen }: { items: PublishRecord[]; onOpen: (id: string) => void }) {
  const sorted = items.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div className="space-y-2">
      {sorted.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No publishing records match these filters.
          </CardContent>
        </Card>
      )}
      {sorted.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-3">
            <div className="text-[11px] text-muted-foreground mb-1">
              {dayLabel(r.date)} · {r.timezone}
            </div>
            <ItemRow r={r} onOpen={onOpen} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- detail + manager actions ---------------- */

function DetailDialog({
  record,
  onClose,
  onPatch,
}: {
  record: PublishRecord;
  onClose: () => void;
  onPatch: (p: Partial<PublishRecord>, note?: string) => void;
}) {
  const [caption, setCaption] = useState(record.caption);
  const [account, setAccount] = useState(record.account);
  const [date, setDate] = useState(record.date);
  const [time, setTime] = useState(record.time);
  const [reason, setReason] = useState("");
  const [url, setUrl] = useState(record.publishedUrl ?? "");
  const locked = record.status === "Published";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {record.title}
            <span className={`text-[11px] rounded-full border px-2 py-0.5 ${statusTone(record.status)}`}>
              {record.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <F l="Content ID" v={record.contentId} />
          <F l="Approved version" v={`${record.version} (locked)`} />
          <F l="Brand" v={record.brand} />
          <F l="Platform" v={record.platform} />
          <F l="Content type" v={record.type} />
          <F l="Campaign" v={record.campaign} />
          <F l="Social account" v={record.account} />
          <F l="Video Editor" v={record.editor} />
          <F l="Publishing date & time" v={`${dayLabel(record.date)}, ${record.time}`} />
          <F l="Time zone" v={record.timezone} />
          <F l="Hashtags" v={record.hashtags || "—"} />
          <F l="Call-to-action" v={record.cta || "—"} />
          <F l="Thumbnail" v={record.thumbnail || "Missing"} />
          <F l="Destination link" v={record.link || "Missing"} />
          <F l="Tracking code" v={record.trackingCode || "Missing"} />
          <F l="First comment" v={record.firstComment || "Not applicable"} />
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground">Caption</div>
            <div>{record.caption || "No caption added yet."}</div>
          </div>
        </div>

        {record.status === "Published" && (
          <Card className="border-emerald-500/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Published Content Record
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
              <F l="Published at" v={record.publishedAt ?? "—"} />
              <F l="Platform / account" v={`${record.platform} · ${record.account}`} />
              <F l="Published URL" v={record.publishedUrl ?? "—"} />
              <F l="Platform Post ID" v={record.platformPostId ?? "Placeholder"} />
              <F l="Published by" v={record.publishedBy ?? "—"} />
              <F l="Version used" v={record.version} />
              <F l="Caption used" v={record.caption} />
              <F l="Thumbnail used" v={record.thumbnail} />
              <F l="Campaign / tracking" v={`${record.campaign} · ${record.trackingCode}`} />
            </CardContent>
          </Card>
        )}

        {!locked && (
          <div className="space-y-3 border-t pt-3">
            <div className="text-sm font-medium">Manager Actions</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Edit caption before publishing</Label>
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => {
                    onPatch({ caption }, "Caption edited before publishing");
                    toast.success("Caption updated.");
                  }}
                >
                  Save caption
                </Button>
              </div>
              <div>
                <Label className="text-xs">Change social account</Label>
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_ACCOUNT_HEALTH.map((a) => (
                      <SelectItem key={a.accountName} value={a.accountName}>
                        {a.platform} · {a.accountName} ({a.connection})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => {
                    onPatch({ account }, `Social account changed to ${account}`);
                    toast.success("Social account changed.");
                  }}
                >
                  Save account
                </Button>
              </div>
              <div>
                <Label className="text-xs">Reschedule date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Reschedule time</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Reason (required to reschedule or cancel)</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this changing?" />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (!reason.trim()) return toast.error("A reason is required to reschedule.");
                    onPatch(
                      { date, time, status: "Scheduled" },
                      `Rescheduled to ${dayLabel(date)} ${time} — ${reason}`,
                    );
                    toast.success("Rescheduled. Original schedule history preserved.");
                    setReason("");
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Reschedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onPatch(
                      {
                        status: "Published",
                        publishedAt: `${dayLabel(record.date)}, ${record.time}`,
                        publishedBy: `${MANAGER_NAME} (manual)`,
                        publishedUrl: url || undefined,
                        platformPostId: "Platform Post ID placeholder",
                      },
                      "Marked as manually published",
                    );
                    toast.success("Marked as manually published.");
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark manually published
                </Button>
                {record.status === "Publishing Failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.info("Retry queued (placeholder) — no duplicate post is created.")
                    }
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Retry publishing
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (!reason.trim()) return toast.error("A reason is required to cancel.");
                    onPatch({ status: "Cancelled" }, `Schedule cancelled — ${reason}`);
                    toast.success("Schedule cancelled. Record kept in CRM history.");
                    setReason("");
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Cancel schedule
                </Button>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Record published link</Label>
                <div className="flex gap-2">
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onPatch({ publishedUrl: url }, `Published link recorded: ${url}`);
                      toast.success("Published link recorded.");
                    }}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="text-sm font-medium flex items-center gap-2 mb-2">
            <History className="h-4 w-4" /> Content & Schedule History
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {record.history.map((h, i) => (
              <div key={i}>
                • {h.at} — {h.by}: {h.note}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function F({ l, v }: { l: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{l}</div>
      <div className="font-medium break-words">{v}</div>
    </div>
  );
}

/* ---------------- schedule wizard ---------------- */

const STEPS = [
  "Select Approved Content",
  "Select Social Account",
  "Add Publishing Details",
  "Complete Readiness Check",
  "Schedule",
];

function ScheduleWizard({
  open,
  onOpenChange,
  existing,
  onSchedule,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing: PublishRecord[];
  onSchedule: (r: PublishRecord) => void;
}) {
  const approved = SHARED_CONTENT.filter((c) => c.stage === "Approved" && c.approvedVersion);
  const [step, setStep] = useState(0);
  const [contentId, setContentId] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState(TODAY_ISO);
  const [time, setTime] = useState("18:00");
  const [timezone, setTimezone] = useState("IST (UTC+5:30)");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [cta, setCta] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [campaign, setCampaign] = useState(CAMPAIGNS[0]!);
  const [link, setLink] = useState("");
  const [tracking, setTracking] = useState("");
  const [checks, setChecks] = useState(READINESS_CHECKS.map(() => false));

  const content = approved.find((c) => c.contentId === contentId);
  const acc = SOCIAL_ACCOUNT_HEALTH.find((a) => a.accountName === account);
  const allChecked = checks.every(Boolean);
  const clash = existing.some(
    (r) => r.account === account && r.date === date && r.time === time && r.status !== "Cancelled",
  );

  function reset() {
    setStep(0);
    setContentId("");
    setAccount("");
    setCaption("");
    setHashtags("");
    setCta("");
    setThumbnail("");
    setFirstComment("");
    setLink("");
    setTracking("");
    setChecks(READINESS_CHECKS.map(() => false));
  }

  function canAdvance() {
    if (step === 0) return !!content;
    if (step === 1) return !!account;
    if (step === 2) return !!caption.trim() && !!date && !!time && !!link.trim() && !!tracking.trim();
    if (step === 3) return allChecked;
    return true;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Schedule Content — Step {step + 1} of 5: {STEPS[step]}
          </DialogTitle>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Only approved and locked versions appear here.
            </p>
            {approved.map((c) => (
              <button
                key={c.contentId}
                onClick={() => setContentId(c.contentId)}
                className={`w-full text-left rounded-md border p-3 ${contentId === c.contentId ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="font-medium text-sm">{c.title}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {c.contentId} · {c.approvedVersion} locked · {c.brand} · {c.type}
                </div>
              </button>
            ))}
            {approved.length === 0 && (
              <p className="text-sm text-muted-foreground">No approved content waiting to be scheduled.</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            {SOCIAL_ACCOUNT_HEALTH.map((a) => (
              <button
                key={a.accountName}
                onClick={() => setAccount(a.accountName)}
                className={`w-full text-left rounded-md border p-3 ${account === a.accountName ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {a.platform} · {a.accountName}
                  </span>
                  <Badge variant={a.connection === "Connected" ? "secondary" : "destructive"}>
                    {a.connection}
                  </Badge>
                </div>
                {a.warning && <div className="text-xs text-amber-700 mt-1">{a.warning}</div>}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <F l="Target platform" v={acc?.platform ?? "—"} />
            <F l="Social account" v={account || "—"} />
            <div>
              <Label className="text-xs">Publishing date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Publishing time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Time zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IST (UTC+5:30)">IST (UTC+5:30)</SelectItem>
                  <SelectItem value="GST (UTC+4)">GST (UTC+4)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Campaign</Label>
              <Select value={campaign} onValueChange={setCampaign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGNS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Caption</Label>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Hashtags</Label>
              <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#cleancraft" />
            </div>
            <div>
              <Label className="text-xs">Call-to-action</Label>
              <Input value={cta} onChange={(e) => setCta(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Thumbnail</Label>
              <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="thumb.jpg" />
            </div>
            <div>
              <Label className="text-xs">First comment (when applicable)</Label>
              <Input value={firstComment} onChange={(e) => setFirstComment(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Destination link</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://cleancraft.in/..." />
            </div>
            <div>
              <Label className="text-xs">Lead-source tracking code</Label>
              <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="ig_franchise_aug" />
            </div>
            {clash && (
              <p className="sm:col-span-2 text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Another post is already scheduled on this
                account at this time.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {READINESS_CHECKS.map((c, i) => (
              <label key={c} className="flex items-start gap-2 rounded-md border p-2 text-sm cursor-pointer">
                <Checkbox
                  checked={checks[i]}
                  onCheckedChange={() => {
                    const next = [...checks];
                    next[i] = !next[i];
                    setChecks(next);
                  }}
                />
                <span>{c}</span>
              </label>
            ))}
            {!allChecked && (
              <p className="sm:col-span-2 text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> All mandatory checks must be completed
                before scheduling.
              </p>
            )}
          </div>
        )}

        {step === 4 && content && (
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <F l="Content" v={`${content.title} (${content.contentId})`} />
            <F l="Approved version" v={`${content.approvedVersion} — locked`} />
            <F l="Platform / account" v={`${acc?.platform} · ${account}`} />
            <F l="Publishing" v={`${dayLabel(date)} ${time} · ${timezone}`} />
            <F l="Campaign / tracking" v={`${campaign} · ${tracking}`} />
            <F l="Readiness" v="10 / 10 checks complete" />
            <div className="sm:col-span-2">
              <F l="Caption" v={caption} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 && (
            <Button disabled={!canAdvance()} onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          )}
          {step === 4 && content && (
            <Button
              onClick={() =>
                onSchedule({
                  id: `PB-${Math.floor(Math.random() * 9000 + 1000)}`,
                  contentId: content.contentId,
                  title: content.title,
                  brand: content.brand,
                  platform: acc?.platform ?? content.platform,
                  type: content.type,
                  campaign,
                  editor: content.editor,
                  version: content.approvedVersion!,
                  account,
                  date,
                  time,
                  timezone,
                  status: "Scheduled",
                  caption,
                  hashtags,
                  cta,
                  thumbnail,
                  firstComment: firstComment || undefined,
                  link,
                  trackingCode: tracking,
                  thumbTone: "from-blue-500/30 to-blue-500/5",
                  history: [
                    {
                      at: "Today",
                      by: MANAGER_NAME,
                      note: `Scheduled ${content.approvedVersion} for ${dayLabel(date)} ${time} ${timezone}`,
                    },
                  ],
                })
              }
            >
              Confirm Schedule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
