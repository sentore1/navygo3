-- Manage Revenue Tracking
-- Run these queries in Supabase SQL Editor

-- 1. Check total revenue from all sources
SELECT 
  source,
  COUNT(*) as transactions,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_transaction,
  currency
FROM revenue_transactions
WHERE status = 'completed'
GROUP BY source, currency
ORDER BY total_revenue DESC;

-- 2. Check revenue by month
SELECT * FROM revenue_analytics_view
ORDER BY month DESC
LIMIT 12;

-- 3. Get revenue summary
SELECT * FROM revenue_summary_view;

-- 4. Sync existing KPay transactions (run this once after migration)
SELECT sync_kpay_to_revenue() as synced_transactions;

-- 5. Add a Polar subscription payment manually (example)
-- Replace with actual values
/*
SELECT add_polar_revenue(
  'user-uuid-here'::uuid,
  'polar_sub_123',
  29.99,
  'Pro Plan'
);
*/

-- 6. Check recent revenue transactions
SELECT 
  rt.transaction_id,
  rt.source,
  rt.amount,
  rt.currency,
  rt.status,
  rt.plan_name,
  u.email as user_email,
  rt.transaction_date
FROM revenue_transactions rt
LEFT JOIN users u ON rt.user_id = u.id
ORDER BY rt.transaction_date DESC
LIMIT 20;

-- 7. Get total revenue (all sources)
SELECT 
  SUM(amount) as total_revenue,
  COUNT(*) as total_transactions,
  COUNT(DISTINCT user_id) as unique_customers
FROM revenue_transactions
WHERE status = 'completed';

-- 8. Revenue by user
SELECT 
  u.email,
  u.display_name,
  COUNT(rt.id) as transaction_count,
  SUM(rt.amount) as total_spent,
  MAX(rt.transaction_date) as last_payment
FROM users u
LEFT JOIN revenue_transactions rt ON u.id = rt.user_id AND rt.status = 'completed'
GROUP BY u.id, u.email, u.display_name
HAVING COUNT(rt.id) > 0
ORDER BY total_spent DESC
LIMIT 20;

-- 9. Monthly revenue growth
WITH monthly_revenue AS (
  SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    SUM(amount) as revenue
  FROM revenue_transactions
  WHERE status = 'completed'
  GROUP BY DATE_TRUNC('month', transaction_date)
)
SELECT 
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) as prev_month_revenue,
  ROUND(((revenue - LAG(revenue) OVER (ORDER BY month)) / NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100), 2) as growth_percentage
FROM monthly_revenue
ORDER BY month DESC
LIMIT 12;

-- 10. Check if revenue_transactions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'revenue_transactions'
) as table_exists;
