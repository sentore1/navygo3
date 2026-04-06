-- Check if avatars are being saved correctly in the database
-- Run this in Supabase SQL Editor

-- Check current user avatars
SELECT 
  id,
  email,
  name,
  avatar_url,
  updated_at
FROM users
ORDER BY updated_at DESC
LIMIT 10;

-- Check if avatar_url column exists and has proper type
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'avatar_url';

-- Check for any NULL avatar_urls
SELECT 
  COUNT(*) as users_without_avatar
FROM users
WHERE avatar_url IS NULL OR avatar_url = '';

-- Check avatar URL patterns
SELECT 
  CASE 
    WHEN avatar_url LIKE '%dicebear%' THEN 'Generated Avatar'
    WHEN avatar_url LIKE '%supabase%' THEN 'Uploaded Image'
    WHEN avatar_url LIKE 'http%' THEN 'External URL'
    ELSE 'Other/Empty'
  END as avatar_type,
  COUNT(*) as count
FROM users
GROUP BY avatar_type;
