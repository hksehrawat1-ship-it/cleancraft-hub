import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Camera,
  CheckCircle2,
  Flame,
  Hash,
  HelpCircle,
  ImageIcon,
  Layers,
  Mic,
  Package,
  PackageSearch,
  PackageX,
  Phone,
  Scissors,
  Search,
  ShieldAlert,
  Smartphone,
  Tag,
  Volume2,
  Droplets,
  Zap,
  Weight,
} from "lucide-react";
import { LangSwitch, tr } from "./pantry-cleaning-ui";
import type { Bi, Lang } from "./pantry-cleaning-data";

type CatId = "pack" | "material" | "labels" | "problems" | "safety" | "app";

const CATS: { id: CatId; name: Bi; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "pack", name: { en: "How to Pack", hi: "पैकिंग कैसे करें" }, icon: Package },
  { id: "material", name: { en: "Packing Materials", hi: "पैकिंग सामान" }, icon: Boxes },
  { id: "labels", name: { en: "Labels and Tags", hi: "लेबल और टैग" }, icon: Tag },
  { id: "problems", name: { en: "Common Problems", hi: "आम दिक्कतें" }, icon: AlertTriangle },
  { id: "safety", name: { en: "Safety Rules", hi: "सुरक्षा नियम" }, icon: ShieldAlert },
  { id: "app", name: { en: "How to Use the App", hi: "ऐप कैसे चलाएं" }, icon: Smartphone },
];

type Guide = { id: string; title: Bi; steps: Bi[] };

const PACK_GUIDES: Guide[] = [
  {
    id: "g1",
    title: { en: "Check Product and Quantity", hi: "सामान और मात्रा जांचें" },
    steps: [
      { en: "Read the order number on the task card.", hi: "काम के कार्ड पर ऑर्डर नंबर पढ़ें।" },
      { en: "Count the products one by one.", hi: "सामान एक-एक गिनें।" },
      { en: "If the count does not match, report the problem.", hi: "गिनती मेल न खाए तो दिक्कत बताएं।" },
    ],
  },
  {
    id: "g2",
    title: { en: "Select Correct Packing Material", hi: "सही पैकिंग सामान चुनें" },
    steps: [
      { en: "Small items go in a small box.", hi: "छोटा सामान छोटे डिब्बे में।" },
      { en: "Clothes go in a poly bag first.", hi: "कपड़े पहले पॉली बैग में।" },
      { en: "Glass or fragile items need bubble wrap.", hi: "शीशा या नाज़ुक सामान में बबल रैप लगाएं।" },
    ],
  },
  {
    id: "g3",
    title: { en: "Fold or Arrange Product", hi: "सामान जमाएं" },
    steps: [
      { en: "Fold clothes flat and even.", hi: "कपड़े सीधे और बराबर मोड़ें।" },
      { en: "Keep heavy items at the bottom.", hi: "भारी सामान नीचे रखें।" },
      { en: "Do not fold printed boards.", hi: "प्रिंटेड बोर्ड मोड़ें नहीं।" },
    ],
  },
  {
    id: "g4",
    title: { en: "Wrap Product Safely", hi: "सामान सुरक्षित लपेटें" },
    steps: [
      { en: "Wrap fragile items 2 times with bubble wrap.", hi: "नाज़ुक सामान 2 बार बबल रैप में लपेटें।" },
      { en: "Fill empty space with paper filler.", hi: "खाली जगह पेपर फिलर से भरें।" },
      { en: "Shake the box gently — nothing should move.", hi: "डिब्बा हल्का हिलाएं — कुछ हिलना नहीं चाहिए।" },
    ],
  },
  {
    id: "g5",
    title: { en: "Attach Label Correctly", hi: "लेबल सही लगाएं" },
    steps: [
      { en: "Check the city name on the label.", hi: "लेबल पर शहर का नाम जांचें।" },
      { en: "Stick the label straight, in the middle of the top side.", hi: "लेबल ऊपर की तरफ बीच में सीधा लगाएं।" },
      { en: "Do not put tape over the barcode.", hi: "बारकोड पर टेप न लगाएं।" },
    ],
  },
  {
    id: "g6",
    title: { en: "Seal the Package", hi: "पैकेट सील करें" },
    steps: [
      { en: "Use one long tape line on the centre joint.", hi: "बीच की जोड़ पर एक लंबी टेप लगाएं।" },
      { en: "Add one tape line on each side edge.", hi: "दोनों किनारों पर एक-एक टेप लगाएं।" },
      { en: "Press the tape well with your hand.", hi: "टेप को हाथ से अच्छे से दबाएं।" },
    ],
  },
  {
    id: "g7",
    title: { en: "Move Package to Dispatch", hi: "पैकेट डिस्पैच में रखें" },
    steps: [
      { en: "Lift heavy boxes with both hands, bend your knees.", hi: "भारी डिब्बा दोनों हाथ से उठाएं, घुटने मोड़ें।" },
      { en: "Keep the package in the dispatch bay rack.", hi: "पैकेट डिस्पैच बे की रैक में रखें।" },
      { en: "Mark packing completed in the app.", hi: "ऐप में पैकिंग पूरी करें।" },
    ],
  },
];

const MATERIAL_GUIDES: Guide[] = [
  {
    id: "m1",
    title: { en: "Which box or bag to use", hi: "कौन सा डिब्बा या बैग" },
    steps: [
      { en: "1–3 items: small box. 4–10 items: medium box.", hi: "1–3 सामान: छोटा डिब्बा। 4–10: मध्यम डिब्बा।" },
      { en: "Clothes only: poly bag or carry bag.", hi: "सिर्फ कपड़े: पॉली बैग या कैरी बैग।" },
    ],
  },
  {
    id: "m2",
    title: { en: "How much tape to use", hi: "कितनी टेप लगाएं" },
    steps: [
      { en: "Three tape lines are enough for one box.", hi: "एक डिब्बे पर तीन टेप काफी हैं।" },
      { en: "Do not waste tape. Do not use less than three.", hi: "टेप बर्बाद न करें। तीन से कम भी न लगाएं।" },
    ],
  },
  {
    id: "m3",
    title: { en: "When to use bubble wrap", hi: "बबल रैप कब लगाएं" },
    steps: [
      { en: "Use for glass, machines and spare parts.", hi: "शीशा, मशीन और स्पेयर पार्ट के लिए।" },
      { en: "Do not use for plain clothes.", hi: "सादे कपड़ों के लिए न लगाएं।" },
    ],
  },
  {
    id: "m4",
    title: { en: "How to protect fragile items", hi: "नाज़ुक सामान कैसे बचाएं" },
    steps: [
      { en: "Bubble wrap inside, paper filler around.", hi: "अंदर बबल रैप, चारों तरफ पेपर फिलर।" },
      { en: "Stick a Fragile tag on the box.", hi: "डिब्बे पर Fragile टैग लगाएं।" },
    ],
  },
  {
    id: "m5",
    title: { en: "Where to place labels", hi: "लेबल कहाँ लगाएं" },
    steps: [
      { en: "Top side, in the middle, straight.", hi: "ऊपर की तरफ, बीच में, सीधा।" },
      { en: "One label per package only.", hi: "एक पैकेट पर एक ही लेबल।" },
    ],
  },
  {
    id: "m6",
    title: { en: "How to seal packages", hi: "पैकेट कैसे सील करें" },
    steps: [
      { en: "Close both flaps, then tape the centre joint.", hi: "दोनों फ्लैप बंद करें, फिर बीच में टेप लगाएं।" },
      { en: "Check no corner is open.", hi: "देखें कोई कोना खुला न हो।" },
    ],
  },
];

const LABEL_GUIDES: Guide[] = [
  {
    id: "l1",
    title: { en: "Read the dispatch label", hi: "डिस्पैच लेबल पढ़ें" },
    steps: [
      { en: "City name is written on top.", hi: "शहर का नाम ऊपर लिखा है।" },
      { en: "Order number is written below the city.", hi: "ऑर्डर नंबर शहर के नीचे है।" },
    ],
  },
  {
    id: "l2",
    title: { en: "Use tags correctly", hi: "टैग सही लगाएं" },
    steps: [
      { en: "Fragile tag for glass items.", hi: "शीशे के सामान पर Fragile टैग।" },
      { en: "Urgent tag for same-day dispatch.", hi: "उसी दिन भेजने पर Urgent टैग।" },
    ],
  },
];

const APP_GUIDES: Guide[] = [
  {
    id: "a1",
    title: { en: "View My Tasks", hi: "मेरे काम देखें" },
    steps: [{ en: "Open My Tasks from the menu, then tap View Task.", hi: "मेन्यू से My Tasks खोलें, फिर काम देखें दबाएं।" }],
  },
  {
    id: "a2",
    title: { en: "Start Packing", hi: "पैकिंग शुरू करें" },
    steps: [{ en: "Open the task and press the blue Start Packing button.", hi: "काम खोलें और नीला 'पैकिंग शुरू करें' दबाएं।" }],
  },
  {
    id: "a3",
    title: { en: "Complete Packing", hi: "पैकिंग पूरी करें" },
    steps: [{ en: "Press Packing Completed and tick all six checks.", hi: "'पैकिंग पूरी' दबाएं और छह जांच टिक करें।" }],
  },
  {
    id: "a4",
    title: { en: "Add Completion Photo", hi: "फोटो लगाएं" },
    steps: [{ en: "In the checklist, press Add completion photo.", hi: "जांच सूची में 'फोटो लगाएं' दबाएं।" }],
  },
  {
    id: "a5",
    title: { en: "Request Packing Supplies", hi: "पैकिंग सामान माँगें" },
    steps: [{ en: "Open Packing Supplies and tap the item you need.", hi: "पैकिंग सामान खोलें और ज़रूरी सामान दबाएं।" }],
  },
  {
    id: "a6",
    title: { en: "Report a Problem", hi: "दिक्कत बताएं" },
    steps: [{ en: "Open Report a Problem and tap the problem picture.", hi: "'दिक्कत बताएं' खोलें और दिक्कत की तस्वीर दबाएं।" }],
  },
  {
    id: "a7",
    title: { en: "Change Language", hi: "भाषा बदलें" },
    steps: [{ en: "Press English or हिंदी at the top of any page.", hi: "किसी भी पेज पर ऊपर English या हिंदी दबाएं।" }],
  },
];

const PROBLEMS: { catId: string; name: Bi; icon: React.ComponentType<{ className?: string }> }[] = [
  { catId: "missing", name: { en: "Product Missing", hi: "सामान नहीं मिला" }, icon: PackageSearch },
  { catId: "damaged", name: { en: "Product Damaged", hi: "सामान टूटा है" }, icon: PackageX },
  { catId: "qty", name: { en: "Quantity Not Matching", hi: "मात्रा मेल नहीं" }, icon: Hash },
  { catId: "material", name: { en: "Material Missing", hi: "सामान नहीं है" }, icon: Layers },
  { catId: "label", name: { en: "Label Not Printing", hi: "लेबल प्रिंट नहीं हो रहा" }, icon: Tag },
  { catId: "details", name: { en: "Order Details Not Clear", hi: "ऑर्डर समझ नहीं आया" }, icon: HelpCircle },
];

const HAZARDS: { id: string; name: Bi; icon: React.ComponentType<{ className?: string }>; tip: Bi }[] = [
  {
    id: "blade",
    name: { en: "Cutter or Blade", hi: "कटर या ब्लेड" },
    icon: Scissors,
    tip: { en: "Cut away from your body. Close the blade after use.", hi: "शरीर से दूर काटें। उपयोग के बाद ब्लेड बंद करें।" },
  },
  {
    id: "heavy",
    name: { en: "Heavy Box", hi: "भारी डिब्बा" },
    icon: Weight,
    tip: { en: "Bend your knees. Ask for help above 15 kg.", hi: "घुटने मोड़ें। 15 किलो से ज़्यादा पर मदद लें।" },
  },
  {
    id: "broken",
    name: { en: "Broken Product", hi: "टूटा सामान" },
    icon: PackageX,
    tip: { en: "Wear gloves. Do not touch glass with bare hands.", hi: "दस्ताने पहनें। शीशा खाली हाथ न पकड़ें।" },
  },
  {
    id: "electric",
    name: { en: "Electrical Equipment", hi: "बिजली का सामान" },
    icon: Zap,
    tip: { en: "Do not touch wires. Keep hands dry.", hi: "तार न छुएं। हाथ सूखे रखें।" },
  },
  {
    id: "fire",
    name: { en: "Fire or Smoke", hi: "आग या धुआं" },
    icon: Flame,
    tip: { en: "Leave the area at once and inform the manager.", hi: "तुरंत जगह छोड़ें और मैनेजर को बताएं।" },
  },
  {
    id: "wet",
    name: { en: "Wet Floor", hi: "गीला फर्श" },
    icon: Droplets,
    tip: { en: "Walk slowly. Put a wet floor sign.", hi: "धीरे चलें। गीले फर्श का बोर्ड रखें।" },
  },
];

export function PackingHelp({
  lang,
  setLang,
  onReportProblem,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  onReportProblem: (catId: string) => void;
}) {
  const t = tr(lang);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CatId | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [step, setStep] = useState(0);
  const [hazard, setHazard] = useState<(typeof HAZARDS)[number] | null>(null);

  const audio = () =>
    toast.info(lang === "hi" ? "हिंदी ऑडियो चलेगा (जल्द)" : "Audio instruction (coming soon)");

  const openGuide = (g: Guide) => {
    setGuide(g);
    setStep(0);
    toast.info(
      lang === "hi" ? `गाइड खुली: ${g.title.hi}` : `Guide opened: ${g.title.en}`,
    );
  };

  const needHelp = () => {
    toast.success(
      lang === "hi"
        ? "मैनेजर को संदेश भेज दिया गया।"
        : "Message sent to the Administration Manager.",
    );
  };

  const guidesFor = (c: CatId): Guide[] =>
    c === "pack" ? PACK_GUIDES : c === "material" ? MATERIAL_GUIDES : c === "labels" ? LABEL_GUIDES : APP_GUIDES;

  const searchHits = q.trim()
    ? [...PACK_GUIDES, ...MATERIAL_GUIDES, ...LABEL_GUIDES, ...APP_GUIDES].filter((g) =>
        `${g.title.en} ${g.title.hi}`.toLowerCase().includes(q.trim().toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1 text-lg font-bold">
              {lang === "hi" ? "मदद" : "Help"}
            </div>
            <LangSwitch lang={lang} setLang={setLang} />
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full sm:w-auto"
              onClick={() => toast.info(lang === "hi" ? "मैनेजर को कॉल (जल्द)" : "Call manager (coming soon)")}
            >
              <Phone className="mr-2 h-5 w-5" />
              {lang === "hi" ? "मैनेजर को कॉल" : "Call Manager"}
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 pl-10"
              placeholder={lang === "hi" ? "मदद खोजें" : "Search Help"}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {!!searchHits.length && (
            <div className="space-y-2">
              {searchHits.map((g) => (
                <button
                  key={g.id}
                  onClick={() => openGuide(g)}
                  className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:bg-muted"
                >
                  <Package className="h-6 w-6 text-primary" />
                  <span className="font-semibold">{t(g.title)}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition-colors hover:bg-muted ${
              cat === c.id ? "border-primary bg-primary/5" : ""
            } ${c.id === "safety" ? "border-destructive/40" : ""}`}
          >
            <c.icon className={`h-12 w-12 ${c.id === "safety" ? "text-destructive" : "text-primary"}`} />
            <span className="text-center text-sm font-semibold leading-tight">{t(c.name)}</span>
          </button>
        ))}
      </div>

      {/* Category content */}
      {cat && (cat === "pack" || cat === "material" || cat === "labels" || cat === "app") && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="text-sm font-semibold">
              {t(CATS.find((c) => c.id === cat)!.name)}
            </div>
            {guidesFor(cat).map((g) => (
              <button
                key={g.id}
                onClick={() => openGuide(g)}
                className="flex w-full items-center gap-3 rounded-2xl border p-4 text-left hover:bg-muted"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
                <span className="flex-1 text-base font-semibold">{t(g.title)}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {cat === "problems" && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 text-sm font-semibold">
              {lang === "hi" ? "दिक्कत चुनें, फॉर्म खुद भर जाएगा" : "Pick a problem — the report opens ready"}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PROBLEMS.map((p) => (
                <button
                  key={p.catId}
                  onClick={() => onReportProblem(p.catId)}
                  className="flex flex-col items-center gap-2 rounded-2xl border p-4 hover:bg-muted"
                >
                  <p.icon className="h-10 w-10 text-primary" />
                  <span className="text-center text-sm font-semibold leading-tight">{t(p.name)}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {cat === "safety" && (
        <Card className="border-destructive/40">
          <CardContent className="p-4">
            <div className="mb-3 text-sm font-semibold text-destructive">
              {lang === "hi" ? "खतरे की तस्वीर दबाएं" : "Tap a danger picture"}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {HAZARDS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHazard(h)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/5 p-4"
                >
                  <h.icon className="h-12 w-12 text-destructive" />
                  <span className="text-center text-sm font-semibold leading-tight">{t(h.name)}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact manager */}
      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="text-sm font-semibold">
            {lang === "hi" ? "मैनेजर से बात करें" : "Contact Manager"}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={() => toast.info(lang === "hi" ? "कॉल (जल्द)" : "Call (coming soon)")}
            >
              <Phone className="mr-2 h-5 w-5" />
              {lang === "hi" ? "मैनेजर को कॉल" : "Call Manager"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={() => toast.info(lang === "hi" ? "फोटो (जल्द)" : "Send photo (coming soon)")}
            >
              <Camera className="mr-2 h-5 w-5" />
              {lang === "hi" ? "फोटो भेजें" : "Send Photo"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={() => toast.info(lang === "hi" ? "वॉइस नोट (जल्द)" : "Voice note (coming soon)")}
            >
              <Mic className="mr-2 h-5 w-5" />
              {lang === "hi" ? "वॉइस नोट भेजें" : "Send Voice Note"}
            </Button>
            <Button size="lg" className="h-14" onClick={() => onReportProblem("other")}>
              <AlertTriangle className="mr-2 h-5 w-5" />
              {lang === "hi" ? "दिक्कत बताएं" : "Report a Problem"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-14 sm:col-span-2"
              onClick={() => onReportProblem("details")}
            >
              <HelpCircle className="mr-2 h-5 w-5" />
              {lang === "hi" ? "निर्देश समझ नहीं आया" : "Instructions Not Clear"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guide viewer — one step at a time */}
      <Dialog open={!!guide} onOpenChange={(o) => !o && setGuide(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          {guide && (
            <>
              <DialogHeader>
                <DialogTitle>{t(guide.title)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex h-40 items-center justify-center rounded-2xl bg-muted">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="text-sm font-semibold text-primary">
                  {lang === "hi" ? "स्टेप " : "Step "}
                  {step + 1}/{guide.steps.length}
                </div>
                <div className="text-xl font-bold leading-snug">{t(guide.steps[step])}</div>
                <Button variant="outline" size="lg" className="h-14 w-full" onClick={audio}>
                  <Volume2 className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "सुनें" : "Play Audio"}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14"
                    disabled={step === 0}
                    onClick={() => setStep((s) => s - 1)}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    {lang === "hi" ? "पीछे" : "Previous"}
                  </Button>
                  {step < guide.steps.length - 1 ? (
                    <Button size="lg" className="h-14" onClick={() => setStep((s) => s + 1)}>
                      {lang === "hi" ? "आगे" : "Next"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="h-14"
                      onClick={() => {
                        setGuide(null);
                        toast.success(lang === "hi" ? "गाइड पूरी हुई।" : "Guide finished.");
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      {lang === "hi" ? "हो गया" : "Done"}
                    </Button>
                  )}
                </div>
                <Button variant="secondary" size="lg" className="h-14 w-full" onClick={needHelp}>
                  <HelpCircle className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "मदद चाहिए" : "Need Help"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Hazard dialog */}
      <Dialog open={!!hazard} onOpenChange={(o) => !o && setHazard(null)}>
        <DialogContent>
          {hazard && (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">{t(hazard.name)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex h-32 items-center justify-center rounded-2xl bg-destructive/10">
                  <hazard.icon className="h-16 w-16 text-destructive" />
                </div>
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-base font-bold text-destructive">
                  {lang === "hi"
                    ? "काम रोकें। दूर हट जाएं और मैनेजर को बताएं।"
                    : "Stop work. Move away and inform the manager."}
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-sm">{t(hazard.tip)}</div>
                <Button variant="outline" size="lg" className="h-14 w-full" onClick={audio}>
                  <Volume2 className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "सुनें" : "Play Audio"}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-14 w-full"
                  onClick={() => {
                    setHazard(null);
                    onReportProblem("safety");
                  }}
                >
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "सुरक्षा दिक्कत बताएं" : "Report Safety Problem"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
