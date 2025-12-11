-- First, just drop the blocking policy
DROP POLICY IF EXISTS "Users can view notifications intended for them" ON public.notifications;