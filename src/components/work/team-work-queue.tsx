import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { History, Plus, UserPlus } from "lucide-react";
import {
  assignWorkItem,
  createWorkItem,
  getWorkContext,
  listAssignableUsers,
  listTeamWork,
  reviewWork,
} from "@/lib/work.functions";
import { ROLES } from "@/lib/roles";
import {
  MANAGER_QUEUES,
  PRIORITIES,
  RECORD_TYPES,
  TONE_TEXT,
  bucketManager,
  type WorkItem,
} from "@/lib/work-types";
import { WorkHistoryDialog, WorkItemCard } from "./my-work-queue";
import { safeQuery } from "@/lib/work-safe";

/** The eight-tile manager queue with assignment, review and handover oversight. */
export function TeamWorkQueue({
  department,
  title = "Team Work",
}: {
  department: string;
  title?: string;
}) {
  const qc = useQueryClient();
  const fetchCtx = useServerFn(getWorkContext);
  const fetchTeam = useServerFn(listTeamWork);
  const fetchUsers = useServerFn(listAssignableUsers);
  const doAssign = useServerFn(assignWorkItem);
  const doCreate = useServerFn(createWorkItem);
  const doReview = useServerFn(reviewWork);

  const { data: ctx } = useQuery({ queryKey: ["work-context"], queryFn: () => safeQuery<any>(() => fetchCtx(), null), retry: false });
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["team-work", department],
    queryFn: () => safeQuery(() => fetchTeam({ data: { department } }), [] as any[]),
    retry: false,
  });

  const [queue, setQueue] = useState<string>("workload");
  const [assignFor, setAssignFor] = useState<WorkItem | null>(null);
  const [reviewFor, setReviewFor] = useState<WorkItem | null>(null);
  const [historyFor, setHistoryFor] = useState<WorkItem | null>(null);
  const [creating, setCreating] = useState(false);

  const [role, setRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [due, setDue] = useState<string>("");
  const [assignReason, setAssignReason] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    recordType: "task",
    priority: "medium",
    requiredAction: "",
    toDepartment: department,
    approvalRequired: true,
    isHandover: false,
    masterCode: "",
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ["assignable", role],
    queryFn: () => safeQuery(() => fetchUsers({ data: role ? { role } : {} }), [] as any[]),
    retry: false,
    enabled: !!assignFor || creating,
  });

  const rows = useMemo(() => bucketManager(items as WorkItem[], queue), [items, queue]);
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["team-work"] });
    qc.invalidateQueries({ queryKey: ["my-work"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const assign = useMutation({
    mutationFn: () =>
      doAssign({
        data: {
          workItemId: assignFor!.id,
          assignedUser: userId,
          assignedRole: role || undefined,
          dueAt: due ? new Date(due).toISOString() : undefined,
          reason: assignReason || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Assigned. The user must now accept or return the work.");
      setAssignFor(null);
      setUserId("");
      setAssignReason("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: () =>
      doCreate({
        data: {
          title: form.title,
          description: form.description || undefined,
          recordType: form.recordType,
          masterType: form.masterCode ? "project" : "none",
          masterCode: form.masterCode || undefined,
          fromDepartment: department,
          toDepartment: form.toDepartment,
          assignedRole: role || undefined,
          assignedUser: userId || undefined,
          priority: form.priority,
          requiredAction: form.requiredAction || undefined,
          dueAt: due ? new Date(due).toISOString() : undefined,
          approvalRequired: form.approvalRequired,
          isHandover: form.isHandover,
        },
      }),
    onSuccess: () => {
      toast.success("Work item created with a permanent record ID.");
      setCreating(false);
      setForm({ ...form, title: "", description: "", requiredAction: "", masterCode: "" });
      setUserId("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const review = useMutation({
    mutationFn: (decision: "approve" | "correction") =>
      doReview({ data: { workItemId: reviewFor!.id, decision, note: reviewNote || undefined } }),
    onSuccess: () => {
      toast.success("Review decision recorded.");
      setReviewFor(null);
      setReviewNote("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (ctx && !ctx.canSeeTeam) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Team visibility is limited to managers of this department. You can see your own work above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Everything sent to or from this department, live from the shared work record.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New work
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MANAGER_QUEUES.map((q) => {
            const count = bucketManager(items as WorkItem[], q.key).length;
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
          {isLoading && <p className="text-sm text-muted-foreground">Loading team work…</p>}
          {!isLoading && rows.length === 0 && (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Nothing in this queue.
            </p>
          )}
          {rows.map((item) => (
            <WorkItemCard key={item.id} item={item}>
              <Button size="sm" variant="outline" onClick={() => setAssignFor(item)}>
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                {item.assigned_user ? "Reassign" : "Assign"}
              </Button>
              {item.status === "submitted_for_review" && (
                <Button size="sm" onClick={() => setReviewFor(item)}>
                  Review
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setHistoryFor(item)}>
                <History className="mr-1.5 h-3.5 w-3.5" />
                History
              </Button>
            </WorkItemCard>
          ))}
        </div>
      </CardContent>

      {/* assign / reassign */}
      <Dialog open={!!assignFor} onOpenChange={(o) => !o && setAssignFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {assignFor?.assigned_user ? "Reassign" : "Assign"} — {assignFor?.record_code}
            </DialogTitle>
            <DialogDescription>
              Pick the required role, then a user holding that role. The previous owner and reason are preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Required role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Assigned user</label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {candidates.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No user currently holds this role.</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Due date and time</label>
              <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1" />
            </div>
            {assignFor?.assigned_user && (
              <div>
                <label className="text-xs text-muted-foreground">Reassignment reason</label>
                <Textarea
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFor(null)}>
              Cancel
            </Button>
            <Button disabled={!userId || assign.isPending} onClick={() => assign.mutate()}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* review */}
      <Dialog open={!!reviewFor} onOpenChange={(o) => !o && setReviewFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review — {reviewFor?.record_code}</DialogTitle>
            <DialogDescription>Approve the completion report or send it back for correction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/40 p-2 text-xs">
              <div className="font-medium">Completion summary</div>
              <p className="mt-1">{reviewFor?.completion_summary || "No summary recorded."}</p>
              {reviewFor?.issues_remaining && <p className="mt-1">Issues remaining: {reviewFor.issues_remaining}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reviewer note (required for correction)</label>
              <Textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => review.mutate("correction")}>
              Request correction
            </Button>
            <Button onClick={() => review.mutate("approve")}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New work item</DialogTitle>
            <DialogDescription>
              A permanent record ID is generated automatically. Handovers reuse the master record — no duplicate is
              created.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Record type</label>
                <Select value={form.recordType} onValueChange={(v) => setForm({ ...form, recordType: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORD_TYPES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Priority</label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Receiving department</label>
                <Select value={form.toDepartment} onValueChange={(v) => setForm({ ...form, toDepartment: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(ctx?.departments ?? []).map((d) => (
                      <SelectItem key={d.code} value={d.code}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Related master record</label>
                <Input
                  placeholder="PRJ-000045"
                  value={form.masterCode}
                  onChange={(e) => setForm({ ...form, masterCode: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Required action</label>
              <Input
                value={form.requiredAction}
                onChange={(e) => setForm({ ...form, requiredAction: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Assign to role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Assign to user</label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Due date and time</label>
              <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description / notes</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.approvalRequired}
                onCheckedChange={(v) => setForm({ ...form, approvalRequired: !!v })}
              />
              Reviewer confirmation required before completion
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isHandover} onCheckedChange={(v) => setForm({ ...form, isHandover: !!v })} />
              This is a department handover (receiving side must accept or return)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button disabled={form.title.trim().length < 3 || create.isPending} onClick={() => create.mutate()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {historyFor && <WorkHistoryDialog item={historyFor} onClose={() => setHistoryFor(null)} />}
    </Card>
  );
}
