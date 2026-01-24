import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TaskShare {
  id: string;
  task_id: string;
  shared_by: string;
  shared_with_email: string | null;
  share_token: string | null;
  permission: string;
  is_public: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useTaskSharing(taskId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shares, setShares] = useState<TaskShare[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShares = useCallback(async () => {
    if (!taskId) {
      setShares([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_shares")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShares((data as TaskShare[]) || []);
    } catch (error: any) {
      console.error("Error fetching shares:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const generateShareToken = (): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const createPublicShare = async (): Promise<TaskShare | null> => {
    if (!user || !taskId) return null;

    const shareToken = generateShareToken();

    try {
      const { data, error } = await supabase
        .from("task_shares")
        .insert([
          {
            task_id: taskId,
            shared_by: user.id,
            share_token: shareToken,
            is_public: true,
            permission: "view",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newShare = data as TaskShare;
      setShares((prev) => [newShare, ...prev]);

      toast({
        title: "Share link created",
        description: "Anyone with the link can view this task",
      });

      return newShare;
    } catch (error: any) {
      toast({
        title: "Error creating share",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const shareWithEmail = async (email: string, permission: string = "view"): Promise<TaskShare | null> => {
    if (!user || !taskId) return null;

    try {
      const { data, error } = await supabase
        .from("task_shares")
        .insert([
          {
            task_id: taskId,
            shared_by: user.id,
            shared_with_email: email,
            permission,
            is_public: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newShare = data as TaskShare;
      setShares((prev) => [newShare, ...prev]);

      toast({
        title: "Task shared",
        description: `Task shared with ${email}`,
      });

      return newShare;
    } catch (error: any) {
      toast({
        title: "Error sharing task",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const revokeShare = async (shareId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("task_shares").delete().eq("id", shareId);

      if (error) throw error;

      setShares((prev) => prev.filter((share) => share.id !== shareId));

      toast({
        title: "Share revoked",
        description: "Access has been removed",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error revoking share",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const getShareUrl = (share: TaskShare): string => {
    if (share.share_token) {
      return `${window.location.origin}/shared/task/${share.share_token}`;
    }
    return "";
  };

  return {
    shares,
    loading,
    createPublicShare,
    shareWithEmail,
    revokeShare,
    getShareUrl,
    refetch: fetchShares,
  };
}
