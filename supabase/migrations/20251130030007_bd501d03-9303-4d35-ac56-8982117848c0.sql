-- Create table to store signup OTPs temporarily
CREATE TABLE public.signup_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.signup_otps ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (for signup)
CREATE POLICY "Anyone can create OTP requests" 
ON public.signup_otps 
FOR INSERT 
WITH CHECK (true);

-- Allow reading own OTP by email (for verification)
CREATE POLICY "Anyone can read OTPs" 
ON public.signup_otps 
FOR SELECT 
USING (true);

-- Allow updating (for marking as verified)
CREATE POLICY "Anyone can update OTPs" 
ON public.signup_otps 
FOR UPDATE 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_signup_otps_email ON public.signup_otps(email);

-- Auto-delete expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.signup_otps WHERE expires_at < now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_cleanup_expired_otps
AFTER INSERT ON public.signup_otps
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_otps();