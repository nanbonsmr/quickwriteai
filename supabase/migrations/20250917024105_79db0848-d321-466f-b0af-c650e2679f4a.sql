-- Add RLS policy to allow users to read notifications intended for them
CREATE POLICY "Users can view notifications intended for them" 
ON public.notifications 
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (
    target_users = 'all' 
    OR (target_users = 'premium' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND subscription_plan != 'free'
    ))
    OR (target_users = 'free' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND subscription_plan = 'free'
    ))
  )
);