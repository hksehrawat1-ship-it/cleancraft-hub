import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Copy,
  FileText,
  Lock,
  Phone,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { DEPTS, type Dept } from "./data";
import {
  ACTIVE_STAGES,
  HR_CANDIDATES,
  HR_OPENINGS,
  INTERVIEWERS,
  RESULTS,
  SOURCES,
  STAGES,
  STAGE_TONE,
  normEmail,
  normPhone,
  type HrCandidate,
  type HrOpening,
  type Result,
  type Source,
  type Stage,
} from "./recruitment-data";

const TONE: Record<string, string> = {
  done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  active: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  pending: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  urgent: "border-destructive/50 bg-destructive/5 text-destructive",
  muted: "",
};

const TODAY = "02 Aug 2026";
const ANY = "__any__";

function Kpi({ label, value, tone = "muted" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className={`rounded-xl border p-3 ${TONE[tone]}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  return (
    <Badge variant="outline" className={TONE[STAGE_TONE[stage]]}>
      {stage}
    </Badge>
  );
}

export function HrRecruitment() {
  const [openings, setOpenings] = useState<HrOpening[]>(HR_OPENINGS);
  const [cands, setCands] = useState<HrCandidate[]>(HR_CANDIDATES);
  const [view, setView] = useState("list");
  const [showSalary, setShowSalary] = useState(false);
  const [q, setQ] = useState("");
  const [fOpening, setFOpening] = useState(ANY);
  const [fDept, setFDept] = useState(ANY);
  const [fStage, setFStage] = useState(ANY);
  const [fSource, setFSource] = useState(ANY);
  const [fCity, setFCity] = useState(ANY);
  const [fExp, setFExp] = useState(ANY);
  const [fInt, setFInt] = useState(ANY);

  const [selId, setSelId] = useState<string | null>(null);
  const sel = cands.find((c) => c.id === selId) || null;

  const [openingOpen, setOpeningOpen] = useState(false);
  const [candOpen, setCandOpen] = useState(false);
  const [viewOpening, setViewOpening] = useState<HrOpening | null>(null);
  const [dlg, setDlg] = useState<null | "note" | "interview" | "result" | "reject" | "withdraw" | "offer" | "join">(null);

  const money = (v: string) => (showSalary ? v : "••••••");

  const update = (id: string, patch: Partial<HrCandidate>, log?: string) =>
    setCands((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...patch, history: log ? [...c.history, { at: TODAY, text: log }] : c.history }
          : c,
      ),
    );

  /* ---------- derived ---------- */
  const openPositions = openings
    .filter((o) => o.status === "Open")
    .reduce((s, o) => s + (o.positions - o.filled), 0);
  const newCands = cands.filter((c) => c.stage === "New Application").length;
  const interviewsToday = cands.filter((c) =>
    c.interviews.some((i) => i.date === TODAY && !i.result),
  ).length;
  const offersPending = cands.filter((c) => c.stage === "Offer Sent").length;
  const joiningConfirmed = cands.filter((c) => c.stage === "Joining Confirmed").length;

  const dupIds = useMemo(() => {
    const seen = new Map<string, string>();
    const dups = new Set<string>();
    cands.forEach((c) => {
      [normPhone(c.phone), normEmail(c.email)].forEach((k) => {
        if (!k) return;
        if (seen.has(k)) {
          dups.add(c.id);
          dups.add(seen.get(k)!);
        } else seen.set(k, c.id);
      });
    });
    return dups;
  }, [cands]);

  const filtered = cands.filter((c) => {
    if (q && !`${c.name} ${c.phone} ${c.email} ${c.role} ${c.city}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    if (fOpening !== ANY && c.openingId !== fOpening) return false;
    if (fDept !== ANY && c.dept !== fDept) return false;
    if (fStage !== ANY && c.stage !== fStage) return false;
    if (fSource !== ANY && c.source !== fSource) return false;
    if (fCity !== ANY && c.city !== fCity) return false;
    if (fInt !== ANY && c.interviewer !== fInt) return false;
    if (fExp === "0-2" && c.experience > 2) return false;
    if (fExp === "2-5" && (c.experience < 2 || c.experience > 5)) return false;
    if (fExp === "5+" && c.experience < 5) return false;
    return true;
  });

  const cities = Array.from(new Set(cands.map((c) => c.city)));

  const alerts = useMemo(() => {
    const a: { text: string; tone: string; id?: string }[] = [];
    cands.forEach((c) => {
      if (c.stage === "New Application") a.push({ text: `${c.name} awaiting first contact`, tone: "pending", id: c.id });
      if (c.stage === "Interview Completed" && c.interviews.some((i) => !i.result))
        a.push({ text: `Interview feedback overdue for ${c.name}`, tone: "urgent", id: c.id });
      if (c.stage === "Selected" && !c.offer)
        a.push({ text: `${c.name} selected but no offer created`, tone: "urgent", id: c.id });
      if (c.stage === "Offer Sent" && c.offer)
        a.push({ text: `Offer for ${c.name} expires on ${c.offer.validTill}`, tone: "pending", id: c.id });
      if (c.stage === "Joining Confirmed" && c.offer)
        a.push({ text: `${c.name} joining on ${c.offer.joiningDate}`, tone: "active", id: c.id });
      if (ACTIVE_STAGES.includes(c.stage) && c.docs.some((d) => !d.ok))
        a.push({ text: `Documents missing for ${c.name}`, tone: "pending", id: c.id });
      if (ACTIVE_STAGES.includes(c.stage) && (!c.nextAction || c.nextAction === "—"))
        a.push({ text: `${c.name} has no next action`, tone: "urgent", id: c.id });
      if (dupIds.has(c.id)) a.push({ text: `Possible duplicate record: ${c.name}`, tone: "urgent", id: c.id });
    });
    return a;
  }, [cands, dupIds]);

  const stats = (o: HrOpening) => {
    const list = cands.filter((c) => c.openingId === o.id);
    return {
      received: list.length,
      shortlisted: list.filter((c) =>
        ["Shortlisted", "Interview Scheduled", "Interview Completed", "Selected", "Offer Sent", "Offer Accepted", "Joining Confirmed", "Joined"].includes(c.stage),
      ).length,
      interviews: list.filter((c) => c.interviews.length > 0).length,
      offers: list.filter((c) => ["Offer Sent", "Offer Accepted", "Joining Confirmed", "Joined"].includes(c.stage)).length,
    };
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Recruitment</h1>
              <p className="text-sm text-muted-foreground">
                Job openings, candidates, interviews, offers and joining — {TODAY}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setOpeningOpen(true)}>
                <BriefcaseBusiness className="mr-2 h-4 w-4" /> Create Job Opening
              </Button>
              <Button onClick={() => setCandOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Candidate
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Kpi label="Open Positions" value={openPositions} tone="active" />
            <Kpi label="New Candidates" value={newCands} tone="pending" />
            <Kpi label="Interviews Today" value={interviewsToday} tone="active" />
            <Kpi label="Offers Pending" value={offersPending} tone="pending" />
            <Kpi label="Joining Confirmed" value={joiningConfirmed} tone="done" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Salary details are restricted to HR Head and CEO. Every reveal is logged.
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sal" className="text-xs">
                Show salary
              </Label>
              <Switch
                id="sal"
                checked={showSalary}
                onCheckedChange={(v) => {
                  setShowSalary(v);
                  if (v) toast.info("Salary visibility enabled — access recorded in audit log");
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {!!alerts.length && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Attention Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {alerts.map((a, i) => (
              <button
                key={i}
                onClick={() => a.id && setSelId(a.id)}
                className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 text-left text-sm hover:bg-muted/60 ${TONE[a.tone]}`}
              >
                <span>{a.text}</span>
                <Badge variant={a.tone === "urgent" ? "destructive" : "outline"}>
                  {a.tone === "urgent" ? "Urgent" : a.tone === "active" ? "Active" : "Pending"}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={view} onValueChange={setView}>
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
          <TabsTrigger value="list">Candidate List</TabsTrigger>
          <TabsTrigger value="pipeline">Hiring Pipeline</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="openings">Job Openings</TabsTrigger>
        </TabsList>

        {/* Candidate list */}
        <TabsContent value="list" className="space-y-4 pt-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search candidate by name, phone, email, role or city"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
                {[
                  { v: fOpening, set: setFOpening, ph: "Job opening", opts: openings.map((o) => [o.id, o.title] as const) },
                  { v: fDept, set: setFDept, ph: "Department", opts: DEPTS.map((d) => [d, d] as const) },
                  { v: fStage, set: setFStage, ph: "Stage", opts: STAGES.map((s) => [s, s] as const) },
                  { v: fSource, set: setFSource, ph: "Source", opts: SOURCES.map((s) => [s, s] as const) },
                  { v: fCity, set: setFCity, ph: "Location", opts: cities.map((c) => [c, c] as const) },
                  {
                    v: fExp,
                    set: setFExp,
                    ph: "Experience",
                    opts: [["0-2", "0-2 yrs"], ["2-5", "2-5 yrs"], ["5+", "5+ yrs"]] as const,
                  },
                  { v: fInt, set: setFInt, ph: "Interviewer", opts: INTERVIEWERS.map((i) => [i, i] as const) },
                ].map((f, i) => (
                  <Select key={i} value={f.v} onValueChange={(x) => f.set(x)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder={f.ph} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ANY}>All {f.ph.toLowerCase()}</SelectItem>
                      {f.opts.map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {filtered.length} of {cands.length} candidates
                </span>
                <button
                  className="underline"
                  onClick={() => {
                    setQ("");
                    [setFOpening, setFDept, setFStage, setFSource, setFCity, setFExp, setFInt].forEach((s) => s(ANY));
                  }}
                >
                  Clear filters
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      {["Candidate", "Position", "Stage", "Source", "Exp", "Expected", "Next action", "Due"].map((h) => (
                        <th key={h} className="p-3 text-left font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelId(c.id)}
                        className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                      >
                        <td className="p-3">
                          <div className="font-medium">
                            {c.name}
                            {dupIds.has(c.id) && (
                              <Badge variant="destructive" className="ml-2 text-[10px]">
                                Duplicate?
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {c.city} · {c.id}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>{c.role}</div>
                          <div className="text-xs text-muted-foreground">{c.dept}</div>
                        </td>
                        <td className="p-3">
                          <StageBadge stage={c.stage} />
                        </td>
                        <td className="p-3 text-xs">{c.source}</td>
                        <td className="p-3 tabular-nums">{c.experience} yr</td>
                        <td className="p-3 tabular-nums">{money(c.expectedSalary)}</td>
                        <td className="p-3 text-xs">{c.nextAction}</td>
                        <td className="p-3 text-xs">{c.nextDue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((c) => (
              <Card key={c.id} onClick={() => setSelId(c.id)} className="cursor-pointer">
                <CardContent className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.role} · {c.city}
                      </div>
                    </div>
                    <StageBadge stage={c.stage} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.experience} yr · {c.source} · Expected {money(c.expectedSalary)}
                  </div>
                  <div className="rounded-md border p-2 text-xs">
                    Next: {c.nextAction} · {c.nextDue}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pipeline */}
        <TabsContent value="pipeline" className="pt-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {STAGES.map((s) => {
              const list = cands.filter((c) => c.stage === s);
              return (
                <div key={s} className="w-60 shrink-0">
                  <div className={`mb-2 rounded-lg border p-2 text-xs font-medium ${TONE[STAGE_TONE[s]]}`}>
                    {s} · {list.length}
                  </div>
                  <div className="space-y-2">
                    {list.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelId(c.id)}
                        className="w-full rounded-lg border bg-card p-2.5 text-left text-xs hover:bg-muted/60"
                      >
                        <div className="font-medium">{c.name}</div>
                        <div className="text-muted-foreground">{c.role}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{c.nextAction}</div>
                      </button>
                    ))}
                    {!list.length && (
                      <div className="rounded-lg border border-dashed p-3 text-center text-[11px] text-muted-foreground">
                        None
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Interviews */}
        <TabsContent value="interviews" className="space-y-3 pt-4">
          {cands
            .flatMap((c) => c.interviews.map((i) => ({ c, i })))
            .sort((a, b) => (a.i.result ? 1 : 0) - (b.i.result ? 1 : 0))
            .map(({ c, i }, idx) => (
              <Card key={`${c.id}-${idx}`}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="font-medium">
                      {c.name} <span className="text-xs text-muted-foreground">· {c.role}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {i.round} · {i.date}, {i.time} · {i.mode} · {i.place}
                    </div>
                    <div className="text-xs text-muted-foreground">Interviewer: {i.interviewer}</div>
                    {i.rescheduledFrom && (
                      <div className="text-[11px] text-amber-600">Rescheduled from {i.rescheduledFrom}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {i.result ? (
                      <Badge variant="outline" className={TONE[i.result === "Not Recommended" ? "urgent" : "done"]}>
                        {i.result}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={TONE["pending"]}>
                        Evaluation pending
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelId(c.id)}>
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Job openings */}
        <TabsContent value="openings" className="grid gap-3 pt-4 md:grid-cols-2">
          {openings.map((o) => {
            const s = stats(o);
            return (
              <Card key={o.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{o.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.dept} · {o.location} · {o.employmentType}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={TONE[o.status === "Open" ? "active" : o.status === "Filled" ? "done" : "pending"]}
                    >
                      {o.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      ["Open", o.positions - o.filled],
                      ["Received", s.received],
                      ["Shortlisted", s.shortlisted],
                      ["Interviews", s.interviews],
                      ["Offers", s.offers],
                      ["Filled", o.filled],
                    ].map(([l, v]) => (
                      <div key={l as string} className="rounded-md border p-2">
                        <div className="text-muted-foreground">{l}</div>
                        <div className="font-semibold tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>
                  <Progress value={(o.filled / o.positions) * 100} />
                  <Button variant="outline" className="w-full" onClick={() => setViewOpening(o)}>
                    View Opening
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Candidate detail */}
      <Sheet open={!!sel} onOpenChange={(o) => !o && setSelId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {sel && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {sel.name} <StageBadge stage={sel.stage} />
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 p-4 pt-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Mobile", sel.phone],
                    ["Email", sel.email],
                    ["City", sel.city],
                    ["Applied for", sel.role],
                    ["Source", sel.source],
                    ["Current company", sel.currentCompany],
                    ["Experience", `${sel.experience} years`],
                    ["Notice period", sel.noticePeriod],
                    ["Current salary", money(sel.currentSalary)],
                    ["Expected salary", money(sel.expectedSalary)],
                    ["Owner", sel.owner],
                    ["Interviewer", sel.interviewer || "Not assigned"],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-md border p-2">
                      <div className="text-[11px] text-muted-foreground">{l}</div>
                      <div className="truncate">{v}</div>
                    </div>
                  ))}
                </div>

                <div className={`rounded-lg border p-3 text-sm ${TONE["active"]}`}>
                  <div className="text-xs opacity-80">Next action</div>
                  <div className="font-medium">
                    {sel.nextAction} · due {sel.nextDue}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Resume & documents</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={TONE[sel.resume ? "done" : "urgent"]}>
                      <FileText className="mr-1 h-3 w-3" /> Resume {sel.resume ? "attached" : "missing"}
                    </Badge>
                    {sel.docs.map((d) => (
                      <Badge key={d.name} variant="outline" className={TONE[d.ok ? "done" : "pending"]}>
                        {d.name} {d.ok ? "✓" : "pending"}
                      </Badge>
                    ))}
                  </div>
                </div>

                {sel.offer && (
                  <div className="space-y-1 rounded-lg border p-3 text-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Offer</div>
                    <div>
                      {sel.offer.designation} · {sel.offer.dept} · {sel.offer.location}
                    </div>
                    <div>Manager: {sel.offer.manager}</div>
                    <div>Offered salary: {money(sel.offer.salary)}</div>
                    <div>
                      Joining {sel.offer.joiningDate} · valid till {sel.offer.validTill}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Badge variant="outline" className={TONE[sel.offer.approval === "Approved" ? "done" : "pending"]}>
                        {sel.offer.approval}
                      </Badge>
                      <Badge variant="outline">{sel.offer.letter}</Badge>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info(`Calling ${sel.name} (placeholder)`)}>
                    <Phone className="mr-2 h-4 w-4" /> Call Candidate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDlg("note")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Note
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      update(sel.id, { stage: "Shortlisted", nextAction: "Schedule interview", nextDue: "04 Aug 2026" }, "Shortlisted by HR");
                      toast.success("Candidate shortlisted");
                    }}
                  >
                    Shortlist
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDlg("interview")}>
                    <CalendarClock className="mr-2 h-4 w-4" /> Schedule Interview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDlg("result")}>
                    Record Interview Result
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      update(sel.id, { stage: "Selected", nextAction: "Prepare offer for approval", nextDue: "04 Aug 2026" }, "Marked Selected");
                      toast.success("Candidate selected");
                    }}
                  >
                    Select
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDlg("offer")}>
                    Send Offer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!sel.offer || sel.offer.letter !== "Accepted")
                        return toast.error("Offer must be accepted before confirming joining");
                      update(sel.id, { stage: "Joining Confirmed", nextAction: "Complete pre-joining documents", nextDue: sel.offer.joiningDate }, "Joining confirmed");
                      toast.success("Joining confirmed");
                    }}
                  >
                    Confirm Joining
                  </Button>
                  <Button size="sm" onClick={() => setDlg("join")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Joined
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDlg("withdraw")}>
                    Withdraw
                  </Button>
                  <Button variant="destructive" size="sm" className="col-span-2" onClick={() => setDlg("reject")}>
                    Reject
                  </Button>
                </div>

                {!!sel.notes.length && (
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Notes</div>
                    {sel.notes.map((n, i) => (
                      <div key={i} className="rounded-md border p-2 text-sm">
                        {n}
                      </div>
                    ))}
                  </div>
                )}

                {!!sel.interviews.length && (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Interviews</div>
                    {sel.interviews.map((i, idx) => (
                      <div key={idx} className="rounded-md border p-2 text-xs">
                        <div className="font-medium">
                          {i.round} · {i.date}, {i.time}
                        </div>
                        <div className="text-muted-foreground">
                          {i.mode} · {i.place} · {i.interviewer}
                        </div>
                        {i.rescheduledFrom && (
                          <div className="text-amber-600">Original schedule: {i.rescheduledFrom}</div>
                        )}
                        {i.result && (
                          <div className="mt-1">
                            <Badge variant="outline" className={TONE[i.result === "Not Recommended" ? "urgent" : "done"]}>
                              {i.result}
                            </Badge>
                            <div className="mt-1 text-muted-foreground">{i.comments}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Activity history</div>
                  {sel.history.map((h, i) => (
                    <div key={i} className="flex gap-2 border-b py-1.5 text-xs last:border-0">
                      <span className="w-24 shrink-0 text-muted-foreground">{h.at}</span>
                      <span>{h.text}</span>
                    </div>
                  ))}
                  <p className="pt-2 text-[11px] text-muted-foreground">
                    Recruitment records are never deleted. Stage, document and access history is preserved permanently.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {sel && <CandidateDialogs sel={sel} dlg={dlg} setDlg={setDlg} update={update} openings={openings} setOpenings={setOpenings} />}

      {/* Create job opening */}
      <CreateOpeningDialog
        open={openingOpen}
        onOpenChange={setOpeningOpen}
        onCreate={(o) => setOpenings((p) => [o, ...p])}
      />

      {/* Add candidate */}
      <AddCandidateDialog
        open={candOpen}
        onOpenChange={setCandOpen}
        openings={openings}
        existing={cands}
        onCreate={(c) => setCands((p) => [c, ...p])}
      />

      {/* View opening */}
      <Dialog open={!!viewOpening} onOpenChange={(o) => !o && setViewOpening(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {viewOpening && (
            <>
              <DialogHeader>
                <DialogTitle>{viewOpening.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Department", viewOpening.dept],
                    ["Reporting manager", viewOpening.manager],
                    ["Positions", String(viewOpening.positions)],
                    ["Work location", viewOpening.location],
                    ["Employment type", viewOpening.employmentType],
                    ["Experience required", viewOpening.experience],
                    ["Salary range", money(viewOpening.salaryRange)],
                    ["Target joining", viewOpening.targetJoining],
                    ["Hiring priority", viewOpening.priority],
                    ["Created on", viewOpening.createdOn],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-md border p-2">
                      <div className="text-[11px] text-muted-foreground">{l}</div>
                      <div>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-[11px] text-muted-foreground">Job description</div>
                  {viewOpening.description}
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewOpening.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Candidates</div>
                  {cands
                    .filter((c) => c.openingId === viewOpening.id)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setViewOpening(null);
                          setSelId(c.id);
                        }}
                        className="flex w-full items-center justify-between rounded-md border p-2 text-left text-xs hover:bg-muted"
                      >
                        <span>{c.name}</span>
                        <StageBadge stage={c.stage} />
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- candidate action dialogs ---------- */

function CandidateDialogs({
  sel,
  dlg,
  setDlg,
  update,
  openings,
  setOpenings,
}: {
  sel: HrCandidate;
  dlg: string | null;
  setDlg: (v: any) => void;
  update: (id: string, patch: Partial<HrCandidate>, log?: string) => void;
  openings: HrOpening[];
  setOpenings: React.Dispatch<React.SetStateAction<HrOpening[]>>;
}) {
  const [note, setNote] = useState("");
  const [iv, setIv] = useState({
    round: "Round 1 - HR",
    date: "05 Aug 2026",
    time: "11:00 AM",
    mode: "Online" as "Online" | "In-person",
    place: "Meeting link (placeholder)",
    interviewer: INTERVIEWERS[0],
  });
  const [res, setRes] = useState<{ result: Result; comments: string }>({
    result: "Recommended",
    comments: "",
  });
  const [reason, setReason] = useState("");
  const [offer, setOffer] = useState({
    designation: sel.role,
    dept: sel.dept as Dept,
    manager: "Rahul Sharma",
    location: "Delhi HO",
    salary: sel.expectedSalary,
    joiningDate: "20 Aug 2026",
    validTill: "10 Aug 2026",
    approved: false,
  });

  const close = () => setDlg(null);
  const pending = sel.interviews.findIndex((i) => !i.result);

  return (
    <>
      <Dialog open={dlg === "note"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write your note" />
          <Button
            onClick={() => {
              if (!note.trim()) return toast.error("Note cannot be empty");
              update(sel.id, { notes: [...sel.notes, note.trim()] }, `Note added: ${note.trim().slice(0, 40)}`);
              setNote("");
              close();
              toast.success("Note added");
            }}
          >
            Save Note
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg === "interview"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={iv.round} onChange={(e) => setIv({ ...iv, round: e.target.value })} placeholder="Interview round" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={iv.date} onChange={(e) => setIv({ ...iv, date: e.target.value })} placeholder="Date" />
              <Input value={iv.time} onChange={(e) => setIv({ ...iv, time: e.target.value })} placeholder="Time" />
            </div>
            <Select value={iv.mode} onValueChange={(v) => setIv({ ...iv, mode: v as "Online" | "In-person" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="In-person">In-person</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={iv.place}
              onChange={(e) => setIv({ ...iv, place: e.target.value })}
              placeholder="Location or meeting link (placeholder)"
            />
            <Select value={iv.interviewer} onValueChange={(v) => setIv({ ...iv, interviewer: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEWERS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              If this candidate already has a pending interview, the original schedule is preserved in history.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                const prev = sel.interviews[pending];
                const rescheduledFrom = prev ? `${prev.date}, ${prev.time}` : undefined;
                const next = prev
                  ? sel.interviews.map((x, i) => (i === pending ? { ...iv, rescheduledFrom } : x))
                  : [...sel.interviews, { ...iv }];
                update(
                  sel.id,
                  {
                    interviews: next,
                    stage: "Interview Scheduled",
                    interviewer: iv.interviewer,
                    nextAction: `${iv.round} interview`,
                    nextDue: `${iv.date}, ${iv.time}`,
                  },
                  rescheduledFrom
                    ? `Interview rescheduled from ${rescheduledFrom} to ${iv.date}, ${iv.time}`
                    : `Interview scheduled: ${iv.round} on ${iv.date}, ${iv.time}`,
                );
                close();
                toast.success("Interview scheduled");
              }}
            >
              Save Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg === "result"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Interview Result</DialogTitle>
          </DialogHeader>
          {pending < 0 ? (
            <p className="text-sm text-muted-foreground">No interview awaiting evaluation for this candidate.</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border p-2 text-xs text-muted-foreground">
                {sel.interviews[pending].round} · {sel.interviews[pending].date}, {sel.interviews[pending].time}
              </div>
              <Select value={res.result} onValueChange={(v) => setRes({ ...res, result: v as Result })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULTS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={res.comments}
                onChange={(e) => setRes({ ...res, comments: e.target.value })}
                placeholder="Evaluation comments (required)"
              />
              <Button
                className="w-full"
                onClick={() => {
                  if (!res.comments.trim()) return toast.error("Comments are required to complete an evaluation");
                  const next = sel.interviews.map((x, i) =>
                    i === pending ? { ...x, result: res.result, comments: res.comments.trim() } : x,
                  );
                  update(
                    sel.id,
                    {
                      interviews: next,
                      stage: "Interview Completed",
                      nextAction: res.result === "Not Recommended" ? "Close candidate" : "Decide selection",
                      nextDue: "05 Aug 2026",
                    },
                    `${sel.interviews[pending].round} completed - ${res.result}`,
                  );
                  setRes({ result: "Recommended", comments: "" });
                  close();
                  toast.success("Evaluation recorded");
                }}
              >
                Complete Evaluation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dlg === "reject" || dlg === "withdraw"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dlg === "reject" ? "Reject Candidate" : "Mark Withdrawn"}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={dlg === "reject" ? "Reason for rejection (required)" : "Candidate's reason for withdrawal"}
          />
          <Button
            variant={dlg === "reject" ? "destructive" : "default"}
            onClick={() => {
              if (dlg === "reject" && !reason.trim()) return toast.error("Rejection reason is required");
              update(
                sel.id,
                dlg === "reject"
                  ? { stage: "Rejected", rejectReason: reason.trim(), nextAction: "—", nextDue: "—" }
                  : { stage: "Withdrawn", withdrawReason: reason.trim() || "Not shared", nextAction: "—", nextDue: "—" },
                dlg === "reject"
                  ? `Rejected: ${reason.trim()}`
                  : `Withdrawn: ${reason.trim() || "reason not shared"}`,
              );
              setReason("");
              close();
              toast.success("Record updated — history preserved");
            }}
          >
            Confirm
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg === "offer"} onOpenChange={close}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer & Joining</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={offer.designation} onChange={(e) => setOffer({ ...offer, designation: e.target.value })} placeholder="Offered designation" />
            <Select value={offer.dept} onValueChange={(v) => setOffer({ ...offer, dept: v as Dept })}>
              <SelectTrigger>
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
            <Input value={offer.manager} onChange={(e) => setOffer({ ...offer, manager: e.target.value })} placeholder="Reporting manager" />
            <Input value={offer.location} onChange={(e) => setOffer({ ...offer, location: e.target.value })} placeholder="Work location" />
            <Input value={offer.salary} onChange={(e) => setOffer({ ...offer, salary: e.target.value })} placeholder="Offered salary (restricted)" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={offer.joiningDate} onChange={(e) => setOffer({ ...offer, joiningDate: e.target.value })} placeholder="Joining date" />
              <Input value={offer.validTill} onChange={(e) => setOffer({ ...offer, validTill: e.target.value })} placeholder="Offer validity" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="text-sm">
                <div className="font-medium">Authorised approval</div>
                <div className="text-xs text-muted-foreground">CEO / HR Head approval required before sending</div>
              </div>
              <Switch checked={offer.approved} onCheckedChange={(v) => setOffer({ ...offer, approved: v })} />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!offer.approved) return toast.error("Offer cannot be sent without authorised approval");
                update(
                  sel.id,
                  {
                    stage: "Offer Sent",
                    offer: {
                      designation: offer.designation,
                      dept: offer.dept,
                      manager: offer.manager,
                      location: offer.location,
                      salary: offer.salary,
                      joiningDate: offer.joiningDate,
                      validTill: offer.validTill,
                      approval: "Approved",
                      letter: "Sent",
                    },
                    nextAction: "Follow up on offer acceptance",
                    nextDue: offer.validTill,
                  },
                  `Offer approved and sent, valid till ${offer.validTill}`,
                );
                close();
                toast.success("Offer sent");
              }}
            >
              Approve & Send Offer
            </Button>
            {sel.offer && sel.offer.letter === "Sent" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  update(
                    sel.id,
                    {
                      stage: "Offer Accepted",
                      offer: { ...sel.offer!, letter: "Accepted" },
                      nextAction: "Confirm joining date",
                      nextDue: sel.offer!.joiningDate,
                    },
                    "Offer accepted by candidate",
                  );
                  close();
                  toast.success("Offer marked accepted");
                }}
              >
                Mark Offer Accepted
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg === "join"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {sel.stage === "Joined" ? (
              <p className="text-muted-foreground">
                This candidate is already converted. A duplicate employee record will not be created.
              </p>
            ) : (
              <>
                <div className="rounded-lg border p-3">
                  <div className="font-medium">{sel.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {sel.offer?.designation || sel.role} · {sel.offer?.dept || sel.dept} ·{" "}
                    {sel.offer?.location || "—"}
                  </div>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• One employee profile created from this candidate record</li>
                  <li>• Approved documents and contact details transferred</li>
                  <li>• Unique employee ID generated</li>
                  <li>• Onboarding checklist started</li>
                  <li>• Secure user-account invitation workflow started</li>
                  <li>• Complete recruitment history preserved</li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!sel.offer || sel.offer.letter !== "Accepted")
                      return toast.error("Offer must be accepted before marking joined");
                    const empId = `CC-${150 + Math.floor(Math.random() * 40)}`;
                    const o = openings.find((x) => x.id === sel.openingId);
                    if (o)
                      setOpenings((p) =>
                        p.map((x) =>
                          x.id === o.id
                            ? {
                                ...x,
                                filled: Math.min(x.positions, x.filled + 1),
                                status: x.filled + 1 >= x.positions ? "Filled" : x.status,
                              }
                            : x,
                        ),
                      );
                    update(
                      sel.id,
                      { stage: "Joined", nextAction: "Onboarding in progress", nextDue: "—" },
                      `Converted to employee ${empId} — onboarding and account invite started`,
                    );
                    close();
                    toast.success(`Employee ${empId} created from ${sel.name}`);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" /> Create Employee Profile
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- create dialogs ---------- */

function CreateOpeningDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (o: HrOpening) => void;
}) {
  const [f, setF] = useState({
    title: "",
    dept: "Sales" as Dept,
    manager: "",
    positions: "1",
    location: "Delhi HO",
    employmentType: "Full-time" as HrOpening["employmentType"],
    experience: "1-3 years",
    salaryRange: "",
    description: "",
    skills: "",
    targetJoining: "",
    priority: "Medium" as HrOpening["priority"],
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Opening</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Job title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Select value={f.dept} onValueChange={(v) => setF({ ...f, dept: v as Dept })}>
            <SelectTrigger>
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
          <Input placeholder="Reporting manager" value={f.manager} onChange={(e) => setF({ ...f, manager: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Number of positions" value={f.positions} onChange={(e) => setF({ ...f, positions: e.target.value })} />
            <Input placeholder="Work location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={f.employmentType} onValueChange={(v) => setF({ ...f, employmentType: v as HrOpening["employmentType"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Full-time", "Part-time", "Contract", "Intern"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Experience required" value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} />
          </div>
          <div>
            <Input placeholder="Salary range" value={f.salaryRange} onChange={(e) => setF({ ...f, salaryRange: e.target.value })} />
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Visible only to authorised HR users and the CEO.
            </p>
          </div>
          <Textarea placeholder="Job description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <Input placeholder="Required skills (comma separated)" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Target joining date" value={f.targetJoining} onChange={(e) => setF({ ...f, targetJoining: e.target.value })} />
            <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v as HrOpening["priority"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["High", "Medium", "Low"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p} priority
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!f.title.trim() || !f.manager.trim()) return toast.error("Job title and reporting manager are required");
              onCreate({
                id: `JO-${Math.floor(Math.random() * 90) + 10}`,
                title: f.title.trim(),
                dept: f.dept,
                manager: f.manager.trim(),
                positions: Number(f.positions) || 1,
                location: f.location,
                employmentType: f.employmentType,
                experience: f.experience,
                salaryRange: f.salaryRange || "Not disclosed",
                description: f.description,
                skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
                targetJoining: f.targetJoining || "—",
                priority: f.priority,
                status: "Open",
                filled: 0,
                createdOn: TODAY,
              });
              onOpenChange(false);
              toast.success("Job opening created");
            }}
          >
            Create Opening
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddCandidateDialog({
  open,
  onOpenChange,
  openings,
  existing,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  openings: HrOpening[];
  existing: HrCandidate[];
  onCreate: (c: HrCandidate) => void;
}) {
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    openingId: openings[0]?.id ?? "",
    source: "Naukri" as Source,
    currentCompany: "",
    experience: "1",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "30 days",
    nextAction: "First contact call",
    nextDue: "04 Aug 2026",
  });

  const dup = existing.find(
    (c) =>
      (f.phone && normPhone(c.phone) === normPhone(f.phone)) ||
      (f.email && normEmail(c.email) === normEmail(f.email)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Candidate name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Mobile number" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <Input placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          {dup && (
            <div className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${TONE["urgent"]}`}>
              <Copy className="h-3.5 w-3.5" /> Duplicate detected — {dup.name} ({dup.id}) already exists with this
              phone or email.
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
            <Select value={f.source} onValueChange={(v) => setF({ ...f, source: v as Source })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={f.openingId} onValueChange={(v) => setF({ ...f, openingId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Position applied for" />
            </SelectTrigger>
            <SelectContent>
              {openings.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title} · {o.dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Current company" value={f.currentCompany} onChange={(e) => setF({ ...f, currentCompany: e.target.value })} />
            <Input placeholder="Experience (years)" value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Current salary" value={f.currentSalary} onChange={(e) => setF({ ...f, currentSalary: e.target.value })} />
            <Input placeholder="Expected salary" value={f.expectedSalary} onChange={(e) => setF({ ...f, expectedSalary: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Notice period" value={f.noticePeriod} onChange={(e) => setF({ ...f, noticePeriod: e.target.value })} />
            <Input placeholder="Next action due" value={f.nextDue} onChange={(e) => setF({ ...f, nextDue: e.target.value })} />
          </div>
          <Input placeholder="Next action" value={f.nextAction} onChange={(e) => setF({ ...f, nextAction: e.target.value })} />
          <Button
            className="w-full"
            onClick={() => {
              if (!f.name.trim() || !f.phone.trim()) return toast.error("Candidate name and mobile number are required");
              const o = openings.find((x) => x.id === f.openingId);
              onCreate({
                id: `CAN-${Math.floor(Math.random() * 700) + 300}`,
                name: f.name.trim(),
                phone: f.phone.trim(),
                email: f.email.trim(),
                city: f.city || "—",
                openingId: f.openingId,
                role: o?.title ?? "—",
                dept: (o?.dept ?? "Sales") as Dept,
                source: f.source,
                currentCompany: f.currentCompany || "—",
                experience: Number(f.experience) || 0,
                currentSalary: f.currentSalary || "—",
                expectedSalary: f.expectedSalary || "—",
                noticePeriod: f.noticePeriod,
                resume: false,
                docs: [
                  { name: "Resume", ok: false },
                  { name: "Aadhaar card", ok: false },
                  { name: "PAN card", ok: false },
                  { name: "Experience letter", ok: false },
                ],
                stage: "New Application",
                owner: "Anjali Kapoor",
                nextAction: f.nextAction || "First contact call",
                nextDue: f.nextDue || "—",
                createdOn: TODAY,
                notes: [],
                interviews: [],
                history: [{ at: TODAY, text: `Candidate added manually from ${f.source}` }],
              });
              onOpenChange(false);
              toast.success("Candidate added");
            }}
          >
            Add Candidate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
