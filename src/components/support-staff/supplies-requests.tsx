import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Coffee,
  ImageIcon,
  Package,
  Plus,
  ShoppingCart,
  SprayCan,
  Truck,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type ReqStatus =
  | "new"
  | "under-review"
  | "approved"
  | "rejected"
  | "pending-purchase"
  | "received"
  | "issued"
  | "completed";

type HistoryEntry = { at: string; action: string; by: string; note?: string };

type SupplyRequest = {
  id: string;
  item: string;
  role: StaffRole;
  requestedBy: string;
  qty: number;
  approvedQty?: number;
  unit: string;
  reason: string;
  urgency: "normal" | "high" | "urgent";
  status: ReqStatus;
  requestedOn: string;
  requiredBy: string;
  photo?: boolean;
  rejectReason?: string;
  history: HistoryEntry[];
};

export const ITEM_CATEGORIES: Record<StaffRole, string[]> = {
  pantry: ["Tea", "Coffee", "Sugar", "Milk", "Drinking Water", "Cups", "Other"],
  cleaning: [
    "Floor Cleaner",
    "Glass Cleaner",
    "Disinfectant",
    "Garbage Bags",
    "Gloves",
    "Cloths and Mops",
    "Other",
  ],
  packing: ["Boxes", "Bags", "Tape", "Labels", "Wrapping Material", "Markers", "Other"],
};

const STOCK: Record<string, { available: number; min: number; unit: string; essential?: boolean }> = {
  Tea: { available: 3, min: 5, unit: "packets", essential: true },
  Coffee: { available: 8, min: 4, unit: "packets" },
  Sugar: { available: 6, min: 4, unit: "kg" },
  Milk: { available: 0, min: 6, unit: "litres", essential: true },
  "Drinking Water": { available: 14, min: 8, unit: "cans" },
  Cups: { available: 220, min: 150, unit: "pieces" },
  "Floor Cleaner": { available: 2, min: 4, unit: "bottles", essential: true },
  "Glass Cleaner": { available: 5, min: 3, unit: "bottles" },
  Disinfectant: { available: 4, min: 3, unit: "bottles" },
  "Garbage Bags": { available: 40, min: 50, unit: "pieces" },
  Gloves: { available: 12, min: 10, unit: "pairs" },
  "Cloths and Mops": { available: 7, min: 5, unit: "pieces" },
  Boxes: { available: 60, min: 100, unit: "pieces", essential: true },
  Bags: { available: 150, min: 100, unit: "pieces" },
  Tape: { available: 9, min: 6, unit: "rolls" },
  Labels: { available: 300, min: 200, unit: "pieces" },
  "Wrapping Material": { available: 3, min: 4, unit: "rolls" },
  Markers: { available: 11, min: 6, unit: "pieces" },
};

const ROLE_ICON = { pantry: Coffee, cleaning: SprayCan, packing: Package } as const;

const T = {
  title: { en: "Supplies & Requests", hi: "सप्लाई और अनुरोध" },
  sub: {
    en: "Review, approve and issue supply requests from pantry, cleaning and packing staff.",
    hi: "पैंट्री, सफाई और पैकिंग स्टाफ के सप्लाई अनुरोध देखें, मंज़ूर करें और जारी करें।",
  },
  newReq: { en: "New Requests", hi: "नए अनुरोध" },
  urgent: { en: "Urgent Requests", hi: "अर्जेंट अनुरोध" },
  approved: { en: "Approved", hi: "मंज़ूर" },
  pendingPurchase: { en: "Pending Purchase", hi: "खरीद बाकी" },
  completed: { en: "Completed", hi: "पूरा" },
  add: { en: "Add Request", hi: "अनुरोध जोड़ें" },
  all: { en: "All", hi: "सभी" },
  pantry: { en: "Pantry", hi: "पैंट्री" },
  cleaning: { en: "Cleaning", hi: "सफाई" },
  packing: { en: "Packing", hi: "पैकिंग" },
  review: { en: "Review", hi: "समीक्षा" },
  qty: { en: "Requested quantity", hi: "मांगी गई मात्रा" },
  by: { en: "Requested by", hi: "अनुरोधकर्ता" },
  date: { en: "Request date", hi: "अनुरोध तिथि" },
  reason: { en: "Reason", hi: "कारण" },
  avail: { en: "Currently available", hi: "उपलब्ध मात्रा" },
  requiredBy: { en: "Required by", hi: "कब तक चाहिए" },
  photo: { en: "Photo", hi: "फोटो" },
  prev: { en: "Previous requests for this item", hi: "इसी सामान के पिछले अनुरोध" },
  history: { en: "Approval & issue history", hi: "मंज़ूरी और जारी इतिहास" },
  noPrev: { en: "No earlier requests.", hi: "कोई पुराना अनुरोध नहीं।" },
  alerts: { en: "Low stock & attention alerts", hi: "कम स्टॉक और ध्यान देने योग्य अलर्ट" },
};

const STATUS_META: Record<ReqStatus, { en: string; hi: string; cls: string }> = {
  new: { en: "New", hi: "नया", cls: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  "under-review": { en: "Under Review", hi: "समीक्षा में", cls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200" },
  approved: { en: "Approved", hi: "मंज़ूर", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  rejected: { en: "Rejected", hi: "अस्वीकृत", cls: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
  "pending-purchase": { en: "Pending Purchase", hi: "खरीद बाकी", cls: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  received: { en: "Item Received", hi: "सामान मिला", cls: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200" },
  issued: { en: "Issued to Staff", hi: "स्टाफ को दिया", cls: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" },
  completed: { en: "Completed", hi: "पूरा", cls: "bg-muted text-muted-foreground" },
};

const URGENCY_META = {
  urgent: { en: "Urgent", hi: "अर्जेंट", cls: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
  high: { en: "High", hi: "ज़्यादा", cls: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  normal: { en: "Normal", hi: "सामान्य", cls: "bg-muted text-muted-foreground" },
} as const;

const now = new Date();
const d = (offset: number) => {
  const x = new Date(now);
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0, 10);
};
const stamp = () =>
  new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const SEED: SupplyRequest[] = [
  {
    id: "SR-101", item: "Milk", role: "pantry", requestedBy: "Ramesh Kumar", qty: 12, unit: "litres",
    reason: "Stock finished, morning tea service affected", urgency: "urgent", status: "new",
    requestedOn: d(-3), requiredBy: d(0), photo: true,
    history: [{ at: `${d(-3)} 09:10`, action: "Request raised", by: "Ramesh Kumar" }],
  },
  {
    id: "SR-102", item: "Floor Cleaner", role: "cleaning", requestedBy: "Sunita Devi", qty: 6, unit: "bottles",
    reason: "Below minimum level, washroom deep clean pending", urgency: "urgent", status: "new",
    requestedOn: d(-2), requiredBy: d(1),
    history: [{ at: `${d(-2)} 08:40`, action: "Request raised", by: "Sunita Devi" }],
  },
  {
    id: "SR-103", item: "Boxes", role: "packing", requestedBy: "Mohit Sharma", qty: 200, unit: "pieces",
    reason: "Jaipur dispatch bundles this week", urgency: "high", status: "under-review",
    requestedOn: d(-2), requiredBy: d(2),
    history: [
      { at: `${d(-2)} 11:05`, action: "Request raised", by: "Mohit Sharma" },
      { at: `${d(-1)} 10:00`, action: "Marked under review", by: "Administration Manager" },
    ],
  },
  {
    id: "SR-104", item: "Tea", role: "pantry", requestedBy: "Ramesh Kumar", qty: 10, unit: "packets",
    reason: "Weekly consumption", urgency: "normal", status: "approved", approvedQty: 8,
    requestedOn: d(-5), requiredBy: d(1),
    history: [
      { at: `${d(-5)} 09:00`, action: "Request raised", by: "Ramesh Kumar" },
      { at: `${d(-4)} 12:15`, action: "Approved with changed quantity (8 packets)", by: "Administration Manager", note: "Stock room already has 3 packets" },
    ],
  },
  {
    id: "SR-105", item: "Garbage Bags", role: "cleaning", requestedBy: "Arjun Yadav", qty: 100, unit: "pieces",
    reason: "Daily clearance across all floors", urgency: "normal", status: "pending-purchase", approvedQty: 100,
    requestedOn: d(-6), requiredBy: d(3),
    history: [
      { at: `${d(-6)} 15:20`, action: "Request raised", by: "Arjun Yadav" },
      { at: `${d(-5)} 10:30`, action: "Approved (100 pieces)", by: "Administration Manager" },
      { at: `${d(-5)} 10:32`, action: "Marked for purchase", by: "Administration Manager" },
    ],
  },
  {
    id: "SR-106", item: "Tape", role: "packing", requestedBy: "Pooja Verma", qty: 12, unit: "rolls",
    reason: "Carton sealing", urgency: "normal", status: "received", approvedQty: 12,
    requestedOn: d(-8), requiredBy: d(-1),
    history: [
      { at: `${d(-8)} 09:45`, action: "Request raised", by: "Pooja Verma" },
      { at: `${d(-7)} 11:00`, action: "Approved (12 rolls)", by: "Administration Manager" },
      { at: `${d(-6)} 16:00`, action: "Marked for purchase", by: "Administration Manager" },
      { at: `${d(-2)} 12:10`, action: "Item received in store room", by: "Administration Manager" },
    ],
  },
  {
    id: "SR-107", item: "Gloves", role: "cleaning", requestedBy: "Sunita Devi", qty: 10, unit: "pairs",
    reason: "Replacement for worn out gloves", urgency: "normal", status: "issued", approvedQty: 10,
    requestedOn: d(-10), requiredBy: d(-4),
    history: [
      { at: `${d(-10)} 08:20`, action: "Request raised", by: "Sunita Devi" },
      { at: `${d(-9)} 09:30`, action: "Approved (10 pairs)", by: "Administration Manager" },
      { at: `${d(-5)} 14:00`, action: "Issued to Sunita Devi", by: "Administration Manager" },
    ],
  },
  {
    id: "SR-108", item: "Cups", role: "pantry", requestedBy: "Ramesh Kumar", qty: 300, unit: "pieces",
    reason: "Guest visits and training batch", urgency: "normal", status: "completed", approvedQty: 300,
    requestedOn: d(-16), requiredBy: d(-10),
    history: [
      { at: `${d(-16)} 10:00`, action: "Request raised", by: "Ramesh Kumar" },
      { at: `${d(-15)} 11:00`, action: "Approved (300 pieces)", by: "Administration Manager" },
      { at: `${d(-12)} 10:00`, action: "Issued to Ramesh Kumar", by: "Administration Manager" },
      { at: `${d(-11)} 17:00`, action: "Request completed", by: "Administration Manager" },
    ],
  },
  {
    id: "SR-109", item: "Markers", role: "packing", requestedBy: "Mohit Sharma", qty: 20, unit: "pieces",
    reason: "Extra stock request", urgency: "normal", status: "rejected",
    requestedOn: d(-14), requiredBy: d(-7), rejectReason: "Sufficient stock available (11 pieces) — re-request after two weeks.",
    history: [
      { at: `${d(-14)} 09:15`, action: "Request raised", by: "Mohit Sharma" },
      { at: `${d(-13)} 12:00`, action: "Rejected", by: "Administration Manager", note: "Sufficient stock available (11 pieces)" },
    ],
  },
  {
    id: "SR-110", item: "Milk", role: "pantry", requestedBy: "Ramesh Kumar", qty: 6, unit: "litres",
    reason: "Second request — still not received", urgency: "high", status: "new",
    requestedOn: d(-1), requiredBy: d(1),
    history: [{ at: `${d(-1)} 08:05`, action: "Request raised", by: "Ramesh Kumar" }],
  },
];

const ACTIVE: ReqStatus[] = ["new", "under-review", "approved", "pending-purchase", "received", "issued"];

export function SuppliesRequests() {
  const [lang, setLang] = useState<Lang>("en");
  const [tab, setTab] = useState<"all" | StaffRole>("all");
  const [filter, setFilter] = useState<"all" | "new" | "urgent" | "approved" | "pending-purchase" | "completed">("all");
  const [reqs, setReqs] = useState<SupplyRequest[]>(SEED);
  const [stock, setStock] = useState(STOCK);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // review dialog local state
  const [newQty, setNewQty] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // add form
  const [fRole, setFRole] = useState<StaffRole>("pantry");
  const [fStaff, setFStaff] = useState("");
  const [fItem, setFItem] = useState("");
  const [fQty, setFQty] = useState("");
  const [fUnit, setFUnit] = useState("pieces");
  const [fReason, setFReason] = useState("");
  const [fPriority, setFPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [fDate, setFDate] = useState(d(2));
  const [fPhoto, setFPhoto] = useState(false);

  const t = (k: keyof typeof T) => T[k][lang];
  const open = reqs.find((r) => r.id === openId) || null;

  const counts = useMemo(
    () => ({
      new: reqs.filter((r) => r.status === "new").length,
      urgent: reqs.filter((r) => r.urgency === "urgent" && ACTIVE.includes(r.status)).length,
      approved: reqs.filter((r) => r.status === "approved").length,
      "pending-purchase": reqs.filter((r) => r.status === "pending-purchase").length,
      completed: reqs.filter((r) => r.status === "completed").length,
    }),
    [reqs],
  );

  const alerts = useMemo(() => {
    const out: { text: string; hi: string; level: "warn" | "danger" }[] = [];
    Object.entries(stock).forEach(([name, s]) => {
      if (s.available === 0 && s.essential) {
        out.push({ text: `${name} is finished — essential item unavailable.`, hi: `${name} खत्म है — ज़रूरी सामान उपलब्ध नहीं।`, level: "danger" });
      } else if (s.available <= s.min) {
        out.push({ text: `${name} at minimum level (${s.available} ${s.unit}, min ${s.min}).`, hi: `${name} न्यूनतम स्तर पर (${s.available} ${s.unit}, न्यूनतम ${s.min})।`, level: "warn" });
      }
    });
    const byItem: Record<string, number> = {};
    reqs.filter((r) => ACTIVE.includes(r.status)).forEach((r) => {
      byItem[r.item] = (byItem[r.item] || 0) + 1;
    });
    Object.entries(byItem).forEach(([item, n]) => {
      if (n > 1) out.push({ text: `${n} active requests pending for ${item}.`, hi: `${item} के लिए ${n} अनुरोध लंबित हैं।`, level: "warn" });
    });
    reqs.forEach((r) => {
      if (r.urgency === "urgent" && r.status === "new") {
        out.push({ text: `Urgent request ${r.id} (${r.item}) is still unreviewed.`, hi: `अर्जेंट अनुरोध ${r.id} (${r.item}) की समीक्षा बाकी है।`, level: "danger" });
      }
    });
    return out;
  }, [reqs, stock]);

  const urgencyRank = { urgent: 0, high: 1, normal: 2 } as const;
  const visible = useMemo(() => {
    let list = reqs;
    if (tab !== "all") list = list.filter((r) => r.role === tab);
    if (filter === "new") list = list.filter((r) => r.status === "new");
    else if (filter === "urgent") list = list.filter((r) => r.urgency === "urgent" && ACTIVE.includes(r.status));
    else if (filter === "approved") list = list.filter((r) => r.status === "approved");
    else if (filter === "pending-purchase") list = list.filter((r) => r.status === "pending-purchase");
    else if (filter === "completed") list = list.filter((r) => r.status === "completed");
    return [...list].sort(
      (a, b) =>
        urgencyRank[a.urgency] - urgencyRank[b.urgency] ||
        a.requestedOn.localeCompare(b.requestedOn),
    );
  }, [reqs, tab, filter]);

  const update = (id: string, patch: Partial<SupplyRequest>, entry: HistoryEntry) =>
    setReqs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, history: [...r.history, entry] } : r)),
    );

  const act = (r: SupplyRequest, next: ReqStatus) => {
    const entryFor: Record<string, string> = {
      approved: `Approved (${r.approvedQty ?? r.qty} ${r.unit})`,
      "pending-purchase": "Marked for purchase",
      received: "Item received in store room",
      issued: `Issued to ${r.requestedBy}`,
      completed: "Request completed",
      "under-review": "Marked under review",
    };
    const patch: Partial<SupplyRequest> = { status: next };
    if (next === "approved" && r.approvedQty === undefined) patch.approvedQty = r.qty;
    update(r.id, patch, { at: stamp(), action: entryFor[next], by: "Administration Manager" });

    if (next === "issued") {
      const qty = r.approvedQty ?? r.qty;
      setStock((prev) => {
        const s = prev[r.item];
        if (!s) return prev;
        return { ...prev, [r.item]: { ...s, available: Math.max(0, s.available - qty) } };
      });
      toast.success(
        lang === "en"
          ? `${qty} ${r.unit} of ${r.item} issued to ${r.requestedBy}. Stock updated.`
          : `${r.item} की ${qty} ${r.unit} ${r.requestedBy} को दी गई। स्टॉक अपडेट हुआ।`,
      );
    } else {
      toast.success(
        lang === "en"
          ? `${r.id} — ${STATUS_META[next].en}`
          : `${r.id} — ${STATUS_META[next].hi}`,
      );
    }
    if (next === "completed") setOpenId(null);
  };

  const approveDifferent = (r: SupplyRequest) => {
    const q = Number(newQty);
    if (!q || q <= 0) return toast.error(lang === "en" ? "Enter a valid quantity" : "सही मात्रा दर्ज करें");
    if (!changeReason.trim()) return toast.error(lang === "en" ? "Reason is required for quantity change" : "मात्रा बदलने का कारण ज़रूरी है");
    update(
      r.id,
      { status: "approved", approvedQty: q },
      { at: stamp(), action: `Approved with changed quantity (${q} ${r.unit})`, by: "Administration Manager", note: changeReason.trim() },
    );
    setNewQty("");
    setChangeReason("");
    toast.success(lang === "en" ? `Approved ${q} ${r.unit} of ${r.item}` : `${r.item} की ${q} ${r.unit} मंज़ूर`);
  };

  const reject = (r: SupplyRequest) => {
    if (!rejectReason.trim()) return toast.error(lang === "en" ? "Rejection reason is required" : "अस्वीकार करने का कारण ज़रूरी है");
    update(
      r.id,
      { status: "rejected", rejectReason: rejectReason.trim() },
      { at: stamp(), action: "Rejected", by: "Administration Manager", note: rejectReason.trim() },
    );
    setRejectReason("");
    setOpenId(null);
    toast.success(lang === "en" ? `${r.id} rejected — staff will see the reason.` : `${r.id} अस्वीकृत — स्टाफ को कारण दिखेगा।`);
  };

  const submitAdd = () => {
    const qty = Number(fQty);
    if (!fStaff || !fItem || !qty || !fReason.trim()) {
      return toast.error(lang === "en" ? "Fill staff, item, quantity and reason" : "स्टाफ, सामान, मात्रा और कारण भरें");
    }
    const dup = reqs.find((r) => r.item === fItem && r.role === fRole && ACTIVE.includes(r.status));
    if (dup) {
      return toast.error(
        lang === "en"
          ? `Active request ${dup.id} already exists for ${fItem}.`
          : `${fItem} के लिए ${dup.id} अनुरोध पहले से सक्रिय है।`,
      );
    }
    const id = `SR-${200 + reqs.length}`;
    setReqs((prev) => [
      {
        id, item: fItem, role: fRole, requestedBy: fStaff, qty, unit: fUnit,
        reason: fReason.trim(), urgency: fPriority, status: "new",
        requestedOn: d(0), requiredBy: fDate, photo: fPhoto,
        history: [{ at: stamp(), action: "Request raised", by: fStaff }],
      },
      ...prev,
    ]);
    setAddOpen(false);
    setFStaff(""); setFItem(""); setFQty(""); setFReason(""); setFPriority("normal"); setFPhoto(false);
    toast.success(lang === "en" ? `Request ${id} added` : `अनुरोध ${id} जोड़ा गया`);
  };

  const summary = [
    { key: "new" as const, label: t("newReq"), value: counts.new, cls: "text-blue-600" },
    { key: "urgent" as const, label: t("urgent"), value: counts.urgent, cls: "text-red-600" },
    { key: "approved" as const, label: t("approved"), value: counts.approved, cls: "text-emerald-600" },
    { key: "pending-purchase" as const, label: t("pendingPurchase"), value: counts["pending-purchase"], cls: "text-amber-600" },
    { key: "completed" as const, label: t("completed"), value: counts.completed, cls: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("sub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border">
            {(["en", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 text-xs font-medium ${lang === l ? "bg-primary text-primary-foreground" : "bg-background"}`}
              >
                {l === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t("add")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {summary.map((s) => (
          <button key={s.key} onClick={() => setFilter(filter === s.key ? "all" : s.key)} className="text-left">
            <Card className={filter === s.key ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {alerts.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              {t("alerts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-md border p-2 text-sm ${a.level === "danger" ? "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200" : "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"}`}
              >
                {lang === "en" ? a.text : a.hi}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">{t("all")}</TabsTrigger>
          <TabsTrigger value="pantry">{t("pantry")}</TabsTrigger>
          <TabsTrigger value="cleaning">{t("cleaning")}</TabsTrigger>
          <TabsTrigger value="packing">{t("packing")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 md:grid-cols-2">
        {visible.map((r) => {
          const Icon = ROLE_ICON[r.role];
          const st = STATUS_META[r.status];
          const ug = URGENCY_META[r.urgency];
          return (
            <Card key={r.id} className={r.urgency === "urgent" && ACTIVE.includes(r.status) ? "border-red-300" : ""}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-muted p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{r.item}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.id} · {ROLE_META[r.role].label}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={st.cls} variant="secondary">{st[lang]}</Badge>
                    <Badge className={ug.cls} variant="secondary">{ug[lang]}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">{t("qty")}: </span>
                    {r.qty} {r.unit}
                    {r.approvedQty !== undefined && r.approvedQty !== r.qty && (
                      <span className="ml-1 text-emerald-600">→ {r.approvedQty}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("by")}: </span>
                    {r.requestedBy}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("date")}: </span>
                    {r.requestedOn}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("requiredBy")}: </span>
                    {r.requiredBy}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("reason")}: {r.reason}
                </p>
                {r.status === "rejected" && r.rejectReason && (
                  <p className="rounded-md bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
                    {r.rejectReason}
                  </p>
                )}
                <Button size="sm" variant="outline" className="w-full" onClick={() => setOpenId(r.id)}>
                  {t("review")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {lang === "en" ? "No requests in this view." : "इस दृश्य में कोई अनुरोध नहीं।"}
          </p>
        )}
      </div>

      {/* Review dialog */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {open.item} · {open.id}
                </DialogTitle>
                <DialogDescription>
                  {ROLE_META[open.role].label} · {open.requestedBy}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3 text-sm">
                  <div className="text-xs text-muted-foreground">{t("avail")}</div>
                  <div className="font-semibold">
                    {stock[open.item]?.available ?? 0} {stock[open.item]?.unit ?? open.unit}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (min {stock[open.item]?.min ?? "-"})
                    </span>
                  </div>
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <div className="text-xs text-muted-foreground">{t("qty")}</div>
                  <div className="font-semibold">
                    {open.qty} {open.unit}
                    {open.approvedQty !== undefined && (
                      <span className="ml-1 text-emerald-600">
                        ({lang === "en" ? "approved" : "मंज़ूर"} {open.approvedQty})
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <div className="text-xs text-muted-foreground">{t("reason")}</div>
                  <div>{open.reason}</div>
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <div className="text-xs text-muted-foreground">{t("requiredBy")}</div>
                  <div>{open.requiredBy}</div>
                </div>
              </div>

              <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                <ImageIcon className="mr-2 h-4 w-4" />
                {open.photo
                  ? lang === "en" ? "Photo attached by staff" : "स्टाफ द्वारा फोटो संलग्न"
                  : lang === "en" ? "No photo attached" : "कोई फोटो नहीं"}
              </div>

              <div>
                <div className="mb-1 text-sm font-medium">{t("prev")}</div>
                <div className="space-y-1 text-xs">
                  {reqs
                    .filter((r) => r.item === open.item && r.id !== open.id)
                    .map((r) => (
                      <div key={r.id} className="flex justify-between rounded-md border p-2">
                        <span>
                          {r.id} · {r.requestedOn} · {r.qty} {r.unit}
                        </span>
                        <Badge variant="secondary" className={STATUS_META[r.status].cls}>
                          {STATUS_META[r.status][lang]}
                        </Badge>
                      </div>
                    ))}
                  {reqs.filter((r) => r.item === open.item && r.id !== open.id).length === 0 && (
                    <p className="text-muted-foreground">{t("noPrev")}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => act(open, "approved")} disabled={open.status !== "new" && open.status !== "under-review"}>
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    {lang === "en" ? "Approve" : "मंज़ूर करें"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(open, "under-review")} disabled={open.status !== "new"}>
                    {lang === "en" ? "Under Review" : "समीक्षा में रखें"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(open, "pending-purchase")} disabled={open.status !== "approved"}>
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    {lang === "en" ? "Mark for Purchase" : "खरीद के लिए भेजें"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(open, "received")} disabled={open.status !== "pending-purchase"}>
                    <Truck className="mr-1 h-4 w-4" />
                    {lang === "en" ? "Mark Item Received" : "सामान मिला"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(open, "issued")} disabled={open.status !== "received" && open.status !== "approved"}>
                    <Box className="mr-1 h-4 w-4" />
                    {lang === "en" ? "Issue to Staff" : "स्टाफ को दें"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => act(open, "completed")} disabled={open.status !== "issued"}>
                    {lang === "en" ? "Complete Request" : "अनुरोध पूरा करें"}
                  </Button>
                </div>

                {(open.status === "new" || open.status === "under-review") && (
                  <div className="space-y-3 rounded-md border p-3">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {lang === "en" ? "Approve different quantity" : "अलग मात्रा मंज़ूर करें"}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Input
                          className="w-28"
                          type="number"
                          value={newQty}
                          onChange={(e) => setNewQty(e.target.value)}
                          placeholder={open.unit}
                        />
                        <Input
                          className="min-w-40 flex-1"
                          value={changeReason}
                          onChange={(e) => setChangeReason(e.target.value)}
                          placeholder={lang === "en" ? "Reason for change (required)" : "बदलाव का कारण (ज़रूरी)"}
                        />
                        <Button size="sm" onClick={() => approveDifferent(open)}>
                          {lang === "en" ? "Approve Qty" : "मात्रा मंज़ूर"}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{lang === "en" ? "Reject request" : "अनुरोध अस्वीकार करें"}</Label>
                      <div className="flex flex-wrap gap-2">
                        <Textarea
                          className="min-w-40 flex-1"
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={lang === "en" ? "Reason shown to staff (required)" : "स्टाफ को दिखने वाला कारण (ज़रूरी)"}
                        />
                        <Button size="sm" variant="destructive" onClick={() => reject(open)}>
                          <XCircle className="mr-1 h-4 w-4" />
                          {lang === "en" ? "Reject" : "अस्वीकार"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-1 text-sm font-medium">{t("history")}</div>
                  <div className="space-y-1 text-xs">
                    {open.history.map((h, i) => (
                      <div key={i} className="rounded-md border p-2">
                        <span className="font-medium">{h.action}</span> · {h.by} · {h.at}
                        {h.note && <div className="text-muted-foreground">{h.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add request dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("add")}</DialogTitle>
            <DialogDescription>
              {lang === "en" ? "Raise a supply request on behalf of a staff member." : "स्टाफ की ओर से सप्लाई अनुरोध दर्ज करें।"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{lang === "en" ? "Staff category" : "स्टाफ श्रेणी"}</Label>
              <Select value={fRole} onValueChange={(v) => { setFRole(v as StaffRole); setFItem(""); setFStaff(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_META) as StaffRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{lang === "en" ? "Staff member" : "स्टाफ सदस्य"}</Label>
              <Select value={fStaff} onValueChange={setFStaff}>
                <SelectTrigger><SelectValue placeholder={lang === "en" ? "Select" : "चुनें"} /></SelectTrigger>
                <SelectContent>
                  {STAFF.filter((s) => s.role === fRole).map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{lang === "en" ? "Item name" : "सामान"}</Label>
              <Select value={fItem} onValueChange={(v) => { setFItem(v); if (STOCK[v]) setFUnit(STOCK[v].unit); }}>
                <SelectTrigger><SelectValue placeholder={lang === "en" ? "Select item" : "सामान चुनें"} /></SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES[fRole].map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{lang === "en" ? "Quantity" : "मात्रा"}</Label>
                <Input type="number" value={fQty} onChange={(e) => setFQty(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{lang === "en" ? "Unit" : "इकाई"}</Label>
                <Input value={fUnit} onChange={(e) => setFUnit(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">{t("reason")}</Label>
              <Textarea rows={2} value={fReason} onChange={(e) => setFReason(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{lang === "en" ? "Priority" : "प्राथमिकता"}</Label>
              <Select value={fPriority} onValueChange={(v) => setFPriority(v as typeof fPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{URGENCY_META.normal[lang]}</SelectItem>
                  <SelectItem value="high">{URGENCY_META.high[lang]}</SelectItem>
                  <SelectItem value="urgent">{URGENCY_META.urgent[lang]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("requiredBy")}</Label>
              <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setFPhoto(!fPhoto)}>
                <ImageIcon className="mr-1 h-4 w-4" />
                {fPhoto
                  ? lang === "en" ? "Photo attached" : "फोटो जोड़ी गई"
                  : lang === "en" ? "Attach photo (optional)" : "फोटो जोड़ें (वैकल्पिक)"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {lang === "en" ? "Cancel" : "रद्द करें"}
            </Button>
            <Button onClick={submitAdd}>{t("add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
