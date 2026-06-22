import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CEO_GROUPS } from "@/lib/ceo-nav";

export const Route = createFileRoute("/_authenticated/master")({
  head: () => ({ meta: [{ title: "Clean Craft Master Dashboard" }] }),
  component: MasterDashboard,
});

function MasterDashboard() {
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [selected, setSelected] = useState<{ group: string; item: string } | null>(null);

  useEffect(() => {
    if (!hash) {
      setSelected(null);
      return;
    }
    const [group, item] = hash.split(":");
    if (group && item) setSelected({ group, item });
  }, [hash]);

  const current = (() => {
    if (!selected) return null;
    const g = CEO_GROUPS.find((x) => x.key === selected.group);
    const i = g?.items.find((x) => x.key === selected.item);
    return g && i ? { g, i } : null;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clean Craft Master Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Pick a function from the sidebar to drill into that role's metrics.
          </p>
        </div>
      </div>

      {!current ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CEO_GROUPS.map((g) => {
            const GIcon = g.icon;
            return (
              <Card key={g.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GIcon className="w-4 h-4 text-primary" />
                    {g.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {g.items.map((it) => (
                    <a
                      key={it.key}
                      href={`#${g.key}:${it.key}`}
                      className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted/60 flex items-center gap-2"
                    >
                      <it.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {it.label}
                    </a>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <current.i.icon className="w-5 h-5 text-primary" />
              {current.i.label}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{current.g.label}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{current.i.blurb}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["KPI 1", "KPI 2", "KPI 3", "KPI 4"].map((k) => (
                <div key={k} className="border rounded-md p-3 bg-muted/30">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
                  <div className="text-2xl font-semibold mt-1">—</div>
                </div>
              ))}
            </div>
            <div className="border rounded-md p-4 text-sm text-muted-foreground bg-muted/20">
              Detailed dashboard for <b className="text-foreground">{current.i.label}</b> goes here.
              Hook this up to the relevant tables and charts next.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
