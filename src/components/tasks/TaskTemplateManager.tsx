import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Plus, Trash2, Pencil, Loader2, Sparkles } from "lucide-react";
import { useTaskTemplates, TaskTemplate } from "@/hooks/useTaskTemplates";

interface TaskTemplateManagerProps {
  onSelectTemplate?: (template: TaskTemplate) => void;
}

export function TaskTemplateManager({ onSelectTemplate }: TaskTemplateManagerProps) {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTaskTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [titleTemplate, setTitleTemplate] = useState("");
  const [descriptionTemplate, setDescriptionTemplate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isShared, setIsShared] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTitleTemplate("");
    setDescriptionTemplate("");
    setPriority("medium");
    setIsShared(false);
    setEditingTemplate(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !titleTemplate.trim()) return;

    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, {
        name: name.trim(),
        description: description.trim() || null,
        title_template: titleTemplate.trim(),
        description_template: descriptionTemplate.trim() || null,
        priority,
        is_shared: isShared,
      });
    } else {
      await createTemplate({
        name: name.trim(),
        description: description.trim() || null,
        title_template: titleTemplate.trim(),
        description_template: descriptionTemplate.trim() || null,
        priority,
        label_ids: [],
        is_shared: isShared,
      });
    }

    resetForm();
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || "");
    setTitleTemplate(template.title_template);
    setDescriptionTemplate(template.description_template || "");
    setPriority(template.priority);
    setIsShared(template.is_shared);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    onSelectTemplate?.(template);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Task Templates
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {showForm ? (
            <div className="space-y-4 p-1">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Weekly Report"
                />
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this template for?"
                />
              </div>

              <div>
                <Label htmlFor="title-template">Task Title Template *</Label>
                <Input
                  id="title-template"
                  value={titleTemplate}
                  onChange={(e) => setTitleTemplate(e.target.value)}
                  placeholder="e.g., Weekly Report - {{date}}"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {"{{date}}"} for current date
                </p>
              </div>

              <div>
                <Label htmlFor="description-template">Task Description Template</Label>
                <Textarea
                  id="description-template"
                  value={descriptionTemplate}
                  onChange={(e) => setDescriptionTemplate(e.target.value)}
                  placeholder="Default description for tasks created from this template"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={isShared}
                    onCheckedChange={setIsShared}
                    id="shared-switch"
                  />
                  <Label htmlFor="shared-switch" className="text-sm">
                    Share with team
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={!name.trim() || !titleTemplate.trim()}>
                  {editingTemplate ? "Update" : "Create"} Template
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Template
              </Button>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-3">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No templates yet</p>
                      <p className="text-xs">Create a template to speed up task creation</p>
                    </div>
                  ) : (
                    templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => handleSelectTemplate(template)}
                            className="flex-1 text-left"
                          >
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            {template.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {template.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {template.priority}
                              </Badge>
                              {template.is_shared && (
                                <Badge variant="secondary" className="text-xs">
                                  Shared
                                </Badge>
                              )}
                            </div>
                          </button>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(template);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
