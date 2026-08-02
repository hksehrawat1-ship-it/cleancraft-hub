import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Home,
  Wrench,
  CalendarDays,
  FileText,
  Receipt,
  BookOpen,
  HardHat,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Phone,
  Plus,
  Search,
  IndianRupee,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/field-engineer")({
  head: () => ({
    meta: [
      { title: "Field Engineer — Clean Craft OS" },
      {
        name: "description",
        content:
          "Field Engineer workspace for site visits, job cards, work reports and travel expenses.",
      },
      { property: "og:title", content: "Field Engineer — Clean Craft OS" },
      {
        property: "og:description",
        content: "Manage assigned jobs, visit schedule, work reports and expenses.",
      },
    ],
  }),
  component: FieldEngineerDashboard,
});

type SectionKey = "home" | "jobs" | "schedule" | "report" | "expenses" | "help";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "jobs", label: "My Jobs", icon: Wrench },
  { key: "schedule", label: "Visit Schedule", icon: CalendarDays },
  { key: "report", label: "Submit Work Report", icon: FileText },
  { key: "expenses", label: "My Expenses", icon: Receipt },
  { key: "help", label: "Help & Guides", icon: BookOpen },
];

function FieldEngineerDashboard() {
  const [active, setActive] = useState<SectionKey>("home");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold flex items-center gap-2">
            <HardHat className="w-4 h-4 text-primary" />
            Field Engineer
          </div>
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
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
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
        {active === "home" && <HomeSection onGo={setActive} />}
        {active === "jobs" && <JobsSection />}
        {active === "schedule" && <ScheduleSection />}
        {active === "report" && <ReportSection />}
        {active === "expenses" && <ExpensesSection />}
        {active === "help" && <HelpSection />}
      </main>
    </div>
  );
}

/* ---------------- Shared sample data ---------------- */
const JOBS = [
  {
    id: "FE-2041",
    store: "Jaipur — Vaishali Nagar",
    owner: "Rahul Sharma",
    phone: "+91 98290 11223",
    issue: "Washer drum vibration + error E04",
    machine: "Washer 12kg",
    priority: "Safety Critical",
    status: "In Transit",
    slot: "10:00 AM",
    city: "Jaipur",
  },
  {
    id: "FE-2042",
    store: "Indore — Vijay Nagar",
    owner: "Neha Agarwal",
    phone: "+91 90390 44551",
    issue: "Dryer heating coil replacement",
    machine: "Dryer 10kg",
    priority: "Breakdown",
    status: "Scheduled",
    slot: "12:30 PM",
    city: "Indore",
  },
  {
    id: "FE-2043",
    store: "Lucknow — Gomti Nagar",
    owner: "Amit Verma",
    phone: "+91 99350 77812",
    issue: "Steam iron boiler pressure drop",
    machine: "Steam Iron",
    priority: "Normal",
    status: "Scheduled",
    slot: "3:00 PM",
    city: "Lucknow",
  },
  {
    id: "FE-2039",
    store: "Surat — Adajan",
    owner: "Kiran Patel",
    phone: "+91 98250 33440",
    issue: "Machine installation & commissioning",
    machine: "Full Setup",
    priority: "Normal",
    status: "Completed",
    slot: "Yesterday",
    city: "Surat",
  },
  {
    id: "FE-2036",
    store: "Pune 2 — Kothrud",
    owner: "Sagar Joshi",
    phone: "+91 91750 66220",
    issue: "Awaiting spare part (control board)",
    machine: "Washer 8kg",
    priority: "Breakdown",
    status: "Awaiting Parts",
    slot: "Hold",
    city: "Pune",
  },
];

function priorityTone(p: string) {
  if (p === "Safety Critical") return "bg-red-600 text-white";
  if (p === "Breakdown") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-muted text-muted-foreground";
}

function statusTone(s: string) {
  if (s === "Completed") return "text-emerald-600";
  if (s === "In Transit") return "text-primary";
  if (s === "Awaiting Parts") return "text-amber-600";
  return "text-blue-600";
}

/* ---------------- Home ---------------- */
function HomeSection({ onGo }: { onGo: (k: SectionKey) => void }) {
  const stats = [
    { label: "Jobs Today", value: 3, icon: CalendarDays, tone: "text-blue-600" },
    { label: "Completed", value: 1, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "In Transit", value: 1, icon: Truck, tone: "text-primary" },
    { label: "Awaiting Parts", value: 1, icon: AlertTriangle, tone: "text-amber-600" },
  ];
  const next = JOBS[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, Engineer</h1>
        <p className="text-sm text-muted-foreground">
          Your day at a glance — visits, blockers and pending reports.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Icon className={`w-3.5 h-3.5 ${tone}`} />
                {label}
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Next Visit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{next.store}</span>
            <Badge className={priorityTone(next.priority)}>{next.priority}</Badge>
            <span className="text-xs text-muted-foreground">{next.slot}</span>
          </div>
          <p className="text-sm text-muted-foreground">{next.issue}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => toast.success(`Calling ${next.owner}`)}>
              <Phone className="w-3.5 h-3.5 mr-1" /> Call Owner
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Marked as reached site")}>
              <MapPin className="w-3.5 h-3.5 mr-1" /> Reached Site
            </Button>
            <Button size="sm" variant="outline" onClick={() => onGo("report")}>
              <FileText className="w-3.5 h-3.5 mr-1" /> Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "My Jobs", key: "jobs" as SectionKey, icon: Wrench },
          { label: "Visit Schedule", key: "schedule" as SectionKey, icon: CalendarDays },
          { label: "My Expenses", key: "expenses" as SectionKey, icon: Receipt },
        ].map(({ label, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onGo(key)}
            className="border rounded-md p-4 bg-background hover:bg-muted text-left transition-colors"
          >
            <Icon className="w-4 h-4 text-primary" />
            <div className="mt-2 text-sm font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- My Jobs ---------------- */
function JobsSection() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      JOBS.filter((j) => {
        const t = q.trim().toLowerCase();
        const matchQ =
          !t ||
          j.store.toLowerCase().includes(t) ||
          j.id.toLowerCase().includes(t) ||
          j.issue.toLowerCase().includes(t);
        const matchS = status === "all" || j.status === status;
        return matchQ && matchS;
      }),
    [q, status],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Jobs</h1>
          <p className="text-sm text-muted-foreground">All jobs assigned to you by Technical Support.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search store or job id..."
              className="pl-9 w-56"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["all", "Scheduled", "In Transit", "Awaiting Parts", "Completed"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">No jobs found.</div>
        )}
        {filtered.map((j) => (
          <Card key={j.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{j.id}</span>
                  <span className="font-medium">{j.store}</span>
                  <Badge className={priorityTone(j.priority)}>{j.priority}</Badge>
                </div>
                <div className={`text-xs font-medium ${statusTone(j.status)}`}>{j.status}</div>
              </div>
              <p className="text-sm text-muted-foreground">{j.issue}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> {j.machine}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {j.slot}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {j.city}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => toast.success(`Calling ${j.owner}`)}>
                  <Phone className="w-3.5 h-3.5 mr-1" /> {j.owner}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpenId(openId === j.id ? null : j.id)}
                >
                  {openId === j.id ? "Hide details" : "View details"}
                </Button>
              </div>
              {openId === j.id && (
                <div className="border rounded-md p-3 bg-muted/30 text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Owner phone: </span>
                    {j.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Machine: </span>
                    {j.machine}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reported issue: </span>
                    {j.issue}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Visit Schedule ---------------- */
function ScheduleSection() {
  const days = [
    {
      day: "Today — Mon",
      items: JOBS.filter((j) => ["Scheduled", "In Transit"].includes(j.status)),
    },
    { day: "Tomorrow — Tue", items: [JOBS[4], JOBS[2]] },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visit Schedule</h1>
        <p className="text-sm text-muted-foreground">Time-slotted plan for your site visits.</p>
      </div>

      {days.map((d) => (
        <Card key={d.day}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> {d.day}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.items.map((j, i) => (
              <div
                key={`${d.day}-${j.id}-${i}`}
                className="border rounded-md p-3 bg-muted/20 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold tabular-nums w-20">{j.slot}</div>
                  <div>
                    <div className="text-sm font-medium">{j.store}</div>
                    <div className="text-xs text-muted-foreground">{j.issue}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Travel started")}>
                    <Truck className="w-3.5 h-3.5 mr-1" /> Start Travel
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success("Owner notified")}>
                    Notify Owner
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Submit Work Report ---------------- */
function ReportSection() {
  const [form, setForm] = useState({
    job: "",
    workDone: "",
    rootCause: "",
    parts: "",
    outcome: "",
    nextAction: "",
    customerConfirmed: false,
  });
  const [submitted, setSubmitted] = useState<any[]>([
    {
      job: "FE-2039 — Surat Adajan",
      outcome: "Resolved On-Site",
      workDone: "Installed and commissioned full setup, trained owner on start-up.",
      at: "Yesterday, 6:40 PM",
    },
  ]);

  function submit() {
    if (!form.job || !form.workDone || !form.outcome) {
      return toast.error("Select job, add work done and outcome");
    }
    if (form.outcome === "Resolved On-Site" && !form.customerConfirmed) {
      return toast.error("Customer confirmation required to close the job");
    }
    setSubmitted([
      {
        job: form.job,
        outcome: form.outcome,
        workDone: form.workDone,
        at: "Just now",
      },
      ...submitted,
    ]);
    toast.success("Work report submitted");
    setForm({
      job: "",
      workDone: "",
      rootCause: "",
      parts: "",
      outcome: "",
      nextAction: "",
      customerConfirmed: false,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Work Report</h1>
        <p className="text-sm text-muted-foreground">
          One report per visit. Reports close the job and update the store record.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Visit Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Job</Label>
              <Select value={form.job} onValueChange={(v) => setForm({ ...form, job: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {JOBS.filter((j) => j.status !== "Completed").map((j) => (
                    <SelectItem key={j.id} value={`${j.id} — ${j.store}`}>
                      {j.id} — {j.store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Outcome</Label>
              <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Resolved On-Site",
                    "Partially Resolved — Monitoring",
                    "Part Required",
                    "Revisit Needed",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Work completed</Label>
            <Textarea
              value={form.workDone}
              onChange={(e) => setForm({ ...form, workDone: e.target.value })}
              placeholder="Describe the work done on site..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Root cause</Label>
              <Input
                value={form.rootCause}
                onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                placeholder="e.g. worn drum bearing"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parts used / required</Label>
              <Input
                value={form.parts}
                onChange={(e) => setForm({ ...form, parts: e.target.value })}
                placeholder="e.g. bearing kit, heating coil"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Next action (if not resolved)</Label>
            <Input
              value={form.nextAction}
              onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
              placeholder="e.g. revisit after part delivery on Thu"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.customerConfirmed}
              onChange={(e) => setForm({ ...form, customerConfirmed: e.target.checked })}
            />
            Customer confirmed machine is working
          </label>

          <Button onClick={submit}>
            <FileText className="w-4 h-4 mr-1" /> Submit Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {submitted.map((s, i) => (
            <div key={i} className="border rounded-md p-3 bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{s.job}</span>
                <Badge variant="secondary" className="text-[11px]">
                  {s.outcome}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{s.workDone}</p>
              <div className="text-[11px] text-muted-foreground mt-1">{s.at}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- My Expenses ---------------- */
function ExpensesSection() {
  const [items, setItems] = useState([
    { type: "Travel", note: "Jaipur — bus + auto", amount: 640, status: "Approved", date: "1 Aug" },
    { type: "Food", note: "Site day meal", amount: 220, status: "Pending", date: "1 Aug" },
    { type: "Parts", note: "Bearing kit (local purchase)", amount: 1850, status: "Pending", date: "31 Jul" },
  ]);
  const [form, setForm] = useState({ type: "", note: "", amount: "" });

  const total = items.reduce((s, i) => s + i.amount, 0);
  const pending = items.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);

  function add() {
    const amt = Number(form.amount);
    if (!form.type || !amt) return toast.error("Select type and enter amount");
    setItems([
      { type: form.type, note: form.note, amount: amt, status: "Pending", date: "Today" },
      ...items,
    ]);
    setForm({ type: "", note: "", amount: "" });
    toast.success("Expense submitted for approval");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Expenses</h1>
        <p className="text-sm text-muted-foreground">Travel, food and part purchases from field visits.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "This Month", value: total, tone: "text-primary" },
          { label: "Pending Approval", value: pending, tone: "text-amber-600" },
          { label: "Approved", value: total - pending, tone: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
              <div className={`text-2xl font-semibold tabular-nums mt-1 flex items-center ${s.tone}`}>
                <IndianRupee className="w-4 h-4" />
                {s.value.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Travel", "Food", "Stay", "Parts", "Other"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Note</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Store / purpose"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <Button className="mt-3" onClick={add}>
            Submit Expense
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Expense History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((i, idx) => (
            <div
              key={idx}
              className="border rounded-md p-3 bg-muted/20 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <div className="text-sm font-medium">
                  {i.type} <span className="text-muted-foreground font-normal">· {i.date}</span>
                </div>
                <div className="text-xs text-muted-foreground">{i.note}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums">
                  ₹{i.amount.toLocaleString("en-IN")}
                </span>
                <Badge
                  variant={i.status === "Approved" ? "secondary" : "outline"}
                  className="text-[11px]"
                >
                  {i.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Help & Guides ---------------- */
function HelpSection() {
  const [q, setQ] = useState("");
  const guides = [
    { title: "Washer Error Codes (E01–E12)", cat: "Washer", pages: 6 },
    { title: "Dryer Heating Coil Replacement", cat: "Dryer", pages: 4 },
    { title: "Steam Iron Boiler Service SOP", cat: "Steam Iron", pages: 5 },
    { title: "Electrical Safety Checklist Before Work", cat: "Safety", pages: 2 },
    { title: "Machine Installation & Commissioning", cat: "Installation", pages: 8 },
    { title: "Spare Part Request Process", cat: "Process", pages: 3 },
  ];
  const filtered = guides.filter(
    (g) =>
      !q.trim() ||
      g.title.toLowerCase().includes(q.toLowerCase()) ||
      g.cat.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Help & Guides</h1>
          <p className="text-sm text-muted-foreground">Approved service SOPs and safety checklists.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search guides..."
            className="pl-9 w-64"
          />
        </div>
      </div>

      <Card className="border-amber-300">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">Safety first</div>
            <p className="text-muted-foreground">
              Always isolate power before opening any machine panel. Report smoke, water or shock risk to
              Technical Support immediately.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((g) => (
          <Card key={g.title}>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{g.title}</div>
                <div className="text-xs text-muted-foreground">
                  {g.cat} · {g.pages} pages
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success("Guide downloaded")}>
                <Download className="w-3.5 h-3.5 mr-1" /> Open
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Escalation Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { role: "Technical Support", name: "Rohit Nair", phone: "+91 98110 22334" },
            { role: "Service Head", name: "Vikas Mehta", phone: "+91 98110 55667" },
            { role: "Spare Parts Desk", name: "Store Team", phone: "+91 98110 88990" },
          ].map((c) => (
            <div
              key={c.role}
              className="border rounded-md p-3 bg-muted/20 flex items-center justify-between gap-2"
            >
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.role}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Calling ${c.name}`)}>
                <Phone className="w-3.5 h-3.5 mr-1" /> {c.phone}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="hidden">
        <Progress value={50} />
      </div>
    </div>
  );
}
