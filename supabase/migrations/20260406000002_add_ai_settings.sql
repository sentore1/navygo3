-- Create AI settings table
CREATE TABLE IF NOT EXISTS ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    openai_api_key_configured BOOLEAN DEFAULT FALSE,
    ai_enabled BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    ai_provider VARCHAR(20) DEFAULT 'openai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO ai_settings (ai_enabled, ai_model, ai_provider)
VALUES (FALSE, 'gpt-3.5-turbo', 'openai')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view AI settings
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

-- Policy: Only admins can update AI settings
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

-- Add comment
COMMENT ON TABLE ai_settings IS 'Stores AI configuration settings for the application';
