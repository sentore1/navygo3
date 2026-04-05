-- Clear subscription for testing
-- Replace 'your-email@example.com' with your actual email

-- First, find your user ID
SELECT id, email, subscription_status 
FROM users 
WHERE email = 'your-email@example.com';

-- Clear subscription status in users table
UPDATE users 
SET 
  subscription_status = NULL,
  subscription_expires_at = NULL,
  has_trial_access = false,
  updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Delete Polar subscriptions
DELETE FROM polar_subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- Delete Stripe subscriptions (if any)
DELETE FROM subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- Verify it's cleared
SELECT 
  u.email,
  u.subscription_status,
  u.subscription_expires_at,
  u.has_trial_access,
  COUNT(ps.id) as polar_subs,
  COUNT(s.id) as stripe_subs
FROM users u
LEFT JOIN polar_subscriptions ps ON ps.user_id = u.id
LEFT JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'your-email@example.com'
GROUP BY u.id, u.email, u.subscription_status, u.subscription_expires_at, u.has_trial_access;
