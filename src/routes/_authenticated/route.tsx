import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Store,
  Briefcase,
  AlertOctagon,
  Wallet,
  UserCog,
  LogOut,
  Menu,
  Crown,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import cosLogo from "@/assets/cos-logo.png.asset.json";
import { CEO_GROUPS } from "@/lib/ceo-nav";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/stores", label: "Stores", icon: Store },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/complaints", label: "Complaints", icon: AlertOctagon },
  { to: "/payments", label: "Payments", icon: Wallet },
] as const;

function AuthedLayout() {
  const { user, isCEO, isLeadership } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(CEO_GROUPS.map((g) => [g.key, true])),
  );

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const showSidebar = isCEO || isLeadership;

  return (
    <div className="min-h-screen flex bg-background">
      {showSidebar && (
        <>
          <aside
            className={cn(
              "fixed md:static z-40 inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground border-r flex flex-col transition-transform",
              open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            )}
          >
            <div className="px-5 py-5 border-b flex items-center gap-2">
              <img src={cosLogo.url} alt="Clean Craft OS" className="h-8 w-auto" />
              <div>
                <div className="font-semibold text-sm leading-tight">
                  {isCEO ? "Master Dashboard" : "Clean Craft OS"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isCEO ? "CEO control room" : "cleancraftapp.com"}
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {isCEO ? (
                <>
                  <Link
                    to="/master"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                      pathname === "/master" && !hash
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                    )}
                  >
                    <Crown className="w-4 h-4" /> Master Dashboard
                  </Link>
                  <div className="pt-2">
                    {CEO_GROUPS.map((g, idx) => {
                      const GIcon = g.icon;
                      const isOpen = openGroups[g.key];

                      // Company Overview: no dropdown — single link that opens the overview panel on /master
                      if (g.key === "company") {
                        const active = pathname === "/master" && hash.startsWith("company");
                        return (
                          <div key={g.key} className="mb-0.5">
                            <Link
                              to="/master"
                              hash="company"
                              onClick={() => setOpen(false)}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                                active
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                              )}
                            >
                              <span className="text-muted-foreground tabular-nums text-xs w-4 shrink-0">
                                {idx + 1}.
                              </span>
                              <GIcon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{g.label}</span>
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <div key={g.key} className="mb-0.5">
                          <button
                            type="button"
                            onClick={() => setOpenGroups((s) => ({ ...s, [g.key]: !s[g.key] }))}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-sidebar-accent/60"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="text-muted-foreground tabular-nums text-xs w-4 shrink-0">
                                {idx + 1}.
                              </span>
                              <GIcon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{g.label}</span>
                            </span>
                            <ChevronDown
                              className={cn("w-4 h-4 transition-transform shrink-0", isOpen ? "" : "-rotate-90")}
                            />
                          </button>
                          {isOpen && (
                            <ul className="mt-0.5 ml-7 border-l border-sidebar-border/60 pl-2 space-y-0.5">
                              {g.items.map((it) => {
                                const Icon = it.icon;
                                const target = `#${g.key}:${it.key}`;
                                const active = pathname === "/master" && hash === `${g.key}:${it.key}`;
                                return (
                                  <li key={it.key}>
                                    <Link
                                      to="/master"
                                      hash={`${g.key}:${it.key}`}
                                      onClick={() => setOpen(false)}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors",
                                        active
                                          ? "bg-primary/15 text-primary font-medium"
                                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                                      )}
                                      aria-label={target}
                                    >
                                      <Icon className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{it.label}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <Link
                      to="/users"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                    >
                      <UserCog className="w-4 h-4" /> Users
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {[...NAV, { to: "/users" as const, label: "Users", icon: UserCog }].map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.to || pathname.startsWith(item.to + "/");
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>

            <div className="border-t p-3">
              <div className="px-2 py-2 text-xs">
                <div className="font-medium truncate">{user?.email}</div>
                <div className="text-muted-foreground">
                  {isCEO ? "CEO" : isLeadership ? "Leadership" : "Team member"}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            </div>
          </aside>

          {open && (
            <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} />
          )}
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className={cn("flex items-center border-b px-4 py-3", showSidebar ? "md:hidden gap-3" : "gap-3 justify-between")}>
          <div className="flex items-center gap-3">
            {showSidebar && (
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <img src={cosLogo.url} alt="Clean Craft OS" className="h-7 w-auto" />
          </div>
          {!showSidebar && user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            </div>
          )}
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}

