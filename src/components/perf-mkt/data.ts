/**
 * Shared front-end record structures for the Performance Marketing Executive workspace.
 * Every record links back to a permanent Store ID; campaigns, leads and sales results
 * carry their own permanent IDs so no department creates duplicates on handover.
 *
 * Flow: Store ID -> Campaign ID -> Lead ID -> Order / Sale
 */

export type Tone = "healthy" | "active" | "attention" | "overdue" | "draft";

export const REQUEST_TYPES = [
  "Graphic Required",
  "Festival Promotion",
  "Offer Campaign",
  "Google Ads",
  "Meta Ads",
  "Google Business Profile",
  "Facebook Profile",
  "Instagram Profile",
  "Influencer Promotion",
  "YouTuber Collaboration",
  "Local Store Campaign",
  "Lead Generation",
  "Other",
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestStatus =
  | "new"
  | "accepted"
  | "in_progress"
  | "completed"
  | "returned";

export type MarketingRequest = {
  id: string;
  storeId: string;
  store: string;
  type: RequestType;
  requestedBy: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: RequestStatus;
  detail: string;
};

export type StoreCard = {
  id: string;
  name: string;
  city: string;
  rm: string;
  marketingStatus: "healthy" | "attention" | "declining" | "setup";
  activeCampaigns: number;
  leadsThisMonth: number;
  salesGenerated: number;
  adSpend: number;
  pendingRequests: number;
};

export type Campaign = {
  id: string;
  name: string;
  storeId: string;
  store: string;
  platform: "Google Ads" | "Meta Ads";
  objective: string;
  budget: number;
  spend: number;
  leads: number;
  qualified: number;
  sales: number;
  status:
    | "running"
    | "awaiting_approval"
    | "low_balance"
    | "needs_optimisation"
    | "completed";
  startDate: string;
  owner: string;
  creativeReady: boolean;
};

export const EXECUTIVE = {
  name: "Nikhil Arora",
  role: "Performance Marketing Executive",
};

export const STORES: StoreCard[] = [
  {
    id: "STR-1042",
    name: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    rm: "Ritika Bansal",
    marketingStatus: "healthy",
    activeCampaigns: 3,
    leadsThisMonth: 142,
    salesGenerated: 486000,
    adSpend: 62000,
    pendingRequests: 1,
  },
  {
    id: "STR-1067",
    name: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    rm: "Aakash Menon",
    marketingStatus: "healthy",
    activeCampaigns: 2,
    leadsThisMonth: 118,
    salesGenerated: 372000,
    adSpend: 48500,
    pendingRequests: 2,
  },
  {
    id: "STR-1088",
    name: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    rm: "Sanya Kapoor",
    marketingStatus: "attention",
    activeCampaigns: 2,
    leadsThisMonth: 64,
    salesGenerated: 158000,
    adSpend: 51000,
    pendingRequests: 3,
  },
  {
    id: "STR-1103",
    name: "Clean Craft Surat — Adajan",
    city: "Surat",
    rm: "Yash Malhotra",
    marketingStatus: "declining",
    activeCampaigns: 1,
    leadsThisMonth: 38,
    salesGenerated: 96000,
    adSpend: 44000,
    pendingRequests: 2,
  },
  {
    id: "STR-1121",
    name: "Clean Craft Mumbai — Andheri West",
    city: "Mumbai",
    rm: "Ritika Bansal",
    marketingStatus: "healthy",
    activeCampaigns: 3,
    leadsThisMonth: 176,
    salesGenerated: 612000,
    adSpend: 88000,
    pendingRequests: 0,
  },
  {
    id: "STR-1134",
    name: "Clean Craft Pune — Baner",
    city: "Pune",
    rm: "Aakash Menon",
    marketingStatus: "setup",
    activeCampaigns: 0,
    leadsThisMonth: 12,
    salesGenerated: 0,
    adSpend: 8000,
    pendingRequests: 2,
  },
  {
    id: "STR-1149",
    name: "Clean Craft Bhopal — Arera Colony",
    city: "Bhopal",
    rm: "Sanya Kapoor",
    marketingStatus: "healthy",
    activeCampaigns: 2,
    leadsThisMonth: 91,
    salesGenerated: 264000,
    adSpend: 39000,
    pendingRequests: 1,
  },
];

export const REQUESTS: MarketingRequest[] = [
  {
    id: "REQ-3391",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    type: "Festival Promotion",
    requestedBy: "Sanya Kapoor",
    priority: "high",
    dueDate: "2026-08-07",
    status: "new",
    detail:
      "Raksha Bandhan offer creatives + Meta Ads for dry cleaning combo. Store wants 20% off banner set.",
  },
  {
    id: "REQ-3388",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    type: "Google Ads",
    requestedBy: "Yash Malhotra",
    priority: "high",
    dueDate: "2026-08-06",
    status: "new",
    detail: "Enquiries dropped 34% — restart local search campaign with revised keywords.",
  },
  {
    id: "REQ-3384",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    type: "Google Business Profile",
    requestedBy: "Aakash Menon",
    priority: "medium",
    dueDate: "2026-08-09",
    status: "accepted",
    detail: "Update timings, add 12 new store photos, respond to 4 pending reviews.",
  },
  {
    id: "REQ-3379",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    type: "Influencer Promotion",
    requestedBy: "Ritika Bansal",
    priority: "medium",
    dueDate: "2026-08-11",
    status: "in_progress",
    detail: "2 local lifestyle influencers for shoe-laundry reel series.",
  },
  {
    id: "REQ-3376",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    type: "Instagram Profile",
    requestedBy: "Aakash Menon",
    priority: "low",
    dueDate: "2026-08-12",
    status: "new",
    detail: "New store launch — set up Instagram profile, bio, highlights and first 6 posts.",
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "CMP-8821",
    name: "Jaipur Monsoon Dry Clean Offer",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    platform: "Google Ads",
    objective: "Store enquiries",
    budget: 45000,
    spend: 31200,
    leads: 86,
    qualified: 54,
    sales: 248000,
    status: "running",
    startDate: "2026-07-18",
    owner: "Nikhil Arora",
    creativeReady: true,
  },
  {
    id: "CMP-8834",
    name: "Mumbai Premium Laundry Leads",
    storeId: "STR-1121",
    store: "Clean Craft Mumbai — Andheri West",
    platform: "Meta Ads",
    objective: "Lead generation",
    budget: 60000,
    spend: 52400,
    leads: 121,
    qualified: 74,
    sales: 386000,
    status: "running",
    startDate: "2026-07-12",
    owner: "Nikhil Arora",
    creativeReady: true,
  },
  {
    id: "CMP-8847",
    name: "Lucknow Festival Combo",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    platform: "Meta Ads",
    objective: "Offer promotion",
    budget: 30000,
    spend: 28650,
    leads: 22,
    qualified: 7,
    sales: 42000,
    status: "needs_optimisation",
    startDate: "2026-07-24",
    owner: "Nikhil Arora",
    creativeReady: true,
  },
  {
    id: "CMP-8852",
    name: "Surat Local Search Revival",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    platform: "Google Ads",
    objective: "Store enquiries",
    budget: 25000,
    spend: 24100,
    leads: 14,
    qualified: 4,
    sales: 18000,
    status: "low_balance",
    startDate: "2026-07-28",
    owner: "Nikhil Arora",
    creativeReady: true,
  },
  {
    id: "CMP-8860",
    name: "Pune Launch Awareness",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    platform: "Meta Ads",
    objective: "Store launch",
    budget: 35000,
    spend: 0,
    leads: 0,
    qualified: 0,
    sales: 0,
    status: "awaiting_approval",
    startDate: "2026-08-08",
    owner: "Nikhil Arora",
    creativeReady: false,
  },
  {
    id: "CMP-8801",
    name: "Bhopal Sofa Cleaning Push",
    storeId: "STR-1149",
    store: "Clean Craft Bhopal — Arera Colony",
    platform: "Google Ads",
    objective: "Service enquiries",
    budget: 20000,
    spend: 19800,
    leads: 61,
    qualified: 38,
    sales: 186000,
    status: "completed",
    startDate: "2026-06-30",
    owner: "Nikhil Arora",
    creativeReady: true,
  },
];

export const CREATIVES = {
  pending: 4,
  preparing: 3,
  awaitingApproval: 2,
  approved: 26,
  correction: 1,
};

export type ProfileHealthRow = {
  storeId: string;
  store: string;
  gmbComplete: boolean;
  verificationPending: boolean;
  infoIncomplete: boolean;
  facebookDue: boolean;
  instagramDue: boolean;
  reviewsToAnswer: number;
  detailsReported: boolean;
};

export const PROFILE_HEALTH: ProfileHealthRow[] = [
  {
    storeId: "STR-1042",
    store: "Jaipur — Vaishali",
    gmbComplete: true,
    verificationPending: false,
    infoIncomplete: false,
    facebookDue: false,
    instagramDue: true,
    reviewsToAnswer: 2,
    detailsReported: false,
  },
  {
    storeId: "STR-1067",
    store: "Indore — Vijay Nagar",
    gmbComplete: true,
    verificationPending: false,
    infoIncomplete: true,
    facebookDue: true,
    instagramDue: false,
    reviewsToAnswer: 4,
    detailsReported: false,
  },
  {
    storeId: "STR-1088",
    store: "Lucknow — Gomti Nagar",
    gmbComplete: true,
    verificationPending: false,
    infoIncomplete: false,
    facebookDue: true,
    instagramDue: true,
    reviewsToAnswer: 6,
    detailsReported: true,
  },
  {
    storeId: "STR-1134",
    store: "Pune — Baner",
    gmbComplete: false,
    verificationPending: true,
    infoIncomplete: true,
    facebookDue: true,
    instagramDue: true,
    reviewsToAnswer: 0,
    detailsReported: false,
  },
];

export type InfluencerActivity = {
  id: string;
  storeId: string;
  store: string;
  name: string;
  platform: "Instagram" | "YouTube";
  stage: "planned" | "awaiting_confirmation" | "content_due" | "published" | "payment_pending" | "results_pending";
  dueDate: string;
  followers: string;
};

export const INFLUENCERS: InfluencerActivity[] = [
  { id: "INF-551", storeId: "STR-1042", store: "Jaipur — Vaishali", name: "Aarohi Sharma", platform: "Instagram", stage: "content_due", dueDate: "2026-08-07", followers: "84K" },
  { id: "INF-552", storeId: "STR-1042", store: "Jaipur — Vaishali", name: "Pink City Foodie", platform: "Instagram", stage: "awaiting_confirmation", dueDate: "2026-08-09", followers: "126K" },
  { id: "INF-556", storeId: "STR-1121", store: "Mumbai — Andheri West", name: "Rohan Vlogs", platform: "YouTube", stage: "published", dueDate: "2026-08-02", followers: "310K" },
  { id: "INF-559", storeId: "STR-1067", store: "Indore — Vijay Nagar", name: "Indore Diaries", platform: "Instagram", stage: "payment_pending", dueDate: "2026-08-05", followers: "58K" },
  { id: "INF-561", storeId: "STR-1088", store: "Lucknow — Gomti Nagar", name: "Nawabi Lifestyle", platform: "Instagram", stage: "results_pending", dueDate: "2026-08-04", followers: "72K" },
  { id: "INF-564", storeId: "STR-1149", store: "Bhopal — Arera Colony", name: "Bhopal Bytes", platform: "YouTube", stage: "planned", dueDate: "2026-08-14", followers: "44K" },
];

export type PriorityItem = {
  id: string;
  label: string;
  count: number;
  tone: Tone;
};

export const TODAY_PRIORITIES: PriorityItem[] = [
  { id: "p1", label: "New RM requests awaiting acceptance", count: 3, tone: "attention" },
  { id: "p2", label: "Campaigns with budget or performance alerts", count: 2, tone: "overdue" },
  { id: "p3", label: "Google Business Profiles requiring updates", count: 3, tone: "attention" },
  { id: "p4", label: "Creatives required for active campaigns", count: 4, tone: "active" },
  { id: "p5", label: "Influencer activities awaiting confirmation", count: 1, tone: "attention" },
  { id: "p6", label: "New leads awaiting store or sales handover", count: 17, tone: "active" },
  { id: "p7", label: "Campaign reports due", count: 2, tone: "attention" },
  { id: "p8", label: "Overdue marketing tasks", count: 1, tone: "overdue" },
];

export const ALERTS: { id: string; label: string; tone: Tone; ref: string }[] = [
  { id: "a1", label: "Urgent RM request pending acceptance", tone: "overdue", ref: "REQ-3388 · STR-1103" },
  { id: "a2", label: "Campaign overspending against budget", tone: "overdue", ref: "CMP-8847 · STR-1088" },
  { id: "a3", label: "Campaign spending without leads", tone: "overdue", ref: "CMP-8852 · STR-1103" },
  { id: "a4", label: "Leads not handed over to store", tone: "attention", ref: "17 leads · 4 stores" },
  { id: "a5", label: "Store profile information incorrect", tone: "attention", ref: "STR-1088" },
  { id: "a6", label: "Google Business verification pending", tone: "attention", ref: "STR-1134" },
  { id: "a7", label: "Creative not ready before campaign start", tone: "attention", ref: "CMP-8860 · 08 Aug" },
  { id: "a8", label: "Influencer content overdue", tone: "overdue", ref: "INF-551 · STR-1042" },
  { id: "a9", label: "Campaign report missing", tone: "attention", ref: "CMP-8801 · July" },
  { id: "a10", label: "Store sales declining despite active marketing", tone: "overdue", ref: "STR-1103" },
  { id: "a11", label: "Unassigned store request", tone: "draft", ref: "REQ-3376 · STR-1134" },
];

export const LEADS_SUMMARY = {
  total: 641,
  qualified: 388,
  handedOver: 371,
  contacted: 344,
  orders: 212,
  salesAmount: 1988000,
  adSpend: 341000,
};

export const derived = {
  costPerLead: Math.round(LEADS_SUMMARY.adSpend / LEADS_SUMMARY.total),
  costPerSale: Math.round(LEADS_SUMMARY.adSpend / LEADS_SUMMARY.orders),
  conversion: Math.round((LEADS_SUMMARY.orders / LEADS_SUMMARY.total) * 1000) / 10,
};

export function inr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export const toneClasses: Record<Tone, string> = {
  healthy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  active: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  attention: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  overdue: "bg-red-500/10 text-red-600 border-red-500/30",
  draft: "bg-muted text-muted-foreground border-border",
};

export const requestStatusTone: Record<RequestStatus, Tone> = {
  new: "attention",
  accepted: "active",
  in_progress: "active",
  completed: "healthy",
  returned: "draft",
};

export const campaignStatusMeta: Record<Campaign["status"], { label: string; tone: Tone }> = {
  running: { label: "Running", tone: "healthy" },
  awaiting_approval: { label: "Awaiting approval", tone: "attention" },
  low_balance: { label: "Low balance", tone: "overdue" },
  needs_optimisation: { label: "Needs optimisation", tone: "overdue" },
  completed: { label: "Completed this month", tone: "active" },
};

export const influencerStageMeta: Record<InfluencerActivity["stage"], { label: string; tone: Tone }> = {
  planned: { label: "Planned", tone: "draft" },
  awaiting_confirmation: { label: "Awaiting confirmation", tone: "attention" },
  content_due: { label: "Content due", tone: "overdue" },
  published: { label: "Published", tone: "healthy" },
  payment_pending: { label: "Payment / approval pending", tone: "attention" },
  results_pending: { label: "Results pending", tone: "active" },
};
