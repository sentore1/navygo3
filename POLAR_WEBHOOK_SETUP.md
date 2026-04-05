# Polar Webhook Setup Guide

## What is a Webhook?

A webhook is how Polar notifies your app when something happens (like a new subscription, payment, or cancellation). Your app needs to listen for these notifications to update user subscription status.

## Step-by-Step Setup

### Step 1: Deploy Your App (or Use Ngrok for Testing)

Webhooks need a public URL. You have two options:

#### Option A: Use Your Production URL (Recommended)
If your app is deployed:
```
https://navygoal.com/api/polar-webhook
```

#### Option B: Use Ngrok for Local Testing
If testing locally:

1. Install ngrok: https://ngrok.com/download
2. Run your app: `npm run dev`
3. In another terminal, run:
```bash
ngrok http 3000
```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Your webhook URL will be:
```
https://abc123.ngrok.io/api/polar-webhook
```

### Step 2: Go to Polar Dashboard

1. Open https://polar.sh/dashboard
2. Sign in to your account
3. Select your organization

### Step 3: Navigate to Webhooks

1. Click on **Settings** in the left sidebar
2. Click on **Webhooks** (or **Developer** → **Webhooks**)
3. Click **"Add Webhook"** or **"Create Webhook"** button

### Step 4: Configure the Webhook

Fill in the form:

**Webhook URL:**
```
https://navygoal.com/api/polar-webhook
```
(or your ngrok URL for testing)

**Events to Subscribe:**
Select these events:
- ✅ `subscription.created` - When a new subscription starts
- ✅ `subscription.updated` - When subscription changes
- ✅ `subscription.canceled` - When subscription is canceled
- ✅ `checkout.created` - When checkout starts
- ✅ `checkout.updated` - When checkout updates
- ✅ `order.created` - When order is created

**Description (optional):**
```
NavyGoal production webhook
```

### Step 5: Save and Get Webhook Secret

1. Click **"Create"** or **"Save"**
2. Polar will show you a **Webhook Secret** (looks like: `whsec_...`)
3. **IMPORTANT:** Copy this secret immediately! You won't see it again.

### Step 6: Add Secret to Environment Variables

1. Open your `.env.local` file
2. Update the webhook secret:

```env
POLAR_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

3. Save the file
4. Restart your development server:
```bash
npm run dev
```

### Step 7: Test the Webhook

#### In Polar Dashboard:

1. Go to Webhooks section
2. Find your webhook
3. Click **"Test"** or **"Send Test Event"**
4. Select event type: `subscription.created`
5. Click **"Send"**

#### Check if it worked:

1. Look at your terminal/console for logs
2. Check Supabase → Table Editor → `webhook_events` table
3. You should see a new row with the test event

### Step 8: Verify in Production

After deploying:

1. Make a test subscription purchase
2. Check that user's subscription status updates
3. Verify in admin dashboard (`/admin`)
4. Check `polar_subscriptions` table in Supabase

## Webhook URL Format

Your webhook endpoint is already created at:
```
/api/polar-webhook
```

Full URLs:
- **Local (with ngrok):** `https://abc123.ngrok.io/api/polar-webhook`
- **Production:** `https://navygoal.com/api/polar-webhook`

## What the Webhook Does

When Polar sends an event, your webhook:

1. **Verifies the signature** (security check)
2. **Processes the event:**
   - `subscription.created` → Creates subscription record
   - `subscription.updated` → Updates subscription status
   - `subscription.canceled` → Marks subscription as inactive
3. **Updates database:**
   - Updates `users` table (subscription_status)
   - Updates `polar_subscriptions` table
   - Logs event in `webhook_events` table

## Troubleshooting

### Webhook Returns 401 Unauthorized

**Problem:** Signature verification failed

**Solution:**
1. Check `POLAR_WEBHOOK_SECRET` in `.env.local`
2. Make sure it matches the secret from Polar dashboard
3. Restart your server after updating

### Webhook Returns 500 Error

**Problem:** Server error processing webhook

**Solution:**
1. Check server logs for error details
2. Verify database tables exist (run migrations)
3. Check Supabase connection

### Events Not Updating Database

**Problem:** Webhook receives events but doesn't update data

**Solution:**
1. Check that `user_id` is in the metadata
2. Verify `polar_subscriptions` table exists
3. Check Supabase logs for errors
4. Ensure RLS policies allow updates

### Can't Access Webhook URL

**Problem:** Polar can't reach your webhook

**Solution:**
1. Make sure your app is deployed and running
2. Check that URL is publicly accessible
3. For local testing, use ngrok
4. Verify no firewall blocking requests

## Testing Checklist

- [ ] Webhook URL is publicly accessible
- [ ] Webhook secret is in `.env.local`
- [ ] Server is running
- [ ] Test event sent from Polar dashboard
- [ ] Event appears in `webhook_events` table
- [ ] Make test subscription purchase
- [ ] User subscription status updates
- [ ] Subscription appears in admin dashboard

## Security Notes

✅ **Webhook signature verification** - Prevents fake requests
✅ **HTTPS only** - Encrypted communication
✅ **Secret key** - Only Polar knows your secret
✅ **Database RLS** - Row-level security protects data

## Webhook Events Reference

| Event | When It Fires | What It Does |
|-------|---------------|--------------|
| `subscription.created` | New subscription starts | Creates subscription record, activates user |
| `subscription.updated` | Subscription changes | Updates subscription details |
| `subscription.canceled` | User cancels | Deactivates subscription |
| `checkout.created` | Checkout starts | Logs checkout event |
| `checkout.updated` | Checkout updates | Logs checkout progress |
| `order.created` | Order completed | Logs order (for one-time purchases) |

## Environment Variables Needed

```env
# Polar Configuration
POLAR_API_KEY=polar_oat_...
POLAR_ORGANIZATION_ID=e80dcdcd-a93a-438c-91ef-d7981855377e
POLAR_WEBHOOK_SECRET=whsec_your_secret_here

# Supabase (for webhook to update database)
SUPABASE_URL=https://rilhdwxirwxqfgsqpiww.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Quick Setup Commands

```bash
# 1. Make sure your app is running
npm run dev

# 2. For local testing, start ngrok in another terminal
ngrok http 3000

# 3. Copy the ngrok URL and add /api/polar-webhook
# Example: https://abc123.ngrok.io/api/polar-webhook

# 4. Add this URL to Polar dashboard webhooks

# 5. Test by sending a test event from Polar
```

## Next Steps

After webhook is set up:

1. ✅ Test with a real subscription purchase
2. ✅ Verify user gets access
3. ✅ Check admin dashboard shows subscription
4. ✅ Test subscription cancellation
5. ✅ Monitor webhook logs for issues

## Need Help?

If webhooks aren't working:

1. Check Polar dashboard → Webhooks → Delivery logs
2. Check your server logs
3. Check Supabase logs
4. Verify all environment variables are set
5. Test with ngrok first before production

## Webhook File Location

The webhook handler is at:
```
src/app/api/polar-webhook/route.ts
```

You can add custom logic there if needed.
