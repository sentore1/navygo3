-- Initialize leaderboard scores for all existing users
-- Run this after applying the migration

-- Update scores for all users based on their goals
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    PERFORM public.update_user_score(user_record.id);
  END LOOP;
END $$;

-- Verify the results
SELECT 
  name,
  total_score,
  rank_title,
  show_on_leaderboard,
  (SELECT COUNT(*) FROM goals WHERE user_id = users.id AND progress = 100) as completed_goals
FROM public.users
ORDER BY total_score DESC
LIMIT 20;
