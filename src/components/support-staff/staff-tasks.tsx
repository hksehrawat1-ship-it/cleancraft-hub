import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  History,
  ImageIcon,
  ListChecks,
  MapPin,
  MessageSquarePlus,
  Phone,
  Plus,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
type Priority = "normal" | "important" | "urgent";
type Status = "assigned" | "in-progress" | "review" | "approved" | "returned" | "cancelled";

type HistoryEntry = { at: string; by: string; text: string };

export type SupportTask = {
  id: string;
  icon: string;
  titleEn: string;
  titleHi: string;
  role: StaffRole;
  assignee: string;
  originalAssignee: string;
  location: string;
  instructionsEn: string;
  instructionsHi: string;
  managerNotes: string[];
  steps: { text: string; done: boolean }[];
  priority: Priority;
  assignedAt: number; // hours offset from now (negative = past)
  dueAt: number; // hours offset from now
  status: Status;
  photoProof: boolean;
  reviewRequired: boolean;
  hasReferencePhoto: boolean;
  hasReferenceVideo: boolean;
  completionNote?: string;
  completionPhoto?: boolean;
  returnCount: number;
  cancelReason?: string;
  history: HistoryEntry[];
};

const now = Date.now();
const h = (n: number) => now + n * 3600_000;

function ts(offsetHours: number) {
  return new Date(h(offsetHours)).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const L = {
  title: { en: "Staff Tasks", hi: "स्टाफ के काम" },
  subtitle: {
    en: "Every task given to pantry, cleaning and packing staff in one place.",
    hi: "पैंट्री, सफाई और पैकिंग स्टाफ के सभी काम एक जगह।",
  },
  active: { en: "Total Active Tasks", hi: "कुल चालू काम" },
  overdue: { en: "Overdue Tasks", hi: "देरी वाले काम" },
  completedToday: { en: "Completed Today", hi: "आज पूरे हुए" },
  assignBtn: { en: "Assign Task", hi: "काम सौंपें" },
  filters: { en: "Filters", hi: "फ़िल्टर" },
  view: { en: "View Task", hi: "काम देखें" },
  noTasks: { en: "No tasks match these filters.", hi: "इन फ़िल्टर से कोई काम नहीं मिला।" },
} as const;

const STATUS_META: Record<
  Status,
  { en: string; hi: string; cls: string }
> = {
  assigned: { en: "Assigned", hi: "सौंपा गया", cls: "bg-muted text-muted-foreground" },
  "in-progress": { en: "In Progress", hi: "चल रहा है", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  review: { en: "Waiting for Review", hi: "रिव्यू बाकी", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  approved: { en: "Approved", hi: "मंज़ूर", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  returned: { en: "Returned", hi: "वापस भेजा", cls: "bg-destructive/15 text-destructive" },
  cancelled: { en: "Cancelled", hi: "रद्द", cls: "bg-muted text-muted-foreground line-through" },
};

const PRIORITY_META: Record<Priority, { en: string; hi: string; cls: string }> = {
  normal: { en: "Normal", hi: "सामान्य", cls: "bg-muted text-muted-foreground" },
  important: { en: "Important", hi: "ज़रूरी", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  urgent: { en: "Urgent", hi: "अत्यावश्यक", cls: "bg-destructive/15 text-destructive" },
};

const LOCATIONS = [
  "Reception",
  "Ground floor",
  "Floor 1 – Sales",
  "Floor 2 – Ops",
  "Pantry",
  "Cafeteria",
  "Washroom – Floor 1",
  "Washroom – Floor 2",
  "Store room",
  "Dispatch bay",
  "All floors",
];

const SEED: SupportTask[] = [
  {
    id: "T-501", icon: "☕", titleEn: "Guest refreshments – CEO cabin", titleHi: "मेहमान के लिए नाश्ता – सीईओ केबिन",
    role: "pantry", assignee: "Ramesh Kumar", originalAssignee: "Ramesh Kumar", location: "Floor 2 – Ops",
    instructionsEn: "Serve tea and biscuits within 5 minutes of guest arrival. Use covered tray.",
    instructionsHi: "मेहमान आने के 5 मिनट में चाय और बिस्किट दें। ढकी ट्रे इस्तेमाल करें।",
    managerNotes: ["Two guests today, keep one cup extra ready."],
    steps: [{ text: "Boil water", done: true }, { text: "Prepare tray", done: false }, { text: "Serve guests", done: false }],
    priority: "urgent", assignedAt: -1.5, dueAt: 0.5, status: "in-progress",
    photoProof: false, reviewRequired: true, hasReferencePhoto: false, hasReferenceVideo: false, returnCount: 0,
    history: [
      { at: ts(-1.5), by: "Admin Manager", text: "Task assigned to Ramesh Kumar" },
      { at: ts(-0.6), by: "Ramesh Kumar", text: "Started work" },
    ],
  },
  {
    id: "T-502", icon: "💧", titleEn: "Refill drinking water cans", titleHi: "पीने का पानी भरें",
    role: "pantry", assignee: "Ramesh Kumar", originalAssignee: "Ramesh Kumar", location: "All floors",
    instructionsEn: "Check every dispenser and replace empty cans.",
    instructionsHi: "हर डिस्पेंसर देखें और खाली कैन बदलें।",
    managerNotes: [],
    steps: [{ text: "Check all dispensers", done: true }, { text: "Replace empty cans", done: true }],
    priority: "normal", assignedAt: -5, dueAt: -1.2, status: "review",
    photoProof: true, reviewRequired: true, hasReferencePhoto: true, hasReferenceVideo: false,
    completionNote: "All 6 dispensers refilled. Floor 2 can was leaking, kept aside.",
    completionPhoto: true, returnCount: 0,
    history: [
      { at: ts(-5), by: "Admin Manager", text: "Task assigned to Ramesh Kumar" },
      { at: ts(-3), by: "Ramesh Kumar", text: "Started work" },
      { at: ts(-1.2), by: "Ramesh Kumar", text: "Marked complete with photo proof" },
    ],
  },
  {
    id: "T-503", icon: "🪣", titleEn: "Clean pantry counter and sink", titleHi: "पैंट्री काउंटर और सिंक साफ़ करें",
    role: "pantry", assignee: "Ramesh Kumar", originalAssignee: "Ramesh Kumar", location: "Pantry",
    instructionsEn: "Clear the counter, wash the sink and wipe all shelves.",
    instructionsHi: "काउंटर खाली करें, सिंक धोएँ और शेल्फ पोंछें।",
    managerNotes: [],
    steps: [{ text: "Clear counter", done: false }, { text: "Wash sink", done: false }],
    priority: "normal", assignedAt: -0.5, dueAt: 4, status: "assigned",
    photoProof: true, reviewRequired: true, hasReferencePhoto: false, hasReferenceVideo: false, returnCount: 0,
    history: [{ at: ts(-0.5), by: "Admin Manager", text: "Task assigned to Ramesh Kumar" }],
  },
  {
    id: "T-504", icon: "🚿", titleEn: "Washroom deep clean", titleHi: "वॉशरूम की गहरी सफाई",
    role: "cleaning", assignee: "Sunita Devi", originalAssignee: "Sunita Devi", location: "Washroom – Floor 1",
    instructionsEn: "Wear gloves. Use toilet cleaner only. Refill soap and tissue. Dry the floor.",
    instructionsHi: "दस्ताने पहनें। सिर्फ़ टॉयलेट क्लीनर लगाएँ। साबुन और टिश्यू भरें। फ़र्श सुखाएँ।",
    managerNotes: ["Yesterday floor was left wet — please dry properly."],
    steps: [{ text: "Wear gloves", done: true }, { text: "Apply cleaner", done: true }, { text: "Refill soap & tissue", done: false }, { text: "Dry floor", done: false }],
    priority: "important", assignedAt: -6, dueAt: -2, status: "returned",
    photoProof: true, reviewRequired: true, hasReferencePhoto: true, hasReferenceVideo: false,
    completionNote: "Cleaned washroom.", completionPhoto: true, returnCount: 2,
    history: [
      { at: ts(-6), by: "Admin Manager", text: "Task assigned to Sunita Devi" },
      { at: ts(-4.5), by: "Sunita Devi", text: "Marked complete with photo proof" },
      { at: ts(-4), by: "Admin Manager", text: "Returned: floor still wet" },
      { at: ts(-3), by: "Sunita Devi", text: "Marked complete again" },
      { at: ts(-2), by: "Admin Manager", text: "Returned: tissue not refilled" },
    ],
  },
  {
    id: "T-505", icon: "🧹", titleEn: "Clean reception area", titleHi: "रिसेप्शन साफ़ करें",
    role: "cleaning", assignee: "Sunita Devi", originalAssignee: "Sunita Devi", location: "Reception",
    instructionsEn: "Mop floor, wipe desk, clean the glass door.",
    instructionsHi: "फ़र्श पोंछें, डेस्क साफ़ करें, शीशे का दरवाज़ा साफ़ करें।",
    managerNotes: [],
    steps: [{ text: "Wet floor sign", done: true }, { text: "Mop floor", done: true }, { text: "Clean glass", done: true }],
    priority: "normal", assignedAt: -8, dueAt: -6, status: "approved",
    photoProof: true, reviewRequired: true, hasReferencePhoto: false, hasReferenceVideo: false,
    completionNote: "Done before office opening.", completionPhoto: true, returnCount: 0,
    history: [
      { at: ts(-8), by: "Admin Manager", text: "Task assigned to Sunita Devi" },
      { at: ts(-6.5), by: "Sunita Devi", text: "Marked complete with photo proof" },
      { at: ts(-6), by: "Admin Manager", text: "Approved — performance updated" },
    ],
  },
  {
    id: "T-506", icon: "🚮", titleEn: "Empty all dustbins", titleHi: "सभी डस्टबिन खाली करें",
    role: "cleaning", assignee: "Arjun Yadav", originalAssignee: "Arjun Yadav", location: "All floors",
    instructionsEn: "Empty every bin and put a fresh garbage bag.",
    instructionsHi: "हर डस्टबिन खाली करें और नया बैग लगाएँ।",
    managerNotes: [],
    steps: [{ text: "Collect bins", done: false }, { text: "Put new bags", done: false }],
    priority: "normal", assignedAt: -0.2, dueAt: 6, status: "assigned",
    photoProof: false, reviewRequired: false, hasReferencePhoto: false, hasReferenceVideo: false, returnCount: 0,
    history: [{ at: ts(-0.2), by: "Admin Manager", text: "Task assigned to Arjun Yadav" }],
  },
  {
    id: "T-507", icon: "🧴", titleEn: "Dust workstations – Ops floor", titleHi: "ऑप्स फ़्लोर वर्कस्टेशन साफ़ करें",
    role: "cleaning", assignee: "Arjun Yadav", originalAssignee: "Sunita Devi", location: "Floor 2 – Ops",
    instructionsEn: "Dust all desks, clean chairs and mop the walkway.",
    instructionsHi: "सभी डेस्क की धूल साफ़ करें, कुर्सियाँ पोंछें और रास्ता पोंछें।",
    managerNotes: ["Reassigned as Sunita is handling washroom redo."],
    steps: [{ text: "Dust desks", done: true }, { text: "Clean chairs", done: false }],
    priority: "important", assignedAt: -3, dueAt: 0.8, status: "in-progress",
    photoProof: true, reviewRequired: true, hasReferencePhoto: false, hasReferenceVideo: true, returnCount: 0,
    history: [
      { at: ts(-3), by: "Admin Manager", text: "Task assigned to Sunita Devi" },
      { at: ts(-2), by: "Admin Manager", text: "Reassigned to Arjun Yadav (original: Sunita Devi)" },
      { at: ts(-1), by: "Arjun Yadav", text: "Started work" },
    ],
  },
  {
    id: "T-508", icon: "📦", titleEn: "Pack franchise starter bundles (6)", titleHi: "फ़्रैंचाइज़ स्टार्टर बंडल पैक करें (6)",
    role: "packing", assignee: "Mohit Sharma", originalAssignee: "Mohit Sharma", location: "Store room",
    instructionsEn: "Pack 6 bundles as per the standard list. Double-tape the base.",
    instructionsHi: "स्टैंडर्ड लिस्ट अनुसार 6 बंडल पैक करें। नीचे दो बार टेप लगाएँ।",
    managerNotes: ["Jaipur dispatch — must go today."],
    steps: [{ text: "Collect items", done: true }, { text: "Bubble wrap fragile", done: true }, { text: "Tape boxes", done: false }],
    priority: "urgent", assignedAt: -4, dueAt: -0.5, status: "in-progress",
    photoProof: true, reviewRequired: true, hasReferencePhoto: true, hasReferenceVideo: false, returnCount: 0,
    history: [
      { at: ts(-4), by: "Admin Manager", text: "Task assigned to Mohit Sharma" },
      { at: ts(-3.2), by: "Mohit Sharma", text: "Started work" },
    ],
  },
  {
    id: "T-509", icon: "🏷️", titleEn: "Attach dispatch labels – Indore", titleHi: "डिस्पैच लेबल लगाएँ – इंदौर",
    role: "packing", assignee: "Pooja Verma", originalAssignee: "Pooja Verma", location: "Dispatch bay",
    instructionsEn: "Stick the label on the top-right side of every carton.",
    instructionsHi: "हर कार्टन के ऊपर दाईं ओर लेबल चिपकाएँ।",
    managerNotes: [],
    steps: [{ text: "Print labels", done: true }, { text: "Match box to label", done: true }, { text: "Stick labels", done: true }],
    priority: "normal", assignedAt: -3.5, dueAt: -0.8, status: "review",
    photoProof: true, reviewRequired: true, hasReferencePhoto: false, hasReferenceVideo: false,
    completionNote: "14 cartons labelled and cross-checked with the sheet.",
    completionPhoto: true, returnCount: 0,
    history: [
      { at: ts(-3.5), by: "Admin Manager", text: "Task assigned to Pooja Verma" },
      { at: ts(-0.8), by: "Pooja Verma", text: "Marked complete with photo proof" },
    ],
  },
  {
    id: "T-510", icon: "🔢", titleEn: "Check product quantity before packing", titleHi: "पैकिंग से पहले गिनती जाँचें",
    role: "packing", assignee: "Pooja Verma", originalAssignee: "Pooja Verma", location: "Store room",
    instructionsEn: "Count each item against the order sheet and report any shortage.",
    instructionsHi: "ऑर्डर शीट से हर सामान गिनें और कमी बताएँ।",
    managerNotes: [],
    steps: [{ text: "Take order sheet", done: false }, { text: "Count items", done: false }],
    priority: "important", assignedAt: -0.3, dueAt: 2.5, status: "assigned",
    photoProof: false, reviewRequired: true, hasReferencePhoto: false, hasReferenceVideo: false, returnCount: 0,
    history: [{ at: ts(-0.3), by: "Admin Manager", text: "Task assigned to Pooja Verma" }],
  },
  {
    id: "T-511", icon: "🚚", titleEn: "Move packed cartons to dispatch", titleHi: "पैक कार्टन डिस्पैच में ले जाएँ",
    role: "packing", assignee: "Mohit Sharma", originalAssignee: "Mohit Sharma", location: "Dispatch bay",
    instructionsEn: "Use the trolley. Stack maximum 4 cartons high.",
    instructionsHi: "ट्रॉली इस्तेमाल करें। ज़्यादा से ज़्यादा 4 कार्टन ऊपर रखें।",
    managerNotes: [],
    steps: [{ text: "Use trolley", done: true }, { text: "Stack safely", done: true }],
    priority: "normal", assignedAt: -9, dueAt: -7, status: "approved",
    photoProof: true, reviewRequired: true, hasReferencePhoto: false, hasReferenceVideo: false,
    completionNote: "All 11 cartons moved.", completionPhoto: true, returnCount: 0,
    history: [
      { at: ts(-9), by: "Admin Manager", text: "Task assigned to Mohit Sharma" },
      { at: ts(-7.4), by: "Mohit Sharma", text: "Marked complete with photo proof" },
      { at: ts(-7), by: "Admin Manager", text: "Approved — performance updated" },
    ],
  },
];

function isOverdue(t: SupportTask) {
  return (
    t.dueAt < 0 &&
    (t.status === "assigned" || t.status === "in-progress" || t.status === "returned")
  );
}
function dueSoon(t: SupportTask) {
  return t.dueAt >= 0 && t.dueAt <= 1 && (t.status === "assigned" || t.status === "in-progress");
}

function stamp() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const STATUS_TABS: { key: string; en: string; hi: string }[] = [
  { key: "all", en: "All", hi: "सभी" },
  { key: "assigned", en: "Assigned", hi: "सौंपे गए" },
  { key: "in-progress", en: "In Progress", hi: "चल रहे" },
  { key: "review", en: "Waiting for Review", hi: "रिव्यू बाकी" },
  { key: "overdue", en: "Overdue", hi: "देरी" },
  { key: "approved", en: "Approved", hi: "मंज़ूर" },
  { key: "returned", en: "Returned", hi: "वापस" },
];

export function StaffTasks({ onGo }: { onGo?: (s: string) => void }) {
  const [lang, setLang] = useState<Lang>("en");
  const [tasks, setTasks] = useState<SupportTask[]>(SEED);
  const [roleTab, setRoleTab] = useState<"all" | StaffRole>("all");
  const [statusTab, setStatusTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [fStaff, setFStaff] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fLocation, setFLocation] = useState("all");
  const [fDue, setFDue] = useState("all");

  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [reassignTo, setReassignTo] = useState("");
  const [dueDraft, setDueDraft] = useState("");
  const [cancelFor, setCancelFor] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [historyFor, setHistoryFor] = useState<string | null>(null);

  const tt = (k: keyof typeof L) => L[k][lang];
  const open = tasks.find((t) => t.id === openId) ?? null;
  const historyTask = tasks.find((t) => t.id === historyFor) ?? null;

  const activeCount = tasks.filter((t) =>
    ["assigned", "in-progress", "review", "returned"].includes(t.status),
  ).length;
  const overdueCount = tasks.filter(isOverdue).length;
  const completedToday = tasks.filter((t) => t.status === "approved").length;

  const patch = (id: string, fn: (t: SupportTask) => SupportTask) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));

  const addHistory = (t: SupportTask, text: string, by = "Admin Manager"): SupportTask => ({
    ...t,
    history: [...t.history, { at: stamp(), by, text }],
  });

  const visible = useMemo(() => {
    let list = tasks.filter((t) => t.status !== "cancelled" || statusTab === "all");
    if (roleTab !== "all") list = list.filter((t) => t.role === roleTab);
    if (statusTab === "overdue") list = list.filter(isOverdue);
    else if (statusTab !== "all") list = list.filter((t) => t.status === statusTab);
    if (fStaff !== "all") list = list.filter((t) => t.assignee === fStaff);
    if (fPriority !== "all") list = list.filter((t) => t.priority === fPriority);
    if (fLocation !== "all") list = list.filter((t) => t.location === fLocation);
    if (fDue === "overdue") list = list.filter(isOverdue);
    if (fDue === "1h") list = list.filter(dueSoon);
    if (fDue === "today") list = list.filter((t) => t.dueAt >= 0 && t.dueAt <= 12);

    const score = (t: SupportTask) => {
      let s = 0;
      if (isOverdue(t)) s -= 1000;
      if (t.priority === "urgent") s -= 500;
      if (t.priority === "important") s -= 200;
      if (t.status === "review") s -= 100;
      if (t.status === "approved") s += 500;
      return s + t.dueAt;
    };
    return [...list].sort((a, b) => score(a) - score(b));
  }, [tasks, roleTab, statusTab, fStaff, fPriority, fLocation, fDue]);

  const staffOptions = useMemo(
    () => (roleTab === "all" ? STAFF : STAFF.filter((s) => s.role === roleTab)),
    [roleTab],
  );

  const changePriority = (id: string, p: Priority) =>
    patch(id, (t) =>
      addHistory({ ...t, priority: p }, `Priority changed to ${PRIORITY_META[p].en}`),
    );

  const sendForReview = (id: string) =>
    patch(id, (t) =>
      addHistory({ ...t, status: "review" }, "Sent for manager review"),
    );

  const doReassign = (id: string) => {
    const member = STAFF.find((s) => s.name === reassignTo);
    if (!member) {
      toast.error(lang === "en" ? "Select a staff member" : "स्टाफ चुनें");
      return;
    }
    patch(id, (t) =>
      addHistory(
        { ...t, assignee: member.name, role: member.role },
        `Reassigned to ${member.name} (original: ${t.originalAssignee})`,
      ),
    );
    setReassignTo("");
    toast.success(lang === "en" ? `Reassigned to ${member.name}` : `${member.name} को दिया गया`);
  };

  const saveDue = (id: string) => {
    if (!dueDraft) return;
    const hoursFromNow = (new Date(dueDraft).getTime() - Date.now()) / 3600_000;
    patch(id, (t) =>
      addHistory(
        { ...t, dueAt: hoursFromNow },
        `Due time changed to ${new Date(dueDraft).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`,
      ),
    );
    setDueDraft("");
    toast.success(lang === "en" ? "Due time updated" : "समय बदल गया");
  };

  const addNote = (id: string) => {
    if (!noteDraft.trim()) return;
    patch(id, (t) =>
      addHistory(
        { ...t, managerNotes: [...t.managerNotes, noteDraft.trim()] },
        `Manager instruction added: "${noteDraft.trim()}"`,
      ),
    );
    setNoteDraft("");
    toast.success(lang === "en" ? "Instruction added" : "निर्देश जुड़ गया");
  };

  const confirmCancel = () => {
    if (!cancelFor) return;
    if (!cancelReason.trim()) {
      toast.error(lang === "en" ? "Cancellation reason is required" : "रद्द करने का कारण ज़रूरी है");
      return;
    }
    patch(cancelFor, (t) =>
      addHistory(
        { ...t, status: "cancelled", cancelReason: cancelReason.trim() },
        `Task cancelled: ${cancelReason.trim()}`,
      ),
    );
    setCancelFor(null);
    setCancelReason("");
    setOpenId(null);
    toast.success(lang === "en" ? "Task cancelled" : "काम रद्द हुआ");
  };

  const cardTone = (t: SupportTask) => {
    if (isOverdue(t) || t.priority === "urgent") return "border-destructive/50 bg-destructive/5";
    if (t.status === "approved") return "border-emerald-500/40 bg-emerald-500/5";
    if (t.status === "review") return "border-blue-500/40 bg-blue-500/5";
    if (dueSoon(t)) return "border-amber-500/50 bg-amber-500/5";
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">{tt("title")}</h1>
          <p className="text-sm text-muted-foreground">{tt("subtitle")}</p>
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
          <Button onClick={() => onGo?.("assign")}>
            <Plus className="mr-2 h-4 w-4" />
            {tt("assignBtn")}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <ListChecks className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground">{tt("active")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={overdueCount ? "border-destructive/50" : ""}>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
              <p className="text-xs text-muted-foreground">{tt("overdue")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-xs text-muted-foreground">{tt("completedToday")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {([["all", lang === "en" ? "All Staff" : "सभी स्टाफ"]] as [string, string][])
          .concat((Object.keys(ROLE_META) as StaffRole[]).map((r) => [r, ROLE_META[r].label]))
          .map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setRoleTab(key as "all" | StaffRole);
                setFStaff("all");
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                roleTab === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
      </div>

      {/* Status tabs + filter toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {STATUS_TABS.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusTab(s.key)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                statusTab === s.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {lang === "en" ? s.en : s.hi}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
          <Filter className="mr-2 h-4 w-4" />
          {tt("filters")}
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={fStaff} onValueChange={setFStaff}>
              <SelectTrigger><SelectValue placeholder="Staff" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "en" ? "All staff members" : "सभी स्टाफ"}</SelectItem>
                {staffOptions.map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fPriority} onValueChange={setFPriority}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "en" ? "All priorities" : "सभी प्राथमिकता"}</SelectItem>
                {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                  <SelectItem key={p} value={p}>{PRIORITY_META[p][lang]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fLocation} onValueChange={setFLocation}>
              <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "en" ? "All locations" : "सभी जगह"}</SelectItem>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fDue} onValueChange={setFDue}>
              <SelectTrigger><SelectValue placeholder="Due" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "en" ? "Any due time" : "कोई भी समय"}</SelectItem>
                <SelectItem value="overdue">{lang === "en" ? "Overdue" : "देरी"}</SelectItem>
                <SelectItem value="1h">{lang === "en" ? "Due within 1 hour" : "1 घंटे में"}</SelectItem>
                <SelectItem value="today">{lang === "en" ? "Due today" : "आज"}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="justify-self-start"
              onClick={() => {
                setFStaff("all"); setFPriority("all"); setFLocation("all"); setFDue("all");
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {lang === "en" ? "Reset filters" : "फ़िल्टर हटाएँ"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Task cards */}
      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map((t) => (
          <Card key={t.id} className={cardTone(t)}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                  {t.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold leading-tight">
                    {lang === "en" ? t.titleEn : t.titleHi}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={PRIORITY_META[t.priority].cls}>
                      {PRIORITY_META[t.priority][lang]}
                    </Badge>
                    <Badge variant="outline" className={STATUS_META[t.status].cls}>
                      {STATUS_META[t.status][lang]}
                    </Badge>
                    {isOverdue(t) && (
                      <Badge variant="destructive">{lang === "en" ? "Overdue" : "देरी"}</Badge>
                    )}
                    {dueSoon(t) && (
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {lang === "en" ? "Due in 1 hour" : "1 घंटे में"}
                      </Badge>
                    )}
                    {t.returnCount > 1 && (
                      <Badge variant="destructive">
                        {lang === "en" ? `Returned ${t.returnCount}×` : `${t.returnCount} बार वापस`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials(t.assignee)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium leading-tight">{t.assignee}</div>
                  <div className="text-xs text-muted-foreground">{ROLE_META[t.role].label}</div>
                </div>
              </div>

              <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {t.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {lang === "en" ? "Assigned" : "सौंपा"}: {ts(t.assignedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {t.photoProof
                    ? t.completionPhoto
                      ? lang === "en" ? "Photo proof received" : "फ़ोटो प्रूफ़ मिला"
                      : lang === "en" ? "Photo proof pending" : "फ़ोटो प्रूफ़ बाकी"
                    : lang === "en" ? "No photo needed" : "फ़ोटो ज़रूरी नहीं"}
                </span>
                <span
                  className={`flex items-center gap-1.5 ${isOverdue(t) ? "font-medium text-destructive" : ""}`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {lang === "en" ? "Due" : "समय"}: {ts(t.dueAt)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setOpenId(t.id)}>
                  {tt("view")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.info(lang === "en" ? `Calling ${t.assignee} — coming soon` : `${t.assignee} को कॉल — जल्द आ रहा है`)
                  }
                >
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  {lang === "en" ? "Call" : "कॉल"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setHistoryFor(t.id)}>
                  <History className="mr-1.5 h-3.5 w-3.5" />
                  {lang === "en" ? "History" : "इतिहास"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {visible.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
              <Users className="h-8 w-8" />
              {tt("noTasks")}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-left">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-2xl">
                    {open.icon}
                  </span>
                  <span>
                    <span className="block">{lang === "en" ? open.titleEn : open.titleHi}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {open.id} · {ROLE_META[open.role].label}
                    </span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={STATUS_META[open.status].cls}>
                    {STATUS_META[open.status][lang]}
                  </Badge>
                  <Badge variant="outline" className={PRIORITY_META[open.priority].cls}>
                    {PRIORITY_META[open.priority][lang]}
                  </Badge>
                  {open.reviewRequired && (
                    <Badge variant="outline">{lang === "en" ? "Review required" : "रिव्यू ज़रूरी"}</Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials(open.assignee)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">{open.assignee}</div>
                    <div className="text-xs text-muted-foreground">
                      {open.assignee !== open.originalAssignee
                        ? `${lang === "en" ? "Originally" : "पहले"}: ${open.originalAssignee}`
                        : STAFF.find((s) => s.name === open.assignee)?.shift}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    onClick={() => toast.info(lang === "en" ? "Calling — coming soon" : "कॉल — जल्द आ रहा है")}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">{lang === "en" ? "Location" : "जगह"}</div>
                    {open.location}
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">{lang === "en" ? "Start" : "शुरू"}</div>
                    {ts(open.assignedAt)}
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">{lang === "en" ? "Due" : "समय"}</div>
                    <span className={isOverdue(open) ? "font-medium text-destructive" : ""}>
                      {ts(open.dueAt)}
                    </span>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      {lang === "en" ? "Photo proof" : "फ़ोटो प्रूफ़"}
                    </div>
                    {open.photoProof ? (lang === "en" ? "Required" : "ज़रूरी") : lang === "en" ? "Not required" : "ज़रूरी नहीं"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="rounded-md border p-3 text-sm">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      English instructions
                    </div>
                    {open.instructionsEn}
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">हिंदी निर्देश</div>
                    {open.instructionsHi}
                  </div>
                </div>

                {(open.hasReferencePhoto || open.hasReferenceVideo) && (
                  <div className="flex gap-2">
                    {open.hasReferencePhoto && (
                      <div className="flex h-20 flex-1 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {lang === "en" ? "Reference photo" : "रेफ़रेंस फ़ोटो"}
                      </div>
                    )}
                    {open.hasReferenceVideo && (
                      <div className="flex h-20 flex-1 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                        {lang === "en" ? "Reference video" : "रेफ़रेंस वीडियो"}
                      </div>
                    )}
                  </div>
                )}

                {open.steps.length > 0 && (
                  <div>
                    <div className="mb-1.5 text-sm font-medium">
                      {lang === "en" ? "Checklist" : "चेकलिस्ट"}
                    </div>
                    <ul className="space-y-1 text-sm">
                      {open.steps.map((s, i) => (
                        <li key={i} className="flex items-center gap-2">
                          {s.done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <span className="h-4 w-4 rounded border" />
                          )}
                          <span className={s.done ? "text-muted-foreground line-through" : ""}>{s.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(open.completionNote || open.completionPhoto) && (
                  <div className="rounded-md border p-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      {lang === "en" ? "Staff completion notes" : "स्टाफ का नोट"}
                    </div>
                    <p className="mt-1 text-sm">{open.completionNote ?? "—"}</p>
                    {open.completionPhoto && (
                      <div className="mt-2 flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {lang === "en" ? "Completion photo" : "पूरा होने की फ़ोटो"}
                      </div>
                    )}
                  </div>
                )}

                {open.managerNotes.length > 0 && (
                  <div className="rounded-md border p-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      {lang === "en" ? "Manager instructions" : "मैनेजर के निर्देश"}
                    </div>
                    <ul className="mt-1 space-y-1 text-sm">
                      {open.managerNotes.map((n, i) => (
                        <li key={i}>• {n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {open.status === "approved" ? (
                  <p className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                    {lang === "en"
                      ? "Approved. Staff performance is updated and this task can no longer be edited."
                      : "मंज़ूर। स्टाफ परफ़ॉर्मेंस अपडेट हो गई और अब बदलाव नहीं हो सकता।"}
                  </p>
                ) : open.status === "cancelled" ? (
                  <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    {lang === "en" ? "Cancelled: " : "रद्द: "}
                    {open.cancelReason}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "Change priority" : "प्राथमिकता बदलें"}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                          <Button
                            key={p}
                            size="sm"
                            variant={open.priority === p ? "default" : "outline"}
                            onClick={() => changePriority(open.id, p)}
                          >
                            {PRIORITY_META[p][lang]}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "Change due time" : "समय बदलें"}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="datetime-local"
                          value={dueDraft}
                          onChange={(e) => setDueDraft(e.target.value)}
                        />
                        <Button size="sm" variant="outline" onClick={() => saveDue(open.id)}>
                          {lang === "en" ? "Save" : "सेव"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "Reassign task" : "काम दूसरे को दें"}</Label>
                      <div className="flex gap-2">
                        <Select value={reassignTo} onValueChange={setReassignTo}>
                          <SelectTrigger>
                            <SelectValue placeholder={lang === "en" ? "Select staff" : "स्टाफ चुनें"} />
                          </SelectTrigger>
                          <SelectContent>
                            {STAFF.filter((s) => s.name !== open.assignee).map((s) => (
                              <SelectItem key={s.id} value={s.name}>
                                {s.name} — {ROLE_META[s.role].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => doReassign(open.id)}>
                          {lang === "en" ? "Move" : "बदलें"}
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {lang === "en"
                          ? "Original staff member and full history are preserved. No new task is created."
                          : "पुराना स्टाफ और पूरा इतिहास सुरक्षित रहेगा। नया काम नहीं बनेगा।"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "Add instruction" : "निर्देश जोड़ें"}</Label>
                      <Textarea
                        rows={2}
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder={lang === "en" ? "Extra instruction for staff" : "स्टाफ के लिए अतिरिक्त निर्देश"}
                      />
                      <Button size="sm" variant="outline" onClick={() => addNote(open.id)}>
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        {lang === "en" ? "Add" : "जोड़ें"}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {open.status !== "review" && (
                        <Button size="sm" onClick={() => sendForReview(open.id)}>
                          {lang === "en" ? "Send for Review" : "रिव्यू में भेजें"}
                        </Button>
                      )}
                      {open.status === "review" && (
                        <Button size="sm" variant="outline" onClick={() => onGo?.("review")}>
                          {lang === "en" ? "Open in Review Work" : "रिव्यू वर्क में खोलें"}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setHistoryFor(open.id)}>
                        <History className="mr-2 h-4 w-4" />
                        {lang === "en" ? "Task history" : "काम का इतिहास"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setCancelFor(open.id);
                          setCancelReason("");
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {lang === "en" ? "Cancel task" : "काम रद्द करें"}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-1.5 text-sm font-medium">
                    {lang === "en" ? "Activity history" : "गतिविधि इतिहास"}
                  </div>
                  <div className="space-y-2">
                    {open.history.map((entry, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>
                          {entry.text}
                          <span className="block text-xs text-muted-foreground">
                            {entry.by} · {entry.at}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* History dialog */}
      <Dialog open={!!historyTask} onOpenChange={(o) => !o && setHistoryFor(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {historyTask ? `${historyTask.icon} ${historyTask.titleEn}` : ""}
            </DialogTitle>
            <DialogDescription>
              {lang === "en" ? "Complete activity history" : "पूरा गतिविधि इतिहास"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {historyTask?.history.map((entry, i) => (
              <div key={i} className="rounded-md border p-2 text-sm">
                {entry.text}
                <span className="block text-xs text-muted-foreground">
                  {entry.by} · {entry.at}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={!!cancelFor} onOpenChange={(o) => !o && setCancelFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {lang === "en" ? "Cancel this task?" : "यह काम रद्द करें?"}
            </DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "A reason is required. The task stays in history and is not deleted."
                : "कारण देना ज़रूरी है। काम इतिहास में रहेगा, हटेगा नहीं।"}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder={lang === "en" ? "Reason for cancellation" : "रद्द करने का कारण"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelFor(null)}>
              {lang === "en" ? "Keep task" : "रहने दें"}
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              {lang === "en" ? "Cancel task" : "रद्द करें"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
