import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FolderOpen, ListChecks } from "lucide-react";
import { SectionHead } from "./ui";
import { RESOURCES } from "./data";

type Task = { id: string; title: string; from: string; due: string; done: boolean };

const INITIAL: Task[] = [
  { id: "T-1", title: "Shoot 3 store reels in Jaipur", from: "CEO", due: "Today", done: false },
  { id: "T-2", title: "Fix pricing claim in myth-buster carousel", from: "Sales Head", due: "Today", done: false },
  { id: "T-3", title: "Collect 5 customer testimonials", from: "RM Team", due: "Fri", done: false },
  { id: "T-4", title: "Publish Indore launch teaser", from: "Self", due: "Yesterday", done: true },
];

export function SmmTasksResourcesPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [draft, setDraft] = useState("");

  const pending = tasks.filter((t) => !t.done).length;

  return (
    <div className="space-y-4">
      <SectionHead title="Tasks & Resources" sub="Work assigned to you plus the brand assets you need to create content." />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Assigned", v: tasks.length },
          { l: "Pending", v: pending },
          { l: "Completed", v: tasks.length - pending },
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
            <ListChecks className="w-4 h-4 text-primary" /> My tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="border rounded-md px-3 py-2 flex items-center gap-3">
              <Checkbox
                checked={t.done}
                onCheckedChange={(v) => {
                  setTasks((l) => l.map((x) => (x.id === t.id ? { ...x, done: !!v } : x)));
                  if (v) toast.success("Task completed");
                }}
              />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                <div className="text-xs text-muted-foreground">From {t.from} · Due {t.due}</div>
              </div>
              {!t.done && t.due === "Yesterday" && (
                <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">Overdue</Badge>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Input placeholder="Add your own task" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <Button
              onClick={() => {
                if (!draft.trim()) return;
                setTasks((l) => [...l, { id: `T-${Date.now()}`, title: draft, from: "Self", due: "Today", done: false }]);
                setDraft("");
                toast.success("Task added");
              }}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" /> Resource library
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2">
          {RESOURCES.map((r) => (
            <div key={r.name} className="border rounded-md px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-sm">{r.name}</span>
              <Badge variant="outline">{r.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
