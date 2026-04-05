-- Check your subscription status
-- Replace with your email
SELECT 
  u.id,
  u.email,
  u.subscription_status,
  u.has_trial_access,
  u.subscription_expires_at,
  ps.id as polar_sub_id,
  ps.subscription_id,
  ps.status as polar_status
FROM public.users u
LEFT JOIN polar_subscriptions ps ON ps.user_id = u.id
WHERE u.email = 'YOUR_EMAIL';
