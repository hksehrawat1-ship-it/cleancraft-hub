## Performance Marketing Executive Dashboard — `/pme`

A dedicated workspace where a signed-in PME manages their own stores, campaigns, influencers, tasks, and GMB health. Access limited to users with the `performance_marketing_executive` role (CEO/COO can also view).

### Route

- New file: `src/routes/_authenticated/pme.tsx` → URL `/pme`
- Head/title: "Performance Marketing — Clean Craft OS"
- Access gate: `performance_marketing_executive`, `ceo`, or `coo`; otherwise redirect to `/dashboard`

### Layout

Left sidebar (like the Video Editor dashboard) with the PME's name, avatar/initials, editable name, and Logout. Main area is a tabbed workspace:

1. **Dashboard** (default) — snapshot cards mirroring the CEO's PME view:
   - Store Performance: Managed / Growing / Need Attention / Declining
   - Campaign Status: Google Ads, Meta Ads, GMB, Influencer
   - Influencers: Contacted / Live / Pending / Completed
   - Tasks: Assigned / Completed / Pending + completion progress
   - GMB Health: Profiles Created, Reviews, Rating, Pending
2. **My Stores** — collapsible list of assigned stores with status badges (Live / Pending / Completed) and influencer counts.
3. **Campaigns** — cards to toggle each channel's status (Running / Pending / Updated) with a "Last updated" timestamp.
4. **Influencers** — table of influencers (name, store, status, notes) with add/edit/delete.
5. **My Tasks** — task list (title, due date, status) with mark-complete and add-task.
6. **My Performance** — completion %, month-to-month trend, top store, needs-attention list.

### Data source

Start with local component state seeded with realistic mock data (same shape as `PerfMktCeoView`), so the PME can click through and interact immediately. No new DB tables in this pass — a follow-up plan can wire persistence to Supabase (`pme_stores`, `pme_campaigns`, `pme_influencers`, `pme_tasks`) once the UI is approved.

### Technical notes

- Route file: `src/routes/_authenticated/pme.tsx`, `createFileRoute("/_authenticated/pme")`.
- Auth gating via `useAuth()` hook; check `roles.includes("performance_marketing_executive") || isLeadership`.
- Reuse UI atoms already in `perf-mkt-view.tsx` (`campaignBadge`, `influencerBadge`) — extract into `src/components/pme/shared.tsx` so both the CEO view and PME workspace stay in sync.
- Tabs via existing shadcn `Tabs` component; icons from `lucide-react` (`LayoutDashboard`, `Store`, `Megaphone`, `Users`, `ClipboardList`, `TrendingUp`).
- Profile name edit + logout mirrors the pattern in `src/routes/_authenticated/video-editor.tsx`.

### Out of scope for this pass

- Persisting campaigns/influencers/tasks to the database
- Assigning stores to a PME from the CEO/HR side
- Real ad-platform integrations (Google/Meta/GMB APIs)

Once you approve, I'll build the route + shared components with interactive mock data. After you review the UX, we can layer in the DB tables and CRUD server functions.