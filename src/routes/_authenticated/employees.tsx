import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, DEPARTMENTS, roleLabel, type RoleValue } from "@/lib/roles";
import {
  createEmployee,
  deleteEmployee,
  resetEmployeePassword,
} from "@/lib/employees.functions";
import { toast } from "sonner";
import { Trash2, KeyRound, UserPlus, Search, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({ meta: [{ title: "Employees — Clean Craft OS" }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { user, roles, isLeadership, loading } = useAuth();
  const qc = useQueryClient();
  const runCreate = useServerFn(createEmployee);
  const runDelete = useServerFn(deleteEmployee);
  const runReset = useServerFn(resetEmployeePassword);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
    role: "" as RoleValue | "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPwd, setResetPwd] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["employees-profiles"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: userRoles = [] } = useQuery({
    queryKey: ["employees-roles"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("user_roles").select("*");
      return data ?? [];
    },
  });

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const canManage = isLeadership || roles.includes("hr_head");
  if (!canManage) return <Navigate to="/dashboard" replace />;

  const filtered = profiles.filter((p: any) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.full_name ?? "").toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q) ||
      (p.department ?? "").toLowerCase().includes(q)
    );
  });

  async function submit() {
    if (!form.fullName || !form.email || !form.password || !form.role) {
      return toast.error("Fill name, email, password and role");
    }
    setSubmitting(true);
    try {
      await runCreate({
        data: {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          department: form.department || null,
          role: form.role as RoleValue,
        },
      });
      toast.success("Employee created");
      setForm({ fullName: "", email: "", password: "", department: "", role: "" });
      qc.invalidateQueries({ queryKey: ["employees-profiles"] });
      qc.invalidateQueries({ queryKey: ["employees-roles"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(userId: string, name: string) {
    if (!confirm(`Remove ${name}? This deletes their login permanently.`)) return;
    try {
      await runDelete({ data: { userId } });
      toast.success("Employee removed");
      qc.invalidateQueries({ queryKey: ["employees-profiles"] });
      qc.invalidateQueries({ queryKey: ["employees-roles"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to remove");
    }
  }

  async function submitReset() {
    if (!resetFor) return;
    try {
      await runReset({ data: { userId: resetFor, password: resetPwd } });
      toast.success("Password reset");
      setResetFor(null);
      setResetPwd("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to reset password");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employee Directory</h1>
          <p className="text-sm text-muted-foreground">
            Create logins for any department. Add or remove people, reset passwords.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> Add Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@cleancraftapp.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as RoleValue })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" disabled={submitting} onClick={submit}>
                {submitting ? "Creating…" : "Create Login"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">
              All Employees{" "}
              <span className="text-muted-foreground font-normal">({profiles.length})</span>
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, department…"
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">No employees found.</div>
          )}
          {filtered.map((p: any) => {
            const rs = userRoles.filter((r: any) => r.user_id === p.id);
            const isSelf = p.id === user?.id;
            return (
              <div
                key={p.id}
                className="border rounded-md p-3 flex flex-col md:flex-row md:items-center gap-3 justify-between bg-muted/20"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.full_name || p.email}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.department && (
                      <Badge variant="outline" className="text-[11px]">
                        {p.department}
                      </Badge>
                    )}
                    {rs.map((r: any) => (
                      <Badge key={r.id} variant="secondary" className="text-[11px]">
                        {roleLabel(r.role)}
                      </Badge>
                    ))}
                    {rs.length === 0 && (
                      <span className="text-[11px] text-muted-foreground">No role assigned</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {resetFor === p.id ? (
                    <>
                      <Input
                        value={resetPwd}
                        onChange={(e) => setResetPwd(e.target.value)}
                        placeholder="New password"
                        className="h-8 w-40"
                      />
                      <Button size="sm" onClick={submitReset}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setResetFor(null);
                          setResetPwd("");
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setResetFor(p.id);
                          setResetPwd("");
                        }}
                      >
                        <KeyRound className="w-3.5 h-3.5 mr-1" /> Reset
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isSelf}
                        onClick={() => remove(p.id, p.full_name || p.email)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
