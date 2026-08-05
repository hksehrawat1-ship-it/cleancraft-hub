import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHead, StatCard } from "./ui";
import { DISPATCHES, SUPPLIES, isLowStock, statusLabel } from "./data";

export function LeDashboard() {
  const dispatchedToday = DISPATCHES.filter((d) => d.status === "dispatched" || d.status === "in_transit").length;
  const inTransit = DISPATCHES.filter((d) => d.status === "in_transit").length;
  const deliveredToday = DISPATCHES.filter((d) => d.status === "delivered").length;
  const delayed = DISPATCHES.filter((d) => d.status === "delayed").length;
  const pendingClearance = DISPATCHES.filter((d) => d.status === "pending_clearance").length;
  const lowStock = SUPPLIES.filter(isLowStock);

  const attention = [
    ...DISPATCHES.filter((d) => d.status === "delayed" || d.status === "pending_clearance"),
    ...lowStock.map((s) => ({
      id: `STOCK-${s.id}`,
      store: "Warehouse",
      city: "",
      items: `${s.name} running low`,
      quantity: s.inStock,
      raisedBy: "System",
      status: "pending_clearance" as const,
      plannedDate: "Today",
      expectedDate: "Today",
      clearance: false,
    })),
  ];

  return (
    <div className="space-y-4">
      <SectionHead title="Logistics Executive Dashboard" sub="Track dispatches, packing staff, deliveries and supply levels." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Dispatched Today" value={String(dispatchedToday)} />
        <StatCard label="In Transit" value={String(inTransit)} />
        <StatCard label="Delivered Today" value={String(deliveredToday)} tone="good" />
        <StatCard label="Delayed" value={String(delayed)} tone="bad" />
        <StatCard label="Pending Clearance" value={String(pendingClearance)} tone="warn" />
        <StatCard label="Low Stock Items" value={String(lowStock.length)} tone={lowStock.length ? "warn" : "good"} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Attention required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {attention.length === 0 ? (
            <p className="text-muted-foreground">No urgent items.</p>
          ) : (
            attention.map((a) => (
              <div key={a.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">
                    {a.id} · {a.store} {a.city ? `— ${a.city}` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">{a.items}</div>
                </div>
                <Badge variant={a.status === "delayed" ? "destructive" : a.status === "pending_clearance" ? "secondary" : "outline"}>
                  {statusLabel[a.status]}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
