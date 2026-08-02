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
import { ManagerDashboard } from "./manager-dashboard";
import { AssignTasks } from "./assign-tasks";
import { StaffTasks } from "./staff-tasks";
import { ReviewWork } from "./review-work";


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
    return <ManagerDashboard onGo={onGo} />;
  }


  if (section === "assign") {
    return <AssignTasks onGo={(s) => onGo?.(s as AdminSection)} />;
  }

  if (section === "staff-tasks") {
    return <StaffTasks onGo={(s) => onGo?.(s as AdminSection)} />;
  }

  if (section === "review") {
    return <ReviewWork onGo={(s) => onGo?.(s as AdminSection)} />;
  }


  if (section === "schedule") {
    return <WorkSchedule onGo={(s) => onGo?.(s as AdminSection)} />;
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
