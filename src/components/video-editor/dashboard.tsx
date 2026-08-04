import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  Clock,
  Download,
  FileText,
  FolderOpen,
  Lock,
  Play,
  Send,
  Video,
} from "lucide-react";
import {
  EDITOR_NAME,
  PRIORITY_TONE,
  STATUS_TONE,
  VE_RECORDS,
  buildAlerts,
  isReadOnly,
  queueRank,
  type VeRecord,
  type VeStatus,
} from "./dashboard-data";

type Availability = "Available" | "Editing" | "Off Duty";

const TODAY = new Date("2026-08-04T13:04:00+05:30");

export function VeDashboardPage({ onGoTo }: { onGoTo?: (key: string) => void }) {
  const [records, setRecords] = useState<VeRecord[]>(VE_RECORDS);
  const [availability, setAvailability] = useState<Availability>("Editing");
  const [openRecord, setOpenRecord] = useState<VeRecord | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);

  const queue = useMemo(
    () => [...records].filter((r) => !isReadOnly(r)).sort((a, b) => queueRank(a) - queueRank(b)),
    [records],
  );
  const nextVideo = queue[0];
  const alerts = useMemo(() => buildAlerts(records), [records]);

  const count = (fn: (r: VeRecord) => boolean) => records.filter(fn).length;
  const summary = [
    { l: "New Videos", v: count((r) => r.status === "New" || r.status === "Assigned"), tone: "text-foreground" },
    { l: "Editing in Progress", v: count((r) => r.status === "Editing"), tone: "text-blue-600" },
    { l: "Due Today", v: count((r) => r.dueToday && !isReadOnly(r)), tone: "text-amber-600" },
    { l: "Corrections Required", v: count((r) => r.status === "Correction Required"), tone: "text-destructive" },
    {
      l: "Waiting for Review",
      v: count((r) => r.status === "Submitted for Review" || r.status === "Resubmitted"),
      tone: "text-blue-600",
    },
    { l: "Approved This Month", v: 12, tone: "text-emerald-600" },
  ];

  const setStatus = (contentId: string, status: VeStatus, extra?: Partial<VeRecord>) =>
    setRecords((prev) => prev.map((r) => (r.contentId === contentId ? { ...r, status, ...extra } : r)));

  const startEditing = (r: VeRecord) => {
    if (isReadOnly(r)) return;
    const stamp = TODAY.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    setStatus(r.contentId, "Editing", { startedAt: stamp });
    setAvailability("Editing");
    toast.success(`Editing started — ${r.contentId}`, { description: `Start time recorded: ${stamp}` });
  };

  const submit = (r: VeRecord) => {
    if (isReadOnly(r)) {
      toast.error("Approved content is read-only for the Video Editor.");
      return;
    }
    const nextVersion = `v${r.versions.length + 1}`;
    setRecords((prev) =>
      prev.map((x) =>
        x.contentId === r.contentId
          ? {
              ...x,
              status: r.versions.length > 0 ? "Resubmitted" : "Submitted for Review",
              corrections: x.corrections.map((c) => ({ ...c, resolved: true })),
              versions: [
                ...x.versions,
                {
                  version: nextVersion,
                  submittedOn: "Today, just now",
                  status: "Waiting for Review" as const,
                  reviewer: "Priya Nair",
                  comments: "—",
                },
              ],
            }
          : x,
      ),
    );
    toast.success(`${r.contentId} ${nextVersion} submitted`, {
      description: "Social Media Account Manager notified for review. Version history preserved.",
    });
  };

  const corrections = records.filter((r) => r.corrections.some((c) => !c.resolved));
  const submissions = records
    .filter((r) => r.versions.length > 0)
    .flatMap((r) => r.versions.map((v) => ({ r, v })))
    .sort((a, b) => (a.v.status === "Waiting for Review" ? -1 : b.v.status === "Waiting for Review" ? 1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate">Welcome, {EDITOR_NAME}</h1>
              <p className="text-xs text-muted-foreground">
                {TODAY.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · Video Editor workspace
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={availability} onValueChange={(v) => setAvailability(v as Availability)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Available", "Editing", "Off Duty"] as Availability[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="relative" onClick={() => setShowAlerts(true)}>
              <Bell className="h-4 w-4 mr-1" /> Notifications
              {alerts.length > 0 && (
                <span className="ml-1 rounded-full bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 tabular-nums">
                  {alerts.length}
                </span>
              )}
            </Button>
            <Button size="sm" onClick={() => nextVideo && setOpenRecord(nextVideo)}>
              <Play className="h-4 w-4 mr-1" /> Open Next Video
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {summary.map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={`text-3xl font-bold tabular-nums mt-1 ${s.tone}`}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attention alerts */}
      {alerts.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-2">
            {alerts.slice(0, 8).map((a, i) => (
              <div
                key={`${a.contentId}-${i}`}
                className={`rounded-md border px-3 py-2 text-sm flex items-center gap-2 ${
                  a.tone === "bad"
                    ? "border-destructive/30 bg-destructive/5 text-destructive"
                    : a.tone === "warn"
                    ? "border-amber-500/30 bg-amber-500/5 text-amber-700"
                    : "border-blue-500/30 bg-blue-500/5 text-blue-700"
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="min-w-0">{a.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next priority video — largest section */}
      {nextVideo && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Next priority video</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className={PRIORITY_TONE[nextVideo.priority]}>
                  {nextVideo.priority}
                </Badge>
                <Badge variant="outline" className={STATUS_TONE[nextVideo.status]}>
                  {nextVideo.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-32 w-full sm:w-56 shrink-0 rounded-md bg-muted flex items-center justify-center text-5xl">
                {nextVideo.thumbnail}
              </div>
              <div className="min-w-0 space-y-2">
                <div className="text-lg font-semibold leading-tight">{nextVideo.title}</div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <Field l="Content ID" v={nextVideo.contentId} />
                  <Field l="Brand / business unit" v={nextVideo.brand} />
                  <Field l="Content type" v={nextVideo.contentType} />
                  <Field l="Platform" v={nextVideo.platform} />
                  <Field l="Duration required" v={nextVideo.durationRequired} />
                  <Field l="Deadline" v={`${nextVideo.deadline} · ${nextVideo.deadlineNote}`} />
                  <Field l="Assigned by" v={nextVideo.assignedBy} />
                  <Field l="Editing started" v={nextVideo.startedAt ?? "Not started"} />
                </div>
              </div>
            </div>

            <div className="rounded-md border bg-muted/20 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Editing brief</div>
              <p className="text-sm">{nextVideo.brief}</p>
              {!nextVideo.briefComplete && (
                <p className="text-xs text-amber-600 mt-1">Brief incomplete — confirm details with the assigner.</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Raw video files</div>
                <ul className="space-y-1 text-sm">
                  {nextVideo.rawFiles.map((f) => (
                    <li key={f.name} className="flex items-center justify-between gap-2">
                      <span className="truncate">{f.name}</span>
                      <span className={f.missing ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
                        {f.missing ? "Missing" : f.size}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Reference content</div>
                {nextVideo.references.length ? (
                  <ul className="space-y-1 text-sm list-disc pl-4">
                    {nextVideo.references.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No reference shared.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Button
                size="lg"
                variant="outline"
                onClick={() => toast.success(`Raw files queued for download — ${nextVideo.contentId}`)}
              >
                <Download className="h-4 w-4 mr-2" /> Download Raw Files
              </Button>
              <Button size="lg" onClick={() => startEditing(nextVideo)}>
                <Play className="h-4 w-4 mr-2" /> Start Editing
              </Button>
              <Button size="lg" variant="outline" onClick={() => setOpenRecord(nextVideo)}>
                <FileText className="h-4 w-4 mr-2" /> View Brief
              </Button>
              <Button size="lg" variant="secondary" onClick={() => submit(nextVideo)}>
                <Send className="h-4 w-4 mr-2" /> Submit for Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <Button variant="outline" onClick={() => nextVideo && setOpenRecord(nextVideo)}>
            <Play className="h-4 w-4 mr-2" /> Open Next Video
          </Button>
          <Button variant="outline" onClick={() => onGoTo?.("videos")}>
            <FolderOpen className="h-4 w-4 mr-2" /> View Raw Files
          </Button>
          <Button variant="outline" onClick={() => onGoTo?.("submit")}>
            <Send className="h-4 w-4 mr-2" /> Submit Edited Video
          </Button>
          <Button variant="outline" onClick={() => onGoTo?.("corrections")}>
            <AlertTriangle className="h-4 w-4 mr-2" /> View Corrections
          </Button>
          <Button variant="outline" onClick={() => onGoTo?.("assets")}>
            <FileText className="h-4 w-4 mr-2" /> Assets & Guidelines
          </Button>
        </CardContent>
      </Card>

      {/* Today's work queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today’s work queue</CardTitle>
          <p className="text-xs text-muted-foreground">
            Ordered by urgent corrections, overdue, due today, new priority assignments, then scheduled work.
          </p>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {queue.slice(0, 5).map((r) => (
            <div key={r.contentId} className="rounded-md border p-3 space-y-2">
              <div className="flex gap-3">
                <div className="h-16 w-24 shrink-0 rounded bg-muted flex items-center justify-center text-2xl">
                  {r.thumbnail}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight line-clamp-2">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {r.contentId} · {r.contentType}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{r.platform}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={STATUS_TONE[r.status]}>
                  {r.status}
                </Badge>
                <Badge variant="outline" className={PRIORITY_TONE[r.priority]}>
                  {r.priority}
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
              <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenRecord(r)}>
                View Video
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Corrections required */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Corrections required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {corrections.length === 0 && <p className="text-sm text-muted-foreground">No open corrections.</p>}
            {corrections.map((r) => {
              const c = r.corrections.find((x) => !x.resolved)!;
              return (
                <div key={r.contentId} className="rounded-md border p-3 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.contentId} · Reviewer: {c.reviewer} · Version {c.version}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        c.urgent
                          ? "bg-destructive/15 text-destructive border-destructive/30"
                          : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                      }
                    >
                      Due {c.deadline}
                    </Badge>
                  </div>
                  <ul className="text-sm list-disc pl-4 space-y-0.5">
                    {c.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" onClick={() => onGoTo?.("corrections")}>
                    Open Corrections
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Review status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Review status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissions.map(({ r, v }) => (
              <div key={`${r.contentId}-${v.version}`} className="rounded-md border p-3 space-y-1.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.contentId} · {v.version} · Submitted {v.submittedOn}
                    </div>
                  </div>
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
                <p className="text-xs text-muted-foreground">
                  {v.reviewer}: {v.comments}
                </p>
                <Button size="sm" variant="outline" onClick={() => setOpenRecord(r)}>
                  View Submission
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Approval, scheduling, publishing and deletion are controlled by the Social Media Account Manager. Approved
        videos become read-only here and every submission adds a version under the same Content ID.
      </p>

      {/* Record detail dialog */}
      <Dialog open={!!openRecord} onOpenChange={(o) => !o && setOpenRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {openRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{openRecord.title}</DialogTitle>
                <DialogDescription>
                  {openRecord.contentId} · {openRecord.contentType} · {openRecord.platform}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={STATUS_TONE[openRecord.status]}>
                    {openRecord.status}
                  </Badge>
                  <Badge variant="outline" className={PRIORITY_TONE[openRecord.priority]}>
                    {openRecord.priority}
                  </Badge>
                  <Badge variant="outline">{openRecord.durationRequired}</Badge>
                  <Badge variant="outline">Deadline: {openRecord.deadline}</Badge>
                </div>
                {isReadOnly(openRecord) && (
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Approved content — read-only for the Video Editor.
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <Field l="Brand / business unit" v={openRecord.brand} />
                  <Field l="Assigned by" v={openRecord.assignedBy} />
                  <Field l="Editing started" v={openRecord.startedAt ?? "Not started"} />
                  <Field l="Versions" v={openRecord.versions.length ? openRecord.versions.map((v) => v.version).join(", ") : "None"} />
                </div>
                <Separator />
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Editing brief</div>
                  <p className="text-sm">{openRecord.brief}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Raw video files</div>
                  <ul className="text-sm space-y-1">
                    {openRecord.rawFiles.map((f) => (
                      <li key={f.name} className="flex justify-between gap-2">
                        <span className="truncate">{f.name}</span>
                        <span className={f.missing ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
                          {f.missing ? "Missing" : f.size}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {openRecord.versions.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Version history</div>
                    <ul className="text-sm space-y-1">
                      {openRecord.versions.map((v) => (
                        <li key={v.version} className="rounded border px-2 py-1">
                          <span className="font-medium">{v.version}</span> · {v.submittedOn} · {v.status} —{" "}
                          <span className="text-muted-foreground">{v.comments}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!isReadOnly(openRecord) && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => toast.success(`Raw files queued for download — ${openRecord.contentId}`)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download Raw Files
                    </Button>
                    <Button onClick={() => startEditing(openRecord)}>
                      <Play className="h-4 w-4 mr-2" /> Start Editing
                    </Button>
                    <Button
                      variant="secondary"
                      className="col-span-2"
                      onClick={() => {
                        submit(openRecord);
                        setOpenRecord(null);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" /> Submit for Review
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Notifications dialog */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Alerts generated from your live video records.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {alerts.map((a, i) => (
              <div key={`${a.contentId}-n-${i}`} className="rounded-md border px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`h-4 w-4 shrink-0 ${
                      a.tone === "bad" ? "text-destructive" : a.tone === "warn" ? "text-amber-500" : "text-blue-500"
                    }`}
                  />
                  <span>{a.text}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{a.contentId}</div>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-sm text-muted-foreground">Nothing needs attention.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground shrink-0">{l}:</span>
      <span className="font-medium min-w-0 truncate">{v}</span>
    </div>
  );
}
