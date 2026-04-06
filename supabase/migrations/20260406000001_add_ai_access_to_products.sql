-- Add AI access field to polar_subscriptions table
-- This allows admins to control which products grant AI features

-- Add has_ai_access column to polar_subscriptions
ALTER TABLE polar_subscriptions 
ADD COLUMN IF NOT EXISTS has_ai_access BOOLEAN DEFAULT false;

-- Create a new table to track which Polar products include AI access
CREATE TABLE IF NOT EXISTS polar_product_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL UNIQUE,
    product_name TEXT,
    has_ai_access BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE polar_product_features ENABLE ROW LEVEL SECURITY;

-- Admin can manage product features
CREATE POLICY "Admins can manage product features"
ON polar_product_features
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Everyone can read product features
CREATE POLICY "Anyone can read product features"
ON polar_product_features
FOR SELECT
TO authenticated
USING (true);

-- Set Delta Goal to have AI access by default
INSERT INTO polar_product_features (product_id, product_name, has_ai_access)
VALUES 
    ('delta-goal', 'Delta Goal', true),
    ('navy-goal', 'Navy goal', false)
ON CONFLICT (product_id) 
DO UPDATE SET 
    has_ai_access = EXCLUDED.has_ai_access,
    updated_at = NOW();

-- Create function to update has_ai_access on polar_subscriptions when product features change
CREATE OR REPLACE FUNCTION update_subscription_ai_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all active subscriptions for this product
    UPDATE polar_subscriptions
    SET has_ai_access = NEW.has_ai_access
    WHERE product_id = NEW.product_id
    AND status = 'active';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update subscriptions when product features change
DROP TRIGGER IF EXISTS trigger_update_subscription_ai_access ON polar_product_features;
CREATE TRIGGER trigger_update_subscription_ai_access
AFTER INSERT OR UPDATE ON polar_product_features
FOR EACH ROW
EXECUTE FUNCTION update_subscription_ai_access();

-- Update existing subscriptions based on product features
UPDATE polar_subscriptions ps
SET has_ai_access = pf.has_ai_access
FROM polar_product_features pf
WHERE ps.product_id = pf.product_id
AND ps.status = 'active';

COMMENT ON TABLE polar_product_features IS 'Tracks which Polar products include specific features like AI access';
COMMENT ON COLUMN polar_product_features.has_ai_access IS 'Whether this product grants access to AI goal creation';
COMMENT ON COLUMN polar_subscriptions.has_ai_access IS 'Whether this subscription includes AI access (synced from product features)';
