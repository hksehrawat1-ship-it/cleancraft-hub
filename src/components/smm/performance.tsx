import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Award } from "lucide-react";
import { SectionHead } from "./ui";
import { PERFORMANCE } from "./data";

export function SmmPerformancePage() {
  return (
    <div className="space-y-4">
      <SectionHead title="Performance" sub="How your content engine performed this month — calculated from your own workflow records." />

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
              <div className="text-[11px] text-muted-foreground mt-0.5">{k.target}</div>
              <Progress value={k.pct} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Where content got delayed
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
              Delays owned by other teams are shown separately so your score reflects only what you control.
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
              "27 of 29 planned posts published — 92% calendar completion",
              "67 leads generated from social, 22% above target",
              "Engagement rate improved from 4.9% to 5.6%",
              "2 items still stuck with the Video Editor",
              "Follower growth: +3.1K across all platforms",
            ].map((t) => (
              <div key={t} className="border rounded-md px-3 py-2">{t}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
