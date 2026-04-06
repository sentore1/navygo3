-- Add plan_name column to kpay_transactions
ALTER TABLE kpay_transactions ADD COLUMN IF NOT EXISTS plan_name TEXT;
