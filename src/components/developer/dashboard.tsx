import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  AlertTriangle,
  Bell,
  Bug,
  CheckCircle2,
  FileText,
  HelpCircle,
  MonitorSmartphone,
  Play,
  Rocket,
  ShieldAlert,
  Siren,
  TestTube2,
} from "lucide-react";
import { StatCard } from "@/components/smm/ui";
import {
  ALERTS,
  AUDIT_LOG,
  BUG_SUMMARY,
  PERFORMANCE,
  RELEASE_SUMMARY,
  SETUP_SUMMARY,
  SYSTEM_HEALTH,
  WORK,
  reasonRank,
  type HealthState,
  type WorkItem,
} from "./work-records";

const DEVELOPER = "Arjun Bhatt";
const TODAY = "Tuesday, 4 August 2026";

/* -------------------------------- helpers -------------------------------- */

const priorityClass = (p: WorkItem["priority"]) =>
  p === "Emergency"
    ? "bg-red-900 text-white border-red-900"
    : p === "Critical"
    ? "bg-destructive text-destructive-foreground border-destructive"
    : p === "High"
    ? "bg-amber-500 text-white border-amber-500"
    : p === "Medium"
    ? "bg-blue-600 text-white border-blue-600"
    : "bg-muted text-muted-foreground";

const statusClass = (s: WorkItem["status"]) =>
  ["Completed", "Closed"].includes(s)
    ? "text-emerald-600"
    : ["Blocked", "Reopened", "More Information Required"].includes(s)
    ? "text-destructive"
    : ["Testing", "Awaiting Approval"].includes(s)
    ? "text-amber-600"
    : s === "Cancelled" || s === "Request Created"
    ? "text-muted-foreground"
    : "text-blue-600";

const healthClass = (s: HealthState) =>
  s === "Operational"
    ? "text-emerald-600 border-emerald-600/40 bg-emerald-600/5"
    : s === "Degraded"
    ? "text-amber-600 border-amber-600/40 bg-amber-600/5"
    : s === "Major Issue"
    ? "text-destructive border-destructive/40 bg-destructive/5"
    : s === "Under Maintenance"
    ? "text-blue-600 border-blue-600/40 bg-blue-600/5"
    : "text-muted-foreground border-border bg-muted/30";

const toneClass = (t: string) =>
  t === "good"
    ? "text-emerald-600"
    : t === "warn"
    ? "text-amber-600"
    : t === "bad"
    ? "text-destructive"
    : t === "info"
    ? "text-blue-600"
    : "text-muted-foreground";

function MiniGrid({
  rows,
}: {
  rows: { label: string; value: number; tone: string }[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-md border p-2.5">
          <div className={`text-xl font-bold tabular-nums ${toneClass(r.tone)}`}>{r.value}</div>
          <div className="text-[11px] text-muted-foreground leading-tight">{r.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- dashboard -------------------------------- */

export function DevDashboard() {
  const [availability, setAvailability] = useState("Available");
  const [work, setWork] = useState<WorkItem[]>(WORK);
  const [detail, setDetail] = useState<WorkItem | null>(null);
  const [infoFor, setInfoFor] = useState<WorkItem | null>(null);
  const [infoText, setInfoText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [log, setLog] = useState(AUDIT_LOG);

  const notify = (msg: string, entry?: string) => {
    setToast(msg);
    if (entry) setLog((l) => [{ at: "Just now", who: "Developer", what: entry }, ...l]);
    setTimeout(() => setToast(null), 3500);
  };

  const ordered = useMemo(
    () =>
      [...work]
        .filter((w) => !["Completed", "Closed", "Cancelled"].includes(w.status))
        .sort((a, b) => reasonRank(a.reason) - reasonRank(b.reason)),
    [work]
  );

  const next = ordered[0];
  const queue = ordered.slice(1, 6);

  const kpis = [
    { label: "New Tickets", value: work.filter((w) => !w.acknowledged).length, tone: "warn" as const },
    { label: "Critical Issues", value: work.filter((w) => ["Emergency", "Critical"].includes(w.priority)).length, tone: "bad" as const },
    { label: "Tasks Due Today", value: work.filter((w) => w.deadline.startsWith("Today")).length, tone: "warn" as const },
    { label: "Work in Progress", value: work.filter((w) => ["In Progress", "Accepted"].includes(w.status)).length },
    { label: "Waiting for Testing", value: work.filter((w) => w.status === "Testing").length, tone: "warn" as const },
    { label: "Store Setups Pending", value: 4, tone: "warn" as const },
    { label: "Releases Awaiting Approval", value: 1, tone: "warn" as const },
    { label: "Overdue Work", value: work.filter((w) => w.overdue).length, tone: "bad" as const },
  ];

  const advance = (item: WorkItem) => {
    setWork((ws) =>
      ws.map((w) =>
        w.id !== item.id
          ? w
          : {
              ...w,
              acknowledged: true,
              status:
                w.status === "Assigned" || w.status === "Request Created"
                  ? "Accepted"
                  : w.status === "Accepted" || w.status === "Reopened"
                  ? "In Progress"
                  : w.status === "In Progress"
                  ? "Testing"
                  : w.status === "Testing"
                  ? "Awaiting Approval"
                  : w.status,
            }
      )
    );
    notify(`${item.id} moved forward in the shared work record.`, `Status change on ${item.id}`);
  };

  const returnWork = () => {
    if (!infoFor || infoText.trim().length < 5) return;
    setWork((ws) =>
      ws.map((w) =>
        w.id === infoFor.id
          ? { ...w, status: "More Information Required", nextAction: "Requester to provide information" }
          : w
      )
    );
    notify(`${infoFor.id} returned to requester with a reason.`, `Returned ${infoFor.id} for missing information`);
    setInfoFor(null);
    setInfoText("");
  };

  const quickActions = [
    { label: "Start Next Task", icon: Play, run: () => next && advance(next) },
    { label: "View Critical Tickets", icon: Siren, run: () => notify("Filtered to Emergency and Critical work.") },
    { label: "Open Store Setup", icon: MonitorSmartphone, run: () => notify("Opening Store & POS Setup.") },
    { label: "Add Bug", icon: Bug, run: () => notify("New bug will be linked to the original work record — no duplicate ticket.") },
    { label: "Submit for Testing", icon: TestTube2, run: () => next && advance(next) },
    { label: "Create Release Note", icon: Rocket, run: () => notify("Draft release note created. CTO approval required for production.") },
    { label: "Ask for Information", icon: HelpCircle, run: () => next && setInfoFor(next) },
    { label: "View Documentation", icon: FileText, run: () => notify("Opening Knowledge & Documentation.") },
  ];

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="rounded-lg border bg-background p-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {DEVELOPER}</h1>
          <p className="text-sm text-muted-foreground">
            {TODAY} · App &amp; POS Centre — work from CTO, Relationship Manager and Project Coordinator
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Available", "Working", "Off Duty"].map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => notify("6 unread notifications.")}>
            <Bell className="h-4 w-4" />
          </Button>
          <Button onClick={() => next && advance(next)}>
            <Play className="h-4 w-4 mr-1" /> Start Next Task
          </Button>
          <Button variant="outline" onClick={() => notify("System issue reported to CTO with severity and system area.")}>
            <ShieldAlert className="h-4 w-4 mr-1" /> Report System Issue
          </Button>
        </div>
      </div>

      {toast && (
        <div className="rounded-md border border-blue-600/40 bg-blue-600/5 px-3 py-2 text-sm text-blue-700">
          {toast}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={String(k.value)} tone={k.tone} />
        ))}
      </div>

      {/* next priority work */}
      {next && (
        <Card className="border-2 border-destructive/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Siren className="h-4 w-4 text-destructive" /> Next Priority Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={priorityClass(next.priority)}>{next.priority}</Badge>
              <Badge variant="outline">{next.type}</Badge>
              <Badge variant="outline">{next.area}</Badge>
              <span className="text-xs text-muted-foreground">{next.id}</span>
            </div>
            <div>
              <div className="text-xl font-semibold leading-snug">{next.title}</div>
              <p className="text-sm text-destructive mt-1">Why now: {next.reason}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                ["Requested by", `${next.requestedBy}`],
                ["Source", next.source],
                ["Store / project", next.store ?? next.project ?? "—"],
                ["Module", next.area],
                ["Deadline", next.deadline],
                ["Current status", next.status],
                ["Next action", next.nextAction],
                ["Acknowledged", next.acknowledged ? "Yes" : "No — accept or return"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-md border p-2.5">
                  <div className="text-[11px] text-muted-foreground">{l}</div>
                  <div className="text-xs font-medium">{v}</div>
                </div>
              ))}
            </div>
            {next.missingInfo && (
              <div className="rounded-md border border-amber-600/40 bg-amber-600/5 p-3 text-xs text-amber-700">
                Missing information: {next.missingInfo.join(", ")}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => advance(next)}>
                <Play className="h-4 w-4 mr-1" /> Start Work
              </Button>
              <Button variant="outline" onClick={() => setDetail(next)}>
                View Details
              </Button>
              <Button variant="outline" onClick={() => setInfoFor(next)}>
                Return / Ask for Information
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today’s Work Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {queue.map((w) => (
            <div key={w.id} className="rounded-md border p-3 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">{w.title}</div>
                <div className="text-xs text-muted-foreground">
                  {w.id} · {w.source} · {w.store ?? w.project ?? "—"}
                </div>
                <div className="text-xs mt-1">
                  <span className={statusClass(w.status)}>{w.status}</span>
                  <span className="text-muted-foreground"> · Next: {w.nextAction}</span>
                </div>
              </div>
              <div className="shrink-0 text-right space-y-1">
                <Badge className={priorityClass(w.priority)}>{w.priority}</Badge>
                <div className="text-[11px] text-muted-foreground">Due {w.dueTime}</div>
                <Button size="sm" variant="outline" onClick={() => setDetail(w)}>
                  Open Work
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* attention alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Attention Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ALERTS.map((a) => (
            <div
              key={a.title}
              className={`rounded-md border p-3 ${
                a.level === "emergency"
                  ? "border-red-900/50 bg-red-900/5"
                  : a.level === "critical"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-amber-600/40 bg-amber-600/5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm font-medium ${
                    a.level === "emergency"
                      ? "text-red-900"
                      : a.level === "critical"
                      ? "text-destructive"
                      : "text-amber-700"
                  }`}
                >
                  {a.title}
                </span>
                {a.work && <Badge variant="outline">{a.work}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {quickActions.map((q) => (
            <Button key={q.label} variant="outline" className="justify-start h-auto py-2.5" onClick={q.run}>
              <q.icon className="h-4 w-4 mr-2 shrink-0" />
              <span className="text-xs text-left">{q.label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* system health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">System Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {SYSTEM_HEALTH.map((s) => (
              <div key={s.name} className={`rounded-md border p-3 ${healthClass(s.state)}`}>
                <div className="text-sm font-medium text-foreground">{s.name}</div>
                <div className="text-xs font-semibold">{s.state}</div>
                <div className="text-[11px] text-muted-foreground">{s.note}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Status shown from manual placeholders. Monitoring integrations are not connected yet.
          </p>
        </CardContent>
      </Card>

      {/* summaries */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Store &amp; POS Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <MiniGrid rows={SETUP_SUMMARY} />
            <p className="text-[11px] text-muted-foreground">
              Status only — passwords, tokens and secret keys are never displayed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bugs &amp; Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniGrid rows={BUG_SUMMARY} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Releases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <MiniGrid rows={RELEASE_SUMMARY} />
            <p className="text-[11px] text-muted-foreground">
              Production status requires CTO approval. High-risk releases cannot be self-approved.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* performance + audit */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance (calculated)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {PERFORMANCE.map((p) => (
              <div key={p.label} className="rounded-md border p-2.5">
                <div className="text-[11px] text-muted-foreground">{p.label}</div>
                <div className={`text-lg font-bold tabular-nums ${toneClass(p.tone)}`}>{p.value}</div>
                <div className="text-[11px] text-muted-foreground">{p.target}</div>
              </div>
            ))}
            <p className="col-span-2 text-[11px] text-muted-foreground">
              Figures come from work, testing, setup and release records and cannot be edited manually.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Access &amp; Configuration Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {log.slice(0, 8).map((l, i) => (
              <div key={`${l.at}-${i}`} className="rounded-md border p-2.5">
                <div className="text-xs font-medium">{l.what}</div>
                <div className="text-[11px] text-muted-foreground">
                  {l.who} · {l.at}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* details dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{detail?.title}</DialogTitle>
            <DialogDescription>
              {detail?.id} · permanent Work ID · shared technical-work record
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-xs">
              {[
                ["Request type", detail.type],
                ["System area", detail.area],
                ["Source", detail.source],
                ["Requested by", detail.requestedBy],
                ["Store / project", detail.store ?? detail.project ?? "—"],
                ["Priority", detail.priority],
                ["Reason for priority", detail.reason],
                ["Deadline", detail.deadline],
                ["Status", detail.status],
                ["Next action", detail.nextAction],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3 border-b pb-1">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                Customer and store contact details are masked. Escalation, testing and reopening update this
                same record — no duplicate ticket is created.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => detail && setInfoFor(detail)}>
              Ask for Information
            </Button>
            <Button
              onClick={() => {
                if (detail) advance(detail);
                setDetail(null);
              }}
            >
              Start / Move Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* return / more info dialog */}
      <Dialog open={!!infoFor} onOpenChange={(o) => !o && setInfoFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">Return work / ask for information</DialogTitle>
            <DialogDescription>
              {infoFor?.id} — a reason or missing-information list is required before returning work to{" "}
              {infoFor?.requestedBy}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="List the missing information or the reason for returning this work…"
            value={infoText}
            onChange={(e) => setInfoText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoFor(null)}>
              Cancel
            </Button>
            <Button disabled={infoText.trim().length < 5} onClick={returnWork}>
              Return to requester
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
