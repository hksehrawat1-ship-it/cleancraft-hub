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
