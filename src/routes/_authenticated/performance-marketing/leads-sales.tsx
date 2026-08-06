import { createFileRoute } from "@tanstack/react-router";
import { LeadsSalesPage } from "@/components/perf-mkt/leads";


export const Route = createFileRoute("/_authenticated/performance-marketing/leads-sales")({
  head: () => ({
    meta: [
      { title: "Leads & Sales Results — Performance Marketing" },
      {
        name: "description",
        content: "Enquiries, orders and sales outcomes generated for each franchise store.",
      },
      { property: "og:title", content: "Leads & Sales Results — Performance Marketing" },
      { property: "og:description", content: "Marketing-driven enquiries, orders and sales by store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PerfMktPlaceholder
      title="Leads & Sales Results"
      description="Enquiries, orders and sales per store — one shared lead record, no copies."
    />
  ),
});
