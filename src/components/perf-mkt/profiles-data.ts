/**
 * Google Business & Social Profile records for the Performance Marketing Executive workspace.
 *
 * Lineage: Store ID -> Profile record (one active record per store per platform)
 *          Store ID -> Profile Task ID -> proof / audit history
 *
 * SECURITY: only public profile links, platform account IDs and authorised-access
 * status are stored. No platform passwords, API keys or tokens live in the CRM.
 */

import type { Tone } from "./data";

export const PROFILE_TODAY = "2026-08-06";

export const PLATFORMS = ["Google Business Profile", "Facebook Page", "Instagram Business Profile"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** Structure is ready for future platforms (YouTube, JustDial, Maps partners) — none active yet. */
export const FUTURE_PLATFORMS: string[] = [];

export const platformShort: Record<Platform, string> = {
  "Google Business Profile": "Google",
  "Facebook Page": "Facebook",
  "Instagram Business Profile": "Instagram",
};

export type ProfileState =
  | "not_created"
  | "created"
  | "verification_pending"
  | "verified"
  | "update_due"
  | "restricted"
  | "suspended"
  | "duplicate";

export const profileStateMeta: Record<ProfileState, { label: string; tone: Tone }> = {
  not_created: { label: "Not created", tone: "draft" },
  created: { label: "Created", tone: "active" },
  verification_pending: { label: "Verification pending", tone: "attention" },
  verified: { label: "Verified", tone: "healthy" },
  update_due: { label: "Update due", tone: "attention" },
  restricted: { label: "Restricted", tone: "overdue" },
  suspended: { label: "Suspended", tone: "overdue" },
  duplicate: { label: "Duplicate found", tone: "overdue" },
};

export const CHECKLIST_ITEMS = [
  "Correct business name",
  "Store address",
  "Map location",
  "Contact number",
  "Website or booking link",
  "Business category",
  "Opening hours",
  "Service area",
  "Business description",
  "Logo",
  "Cover image",
  "Store photographs",
  "Services",
  "Social links",
  "Verification",
  "Manager access",
  "Brand consistency",
] as const;
export type ChecklistItem = (typeof CHECKLIST_ITEMS)[number];

export type PlatformProfile = {
  platform: Platform;
  state: ProfileState;
  publicLink: string;
  accountId: string;
  authorisedAccess: "manager access granted" | "owner access granted" | "access requested" | "no access";
  lastUpdated: string;
  lastAudit: string;
  lastPost?: string;
  checklist: ChecklistItem[];
  /** Google Business Profile specific tracking. */
  google?: {
    created: boolean;
    ownershipRequest: "not required" | "raised" | "approved" | "rejected";
    verificationMethod: string;
    verificationStatus: string;
    businessInfo: string;
    categories: string;
    services: string;
    openingHours: string;
    holidayHours: string;
    photosVideos: string;
    posts: string;
    qAndA: string;
    reviewCount: number;
    rating: number | null;
    reviewResponseStatus: string;
    issue?: string;
    reinstatement?: string;
  };
  /** Facebook / Instagram specific tracking. */
  social?: {
    created: boolean;
    businessAccountConnected: boolean;
    storeDetails: string;
    logoCover: string;
    bio: string;
    contactButtons: string;
    websiteLink: string;
    location: string;
    businessHours: string;
    pageRoles: string;
    profileQuality: string;
    warning?: string;
  };
};

export type StoreProfileRecord = {
  storeId: string;
  store: string;
  city: string;
  rm: string;
  executive: string;
  profiles: PlatformProfile[];
  nextAction: string;
  deadline: string;
  /** Manually entered until official Google / Meta integrations are connected. */
  visibility: { views: number | null; calls: number | null; directions: number | null; websiteClicks: number | null; source: string };
};

export type TaskStatus =
  | "requested"
  | "assigned"
  | "information_required"
  | "in_progress"
  | "verification_pending"
  | "review"
  | "completed"
  | "on_hold"
  | "correction_required"
  | "platform_issue"
  | "suspended"
  | "cancelled";

export const taskStatusMeta: Record<TaskStatus, { label: string; tone: Tone }> = {
  requested: { label: "Requested", tone: "attention" },
  assigned: { label: "Assigned", tone: "active" },
  information_required: { label: "Information Required", tone: "attention" },
  in_progress: { label: "In Progress", tone: "active" },
  verification_pending: { label: "Verification Pending", tone: "attention" },
  review: { label: "Review", tone: "attention" },
  completed: { label: "Completed", tone: "healthy" },
  on_hold: { label: "On Hold", tone: "draft" },
  correction_required: { label: "Correction Required", tone: "overdue" },
  platform_issue: { label: "Platform Issue", tone: "overdue" },
  suspended: { label: "Suspended", tone: "overdue" },
  cancelled: { label: "Cancelled", tone: "draft" },
};

export const TASK_FLOW: TaskStatus[] = [
  "requested",
  "assigned",
  "information_required",
  "in_progress",
  "verification_pending",
  "review",
  "completed",
];

export const TASK_TYPES = [
  "Create New Profile",
  "Verify Profile",
  "Update Business Information",
  "Add or Update Photos",
  "Update Opening Hours",
  "Publish Profile Post",
  "Correct Map Location",
  "Respond to Reviews",
  "Resolve Duplicate Profile",
  "Resolve Restriction or Suspension",
  "Profile Audit",
  "Other",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export type ProfileTask = {
  id: string;
  storeId: string;
  store: string;
  city: string;
  platform: Platform;
  type: TaskType;
  requestedBy: string;
  assignedTo: string;
  rm: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  requestDate: string;
  dueDate: string;
  status: TaskStatus;
  requiredInformation: string;
  attachments: string[];
  nextAction: string;
  notes: string;
  proof?: string;
  audit: { at: string; by: string; action: string }[];
};

export type ReviewItem = {
  id: string;
  storeId: string;
  store: string;
  platform: Platform;
  customer: string;
  rating: number;
  date: string;
  text: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  responseStatus: "awaiting reply" | "draft ready" | "approval pending" | "responded" | "escalated";
  assignedTo: string;
  replyDeadline: string;
  draft?: string;
};

const gbp = (over: Partial<NonNullable<PlatformProfile["google"]>>): NonNullable<PlatformProfile["google"]> => ({
  created: true,
  ownershipRequest: "not required",
  verificationMethod: "Video verification",
  verificationStatus: "Verified",
  businessInfo: "Complete",
  categories: "Dry cleaner (primary), Laundry service",
  services: "12 services listed with prices",
  openingHours: "Mon–Sun 9:00–21:00",
  holidayHours: "Set for August festivals",
  photosVideos: "18 photos, 1 walkthrough video",
  posts: "Weekly offer posts",
  qAndA: "4 questions answered",
  reviewCount: 42,
  rating: 4.7,
  reviewResponseStatus: "All replied",
  ...over,
});

const social = (over: Partial<NonNullable<PlatformProfile["social"]>>): NonNullable<PlatformProfile["social"]> => ({
  created: true,
  businessAccountConnected: true,
  storeDetails: "Correct",
  logoCover: "Brand logo + store cover uploaded",
  bio: "Store bio with service area and pickup line",
  contactButtons: "Call and WhatsApp enabled",
  websiteLink: "Store landing page",
  location: "Mapped to store address",
  businessHours: "9:00–21:00 daily",
  pageRoles: "Executive: editor, RM: moderator",
  profileQuality: "Good",
  ...over,
});

export const STORE_PROFILES: StoreProfileRecord[] = [
  {
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    rm: "Ritika Bansal",
    executive: "Nikhil Arora",
    nextAction: "Publish August offer post on Google and Instagram",
    deadline: "2026-08-09",
    visibility: { views: 18400, calls: 214, directions: 168, websiteClicks: 342, source: "Manual entry — screenshot attached" },
    profiles: [
      {
        platform: "Google Business Profile",
        state: "verified",
        publicLink: "https://g.page/cleancraft-vaishali",
        accountId: "GBP-JAI-1042",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-08-02",
        lastAudit: "2026-07-28",
        lastPost: "2026-08-01",
        checklist: [...CHECKLIST_ITEMS],
        google: gbp({}),
      },
      {
        platform: "Facebook Page",
        state: "verified",
        publicLink: "https://facebook.com/cleancraftvaishali",
        accountId: "FB-JAI-1042",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-08-01",
        lastAudit: "2026-07-28",
        lastPost: "2026-08-01",
        checklist: [...CHECKLIST_ITEMS],
        social: social({}),
      },
      {
        platform: "Instagram Business Profile",
        state: "verified",
        publicLink: "https://instagram.com/cleancraft.vaishali",
        accountId: "IG-JAI-1042",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-07-30",
        lastAudit: "2026-07-28",
        lastPost: "2026-07-30",
        checklist: CHECKLIST_ITEMS.filter((i) => i !== "Store photographs"),
        social: social({ profileQuality: "Good — needs more store photos" }),
      },
    ],
  },
  {
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    nextAction: "Complete Google video verification before launch week",
    deadline: "2026-08-08",
    visibility: { views: null, calls: null, directions: null, websiteClicks: null, source: "Not available — profile new" },
    profiles: [
      {
        platform: "Google Business Profile",
        state: "verification_pending",
        publicLink: "https://business.google.com/pending/baner",
        accountId: "GBP-PUN-1134",
        authorisedAccess: "access requested",
        lastUpdated: "2026-08-04",
        lastAudit: "2026-08-04",
        checklist: CHECKLIST_ITEMS.filter((i) => !["Verification", "Store photographs", "Services", "Social links"].includes(i)),
        google: gbp({
          verificationStatus: "Video verification submitted 04 Aug 2026 — awaiting Google review",
          ownershipRequest: "raised",
          photosVideos: "6 photos uploaded, store front pending",
          services: "Draft list pending store confirmation",
          reviewCount: 0,
          rating: null,
          reviewResponseStatus: "No reviews yet",
          posts: "None yet",
          qAndA: "None yet",
          holidayHours: "Not set",
        }),
      },
      {
        platform: "Facebook Page",
        state: "created",
        publicLink: "https://facebook.com/cleancraftbaner",
        accountId: "FB-PUN-1134",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-08-05",
        lastAudit: "2026-08-05",
        checklist: CHECKLIST_ITEMS.filter((i) => !["Cover image", "Store photographs", "Social links", "Verification"].includes(i)),
        social: social({ logoCover: "Logo uploaded, cover pending launch creative", profileQuality: "Incomplete" }),
      },
      {
        platform: "Instagram Business Profile",
        state: "not_created",
        publicLink: "",
        accountId: "",
        authorisedAccess: "no access",
        lastUpdated: "—",
        lastAudit: "—",
        checklist: [],
      },
    ],
  },
  {
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    city: "Surat",
    rm: "Yash Malhotra",
    executive: "Nikhil Arora",
    nextAction: "File reinstatement appeal with Google support",
    deadline: "2026-08-07",
    visibility: { views: 6200, calls: 41, directions: 28, websiteClicks: 64, source: "Manual entry — pre-suspension screenshot" },
    profiles: [
      {
        platform: "Google Business Profile",
        state: "suspended",
        publicLink: "https://g.page/cleancraft-adajan",
        accountId: "GBP-SUR-1103",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-07-30",
        lastAudit: "2026-08-05",
        checklist: CHECKLIST_ITEMS.filter((i) => i !== "Verification"),
        google: gbp({
          verificationStatus: "Suspended — verification revoked",
          issue: "Suspended on 03 Aug 2026 — address mismatch flagged by Google",
          reinstatement: "Appeal drafted, documents pending from store owner",
          reviewCount: 26,
          rating: 4.5,
          reviewResponseStatus: "3 reviews awaiting reply",
          posts: "Paused while suspended",
        }),
      },
      {
        platform: "Facebook Page",
        state: "verified",
        publicLink: "https://facebook.com/cleancraftadajan",
        accountId: "FB-SUR-1103",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-07-26",
        lastAudit: "2026-07-26",
        lastPost: "2026-07-12",
        checklist: [...CHECKLIST_ITEMS],
        social: social({ profileQuality: "Good — no post in 25 days" }),
      },
      {
        platform: "Instagram Business Profile",
        state: "restricted",
        publicLink: "https://instagram.com/cleancraft.adajan",
        accountId: "IG-SUR-1103",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-07-24",
        lastAudit: "2026-08-05",
        lastPost: "2026-07-10",
        checklist: CHECKLIST_ITEMS.filter((i) => i !== "Verification"),
        social: social({ warning: "Restricted reach warning — offer wording flagged 02 Aug 2026", profileQuality: "Attention required" }),
      },
    ],
  },
  {
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    rm: "Sanya Kapoor",
    executive: "Nikhil Arora",
    nextAction: "Reply to 2 negative Google reviews and update festival hours",
    deadline: "2026-08-07",
    visibility: { views: 14100, calls: 158, directions: 121, websiteClicks: 246, source: "Manual entry — screenshot attached" },
    profiles: [
      {
        platform: "Google Business Profile",
        state: "update_due",
        publicLink: "https://g.page/cleancraft-gomtinagar",
        accountId: "GBP-LKO-1088",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-07-14",
        lastAudit: "2026-07-14",
        lastPost: "2026-07-18",
        checklist: CHECKLIST_ITEMS.filter((i) => i !== "Service area"),
        google: gbp({
          holidayHours: "Festival hours not set",
          reviewCount: 51,
          rating: 4.3,
          reviewResponseStatus: "2 reviews awaiting reply",
          posts: "Last post 18 Jul 2026",
        }),
      },
      {
        platform: "Facebook Page",
        state: "verified",
        publicLink: "https://facebook.com/cleancraftgomtinagar",
        accountId: "FB-LKO-1088",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-08-01",
        lastAudit: "2026-07-20",
        lastPost: "2026-08-02",
        checklist: [...CHECKLIST_ITEMS],
        social: social({}),
      },
      {
        platform: "Instagram Business Profile",
        state: "verified",
        publicLink: "https://instagram.com/cleancraft.gomtinagar",
        accountId: "IG-LKO-1088",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-08-02",
        lastAudit: "2026-07-20",
        lastPost: "2026-08-03",
        checklist: [...CHECKLIST_ITEMS],
        social: social({}),
      },
    ],
  },
  {
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    rm: "Aakash Menon",
    executive: "Nikhil Arora",
    nextAction: "Remove duplicate Google listing and merge reviews",
    deadline: "2026-08-10",
    visibility: { views: 11800, calls: 132, directions: 98, websiteClicks: 187, source: "Manual entry — screenshot attached" },
    profiles: [
      {
        platform: "Google Business Profile",
        state: "duplicate",
        publicLink: "https://g.page/cleancraft-vijaynagar",
        accountId: "GBP-IND-1067",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-08-03",
        lastAudit: "2026-08-04",
        lastPost: "2026-08-03",
        checklist: CHECKLIST_ITEMS.filter((i) => i !== "Map location"),
        google: gbp({
          issue: "Duplicate listing found at old shop address — splitting reviews and directions",
          reviewCount: 37,
          rating: 4.6,
          reviewResponseStatus: "1 review awaiting reply",
        }),
      },
      {
        platform: "Facebook Page",
        state: "verified",
        publicLink: "https://facebook.com/cleancraftvijaynagar",
        accountId: "FB-IND-1067",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-07-29",
        lastAudit: "2026-07-29",
        lastPost: "2026-08-04",
        checklist: [...CHECKLIST_ITEMS],
        social: social({}),
      },
      {
        platform: "Instagram Business Profile",
        state: "verified",
        publicLink: "https://instagram.com/cleancraft.vijaynagar",
        accountId: "IG-IND-1067",
        authorisedAccess: "manager access granted",
        lastUpdated: "2026-07-29",
        lastAudit: "2026-07-29",
        lastPost: "2026-08-04",
        checklist: [...CHECKLIST_ITEMS],
        social: social({}),
      },
    ],
  },
];

export const PROFILE_TASKS: ProfileTask[] = [
  {
    id: "PRF-2201",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    platform: "Google Business Profile",
    type: "Verify Profile",
    requestedBy: "Aakash Menon (RM)",
    assignedTo: "Nikhil Arora",
    rm: "Aakash Menon",
    priority: "Urgent",
    requestDate: "2026-08-03",
    dueDate: "2026-08-08",
    status: "verification_pending",
    requiredInformation: "Store front video with signage and electricity bill copy",
    attachments: ["baner-video-submission.mp4"],
    nextAction: "Follow up with Google support if not verified by 08 Aug",
    notes: "Launch campaign CMP-8845 depends on this verification.",
    audit: [
      { at: "2026-08-03", by: "Aakash Menon", action: "Task raised for STR-1134" },
      { at: "2026-08-04", by: "Nikhil Arora", action: "Video verification submitted to Google" },
    ],
  },
  {
    id: "PRF-2204",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    city: "Surat",
    platform: "Google Business Profile",
    type: "Resolve Restriction or Suspension",
    requestedBy: "Yash Malhotra (RM)",
    assignedTo: "Nikhil Arora",
    rm: "Yash Malhotra",
    priority: "Urgent",
    requestDate: "2026-08-03",
    dueDate: "2026-08-07",
    status: "platform_issue",
    requiredInformation: "Rent agreement and GST certificate showing the current store address",
    attachments: ["suspension-notice.png"],
    nextAction: "Collect documents from owner and file reinstatement appeal",
    notes: "Critical — listing suspended, store invisible on Maps. RM notified.",
    audit: [
      { at: "2026-08-03", by: "System", action: "Suspension detected during audit — marked Critical" },
      { at: "2026-08-04", by: "Nikhil Arora", action: "Appeal drafted, documents requested from store owner" },
    ],
  },
  {
    id: "PRF-2206",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    city: "Indore",
    platform: "Google Business Profile",
    type: "Resolve Duplicate Profile",
    requestedBy: "Nikhil Arora",
    assignedTo: "Nikhil Arora",
    rm: "Aakash Menon",
    priority: "High",
    requestDate: "2026-08-04",
    dueDate: "2026-08-10",
    status: "in_progress",
    requiredInformation: "Old shop address proof to support the duplicate removal request",
    attachments: ["duplicate-listing.png"],
    nextAction: "Raise duplicate removal request and request review merge",
    notes: "Duplicate is splitting direction requests.",
    audit: [{ at: "2026-08-04", by: "Nikhil Arora", action: "Duplicate listing found during audit" }],
  },
  {
    id: "PRF-2208",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    city: "Lucknow",
    platform: "Google Business Profile",
    type: "Update Opening Hours",
    requestedBy: "Sanya Kapoor (RM)",
    assignedTo: "Nikhil Arora",
    rm: "Sanya Kapoor",
    priority: "Medium",
    requestDate: "2026-08-04",
    dueDate: "2026-08-07",
    status: "assigned",
    requiredInformation: "Festival week timings confirmed by the store owner",
    attachments: [],
    nextAction: "Set holiday hours for Raksha Bandhan week",
    notes: "Store stays open till 22:00 during festival week.",
    audit: [{ at: "2026-08-04", by: "Sanya Kapoor", action: "Task raised for STR-1088" }],
  },
  {
    id: "PRF-2210",
    storeId: "STR-1134",
    store: "Clean Craft Pune — Baner",
    city: "Pune",
    platform: "Instagram Business Profile",
    type: "Create New Profile",
    requestedBy: "Aakash Menon (RM)",
    assignedTo: "Nikhil Arora",
    rm: "Aakash Menon",
    priority: "High",
    requestDate: "2026-08-05",
    dueDate: "2026-08-09",
    status: "information_required",
    requiredInformation: "Store contact number, bio wording approval and launch cover creative",
    attachments: [],
    nextAction: "Get bio wording and contact number from the RM",
    notes: "Blocked on store details — RM informed.",
    audit: [
      { at: "2026-08-05", by: "Aakash Menon", action: "Task raised for STR-1134" },
      { at: "2026-08-05", by: "Nikhil Arora", action: "Information requested from RM" },
    ],
  },
  {
    id: "PRF-2212",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    platform: "Google Business Profile",
    type: "Publish Profile Post",
    requestedBy: "Nikhil Arora",
    assignedTo: "Nikhil Arora",
    rm: "Ritika Bansal",
    priority: "Medium",
    requestDate: "2026-08-05",
    dueDate: "2026-08-09",
    status: "review",
    requiredInformation: "Approved offer creative CRV-4402",
    attachments: ["gbp-post-draft.png"],
    nextAction: "Reviewer approval, then publish",
    notes: "Weekly offer post for August.",
    audit: [{ at: "2026-08-05", by: "Nikhil Arora", action: "Post draft submitted for review" }],
  },
  {
    id: "PRF-2195",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    city: "Jaipur",
    platform: "Instagram Business Profile",
    type: "Add or Update Photos",
    requestedBy: "Ritika Bansal (RM)",
    assignedTo: "Nikhil Arora",
    rm: "Ritika Bansal",
    priority: "Low",
    requestDate: "2026-07-24",
    dueDate: "2026-07-30",
    status: "completed",
    requiredInformation: "Store interior photographs",
    attachments: ["vaishali-interior-set.zip"],
    nextAction: "Closed — next audit 28 Aug 2026",
    notes: "Six interior photos added.",
    proof: "instagram-profile-after.png",
    audit: [
      { at: "2026-07-24", by: "Ritika Bansal", action: "Task raised for STR-1042" },
      { at: "2026-07-29", by: "Nikhil Arora", action: "Photos uploaded, proof attached, marked completed" },
    ],
  },
  {
    id: "PRF-2214",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    city: "Surat",
    platform: "Instagram Business Profile",
    type: "Profile Audit",
    requestedBy: "Nikhil Arora",
    assignedTo: "Nikhil Arora",
    rm: "Yash Malhotra",
    priority: "Medium",
    requestDate: "2026-08-05",
    dueDate: "2026-08-12",
    status: "requested",
    requiredInformation: "Reach restriction notice screenshot",
    attachments: [],
    nextAction: "Audit profile and remove flagged offer wording",
    notes: "Restriction warning received 02 Aug 2026.",
    audit: [{ at: "2026-08-05", by: "Nikhil Arora", action: "Audit task created" }],
  },
];

export const REVIEWS: ReviewItem[] = [
  {
    id: "REV-9001",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    platform: "Google Business Profile",
    customer: "Rahul Verma",
    rating: 2,
    date: "2026-08-04",
    text: "Delivery was two days late and no one informed me about the delay.",
    sentiment: "Negative",
    responseStatus: "awaiting reply",
    assignedTo: "Nikhil Arora",
    replyDeadline: "2026-08-06",
  },
  {
    id: "REV-9002",
    storeId: "STR-1088",
    store: "Clean Craft Lucknow — Gomti Nagar",
    platform: "Google Business Profile",
    customer: "Neha Sinha",
    rating: 3,
    date: "2026-08-03",
    text: "Cleaning quality is good but the pickup slot was changed twice.",
    sentiment: "Neutral",
    responseStatus: "draft ready",
    assignedTo: "Nikhil Arora",
    replyDeadline: "2026-08-07",
    draft:
      "Thank you for the feedback, Neha. We are sorry about the slot changes — our store team will call you to confirm a fixed pickup window for your next order.",
  },
  {
    id: "REV-9003",
    storeId: "STR-1103",
    store: "Clean Craft Surat — Adajan",
    platform: "Google Business Profile",
    customer: "Bhavesh Patel",
    rating: 1,
    date: "2026-08-02",
    text: "Shirt was damaged and the staff refused to accept responsibility.",
    sentiment: "Negative",
    responseStatus: "escalated",
    assignedTo: "Nikhil Arora",
    replyDeadline: "2026-08-05",
  },
  {
    id: "REV-9004",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    platform: "Google Business Profile",
    customer: "Anjali Sharma",
    rating: 5,
    date: "2026-08-04",
    text: "Excellent premium care for my sarees. Pickup was on time.",
    sentiment: "Positive",
    responseStatus: "responded",
    assignedTo: "Nikhil Arora",
    replyDeadline: "2026-08-07",
  },
  {
    id: "REV-9005",
    storeId: "STR-1067",
    store: "Clean Craft Indore — Vijay Nagar",
    platform: "Google Business Profile",
    customer: "Sameer Joshi",
    rating: 4,
    date: "2026-08-03",
    text: "Good weekday offer, would like faster delivery on weekends.",
    sentiment: "Positive",
    responseStatus: "awaiting reply",
    assignedTo: "Nikhil Arora",
    replyDeadline: "2026-08-07",
  },
  {
    id: "REV-9006",
    storeId: "STR-1042",
    store: "Clean Craft Jaipur — Vaishali",
    platform: "Facebook Page",
    customer: "Mohit Agarwal",
    rating: 5,
    date: "2026-08-01",
    text: "Shoe laundry results were surprisingly good.",
    sentiment: "Positive",
    responseStatus: "approval pending",
    assignedTo: "Nikhil Arora",
    replyDeadline: "2026-08-06",
    draft: "Thank you Mohit! Glad the shoe laundry worked well — see you again soon.",
  },
];

export const completionPct = (p: PlatformProfile) =>
  Math.round((p.checklist.length / CHECKLIST_ITEMS.length) * 100);

export const storeCompletionPct = (s: StoreProfileRecord) =>
  Math.round(s.profiles.reduce((sum, p) => sum + completionPct(p), 0) / s.profiles.length);

const BAD_STATES: ProfileState[] = ["suspended", "restricted", "duplicate"];

export type Health = "Healthy" | "Attention Required" | "Critical";

/** A suspended or restricted account can never be reported as healthy. */
export function storeHealth(s: StoreProfileRecord): Health {
  if (s.profiles.some((p) => p.state === "suspended")) return "Critical";
  if (s.profiles.some((p) => BAD_STATES.includes(p.state))) return "Critical";
  if (
    s.profiles.some((p) => ["not_created", "verification_pending", "update_due"].includes(p.state)) ||
    storeCompletionPct(s) < 90
  )
    return "Attention Required";
  return "Healthy";
}

export const healthTone: Record<Health, Tone> = {
  Healthy: "healthy",
  "Attention Required": "attention",
  Critical: "overdue",
};

export const latestUpdate = (s: StoreProfileRecord) =>
  s.profiles.map((p) => p.lastUpdated).filter((d) => d !== "—").sort().reverse()[0] ?? "—";

export const isTaskOverdue = (t: ProfileTask) =>
  !["completed", "cancelled"].includes(t.status) && t.dueDate < PROFILE_TODAY;

/** A task cannot be marked completed without proof. */
export const canComplete = (t: ProfileTask) => !!t.proof || t.status === "review";

export function storeAlerts(s: StoreProfileRecord): { text: string; critical: boolean }[] {
  const a: { text: string; critical: boolean }[] = [];
  for (const p of s.profiles) {
    const name = platformShort[p.platform];
    if (p.state === "suspended") a.push({ text: `${name} profile suspended — ownership and visibility at risk`, critical: true });
    if (p.state === "restricted") a.push({ text: `${name} account restricted`, critical: true });
    if (p.state === "duplicate") a.push({ text: `Duplicate ${name} profile found`, critical: true });
    if (p.state === "verification_pending" && s.deadline < PROFILE_TODAY)
      a.push({ text: `${name} verification pending beyond deadline`, critical: false });
    if (p.state === "not_created") a.push({ text: `${name} profile not created yet`, critical: false });
    if (completionPct(p) < 100 && p.state !== "not_created")
      a.push({ text: `${name} profile information incomplete`, critical: false });
    if (p.lastUpdated !== "—" && p.lastUpdated < "2026-07-22")
      a.push({ text: `No ${name} profile update in over 15 days`, critical: false });
    if (p.lastPost && p.lastPost < "2026-07-23")
      a.push({ text: `No ${name} post within the approved frequency`, critical: false });
    if (p.social?.warning) a.push({ text: `${name}: ${p.social.warning}`, critical: true });
  }
  const negative = REVIEWS.filter(
    (r) => r.storeId === s.storeId && r.sentiment === "Negative" && !["responded", "escalated"].includes(r.responseStatus),
  );
  if (negative.length) a.push({ text: `${negative.length} negative review awaiting response`, critical: false });
  return a;
}

/** Performance data prepared here; the final KPI score is computed on the Performance page. */
export const PERFORMANCE_PREP = {
  profilesCreated: 13,
  profilesVerified: 10,
  avgSetupDays: 4.2,
  profileCompletionRate: 91,
  onTimeUpdateRate: 88,
  avgReviewResponseHours: 19,
  negativeReviewsResolved: 7,
  suspensionsResolved: 2,
  profileHealthScore: 78,
  visibilitySource: "Manual entry until official Google Business Profile and Meta integrations are connected",
};
