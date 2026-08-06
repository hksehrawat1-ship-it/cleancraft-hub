import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* ---------------- reads ---------------- */

export const getWorkContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }, { data: departments }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, department").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("departments").select("code, name, manager_role").order("sort_order"),
    ]);
    const myRoles = (roles ?? []).map((r) => r.role as string);
    const managedDepartments = (departments ?? [])
      .filter((d) => d.manager_role && myRoles.includes(d.manager_role as string))
      .map((d) => d.code);
    const isLeadership = myRoles.includes("ceo") || myRoles.includes("coo");
    return {
      userId,
      profile: profile ?? null,
      roles: myRoles,
      departments: departments ?? [],
      managedDepartments,
      isLeadership,
      canSeeTeam: isLeadership || managedDepartments.length > 0,
    };
  });

export const listMyWork = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("work_items")
      .select("*")
      .eq("assigned_user", context.userId)
      .eq("is_test", false)
      .order("due_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  });

/** Team work for departments the caller manages. RLS still applies. */
export const listTeamWork = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { department?: string }) => input ?? {})
  .handler(async ({ context, data }) => {
    let q = context.supabase.from("work_items").select("*").eq("is_test", false);
    if (data.department) {
      q = q.or(`to_department.eq.${data.department},from_department.eq.${data.department}`);
    }
    const { data: rows, error } = await q.order("due_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return rows ?? [];
  });

export const listAssignableUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { role?: string }) => input ?? {})
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    if (data.role) {
      const { data: holders } = await supabase.from("user_roles").select("user_id").eq("role", data.role as never);
      const ids = (holders ?? []).map((h) => h.user_id);
      if (ids.length === 0) return [];
      const { data: people } = await supabase
        .from("profiles")
        .select("id, full_name, email, department")
        .in("id", ids)
        .order("full_name");
      return people ?? [];
    }
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name, email, department")
      .order("full_name");
    return people ?? [];
  });

export const listWorkHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workItemId: string }) => z.object({ workItemId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const [{ data: events }, { data: assignments }, { data: handovers }] = await Promise.all([
      context.supabase
        .from("work_events")
        .select("*")
        .eq("work_item_id", data.workItemId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("work_assignments")
        .select("*")
        .eq("work_item_id", data.workItemId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("work_handovers")
        .select("*")
        .eq("work_item_id", data.workItemId)
        .order("created_at", { ascending: false }),
    ]);
    return { events: events ?? [], assignments: assignments ?? [], handovers: handovers ?? [] };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- create / assign ---------------- */

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  recordType: z.string().default("task"),
  masterType: z.string().default("none"),
  masterId: z.string().uuid().optional(),
  masterCode: z.string().optional(),
  fromDepartment: z.string().optional(),
  toDepartment: z.string().optional(),
  assignedRole: z.string().optional(),
  assignedUser: z.string().uuid().optional(),
  priority: z.string().default("medium"),
  requiredAction: z.string().optional(),
  nextAction: z.string().optional(),
  startDate: z.string().optional(),
  dueAt: z.string().optional(),
  notesInternal: z.string().optional(),
  approvalRequired: z.boolean().default(false),
  isHandover: z.boolean().default(false),
  parentItemId: z.string().uuid().optional(),
});

export const createWorkItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: item, error } = await supabase
      .from("work_items")
      .insert({
        title: data.title,
        description: data.description ?? null,
        record_type: (data.isHandover ? "handover" : data.recordType) as never,
        master_type: data.masterType as never,
        master_id: data.masterId ?? null,
        master_code: data.masterCode ?? null,
        parent_item_id: data.parentItemId ?? null,
        created_by: userId,
        from_department: data.fromDepartment ?? null,
        to_department: data.toDepartment ?? null,
        assigned_role: (data.assignedRole ?? null) as never,
        assigned_user: data.assignedUser ?? null,
        priority: data.priority as never,
        status: (data.assignedUser ? "assigned" : "submitted") as never,
        required_action: data.requiredAction ?? null,
        next_action: data.nextAction ?? null,
        start_date: data.startDate ?? null,
        due_at: data.dueAt ?? null,
        notes_internal: data.notesInternal ?? null,
        approval_required: data.approvalRequired,
        handover_status: (data.isHandover ? "sent" : "not_applicable") as never,
      })
      .select("*")
      .single();
    if (error) throw error;

    if (data.assignedUser) {
      await supabase.from("work_assignments").insert({
        work_item_id: item.id,
        to_user: data.assignedUser,
        to_role: (data.assignedRole ?? null) as never,
        assigned_by: userId,
      });
    }
    if (data.isHandover) {
      await supabase.from("work_handovers").insert({
        work_item_id: item.id,
        from_department: data.fromDepartment ?? null,
        to_department: data.toDepartment ?? null,
        sent_by: userId,
        decision: "sent" as never,
      });
    }
    return item;
  });

export const assignWorkItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        workItemId: z.string().uuid(),
        assignedUser: z.string().uuid(),
        assignedRole: z.string().optional(),
        dueAt: z.string().optional(),
        reason: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: current } = await supabase
      .from("work_items")
      .select("assigned_user")
      .eq("id", data.workItemId)
      .maybeSingle();

    // preserve previous owner + reason
    await supabase
      .from("work_assignments")
      .update({ superseded_at: new Date().toISOString() })
      .eq("work_item_id", data.workItemId)
      .is("superseded_at", null);

    await supabase.from("work_assignments").insert({
      work_item_id: data.workItemId,
      from_user: current?.assigned_user ?? null,
      to_user: data.assignedUser,
      to_role: (data.assignedRole ?? null) as never,
      assigned_by: userId,
      reassign_reason: data.reason ?? null,
    });

    const { error } = await supabase
      .from("work_items")
      .update({
        assigned_user: data.assignedUser,
        assigned_role: (data.assignedRole ?? null) as never,
        status: "assigned" as never,
        due_at: data.dueAt ?? undefined,
      })
      .eq("id", data.workItemId);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- accept / return ---------------- */

export const respondToAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        workItemId: z.string().uuid(),
        decision: z.enum(["accept", "return"]),
        reason: z.string().optional(),
        missingInformation: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.decision === "return" && !data.reason?.trim()) {
      throw new Error("A reason is required when returning work.");
    }
    const now = new Date().toISOString();

    await supabase
      .from("work_assignments")
      .update(
        data.decision === "accept"
          ? { accepted_at: now }
          : { returned_at: now, return_reason: data.reason, missing_information: data.missingInformation ?? null },
      )
      .eq("work_item_id", data.workItemId)
      .eq("to_user", userId)
      .is("superseded_at", null);

    const { error } = await supabase
      .from("work_items")
      .update(
        data.decision === "accept"
          ? { status: "accepted" as never }
          : {
              status: "returned" as never,
              notes_internal: `Returned: ${data.reason}${
                data.missingInformation ? ` · Missing: ${data.missingInformation}` : ""
              }`,
            },
      )
      .eq("id", data.workItemId);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- progress / review / complete ---------------- */

export const updateWorkStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        workItemId: z.string().uuid(),
        status: z.string(),
        nextAction: z.string().optional(),
        dueAt: z.string().optional(),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const patch: Record<string, unknown> = { status: data.status };
    if (data.nextAction !== undefined) patch["next_action"] = data.nextAction;
    if (data.dueAt) patch["due_at"] = data.dueAt;
    if (data.note !== undefined) patch["notes_internal"] = data.note;
    const { error } = await context.supabase.from("work_items").update(patch as never).eq("id", data.workItemId);
    if (error) throw error;
    return { ok: true };
  });

export const submitWorkForReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        workItemId: z.string().uuid(),
        completionSummary: z.string().min(3),
        issuesRemaining: z.string().optional(),
        nextAction: z.string().optional(),
        evidenceLabel: z.string().optional(),
        evidenceUrl: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: item } = await supabase
      .from("work_items")
      .select("approval_required")
      .eq("id", data.workItemId)
      .maybeSingle();

    if (data.evidenceLabel || data.evidenceUrl) {
      await supabase.from("work_attachments").insert({
        work_item_id: data.workItemId,
        kind: "evidence",
        label: data.evidenceLabel ?? "Completion evidence",
        external_url: data.evidenceUrl ?? null,
        uploaded_by: userId,
      });
    }

    const needsReview = item?.approval_required !== false;
    const { error } = await supabase
      .from("work_items")
      .update({
        status: (needsReview ? "submitted_for_review" : "completed") as never,
        completion_summary: data.completionSummary,
        issues_remaining: data.issuesRemaining ?? null,
        next_action: data.nextAction ?? null,
        completed_at: needsReview ? null : new Date().toISOString(),
      })
      .eq("id", data.workItemId);
    if (error) throw error;
    return { ok: true, needsReview };
  });

export const reviewWork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        workItemId: z.string().uuid(),
        decision: z.enum(["approve", "correction"]),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    if (data.decision === "correction" && !data.note?.trim()) {
      throw new Error("Describe what needs correction.");
    }
    const { error } = await context.supabase
      .from("work_items")
      .update({
        status: (data.decision === "approve" ? "completed" : "correction_required") as never,
        reviewed_by: context.userId,
        completed_at: data.decision === "approve" ? new Date().toISOString() : null,
        notes_internal: data.note ?? null,
      })
      .eq("id", data.workItemId);
    if (error) throw error;
    return { ok: true };
  });

export const reopenWork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ workItemId: z.string().uuid(), reason: z.string().min(3) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("work_items")
      .update({ status: "reopened" as never, notes_internal: `Reopened: ${data.reason}`, completed_at: null })
      .eq("id", data.workItemId);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- handover ---------------- */

export const decideHandover = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        workItemId: z.string().uuid(),
        decision: z.enum(["accepted", "returned"]),
        reason: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.decision === "returned" && !data.reason?.trim()) {
      throw new Error("A reason is required when returning a handover.");
    }
    const now = new Date().toISOString();
    await supabase
      .from("work_handovers")
      .update({
        decision: data.decision as never,
        accepted_by: userId,
        reason: data.reason ?? null,
        decided_at: now,
      })
      .eq("work_item_id", data.workItemId)
      .eq("decision", "sent" as never);

    const { error } = await supabase
      .from("work_items")
      .update({
        handover_status: data.decision as never,
        status: (data.decision === "accepted" ? "accepted" : "returned") as never,
        notes_internal: data.reason ?? null,
      })
      .eq("id", data.workItemId);
    if (error) throw error;
    return { ok: true };
  });
