/**
 * Leads & Sales Results — marketing attribution records.
 *
 * Lineage: Store ID -> Campaign ID -> Creative ID / Collaboration ID -> Lead ID -> Order
 * A Lead ID is created ONCE at capture and never re-created during handover to Sales.
 * Marketing can read sales outcomes but never edits them.
 */

import type { Tone } from "./data";

export const LEADS_TODAY = "2026-08-06";

/* ------------------------------------------------------------------ filters */

export const DATE_RANGES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 Days" },
  { id: "last30", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "prev_month", label: "Previous Month" },
  { id: "custom", label: "Custom Date Range" },
] as const;
export type DateRangeId = (typeof DATE_RANGES)[number]["id"];

export const LEAD_SOURCES = [
  "Google Ads",
  "Meta Ads",
  "Google Business Profile",
  "Facebook Organic",
  "Instagram Organic",
  "Influencer or YouTuber",
  "Referral",
  "Other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_QUALITY = [
  "Qualified",
  "Unqualified",
  "Duplicate",
  "Invalid",
  "Spam",
  "Unable to Contact",
  "Pending Qualification",
] as const;
export type LeadQuality = (typeof LEAD_QUALITY)[number];

export const qualityMeta: Record<LeadQuality, { tone: Tone; reasonRequired: boolean }> = {
  Qualified: { tone: "healthy", reasonRequired: false },
  Unqualified: { tone: "overdue", reasonRequired: true },
  Duplicate: { tone: "attention", reasonRequired: true },
  Invalid: { tone: "overdue", reasonRequired: true },
  Spam: { tone: "overdue", reasonRequired: true },
  "Unable to Contact": { tone: "attention", reasonRequired: false },
  "Pending Qualification": { tone: "draft", reasonRequired: false },
};

/* ------------------------------------------------------------- lead records */

export const HANDOVER_FLOW = [
  "Lead Captured",
  "Duplicate Check",
  "Store Identified",
  "Sent to Sales Head",
  "Assigned to Sales Executive",
  "Contacted",
  "Qualified / Unqualified",
  "Won / Lost",
] as const;
export type HandoverStage = (typeof HANDOVER_FLOW)[number];

export type SalesStatus =
  | "awaiting_assignment"
  | "assigned"
  | "contacted"
  | "follow_up"
  | "won"
  | "lost"
  | "no_update";

export const salesStatusMeta: Record<SalesStatus, { label: string; tone: Tone }> = {
  awaiting_assignment: { label: "Awaiting Assignment", tone: "attention" },
  assigned: { label: "Assigned", tone: "active" },
  contacted: { label: "Contacted", tone: "active" },
  follow_up: { label: "Follow-up in Progress", tone: "active" },
  won: { label: "Won", tone: "healthy" },
  lost: { label: "Lost", tone: "overdue" },
  no_update: { label: "No Sales Update", tone: "overdue" },
};

export type LeadRecord = {
  id: string;
  receivedAt: string; // date + time
  customer: string;
  phone: string; // masked in UI unless permitted
  city: string;
  storeId: string;
  storeName: string;
  enquiryType: "Store Service" | "Company Franchise";
  firstSource: LeadSource;
  latestSource: LeadSource;
  campaignId?: string;
  campaignName?: string;
  creativeId?: string;
  collabId?: string;
  trackingRef?: string;
  requirement: string;
  assignedTo?: string;
  assignedRole?: "Sales Head" | "Sales Executive";
  handoverAt?: string;
  stage: HandoverStage;
  salesStatus: SalesStatus;
  quality: LeadQuality;
  qualityReason?: string;
  orderStatus: "Order Placed" | "No Order" | "Pending";
  lostReason?: string;
  lastCrmUpdate?: string;
  salesNotes?: string;
  contacted: boolean;
  manualEntry?: boolean;
  touchHistory: { at: string; source: LeadSource; detail: string }[];
};

export const LEADS: LeadRecord[] = [
  {
    id: "LEAD-24118",
    receivedAt: "2026-08-06 09:42",
    customer: "Ankit Verma",
    phone: "+91 98290 55120",
    city: "Jaipur",
    storeId: "STR-1042",
    storeName: "Clean Craft Jaipur — Vaishali",
    enquiryType: "Store Service",
    firstSource: "Google Ads",
    latestSource: "Google Ads",
    campaignId: "CMP-8821",
    campaignName: "Jaipur Dry Cleaning — Search",
    creativeId: "CRV-4410",
    trackingRef: "jpr-search-aug",
    requirement: "3 suits dry clean + pickup at home",
    assignedTo: "Rohit Saini",
    assignedRole: "Sales Executive",
    handoverAt: "2026-08-06 09:45",
    stage: "Assigned to Sales Executive",
    salesStatus: "assigned",
    quality: "Pending Qualification",
    orderStatus: "Pending",
    lastCrmUpdate: "2026-08-06 09:45",
    contacted: false,
    touchHistory: [{ at: "2026-08-06 09:42", source: "Google Ads", detail: "Search ad — form fill" }],
  },
  {
    id: "LEAD-24112",
    receivedAt: "2026-08-06 08:10",
    customer: "Priya Nair",
    phone: "+91 99770 41883",
    city: "Indore",
    storeId: "STR-1067",
    storeName: "Clean Craft Indore — Vijay Nagar",
    enquiryType: "Store Service",
    firstSource: "Meta Ads",
    latestSource: "Instagram Organic",
    campaignId: "CMP-8834",
    campaignName: "Indore Monsoon Offer — Leads",
    creativeId: "CRV-4462",
    requirement: "Monsoon offer — 6 sarees",
    stage: "Sent to Sales Head",
    salesStatus: "awaiting_assignment",
    quality: "Pending Qualification",
    orderStatus: "Pending",
    contacted: false,
    touchHistory: [
      { at: "2026-08-06 08:10", source: "Meta Ads", detail: "Instant form — monsoon offer" },
      { at: "2026-08-06 10:20", source: "Instagram Organic", detail: "DM follow-up from customer" },
    ],
  },
  {
    id: "LEAD-24098",
    receivedAt: "2026-08-05 16:24",
    customer: "Sameer Khanna",
    phone: "+91 98110 20455",
    city: "Delhi",
    storeId: "COMPANY",
    storeName: "Company Franchise Enquiry",
    enquiryType: "Company Franchise",
    firstSource: "Google Ads",
    latestSource: "Google Ads",
    campaignId: "CMP-8802",
    campaignName: "Franchise Enquiry — Company Search",
    requirement: "Franchise enquiry — Delhi NCR, large-format opportunity",
    assignedTo: "Ashish Rathore (Sales Head)",
    assignedRole: "Sales Head",
    handoverAt: "2026-08-05 16:26",
    stage: "Contacted",
    salesStatus: "contacted",
    quality: "Qualified",
    orderStatus: "Pending",
    lastCrmUpdate: "2026-08-06 11:05",
    salesNotes: "Site shortlisting in Dwarka; second call on 08 Aug.",
    contacted: true,
    touchHistory: [{ at: "2026-08-05 16:24", source: "Google Ads", detail: "Franchise search campaign" }],
  },
  {
    id: "LEAD-24067",
    receivedAt: "2026-08-04 12:02",
    customer: "Kavya Iyer",
    phone: "+91 90040 77281",
    city: "Mumbai",
    storeId: "STR-1121",
    storeName: "Clean Craft Mumbai — Andheri West",
    enquiryType: "Store Service",
    firstSource: "Influencer or YouTuber",
    latestSource: "Influencer or YouTuber",
    collabId: "COL-2109",
    creativeId: "CRV-4487",
    trackingRef: "AAROHI10",
    requirement: "Bridal lehenga cleaning + storage",
    assignedTo: "Neha Pandey",
    assignedRole: "Sales Executive",
    handoverAt: "2026-08-04 12:15",
    stage: "Won / Lost",
    salesStatus: "won",
    quality: "Qualified",
    orderStatus: "Order Placed",
    lastCrmUpdate: "2026-08-05 18:40",
    salesNotes: "Promo code AAROHI10 used at billing.",
    contacted: true,
    touchHistory: [
      { at: "2026-08-04 12:02", source: "Influencer or YouTuber", detail: "Reel link in bio — COL-2109" },
    ],
  },
  {
    id: "LEAD-24041",
    receivedAt: "2026-08-03 10:31",
    customer: "Harshit Jain",
    phone: "+91 94250 63314",
    city: "Lucknow",
    storeId: "STR-1088",
    storeName: "Clean Craft Lucknow — Gomti Nagar",
    enquiryType: "Store Service",
    firstSource: "Google Business Profile",
    latestSource: "Google Business Profile",
    requirement: "Sofa cleaning at home",
    assignedTo: "Devansh Rao",
    assignedRole: "Sales Executive",
    handoverAt: "2026-08-03 10:40",
    stage: "Assigned to Sales Executive",
    salesStatus: "no_update",
    quality: "Pending Qualification",
    orderStatus: "Pending",
    lastCrmUpdate: "2026-08-03 10:40",
    contacted: false,
    touchHistory: [{ at: "2026-08-03 10:31", source: "Google Business Profile", detail: "Call button tap" }],
  },
  {
    id: "LEAD-24020",
    receivedAt: "2026-08-02 19:55",
    customer: "Ritu Shah",
    phone: "+91 96380 22110",
    city: "Surat",
    storeId: "STR-1103",
    storeName: "Clean Craft Surat — Adajan",
    enquiryType: "Store Service",
    firstSource: "Meta Ads",
    latestSource: "Meta Ads",
    campaignId: "CMP-8840",
    campaignName: "Surat Reopen Offer — Leads",
    creativeId: "CRV-4501",
    requirement: "Price enquiry only",
    assignedTo: "Bhavesh Patel",
    assignedRole: "Sales Executive",
    handoverAt: "2026-08-02 20:05",
    stage: "Qualified / Unqualified",
    salesStatus: "lost",
    quality: "Unqualified",
    qualityReason: "Outside service area — 22 km from store",
    orderStatus: "No Order",
    lostReason: "Out of service area",
    lastCrmUpdate: "2026-08-03 12:10",
    contacted: true,
    touchHistory: [{ at: "2026-08-02 19:55", source: "Meta Ads", detail: "Lead form — reopen offer" }],
  },
  {
    id: "LEAD-23998",
    receivedAt: "2026-08-01 14:12",
    customer: "Unknown",
    phone: "+91 00000 00000",
    city: "—",
    storeId: "STR-1134",
    storeName: "Clean Craft Nagpur — Dharampeth",
    enquiryType: "Store Service",
    firstSource: "Meta Ads",
    latestSource: "Meta Ads",
    campaignId: "CMP-8845",
    campaignName: "Nagpur Awareness — Reach",
    requirement: "—",
    stage: "Duplicate Check",
    salesStatus: "awaiting_assignment",
    quality: "Spam",
    qualityReason: "Invalid number pattern, repeated submissions",
    orderStatus: "No Order",
    contacted: false,
    touchHistory: [{ at: "2026-08-01 14:12", source: "Meta Ads", detail: "Form fill — invalid data" }],
  },
  {
    id: "LEAD-23960",
    receivedAt: "2026-07-30 11:48",
    customer: "Mohit Bhardwaj",
    phone: "+91 98730 41128",
    city: "Jaipur",
    storeId: "STR-1042",
    storeName: "Clean Craft Jaipur — Vaishali",
    enquiryType: "Store Service",
    firstSource: "Referral",
    latestSource: "Facebook Organic",
    requirement: "Monthly laundry package for family",
    assignedTo: "Rohit Saini",
    assignedRole: "Sales Executive",
    handoverAt: "2026-07-30 11:55",
    stage: "Won / Lost",
    salesStatus: "won",
    quality: "Qualified",
    orderStatus: "Order Placed",
    lastCrmUpdate: "2026-08-01 17:20",
    salesNotes: "Converted to monthly package; referred by existing customer.",
    contacted: true,
    touchHistory: [
      { at: "2026-07-30 11:48", source: "Referral", detail: "Referred by existing customer (first source kept)" },
      { at: "2026-07-31 09:10", source: "Facebook Organic", detail: "Page message about package pricing" },
    ],
  },
  {
    id: "LEAD-23944",
    receivedAt: "2026-07-29 17:05",
    customer: "Farhan Sheikh",
    phone: "+91 90233 55471",
    city: "Indore",
    storeId: "STR-1067",
    storeName: "Clean Craft Indore — Vijay Nagar",
    enquiryType: "Store Service",
    firstSource: "Google Ads",
    latestSource: "Google Ads",
    campaignId: "CMP-8834",
    campaignName: "Indore Monsoon Offer — Leads",
    requirement: "Curtain cleaning — 3 BHK",
    assignedTo: "Ishita Verma",
    assignedRole: "Sales Executive",
    handoverAt: "2026-07-29 17:12",
    stage: "Won / Lost",
    salesStatus: "won",
    quality: "Qualified",
    orderStatus: "Order Placed",
    lastCrmUpdate: "2026-07-31 10:02",
    contacted: true,
    touchHistory: [{ at: "2026-07-29 17:05", source: "Google Ads", detail: "Search ad — curtain cleaning" }],
  },
  {
    id: "LEAD-23902",
    receivedAt: "2026-07-27 13:37",
    customer: "Deepa Rawat",
    phone: "+91 97110 88342",
    city: "Lucknow",
    storeId: "STR-1088",
    storeName: "Clean Craft Lucknow — Gomti Nagar",
    enquiryType: "Store Service",
    firstSource: "Instagram Organic",
    latestSource: "Instagram Organic",
    requirement: "Shoe cleaning — 4 pairs",
    assignedTo: "Devansh Rao",
    assignedRole: "Sales Executive",
    handoverAt: "2026-07-27 13:50",
    stage: "Qualified / Unqualified",
    salesStatus: "follow_up",
    quality: "Unable to Contact",
    orderStatus: "Pending",
    lastCrmUpdate: "2026-07-30 16:15",
    salesNotes: "Three call attempts, phone unreachable.",
    contacted: true,
    touchHistory: [{ at: "2026-07-27 13:37", source: "Instagram Organic", detail: "Story reply" }],
  },
  {
    id: "LEAD-23880",
    receivedAt: "2026-07-25 09:20",
    customer: "Nitin Chaudhary",
    phone: "+91 90050 33217",
    city: "Mumbai",
    storeId: "STR-1121",
    storeName: "Clean Craft Mumbai — Andheri West",
    enquiryType: "Store Service",
    firstSource: "Meta Ads",
    latestSource: "Meta Ads",
    campaignId: "CMP-8829",
    campaignName: "Mumbai Premium Care — Leads",
    creativeId: "CRV-4433",
    requirement: "Premium suit care — 5 pieces monthly",
    assignedTo: "Neha Pandey",
    assignedRole: "Sales Executive",
    handoverAt: "2026-07-25 09:28",
    stage: "Won / Lost",
    salesStatus: "won",
    quality: "Qualified",
    orderStatus: "Order Placed",
    lastCrmUpdate: "2026-07-28 12:40",
    contacted: true,
    touchHistory: [{ at: "2026-07-25 09:20", source: "Meta Ads", detail: "Lead form — premium care" }],
  },
  {
    id: "LEAD-23845",
    receivedAt: "2026-07-22 15:44",
    customer: "Ayesha Qureshi",
    phone: "+91 98220 71104",
    city: "Nagpur",
    storeId: "STR-1134",
    storeName: "Clean Craft Nagpur — Dharampeth",
    enquiryType: "Store Service",
    firstSource: "Google Business Profile",
    latestSource: "Google Business Profile",
    requirement: "Blanket cleaning — 4 pieces",
    assignedTo: "Sagar Deshmukh",
    assignedRole: "Sales Executive",
    handoverAt: "2026-07-22 15:50",
    stage: "Won / Lost",
    salesStatus: "lost",
    quality: "Qualified",
    orderStatus: "No Order",
    lostReason: "Price higher than local competitor",
    lastCrmUpdate: "2026-07-24 11:30",
    contacted: true,
    touchHistory: [{ at: "2026-07-22 15:44", source: "Google Business Profile", detail: "Message from profile" }],
  },
];

/* --------------------------------------------------------- store attribution */

export type StoreResult = {
  storeId: string;
  store: string;
  city: string;
  rm: string;
  executive: string;
  leads: number;
  qualified: number;
  orders: number;
  targetOrders: number;
  status: "good" | "watch" | "poor";
  nextAction: string;
};

export const STORE_RESULTS: StoreResult[] = [
  { storeId: "STR-1042", store: "Clean Craft Jaipur — Vaishali", city: "Jaipur", rm: "Ritika Bansal", executive: "Nikhil Arora", leads: 142, qualified: 92, orders: 51, targetOrders: 45, status: "good", nextAction: "Increase reach on best-performing search campaign" },
  { storeId: "STR-1067", store: "Clean Craft Indore — Vijay Nagar", city: "Indore", rm: "Aakash Menon", executive: "Nikhil Arora", leads: 118, qualified: 74, orders: 39, targetOrders: 40, status: "good", nextAction: "Refresh monsoon creative before 15 Aug" },
  { storeId: "STR-1088", store: "Clean Craft Lucknow — Gomti Nagar", city: "Lucknow", rm: "Sanya Kapoor", executive: "Nikhil Arora", leads: 64, qualified: 28, orders: 11, targetOrders: 35, status: "watch", nextAction: "Review lead form questions — high unqualified rate" },
  { storeId: "STR-1103", store: "Clean Craft Surat — Adajan", city: "Surat", rm: "Yash Malhotra", executive: "Nikhil Arora", leads: 38, qualified: 12, orders: 4, targetOrders: 30, status: "poor", nextAction: "Tighten service-area targeting and pause weak ad set" },
  { storeId: "STR-1121", store: "Clean Craft Mumbai — Andheri West", city: "Mumbai", rm: "Ritika Bansal", executive: "Nikhil Arora", leads: 96, qualified: 61, orders: 34, targetOrders: 35, status: "good", nextAction: "Repeat influencer collaboration that drove orders" },
  { storeId: "STR-1134", store: "Clean Craft Nagpur — Dharampeth", city: "Nagpur", rm: "Aakash Menon", executive: "Nikhil Arora", leads: 52, qualified: 21, orders: 9, targetOrders: 25, status: "watch", nextAction: "Ask store to confirm order updates in Sales CRM" },
  { storeId: "STR-1149", store: "Clean Craft Kanpur — Swaroop Nagar", city: "Kanpur", rm: "Sanya Kapoor", executive: "Nikhil Arora", leads: 18, qualified: 4, orders: 0, targetOrders: 20, status: "poor", nextAction: "No orders — escalate to manager for review" },
];

/* -------------------------------------------------------- source attribution */

export type SourceResult = {
  source: LeadSource;
  leads: number;
  qualified: number;
  orders: number;
  tracked: boolean;
};

export const SOURCE_RESULTS: SourceResult[] = [
  { source: "Google Ads", leads: 214, qualified: 138, orders: 82, tracked: true },
  { source: "Meta Ads", leads: 186, qualified: 96, orders: 48, tracked: true },
  { source: "Google Business Profile", leads: 74, qualified: 41, orders: 22, tracked: true },
  { source: "Facebook Organic", leads: 22, qualified: 9, orders: 4, tracked: false },
  { source: "Instagram Organic", leads: 31, qualified: 12, orders: 5, tracked: false },
  { source: "Influencer or YouTuber", leads: 58, qualified: 34, orders: 19, tracked: true },
  { source: "Referral", leads: 24, qualified: 18, orders: 12, tracked: true },
  { source: "Other", leads: 19, qualified: 6, orders: 2, tracked: false },
];

/* -------------------------------------------------------- campaign results */

export type CampaignResult = {
  campaignId: string;
  name: string;
  storeId: string;
  platform: "Google Ads" | "Meta Ads" | "YouTube";
  objective: string;
  startDate: string;
  endDate?: string;
  leads: number;
  qualified: number;
  orders: number;
  status: "Running" | "Paused" | "Completed" | "Needs Review";
};

export const CAMPAIGN_RESULTS: CampaignResult[] = [
  { campaignId: "CMP-8821", name: "Jaipur Dry Cleaning — Search", storeId: "STR-1042", platform: "Google Ads", objective: "Lead generation", startDate: "2026-07-01", leads: 96, qualified: 64, orders: 38, status: "Running" },
  { campaignId: "CMP-8829", name: "Mumbai Premium Care — Leads", storeId: "STR-1121", platform: "Meta Ads", objective: "Lead generation", startDate: "2026-07-05", leads: 74, qualified: 48, orders: 27, status: "Running" },
  { campaignId: "CMP-8834", name: "Indore Monsoon Offer — Leads", storeId: "STR-1067", platform: "Meta Ads", objective: "Offer promotion", startDate: "2026-07-10", endDate: "2026-08-15", leads: 82, qualified: 52, orders: 29, status: "Running" },
  { campaignId: "CMP-8840", name: "Surat Reopen Offer — Leads", storeId: "STR-1103", platform: "Meta Ads", objective: "Offer promotion", startDate: "2026-07-18", leads: 34, qualified: 11, orders: 4, status: "Needs Review" },
  { campaignId: "CMP-8845", name: "Nagpur Awareness — Reach", storeId: "STR-1134", platform: "Meta Ads", objective: "Store awareness", startDate: "2026-07-20", leads: 26, qualified: 8, orders: 3, status: "Paused" },
  { campaignId: "CMP-8802", name: "Franchise Enquiry — Company Search", storeId: "COMPANY", platform: "Google Ads", objective: "Franchise enquiries", startDate: "2026-06-01", leads: 64, qualified: 38, orders: 6, status: "Running" },
  { campaignId: "CMP-8788", name: "Kanpur Launch — Search", storeId: "STR-1149", platform: "Google Ads", objective: "Lead generation", startDate: "2026-06-20", endDate: "2026-07-31", leads: 18, qualified: 4, orders: 0, status: "Completed" },
];

/* ------------------------------------------------------------------- funnel */

export type FunnelStage = { label: string; value: number; previous: number };

export const FUNNEL: FunnelStage[] = [
  { label: "Reach", value: 486000, previous: 442000 },
  { label: "Clicks", value: 18420, previous: 17100 },
  { label: "Enquiries", value: 628, previous: 574 },
  { label: "Qualified Leads", value: 354, previous: 318 },
  { label: "Orders", value: 194, previous: 168 },
];

/* ----------------------------------------------------------- offline entries */

export type OfflineResult = {
  id: string;
  storeId: string;
  reference: string;
  orderDate: string;
  leadId?: string;
  sourceOrPromo: string;
  proof: string;
  submittedBy: string;
  verification: "pending" | "verified" | "rejected";
  verifiedBy?: string;
};

export const OFFLINE_RESULTS: OfflineResult[] = [
  { id: "OFF-3011", storeId: "STR-1042", reference: "INV-JPR-2281", orderDate: "2026-08-04", leadId: "LEAD-23960", sourceOrPromo: "Promo code JPRAUG", proof: "Bill photo + POS screenshot", submittedBy: "Nikhil Arora", verification: "verified", verifiedBy: "Accounts — Pooja Nanda" },
  { id: "OFF-3014", storeId: "STR-1121", reference: "INV-MUM-8842", orderDate: "2026-08-05", leadId: "LEAD-24067", sourceOrPromo: "Promo code AAROHI10", proof: "Bill photo", submittedBy: "Nikhil Arora", verification: "pending" },
  { id: "OFF-3015", storeId: "STR-1067", reference: "WALK-IN-1120", orderDate: "2026-08-05", sourceOrPromo: "GMB offer post", proof: "Store register photo", submittedBy: "Store Manager — Indore", verification: "pending" },
];

/* ------------------------------------------------------------------- helpers */

export function safeDiv(a: number, b: number) {
  return b > 0 ? a / b : 0;
}
export function pct(a: number, b: number) {
  return Math.round(safeDiv(a, b) * 1000) / 10;
}
export function maskPhone(phone: string) {
  const digits = phone.replace(/\s/g, "");
  return `${digits.slice(0, 6)}•••••${digits.slice(-2)}`;
}

export const statusMeta: Record<StoreResult["status"], { label: string; tone: Tone }> = {
  good: { label: "Good", tone: "healthy" },
  watch: { label: "Needs Attention", tone: "attention" },
  poor: { label: "Poor", tone: "overdue" },
};

/* -------------------------------------------------------------------- alerts */

export type LeadAlert = {
  id: string;
  severity: "high" | "medium";
  title: string;
  detail: string;
  ref?: string;
};

export function leadAlerts(): LeadAlert[] {
  const out: LeadAlert[] = [];

  LEADS.forEach((l) => {
    if (!l.assignedTo && l.quality !== "Spam") {
      out.push({ id: `${l.id}-unassigned`, severity: "high", title: "Lead not assigned", detail: `${l.id} — ${l.storeName} is waiting with the Sales Head.`, ref: l.id });
    }
    if (l.assignedTo && !l.contacted && l.salesStatus !== "won") {
      out.push({ id: `${l.id}-nocontact`, severity: "high", title: "Lead not contacted within SLA", detail: `${l.id} assigned to ${l.assignedTo} — no contact recorded yet.`, ref: l.id });
    }
    if (l.salesStatus === "no_update") {
      out.push({ id: `${l.id}-noupdate`, severity: "medium", title: "Sales outcome not updated", detail: `${l.id} has had no Sales CRM update since ${l.lastCrmUpdate ?? "handover"}.`, ref: l.id });
    }
    if (!l.campaignId && !l.collabId && l.firstSource !== "Referral" && l.firstSource !== "Google Business Profile") {
      out.push({ id: `${l.id}-attr`, severity: "medium", title: "Tracking or attribution missing", detail: `${l.id} has no Campaign ID or Collaboration ID recorded.`, ref: l.id });
    }
  });

  STORE_RESULTS.forEach((s) => {
    if (s.leads > 40 && s.qualified < 6) {
      out.push({ id: `${s.storeId}-lowqual`, severity: "high", title: "High lead volume with few qualified leads", detail: `${s.storeId} received ${s.leads} leads with only ${s.qualified} qualified.`, ref: s.storeId });
    }
    if (s.orders === 0 && s.leads > 0) {
      out.push({ id: `${s.storeId}-noorders`, severity: "high", title: "Store receiving leads but no orders", detail: `${s.storeId} received ${s.leads} leads and reported 0 orders.`, ref: s.storeId });
    }
    if (s.targetOrders > 0 && pct(s.orders, s.targetOrders) < 50) {
      out.push({ id: `${s.storeId}-target`, severity: "medium", title: "Below target order achievement", detail: `${s.storeId} achieved ${pct(s.orders, s.targetOrders)}% of its order target.`, ref: s.storeId });
    }
  });

  const spam = LEADS.filter((l) => l.quality === "Spam" || l.quality === "Duplicate").length;
  if (spam >= 1) {
    out.push({ id: "quality-drop", severity: "medium", title: "Duplicate / spam lead volume increasing", detail: `${spam} lead(s) in this period marked duplicate or spam — check form and targeting.` });
  }

  OFFLINE_RESULTS.filter((o) => o.verification === "pending").forEach((o) =>
    out.push({ id: `${o.id}-verify`, severity: "medium", title: "Manual result awaiting verification", detail: `${o.id} (${o.reference}) submitted by ${o.submittedBy}.`, ref: o.id }),
  );

  return out;
}

/* ------------------------------------------------- performance data (no KPI) */

export const LEADS_PERFORMANCE_PREP: { label: string; value: string; note: string }[] = [
  { label: "Leads generated", value: "628", note: "Marketing-attributed enquiries in period" },
  { label: "Qualified-lead rate", value: "56.4%", note: "Qualified ÷ total leads (Sales confirmed)" },
  { label: "Orders generated", value: "194", note: "Orders linked to marketing leads" },
  { label: "Lead-to-order conversion", value: "30.9%", note: "Orders ÷ total leads" },
  { label: "% of monthly order target achieved", value: "86%", note: "Orders ÷ monthly order target" },
  { label: "Attribution completeness", value: "88%", note: "Leads with campaign / creative / creator ID" },
  { label: "Lead handover accuracy", value: "94%", note: "Correct store and no duplicate Lead IDs" },
  { label: "Campaigns improved after sales feedback", value: "6", note: "Changes made using Sales feedback" },
];

export const INTEGRATION_PLACEHOLDERS = [
  "Google Ads — clicks and lead sync",
  "Meta Ads — lead form sync",
  "Google Business Profile — calls, messages and direction requests",
  "WhatsApp Business — enquiry capture",
  "Sales CRM — lead qualification and outcome sync",
  "POS — verified order counts",
  "Website analytics — clicks and tracking links",
];
