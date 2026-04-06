-- Verification script to check database structure

-- Check if goals table has correct columns
DO $$
BEGIN
  -- Check for milestones JSONB column (should exist but not be used)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'milestones'
  ) THEN
    RAISE NOTICE 'INFO: goals.milestones JSONB column exists (not used in new system)';
  END IF;

  -- Check for target_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'target_date'
  ) THEN
    ALTER TABLE goals ADD COLUMN target_date TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'ADDED: goals.target_date column';
  END IF;

  -- Check for notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'notes'
  ) THEN
    ALTER TABLE goals ADD COLUMN notes JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'ADDED: goals.notes column';
  END IF;
END $$;

-- Verify milestones table structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'milestones' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE milestones ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'ADDED: milestones.completed_at column';
  END IF;
END $$;

-- Show current structure
SELECT 
  'goals' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;

SELECT 
  'milestones' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'milestones'
ORDER BY ordinal_position;

-- Show triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('goals', 'milestones');
