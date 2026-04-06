-- Add has_trial_access column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'has_trial_access') THEN
    ALTER TABLE users ADD COLUMN has_trial_access BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create checkout_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security on checkout_sessions
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for checkout_sessions
DROP POLICY IF EXISTS "Users can view their own checkout sessions" ON checkout_sessions;
CREATE POLICY "Users can view their own checkout sessions"
  ON checkout_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Add webhook_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for polar_subscriptions
alter publication supabase_realtime add table polar_subscriptions;

-- Enable realtime for checkout_sessions
alter publication supabase_realtime add table checkout_sessions;

-- Enable realtime for webhook_events
alter publication supabase_realtime add table webhook_events;