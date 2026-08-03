import { MASTER_EMPLOYEES } from "./employee-data";

export type AuditEntry = { at: string; by: string; text: string };

export const DOC_CATEGORIES = [
  "Employment Letters",
  "Performance Letters",
  "Notices & Warnings",
] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

export const EMPLOYMENT_TYPES_DOC = [
  "Joining Letter",
  "Appointment Letter",
  "Probation Letter",
  "Confirmation Letter",
  "Promotion Letter",
  "Transfer Letter",
  "Increment Letter",
  "Experience Letter",
  "Relieving Letter",
] as const;

export const PERFORMANCE_TYPES_DOC = [
  "Appreciation Letter",
  "Performance Feedback",
  "Improvement Plan",
  "Training Requirement",
] as const;

export const NOTICE_TYPES_DOC = [
  "General Notice",
  "Advisory",
  "Verbal Warning Record",
  "Written Warning",
  "Show-Cause Notice",
  "Final Warning",
  "Suspension Notice",
  "Termination Notice",
] as const;

export type DocType =
  | (typeof EMPLOYMENT_TYPES_DOC)[number]
  | (typeof PERFORMANCE_TYPES_DOC)[number]
  | (typeof NOTICE_TYPES_DOC)[number];

export const TYPES_BY_CATEGORY: Record<DocCategory, readonly DocType[]> = {
  "Employment Letters": EMPLOYMENT_TYPES_DOC,
  "Performance Letters": PERFORMANCE_TYPES_DOC,
  "Notices & Warnings": NOTICE_TYPES_DOC,
};

export const categoryOf = (t: DocType): DocCategory =>
  (EMPLOYMENT_TYPES_DOC as readonly string[]).includes(t)
    ? "Employment Letters"
    : (PERFORMANCE_TYPES_DOC as readonly string[]).includes(t)
      ? "Performance Letters"
      : "Notices & Warnings";

/** Warning-class documents need the full disciplinary dossier + approval. */
export const WARNING_TYPES: DocType[] = [
  "Verbal Warning Record",
  "Written Warning",
  "Show-Cause Notice",
  "Final Warning",
  "Suspension Notice",
  "Termination Notice",
];
export const isWarning = (t: DocType) => WARNING_TYPES.includes(t);

/** Types that always require authorised (CEO / management) approval before sending. */
export const APPROVAL_REQUIRED_TYPES: DocType[] = [
  ...WARNING_TYPES,
  "Promotion Letter",
  "Increment Letter",
  "Transfer Letter",
  "Improvement Plan",
  "Relieving Letter",
];
export const needsApproval = (t: DocType) => APPROVAL_REQUIRED_TYPES.includes(t);

export const CONFIDENTIALITY = ["Normal", "Confidential", "Strictly Confidential"] as const;
export type Confidentiality = (typeof CONFIDENTIALITY)[number];

export const DOC_STAGES = [
  "Draft",
  "Submitted for Approval",
  "Approved",
  "Sent",
  "Viewed",
  "Acknowledged",
  "Employee Responded",
  "Closed",
] as const;
export type DocStage = (typeof DOC_STAGES)[number];

export const STAGE_TONE: Record<DocStage, string> = {
  Draft: "muted",
  "Submitted for Approval": "pending",
  Approved: "active",
  Sent: "active",
  Viewed: "active",
  Acknowledged: "done",
  "Employee Responded": "done",
  Closed: "done",
};

export type ApprovalStatus = "Not Required" | "Pending" | "Approved" | "Rejected";
export type DeliveryStatus = "Not Sent" | "Sent" | "Delivered" | "Viewed";
export type AckStatus = "Not Applicable" | "Awaiting" | "Acknowledged" | "Refused" | "No Response";

export const APPROVAL_TONE: Record<ApprovalStatus, string> = {
  "Not Required": "muted",
  Pending: "pending",
  Approved: "done",
  Rejected: "urgent",
};
export const DELIVERY_TONE: Record<DeliveryStatus, string> = {
  "Not Sent": "muted",
  Sent: "active",
  Delivered: "active",
  Viewed: "done",
};
export const ACK_TONE: Record<AckStatus, string> = {
  "Not Applicable": "muted",
  Awaiting: "pending",
  Acknowledged: "done",
  Refused: "urgent",
  "No Response": "urgent",
};

export type WarningDetails = {
  reason: string;
  incidentDate: string;
  policy: string;
  evidence: string;
  previousWarnings: string;
  correctiveAction: string;
  reviewDate: string;
};

export type HrDoc = {
  id: string;
  docNo: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  designation: string;
  type: DocType;
  subject: string;
  effectiveDate: string;
  content: string;
  evidence?: string;
  attachment?: string;
  responseDeadline?: string;
  confidentiality: Confidentiality;
  createdBy: string;
  createdOn: string;
  approver?: string;
  stage: DocStage;
  approval: ApprovalStatus;
  delivery: DeliveryStatus;
  ack: AckStatus;
  version: number;
  amendedFrom?: string;
  downloadAllowed: boolean;
  sentAt?: string;
  deliveredAt?: string;
  viewedAt?: string;
  acknowledgedAt?: string;
  employeeResponse?: string;
  hrClosingNote?: string;
  warning?: WarningDetails;
  history: AuditEntry[];
};

const emp = (empId: string) => MASTER_EMPLOYEES.find((e) => e.empId === empId)!;

const base = (empId: string) => {
  const e = emp(empId);
  return { empId: e.empId, name: e.name, photo: e.photo, dept: e.dept as string, designation: e.designation };
};

export const HR_DOCS: HrDoc[] = [
  {
    id: "D1",
    docNo: "CC/HR/2026/0101",
    ...base("CC-SUP-2026-0061"),
    type: "Appointment Letter",
    subject: "Appointment as Packing Staff — Delhi HO",
    effectiveDate: "28 Jul 2026",
    content:
      "Dear Mohit Kumar,\n\nWe are pleased to appoint you as Packing Staff at Clean Craft, Delhi HO, effective 28 Jul 2026. Your employment is subject to a probation period of three months and to the terms of the Clean Craft employee handbook.\n\nPlease acknowledge this letter on your dashboard.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    confidentiality: "Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "28 Jul 2026",
    stage: "Sent",
    approval: "Not Required",
    delivery: "Delivered",
    ack: "Awaiting",
    version: 1,
    downloadAllowed: true,
    sentAt: "28 Jul 2026, 11:20",
    deliveredAt: "28 Jul 2026, 11:20",
    responseDeadline: "05 Aug 2026",
    history: [
      { at: "28 Jul 2026, 10:40", by: "Anjali Kapoor", text: "Document created from template Appointment Letter v3" },
      { at: "28 Jul 2026, 11:20", by: "Anjali Kapoor", text: "Sent to employee private dashboard" },
    ],
  },
  {
    id: "D2",
    docNo: "CC/HR/2026/0102",
    ...base("CC-TRAIN-2025-0044"),
    type: "Probation Letter",
    subject: "Extension of probation period — review on 10 Aug 2026",
    effectiveDate: "10 Aug 2026",
    content:
      "Dear Vikas Yadav,\n\nYour probation review is scheduled for 10 Aug 2026. Based on the current assessment, your probation stands extended until the review is completed. Specific improvement areas will be shared by your reporting manager.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    confidentiality: "Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "27 Jul 2026",
    stage: "Draft",
    approval: "Not Required",
    delivery: "Not Sent",
    ack: "Not Applicable",
    version: 1,
    downloadAllowed: true,
    history: [{ at: "27 Jul 2026, 16:05", by: "Anjali Kapoor", text: "Draft created" }],
  },
  {
    id: "D3",
    docNo: "CC/HR/2026/0103",
    ...base("CC-TECH-2024-0028"),
    type: "Written Warning",
    subject: "Written warning — repeated unapproved absence",
    effectiveDate: "28 Jul 2026",
    content:
      "Dear Sanjay Patil,\n\nThis is a formal written warning regarding repeated absence without prior approval on 14, 18 and 22 Jul 2026, in breach of clause 4.2 of the attendance policy. You are required to submit a written explanation by the response deadline and to ensure full compliance going forward. Your conduct will be reviewed on 20 Aug 2026.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    evidence: "Attendance register extract Jul 2026; manager escalation email dated 23 Jul 2026",
    attachment: "attendance-extract-jul2026.pdf",
    responseDeadline: "04 Aug 2026",
    confidentiality: "Strictly Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "26 Jul 2026",
    approver: "CEO",
    stage: "Submitted for Approval",
    approval: "Pending",
    delivery: "Not Sent",
    ack: "Not Applicable",
    version: 1,
    downloadAllowed: false,
    warning: {
      reason: "Repeated absence without prior approval",
      incidentDate: "22 Jul 2026",
      policy: "Attendance Policy clause 4.2 — prior approval for leave",
      evidence: "Attendance register extract; manager escalation email",
      previousWarnings: "Verbal Warning Record CC/HR/2026/0088 dated 02 Jul 2026",
      correctiveAction: "Apply for all leave in advance; maintain full attendance for the next 30 days",
      reviewDate: "20 Aug 2026",
    },
    history: [
      { at: "26 Jul 2026, 12:10", by: "Anjali Kapoor", text: "Warning drafted with evidence attached" },
      { at: "26 Jul 2026, 12:30", by: "Anjali Kapoor", text: "Submitted for CEO approval" },
    ],
  },
  {
    id: "D4",
    docNo: "CC/HR/2026/0088",
    ...base("CC-TECH-2024-0028"),
    type: "Verbal Warning Record",
    subject: "Record of verbal warning — attendance",
    effectiveDate: "02 Jul 2026",
    content:
      "This is a record of the verbal warning given to Sanjay Patil on 02 Jul 2026 regarding two instances of unapproved absence. The employee was advised to follow the leave approval process.",
    evidence: "Discussion note countersigned by Kiran Rao (Technical Support Lead)",
    confidentiality: "Strictly Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "02 Jul 2026",
    approver: "CEO",
    stage: "Acknowledged",
    approval: "Approved",
    delivery: "Viewed",
    ack: "Acknowledged",
    version: 1,
    downloadAllowed: false,
    sentAt: "02 Jul 2026, 15:00",
    deliveredAt: "02 Jul 2026, 15:00",
    viewedAt: "02 Jul 2026, 18:12",
    acknowledgedAt: "03 Jul 2026, 09:40",
    employeeResponse: "Acknowledged. I will follow the leave approval process going forward.",
    warning: {
      reason: "Two instances of unapproved absence",
      incidentDate: "28 Jun 2026",
      policy: "Attendance Policy clause 4.2",
      evidence: "Discussion note countersigned by reporting manager",
      previousWarnings: "None",
      correctiveAction: "Follow leave approval process",
      reviewDate: "02 Aug 2026",
    },
    history: [
      { at: "02 Jul 2026, 14:20", by: "Anjali Kapoor", text: "Record created" },
      { at: "02 Jul 2026, 14:45", by: "CEO", text: "Approved for issue" },
      { at: "02 Jul 2026, 15:00", by: "Anjali Kapoor", text: "Sent to employee" },
      { at: "02 Jul 2026, 18:12", by: "Sanjay Patil", text: "Document viewed" },
      { at: "03 Jul 2026, 09:40", by: "Sanjay Patil", text: "Acknowledged with response" },
    ],
  },
  {
    id: "D5",
    docNo: "CC/HR/2026/0104",
    ...base("CC-ACC-2024-0033"),
    type: "Appreciation Letter",
    subject: "Appreciation — zero-error GST filing for Q1",
    effectiveDate: "26 Jul 2026",
    content:
      "Dear Ritu Singh,\n\nOn behalf of Clean Craft, we appreciate your accuracy and ownership in completing the Q1 GST filings without a single correction. Your contribution is noted in your performance record.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    confidentiality: "Normal",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "26 Jul 2026",
    stage: "Acknowledged",
    approval: "Not Required",
    delivery: "Viewed",
    ack: "Acknowledged",
    version: 1,
    downloadAllowed: true,
    sentAt: "26 Jul 2026, 10:00",
    deliveredAt: "26 Jul 2026, 10:00",
    viewedAt: "26 Jul 2026, 10:32",
    acknowledgedAt: "26 Jul 2026, 10:35",
    employeeResponse: "Thank you for the recognition.",
    hrClosingNote: "Copy filed in performance record.",
    history: [
      { at: "26 Jul 2026, 09:30", by: "Anjali Kapoor", text: "Draft created from template Appreciation Letter v2" },
      { at: "26 Jul 2026, 10:00", by: "Anjali Kapoor", text: "Sent to employee" },
      { at: "26 Jul 2026, 10:35", by: "Ritu Singh", text: "Acknowledged" },
    ],
  },
  {
    id: "D6",
    docNo: "CC/HR/2026/0105",
    ...base("CC-PROJ-2024-0019"),
    type: "Performance Feedback",
    subject: "Performance feedback — overdue mid-year review",
    effectiveDate: "20 Jul 2026",
    content:
      "Dear Aman Gupta,\n\nThis letter records the performance feedback discussed on 20 Jul 2026 covering site handover delays and documentation gaps. Improvement areas and support required have been agreed with your reporting manager.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    evidence: "Review notes dated 20 Jul 2026",
    confidentiality: "Strictly Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "20 Jul 2026",
    stage: "Viewed",
    approval: "Not Required",
    delivery: "Viewed",
    ack: "Awaiting",
    version: 1,
    downloadAllowed: false,
    sentAt: "20 Jul 2026, 17:10",
    deliveredAt: "20 Jul 2026, 17:10",
    viewedAt: "21 Jul 2026, 09:05",
    responseDeadline: "31 Jul 2026",
    history: [
      { at: "20 Jul 2026, 16:40", by: "Anjali Kapoor", text: "Draft created" },
      { at: "20 Jul 2026, 17:10", by: "Anjali Kapoor", text: "Sent to employee" },
      { at: "21 Jul 2026, 09:05", by: "Aman Gupta", text: "Document viewed" },
    ],
  },
  {
    id: "D7",
    docNo: "CC/HR/2026/0092",
    ...base("CC-MKT-2023-0007"),
    type: "Relieving Letter",
    subject: "Relieving and experience confirmation — last working day 15 Jul 2026",
    effectiveDate: "15 Jul 2026",
    content:
      "This is to confirm that Tarun Bhatia was employed with Clean Craft as Social Media Executive from 05 Feb 2023 to 15 Jul 2026 and stands relieved of his duties with effect from the close of business on 15 Jul 2026. All dues have been settled.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    confidentiality: "Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "14 Jul 2026",
    approver: "CEO",
    stage: "Closed",
    approval: "Approved",
    delivery: "Viewed",
    ack: "Acknowledged",
    version: 1,
    downloadAllowed: true,
    sentAt: "15 Jul 2026, 18:00",
    deliveredAt: "15 Jul 2026, 18:00",
    viewedAt: "15 Jul 2026, 18:22",
    acknowledgedAt: "15 Jul 2026, 18:25",
    hrClosingNote: "Exit process closed; access deactivation pending with Tech.",
    history: [
      { at: "14 Jul 2026, 11:00", by: "Anjali Kapoor", text: "Draft created" },
      { at: "14 Jul 2026, 15:20", by: "CEO", text: "Approved for issue" },
      { at: "15 Jul 2026, 18:00", by: "Anjali Kapoor", text: "Sent to employee" },
      { at: "15 Jul 2026, 18:25", by: "Tarun Bhatia", text: "Acknowledged" },
      { at: "16 Jul 2026, 10:00", by: "Anjali Kapoor", text: "Document closed with HR note" },
    ],
  },
  {
    id: "D8",
    docNo: "CC/HR/2026/0106",
    ...base("CC-TRAIN-2025-0044"),
    type: "Show-Cause Notice",
    subject: "Show-cause notice — incomplete store launch documentation",
    effectiveDate: "22 Jul 2026",
    content:
      "Dear Vikas Yadav,\n\nYou are required to explain in writing, by the response deadline, the non-submission of launch closure documents for the Indore store despite two reminders. This notice is issued under clause 6.1 of the operations policy.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    evidence: "Reminder emails dated 12 and 18 Jul 2026; launch checklist status report",
    responseDeadline: "29 Jul 2026",
    confidentiality: "Strictly Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "22 Jul 2026",
    approver: "CEO",
    stage: "Sent",
    approval: "Approved",
    delivery: "Delivered",
    ack: "No Response",
    version: 1,
    downloadAllowed: false,
    sentAt: "22 Jul 2026, 12:00",
    deliveredAt: "22 Jul 2026, 12:00",
    warning: {
      reason: "Non-submission of launch closure documentation",
      incidentDate: "18 Jul 2026",
      policy: "Operations Policy clause 6.1 — launch documentation",
      evidence: "Reminder emails; checklist status report",
      previousWarnings: "None",
      correctiveAction: "Submit complete launch closure documents and written explanation",
      reviewDate: "05 Aug 2026",
    },
    history: [
      { at: "22 Jul 2026, 10:15", by: "Anjali Kapoor", text: "Notice drafted with evidence" },
      { at: "22 Jul 2026, 11:30", by: "CEO", text: "Approved for issue" },
      { at: "22 Jul 2026, 12:00", by: "Anjali Kapoor", text: "Sent to employee" },
      { at: "30 Jul 2026, 09:00", by: "System", text: "Response deadline passed — recorded as No Response" },
    ],
  },
  {
    id: "D9",
    docNo: "CC/HR/2026/0107",
    ...base("CC-SALES-2024-0011"),
    type: "Increment Letter",
    subject: "Annual increment effective 01 Aug 2026",
    effectiveDate: "01 Aug 2026",
    content:
      "Dear Rahul Sharma,\n\nBased on your performance review, your revised compensation is effective 01 Aug 2026. Details are shared confidentially in the attached annexure.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    attachment: "increment-annexure-rs.pdf",
    confidentiality: "Strictly Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "30 Jul 2026",
    approver: "CEO",
    stage: "Approved",
    approval: "Approved",
    delivery: "Not Sent",
    ack: "Not Applicable",
    version: 1,
    downloadAllowed: true,
    history: [
      { at: "30 Jul 2026, 09:20", by: "Anjali Kapoor", text: "Draft created" },
      { at: "30 Jul 2026, 14:00", by: "CEO", text: "Approved — ready to send" },
    ],
  },
  {
    id: "D10",
    docNo: "CC/HR/2026/0095",
    ...base("CC-SALES-2025-0026"),
    type: "Confirmation Letter",
    subject: "Confirmation of employment after probation",
    effectiveDate: "03 Jun 2025",
    content:
      "Dear Priya Verma,\n\nWe are pleased to confirm your employment as Sales Executive with effect from 03 Jun 2025 on successful completion of your probation period.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    confidentiality: "Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "01 Jun 2025",
    stage: "Acknowledged",
    approval: "Not Required",
    delivery: "Viewed",
    ack: "Acknowledged",
    version: 1,
    downloadAllowed: true,
    sentAt: "03 Jun 2025, 10:00",
    deliveredAt: "03 Jun 2025, 10:00",
    viewedAt: "03 Jun 2025, 11:15",
    acknowledgedAt: "03 Jun 2025, 11:16",
    history: [
      { at: "01 Jun 2025, 12:00", by: "Anjali Kapoor", text: "Draft created" },
      { at: "03 Jun 2025, 10:00", by: "Anjali Kapoor", text: "Sent to employee" },
      { at: "03 Jun 2025, 11:16", by: "Priya Verma", text: "Acknowledged" },
    ],
  },
  {
    id: "D11",
    docNo: "CC/HR/2026/0108",
    ...base("CC-TECH-2025-0051"),
    type: "Training Requirement",
    subject: "Mandatory training — machine fault diagnostics refresher",
    effectiveDate: "05 Aug 2026",
    content:
      "Dear Kiran Rao,\n\nYou are required to complete the machine fault diagnostics refresher module by 20 Aug 2026. Completion will be recorded in your training history.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    responseDeadline: "20 Aug 2026",
    confidentiality: "Confidential",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "31 Jul 2026",
    stage: "Draft",
    approval: "Not Required",
    delivery: "Not Sent",
    ack: "Not Applicable",
    version: 1,
    downloadAllowed: true,
    history: [{ at: "31 Jul 2026, 17:00", by: "Anjali Kapoor", text: "Draft created" }],
  },
  {
    id: "D12",
    docNo: "CC/HR/2026/0109",
    ...base("CC-SUP-2024-0040"),
    type: "General Notice",
    subject: "Notice — revised pantry and cleaning shift timings",
    effectiveDate: "01 Aug 2026",
    content:
      "Dear Suman Devi,\n\nPlease note the revised shift timings for pantry and cleaning duties at Delhi HO with effect from 01 Aug 2026: 08:30 to 17:30 with a 45-minute break.\n\nFor Clean Craft\nAnjali Kapoor, HR Head",
    confidentiality: "Normal",
    createdBy: "Anjali Kapoor (HR Head)",
    createdOn: "29 Jul 2026",
    stage: "Sent",
    approval: "Not Required",
    delivery: "Sent",
    ack: "Awaiting",
    version: 1,
    downloadAllowed: true,
    sentAt: "29 Jul 2026, 16:30",
    history: [
      { at: "29 Jul 2026, 16:00", by: "Anjali Kapoor", text: "Draft created" },
      { at: "29 Jul 2026, 16:30", by: "Anjali Kapoor", text: "Sent to employee" },
    ],
  },
];

/* ---------------- Templates ---------------- */

export type TemplateStatus = "Draft" | "Published" | "Archived";

export type DocTemplate = {
  id: string;
  name: string;
  type: DocType;
  version: number;
  status: TemplateStatus;
  approvalRequired: boolean;
  mandatoryFields: string[];
  body: string;
  updatedBy: string;
  updatedOn: string;
  versions: { version: number; status: TemplateStatus; on: string; by: string; note: string }[];
};

export const TEMPLATE_TONE: Record<TemplateStatus, string> = {
  Draft: "pending",
  Published: "done",
  Archived: "muted",
};

export const ALL_FIELDS = [
  "Employee",
  "Department",
  "Designation",
  "Subject",
  "Effective date",
  "Document content",
  "Supporting evidence",
  "Response deadline",
  "Attachment",
  "Incident date",
  "Policy or rule",
  "Corrective action",
  "Review date",
];

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: "T1",
    name: "Appointment Letter — Standard",
    type: "Appointment Letter",
    version: 3,
    status: "Published",
    approvalRequired: false,
    mandatoryFields: ["Employee", "Designation", "Effective date", "Document content"],
    body:
      "Dear {{name}},\n\nWe are pleased to appoint you as {{designation}} at Clean Craft, {{location}}, effective {{effectiveDate}}. Your employment is governed by the Clean Craft employee handbook.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "12 Jun 2026",
    versions: [],
  },
  {
    id: "T2",
    name: "Confirmation Letter — Post Probation",
    type: "Confirmation Letter",
    version: 2,
    status: "Published",
    approvalRequired: false,
    mandatoryFields: ["Employee", "Effective date", "Document content"],
    body:
      "Dear {{name}},\n\nWe are pleased to confirm your employment as {{designation}} with effect from {{effectiveDate}} on successful completion of your probation period.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "02 Mar 2026",
    versions: [],
  },
  {
    id: "T3",
    name: "Written Warning — Conduct / Attendance",
    type: "Written Warning",
    version: 4,
    status: "Published",
    approvalRequired: true,
    mandatoryFields: [
      "Employee",
      "Subject",
      "Document content",
      "Supporting evidence",
      "Incident date",
      "Policy or rule",
      "Corrective action",
      "Response deadline",
      "Review date",
    ],
    body:
      "Dear {{name}},\n\nThis is a formal written warning regarding {{reason}} on {{incidentDate}}, in breach of {{policy}}. You are required to submit a written explanation by {{responseDeadline}} and to complete the following corrective action: {{correctiveAction}}. Your conduct will be reviewed on {{reviewDate}}.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "18 Jul 2026",
    versions: [],
  },
  {
    id: "T4",
    name: "Show-Cause Notice — Standard",
    type: "Show-Cause Notice",
    version: 2,
    status: "Published",
    approvalRequired: true,
    mandatoryFields: [
      "Employee",
      "Document content",
      "Supporting evidence",
      "Incident date",
      "Policy or rule",
      "Response deadline",
    ],
    body:
      "Dear {{name}},\n\nYou are required to explain in writing, by {{responseDeadline}}, the following: {{reason}} (incident dated {{incidentDate}}), under {{policy}}.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "20 Jul 2026",
    versions: [],
  },
  {
    id: "T5",
    name: "Appreciation Letter — Standard",
    type: "Appreciation Letter",
    version: 2,
    status: "Published",
    approvalRequired: false,
    mandatoryFields: ["Employee", "Subject", "Document content"],
    body:
      "Dear {{name}},\n\nOn behalf of Clean Craft, we appreciate {{reason}}. Your contribution is noted in your performance record.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "05 May 2026",
    versions: [],
  },
  {
    id: "T6",
    name: "Relieving & Experience Letter",
    type: "Relieving Letter",
    version: 3,
    status: "Published",
    approvalRequired: true,
    mandatoryFields: ["Employee", "Effective date", "Document content"],
    body:
      "This is to confirm that {{name}} was employed with Clean Craft as {{designation}} from {{doj}} to {{effectiveDate}} and stands relieved with effect from the close of business on {{effectiveDate}}.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "01 Jul 2026",
    versions: [],
  },
  {
    id: "T7",
    name: "Improvement Plan Letter",
    type: "Improvement Plan",
    version: 1,
    status: "Draft",
    approvalRequired: true,
    mandatoryFields: ["Employee", "Document content", "Review date", "Corrective action"],
    body:
      "Dear {{name}},\n\nThis letter records the performance improvement plan agreed on {{effectiveDate}}. Required improvements: {{correctiveAction}}. Progress will be reviewed on {{reviewDate}}.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "28 Jul 2026",
    versions: [],
  },
  {
    id: "T8",
    name: "General Notice — Operations (old format)",
    type: "General Notice",
    version: 1,
    status: "Archived",
    approvalRequired: false,
    mandatoryFields: ["Employee", "Subject", "Document content"],
    body: "Dear {{name}},\n\nPlease note: {{reason}}.\n\nFor Clean Craft\n{{hrName}}, HR Head",
    updatedBy: "Anjali Kapoor",
    updatedOn: "14 Feb 2026",
    versions: [],
  },
];

DOC_TEMPLATES.forEach((t) => {
  if (t.versions.length === 0) {
    t.versions = Array.from({ length: t.version }, (_, i) => ({
      version: i + 1,
      status: (i + 1 === t.version ? t.status : "Archived") as TemplateStatus,
      on: i + 1 === t.version ? t.updatedOn : "Earlier",
      by: t.updatedBy,
      note: i + 1 === t.version ? "Current version" : "Superseded — preserved for record",
    }));
  }
});

export const PRIVACY_NOTE =
  "Letters, warnings, salary changes and performance feedback are confidential. Access is limited to authorised HR users, the CEO, required approvers and the respective employee. Every view, download, approval, edit and send action is recorded. Issued documents are never deleted.";

export const nextDocNo = (docs: HrDoc[]) => {
  const max = docs.reduce((m, d) => {
    const n = Number(d.docNo.split("/").pop());
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `CC/HR/2026/${String(max + 1).padStart(4, "0")}`;
};

export const nowStamp = () =>
  new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
