import { createFileRoute } from "@tanstack/react-router";
import { PerfMktPlaceholder } from "@/components/perf-mkt/placeholder";

export const Route = createFileRoute("/_authenticated/performance-marketing/influencers")({
  head: () => ({
    meta: [
      { title: "Influencers & YouTubers — Performance Marketing" },
      {
        name: "description",
        content: "Influencer and YouTuber collaborations mapped to each franchise store.",
      },
      { property: "og:title", content: "Influencers & YouTubers — Performance Marketing" },
      { property: "og:description", content: "Influencer activity and status per store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="Influencers & YouTubers"
      description="Collaborations per store, linked by Store ID."
    />
  ),
});
