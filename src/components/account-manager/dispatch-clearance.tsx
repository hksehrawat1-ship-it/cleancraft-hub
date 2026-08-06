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
import { AlertTriangle, FileText, PackagePlus, Search, ShieldCheck, Truck } from "lucide-react";

const MANAGER = "Priya Nair";
const TODAY = "4 Aug 2026";

const ITEM_TYPES = [
  "Laundry Machine",
  "Dry-Cleaning Machine",
  "Finishing Equipment",
  "POS Equipment",
  "Spare Parts",
  "Chemicals",
  "Consumables",
  "Packaging Materials",
  "Other Approved Item",
] as const;
type ItemType = (typeof ITEM_TYPES)[number];

type ClrStatus =
  | "Clearance Ready"
  | "Clearance Sent to Logistics"
  | "Logistics Accepted"
  | "Dispatch Planned"
  | "Dispatched"
  | "Delivered"
  | "Closed"
  | "Information Required"
  | "Logistics Returned"
  | "Clearance Suspended"
  | "Clearance Cancelled";

type Line = { name: string; type: ItemType; qty: number; approvedQty: number };

type Clearance = {
  id: string;
  payId: string;
  projectId: string;
  store: string;
  owner: string;
  city: string;
  address: string;
  addressComplete: boolean;
  siteContact: string;
  coordinator: string;
  logisticsExec: string;
  lines: Line[];
  verifiedAmount: number;
  verificationDate: string;
  vyaparInvoice: string;
  vyaparReceipt: string;
  priority: "Urgent" | "High" | "Normal";
  requiredDelivery: string;
  launchDate: string;
  handling: string;
  notesForLogistics: string;
  status: ClrStatus;
  partialApproval?: string;
  itemAvailability?: "Confirmed" | "Partially Available" | "Unavailable";
  plannedDispatch?: string;
  packingTask?: string;
  tracking?: string;
  dispatchedOn?: string;
  deliveredOn?: string;
  deliveryProof?: string;
  paymentReversed?: boolean;
  packingStarted?: boolean;
  returnInfo?: { reason: string; detail: string; owner: string; nextAction: string; due: string };
  suspension?: { reason: string; note: string; at: string };
  history: { at: string; by: string; action: string }[];
};

type VerifiedPayment = {
  payId: string;
  projectId: string;
  store: string;
  owner: string;
  city: string;
  address: string;
  siteContact: string;
  coordinator: string;
  amount: number;
  verifiedOn: string;
  invoice: string;
  receipt: string;
  launchDate: string;
  partial?: boolean;
  partialApproval?: string;
  suggestedLines: Line[];
};

const VERIFIED_POOL: VerifiedPayment[] = [
  {
    payId: "PAY-3104", projectId: "PRJ-SUR-05", store: "Clean Craft Surat", owner: "Bhavesh Patel",
    city: "Surat", address: "Shop 4, Ring Road Commercial Complex, Surat, Gujarat 395002",
    siteContact: "Bhavesh Patel · +91 90XXXXXX66", coordinator: "Deepak Yadav",
    amount: 145000, verifiedOn: "30 Jul 2026", invoice: "VY-INV-2260", receipt: "RCP-1176",
    launchDate: "28 Aug 2026",
    suggestedLines: [
      { name: "Detergent concentrate 20L", type: "Chemicals", qty: 10, approvedQty: 10 },
      { name: "Poly covers (bundle of 500)", type: "Packaging Materials", qty: 6, approvedQty: 6 },
      { name: "Hangers (pack of 250)", type: "Consumables", qty: 6, approvedQty: 6 },
    ],
  },
  {
    payId: "PAY-3103", projectId: "PRJ-LKO-02", store: "Clean Craft Lucknow", owner: "Sunil Mishra",
    city: "Lucknow", address: "Plot 22, Gomti Nagar Extension, Lucknow, Uttar Pradesh 226010",
    siteContact: "Sunil Mishra · +91 99XXXXXX08", coordinator: "Rahul Sharma",
    amount: 520000, verifiedOn: "4 Aug 2026", invoice: "VY-INV-2277", receipt: "RCP-1201",
    launchDate: "16 Aug 2026",
    suggestedLines: [
      { name: "Washer extractor 15kg", type: "Laundry Machine", qty: 1, approvedQty: 1 },
      { name: "Tumble dryer 15kg", type: "Laundry Machine", qty: 1, approvedQty: 1 },
    ],
  },
  {
    payId: "PAY-3102", projectId: "PRJ-IND-03", store: "Clean Craft Indore", owner: "Meena Joshi",
    city: "Indore", address: "Unit 7, Vijay Nagar Square, Indore, Madhya Pradesh 452010",
    siteContact: "Meena Joshi · +91 97XXXXXX40", coordinator: "Anita Rao",
    amount: 300000, verifiedOn: "1 Aug 2026", invoice: "VY-INV-2291", receipt: "RCP-1188",
    launchDate: "12 Sep 2026", partial: true, partialApproval: "",
    suggestedLines: [{ name: "Steam finishing table", type: "Finishing Equipment", qty: 1, approvedQty: 1 }],
  },
];

const SEED: Clearance[] = [
  {
    id: "CLR-909", payId: "PAY-3108", projectId: "PRJ-RAI-02", store: "Clean Craft Raipur",
    owner: "Komal Sahu", city: "Raipur", address: "Shop 11, Telibandha Main Road, Raipur, Chhattisgarh 492006",
    addressComplete: true, siteContact: "Komal Sahu · +91 91XXXXXX55", coordinator: "Rahul Sharma",
    logisticsExec: "Imran Sheikh",
    lines: [
      { name: "Washer extractor 25kg", type: "Laundry Machine", qty: 1, approvedQty: 1 },
      { name: "Tumble dryer 20kg", type: "Laundry Machine", qty: 1, approvedQty: 1 },
      { name: "Steam boiler", type: "Finishing Equipment", qty: 1, approvedQty: 1 },
      { name: "Steam iron station", type: "Finishing Equipment", qty: 2, approvedQty: 2 },
    ],
    verifiedAmount: 690000, verificationDate: "27 Jul 2026", vyaparInvoice: "VY-INV-2231",
    vyaparReceipt: "RCP-1150", priority: "Urgent", requiredDelivery: "9 Aug 2026",
    launchDate: "20 Aug 2026", handling: "Fragile — boiler must travel upright",
    notesForLogistics: "Site lift available till 6 pm only.", status: "Clearance Sent to Logistics",
    history: [
      { at: "27 Jul 16:10", by: MANAGER, action: "Clearance created after payment verification" },
      { at: "28 Jul 10:00", by: MANAGER, action: "Clearance sent to Logistics (Imran Sheikh)" },
    ],
  },
  {
    id: "CLR-907", payId: "PAY-3099", projectId: "PRJ-AGR-01", store: "Clean Craft Agra",
    owner: "Deepa Chauhan", city: "Agra", address: "12/A Sanjay Place, Agra, Uttar Pradesh 282002",
    addressComplete: true, siteContact: "Deepa Chauhan · +91 97XXXXXX72", coordinator: "Deepak Yadav",
    logisticsExec: "Imran Sheikh",
    lines: [
      { name: "Dry-cleaning machine 12kg", type: "Dry-Cleaning Machine", qty: 1, approvedQty: 1 },
      { name: "POS terminal kit", type: "POS Equipment", qty: 1, approvedQty: 1 },
    ],
    verifiedAmount: 710000, verificationDate: "22 Jul 2026", vyaparInvoice: "VY-INV-2210",
    vyaparReceipt: "RCP-1122", priority: "High", requiredDelivery: "5 Aug 2026",
    launchDate: "14 Aug 2026", handling: "Unload with hydraulic pallet truck",
    notesForLogistics: "Coordinate with site engineer before arrival.", status: "Dispatched",
    itemAvailability: "Confirmed", plannedDispatch: "1 Aug 2026", packingTask: "PKG-441 · Packing Staff A",
    tracking: "TRK-AGR-77120 · Shree Roadlines", dispatchedOn: "2 Aug 2026",
    history: [
      { at: "22 Jul 17:00", by: MANAGER, action: "Clearance created" },
      { at: "23 Jul 09:20", by: "Imran Sheikh", action: "Clearance accepted" },
      { at: "24 Jul 11:00", by: "Imran Sheikh", action: "Item availability confirmed, dispatch planned 1 Aug" },
      { at: "2 Aug 08:40", by: "Imran Sheikh", action: "Dispatched with tracking TRK-AGR-77120" },
    ],
  },
  {
    id: "CLR-905", payId: "PAY-3090", projectId: "PRJ-JOD-02", store: "Clean Craft Jodhpur",
    owner: "Naveen Rathore", city: "Jodhpur", address: "Shop 3, Shastri Nagar, Jodhpur, Rajasthan 342003",
    addressComplete: true, siteContact: "Naveen Rathore · +91 94XXXXXX31", coordinator: "Neha Gupta",
    logisticsExec: "Farhan Qureshi",
    lines: [
      { name: "Consumables opening kit", type: "Consumables", qty: 1, approvedQty: 1 },
      { name: "Packaging rolls", type: "Packaging Materials", qty: 20, approvedQty: 20 },
    ],
    verifiedAmount: 132000, verificationDate: "12 Jul 2026", vyaparInvoice: "VY-INV-2188",
    vyaparReceipt: "RCP-1090", priority: "Normal", requiredDelivery: "22 Jul 2026",
    launchDate: "6 Aug 2026", handling: "Keep chemicals away from heat",
    notesForLogistics: "", status: "Delivered", itemAvailability: "Confirmed",
    plannedDispatch: "17 Jul 2026", packingTask: "PKG-430 · Packing Staff B",
    tracking: "TRK-JOD-55231", dispatchedOn: "18 Jul 2026", deliveredOn: "21 Jul 2026",
    deliveryProof: "pod_jodhpur_signed.pdf",
    history: [
      { at: "12 Jul 18:00", by: MANAGER, action: "Clearance created" },
      { at: "21 Jul 15:20", by: "Farhan Qureshi", action: "Delivered — POD uploaded" },
    ],
  },
  {
    id: "CLR-906", payId: "PAY-3095", projectId: "PRJ-PAT-03", store: "Clean Craft Patna",
    owner: "Ramesh Prasad", city: "Patna", address: "Near Boring Road crossing, Patna, Bihar",
    addressComplete: false, siteContact: "Site contact missing", coordinator: "Suresh Patel",
    logisticsExec: "Farhan Qureshi",
    lines: [{ name: "POS counter kit", type: "POS Equipment", qty: 1, approvedQty: 1 }],
    verifiedAmount: 52000, verificationDate: "19 Jul 2026", vyaparInvoice: "VY-INV-2199",
    vyaparReceipt: "RCP-1101", priority: "Normal", requiredDelivery: "28 Jul 2026",
    launchDate: "20 Aug 2026", handling: "", notesForLogistics: "",
    status: "Logistics Returned",
    returnInfo: {
      reason: "Address problem", detail: "Delivery address incomplete — need landmark and site contact",
      owner: "Suresh Patel (Project Coordinator)", nextAction: "Share complete address and contact", due: "5 Aug 2026",
    },
    history: [
      { at: "19 Jul 18:10", by: MANAGER, action: "Clearance created and sent" },
      { at: "20 Jul 10:30", by: "Farhan Qureshi", action: "Returned — address problem" },
    ],
  },
  {
    id: "CLR-904", payId: "PAY-3088", projectId: "PRJ-KOL-01", store: "Clean Craft Salt Lake",
    owner: "Arindam Bose", city: "Kolkata", address: "Sector V, Salt Lake, Kolkata, West Bengal 700091",
    addressComplete: true, siteContact: "Arindam Bose · +91 98XXXXXX19", coordinator: "Anita Rao",
    logisticsExec: "Imran Sheikh",
    lines: [{ name: "Washer extractor 20kg", type: "Laundry Machine", qty: 1, approvedQty: 1 }],
    verifiedAmount: 480000, verificationDate: "8 Jul 2026", vyaparInvoice: "VY-INV-2170",
    vyaparReceipt: "RCP-1076", priority: "High", requiredDelivery: "18 Jul 2026",
    launchDate: "12 Aug 2026", handling: "", notesForLogistics: "",
    status: "Clearance Suspended", paymentReversed: true, packingStarted: true,
    suspension: { reason: "Payment reversed", note: "Franchise bank reversed the RTGS on 26 Jul", at: "26 Jul 2026, 12:10" },
    history: [
      { at: "8 Jul 18:00", by: MANAGER, action: "Clearance created" },
      { at: "10 Jul 09:00", by: "Imran Sheikh", action: "Accepted, packing started" },
      { at: "26 Jul 12:10", by: MANAGER, action: "Payment reversed — clearance suspended, Logistics and Coordinator alerted" },
    ],
  },
  {
    id: "CLR-908", payId: "PAY-3101", projectId: "PRJ-JAI-07", store: "Clean Craft Jaipur",
    owner: "Rajesh Agarwal", city: "Jaipur", address: "Plot 88, Vaishali Nagar, Jaipur, Rajasthan 302021",
    addressComplete: true, siteContact: "Rajesh Agarwal · +91 98XXXXXX21", coordinator: "Rahul Sharma",
    logisticsExec: "Imran Sheikh",
    lines: [
      { name: "Washer extractor 25kg", type: "Laundry Machine", qty: 1, approvedQty: 1 },
      { name: "Tumble dryer 20kg", type: "Laundry Machine", qty: 1, approvedQty: 1 },
    ],
    verifiedAmount: 750000, verificationDate: "3 Aug 2026", vyaparInvoice: "VY-INV-2298",
    vyaparReceipt: "RCP-1210", priority: "Urgent", requiredDelivery: "10 Aug 2026",
    launchDate: "22 Aug 2026", handling: "Machine advance cleared — balance on delivery",
    notesForLogistics: "Launch is date-critical.", status: "Clearance Ready",
    history: [{ at: "3 Aug 17:30", by: MANAGER, action: "Clearance created after payment verification" }],
  },
  {
    id: "CLR-903", payId: "PAY-3080", projectId: "PRJ-NSK-01", store: "Clean Craft Nashik",
    owner: "Prakash Pawar", city: "Nashik", address: "College Road, Nashik, Maharashtra 422005",
    addressComplete: true, siteContact: "Prakash Pawar · +91 90XXXXXX07", coordinator: "Neha Gupta",
    logisticsExec: "Farhan Qureshi",
    lines: [{ name: "Spare motor assembly", type: "Spare Parts", qty: 2, approvedQty: 3 }],
    verifiedAmount: 38000, verificationDate: "28 Jul 2026", vyaparInvoice: "VY-INV-2255",
    vyaparReceipt: "RCP-1168", priority: "Normal", requiredDelivery: "8 Aug 2026",
    launchDate: "30 Aug 2026", handling: "", notesForLogistics: "",
    status: "Dispatch Planned", itemAvailability: "Partially Available", plannedDispatch: "7 Aug 2026",
    packingTask: "PKG-448 · Packing Staff C",
    history: [
      { at: "28 Jul 16:00", by: MANAGER, action: "Clearance created and sent" },
      { at: "29 Jul 10:00", by: "Farhan Qureshi", action: "Accepted — only 2 of 3 units available" },
    ],
  },
];

const CHECKLIST = [
  "Payment Request ID is correct",
  "Payment is verified",
  "Required amount has been received",
  "Vyapar invoice reference recorded",
  "Vyapar receipt reference recorded",
  "Item quantities match approved request",
  "Delivery address verified",
  "Partial-payment approval attached when applicable",
  "No payment reversal or dispute exists",
  "Authorised approval completed",
];

const RETURN_REASONS = [
  "Missing information",
  "Item availability issue",
  "Address problem",
  "Quantity mismatch",
  "Other reason",
] as const;

const SUSPEND_REASONS = [
  "Payment reversed",
  "Payment disputed",
  "Verification error found",
  "Order changed",
  "Project paused",
  "Authorised management instruction received",
] as const;

const TABS = [
  "Ready for Clearance",
  "Sent to Logistics",
  "Accepted",
  "Dispatch Planned",
  "Dispatched",
  "Delivered",
  "Returned or Suspended",
  "All",
] as const;
type TabKey = (typeof TABS)[number];

const tone = (s: ClrStatus) => {
  if (["Clearance Suspended", "Logistics Returned"].includes(s)) return "bg-rose-100 text-rose-700";
  if (s === "Clearance Cancelled") return "bg-muted text-muted-foreground";
  if (["Logistics Accepted", "Delivered", "Closed", "Clearance Ready"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["Dispatch Planned", "Dispatched", "Clearance Sent to Logistics"].includes(s)) return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
};

const prioTone = (p: Clearance["priority"]) =>
  p === "Urgent" ? "bg-rose-100 text-rose-700" : p === "High" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground";

export function AmDispatchClearance() {
  const [clrs, setClrs] = useState<Clearance[]>(SEED);
  const [tab, setTab] = useState<TabKey>("Ready for Clearance");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);

  // filters
  const [fProject, setFProject] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [fItem, setFItem] = useState("all");
  const [fCoord, setFCoord] = useState("all");
  const [fLog, setFLog] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fPrio, setFPrio] = useState("all");
  const [fLaunch, setFLaunch] = useState("");

  // create form
  const [cPay, setCPay] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cContact, setCContact] = useState("");
  const [cPriority, setCPriority] = useState<Clearance["priority"]>("High");
  const [cRequired, setCRequired] = useState("");
  const [cHandling, setCHandling] = useState("");
  const [cExec, setCExec] = useState("Imran Sheikh");
  const [cApproval, setCApproval] = useState("");
  const [cNotes, setCNotes] = useState("");

  // logistics simulation
  const [lPlanned, setLPlanned] = useState("");
  const [lPacking, setLPacking] = useState("");
  const [lTracking, setLTracking] = useState("");

  // return form
  const [rReason, setRReason] = useState<(typeof RETURN_REASONS)[number]>("Missing information");
  const [rDetail, setRDetail] = useState("");
  const [rOwner, setROwner] = useState("");
  const [rNext, setRNext] = useState("");
  const [rDue, setRDue] = useState("");

  // suspend form
  const [sReason, setSReason] = useState<(typeof SUSPEND_REASONS)[number]>("Payment reversed");
  const [sNote, setSNote] = useState("");

  // delivery
  const [dProof, setDProof] = useState("");

  const open = clrs.find((c) => c.id === openId) ?? null;
  const uniq = (fn: (c: Clearance) => string) => Array.from(new Set(clrs.map(fn)));
  const update = (id: string, fn: (c: Clearance) => Clearance) => setClrs((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  const log = (c: Clearance, action: string, by = MANAGER): Clearance => ({ ...c, history: [...c.history, { at: "Now", by, action }] });

  const pendingVerified = VERIFIED_POOL.filter((v) => !clrs.some((c) => c.payId === v.payId));
  const selectedPay = pendingVerified.find((v) => v.payId === cPay) ?? null;

  const kpi = {
    ready: clrs.filter((c) => c.status === "Clearance Ready").length + pendingVerified.length,
    awaiting: clrs.filter((c) => c.status === "Clearance Sent to Logistics").length,
    planning: clrs.filter((c) => ["Logistics Accepted", "Dispatch Planned"].includes(c.status)).length,
    dispatched: clrs.filter((c) => c.status === "Dispatched").length,
    delivered: clrs.filter((c) => ["Delivered", "Closed"].includes(c.status)).length,
    suspended: clrs.filter((c) => c.status === "Clearance Suspended").length,
  };

  const alerts = useMemo(() => [
    ...pendingVerified.map((v) => ({ level: "amber", t: `${v.payId} — Verified payment awaiting clearance (${v.store})` })),
    ...clrs.filter((c) => c.status === "Clearance Sent to Logistics").map((c) => ({ level: "amber", t: `${c.id} — Clearance not accepted by Logistics (${c.logisticsExec})` })),
    ...clrs.filter((c) => ["Clearance Ready", "Clearance Sent to Logistics", "Logistics Accepted"].includes(c.status)).map((c) => ({ level: "amber", t: `${c.id} — Launch date approaching (${c.launchDate})` })),
    ...clrs.filter((c) => c.itemAvailability === "Unavailable" || c.itemAvailability === "Partially Available").map((c) => ({ level: "red", t: `${c.id} — Item unavailable or short (${c.itemAvailability})` })),
    ...clrs.filter((c) => !c.addressComplete).map((c) => ({ level: "red", t: `${c.id} — Delivery address incomplete` })),
    ...clrs.filter((c) => c.lines.some((l) => l.qty !== l.approvedQty)).map((c) => ({ level: "red", t: `${c.id} — Quantity mismatch against approved request` })),
    ...clrs.filter((c) => c.status === "Dispatch Planned" && c.plannedDispatch && c.plannedDispatch < TODAY).map((c) => ({ level: "amber", t: `${c.id} — Dispatch delayed past ${c.plannedDispatch}` })),
    ...clrs.filter((c) => c.paymentReversed).map((c) => ({ level: "red", t: `${c.id} — Payment reversed after clearance` })),
    ...clrs.filter((c) => c.status === "Clearance Suspended" && c.packingStarted).map((c) => ({ level: "red", t: `${c.id} — Clearance suspended after packing had started` })),
    ...clrs.filter((c) => c.status === "Dispatched" && !c.deliveredOn).map((c) => ({ level: "amber", t: `${c.id} — Delivery not confirmed yet` })),
  ], [clrs, pendingVerified]);

  const inTab = (c: Clearance) => {
    switch (tab) {
      case "Ready for Clearance": return c.status === "Clearance Ready" || c.status === "Information Required";
      case "Sent to Logistics": return c.status === "Clearance Sent to Logistics";
      case "Accepted": return c.status === "Logistics Accepted";
      case "Dispatch Planned": return c.status === "Dispatch Planned";
      case "Dispatched": return c.status === "Dispatched";
      case "Delivered": return ["Delivered", "Closed"].includes(c.status);
      case "Returned or Suspended": return ["Logistics Returned", "Clearance Suspended", "Clearance Cancelled"].includes(c.status);
      default: return true;
    }
  };

  const list = clrs.filter(inTab).filter((c) => {
    if (q && !`${c.id} ${c.payId} ${c.projectId} ${c.store} ${c.owner} ${c.city}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (fProject !== "all" && c.projectId !== fProject) return false;
    if (fOwner !== "all" && c.owner !== fOwner) return false;
    if (fCity !== "all" && c.city !== fCity) return false;
    if (fItem !== "all" && !c.lines.some((l) => l.type === fItem)) return false;
    if (fCoord !== "all" && c.coordinator !== fCoord) return false;
    if (fLog !== "all" && c.logisticsExec !== fLog) return false;
    if (fStatus !== "all" && c.status !== fStatus) return false;
    if (fPrio !== "all" && c.priority !== fPrio) return false;
    if (fLaunch && !c.launchDate.toLowerCase().includes(fLaunch.toLowerCase())) return false;
    return true;
  });

  const checkedCount = CHECKLIST.filter((c) => checks[c]).length;
  const checklistDone = checkedCount === CHECKLIST.length;

  const openClr = (id: string) => {
    setOpenId(id);
    setChecks({});
    const c = clrs.find((x) => x.id === id);
    if (c) { setLPlanned(c.plannedDispatch ?? ""); setLPacking(c.packingTask ?? ""); setLTracking(c.tracking ?? ""); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead title="Dispatch Clearance" sub="Financial clearance issued to Logistics after machine or consumable payments are verified" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-full sm:w-64" placeholder="Search clearance, payment, project or store" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <PackagePlus className="h-4 w-4 mr-2" /> Create Clearance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Ready for Clearance" value={String(kpi.ready)} tone="warn" />
        <StatCard label="Awaiting Logistics Acceptance" value={String(kpi.awaiting)} tone="warn" />
        <StatCard label="Dispatch Planning" value={String(kpi.planning)} />
        <StatCard label="Dispatched" value={String(kpi.dispatched)} />
        <StatCard label="Delivered" value={String(kpi.delivered)} tone="good" />
        <StatCard label="Clearance Suspended" value={String(kpi.suspended)} tone="bad" />
      </div>

      {pendingVerified.length > 0 && (
        <Card className="border-emerald-300/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verified payments waiting for clearance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-3">
            {pendingVerified.map((v) => (
              <div key={v.payId} className="rounded-md border p-3 text-xs space-y-1">
                <div className="font-medium text-sm">{v.payId} · {v.store}</div>
                <div className="text-muted-foreground">{v.projectId} · verified {v.verifiedOn}</div>
                {v.partial && <Badge className="bg-amber-100 text-amber-700">Partial payment — approval needed</Badge>}
                <Button size="sm" variant="outline" className="w-full mt-1" onClick={() => { setCPay(v.payId); setCAddress(v.address); setCContact(v.siteContact); setCreateOpen(true); }}>
                  Create clearance
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
          {TABS.map((t) => <TabsTrigger key={t} value={t} className="text-xs">{t}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <FilterSelect label="Franchise project" value={fProject} onChange={setFProject} options={uniq((c) => c.projectId)} />
          <FilterSelect label="Franchise owner" value={fOwner} onChange={setFOwner} options={uniq((c) => c.owner)} />
          <FilterSelect label="Store city" value={fCity} onChange={setFCity} options={uniq((c) => c.city)} />
          <FilterSelect label="Item type" value={fItem} onChange={setFItem} options={ITEM_TYPES as unknown as string[]} />
          <FilterSelect label="Project Coordinator" value={fCoord} onChange={setFCoord} options={uniq((c) => c.coordinator)} />
          <FilterSelect label="Logistics Executive" value={fLog} onChange={setFLog} options={uniq((c) => c.logisticsExec)} />
          <FilterSelect label="Clearance status" value={fStatus} onChange={setFStatus} options={uniq((c) => c.status)} />
          <FilterSelect label="Dispatch priority" value={fPrio} onChange={setFPrio} options={["Urgent", "High", "Normal"]} />
          <div>
            <Label className="text-[11px] text-muted-foreground">Planned launch date</Label>
            <Input className="h-9" placeholder="e.g. Aug" value={fLaunch} onChange={(e) => setFLaunch(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setFProject("all"); setFOwner("all"); setFCity("all"); setFItem("all"); setFCoord("all"); setFLog("all"); setFStatus("all"); setFPrio("all"); setFLaunch(""); }}>Clear filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clearance</TableHead>
                  <TableHead>Payment / project</TableHead>
                  <TableHead>Franchise / city</TableHead>
                  <TableHead>Items cleared</TableHead>
                  <TableHead>Verified on</TableHead>
                  <TableHead>Launch</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Logistics status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id} className={["Clearance Suspended", "Logistics Returned"].includes(c.status) ? "bg-rose-50/50" : undefined}>
                    <TableCell className="font-medium">{c.id}</TableCell>
                    <TableCell className="text-xs">{c.payId}<div className="text-muted-foreground">{c.projectId}</div></TableCell>
                    <TableCell className="text-sm">{c.store}<div className="text-xs text-muted-foreground">{c.owner} · {c.city}</div></TableCell>
                    <TableCell className="text-xs max-w-[220px]">{c.lines.map((l) => `${l.name} ×${l.qty}`).join(", ")}</TableCell>
                    <TableCell className="text-sm">{c.verificationDate}</TableCell>
                    <TableCell className="text-sm">{c.launchDate}</TableCell>
                    <TableCell><Badge className={prioTone(c.priority)}>{c.priority}</Badge></TableCell>
                    <TableCell><Badge className={tone(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => openClr(c.id)}>View Clearance</Button></TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">Nothing in this tab.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden p-3 space-y-2">
            {list.map((c) => (
              <div key={c.id} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{c.id}</span>
                  <Badge className={tone(c.status)}>{c.status}</Badge>
                </div>
                <div className="text-sm">{c.store} · {c.city}</div>
                <div className="text-xs text-muted-foreground">{c.payId} · {c.projectId} · {c.owner}</div>
                <div className="text-xs">{c.lines.map((l) => `${l.name} ×${l.qty}`).join(", ")}</div>
                <div className="text-sm font-medium">Verified {c.verificationDate}</div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Badge className={prioTone(c.priority)}>{c.priority}</Badge>
                  <Button size="sm" variant="outline" onClick={() => openClr(c.id)}>View Clearance</Button>
                </div>
                <div className="text-[11px] text-muted-foreground">Launch {c.launchDate} · Logistics {c.logisticsExec}</div>
              </div>
            ))}
            {list.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Nothing in this tab.</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Permissions and security</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground grid gap-1 md:grid-cols-2">
          <div>Accounts Manager creates, sends, suspends and cancels financial clearance.</div>
          <div>Logistics Executive accepts and manages dispatch execution; Accounts sees updates but cannot edit them.</div>
          <div>Packing Staff see only approved packing instructions and item details.</div>
          <div>Bank details, full transaction references and financial documents are never exposed to Logistics or Packing Staff.</div>
        </CardContent>
      </Card>

      {/* Clearance drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  {open.id} · {open.store}
                  <Badge className={tone(open.status)}>{open.status}</Badge>
                  <Badge className={prioTone(open.priority)}>{open.priority}</Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4 text-sm">
                {open.suspension && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <div className="font-medium">Clearance suspended — {open.suspension.reason}</div>
                    <div>{open.suspension.note}</div>
                    <div>Logistics Executive and Project Coordinator alerted at {open.suspension.at}</div>
                  </div>
                )}
                {open.returnInfo && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <div className="font-medium">Returned by Logistics — {open.returnInfo.reason}</div>
                    <div>{open.returnInfo.detail}</div>
                    <div>{open.returnInfo.owner} · {open.returnInfo.nextAction} · due {open.returnInfo.due}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <F label="Payment Request ID" v={open.payId} />
                  <F label="Project ID" v={open.projectId} />
                  <F label="Franchise owner" v={open.owner} />
                  <F label="Store city" v={open.city} />
                  <F label="Delivery address" v={open.address} />
                  <F label="Site contact" v={open.siteContact} />
                  <F label="Verification date" v={open.verificationDate} />
                  <F label="Vyapar invoice / receipt" v={`${open.vyaparInvoice} · ${open.vyaparReceipt}`} />
                  <F label="Required delivery date" v={open.requiredDelivery} />
                  <F label="Planned launch date" v={open.launchDate} />
                  <F label="Project Coordinator" v={open.coordinator} />
                  <F label="Logistics Executive" v={open.logisticsExec} />
                  <F label="Special handling" v={open.handling || "—"} />
                  {open.partialApproval && <F label="Partial-payment approval" v={open.partialApproval} />}
                </div>

                <div>
                  <div className="font-medium mb-2">Cleared items</div>
                  <div className="rounded-md border divide-y text-xs">
                    {open.lines.map((l, i) => (
                      <div key={i} className="p-2 flex items-center justify-between gap-2">
                        <span>{l.name} <span className="text-muted-foreground">· {l.type}</span></span>
                        <span className={l.qty !== l.approvedQty ? "text-rose-700 font-medium" : ""}>
                          Qty {l.qty} / approved {l.approvedQty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                <div>
                  <div className="font-medium mb-2">Financial clearance checklist ({checkedCount}/{CHECKLIST.length})</div>
                  <div className="space-y-2">
                    {CHECKLIST.map((c) => (
                      <label key={c} className="flex items-start gap-2 text-xs">
                        <Checkbox checked={!!checks[c]} onCheckedChange={(v) => setChecks((p) => ({ ...p, [c]: !!v }))} />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={!checklistDone || open.status !== "Clearance Ready"}
                    onClick={() => {
                      update(open.id, (c) => log({ ...c, status: "Clearance Sent to Logistics" }, `Clearance sent to Logistics (${c.logisticsExec}) — notification raised`));
                      toast.success(`${open.id} sent to ${open.logisticsExec}`);
                    }}
                  >
                    Send Clearance
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDocOpen(true)}><FileText className="h-4 w-4 mr-2" />Clearance document</Button>
                  <Button size="sm" variant="destructive" disabled={["Clearance Suspended", "Clearance Cancelled"].includes(open.status)} onClick={() => setSuspendOpen(true)}>Suspend Clearance</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={["Dispatched", "Delivered", "Closed"].includes(open.status)}
                    onClick={() => {
                      update(open.id, (c) => log({ ...c, status: "Clearance Cancelled" }, "Clearance cancelled with authorisation — history preserved"));
                      toast.success("Clearance cancelled");
                    }}
                  >
                    Cancel Clearance
                  </Button>
                  {open.status === "Delivered" && (
                    <Button size="sm" variant="outline" onClick={() => { update(open.id, (c) => log({ ...c, status: "Closed" }, "Clearance closed — payment, packing, dispatch and delivery history preserved")); toast.success("Clearance closed"); }}>
                      Close Clearance
                    </Button>
                  )}
                </div>
                {!checklistDone && open.status === "Clearance Ready" && (
                  <p className="text-[11px] text-muted-foreground">All ten checklist conditions must be confirmed before clearance can be sent.</p>
                )}

                <Separator />
                <div className="rounded-md border p-3 space-y-3">
                  <div className="font-medium text-sm">Logistics execution (read-only for Accounts)</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <F label="Item availability" v={open.itemAvailability ?? "Not confirmed"} />
                    <F label="Planned dispatch" v={open.plannedDispatch ?? "—"} />
                    <F label="Packing task" v={open.packingTask ?? "Not assigned"} />
                    <F label="Tracking" v={open.tracking ?? "—"} />
                    <F label="Dispatched on" v={open.dispatchedOn ?? "—"} />
                    <F label="Delivered on" v={open.deliveredOn ?? "—"} />
                    <F label="Delivery proof" v={open.deliveryProof ?? "Not uploaded"} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Simulated Logistics Executive actions — in the live workspace these are performed by {open.logisticsExec}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={open.status !== "Clearance Sent to Logistics"} onClick={() => { update(open.id, (c) => log({ ...c, status: "Logistics Accepted" }, "Clearance accepted", c.logisticsExec)); toast.success("Logistics accepted the clearance"); }}>Accept Clearance</Button>
                    <Button size="sm" variant="outline" disabled={!["Clearance Sent to Logistics", "Logistics Accepted"].includes(open.status)} onClick={() => setReturnOpen(true)}>Return for Clarification</Button>
                    <Button size="sm" variant="outline" disabled={open.status !== "Logistics Accepted"} onClick={() => { update(open.id, (c) => log({ ...c, itemAvailability: "Confirmed" }, "Item availability confirmed", c.logisticsExec)); toast.success("Item availability confirmed"); }}>Confirm Item Availability</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px]">Planned dispatch date</Label>
                      <Input className="h-8" value={lPlanned} onChange={(e) => setLPlanned(e.target.value)} placeholder="7 Aug 2026" />
                    </div>
                    <div>
                      <Label className="text-[11px]">Packing task</Label>
                      <Input className="h-8" value={lPacking} onChange={(e) => setLPacking(e.target.value)} placeholder="PKG-450 · Packing Staff A" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[11px]">Tracking details</Label>
                      <Input className="h-8" value={lTracking} onChange={(e) => setLTracking(e.target.value)} placeholder="TRK-… · transporter" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={open.status !== "Logistics Accepted" || !lPlanned}
                      onClick={() => { update(open.id, (c) => log({ ...c, status: "Dispatch Planned", plannedDispatch: lPlanned }, `Planned dispatch date set to ${lPlanned}`, c.logisticsExec)); toast.success("Dispatch planned"); }}>
                      Add Planned Dispatch Date
                    </Button>
                    <Button size="sm" variant="outline" disabled={!lPacking || !["Logistics Accepted", "Dispatch Planned"].includes(open.status)}
                      onClick={() => { update(open.id, (c) => log({ ...c, packingTask: lPacking, packingStarted: true }, `Packing task assigned: ${lPacking}`, c.logisticsExec)); toast.success("Packing task assigned"); }}>
                      Assign Packing Task
                    </Button>
                    <Button size="sm" variant="outline" disabled={open.status !== "Dispatch Planned"}
                      onClick={() => { update(open.id, (c) => log({ ...c, status: "Dispatched", dispatchedOn: TODAY, tracking: lTracking || c.tracking }, `Dispatched${lTracking ? ` · ${lTracking}` : ""}`, c.logisticsExec)); toast.success("Dispatch recorded"); }}>
                      Record Dispatch
                    </Button>
                    <Button size="sm" variant="outline" disabled={!lTracking || open.status !== "Dispatched"}
                      onClick={() => { update(open.id, (c) => log({ ...c, tracking: lTracking }, `Tracking details added: ${lTracking}`, c.logisticsExec)); toast.success("Tracking added"); }}>
                      Add Tracking Details
                    </Button>
                    <Button size="sm" variant="outline" disabled={open.status !== "Dispatched"} onClick={() => setDeliverOpen(true)}>Mark Delivered</Button>
                  </div>
                </div>

                <Separator />
                <div>
                  <div className="font-medium mb-2">Clearance history</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {open.history.map((h, i) => (<div key={i}>• {h.at} — {h.by}: {h.action}</div>))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create clearance */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create dispatch clearance</DialogTitle>
            <DialogDescription>Only verified payment requests that need dispatch can be cleared.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Verified Payment Request</Label>
              <Select value={cPay} onValueChange={(v) => { setCPay(v); const p = pendingVerified.find((x) => x.payId === v); if (p) { setCAddress(p.address); setCContact(p.siteContact); } }}>
                <SelectTrigger><SelectValue placeholder="Select verified payment" /></SelectTrigger>
                <SelectContent>
                  {pendingVerified.map((v) => (
                    <SelectItem key={v.payId} value={v.payId}>{v.payId} · {v.store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPay && (
              <>
                <F label="Project ID" v={selectedPay.projectId} />
                <F label="Franchise / store" v={`${selectedPay.store} · ${selectedPay.owner}`} />
                <F label="Vyapar invoice / receipt" v={`${selectedPay.invoice} · ${selectedPay.receipt}`} />
                <div className="col-span-2">
                  <Label className="text-xs">Item list and approved quantities</Label>
                  <div className="rounded-md border divide-y text-xs mt-1">
                    {selectedPay.suggestedLines.map((l, i) => (
                      <div key={i} className="p-2 flex items-center justify-between">
                        <span>{l.name} <span className="text-muted-foreground">· {l.type}</span></span>
                        <span>Qty {l.qty} / approved {l.approvedQty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="col-span-2"><Label className="text-xs">Delivery address</Label><Textarea rows={2} value={cAddress} onChange={(e) => setCAddress(e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Site contact</Label><Input value={cContact} onChange={(e) => setCContact(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Dispatch priority</Label>
              <Select value={cPriority} onValueChange={(v) => setCPriority(v as Clearance["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Urgent", "High", "Normal"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Required delivery date</Label><Input value={cRequired} onChange={(e) => setCRequired(e.target.value)} placeholder="12 Aug 2026" /></div>
            <div>
              <Label className="text-xs">Assigned Logistics Executive</Label>
              <Select value={cExec} onValueChange={setCExec}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Imran Sheikh", "Farhan Qureshi", "Nikita Rane"].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {selectedPay?.partial && (
              <div className="col-span-2">
                <Label className="text-xs">Authorised approval for partial-payment clearance (required)</Label>
                <Input value={cApproval} onChange={(e) => setCApproval(e.target.value)} placeholder="e.g. COO Vikram Shah — approval note 31" />
              </div>
            )}
            <div className="col-span-2"><Label className="text-xs">Special handling instructions</Label><Textarea rows={2} value={cHandling} onChange={(e) => setCHandling(e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Notes for Logistics</Label><Textarea rows={2} value={cNotes} onChange={(e) => setCNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!selectedPay) return toast.error("Select a verified payment request");
                if (clrs.some((c) => c.payId === selectedPay.payId)) return toast.error("A clearance already exists for this Payment Request ID");
                if (!cAddress.trim() || !cContact.trim() || !cRequired.trim()) return toast.error("Delivery address, site contact and required delivery date are mandatory");
                if (selectedPay.partial && !cApproval.trim()) return toast.error("Partial-payment clearance needs an authorised approval");
                const id = `CLR-${910 + clrs.length}`;
                setClrs((cs) => [
                  {
                    id, payId: selectedPay.payId, projectId: selectedPay.projectId, store: selectedPay.store,
                    owner: selectedPay.owner, city: selectedPay.city, address: cAddress.trim(), addressComplete: true,
                    siteContact: cContact.trim(), coordinator: selectedPay.coordinator, logisticsExec: cExec,
                    lines: selectedPay.suggestedLines, verifiedAmount: selectedPay.amount,
                    verificationDate: selectedPay.verifiedOn, vyaparInvoice: selectedPay.invoice,
                    vyaparReceipt: selectedPay.receipt, priority: cPriority, requiredDelivery: cRequired.trim(),
                    launchDate: selectedPay.launchDate, handling: cHandling.trim(),
                    notesForLogistics: cNotes.trim(), status: "Clearance Ready",
                    partialApproval: selectedPay.partial ? cApproval.trim() : undefined,
                    history: [{ at: "Now", by: MANAGER, action: `Clearance created from verified payment ${selectedPay.payId}` }],
                  },
                  ...cs,
                ]);
                toast.success(`${id} created — complete the checklist to send it`);
                setCreateOpen(false); setCPay(""); setCAddress(""); setCContact(""); setCRequired(""); setCHandling(""); setCNotes(""); setCApproval("");
                setTab("Ready for Clearance");
              }}
            >
              Create clearance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clearance document */}
      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clearance document</DialogTitle>
            <DialogDescription>Shared with Logistics and Packing — no bank or transaction details are included.</DialogDescription>
          </DialogHeader>
          {open && (
            <div className="text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <F label="Clearance ID" v={open.id} />
                <F label="Payment Request ID" v={open.payId} />
                <F label="Project ID" v={open.projectId} />
                <F label="Franchise" v={`${open.store} · ${open.owner}`} />
                <F label="Delivery address" v={open.address} />
                <F label="Site contact" v={open.siteContact} />
                <F label="Financial clearance status" v={["Clearance Ready", "Clearance Sent to Logistics", "Logistics Accepted", "Dispatch Planned", "Dispatched", "Delivered", "Closed"].includes(open.status) ? "Cleared — payment verified" : open.status} />
                <F label="Required delivery date" v={open.requiredDelivery} />
                <F label="Accounts Manager" v={MANAGER} />
                <F label="Verification date and time" v={`${open.verificationDate}, 17:00`} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Cleared items and quantities</div>
                <div className="rounded-md border divide-y mt-1">
                  {open.lines.map((l, i) => (
                    <div key={i} className="p-2 flex justify-between"><span>{l.name} · {l.type}</span><span>Qty {l.qty}</span></div>
                  ))}
                </div>
              </div>
              <F label="Notes for Logistics" v={open.notesForLogistics || open.handling || "—"} />
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-800">
                Packing Staff view shows only item names, quantities and handling instructions.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logistics return */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Return clearance for clarification</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label className="text-xs">Return reason</Label>
              <Select value={rReason} onValueChange={(v) => setRReason(v as (typeof RETURN_REASONS)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RETURN_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Details</Label><Textarea rows={2} value={rDetail} onChange={(e) => setRDetail(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Responsible person</Label><Input value={rOwner} onChange={(e) => setROwner(e.target.value)} /></div>
              <div><Label className="text-xs">Next action</Label><Input value={rNext} onChange={(e) => setRNext(e.target.value)} /></div>
              <div><Label className="text-xs">Due date</Label><Input value={rDue} onChange={(e) => setRDue(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!open) return;
                if (!rDetail.trim() || !rOwner.trim() || !rNext.trim() || !rDue.trim()) return toast.error("All return fields are required");
                update(open.id, (c) => log({ ...c, status: "Logistics Returned", returnInfo: { reason: rReason, detail: rDetail.trim(), owner: rOwner.trim(), nextAction: rNext.trim(), due: rDue.trim() } }, `Clearance returned — ${rReason}`, c.logisticsExec));
                toast.success("Clearance returned to Accounts");
                setRDetail(""); setROwner(""); setRNext(""); setRDue(""); setReturnOpen(false);
              }}
            >
              Return clearance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend clearance</DialogTitle>
            <DialogDescription>The Logistics Executive and Project Coordinator are alerted immediately.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label className="text-xs">Reason</Label>
              <Select value={sReason} onValueChange={(v) => setSReason(v as (typeof SUSPEND_REASONS)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SUSPEND_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Supporting note</Label><Textarea rows={2} value={sNote} onChange={(e) => setSNote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!open) return;
                if (!sNote.trim()) return toast.error("A supporting note is required");
                update(open.id, (c) => log({
                  ...c, status: "Clearance Suspended",
                  paymentReversed: sReason === "Payment reversed" ? true : c.paymentReversed,
                  suspension: { reason: sReason, note: sNote.trim(), at: `${TODAY}, now` },
                }, `Clearance suspended — ${sReason}; Logistics and Project Coordinator alerted`));
                toast.success("Clearance suspended and stakeholders alerted");
                setSNote(""); setSuspendOpen(false);
              }}
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivered */}
      <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark delivered</DialogTitle>
            <DialogDescription>Delivery proof or an authorised confirmation is mandatory.</DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-xs">Delivery proof / authorised confirmation</Label>
            <Input value={dProof} onChange={(e) => setDProof(e.target.value)} placeholder="pod_signed.pdf or COO confirmation note" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliverOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!open) return;
                if (!dProof.trim()) return toast.error("Delivery proof or authorised confirmation is required");
                update(open.id, (c) => log({ ...c, status: "Delivered", deliveredOn: TODAY, deliveryProof: dProof.trim() }, `Delivered — proof: ${dProof.trim()}`, c.logisticsExec));
                toast.success("Delivery recorded");
                setDProof(""); setDeliverOpen(false);
              }}
            >
              <Truck className="h-4 w-4 mr-2" /> Mark delivered
            </Button>
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
