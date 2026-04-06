-- ============================================
-- RUN THIS TO CHECK YOUR DATABASE STRUCTURE
-- ============================================

-- 1. Check if users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Check what columns exist in users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check if role column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'role';

-- 4. Count how many users you have
SELECT COUNT(*) as total_users FROM users;

-- 5. See your user data (without sensitive info)
SELECT id, email, created_at 
FROM users 
LIMIT 5;
