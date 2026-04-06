-- Run this in Supabase SQL Editor to check milestone data

-- Check what milestones exist
SELECT 
  g.id as goal_id,
  g.title as goal_title,
  m.id as milestone_id,
  m.title as milestone_title,
  m.completed
FROM goals g
LEFT JOIN milestones m ON m.goal_id = g.id
ORDER BY g.created_at DESC
LIMIT 10;

-- Check if milestone IDs are UUIDs
SELECT 
  id,
  pg_typeof(id) as id_type,
  title,
  completed
FROM milestones
LIMIT 5;
