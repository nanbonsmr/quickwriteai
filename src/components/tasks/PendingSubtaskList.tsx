import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ListTodo } from "lucide-react";

interface PendingSubtaskListProps {
  subtasks: string[];
  onSubtasksChange: (subtasks: string[]) => void;
}

export function PendingSubtaskList({ subtasks, onSubtasksChange }: PendingSubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    onSubtasksChange([...subtasks, newSubtaskTitle.trim()]);
    setNewSubtaskTitle("");
  };

  const handleRemove = (index: number) => {
    onSubtasksChange(subtasks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ListTodo className="h-4 w-4 text-primary" />
          <span>Subtasks</span>
        </div>
        {subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {subtasks.length} subtask{subtasks.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Pending subtask list */}
      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask, index) => (
            <div
              key={index}
              className="flex items-center gap-2 group py-1.5 px-2 rounded-md bg-background/50"
            >
              <span className="flex-1 text-sm">{subtask}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add subtask form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="h-8 px-2 shrink-0"
          disabled={!newSubtaskTitle.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
