import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHead, StatCard } from "./ui";
import { DISPATCHES, type DispatchStatus, statusLabel } from "./data";
import { toast } from "sonner";

export function LeDeliveryConfirmation() {
  const [dispatches, setDispatches] = useState(DISPATCHES);
  const [recipient, setRecipient] = useState<Record<string, string>>({});
  const [note, setNote] = useState<Record<string, string>>({});

  const awaiting = dispatches.filter((d) => d.status === "in_transit" || d.status === "delayed");
  const confirmedToday = dispatches.filter((d) => d.status === "delivered" && d.actualDate === "6 Aug").length;

  function confirm(id: string) {
    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        toast.success(`${d.id} delivery confirmed`);
        return {
          ...d,
          status: "delivered" as DispatchStatus,
          actualDate: "6 Aug",
          recipient: recipient[id] || "Store Manager",
          deliveryNote: note[id] || "",
        };
      }),
    );
  }

  return (
    <div className="space-y-4">
      <SectionHead title="Delivery Confirmation" sub="Capture POD, recipient details and delivery notes." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Awaiting POD" value={String(awaiting.length)} />
        <StatCard label="Confirmed Today" value={String(confirmedToday)} tone="good" />
        <StatCard label="Pending Review" value="0" tone="good" />
        <StatCard label="Disputed" value="0" tone="good" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Awaiting confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {awaiting.map((d) => (
            <div key={d.id} className="border rounded-md p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">
                    {d.id} · {d.store} — {d.items}
                  </div>
                  <div className="text-xs text-muted-foreground">Expected {d.expectedDate}</div>
                </div>
                <Badge variant={d.status === "delayed" ? "destructive" : "secondary"}>{statusLabel[d.status]}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Recipient Name</Label>
                  <Input
                    placeholder="Store manager name"
                    value={recipient[d.id] || ""}
                    onChange={(e) => setRecipient((p) => ({ ...p, [d.id]: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Delivery Note</Label>
                  <Input
                    placeholder="Condition, remarks"
                    value={note[d.id] || ""}
                    onChange={(e) => setNote((p) => ({ ...p, [d.id]: e.target.value }))}
                  />
                </div>
              </div>
              <Button size="sm" onClick={() => confirm(d.id)}>
                Confirm Delivery
              </Button>
            </div>
          ))}
          {awaiting.length === 0 && <p className="text-sm text-muted-foreground">No shipments awaiting confirmation.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
