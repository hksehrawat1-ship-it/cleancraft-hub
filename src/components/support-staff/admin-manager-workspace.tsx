import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import {
  ROLE_META,
  STAFF,
  SUPPLIES,
  TASKS,
  type StaffRole,
  type StaffTask,
  type TaskStatus,
} from "./data";

export type AdminSection =
  | "dashboard"
  | "assign"
  | "staff-tasks"
  | "review"
  | "schedule"
  | "supplies"
  | "performance";

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Not started",
  "in-progress": "Working",
  done: "Done",
  issue: "Problem",
};

function statusVariant(s: TaskStatus): "default" | "secondary" | "destructive" | "outline" {
  if (s === "done") return "default";
  if (s === "in-progress") return "secondary";
  if (s === "issue") return "destructive";
  return "outline";
}

export function AdminManagerWorkspace({
  section,
  onGo,
}: {
  section: AdminSection;
  onGo?: (s: AdminSection) => void;
}) {
  const [tasks, setTasks] = useState<StaffTask[]>(TASKS);
  const [reviewed, setReviewed] = useState<Record<string, "approved" | "redo">>({});
  const [remark, setRemark] = useState<Record<string, string>>({});
  const [filterRole, setFilterRole] = useState<string>("all");

  // Assign form
  const [aTitle, setATitle] = useState("");
  const [aStaff, setAStaff] = useState("");
  const [aArea, setAArea] = useState("");
  const [aSlot, setASlot] = useState("");
  const [aPriority, setAPriority] = useState("normal");

  const done = tasks.filter((t) => t.status === "done").length;
  const issues = tasks.filter((t) => t.status === "issue");
  const lowStock = SUPPLIES.filter((s) => s.inStock <= s.minLevel);
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const filtered = useMemo(
    () => (filterRole === "all" ? tasks : tasks.filter((t) => t.role === filterRole)),
    [tasks, filterRole],
  );

  const assign = () => {
    const member = STAFF.find((s) => s.name === aStaff);
    if (!aTitle || !member || !aArea || !aSlot) {
      toast.error("Fill task, staff, area and time");
      return;
    }
    setTasks((prev) => [
      {
        id: `T-${900 + prev.length}`,
        title: aTitle,
        area: aArea,
        slot: aSlot,
        role: member.role,
        assignee: member.name,
        status: "pending",
        priority: aPriority === "high" ? "high" : "normal",
      },
      ...prev,
    ]);
    setATitle("");
    setAStaff("");
    setAArea("");
    setASlot("");
    setAPriority("normal");
    toast.success(`Task assigned to ${member.name}`);
  };

  if (section === "dashboard") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Administration Manager Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Support staff work, blockers and supply status in one view.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { l: "Staff on Duty", v: STAFF.length, i: Users },
            { l: "Tasks Today", v: tasks.length, i: Clock },
            { l: "Completed", v: done, i: CheckCircle2 },
            { l: "Problems Raised", v: issues.length, i: AlertTriangle },
          ].map((k) => (
            <Card key={k.l}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <k.i className="h-4 w-4 text-primary" />
                  {k.l}
                </div>
                <div className="mt-1 text-3xl font-semibold tabular-nums">{k.v}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">
              {done} of {tasks.length} tasks completed ({pct}%)
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-3 lg:grid-cols-3">
          {(Object.keys(ROLE_META) as StaffRole[]).map((role) => {
            const list = tasks.filter((t) => t.role === role);
            const d = list.filter((t) => t.status === "done").length;
            const Icon = ROLE_META[role].icon;
            return (
              <Card key={role}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {ROLE_META[role].label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={list.length ? (d / list.length) * 100 : 0} />
                  <p className="text-xs text-muted-foreground">
                    {d}/{list.length} done ·{" "}
                    {list.filter((t) => t.status === "issue").length} problem(s)
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.map((t) => (
              <div key={t.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{t.title}</div>
                <p className="text-xs text-muted-foreground">
                  {t.assignee} · {t.area} · {t.note ?? "Problem reported"}
                </p>
              </div>
            ))}
            {lowStock.map((s) => (
              <div key={s.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{s.name} running low</div>
                <p className="text-xs text-muted-foreground">
                  {s.inStock} {s.unit} left · minimum {s.minLevel} {s.unit}
                </p>
              </div>
            ))}
            {issues.length === 0 && lowStock.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing pending. All clear.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "assign") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Assign Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Give a clear task with area, time and priority.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-3 p-4">
            <Input
              placeholder="Task (e.g. Deep clean Floor 2 washroom)"
              value={aTitle}
              onChange={(e) => setATitle(e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={aStaff} onValueChange={setAStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to staff" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name} — {ROLE_META[s.role].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={aArea} onValueChange={setAArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Ground floor",
                    "Floor 1",
                    "Floor 2",
                    "Pantry",
                    "Washroom",
                    "Store room",
                    "Dispatch bay",
                    "All floors",
                  ].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Time slot (e.g. 11:00 AM)"
                value={aSlot}
                onChange={(e) => setASlot(e.target.value)}
              />
              <Select value={aPriority} onValueChange={setAPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={assign}>Assign Task</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recently assigned</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span>
                  {t.title}
                  <span className="block text-xs text-muted-foreground">
                    {t.assignee} · {t.area} · {t.slot}
                  </span>
                </span>
                <Badge variant={statusVariant(t.status)}>{STATUS_LABEL[t.status]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "staff-tasks") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">Staff Tasks</h1>
            <p className="text-sm text-muted-foreground">Live status of every assigned task.</p>
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All support staff</SelectItem>
              {(Object.keys(ROLE_META) as StaffRole[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_META[r].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {filtered.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.id} · {t.assignee} · {t.area} · {t.slot}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {t.priority === "high" && <Badge variant="outline">Urgent</Badge>}
                  <Badge variant={statusVariant(t.status)}>{STATUS_LABEL[t.status]}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTasks((p) =>
                        p.map((x) => (x.id === t.id ? { ...x, priority: "high" } : x)),
                      );
                      toast.success("Marked urgent");
                    }}
                  >
                    Mark Urgent
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (section === "review") {
    const submitted = tasks.filter((t) => t.status === "done" || t.status === "issue");
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Review Work</h1>
          <p className="text-sm text-muted-foreground">
            Approve finished work or send it back for redo with a remark.
          </p>
        </div>
        {submitted.map((t) => {
          const state = reviewed[t.id];
          return (
            <Card key={t.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <p className="text-xs text-muted-foreground">
                      {t.assignee} · {t.area} · {t.slot}
                    </p>
                  </div>
                  <Badge
                    variant={
                      state === "approved"
                        ? "default"
                        : state === "redo"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {state === "approved" ? "Approved" : state === "redo" ? "Redo sent" : "Awaiting review"}
                  </Badge>
                </div>
                <Textarea
                  placeholder="Remark for the staff (required for redo)"
                  value={remark[t.id] ?? ""}
                  onChange={(e) => setRemark((p) => ({ ...p, [t.id]: e.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setReviewed((p) => ({ ...p, [t.id]: "approved" }));
                      toast.success("Work approved");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (!remark[t.id]) {
                        toast.error("Add a remark before sending redo");
                        return;
                      }
                      setReviewed((p) => ({ ...p, [t.id]: "redo" }));
                      setTasks((p) =>
                        p.map((x) =>
                          x.id === t.id ? { ...x, status: "pending", note: remark[t.id] } : x,
                        ),
                      );
                      toast.success("Sent back for redo");
                    }}
                  >
                    Send for Redo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {submitted.length === 0 && (
          <p className="text-sm text-muted-foreground">No completed work waiting for review.</p>
        )}
      </div>
    );
  }

  if (section === "schedule") {
    const slots = ["Morning (8–11 AM)", "Midday (11 AM–2 PM)", "Afternoon (2–5 PM)", "Evening (5–8 PM)"];
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Work Schedule</h1>
          <p className="text-sm text-muted-foreground">Shift timings and slot-wise workload.</p>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shifts today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STAFF.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span>
                  {s.name}
                  <span className="block text-xs text-muted-foreground">
                    {ROLE_META[s.role].label}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{s.shift}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {slots.map((slot, i) => {
            const list = tasks.filter((_, idx) => idx % slots.length === i);
            return (
              <Card key={slot}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{slot}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {list.map((t) => (
                    <div key={t.id} className="text-xs text-muted-foreground">
                      {t.slot} · {t.title} — {t.assignee}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (section === "supplies") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Supplies &amp; Requests</h1>
          <p className="text-sm text-muted-foreground">
            Stock levels across pantry, cleaning and packing, plus staff requests.
          </p>
        </div>
        {(Object.keys(ROLE_META) as StaffRole[]).map((role) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{ROLE_META[role].suppliesLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SUPPLIES.filter((s) => s.role === role).map((s) => {
                const low = s.inStock <= s.minLevel;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <span>
                      {s.name}
                      <span className="block text-xs text-muted-foreground">
                        {s.inStock} {s.unit} in stock · min {s.minLevel}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={low ? "destructive" : "secondary"}>
                        {low ? "Reorder" : "OK"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Purchase order raised for ${s.name}`)}
                      >
                        Raise PO
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Staff Performance</h1>
        <p className="text-sm text-muted-foreground">
          Completion rate, problems raised and review outcomes per person.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {STAFF.map((s) => {
          const list = tasks.filter((t) => t.assignee === s.name);
          const d = list.filter((t) => t.status === "done").length;
          const rate = list.length ? Math.round((d / list.length) * 100) : 0;
          return (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{s.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {ROLE_META[s.role].label} · {s.shift}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={rate} />
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md border p-2">
                    <div className="text-lg font-semibold tabular-nums">{list.length}</div>
                    Tasks
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-lg font-semibold tabular-nums">{d}</div>
                    Done
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-lg font-semibold tabular-nums">{rate}%</div>
                    Rate
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
