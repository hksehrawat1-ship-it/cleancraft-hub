import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { VeDashboardPage } from "@/components/video-editor/dashboard";
import { VeMyVideosPage } from "@/components/video-editor/my-videos";
import { VeSubmitPage } from "@/components/video-editor/submit-review";
import { VeCorrectionsPage } from "@/components/video-editor/corrections";
import { VeAssetsPage } from "@/components/video-editor/assets";
import { VePerformancePage } from "@/components/video-editor/performance";

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
          {active === "dashboard" && <VeDashboardPage onGoTo={(k) => setActive(k as SectionKey)} />}
          {active === "videos" && <VeMyVideosPage onGoTo={(k) => setActive(k as SectionKey)} />}
          {active === "submit" && <VeSubmitPage />}
          {active === "corrections" && <VeCorrectionsPage />}
          {active === "assets" && <VeAssetsPage />}
          {active === "performance" && <VePerformancePage />}
        </main>
      </div>
    </div>
  );
}
