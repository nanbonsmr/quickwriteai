import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Flag, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface SharedTaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
}

interface SharedTaskPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareToken: string | null;
}

export function SharedTaskPreviewModal({
  open,
  onOpenChange,
  shareToken,
}: SharedTaskPreviewModalProps) {
  const [task, setTask] = useState<SharedTaskData | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !shareToken) {
      setTask(null);
      setSubtasks([]);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Find the share record
        const { data: shareData, error: shareError } = await supabase
          .from("task_shares")
          .select("task_id, expires_at")
          .eq("share_token", shareToken)
          .single();

        if (shareError || !shareData) {
          setError("Invalid share link");
          setLoading(false);
          return;
        }

        // Check expiration
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          setError("This share link has expired");
          setLoading(false);
          return;
        }

        // Fetch task
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("id, title, description, status, priority, due_date, created_at")
          .eq("id", shareData.task_id)
          .single();

        if (taskError || !taskData) {
          setError("Task not found");
          setLoading(false);
          return;
        }

        setTask(taskData);

        // Fetch subtasks
        const { data: subtaskData } = await supabase
          .from("subtasks")
          .select("*")
          .eq("task_id", taskData.id)
          .order("position", { ascending: true });

        setSubtasks(subtaskData || []);
      } catch {
        setError("Failed to load task preview");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, shareToken]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in-progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Shared Task Preview</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && task && (
          <div className="space-y-5">
            {/* Header with title and badges */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status === "done" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {task.status.replace("-", " ")}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-foreground whitespace-pre-wrap text-sm">
                  {task.description}
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-4 text-sm">
              {task.due_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {format(new Date(task.due_date), "PPP")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created: {format(new Date(task.created_at), "PPP")}</span>
              </div>
            </div>

            {/* Subtasks */}
            {totalCount > 0 && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ListTodo className="h-4 w-4 text-primary" />
                    <span>Subtasks</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{totalCount} completed
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Subtask list */}
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-md"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        disabled
                        className="shrink-0"
                      />
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                This is how the shared task will appear to viewers
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
