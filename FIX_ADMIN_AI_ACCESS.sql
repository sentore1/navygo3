-- Fix AI access for admins and Delta Goal subscribers
-- Admins should always have AI access regardless of subscription

-- Step 1: Enable AI access for all Pro and Delta Goal products
UPDATE products
SET has_ai_access = true
WHERE name IN ('Pro', 'Delta Goal', 'Premium', 'Professional')
   OR name LIKE '%Pro%'
   OR name LIKE '%Delta%';

-- Step 2: Update existing Polar subscriptions to have AI access
UPDATE polar_subscriptions ps
SET has_ai_access = true
FROM products p
WHERE ps.product_id = p.id
  AND p.has_ai_access = true
  AND ps.status = 'active';

-- Step 3: Verify admin users have subscription_status = 'active'
-- (Admins should have access regardless)
UPDATE users
SET subscription_status = 'active'
WHERE role = 'admin'
  AND (subscription_status IS NULL OR subscription_status != 'active');

-- Step 4: Check the results
SELECT 
    'Products with AI Access' as category,
    name,
    has_ai_access,
    is_active
FROM products
WHERE has_ai_access = true

UNION ALL

SELECT 
    'Admin Users' as category,
    email as name,
    CASE WHEN subscription_status = 'active' THEN true ELSE false END as has_ai_access,
    true as is_active
FROM users
WHERE role = 'admin'

UNION ALL

SELECT 
    'Active Subscriptions with AI' as category,
    u.email as name,
    ps.has_ai_access,
    true as is_active
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE ps.status = 'active'
  AND ps.has_ai_access = true;
