-- Add last_login_at column to users table for tracking inactive users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster queries on last_login_at
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);

-- Create a function to update last_login_at
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_login_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_login_at when user logs progress or views dashboard
-- This assumes you have a user_activity or similar table
-- Adjust based on your actual schema

-- Add user_stats table if it doesn't exist (for streak tracking)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_activity ON user_stats(last_activity_date);

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get current stats
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM user_stats
  WHERE user_id = p_user_id;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE);
    RETURN;
  END IF;

  -- Check if activity is today
  IF v_last_activity = CURRENT_DATE THEN
    -- Already logged today, no change
    RETURN;
  END IF;

  -- Check if activity was yesterday (streak continues)
  IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSE
    -- Streak broken, reset to 1
    v_current_streak := 1;
  END IF;

  -- Update stats
  UPDATE user_stats
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_streak TO authenticated;
