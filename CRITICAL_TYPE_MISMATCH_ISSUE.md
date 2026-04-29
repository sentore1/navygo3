# CRITICAL: User ID Type Mismatch Issue

## Problem

There's a data type mismatch between tables:
- `users.id` is **UUID**
- `subscriptions.user_id` is **TEXT**
- `polar_subscriptions.user_id` might be **TEXT** or **UUID**

This causes the error:
```
ERROR: operator does not exist: text = uuid
```

## Impact

This prevents:
- ✅ Subscription checks from working
- ✅ AI goal creation access control
- ✅ Any query joining users with subscriptions
- ✅ Proper foreign key relationships

## Why This Happened

The `subscriptions` table was likely created with `user_id` as TEXT to match Stripe's format, but the `users` table uses UUID for the primary key.

## Solution

### Option 1: Fix Database Schema (RECOMMENDED)

Run `FIX_USER_ID_TYPE_MISMATCH.sql` to convert all `user_id` columns to UUID:

```sql
-- This will:
-- 1. Convert subscriptions.user_id from TEXT to UUID
-- 2. Convert polar_subscriptions.user_id to UUID (if needed)
-- 3. Fix foreign key constraints
-- 4. Ensure all tables use consistent types
```

**Steps:**
1. Backup your database first!
2. Run `FIX_USER_ID_TYPE_MISMATCH.sql` in Supabase SQL Editor
3. Verify with test queries
4. Redeploy Edge Functions (they should work automatically)

### Option 2: Temporary Workaround (Type Casting)

Use explicit type casting in queries:

```sql
-- Instead of:
LEFT JOIN subscriptions s ON s.user_id = u.id

-- Use:
LEFT JOIN subscriptions s ON s.user_id::text = u.id::text
```

This works but is slower and not recommended for production.

## How to Fix

### Step 1: Check Current Schema

```sql
-- Run CHECK_SCHEMA_MISMATCH.sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name IN ('id', 'user_id')
AND table_name IN ('users', 'subscriptions', 'polar_subscriptions')
ORDER BY table_name, column_name;
```

### Step 2: Run the Fix

```sql
-- Run FIX_USER_ID_TYPE_MISMATCH.sql
-- This will convert all user_id columns to UUID
```

### Step 3: Verify

```sql
-- Test the join that was failing
SELECT 
  u.email,
  u.role,
  s.status as stripe_status,
  p.status as polar_status
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN polar_subscriptions p ON p.user_id = u.id
LIMIT 5;
```

Should work without errors!

### Step 4: Test AI Access

```sql
-- Run CHECK_USER_AI_ACCESS_FIXED.sql
-- Replace USER_EMAIL with actual email
```

## After Fix

Once fixed, these will work:

1. ✅ Subscription checks in Edge Functions
2. ✅ AI goal creation for Pro users
3. ✅ All diagnostic queries
4. ✅ Proper foreign key relationships
5. ✅ Better database performance

## Edge Functions

The Edge Functions use Supabase client which handles type conversion automatically, so they should work after the database fix without code changes.

## Diagnostic Files

Use these files:

1. `CHECK_SCHEMA_MISMATCH.sql` - Check current schema
2. `FIX_USER_ID_TYPE_MISMATCH.sql` - Fix the mismatch (RUN THIS!)
3. `CHECK_USER_AI_ACCESS_FIXED.sql` - Check AI access (with type casting workaround)

## Why This is Critical

Without fixing this:
- Pro users can't use AI goal creation
- Subscription checks fail silently
- Database queries are slower (type casting)
- Foreign key constraints don't work properly
- Data integrity issues

## Recommendation

**Run `FIX_USER_ID_TYPE_MISMATCH.sql` immediately** to fix this permanently.

## Backup First!

Before running the fix:
```sql
-- Backup subscriptions table
CREATE TABLE subscriptions_backup AS SELECT * FROM subscriptions;

-- Backup polar_subscriptions table
CREATE TABLE polar_subscriptions_backup AS SELECT * FROM polar_subscriptions;
```

## Rollback (if needed)

If something goes wrong:
```sql
-- Restore from backup
DROP TABLE subscriptions;
ALTER TABLE subscriptions_backup RENAME TO subscriptions;

DROP TABLE polar_subscriptions;
ALTER TABLE polar_subscriptions_backup RENAME TO polar_subscriptions;
```

## Summary

1. **Problem**: user_id type mismatch (TEXT vs UUID)
2. **Impact**: Subscription checks fail, AI access broken
3. **Solution**: Run `FIX_USER_ID_TYPE_MISMATCH.sql`
4. **Result**: All tables use UUID, everything works

**This is a critical fix that should be applied immediately!**
