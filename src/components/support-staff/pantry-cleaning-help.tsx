import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Camera,
  CheckCircle2,
  Coffee,
  CupSoda,
  Droplets,
  Flame,
  GlassWater,
  HelpCircle,
  Languages,
  LifeBuoy,
  Mic,
  PhoneCall,
  Play,
  Plug,
  Search,
  Shapes,
  ShieldAlert,
  Smartphone,
  Sparkles,
  SprayCan,
  Trash2,
  Weight,
  Wind,
} from "lucide-react";
import type { Bi, Lang } from "./pantry-cleaning-data";
import { LangSwitch } from "./pantry-cleaning-ui";

type Cat = "pantry" | "cleaning" | "supplies" | "safety" | "app" | "contact";

type Guide = {
  id: string;
  cat: Cat;
  title: Bi;
  icon: React.ComponentType<{ className?: string }>;
  steps: Bi[];
};

const G = (
  id: string,
  cat: Cat,
  title: Bi,
  icon: React.ComponentType<{ className?: string }>,
  steps: Bi[],
): Guide => ({ id, cat, title, icon, steps });

const GUIDES: Guide[] = [
  // Pantry
  G("tea", "pantry", { en: "Prepare Tea or Coffee", hi: "चाय या कॉफी बनाएं" }, Coffee, [
    { en: "Wash your hands with soap.", hi: "हाथ साबुन से धोएं।" },
    { en: "Boil water in the kettle.", hi: "केतली में पानी उबालें।" },
    { en: "Add tea or coffee, sugar and milk.", hi: "चाय या कॉफी, चीनी और दूध डालें।" },
    { en: "Pour into a clean cup and serve on a tray.", hi: "साफ कप में डालें और ट्रे में दें।" },
    { en: "Clean the counter after work.", hi: "काम के बाद काउंटर साफ करें।" },
  ]),
  G("water", "pantry", { en: "Refill Drinking Water", hi: "पीने का पानी भरें" }, GlassWater, [
    { en: "Check the empty water bottle.", hi: "खाली बोतल देखें।" },
    { en: "Wipe the dispenser top with a clean cloth.", hi: "मशीन का ऊपरी हिस्सा कपड़े से पोंछें।" },
    { en: "Place the new bottle carefully with both hands.", hi: "नई बोतल दोनों हाथों से सावधानी से लगाएं।" },
    { en: "Fill one glass to check the water flows.", hi: "एक गिलास भरकर पानी चेक करें।" },
  ]),
  G("counter", "pantry", { en: "Clean Pantry Counter", hi: "पैंट्री काउंटर साफ करें" }, Sparkles, [
    { en: "Remove all items from the counter.", hi: "काउंटर से सारा सामान हटाएं।" },
    { en: "Wipe with a wet cloth and mild cleaner.", hi: "गीले कपड़े और हल्के क्लीनर से पोंछें।" },
    { en: "Dry the counter with a dry cloth.", hi: "सूखे कपड़े से काउंटर सुखाएं।" },
    { en: "Place items back neatly.", hi: "सामान सही जगह पर रखें।" },
  ]),
  G("store", "pantry", { en: "Store Pantry Supplies", hi: "पैंट्री सामान रखें" }, Boxes, [
    { en: "Keep tea, coffee and sugar in closed boxes.", hi: "चाय, कॉफी, चीनी बंद डिब्बों में रखें।" },
    { en: "Keep milk in the fridge only.", hi: "दूध सिर्फ फ्रिज में रखें।" },
    { en: "Old stock in front, new stock behind.", hi: "पुराना सामान आगे, नया पीछे रखें।" },
    { en: "Tell the manager when an item is finishing.", hi: "सामान खत्म होने पर मैनेजर को बताएं।" },
  ]),
  G("cups", "pantry", { en: "Wash Cups and Utensils", hi: "कप और बर्तन धोएं" }, CupSoda, [
    { en: "Throw leftover liquid in the sink.", hi: "बचा हुआ पानी सिंक में डालें।" },
    { en: "Wash with dish soap and a sponge.", hi: "साबुन और स्पंज से धोएं।" },
    { en: "Rinse well with clean water.", hi: "साफ पानी से अच्छे से धोएं।" },
    { en: "Keep upside down on the rack to dry.", hi: "रैक पर उल्टा रखकर सुखाएं।" },
  ]),
  // Cleaning
  G("floor", "cleaning", { en: "Clean Floor", hi: "फर्श साफ करें" }, Sparkles, [
    { en: "Sweep the floor first.", hi: "पहले झाड़ू लगाएं।" },
    { en: "Mix floor cleaner in a bucket of water.", hi: "बाल्टी के पानी में फर्श क्लीनर मिलाएं।" },
    { en: "Put the wet floor sign.", hi: "गीले फर्श का साइन लगाएं।" },
    { en: "Mop in one direction, corner to corner.", hi: "एक दिशा में, कोने से कोने तक पोछा लगाएं।" },
    { en: "Wait till dry, then remove the sign.", hi: "सूखने तक रुकें, फिर साइन हटाएं।" },
  ]),
  G("glass", "cleaning", { en: "Clean Glass", hi: "शीशा साफ करें" }, SprayCan, [
    { en: "Spray glass cleaner lightly.", hi: "ग्लास क्लीनर हल्का स्प्रे करें।" },
    { en: "Wipe from top to bottom.", hi: "ऊपर से नीचे पोंछें।" },
    { en: "Use a dry cloth for shine.", hi: "चमक के लिए सूखा कपड़ा लगाएं।" },
  ]),
  G("washroom", "cleaning", { en: "Clean Washroom", hi: "वॉशरूम साफ करें" }, Droplets, [
    { en: "Wear gloves before starting.", hi: "शुरू करने से पहले दस्ताने पहनें।" },
    { en: "Put disinfectant in the toilet and wait 5 minutes.", hi: "टॉयलेट में डिसइंफेक्टेंट डालें, 5 मिनट रुकें।" },
    { en: "Scrub with the brush and flush.", hi: "ब्रश से रगड़ें और फ्लश करें।" },
    { en: "Clean the basin, mirror and taps.", hi: "बेसिन, शीशा और नल साफ करें।" },
    { en: "Mop the floor and refill soap and tissue.", hi: "फर्श पोछें, साबुन और टिशू भरें।" },
  ]),
  G("bins", "cleaning", { en: "Empty Dustbins", hi: "कूड़ेदान खाली करें" }, Trash2, [
    { en: "Wear gloves.", hi: "दस्ताने पहनें।" },
    { en: "Tie the bag and take it to the collection point.", hi: "थैली बांधकर कूड़ा जगह पर ले जाएं।" },
    { en: "Wipe the bin and put a new bag.", hi: "कूड़ेदान पोंछें और नई थैली लगाएं।" },
    { en: "Wash your hands.", hi: "हाथ धोएं।" },
  ]),
  G("reception", "cleaning", { en: "Clean Reception", hi: "रिसेप्शन साफ करें" }, Wind, [
    { en: "Dust the table, chairs and counter.", hi: "मेज, कुर्सी और काउंटर की धूल साफ करें।" },
    { en: "Clean the glass door.", hi: "शीशे का दरवाजा साफ करें।" },
    { en: "Arrange chairs and magazines neatly.", hi: "कुर्सी और मैगजीन सही रखें।" },
    { en: "Mop the floor.", hi: "फर्श पर पोछा लगाएं।" },
  ]),
  G("chem", "cleaning", { en: "Use Cleaning Chemicals Safely", hi: "क्लीनिंग केमिकल सुरक्षित तरीके से" }, ShieldAlert, [
    { en: "Always wear gloves.", hi: "हमेशा दस्ताने पहनें।" },
    { en: "Never mix two chemicals together.", hi: "दो केमिकल कभी न मिलाएं।" },
    { en: "Keep the area airy, open the window.", hi: "जगह हवादार रखें, खिड़की खोलें।" },
    { en: "If it touches skin, wash with water and inform the manager.", hi: "त्वचा पर लगे तो पानी से धोएं और मैनेजर को बताएं।" },
  ]),
  // Supplies
  G("req", "supplies", { en: "How to Request Supplies", hi: "सामान कैसे मांगें" }, Boxes, [
    { en: "Open the Supplies page.", hi: "सामान पेज खोलें।" },
    { en: "Choose Pantry or Cleaning.", hi: "पैंट्री या सफाई चुनें।" },
    { en: "Select the item and quantity.", hi: "सामान और मात्रा चुनें।" },
    { en: "Press Submit Request.", hi: "अनुरोध भेजें दबाएं।" },
    { en: "Collect the item when the status says Ready.", hi: "तैयार दिखे तो सामान ले लें।" },
  ]),
  G("dilute", "supplies", { en: "Mix Cleaner with Water", hi: "क्लीनर पानी में मिलाएं" }, Droplets, [
    { en: "One cap of cleaner in one bucket of water.", hi: "एक बाल्टी पानी में एक कैप क्लीनर।" },
    { en: "Stir with the mop handle, not your hand.", hi: "हाथ से नहीं, पोछे के डंडे से मिलाएं।" },
    { en: "Close the bottle cap tightly after use.", hi: "इस्तेमाल के बाद बोतल कसकर बंद करें।" },
  ]),
  // App help
  G("app-tasks", "app", { en: "View My Tasks", hi: "मेरे काम देखें" }, Smartphone, [
    { en: "Press My Tasks in the menu.", hi: "मेन्यू में मेरे काम दबाएं।" },
    { en: "Red tasks are urgent, do them first.", hi: "लाल काम ज़रूरी हैं, पहले करें।" },
  ]),
  G("app-start", "app", { en: "Start Work", hi: "काम शुरू करें" }, Play, [
    { en: "Open the task and press Start Work.", hi: "काम खोलें और काम शुरू दबाएं।" },
    { en: "The start time is saved automatically.", hi: "शुरू का समय अपने आप सेव होता है।" },
  ]),
  G("app-done", "app", { en: "Complete Work", hi: "काम पूरा करें" }, CheckCircle2, [
    { en: "Tick every item in the checklist.", hi: "चेकलिस्ट के हर काम पर टिक करें।" },
    { en: "Press Work Completed and Submit.", hi: "काम पूरा और भेजें दबाएं।" },
    { en: "The manager will check and approve it.", hi: "मैनेजर देखकर मंज़ूरी देंगे।" },
  ]),
  G("app-photo", "app", { en: "Add Photo", hi: "फोटो लगाएं" }, Camera, [
    { en: "Press Add Photo on the completion screen.", hi: "पूरा करने की स्क्रीन पर फोटो लगाएं दबाएं।" },
    { en: "Take a clear photo of the finished work.", hi: "पूरे हुए काम की साफ फोटो लें।" },
  ]),
  G("app-supply", "app", { en: "Request Supplies", hi: "सामान मांगें" }, Boxes, [
    { en: "Go to Supplies and press New Request.", hi: "सामान पेज पर नया अनुरोध दबाएं।" },
    { en: "Choose item, quantity and submit.", hi: "सामान, मात्रा चुनें और भेजें।" },
  ]),
  G("app-problem", "app", { en: "Report a Problem", hi: "दिक्कत बताएं" }, AlertTriangle, [
    { en: "Go to Report a Problem.", hi: "दिक्कत बताएं पेज खोलें।" },
    { en: "Choose the problem and the location.", hi: "दिक्कत और जगह चुनें।" },
    { en: "Add a photo if possible and submit.", hi: "हो सके तो फोटो लगाएं और भेजें।" },
  ]),
  G("app-lang", "app", { en: "Change Language", hi: "भाषा बदलें" }, Languages, [
    { en: "Press English or हिंदी at the top.", hi: "ऊपर English या हिंदी दबाएं।" },
    { en: "All screens change immediately.", hi: "सभी स्क्रीन तुरंत बदल जाएंगी।" },
  ]),
];

const CATS: { id: Cat; label: Bi; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { id: "pantry", label: { en: "Pantry Work", hi: "पैंट्री का काम" }, icon: Coffee, tone: "amber" },
  { id: "cleaning", label: { en: "Cleaning Work", hi: "सफाई का काम" }, icon: SprayCan, tone: "blue" },
  { id: "supplies", label: { en: "How to Use Supplies", hi: "सामान कैसे इस्तेमाल करें" }, icon: Boxes, tone: "blue" },
  { id: "safety", label: { en: "Safety Rules", hi: "सुरक्षा नियम" }, icon: ShieldAlert, tone: "red" },
  { id: "app", label: { en: "How to Use the App", hi: "ऐप कैसे चलाएं" }, icon: Smartphone, tone: "blue" },
  { id: "contact", label: { en: "Contact Manager", hi: "मैनेजर से बात करें" }, icon: PhoneCall, tone: "green" },
];

const SAFETY: { id: string; label: Bi; icon: React.ComponentType<{ className?: string }>; rule: Bi }[] = [
  {
    id: "wet",
    label: { en: "Wet Floor", hi: "गीला फर्श" },
    icon: Droplets,
    rule: { en: "Put the wet floor sign. Walk slowly.", hi: "गीले फर्श का साइन लगाएं। धीरे चलें।" },
  },
  {
    id: "power",
    label: { en: "Electricity", hi: "बिजली" },
    icon: Plug,
    rule: { en: "Never touch wires or sockets with wet hands.", hi: "गीले हाथ से तार या सॉकेट कभी न छुएं।" },
  },
  {
    id: "glass",
    label: { en: "Broken Glass", hi: "टूटा शीशा" },
    icon: Shapes,
    rule: { en: "Do not pick with bare hands. Wear gloves.", hi: "खाली हाथ से न उठाएं। दस्ताने पहनें।" },
  },
  {
    id: "chem",
    label: { en: "Chemical Contact", hi: "केमिकल लगना" },
    icon: SprayCan,
    rule: { en: "Wash with plenty of water for 5 minutes.", hi: "5 मिनट तक ढेर पानी से धोएं।" },
  },
  {
    id: "fire",
    label: { en: "Fire or Smoke", hi: "आग या धुआं" },
    icon: Flame,
    rule: { en: "Leave the area at once and inform everyone.", hi: "तुरंत जगह छोड़ें और सबको बताएं।" },
  },
  {
    id: "heavy",
    label: { en: "Heavy Items", hi: "भारी सामान" },
    icon: Weight,
    rule: { en: "Bend your knees. Ask for help.", hi: "घुटने मोड़ें। मदद मांगें।" },
  },
];

const H = {
  title: { en: "Help", hi: "मदद" },
  call: { en: "Call Manager", hi: "मैनेजर को कॉल" },
  search: { en: "Search help", hi: "मदद खोजें" },
  guides: { en: "Guides", hi: "गाइड" },
  step: { en: "Step", hi: "चरण" },
  of: { en: "of", hi: "में से" },
  audio: { en: "Play Audio", hi: "आवाज़ सुनें" },
  prev: { en: "Previous", hi: "पीछे" },
  next: { en: "Next", hi: "आगे" },
  done: { en: "Done", hi: "हो गया" },
  needHelp: { en: "Need Help", hi: "मदद चाहिए" },
  helpSent: { en: "Message sent to your manager", hi: "मैनेजर को संदेश भेज दिया" },
  doneOk: { en: "Guide finished", hi: "गाइड पूरी हुई" },
  soon: { en: "Coming soon", hi: "जल्द आएगा" },
  danger: {
    en: "Stop work. Move away and inform the manager.",
    hi: "काम रोकें। दूर हट जाएं और मैनेजर को बताएं।",
  },
  reportProblem: { en: "Report a Problem", hi: "दिक्कत बताएं" },
  notClear: { en: "Instructions Not Clear", hi: "निर्देश समझ नहीं आया" },
  sendPhoto: { en: "Send Photo", hi: "फोटो भेजें" },
  sendVoice: { en: "Send Voice Note", hi: "आवाज़ नोट भेजें" },
  noResult: { en: "Nothing found", hi: "कुछ नहीं मिला" },
  back: { en: "Back", hi: "पीछे" },
  opened: { en: "Guides you opened", hi: "आपने जो गाइड खोली" },
};

const TONE: Record<string, string> = {
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/40",
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/40",
  red: "bg-destructive/10 text-destructive border-destructive/40",
  green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/40",
};

export function PantryCleaningHelp({
  lang,
  setLang,
  onReportProblem,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  onReportProblem?: () => void;
}) {
  const t = (v: Bi) => v[lang];
  const [cat, setCat] = useState<Cat | null>(null);
  const [q, setQ] = useState("");
  const [guide, setGuide] = useState<Guide | null>(null);
  const [step, setStep] = useState(0);
  const [danger, setDanger] = useState<string | null>(null);
  const [opened, setOpened] = useState<string[]>([]);

  const soon = () => toast.info(t(H.soon));

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return GUIDES.filter(
      (g) => g.title.en.toLowerCase().includes(s) || g.title.hi.includes(q.trim()),
    );
  }, [q]);

  const openGuide = (g: Guide) => {
    setGuide(g);
    setStep(0);
    setOpened((prev) => (prev.includes(g.id) ? prev : [...prev, g.id]));
  };

  const needHelp = () => {
    toast.success(t(H.helpSent));
  };

  const catGuides = cat ? GUIDES.filter((g) => g.cat === cat) : [];
  const dangerItem = SAFETY.find((s) => s.id === danger) ?? null;

  const Tile = ({
    icon: Icon,
    label,
    tone = "blue",
    onClick,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    tone?: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-colors hover:bg-muted ${TONE[tone]}`}
    >
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background/70">
        <Icon className="h-11 w-11" />
      </span>
      <span className="text-base font-bold leading-tight text-foreground">{label}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="space-y-3 rounded-xl border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <LifeBuoy className="h-7 w-7 text-primary" />
            {t(H.title)}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <LangSwitch lang={lang} setLang={setLang} />
            <Button size="lg" className="h-12" onClick={soon}>
              <PhoneCall className="mr-2 h-5 w-5" /> {t(H.call)}
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(H.search)}
            className="h-14 pl-11 text-base"
          />
        </div>
      </div>

      {/* search results */}
      {results && (
        <div className="space-y-3">
          {results.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-lg text-muted-foreground">
                {t(H.noResult)}
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {results.map((g) => (
              <Tile key={g.id} icon={g.icon} label={t(g.title)} onClick={() => openGuide(g)} />
            ))}
          </div>
        </div>
      )}

      {/* categories */}
      {!results && !cat && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATS.map((c) => (
            <Tile
              key={c.id}
              icon={c.icon}
              label={t(c.label)}
              tone={c.tone}
              onClick={() => setCat(c.id)}
            />
          ))}
        </div>
      )}

      {/* category content */}
      {!results && cat && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              {t(CATS.find((c) => c.id === cat)!.label)}
            </h2>
            <Button variant="outline" size="lg" className="h-12" onClick={() => setCat(null)}>
              <ArrowLeft className="mr-2 h-5 w-5" /> {t(H.back)}
            </Button>
          </div>

          {cat === "safety" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SAFETY.map((s) => (
                  <Tile
                    key={s.id}
                    icon={s.icon}
                    label={t(s.label)}
                    tone="red"
                    onClick={() => setDanger(s.id)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {GUIDES.filter((g) => g.id === "chem").map((g) => (
                  <Tile key={g.id} icon={g.icon} label={t(g.title)} tone="red" onClick={() => openGuide(g)} />
                ))}
              </div>
            </div>
          )}

          {cat === "contact" && (
            <div className="space-y-3">
              <Button size="lg" className="h-20 w-full text-lg" onClick={soon}>
                <PhoneCall className="mr-2 h-7 w-7" /> {t(H.call)}
              </Button>
              <Button variant="outline" size="lg" className="h-20 w-full text-lg" onClick={soon}>
                <Camera className="mr-2 h-7 w-7" /> {t(H.sendPhoto)}
              </Button>
              <Button variant="outline" size="lg" className="h-20 w-full text-lg" onClick={soon}>
                <Mic className="mr-2 h-7 w-7" /> {t(H.sendVoice)}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="h-20 w-full text-lg"
                onClick={() => onReportProblem?.()}
              >
                <AlertTriangle className="mr-2 h-7 w-7" /> {t(H.reportProblem)}
              </Button>
              <Button variant="secondary" size="lg" className="h-20 w-full text-lg" onClick={needHelp}>
                <HelpCircle className="mr-2 h-7 w-7" /> {t(H.notClear)}
              </Button>
            </div>
          )}

          {cat !== "safety" && cat !== "contact" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {catGuides.map((g) => (
                <Tile
                  key={g.id}
                  icon={g.icon}
                  label={t(g.title)}
                  tone={cat === "pantry" ? "amber" : "blue"}
                  onClick={() => openGuide(g)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {opened.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t(H.opened)}: {opened.length}
        </p>
      )}

      {/* one-step guide viewer */}
      <Dialog open={!!guide} onOpenChange={(o) => !o && setGuide(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
          {guide && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl">{t(guide.title)}</DialogTitle>
              </DialogHeader>

              <div className="flex h-44 items-center justify-center rounded-2xl bg-muted">
                <guide.icon className="h-24 w-24 text-primary" />
              </div>

              <p className="text-center text-sm font-semibold text-muted-foreground">
                {t(H.step)} {step + 1} {t(H.of)} {guide.steps.length}
              </p>
              <p className="text-center text-xl font-bold leading-snug">
                {t(guide.steps[step])}
              </p>

              <Button
                variant="secondary"
                size="lg"
                className="h-16 w-full text-lg"
                onClick={soon}
              >
                <Play className="mr-2 h-7 w-7" /> {t(H.audio)}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft className="mr-2 h-6 w-6" /> {t(H.prev)}
                </Button>
                {step < guide.steps.length - 1 ? (
                  <Button size="lg" className="h-16" onClick={() => setStep((s) => s + 1)}>
                    {t(H.next)} <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="h-16 bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => {
                      setGuide(null);
                      toast.success(t(H.doneOk));
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-6 w-6" /> {t(H.done)}
                  </Button>
                )}
              </div>

              <Button variant="outline" size="lg" className="h-14 w-full" onClick={needHelp}>
                <HelpCircle className="mr-2 h-6 w-6" /> {t(H.needHelp)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* danger dialog */}
      <Dialog open={!!danger} onOpenChange={(o) => !o && setDanger(null)}>
        <DialogContent className="sm:max-w-md">
          {dangerItem && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
                  <dangerItem.icon className="h-7 w-7" />
                  {t(dangerItem.label)}
                </DialogTitle>
              </DialogHeader>
              <div className="flex h-40 items-center justify-center rounded-2xl bg-destructive/10">
                <dangerItem.icon className="h-24 w-24 text-destructive" />
              </div>
              <p className="rounded-xl border-2 border-destructive bg-destructive/10 p-4 text-center text-lg font-bold text-destructive">
                {t(H.danger)}
              </p>
              <p className="text-center text-base font-semibold">{t(dangerItem.rule)}</p>
              <Button variant="secondary" size="lg" className="h-14 w-full" onClick={soon}>
                <Play className="mr-2 h-6 w-6" /> {t(H.audio)}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="h-16 w-full text-lg"
                onClick={() => {
                  setDanger(null);
                  onReportProblem?.();
                }}
              >
                <AlertTriangle className="mr-2 h-6 w-6" /> {t(H.reportProblem)}
              </Button>
              <Button variant="outline" size="lg" className="h-14 w-full" onClick={soon}>
                <PhoneCall className="mr-2 h-6 w-6" /> {t(H.call)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
