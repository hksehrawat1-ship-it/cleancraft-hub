import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Languages,
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

type Lang = "en" | "hi";
type Bi = { en: string; hi: string };
type SectionKey = "home" | "jobs" | "schedule" | "report" | "expenses" | "help";

const T = {
  employee: { en: "Employee", hi: "कर्मचारी" },
  title: { en: "Field Engineer", hi: "फील्ड इंजीनियर" },
  nav: {
    home: { en: "Home", hi: "होम" },
    jobs: { en: "My Jobs", hi: "मेरे कार्य" },
    schedule: { en: "Visit Schedule", hi: "विज़िट शेड्यूल" },
    report: { en: "Submit Work Report", hi: "कार्य रिपोर्ट जमा करें" },
    expenses: { en: "My Expenses", hi: "मेरे खर्च" },
    help: { en: "Help & Guides", hi: "सहायता एवं गाइड" },
  } as Record<SectionKey, Bi>,
  greeting: { en: "Good morning, Engineer", hi: "सुप्रभात, इंजीनियर" },
  greetingSub: {
    en: "Your day at a glance — visits, blockers and pending reports.",
    hi: "आपका दिन एक नज़र में — विज़िट, बाधाएँ और लंबित रिपोर्ट।",
  },
  jobsToday: { en: "Jobs Today", hi: "आज के कार्य" },
  completed: { en: "Completed", hi: "पूर्ण" },
  inTransit: { en: "In Transit", hi: "रास्ते में" },
  awaitingParts: { en: "Awaiting Parts", hi: "पार्ट्स की प्रतीक्षा" },
  scheduled: { en: "Scheduled", hi: "निर्धारित" },
  nextVisit: { en: "Next Visit", hi: "अगली विज़िट" },
  callOwner: { en: "Call Owner", hi: "मालिक को कॉल करें" },
  reachedSite: { en: "Reached Site", hi: "साइट पर पहुँचे" },
  submitReport: { en: "Submit Report", hi: "रिपोर्ट जमा करें" },
  jobsSub: {
    en: "All jobs assigned to you by Technical Support.",
    hi: "तकनीकी सहायता द्वारा आपको सौंपे गए सभी कार्य।",
  },
  searchJobs: { en: "Search store or job id...", hi: "स्टोर या जॉब आईडी खोजें..." },
  allStatuses: { en: "All statuses", hi: "सभी स्थितियाँ" },
  noJobs: { en: "No jobs found.", hi: "कोई कार्य नहीं मिला।" },
  viewDetails: { en: "View details", hi: "विवरण देखें" },
  hideDetails: { en: "Hide details", hi: "विवरण छिपाएँ" },
  ownerPhone: { en: "Owner phone", hi: "मालिक का फोन" },
  machine: { en: "Machine", hi: "मशीन" },
  reportedIssue: { en: "Reported issue", hi: "बताई गई समस्या" },
  scheduleSub: {
    en: "Time-slotted plan for your site visits.",
    hi: "आपकी साइट विज़िट का समय-निर्धारित प्लान।",
  },
  today: { en: "Today", hi: "आज" },
  tomorrow: { en: "Tomorrow", hi: "कल" },
  startTravel: { en: "Start Travel", hi: "यात्रा शुरू करें" },
  notifyOwner: { en: "Notify Owner", hi: "मालिक को सूचित करें" },
  reportSub: {
    en: "One report per visit. Reports close the job and update the store record.",
    hi: "हर विज़िट पर एक रिपोर्ट। रिपोर्ट से कार्य बंद होता है और स्टोर रिकॉर्ड अपडेट होता है।",
  },
  visitReport: { en: "Visit Report", hi: "विज़िट रिपोर्ट" },
  job: { en: "Job", hi: "कार्य" },
  selectJob: { en: "Select job", hi: "कार्य चुनें" },
  outcome: { en: "Outcome", hi: "परिणाम" },
  selectOutcome: { en: "Select outcome", hi: "परिणाम चुनें" },
  workCompleted: { en: "Work completed", hi: "किया गया कार्य" },
  workPlaceholder: {
    en: "Describe the work done on site...",
    hi: "साइट पर किए गए कार्य का विवरण लिखें...",
  },
  rootCause: { en: "Root cause", hi: "मूल कारण" },
  rootCausePh: { en: "e.g. worn drum bearing", hi: "जैसे घिसा हुआ ड्रम बेयरिंग" },
  partsUsed: { en: "Parts used / required", hi: "उपयोग/आवश्यक पार्ट्स" },
  partsPh: { en: "e.g. bearing kit, heating coil", hi: "जैसे बेयरिंग किट, हीटिंग कॉइल" },
  nextAction: { en: "Next action (if not resolved)", hi: "अगला कदम (यदि हल न हुआ हो)" },
  nextActionPh: {
    en: "e.g. revisit after part delivery on Thu",
    hi: "जैसे गुरुवार को पार्ट आने के बाद दोबारा विज़िट",
  },
  custConfirm: {
    en: "Customer confirmed machine is working",
    hi: "ग्राहक ने पुष्टि की कि मशीन चल रही है",
  },
  recentReports: { en: "Recent Reports", hi: "हाल की रिपोर्टें" },
  errSelectJob: {
    en: "Select job, add work done and outcome",
    hi: "कार्य चुनें, किया गया कार्य और परिणाम भरें",
  },
  errConfirm: {
    en: "Customer confirmation required to close the job",
    hi: "कार्य बंद करने के लिए ग्राहक की पुष्टि आवश्यक है",
  },
  reportSubmitted: { en: "Work report submitted", hi: "कार्य रिपोर्ट जमा हो गई" },
  expensesSub: {
    en: "Travel, food and part purchases from field visits.",
    hi: "फील्ड विज़िट के यात्रा, भोजन और पार्ट्स खर्च।",
  },
  thisMonth: { en: "This Month", hi: "इस माह" },
  pendingApproval: { en: "Pending Approval", hi: "स्वीकृति लंबित" },
  approved: { en: "Approved", hi: "स्वीकृत" },
  pending: { en: "Pending", hi: "लंबित" },
  addExpense: { en: "Add Expense", hi: "खर्च जोड़ें" },
  type: { en: "Type", hi: "प्रकार" },
  select: { en: "Select", hi: "चुनें" },
  note: { en: "Note", hi: "टिप्पणी" },
  notePh: { en: "Store / purpose", hi: "स्टोर / उद्देश्य" },
  amount: { en: "Amount (₹)", hi: "राशि (₹)" },
  submitExpense: { en: "Submit Expense", hi: "खर्च जमा करें" },
  expenseHistory: { en: "Expense History", hi: "खर्च इतिहास" },
  errExpense: { en: "Select type and enter amount", hi: "प्रकार चुनें और राशि भरें" },
  expenseAdded: {
    en: "Expense submitted for approval",
    hi: "खर्च स्वीकृति के लिए जमा किया गया",
  },
  helpSub: {
    en: "Approved service SOPs and safety checklists.",
    hi: "स्वीकृत सर्विस SOP एवं सुरक्षा चेकलिस्ट।",
  },
  searchGuides: { en: "Search guides...", hi: "गाइड खोजें..." },
  safetyFirst: { en: "Safety first", hi: "सुरक्षा सर्वोपरि" },
  safetyText: {
    en: "Always isolate power before opening any machine panel. Report smoke, water or shock risk to Technical Support immediately.",
    hi: "कोई भी मशीन पैनल खोलने से पहले बिजली अवश्य बंद करें। धुआँ, पानी या करंट का खतरा तुरंत तकनीकी सहायता को बताएँ।",
  },
  open: { en: "Open", hi: "खोलें" },
  pages: { en: "pages", hi: "पेज" },
  escalation: { en: "Escalation Contacts", hi: "एस्केलेशन संपर्क" },
  calling: { en: "Calling", hi: "कॉल कर रहे हैं" },
  travelStarted: { en: "Travel started", hi: "यात्रा शुरू हुई" },
  ownerNotified: { en: "Owner notified", hi: "मालिक को सूचित किया गया" },
  markedReached: { en: "Marked as reached site", hi: "साइट पर पहुँचना दर्ज किया गया" },
  guideDownloaded: { en: "Guide downloaded", hi: "गाइड डाउनलोड हुई" },
} as const;

const NAV: { key: SectionKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home", icon: Home },
  { key: "jobs", icon: Wrench },
  { key: "schedule", icon: CalendarDays },
  { key: "report", icon: FileText },
  { key: "expenses", icon: Receipt },
  { key: "help", icon: BookOpen },
];

/* ---------------- Shared sample data ---------------- */
type Job = {
  id: string;
  store: Bi;
  owner: string;
  phone: string;
  issue: Bi;
  machine: Bi;
  priority: "safety" | "breakdown" | "normal";
  status: "scheduled" | "transit" | "parts" | "completed";
  slot: Bi;
  city: Bi;
};

const PRIORITY_LABEL: Record<Job["priority"], Bi> = {
  safety: { en: "Safety Critical", hi: "सुरक्षा गंभीर" },
  breakdown: { en: "Breakdown", hi: "मशीन बंद" },
  normal: { en: "Normal", hi: "सामान्य" },
};

const STATUS_LABEL: Record<Job["status"], Bi> = {
  scheduled: T.scheduled,
  transit: T.inTransit,
  parts: T.awaitingParts,
  completed: T.completed,
};

const JOBS: Job[] = [
  {
    id: "FE-2041",
    store: { en: "Jaipur — Vaishali Nagar", hi: "जयपुर — वैशाली नगर" },
    owner: "Rahul Sharma",
    phone: "+91 98290 11223",
    issue: {
      en: "Washer drum vibration + error E04",
      hi: "वॉशर ड्रम में कंपन + एरर E04",
    },
    machine: { en: "Washer 12kg", hi: "वॉशर 12 किग्रा" },
    priority: "safety",
    status: "transit",
    slot: { en: "10:00 AM", hi: "सुबह 10:00" },
    city: { en: "Jaipur", hi: "जयपुर" },
  },
  {
    id: "FE-2042",
    store: { en: "Indore — Vijay Nagar", hi: "इंदौर — विजय नगर" },
    owner: "Neha Agarwal",
    phone: "+91 90390 44551",
    issue: { en: "Dryer heating coil replacement", hi: "ड्रायर हीटिंग कॉइल बदलना" },
    machine: { en: "Dryer 10kg", hi: "ड्रायर 10 किग्रा" },
    priority: "breakdown",
    status: "scheduled",
    slot: { en: "12:30 PM", hi: "दोपहर 12:30" },
    city: { en: "Indore", hi: "इंदौर" },
  },
  {
    id: "FE-2043",
    store: { en: "Lucknow — Gomti Nagar", hi: "लखनऊ — गोमती नगर" },
    owner: "Amit Verma",
    phone: "+91 99350 77812",
    issue: { en: "Steam iron boiler pressure drop", hi: "स्टीम आयरन बॉयलर प्रेशर कम" },
    machine: { en: "Steam Iron", hi: "स्टीम आयरन" },
    priority: "normal",
    status: "scheduled",
    slot: { en: "3:00 PM", hi: "दोपहर 3:00" },
    city: { en: "Lucknow", hi: "लखनऊ" },
  },
  {
    id: "FE-2039",
    store: { en: "Surat — Adajan", hi: "सूरत — अडाजण" },
    owner: "Kiran Patel",
    phone: "+91 98250 33440",
    issue: {
      en: "Machine installation & commissioning",
      hi: "मशीन इंस्टॉलेशन एवं कमीशनिंग",
    },
    machine: { en: "Full Setup", hi: "पूर्ण सेटअप" },
    priority: "normal",
    status: "completed",
    slot: { en: "Yesterday", hi: "कल" },
    city: { en: "Surat", hi: "सूरत" },
  },
  {
    id: "FE-2036",
    store: { en: "Pune 2 — Kothrud", hi: "पुणे 2 — कोथरुड" },
    owner: "Sagar Joshi",
    phone: "+91 91750 66220",
    issue: {
      en: "Awaiting spare part (control board)",
      hi: "स्पेयर पार्ट की प्रतीक्षा (कंट्रोल बोर्ड)",
    },
    machine: { en: "Washer 8kg", hi: "वॉशर 8 किग्रा" },
    priority: "breakdown",
    status: "parts",
    slot: { en: "Hold", hi: "रोका गया" },
    city: { en: "Pune", hi: "पुणे" },
  },
];

function priorityTone(p: Job["priority"]) {
  if (p === "safety") return "bg-red-600 text-white";
  if (p === "breakdown") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-muted text-muted-foreground";
}

function statusTone(s: Job["status"]) {
  if (s === "completed") return "text-emerald-600";
  if (s === "transit") return "text-primary";
  if (s === "parts") return "text-amber-600";
  return "text-blue-600";
}

function FieldEngineerDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [active, setActive] = useState<SectionKey>("home");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {T.employee[lang]}
          </div>
          <div className="font-semibold flex items-center gap-2">
            <HardHat className="w-4 h-4 text-primary" />
            {T.title[lang]}
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
                <span className="text-left">{T.nav[item.key][lang]}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 p-6 overflow-auto space-y-4">
        <div className="flex items-center justify-end">
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

        {active === "home" && <HomeSection lang={lang} onGo={setActive} />}
        {active === "jobs" && <JobsSection lang={lang} />}
        {active === "schedule" && <ScheduleSection lang={lang} />}
        {active === "report" && <ReportSection lang={lang} />}
        {active === "expenses" && <ExpensesSection lang={lang} />}
        {active === "help" && <HelpSection lang={lang} />}
      </main>
    </div>
  );
}

/* ---------------- Home ---------------- */
function HomeSection({ lang, onGo }: { lang: Lang; onGo: (k: SectionKey) => void }) {
  const stats = [
    { label: T.jobsToday[lang], value: 3, icon: CalendarDays, tone: "text-blue-600" },
    { label: T.completed[lang], value: 1, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: T.inTransit[lang], value: 1, icon: Truck, tone: "text-primary" },
    { label: T.awaitingParts[lang], value: 1, icon: AlertTriangle, tone: "text-amber-600" },
  ];
  const next = JOBS[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{T.greeting[lang]}</h1>
        <p className="text-sm text-muted-foreground">{T.greetingSub[lang]}</p>
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
            <MapPin className="w-4 h-4 text-primary" /> {T.nextVisit[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{next.store[lang]}</span>
            <Badge className={priorityTone(next.priority)}>{PRIORITY_LABEL[next.priority][lang]}</Badge>
            <span className="text-xs text-muted-foreground">{next.slot[lang]}</span>
          </div>
          <p className="text-sm text-muted-foreground">{next.issue[lang]}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => toast.success(`${T.calling[lang]} ${next.owner}`)}>
              <Phone className="w-3.5 h-3.5 mr-1" /> {T.callOwner[lang]}
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success(T.markedReached[lang])}>
              <MapPin className="w-3.5 h-3.5 mr-1" /> {T.reachedSite[lang]}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onGo("report")}>
              <FileText className="w-3.5 h-3.5 mr-1" /> {T.submitReport[lang]}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["jobs", "schedule", "expenses"] as SectionKey[]).map((key) => {
          const Icon = NAV.find((n) => n.key === key)!.icon;
          return (
            <button
              key={key}
              onClick={() => onGo(key)}
              className="border rounded-md p-4 bg-background hover:bg-muted text-left transition-colors"
            >
              <Icon className="w-4 h-4 text-primary" />
              <div className="mt-2 text-sm font-medium">{T.nav[key][lang]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- My Jobs ---------------- */
function JobsSection({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      JOBS.filter((j) => {
        const t = q.trim().toLowerCase();
        const matchQ =
          !t ||
          j.store[lang].toLowerCase().includes(t) ||
          j.store.en.toLowerCase().includes(t) ||
          j.id.toLowerCase().includes(t) ||
          j.issue[lang].toLowerCase().includes(t);
        const matchS = status === "all" || j.status === status;
        return matchQ && matchS;
      }),
    [q, status, lang],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{T.nav.jobs[lang]}</h1>
          <p className="text-sm text-muted-foreground">{T.jobsSub[lang]}</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={T.searchJobs[lang]}
              className="pl-9 w-56"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{T.allStatuses[lang]}</SelectItem>
              {(Object.keys(STATUS_LABEL) as Job["status"][]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s][lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">{T.noJobs[lang]}</div>
        )}
        {filtered.map((j) => (
          <Card key={j.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{j.id}</span>
                  <span className="font-medium">{j.store[lang]}</span>
                  <Badge className={priorityTone(j.priority)}>{PRIORITY_LABEL[j.priority][lang]}</Badge>
                </div>
                <div className={`text-xs font-medium ${statusTone(j.status)}`}>
                  {STATUS_LABEL[j.status][lang]}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{j.issue[lang]}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> {j.machine[lang]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {j.slot[lang]}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {j.city[lang]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`${T.calling[lang]} ${j.owner}`)}
                >
                  <Phone className="w-3.5 h-3.5 mr-1" /> {j.owner}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpenId(openId === j.id ? null : j.id)}
                >
                  {openId === j.id ? T.hideDetails[lang] : T.viewDetails[lang]}
                </Button>
              </div>
              {openId === j.id && (
                <div className="border rounded-md p-3 bg-muted/30 text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">{T.ownerPhone[lang]}: </span>
                    {j.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{T.machine[lang]}: </span>
                    {j.machine[lang]}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{T.reportedIssue[lang]}: </span>
                    {j.issue[lang]}
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
function ScheduleSection({ lang }: { lang: Lang }) {
  const days = [
    {
      day: T.today[lang],
      items: JOBS.filter((j) => j.status === "scheduled" || j.status === "transit"),
    },
    { day: T.tomorrow[lang], items: [JOBS[4], JOBS[2]] },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{T.nav.schedule[lang]}</h1>
        <p className="text-sm text-muted-foreground">{T.scheduleSub[lang]}</p>
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
                  <div className="text-sm font-semibold tabular-nums w-24">{j.slot[lang]}</div>
                  <div>
                    <div className="text-sm font-medium">{j.store[lang]}</div>
                    <div className="text-xs text-muted-foreground">{j.issue[lang]}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(T.travelStarted[lang])}
                  >
                    <Truck className="w-3.5 h-3.5 mr-1" /> {T.startTravel[lang]}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success(T.ownerNotified[lang])}>
                    {T.notifyOwner[lang]}
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
const OUTCOMES: { key: string; label: Bi }[] = [
  { key: "resolved", label: { en: "Resolved On-Site", hi: "साइट पर हल हुआ" } },
  {
    key: "partial",
    label: { en: "Partially Resolved — Monitoring", hi: "आंशिक रूप से हल — निगरानी में" },
  },
  { key: "part", label: { en: "Part Required", hi: "पार्ट आवश्यक" } },
  { key: "revisit", label: { en: "Revisit Needed", hi: "दोबारा विज़िट आवश्यक" } },
];

function ReportSection({ lang }: { lang: Lang }) {
  const [form, setForm] = useState({
    job: "",
    workDone: "",
    rootCause: "",
    parts: "",
    outcome: "",
    nextAction: "",
    customerConfirmed: false,
  });
  const [submitted, setSubmitted] = useState<
    { job: string; outcome: string; workDone: string; at: Bi }[]
  >([
    {
      job: "FE-2039 — Surat Adajan",
      outcome: "resolved",
      workDone:
        lang === "hi"
          ? "पूर्ण सेटअप इंस्टॉल एवं कमीशन किया, मालिक को स्टार्ट-अप प्रशिक्षण दिया।"
          : "Installed and commissioned full setup, trained owner on start-up.",
      at: { en: "Yesterday, 6:40 PM", hi: "कल, शाम 6:40" },
    },
  ]);

  function submit() {
    if (!form.job || !form.workDone || !form.outcome) {
      return toast.error(T.errSelectJob[lang]);
    }
    if (form.outcome === "resolved" && !form.customerConfirmed) {
      return toast.error(T.errConfirm[lang]);
    }
    setSubmitted([
      {
        job: form.job,
        outcome: form.outcome,
        workDone: form.workDone,
        at: { en: "Just now", hi: "अभी" },
      },
      ...submitted,
    ]);
    toast.success(T.reportSubmitted[lang]);
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
        <h1 className="text-2xl font-bold tracking-tight">{T.nav.report[lang]}</h1>
        <p className="text-sm text-muted-foreground">{T.reportSub[lang]}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{T.visitReport[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{T.job[lang]}</Label>
              <Select value={form.job} onValueChange={(v) => setForm({ ...form, job: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={T.selectJob[lang]} />
                </SelectTrigger>
                <SelectContent>
                  {JOBS.filter((j) => j.status !== "completed").map((j) => (
                    <SelectItem key={j.id} value={`${j.id} — ${j.store[lang]}`}>
                      {j.id} — {j.store[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{T.outcome[lang]}</Label>
              <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={T.selectOutcome[lang]} />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((o) => (
                    <SelectItem key={o.key} value={o.key}>
                      {o.label[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{T.workCompleted[lang]}</Label>
            <Textarea
              value={form.workDone}
              onChange={(e) => setForm({ ...form, workDone: e.target.value })}
              placeholder={T.workPlaceholder[lang]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{T.rootCause[lang]}</Label>
              <Input
                value={form.rootCause}
                onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                placeholder={T.rootCausePh[lang]}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{T.partsUsed[lang]}</Label>
              <Input
                value={form.parts}
                onChange={(e) => setForm({ ...form, parts: e.target.value })}
                placeholder={T.partsPh[lang]}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{T.nextAction[lang]}</Label>
            <Input
              value={form.nextAction}
              onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
              placeholder={T.nextActionPh[lang]}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.customerConfirmed}
              onChange={(e) => setForm({ ...form, customerConfirmed: e.target.checked })}
            />
            {T.custConfirm[lang]}
          </label>

          <Button onClick={submit}>
            <FileText className="w-4 h-4 mr-1" /> {T.submitReport[lang]}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{T.recentReports[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {submitted.map((s, i) => (
            <div key={i} className="border rounded-md p-3 bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{s.job}</span>
                <Badge variant="secondary" className="text-[11px]">
                  {OUTCOMES.find((o) => o.key === s.outcome)?.label[lang] ?? s.outcome}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{s.workDone}</p>
              <div className="text-[11px] text-muted-foreground mt-1">{s.at[lang]}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- My Expenses ---------------- */
const EXPENSE_TYPES: { key: string; label: Bi }[] = [
  { key: "travel", label: { en: "Travel", hi: "यात्रा" } },
  { key: "food", label: { en: "Food", hi: "भोजन" } },
  { key: "stay", label: { en: "Stay", hi: "आवास" } },
  { key: "parts", label: { en: "Parts", hi: "पार्ट्स" } },
  { key: "other", label: { en: "Other", hi: "अन्य" } },
];

function ExpensesSection({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<
    { type: string; note: Bi; amount: number; approved: boolean; date: Bi }[]
  >([
    {
      type: "travel",
      note: { en: "Jaipur — bus + auto", hi: "जयपुर — बस + ऑटो" },
      amount: 640,
      approved: true,
      date: { en: "1 Aug", hi: "1 अगस्त" },
    },
    {
      type: "food",
      note: { en: "Site day meal", hi: "साइट दिवस भोजन" },
      amount: 220,
      approved: false,
      date: { en: "1 Aug", hi: "1 अगस्त" },
    },
    {
      type: "parts",
      note: { en: "Bearing kit (local purchase)", hi: "बेयरिंग किट (स्थानीय खरीद)" },
      amount: 1850,
      approved: false,
      date: { en: "31 Jul", hi: "31 जुलाई" },
    },
  ]);
  const [form, setForm] = useState({ type: "", note: "", amount: "" });

  const total = items.reduce((s, i) => s + i.amount, 0);
  const pending = items.filter((i) => !i.approved).reduce((s, i) => s + i.amount, 0);

  function add() {
    const amt = Number(form.amount);
    if (!form.type || !amt) return toast.error(T.errExpense[lang]);
    setItems([
      {
        type: form.type,
        note: { en: form.note, hi: form.note },
        amount: amt,
        approved: false,
        date: { en: "Today", hi: "आज" },
      },
      ...items,
    ]);
    setForm({ type: "", note: "", amount: "" });
    toast.success(T.expenseAdded[lang]);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{T.nav.expenses[lang]}</h1>
        <p className="text-sm text-muted-foreground">{T.expensesSub[lang]}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: T.thisMonth[lang], value: total, tone: "text-primary" },
          { label: T.pendingApproval[lang], value: pending, tone: "text-amber-600" },
          { label: T.approved[lang], value: total - pending, tone: "text-emerald-600" },
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
            <Plus className="w-4 h-4 text-primary" /> {T.addExpense[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>{T.type[lang]}</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={T.select[lang]} />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>{T.note[lang]}</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder={T.notePh[lang]}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{T.amount[lang]}</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <Button className="mt-3" onClick={add}>
            {T.submitExpense[lang]}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{T.expenseHistory[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((i, idx) => (
            <div
              key={idx}
              className="border rounded-md p-3 bg-muted/20 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <div className="text-sm font-medium">
                  {EXPENSE_TYPES.find((t) => t.key === i.type)?.label[lang] ?? i.type}{" "}
                  <span className="text-muted-foreground font-normal">· {i.date[lang]}</span>
                </div>
                <div className="text-xs text-muted-foreground">{i.note[lang]}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums">
                  ₹{i.amount.toLocaleString("en-IN")}
                </span>
                <Badge variant={i.approved ? "secondary" : "outline"} className="text-[11px]">
                  {i.approved ? T.approved[lang] : T.pending[lang]}
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
function HelpSection({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const guides: { title: Bi; cat: Bi; pages: number }[] = [
    {
      title: { en: "Washer Error Codes (E01–E12)", hi: "वॉशर एरर कोड (E01–E12)" },
      cat: { en: "Washer", hi: "वॉशर" },
      pages: 6,
    },
    {
      title: { en: "Dryer Heating Coil Replacement", hi: "ड्रायर हीटिंग कॉइल बदलना" },
      cat: { en: "Dryer", hi: "ड्रायर" },
      pages: 4,
    },
    {
      title: { en: "Steam Iron Boiler Service SOP", hi: "स्टीम आयरन बॉयलर सर्विस SOP" },
      cat: { en: "Steam Iron", hi: "स्टीम आयरन" },
      pages: 5,
    },
    {
      title: {
        en: "Electrical Safety Checklist Before Work",
        hi: "कार्य से पहले विद्युत सुरक्षा चेकलिस्ट",
      },
      cat: { en: "Safety", hi: "सुरक्षा" },
      pages: 2,
    },
    {
      title: { en: "Machine Installation & Commissioning", hi: "मशीन इंस्टॉलेशन एवं कमीशनिंग" },
      cat: { en: "Installation", hi: "इंस्टॉलेशन" },
      pages: 8,
    },
    {
      title: { en: "Spare Part Request Process", hi: "स्पेयर पार्ट अनुरोध प्रक्रिया" },
      cat: { en: "Process", hi: "प्रक्रिया" },
      pages: 3,
    },
  ];
  const filtered = guides.filter(
    (g) =>
      !q.trim() ||
      g.title[lang].toLowerCase().includes(q.toLowerCase()) ||
      g.cat[lang].toLowerCase().includes(q.toLowerCase()),
  );

  const contacts: { role: Bi; name: string; phone: string }[] = [
    {
      role: { en: "Technical Support", hi: "तकनीकी सहायता" },
      name: "Rohit Nair",
      phone: "+91 98110 22334",
    },
    { role: { en: "Service Head", hi: "सर्विस हेड" }, name: "Vikas Mehta", phone: "+91 98110 55667" },
    {
      role: { en: "Spare Parts Desk", hi: "स्पेयर पार्ट्स डेस्क" },
      name: "Store Team",
      phone: "+91 98110 88990",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{T.nav.help[lang]}</h1>
          <p className="text-sm text-muted-foreground">{T.helpSub[lang]}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={T.searchGuides[lang]}
            className="pl-9 w-64"
          />
        </div>
      </div>

      <Card className="border-amber-300">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">{T.safetyFirst[lang]}</div>
            <p className="text-muted-foreground">{T.safetyText[lang]}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((g) => (
          <Card key={g.title.en}>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{g.title[lang]}</div>
                <div className="text-xs text-muted-foreground">
                  {g.cat[lang]} · {g.pages} {T.pages[lang]}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success(T.guideDownloaded[lang])}
              >
                <Download className="w-3.5 h-3.5 mr-1" /> {T.open[lang]}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{T.escalation[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contacts.map((c) => (
            <div
              key={c.name}
              className="border rounded-md p-3 bg-muted/20 flex items-center justify-between gap-2"
            >
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.role[lang]}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success(`${T.calling[lang]} ${c.name}`)}
              >
                <Phone className="w-3.5 h-3.5 mr-1" /> {c.phone}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
