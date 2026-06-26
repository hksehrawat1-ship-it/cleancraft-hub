import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES, roleLabel } from "@/lib/roles";
import { seedHrHead } from "@/lib/hr-seed.functions";
import { toast } from "sonner";
import { useState } from "react";
import { X, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — Clean Craft OS" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { isLeadership, loading } = useAuth();
  const qc = useQueryClient();
  const [newRole, setNewRole] = useState<Record<string, string>>({});

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-full"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles").select("*").order("created_at");
      return data ?? [];
    },
  });
  const { data: userRoles = [] } = useQuery({
    queryKey: ["user-roles-all"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("user_roles").select("*");
      return data ?? [];
    },
  });

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!isLeadership) return <Navigate to="/dashboard" replace />;

  async function addRole(userId: string) {
    const role = newRole[userId];
    if (!role) return toast.error("Pick a role");
    const { error } = await (supabase as any).from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    setNewRole({ ...newRole, [userId]: "" });
    qc.invalidateQueries({ queryKey: ["user-roles-all"] });
    toast.success("Role assigned");
  }
  async function removeRole(id: string) {
    const { error } = await (supabase as any).from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["user-roles-all"] });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users & Roles</h1>
        <p className="text-sm text-muted-foreground">CEO & COO manage who can access what.</p>
      </div>
      <div className="space-y-3">
        {profiles.map((p: any) => {
          const userRolesFor = userRoles.filter((r: any) => r.user_id === p.id);
          return (
            <Card key={p.id}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div>
                  <div className="font-medium">{p.full_name || p.email}</div>
                  <div className="text-xs text-muted-foreground">{p.email}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {userRolesFor.length === 0 && <span className="text-xs text-muted-foreground">No role yet</span>}
                  {userRolesFor.map((r: any) => (
                    <Badge key={r.id} variant="secondary" className="gap-1">
                      {roleLabel(r.role)}
                      <button onClick={() => removeRole(r.id)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                  <Select value={newRole[p.id] ?? ""} onValueChange={(v) => setNewRole({ ...newRole, [p.id]: v })}>
                    <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="+ Add role" /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => addRole(p.id)}>Add</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
