import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/support-staff/staff-shell";

export const Route = createFileRoute("/_authenticated/packing-staff")({
  head: () => ({
    meta: [
      { title: "Packing Staff — Clean Craft OS" },
      {
        name: "description",
        content:
          "Packing Staff workspace for packing tasks, packing material requests and quality guides.",
      },
      { property: "og:title", content: "Packing Staff — Clean Craft OS" },
      {
        property: "og:description",
        content: "See today's packing tasks, request materials and report problems.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <StaffShell role="packing" />,
});
