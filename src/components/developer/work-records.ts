/* Shared technical-work structure for the App & POS Centre (Developer CRM).
   One permanent Work ID per request; CTO, Relationship Manager and Project
   Coordinator all raise work into this same record set. */

export type WorkStatus =
  | "Request Created"
  | "Assigned"
  | "Accepted"
  | "In Progress"
  | "Testing"
  | "Awaiting Approval"
  | "Completed"
  | "Closed"
  | "Blocked"
  | "More Information Required"
  | "Reopened"
  | "Cancelled";

export type Source = "CTO" | "Relationship Manager" | "Project Coordinator";

export type Priority = "Emergency" | "Critical" | "High" | "Medium" | "Low";

export const REQUEST_TYPES = [
  "App Issue",
  "POS Issue",
  "Store Setup",
  "User Access Issue",
  "Data Issue",
  "Bug Fix",
  "Feature Request",
  "Configuration Change",
  "Integration Issue",
  "Release Task",
  "General Technical Task",
] as const;

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
  "Other",
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type SystemArea = (typeof SYSTEM_AREAS)[number];

/** Priority order rank — lower number is worked first. */
export const PRIORITY_REASONS = [
  "Security or data-loss risk",
  "App/POS completely unavailable",
  "Store billing or operations stopped",
  "Critical new-store launch blocker",
  "Failed production release",
  "Overdue committed work",
  "High-impact bug",
  "Due today",
  "Routine development work",
] as const;

export type PriorityReason = (typeof PRIORITY_REASONS)[number];

export const reasonRank = (r: PriorityReason) => PRIORITY_REASONS.indexOf(r);

export type WorkItem = {
  id: string;
  title: string;
  type: RequestType;
  source: Source;
  requestedBy: string;
  store?: string;
  project?: string;
  area: SystemArea;
  priority: Priority;
  reason: PriorityReason;
  deadline: string;
  dueTime?: string;
  status: WorkStatus;
  nextAction: string;
  acknowledged: boolean;
  overdue?: boolean;
  missingInfo?: string[];
};

export const WORK: WorkItem[] = [
  {
    id: "WRK-2041",
    title: "POS billing screen freezes after bill save — store cannot bill",
    type: "POS Issue",
    source: "Relationship Manager",
    requestedBy: "Ankit Verma (RM — North)",
    store: "Jaipur — Vaishali Nagar",
    area: "POS",
    priority: "Emergency",
    reason: "Store billing or operations stopped",
    deadline: "Today, 6:00 PM",
    dueTime: "6:00 PM",
    status: "In Progress",
    nextAction: "Reproduce on store build and ship hotfix",
    acknowledged: true,
  },
  {
    id: "WRK-2042",
    title: "Customer App exposing other customers' order IDs in share link",
    type: "Data Issue",
    source: "CTO",
    requestedBy: "Rahul Menon (CTO)",
    area: "Customer App",
    priority: "Emergency",
    reason: "Security or data-loss risk",
    deadline: "Today, 2:00 PM",
    dueTime: "2:00 PM",
    status: "Assigned",
    nextAction: "Accept work and patch share-token validation",
    acknowledged: false,
  },
  {
    id: "WRK-2043",
    title: "New store POS setup — tariff master and printer profile pending",
    type: "Store Setup",
    source: "Project Coordinator",
    requestedBy: "Neha Sharma (Project Coordinator)",
    project: "Launch — Indore Phase 2",
    store: "Indore — Vijay Nagar",
    area: "POS",
    priority: "Critical",
    reason: "Critical new-store launch blocker",
    deadline: "5 Aug",
    dueTime: "11:00 AM",
    status: "More Information Required",
    nextAction: "Requester to share tariff sheet and GST details",
    acknowledged: true,
    missingInfo: ["Approved tariff sheet", "GST number", "Printer model"],
  },
  {
    id: "WRK-2044",
    title: "Release v3.3.3 failed on production — rollback verification",
    type: "Release Task",
    source: "CTO",
    requestedBy: "Rahul Menon (CTO)",
    area: "Franchise App",
    priority: "Critical",
    reason: "Failed production release",
    deadline: "Today, 8:00 PM",
    dueTime: "8:00 PM",
    status: "Testing",
    nextAction: "Confirm rollback and submit test result",
    acknowledged: true,
  },
  {
    id: "WRK-2045",
    title: "Franchise lead form not saving city field",
    type: "Bug Fix",
    source: "CTO",
    requestedBy: "Rahul Menon (CTO)",
    area: "CRM",
    priority: "High",
    reason: "Overdue committed work",
    deadline: "2 Aug (overdue)",
    dueTime: "Overdue",
    status: "Reopened",
    nextAction: "Fix validation and resubmit for testing",
    acknowledged: true,
    overdue: true,
  },
  {
    id: "WRK-2046",
    title: "Store owner login locked after password reset",
    type: "User Access Issue",
    source: "Relationship Manager",
    requestedBy: "Pooja Nair (RM — West)",
    store: "Surat — Adajan",
    area: "Franchise App",
    priority: "High",
    reason: "High-impact bug",
    deadline: "Today, 7:00 PM",
    dueTime: "7:00 PM",
    status: "Accepted",
    nextAction: "Reset access via admin panel and log audit entry",
    acknowledged: true,
  },
  {
    id: "WRK-2047",
    title: "Attendance export missing last row in reporting module",
    type: "Bug Fix",
    source: "CTO",
    requestedBy: "Rahul Menon (CTO)",
    area: "Reporting",
    priority: "Medium",
    reason: "Due today",
    deadline: "Today, 9:00 PM",
    dueTime: "9:00 PM",
    status: "In Progress",
    nextAction: "Fix pagination offset and submit for testing",
    acknowledged: true,
  },
  {
    id: "WRK-2048",
    title: "Add GST field to invoice screen",
    type: "Feature Request",
    source: "Project Coordinator",
    requestedBy: "Neha Sharma (Project Coordinator)",
    project: "Launch — Lucknow",
    area: "POS",
    priority: "Low",
    reason: "Routine development work",
    deadline: "8 Aug",
    dueTime: "—",
    status: "Request Created",
    nextAction: "Accept or return with missing information",
    acknowledged: false,
  },
  {
    id: "WRK-2049",
    title: "Payment gateway callback timing out intermittently",
    type: "Integration Issue",
    source: "CTO",
    requestedBy: "Rahul Menon (CTO)",
    area: "API or Integration",
    priority: "High",
    reason: "High-impact bug",
    deadline: "6 Aug",
    dueTime: "—",
    status: "Blocked",
    nextAction: "Waiting on vendor sandbox credentials (secure store)",
    acknowledged: true,
  },
];

/* ------------------------------ system health ----------------------------- */

export type HealthState =
  | "Operational"
  | "Degraded"
  | "Major Issue"
  | "Under Maintenance"
  | "Status Unknown";

export const SYSTEM_HEALTH: { name: string; state: HealthState; note: string }[] = [
  { name: "Customer App", state: "Degraded", note: "Share-link patch pending" },
  { name: "Franchise App", state: "Operational", note: "Rollback stable" },
  { name: "POS", state: "Major Issue", note: "Billing freeze — 1 store" },
  { name: "CRM", state: "Operational", note: "No open incidents" },
  { name: "Website", state: "Under Maintenance", note: "Content deploy window" },
  { name: "Integrations", state: "Status Unknown", note: "Monitoring not connected" },
];

/* ------------------------------- summaries -------------------------------- */

export const SETUP_SUMMARY = [
  { label: "New stores awaiting setup", value: 3, tone: "warn" as const },
  { label: "Setup in progress", value: 2, tone: "info" as const },
  { label: "Testing pending", value: 1, tone: "warn" as const },
  { label: "Information pending", value: 1, tone: "warn" as const },
  { label: "Ready for launch", value: 2, tone: "good" as const },
  { label: "Setup overdue", value: 1, tone: "bad" as const },
];

export const BUG_SUMMARY = [
  { label: "Critical bugs", value: 2, tone: "bad" as const },
  { label: "Bugs in progress", value: 3, tone: "info" as const },
  { label: "Ready for testing", value: 2, tone: "warn" as const },
  { label: "Testing failed", value: 1, tone: "bad" as const },
  { label: "Reopened bugs", value: 1, tone: "warn" as const },
  { label: "Resolved today", value: 4, tone: "good" as const },
];

export const RELEASE_SUMMARY = [
  { label: "Draft releases", value: 2, tone: "draft" as const },
  { label: "Ready for testing", value: 1, tone: "warn" as const },
  { label: "Awaiting CTO approval", value: 1, tone: "warn" as const },
  { label: "Scheduled releases", value: 1, tone: "info" as const },
  { label: "Failed releases", value: 1, tone: "bad" as const },
  { label: "Completed releases", value: 6, tone: "good" as const },
];

export type Alert = {
  level: "emergency" | "critical" | "attention";
  title: string;
  detail: string;
  work?: string;
};

export const ALERTS: Alert[] = [
  {
    level: "emergency",
    title: "Security / data-loss risk open",
    detail: "Customer App share link exposes other customers' order IDs.",
    work: "WRK-2042",
  },
  {
    level: "emergency",
    title: "POS billing stopped",
    detail: "Jaipur — Vaishali Nagar cannot generate bills.",
    work: "WRK-2041",
  },
  {
    level: "critical",
    title: "Critical ticket without acknowledgement",
    detail: "WRK-2042 assigned 46 minutes ago and not yet accepted.",
    work: "WRK-2042",
  },
  {
    level: "critical",
    title: "Store launch blocked",
    detail: "Indore — Vijay Nagar setup waiting on tariff sheet and GST number.",
    work: "WRK-2043",
  },
  {
    level: "critical",
    title: "Failed production release",
    detail: "v3.3.3 rolled back — rollback verification in testing.",
    work: "WRK-2044",
  },
  {
    level: "attention",
    title: "Overdue developer commitment",
    detail: "WRK-2045 committed for 2 Aug and reopened.",
    work: "WRK-2045",
  },
  {
    level: "attention",
    title: "Release awaiting CTO approval",
    detail: "v3.4.0 cannot move to production without CTO sign-off.",
  },
  {
    level: "attention",
    title: "Testing failed",
    detail: "BUG-88 fix failed regression on POS bill print.",
  },
];

export const PERFORMANCE = [
  { label: "First-response time", value: "18 min", target: "Target under 30 min", tone: "good" as const },
  { label: "Work completed on time", value: "88%", target: "Target 90%", tone: "warn" as const },
  { label: "Avg resolution time", value: "1.6 d", target: "Target under 2 d", tone: "good" as const },
  { label: "Reopened issue rate", value: "7%", target: "Target under 5%", tone: "warn" as const },
  { label: "Testing pass rate", value: "91%", target: "Target 90%", tone: "good" as const },
  { label: "Store setups on time", value: "6 of 7", target: "Avg 2.4 days", tone: "good" as const },
  { label: "Release success rate", value: "6 of 7", target: "1 rollback", tone: "warn" as const },
  { label: "Overdue work", value: "1", target: "Target 0", tone: "bad" as const },
];

export const AUDIT_LOG = [
  { at: "Today 10:42", who: "Developer", what: "Viewed store access record — Surat (masked)" },
  { at: "Today 09:58", who: "Developer", what: "Requested vendor sandbox credentials via secure store" },
  { at: "Yesterday 18:20", who: "CTO", what: "Rejected production approval for v3.3.3 after failure" },
  { at: "Yesterday 16:05", who: "Developer", what: "Configuration change — POS printer profile (Indore)" },
];
