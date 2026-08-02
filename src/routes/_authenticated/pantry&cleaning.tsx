import { createFileRoute } from "@tanstack/react-router";
import { PantryCleaningDashboard } from "@/components/support-staff/pantry-cleaning-dashboard";


export const Route = createFileRoute("/_authenticated/pantry&cleaning")({
  head: () => ({
    meta: [
      { title: "Pantry & Cleaning Staff — Clean Craft OS" },
      {
        name: "description",
        content:
          "Combined Pantry and Cleaning Staff workspace for daily tasks, supply requests, problem reports and help guides.",
      },
      { property: "og:title", content: "Pantry & Cleaning Staff — Clean Craft OS" },
      {
        property: "og:description",
        content: "Switch between pantry and cleaning duties, request supplies and report problems.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <StaffShell role="pantry" roles={["pantry", "cleaning"]} title="Pantry & Cleaning Staff" />
  ),
});
