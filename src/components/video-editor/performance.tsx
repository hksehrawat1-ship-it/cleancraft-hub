import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Award } from "lucide-react";
import { SectionHead } from "./ui";
import { PERFORMANCE } from "./data";

export function VePerformancePage() {
  return (
    <div className="space-y-4">
      <SectionHead title="Performance" sub="Delivery, turnaround and correction stats calculated from your video records." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PERFORMANCE.kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div
                className={`text-3xl font-bold tabular-nums mt-1 ${
                  k.tone === "good" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {k.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</div>
              <Progress value={k.pct} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Delivered vs on-time by week</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PERFORMANCE.weeks}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="delivered" name="Delivered" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="onTime" name="On time" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Where delays came from
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PERFORMANCE.delays.map((d) => (
              <div key={d.reason} className="border rounded-md p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm">{d.reason}</div>
                  <div className="text-xs text-muted-foreground">Owner: {d.owner}</div>
                </div>
                <Badge variant="outline" className="tabular-nums">{d.count}</Badge>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">
              Delays caused by late footage or pending approvals are tracked separately from your own misses.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Month summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              "34 videos delivered — 22 reels, 6 ad cuts, 4 testimonials, 2 long-form",
              "91% delivered on or before the due date",
              "Average turnaround improved from 2.1 days to 1.6 days",
              "First-cut approval at 76% — biggest miss is offer text mismatch",
              "3 deliveries slipped because footage arrived late",
            ].map((t) => (
              <div key={t} className="border rounded-md px-3 py-2">{t}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
