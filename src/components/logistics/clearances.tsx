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
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import {
  CLEARANCE_RECORDS,
  CLR_STATUS_LABEL,
  CLR_STATUS_TONE,
  INFO_TOPICS,
  ITEM_TYPES,
  PACKING_STAFF_LIST,
  RETURN_REASONS,
  REVIEW_CHECKS,
  TODAY,
  type AvailabilityState,
  type ClearanceRecord,
  type ClearanceStatus,
} from "./clearances-data";

const TABS: { key: string; label: string; match: ClearanceStatus[] }[] = [
  { key: "new", label: "New", match: ["received"] },
  { key: "review", label: "Under Review", match: ["under_review", "availability_check"] },
  { key: "accepted", label: "Accepted", match: ["accepted", "packing_ready"] },
  { key: "info", label: "Information Required", match: ["info_required"] },
  { key: "returned", label: "Returned", match: ["returned"] },
  { key: "suspended", label: "Suspended", match: ["suspended"] },
  { key: "cancelled", label: "Cancelled", match: ["cancelled"] },
  { key: "all", label: "All", match: [] },
];

const days = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "good" | "warn" | "bad" | "info" }) {
  const cls =
    tone === "good" ? "text-emerald-600"
      : tone === "warn" ? "text-amber-600"
        : tone === "bad" ? "text-destructive"
          : tone === "info" ? "text-primary" : "text-foreground";
  return (
    <Card><CardContent className="p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold ${cls}`}>{value}</div>
    </CardContent></Card>
  );
}

function StatusBadge({ s }: { s: ClearanceStatus }) {
  return <Badge variant="outline" className={CLR_STATUS_TONE[s]}>{CLR_STATUS_LABEL[s]}</Badge>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

const AVAIL_LABEL: Record<AvailabilityState, string> = {
  unchecked: "Not checked",
  available: "Available",
  partial: "Partial",
  unavailable: "Unavailable",
};

export function LogisticsClearances() {
  const [rows, setRows] = useState<ClearanceRecord[]>(CLEARANCE_RECORDS);
  const [tab, setTab] = useState("new");
  const [q, setQ] = useState("");
  const [fPC, setFPC] = useState("all");
  const [fProject, setFProject] = useState("all");
  const [fStore, setFStore] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [fType, setFType] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fAM, setFAM] = useState("all");
  const [fRequired, setFRequired] = useState("");
  const [fLaunch, setFLaunch] = useState("");

  const [detail, setDetail] = useState<ClearanceRecord | null>(null);

  const uniq = (fn: (r: ClearanceRecord) => string) => Array.from(new Set(CLEARANCE_RECORDS.map(fn)));

  const kpi = useMemo(() => ({
    fresh: rows.filter((r) => r.status === "received").length,
    urgent: rows.filter((r) => r.priority === "urgent" && ["received", "under_review"].includes(r.status)).length,
    info: rows.filter((r) => r.status === "info_required").length,
    acceptedToday: rows.filter((r) => (r.acceptedAt ?? "").startsWith(TODAY)).length,
    suspended: rows.filter((r) => r.status === "suspended").length,
  }), [rows]);

  /* duplicate check: same payment request + project with another active clearance */
  const duplicates = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const r of rows) {
      if (["cancelled", "returned"].includes(r.status)) continue;
      const k = `${r.paymentRequestId}|${r.projectId}`;
      map.set(k, [...(map.get(k) ?? []), r.clearanceId]);
    }
    const dup = new Set<string>();
    for (const ids of map.values()) if (ids.length > 1) ids.forEach((i) => dup.add(i));
    return dup;
  }, [rows]);

  const filtered = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    return rows.filter((r) => {
      if (t.match.length && !t.match.includes(r.status)) return false;
      if (fPC !== "all" && r.coordinator !== fPC) return false;
      if (fProject !== "all" && r.projectId !== fProject) return false;
      if (fStore !== "all" && r.store !== fStore) return false;
      if (fCity !== "all" && r.city !== fCity) return false;
      if (fType !== "all" && !r.items.some((i) => i.type === fType)) return false;
      if (fPriority !== "all" && r.priority !== fPriority) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fAM !== "all" && r.accountsManager !== fAM) return false;
      if (fRequired && r.requiredDelivery !== fRequired) return false;
      if (fLaunch && r.launchDate !== fLaunch) return false;
      if (q.trim()) {
        const hay = `${r.clearanceId} ${r.paymentRequestId} ${r.projectId} ${r.dispatchId ?? ""} ${r.store} ${r.city}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, tab, q, fPC, fProject, fStore, fCity, fType, fPriority, fStatus, fAM, fRequired, fLaunch]);

  const alerts = useMemo(() => {
    const out: { tone: "bad" | "warn"; text: string }[] = [];
    for (const r of rows) {
      if (r.status === "suspended")
        out.push({ tone: "bad", text: `${r.clearanceId} — Clearance suspended by Accounts${r.packingStarted ? " after packing started" : ""}. Packing and dispatch paused.` });
      if (duplicates.has(r.clearanceId))
        out.push({ tone: "bad", text: `${r.clearanceId} — Possible duplicate clearance for ${r.paymentRequestId} / ${r.projectId}. Do not create a second dispatch record.` });
      if (r.priority === "urgent" && r.status === "received")
        out.push({ tone: "bad", text: `${r.clearanceId} — Urgent clearance not yet reviewed.` });
      if (r.status === "received" || r.status === "under_review")
        out.push({ tone: "warn", text: `${r.clearanceId} — Pending acceptance from Logistics.` });
      if (!r.addressComplete)
        out.push({ tone: "bad", text: `${r.clearanceId} — Delivery address incomplete for ${r.store}.` });
      if (r.status !== "cancelled" && days(TODAY, r.launchDate) <= 9 && r.status !== "packing_ready")
        out.push({ tone: "warn", text: `${r.clearanceId} — Launch ${r.launchDate} approaching.` });
      if (r.items.some((i) => i.availability === "unavailable"))
        out.push({ tone: "bad", text: `${r.clearanceId} — Required item unavailable in warehouse.` });
      if (r.items.some((i) => i.availability === "partial"))
        out.push({ tone: "warn", text: `${r.clearanceId} — Partial quantity available.` });
      if (r.status !== "cancelled" && days(TODAY, r.requiredDelivery) < 2 && r.status !== "packing_ready")
        out.push({ tone: "warn", text: `${r.clearanceId} — Required delivery ${r.requiredDelivery} may not be achievable.` });
      if (r.openInfoRequest && r.openInfoRequest.dueBy <= TODAY)
        out.push({ tone: "warn", text: `${r.clearanceId} — Accounts response overdue on "${r.openInfoRequest.topic}".` });
    }
    return out.slice(0, 12);
  }, [rows, duplicates]);

  function patch(id: string, fn: (r: ClearanceRecord) => ClearanceRecord) {
    setRows((p) => p.map((r) => (r.clearanceId === id ? fn(r) : r)));
    setDetail((d) => (d && d.clearanceId === id ? fn(d) : d));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dispatch Clearances</h1>
          <p className="text-sm text-muted-foreground">
            Receive, review, accept or return financial dispatch clearances from Accounts. Accepted clearances
            continue to Packing Tasks and Dispatch Planning on the same Clearance ID and Dispatch ID.
          </p>
        </div>
        <Input
          className="w-full sm:w-72"
          placeholder="Search clearance, payment request, project, store…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="New Clearances" value={kpi.fresh} tone="info" />
        <Stat label="Urgent Clearances" value={kpi.urgent} tone="bad" />
        <Stat label="Information Required" value={kpi.info} tone="warn" />
        <Stat label="Accepted Today" value={kpi.acceptedToday} tone="good" />
        <Stat label="Suspended Clearances" value={kpi.suspended} tone="bad" />
      </div>

      {alerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {alerts.map((a, i) => (
              <div key={i} className={`rounded-md border px-3 py-1.5 text-sm ${a.tone === "bad" ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
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
        <CardContent className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={fPC} onValueChange={setFPC}>
            <SelectTrigger><SelectValue placeholder="Project Coordinator" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All coordinators</SelectItem>
              {uniq((r) => r.coordinator).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fProject} onValueChange={setFProject}>
            <SelectTrigger><SelectValue placeholder="Franchise project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {uniq((r) => r.projectId).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fStore} onValueChange={setFStore}>
            <SelectTrigger><SelectValue placeholder="Franchise or store" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {uniq((r) => r.store).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fCity} onValueChange={setFCity}>
            <SelectTrigger><SelectValue placeholder="Destination city" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {uniq((r) => r.city).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fType} onValueChange={setFType}>
            <SelectTrigger><SelectValue placeholder="Item type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All item types</SelectItem>
              {ITEM_TYPES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fPriority} onValueChange={setFPriority}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger><SelectValue placeholder="Clearance status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(CLR_STATUS_LABEL) as ClearanceStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{CLR_STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fAM} onValueChange={setFAM}>
            <SelectTrigger><SelectValue placeholder="Accounts Manager" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts managers</SelectItem>
              {uniq((r) => r.accountsManager).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Required delivery</Label>
            <Input type="date" value={fRequired} onChange={(e) => setFRequired(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Planned launch</Label>
            <Input type="date" value={fLaunch} onChange={(e) => setFLaunch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* desktop table */}
      <Card className="hidden md:block">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Clearance</th>
                <th className="p-3 text-left">Store / City</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Required</th>
                <th className="p-3 text-left">Launch</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Sent by</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.clearanceId} className="border-t align-top">
                  <td className="p-3">
                    <div className="font-mono text-xs font-semibold">{r.clearanceId}</div>
                    <div className="text-xs text-muted-foreground">{r.paymentRequestId} · {r.projectId}</div>
                    {r.dispatchId && <div className="text-xs text-emerald-700">{r.dispatchId}</div>}
                    {duplicates.has(r.clearanceId) && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-destructive"><Copy className="h-3 w-3" /> duplicate check</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div>{r.store}</div>
                    <div className="text-xs text-muted-foreground">{r.city}</div>
                  </td>
                  <td className="p-3">{r.items.length}</td>
                  <td className="p-3 text-xs">{r.requiredDelivery}</td>
                  <td className="p-3 text-xs">{r.launchDate}</td>
                  <td className="p-3 text-xs capitalize">{r.priority}</td>
                  <td className="p-3 text-xs">{r.accountsManager}</td>
                  <td className="p-3"><StatusBadge s={r.status} /></td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setDetail(r)}>Review Clearance</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">No clearances match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* mobile cards */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((r) => (
          <Card key={r.clearanceId}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-sm font-semibold">{r.clearanceId}</div>
                  <div className="text-xs text-muted-foreground">{r.paymentRequestId} · {r.projectId}</div>
                </div>
                <StatusBadge s={r.status} />
              </div>
              <div className="text-sm font-medium">{r.store}</div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="City" value={r.city} />
                <Field label="Items" value={r.items.length} />
                <Field label="Required" value={r.requiredDelivery} />
                <Field label="Launch" value={r.launchDate} />
                <Field label="Priority" value={<span className="capitalize">{r.priority}</span>} />
                <Field label="Sent by" value={r.accountsManager} />
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setDetail(r)}>Review Clearance</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {detail && (
        <ClearanceDetail
          r={detail}
          duplicate={duplicates.has(detail.clearanceId)}
          onClose={() => setDetail(null)}
          onPatch={patch}
        />
      )}
    </div>
  );
}

/* ---------------- detail / review ---------------- */

function ClearanceDetail({
  r,
  duplicate,
  onClose,
  onPatch,
}: {
  r: ClearanceRecord;
  duplicate: boolean;
  onClose: () => void;
  onPatch: (id: string, fn: (x: ClearanceRecord) => ClearanceRecord) => void;
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<null | "accept" | "info" | "return">(null);

  // accept form
  const [packingDate, setPackingDate] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [staff, setStaff] = useState(PACKING_STAFF_LIST[0]);
  const [acceptNote, setAcceptNote] = useState("");
  // info form
  const [topic, setTopic] = useState(INFO_TOPICS[0]);
  const [infoNote, setInfoNote] = useState("");
  const [infoDue, setInfoDue] = useState("");
  // return form
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [nextAction, setNextAction] = useState("");
  const [dueDate, setDueDate] = useState("");

  const locked = r.status === "suspended" || r.status === "cancelled";
  const allChecked = REVIEW_CHECKS.every((c) => checks[c.key]);
  const availabilityDone = r.items.every((i) => i.availability !== "unchecked");

  const log = (x: ClearanceRecord, action: string, by = "Logistics Executive"): ClearanceRecord => ({
    ...x,
    history: [...x.history, { at: `${TODAY} now`, by, action }],
  });

  function setItem(idx: number, upd: Partial<ClearanceRecord["items"][number]>) {
    onPatch(r.clearanceId, (x) => ({
      ...x,
      items: x.items.map((it, i) => (i === idx ? { ...it, ...upd } : it)),
    }));
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{r.clearanceId}</span> <StatusBadge s={r.status} />
          </DialogTitle>
          <DialogDescription>
            Payment request {r.paymentRequestId} · Project {r.projectId} · {r.store}
            {r.dispatchId && <> · Dispatch {r.dispatchId}</>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {r.status === "suspended" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2 font-medium"><ShieldAlert className="h-4 w-4" /> Clearance suspended by Accounts</div>
              <p className="mt-1">
                New packing and dispatch actions are stopped. Completed packing activity is preserved.
                Accounts must reactivate this clearance before work continues — the same Clearance ID and
                Dispatch ID will be used. Logistics Executive and Project Coordinator have been notified.
              </p>
            </div>
          )}
          {duplicate && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              Duplicate check: another active clearance exists for {r.paymentRequestId} / {r.projectId}.
              Do not create a second clearance, dispatch or packing task.
            </div>
          )}
          {r.returnInfo && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
              Returned to Accounts — <strong>{r.returnInfo.reason}</strong>. Next action: {r.returnInfo.nextAction} (due {r.returnInfo.dueDate}).
            </div>
          )}
          {r.openInfoRequest && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Information requested: <strong>{r.openInfoRequest.topic}</strong> · asked {r.openInfoRequest.asked} · response due {r.openInfoRequest.dueBy}.
              The response must come back inside this Clearance ID.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4" /> Delivery address</div>
              <p className="text-sm text-muted-foreground">{r.deliveryAddress}</p>
              {!r.addressComplete && <p className="mt-1 text-xs text-destructive">Address incomplete.</p>}
              <div className="mt-2 text-xs">
                Site contact: {r.siteContact}{" "}
                {r.siteContactAvailable ? <span className="text-emerald-600">· available</span> : <span className="text-destructive">· not available</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <Field label="Project Coordinator" value={r.coordinator} />
              <Field label="Accounts Manager" value={r.accountsManager} />
              <Field label="Required delivery" value={r.requiredDelivery} />
              <Field label="Planned launch" value={r.launchDate} />
              <Field label="Dispatch priority" value={<span className="capitalize">{r.priority}</span>} />
              <Field
                label="Financial clearance"
                value={
                  <span className={r.financialClearance === "Verified & Active" ? "text-emerald-700" : "text-destructive"}>
                    {r.financialClearance}
                  </span>
                }
              />
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /></span> Bank-account details, full
            transaction information, payment proof and franchise-owner banking information are not visible to
            Logistics or Packing Staff.
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Cleared items & availability check</div>
            <div className="space-y-2">
              {r.items.map((it, idx) => (
                <div key={it.code} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {it.code} · {it.type} · Approved qty {it.approvedQty} · Handling: {it.handling}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        it.availability === "available" ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : it.availability === "partial" ? "border-amber-200 bg-amber-100 text-amber-800"
                            : it.availability === "unavailable" ? "border-destructive/20 bg-destructive/10 text-destructive"
                              : "text-muted-foreground"
                      }
                    >
                      {AVAIL_LABEL[it.availability]}
                    </Badge>
                  </div>
                  {!locked && (
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <Select value={it.availability} onValueChange={(v) => setItem(idx, { availability: v as AvailabilityState })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unchecked">Not checked</SelectItem>
                          <SelectItem value="available">Item available</SelectItem>
                          <SelectItem value="partial">Partial quantity available</SelectItem>
                          <SelectItem value="unavailable">Item unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Quantity available"
                        value={it.qtyAvailable || ""}
                        onChange={(e) => setItem(idx, { qtyAvailable: Number(e.target.value) })}
                      />
                      <Input
                        type="date"
                        value={it.expectedOn ?? ""}
                        onChange={(e) => setItem(idx, { expectedOn: e.target.value })}
                        title="Expected availability date"
                      />
                      <Input
                        placeholder="Substitute item proposed"
                        value={it.substitute ?? ""}
                        onChange={(e) => setItem(idx, { substitute: e.target.value })}
                      />
                      <Input
                        placeholder="Warehouse / storage location"
                        value={it.location ?? ""}
                        onChange={(e) => setItem(idx, { location: e.target.value })}
                      />
                      <Input
                        placeholder="Logistics note"
                        value={it.note ?? ""}
                        onChange={(e) => setItem(idx, { note: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Special instructions: {r.specialInstructions}
            </p>
          </div>

          {!locked && (
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium">Logistics review checklist</div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {REVIEW_CHECKS.map((c) => (
                  <label key={c.key} className="flex items-start gap-2 text-sm">
                    <Checkbox checked={!!checks[c.key]} onCheckedChange={(v) => setChecks((p) => ({ ...p, [c.key]: !!v }))} />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
              {!allChecked && <p className="mt-2 text-xs text-amber-700">Accept Clearance unlocks after all ten confirmations.</p>}
            </div>
          )}

          {/* action forms */}
          {mode === "accept" && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="text-sm font-medium">Accept clearance</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div><Label>Proposed packing date</Label><Input type="date" value={packingDate} onChange={(e) => setPackingDate(e.target.value)} /></div>
                <div><Label>Proposed dispatch date</Label><Input type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} /></div>
                <div>
                  <Label>Assigned Packing Staff</Label>
                  <Select value={staff} onValueChange={setStaff}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PACKING_STAFF_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Logistics Executive</Label><Input value="Logistics Executive" readOnly /></div>
              </div>
              <div><Label>Logistics note</Label><Textarea rows={2} value={acceptNote} onChange={(e) => setAcceptNote(e.target.value)} /></div>
              <Button
                disabled={!allChecked || !availabilityDone || !packingDate || !dispatchDate}
                onClick={() => {
                  const dispatchId = r.dispatchId ?? `DSP-000${120 + Math.floor(Math.random() * 9)}`;
                  onPatch(r.clearanceId, (x) =>
                    log(
                      {
                        ...x,
                        status: "packing_ready",
                        dispatchId,
                        acceptedBy: "Logistics Executive",
                        acceptedAt: `${TODAY} now`,
                        packingStaff: staff,
                        proposedPacking: packingDate,
                        proposedDispatch: dispatchDate,
                        openInfoRequest: null,
                      },
                      `Clearance accepted. ${x.dispatchId ? `Existing Dispatch ID ${dispatchId} reused` : `Dispatch ID ${dispatchId} activated`} — one dispatch record only. Packing assigned to ${staff} for ${packingDate}. ${acceptNote}`,
                    ),
                  );
                  setMode(null);
                  toast.success(`Accepted. Packing task created on ${dispatchId} — no duplicate record.`);
                }}
              >
                Confirm acceptance
              </Button>
              {!availabilityDone && <p className="text-xs text-amber-700">Confirm item availability for every item first.</p>}
            </div>
          )}

          {mode === "info" && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="text-sm font-medium">Ask for information</div>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INFO_TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea rows={2} placeholder="What exactly is needed?" value={infoNote} onChange={(e) => setInfoNote(e.target.value)} />
              <div><Label>Response due by</Label><Input type="date" value={infoDue} onChange={(e) => setInfoDue(e.target.value)} /></div>
              <Button
                disabled={!infoNote.trim() || !infoDue}
                onClick={() => {
                  onPatch(r.clearanceId, (x) =>
                    log({ ...x, status: "info_required", openInfoRequest: { topic, asked: `${TODAY} now`, dueBy: infoDue } },
                      `Information requested from ${x.accountsManager} / ${x.coordinator}: ${topic} — ${infoNote}. Response due ${infoDue}, inside the same Clearance ID.`),
                  );
                  setMode(null);
                  toast.success("Information request sent on the same Clearance ID.");
                }}
              >
                Send request
              </Button>
            </div>
          )}

          {mode === "return" && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="text-sm font-medium">Return to Accounts</div>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RETURN_REASONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea rows={2} placeholder="Next action expected from Accounts" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
              <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              <Button
                variant="outline"
                className="text-destructive"
                disabled={!nextAction.trim() || !dueDate}
                onClick={() => {
                  onPatch(r.clearanceId, (x) =>
                    log({ ...x, status: "returned", returnInfo: { reason, nextAction, dueDate } },
                      `Returned to Accounts — ${reason}. Next action: ${nextAction} (due ${dueDate}). Clearance ID and any existing Dispatch ID preserved.`),
                  );
                  setMode(null);
                  toast.success("Returned to Accounts. No duplicate record created.");
                }}
              >
                Confirm return
              </Button>
            </div>
          )}

          <Separator />
          <div>
            <div className="mb-2 text-sm font-medium">Activity history</div>
            <ol className="space-y-1.5">
              {r.history.map((h, i) => (
                <li key={i} className="rounded-md border px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">{h.at} · {h.by}</span>
                  <div>{h.action}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="ghost" onClick={() => toast.info(`Opening project ${r.projectId} — coordinator ${r.coordinator}.`)}>
            <ExternalLink className="mr-2 h-4 w-4" /> View Project
          </Button>
          {!locked && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  onPatch(r.clearanceId, (x) =>
                    log({ ...x, status: x.status === "received" ? "availability_check" : x.status },
                      "Item availability confirmed against the cleared item list."),
                  );
                  toast.success("Item availability recorded against the cleared item list.");
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Item Availability
              </Button>
              <Button variant="outline" onClick={() => setMode("info")}>Ask for Information</Button>
              <Button variant="outline" className="text-destructive" onClick={() => setMode("return")}>Return to Accounts</Button>
              {r.status === "packing_ready" ? (
                <Button variant="outline" onClick={() => toast.success(`Packing task already active on ${r.dispatchId} for ${r.packingStaff} — no duplicate created.`)}>
                  Create Packing Tasks
                </Button>
              ) : (
                <Button disabled={!allChecked} onClick={() => setMode("accept")}>Accept Clearance</Button>
              )}
            </>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
