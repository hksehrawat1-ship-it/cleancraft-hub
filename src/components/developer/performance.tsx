import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Info,
  Lightbulb,
  Lock,
  Minus,
  ShieldCheck,
} from "lucide-react";
import { SectionHead } from "@/components/smm/ui";

/* --------------------------------- config -------------------------------- */

const PERIODS = ["Today", "This Week", "This Month", "This Quarter", "Custom Date Range"] as const;
type Period = (typeof PERIODS)[number];

const DEVELOPERS = ["Ravi Menon (me)", "Aditi Shah", "Karan Bhatia", "Sneha Rao", "Team (all developers)"] as const;

type Tone = "good" | "active" | "warn" | "bad";

const toneText: Record<Tone, string> = {
  good: "text-emerald-600",
  active: "text-blue-600",
  warn: "text-amber-600",
  bad: "text-destructive",
};
const toneBorder: Record<Tone, string> = {
  good: "border-emerald-500/30 bg-emerald-500/5",
  active: "border-blue-500/30 bg-blue-500/5",
  warn: "border-amber-500/30 bg-amber-500/5",
  bad: "border-destructive/30 bg-destructive/5",
};

/* ------------------------------ sample records --------------------------- */
/* Derived from the same work records used by Tickets, Project Tasks,
   Store & POS Setup, Bugs & Testing and Releases. Excludes test,
   cancelled and duplicate records; linked items counted once. */

type Metric = {
  label: string;
  value: string;
  prev: string;
  tone: Tone;
  higherIsBetter: boolean;
  tip: string;
  delta: number; // percentage-point / percent change vs previous period
};

function scale(v: number, factor: number, digits = 0) {
  return Number((v * factor).toFixed(digits));
}

function buildData(period: Period, dev: string) {
  // volume factor per period, quality factor per developer — deterministic sample data
  const vf = period === "Today" ? 0.06 : period === "This Week" ? 0.28 : period === "This Month" ? 1 : 2.9;
  const qf = dev.startsWith("Ravi") ? 1 : dev.startsWith("Aditi") ? 1.03 : dev.startsWith("Karan") ? 0.94 : dev.startsWith("Sneha") ? 0.98 : 1;

  const n = (base: number) => Math.max(0, Math.round(base * vf));
  const p = (base: number) => Math.min(100, Math.round(base * qf));

  const primary: Metric[] = [
    {
      label: "Work Items Completed",
      value: String(n(46)),
      prev: String(n(41)),
      tone: "good",
      higherIsBetter: true,
      delta: 12,
      tip: "Unique completed outcomes across tickets, tasks, setups, bugs and releases. Linked records for the same work are counted once. Test, cancelled and duplicate records are excluded.",
    },
    {
      label: "Work Completed on Time",
      value: `${p(88)}%`,
      prev: `${p(84)}%`,
      tone: p(88) >= 85 ? "good" : "warn",
      higherIsBetter: true,
      delta: 4,
      tip: "Share of completed work delivered on or before the agreed target date. Time genuinely spent waiting for requester information or mandatory approval is excluded from the clock.",
    },
    {
      label: "Average First-Response Time",
      value: `${scale(1.6, 1 / qf, 1)} hrs`,
      prev: "2.1 hrs",
      tone: "good",
      higherIsBetter: false,
      delta: -24,
      tip: "Average developer-controlled time from assignment to the first substantive response on a ticket, task or bug.",
    },
    {
      label: "Average Resolution Time",
      value: `${scale(1.9, 1 / qf, 1)} days`,
      prev: "2.3 days",
      tone: "good",
      higherIsBetter: false,
      delta: -17,
      tip: "Developer-controlled resolution time. Total elapsed time is tracked separately and shown in the ticket section.",
    },
    {
      label: "Testing Pass Rate",
      value: `${p(82)}%`,
      prev: `${p(76)}%`,
      tone: p(82) >= 80 ? "good" : "warn",
      higherIsBetter: true,
      delta: 6,
      tip: "Test cases passed on the first run, out of all mandatory test cases executed. Failed tests never overwrite earlier results.",
    },
    {
      label: "Reopened Issue Rate",
      value: `${Math.max(0, Math.round(7 / qf))}%`,
      prev: "9%",
      tone: "warn",
      higherIsBetter: false,
      delta: -2,
      tip: "Share of resolved work reopened by the requester or tester. Reopened records keep their original ID, so the same work is never recounted.",
    },
    {
      label: "Store Setups Completed on Time",
      value: `${p(90)}%`,
      prev: `${p(80)}%`,
      tone: "good",
      higherIsBetter: true,
      delta: 10,
      tip: "Store and POS setups where handover completed before the planned launch date, with all mandatory checklist items done.",
    },
    {
      label: "Release Success Rate",
      value: `${p(93)}%`,
      prev: `${p(88)}%`,
      tone: "good",
      higherIsBetter: true,
      delta: 5,
      tip: "Releases completed without rollback, emergency fix or production incident inside the monitoring window.",
    },
  ];

  const tickets: Row[] = [
    ["Tickets assigned", String(n(34)), "active", "All tickets assigned in the period, excluding duplicates and cancelled tickets."],
    ["Tickets accepted", String(n(33)), "good", "Tickets acknowledged and accepted by the developer."],
    ["Tickets resolved", String(n(29)), "good", "Tickets marked resolved with root cause, fix summary and testing evidence recorded."],
    [
      "Closed after requester confirmation",
      String(n(26)),
      "good",
      "Only tickets confirmed by the requester count as closed outcomes. Closing without confirmation is not rewarded.",
    ],
    ["Critical tickets within SLA", `${n(7)} of ${n(8)}`, "warn", "Critical tickets responded to and resolved inside the critical SLA window."],
    ["Average first-response time", `${scale(1.4, 1 / qf, 1)} hrs`, "good", "Developer-controlled first-response time on tickets."],
    [
      "Average resolution time",
      `${scale(1.8, 1 / qf, 1)} days developer time · ${scale(2.6, 1 / qf, 1)} days total elapsed`,
      "active",
      "Developer-controlled time and total elapsed time are tracked separately. Waiting-for-information time is excluded from developer time.",
    ],
    ["Tickets overdue", String(n(2)), "bad", "Tickets past their SLA or agreed date and still open."],
    ["Tickets reopened", String(n(2)), "warn", "Tickets reopened after resolution, retaining the original Ticket ID."],
    ["Waiting for information", String(n(3)), "warn", "Tickets paused pending requester information. This waiting time does not count against the developer."],
  ];

  const tasks: Row[] = [
    ["Tasks assigned", String(n(18)), "active", "Planned project tasks assigned by the CTO or Project Coordinator."],
    ["Tasks accepted", String(n(18)), "good", "Tasks acknowledged with an agreed target date."],
    ["Tasks completed", String(n(14)), "good", "Tasks completed with all acceptance criteria satisfied."],
    ["Tasks completed on time", `${n(13)} of ${n(14)}`, "good", "Completed on or before the agreed date, excluding approved deadline changes."],
    ["Tasks blocked", String(n(2)), "warn", "Tasks blocked with a recorded reason, responsible person and expected resolution date."],
    ["Tasks returned after review", String(n(1)), "warn", "Tasks sent back to In Progress by the requester or CTO after review."],
    ["Average task completion time", `${scale(4.2, 1 / qf, 1)} days`, "active", "Developer-controlled time from acceptance to completion."],
    ["Tasks awaiting approval", String(n(2)), "warn", "Completed tasks pending requester review or CTO approval. Approval waiting time is not penalised."],
  ];

  const setups: Row[] = [
    ["Store setups assigned", String(n(6)), "active", "Store and POS setup records assigned in the period."],
    ["Setups completed", String(n(5)), "good", "Setups that reached Handover Completed."],
    ["Setups completed before launch", `${n(4)} of ${n(5)}`, "good", "Handover finished before the planned store launch date."],
    ["Setups delayed", String(n(1)), "bad", "Setups that crossed the planned launch-ready date."],
    ["Tests passed", `${n(74)} of ${n(80)}`, "good", "Setup test-grid results across billing, tax, invoicing, permission and payment tests."],
    ["Launch-blocking issues", String(n(2)), "bad", "Critical failures that blocked a launch-readiness check."],
    ["User access completed on time", `${p(96)}%`, "good", "Store user accounts invited and permissions applied before training start. No plain-text passwords are stored."],
    ["Project Coordinator acceptance", `${n(5)} of ${n(5)}`, "good", "Handover summaries accepted by the Project Coordinator."],
  ];

  const bugs: Row[] = [
    ["Bugs assigned", String(n(16)), "active", "Bugs assigned in the period, excluding duplicates and cancelled bugs."],
    ["Critical bugs resolved", `${n(4)} of ${n(5)}`, "warn", "Critical-severity bugs resolved and confirmed."],
    ["Bugs fixed", String(n(12)), "good", "Bugs with a recorded fix that passed mandatory testing."],
    ["First-test pass rate", `${p(78)}%`, p(78) >= 80 ? "good" : "warn", "Fixes that passed testing on the first attempt."],
    ["Testing failures", String(n(4)), "warn", "Failed test runs. Each failure is preserved in history with tester comments and evidence."],
    ["Bugs reopened", String(n(2)), "warn", "Bugs reopened after closure, retaining the same Bug ID."],
    ["Average bug-resolution time", `${scale(2.4, 1 / qf, 1)} days`, "active", "Developer-controlled time from bug acceptance to passed testing."],
    ["Regression issues after release", String(n(1)), "bad", "Issues found in previously working areas after a release containing the fix."],
  ];

  const releases: Row[] = [
    ["Releases completed", String(n(4)), "good", "Releases that reached Completed status."],
    ["Completed as scheduled", `${n(3)} of ${n(4)}`, "good", "Released on the planned release date."],
    ["Release success rate", `${p(93)}%`, "good", "Releases with no rollback, emergency fix or production incident in the monitoring window."],
    ["Failed releases", String(n(0)), "good", "Releases stopped or reverted before completion."],
    ["Rollbacks", String(n(1)), "warn", "Releases rolled back using the recorded rollback procedure."],
    ["Emergency fixes", String(n(1)), "warn", "Unplanned fixes released outside the normal release cycle."],
    ["Post-release issues", String(n(2)), "warn", "Issues reported within the monitoring window after release."],
    ["Average monitoring completion time", `${scale(6.5, 1, 1)} hrs`, "active", "Time taken to complete the post-release monitoring checklist."],
  ];

  const docs: Row[] = [
    ["Documents created", String(n(7)), "good", "New knowledge-base or technical documents authored."],
    ["Documents updated", String(n(11)), "good", "Existing documents revised after a fix, setup or release."],
    ["Troubleshooting guides created", String(n(3)), "good", "Step-by-step guides written for support and store teams."],
    ["Release notes completed", `${n(4)} of ${n(4)}`, "good", "Releases with complete release notes published."],
    ["Documents awaiting review", String(n(2)), "warn", "Documents submitted but not yet reviewed."],
    ["Outdated documentation resolved", String(n(5)), "good", "Documents flagged outdated and brought up to date."],
  ];

  const quality: Row[] = [
    ["Requester confirmation rate", `${p(90)}%`, "good", "Resolved work confirmed by the requester or tester before closure."],
    ["Reopened issue rate", `${Math.round(7 / qf)}%`, "warn", "Share of resolved work reopened. Lower is better."],
    ["First-test pass rate", `${p(78)}%`, "warn", "Quality of fixes at the first test attempt."],
    ["Production issues after release", String(n(2)), "warn", "Live issues traced to work released in this period."],
    ["Repeat incidents", String(n(1)), "warn", "The same root cause recurring across periods — a signal to document the fix."],
    ["Work completed without required documentation", String(n(1)), "bad", "Completed work missing a mandatory document or release note."],
    ["High-risk work completed without approval", String(0), "good", "High-risk fixes require CTO approval before release. Target is zero."],
    ["Security-process compliance", `${p(100)}%`, "good", "No secrets recorded in work items, customer and payment data masked, security bugs restricted to authorised users."],
  ];

  const workload: Row[] = [
    ["New work", String(n(5)), "active", "Assigned but not yet started."],
    ["In progress", String(n(7)), "active", "Active developer work."],
    ["Waiting for information", String(n(3)), "warn", "Paused pending requester input; SLA clock paused."],
    ["Blocked", String(n(2)), "warn", "Blocked with a recorded reason and responsible person."],
    ["Ready for testing", String(n(4)), "warn", "Fix or task complete, awaiting tester."],
    ["Awaiting approval", String(n(2)), "warn", "Pending requester review or CTO approval."],
    ["Overdue", String(n(3)), "bad", "Past the agreed date and still open."],
    ["Critical workload", String(n(2)), "bad", "Open critical-severity items."],
  ];

  return { primary, tickets, tasks, setups, bugs, releases, docs, quality, workload };
}

type Row = [label: string, value: string, tone: Tone, tip: string];

const INSIGHTS = [
  {
    title: "Reduce unresolved critical tickets",
    body: "2 critical tickets are open beyond the SLA window. Clear these before starting new medium-priority work.",
    tone: "bad" as Tone,
  },
  {
    title: "Improve testing before release",
    body: "First-test pass rate is 78% and 4 test runs failed. Add regression tests to the fix checklist before sending work for testing.",
    tone: "warn" as Tone,
  },
  {
    title: "Complete store setups earlier",
    body: "1 setup crossed its launch-ready date. Start configuration at least 5 days before the planned store launch.",
    tone: "warn" as Tone,
  },
  {
    title: "Document repeated technical issues",
    body: "1 repeat incident and 1 completed item without documentation. Write a troubleshooting guide for the recurring root cause.",
    tone: "active" as Tone,
  },
  {
    title: "Follow up on work waiting for approval",
    body: "2 tasks and 1 high-risk fix are pending approval. Send a reminder so delivery dates are not affected.",
    tone: "active" as Tone,
  },
];

/* ------------------------------- components ------------------------------ */

function Tip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Metric explanation">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

function KpiCard({ m, compare }: { m: Metric; compare: boolean }) {
  const improving = m.higherIsBetter ? m.delta > 0 : m.delta < 0;
  const Arrow = m.delta === 0 ? Minus : improving ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={`rounded-lg border p-4 ${toneBorder[m.tone]}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="truncate">{m.label}</span>
        <Tip text={m.tip} />
      </div>
      <div className={`text-2xl font-bold tabular-nums mt-1 ${toneText[m.tone]}`}>{m.value}</div>
      {compare && (
        <div className={`mt-1 flex items-center gap-1 text-[11px] ${improving ? "text-emerald-600" : m.delta === 0 ? "text-muted-foreground" : "text-destructive"}`}>
          <Arrow className="h-3 w-3" />
          <span>
            {Math.abs(m.delta)}% vs previous · was {m.prev}
          </span>
        </div>
      )}
    </div>
  );
}

function MetricBlock({ title, rows, compare }: { title: string; rows: Row[]; compare: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {rows.map(([label, value, tone, tip]) => (
            <div key={label} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                <span className="truncate">{label}</span>
                <Tip text={tip} />
              </div>
              <div className={`text-right font-medium tabular-nums ${toneText[tone]}`}>
                {value}
                {compare && <div className="text-[10px] font-normal text-muted-foreground">previous period recorded</div>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------- page ----------------------------------- */

export function DevPerformancePage({ isCto = true }: { isCto?: boolean }) {
  const [period, setPeriod] = useState<Period>("This Month");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-08-04");
  const [compare, setCompare] = useState(true);
  const [dev, setDev] = useState<string>(DEVELOPERS[0]);

  const data = useMemo(() => buildData(period, dev), [period, dev]);

  const periodLabel =
    period === "Custom Date Range"
      ? `${from} to ${to}`
      : period === "This Month"
      ? "01 Aug 2026 – 04 Aug 2026 (This Month)"
      : period === "This Quarter"
      ? "01 Jul 2026 – 04 Aug 2026 (This Quarter)"
      : period === "This Week"
      ? "03 Aug 2026 – 04 Aug 2026 (This Week)"
      : "04 Aug 2026 (Today)";

  const onTime = Number(data.primary[1].value.replace("%", ""));
  const quality = Number(data.primary[4].value.replace("%", ""));
  const stability = Number(data.primary[7].value.replace("%", ""));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHead
            title="Developer Performance"
            sub="Response speed, delivery reliability, solution quality, testing discipline, store-setup completion and release stability — calculated from actual work records."
          />
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Report prepared", {
                description: `Developer performance report for ${periodLabel} is ready to download.`,
              })
            }
          >
            <Download className="h-4 w-4 mr-1" /> Export Report
          </Button>
        </div>

        {/* filters */}
        <Card>
          <CardContent className="p-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {period === "Custom Date Range" ? (
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            ) : (
              <div className="flex items-center rounded-md border px-3 text-xs text-muted-foreground">{periodLabel}</div>
            )}

            <Button variant={compare ? "default" : "outline"} onClick={() => setCompare((c) => !c)}>
              {compare ? "Comparing with previous period" : "Compare with previous period"}
            </Button>

            {isCto ? (
              <Select value={dev} onValueChange={setDev}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVELOPERS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> You can view only your own performance
              </div>
            )}
          </CardContent>
        </Card>

        {/* weighted emphasis banner */}
        <Card>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Quality (highest weight) <Tip text="Quality, security and stability carry more importance than the number of completed items." />
              </div>
              <Progress value={quality} className="mt-2" />
              <div className="text-xs mt-1 text-emerald-600">{quality}% testing pass rate</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Stability</div>
              <Progress value={stability} className="mt-2" />
              <div className="text-xs mt-1 text-emerald-600">{stability}% release success</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Delivery reliability</div>
              <Progress value={onTime} className="mt-2" />
              <div className="text-xs mt-1 text-blue-600">{onTime}% completed on time</div>
            </div>
          </CardContent>
        </Card>

        {/* primary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {data.primary.map((m) => (
            <KpiCard key={m.label} m={m} compare={compare} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <MetricBlock title="Ticket performance" rows={data.tickets} compare={false} />
          <MetricBlock title="Project task performance" rows={data.tasks} compare={false} />
          <MetricBlock title="Store & POS setup performance" rows={data.setups} compare={false} />
          <MetricBlock title="Bug and testing performance" rows={data.bugs} compare={false} />
          <MetricBlock title="Release performance" rows={data.releases} compare={false} />
          <MetricBlock title="Documentation performance" rows={data.docs} compare={false} />
          <MetricBlock title="Quality metrics" rows={data.quality} compare={false} />
          <MetricBlock title="Workload status" rows={data.workload} compare={false} />
        </div>

        {/* insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Performance insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {INSIGHTS.map((i) => (
              <div key={i.title} className={`rounded-md border p-3 ${toneBorder[i.tone]}`}>
                <div className={`text-sm font-medium ${toneText[i.tone]}`}>{i.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{i.body}</div>
              </div>
            ))}
            <div className="text-[11px] text-muted-foreground">
              Rules-based recommendations from actual work records. AI performance scoring is not enabled.
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* rules & permissions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Fair calculation rules
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1.5">
              {[
                "Every figure is calculated from actual tickets, tasks, setups, bugs, tests, releases and documentation.",
                "Performance figures cannot be edited manually.",
                "Time waiting for requester information or mandatory approval is excluded from developer-controlled time.",
                "Total elapsed time and developer-controlled time are tracked separately.",
                "Linked tickets, bugs and tasks for the same work count as one completed outcome.",
                "Tickets closed without requester confirmation are not rewarded.",
                "Test, cancelled and duplicate records are excluded.",
                "Performance history is preserved when work is reassigned.",
                "Quality, security and stability carry more weight than completed volume.",
                "Completed activity records cannot be deleted to change performance figures.",
              ].map((r) => (
                <div key={r} className="flex gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" /> Access and visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                ["Developer", "Own performance only"],
                ["CTO", "Individual and team performance"],
                ["HR Head", "Approved employee-performance summaries"],
                ["CEO", "Company-level technical-performance summaries"],
                ["Relationship Manager", "Outcomes for their own tickets only"],
                ["Project Coordinator", "Outcomes for their own projects and setups only"],
              ].map(([role, access]) => (
                <div key={role} className="flex items-center justify-between gap-2 rounded border px-2 py-1.5">
                  <span className="font-medium">{role}</span>
                  <span className="text-muted-foreground text-right">{access}</span>
                </div>
              ))}
              <Badge variant="outline" className="mt-1">
                Developers are not publicly ranked
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
