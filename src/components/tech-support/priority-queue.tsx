import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  Flame,
  History,
  MapPin,
  MonitorPlay,
  Phone,
  Play,
  ShieldAlert,
  StickyNote,
  Ticket as TicketIcon,
  UserCog,
  Wrench,
  Zap,
} from "lucide-react";
import { SEED, TICKET_WORKFLOW, type SupportTicket, type TicketStatus } from "./my-tickets";

/* ------------------------------------------------------------------ */
/* Ranking rules (transparent, rule-based — no AI)                     */
/* ------------------------------------------------------------------ */

type Rule = {
  key: string;
  weight: number;
  reason: string;
  test: (t: SupportTicket) => boolean;
};

const RULES: Rule[] = [
  {
    key: "safety",
    weight: 1000,
    reason: "Electrical / customer safety risk",
    test: (t) => t.safetyRisk,
  },
  {
    key: "breakdown",
    weight: 900,
    reason: "Complete machine breakdown",
    test: (t) => t.breakdown,
  },
  {
    key: "multi",
    weight: 800,
    reason: "Multiple machines affected",
    test: (t) => /multiple|two machines|both machines/i.test(t.description) || t.parts.length >= 2,
  },
  {
    key: "stopped",
    weight: 700,
    reason: "Customer operations completely stopped",
    test: (t) => t.breakdown && /unable|stopped|cannot process|not start/i.test(t.description),
  },
  {
    key: "overdue",
    weight: 600,
    reason: "Overdue SLA or promised callback",
    test: (t) => t.slaMinutesLeft < 0,
  },
  {
    key: "escalation",
    weight: 500,
    reason: "Urgent Field Engineer escalation required",
    test: (t) => t.status === "Escalation Required" || t.status === "Escalated to Field Engineer",
  },
  {
    key: "new",
    weight: 400,
    reason: "New ticket awaiting first response",
    test: (t) => t.status === "New" || t.status === "Assigned",
  },
  {
    key: "electrician",
    weight: 300,
    reason: "Electrician waiting for instructions",
    test: (t) => !!t.electrician && !t.electrician.confirmed,
  },
  {
    key: "reopened",
    weight: 200,
    reason: "Repeat / reopened complaint",
    test: (t) => t.reopened,
  },
  {
    key: "scheduled",
    weight: 100,
    reason: "Remaining scheduled work",
    test: () => true,
  },
];

const OPEN_STATUSES: TicketStatus[] = TICKET_WORKFLOW.filter(
  (s) => s !== "Closed" && s !== "Resolved",
) as TicketStatus[];

type Ranked = SupportTicket & { score: number; reasons: string[]; position: number };

function rank(tickets: SupportTicket[]): Ranked[] {
  return tickets
    .filter((t) => OPEN_STATUSES.includes(t.status))
    .map((t) => {
      const hits = RULES.filter((r) => r.test(t));
      const score = hits.reduce((a, r) => a + r.weight, 0) - Math.max(t.slaMinutesLeft, 0) / 100;
      return { ...t, score, reasons: hits.filter((h) => h.key !== "scheduled").map((h) => h.reason), position: 0 };
    })
    .sort((a, b) => b.score - a.score)
    .map((t, i) => ({ ...t, position: i + 1, reasons: t.reasons.length ? t.reasons : ["Remaining scheduled work"] }));
}

/* ------------------------------------------------------------------ */
/* Sections                                                           */
/* ------------------------------------------------------------------ */

const SECTIONS: { key: string; label: string; icon: React.ComponentType<{ className?: string }>; match: (t: Ranked) => boolean }[] = [
  { key: "immediate", label: "Immediate Attention", icon: ShieldAlert, match: (t) => t.safetyRisk },
  { key: "breakdown", label: "Critical Breakdowns", icon: Flame, match: (t) => !t.safetyRisk && t.breakdown },
  { key: "overdue", label: "Overdue", icon: AlertTriangle, match: (t) => !t.safetyRisk && !t.breakdown && t.slaMinutesLeft < 0 },
  {
    key: "new",
    label: "New Tickets",
    icon: TicketIcon,
    match: (t) => !t.safetyRisk && !t.breakdown && t.slaMinutesLeft >= 0 && (t.status === "New" || t.status === "Assigned"),
  },
  {
    key: "electrician",
    label: "Electrician Coordination Due",
    icon: UserCog,
    match: (t) => !t.safetyRisk && !t.breakdown && !!t.electrician && !t.electrician.confirmed,
  },
  {
    key: "followup",
    label: "Follow-ups Due Today",
    icon: CalendarClock,
    match: (t) =>
      !t.safetyRisk &&
      !t.breakdown &&
      t.status !== "Monitoring" &&
      t.slaMinutesLeft >= 0 &&
      t.status !== "New" &&
      t.status !== "Assigned" &&
      (t.nextActionDue || "").startsWith("Today"),
  },
  { key: "monitoring", label: "Monitoring Required", icon: MonitorPlay, match: (t) => t.status === "Monitoring" },
];

function bucketOf(t: Ranked) {
  const found = SECTIONS.find((s) => s.match(t));
  return found ? found.key : "followup";
}

/* ------------------------------------------------------------------ */
/* Outcomes                                                           */
/* ------------------------------------------------------------------ */

const OUTCOMES = [
  "Customer Contacted",
  "Remote Troubleshooting Started",
  "Issue Resolved Remotely",
  "Awaiting Customer Information",
  "Electrician Required",
  "Electrician Visit Scheduled",
  "Monitoring Required",
  "Field Engineer Required",
  "Customer Unreachable",
  "Ticket Resolved",
] as const;
type Outcome = (typeof OUTCOMES)[number];

const OUTCOME_STATUS: Record<Outcome, TicketStatus> = {
  "Customer Contacted": "Contacting Customer",
  "Remote Troubleshooting Started": "Troubleshooting",
  "Issue Resolved Remotely": "Resolved",
  "Awaiting Customer Information": "Awaiting Customer",
  "Electrician Required": "Awaiting Electrician",
  "Electrician Visit Scheduled": "Electrician Visit Scheduled",
  "Monitoring Required": "Monitoring",
  "Field Engineer Required": "Escalated to Field Engineer",
  "Customer Unreachable": "Contacting Customer",
  "Ticket Resolved": "Resolved",
};

/* ------------------------------------------------------------------ */
/* Visual helpers                                                     */
/* ------------------------------------------------------------------ */

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

function tone(t: Ranked | SupportTicket) {
  if (t.safetyRisk) return { border: "border-l-red-900", chip: "bg-red-900 text-white", label: "Safety-critical" };
  if (t.breakdown || t.slaMinutesLeft < 0)
    return { border: "border-l-red-600", chip: "bg-red-600 text-white", label: t.breakdown ? "Complete breakdown" : "Overdue SLA" };
  if (t.slaMinutesLeft <= 60)
    return { border: "border-l-amber-500", chip: "bg-amber-500 text-white", label: "Due within 1 hour" };
  if (t.status === "Resolved" || t.status === "Closed")
    return { border: "border-l-emerald-600", chip: "bg-emerald-600 text-white", label: "Resolved" };
  return { border: "border-l-blue-500", chip: "bg-blue-500 text-white", label: "Scheduled work" };
}

function sinceReported(assignedAt: string) {
  const m = assignedAt.match(/(\d{1,2}):(\d{2})/);
  if (!m) return assignedAt;
  const d = new Date();
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  if (/yesterday/i.test(assignedAt)) d.setDate(d.getDate() - 1);
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return h < 24 ? `${h} h ${mins % 60} m ago` : `${Math.floor(h / 24)} d ${h % 24} h ago`;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function TechSupportPriorityQueue() {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED);
  const [workId, setWorkId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { type: "outcome" | "note" | "electrician" | "followup" | "escalate" | "resolve" | "status"; id: string }>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const queue = useMemo(() => rank(tickets), [tickets]);
  const working = tickets.find((t) => t.id === workId) ?? null;
  const dialogTicket = tickets.find((t) => t.id === dialog?.id) ?? null;

  const update = (id: string, fn: (t: SupportTicket) => SupportTicket) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));

  const log = (id: string, text: string, kind: SupportTicket["timeline"][number]["kind"] = "note") =>
    update(id, (t) => ({
      ...t,
      lastActivity: `Just now — ${text}`,
      inactiveHours: 0,
      timeline: [...t.timeline, { at: now(), by: "You", text, kind }],
    }));

  const stats = useMemo(() => {
    const critical = queue.filter((t) => t.safetyRisk || t.breakdown).length;
    return {
      critical,
      overdue: queue.filter((t) => t.slaMinutesLeft < 0).length,
      dueHour: queue.filter((t) => t.slaMinutesLeft >= 0 && t.slaMinutesLeft <= 60).length,
      remaining: queue.length,
    };
  }, [queue]);

  const openDialog = (type: NonNullable<typeof dialog>["type"], id: string) => {
    setDialog({ type, id });
    setForm({});
  };

  const startWork = (id: string) => {
    setWorkId(id);
    update(id, (t) => ({
      ...t,
      status: t.status === "New" || t.status === "Assigned" ? "Contacting Customer" : t.status,
      nextAction: t.nextAction || "Contact customer and confirm symptoms",
      nextActionDue: t.nextActionDue || "Today, 18:00",
    }));
    log(id, "Work started from Priority Queue", "status");
  };

  const startNext = () => {
    if (!queue.length) return toast.info("Queue is clear for today.");
    startWork(queue[0].id);
    toast.success(`Started ${queue[0].id} — ${queue[0].reasons[0]}`);
  };

  const submit = () => {
    if (!dialog || !dialogTicket) return;
    const id = dialog.id;
    switch (dialog.type) {
      case "outcome": {
        const outcome = form.outcome as Outcome | undefined;
        if (!outcome) return toast.error("Select an outcome");
        if (!form.summary?.trim()) return toast.error("Add a short summary of what was done");
        if (outcome === "Ticket Resolved" || outcome === "Issue Resolved Remotely") {
          setDialog({ type: "resolve", id });
          setForm({});
          return toast.info("Resolution details are required");
        }
        if (outcome === "Field Engineer Required") {
          setDialog({ type: "escalate", id });
          setForm({});
          return toast.info("Escalation details are required");
        }
        if (outcome === "Electrician Required" || outcome === "Electrician Visit Scheduled") {
          setDialog({ type: "electrician", id });
          setForm({});
          return toast.info("Electrician details are required");
        }
        const nextAction =
          outcome === "Customer Unreachable"
            ? "Second contact attempt with customer"
            : outcome === "Awaiting Customer Information"
              ? "Follow up for photos / information"
              : outcome === "Monitoring Required"
                ? "Check machine status after monitoring period"
                : form.next || "Continue troubleshooting";
        const due = form.due || (outcome === "Customer Unreachable" ? "Today, +2 h" : "Today, 18:00");
        update(id, (t) => ({
          ...t,
          status: OUTCOME_STATUS[outcome],
          nextAction,
          nextActionDue: due,
        }));
        log(id, `${outcome} — ${form.summary}`, "status");
        toast.success(
          outcome === "Customer Unreachable"
            ? "Another contact attempt created"
            : `${outcome} recorded — My Support Tickets, Dashboard and Performance updated`,
        );
        break;
      }
      case "note":
        if (!form.note?.trim()) return toast.error("Add a note first");
        update(id, (t) => ({ ...t, internalNotes: [...t.internalNotes, form.note] }));
        log(id, "Internal note added");
        toast.success("Note added");
        break;
      case "status":
        if (!form.status) return toast.error("Pick a status");
        if (!form.next?.trim() || !form.due?.trim()) return toast.error("Next action and due time are required");
        update(id, (t) => ({ ...t, status: form.status as TicketStatus, nextAction: form.next, nextActionDue: form.due }));
        log(id, `Status changed to ${form.status}`, "status");
        toast.success("Status updated");
        break;
      case "electrician":
        if (!form.name?.trim() || !form.visit?.trim()) return toast.error("Electrician name and visit slot are required");
        update(id, (t) => ({
          ...t,
          status: "Electrician Visit Scheduled",
          electrician: { name: form.name, phone: form.phone || "—", visit: form.visit, confirmed: false, workDone: form.work },
          nextAction: "Confirm electrician visit",
          nextActionDue: form.visit,
        }));
        log(id, `Electrician ${form.name} coordinated for ${form.visit}`, "electrician");
        toast.success("Electrician Coordination updated");
        break;
      case "followup":
        if (!form.what?.trim() || !form.when?.trim()) return toast.error("Follow-up action and time are required");
        update(id, (t) => ({ ...t, nextAction: form.what, nextActionDue: form.when }));
        log(id, `Follow-up scheduled for ${form.when}`);
        toast.success("Follow-ups & Reminders updated");
        break;
      case "escalate":
        if (!form.reason?.trim() || !form.done?.trim() || !form.fault?.trim() || !form.contact?.trim())
          return toast.error("Reason, troubleshooting done, suspected fault and site contact are required");
        update(id, (t) => ({
          ...t,
          status: "Escalated to Field Engineer",
          fieldEngineer: form.engineer || "Field Engineer — Suresh Rathore",
          nextAction: "Field Engineer site visit",
          nextActionDue: form.availability || "Today, 18:00",
          troubleshooting: { ...t.troubleshooting, suspectedCause: form.fault },
        }));
        log(id, `Escalated to Field Engineer — ${form.reason}`, "status");
        toast.success("Escalation created on the same ticket record");
        break;
      case "resolve":
        if (!form.root?.trim() || !form.work?.trim() || form.confirm !== "yes")
          return toast.error("Root cause, work completed and customer confirmation are required");
        update(id, (t) => ({
          ...t,
          status: form.monitoring && form.monitoring !== "none" ? "Monitoring" : "Resolved",
          nextAction: form.monitoring && form.monitoring !== "none" ? `Monitor for ${form.monitoring}` : "Await closure review",
          nextActionDue: "Tomorrow, 12:00",
          troubleshooting: { ...t.troubleshooting, suspectedCause: form.root, resolution: form.work },
          customerUpdates: [...t.customerUpdates, form.work],
        }));
        log(id, `Resolution recorded — ${form.root}`, "status");
        toast.success("Resolved — Dashboard and Performance updated");
        if (workId === id) setWorkId(null);
        break;
    }
    setDialog(null);
    setForm({});
  };

  /* ------------------------------ UI ------------------------------- */
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">Priority Queue</h1>
          <p className="text-sm text-muted-foreground">
            Rule-based working order — highest risk and oldest promise first.
          </p>
        </div>
        <Button onClick={startNext} className="shrink-0">
          <Play className="w-4 h-4 mr-1" /> Start Next Ticket
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Critical Tickets", value: stats.critical, icon: Flame, tone: "text-red-600" },
          { label: "Overdue Tickets", value: stats.overdue, icon: AlertTriangle, tone: "text-red-600" },
          { label: "Due Within One Hour", value: stats.dueHour, icon: Clock, tone: "text-amber-600" },
          { label: "Tickets Remaining Today", value: stats.remaining, icon: TicketIcon, tone: "text-primary" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <Icon className={`w-4 h-4 ${s.tone}`} />
                </div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rule legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Priority rules applied (in order)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {RULES.map((r, i) => (
            <span key={r.key} className="text-xs rounded-full border px-2 py-1 bg-muted/40">
              {i + 1}. {r.reason}
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Queue sections */}
      {SECTIONS.map((s) => {
        const items = queue.filter((t) => bucketOf(t) === s.key);
        if (!items.length) return null;
        const Icon = s.icon;
        return (
          <div key={s.key} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</h2>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {items.map((t) => {
                const tn = tone(t);
                return (
                  <Card key={t.id} className={`border-l-4 ${tn.border}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {t.position}
                        </span>
                        <Badge className={tn.chip}>{tn.label}</Badge>
                        <Badge variant="outline">{t.priority}</Badge>
                        <span className="font-semibold">{t.id}</span>
                        <Badge variant="outline" className="ml-auto">{t.status}</Badge>
                      </div>

                      <div>
                        <div className="font-medium text-sm">{t.summary}</div>
                        <div className="text-xs text-muted-foreground">{t.customer} · {t.franchise}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</span>
                        <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{t.machine} · {t.model}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Reported {sinceReported(t.assignedAt)}</span>
                        <span className={`flex items-center gap-1 ${t.slaMinutesLeft < 0 ? "text-red-600 font-semibold" : t.slaMinutesLeft <= 60 ? "text-amber-600 font-semibold" : ""}`}>
                          <AlertTriangle className="w-3 h-3" />
                          SLA {t.slaMinutesLeft < 0 ? `overdue ${Math.abs(t.slaMinutesLeft)}m` : t.slaDeadline}
                        </span>
                      </div>

                      <div className="rounded-md bg-muted/50 p-2 text-xs space-y-1">
                        <div><span className="font-medium">Why now:</span> {t.reasons.join(" · ")}</div>
                        <div>
                          <span className="font-medium">Next action:</span>{" "}
                          {t.nextAction ? `${t.nextAction}${t.nextActionDue ? ` · ${t.nextActionDue}` : ""}` : <span className="text-orange-600">Not set — set one now</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => startWork(t.id)}><Play className="w-3.5 h-3.5 mr-1" />Start Work</Button>
                        <Button size="sm" variant="outline" onClick={() => { log(t.id, `Call logged with ${t.customer}`, "call"); openDialog("outcome", t.id); }}>
                          <Phone className="w-3.5 h-3.5 mr-1" />Call Customer
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setWorkId(t.id)}><Eye className="w-3.5 h-3.5 mr-1" />View Ticket</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {queue.length === 0 && (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Queue is clear — no open tickets.</CardContent></Card>
      )}

      {/* Work mode */}
      <Sheet open={!!working} onOpenChange={(o) => !o && setWorkId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {working && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  Work Mode · {working.id}
                  <Badge className={tone(working).chip}>{tone(working).label}</Badge>
                </SheetTitle>
                <SheetDescription>{working.summary}</SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-8 space-y-5 text-sm">
                {working.safetyRisk && (
                  <div className="rounded-md bg-red-900 text-white text-xs px-3 py-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> Safety warning: keep the machine switched off until an electrician clears it.
                  </div>
                )}

                <Block title="Customer & site">
                  <Row k="Customer" v={working.customer} />
                  <Row k="Franchise" v={working.franchise} />
                  <Row k="Contact" v={working.contact} />
                  <Row k="Location" v={working.location} />
                </Block>

                <Block title="Machine details">
                  <Row k="Machine" v={`${working.machine} · ${working.model}`} />
                  <Row k="Serial" v={working.serial} />
                  <Row k="Warranty" v={working.warranty} />
                  <Row k="Category" v={working.category} />
                </Block>

                <Block title="Reported symptoms & error code">
                  <Row k="Symptoms" v={working.troubleshooting.symptoms || working.description} />
                  <Row k="Error code" v={working.troubleshooting.errorCode || "—"} />
                </Block>

                <Block title="Previous service history">
                  {working.history.length ? working.history.map((h) => (
                    <div key={h.date} className="text-xs flex items-center gap-2"><History className="w-3 h-3 text-muted-foreground" />{h.date} — {h.text}</div>
                  )) : <p className="text-xs text-muted-foreground">No previous service records.</p>}
                </Block>

                <Block title="Photos, videos & documents">
                  {working.attachments.length ? (
                    <div className="flex flex-wrap gap-2">
                      {working.attachments.map((a) => (
                        <span key={a.name} className="text-xs rounded border px-2 py-1 bg-muted/40">{a.name}</span>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground">No media uploaded yet.</p>}
                </Block>

                <Block title="Troubleshooting checklist">
                  <div className="space-y-2">
                    {working.checklist.map((c, i) => (
                      <label key={c.label} className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={c.done}
                          onCheckedChange={(v) =>
                            update(working.id, (t) => ({
                              ...t,
                              checklist: t.checklist.map((x, xi) => (xi === i ? { ...x, done: !!v } : x)),
                            }))
                          }
                        />
                        <span className={c.done ? "line-through text-muted-foreground" : ""}>{c.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 p-2 text-xs">
                    <span className="font-medium">Next recommended step:</span>{" "}
                    {working.checklist.find((c) => !c.done)?.label ?? "All checks complete — record resolution or escalate."}
                  </div>
                </Block>

                <Block title="Previous notes & actions">
                  <div className="space-y-1">
                    {working.timeline.slice(-6).map((e, i) => (
                      <div key={i} className="text-xs flex gap-2">
                        <span className="text-muted-foreground w-12 shrink-0">{e.at}</span>
                        <span><span className="font-medium">{e.by}</span> — {e.text}</span>
                      </div>
                    ))}
                  </div>
                  {working.internalNotes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {working.internalNotes.map((n, i) => (
                        <div key={i} className="text-xs rounded bg-muted/50 px-2 py-1">{n}</div>
                      ))}
                    </div>
                  )}
                </Block>

                <Block title="Next action">
                  <Row k="Action" v={working.nextAction || "Not set"} />
                  <Row k="Due" v={working.nextActionDue || "—"} />
                </Block>

                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openDialog("note", working.id)}><StickyNote className="w-3.5 h-3.5 mr-1" />Add Note</Button>
                  <Button size="sm" variant="outline" onClick={() => openDialog("status", working.id)}>Update Status</Button>
                  <Button size="sm" variant="outline" onClick={() => openDialog("electrician", working.id)}><UserCog className="w-3.5 h-3.5 mr-1" />Electrician</Button>
                  <Button size="sm" variant="outline" onClick={() => openDialog("followup", working.id)}><CalendarClock className="w-3.5 h-3.5 mr-1" />Follow-up</Button>
                  <Button size="sm" variant="outline" onClick={() => openDialog("escalate", working.id)}><ArrowUpRight className="w-3.5 h-3.5 mr-1" />Escalate</Button>
                  <Button size="sm" onClick={() => openDialog("resolve", working.id)}><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Mark Resolved</Button>
                </div>
                <Button className="w-full" variant="secondary" onClick={() => openDialog("outcome", working.id)}>
                  Record action outcome (required)
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <Dialog open={!!dialog} onOpenChange={(o) => { if (!o) { setDialog(null); setForm({}); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {dialog && dialogTicket && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {dialog.type === "outcome" && "Record action outcome"}
                  {dialog.type === "note" && "Add note"}
                  {dialog.type === "status" && "Update status"}
                  {dialog.type === "electrician" && "Coordinate electrician"}
                  {dialog.type === "followup" && "Schedule follow-up"}
                  {dialog.type === "escalate" && "Escalate to Field Engineer"}
                  {dialog.type === "resolve" && "Mark resolved"}
                </DialogTitle>
                <DialogDescription>{dialogTicket.id} · {dialogTicket.franchise}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {dialog.type === "outcome" && (
                  <>
                    <Pick label="Outcome *" value={form.outcome} onChange={(v) => setForm({ ...form, outcome: v })} options={[...OUTCOMES]} />
                    <Field label="What was done *" area value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} />
                    <Field label="Next action" value={form.next} onChange={(v) => setForm({ ...form, next: v })} />
                    <Field label="Next action due" value={form.due} onChange={(v) => setForm({ ...form, due: v })} placeholder="Today, 18:00" />
                    <p className="text-xs text-muted-foreground">Every active ticket keeps a next action and due time. Unreachable customers automatically get another contact attempt.</p>
                  </>
                )}

                {dialog.type === "note" && <Field label="Note" area value={form.note} onChange={(v) => setForm({ ...form, note: v })} />}

                {dialog.type === "status" && (
                  <>
                    <Pick label="Status *" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[...TICKET_WORKFLOW]} />
                    <Field label="Next action *" value={form.next} onChange={(v) => setForm({ ...form, next: v })} />
                    <Field label="Due *" value={form.due} onChange={(v) => setForm({ ...form, due: v })} placeholder="Today, 18:00" />
                  </>
                )}

                {dialog.type === "electrician" && (
                  <>
                    <Field label="Electrician name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                    <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                    <Field label="Visit slot *" value={form.visit} onChange={(v) => setForm({ ...form, visit: v })} placeholder="Today, 16:00" />
                    <Field label="Work required" area value={form.work} onChange={(v) => setForm({ ...form, work: v })} />
                  </>
                )}

                {dialog.type === "followup" && (
                  <>
                    <Field label="Follow-up action *" value={form.what} onChange={(v) => setForm({ ...form, what: v })} />
                    <Field label="When *" value={form.when} onChange={(v) => setForm({ ...form, when: v })} placeholder="Tomorrow, 11:00" />
                  </>
                )}

                {dialog.type === "escalate" && (
                  <>
                    <Field label="Reason for escalation *" area value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} />
                    <Field label="Troubleshooting already completed *" area value={form.done} onChange={(v) => setForm({ ...form, done: v })} />
                    <Field label="Suspected fault *" value={form.fault} onChange={(v) => setForm({ ...form, fault: v })} />
                    <Field label="Parts / tools likely required" value={form.parts} onChange={(v) => setForm({ ...form, parts: v })} />
                    <Field label="Site contact *" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
                    <Field label="Customer availability" value={form.availability} onChange={(v) => setForm({ ...form, availability: v })} />
                    <Pick label="Urgency" value={form.urgency} onChange={(v) => setForm({ ...form, urgency: v })} options={["Immediate", "High", "Normal"]} />
                    <p className="text-xs text-muted-foreground">The Field Engineer receives this same ticket with its full history — no duplicate ticket is created.</p>
                  </>
                )}

                {dialog.type === "resolve" && (
                  <>
                    <Field label="Root cause *" value={form.root} onChange={(v) => setForm({ ...form, root: v })} />
                    <Field label="Work completed *" area value={form.work} onChange={(v) => setForm({ ...form, work: v })} />
                    <Pick label="Customer confirmation *" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} options={["yes", "no"]} labels={{ yes: "Customer confirmed", no: "Not confirmed" }} />
                    <Pick label="Monitoring period" value={form.monitoring} onChange={(v) => setForm({ ...form, monitoring: v })} options={["none", "24 hours", "48 hours", "7 days"]} labels={{ none: "Not required" }} />
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialog(null); setForm({}); }}>Cancel</Button>
                <Button onClick={submit}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                    */
/* ------------------------------------------------------------------ */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  area,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  area?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {area ? (
        <Textarea rows={3} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function Pick({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{labels?.[o] ?? o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
