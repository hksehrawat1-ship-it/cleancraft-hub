import { createFileRoute } from "@tanstack/react-router";
import { PerfMktPlaceholder } from "@/components/perf-mkt/placeholder";

export const Route = createFileRoute("/_authenticated/performance-marketing/creatives")({
  head: () => ({
    meta: [
      { title: "Creatives & Graphics — Performance Marketing" },
      {
        name: "description",
        content: "Creative requests, graphics and ad assets prepared for each franchise store.",
      },
      { property: "og:title", content: "Creatives & Graphics — Performance Marketing" },
      { property: "og:description", content: "Ad creatives and graphics per franchise store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="Creatives & Graphics"
      description="Creative and graphic assets per store, linked by Store ID."
    />
  ),
});
