import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FolderOpen, BookOpen } from "lucide-react";
import { SectionHead } from "./ui";
import { ASSETS, GUIDELINES } from "./data";

export function VeAssetsPage() {
  return (
    <div className="space-y-4">
      <SectionHead title="Assets & Guidelines" sub="Brand assets, presets and the editing rules every cut must follow." />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" /> Asset library
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2">
          {ASSETS.map((a) => (
            <div key={a.name} className="border rounded-md px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-sm">{a.name}</span>
              <Badge variant="outline">{a.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Editing guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {GUIDELINES.map((g) => (
              <li key={g} className="flex gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Export specs</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          {[
            { l: "Reel / Story", v: "1080x1920", s: "H.264 · 25fps · < 200MB" },
            { l: "YouTube", v: "1920x1080", s: "H.264 · 25fps · high bitrate" },
            { l: "Ad Cut", v: "1080x1080 + 9:16", s: "30s / 15s / 6s versions" },
          ].map((e) => (
            <div key={e.l} className="border rounded-md p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">{e.l}</div>
              <div className="text-lg font-semibold mt-1">{e.v}</div>
              <div className="text-[11px] text-muted-foreground">{e.s}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
