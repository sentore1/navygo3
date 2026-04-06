-- Complete Fix for Avatar Display on Leaderboard
-- Run this script to ensure avatars work properly

-- Step 1: Recreate the leaderboard view with avatar_url
DROP VIEW IF EXISTS public.leaderboard_view;

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

-- Step 2: Grant permissions
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;

-- Step 3: Verify the view includes avatar_url
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'leaderboard_view'
ORDER BY ordinal_position;

-- Step 4: Test query - check if avatars are in the view
SELECT 
  name,
  avatar_url,
  total_score,
  rank_title
FROM public.leaderboard_view
LIMIT 5;

-- Step 5: Set default avatars for users without one
UPDATE public.users
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || COALESCE(name, email)
WHERE show_on_leaderboard = true 
  AND (avatar_url IS NULL OR avatar_url = '');

-- Step 6: Verify all leaderboard users now have avatars
SELECT 
  name,
  CASE 
    WHEN avatar_url IS NULL OR avatar_url = '' THEN '❌ Missing'
    ELSE '✅ Has Avatar'
  END as avatar_status,
  LEFT(avatar_url, 50) as avatar_preview
FROM public.users
WHERE show_on_leaderboard = true
ORDER BY total_score DESC;

-- Success message
SELECT 
  'Avatar fix complete! ✅' as status,
  COUNT(*) as total_leaderboard_users,
  COUNT(CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 END) as users_with_avatars
FROM public.users
WHERE show_on_leaderboard = true;
