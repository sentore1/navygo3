-- Fix RLS policies for avatar updates
-- The issue is conflicting policies with incorrect configurations

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;

-- Recreate with correct configuration
-- Policy for viewing own data (using correct column 'id' not 'user_id')
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy for updating own profile (with proper with_check)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify the policies are correct
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Test the update (this should work now)
-- Uncomment to test:
-- UPDATE users 
-- SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=test' 
-- WHERE id = auth.uid()
-- RETURNING id, email, avatar_url;
