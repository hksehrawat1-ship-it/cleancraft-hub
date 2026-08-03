import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Download,
  Eye,
  FilePlus2,
  FileText,
  History,
  Lock,
  Search,
  Send,
  Shield,
  ShieldCheck,
  UserCircle2,
  X,
} from "lucide-react";
import { MASTER_EMPLOYEES } from "./employee-data";
import {
  ACK_TONE,
  ALL_FIELDS,
  APPROVAL_TONE,
  CONFIDENTIALITY,
  DELIVERY_TONE,
  DOC_CATEGORIES,
  DOC_TEMPLATES,
  HR_DOCS,
  PRIVACY_NOTE,
  STAGE_TONE,
  TEMPLATE_TONE,
  TYPES_BY_CATEGORY,
  categoryOf,
  isWarning,
  needsApproval,
  nextDocNo,
  nowStamp,
  type AckStatus,
  type Confidentiality,
  type DocCategory,
  type DocTemplate,
  type DocType,
  type HrDoc,
  type TemplateStatus,
  type WarningDetails,
} from "./letters-data";

const TONE: Record<string, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

const Pill = ({ tone, children }: { tone: string; children: React.ReactNode }) => (
  <Badge variant="outline" className={`${TONE[tone] ?? TONE.muted} whitespace-nowrap`}>
    {children}
  </Badge>
);

const Kpi = ({
  k,
  v,
  hint,
  onClick,
  activeKpi,
}: {
  k: string;
  v: number;
  hint?: string;
  onClick?: () => void;
  activeKpi?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/60 ${
      activeKpi ? "ring-2 ring-primary" : ""
    }`}
  >
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
    <div className="mt-1 text-2xl font-semibold tabular-nums">{v}</div>
    {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
  </button>
);

const Row = ({ k, v }: { k: string; v?: React.ReactNode }) =>
  v ? (
    <div className="flex flex-wrap justify-between gap-2 border-b py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  ) : null;

const TABS = [
  "Employment Letters",
  "Performance Letters",
  "Notices & Warnings",
  "Employee Acknowledgements",
  "Templates",
] as const;
type TabKey = (typeof TABS)[number];

type Filter = "all" | "drafts" | "approval" | "sent" | "awaiting" | "acknowledged";

const HR_USER = "Anjali Kapoor (HR Head)";

export function HrLetters() {
  const [docs, setDocs] = useState<HrDoc[]>(HR_DOCS);
  const [templates, setTemplates] = useState<DocTemplate[]>(DOC_TEMPLATES);
  const [tab, setTab] = useState<TabKey>("Employment Letters");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [openDoc, setOpenDoc] = useState<HrDoc | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [empView, setEmpView] = useState<string>("");

  const counts = useMemo(
    () => ({
      drafts: docs.filter((d) => d.stage === "Draft").length,
      approval: docs.filter((d) => d.approval === "Pending").length,
      sent: docs.filter((d) => d.delivery !== "Not Sent").length,
      awaiting: docs.filter((d) => d.ack === "Awaiting" || d.ack === "No Response").length,
      acknowledged: docs.filter((d) => d.ack === "Acknowledged").length,
    }),
    [docs],
  );

  const matchFilter = (d: HrDoc) =>
    filter === "all" ||
    (filter === "drafts" && d.stage === "Draft") ||
    (filter === "approval" && d.approval === "Pending") ||
    (filter === "sent" && d.delivery !== "Not Sent") ||
    (filter === "awaiting" && (d.ack === "Awaiting" || d.ack === "No Response")) ||
    (filter === "acknowledged" && d.ack === "Acknowledged");

  const matchQ = (d: HrDoc) =>
    !q.trim() ||
    [d.docNo, d.name, d.empId, d.type, d.subject].some((s) => s.toLowerCase().includes(q.toLowerCase()));

  const listFor = (cat: DocCategory) =>
    docs.filter((d) => categoryOf(d.type) === cat && matchFilter(d) && matchQ(d));

  const ackList = docs.filter((d) => d.delivery !== "Not Sent" && matchFilter(d) && matchQ(d));

  const update = (id: string, patch: Partial<HrDoc>, log?: string, by = HR_USER) =>
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...patch,
              history: log ? [...d.history, { at: nowStamp(), by, text: log }] : d.history,
            }
          : d,
      ),
    );

  const openAndLog = (d: HrDoc) => {
    setOpenDoc(d);
    update(d.id, {}, `Document opened by ${HR_USER} (access recorded)`);
  };

  const current = openDoc ? (docs.find((d) => d.id === openDoc.id) ?? openDoc) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Letters, Notices &amp; Warnings</h1>
          <p className="text-sm text-muted-foreground">
            Create, approve, send and track official employee documents. Every action is recorded.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <FilePlus2 className="mr-2 h-4 w-4" /> Create Document
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi k="Drafts" v={counts.drafts} hint="Not yet issued" onClick={() => setFilter(filter === "drafts" ? "all" : "drafts")} activeKpi={filter === "drafts"} />
        <Kpi k="Awaiting Approval" v={counts.approval} hint="With approver" onClick={() => setFilter(filter === "approval" ? "all" : "approval")} activeKpi={filter === "approval"} />
        <Kpi k="Sent" v={counts.sent} hint="Issued documents" onClick={() => setFilter(filter === "sent" ? "all" : "sent")} activeKpi={filter === "sent"} />
        <Kpi k="Awaiting Acknowledgement" v={counts.awaiting} hint="Employee pending" onClick={() => setFilter(filter === "awaiting" ? "all" : "awaiting")} activeKpi={filter === "awaiting"} />
        <Kpi k="Acknowledged" v={counts.acknowledged} hint="Confirmed by employee" onClick={() => setFilter(filter === "acknowledged" ? "all" : "acknowledged")} activeKpi={filter === "acknowledged"} />
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-2 p-3 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>{PRIVACY_NOTE}</span>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="flex flex-wrap">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t} className="text-xs">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {tab !== "Templates" && (
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search document no, employee, subject" className="pl-8" />
          </div>
        )}
      </div>

      {filter !== "all" && tab !== "Templates" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Filtered by header count
          <Button size="sm" variant="ghost" className="h-6" onClick={() => setFilter("all")}>
            Clear
          </Button>
        </div>
      )}

      {(tab === "Employment Letters" || tab === "Performance Letters" || tab === "Notices & Warnings") && (
        <DocList docs={listFor(tab)} onView={openAndLog} />
      )}

      {tab === "Employee Acknowledgements" && (
        <AckTab docs={ackList} onView={openAndLog} update={update} empView={empView} setEmpView={setEmpView} allDocs={docs} />
      )}

      {tab === "Templates" && <TemplatesTab templates={templates} setTemplates={setTemplates} />}

      {current && (
        <DocSheet doc={current} onClose={() => setOpenDoc(null)} update={update} docs={docs} setDocs={setDocs} />
      )}

      <CreateDocDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        templates={templates}
        onCreate={(d) => setDocs((prev) => [d, ...prev])}
        docs={docs}
      />
    </div>
  );
}

/* ---------------- Document list ---------------- */

function DocList({ docs, onView }: { docs: HrDoc[]; onView: (d: HrDoc) => void }) {
  if (docs.length === 0)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          No documents match the current view.
        </CardContent>
      </Card>
    );

  return (
    <>
      {/* Desktop */}
      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Document no</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Type &amp; subject</th>
                <th className="p-3">Created</th>
                <th className="p-3">Approval</th>
                <th className="p-3">Delivery</th>
                <th className="p-3">Acknowledgement</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t align-top">
                  <td className="p-3">
                    <div className="font-mono text-xs">{d.docNo}</div>
                    <div className="mt-1">
                      <Pill tone={STAGE_TONE[d.stage]}>{d.stage}</Pill>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.empId}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.dept} · {d.designation}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      {isWarning(d.type) && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      {d.type}
                    </div>
                    <div className="max-w-[280px] text-xs text-muted-foreground">{d.subject}</div>
                    {d.confidentiality !== "Normal" && (
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        <Lock className="mr-1 inline h-3 w-3" />
                        {d.confidentiality}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    <div>{d.createdOn}</div>
                    <div className="text-muted-foreground">{d.createdBy}</div>
                    {d.version > 1 && <div className="text-muted-foreground">Version {d.version}</div>}
                  </td>
                  <td className="p-3">
                    <Pill tone={APPROVAL_TONE[d.approval]}>{d.approval}</Pill>
                  </td>
                  <td className="p-3">
                    <Pill tone={DELIVERY_TONE[d.delivery]}>{d.delivery}</Pill>
                  </td>
                  <td className="p-3">
                    <Pill tone={ACK_TONE[d.ack]}>{d.ack}</Pill>
                    {d.responseDeadline && d.ack !== "Acknowledged" && (
                      <div className="mt-1 text-[11px] text-muted-foreground">Due {d.responseDeadline}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => onView(d)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile */}
      <div className="space-y-3 lg:hidden">
        {docs.map((d) => (
          <Card key={d.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground">{d.docNo}</div>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isWarning(d.type) && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    {d.type}
                  </div>
                </div>
                <Pill tone={STAGE_TONE[d.stage]}>{d.stage}</Pill>
              </div>
              <div className="text-sm">{d.subject}</div>
              <div className="text-xs text-muted-foreground">
                {d.name} · {d.empId} · {d.dept}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={APPROVAL_TONE[d.approval]}>{d.approval}</Pill>
                <Pill tone={DELIVERY_TONE[d.delivery]}>{d.delivery}</Pill>
                <Pill tone={ACK_TONE[d.ack]}>{d.ack}</Pill>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => onView(d)}>
                View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------------- Document sheet ---------------- */

function DocSheet({
  doc,
  onClose,
  update,
  docs,
  setDocs,
}: {
  doc: HrDoc;
  onClose: () => void;
  update: (id: string, patch: Partial<HrDoc>, log?: string, by?: string) => void;
  docs: HrDoc[];
  setDocs: React.Dispatch<React.SetStateAction<HrDoc[]>>;
}) {
  const [confirmSend, setConfirmSend] = useState(false);
  const [amendOpen, setAmendOpen] = useState(false);
  const [amendText, setAmendText] = useState(doc.content);
  const [closeNote, setCloseNote] = useState("");
  const [editContent, setEditContent] = useState(doc.content);

  const locked = doc.delivery !== "Not Sent";
  const requiresApproval = needsApproval(doc.type);
  const sensitive = isWarning(doc.type);

  const linkedNote =
    doc.type === "Appointment Letter" || doc.type === "Joining Letter"
      ? "Linked to Onboarding & Documents — issuing this letter updates the onboarding checklist."
      : categoryOf(doc.type) === "Performance Letters"
        ? "Linked to Performance & Training — issuing this letter updates the employee performance record."
        : doc.type === "Relieving Letter" || doc.type === "Termination Notice" || doc.type === "Experience Letter"
          ? "Linked to the employee exit process — issuing this letter updates exit clearance."
          : "";

  const doSend = () => {
    update(
      doc.id,
      {
        stage: "Sent",
        delivery: "Delivered",
        ack: "Awaiting",
        sentAt: nowStamp(),
        deliveredAt: nowStamp(),
      },
      "Sent to employee private dashboard (delivery recorded)",
    );
    setConfirmSend(false);
    toast.success(`${doc.docNo} sent to ${doc.name}`);
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> {doc.docNo}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-10 pt-4">
          <div className="flex flex-wrap gap-1.5">
            <Pill tone={STAGE_TONE[doc.stage]}>{doc.stage}</Pill>
            <Pill tone={APPROVAL_TONE[doc.approval]}>Approval: {doc.approval}</Pill>
            <Pill tone={DELIVERY_TONE[doc.delivery]}>{doc.delivery}</Pill>
            <Pill tone={ACK_TONE[doc.ack]}>{doc.ack}</Pill>
            {doc.confidentiality !== "Normal" && <Pill tone="urgent">{doc.confidentiality}</Pill>}
            {doc.version > 1 && <Pill tone="muted">Version {doc.version}</Pill>}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Document details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Row k="Employee" v={`${doc.name} · ${doc.empId}`} />
              <Row k="Department / Designation" v={`${doc.dept} · ${doc.designation}`} />
              <Row k="Document type" v={doc.type} />
              <Row k="Subject" v={doc.subject} />
              <Row k="Effective date" v={doc.effectiveDate} />
              <Row k="Created by" v={`${doc.createdBy} · ${doc.createdOn}`} />
              <Row k="Approver" v={doc.approver} />
              <Row k="Response deadline" v={doc.responseDeadline} />
              <Row k="Attachment" v={doc.attachment} />
              <Row k="Supporting evidence" v={doc.evidence} />
              <Row k="Download permitted" v={doc.downloadAllowed ? "Yes" : "No"} />
              <Row k="Amended from" v={doc.amendedFrom} />
            </CardContent>
          </Card>

          {linkedNote && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-xs text-blue-700 dark:text-blue-400">
              {linkedNote}
            </div>
          )}

          {doc.warning && (
            <Card className="border-destructive/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <AlertTriangle className="h-4 w-4" /> Disciplinary record
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Row k="Reason" v={doc.warning.reason} />
                <Row k="Incident date" v={doc.warning.incidentDate} />
                <Row k="Policy or rule" v={doc.warning.policy} />
                <Row k="Supporting evidence" v={doc.warning.evidence} />
                <Row k="Previous related warnings" v={doc.warning.previousWarnings} />
                <Row k="Expected corrective action" v={doc.warning.correctiveAction} />
                <Row k="Review date" v={doc.warning.reviewDate} />
                <p className="pt-2 text-[11px] text-muted-foreground">
                  Warnings are never issued automatically from CRM performance data — each one is raised and approved by
                  an authorised person.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Document content</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {locked ? (
                <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">{doc.content}</pre>
              ) : (
                <div className="space-y-2">
                  <Textarea rows={10} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      update(doc.id, { content: editContent }, "Draft content edited");
                      toast.success("Draft updated");
                    }}
                  >
                    Save draft content
                  </Button>
                </div>
              )}
              {locked && (
                <p className="pt-2 text-[11px] text-muted-foreground">
                  Sent documents cannot be edited. Corrections must be issued as a formal amendment.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Acknowledgement trail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Delivery &amp; acknowledgement</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Row k="Sent" v={doc.sentAt} />
              <Row k="Delivered" v={doc.deliveredAt} />
              <Row k="Viewed" v={doc.viewedAt} />
              <Row k="Acknowledged" v={doc.acknowledgedAt} />
              <Row k="Employee response" v={doc.employeeResponse} />
              <Row k="HR closing note" v={doc.hrClosingNote} />
              {!doc.sentAt && <p className="py-2 text-sm text-muted-foreground">Not sent yet.</p>}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">HR actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 pt-0">
              {doc.stage === "Draft" && requiresApproval && (
                <Button
                  size="sm"
                  onClick={() => {
                    update(
                      doc.id,
                      { stage: "Submitted for Approval", approval: "Pending", approver: doc.approver ?? "CEO" },
                      "Submitted for authorised approval",
                    );
                    toast.success("Submitted for approval");
                  }}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Submit for approval
                </Button>
              )}

              {doc.approval === "Pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      update(doc.id, { stage: "Approved", approval: "Approved" }, "Approved for issue", "CEO");
                      toast.success("Approved");
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" /> Record approval
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      update(doc.id, { stage: "Draft", approval: "Rejected" }, "Approval rejected — returned to draft", "CEO");
                      toast("Approval rejected");
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Record rejection
                  </Button>
                </>
              )}

              {doc.delivery === "Not Sent" && (doc.approval === "Approved" || !requiresApproval) && (
                <Button size="sm" onClick={() => setConfirmSend(true)}>
                  <Send className="mr-2 h-4 w-4" /> Send to employee
                </Button>
              )}

              {doc.delivery !== "Not Sent" && !doc.viewedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update(doc.id, { stage: "Viewed", delivery: "Viewed", viewedAt: nowStamp() }, "Employee viewed the document", doc.name)}
                >
                  <Eye className="mr-2 h-4 w-4" /> Record employee view
                </Button>
              )}

              {doc.delivery !== "Not Sent" && doc.ack !== "Acknowledged" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update(
                        doc.id,
                        { stage: "Acknowledged", ack: "Acknowledged", acknowledgedAt: nowStamp() },
                        "Employee acknowledged the document",
                        doc.name,
                      )
                    }
                  >
                    <Check className="mr-2 h-4 w-4" /> Record acknowledgement
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() =>
                      update(
                        doc.id,
                        { ack: "Refused" },
                        "Employee refused to acknowledge — original document preserved unchanged",
                        doc.name,
                      )
                    }
                  >
                    Record refusal
                  </Button>
                </>
              )}

              {doc.delivery !== "Not Sent" && (
                <Button size="sm" variant="outline" onClick={() => setAmendOpen(true)}>
                  Issue amendment
                </Button>
              )}

              {doc.downloadAllowed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    update(doc.id, {}, `Downloaded by ${HR_USER} (download recorded)`);
                    toast.success("Download recorded (file export not enabled yet)");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              )}
            </CardContent>
          </Card>

          {doc.ack === "Acknowledged" && doc.stage !== "Closed" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Close document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Label className="text-xs">HR closing note</Label>
                <Textarea rows={2} value={closeNote} onChange={(e) => setCloseNote(e.target.value)} placeholder="Filed in employee record…" />
                <Button
                  size="sm"
                  disabled={!closeNote.trim()}
                  onClick={() => {
                    update(doc.id, { stage: "Closed", hrClosingNote: closeNote }, "Document closed with HR note");
                    setCloseNote("");
                    toast.success("Document closed");
                  }}
                >
                  Close document
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" /> Full history
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {doc.history.map((h, i) => (
                <div key={i} className="rounded-md border p-2 text-xs">
                  <div className="font-medium">{h.text}</div>
                  <div className="text-muted-foreground">
                    {h.at} · {h.by}
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">
                Issued HR documents are never deleted. Creation, approval, delivery, viewing, response and
                acknowledgement history is preserved permanently.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Send confirmation */}
        <Dialog open={confirmSend} onOpenChange={setConfirmSend}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{sensitive ? "Confirm issue of a disciplinary document" : "Confirm sending"}</DialogTitle>
              <DialogDescription>
                {doc.type} — {doc.docNo} will be placed on {doc.name}&apos;s private dashboard. This cannot be edited
                afterwards.
              </DialogDescription>
            </DialogHeader>
            {sensitive && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                This is a warning, suspension or termination document. Confirm that the reason, evidence and approval
                are complete and correct.
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmSend(false)}>
                Cancel
              </Button>
              <Button onClick={doSend}>Confirm and send</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Amendment */}
        <Dialog open={amendOpen} onOpenChange={setAmendOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue formal amendment</DialogTitle>
              <DialogDescription>
                The original {doc.docNo} stays on record unchanged. A new version is created and must be sent again.
              </DialogDescription>
            </DialogHeader>
            <Textarea rows={10} value={amendText} onChange={(e) => setAmendText(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAmendOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const newDoc: HrDoc = {
                    ...doc,
                    id: `${doc.id}-v${doc.version + 1}`,
                    docNo: nextDocNo(docs),
                    version: doc.version + 1,
                    amendedFrom: doc.docNo,
                    content: amendText,
                    stage: "Draft",
                    approval: needsApproval(doc.type) ? "Pending" : "Not Required",
                    delivery: "Not Sent",
                    ack: "Not Applicable",
                    createdOn: nowStamp(),
                    sentAt: undefined,
                    deliveredAt: undefined,
                    viewedAt: undefined,
                    acknowledgedAt: undefined,
                    employeeResponse: undefined,
                    hrClosingNote: undefined,
                    history: [{ at: nowStamp(), by: HR_USER, text: `Amendment created from ${doc.docNo}` }],
                  };
                  setDocs((prev) => [newDoc, ...prev]);
                  update(doc.id, {}, `Amendment issued as ${newDoc.docNo} — original preserved`);
                  setAmendOpen(false);
                  toast.success(`Amendment ${newDoc.docNo} created as draft`);
                }}
              >
                Create amendment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- Acknowledgements tab ---------------- */

function AckTab({
  docs,
  allDocs,
  onView,
  update,
  empView,
  setEmpView,
}: {
  docs: HrDoc[];
  allDocs: HrDoc[];
  onView: (d: HrDoc) => void;
  update: (id: string, patch: Partial<HrDoc>, log?: string, by?: string) => void;
  empView: string;
  setEmpView: (v: string) => void;
}) {
  const [response, setResponse] = useState<Record<string, string>>({});
  const empDocs = allDocs.filter((d) => d.empId === empView && d.delivery !== "Not Sent");

  return (
    <div className="space-y-4">
      <DocList docs={docs} onView={onView} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle2 className="h-4 w-4" /> Employee private dashboard preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            This is exactly what the selected employee sees on their own dashboard. Documents of other employees are
            never visible here, and confidential content is never shown in notifications.
          </p>
          <Select value={empView} onValueChange={setEmpView}>
            <SelectTrigger className="md:w-80">
              <SelectValue placeholder="Select employee to preview" />
            </SelectTrigger>
            <SelectContent>
              {MASTER_EMPLOYEES.map((e) => (
                <SelectItem key={e.empId} value={e.empId}>
                  {e.name} · {e.empId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {empView && empDocs.length === 0 && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No issued documents for this employee.
            </div>
          )}

          {empDocs.map((d) => (
            <div key={d.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{d.type}</div>
                  <div className="text-sm text-muted-foreground">{d.subject}</div>
                  <div className="text-xs text-muted-foreground">Issued {d.sentAt ?? d.createdOn}</div>
                </div>
                <Pill tone={ACK_TONE[d.ack]}>{d.ack}</Pill>
              </div>
              {d.responseDeadline && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <Clock className="h-3.5 w-3.5" /> Response deadline {d.responseDeadline}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!d.viewedAt)
                      update(d.id, { stage: "Viewed", delivery: "Viewed", viewedAt: nowStamp() }, "Employee viewed the document", d.name);
                    onView(d);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> View document
                </Button>
                {d.downloadAllowed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      update(d.id, {}, "Employee downloaded the document", d.name);
                      toast.success("Download recorded");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                )}
                {d.ack !== "Acknowledged" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      update(
                        d.id,
                        { stage: "Acknowledged", ack: "Acknowledged", acknowledgedAt: nowStamp() },
                        "Employee acknowledged the document",
                        d.name,
                      )
                    }
                  >
                    <Check className="mr-2 h-4 w-4" /> Acknowledge
                  </Button>
                )}
              </div>
              {d.responseDeadline && (
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    placeholder="Write your response…"
                    value={response[d.id] ?? d.employeeResponse ?? ""}
                    onChange={(e) => setResponse((p) => ({ ...p, [d.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!(response[d.id] ?? "").trim()}
                    onClick={() => {
                      update(
                        d.id,
                        { stage: "Employee Responded", employeeResponse: response[d.id] },
                        "Employee submitted a written response",
                        d.name,
                      );
                      setResponse((p) => ({ ...p, [d.id]: "" }));
                      toast.success("Response submitted");
                    }}
                  >
                    Submit response
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Templates tab ---------------- */

function TemplatesTab({
  templates,
  setTemplates,
}: {
  templates: DocTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<DocTemplate[]>>;
}) {
  const [open, setOpen] = useState<DocTemplate | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "General Notice" as DocType, body: "", approval: false, fields: ["Employee", "Document content"] });

  const current = open ? (templates.find((t) => t.id === open.id) ?? open) : null;

  const patch = (id: string, p: Partial<DocTemplate>) =>
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...p, updatedOn: nowStamp(), updatedBy: HR_USER } : t)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Authorised HR users manage approved templates. Every previous version is preserved.
        </p>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <FilePlus2 className="mr-2 h-4 w-4" /> New template
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.type} · v{t.version}
                  </div>
                </div>
                <Pill tone={TEMPLATE_TONE[t.status]}>{t.status}</Pill>
              </div>
              <div className="text-xs text-muted-foreground">
                {t.approvalRequired ? "Authorised approval required" : "No approval required"} ·{" "}
                {t.mandatoryFields.length} mandatory fields
              </div>
              <div className="text-xs text-muted-foreground">
                Updated {t.updatedOn} by {t.updatedBy}
              </div>
              <Button size="sm" variant="outline" onClick={() => setOpen(t)}>
                Open template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {current && (
        <Sheet open onOpenChange={(o) => !o && setOpen(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>{current.name}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 pb-10 pt-4">
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={TEMPLATE_TONE[current.status]}>{current.status}</Pill>
                <Pill tone="muted">Version {current.version}</Pill>
                {current.approvalRequired && <Pill tone="pending">Approval required</Pill>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Template body</Label>
                <Textarea
                  rows={10}
                  value={current.body}
                  disabled={current.status === "Archived"}
                  onChange={(e) => patch(current.id, { body: e.target.value })}
                />
                {current.status === "Published" && (
                  <p className="text-[11px] text-muted-foreground">
                    Editing a published template creates changes that only take effect when you publish a new version.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">Requires authorised approval</div>
                  <div className="text-xs text-muted-foreground">CEO or authorised management sign-off before sending</div>
                </div>
                <Switch
                  checked={current.approvalRequired}
                  disabled={current.status === "Archived"}
                  onCheckedChange={(v) => patch(current.id, { approvalRequired: v })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Mandatory fields</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_FIELDS.map((f) => {
                    const on = current.mandatoryFields.includes(f);
                    return (
                      <button
                        key={f}
                        disabled={current.status === "Archived"}
                        onClick={() =>
                          patch(current.id, {
                            mandatoryFields: on
                              ? current.mandatoryFields.filter((x) => x !== f)
                              : [...current.mandatoryFields, f],
                          })
                        }
                        className={`rounded-full border px-2.5 py-1 text-xs ${on ? TONE.active : TONE.muted}`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {current.status === "Draft" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      patch(current.id, {
                        status: "Published",
                        versions: [
                          ...current.versions,
                          { version: current.version, status: "Published", on: nowStamp(), by: HR_USER, note: "Published" },
                        ],
                      });
                      toast.success("Template published");
                    }}
                  >
                    Publish template
                  </Button>
                )}
                {current.status === "Published" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      patch(current.id, {
                        version: current.version + 1,
                        versions: [
                          ...current.versions.map((v) => ({ ...v, status: "Archived" as TemplateStatus })),
                          {
                            version: current.version + 1,
                            status: "Published",
                            on: nowStamp(),
                            by: HR_USER,
                            note: "New version published",
                          },
                        ],
                      });
                      toast.success(`Version ${current.version + 1} published`);
                    }}
                  >
                    Publish new version
                  </Button>
                )}
                {current.status !== "Archived" && (
                  <Button size="sm" variant="outline" onClick={() => { patch(current.id, { status: "Archived" }); toast("Template archived"); }}>
                    Archive template
                  </Button>
                )}
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4" /> Version history
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {current.versions.map((v, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-2 text-xs">
                      <span>
                        v{v.version} · {v.note}
                      </span>
                      <span className="text-muted-foreground">
                        {v.on} · {v.by}
                      </span>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground">All previous template versions are preserved.</p>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create template</DialogTitle>
            <DialogDescription>New templates start as drafts until published.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Template name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Document type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as DocType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_CATEGORIES.flatMap((c) => TYPES_BY_CATEGORY[c]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Body</Label>
              <Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Requires authorised approval</span>
              <Switch checked={form.approval} onCheckedChange={(v) => setForm({ ...form, approval: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.name.trim() || !form.body.trim()}
              onClick={() => {
                setTemplates((prev) => [
                  {
                    id: `T${Date.now()}`,
                    name: form.name,
                    type: form.type,
                    version: 1,
                    status: "Draft",
                    approvalRequired: form.approval || needsApproval(form.type),
                    mandatoryFields: form.fields,
                    body: form.body,
                    updatedBy: HR_USER,
                    updatedOn: nowStamp(),
                    versions: [{ version: 1, status: "Draft", on: nowStamp(), by: HR_USER, note: "Draft created" }],
                  },
                  ...prev,
                ]);
                setNewOpen(false);
                setForm({ name: "", type: "General Notice", body: "", approval: false, fields: ["Employee", "Document content"] });
                toast.success("Template draft created");
              }}
            >
              Create draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Create document wizard ---------------- */

const STEPS = ["Select Employee", "Select Document Type", "Choose Template", "Add Details", "Review", "Send"] as const;

const emptyWarning: WarningDetails = {
  reason: "",
  incidentDate: "",
  policy: "",
  evidence: "",
  previousWarnings: "",
  correctiveAction: "",
  reviewDate: "",
};

function CreateDocDialog({
  open,
  onOpenChange,
  templates,
  onCreate,
  docs,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  templates: DocTemplate[];
  onCreate: (d: HrDoc) => void;
  docs: HrDoc[];
}) {
  const [step, setStep] = useState(0);
  const [empId, setEmpId] = useState("");
  const [cat, setCat] = useState<DocCategory>("Employment Letters");
  const [type, setType] = useState<DocType | "">("");
  const [tplId, setTplId] = useState("");
  const [subject, setSubject] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [content, setContent] = useState("");
  const [evidence, setEvidence] = useState("");
  const [attachment, setAttachment] = useState("");
  const [deadline, setDeadline] = useState("");
  const [conf, setConf] = useState<Confidentiality>("Confidential");
  const [approvalOn, setApprovalOn] = useState(false);
  const [download, setDownload] = useState(true);
  const [warning, setWarning] = useState<WarningDetails>(emptyWarning);
  const [confirmSend, setConfirmSend] = useState(false);

  const employee = MASTER_EMPLOYEES.find((e) => e.empId === empId);
  const tpl = templates.find((t) => t.id === tplId);
  const warn = type ? isWarning(type as DocType) : false;
  const mustApprove = type ? needsApproval(type as DocType) || approvalOn || !!tpl?.approvalRequired : approvalOn;

  const prevWarnings = docs.filter((d) => d.empId === empId && isWarning(d.type));

  const reset = () => {
    setStep(0);
    setEmpId("");
    setType("");
    setTplId("");
    setSubject("");
    setEffectiveDate("");
    setContent("");
    setEvidence("");
    setAttachment("");
    setDeadline("");
    setConf("Confidential");
    setApprovalOn(false);
    setDownload(true);
    setWarning(emptyWarning);
  };

  const detailsOk =
    !!subject.trim() &&
    !!effectiveDate.trim() &&
    !!content.trim() &&
    (!warn ||
      (!!warning.reason.trim() &&
        !!warning.incidentDate.trim() &&
        !!warning.policy.trim() &&
        !!warning.evidence.trim() &&
        !!warning.correctiveAction.trim() &&
        !!warning.reviewDate.trim() &&
        !!deadline.trim()));

  const canNext =
    (step === 0 && !!empId) ||
    (step === 1 && !!type) ||
    step === 2 ||
    (step === 3 && detailsOk) ||
    step === 4 ||
    step === 5;

  const build = (send: boolean): HrDoc => {
    const e = employee!;
    return {
      id: `N${Date.now()}`,
      docNo: nextDocNo(docs),
      empId: e.empId,
      name: e.name,
      photo: e.photo,
      dept: e.dept,
      designation: e.designation,
      type: type as DocType,
      subject,
      effectiveDate,
      content,
      evidence: evidence || (warn ? warning.evidence : undefined),
      attachment: attachment || undefined,
      responseDeadline: deadline || undefined,
      confidentiality: conf,
      createdBy: HR_USER,
      createdOn: nowStamp(),
      approver: mustApprove ? "CEO" : undefined,
      stage: send ? "Sent" : mustApprove ? "Submitted for Approval" : "Draft",
      approval: mustApprove ? "Pending" : "Not Required",
      delivery: send ? "Delivered" : "Not Sent",
      ack: send ? "Awaiting" : "Not Applicable",
      version: 1,
      downloadAllowed: download,
      sentAt: send ? nowStamp() : undefined,
      deliveredAt: send ? nowStamp() : undefined,
      warning: warn ? { ...warning, previousWarnings: warning.previousWarnings || (prevWarnings.length ? prevWarnings.map((p) => `${p.type} ${p.docNo}`).join("; ") : "None") } : undefined,
      history: [
        { at: nowStamp(), by: HR_USER, text: `Document created${tpl ? ` from template ${tpl.name} v${tpl.version}` : ""}` },
        ...(mustApprove ? [{ at: nowStamp(), by: HR_USER, text: "Submitted for authorised approval" }] : []),
        ...(send ? [{ at: nowStamp(), by: HR_USER, text: "Sent to employee private dashboard" }] : []),
      ],
    };
  };

  const finish = (send: boolean) => {
    onCreate(build(send));
    toast.success(send ? "Document sent to employee" : mustApprove ? "Sent for approval" : "Draft saved");
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <Badge key={s} variant="outline" className={i === step ? TONE.active : i < step ? TONE.done : TONE.muted}>
              {i + 1}. {s}
            </Badge>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          {step === 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Employee (master record)</Label>
              <Select value={empId} onValueChange={setEmpId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {MASTER_EMPLOYEES.map((e) => (
                    <SelectItem key={e.empId} value={e.empId}>
                      {e.name} · {e.empId} · {e.dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {employee && (
                <Card>
                  <CardContent className="p-3">
                    <Row k="Department" v={employee.dept} />
                    <Row k="Designation" v={employee.designation} />
                    <Row k="Reporting manager" v={employee.manager} />
                    <Row k="Status" v={employee.status} />
                    <Row k="Existing documents" v={String(docs.filter((d) => d.empId === employee.empId).length)} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={cat} onValueChange={(v) => { setCat(v as DocCategory); setType(""); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TYPES_BY_CATEGORY[cat].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-lg border p-2.5 text-left text-xs ${type === t ? TONE.active : "hover:bg-muted"}`}
                  >
                    {t}
                    {isWarning(t) && <AlertTriangle className="ml-1 inline h-3 w-3 text-destructive" />}
                  </button>
                ))}
              </div>
              {type && needsApproval(type as DocType) && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                  This is a sensitive document — authorised approval is required before it can be sent.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label className="text-xs">Approved templates for {type || "selected type"}</Label>
              {templates.filter((t) => t.type === type && t.status === "Published").length === 0 && (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  No published template for this type. You can continue and write the content manually.
                </div>
              )}
              {templates
                .filter((t) => t.type === type && t.status === "Published")
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTplId(t.id);
                      setContent(
                        t.body
                          .replaceAll("{{name}}", employee?.name ?? "")
                          .replaceAll("{{designation}}", employee?.designation ?? "")
                          .replaceAll("{{location}}", employee?.location ?? "")
                          .replaceAll("{{doj}}", employee?.doj ?? "")
                          .replaceAll("{{hrName}}", "Anjali Kapoor"),
                      );
                    }}
                    className={`w-full rounded-lg border p-3 text-left ${tplId === t.id ? TONE.active : "hover:bg-muted"}`}
                  >
                    <div className="text-sm font-medium">
                      {t.name} · v{t.version}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mandatory: {t.mandatoryFields.join(", ")}
                    </div>
                  </button>
                ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Effective date</Label>
                  <Input value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} placeholder="05 Aug 2026" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Document content</Label>
                <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Supporting evidence</Label>
                  <Input value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Reference to records / notes" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Attachment (file name)</Label>
                  <Input value={attachment} onChange={(e) => setAttachment(e.target.value)} placeholder="annexure.pdf" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Response deadline {warn && <span className="text-destructive">*</span>}</Label>
                  <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="12 Aug 2026" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Confidentiality</Label>
                  <Select value={conf} onValueChange={(v) => setConf(v as Confidentiality)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONFIDENTIALITY.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">Require authorised approval</div>
                  <div className="text-xs text-muted-foreground">
                    {type && needsApproval(type as DocType)
                      ? "Mandatory for this document type"
                      : "CEO or authorised management sign-off before sending"}
                  </div>
                </div>
                <Switch
                  checked={mustApprove}
                  disabled={!!type && needsApproval(type as DocType)}
                  onCheckedChange={setApprovalOn}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="text-sm">Allow employee download</div>
                <Switch checked={download} onCheckedChange={setDownload} />
              </div>

              {warn && (
                <Card className="border-destructive/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Required before issuing a warning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="space-y-1">
                      <Label className="text-xs">Reason</Label>
                      <Input value={warning.reason} onChange={(e) => setWarning({ ...warning, reason: e.target.value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Incident date</Label>
                        <Input value={warning.incidentDate} onChange={(e) => setWarning({ ...warning, incidentDate: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Review date</Label>
                        <Input value={warning.reviewDate} onChange={(e) => setWarning({ ...warning, reviewDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Policy or rule involved</Label>
                      <Input value={warning.policy} onChange={(e) => setWarning({ ...warning, policy: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Supporting evidence</Label>
                      <Textarea rows={2} value={warning.evidence} onChange={(e) => setWarning({ ...warning, evidence: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Previous related warnings</Label>
                      <Textarea
                        rows={2}
                        value={warning.previousWarnings}
                        placeholder={prevWarnings.length ? prevWarnings.map((p) => `${p.type} ${p.docNo}`).join("; ") : "None on record"}
                        onChange={(e) => setWarning({ ...warning, previousWarnings: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Expected corrective action</Label>
                      <Textarea rows={2} value={warning.correctiveAction} onChange={(e) => setWarning({ ...warning, correctiveAction: e.target.value })} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Warnings are never generated automatically from CRM performance data.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 4 && employee && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Review before issue</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Row k="Document number" v={nextDocNo(docs)} />
                <Row k="Employee" v={`${employee.name} · ${employee.empId}`} />
                <Row k="Department / Designation" v={`${employee.dept} · ${employee.designation}`} />
                <Row k="Document type" v={type} />
                <Row k="Template" v={tpl ? `${tpl.name} v${tpl.version}` : "Manual content"} />
                <Row k="Subject" v={subject} />
                <Row k="Effective date" v={effectiveDate} />
                <Row k="Response deadline" v={deadline} />
                <Row k="Confidentiality" v={conf} />
                <Row k="Approval" v={mustApprove ? "Required — CEO" : "Not required"} />
                <Row k="Download permitted" v={download ? "Yes" : "No"} />
                <pre className="mt-3 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">{content}</pre>
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <div className="space-y-3">
              {mustApprove ? (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
                  This document requires authorised approval. It will be submitted for approval and can only be sent
                  after it is approved.
                </div>
              ) : (
                <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                  The document will appear only on {employee?.name}&apos;s private dashboard. Once sent it cannot be
                  edited.
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => finish(false)}>
                  Save {mustApprove ? "and submit for approval" : "as draft"}
                </Button>
                {!mustApprove && (
                  <Button onClick={() => (warn ? setConfirmSend(true) : finish(true))}>
                    <Send className="mr-2 h-4 w-4" /> Send now
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button disabled={!canNext || step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>

        <Dialog open={confirmSend} onOpenChange={setConfirmSend}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm issue of disciplinary document</DialogTitle>
              <DialogDescription>
                Confirm that the reason, evidence and corrective action are complete and correct. This record cannot be
                edited or deleted afterwards.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmSend(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setConfirmSend(false);
                  finish(true);
                }}
              >
                Confirm and send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
