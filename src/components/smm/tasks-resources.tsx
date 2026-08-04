import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { SectionHead, StatCard } from "./ui";

/* ---------------- shared task & resource structures ---------------- */

const TASK_TYPES = [
  "Content Planning",
  "Video Editor Assignment",
  "Review Content",
  "Prepare Caption",
  "Prepare Thumbnail",
  "Schedule Publishing",
  "Check Social Account",
  "Qualify Lead",
  "Handover Lead",
  "Update Analytics",
  "General Task",
] as const;
type TaskType = (typeof TASK_TYPES)[number];

const TASK_STATUSES = [
  "Not Started",
  "In Progress",
  "Waiting for Review",
  "Completed",
  "Overdue",
  "Cancelled",
] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

const USERS = ["Priya Nanda", "Karan Doshi (Editor)", "Ritu Malhotra (Editor)", "Sales Head", "Aditya Rane"];

type SmTask = {
  id: string;
  title: string;
  type: TaskType;
  linkId?: string;
  linkKind?: "content" | "lead";
  assignee: string;
  createdBy: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  due: string;
  start: string;
  status: TaskStatus;
  description: string;
  checklist: { label: string; done: boolean }[];
  reviewRequired: boolean;
  reminder: string;
  reassignCount: number;
  notes: { at: string; by: string; text: string }[];
  mine: boolean;
};

const SEED_TASKS: SmTask[] = [
  {
    id: "SM-TSK-3001", title: "Assign Jaipur owner testimonial to editor", type: "Video Editor Assignment",
    linkId: "CC-CN-1049", linkKind: "content", assignee: "Priya Nanda", createdBy: "Priya Nanda",
    priority: "Urgent", due: "Today, 14:00", start: "Today, 09:00", status: "Overdue",
    description: "Pick the editor with lowest workload and share the brief and raw files.",
    checklist: [
      { label: "Check editor workload", done: true },
      { label: "Attach brief and raw footage", done: false },
      { label: "Confirm delivery date", done: false },
    ],
    reviewRequired: false, reminder: "30 minutes before due", reassignCount: 0,
    notes: [{ at: "Today, 09:05", by: "Priya Nanda", text: "Raw files received from field team." }],
    mine: true,
  },
  {
    id: "SM-TSK-3002", title: "Review GILM webinar promo v3", type: "Review Content",
    linkId: "CC-CN-1050", linkKind: "content", assignee: "Priya Nanda", createdBy: "Priya Nanda",
    priority: "High", due: "Today, 17:00", start: "Today, 11:00", status: "In Progress",
    description: "Complete the 15-point review checklist before approving.",
    checklist: [
      { label: "Watch full cut", done: true },
      { label: "Run 15-point checklist", done: false },
      { label: "Record decision", done: false },
    ],
    reviewRequired: true, reminder: "1 hour before due", reassignCount: 0, notes: [], mine: true,
  },
  {
    id: "SM-TSK-3003", title: "Prepare caption for fabric care short", type: "Prepare Caption",
    linkId: "CC-CN-1052", linkKind: "content", assignee: "Aditya Rane", createdBy: "Priya Nanda",
    priority: "Medium", due: "Today, 18:00", start: "Today, 12:00", status: "Waiting for Review",
    description: "Hindi + English caption with the approved CTA format.",
    checklist: [
      { label: "Draft Hindi caption", done: true },
      { label: "Draft English caption", done: true },
      { label: "Add approved hashtags", done: true },
    ],
    reviewRequired: true, reminder: "2 hours before due", reassignCount: 1, notes: [], mine: false,
  },
  {
    id: "SM-TSK-3004", title: "Schedule Jaipur testimonial on Instagram", type: "Schedule Publishing",
    linkId: "CC-CN-1049", linkKind: "content", assignee: "Priya Nanda", createdBy: "Priya Nanda",
    priority: "High", due: "Tomorrow, 10:00", start: "Tomorrow, 09:00", status: "Not Started",
    description: "Schedule only after approval lock. Complete the 10-point readiness check.",
    checklist: [
      { label: "Confirm approved version locked", done: false },
      { label: "Run readiness check", done: false },
    ],
    reviewRequired: false, reminder: "1 day before due", reassignCount: 0, notes: [], mine: true,
  },
  {
    id: "SM-TSK-3005", title: "Handover Ludhiana franchise lead to Sales Head", type: "Handover Lead",
    linkId: "CC-LD-5205", linkKind: "lead", assignee: "Priya Nanda", createdBy: "Priya Nanda",
    priority: "Urgent", due: "Today, 11:00", start: "Today, 08:30", status: "Overdue",
    description: "High-intent lead. Recommended response within 1 hour.",
    checklist: [
      { label: "Complete qualification check", done: true },
      { label: "Add notes for Sales Head", done: false },
      { label: "Send to Sales Head", done: false },
    ],
    reviewRequired: false, reminder: "15 minutes before due", reassignCount: 0, notes: [], mine: true,
  },
  {
    id: "SM-TSK-3006", title: "Qualify Pune service enquiry (duplicate check)", type: "Qualify Lead",
    linkId: "CC-LD-5202", linkKind: "lead", assignee: "Aditya Rane", createdBy: "Priya Nanda",
    priority: "Medium", due: "Today, 16:00", start: "Today, 10:00", status: "In Progress",
    description: "Possible duplicate of CC-LD-5088 — verify before creating any new record.",
    checklist: [
      { label: "Match mobile and email", done: true },
      { label: "Confirm with Sales Executive", done: false },
    ],
    reviewRequired: false, reminder: "1 hour before due", reassignCount: 0, notes: [], mine: false,
  },
  {
    id: "SM-TSK-3007", title: "Check Pinterest account token expiry", type: "Check Social Account",
    assignee: "Aditya Rane", createdBy: "Priya Nanda", priority: "High", due: "", start: "Today, 09:00",
    status: "Not Started", description: "Publishing failures recorded — verify connection health.",
    checklist: [{ label: "Open account health", done: false }],
    reviewRequired: false, reminder: "Not set", reassignCount: 3, notes: [], mine: false,
  },
  {
    id: "SM-TSK-3008", title: "Update monthly analytics snapshot", type: "Update Analytics",
    assignee: "Priya Nanda", createdBy: "Priya Nanda", priority: "Low", due: "5 Aug 2026, 18:00",
    start: "5 Aug 2026, 15:00", status: "Not Started",
    description: "Preserve the previous snapshot before refreshing platform data.",
    checklist: [{ label: "Export current snapshot", done: false }],
    reviewRequired: false, reminder: "1 day before due", reassignCount: 0, notes: [], mine: true,
  },
  {
    id: "SM-TSK-3009", title: "Plan August franchise content calendar", type: "Content Planning",
    assignee: "Priya Nanda", createdBy: "Priya Nanda", priority: "Medium", due: "6 Aug 2026, 12:00",
    start: "3 Aug 2026, 10:00", status: "Completed",
    description: "Two testimonials, one machine tour, four shorts.",
    checklist: [
      { label: "Draft calendar", done: true },
      { label: "Confirm with Sales Head", done: true },
    ],
    reviewRequired: false, reminder: "1 day before due", reassignCount: 0, notes: [], mine: true,
  },
];

const RESOURCE_CATEGORIES = [
  "Brand Guidelines",
  "Logos",
  "Fonts and Colours",
  "Video Templates",
  "Caption Templates",
  "Hashtag Lists",
  "Thumbnail Templates",
  "Campaign Briefs",
  "Lead Qualification Scripts",
  "Social-Media SOPs",
  "Platform Guidelines",
  "Reference Content",
] as const;

type ResourceStatus = "Draft" | "Awaiting Approval" | "Approved" | "Replaced" | "Archived";

type SmResource = {
  id: string;
  title: string;
  category: (typeof RESOURCE_CATEGORIES)[number];
  brand: string;
  fileType: string;
  version: string;
  status: ResourceStatus;
  updated: string;
  linked: string[];
  previousVersions: string[];
};

const SEED_RESOURCES: SmResource[] = [
  { id: "RS-101", title: "Clean Craft Brand Book 2026", category: "Brand Guidelines", brand: "Clean Craft Franchise", fileType: "PDF", version: "v4.0", status: "Approved", updated: "1 Aug 2026", linked: ["All campaigns"], previousVersions: ["v3.2", "v3.0"] },
  { id: "RS-102", title: "Primary & Secondary Logo Pack", category: "Logos", brand: "All Brands", fileType: "ZIP (SVG, PNG)", version: "v2.1", status: "Approved", updated: "28 Jul 2026", linked: ["CC-CN-1049", "CC-CN-1052"], previousVersions: ["v2.0"] },
  { id: "RS-103", title: "Typography & Colour Tokens", category: "Fonts and Colours", brand: "All Brands", fileType: "PDF", version: "v1.6", status: "Approved", updated: "22 Jul 2026", linked: [], previousVersions: ["v1.5"] },
  { id: "RS-104", title: "Reel Template — Owner Story", category: "Video Templates", brand: "Clean Craft Franchise", fileType: "Project file", version: "v3.0", status: "Approved", updated: "30 Jul 2026", linked: ["CC-CN-1049"], previousVersions: ["v2.4"] },
  { id: "RS-105", title: "Caption Bank — Franchise Enquiry", category: "Caption Templates", brand: "Clean Craft Franchise", fileType: "DOC", version: "v2.2", status: "Approved", updated: "2 Aug 2026", linked: ["Franchise Aug — Reel Ads"], previousVersions: ["v2.1"] },
  { id: "RS-106", title: "Hashtag Set — Laundry Services", category: "Hashtag Lists", brand: "Clean Craft Services", fileType: "DOC", version: "v1.9", status: "Approved", updated: "26 Jul 2026", linked: [], previousVersions: [] },
  { id: "RS-107", title: "Thumbnail Grid Template 16:9", category: "Thumbnail Templates", brand: "All Brands", fileType: "PSD", version: "v1.3", status: "Awaiting Approval", updated: "3 Aug 2026", linked: [], previousVersions: ["v1.2"] },
  { id: "RS-108", title: "Franchise Aug Campaign Brief", category: "Campaign Briefs", brand: "Clean Craft Franchise", fileType: "PDF", version: "v1.0", status: "Approved", updated: "29 Jul 2026", linked: ["Franchise Aug — Reel Ads"], previousVersions: [] },
  { id: "RS-109", title: "Lead Qualification Script (Hindi/English)", category: "Lead Qualification Scripts", brand: "All Brands", fileType: "DOC", version: "v2.0", status: "Approved", updated: "1 Aug 2026", linked: ["CC-LD-5205"], previousVersions: ["v1.8"] },
  { id: "RS-110", title: "Social Media SOP — Publishing", category: "Social-Media SOPs", brand: "All Brands", fileType: "PDF", version: "v3.1", status: "Approved", updated: "27 Jul 2026", linked: [], previousVersions: ["v3.0"] },
  { id: "RS-111", title: "Platform Specs Sheet 2026", category: "Platform Guidelines", brand: "All Brands", fileType: "PDF", version: "v2.0", status: "Approved", updated: "20 Jul 2026", linked: [], previousVersions: ["v1.9"] },
  { id: "RS-112", title: "Old Logo Pack 2024", category: "Logos", brand: "All Brands", fileType: "ZIP", version: "v1.0", status: "Replaced", updated: "10 Jan 2026", linked: ["CC-CN-1038"], previousVersions: [] },
  { id: "RS-113", title: "Reference Reels — Competitor Study", category: "Reference Content", brand: "All Brands", fileType: "Link list", version: "v1.1", status: "Draft", updated: "3 Aug 2026", linked: [], previousVersions: [] },
  { id: "RS-114", title: "Festive Template 2025", category: "Video Templates", brand: "Clean Craft Services", fileType: "Project file", version: "v1.0", status: "Archived", updated: "5 Dec 2025", linked: [], previousVersions: [] },
];

const CONTENT_TEMPLATES = [
  { name: "Reel", spec: "9:16 · 15–30s · burned-in subtitles · logo bug bottom-right", version: "v3.0" },
  { name: "YouTube Short", spec: "9:16 · under 60s · hook in first 2s · end card", version: "v2.2" },
  { name: "Long Video", spec: "16:9 · 4–10 min · chapter markers · intro + outro", version: "v2.0" },
  { name: "Advertisement", spec: "9:16 & 1:1 · CTA in last 3s · offer supers approved by manager", version: "v1.8" },
  { name: "Testimonial", spec: "Lower-third with owner name and city · no background music over speech", version: "v2.5" },
  { name: "Educational Video", spec: "Step titles · slow B-roll · Hindi VO + English subtitles", version: "v1.7" },
  { name: "Product Video", spec: "Clean white cyclorama · product name super · spec card at end", version: "v1.4" },
  { name: "Franchise Video", spec: "Investment supers must match approved figures · legal disclaimer", version: "v2.1" },
  { name: "Caption", spec: "Hook line · 3 value lines · CTA · approved hashtag set", version: "v2.2" },
  { name: "Thumbnail", spec: "1280x720 · max 5 words · brand red + charcoal · face on right third", version: "v1.3" },
  { name: "Content Brief", spec: "Objective · audience · key message · CTA · references · deadline", version: "v1.9" },
];

const BRAND_GUIDE = [
  { k: "Approved logos", v: "Primary horizontal, stacked, and monogram. Minimum clear space equal to logo height ÷ 2." },
  { k: "Colours", v: "Brand Red, Charcoal, Off-white, Steel Grey. No gradients on the logo." },
  { k: "Fonts", v: "Headline: brand display face. Body and subtitles: brand sans. No system fonts." },
  { k: "Subtitle style", v: "Bottom-centre, 2 lines max, 90% opacity black box, sentence case." },
  { k: "Thumbnail style", v: "Max 5 words, face on right third, brand red accent bar on left." },
  { k: "Intro and outro", v: "1.2s animated intro, 3s outro with CTA and handle. Never skip the outro on long videos." },
  { k: "Music rules", v: "Licensed library only. Music ducks under speech. No trending audio on advertisements." },
  { k: "Call-to-action format", v: "\"DM 'FRANCHISE' to know more\" or \"Call 1800-XXXXXX\" — one CTA per asset." },
  { k: "Platform dimensions", v: "Reel/Short 1080x1920 · Feed 1080x1350 · YouTube 1920x1080 · LinkedIn 1200x628." },
];

const USAGE_EXAMPLES = [
  { ok: true, text: "Logo placed bottom-right with full clear space on a plain area of the frame." },
  { ok: true, text: "Subtitles in brand sans, two lines, readable on mobile at 100% zoom." },
  { ok: false, text: "Old 2024 logo used on CC-CN-1038 — replaced asset, marked Do Not Use." },
  { ok: false, text: "Trending audio used on a paid advertisement — licensing risk." },
];

const TABS = ["My Tasks", "Assigned Tasks", "Resource Library", "Content Templates", "Brand Guidelines"] as const;
type Tab = (typeof TABS)[number];

function statusTone(s: TaskStatus) {
  return s === "Completed"
    ? "bg-emerald-100 text-emerald-800"
    : s === "Overdue"
    ? "bg-destructive/10 text-destructive"
    : s === "Waiting for Review"
    ? "bg-amber-100 text-amber-800"
    : s === "Cancelled"
    ? "bg-muted text-muted-foreground"
    : "bg-primary/10 text-primary";
}

function priorityTone(p: SmTask["priority"]) {
  return p === "Urgent" || p === "High"
    ? "bg-destructive/10 text-destructive"
    : p === "Medium"
    ? "bg-amber-100 text-amber-800"
    : "bg-muted text-muted-foreground";
}

function resourceTone(s: ResourceStatus) {
  return s === "Approved"
    ? "bg-emerald-100 text-emerald-800"
    : s === "Awaiting Approval"
    ? "bg-amber-100 text-amber-800"
    : s === "Draft"
    ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";
}

function linkTarget(t: SmTask) {
  if (t.type === "Review Content") return "Review & Approval";
  if (t.type === "Schedule Publishing") return "Publishing Calendar";
  if (t.type === "Qualify Lead" || t.type === "Handover Lead") return "Leads & Handover";
  if (t.type === "Video Editor Assignment") return "Content Queue → editor workspace";
  if (t.type === "Update Analytics") return "Analytics";
  return "Content Queue";
}

export function SmmTasksResourcesPage() {
  const [tab, setTab] = useState<Tab>("My Tasks");
  const [tasks, setTasks] = useState<SmTask[]>(SEED_TASKS);
  const [resources, setResources] = useState<SmResource[]>(SEED_RESOURCES);
  const [q, setQ] = useState("");
  const [fType, setFType] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [note, setNote] = useState("");

  const [nt, setNt] = useState({
    title: "",
    type: "General Task" as TaskType,
    link: "",
    assignee: USERS[0],
    description: "",
    checklist: "",
    priority: "Medium" as SmTask["priority"],
    start: "",
    due: "",
    review: false,
    reminder: "1 hour before due",
  });

  const current = tasks.find((t) => t.id === openTask) ?? null;

  const stats = useMemo(
    () => ({
      dueToday: tasks.filter((t) => t.due.startsWith("Today") && t.status !== "Completed").length,
      overdue: tasks.filter((t) => t.status === "Overdue").length,
      review: tasks.filter((t) => t.status === "Waiting for Review").length,
      resources: resources.filter((r) => r.updated.includes("Aug 2026")).length,
    }),
    [tasks, resources],
  );

  const alerts = useMemo(() => {
    const out: { tone: "bad" | "warn"; text: string }[] = [];
    tasks.forEach((t) => {
      if (t.status === "Overdue" && (t.priority === "Urgent" || t.priority === "High"))
        out.push({ tone: "bad", text: `${t.id} — urgent task overdue: ${t.title}` });
      if (t.type === "Review Content" && t.status !== "Completed")
        out.push({ tone: "warn", text: `${t.id} — review task due soon (${t.due || "no due date"})` });
      if (t.type === "Handover Lead" && t.status === "Overdue")
        out.push({ tone: "bad", text: `${t.id} — lead handover delayed for ${t.linkId}` });
      if (t.type === "Schedule Publishing" && t.status !== "Completed")
        out.push({ tone: "warn", text: `${t.id} — publishing task incomplete for ${t.linkId}` });
      if (t.reassignCount >= 3)
        out.push({ tone: "warn", text: `${t.id} — reassigned ${t.reassignCount} times` });
      if (!t.due || !t.assignee)
        out.push({ tone: "bad", text: `${t.id} — task without an owner or due date` });
    });
    resources.forEach((r) => {
      if (r.status === "Awaiting Approval")
        out.push({ tone: "warn", text: `${r.id} ${r.title} — resource awaiting approval` });
      if (r.status === "Replaced" && r.linked.length)
        out.push({ tone: "bad", text: `${r.id} ${r.title} — outdated asset still linked to ${r.linked.join(", ")} (Do Not Use)` });
    });
    return out;
  }, [tasks, resources]);

  const taskList = useMemo(() => {
    return tasks.filter((t) => {
      if (tab === "My Tasks" && !t.mine) return false;
      if (tab === "Assigned Tasks" && t.mine) return false;
      if (fType !== "all" && t.type !== fType) return false;
      if (fStatus !== "all" && t.status !== fStatus) return false;
      if (q.trim() && ![t.title, t.id, t.linkId ?? "", t.assignee].join(" ").toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [tasks, tab, fType, fStatus, q]);

  const resourceList = useMemo(() => {
    return resources.filter((r) => {
      if (!showAllStatuses && r.status !== "Approved") return false;
      if (fCat !== "all" && r.category !== fCat) return false;
      if (q.trim() && ![r.title, r.id, r.category, r.brand].join(" ").toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [resources, fCat, q, showAllStatuses]);

  const patch = (id: string, p: Partial<SmTask>, msg: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...p, notes: [...t.notes, { at: "Now", by: "Priya Nanda", text: msg }] }
          : t,
      ),
    );
    toast.success(msg);
  };

  const isTaskTab = tab === "My Tasks" || tab === "Assigned Tasks";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead
          title="Tasks & Resources"
          sub="Operational tasks and approved resources for content production, publishing and lead handover. Tasks are actions — content records stay in Content Queue."
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setResourceOpen(true)}>
            <Upload className="h-4 w-4 mr-1" /> Add Resource
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Create Task
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tasks Due Today" value={String(stats.dueToday)} />
        <StatCard label="Overdue Tasks" value={String(stats.overdue)} tone="bad" />
        <StatCard label="Tasks Waiting for Review" value={String(stats.review)} tone="warn" />
        <StatCard label="Recently Updated Resources" value={String(stats.resources)} sub="Updated this month" />
      </div>

      {alerts.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Needs Attention ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1.5 sm:grid-cols-2">
            {alerts.slice(0, 10).map((a, i) => (
              <div
                key={i}
                className={`text-xs rounded-md border px-2 py-1.5 ${
                  a.tone === "bad" ? "border-destructive/40 text-destructive" : "border-amber-300 text-amber-800"
                }`}
              >
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "outline"}
            className="shrink-0"
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      {(isTaskTab || tab === "Resource Library") && (
        <Card>
          <CardContent className="pt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isTaskTab ? "Search task, ID, Content ID, Lead ID" : "Search resources"}
                className="pl-8"
              />
            </div>
            {isTaskTab ? (
              <>
                <Select value={fType} onValueChange={setFType}>
                  <SelectTrigger><SelectValue placeholder="Task type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Task type: All</SelectItem>
                    {TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: All</SelectItem>
                    {TASK_STATUSES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Select value={fCat} onValueChange={setFCat}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Category: All</SelectItem>
                    {RESOURCE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch id="all-st" checked={showAllStatuses} onCheckedChange={setShowAllStatuses} />
                  <Label htmlFor="all-st" className="text-xs">
                    Manager view: show draft, awaiting, replaced and archived
                  </Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* TASKS */}
      {isTaskTab && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {taskList.map((t) => {
            const done = t.checklist.filter((c) => c.done).length;
            return (
              <Card key={t.id} className={t.status === "Overdue" ? "border-destructive/50" : ""}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{t.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {t.id} · {t.type}
                      </div>
                    </div>
                    <Badge className={priorityTone(t.priority)} variant="secondary">{t.priority}</Badge>
                  </div>
                  {t.linkId && (
                    <Badge variant="outline" className="text-[11px]">
                      {t.linkKind === "lead" ? "Lead" : "Content"} {t.linkId}
                    </Badge>
                  )}
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <div>Assigned to {t.assignee} · created by {t.createdBy}</div>
                    <div>Due {t.due || <span className="text-destructive">No due date</span>}</div>
                    <div className="flex items-center gap-1">
                      Opens <ArrowRight className="h-3 w-3" /> {linkTarget(t)}
                    </div>
                  </div>
                  {t.checklist.length > 0 && (
                    <div>
                      <Progress value={(done / t.checklist.length) * 100} className="h-1.5" />
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {done}/{t.checklist.length} checklist items
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge className={statusTone(t.status)} variant="secondary">{t.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setOpenTask(t.id)}>View Task</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {taskList.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks in this view.</p>
          )}
        </div>
      )}

      {/* RESOURCES */}
      {tab === "Resource Library" && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {resourceList.map((r) => (
            <Card key={r.id} className={r.status === "Replaced" ? "border-destructive/50" : ""}>
              <CardContent className="pt-4 space-y-2">
                <div className="h-24 rounded-md bg-muted grid place-items-center text-xs text-muted-foreground">
                  <FileText className="h-6 w-6" />
                  {r.fileType}
                </div>
                <div className="font-semibold text-sm">{r.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {r.id} · {r.category} · {r.brand}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {r.fileType} · {r.version} · updated {r.updated}
                </div>
                {r.previousVersions.length > 0 && (
                  <div className="text-[11px] text-muted-foreground">
                    Previous versions kept: {r.previousVersions.join(", ")}
                  </div>
                )}
                {r.linked.length > 0 && (
                  <div className="text-[11px] text-muted-foreground">Linked to: {r.linked.join(", ")}</div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={resourceTone(r.status)} variant="secondary">{r.status}</Badge>
                  {(r.status === "Replaced" || r.status === "Archived") && (
                    <Badge variant="destructive">Do Not Use</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.info(`${r.title} ${r.version} preview (front-end only).`)}>
                    View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Download queued: ${r.title} ${r.version}`)}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1 border-t">
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                    onClick={() => {
                      const next = `v${(parseFloat(r.version.slice(1)) + 0.1).toFixed(1)}`;
                      setResources((prev) => prev.map((x) => x.id === r.id ? { ...x, previousVersions: [r.version, ...x.previousVersions], version: next, status: "Awaiting Approval", updated: "Today" } : x));
                      toast.success(`New version ${next} uploaded. ${r.version} preserved.`);
                    }}>
                    Upload new version
                  </Button>
                  {r.status === "Awaiting Approval" && (
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                      onClick={() => {
                        setResources((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "Approved" } : x));
                        toast.success("Resource published as approved.");
                      }}>
                      Publish approved
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                    onClick={() => {
                      setResources((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "Archived" } : x));
                      toast.success("Archived. Published content keeps the version it used.");
                    }}>
                    Archive
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                    onClick={() => toast.success(`Recommended "${r.title}" to Karan Doshi (Editor).`)}>
                    Recommend to editor
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                    onClick={() => toast.success("Linked to Content ID / campaign / task.")}>
                    Link to Content ID
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {resourceList.length === 0 && (
            <p className="text-sm text-muted-foreground">No resources match this view.</p>
          )}
          <p className="sm:col-span-2 xl:col-span-3 text-[11px] text-muted-foreground">
            Normal users only see Approved resources. Draft, awaiting, replaced and archived items appear in manager view and are never deleted.
          </p>
        </div>
      )}

      {/* TEMPLATES */}
      {tab === "Content Templates" && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CONTENT_TEMPLATES.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-4 space-y-2">
                <div className="h-20 rounded-md bg-muted grid place-items-center text-xs text-muted-foreground">
                  {t.name} template
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{t.name}</div>
                  <Badge variant="secondary">{t.version}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{t.spec}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.info(`${t.name} template opened (front-end preview).`)}>View</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Task template created from ${t.name}.`)}>
                    Create task template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* BRAND GUIDELINES */}
      {tab === "Brand Guidelines" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Brand Guidelines (v4.0 — Approved)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {BRAND_GUIDE.map((g) => (
                <div key={g.k} className="rounded-md border p-2">
                  <div className="font-medium">{g.k}</div>
                  <div className="text-muted-foreground">{g.v}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Colour & Logo Preview</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {["bg-primary", "bg-foreground", "bg-muted", "bg-destructive"].map((c) => (
                    <div key={c} className={`h-12 flex-1 rounded ${c}`} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Horizontal", "Stacked", "Monogram"].map((l) => (
                    <div key={l} className="h-16 rounded border grid place-items-center text-[11px] text-muted-foreground">
                      {l}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Correct & Incorrect Usage</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {USAGE_EXAMPLES.map((u, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-md border px-2 py-1.5 ${
                      u.ok ? "border-emerald-300 text-emerald-800" : "border-destructive/40 text-destructive"
                    }`}
                  >
                    {u.ok ? "Correct — " : "Incorrect — "}
                    {u.text}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TASK DETAIL */}
      <Dialog open={!!current} onOpenChange={(o) => !o && setOpenTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {current && (
            <>
              <DialogHeader>
                <DialogTitle>{current.title}</DialogTitle>
                <DialogDescription>
                  {current.id} · {current.type} · {current.linkId ? `${current.linkKind === "lead" ? "Lead" : "Content"} ${current.linkId}` : "No linked record"} · opens {linkTarget(current)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                {[
                  ["Assigned user", current.assignee],
                  ["Created by", current.createdBy],
                  ["Priority", current.priority],
                  ["Start date", current.start || "—"],
                  ["Due date and time", current.due || "Not set"],
                  ["Status", current.status],
                  ["Review required", current.reviewRequired ? "Yes" : "No"],
                  ["Reminder", current.reminder],
                  ["Times reassigned", String(current.reassignCount)],
                  ["Attachment", "Placeholder — file storage not enabled"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-md border p-2">
                    <div className="text-muted-foreground">{k}</div>
                    <div className="font-medium">{v}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-md border p-3 text-xs">
                <div className="font-medium mb-1">Description</div>
                {current.description}
              </div>

              <div className="rounded-md border p-3">
                <div className="text-sm font-semibold mb-2">Checklist</div>
                {current.checklist.map((c, i) => (
                  <label key={c.label} className="flex items-center gap-2 text-xs mb-1">
                    <Checkbox
                      checked={c.done}
                      onCheckedChange={(v) =>
                        setTasks((prev) =>
                          prev.map((t) =>
                            t.id === current.id
                              ? {
                                  ...t,
                                  checklist: t.checklist.map((x, xi) => (xi === i ? { ...x, done: !!v } : x)),
                                }
                              : t,
                          ),
                        )
                      }
                    />
                    {c.label}
                  </label>
                ))}
                {current.checklist.length === 0 && <p className="text-xs text-muted-foreground">No checklist items.</p>}
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <div className="text-sm font-semibold">Notes & activity</div>
                {current.notes.map((n, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    <b className="text-foreground">{n.at}</b> · {n.by} — {n.text}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" className="text-xs" />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!note.trim()) return;
                      patch(current.id, {}, note.trim());
                      setNote("");
                    }}
                  >
                    Add Note
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => patch(current.id, { status: "In Progress" }, "Task started")}>Start Task</Button>
                <Button size="sm" variant="outline" onClick={() => patch(current.id, {}, "Progress updated")}>Update Progress</Button>
                <Select onValueChange={(v) => patch(current.id, { assignee: v, reassignCount: current.reassignCount + 1 }, `Reassigned to ${v}`)}>
                  <SelectTrigger className="w-[190px] h-9 text-xs"><SelectValue placeholder="Reassign task" /></SelectTrigger>
                  <SelectContent>{USERS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
                <Input
                  type="datetime-local"
                  className="w-[210px] h-9 text-xs"
                  onChange={(e) => patch(current.id, { due: e.target.value.replace("T", ", "), status: current.status === "Overdue" ? "In Progress" : current.status }, "Deadline changed")}
                />
                <Button size="sm" variant="outline" onClick={() => patch(current.id, { status: "Waiting for Review" }, "Submitted for review")}>
                  Submit for Review
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={current.reviewRequired && current.status !== "Waiting for Review"}
                  onClick={() => patch(current.id, { status: "Completed" }, "Marked completed — Dashboard and Performance updated")}
                >
                  Mark Completed
                </Button>
                <Button size="sm" variant="ghost" onClick={() => patch(current.id, { status: "Cancelled" }, "Cancelled — reason: no longer required")}>
                  Cancel with Reason
                </Button>
              </div>
              {current.reviewRequired && current.status !== "Waiting for Review" && current.status !== "Completed" && (
                <p className="text-[11px] text-destructive">This task requires review — submit for review before completing.</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE TASK */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Tasks represent actions. Link to an existing Content ID or Lead ID — never create a duplicate record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <Input placeholder="Task title" value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })} />
            <Select value={nt.type} onValueChange={(v) => setNt({ ...nt, type: v as TaskType })}>
              <SelectTrigger><SelectValue placeholder="Task type" /></SelectTrigger>
              <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Related Content ID or Lead ID (e.g. CC-CN-1049 / CC-LD-5205)" value={nt.link} onChange={(e) => setNt({ ...nt, link: e.target.value })} />
            <Select value={nt.assignee} onValueChange={(v) => setNt({ ...nt, assignee: v })}>
              <SelectTrigger><SelectValue placeholder="Assigned user" /></SelectTrigger>
              <SelectContent>{USERS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Description" value={nt.description} onChange={(e) => setNt({ ...nt, description: e.target.value })} />
            <Textarea placeholder="Checklist — one item per line" value={nt.checklist} onChange={(e) => setNt({ ...nt, checklist: e.target.value })} />
            <Select value={nt.priority} onValueChange={(v) => setNt({ ...nt, priority: v as SmTask["priority"] })}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>{["Urgent", "High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start date</Label>
                <Input type="date" value={nt.start} onChange={(e) => setNt({ ...nt, start: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Due date and time</Label>
                <Input type="datetime-local" value={nt.due} onChange={(e) => setNt({ ...nt, due: e.target.value })} />
              </div>
            </div>
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
              Attachment placeholder — file storage is not enabled yet.
            </div>
            <div className="flex items-center gap-2">
              <Switch id="rev" checked={nt.review} onCheckedChange={(v) => setNt({ ...nt, review: v })} />
              <Label htmlFor="rev" className="text-xs">Review required before completion</Label>
            </div>
            <Select value={nt.reminder} onValueChange={(v) => setNt({ ...nt, reminder: v })}>
              <SelectTrigger><SelectValue placeholder="Reminder timing" /></SelectTrigger>
              <SelectContent>
                {["15 minutes before due", "30 minutes before due", "1 hour before due", "2 hours before due", "1 day before due"].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              disabled={!nt.title.trim() || !nt.due}
              onClick={() => {
                const id = `SM-TSK-${3010 + tasks.length}`;
                setTasks((prev) => [
                  {
                    id,
                    title: nt.title.trim(),
                    type: nt.type,
                    linkId: nt.link.trim() || undefined,
                    linkKind: nt.link.toUpperCase().includes("-LD-") ? "lead" : "content",
                    assignee: nt.assignee,
                    createdBy: "Priya Nanda",
                    priority: nt.priority,
                    due: nt.due.replace("T", ", "),
                    start: nt.start,
                    status: "Not Started",
                    description: nt.description,
                    checklist: nt.checklist.split("\n").filter(Boolean).map((l) => ({ label: l.trim(), done: false })),
                    reviewRequired: nt.review,
                    reminder: nt.reminder,
                    reassignCount: 0,
                    notes: [],
                    mine: nt.assignee === "Priya Nanda",
                  },
                  ...prev,
                ]);
                setCreateOpen(false);
                setNt({ ...nt, title: "", link: "", description: "", checklist: "", due: "" });
                toast.success(`${id} created and assigned to ${nt.assignee}.`);
              }}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD RESOURCE */}
      <Dialog open={resourceOpen} onOpenChange={setResourceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              Uploaded resources start as Draft and become visible to normal users only after approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <Input placeholder="Resource title" />
            <Select>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{RESOURCE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select>
              <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>
                {["All Brands", "Clean Craft Franchise", "Clean Craft Services", "GILM Institute"].map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Link to Content ID, campaign or task (optional)" />
            <div className="rounded-md border border-dashed p-6 text-xs text-muted-foreground text-center">
              <FolderOpen className="h-5 w-5 mx-auto mb-1" />
              File upload placeholder — cloud storage is not connected yet.
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setResourceOpen(false);
                toast.success("Resource saved as Draft — send for approval to publish.");
              }}
            >
              Save Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
