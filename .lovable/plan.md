## Goal
Give salespeople a dedicated "My Sales Board" page that shows only leads where they are the Assigned Sales Executive.

## What to build

### 1. New route: `/my-sales`
File: `src/routes/_authenticated/my-sales.tsx`

Page contents (all scoped to `assigned_to = current user id`):
- Heading: "My Sales Board" + subtitle "Leads assigned to you"
- KPI cards (same style as Leads page, just user-scoped):
  - My Total Leads
  - My Hot Leads
  - My Warm Leads
  - Follow-ups Due Today
  - Overdue Follow-ups
  - Proposals Sent
  - Meetings Done
  - Bookings This Month
  - Converted to Franchise
- Quick filter pills: All / Due Today / Overdue / Hot / This Week's Meetings
- List/table of my leads with: Name, Phone, Stage badge, Classification badge, Follow-up date (red if overdue, blue if today), Edit button
- Reuse the existing `LeadDialog` from `leads.tsx` so edits work the same way

### 2. Navigation entry
Add a "My Sales Board" link in the authenticated sidebar/topbar so salespeople can reach it. Visible to every signed-in user (leadership can also use it to see their own assigned leads if any).

### 3. Data access
- Query: `supabase.from("leads").select("*").eq("assigned_to", user.id).order("followup_date")`
- No schema change, no migration — `leads.assigned_to` already exists.
- Existing RLS on `leads` already allows assignees to read/update their own leads.

## Files touched
- **Create** `src/routes/_authenticated/my-sales.tsx`
- **Edit** the authenticated layout / nav component to add a "My Sales Board" link (`src/routes/_authenticated/route.tsx` or whichever file renders the nav)

## Not in scope
- No new Kanban drag-and-drop board (you chose "My assigned leads page")
- No changes to global `/leads` page
- No RLS / DB schema changes
