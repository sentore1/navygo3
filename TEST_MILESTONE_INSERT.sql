-- Test if we can manually insert a milestone for an existing goal

-- First, get a goal ID from your goals
SELECT 
  'Your goals' as info,
  id,
  title,
  user_id
FROM goals
ORDER BY created_at DESC
LIMIT 5;

-- Try to insert a test milestone (replace GOAL_ID with an actual ID from above)
/*
INSERT INTO milestones (goal_id, title, description, completed)
VALUES (
  'YOUR_GOAL_ID_HERE'::uuid,
  'Test Milestone',
  'Testing milestone insertion',
  false
);
*/

-- Check if the milestone was created
/*
SELECT 
  m.id,
  m.title,
  m.description,
  m.completed,
  g.title as goal_title
FROM milestones m
JOIN goals g ON g.id = m.goal_id
WHERE m.goal_id = 'YOUR_GOAL_ID_HERE'::uuid;
*/
