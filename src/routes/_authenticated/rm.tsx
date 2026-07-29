import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserCircle2,
  Store,
  Headphones,
  Brain,
  Share2,
  FolderOpen,
  FileText,
  TrendingUp,
  Plus,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Download,
  Upload,
  Search,
  ChevronRight,
  FileDown,
} from "lucide-react";
import rmRolesPdf from "@/assets/rm-2-roles.pdf.asset.json";

export const Route = createFileRoute("/_authenticated/rm")({
  head: () => ({
    meta: [
      { title: "Relationship Manager — Clean Craft OS" },
      { name: "description", content: "Relationship Manager employee dashboard" },
    ],
  }),
  component: RMDashboard,
});

type SectionKey =
  | "roles"
  | "stores"
  | "crm"
  | "mind"
  | "delegate"
  | "resources"
  | "sops"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "roles", label: "Roles & Responsibilities", icon: UserCircle2 },
  { key: "stores", label: "Stores Status", icon: Store },
  { key: "crm", label: "CRM", icon: Headphones },
  { key: "mind", label: "Mind & Task", icon: Brain },
  { key: "delegate", label: "Delegate", icon: Share2 },
  { key: "resources", label: "Resources", icon: FolderOpen },
  { key: "sops", label: "SOPs", icon: FileText },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function RMDashboard() {
  const [active, setActive] = useState<SectionKey>("roles");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Relationship Manager</div>
        </div>
        <nav className="p-2 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {active === "roles" && <RolesSection />}
        {active === "stores" && <StoresSection />}
        {active === "crm" && <CRMSection />}
        {active === "mind" && <MindSection />}
        {active === "delegate" && <DelegateSection />}
        {active === "resources" && <ResourcesSection />}
        {active === "sops" && <SOPsSection />}
        {active === "performance" && <PerformanceSection />}
      </main>
    </div>
  );
}

/* -------------------- Roles -------------------- */
function RolesSection() {
  const items = [
    "Own the relationship with assigned franchise owners end-to-end",
    "Track store health: sales, complaints, machine, marketing, satisfaction",
    "Ensure complaints are resolved within target SLA (< 3 days)",
    "Conduct weekly check-ins and monthly business reviews with owners",
    "Coordinate with Trainer, Engineer, Marketing & Supply Chain teams",
    "Flag red-alert stores to CEO with proposed action plan",
    "Drive month-on-month sales growth across the assigned cluster",
  ];
  const shareWa = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        `RM Roles & Responsibilities: ${window.location.origin}${rmRolesPdf.url}`,
      )}`,
      "_blank",
    );
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles & Responsibilities</h1>
        <p className="text-sm text-muted-foreground">Your charter as a Relationship Manager.</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Official Role Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border rounded-md p-3 bg-muted/20">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                CRM Retention Executive — Clean Craft
              </div>
              <div className="text-xs text-muted-foreground">
                RM.pdf · {(rmRolesPdf.size / 1024).toFixed(0)} KB
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={rmRolesPdf.url} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4 mr-1" /> View
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={rmRolesPdf.url} download="RM-Roles.pdf">
                  <FileDown className="h-4 w-4 mr-1" /> Download
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={shareWa}>
                <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
              </Button>
            </div>
          </div>
          <div className="rounded-md overflow-hidden border">
            <iframe
              src={rmRolesPdf.url}
              title="RM Roles & Responsibilities"
              className="w-full h-[520px] bg-background"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {items.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------- Stores Status -------------------- */
type StoreRow = {
  name: string;
  city: string;
  owner: string;
  phone: string;
  health: number;
  sales: "up" | "stable" | "down";
  openIssues: number;
  lastVisit: string;
};

const STORES: StoreRow[] = [
  { name: "CC Jaipur", city: "Jaipur", owner: "Rohit Sharma", phone: "98111-22001", health: 92, sales: "up", openIssues: 1, lastVisit: "2 days ago" },
  { name: "CC Indore", city: "Indore", owner: "Neha Verma", phone: "98111-22002", health: 88, sales: "up", openIssues: 2, lastVisit: "4 days ago" },
  { name: "CC Lucknow", city: "Lucknow", owner: "Amit Singh", phone: "98111-22003", health: 74, sales: "stable", openIssues: 3, lastVisit: "1 week ago" },
  { name: "CC Surat", city: "Surat", owner: "Priya Patel", phone: "98111-22004", health: 61, sales: "down", openIssues: 5, lastVisit: "2 weeks ago" },
  { name: "CC Nagpur", city: "Nagpur", owner: "Vikas Rao", phone: "98111-22005", health: 83, sales: "stable", openIssues: 1, lastVisit: "3 days ago" },
  { name: "CC Kanpur", city: "Kanpur", owner: "Deepa Nair", phone: "98111-22006", health: 55, sales: "down", openIssues: 6, lastVisit: "3 weeks ago" },
];

function healthTint(v: number) {
  if (v >= 85) return "text-emerald-600";
  if (v >= 70) return "text-sky-600";
  if (v >= 60) return "text-amber-600";
  return "text-red-600";
}

function StoresSection() {
  const [q, setQ] = useState("");
  const filtered = STORES.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.city.toLowerCase().includes(q.toLowerCase()) ||
      s.owner.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stores Status</h1>
        <p className="text-sm text-muted-foreground">Health snapshot of every store you manage.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store, city, owner" className="pl-9" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((s) => (
          <Card key={s.name}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.city} • Owner: {s.owner}
                  </div>
                </div>
                <div className={`text-2xl font-bold tabular-nums ${healthTint(s.health)}`}>{s.health}</div>
              </div>
              <Progress value={s.health} />
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="gap-1">
                  <Phone className="h-3 w-3" />
                  {s.phone}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    s.sales === "up"
                      ? "text-emerald-600 border-emerald-500/40"
                      : s.sales === "down"
                        ? "text-red-600 border-red-500/40"
                        : "text-sky-600 border-sky-500/40"
                  }
                >
                  Sales {s.sales}
                </Badge>
                <Badge
                  variant="outline"
                  className={s.openIssues > 3 ? "text-red-600 border-red-500/40" : ""}
                >
                  {s.openIssues} open issues
                </Badge>
                <Badge variant="outline">Last visit: {s.lastVisit}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------- CRM -------------------- */
type Ticket = {
  id: string;
  store: string;
  category: string;
  summary: string;
  status: "open" | "in_progress" | "resolved";
  raised: string;
  remark?: string;
};

function CRMSection() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "T-1041", store: "CC Surat", category: "Machine", summary: "Dryer 15kg not heating", status: "in_progress", raised: "Today, 10:12" },
    { id: "T-1042", store: "CC Kanpur", category: "Manpower", summary: "Rider absent, need backup", status: "open", raised: "Today, 09:30" },
    { id: "T-1043", store: "CC Lucknow", category: "POS", summary: "Bill printer paper jam", status: "resolved", raised: "Yesterday", remark: "Guided owner over call" },
    { id: "T-1044", store: "CC Indore", category: "Owner", summary: "Franchise reconciliation query", status: "open", raised: "Yesterday" },
  ]);
  const [newForm, setNewForm] = useState({ store: "", category: "Machine", summary: "" });

  const kpis = {
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const updateStatus = (id: string, status: Ticket["status"]) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Ticket ${id} → ${status.replace("_", " ")}`);
  };

  const addTicket = () => {
    if (!newForm.store.trim() || !newForm.summary.trim()) {
      toast.error("Store and summary are required");
      return;
    }
    const id = `T-${1050 + tickets.length}`;
    setTickets((prev) => [
      { id, ...newForm, status: "open", raised: "Just now" },
      ...prev,
    ]);
    setNewForm({ store: "", category: "Machine", summary: "" });
    toast.success("Ticket logged");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
        <p className="text-sm text-muted-foreground">Complaint & request tracking across your stores.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Open</div>
            <div className="text-2xl font-bold text-amber-600">{kpis.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold text-sky-600">{kpis.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Resolved</div>
            <div className="text-2xl font-bold text-emerald-600">{kpis.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Log New Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input
            placeholder="Store"
            value={newForm.store}
            onChange={(e) => setNewForm({ ...newForm, store: e.target.value })}
          />
          <Select value={newForm.category} onValueChange={(v) => setNewForm({ ...newForm, category: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Machine", "Manpower", "POS", "Owner", "Marketing", "Other"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="sm:col-span-2"
            placeholder="Summary"
            value={newForm.summary}
            onChange={(e) => setNewForm({ ...newForm, summary: e.target.value })}
          />
          <Button onClick={addTicket} className="sm:col-span-4 w-fit">
            Add Ticket
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {tickets.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                    <Badge variant="outline">{t.category}</Badge>
                    <span className="text-xs text-muted-foreground">{t.store}</span>
                  </div>
                  <div className="mt-1 text-sm">{t.summary}</div>
                  {t.remark && (
                    <div className="mt-1 text-xs text-muted-foreground italic">Remark: {t.remark}</div>
                  )}
                  <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t.raised}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      t.status === "resolved"
                        ? "bg-emerald-500 hover:bg-emerald-500"
                        : t.status === "in_progress"
                          ? "bg-sky-500 hover:bg-sky-500"
                          : "bg-amber-500 hover:bg-amber-500"
                    }
                  >
                    {t.status.replace("_", " ")}
                  </Badge>
                  {t.status !== "resolved" && (
                    <>
                      {t.status === "open" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "in_progress")}>
                          Start
                        </Button>
                      )}
                      <Button size="sm" onClick={() => updateStatus(t.id, "resolved")}>
                        Resolve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Mind & Task -------------------- */
type Task = { id: string; title: string; due: string; done: boolean; note?: string };

function MindSection() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "m1", title: "Call CC Surat owner about sales drop", due: "Today", done: false },
    { id: "m2", title: "Prepare MBR deck for cluster review", due: "Tomorrow", done: false },
    { id: "m3", title: "Visit CC Kanpur — manpower crisis", due: "This week", done: false },
    { id: "m4", title: "Close Lucknow POS ticket", due: "Today", done: true },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [note, setNote] = useState("");

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const add = () => {
    if (!newTitle.trim()) return;
    setTasks((p) => [{ id: crypto.randomUUID(), title: newTitle, due: "Today", done: false }, ...p]);
    setNewTitle("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mind & Task</h1>
        <p className="text-sm text-muted-foreground">Capture thoughts, plan today's actions.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brain Dump</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write anything on your mind..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={() => toast.success("Saved to your notes")}>
              Save Note
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Add a task" />
            <Button onClick={add}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border rounded-md p-3 bg-muted/20"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                  <span className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </span>
                </label>
                <Badge variant="outline">{t.due}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------- Delegate -------------------- */
type Delegated = {
  id: string;
  task: string;
  to: string;
  team: string;
  due: string;
  status: "assigned" | "in_progress" | "done";
};

function DelegateSection() {
  const [items, setItems] = useState<Delegated[]>([
    { id: "d1", task: "Fix dryer heating — CC Surat", to: "Rahul (Engineer)", team: "Service", due: "Today", status: "in_progress" },
    { id: "d2", task: "Send Kanpur backup rider", to: "TMC", team: "Training & Manpower", due: "Tomorrow", status: "assigned" },
    { id: "d3", task: "Reconciliation for Indore", to: "Meera (Accounts)", team: "Finance", due: "This week", status: "assigned" },
  ]);
  const [form, setForm] = useState({ task: "", to: "", team: "Service", due: "Today" });

  const add = () => {
    if (!form.task.trim() || !form.to.trim()) {
      toast.error("Task and assignee required");
      return;
    }
    setItems((p) => [
      { id: crypto.randomUUID(), ...form, status: "assigned" },
      ...p,
    ]);
    setForm({ task: "", to: "", team: "Service", due: "Today" });
    toast.success("Delegated");
  };

  const advance = (id: string) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              status: it.status === "assigned" ? "in_progress" : it.status === "in_progress" ? "done" : "done",
            }
          : it,
      ),
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delegate</h1>
        <p className="text-sm text-muted-foreground">Hand off work to the right team and track it.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New Delegation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input
            className="sm:col-span-2"
            placeholder="Task"
            value={form.task}
            onChange={(e) => setForm({ ...form, task: e.target.value })}
          />
          <Input
            placeholder="Assign to (name)"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          />
          <Select value={form.team} onValueChange={(v) => setForm({ ...form, team: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Service", "Training & Manpower", "Marketing", "Finance", "Supply Chain", "Projects"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.due} onValueChange={(v) => setForm({ ...form, due: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Today", "Tomorrow", "This week", "Next week"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={add} className="sm:col-span-4 w-fit">
            Delegate
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((it) => (
          <Card key={it.id}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{it.task}</div>
                <div className="text-xs text-muted-foreground">
                  → {it.to} · {it.team} · Due {it.due}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    it.status === "done"
                      ? "bg-emerald-500 hover:bg-emerald-500"
                      : it.status === "in_progress"
                        ? "bg-sky-500 hover:bg-sky-500"
                        : "bg-amber-500 hover:bg-amber-500"
                  }
                >
                  {it.status.replace("_", " ")}
                </Badge>
                {it.status !== "done" && (
                  <Button size="sm" variant="outline" onClick={() => advance(it.id)}>
                    {it.status === "assigned" ? "Start" : "Mark Done"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Resources -------------------- */
function ResourcesSection() {
  const [files, setFiles] = useState<{ id: string; name: string; category: string }[]>([
    { id: "r1", name: "Store Health Rubric.pdf", category: "Playbooks" },
    { id: "r2", name: "Owner Weekly Review Template.xlsx", category: "Templates" },
    { id: "r3", name: "Complaint SLA Guide.pdf", category: "Playbooks" },
    { id: "r4", name: "Machine Troubleshooting Quick Sheet.pdf", category: "Reference" },
  ]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFiles((p) => [{ id: crypto.randomUUID(), name: f.name, category: "Uploads" }, ...p]);
    toast.success(`${f.name} uploaded`);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-sm text-muted-foreground">Playbooks, templates & references.</p>
        </div>
        <label className="inline-flex">
          <input type="file" className="hidden" onChange={onUpload} />
          <Button asChild variant="outline" size="sm">
            <span>
              <Upload className="h-4 w-4 mr-2" /> Upload
            </span>
          </Button>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.category}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success("Download started")}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`Resource: ${f.name}`)}`,
                      "_blank",
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------- SOPs -------------------- */
function SOPsSection() {
  const sops = [
    {
      id: "s0",
      title: "Role Definition & Trigger",
      steps: [
        "Role: Maintain franchise partner relationships, resolve operational issues, coordinate support between departments, monitor store performance, and ensure timely assistance post-launch",
        "Trigger Point: Store opening completed and officially handed over by the Launch & Training Team",
        "Update the CRM after every interaction",
      ],
    },
    {
      id: "s1",
      title: "Responsibility Deliverables",
      steps: [
        "A. Customer Retention",
        "B. Repeat Order Generation",
        "C. WhatsApp Campaign Execution",
        "D. Membership & Offer Promotion",
        "E. Customer Reactivation",
        "F. Google Review Generation",
        "G. Machine service coordination",
        "H. Manpower availability",
        "I. Marketing coordination with Performance team",
      ],
    },
    {
      id: "s2",
      title: "Daily / Weekly / Monthly Checklist",
      steps: [
        "Daily: Franchise calls completed, open tickets reviewed, complaints resolved, follow-ups completed",
        "Weekly: Store reviews conducted, issues closed, escalations resolved",
        "Monthly: Franchise satisfaction score, ticket closure %, complaint resolution time, store retention %, Google rating improvement, revenue growth of assigned stores",
        "Welcome call completed → Store marketing plan shared → Issues tracked → Departments coordinated → Monthly review completed → Franchise feedback recorded → CRM updated",
      ],
    },
    {
      id: "s3",
      title: "Handover Matrix",
      steps: [
        "Coordinate with CRM Retention Team",
        "Coordinate with BTL Team",
        "Coordinate with Performance Marketing Team",
        "Coordinate with Supply Chain & Logistics",
        "Coordinate with Accounts",
        "Coordinate with Tech Team",
        "Coordinate with Management",
        "Ensure timely support and issue resolution end-to-end",
      ],
    },
    {
      id: "s4",
      title: "KRA — Key Result Areas",
      steps: [
        "Maintain franchise satisfaction",
        "Ensure timely issue resolution",
        "Improve store performance",
        "Reduce franchise complaints",
        "Improve franchise retention",
        "Support long-term store growth",
      ],
    },
    {
      id: "s5",
      title: "What NOT To Do",
      steps: [
        "Do not promise discounts",
        "Do not modify agreements",
        "Do not commit additional manpower beyond policy",
        "Do not discuss legal matters",
        "Do not discuss franchise resale or transfer",
        "Do not ignore complaints or delay escalation",
        "Do not make commitments without approval",
        "Do not handle technical issues yourself — coordinate with the concerned department",
      ],
    },
    {
      id: "s6",
      title: "Escalation Matrix",
      steps: [
        "Franchise partner threatens closure",
        "Legal dispute",
        "Repeated customer complaints",
        "Serious machine breakdown",
        "Store revenue decline for multiple months",
        "Franchise partner dissatisfaction",
        "Social media reputation issue",
        "Manpower crisis affecting operations",
      ],
    },
    {
      id: "s7",
      title: "Successful RM Principles",
      steps: [
        "Own the problem",
        "Coordinate the right department",
        "Ensure timely resolution",
        "Build trust with franchise partners",
        "Support store growth",
        "Protect franchise relationships",
        'Outcome: Every partner should feel — "Whenever I need help, Clean Craft responds quickly and stands with me to solve the problem."',
      ],
    },
  ];
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SOPs</h1>
        <p className="text-sm text-muted-foreground">Standard operating procedures for the RM role.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {sops.map((s) => (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal ml-5 space-y-1 text-sm">
                {s.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`SOP: ${s.title}\n\n${s.steps.map((st, i) => `${i + 1}. ${st}`).join("\n")}`)}`,
                      "_blank",
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4 mr-1" /> Share
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Downloaded")}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Performance -------------------- */
function PerformanceSection() {
  const metrics = [
    { label: "Avg Store Health", value: "82 / 100", icon: Star, tint: "text-emerald-600" },
    { label: "Tickets Resolved (MTD)", value: 46, icon: CheckCircle2, tint: "text-emerald-600" },
    { label: "Avg Resolution Time", value: "2.4 Days", icon: Clock, tint: "text-sky-600" },
    { label: "Red Alerts Raised", value: 3, icon: AlertTriangle, tint: "text-red-600" },
  ];
  const kpi = [
    { label: "Sales Growth (MoM)", value: 74 },
    { label: "Complaint Resolution", value: 88 },
    { label: "Machine Uptime", value: 82 },
    { label: "Owner Satisfaction", value: 90 },
  ];
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
        <p className="text-sm text-muted-foreground">Your monthly scorecard.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <Icon className={`h-4 w-4 ${m.tint}`} />
                </div>
                <div className={`text-2xl font-bold mt-1 ${m.tint}`}>{m.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">KPI Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {kpi.map((k) => (
            <div key={k.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{k.label}</span>
                <span className="tabular-nums font-medium">{k.value}%</span>
              </div>
              <Progress value={k.value} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
