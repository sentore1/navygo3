-- Check if polar_subscriptions table exists and has data
SELECT 
  ps.id,
  ps.user_id,
  ps.status,
  ps.product_id,
  ps.current_period_end,
  u.email,
  u.subscription_status
FROM polar_subscriptions ps
JOIN users u ON u.id = ps.user_id
ORDER BY ps.created_at DESC
LIMIT 5;

-- Check user subscription status
SELECT 
  id,
  email,
  subscription_status,
  subscription_expires_at,
  has_trial_access
FROM users
WHERE subscription_status = 'active' OR has_trial_access = true
ORDER BY updated_at DESC
LIMIT 5;
