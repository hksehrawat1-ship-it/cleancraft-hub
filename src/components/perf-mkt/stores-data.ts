/**
 * My Stores records for the Performance Marketing Executive workspace.
 * Every record below hangs off a permanent Store ID — requests, campaigns,
 * creatives, profiles, influencer activities, leads and sales results all
 * reference the same Store ID (no duplicated store copies per module).
 */

import { CAMPAIGNS, REQUESTS, STORES, type Tone } from "./data";

export type MarketingHealth = "healthy" | "needs_attention" | "critical" | "setup_pending";

export const healthMeta: Record<MarketingHealth, { label: string; tone: Tone }> = {
  healthy: { label: "Healthy", tone: "healthy" },
  needs_attention: { label: "Needs Attention", tone: "attention" },
  critical: { label: "Critical", tone: "overdue" },
  setup_pending: { label: "Setup Pending", tone: "draft" },
};

export type StoreProfile = {
  network: "Google Business Profile" | "Facebook" | "Instagram";
  url: string;
  setup: "complete" | "partial" | "not_started";
  lastUpdated: string;
  completeness: number;
  verification: "verified" | "pending" | "not_applicable";
  issue?: string;
};

export type StoreCreatives = {
  storeGraphics: number;
  festival: number;
  offer: number;
  campaign: number;
  awaitingApproval: number;
  correction: number;
};

export type StoreInfluencer = {
  id: string;
  name: string;
  platform: "Instagram" | "YouTube";
  activity: string;
  plannedDate: string;
  contentStatus: "not_started" | "in_progress" | "submitted" | "published" | "overdue";
  publishedLink?: string;
  leads: number;
  sales: number;
  status: string;
};

export type StoreLeadSales = {
  leads: number;
  qualified: number;
  handedOver: number;
  contacted: number;
  orders: number;
  salesAmount: number;
  adSpend: number;
};

export type StoreActivity = {
  at: string;
  actor: string;
  detail: string;
};

export type StoreDetail = {
  storeId: string;
  owner: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  state: string;
  launchDate: string;
  assignedDate: string;
  executive: string;
  operatingStatus: "live" | "opening" | "setup";
  objective: string;
  serviceArea: string;
  monthlyBudget: number;
  salesTrend: "up" | "flat" | "down";
  attention: string[];
  profiles: StoreProfile[];
  creatives: StoreCreatives;
  influencers: StoreInfluencer[];
  leadsSales: StoreLeadSales;
  activity: StoreActivity[];
};

export const STORE_DETAILS: Record<string, StoreDetail> = {
  "STR-1042": {
    storeId: "STR-1042",
    owner: "Rajeev Sethi",
    ownerPhone: "+91 98290 41220",
    ownerEmail: "rajeev.sethi@example.in",
    address: "Shop 12, Vaishali Nagar Main Road",
    state: "Rajasthan",
    launchDate: "2025-11-14",
    assignedDate: "2025-11-20",
    executive: "Nikhil Arora",
    operatingStatus: "live",
    objective: "Increase dry-cleaning orders",
    serviceArea: "Vaishali Nagar, Ajmer Road — 8 km radius",
    monthlyBudget: 70000,
    salesTrend: "up",
    attention: ["Influencer content overdue (INF-551)"],
    profiles: [
      { network: "Google Business Profile", url: "business.google.com/cleancraft-jaipur-vaishali", setup: "complete", lastUpdated: "2026-08-02", completeness: 96, verification: "verified" },
      { network: "Facebook", url: "facebook.com/cleancraftjaipurvaishali", setup: "complete", lastUpdated: "2026-07-30", completeness: 90, verification: "not_applicable" },
      { network: "Instagram", url: "instagram.com/cleancraft.jaipur", setup: "partial", lastUpdated: "2026-07-11", completeness: 68, verification: "not_applicable", issue: "Bio and highlights update due" },
    ],
    creatives: { storeGraphics: 14, festival: 6, offer: 5, campaign: 8, awaitingApproval: 1, correction: 0 },
    influencers: [
      { id: "INF-551", name: "Aarohi Sharma", platform: "Instagram", activity: "Reel — shoe laundry", plannedDate: "2026-08-07", contentStatus: "overdue", leads: 0, sales: 0, status: "Content overdue" },
      { id: "INF-552", name: "Pink City Foodie", platform: "Instagram", activity: "Store visit story series", plannedDate: "2026-08-09", contentStatus: "not_started", leads: 0, sales: 0, status: "Awaiting confirmation" },
    ],
    leadsSales: { leads: 142, qualified: 92, handedOver: 90, contacted: 84, orders: 51, salesAmount: 486000, adSpend: 62000 },
    activity: [
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "CMP-8821 budget raised to ₹45,000" },
      { at: "2026-08-02", actor: "Nikhil Arora", detail: "Google Business Profile photos updated (12 new)" },
      { at: "2025-11-20", actor: "Manager", detail: "Store assigned to Nikhil Arora — previous history retained" },
    ],
  },
  "STR-1067": {
    storeId: "STR-1067",
    owner: "Meenal Joshi",
    ownerPhone: "+91 99770 51188",
    ownerEmail: "meenal.joshi@example.in",
    address: "Unit 4, Vijay Nagar Square",
    state: "Madhya Pradesh",
    launchDate: "2026-01-08",
    assignedDate: "2026-01-12",
    executive: "Nikhil Arora",
    operatingStatus: "live",
    objective: "Grow monthly repeat customers",
    serviceArea: "Vijay Nagar, Scheme 54 — 6 km radius",
    monthlyBudget: 55000,
    salesTrend: "up",
    attention: ["Store information incomplete on GMB", "4 reviews awaiting response"],
    profiles: [
      { network: "Google Business Profile", url: "business.google.com/cleancraft-indore", setup: "partial", lastUpdated: "2026-07-19", completeness: 74, verification: "verified", issue: "Timings and services incomplete" },
      { network: "Facebook", url: "facebook.com/cleancraftindore", setup: "partial", lastUpdated: "2026-06-28", completeness: 62, verification: "not_applicable", issue: "Cover and contact update due" },
      { network: "Instagram", url: "instagram.com/cleancraft.indore", setup: "complete", lastUpdated: "2026-07-29", completeness: 88, verification: "not_applicable" },
    ],
    creatives: { storeGraphics: 11, festival: 4, offer: 3, campaign: 6, awaitingApproval: 2, correction: 0 },
    influencers: [
      { id: "INF-559", name: "Indore Diaries", platform: "Instagram", activity: "Carousel — sofa cleaning", plannedDate: "2026-08-05", contentStatus: "published", publishedLink: "instagram.com/p/indore-diaries-cc", leads: 18, sales: 46000, status: "Payment approval pending" },
    ],
    leadsSales: { leads: 118, qualified: 71, handedOver: 71, contacted: 66, orders: 39, salesAmount: 372000, adSpend: 48500 },
    activity: [
      { at: "2026-08-04", actor: "Aakash Menon", detail: "REQ-3384 raised — Google Business Profile update" },
      { at: "2026-08-04", actor: "Nikhil Arora", detail: "REQ-3384 accepted" },
    ],
  },
  "STR-1088": {
    storeId: "STR-1088",
    owner: "Saurabh Tandon",
    ownerPhone: "+91 94150 33902",
    ownerEmail: "saurabh.tandon@example.in",
    address: "LGF 2, Vibhuti Khand, Gomti Nagar",
    state: "Uttar Pradesh",
    launchDate: "2026-02-21",
    assignedDate: "2026-02-25",
    executive: "Nikhil Arora",
    operatingStatus: "live",
    objective: "Recover enquiry volume",
    serviceArea: "Gomti Nagar, Indira Nagar — 7 km radius",
    monthlyBudget: 60000,
    salesTrend: "down",
    attention: [
      "Campaign overspending (CMP-8847)",
      "Incorrect store details reported",
      "6 reviews awaiting response",
      "Urgent RM request pending (REQ-3391)",
    ],
    profiles: [
      { network: "Google Business Profile", url: "business.google.com/cleancraft-lucknow", setup: "complete", lastUpdated: "2026-07-06", completeness: 82, verification: "verified", issue: "Incorrect address line reported by owner" },
      { network: "Facebook", url: "facebook.com/cleancraftlucknow", setup: "partial", lastUpdated: "2026-06-14", completeness: 58, verification: "not_applicable", issue: "Update overdue" },
      { network: "Instagram", url: "instagram.com/cleancraft.lucknow", setup: "partial", lastUpdated: "2026-06-10", completeness: 54, verification: "not_applicable", issue: "Update overdue" },
    ],
    creatives: { storeGraphics: 9, festival: 2, offer: 4, campaign: 5, awaitingApproval: 1, correction: 1 },
    influencers: [
      { id: "INF-561", name: "Nawabi Lifestyle", platform: "Instagram", activity: "Reel — festival offer", plannedDate: "2026-08-04", contentStatus: "published", publishedLink: "instagram.com/p/nawabi-cc", leads: 9, sales: 0, status: "Results pending" },
    ],
    leadsSales: { leads: 64, qualified: 22, handedOver: 18, contacted: 15, orders: 8, salesAmount: 158000, adSpend: 51000 },
    activity: [
      { at: "2026-08-06", actor: "Sanya Kapoor", detail: "REQ-3391 raised — festival promotion (high priority)" },
      { at: "2026-08-03", actor: "System", detail: "CMP-8847 flagged: spend 95% with low qualified leads" },
    ],
  },
  "STR-1103": {
    storeId: "STR-1103",
    owner: "Hiren Patel",
    ownerPhone: "+91 90999 71204",
    ownerEmail: "hiren.patel@example.in",
    address: "Ground Floor, Adajan Gam Road",
    state: "Gujarat",
    launchDate: "2025-09-30",
    assignedDate: "2025-10-04",
    executive: "Nikhil Arora",
    operatingStatus: "live",
    objective: "Rebuild local search enquiries",
    serviceArea: "Adajan, Pal, Rander — 9 km radius",
    monthlyBudget: 45000,
    salesTrend: "down",
    attention: [
      "Sales declining despite active marketing",
      "Campaign spending without leads (CMP-8852)",
      "Urgent RM request pending (REQ-3388)",
    ],
    profiles: [
      { network: "Google Business Profile", url: "business.google.com/cleancraft-surat", setup: "complete", lastUpdated: "2026-07-22", completeness: 88, verification: "verified" },
      { network: "Facebook", url: "facebook.com/cleancraftsurat", setup: "complete", lastUpdated: "2026-07-15", completeness: 80, verification: "not_applicable" },
      { network: "Instagram", url: "instagram.com/cleancraft.surat", setup: "partial", lastUpdated: "2026-05-29", completeness: 51, verification: "not_applicable", issue: "Inactive for 60+ days" },
    ],
    creatives: { storeGraphics: 8, festival: 3, offer: 2, campaign: 4, awaitingApproval: 0, correction: 0 },
    influencers: [],
    leadsSales: { leads: 38, qualified: 11, handedOver: 9, contacted: 7, orders: 4, salesAmount: 96000, adSpend: 44000 },
    activity: [
      { at: "2026-08-06", actor: "Yash Malhotra", detail: "REQ-3388 raised — restart Google Ads" },
      { at: "2026-07-28", actor: "Nikhil Arora", detail: "CMP-8852 launched with revised keywords" },
    ],
  },
  "STR-1121": {
    storeId: "STR-1121",
    owner: "Farhan Qureshi",
    ownerPhone: "+91 98209 66431",
    ownerEmail: "farhan.qureshi@example.in",
    address: "Shop 3, Lokhandwala Complex, Andheri West",
    state: "Maharashtra",
    launchDate: "2025-08-18",
    assignedDate: "2025-08-22",
    executive: "Nikhil Arora",
    operatingStatus: "live",
    objective: "Premium laundry lead generation",
    serviceArea: "Andheri West, Versova, Juhu — 6 km radius",
    monthlyBudget: 95000,
    salesTrend: "up",
    attention: [],
    profiles: [
      { network: "Google Business Profile", url: "business.google.com/cleancraft-mumbai-andheri", setup: "complete", lastUpdated: "2026-08-04", completeness: 98, verification: "verified" },
      { network: "Facebook", url: "facebook.com/cleancraftandheri", setup: "complete", lastUpdated: "2026-08-01", completeness: 94, verification: "not_applicable" },
      { network: "Instagram", url: "instagram.com/cleancraft.andheri", setup: "complete", lastUpdated: "2026-08-03", completeness: 96, verification: "not_applicable" },
    ],
    creatives: { storeGraphics: 18, festival: 7, offer: 8, campaign: 12, awaitingApproval: 0, correction: 0 },
    influencers: [
      { id: "INF-556", name: "Rohan Vlogs", platform: "YouTube", activity: "Store walkthrough video", plannedDate: "2026-08-02", contentStatus: "published", publishedLink: "youtube.com/watch?v=cc-andheri", leads: 34, sales: 128000, status: "Published — results tracking" },
    ],
    leadsSales: { leads: 176, qualified: 118, handedOver: 118, contacted: 112, orders: 68, salesAmount: 612000, adSpend: 88000 },
    activity: [
      { at: "2026-08-04", actor: "Nikhil Arora", detail: "CMP-8834 creative refreshed for August" },
      { at: "2026-07-31", actor: "Ritika Bansal", detail: "July marketing report acknowledged" },
    ],
  },
  "STR-1134": {
    storeId: "STR-1134",
    owner: "Sneha Kulkarni",
    ownerPhone: "+91 88888 30219",
    ownerEmail: "sneha.kulkarni@example.in",
    address: "Shop 7, Baner Road",
    state: "Maharashtra",
    launchDate: "2026-08-16",
    assignedDate: "2026-07-28",
    executive: "Nikhil Arora",
    operatingStatus: "opening",
    objective: "Launch awareness before opening",
    serviceArea: "Baner, Aundh, Balewadi — 5 km radius",
    monthlyBudget: 40000,
    salesTrend: "flat",
    attention: [
      "Google Business verification pending",
      "Creative not ready before campaign start (CMP-8860)",
      "No active campaign",
    ],
    profiles: [
      { network: "Google Business Profile", url: "business.google.com/cleancraft-pune-baner", setup: "not_started", lastUpdated: "—", completeness: 22, verification: "pending", issue: "Verification postcard awaited" },
      { network: "Facebook", url: "—", setup: "not_started", lastUpdated: "—", completeness: 0, verification: "not_applicable", issue: "Profile not created" },
      { network: "Instagram", url: "—", setup: "not_started", lastUpdated: "—", completeness: 0, verification: "not_applicable", issue: "Profile not created" },
    ],
    creatives: { storeGraphics: 3, festival: 0, offer: 1, campaign: 0, awaitingApproval: 2, correction: 0 },
    influencers: [],
    leadsSales: { leads: 12, qualified: 5, handedOver: 5, contacted: 3, orders: 0, salesAmount: 0, adSpend: 8000 },
    activity: [
      { at: "2026-08-05", actor: "Aakash Menon", detail: "REQ-3376 raised — Instagram profile setup" },
      { at: "2026-07-28", actor: "Manager", detail: "New store assigned to Nikhil Arora" },
    ],
  },
  "STR-1149": {
    storeId: "STR-1149",
    owner: "Devanshi Rathore",
    ownerPhone: "+91 75550 22119",
    ownerEmail: "devanshi.rathore@example.in",
    address: "E-8 Extension, Arera Colony",
    state: "Madhya Pradesh",
    launchDate: "2025-12-05",
    assignedDate: "2025-12-09",
    executive: "Nikhil Arora",
    operatingStatus: "live",
    objective: "Grow sofa and carpet cleaning orders",
    serviceArea: "Arera Colony, Shahpura — 7 km radius",
    monthlyBudget: 42000,
    salesTrend: "flat",
    attention: ["Campaign report missing (July)"],
    profiles: [
      { network: "Google Business Profile", url: "business.google.com/cleancraft-bhopal", setup: "complete", lastUpdated: "2026-07-28", completeness: 92, verification: "verified" },
      { network: "Facebook", url: "facebook.com/cleancraftbhopal", setup: "complete", lastUpdated: "2026-07-25", completeness: 86, verification: "not_applicable" },
      { network: "Instagram", url: "instagram.com/cleancraft.bhopal", setup: "complete", lastUpdated: "2026-07-26", completeness: 84, verification: "not_applicable" },
    ],
    creatives: { storeGraphics: 10, festival: 3, offer: 4, campaign: 5, awaitingApproval: 0, correction: 0 },
    influencers: [
      { id: "INF-564", name: "Bhopal Bytes", platform: "YouTube", activity: "Short — pickup service", plannedDate: "2026-08-14", contentStatus: "not_started", leads: 0, sales: 0, status: "Planned" },
    ],
    leadsSales: { leads: 91, qualified: 55, handedOver: 55, contacted: 51, orders: 30, salesAmount: 264000, adSpend: 39000 },
    activity: [
      { at: "2026-08-01", actor: "System", detail: "CMP-8801 completed — report pending" },
      { at: "2025-12-09", actor: "Manager", detail: "Store assigned to Nikhil Arora" },
    ],
  },
};

/** Transparent, rule-based marketing health (no AI scoring). */
export function computeHealth(storeId: string): { health: MarketingHealth; reasons: string[] } {
  const store = STORES.find((s) => s.id === storeId)!;
  const detail = STORE_DETAILS[storeId]!;
  const campaigns = CAMPAIGNS.filter((c) => c.storeId === storeId);
  const active = campaigns.filter((c) => c.status !== "completed" && c.status !== "awaiting_approval");
  const reasons: string[] = [];

  if (detail.operatingStatus !== "live" || detail.profiles.some((p) => p.setup === "not_started")) {
    reasons.push("Store or profile setup still pending");
    return { health: "setup_pending", reasons };
  }

  let severity = 0;
  if (active.length === 0) {
    reasons.push("No active campaign");
    severity += 2;
  }
  if (campaigns.some((c) => c.spend / c.budget > 0.9 && c.qualified <= 10)) {
    reasons.push("Campaign spending with few qualified leads");
    severity += 2;
  }
  if (detail.salesTrend === "down") {
    reasons.push("Sales trend declining");
    severity += 2;
  }
  const requests = REQUESTS.filter((r) => r.storeId === storeId && r.status === "new");
  if (requests.some((r) => r.priority === "high")) {
    reasons.push("Urgent Relationship Manager request pending");
    severity += 1;
  }
  if (store.pendingRequests > 1) {
    reasons.push(`${store.pendingRequests} pending marketing requests`);
    severity += 1;
  }
  const avgCompleteness =
    detail.profiles.reduce((s, p) => s + p.completeness, 0) / detail.profiles.length;
  if (avgCompleteness < 75) {
    reasons.push("Profile information incomplete");
    severity += 1;
  }
  if (detail.attention.length > 0) severity += detail.attention.length > 2 ? 2 : 1;
  if (store.leadsThisMonth < 50) {
    reasons.push("Leads below expected level");
    severity += 1;
  }

  if (severity >= 4) return { health: "critical", reasons };
  if (severity >= 2) return { health: "needs_attention", reasons };
  if (reasons.length === 0) reasons.push("Campaigns active, profiles complete, leads and sales on track");
  return { health: "healthy", reasons };
}

export const CITY_STATE: Record<string, string> = {
  Jaipur: "Rajasthan",
  Indore: "Madhya Pradesh",
  Lucknow: "Uttar Pradesh",
  Surat: "Gujarat",
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Bhopal: "Madhya Pradesh",
};
