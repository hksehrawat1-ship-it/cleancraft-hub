import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, MessageCircle, Pencil } from "lucide-react";
import { LeadDialog, classificationVariant, type Lead } from "./leads";

export const Route = createFileRoute("/_authenticated/leads_/$id")({
  head: () => ({ meta: [{ title: "Lead Details — Clean Craft OS" }] }),
  component: LeadDetailsPage,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-red-600">{error.message}</div>,
  notFoundComponent: () => <div className="p-6 text-sm text-muted-foreground">Lead not found.</div>,
});

type Activity = {
  id: string;
  lead_id: string;
  actor_id: string | null;
  action: string;
  details: any;
  created_at: string;
};

function LeadDetailsPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("leads").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Lead | null;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("profiles").select("id, full_name").order("full_name");
      if (error) throw error;
      return data as { id: string; full_name: string }[];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["lead_activities", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lead_activities").select("*").eq("lead_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Activity[];
    },
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!lead) return <div className="p-6 text-sm text-muted-foreground">Lead not found.</div>;

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));
  function refresh() {
    qc.invalidateQueries({ queryKey: ["lead", id] });
    qc.invalidateQueries({ queryKey: ["lead_activities", id] });
    qc.invalidateQueries({ queryKey: ["my-leads"] });
    qc.invalidateQueries({ queryKey: ["leads"] });
  }

  const factors = [
    ["Profitability", lead.buying_factor_profitability],
    ["Training", lead.buying_factor_training],
    ["Technology", lead.buying_factor_technology],
    ["Support", lead.buying_factor_support],
    ["Brand", lead.buying_factor_brand],
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/my-sales"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            <p className="text-sm text-muted-foreground">
              {lead.city ?? "—"}{lead.state ? `, ${lead.state}` : ""} · {lead.phone ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {lead.phone && (
            <>
              <a href={`tel:${lead.phone}`}><Button size="sm" variant="outline"><Phone className="w-4 h-4 mr-1" /> Call</Button></a>
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200"><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button>
              </a>
            </>
          )}
          <LeadDialog lead={lead} profiles={profiles} onSaved={refresh}>
            <Button size="sm"><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
          </LeadDialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {lead.lead_classification && (
          <Badge variant="outline" className={classificationVariant(lead.lead_classification)}>{lead.lead_classification}</Badge>
        )}
        <Badge variant="outline">{lead.lead_stage}</Badge>
        {lead.next_action && <Badge variant="outline">Next: {lead.next_action}</Badge>}
        {lead.followup_date && <Badge variant="outline">Follow-up: {lead.followup_date}</Badge>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Personal Details">
          <Row k="Mobile" v={lead.phone} />
          <Row k="Email" v={lead.email} />
          <Row k="City" v={lead.city} />
          <Row k="State" v={lead.state} />
          <Row k="Source" v={lead.lead_source} />
        </SectionCard>

        <SectionCard title="Qualification Details">
          <Row k="Decision Maker" v={lead.decision_maker_status} />
          <Row k="Budget" v={lead.budget_range} />
          <Row k="Timeline" v={lead.timeline} />
          <Row k="Partnership" v={lead.partnership_status} />
          <Row k="Location" v={lead.location_status} />
        </SectionCard>

        <SectionCard title="Buying Factors">
          <div className="flex flex-wrap gap-2">
            {factors.map(([label, on]) => (
              <Badge key={label} variant={on ? "default" : "outline"} className={on ? "" : "text-muted-foreground"}>
                {label}
              </Badge>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Sales Information">
          <Row k="Proposal Sent" v={lead.proposal_sent_date} />
          <Row k="Meeting" v={lead.meeting_date} />
          <Row k="Engagement Letter Sent" v={lead.engagement_letter_sent_date} />
          <Row k="EL Fee Status" v={lead.engagement_letter_fee_status} />
          <Row k="EL Fee Received" v={lead.engagement_letter_fee_received_date} />
          <Row k="EL Fee Amount" v={lead.engagement_letter_fee_amount != null ? `₹${lead.engagement_letter_fee_amount}` : null} />
          <Row k="Booking Date" v={lead.booking_date} />
        </SectionCard>

        <SectionCard title="Remarks" className="md:col-span-2">
          <p className="text-sm whitespace-pre-wrap">{lead.remarks ?? "—"}</p>
        </SectionCard>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            <ol className="relative border-l pl-6 space-y-4">
              {activities.map((a) => {
                const d = new Date(a.created_at);
                return (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="text-sm font-medium">{a.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {a.actor_id ? ` · ${profileMap[a.actor_id] ?? "User"}` : ""}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-1.5">{children}</CardContent>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v != null && v !== "" ? String(v) : "—"}</span>
    </div>
  );
}
