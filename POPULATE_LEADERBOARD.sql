-- Quick Script to Populate Leaderboard with Sample Data
-- Run this in Supabase SQL Editor to make the leaderboard visible

-- Option 1: Enable leaderboard for your existing account
-- REPLACE 'your-email@example.com' with your actual email
UPDATE public.users 
SET 
  show_on_leaderboard = true,
  total_score = 500,
  rank_title = 'Sergeant'
WHERE email = 'your-email@example.com';

-- Option 2: Create demo users for the leaderboard (recommended for testing)
-- First, delete any existing demo users to avoid duplicates
DELETE FROM public.users WHERE email LIKE '%@demo.com';

-- Now insert fresh demo users
INSERT INTO public.users (
  id,
  email,
  name,
  show_on_leaderboard,
  total_score,
  rank_title,
  token_identifier,
  avatar_url
) VALUES
  (
    gen_random_uuid(), 
    'alex.johnson@demo.com', 
    'Alex Johnson', 
    true, 
    1250, 
    'Lieutenant', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
  ),
  (
    gen_random_uuid(), 
    'sarah.williams@demo.com', 
    'Sarah Williams', 
    true, 
    980, 
    'Sergeant', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
  ),
  (
    gen_random_uuid(), 
    'mike.chen@demo.com', 
    'Mike Chen', 
    true, 
    850, 
    'Sergeant', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
  ),
  (
    gen_random_uuid(), 
    'emma.davis@demo.com', 
    'Emma Davis', 
    true, 
    720, 
    'Corporal', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=emma'
  ),
  (
    gen_random_uuid(), 
    'james.brown@demo.com', 
    'James Brown', 
    true, 
    650, 
    'Corporal', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=james'
  ),
  (
    gen_random_uuid(), 
    'lisa.martinez@demo.com', 
    'Lisa Martinez', 
    true, 
    580, 
    'Corporal', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'
  ),
  (
    gen_random_uuid(), 
    'david.kim@demo.com', 
    'David Kim', 
    true, 
    420, 
    'Corporal', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
  ),
  (
    gen_random_uuid(), 
    'rachel.lee@demo.com', 
    'Rachel Lee', 
    true, 
    350, 
    'Corporal', 
    gen_random_uuid()::text,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=rachel'
  );

-- Option 3: Add some goals to demo users to make it more realistic
INSERT INTO public.goals (
  id,
  user_id,
  title,
  description,
  progress,
  streak,
  created_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  'Complete Daily Workout',
  'Exercise for 30 minutes every day',
  100,
  FLOOR(RANDOM() * 20 + 5)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '30 days')
FROM public.users u
WHERE u.email LIKE '%@demo.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.goals g WHERE g.user_id = u.id
  )
LIMIT 8;

-- Verify the leaderboard now has data
SELECT 
  'Leaderboard populated successfully!' as status,
  COUNT(*) as total_users_on_leaderboard
FROM public.leaderboard_view;

-- Show the top 10
SELECT 
  name,
  total_score,
  rank_title,
  completed_goals
FROM public.leaderboard_view
ORDER BY total_score DESC
LIMIT 10;
