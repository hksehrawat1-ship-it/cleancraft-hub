import { createFileRoute } from "@tanstack/react-router";
import { MarketingRequestsPage } from "@/components/perf-mkt/requests";


export const Route = createFileRoute("/_authenticated/performance-marketing/requests")({
  head: () => ({
    meta: [
      { title: "Marketing Requests — Performance Marketing" },
      {
        name: "description",
        content: "Store-specific marketing requests raised by Relationship Managers.",
      },
      { property: "og:title", content: "Marketing Requests — Performance Marketing" },
      {
        property: "og:description",
        content: "Requests from Relationship Managers for stores under their responsibility.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarketingRequestsPage,
});

