// Field Engineer — "Submit Work Report" (mobile-first, bilingual, 5 simple steps).
// Reports always attach to one assigned job / master support ticket from JOBS.
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Mic,
  Save,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JOBS, type Bi, type Job, type Lang } from "@/components/field-engineer/data";

type YN = "yes" | "no";
type Working = "yes" | "partly" | "no";

const T = {
  title: { en: "Submit Work Report", hi: "कार्य रिपोर्ट जमा करें" },
  sub: {
    en: "One report for one job. Very little typing needed.",
    hi: "एक कार्य के लिए एक रिपोर्ट। बहुत कम टाइपिंग।",
  },
  pending: { en: "Reports Pending", hi: "रिपोर्ट लंबित" },
  drafts: { en: "Draft Reports", hi: "ड्राफ़्ट रिपोर्ट" },
  submitted: { en: "Reports Submitted", hi: "जमा रिपोर्ट" },
  step: { en: "Step", hi: "चरण" },
  of: { en: "of", hi: "में से" },
  steps: {
    job: { en: "Select Job", hi: "कार्य चुनें" },
    photos: { en: "Add Photos", hi: "फ़ोटो जोड़ें" },
    work: { en: "Work Done", hi: "किया गया काम" },
    customer: { en: "Customer Confirmation", hi: "ग्राहक पुष्टि" },
    submit: { en: "Submit", hi: "जमा करें" },
  },
  jobNo: { en: "Job No.", hi: "कार्य नं." },
  machine: { en: "Machine", hi: "मशीन" },
  visitDate: { en: "Visit Date", hi: "विज़िट तिथि" },
  problemReported: { en: "Problem Reported", hi: "बताई गई समस्या" },
  noJobs: {
    en: "No jobs need a report right now.",
    hi: "अभी किसी कार्य की रिपोर्ट बाकी नहीं है।",
  },
  selected: { en: "Selected", hi: "चयनित" },
  select: { en: "Select", hi: "चुनें" },
  before: { en: "Add Before Photo", hi: "पहले की फ़ोटो जोड़ें" },
  after: { en: "Add After Photo", hi: "बाद की फ़ोटो जोड़ें" },
  machinePhoto: { en: "Add Machine Photo", hi: "मशीन की फ़ोटो जोड़ें" },
  partPhoto: { en: "Add Part Photo", hi: "पार्ट की फ़ोटो जोड़ें" },
  video: { en: "Add Video", hi: "वीडियो जोड़ें" },
  added: { en: "Added", hi: "जुड़ गया" },
  qProblem: { en: "What was the problem?", hi: "समस्या क्या थी?" },
  qWork: { en: "What work was done?", hi: "क्या काम किया गया?" },
  qWorking: { en: "Is the machine working now?", hi: "क्या मशीन अब चल रही है?" },
  qPart: { en: "Was any part changed?", hi: "कोई पार्ट बदला गया?" },
  qRevisit: { en: "Is another visit required?", hi: "दोबारा विज़िट चाहिए?" },
  qTech: { en: "Is Technical Support required?", hi: "टेक्निकल सपोर्ट चाहिए?" },
  yes: { en: "Yes", hi: "हाँ" },
  no: { en: "No", hi: "नहीं" },
  partly: { en: "Partly", hi: "आंशिक" },
  voice: { en: "Voice Note", hi: "वॉइस नोट" },
  partName: { en: "Part name", hi: "पार्ट का नाम" },
  qty: { en: "Quantity", hi: "मात्रा" },
  oldPartPhoto: { en: "Old Part Photo", hi: "पुराने पार्ट की फ़ोटो" },
  newPartPhoto: { en: "New Part Photo", hi: "नए पार्ट की फ़ोटो" },
  reason: { en: "Reason machine is not working", hi: "मशीन न चलने का कारण" },
  nextAction: { en: "Next action", hi: "अगला कदम" },
  waitPart: { en: "Waiting for part — part required", hi: "पार्ट की प्रतीक्षा — आवश्यक पार्ट" },
  custName: { en: "Customer name", hi: "ग्राहक का नाम" },
  custMobile: { en: "Customer mobile number", hi: "ग्राहक का मोबाइल नंबर" },
  satisfied: { en: "Customer satisfied?", hi: "ग्राहक संतुष्ट?" },
  comments: { en: "Customer comments", hi: "ग्राहक की टिप्पणी" },
  signature: { en: "Customer Signature", hi: "ग्राहक हस्ताक्षर" },
  signSoon: { en: "Signature box — coming soon", hi: "हस्ताक्षर बॉक्स — जल्द आएगा" },
  completedAt: { en: "Completion date and time", hi: "पूर्ण होने की तिथि व समय" },
  review: { en: "Review", hi: "समीक्षा" },
  customer: { en: "Customer", hi: "ग्राहक" },
  problem: { en: "Problem", hi: "समस्या" },
  workDone: { en: "Work completed", hi: "पूरा हुआ काम" },
  status: { en: "Machine status", hi: "मशीन की स्थिति" },
  partsUsed: { en: "Parts used", hi: "उपयोग किए पार्ट्स" },
  photos: { en: "Photos attached", hi: "जुड़ी फ़ोटो" },
  confirmation: { en: "Customer confirmation", hi: "ग्राहक पुष्टि" },
  outcome: { en: "Report Outcome", hi: "रिपोर्ट परिणाम" },
  saveDraft: { en: "Save Draft", hi: "ड्राफ़्ट सेव करें" },
  submitReport: { en: "Submit Report", hi: "रिपोर्ट जमा करें" },
  back: { en: "Back", hi: "पीछे" },
  next: { en: "Next", hi: "आगे" },
  none: { en: "None", hi: "कोई नहीं" },
  draftSaved: { en: "Draft saved on this device", hi: "ड्राफ़्ट इस डिवाइस पर सेव हुआ" },
  needJob: { en: "Please select a job first", hi: "कृपया पहले कार्य चुनें" },
  needWork: { en: "Please write what work was done", hi: "कृपया लिखें क्या काम किया गया" },
  needReason: {
    en: "Machine not working — reason and next action are required",
    hi: "मशीन नहीं चल रही — कारण और अगला कदम आवश्यक",
  },
  needPart: { en: "Please write the required part name", hi: "कृपया आवश्यक पार्ट का नाम लिखें" },
  needCust: { en: "Customer name and mobile are required", hi: "ग्राहक का नाम और मोबाइल आवश्यक" },
  soon: { en: "Will be enabled soon", hi: "जल्द चालू होगा" },
  successTitle: { en: "Report submitted", hi: "रिपोर्ट जमा हो गई" },
  successBody: {
    en: "My Jobs, Visit Schedule and the Relationship Manager dashboard are updated.",
    hi: "मेरे कार्य, विज़िट शेड्यूल और रिलेशनशिप मैनेजर डैशबोर्ड अपडेट हो गए।",
  },
  newReport: { en: "Start New Report", hi: "नई रिपोर्ट शुरू करें" },
  version: { en: "Version", hi: "संस्करण" },
  cannotDelete: {
    en: "Submitted reports cannot be deleted. A correction creates a new version.",
    hi: "जमा रिपोर्ट हटाई नहीं जा सकती। सुधार से नया संस्करण बनता है।",
  },
  correction: { en: "Make Correction", hi: "सुधार करें" },
  revisitCreated: { en: "New visit request created", hi: "नई विज़िट रिक्वेस्ट बनी" },
  techAlert: { en: "Technical Support alert sent (in-app)", hi: "टेक्निकल सपोर्ट अलर्ट भेजा (ऐप में)" },
};

const OUTCOMES: Record<string, Bi> = {
  working: { en: "Machine Working", hi: "मशीन चल रही है" },
  partly: { en: "Machine Partly Working", hi: "मशीन आंशिक चल रही है" },
  notWorking: { en: "Machine Not Working", hi: "मशीन नहीं चल रही" },
  waitPart: { en: "Waiting for Part", hi: "पार्ट की प्रतीक्षा" },
  followUp: { en: "Follow-up Visit Required", hi: "दोबारा विज़िट आवश्यक" },
  tech: { en: "Technical Support Required", hi: "टेक्निकल सपोर्ट आवश्यक" },
  done: { en: "Job Completed", hi: "कार्य पूर्ण" },
};

const PHOTO_KEYS = ["before", "after", "machine", "part", "videoClip"] as const;
type PhotoKey = (typeof PHOTO_KEYS)[number];

// Jobs that still need a report (assigned jobs only — no unassigned job can be picked).
const REPORTABLE_IDS = ["FE-2039", "FE-2041", "FE-2042"];

export function FieldEngineerWorkReport({ lang }: { lang: Lang }) {
  const reportable = useMemo(() => JOBS.filter((j) => REPORTABLE_IDS.includes(j.id)), []);

  const [step, setStep] = useState(1);
  const [jobId, setJobId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<PhotoKey, boolean>>({
    before: false,
    after: false,
    machine: false,
    part: false,
    videoClip: false,
  });
  const [work, setWork] = useState({
    problem: "",
    done: "",
    working: "yes" as Working,
    partChanged: "no" as YN,
    revisit: "no" as YN,
    tech: "no" as YN,
    reason: "",
    nextAction: "",
    requiredPart: "",
    partName: "",
    qty: "1",
    oldPartPhoto: false,
    newPartPhoto: false,
  });
  const [cust, setCust] = useState({
    name: "",
    mobile: "",
    satisfied: "yes" as YN,
    comments: "",
    signed: false,
  });
  const [drafts, setDrafts] = useState(1);
  const [submitted, setSubmitted] = useState(2);
  const [done, setDone] = useState<null | { version: number; outcome: string }>(null);
  const [version, setVersion] = useState(1);

  const job: Job | null = jobId ? (JOBS.find((j) => j.id === jobId) ?? null) : null;
  const soon = () => toast.info(T.soon[lang]);

  const outcome = (): string => {
    if (work.working === "no") {
      if (work.requiredPart.trim()) return "waitPart";
      return "notWorking";
    }
    if (work.tech === "yes") return "tech";
    if (work.revisit === "yes") return "followUp";
    if (work.working === "partly") return "partly";
    return "done";
  };

  const photoCount = PHOTO_KEYS.filter((k) => photos[k]).length;

  const validate = (target: number) => {
    if (target > 1 && !jobId) return T.needJob[lang];
    if (target > 3) {
      if (!work.done.trim()) return T.needWork[lang];
      if (work.working === "no" && !(work.reason.trim() && work.nextAction.trim()))
        return T.needReason[lang];
      if (work.working === "no" && work.nextAction.trim() && !work.requiredPart.trim() && false)
        return T.needPart[lang];
    }
    if (target > 4 && !(cust.name.trim() && cust.mobile.trim())) return T.needCust[lang];
    return null;
  };

  const go = (target: number) => {
    const err = validate(target);
    if (err) {
      toast.error(err);
      return;
    }
    setStep(Math.min(5, Math.max(1, target)));
  };

  const saveDraft = () => {
    if (!jobId) {
      toast.error(T.needJob[lang]);
      return;
    }
    setDrafts((d) => d + 1);
    toast.success(T.draftSaved[lang]);
  };

  const submit = () => {
    const err = validate(5);
    if (err) {
      toast.error(err);
      return;
    }
    const out = outcome();
    setSubmitted((s) => s + 1);
    if (out === "followUp") toast.success(T.revisitCreated[lang]);
    if (out === "tech" || work.tech === "yes") toast.success(T.techAlert[lang]);
    if (out === "waitPart") toast.success(`${T.waitPart[lang]}: ${work.requiredPart}`);
    toast.success(T.successTitle[lang]);
    setDone({ version, outcome: out });
  };

  const resetAll = () => {
    setDone(null);
    setStep(1);
    setJobId(null);
    setVersion(1);
    setPhotos({ before: false, after: false, machine: false, part: false, videoClip: false });
    setWork({
      problem: "",
      done: "",
      working: "yes",
      partChanged: "no",
      revisit: "no",
      tech: "no",
      reason: "",
      nextAction: "",
      requiredPart: "",
      partName: "",
      qty: "1",
      oldPartPhoto: false,
      newPartPhoto: false,
    });
    setCust({ name: "", mobile: "", satisfied: "yes", comments: "", signed: false });
  };

  const kpis = [
    { label: T.pending[lang], value: String(reportable.length), icon: FileText },
    { label: T.drafts[lang], value: String(drafts), icon: Save },
    { label: T.submitted[lang], value: String(submitted), icon: CheckCircle2 },
  ];

  const stepLabels = [
    T.steps.job[lang],
    T.steps.photos[lang],
    T.steps.work[lang],
    T.steps.customer[lang],
    T.steps.submit[lang],
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{T.title[lang]}</h1>
        <p className="text-sm text-muted-foreground">{T.sub[lang]}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <k.icon className="w-4 h-4 text-primary" /> {k.label}
              </div>
              <div className="text-2xl font-bold mt-1">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {done ? (
        <Card className="border-emerald-300 bg-emerald-50/60">
          <CardContent className="p-6 space-y-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div className="text-xl font-bold">{T.successTitle[lang]}</div>
            <div className="text-sm text-muted-foreground">{T.successBody[lang]}</div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">
                {T.jobNo[lang]}: {jobId}
              </Badge>
              <Badge className="bg-emerald-600 text-white">{OUTCOMES[done.outcome][lang]}</Badge>
              <Badge variant="outline">
                {T.version[lang]} {done.version}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{T.cannotDelete[lang]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Button
                className="h-12"
                variant="outline"
                onClick={() => {
                  setVersion(done.version + 1);
                  setDone(null);
                  setStep(3);
                }}
              >
                {T.correction[lang]}
              </Button>
              <Button className="h-12" onClick={resetAll}>
                {T.newReport[lang]}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">
                {T.step[lang]} {step} {T.of[lang]} 5 — {stepLabels[step - 1]}
              </CardTitle>
              {version > 1 && (
                <Badge variant="outline">
                  {T.version[lang]} {version}
                </Badge>
              )}
            </div>
            <div className="flex gap-1 pt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-3">
                {reportable.length === 0 && (
                  <p className="text-sm text-muted-foreground">{T.noJobs[lang]}</p>
                )}
                {reportable.map((j) => {
                  const active = jobId === j.id;
                  return (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => setJobId(j.id)}
                      className={`w-full text-left border rounded-lg p-4 ${
                        active ? "border-primary bg-primary/5" : "bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold">{j.store[lang]}</div>
                        <Badge variant={active ? "default" : "outline"}>
                          {active ? T.selected[lang] : T.select[lang]}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {T.jobNo[lang]}: {j.id} · {T.machine[lang]}: {j.machine[lang]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {T.visitDate[lang]}: {j.slot[lang]}
                      </div>
                      <div className="text-sm mt-1">
                        {T.problemReported[lang]}: {j.issue[lang]}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    ["before", T.before[lang], Camera],
                    ["after", T.after[lang], Camera],
                    ["machine", T.machinePhoto[lang], ImageIcon],
                    ["part", T.partPhoto[lang], ImageIcon],
                    ["videoClip", T.video[lang], Video],
                  ] as [PhotoKey, string, typeof Camera][]
                ).map(([k, label, Icon]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPhotos((p) => ({ ...p, [k]: !p[k] }))}
                    className={`border rounded-lg p-4 h-28 flex flex-col items-center justify-center gap-2 ${
                      photos[k] ? "border-emerald-400 bg-emerald-50/60" : "bg-muted/20"
                    }`}
                  >
                    <Icon className="w-7 h-7 text-primary" />
                    <span className="text-sm font-medium text-center">{label}</span>
                    {photos[k] && (
                      <span className="text-xs text-emerald-700">{T.added[lang]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>{T.qProblem[lang]}</Label>
                  <Textarea
                    rows={2}
                    value={work.problem}
                    placeholder={job?.issue[lang] ?? ""}
                    onChange={(e) => setWork({ ...work, problem: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{T.qWork[lang]}</Label>
                  <Textarea
                    rows={3}
                    value={work.done}
                    onChange={(e) => setWork({ ...work, done: e.target.value })}
                  />
                  <Button variant="outline" className="h-11 mt-2 w-full" onClick={soon}>
                    <Mic className="w-4 h-4 mr-2" /> {T.voice[lang]}
                  </Button>
                </div>

                <div>
                  <Label>{T.qWorking[lang]}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(["yes", "partly", "no"] as Working[]).map((v) => (
                      <Button
                        key={v}
                        className="h-12"
                        variant={work.working === v ? "default" : "outline"}
                        onClick={() => setWork({ ...work, working: v })}
                      >
                        {v === "yes" ? T.yes[lang] : v === "partly" ? T.partly[lang] : T.no[lang]}
                      </Button>
                    ))}
                  </div>
                </div>

                {work.working === "no" && (
                  <div className="space-y-3 border rounded-lg p-3 bg-destructive/5 border-destructive/30">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="w-4 h-4" /> {OUTCOMES.notWorking[lang]}
                    </div>
                    <div>
                      <Label>{T.reason[lang]}</Label>
                      <Textarea
                        rows={2}
                        value={work.reason}
                        onChange={(e) => setWork({ ...work, reason: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{T.nextAction[lang]}</Label>
                      <Input
                        className="h-11"
                        value={work.nextAction}
                        onChange={(e) => setWork({ ...work, nextAction: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{T.waitPart[lang]}</Label>
                      <Input
                        className="h-11"
                        value={work.requiredPart}
                        onChange={(e) => setWork({ ...work, requiredPart: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {(
                  [
                    ["partChanged", T.qPart[lang]],
                    ["revisit", T.qRevisit[lang]],
                    ["tech", T.qTech[lang]],
                  ] as ["partChanged" | "revisit" | "tech", string][]
                ).map(([k, label]) => (
                  <div key={k}>
                    <Label>{label}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {(["yes", "no"] as YN[]).map((v) => (
                        <Button
                          key={v}
                          className="h-12"
                          variant={work[k] === v ? "default" : "outline"}
                          onClick={() => setWork({ ...work, [k]: v })}
                        >
                          {v === "yes" ? T.yes[lang] : T.no[lang]}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

                {work.partChanged === "yes" && (
                  <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
                    <div>
                      <Label>{T.partName[lang]}</Label>
                      <Input
                        className="h-11"
                        value={work.partName}
                        onChange={(e) => setWork({ ...work, partName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{T.qty[lang]}</Label>
                      <Input
                        className="h-11"
                        type="number"
                        min={1}
                        value={work.qty}
                        onChange={(e) => setWork({ ...work, qty: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="h-16"
                        variant={work.oldPartPhoto ? "secondary" : "outline"}
                        onClick={() => setWork({ ...work, oldPartPhoto: !work.oldPartPhoto })}
                      >
                        <Camera className="w-4 h-4 mr-2" /> {T.oldPartPhoto[lang]}
                      </Button>
                      <Button
                        className="h-16"
                        variant={work.newPartPhoto ? "secondary" : "outline"}
                        onClick={() => setWork({ ...work, newPartPhoto: !work.newPartPhoto })}
                      >
                        <Camera className="w-4 h-4 mr-2" /> {T.newPartPhoto[lang]}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>{T.custName[lang]}</Label>
                  <Input
                    className="h-11"
                    value={cust.name}
                    placeholder={job?.owner ?? ""}
                    onChange={(e) => setCust({ ...cust, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{T.custMobile[lang]}</Label>
                  <Input
                    className="h-11"
                    inputMode="tel"
                    value={cust.mobile}
                    placeholder={job?.phone ?? ""}
                    onChange={(e) => setCust({ ...cust, mobile: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{T.satisfied[lang]}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {(["yes", "no"] as YN[]).map((v) => (
                      <Button
                        key={v}
                        className="h-12"
                        variant={cust.satisfied === v ? "default" : "outline"}
                        onClick={() => setCust({ ...cust, satisfied: v })}
                      >
                        {v === "yes" ? T.yes[lang] : T.no[lang]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>{T.comments[lang]}</Label>
                  <Textarea
                    rows={2}
                    value={cust.comments}
                    onChange={(e) => setCust({ ...cust, comments: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{T.signature[lang]}</Label>
                  <button
                    type="button"
                    onClick={() => setCust({ ...cust, signed: !cust.signed })}
                    className={`w-full h-24 mt-1 border-2 border-dashed rounded-lg text-sm ${
                      cust.signed
                        ? "border-emerald-400 bg-emerald-50/60 text-emerald-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    {cust.signed ? T.added[lang] : T.signSoon[lang]}
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {T.completedAt[lang]}: {new Date().toLocaleString()}
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && job && (
              <div className="space-y-3">
                {(
                  [
                    [T.customer[lang], `${cust.name || job.owner} · ${cust.mobile || job.phone}`],
                    [T.machine[lang], job.machine[lang]],
                    [T.problem[lang], work.problem || job.issue[lang]],
                    [T.workDone[lang], work.done || "—"],
                    [
                      T.status[lang],
                      work.working === "yes"
                        ? OUTCOMES.working[lang]
                        : work.working === "partly"
                          ? OUTCOMES.partly[lang]
                          : OUTCOMES.notWorking[lang],
                    ],
                    [
                      T.partsUsed[lang],
                      work.partChanged === "yes"
                        ? `${work.partName || "—"} × ${work.qty}`
                        : T.none[lang],
                    ],
                    [T.photos[lang], `${photoCount} / 5`],
                    [
                      T.confirmation[lang],
                      `${cust.satisfied === "yes" ? T.yes[lang] : T.no[lang]}${
                        cust.comments ? ` — ${cust.comments}` : ""
                      }`,
                    ],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b pb-2 text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-right">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-muted-foreground">{T.outcome[lang]}</span>
                  <Badge className="bg-primary text-primary-foreground">
                    {OUTCOMES[outcome()][lang]}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <Button className="h-14 text-base" variant="outline" onClick={saveDraft}>
                    <Save className="w-5 h-5 mr-2" /> {T.saveDraft[lang]}
                  </Button>
                  <Button className="h-14 text-base" onClick={submit}>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> {T.submitReport[lang]}
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                className="h-12"
                variant="outline"
                disabled={step === 1}
                onClick={() => go(step - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> {T.back[lang]}
              </Button>
              <Button className="h-12" variant="ghost" onClick={saveDraft}>
                <Save className="w-4 h-4 mr-1" /> {T.saveDraft[lang]}
              </Button>
              <Button className="h-12" disabled={step === 5} onClick={() => go(step + 1)}>
                {T.next[lang]} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
