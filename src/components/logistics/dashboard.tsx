import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Bell,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
  UserPlus,
} from "lucide-react";
import {
  DELAY_OWNER_LABEL,
  DISPATCHES,
  PACKING_STAFF,
  STATUS_LABEL,
  STATUS_TONE,
  TODAY,
  type DispatchRecord,
  type DispatchStatus,
} from "./dashboard-data";

const TONE_TEXT: Record<string, string> = {
  good: "text-emerald-600",
  info: "text-primary",
  warn: "text-amber-600",
  bad: "text-destructive",
  muted: "text-muted-foreground",
};
const TONE_PILL: Record<string, string> = {
  good: "bg-emerald-500/15 text-emerald-700",
  info: "bg-primary/10 text-primary",
  warn: "bg-amber-500/15 text-amber-700",
  bad: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

function Pill({ tone = "muted", children }: { tone?: string; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_PILL[tone] ?? TONE_PILL.muted}`}>
      {children}
    </span>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone = "default",
  icon: Icon,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-colors hover:border-primary/50" : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">{label}</div>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className={`mt-1 text-2xl font-semibold ${TONE_TEXT[tone] ?? "text-foreground"}`}>{value}</div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function CountRow({ label, value, tone = "muted" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${TONE_TEXT[tone] ?? ""}`}>{value}</span>
    </div>
  );
}

const days = (a: string, b: string) =>
  Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

export function LogisticsDashboard({ onGo }: { onGo: (k: string) => void }) {
  const [rows, setRows] = useState<DispatchRecord[]>(DISPATCHES);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<DispatchRecord | null>(null);
  const [assign, setAssign] = useState<DispatchRecord | null>(null);
  const [assignee, setAssignee] = useState("");
  const [returnFor, setReturnFor] = useState<DispatchRecord | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const executive = "Amit Verma";

  const has = (s: DispatchStatus[]) => rows.filter((r) => s.includes(r.status));

  function log(id: string, what: string) {
    // Audit trail: every acceptance, assignment, review, booking, dispatch and
    // delivery confirmation is recorded against the same permanent Dispatch ID.
    toast.success(`${what} — recorded on ${id}`);
  }

  function setStatus(id: string, status: DispatchStatus, patch: Partial<DispatchRecord> = {}) {
    setRows((prev) => prev.map((r) => (r.dispatchId === id ? { ...r, status, ...patch } : r)));
  }

  const kpis = {
    newClearances: has(["clearance_received"]).length,
    packingPending: has(["packing_assigned", "items_checked", "logistics_accepted"]).length,
    packingReview: has(["packing_submitted"]).length,
    readyDispatch: has(["packing_completed", "dispatch_planned"]).length,
    plannedToday: rows.filter((r) => r.booking?.bookingDate === "2026-08-04" || r.status === "booked_externally")
      .length,
    deliveryPending: rows.filter((r) => r.status === "dispatched" || (r.status === "delivered" && !r.proof))
      .length,
    issues: has(["delivery_issue", "returned", "item_unavailable", "packing_correction", "suspended"]).length,
    overdue: rows.filter(
      (r) => r.requiredDelivery < TODAY && !["delivered", "closed", "cancelled"].includes(r.status),
    ).length,
  };

  const priorities = useMemo(() => {
    const list: { label: string; rows: DispatchRecord[]; tone: string }[] = [
      { label: "New Accounts clearances awaiting acceptance", rows: has(["clearance_received"]), tone: "bad" },
      {
        label: "Dispatches required for upcoming store launches",
        rows: rows.filter(
          (r) =>
            days(r.launchDate, TODAY) >= 0 &&
            days(r.launchDate, TODAY) <= 14 &&
            !["delivered", "closed", "cancelled"].includes(r.status),
        ),
        tone: "warn",
      },
      {
        label: "Packing tasks overdue",
        rows: rows.filter((r) => r.status === "packing_assigned" && (r.packingDue ?? "") < TODAY),
        tone: "bad",
      },
      { label: "Packing submissions awaiting review", rows: has(["packing_submitted"]), tone: "warn" },
      {
        label: "Items ready but transport not booked",
        rows: has(["packing_completed", "dispatch_planned"]),
        tone: "warn",
      },
      { label: "Dispatched items awaiting delivery confirmation", rows: has(["dispatched"]), tone: "info" },
      { label: "Delivery issues or returns", rows: has(["delivery_issue", "returned"]), tone: "bad" },
    ];
    return list.filter((l) => l.rows.length > 0);
  }, [rows]);

  const next =
    rows.find((r) => r.status === "clearance_received" && r.priority === "urgent") ??
    rows.find((r) => r.priority === "urgent") ??
    rows[0];

  const latestClearances = [...rows]
    .sort((a, b) => b.clearanceDate.localeCompare(a.clearanceDate))
    .slice(0, 5);

  const alerts: { text: string; tone: string }[] = [
    ...has(["clearance_received"]).map((r) => ({
      text: `${r.store}: clearance ${r.clearanceId} not accepted — accept or return with reason.`,
      tone: "bad",
    })),
    ...rows
      .filter(
        (r) =>
          days(r.launchDate, TODAY) <= 10 && !["delivered", "closed", "cancelled"].includes(r.status),
      )
      .map((r) => ({ text: `${r.store}: launch date ${r.launchDate} approaching.`, tone: "warn" })),
    ...has(["item_unavailable"]).map((r) => ({ text: `${r.store}: required item unavailable.`, tone: "bad" })),
    ...rows
      .filter((r) => r.status === "packing_assigned" && (r.packingDue ?? "") < TODAY)
      .map((r) => ({ text: `${r.store}: packing overdue (due ${r.packingDue}).`, tone: "bad" })),
    ...rows
      .filter((r) => r.status === "packing_submitted" && !r.packingEvidence)
      .map((r) => ({ text: `${r.store}: packing photo evidence missing.`, tone: "warn" })),
    ...has(["packing_completed"]).map((r) => ({
      text: `${r.store}: package ready but transport not booked.`,
      tone: "warn",
    })),
    ...rows
      .filter((r) => r.status === "booked_externally" && !r.booking?.dispatchDate)
      .map((r) => ({ text: `${r.store}: dispatch date missed — record dispatch.`, tone: "warn" })),
    ...has(["dispatched"])
      .filter((r) => (r.booking?.expectedDelivery ?? "") <= TODAY)
      .map((r) => ({ text: `${r.store}: delivery confirmation overdue.`, tone: "warn" })),
    ...has(["delivery_issue"]).map((r) => ({
      text: `${r.store}: shipment damaged or incomplete — ${r.issue}.`,
      tone: "bad",
    })),
    ...has(["suspended"]).map((r) => ({
      text: `${r.store}: Accounts clearance suspended after payment reversal — dispatch planning frozen.`,
      tone: "bad",
    })),
  ];

  const q = query.trim().toLowerCase();
  const results = q
    ? rows.filter((r) =>
        [r.clearanceId, r.dispatchId, r.projectId, r.store, r.city].some((v) =>
          v.toLowerCase().includes(q),
        ),
      )
    : [];

  const packing = {
    unassigned: has(["logistics_accepted", "items_checked"]).length,
    inProgress: has(["packing_assigned"]).length,
    submitted: has(["packing_submitted"]).length,
    corrections: has(["packing_correction"]).length,
    approved: has(["packing_completed"]).length,
    ready: has(["packing_completed", "dispatch_planned"]).length,
  };

  const planning = {
    readyBooking: has(["packing_completed"]).length,
    bookingPending: has(["dispatch_planned"]).length,
    shiprocket: rows.filter((r) => r.booking?.service === "Shiprocket").length,
    wheelseye: rows.filter((r) => r.booking?.service === "WheelsEye").length,
    other: rows.filter((r) => r.booking?.service === "Other").length,
    delayed: has(["dispatch_delayed"]).length,
    dispatchedToday: rows.filter((r) => r.booking?.dispatchDate === TODAY).length,
  };

  const delivery = {
    expectedToday: rows.filter((r) => r.booking?.expectedDelivery === TODAY).length,
    proofPending: rows.filter((r) => r.deliveredOn && !r.proof).length,
    deliveredToday: rows.filter((r) => r.deliveredOn === TODAY).length,
    damaged: rows.filter((r) => (r.issue ?? "").toLowerCase().includes("damag")).length,
    short: rows.filter((r) => (r.issue ?? "").toLowerCase().includes("short")).length,
    confirmPending: has(["delivered"]).length,
  };

  const issues = {
    packing: has(["packing_correction"]).length,
    itemUnavailable: has(["item_unavailable"]).length,
    wrongQty: rows.filter((r) => (r.issue ?? "").toLowerCase().includes("quantity")).length,
    address: rows.filter((r) => (r.issue ?? "").toLowerCase().includes("address")).length,
    transportDelay: has(["dispatch_delayed"]).length,
    damaged: delivery.damaged,
    missing: rows.filter((r) => (r.issue ?? "").toLowerCase().includes("missing")).length,
    returned: has(["returned"]).length,
    suspended: has(["suspended"]).length,
  };

  const perf = [
    { label: "Clearance acceptance time", value: "0.6 day", tone: "good" },
    { label: "Packing assignment time", value: "0.4 day", tone: "good" },
    { label: "Packing completion time", value: "1.9 days", tone: "warn" },
    { label: "Packing approval rate", value: "88%", tone: "good" },
    { label: "Dispatch planning time", value: "0.8 day", tone: "good" },
    { label: "On-time dispatch rate", value: "91%", tone: "good" },
    { label: "On-time delivery confirmation", value: "84%", tone: "warn" },
    { label: "Dispatch issue rate", value: "7%", tone: "warn" },
    { label: "Return or damage rate", value: "4%", tone: "warn" },
    { label: "Overdue (Logistics-controlled)", value: `${kpis.overdue}`, tone: kpis.overdue ? "bad" : "good" },
  ];

  const delayMix = (["accounts", "items", "packing", "transporter", "franchise", "logistics"] as const).map(
    (k) => ({ k, n: rows.filter((r) => r.delayOwner === k).length }),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Welcome, {executive}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Logistics Executive · {new Date(TODAY).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Clearance / Dispatch / Project / store"
              className="w-72 pl-8"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => toast.info(`${alerts.length} notifications`)}>
            <Bell className="h-4 w-4" />
          </Button>
          <Button onClick={() => onGo("planning")}>
            <Truck className="mr-2 h-4 w-4" /> Plan Dispatch
          </Button>
        </div>
      </div>

      {q && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Search results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.length === 0 && <p className="text-sm text-muted-foreground">No matching record.</p>}
            {results.map((r) => (
              <div key={r.dispatchId} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                <div>
                  <span className="font-mono text-xs">{r.dispatchId}</span> · {r.store} · {r.city}
                  <div className="text-xs text-muted-foreground">
                    {r.clearanceId} · {r.projectId} · {r.paymentRequestId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Pill>
                  <Button size="sm" variant="outline" onClick={() => setDetail(r)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="New Clearances" value={kpis.newClearances} tone="warn" icon={ClipboardCheck} onClick={() => onGo("clearances")} />
        <Kpi label="Packing Pending" value={kpis.packingPending} tone="info" icon={Boxes} onClick={() => onGo("packing")} />
        <Kpi label="Packing Waiting for Review" value={kpis.packingReview} tone="warn" icon={ShieldCheck} onClick={() => onGo("packing")} />
        <Kpi label="Ready for Dispatch" value={kpis.readyDispatch} tone="good" icon={PackageCheck} onClick={() => onGo("planning")} />
        <Kpi label="Dispatches Planned Today" value={kpis.plannedToday} tone="info" icon={Truck} onClick={() => onGo("planning")} />
        <Kpi label="Delivery Confirmation Pending" value={kpis.deliveryPending} tone="warn" icon={CalendarClock} onClick={() => onGo("delivery")} />
        <Kpi label="Issues & Returns" value={kpis.issues} tone="bad" icon={AlertTriangle} onClick={() => onGo("issues")} />
        <Kpi label="Overdue Work" value={kpis.overdue} tone={kpis.overdue ? "bad" : "good"} icon={AlertTriangle} />
      </div>

      {/* Next priority dispatch — largest section */}
      {next && (
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg">Next Priority Dispatch</CardTitle>
              <Pill tone={next.priority === "urgent" ? "bad" : "warn"}>{next.priority.toUpperCase()}</Pill>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Clearance ID" value={next.clearanceId} mono />
              <Field label="Dispatch ID" value={next.dispatchId} mono />
              <Field label="Project ID" value={next.projectId} mono />
              <Field label="Payment Request ID" value={next.paymentRequestId} mono />
              <Field label="Franchise / store" value={next.store} />
              <Field label="Destination city" value={next.city} />
              <Field label="Items & quantities" value={`${next.items} items · ${next.qty} units`} />
              <Field label="Required delivery date" value={next.requiredDelivery} />
              <Field label="Planned launch date" value={next.launchDate} />
              <Field label="Current status" value={STATUS_LABEL[next.status]} />
              <Field
                label="Accounts verification"
                value={next.accountsVerified ? "Payment verified by Accounts" : "Not verified"}
              />
              <Field label="Delay attributed to" value={next.delayOwner ? DELAY_OWNER_LABEL[next.delayOwner] : "—"} />
            </div>

            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              <span className="font-medium">Reason for priority: </span>
              {next.priorityReason}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                size="lg"
                disabled={next.status !== "clearance_received"}
                onClick={() => {
                  setStatus(next.dispatchId, "logistics_accepted");
                  log(next.dispatchId, "Clearance accepted");
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Clearance
              </Button>
              <Button size="lg" variant="outline" onClick={() => setAssign(next)}>
                <UserPlus className="mr-2 h-4 w-4" /> Assign Packing
              </Button>
              <Button size="lg" variant="outline" onClick={() => onGo("planning")}>
                <Truck className="mr-2 h-4 w-4" /> Plan Dispatch
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setDetail(next)}>
                View Details
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clearance can also be returned to Accounts with a reason and missing-information list — the same
              Dispatch ID is reused, never duplicated.{" "}
              <button className="underline" onClick={() => setReturnFor(next)}>
                Return clearance
              </button>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Today's priorities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today’s Priorities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {priorities.length === 0 && <p className="text-sm text-muted-foreground">Nothing urgent.</p>}
          {priorities.map((p) => (
            <div key={p.label} className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Pill tone={p.tone}>{p.rows.length}</Pill>
                {p.label}
              </div>
              <div className="grid gap-1.5 md:grid-cols-2">
                {p.rows.slice(0, 4).map((r) => (
                  <button
                    key={`${p.label}-${r.dispatchId}`}
                    onClick={() => setDetail(r)}
                    className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-left text-sm hover:border-primary/50"
                  >
                    <span>
                      <span className="font-mono text-xs">{r.dispatchId}</span> · {r.store}
                    </span>
                    <span className="text-xs text-muted-foreground">{r.city}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Clearance summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dispatch Clearance Summary</CardTitle>
          <p className="text-xs text-muted-foreground">
            Latest five Accounts clearances. Banking and transaction details are never shown here.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {latestClearances.map((r) => (
            <div key={r.clearanceId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-[220px]">
                <div className="text-sm font-medium">
                  <span className="font-mono text-xs">{r.clearanceId}</span> · {r.store}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.city} · {r.items} items · cleared {r.clearanceDate} · required {r.requiredDelivery}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={r.priority === "urgent" ? "bad" : r.priority === "high" ? "warn" : "muted"}>
                  {r.priority}
                </Pill>
                <Pill tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Pill>
                <Button size="sm" variant="outline" onClick={() => setDetail(r)}>
                  Review
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Packing + staff */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Packing Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <CountRow label="Not assigned" value={packing.unassigned} tone="warn" />
            <CountRow label="Packing in progress" value={packing.inProgress} tone="info" />
            <CountRow label="Submitted for review" value={packing.submitted} tone="warn" />
            <CountRow label="Corrections required" value={packing.corrections} tone="bad" />
            <CountRow label="Packing approved" value={packing.approved} tone="good" />
            <CountRow label="Packages ready for dispatch" value={packing.ready} tone="good" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Packing Staff</CardTitle>
            <p className="text-xs text-muted-foreground">
              Staff see only approved items and packing instructions — no financial details.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {PACKING_STAFF.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{s.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.active} active · {s.dueToday} due today · {s.completed} completed ·{" "}
                      <span className={s.corrections ? "text-destructive" : ""}>
                        {s.corrections} corrections
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAssignee(s.name);
                    setAssign(
                      rows.find((r) => ["logistics_accepted", "items_checked"].includes(r.status)) ??
                        rows[0],
                    );
                  }}
                >
                  Assign Task
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Planning + booking references */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dispatch Planning Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <CountRow label="Ready for booking" value={planning.readyBooking} tone="good" />
            <CountRow label="Booking pending" value={planning.bookingPending} tone="warn" />
            <CountRow label="Booked through Shiprocket" value={planning.shiprocket} tone="info" />
            <CountRow label="Booked through WheelsEye" value={planning.wheelseye} tone="info" />
            <CountRow label="Other transporter" value={planning.other} />
            <CountRow label="Dispatch delayed" value={planning.delayed} tone="warn" />
            <CountRow label="Dispatched today" value={planning.dispatchedToday} tone="good" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">External Booking References</CardTitle>
            <p className="text-xs text-muted-foreground">
              Shiprocket and WheelsEye remain the official booking and tracking platforms — the CRM only stores
              the reference.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows
              .filter((r) => r.booking)
              .slice(0, 4)
              .map((r) => (
                <div key={`bk-${r.dispatchId}`} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      <span className="font-mono text-xs">{r.dispatchId}</span> · {r.store}
                    </span>
                    <Pill tone="info">{r.booking!.service}</Pill>
                  </div>
                  <div className="mt-1 grid gap-x-4 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-2">
                    <span>Booking ID: {r.booking!.bookingId}</span>
                    <span>AWB / LR: {r.booking!.awbOrLr}</span>
                    <span>Transporter: {r.booking!.transporter}</span>
                    <span>Vehicle: {r.booking!.vehicle ?? "—"}</span>
                    <span>
                      Driver: {r.booking!.driverName ?? "—"}{" "}
                      {r.booking!.driverMobile ? `(${r.booking!.driverMobile})` : ""}
                    </span>
                    <span>Booked: {r.booking!.bookingDate}</span>
                    <span>Dispatched: {r.booking!.dispatchDate ?? "pending"}</span>
                    <span>Expected delivery: {r.booking!.expectedDelivery}</span>
                  </div>
                  <a
                    href={r.booking!.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline"
                  >
                    Track on {r.booking!.service} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Delivery + issues */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Delivery Confirmation Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <CountRow label="Delivery expected today" value={delivery.expectedToday} tone="info" />
            <CountRow label="Delivery proof pending" value={delivery.proofPending} tone="warn" />
            <CountRow label="Delivered today" value={delivery.deliveredToday} tone="good" />
            <CountRow label="Damaged delivery" value={delivery.damaged} tone="bad" />
            <CountRow label="Short delivery" value={delivery.short} tone="bad" />
            <CountRow label="Customer confirmation pending" value={delivery.confirmPending} tone="warn" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Issues & Returns Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <CountRow label="Packing issue" value={issues.packing} tone="warn" />
            <CountRow label="Item unavailable" value={issues.itemUnavailable} tone="bad" />
            <CountRow label="Wrong quantity" value={issues.wrongQty} tone="warn" />
            <CountRow label="Address problem" value={issues.address} tone="warn" />
            <CountRow label="Transport delay" value={issues.transportDelay} tone="warn" />
            <CountRow label="Damaged shipment" value={issues.damaged} tone="bad" />
            <CountRow label="Missing item" value={issues.missing} tone="bad" />
            <CountRow label="Return initiated" value={issues.returned} tone="bad" />
            <CountRow label="Clearance suspended" value={issues.suspended} tone="bad" />
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            ["Accept Clearance", "clearances"],
            ["Assign Packing Task", "packing"],
            ["Review Packing", "packing"],
            ["Plan Dispatch", "planning"],
            ["Add Booking Reference", "planning"],
            ["Record Dispatch", "planning"],
            ["Confirm Delivery", "delivery"],
            ["Report Issue", "issues"],
          ].map(([label, key]) => (
            <Button key={label} variant="outline" size="sm" onClick={() => onGo(key)}>
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Attention Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
                a.tone === "bad"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <AlertTriangle
                className={`mt-0.5 h-4 w-4 shrink-0 ${a.tone === "bad" ? "text-destructive" : "text-amber-600"}`}
              />
              <span>{a.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance preparation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Performance Signals</CardTitle>
          <p className="text-xs text-muted-foreground">
            Delays are separated by owner, so Logistics is measured only on work it controls.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {perf.map((p) => (
              <div key={p.label} className="rounded-md border bg-card p-3">
                <div className="text-xs text-muted-foreground">{p.label}</div>
                <div className={`mt-0.5 text-lg font-semibold ${TONE_TEXT[p.tone] ?? ""}`}>{p.value}</div>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {delayMix.map((d) => (
              <Badge key={d.k} variant="outline">
                {DELAY_OWNER_LABEL[d.k]}: {d.n}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detail?.dispatchId} — {detail?.store}</DialogTitle>
            <DialogDescription>
              One connected record: {detail?.clearanceId} → {detail?.paymentRequestId} → {detail?.projectId} →{" "}
              {detail?.dispatchId}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status" value={STATUS_LABEL[detail.status]} />
              <Field label="Destination" value={`${detail.city}`} />
              <Field label="Items" value={`${detail.items} items · ${detail.qty} units`} />
              <Field label="Required delivery" value={detail.requiredDelivery} />
              <Field label="Launch date" value={detail.launchDate} />
              <Field label="Packing assignee" value={detail.packingAssignee ?? "Not assigned"} />
              <Field label="Packing due" value={detail.packingDue ?? "—"} />
              <Field label="Photo evidence" value={detail.packingEvidence ? "Uploaded" : "Missing"} />
              <Field label="Accounts verification" value={detail.accountsVerified ? "Verified" : "Not verified"} />
              <Field label="Issue" value={detail.issue ?? "None"} />
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!detail) return;
                setStatus(detail.dispatchId, "packing_completed", { packingEvidence: true });
                log(detail.dispatchId, "Packing approved");
                setDetail(null);
              }}
            >
              Approve Packing
            </Button>
            <Button
              onClick={() => {
                if (!detail) return;
                setStatus(detail.dispatchId, "delivered", { deliveredOn: TODAY, proof: true });
                log(detail.dispatchId, "Delivery confirmed with proof");
                setDetail(null);
              }}
            >
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign packing dialog */}
      <Dialog open={!!assign} onOpenChange={(o) => !o && setAssign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign packing — {assign?.dispatchId}</DialogTitle>
            <DialogDescription>
              The packing task reuses this Dispatch ID. Staff see only approved items and instructions.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Packing staff name"
          />
          <DialogFooter>
            <Button
              disabled={!assignee.trim()}
              onClick={() => {
                if (!assign) return;
                setStatus(assign.dispatchId, "packing_assigned", {
                  packingAssignee: assignee.trim(),
                  packingDue: "2026-08-07",
                });
                log(assign.dispatchId, `Packing assigned to ${assignee.trim()}`);
                setAssign(null);
                setAssignee("");
              }}
            >
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return clearance dialog */}
      <Dialog open={!!returnFor} onOpenChange={(o) => !o && setReturnFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return clearance — {returnFor?.clearanceId}</DialogTitle>
            <DialogDescription>
              A reason and missing-information list are mandatory. No new clearance record is created.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Reason and missing information (item list, quantity, delivery address…)"
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={returnReason.trim().length < 10}
              onClick={() => {
                if (!returnFor) return;
                setStatus(returnFor.dispatchId, "info_required", { issue: returnReason.trim() });
                log(returnFor.dispatchId, "Clearance returned to Accounts");
                setReturnFor(null);
                setReturnReason("");
              }}
            >
              Return to Accounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}
