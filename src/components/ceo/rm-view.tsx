import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HeartHandshake,
  Activity,
  AlertOctagon,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Wrench,
  Frown,
  Users,
  Megaphone,
} from "lucide-react";

type RM = {
  name: string;
  stores: number;
  healthScore: number;
  breakdown: { label: string; value: number }[];
  issues: { total: number; resolved: number; pending: number };
  resolution: { avg: number; target: number };
  performance: { increased: number; stable: number; declining: number };
  alerts: { key: string; label: string; count: number; icon: typeof AlertTriangle }[];
};

const RMS: RM[] = [
  {
    name: "Ananya Bhatt",
    stores: 12,
    healthScore: 91,
    breakdown: [
      { label: "Sales Growth", value: 92 },
      { label: "Complaint Resolution", value: 95 },
      { label: "Machine Health", value: 88 },
      { label: "Marketing Activity", value: 86 },
      { label: "Owner Satisfaction", value: 94 },
    ],
    issues: { total: 61, resolved: 54, pending: 7 },
    resolution: { avg: 2.3, target: 3 },
    performance: { increased: 18, stable: 5, declining: 2 },
    alerts: [
      { key: "sales-drop", label: "Store sales dropped 35%", count: 1, icon: TrendingDown },
      { key: "machine", label: "Machine breakdown > 3 days", count: 2, icon: Wrench },
      { key: "owner", label: "Owner unhappy", count: 1, icon: Frown },
      { key: "manpower", label: "Manpower unavailable", count: 3, icon: Users },
      { key: "marketing", label: "Marketing inactive for 30 days", count: 2, icon: Megaphone },
    ],
  },
  {
    name: "Kabir Sethi",
    stores: 10,
    healthScore: 84,
    breakdown: [
      { label: "Sales Growth", value: 82 },
      { label: "Complaint Resolution", value: 88 },
      { label: "Machine Health", value: 80 },
      { label: "Marketing Activity", value: 78 },
      { label: "Owner Satisfaction", value: 90 },
    ],
    issues: { total: 48, resolved: 40, pending: 8 },
    resolution: { avg: 2.8, target: 3 },
    performance: { increased: 13, stable: 5, declining: 3 },
    alerts: [
      { key: "sales-drop", label: "Store sales dropped 35%", count: 2, icon: TrendingDown },
      { key: "machine", label: "Machine breakdown > 3 days", count: 1, icon: Wrench },
      { key: "owner", label: "Owner unhappy", count: 2, icon: Frown },
      { key: "manpower", label: "Manpower unavailable", count: 2, icon: Users },
      { key: "marketing", label: "Marketing inactive for 30 days", count: 3, icon: Megaphone },
    ],
  },
  {
    name: "Riya Chandra",
    stores: 14,
    healthScore: 76,
    breakdown: [
      { label: "Sales Growth", value: 74 },
      { label: "Complaint Resolution", value: 80 },
      { label: "Machine Health", value: 72 },
      { label: "Marketing Activity", value: 70 },
      { label: "Owner Satisfaction", value: 82 },
    ],
    issues: { total: 74, resolved: 58, pending: 16 },
    resolution: { avg: 3.4, target: 3 },
    performance: { increased: 9, stable: 3, declining: 2 },
    alerts: [
      { key: "sales-drop", label: "Store sales dropped 35%", count: 3, icon: TrendingDown },
      { key: "machine", label: "Machine breakdown > 3 days", count: 4, icon: Wrench },
      { key: "owner", label: "Owner unhappy", count: 2, icon: Frown },
      { key: "manpower", label: "Manpower unavailable", count: 5, icon: Users },
      { key: "marketing", label: "Marketing inactive for 30 days", count: 4, icon: Megaphone },
    ],
  },
  {
    name: "Devansh Rao",
    stores: 11,
    healthScore: 88,
    breakdown: [
      { label: "Sales Growth", value: 90 },
      { label: "Complaint Resolution", value: 92 },
      { label: "Machine Health", value: 85 },
      { label: "Marketing Activity", value: 82 },
      { label: "Owner Satisfaction", value: 91 },
    ],
    issues: { total: 55, resolved: 49, pending: 6 },
    resolution: { avg: 2.5, target: 3 },
    performance: { increased: 15, stable: 4, declining: 2 },
    alerts: [
      { key: "sales-drop", label: "Store sales dropped 35%", count: 1, icon: TrendingDown },
      { key: "machine", label: "Machine breakdown > 3 days", count: 1, icon: Wrench },
      { key: "owner", label: "Owner unhappy", count: 1, icon: Frown },
      { key: "manpower", label: "Manpower unavailable", count: 2, icon: Users },
      { key: "marketing", label: "Marketing inactive for 30 days", count: 1, icon: Megaphone },
    ],
  },
  {
    name: "Simran Kaur",
    stores: 9,
    healthScore: 69,
    breakdown: [
      { label: "Sales Growth", value: 68 },
      { label: "Complaint Resolution", value: 74 },
      { label: "Machine Health", value: 66 },
      { label: "Marketing Activity", value: 62 },
      { label: "Owner Satisfaction", value: 75 },
    ],
    issues: { total: 42, resolved: 30, pending: 12 },
    resolution: { avg: 3.9, target: 3 },
    performance: { increased: 4, stable: 3, declining: 2 },
    alerts: [
      { key: "sales-drop", label: "Store sales dropped 35%", count: 2, icon: TrendingDown },
      { key: "machine", label: "Machine breakdown > 3 days", count: 3, icon: Wrench },
      { key: "owner", label: "Owner unhappy", count: 3, icon: Frown },
      { key: "manpower", label: "Manpower unavailable", count: 4, icon: Users },
      { key: "marketing", label: "Marketing inactive for 30 days", count: 5, icon: Megaphone },
    ],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function healthColor(v: number) {
  if (v >= 90) return "text-emerald-600";
  if (v >= 75) return "text-sky-600";
  if (v >= 60) return "text-amber-600";
  return "text-red-600";
}

function healthDot(v: number) {
  if (v >= 90) return "🟢";
  if (v >= 75) return "🔵";
  if (v >= 60) return "🟡";
  return "🔴";
}

function barColor(v: number) {
  if (v >= 90) return "bg-emerald-500";
  if (v >= 75) return "bg-sky-500";
  if (v >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function RmCeoView() {
  const [idx, setIdx] = useState(0);
  const rm = RMS[idx];
  const resolutionOk = rm.resolution.avg < rm.resolution.target;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HeartHandshake className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Relationship Manager Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {RMS.map((r, i) => {
          const active = i === idx;
          return (
            <button
              key={r.name}
              onClick={() => setIdx(i)}
              className={`text-left rounded-lg border p-3 transition-colors ${
                active
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                  {initials(r.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.stores} stores</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Store Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-3">
            <div className="text-2xl">{healthDot(rm.healthScore)}</div>
            <div className={`text-5xl font-bold tabular-nums ${healthColor(rm.healthScore)}`}>
              {rm.healthScore}
              <span className="text-lg text-muted-foreground font-medium">/100</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculated from data input via each parameter's individual dashboard.
          </p>
          <div className="space-y-3">
            {rm.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{b.label}</span>
                  <span className="tabular-nums font-medium">{b.value}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${barColor(b.value)}`} style={{ width: `${b.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-primary" /> Open Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="border rounded-md p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-2xl font-semibold tabular-nums mt-1">{rm.issues.total}</div>
              </div>
              <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
                <div className="text-xs text-muted-foreground">Resolved</div>
                <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                  {rm.issues.resolved}
                </div>
              </div>
              <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                  {rm.issues.pending}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(rm.issues.resolved / rm.issues.total) * 100} />
              <div className="text-[11px] text-muted-foreground mt-1">
                {Math.round((rm.issues.resolved / rm.issues.total) * 100)}% resolved
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-md p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground">Average Resolution</div>
                <div
                  className={`text-2xl font-semibold tabular-nums mt-1 ${
                    resolutionOk ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {rm.resolution.avg} <span className="text-sm font-medium">Days</span>
                </div>
              </div>
              <div className="border rounded-md p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground">Target</div>
                <div className="text-2xl font-semibold tabular-nums mt-1">
                  &lt;{rm.resolution.target} <span className="text-sm font-medium">Days</span>
                </div>
              </div>
            </div>
            <div
              className={`mt-3 text-xs font-medium ${
                resolutionOk ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {resolutionOk ? "On track — within target" : "Above target — needs attention"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Store Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Sales Increased
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {rm.performance.increased}{" "}
                <span className="text-sm font-medium text-muted-foreground">Stores</span>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-sky-500/10 border-sky-500/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Minus className="w-3.5 h-3.5 text-sky-600" /> Stable
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-sky-600">
                {rm.performance.stable}{" "}
                <span className="text-sm font-medium text-muted-foreground">Stores</span>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingDown className="w-3.5 h-3.5 text-red-600" /> Declining
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-red-600">
                {rm.performance.declining}{" "}
                <span className="text-sm font-medium text-muted-foreground">Stores</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-500/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" /> CEO Alerts
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Auto-flagged from {rm.name}'s stores — immediate attention required.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rm.alerts.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.key}
                  className="flex items-center justify-between border rounded-md p-3 bg-red-500/5 border-red-500/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center text-xs font-semibold text-red-600">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <Icon className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-sm truncate">{a.label}</span>
                  </div>
                  <div className="text-sm font-semibold tabular-nums text-red-600">
                    {a.count} {a.count === 1 ? "store" : "stores"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
