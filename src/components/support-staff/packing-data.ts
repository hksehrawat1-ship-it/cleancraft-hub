import type { Bi } from "./pantry-cleaning-data";

export type PackStatus =
  | "new"
  | "started"
  | "completed"
  | "review"
  | "approved"
  | "again";

export type PackTask = {
  id: string;
  product: Bi;
  qty: number;
  unit: Bi;
  packing: Bi;
  labelRequired: boolean;
  due: string;
  dueMinutes: number;
  urgent: boolean;
  overdue?: boolean;
  status: PackStatus;
  instructions: Bi[];
  photoRequired: boolean;
  startedAt?: string;
  completedAt?: string;
  returnReason?: Bi;
  managerNote?: Bi;
  newDue?: string;
};

export const PACK_STAFF = {
  name: "Mohit Sharma",
  initials: "MS",
  shift: "9:30 AM – 6:30 PM",
};

export const PACK_LABEL: Record<PackStatus, { label: Bi; cls: string }> = {
  new: { label: { en: "New", hi: "नया" }, cls: "bg-muted text-muted-foreground" },
  started: {
    label: { en: "Packing Started", hi: "पैकिंग शुरू" },
    cls: "bg-blue-500/15 text-blue-700",
  },
  completed: {
    label: { en: "Packing Completed", hi: "पैकिंग पूरी" },
    cls: "bg-emerald-500/15 text-emerald-700",
  },
  review: {
    label: { en: "Waiting for Review", hi: "जांच का इंतज़ार" },
    cls: "bg-blue-500/15 text-blue-700",
  },
  approved: {
    label: { en: "Approved", hi: "मंज़ूर" },
    cls: "bg-emerald-500/15 text-emerald-700",
  },
  again: {
    label: { en: "Pack Again", hi: "फिर पैक करें" },
    cls: "bg-destructive/15 text-destructive",
  },
};

export const PACK_CHECKS: { id: string; label: Bi }[] = [
  { id: "product", label: { en: "Correct product", hi: "सही सामान" } },
  { id: "qty", label: { en: "Correct quantity", hi: "सही मात्रा" } },
  { id: "damage", label: { en: "Product not damaged", hi: "सामान टूटा नहीं है" } },
  { id: "material", label: { en: "Correct packing material", hi: "सही पैकिंग सामान" } },
  { id: "label", label: { en: "Label attached", hi: "लेबल लगा है" } },
  { id: "seal", label: { en: "Package sealed", hi: "पैकेट सील है" } },
];

export const PACK_HELP: { id: string; label: Bi }[] = [
  { id: "missing", label: { en: "Product Missing", hi: "सामान नहीं मिला" } },
  { id: "damaged", label: { en: "Product Damaged", hi: "सामान टूटा है" } },
  { id: "material", label: { en: "Packing Material Missing", hi: "पैकिंग सामान नहीं है" } },
  { id: "qty", label: { en: "Quantity Not Matching", hi: "मात्रा मेल नहीं खा रही" } },
  { id: "label", label: { en: "Label Problem", hi: "लेबल की दिक्कत" } },
  { id: "unclear", label: { en: "Instructions Not Clear", hi: "निर्देश समझ नहीं आया" } },
];

export const PACK_TASKS: PackTask[] = [
  {
    id: "ORD-4412",
    product: { en: "Franchise starter bundle", hi: "फ्रैंचाइज़ स्टार्टर बंडल" },
    qty: 6,
    unit: { en: "boxes", hi: "डिब्बे" },
    packing: { en: "Corrugated box (M) + bubble wrap", hi: "कार्टन बॉक्स (M) + बबल रैप" },
    labelRequired: true,
    due: "11:00 AM",
    dueMinutes: 660,
    urgent: true,
    status: "new",
    photoRequired: true,
    instructions: [
      { en: "Put bubble wrap inside the box first.", hi: "पहले डिब्बे में बबल रैप लगाएं।" },
      { en: "Keep 1 banner, 2 uniforms and 1 kit in each box.", hi: "हर डिब्बे में 1 बैनर, 2 यूनिफॉर्म, 1 किट रखें।" },
      { en: "Seal with tape and stick the Jaipur label.", hi: "टेप से सील करें और जयपुर लेबल लगाएं।" },
    ],
  },
  {
    id: "ORD-4405",
    product: { en: "Dispatch cartons – Jaipur", hi: "डिस्पैच कार्टन – जयपुर" },
    qty: 12,
    unit: { en: "cartons", hi: "कार्टन" },
    packing: { en: "Stretch film + dispatch label", hi: "स्ट्रेच फिल्म + डिस्पैच लेबल" },
    labelRequired: true,
    due: "10:00 AM",
    dueMinutes: 600,
    urgent: false,
    overdue: true,
    status: "again",
    photoRequired: true,
    returnReason: { en: "Label was not straight", hi: "लेबल सीधा नहीं लगा था" },
    managerNote: {
      en: "Remove the old label and stick a new one in the middle.",
      hi: "पुराना लेबल हटाकर नया बीच में लगाएं।",
    },
    newDue: "12:30 PM",
    instructions: [
      { en: "Wrap each carton with stretch film 2 times.", hi: "हर कार्टन पर 2 बार स्ट्रेच फिल्म लपेटें।" },
      { en: "Stick the label in the middle, straight.", hi: "लेबल बीच में सीधा लगाएं।" },
    ],
  },
  {
    id: "ORD-4419",
    product: { en: "Branding kit – Indore", hi: "ब्रांडिंग किट – इंदौर" },
    qty: 3,
    unit: { en: "kits", hi: "किट" },
    packing: { en: "Flat box + paper filler", hi: "फ्लैट बॉक्स + पेपर फिलर" },
    labelRequired: true,
    due: "1:00 PM",
    dueMinutes: 780,
    urgent: false,
    status: "new",
    photoRequired: false,
    instructions: [
      { en: "Do not fold the printed boards.", hi: "प्रिंटेड बोर्ड मोड़ें नहीं।" },
      { en: "Fill empty space with paper filler.", hi: "खाली जगह में पेपर फिलर भरें।" },
    ],
  },
  {
    id: "ORD-4420",
    product: { en: "Steam iron spare parts", hi: "स्टीम आयरन स्पेयर पार्ट्स" },
    qty: 8,
    unit: { en: "packets", hi: "पैकेट" },
    packing: { en: "Small box + bubble wrap", hi: "छोटा बॉक्स + बबल रैप" },
    labelRequired: false,
    due: "3:30 PM",
    dueMinutes: 930,
    urgent: false,
    status: "new",
    photoRequired: false,
    instructions: [
      { en: "Wrap each part separately.", hi: "हर पार्ट अलग लपेटें।" },
      { en: "Do not keep heavy parts on top.", hi: "भारी पार्ट ऊपर न रखें।" },
    ],
  },
  {
    id: "ORD-4398",
    product: { en: "Uniform sets – Lucknow", hi: "यूनिफॉर्म सेट – लखनऊ" },
    qty: 10,
    unit: { en: "sets", hi: "सेट" },
    packing: { en: "Poly bag + carton", hi: "पॉली बैग + कार्टन" },
    labelRequired: true,
    due: "9:30 AM",
    dueMinutes: 570,
    urgent: false,
    status: "approved",
    photoRequired: false,
    startedAt: "9:05 AM",
    completedAt: "9:40 AM",
    instructions: [
      { en: "One set in one poly bag.", hi: "एक सेट एक पॉली बैग में।" },
    ],
  },
  {
    id: "ORD-4401",
    product: { en: "Detergent pouches", hi: "डिटर्जेंट पाउच" },
    qty: 24,
    unit: { en: "pouches", hi: "पाउच" },
    packing: { en: "Carton + tape", hi: "कार्टन + टेप" },
    labelRequired: false,
    due: "10:30 AM",
    dueMinutes: 630,
    urgent: false,
    status: "review",
    photoRequired: true,
    startedAt: "10:00 AM",
    completedAt: "10:35 AM",
    instructions: [{ en: "Keep pouches standing.", hi: "पाउच खड़े रखें।" }],
  },
];

export function packRank(t: PackTask): number {
  if (t.status === "approved") return 90;
  if (t.status === "review" || t.status === "completed") return 80;
  if (t.urgent) return 0;
  if (t.overdue || t.status === "again") return 1;
  if (t.dueMinutes <= 720) return 2;
  return 3;
}

export const sortPack = (list: PackTask[]) =>
  [...list].sort((a, b) => packRank(a) - packRank(b) || a.dueMinutes - b.dueMinutes);

export const packOpen = (s: PackStatus) =>
  s === "new" || s === "started" || s === "again";

export const nowLabel = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
