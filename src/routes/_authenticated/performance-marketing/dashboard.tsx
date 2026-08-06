import { createFileRoute } from "@tanstack/react-router";
import { PerfMktDashboard } from "@/components/perf-mkt/dashboard";


export const Route = createFileRoute("/_authenticated/performance-marketing/dashboard")({
  head: () => ({
    meta: [
      { title: "Performance Marketing Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "Daily snapshot of assigned Clean Craft franchise stores, marketing requests and campaign activity.",
      },
      { property: "og:title", content: "Performance Marketing Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content: "Track store enquiries, orders and sales growth across assigned franchise stores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="Dashboard"
      description="Marketing for your assigned franchise stores — enquiries, orders and sales growth."
    />
  ),
});
