import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  HelpCircle,
  Hash,
  ImageIcon,
  Mic,
  Package,
  PackageX,
  PackageSearch,
  Scroll,
  ShieldAlert,
  Siren,
  Tag,
  Wrench,
} from "lucide-react";
import { LangSwitch, tr } from "./pantry-cleaning-ui";
import type { Bi, Lang } from "./pantry-cleaning-data";
import { PACK_TASKS } from "./packing-data";

type RepStatus = "sent" | "checking" | "coming" | "solved" | "closed";

const STATUS: Record<RepStatus, { label: Bi; cls: string }> = {
  sent: { label: { en: "Sent", hi: "भेजा गया" }, cls: "bg-muted text-muted-foreground" },
  checking: { label: { en: "Manager Checking", hi: "मैनेजर देख रहे हैं" }, cls: "bg-amber-500/15 text-amber-700" },
  coming: { label: { en: "Help Coming", hi: "मदद आ रही है" }, cls: "bg-blue-500/15 text-blue-700" },
  solved: { label: { en: "Problem Solved", hi: "दिक्कत हल हुई" }, cls: "bg-emerald-500/15 text-emerald-700" },
  closed: { label: { en: "Closed", hi: "बंद" }, cls: "bg-muted text-muted-foreground" },
};

type Cat = {
  id: string;
  name: Bi;
  icon: React.ComponentType<{ className?: string }>;
  safety?: boolean;
  qty?: boolean;
};

const CATS: Cat[] = [
  { id: "missing", name: { en: "Product Missing", hi: "सामान नहीं मिला" }, icon: PackageSearch },
  { id: "damaged", name: { en: "Product Damaged", hi: "सामान टूटा है" }, icon: PackageX },
  { id: "qty", name: { en: "Wrong Quantity", hi: "मात्रा गलत है" }, icon: Hash, qty: true },
  { id: "material", name: { en: "Packing Material Missing", hi: "पैकिंग सामान नहीं है" }, icon: Scroll },
  { id: "label", name: { en: "Label Problem", hi: "लेबल की दिक्कत" }, icon: Tag },
  { id: "machine", name: { en: "Machine Not Working", hi: "मशीन नहीं चल रही" }, icon: Wrench },
  { id: "details", name: { en: "Order Details Not Clear", hi: "ऑर्डर समझ नहीं आया" }, icon: HelpCircle },
  { id: "safety", name: { en: "Safety Problem", hi: "सुरक्षा की दिक्कत" }, icon: ShieldAlert, safety: true },
  { id: "other", name: { en: "Other Problem", hi: "कोई और दिक्कत" }, icon: AlertTriangle },
];

type Report = {
  id: string;
  catId: string;
  taskId?: string;
  urgent: boolean;
  note?: string;
  actualQty?: string;
  at: string;
  status: RepStatus;
  instruction?: Bi;
  history: { at: string; text: Bi }[];
};

const timeNow = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
const dayNow = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const SEED: Report[] = [
  {
    id: "PR-118",
    catId: "material",
    taskId: "ORD-4412",
    urgent: true,
    note: "Packing tape finished, cannot seal boxes.",
    at: `${dayNow()} · 10:05 AM`,
    status: "coming",
    instruction: {
      en: "Tape is coming from the store room in 10 minutes. Pause this order.",
      hi: "टेप 10 मिनट में स्टोर रूम से आ रहा है। यह ऑर्डर रोक दें।",
    },
    history: [
      { at: "10:05 AM", text: { en: "Report sent", hi: "रिपोर्ट भेजी" } },
      { at: "10:08 AM", text: { en: "Manager checking", hi: "मैनेजर देख रहे हैं" } },
      { at: "10:12 AM", text: { en: "Help coming", hi: "मदद आ रही है" } },
    ],
  },
  {
    id: "PR-115",
    catId: "qty",
    taskId: "ORD-4419",
    urgent: false,
    note: "Only 2 kits found, 3 needed.",
    actualQty: "2",
    at: `${dayNow()} · 9:40 AM`,
    status: "solved",
    instruction: {
      en: "One kit was in the old rack. Now complete the packing.",
      hi: "एक किट पुरानी रैक में थी। अब पैकिंग पूरी करें।",
    },
    history: [
      { at: "9:40 AM", text: { en: "Report sent", hi: "रिपोर्ट भेजी" } },
      { at: "9:55 AM", text: { en: "Problem solved", hi: "दिक्कत हल हुई" } },
    ],
  },
];

const ACTIVE: RepStatus[] = ["sent", "checking", "coming"];

export function PackingReportProblem({
  lang,
  setLang,
  presetCat,
  onPresetHandled,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  presetCat?: string | null;
  onPresetHandled?: () => void;
}) {
  const t = tr(lang);

  const [reports, setReports] = useState<Report[]>(SEED);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [cat, setCat] = useState<Cat | null>(null);
  const [taskId, setTaskId] = useState("none");
  const [urgent, setUrgent] = useState(false);
  const [note, setNote] = useState("");
  const [actualQty, setActualQty] = useState("");
  const [photo, setPhoto] = useState(false);
  const [voice, setVoice] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);

  const catOf = (id: string) => CATS.find((c) => c.id === id)!;
  const task = PACK_TASKS.find((x) => x.id === taskId) ?? null;
  const view = reports.find((r) => r.id === viewId) ?? null;
  const openCount = reports.filter((r) => ACTIVE.includes(r.status)).length;

  const reset = () => {
    setCat(null);
    setTaskId("none");
    setUrgent(false);
    setNote("");
    setActualQty("");
    setPhoto(false);
    setVoice(false);
  };

  const pickCat = (c: Cat) => {
    const dup = reports.find(
      (r) => r.catId === c.id && ACTIVE.includes(r.status),
    );
    if (dup) {
      toast.error(
        lang === "hi"
          ? `यह दिक्कत पहले से भेजी है (${dup.id})।`
          : `This problem is already reported (${dup.id}).`,
      );
      return;
    }
    reset();
    setCat(c);
    setUrgent(!!c.safety);
    setStep(2);
  };

  const urgentHelp = () => {
    toast.error(
      lang === "hi"
        ? "मैनेजर को तुरंत अलर्ट भेजा गया। काम रोकें।"
        : "Urgent alert sent to the manager. Stop work.",
    );
  };

  const submit = () => {
    if (!cat) return;
    const id = `PR-${120 + reports.length}`;
    const at = `${dayNow()} · ${timeNow()}`;
    setReports((p) => [
      {
        id,
        catId: cat.id,
        taskId: taskId === "none" ? undefined : taskId,
        urgent: urgent || !!cat.safety,
        note: note || undefined,
        actualQty: actualQty || undefined,
        at,
        status: "sent",
        history: [{ at: timeNow(), text: { en: "Report sent", hi: "रिपोर्ट भेजी" } }],
      },
      ...p,
    ]);
    setStep(0);
    reset();
    toast.success(
      lang === "hi"
        ? "दिक्कत मैनेजर को भेज दी गई। यह काम रोक दिया गया है।"
        : "Problem sent to the manager. This packing task is paused.",
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold">
              {lang === "hi" ? "दिक्कत बताएं" : "Report a Problem"}
            </div>
            <div className="text-sm text-muted-foreground">
              {lang === "hi" ? "खुली रिपोर्ट " : "Open reports "}
              <span className="font-bold text-amber-700">{openCount}</span>
            </div>
          </div>
          <LangSwitch lang={lang} setLang={setLang} />
          <Button
            size="lg"
            variant="destructive"
            className="h-12 w-full sm:w-auto"
            onClick={urgentHelp}
          >
            <Siren className="mr-2 h-5 w-5" />
            {lang === "hi" ? "तुरंत मदद" : "Urgent Help"}
          </Button>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 text-sm font-semibold">
            {lang === "hi" ? "क्या दिक्कत है? दबाएं" : "What is the problem? Tap one"}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATS.map((c) => {
              const active = reports.find((r) => r.catId === c.id && ACTIVE.includes(r.status));
              return (
                <button
                  key={c.id}
                  onClick={() => pickCat(c)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors hover:bg-muted ${
                    c.safety ? "border-destructive/50 bg-destructive/5" : ""
                  } ${active ? "border-amber-500/50 bg-amber-500/5" : ""}`}
                >
                  <c.icon
                    className={`h-10 w-10 ${c.safety ? "text-destructive" : "text-primary"}`}
                  />
                  <span className="text-center text-sm font-semibold leading-tight">
                    {t(c.name)}
                  </span>
                  {active && (
                    <span className="text-[11px] font-medium text-amber-700">
                      {lang === "hi" ? "पहले से भेजी है" : "Already reported"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My reports */}
      <div className="space-y-3">
        <div className="text-sm font-semibold">{lang === "hi" ? "मेरी रिपोर्ट" : "My Reports"}</div>
        {reports.map((r) => {
          const c = catOf(r.catId);
          const tsk = PACK_TASKS.find((x) => x.id === r.taskId);
          return (
            <Card
              key={r.id}
              className={
                r.urgent && ACTIVE.includes(r.status)
                  ? "border-destructive/40"
                  : r.status === "solved"
                    ? "border-emerald-500/40"
                    : ""
              }
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-muted">
                  <c.icon className={`h-10 w-10 ${c.safety ? "text-destructive" : "text-primary"}`} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">{r.taskId ?? r.id}</Badge>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[r.status].cls}`}>
                      {t(STATUS[r.status].label)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.urgent
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.urgent ? (lang === "hi" ? "ज़रूरी" : "Urgent") : lang === "hi" ? "सामान्य" : "Normal"}
                    </span>
                  </div>
                  <div className="text-base font-bold">{t(c.name)}</div>
                  {tsk && <div className="text-sm font-semibold">{t(tsk.product)}</div>}
                  <div className="text-sm text-muted-foreground">{r.at}</div>
                  {r.instruction && (
                    <div className="rounded-lg bg-blue-500/10 p-2 text-sm text-blue-800">
                      {lang === "hi" ? "मैनेजर: " : "Manager: "}
                      {t(r.instruction)}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full sm:w-auto"
                  onClick={() => setViewId(r.id)}
                >
                  {lang === "hi" ? "देखें" : "View"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report flow */}
      <Dialog open={step !== 0} onOpenChange={(o) => !o && setStep(0)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 1
                ? lang === "hi"
                  ? "1. दिक्कत चुनें"
                  : "1. Select Problem"
                : step === 2
                  ? lang === "hi"
                    ? "2. कौन सा काम"
                    : "2. Select Packing Task"
                  : step === 3
                    ? lang === "hi"
                      ? "3. फोटो या वॉइस नोट"
                      : "3. Add Photo or Voice Note"
                    : lang === "hi"
                      ? "4. भेजें"
                      : "4. Submit"}
            </DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickCat(c)}
                  className="flex flex-col items-center gap-2 rounded-2xl border p-4 hover:bg-muted"
                >
                  <c.icon className={`h-10 w-10 ${c.safety ? "text-destructive" : "text-primary"}`} />
                  <span className="text-center text-sm font-semibold">{t(c.name)}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && cat && (
            <div className="space-y-3">
              {cat.safety && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3">
                  <div className="flex items-center gap-2 text-base font-bold text-destructive">
                    <ShieldAlert className="h-5 w-5" />
                    {lang === "hi" ? "सावधान" : "Warning"}
                  </div>
                  <p className="mt-1 text-sm">
                    {lang === "hi"
                      ? "काम रोकें और खतरे से दूर हट जाएं। मैनेजर को तुरंत बताएं।"
                      : "Stop work and move away from danger. Inform the manager immediately."}
                  </p>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="mt-2 h-14 w-full text-base"
                    onClick={urgentHelp}
                  >
                    <Siren className="mr-2 h-5 w-5" />
                    {lang === "hi" ? "तुरंत मदद" : "Urgent Help"}
                  </Button>
                </div>
              )}
              <div className="rounded-xl bg-muted/50 p-3 text-base font-semibold">{t(cat.name)}</div>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={lang === "hi" ? "काम चुनें" : "Select task"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "hi" ? "कोई नहीं" : "Not linked"}</SelectItem>
                  {PACK_TASKS.map((x) => (
                    <SelectItem key={x.id} value={x.id}>
                      {x.id} — {x.product[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {task && (
                <div className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                    <Package className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <div className="text-base font-bold">{t(task.product)}</div>
                    <div className="text-sm">
                      {lang === "hi" ? "चाहिए: " : "Expected: "}
                      <span className="font-semibold">
                        {task.qty} {t(task.unit)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {cat.qty && (
                <Input
                  className="h-12"
                  inputMode="numeric"
                  placeholder={lang === "hi" ? "असली मात्रा कितनी है?" : "Actual quantity found"}
                  value={actualQty}
                  onChange={(e) => setActualQty(e.target.value)}
                />
              )}

              <Button size="lg" className="h-14 w-full text-base" onClick={() => setStep(3)}>
                {lang === "hi" ? "आगे बढ़ें" : "Next"}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex h-28 items-center justify-center gap-2 rounded-2xl bg-muted text-sm text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
                {lang === "hi" ? "फोटो यहाँ दिखेगी" : "Photo will appear here"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={photo ? "secondary" : "outline"}
                  className="h-14"
                  onClick={() => setPhoto(true)}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "फोटो लगाएं" : "Add Photo"}
                </Button>
                <Button
                  variant={voice ? "secondary" : "outline"}
                  className="h-14"
                  onClick={() => setVoice(true)}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "वॉइस नोट" : "Voice Note"}
                </Button>
              </div>
              <Button size="lg" className="h-14 w-full text-base" onClick={() => setStep(4)}>
                {lang === "hi" ? "आगे बढ़ें" : "Next"}
              </Button>
            </div>
          )}

          {step === 4 && cat && (
            <div className="space-y-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-base font-bold">{t(cat.name)}</div>
                <div className="text-sm text-muted-foreground">
                  {taskId === "none" ? (lang === "hi" ? "कोई काम नहीं" : "Not linked") : taskId}
                  {actualQty ? ` · ${lang === "hi" ? "असली " : "actual "}${actualQty}` : ""}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={urgent ? "outline" : "secondary"}
                  className="h-12"
                  disabled={!!cat.safety}
                  onClick={() => setUrgent(false)}
                >
                  {lang === "hi" ? "सामान्य" : "Normal"}
                </Button>
                <Button
                  variant={urgent ? "destructive" : "outline"}
                  className="h-12"
                  onClick={() => setUrgent(true)}
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "ज़रूरी" : "Urgent"}
                </Button>
              </div>
              <Textarea
                placeholder={lang === "hi" ? "छोटा नोट (ज़रूरी नहीं)" : "Short note (optional)"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button size="lg" className="h-14 w-full text-base" onClick={submit}>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {lang === "hi" ? "भेजें" : "Submit"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View report */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {view && (
            <>
              <DialogHeader>
                <DialogTitle>{t(catOf(view.catId).name)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${STATUS[view.status].cls}`}>
                  {t(STATUS[view.status].label)}
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3">
                    {lang === "hi" ? "काम: " : "Task: "}
                    <span className="font-semibold">
                      {view.taskId ?? (lang === "hi" ? "कोई नहीं" : "Not linked")}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    {lang === "hi" ? "समय: " : "Reported: "}
                    <span className="font-semibold">{view.at}</span>
                  </div>
                  {view.actualQty && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      {lang === "hi" ? "असली मात्रा: " : "Actual quantity: "}
                      <span className="font-semibold">{view.actualQty}</span>
                    </div>
                  )}
                  {view.note && (
                    <div className="rounded-lg bg-muted/50 p-3">{view.note}</div>
                  )}
                  {view.instruction && (
                    <div className="rounded-lg bg-blue-500/10 p-3 text-blue-800">
                      {lang === "hi" ? "मैनेजर का निर्देश: " : "Manager's instruction: "}
                      {t(view.instruction)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="mb-1 text-sm font-semibold">
                    {lang === "hi" ? "पूरा इतिहास" : "Full history"}
                  </div>
                  <div className="space-y-1">
                    {view.history.map((h, i) => (
                      <div key={i} className="flex gap-2 rounded-lg bg-muted/40 p-2 text-sm">
                        <span className="font-semibold">{h.at}</span>
                        <span>{t(h.text)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
