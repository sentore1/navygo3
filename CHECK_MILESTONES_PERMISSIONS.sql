-- Check milestones table structure and permissions

-- 1. Check table structure
SELECT 
  'Milestones table structure' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'milestones'
ORDER BY ordinal_position;

-- 2. Check RLS policies
SELECT 
  'RLS Policies for milestones' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'milestones';

-- 3. Check if RLS is enabled
SELECT 
  'RLS Status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'milestones';

-- 4. Test milestone insert (replace YOUR_GOAL_ID with an actual goal ID)
/*
INSERT INTO milestones (goal_id, title, description, completed)
VALUES (
  'YOUR_GOAL_ID'::uuid,
  'Test Milestone',
  'Test Description',
  false
);
*/
