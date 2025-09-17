-- First, remove the overly broad policy
DROP POLICY IF EXISTS "Admins can manage discount codes" ON public.discount_codes;

-- Create secure admin-only policies for direct table access
CREATE POLICY "Admins can view discount codes" 
ON public.discount_codes 
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert discount codes" 
ON public.discount_codes 
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update discount codes" 
ON public.discount_codes 
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete discount codes" 
ON public.discount_codes 
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create a secure function for validating discount codes
-- This function doesn't expose table data, only returns validation results
CREATE OR REPLACE FUNCTION public.validate_discount_code(
  discount_code_text TEXT,
  user_uuid UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_record RECORD;
  existing_usage_count INTEGER;
  result JSON;
BEGIN
  -- Input validation
  IF discount_code_text IS NULL OR trim(discount_code_text) = '' THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid code format'
    );
  END IF;

  IF user_uuid IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'User authentication required'
    );
  END IF;

  -- Find the discount code (case-insensitive, active only)
  SELECT * INTO code_record
  FROM public.discount_codes
  WHERE UPPER(code) = UPPER(trim(discount_code_text))
    AND is_active = true;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid or inactive discount code'
    );
  END IF;

  -- Check if code has expired
  IF code_record.expires_at IS NOT NULL AND code_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Discount code has expired'
    );
  END IF;

  -- Check if max uses reached
  IF code_record.max_uses IS NOT NULL AND code_record.used_count >= code_record.max_uses THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Discount code usage limit reached'
    );
  END IF;

  -- Check if user has already used this code
  SELECT COUNT(*) INTO existing_usage_count
  FROM public.discount_code_usage
  WHERE discount_code_id = code_record.id
    AND user_id = user_uuid;

  IF existing_usage_count > 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'You have already used this discount code'
    );
  END IF;

  -- Code is valid - return success with discount percentage only
  RETURN json_build_object(
    'valid', true,
    'discount_percent', code_record.discount_percent,
    'code_id', code_record.id
  );
END;
$$;

-- Create a secure function for applying discount codes
-- This records usage and updates count atomically
CREATE OR REPLACE FUNCTION public.apply_discount_code(
  discount_code_text TEXT,
  user_uuid UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validation_result JSON;
  code_id UUID;
BEGIN
  -- First validate the code
  validation_result := public.validate_discount_code(discount_code_text, user_uuid);
  
  -- Check if validation passed
  IF (validation_result->>'valid')::boolean = false THEN
    RETURN validation_result;
  END IF;

  -- Extract code ID from validation result
  code_id := (validation_result->>'code_id')::UUID;

  -- Record the usage
  INSERT INTO public.discount_code_usage (discount_code_id, user_id)
  VALUES (code_id, user_uuid);

  -- Update usage count
  UPDATE public.discount_codes
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = code_id;

  -- Return success with discount percentage
  RETURN json_build_object(
    'valid', true,
    'applied', true,
    'discount_percent', (validation_result->>'discount_percent')::INTEGER
  );
END;
$$;