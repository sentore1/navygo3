-- Fix the goals table to properly reference auth.users instead of public.users
-- This is likely the cause of the 400 error

-- First, check current structure
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'goals'
ORDER BY ordinal_position;

-- Drop the existing foreign key constraint if it exists
DO $$ 
BEGIN
  -- Drop old constraint if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%goals_user_id%' 
      AND table_name = 'goals'
  ) THEN
    ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
    RAISE NOTICE 'Dropped old foreign key constraint';
  END IF;
END $$;

-- Recreate the foreign key to reference auth.users
ALTER TABLE goals 
  ADD CONSTRAINT goals_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Add missing columns if they don't exist
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;

-- Verify the structure
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'goals' 
  AND tc.constraint_type = 'FOREIGN KEY';
