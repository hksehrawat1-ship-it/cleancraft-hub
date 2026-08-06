import { createFileRoute } from "@tanstack/react-router";
import { PerfMktCampaigns } from "@/components/perf-mkt/campaigns";


export const Route = createFileRoute("/_authenticated/performance-marketing/campaigns")({
  head: () => ({
    meta: [
      { title: "Google & Meta Campaigns — Performance Marketing" },
      {
        name: "description",
        content: "Store-wise Google and Meta ad campaigns, budgets and running status.",
      },
      { property: "og:title", content: "Google & Meta Campaigns — Performance Marketing" },
      { property: "og:description", content: "Paid campaign activity per franchise store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="Google & Meta Campaigns"
      description="Paid campaigns per store, linked by Store ID."
    />
  ),
});
