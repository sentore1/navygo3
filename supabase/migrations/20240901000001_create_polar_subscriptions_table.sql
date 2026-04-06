-- Create polar_subscriptions table to track Polar subscriptions
CREATE TABLE IF NOT EXISTS polar_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS polar_subscriptions_user_id_idx ON polar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS polar_subscriptions_subscription_id_idx ON polar_subscriptions(subscription_id);

-- Enable row level security
ALTER TABLE polar_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON polar_subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON polar_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON polar_subscriptions;
CREATE POLICY "Service role can manage all subscriptions"
  ON polar_subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add to realtime publication
alter publication supabase_realtime add table polar_subscriptions;
