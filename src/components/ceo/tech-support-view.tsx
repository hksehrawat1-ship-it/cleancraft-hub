import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Headphones, Ticket, Clock, CheckCircle2, AlertCircle, MessageSquare, Phone } from "lucide-react";

export function TechSupportCeoView() {
  const tickets = [
    { label: "Open Tickets", value: 24, icon: Ticket, tone: "text-amber-600" },
    { label: "Resolved Today", value: 18, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Escalated", value: 3, icon: AlertCircle, tone: "text-rose-600" },
    { label: "Awaiting Reply", value: 7, icon: MessageSquare, tone: "text-blue-600" },
  ];

  const channels = [
    { label: "Call", value: 42, icon: Phone },
    { label: "Chat / Email", value: 31, icon: MessageSquare },
  ];

  const sla = {
    firstResponseAvg: 12, // minutes
    resolutionAvg: 4.2,   // hours
    withinSla: 88,
  };

  const topIssues = [
    "POS login / sync failure",
    "Payment settlement not reflecting",
    "Printer not connecting to app",
    "GMB listing access request",
    "Machine error code E-204",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Headphones className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Technical Support Dashboard</h2>
          <p className="text-xs text-muted-foreground">Ticket queue, response SLAs and issue trends.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" /> 1. Ticket Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tickets.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="border rounded-md p-3 bg-muted/30">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 ${tone}`} />
                  {label}
                </div>
                <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> 2. Response & Resolution SLA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg First Response</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{sla.firstResponseAvg}m</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg Resolution</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{sla.resolutionAvg}h</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Within SLA</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{sla.withinSla}%</div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>SLA Compliance</span>
              <span className="font-semibold tabular-nums">{sla.withinSla}%</span>
            </div>
            <Progress value={sla.withinSla} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" /> 3. Channel Mix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {channels.map(({ label, value, icon: Icon }) => (
              <div key={label} className="border rounded-md p-3 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
                <div className="text-xl font-semibold tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" /> 4. Top Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {topIssues.map((issue) => (
              <li key={issue} className="flex items-start gap-2 text-sm border rounded-md p-2 bg-muted/20">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
