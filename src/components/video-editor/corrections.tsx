import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { SectionHead } from "./ui";
import { CORRECTIONS, type Correction } from "./data";

export function VeCorrectionsPage() {
  const [items, setItems] = useState<Correction[]>(CORRECTIONS);
  const [donePoints, setDonePoints] = useState<Record<string, string[]>>({});

  const togglePoint = (id: string, point: string) =>
    setDonePoints((m) => {
      const cur = m[id] ?? [];
      return { ...m, [id]: cur.includes(point) ? cur.filter((p) => p !== point) : [...cur, point] };
    });

  const resubmit = (c: Correction) => {
    const done = donePoints[c.id] ?? [];
    if (done.length < c.points.length) {
      toast.error("Fix and tick every correction point first");
      return;
    }
    setItems((l) => l.map((x) => (x.id === c.id ? { ...x, done: true } : x)));
    toast.success(`${c.videoId} re-submitted for review`);
  };

  const open = items.filter((i) => !i.done);

  return (
    <div className="space-y-4">
      <SectionHead title="Corrections" sub="Change requests raised on your cuts — fix each point, then re-submit." />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Open Corrections", v: open.length, t: "text-destructive" },
          { l: "High Priority", v: open.filter((i) => i.priority === "High").length, t: "text-amber-600" },
          { l: "Resolved", v: items.length - open.length, t: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={`text-3xl font-bold tabular-nums mt-1 ${s.t}`}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.map((c) => {
        const done = donePoints[c.id] ?? [];
        return (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${c.priority === "High" ? "text-destructive" : "text-amber-500"}`} />
                  {c.title}
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant="outline">{c.version}</Badge>
                  {c.done ? (
                    <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                      Resolved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
                      {c.priority} priority
                    </Badge>
                  )}
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {c.videoId} · Raised by {c.raisedBy} · {c.raisedOn}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {c.points.map((p) => (
                <div key={p} className="flex items-start gap-2 border rounded-md px-3 py-2">
                  <Checkbox
                    checked={c.done || done.includes(p)}
                    disabled={c.done}
                    onCheckedChange={() => togglePoint(c.id, p)}
                    className="mt-0.5"
                  />
                  <span className={`text-sm ${c.done || done.includes(p) ? "line-through text-muted-foreground" : ""}`}>
                    {p}
                  </span>
                </div>
              ))}
              {!c.done && (
                <div className="flex items-center gap-3 pt-1">
                  <Button size="sm" onClick={() => resubmit(c)}>Re-submit for review</Button>
                  <span className="text-[11px] text-muted-foreground">
                    {done.length}/{c.points.length} points fixed
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
