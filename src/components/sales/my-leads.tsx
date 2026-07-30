import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search, Plus, Upload, Phone, MessageCircle, StickyNote, CheckSquare, CalendarClock,
  Video, Eye, AlertTriangle, Filter, X, Trophy, Ban, Clock, MapPin, Wallet, Target,
} from "lucide-react";

/* ------------------------------- types ------------------------------- */

type Priority = "Urgent" | "High" | "Medium" | "Low";
type Stage =
  | "New Lead" | "Contacted" | "Qualified" | "Proposal Sent"
  | "Meeting Scheduled" | "Negotiation" | "Won" | "Lost";

type Timeline = { at: string; kind: string; note: string };

export type CrmLead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  unit: string;
  source: string;
  campaign: string;
  stage: Stage;
  priority: Priority;
  score: number;
  owner: string;
  lastInteraction: string;
  nextAction: string;
  followupAt: string; // ISO datetime
  createdAt: string;
  budget: string;
  cityPreference: string;
  timeline: string;
  scoreReasons: string[];
  history: Timeline[];
  notes: string[];
  tasks: { title: string; due: string; done: boolean }[];
  meetings: { title: string; at: string; mode: string }[];
  documents: string[];
  lostReason?: string;
};

const STAGES: Stage[] = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Meeting Scheduled", "Negotiation", "Won", "Lost"];
const PRIORITIES: Priority[] = ["Urgent", "High", "Medium", "Low"];
const SOURCES = ["Website", "Meta Ads", "Google Ads", "Referral", "Walk-in", "IndiaMART", "Exhibition"];
const CAMPAIGNS = ["Franchise Q3", "City Expansion", "Referral Drive", "Brand Awareness", "—"];
const UNITS = ["Franchise", "Master Franchise", "Corporate Tie-up", "B2B Laundry"];
const OWNERS = ["Ravi Sharma", "Neha Kulkarni", "Amit Bansal"];

const PRIORITY_RANK: Record<Priority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

/* ------------------------------ sample data ------------------------------ */

function iso(dayOffset: number, hh = 10, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

const SAMPLE: CrmLead[] = [
  {
    id: "CC-1042", name: "Rohit Agarwal", phone: "+91 98290 11234", email: "rohit.agarwal@gmail.com",
    city: "Jaipur", state: "Rajasthan", unit: "Franchise", source: "Meta Ads", campaign: "Franchise Q3",
    stage: "Proposal Sent", priority: "Urgent", score: 96, owner: "Ravi Sharma",
    lastInteraction: "Call · 3 days ago", nextAction: "Proposal follow-up call", followupAt: iso(-1, 11, 0),
    createdAt: iso(-21), budget: "₹25–30 L", cityPreference: "Jaipur (Vaishali Nagar)", timeline: "Within 30 days",
    scoreReasons: ["Budget confirmed", "Site shortlisted", "Responded to 4/4 calls", "Proposal opened 3 times"],
    history: [
      { at: iso(-21, 12), kind: "Lead created", note: "Inbound from Meta Ads — Franchise Q3" },
      { at: iso(-18, 15), kind: "Call", note: "Discovery call, 14 mins. Budget ₹25–30L confirmed." },
      { at: iso(-9, 11), kind: "Meeting", note: "Google Meet walkthrough of unit economics." },
      { at: iso(-3, 16), kind: "Proposal", note: "Franchise proposal + ROI sheet shared." },
    ],
    notes: ["Prefers evening calls after 6 PM.", "Brother is a co-investor."],
    tasks: [{ title: "Share revised ROI sheet", due: iso(0, 17), done: false }],
    meetings: [{ title: "Agreement discussion", at: iso(2, 11), mode: "Google Meet" }],
    documents: ["Franchise Proposal v2.pdf", "ROI Sheet.xlsx"],
  },
  {
    id: "CC-1039", name: "Meena Sharma", phone: "+91 99300 44521", email: "meena.sharma@outlook.com",
    city: "Indore", state: "Madhya Pradesh", unit: "Franchise", source: "Referral", campaign: "Referral Drive",
    stage: "Negotiation", priority: "Urgent", score: 92, owner: "Ravi Sharma",
    lastInteraction: "WhatsApp · yesterday", nextAction: "Collect signed engagement letter", followupAt: iso(0, 11, 30),
    createdAt: iso(-30), budget: "₹20–25 L", cityPreference: "Indore (Vijay Nagar)", timeline: "Within 15 days",
    scoreReasons: ["Referred by existing partner", "Engagement letter shared", "High intent"],
    history: [
      { at: iso(-30, 10), kind: "Lead created", note: "Referral from Jaipur partner." },
      { at: iso(-12, 14), kind: "Meeting", note: "Store visit at Indore pilot store." },
      { at: iso(-1, 18), kind: "WhatsApp", note: "Engagement letter sent for signature." },
    ],
    notes: ["Wants a corner shop location."],
    tasks: [{ title: "Follow up on EL signature", due: iso(0, 11, 30), done: false }],
    meetings: [], documents: ["Engagement Letter.pdf"],
  },
  {
    id: "CC-1051", name: "Sandeep Verma", phone: "+91 90050 77812", email: "sandeep.verma@gmail.com",
    city: "Lucknow", state: "Uttar Pradesh", unit: "Master Franchise", source: "Google Ads", campaign: "City Expansion",
    stage: "Qualified", priority: "High", score: 84, owner: "Neha Kulkarni",
    lastInteraction: "Call · 2 days ago", nextAction: "Send ROI comparison", followupAt: iso(0, 13, 0),
    createdAt: iso(-11), budget: "₹40 L+", cityPreference: "Lucknow (Gomti Nagar)", timeline: "1–2 months",
    scoreReasons: ["Master franchise intent", "Strong capital", "Asked for ROI sheet"],
    history: [
      { at: iso(-11, 9), kind: "Lead created", note: "Google Ads — City Expansion." },
      { at: iso(-2, 12), kind: "Call", note: "Qualified. Interested in 3-store territory." },
    ],
    notes: [], tasks: [], meetings: [], documents: [],
  },
  {
    id: "CC-1055", name: "Priya Nair", phone: "+91 98765 32109", email: "priya.nair@yahoo.com",
    city: "Surat", state: "Gujarat", unit: "Franchise", source: "Website", campaign: "Brand Awareness",
    stage: "Meeting Scheduled", priority: "High", score: 78, owner: "Ravi Sharma",
    lastInteraction: "WhatsApp · today", nextAction: "Confirm site visit attendance", followupAt: iso(0, 16, 0),
    createdAt: iso(-7), budget: "₹18–22 L", cityPreference: "Surat (Adajan)", timeline: "Within 45 days",
    scoreReasons: ["Meeting booked", "Location finalised"],
    history: [{ at: iso(-7, 10), kind: "Lead created", note: "Website enquiry form." }],
    notes: [], tasks: [], meetings: [{ title: "Site visit", at: iso(1, 15, 30), mode: "Store Visit" }], documents: [],
  },
  {
    id: "CC-1060", name: "Ankit Gupta", phone: "+91 88006 11220", email: "ankit.gupta@gmail.com",
    city: "Pune", state: "Maharashtra", unit: "Franchise", source: "IndiaMART", campaign: "—",
    stage: "New Lead", priority: "Medium", score: 61, owner: "Amit Bansal",
    lastInteraction: "—", nextAction: "First contact call", followupAt: iso(0, 18, 0),
    createdAt: iso(0, 9), budget: "Not disclosed", cityPreference: "Pune", timeline: "Exploring",
    scoreReasons: ["Fresh inbound", "No contact yet"],
    history: [{ at: iso(0, 9), kind: "Lead created", note: "IndiaMART enquiry." }],
    notes: [], tasks: [], meetings: [], documents: [],
  },
  {
    id: "CC-1029", name: "Kavita Rao", phone: "+91 97400 55678", email: "kavita.rao@gmail.com",
    city: "Bengaluru", state: "Karnataka", unit: "B2B Laundry", source: "Exhibition", campaign: "Brand Awareness",
    stage: "Contacted", priority: "Medium", score: 55, owner: "Neha Kulkarni",
    lastInteraction: "Call · 6 days ago", nextAction: "Share company profile", followupAt: iso(3, 12, 0),
    createdAt: iso(-16), budget: "₹15 L", cityPreference: "Bengaluru (Whitefield)", timeline: "3+ months",
    scoreReasons: ["Low urgency", "Budget below threshold"],
    history: [{ at: iso(-16, 11), kind: "Lead created", note: "Exhibition booth walk-in." }],
    notes: [], tasks: [], meetings: [], documents: [],
  },
  {
    id: "CC-1018", name: "Harpreet Singh", phone: "+91 98155 90011", email: "harpreet.s@gmail.com",
    city: "Ludhiana", state: "Punjab", unit: "Franchise", source: "Referral", campaign: "Referral Drive",
    stage: "Won", priority: "Low", score: 100, owner: "Ravi Sharma",
    lastInteraction: "Meeting · 4 days ago", nextAction: "—", followupAt: "",
    createdAt: iso(-58), budget: "₹28 L", cityPreference: "Ludhiana (Model Town)", timeline: "Closed",
    scoreReasons: ["Booking amount received", "Agreement signed"],
    history: [{ at: iso(-4, 12), kind: "Won", note: "Booking amount ₹2.5L received." }],
    notes: ["Handover to Project Coordinator done."], tasks: [], meetings: [], documents: ["Signed Agreement.pdf"],
  },
  {
    id: "CC-1002", name: "Deepak Joshi", phone: "+91 93110 22334", email: "deepak.joshi@gmail.com",
    city: "Delhi", state: "Delhi", unit: "Franchise", source: "Walk-in", campaign: "—",
    stage: "Lost", priority: "Low", score: 22, owner: "Amit Bansal",
    lastInteraction: "Call · 3 weeks ago", nextAction: "—", followupAt: "",
    createdAt: iso(-70), budget: "₹8 L", cityPreference: "Delhi", timeline: "—",
    scoreReasons: ["Budget mismatch"], lostReason: "Budget below minimum investment",
    history: [{ at: iso(-21, 15), kind: "Lost", note: "Budget below minimum investment." }],
    notes: [], tasks: [], meetings: [], documents: [],
  },
  {
    id: "CC-1047", name: "Farhan Qureshi", phone: "+91 90040 88123", email: "farhan.q@gmail.com",
    city: "Bhopal", state: "Madhya Pradesh", unit: "Franchise", source: "Meta Ads", campaign: "Franchise Q3",
    stage: "Contacted", priority: "High", score: 71, owner: "Neha Kulkarni",
    lastInteraction: "Call · 5 days ago", nextAction: "Qualification call", followupAt: iso(-2, 15, 0),
    createdAt: iso(-14), budget: "₹20 L", cityPreference: "Bhopal (Arera Colony)", timeline: "Within 60 days",
    scoreReasons: ["Answered first call", "Follow-up overdue"],
    history: [{ at: iso(-14, 10), kind: "Lead created", note: "Meta Ads campaign." }],
    notes: [], tasks: [], meetings: [], documents: [],
  },
  {
    id: "CC-1058", name: "Sneha Patil", phone: "+91 91300 76540", email: "sneha.patil@gmail.com",
    city: "Nashik", state: "Maharashtra", unit: "Franchise", source: "Website", campaign: "City Expansion",
    stage: "Meeting Scheduled", priority: "Medium", score: 68, owner: "Amit Bansal",
    lastInteraction: "WhatsApp · 2 days ago", nextAction: "Send meeting agenda", followupAt: iso(2, 10, 30),
    createdAt: iso(-9), budget: "₹22 L", cityPreference: "Nashik", timeline: "Within 45 days",
    scoreReasons: ["Meeting confirmed"],
    history: [{ at: iso(-9, 13), kind: "Lead created", note: "Website enquiry." }],
    notes: [], tasks: [], meetings: [{ title: "Intro meeting", at: iso(2, 11), mode: "Google Meet" }], documents: [],
  },
];

/* ------------------------------ helpers ------------------------------ */

const norm = (s: string) => s.replace(/\D/g, "").slice(-10);

function dueState(l: CrmLead): "overdue" | "today" | "future" | "none" {
  if (!l.followupAt || l.stage === "Won" || l.stage === "Lost") return "none";
  const d = new Date(l.followupAt);
  const now = new Date();
  if (d.getTime() < now.getTime()) return "overdue";
  if (d.toDateString() === now.toDateString()) return "today";
  return "future";
}

function fmtDT(v: string) {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function fmtD(v: string) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}

const PRIORITY_STYLE: Record<Priority, string> = {
  Urgent: "bg-destructive/10 text-destructive border-destructive/20",
  High: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Medium: "bg-primary/10 text-primary border-primary/20",
  Low: "bg-muted text-muted-foreground border-border",
};
const PRIORITY_BAR: Record<Priority, string> = {
  Urgent: "bg-destructive", High: "bg-amber-500", Medium: "bg-primary", Low: "bg-muted-foreground/40",
};

const TABS = ["All Leads", "New", "Hot", "Follow-up Due", "Overdue", "Meetings Scheduled", "Won", "Lost"] as const;
type TabKey = (typeof TABS)[number];

function inTab(l: CrmLead, tab: TabKey) {
  const s = dueState(l);
  switch (tab) {
    case "All Leads": return true;
    case "New": return l.stage === "New Lead";
    case "Hot": return l.score >= 80 && l.stage !== "Won" && l.stage !== "Lost";
    case "Follow-up Due": return s === "today";
    case "Overdue": return s === "overdue";
    case "Meetings Scheduled": return l.stage === "Meeting Scheduled" || l.meetings.length > 0;
    case "Won": return l.stage === "Won";
    case "Lost": return l.stage === "Lost";
  }
}

const ANY = "__any__";

/* ------------------------------ component ------------------------------ */

export function MyLeads({ canImport = true }: { canImport?: boolean }) {
  const [leads, setLeads] = useState<CrmLead[]>(SAMPLE);
  const [tab, setTab] = useState<TabKey>("All Leads");
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [lostFor, setLostFor] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  const [f, setF] = useState({
    stage: ANY, priority: ANY, source: ANY, campaign: ANY, city: ANY, state: ANY,
    owner: ANY, unit: ANY, minScore: "", lastContacted: "", nextFollowup: "", created: "",
  });
  const setFilter = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const resetFilters = () => setF({
    stage: ANY, priority: ANY, source: ANY, campaign: ANY, city: ANY, state: ANY,
    owner: ANY, unit: ANY, minScore: "", lastContacted: "", nextFollowup: "", created: "",
  });
  const activeFilters = Object.values(f).filter((v) => v && v !== ANY).length;

  const cities = useMemo(() => Array.from(new Set(leads.map((l) => l.city))).sort(), [leads]);
  const states = useMemo(() => Array.from(new Set(leads.map((l) => l.state))).sort(), [leads]);

  const counts = useMemo(() => {
    const c = {} as Record<TabKey, number>;
    TABS.forEach((t) => { c[t] = leads.filter((l) => inTab(l, t)).length; });
    return c;
  }, [leads]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads
      .filter((l) => inTab(l, tab))
      .filter((l) =>
        !needle ||
        [l.name, l.id, l.phone, l.city, l.email, l.owner].join(" ").toLowerCase().includes(needle))
      .filter((l) => (f.stage === ANY || l.stage === f.stage))
      .filter((l) => (f.priority === ANY || l.priority === f.priority))
      .filter((l) => (f.source === ANY || l.source === f.source))
      .filter((l) => (f.campaign === ANY || l.campaign === f.campaign))
      .filter((l) => (f.city === ANY || l.city === f.city))
      .filter((l) => (f.state === ANY || l.state === f.state))
      .filter((l) => (f.owner === ANY || l.owner === f.owner))
      .filter((l) => (f.unit === ANY || l.unit === f.unit))
      .filter((l) => (!f.minScore || l.score >= Number(f.minScore)))
      .filter((l) => (!f.nextFollowup || (l.followupAt || "").slice(0, 10) === f.nextFollowup))
      .filter((l) => (!f.created || l.createdAt.slice(0, 10) === f.created))
      .filter((l) => {
        if (!f.lastContacted) return true;
        const last = [...l.history].reverse().find((h) => h.kind !== "Lead created");
        return !!last && last.at.slice(0, 10) === f.lastContacted;
      })
      .sort((a, b) => {
        const ds = { overdue: 0, today: 1, future: 2, none: 3 } as const;
        const d = ds[dueState(a)] - ds[dueState(b)];
        if (d !== 0) return d;
        const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (p !== 0) return p;
        return b.score - a.score;
      });
  }, [leads, tab, q, f]);

  const selected = leads.find((l) => l.id === selectedId) || null;

  function patch(id: string, fn: (l: CrmLead) => CrmLead) {
    setLeads((prev) => prev.map((l) => (l.id === id ? fn(l) : l)));
    setUpdatedAt(new Date());
  }

  function logEvent(l: CrmLead, kind: string, note: string): CrmLead {
    return { ...l, history: [...l.history, { at: new Date().toISOString(), kind, note }], lastInteraction: `${kind} · just now` };
  }

  function quickAction(l: CrmLead, kind: string) {
    switch (kind) {
      case "Call":
        patch(l.id, (x) => logEvent({ ...x, nextAction: "Call logged — set next action", stage: x.stage === "New Lead" ? "Contacted" : x.stage }, "Call", "Call queued in Priority Call Queue."));
        toast.success(`Call added to Priority Call Queue for ${l.name}`);
        break;
      case "WhatsApp":
        patch(l.id, (x) => logEvent(x, "WhatsApp", "WhatsApp message logged."));
        toast.success(`WhatsApp logged for ${l.name}`);
        break;
      case "Note": {
        const n = window.prompt(`Add note for ${l.name}`);
        if (!n) return;
        patch(l.id, (x) => logEvent({ ...x, notes: [...x.notes, n] }, "Note", n));
        toast.success("Note added");
        break;
      }
      case "Task": {
        const t = window.prompt(`Task title for ${l.name}`);
        if (!t) return;
        patch(l.id, (x) => logEvent({ ...x, tasks: [...x.tasks, { title: t, due: iso(1, 11), done: false }], nextAction: t }, "Task", `Task created: ${t}`));
        toast.success("Task created — visible in Notes & Tasks");
        break;
      }
      case "Follow-up":
        patch(l.id, (x) => logEvent({ ...x, followupAt: iso(1, 11), nextAction: x.nextAction === "—" ? "Follow-up call" : x.nextAction }, "Follow-up", "Follow-up scheduled for tomorrow 11:00 AM."));
        toast.success("Follow-up added to Follow-ups & Reminders");
        break;
      case "Meeting":
        patch(l.id, (x) => logEvent({
          ...x, stage: x.stage === "Won" || x.stage === "Lost" ? x.stage : "Meeting Scheduled",
          meetings: [...x.meetings, { title: "Discovery meeting", at: iso(2, 11), mode: "Google Meet" }],
        }, "Meeting", "Meeting scheduled — added to Meetings."));
        toast.success("Meeting added to Meetings");
        break;
    }
  }

  function changeStage(l: CrmLead, stage: Stage) {
    if (stage === "Lost") { setLostFor(l.id); setLostReason(""); return; }
    patch(l.id, (x) => logEvent({
      ...x, stage,
      followupAt: stage === "Won" ? "" : x.followupAt,
      nextAction: stage === "Won" ? "—" : x.nextAction,
      priority: stage === "Won" ? "Low" : x.priority,
    }, "Stage change", `Stage moved to ${stage} — Sales Pipeline updated.`));
    toast.success(`Stage updated to ${stage} · Pipeline refreshed`);
  }

  function confirmLost() {
    if (!lostFor) return;
    if (!lostReason.trim()) { toast.error("A reason is required to mark a lead Lost"); return; }
    patch(lostFor, (x) => logEvent({ ...x, stage: "Lost", lostReason: lostReason.trim(), followupAt: "", nextAction: "—", priority: "Low" }, "Lost", lostReason.trim()));
    toast.success("Lead marked Lost and removed from active queues");
    setLostFor(null); setLostReason("");
  }

  const totalDisplay = leads.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">My Leads</h2>
          <p className="text-sm text-muted-foreground">
            {totalDisplay} assigned leads · Last updated {updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, phone, city…" className="pl-9" />
          </div>
          <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters((s) => !s)}>
            <Filter className="w-4 h-4 mr-1" /> Filters{activeFilters ? ` (${activeFilters})` : ""}
          </Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add Lead</Button>
          {canImport && <Button variant="outline" onClick={() => toast.info("Import available for authorised roles")}><Upload className="w-4 h-4 mr-1" /> Import</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t} type="button" onClick={() => setTab(t)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors",
              tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border text-muted-foreground",
              t === "Overdue" && counts[t] > 0 && tab !== t && "border-destructive/30 text-destructive",
            )}
          >
            {t} <span className="ml-1 tabular-nums opacity-80">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="rounded-2xl">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FilterSelect label="Lead stage" value={f.stage} onChange={(v) => setFilter("stage", v)} options={STAGES} />
            <FilterSelect label="Priority" value={f.priority} onChange={(v) => setFilter("priority", v)} options={PRIORITIES} />
            <FilterSelect label="Source" value={f.source} onChange={(v) => setFilter("source", v)} options={SOURCES} />
            <FilterSelect label="Campaign" value={f.campaign} onChange={(v) => setFilter("campaign", v)} options={CAMPAIGNS} />
            <FilterSelect label="City" value={f.city} onChange={(v) => setFilter("city", v)} options={cities} />
            <FilterSelect label="State" value={f.state} onChange={(v) => setFilter("state", v)} options={states} />
            <FilterSelect label="Assigned salesperson" value={f.owner} onChange={(v) => setFilter("owner", v)} options={OWNERS} />
            <FilterSelect label="Business unit" value={f.unit} onChange={(v) => setFilter("unit", v)} options={UNITS} />
            <Field label="Lead score (min)">
              <Input type="number" min={0} max={100} value={f.minScore} onChange={(e) => setFilter("minScore", e.target.value)} placeholder="0–100" />
            </Field>
            <Field label="Last contacted"><Input type="date" value={f.lastContacted} onChange={(e) => setFilter("lastContacted", e.target.value)} /></Field>
            <Field label="Next follow-up"><Input type="date" value={f.nextFollowup} onChange={(e) => setFilter("nextFollowup", e.target.value)} /></Field>
            <Field label="Created date"><Input type="date" value={f.created} onChange={(e) => setFilter("created", e.target.value)} /></Field>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters}><X className="w-4 h-4 mr-1" /> Clear filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desktop table */}
      <Card className="rounded-2xl hidden lg:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="[&>th]:text-left [&>th]:font-medium [&>th]:px-3 [&>th]:py-2.5 whitespace-nowrap">
                <th className="w-1"></th>
                <th>Lead</th><th>Phone</th><th>City</th><th>Business unit</th><th>Source</th>
                <th>Stage</th><th>Score</th><th>Owner</th><th>Last interaction</th><th>Next action</th>
                <th>Follow-up due</th><th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const st = dueState(l);
                return (
                  <tr
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className={cn(
                      "border-t cursor-pointer hover:bg-muted/40 transition-colors [&>td]:px-3 [&>td]:py-2.5 align-middle",
                      st === "overdue" && "bg-destructive/5",
                      st === "today" && "bg-amber-500/5",
                    )}
                  >
                    <td className="p-0"><div className={cn("w-1 h-10 rounded-r", PRIORITY_BAR[l.priority])} /></td>
                    <td>
                      <div className="font-medium leading-tight">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.id} · <span className={cn("font-medium", l.priority === "Urgent" && "text-destructive")}>{l.priority}</span></div>
                    </td>
                    <td className="whitespace-nowrap tabular-nums">{l.phone}</td>
                    <td>{l.city}</td>
                    <td className="whitespace-nowrap">{l.unit}</td>
                    <td className="whitespace-nowrap">{l.source}</td>
                    <td><Badge variant="outline" className="whitespace-nowrap">{l.stage}</Badge></td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[86px]">
                        <Progress value={l.score} className="h-1.5 w-12" />
                        <span className="tabular-nums text-xs">{l.score}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{l.owner}</td>
                    <td className="whitespace-nowrap text-muted-foreground">{l.lastInteraction}</td>
                    <td className="max-w-[180px] truncate">{l.nextAction}</td>
                    <td className={cn("whitespace-nowrap", st === "overdue" && "text-destructive font-medium", st === "today" && "text-amber-700 font-medium")}>
                      {st === "overdue" && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                      {fmtDT(l.followupAt)}
                    </td>
                    <td onClick={(e) => e.stopPropagation()} className="text-right pr-3">
                      <QuickActions lead={l} onAction={quickAction} onView={() => setSelectedId(l.id)} />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={13} className="px-4 py-10 text-center text-muted-foreground">No leads match the current view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {rows.map((l) => {
          const st = dueState(l);
          return (
            <Card key={l.id} className={cn("rounded-2xl", st === "overdue" && "border-destructive/40", st === "today" && "border-amber-500/40")}>
              <CardContent className="p-4 space-y-3" onClick={() => setSelectedId(l.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.id} · {l.city} · {l.unit}</div>
                  </div>
                  <Badge variant="outline" className={PRIORITY_STYLE[l.priority]}>{l.priority}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Meta label="Stage" value={l.stage} />
                  <Meta label="Score" value={`${l.score}/100`} />
                  <Meta label="Owner" value={l.owner} />
                  <Meta label="Source" value={l.source} />
                  <Meta label="Last" value={l.lastInteraction} />
                  <Meta label="Next" value={l.nextAction} />
                </div>
                <div className={cn("text-xs font-medium", st === "overdue" ? "text-destructive" : st === "today" ? "text-amber-700" : "text-muted-foreground")}>
                  Follow-up: {fmtDT(l.followupAt)} {st === "overdue" && "· Overdue"}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <QuickActions lead={l} onAction={quickAction} onView={() => setSelectedId(l.id)} wrap />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No leads match the current view.</p>}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selected.name}
                  <Badge variant="outline" className={PRIORITY_STYLE[selected.priority]}>{selected.priority}</Badge>
                </SheetTitle>
              </SheetHeader>
              <LeadDetail
                lead={selected}
                onAction={quickAction}
                onStage={(s) => changeStage(selected, s)}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Lost reason */}
      <Dialog open={!!lostFor} onOpenChange={(o) => !o && setLostFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark lead as Lost</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">A reason is mandatory. The lead will be removed from all active action queues.</p>
          <Textarea value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="Reason for loss (budget, location, competitor, unresponsive…)" rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLostFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmLost}>Mark Lost</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add lead */}
      <AddLeadDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={leads}
        onCreate={(l) => { setLeads((p) => [l, ...p]); setUpdatedAt(new Date()); }}
      />
    </div>
  );
}

/* ------------------------------ sub components ------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="text-xs text-muted-foreground">{label}</label>{children}</div>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><span className="text-muted-foreground">{label}: </span><span className="font-medium">{value}</span></div>;
}

function QuickActions({ lead, onAction, onView, wrap }: {
  lead: CrmLead; onAction: (l: CrmLead, kind: string) => void; onView: () => void; wrap?: boolean;
}) {
  const closed = lead.stage === "Won" || lead.stage === "Lost";
  const items = [
    { kind: "Call", icon: Phone, title: "Call" },
    { kind: "WhatsApp", icon: MessageCircle, title: "WhatsApp" },
    { kind: "Note", icon: StickyNote, title: "Add Note" },
    { kind: "Task", icon: CheckSquare, title: "Create Task" },
    { kind: "Follow-up", icon: CalendarClock, title: "Schedule Follow-up" },
    { kind: "Meeting", icon: Video, title: "Schedule Meeting" },
  ];
  return (
    <div className={cn("flex items-center gap-1", wrap && "flex-wrap")}>
      {items.map((i) => (
        <Button key={i.kind} size="icon" variant="ghost" className="h-8 w-8" title={i.title}
          disabled={closed && i.kind !== "Note"}
          onClick={() => onAction(lead, i.kind)}>
          <i.icon className="w-4 h-4" />
        </Button>
      ))}
      <Button size="icon" variant="ghost" className="h-8 w-8" title="View Lead" onClick={onView}><Eye className="w-4 h-4" /></Button>
    </div>
  );
}

function LeadDetail({ lead, onAction, onStage }: {
  lead: CrmLead; onAction: (l: CrmLead, kind: string) => void; onStage: (s: Stage) => void;
}) {
  const st = dueState(lead);
  const nba = lead.stage === "Won" ? "Lead closed — handover to Project Coordinator"
    : lead.stage === "Lost" ? `Closed lost — ${lead.lostReason ?? "no reason recorded"}`
    : st === "overdue" ? `Call now — follow-up overdue since ${fmtDT(lead.followupAt)}`
    : lead.nextAction;

  return (
    <div className="mt-4 space-y-5 pb-8">
      {st === "overdue" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Follow-up overdue since {fmtDT(lead.followupAt)}
        </div>
      )}

      <div className="rounded-xl border bg-muted/30 p-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Next Best Action</div>
        <div className="text-sm font-medium">{nba}</div>
      </div>

      <Block title="Contact information">
        <Row icon={Phone} label="Phone" value={lead.phone} />
        <Row icon={MessageCircle} label="Email" value={lead.email} />
        <Row icon={MapPin} label="Location" value={`${lead.city}, ${lead.state}`} />
        <Row icon={Target} label="Lead ID" value={lead.id} />
      </Block>

      <Block title="Qualification">
        <Row icon={Wallet} label="Investment budget" value={lead.budget} />
        <Row icon={MapPin} label="City preference" value={lead.cityPreference} />
        <Row icon={Clock} label="Purchase timeline" value={lead.timeline} />
        <Row icon={Target} label="Business unit" value={lead.unit} />
        <Row icon={Target} label="Source / Campaign" value={`${lead.source} · ${lead.campaign}`} />
      </Block>

      <Block title={`Lead score — ${lead.score}/100`}>
        <Progress value={lead.score} className="h-2 mb-2" />
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
          {lead.scoreReasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </Block>

      <Block title="Pipeline & owner">
        <div className="flex items-center gap-2">
          <Select value={lead.stage} onValueChange={(v) => onStage(v as Stage)}>
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Badge variant="outline">{lead.owner}</Badge>
        </div>
      </Block>

      <Block title="Interaction timeline">
        <ol className="relative border-l pl-4 space-y-3">
          {[...lead.history].reverse().map((h, i) => (
            <li key={i} className="text-sm">
              <span className="absolute -left-[5px] mt-1.5 w-2 h-2 rounded-full bg-primary" />
              <div className="font-medium">{h.kind}</div>
              <div className="text-muted-foreground">{h.note}</div>
              <div className="text-xs text-muted-foreground">{fmtDT(h.at)}</div>
            </li>
          ))}
        </ol>
      </Block>

      <Block title="Notes">
        {lead.notes.length ? lead.notes.map((n, i) => <p key={i} className="text-sm">• {n}</p>) : <Empty />}
      </Block>

      <Block title="Tasks">
        {lead.tasks.length ? lead.tasks.map((t, i) => (
          <div key={i} className="text-sm flex justify-between"><span>{t.title}</span><span className="text-muted-foreground">{fmtDT(t.due)}</span></div>
        )) : <Empty />}
      </Block>

      <Block title="Meetings">
        {lead.meetings.length ? lead.meetings.map((m, i) => (
          <div key={i} className="text-sm flex justify-between"><span>{m.title} · {m.mode}</span><span className="text-muted-foreground">{fmtDT(m.at)}</span></div>
        )) : <Empty />}
      </Block>

      <Block title="Documents">
        {lead.documents.length ? lead.documents.map((d) => <p key={d} className="text-sm">📄 {d}</p>) : <Empty />}
      </Block>

      <Separator />

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => onAction(lead, "Call")} disabled={lead.stage === "Won" || lead.stage === "Lost"}><Phone className="w-4 h-4 mr-1" /> Call</Button>
        <Button variant="outline" onClick={() => onAction(lead, "Follow-up")} disabled={lead.stage === "Won" || lead.stage === "Lost"}><CalendarClock className="w-4 h-4 mr-1" /> Follow-up</Button>
        <Button variant="outline" onClick={() => onAction(lead, "Meeting")} disabled={lead.stage === "Won" || lead.stage === "Lost"}><Video className="w-4 h-4 mr-1" /> Meeting</Button>
        <Button variant="outline" onClick={() => onAction(lead, "Note")}><StickyNote className="w-4 h-4 mr-1" /> Note</Button>
        <Button variant="outline" onClick={() => onAction(lead, "Task")} disabled={lead.stage === "Won" || lead.stage === "Lost"}><CheckSquare className="w-4 h-4 mr-1" /> Task</Button>
        <Button variant="outline" onClick={() => onAction(lead, "WhatsApp")} disabled={lead.stage === "Won" || lead.stage === "Lost"}><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => onStage("Won")} disabled={lead.stage === "Won"}><Trophy className="w-4 h-4 mr-1" /> Mark Won</Button>
        <Button variant="destructive" onClick={() => onStage("Lost")} disabled={lead.stage === "Lost"}><Ban className="w-4 h-4 mr-1" /> Mark Lost</Button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function Empty() { return <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>; }

function AddLeadDialog({ open, onOpenChange, existing, onCreate }: {
  open: boolean; onOpenChange: (o: boolean) => void; existing: CrmLead[]; onCreate: (l: CrmLead) => void;
}) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", city: "", state: "", unit: UNITS[0],
    source: SOURCES[0], campaign: CAMPAIGNS[0], owner: OWNERS[0],
    priority: "Medium" as Priority, nextAction: "", followupAt: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  function submit() {
    if (!form.name.trim() || !form.phone.trim()) { toast.error("Name and phone are required"); return; }
    const dup = existing.find((l) => norm(l.phone) === norm(form.phone) || (form.email && l.email.toLowerCase() === form.email.trim().toLowerCase()));
    if (dup) { toast.error(`Duplicate lead — already exists as ${dup.id} (${dup.name})`); return; }
    if (!form.nextAction.trim() || !form.followupAt) { toast.error("A next action and due date are required"); return; }
    const id = `CC-${1100 + existing.length}`;
    onCreate({
      id, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
      city: form.city || "—", state: form.state || "—", unit: form.unit, source: form.source,
      campaign: form.campaign, stage: "New Lead", priority: form.priority, score: 50, owner: form.owner,
      lastInteraction: "—", nextAction: form.nextAction.trim(), followupAt: new Date(form.followupAt).toISOString(),
      createdAt: new Date().toISOString(), budget: "Not disclosed", cityPreference: form.city || "—",
      timeline: "Exploring", scoreReasons: ["New lead — not yet contacted"],
      history: [{ at: new Date().toISOString(), kind: "Lead created", note: `Manually added · ${form.source}` }],
      notes: [], tasks: [], meetings: [], documents: [],
    });
    toast.success(`Lead ${id} created and assigned to ${form.owner}`);
    onOpenChange(false);
    setForm({ ...form, name: "", phone: "", email: "", city: "", state: "", nextAction: "", followupAt: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Phone *"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
          <Field label="Business unit">
            <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Source">
            <Select value={form.source} onValueChange={(v) => set("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Campaign">
            <Select value={form.campaign} onValueChange={(v) => set("campaign", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CAMPAIGNS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Assigned owner *">
            <Select value={form.owner} onValueChange={(v) => set("owner", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Next action *"><Input value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} placeholder="First contact call" /></Field>
          <Field label="Due date & time *"><Input type="datetime-local" value={form.followupAt} onChange={(e) => set("followupAt", e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MyLeads;
