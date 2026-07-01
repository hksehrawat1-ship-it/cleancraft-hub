import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CalendarClock,
  UserPlus,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

const DATA = {
  upcoming: {
    storesOpening: 8,
    manpowerRequired: 24,
    available: 20,
    shortage: 4,
  },
  deployment: {
    requests: 12,
    completed: 10,
    pending: 2,
  },
  training: {
    owner: 22,
    manpower: 18,
    trainer: 3,
    pending: 4,
  },
  manpower: {
    requiring: 6,
    fullyStaffed: 18,
    partiallyStaffed: 2,
    criticalShortage: 1,
  },
};

export function TrainingCentreCeoView() {
  const d = DATA;
  const deploymentPct = Math.round((d.deployment.completed / d.deployment.requests) * 100);
  const shortagePct = Math.round((d.upcoming.shortage / d.upcoming.manpowerRequired) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Training & Manpower Centre</h2>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" /> Upcoming Requirements
          </CardTitle>
          <p className="text-xs text-muted-foreground">Next 30 days pipeline</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Stores Opening</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {d.upcoming.storesOpening}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Manpower Required</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {d.upcoming.manpowerRequired}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Available</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {d.upcoming.available}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-red-500/10 border-red-500/30">
              <div className="text-xs text-muted-foreground">Shortage</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-red-600">
                {d.upcoming.shortage}
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Coverage</span>
              <span className="tabular-nums font-medium">{100 - shortagePct}%</span>
            </div>
            <Progress value={100 - shortagePct} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Requests</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {d.deployment.requests}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {d.deployment.completed}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                {d.deployment.pending}
              </div>
            </div>
          </div>
          <Progress value={deploymentPct} />
          <div className="text-[11px] text-muted-foreground">{deploymentPct}% completion</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" /> Training Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Owner Training</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {d.training.owner}
                <span className="text-xs font-medium text-muted-foreground ml-1">
                  Completed
                </span>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Manpower Training</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {d.training.manpower}
                <span className="text-xs font-medium text-muted-foreground ml-1">
                  Completed
                </span>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Trainer Training</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {d.training.trainer}
                <span className="text-xs font-medium text-muted-foreground ml-1">
                  Completed
                </span>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                {d.training.pending}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Store Manpower Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Requiring Manpower</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {d.manpower.requiring}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Fully Staffed</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {d.manpower.fullyStaffed}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
              <div className="text-xs text-muted-foreground">Partially Staffed</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                {d.manpower.partiallyStaffed}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Critical Shortage
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-red-600">
                {d.manpower.criticalShortage}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
