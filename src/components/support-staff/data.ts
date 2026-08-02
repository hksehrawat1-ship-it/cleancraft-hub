import { Coffee, SprayCan, Package, type LucideIcon } from "lucide-react";

export type StaffRole = "pantry" | "cleaning" | "packing";

export type TaskStatus = "pending" | "in-progress" | "done" | "issue";

export type StaffTask = {
  id: string;
  title: string;
  area: string;
  slot: string;
  role: StaffRole;
  assignee: string;
  status: TaskStatus;
  priority: "normal" | "high";
  note?: string;
};

export type SupplyItem = {
  id: string;
  name: string;
  unit: string;
  inStock: number;
  minLevel: number;
  role: StaffRole;
};

export type StaffMember = { id: string; name: string; role: StaffRole; shift: string };

export const STAFF: StaffMember[] = [
  { id: "s1", name: "Ramesh Kumar", role: "pantry", shift: "9:00 AM – 6:00 PM" },
  { id: "s2", name: "Sunita Devi", role: "cleaning", shift: "8:00 AM – 5:00 PM" },
  { id: "s3", name: "Arjun Yadav", role: "cleaning", shift: "1:00 PM – 10:00 PM" },
  { id: "s4", name: "Mohit Sharma", role: "packing", shift: "9:30 AM – 6:30 PM" },
  { id: "s5", name: "Pooja Verma", role: "packing", shift: "10:00 AM – 7:00 PM" },
];

export const ROLE_META: Record<
  StaffRole,
  { label: string; icon: LucideIcon; suppliesLabel: string }
> = {
  pantry: { label: "Pantry Staff", icon: Coffee, suppliesLabel: "Pantry Supplies" },
  cleaning: { label: "Cleaning Staff", icon: SprayCan, suppliesLabel: "Cleaning Supplies" },
  packing: { label: "Packing Staff", icon: Package, suppliesLabel: "Packing Materials" },
};

export const TASKS: StaffTask[] = [
  // Pantry
  { id: "T-101", title: "Morning tea & coffee service", area: "Floor 1 – Sales", slot: "9:30 AM", role: "pantry", assignee: "Ramesh Kumar", status: "done", priority: "normal" },
  { id: "T-102", title: "Refill water dispensers", area: "All floors", slot: "11:00 AM", role: "pantry", assignee: "Ramesh Kumar", status: "in-progress", priority: "normal" },
  { id: "T-103", title: "Guest refreshments – CEO cabin", area: "Floor 2", slot: "12:30 PM", role: "pantry", assignee: "Ramesh Kumar", status: "pending", priority: "high" },
  { id: "T-104", title: "Evening snack setup", area: "Cafeteria", slot: "4:30 PM", role: "pantry", assignee: "Ramesh Kumar", status: "pending", priority: "normal" },
  // Cleaning
  { id: "T-201", title: "Washroom deep clean", area: "Floor 1", slot: "8:30 AM", role: "cleaning", assignee: "Sunita Devi", status: "done", priority: "high" },
  { id: "T-202", title: "Workstation dusting", area: "Floor 2 – Ops", slot: "10:00 AM", role: "cleaning", assignee: "Sunita Devi", status: "in-progress", priority: "normal" },
  { id: "T-203", title: "Floor mopping – reception", area: "Ground floor", slot: "2:00 PM", role: "cleaning", assignee: "Arjun Yadav", status: "pending", priority: "normal" },
  { id: "T-204", title: "Dustbin clearance", area: "All floors", slot: "6:00 PM", role: "cleaning", assignee: "Arjun Yadav", status: "pending", priority: "normal" },
  // Packing
  { id: "T-301", title: "Pack franchise starter bundles (6)", area: "Store room", slot: "10:00 AM", role: "packing", assignee: "Mohit Sharma", status: "in-progress", priority: "high" },
  { id: "T-302", title: "Label dispatch cartons – Jaipur", area: "Dispatch bay", slot: "11:30 AM", role: "packing", assignee: "Mohit Sharma", status: "pending", priority: "normal" },
  { id: "T-303", title: "Branding kit packing – Indore", area: "Store room", slot: "1:00 PM", role: "packing", assignee: "Pooja Verma", status: "pending", priority: "normal" },
  { id: "T-304", title: "Quality check packed boxes", area: "Dispatch bay", slot: "4:00 PM", role: "packing", assignee: "Pooja Verma", status: "issue", priority: "high", note: "Tape roll finished" },
];

export const SUPPLIES: SupplyItem[] = [
  { id: "P1", name: "Tea powder", unit: "kg", inStock: 4, minLevel: 2, role: "pantry" },
  { id: "P2", name: "Coffee sachets", unit: "box", inStock: 1, minLevel: 2, role: "pantry" },
  { id: "P3", name: "Sugar", unit: "kg", inStock: 6, minLevel: 3, role: "pantry" },
  { id: "P4", name: "Paper cups", unit: "pack", inStock: 2, minLevel: 4, role: "pantry" },
  { id: "P5", name: "Biscuits", unit: "pack", inStock: 12, minLevel: 6, role: "pantry" },
  { id: "C1", name: "Floor cleaner", unit: "litre", inStock: 5, minLevel: 3, role: "cleaning" },
  { id: "C2", name: "Toilet cleaner", unit: "bottle", inStock: 1, minLevel: 3, role: "cleaning" },
  { id: "C3", name: "Glass cleaner", unit: "bottle", inStock: 3, minLevel: 2, role: "cleaning" },
  { id: "C4", name: "Mop refill", unit: "piece", inStock: 2, minLevel: 2, role: "cleaning" },
  { id: "C5", name: "Garbage bags", unit: "roll", inStock: 8, minLevel: 4, role: "cleaning" },
  { id: "K1", name: "Corrugated boxes (M)", unit: "piece", inStock: 40, minLevel: 25, role: "packing" },
  { id: "K2", name: "Packing tape", unit: "roll", inStock: 2, minLevel: 6, role: "packing" },
  { id: "K3", name: "Bubble wrap", unit: "roll", inStock: 3, minLevel: 2, role: "packing" },
  { id: "K4", name: "Stretch film", unit: "roll", inStock: 5, minLevel: 3, role: "packing" },
  { id: "K5", name: "Dispatch labels", unit: "sheet", inStock: 60, minLevel: 50, role: "packing" },
];

export const HELP_TOPICS: Record<StaffRole, { q: string; a: string }[]> = {
  pantry: [
    { q: "How do I start my day?", a: "Open Home, check today's tasks, then mark each task Started and Done as you finish it." },
    { q: "Supplies are finishing — what do I do?", a: "Go to Pantry Supplies, press Request, choose the quantity and submit. The Administration Manager is notified." },
    { q: "Guest refreshment rules", a: "Serve within 5 minutes of a guest arriving. Always use clean covered trays and fresh water." },
    { q: "Hygiene checklist", a: "Wash hands before service, wear the apron, keep the pantry counter dry, and clear used cups every hour." },
  ],
  cleaning: [
    { q: "How do I start my day?", a: "Open Home, check today's tasks, then mark each task Started and Done as you finish it." },
    { q: "Which cleaner for which surface?", a: "Floor cleaner for tiles, glass cleaner for windows and partitions, toilet cleaner only for washrooms." },
    { q: "Safety rules", a: "Always place the wet-floor sign, wear gloves with chemicals, and never mix two cleaning liquids." },
    { q: "Washroom standard", a: "Check every two hours: dry floor, stocked soap and tissue, no smell, dustbin under half full." },
  ],
  packing: [
    { q: "How do I start my day?", a: "Open Home, check today's tasks, then mark each task Started and Done as you finish it." },
    { q: "Standard franchise bundle", a: "1 branding kit, 2 uniform sets, printed stationery pack, POS accessories box and the welcome folder." },
    { q: "Packing quality rules", a: "Double-tape the base, bubble-wrap fragile items, and stick the dispatch label on the top-right side." },
    { q: "Damaged material found", a: "Do not pack it. Use Report a Problem and mention the item name and quantity." },
  ],
};
