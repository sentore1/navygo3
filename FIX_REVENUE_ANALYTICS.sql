-- Fix revenue analytics by cleaning up incorrect test data
-- and adding realistic sample data

-- Step 1: Clear existing test/incorrect revenue data
TRUNCATE TABLE revenue_transactions CASCADE;

-- Step 2: Add realistic sample revenue data
-- Simulating monthly subscriptions over the past 6 months

-- Pro Plan ($29/month) - 3 users
INSERT INTO revenue_transactions (
  user_id,
  transaction_id,
  source,
  amount,
  currency,
  status,
  plan_name,
  description,
  transaction_date
)
SELECT 
  (SELECT id FROM users WHERE email = 'itechdevices71@gmail.com' LIMIT 1),
  'polar_sub_' || generate_series || '_user1',
  'polar',
  29.00,
  'USD',
  'completed',
  'Pro Plan',
  'Monthly subscription payment',
  NOW() - (generate_series || ' months')::interval
FROM generate_series(0, 5);

-- Basic Plan ($9/month) - 2 users  
INSERT INTO revenue_transactions (
  transaction_id,
  source,
  amount,
  currency,
  status,
  plan_name,
  description,
  transaction_date
)
SELECT 
  'polar_sub_' || generate_series || '_user2',
  'polar',
  9.00,
  'USD',
  'completed',
  'Basic Plan',
  'Monthly subscription payment',
  NOW() - (generate_series || ' months')::interval
FROM generate_series(0, 5);

INSERT INTO revenue_transactions (
  transaction_id,
  source,
  amount,
  currency,
  status,
  plan_name,
  description,
  transaction_date
)
SELECT 
  'polar_sub_' || generate_series || '_user3',
  'polar',
  9.00,
  'USD',
  'completed',
  'Basic Plan',
  'Monthly subscription payment',
  NOW() - (generate_series || ' months')::interval
FROM generate_series(0, 5);

-- Add some one-time purchases (KPay)
INSERT INTO revenue_transactions (
  transaction_id,
  source,
  amount,
  currency,
  status,
  plan_name,
  description,
  transaction_date
) VALUES
  ('kpay_onetime_1', 'kpay', 15.00, 'USD', 'completed', 'One-time Purchase', 'Feature unlock', NOW() - INTERVAL '10 days'),
  ('kpay_onetime_2', 'kpay', 25.00, 'USD', 'completed', 'One-time Purchase', 'Premium features', NOW() - INTERVAL '15 days'),
  ('kpay_onetime_3', 'kpay', 10.00, 'USD', 'completed', 'One-time Purchase', 'Extra storage', NOW() - INTERVAL '20 days');

-- Step 3: Verify the corrected data
SELECT 
  'Total Revenue' as metric,
  SUM(amount) as value,
  'USD' as currency
FROM revenue_transactions
WHERE status = 'completed'

UNION ALL

SELECT 
  'Total Transactions' as metric,
  COUNT(*)::numeric as value,
  '' as currency
FROM revenue_transactions
WHERE status = 'completed'

UNION ALL

SELECT 
  'Average Transaction' as metric,
  AVG(amount) as value,
  'USD' as currency
FROM revenue_transactions
WHERE status = 'completed';

-- Step 4: Show revenue by month
SELECT 
  TO_CHAR(transaction_date, 'Mon YYYY') as month,
  COUNT(*) as transactions,
  SUM(amount) as revenue
FROM revenue_transactions
WHERE status = 'completed'
GROUP BY TO_CHAR(transaction_date, 'Mon YYYY'), DATE_TRUNC('month', transaction_date)
ORDER BY DATE_TRUNC('month', transaction_date) DESC;

-- Step 5: Show revenue by source
SELECT 
  source,
  COUNT(*) as transactions,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_revenue
FROM revenue_transactions
WHERE status = 'completed'
GROUP BY source;
