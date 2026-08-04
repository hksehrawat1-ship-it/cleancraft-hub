import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { SectionHead } from "./ui";
import { APPROVALS, type ApprovalItem, type ApprovalStatus } from "./data";

const tone: Record<ApprovalStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Changes Requested": "bg-orange-500/15 text-orange-600 border-orange-500/30",
  Approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function SmmReviewPage() {
  const [items, setItems] = useState<ApprovalItem[]>(APPROVALS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const set = (id: string, status: ApprovalStatus, remark?: string) => {
    setItems((l) => l.map((i) => (i.id === id ? { ...i, status, remark: remark ?? i.remark } : i)));
    toast.success(`Marked ${status}`);
    setOpenId(null);
    setNote("");
  };

  const pending = items.filter((i) => i.status === "Pending").length;
  const changes = items.filter((i) => i.status === "Changes Requested").length;
  const approved = items.filter((i) => i.status === "Approved").length;

  return (
    <div className="space-y-4">
      <SectionHead title="Review & Approval" sub="Content waiting on leadership sign-off before it can be scheduled." />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Pending Approval", v: pending, t: "text-amber-600" },
          { l: "Changes Requested", v: changes, t: "text-orange-600" },
          { l: "Approved", v: approved, t: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className={`text-3xl font-bold tabular-nums mt-1 ${s.t}`}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Approval queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((i) => (
            <div key={i.id} className="border rounded-md p-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{i.title}</span>
                    <Badge variant="outline" className={tone[i.status]}>{i.status}</Badge>
                    <Badge variant="outline">{i.format}</Badge>
                    <Badge variant="outline">{i.platform}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Submitted {i.submitted} · Approver: {i.approver}
                  </div>
                  {i.remark && (
                    <div className="text-xs mt-2 flex items-start gap-1.5 text-orange-600">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{i.remark}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenId(openId === i.id ? null : i.id)}>
                    Add remark
                  </Button>
                  <Button size="sm" onClick={() => set(i.id, "Approved")}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => set(i.id, "Rejected")}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>

              {openId === i.id && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  <Textarea
                    rows={3}
                    placeholder="What needs to change?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!note.trim()) {
                        toast.error("Write the change needed");
                        return;
                      }
                      set(i.id, "Changes Requested", note);
                    }}
                  >
                    Request changes
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
