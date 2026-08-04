import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { SectionHead } from "./ui";
import { CALENDAR } from "./data";

export function SmmCalendarPage() {
  const scheduled = CALENDAR.flatMap((d) => d.items).filter((i) => i.status === "Scheduled").length;
  const published = CALENDAR.flatMap((d) => d.items).filter((i) => i.status === "Published").length;
  const open = CALENDAR.flatMap((d) => d.items).filter((i) => i.status === "Empty").length;

  return (
    <div className="space-y-4">
      <SectionHead title="Publishing Calendar" sub="This week's publishing plan across every platform." />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Published", v: published, t: "text-emerald-600" },
          { l: "Scheduled", v: scheduled, t: "text-blue-600" },
          { l: "Open Slots", v: open, t: "text-amber-600" },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={`text-3xl font-bold tabular-nums mt-1 ${s.t}`}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Week of 3 Aug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-2">
            {CALENDAR.map((d) => (
              <div key={d.day} className="border rounded-md p-2 min-h-32">
                <div className="text-xs font-semibold">{d.day}</div>
                <div className="text-[11px] text-muted-foreground mb-2">{d.date}</div>
                <div className="space-y-2">
                  {d.items.map((i) => (
                    <div
                      key={i.title + i.time}
                      className={`rounded-md border p-2 text-[11px] ${
                        i.status === "Published"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : i.status === "Scheduled"
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-muted/40 border-dashed"
                      }`}
                    >
                      <div className="font-medium leading-tight">{i.title}</div>
                      <div className="text-muted-foreground mt-1">
                        {i.time} · {i.format}
                      </div>
                      <Badge variant="outline" className="mt-1 text-[10px]">{i.platform}</Badge>
                      {i.status === "Empty" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 h-7 text-[11px]"
                          onClick={() => toast.success("Slot opened for scheduling")}
                        >
                          Fill slot
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
