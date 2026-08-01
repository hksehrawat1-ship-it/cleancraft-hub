import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Ticket,
  ListOrdered,
  MonitorPlay,
  Bell,
  BookOpen,
  TrendingUp,
  Headphones,
  Search,
} from "lucide-react";
import { TechSupportDashboard } from "@/components/tech-support/dashboard";
import { MySupportTickets } from "@/components/tech-support/my-tickets";
import { TechSupportPriorityQueue } from "@/components/tech-support/priority-queue";
import { RemoteTroubleshooting } from "@/components/tech-support/remote-troubleshooting";
import { TechSupportFollowUps } from "@/components/tech-support/follow-ups";
import { TechSupportPerformance } from "@/components/tech-support/performance";

export const Route = createFileRoute("/_authenticated/technical-support")({
  head: () => ({
    meta: [
      { title: "Technical Support — Clean Craft OS" },
      { name: "description", content: "Technical Support employee dashboard" },
    ],
  }),
  component: TechnicalSupportDashboard,
});

type SectionKey =
  | "dashboard"
  | "tickets"
  | "priority"
  | "remote"
  | "followups"
  | "knowledge"
  | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tickets", label: "My Support Tickets", icon: Ticket },
  { key: "priority", label: "Priority Queue", icon: ListOrdered },
  { key: "remote", label: "Remote Troubleshooting", icon: MonitorPlay },
  { key: "followups", label: "Follow-ups & Reminders", icon: Bell },
  { key: "knowledge", label: "Knowledge Centre", icon: BookOpen },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function TechnicalSupportDashboard() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold flex items-center gap-2">
            <Headphones className="w-4 h-4 text-primary" />
            Technical Support
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {active === "dashboard" && <TechSupportDashboard />}
        {active === "tickets" && <MySupportTickets />}
        {active === "priority" && <TechSupportPriorityQueue />}
        {active === "remote" && <RemoteTroubleshooting />}
        {active === "followups" && <TechSupportFollowUps />}
        {active === "knowledge" && <KnowledgeSection />}
        {active === "performance" && <TechSupportPerformance />}
      </main>
    </div>
  );
}

/* ---------------- Knowledge Centre ---------------- */
function KnowledgeSection() {
  const articles = [
    { title: "POS Sync Troubleshooting", category: "POS", reads: 124 },
    { title: "Steam Iron Pressure Guide", category: "Machine", reads: 89 },
    { title: "Payment Gateway Error Codes", category: "Payments", reads: 156 },
    { title: "Generator Auto-Start Setup", category: "Electrical", reads: 67 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Centre</h1>
          <p className="text-sm text-muted-foreground">Approved SOPs and troubleshooting guides.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-9 w-64" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {articles.map((a, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex items-start justify-between">
              <div>
                <div className="font-medium text-sm">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.reads} reads · {a.category}</div>
              </div>
              <Button size="sm" variant="ghost">Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
