import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  UserCircle2,
  Store,
  ClipboardList,
  Wallet,
  TrendingUp,
  Plus,
  Languages,
  CheckCircle2,
  Clock,
  IndianRupee,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/tl")({
  head: () => ({
    meta: [
      { title: "Trainer & Launch Executive — Clean Craft OS" },
      { name: "description", content: "T&L employee dashboard" },
    ],
  }),
  component: TLDashboard,
});

type Lang = "en" | "hi";
type SectionKey = "roles" | "stores" | "tasks" | "expense" | "performance";

const T = {
  employee: { en: "Employee", hi: "कर्मचारी" },
  title: { en: "Trainer & Launch Executive", hi: "ट्रेनर एवं लॉन्च एग्जीक्यूटिव" },
  language: { en: "Language", hi: "भाषा" },
  english: { en: "English", hi: "अंग्रेज़ी" },
  hindi: { en: "Hindi", hi: "हिन्दी" },
  nav: {
    roles: { en: "Roles & Responsibilities", hi: "भूमिकाएँ एवं ज़िम्मेदारियाँ" },
    stores: { en: "Stores Assigned", hi: "सौंपे गए स्टोर" },
    tasks: { en: "Tasks Assigned by Head", hi: "हेड द्वारा दिए गए कार्य" },
    expense: { en: "Expense", hi: "खर्च" },
    performance: { en: "Performance", hi: "प्रदर्शन" },
  },
  addTask: { en: "Add Task", hi: "कार्य जोड़ें" },
  addExpense: { en: "Add Expense", hi: "खर्च जोड़ें" },
  submit: { en: "Submit", hi: "जमा करें" },
  pending: { en: "Pending", hi: "लंबित" },
  done: { en: "Done", hi: "पूर्ण" },
  markDone: { en: "Mark Done", hi: "पूर्ण चिह्नित करें" },
  amount: { en: "Amount (₹)", hi: "राशि (₹)" },
  note: { en: "Note", hi: "टिप्पणी" },
  date: { en: "Date", hi: "दिनांक" },
  storesTrained: { en: "Stores Trained", hi: "प्रशिक्षित स्टोर" },
  ongoing: { en: "Ongoing", hi: "जारी" },
  avgRating: { en: "Avg. Rating", hi: "औसत रेटिंग" },
  onTime: { en: "On-time Openings", hi: "समय पर उद्घाटन" },
};

const tr = (k: keyof typeof T, lang: Lang) => (T[k] as any)[lang] as string;

const ROLES = {
  en: [
    "Deliver Owner, Manpower & Machine training at assigned stores.",
    "Conduct POS and customer-handling walk-throughs before launch.",
    "Coordinate the store launch day activities end-to-end.",
    "Escalate blockers (manpower, equipment) to Head immediately.",
    "Submit daily training report with photos and attendance.",
  ],
  hi: [
    "सौंपे गए स्टोर पर मालिक, स्टाफ एवं मशीन प्रशिक्षण देना।",
    "लॉन्च से पहले POS एवं ग्राहक-व्यवहार का पूर्वाभ्यास करना।",
    "स्टोर लॉन्च दिवस की सम्पूर्ण गतिविधियों का समन्वय करना।",
    "किसी भी बाधा (स्टाफ, उपकरण) की तुरन्त हेड को सूचना देना।",
    "फोटो एवं उपस्थिति सहित दैनिक प्रशिक्षण रिपोर्ट जमा करना।",
  ],
};

type StoreItem = {
  id: string;
  name: string;
  city: string;
  progress: number;
  status: { en: string; hi: string };
};
const INITIAL_STORES: StoreItem[] = [
  { id: "s1", name: "Jaipur", city: "Jaipur", progress: 85, status: { en: "Training", hi: "प्रशिक्षण" } },
  { id: "s2", name: "Indore", city: "Indore", progress: 60, status: { en: "Training", hi: "प्रशिक्षण" } },
  { id: "s3", name: "Lucknow", city: "Lucknow", progress: 100, status: { en: "Launched", hi: "लॉन्च हो चुका" } },
  { id: "s4", name: "Pune 2", city: "Pune", progress: 40, status: { en: "Pre-launch", hi: "लॉन्च-पूर्व" } },
  { id: "s5", name: "Surat", city: "Surat", progress: 25, status: { en: "Setup", hi: "स्थापना" } },
];

type Task = { id: string; text: string; done: boolean };
const SEED_TASKS: Task[] = [
  { id: "t1", text: "Complete POS training at Jaipur", done: false },
  { id: "t2", text: "Submit Lucknow launch report", done: true },
  { id: "t3", text: "Rehearse customer handling at Indore", done: false },
];

type Expense = { id: string; date: string; amount: number; note: string };
const SEED_EXPENSES: Expense[] = [
  { id: "e1", date: new Date().toISOString().slice(0, 10), amount: 1200, note: "Travel — Jaipur" },
  { id: "e2", date: new Date().toISOString().slice(0, 10), amount: 450, note: "Printouts" },
];

function TLDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [active, setActive] = useState<SectionKey>("roles");
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [newTask, setNewTask] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>(SEED_EXPENSES);
  const [newExp, setNewExp] = useState({ amount: "", note: "" });

  const NAV: { key: SectionKey; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "roles", icon: UserCircle2 },
    { key: "stores", icon: Store },
    { key: "tasks", icon: ClipboardList },
    { key: "expense", icon: Wallet },
    { key: "performance", icon: TrendingUp },
  ];

  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {tr("employee", lang)}
          </div>
          <div className="font-semibold">{tr("title", lang)}</div>
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
                <span className="text-left">{T.nav[item.key][lang]}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-6 space-y-4">
        {/* Language switcher */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">{T.nav[active][lang]}</h1>
          <div className="inline-flex items-center gap-2 border rounded-md p-1 bg-background">
            <Languages className="w-4 h-4 text-muted-foreground ml-1" />
            <Button
              size="sm"
              variant={lang === "en" ? "default" : "ghost"}
              onClick={() => setLang("en")}
            >
              English
            </Button>
            <Button
              size="sm"
              variant={lang === "hi" ? "default" : "ghost"}
              onClick={() => setLang("hi")}
            >
              हिन्दी
            </Button>
          </div>
        </div>

        {active === "roles" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{T.nav.roles[lang]}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5 text-sm">
                {ROLES[lang].map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {active === "stores" && (
          <div className="grid gap-3 md:grid-cols-2">
            {INITIAL_STORES.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      {s.name}
                    </span>
                    <Badge variant="secondary">{s.status[lang]}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.city}</span>
                    <span className="tabular-nums">{s.progress}%</span>
                  </div>
                  <Progress value={s.progress} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {active === "tasks" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{T.nav.tasks[lang]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder={lang === "en" ? "New task from Head..." : "हेड द्वारा नया कार्य..."}
                />
                <Button
                  onClick={() => {
                    if (!newTask.trim()) return;
                    setTasks((prev) => [
                      { id: crypto.randomUUID(), text: newTask.trim(), done: false },
                      ...prev,
                    ]);
                    setNewTask("");
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {tr("addTask", lang)}
                </Button>
              </div>
              <div className="border rounded-md divide-y">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={(v) =>
                        setTasks((prev) =>
                          prev.map((p) => (p.id === t.id ? { ...p, done: !!v } : p)),
                        )
                      }
                    />
                    <span className={`flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>
                      {t.text}
                    </span>
                    <Badge variant={t.done ? "default" : "secondary"}>
                      {t.done ? tr("done", lang) : tr("pending", lang)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {active === "expense" && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tr("addExpense", lang)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="number"
                  value={newExp.amount}
                  onChange={(e) => setNewExp((p) => ({ ...p, amount: e.target.value }))}
                  placeholder={tr("amount", lang)}
                />
                <Textarea
                  value={newExp.note}
                  onChange={(e) => setNewExp((p) => ({ ...p, note: e.target.value }))}
                  placeholder={tr("note", lang)}
                />
                <Button
                  className="w-full"
                  onClick={() => {
                    const amt = Number(newExp.amount);
                    if (!amt || !newExp.note.trim()) return;
                    setExpenses((prev) => [
                      {
                        id: crypto.randomUUID(),
                        date: new Date().toISOString().slice(0, 10),
                        amount: amt,
                        note: newExp.note.trim(),
                      },
                      ...prev,
                    ]);
                    setNewExp({ amount: "", note: "" });
                  }}
                >
                  {tr("submit", lang)}
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{T.nav.expense[lang]}</CardTitle>
                <div className="text-sm font-semibold flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  <span className="tabular-nums">{totalExpense.toLocaleString("en-IN")}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md divide-y">
                  {expenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground tabular-nums">{e.date}</span>
                        <span>{e.note}</span>
                      </div>
                      <span className="font-medium tabular-nums">
                        ₹{e.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      {lang === "en" ? "No expenses yet." : "अभी कोई खर्च नहीं।"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {active === "performance" && (
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { label: tr("storesTrained", lang), value: 12, icon: CheckCircle2, tone: "text-emerald-500" },
              { label: tr("ongoing", lang), value: 3, icon: Clock, tone: "text-sky-500" },
              { label: tr("onTime", lang), value: "92%", icon: TrendingUp, tone: "text-primary" },
              { label: tr("avgRating", lang), value: "4.7 / 5", icon: TrendingUp, tone: "text-amber-500" },
            ].map((k) => {
              const Icon = k.icon;
              return (
                <Card key={k.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className={`w-4 h-4 ${k.tone}`} />
                      {k.label}
                    </div>
                    <div className="text-2xl font-semibold tabular-nums mt-1">{k.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
