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
import { WorkSchedule } from "./work-schedule";
import { SuppliesRequests } from "./supplies-requests";
import { StaffPerformance } from "./staff-performance";



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
    return <SuppliesRequests />;
  }

  return <StaffPerformance />;
}
