-- Fix goals table structure by adding missing columns
-- Run this in your Supabase SQL Editor

-- Add target_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'target_date'
  ) THEN
    ALTER TABLE goals ADD COLUMN target_date TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added target_date column to goals table';
  ELSE
    RAISE NOTICE 'target_date column already exists';
  END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'notes'
  ) THEN
    ALTER TABLE goals ADD COLUMN notes JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added notes column to goals table';
  ELSE
    RAISE NOTICE 'notes column already exists';
  END IF;
END $$;

-- Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'goals'
ORDER BY ordinal_position;
