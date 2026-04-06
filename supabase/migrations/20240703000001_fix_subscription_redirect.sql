-- Ensure webhook_events table exists for logging
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  type TEXT NOT NULL,
  stripe_event_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL
);

-- Ensure subscriptions table exists with proper structure
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  interval TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start BIGINT NOT NULL,
  current_period_end BIGINT NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  amount BIGINT NOT NULL,
  started_at BIGINT NOT NULL,
  customer_id TEXT NOT NULL,
  metadata JSONB,
  canceled_at BIGINT,
  ended_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add subscription_id to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_id);

-- Enable realtime for subscriptions table
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_events;

-- Create or replace function to update user's subscription_id
CREATE OR REPLACE FUNCTION update_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET subscription_id = NEW.id
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_subscription_trigger'
  ) THEN
    CREATE TRIGGER update_user_subscription_trigger
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_subscription();
  END IF;
END $$;
