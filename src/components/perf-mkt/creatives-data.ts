/**
 * Creative & graphic records for the Performance Marketing Executive workspace.
 *
 * Lineage: Store ID -> Marketing Request ID -> Creative ID (-> Campaign ID)
 * A creative keeps ONE permanent Creative ID across every version; versions are
 * appended (V1, V2, V3...) and never overwritten.
 */

import type { Tone } from "./data";

export const CREATIVE_TODAY = "2026-08-06";

export const CREATIVE_TYPES = [
  "Offer Graphic",
  "Festival Creative",
  "Store Opening Creative",
  "Service or Price Graphic",
  "Google Ad",
  "Meta Ad",
  "Facebook or Instagram Post",
  "Story or Reel Cover",
  "Google Business Profile Post",
  "Influencer Brief",
  "Banner or Poster",
  "Other",
] as const;
export type CreativeType = (typeof CREATIVE_TYPES)[number];

export const CREATIVE_PLATFORMS = [
  "Meta",
  "Google",
  "Google Business Profile",
  "WhatsApp",
  "Print",
  "In-store",
  "YouTube",
] as const;
export type CreativePlatform = (typeof CREATIVE_PLATFORMS)[number];

export type CreativeStatus =
  | "request_received"
  | "brief_ready"
  | "in_progress"
  | "under_review"
  | "correction_required"
  | "approved"
  | "delivered"
  | "on_hold"
  | "cancelled"
  | "expired";

export const creativeStatusMeta: Record<CreativeStatus, { label: string; tone: Tone }> = {
  request_received: { label: "Request Received", tone: "attention" },
  brief_ready: { label: "Brief Ready", tone: "active" },
  in_progress: { label: "In Progress", tone: "active" },
  under_review: { label: "Under Review", tone: "attention" },
  correction_required: { label: "Correction Required", tone: "overdue" },
  approved: { label: "Approved", tone: "healthy" },
  delivered: { label: "Delivered / Used", tone: "healthy" },
  on_hold: { label: "On Hold", tone: "draft" },
  cancelled: { label: "Cancelled", tone: "draft" },
  expired: { label: "Expired", tone: "overdue" },
};

export const CREATIVE_FLOW: CreativeStatus[] = [
  "request_received",
  "brief_ready",
  "in_progress",
  "under_review",
  "correction_required",
  "approved",
  "delivered",
];

export type CreativeBrief = {
  objective: string;
  storeOrCampaign: string;
  targetCustomer: string;
  mainMessage: string;
  offerDetails: string;
  requiredWording: string;
  cta: string;
  platform: CreativePlatform;
  size: string;
  language: string;
  brandInstructions: string;
  referenceFiles: string[];
  deadline: string;
  complete: boolean;
};

export type CreativeVersion = {
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  file: string;
  note?: string;
  reviewer?: string;
  decision?: "approved" | "correction" | "pending";
  comments: { at: string; by: string; text: string }[];
};

export type CreativeDelivery = {
  recipient: string;
  channel: string;
  deliveredAt: string;
};

export type CreativeRecord = {
  id: string;
  title: string;
  storeId: string;
  store: string;
  requestId: string;
  campaignId?: string;
  requestedBy: string;
  assignedTo: string;
  reviewer: string;
  type: CreativeType;
  platform: CreativePlatform;
  format: string;
  dimensions: string;
  language: string;
  objective: string;
  audience: string;
  message: string;
  cta: string;
  offerStart?: string;
  offerExpiry?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  deadline: string;
  status: CreativeStatus;
  thumbnailHue: number;
  notes: string;
  brief: CreativeBrief;
  versions: CreativeVersion[];
  delivery?: CreativeDelivery;
  metrics: {
    briefHours: number | null;
    turnaroundHours: number | null;
    onTime: boolean | null;
    firstReviewApproved: boolean | null;
    correctionRounds: number;
    campaignsUsing: string[];
    leads: number | null;
    orders: number | null;
    sales: number | null;
  };
  audit: { at: string; by: string; action: string }[];
};

const brief = (over: Partial<CreativeBrief>): CreativeBrief => ({
  objective: "Generate qualified enquiries for the store service area.",
  storeOrCampaign: "—",
  targetCustomer: "Households and working professionals within 5 km",
  mainMessage: "Professional garment care with free pickup and delivery.",
  offerDetails: "—",
  requiredWording: "Clean Craft · Free pickup & delivery",
  cta: "Book pickup",
  platform: "Meta",
  size: "1080 x 1080 px",
  language: "Hindi + English",
  brandInstructions: "Brand blue and white, logo top-left, no stock-photo watermarks.",
  referenceFiles: ["brand-kit-v4.pdf"],
  deadline: "2026-08-10",
  complete: true,
  ...over,
});

export const CREATIVES_FULL: CreativeRecord[] = [
  {
    id: "CRV-4402",
    title: "Jaipur premium care — carousel set",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    requestId: "REQ-3344",
    campaignId: "CMP-8821",
    requestedBy: "Ritika Bansal (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Meta Ad",
    platform: "Meta",
    format: "Carousel (3 cards)",
    dimensions: "1080 x 1080 px",
    language: "Hindi + English",
    objective: "Premium garment care lead generation",
    audience: "Vaishali Nagar households, 28–55",
    message: "Suits, sarees and woollens cleaned by trained experts.",
    cta: "Get quote",
    offerStart: "2026-07-18",
    offerExpiry: "2026-08-17",
    priority: "High",
    deadline: "2026-07-17",
    status: "delivered",
    thumbnailHue: 210,
    notes: "Carousel card 2 performs best — keep for the next month.",
    brief: brief({ storeOrCampaign: "CMP-8821", offerDetails: "Premium care trial ₹1299", deadline: "2026-07-17" }),
    versions: [
      {
        version: "V1",
        uploadedBy: "Nikhil Arora",
        uploadedAt: "2026-07-15 11:20",
        file: "jaipur-premium-v1.zip",
        reviewer: "Marketing Head",
        decision: "correction",
        comments: [{ at: "2026-07-15 16:10", by: "Marketing Head", text: "Price not legible on card 2. Increase font size." }],
      },
      {
        version: "V2",
        uploadedBy: "Nikhil Arora",
        uploadedAt: "2026-07-16 10:05",
        file: "jaipur-premium-v2.zip",
        note: "Price typography fixed, offer badge added.",
        reviewer: "Marketing Head",
        decision: "approved",
        comments: [{ at: "2026-07-16 12:30", by: "Marketing Head", text: "Approved for launch." }],
      },
    ],
    delivery: { recipient: "Meta Ads Manager — CMP-8821", channel: "Campaign upload", deliveredAt: "2026-07-18 09:15" },
    metrics: {
      briefHours: 6,
      turnaroundHours: 28,
      onTime: true,
      firstReviewApproved: false,
      correctionRounds: 1,
      campaignsUsing: ["CMP-8821"],
      leads: 68,
      orders: 27,
      sales: 268000,
    },
    audit: [
      { at: "2026-07-14", by: "Ritika Bansal", action: "Request REQ-3344 raised for STR-1042" },
      { at: "2026-07-15", by: "Nikhil Arora", action: "Brief completed, V1 uploaded" },
      { at: "2026-07-16", by: "Marketing Head", action: "V2 approved" },
      { at: "2026-07-18", by: "Nikhil Arora", action: "Delivered to CMP-8821" },
    ],
  },
  {
    id: "CRV-4492",
    title: "Pune Baner launch week creative",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    requestId: "REQ-3376",
    campaignId: "CMP-8845",
    requestedBy: "Aakash Menon (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Store Opening Creative",
    platform: "Meta",
    format: "Reel cover + static",
    dimensions: "1080 x 1350 px",
    language: "Marathi + English",
    objective: "Launch-week local awareness",
    audience: "Baner and Balewadi residents, 24–48",
    message: "Clean Craft is now open in Baner — launch week 25% off.",
    cta: "Learn more",
    offerStart: "2026-08-10",
    offerExpiry: "2026-08-24",
    priority: "Urgent",
    deadline: "2026-08-07",
    status: "correction_required",
    thumbnailHue: 24,
    notes: "Offer wording must match approved launch terms.",
    brief: brief({
      storeOrCampaign: "CMP-8845",
      offerDetails: "Launch week 25% off",
      platform: "Meta",
      size: "1080 x 1350 px",
      language: "Marathi + English",
      deadline: "2026-08-07",
    }),
    versions: [
      {
        version: "V1",
        uploadedBy: "Nikhil Arora",
        uploadedAt: "2026-08-04 18:40",
        file: "pune-launch-v1.png",
        reviewer: "Marketing Head",
        decision: "correction",
        comments: [
          { at: "2026-08-05 09:30", by: "Marketing Head", text: "Offer wording says 'flat 25%' — approved terms say 'up to 25% on launch week orders'." },
          { at: "2026-08-05 09:32", by: "Marketing Head", text: "Add store address strip at the bottom." },
        ],
      },
    ],
    metrics: {
      briefHours: 4,
      turnaroundHours: null,
      onTime: null,
      firstReviewApproved: false,
      correctionRounds: 1,
      campaignsUsing: ["CMP-8845"],
      leads: null,
      orders: null,
      sales: null,
    },
    audit: [
      { at: "2026-08-03", by: "Aakash Menon", action: "Request REQ-3376 raised for STR-1134" },
      { at: "2026-08-04", by: "Nikhil Arora", action: "V1 submitted for review" },
      { at: "2026-08-05", by: "Marketing Head", action: "Correction requested — deadline 07 Aug 2026" },
    ],
  },
  {
    id: "CRV-4490",
    title: "Surat search ad — call-focused copy set",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    requestId: "REQ-3388",
    campaignId: "CMP-8840",
    requestedBy: "Yash Malhotra (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Google Ad",
    platform: "Google",
    format: "Responsive search ad copy sheet",
    dimensions: "Text asset",
    language: "Gujarati + Hindi",
    objective: "Phone call enquiries",
    audience: "Adajan, Pal, Rander search intent",
    message: "Same-day dry cleaning with doorstep pickup.",
    cta: "Call now",
    offerStart: "2026-08-08",
    offerExpiry: "2026-09-07",
    priority: "High",
    deadline: "2026-08-07",
    status: "under_review",
    thumbnailHue: 140,
    notes: "Waiting on reviewer — campaign launch blocked until approval.",
    brief: brief({
      storeOrCampaign: "CMP-8840",
      offerDetails: "First order 15% off",
      platform: "Google",
      size: "Text asset (30/90 char limits)",
      language: "Gujarati + Hindi",
      deadline: "2026-08-07",
    }),
    versions: [
      {
        version: "V1",
        uploadedBy: "Nikhil Arora",
        uploadedAt: "2026-08-05 15:10",
        file: "surat-rsa-copy-v1.xlsx",
        reviewer: "Marketing Head",
        decision: "pending",
        comments: [],
      },
    ],
    metrics: {
      briefHours: 3,
      turnaroundHours: null,
      onTime: null,
      firstReviewApproved: null,
      correctionRounds: 0,
      campaignsUsing: ["CMP-8840"],
      leads: null,
      orders: null,
      sales: null,
    },
    audit: [
      { at: "2026-08-05", by: "Yash Malhotra", action: "Request REQ-3388 raised for STR-1103" },
      { at: "2026-08-05", by: "Nikhil Arora", action: "Brief completed, V1 submitted for review" },
    ],
  },
  {
    id: "CRV-4501",
    title: "Lucknow Raksha Bandhan offer graphic",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    requestId: "REQ-3391",
    requestedBy: "Sanya Kapoor (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Festival Creative",
    platform: "Meta",
    format: "Static post + story",
    dimensions: "1080 x 1080 px / 1080 x 1920 px",
    language: "Hindi",
    objective: "Festival week enquiries",
    audience: "Gomti Nagar families, 25–45",
    message: "Festival-ready clothes, picked up and delivered.",
    cta: "Book pickup",
    offerStart: "2026-08-08",
    offerExpiry: "2026-08-16",
    priority: "High",
    deadline: "2026-08-07",
    status: "in_progress",
    thumbnailHue: 320,
    notes: "Store shared festival hamper visuals — using those.",
    brief: brief({
      storeOrCampaign: "STR-1088",
      offerDetails: "Festival pack ₹899 for 5 garments",
      language: "Hindi",
      deadline: "2026-08-07",
    }),
    versions: [],
    metrics: {
      briefHours: 5,
      turnaroundHours: null,
      onTime: null,
      firstReviewApproved: null,
      correctionRounds: 0,
      campaignsUsing: [],
      leads: null,
      orders: null,
      sales: null,
    },
    audit: [
      { at: "2026-08-05", by: "Sanya Kapoor", action: "Request REQ-3391 raised for STR-1088" },
      { at: "2026-08-05", by: "Nikhil Arora", action: "Brief completed — design started" },
    ],
  },
  {
    id: "CRV-4504",
    title: "Indore weekday offer — GBP post",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    requestId: "REQ-3394",
    requestedBy: "Aakash Menon (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Google Business Profile Post",
    platform: "Google Business Profile",
    format: "Square post",
    dimensions: "1200 x 1200 px",
    language: "Hindi + English",
    objective: "Local discovery and weekday bookings",
    audience: "Vijay Nagar professionals",
    message: "Weekday 20% off dry cleaning pickups.",
    cta: "Book now",
    offerStart: "2026-08-04",
    offerExpiry: "2026-08-13",
    priority: "Medium",
    deadline: "2026-08-04",
    status: "request_received",
    thumbnailHue: 260,
    notes: "Brief pending — waiting on final offer confirmation from store.",
    brief: brief({
      storeOrCampaign: "STR-1067",
      offerDetails: "Pending confirmation",
      platform: "Google Business Profile",
      size: "1200 x 1200 px",
      deadline: "2026-08-04",
      complete: false,
      referenceFiles: [],
    }),
    versions: [],
    metrics: {
      briefHours: null,
      turnaroundHours: null,
      onTime: null,
      firstReviewApproved: null,
      correctionRounds: 0,
      campaignsUsing: [],
      leads: null,
      orders: null,
      sales: null,
    },
    audit: [{ at: "2026-08-03", by: "Aakash Menon", action: "Request REQ-3394 raised for STR-1067" }],
  },
  {
    id: "CRV-4471",
    title: "Jaipur shoe laundry banner set",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    requestId: "REQ-3361",
    campaignId: "CMP-8848",
    requestedBy: "Ritika Bansal (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Offer Graphic",
    platform: "Meta",
    format: "Static banner set (3 sizes)",
    dimensions: "1080 x 1080 / 1200 x 628 / 1080 x 1920 px",
    language: "Hindi + English",
    objective: "Retargeting past website visitors",
    audience: "Site visitors 60 days, sneaker owners",
    message: "Sneakers looking dull? Professional shoe laundry with free pickup.",
    cta: "Book pickup",
    offerStart: "2026-07-24",
    offerExpiry: "2026-08-04",
    priority: "Medium",
    deadline: "2026-07-23",
    status: "expired",
    thumbnailHue: 12,
    notes: "Offer window closed — new dates and reapproval needed before reuse.",
    brief: brief({ storeOrCampaign: "CMP-8848", offerDetails: "Flat ₹200 off above ₹1499", deadline: "2026-07-23" }),
    versions: [
      {
        version: "V1",
        uploadedBy: "Nikhil Arora",
        uploadedAt: "2026-07-22 12:00",
        file: "jaipur-shoe-v1.zip",
        reviewer: "Marketing Head",
        decision: "approved",
        comments: [{ at: "2026-07-22 17:40", by: "Marketing Head", text: "Approved — first review." }],
      },
    ],
    delivery: { recipient: "Meta Ads Manager — CMP-8848", channel: "Campaign upload", deliveredAt: "2026-07-24 10:00" },
    metrics: {
      briefHours: 4,
      turnaroundHours: 20,
      onTime: true,
      firstReviewApproved: true,
      correctionRounds: 0,
      campaignsUsing: ["CMP-8848"],
      leads: 39,
      orders: 16,
      sales: 96000,
    },
    audit: [
      { at: "2026-07-21", by: "Ritika Bansal", action: "Request REQ-3361 raised for STR-1042" },
      { at: "2026-07-22", by: "Marketing Head", action: "V1 approved at first review" },
      { at: "2026-08-05", by: "System", action: "Offer expiry passed — marked Expired, sharing disabled" },
    ],
  },
  {
    id: "CRV-4451",
    title: "Lucknow monsoon package video cover",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    requestId: "REQ-3372",
    campaignId: "CMP-8834",
    requestedBy: "Sanya Kapoor (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Story or Reel Cover",
    platform: "Meta",
    format: "Reel cover",
    dimensions: "1080 x 1920 px",
    language: "Hindi",
    objective: "Monsoon care lead generation",
    audience: "Gomti Nagar households 30–45",
    message: "Damp clothes? Monsoon-safe cleaning with free pickup.",
    cta: "Book pickup",
    offerStart: "2026-07-22",
    offerExpiry: "2026-08-31",
    priority: "Medium",
    deadline: "2026-07-21",
    status: "approved",
    thumbnailHue: 190,
    notes: "Approved and ready to hand over for the August repeat campaign.",
    brief: brief({ storeOrCampaign: "CMP-8834", offerDetails: "Monsoon care package ₹699", language: "Hindi", deadline: "2026-07-21" }),
    versions: [
      {
        version: "V1",
        uploadedBy: "Nikhil Arora",
        uploadedAt: "2026-07-20 14:00",
        file: "lucknow-monsoon-v1.png",
        reviewer: "Marketing Head",
        decision: "correction",
        comments: [{ at: "2026-07-20 18:00", by: "Marketing Head", text: "Package price hidden behind subject. Reposition." }],
      },
      {
        version: "V2",
        uploadedBy: "Nikhil Arora",
        uploadedAt: "2026-07-21 09:30",
        file: "lucknow-monsoon-v2.png",
        note: "Price moved to top strip.",
        reviewer: "Marketing Head",
        decision: "approved",
        comments: [{ at: "2026-07-21 11:00", by: "Marketing Head", text: "Approved." }],
      },
    ],
    metrics: {
      briefHours: 5,
      turnaroundHours: 24,
      onTime: true,
      firstReviewApproved: false,
      correctionRounds: 1,
      campaignsUsing: ["CMP-8834"],
      leads: 64,
      orders: 22,
      sales: 186000,
    },
    audit: [
      { at: "2026-07-19", by: "Sanya Kapoor", action: "Request REQ-3372 raised for STR-1088" },
      { at: "2026-07-21", by: "Marketing Head", action: "V2 approved" },
    ],
  },
  {
    id: "CRV-4508",
    title: "Surat influencer brief — festival reel",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    requestId: "REQ-3396",
    requestedBy: "Yash Malhotra (RM)",
    assignedTo: "Nikhil Arora",
    reviewer: "Marketing Head",
    type: "Influencer Brief",
    platform: "YouTube",
    format: "Brief document",
    dimensions: "Document",
    language: "Gujarati",
    objective: "Local creator reach before festival week",
    audience: "Surat lifestyle audience 22–40",
    message: "Behind-the-scenes of professional garment care.",
    cta: "Visit store",
    priority: "Low",
    deadline: "2026-08-12",
    status: "on_hold",
    thumbnailHue: 45,
    notes: "On hold until influencer budget is approved by Accounts.",
    brief: brief({
      storeOrCampaign: "STR-1103",
      offerDetails: "Barter + ₹5,000 fee (pending approval)",
      platform: "YouTube",
      size: "Document",
      language: "Gujarati",
      deadline: "2026-08-12",
    }),
    versions: [],
    metrics: {
      briefHours: 2,
      turnaroundHours: null,
      onTime: null,
      firstReviewApproved: null,
      correctionRounds: 0,
      campaignsUsing: [],
      leads: null,
      orders: null,
      sales: null,
    },
    audit: [
      { at: "2026-08-04", by: "Yash Malhotra", action: "Request REQ-3396 raised for STR-1103" },
      { at: "2026-08-05", by: "Nikhil Arora", action: "Put on hold — budget approval pending" },
    ],
  },
];

export const latestVersion = (c: CreativeRecord) => c.versions[c.versions.length - 1] ?? null;
export const approvedVersion = (c: CreativeRecord) =>
  [...c.versions].reverse().find((v) => v.decision === "approved") ?? null;

export const isExpired = (c: CreativeRecord) =>
  c.status === "expired" || (!!c.offerExpiry && c.offerExpiry < CREATIVE_TODAY);

const OPEN_STATUSES: CreativeStatus[] = [
  "request_received",
  "brief_ready",
  "in_progress",
  "under_review",
  "correction_required",
];

export const isOverdue = (c: CreativeRecord) =>
  OPEN_STATUSES.includes(c.status) && c.deadline < CREATIVE_TODAY;

/** Executive can submit for review only with a complete brief AND an uploaded draft. */
export const canSubmitForReview = (c: CreativeRecord) =>
  c.brief.complete && c.versions.length > 0 && ["brief_ready", "in_progress", "correction_required"].includes(c.status);

export const canDeliver = (c: CreativeRecord) => c.status === "approved" && !isExpired(c);
export const canShare = (c: CreativeRecord) => !!approvedVersion(c) && !isExpired(c);

export function creativeAlerts(c: CreativeRecord): string[] {
  const a: string[] = [];
  if (isOverdue(c)) a.push("Creative is overdue");
  else if (OPEN_STATUSES.includes(c.status) && c.deadline <= "2026-08-08") a.push("Deadline approaching");
  if (c.status === "correction_required") a.push("Corrections requested — reupload required");
  if (c.status === "under_review") a.push("Awaiting reviewer decision");
  if (!c.brief.complete) a.push("Brief incomplete — cannot enter review");
  if (isExpired(c)) a.push("Offer expired — DO NOT USE");
  else if (c.offerExpiry && c.offerExpiry <= "2026-08-13") a.push("Offer about to expire");
  return a;
}
