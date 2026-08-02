import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { JOBS, type Bi, type Lang } from "@/components/field-engineer/data";
import {
  Search,
  Phone,
  AlertTriangle,
  BookOpen,
  Wrench,
  PlayCircle,
  ShieldAlert,
  Package,
  Headphones,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Camera,
  Video,
  Mic,
  ArrowLeft,
  Image as ImageIcon,
  Download,
} from "lucide-react";

type CatKey = "guides" | "problems" | "videos" | "safety" | "parts" | "support";

const t = {
  title: { en: "Help & Guides", hi: "सहायता एवं गाइड" },
  sub: {
    en: "Simple steps, safety rules and support — for the machine in front of you.",
    hi: "आसान स्टेप, सुरक्षा नियम और सहायता — आपके सामने वाली मशीन के लिए।",
  },
  search: {
    en: "Search machine, model, error code, problem or part",
    hi: "मशीन, मॉडल, एरर कोड, समस्या या पार्ट खोजें",
  },
  emergency: { en: "Emergency Help", hi: "आपातकालीन सहायता" },
  callTs: { en: "Call Technical Support", hi: "तकनीकी सहायता को कॉल करें" },
  cats: {
    guides: { en: "Machine Guides", hi: "मशीन गाइड" },
    problems: { en: "Common Problems", hi: "आम समस्याएँ" },
    videos: { en: "Repair Videos", hi: "रिपेयर वीडियो" },
    safety: { en: "Safety Rules", hi: "सुरक्षा नियम" },
    parts: { en: "Parts Guide", hi: "पार्ट्स गाइड" },
    support: { en: "Contact Support", hi: "सहायता से संपर्क" },
  } as Record<CatKey, Bi>,
  forJob: { en: "For your job", hi: "आपके कार्य के लिए" },
  commonProblems: { en: "Common problems", hi: "आम समस्याएँ" },
  viewGuide: { en: "View Guide", hi: "गाइड देखें" },
  watchVideo: { en: "Watch Video", hi: "वीडियो देखें" },
  approved: { en: "Approved", hi: "स्वीकृत" },
  version: { en: "Version", hi: "संस्करण" },
  step: { en: "Step", hi: "स्टेप" },
  of: { en: "of", hi: "में से" },
  done: { en: "Done", hi: "हो गया" },
  needHelp: { en: "Need Help", hi: "मदद चाहिए" },
  prev: { en: "Previous", hi: "पिछला" },
  next: { en: "Next", hi: "अगला" },
  back: { en: "Back", hi: "वापस" },
  finish: { en: "Finish Guide", hi: "गाइड पूरी करें" },
  noResult: { en: "Nothing found. Try another word.", hi: "कुछ नहीं मिला। दूसरा शब्द आज़माएँ।" },
  stopWork: {
    en: "STOP WORK. Switch off the machine only if safe and contact Technical Support immediately.",
    hi: "काम रोकें। सुरक्षित हो तभी मशीन बंद करें और तुरंत तकनीकी सहायता से संपर्क करें।",
  },
  safetyAlways: {
    en: "Always switch off power before opening any panel. Never open a machine that is smoking, wet or giving shock.",
    hi: "कोई भी पैनल खोलने से पहले बिजली बंद करें। धुआँ, पानी या करंट वाली मशीन कभी न खोलें।",
  },
  sendPhoto: { en: "Send Photo", hi: "फोटो भेजें" },
  sendVideo: { en: "Send Video", hi: "वीडियो भेजें" },
  sendVoice: { en: "Send Voice Note", hi: "वॉइस नोट भेजें" },
  videoCall: { en: "Request Video Call", hi: "वीडियो कॉल का अनुरोध" },
  placeholder: { en: "Coming soon (demo)", hi: "जल्द आ रहा है (डेमो)" },
  helpRaised: {
    en: "Technical Support alert sent for job",
    hi: "इस कार्य के लिए तकनीकी सहायता अलर्ट भेजा गया",
  },
  alreadyRaised: {
    en: "Support alert already open for this job",
    hi: "इस कार्य के लिए सहायता अलर्ट पहले से खुला है",
  },
  logged: { en: "Guide saved in job timeline", hi: "गाइड जॉब टाइमलाइन में दर्ज हुई" },
  offline: { en: "Mark for offline", hi: "ऑफ़लाइन के लिए चुनें" },
  offlineOn: { en: "Saved for offline (demo)", hi: "ऑफ़लाइन के लिए सहेजा (डेमो)" },
  timeline: { en: "Guides used in jobs", hi: "कार्यों में उपयोग की गई गाइड" },
  noTimeline: { en: "No guide used yet.", hi: "अभी कोई गाइड उपयोग नहीं हुई।" },
  photoSoon: { en: "Machine photo", hi: "मशीन फोटो" },
  parts: { en: "Parts for this machine", hi: "इस मशीन के पार्ट्स" },
  partCode: { en: "Part code", hi: "पार्ट कोड" },
  seriousRisk: { en: "Serious risk", hi: "गंभीर जोखिम" },
  selectRisk: { en: "Tap the risk you can see", hi: "जो जोखिम दिख रहा है उसे चुनें" },
  callNow: { en: "Call Now", hi: "अभी कॉल करें" },
};

type Guide = {
  id: string;
  machine: Bi;
  model: string;
  version: string;
  problems: Bi[];
  codes: string[];
  parts: { name: Bi; code: string }[];
  steps: { text: Bi; media: "image" | "video" }[];
};

const GUIDES: Guide[] = [
  {
    id: "G-W12",
    machine: { en: "Washer 12kg", hi: "वॉशर 12 किग्रा" },
    model: "CC-W12-PRO",
    version: "v3.2",
    codes: ["E01", "E04", "E07"],
    problems: [
      { en: "Machine shakes / vibration (E04)", hi: "मशीन हिलती है / कंपन (E04)" },
      { en: "Water not draining (E07)", hi: "पानी नहीं निकल रहा (E07)" },
      { en: "Door not locking (E01)", hi: "दरवाज़ा लॉक नहीं हो रहा (E01)" },
    ],
    parts: [
      { name: { en: "Drum bearing kit", hi: "ड्रम बेयरिंग किट" }, code: "WB-1204" },
      { name: { en: "Drain pump", hi: "ड्रेन पंप" }, code: "WP-3310" },
      { name: { en: "Door lock switch", hi: "डोर लॉक स्विच" }, code: "WD-2201" },
    ],
    steps: [
      {
        text: { en: "Switch off power at the main switch.", hi: "मेन स्विच से बिजली बंद करें।" },
        media: "image",
      },
      {
        text: {
          en: "Check the four floor bolts. Tighten if loose.",
          hi: "चारों फ़्लोर बोल्ट देखें। ढीले हों तो कसें।",
        },
        media: "image",
      },
      {
        text: {
          en: "Open the back panel and check the drum bearing for play.",
          hi: "पिछला पैनल खोलें और ड्रम बेयरिंग का ढीलापन जाँचें।",
        },
        media: "video",
      },
      {
        text: {
          en: "Clean the drain filter and remove any cloth or coins.",
          hi: "ड्रेन फ़िल्टर साफ़ करें, कपड़ा या सिक्के निकालें।",
        },
        media: "image",
      },
      {
        text: {
          en: "Switch on power and run a 5-minute test wash.",
          hi: "बिजली चालू करें और 5 मिनट का टेस्ट वॉश चलाएँ।",
        },
        media: "video",
      },
    ],
  },
  {
    id: "G-D10",
    machine: { en: "Dryer 10kg", hi: "ड्रायर 10 किग्रा" },
    model: "CC-D10-STD",
    version: "v2.6",
    codes: ["H02", "H05"],
    problems: [
      { en: "Machine not heating (H02)", hi: "मशीन गरम नहीं हो रही (H02)" },
      { en: "Noise or vibration", hi: "आवाज़ या कंपन" },
      { en: "Machine not starting", hi: "मशीन चालू नहीं हो रही" },
    ],
    parts: [
      { name: { en: "Heating coil", hi: "हीटिंग कॉइल" }, code: "DH-4402" },
      { name: { en: "Thermostat", hi: "थर्मोस्टेट" }, code: "DT-1180" },
      { name: { en: "Drive belt", hi: "ड्राइव बेल्ट" }, code: "DB-9021" },
    ],
    steps: [
      {
        text: { en: "Switch off power and let the drum cool.", hi: "बिजली बंद करें और ड्रम ठंडा होने दें।" },
        media: "image",
      },
      {
        text: {
          en: "Clean the lint filter fully.",
          hi: "लिंट फ़िल्टर पूरी तरह साफ़ करें।",
        },
        media: "image",
      },
      {
        text: {
          en: "Check the heating coil with a multimeter for continuity.",
          hi: "मल्टीमीटर से हीटिंग कॉइल की कंटीन्युटी जाँचें।",
        },
        media: "video",
      },
      {
        text: {
          en: "Reset the thermostat button at the back.",
          hi: "पीछे का थर्मोस्टेट बटन रीसेट करें।",
        },
        media: "image",
      },
      {
        text: {
          en: "Run a 10-minute hot cycle and check the air temperature.",
          hi: "10 मिनट का हॉट साइकल चलाएँ और हवा का तापमान देखें।",
        },
        media: "video",
      },
    ],
  },
  {
    id: "G-SI5",
    machine: { en: "Steam Iron Boiler", hi: "स्टीम आयरन बॉयलर" },
    model: "CC-SI5-BLR",
    version: "v4.0",
    codes: ["S03", "S09"],
    problems: [
      { en: "Water not coming / no steam (S03)", hi: "पानी/भाप नहीं आ रही (S03)" },
      { en: "Leakage from boiler", hi: "बॉयलर से रिसाव" },
      { en: "Error on display (S09)", hi: "डिस्प्ले पर एरर (S09)" },
    ],
    parts: [
      { name: { en: "Solenoid valve", hi: "सोलेनॉइड वाल्व" }, code: "SV-7710" },
      { name: { en: "Boiler gasket", hi: "बॉयलर गास्केट" }, code: "SG-2205" },
      { name: { en: "Water pump", hi: "वाटर पंप" }, code: "SP-5533" },
    ],
    steps: [
      {
        text: {
          en: "Switch off power and release boiler pressure. Surface is hot.",
          hi: "बिजली बंद करें और बॉयलर का प्रेशर निकालें। सतह गरम है।",
        },
        media: "image",
      },
      {
        text: { en: "Check water tank level and inlet pipe.", hi: "वाटर टैंक और इनलेट पाइप जाँचें।" },
        media: "image",
      },
      {
        text: {
          en: "Clean the solenoid valve filter of scale.",
          hi: "सोलेनॉइड वाल्व फ़िल्टर से स्केल साफ़ करें।",
        },
        media: "video",
      },
      {
        text: {
          en: "Replace the boiler gasket if you see water marks.",
          hi: "पानी के निशान दिखें तो बॉयलर गास्केट बदलें।",
        },
        media: "image",
      },
      {
        text: {
          en: "Refill water, heat up and test steam for 2 minutes.",
          hi: "पानी भरें, गरम करें और 2 मिनट भाप टेस्ट करें।",
        },
        media: "video",
      },
    ],
  },
  {
    id: "G-DC8",
    machine: { en: "Dry Clean Machine 8kg", hi: "ड्राई क्लीन मशीन 8 किग्रा" },
    model: "CC-DC8-ECO",
    version: "v1.9",
    codes: ["P11", "P14"],
    problems: [
      { en: "No power (P11)", hi: "बिजली नहीं आ रही (P11)" },
      { en: "Solvent leakage (P14)", hi: "सॉल्वेंट रिसाव (P14)" },
      { en: "Machine not starting", hi: "मशीन चालू नहीं हो रही" },
    ],
    parts: [
      { name: { en: "Main contactor", hi: "मेन कॉन्टैक्टर" }, code: "DCC-8801" },
      { name: { en: "Filter cartridge", hi: "फ़िल्टर कार्ट्रिज" }, code: "DCF-4410" },
      { name: { en: "Door seal", hi: "डोर सील" }, code: "DCS-1120" },
    ],
    steps: [
      {
        text: { en: "Switch off the main MCB before touching anything.", hi: "कुछ भी छूने से पहले मेन MCB बंद करें।" },
        media: "image",
      },
      {
        text: { en: "Check the MCB and plug point voltage.", hi: "MCB और प्लग पॉइंट का वोल्टेज जाँचें।" },
        media: "image",
      },
      {
        text: { en: "Inspect the main contactor for burn marks.", hi: "मेन कॉन्टैक्टर पर जलने के निशान देखें।" },
        media: "video",
      },
      {
        text: { en: "Check door seal and filter for leakage.", hi: "रिसाव के लिए डोर सील और फ़िल्टर जाँचें।" },
        media: "image",
      },
      {
        text: { en: "Power on and run one empty cycle.", hi: "पावर ऑन करें और एक खाली साइकल चलाएँ।" },
        media: "video",
      },
    ],
  },
];

const PROBLEMS: { key: string; label: Bi; serious?: boolean }[] = [
  { key: "not-start", label: { en: "Machine Not Starting", hi: "मशीन चालू नहीं हो रही" } },
  { key: "no-power", label: { en: "No Power", hi: "बिजली नहीं" } },
  { key: "no-water", label: { en: "Water Not Coming", hi: "पानी नहीं आ रहा" } },
  { key: "no-drain", label: { en: "Water Not Draining", hi: "पानी नहीं निकल रहा" } },
  { key: "no-heat", label: { en: "Machine Not Heating", hi: "मशीन गरम नहीं हो रही" } },
  { key: "noise", label: { en: "Noise or Vibration", hi: "आवाज़ या कंपन" } },
  { key: "leak", label: { en: "Leakage", hi: "रिसाव" }, serious: true },
  { key: "error", label: { en: "Error on Display", hi: "डिस्प्ले पर एरर" } },
];

const RISKS: { key: string; label: Bi; serious: boolean }[] = [
  { key: "shock", label: { en: "Electric shock", hi: "करंट लगना" }, serious: true },
  { key: "fire", label: { en: "Fire or smoke", hi: "आग या धुआँ" }, serious: true },
  { key: "water", label: { en: "Water near electrical parts", hi: "बिजली के पास पानी" }, serious: true },
  { key: "gas", label: { en: "Gas leakage", hi: "गैस रिसाव" }, serious: true },
  { key: "hot", label: { en: "Hot surfaces", hi: "गरम सतह" }, serious: false },
  { key: "moving", label: { en: "Moving machine parts", hi: "चलते हुए पुर्ज़े" }, serious: false },
];

const SUPPORT = {
  name: "Rohit Nair",
  role: { en: "Technical Support", hi: "तकनीकी सहायता" },
  phone: "+91 98110 22334",
};

export function FieldEngineerHelpGuides({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CatKey>("guides");
  const [problem, setProblem] = useState<string | null>(null);
  const [risk, setRisk] = useState<string | null>(null);
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [doneSteps, setDoneSteps] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<{ job: string; guide: string; at: string }[]>([]);
  const [offline, setOffline] = useState<Record<string, boolean>>({});

  // Job context: the active job decides which machine guides show first.
  const activeJob = useMemo(
    () => JOBS.find((j) => j.status === "transit") ?? JOBS[0],
    [],
  );

  const matches = (g: Guide) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      g.machine.en.toLowerCase().includes(s) ||
      g.machine.hi.includes(s) ||
      g.model.toLowerCase().includes(s) ||
      g.codes.some((c) => c.toLowerCase().includes(s)) ||
      g.problems.some((p) => p.en.toLowerCase().includes(s) || p.hi.includes(s)) ||
      g.parts.some((p) => p.code.toLowerCase().includes(s) || p.name.en.toLowerCase().includes(s))
    );
  };

  const jobGuide = GUIDES.find((g) => g.machine.en === activeJob.machine.en);
  const listed = GUIDES.filter(matches).sort((a, b) => {
    if (a.id === jobGuide?.id) return -1;
    if (b.id === jobGuide?.id) return 1;
    return 0;
  });

  const problemGuides = problem
    ? GUIDES.filter((g) =>
        g.problems.some((p) =>
          p.en
            .toLowerCase()
            .includes(
              (PROBLEMS.find((x) => x.key === problem)?.label.en ?? "")
                .toLowerCase()
                .split(" ")
                .slice(-2)
                .join(" "),
            ),
        ),
      )
    : [];

  const startGuide = (g: Guide) => {
    setOpenGuide(g);
    setStepIdx(0);
    if (!timeline.some((x) => x.job === activeJob.id && x.guide === g.id)) {
      setTimeline((p) => [
        { job: activeJob.id, guide: `${g.machine[lang]} ${g.version}`, at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
        ...p,
      ]);
      toast.success(t.logged[lang]);
    }
  };

  const raiseHelp = () => {
    if (!openGuide) return;
    const key = `${activeJob.id}-${openGuide.id}`;
    if (alerts.includes(key)) {
      toast.info(t.alreadyRaised[lang]);
      return;
    }
    setAlerts((p) => [...p, key]);
    toast.success(`${t.helpRaised[lang]} ${activeJob.id}`);
  };

  const soon = () => toast.info(t.placeholder[lang]);

  const CATS: { key: CatKey; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
    { key: "guides", icon: BookOpen, tone: "text-primary" },
    { key: "problems", icon: Wrench, tone: "text-blue-600" },
    { key: "videos", icon: PlayCircle, tone: "text-purple-600" },
    { key: "safety", icon: ShieldAlert, tone: "text-red-600" },
    { key: "parts", icon: Package, tone: "text-amber-600" },
    { key: "support", icon: Headphones, tone: "text-emerald-600" },
  ];

  const seriousRisk = RISKS.find((r) => r.key === risk)?.serious;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title[lang]}</h1>
          <p className="text-sm text-muted-foreground">{t.sub[lang]}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search[lang]}
            className="h-11 pl-9 text-base"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            className="h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              setCat("safety");
              toast.warning(t.stopWork[lang]);
            }}
          >
            <AlertTriangle className="mr-2 h-5 w-5" /> {t.emergency[lang]}
          </Button>
          <Button variant="outline" className="h-12" onClick={soon}>
            <Phone className="mr-2 h-5 w-5" /> {t.callTs[lang]}
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CATS.map((c) => {
          const Icon = c.icon;
          const on = cat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                on ? "border-primary bg-primary/5" : "bg-background hover:bg-muted/50"
              }`}
            >
              <Icon className={`h-7 w-7 ${on ? "text-primary" : c.tone}`} />
              <span className="text-xs font-medium leading-tight">{t.cats[c.key][lang]}</span>
            </button>
          );
        })}
      </div>

      {/* Always-on safety strip */}
      <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm">{t.safetyAlways[lang]}</p>
        </CardContent>
      </Card>

      {/* Machine guides / videos / parts */}
      {(cat === "guides" || cat === "videos" || cat === "parts") && (
        <div className="space-y-3">
          {listed.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                {t.noResult[lang]}
              </CardContent>
            </Card>
          )}
          {listed.map((g) => (
            <Card key={g.id} className={g.id === jobGuide?.id ? "border-primary" : ""}>
              <CardContent className="space-y-3 p-4">
                <div className="flex gap-3">
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{g.machine[lang]}</span>
                      {g.id === jobGuide?.id && (
                        <Badge className="text-[10px]">{t.forJob[lang]}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {g.model} · {t.version[lang]} {g.version} ·{" "}
                      <span className="text-emerald-600">{t.approved[lang]}</span>
                    </div>
                    <div className="mt-1 text-xs font-medium">{t.commonProblems[lang]}</div>
                    <ul className="text-xs text-muted-foreground">
                      {g.problems.slice(0, 3).map((p) => (
                        <li key={p.en}>• {p[lang]}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {cat === "parts" && (
                  <div className="rounded-md border bg-muted/20 p-3">
                    <div className="mb-1 text-xs font-medium">{t.parts[lang]}</div>
                    {g.parts.map((p) => (
                      <div key={p.code} className="flex justify-between text-xs">
                        <span>{p.name[lang]}</span>
                        <span className="text-muted-foreground">
                          {t.partCode[lang]}: {p.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button className="h-11" onClick={() => startGuide(g)}>
                    <BookOpen className="mr-2 h-4 w-4" /> {t.viewGuide[lang]}
                  </Button>
                  <Button variant="outline" className="h-11" onClick={soon}>
                    <PlayCircle className="mr-2 h-4 w-4" /> {t.watchVideo[lang]}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setOffline((p) => ({ ...p, [g.id]: true }));
                    toast.info(t.offlineOn[lang]);
                  }}
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  {offline[g.id] ? t.offlineOn[lang] : t.offline[lang]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Common problems */}
      {cat === "problems" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <button
                key={p.key}
                onClick={() => setProblem(p.key)}
                className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                  problem === p.key ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                {p.label[lang]}
              </button>
            ))}
          </div>
          {problem && PROBLEMS.find((p) => p.key === problem)?.serious && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-destructive">{t.stopWork[lang]}</p>
                  <Button size="sm" variant="destructive" onClick={soon}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" /> {t.callNow[lang]}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {problem &&
            (problemGuides.length ? problemGuides : GUIDES).slice(0, 3).map((g) => (
              <Card key={g.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="text-sm font-medium">{g.machine[lang]}</div>
                    <div className="text-xs text-muted-foreground">
                      {g.model} · {g.version}
                    </div>
                  </div>
                  <Button size="sm" className="h-10" onClick={() => startGuide(g)}>
                    {t.viewGuide[lang]}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Safety */}
      {cat === "safety" && (
        <div className="space-y-3">
          <div className="text-sm font-medium">{t.selectRisk[lang]}</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RISKS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRisk(r.key)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                  risk === r.key ? "border-destructive bg-destructive/5" : "hover:bg-muted/50"
                }`}
              >
                <ShieldAlert
                  className={`h-5 w-5 shrink-0 ${r.serious ? "text-destructive" : "text-amber-600"}`}
                />
                {r.label[lang]}
                {r.serious && (
                  <Badge variant="destructive" className="ml-auto text-[10px]">
                    {t.seriousRisk[lang]}
                  </Badge>
                )}
              </button>
            ))}
          </div>
          {risk && (
            <Card className={seriousRisk ? "border-destructive bg-destructive/5" : "border-amber-300"}>
              <CardContent className="space-y-3 p-4">
                <p className={`text-sm font-semibold ${seriousRisk ? "text-destructive" : ""}`}>
                  {seriousRisk ? t.stopWork[lang] : t.safetyAlways[lang]}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button variant={seriousRisk ? "destructive" : "outline"} className="h-11" onClick={soon}>
                    <Phone className="mr-2 h-4 w-4" /> {t.callTs[lang]}
                  </Button>
                  <Button variant="outline" className="h-11" onClick={soon}>
                    <Camera className="mr-2 h-4 w-4" /> {t.sendPhoto[lang]}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Contact support */}
      {cat === "support" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {SUPPORT.name} — {SUPPORT.role[lang]}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button className="h-12" onClick={soon}>
              <Phone className="mr-2 h-5 w-5" /> {t.callTs[lang]}
            </Button>
            <Button variant="outline" className="h-12" onClick={soon}>
              <Camera className="mr-2 h-5 w-5" /> {t.sendPhoto[lang]}
            </Button>
            <Button variant="outline" className="h-12" onClick={soon}>
              <Video className="mr-2 h-5 w-5" /> {t.sendVideo[lang]}
            </Button>
            <Button variant="outline" className="h-12" onClick={soon}>
              <Mic className="mr-2 h-5 w-5" /> {t.sendVoice[lang]}
            </Button>
            <Button variant="outline" className="h-12 sm:col-span-2" onClick={soon}>
              <PlayCircle className="mr-2 h-5 w-5" /> {t.videoCall[lang]}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Job timeline log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.timeline[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground">{t.noTimeline[lang]}</p>
          )}
          {timeline.map((x, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>
                {x.job} · {x.guide}
              </span>
              <span className="text-xs text-muted-foreground">{x.at}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step-by-step guide viewer */}
      <Dialog open={!!openGuide} onOpenChange={(o) => !o && setOpenGuide(null)}>
        <DialogContent className="max-w-md">
          {openGuide && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">
                  {openGuide.machine[lang]} · {openGuide.model}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  {t.step[lang]} {stepIdx + 1} {t.of[lang]} {openGuide.steps.length} ·{" "}
                  {t.version[lang]} {openGuide.version}
                </div>
                <div className="flex h-32 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {openGuide.steps[stepIdx].media === "video" ? (
                    <PlayCircle className="h-8 w-8" />
                  ) : (
                    <ImageIcon className="h-8 w-8" />
                  )}
                </div>
                <p className="text-base font-medium">{openGuide.steps[stepIdx].text[lang]}</p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="h-11"
                    variant={
                      doneSteps[`${openGuide.id}-${stepIdx}`] ? "secondary" : "default"
                    }
                    onClick={() => {
                      setDoneSteps((p) => ({ ...p, [`${openGuide.id}-${stepIdx}`]: true }));
                      if (stepIdx < openGuide.steps.length - 1) setStepIdx(stepIdx + 1);
                      else toast.success(t.logged[lang]);
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> {t.done[lang]}
                  </Button>
                  <Button variant="outline" className="h-11" onClick={raiseHelp}>
                    <AlertTriangle className="mr-2 h-4 w-4" /> {t.needHelp[lang]}
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    disabled={stepIdx === 0}
                    onClick={() => setStepIdx(stepIdx - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> {t.prev[lang]}
                  </Button>
                  {stepIdx < openGuide.steps.length - 1 ? (
                    <Button variant="ghost" onClick={() => setStepIdx(stepIdx + 1)}>
                      {t.next[lang]} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setOpenGuide(null)}>
                      <ArrowLeft className="mr-1 h-4 w-4" /> {t.finish[lang]}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
