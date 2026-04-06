-- Check pending goals for your account
-- Replace 'YOUR_EMAIL' with abdousentore@gmail.com

-- First, find your user ID
SELECT 
  id as user_id,
  email,
  name,
  display_name
FROM public.users
WHERE email = 'abdousentore@gmail.com';

-- Then check your goals
SELECT 
  g.id,
  g.title,
  g.description,
  g.category,
  g.completed,
  g.progress,
  g.target_value,
  g.created_at,
  g.updated_at
FROM public.goals g
JOIN public.users u ON g.user_id = u.id
WHERE u.email = 'abdousentore@gmail.com'
  AND g.completed = false
ORDER BY g.created_at DESC;

-- Count of pending goals
SELECT 
  COUNT(*) as pending_goals_count
FROM public.goals g
JOIN public.users u ON g.user_id = u.id
WHERE u.email = 'abdousentore@gmail.com'
  AND g.completed = false;

-- All goals (completed and pending)
SELECT 
  g.completed,
  COUNT(*) as count
FROM public.goals g
JOIN public.users u ON g.user_id = u.id
WHERE u.email = 'abdousentore@gmail.com'
GROUP BY g.completed;
