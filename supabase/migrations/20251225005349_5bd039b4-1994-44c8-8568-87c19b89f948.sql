-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view content" ON public.content_generations;
DROP POLICY IF EXISTS "Anyone can create content" ON public.content_generations;
DROP POLICY IF EXISTS "Anyone can delete content" ON public.content_generations;

-- Create secure RLS policies that restrict access to own content only
CREATE POLICY "Users can view their own content"
ON public.content_generations
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own content"
ON public.content_generations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own content"
ON public.content_generations
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own content"
ON public.content_generations
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);