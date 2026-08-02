import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Box,
  Camera,
  CheckCircle2,
  Layers,
  Mic,
  Minus,
  Package,
  PackageCheck,
  PenLine,
  Plus,
  ShoppingBag,
  Tag,
  Tags,
  Scroll,
  ShieldQuestion,
} from "lucide-react";
import { LangSwitch, tr } from "./pantry-cleaning-ui";
import type { Bi, Lang } from "./pantry-cleaning-data";
import { PACK_TASKS } from "./packing-data";

type ReqStatus = "sent" | "review" | "approved" | "ready" | "given" | "rejected";

const STATUS: Record<ReqStatus, { label: Bi; cls: string }> = {
  sent: { label: { en: "Sent", hi: "भेजा गया" }, cls: "bg-amber-500/15 text-amber-700" },
  review: { label: { en: "Under Review", hi: "जांच में" }, cls: "bg-amber-500/15 text-amber-700" },
  approved: { label: { en: "Approved", hi: "मंज़ूर" }, cls: "bg-emerald-500/15 text-emerald-700" },
  ready: { label: { en: "Ready to Collect", hi: "लेने के लिए तैयार" }, cls: "bg-blue-500/15 text-blue-700" },
  given: { label: { en: "Given to You", hi: "आपको दे दिया" }, cls: "bg-emerald-500/15 text-emerald-700" },
  rejected: { label: { en: "Rejected", hi: "मना किया" }, cls: "bg-destructive/15 text-destructive" },
};

type Item = {
  id: string;
  name: Bi;
  unit: Bi;
  icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: Item[] = [
  { id: "boxes", name: { en: "Boxes", hi: "डिब्बे" }, unit: { en: "pieces", hi: "पीस" }, icon: Box },
  { id: "carry", name: { en: "Carry Bags", hi: "कैरी बैग" }, unit: { en: "pieces", hi: "पीस" }, icon: ShoppingBag },
  { id: "plastic", name: { en: "Plastic Bags", hi: "प्लास्टिक बैग" }, unit: { en: "packets", hi: "पैकेट" }, icon: ShoppingBag },
  { id: "tape", name: { en: "Packing Tape", hi: "पैकिंग टेप" }, unit: { en: "rolls", hi: "रोल" }, icon: Scroll },
  { id: "labels", name: { en: "Labels", hi: "लेबल" }, unit: { en: "sheets", hi: "शीट" }, icon: Tag },
  { id: "wrap", name: { en: "Wrapping Material", hi: "रैपिंग सामान" }, unit: { en: "rolls", hi: "रोल" }, icon: Layers },
  { id: "bubble", name: { en: "Bubble Wrap", hi: "बबल रैप" }, unit: { en: "rolls", hi: "रोल" }, icon: Package },
  { id: "marker", name: { en: "Markers", hi: "मार्कर" }, unit: { en: "pieces", hi: "पीस" }, icon: PenLine },
  { id: "tags", name: { en: "Tags", hi: "टैग" }, unit: { en: "packets", hi: "पैकेट" }, icon: Tags },
  { id: "other", name: { en: "Other", hi: "अन्य" }, unit: { en: "pieces", hi: "पीस" }, icon: ShieldQuestion },
];

type Req = {
  id: string;
  itemId: string;
  qty: number;
  approvedQty?: number;
  taskId?: string;
  urgent: boolean;
  reason?: string;
  date: string;
  status: ReqStatus;
  rejectReason?: Bi;
  location?: Bi;
};

const TODAY = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const SEED: Req[] = [
  {
    id: "SR-201",
    itemId: "tape",
    qty: 6,
    approvedQty: 4,
    taskId: "ORD-4412",
    urgent: true,
    date: TODAY,
    status: "ready",
    location: { en: "Store room – Rack 2", hi: "स्टोर रूम – रैक 2" },
  },
  {
    id: "SR-198",
    itemId: "boxes",
    qty: 20,
    taskId: "ORD-4419",
    urgent: false,
    date: TODAY,
    status: "review",
  },
  {
    id: "SR-195",
    itemId: "bubble",
    qty: 2,
    approvedQty: 2,
    taskId: "ORD-4420",
    urgent: false,
    date: TODAY,
    status: "given",
  },
  {
    id: "SR-190",
    itemId: "marker",
    qty: 5,
    urgent: false,
    date: TODAY,
    status: "rejected",
    rejectReason: {
      en: "5 markers were given yesterday. Use those first.",
      hi: "कल 5 मार्कर दिए गए थे। पहले वही उपयोग करें।",
    },
  },
];

const ACTIVE: ReqStatus[] = ["sent", "review", "approved", "ready"];

export function PackingSupplies({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t = tr(lang);
  const [reqs, setReqs] = useState<Req[]>(SEED);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [pick, setPick] = useState<Item | null>(null);
  const [qty, setQty] = useState(1);
  const [taskId, setTaskId] = useState<string>("none");
  const [urgent, setUrgent] = useState(false);
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState(false);
  const [voice, setVoice] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [confirmFor, setConfirmFor] = useState<Req | null>(null);

  const item = (id: string) => ITEMS.find((x) => x.id === id)!;
  const pendingCount = reqs.filter((r) => r.status === "sent" || r.status === "review").length;
  const readyCount = reqs.filter((r) => r.status === "ready").length;
  const view = reqs.find((r) => r.id === viewId) ?? null;
  const ready = useMemo(() => reqs.filter((r) => r.status === "ready"), [reqs]);

  const openNew = () => {
    setPick(null);
    setQty(1);
    setTaskId("none");
    setUrgent(false);
    setReason("");
    setPhoto(false);
    setVoice(false);
    setStep(1);
  };

  const choose = (it: Item) => {
    const dup = reqs.find((r) => r.itemId === it.id && ACTIVE.includes(r.status));
    if (dup) {
      toast.error(
        lang === "hi"
          ? `${it.name.hi} की माँग पहले से चल रही है (${dup.id})।`
          : `A request for ${it.name.en} is already active (${dup.id}).`,
      );
      return;
    }
    setPick(it);
    setQty(1);
    setStep(2);
  };

  const submit = () => {
    if (!pick) return;
    const id = `SR-${210 + reqs.length}`;
    setReqs((p) => [
      {
        id,
        itemId: pick.id,
        qty,
        taskId: taskId === "none" ? undefined : taskId,
        urgent,
        reason: reason || undefined,
        date: TODAY,
        status: "sent",
      },
      ...p,
    ]);
    setStep(0);
    toast.success(
      lang === "hi"
        ? "माँग मैनेजर को भेज दी गई।"
        : "Request sent to the Administration Manager.",
    );
  };

  const collect = (r: Req) => setConfirmFor(r);

  const answerReceived = (yes: boolean) => {
    if (!confirmFor) return;
    if (yes) {
      setReqs((p) => p.map((x) => (x.id === confirmFor.id ? { ...x, status: "given" } : x)));
      toast.success(lang === "hi" ? "सामान मिल गया, दर्ज हो गया।" : "Collection confirmed.");
    } else {
      toast.info(
        lang === "hi"
          ? "मैनेजर को बता दिया गया कि सामान नहीं मिला।"
          : "Manager informed that the item was not received.",
      );
    }
    setConfirmFor(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold">
              {lang === "hi" ? "पैकिंग सामान" : "Packing Supplies"}
            </div>
            <div className="text-sm text-muted-foreground">
              {lang === "hi" ? "इंतज़ार में " : "Pending "}
              <span className="font-bold text-amber-700">{pendingCount}</span>
              {" · "}
              {lang === "hi" ? "लेने को तैयार " : "Ready to Collect "}
              <span className="font-bold text-blue-700">{readyCount}</span>
            </div>
          </div>
          <LangSwitch lang={lang} setLang={setLang} />
          <Button size="lg" className="h-12 w-full sm:w-auto" onClick={openNew}>
            <Plus className="mr-2 h-5 w-5" />
            {lang === "hi" ? "नई माँग" : "New Request"}
          </Button>
        </CardContent>
      </Card>

      {/* Ready to collect */}
      {ready.map((r) => {
        const it = item(r.itemId);
        return (
          <Card key={r.id} className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-700">
                <it.icon className="h-12 w-12" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {lang === "hi" ? "लेने के लिए तैयार" : "Ready to Collect"}
                </div>
                <div className="text-lg font-bold">{t(it.name)}</div>
                <div className="text-base font-semibold">
                  {r.approvedQty ?? r.qty} {t(it.unit)}
                  {r.approvedQty != null && r.approvedQty !== r.qty && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({lang === "hi" ? "माँगा " : "asked "}
                      {r.qty})
                    </span>
                  )}
                </div>
                {r.location && (
                  <div className="text-sm text-muted-foreground">{t(r.location)}</div>
                )}
              </div>
              <Button size="lg" className="h-14 w-full sm:w-auto" onClick={() => collect(r)}>
                <PackageCheck className="mr-2 h-5 w-5" />
                {lang === "hi" ? "सामान लें" : "Collect Item"}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Material buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 text-sm font-semibold">
            {lang === "hi" ? "क्या चाहिए? दबाएं" : "What do you need? Tap an item"}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ITEMS.map((it) => {
              const active = reqs.find((r) => r.itemId === it.id && ACTIVE.includes(r.status));
              return (
                <button
                  key={it.id}
                  onClick={() => {
                    openNew();
                    choose(it);
                  }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors hover:bg-muted ${
                    active ? "border-amber-500/50 bg-amber-500/5" : ""
                  }`}
                >
                  <it.icon className="h-10 w-10 text-primary" />
                  <span className="text-center text-sm font-semibold leading-tight">{t(it.name)}</span>
                  {active && (
                    <span className="text-[11px] font-medium text-amber-700">
                      {lang === "hi" ? "माँग चल रही है" : "Request active"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <div className="space-y-3">
        <div className="text-sm font-semibold">
          {lang === "hi" ? "मेरी माँगें" : "My Requests"}
        </div>
        {reqs.map((r) => {
          const it = item(r.itemId);
          return (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-muted">
                  <it.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">{r.id}</Badge>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[r.status].cls}`}>
                      {t(STATUS[r.status].label)}
                    </span>
                    {r.urgent && (
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                        {lang === "hi" ? "ज़रूरी" : "Urgent"}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold">{t(it.name)}</div>
                  <div className="text-base font-semibold">
                    {r.qty} {t(it.unit)}
                    {r.approvedQty != null && r.approvedQty !== r.qty && (
                      <span className="ml-2 text-sm font-normal text-emerald-700">
                        {lang === "hi" ? "मंज़ूर " : "approved "}
                        {r.approvedQty}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {r.taskId ? `${r.taskId} · ` : ""}
                    {r.date}
                  </div>
                  {r.status === "rejected" && r.rejectReason && (
                    <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                      {t(r.rejectReason)}
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

      {/* New request flow */}
      <Dialog open={step !== 0} onOpenChange={(o) => !o && setStep(0)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 1
                ? lang === "hi"
                  ? "1. सामान चुनें"
                  : "1. Select Item"
                : step === 2
                  ? lang === "hi"
                    ? "2. कितना चाहिए"
                    : "2. Select Quantity"
                  : lang === "hi"
                    ? "3. माँग भेजें"
                    : "3. Submit Request"}
            </DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {ITEMS.map((it) => (
                <button
                  key={it.id}
                  onClick={() => choose(it)}
                  className="flex flex-col items-center gap-2 rounded-2xl border p-4 hover:bg-muted"
                >
                  <it.icon className="h-10 w-10 text-primary" />
                  <span className="text-center text-sm font-semibold">{t(it.name)}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && pick && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <pick.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="text-lg font-bold">{t(pick.name)}</div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-7 w-7" />
                </Button>
                <div className="min-w-24 text-center">
                  <div className="text-4xl font-extrabold">{qty}</div>
                  <div className="text-sm text-muted-foreground">{t(pick.unit)}</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="h-7 w-7" />
                </Button>
              </div>
              <Button size="lg" className="h-14 w-full text-base" onClick={() => setStep(3)}>
                {lang === "hi" ? "आगे बढ़ें" : "Next"}
              </Button>
            </div>
          )}

          {step === 3 && pick && (
            <div className="space-y-3">
              <div className="rounded-xl bg-muted/50 p-3 text-base font-semibold">
                {t(pick.name)} · {qty} {t(pick.unit)}
              </div>

              <div>
                <div className="mb-1 text-sm font-medium">
                  {lang === "hi" ? "किस पैकिंग काम के लिए?" : "Related packing task"}
                </div>
                <Select value={taskId} onValueChange={setTaskId}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {lang === "hi" ? "कोई नहीं" : "Not linked"}
                    </SelectItem>
                    {PACK_TASKS.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.id} — {x.product[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={urgent ? "outline" : "secondary"}
                  className="h-12"
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

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={photo ? "secondary" : "outline"}
                  className="h-12"
                  onClick={() => setPhoto(true)}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "फोटो" : "Photo"}
                </Button>
                <Button
                  variant={voice ? "secondary" : "outline"}
                  className="h-12"
                  onClick={() => setVoice(true)}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "वॉइस नोट" : "Voice Note"}
                </Button>
              </div>

              <Input
                className="h-12"
                placeholder={lang === "hi" ? "कारण (ज़रूरी नहीं)" : "Short reason (optional)"}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <Button size="lg" className="h-14 w-full text-base" onClick={submit}>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {lang === "hi" ? "माँग भेजें" : "Submit Request"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View request */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent>
          {view && (
            <>
              <DialogHeader>
                <DialogTitle>{t(item(view.itemId).name)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex h-28 items-center justify-center rounded-2xl bg-muted">
                  {(() => {
                    const Icon = item(view.itemId).icon;
                    return <Icon className="h-14 w-14 text-primary" />;
                  })()}
                </div>
                <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${STATUS[view.status].cls}`}>
                  {t(STATUS[view.status].label)}
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3">
                    {lang === "hi" ? "माँगी मात्रा: " : "Requested quantity: "}
                    <span className="font-semibold">
                      {view.qty} {t(item(view.itemId).unit)}
                    </span>
                  </div>
                  {view.approvedQty != null && (
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                      {lang === "hi" ? "मंज़ूर मात्रा: " : "Approved quantity: "}
                      <span className="font-semibold">{view.approvedQty}</span>
                    </div>
                  )}
                  <div className="rounded-lg bg-muted/50 p-3">
                    {lang === "hi" ? "काम: " : "Related task: "}
                    <span className="font-semibold">
                      {view.taskId ?? (lang === "hi" ? "कोई नहीं" : "Not linked")}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    {lang === "hi" ? "तारीख: " : "Request date: "}
                    <span className="font-semibold">{view.date}</span>
                  </div>
                  {view.location && (
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      {lang === "hi" ? "कहाँ से लें: " : "Collection location: "}
                      <span className="font-semibold">{t(view.location)}</span>
                    </div>
                  )}
                  {view.rejectReason && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                      {lang === "hi" ? "मैनेजर का कारण: " : "Manager's reason: "}
                      {t(view.rejectReason)}
                    </div>
                  )}
                </div>
                {view.status === "ready" && (
                  <Button
                    size="lg"
                    className="h-14 w-full text-base"
                    onClick={() => {
                      setViewId(null);
                      collect(view);
                    }}
                  >
                    <PackageCheck className="mr-2 h-5 w-5" />
                    {lang === "hi" ? "सामान लें" : "Collect Item"}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Collection confirmation */}
      <Dialog open={!!confirmFor} onOpenChange={(o) => !o && setConfirmFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === "hi" ? "क्या सामान मिल गया?" : "Did you receive the item?"}
            </DialogTitle>
          </DialogHeader>
          {confirmFor && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                  {(() => {
                    const Icon = item(confirmFor.itemId).icon;
                    return <Icon className="h-10 w-10 text-primary" />;
                  })()}
                </div>
                <div>
                  <div className="text-lg font-bold">{t(item(confirmFor.itemId).name)}</div>
                  <div className="text-base font-semibold">
                    {confirmFor.approvedQty ?? confirmFor.qty}{" "}
                    {t(item(confirmFor.itemId).unit)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button size="lg" className="h-16 text-lg" onClick={() => answerReceived(true)}>
                  {lang === "hi" ? "हाँ" : "Yes"}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-16 text-lg"
                  onClick={() => answerReceived(false)}
                >
                  {lang === "hi" ? "नहीं" : "No"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
