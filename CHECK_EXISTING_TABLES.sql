-- Check what subscription-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%subscr%' 
  OR table_name LIKE '%polar%'
  OR table_name LIKE '%product%'
  OR table_name LIKE '%plan%'
ORDER BY table_name;

-- Check polar_subscriptions structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'polar_subscriptions'
ORDER BY ordinal_position;

-- Check kpay_transactions structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'kpay_transactions'
ORDER BY ordinal_position;
