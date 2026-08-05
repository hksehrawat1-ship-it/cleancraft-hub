/**
 * Dispatch Clearance records sent by Accounts.
 * The Clearance ID is permanent (created by Accounts) and the Dispatch ID is
 * created/activated exactly once on acceptance. Return, suspension and
 * reactivation reuse the same IDs — never duplicated.
 * Sensitive financial data (bank details, transaction info, payment proof)
 * is intentionally NOT part of this record — Logistics and Packing never see it.
 */

export type ClearanceStatus =
  | "received"
  | "under_review"
  | "accepted"
  | "availability_check"
  | "packing_ready"
  | "info_required"
  | "returned"
  | "suspended"
  | "cancelled";

export type ItemType =
  | "Laundry Machine"
  | "Dry-Cleaning Machine"
  | "Finishing Equipment"
  | "POS Equipment"
  | "Spare Parts"
  | "Chemicals"
  | "Consumables"
  | "Packaging Materials"
  | "Other Approved Item";

export type AvailabilityState = "unchecked" | "available" | "partial" | "unavailable";

export type ClearanceItem = {
  code: string;
  name: string;
  type: ItemType;
  approvedQty: number;
  handling: string;
  availability: AvailabilityState;
  qtyAvailable: number;
  expectedOn?: string | null;
  substitute?: string | null;
  location?: string;
  note?: string;
};

export type ClrHistory = { at: string; by: string; action: string };

export type ClearanceRecord = {
  clearanceId: string;
  paymentRequestId: string;
  projectId: string;
  dispatchId: string | null;
  store: string;
  city: string;
  deliveryAddress: string;
  addressComplete: boolean;
  siteContact: string;
  siteContactAvailable: boolean;
  coordinator: string;
  accountsManager: string;
  items: ClearanceItem[];
  requiredDelivery: string;
  launchDate: string;
  priority: "urgent" | "high" | "normal";
  specialInstructions: string;
  financialClearance: "Verified & Active" | "Suspended by Accounts" | "Cancelled by Accounts";
  status: ClearanceStatus;
  packingStarted: boolean;
  packingStaff?: string | null;
  proposedPacking?: string | null;
  proposedDispatch?: string | null;
  acceptedBy?: string | null;
  acceptedAt?: string | null;
  openInfoRequest?: { topic: string; asked: string; dueBy: string } | null;
  returnInfo?: { reason: string; nextAction: string; dueDate: string } | null;
  history: ClrHistory[];
};

export const TODAY = "2026-08-05";

export const CLR_STATUS_LABEL: Record<ClearanceStatus, string> = {
  received: "Clearance Received",
  under_review: "Logistics Review",
  accepted: "Accepted",
  availability_check: "Item Availability Check",
  packing_ready: "Packing Ready",
  info_required: "Information Required",
  returned: "Returned to Accounts",
  suspended: "Clearance Suspended",
  cancelled: "Cancelled",
};

/** green accepted, blue review, amber info required, red returned/suspended, grey cancelled */
export const CLR_STATUS_TONE: Record<ClearanceStatus, string> = {
  received: "bg-primary/10 text-primary border-primary/20",
  under_review: "bg-primary/10 text-primary border-primary/20",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  availability_check: "bg-emerald-100 text-emerald-800 border-emerald-200",
  packing_ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  info_required: "bg-amber-100 text-amber-800 border-amber-200",
  returned: "bg-destructive/10 text-destructive border-destructive/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const ITEM_TYPES: ItemType[] = [
  "Laundry Machine",
  "Dry-Cleaning Machine",
  "Finishing Equipment",
  "POS Equipment",
  "Spare Parts",
  "Chemicals",
  "Consumables",
  "Packaging Materials",
  "Other Approved Item",
];

export const REVIEW_CHECKS: { key: string; label: string }[] = [
  { key: "id", label: "Clearance ID is valid" },
  { key: "match", label: "Project and store details match" },
  { key: "address", label: "Delivery address is complete" },
  { key: "contact", label: "Site contact is available" },
  { key: "items", label: "Item list is clear" },
  { key: "qty", label: "Quantities are clear" },
  { key: "date", label: "Required delivery date is achievable" },
  { key: "handling", label: "Special handling requirements are understood" },
  { key: "availability", label: "Item availability has been checked" },
  { key: "nosuspend", label: "No active clearance suspension exists" },
];

export const INFO_TOPICS = [
  "Correct delivery address",
  "Site contact",
  "Item clarification",
  "Quantity clarification",
  "Required delivery date",
  "Special handling details",
  "Financial-clearance confirmation",
  "Other information",
];

export const RETURN_REASONS = [
  "Missing information",
  "Quantity mismatch",
  "Item not approved",
  "Clearance suspended",
  "Duplicate clearance",
  "Other reason",
];

export const PACKING_STAFF_LIST = ["Ramesh K.", "Sunil P.", "Ravi S.", "Imran A."];

const item = (
  code: string,
  name: string,
  type: ItemType,
  approvedQty: number,
  handling: string,
  extra: Partial<ClearanceItem> = {},
): ClearanceItem => ({
  code,
  name,
  type,
  approvedQty,
  handling,
  availability: "unchecked",
  qtyAvailable: 0,
  expectedOn: null,
  substitute: null,
  location: "WH-Noida",
  note: "",
  ...extra,
});

export const CLEARANCE_RECORDS: ClearanceRecord[] = [
  {
    clearanceId: "CLR-1041",
    paymentRequestId: "PR-000318",
    projectId: "PRJ-000018",
    dispatchId: null,
    store: "Clean Craft Jaipur",
    city: "Jaipur",
    deliveryAddress: "Shop 6, Vaishali Nagar Main Road, Jaipur 302021",
    addressComplete: true,
    siteContact: "Owner — M. Sharma · 98•••••441",
    siteContactAvailable: true,
    coordinator: "Aarti Nair (PC)",
    accountsManager: "Rohit Bansal (AM)",
    items: [
      item("IT-01", "Dry-clean machine 12 kg", "Dry-Cleaning Machine", 1, "Heavy — forklift loading"),
      item("IT-02", "Steam boiler + iron table", "Finishing Equipment", 1, "Fragile panels"),
      item("IT-03", "POS terminal + printer", "POS Equipment", 1, "Carry in cabin"),
      item("IT-04", "Solvent & detergent set", "Chemicals", 12, "Upright only"),
    ],
    requiredDelivery: "2026-08-11",
    launchDate: "2026-08-18",
    priority: "urgent",
    specialInstructions: "Site lift unavailable — ground-floor unloading with trolley.",
    financialClearance: "Verified & Active",
    status: "received",
    packingStarted: false,
    history: [
      { at: "2026-08-03 16:40", by: "Rohit Bansal (AM)", action: "Clearance CLR-1041 issued after payment verification." },
    ],
  },
  {
    clearanceId: "CLR-1042",
    paymentRequestId: "PR-000321",
    projectId: "PRJ-000019",
    dispatchId: null,
    store: "Clean Craft Indore",
    city: "Indore",
    deliveryAddress: "Shop 4, Vijay Nagar Main Road, Indore 452010",
    addressComplete: true,
    siteContact: "Owner — R. Agrawal · 97•••••108",
    siteContactAvailable: true,
    coordinator: "Vikram Joshi (PC)",
    accountsManager: "Rohit Bansal (AM)",
    items: [
      item("IT-01", "Laundry washer-extractor 10 kg", "Laundry Machine", 1, "Heavy"),
      item("IT-02", "Packaging roll & covers", "Packaging Materials", 20, "Dry storage"),
      item("IT-03", "Consumables starter kit", "Consumables", 6, "—"),
    ],
    requiredDelivery: "2026-08-09",
    launchDate: "2026-08-14",
    priority: "urgent",
    specialInstructions: "Launch training starts 12 Aug — machine must reach first.",
    financialClearance: "Verified & Active",
    status: "under_review",
    packingStarted: false,
    history: [
      { at: "2026-08-04 10:12", by: "Rohit Bansal (AM)", action: "Clearance CLR-1042 issued." },
      { at: "2026-08-05 09:15", by: "Logistics Executive", action: "Clearance opened for logistics review." },
    ],
  },
  {
    clearanceId: "CLR-1039",
    paymentRequestId: "PR-000309",
    projectId: "PRJ-000015",
    dispatchId: "DSP-000119",
    store: "Clean Craft Lucknow",
    city: "Lucknow",
    deliveryAddress: "Plot 22, Gomti Nagar Extension, Lucknow 226010",
    addressComplete: true,
    siteContact: "Manager — S. Verma · 99•••••320",
    siteContactAvailable: true,
    coordinator: "Aarti Nair (PC)",
    accountsManager: "Rohit Bansal (AM)",
    items: [
      item("IT-01", "Washer-extractor 8 kg", "Laundry Machine", 1, "Heavy", { availability: "available", qtyAvailable: 1 }),
      item("IT-02", "Branding & signage roll", "Other Approved Item", 1, "Fragile", { availability: "available", qtyAvailable: 1 }),
      item("IT-03", "Spare belt & filter kit", "Spare Parts", 2, "—", { availability: "available", qtyAvailable: 2 }),
    ],
    requiredDelivery: "2026-08-08",
    launchDate: "2026-08-12",
    priority: "high",
    specialInstructions: "Signage roll on top only.",
    financialClearance: "Verified & Active",
    status: "packing_ready",
    packingStarted: true,
    packingStaff: "Sunil P.",
    proposedPacking: "2026-08-05",
    proposedDispatch: "2026-08-06",
    acceptedBy: "Logistics Executive",
    acceptedAt: "2026-08-02 11:20",
    history: [
      { at: "2026-08-01 15:20", by: "Rohit Bansal (AM)", action: "Clearance CLR-1039 issued." },
      { at: "2026-08-02 11:20", by: "Logistics Executive", action: "Clearance accepted. Dispatch ID DSP-000119 activated (single record)." },
      { at: "2026-08-02 11:25", by: "Logistics Executive", action: "Item availability confirmed for all 3 items. Packing task assigned to Sunil P." },
    ],
  },
  {
    clearanceId: "CLR-1040",
    paymentRequestId: "PR-000314",
    projectId: "PRJ-000016",
    dispatchId: null,
    store: "Clean Craft Kanpur",
    city: "Kanpur",
    deliveryAddress: "Near Mall Road, Kanpur — shop number and pincode missing",
    addressComplete: false,
    siteContact: "Owner — not shared",
    siteContactAvailable: false,
    coordinator: "Vikram Joshi (PC)",
    accountsManager: "Neha Kapoor (AM)",
    items: [
      item("IT-01", "Dry-clean machine 10 kg", "Dry-Cleaning Machine", 1, "Heavy — full truck"),
      item("IT-02", "Finishing table", "Finishing Equipment", 1, "Fragile"),
    ],
    requiredDelivery: "2026-08-07",
    launchDate: "2026-08-13",
    priority: "urgent",
    specialInstructions: "Address confirmation pending from Project Coordinator.",
    financialClearance: "Verified & Active",
    status: "info_required",
    packingStarted: false,
    openInfoRequest: {
      topic: "Correct delivery address",
      asked: "2026-08-04 17:10",
      dueBy: "2026-08-05",
    },
    history: [
      { at: "2026-08-04 12:00", by: "Neha Kapoor (AM)", action: "Clearance CLR-1040 issued." },
      { at: "2026-08-04 17:10", by: "Logistics Executive", action: "Information requested: correct delivery address and site contact." },
    ],
  },
  {
    clearanceId: "CLR-1036",
    paymentRequestId: "PR-000301",
    projectId: "PRJ-000012",
    dispatchId: null,
    store: "Clean Craft Gwalior",
    city: "Gwalior",
    deliveryAddress: "Shop 11, City Centre, Gwalior 474011",
    addressComplete: true,
    siteContact: "Owner — D. Tomar · 96•••••712",
    siteContactAvailable: true,
    coordinator: "Aarti Nair (PC)",
    accountsManager: "Neha Kapoor (AM)",
    items: [
      item("IT-01", "Laundry washer 8 kg", "Laundry Machine", 2, "Heavy", { availability: "partial", qtyAvailable: 1, expectedOn: "2026-08-12" }),
      item("IT-02", "Chemicals set", "Chemicals", 10, "Upright", { availability: "available", qtyAvailable: 10 }),
    ],
    requiredDelivery: "2026-08-08",
    launchDate: "2026-08-15",
    priority: "high",
    specialInstructions: "Second washer quantity mismatch against approved payment request.",
    financialClearance: "Verified & Active",
    status: "returned",
    packingStarted: false,
    returnInfo: {
      reason: "Quantity mismatch",
      nextAction: "Accounts to reconfirm approved washer quantity against PR-000301.",
      dueDate: "2026-08-06",
    },
    history: [
      { at: "2026-07-31 11:00", by: "Neha Kapoor (AM)", action: "Clearance CLR-1036 issued." },
      { at: "2026-08-02 10:15", by: "Logistics Executive", action: "Returned to Accounts — quantity mismatch. Clearance ID preserved." },
    ],
  },
  {
    clearanceId: "CLR-1029",
    paymentRequestId: "PR-000288",
    projectId: "PRJ-000007",
    dispatchId: "DSP-000110",
    store: "Clean Craft Raipur",
    city: "Raipur",
    deliveryAddress: "Shop 3, Shankar Nagar, Raipur 492001",
    addressComplete: true,
    siteContact: "Owner — P. Sahu · 90•••••255",
    siteContactAvailable: true,
    coordinator: "Vikram Joshi (PC)",
    accountsManager: "Rohit Bansal (AM)",
    items: [
      item("IT-01", "Signage, glow board, standees", "Other Approved Item", 1, "Fragile", { availability: "available", qtyAvailable: 1 }),
      item("IT-02", "Packaging materials", "Packaging Materials", 15, "Dry storage", { availability: "available", qtyAvailable: 15 }),
    ],
    requiredDelivery: "2026-08-08",
    launchDate: "2026-08-16",
    priority: "normal",
    specialInstructions: "Glow board fragile.",
    financialClearance: "Suspended by Accounts",
    status: "suspended",
    packingStarted: true,
    packingStaff: "Imran A.",
    acceptedBy: "Logistics Executive",
    acceptedAt: "2026-08-03 09:40",
    history: [
      { at: "2026-08-02 09:00", by: "Rohit Bansal (AM)", action: "Clearance CLR-1029 issued." },
      { at: "2026-08-03 09:40", by: "Logistics Executive", action: "Clearance accepted. Dispatch ID DSP-000110 activated." },
      { at: "2026-08-04 13:00", by: "Imran A.", action: "Packing completed — 1 package. Activity preserved." },
      { at: "2026-08-05 08:15", by: "Rohit Bansal (AM)", action: "Clearance suspended — payment reversal under check. Packing and dispatch paused." },
    ],
  },
  {
    clearanceId: "CLR-1026",
    paymentRequestId: "PR-000279",
    projectId: "PRJ-000005",
    dispatchId: null,
    store: "Clean Craft Patna",
    city: "Patna",
    deliveryAddress: "Shop 5, Boring Road, Patna 800001",
    addressComplete: true,
    siteContact: "Owner — N. Kumar · 93•••••604",
    siteContactAvailable: true,
    coordinator: "Aarti Nair (PC)",
    accountsManager: "Neha Kapoor (AM)",
    items: [item("IT-01", "Consumables starter kit", "Consumables", 4, "—")],
    requiredDelivery: "2026-08-06",
    launchDate: "2026-08-22",
    priority: "normal",
    specialInstructions: "Franchise postponed launch.",
    financialClearance: "Cancelled by Accounts",
    status: "cancelled",
    packingStarted: false,
    history: [
      { at: "2026-07-30 10:00", by: "Neha Kapoor (AM)", action: "Clearance CLR-1026 issued." },
      { at: "2026-08-02 10:00", by: "Neha Kapoor (AM)", action: "Clearance cancelled at franchise request. Full history preserved." },
    ],
  },
  {
    clearanceId: "CLR-1043",
    paymentRequestId: "PR-000318",
    projectId: "PRJ-000018",
    dispatchId: null,
    store: "Clean Craft Jaipur",
    city: "Jaipur",
    deliveryAddress: "Shop 6, Vaishali Nagar Main Road, Jaipur 302021",
    addressComplete: true,
    siteContact: "Owner — M. Sharma · 98•••••441",
    siteContactAvailable: true,
    coordinator: "Aarti Nair (PC)",
    accountsManager: "Rohit Bansal (AM)",
    items: [
      item("IT-01", "Dry-clean machine 12 kg", "Dry-Cleaning Machine", 1, "Heavy — forklift loading"),
      item("IT-02", "Steam boiler + iron table", "Finishing Equipment", 1, "Fragile panels"),
    ],
    requiredDelivery: "2026-08-11",
    launchDate: "2026-08-18",
    priority: "high",
    specialInstructions: "Appears to repeat CLR-1041 for the same payment request.",
    financialClearance: "Verified & Active",
    status: "received",
    packingStarted: false,
    history: [
      { at: "2026-08-05 07:50", by: "Rohit Bansal (AM)", action: "Clearance CLR-1043 issued." },
    ],
  },
];
