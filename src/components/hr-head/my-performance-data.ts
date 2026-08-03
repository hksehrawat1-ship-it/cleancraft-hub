// HR Head Performance — calculated metric definitions and workflow-derived sample records.
// All figures here are derived from HR workflow records (see PERIOD_RECORDS) and are
// never manually editable in the UI.

export type PeriodKey = "month" | "quarter" | "year" | "custom";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
  custom: "Custom Date Range",
};

export type Status = "On Track" | "Needs Attention" | "Critical";

export const STATUS_TONE: Record<Status, string> = {
  "On Track": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "Needs Attention": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Critical: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
};

export const STATUS_BAR: Record<Status, string> = {
  "On Track": "bg-emerald-500",
  "Needs Attention": "bg-amber-500",
  Critical: "bg-red-500",
};

/** Raw workflow counters per reporting period. Test/duplicate records already excluded. */
export type PeriodRecord = {
  label: string;
  range: string;
  excluded: { test: number; duplicate: number };
  // recruitment
  positionsOpened: number;
  positionsFilled: number;
  timeToHireDays: number;
  offersMade: number;
  offersAccepted: number;
  candidatesJoined: number;
  vacanciesOverdue: number;
  hiringTarget: number;
  // onboarding
  onboarded: number;
  onboardingBeforeJoining: number;
  lettersOnTime: number;
  lettersDue: number;
  docsVerified: number;
  docsRequired: number;
  accountsBeforeJoining: number;
  accountsDue: number;
  onboardingTasksOverdue: number;
  // employee service
  leaveTotal: number;
  leaveOnTime: number;
  leaveAvgHours: number;
  docRequests: number;
  docRequestsDone: number;
  hrLettersIssued: number;
  employeeRequestsPending: number;
  hrResponseHours: number;
  // performance & training
  reviewsScheduled: number;
  reviewsCompletedOnTime: number;
  managerFeedbackPending: number;
  pipReviewsDone: number;
  pipReviewsTotal: number;
  trainingAssigned: number;
  mandatoryTrainingTotal: number;
  mandatoryTrainingDone: number;
  trainingOverdue: number;
  // letters & acknowledgements
  noticesIssued: number;
  acksReceived: number;
  acksPending: number;
  docsAwaitingApproval: number;
  docProcessingDays: number;
  // user access
  invitationsSent: number;
  invitationsAccepted: number;
  accessRequestsPending: number;
  passwordResets: number;
  passwordResetsResolved: number;
  exitsDeactivatedOnTime: number;
  exitsTotal: number;
  accessRisksOpen: number;
  // HR actions
  hrActionsTotal: number;
  hrActionsOnTime: number;
  // delay attribution
  delaysHrControl: number;
  delaysAwaitingCeo: number;
  delaysAwaitingManager: number;
};

export const PERIOD_RECORDS: Record<PeriodKey, PeriodRecord> = {
  month: {
    label: "This Month",
    range: "1 Aug 2026 – 3 Aug 2026",
    excluded: { test: 2, duplicate: 1 },
    positionsOpened: 6,
    positionsFilled: 5,
    timeToHireDays: 21,
    offersMade: 6,
    offersAccepted: 5,
    candidatesJoined: 5,
    vacanciesOverdue: 1,
    hiringTarget: 6,
    onboarded: 5,
    onboardingBeforeJoining: 4,
    lettersOnTime: 5,
    lettersDue: 5,
    docsVerified: 84,
    docsRequired: 90,
    accountsBeforeJoining: 4,
    accountsDue: 5,
    onboardingTasksOverdue: 2,
    leaveTotal: 34,
    leaveOnTime: 31,
    leaveAvgHours: 9,
    docRequests: 18,
    docRequestsDone: 17,
    hrLettersIssued: 11,
    employeeRequestsPending: 3,
    hrResponseHours: 6,
    reviewsScheduled: 12,
    reviewsCompletedOnTime: 9,
    managerFeedbackPending: 4,
    pipReviewsDone: 2,
    pipReviewsTotal: 3,
    trainingAssigned: 22,
    mandatoryTrainingTotal: 26,
    mandatoryTrainingDone: 21,
    trainingOverdue: 3,
    noticesIssued: 3,
    acksReceived: 24,
    acksPending: 6,
    docsAwaitingApproval: 4,
    docProcessingDays: 1.6,
    invitationsSent: 6,
    invitationsAccepted: 5,
    accessRequestsPending: 2,
    passwordResets: 7,
    passwordResetsResolved: 7,
    exitsDeactivatedOnTime: 2,
    exitsTotal: 3,
    accessRisksOpen: 1,
    hrActionsTotal: 96,
    hrActionsOnTime: 85,
    delaysHrControl: 5,
    delaysAwaitingCeo: 3,
    delaysAwaitingManager: 3,
  },
  quarter: {
    label: "This Quarter",
    range: "1 Jul 2026 – 3 Aug 2026",
    excluded: { test: 4, duplicate: 3 },
    positionsOpened: 14,
    positionsFilled: 12,
    timeToHireDays: 24,
    offersMade: 15,
    offersAccepted: 13,
    candidatesJoined: 12,
    vacanciesOverdue: 2,
    hiringTarget: 14,
    onboarded: 12,
    onboardingBeforeJoining: 10,
    lettersOnTime: 11,
    lettersDue: 12,
    docsVerified: 198,
    docsRequired: 216,
    accountsBeforeJoining: 10,
    accountsDue: 12,
    onboardingTasksOverdue: 4,
    leaveTotal: 96,
    leaveOnTime: 88,
    leaveAvgHours: 11,
    docRequests: 46,
    docRequestsDone: 43,
    hrLettersIssued: 29,
    employeeRequestsPending: 5,
    hrResponseHours: 7,
    reviewsScheduled: 28,
    reviewsCompletedOnTime: 22,
    managerFeedbackPending: 6,
    pipReviewsDone: 4,
    pipReviewsTotal: 6,
    trainingAssigned: 54,
    mandatoryTrainingTotal: 62,
    mandatoryTrainingDone: 50,
    trainingOverdue: 7,
    noticesIssued: 7,
    acksReceived: 61,
    acksPending: 12,
    docsAwaitingApproval: 6,
    docProcessingDays: 1.9,
    invitationsSent: 14,
    invitationsAccepted: 12,
    accessRequestsPending: 3,
    passwordResets: 19,
    passwordResetsResolved: 18,
    exitsDeactivatedOnTime: 5,
    exitsTotal: 7,
    accessRisksOpen: 2,
    hrActionsTotal: 248,
    hrActionsOnTime: 214,
    delaysHrControl: 14,
    delaysAwaitingCeo: 9,
    delaysAwaitingManager: 11,
  },
  year: {
    label: "This Year",
    range: "1 Jan 2026 – 3 Aug 2026",
    excluded: { test: 9, duplicate: 6 },
    positionsOpened: 42,
    positionsFilled: 37,
    timeToHireDays: 26,
    offersMade: 44,
    offersAccepted: 39,
    candidatesJoined: 37,
    vacanciesOverdue: 3,
    hiringTarget: 40,
    onboarded: 37,
    onboardingBeforeJoining: 31,
    lettersOnTime: 34,
    lettersDue: 37,
    docsVerified: 588,
    docsRequired: 666,
    accountsBeforeJoining: 32,
    accountsDue: 37,
    onboardingTasksOverdue: 6,
    leaveTotal: 284,
    leaveOnTime: 259,
    leaveAvgHours: 12,
    docRequests: 132,
    docRequestsDone: 124,
    hrLettersIssued: 88,
    employeeRequestsPending: 8,
    hrResponseHours: 8,
    reviewsScheduled: 84,
    reviewsCompletedOnTime: 64,
    managerFeedbackPending: 9,
    pipReviewsDone: 9,
    pipReviewsTotal: 12,
    trainingAssigned: 148,
    mandatoryTrainingTotal: 168,
    mandatoryTrainingDone: 138,
    trainingOverdue: 11,
    noticesIssued: 18,
    acksReceived: 172,
    acksPending: 21,
    docsAwaitingApproval: 8,
    docProcessingDays: 2.1,
    invitationsSent: 41,
    invitationsAccepted: 37,
    accessRequestsPending: 4,
    passwordResets: 58,
    passwordResetsResolved: 56,
    exitsDeactivatedOnTime: 14,
    exitsTotal: 18,
    accessRisksOpen: 2,
    hrActionsTotal: 712,
    hrActionsOnTime: 618,
    delaysHrControl: 38,
    delaysAwaitingCeo: 26,
    delaysAwaitingManager: 30,
  },
  custom: {
    label: "Custom Date Range",
    range: "custom",
    excluded: { test: 1, duplicate: 1 },
    positionsOpened: 9,
    positionsFilled: 8,
    timeToHireDays: 22,
    offersMade: 9,
    offersAccepted: 8,
    candidatesJoined: 8,
    vacanciesOverdue: 1,
    hiringTarget: 9,
    onboarded: 8,
    onboardingBeforeJoining: 7,
    lettersOnTime: 8,
    lettersDue: 8,
    docsVerified: 132,
    docsRequired: 144,
    accountsBeforeJoining: 7,
    accountsDue: 8,
    onboardingTasksOverdue: 2,
    leaveTotal: 61,
    leaveOnTime: 57,
    leaveAvgHours: 10,
    docRequests: 29,
    docRequestsDone: 28,
    hrLettersIssued: 19,
    employeeRequestsPending: 3,
    hrResponseHours: 6,
    reviewsScheduled: 18,
    reviewsCompletedOnTime: 14,
    managerFeedbackPending: 4,
    pipReviewsDone: 3,
    pipReviewsTotal: 4,
    trainingAssigned: 36,
    mandatoryTrainingTotal: 41,
    mandatoryTrainingDone: 34,
    trainingOverdue: 4,
    noticesIssued: 4,
    acksReceived: 39,
    acksPending: 8,
    docsAwaitingApproval: 5,
    docProcessingDays: 1.7,
    invitationsSent: 9,
    invitationsAccepted: 8,
    accessRequestsPending: 2,
    passwordResets: 12,
    passwordResetsResolved: 12,
    exitsDeactivatedOnTime: 3,
    exitsTotal: 4,
    accessRisksOpen: 1,
    hrActionsTotal: 154,
    hrActionsOnTime: 137,
    delaysHrControl: 8,
    delaysAwaitingCeo: 5,
    delaysAwaitingManager: 6,
  },
};

/** Previous-period comparison values, keyed by the same period selector. */
export const PREVIOUS_RECORDS: Record<PeriodKey, PeriodRecord> = {
  month: { ...PERIOD_RECORDS.month, label: "Previous Month", range: "1 Jul 2026 – 31 Jul 2026", positionsFilled: 4, hiringTarget: 6, timeToHireDays: 25, onboardingBeforeJoining: 3, docsVerified: 78, docsRequired: 90, leaveOnTime: 26, leaveTotal: 32, reviewsCompletedOnTime: 7, reviewsScheduled: 12, mandatoryTrainingDone: 18, mandatoryTrainingTotal: 26, hrActionsOnTime: 78, hrActionsTotal: 96 },
  quarter: { ...PERIOD_RECORDS.quarter, label: "Previous Quarter", range: "1 Apr 2026 – 30 Jun 2026", positionsFilled: 10, hiringTarget: 14, timeToHireDays: 28, onboardingBeforeJoining: 8, docsVerified: 176, docsRequired: 216, leaveOnTime: 79, leaveTotal: 94, reviewsCompletedOnTime: 18, reviewsScheduled: 28, mandatoryTrainingDone: 44, mandatoryTrainingTotal: 62, hrActionsOnTime: 196, hrActionsTotal: 248 },
  year: { ...PERIOD_RECORDS.year, label: "Previous Year", range: "1 Jan 2025 – 31 Dec 2025", positionsFilled: 31, hiringTarget: 40, timeToHireDays: 31, onboardingBeforeJoining: 24, docsVerified: 512, docsRequired: 666, leaveOnTime: 228, leaveTotal: 276, reviewsCompletedOnTime: 55, reviewsScheduled: 84, mandatoryTrainingDone: 118, mandatoryTrainingTotal: 168, hrActionsOnTime: 566, hrActionsTotal: 712 },
  custom: { ...PERIOD_RECORDS.custom, label: "Preceding Range", range: "preceding equal range", positionsFilled: 7, hiringTarget: 9, timeToHireDays: 24, onboardingBeforeJoining: 6, docsVerified: 121, docsRequired: 144, leaveOnTime: 50, leaveTotal: 59, reviewsCompletedOnTime: 12, reviewsScheduled: 18, mandatoryTrainingDone: 29, mandatoryTrainingTotal: 41, hrActionsOnTime: 122, hrActionsTotal: 154 },
};

export const pct = (num: number, den: number) => (den === 0 ? 0 : Math.round((num / den) * 100));

/** Higher-is-better status thresholds. */
export function statusFor(value: number, good: number, warn: number): Status {
  if (value >= good) return "On Track";
  if (value >= warn) return "Needs Attention";
  return "Critical";
}

/** Lower-is-better status thresholds (days/hours). */
export function statusForLower(value: number, good: number, warn: number): Status {
  if (value <= good) return "On Track";
  if (value <= warn) return "Needs Attention";
  return "Critical";
}

export type Kpi = {
  key: string;
  label: string;
  value: string;
  numeric: number;
  prev: number;
  unit: "%" | "days";
  status: Status;
  formula: string;
  source: string;
};

export function buildKpis(cur: PeriodRecord, prev: PeriodRecord): Kpi[] {
  const k = (
    key: string,
    label: string,
    numeric: number,
    prevVal: number,
    unit: "%" | "days",
    status: Status,
    formula: string,
    source: string,
  ): Kpi => ({
    key,
    label,
    numeric,
    prev: prevVal,
    unit,
    value: unit === "%" ? `${numeric}%` : `${numeric} days`,
    status,
    formula,
    source,
  });

  const hiring = pct(cur.positionsFilled, cur.hiringTarget);
  const hiringPrev = pct(prev.positionsFilled, prev.hiringTarget);
  const onboard = pct(cur.onboardingBeforeJoining, cur.onboarded);
  const onboardPrev = pct(prev.onboardingBeforeJoining, prev.onboarded);
  const docs = pct(cur.docsVerified, cur.docsRequired);
  const docsPrev = pct(prev.docsVerified, prev.docsRequired);
  const leave = pct(cur.leaveOnTime, cur.leaveTotal);
  const leavePrev = pct(prev.leaveOnTime, prev.leaveTotal);
  const reviews = pct(cur.reviewsCompletedOnTime, cur.reviewsScheduled);
  const reviewsPrev = pct(prev.reviewsCompletedOnTime, prev.reviewsScheduled);
  const training = pct(cur.mandatoryTrainingDone, cur.mandatoryTrainingTotal);
  const trainingPrev = pct(prev.mandatoryTrainingDone, prev.mandatoryTrainingTotal);
  const actions = pct(cur.hrActionsOnTime, cur.hrActionsTotal);
  const actionsPrev = pct(prev.hrActionsOnTime, prev.hrActionsTotal);

  return [
    k("hiring", "Hiring Target Achievement", hiring, hiringPrev, "%", statusFor(hiring, 90, 75),
      "Positions filled ÷ approved hiring target for the period × 100.",
      "Recruitment records (openings, joined candidates)."),
    k("tth", "Average Time to Hire", cur.timeToHireDays, prev.timeToHireDays, "days", statusForLower(cur.timeToHireDays, 22, 30),
      "Mean days from position approval date to candidate joining date.",
      "Recruitment pipeline stage timestamps."),
    k("onboard", "Onboarding Completed on Time", onboard, onboardPrev, "%", statusFor(onboard, 90, 75),
      "Onboarding checklists fully completed before the joining date ÷ new employees onboarded × 100.",
      "Onboarding & Documents records."),
    k("docs", "Employee Document Compliance", docs, docsPrev, "%", statusFor(docs, 95, 85),
      "Verified mandatory documents ÷ mandatory documents required across active employees × 100.",
      "Employee master document matrix."),
    k("leave", "Leave Requests Processed on Time", leave, leavePrev, "%", statusFor(leave, 95, 85),
      "Leave requests actioned within the SLA ÷ total leave requests received × 100. Requests waiting on a manager approval are excluded.",
      "Attendance & Leave workflow log."),
    k("reviews", "Performance Reviews Completed", reviews, reviewsPrev, "%", statusFor(reviews, 90, 70),
      "Reviews closed on or before the scheduled close date ÷ reviews scheduled × 100.",
      "Performance review cycle records."),
    k("training", "Mandatory Training Completion", training, trainingPrev, "%", statusFor(training, 90, 75),
      "Mandatory trainings marked complete ÷ mandatory trainings assigned × 100.",
      "Training assignment records."),
    k("actions", "HR Actions Completed on Time", actions, actionsPrev, "%", statusFor(actions, 90, 80),
      "All HR workflow actions (letters, requests, verifications, access changes) closed within SLA ÷ total actions × 100.",
      "Consolidated HR workflow audit trail."),
  ];
}

export type Metric = {
  label: string;
  value: string;
  tip: string;
  status?: Status;
};

export type Responsibility = {
  key: string;
  title: string;
  status: Status;
  headline: string;
  metrics: Metric[];
};

export function buildResponsibilities(c: PeriodRecord): Responsibility[] {
  const offerToJoin = pct(c.candidatesJoined, c.offersAccepted);
  const hiring = pct(c.positionsFilled, c.hiringTarget);
  const onboardPct = pct(c.onboardingBeforeJoining, c.onboarded);
  const leavePct = pct(c.leaveOnTime, c.leaveTotal);
  const reviewPct = pct(c.reviewsCompletedOnTime, c.reviewsScheduled);
  const trainPct = pct(c.mandatoryTrainingDone, c.mandatoryTrainingTotal);
  const ackPct = pct(c.acksReceived, c.acksReceived + c.acksPending);
  const exitPct = pct(c.exitsDeactivatedOnTime, c.exitsTotal);

  return [
    {
      key: "recruitment",
      title: "Recruitment Performance",
      status: statusFor(hiring, 90, 75),
      headline: `${c.positionsFilled} of ${c.hiringTarget} target positions filled`,
      metrics: [
        { label: "Positions opened", value: String(c.positionsOpened), tip: "Approved openings created in the selected period." },
        { label: "Positions filled", value: String(c.positionsFilled), tip: "Openings closed with a joined candidate." },
        { label: "Average time to hire", value: `${c.timeToHireDays} days`, tip: "Mean days from opening approval to joining.", status: statusForLower(c.timeToHireDays, 22, 30) },
        { label: "Offers accepted", value: `${c.offersAccepted} of ${c.offersMade}`, tip: "Offers accepted ÷ offers released." },
        { label: "Candidates joined", value: String(c.candidatesJoined), tip: "Candidates who actually joined on or after their offer." },
        { label: "Offer-to-joining rate", value: `${offerToJoin}%`, tip: "Joined candidates ÷ accepted offers × 100.", status: statusFor(offerToJoin, 90, 80) },
        { label: "Vacancies overdue", value: String(c.vacanciesOverdue), tip: "Openings past their agreed closure date.", status: statusForLower(c.vacanciesOverdue, 0, 2) },
      ],
    },
    {
      key: "onboarding",
      title: "Onboarding Performance",
      status: statusFor(onboardPct, 90, 75),
      headline: `${onboardPct}% onboarded fully before joining date`,
      metrics: [
        { label: "New employees onboarded", value: String(c.onboarded), tip: "Employees converted from candidate to active in the period." },
        { label: "Onboarding completed before joining", value: `${c.onboardingBeforeJoining} of ${c.onboarded}`, tip: "18-point checklist closed before the joining date." },
        { label: "Appointment letters issued on time", value: `${c.lettersOnTime} of ${c.lettersDue}`, tip: "Appointment letters released on or before joining date." },
        { label: "Mandatory documents verified", value: `${c.docsVerified} of ${c.docsRequired}`, tip: "Verified mandatory documents against the required document matrix." },
        { label: "User accounts created before joining", value: `${c.accountsBeforeJoining} of ${c.accountsDue}`, tip: "System access created before the joining date." },
        { label: "Onboarding tasks overdue", value: String(c.onboardingTasksOverdue), tip: "Open onboarding tasks past due date and inside HR control.", status: statusForLower(c.onboardingTasksOverdue, 0, 3) },
      ],
    },
    {
      key: "service",
      title: "Employee Service Performance",
      status: statusFor(leavePct, 95, 85),
      headline: `${leavePct}% of employee requests handled within SLA`,
      metrics: [
        { label: "Leave requests processed", value: `${c.leaveOnTime} of ${c.leaveTotal}`, tip: "Leave requests actioned by HR within SLA." },
        { label: "Average leave-processing time", value: `${c.leaveAvgHours} hrs`, tip: "Mean hours from leave submission to HR action.", status: statusForLower(c.leaveAvgHours, 12, 24) },
        { label: "Document requests completed", value: `${c.docRequestsDone} of ${c.docRequests}`, tip: "Employee-raised document requests fulfilled." },
        { label: "HR letters issued", value: String(c.hrLettersIssued), tip: "Letters generated and released in the period." },
        { label: "Employee requests pending", value: String(c.employeeRequestsPending), tip: "Open employee requests still awaiting HR action.", status: statusForLower(c.employeeRequestsPending, 2, 5) },
        { label: "Average HR response time", value: `${c.hrResponseHours} hrs`, tip: "Mean first-response time to any employee request.", status: statusForLower(c.hrResponseHours, 8, 16) },
      ],
    },
    {
      key: "perf",
      title: "Performance & Training",
      status: statusFor(Math.round((reviewPct + trainPct) / 2), 90, 70),
      headline: `${reviewPct}% reviews on time · ${trainPct}% mandatory training complete`,
      metrics: [
        { label: "Reviews scheduled", value: String(c.reviewsScheduled), tip: "Reviews scheduled in the active cycle." },
        { label: "Reviews completed on time", value: `${c.reviewsCompletedOnTime} of ${c.reviewsScheduled}`, tip: "Reviews closed on or before their scheduled date." },
        { label: "Manager feedback pending", value: String(c.managerFeedbackPending), tip: "Waiting on reporting managers — outside HR control." },
        { label: "Improvement-plan reviews completed", value: `${c.pipReviewsDone} of ${c.pipReviewsTotal}`, tip: "PIP checkpoint reviews closed on schedule." },
        { label: "Training assigned", value: String(c.trainingAssigned), tip: "Training assignments created in the period." },
        { label: "Mandatory training completed", value: `${c.mandatoryTrainingDone} of ${c.mandatoryTrainingTotal}`, tip: "Mandatory trainings marked complete with evidence." },
        { label: "Training overdue", value: String(c.trainingOverdue), tip: "Assigned trainings past their due date.", status: statusForLower(c.trainingOverdue, 2, 6) },
      ],
    },
    {
      key: "letters",
      title: "Letters & Acknowledgements",
      status: statusFor(ackPct, 90, 75),
      headline: `${ackPct}% of issued documents acknowledged`,
      metrics: [
        { label: "Letters issued", value: String(c.hrLettersIssued), tip: "All letter types released in the period." },
        { label: "Notices issued", value: String(c.noticesIssued), tip: "Notices and warnings released in the period." },
        { label: "Acknowledgements received", value: String(c.acksReceived), tip: "Employee acknowledgements captured against issued documents." },
        { label: "Acknowledgements pending", value: String(c.acksPending), tip: "Issued documents still awaiting employee acknowledgement.", status: statusForLower(c.acksPending, 5, 12) },
        { label: "Documents awaiting approval", value: String(c.docsAwaitingApproval), tip: "Documents waiting on CEO/manager approval — outside HR control." },
        { label: "Average document-processing time", value: `${c.docProcessingDays} days`, tip: "Mean days from draft to release.", status: statusForLower(c.docProcessingDays, 2, 3) },
      ],
    },
    {
      key: "access",
      title: "User Access Performance",
      status: statusFor(exitPct, 95, 80),
      headline: `${exitPct}% of exits deactivated within SLA`,
      metrics: [
        { label: "Accounts created before joining", value: `${c.accountsBeforeJoining} of ${c.accountsDue}`, tip: "Access provisioned before the employee's first day." },
        { label: "Invitations accepted", value: `${c.invitationsAccepted} of ${c.invitationsSent}`, tip: "Secure invitation links accepted by the invitee." },
        { label: "Access requests pending", value: String(c.accessRequestsPending), tip: "Open access/permission requests awaiting action.", status: statusForLower(c.accessRequestsPending, 2, 4) },
        { label: "Password-reset requests resolved", value: `${c.passwordResetsResolved} of ${c.passwordResets}`, tip: "Reset requests closed via secure link." },
        { label: "Exited employees deactivated on time", value: `${c.exitsDeactivatedOnTime} of ${c.exitsTotal}`, tip: "Access revoked on or before the last working day." },
        { label: "Access or permission risks unresolved", value: String(c.accessRisksOpen), tip: "Open findings such as excess permissions or active accounts for exited staff.", status: statusForLower(c.accessRisksOpen, 0, 1) },
      ],
    },
  ];
}

export type RiskRow = { label: string; count: number; owner: "HR" | "CEO" | "Manager"; severity: Status };

export function buildRisks(c: PeriodRecord): RiskRow[] {
  return [
    { label: "Critical vacancies", count: c.vacanciesOverdue, owner: "HR", severity: c.vacanciesOverdue > 1 ? "Critical" : "Needs Attention" },
    { label: "Employees with missing documents", count: Math.max(0, Math.round((c.docsRequired - c.docsVerified) / 3)), owner: "HR", severity: "Needs Attention" },
    { label: "Probation confirmations overdue", count: 2, owner: "Manager", severity: "Needs Attention" },
    { label: "Performance reviews overdue", count: c.reviewsScheduled - c.reviewsCompletedOnTime, owner: "Manager", severity: "Needs Attention" },
    { label: "Unacknowledged notices", count: c.acksPending, owner: "HR", severity: c.acksPending > 10 ? "Critical" : "Needs Attention" },
    { label: "Exited employees with active access", count: c.exitsTotal - c.exitsDeactivatedOnTime, owner: "HR", severity: c.exitsTotal - c.exitsDeactivatedOnTime > 0 ? "Critical" : "On Track" },
    { label: "Mandatory training overdue", count: c.trainingOverdue, owner: "HR", severity: c.trainingOverdue > 5 ? "Critical" : "Needs Attention" },
    { label: "Employee requests unresolved beyond SLA", count: c.employeeRequestsPending, owner: "HR", severity: c.employeeRequestsPending > 4 ? "Critical" : "Needs Attention" },
  ];
}

export const TARGET_HISTORY = [
  { metric: "Hiring Target Achievement", from: "85%", to: "90%", effective: "1 Jul 2026", by: "CEO" },
  { metric: "Average Time to Hire", from: "28 days", to: "22 days", effective: "1 Jul 2026", by: "CEO" },
  { metric: "Employee Document Compliance", from: "90%", to: "95%", effective: "1 Apr 2026", by: "CEO" },
];

export type FeedbackKind = "Private Note" | "Recognition" | "Corrective Action" | "Improvement Goal" | "Review Scheduled";

export type Feedback = {
  id: string;
  kind: FeedbackKind;
  at: string;
  body: string;
  target?: string;
  dueDate?: string;
  discussed: boolean;
  ack?: { at: string; response: string };
};

export const SEED_FEEDBACK: Feedback[] = [
  {
    id: "fb-1",
    kind: "Recognition",
    at: "28 Jul 2026",
    body: "Leave processing SLA held above 90% through a heavy month. Well handled.",
    discussed: true,
    ack: { at: "29 Jul 2026", response: "Thank you — the new SLA reminder rules helped a lot." },
  },
  {
    id: "fb-2",
    kind: "Improvement Goal",
    at: "1 Aug 2026",
    body: "Bring performance reviews completed on time to 90% and clear the two overdue probation confirmations.",
    target: "90% reviews on time",
    dueDate: "30 Sep 2026",
    discussed: false,
  },
];

export type AccessLog = { at: string; who: string; action: string };

export const SEED_ACCESS_LOG: AccessLog[] = [
  { at: "3 Aug 2026, 09:12", who: "Neha Sharma (HR Head)", action: "Viewed own performance dashboard — This Month" },
  { at: "2 Aug 2026, 18:40", who: "CEO", action: "Viewed HR Head performance — This Quarter" },
  { at: "1 Aug 2026, 11:05", who: "CEO", action: "Added private feedback (Improvement Goal)" },
];
