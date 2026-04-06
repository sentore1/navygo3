-- Check if users table exists and create it if not
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT,
  email TEXT,
  token_identifier UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Check if subscriptions table exists and create it if not
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_id TEXT UNIQUE,
  price_id TEXT,
  stripe_price_id TEXT,
  currency TEXT,
  interval TEXT,
  status TEXT,
  current_period_start INTEGER,
  current_period_end INTEGER,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  amount INTEGER,
  started_at INTEGER,
  customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  canceled_at INTEGER,
  ended_at INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Check if webhook_events table exists and create it if not
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT,
  type TEXT,
  stripe_event_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE,
  modified_at TIMESTAMP WITH TIME ZONE,
  data JSONB
);

-- Fix RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix RLS policies for subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime for users and subscriptions tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table subscriptions;
alter publication supabase_realtime add table webhook_events;
