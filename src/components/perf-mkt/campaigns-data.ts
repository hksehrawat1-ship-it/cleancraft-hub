/**
 * Google & Meta Campaign records for the Performance Marketing Executive workspace.
 *
 * Lineage: Store ID -> Request ID -> Campaign ID -> Creative ID -> Lead ID -> Order / Sale
 * A campaign keeps ONE permanent Campaign ID; budget and optimisation changes append
 * to history and never overwrite earlier settings.
 */

import type { Tone } from "./data";

export const CAMPAIGN_TODAY = "2026-08-06";

export const OBJECTIVES = [
  "Lead Generation",
  "Phone Calls",
  "WhatsApp Enquiries",
  "Store Visits",
  "Online Orders",
  "Local Awareness",
  "Offer Promotion",
  "Franchise Promotion",
  "App Installation",
  "Video Views",
  "Retargeting",
  "Other Approved Objective",
] as const;
export type Objective = (typeof OBJECTIVES)[number];

export type CampaignStage =
  | "draft"
  | "approval_pending"
  | "approved"
  | "creative_pending"
  | "ready_to_launch"
  | "active"
  | "optimisation_required"
  | "paused"
  | "budget_exhausted"
  | "completed"
  | "report_submitted"
  | "closed"
  | "information_required"
  | "rejected"
  | "cancelled";

export const campaignStageMeta: Record<CampaignStage, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "draft" },
  approval_pending: { label: "Approval Pending", tone: "attention" },
  approved: { label: "Approved", tone: "healthy" },
  creative_pending: { label: "Creative Pending", tone: "attention" },
  ready_to_launch: { label: "Ready to Launch", tone: "active" },
  active: { label: "Active", tone: "active" },
  optimisation_required: { label: "Optimisation Required", tone: "overdue" },
  paused: { label: "Paused", tone: "draft" },
  budget_exhausted: { label: "Budget Exhausted", tone: "overdue" },
  completed: { label: "Completed", tone: "healthy" },
  report_submitted: { label: "Report Submitted", tone: "healthy" },
  closed: { label: "Closed", tone: "healthy" },
  information_required: { label: "Information Required", tone: "attention" },
  rejected: { label: "Rejected", tone: "overdue" },
  cancelled: { label: "Cancelled", tone: "draft" },
};

export const CAMPAIGN_FLOW: CampaignStage[] = [
  "draft",
  "approval_pending",
  "approved",
  "creative_pending",
  "ready_to_launch",
  "active",
  "optimisation_required",
  "completed",
  "report_submitted",
  "closed",
];

export const APPROVAL_CHECKLIST = [
  "Correct Store ID",
  "Clear business objective",
  "Target audience defined",
  "Budget approved",
  "Campaign dates confirmed",
  "Creative approved",
  "Offer approved",
  "Destination link tested",
  "Contact details verified",
  "Lead handover owner assigned",
  "Tracking fields prepared",
  "Terms and conditions available",
];

export type Audience = {
  city: string;
  radiusKm: number;
  locations: string;
  ageRange: string;
  language: string;
  interests: string;
  customerType: "new" | "existing" | "both";
  excluded: string;
  retargeting?: string;
};

export type Targets = {
  approved: boolean;
  approver: string;
  startDate: string;
  endDate: string;
  leadTarget: number;
  orderTarget: number;
};

export type CreativeBlock = {
  creativeId: string;
  type: string;
  headline: string;
  primaryText: string;
  description: string;
  offer: string;
  cta: string;
  destination: string;
  landingPage: string;
  phone: string;
  whatsapp: string;
  terms: string;
  approval: "approved" | "pending" | "rejected" | "correction";
};

export type LeadHandover = {
  destination: string;
  store: string;
  rm: string;
  salesTeam?: string;
  responseTimeHours: number;
  notification: string;
  duplicateCheck: boolean;
  qualificationFields: string[];
};

export type Metrics = {
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  qualified: number;
  calls: number;
  whatsapp: number;
  orders: number;
  ordersVerified: boolean;
};

export type DailyUpdate = {
  date: string;
  leads: number;
  qualified: number;
  orders: number;
  observation: string;
  action: string;
  nextReview: string;
};

export type OptimisationEntry = {
  date: string;
  problem: string;
  change: string;
  targetChange?: string;
  audienceChange?: string;
  creativeChange?: string;
  expected: string;
  reviewDate: string;
  outcome?: string;
};

export type CampaignReport = {
  leads: number;
  qualified: number;
  orders: number;
  bestCreative: string;
  bestAudience: string;
  learning: string;
  nextAction: string;
  rmReview: "pending" | "approved" | "correction";
};

export type CampaignRecord = {
  id: string;
  name: string;
  storeId: string;
  store: string;
  city: string;
  state: string;
  requestId?: string;
  rm: string;
  executive: string;
  platform: "Google Ads" | "Meta Ads";
  objective: Objective;
  stage: CampaignStage;
  serviceArea: string;
  problem: string;
  outcome: string;
  targets: Targets;
  audience: Audience;
  creatives: CreativeBlock[];
  handover: LeadHandover;
  metrics: Metrics;
  leadsContacted: number;
  linkPassed: boolean;
  daily: DailyUpdate[];
  optimisations: OptimisationEntry[];
  checklist: string[];
  report?: CampaignReport;
  history: { at: string; actor: string; detail: string }[];
};

const baseHandover = (store: string, rm: string): LeadHandover => ({
  destination: "Store CRM queue",
  store,
  rm,
  salesTeam: "Store front desk",
  responseTimeHours: 4,
  notification: "In-app notification placeholder (no WhatsApp/email API yet)",
  duplicateCheck: true,
  qualificationFields: ["Service required", "Garment count", "Pickup pin code", "Preferred slot"],
});

export const CAMPAIGNS_FULL: CampaignRecord[] = [
  {
    id: "CMP-8821",
    name: "Jaipur — Premium garment care leads",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    state: "Rajasthan",
    requestId: "REQ-3344",
    rm: "Ritika Bansal",
    executive: "Nikhil Arora",
    platform: "Meta Ads",
    objective: "Lead Generation",
    stage: "active",
    serviceArea: "Vaishali Nagar, Ajmer Road — 8 km",
    problem: "Premium garment care revenue flat for two months.",
    outcome: "60 qualified leads and 25 premium orders this month.",
    spend: 38400,
    budget: {
      type: "daily",
      daily: 1500,
      total: 45000,
      approved: 45000,
      approver: "Marketing Head",
      startDate: "2026-07-18",
      endDate: "2026-08-17",
      expectedCpl: 600,
      leadTarget: 75,
      salesTarget: 450000,
    },
    audience: {
      city: "Jaipur",
      radiusKm: 8,
      locations: "Vaishali Nagar, Mansarovar, Ajmer Road",
      ageRange: "28–55",
      language: "Hindi, English",
      interests: "Premium apparel, home services, luxury retail",
      customerType: "new",
      excluded: "Existing customers list (Jul 2026)",
      retargeting: "Website visitors 30 days",
    },
    creatives: [
      {
        creativeId: "CRV-4402",
        type: "Static + carousel",
        headline: "Premium garment care, doorstep pickup",
        primaryText: "Suits, sarees and woollens cleaned by trained experts. Free pickup in Vaishali Nagar.",
        description: "Trial pack ₹1299",
        offer: "Premium care trial ₹1299",
        cta: "Get quote",
        destination: "cleancraft.in/jaipur-premium",
        landingPage: "Store landing page (Jaipur Vaishali)",
        phone: "+91 98290 41220",
        whatsapp: "+91 98290 41220",
        terms: "Offer valid till 17 Aug 2026 on orders above ₹1299.",
        approval: "approved",
      },
    ],
    handover: baseHandover("Clean Craft Jaipur — Vaishali", "Ritika Bansal"),
    metrics: {
      impressions: 412000,
      reach: 168000,
      clicks: 7420,
      leads: 68,
      qualified: 46,
      calls: 31,
      whatsapp: 22,
      orders: 27,
      salesAmount: 268000,
      salesVerified: true,
    },
    leadsContacted: 61,
    linkPassed: true,
    daily: [
      { date: "2026-08-05", spend: 1480, leads: 4, qualified: 3, orders: 2, sales: 18400, observation: "Carousel outperforming static", action: "Shifted 60% budget to carousel", nextReview: "2026-08-08" },
      { date: "2026-08-04", spend: 1520, leads: 3, qualified: 2, orders: 1, sales: 9200, observation: "CPL steady at ₹565", action: "No change", nextReview: "2026-08-06" },
    ],
    optimisations: [
      { date: "2026-08-05", problem: "Static creative CPL ₹840", change: "Budget shifted to carousel creative", budgetChange: "₹900 → ₹1,500 daily", creativeChange: "Static paused", expected: "CPL below ₹600", reviewDate: "2026-08-08", outcome: "CPL ₹565 achieved" },
    ],
    checklist: [...APPROVAL_CHECKLIST],
    history: [
      { at: "2026-07-16", actor: "Nikhil Arora", detail: "Campaign created from REQ-3344 (Store STR-1042)" },
      { at: "2026-07-17", actor: "Marketing Head", detail: "Budget approved ₹45,000" },
      { at: "2026-07-18", actor: "Nikhil Arora", detail: "Campaign launched with CRV-4402" },
    ],
  },
  {
    id: "CMP-8834",
    name: "Lucknow — Monsoon care lead-gen",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    requestId: "REQ-3372",
    rm: "Sanya Kapoor",
    executive: "Nikhil Arora",
    platform: "Meta Ads",
    objective: "Lead Generation",
    stage: "report_submitted",
    serviceArea: "Gomti Nagar, Vibhuti Khand — 5 km",
    problem: "Store below break-even on monthly orders.",
    outcome: "100 qualified leads in 15 days.",
    spend: 41800,
    budget: {
      type: "total",
      daily: 2800,
      total: 45000,
      approved: 45000,
      approver: "Marketing Head",
      startDate: "2026-07-22",
      endDate: "2026-08-05",
      expectedCpl: 700,
      leadTarget: 65,
      salesTarget: 200000,
    },
    audience: {
      city: "Lucknow",
      radiusKm: 5,
      locations: "Gomti Nagar, Vibhuti Khand, Indira Nagar",
      ageRange: "25–50",
      language: "Hindi",
      interests: "Household services, laundry, families",
      customerType: "both",
      excluded: "Outside 5 km radius",
    },
    creatives: [
      {
        creativeId: "CRV-4451",
        type: "Video + static set",
        headline: "Monsoon care package ₹699",
        primaryText: "Damp clothes? Get monsoon-safe cleaning with free pickup and delivery.",
        description: "Package of 5 garments",
        offer: "Monsoon care package ₹699",
        cta: "Book pickup",
        destination: "cleancraft.in/lucknow-monsoon",
        landingPage: "Store landing page (Gomti Nagar)",
        phone: "+91 99356 71104",
        whatsapp: "+91 99356 71104",
        terms: "Valid 22 Jul – 05 Aug 2026.",
        approval: "approved",
      },
    ],
    handover: baseHandover("Clean Craft Lucknow — Gomti Nagar", "Sanya Kapoor"),
    metrics: {
      impressions: 386000,
      reach: 142000,
      clicks: 6210,
      leads: 64,
      qualified: 41,
      calls: 27,
      whatsapp: 19,
      orders: 22,
      salesAmount: 186000,
      salesVerified: true,
    },
    leadsContacted: 58,
    linkPassed: true,
    daily: [
      { date: "2026-08-05", spend: 2600, leads: 5, qualified: 3, orders: 2, sales: 16800, observation: "Final day — budget fully used", action: "Campaign completed, report prepared", nextReview: "2026-08-07" },
    ],
    optimisations: [
      { date: "2026-07-29", problem: "Qualified rate only 52%", change: "Added garment-count question to lead form", expected: "Qualified rate above 62%", reviewDate: "2026-08-02", outcome: "Qualified rate 64%" },
    ],
    checklist: [...APPROVAL_CHECKLIST],
    report: {
      spend: 41800,
      leads: 64,
      qualified: 41,
      orders: 22,
      salesAmount: 186000,
      bestCreative: "CRV-4451 video variant",
      bestAudience: "Gomti Nagar households 30–45",
      learning: "Package pricing converts better than percentage discounts.",
      nextAction: "Continue at ₹30,000/month with the video creative.",
      rmReview: "pending",
    },
    history: [
      { at: "2026-07-21", actor: "Nikhil Arora", detail: "Campaign created from REQ-3372 (Store STR-1088)" },
      { at: "2026-07-22", actor: "Nikhil Arora", detail: "Launched — CRV-4451 approved" },
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "Completion report submitted to Sanya Kapoor" },
    ],
  },
  {
    id: "CMP-8840",
    name: "Surat — Local search restart",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    city: "Surat",
    state: "Gujarat",
    requestId: "REQ-3388",
    rm: "Yash Malhotra",
    executive: "Nikhil Arora",
    platform: "Google Ads",
    objective: "Phone Calls",
    stage: "approval_pending",
    serviceArea: "Adajan, Pal, Rander — 6 km",
    problem: "Enquiries dropped 34% after the old search campaign was paused.",
    outcome: "80 calls and 40 orders per month.",
    spend: 0,
    budget: {
      type: "daily",
      daily: 1300,
      total: 40000,
      approved: 0,
      approver: "Pending — Accounts",
      startDate: "2026-08-08",
      endDate: "2026-09-07",
      expectedCpl: 500,
      leadTarget: 80,
      salesTarget: 300000,
    },
    audience: {
      city: "Surat",
      radiusKm: 6,
      locations: "Adajan, Pal, Rander",
      ageRange: "25–55",
      language: "Gujarati, Hindi",
      interests: "Search intent — dry cleaning, laundry near me",
      customerType: "new",
      excluded: "Outside service pin codes",
    },
    creatives: [
      {
        creativeId: "CRV-4490",
        type: "Search RSA",
        headline: "Dry cleaning in Adajan — free pickup",
        primaryText: "Same-day dry cleaning with doorstep pickup. Call now.",
        description: "First order 15% off",
        offer: "First order 15% off",
        cta: "Call now",
        destination: "cleancraft.in/surat-adajan",
        landingPage: "Store landing page (Adajan)",
        phone: "+91 90999 22415",
        whatsapp: "+91 90999 22415",
        terms: "Discount on first order only.",
        approval: "pending",
      },
    ],
    handover: baseHandover("Clean Craft Surat — Adajan", "Yash Malhotra"),
    metrics: { impressions: 0, reach: 0, clicks: 0, leads: 0, qualified: 0, calls: 0, whatsapp: 0, orders: 0, salesAmount: 0, salesVerified: false },
    leadsContacted: 0,
    linkPassed: true,
    daily: [],
    optimisations: [],
    checklist: APPROVAL_CHECKLIST.filter((c) => !["Budget approved", "Creative approved"].includes(c)),
    history: [
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "Campaign drafted from REQ-3388 (Store STR-1103)" },
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "Submitted for budget approval ₹40,000" },
    ],
  },
  {
    id: "CMP-8842",
    name: "Indore — Weekday offer search",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    platform: "Google Ads",
    objective: "Offer Promotion",
    stage: "optimisation_required",
    serviceArea: "Vijay Nagar, Scheme 54 — 4 km",
    problem: "Weekday order volume low.",
    outcome: "40 extra weekday orders.",
    spend: 21400,
    budget: {
      type: "daily",
      daily: 900,
      total: 27000,
      approved: 27000,
      approver: "Marketing Head",
      startDate: "2026-07-14",
      endDate: "2026-08-13",
      expectedCpl: 450,
      leadTarget: 60,
      salesTarget: 240000,
    },
    audience: {
      city: "Indore",
      radiusKm: 4,
      locations: "Vijay Nagar, Scheme 54, Bhawarkuan",
      ageRange: "24–45",
      language: "Hindi, English",
      interests: "Working professionals, IT parks",
      customerType: "both",
      excluded: "Weekend-only searches",
    },
    creatives: [
      {
        creativeId: "CRV-4468",
        type: "Search RSA",
        headline: "Weekday 20% off dry cleaning",
        primaryText: "Book Monday to Thursday and save 20%.",
        description: "Free pickup above ₹599",
        offer: "Weekday 20% off pickup",
        cta: "Book now",
        destination: "cleancraft.in/indore-weekday",
        landingPage: "Store landing page (Vijay Nagar)",
        phone: "+91 99770 51188",
        whatsapp: "+91 99770 51188",
        terms: "Weekdays only, till 13 Aug 2026.",
        approval: "approved",
      },
    ],
    handover: baseHandover("Clean Craft Indore — Vijay Nagar", "Aakash Menon"),
    metrics: {
      impressions: 154000,
      reach: 71000,
      clicks: 3120,
      leads: 24,
      qualified: 11,
      calls: 14,
      whatsapp: 6,
      orders: 7,
      salesAmount: 62000,
      salesVerified: false,
    },
    leadsContacted: 15,
    linkPassed: true,
    daily: [
      { date: "2026-08-05", spend: 880, leads: 1, qualified: 0, orders: 0, sales: 0, observation: "CPL ₹891 — above approved ₹450", action: "Keyword review scheduled", nextReview: "2026-08-07" },
    ],
    optimisations: [
      { date: "2026-08-02", problem: "Broad keywords wasting spend", change: "Added 32 negative keywords", bidChange: "Manual CPC cap ₹28", expected: "CPL below ₹550", reviewDate: "2026-08-06", outcome: "Partial improvement" },
    ],
    checklist: [...APPROVAL_CHECKLIST],
    history: [
      { at: "2026-07-13", actor: "Nikhil Arora", detail: "Campaign created for STR-1067" },
      { at: "2026-07-14", actor: "Nikhil Arora", detail: "Launched with CRV-4468" },
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "Flagged for optimisation — CPL above target" },
    ],
  },
  {
    id: "CMP-8845",
    name: "Pune — Baner launch awareness",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    state: "Maharashtra",
    requestId: "REQ-3376",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    platform: "Meta Ads",
    objective: "Local Awareness",
    stage: "creative_pending",
    serviceArea: "Baner, Balewadi — 5 km",
    problem: "New store has no local awareness before launch.",
    outcome: "Launch-week footfall and 50 first orders.",
    spend: 0,
    budget: {
      type: "total",
      daily: 800,
      total: 20000,
      approved: 20000,
      approver: "Marketing Head",
      startDate: "2026-08-10",
      endDate: "2026-08-24",
      expectedCpl: 400,
      leadTarget: 50,
      salesTarget: 150000,
    },
    audience: {
      city: "Pune",
      radiusKm: 5,
      locations: "Baner, Balewadi, Aundh",
      ageRange: "24–48",
      language: "Marathi, Hindi, English",
      interests: "New residents, apartment societies",
      customerType: "new",
      excluded: "—",
    },
    creatives: [
      {
        creativeId: "CRV-4492",
        type: "Launch reel + static",
        headline: "Clean Craft is now open in Baner",
        primaryText: "Launch week 25% off on all dry cleaning.",
        description: "Free pickup and delivery",
        offer: "Launch week 25% off",
        cta: "Learn more",
        destination: "cleancraft.in/pune-baner",
        landingPage: "Store landing page (Baner)",
        phone: "+91 88888 41290",
        whatsapp: "+91 88888 41290",
        terms: "Valid launch week only.",
        approval: "correction",
      },
    ],
    handover: baseHandover("Clean Craft Pune — Baner", "Aakash Menon"),
    metrics: { impressions: 0, reach: 0, clicks: 0, leads: 0, qualified: 0, calls: 0, whatsapp: 0, orders: 0, salesAmount: 0, salesVerified: false },
    leadsContacted: 0,
    linkPassed: false,
    daily: [],
    optimisations: [],
    checklist: APPROVAL_CHECKLIST.filter((c) => !["Creative approved", "Destination link tested"].includes(c)),
    history: [
      { at: "2026-08-03", actor: "Nikhil Arora", detail: "Campaign created from REQ-3376 (Store STR-1134)" },
      { at: "2026-08-04", actor: "Marketing Head", detail: "Budget approved ₹20,000" },
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "CRV-4492 sent back for correction — offer wording" },
    ],
  },
  {
    id: "CMP-8802",
    name: "Indore — Weekday offer (July)",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    requestId: "REQ-3358",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    platform: "Google Ads",
    objective: "Online Orders",
    stage: "closed",
    serviceArea: "Vijay Nagar — 4 km",
    problem: "Weekday order volume low.",
    outcome: "40 extra orders.",
    spend: 23600,
    budget: {
      type: "total",
      daily: 850,
      total: 25000,
      approved: 25000,
      approver: "Marketing Head",
      startDate: "2026-07-04",
      endDate: "2026-07-19",
      expectedCpl: 450,
      leadTarget: 55,
      salesTarget: 200000,
    },
    audience: {
      city: "Indore",
      radiusKm: 4,
      locations: "Vijay Nagar, Scheme 54",
      ageRange: "24–45",
      language: "Hindi",
      interests: "Working professionals",
      customerType: "both",
      excluded: "—",
    },
    creatives: [
      {
        creativeId: "CRV-4380",
        type: "Search RSA",
        headline: "Weekday laundry offer",
        primaryText: "20% off weekday pickups.",
        description: "Free pickup",
        offer: "Weekday 20% off",
        cta: "Book now",
        destination: "cleancraft.in/indore-weekday",
        landingPage: "Store landing page (Vijay Nagar)",
        phone: "+91 99770 51188",
        whatsapp: "+91 99770 51188",
        terms: "Weekdays only.",
        approval: "approved",
      },
    ],
    handover: baseHandover("Clean Craft Indore — Vijay Nagar", "Aakash Menon"),
    metrics: {
      impressions: 168000,
      reach: 78000,
      clicks: 3480,
      leads: 58,
      qualified: 39,
      calls: 22,
      whatsapp: 14,
      orders: 34,
      salesAmount: 214000,
      salesVerified: true,
    },
    leadsContacted: 58,
    linkPassed: true,
    daily: [],
    optimisations: [],
    checklist: [...APPROVAL_CHECKLIST],
    report: {
      spend: 23600,
      leads: 58,
      qualified: 39,
      orders: 34,
      salesAmount: 214000,
      bestCreative: "CRV-4380 headline B",
      bestAudience: "Vijay Nagar professionals 28–40",
      learning: "Weekday-only messaging lifts weekday capacity use.",
      nextAction: "Repeat monthly with ₹25,000 budget.",
      rmReview: "approved",
    },
    history: [
      { at: "2026-07-03", actor: "Nikhil Arora", detail: "Campaign created from REQ-3358 (Store STR-1067)" },
      { at: "2026-07-19", actor: "Nikhil Arora", detail: "Completion report submitted" },
      { at: "2026-07-20", actor: "Aakash Menon (RM)", detail: "Report approved — campaign closed" },
    ],
  },
  {
    id: "CMP-8848",
    name: "Jaipur — Shoe laundry retargeting",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    state: "Rajasthan",
    rm: "Ritika Bansal",
    executive: "Nikhil Arora",
    platform: "Meta Ads",
    objective: "Retargeting",
    stage: "budget_exhausted",
    serviceArea: "Vaishali Nagar — 8 km",
    problem: "Website visitors not converting to shoe-laundry orders.",
    outcome: "30 orders from past visitors.",
    spend: 14980,
    budget: {
      type: "total",
      daily: 700,
      total: 15000,
      approved: 15000,
      approver: "Marketing Head",
      startDate: "2026-07-24",
      endDate: "2026-08-12",
      expectedCpl: 350,
      leadTarget: 42,
      salesTarget: 90000,
    },
    audience: {
      city: "Jaipur",
      radiusKm: 8,
      locations: "Vaishali Nagar, Ajmer Road",
      ageRange: "22–45",
      language: "Hindi, English",
      interests: "Website visitors, sneaker care",
      customerType: "existing",
      excluded: "Customers who ordered in last 15 days",
      retargeting: "Site visitors 60 days + Instagram engagers",
    },
    creatives: [
      {
        creativeId: "CRV-4471",
        type: "Static banner set",
        headline: "Sneakers looking dull?",
        primaryText: "Professional shoe laundry with free pickup.",
        description: "Flat ₹200 off above ₹1499",
        offer: "Flat ₹200 off above ₹1499",
        cta: "Book pickup",
        destination: "cleancraft.in/jaipur-shoe",
        landingPage: "Store landing page (Vaishali)",
        phone: "+91 98290 41220",
        whatsapp: "+91 98290 41220",
        terms: "On orders above ₹1499.",
        approval: "approved",
      },
    ],
    handover: baseHandover("Clean Craft Jaipur — Vaishali", "Ritika Bansal"),
    metrics: {
      impressions: 96000,
      reach: 38000,
      clicks: 2140,
      leads: 39,
      qualified: 25,
      calls: 12,
      whatsapp: 17,
      orders: 16,
      salesAmount: 96000,
      salesVerified: false,
    },
    leadsContacted: 27,
    linkPassed: true,
    daily: [
      { date: "2026-08-04", spend: 640, leads: 2, qualified: 1, orders: 1, sales: 5400, observation: "Budget almost finished", action: "Requested top-up approval", nextReview: "2026-08-07" },
    ],
    optimisations: [],
    checklist: [...APPROVAL_CHECKLIST],
    history: [
      { at: "2026-07-23", actor: "Nikhil Arora", detail: "Campaign created for STR-1042" },
      { at: "2026-08-05", actor: "System", detail: "Budget exhausted — ₹14,980 of ₹15,000 spent" },
    ],
  },
  {
    id: "CMP-8850",
    name: "Lucknow — Festival offer (draft)",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    requestId: "REQ-3391",
    rm: "Sanya Kapoor",
    executive: "Nikhil Arora",
    platform: "Meta Ads",
    objective: "Offer Promotion",
    stage: "draft",
    serviceArea: "Gomti Nagar — 5 km",
    problem: "Raksha Bandhan week walk-ins flat.",
    outcome: "60 enquiries during festival week.",
    spend: 0,
    budget: {
      type: "total",
      daily: 1200,
      total: 35000,
      approved: 0,
      approver: "Pending",
      startDate: "2026-08-08",
      endDate: "2026-08-16",
      expectedCpl: 550,
      leadTarget: 60,
      salesTarget: 220000,
    },
    audience: {
      city: "Lucknow",
      radiusKm: 5,
      locations: "Gomti Nagar, Vibhuti Khand",
      ageRange: "25–45",
      language: "Hindi",
      interests: "Families, festival shoppers",
      customerType: "both",
      excluded: "—",
    },
    creatives: [],
    handover: baseHandover("Clean Craft Lucknow — Gomti Nagar", "Sanya Kapoor"),
    metrics: { impressions: 0, reach: 0, clicks: 0, leads: 0, qualified: 0, calls: 0, whatsapp: 0, orders: 0, salesAmount: 0, salesVerified: false },
    leadsContacted: 0,
    linkPassed: false,
    daily: [],
    optimisations: [],
    checklist: ["Correct Store ID", "Clear business objective", "Target audience defined", "Campaign dates confirmed"],
    history: [
      { at: "2026-08-05", actor: "Nikhil Arora", detail: "Draft created from REQ-3391 (Store STR-1088)" },
    ],
  },
];

export const ctr = (m: Metrics) => (m.impressions ? (m.clicks / m.impressions) * 100 : 0);
export const cpc = (c: CampaignRecord) => (c.metrics.clicks ? c.spend / c.metrics.clicks : 0);
export const cpl = (c: CampaignRecord) => (c.metrics.leads ? c.spend / c.metrics.leads : 0);
export const cpql = (c: CampaignRecord) => (c.metrics.qualified ? c.spend / c.metrics.qualified : 0);
export const cps = (c: CampaignRecord) => (c.metrics.orders ? c.spend / c.metrics.orders : 0);
export const conversion = (c: CampaignRecord) =>
  c.metrics.leads ? (c.metrics.orders / c.metrics.leads) * 100 : 0;
/** ROAS is only shown when both spend and sales are verified. */
export const roas = (c: CampaignRecord) =>
  c.metrics.salesVerified && c.spend > 0 ? c.metrics.salesAmount / c.spend : null;
export const budgetUsedPct = (c: CampaignRecord) =>
  c.budget.total ? Math.min(100, Math.round((c.spend / c.budget.total) * 100)) : 0;

const LIVE_STAGES: CampaignStage[] = ["active", "optimisation_required", "budget_exhausted"];

export function campaignAlerts(c: CampaignRecord): string[] {
  const a: string[] = [];
  if (LIVE_STAGES.includes(c.stage) && c.spend > 3000 && c.metrics.leads === 0)
    a.push("Campaign spending without leads");
  if (c.metrics.leads > 0 && cpl(c) > c.budget.expectedCpl) a.push("Cost per lead above approved target");
  if (budgetUsedPct(c) >= 85 && budgetUsedPct(c) < 100) a.push("Budget nearly exhausted");
  if (c.spend > c.budget.approved && c.budget.approved > 0) a.push("Campaign overspending");
  if (c.metrics.leads - c.leadsContacted >= 5) a.push("Leads not being contacted");
  if (c.metrics.leads >= 10 && c.metrics.qualified / c.metrics.leads < 0.5)
    a.push("Low qualified-lead rate");
  if (c.metrics.orders > 0 && !c.metrics.salesVerified) a.push("Sales not linked to campaign (unverified)");
  if (c.creatives.some((cr) => cr.approval === "rejected" || cr.approval === "correction"))
    a.push("Creative rejected / correction required");
  if (!c.linkPassed) a.push("Destination link not working");
  if (c.budget.endDate < CAMPAIGN_TODAY && LIVE_STAGES.includes(c.stage))
    a.push("Campaign end date passed");
  if (["completed"].includes(c.stage) && !c.report) a.push("Campaign report missing");
  if (LIVE_STAGES.includes(c.stage) && c.metrics.orders > 0 && conversion(c) < 20)
    a.push("Store sales declining despite advertising");
  return a;
}
