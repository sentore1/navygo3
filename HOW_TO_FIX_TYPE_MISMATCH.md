# How to Fix the Type Mismatch - Step by Step

## The Problem
`users.id` is UUID but `subscriptions.user_id` is TEXT, causing joins to fail.

## The Solution
Convert `subscriptions.user_id` from TEXT to UUID.

## Instructions

### Option 1: Run Complete Script (Recommended)

1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `FIX_TYPE_MISMATCH_SIMPLE.sql`
3. Click "Run"
4. Wait for completion
5. Check for success message

### Option 2: Run Step by Step (Safer)

Open `FIX_STEP_BY_STEP.sql` and run each statement ONE AT A TIME:

#### Step 1: Backup
```sql
CREATE TABLE IF NOT EXISTS subscriptions_backup AS SELECT * FROM subscriptions;
```
✅ Wait for "Success"

#### Step 2: Drop Foreign Key
```sql
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
```
✅ Wait for "Success"

#### Step 3: Convert Type
```sql
ALTER TABLE subscriptions 
ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
```
✅ Wait for "Success" - This is the critical step!

#### Step 4: Re-add Foreign Key
```sql
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```
✅ Wait for "Success"

#### Step 5: Test
```sql
SELECT 
  u.email,
  s.status
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id
LIMIT 3;
```
✅ Should return results without error!

#### Step 6: Fix Polar (if needed)
```sql
-- Backup
CREATE TABLE IF NOT EXISTS polar_subscriptions_backup AS SELECT * FROM polar_subscriptions;

-- Drop FK
ALTER TABLE polar_subscriptions DROP CONSTRAINT IF EXISTS polar_subscriptions_user_id_fkey;

-- Convert (only if TEXT)
ALTER TABLE polar_subscriptions 
ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Re-add FK
ALTER TABLE polar_subscriptions
ADD CONSTRAINT polar_subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

#### Step 7: Final Test
```sql
SELECT 
  u.email,
  u.role,
  s.status as stripe_status,
  p.status as polar_status,
  CASE 
    WHEN u.role = 'admin' THEN '✅ Has AI Access'
    WHEN s.status = 'active' THEN '✅ Has AI Access'
    WHEN p.status = 'active' THEN '✅ Has AI Access'
    ELSE '❌ No AI Access'
  END as ai_access
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN polar_subscriptions p ON p.user_id = u.id AND p.status = 'active'
LIMIT 10;
```
✅ Should show users with their AI access status!

## After Fix

Once complete:

1. ✅ Pro users can use AI goal creation
2. ✅ All subscription checks work
3. ✅ Queries run faster
4. ✅ Proper data integrity

## Test AI Access

After fixing, test with a Pro user:

1. Log in as user with active subscription
2. Go to dashboard
3. Click "Create Goal"
4. Click "AI Goal Creator"
5. Enter a prompt
6. Click "Generate Goal"
7. Should see AI-generated goal (not hardcoded!)

## Rollback (if something goes wrong)

```sql
-- Restore subscriptions
DROP TABLE subscriptions;
ALTER TABLE subscriptions_backup RENAME TO subscriptions;

-- Restore polar_subscriptions
DROP TABLE polar_subscriptions;
ALTER TABLE polar_subscriptions_backup RENAME TO polar_subscriptions;
```

## Common Issues

### "Cannot cast type text to uuid"
**Cause**: Some user_id values are not valid UUIDs

**Solution**: Check for invalid values:
```sql
SELECT user_id 
FROM subscriptions 
WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
```

Fix invalid values before converting.

### "Foreign key constraint violation"
**Cause**: Some user_id values don't exist in users table

**Solution**: Find orphaned records:
```sql
SELECT s.user_id 
FROM subscriptions s
LEFT JOIN users u ON u.id::text = s.user_id
WHERE u.id IS NULL;
```

Delete or fix these records.

## Verification

After fix, verify types match:
```sql
SELECT 
  'users.id' as column_ref,
  data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id'
UNION ALL
SELECT 
  'subscriptions.user_id' as column_ref,
  data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions' AND column_name = 'user_id';
```

Both should show `uuid`!

## Summary

1. Backup tables ✅
2. Drop foreign keys ✅
3. Convert TEXT to UUID ✅
4. Re-add foreign keys ✅
5. Test joins ✅
6. Test AI access ✅

**This fix is essential for Pro users to use AI goal creation!**
