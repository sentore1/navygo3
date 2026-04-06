-- Complete Rank System with Elite Military Ranks
-- Combines harder thresholds + elite ranks (Field Marshal, Commander, Supreme Commander)

-- Update the rank calculation function with complete rank hierarchy
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

  -- Determine rank with COMPLETE 11-RANK HIERARCHY
  rank_name := CASE
    WHEN calculated_score >= 30000 THEN 'Supreme Commander'  -- Ultimate achievement
    WHEN calculated_score >= 20000 THEN 'Commander'          -- Command level
    WHEN calculated_score >= 15000 THEN 'Field Marshal'      -- Marshal status
    WHEN calculated_score >= 10000 THEN 'General'            -- Elite performer (2x harder)
    WHEN calculated_score >= 7000 THEN 'Major'               -- Outstanding achiever (2x harder)
    WHEN calculated_score >= 4000 THEN 'Captain'             -- Exceptional leader (2x harder)
    WHEN calculated_score >= 2000 THEN 'Lieutenant'          -- Dedicated achiever (2x harder)
    WHEN calculated_score >= 1200 THEN 'Sergeant'            -- Committed performer (2x harder)
    WHEN calculated_score >= 600 THEN 'Corporal'             -- Rising star (2x harder)
    WHEN calculated_score >= 300 THEN 'Private'              -- Getting started (2x harder)
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

-- Recalculate all user ranks with new complete system
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    PERFORM public.update_user_score(user_record.id);
  END LOOP;
END $$;

-- Show the new rank distribution
SELECT 
  rank_title,
  COUNT(*) as user_count,
  MIN(total_score) as min_score,
  MAX(total_score) as max_score
FROM public.users
WHERE show_on_leaderboard = true
GROUP BY rank_title
ORDER BY MAX(total_score) DESC;

-- Display complete rank hierarchy
SELECT 
  '✅ Complete 11-Rank System Applied' as status,
  '30,000 points for Supreme Commander (NEW - Ultimate)' as rank_11,
  '20,000 points for Commander (NEW - Command)' as rank_10,
  '15,000 points for Field Marshal (NEW - Marshal)' as rank_9,
  '10,000 points for General (Elite - 2x harder)' as rank_8,
  '7,000 points for Major (2x harder)' as rank_7,
  '4,000 points for Captain (2x harder)' as rank_6,
  '2,000 points for Lieutenant (2x harder)' as rank_5,
  '1,200 points for Sergeant (2x harder)' as rank_4,
  '600 points for Corporal (2x harder)' as rank_3,
  '300 points for Private (2x harder)' as rank_2,
  '0 points for Recruit' as rank_1;
