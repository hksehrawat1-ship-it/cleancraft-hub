import {
  Coffee,
  SprayCan,
  Sparkles,
  Trash2,
  GlassWater,
  Droplets,
  Utensils,
  CupSoda,
  Wind,
} from "lucide-react";

export type Lang = "en" | "hi";
export type Bi = { en: string; hi: string };
export type Kind = "pantry" | "cleaning";
export type Status = "new" | "started" | "completed" | "review" | "approved" | "redo";
export type Urgency = "urgent" | "overdue" | "soon" | "routine";
export type Priority = "normal" | "urgent";

export type Task = {
  id: string;
  kind: Kind;
  title: Bi;
  location: Bi;
  due: string;
  urgency: Urgency;
  priority: Priority;
  status: Status;
  photoRequired: boolean;
  instructions: Bi;
  checklist: Bi[];
  refPhoto?: string;
  icon: React.ComponentType<{ className?: string }>;
  correction?: Bi;
  correctionPhoto?: string;
  newDue?: string;
  returnedCount?: number;
  startedAt?: string;
  icon2?: never;
  history: { at: string; text: Bi }[];
};

export const STAFF = {
  name: "Sunita Devi",
  photo:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
};

export const SAMPLE_TASKS: Task[] = [
  {
    id: "T-1",
    kind: "pantry",
    title: { en: "Guest tea – CEO cabin", hi: "मेहमान की चाय – सीईओ केबिन" },
    location: { en: "Floor 2 – CEO Cabin", hi: "फ्लोर 2 – सीईओ केबिन" },
    due: "12:30 PM",
    urgency: "urgent",
    priority: "urgent",
    status: "new",
    photoRequired: true,
    instructions: {
      en: "Make 3 cups of tea. Use a clean covered tray. Serve within 5 minutes.",
      hi: "3 कप चाय बनाएं। साफ ढकी ट्रे लें। 5 मिनट के अंदर पहुँचाएँ।",
    },
    checklist: [
      { en: "Wash hands and wear apron", hi: "हाथ धोएं और एप्रन पहनें" },
      { en: "3 cups of tea ready", hi: "3 कप चाय तैयार" },
      { en: "Tray covered and clean", hi: "ट्रे साफ और ढकी" },
      { en: "Served in cabin", hi: "केबिन में दे दिया" },
    ],
    refPhoto: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=400&fit=crop",
    icon: Coffee,
    history: [{ at: "9:05 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } }],
  },
  {
    id: "T-2",
    kind: "cleaning",
    title: { en: "Washroom cleaning – Floor 1", hi: "वॉशरूम सफाई – फ्लोर 1" },
    location: { en: "Floor 1 – Washroom", hi: "फ्लोर 1 – वॉशरूम" },
    due: "11:00 AM",
    urgency: "overdue",
    priority: "urgent",
    status: "started",
    startedAt: "12:10 PM",
    photoRequired: true,
    instructions: {
      en: "Use toilet cleaner only. Put the wet floor sign. Refill soap and tissue.",
      hi: "सिर्फ टॉयलेट क्लीनर लगाएं। गीला फर्श का बोर्ड रखें। साबुन और टिशू भरें।",
    },
    checklist: [
      { en: "Wet floor sign placed", hi: "गीला फर्श बोर्ड रखा" },
      { en: "Gloves worn", hi: "दस्ताने पहने" },
      { en: "Toilet and floor cleaned", hi: "टॉयलेट और फर्श साफ" },
      { en: "Soap and tissue refilled", hi: "साबुन और टिशू भरा" },
      { en: "Dustbin emptied", hi: "कूड़ेदान खाली" },
    ],
    icon: Droplets,
    history: [
      { at: "8:40 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "12:10 PM", text: { en: "Work started", hi: "काम शुरू किया" } },
    ],
  },
  {
    id: "T-3",
    kind: "cleaning",
    title: { en: "Floor mopping – Reception", hi: "फर्श पोछा – रिसेप्शन" },
    location: { en: "Ground Floor – Reception", hi: "ग्राउंड फ्लोर – रिसेप्शन" },
    due: "2:00 PM",
    urgency: "soon",
    priority: "normal",
    status: "redo",
    returnedCount: 1,
    correction: {
      en: "The corner near the lift is still dirty. Please mop it again.",
      hi: "लिफ्ट के पास कोना अब भी गंदा है। दोबारा पोछा लगाएं।",
    },
    correctionPhoto:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop",
    newDue: "3:30 PM",
    photoRequired: true,
    instructions: {
      en: "Mop with floor cleaner. Cover all corners near the lift and main door.",
      hi: "फ्लोर क्लीनर से पोछा लगाएं। लिफ्ट और मुख्य दरवाजे के सभी कोने साफ करें।",
    },
    checklist: [
      { en: "Wet floor sign placed", hi: "गीला फर्श बोर्ड रखा" },
      { en: "Floor cleaner mixed in water", hi: "पानी में फ्लोर क्लीनर मिलाया" },
      { en: "Lift corner mopped", hi: "लिफ्ट का कोना पोछा" },
      { en: "Floor dry before leaving", hi: "जाने से पहले फर्श सूखा" },
    ],
    icon: Sparkles,
    history: [
      { at: "9:00 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "11:20 AM", text: { en: "Sent for review", hi: "जाँच के लिए भेजा" } },
      { at: "11:50 AM", text: { en: "Returned by manager", hi: "मैनेजर ने वापस भेजा" } },
    ],
  },
  {
    id: "T-4",
    kind: "pantry",
    title: { en: "Refill water dispensers", hi: "पानी की मशीन भरें" },
    location: { en: "All Floors", hi: "सभी फ्लोर" },
    due: "3:00 PM",
    urgency: "soon",
    priority: "normal",
    status: "new",
    photoRequired: false,
    instructions: {
      en: "Check all 4 dispensers. Replace empty bottles.",
      hi: "चारों मशीन देखें। खाली बोतल बदलें।",
    },
    checklist: [
      { en: "All 4 machines checked", hi: "चारों मशीन देखी" },
      { en: "Empty bottles replaced", hi: "खाली बोतल बदली" },
      { en: "Machine top wiped clean", hi: "मशीन ऊपर से साफ" },
    ],
    icon: GlassWater,
    history: [{ at: "9:05 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } }],
  },
  {
    id: "T-5",
    kind: "cleaning",
    title: { en: "Dustbin clearance", hi: "कूड़ेदान खाली करें" },
    location: { en: "All Floors", hi: "सभी फ्लोर" },
    due: "6:00 PM",
    urgency: "routine",
    priority: "normal",
    status: "new",
    photoRequired: false,
    instructions: {
      en: "Empty every dustbin. Put a new garbage bag in each one.",
      hi: "हर कूड़ेदान खाली करें। हर एक में नई थैली लगाएं।",
    },
    checklist: [
      { en: "All dustbins emptied", hi: "सभी कूड़ेदान खाली" },
      { en: "New bags put", hi: "नई थैली लगाई" },
      { en: "Garbage moved to back gate", hi: "कूड़ा पीछे गेट पर रखा" },
    ],
    icon: Trash2,
    history: [{ at: "9:05 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } }],
  },
  {
    id: "T-6",
    kind: "pantry",
    title: { en: "Evening snack setup", hi: "शाम का नाश्ता लगाएं" },
    location: { en: "Cafeteria", hi: "कैफेटेरिया" },
    due: "4:30 PM",
    urgency: "routine",
    priority: "normal",
    status: "new",
    photoRequired: true,
    instructions: {
      en: "Put biscuits and namkeen in bowls. Keep 20 cups and hot water ready.",
      hi: "बिस्कुट और नमकीन कटोरी में रखें। 20 कप और गरम पानी तैयार रखें।",
    },
    checklist: [
      { en: "Counter wiped clean", hi: "काउंटर साफ किया" },
      { en: "Snacks in covered bowls", hi: "नाश्ता ढकी कटोरी में" },
      { en: "20 cups kept ready", hi: "20 कप तैयार रखे" },
    ],
    icon: CupSoda,
    history: [{ at: "9:05 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } }],
  },
  {
    id: "T-7",
    kind: "cleaning",
    title: { en: "Workstation dusting – Floor 2", hi: "डेस्क की धूल सफाई – फ्लोर 2" },
    location: { en: "Floor 2 – Ops", hi: "फ्लोर 2 – ऑप्स" },
    due: "11:00 AM",
    urgency: "routine",
    priority: "normal",
    status: "review",
    photoRequired: true,
    instructions: {
      en: "Dust all desks and screens with a dry cloth.",
      hi: "सूखे कपड़े से सभी डेस्क और स्क्रीन साफ करें।",
    },
    checklist: [
      { en: "All desks dusted", hi: "सभी डेस्क साफ" },
      { en: "Screens wiped with dry cloth", hi: "स्क्रीन सूखे कपड़े से साफ" },
    ],
    icon: Wind,
    history: [
      { at: "9:00 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "11:15 AM", text: { en: "Sent for review", hi: "जाँच के लिए भेजा" } },
    ],
  },
  {
    id: "T-8",
    kind: "pantry",
    title: { en: "Morning tea service", hi: "सुबह की चाय" },
    location: { en: "Floor 1 – Sales", hi: "फ्लोर 1 – सेल्स" },
    due: "9:30 AM",
    urgency: "routine",
    priority: "normal",
    status: "approved",
    photoRequired: false,
    instructions: { en: "Serve tea at all desks.", hi: "सभी डेस्क पर चाय दें।" },
    checklist: [{ en: "Tea served at all desks", hi: "सभी डेस्क पर चाय दी" }],
    icon: Utensils,
    history: [
      { at: "9:00 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "9:35 AM", text: { en: "Sent for review", hi: "जाँच के लिए भेजा" } },
      { at: "10:00 AM", text: { en: "Approved by manager", hi: "मैनेजर ने मंज़ूरी दी" } },
    ],
  },
  {
    id: "T-9",
    kind: "cleaning",
    title: { en: "Glass door cleaning – Entrance", hi: "शीशे का दरवाजा साफ – एंट्रेंस" },
    location: { en: "Ground Floor – Entrance", hi: "ग्राउंड फ्लोर – एंट्रेंस" },
    due: "10:00 AM",
    urgency: "routine",
    priority: "normal",
    status: "approved",
    photoRequired: true,
    instructions: {
      en: "Use glass cleaner only. No water marks should remain.",
      hi: "सिर्फ ग्लास क्लीनर लगाएं। पानी का निशान न रहे।",
    },
    checklist: [
      { en: "Glass cleaner used", hi: "ग्लास क्लीनर लगाया" },
      { en: "No water marks", hi: "पानी का निशान नहीं" },
    ],
    icon: SprayCan,
    history: [
      { at: "8:45 AM", text: { en: "Task assigned by manager", hi: "मैनेजर ने काम दिया" } },
      { at: "10:05 AM", text: { en: "Approved by manager", hi: "मैनेजर ने मंज़ूरी दी" } },
    ],
  },
];

export const L = {
  home: { en: "Dashboard", hi: "डैशबोर्ड" },
  tasks: { en: "My Tasks", hi: "मेरे काम" },
  supplies: { en: "Supplies", hi: "सामान" },
  problem: { en: "Report a Problem", hi: "समस्या बताएं" },
  help: { en: "Help", hi: "मदद" },
  performance: { en: "Performance", hi: "प्रदर्शन" },
  tasksToday: { en: "Tasks Today", hi: "आज के काम" },
  remaining: { en: "Remaining Tasks", hi: "बाकी काम" },
  urgent: { en: "Urgent", hi: "ज़रूरी" },
  overdue: { en: "Overdue", hi: "समय निकला" },
  dueSoon: { en: "Due Soon", hi: "समय पास" },
  routine: { en: "Routine", hi: "सामान्य" },
  normal: { en: "Normal", hi: "सामान्य" },
  urgentTasks: { en: "Urgent Tasks", hi: "ज़रूरी काम" },
  completed: { en: "Completed Tasks", hi: "पूरे काम" },
  nextTask: { en: "Next Task", hi: "अगला काम" },
  start: { en: "Start Work", hi: "काम शुरू करें" },
  done: { en: "Work Completed", hi: "काम पूरा हुआ" },
  needHelp: { en: "Need Help", hi: "मदद चाहिए" },
  todays: { en: "Today's Tasks", hi: "आज के काम" },
  doAgain: { en: "Please Do Again", hi: "कृपया दोबारा करें" },
  startAgain: { en: "Start Again", hi: "फिर से शुरू करें" },
  newTime: { en: "New due time", hi: "नया समय" },
  photo: { en: "Add completion photo", hi: "काम की फोटो लगाएं" },
  photoAdded: { en: "Photo added", hi: "फोटो जुड़ी" },
  voice: { en: "Send voice note", hi: "आवाज़ नोट भेजें" },
  submit: { en: "Submit", hi: "भेजें" },
  submitted: { en: "Work submitted successfully", hi: "काम भेज दिया गया" },
  supplyAlert: { en: "Supply Alerts", hi: "सामान की सूचना" },
  allDone: { en: "All work is done. Well done!", hi: "सारा काम हो गया। बहुत बढ़िया!" },
  listen: { en: "Listen", hi: "सुनें" },
  pantry: { en: "Pantry", hi: "पैंट्री" },
  cleaning: { en: "Cleaning", hi: "सफाई" },
  due: { en: "Due", hi: "समय" },
  history: { en: "History", hi: "इतिहास" },
  viewTask: { en: "View Task", hi: "काम देखें" },
  today: { en: "Today", hi: "आज" },
  pending: { en: "Pending", hi: "बाकी" },
  checklist: { en: "Checklist", hi: "जाँच सूची" },
  priority: { en: "Priority", hi: "प्राथमिकता" },
  status: { en: "Status", hi: "स्थिति" },
  noTasks: { en: "No tasks here", hi: "यहाँ कोई काम नहीं" },
  audio: { en: "Play instruction", hi: "निर्देश सुनें" },
  startedAt: { en: "Started at", hi: "शुरू किया" },
  callManager: { en: "Call Manager", hi: "मैनेजर को कॉल करें" },
  sendPhoto: { en: "Send Photo", hi: "फोटो भेजें" },
  managerNote: { en: "Manager's instruction", hi: "मैनेजर का निर्देश" },
  returnedTimes: { en: "Returned", hi: "वापस आया" },
  oneAtATime: {
    en: "Finish your started task first",
    hi: "पहले चालू काम पूरा करें",
  },
};

export const STATUS_LABEL: Record<Status, Bi> = {
  new: { en: "New", hi: "नया" },
  started: { en: "Started", hi: "शुरू" },
  completed: { en: "Completed", hi: "पूरा" },
  review: { en: "Waiting for Review", hi: "जाँच बाकी" },
  approved: { en: "Approved", hi: "मंज़ूर" },
  redo: { en: "Do Again", hi: "दोबारा करें" },
};

export const URG_RING: Record<Urgency, string> = {
  urgent: "border-destructive/60",
  overdue: "border-destructive/60",
  soon: "border-amber-500/60",
  routine: "border-border",
};

export const URG_TONE: Record<Urgency, string> = {
  urgent: "bg-destructive/10 text-destructive",
  overdue: "bg-destructive/10 text-destructive",
  soon: "bg-amber-500/10 text-amber-600",
  routine: "bg-muted text-foreground",
};

export const URG_LABEL: Record<Urgency, Bi> = {
  urgent: L.urgent,
  overdue: L.overdue,
  soon: L.dueSoon,
  routine: L.routine,
};

/** Sort order: urgent, overdue, due soon, routine, completed. */
export function taskRank(t: Task): number {
  const finished = t.status === "approved" || t.status === "review" || t.status === "completed";
  if (finished) return 90;
  if (t.status === "redo") return 0;
  const byUrgency: Record<Urgency, number> = { urgent: 1, overdue: 2, soon: 3, routine: 4 };
  return byUrgency[t.urgency];
}

export const sortTasks = (tasks: Task[]) =>
  [...tasks].sort((a, b) => taskRank(a) - taskRank(b));

export const nowTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

export const isOpen = (s: Status) => s === "new" || s === "started" || s === "redo";
export const isFinished = (s: Status) =>
  s === "approved" || s === "review" || s === "completed";
