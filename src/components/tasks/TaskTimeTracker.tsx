import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Clock, Play, Square, Trash2, Loader2 } from "lucide-react";
import { useTaskTimeTracking, formatDuration, TimeEntry } from "@/hooks/useTaskTimeTracking";
import { format } from "date-fns";

interface TaskTimeTrackerProps {
  taskId: string | null;
}

export function TaskTimeTracker({ taskId }: TaskTimeTrackerProps) {
  const {
    entries,
    activeEntry,
    elapsedSeconds,
    totalTimeSeconds,
    loading,
    isRunning,
    startTimer,
    stopTimer,
    deleteEntry,
  } = useTaskTimeTracking(taskId);

  const [showStopDialog, setShowStopDialog] = useState(false);
  const [stopDescription, setStopDescription] = useState("");

  const handleStart = async () => {
    await startTimer();
  };

  const handleStop = async () => {
    setShowStopDialog(true);
  };

  const confirmStop = async () => {
    await stopTimer(stopDescription);
    setShowStopDialog(false);
    setStopDescription("");
  };

  const handleDelete = async (entryId: string) => {
    await deleteEntry(entryId);
  };

  if (!taskId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Save the task first to track time</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Time Tracking</h4>
        </div>
        <span className="text-sm text-muted-foreground">
          Total: {formatDuration(totalTimeSeconds + (isRunning ? elapsedSeconds : 0))}
        </span>
      </div>

      {/* Timer controls */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        {isRunning ? (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-lg font-mono font-semibold">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Started {format(new Date(activeEntry!.started_at), "h:mm a")}
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleStop}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <p className="text-sm">Start tracking time for this task</p>
            </div>
            <Button
              size="sm"
              onClick={handleStart}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
          </>
        )}
      </div>

      {/* Time entries list */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-muted-foreground">Recent Entries</h5>
        <ScrollArea className="max-h-40">
          <div className="space-y-2 pr-3">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : entries.filter((e) => e.ended_at).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No time entries yet
              </p>
            ) : (
              entries
                .filter((entry) => entry.ended_at)
                .map((entry) => (
                  <TimeEntryRow
                    key={entry.id}
                    entry={entry}
                    onDelete={() => handleDelete(entry.id)}
                  />
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Stop timer dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Stop Timer</DialogTitle>
            <DialogDescription>
              Add an optional description for this time entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-mono font-semibold">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>
            <Input
              placeholder="What did you work on? (optional)"
              value={stopDescription}
              onChange={(e) => setStopDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStopDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={confirmStop} className="flex-1">
                Stop & Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimeEntryRow({ entry, onDelete }: { entry: TimeEntry; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-background border group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatDuration(entry.duration_seconds || 0)}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(entry.started_at), "MMM d, h:mm a")}
          </span>
        </div>
        {entry.description && (
          <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
        )}
      </div>
      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// Compact display for task cards
export function TaskTimeDisplay({ taskId }: { taskId: string }) {
  const { totalTimeSeconds, isRunning, elapsedSeconds } = useTaskTimeTracking(taskId);

  const displayTime = totalTimeSeconds + (isRunning ? elapsedSeconds : 0);

  if (displayTime === 0 && !isRunning) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{formatDuration(displayTime)}</span>
      {isRunning && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}
