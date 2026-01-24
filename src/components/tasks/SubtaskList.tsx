import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ListTodo, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
}

interface SubtaskListProps {
  taskId: string;
  onSubtaskChange?: () => void;
}

export function SubtaskList({ taskId, onSubtaskChange }: SubtaskListProps) {
  const { toast } = useToast();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_id", taskId)
        .order("position", { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error: any) {
      console.error("Error fetching subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    setAdding(true);
    try {
      const newPosition = subtasks.length;
      const { data, error } = await supabase
        .from("subtasks")
        .insert({
          task_id: taskId,
          title: newSubtaskTitle.trim(),
          position: newPosition,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      setSubtasks((prev) => [...prev, data]);
      setNewSubtaskTitle("");
      onSubtaskChange?.();

      toast({
        title: "Subtask added",
        description: "New subtask has been created",
      });
    } catch (error: any) {
      toast({
        title: "Error adding subtask",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    const newCompleted = !subtask.completed;

    // Optimistic update
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtask.id ? { ...s, completed: newCompleted } : s
      )
    );

    try {
      const { error } = await supabase
        .from("subtasks")
        .update({ completed: newCompleted })
        .eq("id", subtask.id);

      if (error) throw error;
      onSubtaskChange?.();
    } catch (error: any) {
      // Revert on error
      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtask.id ? { ...s, completed: !newCompleted } : s
        )
      );
      toast({
        title: "Error updating subtask",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    // Optimistic update
    const previousSubtasks = [...subtasks];
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));

    try {
      const { error } = await supabase
        .from("subtasks")
        .delete()
        .eq("id", subtaskId);

      if (error) throw error;
      onSubtaskChange?.();

      toast({
        title: "Subtask deleted",
      });
    } catch (error: any) {
      // Revert on error
      setSubtasks(previousSubtasks);
      toast({
        title: "Error deleting subtask",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ListTodo className="h-4 w-4 text-primary" />
          <span>Subtasks</span>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} completed
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 group py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => handleToggleSubtask(subtask)}
              className="shrink-0"
            />
            <span
              className={cn(
                "flex-1 text-sm transition-all",
                subtask.completed && "line-through text-muted-foreground"
              )}
            >
              {subtask.title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteSubtask(subtask.id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add subtask input */}
      <div className="flex items-center gap-2">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a subtask..."
          className="h-8 text-sm"
          disabled={adding}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-2 shrink-0"
          disabled={!newSubtaskTitle.trim() || adding}
          onClick={handleAddSubtask}
        >
          {adding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Compact version for TaskCard
export function SubtaskProgress({ taskId }: { taskId: string }) {
  const [stats, setStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from("subtasks")
          .select("completed")
          .eq("task_id", taskId);

        if (error) throw error;

        const total = data?.length || 0;
        const completed = data?.filter((s) => s.completed).length || 0;
        setStats({ completed, total });
      } catch (error) {
        console.error("Error fetching subtask stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [taskId]);

  if (loading || stats.total === 0) return null;

  const progressPercent = (stats.completed / stats.total) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-secondary rounded-full h-1">
        <div
          className="bg-primary h-1 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">
        {stats.completed}/{stats.total}
      </span>
    </div>
  );
}
