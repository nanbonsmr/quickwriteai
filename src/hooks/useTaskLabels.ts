import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface TaskLabelAssignment {
  id: string;
  task_id: string;
  label_id: string;
  created_at: string;
}

export function useTaskLabels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabels = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("task_labels")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setLabels((data as TaskLabel[]) || []);
    } catch (error: any) {
      console.error("Error fetching labels:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const createLabel = async (name: string, color: string): Promise<TaskLabel | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("task_labels")
        .insert([{ name, color, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const newLabel = data as TaskLabel;
      setLabels((prev) => [...prev, newLabel].sort((a, b) => a.name.localeCompare(b.name)));

      toast({
        title: "Label created",
        description: `Label "${name}" has been created`,
      });

      return newLabel;
    } catch (error: any) {
      toast({
        title: "Error creating label",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLabel = async (id: string, name: string, color: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("task_labels")
        .update({ name, color })
        .eq("id", id);

      if (error) throw error;

      setLabels((prev) =>
        prev.map((label) => (label.id === id ? { ...label, name, color } : label))
      );

      toast({
        title: "Label updated",
        description: `Label "${name}" has been updated`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating label",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteLabel = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("task_labels").delete().eq("id", id);

      if (error) throw error;

      setLabels((prev) => prev.filter((label) => label.id !== id));

      toast({
        title: "Label deleted",
        description: "Label has been removed",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting label",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    labels,
    loading,
    createLabel,
    updateLabel,
    deleteLabel,
    refetch: fetchLabels,
  };
}

export function useTaskLabelAssignments(taskId: string | null) {
  const [assignedLabelIds, setAssignedLabelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!taskId) {
      setAssignedLabelIds([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_label_assignments")
        .select("label_id")
        .eq("task_id", taskId);

      if (error) throw error;
      setAssignedLabelIds((data as { label_id: string }[])?.map((d) => d.label_id) || []);
    } catch (error) {
      console.error("Error fetching label assignments:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const assignLabel = async (labelId: string): Promise<boolean> => {
    if (!taskId) return false;

    try {
      const { error } = await supabase
        .from("task_label_assignments")
        .insert([{ task_id: taskId, label_id: labelId }]);

      if (error) throw error;
      setAssignedLabelIds((prev) => [...prev, labelId]);
      return true;
    } catch (error) {
      console.error("Error assigning label:", error);
      return false;
    }
  };

  const unassignLabel = async (labelId: string): Promise<boolean> => {
    if (!taskId) return false;

    try {
      const { error } = await supabase
        .from("task_label_assignments")
        .delete()
        .eq("task_id", taskId)
        .eq("label_id", labelId);

      if (error) throw error;
      setAssignedLabelIds((prev) => prev.filter((id) => id !== labelId));
      return true;
    } catch (error) {
      console.error("Error unassigning label:", error);
      return false;
    }
  };

  const toggleLabel = async (labelId: string): Promise<boolean> => {
    if (assignedLabelIds.includes(labelId)) {
      return unassignLabel(labelId);
    } else {
      return assignLabel(labelId);
    }
  };

  return {
    assignedLabelIds,
    loading,
    assignLabel,
    unassignLabel,
    toggleLabel,
    refetch: fetchAssignments,
    setAssignedLabelIds,
  };
}
