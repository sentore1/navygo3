# Cancel Subscription - Quick Guide

## ✅ What's Available

Users can cancel their subscriptions from the Settings page with these features:

### For All Users
- View subscription status
- See renewal/end date
- Cancel subscription (keeps access until period end)
- Resubscribe anytime

### Stripe Users
- ✅ Cancel directly from Settings
- ✅ Access Stripe Customer Portal
- ✅ Update payment methods
- ✅ View invoices

### Polar Users
- ✅ Cancel directly from Settings
- ✅ Access Polar Customer Portal
- ✅ Manage subscription online

### KPay Users
- ⚠️ Contact support to cancel (manual process)

## How to Cancel

### Step 1: Go to Settings
Navigate to `/settings` and scroll to "Subscription Status" card

### Step 2: Click Cancel
Click the "Cancel Subscription" button

### Step 3: Confirm
Read the confirmation dialog and click "Yes, Cancel Subscription"

### Step 4: Done!
- ✅ Subscription set to cancel at period end
- ✅ You keep access until then
- ✅ Can resubscribe anytime

## What Happens After Cancellation?

```
Today (Cancel)
    ↓
Still have access to Pro features
    ↓
Billing period continues
    ↓
End of billing period (e.g., April 15)
    ↓
Subscription becomes inactive
    ↓
Lose access to Pro features
    ↓
Can resubscribe from /pricing
```

## UI Changes After Cancellation

**Before:**
- Status: ✅ Active
- Buttons: [Manage Billing] [Cancel Subscription]

**After:**
- Status: ✅ Active (until period end)
- Warning: "Subscription Cancelled - Ends on April 15, 2026"
- Buttons: [Manage Billing] (no cancel button)

## API Endpoints

### Cancel Subscription
```bash
POST /api/cancel-subscription
Content-Type: application/json

{
  "subscriptionId": "sub_xxxxx",
  "provider": "stripe" | "polar"
}
```

### Create Portal Session (Stripe)
```bash
POST /api/create-portal-session
```

## Database Updates

### Stripe
```sql
UPDATE subscriptions 
SET 
  cancel_at_period_end = true,
  canceled_at = CURRENT_TIMESTAMP
WHERE user_id = 'USER_ID';
```

### Polar
```sql
UPDATE polar_subscriptions 
SET 
  cancel_at_period_end = true,
  updated_at = NOW()
WHERE user_id = 'USER_ID';
```

## Testing Checklist

- [ ] User can see subscription status
- [ ] Cancel button appears for active subscriptions
- [ ] Confirmation dialog shows correct end date
- [ ] Cancellation succeeds (Stripe)
- [ ] Cancellation succeeds (Polar)
- [ ] Cancellation notice appears after cancel
- [ ] Cancel button disappears after cancel
- [ ] User retains access until period end
- [ ] Manage Billing button works (Stripe)
- [ ] Manage Billing button works (Polar)
- [ ] User can resubscribe from /pricing

## Quick Test

```bash
# 1. Log in as user with active subscription
# 2. Go to /settings
# 3. Click "Cancel Subscription"
# 4. Confirm cancellation
# 5. Verify cancellation notice appears
# 6. Verify subscription still shows as Active
# 7. Verify end date is displayed
```

## Check Subscription Status

```sql
-- Check if subscription is cancelled
SELECT 
  user_id,
  status,
  cancel_at_period_end,
  current_period_end,
  CASE 
    WHEN cancel_at_period_end = true THEN 'Will cancel on ' || TO_CHAR(TO_TIMESTAMP(current_period_end), 'YYYY-MM-DD')
    ELSE 'Active'
  END as subscription_status
FROM subscriptions
WHERE user_id = 'USER_ID';
```

## Reactivate Cancelled Subscription

If user changes their mind before period end:

### Stripe
```typescript
await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: false,
});
```

### Polar
User needs to resubscribe from pricing page (Polar doesn't support reactivation)

## Environment Variables

```bash
# Required for cancellation
STRIPE_SECRET_KEY=sk_xxxxx
POLAR_API_KEY=polar_xxxxx
POLAR_API_URL=https://api.polar.sh

# Required for portal
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_xxxxx
```

## Common Issues

### "Failed to cancel subscription"
- Check API keys are set
- Check subscription ID is correct
- Check user has active subscription

### Cancel button doesn't show
- Already cancelled (check `cancel_at_period_end`)
- No active subscription
- KPay subscription (not supported)

### Portal doesn't open
- Check `NEXT_PUBLIC_SITE_URL` is set
- Check Stripe/Polar API keys
- Check user has active subscription

## Files Modified

1. `src/app/api/cancel-subscription/route.ts` - Added Stripe support
2. `src/components/subscription-status.tsx` - Updated to pass provider

## Documentation

- Full guide: `SUBSCRIPTION_MANAGEMENT_GUIDE.md`
- This quick reference: `CANCEL_SUBSCRIPTION_QUICK_GUIDE.md`

## Done! 🎉

Users can now cancel their subscriptions directly from the Settings page. The cancellation is graceful - they keep access until the end of their billing period and can resubscribe anytime.
