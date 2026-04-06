-- Check subscription status for your user
-- Replace 'your-email@example.com' with your actual email

-- 1. Check user subscription status
SELECT 
    id,
    email,
    subscription_status,
    subscription_expires_at,
    has_trial_access,
    created_at,
    updated_at
FROM users 
WHERE email = 'your-email@example.com';

-- 2. Check Polar subscriptions
SELECT 
    user_id,
    subscription_id,
    status,
    product_id,
    price_id,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
FROM polar_subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- 3. Check webhook events (if table exists)
SELECT 
    provider,
    event_type,
    created_at,
    data
FROM webhook_events 
WHERE provider = 'polar'
ORDER BY created_at DESC
LIMIT 10;

-- 4. If subscription is stuck in "pending", manually activate it:
-- (Only run this if the payment was successful in Polar dashboard)

-- UPDATE users 
-- SET 
--   subscription_status = 'active',
--   subscription_expires_at = NOW() + INTERVAL '1 month',
--   updated_at = NOW()
-- WHERE email = 'your-email@example.com';

-- 5. Or give trial access for testing:
-- UPDATE users 
-- SET 
--   has_trial_access = true,
--   subscription_status = 'active',
--   updated_at = NOW()
-- WHERE email = 'your-email@example.com';
