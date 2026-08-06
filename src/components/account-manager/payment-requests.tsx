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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHead, StatCard } from "@/components/smm/ui";
import { toast } from "sonner";
import { AlertTriangle, FilePlus2, Search, ShieldCheck } from "lucide-react";

const MANAGER = "Priya Nair";

const PAYMENT_TYPES = [
  "Franchise Fee",
  "Machine Payment",
  "Consumables Payment",
  "Training Fee",
  "App or POS Fee",
  "Security Deposit",
  "Other Approved Charge",
] as const;
type PaymentType = (typeof PAYMENT_TYPES)[number];

type ReqStatus =
  | "Draft"
  | "New"
  | "Under Review"
  | "Information Required"
  | "Accepted"
  | "Returned"
  | "Cancelled";

type Priority = "Normal" | "Important" | "Urgent";

type Hist = { at: string; by: string; action: string };

type PReq = {
  id: string;
  projectId: string;
  store: string;
  owner: string;
  mobileMasked: string;
  emailMasked: string;
  city: string;
  state: string;
  coordinator: string;
  type: PaymentType;
  purpose: string;
  items: string;
  amount: number;
  taxRef: string;
  due: string;
  clearanceType: "Machine Dispatch" | "Consumable Dispatch" | "Not Required";
  launchDate: string;
  quotation: string;
  instructions: string;
  priority: Priority;
  status: ReqStatus;
  submitted: string;
  pendingDays: number;
  amountMissing?: boolean;
  approvalMissing?: boolean;
  contactMissing?: boolean;
  responseOverdue?: boolean;
  acceptance?: {
    by: string;
    amount: number;
    due: string;
    vyapar: string;
    instructions: string;
    firstFollowUp: string;
    clearanceRequired: boolean;
  };
  history: Hist[];
};

const SEED: PReq[] = [
  {
    id: "PAY-3101", projectId: "PRJ-JAI-07", store: "Clean Craft Jaipur", owner: "Rajesh Agarwal",
    mobileMasked: "+91 98XXXXXX21", emailMasked: "raj****@gmail.com", city: "Jaipur", state: "Rajasthan",
    coordinator: "Rahul Sharma", type: "Machine Payment",
    purpose: "60% machine advance before dispatch",
    items: "Washer 25kg x1, Dryer 20kg x1, Steam Iron x2, Boiler x1",
    amount: 750000, taxRef: "GST 18% — as per quotation QT-4412", due: "4 Aug 2026",
    clearanceType: "Machine Dispatch", launchDate: "22 Aug 2026", quotation: "QT-4412 (approved by COO)",
    instructions: "Dispatch is blocked until this advance is verified.",
    priority: "Urgent", status: "New", submitted: "3 Aug 2026", pendingDays: 1,
    history: [{ at: "3 Aug 10:12", by: "Rahul Sharma", action: "Request submitted to Accounts" }],
  },
  {
    id: "PAY-3107", projectId: "PRJ-KNP-06", store: "Clean Craft Kanpur", owner: "Shalini Verma",
    mobileMasked: "+91 95XXXXXX12", emailMasked: "sha****@outlook.com", city: "Kanpur", state: "Uttar Pradesh",
    coordinator: "Suresh Patel", type: "Franchise Fee",
    purpose: "Franchise booking amount", items: "Not applicable", amount: 300000,
    taxRef: "GST 18% — franchise agreement clause 4", due: "6 Aug 2026",
    clearanceType: "Not Required", launchDate: "30 Sep 2026", quotation: "Signed agreement copy missing",
    instructions: "Owner requested payment link on registered email.",
    priority: "Important", status: "Information Required", submitted: "2 Aug 2026", pendingDays: 2,
    approvalMissing: true, responseOverdue: true,
    history: [
      { at: "2 Aug 09:00", by: "Suresh Patel", action: "Request submitted" },
      { at: "2 Aug 15:00", by: MANAGER, action: "Asked for information — approval or quotation missing" },
    ],
  },
  {
    id: "PAY-3109", projectId: "PRJ-BLR-11", store: "Clean Craft Whitefield", owner: "Anand Kumar",
    mobileMasked: "+91 99XXXXXX43", emailMasked: "ana****@gmail.com", city: "Bengaluru", state: "Karnataka",
    coordinator: "Neha Gupta", type: "Consumables Payment",
    purpose: "Opening consumables and packaging kit",
    items: "Detergent 200L, Hangers 1500, Poly covers 3000, Tags 5000",
    amount: 168000, taxRef: "GST 18% — QT-4498", due: "9 Aug 2026",
    clearanceType: "Consumable Dispatch", launchDate: "5 Sep 2026", quotation: "QT-4498",
    instructions: "Deliver along with machine consignment.",
    priority: "Normal", status: "Under Review", submitted: "1 Aug 2026", pendingDays: 3,
    history: [
      { at: "1 Aug 11:20", by: "Neha Gupta", action: "Request submitted" },
      { at: "2 Aug 10:05", by: MANAGER, action: "Review started" },
    ],
  },
  {
    id: "PAY-3110", projectId: "PRJ-PUN-08", store: "Clean Craft Kothrud", owner: "Snehal Kulkarni",
    mobileMasked: "+91 90XXXXXX18", emailMasked: "sne****@yahoo.com", city: "Pune", state: "Maharashtra",
    coordinator: "Anita Rao", type: "Security Deposit",
    purpose: "Refundable security deposit as per agreement", items: "Not applicable",
    amount: 100000, taxRef: "Not taxable — refundable deposit", due: "12 Aug 2026",
    clearanceType: "Not Required", launchDate: "18 Sep 2026", quotation: "Agreement clause 9",
    instructions: "Deposit to be shown separately in Vyapar.", priority: "Normal",
    status: "New", submitted: "3 Aug 2026", pendingDays: 1, contactMissing: false,
    history: [{ at: "3 Aug 16:40", by: "Anita Rao", action: "Request submitted" }],
  },
  {
    id: "PAY-3111", projectId: "PRJ-JAI-07", store: "Clean Craft Jaipur", owner: "Rajesh Agarwal",
    mobileMasked: "+91 98XXXXXX21", emailMasked: "raj****@gmail.com", city: "Jaipur", state: "Rajasthan",
    coordinator: "Rahul Sharma", type: "Machine Payment",
    purpose: "Machine advance (re-submitted)", items: "Washer 25kg x1, Dryer 20kg x1, Steam Iron x2, Boiler x1",
    amount: 750000, taxRef: "GST 18% — QT-4412", due: "4 Aug 2026",
    clearanceType: "Machine Dispatch", launchDate: "22 Aug 2026", quotation: "QT-4412",
    instructions: "", priority: "Urgent", status: "New", submitted: "4 Aug 2026", pendingDays: 0,
    history: [{ at: "4 Aug 09:05", by: "Rahul Sharma", action: "Request submitted" }],
  },
  {
    id: "PAY-3103", projectId: "PRJ-LKO-02", store: "Clean Craft Lucknow", owner: "Sunil Mishra",
    mobileMasked: "+91 99XXXXXX08", emailMasked: "sun****@gmail.com", city: "Lucknow", state: "Uttar Pradesh",
    coordinator: "Rahul Sharma", type: "Machine Payment",
    purpose: "Machine balance before dispatch", items: "Washer 15kg x1, Dryer 15kg x1",
    amount: 520000, taxRef: "GST 18% — QT-4380", due: "3 Aug 2026",
    clearanceType: "Machine Dispatch", launchDate: "16 Aug 2026", quotation: "QT-4380",
    instructions: "", priority: "Important", status: "Accepted", submitted: "24 Jul 2026", pendingDays: 0,
    acceptance: {
      by: MANAGER, amount: 520000, due: "3 Aug 2026", vyapar: "VY-INV-2277",
      instructions: "RTGS to Clean Craft current account (masked).",
      firstFollowUp: "29 Jul 2026", clearanceRequired: true,
    },
    history: [
      { at: "24 Jul 10:00", by: "Rahul Sharma", action: "Request submitted" },
      { at: "24 Jul 15:00", by: MANAGER, action: "Request accepted — moved to Follow-ups & Verification" },
    ],
  },
  {
    id: "PAY-3096", projectId: "PRJ-AGR-01", store: "Clean Craft Agra", owner: "Deepa Chauhan",
    mobileMasked: "+91 97XXXXXX72", emailMasked: "dee****@gmail.com", city: "Agra", state: "Uttar Pradesh",
    coordinator: "Deepak Yadav", type: "Training Fee",
    purpose: "Owner training batch — cancelled batch", items: "Not applicable", amount: 85000,
    taxRef: "GST 18%", due: "20 Jul 2026", clearanceType: "Not Required", launchDate: "10 Aug 2026",
    quotation: "TRN-221", instructions: "", priority: "Normal", status: "Cancelled",
    submitted: "15 Jul 2026", pendingDays: 0,
    history: [
      { at: "15 Jul 09:00", by: "Deepak Yadav", action: "Request submitted" },
      { at: "18 Jul 12:00", by: MANAGER, action: "Cancelled with authorisation (COO) — batch merged with Kanpur" },
    ],
  },
];

const CHECKLIST = [
  "Correct franchise project selected",
  "Franchise-owner details available",
  "Payment purpose is clear",
  "Amount matches approved quotation or agreement",
  "Payment due date is valid",
  "Machine or consumable item details are complete",
  "Required approval is attached",
  "Vyapar invoice is available or will be created",
  "Dispatch clearance requirement is identified",
];

const TABS = ["New", "Under Review", "Information Required", "Accepted", "Cancelled", "All Requests"] as const;
type TabKey = (typeof TABS)[number];

const statusTone = (s: ReqStatus) => {
  if (s === "Cancelled" || s === "Returned") return "bg-muted text-muted-foreground";
  if (s === "Information Required") return "bg-rose-100 text-rose-700";
  if (s === "Under Review") return "bg-amber-100 text-amber-700";
  if (s === "Accepted") return "bg-emerald-100 text-emerald-700";
  return "bg-blue-100 text-blue-700";
};
const prioTone = (p: Priority) =>
  p === "Urgent" ? "bg-rose-100 text-rose-700" : p === "Important" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground";

export function AmPaymentRequests() {
  const [reqs, setReqs] = useState<PReq[]>(SEED);
  const [tab, setTab] = useState<TabKey>("New");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [submitOpen, setSubmitOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState<"Return Request" | "Cancel with Authorisation" | null>(null);
  const [dupWarn, setDupWarn] = useState<{ existing: string; onOk: () => void } | null>(null);

  // filters
  const [fCoord, setFCoord] = useState("all");
  const [fProject, setFProject] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [fType, setFType] = useState("all");
  const [fPrio, setFPrio] = useState("all");
  const [fDue, setFDue] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fSubmitted, setFSubmitted] = useState("");

  // accept form
  const [aAmount, setAAmount] = useState("");
  const [aDue, setADue] = useState("");
  const [aVyapar, setAVyapar] = useState("");
  const [aInstr, setAInstr] = useState("");
  const [aFollow, setAFollow] = useState("");
  const [aClearance, setAClearance] = useState("yes");

  // info form
  const [infoItems, setInfoItems] = useState<string[]>([]);
  const [infoNote, setInfoNote] = useState("");

  // return/cancel form
  const [rReason, setRReason] = useState("");
  const [rAuth, setRAuth] = useState("");
  const [rNote, setRNote] = useState("");

  // coordinator submission form
  const [nProject, setNProject] = useState("");
  const [nType, setNType] = useState<PaymentType>("Franchise Fee");
  const [nPurpose, setNPurpose] = useState("");
  const [nItems, setNItems] = useState("");
  const [nAmount, setNAmount] = useState("");
  const [nDue, setNDue] = useState("");
  const [nLaunch, setNLaunch] = useState("");
  const [nQuote, setNQuote] = useState("");
  const [nPrio, setNPrio] = useState<Priority>("Normal");
  const [nNotes, setNNotes] = useState("");

  const open = reqs.find((r) => r.id === openId) ?? null;
  const uniq = (fn: (r: PReq) => string) => Array.from(new Set(reqs.map(fn)));

  const update = (id: string, fn: (r: PReq) => PReq) => setReqs((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));
  const log = (r: PReq, action: string): PReq => ({ ...r, history: [...r.history, { at: "Now", by: MANAGER, action }] });

  const kpi = {
    fresh: reqs.filter((r) => r.status === "New").length,
    info: reqs.filter((r) => r.status === "Information Required").length,
    acceptedToday: reqs.filter((r) => r.status === "Accepted").length,
    urgent: reqs.filter((r) => r.priority === "Urgent" && ["New", "Under Review"].includes(r.status)).length,
    overdueReview: reqs.filter((r) => r.pendingDays > 1 && ["New", "Under Review"].includes(r.status)).length,
  };

  const duplicates = useMemo(() => {
    const map = new Map<string, string[]>();
    reqs
      .filter((r) => !["Cancelled", "Returned"].includes(r.status))
      .forEach((r) => {
        const key = `${r.projectId}|${r.type}|${r.items}|${r.amount}`;
        map.set(key, [...(map.get(key) ?? []), r.id]);
      });
    return Array.from(map.values()).filter((ids) => ids.length > 1);
  }, [reqs]);

  const dupIds = new Set(duplicates.flat());

  const alerts = [
    ...reqs.filter((r) => r.priority === "Urgent" && r.status === "New").map((r) => ({ level: "red", t: `${r.id} — Urgent request not reviewed` })),
    ...reqs.filter((r) => r.pendingDays > 1 && ["New", "Under Review"].includes(r.status)).map((r) => ({ level: "amber", t: `${r.id} — Pending review for ${r.pendingDays} business days` })),
    ...reqs.filter((r) => ["New", "Under Review"].includes(r.status)).map((r) => ({ level: "amber", t: `${r.id} — Launch date approaching (${r.launchDate})` })),
    ...reqs.filter((r) => !r.amount || r.amountMissing).map((r) => ({ level: "red", t: `${r.id} — Amount missing or inconsistent` })),
    ...reqs.filter((r) => r.approvalMissing).map((r) => ({ level: "red", t: `${r.id} — Approval document missing` })),
    ...reqs.filter((r) => r.contactMissing).map((r) => ({ level: "red", t: `${r.id} — Franchise contact information missing` })),
    ...duplicates.map((ids) => ({ level: "red", t: `Possible duplicate request: ${ids.join(" & ")}` })),
    ...reqs.filter((r) => r.responseOverdue).map((r) => ({ level: "amber", t: `${r.id} — Project Coordinator response overdue` })),
  ];

  const filtered = reqs.filter((r) => {
    if (tab !== "All Requests" && r.status !== tab) return false;
    if (q && !`${r.id} ${r.projectId} ${r.store} ${r.owner} ${r.city} ${r.type} ${r.coordinator}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (fCoord !== "all" && r.coordinator !== fCoord) return false;
    if (fProject !== "all" && r.projectId !== fProject) return false;
    if (fOwner !== "all" && r.owner !== fOwner) return false;
    if (fCity !== "all" && r.city !== fCity) return false;
    if (fType !== "all" && r.type !== fType) return false;
    if (fPrio !== "all" && r.priority !== fPrio) return false;
    if (fStatus !== "all" && r.status !== fStatus) return false;
    if (fDue && !r.due.toLowerCase().includes(fDue.toLowerCase())) return false;
    if (fSubmitted && !r.submitted.toLowerCase().includes(fSubmitted.toLowerCase())) return false;
    return true;
  });

  const checkedCount = CHECKLIST.filter((c) => checks[c]).length;
  const checklistDone = checkedCount === CHECKLIST.length;

  const openRequest = (id: string) => {
    setOpenId(id);
    setChecks({});
    const r = reqs.find((x) => x.id === id);
    if (r) {
      setAAmount(String(r.amount));
      setADue(r.due);
      setAVyapar(r.acceptance?.vyapar ?? "");
      setAInstr("");
      setAFollow("");
      setAClearance(r.clearanceType === "Not Required" ? "no" : "yes");
      if (r.status === "New") update(r.id, (x) => log({ ...x, status: "Under Review" }, "Review started"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead title="Project Payment Requests" sub="Requests submitted by Project Coordinators for franchise, machine, consumable and other approved project charges" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-full sm:w-64" placeholder="Search request, project, owner or city" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button size="sm" variant="outline" onClick={() => setSubmitOpen(true)}>
            <FilePlus2 className="h-4 w-4 mr-2" /> Coordinator submission form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="New Requests" value={String(kpi.fresh)} />
        <StatCard label="Information Required" value={String(kpi.info)} tone="bad" />
        <StatCard label="Accepted Today" value={String(kpi.acceptedToday)} tone="good" />
        <StatCard label="Urgent Requests" value={String(kpi.urgent)} tone="bad" />
        <StatCard label="Overdue for Review" value={String(kpi.overdueReview)} tone="warn" />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Attention</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1.5 md:grid-cols-2 max-h-56 overflow-auto">
            {alerts.map((a, i) => (
              <div key={i} className={`text-xs rounded-md border p-2 ${a.level === "red" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {a.t}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">
              {t}
              <span className="ml-1 text-muted-foreground">
                ({t === "All Requests" ? reqs.length : reqs.filter((r) => r.status === t).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <FilterSelect label="Coordinator" value={fCoord} onChange={setFCoord} options={uniq((r) => r.coordinator)} />
          <FilterSelect label="Franchise project" value={fProject} onChange={setFProject} options={uniq((r) => r.projectId)} />
          <FilterSelect label="Franchise owner" value={fOwner} onChange={setFOwner} options={uniq((r) => r.owner)} />
          <FilterSelect label="Store city" value={fCity} onChange={setFCity} options={uniq((r) => r.city)} />
          <FilterSelect label="Payment type" value={fType} onChange={setFType} options={PAYMENT_TYPES as unknown as string[]} />
          <FilterSelect label="Priority" value={fPrio} onChange={setFPrio} options={["Normal", "Important", "Urgent"]} />
          <FilterSelect label="Request status" value={fStatus} onChange={setFStatus} options={["New", "Under Review", "Information Required", "Accepted", "Cancelled", "Returned"]} />
          <div>
            <Label className="text-[11px] text-muted-foreground">Due date</Label>
            <Input className="h-9" placeholder="e.g. Aug" value={fDue} onChange={(e) => setFDue(e.target.value)} />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Submitted date</Label>
            <Input className="h-9" placeholder="e.g. 3 Aug" value={fSubmitted} onChange={(e) => setFSubmitted(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFCoord("all"); setFProject("all"); setFOwner("all"); setFCity("all");
                setFType("all"); setFPrio("all"); setFStatus("all"); setFDue(""); setFSubmitted("");
              }}
            >
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Franchise / owner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Payment type</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className={dupIds.has(r.id) ? "bg-rose-50/60" : undefined}>
                    <TableCell className="font-medium">
                      {r.id}
                      {dupIds.has(r.id) && <Badge className="ml-2 bg-rose-100 text-rose-700">Duplicate?</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{r.projectId}</TableCell>
                    <TableCell className="text-sm">
                      <div>{r.store}</div>
                      <div className="text-xs text-muted-foreground">{r.owner}</div>
                    </TableCell>
                    <TableCell className="text-sm">{r.city}</TableCell>
                    <TableCell className="text-sm">{r.type}</TableCell>
                    <TableCell className="text-sm">{r.due}</TableCell>
                    <TableCell className="text-xs">{r.coordinator}</TableCell>
                    <TableCell><Badge className={prioTone(r.priority)}>{r.priority}</Badge></TableCell>
                    <TableCell><Badge className={statusTone(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openRequest(r.id)}>Review Request</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">No requests match these filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden p-3 space-y-2">
            {filtered.map((r) => (
              <div key={r.id} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{r.id}</span>
                  <Badge className={statusTone(r.status)}>{r.status}</Badge>
                </div>
                <div className="text-sm">{r.store} · {r.city}</div>
                <div className="text-xs text-muted-foreground">{r.projectId} · {r.owner} · {r.type}</div>
                <div className="text-sm font-medium">Due {r.due}</div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex gap-1">
                    <Badge className={prioTone(r.priority)}>{r.priority}</Badge>
                    {dupIds.has(r.id) && <Badge className="bg-rose-100 text-rose-700">Duplicate?</Badge>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openRequest(r.id)}>Review Request</Button>
                </div>
                <div className="text-[11px] text-muted-foreground">Requested by {r.coordinator}</div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">No requests match these filters.</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Permissions in force</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground grid gap-1 md:grid-cols-2">
          <div>Project Coordinators create and view requests for their assigned projects only; they can never mark a payment received or verified.</div>
          <div>Accounts Manager reviews, accepts, returns or cancels with authorisation.</div>
          <div>Logistics Executive sees nothing here until dispatch clearance is issued.</div>
          <div>Contact and payment data is masked; banking passwords, OTPs, card details and UPI PINs are never stored.</div>
        </CardContent>
      </Card>

      {/* Review drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  {open.id} · {open.store}
                  <Badge className={statusTone(open.status)}>{open.status}</Badge>
                  <Badge className={prioTone(open.priority)}>{open.priority}</Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4 text-sm">
                {dupIds.has(open.id) && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                    Possible duplicate of {duplicates.find((ids) => ids.includes(open.id))?.filter((i) => i !== open.id).join(", ")} — same project, payment type, items and amount. Confirm before accepting.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <F label="Payment Request ID" v={open.id} />
                  <F label="Project ID" v={open.projectId} />
                  <F label="Franchise owner" v={open.owner} />
                  <F label="Mobile" v={open.mobileMasked} />
                  <F label="Email" v={open.emailMasked} />
                  <F label="City / state" v={`${open.city}, ${open.state}`} />
                  <F label="Project Coordinator" v={open.coordinator} />
                  <F label="Payment type" v={open.type} />
                  <F label="Payment purpose" v={open.purpose} />
                  <F label="Item or service description" v={open.items} />
                  <F label="Tax information reference" v={open.taxRef} />
                  <F label="Payment due date" v={open.due} />
                  <F label="Required clearance type" v={open.clearanceType} />
                  <F label="Planned launch date" v={open.launchDate} />
                  <F label="Quotation / approval" v={open.quotation} />
                  <F label="Special instructions" v={open.instructions || "—"} />
                  <F label="Submitted on" v={open.submitted} />
                </div>

                <Separator />
                <div>
                  <div className="font-medium mb-2">Accounts review checklist ({checkedCount}/{CHECKLIST.length})</div>
                  <div className="space-y-2">
                    {CHECKLIST.map((c) => (
                      <label key={c} className="flex items-start gap-2 text-xs">
                        <Checkbox checked={!!checks[c]} onCheckedChange={(v) => setChecks((p) => ({ ...p, [c]: !!v }))} />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={!checklistDone || ["Accepted", "Cancelled"].includes(open.status)}
                    onClick={() => {
                      if (dupIds.has(open.id)) {
                        setDupWarn({
                          existing: duplicates.find((ids) => ids.includes(open.id))?.filter((i) => i !== open.id).join(", ") ?? "",
                          onOk: () => setAcceptOpen(true),
                        });
                        return;
                      }
                      setAcceptOpen(true);
                    }}
                  >
                    Accept Request
                  </Button>
                  <Button size="sm" variant="outline" disabled={open.status === "Accepted"} onClick={() => setInfoOpen(true)}>Ask for Information</Button>
                  <Button size="sm" variant="outline" onClick={() => setReturnOpen("Return Request")}>Return Request</Button>
                  <Button size="sm" variant="destructive" onClick={() => setReturnOpen("Cancel with Authorisation")}>Cancel with Authorisation</Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Opening project ${open.projectId}`)}>View Project</Button>
                </div>
                {!checklistDone && !["Accepted", "Cancelled"].includes(open.status) && (
                  <p className="text-[11px] text-muted-foreground">Complete all nine checklist points to enable acceptance.</p>
                )}

                {open.acceptance && (
                  <div className="rounded-md border p-3 text-xs space-y-1 bg-emerald-50/60">
                    <div className="font-medium text-emerald-800">Accepted — now in Payment Follow-ups &amp; Verification</div>
                    <div>Accepted by {open.acceptance.by} · due {open.acceptance.due}</div>
                    <div>Vyapar invoice: {open.acceptance.vyapar || "to be created"} · First follow-up: {open.acceptance.firstFollowUp || "—"}</div>
                    <div>Dispatch clearance required: {open.acceptance.clearanceRequired ? "Yes" : "No"}</div>
                    {open.acceptance.instructions && <div>Payment instructions: {open.acceptance.instructions}</div>}
                  </div>
                )}

                <Separator />
                <div>
                  <div className="font-medium mb-2">Activity history</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {open.history.map((h, i) => (<div key={i}>• {h.at} — {h.by}: {h.action}</div>))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Accept dialog */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept payment request</DialogTitle>
            <DialogDescription>The same Payment Request ID continues into Payment Follow-ups &amp; Verification.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Accounts Manager</Label><Input value={MANAGER} readOnly /></div>
            <div><Label className="text-xs">Accepted amount</Label><Input value={aAmount} onChange={(e) => setAAmount(e.target.value)} /></div>
            <div><Label className="text-xs">Payment due date</Label><Input value={aDue} onChange={(e) => setADue(e.target.value)} /></div>
            <div><Label className="text-xs">Vyapar invoice (if available)</Label><Input value={aVyapar} onChange={(e) => setAVyapar(e.target.value)} placeholder="VY-INV-…" /></div>
            <div><Label className="text-xs">First follow-up date</Label><Input value={aFollow} onChange={(e) => setAFollow(e.target.value)} placeholder="e.g. 7 Aug 2026" /></div>
            <div>
              <Label className="text-xs">Dispatch clearance required</Label>
              <Select value={aClearance} onValueChange={setAClearance}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Payment instructions</Label>
              <Textarea rows={2} value={aInstr} onChange={(e) => setAInstr(e.target.value)} placeholder="Bank transfer details are shared securely — never record OTPs or PINs." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!open) return;
                if (!aAmount || !aDue) return toast.error("Accepted amount and due date are required");
                update(open.id, (r) =>
                  log(
                    {
                      ...r,
                      status: "Accepted",
                      amount: Number(aAmount) || r.amount,
                      due: aDue,
                      acceptance: {
                        by: MANAGER, amount: Number(aAmount) || r.amount, due: aDue, vyapar: aVyapar,
                        instructions: aInstr, firstFollowUp: aFollow, clearanceRequired: aClearance === "yes",
                      },
                    },
                    `Request accepted — moved to Payment Follow-ups & Verification`,
                  ),
                );
                toast.success(`${open.id} accepted and moved to Follow-ups & Verification`);
                setAcceptOpen(false);
              }}
            >
              Accept &amp; move forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ask for information */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask for information</DialogTitle>
            <DialogDescription>The Project Coordinator responds inside the same Payment Request ID.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {["Correct amount", "Approval or quotation", "Franchise contact details", "Item details", "Payment purpose", "Due date", "Launch date", "Other clarification"].map((i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={infoItems.includes(i)}
                  onCheckedChange={(v) => setInfoItems((p) => (v ? [...p, i] : p.filter((x) => x !== i)))}
                />
                {i}
              </label>
            ))}
            <Textarea rows={2} value={infoNote} onChange={(e) => setInfoNote(e.target.value)} placeholder="Note for the Project Coordinator" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!open) return;
                if (infoItems.length === 0) return toast.error("Select at least one item");
                update(open.id, (r) => log({ ...r, status: "Information Required", responseOverdue: false }, `Information requested: ${infoItems.join(", ")}${infoNote ? ` — ${infoNote}` : ""}`));
                toast.success("Information request sent to the Project Coordinator");
                setInfoItems([]); setInfoNote(""); setInfoOpen(false);
              }}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return / cancel */}
      <Dialog open={!!returnOpen} onOpenChange={(o) => !o && setReturnOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{returnOpen}</DialogTitle>
            <DialogDescription>The request is never deleted — full history is preserved.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Reason</Label><Input value={rReason} onChange={(e) => setRReason(e.target.value)} /></div>
            <div><Label className="text-xs">Authorised person</Label><Input value={rAuth} onChange={(e) => setRAuth(e.target.value)} placeholder="e.g. COO — Vikram Shah" /></div>
            <div><Label className="text-xs">Supporting note</Label><Textarea rows={2} value={rNote} onChange={(e) => setRNote(e.target.value)} /></div>
            <div className="text-xs text-muted-foreground">Date and time will be recorded automatically.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(null)}>Close</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!open) return;
                if (!rReason.trim() || !rAuth.trim()) return toast.error("Reason and authorised person are required");
                const cancel = returnOpen === "Cancel with Authorisation";
                update(open.id, (r) => log({ ...r, status: cancel ? "Cancelled" : "Returned" }, `${returnOpen} — ${rReason.trim()} (authorised by ${rAuth.trim()})${rNote ? ` · ${rNote}` : ""}`));
                toast.success(`${open.id} ${cancel ? "cancelled" : "returned"} with full history preserved`);
                setRReason(""); setRAuth(""); setRNote(""); setReturnOpen(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate confirmation */}
      <Dialog open={!!dupWarn} onOpenChange={(o) => !o && setDupWarn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Possible duplicate request</DialogTitle>
            <DialogDescription>
              An active request with the same project, payment type, items and amount already exists: {dupWarn?.existing}. Continue only if this is a genuinely separate payment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDupWarn(null)}>Go back</Button>
            <Button
              onClick={() => {
                dupWarn?.onOk();
                setDupWarn(null);
              }}
            >
              Confirm and continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coordinator submission form */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Coordinator submission</DialogTitle>
            <DialogDescription>Coordinators may only request payment — they can never mark it received or verified.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Franchise project</Label>
              <Select value={nProject} onValueChange={setNProject}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(reqs.map((r) => `${r.projectId} · ${r.store}`))).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Payment type</Label>
              <Select value={nType} onValueChange={(v) => setNType(v as PaymentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={nPrio} onValueChange={(v) => setNPrio(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Normal", "Important", "Urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label className="text-xs">Purpose</Label><Input value={nPurpose} onChange={(e) => setNPurpose(e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Machine or consumable items (if applicable)</Label><Textarea rows={2} value={nItems} onChange={(e) => setNItems(e.target.value)} /></div>
            <div><Label className="text-xs">Approved amount</Label><Input value={nAmount} onChange={(e) => setNAmount(e.target.value)} /></div>
            <div><Label className="text-xs">Due date</Label><Input value={nDue} onChange={(e) => setNDue(e.target.value)} placeholder="e.g. 12 Aug 2026" /></div>
            <div><Label className="text-xs">Planned launch date</Label><Input value={nLaunch} onChange={(e) => setNLaunch(e.target.value)} placeholder="e.g. 20 Sep 2026" /></div>
            <div><Label className="text-xs">Quotation / approval reference</Label><Input value={nQuote} onChange={(e) => setNQuote(e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Notes for Accounts Manager</Label><Textarea rows={2} value={nNotes} onChange={(e) => setNNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!nProject || !nPurpose.trim() || !nAmount || !nDue) return toast.error("Project, purpose, amount and due date are required");
                const [projectId, store] = nProject.split(" · ");
                const base = reqs.find((r) => r.projectId === projectId);
                const amount = Number(nAmount) || 0;
                const dup = reqs.find(
                  (r) => r.projectId === projectId && r.type === nType && r.amount === amount && !["Cancelled", "Returned"].includes(r.status),
                );
                const create = () => {
                  const id = `PAY-${3112 + reqs.length}`;
                  setReqs((rs) => [
                    {
                      id, projectId, store, owner: base?.owner ?? "New franchise owner",
                      mobileMasked: base?.mobileMasked ?? "+91 9XXXXXXXXX", emailMasked: base?.emailMasked ?? "own****@mail.com",
                      city: base?.city ?? "—", state: base?.state ?? "—", coordinator: "Rahul Sharma",
                      type: nType, purpose: nPurpose.trim(), items: nItems.trim() || "Not applicable",
                      amount, taxRef: "As per approved quotation", due: nDue,
                      clearanceType: nType === "Machine Payment" ? "Machine Dispatch" : nType === "Consumables Payment" ? "Consumable Dispatch" : "Not Required",
                      launchDate: nLaunch || "—", quotation: nQuote || "Pending", instructions: nNotes.trim(),
                      priority: nPrio, status: "New", submitted: "4 Aug 2026", pendingDays: 0,
                      history: [{ at: "Now", by: "Rahul Sharma (Project Coordinator)", action: "Request submitted to Accounts" }],
                    },
                    ...rs,
                  ]);
                  toast.success(`${id} submitted to Accounts`);
                  setSubmitOpen(false);
                  setNProject(""); setNPurpose(""); setNItems(""); setNAmount(""); setNDue(""); setNLaunch(""); setNQuote(""); setNNotes("");
                  setTab("New");
                };
                if (dup) setDupWarn({ existing: dup.id, onOk: create });
                else create();
              }}
            >
              Submit to Accounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function F({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{v}</div>
    </div>
  );
}
