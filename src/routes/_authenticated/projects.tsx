import { createFileRoute } from "@tanstack/react-router";
import { EntityPage } from "@/components/entity-page";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — Clean Craft OS" }] }),
  component: () => (
    <EntityPage
      title="Projects"
      description="Store setup & launch projects."
      table="projects"
      defaults={{ status: "planning", delayed: false }}
      badgeField="status"
      columns={[
        { key: "name", label: "Project" },
        { key: "status", label: "Status" },
        { key: "planned_start", label: "Start" },
        { key: "planned_end", label: "End" },
        { key: "delayed", label: "Delayed", render: (v) => v ? "Yes" : "No" },
      ]}
      fields={[
        { name: "name", label: "Project name", required: true },
        { name: "status", label: "Status", type: "select", options: ["planning", "in_progress", "delayed", "completed", "on_hold"] },
        { name: "planned_start", label: "Planned start", type: "date" },
        { name: "planned_end", label: "Planned end", type: "date" },
        { name: "actual_end", label: "Actual end", type: "date" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});
