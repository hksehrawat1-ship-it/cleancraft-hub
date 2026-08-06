import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHead, StatCard } from "@/components/smm/ui";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  PhoneCall,
  Search,
  ShieldCheck,
  Truck,
  Wallet,
  Lock,
} from "lucide-react";

const MANAGER = "Priya Nair";
const TODAY = "4 August 2026";

export type PayStatus =
  | "Request Submitted"
  | "Information Required"
  | "Accepted"
  | "Payment Requested"
  | "Follow-up Due"
  | "Partially Paid"
  | "Payment Received"
  | "Verification Pending"
  | "Verified"
  | "Verification Rejected"
  | "Dispatch Clearance Ready"
  | "Clearance Sent"
  | "Logistics Accepted"
  | "Closed"
  | "Cancelled";

const PAYMENT_TYPES = [
  "Franchise Fee",
  "Machine Payment",
  "Consumables Payment",
  "Training Fee",
  "Software or POS Fee",
  "Other Approved Charge",
] as const;

type Req = {
  id: string;
  projectId: string;
  store: string;
  city: string;
  owner: string;
  ownerPhoneMasked: string;
  type: (typeof PAYMENT_TYPES)[number];
  purpose: string;
  target: number;
  received: number;
  due: string;
  daysOverdue: number;
  requestedBy: string;
  status: PayStatus;
  raisedOn: string;
  lastFollowUp?: string;
  nextFollowUp?: string;
  payDate?: string;
  mode?: string;
  txnMasked?: string;
  proof?: string;
  vyaparInvoice?: string;
  vyaparParty?: string;
  invoiceDate?: string;
  receiptNo?: string;
  launchAtRisk?: boolean;
  history: { at: string; by: string; action: string }[];
};

type Clearance = {
  id: string;
  reqId: string;
  projectId: string;
  store: string;
  items: string;
  verifiedOn: string;
  priority: "Urgent" | "High" | "Normal";
  logistics: "Not Sent" | "Sent — Awaiting Acceptance" | "Accepted" | "Returned";
  returnReason?: string;
};

const SEED_REQ: Req[] = [
  {
    id: "PAY-3101", projectId: "PRJ-JAI-07", store: "Clean Craft Jaipur", city: "Jaipur",
    owner: "Rajesh Agarwal", ownerPhoneMasked: "+91 98XXXXXX21", type: "Machine Payment",
    purpose: "60% machine advance before dispatch", target: 1, received: 0, due: "Today",
    daysOverdue: 0, requestedBy: "Rahul Sharma (Project Coordinator)", status: "Request Submitted",
    raisedOn: "3 Aug", launchAtRisk: true,
    history: [{ at: "3 Aug 10:12", by: "Rahul Sharma", action: "Request submitted" }],
  },
  {
    id: "PAY-3102", projectId: "PRJ-IND-03", store: "Clean Craft Indore", city: "Indore",
    owner: "Meena Joshi", ownerPhoneMasked: "+91 97XXXXXX40", type: "Franchise Fee",
    purpose: "Second franchise instalment", target: 2, received: 1, due: "2 Aug",
    daysOverdue: 2, requestedBy: "Anita Rao (Project Coordinator)", status: "Partially Paid",
    raisedOn: "26 Jul", lastFollowUp: "3 Aug", nextFollowUp: "Today",
    payDate: "1 Aug", mode: "NEFT", txnMasked: "XXXXXX7741", proof: "receipt_indore_1.pdf",
    vyaparInvoice: "VY-INV-2291", vyaparParty: "Meena Joshi (Indore)", invoiceDate: "26 Jul", receiptNo: "RCP-1188",
    history: [
      { at: "26 Jul 11:00", by: "Anita Rao", action: "Request submitted" },
      { at: "27 Jul 09:30", by: MANAGER, action: "Request accepted" },
      { at: "27 Jul 10:00", by: MANAGER, action: "Payment requested from franchise" },
      { at: "1 Aug 16:20", by: MANAGER, action: "Part payment received" },
    ],
  },
  {
    id: "PAY-3103", projectId: "PRJ-LKO-02", store: "Clean Craft Lucknow", city: "Lucknow",
    owner: "Sunil Mishra", ownerPhoneMasked: "+91 99XXXXXX08", type: "Machine Payment",
    purpose: "Machine balance before dispatch", target: 1, received: 1, due: "3 Aug",
    daysOverdue: 0, requestedBy: "Rahul Sharma (Project Coordinator)", status: "Verification Pending",
    raisedOn: "24 Jul", payDate: "3 Aug", mode: "RTGS", txnMasked: "XXXXXX3390",
    proof: "utr_lucknow.jpg", vyaparInvoice: "VY-INV-2277", vyaparParty: "Sunil Mishra (Lucknow)",
    invoiceDate: "24 Jul", receiptNo: "RCP-1201",
    history: [
      { at: "24 Jul 10:00", by: "Rahul Sharma", action: "Request submitted" },
      { at: "24 Jul 15:00", by: MANAGER, action: "Request accepted" },
      { at: "3 Aug 12:00", by: MANAGER, action: "Payment received, sent for verification" },
    ],
  },
  {
    id: "PAY-3104", projectId: "PRJ-SUR-05", store: "Clean Craft Surat", city: "Surat",
    owner: "Bhavesh Patel", ownerPhoneMasked: "+91 90XXXXXX66", type: "Consumables Payment",
    purpose: "Opening consumables kit", target: 1, received: 1, due: "31 Jul",
    daysOverdue: 0, requestedBy: "Deepak Yadav (Project Coordinator)", status: "Verified",
    raisedOn: "22 Jul", payDate: "30 Jul", mode: "UPI", txnMasked: "XXXXXX9014",
    proof: "surat_consumables.pdf", vyaparInvoice: "VY-INV-2260", vyaparParty: "Bhavesh Patel (Surat)",
    invoiceDate: "22 Jul", receiptNo: "RCP-1176",
    history: [
      { at: "22 Jul 09:00", by: "Deepak Yadav", action: "Request submitted" },
      { at: "22 Jul 12:00", by: MANAGER, action: "Request accepted" },
      { at: "30 Jul 17:00", by: MANAGER, action: "Payment verified" },
    ],
  },
  {
    id: "PAY-3105", projectId: "PRJ-BPL-04", store: "Clean Craft Bhopal", city: "Bhopal",
    owner: "Alok Jain", ownerPhoneMasked: "+91 88XXXXXX32", type: "Training Fee",
    purpose: "Owner and manpower training batch", target: 1, received: 0, due: "29 Jul",
    daysOverdue: 6, requestedBy: "Anita Rao (Project Coordinator)", status: "Follow-up Due",
    raisedOn: "20 Jul", lastFollowUp: "1 Aug", nextFollowUp: "Today", launchAtRisk: true,
    vyaparInvoice: "VY-INV-2248", vyaparParty: "Alok Jain (Bhopal)", invoiceDate: "20 Jul",
    history: [
      { at: "20 Jul 10:00", by: "Anita Rao", action: "Request submitted" },
      { at: "20 Jul 14:00", by: MANAGER, action: "Request accepted" },
      { at: "1 Aug 11:00", by: MANAGER, action: "Follow-up call — owner promised 5 Aug" },
    ],
  },
  {
    id: "PAY-3106", projectId: "PRJ-NAG-01", store: "Clean Craft Nagpur", city: "Nagpur",
    owner: "Kavita Deshmukh", ownerPhoneMasked: "+91 93XXXXXX77", type: "Software or POS Fee",
    purpose: "POS licence and setup fee", target: 1, received: 1, due: "2 Aug",
    daysOverdue: 0, requestedBy: "Neha Gupta (Project Coordinator)", status: "Verification Rejected",
    raisedOn: "25 Jul", payDate: "2 Aug", mode: "UPI", txnMasked: "XXXXXX3390",
    proof: "nagpur_pos.jpg", vyaparInvoice: "VY-INV-2284", vyaparParty: "Kavita Deshmukh (Nagpur)",
    invoiceDate: "25 Jul", receiptNo: "RCP-1194",
    history: [
      { at: "25 Jul 10:00", by: "Neha Gupta", action: "Request submitted" },
      { at: "2 Aug 18:00", by: MANAGER, action: "Verification rejected — duplicate transaction reference" },
    ],
  },
  {
    id: "PAY-3107", projectId: "PRJ-KNP-06", store: "Clean Craft Kanpur", city: "Kanpur",
    owner: "Shalini Verma", ownerPhoneMasked: "+91 95XXXXXX12", type: "Franchise Fee",
    purpose: "Franchise booking amount", target: 1, received: 0, due: "6 Aug",
    daysOverdue: 0, requestedBy: "Suresh Patel (Project Coordinator)", status: "Information Required",
    raisedOn: "2 Aug",
    history: [
      { at: "2 Aug 09:00", by: "Suresh Patel", action: "Request submitted" },
      { at: "2 Aug 15:00", by: MANAGER, action: "Returned — signed agreement copy missing" },
    ],
  },
  {
    id: "PAY-3108", projectId: "PRJ-RAI-02", store: "Clean Craft Raipur", city: "Raipur",
    owner: "Komal Sahu", ownerPhoneMasked: "+91 91XXXXXX55", type: "Machine Payment",
    purpose: "Machine full payment", target: 1, received: 1, due: "28 Jul",
    daysOverdue: 0, requestedBy: "Rahul Sharma (Project Coordinator)", status: "Clearance Sent",
    raisedOn: "18 Jul", payDate: "27 Jul", mode: "RTGS", txnMasked: "XXXXXX6620",
    proof: "raipur_rtgs.pdf", vyaparInvoice: "VY-INV-2231", vyaparParty: "Komal Sahu (Raipur)",
    invoiceDate: "18 Jul", receiptNo: "RCP-1150",
    history: [
      { at: "18 Jul 10:00", by: "Rahul Sharma", action: "Request submitted" },
      { at: "27 Jul 16:00", by: MANAGER, action: "Payment verified" },
      { at: "28 Jul 10:00", by: MANAGER, action: "Dispatch clearance sent to Logistics" },
    ],
  },
];

const SEED_CLR: Clearance[] = [
  {
    id: "CLR-908", reqId: "PAY-3104", projectId: "PRJ-SUR-05", store: "Clean Craft Surat",
    items: "Consumables kit — 12 cartons", verifiedOn: "30 Jul",
    priority: "Normal", logistics: "Not Sent",
  },
  {
    id: "CLR-909", reqId: "PAY-3108", projectId: "PRJ-RAI-02", store: "Clean Craft Raipur",
    items: "Full machine set (washer, dryer, steam iron, boiler)",
    verifiedOn: "27 Jul", priority: "Urgent", logistics: "Sent — Awaiting Acceptance",
  },
  {
    id: "CLR-907", reqId: "PAY-3099", projectId: "PRJ-AGR-01", store: "Clean Craft Agra",
    items: "Full machine set", verifiedOn: "22 Jul",
    priority: "High", logistics: "Accepted",
  },
  {
    id: "CLR-906", reqId: "PAY-3095", projectId: "PRJ-PAT-03", store: "Clean Craft Patna",
    items: "POS + counter kit", verifiedOn: "19 Jul",
    priority: "Normal", logistics: "Returned", returnReason: "Delivery address incomplete — need site contact",
  },
];

const tone = (s: PayStatus | Clearance["logistics"]) => {
  if (/Rejected|Overdue|Failed|Required/i.test(s)) return "bg-rose-100 text-rose-700";
  if (/Cancelled|Returned/i.test(s)) return "bg-muted text-muted-foreground";
  if (/Follow-up|Verification Pending|Partially|Awaiting/i.test(s)) return "bg-amber-100 text-amber-700";
  if (/Verified|Accepted|Closed|Logistics Accepted|Clearance Ready/i.test(s)) return "bg-emerald-100 text-emerald-700";
  return "bg-blue-100 text-blue-700";
};

export function AmDashboard() {
  const [reqs, setReqs] = useState<Req[]>(SEED_REQ);
  const [clrs, setClrs] = useState<Clearance[]>(SEED_CLR);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; body: string; onOk: () => void } | null>(null);

  // record payment form
  const [rpReq, setRpReq] = useState("");
  const [rpMode, setRpMode] = useState("NEFT");
  const [rpDate, setRpDate] = useState("");
  const [rpRef, setRpRef] = useState("");
  const [rpInvoice, setRpInvoice] = useState("");

  const [followNote, setFollowNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const update = (id: string, fn: (r: Req) => Req) => setReqs((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));
  const log = (r: Req, action: string): Req => ({ ...r, history: [...r.history, { at: "Now", by: MANAGER, action }] });
  const move = (r: Req, status: PayStatus, action: string) => {
    update(r.id, (x) => log({ ...x, status }, action));
    toast.success(`${r.id} → ${status}`);
  };

  const k = {
    newReq: reqs.filter((r) => r.status === "Request Submitted").length,
    pending: reqs.filter((r) => ["Accepted", "Payment Requested", "Follow-up Due", "Partially Paid", "Information Required"].includes(r.status)).length,
    followToday: reqs.filter((r) => r.nextFollowUp === "Today").length,
    overdue: reqs.filter((r) => r.daysOverdue > 0).length,
    receivedCount: reqs.filter((r) => r.received > 0).length,
    verifyPending: reqs.filter((r) => r.status === "Verification Pending").length,
    readyClear: clrs.filter((c) => c.logistics === "Not Sent").length,
    awaitLog: clrs.filter((c) => c.logistics === "Sent — Awaiting Acceptance").length,
  };

  const priorities = [
    ...reqs.filter((r) => r.status === "Request Submitted").map((r) => ({ tag: "New request to accept", tone: "blue", r })),
    ...reqs.filter((r) => r.status === "Verification Pending").map((r) => ({ tag: "Payment received, not verified", tone: "amber", r })),
    ...reqs.filter((r) => r.daysOverdue > 0).map((r) => ({ tag: `Overdue ${r.daysOverdue} day(s) — follow up`, tone: "red", r })),
    ...reqs.filter((r) => r.status === "Partially Paid").map((r) => ({ tag: `Partial — ${Math.round((r.received / r.target) * 100)}% collected`, tone: "amber", r })),
  ].slice(0, 6);

  const alerts = [
    ...reqs.filter((r) => r.status === "Request Submitted").map((r) => ({ level: "amber", text: `${r.id} — Project request not accepted yet (${r.city})` })),
    ...reqs.filter((r) => r.due === "Today").map((r) => ({ level: "amber", text: `${r.id} — Payment due today` })),
    ...reqs.filter((r) => r.daysOverdue > 0).map((r) => ({ level: "red", text: `${r.id} — Payment overdue by ${r.daysOverdue} day(s)` })),
    ...reqs.filter((r) => r.received > 0 && r.received < r.amount).map((r) => ({ level: "amber", text: `${r.id} — Only ${Math.round((r.received / r.target) * 100)}% of the expected target was matched — verify` })),
    ...duplicateRefs(reqs).map((t) => ({ level: "red", text: t })),
    ...clrs.filter((c) => c.logistics === "Not Sent").map((c) => ({ level: "amber", text: `${c.reqId} — Payment verified but dispatch clearance not sent` })),
    ...clrs.filter((c) => c.logistics === "Sent — Awaiting Acceptance").map((c) => ({ level: "amber", text: `${c.id} — Logistics has not accepted the clearance` })),
    ...reqs.filter((r) => r.launchAtRisk).map((r) => ({ level: "red", text: `${r.projectId} — Launch date at risk due to pending payment` })),
    ...clrs.filter((c) => c.logistics === "Returned").map((c) => ({ level: "red", text: `${c.id} — Clearance returned: ${c.returnReason}` })),
  ];

  const next = reqs.find((r) => r.status === "Request Submitted") ?? reqs.find((r) => r.status === "Verification Pending") ?? reqs[0];
  const open = reqs.find((r) => r.id === openId) ?? null;

  const searched = q
    ? reqs.filter((r) => `${r.id} ${r.projectId} ${r.store} ${r.owner} ${r.city} ${r.type}`.toLowerCase().includes(q.toLowerCase()))
    : reqs;

  const recommend = (r: Req): string => {
    switch (r.status) {
      case "Request Submitted": return "Accept the request or return it for missing information";
      case "Information Required": return "Waiting on Project Coordinator to complete details";
      case "Accepted": return "Send the payment request to the franchise owner";
      case "Payment Requested":
      case "Follow-up Due": return "Call the franchise owner and record the follow-up";
      case "Partially Paid": return `Collect balance — ${Math.round((r.received / r.target) * 100)}% of target collected`;
      case "Payment Received":
      case "Verification Pending": return "Verify amount, reference and proof of payment";
      case "Verified": return "Create and send dispatch clearance to Logistics";
      case "Verification Rejected": return "Ask franchise for correct payment proof";
      case "Clearance Sent": return "Awaiting Logistics acceptance";
      default: return "No action pending";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead title={`Welcome, ${MANAGER}`} sub={`Accounts Manager workspace · ${TODAY}`} />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-full sm:w-64" placeholder="Search request, franchise or project" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => toast.info(`${alerts.length} notifications`)}>
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setRecordOpen(true)}>
            <Wallet className="h-4 w-4 mr-2" /> Record Payment
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="New Project Requests" value={String(k.newReq)} />
        <StatCard label="Payment Requests Pending" value={String(k.pending)} />
        <StatCard label="Follow-ups Due Today" value={String(k.followToday)} tone="warn" />
        <StatCard label="Overdue Payments" value={String(k.overdue)} tone="bad" />
        <StatCard label="Payments Received" value={String(k.receivedCount)} tone="good" />
        <StatCard label="Verification Pending" value={String(k.verifyPending)} tone="warn" />
        <StatCard label="Ready for Dispatch Clearance" value={String(k.readyClear)} />
        <StatCard label="Clearance Awaiting Logistics" value={String(k.awaitLog)} tone="warn" />
      </div>

      {/* Next action */}
      {next && (
        <Card className="border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Next action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Field label="Payment Request" value={next.id} />
              <Field label="Franchise / project" value={`${next.store} · ${next.projectId}`} />
              <Field label="Franchise owner" value={next.owner} />
              <Field label="Purpose" value={next.purpose} />
              <Field label="Collection progress" value={`${Math.round((next.received / next.target) * 100)}% of target`} />
              <Field label="Due date" value={next.due} />
              <Field label="Requested by" value={next.requestedBy} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={tone(next.status)}>{next.status}</Badge>
              <span className="text-sm text-muted-foreground">Recommended: {recommend(next)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={next.status !== "Request Submitted"} onClick={() => move(next, "Accepted", "Request accepted")}>
                Accept Request
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info(`Contact ${next.owner} · ${next.ownerPhoneMasked} (calling not enabled yet)`)}>
                <PhoneCall className="h-4 w-4 mr-2" /> Contact Franchise
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpenId(next.id)}>Record Follow-up</Button>
              <Button size="sm" variant="outline" disabled={next.status !== "Verification Pending"} onClick={() => setOpenId(next.id)}>
                Verify Payment
              </Button>
              <Button size="sm" variant="outline" disabled={next.status !== "Verified"} onClick={() => setOpenId(next.id)}>
                Send Dispatch Clearance
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpenId(next.id)}>View Details</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priorities + alerts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Today's priorities</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {priorities.map((p, i) => (
              <button key={i} onClick={() => setOpenId(p.r.id)} className="w-full text-left border rounded-md p-3 hover:bg-muted/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{p.r.id} · {p.r.store}</span>
                  <Badge className={p.tone === "red" ? "bg-rose-100 text-rose-700" : p.tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}>
                    {p.tag}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{p.r.type} · due {p.r.due}</div>
              </button>
            ))}
            {priorities.length === 0 && <div className="text-sm text-muted-foreground">Nothing urgent right now.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Attention alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-80 overflow-auto">
            {alerts.map((a, i) => (
              <div key={i} className={`text-xs rounded-md border p-2 ${a.level === "red" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "Review Project Request",
            "Request Payment",
            "Record Follow-up",
            "Record Payment Received",
            "Verify Payment",
            "Send Dispatch Clearance",
            "Open Vyapar Reference",
            "View Performance",
          ].map((a) => (
            <Button
              key={a}
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => (a === "Record Payment Received" ? setRecordOpen(true) : toast.info(`${a} — open the related section to continue`))}
            >
              {a}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Latest project payment requests */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Project payment requests (latest 5)</CardTitle></CardHeader>
        <CardContent className="p-0 md:p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Franchise owner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {searched.slice(0, 5).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell className="text-xs">{r.projectId}</TableCell>
                    <TableCell className="text-sm">{r.owner}</TableCell>
                    <TableCell className="text-sm">{r.city}</TableCell>
                    <TableCell className="text-xs">{r.requestedBy}</TableCell>
                    <TableCell className="text-sm">{r.type}</TableCell>
                    <TableCell className="text-sm">{r.due}</TableCell>
                    <TableCell><Badge className={tone(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setOpenId(r.id)}>Review Request</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden p-3 space-y-2">
            {searched.slice(0, 5).map((r) => (
              <button key={r.id} onClick={() => setOpenId(r.id)} className="w-full text-left border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.id} · {r.city}</span>
                  <Badge className={tone(r.status)}>{r.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{r.owner} · {r.type} · {r.projectId}</div>
                <div className="text-sm font-medium mt-1">Due {r.due}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Payment follow-ups</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {reqs.filter((r) => ["Payment Requested", "Follow-up Due", "Partially Paid"].includes(r.status)).map((r) => (
            <div key={r.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">{r.owner} · {r.id}</div>
                <div className="text-xs text-muted-foreground">
                  {r.purpose} · due {r.due} · last follow-up {r.lastFollowUp ?? "—"} · next {r.nextFollowUp ?? "—"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-semibold">{Math.round((r.received / r.target) * 100)}% collected</span>
                {r.daysOverdue > 0 && <Badge className="bg-rose-100 text-rose-700">{r.daysOverdue}d overdue</Badge>}
                <Button size="sm" variant="outline" onClick={() => setOpenId(r.id)}>Follow Up</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Payment verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reqs.filter((r) => ["Payment Received", "Verification Pending", "Partially Paid", "Verification Rejected"].includes(r.status)).map((r) => (
            <div key={r.id} className="border rounded-md p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-sm">{r.id} · {r.store}</div>
                <Badge className={tone(r.status)}>{r.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <Field label="Collection progress" value={`${Math.round((r.received / r.target) * 100)}% of target`} />
                <Field label="Payment date" value={r.payDate ?? "—"} />
                <Field label="Mode" value={r.mode ?? "—"} />
                <Field label="Transaction ref" value={r.txnMasked ?? "—"} />
                <Field label="Proof" value={r.proof ?? "Not uploaded"} />
                <Field label="Vyapar invoice" value={r.vyaparInvoice ?? "—"} />
                <Field label="Receipt no." value={r.receiptNo ?? "—"} />
              </div>
              <Button
                size="sm"
                disabled={r.status === "Verification Rejected" || r.received === 0}
                onClick={() => {
                  update(r.id, (x) => log({ ...x, status: "Verified" }, `Payment verified by ${MANAGER}`));
                  toast.success(`${r.id} verified`);
                }}
              >
                Verify
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dispatch clearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" /> Dispatch clearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {clrs.map((c) => (
            <div key={c.id} className="border rounded-md p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">{c.id} · {c.store}</div>
                <div className="flex items-center gap-2">
                  <Badge className={c.priority === "Urgent" ? "bg-rose-100 text-rose-700" : c.priority === "High" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}>
                    {c.priority}
                  </Badge>
                  <Badge className={tone(c.logistics)}>{c.logistics}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <Field label="Payment request" value={c.reqId} />
                <Field label="Project" value={c.projectId} />
                <Field label="Items cleared" value={c.items} />
                <Field label="Verified on" value={c.verifiedOn} />
              </div>
              {c.returnReason && <div className="text-xs text-rose-700">Returned by Logistics: {c.returnReason}</div>}
              <Button
                size="sm"
                disabled={c.logistics !== "Not Sent"}
                onClick={() => {
                  setClrs((cs) => cs.map((x) => (x.id === c.id ? { ...x, logistics: "Sent — Awaiting Acceptance" } : x)));
                  toast.success(`${c.id} sent to Logistics Executive`);
                }}
              >
                Send Clearance
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vyapar + Billing POS + rules */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Vyapar reference</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>Only references are stored here: party, invoice number, invoice date and amount, receipt number, payment reference and status, plus an optional secure invoice copy.</div>
            <div>GST ledgers, bookkeeping and tax returns stay in Vyapar — this CRM never duplicates accounting.</div>
          </CardContent>
        </Card>
        <Card className="opacity-70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Billing POS</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Badge className="bg-muted text-muted-foreground mb-2">Coming in Phase 2</Badge>
            <div className="text-xs">Store billing, invoicing and POS accounting will be enabled later.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Controls in force</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>Project Coordinators can request payment but cannot verify it.</div>
            <div>Logistics can view clearance but cannot edit verification.</div>
            <div>Bank and transaction details are masked; passwords, OTPs, card details and UPI PINs are never stored.</div>
            <div>Reversing a verification or cancelling a clearance needs confirmation and alerts the Coordinator and Logistics.</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance preparation */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Performance signals being collected</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            ["Request acceptance time", "4.2 hrs", 82],
            ["Follow-ups on time", "88%", 88],
            ["Average collection time", "6.1 days", 74],
            ["Verification time", "3.4 hrs", 90],
            ["Overdue payment rate", "12%", 68],
            ["Clearance turnaround", "9 hrs", 85],
            ["Clearance errors / reversals", "1", 95],
            ["Delays caused by Accounts", "0", 100],
          ].map(([label, value, pct]) => (
            <div key={label as string} className="rounded-md border p-3">
              <div className="text-muted-foreground">{label}</div>
              <div className="text-lg font-semibold">{value}</div>
              <Progress value={pct as number} className="h-1.5 mt-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detail drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  {open.id} · {open.store}
                  <Badge className={tone(open.status)}>{open.status}</Badge>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Project" value={open.projectId} />
                  <Field label="Franchise owner" value={`${open.owner} · ${open.ownerPhoneMasked}`} />
                  <Field label="Payment type" value={open.type} />
                  <Field label="Purpose" value={open.purpose} />
                  <Field label="Collection progress" value={`${Math.round((open.received / open.target) * 100)}% of target`} />
                  <Field label="Due date" value={open.due} />
                  <Field label="Requested by" value={open.requestedBy} />
                  <Field label="Vyapar invoice" value={open.vyaparInvoice ?? "—"} />
                  <Field label="Vyapar party" value={open.vyaparParty ?? "—"} />
                  <Field label="Receipt no." value={open.receiptNo ?? "—"} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Recommended next action: {recommend(open)}
                </p>

                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={open.status !== "Request Submitted"} onClick={() => move(open, "Accepted", "Request accepted")}>Accept Request</Button>
                  <Button size="sm" variant="outline" disabled={open.status !== "Request Submitted"} onClick={() => move(open, "Information Required", "Returned for missing information")}>Return for Information</Button>
                  <Button size="sm" variant="outline" disabled={open.status !== "Accepted"} onClick={() => move(open, "Payment Requested", `Payment requested from ${open.owner}`)}>Request Payment</Button>
                  <Button size="sm" variant="outline" disabled={open.status !== "Verification Pending"} onClick={() => move(open, "Verified", "Payment verified")}>Verify Payment</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={open.status !== "Verified" || clrs.some((c) => c.reqId === open.id)}
                    onClick={() => {
                      const id = `CLR-${910 + clrs.length}`;
                      setClrs((cs) => [
                        { id, reqId: open.id, projectId: open.projectId, store: open.store, items: open.type, verifiedOn: "Today", priority: "High", logistics: "Not Sent" },
                        ...cs,
                      ]);
                      update(open.id, (x) => log({ ...x, status: "Dispatch Clearance Ready" }, `Dispatch clearance ${id} created`));
                      toast.success(`Clearance ${id} created`);
                    }}
                  >
                    Create Dispatch Clearance
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={open.status !== "Verified" && open.status !== "Dispatch Clearance Ready"}
                    onClick={() =>
                      setConfirm({
                        title: "Reverse verification?",
                        body: `This will reopen ${open.id} for verification and alert the Project Coordinator and Logistics Executive.`,
                        onOk: () => {
                          update(open.id, (x) => log({ ...x, status: "Verification Pending" }, "Verification reversed — Coordinator and Logistics alerted"));
                          toast.success("Verification reversed, stakeholders alerted");
                        },
                      })
                    }
                  >
                    Reverse Verification
                  </Button>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label className="text-xs">Follow-up note</Label>
                    <Textarea rows={2} value={followNote} onChange={(e) => setFollowNote(e.target.value)} placeholder="Spoke to owner, payment promised on…" />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        if (!followNote.trim()) return toast.error("Write the follow-up note first");
                        update(open.id, (x) => log({ ...x, status: x.status === "Payment Requested" ? "Follow-up Due" : x.status, lastFollowUp: "Today" }, `Follow-up: ${followNote.trim()}`));
                        toast.success("Follow-up recorded");
                        setFollowNote("");
                      }}
                    >
                      Record Follow-up
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs">Verification rejection reason</Label>
                    <Textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Amount mismatch, duplicate reference…" />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        if (!rejectReason.trim()) return toast.error("Reason is required");
                        update(open.id, (x) => log({ ...x, status: "Verification Rejected" }, `Verification rejected: ${rejectReason.trim()}`));
                        toast.success("Verification rejected");
                        setRejectReason("");
                      }}
                    >
                      Reject Verification
                    </Button>
                  </div>
                </div>

                <Separator />
                <div>
                  <div className="font-medium mb-2">History</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {open.history.map((h, i) => (
                      <div key={i}>• {h.at} — {h.by}: {h.action}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Record payment dialog */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment received</DialogTitle>
            <DialogDescription>Never enter banking passwords, OTPs, card numbers or UPI PINs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Payment request</Label>
              <Select value={rpReq} onValueChange={setRpReq}>
                <SelectTrigger><SelectValue placeholder="Select request" /></SelectTrigger>
                <SelectContent>
                  {reqs.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.id} · {r.owner} · balance due</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Payment date</Label>
                <Input type="date" value={rpDate} onChange={(e) => setRpDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Payment mode</Label>
                <Select value={rpMode} onValueChange={setRpMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["NEFT", "RTGS", "IMPS", "UPI", "Cheque", "Cash"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Transaction reference</Label>
                <Input value={rpRef} onChange={(e) => setRpRef(e.target.value)} placeholder="UTR / cheque no." />
              </div>
            </div>
            <div>
              <Label className="text-xs">Vyapar invoice number</Label>
              <Input value={rpInvoice} onChange={(e) => setRpInvoice(e.target.value)} placeholder="VY-INV-…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const target = reqs.find((r) => r.id === rpReq);
                if (!target) return toast.error("Select a payment request");
                if (rpRef && reqs.some((r) => r.txnMasked === maskRef(rpRef))) {
                  return toast.error("Duplicate transaction reference — verify before recording");
                }
                const received = Math.min(target.target, target.received + 1);
                update(target.id, (x) =>
                  log(
                    {
                      ...x,
                      received,
                      payDate: rpDate || "Today",
                      mode: rpMode,
                      txnMasked: rpRef ? maskRef(rpRef) : x.txnMasked,
                      vyaparInvoice: rpInvoice || x.vyaparInvoice,
                      status: received >= x.target ? "Verification Pending" : "Partially Paid",
                    },
                    `Payment recorded (${rpMode})`,
                  ),
                );
                toast.success(`Payment recorded against ${target.id}`);
                setRecordOpen(false);
                setRpRef(""); setRpInvoice(""); setRpReq("");
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirm?.onOk();
                setConfirm(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function maskRef(ref: string) {
  return `XXXXXX${ref.trim().slice(-4)}`;
}

function duplicateRefs(reqs: Req[]) {
  const seen = new Map<string, string[]>();
  reqs.forEach((r) => {
    if (!r.txnMasked) return;
    seen.set(r.txnMasked, [...(seen.get(r.txnMasked) ?? []), r.id]);
  });
  return Array.from(seen.entries())
    .filter(([, ids]) => ids.length > 1)
    .map(([ref, ids]) => `Duplicate transaction reference ${ref} on ${ids.join(", ")}`);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{value}</div>
    </div>
  );
}
