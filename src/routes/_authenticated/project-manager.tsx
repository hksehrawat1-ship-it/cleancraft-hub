import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  HardHat,
  MapPin,
  Plus,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Store as StoreIcon,
  Brain,
  Inbox,
  BookOpen,
  TrendingUp,
  FileText,
  Link as LinkIcon,
  Download,
  Wallet,
  Utensils,
  BedDouble,
  Car,
  Upload,
  AlertTriangle,
  Phone,
  User as UserIcon,

} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/project-manager")({
  head: () => ({
    meta: [
      { title: "Project Manager — Clean Craft OS" },
      { name: "description", content: "Project Manager dashboard for store setup." },
    ],
  }),
  component: ProjectManagerDashboard,
});

// ---------- Types ----------
type CheckItem = { id: string; label: string; done: boolean; at?: string };

type SubStage = {
  id: string;
  label: string;
  items: CheckItem[];
  submitted?: boolean;
};

type Store = {
  id: string;
  name: string;
  franchiseName: string;
  franchisePhone: string;
  // Simple boolean checkboxes with timestamps
  introCall: CheckItem;
  firstVisit: CheckItem;
  // Stages with sub-checklists
  shopApproval: SubStage;
  infraWork: SubStage;
  electric: SubStage;
  plumber: SubStage;
  carpenter: SubStage;
  painter: SubStage;
  // Simple checkboxes
  machineOrder: CheckItem;
  engineerAligned: CheckItem;
  // Opening date
  openingDate?: string; // ISO
};

// ---------- Defaults ----------
const nowStamp = () => new Date().toLocaleString();

const mkItem = (id: string, label: string): CheckItem => ({ id, label, done: false });

const defaultShopApproval = (): SubStage => ({
  id: "shop-approval",
  label: "Shop Approval",
  items: [
    mkItem("sa-agreement", "Shop agreement done"),
    mkItem("sa-noc", "Society / Landlord NOC"),
    mkItem("sa-measurement", "Site measurement taken"),
    mkItem("sa-photos", "Site photos uploaded"),
    mkItem("sa-legal", "Legal verification of documents"),
  ],
});

const defaultInfra = (): SubStage => ({
  id: "infra",
  label: "Infra Work",
  items: [
    mkItem("in-demolition", "Demolition / clearing"),
    mkItem("in-flooring", "Flooring done"),
    mkItem("in-ceiling", "False ceiling"),
    mkItem("in-signage", "Signage frame installed"),
  ],
});

const defaultElectric = (): SubStage => ({
  id: "electric",
  label: "Electric Task",
  items: [
    mkItem("el-load", "Load sanction approved"),
    mkItem("el-wiring", "Internal wiring complete"),
    mkItem("el-panel", "Main panel installed"),
    mkItem("el-lights", "Lights & fixtures installed"),
    mkItem("el-meter", "Meter connection active"),
  ],
});

const defaultPlumber = (): SubStage => ({
  id: "plumber",
  label: "Plumber Task",
  items: [
    mkItem("pl-inlet", "Water inlet line laid"),
    mkItem("pl-drain", "Drainage line laid"),
    mkItem("pl-tank", "Overhead tank installed"),
    mkItem("pl-fittings", "Sanitary fittings installed"),
  ],
});

const defaultCarpenter = (): SubStage => ({
  id: "carpenter",
  label: "Carpenter Task",
  items: [
    mkItem("cp-counter", "Reception counter built"),
    mkItem("cp-storage", "Storage cabinets built"),
    mkItem("cp-partition", "Partitions installed"),
    mkItem("cp-doors", "Doors & frames fitted"),
  ],
});

const defaultPainter = (): SubStage => ({
  id: "painter",
  label: "Painter Task",
  items: [
    mkItem("pt-primer", "Primer coat applied"),
    mkItem("pt-base", "Base coat applied"),
    mkItem("pt-final", "Final coat applied"),
    mkItem("pt-branding", "Brand colors & wall graphics"),
  ],
});

const makeStore = (
  name: string,
  franchiseName = "",
  franchisePhone = ""
): Store => ({
  id: `${name}-${Math.random().toString(36).slice(2, 7)}`,
  name,
  franchiseName,
  franchisePhone,
  introCall: mkItem("intro", "Introduction call done"),
  firstVisit: mkItem("first-visit", "First Visit"),
  shopApproval: defaultShopApproval(),
  infraWork: defaultInfra(),
  electric: defaultElectric(),
  plumber: defaultPlumber(),
  carpenter: defaultCarpenter(),
  painter: defaultPainter(),
  machineOrder: mkItem("machine-order", "Machine order"),
  engineerAligned: mkItem("engineer-aligned", "Engineer aligned"),
});

const INITIAL_STORES: Store[] = [
  makeStore("Pune 2", "Rahul Deshpande", "+91 98220 41567"),
  makeStore("Mathura", "Anil Agarwal", "+91 99105 33421"),
  makeStore("New Raipur", "Suresh Chaturvedi", "+91 90090 27834"),
];

// ---------- Helpers ----------
function stageProgress(s: SubStage) {
  const total = s.items.length;
  const done = s.items.filter((i) => i.done).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function storeProgress(store: Store) {
  const stages = [
    store.shopApproval,
    store.infraWork,
    store.electric,
    store.plumber,
    store.carpenter,
    store.painter,
  ];
  const subTotal = stages.reduce((a, s) => a + s.items.length, 0);
  const subDone = stages.reduce((a, s) => a + s.items.filter((i) => i.done).length, 0);
  const simple = [store.introCall, store.firstVisit, store.machineOrder, store.engineerAligned];
  const simpleDone = simple.filter((i) => i.done).length;
  const total = subTotal + simple.length + 1; // +1 for opening date
  const done = subDone + simpleDone + (store.openingDate ? 1 : 0);
  return Math.round((done / total) * 100);
}

// ---------- Side nav ----------
type SectionKey = "stores" | "mind" | "pc-tasks" | "expenses" | "resources" | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "stores", label: "Stores", icon: StoreIcon },
  { key: "mind", label: "Mind & Tasks", icon: Brain },
  { key: "pc-tasks", label: "Tasks Assigned By P.C", icon: Inbox },
  { key: "expenses", label: "Expense Sheet", icon: Wallet },
  { key: "resources", label: "Resources", icon: BookOpen },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

// ---------- Component ----------
function ProjectManagerDashboard() {
  const [section, setSection] = useState<SectionKey>("stores");
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_STORES[0].id);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreFranchise, setNewStoreFranchise] = useState("");
  const [newStorePhone, setNewStorePhone] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const selected = useMemo(() => stores.find((s) => s.id === selectedId) ?? stores[0], [stores, selectedId]);

  function updateStore(updater: (s: Store) => Store) {
    setStores((prev) => prev.map((s) => (s.id === selected.id ? updater(s) : s)));
  }

  function toggleSimple(key: "introCall" | "firstVisit" | "machineOrder" | "engineerAligned") {
    updateStore((s) => {
      const item = s[key];
      // Intro call and first visit are one-way: cannot be undone once ticked
      if ((key === "introCall" || key === "firstVisit") && item.done) return s;
      const done = !item.done;
      return { ...s, [key]: { ...item, done, at: done ? nowStamp() : undefined } } as Store;
    });
  }

  function toggleSubItem(stageKey: keyof Store, itemId: string) {
    updateStore((s) => {
      const stage = s[stageKey] as SubStage;
      const items = stage.items.map((i) =>
        i.id === itemId ? { ...i, done: !i.done, at: !i.done ? nowStamp() : undefined } : i
      );
      return { ...s, [stageKey]: { ...stage, items, submitted: false } } as Store;
    });
  }

  function submitStage(stageKey: keyof Store) {
    updateStore((s) => {
      const stage = s[stageKey] as SubStage;
      return { ...s, [stageKey]: { ...stage, submitted: true } } as Store;
    });
  }

  function addStore() {
    const name = newStoreName.trim();
    if (!name) return;
    const s = makeStore(name, newStoreFranchise.trim(), newStorePhone.trim());
    setStores((prev) => [...prev, s]);
    setSelectedId(s.id);
    setNewStoreName("");
    setNewStoreFranchise("");
    setNewStorePhone("");
    setAddOpen(false);
  }

  const header = (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <HardHat className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Project Manager</h1>
          <p className="text-sm text-muted-foreground">
            Track store setup end-to-end — from introduction call to opening day.
          </p>
        </div>
      </div>
      {section === "stores" && (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add Store</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add new store</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Store / Place name</Label>
                <Input
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Nashik"
                  onKeyDown={(e) => e.key === "Enter" && addStore()}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Franchise name</Label>
                <Input
                  value={newStoreFranchise}
                  onChange={(e) => setNewStoreFranchise(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Franchise phone</Label>
                <Input
                  value={newStorePhone}
                  onChange={(e) => setNewStorePhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  type="tel"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={addStore}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      {/* Side menu */}
      <aside className="md:sticky md:top-4 md:self-start">
        <Card>
          <CardContent className="p-2">
            <nav className="flex md:flex-col gap-1 overflow-x-auto">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = n.key === section;
                return (
                  <button
                    key={n.key}
                    onClick={() => setSection(n.key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left w-full whitespace-nowrap transition-colors",
                      active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{n.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Main content */}
      <div className="space-y-6 min-w-0">
        {header}
        {section === "stores" && <StoresSection />}
        {section === "mind" && <MindTasksSection />}
        {section === "pc-tasks" && <PCTasksSection />}
        {section === "expenses" && <ExpenseSheetSection stores={stores} />}
        {section === "resources" && <ResourcesSection />}
        {section === "performance" && <PerformanceSection stores={stores} />}
      </div>
    </div>
  );

  function StoresSection() {
    return (
      <>


      {/* Store selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {stores.map((s) => {
          const active = s.id === selected.id;
          const pct = storeProgress(s);
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "text-left border rounded-lg p-3 transition-colors",
                active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div className="font-medium truncate">{s.name}</div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="text-[11px] tabular-nums text-muted-foreground">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected store detail */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {selected.name} — Setup Checklist
            </CardTitle>
            <Badge variant="outline">{storeProgress(selected)}% complete</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* A. Intro call */}
          <SimpleCheckRow
            label="A. Introduction call done"
            item={selected.introCall}
            onToggle={() => toggleSimple("introCall")}
            lockOnceDone
          />

          {/* B. First Visit */}
          <SimpleCheckRow
            label="B. First Visit"
            item={selected.firstVisit}
            onToggle={() => toggleSimple("firstVisit")}
            lockOnceDone
          />


          {/* 1. Shop Approval */}
          <StageBlock
            index="1"
            stage={selected.shopApproval}
            onToggleItem={(id) => toggleSubItem("shopApproval", id)}
            onSubmit={() => submitStage("shopApproval")}
          />

          {/* 2. Infra */}
          <StageBlock
            index="2"
            stage={selected.infraWork}
            onToggleItem={(id) => toggleSubItem("infraWork", id)}
            onSubmit={() => submitStage("infraWork")}
          />

          {/* 3. Electric */}
          <StageBlock
            index="3"
            stage={selected.electric}
            onToggleItem={(id) => toggleSubItem("electric", id)}
            onSubmit={() => submitStage("electric")}
          />

          {/* 4. Plumber */}
          <StageBlock
            index="4"
            stage={selected.plumber}
            onToggleItem={(id) => toggleSubItem("plumber", id)}
            onSubmit={() => submitStage("plumber")}
          />

          {/* 5. Carpenter */}
          <StageBlock
            index="5"
            stage={selected.carpenter}
            onToggleItem={(id) => toggleSubItem("carpenter", id)}
            onSubmit={() => submitStage("carpenter")}
          />

          {/* 6. Painter */}
          <StageBlock
            index="6"
            stage={selected.painter}
            onToggleItem={(id) => toggleSubItem("painter", id)}
            onSubmit={() => submitStage("painter")}
          />

          {/* 7. Machine order */}
          <SimpleCheckRow
            label="7. Machine order"
            item={selected.machineOrder}
            onToggle={() => toggleSimple("machineOrder")}
          />

          {/* 8. Engineer aligned */}
          <SimpleCheckRow
            label="8. Engineer aligned"
            item={selected.engineerAligned}
            onToggle={() => toggleSimple("engineerAligned")}
          />

          {/* 9. Opening tentative date */}
          <div className="border rounded-lg p-3 bg-muted/10 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <div className="font-medium">9. Opening tentative date</div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selected.openingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selected.openingDate
                    ? format(new Date(selected.openingDate), "PPP")
                    : "Pick opening date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selected.openingDate ? new Date(selected.openingDate) : undefined}
                  onSelect={(d) =>
                    updateStore((s) => ({ ...s, openingDate: d ? d.toISOString() : undefined }))
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
      </>
    );
  }
}

// ---------- Mind & Tasks ----------
type MindTask = { id: string; text: string; done: boolean; at: string };
function MindTasksSection() {
  const [tasks, setTasks] = useState<MindTask[]>([
    { id: "m1", text: "Call vendor for signage quote — Pune 2", done: false, at: nowStamp() },
    { id: "m2", text: "Review Mathura civil work photos", done: false, at: nowStamp() },
    { id: "m3", text: "Confirm engineer travel to New Raipur", done: true, at: nowStamp() },
  ]);
  const [input, setInput] = useState("");

  function add() {
    const t = input.trim();
    if (!t) return;
    setTasks((p) => [{ id: Math.random().toString(36).slice(2), text: t, done: false, at: nowStamp() }, ...p]);
    setInput("");
  }
  function toggle(id: string) {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Mind & Tasks
        </CardTitle>
        <p className="text-xs text-muted-foreground">Personal task list — capture what's on your mind.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task…"
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="border rounded-md p-2 bg-muted/10 flex items-center gap-3">
              <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
              <span className={cn("text-sm flex-1", t.done && "line-through text-muted-foreground")}>{t.text}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{t.at}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Tasks Assigned By P.C ----------
type PCTask = {
  id: string;
  title: string;
  store: string;
  assignedBy: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  status: "open" | "in_progress" | "done";
};
function PCTasksSection() {
  const [tasks, setTasks] = useState<PCTask[]>([
    { id: "p1", title: "Submit shop agreement copy to legal", store: "Pune 2", assignedBy: "Ananya (P.C.)", due: "12 Jul 2026", priority: "High", status: "open" },
    { id: "p2", title: "Share civil work photos of Day 3", store: "Mathura", assignedBy: "Ananya (P.C.)", due: "10 Jul 2026", priority: "Medium", status: "in_progress" },
    { id: "p3", title: "Confirm machine delivery slot", store: "New Raipur", assignedBy: "Ananya (P.C.)", due: "15 Jul 2026", priority: "High", status: "open" },
    { id: "p4", title: "Update opening tentative date", store: "Pune 2", assignedBy: "Ananya (P.C.)", due: "09 Jul 2026", priority: "Low", status: "done" },
  ]);

  function setStatus(id: string, status: PCTask["status"]) {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, status } : t)));
  }
  const badgeFor = (s: PCTask["status"]) =>
    s === "done" ? "bg-emerald-600" : s === "in_progress" ? "bg-sky-600" : "bg-amber-600";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" /> Tasks Assigned By P.C
        </CardTitle>
        <p className="text-xs text-muted-foreground">Tasks pushed by your Project Coordinator.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((t) => (
          <div key={t.id} className="border rounded-lg p-3 bg-muted/10 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">
                  {t.store} · By {t.assignedBy} · Due {t.due}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "default" : "secondary"}>
                  {t.priority}
                </Badge>
                <Badge className={cn("text-white", badgeFor(t.status))}>{t.status.replace("_", " ")}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "in_progress")} disabled={t.status === "in_progress"}>
                In Progress
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setStatus(t.id, "done")} disabled={t.status === "done"}>
                Mark Done
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Resources ----------
function ResourcesSection() {
  const files = [
    { name: "Store Setup Playbook.pdf", type: "PDF", size: "2.4 MB" },
    { name: "Vendor Master List.xlsx", type: "Excel", size: "180 KB" },
    { name: "Electric Load Application Template.docx", type: "Word", size: "42 KB" },
    { name: "Site Measurement Sheet.pdf", type: "PDF", size: "120 KB" },
  ];
  const links = [
    { label: "Brand Guidelines", url: "#" },
    { label: "Signage Vendor Portal", url: "#" },
    { label: "Machine Order Form", url: "#" },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {files.map((f) => (
            <div key={f.name} className="border rounded-md p-2 bg-muted/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground">{f.type} · {f.size}</div>
                </div>
              </div>
              <Button size="sm" variant="outline"><Download className="w-3.5 h-3.5 mr-1" /> Download</Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" /> Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {links.map((l) => (
            <a key={l.label} href={l.url} className="border rounded-md p-3 bg-muted/10 hover:bg-muted/30 text-sm font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" /> {l.label}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Performance ----------
function PerformanceSection({ stores }: { stores: Store[] }) {
  const avg = stores.length
    ? Math.round(stores.reduce((a, s) => a + storeProgress(s), 0) / stores.length)
    : 0;
  const opened = stores.filter((s) => storeProgress(s) === 100).length;
  const inProgress = stores.length - opened;

  const kpis = [
    { label: "Stores Assigned", value: stores.length, tone: "text-primary" },
    { label: "Completed", value: opened, tone: "text-emerald-600" },
    { label: "In Progress", value: inProgress, tone: "text-sky-600" },
    { label: "Avg. Readiness", value: `${avg}%`, tone: "text-amber-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
              <div className={cn("text-2xl font-semibold tabular-nums mt-1", k.tone)}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Store Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stores.map((s) => {
            const pct = storeProgress(s);
            return (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Notes to CEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={4} placeholder="Weekly highlights, blockers, escalations…" />
          <div className="flex justify-end mt-2">
            <Button size="sm">Save Note</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// ---------- Row components ----------
function SimpleCheckRow({
  label,
  item,
  onToggle,
  lockOnceDone,
}: {
  label: string;
  item: CheckItem;
  onToggle: () => void;
  lockOnceDone?: boolean;
}) {
  const locked = !!lockOnceDone && item.done;
  return (
    <div className="border rounded-lg p-3 bg-muted/10 flex items-center justify-between flex-wrap gap-3">
      <label className={cn("flex items-center gap-3", locked ? "cursor-not-allowed" : "cursor-pointer")}>
        <Checkbox
          checked={item.done}
          disabled={locked}
          onCheckedChange={() => { if (!locked) onToggle(); }}
        />
        <span className="font-medium">{label}</span>
        {locked && (
          <span className="text-[11px] text-muted-foreground">(locked)</span>
        )}
      </label>
      {item.done && item.at && (
        <div className="flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="tabular-nums">{item.at}</span>
        </div>
      )}
    </div>
  );
}


function StageBlock({
  index,
  stage,
  onToggleItem,
  onSubmit,
}: {
  index: string;
  stage: SubStage;
  onToggleItem: (id: string) => void;
  onSubmit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { done, total, pct } = stageProgress(stage);
  const allDone = done === total && total > 0;

  return (
    <div className="border rounded-lg bg-muted/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 gap-3"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? <ChevronLeft className="w-4 h-4 rotate-[-90deg]" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-medium truncate">{index}. {stage.label}</span>
          {stage.submitted && (
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Submitted</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">{done}/{total}</span>
          <div className="w-24"><Progress value={pct} className="h-1.5" /></div>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {stage.items.map((it, idx) => (
            <div
              key={it.id}
              className="flex items-center justify-between gap-3 border rounded-md p-2 bg-background"
            >
              <label className="flex items-center gap-2 cursor-pointer min-w-0">
                <Checkbox checked={it.done} onCheckedChange={() => onToggleItem(it.id)} />
                <span className="text-sm truncate">
                  {index}.{idx + 1} {it.label}
                </span>
              </label>
              {it.done && it.at && (
                <span className="text-[11px] text-emerald-600 tabular-nums shrink-0">{it.at}</span>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={onSubmit}
              disabled={!allDone || stage.submitted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {stage.submitted ? "Submitted" : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Expense Sheet ----------
type ExpenseCat = "food" | "accommodation" | "transportation";
type ExpenseEntry = {
  id: string;
  storeId: string;
  storeName: string;
  category: ExpenseCat;
  date: string; // YYYY-MM-DD
  amount: number;
  note?: string;
  proofName?: string;
  createdAt: string;
};

const CAT_META: { key: ExpenseCat; label: string; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { key: "food", label: "Food", icon: Utensils, tone: "text-amber-600" },
  { key: "accommodation", label: "Accommodation", icon: BedDouble, tone: "text-sky-600" },
  { key: "transportation", label: "Transportation", icon: Car, tone: "text-emerald-600" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

function ExpenseSheetSection({ stores }: { stores: Store[] }) {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reminder pop-up: after 9 PM local, if any store has no entry for today
  const today = todayStr();
  const missingStores = useMemo(() => {
    return stores.filter(
      (s) => !entries.some((e) => e.storeId === s.id && e.date === today)
    );
  }, [stores, entries, today]);

  // Check every minute after 21:00; also fire immediately when component mounts past 9 PM
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const afterNine = now.getHours() >= 21;
  useEffect(() => {
    if (afterNine && missingStores.length > 0 && !dismissed) {
      setReminderOpen(true);
    }
  }, [afterNine, missingStores.length, dismissed]);

  const totalToday = entries
    .filter((e) => e.date === today)
    .reduce((a, e) => a + e.amount, 0);

  function addEntry(entry: Omit<ExpenseEntry, "id" | "createdAt">) {
    setEntries((p) => [
      { ...entry, id: Math.random().toString(36).slice(2), createdAt: nowStamp() },
      ...p,
    ]);
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Today's Spend</div>
            <div className="text-2xl font-semibold tabular-nums mt-1">₹{totalToday.toLocaleString("en-IN")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Entries Today</div>
            <div className="text-2xl font-semibold tabular-nums mt-1">
              {entries.filter((e) => e.date === today).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Stores Pending Today</div>
            <div className={cn("text-2xl font-semibold tabular-nums mt-1", missingStores.length ? "text-red-600" : "text-emerald-600")}>
              {missingStores.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Reminder Time</div>
            <div className="text-2xl font-semibold tabular-nums mt-1">9:00 PM</div>
          </CardContent>
        </Card>
      </div>

      {/* Per-project (store) blocks */}
      {stores.map((s) => {
        const storeEntries = entries.filter((e) => e.storeId === s.id);
        const todays = storeEntries.filter((e) => e.date === today);
        const totals: Record<ExpenseCat, number> = {
          food: 0,
          accommodation: 0,
          transportation: 0,
        };
        storeEntries.forEach((e) => {
          totals[e.category] += e.amount;
        });
        return (
          <Card key={s.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {s.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {todays.length === 0 ? (
                    <Badge variant="destructive">Not updated today</Badge>
                  ) : (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                      {todays.length} entry{todays.length > 1 ? "s" : ""} today
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Category totals */}
              <div className="grid grid-cols-3 gap-2">
                {CAT_META.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.key} className="border rounded-md p-2 bg-muted/10">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("w-3.5 h-3.5", c.tone)} />
                        <span className="text-[11px] text-muted-foreground">{c.label}</span>
                      </div>
                      <div className="text-lg font-semibold tabular-nums mt-0.5">
                        ₹{totals[c.key].toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add entry row */}
              <ExpenseAddRow
                onAdd={(cat, amount, note, proofName) =>
                  addEntry({
                    storeId: s.id,
                    storeName: s.name,
                    category: cat,
                    date: today,
                    amount,
                    note,
                    proofName,
                  })
                }
              />

              {/* Recent entries */}
              {storeEntries.length > 0 && (
                <div className="border rounded-md divide-y">
                  {storeEntries.slice(0, 5).map((e) => {
                    const meta = CAT_META.find((c) => c.key === e.category)!;
                    const Icon = meta.icon;
                    return (
                      <div key={e.id} className="p-2 flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={cn("w-4 h-4", meta.tone)} />
                          <div className="min-w-0">
                            <div className="truncate">
                              <span className="font-medium">₹{e.amount.toLocaleString("en-IN")}</span>
                              <span className="text-muted-foreground"> · {meta.label} · {e.date}</span>
                            </div>
                            {(e.note || e.proofName) && (
                              <div className="text-[11px] text-muted-foreground truncate">
                                {e.note}{e.note && e.proofName ? " · " : ""}
                                {e.proofName && <span className="inline-flex items-center gap-1"><Upload className="w-3 h-3" />{e.proofName}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* 9 PM Reminder pop-up */}
      <Dialog open={reminderOpen} onOpenChange={(o) => { setReminderOpen(o); if (!o) setDismissed(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Expense reminder
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <p>It's past 9:00 PM and today's expenses aren't logged for:</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              {missingStores.map((s) => <li key={s.id}>{s.name}</li>)}
            </ul>
            <p className="text-xs text-muted-foreground">Please update Food, Accommodation, and Transportation with proof.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReminderOpen(false); setDismissed(true); }}>
              Remind me later
            </Button>
            <Button onClick={() => { setReminderOpen(false); setDismissed(true); }}>
              Log now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExpenseAddRow({
  onAdd,
}: {
  onAdd: (cat: ExpenseCat, amount: number, note: string, proofName?: string) => void;
}) {
  const [cat, setCat] = useState<ExpenseCat>("food");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [proofName, setProofName] = useState<string | undefined>(undefined);

  function submit() {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    onAdd(cat, amt, note.trim(), proofName);
    setAmount("");
    setNote("");
    setProofName(undefined);
  }

  return (
    <div className="border rounded-md p-2 bg-background grid grid-cols-1 md:grid-cols-[140px_120px_1fr_auto_auto] gap-2 items-center">
      <select
        value={cat}
        onChange={(e) => setCat(e.target.value as ExpenseCat)}
        className="h-9 rounded-md border bg-background px-2 text-sm"
      >
        {CAT_META.map((c) => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="Amount ₹"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Input
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <label className="inline-flex items-center gap-1.5 text-xs px-2 py-2 border rounded-md cursor-pointer hover:bg-muted/50 whitespace-nowrap">
        <Upload className="w-3.5 h-3.5" />
        {proofName ? "Change proof" : "Upload proof"}
        <input
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={(e) => setProofName(e.target.files?.[0]?.name)}
        />
      </label>
      <Button size="sm" onClick={submit} disabled={!amount}>
        <Plus className="w-4 h-4 mr-1" /> Add
      </Button>
    </div>
  );
}

