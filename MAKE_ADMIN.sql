-- ============================================
-- STEP 1: Run the migration FIRST
-- ============================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20260403000001_add_admin_role.sql
-- 
-- Then click "Run" in Supabase SQL Editor
-- 
-- This will:
-- - Add the 'role' column to users table
-- - Create payment_gateway_settings table
-- - Set up RLS policies
-- ============================================

-- ============================================
-- STEP 2: Make yourself an admin
-- ============================================
-- After the migration runs successfully,
-- run this query (replace with your email):

UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- ============================================
-- STEP 3: Verify it worked
-- ============================================
-- Run this to confirm you're now an admin:

SELECT id, email, role, created_at 
FROM users 
WHERE role = 'admin';

-- You should see your user with role = 'admin'
-- ============================================

-- Alternative: Make admin by user ID
-- If you know your user ID, you can use:
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-uuid-here';
