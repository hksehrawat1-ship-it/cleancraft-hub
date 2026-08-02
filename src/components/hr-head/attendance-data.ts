export const ATT_STATUSES = [
  "Present",
  "Absent",
  "Late",
  "Half Day",
  "On Leave",
  "Weekly Off",
  "Holiday",
  "Work From Home",
  "On Duty",
  "Attendance Missing",
] as const;
export type AttStatus = (typeof ATT_STATUSES)[number];

export const ATT_TONE: Record<AttStatus, string> = {
  Present: "done",
  Absent: "urgent",
  Late: "pending",
  "Half Day": "pending",
  "On Leave": "active",
  "Weekly Off": "muted",
  Holiday: "muted",
  "Work From Home": "active",
  "On Duty": "active",
  "Attendance Missing": "urgent",
};

export const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Unpaid Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Compensatory Off",
  "Other",
] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STAGES = [
  "Submitted",
  "Manager Review",
  "HR Review",
  "Approved",
  "Rejected",
  "Cancelled",
] as const;
export type LeaveStage = (typeof LEAVE_STAGES)[number];

export const LEAVE_TONE: Record<LeaveStage, string> = {
  Submitted: "active",
  "Manager Review": "pending",
  "HR Review": "pending",
  Approved: "done",
  Rejected: "urgent",
  Cancelled: "muted",
};

export const SHIFTS = ["General 09:30-18:30", "Early 08:00-17:00", "Late 11:00-20:00", "Field 09:00-18:00"] as const;
export type Shift = (typeof SHIFTS)[number];

export const REG_REASONS = [
  "Missed check-in",
  "Missed check-out",
  "Incorrect attendance",
  "Official duty",
  "Approved late arrival",
  "Work from another location",
] as const;
export type RegReason = (typeof REG_REASONS)[number];

export type AuditEntry = { at: string; by: string; text: string };

export type AttRow = {
  empId: string;
  name: string;
  photo: string;
  dept: string;
  designation: string;
  manager: string;
  location: string;
  shift: Shift;
  checkIn: string;
  checkOut: string;
  status: AttStatus;
  hours: string;
  note?: string;
  history: AuditEntry[];
  month: {
    workingDays: number;
    present: number;
    leave: number;
    absent: number;
    late: number;
    halfDays: number;
    hours: number;
  };
  leaveBalance: Record<string, number>;
  lateStreak: number;
};

export const ATTENDANCE_TODAY: AttRow[] = [
  {
    empId: "CC-SALES-2024-0011",
    name: "Rahul Sharma",
    photo: "RS",
    dept: "Sales",
    designation: "Sales Head",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    shift: "General 09:30-18:30",
    checkIn: "09:22",
    checkOut: "18:48",
    status: "Present",
    hours: "9h 26m",
    history: [{ at: "02 Aug 2026 09:22", by: "System", text: "Check-in recorded" }],
    month: { workingDays: 22, present: 21, leave: 1, absent: 0, late: 1, halfDays: 0, hours: 191 },
    leaveBalance: { "Casual Leave": 4, "Sick Leave": 4, "Earned Leave": 9 },
    lateStreak: 0,
  },
  {
    empId: "CC-SALES-2025-0026",
    name: "Priya Verma",
    photo: "PV",
    dept: "Sales",
    designation: "Sales Executive",
    manager: "Rahul Sharma (Sales Head)",
    location: "Delhi HO",
    shift: "General 09:30-18:30",
    checkIn: "—",
    checkOut: "—",
    status: "On Leave",
    hours: "0h",
    note: "Approved Casual Leave",
    history: [{ at: "31 Jul 2026 16:10", by: "Anjali Kapoor (HR Head)", text: "Casual leave approved — attendance auto-updated" }],
    month: { workingDays: 22, present: 18, leave: 3, absent: 0, late: 2, halfDays: 1, hours: 164 },
    leaveBalance: { "Casual Leave": 2, "Sick Leave": 3, "Earned Leave": 6 },
    lateStreak: 1,
  },
  {
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dept: "Projects",
    designation: "Project Manager",
    manager: "Sneha Iyer (Project Coordinator)",
    location: "Delhi HO",
    shift: "General 09:30-18:30",
    checkIn: "10:12",
    checkOut: "19:05",
    status: "Late",
    hours: "8h 53m",
    note: "3rd late arrival this month",
    history: [{ at: "02 Aug 2026 10:12", by: "System", text: "Late check-in recorded" }],
    month: { workingDays: 22, present: 20, leave: 1, absent: 0, late: 3, halfDays: 0, hours: 178 },
    leaveBalance: { "Casual Leave": 1, "Sick Leave": 2, "Earned Leave": 4 },
    lateStreak: 3,
  },
  {
    empId: "CC-PROJ-2024-0031",
    name: "Sneha Iyer",
    photo: "SI",
    dept: "Projects",
    designation: "Project Coordinator",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    shift: "General 09:30-18:30",
    checkIn: "09:18",
    checkOut: "18:36",
    status: "Present",
    hours: "9h 18m",
    history: [],
    month: { workingDays: 22, present: 22, leave: 0, absent: 0, late: 0, halfDays: 0, hours: 198 },
    leaveBalance: { "Casual Leave": 5, "Sick Leave": 4, "Earned Leave": 9 },
    lateStreak: 0,
  },
  {
    empId: "CC-TRAIN-2025-0044",
    name: "Vikas Yadav",
    photo: "VY",
    dept: "Training",
    designation: "Trainer & Launch Executive",
    manager: "Anjali Kapoor (HR Head)",
    location: "Indore",
    shift: "Field 09:00-18:00",
    checkIn: "09:05",
    checkOut: "—",
    status: "On Duty",
    hours: "—",
    note: "Store launch visit — Indore 2",
    history: [{ at: "02 Aug 2026 09:05", by: "System", text: "On-duty check-in from field" }],
    month: { workingDays: 22, present: 19, leave: 2, absent: 1, late: 1, halfDays: 0, hours: 170 },
    leaveBalance: { "Casual Leave": 1, "Sick Leave": 1, "Earned Leave": 2 },
    lateStreak: 1,
  },
  {
    empId: "CC-TRAIN-2024-0022",
    name: "Neha Kulkarni",
    photo: "NK",
    dept: "Training",
    designation: "Relationship Manager",
    manager: "Anjali Kapoor (HR Head)",
    location: "Pune",
    shift: "General 09:30-18:30",
    checkIn: "09:34",
    checkOut: "18:40",
    status: "Work From Home",
    hours: "9h 06m",
    note: "Approved WFH — franchise calls",
    history: [],
    month: { workingDays: 22, present: 21, leave: 1, absent: 0, late: 0, halfDays: 0, hours: 189 },
    leaveBalance: { "Casual Leave": 3, "Sick Leave": 4, "Earned Leave": 7 },
    lateStreak: 0,
  },
  {
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dept: "Marketing",
    designation: "Performance Marketing Executive",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    shift: "Late 11:00-20:00",
    checkIn: "—",
    checkOut: "—",
    status: "Absent",
    hours: "0h",
    note: "No information received from employee",
    history: [{ at: "02 Aug 2026 11:45", by: "System", text: "Marked absent after cut-off (11:30)" }],
    month: { workingDays: 22, present: 19, leave: 2, absent: 1, late: 2, halfDays: 0, hours: 171 },
    leaveBalance: { "Casual Leave": 2, "Sick Leave": 3, "Earned Leave": 5 },
    lateStreak: 2,
  },
  {
    empId: "CC-TECH-2025-0051",
    name: "Kiran Rao",
    photo: "KR",
    dept: "Tech",
    designation: "Technical Support Lead",
    manager: "Anjali Kapoor (HR Head)",
    location: "Bengaluru",
    shift: "Early 08:00-17:00",
    checkIn: "07:56",
    checkOut: "—",
    status: "Attendance Missing",
    hours: "—",
    note: "Check-out not recorded yesterday and today",
    history: [{ at: "01 Aug 2026 23:59", by: "System", text: "Check-out missing — regularisation suggested" }],
    month: { workingDays: 22, present: 20, leave: 1, absent: 0, late: 1, halfDays: 1, hours: 176 },
    leaveBalance: { "Casual Leave": 1, "Sick Leave": 2, "Earned Leave": 3 },
    lateStreak: 0,
  },
  {
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dept: "Tech",
    designation: "Field Engineer",
    manager: "Kiran Rao (Technical Support Lead)",
    location: "Jaipur",
    shift: "Field 09:00-18:00",
    checkIn: "09:02",
    checkOut: "13:30",
    status: "Half Day",
    hours: "4h 28m",
    note: "Half day approved by manager",
    history: [],
    month: { workingDays: 22, present: 17, leave: 2, absent: 2, late: 3, halfDays: 2, hours: 148 },
    leaveBalance: { "Casual Leave": 0, "Sick Leave": 1, "Earned Leave": 1 },
    lateStreak: 3,
  },
  {
    empId: "CC-ACC-2024-0033",
    name: "Ritu Singh",
    photo: "RS",
    dept: "Accounts",
    designation: "Accounts Executive",
    manager: "Anjali Kapoor (HR Head)",
    location: "Delhi HO",
    shift: "General 09:30-18:30",
    checkIn: "09:12",
    checkOut: "18:44",
    status: "Present",
    hours: "9h 32m",
    history: [],
    month: { workingDays: 22, present: 22, leave: 0, absent: 0, late: 0, halfDays: 0, hours: 202 },
    leaveBalance: { "Casual Leave": 5, "Sick Leave": 5, "Earned Leave": 10 },
    lateStreak: 0,
  },
  {
    empId: "CC-SUP-2024-0040",
    name: "Suman Devi",
    photo: "SD",
    dept: "Support Staff",
    designation: "Pantry & Cleaning Staff",
    manager: "Suresh Nair (Administration Manager)",
    location: "Delhi HO",
    shift: "Early 08:00-17:00",
    checkIn: "07:52",
    checkOut: "17:04",
    status: "Present",
    hours: "9h 12m",
    history: [],
    month: { workingDays: 22, present: 21, leave: 1, absent: 0, late: 0, halfDays: 0, hours: 193 },
    leaveBalance: { "Casual Leave": 3, "Sick Leave": 2, "Earned Leave": 5 },
    lateStreak: 0,
  },
  {
    empId: "CC-SUP-2026-0061",
    name: "Mohit Kumar",
    photo: "MK",
    dept: "Support Staff",
    designation: "Packing Staff",
    manager: "Suresh Nair (Administration Manager)",
    location: "Delhi HO",
    shift: "General 09:30-18:30",
    checkIn: "09:26",
    checkOut: "18:32",
    status: "Present",
    hours: "9h 06m",
    history: [],
    month: { workingDays: 5, present: 5, leave: 0, absent: 0, late: 0, halfDays: 0, hours: 45 },
    leaveBalance: { "Casual Leave": 0, "Sick Leave": 0, "Earned Leave": 0 },
    lateStreak: 0,
  },
];

export type LeaveRequest = {
  id: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  manager: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  confidential: boolean;
  balance: number;
  managerNote: string;
  managerRecommendation: "Recommended" | "Not Recommended" | "Awaiting";
  stage: LeaveStage;
  submittedOn: string;
  overlapWith?: string;
  history: AuditEntry[];
};

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "LR-3001",
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dept: "Projects",
    manager: "Sneha Iyer (Project Coordinator)",
    type: "Earned Leave",
    from: "10 Aug 2026",
    to: "13 Aug 2026",
    days: 4,
    reason: "Family function out of station",
    confidential: false,
    balance: 4,
    managerNote: "Site work covered by Devansh for these days.",
    managerRecommendation: "Recommended",
    stage: "HR Review",
    submittedOn: "29 Jul 2026",
    overlapWith: "Devansh Rathore (10–11 Aug)",
    history: [
      { at: "29 Jul 2026 10:20", by: "Aman Gupta", text: "Leave request submitted" },
      { at: "30 Jul 2026 09:40", by: "Sneha Iyer", text: "Manager recommended approval" },
    ],
  },
  {
    id: "LR-3002",
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dept: "Tech",
    manager: "Kiran Rao (Technical Support Lead)",
    type: "Sick Leave",
    from: "04 Aug 2026",
    to: "05 Aug 2026",
    days: 2,
    reason: "Medical rest advised (medical certificate attached)",
    confidential: true,
    balance: 1,
    managerNote: "Pending service calls to be reassigned.",
    managerRecommendation: "Recommended",
    stage: "HR Review",
    submittedOn: "01 Aug 2026",
    history: [
      { at: "01 Aug 2026 18:05", by: "Sanjay Patil", text: "Leave request submitted with medical document" },
      { at: "02 Aug 2026 09:10", by: "Kiran Rao", text: "Manager recommended approval" },
    ],
  },
  {
    id: "LR-3003",
    empId: "CC-SALES-2025-0026",
    name: "Priya Verma",
    photo: "PV",
    dept: "Sales",
    manager: "Rahul Sharma (Sales Head)",
    type: "Casual Leave",
    from: "18 Aug 2026",
    to: "18 Aug 2026",
    days: 1,
    reason: "Personal work",
    confidential: false,
    balance: 2,
    managerNote: "",
    managerRecommendation: "Awaiting",
    stage: "Manager Review",
    submittedOn: "01 Aug 2026",
    history: [{ at: "01 Aug 2026 12:30", by: "Priya Verma", text: "Leave request submitted" }],
  },
  {
    id: "LR-3004",
    empId: "CC-TRAIN-2025-0044",
    name: "Vikas Yadav",
    photo: "VY",
    dept: "Training",
    manager: "Anjali Kapoor (HR Head)",
    type: "Unpaid Leave",
    from: "20 Aug 2026",
    to: "26 Aug 2026",
    days: 7,
    reason: "Extended personal travel",
    confidential: false,
    balance: 0,
    managerNote: "Two store launches fall in this window.",
    managerRecommendation: "Not Recommended",
    stage: "HR Review",
    submittedOn: "30 Jul 2026",
    history: [
      { at: "30 Jul 2026 15:00", by: "Vikas Yadav", text: "Leave request submitted" },
      { at: "31 Jul 2026 11:20", by: "Anjali Kapoor", text: "Manager flagged launch conflict" },
    ],
  },
  {
    id: "LR-3005",
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dept: "Marketing",
    manager: "Anjali Kapoor (HR Head)",
    type: "Paternity Leave",
    from: "01 Sep 2026",
    to: "10 Sep 2026",
    days: 10,
    reason: "Paternity leave as per policy",
    confidential: true,
    balance: 10,
    managerNote: "Campaign handover plan shared.",
    managerRecommendation: "Recommended",
    stage: "Submitted",
    submittedOn: "02 Aug 2026",
    history: [{ at: "02 Aug 2026 08:45", by: "Arjun Mehta", text: "Leave request submitted" }],
  },
  {
    id: "LR-2990",
    empId: "CC-ACC-2024-0033",
    name: "Ritu Singh",
    photo: "RS",
    dept: "Accounts",
    manager: "Anjali Kapoor (HR Head)",
    type: "Compensatory Off",
    from: "22 Jul 2026",
    to: "22 Jul 2026",
    days: 1,
    reason: "Comp off for month-end closing weekend work",
    confidential: false,
    balance: 2,
    managerNote: "Worked both weekend days.",
    managerRecommendation: "Recommended",
    stage: "Approved",
    submittedOn: "18 Jul 2026",
    history: [
      { at: "18 Jul 2026 10:00", by: "Ritu Singh", text: "Request submitted" },
      { at: "19 Jul 2026 11:00", by: "Anjali Kapoor (HR Head)", text: "Approved — attendance updated to Comp Off" },
    ],
  },
];

export type Regularisation = {
  id: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  manager: string;
  date: string;
  correction: RegReason;
  requested: string;
  reason: string;
  document?: string;
  managerResponse: "Supported" | "Not Supported" | "Awaiting";
  decision: "Pending" | "Approved" | "Rejected";
  ageDays: number;
  afterPayrollCutoff: boolean;
  history: AuditEntry[];
};

export const REGULARISATIONS: Regularisation[] = [
  {
    id: "RG-501",
    empId: "CC-TECH-2025-0051",
    name: "Kiran Rao",
    photo: "KR",
    dept: "Tech",
    manager: "Anjali Kapoor (HR Head)",
    date: "01 Aug 2026",
    correction: "Missed check-out",
    requested: "Check-out 17:10",
    reason: "Left from a customer call, forgot to mark check-out.",
    managerResponse: "Supported",
    decision: "Pending",
    ageDays: 1,
    afterPayrollCutoff: false,
    history: [{ at: "01 Aug 2026 21:10", by: "Kiran Rao", text: "Regularisation requested" }],
  },
  {
    id: "RG-502",
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dept: "Projects",
    manager: "Sneha Iyer (Project Coordinator)",
    date: "24 Jul 2026",
    correction: "Approved late arrival",
    requested: "Late arrival waived",
    reason: "Municipal site inspection at 8 AM before office.",
    document: "site_inspection_note.pdf",
    managerResponse: "Supported",
    decision: "Pending",
    ageDays: 9,
    afterPayrollCutoff: true,
    history: [
      { at: "24 Jul 2026 19:20", by: "Aman Gupta", text: "Regularisation requested with supporting note" },
      { at: "25 Jul 2026 10:05", by: "Sneha Iyer", text: "Manager supported the request" },
    ],
  },
  {
    id: "RG-503",
    empId: "CC-TRAIN-2024-0022",
    name: "Neha Kulkarni",
    photo: "NK",
    dept: "Training",
    manager: "Anjali Kapoor (HR Head)",
    date: "30 Jul 2026",
    correction: "Work from another location",
    requested: "Mark as Work From Home",
    reason: "Franchise calls handled from Pune residence with approval.",
    managerResponse: "Awaiting",
    decision: "Pending",
    ageDays: 3,
    afterPayrollCutoff: false,
    history: [{ at: "30 Jul 2026 20:00", by: "Neha Kulkarni", text: "Regularisation requested" }],
  },
  {
    id: "RG-498",
    empId: "CC-SUP-2024-0040",
    name: "Suman Devi",
    photo: "SD",
    dept: "Support Staff",
    manager: "Suresh Nair (Administration Manager)",
    date: "16 Jul 2026",
    correction: "Missed check-in",
    requested: "Check-in 07:50",
    reason: "Biometric device was not working that morning.",
    managerResponse: "Supported",
    decision: "Approved",
    ageDays: 17,
    afterPayrollCutoff: true,
    history: [
      { at: "16 Jul 2026 12:00", by: "Suman Devi", text: "Regularisation requested" },
      { at: "17 Jul 2026 09:30", by: "Anjali Kapoor (HR Head)", text: "Approved — original record preserved, correction added" },
    ],
  },
];

export const HOLIDAYS = [
  { date: "15 Aug 2026", name: "Independence Day", type: "National Holiday" },
  { date: "26 Aug 2026", name: "Raksha Bandhan", type: "Festival Holiday" },
  { date: "04 Sep 2026", name: "Janmashtami", type: "Festival Holiday" },
  { date: "02 Oct 2026", name: "Gandhi Jayanti", type: "National Holiday" },
  { date: "20 Oct 2026", name: "Dussehra", type: "Festival Holiday" },
  { date: "08 Nov 2026", name: "Diwali", type: "Festival Holiday" },
  { date: "25 Dec 2026", name: "Christmas", type: "Festival Holiday" },
];

export const WEEKLY_OFF_NOTE = "Sunday is weekly off for all departments. Support Staff rotate a second off day.";
export const CUTOFF_NOTE = "Absent is marked only after the 11:30 AM cut-off. Weekly offs and holidays never count as absences.";
export const PAYROLL_CUTOFF = "25 Jul 2026";
