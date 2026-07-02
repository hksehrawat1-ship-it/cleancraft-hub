import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ROLES, type RoleValue } from "@/lib/roles";

const ROLE_VALUES = ROLES.map((r) => r.value) as string[];

async function assertCanManage(context: any) {
  const [{ data: isCeo }, { data: isCoo }, { data: isHr }] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "ceo" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "coo" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "hr_head" }),
  ]);
  if (!isCeo && !isCoo && !isHr) throw new Error("Forbidden");
}

export const createEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    fullName: string;
    email: string;
    password: string;
    department?: string | null;
    role: RoleValue;
  }) => {
    if (!input.fullName?.trim()) throw new Error("Name required");
    if (!input.email?.trim()) throw new Error("Email required");
    if (!input.password || input.password.length < 8)
      throw new Error("Password must be at least 8 characters");
    if (!ROLE_VALUES.includes(input.role)) throw new Error("Invalid role");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertCanManage(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.trim().toLowerCase();

    // Check for existing user
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (existing) throw new Error("A user with this email already exists");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName.trim() },
    });
    if (createErr) throw createErr;
    const userId = created.user.id;

    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: data.fullName.trim(),
        department: data.department?.trim() || null,
      },
      { onConflict: "id" },
    );

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role as any }, { onConflict: "user_id,role" });

    return { ok: true, userId };
  });

export const deleteEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => {
    if (!input.userId) throw new Error("userId required");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertCanManage(context);
    if (data.userId === context.userId) throw new Error("You cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Safety: never delete a CEO
    const { data: ceoRoles } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", data.userId)
      .eq("role", "ceo" as any);
    if ((ceoRoles ?? []).length > 0) throw new Error("Cannot delete a CEO account");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw error;
    return { ok: true };
  });

export const resetEmployeePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => {
    if (!input.userId) throw new Error("userId required");
    if (!input.password || input.password.length < 8)
      throw new Error("Password must be at least 8 characters");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertCanManage(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
      email_confirm: true,
    });
    if (error) throw error;
    return { ok: true };
  });
