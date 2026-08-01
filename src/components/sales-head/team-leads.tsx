import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search, Users, AlertTriangle, Clock, Eye, UserPlus, StickyNote, CheckSquare,
  CalendarClock, Video, ArrowUpRight, Copy, Filter, X, Wallet, MapPin, Target, Phone,
} from "lucide-react";

/* ------------------------------- types ------------------------------- */

type Priority = "Urgent" | "High" | "Medium" | "Low";
type Stage =
  | "New Lead" | "Contacted" | "Qualified" | "Proposal Sent"
  | "Meeting Scheduled" | "Payment Pending" | "Negotiation" | "Won" | "Lost";

type Timeline = { at: string; kind: string; note: string };

export type TeamLead = {
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
  scoreReasons: string[];
  owner: string | null;
  ownerSince: string; // ISO
  value: number; // opportunity value in INR
  lastInteraction: string; // ISO
  nextAction: string | null;
  followupAt: string | null;
  expectedCloseAt: string | null;
  createdAt: string;
  budget: string;
  cityPreference: string;
  purchaseTimeline: string;
  noAnswerCount: number;
  reassignCount: number;
  history: Timeline[];
  calls: { at: string; outcome: string; note: string }[];
  followups: { at: string; what: string; done: boolean }[];
  meetings: { title: string; at: string; mode: string }[];
  tasks: { title: string; due: string; done: boolean }[];
  pipelineHistory: { stage: Stage; at: string }[];
  managerNotes: { at: string; by: string; note: string }[];
  ownershipHistory: { from: string; to: string; at: string; reason: string }[];
  duplicate?: boolean;
};

const EXECUTIVES = [
  { name: "Ravi Sharma", territory: "Rajasthan", units: ["Franchise", "Master Franchise"], available: true },
  { name: "Neha Kulkarni", territory: "Maharashtra", units: ["Franchise", "B2B Laundry"], available: true },
  { name: "Amit Bansal", territory: "Delhi NCR", units: ["Franchise", "Corporate Tie-up"], available: true },
  { name: "Deepak Verma", territory: "Madhya Pradesh", units: ["Franchise"], available: false },
  { name: "Sneha Iyer", territory: "Karnataka", units: ["Franchise", "B2B Laundry"], available: true },
];

const STAGES: Stage[] = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Meeting Scheduled", "Payment Pending", "Negotiation", "Won", "Lost"];
const PRIORITIES: Priority[] = ["Urgent", "High", "Medium", "Low"];
const SOURCES = ["Website", "Meta Ads", "Google Ads", "Referral", "Walk-in", "IndiaMART", "Exhibition"];
const CAMPAIGNS = ["Franchise Q3", "City Expansion", "Referral Drive", "Brand Awareness", "—"];
const UNITS = ["Franchise", "Master Franchise", "Corporate Tie-up", "B2B Laundry"];

const PRIORITY_RANK: Record<Priority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

const REASSIGN_REASONS = [
  "Territory alignment",
  "Executive overloaded",
  "Executive unavailable / leave",
  "Existing customer relationship",
  "Performance escalation",
  "Customer requested change",
];

/* ------------------------------ helpers ------------------------------ */

function iso(dayOffset: number, hh = 10, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}
function minsAgo(m: number) {
  return new Date(Date.now() - m * 60000).toISOString();
}
function fmt(dt: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}
function since(dt: string) {
  const days = Math.floor((Date.now() - new Date(dt).getTime()) / 86400000);
  if (days >= 1) return `${days}d`;
  const hrs = Math.floor((Date.now() - new Date(dt).getTime()) / 3600000);
  if (hrs >= 1) return `${hrs}h`;
  return `${Math.max(1, Math.floor((Date.now() - new Date(dt).getTime()) / 60000))}m`;
}
function money(v: number) {
  return `₹${(v / 100000).toFixed(1)}L`;
}

/* ------------------------------ sample data ------------------------------ */

function mk(p: Partial<TeamLead> & Pick<TeamLead, "id" | "name">): TeamLead {
  return {
    phone: "+91 98000 00000", email: "lead@example.com", city: "Jaipur", state: "Rajasthan",
    unit: "Franchise", source: "Website", campaign: "Franchise Q3", stage: "New Lead",
    priority: "Medium", score: 60, scoreReasons: ["Budget confirmed", "Responded to first call"],
    owner: null, ownerSince: iso(-3), value: 500000, lastInteraction: iso(-1, 15),
    nextAction: "First qualification call", followupAt: iso(0, 16), expectedCloseAt: iso(20),
    createdAt: iso(-5), budget: "₹5-7L", cityPreference: "Jaipur", purchaseTimeline: "1-2 months",
    noAnswerCount: 0, reassignCount: 0,
    history: [{ at: iso(-5), kind: "Created", note: "Lead captured" }],
    calls: [], followups: [], meetings: [], tasks: [],
    pipelineHistory: [{ stage: "New Lead", at: iso(-5) }],
    managerNotes: [], ownershipHistory: [],
    ...p,
  };
}

const SAMPLE: TeamLead[] = [
  mk({
    id: "CC-1042", name: "Rohit Agarwal", phone: "+91 98290 11234", email: "rohit.agarwal@gmail.com",
    city: "Jaipur", state: "Rajasthan", source: "Meta Ads", stage: "Proposal Sent", priority: "Urgent",
    score: 96, owner: "Ravi Sharma", ownerSince: iso(-9), value: 650000, lastInteraction: iso(-2, 12),
    nextAction: "Proposal follow-up call", followupAt: iso(-1, 16), expectedCloseAt: iso(8),
    budget: "₹6-8L", purchaseTimeline: "Within 30 days",
    scoreReasons: ["Budget confirmed ₹6-8L", "Decision maker", "Site shortlisted", "Two meetings done"],
    calls: [{ at: iso(-2, 12), outcome: "Connected", note: "Reviewing proposal with family" }],
    followups: [{ at: iso(-1, 16), what: "Proposal follow-up", done: false }],
    meetings: [{ title: "Franchise pitch", at: iso(-4, 11), mode: "In-person" }],
    tasks: [{ title: "Share ROI sheet", due: fmtDate(iso(0)), done: true }],
    pipelineHistory: [{ stage: "New Lead", at: iso(-14) }, { stage: "Qualified", at: iso(-10) }, { stage: "Proposal Sent", at: iso(-5) }],
    history: [{ at: iso(-2, 12), kind: "Call", note: "Proposal discussion" }, { at: iso(-4, 11), kind: "Meeting", note: "Pitch completed" }],
    managerNotes: [{ at: iso(-3), by: "Sales Head", note: "High intent — keep weekly touch." }],
  }),
  mk({
    id: "CC-1051", name: "Neha Agarwal", phone: "+91 99110 88221", email: "neha.a@indoremail.com",
    city: "Indore", state: "Madhya Pradesh", source: "Google Ads", stage: "Payment Pending",
    priority: "Urgent", score: 91, owner: "Deepak Verma", ownerSince: iso(-21), value: 650000,
    lastInteraction: iso(-3, 17), nextAction: "Collect EL fee", followupAt: iso(-2, 11),
    expectedCloseAt: iso(4), budget: "₹6-7L", purchaseTimeline: "Immediate", noAnswerCount: 1, reassignCount: 2,
    scoreReasons: ["EL fee agreed", "Site finalised", "Competitor quote received"],
    calls: [{ at: iso(-3, 17), outcome: "Connected", note: "Wants revised payment terms" }],
    followups: [{ at: iso(-2, 11), what: "EL fee collection", done: false }],
    pipelineHistory: [{ stage: "Qualified", at: iso(-18) }, { stage: "Meeting Scheduled", at: iso(-12) }, { stage: "Payment Pending", at: iso(-6) }],
    ownershipHistory: [
      { from: "Amit Bansal", to: "Ravi Sharma", at: iso(-15), reason: "Territory alignment" },
      { from: "Ravi Sharma", to: "Deepak Verma", at: iso(-8), reason: "Executive overloaded" },
    ],
    history: [{ at: iso(-3, 17), kind: "Call", note: "Payment terms objection" }],
  }),
  mk({
    id: "CC-1063", name: "Sandeep Rao", phone: "+91 90210 44556", email: "sandeep.rao@pune.in",
    city: "Pune", state: "Maharashtra", source: "Referral", campaign: "Referral Drive",
    stage: "Meeting Scheduled", priority: "High", score: 82, owner: "Neha Kulkarni",
    ownerSince: iso(-6), value: 550000, lastInteraction: minsAgo(400),
    nextAction: "Showroom visit", followupAt: iso(1, 11), expectedCloseAt: iso(15),
    budget: "₹5-6L", purchaseTimeline: "2-3 months",
    meetings: [{ title: "Showroom visit", at: iso(1, 11), mode: "In-person" }],
    calls: [{ at: minsAgo(400), outcome: "Connected", note: "Confirmed visit" }],
    pipelineHistory: [{ stage: "New Lead", at: iso(-9) }, { stage: "Qualified", at: iso(-6) }, { stage: "Meeting Scheduled", at: iso(-2) }],
    history: [{ at: minsAgo(400), kind: "Call", note: "Visit confirmed" }],
  }),
  mk({
    id: "CC-1070", name: "Imran Qureshi", phone: "+91 97330 22110", email: "imran.q@lucknowbiz.com",
    city: "Lucknow", state: "Uttar Pradesh", source: "IndiaMART", stage: "Negotiation",
    priority: "High", score: 78, owner: "Amit Bansal", ownerSince: iso(-30), value: 700000,
    lastInteraction: iso(-2, 10), nextAction: null, followupAt: null, expectedCloseAt: iso(10),
    budget: "₹7L+", purchaseTimeline: "1 month", noAnswerCount: 3,
    scoreReasons: ["High budget", "Multiple no-answers", "Long time in stage"],
    pipelineHistory: [{ stage: "Proposal Sent", at: iso(-22) }, { stage: "Negotiation", at: iso(-16) }],
    history: [{ at: iso(-2, 10), kind: "Call", note: "No answer (3rd attempt)" }],
    calls: [{ at: iso(-2, 10), outcome: "No Answer", note: "3rd attempt" }],
  }),
  mk({
    id: "CC-1078", name: "Priya Menon", phone: "+91 98450 77123", email: "priya.menon@kochi.in",
    city: "Kochi", state: "Kerala", source: "Website", stage: "New Lead", priority: "Medium",
    score: 54, owner: null, ownerSince: minsAgo(25), value: 400000, lastInteraction: minsAgo(25),
    nextAction: null, followupAt: null, expectedCloseAt: iso(35), createdAt: minsAgo(25),
    budget: "₹4-5L", purchaseTimeline: "3-6 months", cityPreference: "Kochi",
    scoreReasons: ["Enquiry form filled", "Budget not verified"],
    history: [{ at: minsAgo(25), kind: "Created", note: "Website enquiry" }],
    pipelineHistory: [{ stage: "New Lead", at: minsAgo(25) }],
  }),
  mk({
    id: "CC-1079", name: "Vikram Singh", phone: "+91 99790 33445", email: "vikram.singh@surat.co",
    city: "Surat", state: "Gujarat", source: "Exhibition", campaign: "City Expansion",
    stage: "New Lead", priority: "High", score: 71, owner: null, ownerSince: minsAgo(8),
    value: 600000, lastInteraction: minsAgo(8), nextAction: null, followupAt: null,
    createdAt: minsAgo(8), budget: "₹5-7L", purchaseTimeline: "Within 45 days",
    scoreReasons: ["Exhibition walk-in", "Owns commercial space"],
    history: [{ at: minsAgo(8), kind: "Created", note: "Exhibition lead" }],
    pipelineHistory: [{ stage: "New Lead", at: minsAgo(8) }],
  }),
  mk({
    id: "CC-1085", name: "Anil Chowdhury", phone: "+91 90880 55667", email: "anil.c@bengaluru.in",
    city: "Bengaluru", state: "Karnataka", unit: "B2B Laundry", source: "Referral",
    stage: "Qualified", priority: "Medium", score: 66, owner: "Sneha Iyer", ownerSince: iso(-4),
    value: 900000, lastInteraction: iso(-1, 18), nextAction: "Share B2B rate card",
    followupAt: iso(0, 18), expectedCloseAt: iso(25), budget: "₹8-10L", purchaseTimeline: "2 months",
    history: [{ at: iso(-1, 18), kind: "Call", note: "Rate card requested" }],
    pipelineHistory: [{ stage: "New Lead", at: iso(-7) }, { stage: "Qualified", at: iso(-4) }],
  }),
  mk({
    id: "CC-1090", name: "Meera Joshi", phone: "+91 98600 12398", email: "meera.j@nagpur.in",
    city: "Nagpur", state: "Maharashtra", source: "Meta Ads", stage: "Contacted",
    priority: "Low", score: 41, owner: "Neha Kulkarni", ownerSince: iso(-11), value: 450000,
    lastInteraction: iso(-6, 13), nextAction: "Re-qualify budget", followupAt: iso(-4, 12),
    expectedCloseAt: iso(45), budget: "Not verified", purchaseTimeline: "6+ months", noAnswerCount: 2,
    history: [{ at: iso(-6, 13), kind: "Call", note: "Budget unclear" }],
    pipelineHistory: [{ stage: "New Lead", at: iso(-14) }, { stage: "Contacted", at: iso(-11) }],
  }),
  mk({
    id: "CC-1094", name: "Rakesh Sharma", phone: "+91 94140 66554", email: "rakesh.s@jaipur.in",
    city: "Jaipur", state: "Rajasthan", source: "Walk-in", stage: "Won", priority: "Low",
    score: 100, owner: "Ravi Sharma", ownerSince: iso(-40), value: 650000, lastInteraction: iso(-2, 15),
    nextAction: "Handover to Project Coordinator", followupAt: iso(1, 10), expectedCloseAt: iso(-2),
    budget: "₹6.5L", purchaseTimeline: "Closed",
    pipelineHistory: [{ stage: "Proposal Sent", at: iso(-20) }, { stage: "Payment Pending", at: iso(-9) }, { stage: "Won", at: iso(-2) }],
    history: [{ at: iso(-2, 15), kind: "Booking", note: "Franchise booked ₹6.5L" }],
  }),
  mk({
    id: "CC-1096", name: "Farhan Sheikh", phone: "+91 97020 99887", email: "farhan.s@delhi.in",
    city: "Delhi", state: "Delhi NCR", unit: "Corporate Tie-up", source: "Google Ads",
    stage: "Lost", priority: "Low", score: 22, owner: "Amit Bansal", ownerSince: iso(-35),
    value: 500000, lastInteraction: iso(-12, 16), nextAction: null, followupAt: null,
    expectedCloseAt: null, budget: "₹3L", purchaseTimeline: "Undecided",
    history: [{ at: iso(-12, 16), kind: "Lost", note: "Budget mismatch" }],
    pipelineHistory: [{ stage: "Qualified", at: iso(-28) }, { stage: "Lost", at: iso(-12) }],
  }),
  mk({
    id: "CC-1097", name: "Rohit Agarwal (dup)", phone: "+91 98290 11234", email: "rohit.agarwal@gmail.com",
    city: "Jaipur", state: "Rajasthan", source: "Website", stage: "New Lead", priority: "Low",
    score: 30, owner: null, ownerSince: minsAgo(90), value: 650000, lastInteraction: minsAgo(90),
    nextAction: null, followupAt: null, createdAt: minsAgo(90),
    history: [{ at: minsAgo(90), kind: "Created", note: "Duplicate website enquiry" }],
    pipelineHistory: [{ stage: "New Lead", at: minsAgo(90) }],
  }),
];

/* ------------------------------ attention rules ------------------------------ */

type Warning = { label: string; tone: "red" | "amber" };

function warningsFor(l: TeamLead): Warning[] {
  const w: Warning[] = [];
  const now = Date.now();
  const isActive = l.stage !== "Won" && l.stage !== "Lost";
  if (l.stage === "New Lead" && l.calls.length === 0 && now - new Date(l.createdAt).getTime() > 10 * 60000)
    w.push({ label: "Not contacted in 10 min", tone: "red" });
  if (l.followupAt && new Date(l.followupAt).getTime() < now && isActive)
    w.push({ label: "Follow-up overdue", tone: "red" });
  if (!l.nextAction && isActive) w.push({ label: "No next action", tone: "amber" });
  if (l.value >= 600000 && now - new Date(l.lastInteraction).getTime() > 24 * 3600000 && isActive)
    w.push({ label: "High-value inactive 24h+", tone: "red" });
  if (l.stage === "Payment Pending" && now - new Date(l.lastInteraction).getTime() > 48 * 3600000)
    w.push({ label: "Payment pending, no activity", tone: "red" });
  if (l.noAnswerCount >= 3) w.push({ label: `No answer x${l.noAnswerCount}`, tone: "amber" });
  const stageAt = l.pipelineHistory[l.pipelineHistory.length - 1]?.at ?? l.createdAt;
  if (isActive && now - new Date(stageAt).getTime() > 14 * 86400000)
    w.push({ label: "Stuck in stage 14d+", tone: "amber" });
  if (l.reassignCount >= 2 || l.ownershipHistory.length >= 2)
    w.push({ label: "Reassigned multiple times", tone: "amber" });
  return w;
}

/* ------------------------------ tabs ------------------------------ */

type TabKey =
  | "all" | "unassigned" | "new" | "high" | "overdue" | "unattended"
  | "meeting" | "payment" | "won" | "lost";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Leads" },
  { key: "unassigned", label: "Unassigned" },
  { key: "new", label: "New" },
  { key: "high", label: "High Priority" },
  { key: "overdue", label: "Overdue" },
  { key: "unattended", label: "Unattended" },
  { key: "meeting", label: "Meeting Scheduled" },
  { key: "payment", label: "Payment Pending" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

function matchTab(l: TeamLead, tab: TabKey) {
  const now = Date.now();
  switch (tab) {
    case "all": return true;
    case "unassigned": return !l.owner;
    case "new": return l.stage === "New Lead";
    case "high": return l.priority === "Urgent" || l.priority === "High";
    case "overdue": return !!l.followupAt && new Date(l.followupAt).getTime() < now && l.stage !== "Won" && l.stage !== "Lost";
    case "unattended": return !l.nextAction && l.stage !== "Won" && l.stage !== "Lost";
    case "meeting": return l.stage === "Meeting Scheduled";
    case "payment": return l.stage === "Payment Pending";
    case "won": return l.stage === "Won";
    case "lost": return l.stage === "Lost";
  }
}

/* ------------------------------ badges ------------------------------ */

const priorityClass = (p: Priority) =>
  p === "Urgent" ? "bg-red-500/15 text-red-500 border-red-500/30"
  : p === "High" ? "bg-orange-500/15 text-orange-500 border-orange-500/30"
  : p === "Medium" ? "bg-sky-500/15 text-sky-500 border-sky-500/30"
  : "bg-muted text-muted-foreground border-border";

const stageClass = (s: Stage) =>
  s === "Won" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
  : s === "Lost" ? "bg-muted text-muted-foreground border-border"
  : s === "Payment Pending" ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
  : "bg-primary/10 text-primary border-primary/25";

function ScoreChip({ score }: { score: number }) {
  const tone = score >= 80 ? "text-emerald-600" : score >= 55 ? "text-amber-600" : "text-muted-foreground";
  return <span className={cn("font-semibold tabular-nums", tone)}>{score}</span>;
}

/* ------------------------------ main ------------------------------ */

export function TeamLeadsPage() {
  const [leads, setLeads] = useState<TeamLead[]>(SAMPLE);
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<string[] | null>(null); // lead ids being (re)assigned
  const [bulkOpen, setBulkOpen] = useState(false);
  const [workloadOpen, setWorkloadOpen] = useState(false);

  const [f, setF] = useState({
    owner: "all", stage: "all", priority: "all", score: "all", source: "all",
    campaign: "all", city: "all", state: "all", unit: "all",
    created: "all", contacted: "all", followup: "all", close: "all",
  });
  const setFilter = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const resetFilters = () => setF({
    owner: "all", stage: "all", priority: "all", score: "all", source: "all",
    campaign: "all", city: "all", state: "all", unit: "all",
    created: "all", contacted: "all", followup: "all", close: "all",
  });
  const activeFilterCount = Object.values(f).filter((v) => v !== "all").length;

  const cities = useMemo(() => Array.from(new Set(leads.map((l) => l.city))).sort(), [leads]);
  const states = useMemo(() => Array.from(new Set(leads.map((l) => l.state))).sort(), [leads]);

  const withinDays = (dt: string | null, mode: string) => {
    if (mode === "all") return true;
    if (!dt) return false;
    const diffDays = (new Date(dt).getTime() - Date.now()) / 86400000;
    switch (mode) {
      case "past7": return diffDays <= 0 && diffDays >= -7;
      case "past30": return diffDays <= 0 && diffDays >= -30;
      case "today": return Math.floor(diffDays) === 0 || (diffDays > -1 && diffDays < 1);
      case "next7": return diffDays >= 0 && diffDays <= 7;
      case "next30": return diffDays >= 0 && diffDays <= 30;
      case "overdue": return diffDays < 0;
      default: return true;
    }
  };

  const filtered = useMemo(() => {
    return leads
      .filter((l) => matchTab(l, tab))
      .filter((l) => (f.owner === "all" ? true : f.owner === "unassigned" ? !l.owner : l.owner === f.owner))
      .filter((l) => f.stage === "all" || l.stage === f.stage)
      .filter((l) => f.priority === "all" || l.priority === f.priority)
      .filter((l) =>
        f.score === "all" ? true
        : f.score === "hot" ? l.score >= 80
        : f.score === "warm" ? l.score >= 55 && l.score < 80
        : l.score < 55)
      .filter((l) => f.source === "all" || l.source === f.source)
      .filter((l) => f.campaign === "all" || l.campaign === f.campaign)
      .filter((l) => f.city === "all" || l.city === f.city)
      .filter((l) => f.state === "all" || l.state === f.state)
      .filter((l) => f.unit === "all" || l.unit === f.unit)
      .filter((l) => withinDays(l.createdAt, f.created))
      .filter((l) => withinDays(l.lastInteraction, f.contacted))
      .filter((l) => withinDays(l.followupAt, f.followup))
      .filter((l) => withinDays(l.expectedCloseAt, f.close))
      .filter((l) =>
        q.trim() === "" ||
        `${l.name} ${l.id} ${l.phone} ${l.city}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.score - a.score);
  }, [leads, tab, f, q]);

  const counts = useMemo(() => {
    const c = {} as Record<TabKey, number>;
    TABS.forEach((t) => { c[t.key] = leads.filter((l) => matchTab(l, t.key)).length; });
    return c;
  }, [leads]);

  const header = useMemo(() => {
    const active = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost");
    return {
      active: active.length,
      unassigned: counts.unassigned,
      newAwaiting: leads.filter((l) => l.stage === "New Lead" && l.calls.length === 0).length,
      overdue: counts.overdue,
      noAction: counts.unattended,
    };
  }, [leads, counts]);

  const workload = useMemo(
    () =>
      EXECUTIVES.map((e) => {
        const own = leads.filter((l) => l.owner === e.name && l.stage !== "Won" && l.stage !== "Lost");
        const overdue = own.filter((l) => l.followupAt && new Date(l.followupAt).getTime() < Date.now());
        return { ...e, active: own.length, overdue: overdue.length, value: own.reduce((s, l) => s + l.value, 0) };
      }),
    [leads],
  );

  const drawerLead = leads.find((l) => l.id === drawerId) ?? null;

  /* ------------- mutations (front-end only) ------------- */

  const update = (ids: string[], fn: (l: TeamLead) => TeamLead) =>
    setLeads((s) => s.map((l) => (ids.includes(l.id) ? fn(l) : l)));

  const doAssign = (ids: string[], to: string, reason: string) => {
    update(ids, (l) => ({
      ...l,
      owner: to,
      ownerSince: new Date().toISOString(),
      reassignCount: l.owner ? l.reassignCount + 1 : l.reassignCount,
      ownershipHistory: l.owner
        ? [...l.ownershipHistory, { from: l.owner, to, at: new Date().toISOString(), reason }]
        : l.ownershipHistory,
      history: [
        { at: new Date().toISOString(), kind: l.owner ? "Reassigned" : "Assigned", note: `${l.owner ?? "Unassigned"} → ${to}${reason ? ` (${reason})` : ""}` },
        ...l.history,
      ],
      nextAction: l.nextAction ?? "First qualification call",
      followupAt: l.followupAt ?? iso(0, new Date().getHours() + 1),
    }));
    setAssignFor(null);
    setSelected([]);
    toast.success(`${ids.length} lead${ids.length > 1 ? "s" : ""} assigned to ${to} — synced to My Leads & Call Queue`);
  };

  const addNote = (id: string, note: string) =>
    update([id], (l) => ({
      ...l,
      managerNotes: [{ at: new Date().toISOString(), by: "Sales Head", note }, ...l.managerNotes],
      history: [{ at: new Date().toISOString(), kind: "Manager note", note }, ...l.history],
    }));

  const quick = (l: TeamLead, kind: "task" | "followup" | "meeting" | "escalate" | "duplicate") => {
    const now = new Date().toISOString();
    if (kind === "task")
      update([l.id], (x) => ({ ...x, tasks: [{ title: "Manager task: update lead status", due: fmtDate(iso(1)), done: false }, ...x.tasks], history: [{ at: now, kind: "Task", note: "Task created by Sales Head" }, ...x.history] }));
    if (kind === "followup")
      update([l.id], (x) => ({ ...x, followupAt: iso(1, 11), nextAction: x.nextAction ?? "Follow-up call", followups: [{ at: iso(1, 11), what: "Follow-up call", done: false }, ...x.followups], history: [{ at: now, kind: "Follow-up", note: "Scheduled for tomorrow 11:00" }, ...x.history] }));
    if (kind === "meeting")
      update([l.id], (x) => ({ ...x, stage: x.stage === "New Lead" || x.stage === "Contacted" ? "Meeting Scheduled" : x.stage, meetings: [{ title: "Franchise discussion", at: iso(2, 15), mode: "Video" }, ...x.meetings], history: [{ at: now, kind: "Meeting", note: "Scheduled in 2 days 15:00" }, ...x.history] }));
    if (kind === "escalate")
      update([l.id], (x) => ({ ...x, priority: "Urgent", history: [{ at: now, kind: "Escalated", note: "Escalated by Sales Head" }, ...x.history] }));
    if (kind === "duplicate")
      update([l.id], (x) => ({ ...x, duplicate: true, history: [{ at: now, kind: "Duplicate", note: "Marked as verified duplicate" }, ...x.history] }));
    const msg: Record<string, string> = {
      task: "Task created — visible in the executive's Team Tasks",
      followup: "Follow-up scheduled — synced to Follow-ups & Reminders",
      meeting: "Meeting scheduled — synced to Meetings & Pipeline",
      escalate: "Escalated to Priority & Escalations",
      duplicate: "Marked as duplicate",
    };
    toast.success(msg[kind]);
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Leads</h1>
          <p className="text-sm text-muted-foreground">
            Every lead across the five sales executives — one master record, shared with their My Leads pages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setWorkloadOpen(true)}>
            <Users className="h-4 w-4 mr-1" /> Workload
          </Button>
          <Button onClick={() => setAssignFor(selected.length ? selected : leads.filter((l) => !l.owner).map((l) => l.id))}>
            <UserPlus className="h-4 w-4 mr-1" /> Assign Leads
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Active Leads", value: header.active, tone: "" },
          { label: "Unassigned Leads", value: header.unassigned, tone: "text-amber-600" },
          { label: "New Awaiting Contact", value: header.newAwaiting, tone: "text-amber-600" },
          { label: "Overdue Leads", value: header.overdue, tone: "text-red-500" },
          { label: "No Next Action", value: header.noAction, tone: "text-red-500" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className={cn("text-3xl font-bold tabular-nums mt-1", k.tone)}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted",
            )}
          >
            {t.label} <span className="tabular-nums opacity-80">({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {/* search + filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search name, lead ID, phone or city" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
              <Filter className="h-4 w-4 mr-1" /> Filters {activeFilterCount > 0 && <Badge className="ml-1" variant="secondary">{activeFilterCount}</Badge>}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" onClick={resetFilters}><X className="h-4 w-4 mr-1" /> Clear</Button>
            )}
          </div>

          {showFilters && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              <FSelect label="Sales executive" value={f.owner} onChange={(v) => setFilter("owner", v)}
                options={[["all", "All executives"], ["unassigned", "Unassigned"], ...EXECUTIVES.map((e) => [e.name, e.name] as [string, string])]} />
              <FSelect label="Pipeline stage" value={f.stage} onChange={(v) => setFilter("stage", v)}
                options={[["all", "All stages"], ...STAGES.map((s) => [s, s] as [string, string])]} />
              <FSelect label="Priority" value={f.priority} onChange={(v) => setFilter("priority", v)}
                options={[["all", "All priorities"], ...PRIORITIES.map((p) => [p, p] as [string, string])]} />
              <FSelect label="Lead score" value={f.score} onChange={(v) => setFilter("score", v)}
                options={[["all", "Any score"], ["hot", "80+ (Hot)"], ["warm", "55-79 (Warm)"], ["cold", "Below 55 (Cold)"]]} />
              <FSelect label="Lead source" value={f.source} onChange={(v) => setFilter("source", v)}
                options={[["all", "All sources"], ...SOURCES.map((s) => [s, s] as [string, string])]} />
              <FSelect label="Campaign" value={f.campaign} onChange={(v) => setFilter("campaign", v)}
                options={[["all", "All campaigns"], ...CAMPAIGNS.map((s) => [s, s] as [string, string])]} />
              <FSelect label="City" value={f.city} onChange={(v) => setFilter("city", v)}
                options={[["all", "All cities"], ...cities.map((s) => [s, s] as [string, string])]} />
              <FSelect label="State" value={f.state} onChange={(v) => setFilter("state", v)}
                options={[["all", "All states"], ...states.map((s) => [s, s] as [string, string])]} />
              <FSelect label="Business unit" value={f.unit} onChange={(v) => setFilter("unit", v)}
                options={[["all", "All units"], ...UNITS.map((s) => [s, s] as [string, string])]} />
              <FSelect label="Created date" value={f.created} onChange={(v) => setFilter("created", v)}
                options={[["all", "Any time"], ["today", "Today"], ["past7", "Last 7 days"], ["past30", "Last 30 days"]]} />
              <FSelect label="Last contacted" value={f.contacted} onChange={(v) => setFilter("contacted", v)}
                options={[["all", "Any time"], ["today", "Today"], ["past7", "Last 7 days"], ["past30", "Last 30 days"]]} />
              <FSelect label="Next follow-up" value={f.followup} onChange={(v) => setFilter("followup", v)}
                options={[["all", "Any time"], ["overdue", "Overdue"], ["today", "Today"], ["next7", "Next 7 days"]]} />
              <FSelect label="Expected closing" value={f.close} onChange={(v) => setFilter("close", v)}
                options={[["all", "Any time"], ["next7", "Next 7 days"], ["next30", "Next 30 days"], ["overdue", "Past due"]]} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* bulk bar */}
      {selected.length > 0 && (
        <Card className="border-primary/40">
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{selected.length} selected</span>
            <Button size="sm" onClick={() => setAssignFor(selected)}><UserPlus className="h-3.5 w-3.5 mr-1" /> Assign executive</Button>
            <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>More bulk actions</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
          </CardContent>
        </Card>
      )}

      {/* desktop table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-2 px-3">
                  <Checkbox
                    checked={selected.length > 0 && selected.length === filtered.length}
                    onCheckedChange={(c) => setSelected(c ? filtered.map((l) => l.id) : [])}
                  />
                </th>
                <th className="py-2 px-2">Priority</th>
                <th className="py-2 px-2">Lead</th>
                <th className="py-2 px-2">Phone</th>
                <th className="py-2 px-2">City</th>
                <th className="py-2 px-2">Source</th>
                <th className="py-2 px-2">Stage</th>
                <th className="py-2 px-2">Score</th>
                <th className="py-2 px-2">Value</th>
                <th className="py-2 px-2">Executive</th>
                <th className="py-2 px-2">Last interaction</th>
                <th className="py-2 px-2">Next action</th>
                <th className="py-2 px-2">Due</th>
                <th className="py-2 px-2">Time w/ exec</th>
                <th className="py-2 px-2">Warnings</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const w = warningsFor(l);
                return (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/40 align-top">
                    <td className="py-2 px-3">
                      <Checkbox
                        checked={selected.includes(l.id)}
                        onCheckedChange={(c) => setSelected((s) => (c ? [...s, l.id] : s.filter((x) => x !== l.id)))}
                      />
                    </td>
                    <td className="py-2 px-2"><Badge variant="outline" className={priorityClass(l.priority)}>{l.priority}</Badge></td>
                    <td className="py-2 px-2">
                      <button className="font-medium hover:underline text-left" onClick={() => setDrawerId(l.id)}>{l.name}</button>
                      <div className="text-[11px] text-muted-foreground">{l.id}{l.duplicate ? " · duplicate" : ""}</div>
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">{l.phone}</td>
                    <td className="py-2 px-2">{l.city}</td>
                    <td className="py-2 px-2">{l.source}</td>
                    <td className="py-2 px-2"><Badge variant="outline" className={stageClass(l.stage)}>{l.stage}</Badge></td>
                    <td className="py-2 px-2"><ScoreChip score={l.score} /></td>
                    <td className="py-2 px-2 tabular-nums">{money(l.value)}</td>
                    <td className="py-2 px-2">{l.owner ?? <span className="text-amber-600 font-medium">Unassigned</span>}</td>
                    <td className="py-2 px-2 whitespace-nowrap text-muted-foreground">{fmt(l.lastInteraction)}</td>
                    <td className="py-2 px-2">{l.nextAction ?? <span className="text-red-500">Not set</span>}</td>
                    <td className={cn("py-2 px-2 whitespace-nowrap", l.followupAt && new Date(l.followupAt) < new Date() ? "text-red-500 font-medium" : "")}>{fmt(l.followupAt)}</td>
                    <td className="py-2 px-2">{l.owner ? since(l.ownerSince) : "—"}</td>
                    <td className="py-2 px-2">
                      <div className="flex flex-col gap-1">
                        {w.slice(0, 2).map((x) => (
                          <span key={x.label} className={cn("text-[11px] inline-flex items-center gap-1", x.tone === "red" ? "text-red-500" : "text-amber-600")}>
                            <AlertTriangle className="h-3 w-3" /> {x.label}
                          </span>
                        ))}
                        {w.length > 2 && <span className="text-[11px] text-muted-foreground">+{w.length - 2} more</span>}
                        {w.length === 0 && <span className="text-[11px] text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="View lead" onClick={() => setDrawerId(l.id)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Assign / Reassign" onClick={() => setAssignFor([l.id])}><UserPlus className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Escalate" onClick={() => quick(l, "escalate")}><ArrowUpRight className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={16} className="py-8 text-center text-muted-foreground">No leads match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((l) => {
          const w = warningsFor(l);
          return (
            <Card key={l.id} className={w.some((x) => x.tone === "red") ? "border-red-500/40" : undefined}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button className="font-semibold hover:underline text-left" onClick={() => setDrawerId(l.id)}>{l.name}</button>
                    <div className="text-[11px] text-muted-foreground">{l.id} · {l.city} · {l.source}</div>
                  </div>
                  <Badge variant="outline" className={priorityClass(l.priority)}>{l.priority}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className={stageClass(l.stage)}>{l.stage}</Badge>
                  <span className="text-muted-foreground">Score <ScoreChip score={l.score} /></span>
                  <span className="text-muted-foreground">{money(l.value)}</span>
                  <span className="text-muted-foreground">{l.owner ?? "Unassigned"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Next: {l.nextAction ?? "Not set"} · Due {fmt(l.followupAt)}
                </div>
                {w.map((x) => (
                  <div key={x.label} className={cn("text-[11px] flex items-center gap-1", x.tone === "red" ? "text-red-500" : "text-amber-600")}>
                    <AlertTriangle className="h-3 w-3" /> {x.label}
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setDrawerId(l.id)}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                  <Button size="sm" variant="outline" onClick={() => setAssignFor([l.id])}><UserPlus className="h-3.5 w-3.5 mr-1" /> Assign</Button>
                  <Button size="sm" variant="outline" onClick={() => quick(l, "followup")}><CalendarClock className="h-3.5 w-3.5 mr-1" /> Follow-up</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No leads match these filters.</CardContent></Card>
        )}
      </div>

      {/* drawer */}
      <LeadDrawer
        lead={drawerLead}
        onClose={() => setDrawerId(null)}
        onReassign={(id) => setAssignFor([id])}
        onNote={addNote}
        onQuick={quick}
      />

      {/* assign dialog */}
      <AssignDialog
        ids={assignFor}
        leads={leads}
        workload={workload}
        onCancel={() => setAssignFor(null)}
        onAssign={doAssign}
      />

      {/* bulk dialog */}
      <BulkDialog
        open={bulkOpen}
        count={selected.length}
        onClose={() => setBulkOpen(false)}
        onApply={(action, value) => {
          const now = new Date().toISOString();
          if (action === "priority") update(selected, (l) => ({ ...l, priority: value as Priority, history: [{ at: now, kind: "Priority", note: `Set to ${value}` }, ...l.history] }));
          if (action === "unit") update(selected, (l) => ({ ...l, unit: value, history: [{ at: now, kind: "Business unit", note: `Set to ${value}` }, ...l.history] }));
          if (action === "task") update(selected, (l) => ({ ...l, tasks: [{ title: value || "Manager task", due: fmtDate(iso(1)), done: false }, ...l.tasks] }));
          if (action === "followup") update(selected, (l) => ({ ...l, followupAt: iso(1, 11), nextAction: l.nextAction ?? "Follow-up call" }));
          if (action === "duplicate") update(selected, (l) => ({ ...l, duplicate: true }));
          setBulkOpen(false);
          setSelected([]);
          toast.success("Bulk change applied and synced to the executives' dashboards");
        }}
      />

      {/* workload dialog */}
      <Dialog open={workloadOpen} onOpenChange={setWorkloadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Executive workload</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {workload.map((w) => (
              <div key={w.name} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{w.name}</div>
                    <div className="text-[11px] text-muted-foreground">{w.territory} · {w.available ? "Available" : "On leave"}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="tabular-nums">{w.active} active</div>
                    <div className={cn("tabular-nums", w.overdue ? "text-red-500" : "text-muted-foreground")}>{w.overdue} overdue</div>
                  </div>
                </div>
                <Progress className="mt-2" value={Math.min(100, (w.active / 8) * 100)} />
                <div className="text-[11px] text-muted-foreground mt-1">Pipeline {money(w.value)}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ filter select ------------------------------ */

function FSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------ drawer ------------------------------ */

function LeadDrawer({
  lead, onClose, onReassign, onNote, onQuick,
}: {
  lead: TeamLead | null;
  onClose: () => void;
  onReassign: (id: string) => void;
  onNote: (id: string, note: string) => void;
  onQuick: (l: TeamLead, kind: "task" | "followup" | "meeting" | "escalate" | "duplicate") => void;
}) {
  const [note, setNote] = useState("");
  if (!lead) return null;
  const w = warningsFor(lead);
  const nba = !lead.owner
    ? "Assign to an executive in the matching territory"
    : !lead.nextAction
      ? "Set a next action and due date"
      : lead.followupAt && new Date(lead.followupAt) < new Date()
        ? `Overdue: ${lead.nextAction} — call now`
        : lead.nextAction;

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {lead.name}
            <Badge variant="outline" className={priorityClass(lead.priority)}>{lead.priority}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Lead ID" value={lead.id} />
            <Info label="Phone" value={lead.phone} />
            <Info label="Email" value={lead.email} />
            <Info label="City / State" value={`${lead.city}, ${lead.state}`} />
            <Info label="Source / Campaign" value={`${lead.source} · ${lead.campaign}`} />
            <Info label="Business unit" value={lead.unit} />
            <Info label="Investment budget" value={lead.budget} />
            <Info label="Preferred city" value={lead.cityPreference} />
            <Info label="Purchase timeline" value={lead.purchaseTimeline} />
            <Info label="Opportunity value" value={money(lead.value)} />
            <Info label="Assigned executive" value={lead.owner ?? "Unassigned"} />
            <Info label="Expected close" value={fmtDate(lead.expectedCloseAt)} />
          </div>

          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Lead score</div>
            <div className="flex items-center gap-3 mt-1">
              <div className="text-2xl font-bold tabular-nums"><ScoreChip score={lead.score} /></div>
              <Progress value={lead.score} className="flex-1" />
            </div>
            <ul className="mt-2 space-y-1">
              {lead.scoreReasons.map((r) => <li key={r} className="text-xs text-muted-foreground">• {r}</li>)}
            </ul>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <div className="text-xs text-muted-foreground">Next Best Action</div>
            <div className="text-sm font-medium mt-0.5">{nba}</div>
          </div>

          {w.length > 0 && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 space-y-1">
              {w.map((x) => (
                <div key={x.label} className={cn("text-xs flex items-center gap-1", x.tone === "red" ? "text-red-500" : "text-amber-600")}>
                  <AlertTriangle className="h-3 w-3" /> {x.label}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onReassign(lead.id)}><UserPlus className="h-3.5 w-3.5 mr-1" /> Reassign</Button>
            <Button size="sm" variant="outline" onClick={() => onQuick(lead, "task")}><CheckSquare className="h-3.5 w-3.5 mr-1" /> Task</Button>
            <Button size="sm" variant="outline" onClick={() => onQuick(lead, "followup")}><CalendarClock className="h-3.5 w-3.5 mr-1" /> Follow-up</Button>
            <Button size="sm" variant="outline" onClick={() => onQuick(lead, "meeting")}><Video className="h-3.5 w-3.5 mr-1" /> Meeting</Button>
            <Button size="sm" variant="outline" onClick={() => onQuick(lead, "escalate")}><ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Escalate</Button>
            <Button size="sm" variant="outline" onClick={() => onQuick(lead, "duplicate")}><Copy className="h-3.5 w-3.5 mr-1" /> Duplicate</Button>
          </div>

          <Separator />

          <Block title="Calls & outcomes" icon={Phone} empty="No calls logged.">
            {lead.calls.map((c, i) => (
              <Row key={i} left={`${c.outcome} — ${c.note}`} right={fmt(c.at)} />
            ))}
          </Block>

          <Block title="Follow-ups" icon={CalendarClock} empty="No follow-ups scheduled.">
            {lead.followups.map((c, i) => (
              <Row key={i} left={c.what} right={`${fmt(c.at)}${c.done ? " · done" : ""}`} />
            ))}
          </Block>

          <Block title="Meetings" icon={Video} empty="No meetings.">
            {lead.meetings.map((m, i) => <Row key={i} left={`${m.title} (${m.mode})`} right={fmt(m.at)} />)}
          </Block>

          <Block title="Tasks" icon={CheckSquare} empty="No tasks.">
            {lead.tasks.map((t, i) => <Row key={i} left={t.title} right={`${t.due}${t.done ? " · done" : ""}`} />)}
          </Block>

          <Block title="Pipeline history" icon={Wallet} empty="No stage changes.">
            {lead.pipelineHistory.map((p, i) => <Row key={i} left={p.stage} right={fmtDate(p.at)} />)}
          </Block>

          <Block title="Ownership history" icon={Users} empty="Never reassigned.">
            {lead.ownershipHistory.map((o, i) => <Row key={i} left={`${o.from} → ${o.to} (${o.reason})`} right={fmtDate(o.at)} />)}
          </Block>

          <Block title="Interaction timeline" icon={Clock} empty="No activity yet.">
            {lead.history.map((h, i) => <Row key={i} left={`${h.kind}: ${h.note}`} right={fmt(h.at)} />)}
          </Block>

          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2"><StickyNote className="h-4 w-4" /> Manager notes</div>
            {lead.managerNotes.map((n, i) => (
              <div key={i} className="text-xs border rounded-md p-2">
                <div className="text-muted-foreground">{n.by} · {fmt(n.at)}</div>
                <div>{n.note}</div>
              </div>
            ))}
            <Textarea rows={2} placeholder="Add a manager note" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button
              size="sm"
              onClick={() => {
                if (!note.trim()) { toast.error("Write a note first"); return; }
                onNote(lead.id, note.trim());
                setNote("");
                toast.success("Manager note added");
              }}
            >
              Add note
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-start gap-1">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            Completed activity records are read-only for Sales Heads. Assignment and stage changes sync to the
            executive's My Leads, Call Queue, Follow-ups, Meetings, Pipeline and Performance pages.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Block({
  title, icon: Icon, empty, children,
}: { title: string; icon: React.ComponentType<{ className?: string }>; empty: string; children: React.ReactNode }) {
  const isEmpty = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium flex items-center gap-2"><Icon className="h-4 w-4" /> {title}</div>
      {isEmpty ? <div className="text-xs text-muted-foreground">{empty}</div> : <div className="space-y-1">{children}</div>}
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs border-b last:border-0 py-1">
      <span>{left}</span>
      <span className="text-muted-foreground whitespace-nowrap">{right}</span>
    </div>
  );
}

/* ------------------------------ assign dialog ------------------------------ */

function AssignDialog({
  ids, leads, workload, onCancel, onAssign,
}: {
  ids: string[] | null;
  leads: TeamLead[];
  workload: { name: string; territory: string; units: string[]; available: boolean; active: number; overdue: number }[];
  onCancel: () => void;
  onAssign: (ids: string[], to: string, reason: string) => void;
}) {
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const target = ids?.map((id) => leads.find((l) => l.id === id)!).filter(Boolean) ?? [];
  const anyAssigned = target.some((l) => l.owner);

  // simple rule-based suggestion
  const suggestion = useMemo(() => {
    if (target.length === 0) return null;
    const l = target[0];
    const scored = workload.map((e) => {
      let s = 0;
      if (e.territory === l.state) s += 40;
      if (e.units.includes(l.unit)) s += 20;
      if (e.available) s += 20;
      if (leads.some((x) => x.owner === e.name && x.phone === l.phone)) s += 25;
      s += Math.max(0, 20 - e.active * 3); // lighter workload wins
      s -= e.overdue * 2;
      return { name: e.name, s, e };
    }).sort((a, b) => b.s - a.s);
    return scored[0];
  }, [target, workload, leads]);

  const reasons = suggestion
    ? [
        suggestion.e.territory === target[0]?.state ? `Territory match (${suggestion.e.territory})` : null,
        suggestion.e.units.includes(target[0]?.unit ?? "") ? `Handles ${target[0]?.unit}` : null,
        suggestion.e.available ? "Currently available" : "Currently on leave",
        `Active workload ${suggestion.e.active} leads, ${suggestion.e.overdue} overdue`,
      ].filter(Boolean) as string[]
    : [];

  return (
    <Dialog open={!!ids && ids.length > 0} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{anyAssigned ? "Reassign leads" : "Assign leads"}</DialogTitle>
          <DialogDescription>
            {target.length} lead{target.length === 1 ? "" : "s"} selected. Assignment updates the executive's My Leads,
            Priority Call Queue and Follow-ups immediately.
          </DialogDescription>
        </DialogHeader>

        {suggestion && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <div className="font-medium">Suggested: {suggestion.name}</div>
            <ul className="mt-1 space-y-0.5">
              {reasons.map((r) => <li key={r} className="text-xs text-muted-foreground">• {r}</li>)}
            </ul>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setTo(suggestion.name)}>Use suggestion</Button>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Assign to</div>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger><SelectValue placeholder="Select executive" /></SelectTrigger>
              <SelectContent>
                {workload.map((e) => (
                  <SelectItem key={e.name} value={e.name}>
                    {e.name} — {e.active} active, {e.overdue} overdue{e.available ? "" : " (on leave)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {anyAssigned && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Reason for reassignment (required)</div>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  {REASSIGN_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={() => {
              if (!to) { toast.error("Select an executive"); return; }
              if (anyAssigned && !reason) { toast.error("A reassignment reason is mandatory"); return; }
              onAssign(ids!, to, reason);
              setTo(""); setReason("");
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ bulk dialog ------------------------------ */

function BulkDialog({
  open, count, onClose, onApply,
}: { open: boolean; count: number; onClose: () => void; onApply: (action: string, value: string) => void }) {
  const [action, setAction] = useState("priority");
  const [value, setValue] = useState("");

  const valueField = () => {
    if (action === "priority")
      return (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
          <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      );
    if (action === "unit")
      return (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger><SelectValue placeholder="Select business unit" /></SelectTrigger>
          <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
        </Select>
      );
    if (action === "task") return <Input placeholder="Task title" value={value} onChange={(e) => setValue(e.target.value)} />;
    if (action === "followup") return <p className="text-xs text-muted-foreground">Schedules a follow-up for tomorrow 11:00 AM on all selected leads.</p>;
    return <p className="text-xs text-muted-foreground">Marks the selected leads as verified duplicates. This cannot be undone from this screen.</p>;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk action</DialogTitle>
          <DialogDescription>{count} lead{count === 1 ? "" : "s"} will be updated. Please confirm before applying.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={action} onValueChange={(v) => { setAction(v); setValue(""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Change priority</SelectItem>
              <SelectItem value="task">Add task</SelectItem>
              <SelectItem value="followup">Schedule follow-up</SelectItem>
              <SelectItem value="unit">Change business unit</SelectItem>
              <SelectItem value="duplicate">Mark verified duplicates</SelectItem>
            </SelectContent>
          </Select>
          {valueField()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if ((action === "priority" || action === "unit") && !value) { toast.error("Select a value"); return; }
              onApply(action, value);
            }}
          >
            Apply to {count}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
