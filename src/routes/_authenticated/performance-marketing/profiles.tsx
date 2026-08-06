import { createFileRoute } from "@tanstack/react-router";
import { PerfMktPlaceholder } from "@/components/perf-mkt/placeholder";

export const Route = createFileRoute("/_authenticated/performance-marketing/profiles")({
  head: () => ({
    meta: [
      { title: "Google Business & Social Profiles — Performance Marketing" },
      {
        name: "description",
        content: "Google Business Profile and social account health for each franchise store.",
      },
      { property: "og:title", content: "Google Business & Social Profiles — Performance Marketing" },
      { property: "og:description", content: "GMB and social profile upkeep per store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="Google Business & Social Profiles"
      description="Profile health and updates per store, linked by Store ID."
    />
  ),
});
