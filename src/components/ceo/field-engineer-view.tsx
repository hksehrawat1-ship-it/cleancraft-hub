import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardHat, MapPin, Wrench, CheckCircle2, Clock, AlertTriangle, Truck, Calendar } from "lucide-react";

export function FieldEngineerCeoView() {
  const visits = [
    { label: "Scheduled Today", value: 9, icon: Calendar, tone: "text-blue-600" },
    { label: "Completed", value: 6, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "In Transit", value: 2, icon: Truck, tone: "text-primary" },
    { label: "Delayed", value: 1, icon: AlertTriangle, tone: "text-rose-600" },
  ];

  const readiness = [
    { label: "Site Survey", value: 100 },
    { label: "Machine Install", value: 78 },
    { label: "Civil Fix", value: 64 },
    { label: "Final Handover", value: 45 },
  ];

  const pending = [
    { label: "Awaiting Parts", value: 3, icon: Wrench, tone: "text-amber-600" },
    { label: "Owner Not Available", value: 2, icon: Clock, tone: "text-blue-600" },
    { label: "Overdue > 3 Days", value: 1, icon: AlertTriangle, tone: "text-rose-600" },
  ];

  const cities = [
    { name: "Jaipur", visits: 4, completed: 3 },
    { name: "Indore", visits: 3, completed: 2 },
    { name: "Lucknow", visits: 2, completed: 1 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HardHat className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Field Engineer Dashboard</h2>
          <p className="text-xs text-muted-foreground">On-site visits, installation progress and field blockers.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> 1. Field Visits Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visits.map(({ label, value, icon: Icon, tone }) => (
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
            <Wrench className="w-4 h-4 text-primary" /> 2. Activity Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {readiness.map(({ label, value }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">{value}%</span>
              </div>
              <Progress value={value} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> 3. Pending Blockers
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> 4. Visits by City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cities.map((city) => (
              <div key={city.name} className="border rounded-md p-3 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {city.name}
                </div>
                <div className="text-sm tabular-nums">
                  <span className="font-semibold">{city.completed}</span>
                  <span className="text-muted-foreground"> / {city.visits} done</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
