-- Test if avatar updates work now
-- Run this in Supabase SQL Editor while logged in

-- First, check your current avatar
SELECT 
  id,
  email,
  name,
  avatar_url,
  updated_at
FROM users
WHERE id = auth.uid();

-- Try to update your avatar
UPDATE users 
SET 
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=test123',
  updated_at = NOW()
WHERE id = auth.uid()
RETURNING id, email, avatar_url, updated_at;

-- Verify it was saved
SELECT 
  id,
  email,
  name,
  avatar_url,
  updated_at
FROM users
WHERE id = auth.uid();
