## Goal
Create a pre-seeded admin account:
- Email: `ceo@cleancraftapp.com`
- Password: `cleancraft@#123`
- Role: CEO (full leadership access)

## Steps

1. **Create the auth user via migration**
   Use a one-off SQL migration that calls the Supabase auth schema to insert a confirmed user with the given email and bcrypt-hashed password. Email will be marked confirmed so login works immediately (no verification email needed).

2. **Ensure profile + CEO role**
   The existing `handle_new_user` trigger auto-creates a profile and assigns CEO to the first user. To be safe (in case other users already exist), the migration will also explicitly:
   - Insert into `public.profiles` if missing
   - Insert `('ceo')` into `public.user_roles` for this user if missing

3. **No frontend changes**
   Auth page already supports email/password sign-in — the user can log in immediately after the migration runs.

## Security note
Hardcoding a known password in a migration means anyone with repo access knows the admin password. Recommend changing it from the Users area after first login.

## Technical details
- Single migration using `auth.users` insert with `crypt(password, gen_salt('bf'))` and `email_confirmed_at = now()`.
- Idempotent: `ON CONFLICT (email) DO NOTHING` for the auth insert; `ON CONFLICT DO NOTHING` for profile/role inserts.
