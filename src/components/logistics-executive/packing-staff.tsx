import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHead, StatCard } from "./ui";
import { PACKING_STAFF, type PackingStaff } from "./data";
import { toast } from "sonner";

export function LePackingStaff() {
  const [staff, setStaff] = useState(PACKING_STAFF);
  const [newTask, setNewTask] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("normal");

  const totalCompleted = staff.reduce((sum, s) => sum + s.completedToday, 0);
  const totalDefects = staff.reduce((sum, s) => sum + s.defectsToday, 0);
  const accuracy = totalCompleted ? Math.round(((totalCompleted - totalDefects) / totalCompleted) * 100) : 100;

  function assign() {
    const member = staff.find((s) => s.name === assignee);
    if (!newTask || !member) {
      toast.error("Enter task and select staff");
      return;
    }
    setStaff((prev) =>
      prev.map((s) => (s.name === member.name ? { ...s, activeTasks: s.activeTasks + 1, status: "busy" as PackingStaff["status"] } : s)),
    );
    toast.success(`Task assigned to ${member.name} ${priority === "high" ? "(high priority)" : ""}`);
    setNewTask("");
    setAssignee("");
    setPriority("normal");
  }

  return (
    <div className="space-y-4">
      <SectionHead title="Packing Staff Oversight" sub="Assign tasks, monitor workload and track packing quality." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="On Duty" value={String(staff.length)} />
        <StatCard label="Busy" value={String(staff.filter((s) => s.status === "busy").length)} />
        <StatCard label="Completed Today" value={String(totalCompleted)} tone="good" />
        <StatCard label="Packing Accuracy" value={`${accuracy}%`} tone={accuracy >= 95 ? "good" : "warn"} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Assign packing task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Task description" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={assign}>
            Assign Task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Packing team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.shift} · {s.completedToday} done · {s.defectsToday} defects
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.status === "busy" ? "secondary" : "default"}>{s.status}</Badge>
                <span className="text-xs text-muted-foreground">{s.activeTasks} active</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
