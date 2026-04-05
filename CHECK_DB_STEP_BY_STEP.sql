-- ============================================
-- RUN THESE QUERIES ONE BY ONE
-- ============================================

-- QUERY 1: Show all users from auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- QUERY 2: Show all users from public.users
SELECT 
  id,
  email,
  subscription_status,
  subscription_expires_at,
  has_trial_access,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- QUERY 3: Show polar_subscriptions table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'polar_subscriptions'
ORDER BY ordinal_position;

-- QUERY 4: Show all polar subscriptions
SELECT 
  id,
  user_id,
  subscription_id,
  plan_id,
  status,
  product_id,
  price_id,
  current_period_start,
  current_period_end,
  created_at
FROM polar_subscriptions
ORDER BY created_at DESC
LIMIT 10;

-- QUERY 5: Show users with their subscription status (JOIN)
SELECT 
  u.id as user_id,
  u.email,
  u.subscription_status as user_table_status,
  u.subscription_expires_at,
  ps.subscription_id as polar_sub_id,
  ps.status as polar_sub_status,
  ps.current_period_end as polar_period_end
FROM public.users u
LEFT JOIN polar_subscriptions ps ON ps.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;

-- QUERY 6: Check for orphaned auth users
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN u.id IS NULL THEN 'Missing from public.users' ELSE 'OK' END as status
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;
