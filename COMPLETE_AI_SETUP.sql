-- COMPLETE AI SETUP - Run this to enable all AI providers
-- This script does everything needed in one go

-- Step 1: Add ai_provider column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_settings' 
        AND column_name = 'ai_provider'
    ) THEN
        ALTER TABLE ai_settings 
        ADD COLUMN ai_provider VARCHAR(20) DEFAULT 'openai';
        RAISE NOTICE '✓ Added ai_provider column';
    ELSE
        RAISE NOTICE '✓ ai_provider column already exists';
    END IF;
END $$;

-- Step 2: Ensure ai_settings table exists with all columns
CREATE TABLE IF NOT EXISTS ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    openai_api_key_configured BOOLEAN DEFAULT FALSE,
    ai_enabled BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    ai_provider VARCHAR(20) DEFAULT 'openai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Insert default settings if none exist
INSERT INTO ai_settings (ai_enabled, ai_model, ai_provider)
VALUES (FALSE, 'gpt-3.5-turbo', 'openai')
ON CONFLICT DO NOTHING;

-- Step 4: Update existing records to have openai as default provider
UPDATE ai_settings 
SET ai_provider = 'openai' 
WHERE ai_provider IS NULL;

-- Step 5: Enable RLS if not already enabled
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies if they don't exist
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Admins can view AI settings" ON ai_settings;
    DROP POLICY IF EXISTS "Admins can update AI settings" ON ai_settings;

    -- Create view policy
    CREATE POLICY "Admins can view AI settings"
        ON ai_settings
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    -- Create update policy
    CREATE POLICY "Admins can update AI settings"
        ON ai_settings
        FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    RAISE NOTICE '✓ Created RLS policies';
END $$;

-- Step 7: Verify the setup
SELECT 
    '=== AI SETTINGS VERIFICATION ===' as status,
    '' as separator;

-- Show table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_settings'
ORDER BY ordinal_position;

-- Show current settings
SELECT 
    'Current Settings' as check_type,
    id,
    ai_enabled,
    ai_model,
    ai_provider,
    created_at
FROM ai_settings;

-- Show RLS status
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'ai_settings';

-- Show policies
SELECT 
    'Policies' as check_type,
    policyname,
    cmd as command
FROM pg_policies 
WHERE tablename = 'ai_settings';

-- Final success message
SELECT 
    '✓ SETUP COMPLETE!' as status,
    'Now refresh your admin settings page' as next_step;
