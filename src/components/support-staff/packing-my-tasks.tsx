import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Camera,
  CheckCircle2,
  Clock,
  HelpCircle,
  ImageIcon,
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
  PACK_TASKS,
  nowLabel,
  packOpen,
  sortPack,
  type PackTask,
} from "./packing-data";

type Tab = "today" | "pending" | "completed" | "again";

const TABS: { key: Tab; en: string; hi: string }[] = [
  { key: "today", en: "Today", hi: "आज" },
  { key: "pending", en: "Pending", hi: "बाकी" },
  { key: "completed", en: "Completed", hi: "पूरा" },
  { key: "again", en: "Pack Again", hi: "फिर पैक" },
];

function Art({ task, big }: { task: PackTask; big?: boolean }) {
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
        big ? "h-36 w-full sm:h-40" : "h-20 w-20"
      }`}
      aria-hidden
    >
      <Package className={big ? "h-20 w-20" : "h-10 w-10"} />
    </div>
  );
}

export function PackingMyTasks({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t = tr(lang);
  const [tasks, setTasks] = useState<PackTask[]>(PACK_TASKS);
  const [tab, setTab] = useState<Tab>("today");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [photo, setPhoto] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpPick, setHelpPick] = useState<string | null>(null);

  const sorted = useMemo(() => sortPack(tasks), [tasks]);
  const open = tasks.find((x) => x.id === openId) ?? null;
  const remaining = tasks.filter((x) => packOpen(x.status)).length;
  const completed = tasks.filter((x) => !packOpen(x.status)).length;
  const activeTask = tasks.find((x) => x.status === "started") ?? null;

  const list = sorted.filter((x) => {
    if (tab === "today") return true;
    if (tab === "pending") return x.status === "new" || x.status === "started";
    if (tab === "completed")
      return x.status === "completed" || x.status === "review" || x.status === "approved";
    return x.status === "again";
  });

  const start = (task: PackTask) => {
    if (activeTask && activeTask.id !== task.id) {
      toast.error(
        lang === "hi"
          ? `पहले ${activeTask.id} पूरा करें। एक समय पर एक ही काम।`
          : `Finish ${activeTask.id} first. Only one packing task at a time.`,
      );
      return;
    }
    const at = nowLabel();
    setTasks((p) =>
      p.map((x) =>
        x.id === task.id ? { ...x, status: "started", startedAt: at } : x,
      ),
    );
    toast.success(lang === "hi" ? `पैकिंग शुरू ${at}` : `Packing started at ${at}`);
  };

  const submit = () => {
    if (!open) return;
    const at = nowLabel();
    setTasks((p) =>
      p.map((x) =>
        x.id === open.id
          ? {
              ...x,
              status: "review",
              completedAt: at,
              overdue: false,
              returnReason: undefined,
              managerNote: undefined,
              newDue: undefined,
            }
          : x,
      ),
    );
    setConfirmOpen(false);
    setChecks({});
    setPhoto(false);
    setOpenId(null);
    toast.success(
      lang === "hi"
        ? "पैकिंग जमा हो गई। मैनेजर जांच करेंगे।"
        : "Packing submitted. Sent to manager for review.",
    );
  };

  const allChecked = PACK_CHECKS.every((c) => checks[c.id]);
  const photoOk = !open?.photoRequired || photo;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold">{lang === "hi" ? "मेरे काम" : "My Tasks"}</div>
            <div className="text-sm text-muted-foreground">
              {lang === "hi" ? "बाकी " : "Remaining "}
              <span className="font-bold text-blue-700">{remaining}</span>
              {" · "}
              {lang === "hi" ? "पूरा " : "Completed "}
              <span className="font-bold text-emerald-700">{completed}</span>
            </div>
          </div>
          <LangSwitch lang={lang} setLang={setLang} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TABS.map((x) => (
          <button
            key={x.key}
            onClick={() => setTab(x.key)}
            className={`rounded-xl border p-3 text-sm font-semibold transition-colors ${
              tab === x.key ? "border-primary bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            {lang === "hi" ? x.hi : x.en}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((x) => (
          <Card
            key={x.id}
            className={
              x.urgent
                ? "border-destructive/40"
                : x.status === "again" || x.overdue
                  ? "border-amber-500/40"
                  : x.status === "approved"
                    ? "border-emerald-500/40"
                    : x.status === "started"
                      ? "border-blue-500/40"
                      : ""
            }
          >
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <Art task={x} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{x.id}</Badge>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PACK_LABEL[x.status].cls}`}>
                    {t(PACK_LABEL[x.status].label)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      x.urgent ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {x.urgent ? (lang === "hi" ? "ज़रूरी" : "Urgent") : lang === "hi" ? "सामान्य" : "Normal"}
                  </span>
                </div>
                <div className="text-lg font-bold leading-tight">{t(x.product)}</div>
                <div className="text-base font-semibold">
                  {x.qty} {t(x.unit)}
                </div>
                <div className="text-sm text-muted-foreground">{t(x.packing)}</div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Clock className="h-4 w-4" />
                  {x.newDue ?? x.due}
                </div>
              </div>
              <Button size="lg" className="h-12 w-full sm:w-auto" onClick={() => setOpenId(x.id)}>
                {lang === "hi" ? "काम देखें" : "View Task"}
              </Button>
            </CardContent>
          </Card>
        ))}
        {!list.length && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {lang === "hi" ? "यहाँ कोई काम नहीं है।" : "No tasks here."}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task details */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto">
          {open && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="text-xl">{t(open.product)}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pb-4">
                <Art task={open} big />

                {open.status === "again" && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                    <div className="flex items-center gap-2 text-base font-bold text-destructive">
                      <RotateCcw className="h-5 w-5" />
                      {lang === "hi" ? "फिर पैक करें" : "Please Pack Again"}
                    </div>
                    {open.returnReason && (
                      <div className="mt-1 text-sm">
                        {lang === "hi" ? "कारण: " : "Reason: "}
                        {t(open.returnReason)}
                      </div>
                    )}
                    {open.managerNote && (
                      <div className="text-sm">
                        {lang === "hi" ? "मैनेजर: " : "Manager: "}
                        {t(open.managerNote)}
                      </div>
                    )}
                    <div className="mt-2 flex h-20 items-center justify-center gap-2 rounded-lg bg-muted text-xs text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                      {lang === "hi" ? "मैनेजर की फोटो" : "Manager reference photo"}
                    </div>
                    {open.newDue && (
                      <div className="mt-2 text-sm font-semibold">
                        {lang === "hi" ? "नया समय: " : "New due time: "}
                        {open.newDue}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">{lang === "hi" ? "ऑर्डर नंबर" : "Order number"}</div>
                    <div className="font-semibold">{open.id}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">{lang === "hi" ? "मात्रा" : "Quantity to pack"}</div>
                    <div className="font-semibold">
                      {open.qty} {t(open.unit)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">{lang === "hi" ? "पैकिंग सामान" : "Packing material"}</div>
                    <div className="font-semibold">{t(open.packing)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">{lang === "hi" ? "लेबल" : "Label"}</div>
                    <div className="flex items-center gap-1 font-semibold">
                      <Tag className="h-4 w-4" />
                      {open.labelRequired
                        ? lang === "hi"
                          ? "लेबल लगाना ज़रूरी"
                          : "Label required"
                        : lang === "hi"
                          ? "लेबल नहीं चाहिए"
                          : "No label needed"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 sm:col-span-2">
                    <div className="text-xs text-muted-foreground">{lang === "hi" ? "भेजने का समय" : "Dispatch deadline"}</div>
                    <div className="font-semibold">{open.newDue ?? open.due}</div>
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
                    {open.instructions.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-bold text-primary">{i + 1}.</span>
                        {t(s)}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex h-24 items-center justify-center gap-2 rounded-lg bg-background text-xs text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                    {lang === "hi" ? "सही पैकिंग की फोटो" : "Reference photo of correct packing"}
                  </div>
                </div>

                {open.startedAt && (
                  <div className="text-xs text-muted-foreground">
                    {lang === "hi" ? "शुरू: " : "Started: "}
                    {open.startedAt}
                    {open.completedAt
                      ? ` · ${lang === "hi" ? "पूरा: " : "Completed: "}${open.completedAt}`
                      : ""}
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button
                    size="lg"
                    className="h-14 text-base"
                    disabled={open.status !== "new" && open.status !== "again"}
                    onClick={() => start(open)}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {open.status === "again"
                      ? lang === "hi"
                        ? "फिर शुरू करें"
                        : "Start Again"
                      : lang === "hi"
                        ? "पैकिंग शुरू करें"
                        : "Start Packing"}
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 text-base"
                    disabled={open.status !== "started"}
                    onClick={() => {
                      setChecks({});
                      setPhoto(false);
                      setConfirmOpen(true);
                    }}
                  >
                    <PackageCheck className="mr-2 h-5 w-5" />
                    {lang === "hi" ? "पैकिंग पूरी" : "Packing Completed"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 text-base"
                    onClick={() => {
                      setHelpPick(null);
                      setHelpOpen(true);
                    }}
                  >
                    <HelpCircle className="mr-2 h-5 w-5" />
                    {lang === "hi" ? "मदद चाहिए" : "Need Help"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Checklist */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{lang === "hi" ? "पैकिंग जांच लें" : "Packing checklist"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {PACK_CHECKS.map((c) => (
              <label key={c.id} className="flex items-center gap-3 rounded-xl border p-3 text-base">
                <Checkbox
                  checked={!!checks[c.id]}
                  onCheckedChange={(v) => setChecks((p) => ({ ...p, [c.id]: !!v }))}
                  className="h-6 w-6"
                />
                {t(c.label)}
              </label>
            ))}
            {open?.photoRequired && (
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
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {lang === "hi" ? "जमा करें" : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
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
              setHelpOpen(false);
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
