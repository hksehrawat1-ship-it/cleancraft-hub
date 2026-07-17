import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  ChevronDown,
  ChevronRight,
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
  { id: "s1", name: "Sector 14 — Gurugram", partnerName: "Amit Singh", partnerPhone: "+91 98100 11122", stage: "Site Approved", pmId: "pm-1" },
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
  assignedAt: string;
};

type MindItem = { id: string; text: string; done: boolean };

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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

        {active === "roles" && <RolesSection />}
        {active === "projects-status" && <ProjectsStatusSection />}
        {active === "stores" && <StoresSection />}
        {active === "mind-task" && <MindTaskSection />}
        {active === "delegate" && <DelegateSection />}
        {active === "resource" && <ResourceSection />}
        {active === "sops" && <SopsSection />}
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
  const [dueDate, setDueDate] = useState(() => formatDateInput(new Date()));
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
      assignedAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    setTitle("");
    setDueDate(formatDateInput(new Date()));
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
                      <> • {formatDateTime(t.assignedAt)}</>
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

const ROLE_SECTIONS: { title: string; items: string[]; ordered?: boolean; note?: string }[] = [
  {
    title: "Role Definition",
    items: [
      "Responsible for ensuring smooth transition of a franchise partner from booking stage to store opening by coordinating all departments, tracking timelines, resolving bottlenecks, and maintaining project progress.",
    ],
  },
  {
    title: "Trigger Point",
    ordered: true,
    items: [
      "Sales Handover Form Submitted",
      "Booking Amount Received",
      "Franchise WhatsApp Group Created",
    ],
    note: "First Action: Call franchise partner within 30 minutes of handover.",
  },
  {
    title: "Responsibility Deliverable",
    items: [
      "A. Sales to Operations Handover",
      "B. Project Planning",
      "C. Department Coordination",
      "D. Timeline Management",
      "E. Store Launch Readiness",
    ],
  },
  {
    title: "Tasks & Activities",
    ordered: true,
    items: [
      "Call Franchise when WhatsApp group is created and introduce.",
      "Send documents specimen on mail on the same day.",
      "Assign Project Manager.",
      "Plan visit of Project Manager.",
      "Help all the departments involved in project completion.",
      "Explain Clean Craft process, timeline, responsibilities, and expectations clearly to the franchise partner.",
      "Coordinate agreement signing and payment completion with Accounts.",
      "Coordinate with institute for manpower.",
      "Schedule opening date and coordinate with all departments.",
    ],
  },
  {
    title: "Completion Matrix",
    items: [
      "Infra: Civil, plumbing, carpenter, branding, paint work complete.",
      "Technical: machine installed, trial run complete, software live.",
      "Trained staff & trainer reached.",
      "Opening done.",
      "Agreement signed & CRM updated.",
      "R.M. introduced.",
    ],
  },
  {
    title: "KRA",
    items: [
      "Deliver all assigned stores within approved timeline and quality standards.",
      "Average launch timeline ≤ 20 days.",
      "95% projects delivered within timeline.",
    ],
  },
  {
    title: "KPI — Daily",
    items: [
      "Active projects monitored.",
      "Follow-ups completed.",
      "Delays escalated.",
      "Tracker updated.",
    ],
  },
  {
    title: "KPI — Weekly",
    items: ["Projects on schedule.", "Pending issues resolved."],
  },
  {
    title: "KPI — Monthly",
    items: [
      "Number of store openings.",
      "Average project completion days.",
      "Delayed projects %.",
      "Franchise satisfaction score.",
    ],
  },
  {
    title: "What NOT to do",
    items: [
      "Give answers to franchise questions which are not part of the project.",
      "Commit discounts.",
      "Bypass Project Manager and directly assign work to vendors without approval.",
      "Modify agreements.",
      "Discuss profitability.",
      "Handle sales negotiations.",
      "Promise launch date without confirming with concerned department.",
      "Ignore delay beyond 24 hours.",
      "Start work without payment confirmation.",
      "Make commitments not recorded in handover form.",
    ],
  },
  {
    title: "Escalation Matrix",
    items: [
      "A. Payment Issue",
      "B. Location Approval Delay",
      "C. Vendor Delay",
      "D. Machine Dispatch Delay",
      "E. Civil Work Delay",
      "F. Branding Delay",
      "G. Franchise Partner Conflict",
      "H. Special Support Request",
    ],
  },
  {
    title: "A Successful Project Coordinator",
    ordered: true,
    items: [
      "Prevents delays.",
      "Tracks every project daily.",
      "Coordinates all departments.",
      "Communicates proactively.",
      "Solves bottlenecks quickly.",
      "Delivers stores on time.",
    ],
    note: "A successful Project Coordinator does NOT do everyone's work — he ensures everyone's work gets completed on time.",
  },
];

function RolesSection() {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={ShieldCheck}
        title="Roles & Responsibility"
        subtitle="Project Coordinator at Clean Craft — full role charter."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {ROLE_SECTIONS.map((sec) => (
          <Card key={sec.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                {sec.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sec.ordered ? (
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  {sec.items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ol>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {sec.items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              )}
              {sec.note && (
                <div className="text-xs italic text-primary/90 bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
                  {sec.note}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const TASK_GROUPS: { key: string; title: string; items: string[] }[] = [
  {
    key: "agreements",
    title: "A. Agreements",
    items: [
      "Franchise Engagement Agreement (FEA)",
      "Franchise Agreement",
      "Manpower Agreement",
    ],
  },
  {
    key: "branding",
    title: "B. Branding",
    items: ["Sign Board", "Wall Branding", "Coming Soon Banner"],
  },
  {
    key: "printable",
    title: "C. Printable Material",
    items: [
      "Visiting Card",
      "Cash Memo / Book",
      "Cake Design",
      "Invitation Card",
      "Rate List Excel",
      "Flyer for Offline Marketing",
      "Standee (Offer)",
      "Standee (Hiring Manpower)",
    ],
  },
  {
    key: "franchise-bundle",
    title: "D. Franchise Bundle",
    items: [
      "Store Manager Manual",
      "Staff Job Descriptions (PDF)",
      "Letter of Satisfaction (PDF)",
      "Apology Letter (PDF)",
      "Letter of Consent (PDF)",
      "Receiving Letter (PDF)",
      "Offer Letter (PDF)",
      "Laundry Book - Spotless Profit in Laundry (PDF)",
    ],
  },
  {
    key: "essentials",
    title: "E. Essentials",
    items: [
      "Consumables for Franchise",
      "Manpower Accommodation Material",
    ],
  },
  {
    key: "opening-essentials",
    title: "F. Opening Essentials",
    items: [
      "Approval Video of the Manpower Room",
      "Approval Video of Store (Pre-Opening)",
    ],
  },
];

const OPENING_ESSENTIALS_KEY = "opening-essentials";

const PC_TASKS_LS_KEY = "pc.project-tasks.v1";
const PC_META_LS_KEY = "pc.project-meta.v1";

type ProjectStatus = "started" | "ongoing" | "complete";
type ProjectMeta = {
  startDate: string;
  openingDate: string;
  status: ProjectStatus;
  completedAt: string | null;
};

function loadTaskState(): Record<string, Record<string, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PC_TASKS_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadMetaState(): Record<string, ProjectMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PC_META_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function ProjectsStatusSection() {
  const [stores] = useState<StoreRow[]>(() => {
    if (typeof window === "undefined") return STORES_SEED;
    try {
      const raw = window.localStorage.getItem(STORES_LS_KEY);
      return raw ? (JSON.parse(raw) as StoreRow[]) : STORES_SEED;
    } catch {
      return STORES_SEED;
    }
  });

  const [taskState, setTaskState] =
    useState<Record<string, Record<string, boolean>>>(loadTaskState);

  const persist = (next: Record<string, Record<string, boolean>>) => {
    setTaskState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PC_TASKS_LS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  };

  const toggle = (storeId: string, itemKey: string, checked: boolean) => {
    const next = {
      ...taskState,
      [storeId]: { ...(taskState[storeId] ?? {}), [itemKey]: checked },
    };
    persist(next);
  };

  const [metaState, setMetaState] =
    useState<Record<string, ProjectMeta>>(loadMetaState);

  const persistMeta = (next: Record<string, ProjectMeta>) => {
    setMetaState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PC_META_LS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  };

  const getMeta = (storeId: string): ProjectMeta =>
    metaState[storeId] ?? {
      startDate: "",
      openingDate: "",
      status: "started",
      completedAt: null,
    };

  const updateMeta = (storeId: string, patch: Partial<ProjectMeta>) => {
    const current = getMeta(storeId);
    persistMeta({ ...metaState, [storeId]: { ...current, ...patch } });
  };

  const updateStatus = (storeId: string, status: ProjectStatus) => {
    const current = getMeta(storeId);
    const completedAt =
      status === "complete"
        ? current.completedAt ?? new Date().toISOString()
        : null;
    persistMeta({
      ...metaState,
      [storeId]: { ...current, status, completedAt },
    });
  };

  const totalItems = TASK_GROUPS.reduce((n, g) => n + g.items.length, 0);

  // KPIs
  const totalProjects = stores.length;
  const completedCount = stores.filter(
    (s) => getMeta(s.id).status === "complete",
  ).length;
  const inProcess = totalProjects - completedCount;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const openedThisMonth = stores.filter((s) => {
    const m = getMeta(s.id);
    return m.status === "complete" && (m.completedAt ?? "").startsWith(thisMonth);
  }).length;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const expandAll = () =>
    setExpanded(Object.fromEntries(stores.map((s) => [s.id, true])));
  const collapseAll = () => setExpanded({});
  const jumpTo = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: true }));
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById(`project-card-${id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };



  return (
    <div className="space-y-4">
      <SectionHeader
        icon={ClipboardList}
        title="Projects Status"
        subtitle="Daily project activities and live status of every store project."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Projects
            </div>
            <div className="text-3xl font-semibold tabular-nums mt-1">
              {totalProjects}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              In Process
            </div>
            <div className="text-3xl font-semibold tabular-nums mt-1 text-sky-600">
              {inProcess}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Opened This Month
            </div>
            <div className="text-3xl font-semibold tabular-nums mt-1 text-emerald-600">
              {openedThisMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      {stores.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Jump to project:</span>
          <div className="min-w-[240px]">
            <Select onValueChange={jumpTo}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a project…" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" onClick={expandAll}>
            Expand all
          </Button>
          <Button size="sm" variant="outline" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {stores.length === 0 && (
          <Card>
            <CardContent className="p-4 text-xs text-muted-foreground">
              No stores yet. Add stores from the Stores section.
            </CardContent>
          </Card>
        )}

        {stores.map((s) => {
          const pm = PROJECT_MANAGERS.find((p) => p.id === s.pmId);
          const storeChecks = taskState[s.id] ?? {};
          const completed = Object.values(storeChecks).filter(Boolean).length;
          const pct = totalItems ? Math.round((completed / totalItems) * 100) : 0;
          const meta = getMeta(s.id);
          const openingGroup = TASK_GROUPS.find(
            (g) => g.key === OPENING_ESSENTIALS_KEY,
          )!;
          const openingReady = openingGroup.items.every(
            (item) => !!storeChecks[`${OPENING_ESSENTIALS_KEY}:${item}`],
          );
          const statusTone =
            meta.status === "complete"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : meta.status === "ongoing"
                ? "bg-sky-500/15 text-sky-700 dark:text-sky-400"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-400";
          const isOpen = !!expanded[s.id];
          return (
            <Card key={s.id} id={`project-card-${s.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(s.id)}
                    className="flex items-start gap-2 min-w-0 text-left hover:text-primary transition-colors"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Collapse project" : "Expand project"}
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 mt-1 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Partner: {s.partnerName} · {s.partnerPhone}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PM: {pm?.name ?? "Unassigned"}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 flex-1 justify-end min-w-[200px]">
                    {!isOpen && (
                      <div className="flex-1 max-w-[220px] hidden sm:block">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Badge className={cn("capitalize border-transparent", statusTone)}>
                      {meta.status}
                    </Badge>
                    <Badge variant="outline" className="tabular-nums">
                      {completed}/{totalItems} · {pct}%
                    </Badge>
                  </div>
                </div>
                {isOpen && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}

                {isOpen && (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">


                  <div className="space-y-1">
                    <label
                      htmlFor={`${s.id}-start`}
                      className="text-[11px] uppercase tracking-wide text-muted-foreground"
                    >
                      Starting Date
                    </label>
                    <Input
                      id={`${s.id}-start`}
                      type="date"
                      value={meta.startDate}
                      onChange={(e) =>
                        updateMeta(s.id, { startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`${s.id}-open`}
                      className="text-[11px] uppercase tracking-wide text-muted-foreground"
                    >
                      Opening Date
                    </label>
                    <Input
                      id={`${s.id}-open`}
                      type="date"
                      value={meta.openingDate}
                      disabled={!openingReady}
                      title={
                        !openingReady
                          ? "Tick both Opening Essentials videos first"
                          : undefined
                      }
                      onChange={(e) => {
                        if (!openingReady) {
                          toast.error(
                            "Approve both Opening Essentials videos before setting the opening date.",
                          );
                          return;
                        }
                        updateMeta(s.id, { openingDate: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Remarks:</span> You cannot open a
                  store until both Opening Essentials videos (Section F) are
                  approved.
                </div>
                </>
                )}
              </CardHeader>
              {isOpen && (
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {TASK_GROUPS.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <div className="text-sm font-semibold">{group.title}</div>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => {
                        const key = `${group.key}:${item}`;
                        const checked = !!storeChecks[key];
                        const id = `${s.id}-${key}`;
                        return (
                          <li key={key} className="flex items-start gap-2">
                            <Checkbox
                              id={id}
                              checked={checked}
                              onCheckedChange={(v) =>
                                toggle(s.id, key, v === true)
                              }
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={id}
                              className={cn(
                                "text-sm leading-snug cursor-pointer",
                                checked &&
                                  "line-through text-muted-foreground",
                              )}
                            >
                              {item}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                <div className="md:col-span-3 border-t pt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`${s.id}-status`}
                      className="text-[11px] uppercase tracking-wide text-muted-foreground"
                    >
                      Status
                    </label>
                    <Select
                      value={meta.status}
                      onValueChange={(v) => {
                        if (v === "complete" && !openingReady) {
                          toast.error(
                            "Approve both Opening Essentials videos before marking complete.",
                          );
                          return;
                        }
                        updateStatus(s.id, v as ProjectStatus);
                      }}
                    >
                      <SelectTrigger id={`${s.id}-status`} className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="started">Started</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="complete" disabled={!openingReady}>
                          Complete
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {meta.status === "complete" && meta.completedAt && (
                    <div className="text-xs text-muted-foreground">
                      Completed:{" "}
                      <span className="font-medium text-foreground">
                        {formatDateTime(meta.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SopsSection() {
  const sops = [
    { name: "Site Approval SOP", type: "PDF" },
    { name: "Design Approval SOP", type: "PDF" },
    { name: "Civil Work SOP", type: "Doc" },
    { name: "Machine Installation SOP", type: "Doc" },
    { name: "Training & Handover SOP", type: "PDF" },
    { name: "Store Opening Checklist", type: "Sheet" },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={FileText}
        title="SOPs"
        subtitle="Standard operating procedures for every project stage."
      />
      <Card>
        <CardContent className="p-0 divide-y">
          {sops.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3">
              <div className="text-sm font-medium">{s.name}</div>
              <Badge variant="outline">{s.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

