-- Fix subscription provider display
-- This will ensure Polar subscriptions take priority

-- Option 1: If you have a Polar subscription but it's not showing
-- Add your Polar subscription manually (replace with your actual data)
-- Uncomment and fill in your details:

/*
INSERT INTO polar_subscriptions (
  user_id,
  subscription_id,
  status,
  current_period_start,
  current_period_end,
  plan_id,
  customer_id
) VALUES (
  auth.uid(),
  'your_polar_subscription_id', -- Get this from Polar dashboard
  'active',
  NOW(),
  NOW() + INTERVAL '1 month', -- Or '1 year' for yearly
  'your_plan_id', -- e.g., 'pro_monthly'
  'your_customer_id' -- Get this from Polar dashboard
)
ON CONFLICT (subscription_id) DO UPDATE
SET status = 'active',
    current_period_end = EXCLUDED.current_period_end;
*/

-- Option 2: If you want to clear old KPay data that's interfering
-- This will set your subscription_status to inactive if you don't have active KPay
-- Uncomment to run:

/*
UPDATE users
SET 
  subscription_status = 'inactive',
  subscription_expires_at = NULL
WHERE id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM kpay_transactions 
    WHERE user_id = auth.uid() 
      AND status = 'completed'
      AND created_at > NOW() - INTERVAL '30 days'
  );
*/

-- Option 3: Check if polar_subscriptions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'polar_subscriptions'
) as polar_table_exists;

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS polar_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  status TEXT NOT NULL,
  plan_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_polar_subscriptions_user_id ON polar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_polar_subscriptions_status ON polar_subscriptions(status);

-- Enable RLS
ALTER TABLE polar_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own polar subscriptions" ON polar_subscriptions;
CREATE POLICY "Users can view own polar subscriptions" ON polar_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage polar subscriptions" ON polar_subscriptions;
CREATE POLICY "Service can manage polar subscriptions" ON polar_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Verify the setup
SELECT 
  'Setup Complete' as status,
  COUNT(*) as polar_subscription_count
FROM polar_subscriptions
WHERE user_id = auth.uid();
