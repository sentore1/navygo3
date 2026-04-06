# Subscription Lifecycle Guide

This document explains what happens when subscriptions are created, renewed, or canceled.

## Subscription States

### Active Subscription
- **Status**: `active`
- **User Access**: Full access to subscribed features (including AI if product has it)
- **Database**: `users.subscription_status = 'active'`
- **Polar Subscription**: `polar_subscriptions.status = 'active'`

### Canceled Subscription
- **Status**: `canceled`
- **User Access**: Features disabled immediately
- **Database**: `users.subscription_status = 'inactive'`
- **Polar Subscription**: `polar_subscriptions.status = 'canceled'`

## What Happens When...

### 1. User Subscribes (Monthly or Yearly)

**Webhook Event**: `subscription.created`

```
User clicks "Subscribe" → Polar Checkout → Payment Success → Webhook fires
```

**What happens**:
1. Polar sends `subscription.created` webhook
2. Your app receives the webhook
3. Updates `users` table:
   - `subscription_status = 'active'`
   - `subscription_expires_at = current_period_end` (1 month or 1 year from now)
4. Creates record in `polar_subscriptions`:
   - `status = 'active'`
   - `product_id` = the product they bought
   - `has_ai_access` = synced from `polar_product_features`
   - `current_period_end` = when subscription renews/expires
5. User immediately gets access to features

**Example**:
- User subscribes to "Delta Goal" (yearly) on Jan 1, 2024
- `subscription_expires_at` = Jan 1, 2025
- `has_ai_access` = true (if Delta Goal has AI enabled)
- User can use AI goal creation immediately

### 2. Subscription Renews Automatically

**Webhook Event**: `subscription.updated`

```
Subscription period ends → Polar charges card → Webhook fires
```

**What happens**:
1. Polar automatically charges the user's card
2. Sends `subscription.updated` webhook
3. Your app updates:
   - `subscription_expires_at` = new period end (another month/year)
   - `current_period_start` = today
   - `current_period_end` = next renewal date
4. User continues to have access without interruption

**Example**:
- User's yearly subscription expires Jan 1, 2025
- Polar charges their card automatically
- `subscription_expires_at` updated to Jan 1, 2026
- User keeps AI access

### 3. User Cancels Subscription

**Webhook Event**: `subscription.canceled`

```
User clicks "Cancel" in Polar → Webhook fires
```

**What happens**:
1. Polar sends `subscription.canceled` webhook
2. Your app updates:
   - `users.subscription_status = 'inactive'`
   - `polar_subscriptions.status = 'canceled'`
3. User **immediately loses access** to premium features
4. AI button redirects to pricing page

**Example**:
- User cancels on June 15, 2024
- Even if they paid until Dec 31, 2024, they lose access immediately
- This is the current behavior

### 4. Payment Fails (Card Declined)

**Webhook Event**: `subscription.updated` with status change

```
Renewal date arrives → Card declined → Webhook fires
```

**What happens**:
1. Polar tries to charge the card
2. Payment fails
3. Polar sends webhook with updated status
4. Your app updates:
   - `subscription_status = 'inactive'`
   - `status = 'past_due'` or `'canceled'`
5. User loses access to premium features

## Current Behavior Issues

### Issue 1: Immediate Access Loss on Cancel

Currently, when a user cancels, they lose access immediately even if they paid for the full period.

**Better Approach**: Let them keep access until `current_period_end`

### Issue 2: No Grace Period for Failed Payments

If a payment fails, user loses access immediately.

**Better Approach**: Give them a few days to update payment method

## Recommended Improvements

Let me update the webhook handler to implement better cancellation logic:

### Improved Cancellation Flow

```typescript
case "subscription.canceled":
  const canceledSub = event.data;
  const canceledUserId = canceledSub.metadata?.user_id;

  if (canceledUserId) {
    // Check if subscription period has ended
    const periodEnd = new Date(canceledSub.current_period_end);
    const now = new Date();
    
    if (now < periodEnd) {
      // User still has time left - keep access until period ends
      await supabase
        .from("polar_subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: true, // Mark for cancellation but keep active
          updated_at: new Date().toISOString(),
        })
        .eq("subscription_id", canceledSub.id);
      
      // Keep user status as active until period ends
      // Don't update users.subscription_status yet
    } else {
      // Period already ended - revoke access immediately
      await supabase
        .from("users")
        .update({
          subscription_status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", canceledUserId);

      await supabase
        .from("polar_subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("subscription_id", canceledSub.id);
    }
  }
  break;
```

### Check Access Logic Update

Update `checkProStatus` to respect `cancel_at_period_end`:

```typescript
const { data: polarSub } = await supabase
  .from('polar_subscriptions')
  .select('product_id, status, has_ai_access, cancel_at_period_end, current_period_end')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .maybeSingle();

if (polarSub) {
  // Check if subscription is active or canceled but still in paid period
  const periodEnd = new Date(polarSub.current_period_end);
  const now = new Date();
  
  const hasAccess = polarSub.status === 'active' || 
                    (polarSub.cancel_at_period_end && now < periodEnd);
  
  setIsPro(hasAccess && polarSub.has_ai_access);
  return;
}
```

## Monitoring Subscriptions

### Check Active Subscriptions

```sql
SELECT 
    u.email,
    ps.product_id,
    ps.status,
    ps.has_ai_access,
    ps.current_period_end,
    ps.cancel_at_period_end
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE ps.status = 'active'
ORDER BY ps.current_period_end;
```

### Check Expiring Soon (Next 7 Days)

```sql
SELECT 
    u.email,
    ps.product_id,
    ps.current_period_end,
    ps.cancel_at_period_end
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE ps.status = 'active'
AND ps.current_period_end < NOW() + INTERVAL '7 days'
ORDER BY ps.current_period_end;
```

### Check Canceled But Still Active

```sql
SELECT 
    u.email,
    ps.product_id,
    ps.current_period_end,
    ps.cancel_at_period_end
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE ps.cancel_at_period_end = true
AND ps.current_period_end > NOW();
```

## Testing Scenarios

### Test Monthly Renewal
1. Subscribe to monthly plan
2. Wait for renewal date (or use Polar test mode to simulate)
3. Verify `subscription_expires_at` updates to next month
4. Verify user keeps access

### Test Yearly Renewal
1. Subscribe to yearly plan
2. Simulate renewal in Polar dashboard
3. Verify `subscription_expires_at` updates to next year
4. Verify user keeps access

### Test Cancellation
1. Subscribe to any plan
2. Cancel subscription
3. Verify user loses access immediately (current behavior)
4. Or verify user keeps access until period end (improved behavior)

### Test Failed Payment
1. Subscribe with test card
2. Update card to failing card in Polar
3. Wait for renewal attempt
4. Verify user loses access
5. Update to valid card
6. Verify subscription reactivates

## Summary

**Current Flow**:
- Subscribe → Immediate access
- Renew → Automatic, seamless
- Cancel → Immediate loss of access (even if paid period remains)
- Payment fails → Immediate loss of access

**Recommended Flow**:
- Subscribe → Immediate access
- Renew → Automatic, seamless
- Cancel → Keep access until period ends
- Payment fails → Grace period to update payment

Would you like me to implement the improved cancellation logic?
