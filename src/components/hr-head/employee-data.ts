import type { Dept } from "./data";

export const EMP_STATUSES = [
  "Onboarding",
  "Probation",
  "Confirmed",
  "On Leave",
  "Notice Period",
  "Exited",
] as const;
export type EmpStatus = (typeof EMP_STATUSES)[number];

export const ACCOUNT_STATUSES = ["Not Created", "Invited", "Active", "Deactivated"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const MANDATORY_DOCS = [
  "Aadhaar card",
  "PAN card",
  "Bank details",
  "Education documents",
  "Experience letters",
  "Previous salary slips",
  "Address proof",
  "Signed appointment letter",
] as const;

export type EmpDoc = { name: string; ok: boolean; masked?: string; updatedOn?: string };

export type LetterItem = {
  id: string;
  kind: string;
  issuedOn: string;
  ack: "Acknowledged" | "Pending";
  confidential: boolean;
};

export type HistoryItem = { at: string; by: string; text: string };

export type MasterEmployee = {
  empId: string;
  name: string;
  photo: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  mobile: string;
  personalEmail: string;
  workEmail: string;
  currentAddress: string;
  permanentAddress: string;
  emergencyContact: string;
  bloodGroup: string;

  designation: string;
  dept: Dept;
  manager: string;
  location: string;
  employmentType: EmploymentType;
  doj: string;
  probationEnd: string;
  confirmationDate: string;
  ctc: string;
  bankMasked: string;
  aadhaarMasked: string;
  panMasked: string;
  status: EmpStatus;
  account: AccountStatus;

  docs: EmpDoc[];
  attendancePct: number;
  presentDays: number;
  leaveBalance: number;
  leavesTaken: number;
  onLeaveToday: boolean;

  lastReview: string;
  reviewDue: string;
  reviewStatus: "Completed" | "Due" | "Overdue";
  rating: number;
  trainings: { name: string; status: "Completed" | "In Progress" | "Not Started" }[];

  letters: LetterItem[];
  history: HistoryItem[];
  candidateId?: string;
  exitDate?: string;
  clearance?: { item: string; done: boolean }[];
};

const docs = (missing: string[] = []): EmpDoc[] =>
  MANDATORY_DOCS.map((d) => ({
    name: d,
    ok: !missing.includes(d),
    masked:
      d === "Aadhaar card"
        ? "XXXX XXXX 4821"
        : d === "PAN card"
          ? "XXXXX1234X"
          : d === "Bank details"
            ? "XXXXXX7790"
            : undefined,
    updatedOn: missing.includes(d) ? undefined : "18 Jul 2026",
  }));

export const MASTER_EMPLOYEES: MasterEmployee[] = [
  {
    empId: "CC-SALES-2024-0011",
    name: "Rahul Sharma",
    photo: "RS",
    dob: "14 Mar 1990",
    gender: "Male",
    mobile: "98110 22101",
    personalEmail: "rahul.sharma90@gmail.com",
    workEmail: "rahul.sharma@cleancraft.in",
    currentAddress: "B-42, Lajpat Nagar, New Delhi",
    permanentAddress: "B-42, Lajpat Nagar, New Delhi",
    emergencyContact: "Meena Sharma · 98110 22199",
    bloodGroup: "B+",
    designation: "Sales Head",
    dept: "Sales",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "12 Jan 2024",
    probationEnd: "12 Apr 2024",
    confirmationDate: "12 Apr 2024",
    ctc: "₹12.0L",
    bankMasked: "XXXXXX7790",
    aadhaarMasked: "XXXX XXXX 4821",
    panMasked: "XXXXX1234X",
    status: "Confirmed",
    account: "Active",
    docs: docs(),
    attendancePct: 97,
    presentDays: 21,
    leaveBalance: 8,
    leavesTaken: 4,
    onLeaveToday: false,
    lastReview: "10 Feb 2026",
    reviewDue: "10 Aug 2026",
    reviewStatus: "Due",
    rating: 4.6,
    trainings: [
      { name: "Franchise Sales Masterclass", status: "Completed" },
      { name: "Leadership Basics", status: "In Progress" },
    ],
    letters: [
      { id: "LT-11", kind: "Appointment letter", issuedOn: "12 Jan 2024", ack: "Acknowledged", confidential: false },
      { id: "LT-58", kind: "Appreciation letter", issuedOn: "18 May 2026", ack: "Acknowledged", confidential: false },
    ],
    history: [
      { at: "12 Jan 2024", by: "Anjali Kapoor", text: "Employee record created from candidate CAN-118" },
      { at: "12 Apr 2024", by: "Anjali Kapoor", text: "Status changed: Probation → Confirmed" },
      { at: "01 Apr 2026", by: "Anjali Kapoor", text: "Designation changed: Sr. Sales Exec → Sales Head" },
    ],
    candidateId: "CAN-118",
  },
  {
    empId: "CC-SALES-2025-0026",
    name: "Priya Verma",
    photo: "PV",
    dob: "02 Sep 1996",
    gender: "Female",
    mobile: "98110 22104",
    personalEmail: "priya.verma96@gmail.com",
    workEmail: "priya.verma@cleancraft.in",
    currentAddress: "C-11, Sector 62, Noida",
    permanentAddress: "Civil Lines, Kanpur",
    emergencyContact: "Rakesh Verma · 98110 22188",
    bloodGroup: "O+",
    designation: "Sales Executive",
    dept: "Sales",
    manager: "Rahul Sharma (Sales Head)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "03 Mar 2025",
    probationEnd: "03 Jun 2025",
    confirmationDate: "03 Jun 2025",
    ctc: "₹4.2L",
    bankMasked: "XXXXXX4412",
    aadhaarMasked: "XXXX XXXX 7734",
    panMasked: "XXXXX9087Y",
    status: "On Leave",
    account: "Active",
    docs: docs(),
    attendancePct: 94,
    presentDays: 19,
    leaveBalance: 6,
    leavesTaken: 6,
    onLeaveToday: true,
    lastReview: "05 Mar 2026",
    reviewDue: "05 Sep 2026",
    reviewStatus: "Completed",
    rating: 4.2,
    trainings: [{ name: "Lead Qualification", status: "Completed" }],
    letters: [
      { id: "LT-33", kind: "Confirmation letter", issuedOn: "03 Jun 2025", ack: "Acknowledged", confidential: false },
    ],
    history: [
      { at: "03 Mar 2025", by: "Anjali Kapoor", text: "Employee record created" },
      { at: "03 Jun 2025", by: "Anjali Kapoor", text: "Status changed: Probation → Confirmed" },
      { at: "01 Aug 2026", by: "System", text: "Marked On Leave (approved casual leave)" },
    ],
  },
  {
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dob: "21 Jun 1992",
    gender: "Male",
    mobile: "98110 22109",
    personalEmail: "aman.gupta92@gmail.com",
    workEmail: "aman.gupta@cleancraft.in",
    currentAddress: "Vaishali, Ghaziabad",
    permanentAddress: "Vaishali, Ghaziabad",
    emergencyContact: "Kavita Gupta · 98110 22177",
    bloodGroup: "A+",
    designation: "Project Manager",
    dept: "Projects",
    manager: "Sneha Iyer (Project Coordinator)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "21 Jun 2024",
    probationEnd: "21 Sep 2024",
    confirmationDate: "21 Sep 2024",
    ctc: "₹7.8L",
    bankMasked: "XXXXXX2210",
    aadhaarMasked: "XXXX XXXX 1190",
    panMasked: "XXXXX4432L",
    status: "Confirmed",
    account: "Active",
    docs: docs(["Previous salary slips"]),
    attendancePct: 92,
    presentDays: 20,
    leaveBalance: 4,
    leavesTaken: 8,
    onLeaveToday: false,
    lastReview: "15 Jan 2026",
    reviewDue: "15 Jul 2026",
    reviewStatus: "Overdue",
    rating: 4.4,
    trainings: [{ name: "Site Safety & Compliance", status: "In Progress" }],
    letters: [
      { id: "LT-41", kind: "Confidential feedback", issuedOn: "20 Jul 2026", ack: "Pending", confidential: true },
    ],
    history: [
      { at: "21 Jun 2024", by: "Anjali Kapoor", text: "Employee record created" },
      { at: "21 Sep 2024", by: "Anjali Kapoor", text: "Status changed: Probation → Confirmed" },
    ],
  },
  {
    empId: "CC-PROJ-2024-0031",
    name: "Sneha Iyer",
    photo: "SI",
    dob: "09 Sep 1994",
    gender: "Female",
    mobile: "98110 22112",
    personalEmail: "sneha.iyer94@gmail.com",
    workEmail: "sneha.iyer@cleancraft.in",
    currentAddress: "Dwarka Sector 12, New Delhi",
    permanentAddress: "Mylapore, Chennai",
    emergencyContact: "Ravi Iyer · 98110 22166",
    bloodGroup: "AB+",
    designation: "Project Coordinator",
    dept: "Projects",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "09 Sep 2024",
    probationEnd: "09 Dec 2024",
    confirmationDate: "09 Dec 2024",
    ctc: "₹6.6L",
    bankMasked: "XXXXXX9931",
    aadhaarMasked: "XXXX XXXX 6612",
    panMasked: "XXXXX7781M",
    status: "Confirmed",
    account: "Active",
    docs: docs(),
    attendancePct: 96,
    presentDays: 21,
    leaveBalance: 9,
    leavesTaken: 3,
    onLeaveToday: false,
    lastReview: "20 Mar 2026",
    reviewDue: "20 Sep 2026",
    reviewStatus: "Completed",
    rating: 4.5,
    trainings: [{ name: "Vendor Management", status: "Completed" }],
    letters: [],
    history: [{ at: "09 Sep 2024", by: "Anjali Kapoor", text: "Employee record created" }],
  },
  {
    empId: "CC-TRAIN-2025-0044",
    name: "Vikas Yadav",
    photo: "VY",
    dob: "11 Nov 1997",
    gender: "Male",
    mobile: "98110 22118",
    personalEmail: "vikas.yadav97@gmail.com",
    workEmail: "vikas.yadav@cleancraft.in",
    currentAddress: "Vijay Nagar, Indore",
    permanentAddress: "Vijay Nagar, Indore",
    emergencyContact: "Sunita Yadav · 98110 22155",
    bloodGroup: "B-",
    designation: "Trainer & Launch Executive",
    dept: "Training",
    manager: "Anjali Kapoor (HR Head)",
    location: "Indore",
    employmentType: "Full-time",
    doj: "14 Feb 2025",
    probationEnd: "10 Aug 2026",
    confirmationDate: "—",
    ctc: "₹3.6L",
    bankMasked: "XXXXXX5540",
    aadhaarMasked: "XXXX XXXX 3390",
    panMasked: "XXXXX2265P",
    status: "Probation",
    account: "Active",
    docs: docs(["Experience letters", "Previous salary slips"]),
    attendancePct: 89,
    presentDays: 18,
    leaveBalance: 2,
    leavesTaken: 5,
    onLeaveToday: false,
    lastReview: "—",
    reviewDue: "27 Jul 2026",
    reviewStatus: "Overdue",
    rating: 3.8,
    trainings: [{ name: "Store Launch Playbook", status: "In Progress" }],
    letters: [
      { id: "LT-74", kind: "Confidential notice", issuedOn: "22 Jul 2026", ack: "Pending", confidential: true },
    ],
    history: [
      { at: "14 Feb 2025", by: "Anjali Kapoor", text: "Employee record created" },
      { at: "27 Jul 2026", by: "System", text: "Probation review flagged overdue" },
    ],
  },
  {
    empId: "CC-TRAIN-2024-0022",
    name: "Neha Kulkarni",
    photo: "NK",
    dob: "05 Jan 1993",
    gender: "Female",
    mobile: "98110 22121",
    personalEmail: "neha.k93@gmail.com",
    workEmail: "neha.k@cleancraft.in",
    currentAddress: "Kothrud, Pune",
    permanentAddress: "Kothrud, Pune",
    emergencyContact: "Mahesh Kulkarni · 98110 22144",
    bloodGroup: "O-",
    designation: "Relationship Manager",
    dept: "Training",
    manager: "Anjali Kapoor (HR Head)",
    location: "Pune",
    employmentType: "Full-time",
    doj: "01 Aug 2024",
    probationEnd: "01 Nov 2024",
    confirmationDate: "01 Nov 2024",
    ctc: "₹5.4L",
    bankMasked: "XXXXXX8820",
    aadhaarMasked: "XXXX XXXX 5521",
    panMasked: "XXXXX3390R",
    status: "Confirmed",
    account: "Active",
    docs: docs(),
    attendancePct: 95,
    presentDays: 21,
    leaveBalance: 7,
    leavesTaken: 4,
    onLeaveToday: false,
    lastReview: "01 Feb 2026",
    reviewDue: "01 Aug 2026",
    reviewStatus: "Due",
    rating: 4.3,
    trainings: [{ name: "Franchise Retention", status: "Completed" }],
    letters: [],
    history: [{ at: "01 Aug 2024", by: "Anjali Kapoor", text: "Employee record created" }],
  },
  {
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dob: "18 Nov 1995",
    gender: "Male",
    mobile: "98110 22126",
    personalEmail: "arjun.mehta95@gmail.com",
    workEmail: "arjun.mehta@cleancraft.in",
    currentAddress: "Sector 45, Gurugram",
    permanentAddress: "Sector 45, Gurugram",
    emergencyContact: "Nisha Mehta · 98110 22133",
    bloodGroup: "A-",
    designation: "Performance Marketing Executive",
    dept: "Marketing",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "18 Nov 2024",
    probationEnd: "18 Feb 2025",
    confirmationDate: "18 Feb 2025",
    ctc: "₹5.0L",
    bankMasked: "XXXXXX1177",
    aadhaarMasked: "XXXX XXXX 8890",
    panMasked: "XXXXX5512T",
    status: "Confirmed",
    account: "Active",
    docs: docs(),
    attendancePct: 93,
    presentDays: 20,
    leaveBalance: 5,
    leavesTaken: 6,
    onLeaveToday: false,
    lastReview: "10 Apr 2026",
    reviewDue: "10 Oct 2026",
    reviewStatus: "Completed",
    rating: 4.1,
    trainings: [{ name: "Google Ads Advanced", status: "Not Started" }],
    letters: [],
    history: [{ at: "18 Nov 2024", by: "Anjali Kapoor", text: "Employee record created" }],
  },
  {
    empId: "CC-TECH-2025-0051",
    name: "Kiran Rao",
    photo: "KR",
    dob: "27 Jul 1991",
    gender: "Male",
    mobile: "98110 22130",
    personalEmail: "kiran.rao91@gmail.com",
    workEmail: "kiran.rao@cleancraft.in",
    currentAddress: "Rajajinagar, Bengaluru",
    permanentAddress: "Rajajinagar, Bengaluru",
    emergencyContact: "Deepa Rao · 98110 22122",
    bloodGroup: "B+",
    designation: "Technical Support Lead",
    dept: "Tech",
    manager: "Anjali Kapoor (HR Head)",
    location: "Bengaluru",
    employmentType: "Full-time",
    doj: "07 Apr 2025",
    probationEnd: "07 Jul 2025",
    confirmationDate: "07 Jul 2025",
    ctc: "₹6.0L",
    bankMasked: "XXXXXX6654",
    aadhaarMasked: "XXXX XXXX 2201",
    panMasked: "XXXXX6678K",
    status: "Confirmed",
    account: "Active",
    docs: docs(["Address proof"]),
    attendancePct: 91,
    presentDays: 20,
    leaveBalance: 3,
    leavesTaken: 7,
    onLeaveToday: false,
    lastReview: "07 Jan 2026",
    reviewDue: "07 Jul 2026",
    reviewStatus: "Overdue",
    rating: 4.0,
    trainings: [{ name: "Machine Fault Diagnostics", status: "Completed" }],
    letters: [],
    history: [{ at: "07 Apr 2025", by: "Anjali Kapoor", text: "Employee record created" }],
  },
  {
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dob: "30 Apr 1989",
    gender: "Male",
    mobile: "98110 22133",
    personalEmail: "sanjay.patil89@gmail.com",
    workEmail: "sanjay.patil@cleancraft.in",
    currentAddress: "Malviya Nagar, Jaipur",
    permanentAddress: "Malviya Nagar, Jaipur",
    emergencyContact: "Asha Patil · 98110 22111",
    bloodGroup: "O+",
    designation: "Field Engineer",
    dept: "Tech",
    manager: "Kiran Rao (Technical Support Lead)",
    location: "Jaipur",
    employmentType: "Full-time",
    doj: "22 May 2024",
    probationEnd: "22 Aug 2024",
    confirmationDate: "22 Aug 2024",
    ctc: "₹3.8L",
    bankMasked: "XXXXXX3348",
    aadhaarMasked: "XXXX XXXX 9910",
    panMasked: "XXXXX1123N",
    status: "Notice Period",
    account: "Active",
    docs: docs(),
    attendancePct: 84,
    presentDays: 17,
    leaveBalance: 1,
    leavesTaken: 9,
    onLeaveToday: false,
    lastReview: "22 Feb 2026",
    reviewDue: "22 Aug 2026",
    reviewStatus: "Due",
    rating: 3.4,
    trainings: [{ name: "Machine Fault Diagnostics", status: "Not Started" }],
    letters: [
      { id: "LT-71", kind: "Confidential warning", issuedOn: "28 Jul 2026", ack: "Pending", confidential: true },
    ],
    history: [
      { at: "22 May 2024", by: "Anjali Kapoor", text: "Employee record created" },
      { at: "25 Jul 2026", by: "Anjali Kapoor", text: "Status changed: Confirmed → Notice Period" },
    ],
    exitDate: "24 Aug 2026",
    clearance: [
      { item: "Return company tools", done: false },
      { item: "Handover pending service calls", done: true },
      { item: "Deactivate dashboard access", done: false },
      { item: "Final settlement note to Accounts", done: false },
    ],
  },
  {
    empId: "CC-ACC-2024-0033",
    name: "Ritu Singh",
    photo: "RS",
    dob: "11 Jul 1994",
    gender: "Female",
    mobile: "98110 22137",
    personalEmail: "ritu.singh94@gmail.com",
    workEmail: "ritu.singh@cleancraft.in",
    currentAddress: "Rohini Sector 9, New Delhi",
    permanentAddress: "Rohini Sector 9, New Delhi",
    emergencyContact: "Ajay Singh · 98110 22100",
    bloodGroup: "A+",
    designation: "Accounts Executive",
    dept: "Accounts",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "11 Jul 2024",
    probationEnd: "11 Oct 2024",
    confirmationDate: "11 Oct 2024",
    ctc: "₹4.8L",
    bankMasked: "XXXXXX7712",
    aadhaarMasked: "XXXX XXXX 4467",
    panMasked: "XXXXX8834Q",
    status: "Confirmed",
    account: "Active",
    docs: docs(),
    attendancePct: 98,
    presentDays: 22,
    leaveBalance: 10,
    leavesTaken: 2,
    onLeaveToday: false,
    lastReview: "11 Jan 2026",
    reviewDue: "11 Jul 2026",
    reviewStatus: "Completed",
    rating: 4.7,
    trainings: [{ name: "GST Compliance Refresher", status: "Completed" }],
    letters: [
      { id: "LT-72", kind: "Appreciation letter", issuedOn: "26 Jul 2026", ack: "Acknowledged", confidential: false },
    ],
    history: [{ at: "11 Jul 2024", by: "Anjali Kapoor", text: "Employee record created" }],
  },
  {
    empId: "CC-SUP-2026-0061",
    name: "Mohit Kumar",
    photo: "MK",
    dob: "02 Jan 2000",
    gender: "Male",
    mobile: "98110 22142",
    personalEmail: "mohit.k2000@gmail.com",
    workEmail: "mohit.k@cleancraft.in",
    currentAddress: "Uttam Nagar, New Delhi",
    permanentAddress: "Sitapur, Uttar Pradesh",
    emergencyContact: "Radha Devi · 98110 22099",
    bloodGroup: "B+",
    designation: "Packing Staff",
    dept: "Support Staff",
    manager: "Suresh Nair (Administration Manager)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "28 Jul 2026",
    probationEnd: "28 Oct 2026",
    confirmationDate: "—",
    ctc: "₹2.0L",
    bankMasked: "Not submitted",
    aadhaarMasked: "XXXX XXXX 7712",
    panMasked: "Not submitted",
    status: "Onboarding",
    account: "Invited",
    docs: docs(["PAN card", "Bank details", "Education documents", "Signed appointment letter"]),
    attendancePct: 90,
    presentDays: 4,
    leaveBalance: 0,
    leavesTaken: 0,
    onLeaveToday: false,
    lastReview: "—",
    reviewDue: "28 Oct 2026",
    reviewStatus: "Due",
    rating: 0,
    trainings: [{ name: "Packing Standards Induction", status: "In Progress" }],
    letters: [
      { id: "LT-76", kind: "Appointment letter", issuedOn: "—", ack: "Pending", confidential: false },
    ],
    history: [
      { at: "28 Jul 2026", by: "Anjali Kapoor", text: "Converted from candidate CAN-204 — onboarding started" },
      { at: "29 Jul 2026", by: "Anjali Kapoor", text: "Account invitation sent (not yet activated)" },
    ],
    candidateId: "CAN-204",
  },
  {
    empId: "CC-SUP-2024-0040",
    name: "Suman Devi",
    photo: "SD",
    dob: "17 Oct 1988",
    gender: "Female",
    mobile: "98110 22145",
    personalEmail: "suman.devi88@gmail.com",
    workEmail: "suman.devi@cleancraft.in",
    currentAddress: "Nangloi, New Delhi",
    permanentAddress: "Nangloi, New Delhi",
    emergencyContact: "Ram Kumar · 98110 22088",
    bloodGroup: "AB-",
    designation: "Pantry & Cleaning Staff",
    dept: "Support Staff",
    manager: "Suresh Nair (Administration Manager)",
    location: "Delhi HO",
    employmentType: "Full-time",
    doj: "17 Oct 2024",
    probationEnd: "17 Jan 2025",
    confirmationDate: "17 Jan 2025",
    ctc: "₹1.9L",
    bankMasked: "XXXXXX4490",
    aadhaarMasked: "XXXX XXXX 1123",
    panMasked: "XXXXX7745V",
    status: "Confirmed",
    account: "Not Created",
    docs: docs(["Education documents", "Previous salary slips"]),
    attendancePct: 96,
    presentDays: 21,
    leaveBalance: 5,
    leavesTaken: 4,
    onLeaveToday: false,
    lastReview: "17 Jan 2026",
    reviewDue: "17 Jul 2026",
    reviewStatus: "Overdue",
    rating: 4.2,
    trainings: [{ name: "Hygiene & Safety Basics", status: "Completed" }],
    letters: [],
    history: [{ at: "17 Oct 2024", by: "Anjali Kapoor", text: "Employee record created" }],
  },
  {
    empId: "CC-MKT-2023-0007",
    name: "Tarun Bhatia",
    photo: "TB",
    dob: "23 Dec 1992",
    gender: "Male",
    mobile: "98110 22150",
    personalEmail: "tarun.bhatia92@gmail.com",
    workEmail: "tarun.bhatia@cleancraft.in",
    currentAddress: "Paschim Vihar, New Delhi",
    permanentAddress: "Paschim Vihar, New Delhi",
    emergencyContact: "Reena Bhatia · 98110 22077",
    bloodGroup: "O+",
    designation: "Social Media Executive",
    dept: "Marketing",
    manager: "Arjun Mehta (Performance Marketing Executive)",
    location: "Delhi HO",
    employmentType: "Contract",
    doj: "05 Feb 2023",
    probationEnd: "05 May 2023",
    confirmationDate: "05 May 2023",
    ctc: "₹4.4L",
    bankMasked: "XXXXXX9078",
    aadhaarMasked: "XXXX XXXX 6634",
    panMasked: "XXXXX9912B",
    status: "Exited",
    account: "Active",
    docs: docs(),
    attendancePct: 88,
    presentDays: 0,
    leaveBalance: 0,
    leavesTaken: 11,
    onLeaveToday: false,
    lastReview: "05 Feb 2026",
    reviewDue: "—",
    reviewStatus: "Completed",
    rating: 3.9,
    trainings: [],
    letters: [
      { id: "LT-68", kind: "Relieving letter", issuedOn: "15 Jul 2026", ack: "Acknowledged", confidential: false },
    ],
    history: [
      { at: "05 Feb 2023", by: "Anjali Kapoor", text: "Employee record created" },
      { at: "15 Jul 2026", by: "Anjali Kapoor", text: "Status changed: Confirmed → Exited" },
    ],
    exitDate: "15 Jul 2026",
    clearance: [
      { item: "Return laptop and ID card", done: true },
      { item: "Deactivate dashboard access", done: false },
      { item: "Final settlement", done: true },
    ],
  },
];

export const nextEmpId = (dept: Dept, existing: MasterEmployee[]) => {
  const code =
    dept === "Sales"
      ? "SALES"
      : dept === "Projects"
        ? "PROJ"
        : dept === "Training"
          ? "TRAIN"
          : dept === "Marketing"
            ? "MKT"
            : dept === "Tech"
              ? "TECH"
              : dept === "Accounts"
                ? "ACC"
                : dept === "Support Staff"
                  ? "SUP"
                  : "HR";
  const maxSeq = existing.reduce((m, e) => {
    const n = Number(e.empId.split("-").pop());
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `CC-${code}-2026-${String(maxSeq + 1).padStart(4, "0")}`;
};

export const STATUS_TONE: Record<EmpStatus, string> = {
  Onboarding: "active",
  Probation: "pending",
  Confirmed: "done",
  "On Leave": "pending",
  "Notice Period": "urgent",
  Exited: "muted",
};

export const ACCOUNT_TONE: Record<AccountStatus, string> = {
  "Not Created": "pending",
  Invited: "active",
  Active: "done",
  Deactivated: "muted",
};
