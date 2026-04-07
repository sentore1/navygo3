-- Ensure polar_subscriptions table has all necessary fields for subscription management
-- This migration adds missing fields if they don't exist

-- Add subscription_id if it doesn't exist (for Polar API reference)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'polar_subscriptions' 
    AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE polar_subscriptions ADD COLUMN subscription_id TEXT;
  END IF;
END $$;

-- Add product_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'polar_subscriptions' 
    AND column_name = 'product_id'
  ) THEN
    ALTER TABLE polar_subscriptions ADD COLUMN product_id TEXT;
  END IF;
END $$;

-- Add price_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'polar_subscriptions' 
    AND column_name = 'price_id'
  ) THEN
    ALTER TABLE polar_subscriptions ADD COLUMN price_id TEXT;
  END IF;
END $$;

-- Add cancel_at_period_end if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'polar_subscriptions' 
    AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE polar_subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add plan_id if it doesn't exist (legacy field, might be used)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'polar_subscriptions' 
    AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE polar_subscriptions ADD COLUMN plan_id TEXT;
  END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_polar_subscriptions_subscription_id ON polar_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_polar_subscriptions_user_id ON polar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_polar_subscriptions_status ON polar_subscriptions(status);

-- Ensure RLS policies exist for service role to update subscriptions
DROP POLICY IF EXISTS "Service role can manage all polar subscriptions" ON polar_subscriptions;
CREATE POLICY "Service role can manage all polar subscriptions"
  ON polar_subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Comment for documentation
COMMENT ON COLUMN polar_subscriptions.cancel_at_period_end IS 'When true, subscription will cancel at the end of the current billing period';
COMMENT ON COLUMN polar_subscriptions.subscription_id IS 'Polar subscription ID for API calls';
COMMENT ON COLUMN polar_subscriptions.product_id IS 'Polar product ID';
COMMENT ON COLUMN polar_subscriptions.price_id IS 'Polar price ID (specific to billing interval)';
