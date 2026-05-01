# Subscription Sync Fix Guide

## Problem
Users can subscribe in Polar, but the subscription doesn't sync to the database, so they can't access the dashboard.

## Root Causes

### 1. Foreign Key Constraint Error
**Error:** `insert or update on table "users" violates foreign key constraint "users_subscription_id_fkey"`

**Cause:** The `users.subscription_id` column has a foreign key that references `subscriptions(id)` (Stripe table), but we're trying to store Polar subscription IDs.

**Fix:** Run `FIX_SUBSCRIPTION_ID_CONSTRAINT.sql` to:
- Remove the foreign key constraint
- Change `subscription_id` from UUID to TEXT

### 2. Missing Unique Constraint
**Error:** `there is no unique or exclusion constraint matching the ON CONFLICT specification`

**Cause:** The `polar_subscriptions` table doesn't have a unique constraint on `subscription_id`, so the `upsert` with `onConflict: 'subscription_id'` fails.

**Fix:** Already included in `FIX_SUBSCRIPTION_ID_CONSTRAINT.sql`

### 3. Code Still Trying to Set subscription_id
**Cause:** The `verify-checkout` endpoint was trying to set `users.subscription_id` which caused the foreign key error.

**Fix:** ✅ Already fixed in code - removed `subscription_id` from user updates

## Step-by-Step Fix

### Step 1: Fix Database Schema
Run this SQL in Supabase SQL Editor:
```sql
-- File: FIX_SUBSCRIPTION_ID_CONSTRAINT.sql
```

This will:
- Remove the foreign key constraint
- Change subscription_id to TEXT type
- Add unique constraint to polar_subscriptions

### Step 2: Deploy Code Changes
The code has been updated to:
- Not set `subscription_id` on users table (avoids foreign key error)
- Only set `subscription_status` and `subscription_expires_at`
- Log success messages for debugging

**Files changed:**
- `src/app/api/verify-checkout/route.ts` - Removed subscription_id updates

### Step 3: Fix Existing Users
For users who already subscribed but can't access dashboard:

**Option A: Manual SQL Fix**
1. Get subscription expiration date from Polar dashboard
2. Run `MANUALLY_ACTIVATE_SUBSCRIPTION.sql`
3. Update the expiration date in the SQL
4. User refreshes browser → can access dashboard

**Option B: Trigger Webhook**
1. In Polar dashboard, find the subscription
2. Trigger a webhook resend for `subscription.updated`
3. This will sync the data automatically

### Step 4: Test New Subscriptions
1. Create a test subscription in Polar
2. Check the logs for errors
3. Verify database is updated:
   ```sql
   SELECT subscription_status, subscription_expires_at 
   FROM users 
   WHERE email = 'test@example.com';
   ```
4. Try accessing `/dashboard`

## Quick Fix for rwandaform@gmail.com

```sql
-- 1. Check current status
SELECT id, email, subscription_status, subscription_expires_at
FROM users WHERE email = 'rwandaform@gmail.com';

-- 2. Get expiration date from Polar dashboard, then run:
UPDATE users 
SET 
  subscription_status = 'active',
  subscription_expires_at = '2025-06-01T00:00:00Z', -- CHANGE THIS
  updated_at = NOW()
WHERE email = 'rwandaform@gmail.com';

-- 3. User refreshes browser → can access dashboard
```

## Verification Checklist

After applying fixes:

- [ ] Run `FIX_SUBSCRIPTION_ID_CONSTRAINT.sql`
- [ ] Verify foreign key is removed: `\d users` (should not show FK on subscription_id)
- [ ] Verify unique constraint exists: `\d polar_subscriptions` (should show unique on subscription_id)
- [ ] Deploy code changes (already done)
- [ ] Fix existing users with `MANUALLY_ACTIVATE_SUBSCRIPTION.sql`
- [ ] Test new subscription flow
- [ ] Check logs for errors
- [ ] Verify dashboard access works

## Monitoring

Check these logs after a new subscription:
```
✅ User subscription_status updated to active
✅ Subscription activated for user: [user-id]
```

If you see these errors, the fix didn't work:
```
❌ Error updating user: {code: '23503', ...}
❌ Error storing subscription: {code: '42P10', ...}
```

## Files Reference

- `FIX_SUBSCRIPTION_ID_CONSTRAINT.sql` - Database schema fix
- `MANUALLY_ACTIVATE_SUBSCRIPTION.sql` - Manual user activation
- `CHECK_SUBSCRIPTION_SYNC.sql` - Diagnostic queries
- `src/app/api/verify-checkout/route.ts` - Updated code
- `middleware.ts` - Access control (already fixed)
- `src/components/subscription-check.tsx` - Access control (already fixed)

## Support

If issues persist:
1. Check Supabase logs for errors
2. Check browser console for errors
3. Verify Polar webhook is configured correctly
4. Check that user metadata includes `user_id` in Polar
