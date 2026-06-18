import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Paperclip } from "lucide-react";
import { DEPARTMENTS } from "@/lib/roles";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Clean Craft OS" }] }),
  component: TasksPage,
});

type Filter = "all" | "mine" | "open" | "blocked" | "completed";

async function loadTasks() {
  const sb = supabase as any;
  const { data, error } = await sb
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as any[];
}
async function loadProfiles() {
  const { data } = await (supabase as any).from("profiles").select("id, full_name, email");
  return (data ?? []) as any[];
}
async function loadLeads() {
  const { data } = await (supabase as any).from("leads").select("id, name");
  return (data ?? []) as any[];
}
async function loadStores() {
  const { data } = await (supabase as any).from("stores").select("id, name");
  return (data ?? []) as any[];
}
async function loadProjects() {
  const { data } = await (supabase as any).from("projects").select("id, name");
  return (data ?? []) as any[];
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/15 text-warning",
  urgent: "bg-destructive/15 text-destructive",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  blocked: "bg-destructive/10 text-destructive",
  completed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

function TasksPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: loadTasks });
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: loadProfiles });
  const { data: leads = [] } = useQuery({ queryKey: ["leads-min"], queryFn: loadLeads });
  const { data: stores = [] } = useQuery({ queryKey: ["stores-min"], queryFn: loadStores });
  const { data: projects = [] } = useQuery({ queryKey: ["projects-min"], queryFn: loadProjects });
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = tasks.filter((t) => {
    if (filter === "mine") return t.assigned_to === user?.id;
    if (filter === "open") return t.status === "pending" || t.status === "in_progress";
    if (filter === "blocked") return t.status === "blocked";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const profileName = (id: string | null) => profiles.find((p) => p.id === id)?.full_name || profiles.find((p) => p.id === id)?.email || "Unassigned";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">Universal task management across all teams.</p>
        </div>
        <TaskDialog profiles={profiles} leads={leads} stores={stores} projects={projects} onSaved={() => qc.invalidateQueries({ queryKey: ["tasks"] })}>
          <Button><Plus className="w-4 h-4 mr-1" /> New task</Button>
        </TaskDialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "mine", "open", "blocked", "completed"] as Filter[]).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "mine" ? "Assigned to me" : f[0].toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No tasks yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{t.title}</h3>
                      <Badge className={STATUS_COLORS[t.status]}>{t.status.replace("_", " ")}</Badge>
                      <Badge className={PRIORITY_COLORS[t.priority]}>{t.priority}</Badge>
                      {t.department && <Badge variant="outline">{t.department}</Badge>}
                    </div>
                    {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span>👤 {profileName(t.assigned_to)}</span>
                      {t.due_date && <span>📅 {new Date(t.due_date).toLocaleDateString()}</span>}
                      {t.blocker_reason && <span className="text-destructive">🚧 {t.blocker_reason}</span>}
                      {t.completion_proof_url && (
                        <a href={t.completion_proof_url} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1">
                          <Paperclip className="w-3 h-3" /> proof
                        </a>
                      )}
                    </div>
                    {t.remarks && <p className="text-xs italic text-muted-foreground mt-1">"{t.remarks}"</p>}
                  </div>
                  <TaskDialog
                    task={t}
                    profiles={profiles}
                    leads={leads}
                    stores={stores}
                    projects={projects}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["tasks"] })}
                  >
                    <Button variant="outline" size="sm">Edit</Button>
                  </TaskDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskDialog({
  children, task, profiles, leads, stores, projects, onSaved,
}: {
  children: React.ReactNode;
  task?: any;
  profiles: any[]; leads: any[]; stores: any[]; projects: any[];
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(
    task ?? {
      title: "", description: "", assigned_to: null, department: null,
      related_lead_id: null, related_store_id: null, related_project_id: null,
      due_date: "", priority: "medium", status: "pending",
      blocker_reason: "", completion_proof_url: "", remarks: "",
    },
  );
  const [file, setFile] = useState<File | null>(null);

  async function uploadProof(): Promise<string | null> {
    if (!file || !user) return form.completion_proof_url || null;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("task-proofs").upload(path, file);
    if (error) { toast.error(error.message); return form.completion_proof_url || null; }
    const { data } = await supabase.storage.from("task-proofs").createSignedUrl(path, 60 * 60 * 24 * 365);
    return data?.signedUrl ?? null;
  }

  async function save() {
    if (!form.title) return toast.error("Title is required");
    setSaving(true);
    const proofUrl = await uploadProof();
    const payload: any = {
      ...form,
      completion_proof_url: proofUrl,
      due_date: form.due_date || null,
      completed_at: form.status === "completed" ? new Date().toISOString() : null,
    };
    if (task) {
      const { error } = await (supabase as any).from("tasks").update(payload).eq("id", task.id);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      payload.created_by = user!.id;
      const { error } = await (supabase as any).from("tasks").insert(payload);
      if (error) { setSaving(false); return toast.error(error.message); }
    }
    setSaving(false); setOpen(false); onSaved();
    toast.success(task ? "Task updated" : "Task created");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Assigned to</Label>
            <Select value={form.assigned_to ?? "_"} onValueChange={(v) => setForm({ ...form, assigned_to: v === "_" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">Unassigned</SelectItem>
                {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Department</Label>
            <Select value={form.department ?? "_"} onValueChange={(v) => setForm({ ...form, department: v === "_" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">None</SelectItem>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Related lead</Label>
            <Select value={form.related_lead_id ?? "_"} onValueChange={(v) => setForm({ ...form, related_lead_id: v === "_" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">None</SelectItem>
                {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Related store</Label>
            <Select value={form.related_store_id ?? "_"} onValueChange={(v) => setForm({ ...form, related_store_id: v === "_" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">None</SelectItem>
                {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Related project</Label>
            <Select value={form.related_project_id ?? "_"} onValueChange={(v) => setForm({ ...form, related_project_id: v === "_" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">None</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["low", "medium", "high", "urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["pending", "in_progress", "blocked", "completed", "cancelled"].map((s) =>
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {form.status === "blocked" && (
            <div className="md:col-span-2">
              <Label>Blocker reason</Label>
              <Input value={form.blocker_reason ?? ""} onChange={(e) => setForm({ ...form, blocker_reason: e.target.value })} />
            </div>
          )}
          <div className="md:col-span-2">
            <Label>Completion proof (file)</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {form.completion_proof_url && !file && (
              <a href={form.completion_proof_url} target="_blank" rel="noreferrer" className="text-xs text-primary mt-1 inline-block">
                View existing proof
              </a>
            )}
          </div>
          <div className="md:col-span-2">
            <Label>Remarks</Label>
            <Textarea rows={2} value={form.remarks ?? ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
