import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  ListTodo
} from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";

interface DailyTodo {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  position: number;
  created_at: string;
  completed_at: string | null;
}

export function DailyTodos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<DailyTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user, selectedDate]);

  const fetchTodos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("daily_todos")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .order("position", { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error: any) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim() || !user) return;

    setAdding(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("daily_todos")
        .insert({
          user_id: user.id,
          title: newTodoTitle.trim(),
          date: dateStr,
          position: todos.length,
        })
        .select()
        .single();

      if (error) throw error;

      setTodos((prev) => [...prev, data]);
      setNewTodoTitle("");
    } catch (error: any) {
      toast({
        title: "Error adding todo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTodo();
    }
  };

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    // Optimistic update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? { ...todo, completed, completed_at: completed ? new Date().toISOString() : null }
          : todo
      )
    );

    try {
      const { error } = await supabase
        .from("daily_todos")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", todoId);

      if (error) throw error;
    } catch (error: any) {
      // Revert on error
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, completed: !completed } : todo
        )
      );
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    // Optimistic update
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));

    try {
      const { error } = await supabase
        .from("daily_todos")
        .delete()
        .eq("id", todoId);

      if (error) throw error;
    } catch (error: any) {
      fetchTodos(); // Refetch on error
      toast({
        title: "Error deleting todo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCarryOverIncomplete = async () => {
    const incompleteTodos = todos.filter((todo) => !todo.completed);
    if (incompleteTodos.length === 0) {
      toast({
        title: "No incomplete todos",
        description: "All todos are already completed!",
      });
      return;
    }

    const tomorrow = addDays(selectedDate, 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

    try {
      const newTodos = incompleteTodos.map((todo, idx) => ({
        user_id: user!.id,
        title: todo.title,
        date: tomorrowStr,
        position: idx,
      }));

      const { error } = await supabase.from("daily_todos").insert(newTodos);

      if (error) throw error;

      toast({
        title: "Todos carried over",
        description: `${incompleteTodos.length} incomplete todo(s) moved to tomorrow`,
      });
    } catch (error: any) {
      toast({
        title: "Error carrying over todos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const goToPreviousDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate((prev) => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    if (isYesterday(selectedDate)) return "Yesterday";
    return format(selectedDate, "EEE, MMM d");
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Daily Todos</CardTitle>
          </div>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getDateLabel()}</span>
            {!isToday(selectedDate) && (
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={goToToday}>
                Go to today
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        {/* Add Todo Input */}
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a todo for today..."
            className="h-9 text-sm"
            disabled={adding}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 px-3 shrink-0"
            disabled={!newTodoTitle.trim() || adding}
            onClick={handleAddTodo}
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* Todo List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Circle className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No todos for {getDateLabel().toLowerCase()}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add your first todo above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    todo.completed ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(checked) => handleToggleTodo(todo.id, checked as boolean)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <span
                    className={`flex-1 text-sm transition-all ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Carry Over Button */}
        {todos.some((t) => !t.completed) && isToday(selectedDate) && (
          <div className="pt-4 mt-auto border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleCarryOverIncomplete}
            >
              <ChevronRight className="h-3.5 w-3.5 mr-1" />
              Carry incomplete to tomorrow
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
