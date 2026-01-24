import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Flag, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface SharedTaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

const SharedTask = () => {
  const { token } = useParams<{ token: string }>();
  const [task, setTask] = useState<SharedTaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedTask = async () => {
      if (!token) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        // First, find the share record
        const { data: shareData, error: shareError } = await supabase
          .from("task_shares")
          .select("task_id, is_public, expires_at")
          .eq("share_token", token)
          .single();

        if (shareError || !shareData) {
          setError("This share link is invalid or has been revoked");
          setLoading(false);
          return;
        }

        // Check if expired
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          setError("This share link has expired");
          setLoading(false);
          return;
        }

        // Fetch the task
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
      } catch (err) {
        setError("Failed to load shared task");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTask();
  }, [token]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Unable to Load Task</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <div className="flex gap-2 flex-shrink-0">
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
          </CardHeader>
          <CardContent className="space-y-6">
            {task.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

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

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                This task was shared via PeakDraft
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedTask;
