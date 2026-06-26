import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, LogOut, Users, Calendar, FileText, Briefcase } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hr-head")({
  head: () => ({ meta: [{ title: "HR Head — Clean Craft OS" }] }),
  component: HrHeadDashboard,
});

function HrHeadDashboard() {
  const { user, roles, loading, isCEO, isLeadership } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

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
  const allowed = roles.includes("hr_head") || isCEO || isLeadership;
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

  const displayName = profile?.full_name || "HR Head";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
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
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground -mt-3">
        HR Head control room — recruitment, people ops, attendance and policy.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { k: "Team Size", v: "—" },
          { k: "Open Roles", v: "—" },
          { k: "Attendance %", v: "—" },
          { k: "Attrition (30d)", v: "—" },
        ].map((kpi) => (
          <Card key={kpi.k}>
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{kpi.k}</div>
              <div className="text-2xl font-semibold mt-1 tabular-nums">{kpi.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Users, title: "Team Directory", desc: "All employees, departments and reporting lines." },
          { icon: Briefcase, title: "Hiring Pipeline", desc: "Open roles, candidates by stage, offers out." },
          { icon: Calendar, title: "Attendance & Leave", desc: "Daily attendance, leave requests, approvals." },
          { icon: FileText, title: "Policies & Documents", desc: "HR policies, contracts, employee documents." },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
