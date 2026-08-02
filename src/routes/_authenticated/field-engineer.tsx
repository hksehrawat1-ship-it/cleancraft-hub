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
import { FieldEngineerHome } from "@/components/field-engineer/home";
import { FieldEngineerExpenses } from "@/components/field-engineer/expenses";
import { FieldEngineerMyJobs } from "@/components/field-engineer/my-jobs";
import { FieldEngineerWorkReport } from "@/components/field-engineer/work-report";
import { FieldEngineerVisitSchedule } from "@/components/field-engineer/visit-schedule";
import { FieldEngineerHelpGuides } from "@/components/field-engineer/help-guides";
import {
  JOBS,
  JOB_STATUS_LABEL,
  PRIORITY_LABEL,
  priorityTone,
  statusTone,
  type Bi,
  type Job,
  type Lang,
} from "@/components/field-engineer/data";
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

/* ---------------- Shared sample data (imported) ---------------- */
const STATUS_LABEL = JOB_STATUS_LABEL;

function FieldEngineerDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [active, setActive] = useState<SectionKey>("home");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full flex-col bg-muted/30 md:flex-row">
      {/* Mobile top nav */}
      <div className="border-b bg-background md:hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <HardHat className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-semibold">{T.title[lang]}</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {T.nav[item.key][lang]}
              </button>
            );
          })}
        </nav>
      </div>

      <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
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

      <main className="min-w-0 flex-1 space-y-4 overflow-auto p-4 md:p-6">
        {active !== "home" && (
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
        )}

        {active === "home" && <FieldEngineerHome lang={lang} setLang={setLang} onGo={setActive} />}
        {active === "jobs" && <FieldEngineerMyJobs lang={lang} onGo={setActive} />}
        {active === "schedule" && <FieldEngineerVisitSchedule lang={lang} onGo={setActive} />}
        {active === "report" && <FieldEngineerWorkReport lang={lang} />}
        {active === "expenses" && <FieldEngineerExpenses lang={lang} />}
        {active === "help" && <FieldEngineerHelpGuides lang={lang} />}
      </main>
    </div>
  );
}
