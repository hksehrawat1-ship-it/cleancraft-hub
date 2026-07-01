import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  IndianRupee,
  Wallet,
  Clock,
  Store,
  Target,
  Users,
  Coins,
  Truck,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function AccountsCeoView() {
  const revenue = {
    expected: 5200000,
    collected: 4680000,
    pending: 520000,
  };
  const collectedPct = Math.round((revenue.collected / revenue.expected) * 100);

  const franchise = {
    booked: 18,
    target: 20,
    expectedRevenue: 1800000,
  };
  const bookedPct = Math.round((franchise.booked / franchise.target) * 100);

  const expenses = [
    { label: "Salary", value: 1480000, icon: Users, tone: "text-blue-600" },
    { label: "Petty Cash", value: 120000, icon: Coins, tone: "text-amber-600" },
    { label: "Vendor Payments", value: 870000, icon: Truck, tone: "text-primary" },
  ];
  const totalExpense = 2470000;

  const cashFlow = {
    cashIn: 4680000,
    cashOut: 2470000,
    available: 2210000,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Accounts Dashboard</h2>
          <p className="text-xs text-muted-foreground">Revenue, franchise bookings, expenses and cash flow.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" /> 1. Revenue Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Target className="w-3.5 h-3.5 text-primary" /> Expected Monthly Revenue
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{inr(revenue.expected)}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Collected
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{inr(revenue.collected)}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Collection
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{inr(revenue.pending)}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Collection Progress</span>
              <span className="font-semibold tabular-nums">{collectedPct}%</span>
            </div>
            <Progress value={collectedPct} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" /> 2. Franchise Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Expected Franchise Revenue
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{inr(franchise.expectedRevenue)}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Booking Progress</span>
              <span className="font-semibold tabular-nums">{bookedPct}%</span>
            </div>
            <Progress value={bookedPct} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" /> 3. Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {expenses.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="border rounded-md p-3 bg-muted/30">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 ${tone}`} />
                  {label}
                </div>
                <div className="text-2xl font-semibold tabular-nums mt-1">{inr(value)}</div>
              </div>
            ))}
          </div>
          <div className="border rounded-md p-3 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Total Expected Expense</span>
            </div>
            <div className="text-lg font-semibold tabular-nums">{inr(totalExpense)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" /> 4. Cash Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600" /> Cash In
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{inr(cashFlow.cashIn)}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <ArrowUpCircle className="w-3.5 h-3.5 text-rose-600" /> Cash Out
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{inr(cashFlow.cashOut)}</div>
            </div>
            <div className="border rounded-md p-3 bg-primary/5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Wallet className="w-3.5 h-3.5 text-primary" /> Available Cash
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{inr(cashFlow.available)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
