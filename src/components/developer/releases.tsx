import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import { SectionHead, StatCard } from "@/components/smm/ui";
import { toast } from "sonner";
import {
  AlertTriangle,
  ShieldCheck,
  History,
  Rocket,
  RotateCcw,
  Plus,
} from "lucide-react";

/* --------------------------------- model --------------------------------- */

export const RELEASE_STATUSES = [
  "Draft",
  "Development Complete",
  "Testing",
  "Testing Passed",
  "Awaiting CTO Approval",
  "Scheduled",
  "Released",
  "Monitoring",
  "Completed",
  "Testing Failed",
  "Approval Rejected",
  "Release Failed",
  "Rolled Back",
  "Cancelled",
] as const;
type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

const PRODUCTS = [
  "Customer App",
  "Franchise App",
  "POS",
  "Admin Panel",
  "CRM",
  "Website",
  "API or Integration",
  "Database",
  "Other",
] as const;

const RELEASE_TYPES = [
  "New Feature",
  "Improvement",
  "Bug Fix",
  "Security Update",
  "Configuration Update",
  "Emergency Fix",
  "Maintenance",
  "Database Update",
  "Integration Update",
] as const;

const ENVIRONMENTS = ["Development", "Staging", "Production"] as const;
const RISKS = ["Low", "Medium", "High", "Critical"] as const;
const DEVELOPERS = ["Rahul Sharma", "Ankit Verma", "Priya Nair", "Imran Qureshi"] as const;

type Approval =
  | "Approval Not Required"
  | "Awaiting CTO Approval"
  | "Approved"
  | "Rejected"
  | "Changes Requested";

const PRE_RELEASE_CHECKS = [
  "Included work approved",
  "Critical tests passed",
  "No unresolved release blockers",
  "Backup confirmed when required",
  "Database changes reviewed",
  "Security impact reviewed",
  "Store impact reviewed",
  "Release notes completed",
  "Rollback plan completed",
  "CTO approval received",
] as const;

type Release = {
  id: string;
  version: string;
  title: string;
  product: (typeof PRODUCTS)[number];
  type: (typeof RELEASE_TYPES)[number];
  env: (typeof ENVIRONMENTS)[number];
  scheduled: string;
  peakHours?: boolean;
  developer: string;
  status: ReleaseStatus;
  approval: Approval;
  risk: (typeof RISKS)[number];
  downtime: string;
  affected: string;
  description: string;
  linked: string[];
  testing: {
    completed: boolean;
    regression: boolean;
    failedResolved: boolean;
    env: string;
    tester: string;
    results: string;
    evidence: string[];
    limitations: string;
    uat: string;
  };
  plan: {
    steps: string[];
    backup: string;
    migration: string;
    downtime: string;
    communication: string;
    monitoring: string;
    rollbackWhen: string;
    rollbackSteps: string[];
    owner: string;
  };
  checks: Record<string, boolean>;
  monitoring?: {
    health: string;
    errors: number;
    complaints: number;
    reopened: number;
    performance: string;
    from: string;
    to: string;
    outcome: string;
  };
  rollback?: {
    reason: string;
    component: string;
    impact: string;
    start: string;
    end: string;
    systemStatus: string;
    followUp: string;
    ctoAck: string;
  };
  notesInternal: { technical: string; limitations: string; dbConfig: string; support: string };
  notesUser: { changed: string; features: string; improvements: string; fixed: string; action: string };
  history: { at: string; who: string; what: string }[];
};

const allChecks = (v: boolean) =>
  Object.fromEntries(PRE_RELEASE_CHECKS.map((c) => [c, v])) as Record<string, boolean>;

const SAMPLE: Release[] = [
  {
    id: "REL-2041",
    version: "POS v3.4.0",
    title: "POS offline billing sync + printer profiles",
    product: "POS",
    type: "New Feature",
    env: "Production",
    scheduled: "10 Aug 2026, 23:30",
    developer: "Rahul Sharma",
    status: "Awaiting CTO Approval",
    approval: "Awaiting CTO Approval",
    risk: "High",
    downtime: "20 minutes",
    affected: "22 stores, 41 POS terminals",
    description: "Offline billing queue with auto-sync and per-store printer profiles.",
    linked: ["T-312", "BUG-88", "DEV-1041", "SETUP-JAIPUR"],
    testing: {
      completed: true,
      regression: true,
      failedResolved: true,
      env: "Staging",
      tester: "Priya Nair",
      results: "58 test cases run, 58 passed. 3 earlier failures fixed and retested.",
      evidence: ["pos-offline-sync-report.pdf", "printer-profile-screens.png"],
      limitations: "Offline queue limited to 200 bills per terminal.",
      uat: "Completed — Jaipur store owner signed off",
    },
    plan: {
      steps: [
        "Take POS database backup",
        "Deploy POS build to production",
        "Run printer-profile migration",
        "Smoke test billing on 3 pilot stores",
        "Enable for all stores",
      ],
      backup: "Required — full POS DB backup before deployment",
      migration: "1 migration: printer_profiles table + index",
      downtime: "20 minutes, 23:30–23:50 IST (off-peak)",
      communication: "Store WhatsApp broadcast 24h prior + RM briefing",
      monitoring: "48 hours error-rate and complaint monitoring",
      rollbackWhen: "Billing failure rate above 2% or printer errors in 3+ stores",
      rollbackSteps: ["Restore previous POS build", "Restore DB backup", "Notify RM and CTO"],
      owner: "Rahul Sharma",
    },
    checks: { ...allChecks(true), "CTO approval received": false },
    notesInternal: {
      technical: "Local queue in IndexedDB, retry with exponential backoff.",
      limitations: "No multi-terminal merge for same bill number.",
      dbConfig: "New table printer_profiles; config flag pos.offline.enabled.",
      support: "If sync stalls, ask store to reopen POS; queue resumes automatically.",
    },
    notesUser: {
      changed: "Billing now works without internet.",
      features: "Offline billing, saved printer settings per store.",
      improvements: "Faster bill printing.",
      fixed: "Bill print misalignment at Jaipur store.",
      action: "Update POS app and restart the terminal once.",
    },
    history: [
      { at: "1 Aug, 11:20", who: "Rahul Sharma", what: "Release created (Draft)" },
      { at: "3 Aug, 18:05", who: "Priya Nair", what: "Testing passed — 58/58 cases" },
      { at: "4 Aug, 09:40", who: "Rahul Sharma", what: "Submitted for CTO approval" },
    ],
  },
  {
    id: "REL-2040",
    version: "CRM v3.3.3",
    title: "Lead form city field fix",
    product: "CRM",
    type: "Bug Fix",
    env: "Production",
    scheduled: "6 Aug 2026, 19:30",
    peakHours: true,
    developer: "Ankit Verma",
    status: "Scheduled",
    approval: "Approved",
    risk: "Low",
    downtime: "No downtime",
    affected: "Sales team — 14 users",
    description: "Franchise lead form was dropping the city value on submit.",
    linked: ["DEV-1042", "BUG-89"],
    testing: {
      completed: true,
      regression: true,
      failedResolved: true,
      env: "Staging",
      tester: "Imran Qureshi",
      results: "12 cases passed.",
      evidence: ["lead-form-fix.png"],
      limitations: "None",
      uat: "Not required",
    },
    plan: {
      steps: ["Deploy CRM build", "Verify lead submission", "Confirm with Sales Head"],
      backup: "Not required",
      migration: "None",
      downtime: "None",
      communication: "Sales Head informed",
      monitoring: "24 hours",
      rollbackWhen: "Lead submissions fail",
      rollbackSteps: ["Redeploy previous CRM build"],
      owner: "Ankit Verma",
    },
    checks: allChecks(true),
    notesInternal: {
      technical: "Form state key mismatch corrected.",
      limitations: "None",
      dbConfig: "None",
      support: "No action needed from support.",
    },
    notesUser: {
      changed: "City is now saved with every lead.",
      features: "—",
      improvements: "—",
      fixed: "Missing city on franchise enquiries.",
      action: "None",
    },
    history: [
      { at: "2 Aug, 10:00", who: "Ankit Verma", what: "Release created" },
      { at: "3 Aug, 15:30", who: "CTO", what: "Approved for production" },
      { at: "3 Aug, 15:40", who: "Ankit Verma", what: "Scheduled for 6 Aug, 19:30" },
    ],
  },
  {
    id: "REL-2039",
    version: "Admin Panel v2.9.0",
    title: "Store transfer module",
    product: "Admin Panel",
    type: "New Feature",
    env: "Production",
    scheduled: "1 Aug 2026, 22:00",
    developer: "Priya Nair",
    status: "Monitoring",
    approval: "Approved",
    risk: "Medium",
    downtime: "10 minutes",
    affected: "Project Coordinators, 18 projects",
    description: "Transfer a store between Project Managers with full history.",
    linked: ["T-311", "DEV-1044"],
    testing: {
      completed: true,
      regression: true,
      failedResolved: true,
      env: "Staging",
      tester: "Priya Nair",
      results: "34 cases passed.",
      evidence: ["store-transfer-tests.pdf"],
      limitations: "Bulk transfer not supported.",
      uat: "Completed",
    },
    plan: {
      steps: ["Backup", "Deploy", "Verify transfer log"],
      backup: "Completed",
      migration: "store_transfers table",
      downtime: "10 minutes",
      communication: "PC and PM notified",
      monitoring: "72 hours",
      rollbackWhen: "Transfer history corrupted",
      rollbackSteps: ["Restore backup", "Disable module flag"],
      owner: "Priya Nair",
    },
    checks: allChecks(true),
    monitoring: {
      health: "Stable",
      errors: 2,
      complaints: 0,
      reopened: 1,
      performance: "No degradation",
      from: "1 Aug, 22:20",
      to: "—",
      outcome: "Pending",
    },
    notesInternal: {
      technical: "Transfer writes an immutable audit row.",
      limitations: "Single store per transfer.",
      dbConfig: "store_transfers table added.",
      support: "Transfers are visible under project history.",
    },
    notesUser: {
      changed: "Stores can be moved between Project Managers.",
      features: "Store transfer with reason and history.",
      improvements: "Clearer project ownership.",
      fixed: "—",
      action: "None",
    },
    history: [
      { at: "28 Jul", who: "Priya Nair", what: "Release created" },
      { at: "31 Jul", who: "CTO", what: "Approved" },
      { at: "1 Aug, 22:15", who: "Priya Nair", what: "Marked Released" },
      { at: "1 Aug, 22:20", who: "System", what: "Monitoring started" },
    ],
  },
  {
    id: "REL-2038",
    version: "Customer App v1.8.2",
    title: "Push notification service update",
    product: "Customer App",
    type: "Integration Update",
    env: "Production",
    scheduled: "27 Jul 2026, 21:00",
    developer: "Imran Qureshi",
    status: "Rolled Back",
    approval: "Approved",
    risk: "High",
    downtime: "None",
    affected: "All app users",
    description: "Migrate push notifications to the new provider.",
    linked: ["T-309", "BUG-84"],
    testing: {
      completed: true,
      regression: false,
      failedResolved: false,
      env: "Staging",
      tester: "Imran Qureshi",
      results: "Passed in staging, failed under production load.",
      evidence: ["push-test-log.txt"],
      limitations: "Load testing not performed.",
      uat: "Not required",
    },
    plan: {
      steps: ["Switch provider keys", "Deploy app config", "Send test notification"],
      backup: "Config snapshot taken",
      migration: "None",
      downtime: "None",
      communication: "RM team informed",
      monitoring: "24 hours",
      rollbackWhen: "Delivery rate below 90%",
      rollbackSteps: ["Revert provider config", "Redeploy previous build", "Confirm delivery"],
      owner: "Imran Qureshi",
    },
    checks: { ...allChecks(true), "Critical tests passed": false },
    rollback: {
      reason: "Notification delivery dropped to 61% in production",
      component: "Push provider integration",
      impact: "Customers missed order-ready alerts for 2 hours",
      start: "27 Jul, 22:10",
      end: "27 Jul, 22:45",
      systemStatus: "Restored — previous provider active",
      followUp: "T-318 — load-test new provider before retry",
      ctoAck: "Acknowledged by CTO on 28 Jul",
    },
    notesInternal: {
      technical: "Provider SDK throttled bulk sends.",
      limitations: "Retry release planned as v1.8.3.",
      dbConfig: "Provider config reverted.",
      support: "Report any missing alerts to Developer.",
    },
    notesUser: {
      changed: "—",
      features: "—",
      improvements: "—",
      fixed: "—",
      action: "None",
    },
    history: [
      { at: "27 Jul, 21:00", who: "Imran Qureshi", what: "Release started" },
      { at: "27 Jul, 22:05", who: "Imran Qureshi", what: "Marked Failed — delivery drop" },
      { at: "27 Jul, 22:45", who: "Imran Qureshi", what: "Rollback completed (same Release ID)" },
    ],
  },
  {
    id: "REL-2037",
    version: "Database v1.4.0",
    title: "Billing index optimisation",
    product: "Database",
    type: "Database Update",
    env: "Production",
    scheduled: "12 Aug 2026, 02:00",
    developer: "Rahul Sharma",
    status: "Testing",
    approval: "Awaiting CTO Approval",
    risk: "Critical",
    downtime: "35 minutes",
    affected: "All stores",
    description: "Add composite indexes to speed up store billing reports.",
    linked: ["T-320"],
    testing: {
      completed: false,
      regression: false,
      failedResolved: false,
      env: "Staging",
      tester: "Priya Nair",
      results: "In progress — 18 of 30 cases run.",
      evidence: [],
      limitations: "Restore-time test pending.",
      uat: "Not required",
    },
    plan: {
      steps: ["Backup", "Apply index migration", "Verify report timings"],
      backup: "Backup plan not confirmed",
      migration: "3 index migrations",
      downtime: "35 minutes",
      communication: "Draft",
      monitoring: "72 hours",
      rollbackWhen: "Migration exceeds 40 minutes",
      rollbackSteps: ["Drop new indexes", "Restore backup if needed"],
      owner: "Rahul Sharma",
    },
    checks: { ...allChecks(false), "Store impact reviewed": true },
    notesInternal: { technical: "", limitations: "", dbConfig: "", support: "" },
    notesUser: { changed: "", features: "", improvements: "", fixed: "", action: "" },
    history: [{ at: "3 Aug", who: "Rahul Sharma", what: "Release created (Draft)" }],
  },
  {
    id: "REL-2036",
    version: "Website v4.2.1",
    title: "Franchise landing page refresh",
    product: "Website",
    type: "Improvement",
    env: "Production",
    scheduled: "30 Jul 2026, 12:00",
    developer: "Ankit Verma",
    status: "Completed",
    approval: "Approval Not Required",
    risk: "Low",
    downtime: "None",
    affected: "Public website",
    description: "New enquiry section and faster image loading.",
    linked: ["T-305"],
    testing: {
      completed: true,
      regression: true,
      failedResolved: true,
      env: "Staging",
      tester: "Ankit Verma",
      results: "All checks passed.",
      evidence: ["lighthouse.png"],
      limitations: "None",
      uat: "Not required",
    },
    plan: {
      steps: ["Deploy", "Verify forms"],
      backup: "Not required",
      migration: "None",
      downtime: "None",
      communication: "Marketing informed",
      monitoring: "24 hours",
      rollbackWhen: "Enquiry form fails",
      rollbackSteps: ["Redeploy previous build"],
      owner: "Ankit Verma",
    },
    checks: allChecks(true),
    monitoring: {
      health: "Healthy",
      errors: 0,
      complaints: 0,
      reopened: 0,
      performance: "Load time improved 34%",
      from: "30 Jul, 12:10",
      to: "31 Jul, 12:10",
      outcome: "Successful",
    },
    notesInternal: {
      technical: "Images converted to WebP.",
      limitations: "None",
      dbConfig: "None",
      support: "None",
    },
    notesUser: {
      changed: "Refreshed franchise page.",
      features: "New enquiry section.",
      improvements: "Faster page load.",
      fixed: "—",
      action: "None",
    },
    history: [
      { at: "30 Jul, 12:00", who: "Ankit Verma", what: "Released" },
      { at: "31 Jul, 12:10", who: "Ankit Verma", what: "Completed — successful" },
    ],
  },
  {
    id: "REL-2035",
    version: "Franchise App v2.1.0",
    title: "Store report download",
    product: "Franchise App",
    type: "New Feature",
    env: "Staging",
    scheduled: "8 Aug 2026, 18:00",
    developer: "Priya Nair",
    status: "Testing Failed",
    approval: "Approval Not Required",
    risk: "Medium",
    downtime: "None",
    affected: "Franchise owners",
    description: "Monthly PDF report download for store owners.",
    linked: ["T-316", "BUG-90"],
    testing: {
      completed: true,
      regression: false,
      failedResolved: false,
      env: "Staging",
      tester: "Priya Nair",
      results: "4 failures — PDF export blank on Android 11.",
      evidence: ["pdf-failure.png"],
      limitations: "Android 11 unsupported currently.",
      uat: "Not required",
    },
    plan: {
      steps: ["Fix export", "Retest", "Reschedule"],
      backup: "Not required",
      migration: "None",
      downtime: "None",
      communication: "Pending",
      monitoring: "24 hours",
      rollbackWhen: "N/A",
      rollbackSteps: [],
      owner: "Priya Nair",
    },
    checks: { ...allChecks(false), "Store impact reviewed": true, "Release notes completed": true },
    notesInternal: { technical: "", limitations: "PDF renderer issue.", dbConfig: "", support: "" },
    notesUser: { changed: "", features: "", improvements: "", fixed: "", action: "" },
    history: [
      { at: "2 Aug", who: "Priya Nair", what: "Release created" },
      { at: "4 Aug", who: "Priya Nair", what: "Testing failed — 4 cases" },
    ],
  },
];

/* --------------------------------- helpers -------------------------------- */

const statusTone = (s: ReleaseStatus) => {
  if (["Testing Failed", "Approval Rejected", "Release Failed"].includes(s))
    return "bg-destructive/10 text-destructive border-destructive/30";
  if (["Testing", "Awaiting CTO Approval", "Development Complete"].includes(s))
    return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (["Scheduled", "Monitoring"].includes(s))
    return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (["Released", "Completed"].includes(s))
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
  return "bg-muted text-muted-foreground border-border";
};

const approvalTone = (a: Approval) =>
  a === "Approved"
    ? "text-emerald-600"
    : a === "Rejected"
    ? "text-destructive"
    : a === "Awaiting CTO Approval" || a === "Changes Requested"
    ? "text-amber-600"
    : "text-muted-foreground";

const needsApproval = (r: Pick<Release, "env" | "risk" | "product" | "type">) =>
  r.env === "Production" ||
  r.risk === "High" ||
  r.risk === "Critical" ||
  r.product === "Database" ||
  r.type === "Security Update" ||
  r.type === "Database Update";

const TAB_MAP: Record<string, ReleaseStatus[]> = {
  Draft: ["Draft", "Development Complete"],
  Testing: ["Testing", "Testing Passed"],
  "Awaiting Approval": ["Awaiting CTO Approval"],
  Scheduled: ["Scheduled"],
  Released: ["Released", "Monitoring", "Completed"],
  Failed: ["Testing Failed", "Approval Rejected", "Release Failed", "Cancelled"],
  "Rolled Back": ["Rolled Back"],
};

function attentionFlags(r: Release): string[] {
  const f: string[] = [];
  if (r.env === "Production" && needsApproval(r) && r.approval !== "Approved")
    f.push("Production release without approval");
  if (!r.testing.completed || !r.testing.regression) f.push("Critical testing incomplete");
  if (!r.testing.failedResolved) f.push("Release blocker unresolved");
  if ((r.product === "Database" || r.type === "Database Update") && !/required|completed/i.test(r.plan.backup))
    f.push("Database change without backup plan");
  if (r.peakHours) f.push("Release scheduled during store peak hours");
  if (["Release Failed", "Testing Failed"].includes(r.status)) f.push("Release failed");
  if (r.status === "Release Failed") f.push("Rollback required");
  if ((r.monitoring?.reopened ?? 0) > 1) f.push("Multiple tickets reopened after release");
  if (r.status === "Monitoring" && r.monitoring && r.monitoring.to === "—")
    f.push("Monitoring incomplete");
  return f;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value || "—"}</div>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export function DevReleases() {
  const [releases, setReleases] = useState<Release[]>(SAMPLE);
  const [tab, setTab] = useState("All");
  const [filters, setFilters] = useState({
    product: "all",
    type: "all",
    env: "all",
    status: "all",
    dev: "all",
    approval: "all",
    date: "",
    version: "",
  });
  const [open, setOpen] = useState<Release | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<{ release: Release; action: string } | null>(null);

  const setF = (k: keyof typeof filters, v: string) => setFilters((p) => ({ ...p, [k]: v }));

  const filtered = useMemo(
    () =>
      releases.filter((r) => {
        if (tab !== "All" && !TAB_MAP[tab]?.includes(r.status)) return false;
        if (filters.product !== "all" && r.product !== filters.product) return false;
        if (filters.type !== "all" && r.type !== filters.type) return false;
        if (filters.env !== "all" && r.env !== filters.env) return false;
        if (filters.status !== "all" && r.status !== filters.status) return false;
        if (filters.dev !== "all" && r.developer !== filters.dev) return false;
        if (filters.approval !== "all" && r.approval !== filters.approval) return false;
        if (filters.date && !r.scheduled.toLowerCase().includes(filters.date.toLowerCase()))
          return false;
        if (filters.version && !r.version.toLowerCase().includes(filters.version.toLowerCase()))
          return false;
        return true;
      }),
    [releases, tab, filters],
  );

  const count = (fn: (r: Release) => boolean) => releases.filter(fn).length;

  const log = (r: Release, what: string) =>
    setReleases((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? {
              ...x,
              history: [...x.history, { at: "Now", who: "You (Developer)", what }],
            }
          : x,
      ),
    );

  const advance = (r: Release, action: string) => {
    const next: Record<string, ReleaseStatus> = {
      "Start Release": "Released",
      "Mark Step Completed": r.status,
      "Record Issue": r.status,
      "Mark Released": "Released",
      "Start Monitoring": "Monitoring",
      "Mark Failed": "Release Failed",
      "Start Rollback": "Rolled Back",
      "Complete Release": "Completed",
      "Submit for CTO Approval": "Awaiting CTO Approval",
    };
    if (action === "Complete Release" && ["Release Failed", "Rolled Back"].includes(r.status)) {
      toast.error("A failed release cannot be marked completed. Create a new release version.");
      return;
    }
    const status = next[action] ?? r.status;
    setReleases((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? {
              ...x,
              status,
              approval:
                action === "Submit for CTO Approval" ? "Awaiting CTO Approval" : x.approval,
              history: [...x.history, { at: "Now", who: "You (Developer)", what: `${action} — status ${status}` }],
            }
          : x,
      ),
    );
    setOpen((o) => (o && o.id === r.id ? { ...o, status } : o));
    toast.success(`${action} recorded on ${r.id} (workflow placeholder — no real deployment).`);
  };

  const HIGH_RISK_ACTIONS = ["Start Release", "Mark Released", "Mark Failed", "Start Rollback"];

  const act = (r: Release, action: string) => {
    if (HIGH_RISK_ACTIONS.includes(action)) setConfirm({ release: r, action });
    else advance(r, action);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHead
          title="Releases & Updates"
          sub="Plan, test, approve and record App, POS, CRM and website releases in a controlled manner."
        />
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Release
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Draft Releases" value={String(count((r) => r.status === "Draft"))} />
        <StatCard
          label="Testing"
          value={String(count((r) => ["Testing", "Testing Passed"].includes(r.status)))}
          tone="warn"
        />
        <StatCard
          label="Awaiting CTO Approval"
          value={String(count((r) => r.status === "Awaiting CTO Approval"))}
          tone="warn"
        />
        <StatCard label="Scheduled" value={String(count((r) => r.status === "Scheduled"))} />
        <StatCard
          label="Released This Month"
          value={String(count((r) => ["Released", "Monitoring", "Completed"].includes(r.status)))}
          tone="good"
        />
        <StatCard
          label="Failed Releases"
          value={String(
            count((r) => ["Testing Failed", "Release Failed", "Approval Rejected", "Rolled Back"].includes(r.status)),
          )}
          tone="bad"
        />
      </div>

      {/* attention */}
      <AttentionPanel releases={releases} onOpen={setOpen} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          {["All", "Draft", "Testing", "Awaiting Approval", "Scheduled", "Released", "Failed", "Rolled Back"].map(
            (t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <FilterSelect label="Product" value={filters.product} onChange={(v) => setF("product", v)} options={PRODUCTS as unknown as string[]} />
          <FilterSelect label="Release type" value={filters.type} onChange={(v) => setF("type", v)} options={RELEASE_TYPES as unknown as string[]} />
          <FilterSelect label="Environment" value={filters.env} onChange={(v) => setF("env", v)} options={ENVIRONMENTS as unknown as string[]} />
          <FilterSelect label="Status" value={filters.status} onChange={(v) => setF("status", v)} options={RELEASE_STATUSES as unknown as string[]} />
          <FilterSelect label="Assigned developer" value={filters.dev} onChange={(v) => setF("dev", v)} options={DEVELOPERS as unknown as string[]} />
          <FilterSelect
            label="Approval status"
            value={filters.approval}
            onChange={(v) => setF("approval", v)}
            options={["Approval Not Required", "Awaiting CTO Approval", "Approved", "Rejected", "Changes Requested"]}
          />
          <div className="space-y-1">
            <Label className="text-xs">Scheduled date</Label>
            <Input placeholder="e.g. 10 Aug" value={filters.date} onChange={(e) => setF("date", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Version number</Label>
            <Input placeholder="e.g. v3.4" value={filters.version} onChange={(e) => setF("version", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((r) => (
          <ReleaseCard key={r.id} r={r} onView={() => setOpen(r)} />
        ))}
        {filtered.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="p-6 text-sm text-muted-foreground text-center">
              No releases match the selected filters.
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Security & audit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-1">
          <div>No deployment passwords, API keys, tokens or production credentials are stored in this system.</div>
          <div>Production release actions are restricted to authorised users; every approval, status change and rollback is written to the release audit log.</div>
          <div>High-risk actions require confirmation. Rollbacks reuse the same Release ID — no duplicate release records are created.</div>
        </CardContent>
      </Card>

      {open && (
        <ReleaseDrawer
          r={releases.find((x) => x.id === open.id) ?? open}
          onClose={() => setOpen(null)}
          onAction={act}
          onToggleCheck={(c) => {
            setReleases((prev) =>
              prev.map((x) => (x.id === open.id ? { ...x, checks: { ...x.checks, [c]: !x.checks[c] } } : x)),
            );
            log(open, `Pre-release checklist updated: ${c}`);
          }}
        />
      )}

      {creating && (
        <CreateReleaseWizard
          onClose={() => setCreating(false)}
          onCreate={(r) => {
            setReleases((prev) => [r, ...prev]);
            setCreating(false);
            toast.success(`${r.id} created as Draft with version ${r.version}.`);
          }}
          existing={releases}
        />
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm high-risk action</DialogTitle>
            <DialogDescription>
              {confirm && (
                <>
                  You are about to record “{confirm.action}” on {confirm.release.id} ({confirm.release.version},{" "}
                  {confirm.release.env}). This is a workflow record only — no real deployment is executed.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirm) advance(confirm.release, confirm.action);
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

/* -------------------------------- sub views ------------------------------- */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AttentionPanel({ releases, onOpen }: { releases: Release[]; onOpen: (r: Release) => void }) {
  const rows = releases
    .map((r) => ({ r, flags: attentionFlags(r) }))
    .filter((x) => x.flags.length > 0);
  if (rows.length === 0) return null;
  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" /> Needs attention ({rows.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {rows.map(({ r, flags }) => (
          <div key={r.id} className="rounded-md border bg-background p-3 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium">
                {r.id} · {r.version} — {r.title}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {flags.map((f) => (
                  <Badge
                    key={f}
                    variant="outline"
                    className={
                      /failed|rollback|blocker|without/i.test(f)
                        ? "text-destructive border-destructive/30"
                        : "text-amber-600 border-amber-500/30"
                    }
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onOpen(r)}>
              View Release
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReleaseCard({ r, onView }: { r: Release; onView: () => void }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">
              {r.id} · {r.version}
            </div>
            <div className="text-sm font-semibold">{r.title}</div>
          </div>
          <Badge variant="outline" className={statusTone(r.status)}>
            {r.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>Product: <span className="text-foreground">{r.product}</span></div>
          <div>Type: <span className="text-foreground">{r.type}</span></div>
          <div>Environment: <span className="text-foreground">{r.env}</span></div>
          <div>Developer: <span className="text-foreground">{r.developer}</span></div>
          <div className="col-span-2">Scheduled: <span className="text-foreground">{r.scheduled}</span></div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs font-medium ${approvalTone(r.approval)}`}>{r.approval}</span>
          <Button size="sm" variant="outline" onClick={onView}>
            View Release
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReleaseDrawer({
  r,
  onClose,
  onAction,
  onToggleCheck,
}: {
  r: Release;
  onClose: () => void;
  onAction: (r: Release, a: string) => void;
  onToggleCheck: (c: string) => void;
}) {
  const ACTIONS = [
    "Submit for CTO Approval",
    "Start Release",
    "Mark Step Completed",
    "Record Issue",
    "Mark Released",
    "Start Monitoring",
    "Mark Failed",
    "Start Rollback",
    "Complete Release",
  ];
  const flags = attentionFlags(r);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <Rocket className="h-4 w-4" /> {r.id} · {r.version}
            <Badge variant="outline" className={statusTone(r.status)}>
              {r.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>{r.title}</DialogDescription>
        </DialogHeader>

        {flags.length > 0 && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 space-y-1">
            {flags.map((f) => (
              <div key={f}>• {f}</div>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Product" value={r.product} />
          <Field label="Release type" value={r.type} />
          <Field label="Environment" value={r.env} />
          <Field label="Risk level" value={r.risk} />
          <Field label="Assigned developer" value={r.developer} />
          <Field label="Scheduled" value={r.scheduled} />
          <Field label="Expected downtime" value={r.downtime} />
          <Field label="Stores / users affected" value={r.affected} />
          <Field
            label="CTO approval"
            value={<span className={approvalTone(r.approval)}>{r.approval}</span>}
          />
        </div>
        <Field label="Description" value={r.description} />

        <Separator />
        <div>
          <div className="text-sm font-semibold mb-2">Included work (linked records keep their original IDs)</div>
          <div className="flex flex-wrap gap-1">
            {r.linked.map((l) => (
              <Badge key={l} variant="secondary">
                {l}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Testing evidence</div>
            <Field label="Testing completed" value={r.testing.completed ? "Yes" : "No"} />
            <Field label="Regression testing" value={r.testing.regression ? "Completed" : "Pending"} />
            <Field label="Failed tests resolved" value={r.testing.failedResolved ? "Yes" : "No"} />
            <Field label="Test environment" value={r.testing.env} />
            <Field label="Tester" value={r.testing.tester} />
            <Field label="Test results" value={r.testing.results} />
            <Field label="Evidence" value={r.testing.evidence.join(", ")} />
            <Field label="Known limitations" value={r.testing.limitations} />
            <Field label="User acceptance" value={r.testing.uat} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold">Release plan</div>
            <Field
              label="Deployment steps"
              value={
                <ol className="list-decimal ml-4 space-y-0.5">
                  {r.plan.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              }
            />
            <Field label="Backup requirement" value={r.plan.backup} />
            <Field label="Database migration plan" value={r.plan.migration} />
            <Field label="Downtime plan" value={r.plan.downtime} />
            <Field label="Communication plan" value={r.plan.communication} />
            <Field label="Monitoring plan" value={r.plan.monitoring} />
            <Field label="Rollback conditions" value={r.plan.rollbackWhen} />
            <Field
              label="Rollback steps"
              value={r.plan.rollbackSteps.length ? r.plan.rollbackSteps.join(" → ") : "—"}
            />
            <Field label="Responsible person" value={r.plan.owner} />
          </div>
        </div>

        <Separator />
        <div>
          <div className="text-sm font-semibold mb-2">Pre-release checklist</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {PRE_RELEASE_CHECKS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm rounded-md border p-2">
                <Checkbox checked={!!r.checks[c]} onCheckedChange={() => onToggleCheck(c)} />
                <span className={r.checks[c] ? "" : "text-muted-foreground"}>{c}</span>
              </label>
            ))}
          </div>
          {needsApproval(r) && (
            <p className="text-xs text-amber-600 mt-2">
              High-risk, production, database and security releases require CTO approval before scheduling.
            </p>
          )}
        </div>

        {r.monitoring && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-semibold mb-2">Monitoring</div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="System health" value={r.monitoring.health} />
                <Field label="Error reports" value={String(r.monitoring.errors)} />
                <Field label="Store complaints" value={String(r.monitoring.complaints)} />
                <Field label="Reopened tickets" value={String(r.monitoring.reopened)} />
                <Field label="Performance issues" value={r.monitoring.performance} />
                <Field label="Monitoring window" value={`${r.monitoring.from} → ${r.monitoring.to}`} />
                <Field label="Final outcome" value={r.monitoring.outcome} />
              </div>
            </div>
          </>
        )}

        {r.rollback && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-2 text-destructive">
                <RotateCcw className="h-4 w-4" /> Rollback record (same Release ID)
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Reason" value={r.rollback.reason} />
                <Field label="Failed component" value={r.rollback.component} />
                <Field label="Impact" value={r.rollback.impact} />
                <Field label="Rollback start" value={r.rollback.start} />
                <Field label="Rollback completed" value={r.rollback.end} />
                <Field label="System status" value={r.rollback.systemStatus} />
                <Field label="Follow-up task" value={r.rollback.followUp} />
                <Field label="CTO acknowledgement" value={r.rollback.ctoAck} />
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Release notes — internal</div>
            <Field label="Technical changes" value={r.notesInternal.technical} />
            <Field label="Known limitations" value={r.notesInternal.limitations} />
            <Field label="Database / configuration notes" value={r.notesInternal.dbConfig} />
            <Field label="Support instructions" value={r.notesInternal.support} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold">Release notes — user-facing</div>
            <Field label="What changed" value={r.notesUser.changed} />
            <Field label="New features" value={r.notesUser.features} />
            <Field label="Improvements" value={r.notesUser.improvements} />
            <Field label="Issues fixed" value={r.notesUser.fixed} />
            <Field label="Action required" value={r.notesUser.action} />
          </div>
        </div>

        <Separator />
        <div>
          <div className="text-sm font-semibold mb-2">Release execution (workflow placeholders only)</div>
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((a) => (
              <Button key={a} size="sm" variant="outline" onClick={() => onAction(r, a)}>
                {a}
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            These actions record workflow history only. No repository, CI/CD, cloud or app-store deployment is executed.
          </p>
        </div>

        <Separator />
        <div>
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <History className="h-4 w-4" /> Audit log
          </div>
          <div className="space-y-1">
            {r.history.map((h, i) => (
              <div key={i} className="text-xs text-muted-foreground rounded-md border p-2">
                <span className="text-foreground">{h.what}</span> — {h.who} · {h.at}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- wizard ---------------------------------- */

const STEPS = ["Basic Details", "Select Included Work", "Testing Evidence", "Release Plan", "Review and Submit"];

const WORK_POOL = [
  { group: "Project Task IDs", items: ["T-311", "T-312", "T-320"] },
  { group: "Bug IDs", items: ["BUG-88", "BUG-89", "BUG-90"] },
  { group: "Ticket IDs", items: ["DEV-1041", "DEV-1042", "DEV-1044"] },
  { group: "Store Setup IDs", items: ["SETUP-JAIPUR", "SETUP-INDORE"] },
  { group: "Features", items: ["Offline billing", "Printer profiles"] },
  { group: "Configuration changes", items: ["pos.offline.enabled"] },
  { group: "Database changes", items: ["printer_profiles table"] },
];

function CreateReleaseWizard({
  onClose,
  onCreate,
  existing,
}: {
  onClose: () => void;
  onCreate: (r: Release) => void;
  existing: Release[];
}) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    title: "",
    product: "POS" as Release["product"],
    version: "",
    type: "New Feature" as Release["type"],
    env: "Staging" as Release["env"],
    description: "",
    risk: "Low" as Release["risk"],
    developer: DEVELOPERS[0] as string,
    scheduled: "",
    downtime: "",
    affected: "",
  });
  const [linked, setLinked] = useState<string[]>([]);
  const [testing, setTesting] = useState({
    completed: false,
    regression: false,
    failedResolved: false,
    env: "Staging",
    tester: "",
    results: "",
    evidence: "",
    limitations: "",
    uat: "Not required",
  });
  const [plan, setPlan] = useState({
    steps: "",
    backup: "",
    migration: "",
    downtime: "",
    communication: "",
    monitoring: "",
    rollbackWhen: "",
    rollbackSteps: "",
    owner: DEVELOPERS[0] as string,
  });

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }) as typeof p);

  const versionClash = existing.some(
    (r) => r.product === f.product && r.version.toLowerCase() === f.version.trim().toLowerCase(),
  );

  const canNext = () => {
    if (step === 0)
      return !!f.title && !!f.version && !!f.scheduled && !versionClash;
    if (step === 1) return linked.length > 0;
    if (step === 2) return testing.completed && !!testing.tester && !!testing.results;
    if (step === 3) return !!plan.steps && !!plan.rollbackSteps;
    return true;
  };

  const submit = () => {
    const id = `REL-${2042 + existing.length - SAMPLE.length}`;
    const approval: Approval = needsApproval(f) ? "Awaiting CTO Approval" : "Approval Not Required";
    onCreate({
      id,
      version: f.version.trim(),
      title: f.title,
      product: f.product,
      type: f.type,
      env: f.env,
      scheduled: f.scheduled,
      developer: f.developer,
      status: "Draft",
      approval,
      risk: f.risk,
      downtime: f.downtime,
      affected: f.affected,
      description: f.description,
      linked,
      testing: { ...testing, evidence: testing.evidence ? testing.evidence.split(",").map((s) => s.trim()) : [] },
      plan: {
        steps: plan.steps.split("\n").filter(Boolean),
        backup: plan.backup,
        migration: plan.migration,
        downtime: plan.downtime,
        communication: plan.communication,
        monitoring: plan.monitoring,
        rollbackWhen: plan.rollbackWhen,
        rollbackSteps: plan.rollbackSteps.split("\n").filter(Boolean),
        owner: plan.owner,
      },
      checks: allChecks(false),
      notesInternal: { technical: "", limitations: testing.limitations, dbConfig: "", support: "" },
      notesUser: { changed: "", features: "", improvements: "", fixed: "", action: "" },
      history: [{ at: "Now", who: "You (Developer)", what: `Release created (Draft) — ${approval}` }],
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Release</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1">
          {STEPS.map((s, i) => (
            <Badge key={s} variant={i === step ? "default" : i < step ? "secondary" : "outline"}>
              {i + 1}. {s}
            </Badge>
          ))}
        </div>

        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Release title</Label>
              <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="POS offline billing sync" />
            </div>
            <WizSelect label="Product" value={f.product} onChange={(v) => set("product", v)} options={PRODUCTS as unknown as string[]} />
            <div className="space-y-1">
              <Label>Version number</Label>
              <Input value={f.version} onChange={(e) => set("version", e.target.value)} placeholder="v3.5.0" />
              {versionClash && (
                <p className="text-xs text-destructive">This version already exists for {f.product}.</p>
              )}
            </div>
            <WizSelect label="Release type" value={f.type} onChange={(v) => set("type", v)} options={RELEASE_TYPES as unknown as string[]} />
            <WizSelect label="Environment" value={f.env} onChange={(v) => set("env", v)} options={ENVIRONMENTS as unknown as string[]} />
            <WizSelect label="Risk level" value={f.risk} onChange={(v) => set("risk", v)} options={RISKS as unknown as string[]} />
            <WizSelect label="Assigned developer" value={f.developer} onChange={(v) => set("developer", v)} options={DEVELOPERS as unknown as string[]} />
            <div className="space-y-1">
              <Label>Proposed release date and time</Label>
              <Input value={f.scheduled} onChange={(e) => set("scheduled", e.target.value)} placeholder="14 Aug 2026, 23:30" />
            </div>
            <div className="space-y-1">
              <Label>Expected downtime</Label>
              <Input value={f.downtime} onChange={(e) => set("downtime", e.target.value)} placeholder="15 minutes" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Stores or users affected</Label>
              <Input value={f.affected} onChange={(e) => set("affected", e.target.value)} placeholder="22 stores, 41 terminals" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={f.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            {needsApproval(f) && (
              <p className="sm:col-span-2 text-xs text-amber-600">
                This release will require CTO approval (production / high risk / database / security).
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Link existing records only — original IDs are retained and nothing is duplicated.
            </p>
            {WORK_POOL.map((g) => (
              <div key={g.group}>
                <div className="text-xs font-medium mb-1">{g.group}</div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((i) => (
                    <label key={i} className="flex items-center gap-2 text-sm rounded-md border px-2 py-1">
                      <Checkbox
                        checked={linked.includes(i)}
                        onCheckedChange={() =>
                          setLinked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))
                        }
                      />
                      {i}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {(
              [
                ["completed", "Testing completed"],
                ["regression", "Regression testing completed"],
                ["failedResolved", "Failed tests resolved"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm rounded-md border p-2">
                <Checkbox
                  checked={testing[k]}
                  onCheckedChange={() => setTesting((p) => ({ ...p, [k]: !p[k] }))}
                />
                {label}
              </label>
            ))}
            <div className="grid sm:grid-cols-2 gap-3">
              <WizSelect label="Test environment" value={testing.env} onChange={(v) => setTesting((p) => ({ ...p, env: v }))} options={["Development", "Staging", "Pre-production"]} />
              <div className="space-y-1">
                <Label>Tester</Label>
                <Input value={testing.tester} onChange={(e) => setTesting((p) => ({ ...p, tester: e.target.value }))} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Test results</Label>
                <Textarea value={testing.results} onChange={(e) => setTesting((p) => ({ ...p, results: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Supporting screenshots or files</Label>
                <Input placeholder="report.pdf, screen.png" value={testing.evidence} onChange={(e) => setTesting((p) => ({ ...p, evidence: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Known limitations</Label>
                <Input value={testing.limitations} onChange={(e) => setTesting((p) => ({ ...p, limitations: e.target.value }))} />
              </div>
              <WizSelect
                label="User acceptance"
                value={testing.uat}
                onChange={(v) => setTesting((p) => ({ ...p, uat: v }))}
                options={["Not required", "Pending", "Completed"]}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Deployment steps (one per line)</Label>
              <Textarea value={plan.steps} onChange={(e) => setPlan((p) => ({ ...p, steps: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Backup requirement</Label>
              <Input value={plan.backup} onChange={(e) => setPlan((p) => ({ ...p, backup: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Database migration plan</Label>
              <Input value={plan.migration} onChange={(e) => setPlan((p) => ({ ...p, migration: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Downtime plan</Label>
              <Input value={plan.downtime} onChange={(e) => setPlan((p) => ({ ...p, downtime: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Communication plan</Label>
              <Input value={plan.communication} onChange={(e) => setPlan((p) => ({ ...p, communication: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Monitoring plan</Label>
              <Input value={plan.monitoring} onChange={(e) => setPlan((p) => ({ ...p, monitoring: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Rollback conditions</Label>
              <Input value={plan.rollbackWhen} onChange={(e) => setPlan((p) => ({ ...p, rollbackWhen: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Rollback steps (one per line)</Label>
              <Textarea value={plan.rollbackSteps} onChange={(e) => setPlan((p) => ({ ...p, rollbackSteps: e.target.value }))} />
            </div>
            <WizSelect label="Responsible person" value={plan.owner} onChange={(v) => setPlan((p) => ({ ...p, owner: v }))} options={DEVELOPERS as unknown as string[]} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Title" value={f.title} />
              <Field label="Product" value={f.product} />
              <Field label="Version" value={f.version} />
              <Field label="Type" value={f.type} />
              <Field label="Environment" value={f.env} />
              <Field label="Risk" value={f.risk} />
              <Field label="Developer" value={f.developer} />
              <Field label="Scheduled" value={f.scheduled} />
              <Field label="Downtime" value={f.downtime} />
            </div>
            <Field label="Linked work" value={linked.join(", ")} />
            <Field label="Approval" value={needsApproval(f) ? "Awaiting CTO Approval" : "Approval Not Required"} />
            <p className="text-xs text-muted-foreground">
              The release is created as Draft with a permanent Release ID. Pre-release checklist and CTO approval must be
              completed before scheduling. No credentials are stored with this record.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              disabled={!canNext()}
              onClick={() => (canNext() ? setStep((s) => s + 1) : toast.error("Complete this step first."))}
            >
              Next
            </Button>
          ) : (
            <Button onClick={submit}>Create Release</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WizSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
