import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VE_EMAIL = "ve@cleancraftapp.com";
const VE_PASSWORD = "cleancraft@123";
const VE_NAME = "Video Editor";

export const seedVideoEditor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isCeo } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "ceo",
    });
    if (!isCeo) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let userId: string | null = null;
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) throw listErr;
    const existing = list.users.find(
      (u) => (u.email ?? "").toLowerCase() === VE_EMAIL.toLowerCase(),
    );

    if (existing) {
      userId = existing.id;
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: VE_PASSWORD,
        email_confirm: true,
      });
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: VE_EMAIL,
        password: VE_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: VE_NAME },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    }

    if (!userId) throw new Error("No user id");

    await supabaseAdmin.from("profiles").upsert(
      { id: userId, email: VE_EMAIL, full_name: VE_NAME },
      { onConflict: "id" },
    );

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "video_editor" as any }, { onConflict: "user_id,role" });

    return { ok: true, userId, email: VE_EMAIL };
  });
