// Shared Field Engineer sample data — single source of truth for jobs/tickets.
// The same master support ticket ids are used across Home, My Jobs and reports
// so no duplicate jobs are ever created.

export type Lang = "en" | "hi";
export type Bi = { en: string; hi: string };

export type JobPriority = "safety" | "breakdown" | "normal";
export type JobStatus = "scheduled" | "transit" | "parts" | "completed";
export type WorkStage = "none" | "going" | "reached" | "started" | "completed" | "help";

export type Job = {
  id: string;
  store: Bi;
  owner: string;
  phone: string;
  address: Bi;
  issue: Bi;
  machine: Bi;
  priority: JobPriority;
  status: JobStatus;
  slot: Bi;
  city: Bi;
  rmName: string;
  rmNote: Bi;
};

export const PRIORITY_LABEL: Record<JobPriority, Bi> = {
  safety: { en: "Urgent — Safety", hi: "अत्यावश्यक — सुरक्षा" },
  breakdown: { en: "Machine Stopped", hi: "मशीन बंद" },
  normal: { en: "Normal", hi: "सामान्य" },
};

export const JOB_STATUS_LABEL: Record<JobStatus, Bi> = {
  scheduled: { en: "Scheduled", hi: "निर्धारित" },
  transit: { en: "In Transit", hi: "रास्ते में" },
  parts: { en: "Awaiting Parts", hi: "पार्ट्स की प्रतीक्षा" },
  completed: { en: "Completed", hi: "पूर्ण" },
};

export const JOBS: Job[] = [
  {
    id: "FE-2041",
    store: { en: "Jaipur — Vaishali Nagar", hi: "जयपुर — वैशाली नगर" },
    owner: "Rahul Sharma",
    phone: "+91 98290 11223",
    address: {
      en: "Shop 4, Amrapali Circle, Vaishali Nagar, Jaipur",
      hi: "दुकान 4, अमरापाली सर्कल, वैशाली नगर, जयपुर",
    },
    issue: {
      en: "Washing machine shakes badly and shows E04",
      hi: "वॉशिंग मशीन तेज़ हिलती है और E04 दिखा रही है",
    },
    machine: { en: "Washer 12kg", hi: "वॉशर 12 किग्रा" },
    priority: "safety",
    status: "transit",
    slot: { en: "10:00 AM", hi: "सुबह 10:00" },
    city: { en: "Jaipur", hi: "जयपुर" },
    rmName: "Priya Menon (RM)",
    rmNote: {
      en: "Owner is upset. Check drum bolts first. Do not run machine on load before checking.",
      hi: "मालिक नाराज़ हैं। पहले ड्रम बोल्ट जाँचें। जाँच से पहले मशीन लोड पर न चलाएँ।",
    },
  },
  {
    id: "FE-2042",
    store: { en: "Indore — Vijay Nagar", hi: "इंदौर — विजय नगर" },
    owner: "Neha Agarwal",
    phone: "+91 90390 44551",
    address: {
      en: "Plot 22, Scheme 54, Vijay Nagar, Indore",
      hi: "प्लॉट 22, स्कीम 54, विजय नगर, इंदौर",
    },
    issue: { en: "Dryer is not heating", hi: "ड्रायर गरम नहीं हो रहा" },
    machine: { en: "Dryer 10kg", hi: "ड्रायर 10 किग्रा" },
    priority: "breakdown",
    status: "scheduled",
    slot: { en: "12:30 PM", hi: "दोपहर 12:30" },
    city: { en: "Indore", hi: "इंदौर" },
    rmName: "Priya Menon (RM)",
    rmNote: {
      en: "Carry a spare heating coil. Store is busy after 2 PM.",
      hi: "एक अतिरिक्त हीटिंग कॉइल साथ लाएँ। दोपहर 2 बजे के बाद स्टोर व्यस्त रहता है।",
    },
  },
  {
    id: "FE-2043",
    store: { en: "Lucknow — Gomti Nagar", hi: "लखनऊ — गोमती नगर" },
    owner: "Amit Verma",
    phone: "+91 99350 77812",
    address: {
      en: "Shop 9, Vibhuti Khand, Gomti Nagar, Lucknow",
      hi: "दुकान 9, विभूति खंड, गोमती नगर, लखनऊ",
    },
    issue: { en: "Steam iron pressure is low", hi: "स्टीम आयरन का प्रेशर कम है" },
    machine: { en: "Steam Iron", hi: "स्टीम आयरन" },
    priority: "normal",
    status: "scheduled",
    slot: { en: "3:00 PM", hi: "दोपहर 3:00" },
    city: { en: "Lucknow", hi: "लखनऊ" },
    rmName: "Sunil Rao (Tech Support)",
    rmNote: {
      en: "Remote check done. Clean boiler filter and check steam valve.",
      hi: "रिमोट जाँच हो चुकी है। बॉयलर फ़िल्टर साफ़ करें और स्टीम वाल्व जाँचें।",
    },
  },
  {
    id: "FE-2039",
    store: { en: "Surat — Adajan", hi: "सूरत — अडाजण" },
    owner: "Kiran Patel",
    phone: "+91 98250 33440",
    address: { en: "Shop 7, Adajan Gam Road, Surat", hi: "दुकान 7, अडाजण गाम रोड, सूरत" },
    issue: {
      en: "New machine installation",
      hi: "नई मशीन इंस्टॉलेशन",
    },
    machine: { en: "Full Setup", hi: "पूर्ण सेटअप" },
    priority: "normal",
    status: "completed",
    slot: { en: "Yesterday", hi: "कल" },
    city: { en: "Surat", hi: "सूरत" },
    rmName: "Priya Menon (RM)",
    rmNote: { en: "Handover done. No pending work.", hi: "हैंडओवर पूर्ण। कोई कार्य लंबित नहीं।" },
  },
  {
    id: "FE-2036",
    store: { en: "Pune 2 — Kothrud", hi: "पुणे 2 — कोथरुड" },
    owner: "Sagar Joshi",
    phone: "+91 91750 66220",
    address: { en: "Shop 3, Karve Road, Kothrud, Pune", hi: "दुकान 3, कर्वे रोड, कोथरुड, पुणे" },
    issue: {
      en: "Waiting for control board part",
      hi: "कंट्रोल बोर्ड पार्ट की प्रतीक्षा",
    },
    machine: { en: "Washer 8kg", hi: "वॉशर 8 किग्रा" },
    priority: "breakdown",
    status: "parts",
    slot: { en: "Hold", hi: "रोका गया" },
    city: { en: "Pune", hi: "पुणे" },
    rmName: "Sunil Rao (Tech Support)",
    rmNote: {
      en: "Part reaches store on Thursday. Visit only after part arrives.",
      hi: "पार्ट गुरुवार को स्टोर पहुँचेगा। पार्ट आने के बाद ही विज़िट करें।",
    },
  },
];

export function priorityTone(p: JobPriority) {
  if (p === "safety") return "bg-destructive text-destructive-foreground";
  if (p === "breakdown") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-muted text-muted-foreground";
}

export function statusTone(s: JobStatus) {
  if (s === "completed") return "text-emerald-600";
  if (s === "transit") return "text-primary";
  if (s === "parts") return "text-amber-600";
  return "text-primary";
}
