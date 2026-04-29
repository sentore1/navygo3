# Subscription Cancellation Error - Troubleshooting Guide

## Error Message
"Error: Failed to cancel subscription with payment provider"

## What This Means
The application is trying to cancel your subscription with Polar (the payment provider), but the API call is failing. This could happen for several reasons.

## Step-by-Step Fix

### Step 1: Diagnose the Issue

Run this SQL query in your Supabase SQL Editor:

```sql
-- Check your subscription details
SELECT 
    ps.subscription_id,
    ps.status,
    ps.product_id,
    ps.current_period_end,
    ps.cancel_at_period_end,
    u.email
FROM polar_subscriptions ps
JOIN users u ON u.id = ps.user_id
WHERE u.email = 'your-email@example.com'; -- Replace with your email
```

**What to look for:**
- Is `subscription_id` NULL or empty? → This is the problem
- Is `status` already 'canceled'? → Subscription is already cancelled
- Is `cancel_at_period_end` already true? → Cancellation is already scheduled

### Step 2: Test Polar API Connection

Run the test script to check if you can connect to Polar:

```bash
node test-polar-cancel.js
```

**Before running**, edit the file and replace `YOUR_SUBSCRIPTION_ID_HERE` with your actual subscription ID from Step 1.

### Step 3: Common Issues and Solutions

#### Issue A: Subscription ID is NULL or Missing

**Cause:** The subscription was never properly saved from the Polar webhook.

**Solution:** Cancel the subscription locally:

```sql
-- Run this in Supabase SQL Editor
UPDATE polar_subscriptions
SET 
    cancel_at_period_end = true,
    updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com')
AND status = 'active';
```

#### Issue B: Subscription Not Found in Polar (404 Error)

**Cause:** The subscription doesn't exist in Polar's system anymore.

**Solution:** Cancel it locally (same as Issue A above).

#### Issue C: Authentication Failed (401/403 Error)

**Cause:** Your Polar API key is invalid or doesn't have permission.

**Solution:**
1. Go to [Polar Dashboard](https://polar.sh)
2. Navigate to Settings → API Keys
3. Generate a new API key
4. Update your `.env.local` file:
   ```
   POLAR_API_KEY=polar_oat_YOUR_NEW_KEY_HERE
   ```
5. Restart your development server

#### Issue D: Wrong API URL

**Cause:** Using production API URL with sandbox key or vice versa.

**Solution:** Check your `.env.local`:
- For sandbox: `POLAR_API_URL=https://sandbox-api.polar.sh`
- For production: `POLAR_API_URL=https://api.polar.sh`

Make sure it matches your API key type:
- Sandbox keys start with `polar_oat_`
- Production keys start with `polar_pat_`

### Step 4: Manual Cancellation (If All Else Fails)

If you can't cancel through the API, you can cancel locally and manually in Polar:

1. **Cancel in your database:**
   ```sql
   -- Run FIX_CANCEL_SUBSCRIPTION_ERROR.sql
   -- Choose OPTION A (cancel at period end) or OPTION B (cancel immediately)
   ```

2. **Cancel in Polar Dashboard:**
   - Go to https://polar.sh
   - Navigate to Subscriptions
   - Find your subscription
   - Click "Cancel"

### Step 5: Verify the Fix

After applying any fix, verify it worked:

```sql
SELECT 
    ps.subscription_id,
    ps.status,
    ps.cancel_at_period_end,
    ps.current_period_end,
    u.email
FROM polar_subscriptions ps
JOIN users u ON u.id = ps.user_id
WHERE u.email = 'your-email@example.com';
```

You should see:
- `cancel_at_period_end` = true
- `status` = 'active' (until period ends) or 'canceled'

## What I Fixed

I've improved the error handling in your application:

1. **Better error messages** - Now shows specific reasons why cancellation failed
2. **Improved logging** - Logs more details to help diagnose issues
3. **Validation** - Checks if subscription ID exists before making API call
4. **User-friendly alerts** - Provides helpful next steps when errors occur

## Files Modified

- `src/app/api/cancel-subscription/route.ts` - Better error handling and logging
- `src/components/subscription-status.tsx` - More helpful error messages

## Files Created

- `DIAGNOSE_CANCEL_SUBSCRIPTION_ERROR.sql` - Diagnostic queries
- `FIX_CANCEL_SUBSCRIPTION_ERROR.sql` - Manual fix options
- `test-polar-cancel.js` - Test Polar API connection
- `SUBSCRIPTION_CANCEL_ERROR_GUIDE.md` - This guide

## Next Steps

1. Run `DIAGNOSE_CANCEL_SUBSCRIPTION_ERROR.sql` to identify the issue
2. Try the test script: `node test-polar-cancel.js`
3. Apply the appropriate fix from Step 3 above
4. If still stuck, check the browser console and server logs for more details

## Need More Help?

If you're still having issues:
1. Check the browser console (F12) for detailed error messages
2. Check your server logs for the full error response from Polar
3. Verify your Polar dashboard shows the subscription
4. Contact Polar support if the subscription exists but can't be cancelled via API
