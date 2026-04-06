-- QUICK FIX: Enable AI Access for Delta Goal, Pro, and Admin Users
-- Run this in Supabase SQL Editor

-- Step 1: Enable AI access for all Pro-tier products
UPDATE products
SET has_ai_access = true
WHERE name IN ('Pro', 'Delta Goal', 'Premium', 'Professional')
   OR name LIKE '%Pro%'
   OR name LIKE '%Delta%'
   OR name LIKE '%Premium%';

-- Step 2: Update all active Polar subscriptions to have AI access if their product has it
UPDATE polar_subscriptions ps
SET has_ai_access = true
FROM products p
WHERE ps.product_id = p.id
  AND p.has_ai_access = true
  AND ps.status = 'active';

-- Step 3: Ensure all admin users have active subscription status
UPDATE users
SET subscription_status = 'active'
WHERE role = 'admin';

-- Step 4: Verify the fix worked
SELECT 
    'VERIFICATION RESULTS' as status,
    '===================' as separator;

-- Show products with AI access
SELECT 
    'Products with AI' as type,
    name,
    has_ai_access,
    is_active
FROM products
WHERE has_ai_access = true;

-- Show admin users
SELECT 
    'Admin Users' as type,
    email as name,
    subscription_status as has_ai_access,
    role as is_active
FROM users
WHERE role = 'admin';

-- Show active subscriptions with AI
SELECT 
    'Active AI Subscriptions' as type,
    u.email as name,
    ps.has_ai_access,
    p.name as is_active
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
JOIN products p ON ps.product_id = p.id
WHERE ps.status = 'active'
  AND ps.has_ai_access = true;

-- Show Kpay Delta Goal transactions
SELECT 
    'Kpay Delta Goal Users' as type,
    u.email as name,
    kt.plan_name as has_ai_access,
    kt.status as is_active
FROM kpay_transactions kt
JOIN users u ON kt.user_id = u.id
WHERE kt.plan_name IN ('Delta Goal', 'Pro')
  AND kt.status = 'completed'
ORDER BY kt.created_at DESC;
