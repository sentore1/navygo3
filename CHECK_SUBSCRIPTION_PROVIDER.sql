-- Check which subscription provider should be shown
-- Run this in Supabase SQL Editor

-- Check your current user's subscription data
SELECT 
  'User Status' as source,
  id,
  email,
  subscription_status,
  subscription_expires_at,
  has_trial_access
FROM users
WHERE id = auth.uid();

-- Check for Polar subscriptions
SELECT 
  'Polar Subscription' as source,
  id,
  user_id,
  subscription_id,
  status,
  current_period_end,
  created_at
FROM polar_subscriptions
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Check for KPay transactions
SELECT 
  'KPay Transaction' as source,
  id,
  user_id,
  status,
  amount,
  plan_name,
  created_at
FROM kpay_transactions
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- Check for Stripe subscriptions
SELECT 
  'Stripe Subscription' as source,
  id,
  user_id,
  status,
  created_at
FROM subscriptions
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
