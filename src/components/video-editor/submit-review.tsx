import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { SectionHead } from "./ui";
import { SUBMISSIONS, VIDEO_JOBS, type Submission } from "./data";

const CHECKS = [
  "Correct aspect ratio and resolution",
  "Subtitles burned in and spell-checked",
  "Only licensed music used",
  "Offer / pricing text matches approved creative",
  "Logo and end card added",
  "File named as VideoID_Title_vN",
];

const statusTone = (s: Submission["status"]) =>
  s === "Approved"
    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
    : s === "Corrections"
    ? "bg-orange-500/15 text-orange-600 border-orange-500/30"
    : s === "Rejected"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : "bg-blue-500/15 text-blue-600 border-blue-500/30";

export function VeSubmitPage() {
  const [subs, setSubs] = useState<Submission[]>(SUBMISSIONS);
  const [videoId, setVideoId] = useState(VIDEO_JOBS[2].id);
  const [version, setVersion] = useState("v1");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState<string[]>([]);

  const toggle = (c: string) =>
    setChecked((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]));

  const allChecked = checked.length === CHECKS.length;

  const submit = () => {
    if (!link.trim()) {
      toast.error("Paste the export link first");
      return;
    }
    if (!allChecked) {
      toast.error("Complete the quality checklist before submitting");
      return;
    }
    const job = VIDEO_JOBS.find((j) => j.id === videoId)!;
    setSubs((l) => [
      {
        id: `S-${Date.now()}`,
        videoId,
        title: job.title,
        version,
        submittedTo: job.requestedBy,
        submittedOn: "Just now",
        status: "In Review",
        link,
        note: note || "—",
      },
      ...l,
    ]);
    setLink("");
    setNote("");
    setChecked([]);
    toast.success(`Submitted ${job.id} ${version} for review`);
  };

  return (
    <div className="space-y-4">
      <SectionHead title="Submit for Review" sub="Send a finished cut for approval — the quality checklist must be cleared first." />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" /> New submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-2">
            <Select value={videoId} onValueChange={setVideoId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VIDEO_JOBS.map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.id} · {j.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["v1", "v2", "v3", "v4"].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Export / drive link" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <Textarea
            rows={3}
            placeholder="What changed in this version?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Quality checklist ({checked.length}/{CHECKS.length})
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {CHECKS.map((c) => {
                const on = checked.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggle(c)}
                    className={`text-left text-sm border rounded-md px-3 py-2 flex items-center gap-2 transition-colors ${
                      on ? "border-emerald-500/40 bg-emerald-500/10" : "hover:bg-muted"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${on ? "text-emerald-600" : "text-muted-foreground/50"}`} />
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={submit} disabled={!allChecked || !link.trim()}>
            Submit for review
          </Button>
          {!allChecked && (
            <p className="text-[11px] text-muted-foreground">
              Submission unlocks once all {CHECKS.length} checks are ticked.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Submission history</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {subs.map((s) => (
            <div key={s.id} className="border rounded-md p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{s.title}</span>
                    <Badge variant="outline">{s.version}</Badge>
                    <Badge variant="outline" className={statusTone(s.status)}>{s.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.videoId} · To {s.submittedTo} · {s.submittedOn}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.link}</div>
                </div>
              </div>
              <p className="text-xs mt-2">{s.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
