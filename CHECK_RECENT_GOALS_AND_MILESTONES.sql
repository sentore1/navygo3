-- Check recent goals and their milestones

-- Get the 5 most recent goals with their milestone counts
SELECT 
  g.id,
  g.title,
  g.created_at,
  COUNT(m.id) as milestone_count
FROM goals g
LEFT JOIN milestones m ON m.goal_id = g.id
GROUP BY g.id, g.title, g.created_at
ORDER BY g.created_at DESC
LIMIT 5;

-- Get details of milestones for the most recent goal
SELECT 
  'Milestones for most recent goal' as info,
  m.id,
  m.title,
  m.description,
  m.completed,
  m.created_at
FROM milestones m
WHERE m.goal_id = (
  SELECT id FROM goals ORDER BY created_at DESC LIMIT 1
)
ORDER BY m.created_at;
