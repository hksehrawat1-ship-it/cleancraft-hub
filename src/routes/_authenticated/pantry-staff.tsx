import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/support-staff/staff-shell";

export const Route = createFileRoute("/_authenticated/pantry-staff")({
  head: () => ({
    meta: [
      { title: "Pantry Staff — Clean Craft OS" },
      {
        name: "description",
        content: "Pantry Staff workspace for daily tasks, pantry supply requests and help guides.",
      },
      { property: "og:title", content: "Pantry Staff — Clean Craft OS" },
      {
        property: "og:description",
        content: "See today's pantry tasks, request supplies and report problems.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <StaffShell role="pantry" />,
});
