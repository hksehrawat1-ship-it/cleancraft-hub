import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Inbox,
  Link2,
  Search,
  Undo2,
} from "lucide-react";
import { inr, toneClasses, type Tone } from "./data";
import {
  INFO_CHECKLIST,
  MARKETING_REQUESTS,
  REQ_TYPES,
  RETURN_REASONS,
  TODAY,
  attentionFlags,
  isOpen,
  isOverdue,
  priorityMeta,
  stageMeta,
  type MarketingRequestFull,
  type ReqStage,
} from "./requests-data";

const EXEC = "Nikhil Arora";

function Pill({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number | string; tone: Tone }) {
  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className="text-xl font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[11px] leading-tight opacity-90">{label}</div>
    </div>
  );
}

type TabId =
  | "new"
  | "accepted"
  | "in_progress"
  | "information_required"
  | "review"
  | "correction"
  | "completed"
  | "overdue"
  | "all";

const TABS: { id: TabId; label: string }[] = [
  { id: "new", label: "New" },
  { id: "accepted", label: "Accepted" },
  { id: "in_progress", label: "In Progress" },
  { id: "information_required", label: "Information Required" },
  { id: "review", label: "Waiting for Review" },
  { id: "correction", label: "Correction Required" },
  { id: "completed", label: "Completed" },
  { id: "overdue", label: "Overdue" },
  { id: "all", label: "All" },
];

function inTab(r: MarketingRequestFull, tab: TabId) {
  switch (tab) {
    case "new":
      return r.stage === "submitted" || r.stage === "assigned";
    case "accepted":
      return r.stage === "accepted";
    case "in_progress":
      return r.stage === "in_progress" || r.stage === "blocked";
    case "information_required":
      return r.stage === "information_required" || r.stage === "returned";
    case "review":
      return r.stage === "submitted_for_review";
    case "correction":
      return r.stage === "correction_required";
    case "completed":
      return ["approved", "completed", "closed"].includes(r.stage);
    case "overdue":
      return isOverdue(r);
    default:
      return true;
  }
}

const uniq = (v: string[]) => [...new Set(v)].sort();

export function MarketingRequestsPage() {
  const [rows, setRows] = useState<MarketingRequestFull[]>(MARKETING_REQUESTS);
  const [tab, setTab] = useState<TabId>("new");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "accept" | "info" | "return" | "report">(null);

  const [f, setF] = useState({
    store: "all",
    rm: "all",
    exec: "all",
    type: "all",
    priority: "all",
    stage: "all",
    platform: "all",
    city: "all",
    due: "all",
  });
  const reset = () =>
    setF({ store: "all", rm: "all", exec: "all", type: "all", priority: "all", stage: "all", platform: "all", city: "all", due: "all" });
  const activeFilters = Object.values(f).filter((v) => v !== "all").length;

  const kpis = useMemo(() => {
    const open = rows.filter(isOpen);
    return {
      newReq: rows.filter((r) => ["submitted", "assigned"].includes(r.stage)).length,
      dueToday: open.filter((r) => r.dueDate === TODAY).length,
      inProgress: rows.filter((r) => ["accepted", "in_progress", "blocked"].includes(r.stage)).length,
      review: rows.filter((r) => r.stage === "submitted_for_review").length,
      overdue: rows.filter(isOverdue).length,
      completed: rows.filter((r) => ["approved", "completed", "closed"].includes(r.stage) && r.dueDate >= "2026-08-01").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => inTab(r, tab))
      .filter((r) =>
        !needle ||
        [r.id, r.store, r.storeId, r.type, r.rm, r.executive, r.city].some((v) =>
          v.toLowerCase().includes(needle),
        ),
      )
      .filter((r) => f.store === "all" || r.storeId === f.store)
      .filter((r) => f.rm === "all" || r.rm === f.rm)
      .filter((r) => f.exec === "all" || r.executive === f.exec)
      .filter((r) => f.type === "all" || r.type === f.type)
      .filter((r) => f.priority === "all" || r.priority === f.priority)
      .filter((r) => f.stage === "all" || r.stage === f.stage)
      .filter((r) => f.platform === "all" || r.platform === f.platform)
      .filter((r) => f.city === "all" || `${r.city}, ${r.state}` === f.city)
      .filter((r) =>
        f.due === "all"
          ? true
          : f.due === "today"
            ? r.dueDate === TODAY
            : f.due === "overdue"
              ? isOverdue(r)
              : r.dueDate > TODAY,
      )
      .sort((a, b) => {
        const w: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return w[a.priority] - w[b.priority] || a.dueDate.localeCompare(b.dueDate);
      });
  }, [rows, tab, q, f]);

  const active = rows.find((r) => r.id === openId) ?? null;

  function update(id: string, patch: Partial<MarketingRequestFull>, event: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              events: [...r.events, { at: TODAY, actor: EXEC, detail: event }],
            }
          : r,
      ),
    );
  }

  const attentionList = rows.flatMap((r) => attentionFlags(r).map((flag) => ({ id: r.id, store: r.store, flag })));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Marketing Requests</h1>
            <p className="text-sm text-muted-foreground">
              Store requirements raised by Relationship Managers — one permanent Request ID per requirement,
              always linked to its Store ID.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value.slice(0, 80))}
                placeholder="Search request, store or RM"
                className="pl-8"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Filter requests">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Filters {activeFilters ? `(${activeFilters})` : ""}</span>
                  <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["store", "Store", uniq(rows.map((r) => r.storeId))],
                    ["rm", "Relationship Manager", uniq(rows.map((r) => r.rm))],
                    ["exec", "Marketing Executive", uniq(rows.map((r) => r.executive))],
                    ["type", "Request type", [...REQ_TYPES]],
                    ["priority", "Priority", ["urgent", "high", "medium", "low"]],
                    ["stage", "Status", Object.keys(stageMeta)],
                    ["platform", "Platform", uniq(rows.map((r) => r.platform))],
                    ["city", "City & state", uniq(rows.map((r) => `${r.city}, ${r.state}`))],
                    ["due", "Due date", ["today", "overdue", "upcoming"]],
                  ] as const).map(([key, label, options]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">{label}</Label>
                      <Select
                        value={f[key]}
                        onValueChange={(v) => setF((p) => ({ ...p, [key]: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {options.map((o) => (
                            <SelectItem key={o} value={o} className="text-xs">
                              {key === "stage" ? stageMeta[o as ReqStage].label : o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi label="New Requests" value={kpis.newReq} tone="attention" />
          <Kpi label="Due Today" value={kpis.dueToday} tone="attention" />
          <Kpi label="In Progress" value={kpis.inProgress} tone="active" />
          <Kpi label="Waiting for Review" value={kpis.review} tone="attention" />
          <Kpi label="Overdue" value={kpis.overdue} tone="overdue" />
          <Kpi label="Completed This Month" value={kpis.completed} tone="healthy" />
        </div>
      </div>

      {/* Attention alerts */}
      {attentionList.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Attention ({attentionList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {attentionList.slice(0, 10).map((a, i) => (
              <button
                key={`${a.id}-${i}`}
                onClick={() => setOpenId(a.id)}
                className="rounded-md border bg-muted/40 px-2 py-1 text-left text-[11px] hover:bg-muted"
              >
                <span className="font-medium">{a.id}</span> · {a.flag}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs">
              {t.label}
              <span className="ml-1 opacity-60">{rows.filter((r) => inTab(r, t.id)).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>RM / Executive</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next action</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className={isOverdue(r) ? "bg-red-500/5" : undefined}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>
                    <div className="text-sm">{r.store}</div>
                    <div className="text-[11px] text-muted-foreground">{r.storeId} · {r.city}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.type}</TableCell>
                  <TableCell className="text-xs">
                    {r.rm}
                    <div className="text-[11px] text-muted-foreground">{r.executive}</div>
                  </TableCell>
                  <TableCell><Pill tone={priorityMeta[r.priority].tone}>{priorityMeta[r.priority].label}</Pill></TableCell>
                  <TableCell className="text-xs">
                    {r.dueDate}
                    {isOverdue(r) && <div className="text-[11px] text-red-600">Overdue</div>}
                  </TableCell>
                  <TableCell><Pill tone={stageMeta[r.stage].tone}>{stageMeta[r.stage].label}</Pill></TableCell>
                  <TableCell className="max-w-[220px] text-[11px] text-muted-foreground">{r.nextAction}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setOpenId(r.id)}>
                      {["submitted", "assigned"].includes(r.stage) ? "Accept" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No requests match this view.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((r) => (
          <Card key={r.id} className={isOverdue(r) ? "border-red-500/40" : undefined}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{r.store}</div>
                  <div className="text-[11px] text-muted-foreground">{r.id} · {r.storeId} · {r.city}</div>
                </div>
                <Pill tone={priorityMeta[r.priority].tone}>{priorityMeta[r.priority].label}</Pill>
              </div>
              <div className="text-xs">{r.type}</div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <Pill tone={stageMeta[r.stage].tone}>{stageMeta[r.stage].label}</Pill>
                <span>RM {r.rm}</span>
                <span>Due {r.dueDate}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Next: {r.nextAction}</div>
              <Button size="sm" className="w-full" onClick={() => setOpenId(r.id)}>
                {["submitted", "assigned"].includes(r.stage) ? "Accept Request" : "View Request"}
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No requests match this view.</p>
        )}
      </div>

      {/* Detail sheet */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2">
                  {active.id}
                  <Pill tone={stageMeta[active.stage].tone}>{stageMeta[active.stage].label}</Pill>
                  <Pill tone={priorityMeta[active.priority].tone}>{priorityMeta[active.priority].label}</Pill>
                </SheetTitle>
                <SheetDescription>
                  {active.store} · {active.storeId} · {active.city}, {active.state}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {([
                    ["Relationship Manager", active.rm],
                    ["Assigned executive", active.executive],
                    ["Request type", active.type],
                    ["Platform", active.platform],
                    ["Submitted on", active.submittedOn],
                    ["Start date", active.startDate],
                    ["Required completion", active.dueDate],
                    ["Budget", active.budget ? `${inr(active.budget)} ${active.budgetApproved ? "(approved)" : "(approval pending)"}` : "—"],
                    ["Target location", active.targetLocation],
                    ["Target audience", active.audience],
                  ] as const).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[11px] text-muted-foreground">{k}</div>
                      <div className="font-medium">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Business problem</div>
                    <p>{active.problem}</p>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Required outcome</div>
                    <p>{active.outcome}</p>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Offer / promotion</div>
                    <p>{active.offer}</p>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Relationship Manager notes</div>
                    <p>{active.rmNotes}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[11px] text-muted-foreground">Supporting files</div>
                    {active.files.length ? active.files.map((x) => (
                      <div key={x} className="text-xs">• {x}</div>
                    )) : <div className="text-xs text-muted-foreground">None attached</div>}
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] text-muted-foreground">Reference examples</div>
                    {active.references.length ? active.references.map((x) => (
                      <div key={x} className="text-xs">• {x}</div>
                    )) : <div className="text-xs text-muted-foreground">None</div>}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Link2 className="h-4 w-4" /> Linked records (same Request ID)
                  </div>
                  {active.linked.length ? (
                    <div className="space-y-1">
                      {active.linked.map((l) => (
                        <div key={l.id} className="flex items-center justify-between rounded-md border px-2 py-1 text-xs">
                          <span>{l.kind} · <span className="font-medium">{l.id}</span></span>
                          <span className="text-muted-foreground">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No linked records yet — creating a campaign, creative, profile update or influencer
                      activity from here will carry {active.id}.
                    </p>
                  )}
                </div>

                {active.report && (
                  <Card className="border-emerald-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Completion report</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs">
                      <p>{active.report.workDone}</p>
                      <div className="text-muted-foreground">
                        {active.report.linkedId} · completed {active.report.completedOn} · budget used {inr(active.report.budgetUsed)}
                        {active.report.leads != null && ` · ${active.report.leads} leads`}
                        {active.report.sales != null && ` · ${inr(active.report.sales)} sales`}
                      </div>
                      <div>Pending: {active.report.pending}</div>
                      <div className="text-muted-foreground">{active.report.note}</div>
                    </CardContent>
                  </Card>
                )}

                {/* Executive actions */}
                <div>
                  <div className="mb-2 text-sm font-medium">Executive actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      disabled={!["submitted", "assigned", "returned"].includes(active.stage)}
                      onClick={() => setDialog("accept")}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Accept Request
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("info")}>
                      <Inbox className="mr-1 h-4 w-4" /> Ask for Information
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("return")}>
                      <Undo2 className="mr-1 h-4 w-4" /> Return Request
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={active.stage !== "accepted"}
                      onClick={() =>
                        update(active.id, { stage: "in_progress", nextAction: "Execute planned marketing action" }, "Work started")
                      }
                    >
                      <Clock className="mr-1 h-4 w-4" /> Start Work
                    </Button>
                    {([
                      ["Create Campaign", "Campaign"],
                      ["Request Creative", "Creative"],
                      ["Update Profile", "Profile"],
                      ["Add Influencer Activity", "Influencer"],
                    ] as const).map(([label, kind]) => (
                      <Button
                        key={label}
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const id = `${kind === "Campaign" ? "CMP" : kind === "Creative" ? "CRV" : kind === "Profile" ? "PRF" : "INF"}-${Math.floor(1000 + Math.random() * 8999)}`;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === active.id
                                ? {
                                    ...r,
                                    stage: r.stage === "accepted" ? "in_progress" : r.stage,
                                    linked: [...r.linked, { kind, id, label: `${label} from ${r.id}` }],
                                    events: [...r.events, { at: TODAY, actor: EXEC, detail: `${kind} ${id} created and linked to ${r.id}` }],
                                  }
                                : r,
                            ),
                          );
                          toast.success(`${kind} ${id} linked to ${active.id}`, {
                            description: "No duplicate request record created.",
                          });
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      className="col-span-2"
                      variant="default"
                      disabled={!["in_progress", "correction_required", "blocked"].includes(active.stage)}
                      onClick={() => setDialog("report")}
                    >
                      Submit Completion Report
                    </Button>
                  </div>
                </div>

                {/* RM review */}
                {["submitted_for_review"].includes(active.stage) && (
                  <Card className="border-sky-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Relationship Manager review</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          update(active.id, { stage: "closed", nextAction: "—" }, `Completion approved by ${active.rm} — request closed`);
                          toast.success(`${active.id} approved and closed`);
                        }}
                      >
                        Approve Completion
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          update(
                            active.id,
                            { stage: "correction_required", nextAction: "Apply RM correction and re-submit" },
                            `Correction requested by ${active.rm} — same Request ID retained`,
                          );
                          toast.info(`Correction requested on ${active.id}`);
                        }}
                      >
                        Request Correction
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          update(active.id, {}, `Feedback added by ${active.rm}`);
                          toast.success("Feedback recorded in activity history");
                        }}
                      >
                        Add Feedback
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {["closed", "approved", "completed"].includes(active.stage) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      update(active.id, { stage: "in_progress", nextAction: "Reopened by RM — rework in progress" }, `Reopened by ${active.rm} using the same Request ID`);
                      toast.info(`${active.id} reopened`);
                    }}
                  >
                    Reopen Request (same ID)
                  </Button>
                )}

                {/* History */}
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <History className="h-4 w-4" /> Activity history
                  </div>
                  <div className="space-y-2">
                    {[...active.events].reverse().map((e, i) => (
                      <div key={i} className="rounded-md border px-2 py-1 text-xs">
                        <div className="text-[11px] text-muted-foreground">{e.at} · {e.actor}</div>
                        {e.detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {active && (
        <ActionDialog
          kind={dialog}
          request={active}
          onClose={() => setDialog(null)}
          onSubmit={(patch, event) => {
            update(active.id, patch, event);
            setDialog(null);
          }}
        />
      )}
    </div>
  );
}

function ActionDialog({
  kind,
  request,
  onClose,
  onSubmit,
}: {
  kind: null | "accept" | "info" | "return" | "report";
  request: MarketingRequestFull;
  onClose: () => void;
  onSubmit: (patch: Partial<MarketingRequestFull>, event: string) => void;
}) {
  const [objective, setObjective] = useState(request.outcome);
  const [plan, setPlan] = useState("");
  const [expected, setExpected] = useState(request.dueDate);
  const [budgetOk, setBudgetOk] = useState(request.budgetApproved);
  const [next, setNext] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [note, setNote] = useState("");
  const [report, setReport] = useState({
    workDone: "",
    linkedId: request.linked[0]?.id ?? "",
    proof: "",
    budgetUsed: "",
    leads: "",
    sales: "",
    pending: "",
    note: "",
  });

  const toggle = (v: string) =>
    setItems((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {kind === "accept" && (
          <>
            <DialogHeader><DialogTitle>Accept {request.id}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div><Label className="text-xs">Assigned executive</Label><Input value={EXEC} readOnly /></div>
              <div><Label className="text-xs">Acceptance date & time</Label><Input value={`${TODAY} 15:20 IST`} readOnly /></div>
              <div><Label className="text-xs">Confirmed objective</Label><Textarea value={objective} maxLength={400} onChange={(e) => setObjective(e.target.value)} /></div>
              <div><Label className="text-xs">Planned action</Label><Textarea value={plan} maxLength={400} onChange={(e) => setPlan(e.target.value)} placeholder="What you will do first" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Expected completion</Label><Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></div>
                <div><Label className="text-xs">Next action</Label><Input value={next} maxLength={120} onChange={(e) => setNext(e.target.value)} placeholder="e.g. Prepare creatives" /></div>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <Checkbox checked={budgetOk} onCheckedChange={(v) => setBudgetOk(!!v)} />
                Required budget approval confirmed ({inr(request.budget)})
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                disabled={!plan.trim() || !next.trim()}
                onClick={() => {
                  onSubmit(
                    { stage: "accepted", dueDate: expected, budgetApproved: budgetOk, nextAction: next.trim(), outcome: objective.trim() },
                    `Accepted — plan: ${plan.trim()} · expected ${expected}${budgetOk ? " · budget approved" : " · budget approval pending"}`,
                  );
                  toast.success(`${request.id} accepted`, { description: `${request.rm} notified.` });
                }}
              >
                Accept Request
              </Button>
            </DialogFooter>
          </>
        )}

        {kind === "info" && (
          <>
            <DialogHeader><DialogTitle>Ask for information — {request.id}</DialogTitle></DialogHeader>
            <p className="text-xs text-muted-foreground">
              {request.rm} must respond inside this same Request ID.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {INFO_CHECKLIST.map((c) => (
                <label key={c} className="flex items-center gap-2 text-xs">
                  <Checkbox checked={items.includes(c)} onCheckedChange={() => toggle(c)} /> {c}
                </label>
              ))}
            </div>
            <Textarea value={note} maxLength={400} onChange={(e) => setNote(e.target.value)} placeholder="Clarification note for the Relationship Manager" />
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                disabled={items.length === 0}
                onClick={() => {
                  onSubmit(
                    { stage: "information_required", nextAction: `Waiting on RM: ${items.join(", ")}` },
                    `Information requested: ${items.join(", ")}${note.trim() ? ` — ${note.trim()}` : ""}`,
                  );
                  toast.info(`Information requested from ${request.rm}`);
                }}
              >
                Send Request
              </Button>
            </DialogFooter>
          </>
        )}

        {kind === "return" && (
          <>
            <DialogHeader><DialogTitle>Return {request.id}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Return reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RETURN_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Missing information</Label>
                <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {INFO_CHECKLIST.slice(0, 8).map((c) => (
                    <label key={c} className="flex items-center gap-2 text-xs">
                      <Checkbox checked={items.includes(c)} onCheckedChange={() => toggle(c)} /> {c}
                    </label>
                  ))}
                </div>
              </div>
              <Textarea value={note} maxLength={400} onChange={(e) => setNote(e.target.value)} placeholder="Explain to the Relationship Manager" />
              <p className="text-[11px] text-muted-foreground">History is preserved; the same Request ID is reused on re-submission.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={!note.trim() || items.length === 0}
                onClick={() => {
                  onSubmit(
                    {
                      stage: "returned",
                      returnedCount: request.returnedCount + 1,
                      nextAction: `Returned to ${request.rm} — ${reason}`,
                    },
                    `Returned — ${reason}; missing: ${items.join(", ")} — ${note.trim()}`,
                  );
                  toast.error(`${request.id} returned to ${request.rm}`);
                }}
              >
                Return Request
              </Button>
            </DialogFooter>
          </>
        )}

        {kind === "report" && (
          <>
            <DialogHeader><DialogTitle>Completion report — {request.id}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Work completed</Label><Textarea value={report.workDone} maxLength={600} onChange={(e) => setReport({ ...report, workDone: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Campaign / Activity ID</Label><Input value={report.linkedId} maxLength={20} onChange={(e) => setReport({ ...report, linkedId: e.target.value })} placeholder="CMP-0000" /></div>
                <div><Label className="text-xs">Completion date</Label><Input value={TODAY} readOnly /></div>
                <div><Label className="text-xs">Supporting link or file</Label><Input value={report.proof} maxLength={140} onChange={(e) => setReport({ ...report, proof: e.target.value })} /></div>
                <div><Label className="text-xs">Budget used (₹)</Label><Input inputMode="numeric" value={report.budgetUsed} maxLength={9} onChange={(e) => setReport({ ...report, budgetUsed: e.target.value.replace(/\D/g, "") })} /></div>
                <div><Label className="text-xs">Leads generated</Label><Input inputMode="numeric" value={report.leads} maxLength={6} onChange={(e) => setReport({ ...report, leads: e.target.value.replace(/\D/g, "") })} /></div>
                <div><Label className="text-xs">Sales generated (₹)</Label><Input inputMode="numeric" value={report.sales} maxLength={9} onChange={(e) => setReport({ ...report, sales: e.target.value.replace(/\D/g, "") })} /></div>
              </div>
              <div><Label className="text-xs">Pending actions</Label><Input value={report.pending} maxLength={200} onChange={(e) => setReport({ ...report, pending: e.target.value })} /></div>
              <div><Label className="text-xs">Executive note</Label><Textarea value={report.note} maxLength={400} onChange={(e) => setReport({ ...report, note: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                disabled={!report.workDone.trim() || !report.linkedId.trim() || !report.proof.trim() || !report.budgetUsed}
                onClick={() => {
                  onSubmit(
                    {
                      stage: "submitted_for_review",
                      nextAction: `Awaiting ${request.rm} review of completion report`,
                      report: {
                        workDone: report.workDone.trim(),
                        linkedId: report.linkedId.trim(),
                        completedOn: TODAY,
                        proof: report.proof.trim(),
                        budgetUsed: Number(report.budgetUsed),
                        leads: report.leads ? Number(report.leads) : undefined,
                        sales: report.sales ? Number(report.sales) : undefined,
                        pending: report.pending.trim() || "None",
                        note: report.note.trim(),
                      },
                    },
                    `Completion report submitted (${report.linkedId.trim()}) — ${request.rm} notified for review`,
                  );
                  toast.success("Completion report submitted", { description: `${request.rm} notified for review.` });
                }}
              >
                Submit for Review
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
