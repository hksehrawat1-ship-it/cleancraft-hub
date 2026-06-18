import { createFileRoute } from "@tanstack/react-router";
import { EntityPage } from "@/components/entity-page";

export const Route = createFileRoute("/_authenticated/complaints")({
  head: () => ({ meta: [{ title: "Complaints — Clean Craft OS" }] }),
  component: () => (
    <EntityPage
      title="Complaints"
      description="Store and customer complaints."
      table="complaints"
      ownerField="raised_by"
      defaults={{ status: "open", severity: "medium" }}
      badgeField="status"
      columns={[
        { key: "title", label: "Title" },
        { key: "severity", label: "Severity" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Raised", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "urgent"] },
        { name: "status", label: "Status", type: "select", options: ["open", "in_progress", "resolved", "closed"] },
      ]}
    />
  ),
});
