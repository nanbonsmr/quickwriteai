-- Add reminder_time column to tasks table
ALTER TABLE public.tasks ADD COLUMN reminder_time timestamp with time zone DEFAULT NULL;