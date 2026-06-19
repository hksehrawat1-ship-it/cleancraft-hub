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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import cosLogo from "@/assets/cos-logo.png.asset.json";

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
  { to: "/master", label: "Master Dashboard", icon: Crown },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/stores", label: "Stores", icon: Store },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/complaints", label: "Complaints", icon: AlertOctagon },
  { to: "/payments", label: "Payments", icon: Wallet },
] as const;

function AuthedLayout() {
  const { user, isLeadership } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = isLeadership ? [...NAV, { to: "/users" as const, label: "Users", icon: UserCog }] : NAV;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — visible only to CEO/leadership */}
      {isLeadership && (
        <>
          <aside
            className={cn(
              "fixed md:static z-40 inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground border-r flex flex-col transition-transform",
              open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            )}
          >
            <div className="px-5 py-5 border-b flex items-center gap-2">
              <img src={cosLogo.url} alt="Clean Craft OS" className="h-8 w-auto" />
              <div>
                <div className="font-semibold text-sm leading-tight">Clean Craft OS</div>
                <div className="text-[11px] text-muted-foreground">cleancraftapp.com</div>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {nav.map((item) => {
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
            </nav>
            <div className="border-t p-3">
              <div className="px-2 py-2 text-xs">
                <div className="font-medium truncate">{user?.email}</div>
                <div className="text-muted-foreground">{isLeadership ? "Leadership" : "Team member"}</div>
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header for leadership; top bar for non-leadership */}
        <header className={cn("flex items-center border-b px-4 py-3", isLeadership ? "md:hidden gap-3" : "gap-3 justify-between")}>
          <div className="flex items-center gap-3">
            {isLeadership && (
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <img src={cosLogo.url} alt="Clean Craft OS" className="h-7 w-auto" />
          </div>
          {!isLeadership && user && (
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
