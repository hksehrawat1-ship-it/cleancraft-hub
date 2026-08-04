import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Send } from "lucide-react";
import { SectionHead } from "./ui";
import { SOCIAL_LEADS, type SocialLead } from "./data";

const qTone = (q: SocialLead["quality"]) =>
  q === "Hot"
    ? "bg-red-500/15 text-red-600 border-red-500/30"
    : q === "Warm"
    ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
    : "bg-sky-500/15 text-sky-600 border-sky-500/30";

export function SmmLeadsPage() {
  const [leads, setLeads] = useState<SocialLead[]>(SOCIAL_LEADS);
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return leads;
    return leads.filter(
      (l) => l.name.toLowerCase().includes(t) || l.city.toLowerCase().includes(t) || l.source.toLowerCase().includes(t),
    );
  }, [leads, q]);

  const handover = (id: string) => {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, status: "Handed to Sales" } : x)));
    toast.success("Lead handed over to the sales team");
  };

  const stats = {
    total: leads.length,
    newLeads: leads.filter((l) => l.status === "New").length,
    handed: leads.filter((l) => l.status === "Handed to Sales").length,
    hot: leads.filter((l) => l.quality === "Hot").length,
  };

  return (
    <div className="space-y-4">
      <SectionHead title="Leads & Handover" sub="Leads coming from social DMs, comments and forms — pass them to sales fast." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Leads This Week", v: stats.total },
          { l: "Awaiting Handover", v: stats.newLeads },
          { l: "Handed to Sales", v: stats.handed },
          { l: "Hot Leads", v: stats.hot },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="text-3xl font-bold tabular-nums mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lead inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, city or platform"
              className="pl-9"
            />
          </div>

          {shown.map((l) => (
            <div key={l.id} className="border rounded-md p-3 flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{l.name}</span>
                  <Badge variant="outline" className={qTone(l.quality)}>{l.quality}</Badge>
                  <Badge variant="outline">{l.interest}</Badge>
                  <Badge variant="outline">{l.source}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {l.city} · Received {l.received} · {l.id}
                </div>
              </div>
              {l.status === "New" ? (
                <Button size="sm" onClick={() => handover(l.id)}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Hand over to Sales
                </Button>
              ) : (
                <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                  {l.status}
                </Badge>
              )}
            </div>
          ))}
          {shown.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">No leads match that search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
