import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, Search, Film } from "lucide-react";
import { SectionHead } from "./ui";
import { VIDEO_JOBS, type VideoJob, type VideoStage } from "./data";

const FLOW: VideoStage[] = [
  "Assigned",
  "Footage Received",
  "Rough Cut",
  "Editing",
  "Ready to Submit",
  "In Review",
  "Corrections",
  "Approved",
  "Published",
];

export const stageTone = (s: VideoStage) =>
  s === "Approved" || s === "Published"
    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
    : s === "Corrections"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : s === "In Review"
    ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
    : s === "Ready to Submit"
    ? "bg-violet-500/15 text-violet-600 border-violet-500/30"
    : s === "Editing" || s === "Rough Cut"
    ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
    : "bg-muted text-muted-foreground";

export function VeMyVideosPage() {
  const [jobs, setJobs] = useState<VideoJob[]>(VIDEO_JOBS);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(t) ||
        j.format.toLowerCase().includes(t) ||
        j.requestedBy.toLowerCase().includes(t),
    );
  }, [jobs, q]);

  const advance = (id: string) =>
    setJobs((l) =>
      l.map((j) => {
        if (j.id !== id) return j;
        const next = FLOW[Math.min(FLOW.indexOf(j.stage) + 1, FLOW.length - 1)];
        toast.success(`${j.id} moved to ${next}`);
        return { ...j, stage: next };
      }),
    );

  return (
    <div className="space-y-4">
      <SectionHead title="My Videos" sub="Every video assigned to you, with its brief, footage status and current stage." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Assigned", v: jobs.length },
          { l: "In Editing", v: jobs.filter((j) => ["Rough Cut", "Editing"].includes(j.stage)).length },
          { l: "Awaiting Footage", v: jobs.filter((j) => j.footage !== "Received").length },
          { l: "Overdue", v: jobs.filter((j) => j.overdue).length },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="text-3xl font-bold tabular-nums mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" /> Video list
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, format or requester"
              className="pl-9"
            />
          </div>

          {shown.map((j) => (
            <div key={j.id} className="border rounded-md p-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{j.title}</span>
                    <Badge variant="outline" className={stageTone(j.stage)}>{j.stage}</Badge>
                    <Badge variant="outline">{j.format}</Badge>
                    {j.overdue && (
                      <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {j.id} · {j.requestedBy} · Due {j.due} · {j.duration} · Footage: {j.footage}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenId(openId === j.id ? null : j.id)}>
                    {openId === j.id ? "Hide brief" : "Brief"}
                  </Button>
                  {j.stage !== "Published" && (
                    <Button size="sm" onClick={() => advance(j.id)}>
                      Move next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
              {openId === j.id && (
                <p className="text-sm text-muted-foreground border-t mt-3 pt-3">{j.brief}</p>
              )}
            </div>
          ))}
          {shown.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">No videos match that search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
