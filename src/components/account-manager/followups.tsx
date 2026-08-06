import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AlertTriangle, PhoneCall, Search, ShieldCheck, Wallet } from "lucide-react";

const MANAGER = "Priya Nair";
const maskRef = (r: string) => (r.length > 4 ? `XXXXXX${r.trim().slice(-4)}` : `XXXXXX${r}`);

type PayStatus =
  | "Payment Requested"
  | "Follow-up Scheduled"
  | "Partially Paid"
  | "Payment Received"
  | "Verification Pending"
  | "Verified"
  | "Ready for Dispatch Clearance"
  | "Payment Failed"
  | "Verification Rejected"
  | "Disputed"
  | "Cancelled";

const PAYMENT_MODES = ["Bank Transfer", "UPI", "Cheque", "Cash", "Card", "Payment Gateway", "Other Approved Method"] as const;

const OUTCOMES = [
  "Payment Promised",
  "Partial Payment Promised",
  "Payment Already Made",
  "Payment Proof Requested",
  "Invoice Clarification Required",
  "Payment Disputed",
  "Franchise Unreachable",
  "Follow-up Again",
  "Escalation Required",
] as const;

const REJECT_REASONS = [
  "Amount mismatch",
  "Transaction not found",
  "Duplicate transaction",
  "Incorrect project",
  "Invalid payment proof",
  "Payment reversed or failed",
  "Invoice mismatch",
  "Other",
] as const;

const CHECKLIST = [
  "Correct franchise or project",
  "Amount matches payment request",
  "Transaction reference available",
  "Payment proof reviewed",
  "Bank or approved payment record checked",
  "Vyapar invoice reference available",
  "Vyapar receipt reference recorded",
  "Duplicate transaction check completed",
  "Payment date confirmed",
  "Remaining balance calculated",
];

type Txn = {
  id: string;
  date: string;
  mode: (typeof PAYMENT_MODES)[number];
  accountMasked: string;
  refMasked: string;
  proof: string;
  receipt: string;
  recordedBy: string;
  reviewed: boolean;
};

type FollowUp = {
  at: string;
  person: string;
  method: string;
  outcome: (typeof OUTCOMES)[number];
  promiseDate?: string;
  comments?: string;
  note?: string;
  nextAction: string;
  nextAt: string;
};

type Pay = {
  id: string;
  projectId: string;
  store: string;
  owner: string;
  phoneMasked: string;
  coordinator: string;
  type: string;
  purpose: string;
  target: number;
  due: string;
  daysOverdue: number;
  status: PayStatus;
  requestedOn: string;
  instructions: string;
  vyaparInvoice: string;
  invoiceDate: string;
  clearanceRequired: boolean;
  launchDate: string;
  launchAtRisk?: boolean;
  nextAction: string;
  nextActionDue: string;
  nextPaymentDue?: string;
  dispatchOnPartial?: boolean;
  partialApproval?: string;
  txns: Txn[];
  follows: FollowUp[];
  verification?: {
    by: string;
    at: string;
    receipt: string;
    note: string;
    clearanceRequired: boolean;
  };
  rejection?: { reason: string; corrective: string; nextAction: string; owner: string; due: string };
  history: { at: string; by: string; action: string }[];
};

const SEED: Pay[] = [
  {
    id: "PAY-3102", projectId: "PRJ-IND-03", store: "Clean Craft Indore", owner: "Meena Joshi",
    phoneMasked: "+91 97XXXXXX40", coordinator: "Anita Rao", type: "Franchise Fee",
    purpose: "Second franchise instalment", target: 2, due: "2 Aug 2026", daysOverdue: 2,
    status: "Partially Paid", requestedOn: "27 Jul 2026",
    instructions: "NEFT to Clean Craft current account (masked).", vyaparInvoice: "VY-INV-2291",
    invoiceDate: "26 Jul 2026", clearanceRequired: false,
    launchDate: "12 Sep 2026", nextAction: "Collect balance instalment", nextActionDue: "6 Aug 2026",
    nextPaymentDue: "8 Aug 2026", dispatchOnPartial: false,
    txns: [{
      id: "TXN-8801", date: "1 Aug 2026", mode: "Bank Transfer",
      accountMasked: "HDFC ••••4417", refMasked: "XXXXXX7741", proof: "receipt_indore_1.pdf",
      receipt: "RCP-1188", recordedBy: MANAGER, reviewed: true,
    }],
    follows: [{
      at: "3 Aug 2026, 11:15", person: "Meena Joshi", method: "Call", outcome: "Partial Payment Promised",
      promiseDate: "8 Aug 2026", comments: "Balance after shop advance is released",
      note: "Send Vyapar invoice copy again", nextAction: "Follow up on balance", nextAt: "6 Aug 2026, 11:00",
    }],
    history: [
      { at: "27 Jul 09:30", by: MANAGER, action: "Request accepted, payment requested" },
      { at: "1 Aug 16:20", by: MANAGER, action: "Part payment recorded" },
    ],
  },
  {
    id: "PAY-3103", projectId: "PRJ-LKO-02", store: "Clean Craft Lucknow", owner: "Sunil Mishra",
    phoneMasked: "+91 99XXXXXX08", coordinator: "Rahul Sharma", type: "Machine Payment",
    purpose: "Machine balance before dispatch", target: 1, due: "3 Aug 2026", daysOverdue: 0,
    status: "Verification Pending", requestedOn: "24 Jul 2026",
    instructions: "RTGS to Clean Craft current account (masked).", vyaparInvoice: "VY-INV-2277",
    invoiceDate: "24 Jul 2026", clearanceRequired: true,
    launchDate: "16 Aug 2026", nextAction: "Verify RTGS payment", nextActionDue: "4 Aug 2026",
    txns: [{
      id: "TXN-8812", date: "3 Aug 2026", mode: "Bank Transfer",
      accountMasked: "ICICI ••••9032", refMasked: "XXXXXX3390", proof: "utr_lucknow.jpg",
      receipt: "RCP-1201", recordedBy: MANAGER, reviewed: false,
    }],
    follows: [{
      at: "31 Jul 2026, 10:00", person: "Sunil Mishra", method: "WhatsApp", outcome: "Payment Promised",
      promiseDate: "3 Aug 2026", note: "Owner arranging RTGS",
      nextAction: "Confirm receipt", nextAt: "3 Aug 2026, 17:00",
    }],
    history: [
      { at: "24 Jul 15:00", by: MANAGER, action: "Payment requested" },
      { at: "3 Aug 12:00", by: MANAGER, action: "Payment received, sent for verification" },
    ],
  },
  {
    id: "PAY-3105", projectId: "PRJ-BPL-04", store: "Clean Craft Bhopal", owner: "Alok Jain",
    phoneMasked: "+91 88XXXXXX32", coordinator: "Anita Rao", type: "Training Fee",
    purpose: "Owner and manpower training batch", target: 1, due: "29 Jul 2026", daysOverdue: 6,
    status: "Follow-up Scheduled", requestedOn: "20 Jul 2026",
    instructions: "UPI or NEFT accepted.", vyaparInvoice: "VY-INV-2248", invoiceDate: "20 Jul 2026",
    clearanceRequired: false, launchDate: "10 Aug 2026", launchAtRisk: true,
    nextAction: "Call owner — promise date missed", nextActionDue: "Today",
    txns: [],
    follows: [{
      at: "1 Aug 2026, 11:00", person: "Alok Jain", method: "Call", outcome: "Payment Promised",
      promiseDate: "2 Aug 2026", comments: "Will pay after batch confirmation",
      nextAction: "Follow up again", nextAt: "3 Aug 2026, 11:00",
    }],
    history: [{ at: "20 Jul 14:00", by: MANAGER, action: "Payment requested" }],
  },
  {
    id: "PAY-3104", projectId: "PRJ-SUR-05", store: "Clean Craft Surat", owner: "Bhavesh Patel",
    phoneMasked: "+91 90XXXXXX66", coordinator: "Deepak Yadav", type: "Consumables Payment",
    purpose: "Opening consumables kit", target: 1, due: "31 Jul 2026", daysOverdue: 0,
    status: "Verified", requestedOn: "22 Jul 2026", instructions: "UPI accepted.",
    vyaparInvoice: "VY-INV-2260", invoiceDate: "22 Jul 2026",
    clearanceRequired: true, launchDate: "28 Aug 2026",
    nextAction: "Send dispatch clearance", nextActionDue: "Today",
    txns: [{
      id: "TXN-8790", date: "30 Jul 2026", mode: "UPI", accountMasked: "SBI ••••7710",
      refMasked: "XXXXXX9014", proof: "surat_consumables.pdf", receipt: "RCP-1176",
      recordedBy: MANAGER, reviewed: true,
    }],
    follows: [],
    verification: { by: MANAGER, at: "30 Jul 2026, 17:05", receipt: "RCP-1176", note: "Bank record matched", clearanceRequired: true },
    history: [{ at: "30 Jul 17:05", by: MANAGER, action: "Payment verified — ready for dispatch clearance" }],
  },
  {
    id: "PAY-3106", projectId: "PRJ-NAG-01", store: "Clean Craft Nagpur", owner: "Kavita Deshmukh",
    phoneMasked: "+91 93XXXXXX77", coordinator: "Neha Gupta", type: "App or POS Fee",
    purpose: "POS licence and setup fee", target: 1, due: "2 Aug 2026", daysOverdue: 2,
    status: "Verification Rejected", requestedOn: "25 Jul 2026", instructions: "UPI accepted.",
    vyaparInvoice: "VY-INV-2284", invoiceDate: "25 Jul 2026",
    clearanceRequired: false, launchDate: "5 Sep 2026",
    nextAction: "Get correct UTR from franchise", nextActionDue: "5 Aug 2026",
    txns: [{
      id: "TXN-8805", date: "2 Aug 2026", mode: "UPI", accountMasked: "ICICI ••••9032",
      refMasked: "XXXXXX3390", proof: "nagpur_pos.jpg", receipt: "RCP-1194", recordedBy: MANAGER, reviewed: true,
    }],
    follows: [],
    rejection: {
      reason: "Duplicate transaction", corrective: "Share correct UTR and bank statement line",
      nextAction: "Franchise to resend proof", owner: "Kavita Deshmukh", due: "5 Aug 2026",
    },
    history: [{ at: "2 Aug 18:00", by: MANAGER, action: "Verification rejected — duplicate transaction reference" }],
  },
  {
    id: "PAY-3112", projectId: "PRJ-PUN-08", store: "Clean Craft Kothrud", owner: "Snehal Kulkarni",
    phoneMasked: "+91 90XXXXXX18", coordinator: "Anita Rao", type: "Security Deposit",
    purpose: "Refundable security deposit", target: 1, due: "12 Aug 2026", daysOverdue: 0,
    status: "Payment Requested", requestedOn: "3 Aug 2026", instructions: "Bank transfer preferred.",
    vyaparInvoice: "VY-INV-2302", invoiceDate: "3 Aug 2026",
    clearanceRequired: false, launchDate: "18 Sep 2026",
    nextAction: "First follow-up call", nextActionDue: "7 Aug 2026",
    txns: [], follows: [],
    history: [{ at: "3 Aug 17:00", by: MANAGER, action: "Payment requested from franchise" }],
  },
  {
    id: "PAY-3098", projectId: "PRJ-PAT-03", store: "Clean Craft Patna", owner: "Ramesh Prasad",
    phoneMasked: "+91 96XXXXXX24", coordinator: "Suresh Patel", type: "Machine Payment",
    purpose: "Machine balance", target: 1, due: "28 Jul 2026", daysOverdue: 7,
    status: "Disputed", requestedOn: "18 Jul 2026", instructions: "RTGS preferred.",
    vyaparInvoice: "VY-INV-2239", invoiceDate: "18 Jul 2026",
    clearanceRequired: true, launchDate: "20 Aug 2026", launchAtRisk: true,
    nextAction: "Reconcile invoice with COO", nextActionDue: "5 Aug 2026",
    txns: [],
    follows: [{
      at: "30 Jul 2026, 15:00", person: "Ramesh Prasad", method: "In-person discussion", outcome: "Payment Disputed",
      comments: "Owner claims dryer capacity differs from quotation",
      nextAction: "Escalate to COO", nextAt: "5 Aug 2026, 11:00",
    }],
    history: [{ at: "30 Jul 15:20", by: MANAGER, action: "Dispute raised — invoice mismatch" }],
  },
];

const TABS = [
  "Follow-ups Due",
  "Overdue",
  "Partially Paid",
  "Payment Received",
  "Verification Pending",
  "Verified",
  "Rejected or Disputed",
  "All",
] as const;
type TabKey = (typeof TABS)[number];

const tone = (s: PayStatus) => {
  if (["Payment Failed", "Verification Rejected", "Disputed"].includes(s)) return "bg-rose-100 text-rose-700";
  if (s === "Cancelled") return "bg-muted text-muted-foreground";
  if (["Verified", "Ready for Dispatch Clearance"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["Follow-up Scheduled", "Partially Paid", "Verification Pending", "Payment Received"].includes(s)) return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
};

const received = (p: Pay) => p.txns.length;
const balance = (p: Pay) => Math.max(0, p.target - received(p));
const progressPct = (p: Pay) => Math.min(100, Math.round((received(p) / p.target) * 100));
const lastFollow = (p: Pay) => p.follows.at(-1);

export function AmFollowups() {
  const [pays, setPays] = useState<Pay[]>(SEED);
  const [tab, setTab] = useState<TabKey>("Follow-ups Due");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [reqOpen, setReqOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; body: string; onOk: () => void } | null>(null);

  // filters
  const [fCoord, setFCoord] = useState("all");
  const [fProject, setFProject] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fType, setFType] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fMode, setFMode] = useState("all");
  const [fClearance, setFClearance] = useState("all");
  const [fDue, setFDue] = useState("");

  // payment request form
  const [rDate, setRDate] = useState("");
  const [rDue, setRDue] = useState("");
  const [rInstr, setRInstr] = useState("");
  const [rInvoice, setRInvoice] = useState("");
  const [rInvDate, setRInvDate] = useState("");
  const [rMethod, setRMethod] = useState("Call");
  const [rMsg, setRMsg] = useState("");
  const [rNext, setRNext] = useState("");

  // follow-up form
  const [fuAt, setFuAt] = useState("");
  const [fuPerson, setFuPerson] = useState("");
  const [fuMethod, setFuMethod] = useState("Call");
  const [fuOutcome, setFuOutcome] = useState<(typeof OUTCOMES)[number]>("Payment Promised");
  const [fuPromiseDate, setFuPromiseDate] = useState("");
  const [fuComments, setFuComments] = useState("");
  const [fuNote, setFuNote] = useState("");
  const [fuNextAction, setFuNextAction] = useState("");
  const [fuNextAt, setFuNextAt] = useState("");

  // payment received form
  const [pDate, setPDate] = useState("");
  const [pMode, setPMode] = useState<(typeof PAYMENT_MODES)[number]>("Bank Transfer");
  const [pAccount, setPAccount] = useState("");
  const [pRef, setPRef] = useState("");
  const [pProof, setPProof] = useState("");
  const [pReceipt, setPReceipt] = useState("");
  const [pOverride, setPOverride] = useState(false);

  // verify form
  const [vReceipt, setVReceipt] = useState("");
  const [vNote, setVNote] = useState("");
  const [vClearance, setVClearance] = useState("yes");

  // reject form
  const [jReason, setJReason] = useState<(typeof REJECT_REASONS)[number]>("Amount mismatch");
  const [jCorrective, setJCorrective] = useState("");
  const [jNext, setJNext] = useState("");
  const [jOwner, setJOwner] = useState("");
  const [jDue, setJDue] = useState("");

  // partial form
  const [ptNextDue, setPtNextDue] = useState("");
  const [ptDispatch, setPtDispatch] = useState("no");
  const [ptApproval, setPtApproval] = useState("");

  // dispute
  const [dNote, setDNote] = useState("");

  const open = pays.find((p) => p.id === openId) ?? null;
  const uniq = (fn: (p: Pay) => string) => Array.from(new Set(pays.map(fn)));
  const update = (id: string, fn: (p: Pay) => Pay) => setPays((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const log = (p: Pay, action: string): Pay => ({ ...p, history: [...p.history, { at: "Now", by: MANAGER, action }] });

  const kpi = {
    dueToday: pays.filter((p) => lastFollow(p)?.nextAt?.includes("Today") || p.nextActionDue === "Today").length,
    overdue: pays.filter((p) => p.daysOverdue > 0 && !["Verified", "Cancelled"].includes(p.status)).length,
    partial: pays.filter((p) => p.status === "Partially Paid").length,
    receivedCount: pays.filter((p) => received(p) > 0).length,
    verifyPending: pays.filter((p) => p.status === "Verification Pending").length,
    verifiedToday: pays.filter((p) => p.status === "Verified").length,
  };

  const dupRefs = useMemo(() => {
    const map = new Map<string, string[]>();
    pays.forEach((p) => p.txns.forEach((t) => map.set(t.refMasked, [...(map.get(t.refMasked) ?? []), p.id])));
    return Array.from(map.entries()).filter(([, ids]) => new Set(ids).size > 1);
  }, [pays]);

  const alerts = [
    ...pays.filter((p) => p.daysOverdue > 0 && !["Verified", "Cancelled"].includes(p.status)).map((p) => ({ level: "red", t: `${p.id} — Payment overdue by ${p.daysOverdue} day(s)` })),
    ...pays.filter((p) => { const f = lastFollow(p); return f?.promiseDate && received(p) < p.target && f.promiseDate < "3 Aug 2026"; }).map((p) => ({ level: "red", t: `${p.id} — Promise-to-pay date missed (${lastFollow(p)?.promiseDate})` })),
    ...pays.filter((p) => p.nextActionDue === "Today" || p.nextActionDue === "3 Aug 2026").map((p) => ({ level: "amber", t: `${p.id} — Follow-up overdue: ${p.nextAction}` })),
        ...dupRefs.map(([ref, ids]) => ({ level: "red", t: `Duplicate transaction reference ${ref} on ${Array.from(new Set(ids)).join(", ")}` })),
    ...pays.filter((p) => p.txns.some((t) => !t.reviewed)).map((p) => ({ level: "amber", t: `${p.id} — Payment proof received but not reviewed` })),
    ...pays.filter((p) => p.status === "Partially Paid" && !p.nextPaymentDue).map((p) => ({ level: "amber", t: `${p.id} — Partial payment without next due date` })),
    ...pays.filter((p) => p.status === "Verification Rejected").map((p) => ({ level: "red", t: `${p.id} — Verification rejected: ${p.rejection?.reason}` })),
    ...pays.filter((p) => p.launchAtRisk).map((p) => ({ level: "red", t: `${p.projectId} — Launch delayed due to payment (planned ${p.launchDate})` })),
    ...pays.filter((p) => p.status === "Verified" && p.clearanceRequired).map((p) => ({ level: "amber", t: `${p.id} — Verified payment awaiting dispatch clearance` })),
  ];

  const inTab = (p: Pay) => {
    switch (tab) {
      case "Follow-ups Due": return ["Payment Requested", "Follow-up Scheduled", "Partially Paid"].includes(p.status);
      case "Overdue": return p.daysOverdue > 0 && !["Verified", "Cancelled"].includes(p.status);
      case "Partially Paid": return p.status === "Partially Paid";
      case "Payment Received": return p.status === "Payment Received" || (received(p) > 0 && p.status !== "Partially Paid");
      case "Verification Pending": return p.status === "Verification Pending";
      case "Verified": return p.status === "Verified" || p.status === "Ready for Dispatch Clearance";
      case "Rejected or Disputed": return ["Verification Rejected", "Disputed", "Payment Failed"].includes(p.status);
      default: return true;
    }
  };

  const rank = (p: Pay) => {
    if (p.daysOverdue > 0) return 0;
    if (p.status === "Verification Pending") return 1;
    if (["Verification Rejected", "Disputed"].includes(p.status)) return 2;
    if (p.status === "Partially Paid") return 3;
    return 4;
  };

  const list = pays
    .filter(inTab)
    .filter((p) => {
      if (q && !`${p.id} ${p.projectId} ${p.store} ${p.owner} ${p.type} ${p.coordinator}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (fCoord !== "all" && p.coordinator !== fCoord) return false;
      if (fProject !== "all" && p.projectId !== fProject) return false;
      if (fOwner !== "all" && p.owner !== fOwner) return false;
      if (fType !== "all" && p.type !== fType) return false;
      if (fStatus !== "all" && p.status !== fStatus) return false;
      if (fMode !== "all" && !p.txns.some((t) => t.mode === fMode)) return false;
      if (fClearance !== "all" && String(p.clearanceRequired) !== fClearance) return false;
      if (fDue && !p.due.toLowerCase().includes(fDue.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => rank(a) - rank(b));

  const checkedCount = CHECKLIST.filter((c) => checks[c]).length;
  const checklistDone = checkedCount === CHECKLIST.length;

  const openPay = (id: string) => {
    const p = pays.find((x) => x.id === id);
    setOpenId(id);
    setChecks({});
    if (p) {
      setVReceipt(p.txns.at(-1)?.receipt ?? "");
      setVClearance(p.clearanceRequired ? "yes" : "no");
      setRDue(p.due);
      setRInvoice(p.vyaparInvoice);
      setRInvDate(p.invoiceDate);
      setFuPerson(p.owner);
      setPtNextDue(p.nextPaymentDue ?? "");
      setPtDispatch(p.dispatchOnPartial ? "yes" : "no");
      setPtApproval(p.partialApproval ?? "");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead title="Payment Follow-ups & Verification" sub="Request payment, record follow-ups, capture receipts and verify before dispatch clearance" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-full sm:w-64" placeholder="Search payment, project or owner" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button size="sm" onClick={() => { const first = list[0] ?? pays[0]; openPay(first.id); setPayOpen(true); }}>
            <Wallet className="h-4 w-4 mr-2" /> Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Follow-ups Due Today" value={String(kpi.dueToday)} tone="warn" />
        <StatCard label="Overdue Payments" value={String(kpi.overdue)} tone="bad" />
        <StatCard label="Partially Paid" value={String(kpi.partial)} tone="warn" />
        <StatCard label="Payments Recorded" value={String(kpi.receivedCount)} tone="good" />
        <StatCard label="Verification Pending" value={String(kpi.verifyPending)} tone="warn" />
        <StatCard label="Verified Today" value={String(kpi.verifiedToday)} tone="good" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Attention</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1.5 md:grid-cols-2 max-h-56 overflow-auto">
          {alerts.map((a, i) => (
            <div key={i} className={`text-xs rounded-md border p-2 ${a.level === "red" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{a.t}</div>
          ))}
          {alerts.length === 0 && <div className="text-sm text-muted-foreground">No alerts.</div>}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <FilterSelect label="Project Coordinator" value={fCoord} onChange={setFCoord} options={uniq((p) => p.coordinator)} />
          <FilterSelect label="Franchise project" value={fProject} onChange={setFProject} options={uniq((p) => p.projectId)} />
          <FilterSelect label="Franchise owner" value={fOwner} onChange={setFOwner} options={uniq((p) => p.owner)} />
          <FilterSelect label="Payment type" value={fType} onChange={setFType} options={uniq((p) => p.type)} />
          <FilterSelect label="Payment status" value={fStatus} onChange={setFStatus} options={uniq((p) => p.status)} />
          <FilterSelect label="Payment mode" value={fMode} onChange={setFMode} options={PAYMENT_MODES as unknown as string[]} />
          <div>
            <Label className="text-[11px] text-muted-foreground">Dispatch clearance</Label>
            <Select value={fClearance} onValueChange={setFClearance}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Required</SelectItem>
                <SelectItem value="false">Not required</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Due date</Label>
            <Input className="h-9" placeholder="e.g. Aug" value={fDue} onChange={(e) => setFDue(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setFCoord("all"); setFProject("all"); setFOwner("all"); setFType("all"); setFStatus("all"); setFMode("all"); setFClearance("all"); setFDue(""); }}>Clear filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Owner / project</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Last / next follow-up</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id} className={p.daysOverdue > 0 ? "bg-rose-50/50" : undefined}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell className="text-sm">
                      <div>{p.owner}</div>
                      <div className="text-xs text-muted-foreground">{p.store} · {p.projectId}</div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">{p.purpose}</TableCell>
                    <TableCell className="text-right tabular-nums">{received(p)}/{p.target} · {progressPct(p)}%</TableCell>
                    <TableCell className="text-sm">
                      {p.due}
                      {p.daysOverdue > 0 && <div className="text-xs text-rose-600">{p.daysOverdue}d overdue</div>}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{lastFollow(p)?.at ?? "—"}</div>
                      <div className="text-muted-foreground">next {lastFollow(p)?.nextAt ?? p.nextActionDue}</div>
                    </TableCell>
                    <TableCell><Badge className={tone(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openPay(p.id)}>View Payment</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">Nothing in this tab.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden p-3 space-y-2">
            {list.map((p) => (
              <div key={p.id} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{p.id}</span>
                  <Badge className={tone(p.status)}>{p.status}</Badge>
                </div>
                <div className="text-sm">{p.owner} · {p.store}</div>
                <div className="text-xs text-muted-foreground">{p.purpose}</div>
                <div className="text-sm tabular-nums">
                  <span className="font-semibold">{received(p)}/{p.target} instalments · {progressPct(p)}% of target</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Due {p.due}{p.daysOverdue > 0 ? ` · ${p.daysOverdue}d overdue` : ""} · Last {lastFollow(p)?.at ?? "—"} · Next {lastFollow(p)?.nextAt ?? p.nextActionDue}
                </div>
                <Button size="sm" variant="outline" className="w-full mt-1" onClick={() => openPay(p.id)}>View Payment</Button>
              </div>
            ))}
            {list.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Nothing in this tab.</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Financial control</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground grid gap-1 md:grid-cols-2">
          <div>Banking passwords, OTPs, card details, CVV and UPI PINs are never stored; account and transaction references are masked.</div>
          <div>Only authorised Accounts users can verify; the Project Coordinator sees progress but cannot edit verification.</div>
          <div>Multiple payments sit as separate transactions under the same Payment Request ID — no new request is created here.</div>
          <div>Vyapar remains the official billing and accounting system; only references are held in the CRM.</div>
        </CardContent>
      </Card>

      {/* Detail drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
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
                  <F label="Franchise owner" v={`${open.owner} · ${open.phoneMasked}`} />
                  <F label="Project" v={`${open.projectId} · ${open.store}`} />
                  <F label="Project Coordinator" v={open.coordinator} />
                  <F label="Payment purpose" v={open.purpose} />
                  <F label="Collection progress" v={`${Math.round((received(open) / open.amount) * 100)}% of target`} />
                  <F label="Payment due date" v={open.due} />
                  <F label="Vyapar invoice" v={`${open.vyaparInvoice} · ${open.invoiceDate}`} />
                  <F label="Dispatch clearance required" v={open.clearanceRequired ? "Yes" : "No"} />
                  <F label="Next action" v={`${open.nextAction} (due ${open.nextActionDue})`} />
                  <F label="Planned launch" v={open.launchDate} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setReqOpen(true)}>Request Payment</Button>
                  <Button size="sm" variant="outline" onClick={() => setFollowOpen(true)}><PhoneCall className="h-4 w-4 mr-2" />Record Follow-up</Button>
                  <Button size="sm" variant="outline" onClick={() => setPayOpen(true)}>Record Payment Received</Button>
                </div>

                {/* Partial payment panel */}
                {received(open) > 0 && balance(open) > 0 && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs space-y-2">
                    <div className="font-medium text-amber-900">Partial payment</div>
                    <div className="grid grid-cols-2 gap-2">
                      <F label="Collection progress" v={`${Math.round((received(open) / open.amount) * 100)}% of target`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[11px]">Next payment due date</Label>
                        <Input className="h-8" value={ptNextDue} onChange={(e) => setPtNextDue(e.target.value)} placeholder="e.g. 8 Aug 2026" />
                      </div>
                      <div>
                        <Label className="text-[11px]">Dispatch allowed after partial payment</Label>
                        <Select value={ptDispatch} onValueChange={setPtDispatch}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent>
                        </Select>
                      </div>
                      {ptDispatch === "yes" && (
                        <div className="col-span-2">
                          <Label className="text-[11px]">Authorised approval (required)</Label>
                          <Input className="h-8" value={ptApproval} onChange={(e) => setPtApproval(e.target.value)} placeholder="e.g. COO Vikram Shah — approval note 22" />
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (ptDispatch === "yes" && !ptApproval.trim()) return toast.error("Authorised approval is required to allow dispatch on partial payment");
                        update(open.id, (p) => log({ ...p, status: "Partially Paid", nextPaymentDue: ptNextDue, dispatchOnPartial: ptDispatch === "yes", partialApproval: ptApproval }, `Partial payment updated — ${Math.round((received(p) / p.amount) * 100)}% collected, dispatch on partial: ${ptDispatch}`));
                        toast.success("Partial payment details saved");
                      }}
                    >
                      Mark Partially Paid
                    </Button>
                  </div>
                )}

                <Separator />
                <div>
                  <div className="font-medium mb-2">Transactions under this Payment Request ID</div>
                  <div className="space-y-2">
                    {open.txns.map((t) => (
                      <div key={t.id} className="rounded-md border p-2 text-xs grid grid-cols-2 gap-2">
                        <F label="Transaction" v={`${t.id} · ${t.date}`} />
                        <F label="Mode" v={t.mode} />
                        <F label="Bank / account" v={t.accountMasked} />
                        <F label="Transaction / UTR" v={t.refMasked} />
                        <F label="Proof" v={`${t.proof}${t.reviewed ? " (reviewed)" : " — not reviewed"}`} />
                        <F label="Vyapar receipt" v={t.receipt} />
                        <F label="Recorded by" v={t.recordedBy} />
                      </div>
                    ))}
                    {open.txns.length === 0 && <div className="text-xs text-muted-foreground">No payment recorded yet.</div>}
                  </div>
                </div>

                <Separator />
                <div>
                  <div className="font-medium mb-2">Verification checklist ({checkedCount}/{CHECKLIST.length})</div>
                  <div className="space-y-2">
                    {CHECKLIST.map((c) => (
                      <label key={c} className="flex items-start gap-2 text-xs">
                        <Checkbox checked={!!checks[c]} onCheckedChange={(v) => setChecks((p) => ({ ...p, [c]: !!v }))} />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" disabled={!checklistDone || received(open) === 0} onClick={() => setVerifyOpen(true)}>Verify Payment</Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}>Reject Verification</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info("Use the partial payment panel above to record balance and dispatch approval")}>Mark Partially Paid</Button>
                    <Button size="sm" variant="destructive" onClick={() => setDisputeOpen(true)}>Raise Payment Dispute</Button>
                  </div>
                  {!checklistDone && <p className="text-[11px] text-muted-foreground mt-1">Complete all ten checklist points to enable verification.</p>}
                </div>

                {open.verification && (
                  <div className="rounded-md border p-3 text-xs bg-emerald-50/60 space-y-1">
                    <div className="font-medium text-emerald-800">Verified</div>
                    <div>Verified by {open.verification.by} on {open.verification.at}</div>
                    <div>Vyapar receipt: {open.verification.receipt || "—"} · Dispatch clearance required: {open.verification.clearanceRequired ? "Yes" : "No"}</div>
                    {open.verification.note && <div>Note: {open.verification.note}</div>}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-1"
                      onClick={() =>
                        setConfirm({
                          title: "Reverse this verified payment?",
                          body: "Related dispatch clearance will be cancelled or suspended and the Logistics Executive and Project Coordinator will be alerted.",
                          onOk: () => {
                            update(open.id, (p) => log({ ...p, status: "Verification Pending", verification: undefined }, "Verified payment reversed — clearance suspended, Logistics and Coordinator alerted"));
                            toast.success("Verification reversed and Logistics alerted");
                          },
                        })
                      }
                    >
                      Reverse verification
                    </Button>
                  </div>
                )}

                {open.rejection && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs space-y-1 text-rose-800">
                    <div className="font-medium">Verification rejected — {open.rejection.reason}</div>
                    <div>Corrective information: {open.rejection.corrective}</div>
                    <div>Next action: {open.rejection.nextAction} · {open.rejection.owner} · due {open.rejection.due}</div>
                  </div>
                )}

                <Separator />
                <div>
                  <div className="font-medium mb-2">Follow-up history</div>
                  <div className="space-y-2">
                    {open.follows.map((f, i) => (
                      <div key={i} className="rounded-md border p-2 text-xs space-y-0.5">
                        <div className="font-medium">{f.at} · {f.method} · {f.outcome}</div>
                        <div>Contacted: {f.person}</div>
                        {f.promiseDate && <div>Payment promised by {f.promiseDate}</div>}
                        {f.comments && <div>Franchise: {f.comments}</div>}
                        {f.note && <div>Accounts note: {f.note}</div>}
                        <div className="text-muted-foreground">Next: {f.nextAction} on {f.nextAt}</div>
                      </div>
                    ))}
                    {open.follows.length === 0 && <div className="text-xs text-muted-foreground">No follow-up recorded yet.</div>}
                  </div>
                </div>

                <Separator />
                <div>
                  <div className="font-medium mb-2">Activity history</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {open.history.map((h, i) => (<div key={i}>• {h.at} — {h.by}: {h.action}</div>))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Request payment dialog */}
      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment request to franchise</DialogTitle>
            <DialogDescription>Communication is recorded as a placeholder — WhatsApp, email and SMS are not connected yet.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Request date</Label><Input value={rDate} onChange={(e) => setRDate(e.target.value)} placeholder="4 Aug 2026" /></div>
            <div><Label className="text-xs">Amount requested</Label><Input value={rAmount} onChange={(e) => setRAmount(e.target.value)} /></div>
            <div><Label className="text-xs">Due date</Label><Input value={rDue} onChange={(e) => setRDue(e.target.value)} /></div>
            <div><Label className="text-xs">Vyapar invoice number</Label><Input value={rInvoice} onChange={(e) => setRInvoice(e.target.value)} /></div>
            <div><Label className="text-xs">Invoice date</Label><Input value={rInvDate} onChange={(e) => setRInvDate(e.target.value)} /></div>
            <div><Label className="text-xs">Invoice amount</Label><Input value={rInvAmt} onChange={(e) => setRInvAmt(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Communication method</Label>
              <Select value={rMethod} onValueChange={setRMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Call", "WhatsApp", "Email", "SMS", "In-person discussion"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Next follow-up date and time</Label><Input value={rNext} onChange={(e) => setRNext(e.target.value)} placeholder="7 Aug 2026, 11:00" /></div>
            <div className="col-span-2"><Label className="text-xs">Payment instructions</Label><Textarea rows={2} value={rInstr} onChange={(e) => setRInstr(e.target.value)} placeholder="Bank details shared securely — never record OTPs, PINs or card numbers." /></div>
            <div className="col-span-2"><Label className="text-xs">Message or note</Label><Textarea rows={2} value={rMsg} onChange={(e) => setRMsg(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReqOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!open) return;
                if (!rAmount || !rDue) return toast.error("Amount and due date are required");
                update(open.id, (p) => log({
                  ...p, status: p.status === "Payment Requested" ? "Follow-up Scheduled" : p.status,
                  due: rDue, instructions: rInstr || p.instructions, vyaparInvoice: rInvoice || p.vyaparInvoice,
                  invoiceDate: rInvDate || p.invoiceDate, invoiceAmount: Number(rInvAmt) || p.invoiceAmount,
                  nextAction: "Follow up on payment request", nextActionDue: rNext || p.nextActionDue,
                }, `Payment requested via ${rMethod}${rMsg ? ` — ${rMsg}` : ""}`));
                toast.success("Payment request recorded");
                setReqOpen(false);
              }}
            >
              Save request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up dialog */}
      <Dialog open={followOpen} onOpenChange={setFollowOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record follow-up</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Follow-up date and time</Label><Input value={fuAt} onChange={(e) => setFuAt(e.target.value)} placeholder="4 Aug 2026, 15:30" /></div>
            <div><Label className="text-xs">Contacted person</Label><Input value={fuPerson} onChange={(e) => setFuPerson(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Communication method</Label>
              <Select value={fuMethod} onValueChange={setFuMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Call", "WhatsApp", "Email", "SMS", "In-person discussion"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Outcome</Label>
              <Select value={fuOutcome} onValueChange={(v) => setFuOutcome(v as (typeof OUTCOMES)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Promise-to-pay date</Label><Input value={fuPromiseDate} onChange={(e) => setFuPromiseDate(e.target.value)} /></div>
            <div><Label className="text-xs">Promised amount</Label><Input value={fuPromiseAmt} onChange={(e) => setFuPromiseAmt(e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Franchise comments</Label><Textarea rows={2} value={fuComments} onChange={(e) => setFuComments(e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Accounts Manager note</Label><Textarea rows={2} value={fuNote} onChange={(e) => setFuNote(e.target.value)} /></div>
            <div><Label className="text-xs">Next action</Label><Input value={fuNextAction} onChange={(e) => setFuNextAction(e.target.value)} /></div>
            <div><Label className="text-xs">Next follow-up date and time</Label><Input value={fuNextAt} onChange={(e) => setFuNextAt(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!open) return;
                if (!fuNextAction.trim() || !fuNextAt.trim()) return toast.error("Every active payment needs a next action and due date");
                const entry: FollowUp = {
                  at: fuAt || "4 Aug 2026", person: fuPerson || open.owner, method: fuMethod, outcome: fuOutcome,
                  promiseDate: fuPromiseDate || undefined, promiseAmount: fuPromiseAmt ? Number(fuPromiseAmt) : undefined,
                  comments: fuComments || undefined, note: fuNote || undefined,
                  nextAction: fuNextAction.trim(), nextAt: fuNextAt.trim(),
                };
                update(open.id, (p) => log({
                  ...p, follows: [...p.follows, entry],
                  status: fuOutcome === "Payment Disputed" ? "Disputed" : p.status === "Payment Requested" ? "Follow-up Scheduled" : p.status,
                  nextAction: entry.nextAction, nextActionDue: entry.nextAt,
                }, `Follow-up (${fuMethod}) — ${fuOutcome}`));
                toast.success("Follow-up recorded");
                setFollowOpen(false);
                setFuAt(""); setFuPromiseDate(""); setFuPromiseAmt(""); setFuComments(""); setFuNote(""); setFuNextAction(""); setFuNextAt("");
              }}
            >
              Save follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment received dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record payment received</DialogTitle>
            <DialogDescription>
              {open ? `${open.id} · ${open.owner} · ${Math.round((received(open) / open.amount) * 100)}% collected` : ""} — never enter passwords, OTPs, CVV or UPI PINs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Payment date</Label><Input value={pDate} onChange={(e) => setPDate(e.target.value)} placeholder="4 Aug 2026" /></div>
            <div><Label className="text-xs">Amount received</Label><Input value={pAmt} onChange={(e) => setPAmt(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Payment mode</Label>
              <Select value={pMode} onValueChange={(v) => setPMode(v as (typeof PAYMENT_MODES)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Bank or payment-account reference</Label><Input value={pAccount} onChange={(e) => setPAccount(e.target.value)} placeholder="HDFC ••••4417" /></div>
            <div><Label className="text-xs">Transaction or UTR number</Label><Input value={pRef} onChange={(e) => setPRef(e.target.value)} /></div>
            <div><Label className="text-xs">Payment proof (file name)</Label><Input value={pProof} onChange={(e) => setPProof(e.target.value)} placeholder="utr_proof.pdf" /></div>
            <div><Label className="text-xs">Vyapar receipt number</Label><Input value={pReceipt} onChange={(e) => setPReceipt(e.target.value)} /></div>
            <div><Label className="text-xs">Recorded by</Label><Input value={MANAGER} readOnly /></div>
            <label className="col-span-2 flex items-center gap-2 text-xs">
              <Checkbox checked={pOverride} onCheckedChange={(v) => setPOverride(!!v)} />
              Authorised review completed for a repeated transaction reference
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!open) return;
                const amt = Number(pAmt);
                if (!amt || amt <= 0) return toast.error("Enter a valid amount");
                if (!pRef.trim()) return toast.error("Transaction or UTR number is required");
                const masked = maskRef(pRef);
                const exists = pays.some((p) => p.txns.some((t) => t.refMasked === masked));
                if (exists && !pOverride) return toast.error("This transaction reference already exists — authorised review is required");
                const txn: Txn = {
                  id: `TXN-${8900 + open.txns.length + 1}`, date: pDate || "4 Aug 2026", amount: amt, mode: pMode,
                  accountMasked: pAccount || "Bank ••••0000", refMasked: masked, proof: pProof || "Not uploaded",
                  receipt: pReceipt || "—", recordedBy: MANAGER, reviewed: false,
                };
                update(open.id, (p) => {
                  const total = received(p) + amt;
                  return log({ ...p, txns: [...p.txns, txn], status: total >= p.amount ? "Verification Pending" : "Partially Paid", nextAction: total >= p.amount ? "Verify payment" : "Collect balance", nextActionDue: "Today" }, `Payment recorded (${pMode}, ref ${masked})`);
                });
                toast.success(`Payment recorded under ${open.id}`);
                setPayOpen(false);
                setPAmt(""); setPRef(""); setPProof(""); setPReceipt(""); setPAccount(""); setPDate(""); setPOverride(false);
              }}
            >
              Save payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify payment</DialogTitle>
            <DialogDescription>Verified machine or consumable payments become available in Dispatch Clearance.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Verified amount</Label><Input value={vAmount} onChange={(e) => setVAmount(e.target.value)} /></div>
            <div><Label className="text-xs">Verified by</Label><Input value={MANAGER} readOnly /></div>
            <div><Label className="text-xs">Vyapar receipt reference</Label><Input value={vReceipt} onChange={(e) => setVReceipt(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Dispatch clearance required</Label>
              <Select value={vClearance} onValueChange={setVClearance}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label className="text-xs">Verification note</Label><Textarea rows={2} value={vNote} onChange={(e) => setVNote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!open) return;
                const amt = Number(vAmount);
                if (!amt) return toast.error("Verified amount is required");
                const partial = amt < open.amount;
                if (partial && vClearance === "yes" && !open.partialApproval) {
                  return toast.error("Dispatch clearance on partial payment needs a recorded authorised approval");
                }
                update(open.id, (p) => log({
                  ...p,
                  status: vClearance === "yes" ? "Ready for Dispatch Clearance" : "Verified",
                  verification: { amount: amt, by: MANAGER, at: "4 Aug 2026, now", receipt: vReceipt, note: vNote, clearanceRequired: vClearance === "yes" },
                  txns: p.txns.map((t) => ({ ...t, reviewed: true })),
                  nextAction: vClearance === "yes" ? "Send dispatch clearance" : "Close payment",
                  nextActionDue: "Today",
                }, `Payment verified${vClearance === "yes" ? ", sent to Dispatch Clearance" : ""}`));
                toast.success(vClearance === "yes" ? "Verified — available in Dispatch Clearance" : "Payment verified");
                setVerifyOpen(false);
              }}
            >
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject verification</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label className="text-xs">Rejection reason</Label>
              <Select value={jReason} onValueChange={(v) => setJReason(v as (typeof REJECT_REASONS)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Corrective information required</Label><Textarea rows={2} value={jCorrective} onChange={(e) => setJCorrective(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Next action</Label><Input value={jNext} onChange={(e) => setJNext(e.target.value)} /></div>
              <div><Label className="text-xs">Responsible person</Label><Input value={jOwner} onChange={(e) => setJOwner(e.target.value)} /></div>
              <div><Label className="text-xs">Due date</Label><Input value={jDue} onChange={(e) => setJDue(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!open) return;
                if (!jCorrective.trim() || !jNext.trim() || !jOwner.trim() || !jDue.trim()) return toast.error("All rejection fields are required");
                update(open.id, (p) => log({
                  ...p, status: "Verification Rejected",
                  rejection: { reason: jReason, corrective: jCorrective.trim(), nextAction: jNext.trim(), owner: jOwner.trim(), due: jDue.trim() },
                  nextAction: jNext.trim(), nextActionDue: jDue.trim(),
                }, `Verification rejected — ${jReason}`));
                toast.success("Verification rejected");
                setRejectOpen(false);
                setJCorrective(""); setJNext(""); setJOwner(""); setJDue("");
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise payment dispute</DialogTitle>
            <DialogDescription>The dispute is recorded against the same Payment Request ID.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} value={dNote} onChange={(e) => setDNote(e.target.value)} placeholder="Describe the dispute and the escalation path" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!open) return;
                if (!dNote.trim()) return toast.error("A dispute note is required");
                update(open.id, (p) => log({ ...p, status: "Disputed", nextAction: "Resolve dispute with leadership", nextActionDue: "Today" }, `Payment dispute raised — ${dNote.trim()}`));
                toast.success("Dispute recorded");
                setDNote(""); setDisputeOpen(false);
              }}
            >
              Raise dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { confirm?.onOk(); setConfirm(null); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function F({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{v}</div>
    </div>
  );
}
