-- Setup Groq as the AI provider
-- Run this in Supabase SQL Editor

-- First, check if ai_settings table exists and has data
SELECT * FROM ai_settings;

-- If no data exists, insert default settings with Groq
INSERT INTO ai_settings (ai_enabled, ai_model, ai_provider, created_at, updated_at)
VALUES (true, 'llama-3.3-70b-versatile', 'groq', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET 
  ai_enabled = true,
  ai_model = 'llama-3.3-70b-versatile',
  ai_provider = 'groq',
  updated_at = NOW();

-- Verify the settings
SELECT * FROM ai_settings;
