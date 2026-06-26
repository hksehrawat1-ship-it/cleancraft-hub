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
  Megaphone,
  CalendarCheck,
  Film,
  ListChecks,
  Users,
  Activity,
  Instagram,
  Youtube,
  Facebook,
  Plus,
  X,
  ClipboardList,
  GripVertical,
} from "lucide-react";

const PRODUCTION = [
  { label: "Reels", value: 8 },
  { label: "Carousels", value: 3 },
  { label: "Posts", value: 2 },
  { label: "Stories", value: 14 },
];

const PENDING = [
  { label: "Editing", value: 2 },
  { label: "Approval", value: 3 },
  { label: "Script Pending", value: 1 },
  { label: "Designer Pending", value: 0 },
];

export function SmmCeoView() {
  return (
    <div className="space-y-4">
      <SmmDashboardBody />
      <TaskAssignedPanel />
    </div>
  );
}

function SmmDashboardBody() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Social Media Account Manager</h2>
          <p className="text-xs text-muted-foreground">
            Revenue Engine · Content calendar & lead contribution
          </p>
        </div>
      </div>

      {/* 1. Content Calendar Completion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="w-4 h-4 text-primary" />
            1. Content Calendar Completion
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">This Week</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Planned" value="12" />
            <Stat label="Published" value="11" />
            <Stat label="Completion" value="92%" tone="success" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500" style={{ width: "92%" }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2. Content Production */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Film className="w-4 h-4 text-primary" />
              2. Content Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PRODUCTION.map((p) => (
                <div key={p.label} className="border rounded-md p-3 bg-muted/20">
                  <div className="text-xs text-muted-foreground">{p.label}</div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">{p.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Content Pending */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="w-4 h-4 text-primary" />
              3. Content Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PENDING.map((p) => (
                <div key={p.label} className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">{p.label}</div>
                  <div
                    className={`text-2xl font-semibold tabular-nums mt-1 ${
                      p.value > 0 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {p.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Lead Contribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-primary" />
            4. Lead Contribution
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">This Week</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LeadCard icon={Instagram} platform="Instagram Leads" value={42} accent="text-pink-600" />
            <LeadCard icon={Youtube} platform="YouTube Leads" value={18} accent="text-red-600" />
            <LeadCard icon={Facebook} platform="Facebook" value={7} accent="text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-primary" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Tasks Assigned" value="18" />
            <Stat label="Completed" value="17" tone="success" />
            <Stat label="Delayed" value="1" tone="danger" />
            <Stat label="Completion" value="94%" tone="success" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500" style={{ width: "94%" }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskAssignedPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");

  const queryKey = ["smm-tasks"];
  const { data: tasks = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tasks")
        .select("id,title,status,created_at")
        .eq("department", "social_media")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as { id: string; title: string; status: string; created_at: string }[];
    },
  });

  const addTask = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("tasks").insert({
        title,
        department: "social_media",
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="w-4 h-4 text-primary" />
          Task Assigned
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Tasks added here appear on the Social Media Manager's "Mind and task" board with a notification.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((t) => {
          const done = t.status === "completed";
          return (
            <div
              key={t.id}
              className="flex items-center gap-2 group border rounded-md px-2 py-2"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <Checkbox
                checked={done}
                onCheckedChange={(v) => toggleTask.mutate({ id: t.id, done: !!v })}
              />
              <span
                className={`flex-1 text-sm ${
                  done ? "line-through text-muted-foreground" : ""
                }`}
              >
                {t.title}
              </span>
              <button
                onClick={() => deleteTask.mutate(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
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

function Stat({

  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger" | "warning";
}) {
  const toneCls =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
      ? "text-destructive"
      : tone === "warning"
      ? "text-amber-600"
      : "text-foreground";
  return (
    <div className="border rounded-md p-3 bg-muted/20">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums mt-1 ${toneCls}`}>{value}</div>
    </div>
  );
}

function LeadCard({
  icon: Icon,
  platform,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  platform: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="border rounded-md p-4 bg-muted/20">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${accent}`} />
        <span className="text-sm font-medium">{platform}</span>
      </div>
      <div className="text-3xl font-semibold tabular-nums mt-2">{value}</div>
    </div>
  );
}
