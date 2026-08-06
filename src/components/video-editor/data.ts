export type VideoFormat = "Reel" | "YouTube" | "Ad Cut" | "Testimonial" | "Story";
export type VideoStage =
  | "Assigned"
  | "Footage Received"
  | "Rough Cut"
  | "Editing"
  | "Ready to Submit"
  | "In Review"
  | "Corrections"
  | "Approved"
  | "Published";

export type VideoJob = {
  id: string;
  title: string;
  format: VideoFormat;
  requestedBy: string;
  stage: VideoStage;
  due: string;
  overdue?: boolean;
  duration: string;
  brief: string;
  footage: "Received" | "Partial" | "Awaited";
};

export const VIDEO_JOBS: VideoJob[] = [
  {
    id: "V-201",
    title: "Franchise owner story — Jaipur",
    format: "Reel",
    requestedBy: "Social Media Manager",
    stage: "Editing",
    due: "Today",
    overdue: true,
    duration: "0:45",
    brief: "Hook in first 3s, subtitles, end card with franchise CTA.",
    footage: "Received",
  },
  {
    id: "V-202",
    title: "Machine walkthrough — industrial washer",
    format: "YouTube",
    requestedBy: "CEO",
    stage: "Rough Cut",
    due: "Thu",
    duration: "8:20",
    brief: "Chapter markers, lower thirds for each machine, background music low.",
    footage: "Received",
  },
  {
    id: "V-203",
    title: "Indore launch teaser",
    format: "Story",
    requestedBy: "Social Media Manager",
    stage: "Ready to Submit",
    due: "Today",
    duration: "0:15",
    brief: "Vertical 9:16, big date text, store logo animation.",
    footage: "Received",
  },
  {
    id: "V-204",
    title: "Customer review compilation",
    format: "Testimonial",
    requestedBy: "Relationship Manager",
    stage: "In Review",
    due: "Fri",
    duration: "1:10",
    brief: "5 customers, name + city captions, no background noise.",
    footage: "Received",
  },
  {
    id: "V-205",
    title: "Performance ad cut — franchise offer",
    format: "Ad Cut",
    requestedBy: "Performance Marketing",
    stage: "Corrections",
    due: "Tomorrow",
    duration: "0:30",
    brief: "3 variations: 30s, 15s, 6s bumper. Offer text must match creative.",
    footage: "Received",
  },
  {
    id: "V-206",
    title: "Trainer session highlights — Lucknow",
    format: "Reel",
    requestedBy: "Trainer & Launch",
    stage: "Assigned",
    due: "Next week",
    duration: "0:40",
    brief: "Waiting on raw footage from the launch executive.",
    footage: "Awaited",
  },
];

export type Submission = {
  id: string;
  videoId: string;
  title: string;
  version: string;
  submittedTo: string;
  submittedOn: string;
  status: "In Review" | "Approved" | "Corrections" | "Rejected";
  link: string;
  note: string;
};

export const SUBMISSIONS: Submission[] = [
  {
    id: "S-1",
    videoId: "V-204",
    title: "Customer review compilation",
    version: "v2",
    submittedTo: "Social Media Manager",
    submittedOn: "Today, 10:20 AM",
    status: "In Review",
    link: "drive.link/review-compilation-v2",
    note: "Trimmed to 1:10, added city captions.",
  },
  {
    id: "S-2",
    videoId: "V-205",
    title: "Performance ad cut — franchise offer",
    version: "v1",
    submittedTo: "Performance Marketing",
    submittedOn: "Yesterday",
    status: "Corrections",
    link: "drive.link/ad-cut-v1",
    note: "All 3 durations exported.",
  },
  {
    id: "S-3",
    videoId: "V-203",
    title: "Indore launch teaser",
    version: "v1",
    submittedTo: "Social Media Manager",
    submittedOn: "2 days ago",
    status: "Approved",
    link: "drive.link/indore-teaser-v1",
    note: "Approved without changes.",
  },
];

export type Correction = {
  id: string;
  videoId: string;
  title: string;
  raisedBy: string;
  raisedOn: string;
  version: string;
  points: string[];
  priority: "High" | "Normal";
  done: boolean;
};

export const CORRECTIONS: Correction[] = [
  {
    id: "R-1",
    videoId: "V-205",
    title: "Performance ad cut — franchise offer",
    raisedBy: "Performance Marketing",
    raisedOn: "Yesterday",
    version: "v1",
    priority: "High",
    points: [
      "Offer text does not match the approved offer creative",
      "Add subtitles to the 15s variation",
      "Logo animation ends too fast on the 6s bumper",
    ],
    done: false,
  },
  {
    id: "R-2",
    videoId: "V-201",
    title: "Franchise owner story — Jaipur",
    raisedBy: "CEO",
    raisedOn: "2 days ago",
    version: "v1",
    priority: "High",
    points: ["Hook is weak, start with the 'left his job' line", "Reduce background music by 6dB"],
    done: false,
  },
  {
    id: "R-3",
    videoId: "V-204",
    title: "Customer review compilation",
    raisedBy: "Social Media Manager",
    raisedOn: "3 days ago",
    version: "v1",
    priority: "Normal",
    points: ["Cut to 1:10 max", "Add customer name and city captions"],
    done: true,
  },
];

export const ASSETS = [
  { name: "Logo pack (PNG, SVG, animated MOGRT)", type: "Folder" },
  { name: "Brand fonts — Poppins + Anek Devanagari", type: "Folder" },
  { name: "Brand colour codes & lower-third templates", type: "Preset" },
  { name: "Licensed background music library", type: "Audio" },
  { name: "Store B-roll library (city wise)", type: "Drive" },
  { name: "End cards & CTA templates", type: "Preset" },
  { name: "Subtitle style preset (Hindi + English)", type: "Preset" },
  { name: "Approved offer creatives — Aug", type: "Folder" },
];

export const GUIDELINES = [
  "Hook must land in the first 3 seconds — no long intros.",
  "Every reel and ad cut needs burned-in subtitles.",
  "Reels and stories: 1080x1920. YouTube: 1920x1080 at 25fps.",
  "Use only licensed music from the approved library.",
  "Never change pricing, offer or claim text — use the approved creative.",
  "Keep logo safe area clear of captions and stickers.",
  "Export H.264 MP4, under 200MB for reels.",
  "Name files as VideoID_Title_vN (e.g. V-201_JaipurStory_v2).",
];

export const PERFORMANCE = {
  kpis: [
    { label: "Videos Delivered", value: "34", sub: "This month", tone: "good" as const, pct: 100 },
    { label: "On-Time Delivery", value: "91%", sub: "31 of 34", tone: "good" as const, pct: 91 },
    { label: "Avg Turnaround", value: "1.6 d", sub: "Target < 2 d", tone: "good" as const, pct: 88 },
    { label: "First-Cut Approval", value: "76%", sub: "Target 80%", tone: "warn" as const, pct: 76 },
    { label: "Corrections per Video", value: "0.7", sub: "Target < 1", tone: "good" as const, pct: 82 },
    { label: "Pending with Me", value: "3", sub: "1 overdue", tone: "warn" as const, pct: 60 },
    { label: "Rejected Videos", value: "1", sub: "Wrong offer text", tone: "warn" as const, pct: 40 },
    { label: "Reels Published", value: "22", sub: "Live on social", tone: "good" as const, pct: 100 },
  ],
  weeks: [
    { week: "W1", delivered: 7, onTime: 7, corrections: 4 },
    { week: "W2", delivered: 9, onTime: 8, corrections: 6 },
    { week: "W3", delivered: 8, onTime: 7, corrections: 5 },
    { week: "W4", delivered: 10, onTime: 9, corrections: 8 },
  ],
  delays: [
    { reason: "Footage received late from field team", count: 3, owner: "Requester" },
    { reason: "Approval pending with CEO / SMM", count: 2, owner: "Leadership" },
    { reason: "Export missed the deadline", count: 1, owner: "Video Editor (own)" },
  ],
};
