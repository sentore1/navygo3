-- Replace 'YOUR_EMAIL' with your actual email from the list above
-- For example: 'abdousentore@gmail.com'

-- Step 1: Activate subscription in users table
UPDATE public.users 
SET 
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL';

-- Step 2: Insert subscription record
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
  u.id,
  'polar_sub_' || gen_random_uuid()::text,
  '1ab0d75a-a693-4afb-b7c2-74b1183d5dea',
  'active',
  '777b2579-2c82-4720-9156-76c3c9ce2af1',
  '1ab0d75a-a693-4afb-b7c2-74b1183d5dea',
  NOW(),
  NOW() + INTERVAL '30 days',
  false,
  NOW(),
  NOW()
FROM public.users u
WHERE u.email = 'YOUR_EMAIL'
AND NOT EXISTS (
  SELECT 1 FROM polar_subscriptions ps WHERE ps.user_id = u.id
);

-- Step 3: Verify it worked
SELECT 
  u.id,
  u.email,
  u.subscription_status,
  u.subscription_expires_at,
  ps.subscription_id,
  ps.status,
  ps.current_period_end
FROM public.users u
LEFT JOIN polar_subscriptions ps ON ps.user_id = u.id
WHERE u.email = 'YOUR_EMAIL';
