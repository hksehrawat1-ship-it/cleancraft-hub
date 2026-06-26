import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const HR_EMAIL = "hr@cleancraftApp.com";
const HR_PASSWORD = "cleancraft@123";
const HR_NAME = "Himanshu";

export const seedHrHead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Only CEO can seed
    const { data: isCeo } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "ceo",
    });
    if (!isCeo) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find existing user by email (idempotent)
    let userId: string | null = null;
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) throw listErr;
    const existing = list.users.find(
      (u) => (u.email ?? "").toLowerCase() === HR_EMAIL.toLowerCase(),
    );

    if (existing) {
      userId = existing.id;
      // Reset password just in case
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: HR_PASSWORD,
        email_confirm: true,
      });
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: HR_EMAIL,
        password: HR_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: HR_NAME },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    }

    if (!userId) throw new Error("No user id");

    // Upsert profile
    await supabaseAdmin.from("profiles").upsert(
      { id: userId, email: HR_EMAIL, full_name: HR_NAME },
      { onConflict: "id" },
    );

    // Ensure hr_head role
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "hr_head" as any }, { onConflict: "user_id,role" });

    return { ok: true, userId, email: HR_EMAIL };
  });
