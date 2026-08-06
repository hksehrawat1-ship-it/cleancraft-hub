import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionHead, StatCard } from "@/components/smm/ui";
import { toast } from "sonner";
import { Download, Info, Lightbulb, ShieldCheck } from "lucide-react";

const PERIODS = ["Today", "This Week", "This Month", "This Quarter", "Custom Date Range"] as const;
type Period = (typeof PERIODS)[number];

const MANAGERS = ["Priya Nair (me)", "Rohit Menon", "Company (all Accounts)"] as const;

type Snapshot = {
  label: string;
  requestsReceived: number;
  requestsReviewed: number;
  requestsAccepted: number;
  requestsReturned: number;
  acceptedOnTime: number;
  avgReviewHrs: number;
  urgentOnTime: number;
  urgentTotal: number;
  requestsOverdue: number;
  duplicateRequests: number;

  requestsSent: number;
  followupsScheduled: number;
  followupsOnTime: number;
  followupsLate: number;
  followupsOverdue: number;
  promises: number;
  missedPromises: number;
  unreachable: number;
  avgCollectionDays: number;

  avgDaysToPayment: number;

  paymentsReceived: number;
  paymentsVerified: number;
  avgVerifyHrs: number;
  awaitingVerification: number;
  verificationRejected: number;
  duplicateTxn: number;
  reversals: number;
  corrections: number;

  clearancesReady: number;
  clearancesIssued: number;
  avgClearanceHrs: number;
  clearAccepted: number;
  clearReturned: number;
  clearSuspended: number;
  awaitingClearance: number;
  dispatchDelaysByAccounts: number;

  acceptedMissingInfo: number;
  incorrectVerification: number;
  duplicateEntries: number;
  clearedBeforeFullPayment: number;
  clearanceReversalRate: number;
  missingVyapar: number;
  paymentsWithoutProof: number;
  auditCompleteness: number;
  controlCompliance: number;

  projectsCleared: number;
  delaysFranchise: number;
  delaysAccounts: number;
  machineDispatches: number;
  consumableDispatches: number;
  projectsAwaitingPayment: number;

  categories: { name: string; total: number; verified: number }[];
};

const build = (label: string, m: number): Snapshot => {
  const r = (n: number) => Math.max(0, Math.round(n * m));
  return {
    label,
    requestsReceived: r(46), requestsReviewed: r(44), requestsAccepted: r(38), requestsReturned: r(6),
    acceptedOnTime: r(35), avgReviewHrs: 6.4, urgentOnTime: r(11), urgentTotal: r(12),
    requestsOverdue: r(2), duplicateRequests: r(3),

    requestsSent: r(38), followupsScheduled: r(92), followupsOnTime: r(84), followupsLate: r(6),
    followupsOverdue: r(2), promises: r(29), missedPromises: r(5), unreachable: r(3), avgCollectionDays: 7.8,

    avgDaysToPayment: 7.8,

    paymentsReceived: r(41), paymentsVerified: r(38), avgVerifyHrs: 5.2, awaitingVerification: r(3),
    verificationRejected: r(2), duplicateTxn: r(2), reversals: r(1), corrections: r(3),

    clearancesReady: r(9), clearancesIssued: r(31), avgClearanceHrs: 9.6, clearAccepted: r(27),
    clearReturned: r(3), clearSuspended: r(1), awaitingClearance: r(4), dispatchDelaysByAccounts: r(1),

    acceptedMissingInfo: r(2), incorrectVerification: r(1), duplicateEntries: r(2),
    clearedBeforeFullPayment: 0, clearanceReversalRate: 3.2, missingVyapar: r(4),
    paymentsWithoutProof: r(2), auditCompleteness: 97, controlCompliance: 94,

    projectsCleared: r(24), delaysFranchise: r(5), delaysAccounts: r(1),
    machineDispatches: r(14), consumableDispatches: r(17), projectsAwaitingPayment: r(6),

    categories: [
      { name: "Franchise Fee", total: r(9), verified: r(8) },
      { name: "Machine Payment", total: r(12), verified: r(9) },
      { name: "Consumables Payment", total: r(8), verified: r(7) },
      { name: "Training Fee", total: r(6), verified: r(4) },
      { name: "Other Approved Charges", total: r(3), verified: r(2) },
    ],
  };
};

const CURRENT: Record<Period, Snapshot> = {
  Today: build("Today", 0.04),
  "This Week": build("This Week", 0.22),
  "This Month": build("This Month", 1),
  "This Quarter": build("This Quarter", 2.9),
  "Custom Date Range": build("Custom Range", 0.7),
};
const PREVIOUS: Record<Period, Snapshot> = {
  Today: build("Yesterday", 0.035),
  "This Week": build("Last Week", 0.19),
  "This Month": build("Last Month", 0.88),
  "This Quarter": build("Last Quarter", 2.5),
  "Custom Date Range": build("Previous Range", 0.62),
};

function Metric({ label, value, tip, tone }: { label: string; value: string; tip: string; tone?: "good" | "warn" | "bad" }) {
  const toneCls =
    tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : tone === "bad" ? "text-rose-700" : "text-foreground";
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={`About ${label}`}><Info className="h-3 w-3" /></button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px] text-xs">{tip}</TooltipContent>
        </Tooltip>
      </div>
      <div className={`text-lg font-semibold tabular-nums ${toneCls}`}>{value}</div>
    </div>
  );
}

function Delta({ now, prev, invert }: { now: number; prev: number; invert?: boolean }) {
  if (!prev) return null;
  const pct = ((now - prev) / prev) * 100;
  const better = invert ? pct < 0 : pct > 0;
  return (
    <span className={`text-[11px] ${Math.abs(pct) < 0.5 ? "text-muted-foreground" : better ? "text-emerald-600" : "text-rose-600"}`}>
      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}% vs {invert ? "previous" : "previous"}
    </span>
  );
}

export function AmPerformance() {
  const [period, setPeriod] = useState<Period>("This Month");
  const [manager, setManager] = useState<string>(MANAGERS[0]);
  const [compare, setCompare] = useState(true);
  const [from, setFrom] = useState("1 Jul 2026");
  const [to, setTo] = useState("31 Jul 2026");

  const d = CURRENT[period];
  const p = PREVIOUS[period];

  const collectionRate = useMemo(() => (d.paymentsReceived ? Math.round((d.paymentsVerified / d.paymentsReceived) * 100) : 0), [d]);
  const onTimeRate = d.requestsAccepted ? Math.round((d.acceptedOnTime / d.requestsAccepted) * 100) : 0;
  const followupRate = d.followupsScheduled ? Math.round((d.followupsOnTime / d.followupsScheduled) * 100) : 0;

  const insights = useMemo(() => {
    const out: { text: string; tone: "bad" | "warn" | "good" }[] = [];
    if (d.followupsOverdue > 0) out.push({ text: `Complete ${d.followupsOverdue} overdue payment follow-up(s) before end of day.`, tone: "bad" });
    if (d.awaitingVerification > 0) out.push({ text: `Verify ${d.awaitingVerification} received payment(s) faster — average verification is ${d.avgVerifyHrs} hrs.`, tone: "warn" });
    if (d.awaitingClearance > 0) out.push({ text: `Send dispatch clearance for ${d.awaitingClearance} verified payment(s) awaiting clearance.`, tone: "warn" });
    if (d.missingVyapar > 0) out.push({ text: `Add missing Vyapar references on ${d.missingVyapar} record(s) to keep audit history complete.`, tone: "warn" });
    if (d.clearReturned > 0) out.push({ text: `Resolve ${d.clearReturned} clearance(s) returned by Logistics.`, tone: "bad" });
    while (out.length < 5) out.push({ text: "Financial controls are healthy for this period — keep verification before clearance.", tone: "good" });
    return out.slice(0, 5);
  }, [d]);

  const workload = [
    { label: "New project requests", v: d.requestsReceived - d.requestsReviewed + 4, tone: "blue" },
    { label: "Follow-ups due", v: d.followupsScheduled - d.followupsOnTime - d.followupsLate, tone: "blue" },
    { label: "Overdue follow-ups", v: d.followupsOverdue, tone: "red" },
    { label: "Payment verification pending", v: d.awaitingVerification, tone: "amber" },
    { label: "Clearance ready", v: d.clearancesReady, tone: "amber" },
    { label: "Logistics acceptance pending", v: Math.max(0, d.clearancesIssued - d.clearAccepted - d.clearReturned), tone: "blue" },
    { label: "Disputed payments", v: d.verificationRejected, tone: "red" },
    { label: "Suspended clearances", v: d.clearSuspended, tone: "red" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHead
            title="Accounts Manager Performance"
            sub={`${d.label} · calculated from payment request, follow-up, transaction and clearance records`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger className="h-9 w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>{MANAGERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" variant={compare ? "default" : "outline"} onClick={() => setCompare((v) => !v)}>
              Compare with previous period
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Performance report exported (sample)")}>
              <Download className="h-4 w-4 mr-2" /> Export Report
            </Button>
          </div>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="flex flex-wrap h-auto">
            {PERIODS.map((x) => <TabsTrigger key={x} value={x} className="text-xs">{x}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        {period === "Custom Date Range" && (
          <Card><CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><Label className="text-[11px]">From</Label><Input className="h-9" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><Label className="text-[11px]">To</Label><Input className="h-9" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </CardContent></Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Payment Requests Received" value={String(d.requestsReceived)} />
          <StatCard label="Requests Accepted on Time" value={`${onTimeRate}%`} tone={onTimeRate >= 90 ? "good" : "warn"} />
          <StatCard label="Follow-ups Completed on Time" value={`${followupRate}%`} tone={followupRate >= 90 ? "good" : "warn"} />
          <StatCard label="Average Verification Time" value={`${d.avgVerifyHrs} hrs`} tone={d.avgVerifyHrs <= 8 ? "good" : "warn"} />
          <StatCard label="Payments Verified" value={String(d.paymentsVerified)} />
          <StatCard label="Dispatch Clearances Sent" value={String(d.clearancesIssued)} />
          <StatCard label="Average Clearance Time" value={`${d.avgClearanceHrs} hrs`} tone={d.avgClearanceHrs <= 12 ? "good" : "warn"} />
        </div>

        {compare && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Compared with {p.label}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>Requests received: <b>{d.requestsReceived}</b> <Delta now={d.requestsReceived} prev={p.requestsReceived} /></div>
              <div>Payments verified: <b>{d.paymentsVerified}</b> <Delta now={d.paymentsVerified} prev={p.paymentsVerified} /></div>
              <div>Verification time: <b>{d.avgVerifyHrs} hrs</b> <Delta now={d.avgVerifyHrs} prev={p.avgVerifyHrs} invert /></div>
              <div>Clearance turnaround: <b>{d.avgClearanceHrs} hrs</b> <Delta now={d.avgClearanceHrs} prev={p.avgClearanceHrs} invert /></div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Project request performance</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Metric label="Requests received" value={String(d.requestsReceived)} tip="Count of project payment requests submitted by Project Coordinators in the period." />
            <Metric label="Requests reviewed" value={String(d.requestsReviewed)} tip="Requests where the Accounts Manager completed the review checklist." />
            <Metric label="Requests accepted" value={String(d.requestsAccepted)} tone="good" tip="Requests accepted after the nine-point review; each request is counted once." />
            <Metric label="Returned for information" value={String(d.requestsReturned)} tone="warn" tip="Requests sent back to the coordinator because mandatory information was missing." />
            <Metric label="Average review time" value={`${d.avgReviewHrs} hrs`} tip="Time from request submission to acceptance or return, excluding time waiting on the coordinator." />
            <Metric label="Urgent handled on time" value={`${d.urgentOnTime}/${d.urgentTotal}`} tone={d.urgentOnTime === d.urgentTotal ? "good" : "warn"} tip="Urgent requests reviewed inside the four-hour urgent target." />
            <Metric label="Requests overdue" value={String(d.requestsOverdue)} tone={d.requestsOverdue ? "bad" : "good"} tip="Requests still unreviewed past their review target." />
            <Metric label="Duplicate requests identified" value={String(d.duplicateRequests)} tone="good" tip="Duplicates caught by the project, type and amount check. Verified duplicates are excluded from collection totals." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Payment follow-up performance</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <Metric label="Payment requests sent" value={String(d.requestsSent)} tip="Accepted requests sent to franchise owners for payment." />
            <Metric label="Follow-ups scheduled" value={String(d.followupsScheduled)} tip="Scheduled follow-up calls or messages against pending payments." />
            <Metric label="Completed on time" value={String(d.followupsOnTime)} tone="good" tip="Follow-ups completed on or before their due date." />
            <Metric label="Completed late" value={String(d.followupsLate)} tone="warn" tip="Follow-ups completed after the due date." />
            <Metric label="Currently overdue" value={String(d.followupsOverdue)} tone={d.followupsOverdue ? "bad" : "good"} tip="Follow-ups past due and not yet completed." />
            <Metric label="Promise-to-pay recorded" value={String(d.promises)} tip="Commitments captured from franchise owners with a promised date." />
            <Metric label="Missed commitments" value={String(d.missedPromises)} tone="warn" tip="Promised payments not received by the promised date. Counted as franchise-controlled delay." />
            <Metric label="Owners unreachable" value={String(d.unreachable)} tone="warn" tip="Follow-up attempts where the franchise owner could not be contacted. Not counted against the Accounts Manager." />
            <Metric label="Average collection time" value={`${d.avgCollectionDays} days`} tip="Days from payment request sent to payment received, measured only on paid requests." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Payment collection summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Metric label="Verification rate" value={`${collectionRate}%`} tone={collectionRate >= 80 ? "good" : "warn"} tip="Payments verified as a percentage of payments received." />
              <Metric label="Payments verified" value={String(d.paymentsVerified)} tone="good" tip="Payments matched to Vyapar references and counted as verified." />
              <Metric label="Average days to payment" value={`${d.avgDaysToPayment} days`} tip="Average time franchise owners take to pay after the request is sent." />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment type</TableHead>
                    <TableHead className="w-[220px]">Verified rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.categories.map((c) => {
                    const rate = c.total ? Math.round((c.verified / c.total) * 100) : 0;
                    return (
                      <TableRow key={c.name}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={rate} className="h-2" />
                            <span className="text-xs tabular-nums">{rate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Payment verification performance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Metric label="Payments received" value={String(d.paymentsReceived)} tip="Transactions recorded against payment requests. Each transaction counts once." />
              <Metric label="Payments verified" value={String(d.paymentsVerified)} tone="good" tip="Transactions cleared through the ten-point verification checklist." />
              <Metric label="Average verification time" value={`${d.avgVerifyHrs} hrs`} tip="Time from payment recorded to verification completed, excluding waiting on bank confirmation." />
              <Metric label="Awaiting verification" value={String(d.awaitingVerification)} tone="warn" tip="Received payments not yet verified." />
              <Metric label="Verification rejected" value={String(d.verificationRejected)} tone="bad" tip="Payments rejected because references or amounts did not match." />
              <Metric label="Duplicate transactions detected" value={String(d.duplicateTxn)} tone="good" tip="Repeat transaction references caught before verification. Excluded from collection totals." />
              <Metric label="Payment reversals" value={String(d.reversals)} tone="bad" tip="Payments reversed by the bank after being recorded. Reversal automatically suspends any active clearance." />
              <Metric label="Corrections required" value={String(d.corrections)} tone="warn" tip="Verified records that later needed correction. Counted as an accuracy issue." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Dispatch clearance performance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Metric label="Clearances ready" value={String(d.clearancesReady)} tip="Clearances created but not yet sent to Logistics." />
              <Metric label="Clearances issued" value={String(d.clearancesIssued)} tone="good" tip="Clearances sent to the assigned Logistics Executive." />
              <Metric label="Average turnaround" value={`${d.avgClearanceHrs} hrs`} tip="Time from payment verification to clearance sent." />
              <Metric label="Accepted by Logistics" value={String(d.clearAccepted)} tone="good" tip="Clearances accepted by Logistics without a return." />
              <Metric label="Returned by Logistics" value={String(d.clearReturned)} tone="bad" tip="Clearances returned for clarification such as address or quantity issues." />
              <Metric label="Clearances suspended" value={String(d.clearSuspended)} tone="bad" tip="Clearances suspended after payment reversal, dispute or authorised instruction." />
              <Metric label="Verified payments awaiting clearance" value={String(d.awaitingClearance)} tone="warn" tip="Verified payments needing dispatch that have no clearance yet." />
              <Metric label="Dispatch delays from Accounts" value={String(d.dispatchDelaysByAccounts)} tone={d.dispatchDelaysByAccounts ? "bad" : "good"} tip="Dispatch delays caused specifically by pending financial clearance." />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Quality and control metrics</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <Metric label="Accepted with missing info" value={String(d.acceptedMissingInfo)} tone="bad" tip="Requests accepted although mandatory information was incomplete." />
            <Metric label="Incorrect verification" value={String(d.incorrectVerification)} tone="bad" tip="Payments verified incorrectly and later corrected." />
            <Metric label="Duplicate transaction entries" value={String(d.duplicateEntries)} tone="warn" tip="Duplicate transaction rows created and later merged or cancelled." />
            <Metric label="Cleared before full payment" value={String(d.clearedBeforeFullPayment)} tone={d.clearedBeforeFullPayment ? "bad" : "good"} tip="Clearances issued without full payment or an authorised partial-payment approval." />
            <Metric label="Clearance reversal rate" value={`${d.clearanceReversalRate}%`} tone={d.clearanceReversalRate <= 5 ? "good" : "bad"} tip="Share of issued clearances later suspended or cancelled." />
            <Metric label="Missing Vyapar references" value={String(d.missingVyapar)} tone="warn" tip="Verified records without an invoice or receipt reference recorded." />
            <Metric label="Payments without proof" value={String(d.paymentsWithoutProof)} tone="bad" tip="Received payments with no proof document attached." />
            <Metric label="Audit-history completeness" value={`${d.auditCompleteness}%`} tone={d.auditCompleteness >= 95 ? "good" : "warn"} tip="Share of records with a complete action history. Completed financial records cannot be deleted." />
            <Metric label="Financial-control compliance" value={`${d.controlCompliance}%`} tone={d.controlCompliance >= 90 ? "good" : "warn"} tip="Weighted score across verification accuracy, references, proof and clearance discipline. Accuracy outweighs collection volume." />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Project impact</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Metric label="Projects financially cleared" value={String(d.projectsCleared)} tone="good" tip="Projects where all required payments were verified and cleared." />
              <Metric label="Machine dispatches cleared" value={String(d.machineDispatches)} tip="Machine clearances issued in the period." />
              <Metric label="Consumable dispatches cleared" value={String(d.consumableDispatches)} tip="Consumable and packaging clearances issued in the period." />
              <Metric label="Projects awaiting payment" value={String(d.projectsAwaitingPayment)} tone="warn" tip="Projects blocked because franchise payment has not arrived." />
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <div className="text-[11px] uppercase text-amber-800">Launches delayed — franchise-caused</div>
                  <div className="text-lg font-semibold text-amber-800">{d.delaysFranchise}</div>
                  <div className="text-[11px] text-amber-800">Follow-ups were completed on time; not counted against the Accounts Manager.</div>
                </div>
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
                  <div className="text-[11px] uppercase text-rose-800">Launches delayed — Accounts-controlled</div>
                  <div className="text-lg font-semibold text-rose-800">{d.delaysAccounts}</div>
                  <div className="text-[11px] text-rose-800">Delays inside Accounts control such as late verification or clearance.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Workload status</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {workload.map((w) => (
                <div key={w.label} className="rounded-md border p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{w.label}</div>
                  <div className={`text-lg font-semibold ${w.tone === "red" ? "text-rose-700" : w.tone === "amber" ? "text-amber-700" : "text-blue-700"}`}>{w.v}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Performance insights</CardTitle></CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {insights.map((i, idx) => (
              <div key={idx} className={`text-xs rounded-md border p-2 ${i.tone === "bad" ? "border-rose-200 bg-rose-50 text-rose-800" : i.tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                {idx + 1}. {i.text}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Fair calculation and access rules</CardTitle></CardHeader>
          <CardContent className="grid gap-1 md:grid-cols-2 text-xs text-muted-foreground">
            <div>Every figure is derived from payment request, follow-up, transaction and clearance records — performance numbers cannot be edited manually.</div>
            <div>Franchise-caused payment delays are tracked separately and never counted against the Accounts Manager when follow-ups were on time.</div>
            <div>Partial and unverified payments are excluded from collected amounts; each transaction and clearance is counted once.</div>
            <div>Test, cancelled and verified duplicate records are excluded; history is preserved when requests are reassigned.</div>
            <div>Accounts Managers see only their own performance. CEO sees individual and company-level Accounts performance. HR Head sees approved summaries.</div>
            <div>Project Coordinators see only their project request status; Logistics Executives see only clearance outcomes relevant to them. Accounts Managers are never publicly ranked.</div>
            <div className="md:col-span-2">
              <Badge className="bg-muted text-muted-foreground">Viewing: {manager} · {period === "Custom Date Range" ? `${from} – ${to}` : d.label}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
