import { MASTER_EMPLOYEES } from "./employee-data";

export type AuditEntry = { at: string; by: string; text: string; reason?: string };

export const ROLES = [
  "CEO",
  "HR Head",
  "Sales Head",
  "Sales Executive",
  "Relationship Manager",
  "Technical Support",
  "Field Engineer",
  "Administration Manager",
  "Pantry & Cleaning Staff",
  "Logistics Manager",
  "Packing Staff",
  "Employee",
] as const;
export type RoleName = (typeof ROLES)[number];

/** Roles that need CEO / authorised-administrator approval — HR cannot self-grant. */
export const SENSITIVE_ROLES: RoleName[] = ["CEO", "HR Head", "Sales Head", "Administration Manager"];
export const isSensitiveRole = (r: RoleName) => SENSITIVE_ROLES.includes(r);

export const ROLE_SCOPE: Record<RoleName, { scope: string; modules: string[]; note: string }> = {
  CEO: {
    scope: "All departments (executive visibility)",
    modules: ["Company Overview", "All department dashboards", "Reports", "Approvals"],
    note: "Approved executive visibility. System-administrator permissions remain separately controlled.",
  },
  "HR Head": {
    scope: "All departments — people data only",
    modules: ["Recruitment", "Employees", "Onboarding", "Attendance", "Performance", "Letters", "User Access"],
    note: "Manages employee and operational access. Cannot grant CEO or system-administrator access.",
  },
  "Sales Head": {
    scope: "Sales department",
    modules: ["Sales Dashboard", "Team Leads", "Pipeline", "Team Tasks", "Performance"],
    note: "Department head — approved department data only.",
  },
  "Sales Executive": {
    scope: "Own leads and own records",
    modules: ["My Leads", "Call Queue", "Follow-ups", "Pipeline", "Meetings"],
    note: "Sees only own assigned leads and own private information.",
  },
  "Relationship Manager": {
    scope: "Assigned stores",
    modules: ["Store Status", "CRM Tickets", "Delegate", "Resources", "Performance"],
    note: "Authorised store data only.",
  },
  "Technical Support": {
    scope: "Assigned tickets",
    modules: ["Dashboard", "My Tickets", "Priority Queue", "Remote Troubleshooting"],
    note: "Sees assigned support tickets only.",
  },
  "Field Engineer": {
    scope: "Assigned jobs and visits",
    modules: ["Dashboard", "My Jobs", "Visit Schedule", "Work Report", "My Expenses"],
    note: "Sees own jobs and own expense records.",
  },
  "Administration Manager": {
    scope: "Support staff team",
    modules: ["Manager Dashboard", "Assign Tasks", "Staff Tasks", "Review Work", "Supplies", "Staff Performance"],
    note: "Authorised team information only.",
  },
  "Pantry & Cleaning Staff": {
    scope: "Own tasks only",
    modules: ["Dashboard", "My Tasks", "Supplies", "Report a Problem", "Help"],
    note: "Sees only own tasks and own private information.",
  },
  "Logistics Manager": {
    scope: "Supply chain & logistics",
    modules: ["Dispatch", "Stock", "Vendors", "Reports"],
    note: "Authorised department data only.",
  },
  "Packing Staff": {
    scope: "Own packing tasks only",
    modules: ["Dashboard", "My Tasks", "Packing Supplies", "Report a Problem", "Help"],
    note: "Sees only own tasks.",
  },
  Employee: {
    scope: "Own record only",
    modules: ["My Profile", "My Documents", "My Attendance", "My Letters"],
    note: "Employees see only their own private information.",
  },
};

export const ACCOUNT_STATES = [
  "Pending Creation",
  "Invitation Sent",
  "Active",
  "Locked",
  "Suspended",
  "Deactivated",
] as const;
export type AccountState = (typeof ACCOUNT_STATES)[number];

export const ACCOUNT_TONE: Record<AccountState, string> = {
  "Pending Creation": "muted",
  "Invitation Sent": "active",
  Active: "done",
  Locked: "urgent",
  Suspended: "urgent",
  Deactivated: "muted",
};

export type InviteState = "Not Sent" | "Sent" | "Expired" | "Accepted";
export const INVITE_TONE: Record<InviteState, string> = {
  "Not Sent": "muted",
  Sent: "active",
  Expired: "urgent",
  Accepted: "done",
};

export const ROLE_CHANGE_STAGES = [
  "Role Change Requested",
  "Approval Pending",
  "Approved",
  "Access Updated",
  "Employee Notified",
] as const;
export type RoleChangeStage = (typeof ROLE_CHANGE_STAGES)[number];

export type RoleChangeRequest = {
  id: string;
  fromRole: RoleName;
  toRole: RoleName;
  reason: string;
  requestedBy: string;
  requestedOn: string;
  stage: RoleChangeStage;
  approver: string;
};

export type SessionRow = { device: string; place: string; at: string; active: boolean };

export type UserAccount = {
  id: string;
  empId: string;
  name: string;
  photo: string;
  dept: string;
  designation: string;
  manager: string;
  employmentStatus: string;
  workEmail: string;
  mobile: string;
  role: RoleName;
  account: AccountState;
  invite: InviteState;
  inviteSentOn?: string;
  inviteExpiresOn?: string;
  createdOn?: string;
  lastLogin?: string;
  failedLogins: number;
  mfaReady: boolean;
  passwordResetRequested: boolean;
  deactivationDue?: string;
  extraRoles?: RoleName[];
  sessions: SessionRow[];
  invitations: AuditEntry[];
  resets: AuditEntry[];
  roleHistory: AuditEntry[];
  deactivations: AuditEntry[];
  audit: AuditEntry[];
  roleRequest?: RoleChangeRequest;
};

const e = (empId: string) => MASTER_EMPLOYEES.find((x) => x.empId === empId)!;

const from = (empId: string) => {
  const x = e(empId);
  return {
    empId: x.empId,
    name: x.name,
    photo: x.photo,
    dept: x.dept as string,
    designation: x.designation,
    manager: x.manager,
    employmentStatus: x.status as string,
    workEmail: x.workEmail,
    mobile: x.mobile,
  };
};

export const USER_ACCOUNTS: UserAccount[] = [
  {
    id: "UA1",
    ...from("CC-SALES-2024-0011"),
    role: "Sales Head",
    account: "Active",
    invite: "Accepted",
    inviteSentOn: "12 Jan 2024",
    createdOn: "12 Jan 2024",
    lastLogin: "03 Aug 2026, 09:12",
    failedLogins: 0,
    mfaReady: true,
    passwordResetRequested: false,
    sessions: [
      { device: "Chrome · Windows", place: "Delhi HO", at: "03 Aug 2026, 09:12", active: true },
      { device: "Safari · iPhone", place: "Delhi", at: "01 Aug 2026, 20:40", active: false },
    ],
    invitations: [{ at: "12 Jan 2024, 10:00", by: "Anjali Kapoor", text: "Setup invitation sent to work email" }],
    resets: [{ at: "10 Mar 2026, 11:20", by: "Rahul Sharma", text: "Password reset link requested by employee" }],
    roleHistory: [
      { at: "12 Jan 2024", by: "Anjali Kapoor", text: "Role assigned: Sales Executive" },
      { at: "01 Apr 2026", by: "CEO", text: "Role changed: Sales Executive → Sales Head", reason: "Promotion" },
    ],
    deactivations: [],
    audit: [
      { at: "12 Jan 2024, 10:00", by: "Anjali Kapoor", text: "Account created and invitation sent" },
      { at: "12 Jan 2024, 12:30", by: "Rahul Sharma", text: "Invitation accepted — password set by employee" },
      { at: "01 Apr 2026, 15:00", by: "CEO", text: "Privileged role approved: Sales Head" },
    ],
  },
  {
    id: "UA2",
    ...from("CC-SALES-2025-0026"),
    role: "Sales Executive",
    account: "Active",
    invite: "Accepted",
    createdOn: "03 Mar 2025",
    lastLogin: "01 Aug 2026, 10:05",
    failedLogins: 0,
    mfaReady: false,
    passwordResetRequested: false,
    sessions: [{ device: "Chrome · Windows", place: "Delhi HO", at: "01 Aug 2026, 10:05", active: true }],
    invitations: [{ at: "03 Mar 2025, 09:30", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [{ at: "03 Mar 2025", by: "Anjali Kapoor", text: "Role assigned: Sales Executive" }],
    deactivations: [],
    audit: [
      { at: "03 Mar 2025, 09:30", by: "Anjali Kapoor", text: "Account created and invitation sent" },
      { at: "03 Mar 2025, 10:10", by: "Priya Verma", text: "Invitation accepted — password set by employee" },
    ],
  },
  {
    id: "UA3",
    ...from("CC-PROJ-2024-0019"),
    role: "Employee",
    account: "Active",
    invite: "Accepted",
    createdOn: "21 Jun 2024",
    lastLogin: "31 Jul 2026, 18:44",
    failedLogins: 0,
    mfaReady: false,
    passwordResetRequested: false,
    sessions: [{ device: "Chrome · Android", place: "Ghaziabad", at: "31 Jul 2026, 18:44", active: true }],
    invitations: [{ at: "21 Jun 2024, 11:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [{ at: "21 Jun 2024", by: "Anjali Kapoor", text: "Role assigned: Employee" }],
    deactivations: [],
    audit: [{ at: "21 Jun 2024, 11:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
    roleRequest: {
      id: "RC1",
      fromRole: "Employee",
      toRole: "Administration Manager",
      reason: "Taking over support staff supervision at Delhi HO",
      requestedBy: "Anjali Kapoor (HR Head)",
      requestedOn: "01 Aug 2026",
      stage: "Approval Pending",
      approver: "CEO",
    },
  },
  {
    id: "UA4",
    ...from("CC-PROJ-2024-0031"),
    role: "Employee",
    account: "Locked",
    invite: "Accepted",
    createdOn: "09 Sep 2024",
    lastLogin: "28 Jul 2026, 09:00",
    failedLogins: 6,
    mfaReady: false,
    passwordResetRequested: true,
    sessions: [{ device: "Chrome · Windows", place: "Delhi HO", at: "28 Jul 2026, 09:00", active: false }],
    invitations: [{ at: "09 Sep 2024, 10:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [{ at: "02 Aug 2026, 08:40", by: "Sneha Iyer", text: "Password reset requested after repeated failed logins" }],
    roleHistory: [{ at: "09 Sep 2024", by: "Anjali Kapoor", text: "Role assigned: Employee" }],
    deactivations: [],
    audit: [
      { at: "09 Sep 2024, 10:00", by: "Anjali Kapoor", text: "Account created and invitation sent" },
      { at: "02 Aug 2026, 08:35", by: "System", text: "Account locked after 6 failed login attempts" },
    ],
  },
  {
    id: "UA5",
    ...from("CC-TRAIN-2025-0044"),
    role: "Employee",
    account: "Invitation Sent",
    invite: "Expired",
    inviteSentOn: "18 Jul 2026",
    inviteExpiresOn: "25 Jul 2026",
    createdOn: "18 Jul 2026",
    failedLogins: 0,
    mfaReady: false,
    passwordResetRequested: false,
    sessions: [],
    invitations: [
      { at: "18 Jul 2026, 10:00", by: "Anjali Kapoor", text: "Setup invitation sent (single-use link, 7-day expiry)" },
      { at: "25 Jul 2026, 10:00", by: "System", text: "Invitation link expired unused" },
    ],
    resets: [],
    roleHistory: [{ at: "18 Jul 2026", by: "Anjali Kapoor", text: "Role assigned: Employee" }],
    deactivations: [],
    audit: [{ at: "18 Jul 2026, 10:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
  },
  {
    id: "UA6",
    ...from("CC-TRAIN-2024-0022"),
    role: "Relationship Manager",
    account: "Active",
    invite: "Accepted",
    createdOn: "01 Aug 2024",
    lastLogin: "02 Aug 2026, 11:15",
    failedLogins: 0,
    mfaReady: true,
    passwordResetRequested: false,
    sessions: [{ device: "Chrome · Windows", place: "Pune", at: "02 Aug 2026, 11:15", active: true }],
    invitations: [{ at: "01 Aug 2024, 09:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [{ at: "01 Aug 2024", by: "Anjali Kapoor", text: "Role assigned: Relationship Manager" }],
    deactivations: [],
    audit: [{ at: "01 Aug 2024, 09:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
  },
  {
    id: "UA7",
    ...from("CC-MKT-2024-0037"),
    role: "Employee",
    account: "Active",
    invite: "Accepted",
    createdOn: "18 Nov 2024",
    lastLogin: "03 Aug 2026, 08:05",
    failedLogins: 0,
    mfaReady: false,
    passwordResetRequested: false,
    sessions: [{ device: "Chrome · Windows", place: "Gurugram", at: "03 Aug 2026, 08:05", active: true }],
    invitations: [{ at: "18 Nov 2024, 10:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [{ at: "18 Nov 2024", by: "Anjali Kapoor", text: "Role assigned: Employee" }],
    deactivations: [],
    audit: [{ at: "18 Nov 2024, 10:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
  },
  {
    id: "UA8",
    ...from("CC-TECH-2025-0051"),
    role: "Technical Support",
    account: "Active",
    invite: "Accepted",
    createdOn: "07 Apr 2025",
    lastLogin: "03 Aug 2026, 07:40",
    failedLogins: 0,
    mfaReady: true,
    passwordResetRequested: false,
    extraRoles: ["Field Engineer"],
    sessions: [{ device: "Chrome · Windows", place: "Bengaluru", at: "03 Aug 2026, 07:40", active: true }],
    invitations: [{ at: "07 Apr 2025, 09:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [
      { at: "07 Apr 2025", by: "Anjali Kapoor", text: "Role assigned: Technical Support" },
      { at: "12 Jan 2026", by: "Anjali Kapoor", text: "Additional role granted: Field Engineer", reason: "Temporary cover" },
    ],
    deactivations: [],
    audit: [{ at: "07 Apr 2025, 09:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
  },
  {
    id: "UA9",
    ...from("CC-TECH-2024-0028"),
    role: "Field Engineer",
    account: "Suspended",
    invite: "Accepted",
    createdOn: "22 May 2024",
    lastLogin: "27 Jul 2026, 17:20",
    failedLogins: 1,
    mfaReady: false,
    passwordResetRequested: false,
    deactivationDue: "24 Aug 2026",
    sessions: [{ device: "Chrome · Android", place: "Jaipur", at: "27 Jul 2026, 17:20", active: true }],
    invitations: [{ at: "22 May 2024, 10:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [{ at: "22 May 2024", by: "Anjali Kapoor", text: "Role assigned: Field Engineer" }],
    deactivations: [
      { at: "25 Jul 2026, 12:00", by: "Anjali Kapoor", text: "Deactivation scheduled for 24 Aug 2026", reason: "Notice period — last working day" },
    ],
    audit: [
      { at: "22 May 2024, 10:00", by: "Anjali Kapoor", text: "Account created and invitation sent" },
      { at: "28 Jul 2026, 10:15", by: "Anjali Kapoor", text: "Account suspended", reason: "Disciplinary matter under review" },
    ],
  },
  {
    id: "UA10",
    ...from("CC-ACC-2024-0033"),
    role: "Employee",
    account: "Active",
    invite: "Accepted",
    createdOn: "11 Jul 2024",
    lastLogin: "03 Aug 2026, 09:30",
    failedLogins: 0,
    mfaReady: true,
    passwordResetRequested: false,
    sessions: [{ device: "Chrome · Windows", place: "Delhi HO", at: "03 Aug 2026, 09:30", active: true }],
    invitations: [{ at: "11 Jul 2024, 10:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [{ at: "11 Jul 2024", by: "Anjali Kapoor", text: "Role assigned: Employee" }],
    deactivations: [],
    audit: [{ at: "11 Jul 2024, 10:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
  },
  {
    id: "UA11",
    ...from("CC-SUP-2026-0061"),
    role: "Packing Staff",
    account: "Invitation Sent",
    invite: "Sent",
    inviteSentOn: "29 Jul 2026",
    inviteExpiresOn: "05 Aug 2026",
    createdOn: "29 Jul 2026",
    failedLogins: 0,
    mfaReady: false,
    passwordResetRequested: false,
    sessions: [],
    invitations: [
      { at: "29 Jul 2026, 11:00", by: "Anjali Kapoor", text: "Setup invitation sent (single-use link, 7-day expiry)" },
    ],
    resets: [],
    roleHistory: [{ at: "29 Jul 2026", by: "Anjali Kapoor", text: "Role assigned: Packing Staff" }],
    deactivations: [],
    audit: [{ at: "29 Jul 2026, 11:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
  },
  {
    id: "UA12",
    ...from("CC-SUP-2024-0040"),
    role: "Pantry & Cleaning Staff",
    account: "Pending Creation",
    invite: "Not Sent",
    failedLogins: 0,
    mfaReady: false,
    passwordResetRequested: false,
    sessions: [],
    invitations: [],
    resets: [],
    roleHistory: [],
    deactivations: [],
    audit: [],
  },
  {
    id: "UA13",
    ...from("CC-MKT-2023-0007"),
    role: "Employee",
    account: "Active",
    invite: "Accepted",
    createdOn: "05 Feb 2023",
    lastLogin: "14 Jul 2026, 19:02",
    failedLogins: 0,
    mfaReady: false,
    passwordResetRequested: false,
    deactivationDue: "15 Jul 2026",
    sessions: [{ device: "Chrome · Windows", place: "Delhi HO", at: "14 Jul 2026, 19:02", active: true }],
    invitations: [{ at: "05 Feb 2023, 10:00", by: "Anjali Kapoor", text: "Setup invitation sent" }],
    resets: [],
    roleHistory: [{ at: "05 Feb 2023", by: "Anjali Kapoor", text: "Role assigned: Employee" }],
    deactivations: [
      { at: "15 Jul 2026, 09:00", by: "System", text: "Deactivation task created on exit — pending action", reason: "Employee exited 15 Jul 2026" },
    ],
    audit: [{ at: "05 Feb 2023, 10:00", by: "Anjali Kapoor", text: "Account created and invitation sent" }],
  },
];

export const SECURITY_NOTE =
  "HR never creates, views, copies or stores a password. Only a secure single-use setup link with an expiry is sent; passwords are stored as hashes by the authentication provider and are never shown in the CRM, database, logs or notifications. Strong passwords are enforced and multi-factor authentication is prepared but not activated.";

export const nowStamp = () =>
  new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
