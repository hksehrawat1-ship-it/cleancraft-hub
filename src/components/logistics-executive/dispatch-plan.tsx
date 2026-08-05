import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHead, StatCard } from "./ui";
import { DISPATCHES, type DispatchStatus, statusLabel } from "./data";
import { toast } from "sonner";

const STATUS_FLOW: Record<DispatchStatus, DispatchStatus> = {
  planned: "ready_to_pack",
  pending_clearance: "ready_to_pack",
  ready_to_pack: "packing",
  packing: "packed",
  packed: "dispatched",
  dispatched: "in_transit",
  in_transit: "delivered",
  delivered: "delivered",
  delayed: "in_transit",
  returned: "ready_to_pack",
};

export function LeDispatchPlan() {
  const [dispatches, setDispatches] = useState(DISPATCHES);
  const [filter, setFilter] = useState<"all" | DispatchStatus>("all");

  const filtered = filter === "all" ? dispatches : dispatches.filter((d) => d.status === filter);
  const ready = dispatches.filter((d) => d.status === "ready_to_pack" || d.status === "packing").length;
  const packed = dispatches.filter((d) => d.status === "packed").length;
  const pending = dispatches.filter((d) => d.status === "pending_clearance").length;

  function advance(id: string) {
    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next = STATUS_FLOW[d.status];
        if (next === d.status) return d;
        toast.success(`${d.id} moved to ${statusLabel[next]}`);
        return { ...d, status: next };
      }),
    );
  }

  return (
    <div className="space-y-4">
      <SectionHead title="Dispatch Plan" sub="Plan, pack and hand over dispatches to the transporter." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Ready to Pack" value={String(ready)} />
        <StatCard label="Packed" value={String(packed)} />
        <StatCard label="Pending Clearance" value={String(pending)} tone="warn" />
        <StatCard label="Total Planned" value={String(dispatches.length)} />
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Planned dispatches</CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.entries(statusLabel).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">
                  {d.id} · {d.store} — {d.items}
                </div>
                <div className="text-xs text-muted-foreground">
                  Qty {d.quantity} · Raised by {d.raisedBy} · Planned {d.plannedDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={d.clearance ? "default" : "secondary