-- TEMPORARY: Manually activate subscription for testing
-- Replace 'YOUR_EMAIL_HERE' with your actual email

-- Step 1: Update user subscription status
UPDATE users 
SET 
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: Insert a test Polar subscription record
INSERT INTO polar_subscriptions (
  id,
  user_id,
  subscription_id,
  plan_id,
  status,
  product_id,
  price_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  id,
  'test_sub_' || gen_random_uuid()::text,
  '1ab0d75a-a693-4afb-b7c2-74b1183d5dea', -- price ID as plan_id
  'active',
  '777b2579-2c82-4720-9156-76c3c9ce2af1', -- navygoal product ID
  '1ab0d75a-a693-4afb-b7c2-74b1183d5dea', -- monthly price ID
  NOW(),
  NOW() + INTERVAL '30 days',
  false,
  NOW(),
  NOW()
FROM users 
WHERE email = 'YOUR_EMAIL_HERE'
AND NOT EXISTS (
  SELECT 1 FROM polar_subscriptions WHERE user_id = users.id
);

-- Step 3: Verify the subscription was created
SELECT 
  u.email,
  u.subscription_status,
  u.subscription_expires_at,
  ps.id as subscription_id,
  ps.status,
  ps.current_period_end
FROM users u
LEFT JOIN polar_subscriptions ps ON ps.user_id = u.id
WHERE u.email = 'YOUR_EMAIL_HERE';
