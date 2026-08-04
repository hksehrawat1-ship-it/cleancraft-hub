import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Bug as BugIcon,
  CheckCircle2,
  FlaskConical,
  Plus,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { SectionHead, StatCard } from "@/components/smm/ui";

/* --------------------------------- types --------------------------------- */

export const BUG_FLOW = [
  "Bug Reported",
  "Triage",
  "Accepted",
  "Fix in Progress",
  "Ready for Testing",
  "Testing",
  "Passed",
  "Failed",
  "Awaiting Approval",
  "Resolved",
  "Closed",
] as const;

export const BUG_ALT = [
  "Duplicate",
  "Cannot Reproduce",
  "Deferred",
  "Reopened",
  "Cancelled",
] as const;

type BugStatus = (typeof BUG_FLOW)[number] | (typeof BUG_ALT)[number];

const SYSTEM_AREAS = [
  "Customer App",
  "Franchise App",
  "POS",
  "Admin Panel",
  "CRM",
  "Website",
  "API or Integration",
  "Database",
  "Reports",
  "User Access",
  "Other",
] as const;

const SEVERITIES = ["Critical", "High", "Medium", "Low"] as const;
const PRIORITIES = ["P1", "P2", "P3", "P4"] as const;

const TESTING_TYPES = [
  "Functional Testing",
  "Regression Testing",
  "POS Testing",
  "Mobile Testing",
  "Desktop Testing",
  "Permission Testing",
  "Data Testing",
  "Integration Testing",
  "Performance Testing",
  "Security Review Placeholder",
  "User Acceptance Testing",
] as const;

type TestCase = {
  id: string;
  type: (typeof TESTING_TYPES)[number];
  objective: string;
  preconditions: string;
  steps: string;
  expected: string;
  actual: string;
  result: "Passed" | "Failed" | "Not Run";
  testedBy: string;
  testDate: string;
  evidence: string;
  mandatory: boolean;
};

type FixDetails = {
  rootCause: string;
  components: string;
  summary: string;
  risk: "Low" | "Medium" | "High";
  dbChange: boolean;
  securityImpact: boolean;
  regressionAreas: string;
  selfTest: string;
  targetRelease: string;
  notes: string;
  attempt: number;
  savedOn: string;
};

type Bug = {
  id: string;
  title: string;
  description: string;
  area: (typeof SYSTEM_AREAS)[number];
  severity: (typeof SEVERITIES)[number];
  priority: (typeof PRIORITIES)[number];
  status: BugStatus;
  environment: "Production" | "Staging" | "Development";
  version: string;
  device: string;
  steps: string;
  expected: string;
  actual: string;
  errorMessage: string;
  evidence: string;
  frequency: "Always" | "Often" | "Sometimes" | "Once";
  impact: string;
  affected: string[];
  storeCount: number;
  ticketId?: string;
  taskId?: string;
  setupId?: string;
  developer?: string;
  targetRelease: string;
  targetDate: string;
  createdOn: string;
  dataLoss: boolean;
  securityRestricted: boolean;
  posBilling: boolean;
  reopenCount: number;
  failCount: number;
  duplicateOf?: string;
  deferReason?: string;
  ctoApproval?: "Not Required" | "Pending" | "Approved";
  fixes: FixDetails[];
  tests: TestCase[];
  history: { on: string; who: string; what: string }[];
  audit: { on: string; who: string; what: string }[];
  closure?: { note: string; release: string; confirmedBy: string };
};

/* -------------------------------- sample -------------------------------- */

const DEVS = ["Ravi Menon", "Aditi Shah", "Karan Bhatia", "Sneha Rao", "Unassigned"];

const mkTest = (
  id: string,
  type: TestCase["type"],
  objective: string,
  result: TestCase["result"],
  mandatory = true,
  extra: Partial<TestCase> = {},
): TestCase => ({
  id,
  type,
  objective,
  preconditions: "Test store CC-TEST-01 with sample catalogue loaded",
  steps: "1. Login as store user\n2. Perform the action under test\n3. Verify output and stored record",
  expected: "Action completes and record is stored correctly",
  actual: result === "Passed" ? "Matches expected result" : result === "Failed" ? "Deviates from expected result" : "—",
  result,
  testedBy: result === "Not Run" ? "—" : "Aditi Shah",
  testDate: result === "Not Run" ? "—" : "02 Aug 2026",
  evidence: result === "Not Run" ? "—" : "screen-recording.mp4",
  mandatory,
  ...extra,
});

const SAMPLE: Bug[] = [
  {
    id: "BUG-2041",
    title: "POS billing fails on split payment (cash + UPI)",
    description:
      "Store staff cannot complete a bill when the amount is split between cash and UPI. Invoice is not generated and the counter is stuck.",
    area: "POS",
    severity: "Critical",
    priority: "P1",
    status: "Fix in Progress",
    environment: "Production",
    version: "POS 4.8.2",
    device: "Windows 11 desktop, Chrome 128",
    steps:
      "1. Add 3 garments to bill\n2. Choose Split Payment\n3. Enter cash 200 and UPI remaining\n4. Press Save & Print",
    expected: "Invoice generated, payment split recorded, print dialog opens",
    actual: "Spinner runs indefinitely, invoice number consumed but no bill saved",
    errorMessage: "500 – payment_split_total_mismatch",
    evidence: "pos-split-payment.mp4, error-console.png",
    frequency: "Always",
    impact: "Billing stopped at counter during peak hours; manual bills being used.",
    affected: ["Jaipur Vaishali", "Indore Vijay Nagar", "Surat Adajan", "Lucknow Gomti"],
    storeCount: 4,
    ticketId: "TKT-8812",
    developer: "Ravi Menon",
    targetRelease: "REL-4.8.3",
    targetDate: "05 Aug 2026",
    createdOn: "01 Aug 2026",
    dataLoss: false,
    securityRestricted: false,
    posBilling: true,
    reopenCount: 0,
    failCount: 1,
    ctoApproval: "Pending",
    fixes: [
      {
        rootCause: "Rounding on UPI leg computed before tax, causing a 1 paisa mismatch in the split validator.",
        components: "pos-billing-service, payment-validator",
        summary: "Move rounding after tax computation and compare totals with a 1 paisa tolerance.",
        risk: "High",
        dbChange: false,
        securityImpact: false,
        regressionAreas: "Single payment billing, refunds, day-close report",
        selfTest: "Verified split of 200 + 149.50 on test store, invoice generated correctly.",
        targetRelease: "REL-4.8.3",
        notes: "Requires CTO approval before release because billing path is touched.",
        attempt: 1,
        savedOn: "02 Aug 2026",
      },
    ],
    tests: [
      mkTest("TC-01", "POS Testing", "Split payment cash + UPI generates invoice", "Failed"),
      mkTest("TC-02", "Regression Testing", "Single payment billing unaffected", "Passed"),
      mkTest("TC-03", "Data Testing", "Day-close totals match payment ledger", "Not Run"),
    ],
    history: [
      { on: "01 Aug 2026 10:12", who: "Support (TKT-8812)", what: "Bug reported from store ticket" },
      { on: "01 Aug 2026 11:02", who: "CTO", what: "Severity set to Critical, assigned to Ravi Menon" },
      { on: "02 Aug 2026 16:40", who: "Aditi Shah", what: "Test TC-01 failed — returned to Fix in Progress" },
    ],
    audit: [
      { on: "01 Aug 2026 11:02", who: "CTO", what: "Severity changed Medium → Critical" },
      { on: "01 Aug 2026 11:02", who: "CTO", what: "Assigned developer: Ravi Menon" },
    ],
  },
  {
    id: "BUG-2044",
    title: "Customer phone number visible in unmasked form on Reports export",
    description:
      "Report export includes full customer phone numbers for users who should only see masked values.",
    area: "Reports",
    severity: "Critical",
    priority: "P1",
    status: "Bug Reported",
    environment: "Production",
    version: "CRM 3.2.0",
    device: "Any browser",
    steps: "1. Open Reports\n2. Export Daily Orders as CSV\n3. Open the file",
    expected: "Phone column masked as 98XXXXXX21 for non-authorised roles",
    actual: "Full 10 digit number present for all roles",
    errorMessage: "—",
    evidence: "export-sample-redacted.png",
    frequency: "Always",
    impact: "Personal data exposure risk across all franchise exports.",
    affected: ["All CRM report users"],
    storeCount: 22,
    ticketId: "TKT-8830",
    developer: undefined,
    targetRelease: "REL-3.2.1",
    targetDate: "06 Aug 2026",
    createdOn: "03 Aug 2026",
    dataLoss: true,
    securityRestricted: true,
    posBilling: false,
    reopenCount: 0,
    failCount: 0,
    ctoApproval: "Not Required",
    fixes: [],
    tests: [],
    history: [{ on: "03 Aug 2026 09:20", who: "HR Head", what: "Bug reported (restricted visibility)" }],
    audit: [{ on: "03 Aug 2026 09:20", who: "System", what: "Marked security restricted" }],
  },
  {
    id: "BUG-2038",
    title: "Franchise App shows yesterday's sales on dashboard tile",
    description: "Dashboard sales tile does not refresh after day-close; owners see stale numbers until re-login.",
    area: "Franchise App",
    severity: "High",
    priority: "P2",
    status: "Ready for Testing",
    environment: "Staging",
    version: "Franchise App 2.6.0",
    device: "Android 14, iOS 18",
    steps: "1. Complete day-close\n2. Open Franchise App dashboard",
    expected: "Today's sales figure shown",
    actual: "Previous day's figure shown until app restart",
    errorMessage: "—",
    evidence: "stale-tile.png",
    frequency: "Often",
    impact: "Owners lose trust in reported numbers.",
    affected: ["Jaipur Vaishali", "Mumbai Andheri"],
    storeCount: 2,
    taskId: "TASK-512",
    developer: "Sneha Rao",
    targetRelease: "REL-2.6.1",
    targetDate: "08 Aug 2026",
    createdOn: "29 Jul 2026",
    dataLoss: false,
    securityRestricted: false,
    posBilling: false,
    reopenCount: 0,
    failCount: 0,
    ctoApproval: "Not Required",
    fixes: [
      {
        rootCause: "Dashboard query cached with a 24 hour key that ignored the day-close event.",
        components: "franchise-app-dashboard, cache-keys",
        summary: "Invalidate the sales cache on day-close and reduce TTL to 5 minutes.",
        risk: "Low",
        dbChange: false,
        securityImpact: false,
        regressionAreas: "Dashboard load time, offline mode",
        selfTest: "Day-close simulated on staging, tile updated within 10 seconds.",
        targetRelease: "REL-2.6.1",
        notes: "No schema change.",
        attempt: 1,
        savedOn: "31 Jul 2026",
      },
    ],
    tests: [
      mkTest("TC-01", "Mobile Testing", "Tile refreshes after day-close on Android", "Not Run"),
      mkTest("TC-02", "Regression Testing", "Dashboard loads under 2 seconds", "Not Run"),
    ],
    history: [
      { on: "29 Jul 2026", who: "RM Team", what: "Bug reported" },
      { on: "31 Jul 2026", who: "Sneha Rao", what: "Fix completed, moved to Ready for Testing" },
    ],
    audit: [{ on: "29 Jul 2026", who: "CTO", what: "Assigned developer: Sneha Rao" }],
  },
  {
    id: "BUG-2030",
    title: "Store user with Cashier role can open Price Master",
    description: "Permission check missing on the Price Master screen in Admin Panel.",
    area: "User Access",
    severity: "High",
    priority: "P2",
    status: "Reopened",
    environment: "Production",
    version: "Admin Panel 5.1.4",
    device: "Desktop",
    steps: "1. Login as Cashier\n2. Navigate directly to /admin/price-master",
    expected: "Access denied message",
    actual: "Price Master opens in edit mode",
    errorMessage: "—",
    evidence: "role-bypass.png",
    frequency: "Always",
    impact: "Pricing can be altered by unauthorised staff.",
    affected: ["All stores"],
    storeCount: 22,
    ticketId: "TKT-8790",
    developer: "Karan Bhatia",
    targetRelease: "REL-5.1.5",
    targetDate: "04 Aug 2026",
    createdOn: "20 Jul 2026",
    dataLoss: false,
    securityRestricted: true,
    posBilling: false,
    reopenCount: 1,
    failCount: 2,
    ctoApproval: "Pending",
    fixes: [
      {
        rootCause: "Route guard applied to menu only, not to the direct URL.",
        components: "admin-router, permission-guard",
        summary: "Add server-side permission check on the price master route.",
        risk: "Medium",
        dbChange: false,
        securityImpact: true,
        regressionAreas: "All admin routes, role switching",
        selfTest: "Verified cashier and manager roles on staging.",
        targetRelease: "REL-5.1.5",
        notes: "Second attempt after reopen.",
        attempt: 2,
        savedOn: "02 Aug 2026",
      },
    ],
    tests: [
      mkTest("TC-01", "Permission Testing", "Cashier blocked on direct URL", "Failed"),
      mkTest("TC-02", "Permission Testing", "Manager retains access", "Passed"),
    ],
    history: [
      { on: "20 Jul 2026", who: "Technical Support", what: "Bug reported" },
      { on: "28 Jul 2026", who: "Requester", what: "Reopened — issue seen again after release" },
    ],
    audit: [{ on: "28 Jul 2026", who: "Requester", what: "Status changed Closed → Reopened (same Bug ID)" }],
  },
  {
    id: "BUG-2035",
    title: "Website enquiry form rejects valid landline numbers",
    description: "Validation only accepts 10 digit mobile numbers.",
    area: "Website",
    severity: "Low",
    priority: "P4",
    status: "Deferred",
    environment: "Production",
    version: "Web 1.9.0",
    device: "Any",
    steps: "1. Open enquiry form\n2. Enter a landline with STD code\n3. Submit",
    expected: "Form accepts the number",
    actual: "Validation error shown",
    errorMessage: "Please enter a valid phone number",
    evidence: "form-validation.png",
    frequency: "Sometimes",
    impact: "Small number of enquiries lost.",
    affected: ["Website visitors"],
    storeCount: 0,
    developer: "Karan Bhatia",
    targetRelease: "REL-2.0.0",
    targetDate: "30 Sep 2026",
    createdOn: "18 Jul 2026",
    dataLoss: false,
    securityRestricted: false,
    posBilling: false,
    reopenCount: 0,
    failCount: 0,
    deferReason: "Low volume impact; bundled with the website revamp in REL-2.0.0.",
    ctoApproval: "Not Required",
    fixes: [],
    tests: [],
    history: [{ on: "22 Jul 2026", who: "CTO", what: "Deferred to REL-2.0.0" }],
    audit: [{ on: "22 Jul 2026", who: "CTO", what: "Status changed Triage → Deferred" }],
  },
  {
    id: "BUG-2018",
    title: "Duplicate invoice number on offline-to-online sync",
    description: "Two invoices received the same number after the POS reconnected.",
    area: "Database",
    severity: "Critical",
    priority: "P1",
    status: "Closed",
    environment: "Production",
    version: "POS 4.7.9",
    device: "Windows 11 desktop",
    steps: "1. Bill offline\n2. Reconnect network\n3. Compare synced invoices",
    expected: "Unique invoice numbers",
    actual: "Duplicate invoice number for two bills",
    errorMessage: "unique_violation invoice_no",
    evidence: "sync-log-redacted.txt",
    frequency: "Sometimes",
    impact: "Accounting mismatch and data integrity risk.",
    affected: ["Indore Vijay Nagar"],
    storeCount: 1,
    ticketId: "TKT-8701",
    setupId: "SET-1104",
    developer: "Ravi Menon",
    targetRelease: "REL-4.8.0",
    targetDate: "24 Jul 2026",
    createdOn: "15 Jul 2026",
    dataLoss: true,
    securityRestricted: false,
    posBilling: true,
    reopenCount: 0,
    failCount: 0,
    ctoApproval: "Approved",
    fixes: [
      {
        rootCause: "Offline sequence reused the last online invoice number instead of a reserved block.",
        components: "pos-offline-store, invoice-sequencer",
        summary: "Reserve an offline invoice block per terminal and reconcile on sync.",
        risk: "High",
        dbChange: true,
        securityImpact: false,
        regressionAreas: "Offline billing, sync, day-close, GST report",
        selfTest: "Simulated 50 offline bills across 2 terminals, no duplicates.",
        targetRelease: "REL-4.8.0",
        notes: "Migration adds terminal_block table.",
        attempt: 1,
        savedOn: "20 Jul 2026",
      },
    ],
    tests: [
      mkTest("TC-01", "Data Testing", "No duplicate invoice numbers after sync", "Passed"),
      mkTest("TC-02", "Regression Testing", "Day-close report totals unchanged", "Passed"),
      mkTest("TC-03", "User Acceptance Testing", "Store owner confirms billing normal", "Passed"),
    ],
    history: [
      { on: "15 Jul 2026", who: "Technical Support", what: "Bug reported from TKT-8701" },
      { on: "24 Jul 2026", who: "CTO", what: "High-risk fix approved for REL-4.8.0" },
      { on: "25 Jul 2026", who: "Requester", what: "Confirmed fix, bug closed" },
    ],
    audit: [
      { on: "24 Jul 2026", who: "CTO", what: "CTO approval granted" },
      { on: "25 Jul 2026", who: "Ravi Menon", what: "Status changed Resolved → Closed" },
    ],
    closure: {
      note: "Offline invoice block reservation released; store verified two days of billing without duplicates.",
      release: "REL-4.8.0",
      confirmedBy: "Technical Support (TKT-8701)",
    },
  },
  {
    id: "BUG-2042",
    title: "Customer App order status stuck at 'Picked Up'",
    description: "Status does not advance to 'In Process' even after the store updates it in POS.",
    area: "Customer App",
    severity: "Medium",
    priority: "P3",
    status: "Testing",
    environment: "Staging",
    version: "Customer App 3.4.1",
    device: "iOS 18",
    steps: "1. Place order\n2. Store marks In Process in POS\n3. Refresh app",
    expected: "Status shows In Process",
    actual: "Status remains Picked Up",
    errorMessage: "—",
    evidence: "status-stuck.png",
    frequency: "Often",
    impact: "Customer calls the store to ask about status.",
    affected: ["Mumbai Andheri", "Delhi Rajouri"],
    storeCount: 2,
    ticketId: "TKT-8825",
    developer: "Aditi Shah",
    targetRelease: "REL-3.4.2",
    targetDate: "07 Aug 2026",
    createdOn: "30 Jul 2026",
    dataLoss: false,
    securityRestricted: false,
    posBilling: false,
    reopenCount: 0,
    failCount: 0,
    ctoApproval: "Not Required",
    fixes: [
      {
        rootCause: "Status webhook filtered out events raised by the POS offline queue.",
        components: "order-status-webhook",
        summary: "Accept queued POS events and de-duplicate by event id.",
        risk: "Medium",
        dbChange: false,
        securityImpact: false,
        regressionAreas: "Order notifications, delivery status",
        selfTest: "Replayed 20 queued events on staging.",
        targetRelease: "REL-3.4.2",
        notes: "—",
        attempt: 1,
        savedOn: "01 Aug 2026",
      },
    ],
    tests: [
      mkTest("TC-01", "Integration Testing", "Queued POS event updates app status", "Passed"),
      mkTest("TC-02", "Mobile Testing", "Status refresh on iOS and Android", "Not Run"),
    ],
    history: [{ on: "30 Jul 2026", who: "RM Team", what: "Bug reported" }],
    audit: [{ on: "30 Jul 2026", who: "CTO", what: "Assigned developer: Aditi Shah" }],
  },
  {
    id: "BUG-2029",
    title: "Reports export times out for 12 month range",
    description: "Sales report export fails when the range exceeds six months.",
    area: "API or Integration",
    severity: "Medium",
    priority: "P3",
    status: "Duplicate",
    environment: "Production",
    version: "CRM 3.2.0",
    device: "Desktop",
    steps: "1. Reports\n2. Select 12 months\n3. Export",
    expected: "File downloads",
    actual: "Gateway timeout after 60 seconds",
    errorMessage: "504 Gateway Timeout",
    evidence: "timeout.png",
    frequency: "Always",
    impact: "Accounts team cannot pull annual data.",
    affected: ["Accounts team"],
    storeCount: 0,
    developer: undefined,
    targetRelease: "—",
    targetDate: "—",
    createdOn: "26 Jul 2026",
    dataLoss: false,
    securityRestricted: false,
    posBilling: false,
    reopenCount: 0,
    failCount: 0,
    duplicateOf: "BUG-2011",
    ctoApproval: "Not Required",
    fixes: [],
    tests: [],
    history: [{ on: "26 Jul 2026", who: "CTO", what: "Linked as duplicate of BUG-2011" }],
    audit: [{ on: "26 Jul 2026", who: "CTO", what: "Status changed Triage → Duplicate (master BUG-2011)" }],
  },
];

/* -------------------------------- helpers -------------------------------- */

const now = () =>
  new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function severityClass(s: Bug["severity"]) {
  if (s === "Critical") return "bg-destructive text-destructive-foreground";
  if (s === "High") return "bg-amber-600 text-white";
  if (s === "Medium") return "bg-blue-600 text-white";
  return "bg-muted text-muted-foreground";
}

function statusClass(s: BugStatus) {
  switch (s) {
    case "Failed":
      return "bg-destructive text-destructive-foreground";
    case "Bug Reported":
    case "Triage":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
    case "Testing":
    case "Ready for Testing":
    case "Awaiting Approval":
      return "bg-amber-500 text-white";
    case "Accepted":
    case "Fix in Progress":
      return "bg-blue-600 text-white";
    case "Passed":
    case "Resolved":
    case "Closed":
      return "bg-emerald-600 text-white";
    case "Reopened":
      return "bg-destructive/80 text-destructive-foreground";
    case "Duplicate":
    case "Deferred":
    case "Cannot Reproduce":
    case "Cancelled":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

const TABS = [
  "All",
  "New",
  "Critical",
  "Fix in Progress",
  "Ready for Testing",
  "Testing Failed",
  "Passed",
  "Reopened",
  "Closed",
] as const;

function inTab(b: Bug, tab: (typeof TABS)[number]) {
  switch (tab) {
    case "All":
      return true;
    case "New":
      return b.status === "Bug Reported" || b.status === "Triage";
    case "Critical":
      return b.severity === "Critical" && b.status !== "Closed";
    case "Fix in Progress":
      return b.status === "Fix in Progress" || b.status === "Accepted";
    case "Ready for Testing":
      return b.status === "Ready for Testing" || b.status === "Testing";
    case "Testing Failed":
      return b.status === "Failed";
    case "Passed":
      return b.status === "Passed" || b.status === "Awaiting Approval" || b.status === "Resolved";
    case "Reopened":
      return b.status === "Reopened";
    case "Closed":
      return b.status === "Closed";
  }
}

function attentionFlags(b: Bug) {
  const flags: { label: string; tone: "security" | "critical" | "warn" }[] = [];
  if (b.dataLoss || b.securityRestricted) flags.push({ label: "Data-loss / security concern", tone: "security" });
  if (b.severity === "Critical" && b.environment === "Production" && b.status !== "Closed")
    flags.push({ label: "Critical production bug", tone: "critical" });
  if (b.posBilling && b.status !== "Closed") flags.push({ label: "POS billing failure", tone: "critical" });
  if (b.storeCount > 1 && b.status !== "Closed") flags.push({ label: `Affects ${b.storeCount} stores`, tone: "warn" });
  if (b.failCount >= 2) flags.push({ label: "Testing failed repeatedly", tone: "critical" });
  if (b.reopenCount > 0) flags.push({ label: "Bug reopened", tone: "warn" });
  if (b.severity === "Critical" && !b.developer) flags.push({ label: "Critical bug without developer", tone: "critical" });
  if (b.targetDate !== "—" && new Date(b.targetDate) < new Date("2026-08-04") && !["Closed", "Resolved", "Deferred"].includes(b.status))
    flags.push({ label: "Overdue for target release", tone: "warn" });
  if (
    b.fixes.length > 0 &&
    !b.tests.some((t) => t.type === "Regression Testing" && t.result === "Passed") &&
    ["Ready for Testing", "Passed", "Awaiting Approval", "Resolved"].includes(b.status)
  )
    flags.push({ label: "Fix completed without regression testing", tone: "warn" });
  return flags;
}

function flagClass(tone: "security" | "critical" | "warn") {
  if (tone === "security") return "bg-red-950 text-red-50 border-red-900";
  if (tone === "critical") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
}

/* -------------------------------- component ------------------------------ */

export function DevBugs() {
  const [bugs, setBugs] = useState<Bug[]>(SAMPLE);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [q, setQ] = useState("");
  const [fPriority, setFPriority] = useState("all");
  const [fSeverity, setFSeverity] = useState("all");
  const [fArea, setFArea] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fDev, setFDev] = useState("all");
  const [fStore, setFStore] = useState("all");
  const [fTicket, setFTicket] = useState("all");
  const [fProject, setFProject] = useState("all");
  const [fRelease, setFRelease] = useState("all");
  const [fDate, setFDate] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const stores = useMemo(
    () => Array.from(new Set(bugs.flatMap((b) => b.affected))).sort(),
    [bugs],
  );
  const releases = useMemo(() => Array.from(new Set(bugs.map((b) => b.targetRelease))).sort(), [bugs]);

  const filtered = useMemo(
    () =>
      bugs.filter((b) => {
        if (!inTab(b, tab)) return false;
        if (q && !`${b.id} ${b.title} ${b.area} ${b.ticketId ?? ""} ${b.taskId ?? ""}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (fPriority !== "all" && b.priority !== fPriority) return false;
        if (fSeverity !== "all" && b.severity !== fSeverity) return false;
        if (fArea !== "all" && b.area !== fArea) return false;
        if (fStatus !== "all" && b.status !== fStatus) return false;
        if (fDev !== "all" && (b.developer ?? "Unassigned") !== fDev) return false;
        if (fStore !== "all" && !b.affected.includes(fStore)) return false;
        if (fTicket !== "all" && (fTicket === "linked" ? !b.ticketId : !!b.ticketId)) return false;
        if (fProject !== "all" && (fProject === "linked" ? !b.taskId : !!b.taskId)) return false;
        if (fRelease !== "all" && b.targetRelease !== fRelease) return false;
        if (fDate !== "all") {
          const d = new Date(b.createdOn);
          const days = (new Date("2026-08-04").getTime() - d.getTime()) / 86400000;
          if (fDate === "7" && days > 7) return false;
          if (fDate === "30" && days > 30) return false;
          if (fDate === "older" && days <= 30) return false;
        }
        return true;
      }),
    [bugs, tab, q, fPriority, fSeverity, fArea, fStatus, fDev, fStore, fTicket, fProject, fRelease, fDate],
  );

  const open = bugs.find((b) => b.id === openId) ?? null;

  const patch = (id: string, fn: (b: Bug) => Bug) =>
    setBugs((prev) => prev.map((b) => (b.id === id ? fn(b) : b)));

  const stat = {
    critical: bugs.filter((b) => b.severity === "Critical" && b.status !== "Closed").length,
    fresh: bugs.filter((b) => b.status === "Bug Reported" || b.status === "Triage").length,
    fixing: bugs.filter((b) => b.status === "Fix in Progress" || b.status === "Accepted").length,
    ready: bugs.filter((b) => b.status === "Ready for Testing" || b.status === "Testing").length,
    failed: bugs.filter((b) => b.status === "Failed").length,
    reopened: bugs.filter((b) => b.status === "Reopened").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHead
          title="Bugs & Testing"
          sub="Record bugs, reproduce issues, complete fixes, run tests and obtain confirmation before closure or release."
        />
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Bug
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Critical Bugs" value={String(stat.critical)} tone="bad" />
        <StatCard label="New Bugs" value={String(stat.fresh)} tone="warn" />
        <StatCard label="Fix in Progress" value={String(stat.fixing)} />
        <StatCard label="Ready for Testing" value={String(stat.ready)} tone="warn" />
        <StatCard label="Testing Failed" value={String(stat.failed)} tone="bad" />
        <StatCard label="Reopened" value={String(stat.reopened)} tone="bad" />
      </div>

      {/* tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${
              tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
            }`}
          >
            {t} <span className="opacity-70">({bugs.filter((b) => inTab(b, t)).length})</span>
          </button>
        ))}
      </div>

      {/* filters */}
      <Card>
        <CardContent className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="col-span-2 md:col-span-3 lg:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search bug ID, title, ticket…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <FilterSelect label="Priority" value={fPriority} onChange={setFPriority} options={[...PRIORITIES]} />
          <FilterSelect label="Severity" value={fSeverity} onChange={setFSeverity} options={[...SEVERITIES]} />
          <FilterSelect label="System area" value={fArea} onChange={setFArea} options={[...SYSTEM_AREAS]} />
          <FilterSelect label="Bug status" value={fStatus} onChange={setFStatus} options={[...BUG_FLOW, ...BUG_ALT]} />
          <FilterSelect label="Developer" value={fDev} onChange={setFDev} options={DEVS} />
          <FilterSelect label="Related store" value={fStore} onChange={setFStore} options={stores} />
          <FilterSelect
            label="Related ticket"
            value={fTicket}
            onChange={setFTicket}
            options={[
              { value: "linked", label: "Linked to a ticket" },
              { value: "none", label: "No ticket link" },
            ]}
          />
          <FilterSelect
            label="Related project"
            value={fProject}
            onChange={setFProject}
            options={[
              { value: "linked", label: "Linked to a task" },
              { value: "none", label: "No task link" },
            ]}
          />
          <FilterSelect label="Target release" value={fRelease} onChange={setFRelease} options={releases} />
          <FilterSelect
            label="Created date"
            value={fDate}
            onChange={setFDate}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "older", label: "Older than 30 days" },
            ]}
          />
        </CardContent>
      </Card>

      {/* desktop table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left p-3">Bug</th>
                <th className="text-left p-3">Area</th>
                <th className="text-left p-3">Severity</th>
                <th className="text-left p-3">Priority</th>
                <th className="text-left p-3">Linked</th>
                <th className="text-left p-3">Affected</th>
                <th className="text-left p-3">Developer</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Release</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.id} · {b.createdOn}
                    </div>
                    {attentionFlags(b).slice(0, 2).map((f) => (
                      <span key={f.label} className={`inline-block mt-1 mr-1 rounded border px-1.5 py-0.5 text-[10px] ${flagClass(f.tone)}`}>
                        {f.label}
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-xs">{b.area}</td>
                  <td className="p-3">
                    <Badge className={severityClass(b.severity)}>{b.severity}</Badge>
                  </td>
                  <td className="p-3 text-xs">{b.priority}</td>
                  <td className="p-3 text-xs">
                    {b.ticketId ?? b.taskId ?? b.setupId ?? "—"}
                    {b.duplicateOf && <div className="text-muted-foreground">dup of {b.duplicateOf}</div>}
                  </td>
                  <td className="p-3 text-xs">{b.storeCount ? `${b.storeCount} store(s)` : b.affected[0] ?? "—"}</td>
                  <td className="p-3 text-xs">{b.developer ?? <span className="text-destructive">Unassigned</span>}</td>
                  <td className="p-3">
                    <Badge className={statusClass(b.status)}>{b.status}</Badge>
                  </td>
                  <td className="p-3 text-xs">{b.targetRelease}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setOpenId(b.id)}>
                      View Bug
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">
                    No bugs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* mobile cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium leading-tight">{b.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.id} · {b.area}
                  </div>
                </div>
                <Badge className={severityClass(b.severity)}>{b.severity}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge className={statusClass(b.status)}>{b.status}</Badge>
                <Badge variant="outline">{b.priority}</Badge>
                <Badge variant="outline">{b.targetRelease}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Linked: {b.ticketId ?? b.taskId ?? b.setupId ?? "—"} · Affected: {b.storeCount ? `${b.storeCount} store(s)` : "—"} ·{" "}
                {b.developer ?? "Unassigned"}
              </div>
              {attentionFlags(b).map((f) => (
                <div key={f.label} className={`rounded border px-2 py-1 text-[11px] ${flagClass(f.tone)}`}>
                  {f.label}
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(b.id)}>
                View Bug
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">No bugs match the selected filters.</CardContent>
          </Card>
        )}
      </div>

      <BugDrawer bug={open} onClose={() => setOpenId(null)} patch={patch} allBugs={bugs} />
      <AddBugDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={bugs}
        onCreate={(b) => {
          setBugs((prev) => [b, ...prev]);
          toast.success(`${b.id} created`, { description: "Permanent Bug ID assigned." });
        }}
      />
    </div>
  );
}

/* ------------------------------ filter select ---------------------------- */

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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: All</SelectItem>
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
  );
}

/* -------------------------------- drawer --------------------------------- */

function BugDrawer({
  bug,
  onClose,
  patch,
  allBugs,
}: {
  bug: Bug | null;
  onClose: () => void;
  patch: (id: string, fn: (b: Bug) => Bug) => void;
  allBugs: Bug[];
}) {
  const [fix, setFix] = useState<Partial<FixDetails>>({});
  const [closureNote, setClosureNote] = useState("");
  const [closureRelease, setClosureRelease] = useState("");
  const [confirmedBy, setConfirmedBy] = useState("");
  const [ticketUpdated, setTicketUpdated] = useState(false);
  const [storesIdentified, setStoresIdentified] = useState(false);
  const [failNote, setFailNote] = useState("");

  if (!bug) return null;
  const b = bug;
  const flags = attentionFlags(b);
  const mandatoryTests = b.tests.filter((t) => t.mandatory);
  const mandatoryPassed = mandatoryTests.length > 0 && mandatoryTests.every((t) => t.result === "Passed");
  const latestFix = b.fixes[b.fixes.length - 1];

  const log = (bg: Bug, what: string, who = "Developer"): Bug => ({
    ...bg,
    history: [...bg.history, { on: now(), who, what }],
    audit: [...bg.audit, { on: now(), who, what }],
  });

  const setStatus = (s: BugStatus, msg: string) => {
    patch(b.id, (x) => ({ ...log(x, `Status changed ${x.status} → ${s}`), status: s }));
    toast.success(msg);
  };

  const runTest = (tcId: string, result: "Passed" | "Failed") => {
    if (result === "Failed" && !failNote.trim()) {
      toast.error("Add tester comments before recording a failed test.");
      return;
    }
    patch(b.id, (x) => {
      const updated = log(
        x,
        `Test ${tcId} recorded as ${result}${result === "Failed" ? ` — ${failNote}` : ""}`,
        "Aditi Shah (Tester)",
      );
      const tests = updated.tests.map((t) =>
        t.id === tcId
          ? {
              ...t,
              result,
              actual: result === "Passed" ? "Matches expected result" : failNote,
              testedBy: "Aditi Shah",
              testDate: now(),
              evidence: result === "Failed" ? "failed-step-evidence.png" : "test-evidence.png",
            }
          : t,
      );
      const failed = result === "Failed";
      return {
        ...updated,
        tests,
        failCount: failed ? updated.failCount + 1 : updated.failCount,
        status: failed ? "Fix in Progress" : tests.every((t) => !t.mandatory || t.result === "Passed") ? "Passed" : "Testing",
      };
    });
    if (result === "Failed") {
      toast.error(`${tcId} failed — bug returned to Fix in Progress`, {
        description: "Previous fix and earlier test results are preserved. Assigned developer notified.",
      });
      setFailNote("");
    } else {
      toast.success(`${tcId} passed`);
    }
  };

  const saveFix = () => {
    if (!fix.rootCause || !fix.summary || !fix.regressionAreas || !fix.selfTest) {
      toast.error("Root cause, fix summary, regression areas and self-test are required.");
      return;
    }
    patch(b.id, (x) => {
      const entry: FixDetails = {
        rootCause: fix.rootCause!,
        components: fix.components ?? "—",
        summary: fix.summary!,
        risk: (fix.risk as FixDetails["risk"]) ?? "Low",
        dbChange: !!fix.dbChange,
        securityImpact: !!fix.securityImpact,
        regressionAreas: fix.regressionAreas!,
        selfTest: fix.selfTest!,
        targetRelease: fix.targetRelease ?? x.targetRelease,
        notes: fix.notes ?? "—",
        attempt: x.fixes.length + 1,
        savedOn: now(),
      };
      const highRisk = entry.risk === "High" || entry.securityImpact || entry.dbChange;
      return {
        ...log(x, `Fix attempt ${entry.attempt} recorded (risk ${entry.risk})`),
        fixes: [...x.fixes, entry],
        status: "Ready for Testing",
        ctoApproval: highRisk ? "Pending" : x.ctoApproval,
      };
    });
    setFix({});
    toast.success("Fix recorded — bug moved to Ready for Testing");
  };

  const closeBug = () => {
    if (!latestFix) return toast.error("Fix must be completed before closure.");
    if (!mandatoryPassed) return toast.error("All mandatory tests must pass before closure.");
    if (!ticketUpdated) return toast.error("Confirm the related ticket has been updated.");
    if (!storesIdentified) return toast.error("Confirm affected stores have been identified.");
    if (!closureRelease.trim()) return toast.error("Release reference is required.");
    if (!confirmedBy.trim()) return toast.error("Requester or tester confirmation is required.");
    if (!closureNote.trim()) return toast.error("Resolution note is required.");
    if ((latestFix.risk === "High" || latestFix.securityImpact) && b.ctoApproval !== "Approved")
      return toast.error("High-risk fix needs CTO approval before release.");
    patch(b.id, (x) => ({
      ...log(x, `Bug closed against ${closureRelease}, confirmed by ${confirmedBy}`),
      status: "Closed",
      closure: { note: closureNote, release: closureRelease, confirmedBy },
    }));
    toast.success(`${b.id} closed`, {
      description: "Related store tickets remain open until the requester confirms each one.",
    });
  };

  return (
    <Sheet open={!!bug} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex flex-wrap items-center gap-2">
            <BugIcon className="h-4 w-4" /> {b.id}
            <Badge className={severityClass(b.severity)}>{b.severity}</Badge>
            <Badge className={statusClass(b.status)}>{b.status}</Badge>
          </SheetTitle>
          <SheetDescription>{b.title}</SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-5">
          {b.securityRestricted && (
            <div className="rounded-md border border-red-900 bg-red-950 text-red-50 p-3 text-xs flex gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                Security-restricted bug — visible to authorised users only. Customer, payment and personal data are masked. Never paste
                passwords, tokens, API keys or production secrets here.
              </span>
            </div>
          )}

          {flags.length > 0 && (
            <div className="space-y-1">
              {flags.map((f) => (
                <div key={f.label} className={`rounded border px-2 py-1.5 text-xs flex items-center gap-2 ${flagClass(f.tone)}`}>
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {f.label}
                </div>
              ))}
            </div>
          )}

          {/* details */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Bug details</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Info k="System area" v={b.area} />
              <Info k="Environment" v={b.environment} />
              <Info k="App / software version" v={b.version} />
              <Info k="Device & OS" v={b.device} />
              <Info k="Frequency" v={b.frequency} />
              <Info k="Priority" v={b.priority} />
              <Info k="Related Ticket ID" v={b.ticketId ?? "—"} />
              <Info k="Related Task ID" v={b.taskId ?? "—"} />
              <Info k="Assigned developer" v={b.developer ?? "Unassigned"} />
              <Info k="Target release" v={`${b.targetRelease} (${b.targetDate})`} />
              <Info k="Affected stores / users" v={b.affected.join(", ")} />
              <Info k="Reported on" v={b.createdOn} />
            </div>
            <Field k="Description" v={b.description} />
            <Field k="Steps to reproduce" v={b.steps} />
            <Field k="Expected result" v={b.expected} />
            <Field k="Actual result" v={b.actual} />
            <Field k="Error message" v={b.errorMessage} />
            <Field k="Business impact" v={b.impact} />
            <Field k="Screenshots / video" v={b.evidence} />
            {b.duplicateOf && <Field k="Duplicate of" v={`${b.duplicateOf} (master bug)`} />}
            {b.deferReason && <Field k="Deferred because" v={b.deferReason} />}
          </section>

          <Separator />

          {/* triage */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Triage actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setStatus("Accepted", "Bug accepted")}>
                Accept Bug
              </Button>
              <Select
                onValueChange={(v) => {
                  patch(b.id, (x) => ({ ...log(x, `Severity changed ${x.severity} → ${v}`), severity: v as Bug["severity"] }));
                  toast.success(`Severity set to ${v}`);
                }}
              >
                <SelectTrigger className="h-8 w-[150px] text-xs">
                  <SelectValue placeholder="Change severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) => {
                  patch(b.id, (x) => ({ ...log(x, `Assigned developer: ${v}`), developer: v === "Unassigned" ? undefined : v }));
                  toast.success(`Assigned to ${v}`);
                }}
              >
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue placeholder="Assign developer" />
                </SelectTrigger>
                <SelectContent>
                  {DEVS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) => {
                  patch(b.id, (x) => ({ ...log(x, `Linked as duplicate of ${v}`), status: "Duplicate", duplicateOf: v }));
                  toast.success(`Linked to master ${v}`, { description: "No new bug created for the same confirmed issue." });
                }}
              >
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue placeholder="Link duplicate" />
                </SelectTrigger>
                <SelectContent>
                  {allBugs
                    .filter((x) => x.id !== b.id)
                    .map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  patch(b.id, (x) => log(x, "Information requested from reporter"));
                  toast.info("Information requested from the reporter");
                }}
              >
                Request Information
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("Cannot Reproduce", "Marked cannot reproduce")}>
                Cannot Reproduce
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const reason = "Low impact — bundled with a future release";
                  patch(b.id, (x) => ({ ...log(x, `Deferred: ${reason}`), status: "Deferred", deferReason: reason }));
                  toast.success("Bug deferred with reason recorded");
                }}
              >
                Defer with Reason
              </Button>
              <Button size="sm" onClick={() => setStatus("Fix in Progress", "Fix started")}>
                Start Fix
              </Button>
            </div>
          </section>

          <Separator />

          {/* fix details */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Fix details</h3>
            {b.fixes.map((f) => (
              <div key={f.attempt} className="rounded-md border p-3 text-xs space-y-1 bg-muted/30">
                <div className="font-medium">
                  Attempt {f.attempt} · {f.savedOn} · Risk {f.risk}
                </div>
                <div>
                  <span className="text-muted-foreground">Root cause: </span>
                  {f.rootCause}
                </div>
                <div>
                  <span className="text-muted-foreground">Components: </span>
                  {f.components}
                </div>
                <div>
                  <span className="text-muted-foreground">Fix summary: </span>
                  {f.summary}
                </div>
                <div>
                  <span className="text-muted-foreground">DB change: </span>
                  {f.dbChange ? "Yes" : "No"} · <span className="text-muted-foreground">Security impact: </span>
                  {f.securityImpact ? "Yes" : "No"}
                </div>
                <div>
                  <span className="text-muted-foreground">Regression areas: </span>
                  {f.regressionAreas}
                </div>
                <div>
                  <span className="text-muted-foreground">Self-test: </span>
                  {f.selfTest}
                </div>
                <div>
                  <span className="text-muted-foreground">Target release: </span>
                  {f.targetRelease} · <span className="text-muted-foreground">Notes: </span>
                  {f.notes}
                </div>
              </div>
            ))}

            <div className="rounded-md border p-3 space-y-2">
              <div className="text-xs font-medium">Record a new fix attempt</div>
              <Textarea
                placeholder="Root cause *"
                value={fix.rootCause ?? ""}
                onChange={(e) => setFix({ ...fix, rootCause: e.target.value })}
              />
              <Input
                placeholder="Components affected"
                value={fix.components ?? ""}
                onChange={(e) => setFix({ ...fix, components: e.target.value })}
              />
              <Textarea
                placeholder="Fix summary *"
                value={fix.summary ?? ""}
                onChange={(e) => setFix({ ...fix, summary: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={fix.risk ?? ""} onValueChange={(v) => setFix({ ...fix, risk: v as FixDetails["risk"] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Target release"
                  value={fix.targetRelease ?? ""}
                  onChange={(e) => setFix({ ...fix, targetRelease: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <Checkbox checked={!!fix.dbChange} onCheckedChange={(c) => setFix({ ...fix, dbChange: !!c })} /> Database change involved
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={!!fix.securityImpact} onCheckedChange={(c) => setFix({ ...fix, securityImpact: !!c })} /> Security
                  impact
                </label>
              </div>
              <Input
                placeholder="Regression areas *"
                value={fix.regressionAreas ?? ""}
                onChange={(e) => setFix({ ...fix, regressionAreas: e.target.value })}
              />
              <Input
                placeholder="Developer self-test *"
                value={fix.selfTest ?? ""}
                onChange={(e) => setFix({ ...fix, selfTest: e.target.value })}
              />
              <Textarea
                placeholder="Technical notes (never include passwords, tokens or API keys)"
                value={fix.notes ?? ""}
                onChange={(e) => setFix({ ...fix, notes: e.target.value })}
              />
              <Button size="sm" onClick={saveFix}>
                Save fix & send for testing
              </Button>
            </div>

            {latestFix && (latestFix.risk === "High" || latestFix.securityImpact) && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs flex items-center justify-between gap-2">
                <span>High-risk fix — CTO approval required before release. Status: {b.ctoApproval}</span>
                {b.ctoApproval !== "Approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      patch(b.id, (x) => ({ ...log(x, "CTO approval granted", "CTO"), ctoApproval: "Approved" }));
                      toast.success("CTO approval recorded");
                    }}
                  >
                    Record CTO approval
                  </Button>
                )}
              </div>
            )}
          </section>

          <Separator />

          {/* testing */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Test cases
            </h3>
            <Textarea
              placeholder="Tester comments (required when recording a failed test)"
              value={failNote}
              onChange={(e) => setFailNote(e.target.value)}
            />
            {b.tests.length === 0 && <div className="text-xs text-muted-foreground">No test cases recorded yet.</div>}
            {b.tests.map((t) => (
              <div key={t.id} className="rounded-md border p-3 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">
                    {t.id} · {t.type} {t.mandatory && <span className="text-destructive">*</span>}
                  </div>
                  <Badge
                    className={
                      t.result === "Passed"
                        ? "bg-emerald-600 text-white"
                        : t.result === "Failed"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {t.result}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Objective: </span>
                  {t.objective}
                </div>
                <div>
                  <span className="text-muted-foreground">Preconditions: </span>
                  {t.preconditions}
                </div>
                <div className="whitespace-pre-wrap">
                  <span className="text-muted-foreground">Steps: </span>
                  {t.steps}
                </div>
                <div>
                  <span className="text-muted-foreground">Expected: </span>
                  {t.expected}
                </div>
                <div>
                  <span className="text-muted-foreground">Actual: </span>
                  {t.actual}
                </div>
                <div className="text-muted-foreground">
                  Tested by {t.testedBy} · {t.testDate} · Evidence: {t.evidence}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => runTest(t.id, "Passed")}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Passed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => runTest(t.id, "Failed")}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Mark Failed
                  </Button>
                </div>
              </div>
            ))}
            <Select
              onValueChange={(v) => {
                patch(b.id, (x) => ({
                  ...log(x, `Test case added: ${v}`),
                  tests: [
                    ...x.tests,
                    mkTest(`TC-${String(x.tests.length + 1).padStart(2, "0")}`, v as TestCase["type"], `${v} for ${x.id}`, "Not Run"),
                  ],
                }));
                toast.success("Test case added");
              }}
            >
              <SelectTrigger className="h-8 w-full sm:w-[260px] text-xs">
                <SelectValue placeholder="Add test case (testing type)" />
              </SelectTrigger>
              <SelectContent>
                {TESTING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <Separator />

          {/* closure */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Bug closure</h3>
            <ul className="text-xs space-y-1">
              <Gate ok={!!latestFix} text="Fix completed" />
              <Gate ok={mandatoryPassed} text="Mandatory tests passed" />
              <Gate ok={ticketUpdated} text="Related ticket updated" />
              <Gate ok={storesIdentified} text="Related stores identified" />
              <Gate ok={!!closureRelease.trim()} text="Release reference added" />
              <Gate ok={!!confirmedBy.trim()} text="Requester or tester confirmation" />
              <Gate ok={!!closureNote.trim()} text="Resolution note completed" />
            </ul>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2">
                <Checkbox checked={ticketUpdated} onCheckedChange={(c) => setTicketUpdated(!!c)} /> Related ticket / task / setup updated
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={storesIdentified} onCheckedChange={(c) => setStoresIdentified(!!c)} /> Affected stores identified
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Release reference" value={closureRelease} onChange={(e) => setClosureRelease(e.target.value)} />
              <Input placeholder="Confirmed by (requester / tester)" value={confirmedBy} onChange={(e) => setConfirmedBy(e.target.value)} />
            </div>
            <Textarea placeholder="Resolution note" value={closureNote} onChange={(e) => setClosureNote(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setStatus("Awaiting Approval", "Sent for approval")}>
                Send for Approval
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("Resolved", "Marked resolved")}>
                Mark Resolved
              </Button>
              <Button size="sm" onClick={closeBug}>
                Close Bug
              </Button>
              {b.status === "Closed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    patch(b.id, (x) => ({ ...log(x, "Bug reopened by requester (same Bug ID)", "Requester"), status: "Reopened", reopenCount: x.reopenCount + 1 }));
                    toast.warning(`${b.id} reopened`, { description: "Same Bug ID retained, full history preserved." });
                  }}
                >
                  Reopen
                </Button>
              )}
            </div>
            {b.closure && (
              <div className="rounded-md border bg-emerald-500/10 border-emerald-500/30 p-3 text-xs space-y-1">
                <div>
                  <span className="text-muted-foreground">Release: </span>
                  {b.closure.release}
                </div>
                <div>
                  <span className="text-muted-foreground">Confirmed by: </span>
                  {b.closure.confirmedBy}
                </div>
                <div>
                  <span className="text-muted-foreground">Resolution: </span>
                  {b.closure.note}
                </div>
              </div>
            )}
          </section>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold mb-2">Activity history</h3>
              <div className="space-y-1 text-xs">
                {b.history.map((h, i) => (
                  <div key={i} className="rounded border p-2">
                    <div className="text-muted-foreground">
                      {h.on} · {h.who}
                    </div>
                    <div>{h.what}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Audit log</h3>
              <div className="space-y-1 text-xs">
                {b.audit.map((h, i) => (
                  <div key={i} className="rounded border p-2 bg-muted/30">
                    <div className="text-muted-foreground">
                      {h.on} · {h.who}
                    </div>
                    <div>{h.what}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded border p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
      <div>{v}</div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-xs">
      <div className="text-muted-foreground">{k}</div>
      <div className="whitespace-pre-wrap">{v}</div>
    </div>
  );
}

function Gate({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-emerald-600" : "text-muted-foreground"}`}>
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {text}
    </li>
  );
}

/* ------------------------------- add dialog ------------------------------ */

function AddBugDialog({
  open,
  onOpenChange,
  existing,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing: Bug[];
  onCreate: (b: Bug) => void;
}) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<Bug["area"]>("POS");
  const [severity, setSeverity] = useState<Bug["severity"]>("Medium");
  const [priority, setPriority] = useState<Bug["priority"]>("P3");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [store, setStore] = useState("");

  const dup = existing.find((b) => title.trim().length > 6 && b.title.toLowerCase().includes(title.trim().toLowerCase().slice(0, 12)));

  const submit = () => {
    if (!title.trim() || !steps.trim() || !expected.trim() || !actual.trim()) {
      toast.error("Title, steps to reproduce, expected and actual results are required.");
      return;
    }
    if (dup) {
      toast.error(`Possible duplicate of ${dup.id}`, {
        description: "Link the store ticket to the master Bug ID instead of creating a duplicate.",
      });
      return;
    }
    const id = `BUG-${2045 + existing.length}`;
    onCreate({
      id,
      title,
      description,
      area,
      severity,
      priority,
      status: "Bug Reported",
      environment: "Production",
      version: "—",
      device: "—",
      steps,
      expected,
      actual,
      errorMessage: "—",
      evidence: "—",
      frequency: "Always",
      impact: "—",
      affected: store ? [store] : [],
      storeCount: store ? 1 : 0,
      ticketId: ticketId || undefined,
      taskId: taskId || undefined,
      developer: undefined,
      targetRelease: "—",
      targetDate: "—",
      createdOn: "04 Aug 2026",
      dataLoss: false,
      securityRestricted: false,
      posBilling: area === "POS",
      reopenCount: 0,
      failCount: 0,
      ctoApproval: "Not Required",
      fixes: [],
      tests: [],
      history: [{ on: now(), who: "Developer", what: "Bug reported" }],
      audit: [{ on: now(), who: "Developer", what: `Bug created with permanent ID ${id}` }],
    });
    onOpenChange(false);
    setTitle("");
    setSteps("");
    setExpected("");
    setActual("");
    setDescription("");
    setTicketId("");
    setTaskId("");
    setStore("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bug</DialogTitle>
          <DialogDescription>
            A permanent Bug ID is assigned on creation. Never include passwords, tokens, API keys or production secrets, and mask customer
            or payment data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-xs">Bug title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short, specific summary" />
          {dup && (
            <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs">
              Possible duplicate of <strong>{dup.id}</strong> — link the ticket to that master Bug ID.
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Select value={area} onValueChange={(v) => setArea(v as Bug["area"])}>
              <SelectTrigger>
                <SelectValue placeholder="System area" />
              </SelectTrigger>
              <SelectContent>
                {SYSTEM_AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={(v) => setSeverity(v as Bug["severity"])}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => setPriority(v as Bug["priority"])}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Affected store" value={store} onChange={(e) => setStore(e.target.value)} />
            <Input placeholder="Related Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
            <Input placeholder="Related Task ID" value={taskId} onChange={(e) => setTaskId(e.target.value)} />
          </div>
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Textarea placeholder="Steps to reproduce *" value={steps} onChange={(e) => setSteps(e.target.value)} />
          <Input placeholder="Expected result *" value={expected} onChange={(e) => setExpected(e.target.value)} />
          <Input placeholder="Actual result *" value={actual} onChange={(e) => setActual(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create Bug</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* keep severity legend exported for reuse */
export const SEVERITY_GUIDE: Record<string, string> = {
  Critical: "Security risk, data loss, system unavailable or billing stopped",
  High: "Major feature unavailable with serious impact",
  Medium: "Feature affected but workaround available",
  Low: "Minor visual or usability issue",
};
