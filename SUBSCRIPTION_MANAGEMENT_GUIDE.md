# Subscription Management Guide

## Overview

Users can manage their subscriptions directly from the Settings page (`/settings`). This includes viewing subscription status, managing billing, and cancelling subscriptions.

## Features

### 1. View Subscription Status
Users can see:
- ✅ Subscription status (Active, Trial, Inactive)
- 📅 Renewal date
- 💳 Payment provider (Stripe, Polar, KPay)
- 📦 Current plan

### 2. Manage Billing
Users can access their billing portal to:
- Update payment methods
- View invoices
- Change plans
- Update billing information

**Supported Providers:**
- **Stripe**: Opens Stripe Customer Portal
- **Polar**: Opens Polar Customer Portal
- **KPay**: Contact support (manual process)

### 3. Cancel Subscription
Users can cancel their subscription with the following behavior:
- ✅ Subscription remains active until the end of the billing period
- ✅ Access to Pro features continues until period end
- ✅ Clear notification of cancellation date
- ✅ Can resubscribe anytime from pricing page

## How It Works

### Subscription Cancellation Flow

```
User clicks "Cancel Subscription"
    ↓
Confirmation dialog appears
    ↓
User confirms cancellation
    ↓
API call to /api/cancel-subscription
    ↓
Backend updates provider (Stripe/Polar)
    ↓
Sets cancel_at_period_end = true
    ↓
Updates local database
    ↓
User sees cancellation notice
    ↓
Subscription remains active until period end
    ↓
After period end, subscription becomes inactive
```

### Stripe Cancellation

1. User clicks "Cancel Subscription"
2. API calls `stripe.subscriptions.update()` with `cancel_at_period_end: true`
3. Updates `subscriptions` table:
   - `cancel_at_period_end = true`
   - `canceled_at = current_timestamp`
4. User retains access until `current_period_end`

### Polar Cancellation

1. User clicks "Cancel Subscription"
2. API calls Polar API: `POST /v1/subscriptions/{id}/cancel`
3. Updates `polar_subscriptions` table:
   - `cancel_at_period_end = true`
   - `updated_at = current_timestamp`
4. User retains access until `current_period_end`

### KPay Cancellation

KPay subscriptions require manual cancellation through support.

## API Endpoints

### POST /api/cancel-subscription

Cancels a user's subscription (sets to cancel at period end).

**Request Body:**
```json
{
  "subscriptionId": "sub_xxxxx",
  "provider": "stripe" | "polar"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription will be cancelled at the end of the billing period"
}
```

**Errors:**
- `401`: Unauthorized (not logged in)
- `400`: Invalid provider
- `500`: Provider not configured or API error

### POST /api/create-portal-session

Creates a Stripe Customer Portal session for managing billing.

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxxxx"
}
```

**Errors:**
- `401`: Unauthorized
- `404`: No active Stripe subscription found
- `500`: Stripe not configured

## Database Schema

### subscriptions (Stripe)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  stripe_id TEXT UNIQUE,
  status TEXT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN,
  canceled_at BIGINT,
  customer_id TEXT,
  -- ... other fields
);
```

### polar_subscriptions (Polar)

```sql
CREATE TABLE polar_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  subscription_id TEXT UNIQUE,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  -- ... other fields
);
```

## UI Components

### SubscriptionStatus Component

Located at: `src/components/subscription-status.tsx`

**Features:**
- Displays subscription status badge
- Shows renewal date
- Manage Billing button (Stripe/Polar)
- Cancel Subscription button
- Cancellation notice (when cancelled)

**States:**
1. **Active Subscription**
   - Green badge
   - Shows renewal date
   - Manage + Cancel buttons

2. **Cancelled (but still active)**
   - Green badge
   - Shows end date
   - Warning notice
   - No cancel button (already cancelled)

3. **Trial Access**
   - Blue badge
   - Upgrade prompt

4. **No Subscription**
   - Red badge
   - Link to pricing page

## Testing

### Test Stripe Cancellation

1. Log in as user with active Stripe subscription
2. Go to `/settings`
3. Scroll to "Subscription Status" card
4. Click "Cancel Subscription"
5. Confirm in dialog
6. Verify:
   - Success message appears
   - Cancellation notice shows
   - Subscription still shows as "Active"
   - End date is displayed
   - Cancel button is hidden

### Test Polar Cancellation

1. Log in as user with active Polar subscription
2. Go to `/settings`
3. Scroll to "Subscription Status" card
4. Click "Cancel Subscription"
5. Confirm in dialog
6. Verify same as Stripe above

### Test Stripe Portal

1. Log in as user with active Stripe subscription
2. Go to `/settings`
3. Click "Manage Billing"
4. Verify redirect to Stripe Customer Portal
5. Verify can update payment method, view invoices

### Test Polar Portal

1. Log in as user with active Polar subscription
2. Go to `/settings`
3. Click "Manage Billing"
4. Verify opens Polar portal in new tab

## Environment Variables

Required for subscription management:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Polar
POLAR_API_KEY=polar_xxxxx
POLAR_API_URL=https://api.polar.sh  # or sandbox-api.polar.sh
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_xxxxx
```

## User Experience

### Before Cancellation
```
┌─────────────────────────────────┐
│ Subscription Status             │
├─────────────────────────────────┤
│ Status: ✅ Active               │
│ Provider: Stripe                │
│ Renews on: April 15, 2026       │
│ Plan: Pro Monthly               │
│                                 │
│ [Manage Billing] [Cancel]      │
└─────────────────────────────────┘
```

### After Cancellation
```
┌─────────────────────────────────┐
│ Subscription Status             │
├─────────────────────────────────┤
│ Status: ✅ Active               │
│ Provider: Stripe                │
│ Renews on: April 15, 2026       │
│ Plan: Pro Monthly               │
│                                 │
│ ⚠️ Subscription Cancelled       │
│ Your subscription will end on   │
│ April 15, 2026. You can         │
│ resubscribe anytime from the    │
│ pricing page.                   │
│                                 │
│ [Manage Billing]                │
└─────────────────────────────────┘
```

## Resubscription

After cancellation, users can resubscribe by:
1. Going to `/pricing`
2. Selecting a plan
3. Completing checkout
4. New subscription starts immediately

## Webhook Handling

### Stripe Webhooks

Handle these events in `/api/payments-webhook`:
- `customer.subscription.deleted` - Subscription ended
- `customer.subscription.updated` - Cancellation or reactivation

### Polar Webhooks

Handle these events in `/api/polar-webhook`:
- `subscription.canceled` - Subscription cancelled
- `subscription.ended` - Subscription ended

## Common Issues

### Issue: "No active subscription found"
**Solution**: User doesn't have an active subscription in the database. Check:
```sql
SELECT * FROM subscriptions WHERE user_id = 'USER_ID' AND status = 'active';
SELECT * FROM polar_subscriptions WHERE user_id = 'USER_ID' AND status = 'active';
```

### Issue: "Failed to cancel subscription"
**Solution**: Check API keys are configured:
- Stripe: `STRIPE_SECRET_KEY`
- Polar: `POLAR_API_KEY`

### Issue: Cancel button doesn't appear
**Solution**: Check if `cancel_at_period_end` is already true:
```sql
SELECT cancel_at_period_end FROM subscriptions WHERE user_id = 'USER_ID';
```

### Issue: Subscription still active after period end
**Solution**: Webhooks may not have fired. Manually update:
```sql
UPDATE subscriptions 
SET status = 'canceled' 
WHERE user_id = 'USER_ID' 
AND cancel_at_period_end = true 
AND current_period_end < EXTRACT(EPOCH FROM NOW());
```

## Security

- ✅ All endpoints require authentication
- ✅ Users can only cancel their own subscriptions
- ✅ API keys stored securely in environment variables
- ✅ Confirmation dialog prevents accidental cancellation
- ✅ Audit trail via webhook logs

## Future Enhancements

1. **Pause Subscription** - Allow users to pause instead of cancel
2. **Downgrade Option** - Switch to a lower tier instead of cancelling
3. **Cancellation Survey** - Ask why users are cancelling
4. **Win-back Offers** - Offer discount to prevent cancellation
5. **Email Notifications** - Send email when subscription is cancelled
6. **Reactivation Flow** - Easy one-click reactivation before period ends

## Support

If users need help with subscriptions:
1. Check subscription status in database
2. Verify webhook logs for any errors
3. Check provider dashboard (Stripe/Polar)
4. Manually update database if needed
5. Contact provider support if API issues

## Summary

The subscription management system provides users with full control over their subscriptions while maintaining a smooth experience. Cancellations are handled gracefully with continued access until the end of the billing period, and users can easily resubscribe at any time.
