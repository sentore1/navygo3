-- Give yourself trial access to bypass subscription check temporarily
UPDATE public.users 
SET 
  has_trial_access = true,
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL';

-- Verify
SELECT 
  email,
  subscription_status,
  has_trial_access,
  subscription_expires_at
FROM public.users
WHERE email = 'YOUR_EMAIL';
