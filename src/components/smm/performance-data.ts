/**
 * Social Media Account Manager — performance appraisal model.
 *
 * Every KPI value is derived from existing CRM records (Content Queue, Review &
 * Approval, Publishing Calendar, Social Accounts, Leads & Handover, Tasks &
 * Resources, Analytics). Nothing here is manually re-entered by the employee.
 */

export type PeriodKey = "monthly" | "quarterly" | "half" | "annual" | "custom";

export const PERF_PERIODS: { key: PeriodKey; label: string; span: string }[] = [
  { key: "monthly", label: "Monthly", span: "1 – 31 Jul 2026" },
  { key: "quarterly", label: "Quarterly", span: "1 Apr – 30 Jun 2026" },
  { key: "half", label: "Half-Yearly", span: "1 Jan – 30 Jun 2026" },
  { key: "annual", label: "Annual", span: "1 Aug 2025 – 31 Jul 2026" },
  { key: "custom", label: "Custom Period", span: "Custom range" },
];

export const EMPLOYEE = {
  name: "Ritika Sharma",
  role: "Social Media Account Manager",
  employeeId: "EMP-2213",
  manager: "Ashish Rathore (Marketing Head)",
  hr: "Sneha Kulkarni (HR Head)",
  targetsApprovedBy: "Ashish Rathore",
  targetsApprovedOn: "2026-06-28",
};

export type KpiStatus = "on_track" | "attention" | "below" | "na";

export const statusLabel: Record<KpiStatus, string> = {
  on_track: "On Track",
  attention: "Attention Required",
  below: "Below Target",
  na: "Not Applicable",
};

export type Kpi = {
  id: string;
  kpi: string;
  weight: number;
  target: string;
  actual: string;
  achievement: number; // %
  points: number;
  source: string;
  reason?: string;
  evidence: string[];
  status: KpiStatus;
  formula?: string;
};

export type Kra = {
  id: string;
  name: string;
  weight: number;
  intent: string;
  kpis: Kpi[];
  notes?: string[];
};

/* ------------------------------------------------- scoring bands (published) */

export const ONTIME_BANDS = [
  { min: 98, label: "98% or above", share: 1 },
  { min: 95, label: "95% – 97.99%", share: 13 / 15 },
  { min: 90, label: "90% – 94.99%", share: 10 / 15 },
  { min: 80, label: "80% – 89.99%", share: 6 / 15 },
  { min: 0, label: "Below 80%", share: 0 },
];

export function publishingBand(rate: number) {
  if (rate >= 98) return 15;
  if (rate >= 95) return 13;
  if (rate >= 90) return 10;
  if (rate >= 80) return 6;
  return 0;
}
export function qualityBand(rate: number) {
  if (rate >= 99) return 8;
  if (rate >= 97) return 6;
  if (rate >= 95) return 4;
  return 0;
}
export function handoverBand(rate: number) {
  if (rate >= 98) return 10;
  if (rate >= 95) return 8;
  if (rate >= 90) return 6;
  if (rate >= 80) return 3;
  return 0;
}

/* ------------------------------------------------------ underlying CRM counts */

export const RECORDS = {
  // publishing calendar
  scheduled: 27,
  publishedOnTime: 25,
  publishedLate: 2,
  missed: 0,
  approvedScheduleChanges: 2, // excluded from delays
  platformOutages: 1, // excluded from delays
  calendarUpdatedDays: 30,
  calendarDays: 31,
  formatErrors: 1,

  // review & approval
  received: 33,
  reviewedWithinTat: 30,
  avgReviewHours: 6.4,
  tatHours: 8,
  correctionsRequested: 9,
  errorsCaughtBeforePublish: 8,
  publishedTotal: 27,
  publishedWithError: 1,

  // leads & handover
  enquiries: 78,
  spamDuplicate: 12,
  genuineLeads: 66,
  handedWithinSla: 63,
  handedLate: 3,
  slaMinutes: 60,
  qualifiedBySales: 41,
  missingInfoReturns: 4,
  sourceRecorded: 64,

  // analytics (meaningful results)
  organicQualifiedLeads: 34,
  organicQualifiedTarget: 40,
  reach: 412000,
  reachTarget: 400000,
  watchTimeHours: 1860,
  watchTimeTarget: 2000,
  saves: 2140,
  savesTarget: 2000,
  shares: 980,
  sharesTarget: 1100,
  baselineQualified: 28,

  // accounts & safety
  accounts: 6,
  accountsHealthy: 5,
  messagesWithinSla: 182,
  messagesTotal: 196,
  securityViolations: 0,
  openSecurityInvestigations: 1,

  // discipline
  tasksAssigned: 46,
  tasksOnTime: 42,
  tasksLateDependency: 2, // dependency reported on time — excluded
  coordinationIssues: 1,
  recordsComplete: 43,
};

export function rate(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 10000) / 100 : 0;
}

export const ONTIME_PUBLISHING_RATE = rate(
  RECORDS.publishedOnTime,
  RECORDS.scheduled - RECORDS.approvedScheduleChanges - RECORDS.platformOutages,
);
export const ERROR_FREE_RATE = rate(
  RECORDS.publishedTotal - RECORDS.publishedWithError,
  RECORDS.publishedTotal,
);
export const ONTIME_HANDOVER_RATE = rate(RECORDS.handedWithinSla, RECORDS.genuineLeads);

/* --------------------------------------------------------------- KRA / KPI set */

export const KRAS: Kra[] = [
  {
    id: "kra1",
    name: "Publishing Execution",
    weight: 25,
    intent: "Was approved content published correctly and on time?",
    notes: [
      "Approved schedule changes and platform outages are excluded from delays.",
    ],
    kpis: [
      {
        id: "k1a",
        kpi: "Approved content published according to calendar",
        weight: 15,
        target: "98% on-time",
        actual: `${ONTIME_PUBLISHING_RATE}% (${RECORDS.publishedOnTime}/${RECORDS.scheduled - RECORDS.approvedScheduleChanges - RECORDS.platformOutages})`,
        achievement: ONTIME_PUBLISHING_RATE,
        points: publishingBand(ONTIME_PUBLISHING_RATE),
        source: "Publishing Calendar",
        formula: "On-time publishing rate = published on time ÷ content scheduled × 100",
        reason:
          publishingBand(ONTIME_PUBLISHING_RATE) < 15
            ? "2 posts published after the scheduled slot (C-214 Reel, C-221 Carousel)."
            : undefined,
        evidence: ["C-214 — published 3h late", "C-221 — published 1 day late", "2 approved schedule changes excluded"],
        status: publishingBand(ONTIME_PUBLISHING_RATE) >= 13 ? "attention" : "below",
      },
      {
        id: "k1b",
        kpi: "Correct platform, caption, link, tags and format",
        weight: 5,
        target: "0 format errors",
        actual: `${RECORDS.formatErrors} format error`,
        achievement: 80,
        points: 4,
        source: "Publishing Calendar · Review & Approval",
        reason: "C-208 published without the tracking link in the caption.",
        evidence: ["C-208 — missing tracking link (corrected in 40 min)"],
        status: "attention",
      },
      {
        id: "k1c",
        kpi: "Publishing calendar maintained and updated",
        weight: 5,
        target: "Updated daily",
        actual: `${RECORDS.calendarUpdatedDays}/${RECORDS.calendarDays} days updated`,
        achievement: rate(RECORDS.calendarUpdatedDays, RECORDS.calendarDays),
        points: 5,
        source: "Publishing Calendar",
        evidence: ["Calendar audit log — 30 of 31 days updated"],
        status: "on_track",
      },
    ],
  },
  {
    id: "kra2",
    name: "Content Review and Quality Control",
    weight: 20,
    intent: "Was content properly checked before it went live?",
    notes: ["One mistake is deducted only once, under a single KPI."],
    kpis: [
      {
        id: "k2a",
        kpi: "Content reviewed within approved turnaround time",
        weight: 8,
        target: `${RECORDS.tatHours}h turnaround`,
        actual: `${RECORDS.avgReviewHours}h average · ${RECORDS.reviewedWithinTat}/${RECORDS.received} within TAT`,
        achievement: rate(RECORDS.reviewedWithinTat, RECORDS.received),
        points: 7,
        source: "Review & Approval",
        reason: "3 submissions reviewed after the 8-hour turnaround.",
        evidence: ["C-203, C-217, C-226 — reviewed late"],
        status: "attention",
      },
      {
        id: "k2b",
        kpi: "Errors detected before publishing",
        weight: 4,
        target: "Catch 90% of errors pre-publish",
        actual: `${RECORDS.errorsCaughtBeforePublish} of 9 errors caught pre-publish`,
        achievement: rate(RECORDS.errorsCaughtBeforePublish, 9),
        points: 4,
        source: "Review & Approval",
        evidence: ["9 correction requests raised", "8 errors stopped before publishing"],
        status: "on_track",
      },
      {
        id: "k2c",
        kpi: "Content published without avoidable mistakes",
        weight: 8,
        target: "99% error-free",
        actual: `${ERROR_FREE_RATE}% (${RECORDS.publishedTotal - RECORDS.publishedWithError}/${RECORDS.publishedTotal})`,
        achievement: ERROR_FREE_RATE,
        points: qualityBand(ERROR_FREE_RATE),
        source: "Publishing Calendar · Review & Approval",
        formula: "Error-free publishing rate = correctly published ÷ total published × 100",
        reason: "C-219 published with an expired offer date (wrong offer).",
        evidence: ["C-219 — wrong offer date, post edited after 2h"],
        status: "attention",
      },
    ],
  },
  {
    id: "kra3",
    name: "Lead Capture and Sales Handover",
    weight: 20,
    intent: "Were genuine social enquiries captured and handed to Sales correctly?",
    notes: [
      "The original Lead ID is kept during handover.",
      "Sales Executive follow-up and closing are not scored here.",
    ],
    kpis: [
      {
        id: "k3a",
        kpi: "Genuine enquiries captured",
        weight: 5,
        target: "All genuine enquiries captured",
        actual: `${RECORDS.genuineLeads} genuine of ${RECORDS.enquiries} enquiries (${RECORDS.spamDuplicate} spam/duplicate)`,
        achievement: 100,
        points: 5,
        source: "Leads & Handover",
        evidence: ["78 enquiries logged", "12 marked spam/duplicate with reasons"],
        status: "on_track",
      },
      {
        id: "k3b",
        kpi: "Leads handed to Sales Head within approved SLA",
        weight: 10,
        target: `98% within ${RECORDS.slaMinutes} minutes`,
        actual: `${ONTIME_HANDOVER_RATE}% (${RECORDS.handedWithinSla}/${RECORDS.genuineLeads})`,
        achievement: ONTIME_HANDOVER_RATE,
        points: handoverBand(ONTIME_HANDOVER_RATE),
        source: "Leads & Handover",
        formula: "On-time handover rate = leads handed within SLA ÷ genuine leads × 100",
        reason: "3 leads handed over after the 60-minute SLA.",
        evidence: ["LEAD-24012 — 2h 10m", "LEAD-24044 — 1h 35m", "LEAD-24071 — 3h 05m"],
        status: "attention",
      },
      {
        id: "k3c",
        kpi: "Lead information and source recorded accurately",
        weight: 5,
        target: "100% complete records",
        actual: `${rate(RECORDS.sourceRecorded, RECORDS.genuineLeads)}% complete · ${RECORDS.missingInfoReturns} returned for missing information`,
        achievement: rate(RECORDS.sourceRecorded, RECORDS.genuineLeads),
        points: 4,
        source: "Leads & Handover",
        reason: "4 leads returned by Sales for missing city or requirement.",
        evidence: ["LEAD-24019, LEAD-24052, LEAD-24063, LEAD-24080 — missing information"],
        status: "attention",
      },
    ],
  },
  {
    id: "kra4",
    name: "Meaningful Social-Media Growth",
    weight: 15,
    intent: "Did the content produce useful business results, not vanity numbers?",
    notes: [
      "Purchased followers, fake engagement, unrelated viral reach and clickbait earn no points.",
      "Reported dependency gaps (content volume, budget, resources) are excluded.",
    ],
    kpis: [
      {
        id: "k4a",
        kpi: "Qualified enquiries from organic social content",
        weight: 6,
        target: `${RECORDS.organicQualifiedTarget} qualified organic leads`,
        actual: `${RECORDS.organicQualifiedLeads} qualified organic leads`,
        achievement: rate(RECORDS.organicQualifiedLeads, RECORDS.organicQualifiedTarget),
        points: 5,
        source: "Analytics · Leads & Handover",
        reason: "6 short of target; 2 weeks had no editor output (dependency reported on 08 Jul, partly excluded).",
        evidence: ["Analytics — organic lead attribution", "Dependency note DEP-118 (editor capacity)"],
        status: "attention",
      },
      {
        id: "k4b",
        kpi: "Relevant reach, watch time, saves and shares vs approved targets",
        weight: 5,
        target: "Reach 4.0L · Watch 2,000h · Saves 2,000 · Shares 1,100",
        actual: `Reach ${(RECORDS.reach / 100000).toFixed(1)}L · Watch ${RECORDS.watchTimeHours}h · Saves ${RECORDS.saves} · Shares ${RECORDS.shares}`,
        achievement: 94,
        points: 4,
        source: "Analytics",
        reason: "Watch time and shares below approved targets.",
        evidence: ["Analytics export — Jul 2026", "Targets approved 28 Jun 2026"],
        status: "attention",
      },
      {
        id: "k4c",
        kpi: "Improvement over approved baseline",
        weight: 4,
        target: `Above baseline of ${RECORDS.baselineQualified} qualified leads`,
        actual: `${RECORDS.organicQualifiedLeads} qualified leads (+${RECORDS.organicQualifiedLeads - RECORDS.baselineQualified} vs baseline)`,
        achievement: 100,
        points: 4,
        source: "Analytics",
        evidence: ["Baseline approved 28 Jun 2026 — 28 qualified leads"],
        status: "on_track",
      },
    ],
  },
  {
    id: "kra5",
    name: "Account Management and Safety",
    weight: 10,
    intent: "Are the company accounts healthy, responsive and safe?",
    notes: [
      "Security incidents are investigated first — no automatic deduction before responsibility is confirmed.",
    ],
    kpis: [
      {
        id: "k5a",
        kpi: "Social accounts maintained correctly",
        weight: 3,
        target: "All 6 accounts healthy",
        actual: `${RECORDS.accountsHealthy}/${RECORDS.accounts} healthy`,
        achievement: rate(RECORDS.accountsHealthy, RECORDS.accounts),
        points: 2.5,
        source: "Social Accounts",
        reason: "Google Business profile photos and hours not updated for 3 weeks.",
        evidence: ["ACC-GMB-01 — profile update pending"],
        status: "attention",
      },
      {
        id: "k5b",
        kpi: "Comments, messages and issues handled or escalated within SLA",
        weight: 3,
        target: "95% within SLA",
        actual: `${rate(RECORDS.messagesWithinSla, RECORDS.messagesTotal)}% (${RECORDS.messagesWithinSla}/${RECORDS.messagesTotal})`,
        achievement: rate(RECORDS.messagesWithinSla, RECORDS.messagesTotal),
        points: 2.5,
        source: "Social Accounts",
        reason: "14 messages answered after SLA, including 2 complaint messages.",
        evidence: ["Inbox SLA report — Jul 2026"],
        status: "attention",
      },
      {
        id: "k5c",
        kpi: "No avoidable security or compliance violations",
        weight: 4,
        target: "Zero confirmed violations",
        actual: "0 confirmed · 1 under investigation",
        achievement: 100,
        points: 4,
        source: "Social Accounts · Audit log",
        reason: "SEC-0114 (login from unrecognised device) under investigation — no deduction until responsibility is confirmed.",
        evidence: ["SEC-0114 — investigation open, HR informed"],
        status: "on_track",
      },
    ],
  },
  {
    id: "kra6",
    name: "Work Discipline and Coordination",
    weight: 10,
    intent: "Was assigned work finished on time with complete records?",
    notes: [
      "Attendance, personality, loyalty and manager preference are not scored here.",
    ],
    kpis: [
      {
        id: "k6a",
        kpi: "Assigned tasks completed within deadline",
        weight: 4,
        target: "95% on time",
        actual: `${rate(RECORDS.tasksOnTime, RECORDS.tasksAssigned - RECORDS.tasksLateDependency)}% (${RECORDS.tasksOnTime}/${RECORDS.tasksAssigned - RECORDS.tasksLateDependency})`,
        achievement: rate(RECORDS.tasksOnTime, RECORDS.tasksAssigned - RECORDS.tasksLateDependency),
        points: 3.5,
        source: "Tasks & Resources",
        reason: "2 tasks late; 2 dependency delays excluded (reported before deadline).",
        evidence: ["TSK-1180, TSK-1194 — late", "DEP-118, DEP-121 — excluded"],
        status: "attention",
      },
      {
        id: "k6b",
        kpi: "Coordination with Video Editor and Sales Head",
        weight: 3,
        target: "No unresolved coordination gaps",
        actual: `${RECORDS.coordinationIssues} gap reported`,
        achievement: 85,
        points: 2.5,
        source: "Content Queue · Leads & Handover",
        reason: "One brief sent to the editor without reference files (C-226).",
        evidence: ["C-226 — brief returned by editor"],
        status: "attention",
      },
      {
        id: "k6c",
        kpi: "CRM records, proof and next actions kept complete",
        weight: 3,
        target: "100% complete",
        actual: `${rate(RECORDS.recordsComplete, RECORDS.tasksAssigned)}% complete`,
        achievement: rate(RECORDS.recordsComplete, RECORDS.tasksAssigned),
        points: 2.5,
        source: "Tasks & Resources · Content Queue",
        reason: "3 tasks closed without publishing proof attached.",
        evidence: ["TSK-1171, TSK-1188, TSK-1199 — proof missing"],
        status: "attention",
      },
    ],
  },
];

/* -------------------------------------------------------------- score helpers */

export function kraEarned(kra: Kra) {
  return kra.kpis.filter((k) => k.status !== "na").reduce((s, k) => s + k.points, 0);
}
export function kraApplicableWeight(kra: Kra) {
  return kra.kpis.filter((k) => k.status !== "na").reduce((s, k) => s + k.weight, 0);
}

export function totalScore() {
  const earned = KRAS.reduce((s, k) => s + kraEarned(k), 0);
  const applicable = KRAS.reduce((s, k) => s + kraApplicableWeight(k), 0);
  // Applicable weights are re-based to 100 when a KPI is Not Applicable.
  return Math.round((earned / applicable) * 1000) / 10;
}

export const INCREMENT_BANDS = [
  { min: 90, label: "90 – 100", outcome: "Eligible for 100% of the approved increment", tone: "good" as const },
  { min: 80, label: "80 – 89.99", outcome: "Eligible for 75% of the approved increment", tone: "good" as const },
  { min: 70, label: "70 – 79.99", outcome: "Eligible for 50% of the approved increment", tone: "warn" as const },
  { min: 60, label: "60 – 69.99", outcome: "No increment; improvement plan required", tone: "bad" as const },
  { min: 0, label: "Below 60", outcome: "Critical performance review", tone: "bad" as const },
];

export function incrementBand(score: number) {
  return INCREMENT_BANDS.find((b) => score >= b.min)!;
}

export function ratingLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Satisfactory";
  if (score >= 60) return "Needs Improvement";
  return "Critical";
}

export const MONTHLY_TREND = [
  { month: "Aug 25", score: 74.5 },
  { month: "Sep 25", score: 78.0 },
  { month: "Oct 25", score: 81.2 },
  { month: "Nov 25", score: 79.4 },
  { month: "Dec 25", score: 83.6 },
  { month: "Jan 26", score: 85.1 },
  { month: "Feb 26", score: 82.7 },
  { month: "Mar 26", score: 86.9 },
  { month: "Apr 26", score: 88.4 },
  { month: "May 26", score: 84.2 },
  { month: "Jun 26", score: 87.1 },
  { month: "Jul 26", score: totalScore() },
];

export const PREVIOUS_SCORE = 87.1;
export const ANNUAL_AVERAGE =
  Math.round((MONTHLY_TREND.reduce((s, m) => s + m.score, 0) / MONTHLY_TREND.length) * 10) / 10;

/* -------------------------------------------------------------- detail reports */

export const PUBLISHING_REPORT = [
  { label: "Scheduled", value: RECORDS.scheduled },
  { label: "Published", value: RECORDS.publishedOnTime + RECORDS.publishedLate },
  { label: "On time", value: RECORDS.publishedOnTime },
  { label: "Delayed", value: RECORDS.publishedLate },
  { label: "Missed", value: RECORDS.missed },
  { label: "Error corrected after publish", value: 2 },
  { label: "Excluded — approved changes / outages", value: RECORDS.approvedScheduleChanges + RECORDS.platformOutages },
];

export const REVIEW_REPORT = [
  { label: "Content received", value: RECORDS.received },
  { label: "Reviewed within TAT", value: RECORDS.reviewedWithinTat },
  { label: "Average review time", value: `${RECORDS.avgReviewHours}h` },
  { label: "Corrections requested", value: RECORDS.correctionsRequested },
  { label: "Content approved", value: RECORDS.publishedTotal },
  { label: "Avoidable published errors", value: RECORDS.publishedWithError },
];

export const HANDOVER_REPORT = [
  { label: "Enquiries received", value: RECORDS.enquiries },
  { label: "Genuine leads", value: RECORDS.genuineLeads },
  { label: "Handed within SLA", value: RECORDS.handedWithinSla },
  { label: "Handed late", value: RECORDS.handedLate },
  { label: "Qualified by Sales", value: RECORDS.qualifiedBySales },
  { label: "Returned — missing information", value: RECORDS.missingInfoReturns },
];

export const SOCIAL_RESULTS = [
  { label: "Meaningful reach", actual: RECORDS.reach, target: RECORDS.reachTarget, unit: "" },
  { label: "Watch time (hours)", actual: RECORDS.watchTimeHours, target: RECORDS.watchTimeTarget, unit: "h" },
  { label: "Saves", actual: RECORDS.saves, target: RECORDS.savesTarget, unit: "" },
  { label: "Shares", actual: RECORDS.shares, target: RECORDS.sharesTarget, unit: "" },
  { label: "Organic qualified leads", actual: RECORDS.organicQualifiedLeads, target: RECORDS.organicQualifiedTarget, unit: "" },
];

export const ACCOUNT_HEALTH = [
  { account: "Instagram — @cleancraft.india", status: "healthy", issues: 0, sla: "96%", alert: "—" },
  { account: "YouTube — Clean Craft", status: "healthy", issues: 0, sla: "94%", alert: "—" },
  { account: "Facebook — Clean Craft India", status: "healthy", issues: 1, sla: "91%", alert: "2 complaint messages answered late" },
  { account: "Google Business — Head Office", status: "attention", issues: 2, sla: "88%", alert: "Photos and hours update pending" },
  { account: "LinkedIn — Clean Craft", status: "healthy", issues: 0, sla: "97%", alert: "—" },
  { account: "X — @cleancraft", status: "attention", issues: 1, sla: "82%", alert: "SEC-0114 login investigation open" },
];

/* ------------------------------------------------------- workflow, audit, PIP */

export const REVIEW_FLOW = [
  { stage: "System Calculates", done: true, at: "2026-08-01 02:00", by: "CRM" },
  { stage: "Manager Reviews Evidence", done: true, at: "2026-08-03 11:20", by: EMPLOYEE.targetsApprovedBy },
  { stage: "Employee Acknowledges", done: false, at: "Pending", by: EMPLOYEE.name },
  { stage: "HR Audits", done: false, at: "Pending", by: EMPLOYEE.hr },
  { stage: "HR Locks Score", done: false, at: "Pending", by: EMPLOYEE.hr },
  { stage: "CEO Summary Updated", done: false, at: "Pending", by: "System" },
];

export const AUDIT_TRAIL = [
  { at: "2026-06-28 16:10", actor: "Ashish Rathore", action: "Targets and baselines created and approved for Jul 2026" },
  { at: "2026-06-28 16:12", actor: "Sneha Kulkarni (HR)", action: "KPI formulas and weights approved and published to employee" },
  { at: "2026-08-01 02:00", actor: "System", action: "Score calculated from Content Queue, Review, Calendar, Accounts, Leads, Tasks, Analytics" },
  { at: "2026-08-01 02:00", actor: "System", action: "2 approved schedule changes and 1 platform outage excluded from delay count" },
  { at: "2026-08-02 09:40", actor: "System", action: "DEP-118 and DEP-121 dependency delays excluded (reported before deadline)" },
  { at: "2026-08-03 11:20", actor: "Ashish Rathore", action: "Evidence reviewed; manual adjustment +0.5 on KPI k5a with reason and approval" },
  { at: "2026-08-03 11:25", actor: "Ashish Rathore", action: "Comment added — does not change system-generated score" },
];

export const MANAGER_COMMENT =
  "Strong month on capture accuracy and calendar discipline. Priority for August: publish on the scheduled slot and cut handover time below 60 minutes.";

export const IMPROVEMENT_PLAN = {
  active: false,
  triggerNote: "An improvement plan is created only when the score is below 70. It is not a warning or disciplinary action.",
  template: [
    "Performance issue",
    "Evidence",
    "Required improvement",
    "Support or training",
    "Measurable target",
    "Start date",
    "Review date",
    "Responsible manager",
    "Progress status",
    "Final outcome",
  ],
};

export const FAIRNESS_RULES = [
  "All targets were approved before the review period started and are visible to the employee.",
  "Targets and formulas cannot be changed retrospectively.",
  "The same incident is never deducted under more than one KPI.",
  "Approved leave, system outages and authorised schedule changes are excluded.",
  "Dependency delays reported before the deadline do not reduce the score.",
  "A KPI is not scored when the related work was never assigned; remaining weights are re-based to 100.",
  "Increment decisions use the annual average, not only the latest month.",
  "Manager comments cannot secretly change system-generated scores.",
  "Every manual adjustment needs evidence, reason and approval.",
  "The employee may raise a score-review request before HR locks the score.",
];

export const DATA_SOURCES = [
  "Content Queue",
  "Review & Approval",
  "Publishing Calendar",
  "Social Accounts",
  "Leads & Handover",
  "Tasks & Resources",
  "Analytics",
];

export function ceoSummary() {
  const score = totalScore();
  return {
    employee: EMPLOYEE.name,
    role: EMPLOYEE.role,
    score,
    annualAverage: ANNUAL_AVERAGE,
    eligibility: incrementBand(score).outcome,
    publishingCompliance: `${ONTIME_PUBLISHING_RATE}%`,
    contentErrorRate: `${Math.round((100 - ERROR_FREE_RATE) * 100) / 100}%`,
    handoverCompliance: `${ONTIME_HANDOVER_RATE}%`,
    qualifiedOrganicLeads: RECORDS.organicQualifiedLeads,
    accountRisks: "1 security investigation open (SEC-0114); Google Business profile update pending",
    improvementPlan: score < 70 ? "Required" : "Not required",
    trend: score >= PREVIOUS_SCORE ? "Improving" : "Slight decline",
    exceptions: "1 avoidable published error (C-219 wrong offer date)",
  };
}
