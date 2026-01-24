-- Create table to store pinned templates
CREATE TABLE public.pinned_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id text NOT NULL UNIQUE,
    pinned_at timestamp with time zone NOT NULL DEFAULT now(),
    pinned_by text NOT NULL
);

-- Enable RLS
ALTER TABLE public.pinned_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins can manage pinned templates (via service role in edge function)
CREATE POLICY "Service role can manage pinned templates"
ON public.pinned_templates
FOR ALL
USING (true)
WITH CHECK (true);

-- Everyone can view pinned templates
CREATE POLICY "Everyone can view pinned templates"
ON public.pinned_templates
FOR SELECT
USING (true);