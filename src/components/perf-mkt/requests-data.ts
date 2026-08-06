/**
 * Marketing Requests records for the Performance Marketing Executive workspace.
 *
 * A request keeps ONE permanent Request ID for its whole life (including reopen),
 * and always links to one permanent Store ID plus the Relationship Manager who
 * raised it. Campaigns, creatives, profile updates and influencer activities
 * carry the same Request ID instead of creating duplicate request records.
 *
 * Lineage: Store ID -> Request ID -> Campaign / Creative / Profile / Influencer -> Lead ID -> Sale
 */

import type { Tone } from "./data";

export const REQ_TYPES = [
  "Graphic Required",
  "Festival Promotion",
  "Offer Campaign",
  "Google Ads",
  "Meta Ads",
  "Google Business Profile Setup",
  "Google Business Profile Update",
  "Facebook Profile Update",
  "Instagram Profile Update",
  "Influencer Promotion",
  "YouTuber Collaboration",
  "Local Store Campaign",
  "Lead Generation Campaign",
  "Store Sales Improvement",
  "Other",
] as const;
export type ReqType = (typeof REQ_TYPES)[number];

export type ReqStage =
  | "draft"
  | "submitted"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "submitted_for_review"
  | "approved"
  | "completed"
  | "closed"
  | "information_required"
  | "returned"
  | "blocked"
  | "correction_required"
  | "reassigned"
  | "cancelled";

export const stageMeta: Record<ReqStage, { label: string; tone: Tone }> = {
  draft: { label: "Draft (RM)", tone: "draft" },
  submitted: { label: "Submitted", tone: "attention" },
  assigned: { label: "Assigned", tone: "attention" },
  accepted: { label: "Accepted", tone: "active" },
  in_progress: { label: "In Progress", tone: "active" },
  submitted_for_review: { label: "Submitted for Review", tone: "attention" },
  approved: { label: "Approved", tone: "healthy" },
  completed: { label: "Completed", tone: "healthy" },
  closed: { label: "Closed", tone: "healthy" },
  information_required: { label: "Information Required", tone: "attention" },
  returned: { label: "Returned", tone: "overdue" },
  blocked: { label: "Blocked", tone: "overdue" },
  correction_required: { label: "Correction Required", tone: "overdue" },
  reassigned: { label: "Reassigned", tone: "draft" },
  cancelled: { label: "Cancelled", tone: "draft" },
};

export const WORKFLOW_ORDER: ReqStage[] = [
  "draft",
  "submitted",
  "assigned",
  "accepted",
  "in_progress",
  "submitted_for_review",
  "approved",
  "completed",
  "closed",
];

export type ReqPriority = "urgent" | "high" | "medium" | "low";

export const priorityMeta: Record<ReqPriority, { label: string; tone: Tone }> = {
  urgent: { label: "Urgent", tone: "overdue" },
  high: { label: "High", tone: "attention" },
  medium: { label: "Medium", tone: "active" },
  low: { label: "Low", tone: "draft" },
};

export type ReqEvent = { at: string; actor: string; detail: string };

export type LinkedRecord = {
  kind: "Campaign" | "Creative" | "Profile" | "Influencer" | "Lead";
  id: string;
  label: string;
};

export type CompletionReport = {
  workDone: string;
  linkedId: string;
  completedOn: string;
  proof: string;
  budgetUsed: number;
  leads?: number;
  sales?: number;
  pending: string;
  note: string;
};

export type MarketingRequestFull = {
  id: string;
  storeId: string;
  store: string;
  city: string;
  state: string;
  rm: string;
  executive: string;
  type: ReqType;
  priority: ReqPriority;
  stage: ReqStage;
  submittedOn: string;
  dueDate: string;
  startDate: string;
  nextAction: string;
  platform: "Google Ads" | "Meta Ads" | "Instagram" | "Facebook" | "Google Business" | "YouTube" | "None";
  problem: string;
  outcome: string;
  audience: string;
  offer: string;
  targetLocation: string;
  budget: number;
  budgetApproved: boolean;
  files: string[];
  references: string[];
  rmNotes: string;
  returnedCount: number;
  linked: LinkedRecord[];
  report?: CompletionReport;
  events: ReqEvent[];
};

export const TODAY = "2026-08-06";

export const INFO_CHECKLIST = [
  "Clear business objective",
  "Offer details",
  "Correct store information",
  "Target area",
  "Budget",
  "Required dates",
  "Approved creative",
  "Store photographs",
  "Contact details",
  "Other clarification",
];

export const RETURN_REASONS = [
  "Missing information",
  "Request outside marketing scope",
  "Duplicate request",
  "Management approval required",
  "Other reason",
];

export const MARKETING_REQUESTS: MarketingRequestFull[] = [
  {
    id: "REQ-3391",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    rm: "Sanya Kapoor",
    executive: "Nikhil Arora",
    type: "Festival Promotion",
    priority: "urgent",
    stage: "assigned",
    submittedOn: "2026-08-04",
    dueDate: "2026-08-07",
    startDate: "2026-08-06",
    nextAction: "Accept request and confirm creative plan",
    platform: "Meta Ads",
    problem: "Raksha Bandhan week walk-ins are flat; competitor running 20% off.",
    outcome: "Festival creative set + Meta Ads reaching 3 km radius, 60 enquiries.",
    audience: "Families, 25–45, Gomti Nagar & Vibhuti Khand",
    offer: "20% off on dry cleaning above ₹999, valid 8–16 Aug",
    targetLocation: "Gomti Nagar, Vibhuti Khand — 5 km",
    budget: 35000,
    budgetApproved: true,
    files: ["store-front-photos.zip", "offer-approval-note.pdf"],
    references: ["Jaipur Diwali creative set", "Competitor banner sample"],
    rmNotes: "Owner wants Hindi + English banner variants for shop display too.",
    returnedCount: 0,
    linked: [],
    events: [
      { at: "2026-08-04", actor: "Sanya Kapoor (RM)", detail: "Request submitted for STR-1088" },
      { at: "2026-08-04", actor: "System", detail: "Assigned to Nikhil Arora (store owner executive)" },
    ],
  },
  {
    id: "REQ-3388",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    city: "Surat",
    state: "Gujarat",
    rm: "Yash Malhotra",
    executive: "Nikhil Arora",
    type: "Google Ads",
    priority: "urgent",
    stage: "submitted",
    submittedOn: "2026-08-05",
    dueDate: "2026-08-06",
    startDate: "2026-08-06",
    nextAction: "Accept or return — enquiries down 34%",
    platform: "Google Ads",
    problem: "Enquiries dropped 34% after the old search campaign was paused.",
    outcome: "Restart local search campaign with revised keywords, 80 leads/month.",
    audience: "Search intent — dry cleaning, laundry near me",
    offer: "First order 15% off",
    targetLocation: "Adajan, Pal, Rander — 6 km",
    budget: 40000,
    budgetApproved: false,
    files: ["last-campaign-report.pdf"],
    references: ["Indore search campaign structure"],
    rmNotes: "Budget approval pending with Accounts — please confirm before launch.",
    returnedCount: 0,
    linked: [],
    events: [
      { at: "2026-08-05", actor: "Yash Malhotra (RM)", detail: "Request submitted for STR-1103" },
    ],
  },
  {
    id: "REQ-3384",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    type: "Google Business Profile Update",
    priority: "medium",
    stage: "accepted",
    submittedOn: "2026-08-02",
    dueDate: "2026-08-09",
    startDate: "2026-08-06",
    nextAction: "Start work — upload 12 photos, respond to 4 reviews",
    platform: "Google Business",
    problem: "Profile shows old timings; 4 reviews unanswered for 3 weeks.",
    outcome: "Profile 100% complete, all reviews answered, timings corrected.",
    audience: "Local search users within 5 km",
    offer: "—",
    targetLocation: "Vijay Nagar, Scheme 54",
    budget: 0,
    budgetApproved: true,
    files: ["store-photos-aug.zip"],
    references: [],
    rmNotes: "Owner has shared 12 fresh photos on WhatsApp; uploaded to files.",
    returnedCount: 0,
    linked: [{ kind: "Profile", id: "PRF-2210", label: "Google Business Profile — STR-1067" }],
    events: [
      { at: "2026-08-02", actor: "Aakash Menon (RM)", detail: "Request submitted for STR-1067" },
      { at: "2026-08-03", actor: "Nikhil Arora", detail: "Accepted — expected completion 09 Aug" },
    ],
  },
  {
    id: "REQ-3379",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    state: "Rajasthan",
    rm: "Ritika Bansal",
    executive: "Nikhil Arora",
    type: "Influencer Promotion",
    priority: "high",
    stage: "in_progress",
    submittedOn: "2026-07-29",
    dueDate: "2026-08-11",
    startDate: "2026-08-01",
    nextAction: "Chase INF-551 content — overdue by 1 day",
    platform: "Instagram",
    problem: "Shoe-laundry service is under-known in Vaishali Nagar.",
    outcome: "2 influencer reels, 40 enquiries, 15 shoe-laundry orders.",
    audience: "Lifestyle followers 22–38, Jaipur",
    offer: "Free pickup on first shoe-laundry order",
    targetLocation: "Vaishali Nagar, Ajmer Road",
    budget: 28000,
    budgetApproved: true,
    files: ["influencer-brief.pdf"],
    references: ["Pune reel that performed well"],
    rmNotes: "Owner can host the shoot on any weekday morning.",
    returnedCount: 0,
    linked: [
      { kind: "Influencer", id: "INF-551", label: "Aarohi Sharma — reel (overdue)" },
      { kind: "Influencer", id: "INF-552", label: "Pink City Foodie — story series" },
    ],
    events: [
      { at: "2026-07-29", actor: "Ritika Bansal (RM)", detail: "Request submitted for STR-1042" },
      { at: "2026-07-30", actor: "Nikhil Arora", detail: "Accepted — 2 influencers planned" },
      { at: "2026-08-01", actor: "Nikhil Arora", detail: "Work started — briefs shared, INF-551 & INF-552 linked" },
    ],
  },
  {
    id: "REQ-3376",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    state: "Maharashtra",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    type: "Instagram Profile Update",
    priority: "medium",
    stage: "information_required",
    submittedOn: "2026-07-28",
    dueDate: "2026-08-12",
    startDate: "2026-08-08",
    nextAction: "Waiting on RM: store photographs and contact details",
    platform: "Instagram",
    problem: "New store has no social presence before launch.",
    outcome: "Instagram profile live with bio, highlights and 6 launch posts.",
    audience: "Baner, Balewadi residents",
    offer: "Launch week 25% off",
    targetLocation: "Baner, Balewadi",
    budget: 12000,
    budgetApproved: true,
    files: [],
    references: ["Lucknow launch grid"],
    rmNotes: "Store interiors still being finished.",
    returnedCount: 0,
    linked: [],
    events: [
      { at: "2026-07-28", actor: "Aakash Menon (RM)", detail: "Request submitted for STR-1134" },
      { at: "2026-07-30", actor: "Nikhil Arora", detail: "Accepted" },
      { at: "2026-08-01", actor: "Nikhil Arora", detail: "Information requested: store photographs, contact details" },
    ],
  },
  {
    id: "REQ-3372",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    rm: "Sanya Kapoor",
    executive: "Nikhil Arora",
    type: "Lead Generation Campaign",
    priority: "high",
    stage: "submitted_for_review",
    submittedOn: "2026-07-20",
    dueDate: "2026-08-05",
    startDate: "2026-07-22",
    nextAction: "Awaiting Relationship Manager review of completion report",
    platform: "Meta Ads",
    problem: "Store below break-even on monthly orders.",
    outcome: "100 qualified leads in 15 days.",
    audience: "Households 25–50 within 5 km",
    offer: "Monsoon care package ₹699",
    targetLocation: "Gomti Nagar — 5 km",
    budget: 45000,
    budgetApproved: true,
    files: ["monsoon-creatives.zip"],
    references: [],
    rmNotes: "Owner wants weekly lead sheet.",
    returnedCount: 0,
    linked: [
      { kind: "Campaign", id: "CMP-8834", label: "Meta lead-gen — Monsoon care" },
      { kind: "Lead", id: "LED-19042", label: "64 leads captured (no duplicates)" },
    ],
    report: {
      workDone: "Meta lead-gen campaign run for 15 days with 3 creative sets; 64 leads handed to store.",
      linkedId: "CMP-8834",
      completedOn: "2026-08-05",
      proof: "campaign-report-CMP-8834.pdf",
      budgetUsed: 41800,
      leads: 64,
      sales: 186000,
      pending: "Store to confirm 6 uncontacted leads",
      note: "CPL ₹653; recommend continuing at ₹30k/month.",
    },
    events: [
      { at: "2026-07-20", actor: "Sanya Kapoor (RM)", detail: "Request submitted for STR-1088" },
      { at: "2026-07-21", actor: "Nikhil Arora", detail: "Accepted — campaign plan confirmed" },
      { at: "2026-07-22", actor: "Nikhil Arora", detail: "CMP-8834 launched (creative approved)" },
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "Completion report submitted for review" },
    ],
  },
  {
    id: "REQ-3364",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    city: "Surat",
    state: "Gujarat",
    rm: "Yash Malhotra",
    executive: "Nikhil Arora",
    type: "Graphic Required",
    priority: "medium",
    stage: "correction_required",
    submittedOn: "2026-07-18",
    dueDate: "2026-08-04",
    startDate: "2026-07-19",
    nextAction: "Correct offer wording and re-submit creative CRV-4471",
    platform: "None",
    problem: "Store display banner outdated.",
    outcome: "3 banner sizes with correct offer and store address.",
    audience: "Walk-in customers",
    offer: "Flat ₹200 off above ₹1499",
    targetLocation: "Adajan store front",
    budget: 0,
    budgetApproved: true,
    files: ["banner-v1.png"],
    references: [],
    rmNotes: "Offer wording was wrong in v1 — should read above ₹1499, not ₹999.",
    returnedCount: 1,
    linked: [{ kind: "Creative", id: "CRV-4471", label: "Store banner set v1 (correction)" }],
    events: [
      { at: "2026-07-18", actor: "Yash Malhotra (RM)", detail: "Request submitted for STR-1103" },
      { at: "2026-07-19", actor: "Nikhil Arora", detail: "Accepted; CRV-4471 created" },
      { at: "2026-08-01", actor: "Nikhil Arora", detail: "Completion report submitted" },
      { at: "2026-08-03", actor: "Yash Malhotra (RM)", detail: "Correction requested: offer wording incorrect" },
    ],
  },
  {
    id: "REQ-3358",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    type: "Offer Campaign",
    priority: "low",
    stage: "closed",
    submittedOn: "2026-07-02",
    dueDate: "2026-07-20",
    startDate: "2026-07-04",
    nextAction: "—",
    platform: "Google Ads",
    problem: "Weekday order volume low.",
    outcome: "Weekday offer campaign, 40 extra orders.",
    audience: "Working professionals",
    offer: "Weekday 20% off pickup",
    targetLocation: "Vijay Nagar — 4 km",
    budget: 25000,
    budgetApproved: true,
    files: ["weekday-offer.zip"],
    references: [],
    rmNotes: "—",
    returnedCount: 0,
    linked: [
      { kind: "Campaign", id: "CMP-8802", label: "Google search — weekday offer" },
      { kind: "Lead", id: "LED-18771", label: "58 leads, 34 orders" },
    ],
    report: {
      workDone: "Google search campaign for weekday offer; 58 leads, 34 orders.",
      linkedId: "CMP-8802",
      completedOn: "2026-07-19",
      proof: "campaign-report-CMP-8802.pdf",
      budgetUsed: 23600,
      leads: 58,
      sales: 214000,
      pending: "None",
      note: "CPL ₹407, cost per sale ₹694.",
    },
    events: [
      { at: "2026-07-02", actor: "Aakash Menon (RM)", detail: "Request submitted for STR-1067" },
      { at: "2026-07-03", actor: "Nikhil Arora", detail: "Accepted" },
      { at: "2026-07-19", actor: "Nikhil Arora", detail: "Completion report submitted" },
      { at: "2026-07-20", actor: "Aakash Menon (RM)", detail: "Completion approved — request closed" },
    ],
  },
  {
    id: "REQ-3351",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    state: "Maharashtra",
    rm: "Ritika Bansal",
    executive: "Nikhil Arora",
    type: "YouTuber Collaboration",
    priority: "medium",
    stage: "returned",
    submittedOn: "2026-06-28",
    dueDate: "2026-07-15",
    startDate: "2026-07-01",
    nextAction: "Returned to RM — management approval required for ₹1.2L budget",
    platform: "YouTube",
    problem: "Low brand awareness in Pune.",
    outcome: "One long-form YouTube review video.",
    audience: "Pune city viewers",
    offer: "—",
    targetLocation: "Pune city",
    budget: 120000,
    budgetApproved: false,
    files: [],
    references: [],
    rmNotes: "Creator quoted ₹1.2L.",
    returnedCount: 2,
    linked: [],
    events: [
      { at: "2026-06-28", actor: "Ritika Bansal (RM)", detail: "Request submitted for STR-1134" },
      { at: "2026-06-30", actor: "Nikhil Arora", detail: "Returned — management approval required" },
      { at: "2026-07-05", actor: "Ritika Bansal (RM)", detail: "Re-submitted with same Request ID" },
      { at: "2026-07-07", actor: "Nikhil Arora", detail: "Returned again — budget approval still missing" },
    ],
  },
  {
    id: "REQ-3344",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    state: "Rajasthan",
    rm: "Ritika Bansal",
    executive: "Nikhil Arora",
    type: "Store Sales Improvement",
    priority: "high",
    stage: "blocked",
    submittedOn: "2026-07-25",
    dueDate: "2026-08-03",
    startDate: "2026-07-28",
    nextAction: "Blocked — creative not ready before campaign start date",
    platform: "Meta Ads",
    problem: "Premium garment care revenue flat for 2 months.",
    outcome: "Premium care campaign with 25 qualified leads.",
    audience: "High-income households, 30–55",
    offer: "Premium care trial ₹1299",
    targetLocation: "Vaishali Nagar, Mansarovar",
    budget: 30000,
    budgetApproved: true,
    files: [],
    references: [],
    rmNotes: "Owner keen to start immediately.",
    returnedCount: 0,
    linked: [{ kind: "Creative", id: "CRV-4488", label: "Premium care creative (in preparation)" }],
    events: [
      { at: "2026-07-25", actor: "Ritika Bansal (RM)", detail: "Request submitted for STR-1042" },
      { at: "2026-07-26", actor: "Nikhil Arora", detail: "Accepted" },
      { at: "2026-08-01", actor: "Nikhil Arora", detail: "Blocked — CRV-4488 not approved before start date" },
    ],
  },
];

export const isOverdue = (r: MarketingRequestFull) =>
  r.dueDate < TODAY &&
  !["approved", "completed", "closed", "cancelled"].includes(r.stage);

export const isOpen = (r: MarketingRequestFull) =>
  !["approved", "completed", "closed", "cancelled"].includes(r.stage);

export function attentionFlags(r: MarketingRequestFull): string[] {
  const flags: string[] = [];
  if ((r.priority === "urgent" || r.priority === "high") && ["submitted", "assigned"].includes(r.stage))
    flags.push("Urgent request not accepted");
  if (r.dueDate === TODAY && isOpen(r)) flags.push("Request due today");
  if (isOverdue(r)) flags.push("Request overdue");
  if (r.stage === "information_required") flags.push("Information pending from Relationship Manager");
  if (!r.budgetApproved && r.budget > 0) flags.push("Budget approval missing");
  if (r.linked.some((l) => l.kind === "Creative") && r.stage === "blocked")
    flags.push("Creative not ready");
  if (r.stage === "blocked" && r.startDate < TODAY) flags.push("Campaign start date missed");
  if (r.stage === "submitted_for_review") flags.push("Completed work awaiting Relationship Manager review");
  if (r.returnedCount >= 2) flags.push("Request returned multiple times");
  if (r.type === "Store Sales Improvement" && r.priority !== "low")
    flags.push("Store sales issue marked Critical");
  return flags;
}
