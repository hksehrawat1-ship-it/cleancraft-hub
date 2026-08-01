import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Headphones,
  Layers,
  Link2,
  MessageSquareWarning,
  Pause,
  Play,
  Plus,
  Presentation,
  Search,
  Share2,
  Sparkles,
  Upload,
  Archive,
  History,
  GraduationCap,
  HelpCircle,
  Grid2X2,
  List as ListIcon,
} from "lucide-react";
import { TASK_EXECUTIVES } from "@/components/sales-head/team-tasks";

/* ---------------- types + sample data ---------------- */

const CATEGORIES = [
  "Knowledge Centre",
  "Question Bank",
  "Audio Library",
  "Call Scripts",
  "Objection Handling",
  "Presentations",
  "Proposals and Documents",
  "Training Materials",
] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_ICON: Record<Category, typeof BookOpen> = {
  "Knowledge Centre": BookOpen,
  "Question Bank": HelpCircle,
  "Audio Library": Headphones,
  "Call Scripts": FileText,
  "Objection Handling": MessageSquareWarning,
  Presentations: Presentation,
  "Proposals and Documents": Layers,
  "Training Materials": GraduationCap,
};

const BUSINESS_UNITS = ["Franchise", "Retail Dry Clean", "Institutional", "All Units"];
const LANGUAGES = ["English", "Hindi", "Hinglish"];
const FILE_TYPES = ["PDF", "DOCX", "XLSX", "PPTX", "MP3", "MP4"];

type Version = { version: string; date: string; by: string; note: string };

type Resource = {
  id: string;
  title: string;
  category: Category;
  description: string;
  unit: string;
  language: string;
  fileType: string;
  version: string;
  updated: string;
  createdBy: string;
  archived: boolean;
  views: number;
  plays: number;
  downloads: number;
  durationSec?: number;
  history: Version[];
  linkedMeetings: string[];
  linkedTasks: string[];
  recommendedTo: string[];
};

const today = new Date();
const d = (daysAgo: number) =>
  new Date(today.getTime() - daysAgo * 86400000).toISOString().slice(0, 10);

const SEED: Resource[] = [
  {
    id: "r1",
    title: "Clean Craft Franchise Pitch Deck 2026",
    category: "Presentations",
    description: "Master deck used in first franchise meetings — brand, unit economics, support model.",
    unit: "Franchise",
    language: "English",
    fileType: "PPTX",
    version: "v4.2",
    updated: d(3),
    createdBy: "Sales Head",
    archived: false,
    views: 214,
    plays: 0,
    downloads: 96,
    history: [
      { version: "v4.2", date: d(3), by: "Sales Head", note: "Updated FY26 ROI slide" },
      { version: "v4.1", date: d(41), by: "Sales Head", note: "New store photos" },
      { version: "v3.8", date: d(120), by: "Marketing", note: "Rebrand refresh" },
    ],
    linkedMeetings: ["Rakesh Agarwal — Discovery call"],
    linkedTasks: ["Prepare Jaipur proposal"],
    recommendedTo: ["Ravi Sharma", "Amit Bansal"],
  },
  {
    id: "r2",
    title: "Franchise Fee & ROI Calculator",
    category: "Proposals and Documents",
    description: "Working sheet to build payback, break-even and 3-year ROI for a prospect city.",
    unit: "Franchise",
    language: "English",
    fileType: "XLSX",
    version: "v2.6",
    updated: d(9),
    createdBy: "Accounts",
    archived: false,
    views: 168,
    plays: 0,
    downloads: 141,
    history: [
      { version: "v2.6", date: d(9), by: "Accounts", note: "Revised machine cost" },
      { version: "v2.4", date: d(70), by: "Accounts", note: "GST logic fix" },
    ],
    linkedMeetings: [],
    linkedTasks: ["Send proposal — Nagpur lead"],
    recommendedTo: ["Neha Kulkarni"],
  },
  {
    id: "r3",
    title: "Objection Handling Playbook",
    category: "Objection Handling",
    description: "28 common objections with approved responses — price, competition, ROI doubt, family approval.",
    unit: "All Units",
    language: "English",
    fileType: "PDF",
    version: "v3.0",
    updated: d(15),
    createdBy: "Sales Head",
    archived: false,
    views: 302,
    plays: 0,
    downloads: 187,
    history: [
      { version: "v3.0", date: d(15), by: "Sales Head", note: "Added 6 competitor objections" },
      { version: "v2.2", date: d(95), by: "Sales Head", note: "Initial rollout" },
    ],
    linkedMeetings: [],
    linkedTasks: [],
    recommendedTo: ["Ravi Sharma", "Deepak Verma", "Sneha Iyer"],
  },
  {
    id: "r4",
    title: "Cold Call Opening Script (Hindi)",
    category: "Call Scripts",
    description: "First-call opener for inbound franchise enquiries in Hindi speaking markets.",
    unit: "Franchise",
    language: "Hindi",
    fileType: "DOCX",
    version: "v1.8",
    updated: d(6),
    createdBy: "Sales Head",
    archived: false,
    views: 149,
    plays: 0,
    downloads: 62,
    history: [{ version: "v1.8", date: d(6), by: "Sales Head", note: "Shorter opener" }],
    linkedMeetings: [],
    linkedTasks: ["Call review — Deepak"],
    recommendedTo: ["Deepak Verma"],
  },
  {
    id: "r5",
    title: "Winning Discovery Call — Ravi Sharma",
    category: "Audio Library",
    description: "Recorded call that converted a Jaipur lead. Note the qualification block at 3:40.",
    unit: "Franchise",
    language: "Hinglish",
    fileType: "MP3",
    version: "v1.0",
    updated: d(11),
    createdBy: "Sales Head",
    archived: false,
    views: 74,
    plays: 58,
    downloads: 12,
    durationSec: 512,
    history: [{ version: "v1.0", date: d(11), by: "Sales Head", note: "Published as best-practice call" }],
    linkedMeetings: [],
    linkedTasks: [],
    recommendedTo: ["Neha Kulkarni", "Sneha Iyer"],
  },
  {
    id: "r6",
    title: "Handling 'Franchise Fee Too High' — Audio Coaching",
    category: "Audio Library",
    description: "5 minute coaching clip on reframing fee as an investment with payback maths.",
    unit: "All Units",
    language: "English",
    fileType: "MP3",
    version: "v1.2",
    updated: d(20),
    createdBy: "Sales Head",
    archived: false,
    views: 91,
    plays: 77,
    downloads: 8,
    durationSec: 318,
    history: [{ version: "v1.2", date: d(20), by: "Sales Head", note: "Re-recorded intro" }],
    linkedMeetings: ["Vikram Shah — Fee negotiation"],
    linkedTasks: [],
    recommendedTo: ["Amit Bansal"],
  },
  {
    id: "r7",
    title: "Franchise Enquiry Question Bank",
    category: "Question Bank",
    description: "Qualification questions by stage — budget, location, timeline, decision maker.",
    unit: "Franchise",
    language: "English",
    fileType: "PDF",
    version: "v2.1",
    updated: d(28),
    createdBy: "Sales Head",
    archived: false,
    views: 187,
    plays: 0,
    downloads: 74,
    history: [{ version: "v2.1", date: d(28), by: "Sales Head", note: "Added timeline probes" }],
    linkedMeetings: ["Anita Rao — Qualification"],
    linkedTasks: [],
    recommendedTo: [],
  },
  {
    id: "r8",
    title: "Clean Craft Business Model — Knowledge Note",
    category: "Knowledge Centre",
    description: "How the laundry and dry-clean model works: process, machines, staffing, margins.",
    unit: "All Units",
    language: "English",
    fileType: "PDF",
    version: "v5.0",
    updated: d(2),
    createdBy: "COO Office",
    archived: false,
    views: 421,
    plays: 0,
    downloads: 203,
    history: [
      { version: "v5.0", date: d(2), by: "COO Office", note: "New machine line added" },
      { version: "v4.3", date: d(60), by: "COO Office", note: "Staffing update" },
    ],
    linkedMeetings: [],
    linkedTasks: [],
    recommendedTo: ["Ravi Sharma"],
  },
  {
    id: "r9",
    title: "New Executive Onboarding — Week 1",
    category: "Training Materials",
    description: "Day-wise onboarding plan for a new sales executive with CRM walkthrough.",
    unit: "All Units",
    language: "English",
    fileType: "PDF",
    version: "v1.4",
    updated: d(35),
    createdBy: "HR Head",
    archived: false,
    views: 66,
    plays: 0,
    downloads: 39,
    history: [{ version: "v1.4", date: d(35), by: "HR Head", note: "CRM section added" }],
    linkedMeetings: [],
    linkedTasks: ["Training — Sneha onboarding"],
    recommendedTo: ["Sneha Iyer"],
  },
  {
    id: "r10",
    title: "Sample Franchise Agreement (2024 edition)",
    category: "Proposals and Documents",
    description: "Superseded agreement format. Kept for reference on older signed deals.",
    unit: "Franchise",
    language: "English",
    fileType: "PDF",
    version: "v1.0",
    updated: d(240),
    createdBy: "Legal",
    archived: true,
    views: 88,
    plays: 0,
    downloads: 51,
    history: [{ version: "v1.0", date: d(240), by: "Legal", note: "Original release" }],
    linkedMeetings: [],
    linkedTasks: [],
    recommendedTo: [],
  },
  {
    id: "r11",
    title: "Competitor Comparison — Top 5 Laundry Brands",
    category: "Knowledge Centre",
    description: "Side-by-side on fee, royalty, support and store count. Use when prospect names a rival.",
    unit: "Franchise",
    language: "English",
    fileType: "PDF",
    version: "v2.3",
    updated: d(18),
    createdBy: "Sales Head",
    archived: false,
    views: 233,
    plays: 0,
    downloads: 119,
    history: [{ version: "v2.3", date: d(18), by: "Sales Head", note: "Q2 pricing refresh" }],
    linkedMeetings: ["Rakesh Agarwal — Discovery call"],
    linkedTasks: [],
    recommendedTo: ["Amit Bansal", "Deepak Verma"],
  },
  {
    id: "r12",
    title: "Institutional Tie-up Proposal Template",
    category: "Proposals and Documents",
    description: "Editable proposal for hotels, hospitals and hostels with slab pricing.",
    unit: "Institutional",
    language: "English",
    fileType: "DOCX",
    version: "v1.6",
    updated: d(24),
    createdBy: "Sales Head",
    archived: false,
    views: 57,
    plays: 0,
    downloads: 33,
    history: [{ version: "v1.6", date: d(24), by: "Sales Head", note: "Slab pricing revised" }],
    linkedMeetings: [],
    linkedTasks: [],
    recommendedTo: [],
  },
];

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ---------------- page ---------------- */

export function SalesHeadResourcesPage() {
  const [items, setItems] = useState<Resource[]>(SEED);
  const [canPublish, setCanPublish] = useState(true); // authorised user toggle
  const [q, setQ] = useState("");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [tab, setTab] = useState<"all" | "recent" | "most">("all");
  const [fCat, setFCat] = useState("all");
  const [fUnit, setFUnit] = useState("all");
  const [fType, setFType] = useState("all");
  const [fLang, setFLang] = useState("all");
  const [fBy, setFBy] = useState("all");
  const [fUpdated, setFUpdated] = useState("all");
  const [fStatus, setFStatus] = useState("active");

  const [detail, setDetail] = useState<Resource | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [shareOf, setShareOf] = useState<Resource | null>(null);
  const [linkOf, setLinkOf] = useState<Resource | null>(null);
  const [versionOf, setVersionOf] = useState<Resource | null>(null);
  const [editOf, setEditOf] = useState<Resource | null>(null);

  const creators = useMemo(
    () => Array.from(new Set(SEED.map((r) => r.createdBy))),
    [],
  );

  const update = (id: string, patch: Partial<Resource>) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const track = (r: Resource, kind: "views" | "plays" | "downloads") =>
    update(r.id, { [kind]: r[kind] + 1 } as Partial<Resource>);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = items.filter((r) => {
      if (fStatus === "active" && r.archived) return false;
      if (fStatus === "archived" && !r.archived) return false;
      if (fCat !== "all" && r.category !== fCat) return false;
      if (fUnit !== "all" && r.unit !== fUnit) return false;
      if (fType !== "all" && r.fileType !== fType) return false;
      if (fLang !== "all" && r.language !== fLang) return false;
      if (fBy !== "all" && r.createdBy !== fBy) return false;
      if (fUpdated !== "all") {
        const days = (Date.now() - new Date(r.updated).getTime()) / 86400000;
        if (days > Number(fUpdated)) return false;
      }
      if (term) {
        const hay = `${r.title} ${r.description} ${r.category} ${r.unit} ${r.createdBy}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    if (tab === "recent")
      list = [...list].sort((a, b) => +new Date(b.updated) - +new Date(a.updated)).slice(0, 6);
    else if (tab === "most")
      list = [...list]
        .sort((a, b) => b.views + b.downloads + b.plays - (a.views + a.downloads + a.plays))
        .slice(0, 6);
    else list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [items, q, tab, fCat, fUnit, fType, fLang, fBy, fUpdated, fStatus]);

  const counts = useMemo(() => {
    const active = items.filter((r) => !r.archived);
    return {
      total: active.length,
      audio: active.filter((r) => r.category === "Audio Library").length,
      recommended: active.filter((r) => r.recommendedTo.length > 0).length,
      linked: active.filter((r) => r.linkedMeetings.length + r.linkedTasks.length > 0).length,
    };
  }, [items]);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-sm text-muted-foreground">
            One approved library of sales knowledge, scripts and training material for the team.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
            <Switch id="auth" checked={canPublish} onCheckedChange={setCanPublish} />
            <Label htmlFor="auth" className="text-xs">
              Publishing rights
            </Label>
          </div>
          <Button disabled={!canPublish} onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Resource
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Resources" value={counts.total} icon={FolderOpen} />
        <StatCard label="Audio Clips" value={counts.audio} icon={Headphones} />
        <StatCard label="Recommended to Team" value={counts.recommended} icon={Sparkles} />
        <StatCard label="Linked to Meetings / Tasks" value={counts.linked} icon={Link2} />
      </div>

      {/* search + tabs + view */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search resources by title, description, category…"
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "recent", "most"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tab === t ? "default" : "outline"}
                  onClick={() => setTab(t)}
                >
                  {t === "all" ? "All" : t === "recent" ? "Recently Added" : "Most Used"}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setView(view === "cards" ? "list" : "cards")}
              >
                {view === "cards" ? <ListIcon className="h-4 w-4" /> : <Grid2X2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
            <Filter value={fCat} onChange={setFCat} placeholder="Category" options={[...CATEGORIES]} />
            <Filter value={fUnit} onChange={setFUnit} placeholder="Business unit" options={BUSINESS_UNITS} />
            <Filter value={fType} onChange={setFType} placeholder="File type" options={FILE_TYPES} />
            <Filter value={fLang} onChange={setFLang} placeholder="Language" options={LANGUAGES} />
            <Filter value={fBy} onChange={setFBy} placeholder="Created by" options={creators} />
            <Select value={fUpdated} onValueChange={setFUpdated}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Last updated" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any update date</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="all">Active + Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No resources match these filters.
          </CardContent>
        </Card>
      )}

      {view === "cards" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <ResourceCard
              key={r.id}
              r={r}
              canPublish={canPublish}
              onOpen={() => {
                track(r, "views");
                setDetail(r);
              }}
              onTrack={track}
              onShare={() => setShareOf(r)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="p-3">Resource</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="p-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
                    </td>
                    <td className="p-3 text-xs">{r.category}</td>
                    <td className="p-3 text-xs">{r.unit}</td>
                    <td className="p-3 text-xs">{r.fileType}</td>
                    <td className="p-3 text-xs">{r.version}</td>
                    <td className="p-3 text-xs">{fmtDate(r.updated)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          track(r, "views");
                          setDetail(r);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => setShareOf(r)}>
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* detail sheet */}
      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="pr-6">{detail.title}</SheetTitle>
                <SheetDescription>
                  {detail.category} · {detail.unit} · {detail.language} · {detail.fileType} ·{" "}
                  {detail.version}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <p className="text-muted-foreground">{detail.description}</p>

                {detail.category === "Audio Library" && (
                  <AudioPlayer
                    duration={detail.durationSec ?? 300}
                    onPlay={() => track(detail, "plays")}
                  />
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <Usage label="Views" value={items.find((i) => i.id === detail.id)?.views ?? 0} />
                  <Usage label="Plays" value={items.find((i) => i.id === detail.id)?.plays ?? 0} />
                  <Usage label="Downloads" value={items.find((i) => i.id === detail.id)?.downloads ?? 0} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      track(detail, "downloads");
                      toast.success(`Downloading ${detail.title}`);
                    }}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShareOf(detail)}>
                    <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                  </Button>
                  <Button size="sm" variant="outline" disabled={!canPublish} onClick={() => setEditOf(detail)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" disabled={!canPublish} onClick={() => setVersionOf(detail)}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> New version
                  </Button>
                  <Button size="sm" variant="outline" disabled={!canPublish} onClick={() => setLinkOf(detail)}>
                    <Link2 className="h-3.5 w-3.5 mr-1" /> Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canPublish}
                    onClick={() => {
                      update(detail.id, { archived: !detail.archived });
                      toast.success(
                        detail.archived ? "Resource restored to active" : "Resource archived (usage history kept)",
                      );
                      setDetail({ ...detail, archived: !detail.archived });
                    }}
                  >
                    <Archive className="h-3.5 w-3.5 mr-1" />
                    {detail.archived ? "Restore" : "Archive"}
                  </Button>
                </div>

                <Block title="Recommended to">
                  {detail.recommendedTo.length ? (
                    <div className="flex flex-wrap gap-1">
                      {detail.recommendedTo.map((n) => (
                        <Badge key={n} variant="secondary">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not recommended to any executive yet.</p>
                  )}
                </Block>

                <Block title="Linked to Meetings">
                  {detail.linkedMeetings.length ? (
                    <ul className="text-xs list-disc pl-4 space-y-1">
                      {detail.linkedMeetings.map((m) => (
                        <li key={m}>{m} — shows in meeting preparation</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No meetings linked.</p>
                  )}
                </Block>

                <Block title="Linked to Team Tasks">
                  {detail.linkedTasks.length ? (
                    <ul className="text-xs list-disc pl-4 space-y-1">
                      {detail.linkedTasks.map((t) => (
                        <li key={t}>{t} — attached to task brief</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No tasks linked.</p>
                  )}
                </Block>

                <Block title="Version history">
                  <div className="space-y-2">
                    {(items.find((i) => i.id === detail.id)?.history ?? []).map((h, i) => (
                      <div key={`${h.version}-${i}`} className="flex items-start gap-2 text-xs">
                        <History className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{h.version}</span>
                          {i === 0 && <Badge className="ml-2 h-4 text-[10px]">Current</Badge>}
                          <div className="text-muted-foreground">
                            {fmtDate(h.date)} · {h.by} · {h.note}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Block>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* add resource */}
      <AddResourceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(r) => {
          setItems((prev) => [r, ...prev]);
          toast.success("Resource published to the library");
        }}
      />

      {/* share */}
      <ShareDialog
        resource={shareOf}
        onClose={() => setShareOf(null)}
        onShare={(names) => {
          if (shareOf) {
            const merged = Array.from(new Set([...shareOf.recommendedTo, ...names]));
            update(shareOf.id, { recommendedTo: merged });
            toast.success(`Recommended to ${names.join(", ")} — now on their Resources page`);
          }
          setShareOf(null);
        }}
      />

      {/* link */}
      <LinkDialog
        resource={linkOf}
        onClose={() => setLinkOf(null)}
        onLink={(kind, value) => {
          if (linkOf) {
            if (kind === "meeting")
              update(linkOf.id, { linkedMeetings: [...linkOf.linkedMeetings, value] });
            else update(linkOf.id, { linkedTasks: [...linkOf.linkedTasks, value] });
            toast.success(
              kind === "meeting"
                ? "Linked — will appear in meeting preparation"
                : "Linked — will appear in Team Tasks",
            );
            setDetail(null);
          }
          setLinkOf(null);
        }}
      />

      {/* new version */}
      <VersionDialog
        resource={versionOf}
        onClose={() => setVersionOf(null)}
        onSave={(version, note) => {
          if (versionOf) {
            const dateStr = new Date().toISOString().slice(0, 10);
            update(versionOf.id, {
              version,
              updated: dateStr,
              history: [{ version, date: dateStr, by: "Sales Head", note }, ...versionOf.history],
            });
            toast.success(`${version} published as the current approved version`);
            setDetail(null);
          }
          setVersionOf(null);
        }}
      />

      {/* edit */}
      <EditDialog
        resource={editOf}
        onClose={() => setEditOf(null)}
        onSave={(patch) => {
          if (editOf) {
            update(editOf.id, { ...patch, updated: new Date().toISOString().slice(0, 10) });
            toast.success("Resource details updated");
            setDetail(null);
          }
          setEditOf(null);
        }}
      />
    </div>
  );
}

/* ---------------- pieces ---------------- */

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FolderOpen;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function Filter({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Usage({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ResourceCard({
  r,
  canPublish,
  onOpen,
  onTrack,
  onShare,
}: {
  r: Resource;
  canPublish: boolean;
  onOpen: () => void;
  onTrack: (r: Resource, k: "views" | "plays" | "downloads") => void;
  onShare: () => void;
}) {
  const Icon = CATEGORY_ICON[r.category];
  const isAudio = r.category === "Audio Library";
  return (
    <Card className={r.archived ? "opacity-70" : undefined}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className="rounded-md bg-muted p-2">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm leading-snug">{r.title}</CardTitle>
              <div className="text-xs text-muted-foreground mt-0.5">{r.category}</div>
            </div>
          </div>
          {r.archived && <Badge variant="outline">Archived</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">{r.unit}</Badge>
          <Badge variant="secondary" className="text-[10px]">{r.language}</Badge>
          <Badge variant="secondary" className="text-[10px]">{r.fileType}</Badge>
          <Badge variant="outline" className="text-[10px]">{r.version}</Badge>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Updated {fmtDate(r.updated)} · {r.createdBy} · {r.views} views
          {isAudio ? ` · ${r.plays} plays` : ` · ${r.downloads} downloads`}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onOpen}>
            {isAudio ? <Play className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
            {isAudio ? "Play" : "View"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onTrack(r, "downloads");
              toast.success(`Downloading ${r.title}`);
            }}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={onShare} disabled={!canPublish && false}>
            <Share2 className="h-3.5 w-3.5 mr-1" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AudioPlayer({ duration, onPlay }: { duration: number; onPlay: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = () => {
    if (playing) {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      setPlaying(false);
      return;
    }
    onPlay();
    setPlaying(true);
    timer.current = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= duration) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          setPlaying(false);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
  };

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="secondary" onClick={toggle} className="h-9 w-9 rounded-full">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(pos / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>{mmss(pos)}</span>
            <span>{mmss(duration)}</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Sample player — plays are tracked against this resource.
      </p>
    </div>
  );
}

/* ---------------- dialogs ---------------- */

function AddResourceDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (r: Resource) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Knowledge Centre");
  const [unit, setUnit] = useState(BUSINESS_UNITS[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [fileType, setFileType] = useState(FILE_TYPES[0]);

  const submit = () => {
    if (!title.trim()) {
      toast.error("Resource title is required");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    onCreate({
      id: `r${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || "No description added.",
      unit,
      language,
      fileType,
      version: "v1.0",
      updated: date,
      createdBy: "Sales Head",
      archived: false,
      views: 0,
      plays: 0,
      downloads: 0,
      durationSec: fileType === "MP3" ? 240 : undefined,
      history: [{ version: "v1.0", date, by: "Sales Head", note: "Initial approved version" }],
      linkedMeetings: [],
      linkedTasks: [],
      recommendedTo: [],
    });
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>Published as v1.0 — the current approved version.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title" />
          </div>
          <div>
            <Label className="text-xs">Short description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this used for and when?"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Pick label="Category" value={category} onChange={(v) => setCategory(v as Category)} options={[...CATEGORIES]} />
            <Pick label="Business unit" value={unit} onChange={setUnit} options={BUSINESS_UNITS} />
            <Pick label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
            <Pick label="File type" value={fileType} onChange={setFileType} options={FILE_TYPES} />
          </div>
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            <Upload className="h-4 w-4 mx-auto mb-1" />
            File upload placeholder — storage not connected yet.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Publish Resource</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Pick({
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
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
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

function ShareDialog({
  resource,
  onClose,
  onShare,
}: {
  resource: Resource | null;
  onClose: () => void;
  onShare: (names: string[]) => void;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (n: string) =>
    setSel((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  return (
    <Dialog
      open={!!resource}
      onOpenChange={(o) => {
        if (!o) {
          setSel([]);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recommend to executives</DialogTitle>
          <DialogDescription>
            {resource?.title} will appear in the selected executives' Resources page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {TASK_EXECUTIVES.map((e) => (
            <button
              key={e.name}
              onClick={() => toggle(e.name)}
              className={`w-full flex items-center justify-between rounded-md border p-2 text-sm ${
                sel.includes(e.name) ? "border-primary bg-primary/5" : ""
              }`}
            >
              <span>{e.name}</span>
              <span className="text-xs text-muted-foreground">{e.territory}</span>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (resource)
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`${resource.title} — Clean Craft sales resource`)}`,
                  "_blank",
                );
            }}
          >
            <Share2 className="h-3.5 w-3.5 mr-1" /> WhatsApp
          </Button>
          <Button
            disabled={sel.length === 0}
            onClick={() => {
              onShare(sel);
              setSel([]);
            }}
          >
            Recommend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const SAMPLE_MEETINGS = [
  "Rakesh Agarwal — Discovery call",
  "Vikram Shah — Fee negotiation",
  "Anita Rao — Qualification",
  "Suresh Menon — Site review",
];
const SAMPLE_TASKS = [
  "Prepare Jaipur proposal",
  "Send proposal — Nagpur lead",
  "Call review — Deepak",
  "Meeting prep — Indore franchise",
];

function LinkDialog({
  resource,
  onClose,
  onLink,
}: {
  resource: Resource | null;
  onClose: () => void;
  onLink: (kind: "meeting" | "task", value: string) => void;
}) {
  const [kind, setKind] = useState<"meeting" | "task">("meeting");
  const [value, setValue] = useState(SAMPLE_MEETINGS[0]);
  const options = kind === "meeting" ? SAMPLE_MEETINGS : SAMPLE_TASKS;

  return (
    <Dialog open={!!resource} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link resource</DialogTitle>
          <DialogDescription>
            Linked resources show up in meeting preparation or the task brief.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Pick
            label="Link to"
            value={kind}
            onChange={(v) => {
              setKind(v as "meeting" | "task");
              setValue(v === "meeting" ? SAMPLE_MEETINGS[0] : SAMPLE_TASKS[0]);
            }}
            options={["meeting", "task"]}
          />
          <Pick label="Record" value={value} onChange={setValue} options={options} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onLink(kind, value)}>Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VersionDialog({
  resource,
  onClose,
  onSave,
}: {
  resource: Resource | null;
  onClose: () => void;
  onSave: (version: string, note: string) => void;
}) {
  const [version, setVersion] = useState("");
  const [note, setNote] = useState("");
  return (
    <Dialog
      open={!!resource}
      onOpenChange={(o) => {
        if (!o) {
          setVersion("");
          setNote("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload new version</DialogTitle>
          <DialogDescription>
            Current: {resource?.version}. The previous version stays in history.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">New version number</Label>
            <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. v4.3" />
          </div>
          <div>
            <Label className="text-xs">What changed</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            <Upload className="h-4 w-4 mx-auto mb-1" />
            File upload placeholder
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!version.trim()) {
                toast.error("Version number is required");
                return;
              }
              onSave(version.trim(), note.trim() || "Version update");
              setVersion("");
              setNote("");
            }}
          >
            Publish version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  resource,
  onClose,
  onSave,
}: {
  resource: Resource | null;
  onClose: () => void;
  onSave: (patch: Partial<Resource>) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Knowledge Centre");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  if (resource && loadedFor !== resource.id) {
    setLoadedFor(resource.id);
    setTitle(resource.title);
    setDescription(resource.description);
    setCategory(resource.category);
  }

  return (
    <Dialog open={!!resource} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit resource</DialogTitle>
          <DialogDescription>Title, description and category only.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <Pick
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as Category)}
            options={[...CATEGORIES]}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ title, description, category })}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
