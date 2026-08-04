import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  Clock,
  Download,
  FileText,
  HelpCircle,
  Lock,
  MessageSquarePlus,
  Play,
  Search,
  Send,
  Upload,
} from "lucide-react";
import { SectionHead } from "./ui";
import {
  ALL_STATUSES,
  ASSIGNERS,
  BRANDS,
  CONTENT_TYPES,
  EDITOR_NAME,
  PLATFORMS,
  PRIORITY_TONE,
  STATUS_TONE,
  VE_RECORDS,
  currentVersion,
  detailsFor,
  isReadOnly,
  requirementsFor,
  type VeRecord,
  type VeStatus,
} from "./dashboard-data";

const TABS = [
  "All",
  "New",
  "Editing",
  "Due Today",
  "Waiting for Review",
  "Corrections",
  "Approved",
  "Published",
] as const;
type TabKey = (typeof TABS)[number];

const ANY = "__any__";

function matchTab(r: VeRecord, tab: TabKey) {
  switch (tab) {
    case "All":
      return true;
    case "New":
      return r.status === "New" || r.status === "Assigned";
    case "Editing":
      return r.status === "Editing" || r.status === "Ready for Review";
    case "Due Today":
      return r.dueToday;
    case "Waiting for Review":
      return r.status === "Submitted for Review" || r.status === "Resubmitted";
    case "Corrections":
      return r.status === "Correction Required";
    case "Approved":
      return r.status === "Approved" || r.status === "Scheduled";
    case "Published":
      return r.status === "Published";
  }
}

function attentionFlags(r: VeRecord) {
  const flags: { text: string; tone: "bad" | "warn" }[] = [];
  if (r.corrections.some((c) => !c.resolved && c.urgent)) flags.push({ text: "Urgent correction", tone: "bad" });
  if (r.overdue) flags.push({ text: "Overdue", tone: "bad" });
  if (!r.overdue && r.hoursToDeadline !== null && r.hoursToDeadline <= 2)
    flags.push({ text: "Deadline within 2 hours", tone: "warn" });
  if (r.rawFiles.some((f) => f.missing)) flags.push({ text: "Missing raw file", tone: "warn" });
  if (!r.briefComplete) flags.push({ text: "Brief incomplete", tone: "warn" });
  if (r.status === "Correction Required" && r.versions.some((v) => v.status === "Correction Required"))
    flags.push({ text: "Submission rejected", tone: "warn" });
  if (r.status === "Submitted for Review" && (r.hoursToDeadline ?? 0) > 48)
    flags.push({ text: "Waiting too long for review", tone: "warn" });
  if (r.conflictingInstructions) flags.push({ text: "Conflicting instructions", tone: "warn" });
  return flags;
}

export function VeMyVideosPage({ onGoTo }: { onGoTo?: (key: string) => void }) {
  const [records, setRecords] = useState<VeRecord[]>(VE_RECORDS);
  const [tab, setTab] = useState<TabKey>("All");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState(ANY);
  const [type, setType] = useState(ANY);
  const [platform, setPlatform] = useState(ANY);
  const [priority, setPriority] = useState(ANY);
  const [deadline, setDeadline] = useState(ANY);
  const [status, setStatus] = useState(ANY);
  const [assigner, setAssigner] = useState(ANY);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [question, setQuestion] = useState("");

  const open = records.find((r) => r.contentId === openId) ?? null;

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (!matchTab(r, tab)) return false;
        const needle = q.trim().toLowerCase();
        if (needle && !`${r.title} ${r.contentId} ${r.brand} ${r.platform}`.toLowerCase().includes(needle))
          return false;
        if (brand !== ANY && r.brand !== brand) return false;
        if (type !== ANY && r.contentType !== type) return false;
        if (platform !== ANY && r.platform !== platform) return false;
        if (priority !== ANY && r.priority !== priority) return false;
        if (status !== ANY && r.status !== status) return false;
        if (assigner !== ANY && r.assignedBy !== assigner) return false;
        if (deadline === "overdue" && !r.overdue) return false;
        if (deadline === "today" && !r.dueToday) return false;
        if (deadline === "week" && (r.hoursToDeadline ?? 999) > 168) return false;
        return true;
      }),
    [records, tab, q, brand, type, platform, priority, status, assigner, deadline],
  );

  const count = (fn: (r: VeRecord) => boolean) => records.filter(fn).length;
  const header = [
    { l: "Total Assigned", v: records.length, tone: "text-foreground" },
    { l: "Due Today", v: count((r) => r.dueToday && !isReadOnly(r)), tone: "text-amber-600" },
    { l: "Editing", v: count((r) => r.status === "Editing"), tone: "text-blue-600" },
    {
      l: "Waiting for Review",
      v: count((r) => r.status === "Submitted for Review" || r.status === "Resubmitted"),
      tone: "text-blue-600",
    },
    { l: "Corrections Required", v: count((r) => r.status === "Correction Required"), tone: "text-destructive" },
  ];

  const patch = (contentId: string, fn: (r: VeRecord) => VeRecord) =>
    setRecords((prev) => prev.map((r) => (r.contentId === contentId ? fn(r) : r)));

  const guard = (r: VeRecord) => {
    if (isReadOnly(r)) {
      toast.error("Approved videos are read-only for the Video Editor.");
      return false;
    }
    return true;
  };

  const startEditing = (r: VeRecord) => {
    if (!guard(r)) return;
    const stamp = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    patch(r.contentId, (x) => ({
      ...x,
      status: "Editing",
      startedAt: stamp,
      timeline: [...(x.timeline ?? detailsFor(x).timeline), { at: stamp, who: EDITOR_NAME, what: "Editing started" }],
    }));
    toast.success(`Editing started — ${r.contentId}`, { description: `Start time recorded: ${stamp}` });
  };

  const addVersion = (r: VeRecord, submit: boolean) => {
    if (!guard(r)) return;
    const version = `v${r.versions.length + 1}`;
    patch(r.contentId, (x) => ({
      ...x,
      status: submit ? (x.versions.length > 0 ? "Resubmitted" : "Submitted for Review") : "Ready for Review",
      corrections: submit ? x.corrections.map((c) => ({ ...c, resolved: true })) : x.corrections,
      versions: submit
        ? [
            ...x.versions,
            {
              version,
              submittedOn: "Today, just now",
              status: "Waiting for Review" as const,
              reviewer: "Priya Nair",
              comments: "—",
            },
          ]
        : x.versions,
      timeline: [
        ...(x.timeline ?? detailsFor(x).timeline),
        {
          at: "Today, just now",
          who: EDITOR_NAME,
          what: submit ? `${version} submitted for review` : "Draft uploaded under the same content record",
        },
      ],
    }));
    toast.success(
      submit ? `${r.contentId} ${version} submitted for review` : `Draft uploaded to ${r.contentId}`,
      {
        description: submit
          ? "Added to the Social Media Account Manager's Review & Approval queue. Same Content ID, new version."
          : "Version saved under the same content record.",
      },
    );
  };

  return (
    <div className="space-y-4">
      <SectionHead title="My Videos" sub={`All video projects assigned to ${EDITOR_NAME}.`} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {header.map((h) => (
          <Card key={h.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{h.l}</div>
              <div className={`text-2xl font-bold tabular-nums mt-1 ${h.tone}`}>{h.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, Content ID, brand or platform"
          className="pl-9"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-3 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
          <FilterSelect label="Brand" value={brand} onChange={setBrand} options={BRANDS} />
          <FilterSelect label="Content type" value={type} onChange={setType} options={CONTENT_TYPES} />
          <FilterSelect label="Platform" value={platform} onChange={setPlatform} options={PLATFORMS} />
          <FilterSelect label="Priority" value={priority} onChange={setPriority} options={["Urgent", "High", "Normal"]} />
          <FilterSelect
            label="Deadline"
            value={deadline}
            onChange={setDeadline}
            options={[
              { value: "overdue", label: "Overdue" },
              { value: "today", label: "Due today" },
              { value: "week", label: "This week" },
            ]}
          />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={ALL_STATUSES} />
          <FilterSelect label="Assigned by" value={assigner} onChange={setAssigner} options={ASSIGNERS} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((r) => {
          const flags = attentionFlags(r);
          return (
            <Card
              key={r.contentId}
              className={
                flags.some((f) => f.tone === "bad")
                  ? "border-destructive/40"
                  : flags.length
                  ? "border-amber-500/40"
                  : ""
              }
            >
              <CardContent className="p-3 space-y-3">
                <div className="h-28 rounded-md bg-muted flex items-center justify-center text-4xl relative">
                  {r.thumbnail}
                  <Badge variant="outline" className={`absolute top-2 left-2 bg-background ${PRIORITY_TONE[r.priority]}`}>
                    {r.priority}
                  </Badge>
                  <Badge variant="outline" className="absolute top-2 right-2 bg-background">
                    {r.durationRequired}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight line-clamp-2">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {r.contentId} · {r.brand}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.contentType} · {r.platform} · Version {currentVersion(r)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={STATUS_TONE[r.status]}>
                    {r.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      r.overdue
                        ? "bg-destructive/15 text-destructive border-destructive/30"
                        : r.dueToday
                        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        : ""
                    }
                  >
                    <Clock className="h-3 w-3 mr-1" /> {r.deadline}
                  </Badge>
                </div>
                {flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {flags.map((f) => (
                      <span
                        key={f.text}
                        className={`text-[11px] rounded px-1.5 py-0.5 border ${
                          f.tone === "bad"
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                        }`}
                      >
                        {f.text}
                      </span>
                    ))}
                  </div>
                )}
                <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(r.contentId)}>
                  View Video
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No videos match this tab and filter combination.</p>
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {open && (
            <VideoDetail
              r={open}
              onStart={() => startEditing(open)}
              onDraft={() => addVersion(open, false)}
              onSubmit={() => addVersion(open, true)}
              onCorrections={() => onGoTo?.("corrections")}
              note={note}
              setNote={setNote}
              question={question}
              setQuestion={setQuestion}
            />
          )}
        </SheetContent>
      </Sheet>

      <p className="text-[11px] text-muted-foreground">
        One permanent Content ID per video. Drafts and submissions add versions to the same record — approval,
        scheduling, publishing and deletion stay with the Social Media Account Manager, and reassignment preserves the
        original editor and full history.
      </p>
    </div>
  );
}

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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{label}: All</SelectItem>
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
  );
}

function VideoDetail({
  r,
  onStart,
  onDraft,
  onSubmit,
  onCorrections,
  note,
  setNote,
  question,
  setQuestion,
}: {
  r: VeRecord;
  onStart: () => void;
  onDraft: () => void;
  onSubmit: () => void;
  onCorrections: () => void;
  note: string;
  setNote: (v: string) => void;
  question: string;
  setQuestion: (v: string) => void;
}) {
  const d = detailsFor(r);
  const req = requirementsFor(r);
  const readOnly = isReadOnly(r);
  const flags = attentionFlags(r);

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="pr-6">{r.title}</SheetTitle>
        <SheetDescription>
          {r.contentId} · {r.contentType} · {r.platform}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-4 space-y-4">
        <div className="h-32 rounded-md bg-muted flex items-center justify-center text-5xl">{r.thumbnail}</div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={STATUS_TONE[r.status]}>
            {r.status}
          </Badge>
          <Badge variant="outline" className={PRIORITY_TONE[r.priority]}>
            {r.priority}
          </Badge>
          <Badge variant="outline">Version {currentVersion(r)}</Badge>
          <Badge variant="outline">Deadline: {r.deadline}</Badge>
        </div>

        {readOnly && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 flex items-center gap-2">
            <Lock className="h-4 w-4" /> Approved — read-only. Scheduling and publishing are handled by the Social
            Media Account Manager.
          </div>
        )}

        {flags.length > 0 && (
          <div className="space-y-1.5">
            {flags.map((f) => (
              <div
                key={f.text}
                className={`rounded-md border px-3 py-2 text-sm flex items-center gap-2 ${
                  f.tone === "bad"
                    ? "border-destructive/30 bg-destructive/5 text-destructive"
                    : "border-amber-500/30 bg-amber-500/5 text-amber-700"
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" /> {f.text}
              </div>
            ))}
          </div>
        )}

        <Block title="Brief & context">
          <Row l="Content objective" v={d.objective} />
          <Row l="Target audience" v={d.audience} />
          <Row l="Brand / business unit" v={r.brand} />
          <Row l="Required format & duration" v={`${req.aspectRatio} · ${r.durationRequired}`} />
          <Row l="Assigned by" v={r.assignedBy} />
          <Row l="Editing started" v={r.startedAt ?? "Not started"} />
          <p className="text-sm pt-1">{r.brief}</p>
          {r.conflictingInstructions && (
            <p className="text-sm text-amber-700 pt-1">Conflict: {r.conflictingInstructions}</p>
          )}
        </Block>

        <Block title="Script / caption">
          <p className="text-sm">{d.script}</p>
        </Block>

        <Block title="Editing requirements">
          <div className="grid sm:grid-cols-2 gap-x-6">
            <Row l="Orientation" v={req.orientation} />
            <Row l="Resolution" v={req.resolution} />
            <Row l="Aspect ratio" v={req.aspectRatio} />
            <Row l="Required duration" v={req.duration} />
            <Row l="Subtitles" v={req.subtitles} />
            <Row l="Logo placement" v={req.logo} />
            <Row l="Music" v={req.music} />
            <Row l="Call to action" v={req.cta} />
            <Row l="Export format" v={req.exportFormat} />
          </div>
          <p className="text-xs text-muted-foreground pt-1">{req.platformNotes}</p>
        </Block>

        <Block title="Files & assets">
          <FileList label="Raw video files" items={r.rawFiles.map((f) => ({ name: f.name, meta: f.missing ? "Missing" : f.size, bad: f.missing }))} />
          <FileList label="Audio files" items={d.audioFiles.map((f) => ({ name: f.name, meta: f.size }))} />
          <FileList label="Logo & brand assets" items={d.brandAssets.map((a) => ({ name: a, meta: "Preset" }))} />
          <FileList
            label="Reference videos"
            items={(r.references.length ? r.references : ["No reference shared"]).map((a) => ({ name: a, meta: "" }))}
          />
        </Block>

        {r.versions.length > 0 && (
          <Block title="Version history & reviewer comments">
            {r.versions.map((v) => (
              <div key={v.version} className="rounded border p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{v.version}</span>
                  <Badge
                    variant="outline"
                    className={
                      v.status === "Approved"
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        : v.status === "Correction Required"
                        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        : "bg-blue-500/15 text-blue-600 border-blue-500/30"
                    }
                  >
                    {v.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">Submitted {v.submittedOn}</div>
                <p className="text-xs mt-1">
                  {v.reviewer}: {v.comments}
                </p>
              </div>
            ))}
          </Block>
        )}

        <Block title="Activity timeline">
          <ol className="space-y-2">
            {d.timeline.map((t, i) => (
              <li key={`${t.at}-${i}`} className="flex gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>
                  <span className="font-medium">{t.what}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {t.at} · {t.who}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Block>

        <Separator />

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => toast.success(`Raw files queued — ${r.contentId}`)}>
            <Download className="h-4 w-4 mr-2" /> Download Raw Files
          </Button>
          <Button variant="outline" onClick={() => toast.info("Brief opened in full view")}>
            <FileText className="h-4 w-4 mr-2" /> View Brief
          </Button>
          <Button onClick={onStart} disabled={readOnly}>
            <Play className="h-4 w-4 mr-2" /> Start Editing
          </Button>
          <Button variant="outline" onClick={onDraft} disabled={readOnly}>
            <Upload className="h-4 w-4 mr-2" /> Upload Draft
          </Button>
          <Button variant="secondary" onClick={onSubmit} disabled={readOnly}>
            <Send className="h-4 w-4 mr-2" /> Submit for Review
          </Button>
          <Button variant="outline" onClick={onCorrections} disabled={!r.corrections.some((c) => !c.resolved)}>
            <AlertTriangle className="h-4 w-4 mr-2" /> Open Corrections
          </Button>
        </div>

        <Block title="Add note">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Internal note for this video record"
            rows={2}
          />
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => {
              if (!note.trim()) return toast.error("Write a note first.");
              toast.success(`Note added to ${r.contentId}`);
              setNote("");
            }}
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" /> Add Note
          </Button>
        </Block>

        <Block title="Ask a question">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Question for ${r.assignedBy}`}
            rows={2}
          />
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => {
              if (!question.trim()) return toast.error("Write your question first.");
              toast.success(`Question sent to ${r.assignedBy}`, { description: `Attached to ${r.contentId}` });
              setQuestion("");
            }}
          >
            <HelpCircle className="h-4 w-4 mr-2" /> Ask a Question
          </Button>
        </Block>
      </div>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3 space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">{l}:</span>
      <span className="font-medium min-w-0">{v}</span>
    </div>
  );
}

function FileList({ label, items }: { label: string; items: { name: string; meta: string; bad?: boolean }[] }) {
  return (
    <div className="pt-1">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <ul className="text-sm space-y-0.5">
        {items.map((i) => (
          <li key={i.name} className="flex justify-between gap-2">
            <span className="truncate">{i.name}</span>
            <span className={`text-xs ${i.bad ? "text-destructive" : "text-muted-foreground"}`}>{i.meta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type { VeStatus };
