import { DEPTS } from "./data";

export type AuditEntry = {
  at: string;
  by: string;
  area: string;
  item: string;
  from: string;
  to: string;
  reason: string;
  approval?: string;
};

export const nowStamp = () =>
  new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ---------------- policies ---------------- */

export const POLICY_STAGES = [
  "Draft",
  "Awaiting Approval",
  "Approved",
  "Published",
  "Acknowledgement Pending",
  "Active",
  "Archived",
] as const;
export type PolicyStage = (typeof POLICY_STAGES)[number];

export const POLICY_TONE: Record<PolicyStage, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Awaiting Approval": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Approved: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Published: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "Acknowledgement Pending": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Archived: "bg-muted text-muted-foreground",
};

export const POLICY_CATEGORIES = [
  "Attendance & Leave",
  "Code of Conduct",
  "Compensation & Reimbursement",
  "Employment & Exit",
  "Health & Safety",
  "Information Security",
  "Performance",
] as const;
export type PolicyCategory = (typeof POLICY_CATEGORIES)[number];

export type PolicyVersion = {
  v: string;
  at: string;
  by: string;
  note: string;
  document: string;
  locked: boolean;
};

export type HrPolicy = {
  id: string;
  title: string;
  category: PolicyCategory;
  description: string;
  effectiveDate: string;
  applicability: string;
  document: string;
  version: string;
  approver: string;
  ackDeadline: string;
  ackRequired: boolean;
  stage: PolicyStage;
  ackDone: number;
  ackTotal: number;
  updatedOn: string;
  versions: PolicyVersion[];
  history: AuditEntry[];
};

const h = (by: string, item: string, from: string, to: string, reason: string, approval?: string): AuditEntry => ({
  at: nowStamp(),
  by,
  area: "HR Policies",
  item,
  from,
  to,
  reason,
  approval,
});

export const HR_POLICIES: HrPolicy[] = [
  {
    id: "POL-01",
    title: "Leave Policy",
    category: "Attendance & Leave",
    description: "12 Casual + 8 Sick + 10 Earned leaves per year. Manager recommendation followed by HR approval.",
    effectiveDate: "01 Apr 2026",
    applicability: "All departments · All locations",
    document: "leave-policy-v3.pdf",
    version: "v3.0",
    approver: "CEO",
    ackDeadline: "15 Apr 2026",
    ackRequired: true,
    stage: "Active",
    ackDone: 24,
    ackTotal: 26,
    updatedOn: "12 Jun 2026",
    versions: [
      { v: "v3.0", at: "01 Apr 2026", by: "Anjali Kapoor (HR Head)", note: "Earned leave carry-forward capped at 10", document: "leave-policy-v3.pdf", locked: true },
      { v: "v2.0", at: "05 Apr 2025", by: "Anjali Kapoor (HR Head)", note: "Sick leave increased to 8", document: "leave-policy-v2.pdf", locked: true },
    ],
    history: [],
  },
  {
    id: "POL-02",
    title: "Attendance & Punctuality",
    category: "Attendance & Leave",
    description: "15 minute grace period. Three late marks in a month equal one half-day deduction.",
    effectiveDate: "01 May 2026",
    applicability: "All departments except Field roles",
    document: "attendance-policy-v2.pdf",
    version: "v2.1",
    approver: "CEO",
    ackDeadline: "20 May 2026",
    ackRequired: true,
    stage: "Acknowledgement Pending",
    ackDone: 19,
    ackTotal: 26,
    updatedOn: "02 May 2026",
    versions: [
      { v: "v2.1", at: "01 May 2026", by: "Anjali Kapoor (HR Head)", note: "Field roles excluded from grace rule", document: "attendance-policy-v2.pdf", locked: true },
    ],
    history: [],
  },
  {
    id: "POL-03",
    title: "Code of Conduct & Discipline",
    category: "Code of Conduct",
    description: "Warning → Show-cause → Final warning → Exit. Every step requires written evidence and HR review.",
    effectiveDate: "15 Jan 2026",
    applicability: "All employees",
    document: "code-of-conduct-v4.pdf",
    version: "v4.0",
    approver: "CEO",
    ackDeadline: "31 Jan 2026",
    ackRequired: true,
    stage: "Active",
    ackDone: 26,
    ackTotal: 26,
    updatedOn: "15 Jan 2026",
    versions: [
      { v: "v4.0", at: "15 Jan 2026", by: "Anjali Kapoor (HR Head)", note: "Added evidence requirement before any warning", document: "code-of-conduct-v4.pdf", locked: true },
    ],
    history: [],
  },
  {
    id: "POL-04",
    title: "Travel & Expense Reimbursement",
    category: "Compensation & Reimbursement",
    description: "Field staff FAT limits. Bills must be submitted within 7 days of travel.",
    effectiveDate: "09 Jul 2026",
    applicability: "Tech, Projects, Training",
    document: "travel-expense-v2.pdf",
    version: "v2.0",
    approver: "CEO",
    ackDeadline: "25 Jul 2026",
    ackRequired: false,
    stage: "Published",
    ackDone: 0,
    ackTotal: 11,
    updatedOn: "09 Jul 2026",
    versions: [
      { v: "v2.0", at: "09 Jul 2026", by: "Anjali Kapoor (HR Head)", note: "Revised per-day field allowance", document: "travel-expense-v2.pdf", locked: true },
    ],
    history: [],
  },
  {
    id: "POL-05",
    title: "Information Security & Device Use",
    category: "Information Security",
    description: "Company data must stay inside approved CRM accounts. Access is revoked on the last working day.",
    effectiveDate: "01 Sep 2026",
    applicability: "All employees with system access",
    document: "infosec-v1-draft.pdf",
    version: "v1.0",
    approver: "CEO",
    ackDeadline: "15 Sep 2026",
    ackRequired: true,
    stage: "Awaiting Approval",
    ackDone: 0,
    ackTotal: 26,
    updatedOn: "28 Jul 2026",
    versions: [
      { v: "v1.0", at: "28 Jul 2026", by: "Anjali Kapoor (HR Head)", note: "First draft prepared", document: "infosec-v1-draft.pdf", locked: false },
    ],
    history: [],
  },
  {
    id: "POL-06",
    title: "Work From Home (2024)",
    category: "Employment & Exit",
    description: "Superseded by the revised Attendance policy. Retained for historical reference.",
    effectiveDate: "01 Jan 2024",
    applicability: "Head office roles",
    document: "wfh-2024-v1.pdf",
    version: "v1.0",
    approver: "CEO",
    ackDeadline: "—",
    ackRequired: false,
    stage: "Archived",
    ackDone: 18,
    ackTotal: 18,
    updatedOn: "02 May 2026",
    versions: [
      { v: "v1.0", at: "01 Jan 2024", by: "Anjali Kapoor (HR Head)", note: "Original policy", document: "wfh-2024-v1.pdf", locked: true },
    ],
    history: [],
  },
];

/* ---------------- departments & designations ---------------- */

export type DeptSetting = {
  id: string;
  name: string;
  head: string;
  reportsTo: string;
  location: string;
  designations: string[];
  active: boolean;
  linkedEmployees: number;
};

export const DEPT_SETTINGS: DeptSetting[] = [
  { id: "D1", name: "Sales", head: "Rahul Sharma (Sales Head)", reportsTo: "CEO", location: "Delhi HO", designations: ["Sales Head", "Sales Executive", "Sales Coordinator"], active: true, linkedEmployees: 7 },
  { id: "D2", name: "Projects", head: "Sneha Iyer (Project Coordinator)", reportsTo: "CEO", location: "Delhi HO", designations: ["Project Coordinator", "Project Manager"], active: true, linkedEmployees: 5 },
  { id: "D3", name: "Training", head: "Ritu Singh (Institute Head)", reportsTo: "CEO", location: "Noida", designations: ["Institute Head", "Trainer & Launch Executive"], active: true, linkedEmployees: 4 },
  { id: "D4", name: "Marketing", head: "Nikhil Verma (Marketing Head)", reportsTo: "CEO", location: "Delhi HO", designations: ["Performance Marketing Executive", "Social Media Manager", "BTL Executive"], active: true, linkedEmployees: 4 },
  { id: "D5", name: "Tech", head: "Kiran Rao (Technical Support Lead)", reportsTo: "COO", location: "Field", designations: ["Technical Support", "Field Engineer"], active: true, linkedEmployees: 3 },
  { id: "D6", name: "Accounts", head: "Deepa Menon (Accountant)", reportsTo: "CEO", location: "Delhi HO", designations: ["Accountant", "Accounts Executive"], active: true, linkedEmployees: 2 },
  { id: "D7", name: "Support Staff", head: "Suresh Nair (Administration Manager)", reportsTo: "COO", location: "Delhi HO", designations: ["Administration Manager", "Pantry Staff", "Cleaning Staff", "Packing Staff"], active: true, linkedEmployees: 5 },
  { id: "D8", name: "HR", head: "Anjali Kapoor (HR Head)", reportsTo: "CEO", location: "Delhi HO", designations: ["HR Head", "HR Executive"], active: true, linkedEmployees: 2 },
  { id: "D9", name: "Call Centre (closed 2025)", head: "—", reportsTo: "COO", location: "Noida", designations: ["Tele Caller"], active: false, linkedEmployees: 3 },
];

export const ALL_DEPT_NAMES = DEPTS as readonly string[];

/* ---------------- employment settings ---------------- */

export type EmploymentSettings = {
  types: { name: string; active: boolean }[];
  probationMonths: number;
  noticeDays: number;
  idFormat: string;
  locations: { name: string; active: boolean }[];
  joining: { item: string; on: boolean }[];
  exit: { item: string; on: boolean }[];
  confirmationReviewDays: number;
};

export const EMPLOYMENT_SETTINGS: EmploymentSettings = {
  types: [
    { name: "Full-time", active: true },
    { name: "Part-time", active: true },
    { name: "Contract", active: true },
    { name: "Intern", active: true },
    { name: "Consultant", active: false },
  ],
  probationMonths: 3,
  noticeDays: 30,
  idFormat: "CC-{DEPT}-{YEAR}-{SEQ4}",
  locations: [
    { name: "Delhi HO", active: true },
    { name: "Noida", active: true },
    { name: "Jaipur", active: true },
    { name: "Mumbai", active: true },
    { name: "Field", active: true },
    { name: "Gurgaon (closed)", active: false },
  ],
  joining: [
    { item: "Collect signed offer acceptance", on: true },
    { item: "Verify mandatory documents", on: true },
    { item: "Generate employee ID", on: true },
    { item: "Issue joining letter", on: true },
    { item: "Create CRM account invitation", on: true },
    { item: "Assign reporting manager", on: true },
    { item: "Orientation and policy walkthrough", on: true },
    { item: "Assign mandatory training", on: true },
    { item: "Issue assets (SIM, uniform, tools)", on: false },
  ],
  exit: [
    { item: "Record resignation or termination letter", on: true },
    { item: "Manager handover confirmation", on: true },
    { item: "Asset return and clearance", on: true },
    { item: "Deactivate CRM access on last working day", on: true },
    { item: "Issue relieving letter", on: true },
    { item: "Issue experience letter", on: true },
    { item: "Full & final settlement note (Accounts)", on: true },
    { item: "Exit interview record", on: false },
  ],
  confirmationReviewDays: 15,
};

/* ---------------- onboarding requirements ---------------- */

export const ONB_DOC_LIST = [
  "Aadhaar",
  "PAN",
  "Bank details",
  "Address proof",
  "Education documents",
  "Experience letters",
  "Previous salary slips",
  "Profile photograph",
  "Signed joining documents",
  "Policy acknowledgements",
] as const;
export type OnbDocName = (typeof ONB_DOC_LIST)[number];

export const ONB_PROFILES = ["Full-time", "Part-time", "Contract", "Intern", "Support Staff"] as const;
export type OnbProfile = (typeof ONB_PROFILES)[number];

export const ONB_MATRIX: Record<OnbProfile, Record<string, boolean>> = {
  "Full-time": {
    Aadhaar: true, PAN: true, "Bank details": true, "Address proof": true,
    "Education documents": true, "Experience letters": true, "Previous salary slips": true,
    "Profile photograph": true, "Signed joining documents": true, "Policy acknowledgements": true,
  },
  "Part-time": {
    Aadhaar: true, PAN: true, "Bank details": true, "Address proof": true,
    "Education documents": true, "Experience letters": false, "Previous salary slips": false,
    "Profile photograph": true, "Signed joining documents": true, "Policy acknowledgements": true,
  },
  Contract: {
    Aadhaar: true, PAN: true, "Bank details": true, "Address proof": true,
    "Education documents": false, "Experience letters": true, "Previous salary slips": false,
    "Profile photograph": true, "Signed joining documents": true, "Policy acknowledgements": true,
  },
  Intern: {
    Aadhaar: true, PAN: false, "Bank details": true, "Address proof": true,
    "Education documents": true, "Experience letters": false, "Previous salary slips": false,
    "Profile photograph": true, "Signed joining documents": true, "Policy acknowledgements": true,
  },
  "Support Staff": {
    Aadhaar: true, PAN: false, "Bank details": true, "Address proof": true,
    "Education documents": false, "Experience letters": false, "Previous salary slips": false,
    "Profile photograph": true, "Signed joining documents": true, "Policy acknowledgements": true,
  },
};

/* ---------------- attendance & leave settings ---------------- */

export type LeaveTypeSetting = {
  name: string;
  entitlement: number;
  carryForward: number;
  approval: string;
  active: boolean;
};

export type AttendanceSettings = {
  workingDays: { day: string; on: boolean }[];
  shifts: { name: string; timing: string; active: boolean }[];
  graceMinutes: number;
  lateMarksForHalfDay: number;
  halfDayMinHours: number;
  cutOffDay: number;
  regularisationWindowDays: number;
  regularisationApproval: string;
  holidays: { date: string; name: string }[];
  leaveTypes: LeaveTypeSetting[];
};

export const ATTENDANCE_SETTINGS: AttendanceSettings = {
  workingDays: [
    { day: "Monday", on: true },
    { day: "Tuesday", on: true },
    { day: "Wednesday", on: true },
    { day: "Thursday", on: true },
    { day: "Friday", on: true },
    { day: "Saturday", on: true },
    { day: "Sunday", on: false },
  ],
  shifts: [
    { name: "General", timing: "09:30 - 18:30", active: true },
    { name: "Early", timing: "08:00 - 17:00", active: true },
    { name: "Late", timing: "11:00 - 20:00", active: true },
    { name: "Field", timing: "09:00 - 18:00", active: true },
  ],
  graceMinutes: 15,
  lateMarksForHalfDay: 3,
  halfDayMinHours: 4,
  cutOffDay: 25,
  regularisationWindowDays: 7,
  regularisationApproval: "Reporting Manager → HR Head",
  holidays: [
    { date: "15 Aug 2026", name: "Independence Day" },
    { date: "02 Oct 2026", name: "Gandhi Jayanti" },
    { date: "20 Oct 2026", name: "Diwali" },
    { date: "25 Dec 2026", name: "Christmas" },
  ],
  leaveTypes: [
    { name: "Casual Leave", entitlement: 12, carryForward: 0, approval: "Manager → HR", active: true },
    { name: "Sick Leave", entitlement: 8, carryForward: 0, approval: "Manager → HR", active: true },
    { name: "Earned Leave", entitlement: 10, carryForward: 10, approval: "Manager → HR Head", active: true },
    { name: "Comp Off", entitlement: 0, carryForward: 2, approval: "Manager", active: true },
    { name: "Unpaid Leave", entitlement: 0, carryForward: 0, approval: "HR Head", active: true },
    { name: "Maternity Leave", entitlement: 182, carryForward: 0, approval: "HR Head", active: true },
  ],
};

/* ---------------- performance settings ---------------- */

export type PerformanceSettings = {
  cycles: { name: string; months: string; active: boolean }[];
  areas: { name: string; on: boolean }[];
  ratings: string[];
  goalPeriod: string;
  responsibilities: { role: string; duty: string }[];
  pipReviewWeeks: number;
  mandatoryTrainingDays: number;
  autoDisciplinary: boolean;
};

export const PERFORMANCE_SETTINGS: PerformanceSettings = {
  cycles: [
    { name: "Half-yearly review", months: "Apr & Oct", active: true },
    { name: "Probation confirmation review", months: "On completion of probation", active: true },
    { name: "Annual appraisal", months: "April", active: true },
    { name: "Quarterly check-in", months: "Every quarter", active: false },
  ],
  areas: [
    { name: "Work quality", on: true },
    { name: "Targets achieved", on: true },
    { name: "Discipline & attendance", on: true },
    { name: "Teamwork", on: true },
    { name: "Customer handling", on: true },
    { name: "Process adherence", on: true },
    { name: "Learning & training", on: true },
  ],
  ratings: ["Exceeds Expectations", "Meets Expectations", "Needs Improvement", "Unsatisfactory"],
  goalPeriod: "Quarterly",
  responsibilities: [
    { role: "Reporting Manager", duty: "Rate performance areas and record written evidence" },
    { role: "HR Head", duty: "Review ratings, run the discussion and close the cycle" },
    { role: "CEO", duty: "Approve promotions, increments and exits" },
  ],
  pipReviewWeeks: 2,
  mandatoryTrainingDays: 30,
  autoDisciplinary: false,
};

/* ---------------- letter templates ---------------- */

export type TemplateVersion = { v: string; at: string; by: string; note: string };

export type LetterTemplate = {
  id: string;
  name: string;
  status: "Published" | "Draft" | "Archived";
  version: string;
  updatedOn: string;
  approver: string;
  fields: string[];
  versions: TemplateVersion[];
};

const tv = (v: string, at: string, note: string): TemplateVersion => ({ v, at, by: "Anjali Kapoor (HR Head)", note });

export const LETTER_TEMPLATES: LetterTemplate[] = [
  { id: "T1", name: "Joining Letter", status: "Published", version: "v3.0", updatedOn: "10 Apr 2026", approver: "HR Head", fields: ["Employee name", "Designation", "Date of joining", "Reporting manager"], versions: [tv("v3.0", "10 Apr 2026", "Added reporting manager field"), tv("v2.0", "02 Jan 2025", "Updated header")] },
  { id: "T2", name: "Appointment Letter", status: "Published", version: "v4.1", updatedOn: "18 May 2026", approver: "CEO", fields: ["Employee name", "Designation", "Probation period", "Notice period"], versions: [tv("v4.1", "18 May 2026", "Notice period revised to 30 days")] },
  { id: "T3", name: "Confirmation Letter", status: "Published", version: "v2.0", updatedOn: "21 Mar 2026", approver: "HR Head", fields: ["Employee name", "Confirmation date", "Review outcome"], versions: [tv("v2.0", "21 Mar 2026", "Linked to review outcome")] },
  { id: "T4", name: "Promotion Letter", status: "Published", version: "v2.0", updatedOn: "05 Feb 2026", approver: "CEO", fields: ["Employee name", "New designation", "Effective date"], versions: [tv("v2.0", "05 Feb 2026", "Added effective date")] },
  { id: "T5", name: "Increment Letter", status: "Published", version: "v3.0", updatedOn: "05 Feb 2026", approver: "CEO", fields: ["Employee name", "Effective date", "Revision note"], versions: [tv("v3.0", "05 Feb 2026", "Compensation values kept out of template body")] },
  { id: "T6", name: "Appreciation Letter", status: "Published", version: "v1.0", updatedOn: "12 Dec 2025", approver: "HR Head", fields: ["Employee name", "Achievement", "Period"], versions: [tv("v1.0", "12 Dec 2025", "Created")] },
  { id: "T7", name: "Warning Letter", status: "Published", version: "v3.0", updatedOn: "15 Jan 2026", approver: "CEO", fields: ["Employee name", "Incident date", "Policy clause", "Corrective action", "Response deadline"], versions: [tv("v3.0", "15 Jan 2026", "Evidence and response deadline made mandatory")] },
  { id: "T8", name: "Show-Cause Notice", status: "Published", version: "v2.0", updatedOn: "15 Jan 2026", approver: "CEO", fields: ["Employee name", "Incident summary", "Response deadline"], versions: [tv("v2.0", "15 Jan 2026", "Response window set to 3 working days")] },
  { id: "T9", name: "Experience Letter", status: "Published", version: "v2.0", updatedOn: "28 Feb 2026", approver: "HR Head", fields: ["Employee name", "Designation", "Tenure"], versions: [tv("v2.0", "28 Feb 2026", "Tenure calculation clarified")] },
  { id: "T10", name: "Relieving Letter", status: "Draft", version: "v3.0", updatedOn: "29 Jul 2026", approver: "HR Head", fields: ["Employee name", "Last working day", "Clearance status"], versions: [tv("v3.0", "29 Jul 2026", "Clearance status added — draft")] },
];

/* ---------------- notifications ---------------- */

export type ChannelSetting = { name: string; on: boolean; note: string; ready: boolean };

export const NOTIFICATION_CHANNELS: ChannelSetting[] = [
  { name: "In-app notifications", on: true, note: "Delivered inside the CRM", ready: true },
  { name: "Email", on: false, note: "Placeholder — external delivery not activated", ready: false },
  { name: "SMS", on: false, note: "Placeholder — external delivery not activated", ready: false },
  { name: "WhatsApp", on: false, note: "Placeholder — external delivery not activated", ready: false },
];

export const NOTIFICATION_EVENTS = [
  { name: "Document pending reminder", frequency: "Every 2 days" },
  { name: "Policy acknowledgement reminder", frequency: "Weekly" },
  { name: "Review due reminder", frequency: "Every 3 days" },
  { name: "Leave approval pending", frequency: "Daily" },
  { name: "Escalation to HR Head", frequency: "After 3 days pending" },
  { name: "Daily HR summary", frequency: "Daily 09:00" },
] as const;

/* ---------------- permissions ---------------- */

export const PERM_ROLES = ["CEO", "HR Head", "Reporting Manager", "Employee", "System Administrator"] as const;
export type PermRole = (typeof PERM_ROLES)[number];

export const PERM_AREAS = [
  "View aggregated HR reports",
  "Manage employee records",
  "Approve leave",
  "Publish policies",
  "Issue warnings",
  "Create user accounts",
  "Assign privileged roles",
  "View confidential documents",
] as const;
export type PermArea = (typeof PERM_AREAS)[number];

export const PERM_MATRIX: Record<PermRole, Record<string, boolean>> = {
  CEO: {
    "View aggregated HR reports": true, "Manage employee records": false, "Approve leave": false,
    "Publish policies": true, "Issue warnings": true, "Create user accounts": false,
    "Assign privileged roles": true, "View confidential documents": true,
  },
  "HR Head": {
    "View aggregated HR reports": true, "Manage employee records": true, "Approve leave": true,
    "Publish policies": false, "Issue warnings": true, "Create user accounts": true,
    "Assign privileged roles": false, "View confidential documents": true,
  },
  "Reporting Manager": {
    "View aggregated HR reports": false, "Manage employee records": false, "Approve leave": true,
    "Publish policies": false, "Issue warnings": false, "Create user accounts": false,
    "Assign privileged roles": false, "View confidential documents": false,
  },
  Employee: {
    "View aggregated HR reports": false, "Manage employee records": false, "Approve leave": false,
    "Publish policies": false, "Issue warnings": false, "Create user accounts": false,
    "Assign privileged roles": false, "View confidential documents": false,
  },
  "System Administrator": {
    "View aggregated HR reports": false, "Manage employee records": false, "Approve leave": false,
    "Publish policies": false, "Issue warnings": false, "Create user accounts": true,
    "Assign privileged roles": true, "View confidential documents": false,
  },
};

/* HR Head can never silently change these cells */
export const LOCKED_PERMS: { role: PermRole; area: string }[] = [
  { role: "CEO", area: "Assign privileged roles" },
  { role: "CEO", area: "Publish policies" },
  { role: "CEO", area: "View confidential documents" },
  { role: "System Administrator", area: "Assign privileged roles" },
  { role: "System Administrator", area: "Create user accounts" },
  { role: "HR Head", area: "Assign privileged roles" },
  { role: "HR Head", area: "Publish policies" },
];

export const isLockedPerm = (role: PermRole, area: string) =>
  LOCKED_PERMS.some((l) => l.role === role && l.area === area);

/* ---------------- audit log ---------------- */

export const SETTINGS_AUDIT: AuditEntry[] = [
  { at: "29 Jul 2026 16:40", by: "Anjali Kapoor (HR Head)", area: "Attendance & Leave", item: "Grace period", from: "10 minutes", to: "15 minutes", reason: "Traffic delays reported at Delhi HO", approval: "CEO approved 29 Jul 2026" },
  { at: "18 May 2026 11:05", by: "Anjali Kapoor (HR Head)", area: "Letter Templates", item: "Appointment Letter", from: "v4.0", to: "v4.1", reason: "Notice period standardised to 30 days", approval: "CEO approved 18 May 2026" },
  { at: "10 Apr 2026 09:30", by: "Anjali Kapoor (HR Head)", area: "Employment Settings", item: "Employee ID format", from: "CC-{YEAR}-{SEQ4}", to: "CC-{DEPT}-{YEAR}-{SEQ4}", reason: "Department-wise identification required", approval: "CEO approved 09 Apr 2026" },
  { at: "01 Apr 2026 10:15", by: "Anjali Kapoor (HR Head)", area: "HR Policies", item: "Leave Policy", from: "v2.0", to: "v3.0 published", reason: "Carry-forward cap introduced", approval: "CEO approved 31 Mar 2026" },
  { at: "15 Jan 2026 15:00", by: "Anjali Kapoor (HR Head)", area: "Performance Settings", item: "Automated disciplinary decisions", from: "Off", to: "Off (locked)", reason: "Disciplinary action must always be reviewed by a person", approval: "CEO confirmed" },
];

export const SAFETY_NOTE =
  "Published policy versions and templates cannot be edited — every change creates a new version. Historical policies, templates and settings are never deleted, and employee acknowledgement history is preserved. Passwords, Aadhaar, PAN, bank and other sensitive records are never shown on this page.";
