import { MASTER_EMPLOYEES } from "./employee-data";
import { HR_CANDIDATES, HR_OPENINGS } from "./recruitment-data";
import { ATTENDANCE_TODAY, LEAVE_REQUESTS, REGULARISATIONS } from "./attendance-data";
import { GOALS, PIPS, REVIEWS, TRAININGS } from "./perf-training-data";
import { HR_DOCS } from "./letters-data";
import { USER_ACCOUNTS } from "./user-access-data";
import { ONBOARDING_RECORDS } from "./onboarding-data";

export type AuditEntry = { at: string; by: string; text: string };

export const REPORT_TYPES = [
  "Monthly HR Summary",
  "Workforce Report",
  "Recruitment Report",
  "Attendance & Leave Report",
  "Performance & Training Report",
  "Employee Movement Report",
  "HR Risk Report",
  "User-Access Report",
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_STAGES = [
  "Draft",
  "Ready for Review",
  "Submitted to CEO",
  "Viewed by CEO",
  "CEO Feedback Received",
  "Closed",
] as const;
export type ReportStage = (typeof REPORT_STAGES)[number];

export const STAGE_TONE: Record<ReportStage, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Ready for Review": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "Submitted to CEO": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "Viewed by CEO": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "CEO Feedback Received": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Closed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export const PERIODS = [
  "July 2026",
  "June 2026",
  "Q2 FY 2026-27",
  "May 2026",
] as const;
export type Period = (typeof PERIODS)[number];

export const LOCATIONS = ["Delhi HO", "Noida", "Jaipur", "Mumbai", "Field"] as const;

export type CeoComment = {
  at: string;
  by: string;
  text: string;
  kind: "Private comment" | "Clarification requested" | "Review note";
  hrResponse?: string;
  hrRespondedAt?: string;
};

export type CeoReport = {
  id: string;
  type: ReportType;
  period: Period;
  scope: string;
  stage: ReportStage;
  createdBy: string;
  createdOn: string;
  generatedAt: string;
  hrComments: string;
  submittedOn?: string;
  viewedOn?: string;
  reviewedOn?: string;
  ceoComments: CeoComment[];
  snapshot: { label: string; value: string }[];
  audit: AuditEntry[];
};

/* ---------------- calculated metrics (never manually editable) ---------------- */

const REAL = MASTER_EMPLOYEES.filter(
  (e) => !/test|duplicate/i.test(e.name) && !/TEST/i.test(e.empId),
);

export const activeEmployees = REAL.filter((e) => e.status !== "Exited");

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

export const workforce = () => {
  const byDept = new Map<string, number>();
  const byLoc = new Map<string, number>();
  const byType = new Map<string, number>();
  activeEmployees.forEach((e) => {
    byDept.set(e.dept, (byDept.get(e.dept) ?? 0) + 1);
    byLoc.set(e.location, (byLoc.get(e.location) ?? 0) + 1);
    byType.set(e.employmentType, (byType.get(e.employmentType) ?? 0) + 1);
  });
  const exits = REAL.filter((e) => e.status === "Exited");
  const joiners = REAL.filter((e) => /Jul 2026|Jun 2026/.test(e.doj));
  return {
    total: activeEmployees.length,
    byDept: [...byDept.entries()].sort((a, b) => b[1] - a[1]),
    byLoc: [...byLoc.entries()].sort((a, b) => b[1] - a[1]),
    byType: [...byType.entries()],
    probation: activeEmployees.filter((e) => e.status === "Probation").length,
    confirmed: activeEmployees.filter((e) => e.status === "Confirmed").length,
    notice: activeEmployees.filter((e) => e.status === "Notice Period").length,
    onboarding: activeEmployees.filter((e) => e.status === "Onboarding").length,
    joiners,
    exits,
    turnover: pct(exits.length, activeEmployees.length + exits.length),
  };
};

export const recruitment = () => {
  const open = HR_OPENINGS.filter((o) => o.status === "Open");
  const openPositions = open.reduce((s, o) => s + (o.positions - o.filled), 0);
  const shortlisted = HR_CANDIDATES.filter((c) =>
    ["Shortlisted", "Interview Scheduled", "Interview Completed", "Selected", "Offer Sent", "Offer Accepted", "Joining Confirmed", "Joined"].includes(c.stage),
  ).length;
  const interviewsDone = HR_CANDIDATES.filter((c) =>
    ["Interview Completed", "Selected", "Offer Sent", "Offer Accepted", "Joining Confirmed", "Joined"].includes(c.stage),
  ).length;
  const offers = HR_CANDIDATES.filter((c) =>
    ["Offer Sent", "Offer Accepted", "Joining Confirmed", "Joined"].includes(c.stage),
  ).length;
  const accepted = HR_CANDIDATES.filter((c) =>
    ["Offer Accepted", "Joining Confirmed", "Joined"].includes(c.stage),
  ).length;
  const joined = HR_CANDIDATES.filter((c) => c.stage === "Joined").length;
  const bySource = new Map<string, { total: number; joined: number }>();
  HR_CANDIDATES.forEach((c) => {
    const row = bySource.get(c.source) ?? { total: 0, joined: 0 };
    row.total += 1;
    if (c.stage === "Joined") row.joined += 1;
    bySource.set(c.source, row);
  });
  return {
    openPositions,
    requisitions: open.length,
    applications: HR_CANDIDATES.length,
    shortlisted,
    interviewsDone,
    offers,
    accepted,
    joined,
    timeToHire: 26,
    hiringCompletion: pct(joined, joined + openPositions),
    bySource: [...bySource.entries()].sort((a, b) => b[1].total - a[1].total),
  };
};

export const attendance = () => {
  const rows = ATTENDANCE_TODAY;
  const present = rows.filter((r) => ["Present", "Late", "Half Day", "Work From Home"].includes(r.status)).length;
  const absent = rows.filter((r) => r.status === "Absent").length;
  const late = rows.filter((r) => r.status === "Late" || r.lateStreak > 0).length;
  const onLeave = rows.filter((r) => r.status === "On Leave").length;
  const byDept = new Map<string, { present: number; total: number }>();
  rows.forEach((r) => {
    const row = byDept.get(r.dept) ?? { present: 0, total: 0 };
    row.total += 1;
    if (["Present", "Late", "Half Day", "Work From Home"].includes(r.status)) row.present += 1;
    byDept.set(r.dept, row);
  });
  return {
    presentRate: pct(present, rows.length),
    absenceRate: pct(absent, rows.length),
    lateRate: pct(late, rows.length),
    onLeave,
    leavesPending: LEAVE_REQUESTS.filter((l) => !["Approved", "Rejected", "Cancelled"].includes(l.stage)).length,
    regsPending: REGULARISATIONS.filter((r) => r.decision === "Pending").length,
    repeatedLate: rows.filter((r) => r.lateStreak >= 2),
    byDept: [...byDept.entries()],
  };
};

export const performance = () => {
  const completed = REVIEWS.filter((r) => ["Completed", "Closed", "Acknowledged"].includes(r.stage as string)).length;
  const due = REVIEWS.length - completed;
  const goalsDone = GOALS.filter((g) => g.status === "Completed").length;
  const mandatory = TRAININGS.filter((t) => t.mandatory);
  return {
    reviewsTotal: REVIEWS.length,
    reviewsCompleted: completed,
    reviewsDue: due,
    reviewsOverdue: REVIEWS.filter((r) => r.overdue).length,
    goalRate: pct(goalsDone, GOALS.length),
    trainingAssigned: TRAININGS.length,
    trainingCompleted: TRAININGS.filter((t) => t.status === "Completed").length,
    trainingOverdue: TRAININGS.filter((t) => t.status === "Overdue").length,
    mandatoryRate: pct(mandatory.filter((t) => t.status === "Completed").length, mandatory.length),
    pipsActive: PIPS.filter((p) => ["Active", "Review Due", "Extended"].includes(p.status)).length,
    risks: PIPS.filter((p) => ["Active", "Review Due", "Extended"].includes(p.status)).map((p) => ({
      dept: p.dept,
      text: `${p.dept} — improvement plan in progress (${p.status})`,
    })),
  };
};

export const movement = () => {
  const w = workforce();
  return {
    joiners: w.joiners,
    confirmations: REAL.filter((e) => e.status === "Confirmed" && /2026/.test(e.confirmationDate)).length,
    promotions: 2,
    transfers: 1,
    resignations: REAL.filter((e) => e.status === "Notice Period").length,
    terminations: 0,
    onNotice: REAL.filter((e) => e.status === "Notice Period"),
    upcomingExits: REAL.filter((e) => e.status === "Notice Period" || (e.status === "Exited" && !!e.exitDate)),
  };
};

export const access = () => ({
  pendingCreation: USER_ACCOUNTS.filter((a) => a.account === "Not Created").length,
  invitesNotAccepted: USER_ACCOUNTS.filter((a) => a.invite === "Sent" || a.invite === "Expired").length,
  lockedSuspended: USER_ACCOUNTS.filter((a) => a.account === "Locked" || a.account === "Suspended").length,
  privilegedChanges: USER_ACCOUNTS.filter((a) => (a.roleHistory ?? []).length > 0).length,
  pendingDeactivation: USER_ACCOUNTS.filter((a) => !!a.deactivationDue).length,
  exitedWithAccess: USER_ACCOUNTS.filter(
    (a) => a.employmentStatus === "Exited" && a.account === "Active",
  ),
  reviewsDue: USER_ACCOUNTS.filter((a) => a.failedLogins >= 3 || a.invite === "Expired").length,
});

export const risks = () => {
  const perf = performance();
  const acc = access();
  const att = attendance();
  const missingDocs = REAL.filter((e) => e.docs.some((d) => !d.ok) && e.status !== "Exited");
  const probationOverdue = activeEmployees.filter(
    (e) => e.status === "Probation" && e.reviewStatus === "Overdue",
  );
  const unackNotices = HR_DOCS.filter((d) => d.ack === "Awaiting" || d.ack === "Refused");
  const incompleteClearance = REAL.filter(
    (e) => (e.status === "Exited" || e.status === "Notice Period") && (e.clearance ?? []).some((c) => !c.done),
  );
  const criticalVacancies = HR_OPENINGS.filter((o) => o.status === "Open" && o.priority === "High");
  const onbMissing = ONBOARDING_RECORDS.filter((r) => r.docs.some((d) => d.status === "Missing")).length;

  const items = [
    { label: "Critical vacancies", count: criticalVacancies.length, level: criticalVacancies.length ? "high" : "ok", note: criticalVacancies.map((o) => o.title).join(", ") },
    { label: "Missing mandatory employee documents", count: missingDocs.length, level: missingDocs.length ? "high" : "ok", note: `${onbMissing} onboarding records also incomplete` },
    { label: "Probation reviews overdue", count: probationOverdue.length, level: probationOverdue.length ? "medium" : "ok", note: "Confirmation decisions pending" },
    { label: "Performance reviews overdue", count: perf.reviewsOverdue, level: perf.reviewsOverdue ? "medium" : "ok", note: "Manager follow-up required" },
    { label: "Unacknowledged official notices", count: unackNotices.length, level: unackNotices.length ? "medium" : "ok", note: "Aggregated — individual cases restricted" },
    { label: "Exits with incomplete clearance", count: incompleteClearance.length, level: incompleteClearance.length ? "high" : "ok", note: "Assets and handover pending" },
    { label: "Exited employees with active access", count: acc.exitedWithAccess.length, level: acc.exitedWithAccess.length ? "high" : "ok", note: "Security priority" },
    { label: "Mandatory training incomplete", count: perf.trainingAssigned - perf.trainingCompleted, level: perf.trainingOverdue ? "medium" : "low", note: `${perf.trainingOverdue} overdue` },
    { label: "Repeated attendance concerns", count: att.repeatedLate.length, level: att.repeatedLate.length ? "medium" : "ok", note: "Aggregated by department" },
    { label: "Sensitive access issues", count: acc.lockedSuspended + acc.invitesNotAccepted, level: acc.lockedSuspended ? "medium" : "low", note: "Locked, suspended or expired invitations" },
  ] as { label: string; count: number; level: "high" | "medium" | "low" | "ok"; note: string }[];

  return { items, critical: items.filter((i) => i.level === "high").length };
};

export const summaryCards = () => {
  const w = workforce();
  const r = recruitment();
  const a = attendance();
  const p = performance();
  const k = risks();
  return [
    { k: "Total workforce", v: w.total, hint: `${w.byDept.length} departments` },
    { k: "Employees joined", v: w.joiners.length, hint: "Selected period" },
    { k: "Employees exited", v: w.exits.length, hint: `Turnover ${w.turnover}%` },
    { k: "Open positions", v: r.openPositions, hint: `${r.requisitions} requisitions` },
    { k: "Hiring completion", v: `${r.hiringCompletion}%`, hint: `Avg ${r.timeToHire} days to hire` },
    { k: "Attendance rate", v: `${a.presentRate}%`, hint: `Absence ${a.absenceRate}%` },
    { k: "Reviews completed", v: `${p.reviewsCompleted}/${p.reviewsTotal}`, hint: `${p.reviewsOverdue} overdue` },
    { k: "Mandatory training", v: `${p.mandatoryRate}%`, hint: `${p.trainingOverdue} overdue` },
    { k: "Active improvement plans", v: p.pipsActive, hint: "Confidential detail restricted" },
    { k: "Critical HR risks", v: k.critical, hint: "Needs leadership attention" },
  ];
};

export const nowStamp = () =>
  new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const snap = (type: ReportType): { label: string; value: string }[] => {
  const w = workforce();
  const r = recruitment();
  const a = attendance();
  const p = performance();
  if (type === "Recruitment Report")
    return [
      { label: "Open positions", value: String(r.openPositions) },
      { label: "Applications", value: String(r.applications) },
      { label: "Offers accepted", value: String(r.accepted) },
      { label: "Avg time to hire", value: `${r.timeToHire} days` },
    ];
  if (type === "Attendance & Leave Report")
    return [
      { label: "Present rate", value: `${a.presentRate}%` },
      { label: "Absence rate", value: `${a.absenceRate}%` },
      { label: "Leave requests pending", value: String(a.leavesPending) },
      { label: "Regularisations pending", value: String(a.regsPending) },
    ];
  if (type === "Performance & Training Report")
    return [
      { label: "Reviews completed", value: `${p.reviewsCompleted}/${p.reviewsTotal}` },
      { label: "Goal completion", value: `${p.goalRate}%` },
      { label: "Mandatory training", value: `${p.mandatoryRate}%` },
      { label: "Improvement plans active", value: String(p.pipsActive) },
    ];
  return [
    { label: "Total workforce", value: String(w.total) },
    { label: "Joined", value: String(w.joiners.length) },
    { label: "Exited", value: String(w.exits.length) },
    { label: "Turnover", value: `${w.turnover}%` },
  ];
};

export const REPORTS: CeoReport[] = [
  {
    id: "RPT-2026-014",
    type: "Monthly HR Summary",
    period: "July 2026",
    scope: "All departments · All locations",
    stage: "CEO Feedback Received",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "01 Aug 2026",
    generatedAt: "01 Aug 2026 09:40",
    hrComments:
      "Headcount stable. Hiring for Field Engineer is the main gap; two support-staff onboardings are pending documents. Attendance healthy across departments.",
    submittedOn: "01 Aug 2026",
    viewedOn: "01 Aug 2026",
    ceoComments: [
      {
        at: "01 Aug 2026 18:20",
        by: "CEO",
        kind: "Clarification requested",
        text: "Why is Field Engineer hiring still open after 26 days? Share the plan for August.",
      },
    ],
    snapshot: snap("Monthly HR Summary"),
    audit: [
      { at: "01 Aug 2026 09:40", by: "Anjali Kapoor (HR Head)", text: "Report generated from live HR records" },
      { at: "01 Aug 2026 10:05", by: "Anjali Kapoor (HR Head)", text: "Submitted to CEO" },
      { at: "01 Aug 2026 18:10", by: "CEO", text: "Report viewed" },
    ],
  },
  {
    id: "RPT-2026-013",
    type: "HR Risk Report",
    period: "July 2026",
    scope: "All departments · All locations",
    stage: "Ready for Review",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "31 Jul 2026",
    generatedAt: "31 Jul 2026 17:15",
    hrComments:
      "Access risk is the priority: one exited employee still shows an active account. Clearance for the Projects exit is incomplete.",
    ceoComments: [],
    snapshot: snap("HR Risk Report"),
    audit: [{ at: "31 Jul 2026 17:15", by: "Anjali Kapoor (HR Head)", text: "Draft created" }],
  },
  {
    id: "RPT-2026-012",
    type: "Recruitment Report",
    period: "June 2026",
    scope: "Sales, Tech, Support Staff",
    stage: "Closed",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "02 Jul 2026",
    generatedAt: "02 Jul 2026 11:20",
    hrComments: "Referral remains the strongest source. Walk-in quality is weak for technical roles.",
    submittedOn: "02 Jul 2026",
    viewedOn: "02 Jul 2026",
    reviewedOn: "03 Jul 2026",
    ceoComments: [
      {
        at: "02 Jul 2026 20:00",
        by: "CEO",
        kind: "Private comment",
        text: "Double the referral incentive for engineer roles.",
        hrResponse: "Referral incentive revised from 5,000 to 10,000 for engineer roles from July.",
        hrRespondedAt: "03 Jul 2026 09:30",
      },
    ],
    snapshot: snap("Recruitment Report"),
    audit: [
      { at: "02 Jul 2026 11:20", by: "Anjali Kapoor (HR Head)", text: "Report generated" },
      { at: "03 Jul 2026 10:00", by: "CEO", text: "Marked reviewed" },
    ],
  },
  {
    id: "RPT-2026-011",
    type: "Attendance & Leave Report",
    period: "June 2026",
    scope: "All departments · Delhi HO",
    stage: "Draft",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "29 Jul 2026",
    generatedAt: "29 Jul 2026 16:00",
    hrComments: "",
    ceoComments: [],
    snapshot: snap("Attendance & Leave Report"),
    audit: [{ at: "29 Jul 2026 16:00", by: "Anjali Kapoor (HR Head)", text: "Draft created" }],
  },
];

export const buildSnapshot = snap;

export const PRIVACY_NOTE =
  "Reports show aggregated workforce information. Salary, bank, Aadhaar, PAN, medical and disciplinary details are excluded from CEO reports. Individual confidential cases are shared only when required and authorised. Every create, view, export and change is recorded.";
