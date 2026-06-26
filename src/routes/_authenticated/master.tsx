import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CEO_GROUPS, type CeoItem } from "@/lib/ceo-nav";
import { VideoEditorCeoView } from "@/components/ceo/video-editor-view";

// Group the Company Overview items into tracking sections.
const COMPANY_SECTIONS: { title: string; keys: string[] }[] = [
  { title: "Revenue", keys: ["rev-franchise", "rev-course", "rev-store"] },
  { title: "Stores", keys: ["stores-active", "stores-setup", "stores-launch"] },
  { title: "Projects", keys: ["proj-ontime", "proj-delayed"] },
  { title: "Complaints", keys: ["comp-open", "comp-escalated"] },
  { title: "Cash", keys: ["cash-collection", "cash-pending"] },
];

export const Route = createFileRoute("/_authenticated/master")({
  head: () => ({ meta: [{ title: "Clean Craft Master Dashboard" }] }),
  component: MasterDashboard,
});

function MasterDashboard() {
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [selected, setSelected] = useState<{ group: string; item: string } | null>(null);
  const [companyOpen, setCompanyOpen] = useState(false);

  useEffect(() => {
    if (!hash) {
      setSelected(null);
      setCompanyOpen(false);
      return;
    }
    if (hash === "company" || hash.startsWith("company:")) {
      setCompanyOpen(true);
      const [, item] = hash.split(":");
      if (item) {
        setSelected({ group: "company", item });
      } else {
        setSelected(null);
      }
      return;
    }
    setCompanyOpen(false);
    const [group, item] = hash.split(":");
    if (group && item) setSelected({ group, item });
  }, [hash]);

  const companyGroup = CEO_GROUPS.find((g) => g.key === "company");
  const companyItems = new Map<string, CeoItem>(
    (companyGroup?.items ?? []).map((it) => [it.key, it]),
  );

  const current = (() => {
    if (!selected) return null;
    const g = CEO_GROUPS.find((x) => x.key === selected.group);
    let i = g?.items.find((x) => x.key === selected.item);
    if (!i && g?.subGroups) {
      for (const sg of g.subGroups) {
        const found = sg.items.find((x) => x.key === selected.item);
        if (found) {
          i = found;
          break;
        }
      }
    }
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




      {companyOpen && companyGroup ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              Company Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Live tracking across revenue, stores, projects, complaints and cash.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {COMPANY_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {section.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.keys.map((k) => {
                    const it = companyItems.get(k);
                    if (!it) return null;
                    const Icon = it.icon;
                    const active = selected?.group === "company" && selected.item === k;
                    return (
                      <a
                        key={k}
                        href={`#company:${k}`}
                        className={`rounded-lg border p-3 bg-muted/20 hover:bg-muted/40 transition-colors block ${
                          active ? "border-primary ring-1 ring-primary/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="truncate">{it.label.replace(/^[^·]+·\s*/, "")}</span>
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                          <div className="text-2xl font-semibold tabular-nums">—</div>
                          <div className="text-[11px] text-muted-foreground">Live</div>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{it.blurb}</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : !current ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CEO_GROUPS.filter((g) => g.key !== "company").map((g) => {
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
                  {g.subGroups?.map((sg) => (
                    <div key={sg.key} className="mt-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 px-2">
                        {sg.label}
                      </div>
                      <div className="space-y-0.5">
                        {sg.items.map((sit) => (
                          <a
                            key={sit.key}
                            href={`#${g.key}:${sit.key}`}
                            className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted/60 flex items-center gap-2"
                          >
                            <sit.icon className="w-3.5 h-3.5 text-muted-foreground" />
                            {sit.label}
                          </a>
                        ))}
                      </div>
                    </div>
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
