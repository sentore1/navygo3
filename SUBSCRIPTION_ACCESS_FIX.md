# Subscription Access Control Fix

## Problem Summary

User "rwandaform" could still access the dashboard despite having `subscription_status = 'inactive'` in the settings page.

## Root Cause

There were **TWO conflicting subscription checks**:

### 1. Middleware Check (middleware.ts)
- Checked `polar_subscriptions.status` and `subscriptions.status` tables
- Looked for `status = 'active'` in those tables
- **Did NOT check the `users` table** which is the single source of truth

### 2. SubscriptionCheck Component (subscription-check.tsx)
- Checked `users.subscription_status`
- Only allowed "active" status
- But this check was bypassed if middleware let the user through

### The Gap
If `polar_subscriptions.status = 'active'` but `users.subscription_status = 'inactive'`, the middleware would allow access even though the user's subscription was canceled.

## What Was Fixed

### 1. **Middleware (middleware.ts)** - Lines 69-113
**Before:** Checked multiple tables (polar_subscriptions, subscriptions) for active status
**After:** Now checks ONLY the `users` table as single source of truth

New logic:
- Checks `users.subscription_status = 'active'`
- Checks `users.subscription_expires_at > now()`
- Allows admin bypass (`role = 'admin'`)
- Allows trial access (`has_trial_access = true`)
- Blocks everything else immediately

### 2. **SubscriptionCheck Component (subscription-check.tsx)** - Lines 23-36
**Before:** Allowed "active" and "canceled" with grace period
**After:** Only allows "active" with valid expiration (no grace period)

New logic:
- Only `subscription_status = 'active'` AND `subscription_expires_at > now()` = access granted
- All other statuses (inactive, canceled, pending, null) = redirect to pricing

### 3. **Cancel Subscription API (cancel-subscription/route.ts)** - Lines 145-160
**Before:** Set status to "canceled" with grace period until billing end
**After:** Sets status to "inactive" and clears expiration immediately

New behavior:
- Sets `subscription_status = 'inactive'`
- Sets `subscription_expires_at = NULL`
- Immediate access revocation (no grace period)
- Works for both Polar and Stripe

### 4. **Polar Webhook (polar-webhook/route.ts)** - Lines 90-110
**Before:** Set status to "inactive" but kept expiration date
**After:** Sets status to "inactive" and clears expiration

Ensures webhook cancellations also revoke access immediately.

## Current Behavior (After Fix)

### When User Cancels Subscription:
1. Status → `inactive`
2. Expiration → `NULL`
3. Access → **Revoked immediately** ✅
4. Next page load → Redirected to `/pricing`

### When Polar Webhook Fires:
1. Status → `inactive`
2. Expiration → `NULL`
3. Access → **Revoked immediately** ✅

### Admin Users:
- Bypass subscription check entirely
- Can access dashboard regardless of subscription status

### Trial Users:
- `has_trial_access = true` → Can access dashboard
- No subscription required during trial

## How to Fix Existing Users

If users like "rwandaform" can still access the dashboard:

1. **Check their data** - Run `CHECK_AND_FIX_RWANDAFORM_USER.sql`
2. **Look for inconsistencies:**
   - `users.subscription_status = 'inactive'` ✅
   - `polar_subscriptions.status = 'active'` ❌ (This is the problem!)
   - `subscriptions.status = 'active'` ❌ (This is the problem!)

3. **Fix the data** - Uncomment and run the UPDATE statements in the SQL file

4. **Force logout** - User needs to refresh or re-login for middleware to re-check

## Testing

To verify the fix works:

1. Cancel a test subscription
2. Check database: `subscription_status` should be `inactive`
3. Try to access `/dashboard`
4. Should redirect to `/pricing` immediately

## Files Changed

- `navygoal/middleware.ts` - Simplified to use users table only
- `navygoal/src/components/subscription-check.tsx` - Removed grace period
- `navygoal/src/app/api/cancel-subscription/route.ts` - Immediate revocation
- `navygoal/src/app/api/polar-webhook/route.ts` - Clear expiration on cancel

## Database Schema (Single Source of Truth)

The `users` table is now the authoritative source for subscription status:

```sql
users {
  subscription_status: 'active' | 'inactive' | 'canceled' | 'pending' | NULL
  subscription_expires_at: timestamp | NULL
  has_trial_access: boolean
  role: 'user' | 'admin'
}
```

**Access Rules:**
- `subscription_status = 'active'` AND `subscription_expires_at > now()` → ✅ Access
- `role = 'admin'` → ✅ Access (bypass)
- `has_trial_access = true` → ✅ Access
- Everything else → ❌ Redirect to pricing
