-- ============================================
-- SIMPLEST POSSIBLE FIX - RUN THIS FIRST
-- ============================================

-- Just add the role column (PostgreSQL 9.6+ syntax)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- ============================================
-- THEN RUN THIS TO MAKE YOURSELF ADMIN
-- (Replace with your actual email!)
-- ============================================

UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- ============================================
-- VERIFY IT WORKED
-- ============================================

SELECT id, email, role 
FROM users 
WHERE email = 'your-email@example.com';

-- You should see your email with role = 'admin'
