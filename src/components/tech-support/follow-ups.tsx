import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  CalendarClock,
  CheckCircle2,
  Clock,
  Phone,
  Plus,
  RotateCcw,
  ShieldAlert,
  Ticket as TicketIcon,
  XCircle,
} from "lucide-react";
import { SEED } from "./my-tickets";

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export const FOLLOWUP_TYPES = [
  "Customer Callback",
  "Troubleshooting Follow-up",
  "Request Photos or Video",
  "Machine Monitoring",
  "Electrician Confirmation",
  "Electrician Visit Follow-up",
  "Spare-Part Update",
  "Field Engineer Handoff",
  "Resolution Confirmation",
  "Ticket Closure Confirmation",
] as const;

export const OUTCOMES = [
  "Customer Contacted",
  "Machine Working Normally",
  "Problem Continues",
  "Additional Troubleshooting Required",
  "Electrician Confirmed",
  "Electrician Visit Completed",
  "Awaiting Parts",
  "Field Engineer Required",
  "Monitoring Extended",
  "Ticket Ready for Closure",
  "Customer Unreachable",
] as const;

type FollowUpState =
  | "Overdue"
  | "Due Today"
  | "Upcoming"
  | "Awaiting Customer"
  | "Awaiting Electrician"
  | "Monitoring"
  | "Completed"
  | "Rescheduled"
  | "Cancelled";

export type FollowUp = {
  id: string;
  ticketId: string;
  type: (typeof FOLLOWUP_TYPES)[number];
  purpose: string;
  engineer: string;
  electrician?: string;
  dueLabel: string;
  /** minutes from now; negative = overdue */
  dueInMinutes: number;
  originalDue?: string;
  state: FollowUpState;
  notes: string;
  attempts: number;
  repeat?: string;
  lastActivity: string;
  history: string[];
};

const ENGINEERS = ["You (Amit Verma)", "Ravi Menon", "Sunil Kalra"];

const SEEDED: FollowUp[] = [
  {
    id: "FU-501",
    ticketId: "TS-2041",
    type: "Electrician Confirmation",
    purpose: "Confirm Sanjay Electricals site visit for burnt control panel",
    engineer: ENGINEERS[0],
    electrician: "Sanjay Electricals",
    dueLabel: "Today, 11:30",
    dueInMinutes: -95,
    state: "Overdue",
    notes: "Machine must stay powered off until panel is cleared.",
    attempts: 2,
    lastActivity: "12 min ago — customer call completed",
    history: [],
  },
  {
    id: "FU-502",
    ticketId: "TS-2040",
    type: "Electrician Visit Follow-up",
    purpose: "Check boiler pressure result after electrician visit",
    engineer: ENGINEERS[0],
    electrician: "Ravi Power Solutions",
    dueLabel: "Today, 14:15",
    dueInMinutes: 40,
    state: "Awaiting Electrician",
    notes: "Visit confirmed for 12:30.",
    attempts: 0,
    lastActivity: "Today, 10:10 — electrician confirmed",
    history: [],
  },
  {
    id: "FU-503",
    ticketId: "TS-2039",
    type: "Request Photos or Video",
    purpose: "Customer to send video of hydro extractor vibration",
    engineer: ENGINEERS[0],
    dueLabel: "Today, 13:45",
    dueInMinutes: 15,
    state: "Awaiting Customer",
    notes: "Third request — customer unreachable twice.",
    attempts: 3,
    lastActivity: "Today, 09:40 — voicemail left",
    history: [],
  },
  {
    id: "FU-504",
    ticketId: "TS-2038",
    type: "Machine Monitoring",
    purpose: "48-hour steam iron temperature monitoring check",
    engineer: ENGINEERS[0],
    dueLabel: "Today, 17:00",
    dueInMinutes: 205,
    state: "Monitoring",
    notes: "Monitoring started after remote fix.",
    attempts: 0,
    repeat: "Daily for 3 days",
    lastActivity: "Yesterday, 16:20 — monitoring started",
    history: [],
  },
  {
    id: "FU-505",
    ticketId: "TS-2037",
    type: "Field Engineer Handoff",
    purpose: "Confirm Field Engineer acknowledged washer extractor escalation",
    engineer: ENGINEERS[1],
    dueLabel: "Yesterday, 18:00",
    dueInMinutes: -1180,
    state: "Overdue",
    notes: "Handoff not acknowledged yet.",
    attempts: 1,
    lastActivity: "Yesterday, 15:05 — escalated",
    history: [],
  },
  {
    id: "FU-506",
    ticketId: "TS-2036",
    type: "Customer Callback",
    purpose: "First contact call for packing machine sealing issue",
    engineer: ENGINEERS[0],
    dueLabel: "Today, 15:30",
    dueInMinutes: 115,
    state: "Due Today",
    notes: "",
    attempts: 0,
    lastActivity: "Today, 09:15 — ticket assigned",
    history: [],
  },
  {
    id: "FU-507",
    ticketId: "TS-2035",
    type: "Resolution Confirmation",
    purpose: "Confirm dry cleaning machine running normally after repair",
    engineer: ENGINEERS[2],
    dueLabel: "Tomorrow, 11:00",
    dueInMinutes: 1300,
    state: "Upcoming",
    notes: "",
    attempts: 0,
    lastActivity: "Today, 08:00 — resolved remotely",
    history: [],
  },
  {
    id: "FU-508",
    ticketId: "TS-2034",
    type: "Ticket Closure Confirmation",
    purpose: "Take closure confirmation from Nagpur store",
    engineer: ENGINEERS[0],
    dueLabel: "Today, 10:00",
    dueInMinutes: -215,
    state: "Completed",
    notes: "Owner confirmed closure on call.",
    attempts: 1,
    lastActivity: "Today, 10:05 — closed",
    history: ["Completed today, 10:05 — Ticket Ready for Closure"],
  },
  {
    id: "FU-509",
    ticketId: "TS-2039",
    type: "Spare-Part Update",
    purpose: "Update customer on drum bearing dispatch status",
    engineer: ENGINEERS[1],
    dueLabel: "Tomorrow, 16:00",
    dueInMinutes: 1600,
    state: "Upcoming",
    notes: "",
    attempts: 0,
    lastActivity: "Today, 11:00 — part indent raised",
    history: [],
  },
  {
    id: "FU-510",
    ticketId: "TS-2038",
    type: "Troubleshooting Follow-up",
    purpose: "Re-run remote diagnostic if temperature drifts again",
    engineer: ENGINEERS[0],
    dueLabel: "Today, 09:00",
    dueInMinutes: -275,
    state: "Rescheduled",
    originalDue: "Today, 09:00",
    notes: "Store was busy in the morning rush.",
    attempts: 1,
    lastActivity: "Today, 09:10 — rescheduled by engineer",
    history: ["Rescheduled from Today, 09:00 → Today, 17:00 — store busy"],
  },
];

const TABS = [
  "All",
  "Overdue",
  "Due Today",
  "Upcoming",
  "Awaiting Customer",
  "Awaiting Electrician",
  "Monitoring",
  "Completed",
  "Rescheduled",
  "Cancelled",
] as const;

const VIEWS = ["Priority List", "Daily View", "Weekly Calendar", "Monthly Calendar"] as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function ticketOf(id: string) {
  return SEED.find((t) => t.id === id);
}

function isSafety(f: FollowUp) {
  return ticketOf(f.ticketId)?.safetyRisk ?? false;
}

function isOpen(f: FollowUp) {
  return f.state !== "Completed" && f.state !== "Cancelled";
}

function isOverdue(f: FollowUp) {
  return isOpen(f) && f.dueInMinutes < 0;
}

function isDueToday(f: FollowUp) {
  return isOpen(f) && f.dueInMinutes >= 0 && f.dueInMinutes <= 600;
}

function dueWithinHour(f: FollowUp) {
  return isOpen(f) && f.dueInMinutes >= 0 && f.dueInMinutes <= 60;
}

function timeLabel(f: FollowUp) {
  if (!isOpen(f)) return f.state;
  const m = f.dueInMinutes;
  const abs = Math.abs(m);
  const text = abs >= 60 ? `${Math.floor(abs / 60)}h ${abs % 60}m` : `${abs}m`;
  return m < 0 ? `Overdue by ${text}` : `Due in ${text}`;
}

/** Dark red safety > red overdue > amber <1h > blue upcoming > green done > grey cancelled */
function tone(f: FollowUp) {
  if (f.state === "Cancelled") return { border: "border-l-muted-foreground/40", badge: "bg-muted text-muted-foreground" };
  if (f.state === "Completed") return { border: "border-l-emerald-600", badge: "bg-emerald-600 text-white" };
  if (isOverdue(f) && isSafety(f)) return { border: "border-l-red-900", badge: "bg-red-900 text-white" };
  if (isOverdue(f)) return { border: "border-l-red-600", badge: "bg-red-600 text-white" };
  if (dueWithinHour(f)) return { border: "border-l-amber-500", badge: "bg-amber-500 text-white" };
  return { border: "border-l-blue-500", badge: "bg-blue-500 text-white" };
}

function priorityRank(f: FollowUp) {
  const t = ticketOf(f.ticketId);
  let score = 0;
  if (t?.safetyRisk) score += 10000;
  if (t?.breakdown) score += 5000;
  if (isOverdue(f)) score += 2000;
  if (!isOpen(f)) score -= 10000;
  return score - f.dueInMinutes;
}

function escalations(f: FollowUp): string[] {
  const t = ticketOf(f.ticketId);
  const out: string[] = [];
  if (!isOpen(f)) return out;
  if (isOverdue(f) && t?.safetyRisk) out.push("Safety-related follow-up overdue");
  if (isOverdue(f) && t?.breakdown && f.type === "Customer Callback") out.push("Critical breakdown callback overdue");
  if (f.type === "Electrician Confirmation" && !t?.electrician?.confirmed) out.push("Electrician visit not confirmed");
  if (f.attempts >= 3) out.push("Customer unreachable after three attempts");
  if (f.type === "Troubleshooting Follow-up" && isOverdue(f)) out.push("Machine still failing after remote troubleshooting");
  if (f.type === "Machine Monitoring" && isOverdue(f)) out.push("Monitoring result not recorded");
  if (f.type === "Field Engineer Handoff" && isOverdue(f)) out.push("Field Engineer handoff not acknowledged");
  if (f.dueInMinutes < -1440) out.push("Follow-up overdue by more than 24 hours");
  return out;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function TechSupportFollowUps() {
  const [items, setItems] = useState<FollowUp[]>(SEEDED);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [view, setView] = useState<(typeof VIEWS)[number]>("Priority List");

  const [fType, setFType] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fCustomer, setFCustomer] = useState("all");
  const [fMachine, setFMachine] = useState("all");
  const [fEngineer, setFEngineer] = useState("all");
  const [fElectrician, setFElectrician] = useState("all");
  const [fDue, setFDue] = useState("all");
  const [fCompletion, setFCompletion] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [completing, setCompleting] = useState<FollowUp | null>(null);
  const [rescheduling, setRescheduling] = useState<FollowUp | null>(null);
  const [cancelling, setCancelling] = useState<FollowUp | null>(null);

  const counts = useMemo(
    () => ({
      overdue: items.filter(isOverdue).length,
      dueToday: items.filter(isDueToday).length,
      withinHour: items.filter(dueWithinHour).length,
      upcoming: items.filter((f) => isOpen(f) && f.dueInMinutes > 600).length,
      completedToday: items.filter((f) => f.state === "Completed").length,
    }),
    [items],
  );

  const tabCount = (t: (typeof TABS)[number]) => {
    if (t === "All") return items.length;
    if (t === "Overdue") return items.filter(isOverdue).length;
    if (t === "Due Today") return items.filter(isDueToday).length;
    if (t === "Upcoming") return items.filter((f) => isOpen(f) && f.dueInMinutes > 600).length;
    return items.filter((f) => f.state === t).length;
  };

  const filtered = useMemo(() => {
    let list = [...items];
    if (tab === "Overdue") list = list.filter(isOverdue);
    else if (tab === "Due Today") list = list.filter(isDueToday);
    else if (tab === "Upcoming") list = list.filter((f) => isOpen(f) && f.dueInMinutes > 600);
    else if (tab !== "All") list = list.filter((f) => f.state === tab);

    if (fType !== "all") list = list.filter((f) => f.type === fType);
    if (fPriority !== "all") list = list.filter((f) => ticketOf(f.ticketId)?.priority === fPriority);
    if (fStatus !== "all") list = list.filter((f) => ticketOf(f.ticketId)?.status === fStatus);
    if (fCustomer !== "all") list = list.filter((f) => ticketOf(f.ticketId)?.franchise === fCustomer);
    if (fMachine !== "all") list = list.filter((f) => ticketOf(f.ticketId)?.machine === fMachine);
    if (fEngineer !== "all") list = list.filter((f) => f.engineer === fEngineer);
    if (fElectrician !== "all") list = list.filter((f) => f.electrician === fElectrician);
    if (fDue === "overdue") list = list.filter(isOverdue);
    if (fDue === "today") list = list.filter(isDueToday);
    if (fDue === "later") list = list.filter((f) => isOpen(f) && f.dueInMinutes > 600);
    if (fCompletion === "open") list = list.filter(isOpen);
    if (fCompletion === "done") list = list.filter((f) => f.state === "Completed");

    return list.sort((a, b) => priorityRank(b) - priorityRank(a));
  }, [items, tab, fType, fPriority, fStatus, fCustomer, fMachine, fEngineer, fElectrician, fDue, fCompletion]);

  const alerts = useMemo(() => {
    const out: { id: string; ticketId: string; text: string; safety: boolean }[] = [];
    items.forEach((f) =>
      escalations(f).forEach((text) =>
        out.push({ id: f.id, ticketId: f.ticketId, text, safety: isSafety(f) }),
      ),
    );
    return out;
  }, [items]);

  const update = (id: string, patch: Partial<FollowUp>) =>
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const customers = Array.from(new Set(SEED.map((t) => t.franchise)));
  const machines = Array.from(new Set(SEED.map((t) => t.machine)));
  const electricians = Array.from(new Set(items.map((f) => f.electrician).filter(Boolean) as string[]));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Follow-ups &amp; Reminders
          </h1>
          <p className="text-sm text-muted-foreground">
            Every reminder stays linked to its master support ticket.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Reminder
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <Stat label="Overdue" value={counts.overdue} className="text-red-600" />
        <Stat label="Due Today" value={counts.dueToday} className="text-amber-600" />
        <Stat label="Due Within 1 Hour" value={counts.withinHour} className="text-amber-600" />
        <Stat label="Upcoming" value={counts.upcoming} className="text-blue-600" />
        <Stat label="Completed Today" value={counts.completedToday} className="text-emerald-600" />
      </div>

      {/* Escalation alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" /> Automatic escalation flags ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`text-xs rounded-md px-3 py-2 border-l-4 bg-muted/40 ${
                  a.safety ? "border-l-red-900" : "border-l-red-600"
                }`}
              >
                <span className="font-medium">{a.ticketId}</span> · {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Views */}
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Button key={v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => setView(v)}>
            {v}
          </Button>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
              tab === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
            }`}
          >
            {t} <span className="opacity-70">({tabCount(t)})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FilterSelect label="Follow-up type" value={fType} onChange={setFType} options={[...FOLLOWUP_TYPES]} />
          <FilterSelect
            label="Ticket priority"
            value={fPriority}
            onChange={setFPriority}
            options={["Safety Critical", "Critical", "High", "Medium", "Low"]}
          />
          <FilterSelect
            label="Ticket status"
            value={fStatus}
            onChange={setFStatus}
            options={Array.from(new Set(SEED.map((t) => t.status)))}
          />
          <FilterSelect label="Customer / franchise" value={fCustomer} onChange={setFCustomer} options={customers} />
          <FilterSelect label="Machine" value={fMachine} onChange={setFMachine} options={machines} />
          <FilterSelect label="Assigned engineer" value={fEngineer} onChange={setFEngineer} options={ENGINEERS} />
          <FilterSelect label="Electrician" value={fElectrician} onChange={setFElectrician} options={electricians} />
          <FilterSelect
            label="Due date"
            value={fDue}
            onChange={setFDue}
            options={[
              { value: "overdue", label: "Overdue" },
              { value: "today", label: "Due today" },
              { value: "later", label: "Later" },
            ]}
          />
          <FilterSelect
            label="Completion"
            value={fCompletion}
            onChange={setFCompletion}
            options={[
              { value: "open", label: "Open" },
              { value: "done", label: "Completed" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Body per view */}
      {view === "Priority List" && (
        <div className="grid gap-3">
          {filtered.map((f) => (
            <FollowUpCard
              key={f.id}
              item={f}
              onComplete={() => setCompleting(f)}
              onReschedule={() => setRescheduling(f)}
              onCancel={() => setCancelling(f)}
            />
          ))}
          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No follow-ups match these filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {view === "Daily View" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "Morning (before 12:00)", test: (f: FollowUp) => f.dueInMinutes < 0 },
            { title: "Afternoon (12:00 – 17:00)", test: (f: FollowUp) => f.dueInMinutes >= 0 && f.dueInMinutes <= 300 },
            { title: "Evening & later", test: (f: FollowUp) => f.dueInMinutes > 300 },
          ].map((slot) => (
            <Card key={slot.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{slot.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filtered.filter(slot.test).map((f) => (
                  <MiniRow key={f.id} item={f} onOpen={() => setCompleting(f)} />
                ))}
                {filtered.filter(slot.test).length === 0 && (
                  <p className="text-xs text-muted-foreground">Nothing scheduled.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === "Weekly Calendar" && (
        <Card>
          <CardContent className="p-4 grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="rounded-md border p-2 min-h-28">
                <div className="text-xs font-semibold mb-2">{day}</div>
                <div className="space-y-1">
                  {filtered
                    .filter((_, idx) => idx % 7 === i)
                    .map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setCompleting(f)}
                        className={`w-full text-left text-[11px] rounded px-2 py-1 border-l-4 bg-muted/50 ${tone(f).border}`}
                      >
                        {f.ticketId} · {f.type}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {view === "Monthly Calendar" && (
        <Card>
          <CardContent className="p-4 grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, d) => {
              const dayItems = filtered.filter((_, idx) => idx % 30 === d);
              return (
                <div key={d} className="rounded border p-1.5 min-h-16 text-[11px]">
                  <div className="text-muted-foreground">{d + 1}</div>
                  {dayItems.map((f) => (
                    <div key={f.id} className={`mt-1 rounded px-1 border-l-4 bg-muted/50 ${tone(f).border}`}>
                      {f.ticketId}
                    </div>
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddReminderDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        engineers={ENGINEERS}
        onCreate={(f) => {
          setItems((prev) => [f, ...prev]);
          toast.success(`Reminder created for ${f.ticketId}`);
        }}
      />

      <CompleteDialog
        item={completing}
        onClose={() => setCompleting(null)}
        onDone={(id, patch, historyLine) =>
          setItems((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...patch, history: [...f.history, historyLine] } : f)),
          )
        }
      />

      <RescheduleDialog
        item={rescheduling}
        onClose={() => setRescheduling(null)}
        onSave={(id, newDue, reason, orig) => {
          update(id, {
            dueLabel: newDue,
            dueInMinutes: 600,
            state: "Rescheduled",
            originalDue: orig,
          });
          setItems((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, history: [...f.history, `Rescheduled from ${orig} → ${newDue} — ${reason}`] } : f,
            ),
          );
          toast.success("Follow-up rescheduled. Original due date kept in history.");
        }}
      />

      <CancelDialog
        item={cancelling}
        onClose={() => setCancelling(null)}
        onSave={(id, reason) => {
          setItems((prev) =>
            prev.map((f) =>
              f.id === id
                ? { ...f, state: "Cancelled", history: [...f.history, `Cancelled — ${reason}`] }
                : f,
            ),
          );
          toast.success("Reminder cancelled");
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold mt-1 ${className ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
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
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
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

function MiniRow({ item, onOpen }: { item: FollowUp; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className={`w-full text-left rounded-md border-l-4 bg-muted/40 px-3 py-2 ${tone(item).border}`}
    >
      <div className="text-xs font-medium">
        {item.ticketId} · {item.type}
      </div>
      <div className="text-[11px] text-muted-foreground">
        {item.dueLabel} · {timeLabel(item)}
      </div>
    </button>
  );
}

function FollowUpCard({
  item,
  onComplete,
  onReschedule,
  onCancel,
}: {
  item: FollowUp;
  onComplete: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const t = ticketOf(item.ticketId);
  const st = tone(item);
  const flags = escalations(item);

  return (
    <Card className={`border-l-4 ${st.border}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {t?.safetyRisk && (
                <Badge className="bg-red-900 text-white hover:bg-red-900">
                  <ShieldAlert className="w-3 h-3 mr-1" /> Safety Critical
                </Badge>
              )}
              <Badge variant="outline">{t?.priority ?? "Medium"}</Badge>
              <Badge variant="secondary" className="font-mono text-[11px]">
                <TicketIcon className="w-3 h-3 mr-1" />
                {item.ticketId}
              </Badge>
              <Badge className={st.badge}>{item.state}</Badge>
              <Badge variant="outline">{item.type}</Badge>
            </div>
            <div className="font-medium text-sm">{item.purpose}</div>
            <div className="text-xs text-muted-foreground">
              {t?.franchise} · {t?.customer} · {t?.machine} {t?.model}
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="flex items-center gap-1 justify-end text-muted-foreground">
              <CalendarClock className="w-3 h-3" /> {item.dueLabel}
            </div>
            <div className={isOverdue(item) ? "text-red-600 font-medium" : "text-muted-foreground"}>
              {timeLabel(item)}
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
          <div>Ticket status: <span className="text-foreground">{t?.status}</span></div>
          <div>Engineer: <span className="text-foreground">{item.engineer}</span></div>
          <div>Last activity: <span className="text-foreground">{item.lastActivity}</span></div>
        </div>

        {item.repeat && <div className="text-xs text-muted-foreground">Repeats: {item.repeat}</div>}
        {item.originalDue && (
          <div className="text-xs text-muted-foreground">Original due date kept: {item.originalDue}</div>
        )}

        {flags.length > 0 && (
          <div className="space-y-1">
            {flags.map((f, i) => (
              <div key={i} className="text-xs text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {f}
              </div>
            ))}
          </div>
        )}

        {item.history.length > 0 && (
          <div className="text-[11px] text-muted-foreground space-y-0.5 border-t pt-2">
            {item.history.map((h, i) => (
              <div key={i}>• {h}</div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onComplete} disabled={!isOpen(item)}>
            <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
          </Button>
          <Button size="sm" variant="outline" onClick={onReschedule} disabled={!isOpen(item)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reschedule
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info(`Calling ${t?.contact ?? "customer"}`)}>
            <Phone className="w-4 h-4 mr-1" /> Call Customer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.info(`Opening ${item.ticketId} in My Support Tickets`)}
          >
            View Ticket
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={!isOpen(item)}>
            <XCircle className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Add reminder ---------------- */

function AddReminderDialog({
  open,
  onOpenChange,
  engineers,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  engineers: string[];
  onCreate: (f: FollowUp) => void;
}) {
  const [ticketId, setTicketId] = useState(SEED[0].id);
  const [type, setType] = useState<(typeof FOLLOWUP_TYPES)[number]>("Customer Callback");
  const [purpose, setPurpose] = useState("");
  const [engineer, setEngineer] = useState(engineers[0]);
  const [priority, setPriority] = useState("High");
  const [due, setDue] = useState("");
  const [alertTiming, setAlertTiming] = useState("15 minutes before");
  const [notes, setNotes] = useState("");
  const [repeat, setRepeat] = useState("none");

  const openTickets = SEED.filter((t) => t.status !== "Closed");

  const submit = () => {
    if (!purpose.trim() || !due.trim()) {
      toast.error("Purpose and due date/time are required");
      return;
    }
    onCreate({
      id: `FU-${Math.floor(600 + Math.random() * 300)}`,
      ticketId,
      type,
      purpose,
      engineer,
      dueLabel: due,
      dueInMinutes: 240,
      state: "Upcoming",
      notes: `${notes}${notes ? " · " : ""}Alert ${alertTiming} · Priority ${priority}`,
      attempts: 0,
      repeat: repeat === "none" ? undefined : repeat,
      lastActivity: "Just now — reminder created",
      history: [],
    });
    setPurpose("");
    setDue("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Reminder</DialogTitle>
          <DialogDescription>Every reminder must link to one master support ticket.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Select existing ticket</Label>
            <Select value={ticketId} onValueChange={setTicketId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {openTickets.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.id} — {t.franchise} ({t.machine})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Follow-up type</Label>
            <Select value={type} onValueChange={(v) => setType(v as (typeof FOLLOWUP_TYPES)[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FOLLOWUP_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Purpose</Label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="What must be done?" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Assigned engineer</Label>
              <Select value={engineer} onValueChange={setEngineer}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {engineers.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Safety Critical", "Critical", "High", "Medium", "Low"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Due date &amp; time</Label>
              <Input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Today, 17:30" />
            </div>
            <div className="space-y-1">
              <Label>Reminder alert timing</Label>
              <Select value={alertTiming} onValueChange={setAlertTiming}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["At due time", "15 minutes before", "30 minutes before", "1 hour before", "1 day before"].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Repeat (machine monitoring)</Label>
            <Select value={repeat} onValueChange={setRepeat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No repeat</SelectItem>
                <SelectItem value="Daily for 3 days">Daily for 3 days</SelectItem>
                <SelectItem value="Daily for 7 days">Daily for 7 days</SelectItem>
                <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create Reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Complete ---------------- */

function CompleteDialog({
  item,
  onClose,
  onDone,
}: {
  item: FollowUp | null;
  onClose: () => void;
  onDone: (id: string, patch: Partial<FollowUp>, historyLine: string) => void;
}) {
  const [outcome, setOutcome] = useState<string>("Customer Contacted");
  const [work, setWork] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("Troubleshooting");
  const [nextAction, setNextAction] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [notes, setNotes] = useState("");

  if (!item) return null;
  const t = ticketOf(item.ticketId);

  const submit = () => {
    if (!work.trim() || !response.trim() || !nextAction.trim() || !nextDue.trim()) {
      toast.error("Outcome, work completed, response, next action and next due time are required");
      return;
    }
    onDone(
      item.id,
      { state: "Completed", lastActivity: `Just now — ${outcome}` },
      `Completed — ${outcome}. Next: ${nextAction} (${nextDue})`,
    );
    toast.success(`Follow-up completed. Ticket ${item.ticketId} updated to ${status}.`);
    setWork("");
    setResponse("");
    setNextAction("");
    setNextDue("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Follow-up · {item.ticketId}</DialogTitle>
          <DialogDescription>
            {item.type} — {t?.franchise}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Work completed</Label>
            <Textarea value={work} onChange={(e) => setWork(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Customer / electrician response</Label>
            <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Updated ticket status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from(new Set(SEED.map((s) => s.status))).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Next action</Label>
              <Input value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Next action due</Label>
              <Input value={nextDue} onChange={(e) => setNextDue(e.target.value)} placeholder="Tomorrow, 11:00" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Supporting notes / attachments</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Completed activity records cannot be edited or deleted later.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save &amp; Complete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Reschedule / Cancel ---------------- */

function RescheduleDialog({
  item,
  onClose,
  onSave,
}: {
  item: FollowUp | null;
  onClose: () => void;
  onSave: (id: string, newDue: string, reason: string, original: string) => void;
}) {
  const [due, setDue] = useState("");
  const [reason, setReason] = useState("");
  if (!item) return null;
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule · {item.ticketId}</DialogTitle>
          <DialogDescription>Original due date ({item.dueLabel}) stays in history.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>New due date &amp; time</Label>
            <Input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Today, 17:00" />
          </div>
          <div className="space-y-1">
            <Label>Reason</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button
            onClick={() => {
              if (!due.trim() || !reason.trim()) {
                toast.error("New due time and reason are required");
                return;
              }
              onSave(item.id, due, reason, item.originalDue ?? item.dueLabel);
              setDue("");
              setReason("");
              onClose();
            }}
          >
            Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({
  item,
  onClose,
  onSave,
}: {
  item: FollowUp | null;
  onClose: () => void;
  onSave: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  if (!item) return null;
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel reminder · {item.ticketId}</DialogTitle>
          <DialogDescription>A reason is required before cancelling.</DialogDescription>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Keep reminder</Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!reason.trim()) {
                toast.error("Cancellation reason is required");
                return;
              }
              onSave(item.id, reason);
              setReason("");
              onClose();
            }}
          >
            Cancel reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
