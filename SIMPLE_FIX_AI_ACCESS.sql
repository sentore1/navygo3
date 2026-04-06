-- SIMPLE FIX: Enable AI Access for Delta Goal and Admin Users
-- Run this in Supabase SQL Editor

-- Step 1: Enable AI access for Delta Goal in polar_product_features
INSERT INTO polar_product_features (product_id, product_name, has_ai_access)
VALUES 
    ('delta-goal', 'Delta Goal', true),
    ('pro', 'Pro', true),
    ('premium', 'Premium', true)
ON CONFLICT (product_id) 
DO UPDATE SET 
    has_ai_access = true,
    updated_at = NOW();

-- Step 2: Update all active polar subscriptions for Delta Goal
UPDATE polar_subscriptions
SET has_ai_access = true
WHERE product_id IN ('delta-goal', 'pro', 'premium')
  AND status = 'active';

-- Step 3: Ensure all admin users have active subscription status
UPDATE users
SET subscription_status = 'active'
WHERE role = 'admin';

-- Step 4: Verify the fix
SELECT '=== VERIFICATION ===' as status;

-- Show product features with AI
SELECT 
    'Product Features' as type,
    product_name,
    has_ai_access,
    product_id
FROM polar_product_features
WHERE has_ai_access = true;

-- Show active subscriptions with AI
SELECT 
    'Active AI Subscriptions' as type,
    u.email,
    ps.product_id,
    ps.has_ai_access,
    ps.status
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE ps.status = 'active'
  AND ps.has_ai_access = true;

-- Show admin users
SELECT 
    'Admin Users' as type,
    email,
    role,
    subscription_status
FROM users
WHERE role = 'admin';

-- Show Kpay Delta Goal users
SELECT 
    'Kpay Delta Goal' as type,
    u.email,
    kt.plan_name,
    kt.status,
    kt.created_at
FROM kpay_transactions kt
JOIN users u ON kt.user_id = u.id
WHERE kt.plan_name IN ('Delta Goal', 'Pro')
  AND kt.status = 'completed'
ORDER BY kt.created_at DESC
LIMIT 10;
