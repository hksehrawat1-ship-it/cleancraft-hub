import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Lock,
  MapPin,
  Plus,
  RotateCcw,
  ShieldAlert,
  Truck,
} from "lucide-react";
import {
  ACTION_OPTIONS,
  DISPATCH_OPTIONS,
  ISSUES,
  ISSUE_STATUS_LABEL,
  ISSUE_STATUS_TONE,
  ISSUE_TYPES,
  INVESTIGATION_POINTS,
  ITEM_TYPES,
  OWNERS,
  PLATFORMS,
  RESOLUTION_POINTS,
  RESPONSIBILITY,
  RETURN_REASONS,
  TODAY,
  type IssueRecord,
  type IssueStatus,
} from "./issues-data";

const TABS: { key: string; label: string; match: IssueStatus[] }[] = [
  { key: "new", label: "New", match: ["reported", "reopened"] },
  { key: "investigation", label: "Under Investigation", match: ["under_review", "investigation"] },
  { key: "action", label: "Action Required", match: ["action_approved", "info_required"] },
  { key: "replacement", label: "Replacement", match: ["replacement"] },
  { key: "return", label: "Return", match: ["return"] },
  { key: "claim", label: "Claim Pending", match: ["claim_pending"] },
  { key: "resolved", label: "Resolved", match: ["resolved"] },
  { key: "closed", label: "Closed", match: ["closed", "rejected", "cancelled"] },
  { key: "all", label: "All", match: [] },
];

const OPEN_STATUSES: IssueStatus[] = [
  "reported",
  "under_review",
  "investigation",
  "action_approved",
  "replacement",
  "return",
  "claim_pending",
  "info_required",
  "reopened",
];

const priorityTone = (p: IssueRecord["priority"]) =>
  p === "critical"
    ? "bg-red-950 text-white border-red-950"
    : p === "urgent"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : p === "high"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-muted text-muted-foreground border-border";

export function LogisticsIssuesReturns() {
  const [rows, setRows] = useState<IssueRecord[]>(ISSUES);
  const [tab, setTab] = useState("new");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const [fType, setFType] = useState("all");
  const [fProject, setFProject] = useState("all");
  const [fStore, setFStore] = useState("all");
  const [fDispatch, setFDispatch] = useState("");
  const [fPlatform, setFPlatform] = useState("all");
  const [fItem, setFItem] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fDate, setFDate] = useState("");

  const patch = (id: string, up: Partial<IssueRecord>, log?: { by: string; action: string }) =>
    setRows((prev) =>
      prev.map((r) =>
        r.issueId === id
          ? {
              ...r,
              ...up,
              history: log ? [...r.history, { at: `${TODAY} now`, by: log.by, action: log.action }] : r.history,
            }
          : r,
      ),
    );

  const counts = useMemo(() => {
    const c = (f: (r: IssueRecord) => boolean) => rows.filter(f).length;
    return {
      newIssues: c((r) => ["reported", "reopened"].includes(r.status)),
      critical: c((r) => r.priority === "critical" || r.machineLoss || r.wholeShipmentMissing),
      investigation: c((r) => ["under_review", "investigation"].includes(r.status)),
      returns: c((r) => r.status === "return"),
      replacements: c((r) => r.status === "replacement"),
      claims: c((r) => r.status === "claim_pending"),
      overdue: c((r) => OPEN_STATUSES.includes(r.status) && r.nextActionDue < TODAY),
    };
  }, [rows]);

  const alerts = useMemo(() => {
    const list: { tone: "dark" | "red" | "amber"; text: string }[] = [];
    const byTransporter: Record<string, number> = {};
    rows.forEach((r) => {
      if (OPEN_STATUSES.includes(r.status)) byTransporter[r.platform] = (byTransporter[r.platform] ?? 0) + 1;
      if (r.machineLoss) list.push({ tone: "dark", text: `${r.issueId} · Machine lost or seriously damaged (${r.store})` });
      if (r.wholeShipmentMissing) list.push({ tone: "dark", text: `${r.issueId} · Entire shipment missing on ${r.dispatchId}` });
      if (r.launchBlocked) list.push({ tone: "red", text: `${r.issueId} · Store launch blocked — ${r.store}` });
      if (r.owner === "Unassigned" && OPEN_STATUSES.includes(r.status))
        list.push({ tone: "red", text: `${r.issueId} · Issue without an owner` });
      if (["under_review", "investigation", "reported"].includes(r.status) && r.investigationDue < TODAY)
        list.push({ tone: "amber", text: `${r.issueId} · Investigation overdue since ${r.investigationDue}` });
      if (["Transport Damage", "Lost Shipment", "Missing Package"].includes(r.type) && !r.replacement && OPEN_STATUSES.includes(r.status))
        list.push({ tone: "amber", text: `${r.issueId} · Replacement not planned` });
      if (r.returnInfo && r.status === "return" && r.returnInfo.expectedPickup < TODAY)
        list.push({ tone: "red", text: `${r.issueId} · Return pickup delayed since ${r.returnInfo.expectedPickup}` });
      if (r.claim && r.claim.outcome === "Pending" && r.claim.expectedResolution <= "2026-08-10")
        list.push({ tone: "amber", text: `${r.issueId} · Claim deadline approaching (${r.claim.expectedResolution})` });
      if (r.reopened) list.push({ tone: "red", text: `${r.issueId} · Issue reopened — same Issue ID retained` });
    });
    Object.entries(byTransporter).forEach(([p, n]) => {
      if (n >= 2) list.push({ tone: "amber", text: `Repeat issues with the same transporter — ${p} (${n} open)` });
    });
    return list;
  }, [rows]);

  const filtered = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    return rows.filter((r) => {
      if (t.match.length && !t.match.includes(r.status)) return false;
      if (fType !== "all" && r.type !== fType) return false;
      if (fProject !== "all" && r.projectId !== fProject) return false;
      if (fStore !== "all" && r.store !== fStore) return false;
      if (fDispatch && !r.dispatchId.toLowerCase().includes(fDispatch.toLowerCase())) return false;
      if (fPlatform !== "all" && r.platform !== fPlatform) return false;
      if (fItem !== "all" && r.itemType !== fItem) return false;
      if (fPriority !== "all" && r.priority !== fPriority) return false;
      if (fOwner !== "all" && r.owner !== fOwner) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fDate && !r.reportedAt.startsWith(fDate)) return false;
      return true;
    });
  }, [rows, tab, fType, fProject, fStore, fDispatch, fPlatform, fItem, fPriority, fOwner, fStatus, fDate]);

  const open = rows.find((r) => r.issueId === openId) || null;
  if (open) return <IssueDetail record={open} onBack={() => setOpenId(null)} patch={patch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Issues &amp; Returns</h2>
          <p className="text-sm text-muted-foreground">
            Manage delays, damage, missing items, refused deliveries, replacements, returns and transport claims.
          </p>
        </div>
        <Button onClick={() => setReportOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Report Issue
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <Kpi label="New Issues" value={counts.newIssues} tone="red" />
        <Kpi label="Critical Issues" value={counts.critical} tone="dark" />
        <Kpi label="Investigation Pending" value={counts.investigation} tone="amber" />
        <Kpi label="Returns in Progress" value={counts.returns} tone="blue" />
        <Kpi label="Replacements Pending" value={counts.replacements} tone="blue" />
        <Kpi label="Claims Pending" value={counts.claims} tone="amber" />
        <Kpi label="Overdue Issues" value={counts.overdue} tone="red" />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-md border px-3 py-2 text-sm ${
                  a.tone === "dark"
                    ? "border-red-950 bg-red-950 text-white"
                    : a.tone === "red"
                      ? "border-destructive/20 bg-destructive/10 text-destructive"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">
              {t.label}
              <span className="ml-1 text-muted-foreground">
                ({t.match.length ? rows.filter((r) => t.match.includes(r.status)).length : rows.length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Issue type" value={fType} onChange={setFType} options={ISSUE_TYPES} />
          <FilterSelect label="Franchise project" value={fProject} onChange={setFProject} options={[...new Set(rows.map((r) => r.projectId))]} />
          <FilterSelect label="Store" value={fStore} onChange={setFStore} options={[...new Set(rows.map((r) => r.store))]} />
          <div className="space-y-1">
            <Label className="text-xs">Dispatch ID</Label>
            <Input placeholder="DSP-…" value={fDispatch} onChange={(e) => setFDispatch(e.target.value)} />
          </div>
          <FilterSelect label="Transport platform" value={fPlatform} onChange={setFPlatform} options={PLATFORMS} />
          <FilterSelect label="Item type" value={fItem} onChange={setFItem} options={ITEM_TYPES} />
          <FilterSelect label="Priority" value={fPriority} onChange={setFPriority} options={["critical", "urgent", "high", "normal"]} />
          <FilterSelect label="Responsible party" value={fOwner} onChange={setFOwner} options={OWNERS} />
          <FilterSelect
            label="Issue status"
            value={fStatus}
            onChange={setFStatus}
            options={Object.keys(ISSUE_STATUS_LABEL)}
            render={(k) => ISSUE_STATUS_LABEL[k as IssueStatus]}
          />
          <div className="space-y-1">
            <Label className="text-xs">Created date</Label>
            <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((r) => (
          <IssueCard key={r.issueId} record={r} onOpen={() => setOpenId(r.issueId)} />
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No issues in this view.</p>}
      </div>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        existing={rows}
        onCreate={(rec) => {
          setRows((prev) => [rec, ...prev]);
          toast.success(`${rec.issueId} created and linked to ${rec.dispatchId}`);
        }}
      />
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "blue" | "amber" | "red" | "dark" }) {
  const cls =
    tone === "dark"
      ? "text-red-950"
      : tone === "red"
        ? "text-destructive"
        : tone === "amber"
          ? "text-amber-600"
          : tone === "blue"
            ? "text-primary"
            : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{render ? render(o) : o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function IssueCard({ record, onOpen }: { record: IssueRecord; onOpen: () => void }) {
  const critical = record.priority === "critical" || record.machineLoss;
  return (
    <Card className={critical ? "border-red-950/60" : record.nextActionDue < TODAY ? "border-destructive/40" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{record.issueId}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {record.dispatchId} · {record.clearanceId} · {record.projectId}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className={priorityTone(record.priority)}>{record.priority}</Badge>
            <Badge variant="outline" className={ISSUE_STATUS_TONE[record.status]}>{ISSUE_STATUS_LABEL[record.status]}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {record.store} · {record.city}</span>
          <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> {record.platform}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Issue type</p>
            <p className="font-medium">{record.type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Item affected</p>
            <p className="font-medium">{record.itemAffected}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reported</p>
            <p className="font-medium">{record.reportedAt}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Responsible person</p>
            <p className={`font-medium ${record.owner === "Unassigned" ? "text-destructive" : ""}`}>{record.owner}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onOpen}>View Issue</Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- Detail view ------------------------------ */

function IssueDetail({
  record,
  onBack,
  patch,
}: {
  record: IssueRecord;
  onBack: () => void;
  patch: (id: string, up: Partial<IssueRecord>, log?: { by: string; action: string }) => void;
}) {
  const [inv, setInv] = useState<Record<string, boolean>>(record.investigation);
  const [note, setNote] = useState("");
  const [resp, setResp] = useState(record.responsibility);
  const [owner, setOwner] = useState(record.owner);

  const [action, setAction] = useState(ACTION_OPTIONS[0]);
  const [actionOpen, setActionOpen] = useState(false);

  // replacement
  const [rItems, setRItems] = useState("");
  const [rQty, setRQty] = useState("1");
  const [rApprover, setRApprover] = useState("Logistics Manager");
  const [rCost, setRCost] = useState("Transporter claim (pending outcome)");
  const [rDate, setRDate] = useState("");

  // return
  const [tItems, setTItems] = useState("");
  const [tQty, setTQty] = useState("1");
  const [tReason, setTReason] = useState(RETURN_REASONS[0]);
  const [tAuth, setTAuth] = useState("");
  const [tPickupAddr, setTPickupAddr] = useState(record.store);
  const [tDest, setTDest] = useState("Clean Craft central warehouse, Delhi");
  const [tPlatform, setTPlatform] = useState(record.platform);
  const [tBooking, setTBooking] = useState("");
  const [tPickupDate, setTPickupDate] = useState("");

  // claim
  const [cPlatform, setCPlatform] = useState(record.platform);
  const [cRef, setCRef] = useState("");
  const [cDate, setCDate] = useState(TODAY);
  const [cExpected, setCExpected] = useState("");

  // misc actions
  const [infoText, setInfoText] = useState("");
  const [schedDate, setSchedDate] = useState("");
  const [escalateNote, setEscalateNote] = useState("");

  // resolution
  const [resOpen, setResOpen] = useState(false);
  const [resChecks, setResChecks] = useState<Record<string, boolean>>({});
  const [rootCause, setRootCause] = useState("");
  const [actionDone, setActionDone] = useState("");
  const [preventive, setPreventive] = useState("");
  const [evidence, setEvidence] = useState("");
  const resReady =
    RESOLUTION_POINTS.filter((p) => p.key !== "coordinator" || record.launchImpact !== "No launch impact").every(
      (p) => resChecks[p.key],
    ) && !!rootCause && !!actionDone && !!preventive;

  const applyAction = () => {
    if (action === "Arrange Replacement") {
      const rid = `${record.dispatchId}-R`;
      patch(
        record.issueId,
        {
          status: "replacement",
          replacement: {
            items: rItems,
            qty: Number(rQty || 1),
            approvedBy: rApprover,
            costResponsibility: rCost,
            newPackingTaskId: `PKT-0002${Math.floor(50 + Math.random() * 40)}`,
            requiredDispatchDate: rDate,
            replacementDispatchId: rid,
          },
        },
        {
          by: "Logistics Executive",
          action: `Replacement arranged. Linked replacement dispatch ${rid} references original ${record.dispatchId} and ${record.issueId}. Accounts Manager informed of possible financial adjustment.`,
        },
      );
    } else if (action === "Initiate Return") {
      patch(
        record.issueId,
        {
          status: "return",
          returnInfo: {
            items: tItems,
            qty: Number(tQty || 1),
            reason: tReason,
            authRef: tAuth,
            pickupAddress: tPickupAddr,
            destination: tDest,
            platform: tPlatform,
            bookingRef: tBooking,
            expectedPickup: tPickupDate,
            conditionOnReturn: "To be recorded on pickup",
            completionProof: "Pending",
          },
        },
        { by: "Logistics Executive", action: `Return initiated under ${record.issueId}. Original item and delivery history preserved on ${record.dispatchId}.` },
      );
    } else if (action === "Raise Transport Claim") {
      patch(
        record.issueId,
        {
          status: "claim_pending",
          claim: {
            platform: cPlatform,
            claimRef: cRef,
            claimDate: cDate,
            documents: ["Damage photos", "Booking document", "Recipient statement"],
            status: "Submitted — awaiting platform review",
            expectedResolution: cExpected,
            outcome: "Pending",
          },
        },
        { by: "Logistics Executive", action: `Transport claim ${cRef} raised on ${cPlatform}. External claim handling stays on the transport platform.` },
      );
    } else if (action === "Request More Information") {
      patch(record.issueId, { status: "info_required" }, { by: "Logistics Executive", action: `Information requested: ${infoText}` });
    } else if (action === "Correct Packing") {
      patch(record.issueId, { status: "action_approved" }, {
        by: "Logistics Executive",
        action: `Verified packing correction task issued to Packing Staff for ${record.packingTaskId}. Staff see only the verified correction.`,
      });
    } else if (action === "Update Delivery Schedule") {
      patch(record.issueId, { status: "action_approved", nextActionDue: schedDate }, {
        by: "Logistics Executive",
        action: `Delivery schedule updated to ${schedDate}. Project Coordinator informed of revised timing.`,
      });
    } else if (action === "Escalate to Management") {
      patch(record.issueId, { status: "action_approved", priority: "critical" }, {
        by: "Logistics Executive",
        action: `Escalated to management — ${escalateNote}`,
      });
    } else if (action === "Resolve Issue") {
      setActionOpen(false);
      setResOpen(true);
      return;
    }
    setActionOpen(false);
    toast.success(`${action} recorded on ${record.issueId}`);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues &amp; Returns
      </Button>

      {(record.machineLoss || record.wholeShipmentMissing || record.launchBlocked) && (
        <div className="flex items-center gap-2 rounded-md border border-red-950 bg-red-950 px-4 py-3 text-sm text-white">
          <ShieldAlert className="h-4 w-4" />
          {record.machineLoss && "Machine lost or seriously damaged. "}
          {record.wholeShipmentMissing && "Entire shipment missing. "}
          {record.launchBlocked && "Store launch is blocked."}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>{record.issueId}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {record.store} · {record.city} · {record.dispatchId} · {record.clearanceId} · {record.projectId} · Packing {record.packingTaskId}
              </p>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className={priorityTone(record.priority)}>{record.priority}</Badge>
              <Badge variant="outline" className={ISSUE_STATUS_TONE[record.status]}>{ISSUE_STATUS_LABEL[record.status]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-4">
          <Field label="Issue type" value={record.type} />
          <Field label="Item affected" value={record.itemAffected} />
          <Field label="Package" value={record.packageNo} />
          <Field label="Quantity affected" value={String(record.qtyAffected)} />
          <Field label="Transport platform" value={record.platform} />
          <Field label="Booking reference" value={record.bookingRef} />
          <Field label="AWB / LR" value={record.awb} />
          <Field label="Reported by" value={`${record.reportedBy} · ${record.reportedAt}`} />
          <Field label="Responsible person" value={record.owner} />
          <Field label="Next action due" value={record.nextActionDue} />
          <Field label="Project launch" value={record.launchDate} />
          <Field label="Launch impact" value={record.launchImpact} />
          <div className="sm:col-span-4">
            <p className="text-xs text-muted-foreground">Description</p>
            <p>{record.description}</p>
          </div>
          <div className="sm:col-span-4">
            <p className="text-xs text-muted-foreground">Immediate action taken</p>
            <p>{record.immediateAction}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Evidence</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: record.photos }).map((_, i) => (
              <div key={i} className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
            {record.photos === 0 && <span className="text-xs text-muted-foreground">No photographs attached</span>}
          </div>
          {record.documents.map((d) => (
            <p key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> {d}
            </p>
          ))}
          <Separator />
          <Field label="Packing evidence" value={record.packingEvidence} />
          <Field label="Dispatch evidence" value={record.dispatchEvidence} />
          <Field label="Delivery evidence" value={record.deliveryEvidence} />
          <Field label="Recipient comments" value={record.recipientComments ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Investigation</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            {INVESTIGATION_POINTS.map((p) => (
              <label key={p.key} className="flex items-center gap-2">
                <Checkbox checked={!!inv[p.key]} onCheckedChange={(v) => setInv((s) => ({ ...s, [p.key]: !!v }))} />
                {p.label}
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Provisional responsibility</Label>
              <Select value={resp} onValueChange={setResp}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RESPONSIBILITY.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Provisional only. No employee is blamed or penalised before investigation and manager approval.
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Issue owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Add investigation note (history is never overwritten)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button
            size="sm"
            onClick={() => {
              patch(
                record.issueId,
                {
                  investigation: inv,
                  responsibility: resp,
                  owner,
                  status: record.status === "reported" ? "investigation" : record.status,
                  investigationNotes: note
                    ? [...record.investigationNotes, { at: `${TODAY} now`, by: "Logistics Executive", note }]
                    : record.investigationNotes,
                },
                {
                  by: "Logistics Executive",
                  action: `Investigation updated. Provisional responsibility: ${resp} (awaiting manager approval). Owner: ${owner}.`,
                },
              );
              setNote("");
              toast.success("Investigation updated");
            }}
          >
            Save investigation
          </Button>

          {record.investigationNotes.length > 0 && (
            <div className="space-y-2">
              {record.investigationNotes.map((n, i) => (
                <div key={i} className="rounded-md border px-3 py-2">
                  <p className="text-xs text-muted-foreground">{n.at} · {n.by}</p>
                  <p>{n.note}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Responsibility approved by manager: {record.responsibilityApproved ? "Yes" : "Not yet"}
          </p>
        </CardContent>
      </Card>

      {record.replacement && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2"><CardTitle className="text-base text-primary">Replacement</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="Replacement items" value={record.replacement.items} />
            <Field label="Quantity" value={String(record.replacement.qty)} />
            <Field label="Approval authority" value={record.replacement.approvedBy} />
            <Field label="Cost responsibility" value={record.replacement.costResponsibility} />
            <Field label="New packing task" value={record.replacement.newPackingTaskId} />
            <Field label="Required dispatch date" value={record.replacement.requiredDispatchDate} />
            <Field label="Replacement Dispatch ID" value={record.replacement.replacementDispatchId} />
            <Field label="Original Dispatch ID" value={record.dispatchId} />
          </CardContent>
        </Card>
      )}

      {record.returnInfo && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2"><CardTitle className="text-base text-primary">Return</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="Items to be returned" value={record.returnInfo.items} />
            <Field label="Quantity" value={String(record.returnInfo.qty)} />
            <Field label="Return reason" value={record.returnInfo.reason} />
            <Field label="Return-authorisation reference" value={record.returnInfo.authRef} />
            <Field label="Pickup address" value={record.returnInfo.pickupAddress} />
            <Field label="Return destination" value={record.returnInfo.destination} />
            <Field label="Transport platform" value={record.returnInfo.platform} />
            <Field label="Booking reference" value={record.returnInfo.bookingRef} />
            <Field label="Expected pickup" value={record.returnInfo.expectedPickup} />
            <Field label="Condition on return" value={record.returnInfo.conditionOnReturn} />
            <Field label="Return completion proof" value={record.returnInfo.completionProof} />
          </CardContent>
        </Card>
      )}

      {record.claim && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-base text-amber-700">Transport claim</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="Transport platform" value={record.claim.platform} />
            <Field label="Claim reference" value={record.claim.claimRef} />
            <Field label="Claim date" value={record.claim.claimDate} />
            <Field label="Current claim status" value={record.claim.status} />
            <Field label="Expected resolution" value={record.claim.expectedResolution} />
            <Field label="Final outcome" value={record.claim.outcome} />
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {record.claim.platform} remains the official platform for external claim handling.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {record.resolution && (
        <Card className="border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-700">Resolution</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="Root cause" value={record.resolution.rootCause} />
            <Field label="Action completed" value={record.resolution.actionCompleted} />
            <Field label="Replacement / return status" value={record.resolution.replacementOrReturnStatus} />
            <Field label="Recipient confirmation" value={record.resolution.recipientConfirmation} />
            <Field label="Project Coordinator confirmation" value={record.resolution.coordinatorConfirmation} />
            <Field label="Preventive action" value={record.resolution.preventiveAction} />
            <Field label="Resolution date" value={record.resolution.resolvedOn} />
            <Field label="Resolution evidence" value={record.resolution.evidence} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={["closed", "cancelled", "rejected"].includes(record.status)} onClick={() => setActionOpen(true)}>
            Take action
          </Button>
          <Button
            variant="outline"
            disabled={record.status !== "resolved"}
            onClick={() => {
              patch(record.issueId, { status: "closed" }, {
                by: "Logistics Manager",
                action: "Issue closed. Investigation and resolution history preserved.",
              });
              toast.success("Issue closed");
            }}
          >
            Close issue
          </Button>
          <Button
            variant="outline"
            disabled={!["resolved", "closed"].includes(record.status)}
            onClick={() => {
              patch(record.issueId, { status: "reopened", reopened: true }, {
                by: "Logistics Executive",
                action: "Issue reopened on the same Issue ID. Previous history preserved.",
              });
              toast.success("Issue reopened");
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reopen
          </Button>
          <Button
            variant="destructive"
            disabled={["closed", "cancelled"].includes(record.status)}
            onClick={() => {
              patch(record.issueId, { status: "cancelled" }, { by: "Logistics Executive", action: "Issue cancelled — duplicate or reported in error. History preserved." });
              toast.success("Issue cancelled");
            }}
          >
            Cancel issue
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Activity history</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {record.history.map((h, i) => (
            <div key={i} className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">{h.at} · {h.by}</p>
              <p>{h.action}</p>
            </div>
          ))}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Customer, financial and transporter commercial details stay restricted.
            Packing Staff see only verified packing corrections.
          </p>
        </CardContent>
      </Card>

      {/* Action dialog */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Action — {record.issueId}</DialogTitle>
            <DialogDescription>
              Every action stays on the same Issue ID and keeps the original Dispatch, Clearance and Project links.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Action option</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACTION_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {action === "Arrange Replacement" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Replacement items" value={rItems} onChange={setRItems} />
                <TextField label="Quantities" value={rQty} onChange={setRQty} />
                <TextField label="Approval authority" value={rApprover} onChange={setRApprover} />
                <TextField label="Cost responsibility" value={rCost} onChange={setRCost} />
                <div className="space-y-1">
                  <Label className="text-xs">New required dispatch date</Label>
                  <Input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reference to original Dispatch ID</Label>
                  <Input value={record.dispatchId} readOnly />
                </div>
              </div>
            )}

            {action === "Initiate Return" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Items to be returned" value={tItems} onChange={setTItems} />
                <TextField label="Quantities" value={tQty} onChange={setTQty} />
                <div className="space-y-1">
                  <Label className="text-xs">Return reason</Label>
                  <Select value={tReason} onValueChange={setTReason}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RETURN_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <TextField label="Return-authorisation reference" value={tAuth} onChange={setTAuth} />
                <TextField label="Pickup address" value={tPickupAddr} onChange={setTPickupAddr} />
                <TextField label="Return destination" value={tDest} onChange={setTDest} />
                <div className="space-y-1">
                  <Label className="text-xs">Transport platform</Label>
                  <Select value={tPlatform} onValueChange={setTPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <TextField label="Booking reference" value={tBooking} onChange={setTBooking} />
                <div className="space-y-1">
                  <Label className="text-xs">Expected pickup date</Label>
                  <Input type="date" value={tPickupDate} onChange={(e) => setTPickupDate(e.target.value)} />
                </div>
              </div>
            )}

            {action === "Raise Transport Claim" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Transport platform</Label>
                  <Select value={cPlatform} onValueChange={setCPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <TextField label="Claim reference" value={cRef} onChange={setCRef} />
                <div className="space-y-1">
                  <Label className="text-xs">Claim date</Label>
                  <Input type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Expected resolution date</Label>
                  <Input type="date" value={cExpected} onChange={(e) => setCExpected(e.target.value)} />
                </div>
                <p className="sm:col-span-2 text-xs text-muted-foreground">
                  Supporting documents are attached as placeholders. External claim filing stays on the transport platform.
                </p>
              </div>
            )}

            {action === "Request More Information" && (
              <Textarea value={infoText} onChange={(e) => setInfoText(e.target.value)} placeholder="What information is needed and from whom?" />
            )}

            {action === "Correct Packing" && (
              <p className="rounded-md border bg-muted/40 p-3 text-sm">
                A verified packing correction task will be issued for {record.packingTaskId}. Packing Staff receive
                correction tasks only after the issue is verified.
              </p>
            )}

            {action === "Update Delivery Schedule" && (
              <div className="space-y-1">
                <Label className="text-xs">New expected delivery date</Label>
                <Input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
              </div>
            )}

            {action === "Escalate to Management" && (
              <Textarea value={escalateNote} onChange={(e) => setEscalateNote(e.target.value)} placeholder="Reason for escalation" />
            )}

            {action === "Resolve Issue" && (
              <p className="rounded-md border bg-muted/40 p-3 text-sm">
                Resolution requires root cause, completed action, replacement/return status, recipient confirmation,
                preventive action and evidence. Continue to the resolution form.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              disabled={
                (action === "Arrange Replacement" && (!rItems || !rDate)) ||
                (action === "Initiate Return" && (!tItems || !tAuth || !tPickupDate)) ||
                (action === "Raise Transport Claim" && (!cRef || !cExpected)) ||
                (action === "Request More Information" && !infoText.trim()) ||
                (action === "Update Delivery Schedule" && !schedDate) ||
                (action === "Escalate to Management" && !escalateNote.trim())
              }
              onClick={applyAction}
            >
              {action === "Resolve Issue" ? "Continue" : "Record action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolution dialog */}
      <Dialog open={resOpen} onOpenChange={setResOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resolve issue — {record.issueId}</DialogTitle>
            <DialogDescription>All points must be confirmed before the issue can be resolved.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              {RESOLUTION_POINTS.map((p) => (
                <label key={p.key} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={!!resChecks[p.key]} onCheckedChange={(v) => setResChecks((s) => ({ ...s, [p.key]: !!v }))} />
                  {p.label}
                </label>
              ))}
            </div>
            <Separator />
            <div className="space-y-1">
              <Label className="text-xs">Root cause</Label>
              <Textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Action completed</Label>
              <Textarea value={actionDone} onChange={(e) => setActionDone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Preventive action</Label>
              <Textarea value={preventive} onChange={(e) => setPreventive(e.target.value)} />
            </div>
            <TextField label="Resolution evidence" value={evidence} onChange={setEvidence} />
          </div>
          <DialogFooter>
            <Button
              disabled={!resReady}
              onClick={() => {
                patch(
                  record.issueId,
                  {
                    status: "resolved",
                    resolution: {
                      rootCause,
                      actionCompleted: actionDone,
                      replacementOrReturnStatus: record.replacement
                        ? "Replacement completed"
                        : record.returnInfo
                          ? "Return completed"
                          : "Not required",
                      recipientConfirmation: "Recorded",
                      coordinatorConfirmation:
                        record.launchImpact === "No launch impact" ? "Not required" : "Confirmed by Project Coordinator",
                      preventiveAction: preventive,
                      resolvedOn: TODAY,
                      evidence: evidence || "Attached placeholders",
                    },
                  },
                  { by: "Logistics Executive", action: "Issue resolved with root cause, evidence and preventive action recorded." },
                );
                setResOpen(false);
                toast.success("Issue resolved");
              }}
            >
              Resolve issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ------------------------------ Report dialog ----------------------------- */

function ReportDialog({
  open,
  onOpenChange,
  onCreate,
  existing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (r: IssueRecord) => void;
  existing: IssueRecord[];
}) {
  const [dispatchId, setDispatchId] = useState("");
  const [type, setType] = useState(ISSUE_TYPES[0]);
  const [item, setItem] = useState("");
  const [pkg, setPkg] = useState("");
  const [itemType, setItemType] = useState(ITEM_TYPES[0]);
  const [qty, setQty] = useState("1");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssueRecord["priority"]>("high");
  const [photos, setPhotos] = useState(0);
  const [docs, setDocs] = useState(0);
  const [immediate, setImmediate] = useState("");
  const [impact, setImpact] = useState("");
  const [owner, setOwner] = useState(OWNERS[0]);
  const [next, setNext] = useState("");
  const [nextDue, setNextDue] = useState("");

  const source = DISPATCH_OPTIONS.find((d) => d.dispatchId === dispatchId);
  const duplicate = !!source && existing.some((e) => e.dispatchId === dispatchId && e.type === type && OPEN_STATUSES.includes(e.status));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report issue</DialogTitle>
          <DialogDescription>
            The issue is linked to the original Dispatch, Clearance and Project records. Duplicate issues for the same
            event are not allowed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Related Dispatch ID</Label>
            <Select value={dispatchId} onValueChange={setDispatchId}>
              <SelectTrigger><SelectValue placeholder="Select dispatch" /></SelectTrigger>
              <SelectContent>
                {DISPATCH_OPTIONS.map((d) => (
                  <SelectItem key={d.dispatchId} value={d.dispatchId}>
                    {d.dispatchId} · {d.store} · {d.projectId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {source && (
            <div className="rounded-md border p-3 text-sm">
              <p><span className="text-muted-foreground">Clearance:</span> {source.clearanceId}</p>
              <p><span className="text-muted-foreground">Project:</span> {source.projectId}</p>
              <p><span className="text-muted-foreground">Packing task:</span> {source.packingTaskId}</p>
              <p><span className="text-muted-foreground">Transport:</span> {source.platform} · {source.awb}</p>
            </div>
          )}

          {duplicate && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> An open issue of this type already exists for this dispatch. Add the
              complaint to the existing Issue ID instead.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Issue type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ISSUE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as IssueRecord["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["critical", "urgent", "high", "normal"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <TextField label="Item affected" value={item} onChange={setItem} />
            <TextField label="Package affected" value={pkg} onChange={setPkg} />
            <div className="space-y-1">
              <Label className="text-xs">Item type</Label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ITEM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <TextField label="Quantity affected" value={qty} onChange={setQty} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setPhotos((p) => p + 1)}>
              <Camera className="mr-2 h-4 w-4" /> Add photograph ({photos})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDocs((d) => d + 1)}>
              <FileText className="mr-2 h-4 w-4" /> Add supporting document ({docs})
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Immediate action taken" value={immediate} onChange={setImmediate} />
            <TextField label="Project-launch impact" value={impact} onChange={setImpact} />
            <div className="space-y-1">
              <Label className="text-xs">Responsible person</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <TextField label="Next action" value={next} onChange={setNext} />
            <div className="space-y-1">
              <Label className="text-xs">Next action due date</Label>
              <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={!source || duplicate || !description.trim() || !nextDue}
            onClick={() => {
              if (!source) return;
              const id = `ISS-0${460 + existing.length}`;
              onCreate({
                issueId: id,
                dispatchId: source.dispatchId,
                clearanceId: source.clearanceId,
                projectId: source.projectId,
                packingTaskId: source.packingTaskId,
                store: source.store,
                city: source.city,
                platform: source.platform,
                bookingRef: source.bookingRef,
                awb: source.awb,
                type,
                itemAffected: item || "To be confirmed",
                packageNo: pkg || "—",
                itemType,
                qtyAffected: Number(qty || 1),
                description,
                reportedBy: "Logistics Executive",
                reportedAt: `${TODAY} now`,
                priority,
                status: "reported",
                owner,
                responsibility: "Unconfirmed",
                responsibilityApproved: false,
                photos,
                documents: Array.from({ length: docs }).map((_, i) => `Supporting document ${i + 1} (placeholder)`),
                packingEvidence: `${source.packingTaskId} · packing record linked`,
                dispatchEvidence: `${source.awb} · ${source.platform}`,
                deliveryEvidence: `${source.dispatchId} · delivery record linked`,
                investigation: {},
                investigationNotes: [],
                investigationDue: nextDue,
                immediateAction: immediate || "—",
                launchImpact: impact || "No launch impact",
                launchDate: source.launchDate,
                nextAction: next || "Assign and investigate",
                nextActionDue: nextDue,
                machineLoss: type === "Lost Shipment" && itemType.includes("Machine"),
                wholeShipmentMissing: type === "Lost Shipment",
                launchBlocked: !!impact && priority === "critical",
                reopened: false,
                financialAdjustment: ["Transport Damage", "Lost Shipment", "Missing Package", "Delivery Refused"].includes(type),
                history: [
                  {
                    at: `${TODAY} now`,
                    by: "Logistics Executive",
                    action: `Issue ${id} reported — ${type} on ${source.dispatchId} (Clearance ${source.clearanceId}, Project ${source.projectId}). Packing, dispatch and delivery evidence linked.`,
                  },
                ],
              });
              onOpenChange(false);
            }}
          >
            Report issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
