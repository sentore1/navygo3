-- Add display_name column for leaderboard customization
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update the leaderboard view to use display_name if available, fallback to name
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

-- Add comment for clarity
COMMENT ON COLUMN public.users.display_name IS 'Custom name to display on leaderboard. If null or empty, falls back to regular name.';
