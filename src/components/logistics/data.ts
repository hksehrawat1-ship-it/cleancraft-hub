export type Clearance = {
  id: string;
  projectCode: string;
  store: string;
  city: string;
  amountVerified: number;
  clearedOn: string;
  launchDate: string;
  items: number;
  status: "new" | "accepted" | "returned";
};

export type PackingTask = {
  id: string;
  clearanceId: string;
  store: string;
  items: number;
  packed: number;
  assignee: string;
  status: "pending" | "in_progress" | "packed" | "qc_failed";
  due: string;
};

export type DispatchPlan = {
  id: string;
  clearanceId: string;
  store: string;
  city: string;
  transporter: string;
  vehicle: string;
  boxes: number;
  freight: number;
  plannedOn: string;
  eta: string;
  status: "planned" | "dispatched" | "in_transit" | "delivered";
  lrNumber: string;
};

export type DeliveryRow = {
  id: string;
  planId: string;
  store: string;
  city: string;
  deliveredOn: string | null;
  receivedBy: string | null;
  podUploaded: boolean;
  shortage: boolean;
  status: "awaiting" | "confirmed" | "disputed";
};

export type IssueRow = {
  id: string;
  planId: string;
  store: string;
  type: "damage" | "shortage" | "wrong_item" | "return" | "delay";
  detail: string;
  raisedOn: string;
  owner: string;
  status: "open" | "in_progress" | "resolved";
};

export const CLEARANCES: Clearance[] = [
  { id: "CLR-1041", projectCode: "PRJ-000018", store: "Clean Craft Jaipur", city: "Jaipur", amountVerified: 1250000, clearedOn: "2026-08-03", launchDate: "2026-08-18", items: 42, status: "new" },
  { id: "CLR-1042", projectCode: "PRJ-000019", store: "Clean Craft Indore", city: "Indore", amountVerified: 980000, clearedOn: "2026-08-04", launchDate: "2026-08-14", items: 36, status: "new" },
  { id: "CLR-1039", projectCode: "PRJ-000015", store: "Clean Craft Lucknow", city: "Lucknow", amountVerified: 1120000, clearedOn: "2026-08-01", launchDate: "2026-08-12", items: 39, status: "accepted" },
  { id: "CLR-1037", projectCode: "PRJ-000013", store: "Clean Craft Surat", city: "Surat", amountVerified: 860000, clearedOn: "2026-07-29", launchDate: "2026-08-09", items: 28, status: "accepted" },
  { id: "CLR-1035", projectCode: "PRJ-000011", store: "Clean Craft Nagpur", city: "Nagpur", amountVerified: 740000, clearedOn: "2026-07-27", launchDate: "2026-08-20", items: 24, status: "returned" },
];

export const PACKING_TASKS: PackingTask[] = [
  { id: "PK-2201", clearanceId: "CLR-1039", store: "Clean Craft Lucknow", items: 39, packed: 39, assignee: "Ramesh K.", status: "packed", due: "2026-08-06" },
  { id: "PK-2202", clearanceId: "CLR-1037", store: "Clean Craft Surat", items: 28, packed: 19, assignee: "Sunil P.", status: "in_progress", due: "2026-08-06" },
  { id: "PK-2203", clearanceId: "CLR-1042", store: "Clean Craft Indore", items: 36, packed: 0, assignee: "Unassigned", status: "pending", due: "2026-08-07" },
  { id: "PK-2204", clearanceId: "CLR-1041", store: "Clean Craft Jaipur", items: 42, packed: 12, assignee: "Ravi S.", status: "qc_failed", due: "2026-08-08" },
];

export const DISPATCH_PLANS: DispatchPlan[] = [
  { id: "DSP-3301", clearanceId: "CLR-1039", store: "Clean Craft Lucknow", city: "Lucknow", transporter: "VRL Logistics", vehicle: "RJ14-GA-2291", boxes: 14, freight: 18400, plannedOn: "2026-08-06", eta: "2026-08-09", status: "dispatched", lrNumber: "VRL-77120" },
  { id: "DSP-3302", clearanceId: "CLR-1037", store: "Clean Craft Surat", city: "Surat", transporter: "TCI Freight", vehicle: "GJ05-KL-1188", boxes: 11, freight: 14200, plannedOn: "2026-08-05", eta: "2026-08-07", status: "in_transit", lrNumber: "TCI-40911" },
  { id: "DSP-3303", clearanceId: "CLR-1035", store: "Clean Craft Nagpur", city: "Nagpur", transporter: "Safexpress", vehicle: "MH31-CD-7742", boxes: 9, freight: 11800, plannedOn: "2026-08-02", eta: "2026-08-05", status: "delivered", lrNumber: "SFX-22087" },
  { id: "DSP-3304", clearanceId: "CLR-1042", store: "Clean Craft Indore", city: "Indore", transporter: "Gati", vehicle: "MP09-AB-3310", boxes: 12, freight: 15600, plannedOn: "2026-08-07", eta: "2026-08-10", status: "planned", lrNumber: "—" },
];

export const DELIVERIES: DeliveryRow[] = [
  { id: "DLV-4401", planId: "DSP-3303", store: "Clean Craft Nagpur", city: "Nagpur", deliveredOn: "2026-08-05", receivedBy: "Owner — A. Deshmukh", podUploaded: true, shortage: false, status: "confirmed" },
  { id: "DLV-4402", planId: "DSP-3302", store: "Clean Craft Surat", city: "Surat", deliveredOn: null, receivedBy: null, podUploaded: false, shortage: false, status: "awaiting" },
  { id: "DLV-4403", planId: "DSP-3301", store: "Clean Craft Lucknow", city: "Lucknow", deliveredOn: null, receivedBy: null, podUploaded: false, shortage: false, status: "awaiting" },
  { id: "DLV-4404", planId: "DSP-3299", store: "Clean Craft Bhopal", city: "Bhopal", deliveredOn: "2026-08-02", receivedBy: "Manager — S. Verma", podUploaded: true, shortage: true, status: "disputed" },
];

export const ISSUES: IssueRow[] = [
  { id: "ISS-5501", planId: "DSP-3299", store: "Clean Craft Bhopal", type: "shortage", detail: "2 trolley units missing against 9 boxes billed.", raisedOn: "2026-08-02", owner: "Logistics", status: "in_progress" },
  { id: "ISS-5502", planId: "DSP-3302", store: "Clean Craft Surat", type: "delay", detail: "Vehicle held at check-post, ETA slipped by 1 day.", raisedOn: "2026-08-06", owner: "Transporter", status: "open" },
  { id: "ISS-5503", planId: "DSP-3303", store: "Clean Craft Nagpur", type: "damage", detail: "Outer carton dented, machine panel scratched.", raisedOn: "2026-08-05", owner: "Packing", status: "resolved" },
  { id: "ISS-5504", planId: "DSP-3301", store: "Clean Craft Lucknow", type: "wrong_item", detail: "Steam iron model mismatch vs packing list.", raisedOn: "2026-08-07", owner: "Stores", status: "open" },
];

export const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const maskRef = (ref: string) =>
  ref.length <= 4 ? ref : `${ref.slice(0, 3)}••••${ref.slice(-3)}`;
