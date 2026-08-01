import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarClock,
  Camera,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  MapPin,
  MonitorPlay,
  Phone,
  PlusCircle,
  ShieldAlert,
  StickyNote,
  Ticket as TicketIcon,
  Timer,
  UserCog,
  Wrench,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & sample data                                                 */
/* ------------------------------------------------------------------ */

export const TICKET_STATUSES = [
  "New",
  "Assigned",
  "Contacting Customer",
  "Troubleshooting",
  "Awaiting Customer",
  "Awaiting Electrician",
  "Electrician Visit Scheduled",
  "Monitoring",
  "Escalation Required",
  "Escalated to Field Engineer",
  "Resolved",
  "Closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
type Priority = "Safety Critical" | "Critical" | "High" | "Medium" | "Low";

type TimelineEntry = { at: string; text: string };

export type SupportTicket = {
  id: string;
  customer: string;
  location: string;
  contact: string;
  machine: string;
  model: string;
  category: string;
  problem: string;
  priority: Priority;
  status: TicketStatus;
  assignedBy: string;
  assignedAt: string;
  reportedMinsAgo: number;
  responseDueMins: number; // minutes remaining (negative = overdue)
  nextAction: string;
  reason: string;
  safety?: boolean;
  breakdown?: boolean;
  awaitingCallback?: boolean;
  timeline: TimelineEntry[];
};

const now = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const SEED: SupportTicket[] = [
  {
    id: "TS-2418",
    customer: "Clean Craft Jaipur — Vaishali Nagar",
    location: "Jaipur, Rajasthan",
    contact: "+91 98290 41185",
    machine: "Dry Clean Machine",
    model: "Union XL-8 (8kg)",
    category: "Electrical / Safety",
    problem: "Burning smell and tripping MCB while machine is in drying cycle.",
    priority: "Safety Critical",
    status: "Assigned",
    assignedBy: "RM — Ankit Sharma",
    assignedAt: "09:05",
    reportedMinsAgo: 38,
    responseDueMins: 12,
    nextAction: "Call customer and instruct immediate power isolation",
    reason: "Safety risk — burning smell with repeated MCB trip",
    safety: true,
    breakdown: true,
    timeline: [{ at: "09:05", text: "Ticket assigned by RM — Ankit Sharma" }],
  },
  {
    id: "TS-2417",
    customer: "Clean Craft Indore — Vijay Nagar",
    location: "Indore, Madhya Pradesh",
    contact: "+91 90390 22417",
    machine: "Steam Boiler",
    model: "SteamPro 24L",
    category: "Machine Breakdown",
    problem: "Boiler not building pressure, steam iron unusable since morning.",
    priority: "Critical",
    status: "Troubleshooting",
    assignedBy: "RM — Priya Nair",
    assignedAt: "08:40",
    reportedMinsAgo: 96,
    responseDueMins: 25,
    nextAction: "Verify heating element resistance over call",
    reason: "Complete breakdown — production stopped at store",
    breakdown: true,
    timeline: [
      { at: "08:40", text: "Ticket assigned by RM — Priya Nair" },
      { at: "08:52", text: "Customer contacted, issue confirmed" },
    ],
  },
  {
    id: "TS-2415",
    customer: "Clean Craft Lucknow — Gomti Nagar",
    location: "Lucknow, Uttar Pradesh",
    contact: "+91 93350 77812",
    machine: "Hydro Extractor",
    model: "HX-15",
    category: "Callback Promised",
    problem: "Excess vibration at spin; customer awaiting promised callback.",
    priority: "High",
    status: "Awaiting Customer",
    assignedBy: "RM — Ankit Sharma",
    assignedAt: "Yesterday 17:10",
    reportedMinsAgo: 1150,
    responseDueMins: -45,
    nextAction: "Overdue callback — call immediately",
    reason: "Promised callback missed by 45 minutes",
    awaitingCallback: true,
    timeline: [
      { at: "17:10", text: "Ticket assigned by RM — Ankit Sharma" },
      { at: "17:35", text: "Callback promised for 09:00 today" },
    ],
  },
  {
    id: "TS-2414",
    customer: "Clean Craft Surat — Adajan",
    location: "Surat, Gujarat",
    contact: "+91 99250 30144",
    machine: "Washer Extractor",
    model: "WX-20",
    category: "Production Stopped",
    problem: "Drain valve stuck closed, wash cycle aborts mid-way.",
    priority: "High",
    status: "Awaiting Electrician",
    assignedBy: "RM — Rohit Desai",
    assignedAt: "08:15",
    reportedMinsAgo: 130,
    responseDueMins: 55,
    nextAction: "Confirm electrician visit slot with store",
    reason: "Production stopped — electrician confirmation pending",
    timeline: [
      { at: "08:15", text: "Ticket assigned by RM — Rohit Desai" },
      { at: "08:44", text: "Remote checks done, local support required" },
    ],
  },
  {
    id: "TS-2413",
    customer: "Clean Craft Pune 2 — Baner",
    location: "Pune, Maharashtra",
    contact: "+91 98220 66431",
    machine: "POS Terminal",
    model: "CC-POS v3",
    category: "Software / POS",
    problem: "Bills not syncing to dashboard since last update.",
    priority: "Medium",
    status: "New",
    assignedBy: "RM — Priya Nair",
    assignedAt: "09:20",
    reportedMinsAgo: 18,
    responseDueMins: 42,
    nextAction: "First response call pending",
    reason: "New ticket awaiting first response",
    timeline: [{ at: "09:20", text: "Ticket assigned by RM — Priya Nair" }],
  },
  {
    id: "TS-2410",
    customer: "Clean Craft Mathura — Krishna Nagar",
    location: "Mathura, Uttar Pradesh",
    contact: "+91 94120 55098",
    machine: "Steam Iron Station",
    model: "SI-Pro 2",
    category: "Follow-up",
    problem: "Water leakage reduced after gasket change — monitoring.",
    priority: "Low",
    status: "Monitoring",
    assignedBy: "RM — Rohit Desai",
    assignedAt: "Yesterday 12:00",
    reportedMinsAgo: 1400,
    responseDueMins: 180,
    nextAction: "Scheduled follow-up call at 16:00",
    reason: "Scheduled follow-up",
    timeline: [
      { at: "12:00", text: "Ticket assigned by RM — Rohit Desai" },
      { at: "15:20", text: "Gasket replacement guided remotely" },
    ],
  },
];

type ElectricianVisit = {
  id: string;
  name: string;
  phone: string;
  site: string;
  time: string;
  work: string;
  confirmed: boolean;
  ticketId: string;
};

const SEED_VISITS: ElectricianVisit[] = [
  {
    id: "EV-1",
    name: "Ramesh Yadav",
    phone: "+91 98765 21004",
    site: "Clean Craft Surat — Adajan",
    time: "12:30 PM",
    work: "Drain valve solenoid check & replacement",
    confirmed: false,
    ticketId: "TS-2414",
  },
  {
    id: "EV-2",
    name: "Suresh Kumar",
    phone: "+91 91234 88017",
    site: "Clean Craft Indore — Vijay Nagar",
    time: "03:00 PM",
    work: "Boiler heating element continuity test",
    confirmed: true,
    ticketId: "TS-2417",
  },
];

const PRIORITY_RANK: Record<Priority, number> = {
  "Safety Critical": 0,
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

const priorityTone = (p: Priority) =>
  p === "Safety Critical"
    ? "bg-destructive text-destructive-foreground"
    : p === "Critical"
      ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
      : p === "High"
        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
        : p === "Medium"
          ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
          : "bg-muted text-muted-foreground";

const fmtAge = (m: number) =>
  m < 60 ? `${m} min ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;

const fmtDue = (m: number) =>
  m < 0 ? `Overdue by ${Math.abs(m)} min` : `Due in ${m} min`;

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function TechSupportDashboard({
  engineerName = "Vikas Mehra",
  canCreateEmergency = true,
}: {
  engineerName?: string;
  canCreateEmergency?: boolean;
}) {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED);
  const [visits, setVisits] = useState<ElectricianVisit[]>(SEED_VISITS);
  const [availability, setAvailability] = useState<"Available" | "Busy" | "Offline">("Available");
  const [shiftOn, setShiftOn] = useState(false);
  const [openTicket, setOpenTicket] = useState<SupportTicket | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // action dialog state
  const [action, setAction] = useState<{ kind: string; ticket: SupportTicket } | null>(null);
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [field3, setField3] = useState("");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const log = (id: string, text: string, patch?: Partial<SupportTicket>) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...patch, timeline: [...t.timeline, { at: now(), text }] }
          : t,
      ),
    );
    setOpenTicket((cur) =>
      cur && cur.id === id
        ? { ...cur, ...patch, timeline: [...cur.timeline, { at: now(), text }] }
        : cur,
    );
  };

  const queue = useMemo(() => {
    const score = (t: SupportTicket) => {
      if (t.safety) return 0;
      if (t.breakdown) return 1;
      if (t.awaitingCallback && t.responseDueMins < 0) return 2;
      if (t.category === "Production Stopped") return 3;
      if (t.status === "New") return 4;
      if (t.status === "Awaiting Electrician" || t.status === "Electrician Visit Scheduled") return 5;
      return 6;
    };
    return [...tickets]
      .filter((t) => t.status !== "Resolved" && t.status !== "Closed")
      .sort(
        (a, b) =>
          score(a) - score(b) ||
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
          a.responseDueMins - b.responseDueMins,
      );
  }, [tickets]);

  const top = queue[0];
  const rest = queue.slice(1, 6);

  const kpis = [
    { label: "New Tickets", value: tickets.filter((t) => t.status === "New").length, icon: TicketIcon, tint: "bg-blue-500/10 text-blue-600" },
    { label: "Critical Tickets", value: tickets.filter((t) => t.priority === "Critical" || t.priority === "Safety Critical").length, icon: Flame, tint: "bg-rose-500/10 text-rose-600" },
    { label: "Due Today", value: queue.length, icon: CalendarClock, tint: "bg-amber-500/10 text-amber-600" },
    { label: "Awaiting Customer", value: tickets.filter((t) => t.status === "Awaiting Customer").length, icon: Clock, tint: "bg-purple-500/10 text-purple-600" },
    { label: "Electrician Visits", value: visits.length, icon: UserCog, tint: "bg-cyan-500/10 text-cyan-600" },
    { label: "Escalations Required", value: tickets.filter((t) => t.status === "Escalation Required").length, icon: ArrowUpRight, tint: "bg-orange-500/10 text-orange-600" },
    { label: "Resolved Today", value: tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length, icon: CheckCircle2, tint: "bg-emerald-500/10 text-emerald-600" },
    { label: "Overdue Tickets", value: queue.filter((t) => t.responseDueMins < 0).length, icon: AlertTriangle, tint: "bg-destructive/10 text-destructive" },
  ];

  const alerts = useMemo(() => {
    const a: { tone: string; text: string }[] = [];
    tickets.forEach((t) => {
      if (t.status === "Resolved" || t.status === "Closed") return;
      if (t.safety) a.push({ tone: "safety", text: `${t.id} — Safety risk at ${t.customer}: ${t.problem}` });
      else if (t.breakdown) a.push({ tone: "breakdown", text: `${t.id} — Complete machine breakdown at ${t.customer}` });
      if (t.responseDueMins >= 0 && t.responseDueMins <= 60)
        a.push({ tone: "sla", text: `${t.id} — SLA due in ${t.responseDueMins} min` });
      if (t.responseDueMins < 0)
        a.push({ tone: "sla", text: `${t.id} — Inactive beyond permitted time (${fmtDue(t.responseDueMins)})` });
      if (t.awaitingCallback) a.push({ tone: "wait", text: `${t.id} — Customer waiting for a callback` });
      if (t.status === "Escalation Required")
        a.push({ tone: "escalate", text: `${t.id} — Requires Field Engineer escalation` });
    });
    visits.filter((v) => !v.confirmed).forEach((v) =>
      a.push({ tone: "wait", text: `${v.ticketId} — Electrician visit with ${v.name} not confirmed` }),
    );
    return a;
  }, [tickets, visits]);

  const openAction = (kind: string, ticket: SupportTicket) => {
    setField1("");
    setField2("");
    setField3("");
    setAction({ kind, ticket });
  };

  const quickCall = (t: SupportTicket) => {
    log(t.id, `Call placed to customer (${t.contact})`, {
      status: t.status === "New" || t.status === "Assigned" ? "Contacting Customer" : t.status,
      nextAction: "Log call outcome",
    });
    toast.success(`Call logged for ${t.id}`, { description: "Timeline and Performance updated." });
  };

  const startTroubleshooting = (t: SupportTicket) => {
    log(t.id, "Remote troubleshooting session started", {
      status: "Troubleshooting",
      nextAction: "Complete remote diagnostic steps",
    });
    toast.success(`Troubleshooting started for ${t.id}`);
  };

  const submitAction = () => {
    if (!action) return;
    const t = action.ticket;
    switch (action.kind) {
      case "note":
        if (!field1.trim()) return toast.error("Please add a note");
        log(t.id, `Note: ${field1.trim()}`);
        toast.success("Note added to ticket timeline");
        break;
      case "photos":
        if (!field1.trim()) return toast.error("Describe what to capture");
        log(t.id, `Photos/video requested: ${field1.trim()}`, {
          status: "Awaiting Customer",
          nextAction: "Await media from customer",
        });
        toast.success("Media request sent to customer");
        break;
      case "electrician": {
        if (!field1.trim() || !field2.trim() || !field3.trim())
          return toast.error("Electrician name, time and work required");
        setVisits((v) => [
          ...v,
          {
            id: `EV-${v.length + 1}`,
            name: field1.trim(),
            phone: "+91 90000 00000",
            site: t.customer,
            time: field2.trim(),
            work: field3.trim(),
            confirmed: false,
            ticketId: t.id,
          },
        ]);
        log(t.id, `Electrician ${field1.trim()} scheduled at ${field2.trim()} — ${field3.trim()}`, {
          status: "Electrician Visit Scheduled",
          nextAction: "Confirm electrician arrival",
        });
        toast.success("Electrician Coordination updated");
        break;
      }
      case "followup":
        if (!field1.trim()) return toast.error("Pick a follow-up time");
        log(t.id, `Follow-up scheduled for ${field1.trim()}${field2 ? ` — ${field2}` : ""}`, {
          status: "Monitoring",
          nextAction: `Follow-up at ${field1.trim()}`,
        });
        toast.success("Follow-ups & Reminders updated");
        break;
      case "escalate":
        if (!field1.trim() || !field2.trim() || !field3.trim())
          return toast.error("Troubleshooting done, suspected parts and availability are required");
        log(
          t.id,
          `Escalated to Field Engineer — Issue: ${t.problem} | Troubleshooting: ${field1.trim()} | Suspected parts: ${field2.trim()} | Customer availability: ${field3.trim()}`,
          { status: "Escalated to Field Engineer", nextAction: "Field Engineer visit assignment" },
        );
        toast.success(`${t.id} escalated to Field Engineer`, {
          description: "No duplicate ticket created — same ticket carried forward.",
        });
        break;
      case "resolve":
        if (!field1.trim()) return toast.error("Resolution notes are required");
        if (field2 !== "confirmed") return toast.error("Customer confirmation is required");
        log(t.id, `Resolved — ${field1.trim()} (customer confirmed)`, {
          status: "Resolved",
          nextAction: "Close ticket after 24h monitoring",
        });
        toast.success(`${t.id} resolved`, { description: "Performance updated." });
        break;
      case "status":
        if (!field1) return toast.error("Select a status");
        log(t.id, `Status changed to ${field1}`, { status: field1 as TicketStatus });
        toast.success("Status updated");
        break;
    }
    setAction(null);
  };

  const createEmergency = () => {
    if (!field1.trim() || !field2.trim()) return toast.error("Store and problem are required");
    const id = `TS-${2419 + tickets.length}`;
    setTickets((prev) => [
      {
        id,
        customer: field1.trim(),
        location: "—",
        contact: "+91 90000 00000",
        machine: field3.trim() || "Unspecified machine",
        model: "—",
        category: "Emergency",
        problem: field2.trim(),
        priority: "Safety Critical",
        status: "New",
        assignedBy: `Emergency — ${engineerName}`,
        assignedAt: now(),
        reportedMinsAgo: 0,
        responseDueMins: 15,
        nextAction: "Immediate first response call",
        reason: "Emergency ticket raised manually",
        safety: true,
        timeline: [{ at: now(), text: "Emergency ticket created" }],
      },
      ...prev,
    ]);
    setEmergencyOpen(false);
    setField1("");
    setField2("");
    setField3("");
    toast.success(`Emergency ticket ${id} created`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            Welcome back, {engineerName}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={availability} onValueChange={(v) => setAvailability(v as typeof availability)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Busy">Busy</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={shiftOn ? "secondary" : "default"}
            onClick={() => {
              setShiftOn((s) => !s);
              toast.success(shiftOn ? "Shift ended" : "Shift started — queue is live");
            }}
          >
            <Timer className="mr-2 h-4 w-4" />
            {shiftOn ? "End Work" : "Start Work"}
          </Button>
          {canCreateEmergency && (
            <Button variant="destructive" onClick={() => setEmergencyOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Emergency Ticket
            </Button>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">{k.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{k.value}</p>
                  </div>
                  <div className={`shrink-0 rounded-lg p-2 ${k.tint}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next priority action */}
      {top && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Next Priority Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{top.id}</span>
                  <Badge className={priorityTone(top.priority)}>{top.priority}</Badge>
                  <Badge variant="outline">{top.status}</Badge>
                </div>
                <p className="font-semibold">{top.customer}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {top.location}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Machine: </span>
                  {top.machine} · {top.model}
                </p>
                <p className="text-sm">{top.problem}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Reported {fmtAge(top.reportedMinsAgo)}
                  </span>
                  <span className={top.responseDueMins < 0 ? "text-destructive font-medium" : ""}>
                    {fmtDue(top.responseDueMins)}
                  </span>
                </div>
                <p className="rounded-md bg-background/70 px-3 py-2 text-xs">
                  <span className="font-medium">Why this first: </span>
                  {top.reason}
                </p>
              </div>
              <div className="flex flex-row flex-wrap gap-2 md:flex-col">
                <Button onClick={() => quickCall(top)}>
                  <Phone className="mr-2 h-4 w-4" /> Call Customer
                </Button>
                <Button variant="secondary" onClick={() => startTroubleshooting(top)}>
                  <MonitorPlay className="mr-2 h-4 w-4" /> Start Troubleshooting
                </Button>
                <Button variant="outline" onClick={() => setOpenTicket(top)}>
                  View Ticket
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today’s Work Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rest.length === 0 && (
            <p className="text-sm text-muted-foreground">Queue clear — nothing else pending.</p>
          )}
          {rest.map((t) => (
            <TicketCard
              key={t.id}
              t={t}
              onView={() => setOpenTicket(t)}
              onCall={() => quickCall(t)}
              onTroubleshoot={() => startTroubleshooting(t)}
              onAction={(kind) => openAction(kind, t)}
            />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Electrician coordination */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-amber-600" /> Electrician Coordination — Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visits.map((v) => (
              <div key={v.id} className="rounded-lg border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.phone}</p>
                    <p className="mt-1 truncate text-sm">{v.site}</p>
                    <p className="text-xs text-muted-foreground">{v.work}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline">{v.time}</Badge>
                    <Badge
                      className={
                        v.confirmed
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                      }
                    >
                      {v.confirmed ? "Confirmed" : "Not confirmed"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Call logged with ${v.name}`)}
                  >
                    <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const t = tickets.find((x) => x.id === v.ticketId);
                      if (t) setOpenTicket(t);
                    }}
                  >
                    View Ticket ({v.ticketId})
                  </Button>
                  {!v.confirmed && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setVisits((p) =>
                          p.map((x) => (x.id === v.id ? { ...x, confirmed: true } : x)),
                        );
                        log(v.ticketId, `Electrician visit confirmed with ${v.name} at ${v.time}`);
                        toast.success("Visit confirmed");
                      }}
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Service health + alerts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4 text-primary" /> Service Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Metric label="Average first-response time" value="14 min" pct={82} />
              <Metric label="Remote resolution rate" value="68%" pct={68} />
              <Metric label="Tickets resolved within SLA" value="91%" pct={91} />
              <Metric label="Overdue ticket rate" value="6%" pct={6} tone="bad" />
              <Metric label="Average resolution time" value="1.4 days" pct={74} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-amber-600" /> Attention Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 && (
                <p className="text-sm text-muted-foreground">No alerts right now.</p>
              )}
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                    a.tone === "safety"
                      ? "border-destructive bg-destructive/15 text-destructive"
                      : a.tone === "breakdown"
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                        : a.tone === "sla"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                          : a.tone === "escalate"
                            ? "border-orange-500/40 bg-orange-500/10 text-orange-600"
                            : "border-border bg-muted/50 text-foreground"
                  }`}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">{a.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket detail sheet */}
      <Sheet open={!!openTicket} onOpenChange={(o) => !o && setOpenTicket(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {openTicket && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <TicketIcon className="h-4 w-4" /> {openTicket.id}
                </SheetTitle>
                <SheetDescription>{openTicket.customer}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-8">
                <div className="flex flex-wrap gap-2">
                  <Badge className={priorityTone(openTicket.priority)}>{openTicket.priority}</Badge>
                  <Badge variant="outline">{openTicket.status}</Badge>
                  <Badge variant="secondary">{openTicket.category}</Badge>
                </div>
                <Info label="Location" value={openTicket.location} />
                <Info label="Machine" value={`${openTicket.machine} · ${openTicket.model}`} />
                <Info label="Problem" value={openTicket.problem} />
                <Info label="Assigned by" value={`${openTicket.assignedBy} at ${openTicket.assignedAt}`} />
                <Info label="Response deadline" value={fmtDue(openTicket.responseDueMins)} />
                <Info label="Next action" value={openTicket.nextAction} />

                <Separator />
                <p className="text-sm font-medium">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => quickCall(openTicket)}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" /> Call Customer
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => startTroubleshooting(openTicket)}>
                    <MonitorPlay className="mr-1.5 h-3.5 w-3.5" /> Troubleshoot
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAction("note", openTicket)}>
                    <StickyNote className="mr-1.5 h-3.5 w-3.5" /> Add Note
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAction("photos", openTicket)}>
                    <Camera className="mr-1.5 h-3.5 w-3.5" /> Request Media
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAction("electrician", openTicket)}>
                    <Wrench className="mr-1.5 h-3.5 w-3.5" /> Electrician
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAction("followup", openTicket)}>
                    <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> Follow-up
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAction("escalate", openTicket)}>
                    <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> Escalate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAction("resolve", openTicket)}>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="col-span-2"
                    onClick={() => openAction("status", openTicket)}
                  >
                    Change Status
                  </Button>
                </div>

                <Separator />
                <p className="text-sm font-medium">Ticket Timeline</p>
                <div className="space-y-2">
                  {openTicket.timeline.map((e, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="w-14 shrink-0 text-xs text-muted-foreground">{e.at}</span>
                      <span className="min-w-0">{e.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Action dialog */}
      <Dialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent className="max-w-md">
          {action && (
            <>
              <DialogHeader>
                <DialogTitle>{ACTION_TITLES[action.kind]}</DialogTitle>
                <DialogDescription>
                  {action.ticket.id} · {action.ticket.customer}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {action.kind === "note" && (
                  <Field label="Note">
                    <Textarea value={field1} onChange={(e) => setField1(e.target.value)} placeholder="What happened / observation" />
                  </Field>
                )}
                {action.kind === "photos" && (
                  <Field label="What should the customer capture?">
                    <Textarea value={field1} onChange={(e) => setField1(e.target.value)} placeholder="e.g. photo of control panel error code, video of spin cycle" />
                  </Field>
                )}
                {action.kind === "electrician" && (
                  <>
                    <Field label="Electrician name">
                      <Input value={field1} onChange={(e) => setField1(e.target.value)} placeholder="Ramesh Yadav" />
                    </Field>
                    <Field label="Scheduled time">
                      <Input value={field2} onChange={(e) => setField2(e.target.value)} placeholder="04:30 PM" />
                    </Field>
                    <Field label="Work required">
                      <Textarea value={field3} onChange={(e) => setField3(e.target.value)} placeholder="Check contactor and wiring" />
                    </Field>
                  </>
                )}
                {action.kind === "followup" && (
                  <>
                    <Field label="Follow-up time">
                      <Input value={field1} onChange={(e) => setField1(e.target.value)} placeholder="Today 05:00 PM" />
                    </Field>
                    <Field label="Purpose (optional)">
                      <Input value={field2} onChange={(e) => setField2(e.target.value)} placeholder="Confirm machine running fine" />
                    </Field>
                  </>
                )}
                {action.kind === "escalate" && (
                  <>
                    <Field label="Troubleshooting completed">
                      <Textarea value={field1} onChange={(e) => setField1(e.target.value)} placeholder="Steps already performed remotely" />
                    </Field>
                    <Field label="Parts suspected">
                      <Input value={field2} onChange={(e) => setField2(e.target.value)} placeholder="Heating element / contactor" />
                    </Field>
                    <Field label="Customer availability">
                      <Input value={field3} onChange={(e) => setField3(e.target.value)} placeholder="Tomorrow 10 AM – 6 PM" />
                    </Field>
                  </>
                )}
                {action.kind === "resolve" && (
                  <>
                    <Field label="Resolution notes (required)">
                      <Textarea value={field1} onChange={(e) => setField1(e.target.value)} placeholder="Root cause and fix applied" />
                    </Field>
                    <Field label="Customer confirmation (required)">
                      <Select value={field2} onValueChange={setField2}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Customer confirmed issue resolved</SelectItem>
                          <SelectItem value="pending">Not yet confirmed</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                )}
                {action.kind === "status" && (
                  <Field label="New status">
                    <Select value={field1} onValueChange={setField1}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {TICKET_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
                <Button onClick={submitAction}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Emergency ticket */}
      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Emergency Ticket</DialogTitle>
            <DialogDescription>Raised as Safety Critical with a 15-minute response target.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Store / franchise">
              <Input value={field1} onChange={(e) => setField1(e.target.value)} placeholder="Clean Craft Bhopal — MP Nagar" />
            </Field>
            <Field label="Problem summary">
              <Textarea value={field2} onChange={(e) => setField2(e.target.value)} placeholder="Describe the emergency" />
            </Field>
            <Field label="Machine (optional)">
              <Input value={field3} onChange={(e) => setField3(e.target.value)} placeholder="Steam Boiler" />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmergencyOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={createEmergency}>Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ACTION_TITLES: Record<string, string> = {
  note: "Add Note",
  photos: "Request Photos or Video",
  electrician: "Coordinate Electrician",
  followup: "Schedule Follow-up",
  escalate: "Escalate to Field Engineer",
  resolve: "Mark Resolved",
  status: "Change Status",
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone?: "bad";
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="min-w-0 truncate text-muted-foreground">{label}</span>
        <span className={`shrink-0 font-medium ${tone === "bad" ? "text-destructive" : ""}`}>{value}</span>
      </div>
      <Progress value={pct} />
    </div>
  );
}

function TicketCard({
  t,
  onView,
  onCall,
  onTroubleshoot,
  onAction,
}: {
  t: SupportTicket;
  onView: () => void;
  onCall: () => void;
  onTroubleshoot: () => void;
  onAction: (kind: string) => void;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold">{t.id}</span>
            <Badge className={priorityTone(t.priority)}>{t.priority}</Badge>
            <Badge variant="outline">{t.status}</Badge>
            <Badge variant="secondary">{t.category}</Badge>
          </div>
          <p className="truncate font-medium">{t.customer}</p>
          <p className="text-sm text-muted-foreground">
            {t.machine} · {t.model}
          </p>
          <p className="text-xs text-muted-foreground">
            Assigned {t.assignedAt} ·{" "}
            <span className={t.responseDueMins < 0 ? "text-destructive font-medium" : ""}>
              {fmtDue(t.responseDueMins)}
            </span>
          </p>
          <p className="text-xs">
            <span className="text-muted-foreground">Next action: </span>
            {t.nextAction}
          </p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0" onClick={onView}>
          View
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button size="sm" onClick={onCall}>
          <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
        </Button>
        <Button size="sm" variant="secondary" onClick={onTroubleshoot}>
          <MonitorPlay className="mr-1.5 h-3.5 w-3.5" /> Troubleshoot
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("note")}>
          Note
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("photos")}>
          Media
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("electrician")}>
          Electrician
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("followup")}>
          Follow-up
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("escalate")}>
          Escalate
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("resolve")}>
          Resolve
        </Button>
      </div>
    </div>
  );
}
