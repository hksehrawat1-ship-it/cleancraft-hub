import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Lock,
  MapPin,
  Package,
  PenLine,
  Search,
  Truck,
} from "lucide-react";
import {
  DELAY_REASONS,
  DELIVERIES,
  DELIVERY_CHECKS,
  DELIVERY_OUTCOMES,
  DEL_STATUS_LABEL,
  DEL_STATUS_TONE,
  EXECUTIVES,
  ITEM_TYPES,
  RECIPIENT_ROLES,
  TODAY,
  TRANSPORT_PLATFORMS,
  type DeliveryOutcome,
  type DeliveryRecord,
  type DeliveryStatus,
} from "./delivery-data";

const TABS: { key: string; label: string; match: DeliveryStatus[] }[] = [
  { key: "expected", label: "Expected Today", match: ["expected", "dispatched"] },
  { key: "pending", label: "Confirmation Pending", match: ["delivered", "proof_received"] },
  { key: "delivered", label: "Delivered", match: ["recipient_confirmed", "closed"] },
  { key: "partial", label: "Partial Delivery", match: ["partial"] },
  { key: "damaged", label: "Damaged or Missing", match: ["damaged", "missing", "refused"] },
  { key: "delayed", label: "Delayed", match: ["delayed"] },
  { key: "returned", label: "Returned", match: ["return_required"] },
  { key: "all", label: "All", match: [] },
];

const IN_TRANSIT: DeliveryStatus[] = ["dispatched", "expected", "delayed"];

const maskMobile = (m?: string | null) => m ?? "—";

export function LogisticsDeliveryConfirmation() {
  const [rows, setRows] = useState<DeliveryRecord[]>(DELIVERIES);
  const [tab, setTab] = useState("expected");
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [fProject, setFProject] = useState("all");
  const [fStore, setFStore] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [fPlatform, setFPlatform] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fExec, setFExec] = useState("all");
  const [fItem, setFItem] = useState("all");
  const [fExpected, setFExpected] = useState("");
  const [fActual, setFActual] = useState("");

  const patch = (id: string, up: Partial<DeliveryRecord>, log?: { by: string; action: string }) =>
    setRows((prev) =>
      prev.map((r) =>
        r.dispatchId === id
          ? {
              ...r,
              ...up,
              history: log ? [...r.history, { at: `${TODAY} now`, by: log.by, action: log.action }] : r.history,
            }
          : r,
      ),
    );

  const counts = useMemo(() => {
    const c = (f: (r: DeliveryRecord) => boolean) => rows.filter(f).length;
    return {
      expectedToday: c((r) => IN_TRANSIT.includes(r.status) && r.expectedDate === TODAY),
      confirmPending: c((r) => ["delivered", "proof_received"].includes(r.status)),
      deliveredToday: c((r) => r.actualDate === TODAY),
      partial: c((r) => r.status === "partial"),
      damaged: c((r) => ["damaged", "missing", "refused"].includes(r.status)),
      delayed: c((r) => r.status === "delayed"),
    };
  }, [rows]);

  const alerts = useMemo(() => {
    const list: { tone: "red" | "amber"; text: string }[] = [];
    rows.forEach((r) => {
      if (IN_TRANSIT.includes(r.status) && r.expectedDate < TODAY)
        list.push({ tone: "red", text: `${r.dispatchId} · Expected delivery date passed (${r.expectedDate})` });
      if (["delivered", "closed", "recipient_confirmed"].includes(r.status) && r.proofPhotos === 0)
        list.push({ tone: "red", text: `${r.dispatchId} · Delivery marked complete without proof` });
      if (r.packagesReceived != null && r.packagesReceived !== r.packagesExpected)
        list.push({
          tone: "amber",
          text: `${r.dispatchId} · Package-count mismatch — ${r.packagesReceived} of ${r.packagesExpected} received`,
        });
      if (r.items.some((i) => i.serial && i.qtyReceived === 0))
        list.push({ tone: "amber", text: `${r.dispatchId} · Machine serial number not verified on delivery` });
      if (r.status === "damaged") list.push({ tone: "red", text: `${r.dispatchId} · Damage reported — issue ${r.damage?.issueId}` });
      if (r.status === "missing") list.push({ tone: "red", text: `${r.dispatchId} · Item missing on delivery` });
      if (r.status === "refused") list.push({ tone: "red", text: `${r.dispatchId} · Delivery refused at site` });
      if (r.status === "partial" && !r.partial?.remainingDate)
        list.push({ tone: "red", text: `${r.dispatchId} · Partial delivery without a remaining-delivery date` });
      if (r.delay?.launchImpact) list.push({ tone: "amber", text: `${r.dispatchId} · Project launch affected — ${r.delay.launchImpact}` });
      if (["delivered", "proof_received"].includes(r.status) && r.actualDate && r.actualDate < TODAY)
        list.push({ tone: "amber", text: `${r.dispatchId} · Recipient confirmation overdue since ${r.actualDate}` });
    });
    return list;
  }, [rows]);

  const filtered = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === "expected" && r.expectedDate > TODAY) return false;
      if (t.match.length && !t.match.includes(r.status)) return false;
      if (
        q &&
        ![r.dispatchId, r.clearanceId, r.projectId, r.store, r.city, r.awb, r.bookingRef]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (fProject !== "all" && r.projectId !== fProject) return false;
      if (fStore !== "all" && r.store !== fStore) return false;
      if (fCity !== "all" && r.city !== fCity) return false;
      if (fPlatform !== "all" && r.platform !== fPlatform) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fExec !== "all" && r.executive !== fExec) return false;
      if (fItem !== "all" && !r.items.some((i) => i.type === fItem)) return false;
      if (fExpected && r.expectedDate !== fExpected) return false;
      if (fActual && r.actualDate !== fActual) return false;
      return true;
    });
  }, [rows, tab, search, fProject, fStore, fCity, fPlatform, fStatus, fExec, fItem, fExpected, fActual]);

  const open = rows.find((r) => r.dispatchId === openId) || null;

  if (open) return <DeliveryDetail record={open} onBack={() => setOpenId(null)} patch={patch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Delivery Confirmation</h2>
          <p className="text-sm text-muted-foreground">
            Confirm dispatched items were delivered correctly and accepted by the franchise owner or authorised site contact.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search dispatch, project, store, AWB/LR"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Delivery Expected Today" value={counts.expectedToday} tone="blue" />
        <Kpi label="Confirmation Pending" value={counts.confirmPending} tone="amber" />
        <Kpi label="Delivered Today" value={counts.deliveredToday} tone="green" />
        <Kpi label="Partial Deliveries" value={counts.partial} tone="amber" />
        <Kpi label="Damaged Deliveries" value={counts.damaged} tone="red" />
        <Kpi label="Delayed Deliveries" value={counts.delayed} tone="amber" />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-md border px-3 py-2 text-sm ${
                  a.tone === "red"
                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">
              {t.label}
              <span className="ml-1 text-muted-foreground">
                ({t.match.length ? rows.filter((r) => t.match.includes(r.status)).length : rows.length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Franchise project" value={fProject} onChange={setFProject} options={[...new Set(rows.map((r) => r.projectId))]} />
          <FilterSelect label="Franchise or store" value={fStore} onChange={setFStore} options={[...new Set(rows.map((r) => r.store))]} />
          <FilterSelect label="Destination city" value={fCity} onChange={setFCity} options={[...new Set(rows.map((r) => r.city))]} />
          <FilterSelect label="Transport platform" value={fPlatform} onChange={setFPlatform} options={TRANSPORT_PLATFORMS} />
          <FilterSelect
            label="Delivery status"
            value={fStatus}
            onChange={setFStatus}
            options={Object.keys(DEL_STATUS_LABEL)}
            render={(k) => DEL_STATUS_LABEL[k as DeliveryStatus]}
          />
          <FilterSelect label="Logistics Executive" value={fExec} onChange={setFExec} options={EXECUTIVES} />
          <FilterSelect label="Item type" value={fItem} onChange={setFItem} options={ITEM_TYPES} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Expected date</Label>
              <Input type="date" value={fExpected} onChange={(e) => setFExpected(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Actual date</Label>
              <Input type="date" value={fActual} onChange={(e) => setFActual(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((r) => (
          <DeliveryCard key={r.dispatchId} record={r} onOpen={() => setOpenId(r.dispatchId)} />
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No deliveries in this view.</p>}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "blue" | "amber" | "green" | "red" }) {
  const cls =
    tone === "green"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : tone === "red"
          ? "text-destructive"
          : tone === "blue"
            ? "text-primary"
            : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{render ? render(o) : o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DeliveryCard({ record, onOpen }: { record: DeliveryRecord; onOpen: () => void }) {
  const late = IN_TRANSIT.includes(record.status) && record.expectedDate < TODAY;
  return (
    <Card className={late ? "border-destructive/40" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{record.dispatchId}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {record.projectId} · {record.clearanceId} · {record.packingTaskId}
            </p>
          </div>
          <Badge variant="outline" className={DEL_STATUS_TONE[record.status]}>
            {DEL_STATUS_LABEL[record.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {record.store} · {record.city}</span>
          <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {record.packagesExpected} packages</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Transport platform</p>
            <p className="font-medium">{record.platform}</p>
          </div>
          <div>
            <p className="text-muted-foreground">AWB / LR number</p>
            <p className="font-medium">{record.awb}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected delivery</p>
            <p className={`font-medium ${late ? "text-destructive" : ""}`}>{record.expectedDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Actual delivery</p>
            <p className="font-medium">{record.actualDate ?? "—"}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onOpen}>
          Confirm Delivery
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Detail view ------------------------------- */

function DeliveryDetail({
  record,
  onBack,
  patch,
}: {
  record: DeliveryRecord;
  onBack: () => void;
  patch: (id: string, up: Partial<DeliveryRecord>, log?: { by: string; action: string }) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const [outcome, setOutcome] = useState<DeliveryOutcome>("Delivered in Full");
  const [date, setDate] = useState(TODAY);
  const [time, setTime] = useState("");
  const [receivedBy, setReceivedBy] = useState(record.siteContact.name);
  const [mobile, setMobile] = useState(record.siteContact.mobile);
  const [role, setRole] = useState(record.siteContact.role);
  const [pkgExpected] = useState(record.packagesExpected);
  const [pkgReceived, setPkgReceived] = useState(String(record.packagesExpected));
  const [condition, setCondition] = useState("Good — no visible damage");
  const [proof, setProof] = useState(record.proofPhotos);
  const [comments, setComments] = useState("");
  const [note, setNote] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  // partial
  const [pDelivered, setPDelivered] = useState("");
  const [pPending, setPPending] = useState("");
  const [pQtyD, setPQtyD] = useState("");
  const [pQtyP, setPQtyP] = useState("");
  const [pReason, setPReason] = useState("");
  const [pDate, setPDate] = useState("");
  const [pNext, setPNext] = useState("");
  const [pWho, setPWho] = useState(EXECUTIVES[0]);

  // damage / missing
  const [dItem, setDItem] = useState(record.items[0]?.name ?? "");
  const [dQty, setDQty] = useState("1");
  const [dDesc, setDDesc] = useState("");
  const [dPhotos, setDPhotos] = useState(0);
  const [dTransporter, setDTransporter] = useState("");
  const [dRecipient, setDRecipient] = useState("");
  const [dAction, setDAction] = useState("");
  const [dRepl, setDRepl] = useState<"Replacement" | "Return" | "Under review">("Replacement");
  const [dPriority, setDPriority] = useState<"urgent" | "high" | "normal">("high");

  // delay
  const [delReason, setDelReason] = useState(DELAY_REASONS[0]);
  const [delDate, setDelDate] = useState("");
  const [delResponse, setDelResponse] = useState("");
  const [delImpact, setDelImpact] = useState("");
  const [delFollow, setDelFollow] = useState("");
  const [delWho, setDelWho] = useState(EXECUTIVES[0]);

  const [confirmMethod, setConfirmMethod] = useState("Manual Authorised");
  const [confirmBy, setConfirmBy] = useState(record.siteContact.name);

  const isPartial = outcome === "Partial Delivery";
  const isDamage = outcome === "Delivered with Damage" || outcome === "Item Missing" || outcome === "Return Required";
  const isDelay = outcome === "Delivery Delayed" || outcome === "Address Problem" || outcome === "Delivery Refused";

  const checksDone = DELIVERY_CHECKS.every((c) => checks[c.key]);
  const canSubmit = (() => {
    if (isDelay && outcome === "Delivery Delayed") return !!delDate && !!delResponse && !!delFollow;
    if (isPartial) return !!pDelivered && !!pPending && !!pDate && !!pNext;
    if (isDamage) return !!dDesc && dPhotos > 0 && !!dAction;
    return checksDone && proof > 0 && !!time && !!receivedBy;
  })();

  const statusFor = (o: DeliveryOutcome): DeliveryStatus =>
    o === "Delivered in Full"
      ? "delivered"
      : o === "Partial Delivery"
        ? "partial"
        : o === "Delivered with Damage"
          ? "damaged"
          : o === "Item Missing"
            ? "missing"
            : o === "Delivery Delayed" || o === "Address Problem"
              ? "delayed"
              : o === "Delivery Refused"
                ? "refused"
                : "return_required";

  const submit = () => {
    const issueId = `ISS-0${450 + Math.floor(Math.random() * 40)}`;
    const up: Partial<DeliveryRecord> = {
      status: statusFor(outcome),
      outcome,
      actualDate: isDelay && outcome === "Delivery Delayed" ? record.actualDate : date,
      actualTime: isDelay && outcome === "Delivery Delayed" ? record.actualTime : time,
      receivedBy,
      recipientMobile: mobile,
      recipientRole: role,
      itemCondition: condition,
      proofPhotos: Math.max(proof, dPhotos),
      recipientComments: comments,
      logisticsNote: note,
      packagesReceived: isDelay ? record.packagesReceived : Number(pkgReceived),
      checks,
    };
    let action = `${outcome} recorded on the same Dispatch ID ${record.dispatchId} (Clearance ${record.clearanceId}, Project ${record.projectId}).`;

    if (isPartial) {
      up.partial = {
        delivered: pDelivered,
        pending: pPending,
        qtyDelivered: Number(pQtyD || 0),
        qtyPending: Number(pQtyP || 0),
        reason: pReason,
        remainingDate: pDate,
        nextAction: pNext,
        responsible: pWho,
      };
      action += ` Issue ${issueId} created under the same Dispatch ID. Remaining delivery expected ${pDate}.`;
    }
    if (isDamage) {
      up.damage = {
        item: dItem,
        qty: Number(dQty || 1),
        description: dDesc,
        photos: dPhotos,
        transporterNote: dTransporter,
        recipientNote: dRecipient,
        immediateAction: dAction,
        replacementOrReturn: dRepl,
        priority: dPriority,
        issueId,
      };
      action += ` Linked issue ${issueId} created in Issues & Returns. Any replacement dispatch will reference ${record.dispatchId} and ${issueId}.`;
    }
    if (isDelay && outcome === "Delivery Delayed") {
      up.delay = {
        reason: delReason,
        updatedDate: delDate,
        transporterResponse: delResponse,
        launchImpact: delImpact,
        followUpDate: delFollow,
        responsible: delWho,
      };
      up.expectedDate = delDate;
      action += ` Updated expected delivery ${delDate}.${delImpact ? " Project Coordinator notified — launch timeline may be affected." : ""}`;
    }

    patch(record.dispatchId, up, { by: "Logistics Executive", action });
    patch(record.dispatchId, {}, { by: "System", action: "Accounts Manager and Project Coordinator updated with the delivery outcome." });
    setFormOpen(false);
    toast.success(`${outcome} recorded for ${record.dispatchId}`);
  };

  const canClose =
    ["delivered", "proof_received", "recipient_confirmed"].includes(record.status) &&
    record.proofPhotos > 0 &&
    !!record.recipientConfirmation.method;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Delivery Confirmation
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>{record.dispatchId}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {record.store} · {record.city} · {record.clearanceId} · {record.projectId} · Packing {record.packingTaskId}
              </p>
            </div>
            <Badge variant="outline" className={DEL_STATUS_TONE[record.status]}>
              {DEL_STATUS_LABEL[record.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-4">
          <Field label="Transport platform" value={record.platform} />
          <Field label="Transporter" value={record.transporter} />
          <Field label="Booking reference" value={record.bookingRef} />
          <Field label="AWB / LR number" value={record.awb} />
          <Field label="Expected delivery" value={record.expectedDate} />
          <Field label="Actual delivery" value={record.actualDate ? `${record.actualDate} ${record.actualTime ?? ""}` : "—"} />
          <Field label="Packages" value={`${record.packagesReceived ?? "—"} received / ${record.packagesExpected} expected`} />
          <Field label="Logistics Executive" value={record.executive} />
          <div className="sm:col-span-4">
            <p className="text-xs text-muted-foreground">Delivery address</p>
            <p>{record.address}</p>
          </div>
          <div className="sm:col-span-4 rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Site contact</p>
                <p>
                  {record.siteContact.name} · {record.siteContact.role} ·{" "}
                  {showContact ? record.siteContact.mobile : "•••• hidden"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowContact((v) => !v)}>
                <Lock className="mr-2 h-3.5 w-3.5" /> {showContact ? "Hide" : "Reveal"} contact
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Recipient contact details are visible to authorised users only. Financial details are never shown here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Package and item list</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {record.items.map((it) => (
            <div key={it.packageNo + it.name} className="flex gap-3 rounded-lg border p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-2xl">{it.emoji}</div>
              <div className="text-sm">
                <p className="font-medium">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.type} · {it.packageNo}</p>
                <p className="text-xs">
                  Dispatched {it.qtyDispatched}
                  {it.qtyReceived != null && ` · Received ${it.qtyReceived}`}
                  {it.serial && ` · Serial ${it.serial}`}
                </p>
                {it.qtyReceived != null && it.qtyReceived !== it.qtyDispatched && (
                  <Badge variant="outline" className="mt-1 bg-destructive/10 text-destructive border-destructive/20">
                    Quantity shortfall
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {(record.proofPhotos > 0 || record.proofDocs.length > 0 || record.recipientComments) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delivery proof & recipient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: record.proofPhotos }).map((_, i) => (
                <div key={i} className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
              {record.proofPhotos === 0 && <span className="text-xs text-muted-foreground">No photo proof</span>}
            </div>
            {record.proofDocs.map((d) => (
              <p key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> {d}
              </p>
            ))}
            <Separator />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Received by" value={record.receivedBy ?? "—"} />
              <Field label="Recipient role" value={record.recipientRole ?? "—"} />
              <Field label="Recipient mobile" value={showContact ? maskMobile(record.recipientMobile) : "•••• hidden"} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recipient comments</p>
              <p>{record.recipientComments || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Logistics note</p>
              <p>{record.logisticsNote || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recipient confirmation</p>
              <p>
                {record.recipientConfirmation.method
                  ? `${record.recipientConfirmation.method} · ${record.recipientConfirmation.confirmedBy} · ${record.recipientConfirmation.confirmedAt}`
                  : "Pending"}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {DELIVERY_CHECKS.map((c) => (
                <div key={c.key} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${record.checks[c.key] ? "text-emerald-600" : "text-muted-foreground/40"}`} />
                  <span className={record.checks[c.key] ? "" : "text-muted-foreground"}>{c.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {record.partial && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-base text-amber-700">Partial delivery</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="Items delivered" value={record.partial.delivered} />
            <Field label="Items pending" value={record.partial.pending} />
            <Field label="Quantity delivered" value={String(record.partial.qtyDelivered)} />
            <Field label="Quantity pending" value={String(record.partial.qtyPending)} />
            <Field label="Reason" value={record.partial.reason} />
            <Field label="Expected remaining delivery" value={record.partial.remainingDate} />
            <Field label="Next action" value={record.partial.nextAction} />
            <Field label="Responsible person" value={record.partial.responsible} />
          </CardContent>
        </Card>
      )}

      {record.damage && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">
              Damage / shortage — linked issue {record.damage.issueId}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="Affected item" value={record.damage.item} />
            <Field label="Quantity" value={String(record.damage.qty)} />
            <Field label="Immediate action" value={record.damage.immediateAction} />
            <Field label="Replacement or return" value={record.damage.replacementOrReturn} />
            <Field label="Priority" value={record.damage.priority} />
            <Field label="Photographs" value={`${record.damage.photos} attached`} />
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Description</p>
              <p>{record.damage.description}</p>
            </div>
            <Field label="Transporter note" value={record.damage.transporterNote} />
            <Field label="Recipient note" value={record.damage.recipientNote} />
          </CardContent>
        </Card>
      )}

      {record.delay && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-base text-amber-700">Delivery delay</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="Delay reason" value={record.delay.reason} />
            <Field label="Updated expected delivery" value={record.delay.updatedDate} />
            <Field label="Transporter response" value={record.delay.transporterResponse} />
            <Field label="Project launch impact" value={record.delay.launchImpact || "None reported"} />
            <Field label="Next follow-up" value={record.delay.followUpDate} />
            <Field label="Responsible person" value={record.delay.responsible} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={record.status === "closed"} onClick={() => setFormOpen(true)}>Record delivery outcome</Button>
          <Button
            variant="outline"
            disabled={record.status === "closed" || !record.actualDate}
            onClick={() => setConfirmOpen(true)}
          >
            Recipient confirmation
          </Button>
          <Button
            variant="outline"
            disabled={!canClose}
            onClick={() => {
              patch(record.dispatchId, { status: "closed" }, {
                by: "Logistics Executive",
                action: "Delivery closed. Proof, recipient details and full activity history preserved.",
              });
              toast.success("Delivery closed");
            }}
          >
            Close delivery
          </Button>
          {!canClose && record.status !== "closed" && (
            <p className="w-full text-xs text-muted-foreground">
              Delivery in full requires uploaded proof and recipient confirmation before closure.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Activity history</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {record.history.map((h, i) => (
            <div key={i} className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">{h.at} · {h.by}</p>
              <p>{h.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confirmation form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery confirmation — {record.dispatchId}</DialogTitle>
            <DialogDescription>
              The same Dispatch ID is used. Partial, damaged or delayed outcomes never create a new dispatch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Delivery outcome</Label>
              <Select value={outcome} onValueChange={(v) => setOutcome(v as DeliveryOutcome)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DELIVERY_OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {!(isDelay && outcome === "Delivery Delayed") && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Actual delivery date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Actual delivery time</Label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Received by</Label>
                    <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Recipient mobile number</Label>
                    <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Recipient role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RECIPIENT_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Item condition</Label>
                    <Input value={condition} onChange={(e) => setCondition(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Packages expected</Label>
                    <Input value={pkgExpected} readOnly />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Packages received</Label>
                    <Input value={pkgReceived} onChange={(e) => setPkgReceived(e.target.value)} inputMode="numeric" />
                  </div>
                </div>

                {Number(pkgReceived) !== pkgExpected && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4" /> Package-count mismatch — record a partial or missing outcome.
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs">Delivery proof</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setProof((p) => p + 1)}>
                      <Camera className="mr-2 h-4 w-4" /> Add proof photo ({proof})
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <PenLine className="mr-2 h-4 w-4" /> Recipient signature (placeholder)
                    </Button>
                  </div>
                </div>
              </>
            )}

            {isPartial && (
              <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-sm font-medium text-amber-800">Partial delivery details</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Items delivered" value={pDelivered} onChange={setPDelivered} />
                  <TextField label="Items pending" value={pPending} onChange={setPPending} />
                  <TextField label="Quantities delivered" value={pQtyD} onChange={setPQtyD} />
                  <TextField label="Quantities pending" value={pQtyP} onChange={setPQtyP} />
                  <TextField label="Reason" value={pReason} onChange={setPReason} />
                  <div className="space-y-1">
                    <Label className="text-xs">Expected remaining-delivery date</Label>
                    <Input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} />
                  </div>
                  <TextField label="Next action" value={pNext} onChange={setPNext} />
                  <div className="space-y-1">
                    <Label className="text-xs">Responsible person</Label>
                    <Select value={pWho} onValueChange={setPWho}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{EXECUTIVES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {isDamage && (
              <div className="space-y-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">Damage / missing details — creates a linked issue</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Affected item</Label>
                    <Select value={dItem} onValueChange={setDItem}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {record.items.map((i) => <SelectItem key={i.name} value={i.name}>{i.packageNo} · {i.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <TextField label="Quantity" value={dQty} onChange={setDQty} />
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Damage or shortage description</Label>
                    <Textarea value={dDesc} onChange={(e) => setDDesc(e.target.value)} />
                  </div>
                  <TextField label="Transporter note" value={dTransporter} onChange={setDTransporter} />
                  <TextField label="Recipient note" value={dRecipient} onChange={setDRecipient} />
                  <TextField label="Immediate action" value={dAction} onChange={setDAction} />
                  <div className="space-y-1">
                    <Label className="text-xs">Replacement or return required</Label>
                    <Select value={dRepl} onValueChange={(v) => setDRepl(v as typeof dRepl)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Replacement", "Return", "Under review"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Priority</Label>
                    <Select value={dPriority} onValueChange={(v) => setDPriority(v as typeof dPriority)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["urgent", "high", "normal"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Photographs</Label>
                    <Button variant="outline" size="sm" onClick={() => setDPhotos((p) => p + 1)}>
                      <Camera className="mr-2 h-4 w-4" /> Add photo ({dPhotos})
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {outcome === "Delivery Delayed" && (
              <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-sm font-medium text-amber-800">Delay details</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Delay reason</Label>
                    <Select value={delReason} onValueChange={setDelReason}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DELAY_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Updated expected delivery date</Label>
                    <Input type="date" value={delDate} onChange={(e) => setDelDate(e.target.value)} />
                  </div>
                  <TextField label="Transporter response" value={delResponse} onChange={setDelResponse} />
                  <TextField label="Project-launch impact" value={delImpact} onChange={setDelImpact} />
                  <div className="space-y-1">
                    <Label className="text-xs">Next follow-up date</Label>
                    <Input type="date" value={delFollow} onChange={(e) => setDelFollow(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Responsible person</Label>
                    <Select value={delWho} onValueChange={setDelWho}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{EXECUTIVES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                {delImpact && (
                  <p className="text-xs text-amber-800">Project Coordinator will be notified — launch timeline may be affected.</p>
                )}
              </div>
            )}

            {!(outcome === "Delivery Delayed") && (
              <div className="space-y-2">
                <Label className="text-xs">Delivery checklist</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DELIVERY_CHECKS.map((c) => (
                    <label key={c.key} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={!!checks[c.key]} onCheckedChange={(v) => setChecks((p) => ({ ...p, [c.key]: !!v }))} />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Recipient comments</Label>
                <Textarea value={comments} onChange={(e) => setComments(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Logistics note</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button disabled={!canSubmit} onClick={submit}>Record outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipient confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recipient confirmation — {record.dispatchId}</DialogTitle>
            <DialogDescription>
              OTP, digital signature and confirmation-link methods are placeholders and not activated yet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Confirmation method</Label>
              <Select value={confirmMethod} onValueChange={setConfirmMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OTP" disabled>OTP confirmation (not active)</SelectItem>
                  <SelectItem value="Digital Signature" disabled>Digital signature (not active)</SelectItem>
                  <SelectItem value="Signed Document">Signed delivery document</SelectItem>
                  <SelectItem value="Confirmation Link" disabled>Confirmation link (not active)</SelectItem>
                  <SelectItem value="Manual Authorised">Manual authorised confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Confirmed by</Label>
              <Input value={confirmBy} onChange={(e) => setConfirmBy(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!confirmBy.trim()}
              onClick={() => {
                patch(
                  record.dispatchId,
                  {
                    status: "recipient_confirmed",
                    recipientConfirmation: {
                      method: confirmMethod as DeliveryRecord["recipientConfirmation"]["method"],
                      confirmedAt: `${TODAY} now`,
                      confirmedBy: confirmBy,
                    },
                  },
                  { by: "Logistics Executive", action: `Recipient confirmation recorded (${confirmMethod}) by ${confirmBy}.` },
                );
                setConfirmOpen(false);
                toast.success("Recipient confirmation recorded");
              }}
            >
              Record confirmation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Truck className="h-3.5 w-3.5" /> Packing records stay linked for investigation. Packing Staff see only packing feedback;
        Accounts and Project Coordinator see status and outcome, not each other's internal notes.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
