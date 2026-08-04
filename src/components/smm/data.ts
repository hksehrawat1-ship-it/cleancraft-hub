export type ContentFormat = "Reel" | "Carousel" | "Post" | "Story" | "YouTube";
export type Platform = "Instagram" | "YouTube" | "Facebook" | "Google Business";
export type QueueStage =
  | "Idea"
  | "Script"
  | "Design"
  | "Editing"
  | "Ready"
  | "Scheduled"
  | "Published";

export type ContentItem = {
  id: string;
  title: string;
  format: ContentFormat;
  platform: Platform;
  stage: QueueStage;
  owner: string;
  due: string;
  hook: string;
  caption: string;
  hashtags: string;
};

export const TEAM = ["Priya (SMM)", "Rohit (Editor)", "Neha (Designer)", "Aman (Script)"];

export const CONTENT_QUEUE: ContentItem[] = [
  {
    id: "C-101",
    title: "Franchise owner story — Jaipur",
    format: "Reel",
    platform: "Instagram",
    stage: "Editing",
    owner: "Rohit (Editor)",
    due: "Today",
    hook: "He left his job and opened a laundry store in 45 days",
    caption: "From salary to store owner — Jaipur franchise story.",
    hashtags: "#cleancraft #franchise #laundrybusiness",
  },
  {
    id: "C-102",
    title: "Dry clean vs steam wash — myth buster",
    format: "Carousel",
    platform: "Instagram",
    stage: "Design",
    owner: "Neha (Designer)",
    due: "Tomorrow",
    hook: "Stop ruining your suits",
    caption: "5 fabric care myths that cost you money.",
    hashtags: "#drycleaning #fabriccare",
  },
  {
    id: "C-103",
    title: "Machine walkthrough — industrial washer",
    format: "YouTube",
    platform: "YouTube",
    stage: "Script",
    owner: "Aman (Script)",
    due: "Thu",
    hook: "Inside a ₹12L laundry setup",
    caption: "Full equipment tour of a Clean Craft store.",
    hashtags: "#laundrysetup #businessideas",
  },
  {
    id: "C-104",
    title: "Store launch teaser — Indore",
    format: "Story",
    platform: "Instagram",
    stage: "Ready",
    owner: "Priya (SMM)",
    due: "Today",
    hook: "Opening this Friday",
    caption: "Indore, we're coming. Grand opening Friday 11 AM.",
    hashtags: "#indore #newstore",
  },
  {
    id: "C-105",
    title: "Customer review compilation",
    format: "Reel",
    platform: "Facebook",
    stage: "Scheduled",
    owner: "Priya (SMM)",
    due: "Fri",
    hook: "Real customers, real results",
    caption: "What our customers say after one wash.",
    hashtags: "#reviews #cleancraft",
  },
  {
    id: "C-106",
    title: "Investment breakdown — how much to start",
    format: "Post",
    platform: "Instagram",
    stage: "Idea",
    owner: "Priya (SMM)",
    due: "Next week",
    hook: "The real number nobody tells you",
    caption: "Complete cost sheet to open a laundry franchise.",
    hashtags: "#franchisecost #startup",
  },
];

export type ApprovalStatus = "Pending" | "Changes Requested" | "Approved" | "Rejected";
export type ApprovalItem = {
  id: string;
  title: string;
  format: ContentFormat;
  platform: Platform;
  submitted: string;
  approver: string;
  status: ApprovalStatus;
  remark?: string;
};

export const APPROVALS: ApprovalItem[] = [
  { id: "A-1", title: "Franchise owner story — Jaipur", format: "Reel", platform: "Instagram", submitted: "2h ago", approver: "Sales Head", status: "Pending" },
  { id: "A-2", title: "Dry clean vs steam wash", format: "Carousel", platform: "Instagram", submitted: "Yesterday", approver: "CEO", status: "Changes Requested", remark: "Fix pricing claim on slide 3." },
  { id: "A-3", title: "Store launch teaser — Indore", format: "Story", platform: "Instagram", submitted: "Today", approver: "Sales Head", status: "Approved" },
  { id: "A-4", title: "Machine walkthrough", format: "YouTube", platform: "YouTube", submitted: "3d ago", approver: "CEO", status: "Pending" },
];

export type Slot = {
  day: string;
  date: string;
  items: { time: string; title: string; platform: Platform; format: ContentFormat; status: "Published" | "Scheduled" | "Empty" }[];
};

export const CALENDAR: Slot[] = [
  { day: "Mon", date: "3 Aug", items: [{ time: "11:00", title: "Owner story — Jaipur", platform: "Instagram", format: "Reel", status: "Published" }] },
  { day: "Tue", date: "4 Aug", items: [{ time: "10:30", title: "Launch teaser — Indore", platform: "Instagram", format: "Story", status: "Scheduled" }, { time: "18:00", title: "Myth buster carousel", platform: "Instagram", format: "Carousel", status: "Scheduled" }] },
  { day: "Wed", date: "5 Aug", items: [{ time: "12:00", title: "Review compilation", platform: "Facebook", format: "Reel", status: "Scheduled" }] },
  { day: "Thu", date: "6 Aug", items: [{ time: "17:00", title: "Machine walkthrough", platform: "YouTube", format: "YouTube", status: "Scheduled" }] },
  { day: "Fri", date: "7 Aug", items: [{ time: "—", title: "Slot open", platform: "Instagram", format: "Post", status: "Empty" }] },
  { day: "Sat", date: "8 Aug", items: [{ time: "11:00", title: "Investment breakdown", platform: "Instagram", format: "Post", status: "Scheduled" }] },
  { day: "Sun", date: "9 Aug", items: [{ time: "—", title: "Slot open", platform: "Instagram", format: "Reel", status: "Empty" }] },
];

export type Account = {
  platform: Platform;
  handle: string;
  followers: string;
  growth: string;
  health: "Healthy" | "Attention" | "Action needed";
  note: string;
};

export const ACCOUNTS: Account[] = [
  { platform: "Instagram", handle: "@cleancraft.india", followers: "48.2K", growth: "+1.8%", health: "Healthy", note: "Bio link updated, DMs answered within 2h." },
  { platform: "YouTube", handle: "Clean Craft", followers: "12.4K", growth: "+0.9%", health: "Attention", note: "3 comments unanswered for 4 days." },
  { platform: "Facebook", handle: "Clean Craft Laundry", followers: "21.7K", growth: "+0.3%", health: "Attention", note: "Page cover outdated." },
  { platform: "Google Business", handle: "22 store listings", followers: "4.8★", growth: "118 reviews", health: "Healthy", note: "All listings verified." },
];

export type SocialLead = {
  id: string;
  name: string;
  city: string;
  source: Platform;
  interest: "Franchise" | "Service" | "Course";
  quality: "Hot" | "Warm" | "Cold";
  received: string;
  status: "New" | "Handed to Sales" | "Contacted" | "Dropped";
};

export const SOCIAL_LEADS: SocialLead[] = [
  { id: "L-501", name: "Rakesh Mehta", city: "Jaipur", source: "Instagram", interest: "Franchise", quality: "Hot", received: "20 min ago", status: "New" },
  { id: "L-502", name: "Sunita Rao", city: "Pune", source: "Instagram", interest: "Service", quality: "Warm", received: "1h ago", status: "New" },
  { id: "L-503", name: "Imran Sheikh", city: "Bhopal", source: "YouTube", interest: "Franchise", quality: "Hot", received: "3h ago", status: "Handed to Sales" },
  { id: "L-504", name: "Divya Nair", city: "Kochi", source: "Facebook", interest: "Course", quality: "Cold", received: "Yesterday", status: "Contacted" },
  { id: "L-505", name: "Harpreet Singh", city: "Ludhiana", source: "Instagram", interest: "Franchise", quality: "Warm", received: "Yesterday", status: "Handed to Sales" },
];

export const ANALYTICS_WEEKS = [
  { week: "W1", reach: 182000, engagement: 9200, leads: 38, followers: 640 },
  { week: "W2", reach: 214000, engagement: 11400, leads: 46, followers: 810 },
  { week: "W3", reach: 198000, engagement: 10100, leads: 41, followers: 720 },
  { week: "W4", reach: 246000, engagement: 13800, leads: 67, followers: 980 },
];

export const TOP_POSTS = [
  { title: "Owner story — Jaipur", platform: "Instagram" as Platform, reach: "82.4K", engagement: "6.1%", leads: 21 },
  { title: "Investment breakdown", platform: "Instagram" as Platform, reach: "61.2K", engagement: "5.4%", leads: 17 },
  { title: "Machine walkthrough", platform: "YouTube" as Platform, reach: "24.8K", engagement: "4.2%", leads: 9 },
  { title: "Review compilation", platform: "Facebook" as Platform, reach: "18.1K", engagement: "3.1%", leads: 5 },
];

export const RESOURCES = [
  { name: "Brand guideline (colors, fonts, logo)", type: "PDF" },
  { name: "Caption & hook swipe file", type: "Doc" },
  { name: "Approved hashtag sets by city", type: "Sheet" },
  { name: "Store photo & video library", type: "Drive" },
  { name: "Franchise offer creatives — Aug", type: "Folder" },
  { name: "Do's & Don'ts for claims and pricing", type: "PDF" },
];

export const PERFORMANCE = {
  kpis: [
    { label: "Calendar Completion", value: "92%", target: "Target 95%", pct: 92, tone: "warn" as const },
    { label: "Posts Published", value: "27", target: "Planned 29", pct: 93, tone: "warn" as const },
    { label: "Leads from Social", value: "67", target: "Target 55", pct: 100, tone: "good" as const },
    { label: "Avg Engagement", value: "5.6%", target: "Target 4.5%", pct: 100, tone: "good" as const },
    { label: "Approval Turnaround", value: "1.2 d", target: "Target < 1.5 d", pct: 88, tone: "good" as const },
    { label: "Tasks On Time", value: "94%", target: "17 of 18", pct: 94, tone: "good" as const },
    { label: "DM Response < 2h", value: "89%", target: "Target 90%", pct: 89, tone: "warn" as const },
    { label: "Follower Growth", value: "+3.1K", target: "This month", pct: 100, tone: "good" as const },
  ],
  delays: [
    { reason: "Editing pending with Video Editor", count: 2, owner: "Video Editor" },
    { reason: "Approval pending with CEO / Sales Head", count: 2, owner: "Leadership" },
    { reason: "Script not submitted on time", count: 1, owner: "SMM (own)" },
  ],
};
