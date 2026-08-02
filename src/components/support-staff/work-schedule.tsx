import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Copy,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat,
  Square,
  UserX,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROLE_META, STAFF, type StaffRole } from "./data";

type Lang = "en" | "hi";
type DayKey = "today" | "tomorrow" | "week";
type Priority = "normal" | "important" | "urgent";
type SchedStatus = "scheduled" | "in-progress" | "completed" | "delayed" | "unassigned";
type Repeat = "once" | "daily" | "selected" | "weekly" | "monthly";
type Availability = "available" | "busy" | "absent" | "off";

type Sched = {
  id: string;
  icon: string;
  titleEn: string;
  titleHi: string;
  role: StaffRole;
  assignee: string | null;
  originalAssignee?: string;
  location: string;
  start: string; // "HH:MM" 24h
  due: string;
  priority: Priority;
  repeat: Repeat;
  repeatDays?: string[];
  paused?: boolean;
  ended?: boolean;
  status: SchedStatus;
  day: "today" | "tomorrow" | "week";
  weekDay?: string;
  instructionsEn?: string;
  instructionsHi?: string;
  photoProof: boolean;
  managerReview: boolean;
  history: string[];
};

const T = {
  en: {
    title: "Work Schedule",
    sub: "Plan daily and repeating work for pantry, cleaning and packing staff.",
    todays: "Today's Tasks",
    unassigned: "Unassigned Tasks",
    absent: "Staff Absent Today",
    add: "Add Scheduled Task",
    today: "Today",
    tomorrow: "Tomorrow",
    week: "This Week",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    edit: "Edit",
    start: "Start",
    due: "Due",
    oneTime: "One-Time",
    repeating: "Repeating",
    clash: "Time clash with another task of the same staff member",
    availability: "Staff Availability",
    reassign: "Reassign",
    changeTime: "Change time",
    pause: "Pause repeat",
    resume: "Resume repeat",
    end: "End repeat",
    copy: "Copy to tomorrow",
    save: "Save changes",
    cancel: "Cancel",
  },
  hi: {
    title: "काम की समय-सारणी",
    sub: "पैंट्री, सफाई और पैकिंग स्टाफ के रोज़ और दोहराने वाले काम तय करें।",
    todays: "आज के काम",
    unassigned: "बिना स्टाफ के काम",
    absent: "आज ग़ैरहाज़िर स्टाफ",
    add: "नया शेड्यूल जोड़ें",
    today: "आज",
    tomorrow: "कल",
    week: "इस हफ़्ते",
    morning: "सुबह",
    afternoon: "दोपहर",
    evening: "शाम",
    edit: "बदलें",
    start: "शुरू",
    due: "समय तक",
    oneTime: "एक बार",
    repeating: "दोहराने वाला",
    clash: "इसी स्टाफ के दूसरे काम से समय टकरा रहा है",
    availability: "स्टाफ की उपलब्धता",
    reassign: "दूसरे को दें",
    changeTime: "समय बदलें",
    pause: "दोहराना रोकें",
    resume: "फिर चालू करें",
    end: "दोहराना बंद करें",
    copy: "कल के लिए कॉपी करें",
    save: "बदलाव सेव करें",
    cancel: "रद्द करें",
  },
};

const PRIORITY: Record<Priority, { en: string; hi: string; cls: string }> = {
  urgent: { en: "Urgent", hi: "अत्यावश्यक", cls: "bg-destructive/15 text-destructive" },
  important: { en: "Important", hi: "ज़रूरी", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  normal: { en: "Normal", hi: "सामान्य", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
};

const STATUS: Record<SchedStatus, { en: string; hi: string; cls: string }> = {
  scheduled: { en: "Scheduled", hi: "तय है", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  "in-progress": { en: "Working", hi: "चल रहा है", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  completed: { en: "Completed", hi: "पूरा", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  delayed: { en: "Delayed", hi: "देर", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  unassigned: { en: "Unassigned", hi: "स्टाफ नहीं", cls: "bg-destructive/15 text-destructive" },
};

const REPEAT_LABEL: Record<Repeat, { en: string; hi: string }> = {
  once: { en: "One Time", hi: "एक बार" },
  daily: { en: "Every Day", hi: "हर दिन" },
  selected: { en: "Selected Days", hi: "चुने हुए दिन" },
  weekly: { en: "Every Week", hi: "हर हफ़्ते" },
  monthly: { en: "Every Month", hi: "हर महीने" },
};

const AVAIL: Record<Availability, { en: string; hi: string; cls: string }> = {
  available: { en: "Available", hi: "उपलब्ध", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  busy: { en: "Busy", hi: "व्यस्त", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  absent: { en: "Absent", hi: "ग़ैरहाज़िर", cls: "bg-destructive/15 text-destructive" },
  off: { en: "Off Duty", hi: "छुट्टी पर", cls: "bg-muted text-muted-foreground" },
};

const AVAILABILITY: Record<string, Availability> = {
  "Ramesh Kumar": "busy",
  "Sunita Devi": "absent",
  "Arjun Yadav": "available",
  "Mohit Sharma": "busy",
  "Pooja Verma": "off",
};

const LOCATIONS: Record<StaffRole, string[]> = {
  pantry: ["Pantry", "Cafeteria", "Floor 1 – Sales", "Floor 2 – Ops", "CEO cabin", "All floors"],
  cleaning: ["Reception", "Washroom – Floor 1", "Washroom – Floor 2", "Cafeteria", "Floor 2 – Ops", "All floors"],
  packing: ["Store room", "Dispatch bay", "Packing table", "Loading area"],
};

const TEMPLATES: { id: string; icon: string; en: string; hi: string; role: StaffRole; insEn: string; insHi: string }[] = [
  { id: "tea", icon: "☕", en: "Prepare tea & coffee", hi: "चाय-कॉफ़ी बनाएँ", role: "pantry", insEn: "Serve fresh tea and coffee on clean covered trays.", insHi: "साफ़ ढकी ट्रे में ताज़ा चाय-कॉफ़ी दें।" },
  { id: "water", icon: "💧", en: "Refill water dispensers", hi: "पानी भरें", role: "pantry", insEn: "Check every dispenser and replace empty cans.", insHi: "हर डिस्पेंसर देखें और खाली कैन बदलें।" },
  { id: "snack", icon: "🍪", en: "Evening snack setup", hi: "शाम का नाश्ता लगाएँ", role: "pantry", insEn: "Set up snacks in the cafeteria before 4:30 PM.", insHi: "4:30 बजे से पहले कैफ़ेटेरिया में नाश्ता लगाएँ।" },
  { id: "washroom", icon: "🚿", en: "Clean washroom", hi: "वॉशरूम साफ़ करें", role: "cleaning", insEn: "Wear gloves, use toilet cleaner, refill soap and dry the floor.", insHi: "दस्ताने पहनें, टॉयलेट क्लीनर लगाएँ, साबुन भरें, फ़र्श सुखाएँ।" },
  { id: "mop", icon: "🧹", en: "Mop floor", hi: "फ़र्श पोंछें", role: "cleaning", insEn: "Place the wet floor sign and mop the full area.", insHi: "वेट फ़्लोर साइन लगाएँ और पूरा फ़र्श पोंछें।" },
  { id: "bins", icon: "🗑️", en: "Dustbin clearance", hi: "डस्टबिन खाली करें", role: "cleaning", insEn: "Clear all bins and replace the bags.", insHi: "सभी डस्टबिन खाली करें और नई थैली लगाएँ।" },
  { id: "pack", icon: "📦", en: "Pack franchise bundle", hi: "फ़्रैंचाइज़ी बंडल पैक करें", role: "packing", insEn: "Pack as per the checklist and double-tape the base.", insHi: "चेकलिस्ट अनुसार पैक करें और नीचे दो बार टेप लगाएँ।" },
  { id: "label", icon: "🏷️", en: "Attach dispatch labels", hi: "डिस्पैच लेबल लगाएँ", role: "packing", insEn: "Stick the label on the top-right side of every carton.", insHi: "हर कार्टन के ऊपर दाईं ओर लेबल लगाएँ।" },
  { id: "qc", icon: "✅", en: "Quality check packed boxes", hi: "पैक बॉक्स की जाँच", role: "packing", insEn: "Check tape, label and weight of each box.", insHi: "हर बॉक्स की टेप, लेबल और वज़न जाँचें।" },
];

const WEEKDAYS = [
  { key: "Mon", hi: "सोम" }, { key: "Tue", hi: "मंगल" }, { key: "Wed", hi: "बुध" },
  { key: "Thu", hi: "गुरु" }, { key: "Fri", hi: "शुक्र" }, { key: "Sat", hi: "शनि" },
];

const SEED: Sched[] = [
  { id: "S-01", icon: "☕", titleEn: "Morning tea & coffee service", titleHi: "सुबह की चाय-कॉफ़ी", role: "pantry", assignee: "Ramesh Kumar", location: "Floor 1 – Sales", start: "09:30", due: "10:00", priority: "normal", repeat: "daily", status: "completed", day: "today", photoProof: false, managerReview: false, history: ["Created as a daily schedule"] },
  { id: "S-02", icon: "💧", titleEn: "Refill water dispensers", titleHi: "पानी भरें", role: "pantry", assignee: "Ramesh Kumar", location: "All floors", start: "11:00", due: "11:45", priority: "normal", repeat: "daily", status: "in-progress", day: "today", photoProof: true, managerReview: true, history: ["Created as a daily schedule"] },
  { id: "S-03", icon: "🍽️", titleEn: "Guest refreshments – CEO cabin", titleHi: "मेहमान का नाश्ता – CEO केबिन", role: "pantry", assignee: "Ramesh Kumar", location: "CEO cabin", start: "11:30", due: "12:00", priority: "urgent", repeat: "once", status: "scheduled", day: "today", photoProof: false, managerReview: false, history: ["One-time task added by manager"] },
  { id: "S-04", icon: "🍪", titleEn: "Evening snack setup", titleHi: "शाम का नाश्ता", role: "pantry", assignee: "Ramesh Kumar", location: "Cafeteria", start: "16:30", due: "17:15", priority: "normal", repeat: "daily", status: "scheduled", day: "today", photoProof: true, managerReview: false, history: ["Created as a daily schedule"] },

  { id: "S-05", icon: "🚿", titleEn: "Washroom deep clean", titleHi: "वॉशरूम की गहरी सफाई", role: "cleaning", assignee: null, originalAssignee: "Sunita Devi", location: "Washroom – Floor 1", start: "08:30", due: "09:30", priority: "urgent", repeat: "daily", status: "unassigned", day: "today", photoProof: true, managerReview: true, history: ["Created as a daily schedule", "Sunita Devi marked absent — task needs reassignment"] },
  { id: "S-06", icon: "🧹", titleEn: "Workstation dusting", titleHi: "वर्कस्टेशन की धूल साफ़ करें", role: "cleaning", assignee: null, originalAssignee: "Sunita Devi", location: "Floor 2 – Ops", start: "10:00", due: "11:00", priority: "normal", repeat: "selected", repeatDays: ["Mon", "Wed", "Fri"], status: "unassigned", day: "today", photoProof: false, managerReview: false, history: ["Created as a selected-days schedule", "Sunita Devi marked absent — task needs reassignment"] },
  { id: "S-07", icon: "🧹", titleEn: "Floor mopping – reception", titleHi: "रिसेप्शन का फ़र्श पोंछें", role: "cleaning", assignee: "Arjun Yadav", location: "Reception", start: "14:00", due: "15:00", priority: "normal", repeat: "daily", status: "delayed", day: "today", photoProof: true, managerReview: true, history: ["Created as a daily schedule"] },
  { id: "S-08", icon: "🗑️", titleEn: "Dustbin clearance", titleHi: "डस्टबिन खाली करें", role: "cleaning", assignee: "Arjun Yadav", location: "All floors", start: "18:00", due: "18:45", priority: "normal", repeat: "daily", status: "scheduled", day: "today", photoProof: false, managerReview: false, history: ["Created as a daily schedule"] },

  { id: "S-09", icon: "📦", titleEn: "Pack franchise starter bundles (6)", titleHi: "फ़्रैंचाइज़ी बंडल पैक करें (6)", role: "packing", assignee: "Mohit Sharma", location: "Store room", start: "10:00", due: "12:30", priority: "important", repeat: "once", status: "in-progress", day: "today", photoProof: true, managerReview: true, history: ["One-time task added by manager"] },
  { id: "S-10", icon: "🏷️", titleEn: "Label dispatch cartons – Jaipur", titleHi: "डिस्पैच लेबल – जयपुर", role: "packing", assignee: "Mohit Sharma", location: "Dispatch bay", start: "11:30", due: "12:15", priority: "important", repeat: "once", status: "scheduled", day: "today", photoProof: true, managerReview: true, history: ["One-time task added by manager"] },
  { id: "S-11", icon: "✅", titleEn: "Quality check packed boxes", titleHi: "पैक बॉक्स की जाँच", role: "packing", assignee: "Pooja Verma", location: "Dispatch bay", start: "16:00", due: "17:00", priority: "normal", repeat: "daily", status: "scheduled", day: "today", photoProof: false, managerReview: true, history: ["Created as a daily schedule"] },

  { id: "S-12", icon: "☕", titleEn: "Morning tea & coffee service", titleHi: "सुबह की चाय-कॉफ़ी", role: "pantry", assignee: "Ramesh Kumar", location: "Floor 1 – Sales", start: "09:30", due: "10:00", priority: "normal", repeat: "daily", status: "scheduled", day: "tomorrow", photoProof: false, managerReview: false, history: ["Auto-created from the daily schedule"] },
  { id: "S-13", icon: "🚿", titleEn: "Washroom deep clean", titleHi: "वॉशरूम की गहरी सफाई", role: "cleaning", assignee: "Sunita Devi", location: "Washroom – Floor 1", start: "08:30", due: "09:30", priority: "important", repeat: "daily", status: "scheduled", day: "tomorrow", photoProof: true, managerReview: true, history: ["Auto-created from the daily schedule"] },
  { id: "S-14", icon: "📦", titleEn: "Pack branding kits – Indore", titleHi: "ब्रांडिंग किट पैक – इंदौर", role: "packing", assignee: "Pooja Verma", location: "Store room", start: "10:30", due: "13:00", priority: "important", repeat: "once", status: "scheduled", day: "tomorrow", photoProof: true, managerReview: true, history: ["One-time task added by manager"] },

  { id: "S-15", icon: "🧹", titleEn: "Deep clean cafeteria", titleHi: "कैफ़ेटेरिया की गहरी सफाई", role: "cleaning", assignee: "Arjun Yadav", location: "Cafeteria", start: "09:00", due: "11:00", priority: "important", repeat: "weekly", status: "scheduled", day: "week", weekDay: "Saturday", photoProof: true, managerReview: true, history: ["Created as a weekly schedule"] },
  { id: "S-16", icon: "🗄️", titleEn: "Store room stock arrangement", titleHi: "स्टोर रूम का सामान जमाएँ", role: "packing", assignee: "Mohit Sharma", location: "Store room", start: "15:00", due: "17:00", priority: "normal", repeat: "monthly", status: "scheduled", day: "week", weekDay: "Friday", photoProof: false, managerReview: false, history: ["Created as a monthly schedule"] },
  { id: "S-17", icon: "☕", titleEn: "Pantry deep cleaning", titleHi: "पैंट्री की गहरी सफाई", role: "pantry", assignee: "Ramesh Kumar", location: "Pantry", start: "17:00", due: "18:30", priority: "normal", repeat: "weekly", status: "scheduled", day: "week", weekDay: "Thursday", photoProof: true, managerReview: false, history: ["Created as a weekly schedule"] },
];

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const pretty = (t: string) => {
  const h = Number(t.slice(0, 2));
  const m = t.slice(3, 5);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m} ${ap}`;
};
const slotOf = (t: string): "morning" | "afternoon" | "evening" => {
  const m = toMin(t);
  if (m < 12 * 60) return "morning";
  if (m < 17 * 60) return "afternoon";
  return "evening";
};
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const stamp = () =>
  new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function WorkSchedule({ onGo }: { onGo?: (s: string) => void }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];
  const [items, setItems] = useState<Sched[]>(SEED);
  const [view, setView] = useState<DayKey>("today");

  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmRepeat, setConfirmRepeat] = useState<null | { id: string; action: "pause" | "resume" | "end" }>(null);

  // add form
  const [tpl, setTpl] = useState("");
  const [role, setRole] = useState<StaffRole>("pantry");
  const [staff, setStaff] = useState("");
  const [loc, setLoc] = useState("");
  const [start, setStart] = useState("");
  const [due, setDue] = useState("");
  const [prio, setPrio] = useState<Priority>("normal");
  const [insEn, setInsEn] = useState("");
  const [insHi, setInsHi] = useState("");
  const [photo, setPhoto] = useState(true);
  const [review, setReview] = useState(false);
  const [rep, setRep] = useState<Repeat>("once");
  const [repDays, setRepDays] = useState<string[]>([]);

  const dayItems = useMemo(() => items.filter((i) => i.day === view), [items, view]);

  const todayItems = items.filter((i) => i.day === "today");
  const unassignedCount = items.filter((i) => !i.assignee && !i.ended).length;
  const absentStaff = STAFF.filter((s) => AVAILABILITY[s.name] === "absent");

  // clash detection within the current view
  const clashIds = useMemo(() => {
    const out = new Set<string>();
    const byStaff: Record<string, Sched[]> = {};
    dayItems.forEach((i) => {
      if (!i.assignee || i.ended) return;
      (byStaff[i.assignee] ??= []).push(i);
    });
    Object.values(byStaff).forEach((list) => {
      for (let a = 0; a < list.length; a++) {
        for (let b = a + 1; b < list.length; b++) {
          const x = list[a]!, y = list[b]!;
          if (toMin(x.start) < toMin(y.due) && toMin(y.start) < toMin(x.due)) {
            out.add(x.id);
            out.add(y.id);
          }
        }
      }
    });
    return out;
  }, [dayItems]);

  const patch = (id: string, fn: (s: Sched) => Sched) =>
    setItems((prev) => prev.map((s) => (s.id === id ? fn(s) : s)));

  const editing = items.find((i) => i.id === editId) ?? null;

  const resetAdd = () => {
    setTpl(""); setRole("pantry"); setStaff(""); setLoc(""); setStart(""); setDue("");
    setPrio("normal"); setInsEn(""); setInsHi(""); setPhoto(true); setReview(false);
    setRep("once"); setRepDays([]);
  };

  const applyTemplate = (id: string) => {
    setTpl(id);
    const tp = TEMPLATES.find((x) => x.id === id);
    if (!tp) return;
    setRole(tp.role);
    setStaff("");
    setInsEn(tp.insEn);
    setInsHi(tp.insHi);
  };

  const createTask = () => {
    const tp = TEMPLATES.find((x) => x.id === tpl);
    if (!tp) { toast.error(lang === "en" ? "Choose a task template" : "काम का टेम्पलेट चुनें"); return; }
    if (!staff) { toast.error(lang === "en" ? "Select a staff member" : "स्टाफ चुनें"); return; }
    if (!loc) { toast.error(lang === "en" ? "Select a work location" : "जगह चुनें"); return; }
    if (!start || !due) { toast.error(lang === "en" ? "Set start and due time" : "शुरू और अंत समय भरें"); return; }
    if (toMin(due) <= toMin(start)) { toast.error(lang === "en" ? "Due time must be after start time" : "अंत समय शुरू के बाद होना चाहिए"); return; }
    if (rep === "selected" && repDays.length === 0) { toast.error(lang === "en" ? "Choose the repeat days" : "दोहराने के दिन चुनें"); return; }

    const duplicate = items.some(
      (i) => i.assignee === staff && i.start === start && i.titleEn === tp.en && i.day === view && !i.ended,
    );
    if (duplicate) {
      toast.error(
        lang === "en"
          ? "This task already exists for the same person and time."
          : "यही काम इसी स्टाफ और समय के लिए पहले से है।",
      );
      return;
    }

    const id = `S-${String(items.length + 20)}`;
    setItems((p) => [
      ...p,
      {
        id, icon: tp.icon, titleEn: tp.en, titleHi: tp.hi, role, assignee: staff, location: loc,
        start, due, priority: prio, repeat: rep, repeatDays: rep === "selected" ? repDays : undefined,
        status: "scheduled", day: view === "week" ? "week" : view,
        weekDay: view === "week" ? "Saturday" : undefined,
        instructionsEn: insEn, instructionsHi: insHi, photoProof: photo, managerReview: review,
        history: [`${stamp()} · Scheduled by Admin Manager (${REPEAT_LABEL[rep].en})`],
      },
    ]);
    setAddOpen(false);
    resetAdd();
    toast.success(
      rep === "once"
        ? lang === "en" ? "Task scheduled and sent to the staff member." : "काम तय हुआ और स्टाफ को भेजा गया।"
        : lang === "en"
          ? "Repeating schedule created. Future tasks will be generated from this one template."
          : "दोहराने वाला शेड्यूल बना। आगे के काम इसी टेम्पलेट से बनेंगे।",
    );
  };

  const repeatAction = () => {
    if (!confirmRepeat) return;
    const { id, action } = confirmRepeat;
    patch(id, (s) => ({
      ...s,
      paused: action === "pause" ? true : action === "resume" ? false : s.paused,
      ended: action === "end" ? true : s.ended,
      history: [
        ...s.history,
        `${stamp()} · Repeat ${action === "pause" ? "paused" : action === "resume" ? "resumed" : "ended"} by Admin Manager (past tasks kept)`,
      ],
    }));
    setConfirmRepeat(null);
    toast.success(
      action === "pause"
        ? lang === "en" ? "Repeat paused. Previous tasks are kept." : "दोहराना रुका। पुराने काम सुरक्षित हैं।"
        : action === "resume"
          ? lang === "en" ? "Repeat resumed." : "दोहराना फिर चालू।"
          : lang === "en" ? "Repeat ended. Previous tasks are kept." : "दोहराना बंद। पुराने काम सुरक्षित हैं।",
    );
  };

  const copyToTomorrow = (s: Sched) => {
    const dup = items.some(
      (i) => i.day === "tomorrow" && i.assignee === s.assignee && i.start === s.start && i.titleEn === s.titleEn,
    );
    if (dup) {
      toast.error(lang === "en" ? "Already scheduled for tomorrow." : "कल के लिए पहले से तय है।");
      return;
    }
    setItems((p) => [
      ...p,
      {
        ...s,
        id: `${s.id}-C`,
        day: "tomorrow",
        status: s.assignee ? "scheduled" : "unassigned",
        repeat: "once",
        history: [...s.history, `${stamp()} · Copied to tomorrow by Admin Manager`],
      },
    ]);
    toast.success(lang === "en" ? "Copied to tomorrow." : "कल के लिए कॉपी हुआ।");
  };

  const reassign = (id: string, name: string) => {
    patch(id, (s) => ({
      ...s,
      assignee: name,
      originalAssignee: s.originalAssignee ?? s.assignee ?? undefined,
      status: s.status === "unassigned" ? "scheduled" : s.status,
      history: [
        ...s.history,
        `${stamp()} · Reassigned from ${s.originalAssignee ?? s.assignee ?? "unassigned"} to ${name} by Admin Manager`,
      ],
    }));
    toast.success(lang === "en" ? `Reassigned to ${name}` : `${name} को दिया गया`);
  };

  /* ---------------- card ---------------- */
  const Cardlet = ({ s }: { s: Sched }) => {
    const clash = clashIds.has(s.id);
    const tone =
      s.ended ? "border-muted bg-muted/40"
        : s.status === "completed" ? "border-emerald-500/40 bg-emerald-500/5"
          : s.status === "unassigned" || s.priority === "urgent" ? "border-destructive/50 bg-destructive/5"
            : s.status === "delayed" ? "border-amber-500/50 bg-amber-500/5"
              : "border-blue-500/40 bg-blue-500/5";
    return (
      <Card className={tone}>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl">
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-tight">{lang === "en" ? s.titleEn : s.titleHi}</div>
              <p className="text-xs text-muted-foreground">
                {ROLE_META[s.role].label} · {s.location}
                {s.weekDay ? ` · ${s.weekDay}` : ""}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditId(s.id)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {t.edit}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {s.assignee ? initials(s.assignee) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="text-base font-semibold leading-tight">
                {s.assignee ?? (lang === "en" ? "Not assigned" : "स्टाफ नहीं")}
              </div>
              {!s.assignee && s.originalAssignee && (
                <div className="text-xs text-destructive">
                  {lang === "en"
                    ? `${s.originalAssignee} is absent today`
                    : `${s.originalAssignee} आज ग़ैरहाज़िर हैं`}
                </div>
              )}
            </div>
            <div className="ml-auto text-right text-sm">
              <div className="font-semibold">{pretty(s.start)} – {pretty(s.due)}</div>
              <div className="text-xs text-muted-foreground">{t.start} / {t.due}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={PRIORITY[s.priority].cls}>{PRIORITY[s.priority][lang]}</Badge>
            <Badge variant="outline" className={STATUS[s.status].cls}>{STATUS[s.status][lang]}</Badge>
            <Badge variant="outline">
              {s.repeat === "once" ? t.oneTime : `${t.repeating} · ${REPEAT_LABEL[s.repeat][lang]}`}
              {s.repeatDays?.length ? ` (${s.repeatDays.join(", ")})` : ""}
            </Badge>
            {s.paused && <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400">{lang === "en" ? "Repeat paused" : "दोहराना रुका"}</Badge>}
            {s.ended && <Badge variant="outline">{lang === "en" ? "Repeat ended" : "दोहराना बंद"}</Badge>}
          </div>

          {clash && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t.clash}
            </div>
          )}

          {!s.assignee && (
            <Select onValueChange={(v) => reassign(s.id, v)}>
              <SelectTrigger>
                <SelectValue placeholder={lang === "en" ? "Reassign to available staff" : "उपलब्ध स्टाफ को दें"} />
              </SelectTrigger>
              <SelectContent>
                {STAFF.filter((m) => m.role === s.role && AVAILABILITY[m.name] !== "absent").map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name} — {AVAIL[AVAILABILITY[m.name] ?? "available"][lang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.sub}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-full border">
            {(["en", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                }`}
              >
                {l === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>
          <Button onClick={() => { resetAdd(); setAddOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            {t.add}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-blue-500/40">
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{todayItems.length}</div>
              <p className="text-xs text-muted-foreground">{t.todays}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={unassignedCount ? "border-destructive/50" : ""}>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className={`h-8 w-8 ${unassignedCount ? "text-destructive" : "text-muted-foreground"}`} />
            <div>
              <div className="text-2xl font-bold">{unassignedCount}</div>
              <p className="text-xs text-muted-foreground">{t.unassigned}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={absentStaff.length ? "border-amber-500/50" : ""}>
          <CardContent className="flex items-center gap-3 p-4">
            <UserX className={`h-8 w-8 ${absentStaff.length ? "text-amber-600" : "text-muted-foreground"}`} />
            <div>
              <div className="text-2xl font-bold">{absentStaff.length}</div>
              <p className="text-xs text-muted-foreground">{t.absent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* views */}
      <div className="flex flex-wrap gap-2">
        {([["today", t.today], ["tomorrow", t.tomorrow], ["week", t.week]] as [DayKey, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              view === k ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* availability */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            {t.availability}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STAFF.map((m) => {
            const a = AVAILABILITY[m.name] ?? "available";
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-md border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold leading-tight">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ROLE_META[m.role].label} · {m.shift}
                  </div>
                </div>
                <Badge variant="outline" className={`ml-auto ${AVAIL[a].cls}`}>{AVAIL[a][lang]}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* unassigned due to absence */}
      {items.some((i) => !i.assignee) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">
              {lang === "en" ? "Work left by absent staff — reassign" : "ग़ैरहाज़िर स्टाफ का बचा काम — दूसरे को दें"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {items.filter((i) => !i.assignee).map((s) => <Cardlet key={s.id} s={s} />)}
          </CardContent>
        </Card>
      )}

      {/* timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {lang === "en" ? "Daily timeline" : "दिन का क्रम"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["morning", "afternoon", "evening"] as const).map((slot) => {
            const list = dayItems
              .filter((i) => slotOf(i.start) === slot)
              .sort((a, b) =>
                a.priority === "urgent" && b.priority !== "urgent" ? -1 :
                b.priority === "urgent" && a.priority !== "urgent" ? 1 :
                toMin(a.start) - toMin(b.start),
              );
            if (!list.length) return null;
            return (
              <div key={slot}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t[slot]}
                  </h3>
                  <Separator className="flex-1" />
                </div>
                <div className="space-y-1.5">
                  {list.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setEditId(s.id)}
                      className={`flex w-full items-center gap-3 rounded-md border p-2 text-left text-sm ${
                        clashIds.has(s.id) ? "border-destructive bg-destructive/10" : ""
                      }`}
                    >
                      <span className="w-24 shrink-0 text-xs font-semibold text-muted-foreground">
                        {pretty(s.start)}
                      </span>
                      <span className="text-lg">{s.icon}</span>
                      <span className="min-w-0 flex-1 truncate">
                        {lang === "en" ? s.titleEn : s.titleHi}
                        <span className="block text-xs text-muted-foreground">
                          {s.assignee ?? (lang === "en" ? "Not assigned" : "स्टाफ नहीं")} · {s.location}
                        </span>
                      </span>
                      {clashIds.has(s.id) && <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />}
                      <Badge variant="outline" className={`shrink-0 ${STATUS[s.status].cls}`}>
                        {STATUS[s.status][lang]}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {dayItems.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {lang === "en" ? "Nothing scheduled for this view." : "इस दिन के लिए कुछ तय नहीं है।"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* grouped by staff category */}
      {(Object.keys(ROLE_META) as StaffRole[]).map((r) => {
        const list = dayItems.filter((i) => i.role === r).sort((a, b) => toMin(a.start) - toMin(b.start));
        const Icon = ROLE_META[r].icon;
        return (
          <div key={r} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">{ROLE_META[r].label}</h2>
              <Badge variant="secondary">{list.length}</Badge>
            </div>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {lang === "en" ? "No scheduled work." : "कोई काम तय नहीं।"}
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {list.map((s) => <Cardlet key={s.id} s={s} />)}
              </div>
            )}
          </div>
        );
      })}

      {/* add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.add}</DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "One schedule template creates all future task instances."
                : "एक शेड्यूल से आगे के सभी काम अपने-आप बनेंगे।"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{lang === "en" ? "Task template" : "काम का टेम्पलेट"}</Label>
              <Select value={tpl} onValueChange={applyTemplate}>
                <SelectTrigger><SelectValue placeholder={lang === "en" ? "Choose a task" : "काम चुनें"} /></SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((x) => (
                    <SelectItem key={x.id} value={x.id}>
                      {x.icon} {lang === "en" ? x.en : x.hi} — {ROLE_META[x.role].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "en" ? "Staff category" : "स्टाफ श्रेणी"}</Label>
                <Select value={role} onValueChange={(v) => { setRole(v as StaffRole); setStaff(""); setLoc(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_META) as StaffRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "en" ? "Staff member" : "स्टाफ"}</Label>
                <Select value={staff} onValueChange={setStaff}>
                  <SelectTrigger><SelectValue placeholder={lang === "en" ? "Select staff" : "स्टाफ चुनें"} /></SelectTrigger>
                  <SelectContent>
                    {STAFF.filter((m) => m.role === role).map((m) => (
                      <SelectItem key={m.id} value={m.name} disabled={AVAILABILITY[m.name] === "absent"}>
                        {m.name} — {AVAIL[AVAILABILITY[m.name] ?? "available"][lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "en" ? "Work location" : "जगह"}</Label>
                <Select value={loc} onValueChange={setLoc}>
                  <SelectTrigger><SelectValue placeholder={lang === "en" ? "Select location" : "जगह चुनें"} /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS[role].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "en" ? "Priority" : "प्राथमिकता"}</Label>
                <Select value={prio} onValueChange={(v) => setPrio(v as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["normal", "important", "urgent"] as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>{PRIORITY[p][lang]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "en" ? "Start time" : "शुरू का समय"}</Label>
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "en" ? "Due time" : "पूरा करने का समय"}</Label>
                <Input type="time" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">English instruction</Label>
                <Textarea rows={3} value={insEn} onChange={(e) => setInsEn(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">हिंदी निर्देश</Label>
                <Textarea rows={3} value={insHi} onChange={(e) => setInsHi(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={photo} onCheckedChange={(v) => setPhoto(Boolean(v))} />
                {lang === "en" ? "Photo proof required" : "फ़ोटो प्रूफ़ ज़रूरी"}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={review} onCheckedChange={(v) => setReview(Boolean(v))} />
                {lang === "en" ? "Manager review required (goes to Review Work)" : "मैनेजर जाँच ज़रूरी (Review Work में जाएगा)"}
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{lang === "en" ? "Repeat" : "दोहराव"}</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(REPEAT_LABEL) as Repeat[]).map((r) => (
                  <Button key={r} size="sm" variant={rep === r ? "default" : "outline"} onClick={() => setRep(r)}>
                    <Repeat className="mr-1.5 h-3.5 w-3.5" />
                    {REPEAT_LABEL[r][lang]}
                  </Button>
                ))}
              </div>
              {rep === "selected" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {WEEKDAYS.map((d) => (
                    <Button
                      key={d.key}
                      size="sm"
                      variant={repDays.includes(d.key) ? "secondary" : "outline"}
                      onClick={() =>
                        setRepDays((p) => (p.includes(d.key) ? p.filter((x) => x !== d.key) : [...p, d.key]))
                      }
                    >
                      {lang === "en" ? d.key : d.hi}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t.cancel}</Button>
            <Button onClick={createTask}>{t.add}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* edit dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {editing.icon} {lang === "en" ? editing.titleEn : editing.titleHi}
                </DialogTitle>
                <DialogDescription>
                  {editing.assignee ?? (lang === "en" ? "Not assigned" : "स्टाफ नहीं")} · {editing.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{lang === "en" ? "Start time" : "शुरू"}</Label>
                    <Input
                      type="time"
                      value={editing.start}
                      onChange={(e) => patch(editing.id, (s) => ({ ...s, start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{lang === "en" ? "Due time" : "पूरा करने का समय"}</Label>
                    <Input
                      type="time"
                      value={editing.due}
                      onChange={(e) => patch(editing.id, (s) => ({ ...s, due: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t.reassign}</Label>
                  <Select value={editing.assignee ?? ""} onValueChange={(v) => reassign(editing.id, v)}>
                    <SelectTrigger><SelectValue placeholder={lang === "en" ? "Select staff" : "स्टाफ चुनें"} /></SelectTrigger>
                    <SelectContent>
                      {STAFF.filter((m) => m.role === editing.role).map((m) => (
                        <SelectItem key={m.id} value={m.name} disabled={AVAILABILITY[m.name] === "absent"}>
                          {m.name} — {AVAIL[AVAILABILITY[m.name] ?? "available"][lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === "en" ? "Priority" : "प्राथमिकता"}</Label>
                  <Select
                    value={editing.priority}
                    onValueChange={(v) => patch(editing.id, (s) => ({ ...s, priority: v as Priority }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["normal", "important", "urgent"] as Priority[]).map((p) => (
                        <SelectItem key={p} value={p}>{PRIORITY[p][lang]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editing.repeat !== "once" && (
                  <div className="flex flex-wrap gap-2">
                    {!editing.paused ? (
                      <Button size="sm" variant="outline" onClick={() => setConfirmRepeat({ id: editing.id, action: "pause" })}>
                        <Pause className="mr-1.5 h-3.5 w-3.5" />{t.pause}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setConfirmRepeat({ id: editing.id, action: "resume" })}>
                        <Play className="mr-1.5 h-3.5 w-3.5" />{t.resume}
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => setConfirmRepeat({ id: editing.id, action: "end" })}>
                      <Square className="mr-1.5 h-3.5 w-3.5" />{t.end}
                    </Button>
                  </div>
                )}

                <Button size="sm" variant="outline" onClick={() => copyToTomorrow(editing)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />{t.copy}
                </Button>

                <div className="rounded-md border p-3">
                  <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {lang === "en" ? "Schedule history" : "शेड्यूल इतिहास"}
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {editing.history.map((h, i) => <li key={i}>• {h}</li>)}
                  </ul>
                </div>

                {editing.managerReview && (
                  <button
                    onClick={() => onGo?.("review")}
                    className="w-full rounded-md border p-2 text-left text-xs text-muted-foreground hover:bg-muted"
                  >
                    {lang === "en"
                      ? "Completed work from this task goes to Review Work →"
                      : "इस काम का पूरा होना Review Work में जाएगा →"}
                  </button>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    patch(editing.id, (s) => ({
                      ...s,
                      history: [...s.history, `${stamp()} · Schedule updated by Admin Manager`],
                    }));
                    setEditId(null);
                    toast.success(
                      lang === "en"
                        ? "Schedule updated. Staff Tasks are updated too."
                        : "शेड्यूल अपडेट हुआ। स्टाफ के काम भी अपडेट हुए।",
                    );
                  }}
                >
                  {t.save}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* repeat confirm */}
      <Dialog open={Boolean(confirmRepeat)} onOpenChange={(o) => !o && setConfirmRepeat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === "en" ? "Change an active repeating schedule?" : "चालू दोहराव बदलें?"}
            </DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "This affects future tasks only. Previous tasks, photos and review history are kept."
                : "इससे सिर्फ़ आगे के काम बदलेंगे। पुराने काम, फ़ोटो और इतिहास सुरक्षित रहेंगे।"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRepeat(null)}>{t.cancel}</Button>
            <Button onClick={repeatAction}>
              {lang === "en" ? "Yes, continue" : "हाँ, करें"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
