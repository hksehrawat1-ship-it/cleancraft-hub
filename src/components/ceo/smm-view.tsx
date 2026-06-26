import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Megaphone,
  CalendarCheck,
  Film,
  ListChecks,
  Users,
  Activity,
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";

const PRODUCTION = [
  { label: "Reels", value: 8 },
  { label: "Carousels", value: 3 },
  { label: "Posts", value: 2 },
  { label: "Stories", value: 14 },
];

const PENDING = [
  { label: "Editing", value: 2 },
  { label: "Approval", value: 3 },
  { label: "Script Pending", value: 1 },
  { label: "Designer Pending", value: 0 },
];

export function SmmCeoView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Social Media Account Manager</h2>
          <p className="text-xs text-muted-foreground">
            Revenue Engine · Content calendar & lead contribution
          </p>
        </div>
      </div>

      {/* 1. Content Calendar Completion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="w-4 h-4 text-primary" />
            1. Content Calendar Completion
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">This Week</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Planned" value="12" />
            <Stat label="Published" value="11" />
            <Stat label="Completion" value="92%" tone="success" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500" style={{ width: "92%" }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2. Content Production */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Film className="w-4 h-4 text-primary" />
              2. Content Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PRODUCTION.map((p) => (
                <div key={p.label} className="border rounded-md p-3 bg-muted/20">
                  <div className="text-xs text-muted-foreground">{p.label}</div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">{p.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Content Pending */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="w-4 h-4 text-primary" />
              3. Content Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PENDING.map((p) => (
                <div key={p.label} className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">{p.label}</div>
                  <div
                    className={`text-2xl font-semibold tabular-nums mt-1 ${
                      p.value > 0 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {p.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Lead Contribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-primary" />
            4. Lead Contribution
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">This Week</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LeadCard icon={Instagram} platform="Instagram Leads" value={42} accent="text-pink-600" />
            <LeadCard icon={Youtube} platform="YouTube Leads" value={18} accent="text-red-600" />
            <LeadCard icon={Facebook} platform="Facebook" value={7} accent="text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-primary" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Tasks Assigned" value="18" />
            <Stat label="Completed" value="17" tone="success" />
            <Stat label="Delayed" value="1" tone="danger" />
            <Stat label="Completion" value="94%" tone="success" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500" style={{ width: "94%" }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger" | "warning";
}) {
  const toneCls =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
      ? "text-destructive"
      : tone === "warning"
      ? "text-amber-600"
      : "text-foreground";
  return (
    <div className="border rounded-md p-3 bg-muted/20">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums mt-1 ${toneCls}`}>{value}</div>
    </div>
  );
}

function LeadCard({
  icon: Icon,
  platform,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  platform: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="border rounded-md p-4 bg-muted/20">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${accent}`} />
        <span className="text-sm font-medium">{platform}</span>
      </div>
      <div className="text-3xl font-semibold tabular-nums mt-2">{value}</div>
    </div>
  );
}
