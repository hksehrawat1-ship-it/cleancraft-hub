import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/performance-marketing/")({
  beforeLoad: () => {
    throw redirect({ to: "/performance-marketing/dashboard" });
  },
});
