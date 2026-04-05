-- Add role column to users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add payment gateway settings table
CREATE TABLE IF NOT EXISTS payment_gateway_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default payment gateways
INSERT INTO payment_gateway_settings (gateway_name, is_enabled, config)
VALUES 
  ('stripe', true, '{}'::jsonb),
  ('kpay', true, '{}'::jsonb),
  ('polar', false, '{}'::jsonb)
ON CONFLICT (gateway_name) DO NOTHING;

-- Enable RLS for payment_gateway_settings
ALTER TABLE payment_gateway_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can modify payment gateway settings
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
