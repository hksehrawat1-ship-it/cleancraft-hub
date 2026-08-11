import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertTriangle, ArrowRightLeft, CheckCircle2, History, Send } from "lucide-react";
import {
  decideHandover,
  listMyWork,
  listWorkHistory,
  respondToAssignment,
  submitWorkForReview,
  updateWorkStatus,
} from "@/lib/work.functions";
import { safeQuery } from "@/lib/work-safe";
import {
  EMPLOYEE_QUEUES,
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TONE_BG,
  TONE_TEXT,
  bucketEmployee,
  fmtDue,
  isOverdue,
  type WorkItem,
  type WorkStatus,
} from "@/lib/work-types";

export function StatusPill({ status }: { status: WorkStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_BG[STATUS_TONE[status]]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function WorkItemCard({
  item,
  children,
}: {
  item: WorkItem;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border bg-card p-3 ${isOverdue(item) ? "border-destructive/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{item.title}</span>
            <StatusPill status={item.status} />
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {item.record_code} · {item.master_code ? `${item.master_code} · ` : ""}
            {item.from_department ? `${item.from_department} → ` : ""}
            {item.to_department ?? "—"}
          </div>
          {item.required_action && (
            <div className="mt-1 text-xs">
              <span className="text-muted-foreground">Required action: </span>
              {item.required_action}
            </div>
          )}
          {item.next_action && (
            <div className="text-xs">
              <span className="text-muted-foreground">Next action: </span>
              {item.next_action}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className={`text-xs font-medium ${TONE_TEXT[PRIORITY_TONE[item.priority] ?? "muted"]}`}>
            {item.priority}
          </div>
          <div className={`text-xs ${isOverdue(item) ? "text-destructive" : "text-muted-foreground"}`}>
            {isOverdue(item) ? "Overdue · " : ""}
            {fmtDue(item.due_at)}
          </div>
        </div>
      </div>
      {children && <div className="mt-2 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function WorkHistoryDialog({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  const fetchHistory = useServerFn(listWorkHistory);
  const { data } = useQuery({
    queryKey: ["work-history", item.id],
    queryFn: () => safeQuery(() => fetchHistory({ data: { workItemId: item.id } }), { events: [], assignments: [], handovers: [] } as any),
    retry: false,
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>History — {item.record_code}</DialogTitle>
          <DialogDescription>
            Complete assignment, status and handover history. Entries can never be edited or removed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {((data?.events ?? []) as any[]).map((e) => (
            <div key={e.id} className="rounded-md border bg-card p-2 text-xs">
              <div className="font-medium">{e.event_type.replace(/_/g, " ")}</div>
              <div className="text-muted-foreground">
                {new Date(e.created_at).toLocaleString("en-IN")}
                {e.from_value ? ` · from ${e.from_value}` : ""}
                {e.to_value ? ` · to ${e.to_value}` : ""}
              </div>
              {e.reason && <div className="mt-0.5">{e.reason}</div>}
            </div>
          ))}
          {(data?.events ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No history recorded yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** The nine-tile employee queue with accept / return / progress / complete actions. */
export function MyWorkQueue({ title = "My Work" }: { title?: string }) {
  const qc = useQueryClient();
  const fetchMine = useServerFn(listMyWork);
  const respond = useServerFn(respondToAssignment);
  const setStatus = useServerFn(updateWorkStatus);
  const submitReview = useServerFn(submitWorkForReview);
  const handover = useServerFn(decideHandover);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-work"],
    queryFn: () => safeQuery(() => fetchMine(), [] as any[]),
    retry: false,
  });

  const [queue, setQueue] = useState<string>("new");
  const [returnFor, setReturnFor] = useState<WorkItem | null>(null);
  const [completeFor, setCompleteFor] = useState<WorkItem | null>(null);
  const [historyFor, setHistoryFor] = useState<WorkItem | null>(null);
  const [reason, setReason] = useState("");
  const [missing, setMissing] = useState("");
  const [summary, setSummary] = useState("");
  const [issues, setIssues] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [evidence, setEvidence] = useState("");

  const rows = useMemo(() => bucketEmployee(items as WorkItem[], queue), [items, queue]);
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["my-work"] });
    qc.invalidateQueries({ queryKey: ["team-work"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const accept = useMutation({
    mutationFn: (id: string) => respond({ data: { workItemId: id, decision: "accept" } }),
    onSuccess: () => {
      toast.success("Work accepted — you are now the accountable owner.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const doReturn = useMutation({
    mutationFn: () =>
      respond({
        data: {
          workItemId: returnFor!.id,
          decision: "return",
          reason,
          missingInformation: missing,
        },
      }),
    onSuccess: () => {
      toast.success("Work returned with reason recorded.");
      setReturnFor(null);
      setReason("");
      setMissing("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const start = useMutation({
    mutationFn: (id: string) => setStatus({ data: { workItemId: id, status: "in_progress" } }),
    onSuccess: () => {
      toast.success("Marked in progress.");
      invalidate();
    },
  });

  const block = useMutation({
    mutationFn: (id: string) => setStatus({ data: { workItemId: id, status: "information_required" } }),
    onSuccess: () => {
      toast.success("Information requested from the sender.");
      invalidate();
    },
  });

  const complete = useMutation({
    mutationFn: () =>
      submitReview({
        data: {
          workItemId: completeFor!.id,
          completionSummary: summary,
          issuesRemaining: issues,
          nextAction,
          evidenceLabel: evidence ? "Completion evidence" : undefined,
          evidenceUrl: evidence || undefined,
        },
      }),
    onSuccess: (r) => {
      toast.success(r.needsReview ? "Submitted for review." : "Work completed.");
      setCompleteFor(null);
      setSummary("");
      setIssues("");
      setNextAction("");
      setEvidence("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const acceptHandover = useMutation({
    mutationFn: (id: string) => handover({ data: { workItemId: id, decision: "accepted" } }),
    onSuccess: () => {
      toast.success("Handover accepted — the same record now continues with you.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Every item has one accountable owner, a status, a next action and a deadline. Live from the shared work record.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {EMPLOYEE_QUEUES.map((q) => {
            const count = bucketEmployee(items as WorkItem[], q.key).length;
            const active = queue === q.key;
            return (
              <button
                key={q.key}
                onClick={() => setQueue(q.key)}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  active ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <div className="text-xs text-muted-foreground">{q.label}</div>
                <div className={`text-xl font-semibold ${TONE_TEXT[q.tone]}`}>{count}</div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading your work…</p>}
          {!isLoading && rows.length === 0 && (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Nothing in this queue.
            </p>
          )}
          {rows.map((item) => (
            <WorkItemCard key={item.id} item={item}>
              {item.handover_status === "sent" && (
                <Button size="sm" onClick={() => acceptHandover.mutate(item.id)}>
                  <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
                  Accept handover
                </Button>
              )}
              {(item.status === "assigned" || item.status === "submitted") && (
                <Button size="sm" onClick={() => accept.mutate(item.id)}>
                  Accept
                </Button>
              )}
              {(item.status === "assigned" || item.status === "submitted" || item.status === "accepted") && (
                <Button size="sm" variant="outline" onClick={() => setReturnFor(item)}>
                  Return
                </Button>
              )}
              {(item.status === "accepted" || item.status === "correction_required" || item.status === "reopened") && (
                <Button size="sm" variant="secondary" onClick={() => start.mutate(item.id)}>
                  Start work
                </Button>
              )}
              {item.status === "in_progress" && (
                <>
                  <Button size="sm" onClick={() => setCompleteFor(item)}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Submit completion
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => block.mutate(item.id)}>
                    Need information
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => setHistoryFor(item)}>
                <History className="mr-1.5 h-3.5 w-3.5" />
                History
              </Button>
            </WorkItemCard>
          ))}
        </div>
      </CardContent>

      {/* return dialog */}
      <Dialog open={!!returnFor} onOpenChange={(o) => !o && setReturnFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Return work — {returnFor?.record_code}</DialogTitle>
            <DialogDescription>
              A reason and the missing-information list are required. The previous owner and reason are preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Reason for returning</label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Missing information</label>
              <Textarea value={missing} onChange={(e) => setMissing(e.target.value)} rows={2} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnFor(null)}>
              Cancel
            </Button>
            <Button disabled={!reason.trim() || doReturn.isPending} onClick={() => doReturn.mutate()}>
              Return work
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* completion dialog */}
      <Dialog open={!!completeFor} onOpenChange={(o) => !o && setCompleteFor(null)}>
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Completion report — {completeFor?.record_code}</DialogTitle>
            <DialogDescription>
              A work-completed summary is required. Add evidence, issues remaining and the next action where applicable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Work completed summary *</label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Supporting evidence (link or reference)</label>
              <Input value={evidence} onChange={(e) => setEvidence(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Issues remaining</label>
              <Textarea value={issues} onChange={(e) => setIssues(e.target.value)} rows={2} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Next action</label>
              <Input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className="mt-1" />
            </div>
            {completeFor?.approval_required && (
              <p className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                This item needs reviewer confirmation before it is marked completed.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteFor(null)}>
              Cancel
            </Button>
            <Button disabled={summary.trim().length < 3 || complete.isPending} onClick={() => complete.mutate()}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {historyFor && <WorkHistoryDialog item={historyFor} onClose={() => setHistoryFor(null)} />}
    </Card>
  );
}

/** Small tabbed wrapper so a dashboard can show queues without touching its menu. */
export function WorkTabs({ children }: { children: React.ReactNode }) {
  return (
    <Tabs defaultValue="mine">
      <TabsList>
        <TabsTrigger value="mine">My Work</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}

export { Badge };
