import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select" | "email" | "tel";
  options?: string[];
  required?: boolean;
};

export function EntityPage({
  title, description, table, columns, fields, defaults = {}, badgeField,
  ownerField,
}: {
  title: string;
  description: string;
  table: string;
  columns: { key: string; label: string; render?: (v: any, row: any) => React.ReactNode }[];
  fields: Field[];
  defaults?: Record<string, any>;
  badgeField?: string;
  ownerField?: string;
}) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <RowDialog table={table} fields={fields} defaults={defaults} ownerField={ownerField}
          onSaved={() => qc.invalidateQueries({ queryKey: [table] })}>
          <Button><Plus className="w-4 h-4 mr-1" /> New</Button>
        </RowDialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Nothing here yet.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  {columns.map((c) => <th key={c.key} className="px-4 py-2 font-medium text-muted-foreground">{c.label}</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3">
                        {c.render ? c.render(r[c.key], r) : badgeField === c.key && r[c.key] ? (
                          <Badge variant="outline">{String(r[c.key]).replace("_", " ")}</Badge>
                        ) : (
                          r[c.key] ?? "—"
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <RowDialog table={table} fields={fields} defaults={defaults} row={r} ownerField={ownerField}
                        onSaved={() => qc.invalidateQueries({ queryKey: [table] })}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </RowDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      {!user && null}
    </div>
  );
}

function RowDialog({
  children, table, fields, defaults, row, onSaved, ownerField,
}: {
  children: React.ReactNode;
  table: string;
  fields: Field[];
  defaults: Record<string, any>;
  row?: any;
  ownerField?: string;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(row ?? { ...defaults });

  async function save() {
    for (const f of fields) {
      if (f.required && !form[f.name]) return toast.error(`${f.label} is required`);
    }
    setSaving(true);
    const payload: any = { ...form };
    for (const f of fields) {
      if (f.type === "date" && payload[f.name] === "") payload[f.name] = null;
      if (f.type === "number" && payload[f.name] !== undefined && payload[f.name] !== "") {
        payload[f.name] = Number(payload[f.name]);
      }
    }
    if (row) {
      const { error } = await (supabase as any).from(table).update(payload).eq("id", row.id);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      if (ownerField) payload[ownerField] = user!.id;
      const { error } = await (supabase as any).from(table).insert(payload);
      if (error) { setSaving(false); return toast.error(error.message); }
    }
    setSaving(false); setOpen(false); onSaved();
    toast.success("Saved");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{row ? "Edit" : "New entry"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
              <Label>{f.label}{f.required && " *"}</Label>
              {f.type === "textarea" ? (
                <Textarea rows={3} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              ) : f.type === "select" ? (
                <Select value={form[f.name] ?? ""} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {f.options!.map((o) => <SelectItem key={o} value={o}>{o.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type ?? "text"}
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
