import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, Send, Upload } from "lucide-react";
import { SectionHead } from "./ui";
import {
  EDITOR_NAME,
  PRIORITY_TONE,
  STATUS_TONE,
  VE_RECORDS,
  currentVersion,
  requirementsFor,
  type VeRecord,
} from "./dashboard-data";

type SubmissionStatus =
  | "Draft"
  | "Uploading"
  | "Ready to Submit"
  | "Submitted for Review"
  | "Correction Required"
  | "Resubmitted"
  | "Approved";

const CHECKS = [
  "Correct video selected",
  "Editing brief followed",
  "Correct duration",
  "Correct aspect ratio",
  "Logo placed correctly",
  "Subtitles checked",
  "Spelling checked",
  "Audio checked",
  "Music usage approved",
  "Call-to-action included",
  "Export quality checked",
  "No unwanted footage remains",
];

const STEPS = [
  "Select Video",
  "Upload Edited Video",
  "Quality Check",
  "Editor Notes",
  "Review & Submit",
];

const ASPECTS = ["9:16", "1:1", "4:5", "16:9"];

type Files = {
  video: string;
  thumbnail: string;
  subtitle: string;
  projectLink: string;
  supporting: string;
  duration: string;
  resolution: string;
  aspect: string;
};

const EMPTY_FILES: Files = {
  video: "",
  thumbnail: "",
  subtitle: "",
  projectLink: "",
  supporting: "",
  duration: "",
  resolution: "",
  aspect: "",
};

type Notes = {
  work: string;
  decisions: string;
  attention: string;
  missing: string;
  timestamps: string;
  message: string;
};

const EMPTY_NOTES: Notes = { work: "", decisions: "", attention: "", missing: "", timestamps: "", message: "" };

export function VeSubmitPage() {
  const [records, setRecords] = useState<VeRecord[]>(VE_RECORDS);
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [files, setFiles] = useState<Files>(EMPTY_FILES);
  const [checks, setChecks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Notes>(EMPTY_NOTES);
  const [ackCorrections, setAckCorrections] = useState(false);
  const [subStatus, setSubStatus] = useState<SubmissionStatus>("Draft");
  const [done, setDone] = useState<{ contentId: string; version: string; at: string } | null>(null);

  const selectable = records.filter((r) =>
    ["Editing", "Ready for Review", "Correction Required"].includes(r.status),
  );
  const selected = records.find((r) => r.contentId === selectedId) ?? null;
  const nextVersion = selected ? `v${selected.versions.length + 1}` : "—";
  const req = selected ? requirementsFor(selected) : null;

  const header = [
    { l: "Drafts Ready", v: records.filter((r) => r.status === "Ready for Review").length, tone: "text-blue-600" },
    { l: "Submitted Today", v: records.filter((r) => r.versions.some((v) => v.submittedOn.startsWith("Today"))).length, tone: "text-foreground" },
    {
      l: "Waiting for Review",
      v: records.filter((r) => r.status === "Submitted for Review" || r.status === "Resubmitted").length,
      tone: "text-amber-600",
    },
  ];

  const openCorrections = selected?.corrections.filter((c) => !c.resolved) ?? [];

  const alerts = useMemo(() => {
    if (!selected || !req) return [] as string[];
    const a: string[] = [];
    if (selected.overdue) a.push(`Deadline has passed — ${selected.deadline}`);
    if (step >= 1) {
      if (!files.video) a.push("Required file missing — edited video not attached");
      if (!files.thumbnail) a.push("Thumbnail not attached");
      if (files.duration && files.duration.trim() !== selected.durationRequired)
        a.push(`Video duration looks incorrect — brief requires ${selected.durationRequired}`);
      if (files.aspect && files.aspect !== req.aspectRatio)
        a.push(`Aspect ratio ${files.aspect} does not match ${selected.platform} (${req.aspectRatio})`);
      if (files.video && selected.versions.some((v) => v.version === files.video.match(/_(v\d+)/)?.[1]))
        a.push("Upload appears to duplicate an existing version");
    }
    if (step >= 2 && checks.length < CHECKS.length) a.push("Mandatory checklist is incomplete");
    if (openCorrections.length > 0 && !ackCorrections)
      a.push("Previous correction points have not been acknowledged");
    return a;
  }, [selected, req, step, files, checks, openCorrections.length, ackCorrections]);

  const reset = () => {
    setStep(0);
    setSelectedId(null);
    setFiles(EMPTY_FILES);
    setChecks([]);
    setNotes(EMPTY_NOTES);
    setAckCorrections(false);
    setSubStatus("Draft");
  };

  const canContinue = () => {
    if (step === 0) return !!selected;
    if (step === 1) return !!files.video && !!files.duration && !!files.resolution && !!files.aspect;
    if (step === 2) return checks.length === CHECKS.length && (openCorrections.length === 0 || ackCorrections);
    return true;
  };

  const submit = () => {
    if (!selected) return;
    if (checks.length < CHECKS.length) {
      toast.error("Complete every mandatory quality check before submitting.");
      return;
    }
    if (openCorrections.length > 0 && !ackCorrections) {
      toast.error("Acknowledge the open correction points first.");
      return;
    }
    const at = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    setRecords((prev) =>
      prev.map((r) =>
        r.contentId === selected.contentId
          ? {
              ...r,
              status: r.versions.length > 0 ? "Resubmitted" : "Submitted for Review",
              corrections: r.corrections.map((c) => ({ ...c, resolved: true })),
              versions: [
                ...r.versions,
                {
                  version: nextVersion,
                  submittedOn: `Today, ${at.split(", ").pop()}`,
                  status: "Waiting for Review" as const,
                  reviewer: "Priya Nair",
                  comments: notes.message || "—",
                },
              ],
            }
          : r,
      ),
    );
    setSubStatus(selected.versions.length > 0 ? "Resubmitted" : "Submitted for Review");
    setDone({ contentId: selected.contentId, version: nextVersion, at });
    toast.success("Video submitted successfully for review.", {
      description: `${selected.contentId} ${nextVersion} · ${at} · ${EDITOR_NAME} — Social Media Account Manager notified.`,
    });
  };

  if (done) {
    return (
      <div className="space-y-4">
        <SectionHead title="Submit for Review" sub="Submission recorded against the existing content record." />
        <Card className="border-emerald-500/40">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <div className="text-lg font-semibold">Video submitted successfully for review.</div>
            <p className="text-sm text-muted-foreground">
              {done.contentId} · {done.version} · Submitted {done.at} by {EDITOR_NAME}
            </p>
            <Badge variant="outline" className="bg-blue-500/15 text-blue-600 border-blue-500/30">
              {subStatus}
            </Badge>
            <p className="text-xs text-muted-foreground">
              This version is now read-only. If corrections are requested, a new version will be created under the same
              Content ID.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button
                onClick={() => {
                  setDone(null);
                  reset();
                }}
              >
                Submit another video
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHead title="Submit for Review" sub="Five guided steps — one version added to the same content record." />

      <div className="grid grid-cols-3 gap-3">
        {header.map((h) => (
          <Card key={h.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{h.l}</div>
              <div className={`text-2xl font-bold tabular-nums mt-1 ${h.tone}`}>{h.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold">
                Step {step + 1} of 5 — {STEPS[step]}
              </div>
              <div className="text-xs text-muted-foreground">
                {selected ? `${selected.contentId} · next version ${nextVersion}` : "No video selected yet"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{subStatus}</Badge>
              {step > 0 && (
                <Button size="sm" variant="ghost" onClick={reset}>
                  Start over
                </Button>
              )}
              {step === 0 && (
                <Button size="sm" disabled={!selected} onClick={() => setStep(1)}>
                  Select Video
                </Button>
              )}
            </div>
          </div>
          <Progress value={((step + 1) / 5) * 100} className="h-2" />
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Check before you submit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {alerts.map((a) => (
              <div
                key={a}
                className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700"
              >
                {a}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 1 */}
      {step === 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {selectable.map((r) => (
            <button
              key={r.contentId}
              type="button"
              onClick={() => setSelectedId(r.contentId)}
              className={`text-left rounded-lg border p-3 space-y-2 transition-colors ${
                selectedId === r.contentId ? "border-primary bg-primary/5" : "hover:bg-muted/40"
              }`}
            >
              <div className="h-24 rounded-md bg-muted flex items-center justify-center text-4xl">{r.thumbnail}</div>
              <div className="text-sm font-semibold leading-tight line-clamp-2">{r.title}</div>
              <div className="text-[11px] text-muted-foreground">
                {r.contentId} · {r.contentType} · {r.platform}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className={STATUS_TONE[r.status]}>
                  {r.status}
                </Badge>
                <Badge variant="outline" className={PRIORITY_TONE[r.priority]}>
                  {r.priority}
                </Badge>
                <Badge
                  variant="outline"
                  className={r.overdue ? "bg-destructive/15 text-destructive border-destructive/30" : ""}
                >
                  <Clock className="h-3 w-3 mr-1" /> {r.deadline}
                </Badge>
                <Badge variant="outline">Current {currentVersion(r)}</Badge>
              </div>
            </button>
          ))}
          {selectable.length === 0 && (
            <p className="text-sm text-muted-foreground">No videos are in Editing, Ready for Review or Correction Required.</p>
          )}
        </div>
      )}

      {/* Step 2 */}
      {step === 1 && selected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload edited video — {nextVersion}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Version {nextVersion} is created under {selected.contentId}. No new content record is made.
            </p>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <UploadField
              label="Edited video"
              value={files.video}
              onPick={() =>
                setFiles((f) => ({ ...f, video: `${selected.contentId}_${nextVersion}_final.mp4` }))
              }
            />
            <UploadField
              label="Thumbnail"
              value={files.thumbnail}
              onPick={() => setFiles((f) => ({ ...f, thumbnail: `${selected.contentId}_thumb.jpg` }))}
            />
            <UploadField
              label="Subtitle file"
              value={files.subtitle}
              onPick={() => setFiles((f) => ({ ...f, subtitle: `${selected.contentId}_subs.srt` }))}
            />
            <UploadField
              label="Supporting files"
              value={files.supporting}
              onPick={() => setFiles((f) => ({ ...f, supporting: `${selected.contentId}_supporting.zip` }))}
            />
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Project file link</Label>
              <Input
                value={files.projectLink}
                onChange={(e) => setFiles((f) => ({ ...f, projectLink: e.target.value }))}
                placeholder="drive.link/project-file"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Video duration (required: {selected.durationRequired})</Label>
              <Input
                value={files.duration}
                onChange={(e) => setFiles((f) => ({ ...f, duration: e.target.value }))}
                placeholder={selected.durationRequired}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Export resolution (expected: {req?.resolution})</Label>
              <Input
                value={files.resolution}
                onChange={(e) => setFiles((f) => ({ ...f, resolution: e.target.value }))}
                placeholder={req?.resolution}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Aspect ratio (expected: {req?.aspectRatio})</Label>
              <Select value={files.aspect} onValueChange={(v) => setFiles((f) => ({ ...f, aspect: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {ASPECTS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 2 && selected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quality check</CardTitle>
            <p className="text-xs text-muted-foreground">
              All {CHECKS.length} checks are mandatory. {checks.length}/{CHECKS.length} confirmed.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              {CHECKS.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted/40"
                >
                  <Checkbox
                    checked={checks.includes(c)}
                    onCheckedChange={(v) =>
                      setChecks((prev) => (v ? [...prev, c] : prev.filter((x) => x !== c)))
                    }
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => setChecks(CHECKS)}>
              Confirm all checks
            </Button>
            {openCorrections.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                <div className="text-sm font-medium text-amber-700">Open correction points</div>
                <ul className="text-sm list-disc pl-4">
                  {openCorrections.flatMap((c) => c.points).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={ackCorrections} onCheckedChange={(v) => setAckCorrections(!!v)} />
                  <span>I have addressed and acknowledged every correction point.</span>
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4 */}
      {step === 3 && selected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Editor notes</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <NoteField label="Work completed" value={notes.work} onChange={(v) => setNotes((n) => ({ ...n, work: v }))} />
            <NoteField
              label="Important editing decisions"
              value={notes.decisions}
              onChange={(v) => setNotes((n) => ({ ...n, decisions: v }))}
            />
            <NoteField
              label="Items requiring reviewer attention"
              value={notes.attention}
              onChange={(v) => setNotes((n) => ({ ...n, attention: v }))}
            />
            <NoteField
              label="Missing assets or information"
              value={notes.missing}
              onChange={(v) => setNotes((n) => ({ ...n, missing: v }))}
            />
            <NoteField
              label="Timestamp notes"
              value={notes.timestamps}
              onChange={(v) => setNotes((n) => ({ ...n, timestamps: v }))}
              placeholder="00:07 hook change · 00:22 offer card"
            />
            <NoteField
              label="Short message to reviewer"
              value={notes.message}
              onChange={(v) => setNotes((n) => ({ ...n, message: v }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 5 */}
      {step === 4 && selected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Review & submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <Row l="Video" v={selected.title} />
              <Row l="Content ID" v={selected.contentId} />
              <Row l="Version" v={nextVersion} />
              <Row l="Target platform" v={selected.platform} />
              <Row l="Deadline" v={`${selected.deadline} · ${selected.deadlineNote}`} />
              <Row l="Editor" v={EDITOR_NAME} />
            </div>
            <Separator />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Uploaded files</div>
              <ul className="text-sm space-y-0.5">
                {[
                  ["Edited video", files.video],
                  ["Thumbnail", files.thumbnail],
                  ["Subtitles", files.subtitle],
                  ["Supporting files", files.supporting],
                  ["Project link", files.projectLink],
                  ["Duration", files.duration],
                  ["Resolution", files.resolution],
                  ["Aspect ratio", files.aspect],
                ].map(([l, v]) => (
                  <li key={l} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{l}</span>
                    <span className={v ? "font-medium truncate" : "text-destructive text-xs"}>{v || "Missing"}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                Quality checklist ({checks.length}/{CHECKS.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CHECKS.map((c) => (
                  <span
                    key={c}
                    className={`text-[11px] rounded px-1.5 py-0.5 border ${
                      checks.includes(c)
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Editor notes</div>
              <ul className="text-sm space-y-0.5">
                {Object.entries(notes).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-muted-foreground capitalize">{k}: </span>
                    {v || "—"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSubStatus("Draft");
                  toast.success(`Draft saved for ${selected.contentId} ${nextVersion}`);
                }}
              >
                Save Draft
              </Button>
              <Button onClick={submit}>
                <Send className="h-4 w-4 mr-2" /> Submit for Review
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Submission records date, time, editor and version, notifies the Social Media Account Manager, and keeps
              earlier versions and reviewer comments intact. Approval, scheduling, publishing and deletion stay with the
              Social Media Account Manager.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step nav */}
      {step > 0 && (
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Back
          </Button>
          {step < 4 && (
            <Button
              disabled={!canContinue()}
              onClick={() => {
                if (step === 1) setSubStatus("Uploading");
                if (step === 2) setSubStatus("Ready to Submit");
                setStep((s) => s + 1);
              }}
            >
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function UploadField({ label, value, onPick }: { label: string; value: string; onPick: () => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <button
        type="button"
        onClick={onPick}
        className="w-full rounded-md border border-dashed px-3 py-4 text-sm text-left hover:bg-muted/40"
      >
        {value ? (
          <span className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {value}
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4" /> Click to attach
          </span>
        )}
      </button>
    </div>
  );
}

function NoteField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} />
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground shrink-0">{l}:</span>
      <span className="font-medium min-w-0">{v}</span>
    </div>
  );
}
