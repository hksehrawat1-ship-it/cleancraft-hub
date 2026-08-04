import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ArrowRight, Plus, Send } from "lucide-react";
import { SectionHead } from "./ui";
import {
  CONTENT_QUEUE,
  TEAM,
  type ContentFormat,
  type ContentItem,
  type Platform,
  type QueueStage,
} from "./data";

const STAGES: QueueStage[] = ["Idea", "Script", "Design", "Editing", "Ready", "Scheduled", "Published"];

const stageTone: Record<QueueStage, string> = {
  Idea: "bg-muted text-muted-foreground",
  Script: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  Design: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  Editing: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Ready: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Scheduled: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Published: "bg-emerald-600/15 text-emerald-700 border-emerald-600/30",
};

export function SmmContentQueuePage() {
  const [items, setItems] = useState<ContentItem[]>(CONTENT_QUEUE);
  const [filter, setFilter] = useState<"all" | QueueStage>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<ContentFormat>("Reel");
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [owner, setOwner] = useState(TEAM[0]);
  const [due, setDue] = useState("");

  const shown = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.stage === filter)),
    [items, filter],
  );

  const counts = useMemo(
    () =>
      STAGES.map((s) => ({ stage: s, n: items.filter((i) => i.stage === s).length })),
    [items],
  );

  const advance = (id: string) => {
    setItems((list) =>
      list.map((i) => {
        if (i.id !== id) return i;
        const next = STAGES[Math.min(STAGES.indexOf(i.stage) + 1, STAGES.length - 1)];
        toast.success(`${i.title} moved to ${next}`);
        return { ...i, stage: next };
      }),
    );
  };

  const add = () => {
    if (!title.trim()) {
      toast.error("Add a content title");
      return;
    }
    setItems((l) => [
      {
        id: `C-${Date.now()}`,
        title,
        format,
        platform,
        stage: "Idea",
        owner,
        due: due || "This week",
        hook: "",
        caption: "",
        hashtags: "",
      },
      ...l,
    ]);
    setTitle("");
    setDue("");
    toast.success("Added to content queue");
  };

  return (
    <div className="space-y-4">
      <SectionHead title="Content Queue" sub="Every piece of content from idea to published, with its current owner." />

      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-md border p-3 text-left ${filter === "all" ? "border-primary bg-primary/5" : ""}`}
        >
          <div className="text-[11px] text-muted-foreground">All</div>
          <div className="text-xl font-bold tabular-nums">{items.length}</div>
        </button>
        {counts.slice(0, 6).map((c) => (
          <button
            key={c.stage}
            onClick={() => setFilter(c.stage)}
            className={`rounded-md border p-3 text-left ${filter === c.stage ? "border-primary bg-primary/5" : ""}`}
          >
            <div className="text-[11px] text-muted-foreground truncate">{c.stage}</div>
            <div className="text-xl font-bold tabular-nums">{c.n}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add content idea
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2">
          <Input placeholder="Content title / topic" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={format} onValueChange={(v) => setFormat(v as ContentFormat)}>
            <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Reel", "Carousel", "Post", "Story", "YouTube"].map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Instagram", "YouTube", "Facebook", "Google Business"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TEAM.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Due" value={due} onChange={(e) => setDue(e.target.value)} className="md:w-32" />
          <Button onClick={add}>Add</Button>
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {shown.map((i) => (
          <Card key={i.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{i.title}</span>
                    <Badge variant="outline" className={stageTone[i.stage]}>{i.stage}</Badge>
                    <Badge variant="outline">{i.format}</Badge>
                    <Badge variant="outline">{i.platform}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {i.owner} · Due {i.due} · {i.id}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenId(openId === i.id ? null : i.id)}>
                    {openId === i.id ? "Hide" : "Details"}
                  </Button>
                  {i.stage !== "Published" && (
                    <Button size="sm" onClick={() => advance(i.id)}>
                      Move next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              {openId === i.id && (
                <div className="mt-3 border-t pt-3 grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] uppercase text-muted-foreground">Hook</div>
                    <div className="text-sm">{i.hook || "—"}</div>
                    <div className="text-[11px] uppercase text-muted-foreground mt-2">Hashtags</div>
                    <div className="text-sm">{i.hashtags || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-muted-foreground">Caption</div>
                    <Textarea defaultValue={i.caption} rows={4} className="mt-1" />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => toast.success("Sent for review & approval")}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Send for approval
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {shown.length === 0 && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">Nothing in this stage.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
