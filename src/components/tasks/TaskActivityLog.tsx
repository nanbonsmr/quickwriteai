import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Loader2 } from "lucide-react";
import { useTaskActivityLog, getActivityDescription } from "@/hooks/useTaskActivityLog";
import { formatDistanceToNow } from "date-fns";

interface TaskActivityLogProps {
  taskId: string | null;
}

export function TaskActivityLog({ taskId }: TaskActivityLogProps) {
  const { activities, loading } = useTaskActivityLog(taskId);

  if (!taskId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Save the task first to see activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h4 className="font-medium text-sm">Activity Log</h4>
      </div>

      <ScrollArea className="max-h-64">
        <div className="space-y-3 pr-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No activity recorded yet
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 pb-3 border-b border-border/50 last:border-0"
              >
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{getActivityDescription(activity)}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
