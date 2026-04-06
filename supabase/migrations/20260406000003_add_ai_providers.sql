-- Add AI provider support (Grok, Gemini, OpenAI)
-- This migration adds the ai_provider column if it doesn't exist

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
    END IF;
END $$;

-- Update existing records to have openai as default provider
UPDATE ai_settings 
SET ai_provider = 'openai' 
WHERE ai_provider IS NULL;

-- Add comment
COMMENT ON COLUMN ai_settings.ai_provider IS 'AI provider: openai, grok, or gemini';
