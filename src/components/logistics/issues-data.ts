/**
 * Issues & Returns records. One permanent Issue ID per event, always linked to
 * the original Dispatch ID, Clearance ID and Project ID. Replacement dispatches
 * reference the original Dispatch ID and Issue ID; reopening reuses the same
 * Issue ID. Investigation and resolution history is append-only.
 * Responsibility stays provisional until investigation and manager approval.
 */

export type IssueStatus =
  | "reported"
  | "under_review"
  | "investigation"
  | "action_approved"
  | "replacement"
  | "return"
  | "resolved"
  | "closed"
  | "info_required"
  | "claim_pending"
  | "rejected"
  | "cancelled"
  | "reopened";

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  reported: "Issue Reported",
  under_review: "Under Review",
  investigation: "Investigation",
  action_approved: "Action Approved",
  replacement: "Replacement in Progress",
  return: "Return in Progress",
  resolved: "Resolved",
  closed: "Closed",
  info_required: "Information Required",
  claim_pending: "Claim Pending",
  rejected: "Rejected",
  cancelled: "Cancelled",
  reopened: "Reopened",
};

/** dark red critical, red urgent/overdue, amber investigation/claim, blue replacement/return, green resolved, grey cancelled/rejected */
export const ISSUE_STATUS_TONE: Record<IssueStatus, string> = {
  reported: "bg-destructive/10 text-destructive border-destructive/20",
  under_review: "bg-amber-100 text-amber-800 border-amber-200",
  investigation: "bg-amber-100 text-amber-800 border-amber-200",
  action_approved: "bg-primary/10 text-primary border-primary/20",
  replacement: "bg-primary/10 text-primary border-primary/20",
  return: "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  info_required: "bg-amber-100 text-amber-800 border-amber-200",
  claim_pending: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-muted text-muted-foreground border-border",
  reopened: "bg-destructive/10 text-destructive border-destructive/20",
};

export const ISSUE_TYPES = [
  "Item Unavailable",
  "Packing Delay",
  "Wrong Item",
  "Wrong Quantity",
  "Packing Damage",
  "Transport Damage",
  "Missing Package",
  "Delivery Delay",
  "Address Problem",
  "Delivery Refused",
  "Partial Delivery",
  "Lost Shipment",
  "Clearance Suspended",
  "Other",
];

export const RESPONSIBILITY = [
  "Packing Issue",
  "Logistics Planning Issue",
  "Transporter Issue",
  "Supplier Issue",
  "Customer or Site Issue",
  "Accounts Clearance Issue",
  "Unconfirmed",
];

export const INVESTIGATION_POINTS: { key: string; label: string }[] = [
  { key: "clearance", label: "Accounts clearance" },
  { key: "approved_items", label: "Approved item list" },
  { key: "pack_checklist", label: "Packing checklist" },
  { key: "pack_photos", label: "Packing photographs" },
  { key: "pkg_count", label: "Package count" },
  { key: "labels", label: "Labels" },
  { key: "booking", label: "Transport booking" },
  { key: "dispatch_proof", label: "Dispatch proof" },
  { key: "delivery_proof", label: "Delivery proof" },
  { key: "recipient_stmt", label: "Recipient statement" },
  { key: "transporter_stmt", label: "Transporter statement" },
];

export const RESOLUTION_POINTS: { key: string; label: string }[] = [
  { key: "root_cause", label: "Root cause recorded" },
  { key: "action_done", label: "Action completed" },
  { key: "repl_return", label: "Replacement or return status confirmed" },
  { key: "recipient", label: "Recipient confirmation received" },
  { key: "coordinator", label: "Project Coordinator confirmation (when launch affected)" },
  { key: "preventive", label: "Preventive action recorded" },
  { key: "evidence", label: "Resolution evidence attached" },
];

export const ACTION_OPTIONS = [
  "Request More Information",
  "Correct Packing",
  "Arrange Replacement",
  "Initiate Return",
  "Raise Transport Claim",
  "Update Delivery Schedule",
  "Escalate to Management",
  "Resolve Issue",
];

export const RETURN_REASONS = [
  "Damaged on arrival",
  "Wrong item delivered",
  "Excess quantity delivered",
  "Delivery refused at site",
  "Site not ready",
  "Replacement swap",
  "Other approved reason",
];

export const OWNERS = ["Ankit Verma", "Neha Sharma", "Rahul Yadav", "Unassigned"];
export const PLATFORMS = ["Shiprocket", "WheelsEye", "Local Transporter", "Own Vehicle"];
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

export const TODAY = "2026-08-05";

export type IssueRecord = {
  issueId: string;
  dispatchId: string;
  clearanceId: string;
  projectId: string;
  packingTaskId: string;
  store: string;
  city: string;
  platform: string;
  bookingRef: string;
  awb: string;
  type: string;
  itemAffected: string;
  packageNo: string;
  itemType: string;
  qtyAffected: number;
  description: string;
  reportedBy: string;
  reportedAt: string;
  priority: "critical" | "urgent" | "high" | "normal";
  status: IssueStatus;
  owner: string;
  responsibility: string;
  responsibilityApproved: boolean;
  photos: number;
  documents: string[];
  recipientComments?: string;
  packingEvidence: string;
  dispatchEvidence: string;
  deliveryEvidence: string;
  investigation: Record<string, boolean>;
  investigationNotes: { at: string; by: string; note: string }[];
  investigationDue: string;
  immediateAction: string;
  launchImpact: string;
  launchDate: string;
  nextAction: string;
  nextActionDue: string;
  machineLoss: boolean;
  wholeShipmentMissing: boolean;
  launchBlocked: boolean;
  reopened: boolean;
  replacement?: {
    items: string;
    qty: number;
    approvedBy: string;
    costResponsibility: string;
    newPackingTaskId: string;
    requiredDispatchDate: string;
    replacementDispatchId: string;
  } | null;
  returnInfo?: {
    items: string;
    qty: number;
    reason: string;
    authRef: string;
    pickupAddress: string;
    destination: string;
    platform: string;
    bookingRef: string;
    expectedPickup: string;
    conditionOnReturn: string;
    completionProof: string;
  } | null;
  claim?: {
    platform: string;
    claimRef: string;
    claimDate: string;
    amountRef: string;
    documents: string[];
    status: string;
    expectedResolution: string;
    outcome: string;
  } | null;
  resolution?: {
    rootCause: string;
    actionCompleted: string;
    replacementOrReturnStatus: string;
    recipientConfirmation: string;
    coordinatorConfirmation: string;
    preventiveAction: string;
    resolvedOn: string;
    evidence: string;
  } | null;
  financialAdjustment: boolean;
  history: { at: string; by: string; action: string }[];
};

export const ISSUES: IssueRecord[] = [
  {
    issueId: "ISS-0442",
    dispatchId: "DSP-000112",
    clearanceId: "CLR-1030",
    projectId: "PRJ-000009",
    packingTaskId: "PKT-000218",
    store: "Clean Craft Kanpur",
    city: "Kanpur",
    platform: "Local Transporter",
    bookingRef: "SRL-2210",
    awb: "LR 2210-KNP",
    type: "Partial Delivery",
    itemAffected: "Signage & branding, spare parts kit, 2 consumable cartons",
    packageNo: "PKG-4, PKG-5, PKG-3 (part)",
    itemType: "Other Approved Item",
    qtyAffected: 5,
    description:
      "Only 3 of 5 packages reached the site. Transporter held two packages at the Kanpur hub due to vehicle capacity.",
    reportedBy: "Rahul Yadav",
    reportedAt: "2026-08-03 17:45",
    priority: "high",
    status: "investigation",
    owner: "Rahul Yadav",
    responsibility: "Transporter Issue",
    responsibilityApproved: false,
    photos: 3,
    documents: ["Signed LR copy (placeholder)", "Hub short-landing note (placeholder)"],
    recipientComments: "Two packages did not come with the vehicle.",
    packingEvidence: "PKT-000218 · 5 packages packed, checklist complete, 6 photos",
    dispatchEvidence: "LR 2210-KNP · 5 packages handed over at Delhi warehouse",
    deliveryEvidence: "DSP-000112 · 3 of 5 packages received on 2026-08-03",
    investigation: { clearance: true, approved_items: true, pack_checklist: true, pack_photos: true, pkg_count: true },
    investigationNotes: [
      { at: "2026-08-04 10:00", by: "Rahul Yadav", note: "Packing photos confirm 5 sealed packages left the warehouse. Shortfall occurred after handover." },
    ],
    investigationDue: "2026-08-05",
    immediateAction: "Transporter asked to deliver remaining packages by 2026-08-07.",
    launchImpact: "Signage installation may slip by 2 days",
    launchDate: "2026-08-13",
    nextAction: "Confirm hub dispatch of PKG-4 and PKG-5",
    nextActionDue: "2026-08-06",
    machineLoss: false,
    wholeShipmentMissing: false,
    launchBlocked: false,
    reopened: false,
    financialAdjustment: false,
    history: [
      { at: "2026-08-03 17:45", by: "Rahul Yadav", action: "Issue ISS-0442 reported from delivery outcome Partial Delivery on DSP-000112 (Clearance CLR-1030, Project PRJ-000009)." },
      { at: "2026-08-04 09:00", by: "Rahul Yadav", action: "Moved to Investigation. Packing and dispatch evidence linked." },
    ],
  },
  {
    issueId: "ISS-0439",
    dispatchId: "DSP-000110",
    clearanceId: "CLR-1029",
    projectId: "PRJ-000007",
    packingTaskId: "PKT-000228",
    store: "Clean Craft Raipur",
    city: "Raipur",
    platform: "Shiprocket",
    bookingRef: "SRK-77410",
    awb: "AWB 7712009980",
    type: "Transport Damage",
    itemAffected: "Acrylic glow board (PKG-1)",
    packageNo: "PKG-1",
    itemType: "Other Approved Item",
    qtyAffected: 1,
    description: "Glow board cracked at the bottom-right corner and frame bent. Damage acknowledged on the transporter copy.",
    reportedBy: "Ankit Verma",
    reportedAt: "2026-08-04 12:15",
    priority: "urgent",
    status: "replacement",
    owner: "Ankit Verma",
    responsibility: "Transporter Issue",
    responsibilityApproved: true,
    photos: 5,
    documents: ["Damage remark on LR (placeholder)", "Recipient statement (placeholder)"],
    recipientComments: "Glow board corner broken. Cannot install as-is.",
    packingEvidence: "PKT-000228 · fragile packing, corner foam, 3 photos — packing verified correct",
    dispatchEvidence: "AWB 7712009980 · single package, fragile label applied",
    deliveryEvidence: "DSP-000110 · delivered with damage on 2026-08-04, 5 proof photos",
    investigation: Object.fromEntries(INVESTIGATION_POINTS.map((p) => [p.key, true])),
    investigationNotes: [
      { at: "2026-08-04 15:00", by: "Ankit Verma", note: "Packing photos show intact board with foam corners. Damage occurred in transit." },
      { at: "2026-08-04 16:30", by: "Logistics Manager", note: "Provisional responsibility approved as Transporter Issue. Claim to be raised on the platform." },
    ],
    investigationDue: "2026-08-05",
    immediateAction: "Installation held; replacement glow board arranged from vendor.",
    launchImpact: "Branding installation blocked until replacement arrives",
    launchDate: "2026-08-16",
    nextAction: "Dispatch replacement glow board",
    nextActionDue: "2026-08-07",
    machineLoss: false,
    wholeShipmentMissing: false,
    launchBlocked: true,
    reopened: false,
    financialAdjustment: true,
    replacement: {
      items: "Acrylic glow board (same specification)",
      qty: 1,
      approvedBy: "Logistics Manager",
      costResponsibility: "Transporter claim (pending outcome)",
      newPackingTaskId: "PKT-000244",
      requiredDispatchDate: "2026-08-07",
      replacementDispatchId: "DSP-000125-R",
    },
    claim: {
      platform: "Shiprocket",
      claimRef: "SRK-CLM-4410",
      claimDate: "2026-08-04",
      amountRef: "Claim value as per vendor invoice reference (finance restricted)",
      documents: ["Damage photos", "LR damage remark", "Recipient statement"],
      status: "Submitted — awaiting platform review",
      expectedResolution: "2026-08-20",
      outcome: "Pending",
    },
    history: [
      { at: "2026-08-04 12:15", by: "Ankit Verma", action: "Issue ISS-0439 created from Delivered with Damage on DSP-000110." },
      { at: "2026-08-04 16:30", by: "Logistics Manager", action: "Action approved: Arrange Replacement + Raise Transport Claim." },
      { at: "2026-08-04 17:00", by: "Ankit Verma", action: "Replacement dispatch DSP-000125-R created referencing DSP-000110 and ISS-0439. Packing task PKT-000244 raised." },
      { at: "2026-08-04 17:10", by: "System", action: "Accounts Manager informed — financial adjustment may be required. Project Coordinator informed — launch affected." },
    ],
  },
  {
    issueId: "ISS-0431",
    dispatchId: "DSP-000107",
    clearanceId: "CLR-1024",
    projectId: "PRJ-000004",
    packingTaskId: "PKT-000211",
    store: "Clean Craft Guwahati",
    city: "Guwahati",
    platform: "Local Transporter",
    bookingRef: "NEC-1120",
    awb: "LR 1120-GHY",
    type: "Delivery Refused",
    itemAffected: "Finishing equipment set, consumables cartons",
    packageNo: "PKG-1, PKG-2",
    itemType: "Finishing Equipment",
    qtyAffected: 2,
    description: "Site refused delivery — civil work incomplete, no space to unload. Consignment held at transporter godown.",
    reportedBy: "Rahul Yadav",
    reportedAt: "2026-08-02 11:10",
    priority: "high",
    status: "return",
    owner: "Rahul Yadav",
    responsibility: "Customer or Site Issue",
    responsibilityApproved: true,
    photos: 2,
    documents: ["Transporter refusal remark (placeholder)"],
    recipientComments: "Site civil work incomplete; no space to unload.",
    packingEvidence: "PKT-000211 · 2 packages, checklist complete",
    dispatchEvidence: "LR 1120-GHY · dispatched 2026-07-31",
    deliveryEvidence: "DSP-000107 · refused at gate 2026-08-02, 2 proof photos",
    investigation: Object.fromEntries(INVESTIGATION_POINTS.map((p) => [p.key, p.key !== "transporter_stmt"])),
    investigationNotes: [
      { at: "2026-08-02 14:00", by: "Rahul Yadav", note: "Project Coordinator confirmed civil work delay at site. Packing and dispatch were correct." },
    ],
    investigationDue: "2026-08-04",
    immediateAction: "Consignment held at godown; return pickup arranged.",
    launchImpact: "Machine installation pushed to next site-ready window",
    launchDate: "2026-08-20",
    nextAction: "Complete return to Delhi warehouse",
    nextActionDue: "2026-08-06",
    machineLoss: false,
    wholeShipmentMissing: false,
    launchBlocked: false,
    reopened: false,
    financialAdjustment: true,
    returnInfo: {
      items: "Finishing equipment set, consumables cartons",
      qty: 2,
      reason: "Site not ready",
      authRef: "RET-AUTH-0231",
      pickupAddress: "North East Carriers godown, Guwahati",
      destination: "Clean Craft central warehouse, Delhi",
      platform: "Local Transporter",
      bookingRef: "NEC-RET-1140",
      expectedPickup: "2026-08-04",
      conditionOnReturn: "Sealed, packing intact",
      completionProof: "Pending warehouse inward note",
    },
    history: [
      { at: "2026-08-02 11:10", by: "Rahul Yadav", action: "Issue ISS-0431 created from Delivery Refused on DSP-000107." },
      { at: "2026-08-02 15:00", by: "Logistics Manager", action: "Action approved: Initiate Return. Original item and delivery history preserved." },
      { at: "2026-08-03 10:00", by: "Rahul Yadav", action: "Return authorisation RET-AUTH-0231 recorded. Pickup expected 2026-08-04." },
      { at: "2026-08-05 09:00", by: "System", action: "Return pickup delayed — alert raised. Accounts Manager informed of possible freight adjustment." },
    ],
  },
  {
    issueId: "ISS-0428",
    dispatchId: "DSP-000103",
    clearanceId: "CLR-1017",
    projectId: "PRJ-000001",
    packingTaskId: "PKT-000199",
    store: "Clean Craft Agra",
    city: "Agra",
    platform: "Local Transporter",
    bookingRef: "YL-9021",
    awb: "LR 9021-AGR",
    type: "Packing Damage",
    itemAffected: "Chemicals carton (PKG-2)",
    packageNo: "PKG-2",
    itemType: "Chemicals",
    qtyAffected: 4,
    description: "Two bottles leaked inside the carton during transit. Carton returned with the vehicle on the same day.",
    reportedBy: "Neha Sharma",
    reportedAt: "2026-07-30 13:20",
    priority: "normal",
    status: "resolved",
    owner: "Neha Sharma",
    responsibility: "Packing Issue",
    responsibilityApproved: true,
    photos: 3,
    documents: ["Return note (placeholder)", "Warehouse inward note (placeholder)"],
    recipientComments: "Leaking carton returned with the vehicle.",
    packingEvidence: "PKT-000199 · bottles packed upright, stretch film used; inner divider missing",
    dispatchEvidence: "LR 9021-AGR · 2 packages dispatched 2026-07-28",
    deliveryEvidence: "DSP-000103 · 1 of 2 packages accepted 2026-07-30",
    investigation: Object.fromEntries(INVESTIGATION_POINTS.map((p) => [p.key, true])),
    investigationNotes: [
      { at: "2026-07-31 11:00", by: "Neha Sharma", note: "Packing photos show no inner divider between bottles. Correction task issued to packing after verification." },
    ],
    investigationDue: "2026-07-31",
    immediateAction: "Return picked up; replacement chemicals carton dispatched.",
    launchImpact: "No launch impact",
    launchDate: "2026-08-24",
    nextAction: "Close after warehouse inward confirmation",
    nextActionDue: "2026-08-06",
    machineLoss: false,
    wholeShipmentMissing: false,
    launchBlocked: false,
    reopened: false,
    financialAdjustment: true,
    returnInfo: {
      items: "Chemicals carton (4 units)",
      qty: 4,
      reason: "Damaged on arrival",
      authRef: "RET-AUTH-0219",
      pickupAddress: "Sanjay Place, Agra",
      destination: "Clean Craft central warehouse, Delhi",
      platform: "Local Transporter",
      bookingRef: "YL-RET-9033",
      expectedPickup: "2026-07-30",
      conditionOnReturn: "2 bottles leaked, carton wet",
      completionProof: "Warehouse inward note received 2026-08-01",
    },
    resolution: {
      rootCause: "Inner divider not used while packing glass chemical bottles.",
      actionCompleted: "Return completed and replacement carton dispatched with divider packing.",
      replacementOrReturnStatus: "Return completed; replacement delivered",
      recipientConfirmation: "Owner confirmed replacement received in good condition",
      coordinatorConfirmation: "Not required — launch not affected",
      preventiveAction: "Divider added as mandatory material for chemical cartons in packing instructions.",
      resolvedOn: "2026-08-02",
      evidence: "Return note, warehouse inward note, replacement delivery photos",
    },
    history: [
      { at: "2026-07-30 13:20", by: "Neha Sharma", action: "Issue ISS-0428 created from Return Required on DSP-000103." },
      { at: "2026-07-31 11:30", by: "Logistics Manager", action: "Responsibility approved as Packing Issue after investigation. Correction guidance issued to packing." },
      { at: "2026-08-02 16:00", by: "Neha Sharma", action: "Issue resolved with root cause and preventive action recorded." },
    ],
  },
  {
    issueId: "ISS-0425",
    dispatchId: "DSP-000101",
    clearanceId: "CLR-1014",
    projectId: "PRJ-000003",
    packingTaskId: "PKT-000190",
    store: "Clean Craft Varanasi",
    city: "Varanasi",
    platform: "WheelsEye",
    bookingRef: "WE-51200",
    awb: "LR 51200-VNS",
    type: "Lost Shipment",
    itemAffected: "Washer-extractor 10 kg (machine)",
    packageNo: "PKG-1",
    itemType: "Laundry Machine",
    qtyAffected: 1,
    description:
      "Machine crate untraceable after transhipment at Lucknow hub. Transporter unable to confirm location for 6 days.",
    reportedBy: "Ankit Verma",
    reportedAt: "2026-07-28 10:00",
    priority: "critical",
    status: "claim_pending",
    owner: "Ankit Verma",
    responsibility: "Transporter Issue",
    responsibilityApproved: true,
    photos: 4,
    documents: ["LR copy", "Hub handover sheet", "Transporter written statement"],
    recipientComments: "Machine never reached the site; owner escalated.",
    packingEvidence: "PKT-000190 · crated machine, serial WE10-VN-6620, 4 photos",
    dispatchEvidence: "LR 51200-VNS · crate handed over 2026-07-22",
    deliveryEvidence: "No delivery recorded on DSP-000101",
    investigation: Object.fromEntries(INVESTIGATION_POINTS.map((p) => [p.key, p.key !== "delivery_proof"])),
    investigationNotes: [
      { at: "2026-07-29 12:00", by: "Ankit Verma", note: "Hub handover sheet signed; no onward manifest exists. Transporter accepted written statement of loss." },
      { at: "2026-07-30 10:00", by: "Logistics Manager", note: "Escalated to management. Claim raised on the transport platform; replacement machine approved." },
    ],
    investigationDue: "2026-07-30",
    immediateAction: "Replacement machine approved; claim raised with transporter.",
    launchImpact: "Store launch blocked — no primary machine at site",
    launchDate: "2026-08-15",
    nextAction: "Follow up claim outcome and confirm replacement dispatch date",
    nextActionDue: "2026-08-06",
    machineLoss: true,
    wholeShipmentMissing: true,
    launchBlocked: true,
    reopened: false,
    financialAdjustment: true,
    replacement: {
      items: "Washer-extractor 10 kg",
      qty: 1,
      approvedBy: "Management (COO)",
      costResponsibility: "Transporter claim; interim cost with company",
      newPackingTaskId: "PKT-000246",
      requiredDispatchDate: "2026-08-08",
      replacementDispatchId: "DSP-000126-R",
    },
    claim: {
      platform: "WheelsEye",
      claimRef: "WE-CLM-2210",
      claimDate: "2026-07-30",
      amountRef: "Declared consignment value reference (finance restricted)",
      documents: ["LR copy", "Hub handover sheet", "Transporter statement", "Packing photos"],
      status: "Under platform assessment",
      expectedResolution: "2026-08-09",
      outcome: "Pending",
    },
    history: [
      { at: "2026-07-28 10:00", by: "Ankit Verma", action: "Issue ISS-0425 reported — Lost Shipment on DSP-000101 (Clearance CLR-1014, Project PRJ-000003)." },
      { at: "2026-07-30 10:00", by: "Logistics Manager", action: "Escalated to management. Replacement approved; transport claim raised." },
      { at: "2026-07-30 10:30", by: "System", action: "Accounts Manager informed — financial adjustment required. Project Coordinator informed — launch blocked." },
    ],
  },
  {
    issueId: "ISS-0421",
    dispatchId: "DSP-000122",
    clearanceId: "CLR-1042",
    projectId: "PRJ-000019",
    packingTaskId: "PKT-000241",
    store: "Clean Craft Indore",
    city: "Indore",
    platform: "Shiprocket",
    bookingRef: "SRK-88231",
    awb: "Pending booking",
    type: "Item Unavailable",
    itemAffected: "Consumables starter kit",
    packageNo: "PKG-3",
    itemType: "Consumables",
    qtyAffected: 6,
    description: "Two of six consumable SKUs are out of stock at the warehouse; packing cannot be completed in full.",
    reportedBy: "Ankit Verma",
    reportedAt: "2026-08-05 09:40",
    priority: "urgent",
    status: "reported",
    owner: "Unassigned",
    responsibility: "Unconfirmed",
    responsibilityApproved: false,
    photos: 1,
    documents: [],
    packingEvidence: "PKT-000241 · not started, item shortfall flagged at pick stage",
    dispatchEvidence: "Booking not yet created",
    deliveryEvidence: "Not applicable",
    investigation: {},
    investigationNotes: [],
    investigationDue: "2026-08-06",
    immediateAction: "Supplier asked for expedited supply.",
    launchImpact: "Launch training on 2026-08-14 needs consumables at site",
    launchDate: "2026-08-14",
    nextAction: "Assign owner and confirm supplier ETA",
    nextActionDue: "2026-08-05",
    machineLoss: false,
    wholeShipmentMissing: false,
    launchBlocked: false,
    reopened: false,
    financialAdjustment: false,
    history: [
      { at: "2026-08-05 09:40", by: "Ankit Verma", action: "Issue ISS-0421 reported — Item Unavailable on DSP-000122." },
    ],
  },
  {
    issueId: "ISS-0418",
    dispatchId: "DSP-000109",
    clearanceId: "CLR-1027",
    projectId: "PRJ-000006",
    packingTaskId: "PKT-000215",
    store: "Clean Craft Ludhiana",
    city: "Ludhiana",
    platform: "WheelsEye",
    bookingRef: "WE-54980",
    awb: "LR 54980-LDH",
    type: "Delivery Delay",
    itemAffected: "Full consignment (3 packages)",
    packageNo: "PKG-1, PKG-2, PKG-3",
    itemType: "Laundry Machine",
    qtyAffected: 3,
    description: "Vehicle breakdown near Panipat; load transferred to a replacement vehicle. Delivery slipped by 3 days.",
    reportedBy: "Neha Sharma",
    reportedAt: "2026-08-03 19:05",
    priority: "high",
    status: "reopened",
    owner: "Neha Sharma",
    responsibility: "Transporter Issue",
    responsibilityApproved: false,
    photos: 2,
    documents: ["Transporter breakdown note (placeholder)"],
    packingEvidence: "PKT-000215 · checklist complete, 5 photos",
    dispatchEvidence: "LR 54980-LDH · dispatched 2026-08-01",
    deliveryEvidence: "DSP-000109 · delivery delayed, updated expectation 2026-08-06",
    investigation: { clearance: true, booking: true, dispatch_proof: true },
    investigationNotes: [
      { at: "2026-08-04 10:00", by: "Neha Sharma", note: "Transporter confirmed replacement vehicle. First closure was premature — reopened on the same Issue ID." },
    ],
    investigationDue: "2026-08-06",
    immediateAction: "Daily follow-up with transporter; owner informed of revised date.",
    launchImpact: "Installation slips by 2 days; training date at risk",
    launchDate: "2026-08-11",
    nextAction: "Confirm delivery on 2026-08-06 and update Project Coordinator",
    nextActionDue: "2026-08-06",
    machineLoss: false,
    wholeShipmentMissing: false,
    launchBlocked: false,
    reopened: true,
    financialAdjustment: false,
    history: [
      { at: "2026-08-03 19:05", by: "Neha Sharma", action: "Issue ISS-0418 reported — Delivery Delay on DSP-000109." },
      { at: "2026-08-04 08:00", by: "Neha Sharma", action: "Marked resolved after transporter assurance." },
      { at: "2026-08-04 18:00", by: "Neha Sharma", action: "Reopened on the same Issue ID — shipment still undelivered. Earlier history preserved." },
    ],
  },
  {
    issueId: "ISS-0415",
    dispatchId: "DSP-000104",
    clearanceId: "CLR-1019",
    projectId: "PRJ-000002",
    packingTaskId: "PKT-000203",
    store: "Clean Craft Indore Vijay Nagar",
    city: "Indore",
    platform: "Shiprocket",
    bookingRef: "SRK-70011",
    awb: "AWB 7711998120",
    type: "Wrong Quantity",
    itemAffected: "Consumables starter kit",
    packageNo: "PKG-3",
    itemType: "Consumables",
    qtyAffected: 1,
    description: "Owner reported one extra hanger bundle received against the approved quantity.",
    reportedBy: "Ankit Verma",
    reportedAt: "2026-07-29 17:00",
    priority: "normal",
    status: "closed",
    owner: "Ankit Verma",
    responsibility: "Packing Issue",
    responsibilityApproved: true,
    photos: 2,
    documents: ["Owner photo statement (placeholder)"],
    recipientComments: "One extra bundle received; happy to keep it recorded.",
    packingEvidence: "PKT-000203 · checklist complete; count mismatch traced to pick list",
    dispatchEvidence: "AWB 7711998120 · 3 packages dispatched",
    deliveryEvidence: "DSP-000104 · delivered in full, closed 2026-07-29",
    investigation: Object.fromEntries(INVESTIGATION_POINTS.map((p) => [p.key, true])),
    investigationNotes: [
      { at: "2026-07-30 09:30", by: "Ankit Verma", note: "Extra bundle confirmed against pick list; adjusted in records with Accounts note." },
    ],
    investigationDue: "2026-07-30",
    immediateAction: "Quantity adjusted in dispatch records; Accounts informed.",
    launchImpact: "No launch impact",
    launchDate: "2026-08-05",
    nextAction: "None",
    nextActionDue: "2026-07-31",
    machineLoss: false,
    wholeShipmentMissing: false,
    launchBlocked: false,
    reopened: false,
    financialAdjustment: true,
    resolution: {
      rootCause: "Pick-list quantity for hanger bundles read incorrectly at the warehouse.",
      actionCompleted: "Record adjusted; owner retained the extra bundle with Accounts note.",
      replacementOrReturnStatus: "Not required",
      recipientConfirmation: "Owner confirmed in writing",
      coordinatorConfirmation: "Not required",
      preventiveAction: "Second-person count check added for consumable bundles.",
      resolvedOn: "2026-07-30",
      evidence: "Owner statement, adjusted dispatch record",
    },
    history: [
      { at: "2026-07-29 17:00", by: "Ankit Verma", action: "Issue ISS-0415 reported — Wrong Quantity on DSP-000104." },
      { at: "2026-07-30 10:00", by: "Ankit Verma", action: "Resolved with preventive action." },
      { at: "2026-07-31 09:00", by: "Logistics Manager", action: "Issue closed. Investigation and resolution history preserved." },
    ],
  },
];

/** Dispatch records available for reporting a new issue (shared dispatch/delivery data). */
export const DISPATCH_OPTIONS = [
  { dispatchId: "DSP-000117", clearanceId: "CLR-1037", projectId: "PRJ-000013", packingTaskId: "PKT-000230", store: "Clean Craft Surat", city: "Surat", platform: "Shiprocket", bookingRef: "SRK-88231", awb: "AWB 7712004431", launchDate: "2026-08-09" },
  { dispatchId: "DSP-000115", clearanceId: "CLR-1033", projectId: "PRJ-000012", packingTaskId: "PKT-000224", store: "Clean Craft Nagpur", city: "Nagpur", platform: "WheelsEye", bookingRef: "WE-55120", awb: "LR 44120-NG", launchDate: "2026-08-10" },
  { dispatchId: "DSP-000121", clearanceId: "CLR-1041", projectId: "PRJ-000018", packingTaskId: "PKT-000239", store: "Clean Craft Jaipur", city: "Jaipur", platform: "WheelsEye", bookingRef: "WE-56010", awb: "Pending booking", launchDate: "2026-08-18" },
  { dispatchId: "DSP-000112", clearanceId: "CLR-1030", projectId: "PRJ-000009", packingTaskId: "PKT-000218", store: "Clean Craft Kanpur", city: "Kanpur", platform: "Local Transporter", bookingRef: "SRL-2210", awb: "LR 2210-KNP", launchDate: "2026-08-13" },
];
