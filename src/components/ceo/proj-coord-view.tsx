import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Store, ArrowDown, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const pipeline = [
  { label: "Bookings Received", value: 18 },
  { label: "Project Created", value: 18 },
  { label: "Site Approved", value: 16 },
  { label: "Design Approved", value: 15 },
  { label: "Civil Work", value: 14 },
  { label: "Machine Installed", value: 11 },
  { label: "Training Completed", value: 9 },
  { label: "Store Opened", value: 8 },
];

const tracker = [
  { label: "Target Openings", value: 20, icon: Store, tone: "text-primary" },
  { label: "Completed", value: 14, icon: CheckCircle2, tone: "text-emerald-500" },
  { label: "Upcoming (Next 7 Days)", value: 4, icon: Clock, tone: "text-sky-500" },
  { label: "Delayed", value: 2, icon: AlertTriangle, tone: "text-red-500" },
];

export function ProjectCoordinatorCeoView() {
  const max = Math.max(...pipeline.map((p) => p.value));
  const completionPct = Math.round((14 / 20) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Project Coordinator Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            End-to-end store setup pipeline and opening tracker.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Project Pipeline</CardTitle>
          <p className="text-xs text-muted-foreground">
            Progression from booking to store opening.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {pipeline.map((s, idx) => {
            const width = `${(s.value / max) * 100}%`;
            return (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="tabular-nums font-semibold">{s.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mt-1">
                  <div className="h-full bg-primary rounded-full" style={{ width }} />
                </div>
                {idx < pipeline.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            Store Opening Tracker
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {completionPct}% of monthly target completed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tracker.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="border rounded-md p-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${t.tone}`} />
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t.label}
                    </div>
                  </div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">{t.value}</div>
                </div>
              );
            })}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Completed vs Target</span>
              <span className="tabular-nums">14 / 20</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
