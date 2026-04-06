-- Quick fix: Just add the missing columns
-- This is the most likely issue

ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goals'
ORDER BY ordinal_position;
