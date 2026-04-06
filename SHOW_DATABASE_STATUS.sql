-- ============================================
-- COMPLETE DATABASE STATUS CHECK
-- ============================================

-- 1. Show all users from auth.users
SELECT 
  'AUTH USERS' as table_name,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Show all users from public.users
SELECT 
  'PUBLIC USERS' as table_name,
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

-- 3. Show polar_subscriptions table structure
SELECT 
  'POLAR_SUBSCRIPTIONS COLUMNS' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'polar_subscriptions'
ORDER BY ordinal_position;

-- 4. Show all polar subscriptions
SELECT 
  'POLAR SUBSCRIPTIONS' as table_name,
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

-- 5. Show users with their subscription status (JOIN)
SELECT 
  'USER SUBSCRIPTION STATUS' as info,
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

-- 6. Check for orphaned auth users (in auth but not in public.users)
SELECT 
  'ORPHANED AUTH USERS' as info,
  au.id,
  au.email,
  au.created_at,
  'Missing from public.users' as issue
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
LIMIT 10;

-- 7. Show Stripe subscriptions (if any)
SELECT 
  'STRIPE SUBSCRIPTIONS' as table_name,
  COUNT(*) as total_count
FROM subscriptions;

-- 8. Show recent webhook events (if table exists)
SELECT 
  'WEBHOOK EVENTS' as table_name,
  provider,
  event_type,
  created_at
FROM webhook_events
ORDER BY created_at DESC
LIMIT 5;
