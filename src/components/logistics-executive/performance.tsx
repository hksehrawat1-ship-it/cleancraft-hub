import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHead, StatCard } from "./ui";
import { DISPATCHES, PACKING_STAFF } from "./data";

export function LePerformance() {
  const delivered = DISPATCHES.filter((d) => d.status === "delivered").length;
  const delayed = DISPATCHES.filter((d) => d.status === "delayed").length;
  const totalClosed = delivered + delayed;
  const onTimeRate = totalClosed ? Math.round((delivered / totalClosed) * 100) : 100;

  const totalCompleted = PACKING_STAFF.reduce((sum, s) => sum + s.completedToday, 0);
  const totalDefects = PACKING_STAFF.reduce((sum, s) => sum + s.defectsToday, 0);
  const packingAccuracy = totalCompleted ? Math.round(((totalCompleted - totalDefects) / totalCompleted) * 100) : 100;

  const kpis = [
    { label: "On-Time Delivery", value: onTimeRate },
    { label: "Packing Accuracy", value: packingAccuracy },
    { label: "Dispatch Clearance Speed", value: 82 },
    { label: "Delivery Confirmation Rate", value: 96 },
  ];

  return (
    <div className="space-y-4">
      <SectionHead title="Performance" sub="System-calculated logistics metrics and workload status." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Dispatches Handled" value={String(DISPATCHES.length)} />
        <StatCard label="On-Time Delivery" value={`${onTimeRate}%`} tone={onTimeRate >= 90 ? "good" : "warn"} />
        <StatCard label="Avg Delivery Time" value="2.1 days" />
        <StatCard label="Packing Accuracy" value={`${packingAccuracy}%`} tone={packingAccuracy >= 95 ? "good" : "warn"} />
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Workload status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between border rounded-md p-3">
            <span>Packing staff utilization</span>
            <span className="font-medium">{Math.round((PACKING_STAFF.filter((s) => s.status === "busy").length / PACKING_STAFF.length) * 100)}%</span>
          </div>
          <div className="flex items-center justify-between border rounded-md p-3">
            <span>Shipments awaiting clearance</span>
            <span className="font-medium">{DISPATCHES.filter((d) => d.status === "pending_clearance").length}</span>
          </div>
          <div className="flex items-center justify-between border rounded-md p-3">
            <span>Delayed shipments</span>
            <span className="font-medium text-destructive">{delayed}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
