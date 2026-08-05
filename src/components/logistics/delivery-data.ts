/**
 * Delivery records. Always reuse the Dispatch ID created in Dispatch Planning —
 * partial, delayed, damaged or missing outcomes never create a new dispatch.
 * Every record links back to Clearance ID, Project ID and the Packing Task ID
 * so packing evidence stays available for investigation.
 * Recipient contact details are masked for unauthorised viewers; no financial data.
 */

export type DeliveryStatus =
  | "dispatched"
  | "expected"
  | "delivered"
  | "proof_received"
  | "recipient_confirmed"
  | "closed"
  | "delayed"
  | "partial"
  | "damaged"
  | "missing"
  | "refused"
  | "return_required";

export type DeliveryOutcome =
  | "Delivered in Full"
  | "Partial Delivery"
  | "Delivered with Damage"
  | "Item Missing"
  | "Delivery Delayed"
  | "Delivery Refused"
  | "Address Problem"
  | "Return Required";

export const DELIVERY_OUTCOMES: DeliveryOutcome[] = [
  "Delivered in Full",
  "Partial Delivery",
  "Delivered with Damage",
  "Item Missing",
  "Delivery Delayed",
  "Delivery Refused",
  "Address Problem",
  "Return Required",
];

export const DEL_STATUS_LABEL: Record<DeliveryStatus, string> = {
  dispatched: "Dispatched",
  expected: "Delivery Expected",
  delivered: "Delivered",
  proof_received: "Proof Received",
  recipient_confirmed: "Recipient Confirmation",
  closed: "Delivery Closed",
  delayed: "Delivery Delayed",
  partial: "Partial Delivery",
  damaged: "Damaged Delivery",
  missing: "Missing Item",
  refused: "Refused Delivery",
  return_required: "Return Required",
};

/** green delivered/confirmed, blue expected/in progress, amber delayed/partial, red damaged/missing/refused, grey returned */
export const DEL_STATUS_TONE: Record<DeliveryStatus, string> = {
  dispatched: "bg-primary/10 text-primary border-primary/20",
  expected: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  proof_received: "bg-emerald-100 text-emerald-800 border-emerald-200",
  recipient_confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  delayed: "bg-amber-100 text-amber-800 border-amber-200",
  partial: "bg-amber-100 text-amber-800 border-amber-200",
  damaged: "bg-destructive/10 text-destructive border-destructive/20",
  missing: "bg-destructive/10 text-destructive border-destructive/20",
  refused: "bg-destructive/10 text-destructive border-destructive/20",
  return_required: "bg-muted text-muted-foreground border-border",
};

export const DELIVERY_CHECKS: { key: string; label: string }[] = [
  { key: "address", label: "Correct delivery address" },
  { key: "recipient", label: "Correct recipient" },
  { key: "count", label: "Package count verified" },
  { key: "items", label: "Items received" },
  { key: "condition", label: "Visible condition checked" },
  { key: "serial", label: "Machine serial numbers checked when required" },
  { key: "signed", label: "Delivery document signed" },
  { key: "proof", label: "Delivery proof uploaded" },
  { key: "coordinator", label: "Project Coordinator informed" },
];

export const DELAY_REASONS = [
  "Transporter delay",
  "Vehicle breakdown",
  "Route or weather disruption",
  "Site not ready",
  "Address problem",
  "Recipient unavailable",
  "Other",
];

export const RECIPIENT_ROLES = [
  "Franchise Owner",
  "Authorised Site Contact",
  "Store Manager",
  "Site Supervisor",
  "Security / Watchman",
  "Other Authorised Person",
];

export const TRANSPORT_PLATFORMS = ["Shiprocket", "WheelsEye", "Local Transporter", "Own Vehicle"];

export const ITEM_TYPES = [
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

export const EXECUTIVES = ["Ankit Verma", "Neha Sharma", "Rahul Yadav"];

export const TODAY = "2026-08-05";

export type DeliveryItem = {
  name: string;
  type: string;
  qtyDispatched: number;
  qtyReceived?: number | null;
  serial?: string | null;
  packageNo: string;
  emoji: string;
};

export type DeliveryRecord = {
  dispatchId: string;
  clearanceId: string;
  projectId: string;
  packingTaskId: string;
  store: string;
  city: string;
  address: string;
  siteContact: { name: string; mobile: string; role: string };
  platform: string;
  transporter: string;
  bookingRef: string;
  awb: string;
  packagesExpected: number;
  packagesReceived?: number | null;
  items: DeliveryItem[];
  expectedDate: string;
  actualDate?: string | null;
  actualTime?: string | null;
  status: DeliveryStatus;
  outcome?: DeliveryOutcome | null;
  receivedBy?: string | null;
  recipientMobile?: string | null;
  recipientRole?: string | null;
  itemCondition?: string | null;
  proofPhotos: number;
  proofDocs: string[];
  recipientComments?: string;
  logisticsNote?: string;
  recipientConfirmation: {
    method: "OTP" | "Digital Signature" | "Signed Document" | "Confirmation Link" | "Manual Authorised" | null;
    confirmedAt?: string | null;
    confirmedBy?: string | null;
  };
  checks: Record<string, boolean>;
  partial?: {
    delivered: string;
    pending: string;
    qtyDelivered: number;
    qtyPending: number;
    reason: string;
    remainingDate: string;
    nextAction: string;
    responsible: string;
  } | null;
  damage?: {
    item: string;
    qty: number;
    description: string;
    photos: number;
    transporterNote: string;
    recipientNote: string;
    immediateAction: string;
    replacementOrReturn: "Replacement" | "Return" | "Under review";
    priority: "urgent" | "high" | "normal";
    issueId: string;
  } | null;
  delay?: {
    reason: string;
    updatedDate: string;
    transporterResponse: string;
    launchImpact: string;
    followUpDate: string;
    responsible: string;
  } | null;
  launchDate: string;
  executive: string;
  history: { at: string; by: string; action: string }[];
};

export const DELIVERIES: DeliveryRecord[] = [
  {
    dispatchId: "DSP-000117",
    clearanceId: "CLR-1037",
    projectId: "PRJ-000013",
    packingTaskId: "PKT-000230",
    store: "Clean Craft Surat",
    city: "Surat",
    address: "Shop 4, Ring Road Complex, Adajan, Surat 395009",
    siteContact: { name: "Mehul Patel", mobile: "98•••••231", role: "Franchise Owner" },
    platform: "Shiprocket",
    transporter: "Shiprocket Surface",
    bookingRef: "SRK-88231",
    awb: "AWB 7712004431",
    packagesExpected: 2,
    items: [
      { name: "Detergent & solvent cartons", type: "Chemicals", qtyDispatched: 8, packageNo: "PKG-1", emoji: "🧪" },
      { name: "Hangers, covers, tags", type: "Consumables", qtyDispatched: 30, packageNo: "PKG-2", emoji: "👔" },
    ],
    expectedDate: "2026-08-05",
    status: "expected",
    proofPhotos: 0,
    proofDocs: [],
    recipientConfirmation: { method: null },
    checks: {},
    launchDate: "2026-08-09",
    executive: "Ankit Verma",
    history: [
      { at: "2026-08-03 18:10", by: "Ankit Verma", action: "Dispatched via Shiprocket · AWB 7712004431. Delivery expected 2026-08-05." },
    ],
  },
  {
    dispatchId: "DSP-000115",
    clearanceId: "CLR-1033",
    projectId: "PRJ-000012",
    packingTaskId: "PKT-000224",
    store: "Clean Craft Nagpur",
    city: "Nagpur",
    address: "Plot 22, Wardha Road, Nagpur 440015",
    siteContact: { name: "Sanjay Deshmukh", mobile: "97•••••118", role: "Authorised Site Contact" },
    platform: "WheelsEye",
    transporter: "WheelsEye · Vehicle MH31 AB 4412",
    bookingRef: "WE-55120",
    awb: "LR 44120-NG",
    packagesExpected: 4,
    packagesReceived: 4,
    items: [
      { name: "Washer-extractor 10 kg", type: "Laundry Machine", qtyDispatched: 1, qtyReceived: 1, serial: "WE10-NG-5521", packageNo: "PKG-1", emoji: "🌀" },
      { name: "Steam boiler + iron table", type: "Finishing Equipment", qtyDispatched: 1, qtyReceived: 1, serial: "SB-NG-1180", packageNo: "PKG-2", emoji: "♨️" },
      { name: "POS terminal + printer", type: "POS Equipment", qtyDispatched: 1, qtyReceived: 1, serial: "POS-NG-9014", packageNo: "PKG-3", emoji: "🖥️" },
      { name: "Consumables starter kit", type: "Consumables", qtyDispatched: 6, qtyReceived: 6, packageNo: "PKG-4", emoji: "🧴" },
    ],
    expectedDate: "2026-08-04",
    actualDate: "2026-08-04",
    actualTime: "15:20",
    status: "delivered",
    outcome: "Delivered in Full",
    receivedBy: "Sanjay Deshmukh",
    recipientMobile: "97•••••118",
    recipientRole: "Authorised Site Contact",
    itemCondition: "Good — no visible damage",
    proofPhotos: 4,
    proofDocs: ["Signed LR copy (placeholder)"],
    recipientComments: "All four packages received. Machines look fine.",
    logisticsNote: "Serials matched packing record.",
    recipientConfirmation: { method: null },
    checks: Object.fromEntries(DELIVERY_CHECKS.map((c) => [c.key, c.key !== "coordinator"])),
    launchDate: "2026-08-10",
    executive: "Neha Sharma",
    history: [
      { at: "2026-08-02 09:00", by: "Neha Sharma", action: "Dispatched via WheelsEye · LR 44120-NG." },
      { at: "2026-08-04 15:20", by: "Neha Sharma", action: "Delivered in Full recorded. 4 of 4 packages received, proof uploaded. Recipient confirmation pending." },
    ],
  },
  {
    dispatchId: "DSP-000112",
    clearanceId: "CLR-1030",
    projectId: "PRJ-000009",
    packingTaskId: "PKT-000218",
    store: "Clean Craft Kanpur",
    city: "Kanpur",
    address: "12/4 Mall Road, Kanpur 208001",
    siteContact: { name: "Arvind Gupta", mobile: "99•••••776", role: "Franchise Owner" },
    platform: "Local Transporter",
    transporter: "Sharma Roadlines",
    bookingRef: "SRL-2210",
    awb: "LR 2210-KNP",
    packagesExpected: 5,
    packagesReceived: 3,
    items: [
      { name: "Dry-clean machine 12 kg", type: "Dry-Cleaning Machine", qtyDispatched: 1, qtyReceived: 1, serial: "DC12-KN-4410", packageNo: "PKG-1", emoji: "🌀" },
      { name: "Finishing table", type: "Finishing Equipment", qtyDispatched: 1, qtyReceived: 1, serial: "FT-KN-2231", packageNo: "PKG-2", emoji: "♨️" },
      { name: "Consumables cartons", type: "Consumables", qtyDispatched: 6, qtyReceived: 4, packageNo: "PKG-3", emoji: "🧴" },
      { name: "Signage & branding", type: "Other Approved Item", qtyDispatched: 1, qtyReceived: 0, packageNo: "PKG-4", emoji: "🪧" },
      { name: "Spare parts kit", type: "Spare Parts", qtyDispatched: 2, qtyReceived: 0, packageNo: "PKG-5", emoji: "🔧" },
    ],
    expectedDate: "2026-08-03",
    actualDate: "2026-08-03",
    actualTime: "17:40",
    status: "partial",
    outcome: "Partial Delivery",
    receivedBy: "Arvind Gupta",
    recipientMobile: "99•••••776",
    recipientRole: "Franchise Owner",
    itemCondition: "Received items in good condition",
    proofPhotos: 3,
    proofDocs: ["Signed LR copy (placeholder)"],
    recipientComments: "Two packages did not come with the vehicle.",
    logisticsNote: "Transporter left 2 packages at Kanpur hub.",
    recipientConfirmation: { method: null },
    checks: Object.fromEntries(DELIVERY_CHECKS.map((c) => [c.key, true])),
    partial: {
      delivered: "PKG-1, PKG-2, PKG-3 (partial)",
      pending: "PKG-4 signage, PKG-5 spare parts, 2 consumable cartons",
      qtyDelivered: 6,
      qtyPending: 5,
      reason: "Transporter capacity — packages held at hub",
      remainingDate: "2026-08-07",
      nextAction: "Transporter to deliver remaining packages; confirm with site contact",
      responsible: "Rahul Yadav",
    },
    launchDate: "2026-08-13",
    executive: "Rahul Yadav",
    history: [
      { at: "2026-08-01 11:00", by: "Rahul Yadav", action: "Dispatched via Sharma Roadlines · LR 2210-KNP." },
      { at: "2026-08-03 17:40", by: "Rahul Yadav", action: "Partial Delivery recorded on same Dispatch ID. 3 of 5 packages received. Issue ISS-0442 linked." },
      { at: "2026-08-03 17:45", by: "System", action: "Accounts Manager and Project Coordinator notified of partial delivery." },
    ],
  },
  {
    dispatchId: "DSP-000110",
    clearanceId: "CLR-1029",
    projectId: "PRJ-000007",
    packingTaskId: "PKT-000228",
    store: "Clean Craft Raipur",
    city: "Raipur",
    address: "Shop 9, Pandri Main Road, Raipur 492004",
    siteContact: { name: "Deepa Sahu", mobile: "96•••••340", role: "Store Manager" },
    platform: "Shiprocket",
    transporter: "Shiprocket Surface",
    bookingRef: "SRK-77410",
    awb: "AWB 7712009980",
    packagesExpected: 1,
    packagesReceived: 1,
    items: [
      { name: "Signage, glow board, standees", type: "Other Approved Item", qtyDispatched: 1, qtyReceived: 1, packageNo: "PKG-1", emoji: "🪧" },
    ],
    expectedDate: "2026-08-04",
    actualDate: "2026-08-04",
    actualTime: "12:10",
    status: "damaged",
    outcome: "Delivered with Damage",
    receivedBy: "Deepa Sahu",
    recipientMobile: "96•••••340",
    recipientRole: "Store Manager",
    itemCondition: "Glow board cracked at one corner",
    proofPhotos: 5,
    proofDocs: ["Damage remark on LR (placeholder)"],
    recipientComments: "Glow board corner broken. Rest is fine.",
    logisticsNote: "Damage remark added on transporter copy at the time of delivery.",
    recipientConfirmation: { method: null },
    checks: Object.fromEntries(DELIVERY_CHECKS.map((c) => [c.key, true])),
    damage: {
      item: "Glow board (PKG-1)",
      qty: 1,
      description: "Acrylic glow board cracked at the bottom-right corner; frame bent.",
      photos: 3,
      transporterNote: "Handled at hub; damage acknowledged on LR.",
      recipientNote: "Cannot install as-is. Needs replacement before launch.",
      immediateAction: "Replacement raised with vendor; installation held",
      replacementOrReturn: "Replacement",
      priority: "high",
      issueId: "ISS-0439",
    },
    launchDate: "2026-08-16",
    executive: "Ankit Verma",
    history: [
      { at: "2026-08-02 10:00", by: "Ankit Verma", action: "Dispatched via Shiprocket · AWB 7712009980." },
      { at: "2026-08-04 12:10", by: "Ankit Verma", action: "Delivered with Damage recorded. Issue ISS-0439 created under the same Dispatch ID." },
      { at: "2026-08-04 12:15", by: "System", action: "Project Coordinator informed — launch installation may be affected." },
    ],
  },
  {
    dispatchId: "DSP-000109",
    clearanceId: "CLR-1027",
    projectId: "PRJ-000006",
    packingTaskId: "PKT-000215",
    store: "Clean Craft Ludhiana",
    city: "Ludhiana",
    address: "B-17, Model Town Extension, Ludhiana 141002",
    siteContact: { name: "Harpreet Singh", mobile: "98•••••902", role: "Franchise Owner" },
    platform: "WheelsEye",
    transporter: "WheelsEye · Vehicle PB10 CD 7781",
    bookingRef: "WE-54980",
    awb: "LR 54980-LDH",
    packagesExpected: 3,
    items: [
      { name: "Washer-extractor 8 kg", type: "Laundry Machine", qtyDispatched: 1, serial: "WE8-LD-7712", packageNo: "PKG-1", emoji: "🌀" },
      { name: "POS terminal", type: "POS Equipment", qtyDispatched: 1, serial: "POS-LD-3311", packageNo: "PKG-2", emoji: "🖥️" },
      { name: "Consumables cartons", type: "Consumables", qtyDispatched: 5, packageNo: "PKG-3", emoji: "🧴" },
    ],
    expectedDate: "2026-08-03",
    status: "delayed",
    outcome: "Delivery Delayed",
    proofPhotos: 0,
    proofDocs: [],
    recipientConfirmation: { method: null },
    checks: {},
    delay: {
      reason: "Vehicle breakdown",
      updatedDate: "2026-08-06",
      transporterResponse: "Replacement vehicle arranged; load transferred at Panipat.",
      launchImpact: "Installation slips by 2 days; training date at risk",
      followUpDate: "2026-08-06",
      responsible: "Neha Sharma",
    },
    launchDate: "2026-08-11",
    executive: "Neha Sharma",
    history: [
      { at: "2026-08-01 08:30", by: "Neha Sharma", action: "Dispatched via WheelsEye · LR 54980-LDH." },
      { at: "2026-08-03 19:00", by: "Neha Sharma", action: "Delivery Delayed recorded — vehicle breakdown. Updated expected date 2026-08-06." },
      { at: "2026-08-03 19:05", by: "System", action: "Project Coordinator notified — project launch timeline may be affected." },
    ],
  },
  {
    dispatchId: "DSP-000107",
    clearanceId: "CLR-1024",
    projectId: "PRJ-000004",
    packingTaskId: "PKT-000211",
    store: "Clean Craft Guwahati",
    city: "Guwahati",
    address: "GS Road, Christian Basti, Guwahati 781005",
    siteContact: { name: "Bhaskar Das", mobile: "94•••••515", role: "Site Supervisor" },
    platform: "Local Transporter",
    transporter: "North East Carriers",
    bookingRef: "NEC-1120",
    awb: "LR 1120-GHY",
    packagesExpected: 2,
    packagesReceived: 0,
    items: [
      { name: "Finishing equipment set", type: "Finishing Equipment", qtyDispatched: 1, qtyReceived: 0, serial: "FE-GH-8890", packageNo: "PKG-1", emoji: "♨️" },
      { name: "Consumables cartons", type: "Consumables", qtyDispatched: 4, qtyReceived: 0, packageNo: "PKG-2", emoji: "🧴" },
    ],
    expectedDate: "2026-08-02",
    actualDate: "2026-08-02",
    actualTime: "11:00",
    status: "refused",
    outcome: "Delivery Refused",
    receivedBy: "—",
    recipientMobile: "94•••••515",
    recipientRole: "Site Supervisor",
    itemCondition: "Not inspected — refused at gate",
    proofPhotos: 2,
    proofDocs: ["Transporter refusal remark (placeholder)"],
    recipientComments: "Site civil work incomplete; no space to unload.",
    logisticsNote: "Consignment held at transporter godown; return decision pending with Accounts.",
    recipientConfirmation: { method: null },
    checks: { address: true, recipient: true },
    launchDate: "2026-08-20",
    executive: "Rahul Yadav",
    history: [
      { at: "2026-07-31 09:00", by: "Rahul Yadav", action: "Dispatched via North East Carriers · LR 1120-GHY." },
      { at: "2026-08-02 11:00", by: "Rahul Yadav", action: "Delivery Refused recorded — site not ready. Issue ISS-0431 created under same Dispatch ID." },
    ],
  },
  {
    dispatchId: "DSP-000104",
    clearanceId: "CLR-1019",
    projectId: "PRJ-000002",
    packingTaskId: "PKT-000203",
    store: "Clean Craft Indore Vijay Nagar",
    city: "Indore",
    address: "Scheme 54, Vijay Nagar, Indore 452010",
    siteContact: { name: "Ritu Jain", mobile: "90•••••664", role: "Franchise Owner" },
    platform: "Shiprocket",
    transporter: "Shiprocket Surface",
    bookingRef: "SRK-70011",
    awb: "AWB 7711998120",
    packagesExpected: 3,
    packagesReceived: 3,
    items: [
      { name: "Washer-extractor 10 kg", type: "Laundry Machine", qtyDispatched: 1, qtyReceived: 1, serial: "WE10-IN-3301", packageNo: "PKG-1", emoji: "🌀" },
      { name: "POS terminal + printer", type: "POS Equipment", qtyDispatched: 1, qtyReceived: 1, serial: "POS-IN-7741", packageNo: "PKG-2", emoji: "🖥️" },
      { name: "Consumables starter kit", type: "Consumables", qtyDispatched: 6, qtyReceived: 6, packageNo: "PKG-3", emoji: "🧴" },
    ],
    expectedDate: "2026-07-29",
    actualDate: "2026-07-29",
    actualTime: "14:05",
    status: "closed",
    outcome: "Delivered in Full",
    receivedBy: "Ritu Jain",
    recipientMobile: "90•••••664",
    recipientRole: "Franchise Owner",
    itemCondition: "Good — no visible damage",
    proofPhotos: 5,
    proofDocs: ["Signed delivery document (placeholder)"],
    recipientComments: "Everything received in good condition.",
    logisticsNote: "Serial numbers matched packing record PKT-000203.",
    recipientConfirmation: { method: "Manual Authorised", confirmedAt: "2026-07-29 16:00", confirmedBy: "Ritu Jain" },
    checks: Object.fromEntries(DELIVERY_CHECKS.map((c) => [c.key, true])),
    launchDate: "2026-08-05",
    executive: "Ankit Verma",
    history: [
      { at: "2026-07-27 10:00", by: "Ankit Verma", action: "Dispatched via Shiprocket · AWB 7711998120." },
      { at: "2026-07-29 14:05", by: "Ankit Verma", action: "Delivered in Full recorded with proof." },
      { at: "2026-07-29 16:00", by: "Ritu Jain", action: "Recipient confirmation received (manual authorised)." },
      { at: "2026-07-29 16:30", by: "Ankit Verma", action: "Delivery closed. Proof, recipient details and history preserved. Accounts Manager and Project Coordinator updated." },
    ],
  },
  {
    dispatchId: "DSP-000103",
    clearanceId: "CLR-1017",
    projectId: "PRJ-000001",
    packingTaskId: "PKT-000199",
    store: "Clean Craft Agra",
    city: "Agra",
    address: "Sanjay Place, Agra 282002",
    siteContact: { name: "Naveen Kumar", mobile: "88•••••209", role: "Franchise Owner" },
    platform: "Local Transporter",
    transporter: "Yamuna Logistics",
    bookingRef: "YL-9021",
    awb: "LR 9021-AGR",
    packagesExpected: 2,
    packagesReceived: 1,
    items: [
      { name: "Spare parts kit", type: "Spare Parts", qtyDispatched: 2, qtyReceived: 1, packageNo: "PKG-1", emoji: "🔧" },
      { name: "Chemicals carton", type: "Chemicals", qtyDispatched: 4, qtyReceived: 0, packageNo: "PKG-2", emoji: "🧪" },
    ],
    expectedDate: "2026-07-30",
    actualDate: "2026-07-30",
    actualTime: "13:15",
    status: "return_required",
    outcome: "Return Required",
    receivedBy: "Naveen Kumar",
    recipientMobile: "88•••••209",
    recipientRole: "Franchise Owner",
    itemCondition: "Chemicals carton leaking — refused by owner",
    proofPhotos: 3,
    proofDocs: ["Return note (placeholder)"],
    recipientComments: "Leaking carton returned with the vehicle.",
    logisticsNote: "Return in transit; replacement dispatch will reference DSP-000103 and ISS-0428.",
    recipientConfirmation: { method: null },
    checks: Object.fromEntries(DELIVERY_CHECKS.map((c) => [c.key, c.key !== "signed"])),
    damage: {
      item: "Chemicals carton (PKG-2)",
      qty: 4,
      description: "Two bottles leaked inside the carton during transit.",
      photos: 3,
      transporterNote: "Return accepted on the same vehicle.",
      recipientNote: "Cannot keep leaking chemicals at site.",
      immediateAction: "Return picked up; replacement to be dispatched",
      replacementOrReturn: "Return",
      priority: "normal",
      issueId: "ISS-0428",
    },
    launchDate: "2026-08-24",
    executive: "Neha Sharma",
    history: [
      { at: "2026-07-28 09:30", by: "Neha Sharma", action: "Dispatched via Yamuna Logistics · LR 9021-AGR." },
      { at: "2026-07-30 13:15", by: "Neha Sharma", action: "Return Required recorded — leaking chemicals carton. Issue ISS-0428 linked to the same Dispatch ID." },
    ],
  },
];
