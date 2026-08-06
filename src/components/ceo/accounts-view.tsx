import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calculator, Store, Target, Users } from "lucide-react";

export function AccountsCeoView() {
  const franchise = {
    booked: 18,
    target: 20,
  };
  const bookedPct = Math.round((franchise.booked / franchise.target) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Accounts Dashboard</h2>
          <p className="text-xs text-muted-foreground">Headcount and franchise booking progress.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              Number of Employees
            </div>
            <div className="text-3xl font-semibold tabular-nums">128</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" /> Franchise Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Store className="w-3.5 h-3.5 text-primary" /> Store Booked
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{franchise.booked}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Target className="w-3.5 h-3.5 text-blue-600" /> Target
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{franchise.target}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Booking Progress</span>
              <span className="font-semibold tabular-nums">
                {franchise.booked} of {franchise.target} bookings — {bookedPct}% of target
              </span>
            </div>
            <Progress value={bookedPct} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
