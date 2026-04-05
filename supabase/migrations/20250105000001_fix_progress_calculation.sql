-- Function to recalculate goal progress based on milestones
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goals
  SET progress = (
    SELECT CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE completed = true)::DECIMAL / COUNT(*)) * 100)
    END
    FROM milestones
    WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id)
  ),
  last_updated = NOW()
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS milestone_progress_update ON milestones;

-- Create trigger to update progress when milestones change
CREATE TRIGGER milestone_progress_update
AFTER INSERT OR UPDATE OR DELETE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress();
