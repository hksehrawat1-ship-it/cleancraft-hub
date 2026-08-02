export type AuditEntry = { at: string; by: string; text: string };

export const REVIEW_STAGES = [
  "Review Created",
  "Employee Self-Review",
  "Manager Review",
  "HR Review",
  "Feedback Shared",
  "Employee Acknowledged",
  "Completed",
] as const;
export type ReviewStage = (typeof REVIEW_STAGES)[number];

export const STAGE_TONE: Record<ReviewStage, string> = {
  "Review Created": "muted",
  "Employee Self-Review": "active",
  "Manager Review": "pending",
  "HR Review": "pending",
  "Feedback Shared": "active",
  "Employee Acknowledged": "done",
  Completed: "done",
};

export const PERF_AREAS = [
  "Work quality",
  "Task completion",
  "Punctuality",
  "Responsibility",
  "Customer service",
  "Teamwork",
  "Communication",
  "Process compliance",
  "Learning and improvement",
  "Role-specific goals",
] as const;
export type PerfArea = (typeof PERF_AREAS)[number];

export const RATINGS = ["Exceeds Expectations", "Meets Expectations", "Needs Improvement", "Unsatisfactory"] as const;
export type Rating = (typeof RATINGS)[number];

export const RATING_TONE: Record<Rating, string> = {
  "Exceeds Expectations": "done",
  "Meets Expectations": "active",
  "Needs Improvement": "pending",
  Unsatisfactory: "urgent",
};

export const isNegative = (r: Rating) => r === "Needs Improvement" || r === "Unsatisfactory";

export type AreaScore = { area: PerfArea; rating: Rating | ""; evidence: string };

export type Review = {
  id: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  designation: string;
  manager: string;
  period: string;
  stage: ReviewStage;
  dueDate: string;
  overdue: boolean;
  overall: Rating | "Pending";
  locked: boolean;
  version: number;
  acknowledgement: "Pending" | "Acknowledged" | "Refused" | "Not Required";
  managerComments: string;
  hrComments: string;
  areas: AreaScore[];
  history: AuditEntry[];
};

const areas = (list: Array<[PerfArea, Rating | "", string]>): AreaScore[] =>
  PERF_AREAS.map((a) => {
    const found = list.find((l) => l[0] === a);
    return { area: a, rating: found ? found[1] : "", evidence: found ? found[2] : "" };
  });

export const REVIEWS: Review[] = [
  {
    id: "PR-7001",
    empId: "CC-SALES-2025-0026",
    name: "Priya Verma",
    photo: "PV",
    dept: "Sales",
    designation: "Sales Executive",
    manager: "Rahul Sharma (Sales Head)",
    period: "Jan 2026 – Jun 2026",
    stage: "HR Review",
    dueDate: "05 Aug 2026",
    overdue: false,
    overall: "Meets Expectations",
    locked: false,
    version: 1,
    acknowledgement: "Pending",
    managerComments: "Consistent lead follow-up. Needs sharper closing on high-value franchise leads.",
    hrComments: "",
    areas: areas([
      ["Work quality", "Meets Expectations", ""],
      ["Task completion", "Exceeds Expectations", ""],
      ["Punctuality", "Needs Improvement", "3 late arrivals recorded in July; discussed on 28 Jul."],
      ["Responsibility", "Meets Expectations", ""],
      ["Customer service", "Exceeds Expectations", ""],
      ["Teamwork", "Meets Expectations", ""],
      ["Communication", "Meets Expectations", ""],
      ["Process compliance", "Meets Expectations", ""],
      ["Learning and improvement", "Meets Expectations", ""],
      ["Role-specific goals", "Meets Expectations", ""],
    ]),
    history: [
      { at: "10 Jul 2026 10:00", by: "Anjali Kapoor (HR Head)", text: "Review created for Jan–Jun 2026 cycle" },
      { at: "18 Jul 2026 12:20", by: "Priya Verma", text: "Self-review submitted" },
      { at: "26 Jul 2026 15:40", by: "Rahul Sharma (Sales Head)", text: "Manager review submitted" },
    ],
  },
  {
    id: "PR-7002",
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dept: "Projects",
    designation: "Project Manager",
    manager: "Sneha Iyer (Project Coordinator)",
    period: "Jan 2026 – Jun 2026",
    stage: "Manager Review",
    dueDate: "26 Jul 2026",
    overdue: true,
    overall: "Pending",
    locked: false,
    version: 1,
    acknowledgement: "Pending",
    managerComments: "",
    hrComments: "",
    areas: areas([
      ["Work quality", "Meets Expectations", ""],
      ["Task completion", "Needs Improvement", ""],
      ["Punctuality", "Needs Improvement", ""],
    ]),
    history: [
      { at: "08 Jul 2026 09:30", by: "Anjali Kapoor (HR Head)", text: "Review created" },
      { at: "15 Jul 2026 18:00", by: "Aman Gupta", text: "Self-review submitted" },
    ],
  },
  {
    id: "PR-7003",
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dept: "Tech",
    designation: "Field Engineer",
    manager: "Kiran Rao (Technical Support Lead)",
    period: "Jan 2026 – Jun 2026",
    stage: "Feedback Shared",
    dueDate: "01 Aug 2026",
    overdue: false,
    overall: "Needs Improvement",
    locked: false,
    version: 2,
    acknowledgement: "Pending",
    managerComments: "Service visit closure quality inconsistent; two repeat complaints from Jaipur stores.",
    hrComments: "Improvement plan recommended with machine-handling training.",
    areas: areas([
      ["Work quality", "Needs Improvement", "Two repeat complaints (Jaipur 1, Jaipur 3) in June."],
      ["Task completion", "Needs Improvement", "4 visit reports submitted after 48-hour window."],
      ["Punctuality", "Meets Expectations", ""],
      ["Responsibility", "Needs Improvement", "Two escalations reached HR before status update."],
      ["Customer service", "Meets Expectations", ""],
      ["Teamwork", "Meets Expectations", ""],
      ["Communication", "Needs Improvement", "Store owners reported delayed updates."],
      ["Process compliance", "Unsatisfactory", "Checklist skipped on 3 visits — verified from work reports."],
      ["Learning and improvement", "Meets Expectations", ""],
      ["Role-specific goals", "Needs Improvement", "Only 6 of 10 planned preventive visits closed."],
    ]),
    history: [
      { at: "05 Jul 2026 11:00", by: "Anjali Kapoor (HR Head)", text: "Review created" },
      { at: "20 Jul 2026 17:00", by: "Kiran Rao", text: "Manager review submitted" },
      { at: "28 Jul 2026 10:15", by: "Anjali Kapoor (HR Head)", text: "Correction — new version 2 created, original preserved" },
      { at: "29 Jul 2026 09:00", by: "Anjali Kapoor (HR Head)", text: "Feedback shared with employee; acknowledgement requested" },
    ],
  },
  {
    id: "PR-7004",
    empId: "CC-TRAIN-2024-0022",
    name: "Neha Kulkarni",
    photo: "NK",
    dept: "Training",
    designation: "Relationship Manager",
    manager: "Anjali Kapoor (HR Head)",
    period: "Jan 2026 – Jun 2026",
    stage: "Completed",
    dueDate: "20 Jul 2026",
    overdue: false,
    overall: "Exceeds Expectations",
    locked: true,
    version: 1,
    acknowledgement: "Acknowledged",
    managerComments: "Best complaint-resolution time in the RM team; strong owner relationships.",
    hrComments: "Considered for senior RM track in next cycle.",
    areas: areas([
      ["Work quality", "Exceeds Expectations", ""],
      ["Task completion", "Exceeds Expectations", ""],
      ["Punctuality", "Meets Expectations", ""],
      ["Responsibility", "Exceeds Expectations", ""],
      ["Customer service", "Exceeds Expectations", ""],
      ["Teamwork", "Meets Expectations", ""],
      ["Communication", "Exceeds Expectations", ""],
      ["Process compliance", "Meets Expectations", ""],
      ["Learning and improvement", "Exceeds Expectations", ""],
      ["Role-specific goals", "Exceeds Expectations", ""],
    ]),
    history: [
      { at: "02 Jul 2026 10:00", by: "Anjali Kapoor (HR Head)", text: "Review created" },
      { at: "14 Jul 2026 16:00", by: "Anjali Kapoor (HR Head)", text: "Feedback shared" },
      { at: "16 Jul 2026 09:20", by: "Neha Kulkarni", text: "Employee acknowledged the review" },
      { at: "16 Jul 2026 09:25", by: "Anjali Kapoor (HR Head)", text: "Review completed and locked" },
    ],
  },
  {
    id: "PR-7005",
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dept: "Marketing",
    designation: "Performance Marketing Executive",
    manager: "Anjali Kapoor (HR Head)",
    period: "Jan 2026 – Jun 2026",
    stage: "Employee Self-Review",
    dueDate: "12 Aug 2026",
    overdue: false,
    overall: "Pending",
    locked: false,
    version: 1,
    acknowledgement: "Pending",
    managerComments: "",
    hrComments: "",
    areas: areas([]),
    history: [{ at: "25 Jul 2026 14:00", by: "Anjali Kapoor (HR Head)", text: "Review created" }],
  },
  {
    id: "PR-7006",
    empId: "CC-SUP-2024-0040",
    name: "Suman Devi",
    photo: "SD",
    dept: "Support Staff",
    designation: "Pantry & Cleaning Staff",
    manager: "Suresh Nair (Administration Manager)",
    period: "Jan 2026 – Jun 2026",
    stage: "Employee Acknowledged",
    dueDate: "22 Jul 2026",
    overdue: false,
    overall: "Meets Expectations",
    locked: false,
    version: 1,
    acknowledgement: "Acknowledged",
    managerComments: "Dependable and punctual. Task photos always submitted on time.",
    hrComments: "Recommend hygiene refresher training.",
    areas: areas([
      ["Work quality", "Meets Expectations", ""],
      ["Task completion", "Exceeds Expectations", ""],
      ["Punctuality", "Exceeds Expectations", ""],
      ["Responsibility", "Meets Expectations", ""],
      ["Customer service", "Meets Expectations", ""],
      ["Teamwork", "Meets Expectations", ""],
      ["Communication", "Meets Expectations", ""],
      ["Process compliance", "Meets Expectations", ""],
      ["Learning and improvement", "Meets Expectations", ""],
      ["Role-specific goals", "Meets Expectations", ""],
    ]),
    history: [
      { at: "04 Jul 2026 10:00", by: "Anjali Kapoor (HR Head)", text: "Review created" },
      { at: "18 Jul 2026 12:00", by: "Suresh Nair", text: "Manager review submitted" },
      { at: "21 Jul 2026 09:00", by: "Suman Devi", text: "Employee acknowledged (read out in Hindi by manager)" },
    ],
  },
];

export const GOAL_STATUSES = ["Not Started", "In Progress", "Completed", "Delayed", "Cancelled"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];
export const GOAL_TONE: Record<GoalStatus, string> = {
  "Not Started": "muted",
  "In Progress": "active",
  Completed: "done",
  Delayed: "urgent",
  Cancelled: "muted",
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  assignedBy: string;
  start: string;
  due: string;
  measure: string;
  progress: number;
  status: GoalStatus;
  managerComments: string;
  overdue: boolean;
  history: AuditEntry[];
};

export const GOALS: Goal[] = [
  {
    id: "GL-401",
    title: "Close 6 franchise bookings in Q3",
    description: "Convert qualified leads into signed franchise bookings across North region.",
    empId: "CC-SALES-2025-0026",
    name: "Priya Verma",
    photo: "PV",
    dept: "Sales",
    assignedBy: "Rahul Sharma (Sales Head)",
    start: "01 Jul 2026",
    due: "30 Sep 2026",
    measure: "6 bookings with engagement letter fee received",
    progress: 50,
    status: "In Progress",
    managerComments: "3 bookings closed. Two proposals in final meeting stage.",
    overdue: false,
    history: [{ at: "01 Jul 2026 09:00", by: "Rahul Sharma (Sales Head)", text: "Goal assigned" }],
  },
  {
    id: "GL-402",
    title: "Open Pune 2 store within 60 days",
    description: "Complete site approval, infra work, machine installation and handover.",
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dept: "Projects",
    assignedBy: "Sneha Iyer (Project Coordinator)",
    start: "01 Jun 2026",
    due: "31 Jul 2026",
    measure: "Store opened with all opening essentials verified",
    progress: 78,
    status: "Delayed",
    managerComments: "Civil work delayed by landlord approval. New target 12 Aug.",
    overdue: true,
    history: [
      { at: "01 Jun 2026 10:00", by: "Sneha Iyer", text: "Goal assigned" },
      { at: "28 Jul 2026 17:30", by: "Sneha Iyer", text: "Marked delayed — landlord approval pending" },
    ],
  },
  {
    id: "GL-403",
    title: "Reduce complaint resolution time to under 2 days",
    description: "Improve first-response and closure time for assigned stores.",
    empId: "CC-TRAIN-2024-0022",
    name: "Neha Kulkarni",
    photo: "NK",
    dept: "Training",
    assignedBy: "Anjali Kapoor (HR Head)",
    start: "01 Apr 2026",
    due: "30 Jun 2026",
    measure: "Average resolution time below 2.0 days for 3 consecutive months",
    progress: 100,
    status: "Completed",
    managerComments: "Achieved 1.8 days average. Excellent result.",
    overdue: false,
    history: [
      { at: "01 Apr 2026 09:00", by: "Anjali Kapoor (HR Head)", text: "Goal assigned" },
      { at: "02 Jul 2026 11:00", by: "Anjali Kapoor (HR Head)", text: "Goal completed and verified" },
    ],
  },
  {
    id: "GL-404",
    title: "Close 90% service visits within SLA",
    description: "Field service visits closed within agreed SLA with complete work reports.",
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dept: "Tech",
    assignedBy: "Kiran Rao (Technical Support Lead)",
    start: "01 Jul 2026",
    due: "30 Sep 2026",
    measure: "90% SLA compliance with checklist completed",
    progress: 35,
    status: "In Progress",
    managerComments: "Currently at 68%. Part of active improvement plan.",
    overdue: false,
    history: [{ at: "01 Jul 2026 10:00", by: "Kiran Rao", text: "Goal assigned" }],
  },
  {
    id: "GL-405",
    title: "GMB listings live for all 22 stores",
    description: "Create and verify Google Business profiles with photos and hours.",
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dept: "Marketing",
    assignedBy: "Anjali Kapoor (HR Head)",
    start: "01 May 2026",
    due: "31 Jul 2026",
    measure: "22 of 22 verified listings with 4.5+ rating",
    progress: 90,
    status: "Delayed",
    managerComments: "20 verified. 2 pending owner document upload.",
    overdue: true,
    history: [{ at: "01 May 2026 09:00", by: "Anjali Kapoor (HR Head)", text: "Goal assigned" }],
  },
  {
    id: "GL-406",
    title: "Complete pantry hygiene checklist daily",
    description: "Follow daily hygiene checklist with photo proof for every shift.",
    empId: "CC-SUP-2024-0040",
    name: "Suman Devi",
    photo: "SD",
    dept: "Support Staff",
    assignedBy: "Suresh Nair (Administration Manager)",
    start: "01 Jul 2026",
    due: "30 Sep 2026",
    measure: "95% daily checklist completion with photos",
    progress: 20,
    status: "Not Started",
    managerComments: "Explained in Hindi during morning briefing.",
    overdue: false,
    history: [{ at: "01 Jul 2026 08:30", by: "Suresh Nair", text: "Goal assigned" }],
  },
];

export const PIP_STATUSES = ["Draft", "Active", "Review Due", "Improved", "Extended", "Closed"] as const;
export type PipStatus = (typeof PIP_STATUSES)[number];
export const PIP_TONE: Record<PipStatus, string> = {
  Draft: "muted",
  Active: "active",
  "Review Due": "pending",
  Improved: "done",
  Extended: "pending",
  Closed: "muted",
};

export type Pip = {
  id: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  designation: string;
  manager: string;
  reason: string;
  concerns: string[];
  evidence: string[];
  improvements: string[];
  targets: string[];
  trainingRequired: string[];
  start: string;
  reviewDates: string[];
  finalReview: string;
  status: PipStatus;
  acknowledgement: "Pending" | "Acknowledged" | "Refused";
  outcome: string;
  reviewDueNow: boolean;
  repeatConcern: boolean;
  history: AuditEntry[];
};

export const PIPS: Pip[] = [
  {
    id: "PIP-201",
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dept: "Tech",
    designation: "Field Engineer",
    manager: "Kiran Rao (Technical Support Lead)",
    reason: "Service quality and process compliance below expected standard for two consecutive quarters.",
    concerns: [
      "Visit checklist skipped on 3 service visits",
      "Work reports submitted after 48-hour window (4 instances)",
      "Two repeat complaints from Jaipur stores",
    ],
    evidence: [
      "Work report timestamps — June & July 2026",
      "Complaint tickets CC-JP-1187, CC-JP-1203",
      "Manager review notes dated 20 Jul 2026",
    ],
    improvements: [
      "Complete the full visit checklist on every service call",
      "Submit work reports on the same day as the visit",
      "Update store owner within 2 hours of visit closure",
    ],
    targets: ["90% SLA compliance", "Zero skipped checklists", "No repeat complaint on the same machine within 30 days"],
    trainingRequired: ["Machine Handling & Preventive Maintenance", "Customer Communication Basics"],
    start: "01 Aug 2026",
    reviewDates: ["15 Aug 2026", "31 Aug 2026"],
    finalReview: "15 Sep 2026",
    status: "Active",
    acknowledgement: "Acknowledged",
    outcome: "",
    reviewDueNow: false,
    repeatConcern: true,
    history: [
      { at: "29 Jul 2026 11:00", by: "Anjali Kapoor (HR Head)", text: "Improvement plan drafted with evidence attached" },
      { at: "31 Jul 2026 10:30", by: "Sanjay Patil", text: "Employee acknowledged the improvement plan" },
      { at: "01 Aug 2026 09:00", by: "Anjali Kapoor (HR Head)", text: "Plan activated" },
    ],
  },
  {
    id: "PIP-202",
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dept: "Projects",
    designation: "Project Manager",
    manager: "Sneha Iyer (Project Coordinator)",
    reason: "Repeated project timeline slippage and late attendance affecting site coordination.",
    concerns: ["Two store openings delayed beyond agreed date", "3 late arrivals in July", "Project summary submitted after 24-hour window"],
    evidence: ["Project tracker — Pune 2, Mathura", "Attendance record July 2026", "Summary submission log"],
    improvements: ["Publish weekly site plan every Monday", "Escalate blockers within 24 hours", "Submit project summary within 24 hours of completion"],
    targets: ["Zero unreported delays", "Weekly plan submitted 4/4 weeks", "Punctuality above 95%"],
    trainingRequired: ["Project Timeline & Vendor Coordination"],
    start: "20 Jul 2026",
    reviewDates: ["03 Aug 2026", "17 Aug 2026"],
    finalReview: "31 Aug 2026",
    status: "Review Due",
    acknowledgement: "Refused",
    outcome: "",
    reviewDueNow: true,
    repeatConcern: true,
    history: [
      { at: "18 Jul 2026 15:00", by: "Anjali Kapoor (HR Head)", text: "Improvement plan created" },
      { at: "19 Jul 2026 10:00", by: "Aman Gupta", text: "Employee declined to acknowledge — recorded, process continues" },
      { at: "20 Jul 2026 09:00", by: "Anjali Kapoor (HR Head)", text: "Plan activated" },
    ],
  },
  {
    id: "PIP-198",
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dept: "Marketing",
    designation: "Performance Marketing Executive",
    manager: "Anjali Kapoor (HR Head)",
    reason: "Campaign reporting gaps in Q1 2026.",
    concerns: ["Weekly campaign report missed 3 times"],
    evidence: ["Report submission log Q1 2026"],
    improvements: ["Submit weekly campaign report every Friday"],
    targets: ["12/12 weekly reports submitted"],
    trainingRequired: ["Campaign Reporting Standards"],
    start: "01 Apr 2026",
    reviewDates: ["15 Apr 2026", "15 May 2026"],
    finalReview: "15 Jun 2026",
    status: "Improved",
    acknowledgement: "Acknowledged",
    outcome: "Improved — 12/12 reports submitted. Plan closed with positive outcome.",
    reviewDueNow: false,
    repeatConcern: false,
    history: [
      { at: "01 Apr 2026 10:00", by: "Anjali Kapoor (HR Head)", text: "Plan created and acknowledged" },
      { at: "16 Jun 2026 11:00", by: "Anjali Kapoor (HR Head)", text: "Final review — improvement confirmed, plan closed" },
    ],
  },
];

export const TRAINING_STATUSES = ["Assigned", "Not Started", "In Progress", "Completed", "Overdue", "Failed", "Reassigned"] as const;
export type TrainingStatus = (typeof TRAINING_STATUSES)[number];
export const TRAINING_TONE: Record<TrainingStatus, string> = {
  Assigned: "active",
  "Not Started": "muted",
  "In Progress": "active",
  Completed: "done",
  Overdue: "urgent",
  Failed: "urgent",
  Reassigned: "pending",
};

export type Training = {
  id: string;
  title: string;
  description: string;
  audience: string;
  mandatory: boolean;
  material: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  assignedBy: string;
  assignedOn: string;
  due: string;
  progress: number;
  status: TrainingStatus;
  assessment: string;
  history: AuditEntry[];
};

export const TRAININGS: Training[] = [
  {
    id: "TR-901",
    title: "Machine Handling & Preventive Maintenance",
    description: "Correct handling, servicing checklist and preventive maintenance for all Clean Craft machines.",
    audience: "Employee — Field Engineer",
    mandatory: true,
    material: "machine_handling_v3.pdf",
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dept: "Tech",
    assignedBy: "Anjali Kapoor (HR Head)",
    assignedOn: "01 Aug 2026",
    due: "20 Aug 2026",
    progress: 30,
    status: "In Progress",
    assessment: "Not attempted",
    history: [{ at: "01 Aug 2026 09:10", by: "Anjali Kapoor (HR Head)", text: "Training assigned as part of improvement plan" }],
  },
  {
    id: "TR-902",
    title: "Franchise Sales Process & Objection Handling",
    description: "Stage-wise franchise sales process, scripts and objection handling.",
    audience: "Department — Sales",
    mandatory: true,
    material: "sales_process_v5.pdf",
    empId: "CC-SALES-2025-0026",
    name: "Priya Verma",
    photo: "PV",
    dept: "Sales",
    assignedBy: "Rahul Sharma (Sales Head)",
    assignedOn: "10 Jul 2026",
    due: "25 Jul 2026",
    progress: 60,
    status: "Overdue",
    assessment: "Not attempted",
    history: [
      { at: "10 Jul 2026 10:00", by: "Rahul Sharma (Sales Head)", text: "Training assigned" },
      { at: "26 Jul 2026 00:05", by: "System", text: "Marked overdue — due date passed" },
    ],
  },
  {
    id: "TR-903",
    title: "Workplace Conduct & POSH Awareness",
    description: "Mandatory conduct, respect at workplace and POSH awareness module.",
    audience: "All employees",
    mandatory: true,
    material: "conduct_posh_2026.pdf",
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dept: "Marketing",
    assignedBy: "Anjali Kapoor (HR Head)",
    assignedOn: "01 Jul 2026",
    due: "31 Jul 2026",
    progress: 0,
    status: "Overdue",
    assessment: "Not attempted",
    history: [{ at: "01 Jul 2026 09:00", by: "Anjali Kapoor (HR Head)", text: "Mandatory training assigned" }],
  },
  {
    id: "TR-904",
    title: "Store Launch Training Standard",
    description: "Owner, manpower, machine, POS and customer handling training standard for new stores.",
    audience: "Department — Training",
    mandatory: false,
    material: "launch_training_v2.pdf",
    empId: "CC-TRAIN-2025-0044",
    name: "Vikas Yadav",
    photo: "VY",
    dept: "Training",
    assignedBy: "Anjali Kapoor (HR Head)",
    assignedOn: "05 Jul 2026",
    due: "05 Aug 2026",
    progress: 85,
    status: "In Progress",
    assessment: "Not attempted",
    history: [{ at: "05 Jul 2026 11:00", by: "Anjali Kapoor (HR Head)", text: "Training assigned" }],
  },
  {
    id: "TR-905",
    title: "Hygiene & Safety Basics (Hindi)",
    description: "Pantry and cleaning hygiene, chemical safety and safe handling — Hindi module.",
    audience: "Department — Support Staff",
    mandatory: true,
    material: "hygiene_safety_hindi.pdf",
    empId: "CC-SUP-2024-0040",
    name: "Suman Devi",
    photo: "SD",
    dept: "Support Staff",
    assignedBy: "Suresh Nair (Administration Manager)",
    assignedOn: "12 Jul 2026",
    due: "31 Jul 2026",
    progress: 100,
    status: "Completed",
    assessment: "Passed — 18/20",
    history: [
      { at: "12 Jul 2026 09:00", by: "Suresh Nair", text: "Training assigned" },
      { at: "28 Jul 2026 16:00", by: "Anjali Kapoor (HR Head)", text: "Completed — assessment recorded, employee profile updated" },
    ],
  },
  {
    id: "TR-906",
    title: "Remote Troubleshooting Safety Gate",
    description: "Mandatory safety steps before advising any customer-side machine action.",
    audience: "Employee — Technical Support",
    mandatory: true,
    material: "remote_safety_v1.pdf",
    empId: "CC-TECH-2025-0051",
    name: "Kiran Rao",
    photo: "KR",
    dept: "Tech",
    assignedBy: "Anjali Kapoor (HR Head)",
    assignedOn: "20 Jul 2026",
    due: "15 Aug 2026",
    progress: 0,
    status: "Assigned",
    assessment: "Not attempted",
    history: [{ at: "20 Jul 2026 10:00", by: "Anjali Kapoor (HR Head)", text: "Training assigned" }],
  },
  {
    id: "TR-907",
    title: "Campaign Reporting Standards",
    description: "Weekly reporting format, metrics definitions and review discipline.",
    audience: "Employee — Marketing",
    mandatory: false,
    material: "campaign_reporting_v2.pdf",
    empId: "CC-MKT-2024-0037",
    name: "Arjun Mehta",
    photo: "AM",
    dept: "Marketing",
    assignedBy: "Anjali Kapoor (HR Head)",
    assignedOn: "05 Apr 2026",
    due: "30 Apr 2026",
    progress: 100,
    status: "Failed",
    assessment: "Failed — 9/20. Reassignment recommended.",
    history: [
      { at: "05 Apr 2026 10:00", by: "Anjali Kapoor (HR Head)", text: "Training assigned" },
      { at: "02 May 2026 12:00", by: "Anjali Kapoor (HR Head)", text: "Assessment failed — result recorded" },
    ],
  },
];

export const FEEDBACK_KINDS = ["Positive feedback", "Improvement feedback", "Recognition", "Review discussion"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export const FEEDBACK_TONE: Record<FeedbackKind, string> = {
  "Positive feedback": "done",
  "Improvement feedback": "pending",
  Recognition: "active",
  "Review discussion": "muted",
};

export type Feedback = {
  id: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  kind: FeedbackKind;
  note: string;
  by: string;
  at: string;
  sharedToDashboard: boolean;
  acknowledgement: "Not Requested" | "Pending" | "Acknowledged" | "Refused";
  discussionOn?: string;
};

export const FEEDBACKS: Feedback[] = [
  {
    id: "FB-1201",
    empId: "CC-TRAIN-2024-0022",
    name: "Neha Kulkarni",
    photo: "NK",
    dept: "Training",
    kind: "Recognition",
    note: "Fastest complaint resolution in the RM team for three straight months. Recognised in the HR review.",
    by: "Anjali Kapoor (HR Head)",
    at: "16 Jul 2026 09:30",
    sharedToDashboard: true,
    acknowledgement: "Acknowledged",
  },
  {
    id: "FB-1202",
    empId: "CC-SALES-2025-0026",
    name: "Priya Verma",
    photo: "PV",
    dept: "Sales",
    kind: "Improvement feedback",
    note: "Punctuality needs attention — 3 late arrivals in July. Discussed separately from performance rating.",
    by: "Rahul Sharma (Sales Head)",
    at: "28 Jul 2026 17:10",
    sharedToDashboard: true,
    acknowledgement: "Pending",
  },
  {
    id: "FB-1203",
    empId: "CC-PROJ-2024-0031",
    name: "Sneha Iyer",
    photo: "SI",
    dept: "Projects",
    kind: "Positive feedback",
    note: "Handled three simultaneous store handovers with complete documentation. Excellent coordination.",
    by: "Anjali Kapoor (HR Head)",
    at: "22 Jul 2026 11:00",
    sharedToDashboard: true,
    acknowledgement: "Acknowledged",
  },
  {
    id: "FB-1204",
    empId: "CC-TECH-2024-0028",
    name: "Sanjay Patil",
    photo: "SP",
    dept: "Tech",
    kind: "Review discussion",
    note: "Improvement plan discussion scheduled with manager and HR.",
    by: "Anjali Kapoor (HR Head)",
    at: "29 Jul 2026 12:00",
    sharedToDashboard: true,
    acknowledgement: "Acknowledged",
    discussionOn: "15 Aug 2026, 11:00 AM",
  },
  {
    id: "FB-1205",
    empId: "CC-PROJ-2024-0019",
    name: "Aman Gupta",
    photo: "AG",
    dept: "Projects",
    kind: "Improvement feedback",
    note: "Escalate site blockers within 24 hours. Two delays were reported after the opening date passed.",
    by: "Sneha Iyer (Project Coordinator)",
    at: "28 Jul 2026 18:00",
    sharedToDashboard: true,
    acknowledgement: "Refused",
  },
];

export const PRIVACY_NOTE =
  "Reviews, ratings, feedback and improvement plans are confidential to the employee, their authorised manager and HR. They are never shown in team-wide dashboards or public rankings. Ratings are entered by people only — no AI scoring is used.";
