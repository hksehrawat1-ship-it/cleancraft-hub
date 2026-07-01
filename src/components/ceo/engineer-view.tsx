import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, Wrench, PhoneCall, MapPin, Clock, AlertTriangle, CheckCircle2, Package } from "lucide-react";

export function EngineerCeoView() {
  const serviceRequests = [
    { label: "New Complaints", value: 8, icon: AlertTriangle, tone: "text-amber-600" },
    { label: "Resolved", value: 6, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "On-Site Visit", value: 1, icon: MapPin, tone: "text-blue-600" },
    { label: "On-Call Resolved", value: 1, icon: PhoneCall, tone: "text-primary" },
  ];

  const resolutionSummary = {
    onCallPct: 68,
    onVisitPct: 32,
    avgDays: 1.4,
  };

  const pending = [
    { label: "Pending Today", value: 2, icon: Clock, tone: "text-amber-600" },
    { label: "Overdue", value: 1, icon: AlertTriangle, tone: "text-rose-600" },
    { label: "Waiting for Parts", value: 1, icon: Package, tone: "text-blue-600" },
  ];

  const otherReasons = [
    "Store closed during visit slot",
    "Owner unavailable for access",
    "Duplicate complaint / already resolved",
    "Awaiting owner approval for paid repair",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Cpu className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Engineer Dashboard</h2>
          <p className="text-xs text-muted-foreground">Machine service, complaint resolution and field visits.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" /> 1. Service Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {serviceRequests.map(({ label, value, icon: Icon, tone }) => (
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
            <CheckCircle2 className="w-4 h-4 text-primary" /> 2. Resolution Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-primary" /> Resolved On Call</span>
              <span className="font-semibold tabular-nums">{resolutionSummary.onCallPct}%</span>
            </div>
            <Progress value={resolutionSummary.onCallPct} />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-600" /> Resolved By Visit</span>
              <span className="font-semibold tabular-nums">{resolutionSummary.onVisitPct}%</span>
            </div>
            <Progress value={resolutionSummary.onVisitPct} />
          </div>
          <div className="border rounded-md p-3 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Average Resolution</span>
            </div>
            <div className="text-lg font-semibold tabular-nums">{resolutionSummary.avgDays} Days</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> 3. Pending Service Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pending.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="border rounded-md p-3 bg-muted/30">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 ${tone}`} />
                  {label}
                </div>
                <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Other Reasons for Delay
            </div>
            <ul className="space-y-1.5">
              {otherReasons.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm border rounded-md p-2 bg-muted/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
