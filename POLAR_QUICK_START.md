# Polar Sandbox Quick Start Guide

## 🎯 Goal
Test Polar payments locally using ngrok to create a public URL for webhooks.

## ⚡ Quick Setup (5 minutes)

### 1. Install ngrok
```bash
# Download from: https://ngrok.com/download
# Or use Chocolatey on Windows:
choco install ngrok

# Authenticate (get token from https://dashboard.ngrok.com)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 2. Start Your App
```bash
cd navygoal
npm run dev
# Server runs on http://localhost:3000
```

### 3. Start ngrok (New Terminal)
```bash
# Option A: Use the setup script
./setup-ngrok.ps1

# Option B: Run ngrok directly
ngrok http 3000
```

**Copy your ngrok URL**: `https://abc123.ngrok-free.app`

### 4. Update Environment Variables
Edit `navygoal/.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
```

### 5. Configure Polar Sandbox
Go to: https://sandbox.polar.sh

#### A. Setup Webhook
- Navigate: Settings → Webhooks → Add Webhook
- URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/polar-webhook`
- Events: Select all subscription events
- Copy webhook secret → Update `POLAR_WEBHOOK_SECRET` in `.env.local`

#### B. Update Product Settings
- Go to: Products → Your Product → Settings
- Success URL: `https://abc123.ngrok-free.app/checkout/success?session_id={CHECKOUT_ID}`
- Cancel URL: `https://abc123.ngrok-free.app/pricing`

### 6. Restart Dev Server
```bash
# Stop (Ctrl+C) and restart
npm run dev
```

## 🧪 Test Payment

### 1. Visit Your App
```
https://abc123.ngrok-free.app/pricing
```

### 2. Test Card Details
- Card: `4242 4242 4242 4242`
- Expiry: `12/34` (any future date)
- CVC: `123` (any 3 digits)
- ZIP: `12345` (any 5 digits)

### 3. Complete Checkout
- Click subscribe
- Fill in test card
- Complete payment
- Should redirect to success page

### 4. Verify
- Check Supabase `polar_subscriptions` table
- Check Polar dashboard for subscription
- Login and go to Settings → Subscription Status

## 📋 Your Configuration

### Current Setup:
```env
# Polar Sandbox
POLAR_API_URL=https://sandbox-api.polar.sh
POLAR_API_KEY=polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA
POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d

# Webhook (Supabase Function)
Webhook URL: https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/polar-webhook
```

### Webhook Events to Enable:
- ✅ `subscription.created`
- ✅ `subscription.updated`
- ✅ `subscription.canceled`
- ✅ `checkout.created`
- ✅ `checkout.updated`

## 🔍 Troubleshooting

### Issue: "Webhook failed"
**Check:**
1. Supabase function is deployed: `supabase functions list`
2. Webhook URL is correct
3. `POLAR_WEBHOOK_SECRET` matches Polar dashboard

**Fix:**
```bash
# Deploy webhook function
cd navygoal
supabase functions deploy polar-webhook
```

### Issue: "Invalid redirect URL"
**Fix:** Ensure all Polar product URLs use your ngrok domain

### Issue: ngrok URL changed
**When ngrok restarts, you must:**
1. Update `.env.local` → `NEXT_PUBLIC_SITE_URL`
2. Update Polar product redirect URLs
3. Restart dev server

**Avoid this:** Use ngrok paid plan for persistent subdomain

### Issue: "Site can't be reached"
**Check:**
1. Dev server is running: `http://localhost:3000`
2. ngrok is running: Check terminal
3. Visit ngrok dashboard: `http://localhost:4040`

## 🎓 Understanding the Flow

```
User clicks "Subscribe"
    ↓
Redirects to Polar Checkout (sandbox.polar.sh)
    ↓
User enters test card details
    ↓
Polar processes payment
    ↓
Polar sends webhook to Supabase Function
    ↓
Supabase Function updates database
    ↓
User redirected to success page (your ngrok URL)
    ↓
App shows subscription status
```

## 📊 Monitoring

### View ngrok Requests
Open in browser: `http://localhost:4040`
- See all HTTP requests
- Inspect request/response
- Replay requests

### View Polar Webhooks
Go to: https://sandbox.polar.sh → Webhooks
- See delivery status
- View payload
- Retry failed webhooks

### View Supabase Logs
```bash
supabase functions logs polar-webhook --follow
```

### Check Database
```sql
-- View subscriptions
SELECT * FROM polar_subscriptions ORDER BY created_at DESC;

-- View webhook events
SELECT * FROM webhook_events WHERE type = 'polar' ORDER BY created_at DESC;

-- View users with subscriptions
SELECT u.email, ps.status, ps.current_period_end 
FROM users u 
JOIN polar_subscriptions ps ON u.id = ps.user_id;
```

## 🚀 Next Steps

After successful testing:
1. Deploy to production (Vercel/Netlify)
2. Switch to production Polar API
3. Update all URLs to production domain
4. Test with real payment methods
5. Monitor webhook delivery

## 📚 Resources

- **ngrok Dashboard**: https://dashboard.ngrok.com
- **Polar Sandbox**: https://sandbox.polar.sh
- **Polar Docs**: https://docs.polar.sh
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Test Cards**: https://docs.polar.sh/testing

## 💡 Pro Tips

1. **Keep ngrok running**: Don't close the terminal
2. **Use ngrok web UI**: Visit `http://localhost:4040` to inspect traffic
3. **Save your ngrok URL**: Write it down to avoid confusion
4. **Test webhooks**: Use Polar dashboard to manually trigger webhooks
5. **Check logs**: Always check Supabase function logs for errors

## ✅ Checklist

Before testing:
- [ ] ngrok installed and authenticated
- [ ] Dev server running on port 3000
- [ ] ngrok tunnel active
- [ ] `.env.local` updated with ngrok URL
- [ ] Polar webhook configured
- [ ] Polar product URLs updated
- [ ] Dev server restarted
- [ ] Can access app via ngrok URL

During testing:
- [ ] Pricing page loads
- [ ] Can click subscribe button
- [ ] Redirects to Polar checkout
- [ ] Can enter test card
- [ ] Payment processes successfully
- [ ] Redirects back to app
- [ ] Webhook received (check Polar dashboard)
- [ ] Subscription appears in database
- [ ] User can see subscription in settings

## 🆘 Need Help?

If you're stuck:
1. Check ngrok is running: `http://localhost:4040`
2. Check Polar webhook logs: https://sandbox.polar.sh
3. Check Supabase logs: `supabase functions logs polar-webhook`
4. Verify environment variables are loaded
5. Clear browser cache and try again
