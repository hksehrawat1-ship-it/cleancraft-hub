/** Shared work-item vocabulary (client-safe, no server imports). */

export const WORK_STATUSES = [
  "draft",
  "submitted",
  "assigned",
  "accepted",
  "in_progress",
  "submitted_for_review",
  "approved",
  "completed",
  "closed",
  "information_required",
  "returned",
  "blocked",
  "correction_required",
  "reassigned",
  "cancelled",
  "reopened",
] as const;

export type WorkStatus = (typeof WORK_STATUSES)[number];

export const STATUS_LABEL: Record<WorkStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  assigned: "Assigned",
  accepted: "Accepted",
  in_progress: "In Progress",
  submitted_for_review: "Submitted for Review",
  approved: "Approved",
  completed: "Completed",
  closed: "Closed",
  information_required: "Information Required",
  returned: "Returned",
  blocked: "Blocked",
  correction_required: "Correction Required",
  reassigned: "Reassigned",
  cancelled: "Cancelled",
  reopened: "Reopened",
};

/** green healthy · blue active · amber attention · red failure */
export const STATUS_TONE: Record<WorkStatus, "good" | "info" | "warn" | "bad" | "muted"> = {
  draft: "muted",
  submitted: "info",
  assigned: "info",
  accepted: "info",
  in_progress: "info",
  submitted_for_review: "warn",
  approved: "good",
  completed: "good",
  closed: "good",
  information_required: "warn",
  returned: "warn",
  blocked: "bad",
  correction_required: "warn",
  reassigned: "muted",
  cancelled: "muted",
  reopened: "bad",
};

export const TONE_TEXT: Record<string, string> = {
  good: "text-emerald-600",
  info: "text-primary",
  warn: "text-amber-600",
  bad: "text-destructive",
  muted: "text-muted-foreground",
};

export const TONE_BG: Record<string, string> = {
  good: "bg-emerald-500/15 text-emerald-700",
  info: "bg-primary/10 text-primary",
  warn: "bg-amber-500/15 text-amber-700",
  bad: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export const RECORD_TYPES = [
  { value: "task", label: "Task" },
  { value: "request", label: "Request" },
  { value: "ticket", label: "Ticket" },
  { value: "handover", label: "Handover" },
  { value: "content", label: "Content" },
  { value: "payment_request", label: "Payment Request" },
  { value: "clearance", label: "Dispatch Clearance" },
  { value: "dispatch", label: "Dispatch" },
  { value: "packing", label: "Packing" },
  { value: "training", label: "Training" },
  { value: "survey", label: "Site Survey" },
  { value: "marketing", label: "Marketing" },
  { value: "hr", label: "HR" },
  { value: "support", label: "Support" },
] as const;

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const PRIORITY_TONE: Record<string, string> = {
  low: "muted",
  medium: "info",
  high: "warn",
  urgent: "bad",
};

/** Employee queue tiles — the nine process-reporting buckets. */
export const EMPLOYEE_QUEUES = [
  { key: "new", label: "New work assigned", statuses: ["assigned", "submitted"], tone: "info" },
  { key: "accepted", label: "Work accepted", statuses: ["accepted"], tone: "info" },
  { key: "progress", label: "Work in progress", statuses: ["in_progress"], tone: "info" },
  { key: "due_today", label: "Due today", statuses: [], tone: "warn" },
  { key: "overdue", label: "Overdue", statuses: [], tone: "bad" },
  { key: "waiting", label: "Waiting for information", statuses: ["information_required", "blocked"], tone: "warn" },
  { key: "review", label: "Submitted for review", statuses: ["submitted_for_review"], tone: "warn" },
  { key: "correction", label: "Returned for correction", statuses: ["correction_required", "returned"], tone: "warn" },
  { key: "done", label: "Completed", statuses: ["approved", "completed", "closed"], tone: "good" },
] as const;

/** Manager queue tiles — the eight team-oversight buckets. */
export const MANAGER_QUEUES = [
  { key: "workload", label: "Team workload", tone: "info" },
  { key: "unassigned", label: "Unassigned work", tone: "warn" },
  { key: "overdue", label: "Overdue work", tone: "bad" },
  { key: "returned_handovers", label: "Returned handovers", tone: "bad" },
  { key: "review", label: "Waiting for review", tone: "warn" },
  { key: "blocked", label: "Blocked work", tone: "bad" },
  { key: "completed", label: "Completed work", tone: "good" },
  { key: "intervention", label: "Needs manager intervention", tone: "bad" },
] as const;

export type WorkItem = {
  id: string;
  record_code: string | null;
  record_type: string;
  title: string;
  description: string | null;
  master_type: string;
  master_id: string | null;
  master_code: string | null;
  created_by: string | null;
  from_department: string | null;
  to_department: string | null;
  assigned_role: string | null;
  assigned_user: string | null;
  priority: string;
  status: WorkStatus;
  required_action: string | null;
  next_action: string | null;
  start_date: string | null;
  due_at: string | null;
  notes_internal: string | null;
  approval_required: boolean;
  handover_status: string;
  completion_summary: string | null;
  issues_remaining: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const OPEN_STATUSES: WorkStatus[] = [
  "submitted",
  "assigned",
  "accepted",
  "in_progress",
  "submitted_for_review",
  "information_required",
  "blocked",
  "correction_required",
  "returned",
  "reopened",
];

export const isOpen = (s: WorkStatus) => OPEN_STATUSES.includes(s);

export function isOverdue(w: WorkItem) {
  return !!w.due_at && isOpen(w.status) && new Date(w.due_at).getTime() < Date.now();
}

export function isDueToday(w: WorkItem) {
  if (!w.due_at || !isOpen(w.status)) return false;
  const d = new Date(w.due_at);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function bucketEmployee(items: WorkItem[], key: string) {
  if (key === "due_today") return items.filter(isDueToday);
  if (key === "overdue") return items.filter(isOverdue);
  const q = EMPLOYEE_QUEUES.find((x) => x.key === key);
  if (!q) return [];
  return items.filter((i) => (q.statuses as readonly string[]).includes(i.status));
}

export function bucketManager(items: WorkItem[], key: string) {
  switch (key) {
    case "workload":
      return items.filter((i) => isOpen(i.status) && i.assigned_user);
    case "unassigned":
      return items.filter((i) => isOpen(i.status) && !i.assigned_user);
    case "overdue":
      return items.filter(isOverdue);
    case "returned_handovers":
      return items.filter((i) => i.handover_status === "returned");
    case "review":
      return items.filter((i) => i.status === "submitted_for_review");
    case "blocked":
      return items.filter((i) => i.status === "blocked" || i.status === "information_required");
    case "completed":
      return items.filter((i) => ["approved", "completed", "closed"].includes(i.status));
    case "intervention":
      return items.filter(
        (i) =>
          isOverdue(i) ||
          i.status === "blocked" ||
          i.status === "returned" ||
          i.handover_status === "returned" ||
          (isOpen(i.status) && !i.assigned_user),
      );
    default:
      return [];
  }
}

export function fmtDue(due: string | null) {
  if (!due) return "No deadline";
  const d = new Date(due);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
