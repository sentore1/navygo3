-- Run this to add the display_name feature to your leaderboard
-- This allows users to customize their name on the leaderboard

-- Step 1: Add display_name column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Step 2: Update the leaderboard view to use display_name
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

-- Step 3: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'display_name';

-- Success message
SELECT 'Display name feature added successfully! Users can now customize their leaderboard name in Settings > Privacy.' as status;
