-- Add support for all AI providers (Grok and Gemini)
-- This migration adds the missing API key configuration columns

-- Add grok_api_key_configured column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_settings' 
        AND column_name = 'grok_api_key_configured'
    ) THEN
        ALTER TABLE ai_settings 
        ADD COLUMN grok_api_key_configured BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added grok_api_key_configured column';
    END IF;
END $$;

-- Add gemini_api_key_configured column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_settings' 
        AND column_name = 'gemini_api_key_configured'
    ) THEN
        ALTER TABLE ai_settings 
        ADD COLUMN gemini_api_key_configured BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added gemini_api_key_configured column';
    END IF;
END $$;

-- Verify all columns exist
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ai_settings'
AND column_name IN ('openai_api_key_configured', 'grok_api_key_configured', 'gemini_api_key_configured')
ORDER BY column_name;

-- Show current settings
SELECT 
    id,
    ai_enabled,
    ai_model,
    ai_provider,
    openai_api_key_configured,
    grok_api_key_configured,
    gemini_api_key_configured
FROM ai_settings;
