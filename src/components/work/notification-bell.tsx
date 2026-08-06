import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { listNotifications, markNotificationRead } from "@/lib/work.functions";

const TONE: Record<string, string> = {
  new_assignment: "text-primary",
  assignment_returned: "text-amber-600",
  deadline_approaching: "text-amber-600",
  work_overdue: "text-destructive",
  information_requested: "text-amber-600",
  submitted_for_review: "text-amber-600",
  work_approved: "text-emerald-600",
  correction_requested: "text-amber-600",
  handover_sent: "text-primary",
  handover_accepted: "text-emerald-600",
  handover_returned: "text-destructive",
  work_reopened: "text-destructive",
};

export function NotificationBell() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listNotifications);
  const markRead = useServerFn(markNotificationRead);

  const { data: items = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchAll(),
    refetchInterval: 60_000,
  });

  const read = useMutation({
    mutationFn: (id: string) => markRead({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = items.filter((n) => !n.read_at);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-96 w-80 overflow-auto p-2">
        <div className="px-1 pb-2 text-xs font-medium text-muted-foreground">
          In-app notifications
        </div>
        {items.length === 0 && <p className="p-2 text-sm text-muted-foreground">Nothing yet.</p>}
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read_at && read.mutate(n.id)}
            className={`mb-1 w-full rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted ${
              n.read_at ? "opacity-60" : ""
            }`}
          >
            <div className={`font-medium ${TONE[n.type] ?? ""}`}>{n.title}</div>
            {n.body && <div className="mt-0.5 text-muted-foreground">{n.body}</div>}
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {new Date(n.created_at).toLocaleString("en-IN")}
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
