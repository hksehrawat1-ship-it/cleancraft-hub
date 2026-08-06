import { createFileRoute } from "@tanstack/react-router";
import { PerfMktPlaceholder } from "@/components/perf-mkt/placeholder";

export const Route = createFileRoute("/_authenticated/performance-marketing/stores")({
  head: () => ({
    meta: [
      { title: "My Stores — Performance Marketing" },
      {
        name: "description",
        content: "Franchise stores assigned to you, linked by Store ID across all marketing work.",
      },
      { property: "og:title", content: "My Stores — Performance Marketing" },
      { property: "og:description", content: "Assigned Clean Craft franchise stores by Store ID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="My Stores"
      description="Only the franchise stores assigned to you, linked by Store ID."
    />
  ),
});
