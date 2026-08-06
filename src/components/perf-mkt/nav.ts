import {
  LayoutDashboard,
  Store,
  Inbox,
  Megaphone,
  Image,
  MapPin,
  Video,
  Users,
  TrendingUp,
} from "lucide-react";

export type PerfMktNavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

/** Final Performance Marketing Executive side menu. Store ID is the common link across every page. */
export const PERF_MKT_NAV: PerfMktNavItem[] = [
  { to: "/performance-marketing/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/performance-marketing/stores", label: "My Stores", icon: Store },
  { to: "/performance-marketing/requests", label: "Marketing Requests", icon: Inbox },
  { to: "/performance-marketing/campaigns", label: "Google & Meta Campaigns", icon: Megaphone },
  { to: "/performance-marketing/creatives", label: "Creatives & Graphics", icon: Image },
  { to: "/performance-marketing/profiles", label: "Google Business & Social Profiles", icon: MapPin },
  { to: "/performance-marketing/influencers", label: "Influencers & YouTubers", icon: Video },
  { to: "/performance-marketing/leads-sales", label: "Leads & Sales Results", icon: Users },
  { to: "/performance-marketing/performance", label: "Performance", icon: TrendingUp },
];
