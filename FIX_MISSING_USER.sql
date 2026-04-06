-- Step 1: Check if user exists in auth.users but not in public.users
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN u.id IS NULL THEN 'MISSING FROM public.users' ELSE 'EXISTS' END as status
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE au.email = 'YOUR_EMAIL_HERE';

-- Step 2: Insert missing user into public.users table
INSERT INTO public.users (
  id,
  email,
  subscription_status,
  has_trial_access,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  'inactive',
  false,
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'YOUR_EMAIL_HERE'
AND NOT EXISTS (
  SELECT 1 FROM public.users WHERE id = au.id
);

-- Step 3: Now activate the subscription
UPDATE public.users 
SET 
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 4: Insert subscription record
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
  '1ab0d75a-a693-4afb-b7c2-74b1183d5dea',
  'active',
  '777b2579-2c82-4720-9156-76c3c9ce2af1',
  '1ab0d75a-a693-4afb-b7c2-74b1183d5dea',
  NOW(),
  NOW() + INTERVAL '30 days',
  false,
  NOW(),
  NOW()
FROM public.users 
WHERE email = 'YOUR_EMAIL_HERE'
AND NOT EXISTS (
  SELECT 1 FROM polar_subscriptions WHERE user_id = users.id
);

-- Step 5: Verify everything is set up correctly
SELECT 
  u.id,
  u.email,
  u.subscription_status,
  u.subscription_expires_at,
  ps.subscription_id,
  ps.status as sub_status,
  ps.current_period_end
FROM public.users u
LEFT JOIN polar_subscriptions ps ON ps.user_id = u.id
WHERE u.email = 'YOUR_EMAIL_HERE';
