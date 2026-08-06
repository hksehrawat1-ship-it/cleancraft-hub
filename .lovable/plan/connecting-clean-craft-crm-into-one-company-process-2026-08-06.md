# Connecting Clean Craft CRM Into One Company Process

## 1. Existing-page audit

29 dashboard routes are live and will not be redesigned or removed:

| Area | Route | Data source today |
| --- | --- | --- |
| CEO / Master | `/master`, `/dashboard` | mix of DB + mock modules |
| Sales | `/sales-head`, `/sales-executive`, `/sales-cms`, `/leads` | leads table + mock |
| Content | `/smm`, `/video-editor` | mock modules |
| Projects | `/project-coordinator`, `/project-manager` | projects table + mock |
| Money | `/account-manager`, `/payments` | payments table + mock |
| Logistics | `/logistics-executive`, `/packing-staff` | mock modules |
| Tech | `/developer`, `/technical-support`, `/field-engineer` | mock modules |
| Launch & Store Success | `/tl`, `/rm`, `/stores`, `/complaints` | stores/complaints + mock |
| People & Admin | `/hr-head`, `/users`, `/administration-manager`, `/pantry&cleaning`, `/tasks` | profiles/user_roles/tasks + mock |

Finding: the screens, workflows and role menus are complete, but ~90% of records are sample data inside `src/components/**/*-data.ts`. Departments do not yet exchange one record.

## 2. Existing database assessment

Present and reusable: `profiles`, `user_roles` (+ `has_role`, `is_leadership`), `leads`, `franchise_bookings`, `projects`, `stores`, `tasks`, `payments`, `complaints`, `lead_activities`, `sales_notes`, plus lineage codes (`LEAD-`, `FR-`, `PRJ-`, `STR-`) and the three handover functions.

Gaps: no shared work-item table, no assignment/accept-return record, no handover record, no audit trail beyond leads, no notifications, no roster of departments/vendors, no Payment Request / Clearance / Dispatch / Ticket / Content IDs. `tasks` is too thin for the universal field list and its policies allow any authenticated user to read everything.

Decision: keep every existing table. Add a thin shared workflow layer beside them. No department gets its own duplicate database.

## 3. Recommended shared data model

One central table carries every unit of work; department mock modules are replaced screen by screen, not all at once.

```text
work_items  (the universal work item: task, request, ticket, handover, content)
  |- work_assignments   (owner history: assigned / accepted / returned / reassigned)
  |- work_handovers     (department to department: sent / accepted / returned)
  |- work_events        (immutable audit history)
  |- work_attachments   (documents + completion evidence)
  '- notifications      (in-app only)

master records already in DB: leads -> franchise_bookings -> projects -> stores
```

`work_items` links to a master record by type + id (`project`, `store`, `lead`, `franchise`), so payments, site execution, logistics, App/POS, training and launch all hang off the same Project ID.

## 4. Required tables and relationships

- `departments` — code, name, manager role.
- `work_items` — permanent `record_code`, `record_type`, `master_type`, `master_id`, `parent_item_id`, `created_by`, `from_department`, `to_department`, `assigned_role`, `assigned_user`, `priority`, `status`, `required_action`, `next_action`, `start_date`, `due_at`, `notes_internal`, `approval_required`, `handover_status`, `completion_summary`, `completed_at`, `is_test`, `cancelled_reason`, timestamps.
- `work_assignments` — item, from_user, to_user, to_role, assigned_by, accepted_at, returned_at, return_reason, missing_information, superseded_at.
- `work_handovers` — item, from_department, to_department, sent_by, accepted_by, decision, reason, decided_at.
- `work_events` — item, actor, event_type, from_value, to_value, reason, created_at (insert-only; no update/delete policy).
- `work_attachments` — item, kind (`document` / `evidence`), storage path, uploaded_by.
- `notifications` — user, item, type, title, body, read_at.
- `vendors` — for plumber, electrician, carpenter, painter, branding vendor, local electrician.
- `payment_requests` and `dispatch_clearances` — workflow status plus Vyapar invoice/receipt reference only. Vyapar stays the official billing system.
- `content_items` — one Content ID across every version and correction round.

Every new public table ships with GRANTs, RLS enabled, and role-scoped policies in the same migration.

## 5. Record-ID strategy

Human-readable permanent codes from sequences, assigned by trigger, never reused or renumbered:

`LEAD-000123`, `FR-000045`, `PRJ-000045`, `STR-000045`, `PAY-000210`, `CLR-000188`, `DSP-000174`, `TKT-000901`, `TSK-004512`, `CNT-000320`, `EMP-000128`

Handovers reuse the master ID and create a child work item — they never clone the master record. Reassignment, correction rounds and reopening keep the original code.

## 6. Role and permission matrix (summary)

| Scope | Sees |
| --- | --- |
| Employee | only work items assigned to them, plus items they created |
| Manager (Sales Head, Project Coordinator, Accounts Manager, Logistics Executive, Administration Manager, SMM) | their department's items and their team's queues |
| Department Head | full department |
| HR Head | employee-process items only, not financial or technical detail |
| CEO / COO | company level, finalised in Phase 10 |

Enforced by RLS security-definer helpers (`user_department`, `manages_department`, extending `has_role`) so access cannot be gained by changing a URL. Packing Staff policies exclude payment columns. Project Coordinator can raise a payment request but cannot set verified status.

## 7. Assignment, handover and review workflows

Assignment: manager creates item → picks role → picks a user holding that role → item becomes `assigned` → assignee must **Accept** or **Return** (return needs reason + missing-information list) → `in_progress`. Reassignment writes a new `work_assignments` row and keeps the previous owner and reason.

Handover: sender submits → item enters `handover_status = sent` for the receiving department → receiving manager Accepts (creates the next-stage child item) or Returns with reason. No duplicate master record is created.

Review: `submitted_for_review` → reviewer Approves (→ `completed`, then `closed`) or requests Correction (→ `correction_required`, back to the same owner). Completion requires summary, completion time, evidence when applicable, issues remaining and next action. Completed records are never deleted or silently edited; reopening creates a `reopened` event.

Status vocabulary is shared: Draft, Submitted, Assigned, Accepted, In Progress, Submitted for Review, Approved, Completed, Closed, plus Information Required, Returned, Blocked, Correction Required, Reassigned, Cancelled, Reopened. Departments use the subset that fits them.

## 8. Notification and audit models

In-app only: new assignment, assignment returned, deadline approaching, overdue, information requested, submitted for review, approved, correction requested, handover sent / accepted / returned, reopened. Written by database triggers on `work_items` / `work_assignments` / `work_handovers`, read through a bell + list on each dashboard. No email, WhatsApp or SMS.

Audit: every create, assign, accept, return, status change, deadline change, reassignment, review decision, handover decision, completion and reopen writes a `work_events` row with actor, timestamp and reason. Insert-only — no update or delete policy exists.

## 9. Migration plan that preserves existing work

1. Add new tables only; no existing table is dropped or restructured.
2. Backfill `work_items` from existing `tasks`, `payments` and `complaints` rows so nothing on screen is lost.
3. Each dashboard switches from its mock module to shared queries one page at a time; the mock module stays in place until its page is verified.
4. Sample data continues to render for pages not yet migrated, so no dashboard ever goes blank mid-phase.

## 10. Implementation order

Phase 1 (recommended first, smallest safe slice): shared roles/departments, `work_items`, `work_assignments`, `work_events`, `notifications`, RLS + GRANTs, a reusable Work Item card / accept-return / complete dialog set, and the nine-tile employee queue + eight-tile manager queue rendered from real data on two pilot dashboards.

Then: Phase 2 Social Media → Sales · Phase 3 Sales → Project Coordinator · Phase 4 PC → Accounts → Logistics → Packing → Delivery · Phase 5 Project Manager execution and vendors · Phase 6 App/POS and technical support · Phase 7 Training, launch, Store Success handover · Phase 8 HR and internal support · Phase 9 cross-department testing · Phase 10 monitoring, escalation, performance, CEO reporting.

## 11. Testing plan

Per phase: create → assign → accept → return → reassign → complete with evidence → review → handover accept and return, checked as each role. Verify one record ID travels the whole chain with no duplicate; verify a Packing Staff login cannot read payment data and a URL change grants nothing; verify audit rows exist for every action and that completed records resist deletion.

## 12. Risks and unresolved decisions

- Mock-to-live switching is the main risk; mitigated by page-at-a-time migration with the sample module retained until verified.
- Roles needed but not yet in the role enum: technical support, field engineer, developer, packing staff, administration manager, trainer, logistics executive, accounts manager, sales head. Needs a decision on extending the enum versus mapping to existing values.
- Deadline defaults (SLA hours) per work type need your input.
- Whether the store owner or franchisee ever logs in — affects Relationship Manager and complaint visibility.
- Vyapar stays manual reference entry for now; no integration.

**Proposed first step: Phase 1 only.** Nothing in this plan changes an existing dashboard layout or side menu.
