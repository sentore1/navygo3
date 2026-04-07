# Subscription Cancellation & Management Guide

## Overview

Users can now cancel or manage their subscriptions directly from the Settings page. The system supports multiple payment providers with appropriate cancellation flows.

## Features Added

### 1. Cancel Subscription Button
- Visible for users with active subscriptions
- Shows confirmation dialog before cancelling
- Subscription remains active until end of billing period
- Clear messaging about when access will end

### 2. Manage Billing Button
- Opens provider-specific billing portal
- **Stripe**: Opens Stripe Customer Portal
- **Polar**: Opens Polar customer portal
- **KPay**: Shows contact support message

### 3. Cancellation Status Display
- Shows when subscription is set to cancel
- Displays end date clearly
- Provides link to resubscribe

## How It Works

### For Stripe Subscriptions

1. User clicks "Manage Billing"
2. System creates a Stripe Customer Portal session
3. User is redirected to Stripe's hosted portal
4. User can:
   - Cancel subscription
   - Update payment method
   - View billing history
   - Download invoices
5. Returns to Settings page after completion

### For Polar Subscriptions

1. User clicks "Cancel Subscription"
2. Confirmation dialog appears with details
3. User confirms cancellation
4. API calls Polar to set `cancel_at_period_end = true`
5. Database is updated to reflect cancellation
6. User sees cancellation notice with end date

### For KPay Subscriptions

1. User sees "Contact support" message
2. Manual cancellation process (requires support intervention)

## API Endpoints

### POST /api/cancel-subscription
Cancels a Polar subscription at the end of the billing period.

**Request:**
```json
{
  "subscriptionId": "sub_xxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription will be cancelled at the end of the billing period"
}
```

### POST /api/create-portal-session
Creates a Stripe Customer Portal session for subscription management.

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxxxx"
}
```

## UI Components

### Subscription Status Card

Located in: `src/components/subscription-status.tsx`

**Features:**
- Shows subscription status (Active, Trial, Inactive)
- Displays provider name
- Shows renewal date
- Shows plan details
- **NEW**: Manage Billing button
- **NEW**: Cancel Subscription button
- **NEW**: Cancellation notice

### Buttons Visibility

| Condition | Manage Billing | Cancel Subscription |
|-----------|---------------|---------------------|
| Active Stripe | ✅ Visible | ✅ Visible |
| Active Polar | ✅ Visible | ✅ Visible |
| Active KPay | ❌ Hidden | ❌ Hidden (shows message) |
| Already Cancelled | ✅ Visible | ❌ Hidden |
| No Subscription | ❌ Hidden | ❌ Hidden |

## User Experience Flow

### Cancellation Flow

```
User on Settings Page
    ↓
Clicks "Cancel Subscription"
    ↓
Confirmation Dialog Appears
  - Shows end date
  - Warns about losing Pro features
  - Option to keep or cancel
    ↓
User Confirms Cancellation
    ↓
API Call to Provider
    ↓
Database Updated
    ↓
Page Refreshes
    ↓
Shows Cancellation Notice
  - "Subscription Cancelled"
  - End date displayed
  - Link to resubscribe
```

### Manage Billing Flow (Stripe)

```
User on Settings Page
    ↓
Clicks "Manage Billing"
    ↓
API Creates Portal Session
    ↓
Redirects to Stripe Portal
    ↓
User Manages Subscription
  - Cancel
  - Update payment
  - View history
    ↓
Returns to Settings Page
    ↓
Changes Reflected Automatically
```

## Database Schema

### Subscriptions Table (Stripe)
```sql
- cancel_at_period_end: BOOLEAN
- current_period_end: TIMESTAMPTZ
- customer_id: TEXT (for portal access)
```

### Polar Subscriptions Table
```sql
- cancel_at_period_end: BOOLEAN
- current_period_end: TIMESTAMPTZ
- subscription_id: TEXT (for API calls)
```

## Environment Variables Required

```bash
# Stripe (for customer portal)
STRIPE_SECRET_KEY=sk_xxxxx
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Polar (for cancellation API)
POLAR_API_KEY=polar_xxxxx
POLAR_API_URL=https://api.polar.sh

# Optional: Polar Organization ID for portal link
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_xxxxx
```

## Testing Checklist

### Stripe Subscription
- [ ] "Manage Billing" button appears
- [ ] Clicking opens Stripe Customer Portal
- [ ] Can cancel subscription in portal
- [ ] Returns to settings page
- [ ] Cancellation status shows correctly
- [ ] "Cancel Subscription" button hidden after cancellation

### Polar Subscription
- [ ] "Cancel Subscription" button appears
- [ ] Confirmation dialog shows correct end date
- [ ] Cancellation succeeds
- [ ] Database updated correctly
- [ ] Cancellation notice displays
- [ ] Can still access features until end date

### KPay Subscription
- [ ] No cancel button shown
- [ ] Support message displays
- [ ] Contact information provided

### Edge Cases
- [ ] Multiple subscriptions (should show first active)
- [ ] Already cancelled subscription
- [ ] Expired subscription
- [ ] Trial access (no cancel button)
- [ ] No subscription (shows upgrade message)

## Error Handling

### Common Errors

**"No active Stripe subscription found"**
- User doesn't have Stripe subscription
- Subscription is not active
- Customer ID missing

**"Failed to cancel subscription with payment provider"**
- API key invalid
- Subscription ID incorrect
- Network error

**"Polar not configured"**
- POLAR_API_KEY not set
- Environment variable missing

### Error Messages to Users

All errors show user-friendly alerts:
- "Error: [specific message]"
- Suggests contacting support if persistent
- Doesn't expose technical details

## Resubscription Flow

After cancellation, users can resubscribe:

1. Cancellation notice shows "pricing page" link
2. User clicks link → redirects to /pricing
3. User selects plan
4. Completes checkout
5. New subscription created
6. Cancel status cleared

## Admin Considerations

### Monitoring Cancellations

Query to see cancelled subscriptions:

```sql
-- Stripe cancellations
SELECT 
  u.email,
  s.plan_id,
  s.current_period_end,
  s.cancel_at_period_end
FROM subscriptions s
JOIN users u ON u.id = s.user_id
WHERE s.cancel_at_period_end = true
AND s.status = 'active';

-- Polar cancellations
SELECT 
  u.email,
  ps.product_id,
  ps.current_period_end,
  ps.cancel_at_period_end
FROM polar_subscriptions ps
JOIN users u ON u.id = ps.user_id
WHERE ps.cancel_at_period_end = true
AND ps.status = 'active';
```

### Cancellation Analytics

Track cancellation reasons (future enhancement):

```sql
ALTER TABLE subscriptions 
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN cancellation_feedback TEXT,
ADD COLUMN cancelled_at TIMESTAMPTZ;
```

## Future Enhancements

### 1. Cancellation Survey
- Ask why user is cancelling
- Collect feedback
- Offer alternatives (pause, downgrade)

### 2. Pause Subscription
- Allow temporary pause
- Resume anytime
- Keep data intact

### 3. Downgrade Option
- Switch to lower tier
- Keep some features
- Reduce cost

### 4. Win-back Campaign
- Email before end date
- Offer discount to stay
- Highlight features they'll lose

### 5. Immediate Cancellation
- Option to cancel immediately
- Prorated refund
- Instant access removal

## Support Documentation

### For Users

**How to cancel your subscription:**

1. Go to Settings page
2. Scroll to "Subscription Status" card
3. Click "Cancel Subscription"
4. Confirm in the dialog
5. Your subscription will remain active until [end date]

**How to manage your billing:**

1. Go to Settings page
2. Click "Manage Billing"
3. You'll be redirected to the billing portal
4. Make changes as needed
5. Return to the app

### For Support Team

**User wants to cancel:**
- Direct them to Settings page
- Guide through cancellation flow
- Confirm end date
- Offer to help with any issues

**User cancelled by mistake:**
- They can resubscribe immediately
- No data loss during grace period
- Same features restored

**Cancellation not working:**
1. Check subscription status in database
2. Verify API keys configured
3. Check function logs
4. Manual cancellation if needed

## Security Considerations

✅ **Authentication Required**: All endpoints check user authentication
✅ **User Ownership**: Can only cancel own subscription
✅ **Provider Validation**: Verifies subscription belongs to user
✅ **Secure Redirects**: Portal URLs are provider-generated
✅ **No Sensitive Data**: Doesn't expose API keys or customer IDs

## Conclusion

The subscription cancellation feature provides users with full control over their subscriptions while maintaining a smooth user experience. The system handles multiple payment providers gracefully and ensures users understand exactly what happens when they cancel.
