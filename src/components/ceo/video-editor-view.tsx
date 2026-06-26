import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Video,
  TrendingUp,
  ListChecks,
  Briefcase,
  Timer,
  Clock,
  RefreshCw,
  AlertTriangle,
  History,
  ClipboardList,
  GripVertical,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";

const PRODUCTIVITY = [
  { week: "Week 1", videos: 18 },
  { week: "Week 2", videos: 21 },
  { week: "Week 3", videos: 17 },
  { week: "Week 4", videos: 23 },
];

const STATUS = [
  { label: "Editing", value: 5 },
  { label: "Waiting for Approval", value: 2 },
  { label: "Waiting for Files", value: 3 },
];

const WORK_HISTORY = [
  { label: "I'm Available", date: "12 Jun", time: "3:20 PM" },
  { label: "I'm Available", date: "11 Jun", time: "10:05 AM" },
  { label: "I'm Available", date: "10 Jun", time: "9:45 AM" },
];

export function VideoEditorCeoView() {
  const maxWeek = Math.max(...PRODUCTIVITY.map((p) => p.videos));
  const totalVideos = 79;
  const totalShorts = 34;
  const completedVideos = 14;
  const completedShorts = 9;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Video Editor</h2>
          <p className="text-xs text-muted-foreground">Revenue Engine · Content production performance</p>
        </div>
      </div>

      {/* Productivity Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Productivity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRODUCTIVITY.map((p) => (
              <div key={p.week} className="border rounded-md p-3 bg-muted/20">
                <div className="text-xs text-muted-foreground">{p.week}</div>
                <div className="text-2xl font-semibold tabular-nums mt-1">
                  {p.videos} <span className="text-xs font-normal text-muted-foreground">Videos</span>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(p.videos / maxWeek) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects by Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="w-4 h-4 text-primary" />
            Projects by Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total videos assigned</div>
              <div className="text-2xl font-semibold mt-1 tabular-nums">{totalVideos}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total shorts assigned</div>
              <div className="text-2xl font-semibold mt-1 tabular-nums">{totalShorts}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STATUS.map((s) => (
              <div key={s.label} className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-xl font-semibold tabular-nums mt-1">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="border rounded-md p-3 bg-primary/5">
            <div className="text-xs font-medium text-foreground mb-2">Completed</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-muted-foreground">A. Total videos</div>
                <div className="text-xl font-semibold tabular-nums">{completedVideos}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">B. Total Shorts</div>
                <div className="text-xl font-semibold tabular-nums">{completedShorts}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> 1. Workload
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Filled by video editor from his dashboard</p>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Assigned Projects" value="18" />
            <Row label="Completed" value="14" />
            <Row label="Pending" value="4" />
            <Row label="Overdue" value="1" tone="danger" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" /> 2. On-Time Delivery
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Calculated from KPI and KRA</p>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Target" value="95%" />
            <Row label="Current" value="97%" tone="success" />
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500" style={{ width: "97%" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> 3. Average Delivery Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Reel" value="1 Day" />
            <Row label="Long Video" value="2.8 Days" />
            <Row label="Thumbnail" value="3 Hours" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" /> 4. Revision Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Videos Delivered" value="28" />
            <Row label="Revision Requested" value="3" />
            <Row label="Revision Rate" value="10.7%" tone="warning" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" /> 5. Bottleneck Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Bottleneck label="Waiting for Raw Footage" count={3} />
            <Bottleneck label="Waiting for Approval" count={2} />
            <Bottleneck label="Waiting for Script" count={1} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> 6. Work Request History
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Recorded when the editor presses "I'm Available"
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {WORK_HISTORY.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
              >
                <span className="font-medium">{h.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {h.date} · {h.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <VideoEditorTaskPanel />
    </div>
  );
}

function VideoEditorTaskPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");

  const queryKey = ["video-editor-tasks"];
  const { data: tasks = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tasks")
        .select("id,title,status,created_at,completed_at")
        .eq("department", "video_editor")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as {
        id: string;
        title: string;
        status: string;
        created_at: string;
        completed_at: string | null;
      }[];
    },
  });

  const addTask = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("tasks").insert({
        title,
        department: "video_editor",
        created_by: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey });
      toast.success("Task assigned");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to assign task"),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await (supabase as any)
        .from("tasks")
        .update({
          status: done ? "completed" : "pending",
          completed_at: done ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
    onError: (e: any) => toast.error(e.message ?? "Failed to update task"),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
    onError: (e: any) => toast.error(e.message ?? "Failed to delete task"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    addTask.mutate(t);
  }

  function fmt(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="w-4 h-4 text-primary" />
          Task Assigned
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Tasks added here appear on the Video Editor's "Mind and task" board.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((t) => {
          const done = t.status === "completed";
          return (
            <div
              key={t.id}
              className="flex items-start gap-2 group border rounded-md px-2 py-2"
            >
              <GripVertical className="w-4 h-4 mt-1 text-muted-foreground/50 shrink-0" />
              <Checkbox
                className="mt-1"
                checked={done}
                onCheckedChange={(v) => toggleTask.mutate({ id: t.id, done: !!v })}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm ${
                    done ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {t.title}
                </div>
                {done && t.completed_at && (
                  <div className="text-[11px] text-emerald-600 mt-0.5 tabular-nums">
                    Completed · {fmt(t.completed_at)}
                  </div>
                )}
              </div>
              {done ? (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5"
                  title="Completed by video editor"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span
                  className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5"
                  title="Pending"
                />
              )}
              <button
                onClick={() => deleteTask.mutate(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive mt-1"
                aria-label="Delete task"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        <form onSubmit={submit} className="flex items-center gap-2 pt-1">
          <Plus className="w-4 h-4 text-muted-foreground" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="List item"
            className="h-9 border-0 focus-visible:ring-0 px-0 shadow-none"
          />
          <Button type="submit" size="sm" disabled={!draft.trim() || addTask.isPending}>
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" | "warning" }) {
  const toneCls =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
      ? "text-destructive"
      : tone === "warning"
      ? "text-amber-600"
      : "text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold tabular-nums ${toneCls}`}>{value}</span>
    </div>
  );
}

function Bottleneck({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between border rounded-md px-3 py-2">
      <span>{label}</span>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
        {count} {count === 1 ? "Project" : "Projects"}
      </span>
    </div>
  );
}
