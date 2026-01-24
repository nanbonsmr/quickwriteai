-- Create daily todos table
CREATE TABLE public.daily_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.daily_todos ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own daily todos"
ON public.daily_todos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily todos"
ON public.daily_todos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily todos"
ON public.daily_todos
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily todos"
ON public.daily_todos
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_daily_todos_user_date ON public.daily_todos(user_id, date);
CREATE INDEX idx_daily_todos_position ON public.daily_todos(user_id, date, position);