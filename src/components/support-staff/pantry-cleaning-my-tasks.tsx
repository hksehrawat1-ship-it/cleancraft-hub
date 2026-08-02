import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  ListChecks,
  MapPinOff,
  Mic,
  PackageX,
  Phone,
  PlayCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  L,
  URG_LABEL,
  URG_RING,
  URG_TONE,
  isFinished,
  isOpen,
  sortTasks,
  type Bi,
  type Lang,
  type Task,
} from "./pantry-cleaning-data";
import { AudioButton, KindBadge, LangSwitch, StatusBadge } from "./pantry-cleaning-ui";

type Tab = "today" | "pending" | "completed" | "redo";

const HELP_OPTIONS: { key: string; label: Bi; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "supply", label: { en: "Missing Supply", hi: "सामान नहीं है" }, icon: PackageX },
  {
    key: "unclear",
    label: { en: "Instructions Not Clear", hi: "निर्देश समझ नहीं आया" },
    icon: HelpCircle,
  },
  {
    key: "location",
    label: { en: "Cannot Reach Location", hi: "जगह तक नहीं पहुँच सकते" },
    icon: MapPinOff,
  },
  {
    key: "cannot",
    label: { en: "Work Cannot Be Completed", hi: "काम पूरा नहीं हो सकता" },
    icon: XCircle,
  },
];

export function PantryCleaningMyTasks({
  tasks,
  lang,
  setLang,
  onStart,
  onSubmitWork,
  onHelp,
}: {
  tasks: Task[];
  lang: Lang;
  setLang: (l: Lang) => void;
  onStart: (id: string) => boolean;
  onSubmitWork: (id: string) => void;
  onHelp: (id: string, reason: string) => void;
}) {
  const t = (v: Bi) => v[lang];
  const [tab, setTab] = useState<Tab>("today");
  const [openId, setOpenId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [completeMode, setCompleteMode] = useState(false);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [voiceAdded, setVoiceAdded] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpReason, setHelpReason] = useState<string | null>(null);
  const [helpNote, setHelpNote] = useState("");

  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const open = openId ? (tasks.find((x) => x.id === openId) ?? null) : null;
  const remaining = tasks.filter((x) => isOpen(x.status)).length;
  const completed = tasks.filter((x) => isFinished(x.status)).length;

  const lists: Record<Tab, Task[]> = {
    today: sorted,
    pending: sorted.filter((x) => x.status === "new" || x.status === "started"),
    completed: sorted.filter((x) => isFinished(x.status)),
    redo: sorted.filter((x) => x.status === "redo"),
  };

  const TABS: { key: Tab; label: Bi; count: number }[] = [
    { key: "today", label: L.today, count: sorted.length },
    { key: "pending", label: L.pending, count: lists.pending.length },
    { key: "completed", label: { en: "Completed", hi: "पूरे" }, count: lists.completed.length },
    { key: "redo", label: { en: "Do Again", hi: "दोबारा" }, count: lists.redo.length },
  ];

  const openTask = (task: Task) => {
    setOpenId(task.id);
    setCompleteMode(false);
    setPhotoAdded(false);
    setVoiceAdded(false);
    setChecked({});
  };

  const closeTask = () => {
    setOpenId(null);
    setCompleteMode(false);
  };

  const handleStart = (task: Task) => {
    if (onStart(task.id)) {
      toast.success(lang === "hi" ? "काम शुरू हो गया" : "Work started");
    } else {
      toast.error(t(L.oneAtATime));
    }
  };

  const submit = (task: Task) => {
    const allChecked = task.checklist.every((_, i) => checked[`${task.id}-${i}`]);
    if (!allChecked) {
      toast.error(lang === "hi" ? "पूरी जाँच सूची टिक करें" : "Please tick the full checklist");
      return;
    }
    if (task.photoRequired && !photoAdded) {
      toast.error(lang === "hi" ? "पहले फोटो लगाएं" : "Please add the completion photo");
      return;
    }
    onSubmitWork(task.id);
    toast.success(t(L.submitted));
    closeTask();
  };

  const sendHelp = (task: Task) => {
    if (!helpReason) {
      toast.error(lang === "hi" ? "एक विकल्प चुनें" : "Please choose one option");
      return;
    }
    onHelp(task.id, helpReason);
    toast.success(lang === "hi" ? "मैनेजर को संदेश गया" : "Message sent to your manager");
    setHelpOpen(false);
    setHelpReason(null);
    setHelpNote("");
  };

  const soon = (lang: Lang) => (lang === "hi" ? "जल्द आएगा" : "Coming soon");

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="space-y-3 rounded-xl border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ListChecks className="h-7 w-7 text-primary" />
            {t(L.tasks)}
          </h1>
          <LangSwitch lang={lang} setLang={setLang} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-blue-500/40 bg-blue-500/5 p-3">
            <div className="text-3xl font-bold tabular-nums text-blue-600">{remaining}</div>
            <div className="text-sm text-muted-foreground">{t(L.remaining)}</div>
          </div>
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-3">
            <div className="text-3xl font-bold tabular-nums text-emerald-600">{completed}</div>
            <div className="text-sm text-muted-foreground">{t(L.completed)}</div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TABS.map((x) => (
          <button
            key={x.key}
            onClick={() => setTab(x.key)}
            className={`rounded-2xl border-2 p-4 text-center transition-colors ${
              tab === x.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            <div className="text-3xl font-bold tabular-nums">{x.count}</div>
            <div className="text-sm font-semibold">{t(x.label)}</div>
          </button>
        ))}
      </div>

      {/* task cards */}
      <div className="space-y-3">
        {lists[tab].length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-lg text-muted-foreground">
              {t(L.noTasks)}
            </CardContent>
          </Card>
        )}
        {lists[tab].map((task) => (
          <Card key={task.id} className={`border-2 ${URG_RING[task.urgency]}`}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${
                    isFinished(task.status)
                      ? "bg-emerald-500/10 text-emerald-600"
                      : task.status === "started"
                        ? "bg-blue-500/10 text-blue-600"
                        : URG_TONE[task.urgency]
                  }`}
                >
                  <task.icon className="h-10 w-10" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <KindBadge kind={task.kind} lang={lang} />
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        task.priority === "urgent"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {task.priority === "urgent" ? t(L.urgent) : t(L.normal)}
                    </span>
                    {task.urgency === "overdue" && isOpen(task.status) && (
                      <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">
                        {t(L.overdue)}
                      </span>
                    )}
                    {task.urgency === "soon" && isOpen(task.status) && (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700">
                        {t(L.dueSoon)}
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-bold leading-tight">{t(task.title)}</div>
                  <p className="text-sm text-muted-foreground">{t(task.location)}</p>
                  <p className="text-sm font-semibold">
                    {t(L.due)}: {task.newDue ?? task.due}
                  </p>
                  <StatusBadge s={task.status} lang={lang} />
                </div>
              </div>

              {task.status === "redo" && task.correction && (
                <div className="rounded-xl border-2 border-destructive/60 bg-destructive/10 p-3">
                  <div className="flex items-center gap-2 font-bold text-destructive">
                    <RotateCcw className="h-5 w-5" /> {t(L.doAgain)}
                  </div>
                  <p className="mt-1 text-sm">{t(task.correction)}</p>
                </div>
              )}

              <Button size="lg" className="h-14 w-full text-base" onClick={() => openTask(task)}>
                {t(L.viewTask)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* task detail */}
      <Dialog open={!!open} onOpenChange={(o) => !o && closeTask()}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{t(open.title)}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl ${
                      isFinished(open.status)
                        ? "bg-emerald-500/10 text-emerald-600"
                        : URG_TONE[open.urgency]
                    }`}
                  >
                    <open.icon className="h-14 w-14" />
                  </div>
                  <div className="space-y-1.5">
                    <KindBadge kind={open.kind} lang={lang} />
                    <p className="text-base text-muted-foreground">{t(open.location)}</p>
                    <p className="text-base font-semibold">
                      {t(L.due)}: {open.newDue ?? open.due}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge s={open.status} lang={lang} />
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                        {t(URG_LABEL[open.urgency])}
                      </span>
                    </div>
                    {open.startedAt && (
                      <p className="text-xs text-muted-foreground">
                        {t(L.startedAt)} {open.startedAt}
                      </p>
                    )}
                  </div>
                </div>

                {open.status === "redo" && open.correction && (
                  <div className="space-y-2 rounded-xl border-2 border-destructive/60 bg-destructive/10 p-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-destructive">
                      <RotateCcw className="h-6 w-6" /> {t(L.doAgain)}
                    </div>
                    <p className="text-base">{t(open.correction)}</p>
                    {open.newDue && (
                      <p className="text-sm font-semibold">
                        {t(L.newTime)}: {open.newDue}
                      </p>
                    )}
                    {open.correctionPhoto && (
                      <img
                        src={open.correctionPhoto}
                        alt={t(L.managerNote)}
                        loading="lazy"
                        className="h-40 w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-xl bg-muted p-4">
                  <AudioButton lang={lang} />
                  <p className="text-base">{t(open.instructions)}</p>
                </div>

                {open.refPhoto && (
                  <img
                    src={open.refPhoto}
                    alt={t(open.title)}
                    loading="lazy"
                    className="h-44 w-full rounded-xl object-cover"
                  />
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    {t(L.checklist)}
                  </div>
                  {open.checklist.map((c, i) => {
                    const key = `${open.id}-${i}`;
                    const editable = isOpen(open.status);
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3 ${
                          checked[key] ? "border-emerald-500/50 bg-emerald-500/5" : "border-border"
                        }`}
                      >
                        <Checkbox
                          checked={!!checked[key]}
                          disabled={!editable}
                          onCheckedChange={(v) =>
                            setChecked((p) => ({ ...p, [key]: !!v }))
                          }
                          className="h-6 w-6"
                        />
                        <span className="text-base">{t(c)}</span>
                      </label>
                    );
                  })}
                </div>

                {!completeMode && isOpen(open.status) && (
                  <div className="grid gap-3">
                    <Button
                      size="lg"
                      className="h-16 text-lg"
                      disabled={open.status === "started"}
                      onClick={() => handleStart(open)}
                    >
                      <PlayCircle className="mr-2 h-7 w-7" />
                      {open.status === "redo" ? t(L.startAgain) : t(L.start)}
                    </Button>
                    <Button
                      size="lg"
                      className="h-16 bg-emerald-600 text-lg text-white hover:bg-emerald-700"
                      onClick={() => setCompleteMode(true)}
                    >
                      <CheckCircle2 className="mr-2 h-7 w-7" />
                      {t(L.done)}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-16 text-lg"
                      onClick={() => setHelpOpen(true)}
                    >
                      <HelpCircle className="mr-2 h-7 w-7" />
                      {t(L.needHelp)}
                    </Button>
                  </div>
                )}

                {completeMode && (
                  <div className="space-y-3 rounded-xl border-2 border-emerald-500/40 p-4">
                    {open.photoRequired && (
                      <Button
                        variant={photoAdded ? "secondary" : "outline"}
                        size="lg"
                        className="h-16 w-full text-base"
                        onClick={() => {
                          setPhotoAdded(true);
                          toast.success(t(L.photoAdded));
                        }}
                      >
                        <Camera className="mr-2 h-6 w-6" />
                        {photoAdded ? t(L.photoAdded) : t(L.photo)}
                      </Button>
                    )}
                    <Button
                      variant={voiceAdded ? "secondary" : "outline"}
                      size="lg"
                      className="h-16 w-full text-base"
                      onClick={() => {
                        setVoiceAdded(true);
                        toast.info(soon(lang));
                      }}
                    >
                      <Mic className="mr-2 h-6 w-6" /> {t(L.voice)}
                    </Button>
                    <Button size="lg" className="h-16 w-full text-lg" onClick={() => submit(open)}>
                      {t(L.submit)}
                    </Button>
                  </div>
                )}

                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">{t(L.history)}</summary>
                  <ul className="mt-2 space-y-1">
                    {open.history.map((h, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        {h.at} — {t(h.text)}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* need help */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{t(L.needHelp)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {HELP_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setHelpReason(o.key)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-base font-semibold ${
                  helpReason === o.key ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                <o.icon className="h-7 w-7 text-primary" />
                {t(o.label)}
              </button>
            ))}
            <Textarea
              value={helpNote}
              onChange={(e) => setHelpNote(e.target.value)}
              placeholder={lang === "hi" ? "छोटा नोट (वैकल्पिक)" : "Short note (optional)"}
              className="min-h-20 text-base"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Button variant="outline" className="h-14" onClick={() => toast.info(soon(lang))}>
                <Phone className="mr-2 h-5 w-5" /> {t(L.callManager)}
              </Button>
              <Button variant="outline" className="h-14" onClick={() => toast.info(soon(lang))}>
                <Camera className="mr-2 h-5 w-5" /> {t(L.sendPhoto)}
              </Button>
              <Button variant="outline" className="h-14" onClick={() => toast.info(soon(lang))}>
                <Mic className="mr-2 h-5 w-5" /> {t(L.voice)}
              </Button>
            </div>
            <Button
              size="lg"
              className="h-16 w-full text-lg"
              onClick={() => open && sendHelp(open)}
            >
              <AlertTriangle className="mr-2 h-6 w-6" /> {t(L.submit)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
