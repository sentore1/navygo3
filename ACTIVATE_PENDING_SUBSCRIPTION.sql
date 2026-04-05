-- Manually activate a pending subscription
-- Use this if the webhook hasn't fired yet but payment was successful

-- Replace 'your-email@example.com' with your actual email

-- Step 1: Check current status
SELECT 
    email,
    subscription_status,
    subscription_expires_at
FROM users 
WHERE email = 'your-email@example.com';

-- Step 2: Activate the subscription
UPDATE users 
SET 
    subscription_status = 'active',
    subscription_expires_at = NOW() + INTERVAL '1 month',  -- Change to '1 year' for yearly
    updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Step 3: Verify it's activated
SELECT 
    email,
    subscription_status,
    subscription_expires_at
FROM users 
WHERE email = 'your-email@example.com';

-- Step 4: (Optional) If you have the subscription details from Polar, insert them
-- Get subscription ID from Polar dashboard first, then run:

-- INSERT INTO polar_subscriptions (
--     user_id,
--     subscription_id,
--     status,
--     product_id,
--     price_id,
--     current_period_start,
--     current_period_end,
--     cancel_at_period_end,
--     created_at,
--     updated_at
-- ) VALUES (
--     (SELECT id FROM users WHERE email = 'your-email@example.com'),
--     'sub_xxxxxxxxxxxxx',  -- Get from Polar dashboard
--     'active',
--     'prod_xxxxxxxxxxxxx',  -- Get from Polar dashboard
--     'price_xxxxxxxxxxxxx',  -- Get from Polar dashboard
--     NOW(),
--     NOW() + INTERVAL '1 month',
--     false,
--     NOW(),
--     NOW()
-- );
