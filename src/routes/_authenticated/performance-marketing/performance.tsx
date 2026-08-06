import { createFileRoute } from "@tanstack/react-router";
import { PerfMktPlaceholder } from "@/components/perf-mkt/placeholder";

export const Route = createFileRoute("/_authenticated/performance-marketing/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Performance Marketing" },
      {
        name: "description",
        content: "Your marketing performance across assigned Clean Craft franchise stores.",
      },
      { property: "og:title", content: "Performance — Performance Marketing" },
      { property: "og:description", content: "Executive performance metrics for assigned stores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="Performance"
      description="Your results across assigned stores, calculated from actual records."
    />
  ),
});
