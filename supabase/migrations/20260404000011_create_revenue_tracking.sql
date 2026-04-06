-- Create unified revenue tracking system
-- This consolidates revenue from all payment sources (KPay, Polar, Stripe, etc.)

-- Create revenue_transactions table
CREATE TABLE IF NOT EXISTS public.revenue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  transaction_id TEXT UNIQUE NOT NULL, -- External transaction ID
  source TEXT NOT NULL, -- 'kpay', 'polar', 'stripe', etc.
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- 'completed', 'pending', 'failed', 'refunded'
  plan_name TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_revenue_transactions_user ON public.revenue_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_transactions_source ON public.revenue_transactions(source);
CREATE INDEX IF NOT EXISTS idx_revenue_transactions_status ON public.revenue_transactions(status);
CREATE INDEX IF NOT EXISTS idx_revenue_transactions_date ON public.revenue_transactions(transaction_date DESC);

-- Create view for revenue analytics
CREATE OR REPLACE VIEW public.revenue_analytics_view AS
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  source,
  COUNT(*) as transaction_count,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_transaction_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM public.revenue_transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date), source
ORDER BY month DESC, source;

-- Create view for total revenue summary
CREATE OR REPLACE VIEW public.revenue_summary_view AS
SELECT 
  source,
  COUNT(*) as total_transactions,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_revenue,
  MIN(transaction_date) as first_transaction,
  MAX(transaction_date) as last_transaction
FROM public.revenue_transactions
WHERE status = 'completed'
GROUP BY source;

-- Enable RLS
ALTER TABLE public.revenue_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions" ON public.revenue_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.revenue_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert transactions" ON public.revenue_transactions
  FOR INSERT WITH CHECK (true);

-- Grant access to views
GRANT SELECT ON public.revenue_analytics_view TO authenticated;
GRANT SELECT ON public.revenue_summary_view TO authenticated;

-- Function to sync KPay transactions to revenue_transactions
CREATE OR REPLACE FUNCTION sync_kpay_to_revenue()
RETURNS INTEGER AS $$
DECLARE
  synced_count INTEGER := 0;
BEGIN
  INSERT INTO public.revenue_transactions (
    user_id,
    transaction_id,
    source,
    amount,
    currency,
    status,
    plan_name,
    description,
    transaction_date,
    created_at
  )
  SELECT 
    user_id,
    'kpay_' || id::text,
    'kpay',
    amount,
    'RWF', -- Rwandan Franc
    status,
    plan_name,
    'KPay transaction',
    created_at,
    created_at
  FROM kpay_transactions
  WHERE NOT EXISTS (
    SELECT 1 FROM public.revenue_transactions 
    WHERE transaction_id = 'kpay_' || kpay_transactions.id::text
  );
  
  GET DIAGNOSTICS synced_count = ROW_COUNT;
  RETURN synced_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add Polar subscription revenue
CREATE OR REPLACE FUNCTION add_polar_revenue(
  p_user_id UUID,
  p_subscription_id TEXT,
  p_amount DECIMAL,
  p_plan_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.revenue_transactions (
    user_id,
    transaction_id,
    source,
    amount,
    currency,
    status,
    plan_name,
    description,
    transaction_date
  ) VALUES (
    p_user_id,
    'polar_' || p_subscription_id,
    'polar',
    p_amount,
    'USD',
    'completed',
    p_plan_name,
    'Polar subscription payment',
    NOW()
  )
  ON CONFLICT (transaction_id) DO NOTHING
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync new KPay transactions
CREATE OR REPLACE FUNCTION auto_sync_kpay_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    INSERT INTO public.revenue_transactions (
      user_id,
      transaction_id,
      source,
      amount,
      currency,
      status,
      plan_name,
      description,
      transaction_date
    ) VALUES (
      NEW.user_id,
      'kpay_' || NEW.id::text,
      'kpay',
      NEW.amount,
      'RWF',
      NEW.status,
      NEW.plan_name,
      'KPay transaction',
      NEW.created_at
    )
    ON CONFLICT (transaction_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_kpay_transaction
  AFTER INSERT OR UPDATE ON kpay_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_sync_kpay_transaction();

-- Initial sync of existing KPay transactions
SELECT sync_kpay_to_revenue();

COMMENT ON TABLE public.revenue_transactions IS 'Unified revenue tracking from all payment sources';
COMMENT ON FUNCTION sync_kpay_to_revenue IS 'Syncs KPay transactions to revenue_transactions table';
COMMENT ON FUNCTION add_polar_revenue IS 'Adds a Polar subscription payment to revenue tracking';
