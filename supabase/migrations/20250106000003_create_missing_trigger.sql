-- Create the missing trigger function and trigger

-- Create the function
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  goal_id_to_update UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    goal_id_to_update := OLD.goal_id;
  ELSE
    goal_id_to_update := NEW.goal_id;
  END IF;

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

-- Create the trigger
DROP TRIGGER IF EXISTS milestone_progress_update ON milestones;

CREATE TRIGGER milestone_progress_update
AFTER INSERT OR UPDATE OR DELETE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress();

-- Verify it was created
SELECT 'Trigger created successfully' as status;
