export const ONB_STAGES = [
  "Joining Confirmed",
  "Documents Pending",
  "Documents Under Verification",
  "Letters Pending",
  "User Access Pending",
  "Orientation Pending",
  "Ready to Join",
  "Onboarding Completed",
] as const;
export type OnbStage = (typeof ONB_STAGES)[number];

export const DOC_STATUSES = [
  "Missing",
  "Uploaded",
  "Under Verification",
  "Verified",
  "Rejected",
  "Expired",
  "Reupload Required",
] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];

export const DOC_CATEGORIES = [
  "Identity Documents",
  "Address Documents",
  "Education Documents",
  "Experience Documents",
  "Salary Documents",
  "Bank Documents",
  "Employment Letters",
  "Signed Policies and Forms",
] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

export type DocVersion = { v: number; at: string; by: string; note: string };

export type OnbDoc = {
  id: string;
  type: string;
  category: DocCategory;
  number?: string;
  masked?: string;
  issueDate?: string;
  expiryDate?: string;
  file?: string;
  status: DocStatus;
  verifiedBy?: string;
  verifiedOn?: string;
  rejectionReason?: string;
  mandatory: boolean;
  versions: DocVersion[];
};

export type LetterAck = {
  id: string;
  kind: "Joining letter" | "Appointment letter";
  version: string;
  sentAt?: string;
  viewedAt?: string;
  acknowledgedAt?: string;
  status: "Not Issued" | "Sent" | "Viewed" | "Acknowledged";
};

export const CHECKLIST_ITEMS = [
  { key: "personal", label: "Personal details completed", mandatory: true },
  { key: "empid", label: "Employee ID generated", mandatory: true },
  { key: "photo", label: "Profile photo uploaded", mandatory: false },
  { key: "aadhaar", label: "Aadhaar uploaded and verified", mandatory: true },
  { key: "pan", label: "PAN uploaded and verified", mandatory: true },
  { key: "bank", label: "Bank details uploaded and verified", mandatory: true },
  { key: "address", label: "Address proof uploaded", mandatory: true },
  { key: "education", label: "Education documents uploaded", mandatory: true },
  { key: "experience", label: "Experience letter uploaded", mandatory: false },
  { key: "slips", label: "Previous salary slips uploaded", mandatory: false },
  { key: "emergency", label: "Emergency contact added", mandatory: true },
  { key: "joining_letter", label: "Joining letter issued", mandatory: true },
  { key: "appointment_letter", label: "Appointment letter issued", mandatory: true },
  { key: "ack", label: "Employee acknowledgement received", mandatory: true },
  { key: "invite", label: "User account invitation sent", mandatory: true },
  { key: "manager", label: "Reporting manager assigned", mandatory: true },
  { key: "policies", label: "Company policies acknowledged", mandatory: true },
  { key: "orientation", label: "Orientation completed", mandatory: true },
] as const;
export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];

export type OnboardingRecord = {
  empId: string;
  name: string;
  photo: string;
  designation: string;
  dept: string;
  manager: string;
  doj: string;
  candidateId?: string;
  stage: OnbStage;
  checklist: Record<ChecklistKey, boolean>;
  docs: OnbDoc[];
  letters: LetterAck[];
  audit: { at: string; by: string; text: string }[];
};

const cl = (done: ChecklistKey[]): Record<ChecklistKey, boolean> =>
  CHECKLIST_ITEMS.reduce(
    (acc, it) => ({ ...acc, [it.key]: done.includes(it.key) }),
    {} as Record<ChecklistKey, boolean>,
  );

const doc = (
  id: string,
  type: string,
  category: DocCategory,
  status: DocStatus,
  extra: Partial<OnbDoc> = {},
): OnbDoc => ({
  id,
  type,
  category,
  status,
  mandatory: true,
  versions:
    status === "Missing"
      ? []
      : [{ v: 1, at: "28 Jul 2026 10:12", by: "Employee upload", note: "Initial upload" }],
  ...extra,
});

export const ONBOARDING_RECORDS: OnboardingRecord[] = [
  {
    empId: "CC-SUP-2026-0061",
    name: "Mohit Kumar",
    photo: "MK",
    designation: "Packing Staff",
    dept: "Support Staff",
    manager: "Suresh Nair (Administration Manager)",
    doj: "28 Jul 2026",
    candidateId: "CAN-204",
    stage: "Documents Pending",
    checklist: cl(["personal", "empid", "photo", "aadhaar", "emergency", "manager", "invite"]),
    docs: [
      doc("D-101", "Aadhaar card", "Identity Documents", "Verified", {
        masked: "XXXX XXXX 7712",
        issueDate: "12 Mar 2018",
        file: "aadhaar_mohit.pdf",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "29 Jul 2026",
      }),
      doc("D-102", "PAN card", "Identity Documents", "Missing", { masked: "—" }),
      doc("D-103", "Bank passbook / cancelled cheque", "Bank Documents", "Missing"),
      doc("D-104", "Address proof (rent agreement)", "Address Documents", "Under Verification", {
        masked: "—",
        file: "rent_agreement.pdf",
      }),
      doc("D-105", "Class 12 marksheet", "Education Documents", "Rejected", {
        file: "marksheet_scan.jpg",
        rejectionReason: "Scan is blurred — marks column not readable.",
        versions: [{ v: 1, at: "28 Jul 2026 10:12", by: "Employee upload", note: "Initial upload" }],
      }),
      doc("D-106", "Experience letter", "Experience Documents", "Missing", { mandatory: false }),
      doc("D-107", "Previous salary slips", "Salary Documents", "Missing", { mandatory: false }),
      doc("D-108", "Signed code of conduct", "Signed Policies and Forms", "Missing"),
    ],
    letters: [
      { id: "L-201", kind: "Joining letter", version: "v1.0", sentAt: "28 Jul 2026 09:20", viewedAt: "28 Jul 2026 11:05", status: "Viewed" },
      { id: "L-202", kind: "Appointment letter", version: "v1.0", status: "Not Issued" },
    ],
    audit: [
      { at: "28 Jul 2026 09:05", by: "Anjali Kapoor (HR Head)", text: "Candidate CAN-204 marked Joined — onboarding started automatically" },
      { at: "28 Jul 2026 09:20", by: "Anjali Kapoor (HR Head)", text: "Joining letter v1.0 sent" },
      { at: "29 Jul 2026 10:40", by: "Anjali Kapoor (HR Head)", text: "Aadhaar verified (document view logged)" },
      { at: "29 Jul 2026 10:44", by: "Anjali Kapoor (HR Head)", text: "Class 12 marksheet rejected — reupload requested" },
    ],
  },
  {
    empId: "CC-SALES-2026-0062",
    name: "Ishita Bansal",
    photo: "IB",
    designation: "Sales Executive",
    dept: "Sales",
    manager: "Rahul Sharma (Sales Head)",
    doj: "01 Aug 2026",
    candidateId: "CAN-211",
    stage: "Documents Under Verification",
    checklist: cl([
      "personal",
      "empid",
      "photo",
      "aadhaar",
      "pan",
      "address",
      "education",
      "experience",
      "emergency",
      "manager",
      "joining_letter",
      "invite",
    ]),
    docs: [
      doc("D-201", "Aadhaar card", "Identity Documents", "Verified", {
        masked: "XXXX XXXX 3391",
        file: "aadhaar.pdf",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "31 Jul 2026",
      }),
      doc("D-202", "PAN card", "Identity Documents", "Verified", {
        masked: "XXXXX4471C",
        file: "pan.pdf",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "31 Jul 2026",
      }),
      doc("D-203", "Bank details", "Bank Documents", "Under Verification", {
        masked: "XXXXXX2201",
        file: "bank_cheque.jpg",
      }),
      doc("D-204", "Aadhaar as address proof", "Address Documents", "Verified", {
        masked: "XXXX XXXX 3391",
        file: "aadhaar.pdf",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "31 Jul 2026",
      }),
      doc("D-205", "Graduation degree", "Education Documents", "Under Verification", { file: "bcom_degree.pdf" }),
      doc("D-206", "Experience letter", "Experience Documents", "Uploaded", { mandatory: false, file: "exp_letter.pdf" }),
      doc("D-207", "Previous salary slips (3 months)", "Salary Documents", "Uploaded", { mandatory: false, file: "slips.pdf" }),
      doc("D-208", "Signed NDA", "Signed Policies and Forms", "Missing"),
    ],
    letters: [
      { id: "L-211", kind: "Joining letter", version: "v1.0", sentAt: "26 Jul 2026 15:10", viewedAt: "26 Jul 2026 15:44", acknowledgedAt: "26 Jul 2026 16:02", status: "Acknowledged" },
      { id: "L-212", kind: "Appointment letter", version: "v1.1", sentAt: "01 Aug 2026 09:30", viewedAt: "01 Aug 2026 10:12", status: "Viewed" },
    ],
    audit: [
      { at: "26 Jul 2026 15:10", by: "Anjali Kapoor (HR Head)", text: "Joining letter v1.0 sent" },
      { at: "01 Aug 2026 09:30", by: "Anjali Kapoor (HR Head)", text: "Appointment letter v1.1 issued" },
      { at: "31 Jul 2026 12:02", by: "Anjali Kapoor (HR Head)", text: "Aadhaar and PAN verified (views logged)" },
    ],
  },
  {
    empId: "CC-TECH-2026-0063",
    name: "Farhan Qureshi",
    photo: "FQ",
    designation: "Field Engineer",
    dept: "Tech",
    manager: "Kiran Rao (Technical Support Lead)",
    doj: "04 Aug 2026",
    candidateId: "CAN-215",
    stage: "Joining Confirmed",
    checklist: cl(["personal", "empid", "manager"]),
    docs: [
      doc("D-301", "Aadhaar card", "Identity Documents", "Missing"),
      doc("D-302", "PAN card", "Identity Documents", "Missing"),
      doc("D-303", "Bank details", "Bank Documents", "Missing"),
      doc("D-304", "Address proof", "Address Documents", "Missing"),
      doc("D-305", "Diploma certificate", "Education Documents", "Missing"),
      doc("D-306", "Experience letter", "Experience Documents", "Missing", { mandatory: false }),
      doc("D-307", "Previous salary slips", "Salary Documents", "Missing", { mandatory: false }),
      doc("D-308", "Signed safety policy", "Signed Policies and Forms", "Missing"),
    ],
    letters: [
      { id: "L-311", kind: "Joining letter", version: "v1.0", status: "Not Issued" },
      { id: "L-312", kind: "Appointment letter", version: "v1.0", status: "Not Issued" },
    ],
    audit: [
      { at: "30 Jul 2026 17:40", by: "Anjali Kapoor (HR Head)", text: "Candidate CAN-215 marked Joined — onboarding record created" },
    ],
  },
  {
    empId: "CC-MKT-2026-0059",
    name: "Ananya Deshmukh",
    photo: "AD",
    designation: "Social Media Executive",
    dept: "Marketing",
    manager: "Arjun Mehta (Performance Marketing Executive)",
    doj: "14 Jul 2026",
    candidateId: "CAN-198",
    stage: "Orientation Pending",
    checklist: cl([
      "personal",
      "empid",
      "photo",
      "aadhaar",
      "pan",
      "bank",
      "address",
      "education",
      "experience",
      "slips",
      "emergency",
      "joining_letter",
      "appointment_letter",
      "ack",
      "invite",
      "manager",
      "policies",
    ]),
    docs: [
      doc("D-401", "Aadhaar card", "Identity Documents", "Verified", {
        masked: "XXXX XXXX 8890",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "15 Jul 2026",
        file: "aadhaar.pdf",
      }),
      doc("D-402", "PAN card", "Identity Documents", "Verified", {
        masked: "XXXXX2214J",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "15 Jul 2026",
        file: "pan.pdf",
      }),
      doc("D-403", "Bank details", "Bank Documents", "Verified", {
        masked: "XXXXXX5567",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "15 Jul 2026",
        file: "bank.pdf",
      }),
      doc("D-404", "Electricity bill", "Address Documents", "Verified", {
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "15 Jul 2026",
        file: "bill.pdf",
        expiryDate: "14 Oct 2026",
      }),
      doc("D-405", "Graduation degree", "Education Documents", "Verified", {
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "15 Jul 2026",
        file: "degree.pdf",
      }),
      doc("D-406", "Experience letter", "Experience Documents", "Verified", {
        mandatory: false,
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "15 Jul 2026",
        file: "exp.pdf",
      }),
      doc("D-407", "Previous salary slips", "Salary Documents", "Verified", {
        mandatory: false,
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "15 Jul 2026",
        file: "slips.pdf",
      }),
      doc("D-408", "Signed code of conduct", "Signed Policies and Forms", "Verified", {
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "16 Jul 2026",
        file: "coc_signed.pdf",
      }),
      doc("D-409", "Police verification form", "Identity Documents", "Expired", {
        mandatory: false,
        file: "pv_form.pdf",
        expiryDate: "20 Jul 2026",
      }),
    ],
    letters: [
      { id: "L-411", kind: "Joining letter", version: "v1.0", sentAt: "10 Jul 2026 11:00", viewedAt: "10 Jul 2026 11:22", acknowledgedAt: "10 Jul 2026 11:30", status: "Acknowledged" },
      { id: "L-412", kind: "Appointment letter", version: "v1.0", sentAt: "14 Jul 2026 09:15", viewedAt: "14 Jul 2026 09:40", acknowledgedAt: "14 Jul 2026 09:52", status: "Acknowledged" },
    ],
    audit: [
      { at: "14 Jul 2026 09:15", by: "Anjali Kapoor (HR Head)", text: "Appointment letter v1.0 sent" },
      { at: "16 Jul 2026 10:00", by: "Anjali Kapoor (HR Head)", text: "All mandatory documents verified" },
      { at: "20 Jul 2026 00:00", by: "System", text: "Police verification form marked Expired" },
    ],
  },
  {
    empId: "CC-PROJ-2026-0058",
    name: "Devansh Rathore",
    photo: "DR",
    designation: "Project Manager",
    dept: "Projects",
    manager: "Sneha Iyer (Project Coordinator)",
    doj: "01 Jul 2026",
    candidateId: "CAN-191",
    stage: "Onboarding Completed",
    checklist: cl(CHECKLIST_ITEMS.map((i) => i.key)),
    docs: [
      doc("D-501", "Aadhaar card", "Identity Documents", "Verified", {
        masked: "XXXX XXXX 1102",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "02 Jul 2026",
        file: "aadhaar.pdf",
      }),
      doc("D-502", "PAN card", "Identity Documents", "Verified", {
        masked: "XXXXX7789F",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "02 Jul 2026",
        file: "pan.pdf",
      }),
      doc("D-503", "Bank details", "Bank Documents", "Verified", {
        masked: "XXXXXX9012",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "02 Jul 2026",
        file: "bank.pdf",
      }),
      doc("D-504", "Passport", "Address Documents", "Verified", {
        masked: "XXXXXX21",
        expiryDate: "18 Mar 2031",
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "02 Jul 2026",
        file: "passport.pdf",
      }),
      doc("D-505", "B.Tech degree", "Education Documents", "Verified", {
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "02 Jul 2026",
        file: "degree.pdf",
      }),
      doc("D-506", "Experience letters (2)", "Experience Documents", "Verified", {
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "02 Jul 2026",
        file: "exp.pdf",
      }),
      doc("D-507", "Previous salary slips", "Salary Documents", "Verified", {
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "02 Jul 2026",
        file: "slips.pdf",
      }),
      doc("D-508", "Signed policy bundle", "Signed Policies and Forms", "Verified", {
        verifiedBy: "Anjali Kapoor (HR Head)",
        verifiedOn: "03 Jul 2026",
        file: "policies_signed.pdf",
      }),
    ],
    letters: [
      { id: "L-511", kind: "Joining letter", version: "v1.0", sentAt: "24 Jun 2026 12:00", viewedAt: "24 Jun 2026 12:30", acknowledgedAt: "24 Jun 2026 12:35", status: "Acknowledged" },
      { id: "L-512", kind: "Appointment letter", version: "v1.0", sentAt: "01 Jul 2026 09:10", viewedAt: "01 Jul 2026 09:25", acknowledgedAt: "01 Jul 2026 09:31", status: "Acknowledged" },
    ],
    audit: [
      { at: "03 Jul 2026 16:20", by: "Anjali Kapoor (HR Head)", text: "Orientation marked complete" },
      { at: "03 Jul 2026 16:22", by: "Anjali Kapoor (HR Head)", text: "Onboarding completed — Employees and Dashboard updated" },
    ],
  },
];

export const DOC_TONE: Record<DocStatus, string> = {
  Missing: "urgent",
  Uploaded: "active",
  "Under Verification": "pending",
  Verified: "done",
  Rejected: "urgent",
  Expired: "urgent",
  "Reupload Required": "pending",
};

export const STAGE_TONE: Record<OnbStage, string> = {
  "Joining Confirmed": "active",
  "Documents Pending": "urgent",
  "Documents Under Verification": "pending",
  "Letters Pending": "pending",
  "User Access Pending": "pending",
  "Orientation Pending": "pending",
  "Ready to Join": "active",
  "Onboarding Completed": "done",
};

export const REJECTION_REASONS = [
  "Document is blurred or unreadable",
  "Wrong document type uploaded",
  "Details do not match employee record",
  "Document has expired",
  "Partial or cropped page uploaded",
  "Signature or stamp missing",
];

export const progressOf = (r: OnboardingRecord) => {
  const total = CHECKLIST_ITEMS.length;
  const done = CHECKLIST_ITEMS.filter((i) => r.checklist[i.key]).length;
  return Math.round((done / total) * 100);
};

export const missingCountOf = (r: OnboardingRecord) =>
  CHECKLIST_ITEMS.filter((i) => i.mandatory && !r.checklist[i.key]).length +
  r.docs.filter((d) => d.mandatory && ["Missing", "Rejected", "Expired", "Reupload Required"].includes(d.status)).length;

export const canComplete = (r: OnboardingRecord) =>
  CHECKLIST_ITEMS.every((i) => !i.mandatory || r.checklist[i.key]) &&
  r.docs.every((d) => !d.mandatory || d.status === "Verified");
