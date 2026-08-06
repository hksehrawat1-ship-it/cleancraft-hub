import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { PERF_MKT_NAV } from "@/components/perf-mkt/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeftClose, PanelLeftOpen, ShieldAlert, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/performance-marketing")({
  component: PerfMktLayout,
});

function PerfMktLayout() {
  const { roles, isLeadership } = useAuth();
  const authorised =
    isLeadership || roles.includes("performance_marketing_executive" as never);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!authorised) {
    return (
      <div className="p-6">
        <Card className="max-w-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive" /> Access restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This workspace is available only to Performance Marketing Executives.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nav = (
    <nav className="p-2 space-y-1">
      {PERF_MKT_NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            title={item.label}
            className={cn(
              "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted",
              collapsed && "md:justify-center md:px-2",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={cn("text-left truncate", collapsed && "md:hidden")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside
        className={cn(
          "hidden md:flex md:flex-col shrink-0 border-r bg-background transition-all",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="p-3 border-b flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Employee
              </div>
              <div className="font-semibold text-sm truncate">Performance Marketing</div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        </div>
        {nav}
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center gap-2 border-b bg-background px-3 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium truncate">Performance Marketing</span>
        </div>
        {mobileOpen && <div className="md:hidden border-b bg-background">{nav}</div>}

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
