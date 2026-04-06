-- ============================================
-- COPY AND RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Add role column to users table (simple version)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 3: Create payment gateway settings table
CREATE TABLE IF NOT EXISTS payment_gateway_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Insert default payment gateways
INSERT INTO payment_gateway_settings (gateway_name, is_enabled, config)
VALUES 
  ('stripe', true, '{}'::jsonb),
  ('kpay', true, '{}'::jsonb),
  ('polar', false, '{}'::jsonb)
ON CONFLICT (gateway_name) DO NOTHING;

-- Step 5: Enable RLS for payment_gateway_settings
ALTER TABLE payment_gateway_settings ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admins can view payment gateway settings" ON payment_gateway_settings;
DROP POLICY IF EXISTS "Only admins can update payment gateway settings" ON payment_gateway_settings;

-- Step 7: Create policies for admin access
CREATE POLICY "Only admins can view payment gateway settings" ON payment_gateway_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update payment gateway settings" ON payment_gateway_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- AFTER RUNNING THE ABOVE, RUN THIS SEPARATELY:
-- ============================================

-- Make yourself an admin (REPLACE WITH YOUR EMAIL!)
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- Verify it worked:
-- SELECT id, email, role FROM users WHERE role = 'admin';
