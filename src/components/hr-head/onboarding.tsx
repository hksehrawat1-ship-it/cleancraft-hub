import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  History,
  Lock,
  Mail,
  Search,
  Send,
  Shield,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";
import { DEPTS, type Dept } from "./data";
import {
  CHECKLIST_ITEMS,
  DOC_CATEGORIES,
  DOC_TONE,
  ONBOARDING_RECORDS,
  ONB_STAGES,
  REJECTION_REASONS,
  STAGE_TONE,
  canComplete,
  missingCountOf,
  progressOf,
  type ChecklistKey,
  type DocCategory,
  type OnbDoc,
  type OnbStage,
  type OnboardingRecord,
} from "./onboarding-data";

const TONE: Record<string, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "",
};

const TODAY = "02 Aug 2026";
const NOW = "02 Aug 2026 11:20";
const HR = "Anjali Kapoor (HR Head)";
const ANY = "__any__";

function Kpi({ label, value, tone = "muted" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className={`rounded-xl border p-3 ${TONE[tone]}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Pill({ text, tone }: { text: string; tone: string }) {
  return (
    <Badge variant="outline" className={`text-[11px] ${TONE[tone]}`}>
      {text}
    </Badge>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

export function HrOnboarding() {
  const [rows, setRows] = useState<OnboardingRecord[]>(ONBOARDING_RECORDS);
  const [q, setQ] = useState("");
  const [stageF, setStageF] = useState(ANY);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const newJoiners = rows.filter((r) => r.stage !== "Onboarding Completed").length;
  const inProgress = rows.filter(
    (r) => r.stage !== "Onboarding Completed" && r.stage !== "Joining Confirmed",
  ).length;
  const missingDocs = rows.filter((r) =>
    r.docs.some((d) => d.mandatory && ["Missing", "Rejected", "Reupload Required", "Expired"].includes(d.status)),
  ).length;
  const awaitingVerification = rows.reduce(
    (n, r) => n + r.docs.filter((d) => d.status === "Under Verification" || d.status === "Uploaded").length,
    0,
  );
  const completed = rows.filter((r) => r.stage === "Onboarding Completed").length;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (stageF !== ANY && r.stage !== stageF) return false;
      if (!needle) return true;
      return [r.name, r.empId, r.designation, r.dept, r.manager].join(" ").toLowerCase().includes(needle);
    });
  }, [rows, q, stageF]);

  const current = rows.find((r) => r.empId === openId) ?? null;

  const patch = (empId: string, fn: (r: OnboardingRecord) => OnboardingRecord, log: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.empId === empId
          ? { ...fn(r), audit: [{ at: NOW, by: HR, text: log }, ...r.audit] }
          : r,
      ),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Onboarding &amp; Documents</h2>
          <p className="text-sm text-muted-foreground">
            One checklist per new joiner. Documents stay in private storage and identity numbers stay masked.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search joiner, ID, department…"
              className="pl-8 sm:w-72"
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Joiner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="New Joiners" value={newJoiners} tone="active" />
        <Kpi label="Onboarding in Progress" value={inProgress} tone="pending" />
        <Kpi label="Missing Documents" value={missingDocs} tone="urgent" />
        <Kpi label="Awaiting Verification" value={awaitingVerification} tone="pending" />
        <Kpi label="Onboarding Completed" value={completed} tone="done" />
      </div>

      <Tabs value={stageF} onValueChange={setStageF}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value={ANY} className="text-xs">
            All stages
          </TabsTrigger>
          {ONB_STAGES.map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => {
          const pct = progressOf(r);
          const missing = missingCountOf(r);
          return (
            <Card key={r.empId}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={r.photo} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[11px] tabular-nums text-muted-foreground">{r.empId}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.designation} · {r.dept}
                    </div>
                  </div>
                </div>
                <div className="grid gap-0.5 text-xs text-muted-foreground">
                  <span>Manager: {r.manager}</span>
                  <span>Joining date: {r.doj}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Onboarding progress</span>
                    <span className="font-semibold tabular-nums">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-1" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill text={r.stage} tone={STAGE_TONE[r.stage]} />
                  {missing > 0 ? (
                    <Pill text={`${missing} item${missing > 1 ? "s" : ""} pending`} tone="urgent" />
                  ) : (
                    <Pill text="No pending items" tone="done" />
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setOpenId(r.empId)}>
                  View Onboarding
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {!filtered.length && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No onboarding records in this stage.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification queue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-amber-600" /> Documents awaiting verification ({awaitingVerification})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {rows.flatMap((r) =>
            r.docs
              .filter((d) => d.status === "Under Verification" || d.status === "Uploaded")
              .map((d) => (
                <div key={r.empId + d.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{d.type}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.name} · {r.empId} · {d.category}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setOpenId(r.empId)}>
                    Review
                  </Button>
                </div>
              )),
          )}
          {!awaitingVerification && (
            <div className="text-sm text-muted-foreground">Nothing pending verification right now.</div>
          )}
        </CardContent>
      </Card>

      <OnboardingSheet record={current} onClose={() => setOpenId(null)} patch={patch} />
      <AddJoinerDialog open={addOpen} onOpenChange={setAddOpen} rows={rows} onCreate={(r) => setRows((p) => [r, ...p])} />
    </div>
  );
}

/* ---------------- Onboarding detail ---------------- */

const TABS = ["Checklist", "Documents", "Letters", "Employee View", "History"] as const;
type TabKey = (typeof TABS)[number];

function OnboardingSheet({
  record,
  onClose,
  patch,
}: {
  record: OnboardingRecord | null;
  onClose: () => void;
  patch: (empId: string, fn: (r: OnboardingRecord) => OnboardingRecord, log: string) => void;
}) {
  const [tab, setTab] = useState<TabKey>("Checklist");
  const [reveal, setReveal] = useState(false);
  const [reject, setReject] = useState<OnbDoc | null>(null);
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [reasonNote, setReasonNote] = useState("");
  const [replaceAsk, setReplaceAsk] = useState<OnbDoc | null>(null);
  const [catFilter, setCatFilter] = useState<DocCategory | "__all__">("__all__");

  if (!record) return null;
  const pct = progressOf(record);
  const ready = canComplete(record);

  const setDoc = (id: string, updates: Partial<OnbDoc>, log: string, versionNote?: string) =>
    patch(
      record.empId,
      (r) => ({
        ...r,
        docs: r.docs.map((d) =>
          d.id === id
            ? {
                ...d,
                ...updates,
                versions: versionNote
                  ? [...d.versions, { v: d.versions.length + 1, at: NOW, by: HR, note: versionNote }]
                  : d.versions,
              }
            : d,
        ),
      }),
      log,
    );

  const toggleItem = (key: ChecklistKey, label: string) =>
    patch(
      record.empId,
      (r) => ({ ...r, checklist: { ...r.checklist, [key]: !r.checklist[key] } }),
      `${record.checklist[key] ? "Unchecked" : "Completed"} checklist item: ${label}`,
    );

  const docs = record.docs.filter((d) => catFilter === "__all__" || d.category === catFilter);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Avatar initials={record.photo} />
            <div className="text-left">
              <div>{record.name}</div>
              <div className="text-xs font-normal text-muted-foreground">
                {record.designation} · {record.empId} · Joins {record.doj}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <Pill text={record.stage} tone={STAGE_TONE[record.stage]} />
              <span className="font-semibold tabular-nums">{pct}% complete</span>
            </div>
            <Progress value={pct} className="mt-2" />
            <div className="mt-2 text-[11px] text-muted-foreground">
              {record.candidateId
                ? `Converted from candidate ${record.candidateId} — same master employee record, no duplicate profile.`
                : "Created directly as a new joiner."}
            </div>
          </div>

          {/* HR actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => patch(record.empId, (r) => r, "Document request sent to employee dashboard")}
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" /> Request documents
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                patch(
                  record.empId,
                  (r) => ({
                    ...r,
                    checklist: { ...r.checklist, joining_letter: true },
                    letters: r.letters.map((l) =>
                      l.kind === "Joining letter" && l.status === "Not Issued"
                        ? { ...l, status: "Sent", sentAt: NOW }
                        : l,
                    ),
                  }),
                  "Joining letter issued and sent",
                )
              }
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Issue joining letter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                patch(
                  record.empId,
                  (r) => ({
                    ...r,
                    checklist: { ...r.checklist, appointment_letter: true },
                    letters: r.letters.map((l) =>
                      l.kind === "Appointment letter" && l.status === "Not Issued"
                        ? { ...l, status: "Sent", sentAt: NOW }
                        : l,
                    ),
                  }),
                  "Appointment letter issued and sent",
                )
              }
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Issue appointment letter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                patch(
                  record.empId,
                  (r) => ({ ...r, checklist: { ...r.checklist, invite: true }, stage: "Orientation Pending" }),
                  "User account invitation sent — linked to User Access",
                )
              }
            >
              <Send className="mr-1.5 h-3.5 w-3.5" /> Send account invite
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                patch(
                  record.empId,
                  (r) => ({ ...r, checklist: { ...r.checklist, orientation: true }, stage: "Ready to Join" }),
                  "Orientation marked complete",
                )
              }
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark orientation complete
            </Button>
            <Button
              size="sm"
              disabled={!ready || record.stage === "Onboarding Completed"}
              onClick={() =>
                patch(
                  record.empId,
                  (r) => ({ ...r, stage: "Onboarding Completed" }),
                  "Onboarding completed — Employees and Dashboard updated",
                )
              }
            >
              Complete onboarding
            </Button>
          </div>
          {!ready && record.stage !== "Onboarding Completed" && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
              Onboarding cannot be completed until every mandatory checklist item is done and every mandatory document
              is verified.
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Checklist" && (
            <div className="space-y-1.5">
              {CHECKLIST_ITEMS.map((it) => {
                const done = record.checklist[it.key];
                return (
                  <label
                    key={it.key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm ${
                      done ? TONE.done : it.mandatory ? TONE.pending : ""
                    }`}
                  >
                    <Checkbox checked={done} onCheckedChange={() => toggleItem(it.key, it.label)} />
                    <span className="flex-1">{it.label}</span>
                    {!it.mandatory && <span className="text-[11px] opacity-70">Optional</span>}
                  </label>
                );
              })}
              <p className="pt-1 text-[11px] text-muted-foreground">
                Checklist requirements can be configured per role later by an administrator.
              </p>
            </div>
          )}

          {tab === "Documents" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="h-4 w-4" /> Identity, bank and PAN numbers are masked. Every view is logged.
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Reveal numbers</Label>
                  <Switch
                    checked={reveal}
                    onCheckedChange={(v) => {
                      setReveal(v);
                      if (v) toast.info("Sensitive document view recorded in audit log");
                    }}
                  />
                </div>
              </div>

              <Select value={catFilter} onValueChange={(v) => setCatFilter(v as DocCategory | "__all__")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All categories</SelectItem>
                  {DOC_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {DOC_CATEGORIES.filter((c) => docs.some((d) => d.category === c)).map((cat) => (
                <div key={cat} className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</div>
                  {docs
                    .filter((d) => d.category === cat)
                    .map((d) => (
                      <div key={d.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <FileText className="h-4 w-4 text-muted-foreground" /> {d.type}
                              {!d.mandatory && <span className="text-[11px] text-muted-foreground">(optional)</span>}
                            </div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                              {d.masked ? `No: ${reveal ? d.masked : "••••••"} · ` : ""}
                              {d.issueDate ? `Issued ${d.issueDate} · ` : ""}
                              {d.expiryDate ? `Expires ${d.expiryDate} · ` : ""}
                              {d.file ? d.file : "No file uploaded"}
                            </div>
                            {d.status === "Verified" && (
                              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                Verified by {d.verifiedBy} on {d.verifiedOn}
                              </div>
                            )}
                            {d.rejectionReason && (
                              <div className="mt-1 flex items-start gap-1.5 text-[11px] text-destructive">
                                <XCircle className="mt-0.5 h-3 w-3" /> {d.rejectionReason}
                              </div>
                            )}
                          </div>
                          <Pill text={d.status} tone={DOC_TONE[d.status]} />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (d.status === "Verified") {
                                setReplaceAsk(d);
                                return;
                              }
                              setDoc(
                                d.id,
                                { status: "Under Verification", file: d.file ?? `${d.type.toLowerCase().replace(/\s+/g, "_")}.pdf`, rejectionReason: undefined },
                                `Document uploaded: ${d.type}`,
                                "New version uploaded by HR",
                              );
                            }}
                          >
                            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
                          </Button>
                          {d.status !== "Verified" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDoc(
                                  d.id,
                                  {
                                    status: "Verified",
                                    verifiedBy: HR,
                                    verifiedOn: TODAY,
                                    rejectionReason: undefined,
                                  },
                                  `Document verified: ${d.type}`,
                                )
                              }
                            >
                              Verify
                            </Button>
                          )}
                          {d.status !== "Missing" && d.status !== "Rejected" && (
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setReject(d)}>
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDoc(d.id, { status: "Reupload Required" }, `Reupload requested: ${d.type}`)
                            }
                          >
                            Request reupload
                          </Button>
                        </div>

                        {!!d.versions.length && (
                          <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
                            {d.versions.map((v) => (
                              <div key={v.v}>
                                v{v.v} · {v.at} · {v.by} · {v.note}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}

          {tab === "Letters" && (
            <div className="space-y-2">
              {record.letters.map((l) => (
                <div key={l.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {l.kind} <span className="text-[11px] text-muted-foreground">· {l.version}</span>
                    </div>
                    <Pill
                      text={l.status}
                      tone={
                        l.status === "Acknowledged"
                          ? "done"
                          : l.status === "Not Issued"
                            ? "urgent"
                            : l.status === "Viewed"
                              ? "active"
                              : "pending"
                      }
                    />
                  </div>
                  <div className="mt-1 grid gap-0.5 text-[11px] text-muted-foreground">
                    <span>Sent: {l.sentAt ?? "—"}</span>
                    <span>Viewed: {l.viewedAt ?? "—"}</span>
                    <span>Acknowledged / signed: {l.acknowledgedAt ?? "—"}</span>
                  </div>
                  {l.status !== "Acknowledged" && l.status !== "Not Issued" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        patch(
                          record.empId,
                          (r) => ({
                            ...r,
                            letters: r.letters.map((x) =>
                              x.id === l.id ? { ...x, status: "Acknowledged", acknowledgedAt: NOW } : x,
                            ),
                            checklist: { ...r.checklist, ack: true },
                          }),
                          `${l.kind} ${l.version} acknowledgement recorded`,
                        )
                      }
                    >
                      Record acknowledgement
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "Employee View" && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Preview of what {record.name.split(" ")[0]} sees on their own dashboard. No password is ever requested
                and no sensitive file is shared through a public link.
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Onboarding progress</div>
                <Progress value={pct} className="mt-2" />
                <div className="mt-1 text-[11px] text-muted-foreground">{pct}% complete</div>
              </div>
              <EmpBlock
                title="Documents required"
                items={record.docs.filter((d) => d.status === "Missing").map((d) => d.type)}
                empty="All required documents uploaded."
                action="Upload document"
              />
              <EmpBlock
                title="Awaiting verification"
                items={record.docs
                  .filter((d) => d.status === "Under Verification" || d.status === "Uploaded")
                  .map((d) => d.type)}
                empty="Nothing under verification."
              />
              <EmpBlock
                title="Rejected — reupload needed"
                items={record.docs
                  .filter((d) => d.status === "Rejected" || d.status === "Reupload Required" || d.status === "Expired")
                  .map((d) => `${d.type}${d.rejectionReason ? ` — ${d.rejectionReason}` : ""}`)}
                empty="No rejected documents."
                tone="urgent"
                action="Reupload document"
              />
              <EmpBlock
                title="Letters awaiting acknowledgement"
                items={record.letters
                  .filter((l) => l.status === "Sent" || l.status === "Viewed")
                  .map((l) => `${l.kind} ${l.version}`)}
                empty="No letters pending."
              />
            </div>
          )}

          {tab === "History" && (
            <div className="space-y-2">
              {record.audit.map((a, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <History className="h-4 w-4 text-muted-foreground" /> {a.text}
                  </div>
                  <div className="mt-0.5 pl-6 text-[11px] text-muted-foreground">
                    {a.at} · {a.by}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reject dialog */}
        <Dialog open={!!reject} onOpenChange={(o) => !o && setReject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject document</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{reject?.type}</div>
              <div>
                <Label className="text-xs">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REJECTION_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Instruction for employee (optional)</Label>
                <Textarea value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} rows={2} className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReject(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!reject) return;
                  setDoc(
                    reject.id,
                    {
                      status: "Rejected",
                      rejectionReason: reasonNote ? `${reason} — ${reasonNote}` : reason,
                      verifiedBy: HR,
                      verifiedOn: TODAY,
                    },
                    `Document rejected: ${reject.type} (${reason})`,
                  );
                  setReject(null);
                  setReasonNote("");
                  toast.success("Rejection reason sent to the employee dashboard");
                }}
              >
                Reject &amp; request reupload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Replace verified doc */}
        <Dialog open={!!replaceAsk} onOpenChange={(o) => !o && setReplaceAsk(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Authorised approval required
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {replaceAsk?.type} is already verified. Replacing it needs HR Head approval and will create a new version —
              the original file is never deleted.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplaceAsk(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!replaceAsk) return;
                  setDoc(
                    replaceAsk.id,
                    { status: "Under Verification", verifiedBy: undefined, verifiedOn: undefined },
                    `Verified document replaced with approval: ${replaceAsk.type}`,
                    "Replacement uploaded after HR Head approval",
                  );
                  setReplaceAsk(null);
                }}
              >
                Approve &amp; upload new version
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

function EmpBlock({
  title,
  items,
  empty,
  tone = "muted",
  action,
}: {
  title: string;
  items: string[];
  empty: string;
  tone?: string;
  action?: string;
}) {
  return (
    <div className={`rounded-lg border p-3 ${items.length ? TONE[tone] : ""}`}>
      <div className="text-sm font-medium">{title}</div>
      {items.length ? (
        <ul className="mt-1 list-disc pl-4 text-xs">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-1 text-xs text-muted-foreground">{empty}</div>
      )}
      {!!items.length && action && (
        <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.info(`${action} (employee action)`)}>
          <Upload className="mr-1.5 h-3.5 w-3.5" /> {action}
        </Button>
      )}
    </div>
  );
}

/* ---------------- Add new joiner ---------------- */

function AddJoinerDialog({
  open,
  onOpenChange,
  rows,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rows: OnboardingRecord[];
  onCreate: (r: OnboardingRecord) => void;
}) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [dept, setDept] = useState<Dept>("Sales");
  const [manager, setManager] = useState("");
  const [doj, setDoj] = useState("");
  const [stage, setStage] = useState<OnbStage>("Joining Confirmed");

  const code: Record<string, string> = {
    Sales: "SALES",
    Projects: "PROJ",
    Training: "TRAIN",
    Marketing: "MKT",
    Tech: "TECH",
    Accounts: "ACC",
    "Support Staff": "SUP",
    HR: "HR",
  };
  const seq = rows.reduce((m, r) => Math.max(m, Number(r.empId.split("-").pop()) || 0), 0) + 1;
  const empId = `CC-${code[dept]}-2026-${String(seq).padStart(4, "0")}`;
  const dup = rows.find((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase() && name.trim());

  const submit = () => {
    if (!name.trim() || !designation.trim()) {
      toast.error("Name and designation are required");
      return;
    }
    if (dup) {
      toast.error("This joiner already has an onboarding record — no duplicate profile is created");
      return;
    }
    onCreate({
      empId,
      name: name.trim(),
      photo: name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      designation: designation.trim(),
      dept,
      manager: manager || "Anjali Kapoor (HR Head)",
      doj: doj || TODAY,
      stage,
      checklist: CHECKLIST_ITEMS.reduce(
        (acc, it) => ({ ...acc, [it.key]: it.key === "empid" || it.key === "personal" }),
        {} as Record<ChecklistKey, boolean>,
      ),
      docs: [
        { type: "Aadhaar card", category: "Identity Documents" as DocCategory, mandatory: true },
        { type: "PAN card", category: "Identity Documents" as DocCategory, mandatory: true },
        { type: "Address proof", category: "Address Documents" as DocCategory, mandatory: true },
        { type: "Education documents", category: "Education Documents" as DocCategory, mandatory: true },
        { type: "Experience letter", category: "Experience Documents" as DocCategory, mandatory: false },
        { type: "Previous salary slips", category: "Salary Documents" as DocCategory, mandatory: false },
        { type: "Bank details", category: "Bank Documents" as DocCategory, mandatory: true },
        { type: "Signed policy bundle", category: "Signed Policies and Forms" as DocCategory, mandatory: true },
      ].map((d, i) => ({
        id: `${empId}-D${i + 1}`,
        type: d.type,
        category: d.category,
        mandatory: d.mandatory,
        status: "Missing" as const,
        versions: [],
      })),
      letters: [
        { id: `${empId}-L1`, kind: "Joining letter", version: "v1.0", status: "Not Issued" },
        { id: `${empId}-L2`, kind: "Appointment letter", version: "v1.0", status: "Not Issued" },
      ],
      audit: [{ at: NOW, by: HR, text: "New joiner added — onboarding checklist created" }],
    });
    toast.success(`Onboarding started for ${name.trim()} (${empId})`);
    onOpenChange(false);
    setName("");
    setDesignation("");
    setManager("");
    setDoj("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new joiner</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Employee ID (permanent)</div>
            <div className="mt-0.5 font-mono text-sm font-semibold">{empId}</div>
          </div>
          {dup && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              {dup.name} already has an onboarding record ({dup.empId}).
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Designation</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Department</Label>
              <Select value={dept} onValueChange={(v) => setDept(v as Dept)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Reporting manager</Label>
              <Input value={manager} onChange={(e) => setManager(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Joining date</Label>
              <Input value={doj} onChange={(e) => setDoj(e.target.value)} placeholder="10 Aug 2026" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Starting stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as OnbStage)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ONB_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Start onboarding</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
