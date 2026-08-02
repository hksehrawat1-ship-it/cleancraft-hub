// Field Engineer — "My Expenses" (FAT: Food, Accommodation, Transportation).
// Mobile-first, bilingual, 4-step add flow. Every expense links to an assigned job.
import { useMemo, useState } from "react";
import {
  BedDouble,
  Bus,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileX,
  IndianRupee,
  Plus,
  Save,
  Upload,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JOBS, type Bi, type Lang } from "@/components/field-engineer/data";

type Cat = "food" | "stay" | "travel";
type Status = "draft" | "submitted" | "review" | "approved" | "rejected" | "paid";
type TabKey = "all" | "draft" | "pending" | "approved" | "rejected" | "paid";
type Bill = "photo" | "upload" | "none";

const T = {
  title: { en: "My Expenses", hi: "मेरे खर्च" },
  sub: {
    en: "Food, Accommodation and Transportation claims for your site visits.",
    hi: "आपकी साइट विज़िट के भोजन, आवास और यात्रा खर्च।",
  },
  month: { en: "This Month's Expenses", hi: "इस माह के खर्च" },
  pendingAmt: { en: "Pending Approval", hi: "स्वीकृति लंबित" },
  approvedAmt: { en: "Approved Amount", hi: "स्वीकृत राशि" },
  rejectedAmt: { en: "Rejected Amount", hi: "अस्वीकृत राशि" },
  add: { en: "Add Expense", hi: "खर्च जोड़ें" },
  tabs: {
    all: { en: "All", hi: "सभी" },
    draft: { en: "Draft", hi: "ड्राफ़्ट" },
    pending: { en: "Pending", hi: "लंबित" },
    approved: { en: "Approved", hi: "स्वीकृत" },
    rejected: { en: "Rejected", hi: "अस्वीकृत" },
    paid: { en: "Paid", hi: "भुगतान" },
  },
  step: { en: "Step", hi: "चरण" },
  of: { en: "of", hi: "में से" },
  steps: {
    job: { en: "Select Job", hi: "कार्य चुनें" },
    expense: { en: "Select Expense", hi: "खर्च चुनें" },
    bill: { en: "Add Bill", hi: "बिल जोड़ें" },
    submit: { en: "Submit", hi: "जमा करें" },
  },
  jobNo: { en: "Job No.", hi: "कार्य नं." },
  location: { en: "Visit Location", hi: "विज़िट स्थान" },
  visitDate: { en: "Visit Date", hi: "विज़िट तिथि" },
  select: { en: "Select", hi: "चुनें" },
  selected: { en: "Selected", hi: "चयनित" },
  cats: {
    food: { en: "Food", hi: "भोजन" },
    stay: { en: "Accommodation", hi: "आवास" },
    travel: { en: "Transportation", hi: "यात्रा" },
  },
  amount: { en: "Amount (₹)", hi: "राशि (₹)" },
  date: { en: "Expense date", hi: "खर्च की तिथि" },
  payment: { en: "Payment method", hi: "भुगतान माध्यम" },
  cash: { en: "Cash", hi: "नकद" },
  upi: { en: "UPI", hi: "यूपीआई" },
  card: { en: "Card", hi: "कार्ड" },
  note: { en: "Short note (optional)", hi: "छोटा नोट (वैकल्पिक)" },
  mode: { en: "Travel type", hi: "यात्रा का प्रकार" },
  modes: {
    bus: { en: "Bus", hi: "बस" },
    train: { en: "Train", hi: "ट्रेन" },
    auto: { en: "Auto", hi: "ऑटो" },
    taxi: { en: "Taxi", hi: "टैक्सी" },
    fuel: { en: "Fuel", hi: "ईंधन" },
    toll: { en: "Toll", hi: "टोल" },
    parking: { en: "Parking", hi: "पार्किंग" },
    other: { en: "Other", hi: "अन्य" },
  },
  billPhoto: { en: "Take Bill Photo", hi: "बिल की फ़ोटो लें" },
  billUpload: { en: "Upload Bill", hi: "बिल अपलोड करें" },
  billNone: { en: "No Bill Available", hi: "बिल उपलब्ध नहीं" },
  billReason: { en: "Reason for no bill", hi: "बिल न होने का कारण" },
  billStatus: { en: "Bill status", hi: "बिल स्थिति" },
  billAttached: { en: "Bill attached", hi: "बिल जुड़ा है" },
  relatedJob: { en: "Related job", hi: "संबंधित कार्य" },
  category: { en: "Expense category", hi: "खर्च श्रेणी" },
  notes: { en: "Notes", hi: "नोट्स" },
  saveDraft: { en: "Save Draft", hi: "ड्राफ़्ट सेव करें" },
  submitExp: { en: "Submit Expense", hi: "खर्च जमा करें" },
  back: { en: "Back", hi: "पीछे" },
  next: { en: "Next", hi: "आगे" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
  view: { en: "View", hi: "देखें" },
  none: { en: "No expenses here.", hi: "यहाँ कोई खर्च नहीं।" },
  needJob: { en: "Please select a job first", hi: "कृपया पहले कार्य चुनें" },
  needAmount: { en: "Please enter a valid amount", hi: "कृपया सही राशि भरें" },
  needBill: { en: "Bill or a no-bill reason is required", hi: "बिल या बिल न होने का कारण आवश्यक" },
  dupBill: { en: "This bill is already submitted", hi: "यह बिल पहले ही जमा है" },
  draftSaved: { en: "Draft saved on this device", hi: "ड्राफ़्ट इस डिवाइस पर सेव हुआ" },
  submittedMsg: {
    en: "Expense submitted. Approver notified (in-app). Approval is not automatic.",
    hi: "खर्च जमा हुआ। स्वीकृतकर्ता को सूचित किया गया (ऐप में)। स्वीकृति स्वतः नहीं होती।",
  },
  cannotDelete: {
    en: "Submitted expenses cannot be deleted. Corrections keep the original history.",
    hi: "जमा खर्च हटाया नहीं जा सकता। सुधार में मूल इतिहास सुरक्षित रहता है।",
  },
  rejectReason: { en: "Rejection reason", hi: "अस्वीकृति का कारण" },
  correct: { en: "Correct and Resubmit", hi: "सुधारें और दोबारा भेजें" },
  approvedAmount: { en: "Approved amount", hi: "स्वीकृत राशि" },
  paidOn: { en: "Payment date", hi: "भुगतान तिथि" },
  ref: { en: "Reference number", hi: "संदर्भ संख्या" },
  history: { en: "History", hi: "इतिहास" },
  soon: { en: "Will be enabled soon", hi: "जल्द चालू होगा" },
  cannotApprove: {
    en: "You cannot approve your own expenses.",
    hi: "आप अपने खर्च स्वयं स्वीकृत नहीं कर सकते।",
  },
};

const STATUS_LABEL: Record<Status, Bi> = {
  draft: { en: "Draft", hi: "ड्राफ़्ट" },
  submitted: { en: "Submitted", hi: "जमा" },
  review: { en: "Under Review", hi: "समीक्षा में" },
  approved: { en: "Approved", hi: "स्वीकृत" },
  rejected: { en: "Rejected", hi: "अस्वीकृत" },
  paid: { en: "Paid", hi: "भुगतान हुआ" },
};

function statusTone(s: Status) {
  if (s === "approved" || s === "paid")
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "rejected") return "bg-destructive/10 text-destructive border-destructive/30";
  if (s === "draft") return "bg-muted text-muted-foreground";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

const CAT_ICON: Record<Cat, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  stay: BedDouble,
  travel: Bus,
};

type Expense = {
  id: string;
  jobId: string;
  cat: Cat;
  mode?: keyof typeof T.modes;
  amount: number;
  date: string;
  pay: "cash" | "upi" | "card";
  note: Bi;
  bill: Bill;
  billReason?: string;
  status: Status;
  approvedAmount?: number;
  rejectReason?: Bi;
  paidOn?: string;
  ref?: string;
  version: number;
};

const SEED: Expense[] = [
  {
    id: "EXP-3101",
    jobId: "FE-2041",
    cat: "travel",
    mode: "auto",
    amount: 640,
    date: "2026-08-01",
    pay: "cash",
    note: { en: "Bus + auto to Vaishali Nagar", hi: "वैशाली नगर तक बस + ऑटो" },
    bill: "photo",
    status: "approved",
    approvedAmount: 640,
    version: 1,
  },
  {
    id: "EXP-3102",
    jobId: "FE-2041",
    cat: "food",
    amount: 220,
    date: "2026-08-01",
    pay: "upi",
    note: { en: "Lunch during site visit", hi: "साइट विज़िट के दौरान दोपहर का भोजन" },
    bill: "upload",
    status: "review",
    version: 1,
  },
  {
    id: "EXP-3103",
    jobId: "FE-2042",
    cat: "stay",
    amount: 1450,
    date: "2026-07-30",
    pay: "card",
    note: { en: "One night stay in Indore", hi: "इंदौर में एक रात का ठहराव" },
    bill: "photo",
    status: "paid",
    approvedAmount: 1450,
    paidOn: "2026-08-02",
    ref: "UTR-884512203",
    version: 1,
  },
  {
    id: "EXP-3104",
    jobId: "FE-2043",
    cat: "travel",
    mode: "fuel",
    amount: 900,
    date: "2026-07-29",
    pay: "cash",
    note: { en: "Bike fuel Lucknow visit", hi: "लखनऊ विज़िट के लिए बाइक ईंधन" },
    bill: "none",
    billReason: "Pump did not give receipt",
    status: "rejected",
    rejectReason: {
      en: "Bill missing. Please attach fuel receipt and resubmit.",
      hi: "बिल नहीं है। कृपया ईंधन की रसीद लगाकर दोबारा भेजें।",
    },
    version: 1,
  },
  {
    id: "EXP-3105",
    jobId: "FE-2039",
    cat: "food",
    amount: 180,
    date: "2026-08-02",
    pay: "cash",
    note: { en: "Tea and snacks", hi: "चाय और नाश्ता" },
    bill: "none",
    billReason: "Small shop, no bill",
    status: "draft",
    version: 1,
  },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function FieldEngineerExpenses({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<Expense[]>(SEED);
  const [tab, setTab] = useState<TabKey>("all");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState({
    jobId: "" as string,
    cat: "food" as Cat,
    mode: "auto" as keyof typeof T.modes,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    pay: "cash" as "cash" | "upi" | "card",
    note: "",
    bill: "" as "" | Bill,
    billReason: "",
  });

  const soon = () => toast.info(T.soon[lang]);
  const jobOf = (id: string) => JOBS.find((j) => j.id === id);

  const totals = useMemo(() => {
    const sum = (f: (e: Expense) => boolean) =>
      items.filter(f).reduce((a, b) => a + (b.approvedAmount ?? b.amount), 0);
    return {
      month: items.reduce((a, b) => a + b.amount, 0),
      pending: sum((e) => e.status === "submitted" || e.status === "review"),
      approved: sum((e) => e.status === "approved" || e.status === "paid"),
      rejected: sum((e) => e.status === "rejected"),
    };
  }, [items]);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    if (tab === "pending")
      return items.filter((e) => e.status === "submitted" || e.status === "review");
    return items.filter((e) => e.status === tab);
  }, [items, tab]);

  const resetForm = () => {
    setForm({
      jobId: "",
      cat: "food",
      mode: "auto",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      pay: "cash",
      note: "",
      bill: "",
      billReason: "",
    });
    setStep(1);
    setCorrectingId(null);
  };

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openCorrection = (e: Expense) => {
    setForm({
      jobId: e.jobId,
      cat: e.cat,
      mode: e.mode ?? "auto",
      amount: String(e.amount),
      date: e.date,
      pay: e.pay,
      note: e.note[lang],
      bill: e.bill,
      billReason: e.billReason ?? "",
    });
    setCorrectingId(e.id);
    setStep(1);
    setViewId(null);
    setOpen(true);
  };

  const validate = (target: number) => {
    if (target > 1 && !form.jobId) return T.needJob[lang];
    if (target > 2 && !(Number(form.amount) > 0)) return T.needAmount[lang];
    if (target > 3) {
      if (!form.bill) return T.needBill[lang];
      if (form.bill === "none" && !form.billReason.trim()) return T.needBill[lang];
    }
    return null;
  };

  const go = (target: number) => {
    const err = validate(target);
    if (err) {
      toast.error(err);
      return;
    }
    setStep(Math.min(4, Math.max(1, target)));
  };

  const isDuplicate = () =>
    items.some(
      (e) =>
        e.id !== correctingId &&
        e.status !== "draft" &&
        e.jobId === form.jobId &&
        e.cat === form.cat &&
        e.date === form.date &&
        e.amount === Number(form.amount),
    );

  const build = (status: Status, version: number): Expense => ({
    id: `EXP-${3100 + items.length + 6}`,
    jobId: form.jobId,
    cat: form.cat,
    mode: form.cat === "travel" ? form.mode : undefined,
    amount: Number(form.amount || 0),
    date: form.date,
    pay: form.pay,
    note: { en: form.note, hi: form.note },
    bill: (form.bill || "none") as Bill,
    billReason: form.bill === "none" ? form.billReason : undefined,
    status,
    version,
  });

  const saveDraft = () => {
    if (!form.jobId) {
      toast.error(T.needJob[lang]);
      return;
    }
    setItems((p) => [build("draft", 1), ...p]);
    toast.success(T.draftSaved[lang]);
    setOpen(false);
    resetForm();
  };

  const submitExpense = () => {
    const err = validate(4);
    if (err) {
      toast.error(err);
      return;
    }
    if (isDuplicate()) {
      toast.error(T.dupBill[lang]);
      return;
    }
    if (correctingId) {
      const orig = items.find((e) => e.id === correctingId);
      const v = (orig?.version ?? 1) + 1;
      const fresh = { ...build("submitted", v), id: `${correctingId}-v${v}` };
      setItems((p) => [fresh, ...p]); // original submission preserved in history
    } else {
      setItems((p) => [build("submitted", 1), ...p]);
    }
    toast.success(T.submittedMsg[lang]);
    setOpen(false);
    resetForm();
  };

  const viewed = viewId ? items.find((e) => e.id === viewId) : null;

  const kpis = [
    { label: T.month[lang], value: inr(totals.month), tone: "" },
    { label: T.pendingAmt[lang], value: inr(totals.pending), tone: "text-amber-600" },
    { label: T.approvedAmt[lang], value: inr(totals.approved), tone: "text-emerald-600" },
    { label: T.rejectedAmt[lang], value: inr(totals.rejected), tone: "text-destructive" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{T.title[lang]}</h1>
          <p className="text-sm text-muted-foreground">{T.sub[lang]}</p>
        </div>
        <Button className="h-12 text-base" onClick={openAdd}>
          <Plus className="w-5 h-5 mr-2" /> {T.add[lang]}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IndianRupee className="w-4 h-4 text-primary" /> {k.label}
              </div>
              <div className={`text-2xl font-bold mt-1 ${k.tone}`}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(["all", "draft", "pending", "approved", "rejected", "paid"] as TabKey[]).map((k) => (
          <Button
            key={k}
            className="h-11 text-sm"
            variant={tab === k ? "default" : "outline"}
            onClick={() => setTab(k)}
          >
            {T.tabs[k][lang]}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {T.none[lang]}
            </CardContent>
          </Card>
        )}
        {filtered.map((e) => {
          const Icon = CAT_ICON[e.cat];
          const j = jobOf(e.jobId);
          return (
            <Card key={e.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">
                        {T.cats[e.cat][lang]}
                        {e.mode ? ` · ${T.modes[e.mode][lang]}` : ""}
                      </div>
                      <div className="text-lg font-bold tabular-nums">{inr(e.amount)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.date} · {T.jobNo[lang]}: {e.jobId}
                      {e.version > 1 ? ` · v${e.version}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">{j?.city[lang] ?? "—"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline" className={statusTone(e.status)}>
                    {STATUS_LABEL[e.status][lang]}
                  </Badge>
                  <Button variant="outline" className="h-10" onClick={() => setViewId(e.id)}>
                    {T.view[lang]} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {e.status === "approved" && e.approvedAmount != null && (
                  <div className="text-xs text-emerald-700">
                    {T.approvedAmount[lang]}: {inr(e.approvedAmount)}
                  </div>
                )}
                {e.status === "paid" && (
                  <div className="text-xs text-emerald-700">
                    {T.approvedAmount[lang]}: {inr(e.approvedAmount ?? e.amount)} · {T.paidOn[lang]}
                    : {e.paidOn} · {T.ref[lang]}: {e.ref}
                  </div>
                )}
                {e.status === "rejected" && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                    <div className="text-xs text-destructive">
                      {T.rejectReason[lang]}: {e.rejectReason?.[lang]}
                    </div>
                    <Button className="h-11 w-full" onClick={() => openCorrection(e)}>
                      {T.correct[lang]}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        <p className="text-xs text-muted-foreground px-1">
          {T.cannotDelete[lang]} {T.cannotApprove[lang]}
        </p>
      </div>

      {/* View drawer/dialog */}
      <Dialog open={!!viewed} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent>
          {viewed && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {T.cats[viewed.cat][lang]} — {inr(viewed.amount)}
                </DialogTitle>
                <DialogDescription>
                  {viewed.id} · {T.jobNo[lang]}: {viewed.jobId}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <Row k={T.relatedJob[lang]} v={jobOf(viewed.jobId)?.store[lang] ?? "—"} />
                <Row k={T.date[lang]} v={viewed.date} />
                <Row
                  k={T.payment[lang]}
                  v={
                    viewed.pay === "cash"
                      ? T.cash[lang]
                      : viewed.pay === "upi"
                        ? T.upi[lang]
                        : T.card[lang]
                  }
                />
                <Row
                  k={T.billStatus[lang]}
                  v={
                    viewed.bill === "none"
                      ? `${T.billNone[lang]} — ${viewed.billReason ?? ""}`
                      : T.billAttached[lang]
                  }
                />
                <Row k={T.notes[lang]} v={viewed.note[lang] || "—"} />
                <Row k={T.history[lang]} v={`v${viewed.version}`} />
              </div>
              <DialogFooter>
                <Badge variant="outline" className={statusTone(viewed.status)}>
                  {STATUS_LABEL[viewed.status][lang]}
                </Badge>
                {viewed.status === "rejected" && (
                  <Button onClick={() => openCorrection(viewed)}>{T.correct[lang]}</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add expense — 4 steps */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {T.step[lang]} {step} {T.of[lang]} 4 —{" "}
              {[T.steps.job, T.steps.expense, T.steps.bill, T.steps.submit][step - 1][lang]}
            </DialogTitle>
            <DialogDescription>
              {correctingId ? `${T.correct[lang]} · ${correctingId}` : T.add[lang]}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <div className="space-y-4 py-2">
            {step === 1 &&
              JOBS.map((j) => {
                const active = form.jobId === j.id;
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setForm({ ...form, jobId: j.id })}
                    className={`w-full text-left border rounded-lg p-4 ${
                      active ? "border-primary bg-primary/5" : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{j.store[lang]}</div>
                      <Badge variant={active ? "default" : "outline"}>
                        {active ? T.selected[lang] : T.select[lang]}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {T.jobNo[lang]}: {j.id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {T.location[lang]}: {j.city[lang]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {T.visitDate[lang]}: {j.slot[lang]}
                    </div>
                  </button>
                );
              })}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(["food", "stay", "travel"] as Cat[]).map((c) => {
                    const Icon = CAT_ICON[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, cat: c })}
                        className={`h-24 border rounded-lg flex flex-col items-center justify-center gap-2 ${
                          form.cat === c ? "border-primary bg-primary/5" : "bg-muted/20"
                        }`}
                      >
                        <Icon className="w-7 h-7 text-primary" />
                        <span className="text-xs font-medium text-center px-1">
                          {T.cats[c][lang]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {form.cat === "travel" && (
                  <div>
                    <Label>{T.mode[lang]}</Label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {(Object.keys(T.modes) as (keyof typeof T.modes)[]).map((m) => (
                        <Button
                          key={m}
                          className="h-11 text-xs"
                          variant={form.mode === m ? "default" : "outline"}
                          onClick={() => setForm({ ...form, mode: m })}
                        >
                          {T.modes[m][lang]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>{T.amount[lang]}</Label>
                  <Input
                    className="h-12 text-lg"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{T.date[lang]}</Label>
                  <Input
                    className="h-12"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{T.payment[lang]}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(["cash", "upi", "card"] as const).map((p) => (
                      <Button
                        key={p}
                        className="h-12"
                        variant={form.pay === p ? "default" : "outline"}
                        onClick={() => setForm({ ...form, pay: p })}
                      >
                        <Wallet className="w-4 h-4 mr-1" />
                        {p === "cash" ? T.cash[lang] : p === "upi" ? T.upi[lang] : T.card[lang]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>{T.note[lang]}</Label>
                  <Textarea
                    rows={2}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {(
                  [
                    ["photo", T.billPhoto[lang], Camera],
                    ["upload", T.billUpload[lang], Upload],
                    ["none", T.billNone[lang], FileX],
                  ] as [Bill, string, typeof Camera][]
                ).map(([k, label, Icon]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm({ ...form, bill: k })}
                    className={`w-full h-16 border rounded-lg flex items-center gap-3 px-4 ${
                      form.bill === k ? "border-primary bg-primary/5" : "bg-muted/20"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
                {form.bill === "none" && (
                  <div>
                    <Label>{T.billReason[lang]}</Label>
                    <Input
                      className="h-12"
                      value={form.billReason}
                      onChange={(e) => setForm({ ...form, billReason: e.target.value })}
                    />
                  </div>
                )}
                {form.bill !== "none" && form.bill !== "" && (
                  <div className="h-28 border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    {T.soon[lang]}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-2 text-sm">
                <Row k={T.relatedJob[lang]} v={jobOf(form.jobId)?.store[lang] ?? "—"} />
                <Row
                  k={T.category[lang]}
                  v={`${T.cats[form.cat][lang]}${
                    form.cat === "travel" ? ` · ${T.modes[form.mode][lang]}` : ""
                  }`}
                />
                <Row k={T.date[lang]} v={form.date} />
                <Row k={T.amount[lang]} v={inr(Number(form.amount || 0))} />
                <Row
                  k={T.billStatus[lang]}
                  v={
                    form.bill === "none"
                      ? `${T.billNone[lang]} — ${form.billReason}`
                      : T.billAttached[lang]
                  }
                />
                <Row k={T.notes[lang]} v={form.note || "—"} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                  <Button className="h-14 text-base" variant="outline" onClick={saveDraft}>
                    <Save className="w-5 h-5 mr-2" /> {T.saveDraft[lang]}
                  </Button>
                  <Button className="h-14 text-base" onClick={submitExpense}>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> {T.submitExp[lang]}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2">
            <Button
              className="h-12"
              variant="outline"
              disabled={step === 1}
              onClick={() => go(step - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> {T.back[lang]}
            </Button>
            <Button className="h-12" disabled={step === 4} onClick={() => go(step + 1)}>
              {T.next[lang]} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b pb-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
