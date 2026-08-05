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
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  ShieldAlert,
  Truck,
  Upload,
  Weight,
} from "lucide-react";
import {
  CHECKLIST,
  DOC_LABEL,
  PACKING_STAFF_NAMES,
  PLANS,
  PLAN_STATUS_LABEL,
  PLAN_STATUS_TONE,
  PLATFORMS,
  REQUIRED_DOCS,
  TODAY,
  inr,
  maskRef,
  type DocKey,
  type PlanRecord,
  type PlanStatus,
  type Platform,
} from "./planning-data";

const TABS: { key: string; label: string; match: PlanStatus[] }[] = [
  { key: "ready", label: "Ready for Planning", match: ["ready_for_planning", "transport_selected", "info_required"] },
  { key: "pending", label: "Booking Pending", match: ["booking_pending"] },
  { key: "booked", label: "Booked", match: ["booked_externally"] },
  { key: "pickup", label: "Ready for Pickup", match: ["ready_for_pickup"] },
  { key: "dispatched", label: "Dispatched", match: ["dispatched"] },
  { key: "delayed", label: "Delayed", match: ["dispatch_delayed", "booking_failed"] },
  { key: "stopped", label: "Suspended or Cancelled", match: ["suspended", "cancelled"] },
  { key: "all", label: "All", match: [] },
];

const days = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warn" | "bad" | "info";
}) {
  const cls =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-destructive"
          : tone === "info"
            ? "text-primary"
            : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`text-2xl font-semibold ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ s }: { s: PlanStatus }) {
  return (
    <Badge variant="outline" className={PLAN_STATUS_TONE[s]}>
      {PLAN_STATUS_LABEL[s]}
    </Badge>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export function LogisticsDispatchPlanning() {
  const [rows, setRows] = useState<PlanRecord[]>(PLANS);
  const [tab, setTab] = useState("ready");
  const [q, setQ] = useState("");
  const [fCity, setFCity] = useState("all");
  const [fPlatform, setFPlatform] = useState("all");
  const [fItem, setFItem] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fStaff, setFStaff] = useState("all");
  const [fRequired, setFRequired] = useState("");
  const [fPlanned, setFPlanned] = useState("");

  const [detail, setDetail] = useState<PlanRecord | null>(null);
  const [bookFor, setBookFor] = useState<PlanRecord | null>(null);
  const [dispatchFor, setDispatchFor] = useState<PlanRecord | null>(null);
  const [changeFor, setChangeFor] = useState<PlanRecord | null>(null);

  const cities = useMemo(() => Array.from(new Set(PLANS.map((p) => p.city))), []);
  const projects = useMemo(() => Array.from(new Set(PLANS.map((p) => p.projectId))), []);
  const [fProject, setFProject] = useState("all");

  const kpi = useMemo(() => {
    const c = (s: PlanStatus[]) => rows.filter((r) => s.includes(r.status)).length;
    return {
      ready: c(["ready_for_planning", "transport_selected", "info_required"]),
      pending: c(["booking_pending"]),
      booked: c(["booked_externally"]),
      pickup: c(["ready_for_pickup"]),
      dispatchedToday: rows.filter(
        (r) => r.status === "dispatched" && (r.actualDispatchAt ?? "").startsWith(TODAY),
      ).length,
      delayed: c(["dispatch_delayed", "booking_failed"]),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    return rows.filter((r) => {
      if (t.match.length && !t.match.includes(r.status)) return false;
      if (fProject !== "all" && r.projectId !== fProject) return false;
      if (fCity !== "all" && r.city !== fCity) return false;
      if (fPlatform !== "all" && (r.booking?.platform ?? "—") !== fPlatform) return false;
      if (fItem !== "all" && r.itemType !== fItem) return false;
      if (fPriority !== "all" && r.priority !== fPriority) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fStaff !== "all" && r.packingStaff !== fStaff) return false;
      if (fRequired && r.requiredDelivery !== fRequired) return false;
      if (fPlanned && r.plannedDispatch !== fPlanned) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        const hay = `${r.dispatchId} ${r.clearanceId} ${r.projectId} ${r.store} ${r.city} ${r.booking?.awbOrLr ?? ""} ${r.booking?.bookingId ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [rows, tab, q, fProject, fCity, fPlatform, fItem, fPriority, fStatus, fStaff, fRequired, fPlanned]);

  /* ---------- attention rules ---------- */
  const alerts = useMemo(() => {
    const out: { tone: "bad" | "warn"; text: string }[] = [];
    for (const r of rows) {
      if (r.status === "suspended")
        out.push({ tone: "bad", text: `${r.dispatchId} — Accounts clearance suspended, dispatch paused.` });
      if (r.status === "booking_failed")
        out.push({ tone: "bad", text: `${r.dispatchId} — Booking failed on ${r.booking?.platform ?? "platform"}. Re-book without creating a new Dispatch ID.` });
      if (r.packingApproved && !r.booking && r.status === "ready_for_planning")
        out.push({ tone: "warn", text: `${r.dispatchId} — Packages ready but booking not created.` });
      if (!r.addressComplete)
        out.push({ tone: "bad", text: `${r.dispatchId} — Delivery address incomplete for ${r.store}.` });
      if (r.status !== "dispatched" && r.status !== "cancelled" && days(TODAY, r.requiredDelivery) <= 2)
        out.push({ tone: "warn", text: `${r.dispatchId} — Required delivery ${r.requiredDelivery} is approaching.` });
      if (r.status === "ready_for_pickup" && (r.booking?.pickupAt ?? "") < TODAY)
        out.push({ tone: "warn", text: `${r.dispatchId} — Pickup not completed on the confirmed slot.` });
      const missing = REQUIRED_DOCS.filter((d) => !r.docs.includes(d));
      if (missing.length && r.status !== "cancelled")
        out.push({ tone: "warn", text: `${r.dispatchId} — Missing document: ${missing.map((m) => DOC_LABEL[m]).join(", ")}.` });
      if (r.packages.length !== r.approvedPackageCount)
        out.push({ tone: "bad", text: `${r.dispatchId} — Package count mismatch against approved packing.` });
      if (r.status === "dispatch_delayed")
        out.push({ tone: "bad", text: `${r.dispatchId} — Dispatch date missed. Launch ${r.launchDate} at risk.` });
      else if (r.status !== "dispatched" && days(TODAY, r.launchDate) <= 7 && r.status !== "cancelled")
        out.push({ tone: "warn", text: `${r.dispatchId} — Launch ${r.launchDate} at risk, shipment not dispatched.` });
    }
    return out.slice(0, 10);
  }, [rows]);

  function patch(id: string, fn: (r: PlanRecord) => PlanRecord) {
    setRows((prev) => prev.map((r) => (r.dispatchId === id ? fn(r) : r)));
    setDetail((d) => (d && d.dispatchId === id ? fn(d) : d));
  }

  const log = (r: PlanRecord, action: string): PlanRecord => ({
    ...r,
    history: [...r.history, { at: `${TODAY} now`, by: "Logistics Executive", action }],
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dispatch Planning</h1>
          <p className="text-sm text-muted-foreground">
            Plan and record dispatch after packing approval. Shiprocket and WheelsEye remain the official
            booking and tracking platforms — this CRM stores only booking references and status updates.
          </p>
        </div>
        <Button onClick={() => toast.info("Select an approved packing record below to plan its dispatch — Dispatch IDs are never newly created here.")}>
          <Truck className="mr-2 h-4 w-4" /> Plan Dispatch
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Ready for Planning" value={kpi.ready} tone="info" />
        <Stat label="Booking Pending" value={kpi.pending} tone="warn" />
        <Stat label="Booked" value={kpi.booked} tone="good" />
        <Stat label="Ready for Pickup" value={kpi.pickup} tone="good" />
        <Stat label="Dispatched Today" value={kpi.dispatchedToday} tone="good" />
        <Stat label="Dispatch Delayed" value={kpi.delayed} tone="bad" />
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
              <div
                key={i}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  a.tone === "bad"
                    ? "border-destructive/20 bg-destructive/5 text-destructive"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
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
          <Input placeholder="Search dispatch, clearance, store, AWB…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={fProject} onValueChange={setFProject}>
            <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fCity} onValueChange={setFCity}>
            <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fPlatform} onValueChange={setFPlatform}>
            <SelectTrigger><SelectValue placeholder="Transport platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.value}</SelectItem>)}
              <SelectItem value="—">Not selected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fItem} onValueChange={setFItem}>
            <SelectTrigger><SelectValue placeholder="Item type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All item types</SelectItem>
              {["Machines", "Consumables", "Branding", "Mixed"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
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
            <SelectTrigger><SelectValue placeholder="Dispatch status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(PLAN_STATUS_LABEL) as PlanStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{PLAN_STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fStaff} onValueChange={setFStaff}>
            <SelectTrigger><SelectValue placeholder="Packing staff" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packing staff</SelectItem>
              {PACKING_STAFF_NAMES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Required delivery</Label>
            <Input type="date" value={fRequired} onChange={(e) => setFRequired(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Planned dispatch</Label>
            <Input type="date" value={fPlanned} onChange={(e) => setFPlanned(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((r) => (
          <Card key={r.dispatchId} className={r.priority === "urgent" ? "border-destructive/30" : ""}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{r.dispatchId}</span>
                    <StatusBadge s={r.status} />
                    {r.priority !== "normal" && (
                      <Badge variant="outline" className={r.priority === "urgent" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-amber-200 bg-amber-100 text-amber-800"}>
                        {r.priority}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Clearance {r.clearanceId} · Project {r.projectId}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setDetail(r)}>
                  View Dispatch
                </Button>
              </div>

              <div className="text-sm font-medium">{r.store}</div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <Field label="City" value={r.city} />
                <Field label="Packages" value={`${r.packages.length}`} />
                <Field label="Total weight" value={`${r.totalWeight} kg`} />
                <Field label="Platform" value={r.booking?.platform ?? "Not selected"} />
                <Field label="Planned dispatch" value={r.plannedDispatch ?? "—"} />
                <Field label="Expected delivery" value={r.expectedDelivery ?? "—"} />
              </div>

              {r.booking?.awbOrLr && r.booking.awbOrLr !== "—" && (
                <div className="rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs">
                  Booking {maskRef(r.booking.bookingId)} · AWB/LR{" "}
                  <span className="font-mono">{r.booking.awbOrLr}</span>
                  {r.booking.trackingUrl && (
                    <a href={r.booking.trackingUrl} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-primary">
                      Track <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(r.status === "ready_for_planning" || r.status === "transport_selected" || r.status === "booking_failed" || r.status === "booking_pending" || r.status === "info_required") &&
                  r.clearanceActive && (
                    <Button size="sm" onClick={() => setBookFor(r)}>
                      {r.booking?.bookingId && r.booking.bookingId !== "—" ? "Update Booking" : "Select Transport & Book"}
                    </Button>
                  )}
                {r.status === "booked_externally" && (
                  <Button size="sm" variant="outline" onClick={() => patch(r.dispatchId, (x) => log({ ...x, status: "ready_for_pickup" }, "Marked ready for pickup."))}>
                    Mark Ready for Pickup
                  </Button>
                )}
                {r.status === "ready_for_pickup" && (
                  <Button size="sm" onClick={() => setDispatchFor(r)}>
                    Record Dispatch
                  </Button>
                )}
                {r.booking && r.status !== "dispatched" && r.status !== "cancelled" && (
                  <Button size="sm" variant="outline" onClick={() => setChangeFor(r)}>
                    Change Transporter / Reschedule
                  </Button>
                )}
                {r.status === "suspended" && (
                  <span className="inline-flex items-center gap-1 text-xs text-destructive">
                    <ShieldAlert className="h-3.5 w-3.5" /> Dispatch paused by Accounts
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No dispatches match these filters.</CardContent></Card>
        )}
      </div>

      {detail && <DetailDialog r={detail} onClose={() => setDetail(null)} />}
      {bookFor && (
        <BookingDialog
          r={bookFor}
          onClose={() => setBookFor(null)}
          onSave={(booking, status, note) => {
            patch(bookFor.dispatchId, (x) =>
              log(
                {
                  ...x,
                  booking,
                  status,
                  plannedDispatch: booking.plannedDispatch ?? x.plannedDispatch,
                  expectedDelivery: booking.expectedDelivery ?? x.expectedDelivery,
                },
                note,
              ),
            );
            setBookFor(null);
          }}
        />
      )}
      {dispatchFor && (
        <RecordDispatchDialog
          r={dispatchFor}
          onClose={() => setDispatchFor(null)}
          onSave={(upd, note) => {
            patch(dispatchFor.dispatchId, (x) => log({ ...x, ...upd, status: "dispatched" }, note));
            setDispatchFor(null);
            toast.success(`${dispatchFor.dispatchId} dispatched — Project Coordinator and Accounts Manager notified. Moved to Delivery Confirmation with the same Dispatch ID.`);
          }}
        />
      )}
      {changeFor && (
        <ChangeDialog
          r={changeFor}
          onClose={() => setChangeFor(null)}
          onSave={(note) => {
            patch(changeFor.dispatchId, (x) => log({ ...x, status: "booking_pending" }, note));
            setChangeFor(null);
            toast.success("Change recorded. Original booking and schedule history preserved.");
          }}
        />
      )}
    </div>
  );
}

/* ---------------- detail ---------------- */

function DetailDialog({ r, onClose }: { r: PlanRecord; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{r.dispatchId}</span> <StatusBadge s={r.status} />
          </DialogTitle>
          <DialogDescription>
            Clearance {r.clearanceId} · Project {r.projectId} · {r.store}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4" /> Pickup address</div>
              <p className="text-sm text-muted-foreground">{r.pickupAddress}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4" /> Delivery address</div>
              <p className="text-sm text-muted-foreground">{r.deliveryAddress}</p>
              <div className="mt-1 text-xs">
                Site contact: {r.siteContact}{" "}
                {r.siteContactConfirmed ? (
                  <span className="text-emerald-600">· confirmed</span>
                ) : (
                  <span className="text-destructive">· not confirmed</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Package count" value={`${r.packages.length} / approved ${r.approvedPackageCount}`} />
            <Field label="Total weight" value={`${r.totalWeight} kg`} />
            <Field label="Required delivery" value={r.requiredDelivery} />
            <Field label="Planned launch" value={r.launchDate} />
            <Field label="Packing approval" value={r.packingApproved ? `Approved · ${r.packingStaff}` : "Pending"} />
            <Field label="Item type" value={r.itemType} />
            <Field label="Platform" value={r.booking?.platform ?? "Not selected"} />
            <Field label="Clearance" value={r.clearanceActive ? "Active" : "Suspended / cancelled"} />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Package className="h-4 w-4" /> Package & item list</div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Package</th>
                    <th className="p-2 text-left">Items</th>
                    <th className="p-2 text-left">Dimensions</th>
                    <th className="p-2 text-left">Weight</th>
                    <th className="p-2 text-left">Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {r.packages.map((p) => (
                    <tr key={p.code} className="border-t">
                      <td className="p-2 font-mono text-xs">{p.code}</td>
                      <td className="p-2">{p.contents}</td>
                      <td className="p-2 text-xs">{p.dims}</td>
                      <td className="p-2 text-xs"><span className="inline-flex items-center gap-1"><Weight className="h-3 w-3" />{p.weight} kg</span></td>
                      <td className="p-2 text-xs">
                        {p.fragile && <Badge variant="outline" className="mr-1 border-amber-200 bg-amber-100 text-amber-800">Fragile</Badge>}
                        {p.heavy && <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">Heavy</Badge>}
                        {!p.fragile && !p.heavy && "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Special handling: {r.handling}</p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4" /> Dispatch documents</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(DOC_LABEL) as DocKey[]).map((d) => {
                const has = r.docs.includes(d);
                return (
                  <div key={d} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                    <span className="flex items-center gap-2">
                      {has ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
                      {DOC_LABEL[d]}
                      {REQUIRED_DOCS.includes(d) && !has && <span className="text-xs text-destructive">required</span>}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => toast.info(has ? "Reference on file. Vyapar remains the official source for invoices." : "Upload placeholder — document upload activates in a later phase.")}>
                      {has ? "View" : "Attach"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {r.booking && (
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium">Booking details ({r.booking.platform})</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Booking ID" value={maskRef(r.booking.bookingId)} />
                <Field label="AWB / LR" value={<span className="font-mono">{r.booking.awbOrLr}</span>} />
                <Field label="Transporter" value={r.booking.transporter} />
                <Field label="Vehicle" value={r.booking.vehicle ?? "—"} />
                <Field label="Driver" value={r.booking.driverName ?? "—"} />
                <Field label="Driver mobile" value={r.booking.driverMobile ?? "—"} />
                <Field label="Booking date" value={r.booking.bookingDate} />
                <Field label="Pickup" value={r.booking.pickupAt ?? "—"} />
                <Field label="Expected delivery" value={r.booking.expectedDelivery ?? "—"} />
                <Field label="Freight reference" value={r.booking.freightRef ? inr(r.booking.freightRef) : "—"} />
                <Field label="Payment responsibility" value={r.booking.freightPaidBy ?? "—"} />
                <Field label="Tracking" value={r.booking.trackingUrl ? <a href={r.booking.trackingUrl} target="_blank" rel="noreferrer" className="text-primary">Open platform</a> : "—"} />
              </div>
              {r.booking.notes && <p className="mt-2 text-xs text-muted-foreground">{r.booking.notes}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                Driver details are visible only to authorised operational users. Freight is a reference only —
                financial and banking information stays with Accounts.
              </p>
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- booking ---------------- */

function BookingDialog({
  r,
  onClose,
  onSave,
}: {
  r: PlanRecord;
  onClose: () => void;
  onSave: (b: NonNullable<PlanRecord["booking"]>, status: PlanStatus, note: string) => void;
}) {
  const b = r.booking;
  const [platform, setPlatform] = useState<Platform>(b?.platform ?? "Shiprocket");
  const [bookingId, setBookingId] = useState(b && b.bookingId !== "—" ? b.bookingId : "");
  const [awb, setAwb] = useState(b && b.awbOrLr !== "—" ? b.awbOrLr : "");
  const [transporter, setTransporter] = useState(b && b.transporter !== "—" ? b.transporter : "");
  const [vehicle, setVehicle] = useState(b?.vehicle ?? "");
  const [driverName, setDriverName] = useState(b?.driverName ?? "");
  const [driverMobile, setDriverMobile] = useState(b?.driverMobile ?? "");
  const [pickupAt, setPickupAt] = useState(b?.pickupAt ?? "");
  const [plannedDispatch, setPlanned] = useState(b?.plannedDispatch ?? r.plannedDispatch ?? "");
  const [expected, setExpected] = useState(b?.expectedDelivery ?? r.expectedDelivery ?? "");
  const [tracking, setTracking] = useState(b?.trackingUrl ?? "");
  const [freight, setFreight] = useState(b?.freightRef ? String(b.freightRef) : "");
  const [paidBy, setPaidBy] = useState<"Company" | "Franchise" | "To Pay">(b?.freightPaidBy ?? "Company");
  const [notes, setNotes] = useState("");

  const hint = PLATFORMS.find((p) => p.value === platform)?.hint;

  function save(status: PlanStatus) {
    if (status === "booked_externally" && (!bookingId.trim() || !awb.trim())) {
      toast.error("Booking ID and AWB/LR number are required to mark this booked externally.");
      return;
    }
    onSave(
      {
        platform,
        bookingId: bookingId.trim() || "—",
        awbOrLr: awb.trim() || "—",
        transporter: transporter.trim() || platform,
        vehicle: vehicle.trim() || undefined,
        driverName: driverName.trim() || undefined,
        driverMobile: driverMobile.trim() || undefined,
        bookingDate: TODAY,
        pickupAt: pickupAt || undefined,
        plannedDispatch: plannedDispatch || undefined,
        expectedDelivery: expected || undefined,
        trackingUrl: tracking.trim() || undefined,
        freightRef: freight ? Number(freight) : undefined,
        freightPaidBy: paidBy,
        notes: notes.trim() || undefined,
      },
      status,
      status === "booked_externally"
        ? `Booked on ${platform}. Booking ${bookingId}, AWB/LR ${awb} recorded against the same Dispatch ID.`
        : status === "booking_failed"
          ? `Booking failed on ${platform}. ${notes || "Reason recorded."}`
          : `Transport selected: ${platform}. Booking requested externally.`,
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transport selection & booking — {r.dispatchId}</DialogTitle>
          <DialogDescription>
            Booking happens on the external platform. Record only references here — never platform passwords,
            API keys or access tokens. The Dispatch ID stays the same.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Transport platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.value}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">{hint} — the CRM does not auto-select a service in Phase 1.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Booking ID</Label><Input value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="SR-88214077" /></div>
            <div><Label>AWB / LR number</Label><Input value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="AWB-4471203399" /></div>
            <div><Label>Transporter name</Label><Input value={transporter} onChange={(e) => setTransporter(e.target.value)} /></div>
            <div><Label>Vehicle number (if available)</Label><Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} /></div>
            <div><Label>Driver name</Label><Input value={driverName} onChange={(e) => setDriverName(e.target.value)} /></div>
            <div><Label>Driver mobile</Label><Input value={driverMobile} onChange={(e) => setDriverMobile(e.target.value)} placeholder="Visible to operational users only" /></div>
            <div><Label>Pickup date & time</Label><Input value={pickupAt} onChange={(e) => setPickupAt(e.target.value)} placeholder="2026-08-06 15:00" /></div>
            <div><Label>Planned dispatch date</Label><Input type="date" value={plannedDispatch} onChange={(e) => setPlanned(e.target.value)} /></div>
            <div><Label>Expected delivery date</Label><Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></div>
            <div><Label>External tracking URL</Label><Input value={tracking} onChange={(e) => setTracking(e.target.value)} /></div>
            <div><Label>Freight amount reference</Label><Input type="number" value={freight} onChange={(e) => setFreight(e.target.value)} /></div>
            <div>
              <Label>Payment responsibility</Label>
              <Select value={paidBy} onValueChange={(v) => setPaidBy(v as typeof paidBy)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Franchise">Franchise</SelectItem>
                  <SelectItem value="To Pay">To Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Booking notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={() => save("booking_pending")}>Save as Booking Pending</Button>
          <Button variant="outline" className="text-destructive" onClick={() => save("booking_failed")}>Mark Booking Failed</Button>
          <Button onClick={() => save("booked_externally")}>Mark Booked Externally</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- record dispatch ---------------- */

function RecordDispatchDialog({
  r,
  onClose,
  onSave,
}: {
  r: PlanRecord;
  onClose: () => void;
  onSave: (upd: Partial<PlanRecord>, note: string) => void;
}) {
  const auto: Record<string, boolean> = {
    clearance: r.clearanceActive,
    packing: r.packingApproved,
    count: r.packages.length === r.approvedPackageCount,
    weight: r.packages.every((p) => !!p.dims && p.weight > 0),
    address: r.addressComplete,
    contact: r.siteContactConfirmed,
    booked: !!r.booking && r.booking.bookingId !== "—",
    ref: !!r.booking && r.booking.awbOrLr !== "—",
    docs: REQUIRED_DOCS.every((d) => r.docs.includes(d)),
    handling: true,
    pickup: !!r.booking?.pickupAt,
    pc: false,
  };
  const [checks, setChecks] = useState<Record<string, boolean>>(auto);
  const [pickupAt, setPickupAt] = useState(r.booking?.pickupAt ?? "");
  const [dispatchAt, setDispatchAt] = useState(`${TODAY} 12:00`);
  const [count, setCount] = useState(String(r.packages.length));
  const [proof, setProof] = useState(false);

  const mandatoryMissing = CHECKLIST.filter((c) => c.mandatory && !checks[c.key]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record dispatch — {r.dispatchId}</DialogTitle>
          <DialogDescription>
            Complete the pre-dispatch checklist. Dispatched status is blocked until every mandatory check is done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <div className="mb-2 text-sm font-medium">Pre-dispatch checklist</div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {CHECKLIST.map((c) => (
                <label key={c.key} className="flex items-start gap-2 text-sm">
                  <Checkbox checked={!!checks[c.key]} onCheckedChange={(v) => setChecks((p) => ({ ...p, [c.key]: !!v }))} />
                  <span>
                    {c.label}
                    {c.mandatory && <span className="ml-1 text-xs text-destructive">*</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Actual pickup date & time</Label><Input value={pickupAt} onChange={(e) => setPickupAt(e.target.value)} placeholder="2026-08-05 12:30" /></div>
            <div><Label>Actual dispatch date & time</Label><Input value={dispatchAt} onChange={(e) => setDispatchAt(e.target.value)} /></div>
            <div><Label>Package count handed over</Label><Input type="number" value={count} onChange={(e) => setCount(e.target.value)} /></div>
            <div><Label>Expected delivery date</Label><Input value={r.booking?.expectedDelivery ?? "—"} readOnly /></div>
            <div><Label>Platform / transporter</Label><Input value={`${r.booking?.platform ?? "—"} · ${r.booking?.transporter ?? "—"}`} readOnly /></div>
            <div><Label>Booking / AWB reference</Label><Input value={`${r.booking?.bookingId ?? "—"} · ${r.booking?.awbOrLr ?? "—"}`} readOnly /></div>
            <div><Label>Logistics Executive</Label><Input value="Logistics Executive" readOnly /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={proof} onCheckedChange={(v) => setProof(!!v)} /> Dispatch proof attached
              </label>
            </div>
          </div>

          {mandatoryMissing.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Pending mandatory checks: {mandatoryMissing.map((m) => m.label).join(", ")}.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={mandatoryMissing.length > 0 || !proof}
            onClick={() =>
              onSave(
                {
                  actualPickupAt: pickupAt,
                  actualDispatchAt: dispatchAt,
                  handedOverCount: Number(count),
                  dispatchProof: proof,
                  logisticsExec: "Logistics Executive",
                },
                `Dispatch recorded — ${count} packages handed over via ${r.booking?.platform}. Project Coordinator and Accounts Manager notified. Moved to Delivery Confirmation with the same Dispatch ID.`,
              )
            }
          >
            <CalendarClock className="mr-2 h-4 w-4" /> Mark Dispatched
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- transporter change / reschedule ---------------- */

function ChangeDialog({
  r,
  onClose,
  onSave,
}: {
  r: PlanRecord;
  onClose: () => void;
  onSave: (note: string) => void;
}) {
  const [mode, setMode] = useState<"transporter" | "reschedule">("transporter");
  const [platform, setPlatform] = useState<Platform>(r.booking?.platform ?? "Shiprocket");
  const [newDate, setNewDate] = useState(r.plannedDispatch ?? "");
  const [reason, setReason] = useState("");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Change transporter or reschedule — {r.dispatchId}</DialogTitle>
          <DialogDescription>
            The Dispatch ID and the original booking history are preserved. A reason is mandatory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="transporter">Change transporter / platform</SelectItem>
              <SelectItem value="reschedule">Reschedule dispatch date</SelectItem>
            </SelectContent>
          </Select>

          {mode === "transporter" ? (
            <div>
              <Label>New platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.value}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div><Label>New planned dispatch date</Label><Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} /></div>
          )}

          <div><Label>Reason (required)</Label><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!reason.trim()}
            onClick={() =>
              onSave(
                mode === "transporter"
                  ? `Transporter changed to ${platform}. Reason: ${reason.trim()} Previous booking retained in history.`
                  : `Dispatch rescheduled to ${newDate}. Reason: ${reason.trim()} Original schedule retained in history.`,
              )
            }
          >
            Save change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
