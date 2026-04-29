# How to Test AI Access for stokeoriginal@gmail.com

## The Problem

User `stokeoriginal@gmail.com` cannot access AI goal creation even though they should have access. The root cause is a **type mismatch** in the database:

- `users.id` is **UUID** type
- `subscriptions.user_id` is **TEXT** type

This prevents the Edge Function from checking if the user has an active subscription, so it denies access.

## Testing Methods

### Method 1: Run SQL Diagnostic (EASIEST)

1. Open Supabase SQL Editor
2. Run `CHECK_STOKEORIGINAL_DETAILED.sql`
3. This will show:
   - User info
   - Type mismatch status
   - Subscription status
   - What the Edge Function sees
   - Exact diagnosis and solution

### Method 2: Test via curl (REQUIRES PASSWORD)

Run this command in Git Bash:

```bash
bash quick-test-ai.sh YOUR_PASSWORD
```

Replace `YOUR_PASSWORD` with the actual password for stokeoriginal@gmail.com.

This will:
1. Authenticate the user
2. Call the AI goal creation Edge Function
3. Show the exact error response

### Method 3: Test via PowerShell (REQUIRES PASSWORD)

```powershell
.\TEST_AI_ACCESS.ps1
```

Enter the password when prompted.

## Expected Results

### If Type Mismatch Exists (CURRENT STATE)

The curl test will return:
```json
{
  "error": "AI goal creation requires a Pro subscription",
  "requiresSubscription": true
}
```

Even if the user has an active subscription!

### After Fixing Type Mismatch

The curl test will return:
```json
{
  "title": "Learn Spanish in 3 months",
  "description": "...",
  "milestones": [...]
}
```

## How to Fix

### Step 1: Backup (CRITICAL!)

```sql
CREATE TABLE subscriptions_backup AS SELECT * FROM subscriptions;
CREATE TABLE polar_subscriptions_backup AS SELECT * FROM polar_subscriptions;
```

### Step 2: Run the Fix

Open `FIX_STEP_BY_STEP.sql` and run each statement ONE AT A TIME in Supabase SQL Editor.

The fix will:
1. Drop foreign key constraints
2. Convert `subscriptions.user_id` from TEXT to UUID
3. Convert `polar_subscriptions.user_id` from TEXT to UUID (if needed)
4. Re-add foreign key constraints

### Step 3: Verify

Run `CHECK_STOKEORIGINAL_DETAILED.sql` again to verify the fix worked.

### Step 4: Test

Run the curl test again:
```bash
bash quick-test-ai.sh YOUR_PASSWORD
```

Should now return a successful AI-generated goal!

## Alternative Quick Fixes (NOT RECOMMENDED)

### Option 1: Grant Trial Access (Temporary)

```sql
UPDATE users 
SET has_trial_access = true 
WHERE email = 'stokeoriginal@gmail.com';
```

This bypasses the subscription check but doesn't fix the root cause.

### Option 2: Make User Admin (NOT RECOMMENDED)

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'stokeoriginal@gmail.com';
```

This gives the user full admin access, which is not what you want.

## Why This Happened

The `subscriptions` table was created with `user_id` as TEXT to match Stripe's customer ID format. However, the `users` table uses UUID for the primary key. This creates a type mismatch that prevents JOIN operations.

## Impact

This affects:
- ✅ All Pro users trying to use AI goal creation
- ✅ Subscription checks in Edge Functions
- ✅ Any query joining users with subscriptions
- ✅ Database performance (requires type casting)

## Files Reference

- `FIX_STEP_BY_STEP.sql` - The fix (run this!)
- `CHECK_STOKEORIGINAL_DETAILED.sql` - Diagnostic queries
- `quick-test-ai.sh` - Bash test script
- `TEST_AI_ACCESS.ps1` - PowerShell test script
- `DIAGNOSE_WHY_NO_AI_ACCESS.sql` - General diagnostic

## Summary

1. **Problem**: Type mismatch blocks subscription checks
2. **Impact**: Pro users can't access AI features
3. **Solution**: Run `FIX_STEP_BY_STEP.sql`
4. **Test**: Use curl or SQL diagnostic
5. **Result**: All Pro users can use AI goal creation

## Next Steps

1. Run `CHECK_STOKEORIGINAL_DETAILED.sql` to confirm the issue
2. Backup tables
3. Run `FIX_STEP_BY_STEP.sql` one statement at a time
4. Test with curl or SQL
5. Verify all Pro users can now access AI features

---

**IMPORTANT**: This is a critical fix that should be applied immediately. It affects all Pro users, not just stokeoriginal@gmail.com.
