# Quick Fix Reference: AI Subscription Access

## What Was Wrong?
AI goal creation worked for admins but showed hardcoded goals for regular users.

## What Was Fixed?
Added subscription checks to Edge Functions so only Pro users (or admins/trial users) can use AI goal creation.

## Deployment Status
✅ `supabase-functions-generate-ai-goal` - Deployed
✅ `supabase-functions-openai-goal` - Deployed

## Who Can Use AI Now?
- ✅ Admins (always)
- ✅ Users with active Stripe subscription
- ✅ Users with active Polar subscription
- ✅ Users with trial access
- ❌ Free users (see error message)

## Quick Test
```bash
# 1. Log in as free user
# 2. Try to create AI goal
# 3. Should see: "AI goal creation requires a Pro subscription"
```

## Check User Access
```sql
SELECT 
  u.email,
  u.role,
  u.has_trial_access,
  (SELECT COUNT(*) FROM subscriptions WHERE user_id = u.id AND status = 'active') as has_stripe,
  (SELECT COUNT(*) FROM polar_subscriptions WHERE user_id = u.id AND status = 'active') as has_polar
FROM users u
WHERE u.email = 'user@example.com';
```

## Grant Trial Access
```sql
UPDATE users 
SET has_trial_access = true 
WHERE email = 'user@example.com';
```

## View Function Logs
https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/functions

## Files Changed
1. `supabase/functions/supabase-functions-generate-ai-goal/index.ts`
2. `supabase/functions/supabase-functions-openai-goal/index.ts`
3. `src/components/ai-goal-creator.tsx`

## Documentation
- Full details: `FIX_AI_SUBSCRIPTION_ACCESS.md`
- Testing guide: `TEST_AI_SUBSCRIPTION_FIX.md`
- Summary: `AI_SUBSCRIPTION_FIX_SUMMARY.md`

## Done! 🎉
The fix is deployed and ready to test.
