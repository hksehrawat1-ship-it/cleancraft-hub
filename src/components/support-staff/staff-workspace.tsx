import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Package,
  PlayCircle,
  Send,
} from "lucide-react";
import {
  HELP_TOPICS,
  ROLE_META,
  SUPPLIES,
  TASKS,
  type StaffRole,
  type StaffTask,
  type TaskStatus,
} from "./data";

export type StaffSection = "home" | "tasks" | "supplies" | "problem" | "help" | "performance";

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

export function StaffWorkspace({
  role,
  section,
  onGo,
}: {
  role: StaffRole;
  section: StaffSection;
  onGo: (s: StaffSection) => void;
}) {
  const meta = ROLE_META[role];
  const [tasks, setTasks] = useState<StaffTask[]>(() => TASKS.filter((t) => t.role === role));
  const [requests, setRequests] = useState<{ id: string; item: string; qty: string; at: string }[]>(
    [],
  );
  const [reqItem, setReqItem] = useState("");
  const [reqQty, setReqQty] = useState("");
  const [problemArea, setProblemArea] = useState("");
  const [problemType, setProblemType] = useState("");
  const [problemNote, setProblemNote] = useState("");
  const [problems, setProblems] = useState<
    { id: string; type: string; area: string; note: string; at: string }[]
  >([]);
  const [openHelp, setOpenHelp] = useState<number | null>(0);

  const supplies = useMemo(() => SUPPLIES.filter((s) => s.role === role), [role]);
  const done = tasks.filter((t) => t.status === "done").length;
  const working = tasks.filter((t) => t.status === "in-progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const lowStock = supplies.filter((s) => s.inStock <= s.minLevel);
  const nextTask = tasks.find((t) => t.status !== "done");
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const setStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`${id} marked ${STATUS_LABEL[status]}`);
  };

  const now = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const submitRequest = () => {
    if (!reqItem || !reqQty) {
      toast.error("Choose an item and quantity");
      return;
    }
    setRequests((p) => [{ id: `R-${p.length + 1}`, item: reqItem, qty: reqQty, at: now() }, ...p]);
    setReqItem("");
    setReqQty("");
    toast.success("Request sent to Administration Manager");
  };

  const submitProblem = () => {
    if (!problemType || !problemArea) {
      toast.error("Select problem type and area");
      return;
    }
    setProblems((p) => [
      { id: `P-${p.length + 1}`, type: problemType, area: problemArea, note: problemNote, at: now() },
      ...p,
    ]);
    setProblemType("");
    setProblemArea("");
    setProblemNote("");
    toast.success("Problem reported to Administration Manager");
  };

  if (section === "home") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Good morning</h1>
          <p className="text-sm text-muted-foreground">
            {meta.label} · today's work at a glance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { l: "Today's Tasks", v: tasks.length, i: Clock },
            { l: "Done", v: done, i: CheckCircle2 },
            { l: "Pending", v: pending + working, i: PlayCircle },
            { l: "Low Stock", v: lowStock.length, i: AlertTriangle },
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
            <CardTitle className="text-base">Today's progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">
              {done} of {tasks.length} tasks completed ({pct}%)
            </p>
          </CardContent>
        </Card>

        {nextTask && (
          <Card className="border-primary/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Next task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-lg font-semibold">{nextTask.title}</div>
                <p className="text-sm text-muted-foreground">
                  {nextTask.area} · {nextTask.slot}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="lg" onClick={() => setStatus(nextTask.id, "in-progress")}>
                  Start
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setStatus(nextTask.id, "done")}>
                  Mark Done
                </Button>
                <Button size="lg" variant="outline" onClick={() => onGo("problem")}>
                  Report a Problem
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="outline" size="lg" className="h-16" onClick={() => onGo("tasks")}>
            My Tasks
          </Button>
          <Button variant="outline" size="lg" className="h-16" onClick={() => onGo("supplies")}>
            {meta.suppliesLabel}
          </Button>
          <Button variant="outline" size="lg" className="h-16" onClick={() => onGo("help")}>
            Help
          </Button>
        </div>
      </div>
    );
  }

  if (section === "tasks") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Tasks assigned by the Administration Manager.
          </p>
        </div>
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <p className="text-xs text-muted-foreground">
                      {t.id} · {t.area} · {t.slot}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={statusVariant(t.status)}>{STATUS_LABEL[t.status]}</Badge>
                    {t.priority === "high" && <Badge variant="outline">Urgent</Badge>}
                  </div>
                </div>
                {t.note && <p className="text-xs text-destructive">Note: {t.note}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setStatus(t.id, "in-progress")}>
                    Start
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setStatus(t.id, "done")}>
                    Done
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "issue")}>
                    Cannot do
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (section === "supplies") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">{meta.suppliesLabel}</h1>
          <p className="text-sm text-muted-foreground">
            Check stock and request items before they finish.
          </p>
        </div>

        {lowStock.length > 0 && (
          <Card className="border-destructive/40">
            <CardContent className="flex items-center gap-2 p-4 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              {lowStock.length} item(s) at or below minimum level.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {supplies.map((s) => {
            const low = s.inStock <= s.minLevel;
            return (
              <Card key={s.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{s.name}</div>
                    <Badge variant={low ? "destructive" : "secondary"}>
                      {low ? "Low" : "OK"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In stock {s.inStock} {s.unit} · minimum {s.minLevel} {s.unit}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setReqItem(s.name)}>
                    Request this
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={reqItem} onValueChange={setReqItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {supplies.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Quantity (e.g. 5 packs)"
                value={reqQty}
                onChange={(e) => setReqQty(e.target.value)}
              />
            </div>
            <Button onClick={submitRequest}>
              <Send className="mr-2 h-4 w-4" />
              Send Request
            </Button>
          </CardContent>
        </Card>

        {requests.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">My requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <span>
                    {r.item} · {r.qty}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {r.at}
                    <Badge variant="outline">Waiting approval</Badge>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (section === "problem") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Report a Problem</h1>
          <p className="text-sm text-muted-foreground">
            Tell the Administration Manager what is stopping your work.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={problemType} onValueChange={setProblemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Problem type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Material finished">Material finished</SelectItem>
                  <SelectItem value="Equipment not working">Equipment not working</SelectItem>
                  <SelectItem value="Damaged item">Damaged item</SelectItem>
                  <SelectItem value="Safety issue">Safety issue</SelectItem>
                  <SelectItem value="Need help / extra person">Need help / extra person</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={problemArea} onValueChange={setProblemArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ground floor">Ground floor</SelectItem>
                  <SelectItem value="Floor 1">Floor 1</SelectItem>
                  <SelectItem value="Floor 2">Floor 2</SelectItem>
                  <SelectItem value="Pantry">Pantry</SelectItem>
                  <SelectItem value="Washroom">Washroom</SelectItem>
                  <SelectItem value="Store room">Store room</SelectItem>
                  <SelectItem value="Dispatch bay">Dispatch bay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Write in short what happened (optional)"
              value={problemNote}
              onChange={(e) => setProblemNote(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={submitProblem}>Submit Problem</Button>
              <Button variant="outline" disabled>
                Add Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {problems.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reported problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {problems.map((p) => (
                <div key={p.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.type}</span>
                    <Badge variant="secondary">Sent</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.area} · {p.at}
                    {p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Help</h1>
        <p className="text-sm text-muted-foreground">Simple instructions for your daily work.</p>
      </div>
      <div className="space-y-2">
        {HELP_TOPICS[role].map((t, idx) => (
          <Card key={t.q}>
            <button
              className="flex w-full items-center gap-2 p-4 text-left text-sm font-medium"
              onClick={() => setOpenHelp(openHelp === idx ? null : idx)}
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
              {t.q}
            </button>
            {openHelp === idx && (
              <CardContent className="pt-0 text-sm text-muted-foreground">{t.a}</CardContent>
            )}
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 text-primary" />
            Need a person to help?
          </div>
          <p className="text-xs text-muted-foreground">
            Contact the Administration Manager for staff support, materials or urgent issues.
          </p>
          <Button variant="outline" disabled>
            Call Administration Manager
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
