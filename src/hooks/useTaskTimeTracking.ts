import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  description: string | null;
  created_at: string;
}

export function useTaskTimeTracking(taskId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!taskId) {
      setEntries([]);
      setActiveEntry(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_time_entries")
        .select("*")
        .eq("task_id", taskId)
        .order("started_at", { ascending: false });

      if (error) throw error;

      const typedData = (data as TimeEntry[]) || [];
      setEntries(typedData);

      // Check for active (running) entry
      const running = typedData.find((entry) => !entry.ended_at);
      if (running) {
        setActiveEntry(running);
        const startedAt = new Date(running.started_at).getTime();
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        setElapsedSeconds(elapsed);
      } else {
        setActiveEntry(null);
        setElapsedSeconds(0);
      }
    } catch (error: any) {
      console.error("Error fetching time entries:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Timer effect
  useEffect(() => {
    if (activeEntry) {
      timerRef.current = setInterval(() => {
        const startedAt = new Date(activeEntry.started_at).getTime();
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeEntry]);

  const startTimer = async (): Promise<boolean> => {
    if (!user || !taskId || activeEntry) return false;

    try {
      const { data, error } = await supabase
        .from("task_time_entries")
        .insert([{ task_id: taskId, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const newEntry = data as TimeEntry;
      setActiveEntry(newEntry);
      setEntries((prev) => [newEntry, ...prev]);

      toast({
        title: "Timer started",
        description: "Time tracking has begun",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error starting timer",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const stopTimer = async (description?: string): Promise<boolean> => {
    if (!activeEntry) return false;

    const endedAt = new Date().toISOString();
    const startedAt = new Date(activeEntry.started_at).getTime();
    const durationSeconds = Math.floor((Date.now() - startedAt) / 1000);

    try {
      const { error } = await supabase
        .from("task_time_entries")
        .update({
          ended_at: endedAt,
          duration_seconds: durationSeconds,
          description: description || null,
        })
        .eq("id", activeEntry.id);

      if (error) throw error;

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === activeEntry.id
            ? { ...entry, ended_at: endedAt, duration_seconds: durationSeconds, description: description || null }
            : entry
        )
      );
      setActiveEntry(null);
      setElapsedSeconds(0);

      toast({
        title: "Timer stopped",
        description: `Logged ${formatDuration(durationSeconds)}`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error stopping timer",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEntry = async (entryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("task_time_entries").delete().eq("id", entryId);

      if (error) throw error;

      if (activeEntry?.id === entryId) {
        setActiveEntry(null);
        setElapsedSeconds(0);
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));

      toast({
        title: "Time entry deleted",
        description: "Entry has been removed",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const totalTimeSeconds = entries.reduce((acc, entry) => acc + (entry.duration_seconds || 0), 0);

  return {
    entries,
    activeEntry,
    elapsedSeconds,
    totalTimeSeconds,
    loading,
    isRunning: !!activeEntry,
    startTimer,
    stopTimer,
    deleteEntry,
    refetch: fetchEntries,
  };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
