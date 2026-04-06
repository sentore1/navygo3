-- Comprehensive diagnosis of milestone insertion issue

-- 1. Check milestones table structure
SELECT 
  '1. Milestones table structure' as step,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'milestones'
ORDER BY ordinal_position;

-- 2. Check RLS policies on milestones
SELECT 
  '2. RLS Policies' as step,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'milestones';

-- 3. Check recent goals (to test milestone insertion)
SELECT 
  '3. Recent goals' as step,
  id,
  title,
  user_id,
  created_at
FROM goals
ORDER BY created_at DESC
LIMIT 3;

-- 4. Check if any milestones exist
SELECT 
  '4. Existing milestones' as step,
  COUNT(*) as milestone_count
FROM milestones;

-- 5. Try to manually insert a milestone for the most recent goal
-- Get the most recent goal ID first
DO $$
DECLARE
  latest_goal_id UUID;
  test_user_id UUID;
BEGIN
  -- Get the most recent goal
  SELECT id, user_id INTO latest_goal_id, test_user_id
  FROM goals
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_goal_id IS NOT NULL THEN
    RAISE NOTICE 'Testing milestone insert for goal: %', latest_goal_id;
    
    -- Try to insert a test milestone
    INSERT INTO milestones (goal_id, title, description, completed)
    VALUES (
      latest_goal_id,
      'Test Milestone from SQL',
      'Testing if manual insertion works',
      false
    );
    
    RAISE NOTICE 'SUCCESS: Milestone inserted successfully!';
  ELSE
    RAISE NOTICE 'No goals found to test with';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- 6. Check if the test milestone was created
SELECT 
  '6. Test milestone result' as step,
  m.id,
  m.title,
  m.description,
  g.title as goal_title
FROM milestones m
JOIN goals g ON g.id = m.goal_id
WHERE m.title = 'Test Milestone from SQL';
