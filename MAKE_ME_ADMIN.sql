-- Make yourself an admin
UPDATE public.users 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'abdousentore@gmail.com';

-- Verify
SELECT 
  id,
  email,
  role,
  subscription_status,
  has_trial_access
FROM public.users
WHERE email = 'abdousentore@gmail.com';
