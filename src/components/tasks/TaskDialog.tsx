import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Bell, FileText, MessageSquare, Clock, History, Share2, Tag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SubtaskList } from "./SubtaskList";
import { PendingSubtaskList } from "./PendingSubtaskList";
import { TaskLabelManager } from "./TaskLabelManager";
import { TaskComments } from "./TaskComments";
import { TaskTimeTracker } from "./TaskTimeTracker";
import { TaskActivityLog } from "./TaskActivityLog";
import { TaskSharingPanel } from "./TaskSharingPanel";
import { TaskTemplateManager } from "./TaskTemplateManager";
import { useTaskActivityLog } from "@/hooks/useTaskActivityLog";
import { TaskTemplate } from "@/hooks/useTaskTemplates";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  onTaskCreated: () => void;
}

const TEMPLATE_TYPES = [
  'Blog Post',
  'Social Media',
  'Email',
  'Ad Copy',
  'Product Description',
  'Script',
  'Letter',
  'CV',
  'Hashtags',
  'Post Ideas',
  'ChatGPT Prompt',
  'Image Prompt',
  'Video Prompt',
  'Other',
];

export function TaskDialog({ open, onOpenChange, taskId, onTaskCreated }: TaskDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useTaskActivityLog(taskId);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [templateType, setTemplateType] = useState("");
  const [recurrencePattern, setRecurrencePattern] = useState("");
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderTime, setReminderTime] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [pendingSubtasks, setPendingSubtasks] = useState<string[]>([]);

  // Store original values for activity logging
  const [originalValues, setOriginalValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (taskId && open) {
      fetchTaskData();
      setActiveTab("details");
    } else if (!open) {
      resetForm();
    }
  }, [taskId, open]);

  const fetchTaskData = async () => {
    if (!taskId) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setDescription(data.description || "");
      setPriority(data.priority);
      setStatus(data.status);
      setDueDate(data.due_date ? new Date(data.due_date) : undefined);
      setTemplateType(data.template_type || "");
      setRecurrencePattern(data.recurrence_pattern || "");
      
      if (data.reminder_time) {
        const reminderDateTime = new Date(data.reminder_time);
        setReminderDate(reminderDateTime);
        setReminderTime(format(reminderDateTime, "HH:mm"));
      } else {
        setReminderDate(undefined);
        setReminderTime("");
      }

      // Store original values for activity logging
      setOriginalValues({
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date,
      });
    } catch (error: any) {
      toast({
        title: "Error loading task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("todo");
    setDueDate(undefined);
    setTemplateType("");
    setRecurrencePattern("");
    setReminderDate(undefined);
    setReminderTime("");
    setSelectedLabelIds([]);
    setOriginalValues({});
    setActiveTab("details");
    setPendingSubtasks([]);
  };

  const getReminderDateTime = (): string | null => {
    if (!reminderDate || !reminderTime) return null;
    
    const [hours, minutes] = reminderTime.split(":").map(Number);
    const combined = new Date(reminderDate);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
  };

  const handleApplyTemplate = (template: TaskTemplate) => {
    const processedTitle = template.title_template.replace(
      /\{\{date\}\}/g,
      format(new Date(), "MMM d, yyyy")
    );
    setTitle(processedTitle);
    if (template.description_template) {
      setDescription(template.description_template);
    }
    setPriority(template.priority);
    
    toast({
      title: "Template applied",
      description: `Applied "${template.name}" template`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const taskData = {
        user_id: user.id,
        title,
        description: description || null,
        priority,
        status,
        due_date: dueDate?.toISOString() || null,
        template_type: templateType || null,
        recurrence_pattern: recurrencePattern || null,
        reminder_time: getReminderDateTime(),
      };

      if (taskId) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskId);

        if (error) throw error;

        // Log activity for changes
        if (originalValues.status !== status) {
          await logActivity("status_changed", { status: originalValues.status }, { status });
        }
        if (originalValues.priority !== priority) {
          await logActivity("priority_changed", { priority: originalValues.priority }, { priority });
        }
        if (originalValues.title !== title) {
          await logActivity("title_changed", { title: originalValues.title }, { title });
        }

        toast({
          title: "Task updated",
          description: "Your task has been updated successfully",
        });
      } else {
        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert([taskData])
          .select()
          .single();

        if (error) throw error;

        // Assign labels to the new task
        if (selectedLabelIds.length > 0 && newTask) {
          const labelAssignments = selectedLabelIds.map((labelId) => ({
            task_id: newTask.id,
            label_id: labelId,
          }));
          await supabase.from("task_label_assignments").insert(labelAssignments);
        }

        // Create pending subtasks for the new task
        if (pendingSubtasks.length > 0 && newTask) {
          const subtasksToInsert = pendingSubtasks.map((subtaskTitle, index) => ({
            task_id: newTask.id,
            title: subtaskTitle,
            position: index,
            completed: false,
          }));
          await supabase.from("subtasks").insert(subtasksToInsert);
        }

        toast({
          title: "Task created",
          description: "Your task has been created successfully",
        });
      }

      onTaskCreated();
    } catch (error: any) {
      toast({
        title: taskId ? "Error updating task" : "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl">
              {taskId ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            {!taskId && (
              <TaskTemplateManager onSelectTemplate={handleApplyTemplate} />
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-2 grid grid-cols-6 h-auto p-1 flex-shrink-0">
            <TabsTrigger value="details" className="gap-1.5 text-xs py-2">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="labels" className="gap-1.5 text-xs py-2">
              <Tag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Labels</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5 text-xs py-2" disabled={!taskId}>
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Comments</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-1.5 text-xs py-2" disabled={!taskId}>
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="gap-1.5 text-xs py-2" disabled={!taskId}>
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs py-2" disabled={!taskId}>
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="details" className="mt-0 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
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

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To-Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="templateType">Template Type</Label>
                    <Select value={templateType} onValueChange={setTemplateType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <Select value={recurrencePattern || "none"} onValueChange={(value) => setRecurrencePattern(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No recurrence</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reminder Section */}
                <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Bell className="h-4 w-4 text-primary" />
                    <span>Reminder Notification</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Reminder Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn(
                            "w-full justify-start text-left font-normal text-sm",
                            !reminderDate && "text-muted-foreground"
                          )}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {reminderDate ? format(reminderDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={reminderDate}
                            onSelect={setReminderDate}
                            initialFocus
                            className="pointer-events-auto"
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="reminderTime">Reminder Time</Label>
                      <Input
                        id="reminderTime"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  {reminderDate && reminderTime && (
                    <p className="text-xs text-muted-foreground">
                      You'll receive a notification on {format(reminderDate, "PPP")} at {reminderTime}
                    </p>
                  )}
                </div>

                {/* Subtasks Section */}
                {taskId ? (
                  <SubtaskList taskId={taskId} />
                ) : (
                  <PendingSubtaskList
                    subtasks={pendingSubtasks}
                    onSubtasksChange={setPendingSubtasks}
                  />
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {taskId ? 'Update Task' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="labels" className="mt-0">
              <TaskLabelManager 
                taskId={taskId} 
                onLabelsChange={setSelectedLabelIds}
              />
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <TaskComments taskId={taskId} />
            </TabsContent>

            <TabsContent value="time" className="mt-0">
              <TaskTimeTracker taskId={taskId} />
            </TabsContent>

            <TabsContent value="share" className="mt-0">
              <TaskSharingPanel taskId={taskId} />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <TaskActivityLog taskId={taskId} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
