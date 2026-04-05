## Setup Polar Webhook to Auto-Activate Subscriptions

Your subscription is stuck in "pending" because the webhook hasn't fired yet. Here's how to fix it:

### Option 1: Setup Webhook in Polar (Recommended for Production)

#### Step 1: Get Your Webhook URL

For local development, you need to expose your localhost. Use one of these:

**Using ngrok (Recommended):**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

This will give you a URL like: `https://abc123.ngrok.io`

Your webhook URL will be: `https://abc123.ngrok.io/api/polar-webhook`

**For production:**
Your webhook URL will be: `https://yourdomain.com/api/polar-webhook`

#### Step 2: Configure Webhook in Polar Dashboard

1. Go to: https://sandbox.polar.sh/dashboard/webhooks (or production dashboard)
2. Click "Create Webhook" or "Add Endpoint"
3. Enter your webhook URL: `https://abc123.ngrok.io/api/polar-webhook`
4. Select events to listen for:
   - ✅ `checkout.created`
   - ✅ `checkout.updated`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `order.created`
5. Copy the webhook secret
6. Add it to your `.env.local`:
   ```
   POLAR_WEBHOOK_SECRET=polar_whs_xxxxxxxxxxxxx
   ```
7. Restart your dev server

#### Step 3: Test the Webhook

1. Make a test payment
2. Check Polar dashboard > Webhooks > Recent Deliveries
3. You should see webhook events being sent
4. Check your server logs for "Polar webhook event: subscription.created"

### Option 2: Manually Activate (Quick Fix for Testing)

If you just want to test and don't want to set up webhooks yet:

1. Go to your Supabase SQL Editor
2. Run the script: `ACTIVATE_PENDING_SUBSCRIPTION.sql`
3. Replace 'your-email@example.com' with your actual email
4. Run the UPDATE query
5. Refresh the subscription page

### Option 3: Use the Test Button

1. Go to: http://localhost:3000/settings/subscription
2. Click "Cancel in Polar & Clear (Test Only)"
3. This will clear your subscription
4. Go back to pricing and subscribe again
5. This time, manually activate using Option 2

### Verify Webhook is Working

After setting up the webhook, check:

1. **Polar Dashboard:**
   - Go to Webhooks section
   - Check "Recent Deliveries"
   - Should show successful deliveries (200 status)

2. **Your Server Logs:**
   - Look for: "Polar webhook event: subscription.created"
   - Should show user being updated

3. **Your Database:**
   - Run: `SELECT * FROM polar_subscriptions;`
   - Should show the subscription with status 'active'

### Troubleshooting

**Webhook not firing:**
- Make sure ngrok is running
- Check webhook URL is correct in Polar
- Verify webhook secret matches in .env.local

**Webhook failing (500 error):**
- Check server logs for errors
- Verify SUPABASE_SERVICE_KEY is set
- Check if webhook_events table exists

**Subscription still pending:**
- Check if webhook delivered successfully in Polar dashboard
- Check server logs for webhook processing
- Manually activate using Option 2

### For Production

When deploying to production:

1. Update webhook URL in Polar to your production domain
2. Make sure POLAR_WEBHOOK_SECRET is set in production environment
3. Test with a real payment
4. Monitor webhook deliveries in Polar dashboard

### Current Status

Your subscription is "pending" because:
- ✅ Payment was successful
- ✅ Checkout completed
- ❌ Webhook hasn't fired yet (or not configured)
- ❌ Subscription not activated in database

**Quick Fix:** Run `ACTIVATE_PENDING_SUBSCRIPTION.sql` to manually activate it now!
