import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserCheck, Target, TrendingDown, ArrowDown, Gauge, ArrowLeft, Star, ShieldCheck } from "lucide-react";

type Person = {
  id: string;
  name: string;
  score: number;
  target: number;
  current: number;
  hotWarm: number;
  bookings: number;
  funnel: { label: string; value: number }[];
  leakage: { stage: string; lost: number }[];
  discipline: { crmUpdated: number; followUpsCompleted: number; overdueFollowUps: number; avgResponseMin: number; taskCompletion: number };
};

const PEOPLE: Person[] = [
  {
    id: "rahul", name: "Rahul Sharma", score: 91, target: 8, current: 6,
    hotWarm: 48, bookings: 7,
    funnel: [
      { label: "New Lead", value: 18 }, { label: "Qualified", value: 14 },
      { label: "Proposal", value: 11 }, { label: "Meeting", value: 8 },
      { label: "EL Fee", value: 5 }, { label: "Bookings", value: 4 },
    ],
    leakage: [
      { stage: "Qualification", lost: 2 }, { stage: "Proposal", lost: 5 },
      { stage: "Meeting", lost: 1 }, { stage: "EL Fee", lost: 0 },
    ],
    discipline: { crmUpdated: 100, followUpsCompleted: 96, overdueFollowUps: 2, avgResponseMin: 18, taskCompletion: 98 },
  },
  {
    id: "amit", name: "Amit Verma", score: 78, target: 8, current: 4,
    hotWarm: 42, bookings: 4,
    funnel: [
      { label: "New Lead", value: 16 }, { label: "Qualified", value: 12 },
      { label: "Proposal", value: 9 }, { label: "Meeting", value: 6 },
      { label: "EL Fee", value: 3 }, { label: "Bookings", value: 2 },
    ],
    leakage: [
      { stage: "Qualification", lost: 4 }, { stage: "Proposal", lost: 3 },
      { stage: "Meeting", lost: 3 }, { stage: "EL Fee", lost: 1 },
    ],
    discipline: { crmUpdated: 92, followUpsCompleted: 88, overdueFollowUps: 4, avgResponseMin: 32, taskCompletion: 90 },
  },
  {
    id: "deepak", name: "Deepak Singh", score: 62, target: 8, current: 2,
    hotWarm: 38, bookings: 2,
    funnel: [
      { label: "New Lead", value: 15 }, { label: "Qualified", value: 10 },
      { label: "Proposal", value: 7 }, { label: "Meeting", value: 4 },
      { label: "EL Fee", value: 2 }, { label: "Bookings", value: 1 },
    ],
    leakage: [
      { stage: "Qualification", lost: 5 }, { stage: "Proposal", lost: 3 },
      { stage: "Meeting", lost: 3 }, { stage: "EL Fee", lost: 1 },
    ],
    discipline: { crmUpdated: 78, followUpsCompleted: 72, overdueFollowUps: 8, avgResponseMin: 55, taskCompletion: 74 },
  },
  {
    id: "priya", name: "Priya Nair", score: 88, target: 8, current: 7,
    hotWarm: 51, bookings: 8,
    funnel: [
      { label: "New Lead", value: 20 }, { label: "Qualified", value: 16 },
      { label: "Proposal", value: 13 }, { label: "Meeting", value: 10 },
      { label: "EL Fee", value: 7 }, { label: "Bookings", value: 5 },
    ],
    leakage: [
      { stage: "Qualification", lost: 4 }, { stage: "Proposal", lost: 3 },
      { stage: "Meeting", lost: 3 }, { stage: "EL Fee", lost: 2 },
    ],
    discipline: { crmUpdated: 100, followUpsCompleted: 94, overdueFollowUps: 1, avgResponseMin: 14, taskCompletion: 97 },
  },
  {
    id: "kunal", name: "Kunal Mehta", score: 70, target: 8, current: 3,
    hotWarm: 35, bookings: 3,
    funnel: [
      { label: "New Lead", value: 14 }, { label: "Qualified", value: 11 },
      { label: "Proposal", value: 8 }, { label: "Meeting", value: 5 },
      { label: "EL Fee", value: 3 }, { label: "Bookings", value: 2 },
    ],
    leakage: [
      { stage: "Qualification", lost: 3 }, { stage: "Proposal", lost: 3 },
      { stage: "Meeting", lost: 3 }, { stage: "EL Fee", lost: 1 },
    ],
    discipline: { crmUpdated: 85, followUpsCompleted: 80, overdueFollowUps: 5, avgResponseMin: 40, taskCompletion: 82 },
  },
];

export function SalesExecCeoView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const person = PEOPLE.find((p) => p.id === selectedId) ?? null;

  if (!person) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Sales Executives</h2>
        </div>
        <p className="text-sm text-muted-foreground">Select a salesperson to view their dashboard.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PEOPLE.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="border rounded-lg p-4 bg-muted/20 hover:bg-muted/40 hover:border-primary transition text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="mt-2 text-sm font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">Score {p.score}/100</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const achievedPct = Math.round((person.current / person.target) * 100);
  const closureRate = ((person.bookings / person.hotWarm) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{person.name}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" /> Sales Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums">{person.score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <Progress value={person.score} className="mt-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Target Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Monthly Booking Target: <b className="text-foreground">{person.target}</b></span>
            <span className="text-muted-foreground">Current: <b className="text-foreground">{person.current}</b></span>
          </div>
          <Progress value={achievedPct} />
          <div className="text-xs text-muted-foreground mt-1">{achievedPct}% achieved</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">True Closure Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Hot + Warm</div>
              <div className="text-2xl font-semibold tabular-nums">{person.hotWarm}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Bookings</div>
              <div className="text-2xl font-semibold tabular-nums">{person.bookings}</div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Closure Rate</div>
              <div className="text-2xl font-semibold tabular-nums text-emerald-600">{closureRate}%</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Dangerous and Time Wasters excluded.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" /> Sales Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md mx-auto">
            {person.funnel.map((f, i) => {
              const width = `${Math.max(20, (f.value / person.funnel[0].value) * 100)}%`;
              return (
                <div key={f.label}>
                  <div
                    className="mx-auto rounded-md bg-primary/15 border border-primary/30 px-3 py-2 flex items-center justify-between"
                    style={{ width }}
                  >
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-sm font-semibold tabular-nums">{f.value}</span>
                  </div>
                  {i < person.funnel.length - 1 && (
                    <div className="flex justify-center text-muted-foreground">
                      <ArrowDown className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Stage Leakage</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-2">Stage</th>
                <th className="py-2 text-right">Lost</th>
              </tr>
            </thead>
            <tbody>
              {person.leakage.map((l) => (
                <tr key={l.stage} className="border-b last:border-0">
                  <td className="py-2.5">{l.stage}</td>
                  <td className="py-2.5 text-right tabular-nums font-medium">{l.lost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Work Discipline
            <span className="ml-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">One of the most important sections.</p>
        </CardHeader>
        <CardContent>
          {(() => {
            const d = person.discipline;
            const rows: { kpi: string; result: string; ok: boolean }[] = [
              { kpi: "CRM Updated", result: `${d.crmUpdated}%`, ok: d.crmUpdated >= 95 },
              { kpi: "Follow-ups Completed", result: `${d.followUpsCompleted}%`, ok: d.followUpsCompleted >= 90 },
              { kpi: "Overdue Follow-ups", result: `${d.overdueFollowUps}`, ok: d.overdueFollowUps <= 3 },
              { kpi: "Average Response Time", result: `${d.avgResponseMin} min`, ok: d.avgResponseMin <= 30 },
              { kpi: "Task Completion", result: `${d.taskCompletion}%`, ok: d.taskCompletion >= 95 },
            ];
            return (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                    <th className="py-2">KPI</th>
                    <th className="py-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.kpi} className="border-b last:border-0">
                      <td className="py-2.5">{r.kpi}</td>
                      <td className={`py-2.5 text-right tabular-nums font-medium ${r.ok ? "text-emerald-600" : "text-red-500"}`}>
                        {r.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
