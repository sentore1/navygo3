# Test: Verify Pro User Has AI Access

## Quick Test

Replace `USER_EMAIL` with the actual user's email and run these queries:

### 1. Check User's AI Access Status

```sql
SELECT 
  u.email,
  u.role,
  u.has_trial_access,
  COALESCE(s.status, 'none') as stripe_subscription,
  COALESCE(p.status, 'none') as polar_subscription,
  CASE 
    WHEN u.role = 'admin' THEN '✅ YES - Admin Access'
    WHEN u.has_trial_access = true THEN '✅ YES - Trial Access'
    WHEN s.status = 'active' THEN '✅ YES - Stripe Pro Access'
    WHEN p.status = 'active' THEN '✅ YES - Polar Pro Access'
    ELSE '❌ NO - No Active Subscription'
  END as should_have_ai_access
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN polar_subscriptions p ON p.user_id = u.id AND p.status = 'active'
WHERE u.email = 'USER_EMAIL';
```

### 2. If Result Shows "NO", Check Why

```sql
-- Check if subscription exists but not active
SELECT 
  'Subscription Exists?' as check,
  COUNT(*) as count,
  STRING_AGG(status, ', ') as statuses
FROM subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL')
UNION ALL
SELECT 
  'Polar Subscription Exists?' as check,
  COUNT(*) as count,
  STRING_AGG(status, ', ') as statuses
FROM polar_subscriptions 
WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');
```

### 3. Check AI Settings

```sql
SELECT 
  ai_enabled as is_ai_enabled,
  ai_provider,
  current_provider_configured as is_api_key_configured,
  CASE 
    WHEN ai_enabled = false THEN '❌ AI is disabled by admin'
    WHEN current_provider_configured = false THEN '❌ API key not configured'
    ELSE '✅ AI is ready'
  END as ai_status
FROM ai_settings;
```

## Expected Results

### For Pro User (Should Have Access)
```
email: user@example.com
role: user (or null)
has_trial_access: false
stripe_subscription: active (or polar_subscription: active)
should_have_ai_access: ✅ YES - Stripe Pro Access
```

### For Admin (Should Have Access)
```
email: admin@example.com
role: admin
has_trial_access: false
stripe_subscription: none
should_have_ai_access: ✅ YES - Admin Access
```

### For Free User (Should NOT Have Access)
```
email: free@example.com
role: user (or null)
has_trial_access: false
stripe_subscription: none
polar_subscription: none
should_have_ai_access: ❌ NO - No Active Subscription
```

## If Pro User Shows "NO"

### Fix 1: Grant Trial Access (Temporary)
```sql
UPDATE users 
SET has_trial_access = true 
WHERE email = 'USER_EMAIL';
```

### Fix 2: Activate Subscription
```sql
-- If subscription exists but not active
UPDATE subscriptions 
SET status = 'active',
    current_period_end = EXTRACT(EPOCH FROM (NOW() + INTERVAL '30 days'))
WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');
```

### Fix 3: Create Missing Subscription
```sql
-- If user paid but no subscription record exists
-- Get user ID first
SELECT id FROM users WHERE email = 'USER_EMAIL';

-- Then insert subscription (replace USER_ID and STRIPE_SUBSCRIPTION_ID)
INSERT INTO subscriptions (
  user_id,
  stripe_id,
  status,
  current_period_start,
  current_period_end
) VALUES (
  'USER_ID',
  'STRIPE_SUBSCRIPTION_ID',
  'active',
  EXTRACT(EPOCH FROM NOW()),
  EXTRACT(EPOCH FROM (NOW() + INTERVAL '30 days'))
);
```

## Test in Browser

After fixing database:

1. Log in as the Pro user
2. Go to `/dashboard`
3. Click "Create Goal"
4. Click "AI Goal Creator" tab
5. Enter: "I want to learn Spanish"
6. Click "Generate Goal"
7. Should see AI-generated goal with milestones

## What You Should See

### If Access Works ✅
- AI generates a goal with title, description, and milestones
- Milestones are specific and relevant
- No error messages

### If Access Denied ❌
- Error message: "AI goal creation requires a Pro subscription"
- Or: "AI goal creation is currently disabled by the administrator"
- Or: "AI service is not configured"

## Browser Console Check

Open DevTools (F12) → Console tab:

### Success (200)
```
Successfully generated goal: {title: "...", description: "...", milestones: [...]}
```

### Subscription Required (403)
```
Error: AI goal creation requires a Pro subscription
```

### AI Disabled (200 with fallback)
```
AI is disabled, using fallback generation
```

## Summary

Pro users with active subscriptions SHOULD have AI access. If they don't:

1. Run diagnostic queries above
2. Check subscription status
3. Check AI settings
4. Apply appropriate fix
5. Test in browser

See `TROUBLESHOOT_AI_ACCESS.md` for detailed troubleshooting.
