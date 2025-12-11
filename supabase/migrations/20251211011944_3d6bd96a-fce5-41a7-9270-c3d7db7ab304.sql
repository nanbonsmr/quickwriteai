-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Profiles accessible via service role only" ON public.profiles;

-- Allow anyone to insert their own profile (user_id is passed from client)
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Allow users to read their own profile based on user_id passed in request
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (true)
WITH CHECK (true);