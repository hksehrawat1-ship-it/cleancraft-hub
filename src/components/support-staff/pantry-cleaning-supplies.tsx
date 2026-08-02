import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Boxes,
  Camera,
  CheckCircle2,
  Clock,
  Coffee,
  CupSoda,
  Droplets,
  GlassWater,
  HandMetal,
  Mic,
  Milk,
  Minus,
  MoreHorizontal,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Trash2,
  Wind,
  XCircle,
} from "lucide-react";
import type { Bi, Kind, Lang } from "./pantry-cleaning-data";
import { L } from "./pantry-cleaning-data";
import { LangSwitch } from "./pantry-cleaning-ui";

type ReqState = "requested" | "approved" | "ready" | "collected" | "rejected";

type Item = {
  id: string;
  kind: Kind;
  name: Bi;
  unit: Bi;
  icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: Item[] = [
  { id: "tea", kind: "pantry", name: { en: "Tea", hi: "चाय" }, unit: { en: "packet", hi: "पैकेट" }, icon: Coffee },
  { id: "coffee", kind: "pantry", name: { en: "Coffee", hi: "कॉफी" }, unit: { en: "packet", hi: "पैकेट" }, icon: Coffee },
  { id: "sugar", kind: "pantry", name: { en: "Sugar", hi: "चीनी" }, unit: { en: "kg", hi: "किलो" }, icon: Boxes },
  { id: "milk", kind: "pantry", name: { en: "Milk", hi: "दूध" }, unit: { en: "litre", hi: "लीटर" }, icon: Milk },
  { id: "water", kind: "pantry", name: { en: "Drinking Water", hi: "पीने का पानी" }, unit: { en: "bottle", hi: "बोतल" }, icon: GlassWater },
  { id: "cups", kind: "pantry", name: { en: "Cups", hi: "कप" }, unit: { en: "pack", hi: "पैकेट" }, icon: CupSoda },
  { id: "other-p", kind: "pantry", name: { en: "Other", hi: "अन्य" }, unit: { en: "item", hi: "सामान" }, icon: MoreHorizontal },
  { id: "floor", kind: "cleaning", name: { en: "Floor Cleaner", hi: "फर्श क्लीनर" }, unit: { en: "bottle", hi: "बोतल" }, icon: Sparkles },
  { id: "glass", kind: "cleaning", name: { en: "Glass Cleaner", hi: "ग्लास क्लीनर" }, unit: { en: "bottle", hi: "बोतल" }, icon: SprayCan },
  { id: "disinfect", kind: "cleaning", name: { en: "Disinfectant", hi: "डिसइंफेक्टेंट" }, unit: { en: "bottle", hi: "बोतल" }, icon: Droplets },
  { id: "bags", kind: "cleaning", name: { en: "Garbage Bags", hi: "कूड़े की थैली" }, unit: { en: "roll", hi: "रोल" }, icon: Trash2 },
  { id: "gloves", kind: "cleaning", name: { en: "Gloves", hi: "दस्ताने" }, unit: { en: "pair", hi: "जोड़ी" }, icon: HandMetal },
  { id: "cloth", kind: "cleaning", name: { en: "Cleaning Cloth", hi: "सफाई का कपड़ा" }, unit: { en: "piece", hi: "पीस" }, icon: Wind },
  { id: "mop", kind: "cleaning", name: { en: "Mop", hi: "पोछा" }, unit: { en: "piece", hi: "पीस" }, icon: ShieldCheck },
  { id: "other-c", kind: "cleaning", name: { en: "Other", hi: "अन्य" }, unit: { en: "item", hi: "सामान" }, icon: MoreHorizontal },
];

type Request = {
  id: string;
  itemId: string;
  qty: number;
  urgent: boolean;
  reason?: string;
  state: ReqState;
  at: string;
  note?: Bi;
  history: { at: string; text: Bi }[];
};

const S = {
  title: { en: "Supplies", hi: "सामान" },
  newRequest: { en: "New Request", hi: "नया अनुरोध" },
  pending: { en: "Pending Requests", hi: "बाकी अनुरोध" },
  ready: { en: "Ready to Collect", hi: "लेने के लिए तैयार" },
  pantry: { en: "Pantry Supplies", hi: "पैंट्री सामान" },
  cleaning: { en: "Cleaning Supplies", hi: "सफाई सामान" },
  step1: { en: "Step 1 · Select Item", hi: "चरण 1 · सामान चुनें" },
  step2: { en: "Step 2 · Select Quantity", hi: "चरण 2 · मात्रा चुनें" },
  step3: { en: "Step 3 · Submit Request", hi: "चरण 3 · अनुरोध भेजें" },
  urgent: { en: "Urgent", hi: "ज़रूरी" },
  reason: { en: "Short reason (optional)", hi: "छोटा कारण (वैकल्पिक)" },
  photo: { en: "Add photo", hi: "फोटो लगाएं" },
  voice: { en: "Send voice note", hi: "आवाज़ नोट भेजें" },
  submit: { en: "Submit Request", hi: "अनुरोध भेजें" },
  back: { en: "Back", hi: "पीछे" },
  next: { en: "Next", hi: "आगे" },
  myRequests: { en: "My Requests", hi: "मेरे अनुरोध" },
  none: { en: "No requests yet", hi: "अभी कोई अनुरोध नहीं" },
  collect: { en: "Mark as Collected", hi: "ले लिया" },
  done: { en: "Request sent to your manager", hi: "अनुरोध मैनेजर को भेज दिया" },
  collected: { en: "Item collected", hi: "सामान ले लिया" },
  chooseItem: { en: "Choose an item first", hi: "पहले सामान चुनें" },
  soon: { en: "Coming soon", hi: "जल्द आएगा" },
  history: { en: "History", hi: "इतिहास" },
  qty: { en: "Quantity", hi: "मात्रा" },
};

const STATE_META: Record<ReqState, { label: Bi; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  requested: {
    label: { en: "Waiting for approval", hi: "मंज़ूरी का इंतज़ार" },
    cls: "bg-muted text-muted-foreground",
    icon: Clock,
  },
  approved: {
    label: { en: "Approved", hi: "मंज़ूर" },
    cls: "bg-blue-500/15 text-blue-700",
    icon: CheckCircle2,
  },
  ready: {
    label: { en: "Ready to collect", hi: "लेने के लिए तैयार" },
    cls: "bg-emerald-500/15 text-emerald-700",
    icon: PackageCheck,
  },
  collected: {
    label: { en: "Collected", hi: "ले लिया" },
    cls: "bg-emerald-500/15 text-emerald-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: { en: "Item unavailable", hi: "सामान नहीं है" },
    cls: "bg-destructive/15 text-destructive",
    icon: XCircle,
  },
};

const SAMPLE: Request[] = [
  {
    id: "R-104",
    itemId: "disinfect",
    qty: 2,
    urgent: true,
    state: "ready",
    at: "10:15 AM",
    reason: "Washroom stock finished",
    history: [
      { at: "10:15 AM", text: { en: "Request sent", hi: "अनुरोध भेजा" } },
      { at: "10:40 AM", text: { en: "Approved by manager", hi: "मैनेजर ने मंज़ूरी दी" } },
      { at: "11:30 AM", text: { en: "Kept at store room counter", hi: "स्टोर रूम काउंटर पर रखा" } },
    ],
  },
  {
    id: "R-103",
    itemId: "cups",
    qty: 4,
    urgent: false,
    state: "approved",
    at: "9:50 AM",
    history: [
      { at: "9:50 AM", text: { en: "Request sent", hi: "अनुरोध भेजा" } },
      { at: "10:20 AM", text: { en: "Approved by manager", hi: "मैनेजर ने मंज़ूरी दी" } },
    ],
  },
  {
    id: "R-102",
    itemId: "tea",
    qty: 2,
    urgent: false,
    state: "requested",
    at: "9:20 AM",
    history: [{ at: "9:20 AM", text: { en: "Request sent", hi: "अनुरोध भेजा" } }],
  },
  {
    id: "R-101",
    itemId: "mop",
    qty: 1,
    urgent: false,
    state: "rejected",
    at: "Yesterday",
    note: { en: "Stock will come tomorrow", hi: "स्टॉक कल आएगा" },
    history: [
      { at: "Yesterday", text: { en: "Request sent", hi: "अनुरोध भेजा" } },
      { at: "Yesterday", text: { en: "Rejected: stock unavailable", hi: "मना किया: स्टॉक नहीं" } },
    ],
  },
];

export function PantryCleaningSupplies({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const t = (v: Bi) => v[lang];
  const [requests, setRequests] = useState<Request[]>(SAMPLE);
  const [kind, setKind] = useState<Kind>("pantry");
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [itemId, setItemId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [urgent, setUrgent] = useState(false);
  const [reason, setReason] = useState("");
  const [photoAdded, setPhotoAdded] = useState(false);
  const [voiceAdded, setVoiceAdded] = useState(false);

  const items = useMemo(() => ITEMS.filter((i) => i.kind === kind), [kind]);
  const item = ITEMS.find((i) => i.id === itemId) ?? null;
  const pendingCount = requests.filter((r) => r.state === "requested" || r.state === "approved").length;
  const readyCount = requests.filter((r) => r.state === "ready").length;
  const soon = () => toast.info(t(S.soon));

  const openWizard = (k?: Kind) => {
    if (k) setKind(k);
    setStep(1);
    setItemId(null);
    setQty(1);
    setUrgent(false);
    setReason("");
    setPhotoAdded(false);
    setVoiceAdded(false);
    setWizard(true);
  };

  const submit = () => {
    if (!item) {
      toast.error(t(S.chooseItem));
      return;
    }
    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setRequests((prev) => [
      {
        id: `R-${105 + prev.length}`,
        itemId: item.id,
        qty,
        urgent,
        reason: reason || undefined,
        state: "requested",
        at: now,
        history: [{ at: now, text: { en: "Request sent", hi: "अनुरोध भेजा" } }],
      },
      ...prev,
    ]);
    setWizard(false);
    toast.success(t(S.done));
  };

  const markCollected = (id: string) => {
    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              state: "collected",
              history: [...r.history, { at: now, text: { en: "Collected by staff", hi: "स्टाफ ने ले लिया" } }],
            }
          : r,
      ),
    );
    toast.success(t(S.collected));
  };

  const ItemTile = ({ i, active, onClick }: { i: Item; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
        active ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"
      }`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          i.kind === "pantry" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
        }`}
      >
        <i.icon className="h-9 w-9" />
      </span>
      <span className="text-center text-sm font-semibold leading-tight">{t(i.name)}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="space-y-3 rounded-xl border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Boxes className="h-7 w-7 text-primary" />
            {t(S.title)}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <LangSwitch lang={lang} setLang={setLang} />
            <Button size="lg" className="h-12" onClick={() => openWizard()}>
              <Plus className="mr-2 h-5 w-5" /> {t(S.newRequest)}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-3">
            <div className="text-3xl font-bold tabular-nums text-amber-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">{t(S.pending)}</div>
          </div>
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-3">
            <div className="text-3xl font-bold tabular-nums text-emerald-600">{readyCount}</div>
            <div className="text-sm text-muted-foreground">{t(S.ready)}</div>
          </div>
        </div>
      </div>

      {/* two big categories */}
      <div className="grid gap-3 sm:grid-cols-2">
        {(["pantry", "cleaning"] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setKind(k);
              openWizard(k);
            }}
            className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left ${
              k === "pantry"
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-blue-500/50 bg-blue-500/5"
            }`}
          >
            <span
              className={`flex h-20 w-20 items-center justify-center rounded-2xl ${
                k === "pantry" ? "bg-amber-500/15 text-amber-600" : "bg-blue-500/15 text-blue-600"
              }`}
            >
              {k === "pantry" ? <Coffee className="h-11 w-11" /> : <SprayCan className="h-11 w-11" />}
            </span>
            <span className="text-xl font-bold">{k === "pantry" ? t(S.pantry) : t(S.cleaning)}</span>
          </button>
        ))}
      </div>

      {/* quick item grid for chosen category */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">
          {kind === "pantry" ? t(S.pantry) : t(S.cleaning)}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((i) => (
            <ItemTile
              key={i.id}
              i={i}
              active={false}
              onClick={() => {
                openWizard(kind);
                setItemId(i.id);
                setStep(2);
              }}
            />
          ))}
        </div>
      </div>

      {/* my requests */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">{t(S.myRequests)}</h2>
        {requests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-lg text-muted-foreground">
              {t(S.none)}
            </CardContent>
          </Card>
        )}
        {requests.map((r) => {
          const it = ITEMS.find((i) => i.id === r.itemId)!;
          const meta = STATE_META[r.state];
          return (
            <Card
              key={r.id}
              className={`border-2 ${
                r.state === "ready" || r.state === "collected"
                  ? "border-emerald-500/50"
                  : r.state === "rejected"
                    ? "border-destructive/50"
                    : r.urgent
                      ? "border-destructive/40"
                      : "border-border"
              }`}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                      it.kind === "pantry"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    <it.icon className="h-9 w-9" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold">{t(it.name)}</span>
                      {r.urgent && (
                        <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                          {t(S.urgent)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(S.qty)}: {r.qty} {t(it.unit)} · {r.at}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}
                    >
                      <meta.icon className="h-3.5 w-3.5" />
                      {t(meta.label)}
                    </span>
                  </div>
                </div>

                {r.reason && (
                  <p className="text-sm text-muted-foreground">
                    {lang === "hi" ? "कारण" : "Reason"}: {r.reason}
                  </p>
                )}
                {r.note && (
                  <p className="rounded-lg bg-muted p-3 text-sm">{t(r.note)}</p>
                )}

                {r.state === "ready" && (
                  <Button
                    size="lg"
                    className="h-14 w-full bg-emerald-600 text-base text-white hover:bg-emerald-700"
                    onClick={() => markCollected(r.id)}
                  >
                    <PackageCheck className="mr-2 h-6 w-6" /> {t(S.collect)}
                  </Button>
                )}

                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">{t(S.history)}</summary>
                  <ul className="mt-2 space-y-1">
                    {r.history.map((h, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        {h.at} — {t(h.text)}
                      </li>
                    ))}
                  </ul>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* request wizard */}
      <Dialog open={wizard} onOpenChange={setWizard}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {step === 1 ? t(S.step1) : step === 2 ? t(S.step2) : t(S.step3)}
            </DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(["pantry", "cleaning"] as Kind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`rounded-xl border-2 p-3 text-sm font-bold ${
                      kind === k ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    {k === "pantry" ? t(S.pantry) : t(S.cleaning)}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((i) => (
                  <ItemTile
                    key={i.id}
                    i={i}
                    active={itemId === i.id}
                    onClick={() => setItemId(i.id)}
                  />
                ))}
              </div>
              <Button
                size="lg"
                className="h-16 w-full text-lg"
                onClick={() => (itemId ? setStep(2) : toast.error(t(S.chooseItem)))}
              >
                {t(S.next)}
              </Button>
            </div>
          )}

          {step === 2 && item && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    item.kind === "pantry"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}
                >
                  <item.icon className="h-9 w-9" />
                </span>
                <div className="text-xl font-bold">{t(item.name)}</div>
              </div>
              <div className="flex items-center justify-center gap-6 rounded-2xl border-2 p-4">
                <Button
                  variant="outline"
                  className="h-16 w-16"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-8 w-8" />
                </Button>
                <div className="text-center">
                  <div className="text-5xl font-bold tabular-nums">{qty}</div>
                  <div className="text-sm text-muted-foreground">{t(item.unit)}</div>
                </div>
                <Button variant="outline" className="h-16 w-16" onClick={() => setQty((q) => q + 1)}>
                  <Plus className="h-8 w-8" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-14" onClick={() => setStep(1)}>
                  {t(S.back)}
                </Button>
                <Button size="lg" className="h-14" onClick={() => setStep(3)}>
                  {t(S.next)}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && item && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
                <item.icon className="h-8 w-8 text-primary" />
                <div className="text-lg font-bold">
                  {t(item.name)} · {qty} {t(item.unit)}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border-2 p-4">
                <span className="text-lg font-semibold">{t(S.urgent)}</span>
                <Switch checked={urgent} onCheckedChange={setUrgent} />
              </div>

              <Button
                variant={photoAdded ? "secondary" : "outline"}
                size="lg"
                className="h-14 w-full text-base"
                onClick={() => {
                  setPhotoAdded(true);
                  soon();
                }}
              >
                <Camera className="mr-2 h-6 w-6" /> {t(S.photo)}
              </Button>
              <Button
                variant={voiceAdded ? "secondary" : "outline"}
                size="lg"
                className="h-14 w-full text-base"
                onClick={() => {
                  setVoiceAdded(true);
                  soon();
                }}
              >
                <Mic className="mr-2 h-6 w-6" /> {t(S.voice)}
              </Button>

              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t(S.reason)}
                className="min-h-20 text-base"
              />

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-16" onClick={() => setStep(2)}>
                  {t(S.back)}
                </Button>
                <Button size="lg" className="h-16 text-lg" onClick={submit}>
                  {t(S.submit)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
