import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Coffee,
  Image as ImageIcon,
  ListChecks,
  MapPin,
  Mic,
  Package,
  Plus,
  Repeat,
  SprayCan,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
type Priority = "normal" | "important" | "urgent";
type Repeat = "once" | "daily" | "weekly" | "days" | "monthly";

const T = {
  title: { en: "Assign Tasks", hi: "काम सौंपें" },
  subtitle: {
    en: "Give simple, clear work to pantry, cleaning and packing staff.",
    hi: "पैंट्री, सफाई और पैकिंग स्टाफ को आसान और साफ काम दें।",
  },
  useTemplate: { en: "Use Task Template", hi: "टास्क टेम्पलेट चुनें" },
  chooseCategory: { en: "Choose staff category", hi: "स्टाफ श्रेणी चुनें" },
  taskDetails: { en: "Task details", hi: "काम की जानकारी" },
  taskTitle: { en: "Task title (English)", hi: "काम का नाम (अंग्रेज़ी)" },
  taskTitleHi: { en: "Task title (Hindi)", hi: "काम का नाम (हिंदी)" },
  icon: { en: "Task icon", hi: "टास्क आइकन" },
  staffMember: { en: "Select staff member", hi: "स्टाफ चुनें" },
  location: { en: "Work location", hi: "काम की जगह" },
  priority: { en: "Priority", hi: "प्राथमिकता" },
  start: { en: "Start date & time", hi: "शुरू करने की तारीख़ और समय" },
  due: { en: "Due date & time", hi: "पूरा करने की तारीख़ और समय" },
  instructions: { en: "Simple instructions (English)", hi: "आसान निर्देश (अंग्रेज़ी)" },
  instructionsHi: { en: "Simple instructions (Hindi)", hi: "आसान निर्देश (हिंदी)" },
  checklist: { en: "Checklist steps", hi: "चेकलिस्ट स्टेप्स" },
  addStep: { en: "Add step", hi: "स्टेप जोड़ें" },
  photoProof: { en: "Photo proof required", hi: "फ़ोटो प्रूफ़ ज़रूरी" },
  reviewReq: { en: "Manager review required", hi: "मैनेजर रिव्यू ज़रूरी" },
  repeat: { en: "Repeat task", hi: "काम दोहराएँ" },
  preview: { en: "Staff will see this", hi: "स्टाफ को ऐसा दिखेगा" },
  startWork: { en: "Start Work", hi: "काम शुरू करें" },
  complete: { en: "Complete", hi: "पूरा हुआ" },
  assign: { en: "Assign Task", hi: "काम सौंपें" },
  reset: { en: "Clear form", hi: "फ़ॉर्म खाली करें" },
} as const;

const PRIORITY_LABEL: Record<Priority, { en: string; hi: string }> = {
  normal: { en: "Normal", hi: "सामान्य" },
  important: { en: "Important", hi: "ज़रूरी" },
  urgent: { en: "Urgent", hi: "अत्यावश्यक" },
};

const REPEAT_LABEL: Record<Repeat, { en: string; hi: string }> = {
  once: { en: "One Time", hi: "एक बार" },
  daily: { en: "Daily", hi: "रोज़" },
  weekly: { en: "Weekly", hi: "हफ़्ते में एक बार" },
  days: { en: "Selected Days", hi: "चुने हुए दिन" },
  monthly: { en: "Monthly", hi: "महीने में एक बार" },
};

const WEEKDAYS = [
  { key: "mon", en: "Mon", hi: "सोम" },
  { key: "tue", en: "Tue", hi: "मंगल" },
  { key: "wed", en: "Wed", hi: "बुध" },
  { key: "thu", en: "Thu", hi: "गुरु" },
  { key: "fri", en: "Fri", hi: "शुक्र" },
  { key: "sat", en: "Sat", hi: "शनि" },
  { key: "sun", en: "Sun", hi: "रवि" },
];

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

const ICONS = ["☕", "🧹", "📦", "💧", "🧴", "🚮", "🏷️", "🚚", "🍪", "🪣"];

type Template = {
  id: string;
  role: StaffRole;
  icon: string;
  en: string;
  hi: string;
  location: string;
  instructionsEn: string;
  instructionsHi: string;
  steps: string[];
  photoProof: boolean;
  review: boolean;
  priority: Priority;
};

const TEMPLATES: Template[] = [
  {
    id: "tp1", role: "pantry", icon: "☕", en: "Prepare Tea", hi: "चाय बनाएँ",
    location: "Pantry",
    instructionsEn: "Make fresh tea for the team. Serve in clean cups on a covered tray.",
    instructionsHi: "टीम के लिए ताज़ा चाय बनाएँ। साफ़ कप में ढकी ट्रे से सर्व करें।",
    steps: ["Boil water", "Add tea and sugar", "Serve on clean tray", "Collect used cups"],
    photoProof: false, review: false, priority: "normal",
  },
  {
    id: "tp2", role: "pantry", icon: "💧", en: "Refill Drinking Water", hi: "पीने का पानी भरें",
    location: "All floors",
    instructionsEn: "Check every water dispenser and replace empty cans.",
    instructionsHi: "हर वाटर डिस्पेंसर देखें और खाली कैन बदलें।",
    steps: ["Check all dispensers", "Replace empty cans", "Wipe dispenser top"],
    photoProof: true, review: false, priority: "normal",
  },
  {
    id: "tp3", role: "pantry", icon: "🪣", en: "Clean Pantry", hi: "पैंट्री साफ़ करें",
    location: "Pantry",
    instructionsEn: "Clean the counter, sink and storage shelves. Keep the counter dry.",
    instructionsHi: "काउंटर, सिंक और शेल्फ साफ़ करें। काउंटर सूखा रखें।",
    steps: ["Clear counter", "Wash sink", "Wipe shelves", "Empty pantry bin"],
    photoProof: true, review: true, priority: "normal",
  },
  {
    id: "tp4", role: "pantry", icon: "🍪", en: "Check Pantry Supplies", hi: "पैंट्री सामान जाँचें",
    location: "Pantry",
    instructionsEn: "Count tea, coffee, sugar, cups and biscuits. Raise a request for low items.",
    instructionsHi: "चाय, कॉफ़ी, चीनी, कप और बिस्किट गिनें। कम सामान की रिक्वेस्ट डालें।",
    steps: ["Count each item", "Note low stock", "Raise supply request"],
    photoProof: false, review: true, priority: "normal",
  },
  {
    id: "tc1", role: "cleaning", icon: "🧹", en: "Clean Reception", hi: "रिसेप्शन साफ़ करें",
    location: "Reception",
    instructionsEn: "Mop the floor, wipe the desk and clean the glass door.",
    instructionsHi: "फ़र्श पोंछें, डेस्क साफ़ करें और शीशे का दरवाज़ा साफ़ करें।",
    steps: ["Place wet floor sign", "Mop floor", "Wipe desk", "Clean glass door"],
    photoProof: true, review: true, priority: "important",
  },
  {
    id: "tc2", role: "cleaning", icon: "🧴", en: "Clean Office", hi: "ऑफ़िस साफ़ करें",
    location: "Floor 2 – Ops",
    instructionsEn: "Dust all workstations and mop the walkway.",
    instructionsHi: "सभी वर्कस्टेशन की धूल साफ़ करें और रास्ता पोंछें।",
    steps: ["Dust workstations", "Clean chairs", "Mop walkway"],
    photoProof: true, review: false, priority: "normal",
  },
  {
    id: "tc3", role: "cleaning", icon: "🚿", en: "Clean Washroom", hi: "वॉशरूम साफ़ करें",
    location: "Washroom – Floor 1",
    instructionsEn: "Use toilet cleaner only. Wear gloves. Refill soap and tissue.",
    instructionsHi: "सिर्फ़ टॉयलेट क्लीनर लगाएँ। दस्ताने पहनें। साबुन और टिश्यू भरें।",
    steps: ["Wear gloves", "Apply toilet cleaner", "Scrub and rinse", "Refill soap & tissue", "Dry the floor"],
    photoProof: true, review: true, priority: "important",
  },
  {
    id: "tc4", role: "cleaning", icon: "🚮", en: "Empty Dustbins", hi: "डस्टबिन खाली करें",
    location: "All floors",
    instructionsEn: "Empty every dustbin and put a fresh garbage bag.",
    instructionsHi: "हर डस्टबिन खाली करें और नया कचरा बैग लगाएँ।",
    steps: ["Collect all bins", "Dispose waste", "Put new bags"],
    photoProof: false, review: false, priority: "normal",
  },
  {
    id: "tk1", role: "packing", icon: "📦", en: "Pack Customer Order", hi: "कस्टमर ऑर्डर पैक करें",
    location: "Store room",
    instructionsEn: "Pack the order as per the list. Double-tape the base of the box.",
    instructionsHi: "लिस्ट के अनुसार ऑर्डर पैक करें। बॉक्स के नीचे दो बार टेप लगाएँ।",
    steps: ["Read order list", "Collect items", "Bubble wrap fragile items", "Tape the box"],
    photoProof: true, review: true, priority: "important",
  },
  {
    id: "tk2", role: "packing", icon: "🔢", en: "Check Product Quantity", hi: "सामान की गिनती जाँचें",
    location: "Store room",
    instructionsEn: "Count each item against the order sheet before packing.",
    instructionsHi: "पैक करने से पहले ऑर्डर शीट से हर सामान गिनें।",
    steps: ["Take order sheet", "Count each item", "Report shortage"],
    photoProof: false, review: true, priority: "normal",
  },
  {
    id: "tk3", role: "packing", icon: "🏷️", en: "Attach Label", hi: "लेबल लगाएँ",
    location: "Dispatch bay",
    instructionsEn: "Stick the dispatch label on the top-right side of every carton.",
    instructionsHi: "हर कार्टन के ऊपर दाईं ओर डिस्पैच लेबल चिपकाएँ।",
    steps: ["Print labels", "Match box to label", "Stick on top-right"],
    photoProof: true, review: false, priority: "normal",
  },
  {
    id: "tk4", role: "packing", icon: "🚚", en: "Move Packed Order to Dispatch", hi: "पैक ऑर्डर डिस्पैच में ले जाएँ",
    location: "Dispatch bay",
    instructionsEn: "Move all packed cartons to the dispatch bay and stack them safely.",
    instructionsHi: "सभी पैक कार्टन डिस्पैच बे में ले जाएँ और सुरक्षित रखें।",
    steps: ["Use trolley", "Move cartons", "Stack max 4 high"],
    photoProof: true, review: true, priority: "normal",
  },
];

export type AssignedTask = {
  id: string;
  icon: string;
  titleEn: string;
  titleHi: string;
  role: StaffRole;
  assignee: string;
  location: string;
  instructionsEn: string;
  instructionsHi: string;
  steps: string[];
  priority: Priority;
  startAt: string;
  dueAt: string;
  photoProof: boolean;
  review: boolean;
  repeat: Repeat;
  days: string[];
  history: { at: string; text: string }[];
};

function fmt(dt: string) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function defaultStart() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30 - (d.getMinutes() % 15));
  return d.toISOString().slice(0, 16);
}
function defaultDue() {
  const d = new Date();
  d.setHours(d.getHours() + 3);
  return d.toISOString().slice(0, 16);
}

export function AssignTasks({ onGo }: { onGo?: (s: string) => void }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: keyof typeof T) => T[k][lang];

  const [role, setRole] = useState<StaffRole>("cleaning");
  const [icon, setIcon] = useState("🧹");
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [assignee, setAssignee] = useState("");
  const [location, setLocation] = useState("");
  const [instrEn, setInstrEn] = useState("");
  const [instrHi, setInstrHi] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [stepDraft, setStepDraft] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [startAt, setStartAt] = useState(defaultStart());
  const [dueAt, setDueAt] = useState(defaultDue());
  const [photoProof, setPhotoProof] = useState(true);
  const [review, setReview] = useState(true);
  const [repeat, setRepeat] = useState<Repeat>("once");
  const [days, setDays] = useState<string[]>([]);
  const [refPhoto, setRefPhoto] = useState(false);
  const [refVideo, setRefVideo] = useState(false);
  const [refVoice, setRefVoice] = useState(false);

  const [templateOpen, setTemplateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assigned, setAssigned] = useState<AssignedTask[]>([]);
  const [success, setSuccess] = useState<AssignedTask | null>(null);

  const roleStaff = useMemo(() => STAFF.filter((s) => s.role === role), [role]);
  const roleTemplates = useMemo(() => TEMPLATES.filter((x) => x.role === role), [role]);

  const resetForm = (keepRole = true) => {
    if (!keepRole) setRole("cleaning");
    setIcon("🧹");
    setTitleEn(""); setTitleHi(""); setAssignee(""); setLocation("");
    setInstrEn(""); setInstrHi(""); setSteps([]); setStepDraft("");
    setPriority("normal"); setStartAt(defaultStart()); setDueAt(defaultDue());
    setPhotoProof(true); setReview(true); setRepeat("once"); setDays([]);
    setRefPhoto(false); setRefVideo(false); setRefVoice(false);
  };

  const applyTemplate = (tp: Template) => {
    setRole(tp.role);
    setIcon(tp.icon);
    setTitleEn(tp.en);
    setTitleHi(tp.hi);
    setLocation(tp.location);
    setInstrEn(tp.instructionsEn);
    setInstrHi(tp.instructionsHi);
    setSteps([...tp.steps]);
    setPhotoProof(tp.photoProof);
    setReview(tp.review);
    setPriority(tp.priority);
    setAssignee("");
    setTemplateOpen(false);
    toast.success(lang === "en" ? `Template loaded: ${tp.en}` : `टेम्पलेट लोड हुआ: ${tp.hi}`);
  };

  const validate = () => {
    if (!titleEn.trim()) return lang === "en" ? "Enter a task title." : "काम का नाम भरें।";
    if (!assignee) return lang === "en" ? "Select one staff member." : "एक स्टाफ चुनें।";
    if (!location) return lang === "en" ? "Select the work location." : "काम की जगह चुनें।";
    if (!dueAt) return lang === "en" ? "Set a due date and time." : "पूरा करने का समय भरें।";
    if (startAt && dueAt && new Date(dueAt) <= new Date(startAt))
      return lang === "en" ? "Due time must be after start time." : "पूरा करने का समय शुरू के बाद होना चाहिए।";
    if (repeat === "days" && days.length === 0)
      return lang === "en" ? "Pick at least one day." : "कम से कम एक दिन चुनें।";
    return null;
  };

  const tryAssign = () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (priority === "urgent" || repeat !== "once") {
      setConfirmOpen(true);
      return;
    }
    doAssign();
  };

  const doAssign = () => {
    const now = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
    const task: AssignedTask = {
      id: `T-${500 + assigned.length + 1}`,
      icon, titleEn: titleEn.trim(), titleHi: titleHi.trim() || titleEn.trim(),
      role, assignee, location,
      instructionsEn: instrEn.trim(), instructionsHi: instrHi.trim() || instrEn.trim(),
      steps, priority, startAt, dueAt, photoProof, review, repeat, days,
      history: [
        { at: now, text: `Assigned to ${assignee} by Administration Manager` },
        ...(repeat !== "once"
          ? [{ at: now, text: `Schedule created: ${REPEAT_LABEL[repeat].en}${repeat === "days" ? ` (${days.join(", ")})` : ""}` }]
          : []),
      ],
    };
    setAssigned((p) => [task, ...p]);
    setConfirmOpen(false);
    setSuccess(task);
  };

  const scheduleNote = useMemo(() => {
    if (repeat === "once") return lang === "en" ? "Runs one time only." : "सिर्फ़ एक बार चलेगा।";
    if (repeat === "days")
      return lang === "en"
        ? `Instances will be created on: ${days.length ? days.join(", ") : "—"}`
        : `इन दिनों पर काम बनेगा: ${days.length ? days.join(", ") : "—"}`;
    return lang === "en"
      ? `Instances will be created ${REPEAT_LABEL[repeat].en.toLowerCase()} from the start date. The template is saved once.`
      : `शुरू की तारीख़ से ${REPEAT_LABEL[repeat].hi} काम बनेगा। टेम्पलेट एक ही बार सेव होगा।`;
  }, [repeat, days, lang]);

  if (success) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Card className="border-primary/40">
          <CardContent className="space-y-4 p-6 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <div>
              <h2 className="text-xl font-bold">
                {lang === "en" ? "Task assigned successfully." : "काम सफलतापूर्वक सौंपा गया।"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {success.icon} {lang === "en" ? success.titleEn : success.titleHi} · {success.assignee} ·{" "}
                {fmt(success.dueAt)}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                onClick={() => {
                  setSuccess(null);
                  resetForm();
                }}
              >
                {lang === "en" ? "Assign Another Task" : "और काम सौंपें"}
              </Button>
              <Button variant="outline" onClick={() => onGo?.("staff-tasks")}>
                {lang === "en" ? "View Staff Tasks" : "स्टाफ टास्क देखें"}
              </Button>
              <Button variant="outline" onClick={() => onGo?.("dashboard")}>
                {lang === "en" ? "Return to Dashboard" : "डैशबोर्ड पर जाएँ"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {lang === "en" ? "Activity history" : "गतिविधि इतिहास"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {success.history.map((h, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>
                  {h.text}
                  <span className="block text-xs text-muted-foreground">{h.at}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
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
          <Button variant="outline" onClick={() => setTemplateOpen(true)}>
            <ListChecks className="mr-2 h-4 w-4" />
            {t("useTemplate")}
          </Button>
        </div>
      </div>

      {/* Category cards */}
      <div>
        <div className="mb-2 text-sm font-medium">{t("chooseCategory")}</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(ROLE_META) as StaffRole[]).map((r) => {
            const Icon = ROLE_META[r].icon;
            const active = role === r;
            return (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setAssignee("");
                  setIcon(r === "pantry" ? "☕" : r === "cleaning" ? "🧹" : "📦");
                }}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-semibold">{ROLE_META[r].label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {STAFF.filter((s) => s.role === r).length}{" "}
                    {lang === "en" ? "staff available" : "स्टाफ उपलब्ध"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("taskDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("taskTitle")}</Label>
                  <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Clean Reception" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("taskTitleHi")}</Label>
                  <Input value={titleHi} onChange={(e) => setTitleHi(e.target.value)} placeholder="रिसेप्शन साफ़ करें" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("icon")}</Label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`h-10 w-10 rounded-lg border text-lg transition-colors ${
                        icon === ic ? "border-primary bg-primary/10" : "bg-background hover:bg-muted"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("staffMember")}</Label>
                  <Select value={assignee} onValueChange={setAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder={ROLE_META[role].label} />
                    </SelectTrigger>
                    <SelectContent>
                      {roleStaff.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name} · {s.shift}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("location")}</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder={lang === "en" ? "Select location" : "जगह चुनें"} />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("priority")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["normal", "important", "urgent"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        priority === p
                          ? p === "urgent"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-primary bg-primary/10 text-primary"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {PRIORITY_LABEL[p][lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("start")}</Label>
                  <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("due")}</Label>
                  <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("instructions")}</Label>
                  <Textarea rows={3} value={instrEn} onChange={(e) => setInstrEn(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("instructionsHi")}</Label>
                  <Textarea rows={3} value={instrHi} onChange={(e) => setInstrHi(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={refPhoto ? "secondary" : "outline"}
                  onClick={() => setRefPhoto((v) => !v)}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {lang === "en" ? "Reference photo" : "रेफ़रेंस फ़ोटो"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={refVideo ? "secondary" : "outline"}
                  onClick={() => setRefVideo((v) => !v)}
                >
                  <Video className="mr-2 h-4 w-4" />
                  {lang === "en" ? "Short video" : "छोटा वीडियो"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={refVoice ? "secondary" : "outline"}
                  onClick={() => setRefVoice((v) => !v)}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {lang === "en" ? "Voice instruction" : "आवाज़ निर्देश"}
                </Button>
              </div>
              {(refPhoto || refVideo || refVoice) && (
                <p className="text-xs text-muted-foreground">
                  {lang === "en"
                    ? "Attachment placeholders added. Upload and recording will be enabled later."
                    : "अटैचमेंट प्लेसहोल्डर जुड़ गए। अपलोड और रिकॉर्डिंग बाद में चालू होगी।"}
                </p>
              )}

              <div className="space-y-2">
                <Label>{t("checklist")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={stepDraft}
                    onChange={(e) => setStepDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && stepDraft.trim()) {
                        e.preventDefault();
                        setSteps((p) => [...p, stepDraft.trim()]);
                        setStepDraft("");
                      }
                    }}
                    placeholder={lang === "en" ? "e.g. Mop the floor" : "जैसे: फ़र्श पोंछें"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!stepDraft.trim()) return;
                      setSteps((p) => [...p, stepDraft.trim()]);
                      setStepDraft("");
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t("addStep")}
                  </Button>
                </div>
                {steps.length > 0 && (
                  <ol className="space-y-1.5">
                    {steps.map((s, i) => (
                      <li
                        key={`${s}-${i}`}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span>
                          {i + 1}. {s}
                        </span>
                        <button
                          onClick={() => setSteps((p) => p.filter((_, x) => x !== i))}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove step"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label className="text-sm">{t("photoProof")}</Label>
                  <Switch checked={photoProof} onCheckedChange={setPhotoProof} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label className="text-sm">{t("reviewReq")}</Label>
                  <Switch checked={review} onCheckedChange={setReview} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Repeat className="h-4 w-4" />
                {t("repeat")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(Object.keys(REPEAT_LABEL) as Repeat[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRepeat(r)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      repeat === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {REPEAT_LABEL[r][lang]}
                  </button>
                ))}
              </div>
              {repeat === "days" && (
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.key}
                      onClick={() =>
                        setDays((p) => (p.includes(d.en) ? p.filter((x) => x !== d.en) : [...p, d.en]))
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        days.includes(d.en)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {lang === "en" ? d.en : d.hi}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{scheduleNote}</p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={tryAssign}>
              {t("assign")}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => resetForm()}>
              {t("reset")}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("preview")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-background p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl">
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-lg font-bold">
                      {(lang === "en" ? titleEn : titleHi || titleEn) ||
                        (lang === "en" ? "Task name" : "काम का नाम")}
                    </div>
                    {priority !== "normal" && (
                      <Badge
                        variant={priority === "urgent" ? "destructive" : "secondary"}
                        className="mt-1"
                      >
                        {PRIORITY_LABEL[priority][lang]}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {location || (lang === "en" ? "Work location" : "काम की जगह")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {lang === "en" ? "Due" : "समय"}: {fmt(dueAt)}
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line rounded-md bg-muted/50 p-3 text-sm">
                  {(lang === "en" ? instrEn : instrHi || instrEn) ||
                    (lang === "en" ? "Simple instructions will appear here." : "यहाँ आसान निर्देश दिखेंगे।")}
                </p>

                {steps.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {steps.map((s, i) => (
                      <li key={`${s}-p${i}`} className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded border" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}

                {(photoProof || review) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {photoProof && (
                      <Badge variant="outline">
                        {lang === "en" ? "Photo proof needed" : "फ़ोटो प्रूफ़ चाहिए"}
                      </Badge>
                    )}
                    {review && (
                      <Badge variant="outline">
                        {lang === "en" ? "Manager will check" : "मैनेजर जाँचेंगे"}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button size="lg" disabled>
                    {t("startWork")}
                  </Button>
                  <Button size="lg" variant="outline" disabled>
                    {t("complete")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {assigned.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {lang === "en" ? "Assigned in this session" : "इस सेशन में सौंपे गए"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {assigned.map((a) => (
                  <div key={a.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {a.icon} {a.titleEn}
                      </span>
                      {a.priority === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.id} · {a.assignee} · {a.location} · {fmt(a.dueAt)}
                      {a.repeat !== "once" && ` · ${REPEAT_LABEL[a.repeat].en}`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Templates dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("useTemplate")}</DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "Pick a ready task. You can still change every field before assigning."
                : "तैयार काम चुनें। सौंपने से पहले सब कुछ बदल सकते हैं।"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(Object.keys(ROLE_META) as StaffRole[]).map((r) => (
              <div key={r}>
                <div className="mb-2 text-sm font-semibold">{ROLE_META[r].label}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TEMPLATES.filter((x) => x.role === r).map((tp) => (
                    <button
                      key={tp.id}
                      onClick={() => applyTemplate(tp)}
                      className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/60"
                    >
                      <span className="text-2xl">{tp.icon}</span>
                      <span>
                        <span className="block text-sm font-medium">{tp.en}</span>
                        <span className="block text-xs text-muted-foreground">{tp.hi}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {lang === "en" ? "Please confirm" : "कृपया पुष्टि करें"}
            </DialogTitle>
            <DialogDescription>
              {priority === "urgent"
                ? lang === "en"
                  ? `This urgent task will appear first on ${assignee}'s Home page.`
                  : `यह अत्यावश्यक काम ${assignee} के होम पेज पर सबसे ऊपर दिखेगा।`
                : lang === "en"
                  ? `A repeating schedule (${REPEAT_LABEL[repeat].en}) will create task instances automatically.`
                  : `दोहराने वाला शेड्यूल (${REPEAT_LABEL[repeat].hi}) अपने आप काम बनाएगा।`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-3 text-sm">
            {icon} <span className="font-medium">{titleEn}</span>
            <span className="block text-xs text-muted-foreground">
              {assignee} · {location} · {fmt(dueAt)}
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              {lang === "en" ? "Cancel" : "रद्द करें"}
            </Button>
            <Button onClick={doAssign}>{t("assign")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
