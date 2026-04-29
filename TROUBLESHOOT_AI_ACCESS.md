# Troubleshooting: Pro Users Can't Use AI Goal Creation

## Problem
Pro users (with paid subscriptions) cannot use AI goal creation, but admins can.

## How AI Access Works

AI goal creation is available to:
1. ✅ **Admins** - Users with `role = 'admin'`
2. ✅ **Pro Users with Active Stripe Subscription** - `subscriptions.status = 'active'`
3. ✅ **Pro Users with Active Polar Subscription** - `polar_subscriptions.status = 'active'`
4. ✅ **Users with Trial Access** - `users.has_trial_access = true`
5. ❌ **Free Users** - No subscription

## Diagnostic Steps

### Step 1: Check User's Subscription Status

Run this query (replace `USER_EMAIL` with actual email):

```sql
SELECT 
  u.email,
  u.role,
  u.has_trial_access,
  s.status as stripe_status,
  p.status as polar_status,
  CASE 
    WHEN u.role = 'admin' THEN '✅ Has Access (Admin)'
    WHEN u.has_trial_access = true THEN '✅ Has Access (Trial)'
    WHEN s.status = 'active' THEN '✅ Has Access (Stripe)'
    WHEN p.status = 'active' THEN '✅ Has Access (Polar)'
    ELSE '❌ No Access'
  END as ai_access
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN polar_subscriptions p ON p.user_id = u.id AND p.status = 'active'
WHERE u.email = 'USER_EMAIL';
```

### Step 2: Check AI Settings (Admin Configuration)

```sql
SELECT 
  ai_enabled,
  ai_provider,
  ai_model,
  openai_api_key_configured,
  current_provider_configured
FROM ai_settings;
```

If `ai_enabled = false`, AI is disabled globally by admin.

### Step 3: Check Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `supabase-functions-generate-ai-goal`
4. View logs for error messages

Look for:
- "User does not have Pro access" - Subscription check failed
- "AI is disabled" - Admin disabled AI
- "API key not found" - Provider API key missing

## Common Issues & Solutions

### Issue 1: User Has Subscription But Can't Use AI

**Symptoms:**
- User paid for subscription
- Subscription shows in Stripe/Polar dashboard
- Still can't use AI goal creation

**Possible Causes:**

#### A. Subscription Not in Database
Check if subscription exists:
```sql
SELECT * FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');
SELECT * FROM polar_subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');
```

**Solution:** Webhook may not have fired. Manually create subscription record or trigger webhook again.

#### B. Subscription Status Not "active"
Check status:
```sql
SELECT status FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');
```

**Solution:** Update status:
```sql
UPDATE subscriptions 
SET status = 'active' 
WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');
```

#### C. User ID Mismatch
Check if user IDs match:
```sql
SELECT 
  u.id as user_id,
  u.email,
  s.user_id as subscription_user_id
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'USER_EMAIL';
```

**Solution:** Fix user_id in subscription:
```sql
UPDATE subscriptions 
SET user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL')
WHERE stripe_id = 'sub_xxxxx';
```

### Issue 2: AI Disabled Globally

**Symptoms:**
- All users (except admin) can't use AI
- Error: "AI goal creation is currently disabled"

**Check:**
```sql
SELECT ai_enabled FROM ai_settings;
```

**Solution:** Enable AI in Admin Settings:
1. Go to `/admin/settings`
2. Toggle "Enable AI Goal Creation" to ON
3. Ensure API key is configured

### Issue 3: API Key Not Configured

**Symptoms:**
- Error: "AI service is not configured"
- Error: "The [provider] API key is missing"

**Check:**
```sql
SELECT 
  ai_provider,
  openai_api_key_configured,
  groq_api_key_configured,
  grok_api_key_configured,
  gemini_api_key_configured,
  current_provider_configured
FROM ai_settings;
```

**Solution:** Add API key to environment variables:
```bash
# In Vercel/hosting platform
OPENAI_API_KEY=sk-xxxxx
# or
GROQ_API_KEY=gsk_xxxxx
# or
GROK_API_KEY=xai-xxxxx
# or
GEMINI_API_KEY=AIzaSy-xxxxx
```

Then redeploy the application.

### Issue 4: Edge Function Not Deployed

**Symptoms:**
- Error: "Function not found"
- 404 error when calling function

**Solution:** Deploy the functions:
```bash
supabase functions deploy supabase-functions-generate-ai-goal
supabase functions deploy supabase-functions-openai-goal
```

### Issue 5: User Has Wrong user_id Format

**Symptoms:**
- Subscription exists but not found
- User ID mismatch errors

**Check:**
```sql
-- Check user ID format
SELECT id, user_id, email FROM users WHERE email = 'USER_EMAIL';

-- Check subscription user_id format
SELECT user_id FROM subscriptions WHERE stripe_id = 'sub_xxxxx';
```

**Solution:** Ensure both use the same ID format (UUID vs text).

## Quick Fixes

### Grant Trial Access (Temporary)
Give user temporary AI access for testing:
```sql
UPDATE users 
SET has_trial_access = true 
WHERE email = 'USER_EMAIL';
```

### Manually Activate Subscription
If subscription exists but not active:
```sql
-- For Stripe
UPDATE subscriptions 
SET status = 'active',
    current_period_end = EXTRACT(EPOCH FROM (NOW() + INTERVAL '30 days'))
WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');

-- For Polar
UPDATE polar_subscriptions 
SET status = 'active',
    current_period_end = NOW() + INTERVAL '30 days'
WHERE user_id = (SELECT id FROM users WHERE email = 'USER_EMAIL');
```

### Enable AI Globally
```sql
UPDATE ai_settings 
SET ai_enabled = true;
```

## Testing AI Access

### Test as Pro User
1. Log in as user with active subscription
2. Go to dashboard
3. Click "Create Goal"
4. Click "AI Goal Creator"
5. Enter a prompt
6. Click "Generate Goal"
7. Should see AI-generated goal (not hardcoded)

### Test as Free User
1. Log in as user without subscription
2. Go to dashboard
3. Click "Create Goal"
4. Click "AI Goal Creator"
5. Should see error: "AI goal creation requires a Pro subscription"

## Verification Query

Run this comprehensive check:
```sql
-- See CHECK_USER_AI_ACCESS.sql for full diagnostic query
```

## Still Not Working?

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when clicking "Generate Goal"
4. Common errors:
   - 403: Subscription check failed
   - 401: Not authenticated
   - 500: Server error (check function logs)

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Generate Goal"
4. Look for request to `supabase-functions-generate-ai-goal`
5. Check response:
   - Status 200: Success
   - Status 403: No subscription
   - Status 500: Server error

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Click on function name
4. View logs for detailed error messages

## Contact Support

If issue persists after trying all solutions:
1. Provide user email
2. Provide subscription ID (from Stripe/Polar)
3. Provide error message from browser console
4. Provide Edge Function logs
5. Provide results from diagnostic queries

## Summary

Pro users SHOULD be able to use AI goal creation. If they can't:
1. Check subscription exists and is active
2. Check AI is enabled globally
3. Check API key is configured
4. Check Edge Functions are deployed
5. Use diagnostic queries to identify issue
6. Apply appropriate fix from above
