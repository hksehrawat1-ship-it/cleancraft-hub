/**
 * Influencer & YouTuber collaboration records for the Performance Marketing Executive workspace.
 *
 * Lineage: Creator ID -> Collaboration ID -> Store ID / Campaign ID / Marketing Request ID
 *
 * SECURITY: creator platform passwords are never stored. Only public profile links,
 * contact person details and agreed commercials are kept, with a full audit trail.
 */

import type { Tone } from "./data";

export const COLLAB_TODAY = "2026-08-06";

export const CREATOR_PLATFORMS = ["YouTube", "Instagram", "Facebook"] as const;
export type CreatorPlatform = (typeof CREATOR_PLATFORMS)[number];

export const CONTENT_FORMATS = [
  "YouTube Long Video",
  "YouTube Short",
  "Instagram Reel",
  "Instagram Story",
  "Instagram Post",
  "Facebook Video",
  "Store Visit",
  "Product or Service Review",
  "Testimonial",
  "Lead-Generation Promotion",
  "Other",
] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export type CollabStatus =
  | "shortlisted"
  | "internal_approval"
  | "creator_contacted"
  | "negotiation"
  | "confirmed"
  | "brief_shared"
  | "content_received"
  | "under_review"
  | "approved"
  | "scheduled"
  | "published"
  | "results_recorded"
  | "completed"
  | "correction_required"
  | "on_hold"
  | "rejected"
  | "cancelled";

export const COLLAB_FLOW: CollabStatus[] = [
  "shortlisted",
  "internal_approval",
  "creator_contacted",
  "negotiation",
  "confirmed",
  "brief_shared",
  "content_received",
  "under_review",
  "approved",
  "scheduled",
  "published",
  "results_recorded",
  "completed",
];

export const collabStatusMeta: Record<CollabStatus, { label: string; tone: Tone }> = {
  shortlisted: { label: "Shortlisted", tone: "draft" },
  internal_approval: { label: "Internal Approval", tone: "attention" },
  creator_contacted: { label: "Creator Contacted", tone: "active" },
  negotiation: { label: "Negotiation", tone: "active" },
  confirmed: { label: "Confirmed", tone: "active" },
  brief_shared: { label: "Brief Shared", tone: "active" },
  content_received: { label: "Content Received", tone: "attention" },
  under_review: { label: "Under Review", tone: "attention" },
  approved: { label: "Approved", tone: "healthy" },
  scheduled: { label: "Scheduled", tone: "active" },
  published: { label: "Published", tone: "healthy" },
  results_recorded: { label: "Results Recorded", tone: "healthy" },
  completed: { label: "Completed", tone: "healthy" },
  correction_required: { label: "Correction Required", tone: "overdue" },
  on_hold: { label: "On Hold", tone: "draft" },
  rejected: { label: "Rejected", tone: "overdue" },
  cancelled: { label: "Cancelled", tone: "draft" },
};

export type Creator = {
  id: string;
  name: string;
  type: "Influencer" | "YouTuber";
  contactPerson: string;
  city: string;
  serviceArea: string;
  languages: string[];
  category: string;
  platforms: CreatorPlatform[];
  links: { platform: CreatorPlatform; url: string }[];
  followers: number;
  avgViews: number;
  engagementRate: number;
  audienceLocation: string;
  pastCollabs: number;
  rateCard: string;
  qualityRating: number;
  reliabilityRating: number;
  status: "Active" | "On Hold" | "Blocked";
  notes: string;
};

export type ContentVersion = {
  version: string;
  submittedOn: string;
  link: string;
  reviewer?: string;
  decision: "approved" | "correction required" | "under review";
  comments: { at: string; by: string; text: string }[];
};

export type Collaboration = {
  id: string;
  creatorId: string;
  title: string;
  scope: "Company Campaign" | "Store";
  storeId?: string;
  store?: string;
  city: string;
  campaignRef?: string;
  requestRef?: string;
  campaignId?: string;
  rm?: string;
  executive: string;
  objective: string;
  targetAudience: string;
  platform: CreatorPlatform;
  format: ContentFormat;
  deliverables: string[];
  requiredMessage: string;
  promoCode: string;
  callToAction: string;
  submissionDeadline: string;
  publishDate: string;
  amount: number;
  paymentTerms: string;
  paymentStatus: "Not due" | "Pending" | "Partly paid" | "Paid" | "On hold";
  status: CollabStatus;
  nextAction: string;
  nextActionDue: string;
  notes: string;
  attachments: string[];
  approval: {
    audienceRelevance: string;
    locationRelevance: string;
    avgViews: number;
    engagement: number;
    previousPerformance: string;
    quotedCost: number;
    estimatedReach: number;
    brandSuitability: string;
    riskNotes: string;
    expectedLeads: number;
    expectedCpl: number;
    approvedBy?: string;
    approvedOn?: string;
  };
  brief?: {
    talkingPoints: string[];
    mandatoryClaims: string[];
    prohibitedClaims: string[];
    offerDetails: string;
    trackingLink: string;
    brandGuidelines: string;
    requiredShots: string[];
    duration: string;
    disclosure: string;
    sharedOn?: string;
  };
  versions: ContentVersion[];
  publishProof?: {
    liveLink: string;
    platform: CreatorPlatform;
    publishedAt: string;
    screenshot: string;
    trackingRef: string;
    finalAmount: number;
  };
  results?: {
    reach: number;
    views: number;
    watchTimeHours: number;
    likes: number;
    comments: number;
    shares: number;
    linkClicks: number;
    enquiries: number;
    qualifiedLeads: number;
    orders: number;
    salesValue: number;
    period: string;
    source: string;
  };
  audit: { at: string; by: string; action: string }[];
};

export const CREATORS: Creator[] = [
  {
    id: "CRT-501",
    name: "Jaipur Food & Life — Ankit Sharma",
    type: "YouTuber",
    contactPerson: "Ankit Sharma",
    city: "Jaipur",
    serviceArea: "Jaipur city and Vaishali Nagar belt",
    languages: ["Hindi", "English"],
    category: "City lifestyle and local services",
    platforms: ["YouTube", "Instagram"],
    links: [
      { platform: "YouTube", url: "https://youtube.com/@jaipurfoodandlife" },
      { platform: "Instagram", url: "https://instagram.com/jaipurfoodandlife" },
    ],
    followers: 418000,
    avgViews: 96000,
    engagementRate: 6.4,
    audienceLocation: "78% Jaipur, 12% rest of Rajasthan",
    pastCollabs: 3,
    rateCard: "₹45,000 long video · ₹18,000 short",
    qualityRating: 4.7,
    reliabilityRating: 4.8,
    status: "Active",
    notes: "Best performing creator for store launches. Delivers on time.",
  },
  {
    id: "CRT-514",
    name: "Pune Homemaker Diaries — Sneha Kulkarni",
    type: "Influencer",
    contactPerson: "Sneha Kulkarni",
    city: "Pune",
    serviceArea: "Baner, Aundh, Balewadi",
    languages: ["Marathi", "Hindi"],
    category: "Home care and family lifestyle",
    platforms: ["Instagram"],
    links: [{ platform: "Instagram", url: "https://instagram.com/punehomemakerdiaries" }],
    followers: 132000,
    avgViews: 41000,
    engagementRate: 8.1,
    audienceLocation: "84% Pune",
    pastCollabs: 1,
    rateCard: "₹22,000 reel · ₹6,000 story set",
    qualityRating: 4.4,
    reliabilityRating: 4.1,
    status: "Active",
    notes: "Strong female homemaker audience — ideal for laundry subscriptions.",
  },
  {
    id: "CRT-522",
    name: "Lucknow Explorer — Rehan Siddiqui",
    type: "YouTuber",
    contactPerson: "Rehan Siddiqui",
    city: "Lucknow",
    serviceArea: "Gomti Nagar, Hazratganj",
    languages: ["Hindi", "Urdu"],
    category: "Local business reviews",
    platforms: ["YouTube", "Facebook"],
    links: [
      { platform: "YouTube", url: "https://youtube.com/@lucknowexplorer" },
      { platform: "Facebook", url: "https://facebook.com/lucknowexplorer" },
    ],
    followers: 226000,
    avgViews: 58000,
    engagementRate: 5.2,
    audienceLocation: "71% Lucknow",
    pastCollabs: 2,
    rateCard: "₹28,000 review video",
    qualityRating: 4.2,
    reliabilityRating: 3.6,
    status: "Active",
    notes: "Good reach, but usually needs one correction round on claims.",
  },
  {
    id: "CRT-533",
    name: "Style With Meera",
    type: "Influencer",
    contactPerson: "Meera Raghavan",
    city: "Indore",
    serviceArea: "Vijay Nagar, Palasia",
    languages: ["Hindi", "English"],
    category: "Fashion and garment care",
    platforms: ["Instagram", "YouTube"],
    links: [{ platform: "Instagram", url: "https://instagram.com/stylewithmeera" }],
    followers: 89000,
    avgViews: 27000,
    engagementRate: 7.3,
    audienceLocation: "66% Indore, 18% Bhopal",
    pastCollabs: 0,
    rateCard: "₹15,000 reel",
    qualityRating: 4.0,
    reliabilityRating: 4.0,
    status: "Active",
    notes: "New creator — first collaboration under evaluation.",
  },
  {
    id: "CRT-540",
    name: "Surat Daily Vlogs",
    type: "YouTuber",
    contactPerson: "Bhavin Desai",
    city: "Surat",
    serviceArea: "Adajan, Vesu",
    languages: ["Gujarati", "Hindi"],
    category: "Daily city vlogs",
    platforms: ["YouTube"],
    links: [{ platform: "YouTube", url: "https://youtube.com/@suratdailyvlogs" }],
    followers: 154000,
    avgViews: 33000,
    engagementRate: 3.9,
    audienceLocation: "69% Surat",
    pastCollabs: 1,
    rateCard: "₹24,000 long video",
    qualityRating: 3.4,
    reliabilityRating: 2.9,
    status: "On Hold",
    notes: "Previous delivery was 9 days late and required two correction rounds.",
  },
  {
    id: "CRT-548",
    name: "Deal Dhamaka Hindi",
    type: "Influencer",
    contactPerson: "Vikas Yadav",
    city: "Delhi",
    serviceArea: "Pan India",
    languages: ["Hindi"],
    category: "Discount and offer promotions",
    platforms: ["Instagram", "Facebook"],
    links: [{ platform: "Instagram", url: "https://instagram.com/dealdhamakahindi" }],
    followers: 610000,
    avgViews: 21000,
    engagementRate: 0.8,
    audienceLocation: "Scattered, low local relevance",
    pastCollabs: 0,
    rateCard: "₹40,000 reel",
    qualityRating: 2.1,
    reliabilityRating: 2.5,
    status: "Blocked",
    notes: "Blocked — engagement inconsistent with follower count, brand-safety concerns raised.",
  },
];

export const COLLABORATIONS: Collaboration[] = [
  {
    id: "COL-7001",
    creatorId: "CRT-501",
    title: "Jaipur Vaishali monsoon care review video",
    scope: "Store",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    campaignId: "CMP-8801",
    requestRef: "REQ-4410",
    rm: "Ritika Bansal",
    executive: "Nikhil Arora",
    objective: "Drive monsoon garment-care orders from Vaishali Nagar",
    targetAudience: "Families aged 28–45 in Vaishali Nagar",
    platform: "YouTube",
    format: "YouTube Long Video",
    deliverables: ["1 long video (8–10 min)", "1 YouTube Short cut", "2 Instagram stories with link"],
    requiredMessage: "Free pickup and delivery, 48-hour monsoon care turnaround",
    promoCode: "JAIRAIN20",
    callToAction: "Book a free pickup on the Clean Craft app",
    submissionDeadline: "2026-07-18",
    publishDate: "2026-07-22",
    amount: 45000,
    paymentTerms: "50% advance, 50% after publishing",
    paymentStatus: "Paid",
    status: "completed",
    nextAction: "Closed — creator marked as high performing",
    nextActionDue: "2026-08-01",
    notes: "Best cost per lead so far this quarter.",
    attachments: ["jaipur-brief.pdf", "published-screenshot.png"],
    approval: {
      audienceRelevance: "High — city lifestyle audience matches store catchment",
      locationRelevance: "High — 78% Jaipur audience",
      avgViews: 96000,
      engagement: 6.4,
      previousPerformance: "3 earlier collaborations, average CPL ₹142",
      quotedCost: 45000,
      estimatedReach: 110000,
      brandSuitability: "Suitable — family-safe content",
      riskNotes: "None",
      expectedLeads: 300,
      expectedCpl: 150,
      approvedBy: "Marketing Manager — Devika Rao",
      approvedOn: "2026-07-04",
    },
    brief: {
      talkingPoints: ["Monsoon fabric damage", "Clean Craft process", "Pickup convenience"],
      mandatoryClaims: ["Free pickup and delivery", "48-hour turnaround for monsoon care"],
      prohibitedClaims: ["Cheapest in city", "100% stain removal guarantee"],
      offerDetails: "20% off first monsoon care order",
      trackingLink: "https://cleancraft.in/r/JAIRAIN20",
      brandGuidelines: "Logo in first 30 seconds, brand blue palette",
      requiredShots: ["Store front", "Machine area", "Packed garments handover"],
      duration: "8–10 minutes",
      disclosure: "Paid partnership disclosure required in title and description",
      sharedOn: "2026-07-06",
    },
    versions: [
      {
        version: "V1",
        submittedOn: "2026-07-16",
        link: "https://drive.example.com/jaipur-v1",
        reviewer: "Nikhil Arora",
        decision: "correction required",
        comments: [
          { at: "2026-07-16", by: "Nikhil Arora", text: "02:14 — remove the '100% stain removal' line, it is a prohibited claim." },
          { at: "2026-07-16", by: "Devika Rao", text: "Add the promo code on screen at the end." },
        ],
      },
      {
        version: "V2",
        submittedOn: "2026-07-19",
        link: "https://drive.example.com/jaipur-v2",
        reviewer: "Devika Rao",
        decision: "approved",
        comments: [{ at: "2026-07-20", by: "Devika Rao", text: "Approved for publishing on 22 Jul." }],
      },
    ],
    publishProof: {
      liveLink: "https://youtube.com/watch?v=jaipur-cleancraft",
      platform: "YouTube",
      publishedAt: "2026-07-22 18:30",
      screenshot: "jaipur-live-screenshot.png",
      trackingRef: "JAIRAIN20 / cleancraft.in/r/JAIRAIN20",
      finalAmount: 45000,
    },
    results: {
      reach: 128000,
      views: 104300,
      watchTimeHours: 3120,
      likes: 6100,
      comments: 412,
      shares: 288,
      linkClicks: 3140,
      enquiries: 486,
      qualifiedLeads: 312,
      orders: 141,
      salesValue: 386000,
      period: "22 Jul – 05 Aug 2026",
      source: "Manual entry — YouTube Studio and POS screenshots attached",
    },
    audit: [
      { at: "2026-07-02", by: "Nikhil Arora", action: "Creator shortlisted for STR-1042" },
      { at: "2026-07-04", by: "Devika Rao", action: "Commercial approved at ₹45,000" },
      { at: "2026-07-22", by: "Nikhil Arora", action: "Publishing proof uploaded" },
      { at: "2026-08-01", by: "Nikhil Arora", action: "Results recorded and collaboration completed" },
    ],
  },
  {
    id: "COL-7014",
    creatorId: "CRT-514",
    title: "Pune Baner launch reel with homemaker angle",
    scope: "Store",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    campaignId: "CMP-8845",
    requestRef: "REQ-4468",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    objective: "Create launch-week awareness and first-order bookings",
    targetAudience: "Homemakers aged 30–50 in Baner and Aundh",
    platform: "Instagram",
    format: "Instagram Reel",
    deliverables: ["1 reel (45–60 sec)", "3 stories with link sticker"],
    requiredMessage: "Launch week free pickup, 30% off first order",
    promoCode: "BANER30",
    callToAction: "Swipe up to book a free pickup",
    submissionDeadline: "2026-08-09",
    publishDate: "2026-08-12",
    amount: 22000,
    paymentTerms: "100% after publishing",
    paymentStatus: "Not due",
    status: "brief_shared",
    nextAction: "Follow up for content submission by 09 Aug",
    nextActionDue: "2026-08-08",
    notes: "Launch week collaboration — tied to Baner store opening.",
    attachments: ["baner-brief.pdf"],
    approval: {
      audienceRelevance: "High — homemaker audience matches laundry subscription buyer",
      locationRelevance: "High — 84% Pune audience",
      avgViews: 41000,
      engagement: 8.1,
      previousPerformance: "1 earlier collaboration, CPL ₹168",
      quotedCost: 22000,
      estimatedReach: 52000,
      brandSuitability: "Suitable",
      riskNotes: "None",
      expectedLeads: 130,
      expectedCpl: 169,
      approvedBy: "Marketing Manager — Devika Rao",
      approvedOn: "2026-08-01",
    },
    brief: {
      talkingPoints: ["Time saved every week", "Pickup and delivery", "Launch offer"],
      mandatoryClaims: ["Free pickup during launch week", "30% off first order"],
      prohibitedClaims: ["Cheapest laundry", "Same-day guarantee"],
      offerDetails: "30% off first order till 31 Aug 2026",
      trackingLink: "https://cleancraft.in/r/BANER30",
      brandGuidelines: "Brand blue, store signage visible",
      requiredShots: ["Store front", "Pickup bag handover"],
      duration: "45–60 seconds",
      disclosure: "Paid partnership tag required",
      sharedOn: "2026-08-03",
    },
    versions: [],
    audit: [
      { at: "2026-07-30", by: "Nikhil Arora", action: "Creator shortlisted for STR-1134" },
      { at: "2026-08-01", by: "Devika Rao", action: "Commercial approved at ₹22,000" },
      { at: "2026-08-03", by: "Nikhil Arora", action: "Content brief shared with creator" },
    ],
  },
  {
    id: "COL-7020",
    creatorId: "CRT-522",
    title: "Lucknow Gomti Nagar store review video",
    scope: "Store",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    campaignId: "CMP-8812",
    requestRef: "REQ-4471",
    rm: "Sanya Kapoor",
    executive: "Nikhil Arora",
    objective: "Rebuild local trust after service complaints",
    targetAudience: "Working professionals aged 25–40 in Gomti Nagar",
    platform: "YouTube",
    format: "Product or Service Review",
    deliverables: ["1 review video (6–8 min)", "1 community post"],
    requiredMessage: "Quality checks at every stage, on-time delivery promise",
    promoCode: "LKO25",
    callToAction: "Book your first order with code LKO25",
    submissionDeadline: "2026-08-03",
    publishDate: "2026-08-10",
    amount: 28000,
    paymentTerms: "50% advance, 50% after publishing",
    paymentStatus: "Partly paid",
    status: "correction_required",
    nextAction: "Creator to resubmit V2 after removing the unapproved delivery-time claim",
    nextActionDue: "2026-08-05",
    notes: "Correction is overdue by a day — escalation drafted for the manager.",
    attachments: ["lucknow-brief.pdf"],
    approval: {
      audienceRelevance: "Medium-high — local business review audience",
      locationRelevance: "High — 71% Lucknow audience",
      avgViews: 58000,
      engagement: 5.2,
      previousPerformance: "2 earlier collaborations, CPL ₹210",
      quotedCost: 28000,
      estimatedReach: 64000,
      brandSuitability: "Suitable with claim supervision",
      riskNotes: "History of overstating service claims — review carefully",
      expectedLeads: 140,
      expectedCpl: 200,
      approvedBy: "Marketing Manager — Devika Rao",
      approvedOn: "2026-07-21",
    },
    brief: {
      talkingPoints: ["Quality process", "Complaint handling", "Delivery discipline"],
      mandatoryClaims: ["Quality check at every stage"],
      prohibitedClaims: ["Guaranteed same-day delivery", "Zero damage guarantee"],
      offerDetails: "25% off first order",
      trackingLink: "https://cleancraft.in/r/LKO25",
      brandGuidelines: "No competitor comparison",
      requiredShots: ["Store counter", "Quality check table"],
      duration: "6–8 minutes",
      disclosure: "Paid promotion disclosure in description",
      sharedOn: "2026-07-23",
    },
    versions: [
      {
        version: "V1",
        submittedOn: "2026-08-02",
        link: "https://drive.example.com/lucknow-v1",
        reviewer: "Nikhil Arora",
        decision: "correction required",
        comments: [
          { at: "2026-08-02", by: "Nikhil Arora", text: "04:38 — 'same-day delivery guaranteed' is a prohibited claim, please remove." },
          { at: "2026-08-02", by: "Devika Rao", text: "Add the promo code card at the end screen." },
        ],
      },
    ],
    audit: [
      { at: "2026-07-19", by: "Nikhil Arora", action: "Creator shortlisted for STR-1088" },
      { at: "2026-07-21", by: "Devika Rao", action: "Commercial approved at ₹28,000" },
      { at: "2026-08-02", by: "Nikhil Arora", action: "V1 reviewed — corrections requested" },
    ],
  },
  {
    id: "COL-7028",
    creatorId: "CRT-533",
    title: "Indore garment care reel — festive season",
    scope: "Store",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    campaignId: "CMP-8850",
    requestRef: "REQ-4480",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    objective: "Promote festive saree and ethnic wear care",
    targetAudience: "Women aged 24–40 in Vijay Nagar",
    platform: "Instagram",
    format: "Instagram Reel",
    deliverables: ["1 reel (30–45 sec)", "1 post"],
    requiredMessage: "Specialist ethnic wear care with hand finishing",
    promoCode: "FEST15",
    callToAction: "DM to book festive care pickup",
    submissionDeadline: "2026-08-11",
    publishDate: "2026-08-16",
    amount: 15000,
    paymentTerms: "100% after publishing",
    paymentStatus: "Not due",
    status: "internal_approval",
    nextAction: "Manager approval on ₹15,000 commercial",
    nextActionDue: "2026-08-07",
    notes: "First-time creator — approval requires manager sign-off.",
    attachments: [],
    approval: {
      audienceRelevance: "High — fashion audience for ethnic wear care",
      locationRelevance: "Medium — 66% Indore",
      avgViews: 27000,
      engagement: 7.3,
      previousPerformance: "No previous Clean Craft collaboration",
      quotedCost: 15000,
      estimatedReach: 34000,
      brandSuitability: "Suitable",
      riskNotes: "Unproven with Clean Craft — start with a single reel",
      expectedLeads: 85,
      expectedCpl: 176,
    },
    versions: [],
    audit: [{ at: "2026-08-04", by: "Nikhil Arora", action: "Creator shortlisted and sent for internal approval" }],
  },
  {
    id: "COL-7033",
    creatorId: "CRT-501",
    title: "Company monsoon campaign — YouTube Short series",
    scope: "Company Campaign",
    city: "Multi-city",
    campaignRef: "Monsoon Care 2026",
    campaignId: "CMP-8860",
    executive: "Nikhil Arora",
    objective: "National awareness for the monsoon care service",
    targetAudience: "Urban households in Tier-1 and Tier-2 cities",
    platform: "YouTube",
    format: "YouTube Short",
    deliverables: ["3 shorts (30 sec each)"],
    requiredMessage: "Monsoon care service now in 22 stores",
    promoCode: "MONSOON2026",
    callToAction: "Find your nearest Clean Craft store",
    submissionDeadline: "2026-08-04",
    publishDate: "2026-08-08",
    amount: 54000,
    paymentTerms: "50% advance, 50% after publishing",
    paymentStatus: "Partly paid",
    status: "under_review",
    nextAction: "Review V1 shorts and share approval by 07 Aug",
    nextActionDue: "2026-08-07",
    notes: "Company campaign — no Store ID, linked to Campaign ID CMP-8860.",
    attachments: ["monsoon-brief.pdf"],
    approval: {
      audienceRelevance: "High",
      locationRelevance: "Medium — multi-city reach",
      avgViews: 96000,
      engagement: 6.4,
      previousPerformance: "Best performing creator, average CPL ₹142",
      quotedCost: 54000,
      estimatedReach: 240000,
      brandSuitability: "Suitable",
      riskNotes: "None",
      expectedLeads: 420,
      expectedCpl: 129,
      approvedBy: "Marketing Manager — Devika Rao",
      approvedOn: "2026-07-26",
    },
    brief: {
      talkingPoints: ["Monsoon fabric damage", "Store network", "Booking process"],
      mandatoryClaims: ["Available at 22 Clean Craft stores"],
      prohibitedClaims: ["Cheapest in India"],
      offerDetails: "Monsoon care starter pack",
      trackingLink: "https://cleancraft.in/r/MONSOON2026",
      brandGuidelines: "Consistent brand end card across all three shorts",
      requiredShots: ["Rain visual", "Garment care process"],
      duration: "30 seconds each",
      disclosure: "Paid partnership disclosure required",
      sharedOn: "2026-07-28",
    },
    versions: [
      {
        version: "V1",
        submittedOn: "2026-08-04",
        link: "https://drive.example.com/monsoon-shorts-v1",
        reviewer: "Nikhil Arora",
        decision: "under review",
        comments: [{ at: "2026-08-05", by: "Nikhil Arora", text: "00:12 — end card branding is too small on short 2." }],
      },
    ],
    audit: [
      { at: "2026-07-24", by: "Nikhil Arora", action: "Creator shortlisted for the company monsoon campaign" },
      { at: "2026-07-26", by: "Devika Rao", action: "Commercial approved at ₹54,000" },
      { at: "2026-08-04", by: "Nikhil Arora", action: "V1 received, review in progress" },
    ],
  },
  {
    id: "COL-7040",
    creatorId: "CRT-514",
    title: "Pune festive story series",
    scope: "Store",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    campaignId: "CMP-8845",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    objective: "Festive week reminder for pickup bookings",
    targetAudience: "Existing Baner customers",
    platform: "Instagram",
    format: "Instagram Story",
    deliverables: ["4 stories with link sticker"],
    requiredMessage: "Festive care slots open",
    promoCode: "BANERFEST",
    callToAction: "Tap to book a slot",
    submissionDeadline: "2026-08-06",
    publishDate: "2026-08-09",
    amount: 6000,
    paymentTerms: "100% after publishing",
    paymentStatus: "Not due",
    status: "scheduled",
    nextAction: "Confirm publishing on 09 Aug and collect proof",
    nextActionDue: "2026-08-09",
    notes: "Approved content, publishing scheduled.",
    attachments: [],
    approval: {
      audienceRelevance: "High",
      locationRelevance: "High",
      avgViews: 41000,
      engagement: 8.1,
      previousPerformance: "CPL ₹168 on the previous reel",
      quotedCost: 6000,
      estimatedReach: 24000,
      brandSuitability: "Suitable",
      riskNotes: "None",
      expectedLeads: 45,
      expectedCpl: 133,
      approvedBy: "Marketing Manager — Devika Rao",
      approvedOn: "2026-08-02",
    },
    brief: {
      talkingPoints: ["Festive slots", "Pickup timing"],
      mandatoryClaims: ["Free pickup"],
      prohibitedClaims: ["Same-day guarantee"],
      offerDetails: "Festive slot booking",
      trackingLink: "https://cleancraft.in/r/BANERFEST",
      brandGuidelines: "Brand sticker on each story",
      requiredShots: ["Pickup bag"],
      duration: "15 seconds each",
      disclosure: "Paid partnership tag required",
      sharedOn: "2026-08-03",
    },
    versions: [
      {
        version: "V1",
        submittedOn: "2026-08-05",
        link: "https://drive.example.com/baner-stories-v1",
        reviewer: "Devika Rao",
        decision: "approved",
        comments: [{ at: "2026-08-05", by: "Devika Rao", text: "Approved — schedule for 09 Aug." }],
      },
    ],
    audit: [
      { at: "2026-08-01", by: "Nikhil Arora", action: "Collaboration created for STR-1134" },
      { at: "2026-08-05", by: "Devika Rao", action: "Content approved and scheduled" },
    ],
  },
  {
    id: "COL-7044",
    creatorId: "CRT-540",
    title: "Surat Adajan vlog feature",
    scope: "Store",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    city: "Surat",
    campaignId: "CMP-8830",
    requestRef: "REQ-4455",
    rm: "Yash Malhotra",
    executive: "Nikhil Arora",
    objective: "Local visibility for the Adajan store",
    targetAudience: "Surat families aged 28–45",
    platform: "YouTube",
    format: "YouTube Long Video",
    deliverables: ["1 vlog feature segment"],
    requiredMessage: "Premium garment care in Adajan",
    promoCode: "ADAJAN20",
    callToAction: "Visit the Adajan store",
    submissionDeadline: "2026-07-28",
    publishDate: "2026-08-02",
    amount: 24000,
    paymentTerms: "50% advance, 50% after publishing",
    paymentStatus: "On hold",
    status: "on_hold",
    nextAction: "Hold until the Google listing suspension for STR-1103 is resolved",
    nextActionDue: "2026-08-12",
    notes: "Content submission is overdue and the store listing is suspended — collaboration paused.",
    attachments: [],
    approval: {
      audienceRelevance: "Medium",
      locationRelevance: "High — 69% Surat",
      avgViews: 33000,
      engagement: 3.9,
      previousPerformance: "1 earlier collaboration delivered 9 days late",
      quotedCost: 24000,
      estimatedReach: 38000,
      brandSuitability: "Suitable",
      riskNotes: "Reliability rating 2.9 — monitor deadlines closely",
      expectedLeads: 95,
      expectedCpl: 253,
      approvedBy: "Marketing Manager — Devika Rao",
      approvedOn: "2026-07-14",
    },
    brief: {
      talkingPoints: ["Store walkthrough", "Service range"],
      mandatoryClaims: ["Premium garment care"],
      prohibitedClaims: ["Cheapest in Surat"],
      offerDetails: "20% off first order",
      trackingLink: "https://cleancraft.in/r/ADAJAN20",
      brandGuidelines: "Store signage visible",
      requiredShots: ["Store front", "Counter"],
      duration: "3 minute segment",
      disclosure: "Paid promotion disclosure required",
      sharedOn: "2026-07-16",
    },
    versions: [],
    audit: [
      { at: "2026-07-12", by: "Nikhil Arora", action: "Creator shortlisted for STR-1103" },
      { at: "2026-07-14", by: "Devika Rao", action: "Commercial approved at ₹24,000" },
      { at: "2026-08-01", by: "Nikhil Arora", action: "Content overdue — collaboration put on hold" },
    ],
  },
  {
    id: "COL-7048",
    creatorId: "CRT-548",
    title: "Pan-India discount reel proposal",
    scope: "Company Campaign",
    city: "Multi-city",
    campaignRef: "Monsoon Care 2026",
    campaignId: "CMP-8860",
    executive: "Nikhil Arora",
    objective: "Wide-reach offer promotion",
    targetAudience: "Deal seekers",
    platform: "Instagram",
    format: "Instagram Reel",
    deliverables: ["1 reel"],
    requiredMessage: "Monsoon offer",
    promoCode: "—",
    callToAction: "Book now",
    submissionDeadline: "—",
    publishDate: "—",
    amount: 40000,
    paymentTerms: "—",
    paymentStatus: "Not due",
    status: "rejected",
    nextAction: "Closed — creator moved to Blocked in the directory",
    nextActionDue: "2026-07-30",
    notes: "Rejected: 0.8% engagement against 610k followers and brand-safety concerns.",
    attachments: ["engagement-audit.png"],
    approval: {
      audienceRelevance: "Low — no local relevance",
      locationRelevance: "Low",
      avgViews: 21000,
      engagement: 0.8,
      previousPerformance: "None",
      quotedCost: 40000,
      estimatedReach: 60000,
      brandSuitability: "Not suitable — inflated follower profile",
      riskNotes: "Brand-safety concern escalated to the manager",
      expectedLeads: 40,
      expectedCpl: 1000,
    },
    versions: [],
    audit: [
      { at: "2026-07-27", by: "Nikhil Arora", action: "Proposal received and audited" },
      { at: "2026-07-30", by: "Devika Rao", action: "Rejected on brand-safety and engagement grounds" },
    ],
  },
];

export const creatorById = (id: string) => CREATORS.find((c) => c.id === id);

export const isCollabOverdue = (c: Collaboration) =>
  !["completed", "rejected", "cancelled", "results_recorded"].includes(c.status) &&
  ((c.submissionDeadline !== "—" && c.submissionDeadline < COLLAB_TODAY && c.versions.length === 0) ||
    c.nextActionDue < COLLAB_TODAY);

/** Content cannot be scheduled or published before approval. */
export const isContentApproved = (c: Collaboration) => c.versions.some((v) => v.decision === "approved");

/** A collaboration cannot be completed until publishing proof and results are recorded. */
export const canComplete = (c: Collaboration) => !!c.publishProof && !!c.results;

/** Only an authorised manager may approve commercial collaboration. */
export const isCommercialApproved = (c: Collaboration) => !!c.approval.approvedBy;

export function collabAlerts(c: Collaboration): { text: string; critical: boolean }[] {
  const a: { text: string; critical: boolean }[] = [];
  if (c.status === "internal_approval") a.push({ text: "Internal approval pending", critical: false });
  if (isCommercialApproved(c) && !c.brief?.sharedOn && !["rejected", "cancelled"].includes(c.status))
    a.push({ text: "Content brief not shared with the creator", critical: false });
  if (c.submissionDeadline !== "—" && c.submissionDeadline < COLLAB_TODAY && c.versions.length === 0 && !["rejected", "cancelled", "completed"].includes(c.status))
    a.push({ text: "Content submission overdue", critical: false });
  if (c.status === "correction_required" && c.nextActionDue < COLLAB_TODAY)
    a.push({ text: "Correction overdue", critical: false });
  if (c.status === "scheduled" && c.publishDate !== "—" && c.publishDate <= "2026-08-09")
    a.push({ text: "Publishing date approaching", critical: false });
  if (c.status === "scheduled" && c.publishDate !== "—" && c.publishDate < COLLAB_TODAY)
    a.push({ text: "Content not published as agreed", critical: false });
  if (c.status === "published" && !c.publishProof) a.push({ text: "Publishing proof missing", critical: false });
  if (c.publishProof && !c.results) a.push({ text: "Results not updated", critical: false });
  if (c.paymentStatus === "On hold") a.push({ text: "Payment issue — payment on hold", critical: false });
  if (c.approval.brandSuitability.toLowerCase().startsWith("not suitable") || c.approval.riskNotes.toLowerCase().includes("brand-safety"))
    a.push({ text: "Brand-safety concern — escalated to the authorised manager", critical: true });
  return a;
}

export const cpl = (c: Collaboration) =>
  c.results && c.results.qualifiedLeads > 0 ? Math.round(c.amount / c.results.qualifiedLeads) : null;

export const cpa = (c: Collaboration) =>
  c.results && c.results.orders > 0 ? Math.round(c.amount / c.results.orders) : null;

export const roas = (c: Collaboration) =>
  c.results && c.amount > 0 ? +(c.results.salesValue / c.amount).toFixed(2) : null;

/** Performance data prepared here; the final KPI score is computed on the Performance page. */
export const COLLAB_PERFORMANCE_PREP = {
  collaborationsCompleted: 6,
  onTimeCoordinationRate: 82,
  avgApprovalTurnaroundHours: 26,
  overdueDeliverables: 2,
  avgCorrectionRounds: 1.3,
  qualifiedLeads: 968,
  orders: 402,
  salesValue: 1124000,
  avgCostPerLead: 168,
  creatorReturn: 4.6,
  highPerformingCreators: ["Jaipur Food & Life — Ankit Sharma", "Pune Homemaker Diaries — Sneha Kulkarni"],
  source: "Manual entry until YouTube, Meta, tracking-link and payment integrations are connected",
};
