-- Update the API key configuration status
-- This tells the database which API keys are configured
-- Note: The actual API keys are stored in environment variables, not in the database

-- Update OpenAI API key status to true (since you have OPENAI_API_KEY in .env.local)
UPDATE ai_settings 
SET openai_api_key_configured = true
WHERE id = '804d3e9d-71b7-4341-9a60-cf3c7e838942';

-- Verify the update
SELECT 
    id,
    ai_enabled,
    ai_model,
    ai_provider,
    openai_api_key_configured,
    grok_api_key_configured,
    gemini_api_key_configured
FROM ai_settings;

-- Note: When you add GROK_API_KEY or GEMINI_API_KEY to your .env.local,
-- you'll need to update those columns too:
-- UPDATE ai_settings SET grok_api_key_configured = true;
-- UPDATE ai_settings SET gemini_api_key_configured = true;
