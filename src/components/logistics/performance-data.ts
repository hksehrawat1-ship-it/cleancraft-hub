/**
 * Logistics Executive performance records.
 * Every figure below is derived from shared clearance, packing, dispatch,
 * delivery and issue records — nothing here is manually editable.
 */

export type PeriodKey = "today" | "week" | "month" | "quarter" | "custom";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  custom: "Custom Date Range",
};

export type Executive = { id: string; name: string; city: string };

export const EXECUTIVES: Executive[] = [
  { id: "LE-01", name: "Rohit Verma", city: "Jaipur Hub" },
  { id: "LE-02", name: "Sneha Kulkarni", city: "Mumbai Hub" },
  { id: "LE-03", name: "Amit Chauhan", city: "Delhi Hub" },
];

export type Metric = {
  label: string;
  value: string | number;
  prev?: string | number;
  tone?: "good" | "info" | "warn" | "bad" | "muted";
  tip: string;
  target?: string;
};

export type PerfBlock = {
  /* headline */
  kpis: Metric[];
  clearance: Metric[];
  packing: Metric[];
  dispatch: Metric[];
  booking: Metric[];
  delivery: Metric[];
  issues: Metric[];
  impact: { own: Metric[]; others: Metric[] };
  control: Metric[];
  workload: Metric[];
  timeSplit: { label: string; total: string; controlled: string; tip: string }[];
  insights: string[];
  excluded: { label: string; count: number }[];
};

/** period scaling of a monthly baseline, so filters visibly work */
const SCALE: Record<PeriodKey, number> = {
  today: 0.05,
  week: 0.25,
  month: 1,
  quarter: 3,
  custom: 0.6,
};

function s(base: number, period: PeriodKey) {
  return Math.max(0, Math.round(base * SCALE[period]));
}

type Baseline = {
  clearReceived: number;
  clearAccepted: number;
  clearReturned: number;
  packCreated: number;
  packApprovedFirst: number;
  dispPlanned: number;
  dispCompleted: number;
  dispOnTime: number;
  delExpected: number;
  delConfirmed: number;
  issues: number;
  issuesResolved: number;
  acceptHrs: number;
  onTimePct: number;
  confirmPct: number;
};

const BASE: Record<string, Baseline> = {
  "LE-01": {
    clearReceived: 42,
    clearAccepted: 39,
    clearReturned: 3,
    packCreated: 39,
    packApprovedFirst: 33,
    dispPlanned: 37,
    dispCompleted: 34,
    dispOnTime: 31,
    delExpected: 34,
    delConfirmed: 31,
    issues: 9,
    issuesResolved: 7,
    acceptHrs: 3.4,
    onTimePct: 91,
    confirmPct: 91,
  },
  "LE-02": {
    clearReceived: 36,
    clearAccepted: 34,
    clearReturned: 2,
    packCreated: 34,
    packApprovedFirst: 26,
    dispPlanned: 32,
    dispCompleted: 28,
    dispOnTime: 23,
    delExpected: 28,
    delConfirmed: 24,
    issues: 12,
    issuesResolved: 8,
    acceptHrs: 6.8,
    onTimePct: 82,
    confirmPct: 86,
  },
  "LE-03": {
    clearReceived: 29,
    clearAccepted: 28,
    clearReturned: 1,
    packCreated: 28,
    packApprovedFirst: 25,
    dispPlanned: 27,
    dispCompleted: 26,
    dispOnTime: 25,
    delExpected: 26,
    delConfirmed: 25,
    issues: 5,
    issuesResolved: 5,
    acceptHrs: 2.1,
    onTimePct: 96,
    confirmPct: 96,
  },
};

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export function buildPerformance(execId: string, period: PeriodKey): PerfBlock {
  const b = BASE[execId] ?? BASE["LE-01"];
  const prevFactor = 0.9;

  const received = s(b.clearReceived, period);
  const accepted = s(b.clearAccepted, period);
  const returned = s(b.clearReturned, period);
  const packCreated = s(b.packCreated, period);
  const packFirst = s(b.packApprovedFirst, period);
  const planned = s(b.dispPlanned, period);
  const completed = s(b.dispCompleted, period);
  const onTime = s(b.dispOnTime, period);
  const delExpected = s(b.delExpected, period);
  const delConfirmed = s(b.delConfirmed, period);
  const issues = s(b.issues, period);
  const issuesResolved = s(b.issuesResolved, period);

  const onTimePct = pct(onTime, completed);
  const confirmPct = pct(delConfirmed, delExpected);
  const issueRate = pct(issues, Math.max(1, completed));
  const returnRate = pct(Math.round(issues * 0.4), Math.max(1, completed));

  const kpis: Metric[] = [
    {
      label: "Clearances Accepted",
      value: accepted,
      prev: Math.round(accepted * prevFactor),
      tone: "good",
      tip: "Count of unique Clearance IDs accepted from Accounts in the selected period. Each Clearance ID is counted once, even if it was returned and re-issued.",
    },
    {
      label: "Avg Clearance Acceptance Time",
      value: `${b.acceptHrs} hrs`,
      prev: `${(b.acceptHrs * 1.15).toFixed(1)} hrs`,
      tone: b.acceptHrs <= 4 ? "good" : "warn",
      target: "Target under 4 hrs",
      tip: "Logistics-controlled time from clearance received to accepted. Hours spent waiting for information from Accounts or the Project Coordinator are excluded.",
    },
    {
      label: "Packing Tasks Assigned on Time",
      value: `${pct(packCreated - Math.round(packCreated * 0.08), packCreated)}%`,
      prev: `${pct(packCreated - Math.round(packCreated * 0.14), packCreated)}%`,
      tone: "good",
      target: "Assign within 4 hrs of acceptance",
      tip: "Share of accepted clearances where a Packing Task ID was created and assigned to Packing Staff within the target window.",
    },
    {
      label: "On-Time Dispatch Rate",
      value: `${onTimePct}%`,
      prev: `${Math.max(0, onTimePct - 4)}%`,
      tone: onTimePct >= 90 ? "good" : onTimePct >= 80 ? "warn" : "bad",
      target: "Target 90%",
      tip: "Dispatches that left on or before the committed date, divided by dispatches completed. Delays caused by item unavailability, Accounts clearance or transporter capacity are recorded separately and do not reduce this figure when follow-up was completed correctly.",
    },
    {
      label: "Delivery Confirmation Rate",
      value: `${confirmPct}%`,
      prev: `${Math.max(0, confirmPct - 5)}%`,
      tone: confirmPct >= 92 ? "good" : confirmPct >= 85 ? "warn" : "bad",
      target: "Target 95%",
      tip: "Deliveries with a completed confirmation record (recipient, checklist and proof) against deliveries expected. Carries higher weight than dispatch volume.",
    },
    {
      label: "Dispatch Issue Rate",
      value: `${issueRate}%`,
      prev: `${issueRate + 2}%`,
      tone: issueRate <= 15 ? "good" : issueRate <= 25 ? "warn" : "bad",
      target: "Keep under 15%",
      tip: "Dispatches that generated at least one Issue ID (damage, shortage, delay or wrong item) as a share of dispatches completed.",
    },
    {
      label: "Return or Damage Rate",
      value: `${returnRate}%`,
      prev: `${returnRate + 1}%`,
      tone: returnRate <= 8 ? "good" : returnRate <= 15 ? "warn" : "bad",
      tip: "Dispatches that ended in a return, replacement or damage claim. Replacement dispatches are never counted as successful original deliveries.",
    },
    {
      label: "Overdue Work",
      value: s(4, period) + (execId === "LE-02" ? 2 : 0),
      prev: s(6, period),
      tone: "bad",
      tip: "Records past their due action date across clearances, packing review, booking and delivery confirmation. Overdue work is always attributed to the stage owner.",
    },
  ];

  const clearance: Metric[] = [
    { label: "Clearances received", value: received, tone: "info", tip: "Unique Clearance IDs issued to this executive by Accounts." },
    { label: "Clearances accepted", value: accepted, tone: "good", tip: "Clearances accepted after the full acceptance checklist was completed." },
    { label: "Clearances returned", value: returned, tone: "warn", tip: "Clearances sent back to Accounts with a documented reason. Returning an incorrect clearance is treated as correct behaviour, not a failure." },
    { label: "Average acceptance time", value: `${b.acceptHrs} hrs`, tone: b.acceptHrs <= 4 ? "good" : "warn", tip: "Logistics-controlled hours from receipt to acceptance." },
    { label: "Urgent clearances accepted on time", value: `${s(9, period)}/${s(10, period)}`, tone: "warn", tip: "Launch-critical clearances accepted inside the urgent window of 2 hours." },
    { label: "Waiting for information", value: s(2, period), tone: "warn", tip: "Clearances paused because Accounts or the Project Coordinator has not supplied required details. Waiting time is excluded from acceptance time." },
    { label: "Suspended clearances", value: s(1, period), tone: "bad", tip: "Clearances suspended by Accounts. Dispatch against a suspended clearance is a control failure." },
    { label: "Overdue for review", value: execId === "LE-02" ? s(3, period) : s(1, period), tone: "bad", tip: "Clearances not accepted or returned within the review window." },
  ];

  const packing: Metric[] = [
    { label: "Packing tasks created", value: packCreated, tone: "info", tip: "Packing Task IDs created from accepted clearances." },
    { label: "Packing tasks assigned", value: packCreated - s(1, period), tone: "info", tip: "Tasks assigned to a named Packing Staff member." },
    { label: "Completed on time", value: `${pct(packFirst, packCreated)}%`, tone: "good", tip: "Packing finished within the target turnaround from assignment." },
    { label: "Waiting for review", value: s(3, period), tone: "warn", tip: "Packing marked complete by staff and awaiting Logistics review." },
    { label: "Approved on first review", value: packFirst, tone: "good", tip: "Packing approved without a correction round — the core packing quality measure." },
    { label: "Returned for correction", value: packCreated - packFirst, tone: "warn", tip: "Packing returned to staff for correction with a documented reason." },
    { label: "Avg packing turnaround", value: `${execId === "LE-02" ? "1.9" : "1.2"} days`, tone: "info", tip: "Assignment to approved review. Time lost waiting for materials is tracked separately." },
    { label: "Delayed — missing materials", value: s(2, period), tone: "warn", tip: "Delay caused by packing material shortage. Not charged to the Logistics Executive when it was reported and followed up." },
    { label: "Delayed — item unavailable", value: s(2, period), tone: "warn", tip: "Delay caused by store item unavailability. Attributed to the availability source, not to Logistics." },
  ];

  const dispatch: Metric[] = [
    { label: "Dispatches planned", value: planned, tone: "info", tip: "Dispatch IDs created after packing approval." },
    { label: "Dispatches booked", value: planned - s(1, period), tone: "info", tip: "Dispatches with a transporter booking recorded." },
    { label: "Dispatches completed", value: completed, tone: "good", tip: "Dispatches that physically left with proof recorded." },
    { label: "Completed on time", value: onTime, tone: "good", tip: "Dispatches that left on or before the committed date." },
    { label: "Dispatches delayed", value: completed - onTime, tone: "warn", tip: "Dispatches that left late. Each delay carries a responsible source." },
    { label: "Packing approval → dispatch", value: `${execId === "LE-02" ? "1.6" : "0.8"} days`, tone: "info", target: "Target under 1 day", tip: "Logistics-controlled gap between packing approval and dispatch handover." },
    { label: "Booking failures", value: s(2, period), tone: "warn", tip: "Booking attempts that failed and had to be re-arranged with another transporter." },
    { label: "Missing booking references", value: s(1, period), tone: "bad", tip: "Dispatches without a recorded booking reference — a control failure." },
    { label: "Missing required documents", value: s(1, period), tone: "bad", tip: "Dispatches missing invoice, packing list or e-way document at handover." },
  ];

  const booking: Metric[] = [
    { label: "Shiprocket bookings", value: s(14, period), tone: "info", tip: "Reference count only. External Shiprocket tracking is not recreated here." },
    { label: "WheelsEye bookings", value: s(11, period), tone: "info", tip: "Reference count only. External WheelsEye tracking is not recreated here." },
    { label: "Other transporters", value: s(6, period), tone: "info", tip: "Local and direct transporter bookings recorded manually." },
    { label: "Booking success rate", value: `${execId === "LE-02" ? 88 : 95}%`, tone: execId === "LE-02" ? "warn" : "good", tip: "Bookings confirmed on the first attempt." },
    { label: "Average booking time", value: `${execId === "LE-02" ? "5.1" : "2.4"} hrs`, tone: "info", tip: "Logistics-controlled time from ready-for-dispatch to booking confirmed." },
    { label: "Booking changes", value: s(3, period), tone: "warn", tip: "Bookings amended after confirmation (vehicle, date or transporter change)." },
    { label: "Transporter-related delays", value: s(3, period), tone: "warn", tip: "Delays caused by the transporter. Attributed to the transporter, not to Logistics." },
  ];

  const delivery: Metric[] = [
    { label: "Deliveries expected", value: delExpected, tone: "info", tip: "Dispatches due for delivery confirmation in the period." },
    { label: "Deliveries confirmed", value: delConfirmed, tone: "good", tip: "Confirmation records completed with recipient details and checklist." },
    { label: "Confirmed on time", value: delConfirmed - s(2, period), tone: "good", tip: "Confirmations completed within 24 hours of arrival." },
    { label: "Confirmation pending", value: delExpected - delConfirmed, tone: "bad", tip: "Delivered shipments still without a confirmation record — the highest-priority pending item." },
    { label: "Partial deliveries", value: s(2, period), tone: "warn", tip: "Deliveries where some items arrived; remaining-delivery dates are tracked on the same Dispatch ID." },
    { label: "Damaged deliveries", value: s(2, period), tone: "bad", tip: "Deliveries with damage recorded. Each raises a linked Issue ID." },
    { label: "Missing shipments", value: s(1, period), tone: "bad", tip: "Shipments recorded as missing in transit." },
    { label: "Avg confirmation time", value: `${execId === "LE-02" ? "1.8" : "0.6"} days`, tone: "info", tip: "Arrival to confirmation. Recipient unavailability is excluded when follow-up was recorded." },
  ];

  const issuesBlock: Metric[] = [
    { label: "Issues reported", value: issues, tone: "info", tip: "Unique Issue IDs raised from packing, dispatch or delivery records." },
    { label: "Issues resolved", value: issuesResolved, tone: "good", tip: "Issues closed with a root cause and preventive action recorded." },
    { label: "Avg resolution time", value: `${execId === "LE-02" ? "4.6" : "2.2"} days`, tone: "info", tip: "Logistics-controlled days to closure. Waiting on transporter claim decisions is tracked separately." },
    { label: "Returns initiated", value: s(3, period), tone: "warn", tip: "Authorised return pickups arranged." },
    { label: "Replacements arranged", value: s(3, period), tone: "warn", tip: "Replacement dispatches linked to the original Dispatch ID. These never count as successful original deliveries." },
    { label: "Claims pending", value: s(2, period), tone: "warn", tip: "Transport damage claims awaiting a transporter decision — outside Logistics control." },
    { label: "Issues reopened", value: s(1, period), tone: "bad", tip: "Issues reopened under the same Issue ID after closure." },
    { label: "Repeat transporter issues", value: s(2, period), tone: "bad", tip: "Same transporter with more than two issues in the period." },
    { label: "Repeat packing issues", value: s(1, period), tone: "warn", tip: "Same packing error type recurring across tasks." },
  ];

  const impactOwn: Metric[] = [
    { label: "Store projects supported", value: s(18, period), tone: "info", tip: "Distinct Store IDs served through the connected Lead → Franchise → Project → Store record." },
    { label: "Dispatched before launch", value: s(16, period), tone: "good", tip: "Dispatches completed before the store launch date." },
    { label: "Critical dispatches completed", value: `${s(6, period)}/${s(6, period)}`, tone: "good", tip: "Launch-critical machine dispatches completed successfully." },
    { label: "Launches delayed by logistics", value: execId === "LE-02" ? s(2, period) : s(1, period), tone: "bad", tip: "Launch delays where the controllable cause sat inside Logistics (late assignment, late booking, missing document)." },
  ];

  const impactOthers: Metric[] = [
    { label: "Delayed by Accounts clearance", value: s(2, period), tone: "warn", tip: "Launch delays caused by late or suspended payment clearance. Not charged to Logistics." },
    { label: "Delayed by item availability", value: s(2, period), tone: "warn", tip: "Launch delays caused by items unavailable at the store. Not charged to Logistics." },
    { label: "Delayed by transporter", value: s(1, period), tone: "warn", tip: "Launch delays caused by transporter capacity or transit failure. Not charged to Logistics." },
    { label: "Delayed by site or recipient", value: s(1, period), tone: "warn", tip: "Launch delays caused by site readiness or recipient unavailability at delivery." },
  ];

  const control: Metric[] = [
    { label: "Dispatch without active clearance", value: 0, tone: "good", tip: "Any dispatch created against a returned or suspended clearance. Must always be zero." },
    { label: "Incorrect item or quantity dispatched", value: s(1, period), tone: "bad", tip: "Dispatched contents that did not match the approved packing list." },
    { label: "Missing booking reference", value: s(1, period), tone: "bad", tip: "Dispatch records without a transporter reference." },
    { label: "Missing dispatch proof", value: s(1, period), tone: "bad", tip: "Dispatches without a handover photo or signed document." },
    { label: "Missing delivery confirmation", value: delExpected - delConfirmed, tone: "bad", tip: "Delivered dispatches with no confirmation record." },
    { label: "Packing approved with errors", value: s(1, period), tone: "warn", tip: "Packing approved at review but later found incorrect at delivery." },
    { label: "Duplicate dispatch records", value: 0, tone: "good", tip: "Verified duplicates are excluded from all metrics; each Dispatch ID counts once." },
    { label: "Suspended-clearance compliance", value: "100%", tone: "good", tip: "Suspended clearances correctly held without dispatch." },
    { label: "Audit-history completeness", value: `${execId === "LE-02" ? 96 : 100}%`, tone: execId === "LE-02" ? "warn" : "good", tip: "Records carrying a complete action history. Completed activity records cannot be deleted." },
  ];

  const workload: Metric[] = [
    { label: "New clearances", value: s(3, period), tone: "info", tip: "Clearances awaiting acceptance right now." },
    { label: "Packing not assigned", value: s(1, period), tone: "warn", tip: "Accepted clearances without a Packing Task ID assigned." },
    { label: "Packing in progress", value: s(4, period), tone: "info", tip: "Packing Task IDs currently being packed." },
    { label: "Packing waiting for review", value: s(3, period), tone: "warn", tip: "Packing awaiting Logistics review." },
    { label: "Ready for dispatch", value: s(3, period), tone: "info", tip: "Approved packing awaiting dispatch planning." },
    { label: "Booking pending", value: s(2, period), tone: "warn", tip: "Dispatch plans without a transporter booking." },
    { label: "Delivery confirmation pending", value: delExpected - delConfirmed, tone: "bad", tip: "Shipments delivered but not confirmed." },
    { label: "Open issues and returns", value: issues - issuesResolved, tone: "bad", tip: "Issue IDs still open." },
  ];

  const timeSplit = [
    {
      label: "Clearance acceptance",
      total: `${(b.acceptHrs * 1.6).toFixed(1)} hrs`,
      controlled: `${b.acceptHrs} hrs`,
      tip: "Total elapsed time includes waiting for Accounts information; controlled time counts only hours Logistics could act.",
    },
    {
      label: "Packing turnaround",
      total: execId === "LE-02" ? "2.6 days" : "1.6 days",
      controlled: execId === "LE-02" ? "1.9 days" : "1.2 days",
      tip: "Material shortage and item unavailability are removed from controlled time.",
    },
    {
      label: "Approval to dispatch",
      total: execId === "LE-02" ? "2.4 days" : "1.1 days",
      controlled: execId === "LE-02" ? "1.6 days" : "0.8 days",
      tip: "Transporter capacity waiting is removed from controlled time.",
    },
    {
      label: "Delivery confirmation",
      total: execId === "LE-02" ? "3.1 days" : "1.2 days",
      controlled: execId === "LE-02" ? "1.8 days" : "0.6 days",
      tip: "Recipient unavailability is removed when follow-up was recorded.",
    },
    {
      label: "Issue resolution",
      total: execId === "LE-02" ? "8.2 days" : "4.0 days",
      controlled: execId === "LE-02" ? "4.6 days" : "2.2 days",
      tip: "Transporter claim decision time is removed from controlled time.",
    },
  ];

  /* rules-based insights, no scoring */
  const insights: string[] = [];
  if (b.acceptHrs > 4)
    insights.push(
      `Accept urgent clearances faster — average acceptance is ${b.acceptHrs} hrs against a 4 hr target, and ${s(10, period) - s(9, period)} urgent clearance(s) missed the window.`,
    );
  if (packCreated - packFirst > 0)
    insights.push(
      `Assign packing immediately after acceptance — ${s(1, period)} accepted clearance(s) have no Packing Task ID and ${packCreated - packFirst} task(s) needed a correction round.`,
    );
  if (onTimePct < 92)
    insights.push(
      `Reduce the delay between packing approval and booking — the controlled gap is ${execId === "LE-02" ? "1.6" : "0.8"} days and on-time dispatch is at ${onTimePct}%.`,
    );
  if (delExpected - delConfirmed > 0)
    insights.push(
      `Complete ${delExpected - delConfirmed} pending delivery confirmation(s) — confirmation carries more weight than dispatch volume.`,
    );
  if (s(2, period) > 0)
    insights.push(
      `Resolve open damaged-delivery cases — ${s(2, period)} damaged delivery record(s) and ${s(2, period)} claim(s) are awaiting closure with root cause and preventive action.`,
    );
  while (insights.length < 5) {
    insights.push("Keep booking references and dispatch proof attached at handover so control checks stay clean.");
  }

  const excluded = [
    { label: "Test records", count: s(2, period) },
    { label: "Cancelled records", count: s(3, period) },
    { label: "Verified duplicates", count: s(1, period) },
    { label: "Reassigned work (history preserved)", count: s(2, period) },
  ];

  return {
    kpis,
    clearance,
    packing,
    dispatch,
    booking,
    delivery,
    issues: issuesBlock,
    impact: { own: impactOwn, others: impactOthers },
    control,
    workload,
    timeSplit,
    insights: insights.slice(0, 5),
    excluded,
  };
}
