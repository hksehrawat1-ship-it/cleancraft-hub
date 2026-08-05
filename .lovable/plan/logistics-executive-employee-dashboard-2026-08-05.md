# Logistics Executive Employee Dashboard

Build a new employee workspace at `/logistics-executive` so the Logistics Executive can manage packing staff and track dispatches end-to-end.

## Side menu
- Dashboard
- Dispatch Plan
- In-Transit Shipments
- Delivery Confirmation
- Packing Staff Oversight
- Supplies & Inventory
- Performance

## Pages
1. **Dashboard**
   - KPI cards: Dispatches Today, In-Transit, Delivered Today, Delayed, Packing Staff On Duty, Pending Clearance from Accounts.
   - Attention list: delayed shipments, pending clearance, low packing supplies.

2. **Dispatch Plan**
   - List of planned dispatches with store, items, quantity, packing status, and accounts clearance.
   - Actions: mark as packed, request missing info, send to dispatch.

3. **In-Transit Shipments**
   - Track shipments with expected vs actual delivery dates.
   - Filters: all, delayed, arriving today.

4. **Delivery Confirmation**
   - List of shipments awaiting POD/delivery proof.
   - Capture delivery notes and recipient details.

5. **Packing Staff Oversight**
   - View packing team members and their current tasks.
   - Reassign or add packing tasks with priority.
   - Track throughput and defect rate.

6. **Supplies & Inventory**
   - Packing material stock levels (boxes, tape, bubble wrap, labels).
   - Low-stock alerts and request flow.

7. **Performance**
   - KPIs: on-time delivery %, average delivery time, packing accuracy, dispatches handled.
   - Period comparison and workload status.

## Route & navigation
- Add `src/routes/_authenticated/logistics-executive.tsx` with the side menu and page switching.
- Keep the existing `/packing-staff` route for the packing staff's own workspace.
- Update `src/lib/ceo-nav.ts` so the CEO nav "Logistic Executive" item links to `/logistics-executive`.

## Data
- Use local mock data for the first version, consistent with other employee dashboards.
- No new database tables required for this iteration.
