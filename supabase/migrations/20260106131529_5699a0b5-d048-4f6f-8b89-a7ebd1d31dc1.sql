-- Update existing free users to have 5000 words limit
UPDATE public.profiles 
SET words_limit = 5000 
WHERE subscription_plan = 'free' OR subscription_plan IS NULL;

-- Update the handle_new_user function to set 5000 for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, subscription_plan, words_limit)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    'free',
    5000
  );
  RETURN NEW;
END;
$$;