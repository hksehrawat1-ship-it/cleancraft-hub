// Shared content + lead records for the Social Media Account Manager.
// One permanent Content ID / Lead ID flows through every stage.

export type SmPlatform = "Instagram" | "Facebook" | "YouTube" | "LinkedIn" | "X" | "Other";

export type ContentStage =
  | "Raw Received"
  | "Assigned to Editor"
  | "Editing"
  | "Submitted for Review"
  | "Correction Required"
  | "Approved"
  | "Scheduled"
  | "Published";

export type PublishStatus =
  | "Scheduled"
  | "Ready to Publish"
  | "Published"
  | "Failed"
  | "Reschedule Required"
  | "Not Scheduled";

export type ContentType = "Reel" | "Carousel" | "Static Post" | "Story" | "Long Video" | "Short";

export type ContentVersion = {
  version: string;
  submittedAt: string;
  editor: string;
  outcome: "Pending Review" | "Approved" | "Correction Requested";
  note?: string;
};

export type SharedContent = {
  contentId: string;
  title: string;
  brand: string;
  type: ContentType;
  platform: SmPlatform;
  stage: ContentStage;
  editor: string;
  assignedAt?: string;
  submittedAt?: string;
  dueAt: string;
  overdue: boolean;
  versions: ContentVersion[];
  currentVersion: string;
  approvedVersion?: string;
  returnCount: number;
  hasCaption: boolean;
  hasThumbnail: boolean;
  hasCta: boolean;
  publishTime?: string;
  publishStatus: PublishStatus;
  thumbTone: string;
  priority: "High" | "Medium" | "Low";
  reviewWaitHours?: number;
  publishedOn?: string;
};

export const SHARED_CONTENT: SharedContent[] = [
  {
    contentId: "CC-CN-1041",
    title: "Franchise owner story — Jaipur",
    brand: "Clean Craft Franchise",
    type: "Reel",
    platform: "Instagram",
    stage: "Submitted for Review",
    editor: "Rohit Sharma",
    assignedAt: "2 Aug, 10:15",
    submittedAt: "Today, 06:40",
    dueAt: "Today, 12:00",
    overdue: false,
    versions: [
      { version: "V1", submittedAt: "1 Aug, 17:20", editor: "Rohit Sharma", outcome: "Correction Requested", note: "Fix audio levels in first 3s." },
      { version: "V2", submittedAt: "Today, 06:40", editor: "Rohit Sharma", outcome: "Pending Review" },
    ],
    currentVersion: "V2",
    returnCount: 1,
    hasCaption: true,
    hasThumbnail: true,
    hasCta: true,
    publishTime: "Today, 18:30",
    publishStatus: "Not Scheduled",
    thumbTone: "from-blue-500/30 to-blue-500/5",
    priority: "High",
    reviewWaitHours: 7,
  },
  {
    contentId: "CC-CN-1042",
    title: "Dry clean vs steam wash — myth buster",
    brand: "Clean Craft Services",
    type: "Carousel",
    platform: "Instagram",
    stage: "Correction Required",
    editor: "Neha Verma",
    assignedAt: "31 Jul, 09:00",
    submittedAt: "1 Aug, 14:10",
    dueAt: "Today, 16:00",
    overdue: false,
    versions: [
      { version: "V1", submittedAt: "30 Jul, 12:00", editor: "Neha Verma", outcome: "Correction Requested", note: "Pricing claim on slide 3 not approved." },
      { version: "V2", submittedAt: "1 Aug, 14:10", editor: "Neha Verma", outcome: "Correction Requested", note: "Slide 5 text overflow on mobile." },
    ],
    currentVersion: "V2",
    returnCount: 2,
    hasCaption: true,
    hasThumbnail: false,
    hasCta: true,
    publishStatus: "Not Scheduled",
    thumbTone: "from-amber-500/30 to-amber-500/5",
    priority: "High",
  },
  {
    contentId: "CC-CN-1043",
    title: "Store launch teaser — Indore",
    brand: "Clean Craft Franchise",
    type: "Story",
    platform: "Instagram",
    stage: "Approved",
    editor: "Rohit Sharma",
    submittedAt: "Yesterday, 19:00",
    dueAt: "Today, 10:30",
    overdue: false,
    versions: [
      { version: "V1", submittedAt: "Yesterday, 19:00", editor: "Rohit Sharma", outcome: "Approved" },
    ],
    currentVersion: "V1",
    approvedVersion: "V1",
    returnCount: 0,
    hasCaption: true,
    hasThumbnail: true,
    hasCta: true,
    publishTime: "Today, 10:30",
    publishStatus: "Ready to Publish",
    thumbTone: "from-emerald-500/30 to-emerald-500/5",
    priority: "High",
  },
  {
    contentId: "CC-CN-1044",
    title: "Machine walkthrough — industrial washer",
    brand: "Clean Craft Franchise",
    type: "Long Video",
    platform: "YouTube",
    stage: "Submitted for Review",
    editor: "Imran Qureshi",
    assignedAt: "29 Jul, 11:00",
    submittedAt: "Yesterday, 09:20",
    dueAt: "Yesterday, 18:00",
    overdue: true,
    versions: [
      { version: "V1", submittedAt: "Yesterday, 09:20", editor: "Imran Qureshi", outcome: "Pending Review" },
    ],
    currentVersion: "V1",
    returnCount: 0,
    hasCaption: false,
    hasThumbnail: false,
    hasCta: true,
    publishStatus: "Not Scheduled",
    thumbTone: "from-red-500/30 to-red-500/5",
    priority: "High",
    reviewWaitHours: 28,
  },
  {
    contentId: "CC-CN-1045",
    title: "Customer review compilation — Aug",
    brand: "Clean Craft Services",
    type: "Reel",
    platform: "Facebook",
    stage: "Scheduled",
    editor: "Neha Verma",
    submittedAt: "2 Aug, 15:00",
    dueAt: "Today, 13:00",
    overdue: false,
    versions: [
      { version: "V1", submittedAt: "2 Aug, 15:00", editor: "Neha Verma", outcome: "Approved" },
    ],
    currentVersion: "V1",
    approvedVersion: "V1",
    returnCount: 0,
    hasCaption: true,
    hasThumbnail: true,
    hasCta: false,
    publishTime: "Today, 13:00",
    publishStatus: "Scheduled",
    thumbTone: "from-blue-500/30 to-blue-500/5",
    priority: "Medium",
  },
  {
    contentId: "CC-CN-1046",
    title: "Investment breakdown — cost sheet",
    brand: "Clean Craft Franchise",
    type: "Static Post",
    platform: "LinkedIn",
    stage: "Editing",
    editor: "Rohit Sharma",
    assignedAt: "Today, 08:00",
    dueAt: "Tomorrow, 12:00",
    overdue: false,
    versions: [],
    currentVersion: "—",
    returnCount: 0,
    hasCaption: false,
    hasThumbnail: false,
    hasCta: false,
    publishStatus: "Not Scheduled",
    thumbTone: "from-slate-500/25 to-slate-500/5",
    priority: "Medium",
  },
  {
    contentId: "CC-CN-1047",
    title: "Owner testimonial — Lucknow",
    brand: "Clean Craft Franchise",
    type: "Short",
    platform: "YouTube",
    stage: "Assigned to Editor",
    editor: "Imran Qureshi",
    assignedAt: "Today, 07:30",
    dueAt: "5 Aug, 18:00",
    overdue: false,
    versions: [],
    currentVersion: "—",
    returnCount: 0,
    hasCaption: false,
    hasThumbnail: false,
    hasCta: false,
    publishStatus: "Not Scheduled",
    thumbTone: "from-slate-500/25 to-slate-500/5",
    priority: "Low",
  },
  {
    contentId: "CC-CN-1048",
    title: "Festive offer creative — Rakhi",
    brand: "Clean Craft Services",
    type: "Static Post",
    platform: "Instagram",
    stage: "Raw Received",
    editor: "Unassigned",
    dueAt: "Today, 20:00",
    overdue: false,
    versions: [],
    currentVersion: "—",
    returnCount: 0,
    hasCaption: false,
    hasThumbnail: false,
    hasCta: false,
    publishStatus: "Not Scheduled",
    thumbTone: "from-slate-500/25 to-slate-500/5",
    priority: "High",
  },
  {
    contentId: "CC-CN-1049",
    title: "Behind the scenes — plant tour",
    brand: "Clean Craft Services",
    type: "Reel",
    platform: "Instagram",
    stage: "Published",
    editor: "Neha Verma",
    submittedAt: "28 Jul, 10:00",
    dueAt: "29 Jul, 11:00",
    overdue: false,
    versions: [{ version: "V1", submittedAt: "28 Jul, 10:00", editor: "Neha Verma", outcome: "Approved" }],
    currentVersion: "V1",
    approvedVersion: "V1",
    returnCount: 0,
    hasCaption: true,
    hasThumbnail: true,
    hasCta: true,
    publishTime: "29 Jul, 11:00",
    publishStatus: "Published",
    publishedOn: "29 Jul",
    thumbTone: "from-emerald-500/30 to-emerald-500/5",
    priority: "Low",
  },
  {
    contentId: "CC-CN-1050",
    title: "Franchise webinar promo",
    brand: "Clean Craft Franchise",
    type: "Reel",
    platform: "Facebook",
    stage: "Scheduled",
    editor: "Rohit Sharma",
    submittedAt: "1 Aug, 12:00",
    dueAt: "Today, 09:00",
    overdue: false,
    versions: [{ version: "V1", submittedAt: "1 Aug, 12:00", editor: "Rohit Sharma", outcome: "Approved" }],
    currentVersion: "V1",
    approvedVersion: "V1",
    returnCount: 0,
    hasCaption: true,
    hasThumbnail: true,
    hasCta: true,
    publishTime: "Today, 09:00",
    publishStatus: "Failed",
    thumbTone: "from-red-500/30 to-red-500/5",
    priority: "High",
  },
  {
    contentId: "CC-CN-1051",
    title: "Fabric care tips — X thread card",
    brand: "Clean Craft Services",
    type: "Static Post",
    platform: "X",
    stage: "Approved",
    editor: "Neha Verma",
    submittedAt: "Yesterday, 16:00",
    dueAt: "Today, 15:30",
    overdue: false,
    versions: [{ version: "V1", submittedAt: "Yesterday, 16:00", editor: "Neha Verma", outcome: "Approved" }],
    currentVersion: "V1",
    approvedVersion: "V1",
    returnCount: 0,
    hasCaption: false,
    hasThumbnail: true,
    hasCta: true,
    publishTime: "Today, 15:30",
    publishStatus: "Reschedule Required",
    thumbTone: "from-amber-500/30 to-amber-500/5",
    priority: "Medium",
  },
  {
    contentId: "CC-CN-1052",
    title: "Store opening highlights — Surat",
    brand: "Clean Craft Franchise",
    type: "Reel",
    platform: "Instagram",
    stage: "Published",
    editor: "Imran Qureshi",
    submittedAt: "22 Jul, 10:00",
    dueAt: "23 Jul, 11:00",
    overdue: false,
    versions: [{ version: "V1", submittedAt: "22 Jul, 10:00", editor: "Imran Qureshi", outcome: "Approved" }],
    currentVersion: "V1",
    approvedVersion: "V1",
    returnCount: 0,
    hasCaption: true,
    hasThumbnail: true,
    hasCta: true,
    publishTime: "23 Jul, 11:00",
    publishStatus: "Published",
    publishedOn: "23 Jul",
    thumbTone: "from-emerald-500/30 to-emerald-500/5",
    priority: "Low",
  },
];

export type HandoverStatus =
  | "Captured"
  | "Duplicate Check"
  | "Duplicate Suspected"
  | "Qualified"
  | "Sent to Sales Head"
  | "Accepted by Sales Head"
  | "Rejected by Sales Head";

export type SharedLead = {
  leadId: string;
  name: string;
  mobile: string;
  platform: SmPlatform;
  campaign: string;
  contentId: string;
  enquiredAt: string;
  interest: "Franchise" | "Service" | "Training" | "Bulk / B2B";
  priority: "High" | "Medium" | "Low";
  status: HandoverStatus;
  ageHours: number;
  duplicateOf?: string;
  sentAt?: string;
  city: string;
};

export const SHARED_LEADS: SharedLead[] = [
  {
    leadId: "CC-LD-5101", name: "Rakesh Mehta", mobile: "+91 98•••• 4412", platform: "Instagram",
    campaign: "Franchise Aug — Reel Ads", contentId: "CC-CN-1049", enquiredAt: "Today, 07:10",
    interest: "Franchise", priority: "High", status: "Captured", ageHours: 6, city: "Jaipur",
  },
  {
    leadId: "CC-LD-5102", name: "Sunita Rao", mobile: "+91 90•••• 7781", platform: "Instagram",
    campaign: "Service Awareness", contentId: "CC-CN-1052", enquiredAt: "Today, 09:35",
    interest: "Service", priority: "Medium", status: "Duplicate Suspected", ageHours: 4,
    duplicateOf: "CC-LD-5088", city: "Pune",
  },
  {
    leadId: "CC-LD-5103", name: "Imran Sheikh", mobile: "+91 99•••• 2210", platform: "YouTube",
    campaign: "Machine Tour Organic", contentId: "CC-CN-1044", enquiredAt: "Today, 10:02",
    interest: "Franchise", priority: "High", status: "Qualified", ageHours: 3, city: "Bhopal",
  },
  {
    leadId: "CC-LD-5104", name: "Divya Nair", mobile: "+91 87•••• 6634", platform: "Facebook",
    campaign: "Webinar Promo", contentId: "CC-CN-1050", enquiredAt: "Yesterday, 20:15",
    interest: "Training", priority: "Low", status: "Sent to Sales Head", ageHours: 17,
    sentAt: "Yesterday, 21:00", city: "Kochi",
  },
  {
    leadId: "CC-LD-5105", name: "Harpreet Singh", mobile: "+91 82•••• 1190", platform: "Instagram",
    campaign: "Franchise Aug — Reel Ads", contentId: "CC-CN-1049", enquiredAt: "Today, 08:20",
    interest: "Franchise", priority: "High", status: "Accepted by Sales Head", ageHours: 5,
    sentAt: "Today, 08:55", city: "Ludhiana",
  },
  {
    leadId: "CC-LD-5106", name: "Meera Joshi", mobile: "+91 76•••• 3325", platform: "LinkedIn",
    campaign: "B2B Corporate Laundry", contentId: "CC-CN-1046", enquiredAt: "Today, 06:45",
    interest: "Bulk / B2B", priority: "Medium", status: "Captured", ageHours: 7, city: "Ahmedabad",
  },
  {
    leadId: "CC-LD-5107", name: "Arun Pillai", mobile: "+91 93•••• 8802", platform: "Instagram",
    campaign: "Festive Offer", contentId: "CC-CN-1048", enquiredAt: "Yesterday, 12:10",
    interest: "Service", priority: "Medium", status: "Sent to Sales Head", ageHours: 25,
    sentAt: "Yesterday, 13:00", city: "Chennai",
  },
  {
    leadId: "CC-LD-5108", name: "Kavita Bansal", mobile: "+91 70•••• 5567", platform: "YouTube",
    campaign: "Cost Sheet Organic", contentId: "CC-CN-1044", enquiredAt: "Today, 11:05",
    interest: "Franchise", priority: "High", status: "Qualified", ageHours: 2, city: "Delhi",
  },
];

export type SocialAccountRecord = {
  platform: SmPlatform;
  accountName: string;
  connection: "Connected" | "Token Expiring" | "Disconnected" | "Placeholder";
  lastPost: string;
  scheduledCount: number;
  warning?: string;
};

export const SOCIAL_ACCOUNT_HEALTH: SocialAccountRecord[] = [
  { platform: "Instagram", accountName: "@cleancraft.india", connection: "Connected", lastPost: "Today, 09:10", scheduledCount: 4 },
  { platform: "Facebook", accountName: "Clean Craft Laundry", connection: "Disconnected", lastPost: "1 Aug, 12:00", scheduledCount: 2, warning: "Page token revoked — publishing failed once today." },
  { platform: "YouTube", accountName: "Clean Craft", connection: "Token Expiring", lastPost: "29 Jul, 11:00", scheduledCount: 1, warning: "Access expires in 3 days." },
  { platform: "LinkedIn", accountName: "Clean Craft Business", connection: "Connected", lastPost: "Yesterday, 17:30", scheduledCount: 1 },
  { platform: "X", accountName: "@cleancraft_in", connection: "Placeholder", lastPost: "—", scheduledCount: 1, warning: "Account not linked yet." },
  { platform: "Other", accountName: "Google Business (22 listings)", connection: "Connected", lastPost: "Today, 08:00", scheduledCount: 0 },
];

export const REVIEW_CHECKLIST = [
  "Brief and script followed",
  "Brand logo, colours and fonts correct",
  "Audio levels and sync clean",
  "Subtitles / on-screen text accurate",
  "No unapproved pricing or claims",
  "Caption, hashtags and CTA finalised",
  "Thumbnail approved for platform",
  "Correct aspect ratio and export quality",
];

export const AUDIT_LOG = [
  { at: "Today, 09:12", who: "Priya Nanda (SMM)", action: "Published CC-CN-1049 V1 to Instagram" },
  { at: "Today, 08:55", who: "Priya Nanda (SMM)", action: "Handed over CC-LD-5105 to Sales Head" },
  { at: "Today, 08:00", who: "Priya Nanda (SMM)", action: "Assigned CC-CN-1046 to Rohit Sharma" },
  { at: "Yesterday, 21:00", who: "Priya Nanda (SMM)", action: "Handed over CC-LD-5104 to Sales Head" },
  { at: "Yesterday, 19:40", who: "Priya Nanda (SMM)", action: "Approved CC-CN-1043 V1 (version locked)" },
  { at: "Yesterday, 18:05", who: "Priya Nanda (SMM)", action: "Requested correction on CC-CN-1042 V2" },
];

export const MANAGER_NAME = "Priya Nanda";

/* ---- Editor workload (front-end sample, no auto-assignment) ---- */
export type EditorWorkload = {
  name: string;
  activeCount: number;
  dueToday: number;
  overdue: number;
  availability: "Available" | "Busy" | "Overloaded" | "On Leave";
};

export const EDITOR_WORKLOAD: EditorWorkload[] = [
  { name: "Rohit Sharma", activeCount: 4, dueToday: 2, overdue: 0, availability: "Busy" },
  { name: "Neha Verma", activeCount: 3, dueToday: 1, overdue: 0, availability: "Available" },
  { name: "Imran Qureshi", activeCount: 5, dueToday: 1, overdue: 1, availability: "Overloaded" },
  { name: "Sahil Kapoor", activeCount: 1, dueToday: 0, overdue: 0, availability: "Available" },
  { name: "Ritu Malhotra", activeCount: 0, dueToday: 0, overdue: 0, availability: "On Leave" },
];

export const CAMPAIGNS = [
  "Franchise Aug — Reel Ads",
  "Service Awareness",
  "Webinar Promo",
  "Festive Offer",
  "B2B Corporate Laundry",
  "Machine Tour Organic",
];

export const BRANDS = ["Clean Craft Franchise", "Clean Craft Services"];

export const CONTENT_TYPES: ContentType[] = [
  "Reel",
  "Carousel",
  "Static Post",
  "Story",
  "Long Video",
  "Short",
];

export const PLATFORMS: SmPlatform[] = [
  "Instagram",
  "Facebook",
  "YouTube",
  "LinkedIn",
  "X",
  "Other",
];

export const FILE_SLOTS = [
  "Raw videos",
  "Raw audio",
  "Script",
  "Product images",
  "Logo",
  "Reference videos",
  "Thumbnail reference",
  "Supporting documents",
];

/* Per-content extras used by the Content Queue detail drawer */
export type ContentExtras = {
  campaign: string;
  briefVersion: number;
  objective: string;
  audience: string;
  keyMessage: string;
  duration: string;
  orientation: "Vertical 9:16" | "Square 1:1" | "Horizontal 16:9";
  cta: string;
  captionNeeds: string;
  subtitleNeeds: string;
  brandingNeeds: string;
  musicDirection: string;
  extraNotes: string;
  files: Record<string, boolean>;
  previousEditors: string[];
  reviewerComments: { at: string; by: string; text: string }[];
  corrections: { at: string; version: string; points: string[] }[];
  publishedLink?: string;
  leadsGenerated: number;
  timeline: { at: string; by: string; event: string }[];
};

const filesAll = (present: string[]): Record<string, boolean> =>
  Object.fromEntries(FILE_SLOTS.map((f) => [f, present.includes(f)]));

export const CONTENT_EXTRAS: Record<string, ContentExtras> = {
  "CC-CN-1041": {
    campaign: "Franchise Aug — Reel Ads",
    briefVersion: 2,
    objective: "Drive franchise enquiries from tier-2 cities",
    audience: "Salaried men, 28-45, considering a business",
    keyMessage: "A Clean Craft store can be running in 45 days",
    duration: "45-60 sec",
    orientation: "Vertical 9:16",
    cta: "DM 'FRANCHISE' to know the cost",
    captionNeeds: "Hindi hook + English body, 3 hashtags max",
    subtitleNeeds: "Burned-in Hindi subtitles",
    brandingNeeds: "Logo bottom-right, brand red accent",
    musicDirection: "Uplifting, low-volume under voice",
    extraNotes: "Do not show exact investment figure on screen.",
    files: filesAll(["Raw videos", "Raw audio", "Script", "Logo", "Reference videos"]),
    previousEditors: [],
    reviewerComments: [
      { at: "1 Aug, 18:10", by: "Priya Nanda (SMM)", text: "Audio dips at 0:02, fix levels." },
    ],
    corrections: [
      { at: "1 Aug, 18:10", version: "V1", points: ["Fix audio levels in first 3s", "Trim slow intro"] },
    ],
    leadsGenerated: 0,
    timeline: [
      { at: "31 Jul, 09:00", by: "Priya Nanda", event: "Content created (CC-CN-1041)" },
      { at: "2 Aug, 10:15", by: "Priya Nanda", event: "Assigned to Rohit Sharma" },
      { at: "1 Aug, 17:20", by: "Rohit Sharma", event: "Submitted V1 for review" },
      { at: "1 Aug, 18:10", by: "Priya Nanda", event: "Correction requested on V1" },
      { at: "Today, 06:40", by: "Rohit Sharma", event: "Resubmitted as V2" },
    ],
  },
  "CC-CN-1042": {
    campaign: "Service Awareness",
    briefVersion: 3,
    objective: "Educate customers on fabric care to lift service orders",
    audience: "Urban households, 30-50",
    keyMessage: "Steam wash protects fabric better than harsh dry clean",
    duration: "6 slides",
    orientation: "Square 1:1",
    cta: "Book a pickup on the app",
    captionNeeds: "English, myth-busting tone",
    subtitleNeeds: "Not applicable",
    brandingNeeds: "Brand fonts on every slide",
    musicDirection: "Not applicable",
    extraNotes: "Remove all price claims — compliance flagged.",
    files: filesAll(["Script", "Product images", "Logo"]),
    previousEditors: ["Sahil Kapoor"],
    reviewerComments: [
      { at: "Yesterday, 18:05", by: "Priya Nanda (SMM)", text: "Slide 5 text overflows on mobile." },
    ],
    corrections: [
      { at: "30 Jul, 13:00", version: "V1", points: ["Pricing claim on slide 3 not approved"] },
      { at: "Yesterday, 18:05", version: "V2", points: ["Slide 5 text overflow", "Use brand red, not orange"] },
    ],
    leadsGenerated: 0,
    timeline: [
      { at: "28 Jul, 11:00", by: "Priya Nanda", event: "Content created (CC-CN-1042)" },
      { at: "29 Jul, 10:00", by: "Priya Nanda", event: "Assigned to Sahil Kapoor" },
      { at: "31 Jul, 09:00", by: "Priya Nanda", event: "Reassigned to Neha Verma — reason: Sahil on launch shoot" },
      { at: "Yesterday, 18:05", by: "Priya Nanda", event: "Correction requested on V2 (2nd return)" },
    ],
  },
};

export function getExtras(contentId: string): ContentExtras {
  return (
    CONTENT_EXTRAS[contentId] ?? {
      campaign: "General Content",
      briefVersion: 1,
      objective: "Build brand awareness and enquiries",
      audience: "Clean Craft core audience",
      keyMessage: "Professional laundry, dependable service",
      duration: "30-45 sec",
      orientation: "Vertical 9:16",
      cta: "Follow for more",
      captionNeeds: "English caption with 3 hashtags",
      subtitleNeeds: "Burned-in subtitles",
      brandingNeeds: "Logo and brand colours",
      musicDirection: "Trending audio, low volume",
      extraNotes: "—",
      files: filesAll(["Script", "Logo"]),
      previousEditors: [],
      reviewerComments: [],
      corrections: [],
      leadsGenerated: 0,
      timeline: [{ at: "—", by: "Priya Nanda", event: `Content created (${contentId})` }],
    }
  );
}

/* ---- Review & Approval shared structures ---- */
export const REVIEW_CHECKLIST_FULL = [
  "Content brief followed",
  "Correct message",
  "Correct target audience",
  "Correct duration",
  "Correct aspect ratio and resolution",
  "Logo and branding correct",
  "Subtitle spelling checked",
  "Audio quality acceptable",
  "Music appropriate and approved",
  "Visual quality acceptable",
  "Call-to-action included",
  "Thumbnail ready",
  "Caption ready",
  "No confidential or inappropriate content",
  "Platform guidelines followed",
];

export const CORRECTION_CATEGORIES = [
  "Cut or Timing",
  "Subtitle",
  "Spelling",
  "Audio",
  "Music",
  "Colour",
  "Logo or Branding",
  "Aspect Ratio",
  "Thumbnail",
  "Caption",
  "Call-to-Action",
  "Missing Content",
  "Compliance Concern",
  "Other",
] as const;

export type CorrectionCategory = (typeof CORRECTION_CATEGORIES)[number];

export type CorrectionPoint = {
  id: string;
  timestamp: string;
  category: CorrectionCategory;
  instruction: string;
  priority: "High" | "Medium" | "Low";
  reference?: string;
  dueBy: string;
  done?: boolean;
  editorResponse?: string;
};

/** Editor notes + prior correction points, keyed by Content ID. */
export const SUBMISSION_DETAILS: Record<
  string,
  { editorNotes: string; priorPoints: CorrectionPoint[] }
> = {
  "CC-CN-1041": {
    editorNotes:
      "Fixed the audio dip at 0:02 and trimmed 3s from the intro. Used approved background music track 4.",
    priorPoints: [
      {
        id: "P1",
        timestamp: "00:02",
        category: "Audio",
        instruction: "Audio level drops sharply — normalise the first 3 seconds.",
        priority: "High",
        dueBy: "Today, 06:00",
        done: true,
        editorResponse: "Normalised to -14 LUFS.",
      },
      {
        id: "P2",
        timestamp: "00:00",
        category: "Cut or Timing",
        instruction: "Intro is slow — cut to the hook within 2 seconds.",
        priority: "Medium",
        dueBy: "Today, 06:00",
        done: true,
        editorResponse: "Trimmed 3s.",
      },
    ],
  },
  "CC-CN-1042": {
    editorNotes: "Replaced the pricing slide with a benefits slide as instructed.",
    priorPoints: [
      {
        id: "P1",
        timestamp: "Slide 3",
        category: "Compliance Concern",
        instruction: "Remove the unapproved pricing claim entirely.",
        priority: "High",
        dueBy: "1 Aug, 12:00",
        done: true,
        editorResponse: "Slide replaced.",
      },
      {
        id: "P2",
        timestamp: "Slide 5",
        category: "Subtitle",
        instruction: "Text overflows on mobile — reduce to two lines.",
        priority: "High",
        dueBy: "Today, 14:00",
        done: false,
      },
      {
        id: "P3",
        timestamp: "All slides",
        category: "Colour",
        instruction: "Use brand red, not orange, on headings.",
        priority: "Medium",
        dueBy: "Today, 14:00",
        done: false,
      },
    ],
  },
  "CC-CN-1044": {
    editorNotes:
      "First cut ready. Thumbnail and caption still pending from the content team — flagged in the brief.",
    priorPoints: [],
  },
};

export function getSubmissionDetails(contentId: string) {
  return (
    SUBMISSION_DETAILS[contentId] ?? { editorNotes: "No editor notes submitted.", priorPoints: [] }
  );
}

/* ---- Publishing calendar shared structures ---- */
export const TODAY_ISO = "2026-08-04";

export const PUBLISH_STATUSES: PublishStatus[] = [
  "Scheduled",
  "Ready to Publish",
  "Published",
  "Failed",
  "Reschedule Required",
  "Not Scheduled",
];

export const CALENDAR_STATUSES = [
  "Approved",
  "Ready to Schedule",
  "Scheduled",
  "Ready to Publish",
  "Published",
  "Publishing Failed",
  "Reschedule Required",
  "Cancelled",
] as const;
export type CalendarStatus = (typeof CALENDAR_STATUSES)[number];

export type ScheduleHistoryEntry = { at: string; by: string; note: string };

export type PublishRecord = {
  id: string;
  contentId: string;
  title: string;
  brand: string;
  platform: SmPlatform;
  type: ContentType;
  campaign: string;
  editor: string;
  version: string;
  account: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // HH:mm
  timezone: string;
  status: CalendarStatus;
  caption: string;
  hashtags: string;
  cta: string;
  thumbnail: string;
  firstComment?: string;
  link: string;
  trackingCode: string;
  thumbTone: string;
  publishedAt?: string;
  publishedUrl?: string;
  platformPostId?: string;
  publishedBy?: string;
  failureReason?: string;
  history: ScheduleHistoryEntry[];
};

export const PUBLISH_RECORDS: PublishRecord[] = [
  {
    id: "PB-2201", contentId: "CC-CN-1049", title: "Behind the scenes — plant tour",
    brand: "Clean Craft Services", platform: "Instagram", type: "Reel",
    campaign: "Service Awareness", editor: "Neha Verma", version: "V1",
    account: "@cleancraft.india", date: "2026-08-04", time: "09:10", timezone: "IST (UTC+5:30)",
    status: "Published", caption: "Inside our plant — where every garment gets its second life.",
    hashtags: "#cleancraft #laundry #drycleaning", cta: "Book a pickup — link in bio",
    thumbnail: "plant-tour-thumb.jpg", link: "https://cleancraft.in/services",
    trackingCode: "ig_service_aug_reel", thumbTone: "from-emerald-500/30 to-emerald-500/5",
    publishedAt: "4 Aug 2026, 09:10", publishedUrl: "https://instagram.com/p/ccplant01",
    platformPostId: "IG_POST_ID_placeholder", publishedBy: "Priya Nanda (SMM)",
    history: [
      { at: "2 Aug, 18:00", by: "Priya Nanda", note: "Scheduled for 4 Aug 09:10 IST" },
      { at: "4 Aug, 09:10", by: "System", note: "Published successfully" },
    ],
  },
  {
    id: "PB-2202", contentId: "CC-CN-1045", title: "Customer review compilation — Aug",
    brand: "Clean Craft Services", platform: "Facebook", type: "Reel",
    campaign: "Service Awareness", editor: "Neha Verma", version: "V1",
    account: "Clean Craft Laundry", date: "2026-08-04", time: "13:00", timezone: "IST (UTC+5:30)",
    status: "Scheduled", caption: "Our customers said it better than we could.",
    hashtags: "#cleancraft #reviews", cta: "Try us this week",
    thumbnail: "review-comp-thumb.jpg", link: "https://cleancraft.in/reviews",
    trackingCode: "fb_service_aug_reviews", thumbTone: "from-blue-500/30 to-blue-500/5",
    history: [{ at: "3 Aug, 11:20", by: "Priya Nanda", note: "Scheduled for 4 Aug 13:00 IST" }],
  },
  {
    id: "PB-2203", contentId: "CC-CN-1050", title: "Franchise webinar promo",
    brand: "Clean Craft Franchise", platform: "Facebook", type: "Reel",
    campaign: "Webinar Promo", editor: "Rohit Sharma", version: "V1",
    account: "Clean Craft Laundry", date: "2026-08-04", time: "09:00", timezone: "IST (UTC+5:30)",
    status: "Publishing Failed", caption: "Free franchise webinar this Saturday — 40 seats only.",
    hashtags: "#franchise #business", cta: "Register now",
    thumbnail: "webinar-thumb.jpg", link: "https://cleancraft.in/webinar",
    trackingCode: "fb_franchise_webinar", thumbTone: "from-red-500/30 to-red-500/5",
    failureReason: "Facebook page token revoked — account disconnected.",
    history: [
      { at: "1 Aug, 12:40", by: "Priya Nanda", note: "Scheduled for 4 Aug 09:00 IST" },
      { at: "4 Aug, 09:00", by: "System", note: "Publishing failed — account disconnected" },
    ],
  },
  {
    id: "PB-2204", contentId: "CC-CN-1043", title: "Store launch teaser — Indore",
    brand: "Clean Craft Franchise", platform: "Instagram", type: "Story",
    campaign: "Franchise Aug — Reel Ads", editor: "Rohit Sharma", version: "V1",
    account: "@cleancraft.india", date: "2026-08-04", time: "18:30", timezone: "IST (UTC+5:30)",
    status: "Ready to Publish", caption: "Indore, we are opening this week.",
    hashtags: "#cleancraft #indore #newstore", cta: "Swipe up for offers",
    thumbnail: "indore-teaser-thumb.jpg", link: "https://cleancraft.in/stores/indore",
    trackingCode: "ig_franchise_indore", thumbTone: "from-blue-500/30 to-blue-500/5",
    history: [{ at: "Yesterday, 19:40", by: "Priya Nanda", note: "Scheduled for 4 Aug 18:30 IST" }],
  },
  {
    id: "PB-2205", contentId: "CC-CN-1051", title: "Fabric care tips — X thread card",
    brand: "Clean Craft Services", platform: "X", type: "Static Post",
    campaign: "Service Awareness", editor: "Neha Verma", version: "V1",
    account: "@cleancraft_in", date: "2026-08-04", time: "15:30", timezone: "IST (UTC+5:30)",
    status: "Reschedule Required", caption: "",
    hashtags: "#fabriccare", cta: "Read the full guide",
    thumbnail: "fabric-card.jpg", link: "", trackingCode: "",
    thumbTone: "from-amber-500/30 to-amber-500/5",
    history: [
      { at: "2 Aug, 10:00", by: "Priya Nanda", note: "Scheduled for 3 Aug 15:30 IST" },
      { at: "3 Aug, 16:10", by: "Priya Nanda", note: "Missed slot — reschedule required" },
    ],
  },
  {
    id: "PB-2206", contentId: "CC-CN-1052", title: "Store opening highlights — Surat",
    brand: "Clean Craft Franchise", platform: "Instagram", type: "Reel",
    campaign: "Franchise Aug — Reel Ads", editor: "Imran Qureshi", version: "V1",
    account: "@cleancraft.india", date: "2026-08-02", time: "11:00", timezone: "IST (UTC+5:30)",
    status: "Published", caption: "Surat store is live. Thank you for the love.",
    hashtags: "#cleancraft #surat", cta: "Find your nearest store",
    thumbnail: "surat-thumb.jpg", link: "https://cleancraft.in/stores/surat",
    trackingCode: "ig_franchise_surat", thumbTone: "from-emerald-500/30 to-emerald-500/5",
    publishedAt: "2 Aug 2026, 11:00", publishedUrl: "https://instagram.com/p/ccsurat01",
    platformPostId: "IG_POST_ID_placeholder", publishedBy: "Priya Nanda (SMM)",
    history: [
      { at: "31 Jul, 14:00", by: "Priya Nanda", note: "Scheduled for 2 Aug 11:00 IST" },
      { at: "2 Aug, 11:00", by: "System", note: "Published successfully" },
    ],
  },
  {
    id: "PB-2207", contentId: "CC-CN-1047", title: "Owner testimonial — Lucknow",
    brand: "Clean Craft Franchise", platform: "YouTube", type: "Short",
    campaign: "Franchise Aug — Reel Ads", editor: "Imran Qureshi", version: "V1",
    account: "Clean Craft", date: "2026-08-06", time: "10:00", timezone: "IST (UTC+5:30)",
    status: "Scheduled", caption: "Lucknow owner shares his first-year numbers.",
    hashtags: "#franchise #cleancraft", cta: "Apply for a franchise",
    thumbnail: "lucknow-thumb.jpg", link: "https://cleancraft.in/franchise",
    trackingCode: "yt_franchise_lucknow", thumbTone: "from-blue-500/30 to-blue-500/5",
    history: [{ at: "3 Aug, 09:00", by: "Priya Nanda", note: "Scheduled for 6 Aug 10:00 IST" }],
  },
  {
    id: "PB-2208", contentId: "CC-CN-1046", title: "Investment breakdown — cost sheet",
    brand: "Clean Craft Franchise", platform: "LinkedIn", type: "Static Post",
    campaign: "B2B Corporate Laundry", editor: "Rohit Sharma", version: "V1",
    account: "Clean Craft Business", date: "2026-08-07", time: "12:00", timezone: "IST (UTC+5:30)",
    status: "Scheduled", caption: "",
    hashtags: "#franchise #investment", cta: "Download the cost sheet",
    thumbnail: "", link: "https://cleancraft.in/cost-sheet",
    trackingCode: "li_franchise_costsheet", thumbTone: "from-blue-500/30 to-blue-500/5",
    history: [{ at: "Today, 08:20", by: "Priya Nanda", note: "Scheduled for 7 Aug 12:00 IST" }],
  },
  {
    id: "PB-2209", contentId: "CC-CN-1048", title: "Festive offer creative — Rakhi",
    brand: "Clean Craft Services", platform: "Instagram", type: "Static Post",
    campaign: "Festive Offer", editor: "Unassigned", version: "V1",
    account: "@cleancraft.india", date: "2026-08-05", time: "20:00", timezone: "IST (UTC+5:30)",
    status: "Cancelled", caption: "Rakhi week offer — 20% off on ethnic wear.",
    hashtags: "#rakhi #offer", cta: "Visit your nearest store",
    thumbnail: "rakhi-thumb.jpg", link: "https://cleancraft.in/offers",
    trackingCode: "ig_festive_rakhi", thumbTone: "from-slate-500/25 to-slate-500/5",
    history: [
      { at: "2 Aug, 16:00", by: "Priya Nanda", note: "Scheduled for 5 Aug 20:00 IST" },
      { at: "3 Aug, 10:00", by: "Priya Nanda", note: "Cancelled — offer approval withdrawn by brand team" },
    ],
  },
  {
    id: "PB-2210", contentId: "CC-CN-1049", title: "Behind the scenes — plant tour (LinkedIn cut)",
    brand: "Clean Craft Services", platform: "LinkedIn", type: "Short",
    campaign: "B2B Corporate Laundry", editor: "Neha Verma", version: "V1",
    account: "Clean Craft Business", date: "2026-08-04", time: "13:00", timezone: "IST (UTC+5:30)",
    status: "Scheduled", caption: "How we process 4,000 garments a day.",
    hashtags: "#b2b #laundry", cta: "Talk to our B2B team",
    thumbnail: "plant-tour-li.jpg", link: "https://cleancraft.in/b2b",
    trackingCode: "li_b2b_plant", thumbTone: "from-blue-500/30 to-blue-500/5",
    history: [{ at: "3 Aug, 12:00", by: "Priya Nanda", note: "Scheduled for 4 Aug 13:00 IST" }],
  },
];

export const READINESS_CHECKS = [
  "Approved video version selected",
  "Caption approved",
  "Thumbnail approved",
  "Correct social account selected",
  "Correct publishing date and time",
  "Hashtags checked",
  "Call-to-action checked",
  "Destination link checked",
  "Tracking information added",
  "Platform format requirements met",
];

/* ---- Social account governance structures ---- */
export type AccountStatus =
  | "Connected"
  | "Attention Required"
  | "Reauthorisation Required"
  | "Disconnected"
  | "Suspended"
  | "Archived";

export const ACCOUNT_STATUSES: AccountStatus[] = [
  "Connected",
  "Attention Required",
  "Reauthorisation Required",
  "Disconnected",
  "Suspended",
  "Archived",
];

export type AccessLevel = "View Only" | "Content Manager" | "Publisher" | "Account Administrator";

export const ACCESS_LEVELS: AccessLevel[] = [
  "View Only",
  "Content Manager",
  "Publisher",
  "Account Administrator",
];

export type AccountUser = {
  name: string;
  role: string;
  level: AccessLevel;
  grantedOn: string;
  grantedBy: string;
  lastActivity: string;
  exited?: boolean;
};

export type SocialAccount = {
  id: string;
  platform: "Instagram" | "Facebook" | "YouTube" | "LinkedIn" | "X" | "Pinterest" | "Other";
  accountName: string;
  handle: string;
  brand: string;
  profileUrl: string;
  owner: string;
  managers: string[];
  status: AccountStatus;
  lastSync: string;
  lastPublished: string;
  scheduledCount: number;
  permissions: string[];
  connectedOn: string;
  tokenExpiry: string;
  publishingPermission: boolean;
  recentFailures: number;
  restriction?: string;
  suspension?: string;
  unusualAccess?: string;
  requiredAction?: string;
  warning?: string;
  publishingPaused?: boolean;
  tone: string;
  users: AccountUser[];
  accessHistory: { at: string; by: string; note: string }[];
};

export const SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: "SA-01", platform: "Instagram", accountName: "Clean Craft India", handle: "@cleancraft.india",
    brand: "Clean Craft Services", profileUrl: "https://instagram.com/cleancraft.india",
    owner: "Clean Craft Pvt Ltd", managers: ["Priya Nanda", "Kavita Joshi"],
    status: "Connected", lastSync: "Today, 11:40", lastPublished: "Today, 09:10", scheduledCount: 4,
    permissions: ["Read profile", "Publish content", "Read insights", "Manage comments"],
    connectedOn: "12 Feb 2026", tokenExpiry: "Valid for 58 days", publishingPermission: true,
    recentFailures: 0, requiredAction: "None", tone: "from-pink-500/25 to-pink-500/5",
    users: [
      { name: "Priya Nanda", role: "Social Media Account Manager", level: "Account Administrator", grantedOn: "12 Feb 2026", grantedBy: "CEO", lastActivity: "Today, 11:40" },
      { name: "Kavita Joshi", role: "Content Executive", level: "Content Manager", grantedOn: "3 Mar 2026", grantedBy: "Priya Nanda", lastActivity: "Today, 10:05" },
      { name: "Rohit Sharma", role: "Video Editor", level: "View Only", grantedOn: "3 Mar 2026", grantedBy: "Priya Nanda", lastActivity: "Yesterday, 18:20" },
    ],
    accessHistory: [
      { at: "3 Mar 2026", by: "Priya Nanda", note: "Granted Content Manager access to Kavita Joshi" },
      { at: "12 Feb 2026", by: "CEO", note: "Account connected via platform OAuth (least-privilege scopes)" },
    ],
  },
  {
    id: "SA-02", platform: "Facebook", accountName: "Clean Craft Laundry", handle: "Clean Craft Laundry (Page)",
    brand: "Clean Craft Services", profileUrl: "https://facebook.com/cleancraftlaundry",
    owner: "Clean Craft Pvt Ltd", managers: ["Priya Nanda"],
    status: "Disconnected", lastSync: "1 Aug, 12:00", lastPublished: "1 Aug, 12:00", scheduledCount: 2,
    permissions: ["Read page", "Publish content"], connectedOn: "12 Feb 2026",
    tokenExpiry: "Token revoked", publishingPermission: false, recentFailures: 1,
    requiredAction: "Reconnect the page and restore publishing permission.",
    warning: "Page token revoked — one post failed today. 2 scheduled posts are at risk.",
    tone: "from-blue-600/25 to-blue-600/5",
    users: [
      { name: "Priya Nanda", role: "Social Media Account Manager", level: "Account Administrator", grantedOn: "12 Feb 2026", grantedBy: "CEO", lastActivity: "Today, 09:05" },
      { name: "Arjun Mehta", role: "Ex-Marketing Executive", level: "Publisher", grantedOn: "5 Jan 2026", grantedBy: "CEO", lastActivity: "18 Jul 2026", exited: true },
    ],
    accessHistory: [
      { at: "4 Aug 2026", by: "System", note: "Publishing failed — page token revoked by platform" },
      { at: "12 Feb 2026", by: "CEO", note: "Account connected via platform OAuth" },
    ],
  },
  {
    id: "SA-03", platform: "YouTube", accountName: "Clean Craft", handle: "@cleancraft",
    brand: "Clean Craft Franchise", profileUrl: "https://youtube.com/@cleancraft",
    owner: "Clean Craft Pvt Ltd", managers: ["Priya Nanda", "Imran Qureshi"],
    status: "Reauthorisation Required", lastSync: "Today, 07:15", lastPublished: "29 Jul, 11:00",
    scheduledCount: 1, permissions: ["Read channel", "Upload video", "Read analytics"],
    connectedOn: "20 Feb 2026", tokenExpiry: "Expires in 3 days", publishingPermission: true,
    recentFailures: 0, requiredAction: "Reauthorise the channel before 7 Aug to avoid upload failures.",
    warning: "Access token expires in 3 days.", tone: "from-red-500/25 to-red-500/5",
    users: [
      { name: "Priya Nanda", role: "Social Media Account Manager", level: "Account Administrator", grantedOn: "20 Feb 2026", grantedBy: "CEO", lastActivity: "Today, 07:15" },
      { name: "Imran Qureshi", role: "Video Editor", level: "View Only", grantedOn: "20 Feb 2026", grantedBy: "Priya Nanda", lastActivity: "Yesterday, 09:20" },
    ],
    accessHistory: [
      { at: "Today, 07:15", by: "System", note: "Token expiry warning raised (3 days)" },
      { at: "20 Feb 2026", by: "CEO", note: "Channel connected via platform OAuth" },
    ],
  },
  {
    id: "SA-04", platform: "LinkedIn", accountName: "Clean Craft Business", handle: "Clean Craft Business",
    brand: "Clean Craft Franchise", profileUrl: "https://linkedin.com/company/cleancraft",
    owner: "Clean Craft Pvt Ltd", managers: ["Priya Nanda"],
    status: "Connected", lastSync: "Today, 11:00", lastPublished: "Yesterday, 17:30", scheduledCount: 2,
    permissions: ["Read organisation", "Publish content"], connectedOn: "1 Mar 2026",
    tokenExpiry: "Valid for 41 days", publishingPermission: true, recentFailures: 0,
    requiredAction: "None", tone: "from-sky-600/25 to-sky-600/5",
    users: [
      { name: "Priya Nanda", role: "Social Media Account Manager", level: "Account Administrator", grantedOn: "1 Mar 2026", grantedBy: "CEO", lastActivity: "Today, 11:00" },
      { name: "Sales Head", role: "Sales Head", level: "View Only", grantedOn: "10 Mar 2026", grantedBy: "Priya Nanda", lastActivity: "Today, 08:30" },
    ],
    accessHistory: [{ at: "1 Mar 2026", by: "CEO", note: "Account connected via platform OAuth" }],
  },
  {
    id: "SA-05", platform: "X", accountName: "Clean Craft", handle: "@cleancraft_in",
    brand: "Clean Craft Services", profileUrl: "https://x.com/cleancraft_in",
    owner: "Clean Craft Pvt Ltd", managers: ["Priya Nanda"],
    status: "Attention Required", lastSync: "—", lastPublished: "—", scheduledCount: 1,
    permissions: ["Read profile"], connectedOn: "Not connected",
    tokenExpiry: "No token issued", publishingPermission: false, recentFailures: 0,
    requiredAction: "Request a connection — publishing permission is missing.",
    warning: "Account not linked yet, but 1 post is scheduled against it.",
    unusualAccess: "3 failed connection attempts logged on 2 Aug.",
    tone: "from-slate-700/25 to-slate-700/5",
    users: [
      { name: "Priya Nanda", role: "Social Media Account Manager", level: "Account Administrator", grantedOn: "2 Aug 2026", grantedBy: "CEO", lastActivity: "2 Aug, 16:10" },
    ],
    accessHistory: [{ at: "2 Aug 2026", by: "System", note: "Multiple failed connection attempts (3)" }],
  },
  {
    id: "SA-06", platform: "Pinterest", accountName: "Clean Craft Home Care", handle: "@cleancrafthome",
    brand: "Clean Craft Services", profileUrl: "https://pinterest.com/cleancrafthome",
    owner: "Clean Craft Pvt Ltd", managers: [], status: "Suspended",
    lastSync: "18 Jul, 10:00", lastPublished: "16 Jul, 12:00", scheduledCount: 0,
    permissions: ["Read profile"], connectedOn: "5 Apr 2026", tokenExpiry: "Suspended",
    publishingPermission: false, recentFailures: 0,
    suspension: "Platform suspended the account pending review of a reported pin.",
    restriction: "Publishing restricted by platform until review completes.",
    requiredAction: "Submit a platform appeal and keep publishing paused.",
    publishingPaused: true, tone: "from-rose-500/25 to-rose-500/5",
    users: [
      { name: "Priya Nanda", role: "Social Media Account Manager", level: "Account Administrator", grantedOn: "5 Apr 2026", grantedBy: "CEO", lastActivity: "18 Jul, 10:00" },
    ],
    accessHistory: [{ at: "18 Jul 2026", by: "System", note: "Platform suspension notice received" }],
  },
  {
    id: "SA-07", platform: "Other", accountName: "Google Business Profiles", handle: "22 store listings",
    brand: "Clean Craft Franchise", profileUrl: "https://business.google.com/cleancraft",
    owner: "Clean Craft Pvt Ltd", managers: ["Priya Nanda", "Performance Marketing Executive"],
    status: "Connected", lastSync: "Today, 08:00", lastPublished: "Today, 08:00", scheduledCount: 0,
    permissions: ["Read listings", "Post updates", "Reply to reviews"], connectedOn: "8 Jan 2026",
    tokenExpiry: "Valid for 90 days", publishingPermission: true, recentFailures: 0,
    requiredAction: "None", tone: "from-emerald-500/25 to-emerald-500/5",
    users: [
      { name: "Priya Nanda", role: "Social Media Account Manager", level: "Account Administrator", grantedOn: "8 Jan 2026", grantedBy: "CEO", lastActivity: "Today, 08:00" },
      { name: "Ankit Rana", role: "Performance Marketing Executive", level: "Publisher", grantedOn: "8 Jan 2026", grantedBy: "CEO", lastActivity: "Today, 07:50" },
    ],
    accessHistory: [{ at: "8 Jan 2026", by: "CEO", note: "Listings group connected via platform OAuth" }],
  },
  {
    id: "SA-08", platform: "Instagram", accountName: "Clean Craft Franchise (archive)", handle: "@cleancraft.franchise",
    brand: "Clean Craft Franchise", profileUrl: "https://instagram.com/cleancraft.franchise",
    owner: "Clean Craft Pvt Ltd", managers: [], status: "Archived",
    lastSync: "10 Jun, 09:00", lastPublished: "8 Jun, 17:00", scheduledCount: 0,
    permissions: ["Read profile"], connectedOn: "3 Jan 2026", tokenExpiry: "Archived",
    publishingPermission: false, recentFailures: 0,
    requiredAction: "None — publishing history preserved for records.",
    publishingPaused: true, tone: "from-slate-500/20 to-slate-500/5",
    users: [],
    accessHistory: [
      { at: "10 Jun 2026", by: "CEO", note: "Account archived — history preserved, access revoked" },
    ],
  },
];

/* ---- Leads & Handover shared structures ---- */
export const LEAD_INTERESTS = [
  "Clean Craft Franchise",
  "GILM Course",
  "Laundry Service",
  "Product Enquiry",
  "Partnership",
  "Vendor Enquiry",
  "Customer Support",
  "Other",
] as const;
export type LeadInterest = (typeof LEAD_INTERESTS)[number];

export const HANDOVER_STAGES = [
  "New Enquiry",
  "Verification Required",
  "Qualified",
  "Ready for Handover",
  "Sent to Sales Head",
  "Awaiting Acceptance",
  "Accepted",
  "Sales Follow-up Started",
  "Returned for Information",
  "Reassigned by Sales Head",
  "Duplicate",
  "Spam",
  "Not Relevant",
] as const;
export type HandoverStage = (typeof HANDOVER_STAGES)[number];

export const QUALIFICATION_CHECKS = [
  "Name available",
  "Valid mobile number or email",
  "City identified",
  "Enquiry type selected",
  "Customer intent understood",
  "Spam check completed",
  "Duplicate check completed",
  "Relevant notes added",
  "Consent / communication preference recorded (when available)",
];

export type SmLead = {
  leadId: string;
  name: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  occupation: string;
  enquiryType: string;
  interest: LeadInterest;
  productInterest: string;
  investmentRange?: string;
  timeline: string;
  language: string;
  platform: SmPlatform;
  account: string;
  campaign: string;
  advertisement: string;
  contentId: string;
  message: string;
  consent: string;
  notes: string;
  priority: "High" | "Medium" | "Low";
  enquiredAt: string;
  minutesSinceEnquiry: number;
  stage: HandoverStage;
  duplicateOf?: string;
  duplicateOwner?: string;
  duplicateStage?: string;
  salesNote?: string;
  assignedExecutive?: string;
  returnReason?: string;
  returnCount: number;
  timeline_log: { at: string; by: string; note: string }[];
};

export const SM_LEADS: SmLead[] = [
  {
    leadId: "CC-LD-5201", name: "Rakesh Mehta", mobile: "+919876544412", email: "rakesh.mehta@gmail.com",
    city: "Jaipur", state: "Rajasthan", occupation: "Retail shop owner", enquiryType: "Franchise enquiry",
    interest: "Clean Craft Franchise", productInterest: "Franchise — Tier 2 city model",
    investmentRange: "Rs 25–30 L", timeline: "Within 30 days", language: "Hindi",
    platform: "Instagram", account: "@cleancraft.india", campaign: "Franchise Aug — Reel Ads",
    advertisement: "Reel Ad — Owner Story 15s", contentId: "CC-CN-1049",
    message: "I want franchise details for Jaipur. Please share investment and returns.",
    consent: "Consented to WhatsApp and calls", notes: "Ready capital, has 600 sq ft shop available.",
    priority: "High", enquiredAt: "Today, 07:10", minutesSinceEnquiry: 8, stage: "New Enquiry",
    returnCount: 0,
    timeline_log: [{ at: "Today, 07:10", by: "System", note: "Enquiry captured from Instagram reel ad" }],
  },
  {
    leadId: "CC-LD-5202", name: "Sunita Rao", mobile: "+919067787781", email: "sunita.rao@yahoo.com",
    city: "Pune", state: "Maharashtra", occupation: "Homemaker", enquiryType: "Service enquiry",
    interest: "Laundry Service", productInterest: "Monthly laundry plan", timeline: "This week",
    language: "Marathi", platform: "Instagram", account: "@cleancraft.india",
    campaign: "Service Awareness", advertisement: "Static Post — Fabric Care",
    contentId: "CC-CN-1052", message: "Do you pick up from Kothrud? What is monthly cost?",
    consent: "Consented to calls", notes: "Enquired earlier in July as well.",
    priority: "Medium", enquiredAt: "Today, 09:35", minutesSinceEnquiry: 45,
    stage: "Verification Required", duplicateOf: "CC-LD-5088", duplicateOwner: "Amit Khanna (Sales Exec)",
    duplicateStage: "Proposal Sent", returnCount: 0,
    timeline_log: [
      { at: "Today, 09:35", by: "System", note: "Enquiry captured — possible duplicate on mobile match" },
    ],
  },
  {
    leadId: "CC-LD-5203", name: "Imran Sheikh", mobile: "+919912342210", email: "imran.sheikh@outlook.com",
    city: "Bhopal", state: "Madhya Pradesh", occupation: "Textile trader", enquiryType: "Franchise enquiry",
    interest: "Clean Craft Franchise", productInterest: "Franchise — main city model",
    investmentRange: "Rs 30–40 L", timeline: "Within 15 days", language: "Hindi",
    platform: "YouTube", account: "@cleancraft", campaign: "Machine Tour Organic",
    advertisement: "Organic — Machine Walkthrough", contentId: "CC-CN-1044",
    message: "Watched your machine video. I have a commercial space ready in Bhopal.",
    consent: "Consented to WhatsApp", notes: "High intent, wants a call today.",
    priority: "High", enquiredAt: "Today, 10:02", minutesSinceEnquiry: 118, stage: "Qualified",
    returnCount: 0,
    timeline_log: [
      { at: "Today, 10:02", by: "System", note: "Enquiry captured from YouTube comment form" },
      { at: "Today, 10:20", by: "Priya Nanda", note: "Verified contact and qualified" },
    ],
  },
  {
    leadId: "CC-LD-5204", name: "Divya Nair", mobile: "+918776636634", email: "divya.nair@gmail.com",
    city: "Kochi", state: "Kerala", occupation: "Trainer", enquiryType: "Course enquiry",
    interest: "GILM Course", productInterest: "GILM certification — Aug batch", timeline: "Next month",
    language: "English", platform: "Facebook", account: "Clean Craft Laundry",
    campaign: "Webinar Promo", advertisement: "Reel Ad — Webinar Promo", contentId: "CC-CN-1050",
    message: "Please share GILM course fees and batch dates.",
    consent: "Consented to email", notes: "Wants weekend batch.",
    priority: "Medium", enquiredAt: "Yesterday, 20:15", minutesSinceEnquiry: 900,
    stage: "Ready for Handover", returnCount: 0,
    timeline_log: [
      { at: "Yesterday, 20:15", by: "System", note: "Enquiry captured from Facebook ad" },
      { at: "Yesterday, 20:50", by: "Priya Nanda", note: "Qualified — ready for handover" },
    ],
  },
  {
    leadId: "CC-LD-5205", name: "Harpreet Singh", mobile: "+918211901190", email: "harpreet.s@gmail.com",
    city: "Ludhiana", state: "Punjab", occupation: "Garment exporter", enquiryType: "Franchise enquiry",
    interest: "Clean Craft Franchise", productInterest: "Franchise — flagship model",
    investmentRange: "Rs 40 L+", timeline: "Immediate", language: "Punjabi",
    platform: "Instagram", account: "@cleancraft.india", campaign: "Franchise Aug — Reel Ads",
    advertisement: "Reel Ad — Owner Story 15s", contentId: "CC-CN-1049",
    message: "Ready to invest now. Want a meeting this week.",
    consent: "Consented to WhatsApp and calls", notes: "Very high intent — priority handover.",
    priority: "High", enquiredAt: "Today, 08:20", minutesSinceEnquiry: 260,
    stage: "Awaiting Acceptance", returnCount: 0,
    timeline_log: [
      { at: "Today, 08:20", by: "System", note: "Enquiry captured" },
      { at: "Today, 08:55", by: "Priya Nanda", note: "Sent to Sales Head — recommended response within 1 hour" },
    ],
  },
  {
    leadId: "CC-LD-5206", name: "Ankit Bansal", mobile: "+917788112233", email: "ankit.b@company.in",
    city: "Delhi", state: "Delhi", occupation: "Hotel operations manager", enquiryType: "B2B enquiry",
    interest: "Partnership", productInterest: "Bulk laundry contract — 3 properties",
    timeline: "This quarter", language: "English", platform: "LinkedIn", account: "Clean Craft Business",
    campaign: "B2B Corporate Laundry", advertisement: "Static Post — Cost Sheet", contentId: "CC-CN-1046",
    message: "We need a bulk laundry partner for 3 hotels in Delhi NCR.",
    consent: "Consented to email", notes: "Decision maker, asked for rate card.",
    priority: "High", enquiredAt: "Today, 11:05", minutesSinceEnquiry: 40, stage: "Accepted",
    assignedExecutive: "Amit Khanna", salesNote: "Accepted — B2B desk will call today.",
    returnCount: 0,
    timeline_log: [
      { at: "Today, 11:05", by: "System", note: "Enquiry captured" },
      { at: "Today, 11:20", by: "Priya Nanda", note: "Qualified and sent to Sales Head" },
      { at: "Today, 11:40", by: "Sales Head", note: "Accepted and assigned to Amit Khanna" },
    ],
  },
  {
    leadId: "CC-LD-5207", name: "Meera Joshi", mobile: "+919000012345", email: "",
    city: "", state: "", occupation: "", enquiryType: "Service enquiry",
    interest: "Laundry Service", productInterest: "Dry cleaning", timeline: "Not stated",
    language: "Hindi", platform: "Instagram", account: "@cleancraft.india",
    campaign: "Service Awareness", advertisement: "Story — Offer", contentId: "CC-CN-1043",
    message: "Rate kya hai?", consent: "Not recorded", notes: "",
    priority: "Low", enquiredAt: "Today, 06:40", minutesSinceEnquiry: 340,
    stage: "Returned for Information", returnReason: "City and service details missing — cannot route.",
    returnCount: 2,
    timeline_log: [
      { at: "Today, 06:40", by: "System", note: "Enquiry captured" },
      { at: "Today, 07:30", by: "Priya Nanda", note: "Sent to Sales Head" },
      { at: "Today, 08:10", by: "Sales Head", note: "Returned — city and service details missing" },
      { at: "Today, 09:00", by: "Sales Head", note: "Returned again — still no city" },
    ],
  },
  {
    leadId: "CC-LD-5208", name: "Promo Bot", mobile: "+910000000000", email: "spam@promo.link",
    city: "", state: "", occupation: "", enquiryType: "Other", interest: "Other",
    productInterest: "—", timeline: "—", language: "English", platform: "Facebook",
    account: "Clean Craft Laundry", campaign: "Service Awareness", advertisement: "—",
    contentId: "CC-CN-1045", message: "Buy cheap followers — click this link.",
    consent: "Not recorded", notes: "Marked spam, retained for audit history.",
    priority: "Low", enquiredAt: "Yesterday, 22:10", minutesSinceEnquiry: 800, stage: "Spam",
    returnCount: 0,
    timeline_log: [
      { at: "Yesterday, 22:10", by: "System", note: "Enquiry captured" },
      { at: "Yesterday, 22:15", by: "Priya Nanda", note: "Marked spam — kept for audit history" },
    ],
  },
];
