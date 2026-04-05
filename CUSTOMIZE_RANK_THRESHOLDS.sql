-- Customize Rank Thresholds
-- Use this script to easily adjust point requirements for each rank

-- ============================================
-- CURRENT THRESHOLDS (2x Harder)
-- ============================================
-- General:    10,000 points
-- Major:       7,000 points
-- Captain:     4,000 points
-- Lieutenant:  2,000 points
-- Sergeant:    1,200 points
-- Corporal:      600 points
-- Private:       300 points
-- Recruit:         0 points

-- ============================================
-- OPTION 1: Make it EVEN HARDER (3x Original)
-- ============================================
-- Uncomment this section to make ranks 3x harder than original

/*
CREATE OR REPLACE FUNCTION public.update_user_score(user_uuid UUID)
RETURNS void AS $$
DECLARE
  calculated_score INTEGER;
  rank_name TEXT;
BEGIN
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN g.progress = 100 THEN 100
        ELSE 0
      END +
      (SELECT COUNT(*) * 20 FROM milestones m WHERE m.goal_id = g.id AND m.completed = true) +
      (g.streak * 5)
    ), 0)
  INTO calculated_score
  FROM goals g
  WHERE g.user_id = user_uuid;

  rank_name := CASE
    WHEN calculated_score >= 15000 THEN 'General'      -- 3x harder
    WHEN calculated_score >= 10500 THEN 'Major'        -- 3x harder
    WHEN calculated_score >= 6000 THEN 'Captain'       -- 3x harder
    WHEN calculated_score >= 3000 THEN 'Lieutenant'    -- 3x harder
    WHEN calculated_score >= 1800 THEN 'Sergeant'      -- 3x harder
    WHEN calculated_score >= 900 THEN 'Corporal'       -- 3x harder
    WHEN calculated_score >= 450 THEN 'Private'        -- 3x harder
    ELSE 'Recruit'
  END;

  UPDATE public.users
  SET 
    total_score = calculated_score,
    rank_title = rank_name,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ============================================
-- OPTION 2: Make it SLIGHTLY EASIER (1.5x Original)
-- ============================================
-- Uncomment this section for moderate difficulty

/*
CREATE OR REPLACE FUNCTION public.update_user_score(user_uuid UUID)
RETURNS void AS $$
DECLARE
  calculated_score INTEGER;
  rank_name TEXT;
BEGIN
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN g.progress = 100 THEN 100
        ELSE 0
      END +
      (SELECT COUNT(*) * 20 FROM milestones m WHERE m.goal_id = g.id AND m.completed = true) +
      (g.streak * 5)
    ), 0)
  INTO calculated_score
  FROM goals g
  WHERE g.user_id = user_uuid;

  rank_name := CASE
    WHEN calculated_score >= 7500 THEN 'General'       -- 1.5x harder
    WHEN calculated_score >= 5250 THEN 'Major'         -- 1.5x harder
    WHEN calculated_score >= 3000 THEN 'Captain'       -- 1.5x harder
    WHEN calculated_score >= 1500 THEN 'Lieutenant'    -- 1.5x harder
    WHEN calculated_score >= 900 THEN 'Sergeant'       -- 1.5x harder
    WHEN calculated_score >= 450 THEN 'Corporal'       -- 1.5x harder
    WHEN calculated_score >= 225 THEN 'Private'        -- 1.5x harder
    ELSE 'Recruit'
  END;

  UPDATE public.users
  SET 
    total_score = calculated_score,
    rank_title = rank_name,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ============================================
-- OPTION 3: CUSTOM THRESHOLDS
-- ============================================
-- Edit the numbers below to your preference

CREATE OR REPLACE FUNCTION public.update_user_score(user_uuid UUID)
RETURNS void AS $$
DECLARE
  calculated_score INTEGER;
  rank_name TEXT;
BEGIN
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN g.progress = 100 THEN 100
        ELSE 0
      END +
      (SELECT COUNT(*) * 20 FROM milestones m WHERE m.goal_id = g.id AND m.completed = true) +
      (g.streak * 5)
    ), 0)
  INTO calculated_score
  FROM goals g
  WHERE g.user_id = user_uuid;

  -- ⚠️ EDIT THESE NUMBERS TO CUSTOMIZE RANK THRESHOLDS ⚠️
  rank_name := CASE
    WHEN calculated_score >= 10000 THEN 'General'      -- Change this number
    WHEN calculated_score >= 7000 THEN 'Major'         -- Change this number
    WHEN calculated_score >= 4000 THEN 'Captain'       -- Change this number
    WHEN calculated_score >= 2000 THEN 'Lieutenant'    -- Change this number
    WHEN calculated_score >= 1200 THEN 'Sergeant'      -- Change this number
    WHEN calculated_score >= 600 THEN 'Corporal'       -- Change this number
    WHEN calculated_score >= 300 THEN 'Private'        -- Change this number
    ELSE 'Recruit'
  END;

  UPDATE public.users
  SET 
    total_score = calculated_score,
    rank_title = rank_name,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AFTER CHANGING THRESHOLDS, RUN THIS:
-- ============================================

-- Recalculate all user ranks
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    PERFORM public.update_user_score(user_record.id);
  END LOOP;
END $$;

-- Show new rank distribution
SELECT 
  rank_title,
  COUNT(*) as user_count,
  MIN(total_score) as min_score,
  MAX(total_score) as max_score
FROM public.users
WHERE show_on_leaderboard = true
GROUP BY rank_title
ORDER BY MAX(total_score) DESC;

-- ============================================
-- SCORING SYSTEM EXPLANATION
-- ============================================
-- Users earn points from:
-- - Completed Goal: 100 points
-- - Completed Milestone: 20 points each
-- - Streak Day: 5 points per day
--
-- Example: A user with:
-- - 10 completed goals = 1,000 points
-- - 50 milestones = 1,000 points
-- - 100 day streak = 500 points
-- Total = 2,500 points (Lieutenant rank with current thresholds)

-- ============================================
-- TIPS FOR BALANCING
-- ============================================
-- 1. General should be VERY rare (top 1-5% of users)
-- 2. Major should be rare (top 10% of users)
-- 3. Captain should be achievable for dedicated users
-- 4. Lieutenant/Sergeant should be common for active users
-- 5. Most new users will be Recruit/Private/Corporal

-- Check current distribution:
SELECT 
  rank_title,
  COUNT(*) as users,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE show_on_leaderboard = true), 1) as percentage
FROM users
WHERE show_on_leaderboard = true
GROUP BY rank_title
ORDER BY MAX(total_score) DESC;
