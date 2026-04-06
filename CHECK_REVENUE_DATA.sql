-- Check current revenue data to identify the issue
-- Run this in Supabase SQL Editor

-- Check revenue_transactions table
SELECT 
  source,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount
FROM revenue_transactions
WHERE status = 'completed'
GROUP BY source;

-- Check all transactions
SELECT 
  id,
  user_id,
  transaction_id,
  source,
  amount,
  currency,
  status,
  plan_name,
  transaction_date
FROM revenue_transactions
ORDER BY amount DESC
LIMIT 20;

-- Check if there's test data with wrong amounts
SELECT COUNT(*) as total_transactions FROM revenue_transactions;
SELECT SUM(amount) as total_revenue FROM revenue_transactions WHERE status = 'completed';
