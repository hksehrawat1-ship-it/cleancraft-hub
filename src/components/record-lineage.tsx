import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export type LineageRow = {
  lead_id: string;
  lead_code: string | null;
  lead_name: string | null;
  lead_stage: string | null;
  franchise_booking_id: string | null;
  franchise_code: string | null;
  franchisee_name: string | null;
  project_id: string | null;
  project_code: string | null;
  project_name: string | null;
  project_status: string | null;
  store_id: string | null;
  store_code: string | null;
  store_name: string | null;
  store_status: string | null;
};

export function useLineage(leadId: string) {
  return useQuery({
    queryKey: ["record_lineage", leadId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("record_lineage")
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as LineageRow | null;
    },
  });
}

function CodeChip({ code }: { code: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code);
        toast.success(`${code} copied`);
      }}
      className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-xs hover:bg-muted"
    >
      {code}
      <Copy className="h-3 w-3 opacity-60" />
    </button>
  );
}

function Stage({
  label,
  code,
  title,
  meta,
  done,
  action,
}: {
  label: string;
  code: string | null;
  title: string | null;
  meta?: string | null;
  done: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-[190px] rounded-lg border p-3 space-y-1.5 bg-background">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        {done ? (
          <Badge variant="outline" className="text-emerald-700 border-emerald-200">
            <Check className="h-3 w-3 mr-1" /> Linked
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">Not created</Badge>
        )}
      </div>
      {code ? <CodeChip code={code} /> : <div className="text-xs text-muted-foreground">—</div>}
      <div className="text-sm font-medium truncate">{title ?? "—"}</div>
      {meta && <div className="text-xs text-muted-foreground truncate">{meta}</div>}
      {action}
    </div>
  );
}

/**
 * One connected record: Lead → Franchise → Project → Store.
 * Handover buttons call idempotent backend actions, so a repeated click (or a
 * second department doing the same handover) reuses the existing record
 * instead of creating a duplicate.
 */
export function RecordLineage({ leadId }: { leadId: string }) {
  const qc = useQueryClient();
  const { data: row, isLoading } = useLineage(leadId);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(fn: string, args: Record<string, unknown>, label: string) {
    setBusy(fn);
    const { error } = await (supabase as any).rpc(fn, args);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(label);
    qc.invalidateQueries({ queryKey: ["record_lineage", leadId] });
    qc.invalidateQueries({ queryKey: ["lead", leadId] });
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["my-leads"] });
    qc.invalidateQueries({ queryKey: ["franchise_bookings"] });
  }

  if (isLoading) return null;
  if (!row) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Connected Record</CardTitle>
        <p className="text-xs text-muted-foreground">
          Lead ID → Franchise ID → Project ID → Store ID. Handovers reuse the same record chain — no
          department can create a duplicate.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-stretch gap-2">
          <Stage
            label="Lead"
            code={row.lead_code}
            title={row.lead_name}
            meta={row.lead_stage}
            done
          />
          <Arrow />
          <Stage
            label="Franchise"
            code={row.franchise_code}
            title={row.franchisee_name}
            meta={null}
            done={!!row.franchise_booking_id}
            action={
              !row.franchise_booking_id ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={busy === "handover_lead_to_franchise"}
                  onClick={() =>
                    run("handover_lead_to_franchise", { _lead_id: leadId }, "Franchise record linked")
                  }
                >
                  Hand over to Franchise
                </Button>
              ) : undefined
            }
          />
          <Arrow />
          <Stage
            label="Project"
            code={row.project_code}
            title={row.project_name}
            meta={row.project_status}
            done={!!row.project_id}
            action={
              row.franchise_booking_id && !row.project_id ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={busy === "handover_franchise_to_project"}
                  onClick={() =>
                    run(
                      "handover_franchise_to_project",
                      { _franchise_booking_id: row.franchise_booking_id },
                      "Project record linked",
                    )
                  }
                >
                  Hand over to Projects
                </Button>
              ) : undefined
            }
          />
          <Arrow />
          <Stage
            label="Store"
            code={row.store_code}
            title={row.store_name}
            meta={row.store_status}
            done={!!row.store_id}
            action={
              row.project_id && !row.store_id ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={busy === "handover_project_to_store"}
                  onClick={() =>
                    run("handover_project_to_store", { _project_id: row.project_id }, "Store record linked")
                  }
                >
                  Hand over to Store
                </Button>
              ) : undefined
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center text-muted-foreground">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}
