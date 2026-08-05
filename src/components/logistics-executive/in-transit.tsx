import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHead, StatCard } from "./ui";
import { DISPATCHES, type DispatchStatus, statusLabel } from "./data";
import { toast } from "sonner";

export function LeInTransit() {
  const [dispatches, setDispatches] = useState(DISPATCHES);
  const [filter, setFilter] = useState<"all" | "delayed" | "arriving_today" | "in_transit">("all");

  const inTransit = dispatches.filter((d) => d.status === "in_transit" || d.status === "delayed");
  const arrivingToday = inTransit.filter((d) => d.expectedDate === "6 Aug" || d.expectedDate === "Today");
  const delayed = inTransit.filter((d) => d.status === "delayed");

  const filtered =
    filter === "all"
      ? inTransit
      : filter === "delayed"
      ? delayed
      : filter === "arriving_today"
      ? arrivingToday
      : inTransit.filter((d) => d.status === "in_transit");

  function markDelivered(id: string) {
    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        toast.success(`${d.id} marked delivered`);
        return { ...d, status: "delivered" as DispatchStatus, actualDate: "6 Aug" };
      }),
    );
  }

  return (
    <div className="space-y-4">
      <SectionHead title="In-Transit Shipments" sub="Track live shipments and catch delays before they escalate." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="In Transit" value={String(inTransit.length)} />
        <StatCard label="Arriving Today" value={String(arrivingToday.length)} />
        <StatCard label="Delayed" value={String(delayed.length)} tone="bad" />
        <StatCard label="Avg Transit" value="2.1 days" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "in_transit", label: "In Transit" },
          { key: "arriving_today", label: "Arriving Today" },
          { key: "delayed", label: "Delayed" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shipments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">{d.id} · {d.store} — {d.items}</div>
                <div className="text-xs text-muted-foreground">Expected {d.expectedDate} · Packed by {d.packedBy ?? "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={d.status === "delayed" ? "destructive" : "secondary"}>{statusLabel[d.status]}</Badge>
                <Button size="sm" variant="outline" onClick={() => markDelivered(d.id)} disabled={d.status === "delivered"}>
                  Mark Delivered
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
