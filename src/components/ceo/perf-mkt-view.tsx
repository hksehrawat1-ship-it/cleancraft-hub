import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  Megaphone,
  Users,
  ClipboardList,
  Star,
  CheckCircle2,
  Clock,
  ChevronDown,
} from "lucide-react";

type CampaignStatus = "running" | "updated" | "pending";
type InfluencerStatus = "live" | "pending" | "completed";

type StoreAssignment = {
  name: string;
  influencers: number;
  status: InfluencerStatus;
};

type PerfMkt = {
  name: string;
  storePerf: { managed: number; growing: number; attention: number; declining: number };
  campaigns: {
    google: CampaignStatus;
    meta: CampaignStatus;
    gmb: CampaignStatus;
    influencer: { status: CampaignStatus; pending: number };
  };
  influencers: { contacted: number; live: number; pending: number; completed: number };
  stores: StoreAssignment[];
  tasks: { assigned: number; completed: number; pending: number };
  gmb: { created: number; total: number; reviews: number; rating: number; pending: number };
};

const PMS: PerfMkt[] = [
  {
    name: "Nikhil Arora",
    storePerf: { managed: 22, growing: 18, attention: 3, declining: 1 },
    campaigns: {
      google: "running",
      meta: "running",
      gmb: "updated",
      influencer: { status: "pending", pending: 2 },
    },
    influencers: { contacted: 15, live: 9, pending: 3, completed: 3 },
    stores: [
      { name: "Jaipur", influencers: 4, status: "live" },
      { name: "Indore", influencers: 3, status: "live" },
      { name: "Lucknow", influencers: 2, status: "pending" },
      { name: "Surat", influencers: 3, status: "completed" },
      { name: "Mumbai", influencers: 3, status: "live" },
    ],
    tasks: { assigned: 24, completed: 23, pending: 1 },
    gmb: { created: 22, total: 22, reviews: 118, rating: 4.8, pending: 2 },
  },
  {
    name: "Ritika Bansal",
    storePerf: { managed: 18, growing: 14, attention: 3, declining: 1 },
    campaigns: {
      google: "running",
      meta: "running",
      gmb: "updated",
      influencer: { status: "running", pending: 0 },
    },
    influencers: { contacted: 12, live: 7, pending: 2, completed: 3 },
    stores: [
      { name: "Delhi", influencers: 3, status: "live" },
      { name: "Pune", influencers: 2, status: "completed" },
      { name: "Bhopal", influencers: 3, status: "live" },
      { name: "Nashik", influencers: 2, status: "pending" },
      { name: "Nagpur", influencers: 2, status: "live" },
    ],
    tasks: { assigned: 20, completed: 18, pending: 2 },
    gmb: { created: 18, total: 18, reviews: 96, rating: 4.7, pending: 1 },
  },
  {
    name: "Aakash Menon",
    storePerf: { managed: 16, growing: 11, attention: 3, declining: 2 },
    campaigns: {
      google: "running",
      meta: "pending",
      gmb: "updated",
      influencer: { status: "pending", pending: 3 },
    },
    influencers: { contacted: 10, live: 5, pending: 3, completed: 2 },
    stores: [
      { name: "Kochi", influencers: 2, status: "live" },
      { name: "Chennai", influencers: 2, status: "pending" },
      { name: "Coimbatore", influencers: 2, status: "live" },
      { name: "Vizag", influencers: 2, status: "pending" },
      { name: "Hyderabad", influencers: 2, status: "completed" },
    ],
    tasks: { assigned: 18, completed: 15, pending: 3 },
    gmb: { created: 15, total: 16, reviews: 72, rating: 4.5, pending: 3 },
  },
  {
    name: "Sanya Kapoor",
    storePerf: { managed: 20, growing: 16, attention: 3, declining: 1 },
    campaigns: {
      google: "running",
      meta: "running",
      gmb: "pending",
      influencer: { status: "running", pending: 1 },
    },
    influencers: { contacted: 14, live: 8, pending: 4, completed: 2 },
    stores: [
      { name: "Chandigarh", influencers: 3, status: "live" },
      { name: "Ludhiana", influencers: 3, status: "live" },
      { name: "Amritsar", influencers: 2, status: "pending" },
      { name: "Jalandhar", influencers: 3, status: "completed" },
      { name: "Panipat", influencers: 3, status: "pending" },
    ],
    tasks: { assigned: 22, completed: 20, pending: 2 },
    gmb: { created: 20, total: 20, reviews: 104, rating: 4.6, pending: 2 },
  },
  {
    name: "Yash Malhotra",
    storePerf: { managed: 14, growing: 9, attention: 3, declining: 2 },
    campaigns: {
      google: "pending",
      meta: "running",
      gmb: "updated",
      influencer: { status: "pending", pending: 4 },
    },
    influencers: { contacted: 8, live: 3, pending: 4, completed: 1 },
    stores: [
      { name: "Kolkata", influencers: 2, status: "pending" },
      { name: "Guwahati", influencers: 1, status: "pending" },
      { name: "Patna", influencers: 2, status: "live" },
      { name: "Ranchi", influencers: 1, status: "completed" },
      { name: "Bhubaneswar", influencers: 2, status: "pending" },
    ],
    tasks: { assigned: 16, completed: 12, pending: 4 },
    gmb: { created: 12, total: 14, reviews: 58, rating: 4.3, pending: 4 },
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function campaignBadge(s: CampaignStatus, label?: string) {
  if (s === "running") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
        <span>🟢</span> {label ?? "Running"}
      </span>
    );
  }
  if (s === "updated") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
        <span>🟢</span> {label ?? "Updated"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
      <span>🟡</span> {label ?? "Pending"}
    </span>
  );
}

function influencerBadge(s: InfluencerStatus) {
  if (s === "live")
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium">
        Live
      </span>
    );
  if (s === "completed")
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 font-medium">
        Completed
      </span>
    );
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-medium">
      Pending
    </span>
  );
}

export function PerfMktCeoView() {
  const [idx, setIdx] = useState(0);
  const [storesOpen, setStoresOpen] = useState(false);
  const pm = PMS[idx];
  const completion = Math.round((pm.tasks.completed / pm.tasks.assigned) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Performance Marketing Executive Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PMS.map((p, i) => {
          const active = i === idx;
          return (
            <button
              key={p.name}
              onClick={() => {
                setIdx(i);
                setStoresOpen(false);
              }}
              className={`text-left rounded-lg border p-3 transition-colors ${
                active
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                  {initials(p.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.storePerf.managed} stores
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" /> Store Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Stores Managed</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {pm.storePerf.managed}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Growing
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {pm.storePerf.growing}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="w-3.5 h-3.5 text-amber-600" /> Need Attention
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                {pm.storePerf.attention}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="w-3.5 h-3.5 text-red-600" /> Declining
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-red-600">
                {pm.storePerf.declining}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" /> Campaign Status
          </CardTitle>
          <p className="text-xs text-muted-foreground">Pre-marketing activity status</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Google Ads</div>
              <div className="mt-1">{campaignBadge(pm.campaigns.google)}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Meta Ads</div>
              <div className="mt-1">{campaignBadge(pm.campaigns.meta)}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">GMB</div>
              <div className="mt-1">{campaignBadge(pm.campaigns.gmb)}</div>
            </div>
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Influencer Campaigns</div>
              <div className="mt-1">
                {campaignBadge(
                  pm.campaigns.influencer.status,
                  pm.campaigns.influencer.pending > 0
                    ? `${pm.campaigns.influencer.pending} Pending`
                    : "Running",
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Influencers Contacted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Contacted</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {pm.influencers.contacted}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Campaigns Live</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {pm.influencers.live}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
              <div className="text-xs text-muted-foreground">Pending</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                {pm.influencers.pending}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-sky-500/10 border-sky-500/30">
              <div className="text-xs text-muted-foreground">Completed</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-sky-600">
                {pm.influencers.completed}
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => setStoresOpen((v) => !v)}
              className="w-full flex items-center justify-between border rounded-md p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="text-sm font-medium">
                Assigned Stores ({pm.stores.length})
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${storesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {storesOpen && (
              <div className="mt-2 border rounded-md divide-y">
                {pm.stores.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-3 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium truncate">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        · {s.influencers} influencer{s.influencers === 1 ? "" : "s"}
                      </span>
                    </div>
                    {influencerBadge(s.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> Tasks Assigned
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Assigned</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {pm.tasks.assigned}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Completed</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {pm.tasks.completed}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
              <div className="text-xs text-muted-foreground">Pending</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                {pm.tasks.pending}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-sky-500/10 border-sky-500/30">
              <div className="text-xs text-muted-foreground">Completion</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-sky-600">
                {completion}%
              </div>
            </div>
          </div>
          <Progress value={completion} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> GMB Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profiles Created
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {pm.gmb.created}
                <span className="text-sm text-muted-foreground font-medium">
                  /{pm.gmb.total}
                </span>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground">Reviews Added</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{pm.gmb.reviews}</div>
            </div>
            <div className="border rounded-md p-3 bg-emerald-500/10 border-emerald-500/30">
              <div className="text-xs text-muted-foreground">Average Rating</div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
                {pm.gmb.rating.toFixed(1)}{" "}
                <span className="text-base">⭐</span>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" /> Pending Updates
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1 text-amber-600">
                {pm.gmb.pending}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
