import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Store,
  Megaphone,
  Users,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  CheckCircle2,
  LogOut,
  Pencil,
  Check,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pme")({
  head: () => ({ meta: [{ title: "Performance Marketing — Clean Craft OS" }] }),
  component: PmeDashboard,
});

type CampaignStatus = "running" | "updated" | "pending";
type StoreStatus = "live" | "pending" | "completed";

type StoreRow = { id: string; name: string; influencers: number; status: StoreStatus };
type Influencer = { id: string; name: string; store: string; status: StoreStatus; notes: string };
type TaskRow = { id: string; title: string; due: string; done: boolean };
type Campaigns = {
  google: CampaignStatus;
  meta: CampaignStatus;
  gmb: CampaignStatus;
  influencer: CampaignStatus;
  updatedAt: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const SEED_STORES: StoreRow[] = [
  { id: uid(), name: "Jaipur", influencers: 4, status: "live" },
  { id: uid(), name: "Indore", influencers: 3, status: "live" },
  { id: uid(), name: "Lucknow", influencers: 2, status: "pending" },
  { id: uid(), name: "Surat", influencers: 3, status: "completed" },
  { id: uid(), name: "Mumbai", influencers: 3, status: "live" },
];

const SEED_INFLUENCERS: Influencer[] = [
  { id: uid(), name: "Ananya Sharma", store: "Jaipur", status: "live", notes: "Reel drop this Friday" },
  { id: uid(), name: "Rohan Verma", store: "Indore", status: "pending", notes: "Awaiting contract" },
  { id: uid(), name: "Priya Nair", store: "Surat", status: "completed", notes: "3 reels delivered" },
  { id: uid(), name: "Kabir Singh", store: "Mumbai", status: "live", notes: "Story series live" },
];

const SEED_TASKS: TaskRow[] = [
  { id: uid(), title: "Refresh Google Ads creatives for Jaipur", due: "2026-07-05", done: false },
  { id: uid(), title: "Approve Meta budget for Mumbai", due: "2026-07-03", done: true },
  { id: uid(), title: "Update GMB photos — Indore", due: "2026-07-04", done: false },
  { id: uid(), title: "Onboard 2 nano influencers — Lucknow", due: "2026-07-08", done: false },
];

function statusBadge(s: StoreStatus) {
  if (s === "live")
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium">
        Live
      </span>
    );
  if (s === "completed")
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 font-medium">
        Completed
      </span>
    );
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-medium">
      Pending
    </span>
  );
}

function campaignBadge(s: CampaignStatus) {
  const label = s === "running" ? "Running" : s === "updated" ? "Updated" : "Pending";
  const cls =
    s === "pending"
      ? "bg-amber-500/15 text-amber-600"
      : "bg-emerald-500/15 text-emerald-600";
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function PmeDashboard() {
  const { user, roles, loading, isLeadership } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const [stores, setStores] = useState<StoreRow[]>(SEED_STORES);
  const [influencers, setInfluencers] = useState<Influencer[]>(SEED_INFLUENCERS);
  const [tasks, setTasks] = useState<TaskRow[]>(SEED_TASKS);
  const [campaigns, setCampaigns] = useState<Campaigns>({
    google: "running",
    meta: "running",
    gmb: "updated",
    influencer: "pending",
    updatedAt: new Date().toISOString(),
  });
  const [gmb] = useState({ created: 22, total: 22, reviews: 118, rating: 4.8, pending: 2 });
  const [storesOpen, setStoresOpen] = useState(true);
  const [newStore, setNewStore] = useState("");
  const [newInf, setNewInf] = useState<Partial<Influencer>>({});
  const [newTask, setNewTask] = useState<{ title: string; due: string }>({ title: "", due: "" });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile?.full_name) setNameDraft(profile.full_name);
  }, [profile?.full_name]);

  const derived = useMemo(() => {
    const growing = stores.filter((s) => s.status === "live").length;
    const attention = stores.filter((s) => s.status === "pending").length;
    const done = stores.filter((s) => s.status === "completed").length;
    const declining = Math.max(0, stores.length - growing - attention - done);
    const contacted = influencers.length;
    const live = influencers.filter((i) => i.status === "live").length;
    const pendingInf = influencers.filter((i) => i.status === "pending").length;
    const completedInf = influencers.filter((i) => i.status === "completed").length;
    const assigned = tasks.length;
    const completedT = tasks.filter((t) => t.done).length;
    const pendingT = assigned - completedT;
    const completionPct = assigned ? Math.round((completedT / assigned) * 100) : 0;
    return {
      storePerf: { managed: stores.length, growing, attention, declining },
      inf: { contacted, live, pendingInf, completedInf },
      task: { assigned, completedT, pendingT, completionPct },
    };
  }, [stores, influencers, tasks]);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  const allowed = isLeadership || roles.includes("performance_marketing_executive");
  if (!allowed) return <Navigate to="/dashboard" replace />;

  async function saveName() {
    const next = nameDraft.trim();
    if (!next) return toast.error("Name can't be empty");
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ full_name: next })
      .eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Name updated");
    setEditing(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  function setCampaign(k: keyof Omit<Campaigns, "updatedAt">, v: CampaignStatus) {
    setCampaigns((c) => ({ ...c, [k]: v, updatedAt: new Date().toISOString() }));
  }

  function addStore() {
    if (!newStore.trim()) return;
    setStores((s) => [...s, { id: uid(), name: newStore.trim(), influencers: 0, status: "pending" }]);
    setNewStore("");
  }
  function updateStore(id: string, patch: Partial<StoreRow>) {
    setStores((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeStore(id: string) {
    setStores((s) => s.filter((x) => x.id !== id));
  }

  function addInfluencer() {
    if (!newInf.name || !newInf.store) return toast.error("Name and store required");
    setInfluencers((i) => [
      ...i,
      {
        id: uid(),
        name: newInf.name!,
        store: newInf.store!,
        status: (newInf.status as StoreStatus) ?? "pending",
        notes: newInf.notes ?? "",
      },
    ]);
    setNewInf({});
  }
  function updateInfluencer(id: string, patch: Partial<Influencer>) {
    setInfluencers((i) => i.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeInfluencer(id: string) {
    setInfluencers((i) => i.filter((x) => x.id !== id));
  }

  function addTask() {
    if (!newTask.title.trim()) return;
    setTasks((t) => [...t, { id: uid(), title: newTask.title.trim(), due: newTask.due, done: false }]);
    setNewTask({ title: "", due: "" });
  }
  function toggleTask(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }
  function removeTask(id: string) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  const name = profile?.full_name || user.email || "PME";
  const storeNames = stores.map((s) => s.name);

  return (
    <div className="flex gap-4 min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border rounded-lg p-4 bg-card h-fit sticky top-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
            {initials(name)}
          </div>
          <div className="min-w-0">
            {editing ? (
              <div className="flex items-center gap-1">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-7 text-sm"
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveName}>
                  <Check className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="font-medium truncate">{name}</div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="text-[11px] text-muted-foreground truncate">Performance Marketing</div>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stores</span>
            <span className="font-medium tabular-nums">{stores.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Influencers</span>
            <span className="font-medium tabular-nums">{influencers.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tasks Done</span>
            <span className="font-medium tabular-nums">
              {derived.task.completedT}/{derived.task.assigned}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-4" onClick={logout}>
          <LogOut className="w-3.5 h-3.5 mr-2" /> Logout
        </Button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Performance Marketing</h1>
            <p className="text-sm text-muted-foreground">
              Manage stores, campaigns, influencers, and tasks.
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="stores">
              <Store className="w-4 h-4 mr-1.5" /> My Stores
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Megaphone className="w-4 h-4 mr-1.5" /> Campaigns
            </TabsTrigger>
            <TabsTrigger value="influencers">
              <Users className="w-4 h-4 mr-1.5" /> Influencers
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardList className="w-4 h-4 mr-1.5" /> My Tasks
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="w-4 h-4 mr-1.5" /> Performance
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" /> Store Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Stores Managed" value={derived.storePerf.managed} />
                  <Stat
                    label="Growing"
                    value={derived.storePerf.growing}
                    tone="emerald"
                    icon={<TrendingUp className="w-3.5 h-3.5" />}
                  />
                  <Stat
                    label="Need Attention"
                    value={derived.storePerf.attention}
                    tone="amber"
                    icon={<Minus className="w-3.5 h-3.5" />}
                  />
                  <Stat
                    label="Declining"
                    value={derived.storePerf.declining}
                    tone="red"
                    icon={<TrendingDown className="w-3.5 h-3.5" />}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" /> Campaign Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(["google", "meta", "gmb", "influencer"] as const).map((k) => (
                    <div key={k} className="border rounded-md p-3 bg-muted/20">
                      <div className="text-xs text-muted-foreground uppercase">{k === "gmb" ? "GMB" : k}</div>
                      <div className="mt-1">{campaignBadge(campaigns[k])}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Influencers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Contacted" value={derived.inf.contacted} />
                  <Stat label="Live" value={derived.inf.live} tone="emerald" />
                  <Stat label="Pending" value={derived.inf.pendingInf} tone="amber" />
                  <Stat label="Completed" value={derived.inf.completedInf} tone="sky" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" /> Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Assigned" value={derived.task.assigned} />
                  <Stat label="Completed" value={derived.task.completedT} tone="emerald" />
                  <Stat label="Pending" value={derived.task.pendingT} tone="amber" />
                  <Stat label="Completion" value={`${derived.task.completionPct}%`} tone="sky" />
                </div>
                <Progress value={derived.task.completionPct} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> GMB Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat
                    label="Profiles"
                    value={`${gmb.created}/${gmb.total}`}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  />
                  <Stat label="Reviews" value={gmb.reviews} />
                  <Stat label="Rating" value={gmb.rating} tone="emerald" />
                  <Stat label="Pending" value={gmb.pending} tone="amber" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STORES */}
          <TabsContent value="stores">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" /> My Stores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add store name"
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                  />
                  <Button onClick={addStore}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <button
                  onClick={() => setStoresOpen((v) => !v)}
                  className="w-full flex items-center justify-between border rounded-md p-3 bg-muted/20 hover:bg-muted/40 text-sm"
                >
                  <span className="font-medium">Assigned Stores ({stores.length})</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${storesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {storesOpen && (
                  <div className="border rounded-md divide-y">
                    {stores.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 p-3 flex-wrap">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <Input
                          value={s.name}
                          onChange={(e) => updateStore(s.id, { name: e.target.value })}
                          className="h-8 w-40"
                        />
                        <Input
                          type="number"
                          min={0}
                          value={s.influencers}
                          onChange={(e) =>
                            updateStore(s.id, { influencers: Number(e.target.value) || 0 })
                          }
                          className="h-8 w-24"
                        />
                        <Select
                          value={s.status}
                          onValueChange={(v) => updateStore(s.id, { status: v as StoreStatus })}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        {statusBadge(s.status)}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-auto text-destructive"
                          onClick={() => removeStore(s.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {stores.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No stores yet.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAMPAIGNS */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" /> Campaigns
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Last updated {new Date(campaigns.updatedAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { k: "google", label: "Google Ads" },
                      { k: "meta", label: "Meta Ads" },
                      { k: "gmb", label: "GMB" },
                      { k: "influencer", label: "Influencer" },
                    ] as const
                  ).map(({ k, label }) => (
                    <div key={k} className="border rounded-md p-4 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{label}</div>
                        {campaignBadge(campaigns[k])}
                      </div>
                      <Select
                        value={campaigns[k]}
                        onValueChange={(v) => setCampaign(k, v as CampaignStatus)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="updated">Updated</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INFLUENCERS */}
          <TabsContent value="influencers">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Influencers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Input
                    placeholder="Name"
                    value={newInf.name ?? ""}
                    onChange={(e) => setNewInf({ ...newInf, name: e.target.value })}
                  />
                  <Select
                    value={newInf.store ?? ""}
                    onValueChange={(v) => setNewInf({ ...newInf, store: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Store" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeNames.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={newInf.status ?? "pending"}
                    onValueChange={(v) => setNewInf({ ...newInf, status: v as StoreStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Notes"
                    value={newInf.notes ?? ""}
                    onChange={(e) => setNewInf({ ...newInf, notes: e.target.value })}
                  />
                  <Button onClick={addInfluencer}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="border rounded-md divide-y">
                  {influencers.map((i) => (
                    <div key={i.id} className="flex items-center gap-2 p-3 flex-wrap">
                      <Input
                        value={i.name}
                        onChange={(e) => updateInfluencer(i.id, { name: e.target.value })}
                        className="h-8 w-40"
                      />
                      <Select
                        value={i.store}
                        onValueChange={(v) => updateInfluencer(i.id, { store: v })}
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {storeNames.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={i.status}
                        onValueChange={(v) => updateInfluencer(i.id, { status: v as StoreStatus })}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={i.notes}
                        onChange={(e) => updateInfluencer(i.id, { notes: e.target.value })}
                        className="h-8 flex-1 min-w-[160px]"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeInfluencer(i.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {influencers.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No influencers yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TASKS */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" /> My Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="flex-1 min-w-[200px]"
                  />
                  <Input
                    type="date"
                    value={newTask.due}
                    onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                    className="w-44"
                  />
                  <Button onClick={addTask}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="border rounded-md divide-y">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTask(t.id)}
                        className="w-4 h-4"
                      />
                      <div className={`flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>
                        <div className="text-sm font-medium">{t.title}</div>
                        {t.due && (
                          <div className="text-[11px] text-muted-foreground">Due {t.due}</div>
                        )}
                      </div>
                      <Badge variant={t.done ? "secondary" : "outline"} className="text-[11px]">
                        {t.done ? "Done" : "Pending"}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeTask(t.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground text-center">No tasks.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERFORMANCE */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> My Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat
                    label="Task Completion"
                    value={`${derived.task.completionPct}%`}
                    tone="emerald"
                  />
                  <Stat label="Live Stores" value={derived.storePerf.growing} tone="emerald" />
                  <Stat label="Attention" value={derived.storePerf.attention} tone="amber" />
                  <Stat label="Reviews" value={gmb.reviews} tone="sky" />
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground mb-1">Overall</div>
                  <Progress value={derived.task.completionPct} />
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground mb-2">
                    Stores Needing Attention
                  </div>
                  {stores.filter((s) => s.status === "pending").length === 0 ? (
                    <div className="text-sm text-muted-foreground">Everything on track ✨</div>
                  ) : (
                    <div className="space-y-1.5">
                      {stores
                        .filter((s) => s.status === "pending")
                        .map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-sm border rounded-md p-2 bg-amber-500/5"
                          >
                            <span>{s.name}</span>
                            {statusBadge(s.status)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone?: "emerald" | "amber" | "red" | "sky";
  icon?: React.ReactNode;
}) {
  const toneCls =
    tone === "emerald"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
      : tone === "amber"
        ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
        : tone === "red"
          ? "bg-red-500/10 border-red-500/30 text-red-600"
          : tone === "sky"
            ? "bg-sky-500/10 border-sky-500/30 text-sky-600"
            : "bg-muted/30";
  return (
    <div className={`border rounded-md p-3 ${toneCls}`}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}
