import { createFileRoute } from "@tanstack/react-router";
import { PerfMktCreatives } from "@/components/perf-mkt/creatives";

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
  component: PerfMktCreatives,
});

