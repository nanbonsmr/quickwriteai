-- Create promotions table for popup promotions
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  button_text TEXT DEFAULT 'Learn More',
  button_link TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT false,
  show_on_landing BOOLEAN DEFAULT true,
  show_on_dashboard BOOLEAN DEFAULT true,
  target_users TEXT DEFAULT 'free', -- 'all', 'free', 'paid'
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active promotions
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (is_active = true);

-- Only admins can manage promotions (through edge function)
-- No direct insert/update/delete policies for regular users

-- Create dismissed promotions table
CREATE TABLE public.dismissed_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, promotion_id)
);

-- Enable RLS
ALTER TABLE public.dismissed_promotions ENABLE ROW LEVEL SECURITY;

-- Users can view their own dismissed promotions
CREATE POLICY "Users can view their own dismissed promotions"
ON public.dismissed_promotions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can dismiss promotions
CREATE POLICY "Users can dismiss promotions"
ON public.dismissed_promotions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();