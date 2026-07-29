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
  critical: number; // urgent flags
  lastVisit: string;
  flags: string[]; // e.g. "Machine down", "Manpower short"
};

const CITY_POOL = [
  "Jaipur", "Indore", "Lucknow", "Surat", "Nagpur", "Kanpur", "Pune", "Bhopal",
  "Patna", "Ranchi", "Agra", "Varanasi", "Meerut", "Jodhpur", "Raipur", "Amritsar",
  "Vadodara", "Ludhiana", "Faridabad", "Ghaziabad", "Noida", "Gurugram", "Thane", "Nashik",
  "Aurangabad", "Coimbatore", "Kochi", "Vizag", "Mysuru", "Mangalore", "Guwahati", "Siliguri",
  "Dehradun", "Shimla", "Chandigarh", "Ambala", "Rohtak", "Panipat", "Karnal", "Sonipat",
  "Bareilly", "Moradabad", "Aligarh", "Gorakhpur", "Jamshedpur", "Dhanbad", "Cuttack", "Bhubaneswar",
  "Trivandrum", "Madurai",
];
const OWNER_POOL = [
  "Rohit Sharma", "Neha Verma", "Amit Singh", "Priya Patel", "Vikas Rao", "Deepa Nair",
  "Arjun Mehta", "Kavya Iyer", "Sanjay Gupta", "Ritu Malhotra", "Karan Kapoor", "Sneha Joshi",
  "Vivek Bansal", "Anjali Desai", "Rahul Khanna", "Pooja Reddy", "Manish Chawla", "Tanya Bhat",
  "Nikhil Sinha", "Isha Menon",
];
const FLAG_POOL = [
  "Machine breakdown",
  "Manpower short",
  "Marketing inactive",
  "Owner unhappy",
  "POS issue",
  "Low sales",
  "Complaint pending",
];

// Deterministic PRNG so 50 stores are stable across renders
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STORES: StoreRow[] = (() => {
  const rand = mulberry32(20260729);
  const out: StoreRow[] = [];
  for (let i = 0; i < 50; i++) {
    const city = CITY_POOL[i % CITY_POOL.length];
    const owner = OWNER_POOL[Math.floor(rand() * OWNER_POOL.length)];
    const health = Math.floor(35 + rand() * 65); // 35-99
    const salesRoll = rand();
    const sales: StoreRow["sales"] = health < 60 ? (salesRoll < 0.75 ? "down" : "stable") : health < 80 ? (salesRoll < 0.5 ? "stable" : salesRoll < 0.85 ? "up" : "down") : salesRoll < 0.7 ? "up" : "stable";
    const openIssues = Math.max(0, Math.round((100 - health) / 12 + rand() * 3));
    const critical = health < 55 ? 1 + Math.floor(rand() * 3) : health < 70 ? Math.floor(rand() * 2) : 0;
    const flagCount = Math.min(FLAG_POOL.length, critical + (openIssues > 3 ? 1 : 0));
    const flags: string[] = [];
    const pool = [...FLAG_POOL];
    for (let f = 0; f < flagCount; f++) {
      const idx = Math.floor(rand() * pool.length);
      flags.push(pool.splice(idx, 1)[0]);
    }
    const lastVisitDays = Math.floor(rand() * 30);
    const lastVisit = lastVisitDays === 0 ? "Today" : lastVisitDays === 1 ? "Yesterday" : lastVisitDays < 7 ? `${lastVisitDays} days ago` : lastVisitDays < 14 ? "1 week ago" : lastVisitDays < 21 ? "2 weeks ago" : lastVisitDays < 28 ? "3 weeks ago" : "1 month ago";
    out.push({
      name: `CC ${city}${i >= CITY_POOL.length ? " 2" : ""}`,
      city,
      owner,
      phone: `98${String(100 + i).padStart(3, "0")}-${String(10000 + Math.floor(rand() * 89999))}`,
      health,
      sales,
      openIssues,
      critical,
      lastVisit,
      flags,
    });
  }
  return out;
})();

type Severity = "critical" | "warning" | "watch" | "healthy";
function severity(s: StoreRow): Severity {
  if (s.health < 60 || s.critical > 0 || s.openIssues >= 5) return "critical";
  if (s.health < 75 || s.openIssues >= 3 || s.sales === "down") return "warning";
  if (s.health < 85) return "watch";
  return "healthy";
}

// Composite priority score — higher = more urgent
function priorityScore(s: StoreRow) {
  const salesWeight = s.sales === "down" ? 20 : s.sales === "stable" ? 5 : 0;
  return (100 - s.health) * 2 + s.critical * 25 + s.openIssues * 4 + salesWeight;
}

const SEV_META: Record<Severity, { label: string; ring: string; dot: string; bg: string; text: string }> = {
  critical: { label: "Critical", ring: "border-red-500/60", dot: "bg-red-500", bg: "bg-red-500/5", text: "text-red-600" },
  warning: { label: "Warning", ring: "border-amber-500/60", dot: "bg-amber-500", bg: "bg-amber-500/5", text: "text-amber-600" },
  watch: { label: "Watch", ring: "border-sky-500/60", dot: "bg-sky-500", bg: "bg-sky-500/5", text: "text-sky-600" },
  healthy: { label: "Healthy", ring: "border-emerald-500/50", dot: "bg-emerald-500", bg: "bg-emerald-500/5", text: "text-emerald-600" },
};

function healthTint(v: number) {
  if (v >= 85) return "text-emerald-600";
  if (v >= 70) return "text-sky-600";
  if (v >= 60) return "text-amber-600";
  return "text-red-600";
}

function StoresSection() {
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<"all" | Severity>("all");

  const counts = STORES.reduce(
    (acc, s) => {
      acc[severity(s)]++;
      return acc;
    },
    { critical: 0, warning: 0, watch: 0, healthy: 0 } as Record<Severity, number>,
  );

  const filtered = STORES.filter((s) => {
    const matchQ =
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.city.toLowerCase().includes(q.toLowerCase()) ||
      s.owner.toLowerCase().includes(q.toLowerCase());
    const matchSev = sev === "all" || severity(s) === sev;
    return matchQ && matchSev;
  }).sort((a, b) => priorityScore(b) - priorityScore(a));

  const filters: { key: "all" | Severity; label: string; count: number; cls: string }[] = [
    { key: "all", label: "All", count: STORES.length, cls: "border-border" },
    { key: "critical", label: "Critical", count: counts.critical, cls: "border-red-500/50 text-red-600" },
    { key: "warning", label: "Warning", count: counts.warning, cls: "border-amber-500/50 text-amber-600" },
    { key: "watch", label: "Watch", count: counts.watch, cls: "border-sky-500/50 text-sky-600" },
    { key: "healthy", label: "Healthy", count: counts.healthy, cls: "border-emerald-500/50 text-emerald-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stores Status</h1>
          <p className="text-sm text-muted-foreground">
            {STORES.length} stores under your portfolio — sorted by urgency (most critical first).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> Watch</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy</div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["critical", "warning", "watch", "healthy"] as Severity[]).map((k) => (
          <button
            key={k}
            onClick={() => setSev(sev === k ? "all" : k)}
            className={`rounded-lg border p-3 text-left transition ${SEV_META[k].bg} ${SEV_META[k].ring} ${sev === k ? "ring-2 ring-offset-1 ring-primary/40" : ""}`}
          >
            <div className={`text-xs font-medium ${SEV_META[k].text}`}>{SEV_META[k].label}</div>
            <div className="text-2xl font-bold tabular-nums mt-1">{counts[k]}</div>
            <div className="text-[11px] text-muted-foreground">stores</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store, city, owner" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSev(f.key)}
              className={`px-2.5 py-1 rounded-full border text-xs transition ${f.cls} ${sev === f.key ? "bg-muted font-semibold" : "hover:bg-muted/50"}`}
            >
              {f.label} · {f.count}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {STORES.length} — high priority first.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => {
          const sv = severity(s);
          const meta = SEV_META[sv];
          return (
            <div
              key={s.name}
              className={`relative rounded-lg border ${meta.ring} ${meta.bg} p-3 space-y-2 hover:shadow-md transition-shadow`}
            >
              <span className={`absolute top-0 left-0 h-full w-1 rounded-l-lg ${meta.dot}`} />
              <div className="flex items-start justify-between gap-2 pl-1">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {s.city} • {s.owner}
                  </div>
                </div>
                <div className={`text-xl font-bold tabular-nums ${healthTint(s.health)}`}>{s.health}</div>
              </div>
              <Progress value={s.health} className="h-1.5" />
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] pl-1">
                <Badge variant="outline" className={`px-1.5 py-0 h-5 ${meta.text} ${meta.ring}`}>
                  {meta.label}
                </Badge>
                {s.critical > 0 && (
                  <Badge variant="outline" className="px-1.5 py-0 h-5 gap-1 text-red-600 border-red-500/50">
                    <AlertTriangle className="h-3 w-3" />
                    {s.critical} urgent
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`px-1.5 py-0 h-5 ${
                    s.sales === "up"
                      ? "text-emerald-600 border-emerald-500/40"
                      : s.sales === "down"
                        ? "text-red-600 border-red-500/40"
                        : "text-sky-600 border-sky-500/40"
                  }`}
                >
                  {s.sales === "up" ? "↑" : s.sales === "down" ? "↓" : "→"} {s.sales}
                </Badge>
                <Badge variant="outline" className={`px-1.5 py-0 h-5 ${s.openIssues > 3 ? "text-red-600 border-red-500/40" : ""}`}>
                  {s.openIssues} issues
                </Badge>
              </div>
              {s.flags.length > 0 && (
                <div className="flex flex-wrap gap-1 pl-1">
                  {s.flags.slice(0, 3).map((f) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border/60 text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pl-1 pt-1 border-t border-border/50">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {s.lastVisit}
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${s.phone}`}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-background border border-transparent hover:border-border"
                    title={`Call ${s.owner}`}
                  >
                    <Phone className="h-3 w-3" />
                  </a>
                  <a
                    href={`https://wa.me/91${s.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-background border border-transparent hover:border-border"
                    title="WhatsApp"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-muted-foreground border border-dashed rounded-lg">
            No stores match your filter.
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- CRM -------------------- */
type Ticket = {
  id: string;
  store: string;
  department: string;
  problem: string;
  customProblem?: string;
  summary: string;
  status: "open" | "in_progress" | "resolved";
  raised: string;
  remark?: string;
};

const DEPARTMENTS = [
  "Engineer",
  "Performance Marketing Executive",
  "Training & Manpower Centre",
  "Other",
] as const;

const PROBLEMS = [
  { code: "A", label: "Machine" },
  { code: "B", label: "Manpower" },
  { code: "C", label: "Marketing" },
  { code: "D", label: "POS" },
  { code: "E", label: "Graphic and Design" },
  { code: "F", label: "Agreements" },
  { code: "G", label: "Owner" },
  { code: "H", label: "Other" },
] as const;

const CATALOG_KEY = "rm-problem-catalog";

function CRMSection() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "T-1041", store: "CC Surat", department: "Engineer", problem: "Machine", summary: "Dryer 15kg not heating", status: "in_progress", raised: "Today, 10:12" },
    { id: "T-1042", store: "CC Kanpur", department: "Training & Manpower Centre", problem: "Manpower", summary: "Rider absent, need backup", status: "open", raised: "Today, 09:30" },
    { id: "T-1043", store: "CC Lucknow", department: "Engineer", problem: "POS", summary: "Bill printer paper jam", status: "resolved", raised: "Yesterday", remark: "Guided owner over call" },
    { id: "T-1044", store: "CC Indore", department: "Other", problem: "Owner", summary: "Franchise reconciliation query", status: "open", raised: "Yesterday" },
  ]);
  const [newForm, setNewForm] = useState({
    store: "",
    department: "Engineer" as string,
    problem: "Machine" as string,
    customProblem: "",
    summary: "",
  });

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
    const isOtherProblem = newForm.problem === "Other";
    if (isOtherProblem && !newForm.customProblem.trim()) {
      toast.error("Describe the new problem so we can catalogue it");
      return;
    }

    const id = `T-${1050 + tickets.length}`;
    setTickets((prev) => [
      {
        id,
        store: newForm.store,
        department: newForm.department,
        problem: newForm.problem,
        customProblem: isOtherProblem ? newForm.customProblem : undefined,
        summary: newForm.summary,
        status: "open",
        raised: "Just now",
      },
      ...prev,
    ]);

    if (isOtherProblem) {
      try {
        const existing: { name: string; addedAt: string; ticket: string }[] = JSON.parse(
          localStorage.getItem(CATALOG_KEY) || "[]",
        );
        const name = newForm.customProblem.trim();
        if (!existing.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
          existing.unshift({ name, addedAt: new Date().toISOString(), ticket: id });
          localStorage.setItem(CATALOG_KEY, JSON.stringify(existing));
          toast.success("New problem catalogued in Resources");
        }
      } catch {
        /* ignore */
      }
    }

    setNewForm({ store: "", department: "Engineer", problem: "Machine", customProblem: "", summary: "" });
    toast.success("Ticket logged");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
        <p className="text-sm text-muted-foreground">
          Raise tickets to departments. New problem types are auto-catalogued in Resources.
        </p>
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
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Store</label>
            <Input
              placeholder="e.g. CC Jaipur"
              value={newForm.store}
              onChange={(e) => setNewForm({ ...newForm, store: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Assign to Department</label>
            <Select value={newForm.department} onValueChange={(v) => setNewForm({ ...newForm, department: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Problem</label>
            <Select value={newForm.problem} onValueChange={(v) => setNewForm({ ...newForm, problem: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROBLEMS.map((p) => (
                  <SelectItem key={p.label} value={p.label}>
                    {p.code}. {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newForm.problem === "Other" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                New Problem (auto-catalogued in Resources)
              </label>
              <Input
                placeholder="Name the new problem type"
                value={newForm.customProblem}
                onChange={(e) => setNewForm({ ...newForm, customProblem: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Summary</label>
            <Input
              placeholder="Describe the issue"
              value={newForm.summary}
              onChange={(e) => setNewForm({ ...newForm, summary: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Button onClick={addTicket} className="w-fit">
              Raise Ticket
            </Button>
          </div>
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
                    <Badge variant="outline">
                      {t.problem}
                      {t.customProblem ? `: ${t.customProblem}` : ""}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      → {t.department}
                    </Badge>
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
