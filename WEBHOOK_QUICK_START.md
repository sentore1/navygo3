# Polar Webhook - Quick Start (5 Minutes)

## 🎯 Goal
Connect Polar to your app so subscriptions update automatically.

## 📋 What You Need
- Your app deployed (or ngrok for testing)
- Access to Polar dashboard
- 5 minutes

## 🚀 Quick Steps

### 1. Get Your Webhook URL

**If deployed:**
```
https://navygoal.com/api/polar-webhook
```

**If testing locally:**
```bash
# Install ngrok: https://ngrok.com/download
# Run your app
npm run dev

# In another terminal
ngrok http 3000

# Copy the https URL, add /api/polar-webhook
# Example: https://abc123.ngrok.io/api/polar-webhook
```

### 2. Add Webhook in Polar

1. Go to https://polar.sh/dashboard
2. Click **Settings** → **Webhooks**
3. Click **"Add Webhook"**
4. Paste your webhook URL
5. Select these events:
   - ✅ subscription.created
   - ✅ subscription.updated
   - ✅ subscription.canceled
   - ✅ checkout.created
6. Click **"Create"**
7. **COPY THE SECRET** (starts with `whsec_`)

### 3. Add Secret to .env.local

```env
POLAR_WEBHOOK_SECRET=whsec_paste_your_secret_here
```

Save and restart your server:
```bash
npm run dev
```

### 4. Test It

In Polar dashboard:
1. Go to Webhooks
2. Click your webhook
3. Click **"Send Test Event"**
4. Choose `subscription.created`
5. Click **"Send"**

Check your terminal - you should see logs!

### 5. Verify

Make a test purchase:
1. Go to `/pricing`
2. Click "Subscribe Now"
3. Complete checkout
4. Go to `/admin`
5. You should see the subscription!

## ✅ Done!

Your webhook is now set up. Polar will automatically notify your app about:
- New subscriptions
- Subscription updates
- Cancellations
- Payments

## 🔧 Troubleshooting

**Webhook fails?**
- Check the secret is correct in `.env.local`
- Restart your server
- Make sure URL is publicly accessible

**Subscription not updating?**
- Check Supabase logs
- Verify migrations are run
- Check `polar_subscriptions` table exists

**Need more help?**
See `POLAR_WEBHOOK_SETUP.md` for detailed guide.

## 📊 What Happens

```
User subscribes
    ↓
Polar processes payment
    ↓
Polar sends webhook to your app
    ↓
Your app updates database
    ↓
User gets access
```

## 🎉 You're All Set!

Your app now automatically:
- ✅ Activates subscriptions
- ✅ Updates subscription status
- ✅ Handles cancellations
- ✅ Tracks revenue
