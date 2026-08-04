import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bug,
  ChevronUp,
  Clock,
  Link2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { SectionHead, StatCard } from "@/components/smm/ui";

/* ------------------------------ shared types ------------------------------ */

export const TICKET_STATUSES = [
  "New",
  "Assigned",
  "Accepted",
  "In Progress",
  "Waiting for Information",
  "Blocked",
  "Ready for Testing",
  "Testing",
  "Awaiting Requester Confirmation",
  "Resolved",
  "Closed",
  "Reopened",
  "Cancelled",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const ISSUE_CATEGORIES = [
  "Login or User Access",
  "App Not Working",
  "POS Not Working",
  "Billing Issue",
  "Payment Issue",
  "Data Not Updating",
  "Report Issue",
  "Printing Issue",
  "Performance or Speed",
  "Integration Issue",
  "Incorrect Information",
  "Feature Not Working",
  "Security Concern",
  "Other",
] as const;
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const SYSTEM_AREAS = [
  "Customer App",
  "Franchise App",
  "POS",
  "Admin Panel",
  "CRM",
  "Website",
  "API or Integration",
  "Database",
  "Reporting",
] as const;

export const SOURCES = [
  "CTO",
  "Relationship Manager",
  "Project Coordinator",
  "Technical Support",
  "Store Owner",
] as const;

export const INFO_REQUESTS = [
  "Screenshot or video",
  "Error message",
  "User details",
  "Store details",
  "Device information",
  "Exact steps followed",
  "Time when issue occurred",
  "Approval or clarification",
] as const;

type TicketPriority = "Critical" | "High" | "Medium" | "Low";

type Activity = { at: string; who: string; text: string };

type Ticket = {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  store: string;
  storeId: string;
  rm: string;
  area: (typeof SYSTEM_AREAS)[number];
  category: IssueCategory;
  source: (typeof SOURCES)[number];
  submittedBy: string;
  assignee: string;
  created: string;
  createdDate: string;
  lastActivity: string;
  nextAction: string;
  sla: string;
  slaHours: number; // hours remaining; negative = overdue
  version: string;
  device: string;
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  errorMessage: string;
  attachments: string[];
  impact: string;
  affectedUsers: number;
  opsStopped: boolean;
  relatedBugs: string[];
  relatedReleases: string[];
  linked: string[];
  timeline: Activity[];
  resolution?: {
    rootCause: string;
    work: string;
    fixType: string;
    testing: string;
    affected: string;
    reference: string;
    note: string;
    followUp: string;
    monitoring: string;
  };
  reopenReason?: string;
  waitingSince?: string;
  testingFailed?: boolean;
};

/* -------------------------------- sample data ------------------------------ */

const t = (
  id: string,
  o: Partial<Ticket> & Pick<Ticket, "title" | "priority" | "status">,
): Ticket => ({
  id,
  store: "Jaipur — Vaishali Nagar",
  storeId: "CC-JAI-01",
  rm: "Ankit Verma",
  area: "POS",
  category: "POS Not Working",
  source: "Relationship Manager",
  submittedBy: "Ankit Verma (RM)",
  assignee: "You (Rahul D.)",
  created: "Today 09:12",
  createdDate: "2026-08-04",
  lastActivity: "Today 10:20",
  nextAction: "Accept ticket",
  sla: "Today 13:00",
  slaHours: 3,
  version: "POS v3.3.2",
  device: "Windows 11 · Epson TM-T82",
  description: "Reported by the store on behalf of billing counter staff.",
  steps: ["Open POS", "Create a bill", "Press Print"],
  expected: "Bill prints correctly",
  actual: "Print output is misaligned",
  errorMessage: "—",
  attachments: ["screenshot_01.png"],
  impact: "Billing slowed at counter",
  affectedUsers: 3,
  opsStopped: false,
  relatedBugs: [],
  relatedReleases: [],
  linked: [],
  timeline: [
    { at: "Today 09:12", who: "Ankit Verma (RM)", text: "Ticket submitted for store CC-JAI-01." },
    { at: "Today 09:14", who: "System", text: "Assigned to Developer (Rahul D.). SLA set." },
  ],
  ...o,
});

const SEED: Ticket[] = [
  t("TKT-2041", {
    title: "POS billing screen freezes during bill save — store operations stopped",
    priority: "Critical",
    status: "New",
    category: "POS Not Working",
    nextAction: "Accept ticket immediately",
    sla: "Today 12:30",
    slaHours: 0.5,
    opsStopped: true,
    impact: "Store cannot bill customers — counter stopped",
    affectedUsers: 12,
    errorMessage: "POS_SAVE_TIMEOUT (504) at /api/bills",
    actual: "Screen freezes for 60s then shows timeout",
  }),
  t("TKT-2042", {
    title: "Login blocked for 4 store users after password reset",
    priority: "Critical",
    status: "Accepted",
    area: "Admin Panel",
    category: "Login or User Access",
    store: "Indore — Vijay Nagar",
    storeId: "CC-IND-02",
    rm: "Sneha Kulkarni",
    submittedBy: "Sneha Kulkarni (RM)",
    created: "Today 08:05",
    lastActivity: "Today 09:40",
    nextAction: "Start work",
    sla: "Today 14:00",
    slaHours: 2,
    affectedUsers: 4,
    impact: "Managers cannot access daily reports",
    errorMessage: "AUTH_INVALID_SESSION",
  }),
  t("TKT-2043", {
    title: "Suspicious repeated failed logins on franchise portal",
    priority: "Critical",
    status: "In Progress",
    area: "Website",
    category: "Security Concern",
    source: "CTO",
    submittedBy: "Arjun Mehta (CTO)",
    store: "Head Office",
    storeId: "HO-001",
    rm: "—",
    created: "Yesterday 18:40",
    lastActivity: "Today 10:05",
    nextAction: "Submit findings for testing",
    sla: "Today 16:00",
    slaHours: 4,
    impact: "Potential account-takeover risk",
    affectedUsers: 0,
    relatedBugs: ["BUG-92"],
  }),
  t("TKT-2044", {
    title: "Daily sales report shows previous-day data",
    priority: "High",
    status: "In Progress",
    area: "Reporting",
    category: "Data Not Updating",
    store: "Lucknow — Gomti Nagar",
    storeId: "CC-LKO-03",
    rm: "Pooja Singh",
    submittedBy: "Pooja Singh (RM)",
    created: "3 Aug 16:20",
    createdDate: "2026-08-03",
    lastActivity: "Today 09:55",
    nextAction: "Fix aggregation job",
    sla: "Today 18:00",
    slaHours: 6,
    affectedUsers: 6,
    impact: "Owners reviewing stale numbers",
  }),
  t("TKT-2045", {
    title: "Payment link failing for UPI on customer app",
    priority: "High",
    status: "Waiting for Information",
    area: "Customer App",
    category: "Payment Issue",
    store: "Surat — Adajan",
    storeId: "CC-SUR-04",
    rm: "Nikhil Shah",
    submittedBy: "Nikhil Shah (RM)",
    created: "2 Aug 11:10",
    createdDate: "2026-08-02",
    lastActivity: "2 Aug 15:00",
    nextAction: "Awaiting screenshot & transaction time",
    sla: "Paused",
    slaHours: 99,
    waitingSince: "2 Aug 15:00",
    affectedUsers: 9,
    impact: "Customers falling back to cash",
    errorMessage: "PG_ERR_302 (masked ref: •••• 4417)",
  }),
  t("TKT-2046", {
    title: "Bill print misaligned on 80mm thermal printer",
    priority: "Medium",
    status: "Ready for Testing",
    category: "Printing Issue",
    created: "1 Aug 10:00",
    createdDate: "2026-08-01",
    lastActivity: "Today 08:30",
    nextAction: "Await test result",
    sla: "5 Aug 18:00",
    slaHours: 30,
    relatedBugs: ["BUG-88"],
    relatedReleases: ["v3.4.0"],
  }),
  t("TKT-2047", {
    title: "Store dashboard very slow on 2G network",
    priority: "Medium",
    status: "Testing",
    area: "Franchise App",
    category: "Performance or Speed",
    store: "Bhopal — MP Nagar",
    storeId: "CC-BHO-05",
    rm: "Rakesh Yadav",
    submittedBy: "Rakesh Yadav (RM)",
    created: "31 Jul 12:00",
    createdDate: "2026-07-31",
    lastActivity: "Today 07:50",
    nextAction: "Re-test after payload fix",
    sla: "6 Aug 18:00",
    slaHours: 54,
    testingFailed: true,
  }),
  t("TKT-2048", {
    title: "Tariff card shows incorrect price for dry cleaning",
    priority: "Medium",
    status: "Awaiting Requester Confirmation",
    area: "CRM",
    category: "Incorrect Information",
    store: "Delhi — Rajouri Garden",
    storeId: "CC-DEL-06",
    rm: "Meera Joshi",
    submittedBy: "Meera Joshi (RM)",
    created: "30 Jul 09:30",
    createdDate: "2026-07-30",
    lastActivity: "Today 09:00",
    nextAction: "Awaiting requester confirmation",
    sla: "Met",
    slaHours: 20,
    resolution: {
      rootCause: "Tariff master not refreshed after config change",
      work: "Corrected tariff mapping and forced cache refresh",
      fixType: "Configuration change",
      testing: "Verified on staging and store device",
      affected: "CRM · POS tariff sync",
      reference: "CFG-2026-08-01",
      note: "Prices now show correctly. Please confirm at the counter.",
      followUp: "No",
      monitoring: "48 hours",
    },
  }),
  t("TKT-2049", {
    title: "GST field missing in invoice export",
    priority: "Low",
    status: "Reopened",
    area: "Reporting",
    category: "Report Issue",
    source: "Project Coordinator",
    submittedBy: "Kavita Rao (PC)",
    store: "Mumbai — Andheri",
    storeId: "CC-MUM-07",
    rm: "Deepak Nair",
    created: "25 Jul 14:20",
    createdDate: "2026-07-25",
    lastActivity: "Today 08:10",
    nextAction: "Re-investigate export template",
    sla: "Overdue",
    slaHours: -6,
    reopenReason: "GST column still blank for two invoices.",
    resolution: {
      rootCause: "Export template missing GST column",
      work: "Added GST column to export mapping",
      fixType: "Code fix",
      testing: "Unit + manual export test",
      affected: "Reporting",
      reference: "v3.3.2",
      note: "GST column added to invoice export.",
      followUp: "Yes",
      monitoring: "7 days",
    },
  }),
  t("TKT-2050", {
    title: "Add store-wise filter on complaints report",
    priority: "Low",
    status: "Assigned",
    area: "Reporting",
    category: "Feature Not Working",
    source: "CTO",
    submittedBy: "Arjun Mehta (CTO)",
    store: "Head Office",
    storeId: "HO-001",
    rm: "—",
    created: "3 Aug 17:00",
    createdDate: "2026-08-03",
    lastActivity: "3 Aug 17:00",
    nextAction: "Accept ticket",
    sla: "8 Aug 18:00",
    slaHours: 96,
  }),
  t("TKT-2051", {
    title: "POS not syncing offline bills after reconnect",
    priority: "High",
    status: "Blocked",
    created: "2 Aug 08:00",
    createdDate: "2026-08-02",
    store: "Jaipur — Malviya Nagar",
    storeId: "CC-JAI-08",
    lastActivity: "Today 07:00",
    nextAction: "Blocked on vendor API access",
    sla: "Today 20:00",
    slaHours: 8,
    affectedUsers: 5,
    linked: ["TKT-2041"],
  }),
];

/* --------------------------------- helpers -------------------------------- */

const P_ORDER: Record<TicketPriority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const prioTone = (p: TicketPriority) =>
  p === "Critical"
    ? "bg-destructive text-destructive-foreground"
    : p === "High"
    ? "bg-amber-500 text-white"
    : p === "Medium"
    ? "bg-blue-500 text-white"
    : "bg-muted text-muted-foreground";

const statusTone = (s: TicketStatus) =>
  ["Resolved", "Closed"].includes(s)
    ? "text-emerald-600"
    : ["Reopened", "Blocked", "Cancelled"].includes(s)
    ? "text-destructive"
    : ["Waiting for Information", "New", "Assigned"].includes(s)
    ? "text-amber-600"
    : "text-blue-600";

const TAB_MAP: Record<string, TicketStatus[]> = {
  All: [...TICKET_STATUSES],
  New: ["New", "Assigned"],
  "In Progress": ["Accepted", "In Progress"],
  "Waiting for Information": ["Waiting for Information", "Blocked"],
  "Ready for Testing": ["Ready for Testing", "Testing"],
  "Awaiting Confirmation": ["Awaiting Requester Confirmation"],
  Resolved: ["Resolved", "Closed"],
  Reopened: ["Reopened"],
};
const TABS = Object.keys(TAB_MAP);

const attention = (k: Ticket): string[] => {
  const a: string[] = [];
  if (k.priority === "Critical" && ["New", "Assigned"].includes(k.status))
    a.push("Critical ticket not accepted");
  if (k.slaHours < 0) a.push("Overdue");
  else if (k.slaHours <= 1 && k.status !== "Waiting for Information") a.push("SLA due within 1 hour");
  if (k.opsStopped) a.push("Store operations stopped");
  if (k.category === "Security Concern") a.push("Security concern");
  if (k.status === "Waiting for Information") a.push("Waiting too long for information");
  if (k.testingFailed) a.push("Testing failed");
  if (k.status === "Reopened") a.push("Resolved ticket reopened");
  return a;
};

const FIX_TYPES = ["Code fix", "Configuration change", "Data correction", "User guidance", "No change required"];

/* -------------------------------- component ------------------------------- */

export function DevTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(SEED);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [fPriority, setFPriority] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fSource, setFSource] = useState("all");
  const [fStore, setFStore] = useState("all");
  const [fArea, setFArea] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [fDev, setFDev] = useState("all");
  const [fCreated, setFCreated] = useState("");
  const [fSla, setFSla] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "info" | "resolve" | "bug" | "escalate" | "link" | "note">(null);

  const open = tickets.find((k) => k.id === openId) ?? null;

  const update = (id: string, patch: Partial<Ticket>, log?: string) =>
    setTickets((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              ...patch,
              lastActivity: "Just now",
              timeline: log
                ? [...k.timeline, { at: "Just now", who: "You (Rahul D.)", text: log }]
                : k.timeline,
            }
          : k,
      ),
    );

  const stores = Array.from(new Set(tickets.map((k) => k.store)));
  const devs = Array.from(new Set(tickets.map((k) => k.assignee)));

  const filtered = useMemo(() => {
    const allowed = TAB_MAP[tab];
    return tickets
      .filter((k) => allowed.includes(k.status))
      .filter((k) =>
        q.trim()
          ? (k.id + k.title + k.store + k.submittedBy + k.category)
              .toLowerCase()
              .includes(q.toLowerCase())
          : true,
      )
      .filter((k) => (fPriority === "all" ? true : k.priority === fPriority))
      .filter((k) => (fStatus === "all" ? true : k.status === fStatus))
      .filter((k) => (fSource === "all" ? true : k.source === fSource))
      .filter((k) => (fStore === "all" ? true : k.store === fStore))
      .filter((k) => (fArea === "all" ? true : k.area === fArea))
      .filter((k) => (fCat === "all" ? true : k.category === fCat))
      .filter((k) => (fDev === "all" ? true : k.assignee === fDev))
      .filter((k) => (fCreated ? k.createdDate === fCreated : true))
      .filter((k) =>
        fSla === "all"
          ? true
          : fSla === "overdue"
          ? k.slaHours < 0
          : fSla === "1h"
          ? k.slaHours >= 0 && k.slaHours <= 1
          : fSla === "today"
          ? k.slaHours >= 0 && k.slaHours <= 12
          : true,
      )
      .sort((a, b) => P_ORDER[a.priority] - P_ORDER[b.priority] || a.slaHours - b.slaHours);
  }, [tickets, tab, q, fPriority, fStatus, fSource, fStore, fArea, fCat, fDev, fCreated, fSla]);

  const count = (fn: (k: Ticket) => boolean) => tickets.filter(fn).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHead
          title="My Tickets"
          sub="App, POS, CRM and website issues assigned by the CTO or raised by Relationship Managers for operating stores."
        />
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search ticket ID, title, store, requester"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="New Tickets" value={String(count((k) => ["New", "Assigned"].includes(k.status)))} sub="Not yet accepted" />
        <StatCard label="Critical" value={String(count((k) => k.priority === "Critical"))} sub="Highest priority" tone="bad" />
        <StatCard label="Due Today" value={String(count((k) => k.slaHours >= 0 && k.slaHours <= 12))} sub="SLA today" tone="warn" />
        <StatCard label="Waiting for Information" value={String(count((k) => k.status === "Waiting for Information"))} sub="Developer SLA paused" tone="warn" />
        <StatCard label="Ready for Testing" value={String(count((k) => ["Ready for Testing", "Testing"].includes(k.status)))} sub="With QA" />
        <StatCard label="Overdue" value={String(count((k) => k.slaHours < 0))} sub="Breached SLA" tone="bad" />
      </div>

      {/* attention */}
      <Card className="border-amber-500/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tickets
            .filter((k) => attention(k).length)
            .slice(0, 5)
            .map((k) => (
              <div key={k.id} className="flex flex-wrap items-center gap-2 text-sm">
                <button className="font-medium underline underline-offset-2" onClick={() => setOpenId(k.id)}>
                  {k.id}
                </button>
                <span className="text-muted-foreground truncate max-w-[22rem]">{k.title}</span>
                {attention(k).map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px] border-amber-500 text-amber-700">
                    {a}
                  </Badge>
                ))}
              </div>
            ))}
          <div className="text-xs text-muted-foreground">
            Multiple stores reporting the same issue: TKT-2041 and TKT-2051 are linked to one master incident; individual store impact stays traceable.
          </div>
        </CardContent>
      </Card>

      {/* tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              tab === tb ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
            }`}
          >
            {tb}
            <span className="ml-1.5 opacity-70">{tickets.filter((k) => TAB_MAP[tb].includes(k.status)).length}</span>
          </button>
        ))}
      </div>

      {/* filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <Filter label="Priority" value={fPriority} onChange={setFPriority} options={["Critical", "High", "Medium", "Low"]} />
          <Filter label="Ticket status" value={fStatus} onChange={setFStatus} options={[...TICKET_STATUSES]} />
          <Filter label="Request source" value={fSource} onChange={setFSource} options={[...SOURCES]} />
          <Filter label="Store" value={fStore} onChange={setFStore} options={stores} />
          <Filter label="System area" value={fArea} onChange={setFArea} options={[...SYSTEM_AREAS]} />
          <Filter label="Issue category" value={fCat} onChange={setFCat} options={[...ISSUE_CATEGORIES]} />
          <Filter label="Assigned developer" value={fDev} onChange={setFDev} options={devs} />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Created date</Label>
            <Input type="date" value={fCreated} onChange={(e) => setFCreated(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">SLA deadline</Label>
            <Select value={fSla} onValueChange={setFSla}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1h">Due within 1 hour</SelectItem>
                <SelectItem value="today">Due today</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setFPriority("all"); setFStatus("all"); setFSource("all"); setFStore("all");
                setFArea("all"); setFCat("all"); setFDev("all"); setFCreated(""); setFSla("all"); setQ("");
              }}
            >
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* desktop table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                {["Priority","Ticket ID","Issue title","Store / department","System area","Submitted by","Assigned","Status","Created","Last activity","Next action","SLA deadline","Actions"].map((h) => (
                  <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr key={k.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><Badge className={prioTone(k.priority)}>{k.priority}</Badge></td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{k.id}</td>
                  <td className="px-3 py-2 max-w-[18rem] truncate">{k.title}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{k.store}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{k.area}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{k.submittedBy}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{k.assignee}</td>
                  <td className={`px-3 py-2 whitespace-nowrap font-medium ${statusTone(k.status)}`}>{k.status}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{k.created}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{k.lastActivity}</td>
                  <td className="px-3 py-2 max-w-[12rem] truncate">{k.nextAction}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${k.slaHours < 0 ? "text-destructive font-medium" : ""}`}>{k.sla}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setOpenId(k.id)}>Open</Button>
                      {["New", "Assigned"].includes(k.status) && (
                        <Button size="sm" onClick={() => update(k.id, { status: "Accepted", nextAction: "Start work" }, "Ticket accepted. Acceptance time recorded.")}>Accept</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={13} className="px-3 py-8 text-center text-muted-foreground">No tickets match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((k) => (
          <Card key={k.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge className={prioTone(k.priority)}>{k.priority}</Badge>
                <span className="text-xs text-muted-foreground">{k.id}</span>
              </div>
              <div className="font-medium text-sm">{k.title}</div>
              <div className="text-xs text-muted-foreground">{k.store} · {k.area} · {k.category}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className={statusTone(k.status)}>{k.status}</span>
                <span className="text-muted-foreground">By {k.submittedBy}</span>
                <span className={k.slaHours < 0 ? "text-destructive" : "text-muted-foreground"}>SLA {k.sla}</span>
              </div>
              <div className="text-xs">Next: {k.nextAction}</div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpenId(k.id)}>Open</Button>
                {["New", "Assigned"].includes(k.status) && (
                  <Button size="sm" className="flex-1" onClick={() => update(k.id, { status: "Accepted", nextAction: "Start work" }, "Ticket accepted. Acceptance time recorded.")}>Accept</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && <div className="text-sm text-muted-foreground">No tickets match these filters.</div>}
      </div>

      <p className="text-xs text-muted-foreground">
        Security: never record passwords, API keys or tokens in ticket notes. Customer and payment details are masked. Views, assignments and status changes are recorded in the ticket timeline.
      </p>

      {/* details */}
      <Sheet open={!!open} onOpenChange={(v) => { if (!v) { setOpenId(null); setDialog(null); } }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  <span>{open.id}</span>
                  <Badge className={prioTone(open.priority)}>{open.priority}</Badge>
                  <span className={`text-sm ${statusTone(open.status)}`}>{open.status}</span>
                </SheetTitle>
                <SheetDescription>{open.title}</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5 text-sm">
                {!!attention(open).length && (
                  <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 space-y-1">
                    {attention(open).map((a) => (
                      <div key={a} className="flex items-center gap-2 text-amber-800 text-xs">
                        {a === "Security concern" ? <ShieldAlert className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />} {a}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Field k="Store / department" v={open.store} />
                  <Field k="Store ID" v={open.storeId} />
                  <Field k="Relationship Manager" v={open.rm} />
                  <Field k="System area" v={open.area} />
                  <Field k="Issue category" v={open.category} />
                  <Field k="App or software version" v={open.version} />
                  <Field k="Device and operating system" v={open.device} />
                  <Field k="Submitted by" v={`${open.submittedBy} · ${open.source}`} />
                  <Field k="Created" v={open.created} />
                  <Field k="SLA deadline" v={open.sla} />
                  <Field k="Business impact" v={open.impact} />
                  <Field k="Affected users" v={String(open.affectedUsers)} />
                </div>

                <Block title="Issue description">{open.description}</Block>
                <Block title="Steps to reproduce">
                  <ol className="list-decimal pl-5 space-y-0.5">{open.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                </Block>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Block title="Expected result">{open.expected}</Block>
                  <Block title="Actual result">{open.actual}</Block>
                </div>
                <Block title="Error message"><code className="text-xs">{open.errorMessage}</code></Block>
                <Block title="Screenshots or video">
                  {open.attachments.length ? open.attachments.join(", ") : "None attached"}
                </Block>

                <Block title="Related bugs and releases">
                  <div className="flex flex-wrap gap-2">
                    {[...open.relatedBugs, ...open.relatedReleases, ...open.linked].map((r) => (
                      <Badge key={r} variant="secondary">{r}</Badge>
                    ))}
                    {!open.relatedBugs.length && !open.relatedReleases.length && !open.linked.length && (
                      <span className="text-muted-foreground text-xs">No linked records</span>
                    )}
                  </div>
                </Block>

                {open.resolution && (
                  <Block title="Resolution record (preserved on reopen)">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <Field k="Root cause" v={open.resolution.rootCause} />
                      <Field k="Work completed" v={open.resolution.work} />
                      <Field k="Fix type" v={open.resolution.fixType} />
                      <Field k="Testing completed" v={open.resolution.testing} />
                      <Field k="Affected system" v={open.resolution.affected} />
                      <Field k="Release / configuration" v={open.resolution.reference} />
                      <Field k="Follow-up required" v={open.resolution.followUp} />
                      <Field k="Monitoring period" v={open.resolution.monitoring} />
                    </div>
                    <p className="mt-2">{open.resolution.note}</p>
                    {open.reopenReason && (
                      <p className="mt-2 text-destructive text-xs">Reopen reason: {open.reopenReason}</p>
                    )}
                  </Block>
                )}

                <Block title="Activity timeline">
                  <div className="space-y-2">
                    {open.timeline.map((a, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-muted-foreground">{a.at} · {a.who}</span>
                          <div>{a.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Block>

                <Separator />

                <div>
                  <div className="text-xs font-medium mb-2">Developer actions</div>
                  <div className="flex flex-wrap gap-2">
                    {["New", "Assigned"].includes(open.status) && (
                      <Button size="sm" onClick={() => update(open.id, { status: "Accepted", nextAction: "Start work" }, "Ticket accepted. Acceptance time recorded.")}>Accept Ticket</Button>
                    )}
                    {["Accepted", "Reopened", "Blocked"].includes(open.status) && (
                      <Button size="sm" onClick={() => update(open.id, { status: "In Progress", nextAction: "Investigate and fix" }, "Work started.")}>Start Work</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setDialog("note")}>Add Technical Note</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("info")}>Ask for Information</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("bug")}><Bug className="h-3.5 w-3.5 mr-1" />Add Bug</Button>
                    {["In Progress", "Testing"].includes(open.status) && (
                      <Button size="sm" variant="outline" onClick={() => update(open.id, { status: "Ready for Testing", nextAction: "Await test result", testingFailed: false }, "Submitted for testing on the same ticket.")}>Submit for Testing</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setDialog("resolve")}>Mark Resolved</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("escalate")}><ChevronUp className="h-3.5 w-3.5 mr-1" />Escalate to CTO</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("link")}><Link2 className="h-3.5 w-3.5 mr-1" />Link Related Ticket</Button>
                  </div>
                </div>

                {open.status === "Awaiting Requester Confirmation" && (
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="text-xs font-medium">Requester actions ({open.submittedBy})</div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => update(open.id, { status: "Closed", nextAction: "None — closed" }, "Requester confirmed resolution. Ticket closed.")}>Confirm Resolved</Button>
                      <ReopenButton onReopen={(reason) => update(open.id, { status: "Reopened", reopenReason: reason, nextAction: "Re-investigate" }, `Reopened by requester: ${reason}`)} />
                      <Button size="sm" variant="outline" onClick={() => update(open.id, {}, "Requester added a comment.")}>Add Comment</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* dialogs */}
              <AskInfoDialog
                open={dialog === "info"}
                onClose={() => setDialog(null)}
                onSubmit={(items, note) => {
                  update(open.id, { status: "Waiting for Information", sla: "Paused", slaHours: 99, nextAction: `Awaiting: ${items.join(", ")}` },
                    `Information requested from ${open.submittedBy}: ${items.join(", ")}. ${note} Developer-resolution SLA paused; total ticket age continues.`);
                  toast.success("Requester notified. Developer SLA paused.");
                  setDialog(null);
                }}
              />

              <ResolveDialog
                open={dialog === "resolve"}
                onClose={() => setDialog(null)}
                onSubmit={(r) => {
                  update(open.id, { status: "Awaiting Requester Confirmation", resolution: r, nextAction: "Awaiting requester confirmation" },
                    `Marked resolved. Root cause: ${r.rootCause}. Requester notified.`);
                  toast.success("Resolution recorded and requester notified.");
                  setDialog(null);
                }}
              />

              <SimpleDialog
                open={dialog === "note"}
                title="Add technical note"
                desc="Never include passwords, API keys, tokens or confidential credentials."
                placeholder="Technical findings, logs summary, next steps"
                onClose={() => setDialog(null)}
                onSubmit={(v) => { update(open.id, {}, `Technical note: ${v}`); toast.success("Note added"); setDialog(null); }}
              />
              <SimpleDialog
                open={dialog === "bug"}
                title="Add bug"
                desc={`A new bug will be created and permanently linked to ${open.id}.`}
                placeholder="Bug summary"
                onClose={() => setDialog(null)}
                onSubmit={(v) => {
                  const bug = `BUG-${100 + Math.floor(Math.random() * 90)}`;
                  update(open.id, { relatedBugs: [...open.relatedBugs, bug] }, `Bug ${bug} created and linked: ${v}`);
                  toast.success(`${bug} linked to ${open.id}`); setDialog(null);
                }}
              />
              <SimpleDialog
                open={dialog === "escalate"}
                title="Escalate to CTO"
                desc="Escalation stays on the same ticket — no duplicate ticket is created."
                placeholder="Reason for escalation"
                onClose={() => setDialog(null)}
                onSubmit={(v) => { update(open.id, { nextAction: "CTO review" }, `Escalated to CTO: ${v}`); toast.success("Escalated to CTO"); setDialog(null); }}
              />
              <SimpleDialog
                open={dialog === "link"}
                title="Link related ticket"
                desc="Similar tickets can be linked to one master incident; each store's impact stays traceable."
                placeholder="Ticket ID e.g. TKT-2041"
                onClose={() => setDialog(null)}
                onSubmit={(v) => { update(open.id, { linked: [...open.linked, v] }, `Linked to related ticket ${v}.`); toast.success("Ticket linked"); setDialog(null); }}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------ small pieces ------------------------------ */

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{title}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ReopenButton({ onReopen }: { onReopen: (reason: string) => void }) {
  const [o, setO] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setO(true)}>Reopen Issue</Button>
      <Dialog open={o} onOpenChange={setO}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen issue</DialogTitle>
            <DialogDescription>A reason is required. The same Ticket ID and full resolution history are preserved.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is the issue not resolved?" />
          <DialogFooter>
            <Button disabled={!reason.trim()} onClick={() => { onReopen(reason.trim()); setO(false); setReason(""); }}>Reopen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SimpleDialog({ open, title, desc, placeholder, onClose, onSubmit }: {
  open: boolean; title: string; desc: string; placeholder: string;
  onClose: () => void; onSubmit: (v: string) => void;
}) {
  const [v, setV] = useState("");
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <Textarea value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!v.trim()} onClick={() => { onSubmit(v.trim()); setV(""); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AskInfoDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (items: string[], note: string) => void }) {
  const [items, setItems] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const toggle = (i: string) => setItems((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask for information</DialogTitle>
          <DialogDescription>
            The requester is notified. Developer-resolution SLA pauses while genuinely waiting; total ticket age keeps running.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {INFO_REQUESTS.map((i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <Checkbox checked={items.includes(i)} onCheckedChange={() => toggle(i)} />
              {i}
            </label>
          ))}
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Message to requester (no credentials)" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!items.length} onClick={() => { onSubmit(items, note); setItems([]); setNote(""); }}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResolveDialog({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void;
  onSubmit: (r: NonNullable<Ticket["resolution"]>) => void;
}) {
  const [f, setF] = useState({
    rootCause: "", work: "", fixType: "", testing: "", affected: "",
    reference: "", note: "", followUp: "No", monitoring: "",
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const ok = f.rootCause && f.work && f.fixType && f.testing && f.affected && f.note;
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resolution form</DialogTitle>
          <DialogDescription>All required details must be recorded before the ticket can be marked resolved.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Ta label="Root cause *" v={f.rootCause} on={(v) => set("rootCause", v)} />
          <Ta label="Work completed *" v={f.work} on={(v) => set("work", v)} />
          <div className="space-y-1">
            <Label className="text-xs">Fix type *</Label>
            <Select value={f.fixType} onValueChange={(v) => set("fixType", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{FIX_TYPES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Ta label="Testing completed *" v={f.testing} on={(v) => set("testing", v)} />
          <In label="Affected system *" v={f.affected} on={(v) => set("affected", v)} />
          <In label="Release or configuration reference" v={f.reference} on={(v) => set("reference", v)} />
          <Ta label="Resolution note for requester *" v={f.note} on={(v) => set("note", v)} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Follow-up required</Label>
              <Select value={f.followUp} onValueChange={(v) => set("followUp", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
              </Select>
            </div>
            <In label="Monitoring period" v={f.monitoring} on={(v) => set("monitoring", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!ok} onClick={() => onSubmit(f)}>Mark Resolved</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Ta({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Textarea value={v} onChange={(e) => on(e.target.value)} rows={2} />
    </div>
  );
}
function In({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
