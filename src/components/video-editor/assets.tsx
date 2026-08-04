import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen,
  Download,
  Eye,
  Heart,
  Lock,
  Search,
  Send,
  Star,
  Upload,
} from "lucide-react";
import { SectionHead } from "./ui";
import { EDITOR_NAME, VE_RECORDS } from "./dashboard-data";
import {
  ASSET_BRANDS,
  ASSET_CATEGORIES,
  BRAND_COLOURS,
  GUIDELINE_BLOCKS,
  LIBRARY_ASSETS,
  REQUEST_TYPES,
  VIDEO_SPECS,
  type AssetStatus,
  type LibraryAsset,
} from "./assets-data";

/** The logged-in editor is not an authorised asset manager. */
const CAN_MANAGE_ASSETS = false;

const STATUS_TONE: Record<AssetStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Awaiting Approval": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Replaced: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  Archived: "bg-destructive/15 text-destructive border-destructive/30",
};

const ANY = "any";

type TabKey = "library" | "guidelines" | "specs" | "request";

export function VeAssetsPage() {
  const [tab, setTab] = useState<TabKey>("library");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState(ANY);
  const [category, setCategory] = useState(ANY);
  const [platform, setPlatform] = useState(ANY);
  const [contentType, setContentType] = useState(ANY);
  const [fileType, setFileType] = useState(ANY);
  const [language, setLanguage] = useState(ANY);
  const [lifecycle, setLifecycle] = useState<"current" | "archived" | "all">("current");
  const [sortRecent, setSortRecent] = useState(true);
  const [favourites, setFavourites] = useState<string[]>(["AS-105", "AS-108"]);
  const [downloads, setDownloads] = useState<{ id: string; name: string; version: string; at: string; contentId: string }[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [linkedContentId, setLinkedContentId] = useState(ANY);

  const [reqType, setReqType] = useState("");
  const [reqContent, setReqContent] = useState(ANY);
  const [reqAsset, setReqAsset] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [reqPriority, setReqPriority] = useState("Normal");
  const [reqBy, setReqBy] = useState("");
  const [requests, setRequests] = useState<
    { type: string; asset: string; contentId: string; priority: string; by: string; status: string }[]
  >([]);

  const platforms = Array.from(new Set(LIBRARY_ASSETS.map((a) => a.platform)));
  const contentTypes = Array.from(new Set(LIBRARY_ASSETS.map((a) => a.contentType)));
  const fileTypes = Array.from(new Set(LIBRARY_ASSETS.map((a) => a.fileType)));
  const languages = Array.from(new Set(LIBRARY_ASSETS.map((a) => a.language)));

  const linkedRecord = VE_RECORDS.find((r) => r.contentId === linkedContentId) ?? null;

  const filtered = useMemo(() => {
    let list = LIBRARY_ASSETS.filter((a) => {
      if (q && !`${a.name} ${a.brand} ${a.category} ${a.description}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (brand !== ANY && a.brand !== brand) return false;
      if (category !== ANY && a.category !== category) return false;
      if (platform !== ANY && a.platform !== platform) return false;
      if (contentType !== ANY && a.contentType !== contentType) return false;
      if (fileType !== ANY && a.fileType !== fileType) return false;
      if (language !== ANY && a.language !== language) return false;
      if (lifecycle === "current" && a.archived) return false;
      if (lifecycle === "archived" && !a.archived) return false;
      if (favOnly && !favourites.includes(a.id)) return false;
      return true;
    });
    if (linkedRecord) {
      // Opened from a video task — surface matching brand and platform assets first.
      list = [...list].sort((a, b) => {
        const score = (x: LibraryAsset) =>
          (x.brand === linkedRecord.brand ? 2 : 0) + (x.platform.includes(linkedRecord.platform.split(" ")[0]) ? 1 : 0);
        return score(b) - score(a);
      });
    } else if (sortRecent) {
      list = [...list].sort((a, b) => a.updatedOrder - b.updatedOrder);
    }
    return list;
  }, [q, brand, category, platform, contentType, fileType, language, lifecycle, favOnly, favourites, sortRecent, linkedRecord]);

  const open = LIBRARY_ASSETS.find((a) => a.id === openId) ?? null;

  const toggleFav = (id: string) =>
    setFavourites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const download = (a: LibraryAsset) => {
    if (a.status !== "Approved") {
      toast.error("Only approved assets can be downloaded.", { description: `${a.name} is ${a.status}.` });
      return;
    }
    const at = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    setDownloads((p) => [
      { id: a.id, name: a.name, version: a.version, at, contentId: linkedContentId === ANY ? "—" : linkedContentId },
      ...p,
    ]);
    toast.success(`Downloaded ${a.name} ${a.version}`, {
      description: `Recorded against ${EDITOR_NAME}${linkedContentId !== ANY ? ` · ${linkedContentId}` : ""}`,
    });
  };

  const submitRequest = () => {
    if (!reqType || !reqAsset.trim() || !reqReason.trim()) {
      toast.error("Add the asset type, what is required and the reason.");
      return;
    }
    setRequests((p) => [
      {
        type: reqType,
        asset: reqAsset.trim(),
        contentId: reqContent === ANY ? "—" : reqContent,
        priority: reqPriority,
        by: reqBy || "Not set",
        status: "Sent to asset manager",
      },
      ...p,
    ]);
    setReqAsset("");
    setReqReason("");
    setReqType("");
    toast.success("Asset request sent to the authorised manager.");
  };

  return (
    <div className="space-y-4">
      <SectionHead
        title="Assets & Guidelines"
        sub="Approved logos, fonts, colours, music, templates and the editing rules behind every cut."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Approved Assets", v: LIBRARY_ASSETS.filter((a) => a.status === "Approved").length },
          { l: "Recently Updated", v: LIBRARY_ASSETS.filter((a) => a.updatedOrder <= 7).length },
          { l: "Favourite Assets", v: favourites.length },
          { l: "Download History", v: downloads.length },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="text-2xl font-bold tabular-nums mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search assets by name, brand or category"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button variant={favOnly ? "default" : "outline"} size="sm" onClick={() => setFavOnly((v) => !v)}>
              <Heart className="h-4 w-4 mr-1" /> Favourites
            </Button>
            <Button variant={sortRecent ? "default" : "outline"} size="sm" onClick={() => setSortRecent((v) => !v)}>
              Recently Updated
            </Button>
            {CAN_MANAGE_ASSETS ? (
              <Button size="sm">
                <Upload className="h-4 w-4 mr-1" /> Upload Asset
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled title="Authorised managers only">
                <Lock className="h-4 w-4 mr-1" /> Upload Asset
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Filter label="Brand" value={brand} onChange={setBrand} options={ASSET_BRANDS} />
            <Filter label="Category" value={category} onChange={setCategory} options={ASSET_CATEGORIES} />
            <Filter label="Platform" value={platform} onChange={setPlatform} options={platforms} />
            <Filter label="Content type" value={contentType} onChange={setContentType} options={contentTypes} />
            <Filter label="File type" value={fileType} onChange={setFileType} options={fileTypes} />
            <Filter label="Language" value={language} onChange={setLanguage} options={languages} />
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Current or archived</Label>
              <Select value={lifecycle} onValueChange={(v) => setLifecycle(v as typeof lifecycle)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Open from video task</Label>
              <Select value={linkedContentId} onValueChange={setLinkedContentId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="No video linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>No video linked</SelectItem>
                  {VE_RECORDS.map((r) => (
                    <SelectItem key={r.contentId} value={r.contentId}>
                      {r.contentId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {linkedRecord && (
            <p className="text-xs text-muted-foreground">
              Showing {linkedRecord.brand} · {linkedRecord.platform} assets first for {linkedRecord.contentId}. Downloads
              are recorded against this Content ID.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="library" className="text-xs">Asset Library ({filtered.length})</TabsTrigger>
          <TabsTrigger value="guidelines" className="text-xs">Brand Guidelines</TabsTrigger>
          <TabsTrigger value="specs" className="text-xs">Video Specifications</TabsTrigger>
          <TabsTrigger value="request" className="text-xs">Request an Asset</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "library" && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((a) => (
              <Card key={a.id} className={a.doNotUse ? "border-destructive/40" : ""}>
                <CardContent className="p-4 space-y-2">
                  <div className="h-24 rounded-md bg-muted flex items-center justify-center text-4xl">{a.preview}</div>
                  <div className="text-sm font-semibold leading-tight">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {a.brand} · {a.category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline">{a.fileType}</Badge>
                    <Badge variant="outline">{a.version}</Badge>
                    <Badge variant="outline" className={STATUS_TONE[a.status]}>
                      {a.status}
                    </Badge>
                    {a.doNotUse && (
                      <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
                        Do Not Use
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Last updated {a.updated}</div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setOpenId(a.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" disabled={a.status !== "Approved"} onClick={() => download(a)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={favourites.includes(a.id) ? "default" : "outline"}
                      onClick={() => toggleFav(a.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No assets match these filters.</p>}
          </div>

          {downloads.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Download history — {EDITOR_NAME}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {downloads.map((d, i) => (
                  <div key={`${d.id}-${i}`} className="text-xs flex flex-wrap justify-between gap-2 border rounded px-2 py-1.5">
                    <span className="font-medium">
                      {d.name} · {d.version}
                    </span>
                    <span className="text-muted-foreground">
                      {d.at} · Content ID {d.contentId}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tab === "guidelines" && (
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Brand colours
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {BRAND_COLOURS.map((c) => (
                <div key={c.hex} className="rounded-lg border p-3 flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-md border shrink-0"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden
                  />
                  <div className="text-xs min-w-0">
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-muted-foreground">HEX {c.hex}</div>
                    <div className="text-muted-foreground">RGB {c.rgb}</div>
                    <div className="text-muted-foreground">CMYK {c.cmyk}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {GUIDELINE_BLOCKS.map((g) => (
              <Card key={g.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{g.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {g.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "specs" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {VIDEO_SPECS.map((s) => (
            <Card key={s.platform}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{s.platform}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <Row l="Aspect ratio" v={s.aspect} />
                <Row l="Resolution" v={s.resolution} />
                <Row l="Recommended duration" v={s.duration} />
                <Row l="File format" v={s.format} />
                <Row l="Maximum file size" v={s.maxSize} />
                <Row l="Subtitle safe area" v={s.safeArea} />
                <Row l="Thumbnail" v={s.thumbnail} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "request" && (
        <div className="grid lg:grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Request an asset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Asset required</Label>
                <Select value={reqType} onValueChange={setReqType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Related Content ID</Label>
                <Select value={reqContent} onValueChange={setReqContent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Not linked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Not linked</SelectItem>
                    {VE_RECORDS.map((r) => (
                      <SelectItem key={r.contentId} value={r.contentId}>
                        {r.contentId} — {r.title.slice(0, 30)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">What exactly is needed</Label>
                <Input value={reqAsset} onChange={(e) => setReqAsset(e.target.value)} placeholder="e.g. GILM white logo SVG" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reason</Label>
                <Textarea rows={3} value={reqReason} onChange={(e) => setReqReason(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority</Label>
                  <Select value={reqPriority} onValueChange={setReqPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Urgent", "High", "Normal"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Required by</Label>
                  <Input type="date" value={reqBy} onChange={(e) => setReqBy(e.target.value)} />
                </div>
              </div>
              <Button onClick={submitRequest} className="w-full">
                <Send className="h-4 w-4 mr-1" /> Send Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">My asset requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {requests.length === 0 && <p className="text-sm text-muted-foreground">No requests raised yet.</p>}
              {requests.map((r, i) => (
                <div key={i} className="rounded-md border p-2 text-sm">
                  <div className="font-medium">
                    {r.type} — {r.asset}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Content ID {r.contentId} · {r.priority} · required by {r.by}
                  </div>
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    {r.status}
                  </Badge>
                </div>
              ))}
              <Separator />
              <p className="text-[11px] text-muted-foreground">
                Only authorised managers can upload, approve, replace or archive assets. Editors view, download,
                favourite and request. Previous versions are preserved and historical assets used in published content
                are never deleted.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {open && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left pr-8">{open.name}</SheetTitle>
                <div className="text-xs text-muted-foreground text-left">
                  {open.id} · {open.brand} · {open.category}
                </div>
              </SheetHeader>
              <div className="space-y-4">
                <div className="h-32 rounded-lg bg-muted flex items-center justify-center text-5xl">{open.preview}</div>
                {open.doNotUse && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">
                    Do Not Use — this version is archived and retained only for published-video history.
                  </div>
                )}
                <p className="text-sm">{open.description}</p>
                <div className="text-sm space-y-1">
                  <Row l="Brand" v={open.brand} />
                  <Row l="Platform" v={open.platform} />
                  <Row l="Content type" v={open.contentType} />
                  <Row l="File dimensions" v={open.dimensions} />
                  <Row l="File format" v={open.format} />
                  <Row l="Language" v={open.language} />
                  <Row l="Version" v={open.version} />
                  <Row l="Approval status" v={open.status} />
                  <Row l="Uploaded by" v={open.uploadedBy} />
                  <Row l="Last updated" v={open.updated} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Permitted usage</div>
                  <ul className="text-sm list-disc pl-4">
                    {open.permitted.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-destructive mb-1">Prohibited usage</div>
                  <ul className="text-sm list-disc pl-4 text-destructive">
                    {open.prohibited.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Version history</div>
                  <div className="space-y-1.5">
                    {open.history.map((h) => (
                      <div key={h.version} className="rounded-md border p-2 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold">{h.version}</span>
                          <Badge variant="outline" className={`${STATUS_TONE[h.status]} text-[10px]`}>
                            {h.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          {h.on} · {h.by}
                        </div>
                        <div>{h.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => toggleFav(open.id)}>
                    <Star className="h-4 w-4 mr-1" />
                    {favourites.includes(open.id) ? "Remove favourite" : "Add to Favourites"}
                  </Button>
                  <Button disabled={open.status !== "Approved"} onClick={() => download(open)}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground shrink-0">{l}:</span>
      <span className="font-medium min-w-0">{v}</span>
    </div>
  );
}
