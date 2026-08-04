import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  CheckCircle2,
  Clock,
  Search,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import { SectionHead, StatCard } from "@/components/smm/ui";

/* --------------------------------- types --------------------------------- */

export const SETUP_FLOW = [
  "Setup Requested",
  "Information Pending",
  "Setup Started",
  "Configuration Completed",
  "Testing",
  "Training Ready",
  "Launch Ready",
  "Handover Completed",
] as const;

export const SETUP_ALT = ["Blocked", "Correction Required", "Cancelled"] as const;

type SetupStatus = (typeof SETUP_FLOW)[number] | (typeof SETUP_ALT)[number];

const CHECKLIST = [
  { text: "Store master record created", mandatory: true },
  { text: "Unique Store ID generated", mandatory: true },
  { text: "Store address and contact verified", mandatory: true },
  { text: "Service catalogue configured", mandatory: true },
  { text: "Pricing configured", mandatory: true },
  { text: "Taxes and billing details configured", mandatory: true },
  { text: "Payment methods configured", mandatory: true },
  { text: "POS device registered", mandatory: true },
  { text: "Receipt printer configured", mandatory: true },
  { text: "Barcode scanner configured", mandatory: false },
  { text: "Customer App store mapping completed", mandatory: true },
  { text: "Franchise App access configured", mandatory: true },
  { text: "POS users created", mandatory: true },
  { text: "Role permissions assigned", mandatory: true },
  { text: "Relationship Manager linked", mandatory: true },
  { text: "Trial order completed", mandatory: true },
  { text: "Trial invoice generated", mandatory: true },
  { text: "Printing tested", mandatory: true },
  { text: "Payment flow tested", mandatory: true },
  { text: "Reports checked", mandatory: false },
  { text: "Backup or recovery check completed", mandatory: false },
  { text: "Training access prepared", mandatory: true },
  { text: "Project Coordinator acceptance received", mandatory: true },
  { text: "Launch readiness confirmed", mandatory: true },
];

const TESTS = [
  "Login",
  "User permissions",
  "Order creation",
  "Customer registration",
  "Service selection",
  "Pricing",
  "Discounts",
  "Tax calculation",
  "Invoice generation",
  "Receipt printing",
  "Payment recording",
  "Order status updates",
  "Customer notifications placeholder",
  "Reports",
  "Data synchronisation",
  "App/POS logout and session handling",
];

const CRITICAL_TESTS = [
  "Login",
  "Order creation",
  "Tax calculation",
  "Invoice generation",
  "Receipt printing",
  "Payment recording",
];

type TestResult = "Not Tested" | "Passed" | "Failed" | "Retest Required";

export const INFO_ITEMS = [
  "Store legal name",
  "Address",
  "Contact details",
  "GST or tax details",
  "Bank or payment information",
  "Service list",
  "Pricing",
  "User list",
  "Device details",
  "Launch date",
  "Required integrations",
  "Other information",
] as const;

type Activity = { at: string; who: string; text: string };

type UserAccount = {
  name: string;
  employeeRef: string;
  role: string;
  status: "Invitation Sent" | "Activated" | "Not Created";
};

type Setup = {
  id: string;
  projectId: string;
  store: string;
  storeId: string;
  legalName: string;
  address: string;
  city: string;
  state: string;
  owner: string;
  pc: string;
  rm: string;
  unit: string;
  launch: string;
  launchISO: string;
  launchChanged: boolean;
  assignee: string;
  status: SetupStatus;
  taxStatus: string;
  devices: { name: string; serial: string; available: boolean }[];
  printer: string;
  scanner: string;
  internet: string;
  roles: string[];
  modules: string[];
  integrations: string[];
  checklist: { text: string; mandatory: boolean; done: boolean }[];
  tests: Record<string, TestResult>;
  accounts: UserAccount[];
  missing: string[];
  bugs: { id: string; issue: string; priority: string; blocker: boolean; fixBy: string }[];
  pcAccepted: boolean;
  ctoApprovalRequired: boolean;
  ctoApproved: boolean;
  trainingReady: boolean;
  handover?: { limitations: string; note: string; support: string };
  timeline: Activity[];
  audit: Activity[];
};

/* ------------------------------- sample data ------------------------------ */

const mkChecklist = (doneCount: number) =>
  CHECKLIST.map((c, i) => ({ ...c, done: i < doneCount }));

const mkTests = (passed: number, failed: string[] = []): Record<string, TestResult> =>
  Object.fromEntries(
    TESTS.map((t, i) => [t, failed.includes(t) ? "Failed" : i < passed ? "Passed" : "Not Tested"]),
  ) as Record<string, TestResult>;

const SEED: Setup[] = [
  {
    id: "SET-7001",
    projectId: "PRJ-JAI-01",
    store: "Clean Craft Jaipur — Vaishali Nagar",
    storeId: "CC-JAI-01",
    legalName: "Vaishali Laundry Services Pvt Ltd",
    address: "Shop 12, Vaishali Nagar, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    owner: "Rohit Agarwal (Owner) · +91 98••• ••210",
    pc: "Kavita Rao",
    rm: "Ankit Verma",
    unit: "Franchise Operations",
    launch: "6 Aug 2026",
    launchISO: "2026-08-06",
    launchChanged: true,
    assignee: "You (Rahul D.)",
    status: "Testing",
    taxStatus: "GST configured (GSTIN 08•••••••••1Z5)",
    devices: [
      { name: "POS Terminal (Windows 11)", serial: "POS-JAI-0091", available: true },
      { name: "Cash Drawer", serial: "CD-JAI-0022", available: true },
    ],
    printer: "Epson TM-T82 · 80mm thermal",
    scanner: "Zebra DS2208 · USB",
    internet: "Broadband active · 4G backup",
    roles: ["Store Owner", "Store Manager", "Counter Staff"],
    modules: ["POS Billing", "Customer App mapping", "Franchise App", "Reports"],
    integrations: ["Payment gateway (sandbox)", "SMS placeholder"],
    checklist: mkChecklist(18),
    tests: mkTests(9, ["Receipt printing"]),
    accounts: [
      { name: "Rohit Agarwal", employeeRef: "FR-USR-1201", role: "Store Owner", status: "Activated" },
      { name: "Suman Sharma", employeeRef: "EMP-3345", role: "Store Manager", status: "Invitation Sent" },
      { name: "Vikas Meena", employeeRef: "EMP-3346", role: "Counter Staff", status: "Not Created" },
    ],
    missing: [],
    bugs: [{ id: "BUG-88", issue: "Receipt print misaligned on 80mm", priority: "High", blocker: true, fixBy: "5 Aug 2026" }],
    pcAccepted: false,
    ctoApprovalRequired: false,
    ctoApproved: false,
    trainingReady: true,
    timeline: [
      { at: "28 Jul 10:00", who: "Kavita Rao (PC)", text: "Setup requested for franchise project PRJ-JAI-01." },
      { at: "28 Jul 11:30", who: "You (Rahul D.)", text: "Setup accepted. Configuration started." },
      { at: "3 Aug 15:00", who: "You (Rahul D.)", text: "Moved to Testing. Receipt printing failed — BUG-88 linked." },
    ],
    audit: [
      { at: "29 Jul 09:10", who: "You (Rahul D.)", text: "Tax configuration updated (values masked)." },
      { at: "1 Aug 12:00", who: "You (Rahul D.)", text: "Role permissions assigned — least privilege applied." },
    ],
  },
  {
    id: "SET-7002",
    projectId: "PRJ-IND-02",
    store: "Clean Craft Indore — Vijay Nagar",
    storeId: "CC-IND-02",
    legalName: "Vijay Care Services LLP",
    address: "Plot 8, Vijay Nagar, Indore",
    city: "Indore",
    state: "Madhya Pradesh",
    owner: "Neha Jain (Owner) · +91 97••• ••554",
    pc: "Kavita Rao",
    rm: "Sneha Kulkarni",
    unit: "Franchise Operations",
    launch: "7 Aug 2026",
    launchISO: "2026-08-07",
    launchChanged: false,
    assignee: "You (Rahul D.)",
    status: "Information Pending",
    taxStatus: "Pending — GST details not received",
    devices: [{ name: "POS Terminal", serial: "Not allocated", available: false }],
    printer: "Not received",
    scanner: "Not required",
    internet: "Broadband installation scheduled",
    roles: ["Store Owner", "Counter Staff"],
    modules: ["POS Billing", "Franchise App"],
    integrations: ["Payment gateway (sandbox)"],
    checklist: mkChecklist(4),
    tests: mkTests(0),
    accounts: [{ name: "Neha Jain", employeeRef: "FR-USR-1288", role: "Store Owner", status: "Not Created" }],
    missing: ["GST or tax details", "User list", "Device details"],
    bugs: [],
    pcAccepted: false,
    ctoApprovalRequired: false,
    ctoApproved: false,
    trainingReady: false,
    timeline: [
      { at: "30 Jul 09:00", who: "Kavita Rao (PC)", text: "Setup requested for PRJ-IND-02." },
      { at: "30 Jul 14:20", who: "You (Rahul D.)", text: "Returned to Project Coordinator — GST, user list and device details missing." },
    ],
    audit: [{ at: "30 Jul 14:20", who: "You (Rahul D.)", text: "Information request raised on same Setup ID." }],
  },
  {
    id: "SET-7003",
    projectId: "PRJ-LKO-03",
    store: "Clean Craft Lucknow — Gomti Nagar",
    storeId: "CC-LKO-03",
    legalName: "Gomti Fabricare Enterprises",
    address: "B-44, Gomti Nagar, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    owner: "Amit Tripathi (Owner) · +91 99••• ••117",
    pc: "Dev Malhotra",
    rm: "Pooja Singh",
    unit: "Franchise Operations",
    launch: "1 Aug 2026",
    launchISO: "2026-08-01",
    launchChanged: true,
    assignee: "You (Rahul D.)",
    status: "Setup Started",
    taxStatus: "GST configured",
    devices: [{ name: "POS Terminal", serial: "POS-LKO-0044", available: true }],
    printer: "Epson TM-T82",
    scanner: "Not required",
    internet: "Broadband active",
    roles: ["Store Owner", "Store Manager"],
    modules: ["POS Billing", "Customer App mapping", "Reports"],
    integrations: [],
    checklist: mkChecklist(9),
    tests: mkTests(0),
    accounts: [{ name: "Amit Tripathi", employeeRef: "FR-USR-1310", role: "Store Owner", status: "Invitation Sent" }],
    missing: ["Pricing"],
    bugs: [],
    pcAccepted: false,
    ctoApprovalRequired: false,
    ctoApproved: false,
    trainingReady: false,
    timeline: [{ at: "22 Jul 10:00", who: "Dev Malhotra (PC)", text: "Setup requested for PRJ-LKO-03." }],
    audit: [],
  },
  {
    id: "SET-7004",
    projectId: "PRJ-SUR-04",
    store: "Clean Craft Surat — Adajan",
    storeId: "CC-SUR-04",
    legalName: "Adajan Clean Services",
    address: "Ground floor, Adajan, Surat",
    city: "Surat",
    state: "Gujarat",
    owner: "Hiren Patel (Owner) · +91 96••• ••332",
    pc: "Kavita Rao",
    rm: "Nikhil Shah",
    unit: "Franchise Operations",
    launch: "12 Aug 2026",
    launchISO: "2026-08-12",
    launchChanged: false,
    assignee: "You (Rahul D.)",
    status: "Setup Requested",
    taxStatus: "Not started",
    devices: [],
    printer: "Not received",
    scanner: "Not required",
    internet: "Pending",
    roles: ["Store Owner", "Counter Staff"],
    modules: ["POS Billing", "Franchise App"],
    integrations: [],
    checklist: mkChecklist(0),
    tests: mkTests(0),
    accounts: [],
    missing: [],
    bugs: [],
    pcAccepted: false,
    ctoApprovalRequired: true,
    ctoApproved: false,
    trainingReady: false,
    timeline: [{ at: "3 Aug 16:00", who: "Kavita Rao (PC)", text: "Setup requested for PRJ-SUR-04." }],
    audit: [],
  },
  {
    id: "SET-7005",
    projectId: "PRJ-BHO-05",
    store: "Clean Craft Bhopal — MP Nagar",
    storeId: "CC-BHO-05",
    legalName: "MP Nagar Laundry Works",
    address: "Zone 2, MP Nagar, Bhopal",
    city: "Bhopal",
    state: "Madhya Pradesh",
    owner: "Rakesh Yadav (Owner) · +91 90••• ••889",
    pc: "Dev Malhotra",
    rm: "Rakesh Yadav",
    unit: "Franchise Operations",
    launch: "5 Aug 2026",
    launchISO: "2026-08-05",
    launchChanged: false,
    assignee: "You (Rahul D.)",
    status: "Training Ready",
    taxStatus: "GST configured",
    devices: [{ name: "POS Terminal", serial: "POS-BHO-0071", available: true }],
    printer: "Epson TM-T82",
    scanner: "Zebra DS2208",
    internet: "Broadband active",
    roles: ["Store Owner", "Store Manager", "Counter Staff"],
    modules: ["POS Billing", "Customer App mapping", "Franchise App", "Reports"],
    integrations: ["Payment gateway (sandbox)"],
    checklist: mkChecklist(22),
    tests: mkTests(16),
    accounts: [
      { name: "Rakesh Yadav", employeeRef: "FR-USR-1355", role: "Store Owner", status: "Activated" },
      { name: "Preeti Sen", employeeRef: "EMP-3390", role: "Store Manager", status: "Activated" },
    ],
    missing: [],
    bugs: [],
    pcAccepted: false,
    ctoApprovalRequired: false,
    ctoApproved: false,
    trainingReady: true,
    timeline: [
      { at: "18 Jul 09:00", who: "Dev Malhotra (PC)", text: "Setup requested for PRJ-BHO-05." },
      { at: "2 Aug 17:00", who: "You (Rahul D.)", text: "All tests passed. Training access prepared." },
    ],
    audit: [{ at: "2 Aug 17:05", who: "You (Rahul D.)", text: "Readiness state updated to Training Ready." }],
  },
  {
    id: "SET-7006",
    projectId: "PRJ-DEL-06",
    store: "Clean Craft Delhi — Rajouri Garden",
    storeId: "CC-DEL-06",
    legalName: "Rajouri Fabricare Pvt Ltd",
    address: "A-9, Rajouri Garden, New Delhi",
    city: "New Delhi",
    state: "Delhi",
    owner: "Meera Joshi (Owner) · +91 98••• ••006",
    pc: "Kavita Rao",
    rm: "Meera Joshi",
    unit: "Franchise Operations",
    launch: "20 Jul 2026",
    launchISO: "2026-07-20",
    launchChanged: false,
    assignee: "You (Rahul D.)",
    status: "Handover Completed",
    taxStatus: "GST configured",
    devices: [{ name: "POS Terminal", serial: "POS-DEL-0012", available: true }],
    printer: "Epson TM-T82",
    scanner: "Zebra DS2208",
    internet: "Broadband active",
    roles: ["Store Owner", "Store Manager", "Counter Staff"],
    modules: ["POS Billing", "Customer App mapping", "Franchise App", "Reports"],
    integrations: ["Payment gateway (sandbox)"],
    checklist: mkChecklist(24),
    tests: mkTests(16),
    accounts: [{ name: "Meera Joshi", employeeRef: "FR-USR-1102", role: "Store Owner", status: "Activated" }],
    missing: [],
    bugs: [],
    pcAccepted: true,
    ctoApprovalRequired: false,
    ctoApproved: true,
    trainingReady: true,
    handover: {
      limitations: "Barcode scanner works only on the primary terminal.",
      note: "Configuration retained for post-launch support history.",
      support: "Raise issues through My Tickets — store linked to Relationship Manager.",
    },
    timeline: [{ at: "19 Jul 18:00", who: "You (Rahul D.)", text: "Handover completed and accepted by Project Coordinator." }],
    audit: [{ at: "19 Jul 18:00", who: "Kavita Rao (PC)", text: "Handover acceptance recorded." }],
  },
];

/* -------------------------------- helpers -------------------------------- */

const TODAY = "2026-08-04";

const pct = (s: Setup) => Math.round((s.checklist.filter((c) => c.done).length / s.checklist.length) * 100);
const missingCount = (s: Setup) =>
  s.checklist.filter((c) => c.mandatory && !c.done).length + s.missing.length;
const daysToLaunch = (s: Setup) =>
  Math.round((new Date(s.launchISO).getTime() - new Date(TODAY).getTime()) / 86400000);
const isOverdue = (s: Setup) =>
  daysToLaunch(s) < 0 && !["Launch Ready", "Handover Completed", "Cancelled"].includes(s.status);

const statusTone = (s: SetupStatus) =>
  ["Launch Ready", "Handover Completed"].includes(s)
    ? "text-emerald-600"
    : ["Blocked", "Correction Required", "Cancelled"].includes(s)
    ? "text-destructive"
    : ["Setup Requested", "Information Pending"].includes(s)
    ? "text-amber-600"
    : "text-blue-600";

const testTone = (r: TestResult) =>
  r === "Passed" ? "text-emerald-600" : r === "Failed" ? "text-destructive" : r === "Retest Required" ? "text-amber-600" : "text-muted-foreground";

const attention = (s: Setup): string[] => {
  const a: string[] = [];
  const d = daysToLaunch(s);
  if (d >= 0 && d <= 3 && s.status !== "Handover Completed") a.push("Launch date within three days");
  if (s.missing.length) a.push("Mandatory information missing");
  if (isOverdue(s)) a.push("Setup overdue");
  if (s.devices.some((x) => !x.available) || !s.devices.length) a.push("POS device not available");
  if (s.accounts.some((x) => x.status !== "Activated")) a.push("User accounts not activated");
  if (CRITICAL_TESTS.some((t) => s.tests[t] === "Failed")) a.push("Critical test failed");
  if (s.bugs.some((b) => b.blocker)) a.push("Launch-blocking bug");
  if (!s.pcAccepted && ["Training Ready", "Launch Ready"].includes(s.status)) a.push("Project Coordinator acceptance pending");
  if (s.launchChanged) a.push("Store launch date changed");
  return a;
};

const readiness = (s: Setup) => [
  { label: "All mandatory setup items completed", ok: s.checklist.every((c) => !c.mandatory || c.done) },
  { label: "All critical tests passed", ok: CRITICAL_TESTS.every((t) => s.tests[t] === "Passed") },
  { label: "No unresolved launch-blocking bugs", ok: !s.bugs.some((b) => b.blocker) },
  { label: "Required users activated", ok: s.accounts.length > 0 && s.accounts.every((a) => a.status === "Activated") },
  { label: "Project Coordinator confirmation", ok: s.pcAccepted },
  { label: "Training access ready", ok: s.trainingReady },
  { label: "CTO approval (where required)", ok: !s.ctoApprovalRequired || s.ctoApproved },
];

/* ------------------------------- component -------------------------------- */

export function DevStorePos() {
  const [setups, setSetups] = useState<Setup[]>(SEED);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fPc, setFPc] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "info" | "account" | "bug" | "handover" | "fail">(null);
  const [failTest, setFailTest] = useState<string>("");

  const open = setups.find((s) => s.id === openId) ?? null;

  const update = (id: string, patch: Partial<Setup>, log?: string, audit?: string) =>
    setSetups((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...patch,
              timeline: log ? [...s.timeline, { at: "Just now", who: "You (Rahul D.)", text: log }] : s.timeline,
              audit: audit ? [...s.audit, { at: "Just now", who: "You (Rahul D.)", text: audit }] : s.audit,
            }
          : s,
      ),
    );

  const uniq = (fn: (s: Setup) => string) => Array.from(new Set(setups.map(fn)));

  const filtered = useMemo(
    () =>
      setups
        .filter((s) =>
          q.trim() ? (s.id + s.store + s.storeId + s.city + s.pc + s.projectId).toLowerCase().includes(q.toLowerCase()) : true,
        )
        .filter((s) => (fStatus === "all" ? true : s.status === fStatus))
        .filter((s) => (fPc === "all" ? true : s.pc === fPc))
        .filter((s) => (fCity === "all" ? true : s.city === fCity))
        .sort((a, b) => a.launchISO.localeCompare(b.launchISO)),
    [setups, q, fStatus, fPc, fCity],
  );

  const count = (fn: (s: Setup) => boolean) => setups.filter(fn).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHead
          title="Store & POS Setup"
          sub="All App and POS technical configuration required before a franchise store launches. One permanent Setup ID per franchise project and Store ID."
        />
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search setup, store, store ID, city, coordinator" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="New Requests" value={String(count((s) => s.status === "Setup Requested"))} sub="Awaiting acceptance" />
        <StatCard label="Information Pending" value={String(count((s) => s.status === "Information Pending"))} sub="With Project Coordinator" tone="warn" />
        <StatCard label="Setup in Progress" value={String(count((s) => ["Setup Started", "Configuration Completed"].includes(s.status)))} sub="Configuration underway" />
        <StatCard label="Testing Pending" value={String(count((s) => s.status === "Testing"))} sub="Tests not complete" tone="warn" />
        <StatCard label="Launch Ready" value={String(count((s) => ["Launch Ready", "Handover Completed"].includes(s.status)))} sub="Ready or handed over" tone="good" />
        <StatCard label="Overdue Setups" value={String(count(isOverdue))} sub="Past planned launch" tone="bad" />
      </div>

      <Card className="border-amber-500/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {setups
            .filter((s) => attention(s).length)
            .slice(0, 6)
            .map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
                <button className="font-medium underline underline-offset-2" onClick={() => setOpenId(s.id)}>{s.id}</button>
                <span className="text-muted-foreground truncate max-w-[18rem]">{s.store}</span>
                {attention(s).map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px] border-amber-500 text-amber-700">{a}</Badge>
                ))}
              </div>
            ))}
        </CardContent>
      </Card>

      {/* workflow strip */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-2 text-xs">
          {SETUP_FLOW.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className="rounded-full border px-2.5 py-1">{s}</span>
              {i < SETUP_FLOW.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
          <span className="ml-2 text-muted-foreground">Alternative:</span>
          {SETUP_ALT.map((s) => (
            <Badge key={s} variant="outline" className="text-[10px] border-destructive/50 text-destructive">{s}</Badge>
          ))}
        </CardContent>
      </Card>

      {/* filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Filter label="Status" value={fStatus} onChange={setFStatus} options={[...SETUP_FLOW, ...SETUP_ALT]} />
          <Filter label="Project Coordinator" value={fPc} onChange={setFPc} options={uniq((s) => s.pc)} />
          <Filter label="City" value={fCity} onChange={setFCity} options={uniq((s) => s.city)} />
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => { setFStatus("all"); setFPc("all"); setFCity("all"); setQ(""); }}>
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
                {["Setup ID","Store","Store ID","City / state","Project Coordinator","Planned launch","Developer","Completion","Status","Missing",""].map((h) => (
                  <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{s.id}</td>
                  <td className="px-3 py-2 max-w-[16rem] truncate">{s.store}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.storeId}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.city}, {s.state}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.pc}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${isOverdue(s) ? "text-destructive font-medium" : ""}`}>{s.launch}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.assignee}</td>
                  <td className="px-3 py-2 w-40">
                    <div className="flex items-center gap-2">
                      <Progress value={pct(s)} className="h-2" />
                      <span className="tabular-nums text-xs">{pct(s)}%</span>
                    </div>
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap font-medium ${statusTone(s.status)}`}>{s.status}</td>
                  <td className="px-3 py-2 tabular-nums">{missingCount(s)}</td>
                  <td className="px-3 py-2"><Button size="sm" variant="outline" onClick={() => setOpenId(s.id)}>View Setup</Button></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">No setups match these filters.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.id} · {s.storeId}</span>
                <span className={`text-xs font-medium ${statusTone(s.status)}`}>{s.status}</span>
              </div>
              <div className="font-medium text-sm">{s.store}</div>
              <div className="text-xs text-muted-foreground">{s.city}, {s.state} · PC {s.pc} · {s.assignee}</div>
              <div className="flex items-center gap-2">
                <Progress value={pct(s)} className="h-2" />
                <span className="text-xs tabular-nums">{pct(s)}%</span>
              </div>
              <div className="flex flex-wrap gap-x-4 text-xs">
                <span className={isOverdue(s) ? "text-destructive" : "text-muted-foreground"}>Launch {s.launch}</span>
                <span className={missingCount(s) ? "text-amber-600" : "text-muted-foreground"}>{missingCount(s)} missing items</span>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(s.id)}>View Setup</Button>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && <div className="text-sm text-muted-foreground">No setups match these filters.</div>}
      </div>

      <p className="text-xs text-muted-foreground">
        Security: passwords, API keys, database credentials and payment secrets are never displayed or stored. Tax, bank and customer details are masked. Configuration, permission and readiness changes are recorded in the audit log.
      </p>

      {/* details */}
      <Sheet open={!!open} onOpenChange={(v) => { if (!v) { setOpenId(null); setDialog(null); } }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  <span>{open.id}</span>
                  <span className={`text-sm ${statusTone(open.status)}`}>{open.status}</span>
                  <Badge variant="secondary">{pct(open)}% complete</Badge>
                </SheetTitle>
                <SheetDescription>{open.store} · {open.storeId} · Project {open.projectId}</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5 text-sm">
                {!!attention(open).length && (
                  <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 space-y-1">
                    {attention(open).map((a) => (
                      <div key={a} className="flex items-center gap-2 text-amber-800 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" /> {a}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Field k="Franchise project ID" v={open.projectId} />
                  <Field k="Legal business name" v={open.legalName} />
                  <Field k="Store address" v={open.address} />
                  <Field k="Owner or authorised contact" v={open.owner} />
                  <Field k="Project Coordinator" v={open.pc} />
                  <Field k="Relationship Manager" v={open.rm} />
                  <Field k="Planned launch date" v={`${open.launch}${open.launchChanged ? " (changed)" : ""}`} />
                  <Field k="Business unit" v={open.unit} />
                  <Field k="Tax and billing configuration" v={open.taxStatus} />
                  <Field k="Internet status" v={open.internet} />
                  <Field k="Printer" v={open.printer} />
                  <Field k="Barcode scanner" v={open.scanner} />
                </div>

                <Block title="POS devices">
                  {open.devices.length ? (
                    <ul className="space-y-1">
                      {open.devices.map((d) => (
                        <li key={d.serial} className="text-sm flex items-center gap-2">
                          {d.name} · <span className="text-muted-foreground">{d.serial}</span>
                          <Badge variant="outline" className={d.available ? "text-emerald-600" : "text-destructive"}>
                            {d.available ? "Available" : "Not available"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-destructive text-xs">No POS device allocated.</span>}
                </Block>

                <div className="grid sm:grid-cols-3 gap-3">
                  <Block title="User roles required"><ChipList items={open.roles} /></Block>
                  <Block title="Modules required"><ChipList items={open.modules} /></Block>
                  <Block title="Integrations required"><ChipList items={open.integrations} /></Block>
                </div>

                {/* checklist */}
                <Block title={`Setup checklist (${open.checklist.filter((c) => c.done).length}/${open.checklist.length})`}>
                  <Progress className="h-2 mb-3" value={pct(open)} />
                  <div className="space-y-1.5">
                    {open.checklist.map((c, i) => (
                      <label key={c.text} className="flex items-start gap-2 text-sm">
                        <Checkbox
                          checked={c.done}
                          onCheckedChange={() =>
                            update(
                              open.id,
                              { checklist: open.checklist.map((x, xi) => (xi === i ? { ...x, done: !x.done } : x)) },
                              undefined,
                              `Checklist item "${c.text}" marked ${c.done ? "incomplete" : "complete"}.`,
                            )
                          }
                        />
                        <span className={c.done ? "line-through text-muted-foreground" : ""}>
                          {c.text}{" "}
                          {c.mandatory ? <Badge variant="outline" className="text-[9px] ml-1">Mandatory</Badge> : null}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Checklist changes are recorded in the audit log with full history. Administrators can configure required items later.
                  </p>
                </Block>

                {/* missing information */}
                <Block title="Missing information">
                  {open.missing.length ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {open.missing.map((m) => <Badge key={m} variant="outline" className="text-amber-700 border-amber-500">{m}</Badge>)}
                    </div>
                  ) : <div className="text-xs text-muted-foreground mb-2">Nothing pending from the Project Coordinator.</div>}
                  <Button size="sm" variant="outline" onClick={() => setDialog("info")}>Request Information</Button>
                </Block>

                {/* accounts */}
                <Block title="User accounts">
                  <div className="space-y-1.5">
                    {open.accounts.map((a) => (
                      <div key={a.employeeRef} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-xs text-muted-foreground">{a.employeeRef} · {a.role}</span>
                        <Badge variant="outline" className={a.status === "Activated" ? "text-emerald-600" : "text-amber-600"}>{a.status}</Badge>
                        {a.status !== "Activated" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              update(
                                open.id,
                                { accounts: open.accounts.map((x) => (x.employeeRef === a.employeeRef ? { ...x, status: "Invitation Sent" } : x)) },
                                `Secure setup invitation sent to ${a.name} (${a.employeeRef}). No password created or stored.`,
                                `Account invitation issued for ${a.employeeRef} with least-privilege role ${a.role}.`,
                              );
                              toast.success("Secure setup invitation sent");
                            }}
                          >
                            Send invitation
                          </Button>
                        )}
                      </div>
                    ))}
                    {!open.accounts.length && <div className="text-xs text-muted-foreground">No accounts created yet.</div>}
                  </div>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setDialog("account")}>
                    <UserPlus className="h-3.5 w-3.5 mr-1" />Create user account
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Every account links to an approved employee or franchise-user record. Invitations are secure links — plain-text passwords are never created, displayed or stored.
                  </p>
                </Block>

                {/* testing */}
                <Block title="Testing results">
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {TESTS.map((tn) => (
                      <div key={tn} className="flex items-center justify-between gap-2 rounded border px-2 py-1.5">
                        <span className="text-xs">
                          {tn} {CRITICAL_TESTS.includes(tn) && <Badge variant="outline" className="text-[9px] ml-1">Critical</Badge>}
                        </span>
                        <Select
                          value={open.tests[tn]}
                          onValueChange={(v) => {
                            if (v === "Failed") { setFailTest(tn); setDialog("fail"); return; }
                            update(open.id, { tests: { ...open.tests, [tn]: v as TestResult } }, undefined, `Test "${tn}" result set to ${v}.`);
                          }}
                        >
                          <SelectTrigger className={`h-7 w-[9.5rem] text-xs ${testTone(open.tests[tn])}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(["Not Tested", "Passed", "Failed", "Retest Required"] as TestResult[]).map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </Block>

                {/* bugs */}
                <Block title="Linked bugs">
                  {open.bugs.length ? (
                    <div className="space-y-1.5">
                      {open.bugs.map((b) => (
                        <div key={b.id} className="text-xs flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{b.id}</Badge>
                          <span>{b.issue}</span>
                          <Badge variant="outline">{b.priority}</Badge>
                          {b.blocker && <Badge className="bg-destructive text-destructive-foreground">Launch blocker</Badge>}
                          <span className="text-muted-foreground">Fix by {b.fixBy}</span>
                        </div>
                      ))}
                    </div>
                  ) : <span className="text-xs text-muted-foreground">No bugs linked to this setup.</span>}
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setDialog("bug")}><Bug className="h-3.5 w-3.5 mr-1" />Link bug</Button>
                </Block>

                {/* readiness */}
                <Block title="Launch readiness">
                  <div className="space-y-1.5">
                    {readiness(open).map((r) => (
                      <div key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />} {r.label}
                      </div>
                    ))}
                  </div>
                </Block>

                {open.handover && (
                  <Block title="Handover summary">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <Field k="Store and Setup IDs" v={`${open.storeId} · ${open.id}`} />
                      <Field k="Configured modules" v={open.modules.join(", ")} />
                      <Field k="POS devices" v={open.devices.map((d) => d.name).join(", ") || "—"} />
                      <Field k="User roles" v={open.roles.join(", ")} />
                      <Field k="Test results" v={`${Object.values(open.tests).filter((r) => r === "Passed").length}/${TESTS.length} passed`} />
                      <Field k="Known limitations" v={open.handover.limitations} />
                      <Field k="Support process" v={open.handover.support} />
                      <Field k="Developer note" v={open.handover.note} />
                      <Field k="Project Coordinator acceptance" v={open.pcAccepted ? "Accepted" : "Pending"} />
                      <Field k="Relationship Manager visibility" v={`${open.rm} — store outcomes visible`} />
                    </div>
                  </Block>
                )}

                <Block title="Activity timeline">
                  <div className="space-y-2">
                    {open.timeline.map((a, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div><span className="text-muted-foreground">{a.at} · {a.who}</span><div>{a.text}</div></div>
                      </div>
                    ))}
                  </div>
                </Block>

                <Block title="Audit log (configuration, permissions, readiness)">
                  <div className="space-y-1.5">
                    {open.audit.length ? open.audit.map((a, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <ShieldAlert className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div><span className="text-muted-foreground">{a.at} · {a.who}</span><div>{a.text}</div></div>
                      </div>
                    )) : <span className="text-xs text-muted-foreground">No configuration changes recorded yet.</span>}
                  </div>
                </Block>

                <Separator />

                <div>
                  <div className="text-xs font-medium mb-2">Developer actions</div>
                  <div className="flex flex-wrap gap-2">
                    {open.status === "Setup Requested" && (
                      <>
                        <Button size="sm" onClick={() => update(open.id, { status: "Setup Started" }, "Setup accepted and configuration started.", "Setup accepted by Developer.")}>Accept Setup</Button>
                        <Button size="sm" variant="outline" onClick={() => setDialog("info")}>Return for Information</Button>
                      </>
                    )}
                    {open.status === "Information Pending" && (
                      <Button size="sm" onClick={() => update(open.id, { status: "Setup Started", missing: [] }, "Information received. Configuration resumed.")}>Information Received</Button>
                    )}
                    {open.status === "Setup Started" && (
                      <Button size="sm" onClick={() => update(open.id, { status: "Configuration Completed" }, "Configuration completed.", "Configuration marked complete.")}>Configuration Completed</Button>
                    )}
                    {open.status === "Configuration Completed" && (
                      <Button size="sm" onClick={() => update(open.id, { status: "Testing" }, "Moved to testing on the same Setup ID.")}>Start Testing</Button>
                    )}
                    {open.status === "Testing" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!CRITICAL_TESTS.every((t) => open.tests[t] === "Passed")) {
                            toast.error("All critical tests must pass before training access.");
                            return;
                          }
                          update(open.id, { status: "Training Ready", trainingReady: true }, "All critical tests passed. Training access prepared.", "Readiness state updated to Training Ready.");
                        }}
                      >
                        Mark Training Ready
                      </Button>
                    )}
                    {!open.pcAccepted && (
                      <Button size="sm" variant="outline" onClick={() => update(open.id, { pcAccepted: true }, "Project Coordinator acceptance recorded.", "PC acceptance recorded.")}>Record PC Acceptance</Button>
                    )}
                    {open.ctoApprovalRequired && !open.ctoApproved && (
                      <Button size="sm" variant="outline" onClick={() => update(open.id, { ctoApproved: true }, "CTO approval recorded for this setup.", "CTO approval recorded.")}>Record CTO Approval</Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={open.status === "Handover Completed"}
                      onClick={() => {
                        const blockers = readiness(open).filter((r) => !r.ok);
                        if (blockers.length) {
                          toast.error(`Not launch ready: ${blockers[0].label}`);
                          return;
                        }
                        update(open.id, { status: "Launch Ready" }, "Marked Launch Ready. Project Coordinator, Relationship Manager and CTO notified.", "Launch readiness confirmed.");
                        toast.success("Launch Ready — PC, RM and CTO notified.");
                      }}
                    >
                      Mark Launch Ready
                    </Button>
                    {open.status === "Launch Ready" && (
                      <Button size="sm" variant="outline" onClick={() => setDialog("handover")}>Complete Handover</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => update(open.id, { status: "Blocked" }, "Setup marked blocked. Project Coordinator notified.")}>Mark Blocked</Button>
                    <Button size="sm" variant="outline" onClick={() => update(open.id, { status: "Correction Required" }, "Correction required on the same Setup ID.")}>Correction Required</Button>
                  </div>
                </div>
              </div>

              {/* dialogs */}
              <InfoDialog
                open={dialog === "info"}
                onClose={() => setDialog(null)}
                onSubmit={(items, note) => {
                  update(
                    open.id,
                    { status: "Information Pending", missing: Array.from(new Set([...open.missing, ...items])) },
                    `Information requested from ${open.pc} (Project Coordinator): ${items.join(", ")}. ${note}`,
                    "Information request raised on the same Setup ID.",
                  );
                  toast.success("Request returned to the Project Coordinator");
                  setDialog(null);
                }}
              />

              <AccountDialog
                open={dialog === "account"}
                onClose={() => setDialog(null)}
                roles={open.roles}
                onSubmit={(a) => {
                  update(
                    open.id,
                    { accounts: [...open.accounts, { ...a, status: "Invitation Sent" }] },
                    `User account created for ${a.name} (${a.employeeRef}) with role ${a.role}. Secure invitation sent — no password stored.`,
                    `Account created and linked to record ${a.employeeRef}; least-privilege role ${a.role} applied.`,
                  );
                  toast.success("Account created and invitation sent");
                  setDialog(null);
                }}
              />

              <FailDialog
                open={dialog === "fail"}
                testName={failTest}
                onClose={() => setDialog(null)}
                onSubmit={(f) => {
                  const bugId = f.bugId || `BUG-${100 + Math.floor(Math.random() * 90)}`;
                  update(
                    open.id,
                    {
                      tests: { ...open.tests, [failTest]: "Failed" },
                      bugs: [...open.bugs, { id: bugId, issue: f.issue, priority: f.priority, blocker: f.blocker, fixBy: f.fixBy }],
                      status: "Correction Required",
                    },
                    `Test "${failTest}" failed. ${bugId} linked to the same Setup ID. Expected correction by ${f.fixBy}.`,
                    `Failed test recorded for "${failTest}".`,
                  );
                  toast.success(`${bugId} linked to ${open.id}`);
                  setDialog(null);
                }}
              />

              <HandoverDialog
                open={dialog === "handover"}
                onClose={() => setDialog(null)}
                onSubmit={(h) => {
                  update(open.id, { status: "Handover Completed", handover: h },
                    "Handover completed. Summary shared with Project Coordinator and Relationship Manager. Configuration retained for post-launch support.",
                    "Handover recorded.");
                  toast.success("Handover completed");
                  setDialog(null);
                }}
              />

              <SimpleDialog
                open={dialog === "bug"}
                title="Link bug to this setup"
                desc={`The bug stays linked to ${open.id} — no duplicate setup record is created.`}
                placeholder="Bug summary"
                onClose={() => setDialog(null)}
                onSubmit={(v) => {
                  const bugId = `BUG-${100 + Math.floor(Math.random() * 90)}`;
                  update(open.id, { bugs: [...open.bugs, { id: bugId, issue: v, priority: "Medium", blocker: false, fixBy: "TBD" }] }, `Bug ${bugId} linked: ${v}`);
                  toast.success(`${bugId} linked`);
                  setDialog(null);
                }}
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
      <div className="font-medium break-words">{v}</div>
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

function ChipList({ items }: { items: string[] }) {
  return items.length ? (
    <div className="flex flex-wrap gap-1.5">{items.map((i) => <Badge key={i} variant="secondary" className="text-[10px]">{i}</Badge>)}</div>
  ) : (
    <span className="text-xs text-muted-foreground">None</span>
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

function InfoDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (items: string[], note: string) => void }) {
  const [items, setItems] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const toggle = (i: string) => setItems((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request missing information</DialogTitle>
          <DialogDescription>The request returns to the Project Coordinator within the same Setup ID.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {INFO_ITEMS.map((i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <Checkbox checked={items.includes(i)} onCheckedChange={() => toggle(i)} />
              {i}
            </label>
          ))}
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Message to Project Coordinator (never include credentials or secrets)" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!items.length} onClick={() => { onSubmit(items, note); setItems([]); setNote(""); }}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccountDialog({ open, onClose, roles, onSubmit }: {
  open: boolean; onClose: () => void; roles: string[];
  onSubmit: (a: { name: string; employeeRef: string; role: string }) => void;
}) {
  const [f, setF] = useState({ name: "", employeeRef: "", role: "" });
  const ok = f.name.trim() && f.employeeRef.trim() && f.role;
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user account</DialogTitle>
          <DialogDescription>
            Accounts must link to an approved employee or franchise-user record. A secure setup invitation is sent — no password is created, displayed or stored.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <In label="Full name *" v={f.name} on={(v) => setF((p) => ({ ...p, name: v }))} />
          <In label="Employee / franchise-user record ID *" v={f.employeeRef} on={(v) => setF((p) => ({ ...p, employeeRef: v }))} />
          <div className="space-y-1">
            <Label className="text-xs">Role (least privilege) *</Label>
            <Select value={f.role} onValueChange={(v) => setF((p) => ({ ...p, role: v }))}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!ok} onClick={() => { onSubmit(f); setF({ name: "", employeeRef: "", role: "" }); }}>Create and invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FailDialog({ open, testName, onClose, onSubmit }: {
  open: boolean; testName: string; onClose: () => void;
  onSubmit: (f: { issue: string; bugId: string; priority: string; blocker: boolean; fixBy: string }) => void;
}) {
  const [f, setF] = useState({ issue: "", bugId: "", priority: "High", blocker: false, fixBy: "" });
  const ok = f.issue.trim() && f.fixBy;
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Failed test — {testName}</DialogTitle>
          <DialogDescription>A bug is created or linked on the same Setup ID. No duplicate setup record is created.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Ta label="Issue recorded *" v={f.issue} on={(v) => setF((p) => ({ ...p, issue: v }))} />
          <In label="Link existing bug ID (leave blank to create new)" v={f.bugId} on={(v) => setF((p) => ({ ...p, bugId: v }))} />
          <div className="space-y-1">
            <Label className="text-xs">Priority *</Label>
            <Select value={f.priority} onValueChange={(v) => setF((p) => ({ ...p, priority: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Critical", "High", "Medium", "Low"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expected correction date *</Label>
            <Input type="date" value={f.fixBy} onChange={(e) => setF((p) => ({ ...p, fixBy: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={f.blocker} onCheckedChange={(v) => setF((p) => ({ ...p, blocker: !!v }))} />
            Launch-blocking bug
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!ok} onClick={() => { onSubmit(f); setF({ issue: "", bugId: "", priority: "High", blocker: false, fixBy: "" }); }}>Record failure</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HandoverDialog({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void;
  onSubmit: (h: { limitations: string; note: string; support: string }) => void;
}) {
  const [f, setF] = useState({ limitations: "", note: "", support: "Raise issues through My Tickets — store linked to Relationship Manager." });
  const ok = f.note.trim() && f.support.trim();
  return (
    <Dialog open={open} onOpenChange={(x) => !x && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Handover summary</DialogTitle>
          <DialogDescription>
            Store and Setup IDs, modules, devices, roles and test results are included automatically. Configuration stays available after launch for support history.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Ta label="Known limitations" v={f.limitations} on={(v) => setF((p) => ({ ...p, limitations: v }))} />
          <Ta label="Support process *" v={f.support} on={(v) => setF((p) => ({ ...p, support: v }))} />
          <Ta label="Developer note *" v={f.note} on={(v) => setF((p) => ({ ...p, note: v }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!ok} onClick={() => onSubmit(f)}>Complete handover</Button>
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
