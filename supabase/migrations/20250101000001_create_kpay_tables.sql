-- Create KPay transactions table
CREATE TABLE IF NOT EXISTS kpay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tid TEXT NOT NULL,
  refid TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  mom_transaction_id TEXT,
  pay_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add subscription fields to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_kpay_transactions_tid ON kpay_transactions(tid);
CREATE INDEX IF NOT EXISTS idx_kpay_transactions_user_id ON kpay_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Enable RLS
ALTER TABLE kpay_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own transactions" ON kpay_transactions
  FOR SELECT USING (auth.uid() = user_id);
