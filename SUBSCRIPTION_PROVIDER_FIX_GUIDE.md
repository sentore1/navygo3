# Subscription Provider Fix Guide

## Problem
Your subscription shows "Provider: Kpay" even though you paid with Polar.

## Root Cause
The subscription status component checks providers in this order:
1. Stripe → 2. Polar → 3. KPay

If you have:
- An old KPay transaction in the database
- User `subscription_status` = "active"
- No record in `polar_subscriptions` table

Then it shows KPay as the provider.

## Diagnosis Steps

### Step 1: Check Your Current Subscription Data
Run `CHECK_SUBSCRIPTION_PROVIDER.sql` in Supabase SQL Editor.

This will show you:
- Your user subscription status
- Any Polar subscriptions
- Any KPay transactions
- Any Stripe subscriptions

### Step 2: Identify the Issue
Look at the results:

**Scenario A: No Polar subscription record**
- You see KPay transactions
- You see user status = "active"
- You DON'T see any Polar subscriptions
- **Fix:** Add your Polar subscription manually

**Scenario B: Polar table doesn't exist**
- Error: "relation polar_subscriptions does not exist"
- **Fix:** Create the table

**Scenario C: Old KPay data interfering**
- You see old KPay transactions
- User status is "active" from old KPay
- You have a Polar subscription but it's not being prioritized
- **Fix:** Clear old KPay status

## Fix Solutions

### Solution A: Add Polar Subscription Manually

1. Get your Polar subscription details from [Polar Dashboard](https://polar.sh/dashboard)
2. Run `FIX_SUBSCRIPTION_PROVIDER.sql`
3. Uncomment Option 1 and fill in your details:
   - `subscription_id`: From Polar dashboard
   - `plan_id`: Your plan (e.g., "pro_monthly")
   - `customer_id`: Your Polar customer ID

### Solution B: Create Polar Subscriptions Table

Run `FIX_SUBSCRIPTION_PROVIDER.sql` - it will automatically create the table if it doesn't exist.

### Solution C: Clear Old KPay Status

1. Run `FIX_SUBSCRIPTION_PROVIDER.sql`
2. Uncomment Option 2 to clear old KPay status
3. This sets `subscription_status` to "inactive" if no recent KPay transactions

## Alternative: Use Polar Webhooks

The proper way to sync Polar subscriptions is via webhooks:

1. Go to Polar Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/polar-webhook`
3. Subscribe to events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`

This will automatically sync Polar subscriptions to your database.

## Quick Fix (Temporary)

If you just want to see "Polar" as the provider right now:

```sql
-- Set your user status to use Polar
UPDATE users
SET subscription_status = 'inactive'
WHERE id = auth.uid();

-- Then add your Polar subscription
-- (Use Option 1 in FIX_SUBSCRIPTION_PROVIDER.sql)
```

## Verify the Fix

After applying the fix:
1. Refresh your settings page
2. Check "Subscription Status"
3. Should now show "Provider: polar"

## Files to Use
1. `CHECK_SUBSCRIPTION_PROVIDER.sql` - Diagnose the issue
2. `FIX_SUBSCRIPTION_PROVIDER.sql` - Apply the fix
3. This guide - Step-by-step instructions
