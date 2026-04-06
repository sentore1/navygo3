-- Run in Supabase SQL Editor

-- Option 1: Fix RLS to allow inserts
DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;
CREATE POLICY "Allow insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Option 2: Or disable the trigger temporarily
-- DROP TRIGGER IF EXISTS goal_completed_notification ON goals;
