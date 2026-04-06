-- Add milestones column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb;
