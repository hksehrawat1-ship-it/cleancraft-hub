export type DispatchStatus =
  | "planned"
  | "pending_clearance"
  | "ready_to_pack"
  | "packing"
  | "packed"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "returned";

export type Shipment = {
  id: string;
  store: string;
  city: string;
  items: string;
  quantity: number;
  raisedBy: string;
  status: DispatchStatus;
  plannedDate: string;
  expectedDate: string;
  actualDate?: string;
  clearance: boolean;
  packedBy?: string;
  deliveryNote?: string;
  recipient?: string;
};

export type PackingStaff = {
  id: string;
  name: string;
  shift: string;
  activeTasks: number;
  completedToday: number;
  defectsToday: number;
  status: "available" | "busy" | "offline";
};

export type SupplyItem = {
  id: string;
  name: string;
  unit: string;
  inStock: number;
  minLevel: number;
  role: "packing";
};

export const DISPATCHES: Shipment[] = [
  {
    id: "DP-101",
    store: "Jaipur",
    city: "Jaipur",
    items: "Full machine set",
    quantity: 1,
    raisedBy: "Project Coordinator",
    status: "delivered",
    plannedDate: "4 Aug",
    expectedDate: "5 Aug",
    actualDate: "5 Aug",
    clearance: true,
    packedBy: "Mohit Sharma",
    deliveryNote: "Handed over to store manager",
    recipient: "R. Sharma",
  },
  {
    id: "DP-102",
    store: "Indore",
    city: "Indore",
    items: "Steam iron + boiler",
    quantity: 2,
    raisedBy: "Project Manager",
    status: "in_transit",
    plannedDate: "4 Aug",
    expectedDate: "6 Aug",
    clearance: true,
    packedBy: "Pooja Verma",
  },
  {
    id: "DP-103",
    store: "Lucknow",
    city: "Lucknow",
    items: "Full machine set",
    quantity: 1,
    raisedBy: "Project Coordinator",
    status: "pending_clearance",
    plannedDate: "5 Aug",
    expectedDate: "8 Aug",
    clearance: false,
  },
  {
    id: "DP-104",
    store: "Surat",
    city: "Surat",
    items: "POS + counter kit",
    quantity: 1,
    raisedBy: "Account Manager",
    status: "packed",
    plannedDate: "5 Aug",
    expectedDate: "7 Aug",
    clearance: true,
    packedBy: "Mohit Sharma",
  },
  {
    id: "DP-105",
    store: "Nagpur",
    city: "Nagpur",
    items: "Branding kit",
    quantity: 3,
    raisedBy: "Sales Head",
    status: "ready_to_pack",
    plannedDate: "6 Aug",
    expectedDate: "9 Aug",
    clearance: true,
  },
  {
    id: "DP-106",
    store: "Kanpur",
    city: "Kanpur",
    items: "Full machine set",
    quantity: 1,
    raisedBy: "Project Coordinator",
    status: "delayed",
    plannedDate: "3 Aug",
    expectedDate: "5 Aug",
    clearance: true,
    packedBy: "Pooja Verma",
  },
  {
    id: "DP-107",
    store: "Bhopal",
    city: "Bhopal",
    items: "Uniform sets",
    quantity: 10,
    raisedBy: "Trainer",
    status: "dispatched",
    plannedDate: "5 Aug",
    expectedDate: "6 Aug",
    clearance: true,
    packedBy: "Mohit Sharma",
  },
  {
    id: "DP-108",
    store: "Raipur",
    city: "Raipur",
    items: "Welcome folder + stationery",
    quantity: 5,
    raisedBy: "Project Manager",
    status: "planned",
    plannedDate: "7 Aug",
    expectedDate: "10 Aug",
    clearance: false,
  },
];

export const PACKING_STAFF: PackingStaff[] = [
  { id: "p1", name: "Mohit Sharma", shift: "9:30 AM – 6:30 PM", activeTasks: 2, completedToday: 3, defectsToday: 0, status: "busy" },
  { id: "p2", name: "Pooja Verma", shift: "10:00 AM – 7:00 PM", activeTasks: 1, completedToday: 4, defectsToday: 1, status: "busy" },
  { id: "p3", name: "Ravi Kumar", shift: "11:00 AM – 8:00 PM", activeTasks: 0, completedToday: 2, defectsToday: 0, status: "available" },
];

export const SUPPLIES: SupplyItem[] = [
  { id: "K1", name: "Corrugated boxes (M)", unit: "piece", inStock: 40, minLevel: 25, role: "packing" },
  { id: "K2", name: "Packing tape", unit: "roll", inStock: 2, minLevel: 6, role: "packing" },
  { id: "K3", name: "Bubble wrap", unit: "roll", inStock: 3, minLevel: 2, role: "packing" },
  { id: "K4", name: "Stretch film", unit: "roll", inStock: 5, minLevel: 3, role: "packing" },
  { id: "K5", name: "Dispatch labels", unit: "sheet", inStock: 60, minLevel: 50, role: "packing" },
];

export const statusLabel: Record<DispatchStatus, string> = {
  planned: "Planned",
  pending_clearance: "Pending Clearance",
  ready_to_pack: "Ready to Pack",
  packing: "Packing",
  packed: "Packed",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  returned: "Returned",
};

export function isLowStock(s: SupplyItem) {
  return s.inStock <= s.minLevel;
}
