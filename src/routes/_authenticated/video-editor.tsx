import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Film,
  Send,
  AlertTriangle,
  FolderOpen,
  TrendingUp,
  Video,
} from "lucide-react";
import { VeMyVideosPage, stageTone } from "@/components/video-editor/my-videos";
import { VeSubmitPage } from "@/components/video-editor/submit-review";
import { VeCorrectionsPage } from "@/components/video-editor/corrections";
import { VeAssetsPage } from "@/components/video-editor/assets";
import { VePerformancePage } from "@/components/video-editor/performance";
import { SectionHead } from "@/components/video-editor/ui";
import { VIDEO_JOBS, CORRECTIONS, SUBMISSIONS } from "@/components/video-editor/data";

export const Route = createFileRoute("/_authenticated/video-editor")({
  head: () => ({
    meta: [
      { title: "Video Editor Dashboard — Clean Craft OS" },
      {
        name: "description",
        content:
          "Video Editor workspace: assigned videos, submit for review, corrections, brand assets and delivery performance.",
      },
      { property: "og:title", content: "Video Editor Dashboard — Clean Craft OS" },
      {
        property: "og:description",
        content: "Track edits, submit cuts for approval, clear corrections and measure turnaround.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideoEditorDashboard,
});

type SectionKey = "dashboard" | "videos" | "submit" | "corrections" | "assets" | "performance";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "videos", label: "My Videos", icon: Film },
  { key: "submit", label: "Submit for Review", icon: Send },
  { key: "corrections", label: "Corrections", icon: AlertTriangle },
  { key: "assets", label: "Assets & Guidelines", icon: FolderOpen },
  { key: "performance", label: "Performance", icon: TrendingUp },
];

function VideoEditorDashboard() {
  const [active, setActive] = useState<SectionKey>("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:block">
        <div className="p-4 border-b">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Employee</div>
          <div className="font-semibold">Video Editor</div>
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

      <div className="flex-1 min-w-0">
        <div className="md:hidden border-b bg-background p-3">
          <Select value={active} onValueChange={(v) => setActive(v as SectionKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NAV.map((n) => (
                <SelectItem key={n.key} value={n.key}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <main className="p-4 md:p-6 overflow-auto">
          {active === "dashboard" && <DashboardSection />}
          {active === "videos" && <VeMyVideosPage />}
          {active === "submit" && <VeSubmitPage />}
          {active === "corrections" && <VeCorrectionsPage />}
          {active === "assets" && <VeAssetsPage />}
          {active === "performance" && <VePerformancePage />}
        </main>
      </div>
    </div>
  );
}

function DashboardSection() {
  const inEditing = VIDEO_JOBS.filter((j) => ["Rough Cut", "Editing"].includes(j.stage)).length;
  const inReview = SUBMISSIONS.filter((s) => s.status === "In Review").length;
  const openCorrections = CORRECTIONS.filter((c) => !c.done).length;
  const overdue = VIDEO_JOBS.filter((j) => j.overdue).length;
  const dueToday = VIDEO_JOBS.filter((j) => j.due === "Today");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-primary" />
        <SectionHead title="Dashboard" sub="Your edit pipeline for today." />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Assigned Videos", v: String(VIDEO_JOBS.length), s: "Active queue" },
          { l: "In Editing", v: String(inEditing), s: "Rough cut + editing" },
          { l: "Waiting Approval", v: String(inReview), s: "Submitted for review" },
          { l: "Open Corrections", v: String(openCorrections), s: `${overdue} overdue delivery` },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.l}</div>
              <div className="text-3xl font-bold tabular-nums mt-1">{k.v}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{k.s}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Delivery this month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">Delivered</div>
              <div className="text-2xl font-bold tabular-nums">34</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">On time</div>
              <div className="text-2xl font-bold tabular-nums">31</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">On-time rate</div>
              <div className="text-2xl font-bold tabular-nums text-emerald-600">91%</div>
            </div>
          </div>
          <Progress value={91} className="h-2 mt-3" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Due today</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {dueToday.map((j) => (
              <div key={j.id} className="border rounded-md p-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-medium">{j.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {j.id} · {j.format} · {j.duration} · {j.requestedBy}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={stageTone(j.stage)}>{j.stage}</Badge>
                  {j.overdue && (
                    <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Needs your attention</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { t: `${openCorrections} correction requests to fix and re-submit`, tone: "text-destructive" },
              { t: "Jaipur owner reel is past its due date", tone: "text-destructive" },
              { t: "Trainer highlights blocked — footage not received", tone: "text-amber-600" },
              { t: `${inReview} submissions waiting on approver`, tone: "text-muted-foreground" },
            ].map((r) => (
              <div key={r.t} className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`h-4 w-4 ${r.tone}`} />
                <span>{r.t}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Output this week</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Reels", v: 6 },
            { l: "Ad Cuts", v: 3 },
            { l: "Testimonials", v: 2 },
            { l: "Long-form", v: 1 },
          ].map((p) => (
            <div key={p.l} className="border rounded-md p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">{p.l}</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{p.v}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
