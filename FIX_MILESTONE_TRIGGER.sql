-- Fix the milestone trigger to get user_id from goals table

-- Drop the existing trigger
DROP TRIGGER IF EXISTS update_score_on_milestone_change ON public.milestones;

-- Create a new trigger function that gets user_id from goals
CREATE OR REPLACE FUNCTION public.trigger_update_user_score_from_milestone()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from the associated goal
  SELECT user_id INTO v_user_id
  FROM public.goals
  WHERE id = NEW.goal_id;
  
  -- Update the user's score
  IF v_user_id IS NOT NULL THEN
    PERFORM public.update_user_score(v_user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with the new function
CREATE TRIGGER update_score_on_milestone_change
  AFTER INSERT OR UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_user_score_from_milestone();

-- Test: Try inserting a milestone now
SELECT 'Trigger fixed! Try creating a goal with milestones now.' as status;
