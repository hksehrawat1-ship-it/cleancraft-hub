import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Phone, MessageCircle, CalendarClock, Video, Trophy, Plus, PhoneCall,
  CheckSquare, CalendarPlus, AlertTriangle, ArrowRight, Clock, Users, TrendingUp,
} from "lucide-react";

/* ---------- sample data ---------- */

const KPIS = [
  { key: "new", label: "New Leads", value: 12, sub: "+4 vs yesterday", icon: Users, tone: "text-primary" },
  { key: "calls", label: "Calls Due", value: 18, sub: "6 overdue", icon: Phone, tone: "text-primary" },
  { key: "followups", label: "Follow-ups Due", value: 9, sub: "3 overdue", icon: CalendarClock, tone: "text-destructive" },
  { key: "meetings", label: "Meetings Today", value: 4, sub: "2 online", icon: Video, tone: "text-primary" },
  { key: "closed", label: "Sales Closed", value: 3, sub: "₹6.9L this month", icon: Trophy, tone: "text-success" },
] as const;

type Urgency = "overdue" | "now" | "soon";

const NEXT_BEST_ACTIONS: {
  name: string; city: string; score: number; reason: string; due: string; urgency: Urgency; action: string;
}[] = [
  { name: "Rohit Agarwal", city: "Jaipur", score: 96, reason: "Overdue follow-up · Hot lead · Proposal sent 3 days ago", due: "Overdue by 1 day", urgency: "overdue", action: "Call now" },
  { name: "Meena Sharma", city: "Indore", score: 92, reason: "Engagement letter pending signature", due: "Due 11:30 AM", urgency: "now", action: "Call now" },
  { name: "Sandeep Verma", city: "Lucknow", score: 88, reason: "Asked for ROI sheet on last call", due: "Due 1:00 PM", urgency: "now", action: "WhatsApp" },
  { name: "Priya Nair", city: "Surat", score: 81, reason: "Site visit scheduled, confirm attendance", due: "Due 4:00 PM", urgency: "soon", action: "Confirm" },
  { name: "Ankit Gupta", city: "Pune", score: 74, reason: "New inbound lead, first contact pending", due: "Due 6:00 PM", urgency: "soon", action: "Call" },
];

const TASKS: { title: string; who: string; time: string; type: "Call" | "WhatsApp" | "Follow-up" | "Meeting"; done: boolean; overdue?: boolean }[] = [
  { title: "Discovery call", who: "Rohit Agarwal", time: "09:30 AM", type: "Call", done: false, overdue: true },
  { title: "Send franchise brochure", who: "Meena Sharma", time: "10:15 AM", type: "WhatsApp", done: true },
  { title: "Proposal follow-up", who: "Sandeep Verma", time: "01:00 PM", type: "Follow-up", done: false },
  { title: "Zoom walkthrough", who: "Priya Nair", time: "03:30 PM", type: "Meeting", done: false },
  { title: "Confirm investment budget", who: "Ankit Gupta", time: "05:00 PM", type: "Call", done: false },
  { title: "Share ROI calculator", who: "Kavita Rao", time: "08:45 AM", type: "WhatsApp", done: true },
];

const PIPELINE = [
  { stage: "New Lead", count: 24, value: 0 },
  { stage: "Contacted", count: 18, value: 0 },
  { stage: "Qualified", count: 12, value: 42 },
  { stage: "Proposal Sent", count: 8, value: 32 },
  { stage: "Meeting Done", count: 6, value: 24 },
  { stage: "Booking Received", count: 3, value: 13.5 },
];

const MEETINGS = [
  { time: "11:00 AM", name: "Meena Sharma", type: "Google Meet", online: true },
  { time: "01:30 PM", name: "Sandeep Verma", type: "Office Visit", online: false },
  { time: "03:30 PM", name: "Priya Nair", type: "Zoom", online: true },
  { time: "06:00 PM", name: "Ankit Gupta", type: "Site Visit", online: false },
];

const OVERDUE = [
  { name: "Rohit Agarwal", city: "Jaipur", late: "1 day overdue", note: "Proposal decision promised" },
  { name: "Kavita Rao", city: "Bhopal", late: "3 days overdue", note: "Awaiting documents" },
  { name: "Imran Sheikh", city: "Nagpur", late: "5 days overdue", note: "No response after 2 calls" },
];

const TYPE_ICON = { Call: Phone, WhatsApp: MessageCircle, "Follow-up": CalendarClock, Meeting: Video } as const;

/* ---------- page ---------- */

export function SalesDashboard({ salespersonName }: { salespersonName: string }) {
  const dateLabel = useMemo(
    () => new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );
  const soon = () => toast.info("Coming soon in this build");

  const pipelineMax = Math.max(...PIPELINE.map((p) => p.count));
  const doneCount = TASKS.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold sm:text-2xl">Welcome back, {salespersonName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> On track
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={soon}><Plus className="mr-1.5 h-4 w-4" />Add Lead</Button>
          <Button size="sm" variant="secondary" onClick={soon}><PhoneCall className="mr-1.5 h-4 w-4" />Log Call</Button>
          <Button size="sm" variant="secondary" onClick={soon}><CheckSquare className="mr-1.5 h-4 w-4" />Add Task</Button>
          <Button size="sm" variant="outline" onClick={soon}><CalendarPlus className="mr-1.5 h-4 w-4" />Schedule Meeting</Button>
        </div>
      </div>

      {/* Overdue alert */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <h2 className="text-sm font-semibold">Overdue Follow-ups ({OVERDUE.length})</h2>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {OVERDUE.map((o) => (
              <div key={o.name} className="rounded-lg border border-destructive/30 bg-card p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate text-sm font-semibold">{o.name}</p>
                  <span className="shrink-0 text-[11px] font-semibold text-destructive">{o.late}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{o.city} · {o.note}</p>
                <Button size="sm" variant="destructive" className="mt-2 h-7 w-full text-xs" onClick={soon}>
                  <Phone className="mr-1 h-3 w-3" />Call now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {KPIS.map((k) => (
          <Card key={k.key} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">{k.label}</p>
                <k.icon className={cn("h-4 w-4 shrink-0", k.tone)} />
              </div>
              <p className={cn("mt-2 text-3xl font-bold tracking-tight", k.tone)}>{k.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Next best actions */}
        <Card className="xl:col-span-2">
          <CardContent className="p-4 sm:p-5">
            <SectionHead title="Next Best Actions" subtitle="Five most urgent leads right now" />
            <div className="mt-3 space-y-2">
              {NEXT_BEST_ACTIONS.map((a, i) => (
                <div key={a.name} className="rounded-xl border p-3 transition-colors hover:bg-muted/50">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                    <div className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold",
                      a.score >= 90 ? "bg-destructive/10 text-destructive" : a.score >= 80 ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary",
                    )}>{a.score}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <p className="truncate text-sm font-semibold">{i + 1}. {a.name}</p>
                        <span className="text-xs text-muted-foreground">{a.city}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.reason}</p>
                      <p className={cn(
                        "mt-1 inline-flex items-center gap-1 text-[11px] font-semibold",
                        a.urgency === "overdue" ? "text-destructive" : a.urgency === "now" ? "text-warning" : "text-muted-foreground",
                      )}>
                        <Clock className="h-3 w-3" />{a.due}
                      </p>
                    </div>
                    <Button size="sm" variant={a.urgency === "overdue" ? "destructive" : "default"}
                      className="h-8 shrink-0 text-xs" onClick={soon}>
                      {a.action}<ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's tasks */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <SectionHead title="Today's Tasks" subtitle={`${doneCount} of ${TASKS.length} completed`} />
            <Progress value={(doneCount / TASKS.length) * 100} className="mt-3 h-2" />
            <div className="mt-3 space-y-2">
              {TASKS.map((t) => {
                const Icon = TYPE_ICON[t.type];
                return (
                  <div key={t.title} className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-2.5",
                    t.done && "opacity-60",
                    t.overdue && !t.done && "border-destructive/40 bg-destructive/5",
                  )}>
                    <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md",
                      t.done ? "bg-success/10 text-success" : t.overdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                      {t.done ? <CheckSquare className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("truncate text-sm font-medium", t.done && "line-through")}>{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.who} · {t.time}</p>
                    </div>
                    <Badge variant={t.done ? "secondary" : t.overdue ? "destructive" : "outline"} className="shrink-0 text-[10px]">
                      {t.done ? "Completed" : t.type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Pipeline */}
        <Card className="xl:col-span-2">
          <CardContent className="p-4 sm:p-5">
            <SectionHead title="Sales Pipeline Summary" subtitle="Lead count and value by stage" />
            <div className="mt-3 space-y-3">
              {PIPELINE.map((p) => (
                <div key={p.stage}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs">
                    <span className="truncate font-medium">{p.stage}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {p.count} leads{p.value ? ` · ₹${p.value}L` : ""}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(p.count / pipelineMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meetings */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <SectionHead title="Today's Meetings" subtitle={`${MEETINGS.length} scheduled`} />
            <div className="mt-3 space-y-2">
              {MEETINGS.map((mt) => (
                <div key={mt.time} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-2.5">
                  <div className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">{mt.time}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{mt.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{mt.type}</p>
                  </div>
                  <Button size="sm" variant={mt.online ? "default" : "outline"} className="h-7 shrink-0 text-xs" onClick={soon}>
                    {mt.online ? "Join" : "View"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <SectionHead title="Performance Snapshot" subtitle="This month" />
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="Calls Completed" value="146" sub="Target 180" pct={81} />
            <Metric label="Avg. Response Time" value="24 min" sub="Target under 30 min" pct={88} />
            <Metric label="Conversion Rate" value="18%" sub="Team avg 14%" pct={72} />
            <Metric label="Monthly Target" value="₹6.9L / ₹12L" sub="3 of 5 closures" pct={58} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-w-0">
      <h2 className="truncate text-base font-semibold">{title}</h2>
      {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Metric({ label, value, sub, pct }: { label: string; value: string; sub: string; pct: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
      <Progress value={pct} className="mt-2 h-1.5" />
      <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
