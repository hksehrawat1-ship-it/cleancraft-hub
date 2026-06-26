import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, TrendingDown, Users, Flame, ArrowDown } from "lucide-react";

const funnel = [
  { label: "Leads Received", value: 420 },
  { label: "Qualified", value: 265 },
  { label: "Proposal Sent", value: 180 },
  { label: "Meeting Done", value: 118 },
  { label: "EL Fee Received", value: 41 },
  { label: "Bookings", value: 28 },
];

const leakage = [
  { stage: "Qualification", count: 18, pct: "7%" },
  { stage: "Proposal", count: 52, pct: "29%" },
  { stage: "Meeting", count: 21, pct: "18%" },
  { stage: "EA Fee", count: 0, pct: "—" },
];

const team = [
  { name: "Rahul", leads: 45, bookings: 7, closure: "15.5%", status: "green" as const },
  { name: "Amit", leads: 42, bookings: 4, closure: "9.5%", status: "yellow" as const },
  { name: "Deepak", leads: 38, bookings: 2, closure: "5.2%", status: "red" as const },
];

const quality = [
  { label: "Hot", value: "42%", color: "bg-red-500" },
  { label: "Warm", value: "31%", color: "bg-orange-500" },
  { label: "Cold", value: "17%", color: "bg-sky-500" },
  { label: "Dangerous", value: "10%", color: "bg-rose-700" },
];

const statusDot = (s: "green" | "yellow" | "red") =>
  s === "green" ? "bg-emerald-500" : s === "yellow" ? "bg-yellow-400" : "bg-red-500";

export function SalesHeadCeoView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Sales Head Dashboard</h2>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Franchise Booked This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tabular-nums">28</div>
          <div className="text-xs text-muted-foreground mt-1">New franchise bookings (current week)</div>
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
            {funnel.map((f, i) => {
              const width = `${Math.max(20, (f.value / funnel[0].value) * 100)}%`;
              return (
                <div key={f.label}>
                  <div
                    className="mx-auto rounded-md bg-primary/15 border border-primary/30 px-3 py-2 flex items-center justify-between"
                    style={{ width }}
                  >
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-sm font-semibold tabular-nums">{f.value}</span>
                  </div>
                  {i < funnel.length - 1 && (
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
          <CardTitle className="text-base">Stage Leakage Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {leakage.map((l) => (
              <div key={l.stage} className="border rounded-md p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground">{l.stage}</div>
                <div className="text-2xl font-semibold tabular-nums mt-1">{l.count}</div>
                <div className="text-xs text-red-500 font-medium">{l.pct} leakage</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Sales Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-2 pr-4">Salesperson</th>
                  <th className="py-2 pr-4">Hot+Warm Leads</th>
                  <th className="py-2 pr-4">Bookings</th>
                  <th className="py-2 pr-4">Closure %</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((t) => (
                  <tr key={t.name} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{t.name}</td>
                    <td className="py-2 pr-4 tabular-nums">{t.leads}</td>
                    <td className="py-2 pr-4 tabular-nums">{t.bookings}</td>
                    <td className="py-2 pr-4 tabular-nums">{t.closure}</td>
                    <td className="py-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${statusDot(t.status)}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" /> Lead Quality Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quality.map((q) => (
              <div key={q.label} className="border rounded-md p-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${q.color}`} />
                  <span className="text-xs text-muted-foreground">{q.label}</span>
                </div>
                <div className="text-2xl font-semibold tabular-nums mt-1">{q.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
