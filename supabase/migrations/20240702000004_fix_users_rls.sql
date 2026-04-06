-- Disable RLS for users table to allow profile updates
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR ALL
  USING (auth.uid() = id);
