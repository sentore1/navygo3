# Test Plan: AI Access for stokeoriginal@gmail.com

## Step 1: Check Current Status

Run `CHECK_STOKEORIGINAL_USER.sql` in Supabase SQL Editor.

This will show:
- User info (role, trial access)
- Stripe subscription status
- Polar subscription status
- KPay subscription status
- AI settings (global)
- Final recommendation

## Step 2: Grant Access (Choose One Method)

### Method A: Trial Access (Quickest - RECOMMENDED)

```sql
UPDATE users 
SET has_trial_access = true 
WHERE email = 'stokeoriginal@gmail.com';
```

✅ **Pros**: Instant access, no subscription needed
⏱️ **Time**: 1 second
🎯 **Use**: Quick testing

### Method B: Make Admin (For Full Testing)

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'stokeoriginal@gmail.com';
```

✅ **Pros**: Full admin access, can test all features
⏱️ **Time**: 1 second
🎯 **Use**: If you want to test admin features too

### Method C: Activate Subscription (If User Paid)

```sql
-- For Stripe
UPDATE subscriptions 
SET status = 'active',
    current_period_end = EXTRACT(EPOCH FROM (NOW() + INTERVAL '30 days'))
WHERE user_id::text = (SELECT id::text FROM users WHERE email = 'stokeoriginal@gmail.com');
```

✅ **Pros**: Proper subscription status
⏱️ **Time**: 1 second
🎯 **Use**: If user has paid subscription

## Step 3: Verify Access

```sql
SELECT 
  u.email,
  u.role,
  u.has_trial_access,
  COALESCE(s.status, 'none') as stripe_status,
  CASE 
    WHEN u.role = 'admin' THEN '✅ Has AI Access'
    WHEN u.has_trial_access = true THEN '✅ Has AI Access'
    WHEN s.status = 'active' THEN '✅ Has AI Access'
    ELSE '❌ No AI Access'
  END as ai_access
FROM users u
LEFT JOIN subscriptions s ON s.user_id::text = u.id::text
WHERE u.email = 'stokeoriginal@gmail.com';
```

Should show: **✅ Has AI Access**

## Step 4: Test in Browser

1. Log in as `stokeoriginal@gmail.com`
2. Go to `/dashboard`
3. Click "Create Goal"
4. Click "AI Goal Creator" tab
5. Enter prompt: "I want to learn Spanish in 3 months"
6. Click "Generate Goal"

### Expected Result ✅
- AI generates a goal with title
- Shows 5-7 relevant milestones
- Milestones are specific and actionable
- No error messages

### If You See Error ❌
- "AI goal creation requires a Pro subscription" → Access not granted, rerun Step 2
- "AI is disabled by admin" → Enable AI in `/admin/settings`
- "API key not configured" → Add API key to environment variables
- Hardcoded/generic milestones → Type mismatch not fixed, run `FIX_STEP_BY_STEP.sql`

## Step 5: Check Browser Console

Open DevTools (F12) → Console tab

### Success Logs ✅
```
User has access - Admin: true/false, Subscription: true, Trial: true
Successfully generated goal: {title: "...", milestones: [...]}
```

### Error Logs ❌
```
User does not have Pro access
Error: AI goal creation requires a Pro subscription
```

## Step 6: Check Edge Function Logs

1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Click "supabase-functions-generate-ai-goal"
4. View recent logs

### Success Logs ✅
```
User has access - Admin: false, Subscription: true, Trial: false
Using AI provider: openai, model: gpt-3.5-turbo
Successfully parsed goal data
```

### Error Logs ❌
```
User does not have Pro access
AI is disabled, using fallback generation
```

## Troubleshooting

### Issue: Still Shows "No AI Access"

**Check 1: AI Enabled Globally?**
```sql
SELECT ai_enabled FROM ai_settings;
```
If `false`, enable in `/admin/settings`

**Check 2: API Key Configured?**
```sql
SELECT current_provider_configured FROM ai_settings;
```
If `false`, add API key to environment variables

**Check 3: Type Mismatch?**
Run `FIX_STEP_BY_STEP.sql` to fix database schema

### Issue: Gets Hardcoded Goals

This means the type mismatch is preventing subscription checks.

**Solution**: Run `FIX_STEP_BY_STEP.sql`

### Issue: "AI is disabled"

**Solution**: 
1. Go to `/admin/settings`
2. Toggle "Enable AI Goal Creation" to ON
3. Ensure API key is configured

## Quick Fix Summary

**Fastest way to test:**

1. Run this ONE query:
```sql
UPDATE users SET has_trial_access = true WHERE email = 'stokeoriginal@gmail.com';
```

2. Log in as that user

3. Try AI goal creation

4. Should work immediately!

## After Testing

If you want to remove trial access:
```sql
UPDATE users SET has_trial_access = false WHERE email = 'stokeoriginal@gmail.com';
```

If you want to remove admin role:
```sql
UPDATE users SET role = 'user' WHERE email = 'stokeoriginal@gmail.com';
```

## Long-Term Fix

For production, you MUST fix the type mismatch:

1. Run `FIX_STEP_BY_STEP.sql`
2. This converts `subscriptions.user_id` from TEXT to UUID
3. After this, subscription checks will work properly
4. Pro users will automatically have AI access

## Summary

**Quick Test**: Grant trial access → Test AI → Works!
**Long-Term**: Fix type mismatch → All Pro users get AI access

Choose trial access for immediate testing, then fix the type mismatch for production.
