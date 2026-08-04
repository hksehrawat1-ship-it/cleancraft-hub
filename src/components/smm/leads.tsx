import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Copy,
  Eye,
  Plus,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { SectionHead, StatCard } from "./ui";
import {
  HANDOVER_STAGES,
  LEAD_INTERESTS,
  QUALIFICATION_CHECKS,
  SM_LEADS,
  type HandoverStage,
  type SmLead,
} from "./shared-records";

type TabKey =
  | "new"
  | "verify"
  | "qualified"
  | "ready"
  | "awaiting"
  | "accepted"
  | "returned"
  | "junk";

const TABS: { key: TabKey; label: string; stages: HandoverStage[] }[] = [
  { key: "new", label: "New Enquiries", stages: ["New Enquiry"] },
  { key: "verify", label: "Verification Required", stages: ["Verification Required"] },
  { key: "qualified", label: "Qualified", stages: ["Qualified"] },
  { key: "ready", label: "Ready for Handover", stages: ["Ready for Handover"] },
  {
    key: "awaiting",
    label: "Awaiting Acceptance",
    stages: ["Sent to Sales Head", "Awaiting Acceptance"],
  },
  {
    key: "accepted",
    label: "Accepted",
    stages: ["Accepted", "Sales Follow-up Started", "Reassigned by Sales Head"],
  },
  { key: "returned", label: "Returned", stages: ["Returned for Information"] },
  { key: "junk", label: "Duplicate or Spam", stages: ["Duplicate", "Spam", "Not Relevant"] },
];

const EXECUTIVES = ["Amit Khanna", "Neha Sharma", "Rohit Verma", "Sana Qureshi"];

function stageTone(stage: HandoverStage) {
  if (stage === "Accepted" || stage === "Sales Follow-up Started") return "bg-emerald-100 text-emerald-800";
  if (stage === "Returned for Information") return "bg-destructive/10 text-destructive";
  if (stage === "Duplicate" || stage === "Spam" || stage === "Not Relevant")
    return "bg-muted text-muted-foreground";
  if (stage === "Sent to Sales Head" || stage === "Awaiting Acceptance") return "bg-amber-100 text-amber-800";
  return "bg-primary/10 text-primary";
}

function mask(value: string) {
  if (!value) return "—";
  if (value.includes("@")) {
    const [a, b] = value.split("@");
    return `${a.slice(0, 2)}****@${b}`;
  }
  return `${value.slice(0, 4)}*****${value.slice(-2)}`;
}

function priorityTone(p: SmLead["priority"]) {
  return p === "High"
    ? "bg-destructive/10 text-destructive"
    : p === "Medium"
    ? "bg-amber-100 text-amber-800"
    : "bg-muted text-muted-foreground";
}

export function SmmLeadsPage() {
  const [leads, setLeads] = useState<SmLead[]>(SM_LEADS);
  const [tab, setTab] = useState<TabKey>("new");
  const [q, setQ] = useState("");
  const [fPlatform, setFPlatform] = useState("all");
  const [fAccount, setFAccount] = useState("all");
  const [fInterest, setFInterest] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [fCampaign, setFCampaign] = useState("all");
  const [fContent, setFContent] = useState("all");
  const [fStage, setFStage] = useState("all");
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [openLead, setOpenLead] = useState<SmLead | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [handoverNote, setHandoverNote] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [audit, setAudit] = useState<string[]>([
    "Today, 11:40 — Sales Head accepted CC-LD-5206 and assigned Amit Khanna",
  ]);

  const log = (line: string) => setAudit((a) => [`Now — ${line}`, ...a]);

  const opts = (key: keyof SmLead) =>
    Array.from(new Set(leads.map((l) => String(l[key])).filter(Boolean)));

  const stats = useMemo(() => {
    const c = (s: HandoverStage[]) => leads.filter((l) => s.includes(l.stage)).length;
    return {
      fresh: c(["New Enquiry"]),
      verify: c(["Verification Required"]),
      ready: c(["Ready for Handover"]),
      awaiting: c(["Sent to Sales Head", "Awaiting Acceptance"]),
      accepted: c(["Accepted", "Sales Follow-up Started"]),
    };
  }, [leads]);

  const alerts = useMemo(() => {
    const out: { tone: "bad" | "warn"; text: string }[] = [];
    leads.forEach((l) => {
      if (l.stage === "New Enquiry" && l.minutesSinceEnquiry > 10)
        out.push({ tone: "bad", text: `${l.leadId} ${l.name} — new enquiry not reviewed within 10 minutes` });
      if (l.priority === "High" && ["Qualified", "Ready for Handover"].includes(l.stage))
        out.push({ tone: "warn", text: `${l.leadId} ${l.name} — high-intent lead awaiting handover` });
      if (["Sent to Sales Head", "Awaiting Acceptance"].includes(l.stage))
        out.push({ tone: "warn", text: `${l.leadId} ${l.name} — awaiting Sales Head acceptance` });
      if (l.stage === "Returned for Information")
        out.push({ tone: "bad", text: `${l.leadId} ${l.name} — returned: ${l.returnReason ?? "info missing"}` });
      if (l.duplicateOf && l.stage === "Verification Required")
        out.push({ tone: "warn", text: `${l.leadId} — possible duplicate of ${l.duplicateOf}, needs verification` });
      if (!l.mobile.replace(/\D/g, "").match(/^\d{12}$/) || l.mobile.endsWith("0000000000"))
        out.push({ tone: "bad", text: `${l.leadId} — invalid or unusable contact information` });
      if (!l.campaign || !l.platform)
        out.push({ tone: "warn", text: `${l.leadId} — lead without source or campaign` });
      if (l.returnCount >= 2)
        out.push({ tone: "bad", text: `${l.leadId} — handover rejected ${l.returnCount} times` });
    });
    return out;
  }, [leads]);

  const visible = useMemo(() => {
    const stages = TABS.find((t) => t.key === tab)!.stages;
    return leads.filter((l) => {
      if (!stages.includes(l.stage)) return false;
      if (fPlatform !== "all" && l.platform !== fPlatform) return false;
      if (fAccount !== "all" && l.account !== fAccount) return false;
      if (fInterest !== "all" && l.interest !== fInterest) return false;
      if (fPriority !== "all" && l.priority !== fPriority) return false;
      if (fCity !== "all" && l.city !== fCity) return false;
      if (fCampaign !== "all" && l.campaign !== fCampaign) return false;
      if (fContent !== "all" && l.contentId !== fContent) return false;
      if (fStage !== "all" && l.stage !== fStage) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        if (
          ![l.name, l.leadId, l.city, l.mobile, l.email, l.campaign, l.contentId]
            .join(" ")
            .toLowerCase()
            .includes(s)
        )
          return false;
      }
      return true;
    });
  }, [leads, tab, q, fPlatform, fAccount, fInterest, fPriority, fCity, fCampaign, fContent, fStage]);

  const update = (leadId: string, patch: Partial<SmLead>, note: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.leadId === leadId
          ? {
              ...l,
              ...patch,
              timeline_log: [...l.timeline_log, { at: "Now", by: "Priya Nanda", note }],
            }
          : l,
      ),
    );
    log(`${leadId} — ${note}`);
  };

  const openReview = (l: SmLead) => {
    setOpenLead(l);
    const seed: Record<string, boolean> = {};
    QUALIFICATION_CHECKS.forEach((c) => {
      seed[c] =
        (c === "Name available" && !!l.name) ||
        (c === "Valid mobile number or email" && (!!l.mobile || !!l.email)) ||
        (c === "City identified" && !!l.city) ||
        (c === "Enquiry type selected" && !!l.enquiryType);
    });
    setChecks(seed);
    setHandoverNote(l.salesNote ?? "");
  };

  const current = openLead ? leads.find((l) => l.leadId === openLead.leadId) ?? openLead : null;
  const requiredChecks = QUALIFICATION_CHECKS.filter(
    (c) => !c.startsWith("Consent") && !c.startsWith("Relevant notes"),
  );
  const canHandover = requiredChecks.every((c) => checks[c]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead
          title="Leads & Handover"
          sub="Capture, verify and hand over social-media enquiries to the Sales Head — one permanent Lead ID, no duplicates."
        />
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Lead
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="New Enquiries" value={String(stats.fresh)} sub="Review within 10 minutes" />
        <StatCard label="Verification Pending" value={String(stats.verify)} tone="warn" sub="Duplicate / contact checks" />
        <StatCard label="Ready for Handover" value={String(stats.ready)} sub="Qualified, not yet sent" />
        <StatCard label="Awaiting Sales Head Acceptance" value={String(stats.awaiting)} tone="warn" />
        <StatCard label="Accepted Today" value={String(stats.accepted)} tone="good" />
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
        {TABS.map((t) => {
          const n = leads.filter((l) => t.stages.includes(l.stage)).length;
          return (
            <Button
              key={t.key}
              size="sm"
              variant={tab === t.key ? "default" : "outline"}
              onClick={() => setTab(t.key)}
              className="shrink-0"
            >
              {t.label} <span className="ml-1 opacity-70">{n}</span>
            </Button>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lead, ID, city, campaign, content ID"
              className="pl-8"
            />
          </div>
          {[
            { v: fPlatform, set: setFPlatform, ph: "Platform", list: opts("platform") },
            { v: fAccount, set: setFAccount, ph: "Social account", list: opts("account") },
            { v: fCampaign, set: setFCampaign, ph: "Campaign", list: opts("campaign") },
            { v: fContent, set: setFContent, ph: "Content ID", list: opts("contentId") },
            { v: fInterest, set: setFInterest, ph: "Lead interest", list: [...LEAD_INTERESTS] },
            { v: fPriority, set: setFPriority, ph: "Priority", list: ["High", "Medium", "Low"] },
            { v: fCity, set: setFCity, ph: "City / state", list: opts("city") },
            { v: fStage, set: setFStage, ph: "Handover status", list: [...HANDOVER_STAGES] },
          ].map((f) => (
            <Select key={f.ph} value={f.v} onValueChange={f.set}>
              <SelectTrigger>
                <SelectValue placeholder={f.ph} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.ph}: All</SelectItem>
                {f.list.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card className="hidden lg:block">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                {["Lead", "Contact", "Source", "Interest", "Priority", "Enquiry", "Handover", ""].map((h) => (
                  <th key={h} className="text-left py-2 pr-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((l) => (
                <tr key={l.leadId} className="border-b last:border-0 align-top">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.leadId} · {l.city || "City missing"}
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    <div>{reveal[l.leadId] ? l.mobile : mask(l.mobile)}</div>
                    <div className="text-muted-foreground">{reveal[l.leadId] ? l.email || "—" : mask(l.email)}</div>
                    <button
                      className="text-[11px] text-primary inline-flex items-center gap-1 mt-0.5"
                      onClick={() => {
                        setReveal((r) => ({ ...r, [l.leadId]: !r[l.leadId] }));
                        if (!reveal[l.leadId]) log(`${l.leadId} — contact details viewed by Priya Nanda`);
                      }}
                    >
                      <Eye className="h-3 w-3" /> {reveal[l.leadId] ? "Hide" : "Reveal"}
                    </button>
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    <div>{l.platform} · {l.account}</div>
                    <div className="text-muted-foreground">{l.campaign}</div>
                    <div className="text-muted-foreground">{l.contentId}</div>
                  </td>
                  <td className="py-2 pr-3 text-xs">{l.interest}</td>
                  <td className="py-2 pr-3">
                    <Badge className={priorityTone(l.priority)} variant="secondary">
                      {l.priority}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{l.enquiredAt}</td>
                  <td className="py-2 pr-3">
                    <Badge className={stageTone(l.stage)} variant="secondary">
                      {l.stage}
                    </Badge>
                    {l.assignedExecutive && (
                      <div className="text-[11px] text-muted-foreground mt-1">→ {l.assignedExecutive}</div>
                    )}
                  </td>
                  <td className="py-2">
                    <Button size="sm" variant="outline" onClick={() => openReview(l)}>
                      Review Lead
                    </Button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No leads in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {visible.map((l) => (
          <Card key={l.leadId}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.leadId} · {l.city || "City missing"}</div>
                </div>
                <Badge className={priorityTone(l.priority)} variant="secondary">
                  {l.priority}
                </Badge>
              </div>
              <div className="text-xs space-y-0.5">
                <div>{mask(l.mobile)} · {mask(l.email)}</div>
                <div className="text-muted-foreground">
                  {l.platform} · {l.account} · {l.campaign}
                </div>
                <div className="text-muted-foreground">Content {l.contentId} · {l.enquiredAt}</div>
                <div>{l.interest}</div>
              </div>
              <p className="text-xs rounded-md bg-muted p-2">{l.message}</p>
              <div className="flex items-center justify-between">
                <Badge className={stageTone(l.stage)} variant="secondary">
                  {l.stage}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => openReview(l)}>
                  Review Lead
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Access & Handover Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>
            Contact details are visible to Social Media and Sales users only. Video Editors never see lead data.
            Leads are never deleted — spam and irrelevant enquiries stay for audit.
          </p>
          {audit.map((a, i) => (
            <div key={i} className="border-t pt-1">{a}</div>
          ))}
        </CardContent>
      </Card>

      {/* Review drawer */}
      <Dialog open={!!current} onOpenChange={(o) => !o && setOpenLead(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {current && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {current.name} · {current.leadId}
                </DialogTitle>
                <DialogDescription>
                  Permanent Lead ID. Source, campaign, advertisement and Content ID are preserved through handover.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-xs uppercase text-muted-foreground">Lead Details</h4>
                  {[
                    ["Mobile", current.mobile || "—"],
                    ["Email", current.email || "—"],
                    ["City / State", [current.city, current.state].filter(Boolean).join(", ") || "—"],
                    ["Business / occupation", current.occupation || "—"],
                    ["Enquiry type", current.enquiryType],
                    ["Interest", current.interest],
                    ["Product / service", current.productInterest],
                    ["Investment range", current.investmentRange ?? "Not applicable"],
                    ["Purchase timeline", current.timeline],
                    ["Preferred language", current.language],
                    ["Consent", current.consent],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b py-1">
                      <span className="text-muted-foreground text-xs">{k}</span>
                      <span className="text-xs text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-xs uppercase text-muted-foreground">Source</h4>
                  {[
                    ["Platform", current.platform],
                    ["Social account", current.account],
                    ["Campaign", current.campaign],
                    ["Advertisement", current.advertisement],
                    ["Related Content ID", current.contentId],
                    ["Enquiry date & time", current.enquiredAt],
                    ["Handover status", current.stage],
                    ["Recommended response", current.priority === "High" ? "Within 1 hour" : "Within 24 hours"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b py-1">
                      <span className="text-muted-foreground text-xs">{k}</span>
                      <span className="text-xs text-right">{v}</span>
                    </div>
                  ))}
                  <div className="rounded-md bg-muted p-2 text-xs">
                    <div className="font-medium mb-1">Original enquiry message</div>
                    {current.message}
                  </div>
                  <div className="text-xs">
                    <Label className="text-xs">Notes / Notes for Sales Head</Label>
                    <Textarea
                      value={handoverNote}
                      onChange={(e) => setHandoverNote(e.target.value)}
                      placeholder="Context that helps the Sales Head route this lead"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {current.duplicateOf && (
                <div className="rounded-lg border border-amber-300 p-3 space-y-2">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <Copy className="h-4 w-4 text-amber-600" /> Possible duplicate detected
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Matched on normalised mobile number and recent enquiry from the same social account.
                  </p>
                  <div className="text-xs rounded-md bg-muted p-2">
                    Existing lead <b>{current.duplicateOf}</b> · Sales Executive {current.duplicateOwner} ·
                    Pipeline stage {current.duplicateStage}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        update(
                          current.leadId,
                          { stage: "Duplicate" },
                          `Enquiry added to existing lead ${current.duplicateOf} — interaction timeline updated`,
                        );
                        toast.success(`Enquiry merged into ${current.duplicateOf}. No second lead created.`);
                      }}
                    >
                      Add New Enquiry to Existing Lead
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        update(
                          current.leadId,
                          { duplicateOf: undefined, stage: "Qualified" },
                          "Marked Not a Duplicate — different city and different contact person",
                        );
                        toast.success("Marked not a duplicate with reason recorded.");
                      }}
                    >
                      Not a Duplicate (with reason)
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-3">
                <div className="text-sm font-semibold mb-2">Qualification Check</div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {QUALIFICATION_CHECKS.map((c) => (
                    <label key={c} className="flex items-start gap-2 text-xs">
                      <Checkbox
                        checked={!!checks[c]}
                        onCheckedChange={(v) => setChecks((p) => ({ ...p, [c]: !!v }))}
                      />
                      <span>
                        {c}
                        {(c.startsWith("Consent") || c.startsWith("Relevant notes")) && (
                          <span className="text-muted-foreground"> (optional)</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                {!canHandover && (
                  <p className="text-xs text-destructive mt-2">
                    Complete the essential checks to enable handover. Optional fields never block an urgent lead.
                  </p>
                )}
              </div>

              {current.returnReason && current.stage === "Returned for Information" && (
                <div className="rounded-md border border-destructive/40 p-2 text-xs text-destructive">
                  Returned by Sales Head ({current.returnCount}x): {current.returnReason}
                </div>
              )}

              <div className="rounded-lg border p-3 space-y-2">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <UserCheck className="h-4 w-4" /> Sales Head Actions (demo)
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      update(current.leadId, { stage: "Accepted" }, "Sales Head accepted the lead");
                      toast.success("Accepted — visible in Team Leads.");
                    }}
                  >
                    Accept lead
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      update(
                        current.leadId,
                        { stage: "Returned for Information", returnReason: "Missing information", returnCount: current.returnCount + 1 },
                        "Sales Head returned the lead for missing information",
                      );
                      toast.warning("Returned for information.");
                    }}
                  >
                    Return for information
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => update(current.leadId, { stage: "Duplicate" }, "Sales Head marked duplicate")}
                  >
                    Mark duplicate
                  </Button>
                  <Select
                    onValueChange={(v) => {
                      update(
                        current.leadId,
                        { stage: "Sales Follow-up Started", assignedExecutive: v },
                        `Assigned to ${v} — follow-up continues in Sales CRM`,
                      );
                      toast.success(`Assigned to ${v}. Appears in their My Leads page.`);
                    }}
                  >
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder="Assign to Sales Executive" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXECUTIVES.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  After acceptance the Social Media Account Manager cannot change the Sales Pipeline.
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-sm font-semibold mb-1">Interaction Timeline</div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {current.timeline_log.map((t, i) => (
                    <div key={i}>
                      <b className="text-foreground">{t.at}</b> · {t.by} — {t.note}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex-wrap gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    update(current.leadId, { stage: "Not Relevant" }, "Marked Not Relevant — retained for audit");
                    setOpenLead(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Mark Not Relevant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    update(current.leadId, { stage: canHandover ? "Ready for Handover" : "Verification Required", salesNote: handoverNote }, "Saved for later");
                    setOpenLead(null);
                  }}
                >
                  Save for Later
                </Button>
                <Button
                  disabled={!canHandover}
                  onClick={() => {
                    update(
                      current.leadId,
                      { stage: "Awaiting Acceptance", salesNote: handoverNote },
                      "Sent to Sales Head — same lead record, no copy created",
                    );
                    toast.success("Sent to Sales Head. Awaiting acceptance.");
                    setOpenLead(null);
                  }}
                >
                  <Send className="h-4 w-4 mr-1" /> Send to Sales Head
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add lead */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
            <DialogDescription>
              Manually capture a social-media enquiry. A permanent Lead ID is generated and duplicate detection runs on save.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <Input placeholder="Full name" />
            <Input placeholder="Mobile number" />
            <Input placeholder="Email" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City" />
              <Input placeholder="State" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Lead interest" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_INTERESTS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder="Original enquiry message" />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setAddOpen(false);
                toast.success("Lead saved as New Enquiry with a permanent Lead ID.");
                log("Manual lead captured — duplicate check queued");
              }}
            >
              Save Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
