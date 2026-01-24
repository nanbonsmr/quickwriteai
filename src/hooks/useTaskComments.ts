import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useTaskComments(taskId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!taskId) {
      setComments([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments((data as TaskComment[]) || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string): Promise<TaskComment | null> => {
    if (!user || !taskId) return null;

    try {
      const { data, error } = await supabase
        .from("task_comments")
        .insert([{ task_id: taskId, user_id: user.id, content }])
        .select()
        .single();

      if (error) throw error;

      const newComment = data as TaskComment;
      setComments((prev) => [...prev, newComment]);

      return newComment;
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateComment = async (commentId: string, content: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("task_comments")
        .update({ content })
        .eq("id", commentId);

      if (error) throw error;

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, content, updated_at: new Date().toISOString() } : comment
        )
      );

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating comment",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("task_comments").delete().eq("id", commentId);

      if (error) throw error;

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
}
