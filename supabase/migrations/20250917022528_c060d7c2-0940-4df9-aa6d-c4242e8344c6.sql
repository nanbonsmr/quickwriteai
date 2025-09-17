-- Create notifications table for admin-managed notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  target_users TEXT DEFAULT 'all', -- all, specific, premium, free
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discount codes table
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discount code usage tracking table
CREATE TABLE public.discount_code_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all admin tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Create admin role function (we'll use this to check if user is admin)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- For now, we'll check if user's email matches admin emails
  -- In production, you should have a proper roles system
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid 
    AND email IN ('admin@example.com') -- Add your admin emails here
  );
$$;

-- RLS Policies for notifications (only admins can manage)
CREATE POLICY "Admins can manage notifications" 
ON public.notifications 
FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for discount codes (only admins can manage)
CREATE POLICY "Admins can manage discount codes" 
ON public.discount_codes 
FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for discount usage (admins can view all, users can view their own)
CREATE POLICY "Admins can view all discount usage" 
ON public.discount_code_usage 
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own discount usage" 
ON public.discount_code_usage 
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discount usage" 
ON public.discount_code_usage 
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();