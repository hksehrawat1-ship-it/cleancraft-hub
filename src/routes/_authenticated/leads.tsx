import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, AlertCircle, Trash2, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads — Clean Craft OS" }] }),
  component: LeadsPage,
});

const LEAD_SOURCES = ["Website", "Google Ads", "IVR", "Referral", "YouTube", "Instagram"];
export const CLASSIFICATIONS = ["Hot", "Warm", "Cold", "Dangerous", "Time Waster"];
export const STAGES = [
  "New Lead", "Contacted", "Qualified", "Proposal Sent", "Follow-up",
  "Meeting Done", "Engagement Letter Pending", "Booking Received",
  "Handover Completed", "Lost",
];
export const NEXT_ACTIONS = [
  "Call", "Follow-up", "Send Proposal", "Schedule Meeting",
  "Collect Engagement Fee", "Handover", "Disqualify",
];
const EL_FEE_STATUSES = ["Not Required", "Pending", "Partially Received", "Received"];
const BOOKING_AMT_STATUSES = ["Not Required", "Pending", "Partially Received", "Received"];

export type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  lead_source: string | null;
  budget_range: string | null;
  timeline: string | null;
  decision_maker_status: string | null;
  partnership_status: string | null;
  location_status: string | null;
  lead_classification: string | null;
  lead_stage: string;
  next_action: string | null;
  assigned_to: string | null;
  proposal_sent_date: string | null;
  followup_date: string | null;
  meeting_date: string | null;
  engagement_letter_sent_date: string | null;
  engagement_letter_fee_status: string | null;
  engagement_letter_fee_received_date: string | null;
  engagement_letter_fee_amount: number | null;
  booking_date: string | null;
  booking_amount_status: string | null;
  buying_factor_profitability: boolean;
  buying_factor_training: boolean;
  buying_factor_technology: boolean;
  buying_factor_support: boolean;
  buying_factor_brand: boolean;
  remarks: string | null;
  converted_to_franchise_at: string | null;
  created_at: string;
  created_by: string | null;
};

type Profile = { id: string; full_name: string };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export function classificationVariant(c: string | null) {
  switch (c) {
    case "Hot": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Warm": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Cold": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Dangerous": return "bg-red-100 text-red-700 border-red-200";
    case "Time Waster": return "bg-gray-100 text-gray-600 border-gray-200";
    default: return "bg-muted text-muted-foreground";
  }
}

export const HANDOVER_STAGES = ["Handover Completed", "Handover Done"];
export const TERMINAL_STAGES = [...HANDOVER_STAGES, "Lost"];

function LeadsPage() {
  const qc = useQueryClient();
  const { isLeadership } = useAuth();
  const [search, setSearch] = useState("");
  const [fSource, setFSource] = useState("all");
  const [fClass, setFClass] = useState("all");
  const [fStage, setFStage] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");
  const [fCity, setFCity] = useState("");
  const [fDueToday, setFDueToday] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles").select("id, full_name").order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const profileMap = useMemo(
    () => Object.fromEntries(profiles.map((p) => [p.id, p.full_name])),
    [profiles],
  );

  const filtered = useMemo(() => {
    const today = todayISO();
    return leads.filter((l) => {
      if (search && !(`${l.name} ${l.phone ?? ""} ${l.city ?? ""}`.toLowerCase().includes(search.toLowerCase()))) return false;
      if (fSource !== "all" && l.lead_source !== fSource) return false;
      if (fClass !== "all" && l.lead_classification !== fClass) return false;
      if (fStage !== "all" && l.lead_stage !== fStage) return false;
      if (fAssignee !== "all" && l.assigned_to !== fAssignee) return false;
      if (fCity && !(l.city ?? "").toLowerCase().includes(fCity.toLowerCase())) return false;
      if (fDueToday && l.followup_date !== today) return false;
      return true;
    });
  }, [leads, search, fSource, fClass, fStage, fAssignee, fCity, fDueToday]);

  // Dashboard metrics
  const today = todayISO();
  const monthStart = startOfMonthISO();
  const metrics = useMemo(() => ({
    total: leads.length,
    newHot: leads.filter((l) => l.lead_classification === "Hot" && l.lead_stage === "New Lead").length,
    newWarm: leads.filter((l) => l.lead_classification === "Warm" && l.lead_stage === "New Lead").length,
    dueToday: leads.filter((l) => l.followup_date === today).length,
    proposalSent: leads.filter((l) => l.lead_stage === "Proposal Sent").length,
    meetingsDone: leads.filter((l) => l.lead_stage === "Meeting Done").length,
    bookingThisMonth: leads.filter((l) => l.lead_stage === "Booking Received" && l.created_at >= monthStart).length,
    lost: leads.filter((l) => l.lead_stage === "Lost").length,
    franchiseBooked: leads.filter((l) => !!l.converted_to_franchise_at).length,
  }), [leads, today, monthStart]);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["franchise_bookings"] });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">Sales pipeline & follow-ups.</p>
        </div>
        <LeadDialog profiles={profiles} onSaved={refresh}>
          <Button><Plus className="w-4 h-4 mr-1" /> New Lead</Button>
        </LeadDialog>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat label="Total Leads" value={metrics.total} />
        <Stat label="New Hot Leads" value={metrics.newHot} tone="text-red-600" />
        <Stat label="New Warm Leads" value={metrics.newWarm} tone="text-amber-600" />
        <Stat label="Follow-ups Due Today" value={metrics.dueToday} tone="text-blue-600" />
        <Stat label="Proposal Sent" value={metrics.proposalSent} />
        <Stat label="Meetings Done" value={metrics.meetingsDone} />
        <Stat label="Bookings This Month" value={metrics.bookingThisMonth} tone="text-emerald-600" />
        <Stat label="Lost Leads" value={metrics.lost} tone="text-muted-foreground" />
        <Stat label="Total Franchise Booked" value={metrics.franchiseBooked} tone="text-emerald-700" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, phone, city…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <FilterSelect value={fSource} onChange={setFSource} placeholder="Source" options={LEAD_SOURCES} />
          <FilterSelect value={fClass} onChange={setFClass} placeholder="Classification" options={CLASSIFICATIONS} />
          <FilterSelect value={fStage} onChange={setFStage} placeholder="Stage" options={STAGES} />
          <Select value={fAssignee} onValueChange={setFAssignee}>
            <SelectTrigger><SelectValue placeholder="Assignee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="City filter" value={fCity} onChange={(e) => setFCity(e.target.value)} />
          <div className="flex items-center gap-2">
            <Button variant={fDueToday ? "default" : "outline"} size="sm" onClick={() => setFDueToday((v) => !v)}>
              <AlertCircle className="w-4 h-4 mr-1" /> Due Today
            </Button>
            {(fSource !== "all" || fClass !== "all" || fStage !== "all" || fAssignee !== "all" || fCity || fDueToday || search) && (
              <Button variant="ghost" size="sm" onClick={() => {
                setSearch(""); setFSource("all"); setFClass("all"); setFStage("all");
                setFAssignee("all"); setFCity(""); setFDueToday(false);
              }}>Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No leads match these filters.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <Th className="sticky left-0 z-10 bg-muted/50">Name</Th><Th>Phone</Th><Th>Source</Th><Th>City</Th>
                  <Th>Class</Th><Th>Stage</Th><Th>Assigned</Th><Th>Follow-up</Th><Th></Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const overdue = l.followup_date && l.followup_date < today && l.lead_stage !== "Lost" && l.lead_stage !== "Handover Done";
                  const dueToday = l.followup_date === today;
                  return (
                    <tr key={l.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium sticky left-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        {l.name}
                        {l.converted_to_franchise_at && <Badge variant="outline" className="ml-2 text-emerald-700 border-emerald-200">Franchise</Badge>}
                      </td>
                      <td className="px-4 py-3">{l.phone ?? "—"}</td>
                      <td className="px-4 py-3">{l.lead_source ?? "—"}</td>
                      <td className="px-4 py-3">{l.city ?? "—"}</td>
                      <td className="px-4 py-3">
                        {l.lead_classification ? (
                          <Badge variant="outline" className={classificationVariant(l.lead_classification)}>{l.lead_classification}</Badge>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline">{l.lead_stage}</Badge></td>
                      <td className="px-4 py-3">{l.assigned_to ? profileMap[l.assigned_to] ?? "—" : "—"}</td>
                      <td className="px-4 py-3">
                        {l.followup_date ? (
                          <span className={overdue ? "text-red-600 font-medium" : dueToday ? "text-blue-600 font-medium" : ""}>
                            {l.followup_date}{overdue && " (overdue)"}{dueToday && " (today)"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {l.lead_stage === "Booking Received" && !l.converted_to_franchise_at && (
                          <ConvertButton lead={l} onDone={refresh} />
                        )}
                        <LeadDialog lead={l} profiles={profiles} onSaved={refresh}>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </LeadDialog>
                        {isLeadership && <DeleteLead id={l.id} onDone={refresh} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 font-medium text-muted-foreground ${className ?? ""}`}>{children}</th>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-semibold mt-1 ${tone ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string; options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function DeleteLead({ id, onDone }: { id: string; onDone: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              const { error } = await (supabase as any).from("leads").delete().eq("id", id);
              if (error) return toast.error(error.message);
              toast.success("Lead deleted");
              onDone();
            }}
          >Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConvertButton({ lead, onDone }: { lead: Lead; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  async function convert() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const userId = u.user?.id;
    const { error: insErr } = await (supabase as any).from("franchise_bookings").insert({
      lead_id: lead.id,
      franchisee_name: lead.name,
      city: lead.city,
      booking_amount: 0,
      booked_at: new Date().toISOString(),
      created_by: userId,
      notes: lead.remarks,
    });
    if (insErr) { setLoading(false); return toast.error(insErr.message); }
    const { error: updErr } = await (supabase as any)
      .from("leads")
      .update({ converted_to_franchise_at: new Date().toISOString(), lead_stage: "Handover Done" })
      .eq("id", lead.id);
    if (updErr) { setLoading(false); return toast.error(updErr.message); }
    setLoading(false);
    toast.success("Converted to franchise project");
    onDone();
  }
  return (
    <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200 mr-1" onClick={convert} disabled={loading}>
      <ArrowRightCircle className="w-4 h-4 mr-1" /> {loading ? "Converting…" : "Convert to Franchise"}
    </Button>
  );
}

export function LeadDialog({
  children, lead, profiles, onSaved,
}: {
  children: React.ReactNode;
  lead?: Lead;
  profiles: Profile[];
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(
    lead ?? { lead_stage: "New Lead", lead_classification: "Warm" },
  );

  function update(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.name) return toast.error("Lead Name is required");
    // No Lead Left Behind: stage, next action, follow-up date all required
    if (!form.lead_stage) return toast.error("Lead Stage is required");
    if (!form.next_action) return toast.error("Next Action is required");
    if (!form.followup_date) return toast.error("Follow-up Date is required");
    setSaving(true);
    const payload: any = { ...form };
    for (const k of [
      "proposal_sent_date", "followup_date", "meeting_date",
      "engagement_letter_sent_date", "engagement_letter_fee_received_date",
      "booking_date",
    ]) {
      if (payload[k] === "") payload[k] = null;
    }
    if (payload.engagement_letter_fee_amount === "" || payload.engagement_letter_fee_amount === undefined) {
      payload.engagement_letter_fee_amount = null;
    } else if (payload.engagement_letter_fee_amount != null) {
      payload.engagement_letter_fee_amount = Number(payload.engagement_letter_fee_amount);
    }
    if (payload.assigned_to === "" || payload.assigned_to === "none") payload.assigned_to = null;
    let error;
    if (lead) {
      ({ error } = await (supabase as any).from("leads").update(payload).eq("id", lead.id));
    } else {
      payload.created_by = user!.id;
      ({ error } = await (supabase as any).from("leads").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setForm(lead ?? { lead_stage: "New Lead", lead_classification: "Warm" }); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{lead ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>

        <SectionLabel>Personal Details</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Lead Name *"><Input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} /></Field>
          <Field label="Mobile Number"><Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} /></Field>
          <Field label="City"><Input value={form.city ?? ""} onChange={(e) => update("city", e.target.value)} /></Field>
          <Field label="State"><Input value={form.state ?? ""} onChange={(e) => update("state", e.target.value)} /></Field>
          <SelectField label="Lead Source" value={form.lead_source} onChange={(v) => update("lead_source", v)} options={LEAD_SOURCES} />
        </div>

        <SectionLabel>Qualification Details</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField label="Decision Maker" value={form.decision_maker_status} onChange={(v) => update("decision_maker_status", v)} options={["Yes", "No"]} />
          <Field label="Budget"><Input placeholder="e.g. 10-15 Lakh" value={form.budget_range ?? ""} onChange={(e) => update("budget_range", e.target.value)} /></Field>
          <Field label="Timeline"><Input placeholder="e.g. 1-3 months" value={form.timeline ?? ""} onChange={(e) => update("timeline", e.target.value)} /></Field>
          <SelectField label="Partnership Status" value={form.partnership_status} onChange={(v) => update("partnership_status", v)} options={["Solo", "With Partner", "Looking for Partner"]} />
          <SelectField label="Location Status" value={form.location_status} onChange={(v) => update("location_status", v)} options={["Identified", "Shortlisted", "Not Yet", "Owned"]} />
        </div>

        <SectionLabel>Buying Factors</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {([
            ["buying_factor_profitability", "Profitability"],
            ["buying_factor_training", "Training"],
            ["buying_factor_technology", "Technology"],
            ["buying_factor_support", "Support"],
            ["buying_factor_brand", "Brand"],
          ] as [string, string][]).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <Checkbox checked={!!form[k]} onCheckedChange={(v) => update(k, !!v)} />
              {label}
            </label>
          ))}
        </div>

        <SectionLabel>Classification & Stage</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField label="Lead Classification" value={form.lead_classification} onChange={(v) => update("lead_classification", v)} options={CLASSIFICATIONS} />
          <SelectField label="Lead Stage *" value={form.lead_stage} onChange={(v) => update("lead_stage", v)} options={STAGES} />
          <Field label="Assigned Sales Executive">
            <Select value={form.assigned_to ?? "none"} onValueChange={(v) => update("assigned_to", v === "none" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <SelectField label="Next Action *" value={form.next_action} onChange={(v) => update("next_action", v)} options={NEXT_ACTIONS} />
        </div>

        <SectionLabel>Sales Information</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Proposal Sent Date"><Input type="date" value={form.proposal_sent_date ?? ""} onChange={(e) => update("proposal_sent_date", e.target.value)} /></Field>
          <Field label="Meeting Date"><Input type="date" value={form.meeting_date ?? ""} onChange={(e) => update("meeting_date", e.target.value)} /></Field>
          <Field label="Engagement Letter Sent Date"><Input type="date" value={form.engagement_letter_sent_date ?? ""} onChange={(e) => update("engagement_letter_sent_date", e.target.value)} /></Field>
          <SelectField label="Engagement Letter Fee Status" value={form.engagement_letter_fee_status} onChange={(v) => update("engagement_letter_fee_status", v)} options={EL_FEE_STATUSES} />
          <Field label="Engagement Fee Received Date"><Input type="date" value={form.engagement_letter_fee_received_date ?? ""} onChange={(e) => update("engagement_letter_fee_received_date", e.target.value)} /></Field>
          <Field label="Engagement Fee Amount (₹)"><Input type="number" value={form.engagement_letter_fee_amount ?? ""} onChange={(e) => update("engagement_letter_fee_amount", e.target.value)} /></Field>
          <Field label="Booking Date"><Input type="date" value={form.booking_date ?? ""} onChange={(e) => update("booking_date", e.target.value)} /></Field>
          <SelectField label="Booking Amount Status" value={form.booking_amount_status} onChange={(v) => update("booking_amount_status", v)} options={BOOKING_AMT_STATUSES} />
        </div>

        <SectionLabel>Follow-up *</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Follow-up Date *"><Input type="date" value={form.followup_date ?? ""} onChange={(e) => update("followup_date", e.target.value)} /></Field>
          <div className="md:col-span-2">
            <Label>Remarks</Label>
            <Textarea rows={3} value={form.remarks ?? ""} onChange={(e) => update("remarks", e.target.value)} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Lead Stage, Next Action and Follow-up Date are all required — no lead left behind.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Lead"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</div>;
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string | null | undefined; onChange: (v: string) => void; options: string[];
}) {
  return (
    <Field label={label}>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}
