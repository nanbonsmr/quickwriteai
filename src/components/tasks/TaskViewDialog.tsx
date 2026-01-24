import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Pencil, Tag, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { TaskLabelsDisplay } from "./TaskLabelManager";
import { TaskTimeDisplay } from "./TaskTimeTracker";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  template_type: string | null;
  created_at: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
}

interface TaskViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onEdit: () => void;
}

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To-Do',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
};

export function TaskViewDialog({ open, onOpenChange, task, onEdit }: TaskViewDialogProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && task) {
      fetchSubtasks();
    }
  }, [open, task?.id]);

  const fetchSubtasks = async () => {
    if (!task) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', task.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    // Optimistic update
    setSubtasks(prev =>
      prev.map(s => (s.id === subtaskId ? { ...s, completed } : s))
    );

    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', subtaskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling subtask:', error);
      // Revert on error
      setSubtasks(prev =>
        prev.map(s => (s.id === subtaskId ? { ...s, completed: !completed } : s))
      );
    }
  };

  const handleEditClick = () => {
    onOpenChange(false);
    onEdit();
  };

  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-lg font-semibold leading-tight pr-8">
              {task.title}
            </DialogTitle>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
              {task.priority}
            </Badge>
            <Badge variant="outline">
              {STATUS_LABELS[task.status] || task.status}
            </Badge>
            {task.template_type && (
              <Badge variant="secondary">
                {task.template_type}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-5 pb-4">
            {/* Description */}
            {task.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Due Date */}
            {task.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                  {format(new Date(task.due_date), 'MMMM d, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
            )}

            {/* Labels */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Labels</span>
              </div>
              <TaskLabelsDisplay taskId={task.id} />
            </div>

            {/* Time Tracking */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Time Tracked</span>
              </div>
              <TaskTimeDisplay taskId={task.id} />
            </div>

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Subtasks {totalCount > 0 && `(${completedCount}/${totalCount})`}
                  </span>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading subtasks...</p>
              ) : subtasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No subtasks</p>
              ) : (
                <div className="space-y-2">
                  {subtasks.map(subtask => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={(checked) =>
                          handleToggleSubtask(subtask.id, checked as boolean)
                        }
                      />
                      <span
                        className={`text-sm flex-1 ${
                          subtask.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Created date */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Created {format(new Date(task.created_at), 'MMMM d, yyyy')}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleEditClick} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
