import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  created_at: string;
}

export function useTaskActivityLog(taskId: string | null) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!taskId) {
      setActivities([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_activity_log")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data as TaskActivity[]) || []);
    } catch (error: any) {
      console.error("Error fetching activity log:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const logActivity = async (
    action: string,
    oldValue?: Record<string, any>,
    newValue?: Record<string, any>
  ): Promise<boolean> => {
    if (!user || !taskId) return false;

    try {
      const { error } = await supabase.from("task_activity_log").insert([
        {
          task_id: taskId,
          user_id: user.id,
          action,
          old_value: oldValue || null,
          new_value: newValue || null,
        },
      ]);

      if (error) throw error;

      // Refetch to show new activity
      fetchActivities();

      return true;
    } catch (error) {
      console.error("Error logging activity:", error);
      return false;
    }
  };

  return {
    activities,
    loading,
    logActivity,
    refetch: fetchActivities,
  };
}

export function getActivityDescription(activity: TaskActivity): string {
  switch (activity.action) {
    case "created":
      return "Created this task";
    case "status_changed":
      return `Changed status from "${activity.old_value?.status || "unknown"}" to "${activity.new_value?.status || "unknown"}"`;
    case "priority_changed":
      return `Changed priority from "${activity.old_value?.priority || "unknown"}" to "${activity.new_value?.priority || "unknown"}"`;
    case "title_changed":
      return `Changed title from "${activity.old_value?.title || "unknown"}" to "${activity.new_value?.title || "unknown"}"`;
    case "description_changed":
      return "Updated description";
    case "due_date_changed":
      return activity.new_value?.due_date
        ? `Set due date to ${new Date(activity.new_value.due_date).toLocaleDateString()}`
        : "Removed due date";
    case "label_added":
      return `Added label "${activity.new_value?.label_name || "unknown"}"`;
    case "label_removed":
      return `Removed label "${activity.old_value?.label_name || "unknown"}"`;
    case "comment_added":
      return "Added a comment";
    case "time_started":
      return "Started time tracking";
    case "time_stopped":
      return `Stopped time tracking (${activity.new_value?.duration || "unknown"})`;
    case "completed":
      return "Marked as completed";
    default:
      return activity.action;
  }
}
