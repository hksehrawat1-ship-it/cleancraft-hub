import type { Dept } from "./data";

export const STAGES = [
  "New Application",
  "Screening",
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Offer Sent",
  "Offer Accepted",
  "Joining Confirmed",
  "Joined",
  "Rejected",
  "Withdrawn",
] as const;
export type Stage = (typeof STAGES)[number];

export const ACTIVE_STAGES: Stage[] = [
  "New Application",
  "Screening",
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Offer Sent",
  "Offer Accepted",
  "Joining Confirmed",
];

export const SOURCES = ["Referral", "Naukri", "LinkedIn", "Walk-in", "Indeed", "Internal"] as const;
export type Source = (typeof SOURCES)[number];

export const RESULTS = ["Strongly Recommended", "Recommended", "Hold", "Not Recommended"] as const;
export type Result = (typeof RESULTS)[number];

export const INTERVIEWERS = [
  "Rahul Sharma (Sales Head)",
  "Aman Gupta (Project Manager)",
  "Kiran Rao (Tech Lead)",
  "Ritu Singh (Accounts)",
  "Anjali Kapoor (HR Head)",
];

export type Activity = { at: string; text: string };

export type Interview = {
  round: string;
  date: string;
  time: string;
  mode: "Online" | "In-person";
  place: string;
  interviewer: string;
  result?: Result;
  comments?: string;
  rescheduledFrom?: string;
};

export type Offer = {
  designation: string;
  dept: Dept;
  manager: string;
  location: string;
  salary: string;
  joiningDate: string;
  validTill: string;
  approval: "Pending Approval" | "Approved" | "Rejected";
  letter: "Not Generated" | "Generated" | "Sent" | "Accepted";
};

export type HrCandidate = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  openingId: string;
  role: string;
  dept: Dept;
  source: Source;
  currentCompany: string;
  experience: number;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  resume: boolean;
  docs: { name: string; ok: boolean }[];
  stage: Stage;
  owner: string;
  interviewer?: string;
  nextAction: string;
  nextDue: string;
  createdOn: string;
  notes: string[];
  interviews: Interview[];
  offer?: Offer;
  rejectReason?: string;
  withdrawReason?: string;
  history: Activity[];
};

export type HrOpening = {
  id: string;
  title: string;
  dept: Dept;
  manager: string;
  positions: number;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Intern";
  experience: string;
  salaryRange: string;
  description: string;
  skills: string[];
  targetJoining: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "On Hold" | "Filled" | "Closed";
  filled: number;
  createdOn: string;
};

const DOCS = (a: boolean, b: boolean, c: boolean) => [
  { name: "Resume", ok: true },
  { name: "Aadhaar card", ok: a },
  { name: "PAN card", ok: b },
  { name: "Experience letter", ok: c },
];

export const HR_OPENINGS: HrOpening[] = [
  {
    id: "JO-01",
    title: "Sales Executive",
    dept: "Sales",
    manager: "Rahul Sharma",
    positions: 3,
    location: "Delhi HO",
    employmentType: "Full-time",
    experience: "1-3 years",
    salaryRange: "₹3.6L - ₹4.8L",
    description: "Handle franchise enquiries, run discovery calls and close franchise bookings.",
    skills: ["Franchise sales", "Cold calling", "CRM discipline"],
    targetJoining: "20 Aug 2026",
    priority: "High",
    status: "Open",
    filled: 1,
    createdOn: "21 Jul 2026",
  },
  {
    id: "JO-02",
    title: "Field Engineer",
    dept: "Tech",
    manager: "Kiran Rao",
    positions: 2,
    location: "Jaipur",
    employmentType: "Full-time",
    experience: "2-5 years",
    salaryRange: "₹3.0L - ₹4.2L",
    description: "Machine installation, preventive maintenance and on-site breakdown support.",
    skills: ["Electrical", "Steam boiler", "Machine servicing"],
    targetJoining: "12 Aug 2026",
    priority: "High",
    status: "Open",
    filled: 0,
    createdOn: "07 Jul 2026",
  },
  {
    id: "JO-03",
    title: "Trainer & Launch Executive",
    dept: "Training",
    manager: "Anjali Kapoor",
    positions: 1,
    location: "Indore",
    employmentType: "Full-time",
    experience: "2-4 years",
    salaryRange: "₹3.2L - ₹4.0L",
    description: "Train franchise owners and store manpower during pre-opening and launch weeks.",
    skills: ["Training delivery", "Hindi + English", "Travel ready"],
    targetJoining: "28 Aug 2026",
    priority: "Medium",
    status: "Open",
    filled: 1,
    createdOn: "29 Jun 2026",
  },
  {
    id: "JO-04",
    title: "Packing Staff",
    dept: "Support Staff",
    manager: "Suresh Nair",
    positions: 4,
    location: "Delhi HO",
    employmentType: "Full-time",
    experience: "0-2 years",
    salaryRange: "₹1.8L - ₹2.2L",
    description: "Garment packing, labelling and dispatch readiness at the central facility.",
    skills: ["Packing", "Attention to detail"],
    targetJoining: "10 Aug 2026",
    priority: "Medium",
    status: "Open",
    filled: 4,
    createdOn: "25 Jul 2026",
  },
  {
    id: "JO-05",
    title: "Accounts Executive",
    dept: "Accounts",
    manager: "Ritu Singh",
    positions: 1,
    location: "Delhi HO",
    employmentType: "Full-time",
    experience: "2-4 years",
    salaryRange: "₹3.0L - ₹3.8L",
    description: "Franchise collections, vendor payables and monthly MIS support.",
    skills: ["Tally", "GST basics", "Excel"],
    targetJoining: "05 Sep 2026",
    priority: "Low",
    status: "On Hold",
    filled: 0,
    createdOn: "14 Jul 2026",
  },
];

export const HR_CANDIDATES: HrCandidate[] = [
  {
    id: "CAN-201",
    name: "Deepak Bansal",
    phone: "98110 44201",
    email: "deepak.bansal@gmail.com",
    city: "Delhi",
    openingId: "JO-01",
    role: "Sales Executive",
    dept: "Sales",
    source: "Naukri",
    currentCompany: "UrbanClap Franchise Desk",
    experience: 2.5,
    currentSalary: "₹3.4L",
    expectedSalary: "₹4.4L",
    noticePeriod: "30 days",
    resume: true,
    docs: DOCS(true, true, false),
    stage: "Interview Scheduled",
    owner: "Anjali Kapoor",
    interviewer: "Rahul Sharma (Sales Head)",
    nextAction: "Round 2 interview",
    nextDue: "02 Aug 2026, 4:00 PM",
    createdOn: "22 Jul 2026",
    notes: ["Strong on franchise pitch, needs CRM hygiene check."],
    interviews: [
      {
        round: "Round 1 - HR",
        date: "27 Jul 2026",
        time: "11:00 AM",
        mode: "Online",
        place: "Meeting link (placeholder)",
        interviewer: "Anjali Kapoor (HR Head)",
        result: "Recommended",
        comments: "Clear communication, realistic salary expectation.",
      },
      {
        round: "Round 2 - Functional",
        date: "02 Aug 2026",
        time: "4:00 PM",
        mode: "In-person",
        place: "Delhi HO, 3rd floor",
        interviewer: "Rahul Sharma (Sales Head)",
      },
    ],
    history: [
      { at: "22 Jul 2026", text: "Application received from Naukri" },
      { at: "24 Jul 2026", text: "Stage moved to Screening" },
      { at: "26 Jul 2026", text: "Shortlisted by HR" },
      { at: "27 Jul 2026", text: "Round 1 completed - Recommended" },
      { at: "29 Jul 2026", text: "Round 2 scheduled with Sales Head" },
    ],
  },
  {
    id: "CAN-202",
    name: "Farhan Ali",
    phone: "98110 44202",
    email: "farhan.ali@outlook.com",
    city: "Jaipur",
    openingId: "JO-02",
    role: "Field Engineer",
    dept: "Tech",
    source: "Referral",
    currentCompany: "Rajasthan Laundry Systems",
    experience: 4,
    currentSalary: "₹3.1L",
    expectedSalary: "₹3.9L",
    noticePeriod: "15 days",
    resume: true,
    docs: DOCS(true, true, true),
    stage: "Offer Sent",
    owner: "Anjali Kapoor",
    interviewer: "Kiran Rao (Tech Lead)",
    nextAction: "Follow up on offer acceptance",
    nextDue: "03 Aug 2026",
    createdOn: "12 Jul 2026",
    notes: ["Referred by Sanjay Patil.", "Hands-on with steam boilers."],
    interviews: [
      {
        round: "Round 1 - Technical",
        date: "18 Jul 2026",
        time: "12:30 PM",
        mode: "In-person",
        place: "Jaipur service centre",
        interviewer: "Kiran Rao (Tech Lead)",
        result: "Strongly Recommended",
        comments: "Excellent machine diagnostics, ready to travel.",
      },
    ],
    offer: {
      designation: "Field Engineer",
      dept: "Tech",
      manager: "Kiran Rao",
      location: "Jaipur",
      salary: "₹3.8L",
      joiningDate: "12 Aug 2026",
      validTill: "05 Aug 2026",
      approval: "Approved",
      letter: "Sent",
    },
    history: [
      { at: "12 Jul 2026", text: "Referral application added" },
      { at: "18 Jul 2026", text: "Technical round - Strongly Recommended" },
      { at: "22 Jul 2026", text: "Marked Selected" },
      { at: "26 Jul 2026", text: "Offer approved by CEO" },
      { at: "27 Jul 2026", text: "Offer sent, valid till 05 Aug 2026" },
    ],
  },
  {
    id: "CAN-203",
    name: "Anita Joshi",
    phone: "98110 44203",
    email: "anita.joshi@gmail.com",
    city: "Noida",
    openingId: "JO-01",
    role: "Sales Executive",
    dept: "Sales",
    source: "LinkedIn",
    currentCompany: "Zoylo Wellness",
    experience: 1.5,
    currentSalary: "₹2.9L",
    expectedSalary: "₹3.9L",
    noticePeriod: "Immediate",
    resume: true,
    docs: DOCS(false, true, false),
    stage: "Screening",
    owner: "Anjali Kapoor",
    nextAction: "HR screening call",
    nextDue: "03 Aug 2026",
    createdOn: "30 Jul 2026",
    notes: [],
    interviews: [],
    history: [
      { at: "30 Jul 2026", text: "Application received from LinkedIn" },
      { at: "31 Jul 2026", text: "Stage moved to Screening" },
    ],
  },
  {
    id: "CAN-204",
    name: "Ramesh Lal",
    phone: "98110 44204",
    email: "ramesh.lal@gmail.com",
    city: "Delhi",
    openingId: "JO-04",
    role: "Packing Staff",
    dept: "Support Staff",
    source: "Walk-in",
    currentCompany: "Local dry-clean unit",
    experience: 1,
    currentSalary: "₹1.6L",
    expectedSalary: "₹2.0L",
    noticePeriod: "Immediate",
    resume: false,
    docs: DOCS(true, false, false),
    stage: "Joining Confirmed",
    owner: "Anjali Kapoor",
    interviewer: "Anjali Kapoor (HR Head)",
    nextAction: "Collect PAN before joining",
    nextDue: "05 Aug 2026",
    createdOn: "26 Jul 2026",
    notes: ["Joining confirmed verbally, documents partially collected."],
    interviews: [
      {
        round: "Round 1 - Walk-in",
        date: "27 Jul 2026",
        time: "10:00 AM",
        mode: "In-person",
        place: "Delhi HO",
        interviewer: "Anjali Kapoor (HR Head)",
        result: "Recommended",
        comments: "Suitable for packing line, trainable.",
      },
    ],
    offer: {
      designation: "Packing Staff",
      dept: "Support Staff",
      manager: "Suresh Nair",
      location: "Delhi HO",
      salary: "₹2.0L",
      joiningDate: "08 Aug 2026",
      validTill: "04 Aug 2026",
      approval: "Approved",
      letter: "Accepted",
    },
    history: [
      { at: "26 Jul 2026", text: "Walk-in candidate registered" },
      { at: "27 Jul 2026", text: "Walk-in interview - Recommended" },
      { at: "29 Jul 2026", text: "Offer accepted" },
      { at: "30 Jul 2026", text: "Joining confirmed for 08 Aug 2026" },
    ],
  },
  {
    id: "CAN-205",
    name: "Pooja Nair",
    phone: "98110 44205",
    email: "pooja.nair@gmail.com",
    city: "Delhi",
    openingId: "JO-05",
    role: "Accounts Executive",
    dept: "Accounts",
    source: "Naukri",
    currentCompany: "Sharda Textiles",
    experience: 3,
    currentSalary: "₹3.0L",
    expectedSalary: "₹3.6L",
    noticePeriod: "60 days",
    resume: true,
    docs: DOCS(false, false, false),
    stage: "New Application",
    owner: "Anjali Kapoor",
    nextAction: "First contact call pending",
    nextDue: "01 Aug 2026",
    createdOn: "29 Jul 2026",
    notes: [],
    interviews: [],
    history: [{ at: "29 Jul 2026", text: "Application received from Naukri" }],
  },
  {
    id: "CAN-206",
    name: "Imran Sheikh",
    phone: "98110 44206",
    email: "imran.sheikh@gmail.com",
    city: "Indore",
    openingId: "JO-03",
    role: "Trainer & Launch Executive",
    dept: "Training",
    source: "Naukri",
    currentCompany: "Skill Bridge Academy",
    experience: 2,
    currentSalary: "₹2.8L",
    expectedSalary: "₹4.2L",
    noticePeriod: "30 days",
    resume: true,
    docs: DOCS(true, true, false),
    stage: "Rejected",
    owner: "Anjali Kapoor",
    interviewer: "Anjali Kapoor (HR Head)",
    nextAction: "—",
    nextDue: "—",
    createdOn: "10 Jul 2026",
    notes: [],
    interviews: [
      {
        round: "Round 1 - HR",
        date: "16 Jul 2026",
        time: "3:00 PM",
        mode: "Online",
        place: "Meeting link (placeholder)",
        interviewer: "Anjali Kapoor (HR Head)",
        result: "Not Recommended",
        comments: "Salary expectation far above band, low travel willingness.",
      },
    ],
    rejectReason: "Salary expectation outside approved band",
    history: [
      { at: "10 Jul 2026", text: "Application received" },
      { at: "16 Jul 2026", text: "HR round - Not Recommended" },
      { at: "17 Jul 2026", text: "Rejected: Salary expectation outside approved band" },
    ],
  },
  {
    id: "CAN-207",
    name: "Sameer Khanna",
    phone: "98110 44207",
    email: "sameer.khanna@gmail.com",
    city: "Gurugram",
    openingId: "JO-02",
    role: "Field Engineer",
    dept: "Tech",
    source: "Indeed",
    currentCompany: "CoolAir Services",
    experience: 5,
    currentSalary: "₹3.6L",
    expectedSalary: "₹4.2L",
    noticePeriod: "30 days",
    resume: true,
    docs: DOCS(true, true, true),
    stage: "Interview Completed",
    owner: "Anjali Kapoor",
    interviewer: "Kiran Rao (Tech Lead)",
    nextAction: "Interview feedback pending from interviewer",
    nextDue: "30 Jul 2026",
    createdOn: "18 Jul 2026",
    notes: ["Feedback overdue by 3 days."],
    interviews: [
      {
        round: "Round 1 - Technical",
        date: "29 Jul 2026",
        time: "1:00 PM",
        mode: "Online",
        place: "Meeting link (placeholder)",
        interviewer: "Kiran Rao (Tech Lead)",
        rescheduledFrom: "26 Jul 2026, 11:00 AM",
      },
    ],
    history: [
      { at: "18 Jul 2026", text: "Application received from Indeed" },
      { at: "24 Jul 2026", text: "Shortlisted" },
      { at: "25 Jul 2026", text: "Interview scheduled for 26 Jul 2026, 11:00 AM" },
      { at: "26 Jul 2026", text: "Interview rescheduled to 29 Jul 2026, 1:00 PM" },
      { at: "29 Jul 2026", text: "Interview completed, evaluation pending" },
    ],
  },
  {
    id: "CAN-208",
    name: "Neelam Chauhan",
    phone: "98110 44201",
    email: "neelam.chauhan@gmail.com",
    city: "Delhi",
    openingId: "JO-01",
    role: "Sales Executive",
    dept: "Sales",
    source: "Walk-in",
    currentCompany: "Fresh graduate",
    experience: 0.5,
    currentSalary: "—",
    expectedSalary: "₹3.0L",
    noticePeriod: "Immediate",
    resume: true,
    docs: DOCS(true, false, false),
    stage: "Selected",
    owner: "Anjali Kapoor",
    interviewer: "Rahul Sharma (Sales Head)",
    nextAction: "Prepare offer for approval",
    nextDue: "01 Aug 2026",
    createdOn: "20 Jul 2026",
    notes: ["Selected but offer not yet created."],
    interviews: [
      {
        round: "Round 1 - HR",
        date: "23 Jul 2026",
        time: "11:30 AM",
        mode: "In-person",
        place: "Delhi HO",
        interviewer: "Rahul Sharma (Sales Head)",
        result: "Recommended",
        comments: "Good attitude, will need 2 weeks of shadowing.",
      },
    ],
    history: [
      { at: "20 Jul 2026", text: "Walk-in candidate registered" },
      { at: "23 Jul 2026", text: "HR round - Recommended" },
      { at: "28 Jul 2026", text: "Marked Selected" },
    ],
  },
];

export const normPhone = (p: string) => p.replace(/\D/g, "").slice(-10);
export const normEmail = (e: string) => e.trim().toLowerCase();

export const STAGE_TONE: Record<Stage, "done" | "active" | "pending" | "urgent" | "muted"> = {
  "New Application": "pending",
  Screening: "pending",
  Shortlisted: "active",
  "Interview Scheduled": "active",
  "Interview Completed": "active",
  Selected: "active",
  "Offer Sent": "pending",
  "Offer Accepted": "done",
  "Joining Confirmed": "done",
  Joined: "done",
  Rejected: "urgent",
  Withdrawn: "muted",
};
