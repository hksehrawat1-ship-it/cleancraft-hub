import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  Truck,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  CLEARANCES,
  DELIVERIES,
  DISPATCH_PLANS,
  ISSUES,
  PACKING_TASKS,
  inr,
  maskRef,
  type Clearance,
  type DeliveryRow,
  type DispatchPlan,
  type IssueRow,
  type PackingTask,
} from "./data";

/* ---------- shared bits ---------- */

function Stat({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneCls =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-destructive"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">{label}</div>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className={`mt-1 text-2xl font-semibold ${toneCls}`}>{value}</div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border bg-card p-3">{children}</div>;
}

function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: string }) {
  const map: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    good: "bg-emerald-500/15 text-emerald-700",
    warn: "bg-amber-500/15 text-amber-700",
    bad: "bg-destructive/15 text-destructive",
    info: "bg-primary/10 text-primary",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[tone] ?? map.muted}`}>
      {children}
    </span>
  );
}

function SectionHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ---------- 1. Dashboard ---------- */

export function LogDashboard({ onGo }: { onGo: (k: string) => void }) {
  const pendingClearances = CLEARANCES.filter((c) => c.status === "new").length;
  const packingOpen = PACKING_TASKS.filter((t) => t.status !== "packed").length;
  const inTransit = DISPATCH_PLANS.filter(
    (p) => p.status === "dispatched" || p.status === "in_transit",
  ).length;
  const awaitingPod = DELIVERIES.filter((d) => d.status === "awaiting").length;
  const openIssues = ISSUES.filter((i) => i.status !== "resolved").length;
  const freight = DISPATCH_PLANS.reduce((s, p) => s + p.freight, 0);

  const alerts = [
    ...CLEARANCES.filter((c) => c.status === "new").map(
      (c) => `${c.store}: clearance ${c.id} received — accept and start packing (launch ${c.launchDate}).`,
    ),
    ...PACKING_TASKS.filter((t) => t.status === "qc_failed").map(
      (t) => `${t.store}: packing QC failed on ${t.id} — re-pack before dispatch planning.`,
    ),
    ...ISSUES.filter((i) => i.status === "open").map((i) => `${i.store}: ${i.detail}`),
  ];

  const next = CLEARANCES.filter((c) => c.status === "new").sort((a, b) =>
    a.launchDate.localeCompare(b.launchDate),
  )[0];

  return (
    <div className="space-y-5">
      <SectionHead
        title="Logistics Executive Dashboard"
        desc="Clearances from Accounts flow into packing, dispatch planning, delivery confirmation and issue closure — one connected record per store."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clearances to accept" value={pendingClearances} icon={ClipboardCheck} tone="warn" />
        <Stat label="Packing in progress" value={packingOpen} icon={Boxes} />
        <Stat label="In transit" value={inTransit} icon={Truck} tone="info" as never />
        <Stat label="Awaiting POD" value={awaitingPod} icon={PackageCheck} tone="warn" />
        <Stat label="Open issues / returns" value={openIssues} icon={AlertTriangle} tone={openIssues ? "bad" : "good"} />
        <Stat label="Delivered this month" value={DELIVERIES.filter((d) => d.status === "confirmed").length} icon={CheckCircle2} tone="good" />
        <Stat label="Freight cost (month)" value={inr(freight)} icon={TrendingUp} />
        <Stat label="Avg dispatch TAT" value="1.8 days" sub="Target < 2 days" icon={Clock} tone="good" />
      </div>

      {next && (
        <Card className="border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next action</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">
                Accept clearance {next.id} — {next.store}
              </div>
              <div className="text-xs text-muted-foreground">
                {next.items} items · payment verified {inr(next.amountVerified)} · launch {next.launchDate}
              </div>
            </div>
            <Button size="sm" onClick={() => onGo("clearances")}>
              Open Dispatch Clearances
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Needs attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{a}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today's work queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PACKING_TASKS.map((t) => (
              <Row key={t.id}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{t.store}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.id} · {t.packed}/{t.items} packed · {t.assignee}
                    </div>
                  </div>
                  <Pill tone={t.status === "packed" ? "good" : t.status === "qc_failed" ? "bad" : "warn"}>
                    {t.status.replace("_", " ")}
                  </Pill>
                </div>
                <Progress value={(t.packed / t.items) * 100} className="mt-2 h-1.5" />
              </Row>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shipments on road</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DISPATCH_PLANS.filter((p) => p.status !== "planned").map((p) => (
              <Row key={p.id}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">
                      {p.store} · {p.city}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.transporter} · LR {maskRef(p.lrNumber)} · ETA {p.eta}
                    </div>
                  </div>
                  <Pill tone={p.status === "delivered" ? "good" : "info"}>{p.status.replace("_", " ")}</Pill>
                </div>
              </Row>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------- 2. Dispatch Clearances ---------- */

const CLEARANCE_CHECKS = [
  "Clearance ID matches the project and store record",
  "Payment verified amount matches the billed items",
  "Item list and quantities checked against packing list",
  "Stock available in store for every item",
  "Delivery address and site contact confirmed",
  "Launch date and required-by date noted",
];

export function LogClearances() {
  const [tab, setTab] = useState<"new" | "accepted" | "returned">("new");
  const [sel, setSel] = useState<Clearance | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState("");

  const rows = CLEARANCES.filter((c) => c.status === tab);
  const allChecked = CLEARANCE_CHECKS.every((c) => checks[c]);

  return (
    <div className="space-y-5">
      <SectionHead
        title="Dispatch Clearances"
        desc="Accounts issues clearance only after payment verification. Accept it to unlock packing, or return it with a reason."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="new">New ({CLEARANCES.filter((c) => c.status === "new").length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({CLEARANCES.filter((c) => c.status === "accepted").length})</TabsTrigger>
          <TabsTrigger value="returned">Returned ({CLEARANCES.filter((c) => c.status === "returned").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 lg:grid-cols-2">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No clearances in this tab.</p>}
        {rows.map((c) => (
          <Card key={c.id} className={sel?.id === c.id ? "border-primary" : undefined}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{c.store}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.id} · {c.projectCode} · {c.city}
                  </div>
                </div>
                <Pill tone={c.status === "accepted" ? "good" : c.status === "returned" ? "bad" : "warn"}>
                  {c.status}
                </Pill>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Items: <span className="text-foreground">{c.items}</span></div>
                <div>Verified: <span className="text-foreground">{inr(c.amountVerified)}</span></div>
                <div>Cleared: <span className="text-foreground">{c.clearedOn}</span></div>
                <div>Launch: <span className="text-foreground">{c.launchDate}</span></div>
              </div>
              <Button
                size="sm"
                variant={sel?.id === c.id ? "default" : "outline"}
                onClick={() => {
                  setSel(c);
                  setChecks({});
                  setReason("");
                }}
              >
                {c.status === "new" ? "Review clearance" : "View details"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sel && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Clearance check — {sel.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {CLEARANCE_CHECKS.map((c) => (
                <label key={c} className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={!!checks[c]}
                    onCheckedChange={(v) => setChecks((p) => ({ ...p, [c]: !!v }))}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            <Textarea
              placeholder="Reason (required when returning to Accounts)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={!allChecked}
                onClick={() => toast.success(`Clearance ${sel.id} accepted — packing task created`)}
              >
                Accept & create packing task
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!reason.trim()}
                onClick={() => toast.success(`Clearance ${sel.id} returned to Accounts`)}
              >
                Return to Accounts
              </Button>
            </div>
            {!allChecked && (
              <p className="text-xs text-muted-foreground">
                Complete all {CLEARANCE_CHECKS.length} checks to accept the clearance.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- 3. Packing Tasks ---------- */

export function LogPackingTasks() {
  const [q, setQ] = useState("");
  const rows = PACKING_TASKS.filter((t) =>
    `${t.store} ${t.id} ${t.assignee}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <SectionHead
        title="Packing Tasks"
        desc="Assign packing staff, track item-wise progress and clear QC before a shipment can be planned."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total tasks" value={PACKING_TASKS.length} />
        <Stat label="Packed" value={PACKING_TASKS.filter((t) => t.status === "packed").length} tone="good" />
        <Stat label="In progress" value={PACKING_TASKS.filter((t) => t.status === "in_progress").length} tone="warn" />
        <Stat label="QC failed" value={PACKING_TASKS.filter((t) => t.status === "qc_failed").length} tone="bad" />
      </div>

      <Input placeholder="Search store, task ID or packer…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="space-y-3">
        {rows.map((t: PackingTask) => (
          <Card key={t.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{t.store}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.id} · from {t.clearanceId} · due {t.due} · packer {t.assignee}
                  </div>
                </div>
                <Pill tone={t.status === "packed" ? "good" : t.status === "qc_failed" ? "bad" : "warn"}>
                  {t.status.replace("_", " ")}
                </Pill>
              </div>
              <Progress value={(t.packed / t.items) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {t.packed} of {t.items} items packed
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success(`${t.id} assigned`)}>
                  Assign packer
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${t.id} progress updated`)}>
                  Update progress
                </Button>
                <Button
                  size="sm"
                  disabled={t.packed < t.items}
                  onClick={() => toast.success(`${t.id} marked packed & QC passed`)}
                >
                  Mark packed (QC pass)
                </Button>
              </div>
              {t.packed < t.items && (
                <p className="text-xs text-muted-foreground">
                  All items must be packed before QC can be passed.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------- 4. Dispatch Planning ---------- */

export function LogDispatchPlanning() {
  const [sel, setSel] = useState<DispatchPlan | null>(null);
  const totalFreight = useMemo(() => DISPATCH_PLANS.reduce((s, p) => s + p.freight, 0), []);

  return (
    <div className="space-y-5">
      <SectionHead
        title="Dispatch Planning"
        desc="Pick transporter, vehicle and route for packed shipments, record LR details and lock the ETA against the store launch date."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Planned" value={DISPATCH_PLANS.filter((p) => p.status === "planned").length} tone="warn" />
        <Stat label="Dispatched" value={DISPATCH_PLANS.filter((p) => p.status === "dispatched").length} tone="info" />
        <Stat label="In transit" value={DISPATCH_PLANS.filter((p) => p.status === "in_transit").length} />
        <Stat label="Freight cost" value={inr(totalFreight)} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Store</th>
              <th className="p-3 text-left">Transporter</th>
              <th className="p-3 text-left">Boxes</th>
              <th className="p-3 text-left">ETA</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {DISPATCH_PLANS.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div>{p.id}</div>
                  <div className="text-xs text-muted-foreground">LR {maskRef(p.lrNumber)}</div>
                </td>
                <td className="p-3">
                  <div>{p.store}</div>
                  <div className="text-xs text-muted-foreground">{p.city}</div>
                </td>
                <td className="p-3">
                  <div>{p.transporter}</div>
                  <div className="text-xs text-muted-foreground">{p.vehicle}</div>
                </td>
                <td className="p-3">{p.boxes}</td>
                <td className="p-3">{p.eta}</td>
                <td className="p-3">
                  <Pill tone={p.status === "delivered" ? "good" : p.status === "planned" ? "warn" : "info"}>
                    {p.status.replace("_", " ")}
                  </Pill>
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setSel(p)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {sel.id} — {sel.store}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input defaultValue={sel.transporter} placeholder="Transporter" />
              <Input defaultValue={sel.vehicle} placeholder="Vehicle number" />
              <Input defaultValue={String(sel.boxes)} placeholder="Boxes" />
              <Input defaultValue={sel.eta} placeholder="ETA (YYYY-MM-DD)" />
            </div>
            <Textarea placeholder="Route notes, unloading instructions, site contact timing…" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => toast.success(`${sel.id} dispatch confirmed`)}>
                Confirm dispatch
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success(`${sel.id} plan saved`)}>
                Save plan
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Packing list shared (bank details masked)")}>
                Share packing list
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- 5. Delivery Confirmation ---------- */

export function LogDeliveryConfirmation() {
  const [sel, setSel] = useState<DeliveryRow | null>(null);
  const [pod, setPod] = useState(false);
  const [receiver, setReceiver] = useState("");

  return (
    <div className="space-y-5">
      <SectionHead
        title="Delivery Confirmation"
        desc="Confirm delivery only with receiver name and proof of delivery. Shortages or damage move to Issues & Returns automatically."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Awaiting POD" value={DELIVERIES.filter((d) => d.status === "awaiting").length} tone="warn" />
        <Stat label="Confirmed" value={DELIVERIES.filter((d) => d.status === "confirmed").length} tone="good" />
        <Stat label="Disputed" value={DELIVERIES.filter((d) => d.status === "disputed").length} tone="bad" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {DELIVERIES.map((d) => (
          <Card key={d.id} className={sel?.id === d.id ? "border-primary" : undefined}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{d.store}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.id} · plan {d.planId} · {d.city}
                  </div>
                </div>
                <Pill tone={d.status === "confirmed" ? "good" : d.status === "disputed" ? "bad" : "warn"}>
                  {d.status}
                </Pill>
              </div>
              <div className="text-xs text-muted-foreground">
                Delivered: {d.deliveredOn ?? "—"} · Received by: {d.receivedBy ?? "—"} · POD:{" "}
                {d.podUploaded ? "uploaded" : "pending"}
                {d.shortage && " · shortage reported"}
              </div>
              <Button
                size="sm"
                variant={sel?.id === d.id ? "default" : "outline"}
                onClick={() => {
                  setSel(d);
                  setPod(d.podUploaded);
                  setReceiver(d.receivedBy ?? "");
                }}
              >
                {d.status === "awaiting" ? "Confirm delivery" : "View"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sel && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Confirm delivery — {sel.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Received by (name & role at site)"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={pod} onCheckedChange={(v) => setPod(!!v)} />
              Signed POD / delivery photo attached
            </label>
            <Textarea placeholder="Condition of goods, item count at site, remarks…" />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={!receiver.trim() || !pod}
                onClick={() => toast.success(`${sel.id} delivery confirmed`)}
              >
                Mark delivered
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Issue raised for this delivery")}>
                Report shortage / damage
              </Button>
            </div>
            {(!receiver.trim() || !pod) && (
              <p className="text-xs text-muted-foreground">
                Receiver name and proof of delivery are both required.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- 6. Issues & Returns ---------- */

export function LogIssuesReturns() {
  const [tab, setTab] = useState<"open" | "in_progress" | "resolved">("open");
  const rows = ISSUES.filter((i) => i.status === tab);

  return (
    <div className="space-y-5">
      <SectionHead
        title="Issues & Returns"
        desc="Damage, shortage, wrong item, transit delay and return pickups — each tied to its dispatch plan and store record."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Open" value={ISSUES.filter((i) => i.status === "open").length} tone="bad" />
        <Stat label="In progress" value={ISSUES.filter((i) => i.status === "in_progress").length} tone="warn" />
        <Stat label="Resolved" value={ISSUES.filter((i) => i.status === "resolved").length} tone="good" />
        <Stat label="Avg closure" value="2.1 days" sub="Target < 3 days" tone="good" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing here.</p>}
        {rows.map((i: IssueRow) => (
          <Card key={i.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{i.store}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.id} · plan {i.planId} · raised {i.raisedOn} · owner {i.owner}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{i.type.replace("_", " ")}</Badge>
                  <Pill tone={i.status === "resolved" ? "good" : i.status === "open" ? "bad" : "warn"}>
                    {i.status.replace("_", " ")}
                  </Pill>
                </div>
              </div>
              <p className="text-sm">{i.detail}</p>
              {i.status !== "resolved" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`${i.id} updated`)}>
                    Add update
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Return pickup arranged for ${i.id}`)}>
                    Arrange return pickup
                  </Button>
                  <Button size="sm" onClick={() => toast.success(`${i.id} resolved`)}>
                    Mark resolved
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------- 7. Performance ---------- */

const PERIODS = ["Today", "This Week", "This Month", "This Quarter"] as const;

export function LogPerformance() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("This Month");

  const kpis = [
    { label: "Clearances accepted", value: 14, sub: "on time 13 of 14", tone: "good" as const },
    { label: "Avg clearance acceptance", value: "4.2 hrs", sub: "Target < 8 hrs", tone: "good" as const },
    { label: "Packing accuracy", value: "96%", sub: "4 QC failures", tone: "warn" as const },
    { label: "Avg dispatch TAT", value: "1.8 days", sub: "Packed → dispatched", tone: "good" as const },
    { label: "On-time delivery", value: "89%", sub: "16 of 18 shipments", tone: "good" as const },
    { label: "POD completion", value: "92%", sub: "2 pending", tone: "warn" as const },
    { label: "Issues closed", value: "11", sub: "Avg 2.1 days", tone: "good" as const },
    { label: "Freight cost / shipment", value: inr(14800), sub: "Down 6% vs last month", tone: "good" as const },
  ];

  const insights = [
    "Two packing QC failures came from the same packer — schedule a refresher before the Jaipur dispatch.",
    "Surat shipment delay was caused by a transporter check-post hold; excluded from your on-time score.",
    "POD is pending on 2 delivered shipments — collect them to close the month cleanly.",
  ];

  return (
    <div className="space-y-5">
      <SectionHead
        title="Performance"
        desc="Measured only on time you control. Franchise-side and transporter-side delays are excluded from your scores."
      />

      <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
        <TabsList>
          {PERIODS.map((p) => (
            <TabsTrigger key={p} value={p}>
              {p}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Stat key={k.label} label={k.label} value={k.value} sub={k.sub} tone={k.tone} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Stage-wise turnaround</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { s: "Clearance accepted", v: 90 },
              { s: "Packing completed", v: 82 },
              { s: "Dispatch planned", v: 88 },
              { s: "Delivered on time", v: 89 },
              { s: "Issues closed", v: 78 },
            ].map((r) => (
              <div key={r.s}>
                <div className="flex justify-between text-sm">
                  <span>{r.s}</span>
                  <span className="text-muted-foreground">{r.v}%</span>
                </div>
                <Progress value={r.v} className="mt-1 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Insights ({period})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((t, i) => (
              <div key={i} className="rounded-md border bg-muted/30 p-2 text-sm">
                {t}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
