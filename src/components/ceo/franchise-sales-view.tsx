import { useMemo, useState } from "react";
import { Search, Store as StoreIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const STORES = [
  "Jaipur",
  "Mumbai",
  "Delhi",
  "Indore",
  "Lucknow",
  "Surat",
  "Pune",
  "Ahmedabad",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Nagpur",
  "Chandigarh",
  "Bhopal",
];

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function seriesFor(name: string) {
  let seed = 0;
  for (let i = 0; i < name.length; i++) seed = (seed * 31 + name.charCodeAt(i)) >>> 0;
  return MONTHS.map((m, i) => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const base = 180000 + ((seed % 220000) | 0);
    const trend = i * (8000 + (seed % 4000));
    return { month: m, sales: Math.round((base + trend) / 1000) * 1000 };
  });
}

export function FranchiseSalesView() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => STORES.filter((s) => s.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const data = useMemo(() => (selected ? seriesFor(selected) : []), [selected]);
  const total = data.reduce((a, b) => a + b.sales, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4 text-primary" />
          Franchise Sales · By Store
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Pick a store to see its monthly sales trend.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-muted/20 hover:bg-muted/40"
            >
              <span className="flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-muted-foreground" />
                {selected ? `Store: ${selected}` : "Select a store"}
              </span>
              <span className="text-xs text-muted-foreground">
                {open ? "Hide" : "Browse"}
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 border rounded-md p-3 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search stores..."
                className="pl-7 h-8 text-sm"
              />
            </div>
            <div className="max-h-56 overflow-auto grid grid-cols-2 sm:grid-cols-3 gap-1">
              {filtered.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSelected(s);
                    setOpen(false);
                  }}
                  className={`text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted/60 flex items-center gap-2 ${
                    selected === s ? "bg-muted/60 font-medium" : ""
                  }`}
                >
                  <StoreIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {s}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-xs text-muted-foreground py-2 text-center">
                  No stores match "{q}".
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {selected ? (
          <div className="border rounded-md p-3 bg-muted/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">{selected} — Monthly Sales</div>
              <div className="text-xs text-muted-foreground">
                FY Total ₹{(total / 100000).toFixed(1)}L
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Sales"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-6 text-center text-sm text-muted-foreground bg-muted/10">
            Select a store above to view its monthly sales graph.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
