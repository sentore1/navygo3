-- Fix: Remove fake subscription data from new users
-- This ensures new users don't have fake "active" subscriptions

-- First, check if there are users with fake subscriptions
SELECT 
    id,
    email,
    subscription_status,
    subscription_expires_at,
    created_at
FROM users 
WHERE subscription_status = 'active'
AND id NOT IN (
    SELECT DISTINCT user_id FROM polar_subscriptions WHERE status = 'active'
)
AND id::text NOT IN (
    SELECT DISTINCT user_id FROM subscriptions WHERE status = 'active'
);

-- Clear fake subscription data from all users who don't have real subscriptions
UPDATE users 
SET 
    subscription_status = NULL,
    subscription_expires_at = NULL,
    updated_at = NOW()
WHERE subscription_status = 'active'
AND id NOT IN (
    SELECT DISTINCT user_id FROM polar_subscriptions WHERE status = 'active'
)
AND id::text NOT IN (
    SELECT DISTINCT user_id FROM subscriptions WHERE status = 'active'
);

-- Verify the fix
SELECT 
    id,
    email,
    subscription_status,
    subscription_expires_at
FROM users 
WHERE subscription_status IS NOT NULL;
