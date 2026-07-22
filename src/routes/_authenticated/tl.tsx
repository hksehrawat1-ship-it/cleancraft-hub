import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  MapPin,
  Utensils,
  BedDouble,
  Car,
  Upload,
  Building2,
  ChevronDown,
  ChevronRight,
  Camera,
  Lock,
  Phone,
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
type ExpenseCat = "food" | "accommodation" | "transportation";

const T = {
  employee: { en: "Employee", hi: "कर्मचारी" },
  title: { en: "Trainer & Launch Executive", hi: "ट्रेनर एवं लॉन्च एग्जीक्यूटिव" },
  nav: {
    roles: { en: "Roles & Responsibilities", hi: "भूमिकाएँ एवं ज़िम्मेदारियाँ" },
    stores: { en: "Stores Assigned", hi: "सौंपे गए स्टोर" },
    tasks: { en: "Tasks from Training & Manpower Centre", hi: "प्रशिक्षण एवं मैनपावर केंद्र से कार्य" },
    expense: { en: "Expense", hi: "खर्च" },
    performance: { en: "Performance", hi: "प्रदर्शन" },
  },
  pending: { en: "Pending", hi: "लंबित" },
  done: { en: "Done", hi: "पूर्ण" },
  markDone: { en: "Mark Done", hi: "पूर्ण करें" },
  reopen: { en: "Reopen", hi: "पुनः खोलें" },
  storesTrained: { en: "Stores Trained", hi: "प्रशिक्षित स्टोर" },
  ongoing: { en: "Ongoing", hi: "जारी" },
  avgRating: { en: "Avg. Rating", hi: "औसत रेटिंग" },
  onTime: { en: "On-time Openings", hi: "समय पर उद्घाटन" },
  assignedBy: { en: "Assigned by", hi: "द्वारा सौंपा गया" },
  due: { en: "Due", hi: "नियत" },
  centre: { en: "Training & Manpower Centre", hi: "प्रशिक्षण एवं मैनपावर केंद्र" },
  todaysSpend: { en: "Today's Spend", hi: "आज का खर्च" },
  entriesToday: { en: "Entries Today", hi: "आज की प्रविष्टियाँ" },
  storesPending: { en: "Stores Pending Today", hi: "आज लंबित स्टोर" },
  totalMonth: { en: "Total (Month)", hi: "कुल (माह)" },
  food: { en: "Food", hi: "भोजन" },
  accommodation: { en: "Accommodation", hi: "आवास" },
  transportation: { en: "Transportation", hi: "यातायात" },
  amount: { en: "Amount ₹", hi: "राशि ₹" },
  noteOpt: { en: "Note (optional)", hi: "टिप्पणी (वैकल्पिक)" },
  uploadProof: { en: "Upload proof", hi: "प्रमाण अपलोड करें" },
  changeProof: { en: "Change proof", hi: "प्रमाण बदलें" },
  add: { en: "Add", hi: "जोड़ें" },
  notUpdated: { en: "Not updated today", hi: "आज अपडेट नहीं" },
  entryToday: { en: "entry today", hi: "प्रविष्टि आज" },
  entriesTodayShort: { en: "entries today", hi: "प्रविष्टियाँ आज" },
  eligibleBy: {
    en: "Eligibility set by Training & Manpower Centre",
    hi: "पात्रता प्रशिक्षण एवं मैनपावर केंद्र द्वारा तय",
  },
  notEligible: { en: "Not eligible", hi: "पात्र नहीं" },
  eligible: { en: "Eligible", hi: "पात्र" },
};

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
  assignedBy: string;
};
const INITIAL_STORES: StoreItem[] = [
  { id: "s1", name: "Jaipur", city: "Jaipur", progress: 85, status: { en: "Training", hi: "प्रशिक्षण" }, assignedBy: "T&M Centre — Ms. Kavita" },
  { id: "s2", name: "Indore", city: "Indore", progress: 60, status: { en: "Training", hi: "प्रशिक्षण" }, assignedBy: "T&M Centre — Mr. Sanjay" },
  { id: "s3", name: "Lucknow", city: "Lucknow", progress: 100, status: { en: "Launched", hi: "लॉन्च हो चुका" }, assignedBy: "T&M Centre — Ms. Kavita" },
  { id: "s4", name: "Pune 2", city: "Pune", progress: 40, status: { en: "Pre-launch", hi: "लॉन्च-पूर्व" }, assignedBy: "T&M Centre — Mr. Sanjay" },
  { id: "s5", name: "Surat", city: "Surat", progress: 25, status: { en: "Setup", hi: "स्थापना" }, assignedBy: "T&M Centre — Ms. Kavita" },
];

// Eligibility pushed by TMC — controls which expense categories TL can log.
const EXPENSE_ELIGIBILITY: Record<ExpenseCat, boolean> = {
  food: true,
  transportation: true,
  accommodation: false,
};

type CentreTask = {
  id: string;
  text: { en: string; hi: string };
  assignedBy: string;
  assignedAt: string; // ISO
  due: string;
  done: boolean;
  completedAt?: string; // ISO
};
const SEED_TASKS: CentreTask[] = [
  { id: "t1", text: { en: "Deploy 2 trained manpower to Jaipur store", hi: "जयपुर स्टोर पर 2 प्रशिक्षित स्टाफ तैनात करें" }, assignedBy: "T&M Centre — Ms. Kavita", assignedAt: "2026-07-22T09:15:00", due: "Today", done: false },
  { id: "t2", text: { en: "Conduct Owner training refresh — Indore", hi: "मालिक प्रशिक्षण रिफ्रेश करें — इंदौर" }, assignedBy: "T&M Centre — Mr. Sanjay", assignedAt: "2026-07-21T17:40:00", due: "Tomorrow", done: false },
  { id: "t3", text: { en: "Submit Lucknow launch attendance sheet", hi: "लखनऊ लॉन्च उपस्थिति पत्रक जमा करें" }, assignedBy: "T&M Centre — Ms. Kavita", assignedAt: "2026-07-20T10:00:00", due: "Yesterday", done: true, completedAt: "2026-07-21T18:12:00" },
  { id: "t4", text: { en: "POS module walkthrough — Pune 2 (pre-launch)", hi: "POS मॉड्यूल वॉकथ्रू — पुणे 2 (लॉन्च-पूर्व)" }, assignedBy: "T&M Centre — Mr. Sanjay", assignedAt: "2026-07-22T08:00:00", due: "In 2 days", done: false },
];

const fmtDT = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

type ExpenseEntry = {
  id: string;
  storeId: string;
  storeName: string;
  category: ExpenseCat;
  date: string;
  amount: number;
  note?: string;
  proofName?: string;
};

const CAT_META: { key: ExpenseCat; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { key: "food", icon: Utensils, tone: "text-amber-600" },
  { key: "accommodation", icon: BedDouble, tone: "text-sky-600" },
  { key: "transportation", icon: Car, tone: "text-emerald-600" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

// ============ Store Workflow ============
type CheckItem = { id: string; label: string; photo?: boolean; whatsapp?: boolean };
const STORE_SETUP: CheckItem[] = [
  { id: "setup-box", label: "Video of box opening (upload on WhatsApp)", whatsapp: true },
  { id: "setup-store", label: "Set up complete store & upload video on WhatsApp", whatsapp: true },
];
const OWNER_TRAINING: CheckItem[] = [
  { id: "own-sw", label: "Owner Software Training" },
  { id: "own-mc", label: "Owner Machine Training" },
  { id: "own-chem", label: "Owner Chemical Training" },
  { id: "own-proc", label: "Process Training" },
];
const MANPOWER_TRAINING: CheckItem[] = [
  { id: "mp-rider", label: "Rider Training" },
  { id: "mp-press", label: "Pressman Training" },
  { id: "mp-all", label: "All Rounder Training" },
];
const FLYER_DAYS: CheckItem[] = [
  { id: "fly-1", label: "Day 1 — Flyer Distribution", photo: true },
  { id: "fly-2", label: "Day 2 — Flyer Distribution", photo: true },
  { id: "fly-3", label: "Day 3 — Flyer Distribution", photo: true },
  { id: "fly-4", label: "Day 4 — Flyer Distribution", photo: true },
  { id: "fly-5", label: "Day 5 — Flyer Distribution", photo: true },
];

type StoreProgress = {
  location?: { lat: number; lng: number; at: string };
  ticks: Record<string, { at: string; photoName?: string } | undefined>;
  pressmanName?: string;
  pressmanPhone?: string;
  allrounderName?: string;
  allrounderPhone?: string;
  checkOutDate?: string;
  ownerReview?: boolean;
};

function TLDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [active, setActive] = useState<SectionKey>("roles");
  const [tasks, setTasks] = useState<CentreTask[]>(SEED_TASKS);
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [storeProg, setStoreProg] = useState<Record<string, StoreProgress>>({});

  const NAV: { key: SectionKey; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "roles", icon: UserCircle2 },
    { key: "stores", icon: Store },
    { key: "tasks", icon: ClipboardList },
    { key: "expense", icon: Wallet },
    { key: "performance", icon: TrendingUp },
  ];

  function updateProg(storeId: string, patch: (p: StoreProgress) => StoreProgress) {
    setStoreProg((prev) => ({ ...prev, [storeId]: patch(prev[storeId] ?? { ticks: {} }) }));
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{T.employee[lang]}</div>
          <div className="font-semibold">{T.title[lang]}</div>
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">{T.nav[active][lang]}</h1>
          <div className="inline-flex items-center gap-2 border rounded-md p-1 bg-background">
            <Languages className="w-4 h-4 text-muted-foreground ml-1" />
            <Button size="sm" variant={lang === "en" ? "default" : "ghost"} onClick={() => setLang("en")}>English</Button>
            <Button size="sm" variant={lang === "hi" ? "default" : "ghost"} onClick={() => setLang("hi")}>हिन्दी</Button>
          </div>
        </div>

        {active === "roles" && (
          <Card>
            <CardHeader><CardTitle className="text-base">{T.nav.roles[lang]}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5 text-sm">
                {ROLES[lang].map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {active === "stores" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {lang === "en"
                ? "Stores are assigned by the Training & Manpower Centre. Update your location once you reach the store to unlock the task list."
                : "स्टोर प्रशिक्षण एवं मैनपावर केंद्र द्वारा सौंपे जाते हैं। पहुँचने पर स्थान अपडेट करें ताकि कार्य सूची खुले।"}
            </p>
            {INITIAL_STORES.map((s) => (
              <StoreWorkflowCard
                key={s.id}
                store={s}
                lang={lang}
                open={expanded === s.id}
                onToggle={() => setExpanded((v) => (v === s.id ? null : s.id))}
                prog={storeProg[s.id] ?? { ticks: {} }}
                update={(fn) => updateProg(s.id, fn)}
              />
            ))}
          </div>
        )}

        {active === "tasks" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                {T.centre[lang]}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {lang === "en"
                  ? "All tasks below are pushed by the Training & Manpower Centre. Mark them done as you complete them."
                  : "नीचे सभी कार्य प्रशिक्षण एवं मैनपावर केंद्र द्वारा दिए गए हैं। पूर्ण होने पर चिह्नित करें।"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {tasks.map((t) => (
                  <div key={t.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className={`text-sm font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>
                        {t.text[lang]}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {T.assignedBy[lang]}: {t.assignedBy} · {T.due[lang]}: {t.due}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {lang === "en" ? "Assigned" : "सौंपा गया"}: <span className="tabular-nums text-foreground">{fmtDT(t.assignedAt)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <CheckCircle2 className={`w-3 h-3 ${t.done ? "text-emerald-600" : ""}`} />
                          {lang === "en" ? "Completed" : "पूर्ण"}: <span className="tabular-nums text-foreground">{fmtDT(t.completedAt)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={t.done ? "default" : "secondary"}>{t.done ? T.done[lang] : T.pending[lang]}</Badge>
                      <Button size="sm" variant={t.done ? "outline" : "default"}
                        onClick={() => setTasks((prev) => prev.map((p) => (p.id === t.id ? { ...p, done: !p.done, completedAt: !p.done ? new Date().toISOString() : undefined } : p)))}>
                        {t.done ? T.reopen[lang] : T.markDone[lang]}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {active === "expense" && (
          <ExpenseSheet stores={INITIAL_STORES} entries={entries} setEntries={setEntries} lang={lang} />
        )}

        {active === "performance" && (
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { label: T.storesTrained[lang], value: 12, icon: CheckCircle2, tone: "text-emerald-500" },
              { label: T.ongoing[lang], value: 3, icon: Clock, tone: "text-sky-500" },
              { label: T.onTime[lang], value: "92%", icon: TrendingUp, tone: "text-primary" },
              { label: T.avgRating[lang], value: "4.7 / 5", icon: TrendingUp, tone: "text-amber-500" },
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

// ================= Store Workflow Card =================
function StoreWorkflowCard({
  store, lang, open, onToggle, prog, update,
}: {
  store: StoreItem;
  lang: Lang;
  open: boolean;
  onToggle: () => void;
  prog: StoreProgress;
  update: (fn: (p: StoreProgress) => StoreProgress) => void;
}) {
  const locked = !prog.location;
  const allChecklist = [...STORE_SETUP, ...OWNER_TRAINING, ...MANPOWER_TRAINING, ...FLYER_DAYS];
  const doneCount = allChecklist.filter((i) => prog.ticks[i.id]).length
    + (prog.pressmanName && prog.pressmanPhone ? 1 : 0)
    + (prog.allrounderName && prog.allrounderPhone ? 1 : 0)
    + (prog.checkOutDate ? 1 : 0)
    + (prog.ownerReview ? 1 : 0);
  const totalCount = allChecklist.length + 4;
  const pct = Math.round((doneCount / totalCount) * 100);

  function fetchLocation() {
    if (!("geolocation" in navigator)) {
      toast.error(lang === "en" ? "Geolocation not available" : "स्थान उपलब्ध नहीं");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update((p) => ({
          ...p,
          location: {
            lat: +pos.coords.latitude.toFixed(5),
            lng: +pos.coords.longitude.toFixed(5),
            at: new Date().toLocaleString(),
          },
        }));
        toast.success(lang === "en" ? "Location updated" : "स्थान अपडेट किया गया");
      },
      () => toast.error(lang === "en" ? "Unable to fetch location" : "स्थान प्राप्त नहीं"),
    );
  }

  function toggleTick(id: string, photoName?: string) {
    update((p) => {
      const cur = p.ticks[id];
      if (cur) return p; // once clicked, cannot uncheck
      return { ...p, ticks: { ...p.ticks, [id]: { at: new Date().toLocaleDateString(), photoName } } };
    });
  }

  const renderChecklist = (title: string, items: CheckItem[]) => (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="border rounded-md divide-y">
        {items.map((it) => {
          const tick = prog.ticks[it.id];
          return (
            <div key={it.id} className="p-2.5 flex items-start gap-3">
              <Checkbox
                checked={!!tick}
                disabled={!!tick}
                onCheckedChange={() => toggleTick(it.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${tick ? "text-muted-foreground line-through" : ""}`}>{it.label}</div>
                {tick && (
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <Lock className="w-3 h-3" /> {tick.at}
                    {tick.photoName && <span className="inline-flex items-center gap-1"><Camera className="w-3 h-3" />{tick.photoName}</span>}
                  </div>
                )}
              </div>
              {it.photo && !tick && (
                <label className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded cursor-pointer hover:bg-muted/50">
                  <Camera className="w-3.5 h-3.5" />
                  {lang === "en" ? "Upload photo" : "फोटो अपलोड"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) toggleTick(it.id, f.name);
                    }} />
                </label>
              )}
              {it.whatsapp && !tick && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleTick(it.id)}>
                  {lang === "en" ? "Uploaded on WhatsApp" : "WhatsApp पर अपलोड"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button className="flex items-center gap-2 text-left min-w-0" onClick={onToggle}>
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Store className="w-4 h-4 text-primary" />
            <div className="min-w-0">
              <div className="font-semibold truncate">{store.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {store.city} · {T.assignedBy[lang]}: {store.assignedBy}
              </div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{store.status[lang]}</Badge>
            {prog.checkOutDate && (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                {lang === "en" ? "Checked out" : "चेक-आउट"}
              </Badge>
            )}
          </div>
        </div>
        {!open && (
          <div className="mt-2 flex items-center gap-3">
            <Progress value={pct} className="h-2" />
            <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">{pct}%</span>
          </div>
        )}
      </CardHeader>

      {open && (
        <CardContent className="space-y-5">
          {/* Location */}
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="w-4 h-4 text-primary" />
                {lang === "en" ? "Update location when you reach the store" : "स्टोर पहुँचने पर स्थान अपडेट करें"}
              </div>
              {prog.location ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                  {prog.location.lat}, {prog.location.lng} · {prog.location.at}
                </Badge>
              ) : (
                <Button size="sm" onClick={fetchLocation}>
                  <MapPin className="w-4 h-4 mr-1" />
                  {lang === "en" ? "Fetch & Update Location" : "स्थान प्राप्त करें"}
                </Button>
              )}
            </div>
            {locked && (
              <p className="text-[11px] text-muted-foreground mt-2">
                {lang === "en"
                  ? "Task list will unlock after location is updated."
                  : "स्थान अपडेट होने पर कार्य सूची खुलेगी।"}
              </p>
            )}
          </div>

          <div className={locked ? "opacity-50 pointer-events-none space-y-5" : "space-y-5"}>
            {renderChecklist(lang === "en" ? "1. Store Setup Essential" : "1. स्टोर सेटअप", STORE_SETUP)}
            {renderChecklist(lang === "en" ? "Owner Training" : "मालिक प्रशिक्षण", OWNER_TRAINING)}
            {renderChecklist(lang === "en" ? "Manpower Trainer" : "स्टाफ प्रशिक्षण", MANPOWER_TRAINING)}
            {renderChecklist(lang === "en" ? "BTL Marketing — Flyer Distribution" : "BTL मार्केटिंग — फ्लायर वितरण", FLYER_DAYS)}

            {/* Pressman */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="border rounded-md p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lang === "en" ? "Pressman Trained" : "प्रशिक्षित प्रेसमैन"}
                </div>
                <Input placeholder={lang === "en" ? "Name" : "नाम"} value={prog.pressmanName ?? ""}
                  onChange={(e) => update((p) => ({ ...p, pressmanName: e.target.value }))} />
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-7" placeholder={lang === "en" ? "Phone number" : "फोन नंबर"}
                    value={prog.pressmanPhone ?? ""}
                    onChange={(e) => update((p) => ({ ...p, pressmanPhone: e.target.value }))} />
                </div>
              </div>
              <div className="border rounded-md p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lang === "en" ? "All-Rounder Trained" : "प्रशिक्षित ऑल-राउंडर"}
                </div>
                <Input placeholder={lang === "en" ? "Name" : "नाम"} value={prog.allrounderName ?? ""}
                  onChange={(e) => update((p) => ({ ...p, allrounderName: e.target.value }))} />
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-7" placeholder={lang === "en" ? "Phone number" : "फोन नंबर"}
                    value={prog.allrounderPhone ?? ""}
                    onChange={(e) => update((p) => ({ ...p, allrounderPhone: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Check-out + Owner review */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="border rounded-md p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lang === "en" ? "Check-out Date" : "चेक-आउट तिथि"}
                </div>
                {prog.checkOutDate ? (
                  <div className="text-sm flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium">{prog.checkOutDate}</span>
                  </div>
                ) : (
                  <Input type="date" value=""
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) update((p) => ({ ...p, checkOutDate: v }));
                    }} />
                )}
                <p className="text-[11px] text-muted-foreground">
                  {lang === "en" ? "Once filled, cannot be changed." : "एक बार भरने पर बदला नहीं जा सकता।"}
                </p>
              </div>
              <div className="border rounded-md p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lang === "en" ? "WhatsApp Review by Owner" : "मालिक द्वारा WhatsApp रिव्यू"}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!prog.ownerReview}
                    disabled={!!prog.ownerReview}
                    onCheckedChange={() => update((p) => ({ ...p, ownerReview: true }))}
                  />
                  {lang === "en" ? "Owner review received on WhatsApp" : "मालिक का रिव्यू WhatsApp पर प्राप्त"}
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ============ Expense Sheet ============
function ExpenseSheet({
  stores, entries, setEntries, lang,
}: {
  stores: StoreItem[];
  entries: ExpenseEntry[];
  setEntries: React.Dispatch<React.SetStateAction<ExpenseEntry[]>>;
  lang: Lang;
}) {
  const today = todayStr();
  const eligibleCats = CAT_META.filter((c) => EXPENSE_ELIGIBILITY[c.key]);
  const missingStores = useMemo(
    () => stores.filter((s) => !entries.some((e) => e.storeId === s.id && e.date === today)),
    [stores, entries, today],
  );

  const totalToday = entries.filter((e) => e.date === today).reduce((a, e) => a + e.amount, 0);
  const totalMonth = entries.reduce((a, e) => a + e.amount, 0);

  function addEntry(entry: Omit<ExpenseEntry, "id">) {
    if (!EXPENSE_ELIGIBILITY[entry.category]) {
      toast.error(lang === "en" ? "Not eligible for this category" : "इस श्रेणी के लिए पात्र नहीं");
      return;
    }
    setEntries((p) => [{ ...entry, id: Math.random().toString(36).slice(2) }, ...p]);
  }

  const catLabel = (k: ExpenseCat) => T[k][lang];

  return (
    <div className="space-y-4">
      {/* Eligibility banner */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{T.eligibleBy[lang]}:</span>
            {CAT_META.map((c) => (
              <Badge key={c.key}
                variant={EXPENSE_ELIGIBILITY[c.key] ? "default" : "secondary"}
                className={EXPENSE_ELIGIBILITY[c.key] ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "opacity-60 line-through"}>
                {catLabel(c.key)} · {EXPENSE_ELIGIBILITY[c.key] ? T.eligible[lang] : T.notEligible[lang]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{T.todaysSpend[lang]}</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">₹{totalToday.toLocaleString("en-IN")}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{T.entriesToday[lang]}</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{entries.filter((e) => e.date === today).length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{T.storesPending[lang]}</div>
          <div className={cn("text-2xl font-semibold tabular-nums mt-1", missingStores.length ? "text-red-600" : "text-emerald-600")}>
            {missingStores.length}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{T.totalMonth[lang]}</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">₹{totalMonth.toLocaleString("en-IN")}</div>
        </CardContent></Card>
      </div>

      {stores.map((s) => {
        const storeEntries = entries.filter((e) => e.storeId === s.id);
        const todays = storeEntries.filter((e) => e.date === today);
        const totals: Record<ExpenseCat, number> = { food: 0, accommodation: 0, transportation: 0 };
        storeEntries.forEach((e) => { totals[e.category] += e.amount; });
        return (
          <Card key={s.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />{s.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {todays.length === 0 ? (
                    <Badge variant="destructive">{T.notUpdated[lang]}</Badge>
                  ) : (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                      {todays.length} {todays.length > 1 ? T.entriesTodayShort[lang] : T.entryToday[lang]}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {CAT_META.map((c) => {
                  const Icon = c.icon;
                  const isEligible = EXPENSE_ELIGIBILITY[c.key];
                  return (
                    <div key={c.key} className={cn("border rounded-md p-2", isEligible ? "bg-muted/10" : "bg-muted/30 opacity-60")}>
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("w-3.5 h-3.5", c.tone)} />
                        <span className="text-[11px] text-muted-foreground">{catLabel(c.key)}</span>
                        {!isEligible && <Lock className="w-3 h-3 text-muted-foreground ml-auto" />}
                      </div>
                      <div className="text-lg font-semibold tabular-nums mt-0.5">₹{totals[c.key].toLocaleString("en-IN")}</div>
                    </div>
                  );
                })}
              </div>

              <ExpenseAddRow
                lang={lang}
                eligibleCats={eligibleCats.map((c) => c.key)}
                onAdd={(cat, amount, note, proofName) =>
                  addEntry({ storeId: s.id, storeName: s.name, category: cat, date: today, amount, note, proofName })
                }
              />

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
                              <span className="text-muted-foreground"> · {catLabel(e.category)} · {e.date}</span>
                            </div>
                            {(e.note || e.proofName) && (
                              <div className="text-[11px] text-muted-foreground truncate">
                                {e.note}
                                {e.note && e.proofName ? " · " : ""}
                                {e.proofName && (
                                  <span className="inline-flex items-center gap-1"><Upload className="w-3 h-3" />{e.proofName}</span>
                                )}
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
    </div>
  );
}

function ExpenseAddRow({
  lang, onAdd, eligibleCats,
}: {
  lang: Lang;
  onAdd: (cat: ExpenseCat, amount: number, note: string, proofName?: string) => void;
  eligibleCats: ExpenseCat[];
}) {
  const [cat, setCat] = useState<ExpenseCat>(eligibleCats[0] ?? "food");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [proofName, setProofName] = useState<string | undefined>(undefined);

  function submit() {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    onAdd(cat, amt, note.trim(), proofName);
    setAmount(""); setNote(""); setProofName(undefined);
  }

  if (eligibleCats.length === 0) {
    return (
      <div className="border rounded-md p-3 text-xs text-muted-foreground bg-muted/20">
        {lang === "en"
          ? "You are not eligible to log expenses. Contact Training & Manpower Centre."
          : "आप खर्च दर्ज करने के पात्र नहीं हैं। कृपया प्रशिक्षण एवं मैनपावर केंद्र से संपर्क करें।"}
      </div>
    );
  }

  return (
    <div className="border rounded-md p-2 bg-background grid grid-cols-1 md:grid-cols-[140px_120px_1fr_auto_auto] gap-2 items-center">
      <select value={cat} onChange={(e) => setCat(e.target.value as ExpenseCat)}
        className="h-9 rounded-md border bg-background px-2 text-sm">
        {eligibleCats.map((k) => (
          <option key={k} value={k}>{T[k][lang]}</option>
        ))}
      </select>
      <Input type="number" inputMode="decimal" placeholder={T.amount[lang]} value={amount}
        onChange={(e) => setAmount(e.target.value)} />
      <Input placeholder={T.noteOpt[lang]} value={note} onChange={(e) => setNote(e.target.value)} />
      <label className="inline-flex items-center gap-1.5 text-xs px-2 py-2 border rounded-md cursor-pointer hover:bg-muted/50 whitespace-nowrap">
        <Upload className="w-3.5 h-3.5" />
        {proofName ? T.changeProof[lang] : T.uploadProof[lang]}
        <input type="file" className="hidden" accept="image/*,application/pdf"
          onChange={(e) => setProofName(e.target.files?.[0]?.name)} />
      </label>
      <Button size="sm" onClick={submit} disabled={!amount}>
        <Plus className="w-4 h-4 mr-1" /> {T.add[lang]}
      </Button>
    </div>
  );
}
