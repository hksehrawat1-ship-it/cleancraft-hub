## Goal
Provision a salesperson account and make sales users land directly on their CRM (My Sales Board) after login.

## Steps

### 1. Create the user (migration)
- Insert `sale1@cleancraftapp.com` into `auth.users` with bcrypt-hashed password `sales@123`, `email_confirmed_at = now()` so they can sign in immediately.
- The existing `handle_new_user` trigger will auto-create the matching `profiles` row.
- Insert into `public.user_roles` with role `sales_executive` (existing enum value) for this user.
- Set profile `full_name = "Sales Executive 1"`.
- Make the migration idempotent: skip if the email already exists.

### 2. Role-aware post-login redirect
Edit `src/routes/auth.tsx`:
- After `signInWithPassword` succeeds, fetch the user's `user_roles`.
- If the user has `ceo` or `coo` → navigate to `/dashboard` (current behavior).
- If the user has any sales role (`sales_executive` or `sales_coordinator`) and no leadership role → navigate to `/my-sales`.
- Otherwise → `/dashboard`.
- Apply the same role check in the existing "already has a session" effect so refreshing on `/auth` while signed in as sales lands on `/my-sales`.

### 3. No other changes
- The My Sales Board page already exists at `/my-sales` and filters by `assigned_to = current user`.
- Sidebar already shows the "My Sales Board" link for all signed-in users.
- RLS on `leads` already lets assignees read their own leads.

## Files touched
- New migration: create user + role
- Edit `src/routes/auth.tsx` for role-based redirect

## Credentials you'll use
- Email: `sale1@cleancraftapp.com`
- Password: `sales@123`
- Role: `sales_executive`
