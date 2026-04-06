-- Add AI provider support to existing ai_settings table
-- Run this in Supabase SQL Editor

-- Add ai_provider column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_settings' 
        AND column_name = 'ai_provider'
    ) THEN
        ALTER TABLE ai_settings 
        ADD COLUMN ai_provider VARCHAR(20) DEFAULT 'openai';
        
        RAISE NOTICE 'Added ai_provider column';
    ELSE
        RAISE NOTICE 'ai_provider column already exists';
    END IF;
END $$;

-- Update existing records to have openai as default provider
UPDATE ai_settings 
SET ai_provider = 'openai' 
WHERE ai_provider IS NULL;

-- Verify the change
SELECT 
    id,
    ai_enabled,
    ai_model,
    ai_provider,
    created_at
FROM ai_settings;

-- Show success message
SELECT 'AI provider support added successfully!' as status;
