import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TaskTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  title_template: string;
  description_template: string | null;
  priority: string;
  label_ids: string[];
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export function useTaskTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("task_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      setTemplates((data as TaskTemplate[]) || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (template: Omit<TaskTemplate, "id" | "user_id" | "created_at" | "updated_at">): Promise<TaskTemplate | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("task_templates")
        .insert([{ ...template, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const newTemplate = data as TaskTemplate;
      setTemplates((prev) => [...prev, newTemplate].sort((a, b) => a.name.localeCompare(b.name)));

      toast({
        title: "Template created",
        description: `Template "${template.name}" has been created`,
      });

      return newTemplate;
    } catch (error: any) {
      toast({
        title: "Error creating template",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTemplate = async (id: string, template: Partial<TaskTemplate>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("task_templates")
        .update(template)
        .eq("id", id);

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...template } : t))
      );

      toast({
        title: "Template updated",
        description: "Template has been updated",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("task_templates").delete().eq("id", id);

      if (error) throw error;

      setTemplates((prev) => prev.filter((t) => t.id !== id));

      toast({
        title: "Template deleted",
        description: "Template has been removed",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
