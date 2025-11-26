import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Calendar, Plus, BarChart3 } from "lucide-react";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { TaskAnalytics } from "@/components/tasks/TaskAnalytics";

export default function Tasks() {
  const { user } = useAuth();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsTaskDialogOpen(false);
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground mt-1">
              Organize and track your content creation tasks
            </p>
          </div>
          <Button onClick={() => setIsTaskDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Views */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="kanban">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard 
              refreshTrigger={refreshTrigger} 
              onEditTask={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <TaskListView 
              refreshTrigger={refreshTrigger}
              onEditTask={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <TaskCalendarView 
              refreshTrigger={refreshTrigger}
              onEditTask={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <TaskAnalytics refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={handleCloseDialog}
        taskId={selectedTaskId}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}