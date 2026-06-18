export const ROLES = [
  { value: "ceo", label: "CEO" },
  { value: "coo", label: "COO" },
  { value: "sales_executive", label: "Sales Executive" },
  { value: "sales_coordinator", label: "Sales Coordinator" },
  { value: "project_coordinator", label: "Project Coordinator" },
  { value: "project_manager", label: "Project Manager" },
  { value: "launch_training_executive", label: "Launch & Training Executive" },
  { value: "institute_head", label: "Institute Head" },
  { value: "relationship_manager", label: "Relationship Manager" },
  { value: "performance_marketing_executive", label: "Performance Marketing Executive" },
  { value: "btl_executive", label: "BTL Executive" },
  { value: "crm_retention_executive", label: "CRM & Retention Executive" },
  { value: "supply_chain_logistics_executive", label: "Supply Chain & Logistics Executive" },
  { value: "accountant", label: "Accountant" },
  { value: "social_media_manager", label: "Social Media Manager" },
  { value: "video_editor", label: "Video Editor" },
] as const;

export type RoleValue = (typeof ROLES)[number]["value"];

export const DEPARTMENTS = [
  "Leadership",
  "Sales",
  "Projects",
  "Launch & Training",
  "Institute",
  "Marketing",
  "BTL",
  "CRM & Retention",
  "Supply Chain & Logistics",
  "Finance",
  "Content",
  "Operations",
];

export function roleLabel(value: string | null | undefined) {
  return ROLES.find((r) => r.value === value)?.label ?? value ?? "—";
}

export const LEADERSHIP_ROLES: RoleValue[] = ["ceo", "coo"];
