# Polar Webhook Setup for navygoall.com

## You Have Two Webhook Options

Your app has **two webhook handlers**. Choose the one that matches your deployment:

---

## Option 1: Next.js API Route (Recommended for Vercel/Standard Hosting)

**Use this if you're deploying to Vercel, Netlify, or any standard Next.js hosting.**

### Webhook URL:
```
https://navygoall.com/api/polar-webhook
```

### Setup Steps:

1. **Configure in Polar Dashboard**
   - Go to: https://polar.sh/dashboard/settings/webhooks
   - Click **"Add Webhook"**
   - Enter URL: `https://navygoall.com/api/polar-webhook`
   - Select events:
     - ✅ `subscription.created`
     - ✅ `subscription.updated`
     - ✅ `subscription.canceled`
     - ✅ `checkout.created`
     - ✅ `checkout.updated`
   - **Save** and copy the **Webhook Secret**

2. **Update .env.local**
   ```bash
   POLAR_WEBHOOK_SECRET=polar_whs_YOUR_LIVE_SECRET_HERE
   ```

3. **Deploy to Production**
   - Make sure `POLAR_WEBHOOK_SECRET` is set in your hosting environment variables
   - The webhook will be available at `https://navygoall.com/api/polar-webhook`

### Handler Location:
`src/app/api/polar-webhook/route.ts`

---

## Option 2: Supabase Edge Function

**Use this if you want webhooks to run on Supabase infrastructure.**

### Webhook URL:
```
https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/polar-webhook
```

### Setup Steps:

1. **Deploy the Edge Function**
   ```bash
   cd navygoal
   npx supabase functions deploy polar-webhook
   ```

2. **Set Supabase Secrets**
   ```bash
   npx supabase secrets set POLAR_WEBHOOK_SECRET=polar_whs_YOUR_LIVE_SECRET_HERE
   ```

3. **Configure in Polar Dashboard**
   - Go to: https://polar.sh/dashboard/settings/webhooks
   - Click **"Add Webhook"**
   - Enter URL: `https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/polar-webhook`
   - Select the same events as Option 1
   - **Save**

### Handler Location:
`supabase/functions/polar-webhook/index.ts`

---

## Which Option Should You Use?

### Use Option 1 (Next.js API Route) if:
- ✅ You're deploying to Vercel, Netlify, or similar
- ✅ You want everything in one place
- ✅ You're already using Next.js API routes
- ✅ **This is the simpler option for most cases**

### Use Option 2 (Supabase Edge Function) if:
- ✅ You want webhooks separate from your main app
- ✅ You're using Supabase for other functions
- ✅ You want webhooks to run even if your main app is down
- ✅ You prefer serverless functions on Supabase

---

## Testing Your Webhook

### 1. Test with Polar Dashboard

1. Go to: https://polar.sh/dashboard/settings/webhooks
2. Click on your webhook
3. Click **"Send Test Event"**
4. Check the response

### 2. Check Logs

**For Option 1 (Next.js):**
- Check your hosting platform logs (Vercel, Netlify, etc.)
- Look for: `"Polar webhook event:"`

**For Option 2 (Supabase):**
```bash
npx supabase functions logs polar-webhook
```

### 3. Test with Real Subscription

1. Go to: https://navygoall.com/pricing
2. Click **"Get It Done"** on any plan
3. Complete checkout
4. Check database:

```sql
SELECT * FROM polar_subscriptions ORDER BY created_at DESC LIMIT 1;
```

---

## Troubleshooting

### Webhook Returns 500 Error

**Check:**
1. `POLAR_WEBHOOK_SECRET` is set correctly
2. Database connection is working
3. Check logs for specific error

### Subscription Not Created in Database

**Check:**
1. Webhook received the event (check logs)
2. User exists in `users` table
3. `polar_subscriptions` table exists
4. RLS policies allow insertion

### Webhook Signature Verification Failed

**Check:**
1. Webhook secret matches exactly (no extra spaces)
2. Using the correct secret (live vs sandbox)
3. Polar is sending the signature header

---

## Current Sandbox Setup

You mentioned you used:
```
https://rilhdwxirwxqfgsqpiww.supabase.co/
```

This is your **Supabase project URL**, not the webhook URL.

### For Sandbox Testing:

**If using Next.js API Route:**
```
https://your-dev-url.com/api/polar-webhook
```

**If using Supabase Edge Function:**
```
https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/polar-webhook
```

---

## Production Checklist

- [ ] Choose Option 1 or Option 2
- [ ] Get live Polar webhook secret
- [ ] Update environment variables
- [ ] Configure webhook in Polar dashboard
- [ ] Test with "Send Test Event"
- [ ] Test with real checkout
- [ ] Verify subscription in database
- [ ] Monitor logs for errors

---

## Quick Reference

### Your URLs

**Production Domain:** navygoall.com

**Webhook Options:**
- Next.js: `https://navygoall.com/api/polar-webhook`
- Supabase: `https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/polar-webhook`

**Polar Dashboard:**
- Webhooks: https://polar.sh/dashboard/settings/webhooks
- Products: https://polar.sh/dashboard/products

### Environment Variables

```bash
# Required for both options
POLAR_WEBHOOK_SECRET=polar_whs_YOUR_LIVE_SECRET

# Also needed
POLAR_API_KEY=polar_oat_YOUR_LIVE_KEY
POLAR_ORGANIZATION_ID=YOUR_LIVE_ORG_ID
POLAR_API_URL=https://api.polar.sh
```

---

## Recommendation

**For navygoall.com, I recommend Option 1 (Next.js API Route):**

1. Simpler setup
2. Everything in one deployment
3. Easier to debug
4. Works with any Next.js hosting

**Webhook URL to use:**
```
https://navygoall.com/api/polar-webhook
```

Just make sure `POLAR_WEBHOOK_SECRET` is set in your production environment variables!
