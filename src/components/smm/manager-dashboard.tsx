import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  FilePlus2,
  Link2Off,
  MessageSquarePlus,
  Plus,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
  Video,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AUDIT_LOG,
  MANAGER_NAME,
  REVIEW_CHECKLIST,
  SHARED_CONTENT,
  SHARED_LEADS,
  SOCIAL_ACCOUNT_HEALTH,
  type SharedContent,
  type SharedLead,
} from "./shared-records";

const TODAY = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/* ---------------- tone helpers ---------------- */

function toneClasses(tone: "red" | "amber" | "blue" | "green" | "grey") {
  switch (tone) {
    case "red":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "amber":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "blue":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "green":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function stageTone(stage: SharedContent["stage"]): "red" | "amber" | "blue" | "green" | "grey" {
  if (stage === "Correction Required") return "red";
  if (stage === "Submitted for Review") return "amber";
  if (stage === "Approved" || stage === "Published") return "green";
  if (stage === "Scheduled" || stage === "Editing" || stage === "Assigned to Editor") return "blue";
  return "grey";
}

function publishTone(status: SharedContent["publishStatus"]): "red" | "amber" | "blue" | "green" | "grey" {
  if (status === "Failed") return "red";
  if (status === "Reschedule Required") return "amber";
  if (status === "Published") return "green";
  if (status === "Scheduled" || status === "Ready to Publish") return "blue";
  return "grey";
}

function handoverTone(status: SharedLead["status"]): "red" | "amber" | "blue" | "green" | "grey" {
  if (status === "Rejected by Sales Head" || status === "Duplicate Suspected") return "red";
  if (status === "Captured" || status === "Duplicate Check") return "amber";
  if (status === "Accepted by Sales Head") return "green";
  if (status === "Sent to Sales Head" || status === "Qualified") return "blue";
  return "grey";
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "red" | "amber" | "blue" | "green" | "grey";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClasses(tone)}`}
    >
      {children}
    </span>
  );
}

function Thumb({ tone, label }: { tone: string; label: string }) {
  return (
    <div
      className={`h-12 w-16 shrink-0 rounded-md border bg-gradient-to-br ${tone} flex items-center justify-center`}
    >
      <Video className="h-4 w-4 text-muted-foreground" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/* ---------------- main ---------------- */

export function SmmManagerDashboard({ onNavigate }: { onNavigate?: (key: string) => void }) {
  const [query, setQuery] = useState("");
  const [content, setContent] = useState<SharedContent[]>(SHARED_CONTENT);
  const [leads, setLeads] = useState<SharedLead[]>(SHARED_LEADS);
  const [log, setLog] = useState(AUDIT_LOG);
  const [reviewTarget, setReviewTarget] = useState<SharedContent | null>(null);
  const [leadTarget, setLeadTarget] = useState<SharedLead | null>(null);

  const record = (action: string) =>
    setLog((l) => [{ at: "Just now", who: `${MANAGER_NAME} (SMM)`, action }, ...l]);

  const go = (key: string, label: string) => {
    if (onNavigate) onNavigate(key);
    else toast.info(`${label} — open from the side menu.`);
  };

  /* ------- derived KPIs from the shared records ------- */
  const kpi = useMemo(() => {
    const inProduction = content.filter((c) =>
      ["Raw Received", "Assigned to Editor", "Editing"].includes(c.stage),
    ).length;
    const waitingReview = content.filter((c) => c.stage === "Submitted for Review").length;
    const corrections = content.filter((c) => c.stage === "Correction Required").length;
    const scheduledToday = content.filter(
      (c) => c.publishTime?.startsWith("Today") && c.publishStatus !== "Published",
    ).length;
    const publishedMonth = content.filter((c) => c.publishStatus === "Published").length;
    const newLeads = leads.filter((l) => ["Captured", "Duplicate Suspected"].includes(l.status)).length;
    const awaitingHandover = leads.filter((l) => l.status === "Qualified").length;
    const accountAlerts = SOCIAL_ACCOUNT_HEALTH.filter((a) => a.warning).length;
    return [
      { label: "Content in Production", value: inProduction, sub: "Raw / assigned / editing", tone: "blue" as const },
      { label: "Waiting for Review", value: waitingReview, sub: "Submitted by editors", tone: "amber" as const },
      { label: "Corrections Pending", value: corrections, sub: "Returned to editor", tone: "red" as const },
      { label: "Scheduled Today", value: scheduledToday, sub: "Across all platforms", tone: "blue" as const },
      { label: "Published This Month", value: publishedMonth, sub: "Live posts", tone: "green" as const },
      { label: "New Social Leads", value: newLeads, sub: "Awaiting qualification", tone: "amber" as const },
      { label: "Leads Awaiting Handover", value: awaitingHandover, sub: "Qualified, not sent", tone: "amber" as const },
      { label: "Account Alerts", value: accountAlerts, sub: "Connection / publishing", tone: "red" as const },
    ];
  }, [content, leads]);

  const production = useMemo(() => {
    const count = (s: SharedContent["stage"]) => content.filter((c) => c.stage === s).length;
    return [
      { label: "Raw content received", value: count("Raw Received"), tone: "grey" as const },
      { label: "Assigned to editor", value: count("Assigned to Editor"), tone: "blue" as const },
      { label: "Editing in progress", value: count("Editing"), tone: "blue" as const },
      { label: "Submitted for review", value: count("Submitted for Review"), tone: "amber" as const },
      { label: "Correction required", value: count("Correction Required"), tone: "red" as const },
      { label: "Approved", value: count("Approved"), tone: "green" as const },
      { label: "Scheduled", value: count("Scheduled"), tone: "blue" as const },
      { label: "Published", value: count("Published"), tone: "green" as const },
    ];
  }, [content]);

  const submissions = useMemo(
    () =>
      content
        .filter((c) => c.stage === "Submitted for Review")
        .concat(content.filter((c) => c.stage === "Correction Required"))
        .slice(0, 5),
    [content],
  );

  const todaySchedule = useMemo(
    () => content.filter((c) => c.publishTime?.startsWith("Today")),
    [content],
  );

  const priorities = useMemo(() => {
    const rows: { text: string; tone: "red" | "amber" | "blue" | "green"; cta: string; key: string }[] = [];
    content
      .filter((c) => c.stage === "Submitted for Review")
      .forEach((c) =>
        rows.push({
          text: `${c.contentId} · ${c.title} awaiting review (${c.reviewWaitHours ?? 0}h)`,
          tone: (c.reviewWaitHours ?? 0) > 12 ? "red" : "amber",
          cta: "Review",
          key: "review",
        }),
      );
    content
      .filter((c) => c.stage === "Correction Required")
      .forEach((c) =>
        rows.push({
          text: `${c.contentId} correction due ${c.dueAt} — with ${c.editor}`,
          tone: "amber",
          cta: "Open",
          key: "queue",
        }),
      );
    todaySchedule
      .filter((c) => c.publishStatus !== "Published")
      .forEach((c) =>
        rows.push({
          text: `${c.publishTime} · ${c.title} scheduled on ${c.platform}`,
          tone: c.publishStatus === "Failed" ? "red" : "blue",
          cta: "Schedule",
          key: "calendar",
        }),
      );
    content
      .filter((c) => c.stage !== "Raw Received" && (!c.hasCaption || !c.hasThumbnail))
      .forEach((c) =>
        rows.push({
          text: `${c.contentId} missing ${[!c.hasCaption && "caption", !c.hasThumbnail && "thumbnail"]
            .filter(Boolean)
            .join(" & ")}`,
          tone: "amber",
          cta: "Fix",
          key: "queue",
        }),
      );
    leads
      .filter((l) => l.status === "Captured")
      .forEach((l) =>
        rows.push({
          text: `New lead ${l.name} (${l.platform}) awaiting qualification`,
          tone: l.ageHours > 4 ? "red" : "amber",
          cta: "Qualify",
          key: "leads",
        }),
      );
    leads
      .filter((l) => l.status === "Sent to Sales Head")
      .forEach((l) =>
        rows.push({
          text: `${l.leadId} ${l.name} awaiting Sales Head acceptance (${l.ageHours}h)`,
          tone: l.ageHours > 24 ? "red" : "blue",
          cta: "Follow up",
          key: "leads",
        }),
      );
    SOCIAL_ACCOUNT_HEALTH.filter((a) => a.warning).forEach((a) =>
      rows.push({
        text: `${a.platform} — ${a.warning}`,
        tone: a.connection === "Disconnected" ? "red" : "amber",
        cta: "Account",
        key: "accounts",
      }),
    );
    return rows;
  }, [content, leads, todaySchedule]);

  const alerts = useMemo(() => {
    const out: { text: string; tone: "red" | "amber" }[] = [];
    content.filter((c) => c.overdue).forEach((c) => out.push({ text: `Content overdue — ${c.contentId} ${c.title} (due ${c.dueAt})`, tone: "red" }));
    content
      .filter((c) => (c.reviewWaitHours ?? 0) > 12)
      .forEach((c) => out.push({ text: `Submission waiting ${c.reviewWaitHours}h for review — ${c.contentId}`, tone: "red" }));
    content.filter((c) => c.returnCount >= 2).forEach((c) => out.push({ text: `${c.contentId} returned ${c.returnCount} times — quality check needed`, tone: "amber" }));
    content
      .filter((c) => c.publishTime && !c.approvedVersion)
      .forEach((c) => out.push({ text: `Scheduled post without approved video — ${c.contentId}`, tone: "red" }));
    content
      .filter((c) => c.publishTime && (!c.hasCaption || !c.hasThumbnail || !c.hasCta))
      .forEach((c) =>
        out.push({
          text: `${c.contentId} missing ${[!c.hasCaption && "caption", !c.hasThumbnail && "thumbnail", !c.hasCta && "CTA"]
            .filter(Boolean)
            .join(", ")}`,
          tone: "amber",
        }),
      );
    content.filter((c) => c.publishStatus === "Failed").forEach((c) => out.push({ text: `Publishing failure — ${c.contentId} on ${c.platform}`, tone: "red" }));
    SOCIAL_ACCOUNT_HEALTH.filter((a) => a.connection === "Disconnected").forEach((a) =>
      out.push({ text: `Social account disconnected — ${a.platform} (${a.accountName})`, tone: "red" }),
    );
    leads.filter((l) => l.status === "Captured" && l.ageHours > 4).forEach((l) => out.push({ text: `Lead not reviewed within SLA — ${l.leadId} ${l.name} (${l.ageHours}h)`, tone: "red" }));
    leads.filter((l) => l.status === "Sent to Sales Head" && l.ageHours > 24).forEach((l) => out.push({ text: `Lead not accepted by Sales Head — ${l.leadId} (${l.ageHours}h)`, tone: "red" }));
    leads.filter((l) => l.status === "Duplicate Suspected").forEach((l) => out.push({ text: `Duplicate lead requiring verification — ${l.leadId} vs ${l.duplicateOf}`, tone: "amber" }));
    return out;
  }, [content, leads]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return {
      content: content.filter(
        (c) => c.title.toLowerCase().includes(q) || c.contentId.toLowerCase().includes(q),
      ),
      leads: leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.leadId.toLowerCase().includes(q) ||
          l.mobile.includes(q),
      ),
    };
  }, [query, content, leads]);

  /* ------- actions on the shared record ------- */

  const approve = (c: SharedContent) => {
    setContent((list) =>
      list.map((x) =>
        x.contentId === c.contentId
          ? {
              ...x,
              stage: "Approved",
              approvedVersion: x.currentVersion,
              reviewWaitHours: undefined,
              publishStatus: x.publishTime ? "Ready to Publish" : x.publishStatus,
              versions: x.versions.map((v) =>
                v.version === x.currentVersion ? { ...v, outcome: "Approved" } : v,
              ),
            }
          : x,
      ),
    );
    record(`Approved ${c.contentId} ${c.currentVersion} (version locked)`);
    toast.success(`${c.contentId} approved — ${c.currentVersion} locked as reviewed version.`);
    setReviewTarget(null);
  };

  const requestCorrection = (c: SharedContent, note: string) => {
    setContent((list) =>
      list.map((x) =>
        x.contentId === c.contentId
          ? {
              ...x,
              stage: "Correction Required",
              returnCount: x.returnCount + 1,
              reviewWaitHours: undefined,
              versions: x.versions.map((v) =>
                v.version === x.currentVersion ? { ...v, outcome: "Correction Requested", note } : v,
              ),
            }
          : x,
      ),
    );
    record(`Requested correction on ${c.contentId} ${c.currentVersion}`);
    toast.warning(`Correction requested on ${c.contentId} — editor must submit a new version.`);
    setReviewTarget(null);
  };

  const sendToSalesHead = (l: SharedLead) => {
    if (l.status === "Sent to Sales Head" || l.status === "Accepted by Sales Head") {
      toast.info(`${l.leadId} is already with the Sales Head — no duplicate created.`);
      return;
    }
    if (l.status === "Duplicate Suspected") {
      toast.error(`Verify duplicate against ${l.duplicateOf} before handover.`);
      return;
    }
    setLeads((list) =>
      list.map((x) =>
        x.leadId === l.leadId ? { ...x, status: "Sent to Sales Head", sentAt: "Just now" } : x,
      ),
    );
    record(`Handed over ${l.leadId} to Sales Head`);
    toast.success(`${l.leadId} handed over to Sales Head (same record, no duplicate).`);
    setLeadTarget(null);
  };

  const qualify = (l: SharedLead) => {
    setLeads((list) => list.map((x) => (x.leadId === l.leadId ? { ...x, status: "Qualified" } : x)));
    record(`Qualified ${l.leadId}`);
    toast.success(`${l.leadId} qualified and ready for handover.`);
  };

  const quickActions = [
    { label: "Create Content", icon: FilePlus2, key: "queue" },
    { label: "Assign Video Editor", icon: UserPlus, key: "queue" },
    { label: "Review Submission", icon: CheckCircle2, key: "review" },
    { label: "Schedule Post", icon: CalendarClock, key: "calendar" },
    { label: "Add Social Lead", icon: Plus, key: "leads" },
    { label: "Handover Leads", icon: Send, key: "leads" },
    { label: "Create Task", icon: ClipboardList, key: "tasks" },
    { label: "Open Analytics", icon: Eye, key: "analytics" },
  ];

  return (
    <div className="space-y-5">
      {/* ---------- header ---------- */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {MANAGER_NAME}</h1>
          <p className="text-sm text-muted-foreground">{TODAY} · Social Media Account Manager</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search content or lead"
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {alerts.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {alerts.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {alerts.slice(0, 8).map((a, i) => (
                <DropdownMenuItem key={i} className="text-xs whitespace-normal">
                  <AlertTriangle
                    className={`mr-2 h-3.5 w-3.5 shrink-0 ${a.tone === "red" ? "text-destructive" : "text-amber-600"}`}
                  />
                  {a.text}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => go("queue", "Create Content")}>
            <FilePlus2 className="mr-1.5 h-4 w-4" /> Create Content
          </Button>
          <Button variant="secondary" onClick={() => go("leads", "Add Lead")}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {searchResults && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Search results for “{query}” — {searchResults.content.length} content,{" "}
              {searchResults.leads.length} leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {searchResults.content.map((c) => (
              <div key={c.contentId} className="flex items-center justify-between gap-2 border-b py-1.5 last:border-0">
                <span className="truncate">
                  <span className="font-mono text-xs text-muted-foreground">{c.contentId}</span> · {c.title}
                </span>
                <Pill tone={stageTone(c.stage)}>{c.stage}</Pill>
              </div>
            ))}
            {searchResults.leads.map((l) => (
              <div key={l.leadId} className="flex items-center justify-between gap-2 border-b py-1.5 last:border-0">
                <span className="truncate">
                  <span className="font-mono text-xs text-muted-foreground">{l.leadId}</span> · {l.name} · {l.platform}
                </span>
                <Pill tone={handoverTone(l.status)}>{l.status}</Pill>
              </div>
            ))}
            {searchResults.content.length === 0 && searchResults.leads.length === 0 && (
              <p className="text-muted-foreground">No matching content or lead record.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---------- KPI cards ---------- */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpi.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div
                className={`mt-1 text-3xl font-bold tabular-nums ${
                  k.value === 0
                    ? "text-muted-foreground"
                    : k.tone === "red"
                    ? "text-destructive"
                    : k.tone === "amber"
                    ? "text-amber-600"
                    : k.tone === "green"
                    ? "text-emerald-600"
                    : "text-blue-600"
                }`}
              >
                {k.value}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------- priorities + alerts ---------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today’s Priorities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[360px] overflow-auto">
            {priorities.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      p.tone === "red"
                        ? "bg-destructive"
                        : p.tone === "amber"
                        ? "bg-amber-500"
                        : p.tone === "green"
                        ? "bg-emerald-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span className="truncate text-sm">{p.text}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => go(p.key, p.cta)}>
                  {p.cta}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Attention Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[360px] overflow-auto">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-md border p-2 text-xs ${
                  a.tone === "red"
                    ? "border-destructive/30 bg-destructive/5 text-destructive"
                    : "border-amber-500/30 bg-amber-500/5 text-amber-700"
                }`}
              >
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ---------- production summary ---------- */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Content Production Summary</CardTitle>
          <Button size="sm" variant="outline" onClick={() => go("queue", "Content Queue")}>
            View Content Queue
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {production.map((p) => (
              <div key={p.label} className={`rounded-md border p-3 ${toneClasses(p.tone)}`}>
                <div className="text-2xl font-bold tabular-nums">{p.value}</div>
                <div className="text-[11px] leading-tight">{p.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------- review & approval ---------- */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Review &amp; Approval — latest submissions</CardTitle>
          <Badge variant="outline">Checklist required before approval</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {submissions.map((c) => (
            <div key={c.contentId} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              <Thumb tone={c.thumbTone} label={c.title} />
              <div className="min-w-[200px] flex-1">
                <div className="truncate text-sm font-medium">{c.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-mono">{c.contentId}</span> · {c.editor} · {c.currentVersion} ·{" "}
                  {c.platform}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Pill tone={stageTone(c.stage)}>{c.stage}</Pill>
                  <Pill tone={c.overdue ? "red" : "grey"}>Due {c.dueAt}</Pill>
                  {c.submittedAt && <Pill tone="grey">Submitted {c.submittedAt}</Pill>}
                  {c.returnCount >= 2 && <Pill tone="red">Returned {c.returnCount}×</Pill>}
                </div>
              </div>
              <Button size="sm" onClick={() => setReviewTarget(c)}>
                Review
              </Button>
            </div>
          ))}
          {submissions.length === 0 && (
            <p className="text-sm text-muted-foreground">No submissions waiting for review.</p>
          )}
        </CardContent>
      </Card>

      {/* ---------- publishing schedule ---------- */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Publishing Schedule — today</CardTitle>
          <Button size="sm" variant="outline" onClick={() => go("calendar", "Publishing Calendar")}>
            Open Calendar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaySchedule.map((c) => (
            <div key={c.contentId} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              <div className="w-16 shrink-0 text-sm font-semibold tabular-nums">
                {c.publishTime?.replace("Today, ", "")}
              </div>
              <Thumb tone={c.thumbTone} label={c.title} />
              <div className="min-w-[180px] flex-1">
                <div className="truncate text-sm font-medium">{c.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-mono">{c.contentId}</span> · {c.platform} · {c.type}
                </div>
              </div>
              <Pill tone={c.hasCaption ? "green" : "amber"}>
                {c.hasCaption ? "Caption ready" : "Caption missing"}
              </Pill>
              <Pill tone={publishTone(c.publishStatus)}>{c.publishStatus}</Pill>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.info(`${c.contentId} · ${c.title} — ${c.publishStatus}`)}
              >
                View
              </Button>
            </div>
          ))}
          {todaySchedule.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing scheduled for today.</p>
          )}
        </CardContent>
      </Card>

      {/* ---------- account health ---------- */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            Social Account Health
            <span className="text-[11px] font-normal text-muted-foreground">
              (passwords and access tokens are never shown)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {SOCIAL_ACCOUNT_HEALTH.map((a) => (
            <div key={a.platform + a.accountName} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {a.platform} · {a.accountName}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Last post {a.lastPost} · {a.scheduledCount} scheduled
                  </div>
                </div>
                <Pill
                  tone={
                    a.connection === "Disconnected"
                      ? "red"
                      : a.connection === "Token Expiring"
                      ? "amber"
                      : a.connection === "Placeholder"
                      ? "grey"
                      : "green"
                  }
                >
                  {a.connection}
                </Pill>
              </div>
              {a.warning && (
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700">
                  <Link2Off className="mt-0.5 h-3 w-3 shrink-0" />
                  {a.warning}
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="mt-1 px-0"
                onClick={() => go("accounts", "Social Accounts")}
              >
                View Account
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---------- leads & handover ---------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads &amp; Handover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { l: "New enquiries", v: leads.filter((x) => x.status === "Captured").length, tone: "amber" as const },
              { l: "Requiring qualification", v: leads.filter((x) => x.status === "Captured").length, tone: "amber" as const },
              { l: "Duplicates detected", v: leads.filter((x) => x.status === "Duplicate Suspected").length, tone: "red" as const },
              { l: "Awaiting Sales Head assignment", v: leads.filter((x) => x.status === "Qualified").length, tone: "blue" as const },
              { l: "Handed over today", v: leads.filter((x) => x.sentAt?.includes("Today") || x.sentAt === "Just now").length, tone: "green" as const },
              { l: "Not accepted within SLA", v: leads.filter((x) => x.status === "Sent to Sales Head" && x.ageHours > 24).length, tone: "red" as const },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between border-b pb-1.5 last:border-0">
                <span className="text-muted-foreground">{r.l}</span>
                <Pill tone={r.tone}>{r.v}</Pill>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Lead cards</CardTitle>
            <Button size="sm" variant="outline" onClick={() => go("leads", "Leads & Handover")}>
              Open Leads
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2 max-h-[420px] overflow-auto">
            {leads.map((l) => (
              <div key={l.leadId} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {l.mobile} · {l.city}
                    </div>
                  </div>
                  <Pill tone={l.priority === "High" ? "red" : l.priority === "Medium" ? "amber" : "grey"}>
                    {l.priority}
                  </Pill>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                  <span>Platform: {l.platform}</span>
                  <span>Interest: {l.interest}</span>
                  <span className="col-span-2 truncate">Campaign: {l.campaign}</span>
                  <span className="col-span-2 font-mono">Content: {l.contentId}</span>
                  <span className="col-span-2">Enquiry: {l.enquiredAt}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Pill tone={handoverTone(l.status)}>{l.status}</Pill>
                  <Button size="sm" variant="ghost" onClick={() => setLeadTarget(l)}>
                    Review Lead
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => sendToSalesHead(l)}>
                    <Send className="mr-1 h-3 w-3" /> Send to Sales Head
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ---------- quick actions ---------- */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {quickActions.map((q) => {
            const Icon = q.icon;
            return (
              <Button
                key={q.label}
                variant="outline"
                className="h-auto justify-start gap-2 py-3"
                onClick={() => go(q.key, q.label)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs">{q.label}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* ---------- workflow + audit ---------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Workflow rules in force
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs text-muted-foreground">
            {[
              "Every item carries one permanent Content ID across all stages.",
              "Video Editors can neither approve nor publish content.",
              "Approval locks the reviewed version; corrections create a new version.",
              "Published content is never silently replaced.",
              "Leads keep platform, campaign and related Content ID on handover.",
              "Handover sends the same lead record — no duplicates created.",
              "Account passwords and access tokens are never displayed.",
            ].map((r) => (
              <div key={r} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                {r}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Audit log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[220px] overflow-auto text-xs">
            {log.map((e, i) => (
              <div key={i} className="border-b pb-1.5 last:border-0">
                <div className="text-muted-foreground">
                  {e.at} · {e.who}
                </div>
                <div>{e.action}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ReviewDialog
        item={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onApprove={approve}
        onCorrection={requestCorrection}
      />
      <LeadDialog
        lead={leadTarget}
        onClose={() => setLeadTarget(null)}
        onQualify={qualify}
        onSend={sendToSalesHead}
      />
    </div>
  );
}

/* ---------------- review dialog ---------------- */

function ReviewDialog({
  item,
  onClose,
  onApprove,
  onCorrection,
}: {
  item: SharedContent | null;
  onClose: () => void;
  onApprove: (c: SharedContent) => void;
  onCorrection: (c: SharedContent, note: string) => void;
}) {
  const [checked, setChecked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const complete = checked.length === REVIEW_CHECKLIST.length;

  if (!item) return null;

  const toggle = (c: string) =>
    setChecked((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]));

  const close = () => {
    setChecked([]);
    setNote("");
    onClose();
  };

  return (
    <Dialog open onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review — {item.title}</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{item.contentId}</span> · {item.currentVersion} · {item.editor} ·{" "}
            {item.platform}
          </DialogDescription>
        </DialogHeader>

        <div className={`h-32 rounded-md border bg-gradient-to-br ${item.thumbTone} flex items-center justify-center`}>
          <Button variant="secondary" size="sm" onClick={() => toast.info("Preview player — front-end only.")}>
            <Eye className="mr-1.5 h-4 w-4" /> Preview {item.currentVersion}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Review checklist</div>
          {REVIEW_CHECKLIST.map((c) => (
            <label key={c} className="flex items-start gap-2 text-sm">
              <Checkbox checked={checked.includes(c)} onCheckedChange={() => toggle(c)} className="mt-0.5" />
              <span>{c}</span>
            </label>
          ))}
          {!complete && (
            <p className="text-xs text-amber-600">
              Approval is blocked until all {REVIEW_CHECKLIST.length} checks are complete ({checked.length}/
              {REVIEW_CHECKLIST.length}).
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="text-sm font-medium">Comment / correction note</div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain exactly what must change…"
            rows={3}
          />
        </div>

        <div className="rounded-md border p-2 text-xs text-muted-foreground">
          Version history:{" "}
          {item.versions.length === 0
            ? "no submissions yet"
            : item.versions.map((v) => `${v.version} (${v.outcome})`).join(" → ")}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              if (!note.trim()) return toast.error("Add a comment first.");
              toast.success("Comment added to the content record.");
              setNote("");
            }}
          >
            <MessageSquarePlus className="mr-1.5 h-4 w-4" /> Add Comment
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!note.trim()) return toast.error("A correction note is required.");
              onCorrection(item, note.trim());
              setChecked([]);
              setNote("");
            }}
          >
            <XCircle className="mr-1.5 h-4 w-4" /> Request Correction
          </Button>
          <Button
            disabled={!complete}
            onClick={() => {
              onApprove(item);
              setChecked([]);
              setNote("");
            }}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- lead dialog ---------------- */

function LeadDialog({
  lead,
  onClose,
  onQualify,
  onSend,
}: {
  lead: SharedLead | null;
  onClose: () => void;
  onQualify: (l: SharedLead) => void;
  onSend: (l: SharedLead) => void;
}) {
  if (!lead) return null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{lead.leadId}</span> · {lead.platform} · {lead.city}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 text-sm">
          {[
            ["Mobile", lead.mobile],
            ["Campaign", lead.campaign],
            ["Related Content ID", lead.contentId],
            ["Enquiry time", lead.enquiredAt],
            ["Interest", lead.interest],
            ["Priority", lead.priority],
            ["Handover status", lead.status],
            ["Age", `${lead.ageHours}h`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b pb-1 last:border-0">
              <span className="text-muted-foreground">{k}</span>
              <span className="text-right font-medium">{v}</span>
            </div>
          ))}
          {lead.duplicateOf && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
              Possible duplicate of {lead.duplicateOf} — verify before handover.
            </div>
          )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onQualify(lead)} disabled={lead.status !== "Captured" && lead.status !== "Duplicate Suspected"}>
            Mark Qualified
          </Button>
          <Button onClick={() => onSend(lead)}>
            <Send className="mr-1.5 h-4 w-4" /> Send to Sales Head
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
