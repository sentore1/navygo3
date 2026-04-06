-- Fix milestone system to use relational table instead of JSONB

-- Drop the JSONB milestones column if it exists (optional cleanup)
-- ALTER TABLE goals DROP COLUMN IF EXISTS milestones;

-- Ensure the milestones table has the correct structure
ALTER TABLE milestones 
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Recreate the progress calculation function with better logic
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  goal_id_to_update UUID;
BEGIN
  -- Determine which goal to update
  IF TG_OP = 'DELETE' THEN
    goal_id_to_update := OLD.goal_id;
  ELSE
    goal_id_to_update := NEW.goal_id;
  END IF;

  -- Update the goal's progress based on milestone completion
  UPDATE goals
  SET 
    progress = (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE completed = true)::DECIMAL / COUNT(*)) * 100)
      END
      FROM milestones
      WHERE goal_id = goal_id_to_update
    ),
    last_updated = NOW()
  WHERE id = goal_id_to_update;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS milestone_progress_update ON milestones;

CREATE TRIGGER milestone_progress_update
AFTER INSERT OR UPDATE OR DELETE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_completed ON milestones(completed);
