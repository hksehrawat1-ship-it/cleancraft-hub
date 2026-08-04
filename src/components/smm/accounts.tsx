import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Facebook, Instagram, MapPin, Youtube } from "lucide-react";
import { SectionHead } from "./ui";
import { ACCOUNTS, type Platform } from "./data";

const icons: Record<Platform, React.ComponentType<{ className?: string }>> = {
  Instagram,
  YouTube: Youtube,
  Facebook,
  "Google Business": MapPin,
};

const healthTone = (h: string) =>
  h === "Healthy"
    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
    : h === "Attention"
    ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
    : "bg-destructive/15 text-destructive border-destructive/30";

export function SmmAccountsPage() {
  return (
    <div className="space-y-4">
      <SectionHead title="Social Accounts" sub="Handles you own, their growth and their health checks." />

      <div className="grid md:grid-cols-2 gap-3">
        {ACCOUNTS.map((a) => {
          const Icon = icons[a.platform];
          return (
            <Card key={a.platform}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" /> {a.platform}
                  </span>
                  <Badge variant="outline" className={healthTone(a.health)}>{a.health}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{a.handle}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-6">
                  <div>
                    <div className="text-[11px] uppercase text-muted-foreground">Followers</div>
                    <div className="text-2xl font-bold tabular-nums">{a.followers}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-muted-foreground">Growth</div>
                    <div className="text-2xl font-bold tabular-nums text-emerald-600">{a.growth}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{a.note}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => toast.success(`${a.platform} health check logged`)}
                >
                  Mark checked today
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Daily account hygiene</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2">
          {[
            "Reply to all DMs within 2 hours",
            "Answer comments on last 3 posts",
            "Check tagged posts and reshare good ones",
            "Update bio link if offer changed",
            "Reply to new Google reviews",
            "Log new leads into Leads & Handover",
          ].map((t) => (
            <div key={t} className="border rounded-md px-3 py-2 text-sm">{t}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
