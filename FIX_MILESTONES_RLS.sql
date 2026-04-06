-- Fix milestones RLS policies to allow edge function to insert

-- Check current policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'milestones';

-- Drop and recreate the INSERT policy to be more permissive
DROP POLICY IF EXISTS "Users can insert milestones for their goals" ON milestones;

CREATE POLICY "Users can insert milestones for their goals"
  ON milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = milestones.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Also ensure service role can bypass RLS
-- Service role should already bypass RLS, but let's verify the policy is correct

-- Verify the policies
SELECT 
  'Updated policies' as info,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'milestones';
