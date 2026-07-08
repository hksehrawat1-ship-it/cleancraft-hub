import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
} from "lucide-react";
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

const makeStore = (name: string): Store => ({
  id: `${name}-${Math.random().toString(36).slice(2, 7)}`,
  name,
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
  makeStore("Pune 2"),
  makeStore("Mathura"),
  makeStore("New Raipur"),
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

// ---------- Component ----------
function ProjectManagerDashboard() {
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_STORES[0].id);
  const [newStoreName, setNewStoreName] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const selected = useMemo(() => stores.find((s) => s.id === selectedId) ?? stores[0], [stores, selectedId]);

  function updateStore(updater: (s: Store) => Store) {
    setStores((prev) => prev.map((s) => (s.id === selected.id ? updater(s) : s)));
  }

  function toggleSimple(key: "introCall" | "firstVisit" | "machineOrder" | "engineerAligned") {
    updateStore((s) => {
      const item = s[key];
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
    const s = makeStore(name);
    setStores((prev) => [...prev, s]);
    setSelectedId(s.id);
    setNewStoreName("");
    setAddOpen(false);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add Store</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add new store</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label>Store / Place name</Label>
              <Input
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="e.g. Nashik"
                onKeyDown={(e) => e.key === "Enter" && addStore()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={addStore}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
          />

          {/* B. First Visit */}
          <SimpleCheckRow
            label="B. First Visit"
            item={selected.firstVisit}
            onToggle={() => toggleSimple("firstVisit")}
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
    </div>
  );
}

// ---------- Row components ----------
function SimpleCheckRow({
  label,
  item,
  onToggle,
}: {
  label: string;
  item: CheckItem;
  onToggle: () => void;
}) {
  return (
    <div className="border rounded-lg p-3 bg-muted/10 flex items-center justify-between flex-wrap gap-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={item.done} onCheckedChange={onToggle} />
        <span className="font-medium">{label}</span>
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
