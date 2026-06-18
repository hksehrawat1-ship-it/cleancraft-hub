import { createFileRoute } from "@tanstack/react-router";
import { EntityPage } from "@/components/entity-page";

export const Route = createFileRoute("/_authenticated/stores")({
  head: () => ({ meta: [{ title: "Stores — Clean Craft OS" }] }),
  component: () => (
    <EntityPage
      title="Stores"
      description="All franchise stores and their current health."
      table="stores"
      ownerField="created_by"
      defaults={{ status: "setup" }}
      badgeField="status"
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "city", label: "City" },
        { key: "owner_name", label: "Owner" },
        { key: "status", label: "Status" },
        { key: "opening_date", label: "Opening" },
      ]}
      fields={[
        { name: "code", label: "Store code" },
        { name: "name", label: "Store name", required: true },
        { name: "city", label: "City" },
        { name: "owner_name", label: "Owner name" },
        { name: "owner_phone", label: "Owner phone", type: "tel" },
        { name: "status", label: "Status", type: "select", options: ["setup", "opening", "live", "red", "closed"] },
        { name: "opening_date", label: "Opening date", type: "date" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});
