import { createFileRoute } from "@tanstack/react-router";
import { EntityPage } from "@/components/entity-page";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments — Clean Craft OS" }] }),
  component: () => (
    <EntityPage
      title="Payments"
      description="Payment clearances tracked by status and due date."
      table="payments"
      defaults={{ status: "pending", amount: 0 }}
      badgeField="status"
      columns={[
        { key: "description", label: "Description" },
        { key: "due_date", label: "Due" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "description", label: "Description", required: true },
        { name: "due_date", label: "Due date", type: "date" },
        { name: "status", label: "Status", type: "select", options: ["pending", "paid", "overdue", "cancelled"] },
      ]}
    />
  ),
});
