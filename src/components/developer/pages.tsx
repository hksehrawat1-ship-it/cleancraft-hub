import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionHead, StatCard } from "@/components/smm/ui";

/* ---------------------------------- data --------------------------------- */

const TICKETS = [
  { id: "DEV-1041", title: "POS bill print misaligned — Jaipur store", from: "Technical Support", priority: "High", status: "In Progress", due: "Today" },
  { id: "DEV-1042", title: "Franchise lead form not saving city field", from: "Sales Head", priority: "High", status: "New", due: "Today" },
  { id: "DEV-1043", title: "Attendance export missing last row", from: "HR Head", priority: "Medium", status: "In Progress", due: "Tomorrow" },
  { id: "DEV-1044", title: "Store dashboard slow on 2G", from: "Relationship Manager", priority: "Medium", status: "Waiting for Info", due: "6 Aug" },
  { id: "DEV-1045", title: "Add GST field in invoice screen", from: "Accounts Manager", priority: "Low", status: "New", due: "8 Aug" },
];

const TASKS = [
  { id: "T-311", project: "Clean Craft OS", task: "Store transfer module — API + UI", stage: "Development", progress: 70, due: "7 Aug" },
  { id: "T-312", project: "POS v3", task: "Offline billing sync queue", stage: "Development", progress: 45, due: "12 Aug" },
  { id: "T-313", project: "Franchise CRM", task: "Lead auto-cadence scheduler", stage: "Testing", progress: 90, due: "5 Aug" },
  { id: "T-314", project: "Mobile App", task: "Field engineer work-report wizard", stage: "Planning", progress: 15, due: "20 Aug" },
];

const SETUPS = [
  { store: "Jaipur", pos: "Installed", printer: "Configured", tariff: "Uploaded", training: "Done", status: "Live" },
  { store: "Indore", pos: "Installed", printer: "Configured", tariff: "Uploaded", training: "Pending", status: "In Progress" },
  { store: "Lucknow", pos: "Installed", printer: "Pending", tariff: "Pending", training: "Pending", status: "In Progress" },
  { store: "Surat", pos: "Pending", printer: "Pending", tariff: "Pending", training: "Pending", status: "Not Started" },
];

const BUGS = [
  { id: "BUG-88", area: "POS Billing", severity: "Critical", status: "Fix in Review", reported: "Technical Support" },
  { id: "BUG-89", area: "Lead Form", severity: "Major", status: "Open", reported: "Sales Executive" },
  { id: "BUG-90", area: "Reports Export", severity: "Minor", status: "Fixed — Testing", reported: "HR Head" },
  { id: "BUG-91", area: "Notifications", severity: "Minor", status: "Closed", reported: "Store Owner" },
];

const RELEASES = [
  { version: "v3.4.0", date: "10 Aug 2026", scope: "Store transfer module, POS offline sync", status: "Planned" },
  { version: "v3.3.2", date: "1 Aug 2026", scope: "Lead form fixes, invoice GST field", status: "Released" },
  { version: "v3.3.1", date: "22 Jul 2026", scope: "Attendance export patch", status: "Released" },
];

const DOCS = [
  { title: "POS installation runbook", type: "Runbook", updated: "2 Aug 2026" },
  { title: "Store onboarding data checklist", type: "Checklist", updated: "28 Jul 2026" },
  { title: "API reference — internal server functions", type: "Reference", updated: "30 Jul 2026" },
  { title: "Release & rollback procedure", type: "Process", updated: "18 Jul 2026" },
  { title: "Known issues & workarounds", type: "Support", updated: "3 Aug 2026" },
];

const tone = (s: string) =>
  ["Live", "Released", "Closed", "Done", "Fixed — Testing", "Configured", "Installed", "Uploaded"].includes(s)
    ? "text-emerald-600"
    : ["Critical", "Overdue", "High"].includes(s)
    ? "text-destructive"
    : ["Pending", "Waiting for Info", "Not Started", "Major", "Planned"].includes(s)
    ? "text-amber-600"
    : "text-blue-600";

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3 flex items-start justify-between gap-3">
      <div className="min-w-0">{left}</div>
      <div className="shrink-0 text-right">{right}</div>
    </div>
  );
}

/* --------------------------------- pages --------------------------------- */

export function DevDashboard() {
  return (
    <div className="space-y-4">
      <SectionHead
        title="Developer Dashboard"
        sub="Your work for today — tickets, project tasks, store setups and open bugs."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Open Tickets" value="5" sub="2 due today" tone="warn" />
        <StatCard label="Project Tasks" value="4" sub="1 in testing" />
        <StatCard label="Open Bugs" value="2" sub="1 critical" tone="bad" />
        <StatCard label="Stores Pending Setup" value="3" sub="of 22 managed" tone="warn" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Next priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TICKETS.slice(0, 3).map((t) => (
              <Row
                key={t.id}
                left={
                  <>
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.id} · from {t.from}
                    </div>
                  </>
                }
                right={
                  <>
                    <Badge variant="outline" className={tone(t.priority)}>
                      {t.priority}
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-1">Due {t.due}</div>
                  </>
                }
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active project tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TASKS.map((t) => (
              <div key={t.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium truncate">{t.task}</span>
                  <span className={`text-xs ${tone(t.stage)}`}>{t.stage}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.project} · due {t.due}
                </div>
                <Progress value={t.progress} className="h-1.5 mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DevTickets() {
  return (
    <div className="space-y-4">
      <SectionHead title="My Tickets" sub="Requests raised by other departments and assigned to you." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="New" value="2" tone="warn" />
        <StatCard label="In Progress" value="2" />
        <StatCard label="Waiting for Info" value="1" tone="warn" />
        <StatCard label="Resolved This Month" value="27" tone="good" />
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          {TICKETS.map((t) => (
            <Row
              key={t.id}
              left={
                <>
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.id} · {t.from} · due {t.due}
                  </div>
                </>
              }
              right={
                <>
                  <Badge variant="outline" className={tone(t.priority)}>
                    {t.priority}
                  </Badge>
                  <div className={`text-[11px] mt-1 ${tone(t.status)}`}>{t.status}</div>
                </>
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function DevProjectTasks() {
  return (
    <div className="space-y-4">
      <SectionHead title="Project Tasks" sub="Planned development work across Clean Craft products." />
      {["Planning", "Development", "Testing"].map((stage) => {
        const rows = TASKS.filter((t) => t.stage === stage);
        return (
          <Card key={stage}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {stage}
                <Badge variant="outline">{rows.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rows.length === 0 && (
                <p className="text-xs text-muted-foreground">No tasks in this stage.</p>
              )}
              {rows.map((t) => (
                <div key={t.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium truncate">{t.task}</span>
                    <span className="text-xs text-muted-foreground">Due {t.due}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.id} · {t.project}
                  </div>
                  <Progress value={t.progress} className="h-1.5 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function DevStorePos() {
  return (
    <div className="space-y-4">
      <SectionHead
        title="Store & POS Setup"
        sub="Software setup status for every new store: POS install, printer, tariff master and owner training."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Stores Live" value="18" tone="good" />
        <StatCard label="In Progress" value="3" />
        <StatCard label="Not Started" value="1" tone="warn" />
        <StatCard label="Avg Setup Time" value="2.4 d" />
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          {SETUPS.map((s) => (
            <div key={s.store} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{s.store}</span>
                <Badge variant="outline" className={tone(s.status)}>
                  {s.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[
                  ["POS install", s.pos],
                  ["Printer", s.printer],
                  ["Tariff master", s.tariff],
                  ["Owner training", s.training],
                ].map(([l, v]) => (
                  <div key={l} className="rounded border px-2 py-1.5">
                    <div className="text-[11px] text-muted-foreground">{l}</div>
                    <div className={`text-xs font-medium ${tone(v)}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function DevBugs() {
  return (
    <div className="space-y-4">
      <SectionHead title="Bugs & Testing" sub="Reported defects, fix status and testing sign-off before release." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Critical" value="1" tone="bad" />
        <StatCard label="Open" value="2" tone="warn" />
        <StatCard label="In Testing" value="1" />
        <StatCard label="Closed This Month" value="19" tone="good" />
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          {BUGS.map((b) => (
            <Row
              key={b.id}
              left={
                <>
                  <div className="text-sm font-medium">{b.area}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.id} · reported by {b.reported}
                  </div>
                </>
              }
              right={
                <>
                  <Badge variant="outline" className={tone(b.severity)}>
                    {b.severity}
                  </Badge>
                  <div className={`text-[11px] mt-1 ${tone(b.status)}`}>{b.status}</div>
                </>
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function DevReleases() {
  return (
    <div className="space-y-4">
      <SectionHead title="Releases & Updates" sub="Version history, planned releases and rollout notes." />
      <Card>
        <CardContent className="p-4 space-y-2">
          {RELEASES.map((r) => (
            <Row
              key={r.version}
              left={
                <>
                  <div className="text-sm font-medium">{r.version}</div>
                  <div className="text-xs text-muted-foreground">{r.scope}</div>
                </>
              }
              right={
                <>
                  <Badge variant="outline" className={tone(r.status)}>
                    {r.status}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground mt-1">{r.date}</div>
                </>
              }
            />
          ))}
        </CardContent>
      </Card>
      <p className="text-[11px] text-muted-foreground">
        Every release needs testing sign-off and a rollback note before it goes live to stores.
      </p>
    </div>
  );
}

export function DevDocs() {
  return (
    <div className="space-y-4">
      <SectionHead title="Knowledge & Documentation" sub="Runbooks, checklists and references used by support and operations." />
      <Card>
        <CardContent className="p-4 space-y-2">
          {DOCS.map((d) => (
            <Row
              key={d.title}
              left={
                <>
                  <div className="text-sm font-medium">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.type}</div>
                </>
              }
              right={<div className="text-[11px] text-muted-foreground">Updated {d.updated}</div>}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function DevPerformance() {
  return (
    <div className="space-y-4">
      <SectionHead
        title="Performance"
        sub="Calculated from ticket, task, bug, setup and release records. Figures cannot be edited manually."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Tickets Resolved" value="27" sub="Target 25" tone="good" />
        <StatCard label="On-Time Delivery" value="88%" sub="Target 90%" tone="warn" />
        <StatCard label="Avg Resolution Time" value="1.6 d" sub="Target under 2 d" tone="good" />
        <StatCard label="Reopened Tickets" value="2" sub="7% of resolved" tone="warn" />
        <StatCard label="Bug Fix Rate" value="19/21" tone="good" />
        <StatCard label="Store Setups Completed" value="6" sub="Avg 2.4 days" tone="good" />
        <StatCard label="Releases Delivered" value="3" sub="0 rollbacks" tone="good" />
        <StatCard label="Docs Updated" value="5" tone="good" />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Where work got delayed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { r: "Requirement unclear — waiting on requester", o: "External", c: 3 },
            { r: "Store internet unavailable during POS setup", o: "External", c: 2 },
            { r: "Fix started late after ticket assignment", o: "Developer", c: 2 },
            { r: "Testing sign-off pending", o: "Developer", c: 1 },
          ].map((d) => (
            <Row
              key={d.r}
              left={
                <>
                  <div className="text-sm">{d.r}</div>
                  <div className="text-xs text-muted-foreground">Owner: {d.o}</div>
                </>
              }
              right={<Badge variant="outline" className="tabular-nums">{d.c}</Badge>}
            />
          ))}
          <p className="text-[11px] text-muted-foreground">
            External delays are recorded separately and do not affect your on-time rate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
