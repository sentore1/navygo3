-- Step 1: Create polar_subscriptions table
CREATE TABLE IF NOT EXISTS polar_subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  product_id TEXT,
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_polar_subscriptions_user_id ON polar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_polar_subscriptions_status ON polar_subscriptions(status);

-- Step 3: Enable RLS
ALTER TABLE polar_subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own polar subscriptions" ON polar_subscriptions;
DROP POLICY IF EXISTS "Admins can view all polar subscriptions" ON polar_subscriptions;

-- Step 5: Create RLS policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view their own polar subscriptions" ON polar_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all polar subscriptions" ON polar_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Step 6: Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'polar_subscriptions'
ORDER BY ordinal_position;
