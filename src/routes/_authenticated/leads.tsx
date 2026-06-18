import { createFileRoute } from "@tanstack/react-router";
import { EntityPage } from "@/components/entity-page";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads — Clean Craft OS" }] }),
  component: () => (
    <EntityPage
      title="Leads"
      description="Franchise & inquiry pipeline."
      table="leads"
      ownerField="created_by"
      defaults={{ status: "new" }}
      badgeField="status"
      columns={[
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "city", label: "City" },
        { key: "source", label: "Source" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "phone", label: "Phone", type: "tel" },
        { name: "email", label: "Email", type: "email" },
        { name: "city", label: "City" },
        { name: "source", label: "Source" },
        { name: "status", label: "Status", type: "select", options: ["new", "hot", "warm", "cold", "converted", "lost"] },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});
