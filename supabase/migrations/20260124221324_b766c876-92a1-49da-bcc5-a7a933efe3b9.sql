-- Create task_labels table for customizable tags
CREATE TABLE public.task_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for task-label relationships
CREATE TABLE public.task_label_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.task_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, label_id)
);

-- Create task_comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_time_entries table for time tracking
CREATE TABLE public.task_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_templates table
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  title_template TEXT NOT NULL,
  description_template TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  label_ids UUID[] DEFAULT '{}',
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_shares table for sharing tasks
CREATE TABLE public.task_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with_email TEXT,
  share_token TEXT UNIQUE,
  permission TEXT NOT NULL DEFAULT 'view',
  is_public BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_activity_log table
CREATE TABLE public.task_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_label_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_labels
CREATE POLICY "Users can view their own labels" ON public.task_labels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own labels" ON public.task_labels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own labels" ON public.task_labels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own labels" ON public.task_labels FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for task_label_assignments
CREATE POLICY "Users can view label assignments for their tasks" ON public.task_label_assignments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_label_assignments.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can create label assignments for their tasks" ON public.task_label_assignments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_label_assignments.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can delete label assignments for their tasks" ON public.task_label_assignments FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_label_assignments.task_id AND tasks.user_id = auth.uid()));

-- RLS Policies for task_comments
CREATE POLICY "Users can view comments on their tasks" ON public.task_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_comments.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can create comments on their tasks" ON public.task_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_comments.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can update their own comments" ON public.task_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.task_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for task_time_entries
CREATE POLICY "Users can view time entries on their tasks" ON public.task_time_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_time_entries.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can create time entries on their tasks" ON public.task_time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_time_entries.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can update their own time entries" ON public.task_time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own time entries" ON public.task_time_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for task_templates
CREATE POLICY "Users can view their own or shared templates" ON public.task_templates FOR SELECT
  USING (auth.uid() = user_id OR is_shared = true);
CREATE POLICY "Users can create their own templates" ON public.task_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.task_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.task_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for task_shares
CREATE POLICY "Users can view shares they created or received" ON public.task_shares FOR SELECT
  USING (auth.uid() = shared_by OR is_public = true);
CREATE POLICY "Users can create shares for their tasks" ON public.task_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by AND EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_shares.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can update their own shares" ON public.task_shares FOR UPDATE USING (auth.uid() = shared_by);
CREATE POLICY "Users can delete their own shares" ON public.task_shares FOR DELETE USING (auth.uid() = shared_by);

-- RLS Policies for task_activity_log
CREATE POLICY "Users can view activity on their tasks" ON public.task_activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_activity_log.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can create activity logs on their tasks" ON public.task_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_activity_log.task_id AND tasks.user_id = auth.uid()));

-- Create trigger for updating updated_at on comments
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at on templates
CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();