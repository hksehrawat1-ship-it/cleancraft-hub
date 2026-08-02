export type Dept =
  | "Sales"
  | "Projects"
  | "Training"
  | "Marketing"
  | "Tech"
  | "Accounts"
  | "Support Staff"
  | "HR";

export const DEPTS: Dept[] = [
  "Sales",
  "Projects",
  "Training",
  "Marketing",
  "Tech",
  "Accounts",
  "Support Staff",
  "HR",
];

export type Employee = {
  id: string;
  name: string;
  role: string;
  dept: Dept;
  email: string;
  phone: string;
  doj: string;
  status: "Active" | "Probation" | "Notice Period" | "Exited";
  docsDone: number;
  docsTotal: number;
  attendance: number;
  leaveBalance: number;
  rating: number;
  access: "Enabled" | "Disabled";
};

export const EMPLOYEES: Employee[] = [
  { id: "CC-101", name: "Rahul Sharma", role: "Sales Head", dept: "Sales", email: "rahul.sharma@cleancraft.in", phone: "98110 22101", doj: "12 Jan 2024", status: "Active", docsDone: 6, docsTotal: 6, attendance: 97, leaveBalance: 8, rating: 4.6, access: "Enabled" },
  { id: "CC-104", name: "Priya Verma", role: "Sales Executive", dept: "Sales", email: "priya.verma@cleancraft.in", phone: "98110 22104", doj: "03 Mar 2025", status: "Active", docsDone: 6, docsTotal: 6, attendance: 94, leaveBalance: 6, rating: 4.2, access: "Enabled" },
  { id: "CC-109", name: "Aman Gupta", role: "Project Manager", dept: "Projects", email: "aman.gupta@cleancraft.in", phone: "98110 22109", doj: "21 Jun 2024", status: "Active", docsDone: 5, docsTotal: 6, attendance: 92, leaveBalance: 4, rating: 4.4, access: "Enabled" },
  { id: "CC-112", name: "Sneha Iyer", role: "Project Coordinator", dept: "Projects", email: "sneha.iyer@cleancraft.in", phone: "98110 22112", doj: "09 Sep 2024", status: "Active", docsDone: 6, docsTotal: 6, attendance: 96, leaveBalance: 9, rating: 4.5, access: "Enabled" },
  { id: "CC-118", name: "Vikas Yadav", role: "Trainer & Launch Exec", dept: "Training", email: "vikas.yadav@cleancraft.in", phone: "98110 22118", doj: "14 Feb 2025", status: "Probation", docsDone: 4, docsTotal: 6, attendance: 89, leaveBalance: 2, rating: 3.8, access: "Enabled" },
  { id: "CC-121", name: "Neha Kulkarni", role: "Relationship Manager", dept: "Training", email: "neha.k@cleancraft.in", phone: "98110 22121", doj: "01 Aug 2024", status: "Active", docsDone: 6, docsTotal: 6, attendance: 95, leaveBalance: 7, rating: 4.3, access: "Enabled" },
  { id: "CC-126", name: "Arjun Mehta", role: "Performance Marketing Exec", dept: "Marketing", email: "arjun.mehta@cleancraft.in", phone: "98110 22126", doj: "18 Nov 2024", status: "Active", docsDone: 6, docsTotal: 6, attendance: 93, leaveBalance: 5, rating: 4.1, access: "Enabled" },
  { id: "CC-130", name: "Kiran Rao", role: "Technical Support", dept: "Tech", email: "kiran.rao@cleancraft.in", phone: "98110 22130", doj: "07 Apr 2025", status: "Active", docsDone: 5, docsTotal: 6, attendance: 91, leaveBalance: 3, rating: 4.0, access: "Enabled" },
  { id: "CC-133", name: "Sanjay Patil", role: "Field Engineer", dept: "Tech", email: "sanjay.patil@cleancraft.in", phone: "98110 22133", doj: "22 May 2024", status: "Notice Period", docsDone: 6, docsTotal: 6, attendance: 84, leaveBalance: 1, rating: 3.4, access: "Disabled" },
  { id: "CC-137", name: "Ritu Singh", role: "Accounts Executive", dept: "Accounts", email: "ritu.singh@cleancraft.in", phone: "98110 22137", doj: "11 Jul 2024", status: "Active", docsDone: 6, docsTotal: 6, attendance: 98, leaveBalance: 10, rating: 4.7, access: "Enabled" },
  { id: "CC-142", name: "Mohit Kumar", role: "Packing Staff", dept: "Support Staff", email: "mohit.k@cleancraft.in", phone: "98110 22142", doj: "02 Jan 2025", status: "Active", docsDone: 3, docsTotal: 6, attendance: 90, leaveBalance: 4, rating: 3.9, access: "Disabled" },
  { id: "CC-145", name: "Suman Devi", role: "Pantry & Cleaning", dept: "Support Staff", email: "suman.devi@cleancraft.in", phone: "98110 22145", doj: "17 Oct 2024", status: "Active", docsDone: 4, docsTotal: 6, attendance: 96, leaveBalance: 5, rating: 4.2, access: "Disabled" },
];

export type Opening = {
  id: string;
  role: string;
  dept: Dept;
  location: string;
  openings: number;
  applied: number;
  screened: number;
  interviewed: number;
  offered: number;
  joined: number;
  priority: "High" | "Medium" | "Low";
  ageDays: number;
};

export const OPENINGS: Opening[] = [
  { id: "R-01", role: "Sales Executive", dept: "Sales", location: "Delhi HO", openings: 3, applied: 42, screened: 18, interviewed: 9, offered: 3, joined: 1, priority: "High", ageDays: 12 },
  { id: "R-02", role: "Field Engineer", dept: "Tech", location: "Jaipur", openings: 2, applied: 21, screened: 11, interviewed: 5, offered: 1, joined: 0, priority: "High", ageDays: 26 },
  { id: "R-03", role: "Trainer", dept: "Training", location: "Indore", openings: 1, applied: 15, screened: 6, interviewed: 3, offered: 1, joined: 1, priority: "Medium", ageDays: 34 },
  { id: "R-04", role: "Packing Staff", dept: "Support Staff", location: "Delhi HO", openings: 4, applied: 30, screened: 20, interviewed: 12, offered: 5, joined: 4, priority: "Medium", ageDays: 8 },
  { id: "R-05", role: "Accounts Executive", dept: "Accounts", location: "Delhi HO", openings: 1, applied: 18, screened: 7, interviewed: 2, offered: 0, joined: 0, priority: "Low", ageDays: 19 },
];

export type Candidate = {
  id: string;
  name: string;
  role: string;
  stage: "Applied" | "Screening" | "Interview" | "Offer" | "Joined" | "Rejected";
  source: "Referral" | "Naukri" | "Walk-in" | "LinkedIn";
  next: string;
};

export const CANDIDATES: Candidate[] = [
  { id: "C-201", name: "Deepak Bansal", role: "Sales Executive", stage: "Interview", source: "Naukri", next: "Round 2 today 4:00 PM" },
  { id: "C-202", name: "Farhan Ali", role: "Field Engineer", stage: "Offer", source: "Referral", next: "Offer acceptance pending" },
  { id: "C-203", name: "Anita Joshi", role: "Sales Executive", stage: "Screening", source: "LinkedIn", next: "HR call tomorrow" },
  { id: "C-204", name: "Ramesh Lal", role: "Packing Staff", stage: "Joined", source: "Walk-in", next: "Onboarding docs pending" },
  { id: "C-205", name: "Pooja Nair", role: "Accounts Executive", stage: "Applied", source: "Naukri", next: "Resume screening" },
  { id: "C-206", name: "Imran Sheikh", role: "Trainer", stage: "Rejected", source: "Naukri", next: "—" },
];

export const DOC_LIST = [
  "Offer Letter Signed",
  "Aadhaar / ID Proof",
  "PAN Card",
  "Bank Details",
  "Education Certificate",
  "Previous Experience Letter",
];

export type LeaveReq = {
  id: string;
  emp: string;
  dept: Dept;
  type: "Casual" | "Sick" | "Earned" | "Unpaid";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const LEAVES: LeaveReq[] = [
  { id: "L-31", emp: "Priya Verma", dept: "Sales", type: "Casual", from: "05 Aug", to: "06 Aug", days: 2, reason: "Family function", status: "Pending" },
  { id: "L-32", emp: "Vikas Yadav", dept: "Training", type: "Sick", from: "03 Aug", to: "03 Aug", days: 1, reason: "Fever", status: "Pending" },
  { id: "L-33", emp: "Kiran Rao", dept: "Tech", type: "Earned", from: "11 Aug", to: "14 Aug", days: 4, reason: "Personal travel", status: "Pending" },
  { id: "L-34", emp: "Ritu Singh", dept: "Accounts", type: "Casual", from: "29 Jul", to: "29 Jul", days: 1, reason: "Bank work", status: "Approved" },
  { id: "L-35", emp: "Mohit Kumar", dept: "Support Staff", type: "Unpaid", from: "24 Jul", to: "26 Jul", days: 3, reason: "Village visit", status: "Rejected" },
];

export type LetterKind =
  | "Offer Letter"
  | "Appointment Letter"
  | "Confirmation Letter"
  | "Appreciation Letter"
  | "Warning Letter"
  | "Show Cause Notice"
  | "Relieving Letter"
  | "Experience Letter";

export const LETTER_KINDS: LetterKind[] = [
  "Offer Letter",
  "Appointment Letter",
  "Confirmation Letter",
  "Appreciation Letter",
  "Warning Letter",
  "Show Cause Notice",
  "Relieving Letter",
  "Experience Letter",
];

export type Letter = {
  id: string;
  kind: LetterKind;
  emp: string;
  date: string;
  reason: string;
  status: "Draft" | "Issued" | "Acknowledged";
};

export const LETTERS: Letter[] = [
  { id: "LT-71", kind: "Warning Letter", emp: "Sanjay Patil", date: "28 Jul 2026", reason: "3 unapproved absences in July", status: "Acknowledged" },
  { id: "LT-72", kind: "Appreciation Letter", emp: "Ritu Singh", date: "26 Jul 2026", reason: "Zero collection errors for 3 months", status: "Issued" },
  { id: "LT-73", kind: "Confirmation Letter", emp: "Vikas Yadav", date: "01 Aug 2026", reason: "Probation completion review pending", status: "Draft" },
  { id: "LT-74", kind: "Show Cause Notice", emp: "Mohit Kumar", date: "22 Jul 2026", reason: "Repeated packing quality returns", status: "Issued" },
];

export type Training = {
  id: string;
  title: string;
  dept: Dept | "All";
  trainer: string;
  date: string;
  seats: number;
  enrolled: number;
  status: "Planned" | "Running" | "Completed";
};

export const TRAININGS: Training[] = [
  { id: "T-11", title: "Franchise Sales Pitch Mastery", dept: "Sales", trainer: "Rahul Sharma", date: "08 Aug 2026", seats: 12, enrolled: 9, status: "Planned" },
  { id: "T-12", title: "Machine Safety & Handling", dept: "Tech", trainer: "Sanjay Patil", date: "31 Jul 2026", seats: 10, enrolled: 10, status: "Running" },
  { id: "T-13", title: "Customer Handling Basics", dept: "All", trainer: "Neha Kulkarni", date: "18 Jul 2026", seats: 20, enrolled: 18, status: "Completed" },
  { id: "T-14", title: "Packing Quality Standards", dept: "Support Staff", trainer: "Aman Gupta", date: "12 Aug 2026", seats: 8, enrolled: 5, status: "Planned" },
];

export const POLICIES = [
  { id: "P-1", title: "Leave Policy", updated: "12 Jun 2026", note: "12 CL + 8 SL + 10 EL per year. Approval by dept head, then HR." },
  { id: "P-2", title: "Attendance & Punctuality", updated: "02 May 2026", note: "Grace 15 min. 3 late marks = 1 half-day deduction." },
  { id: "P-3", title: "Probation & Confirmation", updated: "21 Mar 2026", note: "3-month probation, confirmation only after performance review." },
  { id: "P-4", title: "Travel & Expense Reimbursement", updated: "09 Jul 2026", note: "Field staff FAT limits; bills within 7 days of travel." },
  { id: "P-5", title: "Code of Conduct & Discipline", updated: "15 Jan 2026", note: "Warning → Show cause → Final warning → Exit." },
  { id: "P-6", title: "Exit & Notice Period", updated: "28 Feb 2026", note: "30 days notice; full & final within 45 days of last working day." },
];
