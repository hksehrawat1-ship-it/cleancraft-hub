import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mic,
  Package,
  PackageCheck,
  Phone,
  PlayCircle,
  RotateCcw,
  Tag,
} from "lucide-react";
import { AudioButton, LangSwitch, tr } from "./pantry-cleaning-ui";
import type { Lang } from "./pantry-cleaning-data";
import {
  PACK_CHECKS,
  PACK_HELP,
  PACK_LABEL,
  PACK_STAFF,
  PACK_TASKS,
  nowLabel,
  packOpen,
  sortPack,
  type PackTask,
} from "./packing-data";

type Availability = "available" | "busy" | "off";

const AVAIL: Record<Availability, { en: string; hi: string; cls: string }> = {
  available: { en: "Available", hi: "उपलब्ध", cls: "bg-emerald-500/15 text-emerald-700" },
  busy: { en: "Busy", hi: "व्यस्त", cls: "bg-blue-500/15 text-blue-700" },
  off: { en: "Off Duty", hi: "ड्यूटी बंद", cls: "bg-muted text-muted-foreground" },
};

function ProductArt({ task, big }: { task: PackTask; big?: boolean }) {
  const tone = task.urgent
    ? "from-destructive/20 to-destructive/5 text-destructive"
    : task.status === "approved"
      ? "from-emerald-500/20 to-emerald-500/5 text-emerald-700"
      : task.status === "again"
        ? "from-amber-500/25 to-amber-500/5 text-amber-700"
        : "from-primary/20 to-primary/5 text-primary";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} ${
        big ? "h-32 w-32 md:h-40 md:w-40" : "h-20 w-20"
      }`}
      aria-hidden
    >
      <Package className={big ? "h-16 w-16 md:h-20 md:w-20" : "h-10 w-10"} />
    </div>
  );
}

export function PackingHome({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t = tr(lang);
  const [tasks, setTasks] = useState<PackTask[]>(PACK_TASKS);
  const [avail, setAvail] = useState<Availability>("available");
  const [completeFor, setCompleteFor] = useState<PackTask | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [photo, setPhoto] = useState(false);
  const [helpFor, setHelpFor] = useState<PackTask | null>(null);
  const [helpPick, setHelpPick] = useState<string | null>(null);

  const sorted = useMemo(() => sortPack(tasks), [tasks]);
  const next = sorted.find((x) => packOpen(x.status)) ?? null;
  const today = tasks.length;
  const remaining = tasks.filter((x) => packOpen(x.status)).length;
  const urgent = tasks.filter((x) => x.urgent && packOpen(x.status)).length;
  const done = tasks.filter((x) => !packOpen(x.status)).length;

  const dateLabel = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const start = (task: PackTask) => {
    setTasks((p) =>
      p.map((x) => (x.id === task.id ? { ...x, status: "started", startedAt: nowLabel() } : x)),
    );
    setAvail("busy");
    toast.success(
      lang === "hi" ? `पैकिंग शुरू ${nowLabel()}` : `Packing started at ${nowLabel()}`,
    );
  };

  const openComplete = (task: PackTask) => {
    setCompleteFor(task);
    setChecks({});
    setPhoto(false);
  };

  const submit = () => {
    if (!completeFor) return;
    const time = nowLabel();
    setTasks((p) =>
      p.map((x) =>
        x.id === completeFor.id
          ? {
              ...x,
              status: "review",
              completedAt: time,
              returnReason: undefined,
              managerNote: undefined,
              newDue: undefined,
              overdue: false,
            }
          : x,
      ),
    );
    setCompleteFor(null);
    setAvail("available");
    toast.success(lang === "hi" ? "पैकिंग जमा हो गई।" : "Packing submitted successfully.");
  };

  const allChecked = PACK_CHECKS.every((c) => checks[c.id]);
  const photoOk = !completeFor?.photoRequired || photo;

  const cards = [
    { label: { en: "Packing Today", hi: "आज की पैकिंग" }, v: today, cls: "text-primary", Icon: Package },
    { label: { en: "Remaining", hi: "बाकी" }, v: remaining, cls: "text-blue-700", Icon: Clock },
    { label: { en: "Urgent", hi: "ज़रूरी" }, v: urgent, cls: "text-destructive", Icon: AlertTriangle },
    { label: { en: "Completed", hi: "पूरा" }, v: done, cls: "text-emerald-700", Icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
            {PACK_STAFF.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-bold">
              {lang === "hi" ? `नमस्ते, ${PACK_STAFF.name}` : `Hello, ${PACK_STAFF.name}`}
            </div>
            <div className="text-sm text-muted-foreground">{dateLabel}</div>
          </div>
          <LangSwitch lang={lang} setLang={setLang} />
          <div className="flex w-full gap-2 sm:w-auto">
            {(Object.keys(AVAIL) as Availability[]).map((k) => (
              <button
                key={k}
                onClick={() => setAvail(k)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:flex-none ${
                  avail === k ? AVAIL[k].cls : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {AVAIL[k][lang]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label.en}>
            <CardContent className="p-4">
              <c.Icon className={`mb-2 h-7 w-7 ${c.cls}`} />
              <div className={`text-3xl font-extrabold ${c.cls}`}>{c.v}</div>
              <div className="text-sm text-muted-foreground">{t(c.label)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next task */}
      {next ? (
        <Card className={next.urgent ? "border-destructive/50" : "border-primary/40"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {lang === "hi" ? "अगली पैकिंग" : "Next Packing Task"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {next.status === "again" && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                <div className="flex items-center gap-2 text-base font-bold text-destructive">
                  <RotateCcw className="h-5 w-5" />
                  {lang === "hi" ? "फिर पैक करें" : "Please Pack Again"}
                </div>
                {next.returnReason && (
                  <div className="mt-1 text-sm">
                    {lang === "hi" ? "कारण: " : "Reason: "}
                    {t(next.returnReason)}
                  </div>
                )}
                {next.managerNote && (
                  <div className="text-sm">
                    {lang === "hi" ? "मैनेजर: " : "Manager: "}
                    {t(next.managerNote)}
                  </div>
                )}
                {next.newDue && (
                  <div className="text-sm font-semibold">
                    {lang === "hi" ? "नया समय: " : "New due time: "}
                    {next.newDue}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row">
              <ProductArt task={next} big />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-sm">{next.id}</Badge>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PACK_LABEL[next.status].cls}`}>
                    {t(PACK_LABEL[next.status].label)}
                  </span>
                  {next.urgent && (
                    <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                      {lang === "hi" ? "ज़रूरी" : "Urgent"}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold leading-tight">{t(next.product)}</div>
                <div className="text-lg font-semibold">
                  {next.qty} {t(next.unit)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {lang === "hi" ? "पैकिंग: " : "Packing: "}
                  {t(next.packing)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {next.labelRequired
                      ? lang === "hi"
                        ? "लेबल ज़रूरी"
                        : "Label required"
                      : lang === "hi"
                        ? "लेबल नहीं"
                        : "No label"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="h-4 w-4" />
                    {lang === "hi" ? "भेजना: " : "Dispatch by "}
                    {next.newDue ?? next.due}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  {lang === "hi" ? "कैसे पैक करें" : "How to pack"}
                </span>
                <AudioButton lang={lang} />
              </div>
              <ol className="space-y-1 text-sm">
                {next.instructions.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    {t(s)}
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {next.status === "started" ? (
                <Button size="lg" className="h-14 text-base" onClick={() => openComplete(next)}>
                  <PackageCheck className="mr-2 h-5 w-5" />
                  {lang === "hi" ? "पैकिंग पूरी" : "Packing Completed"}
                </Button>
              ) : (
                <Button size="lg" className="h-14 text-base" onClick={() => start(next)}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {next.status === "again"
                    ? lang === "hi"
                      ? "फिर शुरू करें"
                      : "Start Again"
                    : lang === "hi"
                      ? "पैकिंग शुरू करें"
                      : "Start Packing"}
                </Button>
              )}
              <Button
                size="lg"
                variant="secondary"
                className="h-14 text-base"
                disabled={next.status !== "started"}
                onClick={() => openComplete(next)}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {lang === "hi" ? "जांच सूची" : "Confirm & Submit"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-base"
                onClick={() => {
                  setHelpFor(next);
                  setHelpPick(null);
                }}
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                {lang === "hi" ? "मदद चाहिए" : "Need Help"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-emerald-600" />
            <div className="text-lg font-semibold">
              {lang === "hi" ? "आज की पैकिंग पूरी!" : "All packing done for today!"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's work */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {lang === "hi" ? "आज का काम" : "Today's Packing Work"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.slice(0, 5).map((x) => (
            <div
              key={x.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                x.urgent
                  ? "border-destructive/40 bg-destructive/5"
                  : x.status === "again" || x.overdue
                    ? "border-amber-500/40 bg-amber-500/5"
                    : x.status === "approved"
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "bg-card"
              }`}
            >
              <ProductArt task={x} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{x.id}</Badge>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PACK_LABEL[x.status].cls}`}>
                    {t(PACK_LABEL[x.status].label)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      x.urgent
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {x.urgent ? (lang === "hi" ? "ज़रूरी" : "Urgent") : lang === "hi" ? "सामान्य" : "Normal"}
                  </span>
                </div>
                <div className="truncate text-base font-semibold">{t(x.product)}</div>
                <div className="text-sm text-muted-foreground">
                  {x.qty} {t(x.unit)} · {lang === "hi" ? "समय " : "Due "}
                  {x.newDue ?? x.due}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Completion dialog */}
      <Dialog open={!!completeFor} onOpenChange={(o) => !o && setCompleteFor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {lang === "hi" ? "पैकिंग जांच लें" : "Check before submitting"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {PACK_CHECKS.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 rounded-xl border p-3 text-base"
              >
                <Checkbox
                  checked={!!checks[c.id]}
                  onCheckedChange={(v) => setChecks((p) => ({ ...p, [c.id]: !!v }))}
                  className="h-6 w-6"
                />
                {t(c.label)}
              </label>
            ))}
            {completeFor?.photoRequired && (
              <Button
                variant={photo ? "secondary" : "outline"}
                className="h-12 w-full"
                onClick={() => setPhoto(true)}
              >
                <Camera className="mr-2 h-5 w-5" />
                {photo
                  ? lang === "hi"
                    ? "फोटो लगी"
                    : "Photo added"
                  : lang === "hi"
                    ? "फोटो लगाएं"
                    : "Add completion photo"}
              </Button>
            )}
            <Button
              size="lg"
              className="h-14 w-full text-base"
              disabled={!allChecked || !photoOk}
              onClick={submit}
            >
              {lang === "hi" ? "जमा करें" : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help dialog */}
      <Dialog open={!!helpFor} onOpenChange={(o) => !o && setHelpFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === "hi" ? "क्या दिक्कत है?" : "What is the problem?"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {PACK_HELP.map((h) => (
              <button
                key={h.id}
                onClick={() => setHelpPick(h.id)}
                className={`rounded-xl border p-3 text-left text-sm font-medium ${
                  helpPick === h.id ? "border-primary bg-primary/10" : ""
                }`}
              >
                {t(h.label)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-12" onClick={() => toast.info(lang === "hi" ? "मैनेजर को कॉल (बाद में)" : "Call manager (coming soon)")}>
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="h-12" onClick={() => toast.info(lang === "hi" ? "फोटो (बाद में)" : "Send photo (coming soon)")}>
              <Camera className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="h-12" onClick={() => toast.info(lang === "hi" ? "वॉइस नोट (बाद में)" : "Voice note (coming soon)")}>
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          <Button
            size="lg"
            className="h-14 w-full text-base"
            disabled={!helpPick}
            onClick={() => {
              setHelpFor(null);
              toast.success(lang === "hi" ? "मैनेजर को बता दिया गया।" : "Manager has been informed.");
            }}
          >
            {lang === "hi" ? "मदद भेजें" : "Send Help Request"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
