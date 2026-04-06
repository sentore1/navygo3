-- Fix avatar generation and save issue on settings page
-- Run each section separately in Supabase SQL Editor

-- ============================================
-- SECTION 1: Drop old policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;


-- ============================================
-- SECTION 2: Create new RLS policies
-- ============================================

-- Policy for SELECT (viewing own data)
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR 
    auth.uid()::text = user_id
  );

-- Policy for UPDATE (updating own profile including avatar)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (
    auth.uid() = id OR 
    auth.uid()::text = user_id
  )
  WITH CHECK (
    auth.uid() = id OR 
    auth.uid()::text = user_id
  );

-- Policy for INSERT (in case user doesn't exist yet)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR 
    auth.uid()::text = user_id
  );

-- ============================================
-- SECTION 3: Add missing columns (run if needed)
-- ============================================

-- Check if columns exist first:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('avatar_url', 'display_name', 'show_on_leaderboard');

-- If avatar_url is missing, add it:
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- If display_name is missing, add it:
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- If show_on_leaderboard is missing, add it:
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT false;

-- ============================================
-- SECTION 4: Create auto-update timestamp function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 5: Create trigger
-- ============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECTION 6: Verify the setup
-- ============================================

SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as check_status
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================
-- SECTION 7: Check your user data
-- ============================================

SELECT 
  id,
  user_id,
  email,
  name,
  avatar_url,
  display_name,
  show_on_leaderboard,
  created_at,
  updated_at
FROM public.users
WHERE id = auth.uid() OR user_id = auth.uid()::text;

-- ============================================
-- SECTION 8: Test avatar update (optional)
-- ============================================

-- Uncomment to test:
-- UPDATE public.users 
-- SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=test123'
-- WHERE id = auth.uid()
-- RETURNING id, email, avatar_url, updated_at;
