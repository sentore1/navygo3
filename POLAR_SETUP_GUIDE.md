# Polar Recurring Subscriptions Setup Guide

## Overview

Your pricing page now uses Polar for recurring revenue subscriptions. The integration automatically:
- Fetches products from your Polar organization
- Creates checkout sessions for recurring subscriptions
- Handles webhooks to update subscription status
- Tracks active subscriptions in your database

## What's Been Updated

### New API Routes

1. **`/api/polar-products`** - Fetches products from Polar
2. **`/api/polar-checkout`** - Creates checkout sessions
3. **`/api/polar-webhook`** - Handles Polar webhooks

### Updated Components

1. **`src/app/pricing/page.tsx`** - Now fetches Polar products
2. **`src/components/pricing-client.tsx`** - Displays Polar products with recurring billing

### Database Changes

New migration: `supabase/migrations/20260403000002_add_polar_subscriptions.sql`
- Creates `polar_subscriptions` table
- Tracks subscription status, periods, and metadata

## Setup Steps

### Step 1: Run Database Migration

In Supabase SQL Editor, run:
```sql
-- Copy content from: supabase/migrations/20260403000002_add_polar_subscriptions.sql
```

Or with Supabase CLI:
```bash
supabase db push
```

### Step 2: Create Products in Polar

1. Go to your Polar Dashboard: https://polar.sh/dashboard
2. Navigate to Products
3. Create your subscription products:

**Example: Basic Plan**
- Name: Basic
- Description: Perfect for getting started
- Type: Recurring
- Prices:
  - Monthly: $4.70/month
  - Yearly: $47/year (save 17%)

**Example: Pro Plan**
- Name: Pro
- Description: For power users
- Type: Recurring
- Prices:
  - Monthly: $9.30/month
  - Yearly: $93/year (save 17%)

### Step 3: Configure Webhook

1. In Polar Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/polar-webhook`
3. Copy the webhook secret
4. Add to `.env.local`:
```env
POLAR_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 4: Test the Integration

1. Go to `/pricing` on your app
2. You should see your Polar products
3. Click "Subscribe Now" to test checkout
4. Complete a test purchase
5. Verify subscription appears in admin dashboard

## Environment Variables

Make sure these are set in `.env.local`:

```env
# Polar Configuration
POLAR_API_KEY=polar_oat_...
POLAR_ORGANIZATION_ID=your-org-id
POLAR_WEBHOOK_SECRET=your-webhook-secret
```

## Features

### Recurring Billing
- Monthly and yearly billing cycles
- Automatic renewal
- Subscription management

### Webhook Events Handled
- `subscription.created` - New subscription
- `subscription.updated` - Subscription changes
- `subscription.canceled` - Cancellation
- `checkout.created` - Checkout started
- `order.created` - One-time purchases

### User Experience
- See active subscription status
- View renewal date
- Switch between plans
- Cancel anytime

## Admin Dashboard Integration

The admin dashboard (`/admin`) now shows:
- Total active Polar subscriptions
- Revenue from Polar
- User subscription details

## Testing

### Test Mode
1. Use Polar test mode products
2. Use test payment methods
3. Verify webhooks are received

### Production
1. Switch to live mode in Polar
2. Update webhook URL to production domain
3. Test with real payment method

## Troubleshooting

### Products Not Showing
- Check Polar API key is correct
- Verify organization ID
- Ensure products are not archived in Polar
- Check browser console for errors

### Checkout Fails
- Verify user is logged in
- Check Polar API key permissions
- Review server logs for errors
- Ensure success URL is correct

### Webhooks Not Working
- Verify webhook URL is accessible
- Check webhook secret matches
- Review webhook logs in Polar dashboard
- Check Supabase logs for errors

### Subscription Not Updating
- Verify webhook is configured
- Check `polar_subscriptions` table
- Review `webhook_events` table
- Ensure user_id is in metadata

## Pricing Page Features

### Billing Cycles
- Toggle between monthly and yearly
- Yearly shows savings badge
- Prices update automatically

### Plan Display
- Active plan highlighted in green
- Popular plan highlighted
- Feature lists per plan
- Clear pricing display

### Subscription Info
- Shows current subscription status
- Displays renewal date
- Option to switch plans

## Database Schema

### polar_subscriptions Table
```sql
- id: TEXT (Polar subscription ID)
- user_id: UUID (references users)
- status: TEXT (active, canceled, etc.)
- product_id: TEXT (Polar product ID)
- price_id: TEXT (Polar price ID)
- current_period_start: TIMESTAMPTZ
- current_period_end: TIMESTAMPTZ
- cancel_at_period_end: BOOLEAN
- metadata: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Next Steps

1. ✅ Run the database migration
2. ✅ Create products in Polar dashboard
3. ✅ Configure webhook
4. ✅ Test checkout flow
5. ✅ Enable Polar in admin settings (`/admin/settings`)
6. Monitor subscriptions in admin dashboard
7. Set up email notifications for subscription events

## Support

If you encounter issues:
1. Check Polar dashboard for webhook logs
2. Review Supabase logs for errors
3. Verify all environment variables
4. Test in Polar test mode first
5. Check the browser console for client-side errors

## Additional Resources

- Polar API Docs: https://docs.polar.sh
- Polar Dashboard: https://polar.sh/dashboard
- Webhook Testing: Use Polar's webhook testing tool
