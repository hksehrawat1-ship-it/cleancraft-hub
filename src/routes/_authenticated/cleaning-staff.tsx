import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/support-staff/staff-shell";

export const Route = createFileRoute("/_authenticated/cleaning-staff")({
  head: () => ({
    meta: [
      { title: "Cleaning Staff — Clean Craft OS" },
      {
        name: "description",
        content:
          "Cleaning Staff workspace for daily cleaning tasks, cleaning supply requests and safety help.",
      },
      { property: "og:title", content: "Cleaning Staff — Clean Craft OS" },
      {
        property: "og:description",
        content: "See today's cleaning tasks, request supplies and report problems.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <StaffShell role="cleaning" />,
});
