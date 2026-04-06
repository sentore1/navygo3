-- Fix AI access for Delta Goal subscribers
-- This ensures Delta Goal plan has AI access enabled

-- First, check if Delta Goal product exists and enable AI access
UPDATE products
SET has_ai_access = true
WHERE name = 'Delta Goal' OR name LIKE '%Delta%';

-- Update any existing Polar subscriptions for Delta Goal to have AI access
UPDATE polar_subscriptions
SET has_ai_access = true
WHERE product_id IN (
    SELECT id FROM products 
    WHERE name = 'Delta Goal' OR name LIKE '%Delta%'
);

-- Verify the changes
SELECT 
    p.id,
    p.name,
    p.has_ai_access,
    COUNT(ps.id) as subscriber_count
FROM products p
LEFT JOIN polar_subscriptions ps ON p.id = ps.product_id AND ps.status = 'active'
WHERE p.name LIKE '%Delta%' OR p.name = 'Pro'
GROUP BY p.id, p.name, p.has_ai_access;

-- Check your specific subscription
SELECT 
    u.email,
    u.subscription_status,
    ps.status as polar_status,
    ps.has_ai_access,
    p.name as product_name,
    p.has_ai_access as product_has_ai_access
FROM users u
LEFT JOIN polar_subscriptions ps ON u.id = ps.user_id AND ps.status = 'active'
LEFT JOIN products p ON ps.product_id = p.id
WHERE u.email = 'your-email@example.com'; -- Replace with your email
