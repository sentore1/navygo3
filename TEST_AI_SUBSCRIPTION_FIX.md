# Test AI Subscription Fix

## ✅ Deployment Complete

Both AI goal generation functions have been deployed with subscription checks:
- `supabase-functions-generate-ai-goal` ✅
- `supabase-functions-openai-goal` ✅

## Testing Steps

### Test 1: Admin User (Should Work)
1. Log in as admin user
2. Go to dashboard
3. Click "Create Goal" → "AI Goal Creator"
4. Enter a goal prompt (e.g., "I want to learn Spanish")
5. Click "Generate Goal"
6. **Expected**: AI generates a goal with milestones

### Test 2: Pro User with Active Subscription (Should Work)
1. Log in as a user with an active Stripe or Polar subscription
2. Go to dashboard
3. Click "Create Goal" → "AI Goal Creator"
4. Enter a goal prompt
5. Click "Generate Goal"
6. **Expected**: AI generates a goal with milestones

### Test 3: Free User (Should Show Error)
1. Log in as a user without subscription
2. Go to dashboard
3. Click "Create Goal" → "AI Goal Creator"
4. Enter a goal prompt
5. Click "Generate Goal"
6. **Expected**: Error message: "AI goal creation requires a Pro subscription. Please upgrade to use this feature."

### Test 4: User with Trial Access (Should Work)
1. Log in as a user with `has_trial_access = true`
2. Go to dashboard
3. Click "Create Goal" → "AI Goal Creator"
4. Enter a goal prompt
5. Click "Generate Goal"
6. **Expected**: AI generates a goal with milestones

## Verify in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/functions
2. Check that both functions are deployed
3. Click on each function to view logs
4. Test the functions and watch the logs for:
   - "User has access - Admin: true/false, Subscription: true/false, Trial: true/false"
   - "User does not have Pro access" (for free users)

## Check User Subscription Status

Run this query in Supabase SQL Editor to check a user's status:

```sql
-- Replace 'USER_EMAIL' with the actual user email
SELECT 
  u.id,
  u.email,
  u.role,
  u.has_trial_access,
  (SELECT COUNT(*) FROM subscriptions WHERE user_id = u.id AND status = 'active') as stripe_subscriptions,
  (SELECT COUNT(*) FROM polar_subscriptions WHERE user_id = u.id AND status = 'active') as polar_subscriptions
FROM users u
WHERE u.email = 'USER_EMAIL';
```

## Grant Trial Access to Test User

If you want to test with trial access:

```sql
-- Replace 'USER_EMAIL' with the actual user email
UPDATE users 
SET has_trial_access = true 
WHERE email = 'USER_EMAIL';
```

## Common Issues

### Issue: "AI service is not configured"
**Solution**: Make sure AI is enabled in Admin Settings and the API key is configured

### Issue: Still seeing hardcoded goals
**Solution**: 
1. Check browser console for errors
2. Verify functions are deployed (check Supabase dashboard)
3. Clear browser cache and reload
4. Check Supabase function logs for errors

### Issue: "Unauthorized" error
**Solution**: User is not logged in. Make sure authentication is working.

## What Changed?

### Before:
- ❌ No subscription checks
- ❌ All authenticated users could use AI (but it failed silently)
- ❌ Fell back to hardcoded goals for non-admins

### After:
- ✅ Checks admin role
- ✅ Checks active Stripe subscription
- ✅ Checks active Polar subscription
- ✅ Checks trial access
- ✅ Returns clear error message for unauthorized users
- ✅ Logs access decisions for debugging

## Next Steps

1. Test with different user types (admin, pro, free)
2. Monitor function logs for any issues
3. Consider adding usage analytics to track AI goal creation
4. Consider implementing free AI credits for new users

## Support

If you encounter issues:
1. Check Supabase function logs
2. Check browser console for errors
3. Verify user subscription status in database
4. Ensure AI settings are enabled in admin panel
