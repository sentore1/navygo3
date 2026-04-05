-- Debug Avatar Display Issue
-- This script helps diagnose why avatars aren't showing on the leaderboard

-- Step 1: Check your user's avatar_url in the database
-- REPLACE 'your-email@example.com' with your actual email
SELECT 
  id,
  name,
  email,
  avatar_url,
  show_on_leaderboard,
  total_score,
  rank_title
FROM public.users
WHERE email = 'your-email@example.com';

-- Step 2: Check what the leaderboard_view returns
SELECT 
  id,
  name,
  avatar_url,
  total_score,
  rank_title
FROM public.leaderboard_view
LIMIT 10;

-- Step 3: Check if avatar_url is NULL or empty for leaderboard users
SELECT 
  name,
  CASE 
    WHEN avatar_url IS NULL THEN 'NULL'
    WHEN avatar_url = '' THEN 'EMPTY STRING'
    ELSE 'HAS VALUE'
  END as avatar_status,
  avatar_url
FROM public.users
WHERE show_on_leaderboard = true;

-- Step 4: Update the leaderboard view to ensure it includes avatar_url
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  u.id,
  COALESCE(NULLIF(u.display_name, ''), u.name) as name,
  u.avatar_url,
  u.total_score,
  u.rank_title,
  u.created_at,
  COUNT(DISTINCT g.id) as completed_goals,
  COALESCE(MAX(g.streak), 0) as max_streak
FROM public.users u
LEFT JOIN public.goals g ON g.user_id = u.id AND g.progress = 100
WHERE u.show_on_leaderboard = true
GROUP BY u.id, u.name, u.display_name, u.avatar_url, u.total_score, u.rank_title, u.created_at
ORDER BY u.total_score DESC;

-- Step 5: Test setting an avatar for your user
-- REPLACE 'your-email@example.com' with your actual email
-- REPLACE the avatar URL with your chosen avatar
UPDATE public.users
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=test123'
WHERE email = 'your-email@example.com';

-- Step 6: Verify the update worked
SELECT 
  name,
  avatar_url,
  show_on_leaderboard
FROM public.users
WHERE email = 'your-email@example.com';

-- Step 7: Check the leaderboard view again
SELECT 
  name,
  avatar_url,
  total_score,
  rank_title
FROM public.leaderboard_view
WHERE name LIKE '%your-name%';

-- Success message
SELECT 
  'Avatar debug complete!' as status,
  'Check the results above to see if avatar_url is populated' as next_step;
