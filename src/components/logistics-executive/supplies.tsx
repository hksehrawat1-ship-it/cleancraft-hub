import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHead, StatCard } from "./ui";
import { SUPPLIES, isLowStock, type SupplyItem } from "./data";
import { toast } from "sonner";

export function LeSupplies() {
  const [supplies, setSupplies] = useState(SUPPLIES);
  const [requested, setRequested] = useState<Record<string, string>>({});

  const lowStock = supplies.filter(isLowStock);
  const healthy = supplies.filter((s) => !isLowStock(s));

  function request(item: SupplyItem) {
    const qty = parseInt(requested[item.id] || "0", 10);
    if (!qty || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    toast.success(`Requested ${qty} ${item.unit} of ${item.name}`);
    setRequested((p) => ({ ...p, [item.id]: "" }));
  }

  return (
    <div className="space-y-4">
      <SectionHead title="Supplies & Inventory" sub="Track packing material stock and raise replenishment requests." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total SKUs" value={String(supplies.length)} />
        <StatCard label="Low Stock" value={String(lowStock.length)} tone={lowStock.length ? "warn" : "good"} />
        <StatCard label="Healthy Stock" value={String(healthy.length)} tone="good" />
        <StatCard label="Pending Requests" value="0" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Packing supplies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {supplies.map((s) => (
            <div key={s.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">
                  {s.name} <span className="text-xs text-muted-foreground">({s.unit})</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  In stock {s.inStock} · Min level {s.minLevel}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLowStock(s) && <Badge variant="destructive">Low</Badge>}
                <Input
                  type="number"
                  placeholder="Qty"
                  className="w-20"
                  value={requested[s.id] || ""}
                  onChange={(e) => setRequested((p) => ({ ...p, [s.id]: e.target.value }))}
                />
                <Button size="sm" variant="outline" onClick={() => request(s)}>
                  Request
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
