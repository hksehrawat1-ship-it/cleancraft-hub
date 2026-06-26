## HR Head Dashboard

Create a dedicated dashboard for the HR Head role with an editable welcome name and seeded credentials.

### 1. Seed HR Head user
- Create auth user `hr@cleancraftApp.com` / `cleancraft@123` via admin server function (one-time seed, idempotent: skip if exists).
- Ensure a `profiles` row exists with `full_name = "Himanshu"`.
- Assign role `hr_head` in `user_roles` (add `hr_head` to the `app_role` enum and to `src/lib/roles.ts`).

### 2. Route: `/_authenticated/hr-head`
- New file `src/routes/_authenticated/hr-head.tsx`.
- Guards: redirect away if user is not `hr_head` (and not CEO/COO viewing).
- Header: `Welcome, {full_name}` — clicking the name (or a small pencil icon) turns it into an inline input; on blur/Enter it saves `profiles.full_name` via Supabase and refreshes the query.
- Body: placeholder sections for HR Head (Team, Hiring, Attendance, Policies) as empty cards — to be filled later.

### 3. Wire-up from the CEO sidebar
- The existing "10. HR Dept. → HR Head" item under master view should link to `/hr-head` (hash anchor stays for CEO overview; the link opens the actual dashboard).

### 4. Post-login redirect
- In `src/routes/auth.tsx` (or wherever the post-login redirect lives), if signed-in user has only the `hr_head` role, navigate to `/hr-head` instead of `/dashboard`.

### Technical notes
- Migration: `ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'hr_head';` + update `roles.ts`.
- Seeding uses `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })` inside a server fn gated by `requireSupabaseAuth` + `has_role(..., 'ceo')`; runnable once from a small "Seed HR Head" button on the CEO master page, OR auto-run via migration using `supabase.auth.admin` is not available in SQL — so we expose a one-click seed action visible to CEO only.
- Name edit: `update profiles set full_name = $1 where id = auth.uid()` (existing RLS already permits self-update).

### Files to add/change
- add `src/routes/_authenticated/hr-head.tsx`
- add `src/lib/hr-seed.functions.ts` (CEO-gated seed server fn)
- edit `src/lib/roles.ts` (add `hr_head`)
- edit `src/routes/_authenticated/master.tsx` (HR Head link + seed button visible to CEO)
- edit `src/routes/auth.tsx` (role-based redirect)
- migration: extend `app_role` enum
