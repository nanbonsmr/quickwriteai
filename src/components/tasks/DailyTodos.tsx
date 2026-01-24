import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
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
  const [isOpen, setIsOpen] = useState(true);

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
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, completed: !completed } : todo
        )
      );
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));

    try {
      const { error } = await supabase
        .from("daily_todos")
        .delete()
        .eq("id", todoId);

      if (error) throw error;
    } catch (error: any) {
      fetchTodos();
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card p-3 sm:p-4">
        {/* Header - Always visible */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Daily Todos</span>
              {totalCount > 0 && (
                <Badge variant="secondary" className="text-xs h-5">
                  {completedCount}/{totalCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Date Navigation - Inline */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={(e) => { e.stopPropagation(); goToPreviousDay(); }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-1 min-w-[80px] justify-center">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{getDateLabel()}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={(e) => { e.stopPropagation(); goToNextDay(); }}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Progress Bar - Always visible when there are todos */}
        {totalCount > 0 && (
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Collapsible Content */}
        <CollapsibleContent>
          <div className="mt-3 space-y-3">
            {/* Add Todo Input */}
            <div className="flex items-center gap-2">
              <Input
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a quick todo..."
                className="h-8 text-sm"
                disabled={adding}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2 shrink-0"
                disabled={!newTodoTitle.trim() || adding}
                onClick={handleAddTodo}
              >
                {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {/* Todo List */}
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : todos.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Circle className="h-4 w-4" />
                <span className="text-xs">No todos for {getDateLabel().toLowerCase()}</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`group flex items-center gap-2 p-2 rounded-md transition-colors ${
                      todo.completed ? "bg-muted/50" : "hover:bg-muted/30"
                    }`}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={(checked) => handleToggleTodo(todo.id, checked as boolean)}
                      className="h-4 w-4 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <span
                      className={`flex-1 text-sm truncate ${
                        todo.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {todo.title}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Go to Today link */}
            {!isToday(selectedDate) && (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs w-full justify-center" 
                onClick={goToToday}
              >
                Go to today
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
