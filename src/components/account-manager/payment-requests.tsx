import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHead, StatCard } from "@/components/smm/ui";
import { toast } from "sonner";
import { AlertTriangle, ShieldAlert, Clock, Search, Download } from "lucide-react";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const STATUSES = [
  "New Request",
  "Under Verification",
  "Information Requested",
  "Approved",
  "Payment Scheduled",
  "Paid",
  "On Hold",
  "Rejected",
  "Closed",
] as const;
type Status = (typeof STATUSES)[number];

const CHECKLIST = [
  "Store / project ID matches active project",
  "Payment type matches approved project budget",
  "Amount within sanctioned milestone limit",
  "Quotation or invoice attached and readable",
  "Vendor / beneficiary details verified",
  "Milestone actually completed (PM confirmation)",
  "No duplicate request for same milestone",
  "GST / tax component correct",
  "Budget balance available for this project",
  "Approval authority confirmed for this amount",
] as const;

type Req = {
  id: string;
  store: string;
  project: string;
  type: string;
  amount: number;
  raisedBy: string;
  role: string;
  raisedOn: string;
  needBy: string;
  status: Status;
  priority: "Critical" | "High" | "Normal";
  blocksDispatch: boolean;
  budgetRisk: boolean;
  beneficiary: string;
  accountMasked: string;
  checks: boolean[];
  notes: { at: string; by: string; text: string }[];
  audit: { at: string; by: string; action: string }[];
};

const mkChecks = (n: number) => CHECKLIST.map((_, i) => i < n);

const SEED: Req[] = [
  {
    id: "PR-2041", store: "Jaipur", project: "PRJ-JAI-07", type: "Machine Advance", amount: 450000,
    raisedBy: "Rahul Sharma", role: "Project Coordinator", raisedOn: "3 Aug", needBy: "Today",
    status: "New Request", priority: "Critical", blocksDispatch: true, budgetRisk: false,
    beneficiary: "Clean Craft Machinery Pvt Ltd", accountMasked: "XXXXXX4417",
    checks: mkChecks(0),
    notes: [{ at: "3 Aug", by: "Rahul Sharma", text: "Machine dispatch blocked until 60% advance is released." }],
    audit: [{ at: "3 Aug 10:12", by: "Rahul Sharma", action: "Request created" }],
  },
  {
    id: "PR-2042", store: "Indore", project: "PRJ-IND-03", type: "Civil Work Milestone", amount: 180000,
    raisedBy: "Anita Rao", role: "Project Manager", raisedOn: "2 Aug", needBy: "6 Aug",
    status: "Under Verification", priority: "High", blocksDispatch: false, budgetRisk: false,
    beneficiary: "Shree Constructions", accountMasked: "XXXXXX9021",
    checks: mkChecks(6),
    notes: [{ at: "3 Aug", by: "Account Manager", text: "Site photos received, verifying measurement sheet." }],
    audit: [
      { at: "2 Aug 15:40", by: "Anita Rao", action: "Request created" },
      { at: "3 Aug 09:05", by: "Account Manager", action: "Moved to Under Verification" },
    ],
  },
  {
    id: "PR-2043", store: "Lucknow", project: "PRJ-LKO-02", type: "Franchise 2nd Instalment", amount: 600000,
    raisedBy: "Vikram Singh", role: "Sales Head", raisedOn: "1 Aug", needBy: "7 Aug",
    status: "Information Requested", priority: "High", blocksDispatch: true, budgetRisk: false,
    beneficiary: "Clean Craft Franchise Account", accountMasked: "XXXXXX1188",
    checks: mkChecks(4),
    notes: [{ at: "2 Aug", by: "Account Manager", text: "Signed agreement copy missing — requested from Sales Head." }],
    audit: [
      { at: "1 Aug 11:20", by: "Vikram Singh", action: "Request created" },
      { at: "2 Aug 12:00", by: "Account Manager", action: "Information requested: agreement copy" },
    ],
  },
  {
    id: "PR-2044", store: "Surat", project: "PRJ-SUR-05", type: "Vendor Payment", amount: 92000,
    raisedBy: "Deepak Yadav", role: "Logistics Executive", raisedOn: "1 Aug", needBy: "8 Aug",
    status: "Approved", priority: "Normal", blocksDispatch: false, budgetRisk: false,
    beneficiary: "Gujarat Freight Lines", accountMasked: "XXXXXX7734",
    checks: mkChecks(10),
    notes: [],
    audit: [
      { at: "1 Aug 09:00", by: "Deepak Yadav", action: "Request created" },
      { at: "2 Aug 16:30", by: "Account Manager", action: "Verified and approved" },
    ],
  },
  {
    id: "PR-2045", store: "Nagpur", project: "PRJ-NAG-01", type: "Machine Balance", amount: 520000,
    raisedBy: "Rahul Sharma", role: "Project Coordinator", raisedOn: "29 Jul", needBy: "4 Aug",
    status: "On Hold", priority: "Critical", blocksDispatch: true, budgetRisk: true,
    beneficiary: "Clean Craft Machinery Pvt Ltd", accountMasked: "XXXXXX4417",
    checks: mkChecks(7),
    notes: [{ at: "31 Jul", by: "Account Manager", text: "Owner collection pending — hold until franchise amount credited." }],
    audit: [
      { at: "29 Jul 14:10", by: "Rahul Sharma", action: "Request created" },
      { at: "31 Jul 10:45", by: "Account Manager", action: "Put on hold: collection pending" },
    ],
  },
  {
    id: "PR-2046", store: "Bhopal", project: "PRJ-BPL-04", type: "Interior & Branding", amount: 240000,
    raisedBy: "Anita Rao", role: "Project Manager", raisedOn: "30 Jul", needBy: "5 Aug",
    status: "Payment Scheduled", priority: "High", blocksDispatch: false, budgetRisk: false,
    beneficiary: "Signature Interiors", accountMasked: "XXXXXX5560",
    checks: mkChecks(10),
    notes: [{ at: "2 Aug", by: "Account Manager", text: "Scheduled for NEFT on 5 Aug." }],
    audit: [
      { at: "30 Jul 12:00", by: "Anita Rao", action: "Request created" },
      { at: "2 Aug 11:00", by: "Account Manager", action: "Payment scheduled 5 Aug (NEFT)" },
    ],
  },
  {
    id: "PR-2047", store: "Kanpur", project: "PRJ-KNP-06", type: "Electrical Work", amount: 68000,
    raisedBy: "Suresh Patel", role: "Project Manager", raisedOn: "28 Jul", needBy: "1 Aug",
    status: "Paid", priority: "Normal", blocksDispatch: false, budgetRisk: false,
    beneficiary: "Kanpur Electricals", accountMasked: "XXXXXX2290",
    checks: mkChecks(10),
    notes: [{ at: "1 Aug", by: "Account Manager", text: "Paid via NEFT, UTR shared with PM." }],
    audit: [
      { at: "28 Jul 10:00", by: "Suresh Patel", action: "Request created" },
      { at: "31 Jul 15:00", by: "Account Manager", action: "Approved" },
      { at: "1 Aug 11:30", by: "Account Manager", action: "Marked paid (UTR XXXXXX8891)" },
    ],
  },
  {
    id: "PR-2048", store: "Raipur", project: "PRJ-RAI-02", type: "Petty Cash Top-up", amount: 25000,
    raisedBy: "Komal Sahu", role: "Trainer & Launch Executive", raisedOn: "27 Jul", needBy: "30 Jul",
    status: "Rejected", priority: "Normal", blocksDispatch: false, budgetRisk: false,
    beneficiary: "Komal Sahu (staff advance)", accountMasked: "XXXXXX3345",
    checks: mkChecks(3),
    notes: [{ at: "28 Jul", by: "Account Manager", text: "Previous advance not settled — reject and resubmit with settlement." }],
    audit: [
      { at: "27 Jul 09:15", by: "Komal Sahu", action: "Request created" },
      { at: "28 Jul 10:00", by: "Account Manager", action: "Rejected: earlier advance unsettled" },
    ],
  },
  {
    id: "PR-2049", store: "Jaipur", project: "PRJ-JAI-07", type: "POS Hardware", amount: 46000,
    raisedBy: "Neha Gupta", role: "Developer", raisedOn: "26 Jul", needBy: "29 Jul",
    status: "Closed", priority: "Normal", blocksDispatch: false, budgetRisk: false,
    beneficiary: "TechPoint Systems", accountMasked: "XXXXXX6612",
    checks: mkChecks(10),
    notes: [],
    audit: [
      { at: "26 Jul 09:00", by: "Neha Gupta", action: "Request created" },
      { at: "29 Jul 17:00", by: "Account Manager", action: "Paid and closed" },
    ],
  },
];

const tone = (s: Status) => {
  switch (s) {
    case "Rejected":
    case "On Hold":
      return "bg-rose-100 text-rose-700";
    case "Information Requested":
    case "Under Verification":
      return "bg-amber-100 text-amber-700";
    case "New Request":
      return "bg-blue-100 text-blue-700";
    case "Approved":
    case "Payment Scheduled":
      return "bg-sky-100 text-sky-700";
    case "Paid":
    case "Closed":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const prTone = (p: Req["priority"]) =>
  p === "Critical" ? "bg-rose-100 text-rose-700" : p === "High" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground";

const OPEN: Status[] = ["New Request", "Under Verification", "Information Requested", "Approved", "Payment Scheduled", "On Hold"];

export function AmPaymentRequests() {
  const [rows, setRows] = useState<Req[]>(SEED);
  const [tab, setTab] = useState<"All" | Status>("All");
  const [q, setQ] = useState("");
  const [store, setStore] = useState("all");
  const [type, setType] = useState("all");
  const [role, setRole] = useState("all");
  const [band, setBand] = useState("all");
  const [flag, setFlag] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const [infoText, setInfoText] = useState("");
  const [payMode, setPayMode] = useState("NEFT");
  const [payDate, setPayDate] = useState("");
  const [utr, setUtr] = useState("");
  const [reason, setReason] = useState("");

  const stores = useMemo(() => Array.from(new Set(SEED.map((r) => r.store))), []);
  const types = useMemo(() => Array.from(new Set(SEED.map((r) => r.type))), []);
  const roles = useMemo(() => Array.from(new Set(SEED.map((r) => r.role))), []);

  const filtered = rows.filter((r) => {
    if (tab !== "All" && r.status !== tab) return false;
    if (store !== "all" && r.store !== store) return false;
    if (type !== "all" && r.type !== type) return false;
    if (role !== "all" && r.role !== role) return false;
    if (band === "lt1" && r.amount >= 100000) return false;
    if (band === "1to5" && (r.amount < 100000 || r.amount > 500000)) return false;
    if (band === "gt5" && r.amount <= 500000) return false;
    if (flag === "dispatch" && !r.blocksDispatch) return false;
    if (flag === "budget" && !r.budgetRisk) return false;
    if (flag === "overdue" && r.needBy !== "Today" && !/4 Aug|1 Aug|30 Jul|29 Jul/.test(r.needBy)) return false;
    if (q) {
      const hay = `${r.id} ${r.store} ${r.project} ${r.type} ${r.raisedBy} ${r.beneficiary}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const open = rows.find((r) => r.id === openId) ?? null;

  const update = (id: string, fn: (r: Req) => Req) =>
    setRows((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));

  const log = (r: Req, action: string): Req => ({
    ...r,
    audit: [...r.audit, { at: "Now", by: "Account Manager", action }],
  });

  const move = (r: Req, status: Status, action: string) => {
    update(r.id, (x) => log({ ...x, status }, action));
    toast.success(`${r.id} → ${status}`);
  };

  const stats = {
    open: rows.filter((r) => OPEN.includes(r.status)).length,
    newCount: rows.filter((r) => r.status === "New Request").length,
    verifying: rows.filter((r) => r.status === "Under Verification" || r.status === "Information Requested").length,
    approvedValue: rows.filter((r) => r.status === "Approved" || r.status === "Payment Scheduled").reduce((s, r) => s + r.amount, 0),
    paidValue: rows.filter((r) => r.status === "Paid" || r.status === "Closed").reduce((s, r) => s + r.amount, 0),
    blocked: rows.filter((r) => r.blocksDispatch && OPEN.includes(r.status)).length,
  };

  const checksDone = open ? open.checks.filter(Boolean).length : 0;
  const allChecked = checksDone === CHECKLIST.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead
          title="Project Payment Requests"
          sub="Verify, approve and release payments raised by Project Coordinators, Project Managers, Sales and Logistics."
        />
        <Button variant="outline" size="sm" onClick={() => toast.success("Request register exported")}>
          <Download className="h-4 w-4 mr-2" /> Export Register
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Open Requests" value={String(stats.open)} />
        <StatCard label="New (Action Needed)" value={String(stats.newCount)} tone="warn" />
        <StatCard label="In Verification" value={String(stats.verifying)} />
        <StatCard label="Approved Value" value={inr(stats.approvedValue)} />
        <StatCard label="Paid This Month" value={inr(stats.paidValue)} tone="good" />
        <StatCard label="Blocking Dispatch" value={String(stats.blocked)} tone="bad" />
      </div>

      {stats.blocked > 0 && (
        <Card className="border-rose-200 bg-rose-50/60">
          <CardContent className="pt-4 flex items-start gap-3 text-sm">
            <ShieldAlert className="h-4 w-4 text-rose-600 mt-0.5" />
            <div>
              <div className="font-medium text-rose-800">Attention needed</div>
              <div className="text-rose-700">
                {stats.blocked} request(s) are holding machine or material dispatch. Clear these first — store opening dates depend on them.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="All">All ({rows.length})</TabsTrigger>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s} ({rows.filter((r) => r.status === s).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-4">
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="relative md:col-span-3 lg:col-span-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search ID, store, vendor" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <FilterSelect value={store} onChange={setStore} label="All stores" options={stores} />
            <FilterSelect value={type} onChange={setType} label="All payment types" options={types} />
            <FilterSelect value={role} onChange={setRole} label="All requesters" options={roles} />
            <Select value={band} onValueChange={setBand}>
              <SelectTrigger><SelectValue placeholder="Any amount" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any amount</SelectItem>
                <SelectItem value="lt1">Below ₹1L</SelectItem>
                <SelectItem value="1to5">₹1L – ₹5L</SelectItem>
                <SelectItem value="gt5">Above ₹5L</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flag} onValueChange={setFlag}>
              <SelectTrigger><SelectValue placeholder="All flags" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All flags</SelectItem>
                <SelectItem value="dispatch">Blocking dispatch</SelectItem>
                <SelectItem value="budget">Budget risk</SelectItem>
                <SelectItem value="overdue">Past need-by date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Store / Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Raised by</TableHead>
                <TableHead>Need by</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpenId(r.id)}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {r.id}
                      {r.blocksDispatch && OPEN.includes(r.status) && <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
                    </div>
                    <Badge className={`${prTone(r.priority)} mt-1`}>{r.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>{r.store}</div>
                    <div className="text-xs text-muted-foreground">{r.project}</div>
                  </TableCell>
                  <TableCell className="text-sm">{r.type}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{inr(r.amount)}</TableCell>
                  <TableCell className="text-sm">
                    <div>{r.raisedBy}</div>
                    <div className="text-xs text-muted-foreground">{r.role}</div>
                  </TableCell>
                  <TableCell className="text-sm">{r.needBy}</TableCell>
                  <TableCell><Badge className={tone(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">Open</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                    No requests match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((r) => (
          <button key={r.id} onClick={() => setOpenId(r.id)} className="w-full text-left border rounded-lg bg-background p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{r.id} · {r.store}</span>
              <Badge className={tone(r.status)}>{r.status}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{r.type} · {r.raisedBy} ({r.role})</div>
            <div className="flex items-center justify-between mt-2">
              <span className="tabular-nums font-semibold">{inr(r.amount)}</span>
              <span className="text-xs flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {r.needBy}
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">No requests match these filters.</div>
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  {open.id} · {open.store}
                  <Badge className={tone(open.status)}>{open.status}</Badge>
                  <Badge className={prTone(open.priority)}>{open.priority}</Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Project" value={open.project} />
                  <Field label="Payment type" value={open.type} />
                  <Field label="Amount" value={inr(open.amount)} />
                  <Field label="Need by" value={open.needBy} />
                  <Field label="Raised by" value={`${open.raisedBy} (${open.role})`} />
                  <Field label="Raised on" value={open.raisedOn} />
                  <Field label="Beneficiary" value={open.beneficiary} />
                  <Field label="Account" value={open.accountMasked} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Bank details are masked. Never paste full account numbers, UPI PINs or banking passwords into notes.
                </p>

                {(open.blocksDispatch || open.budgetRisk) && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-800 text-xs space-y-1">
                    {open.blocksDispatch && <div>This payment is blocking dispatch for {open.store}.</div>}
                    {open.budgetRisk && <div>Budget risk: project budget balance is tight for this amount.</div>}
                  </div>
                )}

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Verification checklist</div>
                    <span className="text-xs text-muted-foreground">{checksDone}/{CHECKLIST.length}</span>
                  </div>
                  <Progress value={(checksDone / CHECKLIST.length) * 100} className="h-2 mb-3" />
                  <div className="space-y-2">
                    {CHECKLIST.map((c, i) => (
                      <label key={c} className="flex items-start gap-2">
                        <Checkbox
                          checked={open.checks[i]}
                          onCheckedChange={(v) =>
                            update(open.id, (r) => {
                              const checks = [...r.checks];
                              checks[i] = !!v;
                              return checks[i] ? log({ ...r, checks }, `Checked: ${c}`) : { ...r, checks };
                            })
                          }
                        />
                        <span className="leading-tight">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="font-medium">Actions</div>
                  <div className="flex flex-wrap gap-2">
                    {open.status === "New Request" && (
                      <Button size="sm" onClick={() => move(open, "Under Verification", "Started verification")}>
                        Start Verification
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={!allChecked || ["Approved", "Payment Scheduled", "Paid", "Closed"].includes(open.status)}
                      onClick={() => move(open, "Approved", "Verified and approved")}
                    >
                      Approve
                    </Button>
                    {open.status === "Approved" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (!payDate) return toast.error("Add a payment date first");
                          move(open, "Payment Scheduled", `Payment scheduled ${payDate} (${payMode})`);
                        }}
                      >
                        Schedule Payment
                      </Button>
                    )}
                    {(open.status === "Payment Scheduled" || open.status === "Approved") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (utr.trim().length < 4) return toast.error("Enter the transaction reference");
                          move(open, "Paid", `Marked paid (ref ${"XXXXXX" + utr.trim().slice(-4)})`);
                          setUtr("");
                        }}
                      >
                        Mark Paid
                      </Button>
                    )}
                    {open.status === "Paid" && (
                      <Button size="sm" variant="secondary" onClick={() => move(open, "Closed", "Closed after requester confirmation")}>
                        Close Request
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!infoText.trim()) return toast.error("Write what information is missing");
                        update(open.id, (r) =>
                          log(
                            {
                              ...r,
                              status: "Information Requested",
                              notes: [...r.notes, { at: "Now", by: "Account Manager", text: infoText.trim() }],
                            },
                            `Information requested: ${infoText.trim()}`,
                          ),
                        );
                        toast.success(`Sent back to ${open.raisedBy}`);
                        setInfoText("");
                      }}
                    >
                      Ask for Information
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      if (!reason.trim()) return toast.error("Add a hold reason");
                      update(open.id, (r) => log({ ...r, status: "On Hold", notes: [...r.notes, { at: "Now", by: "Account Manager", text: reason.trim() }] }, `Put on hold: ${reason.trim()}`));
                      toast.success(`${open.id} put on hold`);
                      setReason("");
                    }}>
                      Put On Hold
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      if (!reason.trim()) return toast.error("Rejection reason is required");
                      update(open.id, (r) => log({ ...r, status: "Rejected", notes: [...r.notes, { at: "Now", by: "Account Manager", text: reason.trim() }] }, `Rejected: ${reason.trim()}`));
                      toast.success(`${open.id} rejected and returned`);
                      setReason("");
                    }}>
                      Reject
                    </Button>
                  </div>
                  {!allChecked && (
                    <p className="text-xs text-amber-700">
                      Approval unlocks only after all {CHECKLIST.length} verification points are ticked.
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label className="text-xs">Information / clarification needed</Label>
                    <Textarea rows={2} value={infoText} onChange={(e) => setInfoText(e.target.value)} placeholder="e.g. Attach vendor invoice with GST number" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Payment mode</Label>
                      <Select value={payMode} onValueChange={setPayMode}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["NEFT", "RTGS", "IMPS", "UPI", "Cheque"].map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Payment date</Label>
                      <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Transaction reference (stored masked)</Label>
                    <Input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="UTR / cheque no." />
                  </div>
                  <div>
                    <Label className="text-xs">Hold / rejection reason</Label>
                    <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason visible to the requester" />
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium mb-2">Notes</div>
                  <div className="space-y-2">
                    {open.notes.length === 0 && <div className="text-xs text-muted-foreground">No notes yet.</div>}
                    {open.notes.map((n, i) => (
                      <div key={i} className="rounded-md border p-2 text-xs">
                        <div className="text-muted-foreground">{n.by} · {n.at}</div>
                        <div>{n.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">Audit log</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {open.audit.map((a, i) => (
                      <div key={i}>• {a.at} — {a.by}: {a.action}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">How requests are handled</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>New Request → Under Verification → Approved → Payment Scheduled → Paid → Closed. Information Requested, On Hold and Rejected return the request to the requester.</div>
          <div>Every status change, checklist tick and reason is recorded in the audit log with the person and time.</div>
          <div>Bank and transaction details are masked; full details stay with Accounts records only.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
