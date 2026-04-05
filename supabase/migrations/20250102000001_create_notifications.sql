-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to create notification when milestone is completed
CREATE OR REPLACE FUNCTION notify_milestone_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    SELECT g.user_id INTO v_user_id FROM goals g WHERE g.id = NEW.goal_id;
    SELECT u.email INTO v_email FROM auth.users u WHERE u.id = v_user_id;
    
    INSERT INTO notifications (user_id, type, title, message, goal_id, milestone_id)
    VALUES (v_user_id, 'milestone_completed', 'Milestone Completed! 🎉', 
            'You completed: ' || NEW.title, NEW.goal_id, NEW.id);
    
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-notification-email',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')),
      body := jsonb_build_object('email', v_email, 'title', 'Milestone Completed! 🎉', 'message', 'You completed: ' || NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestone_completed_trigger
AFTER UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION notify_milestone_completed();

-- Function to create notification when goal reaches 100%
CREATE OR REPLACE FUNCTION notify_goal_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF NEW.progress = 100 AND OLD.progress < 100 THEN
    SELECT u.email INTO v_email FROM auth.users u WHERE u.id = NEW.user_id;
    
    INSERT INTO notifications (user_id, type, title, message, goal_id)
    VALUES (NEW.user_id, 'goal_completed', 'Goal Completed! 🏆', 
            'Congratulations! You completed: ' || NEW.title, NEW.id);
    
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-notification-email',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')),
      body := jsonb_build_object('email', v_email, 'title', 'Goal Completed! 🏆', 'message', 'Congratulations! You completed: ' || NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_completed_trigger
AFTER UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION notify_goal_completed();

alter publication supabase_realtime add table notifications;
