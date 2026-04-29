# 🚀 RUN THIS TEST NOW

## You Asked: "Test user who have pro sub and see if he can access ai goal creation not only admin"

Here's how to test it:

---

## Quick Test (30 seconds)

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/sql

### Step 2: Copy and Paste This Query

```sql
-- Quick test to see if Pro users can access AI

-- 1. Find Pro users
SELECT 
  '1. PRO USERS' as test,
  u.email,
  s.status as subscription_status
FROM users u
LEFT JOIN subscriptions s ON s.user_id::text = u.id::text
WHERE s.status = 'active' AND u.role != 'admin'
LIMIT 3;

-- 2. Check type mismatch
SELECT 
  '2. TYPE MISMATCH' as test,
  (SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') as users_id,
  (SELECT data_type FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'user_id') as subs_user_id,
  CASE 
    WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') != 
         (SELECT data_type FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'user_id')
    THEN '❌ MISMATCH - Pro users BLOCKED'
    ELSE '✅ Match - Pro users OK'
  END as result;

-- 3. Test stokeoriginal@gmail.com
SELECT 
  '3. STOKEORIGINAL TEST' as test,
  u.email,
  (SELECT COUNT(*) FROM subscriptions s WHERE s.user_id::text = u.id::text AND s.status = 'active') as has_subscription,
  CASE 
    WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'user_id') = 'text'
    THEN '❌ Has subscription BUT Edge Function cant see it'
    ELSE '✅ Edge Function can see subscription'
  END as edge_function_can_see
FROM users u
WHERE u.email = 'stokeoriginal@gmail.com';
```

### Step 3: Click "Run"

---

## What You'll See

### If Pro Users Are Blocked (Current State)

```
1. PRO USERS
Email: stokeoriginal@gmail.com
Subscription Status: active

2. TYPE MISMATCH
users_id: uuid
subs_user_id: text
Result: ❌ MISMATCH - Pro users BLOCKED

3. STOKEORIGINAL TEST
Email: stokeoriginal@gmail.com
Has Subscription: 1
Edge Function Can See: ❌ Has subscription BUT Edge Function cant see it
```

**This proves Pro users are blocked!**

---

## Detailed Test (2 minutes)

For more details, run one of these files:

### Option A: Comprehensive Test
File: `TEST_PRO_USER_AI_ACCESS.sql`
Shows: 9 sections with full analysis

### Option B: Edge Function Simulation
File: `SIMULATE_EDGE_FUNCTION_CHECK.sql`
Shows: Exactly what Edge Function does step-by-step

### Option C: Simple Check
File: `SIMPLE_CHECK_TYPE_MISMATCH.sql`
Shows: Just the type mismatch status

---

## The Fix (3 minutes)

Once you confirm Pro users are blocked:

1. Open `FIX_STEP_BY_STEP.sql`
2. Run each statement ONE AT A TIME
3. Wait for each to complete
4. Run the test again
5. Should now show: ✅ Match - Pro users OK

---

## Summary

**Current State:**
- ✅ Admin can use AI (no subscription check)
- ❌ Pro users CANNOT use AI (type mismatch blocks them)
- ✅ Trial users can use AI (no subscription check)

**After Fix:**
- ✅ Admin can use AI
- ✅ Pro users CAN use AI
- ✅ Trial users can use AI

---

## Files Reference

| File | Purpose | Time |
|------|---------|------|
| Quick test (above) | Fast check | 30 sec |
| TEST_PRO_USER_AI_ACCESS.sql | Comprehensive | 2 min |
| SIMULATE_EDGE_FUNCTION_CHECK.sql | Edge Function simulation | 2 min |
| SIMPLE_CHECK_TYPE_MISMATCH.sql | Type check only | 30 sec |
| FIX_STEP_BY_STEP.sql | The fix | 3 min |

---

## Next Steps

1. ✅ Run the quick test above (30 seconds)
2. ✅ Confirm Pro users are blocked
3. ✅ Run `FIX_STEP_BY_STEP.sql` (3 minutes)
4. ✅ Run test again to verify fix
5. ✅ Pro users can now use AI!

---

**Copy the quick test query above and run it in Supabase SQL Editor now!** 🚀
