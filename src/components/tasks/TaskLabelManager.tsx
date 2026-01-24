import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Tag, Check, X, Pencil, Trash2 } from "lucide-react";
import { useTaskLabels, useTaskLabelAssignments, TaskLabel } from "@/hooks/useTaskLabels";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
];

interface TaskLabelManagerProps {
  taskId: string | null;
  onLabelsChange?: (labelIds: string[]) => void;
  compact?: boolean;
}

export function TaskLabelManager({ taskId, onLabelsChange, compact = false }: TaskLabelManagerProps) {
  const { labels, createLabel, updateLabel, deleteLabel } = useTaskLabels();
  const { assignedLabelIds, toggleLabel, setAssignedLabelIds } = useTaskLabelAssignments(taskId);
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [editingLabel, setEditingLabel] = useState<TaskLabel | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    const newLabel = await createLabel(newLabelName.trim(), newLabelColor);
    if (newLabel) {
      setNewLabelName("");
      setNewLabelColor(PRESET_COLORS[0]);
      setShowCreateForm(false);
      
      // If we're managing a task, also assign the new label
      if (taskId) {
        await toggleLabel(newLabel.id);
        onLabelsChange?.([...assignedLabelIds, newLabel.id]);
      }
    }
  };

  const handleToggleLabel = async (labelId: string) => {
    if (taskId) {
      await toggleLabel(labelId);
      const newIds = assignedLabelIds.includes(labelId)
        ? assignedLabelIds.filter((id) => id !== labelId)
        : [...assignedLabelIds, labelId];
      onLabelsChange?.(newIds);
    } else {
      // For new tasks without ID yet, just manage local state
      const newIds = assignedLabelIds.includes(labelId)
        ? assignedLabelIds.filter((id) => id !== labelId)
        : [...assignedLabelIds, labelId];
      setAssignedLabelIds(newIds);
      onLabelsChange?.(newIds);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel || !newLabelName.trim()) return;

    await updateLabel(editingLabel.id, newLabelName.trim(), newLabelColor);
    setEditingLabel(null);
    setNewLabelName("");
    setNewLabelColor(PRESET_COLORS[0]);
  };

  const handleDeleteLabel = async (labelId: string) => {
    await deleteLabel(labelId);
  };

  const assignedLabels = labels.filter((label) => assignedLabelIds.includes(label.id));

  return (
    <div className="space-y-2">
      {/* Display assigned labels */}
      <div className="flex flex-wrap gap-1.5">
        {assignedLabels.map((label) => (
          <Badge
            key={label.id}
            style={{ backgroundColor: label.color }}
            className="text-white text-xs px-2 py-0.5"
          >
            {label.name}
          </Badge>
        ))}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size={compact ? "sm" : "default"} className="gap-2">
            <Tag className="h-4 w-4" />
            {compact ? "" : "Labels"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Labels</h4>

            {/* Label list */}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {labels.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No labels yet. Create one below.
                </p>
              ) : (
                labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted group"
                  >
                    <button
                      onClick={() => handleToggleLabel(label.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: label.color }}
                      >
                        {assignedLabelIds.includes(label.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm flex-1 truncate">{label.name}</span>
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={() => {
                          setEditingLabel(label);
                          setNewLabelName(label.name);
                          setNewLabelColor(label.color);
                          setShowCreateForm(true);
                        }}
                        className="p-1 hover:bg-background rounded"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteLabel(label.id)}
                        className="p-1 hover:bg-background rounded text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create/Edit form */}
            {showCreateForm ? (
              <div className="space-y-2 pt-2 border-t">
                <Input
                  placeholder="Label name"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewLabelColor(color)}
                      className={`w-6 h-6 rounded transition-all ${
                        newLabelColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={editingLabel ? handleUpdateLabel : handleCreateLabel}
                    disabled={!newLabelName.trim()}
                    className="flex-1"
                  >
                    {editingLabel ? "Update" : "Create"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingLabel(null);
                      setNewLabelName("");
                      setNewLabelColor(PRESET_COLORS[0]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateForm(true)}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Label
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Compact version for displaying labels on cards
export function TaskLabelsDisplay({ taskId }: { taskId: string }) {
  const { labels } = useTaskLabels();
  const { assignedLabelIds } = useTaskLabelAssignments(taskId);

  const assignedLabels = labels.filter((label) => assignedLabelIds.includes(label.id));

  if (assignedLabels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {assignedLabels.map((label) => (
        <Badge
          key={label.id}
          style={{ backgroundColor: label.color }}
          className="text-white text-[10px] px-1.5 py-0"
        >
          {label.name}
        </Badge>
      ))}
    </div>
  );
}
