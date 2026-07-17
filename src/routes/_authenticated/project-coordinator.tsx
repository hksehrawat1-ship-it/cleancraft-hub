import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  Brain,
  UserPlus,
  Package,
  TrendingUp,
  ClipboardList,
  Plus,
  Trash2,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/project-coordinator")({
  head: () => ({ meta: [{ title: "Project Coordinator — Clean Craft OS" }] }),
  component: ProjectCoordinatorDashboard,
});

const MENU = [
  { key: "roles", label: "Roles & Responsibility", icon: ShieldCheck },
  { key: "projects-status", label: "Projects Status", icon: ClipboardList },
  { key: "stores", label: "Stores", icon: Store },
  { key: "mind-task", label: "Mind & Task", icon: Brain },
  { key: "delegate", label: "Delegate", icon: UserPlus },
  { key: "resource", label: "Resource", icon: Package },
  { key: "sops", label: "SOPs", icon: FileText },
  { key: "performance", label: "Performance", icon: TrendingUp },
] as const;

type MenuKey = (typeof MENU)[number]["key"];

// Mock data — replace with real backend later
const PROJECT_MANAGERS = [
  { id: "pm-1", name: "Rahul Sharma" },
  { id: "pm-2", name: "Priya Verma" },
  { id: "pm-3", name: "Anil Kumar" },
  { id: "pm-4", name: "Sneha Patel" },
];

type StoreRow = {
  id: string;
  name: string;
  partnerName: string;
  partnerPhone: string;
  stage: string;
  pmId: string | null;
};

const STORES_SEED: StoreRow[] = [
  { id: "s1", name: "Sector 14 — Gurugram", partnerName: "Amit Singh", partnerPhone: "+91 98100 11122", stage: "Civil Work", pmId: "pm-1" },
  { id: "s2", name: "Andheri West — Mumbai", partnerName: "Neha Joshi", partnerPhone: "+91 98200 22233", stage: "Machine Installed", pmId: "pm-2" },
  { id: "s3", name: "Koramangala — Bengaluru", partnerName: "Kiran Rao", partnerPhone: "+91 98450 33344", stage: "Design Approved", pmId: "pm-3" },
  { id: "s4", name: "Salt Lake — Kolkata", partnerName: "Debashish Sen", partnerPhone: "+91 98300 44455", stage: "Site Approved", pmId: "pm-4" },
];

const STORES_LS_KEY = "cc-pc-stores-v1";

type Task = {
  id: string;
  title: string;
  pmId: string;
  dueDate: string;
  notes: string;
  status: "assigned" | "in-progress" | "done";
};

type MindItem = { id: string; text: string; done: boolean };

function ProjectCoordinatorDashboard() {
  const [active, setActive] = useState<MenuKey>("roles");
  const [displayName, setDisplayName] = useState("Project Coordinator");
  const [editingName, setEditingName] = useState(false);

  return (
    <div className="flex gap-6 -m-4 md:-m-8 min-h-[calc(100vh-3.5rem)]">
      <aside className="w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground p-3 hidden md:block">
        <div className="px-2 py-3 mb-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Project Coordinator
          </div>
          {editingName ? (
            <Input
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") setEditingName(false);
              }}
              className="h-8 text-sm font-semibold"
            />
          ) : (
            <button
              className="text-sm font-semibold truncate hover:text-primary"
              onClick={() => setEditingName(true)}
            >
              {displayName}
            </button>
          )}
        </div>
        <nav className="space-y-0.5">
          {MENU.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
        <div className="md:hidden flex gap-2 flex-wrap">
          {MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs border",
                active === m.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {active === "stores" && <StoresSection />}
        {active === "mind-task" && <MindTaskSection />}
        {active === "delegate" && <DelegateSection />}
        {active === "resource" && <ResourceSection />}
        {active === "performance" && <PerformanceSection />}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function StoresSection() {
  const [stores, setStores] = useState<StoreRow[]>(() => {
    if (typeof window === "undefined") return STORES_SEED;
    try {
      const raw = window.localStorage.getItem(STORES_LS_KEY);
      return raw ? (JSON.parse(raw) as StoreRow[]) : STORES_SEED;
    } catch {
      return STORES_SEED;
    }
  });
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [creating, setCreating] = useState(false);

  function persist(next: StoreRow[]) {
    setStores(next);
    try {
      window.localStorage.setItem(STORES_LS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function createStore() {
    if (!name.trim()) return toast.error("Store name is required");
    if (!partnerName.trim()) return toast.error("Franchise partner name is required");
    if (!partnerPhone.trim()) return toast.error("Franchise partner phone is required");
    const row: StoreRow = {
      id: crypto.randomUUID(),
      name: name.trim(),
      partnerName: partnerName.trim(),
      partnerPhone: partnerPhone.trim(),
      stage: "Bookings Received",
      pmId: null,
    };
    persist([row, ...stores]);
    setName("");
    setPartnerName("");
    setPartnerPhone("");
    setCreating(false);
    toast.success("Store created");
  }

  function assignPm(storeId: string, pmId: string) {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return;
    const prevPm = store.pmId;
    const nextPm = pmId === "unassigned" ? null : pmId;
    persist(stores.map((s) => (s.id === storeId ? { ...s, pmId: nextPm } : s)));
    const pmName = PROJECT_MANAGERS.find((p) => p.id === nextPm)?.name ?? "Unassigned";
    if (prevPm && nextPm && prevPm !== nextPm) {
      toast.success(`Store transferred to ${pmName}`);
    } else if (nextPm) {
      toast.success(`Store assigned to ${pmName}`);
    } else {
      toast.success("Store unassigned");
    }
  }

  function removeStore(id: string) {
    persist(stores.filter((s) => s.id !== id));
    toast.success("Store removed");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionHeader
          icon={Store}
          title="Stores"
          subtitle="Create stores, assign them to a project manager, and transfer at any time."
        />
        <Button onClick={() => setCreating((v) => !v)} variant={creating ? "outline" : "default"}>
          <Plus className="w-4 h-4 mr-1" />
          {creating ? "Cancel" : "New store"}
        </Button>
      </div>

      {creating && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium">Store name / location</label>
              <Input
                className="mt-1"
                placeholder="e.g. Sector 21 — Noida"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Franchise partner name</label>
                <Input
                  className="mt-1"
                  placeholder="Full name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Franchise partner phone</label>
                <Input
                  className="mt-1"
                  type="tel"
                  placeholder="+91 …"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={createStore}>Create store</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 divide-y">
          {stores.length === 0 && (
            <div className="p-4 text-xs text-muted-foreground">
              No stores yet — click "New store" to add one.
            </div>
          )}
          {stores.map((s) => {
            const pm = PROJECT_MANAGERS.find((p) => p.id === s.pmId);
            return (
              <div key={s.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Partner: {s.partnerName} · {s.partnerPhone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{s.stage}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeStore(s.id)}
                      aria-label="Remove store"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {s.pmId ? "Assigned PM" : "Assign PM"}:
                  </span>
                  <div className="min-w-[220px]">
                    <Select
                      value={s.pmId ?? "unassigned"}
                      onValueChange={(v) => assignPm(s.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {PROJECT_MANAGERS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {pm && (
                    <span className="text-xs text-muted-foreground">
                      Currently with <span className="font-medium">{pm.name}</span> — change the
                      selection to transfer.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function MindTaskSection() {
  const [items, setItems] = useState<MindItem[]>([
    { id: "m1", text: "Follow up on Sector 14 civil work timeline", done: false },
    { id: "m2", text: "Confirm machine dispatch for Andheri store", done: true },
  ]);
  const [draft, setDraft] = useState("");

  function add() {
    const text = draft.trim();
    if (!text) return;
    setItems((prev) => [
      { id: crypto.randomUUID(), text, done: false },
      ...prev,
    ]);
    setDraft("");
  }

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Brain}
        title="Mind & Task"
        subtitle="Personal notes, reminders and to-dos."
      />
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Jot a note or task…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Button onClick={add}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <ul className="space-y-2">
            {items.length === 0 && (
              <li className="text-xs text-muted-foreground">Nothing yet — add your first item.</li>
            )}
            {items.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 bg-background"
              >
                <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={i.done}
                    onChange={() => toggle(i.id)}
                    className="w-4 h-4"
                  />
                  <span
                    className={cn(
                      "text-sm truncate",
                      i.done && "line-through text-muted-foreground",
                    )}
                  >
                    {i.text}
                  </span>
                </label>
                <Button size="icon" variant="ghost" onClick={() => remove(i.id)} aria-label="Remove">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function DelegateSection() {
  const [pmId, setPmId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  function assign() {
    if (!pmId) return toast.error("Select a project manager");
    if (!title.trim()) return toast.error("Task title is required");
    const pm = PROJECT_MANAGERS.find((p) => p.id === pmId);
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      pmId,
      dueDate,
      notes: notes.trim(),
      status: "assigned",
    };
    setTasks((prev) => [task, ...prev]);
    setTitle("");
    setDueDate("");
    setNotes("");
    toast.success(`Task assigned to ${pm?.name}`);
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={UserPlus}
        title="Delegate"
        subtitle="Assign a task to a project manager."
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium">Project Manager</label>
            <Select value={pmId} onValueChange={setPmId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select project manager" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_MANAGERS.map((pm) => (
                  <SelectItem key={pm.id} value={pm.id}>
                    {pm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Task title</label>
              <Input
                className="mt-1"
                placeholder="e.g. Coordinate tile work at Sector 14"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Due date</label>
              <Input
                className="mt-1"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Notes / instructions</label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="Additional context for the project manager"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={assign}>
              <ClipboardList className="w-4 h-4 mr-1" /> Assign task
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Assigned tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">
              No tasks assigned yet.
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((t) => {
                const pm = PROJECT_MANAGERS.find((p) => p.id === t.pmId);
                return (
                  <div key={t.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-medium">{t.title}</div>
                      <Badge variant="secondary">{t.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Assigned to <span className="font-medium">{pm?.name}</span>
                      {t.dueDate && <> • Due {t.dueDate}</>}
                    </div>
                    {t.notes && <div className="text-sm">{t.notes}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceSection() {
  const resources = [
    { name: "Standard Store Layout — Double Machine", type: "PDF" },
    { name: "Civil Work SOP", type: "Doc" },
    { name: "Machine Installation Checklist", type: "Doc" },
    { name: "Vendor Contact Sheet", type: "Sheet" },
    { name: "Brand Guidelines", type: "PDF" },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Package}
        title="Resource"
        subtitle="Documents, SOPs and reference material."
      />
      <Card>
        <CardContent className="p-0 divide-y">
          {resources.map((r) => (
            <div key={r.name} className="flex items-center justify-between p-3">
              <div className="text-sm font-medium">{r.name}</div>
              <Badge variant="outline">{r.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceSection() {
  const stats = [
    { label: "Stores Coordinated", value: 12 },
    { label: "Tasks Delegated", value: 47 },
    { label: "On-time Completion", value: "82%" },
    { label: "Delayed", value: 3 },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={TrendingUp}
        title="Performance"
        subtitle="Your delivery and coordination metrics."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {s.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
