/**
 * Dispatch Planning records.
 * The Dispatch ID is permanent — created when the Accounts clearance was
 * accepted — and is preserved through booking, rescheduling, transporter
 * change and dispatch. Shiprocket / WheelsEye stay the official booking and
 * tracking systems; only references and status updates are stored here.
 * No platform passwords, API keys or access tokens are ever stored.
 */

export type PlanStatus =
  | "ready_for_planning"
  | "transport_selected"
  | "booking_pending"
  | "booked_externally"
  | "ready_for_pickup"
  | "dispatched"
  | "info_required"
  | "booking_failed"
  | "dispatch_delayed"
  | "suspended"
  | "cancelled";

export type Platform =
  | "Shiprocket"
  | "WheelsEye"
  | "Other Approved Transporter"
  | "Company Vehicle"
  | "Customer Pickup";

export type PlanBooking = {
  platform: Platform;
  bookingId: string;
  awbOrLr: string;
  transporter: string;
  vehicle?: string;
  driverName?: string;
  driverMobile?: string;
  bookingDate: string;
  pickupAt?: string;
  plannedDispatch?: string;
  expectedDelivery?: string;
  trackingUrl?: string;
  freightPaidBy?: "Company" | "Franchise" | "To Pay";
  notes?: string;
};

export type DocKey =
  | "packing_list"
  | "vyapar_invoice"
  | "delivery_challan"
  | "eway_bill"
  | "transport_receipt"
  | "insurance"
  | "serial_list"
  | "clearance_doc";

export type PlanPackage = {
  code: string;
  contents: string;
  dims: string;
  weight: number;
  fragile: boolean;
  heavy: boolean;
};

export type HistoryEntry = { at: string; by: string; action: string };

export type PlanRecord = {
  dispatchId: string;
  clearanceId: string;
  projectId: string;
  store: string;
  city: string;
  itemType: "Machines" | "Consumables" | "Branding" | "Mixed";
  priority: "urgent" | "high" | "normal";
  packages: PlanPackage[];
  totalWeight: number;
  pickupAddress: string;
  deliveryAddress: string;
  addressComplete: boolean;
  siteContact: string;
  siteContactConfirmed: boolean;
  packingApproved: boolean;
  packingStaff: string;
  approvedPackageCount: number;
  clearanceActive: boolean;
  requiredDelivery: string;
  launchDate: string;
  plannedDispatch: string | null;
  expectedDelivery: string | null;
  status: PlanStatus;
  booking: PlanBooking | null;
  docs: DocKey[];
  handling: string;
  actualPickupAt?: string | null;
  actualDispatchAt?: string | null;
  handedOverCount?: number | null;
  dispatchProof?: boolean;
  logisticsExec?: string;
  reason?: string | null;
  history: HistoryEntry[];
};

export const TODAY = "2026-08-05";

export const DOC_LABEL: Record<DocKey, string> = {
  packing_list: "Packing list",
  vyapar_invoice: "Vyapar invoice",
  delivery_challan: "Delivery challan",
  eway_bill: "E-way bill",
  transport_receipt: "Transport receipt",
  insurance: "Insurance document",
  serial_list: "Machine serial-number list",
  clearance_doc: "Clearance document",
};

export const REQUIRED_DOCS: DocKey[] = [
  "packing_list",
  "vyapar_invoice",
  "delivery_challan",
  "clearance_doc",
];

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  ready_for_planning: "Ready for Planning",
  transport_selected: "Transport Selected",
  booking_pending: "Booking Pending",
  booked_externally: "Booked Externally",
  ready_for_pickup: "Ready for Pickup",
  dispatched: "Dispatched",
  info_required: "Information Required",
  booking_failed: "Booking Failed",
  dispatch_delayed: "Dispatch Delayed",
  suspended: "Clearance Suspended",
  cancelled: "Cancelled",
};

/** green = booked/ready/dispatched, blue = planning, amber = pending/delayed, red = failed/suspended, grey = cancelled */
export const PLAN_STATUS_TONE: Record<PlanStatus, string> = {
  ready_for_planning: "bg-primary/10 text-primary border-primary/20",
  transport_selected: "bg-primary/10 text-primary border-primary/20",
  booking_pending: "bg-amber-100 text-amber-800 border-amber-200",
  booked_externally: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ready_for_pickup: "bg-emerald-100 text-emerald-800 border-emerald-200",
  dispatched: "bg-emerald-100 text-emerald-800 border-emerald-200",
  info_required: "bg-amber-100 text-amber-800 border-amber-200",
  booking_failed: "bg-destructive/10 text-destructive border-destructive/20",
  dispatch_delayed: "bg-amber-100 text-amber-800 border-amber-200",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const PLATFORMS: { value: Platform; hint: string }[] = [
  { value: "Shiprocket", hint: "Suggested for courier-size packages" },
  { value: "WheelsEye", hint: "Suggested for machines and heavy consignments" },
  { value: "Other Approved Transporter", hint: "Approved transporter for heavy loads" },
  { value: "Company Vehicle", hint: "Own vehicle, local delivery" },
  { value: "Customer Pickup", hint: "Franchise arranges pickup" },
];

export const CHECKLIST: { key: string; label: string; mandatory: boolean }[] = [
  { key: "clearance", label: "Accounts clearance active", mandatory: true },
  { key: "packing", label: "Packing approved", mandatory: true },
  { key: "count", label: "Package count confirmed", mandatory: true },
  { key: "weight", label: "Weight and dimensions recorded", mandatory: true },
  { key: "address", label: "Delivery address verified", mandatory: true },
  { key: "contact", label: "Site contact confirmed", mandatory: true },
  { key: "booked", label: "Transport booked", mandatory: true },
  { key: "ref", label: "Booking reference recorded", mandatory: true },
  { key: "docs", label: "Required documents available", mandatory: true },
  { key: "handling", label: "Fragile or heavy handling marked", mandatory: false },
  { key: "pickup", label: "Pickup date confirmed", mandatory: true },
  { key: "pc", label: "Project Coordinator informed", mandatory: false },
];

export const PACKING_STAFF_NAMES = ["Ramesh K.", "Sunil P.", "Ravi S.", "Imran A."];

export const PLANS: PlanRecord[] = [
  {
    dispatchId: "DSP-000122",
    clearanceId: "CLR-1042",
    projectId: "PRJ-000019",
    store: "Clean Craft Indore",
    city: "Indore",
    itemType: "Machines",
    priority: "urgent",
    packages: [
      { code: "PKG-1", contents: "Dry-clean machine 12kg", dims: "150×90×110 cm", weight: 320, fragile: false, heavy: true },
      { code: "PKG-2", contents: "Steam boiler + iron table", dims: "120×80×95 cm", weight: 180, fragile: true, heavy: true },
      { code: "PKG-3", contents: "Consumables carton", dims: "60×45×40 cm", weight: 34, fragile: false, heavy: false },
    ],
    totalWeight: 534,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Shop 4, Vijay Nagar Main Road, Indore 452010",
    addressComplete: true,
    siteContact: "Owner — R. Agrawal",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Ramesh K.",
    approvedPackageCount: 3,
    clearanceActive: true,
    requiredDelivery: "2026-08-09",
    launchDate: "2026-08-14",
    plannedDispatch: null,
    expectedDelivery: null,
    status: "ready_for_planning",
    booking: null,
    docs: ["packing_list", "clearance_doc", "vyapar_invoice"],
    handling: "Machine panels fragile — do not stack. Hydraulic trolley needed at site.",
    history: [
      { at: "2026-08-04 10:12", by: "Accounts Manager", action: "Clearance CLR-1042 issued after payment verification." },
      { at: "2026-08-04 11:40", by: "Logistics Executive", action: "Clearance accepted, Dispatch ID DSP-000122 activated." },
      { at: "2026-08-05 09:05", by: "Ramesh K.", action: "Packing approved — 3 packages, 534 kg." },
    ],
  },
  {
    dispatchId: "DSP-000119",
    clearanceId: "CLR-1039",
    projectId: "PRJ-000015",
    store: "Clean Craft Lucknow",
    city: "Lucknow",
    itemType: "Mixed",
    priority: "high",
    packages: [
      { code: "PKG-1", contents: "Washer-extractor", dims: "140×85×120 cm", weight: 290, fragile: false, heavy: true },
      { code: "PKG-2", contents: "Branding & signage roll", dims: "180×30×30 cm", weight: 22, fragile: true, heavy: false },
    ],
    totalWeight: 312,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Plot 22, Gomti Nagar Extension, Lucknow 226010",
    addressComplete: true,
    siteContact: "Manager — S. Verma",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Sunil P.",
    approvedPackageCount: 2,
    clearanceActive: true,
    requiredDelivery: "2026-08-08",
    launchDate: "2026-08-12",
    plannedDispatch: "2026-08-06",
    expectedDelivery: "2026-08-08",
    status: "booking_pending",
    booking: {
      platform: "WheelsEye",
      bookingId: "—",
      awbOrLr: "—",
      transporter: "WheelsEye partner fleet",
      bookingDate: TODAY,
      plannedDispatch: "2026-08-06",
      expectedDelivery: "2026-08-08",
      freightPaidBy: "Company",
      notes: "Full-truck quote requested on WheelsEye, confirmation awaited.",
    },
    docs: ["packing_list", "vyapar_invoice", "clearance_doc"],
    handling: "Signage roll on top only.",
    history: [
      { at: "2026-08-01 15:20", by: "Accounts Manager", action: "Clearance CLR-1039 issued." },
      { at: "2026-08-05 08:30", by: "Sunil P.", action: "Packing approved — 2 packages, 312 kg." },
      { at: "2026-08-05 10:10", by: "Logistics Executive", action: "Transport selected: WheelsEye. Booking requested externally." },
    ],
  },
  {
    dispatchId: "DSP-000117",
    clearanceId: "CLR-1037",
    projectId: "PRJ-000013",
    store: "Clean Craft Surat",
    city: "Surat",
    itemType: "Consumables",
    priority: "normal",
    packages: [
      { code: "PKG-1", contents: "Detergent & solvent cartons", dims: "60×45×45 cm", weight: 48, fragile: false, heavy: false },
      { code: "PKG-2", contents: "Hangers, covers, tags", dims: "70×50×50 cm", weight: 26, fragile: false, heavy: false },
    ],
    totalWeight: 74,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Unit 7, Adajan Gam, Surat 395009",
    addressComplete: true,
    siteContact: "Owner — H. Patel",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Ravi S.",
    approvedPackageCount: 2,
    clearanceActive: true,
    requiredDelivery: "2026-08-07",
    launchDate: "2026-08-09",
    plannedDispatch: "2026-08-05",
    expectedDelivery: "2026-08-07",
    status: "booked_externally",
    booking: {
      platform: "Shiprocket",
      bookingId: "SR-88214077",
      awbOrLr: "AWB-4471203399",
      transporter: "Delhivery Surface (via Shiprocket)",
      bookingDate: "2026-08-04",
      pickupAt: "2026-08-05 16:00",
      plannedDispatch: "2026-08-05",
      expectedDelivery: "2026-08-07",
      trackingUrl: "https://shiprocket.co/tracking/AWB-4471203399",
      freightPaidBy: "Company",
      notes: "Courier pickup slot confirmed for evening.",
    },
    docs: ["packing_list", "vyapar_invoice", "delivery_challan", "clearance_doc", "transport_receipt"],
    handling: "Keep solvents upright.",
    history: [
      { at: "2026-07-29 12:00", by: "Accounts Manager", action: "Clearance CLR-1037 issued." },
      { at: "2026-08-03 17:30", by: "Ravi S.", action: "Packing approved — 2 packages, 74 kg." },
      { at: "2026-08-04 11:00", by: "Logistics Executive", action: "Booked on Shiprocket. AWB recorded." },
    ],
  },
  {
    dispatchId: "DSP-000115",
    clearanceId: "CLR-1035",
    projectId: "PRJ-000011",
    store: "Clean Craft Nagpur",
    city: "Nagpur",
    itemType: "Machines",
    priority: "high",
    packages: [
      { code: "PKG-1", contents: "Dry-clean machine 8kg", dims: "140×85×105 cm", weight: 265, fragile: false, heavy: true },
      { code: "PKG-2", contents: "Packing & sealing unit", dims: "90×60×70 cm", weight: 88, fragile: true, heavy: false },
    ],
    totalWeight: 353,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Shop 12, Dharampeth, Nagpur 440010",
    addressComplete: true,
    siteContact: "Owner — A. Deshmukh",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Imran A.",
    approvedPackageCount: 2,
    clearanceActive: true,
    requiredDelivery: "2026-08-06",
    launchDate: "2026-08-20",
    plannedDispatch: "2026-08-05",
    expectedDelivery: "2026-08-06",
    status: "ready_for_pickup",
    booking: {
      platform: "WheelsEye",
      bookingId: "WE-5520911",
      awbOrLr: "LR-WE-771204",
      transporter: "Safe Move Carriers (via WheelsEye)",
      vehicle: "MH31-CD-7742",
      driverName: "Dinesh Yadav",
      driverMobile: "98•••••210",
      bookingDate: "2026-08-04",
      pickupAt: "2026-08-05 12:30",
      plannedDispatch: "2026-08-05",
      expectedDelivery: "2026-08-06",
      trackingUrl: "https://wheelseye.com/track/LR-WE-771204",
      freightPaidBy: "Company",
      notes: "Driver reaching warehouse gate 2.",
    },
    docs: ["packing_list", "vyapar_invoice", "delivery_challan", "eway_bill", "clearance_doc", "serial_list"],
    handling: "Heavy — forklift loading at warehouse, trolley at site.",
    history: [
      { at: "2026-07-27 09:15", by: "Accounts Manager", action: "Clearance CLR-1035 issued." },
      { at: "2026-08-03 16:00", by: "Imran A.", action: "Packing approved — 2 packages, 353 kg." },
      { at: "2026-08-04 10:45", by: "Logistics Executive", action: "Booked on WheelsEye. Vehicle and driver recorded." },
      { at: "2026-08-05 09:00", by: "Logistics Executive", action: "Marked ready for pickup." },
    ],
  },
  {
    dispatchId: "DSP-000112",
    clearanceId: "CLR-1031",
    projectId: "PRJ-000009",
    store: "Clean Craft Bhopal",
    city: "Bhopal",
    itemType: "Mixed",
    priority: "normal",
    packages: [
      { code: "PKG-1", contents: "Steam iron station", dims: "110×70×90 cm", weight: 140, fragile: true, heavy: false },
      { code: "PKG-2", contents: "Counter & branding kit", dims: "160×60×60 cm", weight: 96, fragile: false, heavy: false },
      { code: "PKG-3", contents: "POS hardware", dims: "50×40×35 cm", weight: 18, fragile: true, heavy: false },
    ],
    totalWeight: 254,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Shop 9, Arera Colony, Bhopal 462016",
    addressComplete: true,
    siteContact: "Manager — S. Verma",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Ramesh K.",
    approvedPackageCount: 3,
    clearanceActive: true,
    requiredDelivery: "2026-08-04",
    launchDate: "2026-08-10",
    plannedDispatch: "2026-08-03",
    expectedDelivery: "2026-08-05",
    status: "dispatched",
    booking: {
      platform: "Other Approved Transporter",
      bookingId: "VRL-BK-330912",
      awbOrLr: "LR-VRL-77120",
      transporter: "VRL Logistics",
      vehicle: "RJ14-GA-2291",
      driverName: "Mahesh Singh",
      driverMobile: "97•••••884",
      bookingDate: "2026-08-02",
      pickupAt: "2026-08-03 11:00",
      plannedDispatch: "2026-08-03",
      expectedDelivery: "2026-08-05",
      trackingUrl: "https://vrlgroup.in/track/LR-VRL-77120",
      freightPaidBy: "Company",
      notes: "Handed over at warehouse dock 1.",
    },
    docs: ["packing_list", "vyapar_invoice", "delivery_challan", "transport_receipt", "clearance_doc"],
    handling: "POS box carried in cabin.",
    actualPickupAt: "2026-08-03 11:20",
    actualDispatchAt: "2026-08-03 12:05",
    handedOverCount: 3,
    dispatchProof: true,
    logisticsExec: "Logistics Executive",
    history: [
      { at: "2026-08-02 14:00", by: "Logistics Executive", action: "Booked with VRL Logistics." },
      { at: "2026-08-03 12:05", by: "Logistics Executive", action: "Dispatch recorded — 3 packages handed over. Project Coordinator and Accounts Manager notified." },
      { at: "2026-08-03 12:06", by: "System", action: "DSP-000112 moved to Delivery Confirmation with the same Dispatch ID." },
    ],
  },
  {
    dispatchId: "DSP-000120",
    clearanceId: "CLR-1040",
    projectId: "PRJ-000016",
    store: "Clean Craft Kanpur",
    city: "Kanpur",
    itemType: "Machines",
    priority: "urgent",
    packages: [
      { code: "PKG-1", contents: "Dry-clean machine 10kg", dims: "145×88×110 cm", weight: 300, fragile: false, heavy: true },
    ],
    totalWeight: 300,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Near Mall Road, Kanpur — house/shop number missing",
    addressComplete: false,
    siteContact: "Owner — not confirmed",
    siteContactConfirmed: false,
    packingApproved: true,
    packingStaff: "Sunil P.",
    approvedPackageCount: 1,
    clearanceActive: true,
    requiredDelivery: "2026-08-07",
    launchDate: "2026-08-13",
    plannedDispatch: "2026-08-05",
    expectedDelivery: "2026-08-07",
    status: "booking_failed",
    booking: {
      platform: "Shiprocket",
      bookingId: "—",
      awbOrLr: "—",
      transporter: "—",
      bookingDate: TODAY,
      freightPaidBy: "Company",
      notes: "Shiprocket rejected — weight above courier limit and pincode address incomplete.",
    },
    docs: ["packing_list", "clearance_doc"],
    handling: "Heavy — needs full truck.",
    reason: "Booking failed on Shiprocket: over courier weight limit, address incomplete.",
    history: [
      { at: "2026-08-04 18:20", by: "Ravi S.", action: "Packing approved — 1 package, 300 kg." },
      { at: "2026-08-05 09:50", by: "Logistics Executive", action: "Shiprocket booking attempt failed." },
    ],
  },
  {
    dispatchId: "DSP-000110",
    clearanceId: "CLR-1029",
    projectId: "PRJ-000007",
    store: "Clean Craft Raipur",
    city: "Raipur",
    itemType: "Branding",
    priority: "normal",
    packages: [
      { code: "PKG-1", contents: "Signage, glow board, standees", dims: "200×40×40 cm", weight: 64, fragile: true, heavy: false },
    ],
    totalWeight: 64,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Shop 3, Shankar Nagar, Raipur 492001",
    addressComplete: true,
    siteContact: "Owner — P. Sahu",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Imran A.",
    approvedPackageCount: 1,
    clearanceActive: false,
    requiredDelivery: "2026-08-08",
    launchDate: "2026-08-16",
    plannedDispatch: "2026-08-06",
    expectedDelivery: "2026-08-08",
    status: "suspended",
    booking: null,
    docs: ["packing_list", "clearance_doc"],
    handling: "Glow board fragile.",
    reason: "Accounts suspended clearance — payment reversal under check.",
    history: [
      { at: "2026-08-04 13:00", by: "Imran A.", action: "Packing approved — 1 package, 64 kg." },
      { at: "2026-08-05 08:15", by: "Accounts Manager", action: "Clearance suspended — dispatch paused." },
    ],
  },
  {
    dispatchId: "DSP-000108",
    clearanceId: "CLR-1026",
    projectId: "PRJ-000005",
    store: "Clean Craft Patna",
    city: "Patna",
    itemType: "Consumables",
    priority: "normal",
    packages: [
      { code: "PKG-1", contents: "Consumables starter kit", dims: "60×45×45 cm", weight: 42, fragile: false, heavy: false },
    ],
    totalWeight: 42,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Shop 5, Boring Road, Patna 800001",
    addressComplete: true,
    siteContact: "Owner — N. Kumar",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Ravi S.",
    approvedPackageCount: 1,
    clearanceActive: false,
    requiredDelivery: "2026-08-06",
    launchDate: "2026-08-22",
    plannedDispatch: null,
    expectedDelivery: null,
    status: "cancelled",
    booking: null,
    docs: ["packing_list"],
    handling: "—",
    reason: "Franchise postponed launch — clearance cancelled by Accounts.",
    history: [
      { at: "2026-08-02 10:00", by: "Accounts Manager", action: "Clearance cancelled at franchise request." },
    ],
  },
  {
    dispatchId: "DSP-000118",
    clearanceId: "CLR-1038",
    projectId: "PRJ-000014",
    store: "Clean Craft Jodhpur",
    city: "Jodhpur",
    itemType: "Mixed",
    priority: "high",
    packages: [
      { code: "PKG-1", contents: "Steam iron station", dims: "110×70×90 cm", weight: 138, fragile: true, heavy: false },
      { code: "PKG-2", contents: "Consumables carton", dims: "60×45×40 cm", weight: 30, fragile: false, heavy: false },
    ],
    totalWeight: 168,
    pickupAddress: "Clean Craft Central Warehouse, Sector 63, Noida 201301",
    deliveryAddress: "Shop 18, Sardarpura, Jodhpur 342003",
    addressComplete: true,
    siteContact: "Manager — K. Rathore",
    siteContactConfirmed: true,
    packingApproved: true,
    packingStaff: "Ramesh K.",
    approvedPackageCount: 2,
    clearanceActive: true,
    requiredDelivery: "2026-08-04",
    launchDate: "2026-08-11",
    plannedDispatch: "2026-08-03",
    expectedDelivery: "2026-08-05",
    status: "dispatch_delayed",
    booking: {
      platform: "Other Approved Transporter",
      bookingId: "TCI-BK-40911",
      awbOrLr: "LR-TCI-40911",
      transporter: "TCI Freight",
      vehicle: "GJ05-KL-1188",
      driverName: "Suresh Meena",
      driverMobile: "99•••••417",
      bookingDate: "2026-08-02",
      pickupAt: "2026-08-03 15:00",
      plannedDispatch: "2026-08-03",
      expectedDelivery: "2026-08-05",
      trackingUrl: "https://tcil.com/track/LR-TCI-40911",
      freightPaidBy: "To Pay",
      notes: "Vehicle did not report for pickup on planned date.",
    },
    docs: ["packing_list", "vyapar_invoice", "clearance_doc"],
    handling: "Iron station fragile.",
    reason: "Transporter missed pickup — dispatch date missed by 2 days.",
    history: [
      { at: "2026-08-02 12:00", by: "Logistics Executive", action: "Booked with TCI Freight." },
      { at: "2026-08-04 09:30", by: "Logistics Executive", action: "Pickup not completed — dispatch marked delayed, transporter escalated." },
    ],
  },
];

export const maskRef = (ref: string) =>
  !ref || ref.length <= 6 ? ref : `${ref.slice(0, 4)}••••${ref.slice(-4)}`;
