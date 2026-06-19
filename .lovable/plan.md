## Goal

Transform `/my-sales` into a **Franchise Sales Operating Dashboard** and add a dedicated **Lead Details page** with timeline. Keep current clean/simple look (cards, badges, neutral palette). Apply the spec's color system and "No Lead Left Behind" validation.

## 1. Database changes (one migration)

Add to `public.leads`:
- `buying_factor_profitability`, `buying_factor_training`, `buying_factor_technology`, `buying_factor_support`, `buying_factor_brand` — boolean (default false)
- `next_action` text — one of Call, Follow-up, Send Proposal, Schedule Meeting, Collect Engagement Fee, Handover, Disqualify
- `engagement_letter_sent_date` date
- `engagement_letter_fee_status` text — Pending, Received, Not Required (default Pending when letter sent)
- `engagement_letter_fee_received_date` date
- `engagement_letter_fee_amount` numeric
- `booking_date` date
- `state` text

Update `lead_stage` allowed values (in app code; column is free text): add `Engagement Letter Pending`. Replace `Booking Pending` usage with new stage. Keep `Handover Done` as `Handover Completed` for display while remaining backward compatible.

New table `public.lead_activities`:
- `id uuid pk`, `lead_id uuid fk leads(id) on delete cascade`
- `actor_id uuid` (user), `action text` (e.g. "Lead Created", "Stage Changed: Proposal Sent", "Follow-up Completed", "Note Added")
- `details jsonb` (optional)
- `created_at timestamptz default now()`
- GRANTs to authenticated/service_role, RLS:
  - SELECT: any authenticated user who can see the lead (assignee OR leadership) — reuse same predicate as `leads`
  - INSERT: assignee or leadership

DB trigger `log_lead_activity()` on `leads` AFTER INSERT/UPDATE to auto-insert rows when stage, next_action, followup_date, proposal_sent_date, meeting_date, engagement_letter_sent_date, engagement_letter_fee_status, booking_date, converted_to_franchise_at change.

## 2. Lead form changes (`LeadDialog` in `leads.tsx`)

- Add fields: State, Decision Maker (Yes/No), 5 buying factor checkboxes, Next Action dropdown, Engagement Letter Sent Date, EL Fee Status, EL Fee Received Date, EL Fee Amount, Booking Date.
- Add `Engagement Letter Pending` and rename display label `Handover Done` → `Handover Completed` in STAGES.
- **No Lead Left Behind validation**: block save unless `lead_stage`, `next_action`, `followup_date` are all set. Show inline error.

## 3. New route `/_authenticated/leads/$id` — Lead Details Page

Sections rendered as cards:
- Personal Details, Qualification Details, Buying Factors, Classification badge, Stage badge, Sales Information, Next Action + Follow-up Date + Remarks (editable inline via existing LeadDialog "Edit" button).
- **Activity Timeline** card: queries `lead_activities` ordered desc, shows date/time/actor name/action with vertical timeline styling.
- Action buttons: Call (tel:), WhatsApp (wa.me), Edit.

Add Edit button on existing tables linking to this route.

## 4. Redesign `/my-sales` page

Stacked sections (top→bottom), each as a labeled block:

**Section 1 — Today's Action Center** (7 cards)
New Leads Assigned Today · Follow-ups Due Today · Overdue Follow-ups · Meetings Scheduled Today · Hot Leads Requiring Action · Engagement Letter Fee Pending · Bookings Received This Month.

**Section 2 — Sales Pipeline** (horizontal scroll strip)
9 stage chips with counts. Clicking a stage filters Section 4 list and scrolls to it.

**Section 3 — Hot Leads Requiring Action**
Card grid; each card: Name, City, Phone, Classification badge, Stage, Next Action, Follow-up Date, buttons [Call] [WhatsApp] [Open Lead → details page]. Sorted by nearest follow-up.

**Section 4 — Follow-up Control Center**
Tabs: Due Today / Overdue / Next 7 Days / Payment Pending (EL fee pending) / Meeting Scheduled. Table: Name, Mobile, City, Stage, Next Action, Follow-up Date.

**Section 5 — Booking Tracker**
5 cards with count + amount sum: EL Sent · EL Fee Pending · EL Fee Received · Handover Pending · Handover Completed.

**Section 10 — Sales KPI Widgets** (bottom)
Total Leads · Qualified Leads · Proposal Sent · Meetings Done · Engagement Fees Collected (count + ₹ sum) · Bookings Received · Conversion % (handover/total) · Overdue Follow-ups.

## 5. Color system (applied across badges in `my-sales.tsx` and details page)

Hot = Green, Warm = Orange, Cold = Blue, Dangerous = Red, Time Waster = Grey. (Override current Hot=red Warm=amber mapping for the new dashboard while leaving the existing `/leads` table colors as-is to avoid disturbing other pages — confirm if you'd rather change globally.)

## Out of scope

- No Kanban drag/drop.
- No changes to `/leads` table layout (only the dialog form gets new fields + validation).
- No SMS/email integrations beyond `tel:` and `wa.me` links.

## Files

- New migration: leads columns + lead_activities table + trigger.
- Edit: `src/routes/_authenticated/leads.tsx` (LeadDialog form + STAGES + validation).
- Edit: `src/routes/_authenticated/my-sales.tsx` (full redesign).
- New: `src/routes/_authenticated/leads.$id.tsx` (details + timeline).
- Edit: sidebar in `route.tsx` — rename link to "Sales Operating Dashboard".

Confirm and I'll implement.
