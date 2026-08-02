import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  History,
  ImageIcon,
  Mic,
  RotateCcw,
  ShieldAlert,
  Star,
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
type ReviewStatus = "review" | "approved" | "returned" | "cancelled";
type Quality = "good" | "acceptable" | "excellent";

type ReviewEntry = {
  at: string;
  by: string;
  decision: "approved" | "returned" | "problem" | "submitted";
  text: string;
};

type Submission = {
  id: string;
  icon: string;
  titleEn: string;
  titleHi: string;
  role: StaffRole;
  assignee: string;
  location: string;
  instructionsEn: string;
  instructionsHi: string;
  requiredChecklist: string[];
  staffChecklist: boolean[];
  dueMins: number; // minutes offset from now (negative = past)
  submittedMins: number;
  status: ReviewStatus;
  staffNote: string;
  hasVoiceNote: boolean;
  hasReferencePhoto: boolean;
  hasBeforePhoto: boolean;
  returnCount: number;
  quality?: Quality;
  history: ReviewEntry[];
};

const NOW = Date.now();
const fmtMins = (m: number) =>
  new Date(NOW + m * 60_000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function stamp() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const SEED: Submission[] = [
  {
    id: "T-502", icon: "💧", titleEn: "Refill drinking water cans", titleHi: "पीने का पानी भरें",
    role: "pantry", assignee: "Ramesh Kumar", location: "All floors",
    instructionsEn: "Check every dispenser and replace empty cans. Wipe the dispenser top.",
    instructionsHi: "हर डिस्पेंसर देखें और खाली कैन बदलें। ऊपर का हिस्सा पोंछें।",
    requiredChecklist: ["Check all dispensers", "Replace empty cans", "Wipe dispenser top"],
    staffChecklist: [true, true, true],
    dueMins: -180, submittedMins: -165, status: "review",
    staffNote: "All 6 dispensers refilled. Floor 2 can was leaking, kept aside for return.",
    hasVoiceNote: true, hasReferencePhoto: true, hasBeforePhoto: true, returnCount: 0,
    history: [{ at: fmtMins(-165), by: "Ramesh Kumar", decision: "submitted", text: "Submitted with photo proof" }],
  },
  {
    id: "T-509", icon: "🏷️", titleEn: "Attach dispatch labels – Indore", titleHi: "डिस्पैच लेबल लगाएँ – इंदौर",
    role: "packing", assignee: "Pooja Verma", location: "Dispatch bay",
    instructionsEn: "Stick the dispatch label on the top-right side of every carton.",
    instructionsHi: "हर कार्टन के ऊपर दाईं ओर डिस्पैच लेबल चिपकाएँ।",
    requiredChecklist: ["Print labels", "Match box to label", "Stick on top-right"],
    staffChecklist: [true, true, true],
    dueMins: -95, submittedMins: -48, status: "review",
    staffNote: "14 cartons labelled and cross-checked with the dispatch sheet.",
    hasVoiceNote: false, hasReferencePhoto: false, hasBeforePhoto: false, returnCount: 0,
    history: [{ at: fmtMins(-48), by: "Pooja Verma", decision: "submitted", text: "Submitted with photo proof" }],
  },
  {
    id: "T-504", icon: "🚿", titleEn: "Washroom deep clean", titleHi: "वॉशरूम की गहरी सफाई",
    role: "cleaning", assignee: "Sunita Devi", location: "Washroom – Floor 1",
    instructionsEn: "Wear gloves. Use toilet cleaner only. Refill soap and tissue. Dry the floor.",
    instructionsHi: "दस्ताने पहनें। सिर्फ़ टॉयलेट क्लीनर लगाएँ। साबुन और टिश्यू भरें। फ़र्श सुखाएँ।",
    requiredChecklist: ["Wear gloves", "Apply toilet cleaner", "Scrub and rinse", "Refill soap & tissue", "Dry the floor"],
    staffChecklist: [true, true, true, false, true],
    dueMins: -240, submittedMins: -30, status: "review",
    staffNote: "Cleaned the washroom. Tissue rolls were finished in the store room.",
    hasVoiceNote: true, hasReferencePhoto: true, hasBeforePhoto: true, returnCount: 2,
    history: [
      { at: fmtMins(-270), by: "Sunita Devi", decision: "submitted", text: "Submitted with photo proof" },
      { at: fmtMins(-250), by: "Admin Manager", decision: "returned", text: "Returned: floor still wet" },
      { at: fmtMins(-200), by: "Sunita Devi", decision: "submitted", text: "Re-submitted" },
      { at: fmtMins(-190), by: "Admin Manager", decision: "returned", text: "Returned: tissue not refilled" },
      { at: fmtMins(-30), by: "Sunita Devi", decision: "submitted", text: "Re-submitted with photo proof" },
    ],
  },
  {
    id: "T-512", icon: "🧹", titleEn: "Mop cafeteria floor", titleHi: "कैफ़ेटेरिया का फ़र्श पोंछें",
    role: "cleaning", assignee: "Arjun Yadav", location: "Cafeteria",
    instructionsEn: "Place the wet floor sign, mop the full floor and clear the bins.",
    instructionsHi: "वेट फ़्लोर साइन लगाएँ, पूरा फ़र्श पोंछें और डस्टबिन खाली करें।",
    requiredChecklist: ["Place wet floor sign", "Mop full floor", "Clear bins"],
    staffChecklist: [true, true, false],
    dueMins: -60, submittedMins: -12, status: "review",
    staffNote: "Floor mopped. Bin bags were over — will clear after supply arrives.",
    hasVoiceNote: false, hasReferencePhoto: false, hasBeforePhoto: true, returnCount: 1,
    history: [
      { at: fmtMins(-140), by: "Arjun Yadav", decision: "submitted", text: "Submitted" },
      { at: fmtMins(-120), by: "Admin Manager", decision: "returned", text: "Returned: corner area missed" },
      { at: fmtMins(-12), by: "Arjun Yadav", decision: "submitted", text: "Re-submitted with photo proof" },
    ],
  },
  {
    id: "T-513", icon: "📦", titleEn: "Pack branding kit – Jaipur", titleHi: "ब्रांडिंग किट पैक करें – जयपुर",
    role: "packing", assignee: "Mohit Sharma", location: "Store room",
    instructionsEn: "Pack the branding kit as per the checklist and double-tape the base.",
    instructionsHi: "चेकलिस्ट अनुसार ब्रांडिंग किट पैक करें और नीचे दो बार टेप लगाएँ।",
    requiredChecklist: ["Collect items", "Bubble wrap fragile", "Double tape base", "Label the box"],
    staffChecklist: [true, true, true, true],
    dueMins: -20, submittedMins: -5, status: "review",
    staffNote: "Kit packed and taped. Box weight 8.4 kg.",
    hasVoiceNote: false, hasReferencePhoto: true, hasBeforePhoto: false, returnCount: 0,
    history: [{ at: fmtMins(-5), by: "Mohit Sharma", decision: "submitted", text: "Submitted with photo proof" }],
  },
  {
    id: "T-505", icon: "🧹", titleEn: "Clean reception area", titleHi: "रिसेप्शन साफ़ करें",
    role: "cleaning", assignee: "Sunita Devi", location: "Reception",
    instructionsEn: "Mop floor, wipe desk, clean the glass door.",
    instructionsHi: "फ़र्श पोंछें, डेस्क साफ़ करें, शीशे का दरवाज़ा साफ़ करें।",
    requiredChecklist: ["Wet floor sign", "Mop floor", "Clean glass"],
    staffChecklist: [true, true, true],
    dueMins: -360, submittedMins: -390, status: "approved", quality: "excellent",
    staffNote: "Done before office opening.",
    hasVoiceNote: false, hasReferencePhoto: false, hasBeforePhoto: false, returnCount: 0,
    history: [
      { at: fmtMins(-390), by: "Sunita Devi", decision: "submitted", text: "Submitted with photo proof" },
      { at: fmtMins(-355), by: "Admin Manager", decision: "approved", text: "Approved — quality: Excellent" },
    ],
  },
];

const REASONS = [
  { en: "Work incomplete", hi: "काम अधूरा है" },
  { en: "Area still dirty", hi: "जगह अब भी गंदी है" },
  { en: "Wrong item packed", hi: "ग़लत सामान पैक हुआ" },
  { en: "Quantity incorrect", hi: "गिनती ग़लत है" },
  { en: "Photo unclear", hi: "फ़ोटो साफ़ नहीं है" },
  { en: "Instructions not followed", hi: "निर्देश नहीं माने गए" },
  { en: "Other", hi: "अन्य" },
];

const PROBLEM_TYPES = [
  { en: "Material shortage", hi: "सामान की कमी" },
  { en: "Machine or equipment issue", hi: "मशीन/उपकरण की दिक्कत" },
  { en: "Safety concern", hi: "सुरक्षा की चिंता" },
  { en: "Staff behaviour", hi: "स्टाफ का व्यवहार" },
  { en: "Repeated poor quality", hi: "बार-बार खराब काम" },
  { en: "Other", hi: "अन्य" },
];

const QUALITY: Record<Quality, { en: string; hi: string }> = {
  good: { en: "Good", hi: "अच्छा" },
  acceptable: { en: "Acceptable", hi: "ठीक-ठाक" },
  excellent: { en: "Excellent", hi: "बहुत बढ़िया" },
};

function toneOf(s: Submission) {
  if (s.status === "cancelled") return "border-muted bg-muted/40";
  if (s.status === "approved") return "border-emerald-500/40 bg-emerald-500/5";
  if (s.status === "returned")
    return s.returnCount > 1
      ? "border-destructive/50 bg-destructive/5"
      : "border-amber-500/50 bg-amber-500/5";
  if (s.returnCount > 1) return "border-destructive/50 bg-destructive/5";
  if (s.returnCount === 1) return "border-amber-500/50 bg-amber-500/5";
  return "border-blue-500/40 bg-blue-500/5";
}

function PhotoBox({ label }: { label: string }) {
  return (
    <div className="flex h-28 flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground">
      <ImageIcon className="h-5 w-5" />
      {label}
    </div>
  );
}

export function ReviewWork({ onGo }: { onGo?: (s: string) => void }) {
  const [lang, setLang] = useState<Lang>("en");
  const [items, setItems] = useState<Submission[]>(SEED);
  const [roleTab, setRoleTab] = useState<"all" | StaffRole>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"none" | "approve" | "return" | "problem">("none");

  // approve
  const [quality, setQuality] = useState<Quality>("good");
  const [approveNote, setApproveNote] = useState("");
  const [confirmApprove, setConfirmApprove] = useState(false);

  // return
  const [reason, setReason] = useState("");
  const [fixEn, setFixEn] = useState("");
  const [fixHi, setFixHi] = useState("");
  const [newDue, setNewDue] = useState("");
  const [refPhoto, setRefPhoto] = useState(false);

  // problem
  const [pType, setPType] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPriority, setPPriority] = useState("important");
  const [pStaff, setPStaff] = useState("");
  const [pAction, setPAction] = useState("");
  const [pDue, setPDue] = useState("");

  const open = items.find((i) => i.id === openId) ?? null;

  const waiting = items.filter((i) => i.status === "review");
  const approvedToday = items.filter((i) => i.status === "approved").length;
  const returnedToday = items.filter((i) => i.status === "returned").length;

  const queue = useMemo(() => {
    let list = waiting;
    if (roleTab !== "all") list = list.filter((i) => i.role === roleTab);
    return [...list].sort((a, b) => a.submittedMins - b.submittedMins); // oldest first
  }, [waiting, roleTab]);

  const resetForms = () => {
    setMode("none");
    setQuality("good"); setApproveNote("");
    setReason(""); setFixEn(""); setFixHi(""); setNewDue(""); setRefPhoto(false);
    setPType(""); setPDesc(""); setPPriority("important"); setPStaff(""); setPAction(""); setPDue("");
  };

  const patch = (id: string, fn: (s: Submission) => Submission) =>
    setItems((prev) => prev.map((s) => (s.id === id ? fn(s) : s)));

  const doApprove = () => {
    if (!open) return;
    patch(open.id, (s) => ({
      ...s,
      status: "approved",
      quality,
      history: [
        ...s.history,
        {
          at: stamp(),
          by: "Admin Manager",
          decision: "approved",
          text: `Approved — quality: ${QUALITY[quality].en}${approveNote.trim() ? ` · ${approveNote.trim()}` : ""}`,
        },
      ],
    }));
    setConfirmApprove(false);
    setOpenId(null);
    resetForms();
    toast.success(
      lang === "en"
        ? "Work approved. Staff performance updated."
        : "काम मंज़ूर। स्टाफ परफ़ॉर्मेंस अपडेट हुई।",
    );
  };

  const doReturn = () => {
    if (!open) return;
    if (!reason) {
      toast.error(lang === "en" ? "Select a correction reason" : "सुधार का कारण चुनें");
      return;
    }
    if (!fixEn.trim()) {
      toast.error(lang === "en" ? "Add the English instruction" : "अंग्रेज़ी निर्देश लिखें");
      return;
    }
    if (!newDue) {
      toast.error(lang === "en" ? "Set a new due time" : "नया समय भरें");
      return;
    }
    patch(open.id, (s) => ({
      ...s,
      status: "returned",
      returnCount: s.returnCount + 1,
      history: [
        ...s.history,
        {
          at: stamp(),
          by: "Admin Manager",
          decision: "returned",
          text: `Returned (${reason}): ${fixEn.trim()} · New due ${new Date(newDue).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`,
        },
      ],
    }));
    setOpenId(null);
    resetForms();
    toast.success(
      lang === "en"
        ? "Returned for correction. It is back on the staff member's My Tasks."
        : "सुधार के लिए वापस भेजा। यह स्टाफ के My Tasks में दिखेगा।",
    );
  };

  const doProblem = () => {
    if (!open) return;
    if (!pType || !pDesc.trim() || !pStaff || !pDue) {
      toast.error(
        lang === "en"
          ? "Problem type, description, staff and due time are required"
          : "समस्या, विवरण, स्टाफ और समय ज़रूरी है",
      );
      return;
    }
    patch(open.id, (s) => ({
      ...s,
      history: [
        ...s.history,
        {
          at: stamp(),
          by: "Admin Manager",
          decision: "problem",
          text: `Problem reported (${pType}, ${pPriority}): ${pDesc.trim()} · Responsible: ${pStaff} · Action: ${pAction.trim() || "—"}`,
        },
      ],
    }));
    resetForms();
    toast.success(lang === "en" ? "Problem recorded on this task" : "समस्या इस काम में दर्ज हुई");
  };

  /* ---------------- Review screen ---------------- */
  if (open) {
    const late = open.submittedMins > open.dueMins;
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => { setOpenId(null); resetForms(); }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {lang === "en" ? "Back to review queue" : "रिव्यू सूची पर वापस"}
        </Button>

        <Card className={toneOf(open)}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background text-3xl">
                {open.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold leading-tight md:text-xl">
                  {lang === "en" ? open.titleEn : open.titleHi}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {open.id} · {ROLE_META[open.role].label} · {open.location}
                </p>
              </div>
              <Badge variant={late ? "destructive" : "outline"}>
                {late ? (lang === "en" ? "Late" : "देर से") : lang === "en" ? "On Time" : "समय पर"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">{initials(open.assignee)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium leading-tight">{open.assignee}</div>
                <div className="text-xs text-muted-foreground">
                  {lang === "en" ? "Due" : "समय"} {fmtMins(open.dueMins)} ·{" "}
                  {lang === "en" ? "Submitted" : "जमा"} {fmtMins(open.submittedMins)}
                </div>
              </div>
              {open.returnCount > 1 && (
                <Badge variant="destructive" className="ml-auto">
                  {lang === "en" ? `Returned ${open.returnCount}×` : `${open.returnCount} बार वापस`}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {lang === "en" ? "Original task instructions" : "काम के मूल निर्देश"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border p-3 text-sm">
              <div className="mb-1 text-xs font-medium text-muted-foreground">English</div>
              {open.instructionsEn}
            </div>
            <div className="rounded-md border p-3 text-sm">
              <div className="mb-1 text-xs font-medium text-muted-foreground">हिंदी</div>
              {open.instructionsHi}
            </div>
            {open.hasReferencePhoto && (
              <PhotoBox label={lang === "en" ? "Reference photo" : "रेफ़रेंस फ़ोटो"} />
            )}
            <div>
              <div className="mb-1.5 text-sm font-medium">
                {lang === "en" ? "Required checklist vs staff completion" : "ज़रूरी चेकलिस्ट और स्टाफ का काम"}
              </div>
              <ul className="space-y-1 text-sm">
                {open.requiredChecklist.map((step, i) => {
                  const done = open.staffChecklist[i];
                  return (
                    <li key={i} className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={done ? "" : "font-medium text-destructive"}>{step}</span>
                      {!done && (
                        <span className="text-xs text-muted-foreground">
                          ({lang === "en" ? "not done" : "नहीं हुआ"})
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{lang === "en" ? "Submitted work" : "जमा किया काम"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              {open.hasBeforePhoto && <PhotoBox label={lang === "en" ? "Before photo" : "पहले की फ़ोटो"} />}
              <PhotoBox label={lang === "en" ? "After photo" : "बाद की फ़ोटो"} />
            </div>
            <div className="rounded-md border p-3 text-sm">
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {lang === "en" ? "Staff comments" : "स्टाफ की बात"}
              </div>
              {open.staffNote}
            </div>
            {open.hasVoiceNote && (
              <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                <Mic className="h-4 w-4" />
                {lang === "en" ? "Voice note attached (playback coming soon)" : "आवाज़ नोट है (जल्द सुन सकेंगे)"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              <Clock className="mr-1 inline h-3.5 w-3.5" />
              {lang === "en" ? "Completed at" : "पूरा हुआ"} {fmtMins(open.submittedMins)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              {lang === "en" ? "Previous review history" : "पिछला रिव्यू इतिहास"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {open.history.map((e, i) => (
              <div key={i} className="rounded-md border p-2 text-sm">
                {e.text}
                <span className="block text-xs text-muted-foreground">
                  {e.by} · {e.at}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {open.status !== "review" ? (
          <Card className={toneOf(open)}>
            <CardContent className="p-4 text-sm">
              {open.status === "approved"
                ? lang === "en"
                  ? "Approved. Staff performance is updated and staff can no longer change this task."
                  : "मंज़ूर। परफ़ॉर्मेंस अपडेट हो गई और स्टाफ अब बदलाव नहीं कर सकता।"
                : lang === "en"
                  ? "Returned for correction. It is showing again on the staff member's My Tasks."
                  : "सुधार के लिए वापस। यह स्टाफ के My Tasks में फिर दिख रहा है।"}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button size="lg" className="h-14" onClick={() => setMode("approve")}>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {lang === "en" ? "Approve Work" : "काम मंज़ूर करें"}
              </Button>
              <Button size="lg" variant="outline" className="h-14" onClick={() => setMode("return")}>
                <RotateCcw className="mr-2 h-5 w-5" />
                {lang === "en" ? "Return for Correction" : "सुधार के लिए वापस"}
              </Button>
              <Button size="lg" variant="destructive" className="h-14" onClick={() => setMode("problem")}>
                <ShieldAlert className="mr-2 h-5 w-5" />
                {lang === "en" ? "Report a Problem" : "समस्या दर्ज करें"}
              </Button>
            </div>

            {mode === "approve" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{lang === "en" ? "Approve work" : "काम मंज़ूर करें"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{lang === "en" ? "Quality" : "काम की गुणवत्ता"}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(QUALITY) as Quality[]).map((q) => (
                        <Button
                          key={q}
                          variant={quality === q ? "default" : "outline"}
                          onClick={() => setQuality(q)}
                        >
                          <Star className="mr-1.5 h-4 w-4" />
                          {QUALITY[q][lang]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {lang === "en" ? "Manager note (optional)" : "मैनेजर नोट (वैकल्पिक)"}
                    </Label>
                    <Textarea rows={2} value={approveNote} onChange={(e) => setApproveNote(e.target.value)} />
                  </div>
                  <Button onClick={() => setConfirmApprove(true)}>
                    {lang === "en" ? "Confirm Approval" : "मंज़ूरी पक्की करें"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {mode === "return" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {lang === "en" ? "Return for correction" : "सुधार के लिए वापस भेजें"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{lang === "en" ? "Correction reason" : "सुधार का कारण"}</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === "en" ? "Select reason" : "कारण चुनें"} />
                      </SelectTrigger>
                      <SelectContent>
                        {REASONS.map((r) => (
                          <SelectItem key={r.en} value={r.en}>
                            {lang === "en" ? r.en : r.hi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">English instruction</Label>
                      <Textarea rows={3} value={fixEn} onChange={(e) => setFixEn(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">हिंदी निर्देश</Label>
                      <Textarea rows={3} value={fixHi} onChange={(e) => setFixHi(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "New due time" : "नया समय"}</Label>
                      <Input type="datetime-local" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant={refPhoto ? "secondary" : "outline"}
                        onClick={() => setRefPhoto((v) => !v)}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {lang === "en" ? "Attach reference photo" : "रेफ़रेंस फ़ोटो लगाएँ"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lang === "en"
                      ? "The same task is sent back — no duplicate task is created. Original submission and photos are preserved."
                      : "वही काम वापस जाएगा — नया काम नहीं बनेगा। पुरानी जमा फ़ोटो सुरक्षित रहेंगी।"}
                  </p>
                  <Button variant="outline" onClick={doReturn}>
                    {lang === "en" ? "Send Back for Correction" : "सुधार के लिए भेजें"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {mode === "problem" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {lang === "en" ? "Report a problem" : "समस्या दर्ज करें"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "Problem type" : "समस्या का प्रकार"}</Label>
                      <Select value={pType} onValueChange={setPType}>
                        <SelectTrigger>
                          <SelectValue placeholder={lang === "en" ? "Select" : "चुनें"} />
                        </SelectTrigger>
                        <SelectContent>
                          {PROBLEM_TYPES.map((p) => (
                            <SelectItem key={p.en} value={p.en}>
                              {lang === "en" ? p.en : p.hi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "Priority" : "प्राथमिकता"}</Label>
                      <Select value={pPriority} onValueChange={setPPriority}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">{lang === "en" ? "Normal" : "सामान्य"}</SelectItem>
                          <SelectItem value="important">{lang === "en" ? "Important" : "ज़रूरी"}</SelectItem>
                          <SelectItem value="urgent">{lang === "en" ? "Urgent" : "अत्यावश्यक"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {lang === "en" ? "Responsible staff member" : "ज़िम्मेदार स्टाफ"}
                      </Label>
                      <Select value={pStaff} onValueChange={setPStaff}>
                        <SelectTrigger>
                          <SelectValue placeholder={lang === "en" ? "Select staff" : "स्टाफ चुनें"} />
                        </SelectTrigger>
                        <SelectContent>
                          {STAFF.map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              {s.name} — {ROLE_META[s.role].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{lang === "en" ? "Due date & time" : "तारीख़ और समय"}</Label>
                      <Input type="datetime-local" value={pDue} onChange={(e) => setPDue(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{lang === "en" ? "Description" : "विवरण"}</Label>
                    <Textarea rows={2} value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{lang === "en" ? "Corrective action" : "सुधार की कार्रवाई"}</Label>
                    <Textarea rows={2} value={pAction} onChange={(e) => setPAction(e.target.value)} />
                  </div>
                  <Button variant="destructive" onClick={doProblem}>
                    {lang === "en" ? "Save Problem Report" : "समस्या सेव करें"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* confirm approval */}
        <Dialog open={confirmApprove} onOpenChange={setConfirmApprove}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{lang === "en" ? "Confirm approval?" : "मंज़ूरी पक्की करें?"}</DialogTitle>
              <DialogDescription>
                {lang === "en"
                  ? "Approved work updates staff performance and can no longer be changed by the staff member."
                  : "मंज़ूरी के बाद परफ़ॉर्मेंस अपडेट होगी और स्टाफ बदलाव नहीं कर पाएगा।"}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border p-3 text-sm">
              {open.icon} <span className="font-medium">{open.titleEn}</span>
              <span className="block text-xs text-muted-foreground">
                {open.assignee} · {lang === "en" ? "Quality" : "गुणवत्ता"}: {QUALITY[quality].en}
              </span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmApprove(false)}>
                {lang === "en" ? "Cancel" : "रद्द करें"}
              </Button>
              <Button onClick={doApprove}>{lang === "en" ? "Confirm Approval" : "मंज़ूर करें"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ---------------- Queue ---------------- */
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            {lang === "en" ? "Review Work" : "काम की जाँच"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "en"
              ? "Check submitted work and approve or send it back. Oldest submissions first."
              : "जमा किया काम देखें और मंज़ूर करें या वापस भेजें। पुराने पहले।"}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" onClick={() => onGo?.("staff-tasks")}>
            {lang === "en" ? "Staff Tasks" : "स्टाफ के काम"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-blue-500/40">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{waiting.length}</div>
              <p className="text-xs text-muted-foreground">
                {lang === "en" ? "Waiting for Review" : "रिव्यू बाकी"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/40">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <div className="text-2xl font-bold">{approvedToday}</div>
              <p className="text-xs text-muted-foreground">
                {lang === "en" ? "Approved Today" : "आज मंज़ूर"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/40">
          <CardContent className="flex items-center gap-3 p-4">
            <RotateCcw className="h-8 w-8 text-amber-600" />
            <div>
              <div className="text-2xl font-bold">{returnedToday}</div>
              <p className="text-xs text-muted-foreground">
                {lang === "en" ? "Returned Today" : "आज वापस भेजे"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {([["all", lang === "en" ? "All Staff" : "सभी स्टाफ"]] as [string, string][])
          .concat((Object.keys(ROLE_META) as StaffRole[]).map((r) => [r, ROLE_META[r].label]))
          .map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRoleTab(key as "all" | StaffRole)}
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

      <div className="grid gap-3 lg:grid-cols-2">
        {queue.map((s) => {
          const late = s.submittedMins > s.dueMins;
          return (
            <Card key={s.id} className={toneOf(s)}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl">
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold leading-tight">
                      {lang === "en" ? s.titleEn : s.titleHi}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        {lang === "en" ? "Waiting for Review" : "रिव्यू बाकी"}
                      </Badge>
                      <Badge variant={late ? "destructive" : "outline"}>
                        {late ? (lang === "en" ? "Late" : "देर से") : lang === "en" ? "On Time" : "समय पर"}
                      </Badge>
                      {s.returnCount > 1 && (
                        <Badge variant="destructive">
                          {lang === "en" ? `Returned ${s.returnCount}×` : `${s.returnCount} बार वापस`}
                        </Badge>
                      )}
                      {s.returnCount === 1 && (
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          {lang === "en" ? "Returned once" : "एक बार वापस"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials(s.assignee)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium leading-tight">{s.assignee}</div>
                    <div className="text-xs text-muted-foreground">
                      {ROLE_META[s.role].label} · {s.location}
                    </div>
                  </div>
                </div>

                <PhotoBox label={lang === "en" ? "Completion photo" : "पूरा होने की फ़ोटो"} />

                <div className="rounded-md bg-background/70 p-2 text-sm">
                  {s.staffNote}
                  {s.hasVoiceNote && (
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mic className="h-3.5 w-3.5" />
                      {lang === "en" ? "Voice note attached" : "आवाज़ नोट है"}
                    </span>
                  )}
                </div>

                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <span>
                    {lang === "en" ? "Due" : "समय"}: {fmtMins(s.dueMins)}
                  </span>
                  <span>
                    {lang === "en" ? "Completed" : "पूरा"}: {fmtMins(s.submittedMins)}
                  </span>
                </div>

                <Separator />
                <Button className="w-full" onClick={() => { setOpenId(s.id); resetForms(); }}>
                  {lang === "en" ? "Review" : "जाँचें"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {queue.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              {lang === "en" ? "Nothing waiting for review right now." : "अभी कोई काम जाँच के लिए नहीं है।"}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Decided today */}
      {items.some((i) => i.status === "approved" || i.status === "returned") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {lang === "en" ? "Decided today" : "आज के फ़ैसले"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items
              .filter((i) => i.status === "approved" || i.status === "returned")
              .map((i) => (
                <button
                  key={i.id}
                  onClick={() => setOpenId(i.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left text-sm ${toneOf(i)}`}
                >
                  <span>
                    {i.icon} {lang === "en" ? i.titleEn : i.titleHi}
                    <span className="block text-xs text-muted-foreground">
                      {i.assignee} · {ROLE_META[i.role].label}
                    </span>
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      i.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }
                  >
                    {i.status === "approved"
                      ? lang === "en" ? "Approved" : "मंज़ूर"
                      : lang === "en" ? "Returned" : "वापस"}
                  </Badge>
                </button>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
