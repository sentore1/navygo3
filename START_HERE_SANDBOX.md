# 🚀 Start Here: Sandbox + Localhost Testing

## You Need Ngrok!

Since you're testing on **localhost** with **Polar Sandbox**, you need ngrok to expose your localhost to the internet so Polar can send webhooks.

## Quick Setup (5 Minutes)

### 1. Install Ngrok

**Download:** https://ngrok.com/download

**Or use npm:**
```bash
npm install -g ngrok
```

### 2. Run Everything

**Terminal 1 - Your App:**
```bash
npm run dev
```
✅ App running on http://localhost:3000

**Terminal 2 - Ngrok:**
```bash
ngrok http 3000
```
✅ Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### 3. Setup Polar Sandbox Webhook

1. Go to: **https://sandbox.polar.sh/dashboard** (SANDBOX!)
2. Click: **Settings** → **Webhooks** → **Add Webhook**
3. Webhook URL: `https://YOUR-NGROK-URL/api/polar-webhook`
   - Example: `https://abc123.ngrok-free.app/api/polar-webhook`
4. Select events:
   - ✅ subscription.created
   - ✅ subscription.updated  
   - ✅ subscription.canceled
5. Click **Create**
6. **COPY THE SECRET!** (starts with `whsec_`)

### 4. Add Secret to .env.local

```env
POLAR_WEBHOOK_SECRET=whsec_your_secret_here
```

**Save and restart your app:**
```bash
# Press Ctrl+C to stop
npm run dev
```

### 5. Test It!

**Test the webhook:**
1. In Polar Sandbox → Webhooks
2. Click your webhook
3. Click "Send Test Event"
4. Check your terminal - should see logs!

**Test a purchase:**
1. Go to: http://localhost:3000/pricing
2. Click "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Go to: http://localhost:3000/admin
6. See your subscription! 🎉

## What's Running

```
Terminal 1: npm run dev          → localhost:3000
Terminal 2: ngrok http 3000      → Public HTTPS URL
Browser:    Polar Sandbox        → Sends webhooks to ngrok
```

## Important Notes

⚠️ **Keep both terminals open** while testing

⚠️ **Ngrok URL changes** when you restart ngrok (free plan)
- Get new URL from ngrok
- Update webhook in Polar Sandbox
- No need to change the secret

⚠️ **Use Sandbox** for testing
- Sandbox: https://sandbox.polar.sh
- Production: https://polar.sh (later)

## Test Card

```
Card Number: 4242 4242 4242 4242
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
```

## Ngrok Dashboard

Open http://127.0.0.1:4040 to see:
- All webhook requests
- Request/response details
- Errors and debugging info

## Troubleshooting

**Ngrok not found?**
```bash
npm install -g ngrok
```

**Webhook not working?**
- Check ngrok is running
- Verify webhook URL includes `/api/polar-webhook`
- Check secret in `.env.local`
- Restart your app

**Can't see products?**
- Check you're using Polar Sandbox
- Verify products exist in sandbox
- Check browser console for errors

## Complete Flow

```
1. npm run dev                    ✅ App running
2. ngrok http 3000                ✅ Get public URL
3. Add webhook in Polar Sandbox   ✅ Configure webhook
4. Copy secret to .env.local      ✅ Add secret
5. Restart app                    ✅ Load new config
6. Test purchase                  ✅ Use test card
7. Check /admin                   ✅ See subscription
```

## Files to Read

- **`LOCALHOST_TESTING_QUICK.md`** - Quick visual guide
- **`POLAR_SANDBOX_LOCALHOST_SETUP.md`** - Detailed setup
- **`POLAR_CHECKLIST.md`** - Complete checklist

## Ready to Start?

1. Install ngrok
2. Run `npm run dev`
3. Run `ngrok http 3000`
4. Follow steps above

You'll be testing in 5 minutes! 🚀
