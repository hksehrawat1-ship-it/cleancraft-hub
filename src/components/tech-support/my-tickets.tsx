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
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  History,
  MapPin,
  MonitorPlay,
  Phone,
  Search,
  ShieldAlert,
  StickyNote,
  Ticket as TicketIcon,
  UserCog,
  Wrench,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & sample data                                                 */
/* ------------------------------------------------------------------ */

export const TICKET_WORKFLOW = [
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

export type TicketStatus = (typeof TICKET_WORKFLOW)[number];
type Priority = "Safety Critical" | "Critical" | "High" | "Medium" | "Low";

type TimelineEntry = {
  at: string;
  by: string;
  text: string;
  kind: "system" | "call" | "note" | "status" | "electrician" | "customer";
};

export type SupportTicket = {
  id: string;
  priority: Priority;
  customer: string;
  franchise: string;
  contact: string;
  location: string;
  machine: string;
  model: string;
  serial: string;
  warranty: string;
  category: string;
  summary: string;
  description: string;
  status: TicketStatus;
  assignedBy: string;
  assignedAt: string;
  lastActivity: string;
  nextAction: string;
  nextActionDue: string;
  slaDeadline: string;
  slaMinutesLeft: number;
  engineer: string;
  safetyRisk: boolean;
  breakdown: boolean;
  reopened: boolean;
  inactiveHours: number;
  electrician?: {
    name: string;
    phone: string;
    visit: string;
    confirmed: boolean;
    workDone?: string;
  };
  fieldEngineer?: string;
  parts: string[];
  attachments: { name: string; type: "photo" | "video" | "doc" }[];
  history: { date: string; text: string }[];
  checklist: { label: string; done: boolean }[];
  troubleshooting: {
    symptoms: string;
    errorCode: string;
    checks: string;
    instructions: string;
    customerResponse: string;
    electricianWork: string;
    suspectedCause: string;
    resolution: string;
    parts: string;
    nextAction: string;
  };
  internalNotes: string[];
  customerUpdates: string[];
  timeline: TimelineEntry[];
};

const DEFAULT_TS = {
  symptoms: "",
  errorCode: "",
  checks: "",
  instructions: "",
  customerResponse: "",
  electricianWork: "",
  suspectedCause: "",
  resolution: "",
  parts: "",
  nextAction: "",
};

const CHECKLIST = [
  "Confirmed power supply & voltage",
  "Checked error code on display",
  "Inspected water / steam line",
  "Verified machine settings",
  "Guided customer through reset",
  "Captured photos / video of fault",
];

export const SEED: SupportTicket[] = [
  {
    id: "TS-2041",
    priority: "Safety Critical",
    customer: "Rohit Sharma",
    franchise: "Clean Craft Jaipur — Vaishali Nagar",
    contact: "+91 98290 41122",
    location: "Jaipur, Rajasthan",
    machine: "Dry Cleaning Machine",
    model: "CC-DC 12kg",
    serial: "DC12-JPR-2291",
    warranty: "In warranty — till 12 Mar 2027",
    category: "Electrical / Safety",
    summary: "Burning smell and sparking from control panel",
    description:
      "Owner reports sparking near the control panel with a burning smell during the second cycle. Machine tripped the MCB twice. Store has been asked to keep the machine switched off.",
    status: "Troubleshooting",
    assignedBy: "RM — Neha Kapoor",
    assignedAt: "Today, 08:42",
    lastActivity: "12 min ago — customer call completed",
    nextAction: "Confirm electrician site visit",
    nextActionDue: "Today, 14:30",
    slaDeadline: "Today, 15:00",
    slaMinutesLeft: 45,
    engineer: "You (Amit Verma)",
    safetyRisk: true,
    breakdown: true,
    reopened: false,
    inactiveHours: 0,
    electrician: { name: "Sanjay Electricals", phone: "+91 90010 22331", visit: "Today, 16:00", confirmed: false },
    parts: ["Contactor 25A", "Control panel wiring harness"],
    attachments: [
      { name: "panel-burn-mark.jpg", type: "photo" },
      { name: "sparking-clip.mp4", type: "video" },
    ],
    history: [
      { date: "18 Jun 2026", text: "Preventive maintenance completed" },
      { date: "02 Apr 2026", text: "Heater coil replaced under warranty" },
    ],
    checklist: CHECKLIST.map((label, i) => ({ label, done: i < 3 })),
    troubleshooting: {
      ...DEFAULT_TS,
      symptoms: "Sparking + burning smell from panel, MCB trips",
      errorCode: "E-42",
      checks: "Voltage checked (238V), MCB rating verified",
    },
    internalNotes: ["Do not allow machine restart until electrician clears the panel."],
    customerUpdates: ["Please keep the machine switched off. Electrician visit is being arranged today."],
    timeline: [
      { at: "08:42", by: "RM — Neha Kapoor", text: "Ticket assigned to Technical Support", kind: "system" },
      { at: "09:05", by: "You", text: "Called customer, confirmed sparking and burning smell", kind: "call" },
      { at: "09:20", by: "You", text: "Status changed to Troubleshooting", kind: "status" },
    ],
  },
  {
    id: "TS-2040",
    priority: "Critical",
    customer: "Meena Agarwal",
    franchise: "Clean Craft Indore — Vijay Nagar",
    contact: "+91 98260 77410",
    location: "Indore, Madhya Pradesh",
    machine: "Steam Boiler",
    model: "CC-SB 24L",
    serial: "SB24-IND-1180",
    warranty: "AMC active — till 30 Sep 2026",
    category: "Steam / Boiler",
    summary: "Complete machine breakdown — no steam generation",
    description: "Boiler not building pressure since morning. Store unable to process delivery orders.",
    status: "Awaiting Electrician",
    assignedBy: "RM — Neha Kapoor",
    assignedAt: "Today, 07:55",
    lastActivity: "40 min ago — electrician coordinated",
    nextAction: "Confirm electrician arrival",
    nextActionDue: "Today, 13:00",
    slaDeadline: "Today, 13:30",
    slaMinutesLeft: -25,
    engineer: "You (Amit Verma)",
    safetyRisk: false,
    breakdown: true,
    reopened: false,
    inactiveHours: 1,
    electrician: { name: "Ravi Power Solutions", phone: "+91 91110 44562", visit: "Today, 12:30", confirmed: true },
    parts: ["Pressure switch"],
    attachments: [{ name: "boiler-gauge.jpg", type: "photo" }],
    history: [{ date: "11 May 2026", text: "Pressure switch cleaned" }],
    checklist: CHECKLIST.map((label, i) => ({ label, done: i < 4 })),
    troubleshooting: {
      ...DEFAULT_TS,
      symptoms: "No steam, gauge stays at 0 bar",
      errorCode: "P-01",
      checks: "Water level verified, heating element continuity checked",
      instructions: "Asked customer to drain and refill boiler",
    },
    internalNotes: ["Pressure switch likely faulty — keep spare ready."],
    customerUpdates: ["Electrician confirmed for 12:30 PM today."],
    timeline: [
      { at: "07:55", by: "RM — Neha Kapoor", text: "Ticket assigned", kind: "system" },
      { at: "08:30", by: "You", text: "Remote troubleshooting session completed", kind: "note" },
      { at: "11:20", by: "You", text: "Electrician Ravi Power Solutions confirmed", kind: "electrician" },
    ],
  },
  {
    id: "TS-2039",
    priority: "High",
    customer: "Karan Malhotra",
    franchise: "Clean Craft Lucknow — Gomti Nagar",
    contact: "+91 94150 88123",
    location: "Lucknow, Uttar Pradesh",
    machine: "Hydro Extractor",
    model: "CC-HX 15kg",
    serial: "HX15-LKO-0442",
    warranty: "In warranty — till 08 Jan 2027",
    category: "Mechanical",
    summary: "Excess vibration and noise at high spin",
    description: "Loud rattling noise beyond 800 RPM. Suspected drum imbalance or damaged mount.",
    status: "Awaiting Customer",
    assignedBy: "RM — Vikram Singh",
    assignedAt: "Yesterday, 17:10",
    lastActivity: "3 h ago — photos requested",
    nextAction: "Follow up for video of spin cycle",
    nextActionDue: "Today, 17:00",
    slaDeadline: "Tomorrow, 11:00",
    slaMinutesLeft: 1320,
    engineer: "You (Amit Verma)",
    safetyRisk: false,
    breakdown: false,
    reopened: true,
    inactiveHours: 3,
    parts: [],
    attachments: [],
    history: [{ date: "20 Feb 2026", text: "Drum mount bolts tightened" }],
    checklist: CHECKLIST.map((label, i) => ({ label, done: i < 2 })),
    troubleshooting: { ...DEFAULT_TS, symptoms: "Rattling above 800 RPM" },
    internalNotes: ["Reopened — same fault reported within 30 days."],
    customerUpdates: ["Please share a short video of the spin cycle."],
    timeline: [
      { at: "17:10", by: "RM — Vikram Singh", text: "Ticket assigned", kind: "system" },
      { at: "18:02", by: "You", text: "Requested video of spin cycle", kind: "customer" },
    ],
  },
  {
    id: "TS-2038",
    priority: "Medium",
    customer: "Pooja Nair",
    franchise: "Clean Craft Surat — Adajan",
    contact: "+91 99250 31207",
    location: "Surat, Gujarat",
    machine: "Steam Iron Station",
    model: "CC-SI Pro",
    serial: "SIP-SRT-7731",
    warranty: "Out of warranty",
    category: "Steam / Boiler",
    summary: "Low steam pressure at iron table",
    description: "Steam output drops after 15 minutes of continuous ironing.",
    status: "Monitoring",
    assignedBy: "RM — Neha Kapoor",
    assignedAt: "Yesterday, 11:20",
    lastActivity: "Yesterday, 18:40 — descaling guided",
    nextAction: "Check with store after 48 h monitoring",
    nextActionDue: "Tomorrow, 12:00",
    slaDeadline: "Tomorrow, 18:00",
    slaMinutesLeft: 1740,
    engineer: "You (Amit Verma)",
    safetyRisk: false,
    breakdown: false,
    reopened: false,
    inactiveHours: 14,
    parts: [],
    attachments: [{ name: "iron-station.jpg", type: "photo" }],
    history: [{ date: "09 Jan 2026", text: "Descaling performed" }],
    checklist: CHECKLIST.map((label) => ({ label, done: true })),
    troubleshooting: {
      ...DEFAULT_TS,
      symptoms: "Steam drops after 15 min",
      checks: "Scale build-up found in boiler tank",
      instructions: "Descaling procedure shared with store",
      customerResponse: "Improved after descaling",
      suspectedCause: "Hard water scaling",
      nextAction: "Monitor for 48 hours",
    },
    internalNotes: ["Recommend water softener quotation."],
    customerUpdates: ["Descaling done. We will check again after 48 hours."],
    timeline: [
      { at: "11:20", by: "RM — Neha Kapoor", text: "Ticket assigned", kind: "system" },
      { at: "18:40", by: "You", text: "Descaling guided, moved to Monitoring", kind: "status" },
    ],
  },
  {
    id: "TS-2037",
    priority: "High",
    customer: "Devendra Joshi",
    franchise: "Clean Craft Agra — Sikandra",
    contact: "+91 93190 55004",
    location: "Agra, Uttar Pradesh",
    machine: "Washer Extractor",
    model: "CC-WX 20kg",
    serial: "WX20-AGR-3390",
    warranty: "In warranty — till 22 Nov 2026",
    category: "Electronics / PCB",
    summary: "Display board dead, machine not starting",
    description: "PCB display blank after voltage fluctuation. Remote troubleshooting unsuccessful.",
    status: "Escalated to Field Engineer",
    assignedBy: "RM — Vikram Singh",
    assignedAt: "Yesterday, 09:05",
    lastActivity: "Today, 09:15 — escalated",
    nextAction: "Field Engineer site visit",
    nextActionDue: "Today, 16:00",
    slaDeadline: "Today, 18:00",
    slaMinutesLeft: 300,
    engineer: "You (Amit Verma)",
    fieldEngineer: "Field Engineer — Suresh Rathore",
    safetyRisk: false,
    breakdown: true,
    reopened: false,
    inactiveHours: 2,
    parts: ["Main PCB", "Display membrane"],
    attachments: [{ name: "pcb-blank.jpg", type: "photo" }, { name: "warranty-card.pdf", type: "doc" }],
    history: [{ date: "14 Mar 2026", text: "Installation & commissioning" }],
    checklist: CHECKLIST.map((label) => ({ label, done: true })),
    troubleshooting: {
      ...DEFAULT_TS,
      symptoms: "Blank display, no response to power",
      errorCode: "—",
      checks: "Supply verified, fuse checked, PCB reseated",
      suspectedCause: "PCB damaged by voltage surge",
      parts: "Main PCB, display membrane",
      nextAction: "Field visit with replacement PCB",
    },
    internalNotes: ["Carry stabilizer recommendation for the site."],
    customerUpdates: ["Our field engineer will visit today with a replacement board."],
    timeline: [
      { at: "09:05", by: "RM — Vikram Singh", text: "Ticket assigned", kind: "system" },
      { at: "09:15", by: "You", text: "Escalated to Field Engineer Suresh Rathore", kind: "status" },
    ],
  },
  {
    id: "TS-2036",
    priority: "Low",
    customer: "Anita Desai",
    franchise: "Clean Craft Pune — Kothrud",
    contact: "+91 98220 66713",
    location: "Pune, Maharashtra",
    machine: "Packing Machine",
    model: "CC-PK Mini",
    serial: "PKM-PUN-2210",
    warranty: "In warranty — till 05 Aug 2027",
    category: "Mechanical",
    summary: "Sealing bar heating unevenly",
    description: "Poly bags not sealing at one end.",
    status: "New",
    assignedBy: "RM — Neha Kapoor",
    assignedAt: "Today, 11:35",
    lastActivity: "Assigned 35 min ago",
    nextAction: "",
    nextActionDue: "",
    slaDeadline: "Today, 19:00",
    slaMinutesLeft: 360,
    engineer: "You (Amit Verma)",
    safetyRisk: false,
    breakdown: false,
    reopened: false,
    inactiveHours: 0,
    parts: [],
    attachments: [],
    history: [],
    checklist: CHECKLIST.map((label) => ({ label, done: false })),
    troubleshooting: { ...DEFAULT_TS },
    internalNotes: [],
    customerUpdates: [],
    timeline: [{ at: "11:35", by: "RM — Neha Kapoor", text: "Ticket assigned", kind: "system" }],
  },
  {
    id: "TS-2035",
    priority: "Medium",
    customer: "Imran Qureshi",
    franchise: "Clean Craft Bhopal — MP Nagar",
    contact: "+91 94250 12290",
    location: "Bhopal, Madhya Pradesh",
    machine: "Dry Cleaning Machine",
    model: "CC-DC 8kg",
    serial: "DC08-BPL-5512",
    warranty: "AMC active — till 14 Dec 2026",
    category: "Solvent / Filter",
    summary: "Solvent filter clogging frequently",
    description: "Filter pressure rising within two cycles.",
    status: "Resolved",
    assignedBy: "RM — Vikram Singh",
    assignedAt: "Today, 08:10",
    lastActivity: "Today, 10:50 — resolved",
    nextAction: "Await closure review",
    nextActionDue: "Today, 18:00",
    slaDeadline: "Today, 14:00",
    slaMinutesLeft: 120,
    engineer: "You (Amit Verma)",
    safetyRisk: false,
    breakdown: false,
    reopened: false,
    inactiveHours: 1,
    parts: ["Filter cartridge"],
    attachments: [],
    history: [{ date: "05 Feb 2026", text: "Filter cartridge replaced" }],
    checklist: CHECKLIST.map((label) => ({ label, done: true })),
    troubleshooting: {
      ...DEFAULT_TS,
      symptoms: "Filter pressure rising early",
      checks: "Filter inspected, lint trap cleaned",
      resolution: "Cartridge replaced, lint trap cleaning schedule set",
      suspectedCause: "Lint overload",
    },
    internalNotes: ["Store trained on daily lint trap cleaning."],
    customerUpdates: ["Issue resolved. Please clean the lint trap daily."],
    timeline: [
      { at: "08:10", by: "RM — Vikram Singh", text: "Ticket assigned", kind: "system" },
      { at: "10:50", by: "You", text: "Marked Resolved — cartridge replaced", kind: "status" },
    ],
  },
  {
    id: "TS-2034",
    priority: "Low",
    customer: "Sneha Reddy",
    franchise: "Clean Craft Nagpur — Dharampeth",
    contact: "+91 90280 74119",
    location: "Nagpur, Maharashtra",
    machine: "Steam Iron Station",
    model: "CC-SI Lite",
    serial: "SIL-NAG-8890",
    warranty: "Out of warranty",
    category: "Electrical / Safety",
    summary: "Iron table light not working",
    description: "Table lamp fused.",
    status: "Closed",
    assignedBy: "RM — Neha Kapoor",
    assignedAt: "Yesterday, 15:00",
    lastActivity: "Yesterday, 16:20 — closed",
    nextAction: "",
    nextActionDue: "",
    slaDeadline: "Yesterday, 19:00",
    slaMinutesLeft: 0,
    engineer: "You (Amit Verma)",
    safetyRisk: false,
    breakdown: false,
    reopened: false,
    inactiveHours: 20,
    parts: [],
    attachments: [],
    history: [],
    checklist: CHECKLIST.map((label) => ({ label, done: true })),
    troubleshooting: { ...DEFAULT_TS, resolution: "Lamp replaced by local electrician" },
    internalNotes: [],
    customerUpdates: ["Closed after customer confirmation."],
    timeline: [{ at: "16:20", by: "You", text: "Ticket closed after customer confirmation", kind: "status" }],
  },
];

const TABS: { key: string; label: string; match: (t: SupportTicket) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "new", label: "New", match: (t) => t.status === "New" || t.status === "Assigned" },
  {
    key: "progress",
    label: "In Progress",
    match: (t) => t.status === "Contacting Customer" || t.status === "Troubleshooting",
  },
  { key: "cust", label: "Awaiting Customer", match: (t) => t.status === "Awaiting Customer" },
  {
    key: "elec",
    label: "Awaiting Electrician",
    match: (t) => t.status === "Awaiting Electrician" || t.status === "Electrician Visit Scheduled",
  },
  { key: "monitor", label: "Monitoring", match: (t) => t.status === "Monitoring" },
  { key: "escreq", label: "Escalation Required", match: (t) => t.status === "Escalation Required" },
  { key: "esc", label: "Escalated", match: (t) => t.status === "Escalated to Field Engineer" },
  { key: "resolved", label: "Resolved", match: (t) => t.status === "Resolved" },
  { key: "closed", label: "Closed", match: (t) => t.status === "Closed" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const now = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

function priorityClass(p: Priority) {
  switch (p) {
    case "Safety Critical":
      return "bg-red-900 text-white border-red-900";
    case "Critical":
      return "bg-red-600 text-white border-red-600";
    case "High":
      return "bg-amber-500 text-white border-amber-500";
    case "Medium":
      return "bg-blue-500 text-white border-blue-500";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function rowClass(t: SupportTicket) {
  if (t.safetyRisk) return "bg-red-950/10 border-l-4 border-l-red-900";
  if (t.breakdown) return "bg-red-500/5 border-l-4 border-l-red-600";
  if (t.slaMinutesLeft < 0) return "bg-red-500/5 border-l-4 border-l-red-500";
  if (t.slaMinutesLeft <= 60) return "bg-amber-500/10 border-l-4 border-l-amber-500";
  if (t.reopened) return "border-l-4 border-l-purple-500";
  if (!t.nextAction) return "border-l-4 border-l-orange-400";
  return "border-l-4 border-l-transparent";
}

function slaLabel(t: SupportTicket) {
  if (t.status === "Closed") return { text: "—", cls: "text-muted-foreground" };
  if (t.slaMinutesLeft < 0)
    return { text: `Overdue ${Math.abs(t.slaMinutesLeft)}m`, cls: "text-red-600 font-semibold" };
  if (t.slaMinutesLeft <= 60)
    return { text: `Due in ${t.slaMinutesLeft}m`, cls: "text-amber-600 font-semibold" };
  return { text: t.slaDeadline, cls: "text-muted-foreground" };
}

const uniq = (arr: string[]) => Array.from(new Set(arr)).sort();

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function MySupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const [fPriority, setFPriority] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fCustomer, setFCustomer] = useState("all");
  const [fLocation, setFLocation] = useState("all");
  const [fMachine, setFMachine] = useState("all");
  const [fModel, setFModel] = useState("all");
  const [fCategory, setFCategory] = useState("all");
  const [fAssigned, setFAssigned] = useState("all");
  const [fDue, setFDue] = useState("all");
  const [fSla, setFSla] = useState("all");
  const [fElec, setFElec] = useState("all");
  const [fEsc, setFEsc] = useState("all");

  const [dialog, setDialog] = useState<
    | null
    | { type: "note" | "media" | "electrician" | "followup" | "escalate" | "resolve" | "troubleshoot"; id: string }
  >(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const selected = tickets.find((t) => t.id === openId) ?? null;
  const dialogTicket = tickets.find((t) => t.id === dialog?.id) ?? null;

  const update = (id: string, fn: (t: SupportTicket) => SupportTicket) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));

  const log = (id: string, entry: Omit<TimelineEntry, "at" | "by"> & { by?: string }) =>
    update(id, (t) => ({
      ...t,
      lastActivity: `Just now — ${entry.text}`,
      timeline: [...t.timeline, { at: now(), by: entry.by ?? "You", text: entry.text, kind: entry.kind }],
    }));

  const filtered = useMemo(() => {
    const tabDef = TABS.find((x) => x.key === tab)!;
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (!tabDef.match(t)) return false;
      if (
        q &&
        ![t.id, t.customer, t.franchise, t.location, t.machine, t.model, t.summary, t.serial]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (fPriority !== "all" && t.priority !== fPriority) return false;
      if (fStatus !== "all" && t.status !== fStatus) return false;
      if (fCustomer !== "all" && t.franchise !== fCustomer) return false;
      if (fLocation !== "all" && t.location !== fLocation) return false;
      if (fMachine !== "all" && t.machine !== fMachine) return false;
      if (fModel !== "all" && t.model !== fModel) return false;
      if (fCategory !== "all" && t.category !== fCategory) return false;
      if (fAssigned !== "all" && !t.assignedAt.toLowerCase().startsWith(fAssigned.toLowerCase())) return false;
      if (fDue !== "all") {
        const due = (t.nextActionDue || t.slaDeadline).toLowerCase();
        if (fDue === "today" && !due.startsWith("today")) return false;
        if (fDue === "tomorrow" && !due.startsWith("tomorrow")) return false;
        if (fDue === "none" && t.nextActionDue) return false;
      }
      if (fSla === "overdue" && t.slaMinutesLeft >= 0) return false;
      if (fSla === "1h" && !(t.slaMinutesLeft >= 0 && t.slaMinutesLeft <= 60)) return false;
      if (fSla === "ontrack" && t.slaMinutesLeft <= 60) return false;
      if (fElec === "yes" && !t.electrician) return false;
      if (fElec === "no" && t.electrician) return false;
      if (fElec === "unconfirmed" && !(t.electrician && !t.electrician.confirmed)) return false;
      if (fEsc === "yes" && !t.fieldEngineer) return false;
      if (fEsc === "no" && t.fieldEngineer) return false;
      return true;
    });
  }, [tickets, tab, query, fPriority, fStatus, fCustomer, fLocation, fMachine, fModel, fCategory, fAssigned, fDue, fSla, fElec, fEsc]);

  const stats = useMemo(() => {
    const active = tickets.filter((t) => t.status !== "Closed" && t.status !== "Resolved");
    return {
      active: active.length,
      fresh: tickets.filter((t) => t.status === "New" || t.status === "Assigned").length,
      dueToday: active.filter((t) => (t.nextActionDue || t.slaDeadline).startsWith("Today")).length,
      overdue: active.filter((t) => t.slaMinutesLeft < 0).length,
      resolvedToday: tickets.filter((t) => t.status === "Resolved").length,
    };
  }, [tickets]);

  const alerts = useMemo(() => {
    const list: { text: string; tone: string }[] = [];
    tickets.forEach((t) => {
      if (t.safetyRisk) list.push({ text: `${t.id} — safety-critical issue at ${t.location}`, tone: "bg-red-900 text-white" });
      else if (t.breakdown && t.status !== "Resolved" && t.status !== "Closed")
        list.push({ text: `${t.id} — complete machine breakdown`, tone: "bg-red-600 text-white" });
      if (t.slaMinutesLeft < 0 && t.status !== "Closed")
        list.push({ text: `${t.id} — SLA overdue`, tone: "bg-red-500/15 text-red-700" });
      else if (t.slaMinutesLeft >= 0 && t.slaMinutesLeft <= 60 && t.status !== "Closed" && t.status !== "Resolved")
        list.push({ text: `${t.id} — SLA due within 1 hour`, tone: "bg-amber-500/15 text-amber-700" });
      if (!t.nextAction && t.status !== "Closed")
        list.push({ text: `${t.id} — no next action set`, tone: "bg-orange-500/15 text-orange-700" });
      if (t.electrician && !t.electrician.confirmed)
        list.push({ text: `${t.id} — electrician visit awaiting confirmation`, tone: "bg-blue-500/15 text-blue-700" });
      if (t.inactiveHours >= 12 && t.status !== "Closed")
        list.push({ text: `${t.id} — inactive for ${t.inactiveHours}h`, tone: "bg-muted text-foreground" });
      if (t.reopened) list.push({ text: `${t.id} — reopened ticket`, tone: "bg-purple-500/15 text-purple-700" });
    });
    return list;
  }, [tickets]);

  /* ------------------------- quick actions ------------------------- */
  const callCustomer = (t: SupportTicket) => {
    update(t.id, (x) => ({ ...x, status: x.status === "New" ? "Contacting Customer" : x.status }));
    log(t.id, { text: `Call logged with ${t.customer}`, kind: "call" });
    toast.success(`Call logged for ${t.id}`);
  };

  const startTroubleshooting = (t: SupportTicket) => {
    update(t.id, (x) => ({ ...x, status: "Troubleshooting", nextAction: x.nextAction || "Complete troubleshooting checklist" }));
    log(t.id, { text: "Troubleshooting started", kind: "status" });
    setDialog({ type: "troubleshoot", id: t.id });
    setForm({ ...t.troubleshooting });
  };

  const submitDialog = () => {
    if (!dialog || !dialogTicket) return;
    const id = dialog.id;
    switch (dialog.type) {
      case "note":
        if (!form.note?.trim()) return toast.error("Add a note first");
        update(id, (t) => ({ ...t, internalNotes: [...t.internalNotes, form.note] }));
        log(id, { text: `Internal note added`, kind: "note" });
        toast.success("Note added");
        break;
      case "media":
        update(id, (t) => ({
          ...t,
          status: "Awaiting Customer",
          nextAction: "Follow up for photos / video",
          nextActionDue: "Today, 18:00",
          customerUpdates: [...t.customerUpdates, form.msg || "Please share photos / video of the issue."],
        }));
        log(id, { text: "Photos / video requested from customer", kind: "customer" });
        toast.success("Media request recorded");
        break;
      case "electrician":
        if (!form.name?.trim() || !form.visit?.trim()) return toast.error("Electrician name and visit time required");
        update(id, (t) => ({
          ...t,
          status: "Electrician Visit Scheduled",
          nextAction: "Confirm electrician visit",
          nextActionDue: form.visit,
          electrician: { name: form.name, phone: form.phone || "—", visit: form.visit, confirmed: false },
        }));
        log(id, { text: `Electrician ${form.name} coordinated for ${form.visit}`, kind: "electrician" });
        toast.success("Electrician coordination saved — visible in Electrician Coordination");
        break;
      case "followup":
        if (!form.when?.trim()) return toast.error("Pick a follow-up time");
        update(id, (t) => ({ ...t, nextAction: form.what || "Follow up with customer", nextActionDue: form.when }));
        log(id, { text: `Follow-up scheduled for ${form.when}`, kind: "note" });
        toast.success("Follow-up added to Follow-ups & Reminders");
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
          parts: form.parts ? form.parts.split(",").map((p) => p.trim()).filter(Boolean) : t.parts,
          troubleshooting: { ...t.troubleshooting, suspectedCause: form.fault, nextAction: "Field visit" },
        }));
        log(id, {
          text: `Escalated to Field Engineer — ${form.reason} (urgency: ${form.urgency || "High"})`,
          kind: "status",
        });
        toast.success("Escalated — same ticket record shared with the Field Engineer");
        break;
      case "resolve":
        if (!form.root?.trim() || !form.work?.trim() || !form.notes?.trim() || !form.machineStatus || form.confirm !== "yes")
          return toast.error("Root cause, work completed, notes, machine status and customer confirmation are required");
        update(id, (t) => ({
          ...t,
          status: form.monitoring && form.monitoring !== "none" ? "Monitoring" : "Resolved",
          nextAction: form.monitoring && form.monitoring !== "none" ? `Monitor for ${form.monitoring}` : "Await closure review",
          troubleshooting: { ...t.troubleshooting, suspectedCause: form.root, resolution: form.work },
          customerUpdates: [...t.customerUpdates, form.notes],
        }));
        log(id, { text: `Resolution recorded — ${form.root}`, kind: "status" });
        toast.success("Resolution recorded — Dashboard and Performance updated");
        break;
      case "troubleshoot":
        update(id, (t) => ({
          ...t,
          troubleshooting: { ...t.troubleshooting, ...(form as Partial<SupportTicket["troubleshooting"]>) },
          nextAction: form.nextAction || t.nextAction,
        }));
        log(id, { text: "Troubleshooting record updated", kind: "note" });
        toast.success("Troubleshooting record saved");
        break;
    }
    setDialog(null);
    setForm({});
  };

  const openDialog = (type: NonNullable<typeof dialog>["type"], t: SupportTicket) => {
    setDialog({ type, id: t.id });
    setForm(type === "troubleshoot" ? { ...t.troubleshooting } : {});
  };

  /* ------------------------------ UI ------------------------------- */
  const actions = (t: SupportTicket) => (
    <div className="flex flex-wrap gap-1">
      <Button size="sm" variant="outline" onClick={() => callCustomer(t)}><Phone className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="outline" onClick={() => startTroubleshooting(t)}><MonitorPlay className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="outline" onClick={() => openDialog("note", t)}><StickyNote className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="outline" onClick={() => openDialog("media", t)}><Camera className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="outline" onClick={() => openDialog("electrician", t)}><UserCog className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="outline" onClick={() => openDialog("followup", t)}><CalendarClock className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="outline" onClick={() => openDialog("escalate", t)}><ArrowUpRight className="w-3.5 h-3.5" /></Button>
      <Button size="sm" variant="outline" onClick={() => openDialog("resolve", t)}><CheckCircle2 className="w-3.5 h-3.5" /></Button>
      <Button size="sm" onClick={() => setOpenId(t.id)}>View</Button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">My Support Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Machine tickets assigned to you by the Relationship Manager.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ticket, customer, machine, serial..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Active Tickets", value: stats.active, icon: TicketIcon, tone: "text-primary" },
          { label: "New Tickets", value: stats.fresh, icon: FileText, tone: "text-blue-600" },
          { label: "Due Today", value: stats.dueToday, icon: Clock, tone: "text-amber-600" },
          { label: "Overdue Tickets", value: stats.overdue, icon: AlertTriangle, tone: "text-red-600" },
          { label: "Resolved Today", value: stats.resolvedToday, icon: CheckCircle2, tone: "text-emerald-600" },
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

      {/* Attention alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <span key={i} className={`text-xs rounded-md px-2 py-1 ${a.tone}`}>{a.text}</span>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tb) => {
          const count = tickets.filter(tb.match).length;
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
                active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
              }`}
            >
              {tb.label} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
          <FilterSelect label="Priority" value={fPriority} onChange={setFPriority} options={["Safety Critical", "Critical", "High", "Medium", "Low"]} />
          <FilterSelect label="Status" value={fStatus} onChange={setFStatus} options={[...TICKET_WORKFLOW]} />
          <FilterSelect label="Customer / Franchise" value={fCustomer} onChange={setFCustomer} options={uniq(tickets.map((t) => t.franchise))} />
          <FilterSelect label="Location" value={fLocation} onChange={setFLocation} options={uniq(tickets.map((t) => t.location))} />
          <FilterSelect label="Machine type" value={fMachine} onChange={setFMachine} options={uniq(tickets.map((t) => t.machine))} />
          <FilterSelect label="Machine model" value={fModel} onChange={setFModel} options={uniq(tickets.map((t) => t.model))} />
          <FilterSelect label="Issue category" value={fCategory} onChange={setFCategory} options={uniq(tickets.map((t) => t.category))} />
          <FilterSelect label="Assigned date" value={fAssigned} onChange={setFAssigned} options={["Today", "Yesterday"]} />
          <FilterSelect label="Due date" value={fDue} onChange={setFDue} options={["today", "tomorrow", "none"]} labels={{ today: "Today", tomorrow: "Tomorrow", none: "No due date" }} />
          <FilterSelect label="SLA status" value={fSla} onChange={setFSla} options={["overdue", "1h", "ontrack"]} labels={{ overdue: "Overdue", "1h": "Due in 1 hour", ontrack: "On track" }} />
          <FilterSelect label="Electrician" value={fElec} onChange={setFElec} options={["yes", "no", "unconfirmed"]} labels={{ yes: "Involved", no: "Not involved", unconfirmed: "Awaiting confirmation" }} />
          <FilterSelect label="FE escalation" value={fEsc} onChange={setFEsc} options={["yes", "no"]} labels={{ yes: "Escalated", no: "Not escalated" }} />
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                {["Priority", "Ticket", "Customer / Franchise", "Location", "Machine", "Problem", "Status", "Assigned by", "Assigned", "Last activity", "Next action", "SLA", "Engineer", "Actions"].map((h) => (
                  <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((t) => {
                const sla = slaLabel(t);
                return (
                  <tr key={t.id} className={`${rowClass(t)} hover:bg-muted/30`}>
                    <td className="px-3 py-2"><Badge className={priorityClass(t.priority)}>{t.priority}</Badge></td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{t.id}</td>
                    <td className="px-3 py-2"><div className="font-medium">{t.customer}</div><div className="text-xs text-muted-foreground">{t.franchise}</div></td>
                    <td className="px-3 py-2 text-xs">{t.location}</td>
                    <td className="px-3 py-2 text-xs">{t.machine}<div className="text-muted-foreground">{t.model}</div></td>
                    <td className="px-3 py-2 max-w-[220px]"><div className="truncate">{t.summary}</div></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="whitespace-nowrap">{t.status}</Badge></td>
                    <td className="px-3 py-2 text-xs">{t.assignedBy}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">{t.assignedAt}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-[160px] truncate">{t.lastActivity}</td>
                    <td className="px-3 py-2 text-xs">
                      {t.nextAction ? (<><div>{t.nextAction}</div><div className="text-muted-foreground">{t.nextActionDue}</div></>) : (<span className="text-orange-600 font-medium">Not set</span>)}
                    </td>
                    <td className={`px-3 py-2 text-xs whitespace-nowrap ${sla.cls}`}>{sla.text}</td>
                    <td className="px-3 py-2 text-xs">{t.engineer}{t.fieldEngineer && <div className="text-muted-foreground">{t.fieldEngineer}</div>}</td>
                    <td className="px-3 py-2">{actions(t)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={14} className="px-3 py-10 text-center text-muted-foreground">No tickets match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((t) => {
          const sla = slaLabel(t);
          return (
            <Card key={t.id} className={rowClass(t)}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge className={priorityClass(t.priority)}>{t.priority}</Badge>
                    <span className="font-medium truncate">{t.id}</span>
                  </div>
                  <Badge variant="outline">{t.status}</Badge>
                </div>
                <div className="text-sm font-medium">{t.summary}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{t.franchise} · {t.location}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Wrench className="w-3 h-3" />{t.machine} · {t.model}</div>
                <div className="text-xs">Next: {t.nextAction || <span className="text-orange-600">Not set</span>} {t.nextActionDue && `· ${t.nextActionDue}`}</div>
                <div className={`text-xs ${sla.cls}`}>SLA: {sla.text}</div>
                <div className="text-xs text-muted-foreground">Assigned by {t.assignedBy} · {t.assignedAt}</div>
                {actions(t)}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No tickets match the current filters.</div>}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selected.id}
                  <Badge className={priorityClass(selected.priority)}>{selected.priority}</Badge>
                </SheetTitle>
                <SheetDescription>{selected.summary}</SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-8 space-y-5 text-sm">
                {selected.safetyRisk && (
                  <div className="rounded-md bg-red-900 text-white text-xs px-3 py-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Safety-critical — machine must stay switched off.
                  </div>
                )}

                <Section title="Customer & site">
                  <Row k="Customer" v={selected.customer} />
                  <Row k="Franchise" v={selected.franchise} />
                  <Row k="Contact" v={selected.contact} />
                  <Row k="Location" v={selected.location} />
                </Section>

                <Section title="Machine">
                  <Row k="Machine" v={`${selected.machine} · ${selected.model}`} />
                  <Row k="Serial number" v={selected.serial} />
                  <Row k="Warranty / contract" v={selected.warranty} />
                  <Row k="Issue category" v={selected.category} />
                </Section>

                <Section title="Issue description"><p className="text-muted-foreground">{selected.description}</p></Section>

                <Section title="Photos, videos & documents">
                  {selected.attachments.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((a) => (
                        <span key={a.name} className="text-xs rounded border px-2 py-1 bg-muted/40">{a.name}</span>
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground text-xs">No media uploaded yet.</p>}
                </Section>

                <Section title="Troubleshooting checklist">
                  <div className="space-y-2">
                    {selected.checklist.map((c, i) => (
                      <label key={c.label} className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={c.done}
                          onCheckedChange={(v) =>
                            update(selected.id, (t) => ({
                              ...t,
                              checklist: t.checklist.map((x, xi) => (xi === i ? { ...x, done: !!v } : x)),
                            }))
                          }
                        />
                        <span className={c.done ? "line-through text-muted-foreground" : ""}>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </Section>

                <Section title="Troubleshooting record">
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {Object.entries(selected.troubleshooting).map(([k, v]) => (
                      <Row key={k} k={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} v={v || "—"} />
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => openDialog("troubleshoot", selected)}>
                    Update record
                  </Button>
                </Section>

                <Section title="Electrician">
                  {selected.electrician ? (
                    <>
                      <Row k="Name" v={selected.electrician.name} />
                      <Row k="Phone" v={selected.electrician.phone} />
                      <Row k="Visit" v={selected.electrician.visit} />
                      <Row k="Status" v={selected.electrician.confirmed ? "Confirmed" : "Awaiting confirmation"} />
                      {!selected.electrician.confirmed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            update(selected.id, (t) => ({ ...t, electrician: t.electrician ? { ...t.electrician, confirmed: true } : t.electrician }));
                            log(selected.id, { text: "Electrician visit confirmed", kind: "electrician" });
                            toast.success("Electrician visit confirmed");
                          }}
                        >
                          Mark visit confirmed
                        </Button>
                      )}
                    </>
                  ) : <p className="text-muted-foreground text-xs">No electrician involved.</p>}
                </Section>

                <Section title="Parts suspected / required">
                  {selected.parts.length ? (
                    <ul className="list-disc pl-5 text-xs text-muted-foreground">{selected.parts.map((p) => <li key={p}>{p}</li>)}</ul>
                  ) : <p className="text-muted-foreground text-xs">None recorded.</p>}
                </Section>

                <Section title="Next action">
                  <Row k="Action" v={selected.nextAction || "Not set"} />
                  <Row k="Due" v={selected.nextActionDue || "—"} />
                  <Row k="SLA deadline" v={selected.slaDeadline} />
                </Section>

                <Section title="Activity timeline">
                  <div className="space-y-2">
                    {selected.timeline.map((e, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-muted-foreground w-12 shrink-0">{e.at}</span>
                        <span><span className="font-medium">{e.by}</span> — {e.text}</span>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Previous service history">
                  {selected.history.length ? selected.history.map((h) => (
                    <div key={h.date} className="text-xs flex items-center gap-2"><History className="w-3 h-3 text-muted-foreground" />{h.date} — {h.text}</div>
                  )) : <p className="text-muted-foreground text-xs">No previous service records.</p>}
                </Section>

                <Section title="Internal notes">
                  {selected.internalNotes.length ? selected.internalNotes.map((n, i) => (
                    <div key={i} className="text-xs rounded bg-muted/50 px-2 py-1">{n}</div>
                  )) : <p className="text-muted-foreground text-xs">No internal notes.</p>}
                </Section>

                <Section title="Customer-visible updates">
                  {selected.customerUpdates.length ? selected.customerUpdates.map((n, i) => (
                    <div key={i} className="text-xs rounded border px-2 py-1">{n}</div>
                  )) : <p className="text-muted-foreground text-xs">No updates shared yet.</p>}
                </Section>

                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => callCustomer(selected)}><Phone className="w-3.5 h-3.5 mr-1" />Call</Button>
                  <Button size="sm" variant="outline" onClick={() => openDialog("note", selected)}><StickyNote className="w-3.5 h-3.5 mr-1" />Note</Button>
                  <Button size="sm" variant="outline" onClick={() => openDialog("escalate", selected)}><ArrowUpRight className="w-3.5 h-3.5 mr-1" />Escalate</Button>
                  <Button size="sm" onClick={() => openDialog("resolve", selected)}><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Mark Resolved</Button>
                  {selected.status === "Resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        update(selected.id, (t) => ({ ...t, status: "Closed", nextAction: "" }));
                        log(selected.id, { text: "Ticket closed after customer confirmation", kind: "status" });
                        toast.success("Ticket closed");
                      }}
                    >
                      Close ticket
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Action dialogs */}
      <Dialog open={!!dialog} onOpenChange={(o) => { if (!o) { setDialog(null); setForm({}); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {dialog && dialogTicket && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {dialog.type === "note" && "Add internal note"}
                  {dialog.type === "media" && "Request photos or video"}
                  {dialog.type === "electrician" && "Coordinate electrician"}
                  {dialog.type === "followup" && "Schedule follow-up"}
                  {dialog.type === "escalate" && "Escalate to Field Engineer"}
                  {dialog.type === "resolve" && "Mark ticket resolved"}
                  {dialog.type === "troubleshoot" && "Troubleshooting record"}
                </DialogTitle>
                <DialogDescription>{dialogTicket.id} · {dialogTicket.franchise}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {dialog.type === "note" && <Field label="Note" area value={form.note} onChange={(v) => setForm({ ...form, note: v })} />}

                {dialog.type === "media" && (
                  <Field label="Message to customer" area value={form.msg} onChange={(v) => setForm({ ...form, msg: v })} placeholder="Please share a clear photo of the display and a video of the fault." />
                )}

                {dialog.type === "electrician" && (
                  <>
                    <Field label="Electrician name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                    <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                    <Field label="Visit slot" value={form.visit} onChange={(v) => setForm({ ...form, visit: v })} placeholder="Today, 16:00" />
                    <Field label="Work required" area value={form.work} onChange={(v) => setForm({ ...form, work: v })} />
                  </>
                )}

                {dialog.type === "followup" && (
                  <>
                    <Field label="Follow-up on" value={form.what} onChange={(v) => setForm({ ...form, what: v })} placeholder="Call customer to confirm machine status" />
                    <Field label="When" value={form.when} onChange={(v) => setForm({ ...form, when: v })} placeholder="Tomorrow, 11:00" />
                  </>
                )}

                {dialog.type === "escalate" && (
                  <>
                    <Field label="Reason for escalation *" area value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} />
                    <Field label="Troubleshooting already completed *" area value={form.done} onChange={(v) => setForm({ ...form, done: v })} />
                    <Field label="Suspected fault *" value={form.fault} onChange={(v) => setForm({ ...form, fault: v })} />
                    <Field label="Parts / tools likely required" value={form.parts} onChange={(v) => setForm({ ...form, parts: v })} placeholder="Main PCB, multimeter" />
                    <Field label="Site contact *" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="Name & phone" />
                    <Field label="Customer availability" value={form.availability} onChange={(v) => setForm({ ...form, availability: v })} placeholder="Today, 16:00 – 19:00" />
                    <SelectField label="Urgency" value={form.urgency} onChange={(v) => setForm({ ...form, urgency: v })} options={["Immediate", "High", "Normal"]} />
                    <Field label="Supporting photos / videos" value={form.media} onChange={(v) => setForm({ ...form, media: v })} placeholder="pcb-blank.jpg, fault-clip.mp4" />
                    <p className="text-xs text-muted-foreground">The Field Engineer receives this same ticket record with its full history — no duplicate ticket is created.</p>
                  </>
                )}

                {dialog.type === "resolve" && (
                  <>
                    <Field label="Root cause *" value={form.root} onChange={(v) => setForm({ ...form, root: v })} />
                    <Field label="Work completed *" area value={form.work} onChange={(v) => setForm({ ...form, work: v })} />
                    <Field label="Resolution notes (shared with customer) *" area value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
                    <SelectField label="Machine operating status *" value={form.machineStatus} onChange={(v) => setForm({ ...form, machineStatus: v })} options={["Fully operational", "Operational with limitation", "Not operational"]} />
                    <SelectField label="Customer confirmation *" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} options={["yes", "no"]} labels={{ yes: "Customer confirmed", no: "Not confirmed" }} />
                    <SelectField label="Monitoring period" value={form.monitoring} onChange={(v) => setForm({ ...form, monitoring: v })} options={["none", "24 hours", "48 hours", "7 days"]} labels={{ none: "Not required" }} />
                  </>
                )}

                {dialog.type === "troubleshoot" && (
                  <>
                    <Field label="Customer symptoms" area value={form.symptoms} onChange={(v) => setForm({ ...form, symptoms: v })} />
                    <Field label="Error code" value={form.errorCode} onChange={(v) => setForm({ ...form, errorCode: v })} />
                    <Field label="Checks performed" area value={form.checks} onChange={(v) => setForm({ ...form, checks: v })} />
                    <Field label="Instructions provided" area value={form.instructions} onChange={(v) => setForm({ ...form, instructions: v })} />
                    <Field label="Customer response" area value={form.customerResponse} onChange={(v) => setForm({ ...form, customerResponse: v })} />
                    <Field label="Electrician work completed" area value={form.electricianWork} onChange={(v) => setForm({ ...form, electricianWork: v })} />
                    <Field label="Suspected cause" value={form.suspectedCause} onChange={(v) => setForm({ ...form, suspectedCause: v })} />
                    <Field label="Resolution" area value={form.resolution} onChange={(v) => setForm({ ...form, resolution: v })} />
                    <Field label="Parts required" value={form.parts} onChange={(v) => setForm({ ...form, parts: v })} />
                    <Field label="Next action" value={form.nextAction} onChange={(v) => setForm({ ...form, nextAction: v })} />
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialog(null); setForm({}); }}>Cancel</Button>
                <Button onClick={submitDialog}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

function SelectField({
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="space-y-1 min-w-0">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{labels?.[o] ?? o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
