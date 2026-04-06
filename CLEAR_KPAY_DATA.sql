-- Clear old KPay subscription data
-- Replace 'your-email@example.com' with your actual email

-- Check current subscription data
SELECT 
    id,
    email,
    subscription_status,
    subscription_expires_at
FROM users 
WHERE email = 'your-email@example.com';

-- Check KPay transactions
SELECT * FROM kpay_transactions 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- Delete KPay transactions
DELETE FROM kpay_transactions 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- Check Polar subscriptions (these should remain if you have active Polar subscription)
SELECT * FROM polar_subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- Verify KPay data is cleared
SELECT * FROM kpay_transactions 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- If you want to completely reset subscription status:
-- UPDATE users 
-- SET 
--   subscription_status = NULL,
--   subscription_expires_at = NULL
-- WHERE email = 'your-email@example.com';
