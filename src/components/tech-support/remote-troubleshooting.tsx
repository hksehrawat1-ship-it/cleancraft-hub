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
import { Progress } from "@/components/ui/progress";
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
  Camera,
  CheckCircle2,
  Clock,
  MonitorPlay,
  Phone,
  Play,
  ShieldAlert,
  StickyNote,
  UserCog,
  Wrench,
  MapPin,
} from "lucide-react";
import { SEED, type SupportTicket } from "./my-tickets";

/* ------------------------------------------------------------------ */
/* Session model                                                       */
/* ------------------------------------------------------------------ */

const SAFETY_QUESTIONS = [
  "Is there smoke, burning smell or sparking?",
  "Is there water near electrical components?",
  "Is anyone at risk of electric shock?",
  "Is the machine overheating?",
  "Is there unusual noise or vibration?",
  "Is emergency shutdown required?",
];

const STEPS = [
  "Confirm power supply, voltage and MCB status",
  "Read error code from display and note it",
  "Check water / steam / air supply lines",
  "Verify machine settings and program selection",
  "Guide customer through controlled reset",
  "Run a short test cycle and observe behaviour",
  "Capture photos or video of the fault condition",
  "Conclude: resolved, monitoring, electrician or field visit",
];

type SessionState = "Active" | "Awaiting Customer Information" | "Monitoring" | "Resolved Remotely" | "Escalated";

type Session = {
  id: string;
  ticketId: string;
  startedAt: string;
  state: SessionState;
  stepIndex: number;
  safety: Record<string, "yes" | "no" | undefined>;
  safetyRisk: boolean;
  symptoms: string;
  errorCode: string;
  media: string;
  warrantyChecked: boolean;
  identityVerified: boolean;
  customerAvailable: boolean;
  notes: { at: string; text: string }[];
  stepsDone: boolean[];
};

const newSteps = () => STEPS.map(() => false);

const SEED_SESSIONS: Session[] = [
  {
    id: "RS-311",
    ticketId: "TS-2041",
    startedAt: "Today, 09:05",
    state: "Active",
    stepIndex: 2,
    safety: { [SAFETY_QUESTIONS[0]]: "yes", [SAFETY_QUESTIONS[2]]: "yes", [SAFETY_QUESTIONS[5]]: "yes" },
    safetyRisk: true,
    symptoms: "Sparking and burning smell from control panel, MCB trips on second cycle.",
    errorCode: "E-42",
    media: "panel-burn-mark.jpg, sparking-clip.mp4",
    warrantyChecked: true,
    identityVerified: true,
    customerAvailable: true,
    notes: [
      { at: "09:06", text: "Safety risk confirmed — customer instructed to stop using the machine." },
      { at: "09:18", text: "Power disconnected safely by store staff. Panel inspection deferred to electrician." },
    ],
    stepsDone: newSteps().map((_, i) => i < 2),
  },
  {
    id: "RS-310",
    ticketId: "TS-2040",
    startedAt: "Today, 08:30",
    state: "Awaiting Customer Information",
    stepIndex: 4,
    safety: {},
    safetyRisk: false,
    symptoms: "Boiler not building pressure, gauge stays at 0 bar since morning.",
    errorCode: "P-01",
    media: "boiler-gauge.jpg",
    warrantyChecked: true,
    identityVerified: true,
    customerAvailable: true,
    notes: [
      { at: "08:35", text: "Water level and heating element continuity verified with customer." },
      { at: "09:10", text: "Requested photo of pressure switch wiring — awaiting customer." },
    ],
    stepsDone: newSteps().map((_, i) => i < 4),
  },
  {
    id: "RS-309",
    ticketId: "TS-2038",
    startedAt: "Yesterday, 17:20",
    state: "Monitoring",
    stepIndex: 7,
    safety: {},
    safetyRisk: false,
    symptoms: "Steam output drops after 15 minutes of continuous ironing.",
    errorCode: "—",
    media: "iron-station.jpg",
    warrantyChecked: true,
    identityVerified: true,
    customerAvailable: true,
    notes: [
      { at: "17:40", text: "Scale build-up identified; descaling procedure guided over call." },
      { at: "18:40", text: "Steam restored. 48-hour monitoring period started." },
    ],
    stepsDone: newSteps().map(() => true),
  },
  {
    id: "RS-308",
    ticketId: "TS-2035",
    startedAt: "Today, 08:20",
    state: "Resolved Remotely",
    stepIndex: 7,
    safety: {},
    safetyRisk: false,
    symptoms: "Solvent filter pressure rising within two cycles.",
    errorCode: "—",
    media: "",
    warrantyChecked: true,
    identityVerified: true,
    customerAvailable: true,
    notes: [{ at: "10:50", text: "Lint trap overload confirmed; cartridge replaced by store, cleaning schedule set." }],
    stepsDone: newSteps().map(() => true),
  },
];

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

function stateTone(s: SessionState) {
  switch (s) {
    case "Active":
      return "bg-blue-500 text-white";
    case "Awaiting Customer Information":
      return "bg-amber-500 text-white";
    case "Monitoring":
      return "bg-purple-500 text-white";
    case "Resolved Remotely":
      return "bg-emerald-600 text-white";
    default:
      return "bg-red-600 text-white";
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function RemoteTroubleshooting() {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED);
  const [sessions, setSessions] = useState<Session[]>(SEED_SESSIONS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [outcomeFor, setOutcomeFor] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [safety, setSafety] = useState<Record<string, "yes" | "no" | undefined>>({});
  const [note, setNote] = useState("");

  const ticketOf = (id: string) => tickets.find((t) => t.id === id);
  const session = sessions.find((s) => s.id === openId) ?? null;
  const outcomeSession = sessions.find((s) => s.id === outcomeFor) ?? null;

  const updTicket = (id: string, fn: (t: SupportTicket) => SupportTicket) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));
  const updSession = (id: string, fn: (s: Session) => Session) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? fn(s) : s)));

  const logTicket = (id: string, text: string, kind: SupportTicket["timeline"][number]["kind"] = "note") =>
    updTicket(id, (t) => ({
      ...t,
      lastActivity: `Just now — ${text}`,
      timeline: [...t.timeline, { at: now(), by: "You", text, kind }],
    }));

  const stats = useMemo(
    () => ({
      active: sessions.filter((s) => s.state === "Active").length,
      awaiting: sessions.filter((s) => s.state === "Awaiting Customer Information").length,
      monitoring: sessions.filter((s) => s.state === "Monitoring").length,
      resolvedToday: sessions.filter((s) => s.state === "Resolved Remotely" && s.startedAt.startsWith("Today")).length,
    }),
    [sessions],
  );

  const openTickets = tickets.filter(
    (t) => t.status !== "Closed" && t.status !== "Resolved" && !sessions.some((s) => s.ticketId === t.id && s.state === "Active"),
  );

  const safetyRiskFlagged = Object.entries(safety).some(([, v]) => v === "yes");
  const answeredAll = SAFETY_QUESTIONS.every((q) => safety[q] === "yes" || safety[q] === "no");

  const startSession = () => {
    const t = ticketOf(form.ticketId ?? "");
    if (!t) return toast.error("Select an assigned ticket");
    if (form.available !== "yes") return toast.error("Confirm the customer is available before starting");
    if (form.identity !== "yes") return toast.error("Verify the machine identity (model & serial)");
    if (form.warranty !== "yes") return toast.error("Review warranty / service-contract status");
    if (!form.symptoms?.trim()) return toast.error("Record the reported symptoms");
    if (!answeredAll) return toast.error("Answer all six safety questions");

    const id = `RS-${312 + sessions.length}`;
    const risk = safetyRiskFlagged;
    setSessions((prev) => [
      {
        id,
        ticketId: t.id,
        startedAt: `Today, ${now()}`,
        state: "Active",
        stepIndex: 0,
        safety,
        safetyRisk: risk,
        symptoms: form.symptoms,
        errorCode: form.errorCode || "—",
        media: form.media || "",
        warrantyChecked: true,
        identityVerified: true,
        customerAvailable: true,
        notes: risk
          ? [{ at: now(), text: "Safety risk confirmed — customer instructed to stop using the machine and disconnect power only when safe." }]
          : [],
        stepsDone: newSteps(),
      },
      ...prev,
    ]);

    updTicket(t.id, (x) => ({
      ...x,
      status: "Troubleshooting",
      priority: risk ? "Safety Critical" : x.priority,
      safetyRisk: risk || x.safetyRisk,
      nextAction: risk ? "Arrange electrician / field inspection after power isolation" : "Complete remote troubleshooting steps",
      nextActionDue: "Today, 18:00",
      troubleshooting: { ...x.troubleshooting, symptoms: form.symptoms, errorCode: form.errorCode || x.troubleshooting.errorCode },
    }));
    logTicket(t.id, `Remote troubleshooting session ${id} started${risk ? " — safety risk confirmed, ticket marked Critical" : ""}`, "status");

    setStartOpen(false);
    setForm({});
    setSafety({});
    setOpenId(id);
    toast[risk ? "warning" : "success"](
      risk ? "Safety risk confirmed — ticket marked Safety Critical" : "Session started",
    );
  };

  const submitOutcome = () => {
    if (!outcomeSession) return;
    const t = ticketOf(outcomeSession.ticketId);
    if (!t) return;
    const outcome = form.outcome;
    if (!outcome) return toast.error("Select a session outcome");
    if (!form.summary?.trim()) return toast.error("Summarise what was done");

    if (outcome === "Resolved remotely") {
      if (!form.root?.trim() || form.confirm !== "yes")
        return toast.error("Root cause and customer confirmation are required");
      updSession(outcomeSession.id, (s) => ({ ...s, state: "Resolved Remotely" }));
      updTicket(t.id, (x) => ({
        ...x,
        status: "Resolved",
        nextAction: "Await closure review",
        nextActionDue: "Today, 18:00",
        troubleshooting: { ...x.troubleshooting, suspectedCause: form.root, resolution: form.summary },
        customerUpdates: [...x.customerUpdates, form.summary],
      }));
      logTicket(t.id, `Resolved remotely — ${form.root}`, "status");
      toast.success("Resolved remotely — My Support Tickets, Dashboard and Performance updated");
    } else if (outcome === "Awaiting customer information") {
      updSession(outcomeSession.id, (s) => ({ ...s, state: "Awaiting Customer Information" }));
      updTicket(t.id, (x) => ({
        ...x,
        status: "Awaiting Customer",
        nextAction: form.next || "Follow up for photos / information",
        nextActionDue: form.due || "Today, 18:00",
      }));
      logTicket(t.id, `Awaiting customer information — ${form.summary}`, "customer");
      toast.success("Follow-up recorded in Follow-ups & Reminders");
    } else if (outcome === "Electrician required") {
      updSession(outcomeSession.id, (s) => ({ ...s, state: "Escalated" }));
      updTicket(t.id, (x) => ({
        ...x,
        status: "Awaiting Electrician",
        nextAction: "Coordinate electrician visit",
        nextActionDue: form.due || "Today, 17:00",
      }));
      logTicket(t.id, `Electrician required — ${form.summary}`, "electrician");
      toast.success("Electrician Coordination updated");
    } else if (outcome === "Monitoring required") {
      updSession(outcomeSession.id, (s) => ({ ...s, state: "Monitoring" }));
      updTicket(t.id, (x) => ({
        ...x,
        status: "Monitoring",
        nextAction: `Check machine status after ${form.period || "48 hours"}`,
        nextActionDue: "Tomorrow, 12:00",
      }));
      logTicket(t.id, `Monitoring started — ${form.summary}`, "status");
      toast.success("Monitoring period started");
    } else if (outcome === "Field Engineer required") {
      if (!form.fault?.trim()) return toast.error("Suspected fault is required for escalation");
      updSession(outcomeSession.id, (s) => ({ ...s, state: "Escalated" }));
      updTicket(t.id, (x) => ({
        ...x,
        status: "Escalated to Field Engineer",
        fieldEngineer: "Field Engineer — Suresh Rathore",
        nextAction: "Field Engineer site visit",
        nextActionDue: form.due || "Today, 18:00",
        troubleshooting: { ...x.troubleshooting, suspectedCause: form.fault },
      }));
      logTicket(t.id, `Escalated to Field Engineer — ${form.summary}`, "status");
      toast.success("Escalated on the same ticket record — no duplicate created");
    } else if (outcome === "Customer unreachable") {
      updSession(outcomeSession.id, (s) => ({ ...s, state: "Awaiting Customer Information" }));
      updTicket(t.id, (x) => ({
        ...x,
        status: "Contacting Customer",
        nextAction: "Second contact attempt with customer",
        nextActionDue: form.due || "Today, +2 h",
      }));
      logTicket(t.id, "Customer unreachable — second contact attempt scheduled", "call");
      toast.success("Another contact attempt created");
    }

    setOutcomeFor(null);
    setForm({});
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">Remote Troubleshooting</h1>
          <p className="text-sm text-muted-foreground">
            Safe, structured diagnosis before involving an electrician or Field Engineer.
          </p>
        </div>
        <Button className="shrink-0" onClick={() => { setStartOpen(true); setForm({}); setSafety({}); }}>
          <Play className="w-4 h-4 mr-1" /> Start Troubleshooting
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Sessions", value: stats.active, icon: MonitorPlay, tone: "text-blue-600" },
          { label: "Awaiting Customer Information", value: stats.awaiting, icon: Clock, tone: "text-amber-600" },
          { label: "Monitoring", value: stats.monitoring, icon: AlertTriangle, tone: "text-purple-600" },
          { label: "Resolved Remotely Today", value: stats.resolvedToday, icon: CheckCircle2, tone: "text-emerald-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <Icon className={`w-4 h-4 shrink-0 ${s.tone}`} />
                </div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Session cards */}
      <div className="grid gap-3 xl:grid-cols-2">
        {sessions.map((s) => {
          const t = ticketOf(s.ticketId);
          if (!t) return null;
          const border = s.safetyRisk
            ? "border-l-red-900"
            : s.state === "Awaiting Customer Information"
              ? "border-l-amber-500"
              : s.state === "Resolved Remotely"
                ? "border-l-emerald-600"
                : s.state === "Escalated"
                  ? "border-l-red-600"
                  : "border-l-blue-500";
          const done = s.stepsDone.filter(Boolean).length;
          return (
            <Card key={s.id} className={`border-l-4 ${border}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{t.id}</span>
                  <Badge className={stateTone(s.state)}>{s.state}</Badge>
                  <Badge variant="outline">{t.priority}</Badge>
                  {s.safetyRisk && (
                    <Badge className="bg-red-900 text-white flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Safety risk
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{s.id}</span>
                </div>

                <div>
                  <div className="text-sm font-medium">{s.symptoms}</div>
                  <div className="text-xs text-muted-foreground">{t.customer} · {t.franchise}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</span>
                  <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{t.machine} · {t.model}</span>
                  <span>Serial: {t.serial}</span>
                  <span>Error code: {s.errorCode}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Started {s.startedAt}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{t.contact}</span>
                </div>

                <div className="rounded-md bg-muted/50 p-2 text-xs space-y-1">
                  <div><span className="font-medium">Current step:</span> {STEPS[Math.min(s.stepIndex, STEPS.length - 1)]}</div>
                  <Progress value={(done / STEPS.length) * 100} className="h-1.5" />
                  <div className="text-muted-foreground">{done} of {STEPS.length} checks complete</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setOpenId(s.id)}>
                    <MonitorPlay className="w-3.5 h-3.5 mr-1" /> Resume Session
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { logTicket(t.id, `Call logged with ${t.customer}`, "call"); toast.success("Call logged"); }}>
                    <Phone className="w-3.5 h-3.5 mr-1" /> Call Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Session workspace */}
      <Sheet open={!!session} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {session && ticketOf(session.ticketId) && (() => {
            const t = ticketOf(session.ticketId)!;
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex flex-wrap items-center gap-2">
                    {session.id} · {t.id}
                    <Badge className={stateTone(session.state)}>{session.state}</Badge>
                  </SheetTitle>
                  <SheetDescription>{t.franchise} · {t.machine} {t.model}</SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-8 space-y-5 text-sm">
                  {session.safetyRisk && (
                    <div className="rounded-md bg-red-900 text-white text-xs px-3 py-2 space-y-1">
                      <div className="flex items-center gap-2 font-medium"><ShieldAlert className="w-4 h-4 shrink-0" /> Safety risk confirmed</div>
                      <p>Customer instructed to stop using the machine and disconnect power only when safe. Ticket marked Safety Critical.</p>
                    </div>
                  )}

                  <Block title="Session details">
                    <Row k="Customer" v={t.customer} />
                    <Row k="Contact" v={t.contact} />
                    <Row k="Location" v={t.location} />
                    <Row k="Serial number" v={t.serial} />
                    <Row k="Warranty / contract" v={t.warranty} />
                    <Row k="Reported symptoms" v={session.symptoms} />
                    <Row k="Error code" v={session.errorCode} />
                    <Row k="Media on record" v={session.media || "None"} />
                    <Row k="Started" v={session.startedAt} />
                  </Block>

                  <Block title="Safety check answers">
                    <div className="space-y-1">
                      {SAFETY_QUESTIONS.map((q) => (
                        <div key={q} className="flex justify-between gap-3 text-xs">
                          <span className="text-muted-foreground">{q}</span>
                          <span className={session.safety[q] === "yes" ? "text-red-600 font-semibold" : ""}>
                            {session.safety[q] ? session.safety[q]!.toUpperCase() : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Block>

                  <Block title="Guided troubleshooting steps">
                    <div className="space-y-2">
                      {STEPS.map((step, i) => (
                        <label key={step} className="flex items-start gap-2 text-xs">
                          <Checkbox
                            checked={session.stepsDone[i]}
                            onCheckedChange={(v) =>
                              updSession(session.id, (s) => {
                                const stepsDone = s.stepsDone.map((x, xi) => (xi === i ? !!v : x));
                                const nextIdx = stepsDone.findIndex((x) => !x);
                                return { ...s, stepsDone, stepIndex: nextIdx === -1 ? STEPS.length - 1 : nextIdx };
                              })
                            }
                          />
                          <span className={session.stepsDone[i] ? "line-through text-muted-foreground" : ""}>{step}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 p-2 text-xs">
                      <span className="font-medium">Next recommended step:</span>{" "}
                      {STEPS[session.stepsDone.findIndex((x) => !x)] ?? "All checks complete — record the session outcome."}
                    </div>
                  </Block>

                  <Block title="Session log">
                    {session.notes.length ? session.notes.map((n, i) => (
                      <div key={i} className="text-xs flex gap-2">
                        <span className="text-muted-foreground w-12 shrink-0">{n.at}</span>
                        <span>{n.text}</span>
                      </div>
                    )) : <p className="text-xs text-muted-foreground">No entries yet.</p>}
                    <div className="mt-2 space-y-2">
                      <Textarea rows={2} value={note} placeholder="Record what the customer reported or what you guided..." onChange={(e) => setNote(e.target.value)} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!note.trim()) return toast.error("Write something first");
                          updSession(session.id, (s) => ({ ...s, notes: [...s.notes, { at: now(), text: note }] }));
                          logTicket(t.id, `Remote session note: ${note}`);
                          setNote("");
                          toast.success("Session note saved");
                        }}
                      >
                        <StickyNote className="w-3.5 h-3.5 mr-1" /> Add note
                      </Button>
                    </div>
                  </Block>

                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => { updTicket(t.id, (x) => ({ ...x, status: "Awaiting Customer", nextAction: "Follow up for photos / video", nextActionDue: "Today, 18:00" })); logTicket(t.id, "Photos / video requested from customer", "customer"); toast.success("Media request recorded"); }}>
                      <Camera className="w-3.5 h-3.5 mr-1" /> Request media
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setOutcomeFor(session.id); setForm({ outcome: "Electrician required" }); }}>
                      <UserCog className="w-3.5 h-3.5 mr-1" /> Electrician
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setOutcomeFor(session.id); setForm({ outcome: "Awaiting customer information" }); }}>
                      <CalendarClock className="w-3.5 h-3.5 mr-1" /> Follow-up
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setOutcomeFor(session.id); setForm({ outcome: "Field Engineer required" }); }}>
                      <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Escalate
                    </Button>
                    <Button size="sm" onClick={() => { setOutcomeFor(session.id); setForm({ outcome: "Resolved remotely" }); }}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolved remotely
                    </Button>
                  </div>
                  <Button className="w-full" variant="secondary" onClick={() => { setOutcomeFor(session.id); setForm({}); }}>
                    Close session with outcome (required)
                  </Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Start session dialog */}
      <Dialog open={startOpen} onOpenChange={(o) => { setStartOpen(o); if (!o) { setForm({}); setSafety({}); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start remote troubleshooting</DialogTitle>
            <DialogDescription>Complete the pre-checks and mandatory safety questions.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Pick
              label="Assigned ticket *"
              value={form.ticketId}
              onChange={(v) => setForm({ ...form, ticketId: v })}
              options={openTickets.map((t) => t.id)}
              labels={Object.fromEntries(openTickets.map((t) => [t.id, `${t.id} · ${t.franchise} · ${t.machine}`]))}
            />
            {form.ticketId && ticketOf(form.ticketId) && (
              <div className="rounded-md bg-muted/50 p-2 text-xs space-y-1">
                <Row k="Machine" v={`${ticketOf(form.ticketId)!.machine} · ${ticketOf(form.ticketId)!.model}`} />
                <Row k="Serial" v={ticketOf(form.ticketId)!.serial} />
                <Row k="Warranty" v={ticketOf(form.ticketId)!.warranty} />
                <Row k="Contact" v={ticketOf(form.ticketId)!.contact} />
              </div>
            )}
            <Pick label="Customer available now? *" value={form.available} onChange={(v) => setForm({ ...form, available: v })} options={["yes", "no"]} labels={{ yes: "Yes, on call", no: "No" }} />
            <Pick label="Machine identity verified (model & serial)? *" value={form.identity} onChange={(v) => setForm({ ...form, identity: v })} options={["yes", "no"]} labels={{ yes: "Verified", no: "Not verified" }} />
            <Pick label="Warranty / service status reviewed? *" value={form.warranty} onChange={(v) => setForm({ ...form, warranty: v })} options={["yes", "no"]} labels={{ yes: "Reviewed", no: "Not reviewed" }} />
            <Field label="Reported symptoms *" area value={form.symptoms} onChange={(v) => setForm({ ...form, symptoms: v })} />
            <Field label="Error code" value={form.errorCode} onChange={(v) => setForm({ ...form, errorCode: v })} placeholder="E-42" />
            <Field label="Photos / videos available" value={form.media} onChange={(v) => setForm({ ...form, media: v })} placeholder="panel.jpg, fault-clip.mp4" />

            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mandatory safety check</div>
              {SAFETY_QUESTIONS.map((q) => (
                <div key={q} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <span className="text-xs min-w-0">{q}</span>
                  <div className="flex gap-1 shrink-0">
                    {(["yes", "no"] as const).map((v) => (
                      <Button
                        key={v}
                        size="sm"
                        variant={safety[q] === v ? (v === "yes" ? "destructive" : "default") : "outline"}
                        onClick={() => setSafety({ ...safety, [q]: v })}
                      >
                        {v === "yes" ? "Yes" : "No"}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {safetyRiskFlagged && (
                <div className="rounded-md bg-red-900 text-white text-xs px-3 py-2">
                  Safety risk confirmed. Instruct the customer to stop using the machine immediately and disconnect power only when it is safe to do so.
                  This ticket will be marked <span className="font-semibold">Safety Critical</span> and prioritised.
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStartOpen(false)}>Cancel</Button>
            <Button onClick={startSession}>Start session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outcome dialog */}
      <Dialog open={!!outcomeFor} onOpenChange={(o) => { if (!o) { setOutcomeFor(null); setForm({}); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {outcomeSession && (
            <>
              <DialogHeader>
                <DialogTitle>Session outcome</DialogTitle>
                <DialogDescription>{outcomeSession.id} · {outcomeSession.ticketId}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <Pick
                  label="Outcome *"
                  value={form.outcome}
                  onChange={(v) => setForm({ ...form, outcome: v })}
                  options={[
                    "Resolved remotely",
                    "Awaiting customer information",
                    "Electrician required",
                    "Monitoring required",
                    "Field Engineer required",
                    "Customer unreachable",
                  ]}
                />
                <Field label="What was done *" area value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} />
                {form.outcome === "Resolved remotely" && (
                  <>
                    <Field label="Root cause *" value={form.root} onChange={(v) => setForm({ ...form, root: v })} />
                    <Pick label="Customer confirmation *" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} options={["yes", "no"]} labels={{ yes: "Customer confirmed", no: "Not confirmed" }} />
                  </>
                )}
                {form.outcome === "Monitoring required" && (
                  <Pick label="Monitoring period" value={form.period} onChange={(v) => setForm({ ...form, period: v })} options={["24 hours", "48 hours", "7 days"]} />
                )}
                {form.outcome === "Field Engineer required" && (
                  <Field label="Suspected fault *" value={form.fault} onChange={(v) => setForm({ ...form, fault: v })} />
                )}
                {form.outcome !== "Resolved remotely" && (
                  <>
                    <Field label="Next action" value={form.next} onChange={(v) => setForm({ ...form, next: v })} />
                    <Field label="Due" value={form.due} onChange={(v) => setForm({ ...form, due: v })} placeholder="Today, 18:00" />
                  </>
                )}
                <p className="text-xs text-muted-foreground">
                  Outcomes update the same ticket record — My Support Tickets, Electrician Coordination, Follow-ups, Dashboard and Performance stay in sync. No duplicate tickets are created.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setOutcomeFor(null); setForm({}); }}>Cancel</Button>
                <Button onClick={submitOutcome}>Save outcome</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
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
