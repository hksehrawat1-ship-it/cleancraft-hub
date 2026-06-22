import {
  Megaphone,
  Video,
  Briefcase,
  UserCheck,
  ClipboardList,
  HardHat,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  Tent,
  MessageSquare,
  Cpu,
  Calculator,
  Truck,
  Package,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type CeoItem = { key: string; label: string; icon: LucideIcon; blurb: string };
export type CeoGroup = { key: string; label: string; icon: LucideIcon; items: CeoItem[] };

export const CEO_GROUPS: CeoGroup[] = [
  {
    key: "revenue",
    label: "Revenue Engine",
    icon: TrendingUp,
    items: [
      { key: "smm", label: "Social Media Account Manager", icon: Megaphone, blurb: "Content calendar, reach, engagement, lead generation from organic social." },
      { key: "video", label: "Video Editor", icon: Video, blurb: "Edit pipeline, deliverables, turnaround time, asset library." },
      { key: "sales-head", label: "Sales Head", icon: Briefcase, blurb: "Team pipeline, conversion %, revenue forecast, coaching notes." },
      { key: "sales-exec", label: "Sales Executive", icon: UserCheck, blurb: "Personal leads, follow-ups, bookings, win rate vs target." },
    ],
  },
  {
    key: "ops",
    label: "Operation Engine",
    icon: ClipboardList,
    items: [
      { key: "proj-coord", label: "Project Coordinator", icon: ClipboardList, blurb: "Project intake, scheduling, vendor coordination, status reports." },
      { key: "proj-mgr", label: "Project Manager", icon: HardHat, blurb: "Active sites, milestones, risk log, on-time delivery rate." },
      { key: "tnl", label: "Trainer & Launch Executive", icon: GraduationCap, blurb: "Launch plan, training completion, store readiness checklist." },
    ],
  },
  {
    key: "store-success",
    label: "Store Success Engine",
    icon: HeartHandshake,
    items: [
      { key: "rm", label: "Relationship Manager", icon: HeartHandshake, blurb: "Store health, NPS, escalations, monthly review notes." },
      { key: "perf-mkt", label: "Performance Marketing Executive", icon: TrendingUp, blurb: "Ad spend, CAC, ROAS, campaign performance by store." },
      { key: "btl", label: "BTL Executive", icon: Tent, blurb: "Activations, footfall generated, cost per lead, geo coverage." },
      { key: "crm", label: "CRM Executive", icon: MessageSquare, blurb: "Retention cohorts, repeat rate, win-back campaigns, churn signals." },
    ],
  },
  {
    key: "tech",
    label: "Tech Engine",
    icon: Cpu,
    items: [
      { key: "engineer", label: "Engineer", icon: Cpu, blurb: "Sprint board, uptime, incidents, release notes." },
    ],
  },
  {
    key: "accounts",
    label: "Accounts",
    icon: Calculator,
    items: [
      { key: "accounts-master", label: "Accounts Master", icon: Calculator, blurb: "Books overview, ledgers, GST, audit-ready reports." },
      { key: "accounts-exec", label: "Accounts Executive", icon: Calculator, blurb: "Daily entries, receivables, payables, reconciliation." },
    ],
  },
  {
    key: "supply",
    label: "Supply Chain & Logistics",
    icon: Truck,
    items: [
      { key: "logistics", label: "Logistic Executive", icon: Truck, blurb: "Dispatches, in-transit, delivery SLA, freight cost." },
      { key: "packing", label: "Packing Boy", icon: Package, blurb: "Daily packed units, defects, pending orders, productivity." },
    ],
  },
  {
    key: "facility",
    label: "Facility",
    icon: Building2,
    items: [
      { key: "facility-mgr", label: "Facility Manager", icon: Building2, blurb: "Maintenance log, utilities, vendor AMC status, compliance." },
    ],
  },
];
