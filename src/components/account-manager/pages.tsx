import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionHead, StatCard } from "@/components/smm/ui";
import {
  IndianRupee,
  Wallet,
  Clock,
  CheckCircle2,
  Truck,
  Receipt,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const REQUESTS = [
  { id: "PR-2041", store: "Jaipur", type: "Machine Advance", amount: 450000, raisedBy: "Project Coordinator", status: "Pending Approval", due: "Today" },
  { id: "PR-2042", store: "Indore", type: "Civil Work Milestone", amount: 180000, raisedBy: "Project Manager", status: "Verified", due: "6 Aug" },
  { id: "PR-2043", store: "Lucknow", type: "Franchise 2nd Instalment", amount: 600000, raisedBy: "Sales Head", status: "Awaiting Proof", due: "7 Aug" },
  { id: "PR-2044", store: "Surat", type: "Vendor Payment", amount: 92000, raisedBy: "Logistics Executive", status: "Approved", due: "8 Aug" },
  { id: "PR-2045", store: "Nagpur", type: "Machine Balance", amount: 520000, raisedBy: "Project Coordinator", status: "Rejected — Info Missing", due: "—" },
];

const FOLLOWUPS = [
  { id: "FU-501", store: "Lucknow", owner: "R. Mishra", pending: 600000, mode: "NEFT", promised: "6 Aug", attempts: 3, status: "Proof Awaited" },
  { id: "FU-502", store: "Kanpur", owner: "S. Verma", pending: 250000, mode: "UPI", promised: "5 Aug", attempts: 1, status: "Verification Pending" },
  { id: "FU-503", store: "Bhopal", owner: "A. Jain", pending: 120000, mode: "Cheque", promised: "9 Aug", attempts: 2, status: "Follow-up Due" },
  { id: "FU-504", store: "Raipur", owner: "K. Sahu", pending: 75000, mode: "NEFT", promised: "3 Aug", attempts: 4, status: "Overdue" },
];

const DISPATCH = [
  { id: "DC-311", store: "Jaipur", items: "Full machine set", payable: 0, cleared: true, status: "Cleared for Dispatch" },
  { id: "DC-312", store: "Indore", items: "Steam iron + boiler", payable: 40000, cleared: false, status: "Hold — Balance Due" },
  { id: "DC-313", store: "Lucknow", items: "Full machine set", payable: 600000, cleared: false, status: "Hold — Payment Pending" },
  { id: "DC-314", store: "Surat", items: "POS + counter kit", payable: 0, cleared: true, status: "Cleared for Dispatch" },
];

const badgeTone = (s: string) => {
  if (/reject|overdue|hold/i.test(s)) return "bg-rose-100 text-rose-700";
  if (/pending|awaited|due/i.test(s)) return "bg-amber-100 text-amber-700";
  if (/cleared|approved|verified/i.test(s)) return "bg-emerald-100 text-emerald-700";
  return "bg-muted text-muted-foreground";
};

export function AmDashboard() {
  return (
    <div className="space-y-4">
      <SectionHead title="Account Manager Dashboard" subtitle="Payment requests, collections, dispatch clearance and billing at a glance." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Expected This Month" value={inr(5200000)} icon={IndianRupee} />
        <StatCard label="Collected" value={inr(4680000)} icon={CheckCircle2} />
        <StatCard label="Pending Collection" value={inr(520000)} icon={Clock} />
        <StatCard label="Available Cash" value={inr(2210000)} icon={Wallet} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Open Payment Requests" value="5" icon={Receipt} />
        <StatCard label="Follow-ups Due" value="4" icon={AlertTriangle} />
        <StatCard label="Dispatch Holds" value="2" icon={Truck} />
        <StatCard label="Collection Rate" value="90%" icon={TrendingUp} />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today's priority</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {REQUESTS.filter((r) => r.due === "Today" || /Awaited|Pending/.test(r.status))
            .slice(0, 4)
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">
                    {r.id} · {r.store} — {r.type}
                  </div>
                  <div className="text-xs text-muted-foreground">Raised by {r.raisedBy} · due {r.due}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums font-semibold">{inr(r.amount)}</span>
                  <Badge className={badgeTone(r.status)}>{r.status}</Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AmPaymentRequests() {
  return (
    <div className="space-y-4">
      <SectionHead title="Project Payment Requests" subtitle="Requests raised by Project Coordinator, Project Manager, Sales and Logistics." />
      <Card>
        <CardContent className="pt-6 space-y-2">
          {REQUESTS.map((r) => (
            <div key={r.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">
                  {r.id} · {r.store}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.type} · {r.raisedBy} · due {r.due}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-semibold">{inr(r.amount)}</span>
                <Badge className={badgeTone(r.status)}>{r.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AmFollowups() {
  return (
    <div className="space-y-4">
      <SectionHead title="Payment Follow-ups & Verification" subtitle="Chase pending collections and verify payment proofs before clearing." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Pending" value={inr(1045000)} icon={Clock} />
        <StatCard label="Proof Awaited" value="1" icon={Receipt} />
        <StatCard label="Verification Pending" value="1" icon={CheckCircle2} />
        <StatCard label="Overdue" value="1" icon={AlertTriangle} />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-2">
          {FOLLOWUPS.map((f) => (
            <div key={f.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">
                  {f.store} — {f.owner}
                </div>
                <div className="text-xs text-muted-foreground">
                  {f.mode} · promised {f.promised} · {f.attempts} follow-ups
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-semibold">{inr(f.pending)}</span>
                <Badge className={badgeTone(f.status)}>{f.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AmDispatchClearance() {
  return (
    <div className="space-y-4">
      <SectionHead title="Dispatch Clearance" subtitle="Machines and materials dispatch only after payment clearance." />
      <Card>
        <CardContent className="pt-6 space-y-2">
          {DISPATCH.map((d) => (
            <div key={d.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">
                  {d.id} · {d.store}
                </div>
                <div className="text-xs text-muted-foreground">{d.items}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-sm">
                  {d.payable ? `Balance ${inr(d.payable)}` : "No balance"}
                </span>
                <Badge className={badgeTone(d.status)}>{d.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AmBillingPos() {
  return (
    <div className="space-y-4">
      <SectionHead title="Billing POS (Phase 2)" subtitle="Planned store billing and invoicing module — not yet active." />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Phase 2 scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { item: "Store-wise invoice generation", status: "Planned" },
            { item: "GST-compliant billing formats", status: "Planned" },
            { item: "Auto payment reconciliation with POS", status: "Planned" },
            { item: "Franchise royalty auto-invoice", status: "Planned" },
            { item: "Ledger sync with Accounts Manager books", status: "Planned" },
          ].map((s) => (
            <div key={s.item} className="flex items-center justify-between border rounded-md p-3">
              <span>{s.item}</span>
              <Badge variant="secondary">{s.status}</Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Phase 2 activates after POS v3 release. Until then, billing continues in the existing accounts process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AmPerformance() {
  const kpis = [
    { label: "Collection Achievement", value: 90 },
    { label: "Requests Cleared On Time", value: 86 },
    { label: "Proof Verification Accuracy", value: 97 },
    { label: "Dispatch Clearance Speed", value: 78 },
  ];
  return (
    <div className="space-y-4">
      <SectionHead title="Performance" subtitle="System-calculated metrics from payment, verification and dispatch records." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Collected This Month" value={inr(4680000)} icon={IndianRupee} />
        <StatCard label="Avg Verification Time" value="4.2 hrs" icon={Clock} />
        <StatCard label="Requests Processed" value="42" icon={Receipt} />
        <StatCard label="Escalations" value="2" icon={AlertTriangle} />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Score breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {kpis.map((k) => (
            <div key={k.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{k.label}</span>
                <span className="font-semibold tabular-nums">{k.value}%</span>
              </div>
              <Progress value={k.value} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
