-- Fix avatar persistence issues
-- Run this in Supabase SQL Editor

-- Ensure avatar_url column exists and is properly configured
DO $$ 
BEGIN
  -- Check if avatar_url column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Make sure updated_at is updated when avatar changes
CREATE OR REPLACE FUNCTION update_avatar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_avatar_timestamp ON users;
CREATE TRIGGER trigger_update_avatar_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_timestamp();

-- Verify RLS policies allow users to update their own avatar
-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- Ensure users can update their own avatar
DO $$
BEGIN
  -- Drop existing update policy if it exists
  DROP POLICY IF EXISTS "Users can update own profile" ON users;
  
  -- Create comprehensive update policy
  CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Policy already exists
END $$;

-- Test: Set a test avatar for the current user (replace with your user ID)
-- UPDATE users 
-- SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=test123'
-- WHERE id = auth.uid();

-- Verify the update worked
SELECT 
  id,
  email,
  avatar_url,
  updated_at
FROM users
WHERE id = auth.uid();
