-- Check Leaderboard Ranks
-- This script helps you verify that users have ranks assigned

-- Step 1: Check all users with leaderboard enabled
SELECT 
  name,
  total_score,
  rank_title,
  show_on_leaderboard,
  created_at
FROM public.users
WHERE show_on_leaderboard = true
ORDER BY total_score DESC;

-- Step 2: Check if any users are missing ranks
SELECT 
  COUNT(*) as users_without_ranks
FROM public.users
WHERE show_on_leaderboard = true 
  AND (rank_title IS NULL OR rank_title = '');

-- Step 3: Update ranks for all users (run this if ranks are missing)
-- This will recalculate scores and assign ranks
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    PERFORM public.update_user_score(user_record.id);
  END LOOP;
END $$;

-- Step 4: Verify ranks were assigned
SELECT 
  rank_title,
  COUNT(*) as user_count,
  MIN(total_score) as min_score,
  MAX(total_score) as max_score
FROM public.users
WHERE show_on_leaderboard = true
GROUP BY rank_title
ORDER BY MAX(total_score) DESC;

-- Step 5: Check the leaderboard view (what users see)
SELECT 
  name,
  total_score,
  rank_title,
  completed_goals,
  max_streak
FROM public.leaderboard_view
LIMIT 10;

-- Success message
SELECT 
  'Rank check complete!' as status,
  COUNT(*) as total_users_on_leaderboard,
  COUNT(CASE WHEN rank_title IS NOT NULL THEN 1 END) as users_with_ranks
FROM public.users
WHERE show_on_leaderboard = true;
