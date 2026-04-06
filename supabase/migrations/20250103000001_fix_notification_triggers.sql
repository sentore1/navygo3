-- Fix notification triggers to not fail on http_post errors
CREATE OR REPLACE FUNCTION notify_milestone_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    SELECT g.user_id INTO v_user_id FROM goals g WHERE g.id = NEW.goal_id;
    
    INSERT INTO notifications (user_id, type, title, message, goal_id, milestone_id)
    VALUES (v_user_id, 'milestone_completed', 'Milestone Completed! 🎉', 
            'You completed: ' || NEW.title, NEW.goal_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_goal_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.progress = 100 AND OLD.progress < 100 THEN
    INSERT INTO notifications (user_id, type, title, message, goal_id)
    VALUES (NEW.user_id, 'goal_completed', 'Goal Completed! 🏆', 
            'Congratulations! You completed: ' || NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
