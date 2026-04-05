-- Update subscription expiry to future date
UPDATE public.users 
SET 
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '30 days',
  has_trial_access = true,
  updated_at = NOW()
WHERE email = 'abdousentore@gmail.com';

-- Verify
SELECT 
  id,
  email,
  subscription_status,
  has_trial_access,
  subscription_expires_at,
  subscription_expires_at > NOW() as is_valid
FROM public.users
WHERE email = 'abdousentore@gmail.com';
