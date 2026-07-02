import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Check,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Brain,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/video-editor")({
  head: () => ({ meta: [{ title: "Video Editor — Clean Craft OS" }] }),
  component: VideoEditorDashboard,
});

const MENU = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "My Projects", icon: FolderKanban },
  { key: "mind-task", label: "Mind and task", icon: Brain },
  { key: "performance", label: "My Performance", icon: TrendingUp },
] as const;

type MenuKey = (typeof MENU)[number]["key"];

function VideoEditorDashboard() {
  const { user, roles, loading, isCEO, isLeadership } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [active, setActive] = useState<MenuKey>("dashboard");

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile?.full_name) setNameDraft(profile.full_name);
  }, [profile?.full_name]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  const allowed = roles.includes("video_editor") || isCEO || isLeadership;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  async function saveName() {
    const next = nameDraft.trim();
    if (!next) return toast.error("Name can't be empty");
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ full_name: next })
      .eq("id", user!.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["my-profile", user!.id] });
    setEditing(false);
    toast.success("Name updated");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const displayName = profile?.full_name || "Video Editor";
  const activeItem = MENU.find((m) => m.key === active)!;

  return (
    <div className="flex gap-6 -m-4 md:-m-8 min-h-[calc(100vh-3.5rem)]">
      <aside className="w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground p-3 hidden md:block">
        <div className="px-2 py-3 mb-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Video Editor</div>
          <div className="text-sm font-semibold truncate">{displayName}</div>
        </div>
        <nav className="space-y-0.5">
          {MENU.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 flex-wrap">
            <span>Welcome,</span>
            {editing ? (
              <span className="inline-flex items-center gap-2">
                <Input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") {
                      setEditing(false);
                      setNameDraft(profile?.full_name ?? "");
                    }
                  }}
                  className="h-9 w-56 text-2xl md:text-3xl font-semibold"
                />
                <Button size="icon" variant="ghost" onClick={saveName} aria-label="Save">
                  <Check className="w-5 h-5" />
                </Button>
              </span>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="group inline-flex items-center gap-2 hover:text-primary transition-colors"
                aria-label="Edit name"
              >
                <span>{displayName}</span>
                <Pencil className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
            )}
          </div>
          <div />

        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex gap-2 flex-wrap">
          {MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs border",
                active === m.key ? "bg-primary text-primary-foreground border-primary" : "bg-background",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
            <activeItem.icon className="w-10 h-10 text-primary mb-3" />
            <h2 className="text-xl font-semibold">{activeItem.label}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Pointers and content for "{activeItem.label}" will be added here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
