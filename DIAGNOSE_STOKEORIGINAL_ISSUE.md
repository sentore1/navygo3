# Diagnose: Why stokeoriginal@gmail.com Can't Access AI

## Run This Query

Open Supabase SQL Editor and run: `DIAGNOSE_WHY_NO_AI_ACCESS.sql`

This will check 8 things and tell you exactly what's wrong.

## What It Checks

### 1. User Exists?
- ✅ User found
- ❌ User not found

### 2. User Info
- Is user admin?
- Does user have trial access?
- When was account created?

### 3. Stripe Subscription
- ✅ Has active Stripe subscription
- ⚠️ Has subscription but not active
- ❌ No Stripe subscription

### 4. Polar Subscription
- ✅ Has active Polar subscription
- ⚠️ Has subscription but not active
- ❌ No Polar subscription

### 5. KPay Subscription
- ✅ Has active KPay subscription
- ❌ No KPay subscription

### 6. AI Settings (Global)
- ✅ AI enabled and API key configured
- ❌ AI disabled by admin
- ❌ API key not configured

### 7. Type Mismatch
- ✅ No type mismatch
- ❌ TYPE MISMATCH FOUND (this blocks subscriptions)

### 8. Final Diagnosis
- Should user have AI access?
- What's the reason?
- What action to take?

## Possible Results

### Result A: User Has No Subscription
```
❌ NO AI ACCESS - No active subscription
Reason: User has NO active subscription
Action: User needs to purchase a Pro plan
```

**Solution**: User needs to subscribe at `/pricing`

### Result B: Type Mismatch Blocking Access
```
✅ Should have AI access (Stripe subscription)
❌ TYPE MISMATCH - users.id (UUID) vs subscriptions.user_id (TEXT)
Action: Run FIX_STEP_BY_STEP.sql to fix
```

**Solution**: Run `FIX_STEP_BY_STEP.sql` to fix database schema

### Result C: AI Disabled Globally
```
❌ AI is DISABLED by admin
Action: Go to /admin/settings and enable AI
```

**Solution**: 
1. Go to `/admin/settings`
2. Toggle "Enable AI Goal Creation" to ON

### Result D: API Key Not Configured
```
❌ API key NOT configured
Action: Add API key to environment variables
```

**Solution**: Add to Vercel/hosting platform:
```
OPENAI_API_KEY=sk-xxxxx
```

## Most Likely Issues

Based on the symptoms, the issue is probably ONE of these:

### Issue 1: Type Mismatch (Most Likely)
The database has mismatched types preventing subscription checks.

**How to confirm**: Query will show "TYPE MISMATCH"

**How to fix**: Run `FIX_STEP_BY_STEP.sql`

### Issue 2: No Active Subscription
User hasn't subscribed or subscription expired.

**How to confirm**: Query will show "NO active subscription"

**How to fix**: User needs to subscribe at `/pricing`

### Issue 3: AI Disabled
Admin disabled AI globally.

**How to confirm**: Query will show "AI is DISABLED"

**How to fix**: Enable in `/admin/settings`

## Next Steps

1. **Run the diagnostic query**: `DIAGNOSE_WHY_NO_AI_ACCESS.sql`

2. **Read the results**: Look at the "FINAL DIAGNOSIS" and "SUMMARY" sections

3. **Apply the fix**: Based on what the query says:
   - Type mismatch → Run `FIX_STEP_BY_STEP.sql`
   - No subscription → User needs to subscribe
   - AI disabled → Enable in admin settings
   - API key missing → Add to environment variables

4. **Test again**: Have user try AI goal creation

## Example Output

If the query shows:
```
FINAL DIAGNOSIS:
✅ Should have AI access (Stripe subscription)

SUMMARY:
❌ ISSUE: Type mismatch between users.id (UUID) and subscriptions.user_id (TEXT)
Solution: Run FIX_STEP_BY_STEP.sql to fix type mismatch
```

This means:
- User HAS a subscription
- But the type mismatch is blocking the check
- Fix: Run `FIX_STEP_BY_STEP.sql`

## After Diagnosis

Once you know the issue, refer to:
- Type mismatch → `FIX_STEP_BY_STEP.sql`
- No subscription → User subscribes at `/pricing`
- AI disabled → Enable in `/admin/settings`
- API key missing → Add to environment variables

## Summary

**Don't grant admin access.** Instead:
1. Run diagnostic query
2. Identify the exact issue
3. Fix the root cause
4. User will have AI access as a Pro user

This is the proper way to diagnose and fix the issue!
