export type VeStatus =
  | "New"
  | "Assigned"
  | "Editing"
  | "Ready for Review"
  | "Submitted for Review"
  | "Correction Required"
  | "Resubmitted"
  | "Approved"
  | "Scheduled"
  | "Published"
  | "Cancelled";

export type VeContentType =
  | "Short Video"
  | "Reel"
  | "YouTube Short"
  | "Long Video"
  | "Advertisement"
  | "Testimonial"
  | "Educational Video"
  | "Product Video"
  | "Franchise Video"
  | "Training Video";

export type VeCorrectionRound = {
  version: string;
  reviewer: string;
  raisedOn: string;
  deadline: string;
  urgent: boolean;
  points: string[];
  resolved: boolean;
};

export type VeVersion = {
  version: string;
  submittedOn: string;
  status: "Waiting for Review" | "Approved" | "Correction Required";
  reviewer: string;
  comments: string;
};

/** One shared content record used across the whole Video Editor workspace. */
export type VeRecord = {
  contentId: string;
  title: string;
  brand: string;
  contentType: VeContentType;
  platform: string;
  durationRequired: string;
  priority: "Urgent" | "High" | "Normal";
  deadline: string;
  deadlineNote: string;
  hoursToDeadline: number | null;
  overdue: boolean;
  dueToday: boolean;
  assignedBy: string;
  status: VeStatus;
  thumbnail: string;
  brief: string;
  briefComplete: boolean;
  rawFiles: { name: string; size: string; missing?: boolean }[];
  references: string[];
  startedAt?: string;
  corrections: VeCorrectionRound[];
  versions: VeVersion[];
  objective?: string;
  audience?: string;
  script?: string;
  audioFiles?: { name: string; size: string }[];
  brandAssets?: string[];
  conflictingInstructions?: string;
  timeline?: { at: string; who: string; what: string }[];
};

export type VeRequirements = {
  orientation: string;
  resolution: string;
  aspectRatio: string;
  duration: string;
  subtitles: string;
  logo: string;
  music: string;
  cta: string;
  exportFormat: string;
  platformNotes: string;
};

/** Derived from the shared record - no separate requirement records exist. */
export function requirementsFor(r: VeRecord): VeRequirements {
  const vertical = /Reel|Short|Story/i.test(`${r.contentType} ${r.platform}`);
  return {
    orientation: vertical ? "Vertical" : "Horizontal",
    resolution: vertical ? "1080 x 1920" : "1920 x 1080",
    aspectRatio: vertical ? "9:16" : "16:9",
    duration: r.durationRequired,
    subtitles: vertical ? "Burned-in, Hindi + English" : "Burned-in English, Hindi optional",
    logo: vertical ? "Top-right, inside safe area" : "Bottom-right, full run",
    music: "Approved licensed library only, -18dB under voice",
    cta:
      r.contentType === "Advertisement" || r.contentType === "Franchise Video"
        ? "Franchise enquiry CTA + end card"
        : "Follow + store locator end card",
    exportFormat: vertical ? "H.264 MP4, 25fps, under 200MB" : "H.264 MP4, 25fps, high bitrate",
    platformNotes: `${r.platform} — keep captions clear of platform UI, first 3s must hold the hook.`,
  };
}

export const EDITOR_NAME = "Rohit Verma";

export const VE_RECORDS: VeRecord[] = [
  {
    contentId: "CC-VID-1042",
    title: "Performance ad cut — franchise offer (3 variants)",
    brand: "Clean Craft — Franchise",
    contentType: "Advertisement",
    platform: "Meta + YouTube",
    durationRequired: "30s / 15s / 6s",
    priority: "Urgent",
    deadline: "Today, 4:00 PM",
    deadlineNote: "Correction deadline",
    hoursToDeadline: 1.5,
    overdue: false,
    dueToday: true,
    assignedBy: "Social Media Account Manager",
    status: "Correction Required",
    thumbnail: "🎬",
    brief:
      "Rebuild the offer card with the approved ₹4.9L figure. Keep hook under 3s, burned-in subtitles on every variant, end card with franchise CTA.",
    briefComplete: true,
    rawFiles: [
      { name: "CC-VID-1042_offer_master.mp4", size: "1.8 GB" },
      { name: "CC-VID-1042_offer_creative_aug.png", size: "3 MB" },
    ],
    references: ["Approved offer creative — Aug", "Last month's winning ad cut"],
    startedAt: "Today, 9:40 AM",
    corrections: [
      {
        version: "v1",
        reviewer: "Priya Nair (Social Media Account Manager)",
        raisedOn: "Yesterday, 6:10 PM",
        deadline: "Today, 4:00 PM",
        urgent: true,
        points: [
          "Offer text says ₹4.5L — must read ₹4.9L",
          "Add subtitles to the 15s variation",
          "Logo animation ends too fast on the 6s bumper",
        ],
        resolved: false,
      },
    ],
    versions: [
      {
        version: "v1",
        submittedOn: "Yesterday, 2:30 PM",
        status: "Correction Required",
        reviewer: "Priya Nair",
        comments: "Offer figure is wrong — cannot go live. Fix and resubmit today.",
      },
    ],
  },
  {
    contentId: "CC-VID-1039",
    title: "Franchise owner story — Jaipur",
    brand: "Clean Craft — Franchise",
    contentType: "Reel",
    platform: "Instagram",
    durationRequired: "0:45",
    priority: "Urgent",
    deadline: "Yesterday, 6:00 PM",
    deadlineNote: "Overdue",
    hoursToDeadline: null,
    overdue: true,
    dueToday: false,
    assignedBy: "Social Media Account Manager",
    status: "Editing",
    thumbnail: "🧑‍🔧",
    brief:
      "Open with the 'left his job' line. Subtitles in Hindi + English. Reduce background music by 6dB. End card with franchise CTA.",
    briefComplete: true,
    rawFiles: [
      { name: "CC-VID-1039_jaipur_interview.mov", size: "6.2 GB" },
      { name: "CC-VID-1039_store_broll.mp4", size: "2.1 GB" },
    ],
    references: ["CEO note on hook", "Jaipur store B-roll folder"],
    startedAt: "Yesterday, 11:15 AM",
    corrections: [
      {
        version: "v1",
        reviewer: "CEO",
        raisedOn: "2 days ago",
        deadline: "Yesterday, 6:00 PM",
        urgent: true,
        points: ["Hook is weak — start with the 'left his job' line", "Reduce background music by 6dB"],
        resolved: false,
      },
    ],
    versions: [
      {
        version: "v1",
        submittedOn: "3 days ago",
        status: "Correction Required",
        reviewer: "CEO",
        comments: "Story is good but the first 3 seconds do not hold attention.",
      },
    ],
  },
  {
    contentId: "CC-VID-1045",
    title: "Indore launch teaser",
    brand: "Clean Craft — Retail",
    contentType: "Short Video",
    platform: "Instagram Story",
    durationRequired: "0:15",
    priority: "High",
    deadline: "Today, 7:00 PM",
    deadlineNote: "Due today",
    hoursToDeadline: 5,
    overdue: false,
    dueToday: true,
    assignedBy: "Social Media Account Manager",
    status: "Ready for Review",
    thumbnail: "🏬",
    brief: "Vertical 9:16, big launch date text, store logo animation, no voice-over.",
    briefComplete: true,
    rawFiles: [{ name: "CC-VID-1045_indore_site.mp4", size: "900 MB" }],
    references: ["Launch date creative", "End card template"],
    startedAt: "Today, 8:05 AM",
    corrections: [],
    versions: [],
  },
  {
    contentId: "CC-VID-1046",
    title: "Customer review compilation — 5 cities",
    brand: "Clean Craft — Retail",
    contentType: "Testimonial",
    platform: "Instagram + Facebook",
    durationRequired: "1:10",
    priority: "Normal",
    deadline: "Fri, 5:00 PM",
    deadlineNote: "Waiting for review",
    hoursToDeadline: 52,
    overdue: false,
    dueToday: false,
    assignedBy: "Relationship Manager",
    status: "Submitted for Review",
    thumbnail: "⭐",
    brief: "5 customers, name + city captions, remove background noise, cut to 1:10 max.",
    briefComplete: true,
    rawFiles: [{ name: "CC-VID-1046_reviews_raw.zip", size: "4.4 GB" }],
    references: ["Subtitle style preset", "Lower-third template"],
    startedAt: "2 days ago",
    corrections: [
      {
        version: "v1",
        reviewer: "Priya Nair (Social Media Account Manager)",
        raisedOn: "3 days ago",
        deadline: "Yesterday",
        urgent: false,
        points: ["Cut to 1:10 max", "Add customer name and city captions"],
        resolved: true,
      },
    ],
    versions: [
      {
        version: "v1",
        submittedOn: "3 days ago",
        status: "Correction Required",
        reviewer: "Priya Nair",
        comments: "Too long and captions missing.",
      },
      {
        version: "v2",
        submittedOn: "Today, 10:20 AM",
        status: "Waiting for Review",
        reviewer: "Priya Nair",
        comments: "—",
      },
    ],
  },
  {
    contentId: "CC-VID-1047",
    title: "Machine walkthrough — industrial washer",
    brand: "Clean Craft — Products",
    contentType: "Long Video",
    platform: "YouTube",
    durationRequired: "8:20",
    priority: "Normal",
    deadline: "Thu, 6:00 PM",
    deadlineNote: "Scheduled work",
    hoursToDeadline: 30,
    overdue: false,
    dueToday: false,
    assignedBy: "CEO",
    status: "Assigned",
    thumbnail: "🧺",
    brief: "Chapter markers, lower thirds for each machine, background music low.",
    briefComplete: true,
    rawFiles: [{ name: "CC-VID-1047_washer_multicam.mp4", size: "12 GB" }],
    references: ["Product spec sheet", "Chapter list"],
    corrections: [],
    versions: [],
  },
  {
    contentId: "CC-VID-1048",
    title: "Trainer session highlights — Lucknow",
    brand: "Clean Craft — Training",
    contentType: "Training Video",
    platform: "Internal + Instagram",
    durationRequired: "0:40",
    priority: "Normal",
    deadline: "Next Mon, 1:00 PM",
    deadlineNote: "Blocked — raw file missing",
    hoursToDeadline: 120,
    overdue: false,
    dueToday: false,
    assignedBy: "Trainer & Launch Executive",
    status: "New",
    thumbnail: "🎓",
    brief: "Waiting on brief detail: which modules to feature is not specified.",
    briefComplete: false,
    rawFiles: [{ name: "CC-VID-1048_lucknow_session.mp4", size: "—", missing: true }],
    references: [],
    corrections: [],
    versions: [],
  },
  {
    contentId: "CC-VID-1031",
    title: "Franchise walkthrough film — Pune",
    brand: "Clean Craft — Franchise",
    contentType: "Franchise Video",
    platform: "YouTube",
    durationRequired: "2:30",
    priority: "Normal",
    deadline: "Delivered",
    deadlineNote: "Approved — read only",
    hoursToDeadline: null,
    overdue: false,
    dueToday: false,
    assignedBy: "Social Media Account Manager",
    status: "Approved",
    thumbnail: "✅",
    brief: "Approved without changes. Scheduling handled by the Social Media Account Manager.",
    briefComplete: true,
    rawFiles: [{ name: "CC-VID-1031_pune_walkthrough.mp4", size: "5.0 GB" }],
    references: [],
    startedAt: "Last week",
    corrections: [],
    versions: [
      {
        version: "v2",
        submittedOn: "2 days ago",
        status: "Approved",
        reviewer: "Priya Nair",
        comments: "Approved. Moving to scheduling.",
      },
    ],
  },
];

export const STATUS_TONE: Record<VeStatus, string> = {
  New: "bg-muted text-muted-foreground border-border",
  Assigned: "bg-muted text-muted-foreground border-border",
  Editing: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Ready for Review": "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Submitted for Review": "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "Correction Required": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Resubmitted: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Scheduled: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Published: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

export const PRIORITY_TONE: Record<VeRecord["priority"], string> = {
  Urgent: "bg-destructive/15 text-destructive border-destructive/30",
  High: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Normal: "bg-muted text-muted-foreground border-border",
};

/** Work queue order: urgent corrections → overdue → due today → new priority → rest. */
export function queueRank(r: VeRecord): number {
  const urgentCorrection = r.status === "Correction Required" && r.corrections.some((c) => !c.resolved && c.urgent);
  if (urgentCorrection) return 0;
  if (r.overdue) return 1;
  if (r.dueToday) return 2;
  if (r.status === "New" || r.status === "Assigned") return 3;
  return 4;
}

export function isReadOnly(r: VeRecord) {
  return r.status === "Approved" || r.status === "Scheduled" || r.status === "Published" || r.status === "Cancelled";
}

export type VeAlert = { text: string; tone: "bad" | "warn" | "info"; contentId: string };

export function buildAlerts(records: VeRecord[]): VeAlert[] {
  const alerts: VeAlert[] = [];
  for (const r of records) {
    if (r.status === "Correction Required" && r.corrections.some((c) => !c.resolved && c.urgent))
      alerts.push({ text: `Urgent correction on ${r.title}`, tone: "bad", contentId: r.contentId });
    if (r.overdue) alerts.push({ text: `Overdue — ${r.title} (${r.deadline})`, tone: "bad", contentId: r.contentId });
    if (!r.overdue && r.hoursToDeadline !== null && r.hoursToDeadline <= 2)
      alerts.push({ text: `Deadline within 2 hours — ${r.title}`, tone: "warn", contentId: r.contentId });
    if (r.rawFiles.some((f) => f.missing))
      alerts.push({ text: `Missing raw file — ${r.title}`, tone: "warn", contentId: r.contentId });
    if (!r.briefComplete)
      alerts.push({ text: `Editing brief incomplete — ${r.title}`, tone: "warn", contentId: r.contentId });
    if (r.versions.some((v) => v.status === "Correction Required") && r.status === "Correction Required")
      alerts.push({ text: `Submission rejected — ${r.contentId} needs a new version`, tone: "warn", contentId: r.contentId });
    if (r.status === "Submitted for Review" && (r.hoursToDeadline ?? 0) > 48)
      alerts.push({ text: `Waiting too long for review — ${r.title}`, tone: "info", contentId: r.contentId });
  }
  return alerts;
}

export const BRANDS = Array.from(new Set(VE_RECORDS.map((r) => r.brand)));
export const CONTENT_TYPES = Array.from(new Set(VE_RECORDS.map((r) => r.contentType)));
export const PLATFORMS = Array.from(new Set(VE_RECORDS.map((r) => r.platform)));
export const ASSIGNERS = Array.from(new Set(VE_RECORDS.map((r) => r.assignedBy)));
export const ALL_STATUSES: VeStatus[] = [
  "New",
  "Assigned",
  "Editing",
  "Ready for Review",
  "Submitted for Review",
  "Correction Required",
  "Resubmitted",
  "Approved",
  "Scheduled",
  "Published",
  "Cancelled",
];

export function currentVersion(r: VeRecord) {
  return r.versions.length ? r.versions[r.versions.length - 1].version : "—";
}
