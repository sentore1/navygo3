# Setup Polar Webhook - Step by Step

## ✅ Your Ngrok is Working!

URL: `https://epistylar-tonya-nontemporally.ngrok-free.dev/`

## Now Setup the Webhook

### Step 1: Go to Polar Sandbox

Open in your browser:
```
https://sandbox.polar.sh/dashboard
```

### Step 2: Navigate to Webhooks

1. Click **"Settings"** in the left sidebar
2. Click **"Webhooks"**
3. Click **"Add Webhook"** or **"Create Webhook"** button

### Step 3: Fill in the Webhook Form

**Webhook URL:**
```
https://epistylar-tonya-nontemporally.ngrok-free.dev/api/polar-webhook
```

**Events to Subscribe (check these boxes):**
- ✅ `subscription.created`
- ✅ `subscription.updated`
- ✅ `subscription.canceled`
- ✅ `checkout.created`
- ✅ `checkout.updated`

**Description (optional):**
```
Localhost testing webhook
```

### Step 4: Save and Copy Secret

1. Click **"Create"** or **"Save"**
2. Polar will show you a **Webhook Secret**
3. It looks like: `whsec_abc123def456...`
4. **COPY IT NOW!** (You won't see it again)

### Step 5: Add Secret to .env.local

Open your `.env.local` file and update:

```env
POLAR_WEBHOOK_SECRET=whsec_paste_your_secret_here
```

**Save the file!**

### Step 6: Restart Your App

Stop your dev server (Ctrl+C) and restart:

```bash
npm run dev
```

**Keep ngrok running!** Don't close that terminal.

### Step 7: Test the Webhook

#### Test 1: Send Test Event from Polar

1. In Polar Sandbox → Webhooks
2. Find your webhook
3. Click **"Test"** or **"Send Test Event"**
4. Select: `subscription.created`
5. Click **"Send"**

**Check your terminal** - you should see:
```
Polar webhook event: subscription.created
```

#### Test 2: Make a Real Test Purchase

1. Go to: `http://localhost:3000/pricing`
2. Click **"Subscribe Now"**
3. You'll be redirected to Polar checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
5. Complete the purchase
6. You'll be redirected back to your app

**Check your terminal** - you should see webhook events!

**Check ngrok dashboard** - Open `http://127.0.0.1:4040` to see the webhook requests

### Step 8: Verify in Admin Dashboard

1. Go to: `http://localhost:3000/admin`
2. You should see the subscription!
3. User subscription status should be "active"

## Complete Setup Checklist

- [ ] Ngrok running on port 3000
- [ ] App running (`npm run dev`)
- [ ] Webhook added in Polar Sandbox
- [ ] Webhook secret copied to `.env.local`
- [ ] App restarted after adding secret
- [ ] Test event sent from Polar (successful)
- [ ] Test purchase completed
- [ ] Subscription appears in admin dashboard

## Your URLs

**Your App:**
- Local: `http://localhost:3000`
- Public (ngrok): `https://epistylar-tonya-nontemporally.ngrok-free.dev/`

**Webhook URL:**
```
https://epistylar-tonya-nontemporally.ngrok-free.dev/api/polar-webhook
```

**Ngrok Dashboard:**
```
http://127.0.0.1:4040
```

**Polar Sandbox:**
```
https://sandbox.polar.sh/dashboard
```

## Troubleshooting

### Webhook Returns 401 Unauthorized

**Problem:** Secret doesn't match

**Solution:**
1. Check `POLAR_WEBHOOK_SECRET` in `.env.local`
2. Make sure you copied the full secret
3. Restart your app

### Webhook Returns 500 Error

**Problem:** Server error

**Solution:**
1. Check your terminal for error details
2. Make sure database migrations are run
3. Check Supabase connection

### No Webhook Received

**Problem:** Webhook not reaching your app

**Solution:**
1. Verify ngrok is running
2. Check webhook URL is correct
3. Open `http://127.0.0.1:4040` to see requests
4. Check Polar webhook delivery logs

### Subscription Not Updating

**Problem:** Webhook received but database not updating

**Solution:**
1. Check `polar_subscriptions` table exists
2. Run migration: `supabase/migrations/20260403000002_add_polar_subscriptions.sql`
3. Check Supabase logs for errors

## Important Notes

⚠️ **Keep ngrok running** - If you close it, webhooks stop working

⚠️ **Ngrok URL changes** - Free plan gives you a new URL each time you restart ngrok. If you restart, update the webhook URL in Polar.

⚠️ **Restart app after adding secret** - Environment variables only load on startup

## What Happens When It Works

```
User clicks "Subscribe Now"
    ↓
Redirects to Polar checkout
    ↓
User completes payment
    ↓
Polar sends webhook to ngrok URL
    ↓
Ngrok forwards to localhost:3000
    ↓
Your app receives webhook
    ↓
Database updates subscription status
    ↓
User gets access automatically!
```

## Next Steps

After testing works:

1. ✅ Test different subscription plans
2. ✅ Test subscription cancellation
3. ✅ Test monthly vs yearly billing
4. ✅ Monitor webhook logs in ngrok dashboard
5. ✅ Check admin dashboard shows correct data

## Ready for Production?

When you deploy to production:

1. Deploy your app (Vercel, Netlify, etc.)
2. Get production Polar keys
3. Update webhook URL to production domain
4. Test with real payment (small amount first!)

You're all set! 🚀
