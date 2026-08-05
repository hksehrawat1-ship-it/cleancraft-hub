/**
 * Packing task records. One permanent Packing Task ID per task, always linked
 * to exactly one Dispatch ID and Clearance ID. Correction, review and
 * reassignment reuse the same Packing Task ID — never duplicated.
 * Packing Staff only ever see approved item information; no financial data.
 */

export type PackStatus =
  | "not_assigned"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "waiting_review"
  | "approved"
  | "ready_for_dispatch"
  | "info_required"
  | "correction_required"
  | "reassigned"
  | "blocked"
  | "cancelled";

export type PackMaterial =
  | "Wooden Crate"
  | "Corrugated Box"
  | "Bubble Wrap"
  | "Foam"
  | "Stretch Film"
  | "Plastic Bag"
  | "Tape"
  | "Straps"
  | "Labels"
  | "Other Approved Material";

export type ItemType =
  | "Laundry Machine"
  | "Dry-Cleaning Machine"
  | "Finishing Equipment"
  | "POS Equipment"
  | "Spare Parts"
  | "Chemicals"
  | "Consumables"
  | "Packaging Materials"
  | "Other Approved Item";

export type PackItem = {
  code: string;
  name: string;
  nameHi: string;
  type: ItemType;
  approvedQty: number;
  serial?: string | null;
  serialRequired: boolean;
  fragile: boolean;
  heavy: boolean;
  materials: PackMaterial[];
  packageNo: string;
  label: string;
  handling: string;
  handlingHi: string;
  emoji: string;
};

export type PackCheck = Record<string, boolean>;

export type HelpReport = {
  topic: string;
  detail: string;
  at: string;
  resolved: boolean;
};

export type PackHistory = { at: string; by: string; action: string };

export type PackTask = {
  taskId: string;
  dispatchId: string;
  clearanceId: string;
  projectId: string;
  store: string;
  city: string;
  staff: string | null;
  items: PackItem[];
  packingType: "Machine Crating" | "Carton Packing" | "Mixed Packing" | "Fragile Packing";
  instructions: string;
  instructionsHi: string;
  labelInstructions: string;
  deadline: string;
  priority: "urgent" | "high" | "normal";
  photoProofRequired: boolean;
  reviewRequired: boolean;
  status: PackStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  checks: PackCheck;
  packageCount?: number | null;
  itemPhotos: number;
  packagePhotos: number;
  labelPhotos: number;
  staffComment?: string;
  voiceNote?: boolean;
  returnCount: number;
  correction?: {
    reason: string;
    affected: string;
    en: string;
    hi: string;
    newDeadline: string;
  } | null;
  help?: HelpReport | null;
  clearanceSuspended: boolean;
  launchDate: string;
  reviewer?: string | null;
  approvedAt?: string | null;
  history: PackHistory[];
};

export const TODAY = "2026-08-05";

export const PACK_STATUS_LABEL: Record<PackStatus, string> = {
  not_assigned: "Not Assigned",
  assigned: "Assigned to Packing Staff",
  accepted: "Accepted by Staff",
  in_progress: "Packing Started",
  waiting_review: "Submitted for Review",
  approved: "Approved",
  ready_for_dispatch: "Ready for Dispatch",
  info_required: "Information Required",
  correction_required: "Correction Required",
  reassigned: "Reassigned",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

export const PACK_STATUS_LABEL_HI: Record<PackStatus, string> = {
  not_assigned: "असाइन नहीं हुआ",
  assigned: "आपको दिया गया",
  accepted: "स्वीकार किया",
  in_progress: "पैकिंग चल रही है",
  waiting_review: "जाँच के लिए भेजा",
  approved: "मंज़ूर हुआ",
  ready_for_dispatch: "डिस्पैच के लिए तैयार",
  info_required: "जानकारी चाहिए",
  correction_required: "सुधार करना है",
  reassigned: "दूसरे को दिया",
  blocked: "रुका हुआ",
  cancelled: "रद्द",
};

/** green approved/ready, blue active, amber review/correction, red overdue/blocked, grey cancelled */
export const PACK_STATUS_TONE: Record<PackStatus, string> = {
  not_assigned: "bg-muted text-foreground border-border",
  assigned: "bg-primary/10 text-primary border-primary/20",
  accepted: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  waiting_review: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ready_for_dispatch: "bg-emerald-100 text-emerald-800 border-emerald-200",
  info_required: "bg-amber-100 text-amber-800 border-amber-200",
  correction_required: "bg-amber-100 text-amber-800 border-amber-200",
  reassigned: "bg-primary/10 text-primary border-primary/20",
  blocked: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const MATERIALS: PackMaterial[] = [
  "Wooden Crate",
  "Corrugated Box",
  "Bubble Wrap",
  "Foam",
  "Stretch Film",
  "Plastic Bag",
  "Tape",
  "Straps",
  "Labels",
  "Other Approved Material",
];

export const PACKING_CHECKS: { key: string; en: string; hi: string }[] = [
  { key: "item", en: "Correct item selected", hi: "सही सामान चुना" },
  { key: "qty", en: "Correct quantity packed", hi: "सही गिनती पैक की" },
  { key: "damage", en: "Item checked for visible damage", hi: "सामान टूटा-फूटा नहीं है, देख लिया" },
  { key: "serial", en: "Serial number recorded when required", hi: "ज़रूरत हो तो सीरियल नंबर लिखा" },
  { key: "material", en: "Correct packing material used", hi: "सही पैकिंग सामान लगाया" },
  { key: "marking", en: "Fragile or heavy marking added", hi: "नाज़ुक / भारी का निशान लगाया" },
  { key: "label", en: "Correct destination label attached", hi: "सही पता का लेबल लगाया" },
  { key: "seal", en: "Package securely sealed", hi: "पैकेट अच्छी तरह सील किया" },
  { key: "count", en: "Package count confirmed", hi: "पैकेट की गिनती पक्की की" },
  { key: "photos", en: "Completion photos added", hi: "फोटो लगा दी" },
];

export const CORRECTION_REASONS = [
  "Wrong item",
  "Wrong quantity",
  "Item damaged",
  "Packing insufficient",
  "Label incorrect",
  "Package not sealed",
  "Photo unclear",
  "Serial number missing",
  "Other",
];

export const HELP_TOPICS: { en: string; hi: string }[] = [
  { en: "Item Missing", hi: "सामान नहीं मिला" },
  { en: "Item Damaged", hi: "सामान टूटा है" },
  { en: "Quantity Mismatch", hi: "गिनती मेल नहीं खा रही" },
  { en: "Packing Material Missing", hi: "पैकिंग सामान नहीं है" },
  { en: "Label Problem", hi: "लेबल में दिक्कत" },
  { en: "Instructions Not Clear", hi: "निर्देश समझ नहीं आए" },
  { en: "Heavy Item Assistance Required", hi: "भारी सामान, मदद चाहिए" },
  { en: "Other Problem", hi: "कोई और दिक्कत" },
];

export const STAFF = ["Ramesh K.", "Sunil P.", "Ravi S.", "Imran A."];

const emptyChecks: PackCheck = {};

export const PACK_TASKS: PackTask[] = [
  {
    taskId: "PKT-000241",
    dispatchId: "DSP-000122",
    clearanceId: "CLR-1042",
    projectId: "PRJ-000019",
    store: "Clean Craft Indore",
    city: "Indore",
    staff: null,
    items: [
      {
        code: "IT-01", name: "Laundry washer-extractor 10 kg", nameHi: "कपड़े धोने की मशीन 10 किलो",
        type: "Laundry Machine", approvedQty: 1, serial: null, serialRequired: true,
        fragile: false, heavy: true, materials: ["Wooden Crate", "Foam", "Straps", "Labels"],
        packageNo: "PKG-1", label: "Indore · PRJ-000019 · 1 of 3",
        handling: "Forklift loading. Do not tilt.", handlingHi: "फोर्कलिफ्ट से उठाएँ, तिरछा न करें।", emoji: "🌀",
      },
      {
        code: "IT-02", name: "Packaging roll & covers", nameHi: "पैकिंग रोल और कवर",
        type: "Packaging Materials", approvedQty: 20, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Corrugated Box", "Stretch Film", "Tape", "Labels"],
        packageNo: "PKG-2", label: "Indore · PRJ-000019 · 2 of 3",
        handling: "Keep dry.", handlingHi: "गीला न हो।", emoji: "📦",
      },
      {
        code: "IT-03", name: "Consumables starter kit", nameHi: "कंज़्यूमेबल किट",
        type: "Consumables", approvedQty: 6, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Corrugated Box", "Bubble Wrap", "Tape", "Labels"],
        packageNo: "PKG-3", label: "Indore · PRJ-000019 · 3 of 3",
        handling: "Bottles upright.", handlingHi: "बोतल सीधी रखें।", emoji: "🧴",
      },
    ],
    packingType: "Mixed Packing",
    instructions: "Machine crated first, then cartons. Launch training on 12 Aug.",
    instructionsHi: "पहले मशीन क्रेट में, फिर डिब्बे। 12 अगस्त को ट्रेनिंग है।",
    labelInstructions: "Store name, city, package number of total, and 'Clean Craft' on every package.",
    deadline: "2026-08-06",
    priority: "urgent",
    photoProofRequired: true,
    reviewRequired: true,
    status: "not_assigned",
    checks: { ...emptyChecks },
    itemPhotos: 0, packagePhotos: 0, labelPhotos: 0,
    returnCount: 0,
    clearanceSuspended: false,
    launchDate: "2026-08-14",
    history: [
      { at: "2026-08-05 09:20", by: "Logistics Executive", action: "Packing task PKT-000241 created from accepted clearance CLR-1042 (Dispatch DSP-000122)." },
    ],
  },
  {
    taskId: "PKT-000239",
    dispatchId: "DSP-000121",
    clearanceId: "CLR-1041",
    projectId: "PRJ-000018",
    store: "Clean Craft Jaipur",
    city: "Jaipur",
    staff: "Ravi S.",
    items: [
      {
        code: "IT-01", name: "Dry-clean machine 12 kg", nameHi: "ड्राई-क्लीन मशीन 12 किलो",
        type: "Dry-Cleaning Machine", approvedQty: 1, serial: "DC12-JP-88421", serialRequired: true,
        fragile: false, heavy: true, materials: ["Wooden Crate", "Foam", "Straps", "Labels"],
        packageNo: "PKG-1", label: "Jaipur · PRJ-000018 · 1 of 4",
        handling: "Heavy. Panel side up.", handlingHi: "भारी है। पैनल वाला हिस्सा ऊपर रखें।", emoji: "🌀",
      },
      {
        code: "IT-02", name: "Steam boiler + iron table", nameHi: "स्टीम बॉयलर + प्रेस टेबल",
        type: "Finishing Equipment", approvedQty: 1, serial: "SB-JP-2210", serialRequired: true,
        fragile: true, heavy: true, materials: ["Wooden Crate", "Bubble Wrap", "Foam", "Labels"],
        packageNo: "PKG-2", label: "Jaipur · PRJ-000018 · 2 of 4",
        handling: "Fragile glass gauge — double bubble wrap.", handlingHi: "काँच का मीटर नाज़ुक है — दो बार बबल रैप करें।", emoji: "♨️",
      },
      {
        code: "IT-03", name: "POS terminal + printer", nameHi: "POS मशीन + प्रिंटर",
        type: "POS Equipment", approvedQty: 1, serial: "POS-JP-4471", serialRequired: true,
        fragile: true, heavy: false, materials: ["Corrugated Box", "Foam", "Tape", "Labels"],
        packageNo: "PKG-3", label: "Jaipur · PRJ-000018 · 3 of 4",
        handling: "Small box, keep separate.", handlingHi: "छोटा डिब्बा, अलग रखें।", emoji: "🖥️",
      },
      {
        code: "IT-04", name: "Solvent & detergent set", nameHi: "सॉल्वेंट और डिटर्जेंट सेट",
        type: "Chemicals", approvedQty: 12, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Corrugated Box", "Stretch Film", "Tape", "Labels"],
        packageNo: "PKG-4", label: "Jaipur · PRJ-000018 · 4 of 4",
        handling: "Upright only.", handlingHi: "सीधा ही रखें।", emoji: "🧪",
      },
    ],
    packingType: "Machine Crating",
    instructions: "Crate both machines. Site has no lift.",
    instructionsHi: "दोनों मशीन क्रेट करें। साइट पर लिफ्ट नहीं है।",
    labelInstructions: "Bold destination label on two sides of each package.",
    deadline: "2026-08-06",
    priority: "urgent",
    photoProofRequired: true,
    reviewRequired: true,
    status: "in_progress",
    startedAt: "2026-08-05 08:40",
    checks: { item: true, qty: true, damage: true, serial: true },
    itemPhotos: 3, packagePhotos: 1, labelPhotos: 0,
    returnCount: 0,
    clearanceSuspended: false,
    launchDate: "2026-08-18",
    history: [
      { at: "2026-08-04 17:00", by: "Logistics Executive", action: "Task created from CLR-1041, assigned to Ravi S." },
      { at: "2026-08-05 08:35", by: "Ravi S.", action: "Task accepted." },
      { at: "2026-08-05 08:40", by: "Ravi S.", action: "Packing started — start time recorded." },
    ],
  },
  {
    taskId: "PKT-000236",
    dispatchId: "DSP-000119",
    clearanceId: "CLR-1039",
    projectId: "PRJ-000015",
    store: "Clean Craft Lucknow",
    city: "Lucknow",
    staff: "Sunil P.",
    items: [
      {
        code: "IT-01", name: "Washer-extractor 8 kg", nameHi: "वॉशर 8 किलो",
        type: "Laundry Machine", approvedQty: 1, serial: "WE8-LK-3390", serialRequired: true,
        fragile: false, heavy: true, materials: ["Wooden Crate", "Foam", "Straps", "Labels"],
        packageNo: "PKG-1", label: "Lucknow · PRJ-000015 · 1 of 2",
        handling: "Heavy.", handlingHi: "भारी है।", emoji: "🌀",
      },
      {
        code: "IT-02", name: "Branding & signage roll", nameHi: "साइनबोर्ड रोल",
        type: "Other Approved Item", approvedQty: 1, serial: null, serialRequired: false,
        fragile: true, heavy: false, materials: ["Bubble Wrap", "Stretch Film", "Tape", "Labels"],
        packageNo: "PKG-2", label: "Lucknow · PRJ-000015 · 2 of 2",
        handling: "Do not bend.", handlingHi: "मोड़ें नहीं।", emoji: "🪧",
      },
    ],
    packingType: "Mixed Packing",
    instructions: "Signage roll on top of crate only.",
    instructionsHi: "साइन रोल क्रेट के ऊपर ही रखें।",
    labelInstructions: "Fragile sticker on signage package.",
    deadline: "2026-08-05",
    priority: "high",
    photoProofRequired: true,
    reviewRequired: true,
    status: "waiting_review",
    startedAt: "2026-08-05 07:10",
    completedAt: "2026-08-05 10:05",
    checks: Object.fromEntries(PACKING_CHECKS.map((c) => [c.key, true])),
    packageCount: 2,
    itemPhotos: 2, packagePhotos: 2, labelPhotos: 2,
    staffComment: "Crate ready. Signage wrapped twice.",
    voiceNote: true,
    returnCount: 0,
    clearanceSuspended: false,
    launchDate: "2026-08-12",
    history: [
      { at: "2026-08-04 12:00", by: "Logistics Executive", action: "Task created from CLR-1039, assigned to Sunil P." },
      { at: "2026-08-05 07:10", by: "Sunil P.", action: "Packing started." },
      { at: "2026-08-05 10:05", by: "Sunil P.", action: "Packing completed and submitted for review — 2 packages, 6 photos." },
    ],
  },
  {
    taskId: "PKT-000234",
    dispatchId: "DSP-000118",
    clearanceId: "CLR-1038",
    projectId: "PRJ-000014",
    store: "Clean Craft Jodhpur",
    city: "Jodhpur",
    staff: "Ramesh K.",
    items: [
      {
        code: "IT-01", name: "Steam iron station", nameHi: "स्टीम प्रेस स्टेशन",
        type: "Finishing Equipment", approvedQty: 1, serial: "SI-JD-7712", serialRequired: true,
        fragile: true, heavy: false, materials: ["Corrugated Box", "Bubble Wrap", "Foam", "Labels"],
        packageNo: "PKG-1", label: "Jodhpur · PRJ-000014 · 1 of 2",
        handling: "Fragile.", handlingHi: "नाज़ुक है।", emoji: "♨️",
      },
      {
        code: "IT-02", name: "Consumables carton", nameHi: "कंज़्यूमेबल डिब्बा",
        type: "Consumables", approvedQty: 4, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Corrugated Box", "Tape", "Labels"],
        packageNo: "PKG-2", label: "Jodhpur · PRJ-000014 · 2 of 2",
        handling: "—", handlingHi: "—", emoji: "🧴",
      },
    ],
    packingType: "Fragile Packing",
    instructions: "Double-wall carton for the iron station.",
    instructionsHi: "प्रेस स्टेशन के लिए मोटा डिब्बा लें।",
    labelInstructions: "Fragile + This Side Up on package 1.",
    deadline: "2026-08-05",
    priority: "high",
    photoProofRequired: true,
    reviewRequired: true,
    status: "correction_required",
    startedAt: "2026-08-04 09:00",
    completedAt: "2026-08-04 13:30",
    checks: Object.fromEntries(PACKING_CHECKS.map((c) => [c.key, c.key !== "photos"])),
    packageCount: 2,
    itemPhotos: 2, packagePhotos: 1, labelPhotos: 1,
    staffComment: "Done.",
    returnCount: 2,
    correction: {
      reason: "Packing insufficient",
      affected: "PKG-1 · Steam iron station",
      en: "Add one more layer of bubble wrap and a foam corner on each side. Take clear photos of all four sides.",
      hi: "एक और बबल रैप की तह और हर कोने पर फोम लगाइए। चारों तरफ की साफ़ फोटो लीजिए।",
      newDeadline: "2026-08-06",
    },
    clearanceSuspended: false,
    launchDate: "2026-08-11",
    history: [
      { at: "2026-08-03 15:00", by: "Logistics Executive", action: "Task created from CLR-1038, assigned to Ramesh K." },
      { at: "2026-08-04 13:30", by: "Ramesh K.", action: "Submitted for review." },
      { at: "2026-08-04 16:10", by: "Logistics Executive", action: "Returned for correction — photo unclear. Same Packing Task ID retained." },
      { at: "2026-08-05 09:00", by: "Logistics Executive", action: "Returned for correction (2nd time) — packing insufficient on PKG-1." },
    ],
  },
  {
    taskId: "PKT-000230",
    dispatchId: "DSP-000117",
    clearanceId: "CLR-1037",
    projectId: "PRJ-000013",
    store: "Clean Craft Surat",
    city: "Surat",
    staff: "Ravi S.",
    items: [
      {
        code: "IT-01", name: "Detergent & solvent cartons", nameHi: "डिटर्जेंट और सॉल्वेंट डिब्बे",
        type: "Chemicals", approvedQty: 8, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Corrugated Box", "Stretch Film", "Tape", "Labels"],
        packageNo: "PKG-1", label: "Surat · PRJ-000013 · 1 of 2",
        handling: "Upright.", handlingHi: "सीधा रखें।", emoji: "🧪",
      },
      {
        code: "IT-02", name: "Hangers, covers, tags", nameHi: "हैंगर, कवर, टैग",
        type: "Consumables", approvedQty: 30, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Plastic Bag", "Corrugated Box", "Tape", "Labels"],
        packageNo: "PKG-2", label: "Surat · PRJ-000013 · 2 of 2",
        handling: "—", handlingHi: "—", emoji: "👔",
      },
    ],
    packingType: "Carton Packing",
    instructions: "Two cartons only.",
    instructionsHi: "सिर्फ़ दो डिब्बे।",
    labelInstructions: "Standard destination label.",
    deadline: "2026-08-04",
    priority: "normal",
    photoProofRequired: true,
    reviewRequired: true,
    status: "ready_for_dispatch",
    startedAt: "2026-08-03 10:00",
    completedAt: "2026-08-03 15:20",
    checks: Object.fromEntries(PACKING_CHECKS.map((c) => [c.key, true])),
    packageCount: 2,
    itemPhotos: 2, packagePhotos: 2, labelPhotos: 2,
    staffComment: "Both cartons sealed and labelled.",
    returnCount: 0,
    clearanceSuspended: false,
    launchDate: "2026-08-09",
    reviewer: "Logistics Executive",
    approvedAt: "2026-08-03 17:00",
    history: [
      { at: "2026-08-02 11:00", by: "Logistics Executive", action: "Task created from CLR-1037, assigned to Ravi S." },
      { at: "2026-08-03 15:20", by: "Ravi S.", action: "Submitted for review." },
      { at: "2026-08-03 17:00", by: "Logistics Executive", action: "Packing approved — 2 packages. Dispatch Planning updated to Ready for Dispatch on DSP-000117." },
    ],
  },
  {
    taskId: "PKT-000228",
    dispatchId: "DSP-000110",
    clearanceId: "CLR-1029",
    projectId: "PRJ-000007",
    store: "Clean Craft Raipur",
    city: "Raipur",
    staff: "Imran A.",
    items: [
      {
        code: "IT-01", name: "Signage, glow board, standees", nameHi: "साइनबोर्ड, ग्लो बोर्ड, स्टैंडी",
        type: "Other Approved Item", approvedQty: 1, serial: null, serialRequired: false,
        fragile: true, heavy: false, materials: ["Bubble Wrap", "Corrugated Box", "Tape", "Labels"],
        packageNo: "PKG-1", label: "Raipur · PRJ-000007 · 1 of 1",
        handling: "Glow board very fragile.", handlingHi: "ग्लो बोर्ड बहुत नाज़ुक है।", emoji: "🪧",
      },
    ],
    packingType: "Fragile Packing",
    instructions: "Corner foam on glow board.",
    instructionsHi: "ग्लो बोर्ड के कोनों पर फोम लगाइए।",
    labelInstructions: "Fragile sticker on all sides.",
    deadline: "2026-08-06",
    priority: "normal",
    photoProofRequired: true,
    reviewRequired: true,
    status: "blocked",
    startedAt: "2026-08-04 11:00",
    completedAt: "2026-08-04 13:00",
    checks: Object.fromEntries(PACKING_CHECKS.map((c) => [c.key, true])),
    packageCount: 1,
    itemPhotos: 1, packagePhotos: 1, labelPhotos: 1,
    staffComment: "Packing finished before hold.",
    returnCount: 0,
    clearanceSuspended: true,
    launchDate: "2026-08-16",
    history: [
      { at: "2026-08-03 10:00", by: "Logistics Executive", action: "Task created from CLR-1029, assigned to Imran A." },
      { at: "2026-08-04 13:00", by: "Imran A.", action: "Packing completed — activity preserved." },
      { at: "2026-08-05 08:15", by: "Accounts Manager", action: "Clearance CLR-1029 suspended — packing and dispatch paused. Urgent alert raised." },
    ],
  },
  {
    taskId: "PKT-000226",
    dispatchId: "DSP-000116",
    clearanceId: "CLR-1034",
    projectId: "PRJ-000010",
    store: "Clean Craft Bhopal",
    city: "Bhopal",
    staff: "Sunil P.",
    items: [
      {
        code: "IT-01", name: "Spare belt & filter kit", nameHi: "स्पेयर बेल्ट और फ़िल्टर किट",
        type: "Spare Parts", approvedQty: 3, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Corrugated Box", "Bubble Wrap", "Tape", "Labels"],
        packageNo: "PKG-1", label: "Bhopal · PRJ-000010 · 1 of 1",
        handling: "—", handlingHi: "—", emoji: "🔧",
      },
    ],
    packingType: "Carton Packing",
    instructions: "Single carton.",
    instructionsHi: "एक ही डिब्बा।",
    labelInstructions: "Standard label.",
    deadline: "2026-08-04",
    priority: "high",
    photoProofRequired: true,
    reviewRequired: true,
    status: "info_required",
    startedAt: "2026-08-04 09:30",
    checks: { item: true },
    itemPhotos: 1, packagePhotos: 0, labelPhotos: 0,
    returnCount: 0,
    help: {
      topic: "Packing Material Missing",
      detail: "Bubble wrap roll finished in the store room.",
      at: "2026-08-04 10:00",
      resolved: false,
    },
    clearanceSuspended: false,
    launchDate: "2026-08-10",
    history: [
      { at: "2026-08-03 14:00", by: "Logistics Executive", action: "Task created from CLR-1034, assigned to Sunil P." },
      { at: "2026-08-04 10:00", by: "Sunil P.", action: "Reported problem: packing material missing. Task paused — deadline not counted against staff." },
    ],
  },
  {
    taskId: "PKT-000220",
    dispatchId: "DSP-000108",
    clearanceId: "CLR-1026",
    projectId: "PRJ-000005",
    store: "Clean Craft Patna",
    city: "Patna",
    staff: "Ramesh K.",
    items: [
      {
        code: "IT-01", name: "Consumables starter kit", nameHi: "कंज़्यूमेबल किट",
        type: "Consumables", approvedQty: 4, serial: null, serialRequired: false,
        fragile: false, heavy: false, materials: ["Corrugated Box", "Tape", "Labels"],
        packageNo: "PKG-1", label: "Patna · PRJ-000005 · 1 of 1",
        handling: "—", handlingHi: "—", emoji: "🧴",
      },
    ],
    packingType: "Carton Packing",
    instructions: "—",
    instructionsHi: "—",
    labelInstructions: "Standard label.",
    deadline: "2026-08-04",
    priority: "normal",
    photoProofRequired: false,
    reviewRequired: true,
    status: "cancelled",
    checks: {},
    itemPhotos: 0, packagePhotos: 0, labelPhotos: 0,
    returnCount: 0,
    clearanceSuspended: false,
    launchDate: "2026-08-22",
    history: [
      { at: "2026-08-01 10:00", by: "Logistics Executive", action: "Task created from CLR-1026." },
      { at: "2026-08-02 10:05", by: "Logistics Executive", action: "Cancelled — franchise postponed launch. History preserved." },
    ],
  },
];

/** Clearances already accepted by Logistics — the only valid source for a new packing task. */
export const ACCEPTED_CLEARANCES = [
  { clearanceId: "CLR-1042", dispatchId: "DSP-000122", projectId: "PRJ-000019", store: "Clean Craft Indore", items: 3, hasTask: true },
  { clearanceId: "CLR-1041", dispatchId: "DSP-000121", projectId: "PRJ-000018", store: "Clean Craft Jaipur", items: 4, hasTask: true },
  { clearanceId: "CLR-1044", dispatchId: "DSP-000123", projectId: "PRJ-000020", store: "Clean Craft Ranchi", items: 2, hasTask: false },
  { clearanceId: "CLR-1045", dispatchId: "DSP-000124", projectId: "PRJ-000021", store: "Clean Craft Nashik", items: 5, hasTask: false },
];
