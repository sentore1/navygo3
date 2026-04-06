-- Check your subscription and AI access status
-- Run this to see what's happening with your subscription

-- Get your user ID first
SELECT 
    id,
    email,
    subscription_status,
    role
FROM users
WHERE email = 'your-email@example.com'; -- Replace with your email

-- Check Polar subscriptions
SELECT 
    ps.id,
    ps.user_id,
    ps.product_id,
    ps.status,
    ps.has_ai_access,
    ps.subscription_id,
    ps.created_at
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE u.email = 'your-email@example.com'; -- Replace with your email

-- Check Kpay transactions
SELECT 
    kt.id,
    kt.user_id,
    kt.plan_name,
    kt.status,
    kt.amount,
    kt.created_at
FROM kpay_transactions kt
JOIN users u ON kt.user_id = u.id
WHERE u.email = 'your-email@example.com' -- Replace with your email
ORDER BY kt.created_at DESC
LIMIT 5;

-- Check products with AI access
SELECT 
    id,
    name,
    has_ai_access,
    is_active
FROM products
WHERE is_active = true;
