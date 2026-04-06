-- Add leaderboard visibility setting to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank_title TEXT DEFAULT 'Recruit';

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_leaderboard 
ON public.users(show_on_leaderboard, total_score DESC) 
WHERE show_on_leaderboard = true;

-- Create a view for leaderboard data (only public info)
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  u.id,
  u.name,
  u.avatar_url,
  u.total_score,
  u.rank_title,
  u.created_at,
  COUNT(DISTINCT g.id) as completed_goals,
  COALESCE(MAX(g.streak), 0) as max_streak
FROM public.users u
LEFT JOIN public.goals g ON g.user_id = u.id AND g.progress = 100
WHERE u.show_on_leaderboard = true
GROUP BY u.id, u.name, u.avatar_url, u.total_score, u.rank_title, u.created_at
ORDER BY u.total_score DESC;

-- Grant access to authenticated users
GRANT SELECT ON public.leaderboard_view TO authenticated;

-- Create RLS policy for leaderboard view
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view users who opted into leaderboard
DROP POLICY IF EXISTS "Public leaderboard visibility" ON public.users;
CREATE POLICY "Public leaderboard visibility"
  ON public.users FOR SELECT
  USING (show_on_leaderboard = true OR auth.uid() = id);

-- Function to update user score (call this when goals/milestones change)
CREATE OR REPLACE FUNCTION public.update_user_score(user_uuid UUID)
RETURNS void AS $$
DECLARE
  calculated_score INTEGER;
  rank_name TEXT;
BEGIN
  -- Calculate score based on goals, milestones, and streaks
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN g.progress = 100 THEN 100 -- Completed goal
        ELSE 0
      END +
      (SELECT COUNT(*) * 20 FROM milestones m WHERE m.goal_id = g.id AND m.completed = true) + -- Milestones
      (g.streak * 5) -- Streak bonus
    ), 0)
  INTO calculated_score
  FROM goals g
  WHERE g.user_id = user_uuid;

  -- Determine rank based on score
  rank_name := CASE
    WHEN calculated_score >= 5000 THEN 'General'
    WHEN calculated_score >= 3500 THEN 'Major'
    WHEN calculated_score >= 2000 THEN 'Captain'
    WHEN calculated_score >= 1000 THEN 'Lieutenant'
    WHEN calculated_score >= 600 THEN 'Sergeant'
    WHEN calculated_score >= 300 THEN 'Corporal'
    WHEN calculated_score >= 150 THEN 'Private'
    ELSE 'Recruit'
  END;

  -- Update user record
  UPDATE public.users
  SET 
    total_score = calculated_score,
    rank_title = rank_name,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update score when goals change
CREATE OR REPLACE FUNCTION public.trigger_update_user_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_user_score(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_score_on_goal_change ON public.goals;
CREATE TRIGGER update_score_on_goal_change
  AFTER INSERT OR UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_user_score();

DROP TRIGGER IF EXISTS update_score_on_milestone_change ON public.milestones;
CREATE TRIGGER update_score_on_milestone_change
  AFTER INSERT OR UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_user_score();
