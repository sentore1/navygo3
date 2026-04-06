-- Fix Leaderboard Visibility Issue
-- This script will help make the leaderboard visible on the landing page

-- Step 1: Check if leaderboard_view exists and has data
SELECT 
  'Checking leaderboard status...' as step,
  COUNT(*) as users_on_leaderboard
FROM public.leaderboard_view;

-- Step 2: Check users table for show_on_leaderboard column
SELECT 
  'Users with leaderboard enabled:' as info,
  COUNT(*) as count
FROM public.users 
WHERE show_on_leaderboard = true;

-- Step 3: Check total users
SELECT 
  'Total users in database:' as info,
  COUNT(*) as count
FROM public.users;

-- Step 4: Enable leaderboard for existing users (OPTIONAL - uncomment to run)
-- This will enable leaderboard for all users who have completed at least one goal
-- UPDATE public.users 
-- SET show_on_leaderboard = true
-- WHERE id IN (
--   SELECT DISTINCT user_id 
--   FROM public.goals 
--   WHERE progress > 0
-- );

-- Step 5: Enable leaderboard for your own account (REPLACE WITH YOUR EMAIL)
-- UPDATE public.users 
-- SET show_on_leaderboard = true
-- WHERE email = 'your-email@example.com';

-- Step 6: Add some test scores to users (OPTIONAL - for testing)
-- UPDATE public.users 
-- SET 
--   total_score = FLOOR(RANDOM() * 1000 + 100),
--   show_on_leaderboard = true
-- WHERE id IN (
--   SELECT id FROM public.users LIMIT 5
-- );

-- Step 7: Manually call the score update function for all users
-- DO $$
-- DECLARE
--   user_record RECORD;
-- BEGIN
--   FOR user_record IN SELECT id FROM public.users LOOP
--     PERFORM public.update_user_score(user_record.id);
--   END LOOP;
-- END $$;

-- Step 8: Verify the leaderboard view now has data
SELECT 
  id,
  name,
  total_score,
  rank_title,
  completed_goals,
  max_streak
FROM public.leaderboard_view
ORDER BY total_score DESC
LIMIT 10;

-- Step 9: If still empty, create sample leaderboard users
-- INSERT INTO public.users (
--   id,
--   email,
--   name,
--   show_on_leaderboard,
--   total_score,
--   rank_title,
--   token_identifier
-- ) VALUES
--   (gen_random_uuid(), 'demo1@example.com', 'Alex Johnson', true, 850, 'Lieutenant', gen_random_uuid()::text),
--   (gen_random_uuid(), 'demo2@example.com', 'Sarah Williams', true, 720, 'Sergeant', gen_random_uuid()::text),
--   (gen_random_uuid(), 'demo3@example.com', 'Mike Chen', true, 650, 'Sergeant', gen_random_uuid()::text),
--   (gen_random_uuid(), 'demo4@example.com', 'Emma Davis', true, 480, 'Corporal', gen_random_uuid()::text),
--   (gen_random_uuid(), 'demo5@example.com', 'James Brown', true, 320, 'Corporal', gen_random_uuid()::text)
-- ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 
  'Leaderboard check complete!' as status,
  'If count is 0, uncomment and run steps 4-6 or 9 to populate the leaderboard' as next_action;
