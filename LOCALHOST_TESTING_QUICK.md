# Localhost Testing - Super Quick Guide

## What You Need

1. Your app running on localhost
2. Ngrok (to expose localhost to internet)
3. Polar Sandbox account

## 3-Minute Setup

### Step 1: Install Ngrok

Download: https://ngrok.com/download

Or install with npm:
```bash
npm install -g ngrok
```

### Step 2: Run Your App + Ngrok

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
ngrok http 3000
```

**Copy the HTTPS URL** from ngrok output:
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:3000
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            COPY THIS!
```

### Step 3: Add Webhook in Polar Sandbox

1. Go to: https://sandbox.polar.sh/dashboard
2. Settings → Webhooks → Add Webhook
3. Paste: `https://abc123.ngrok-free.app/api/polar-webhook`
   (Your ngrok URL + `/api/polar-webhook`)
4. Select events: subscription.created, subscription.updated, subscription.canceled
5. Save and **COPY THE SECRET**

### Step 4: Update .env.local

```env
POLAR_WEBHOOK_SECRET=whsec_paste_secret_here
```

Save and restart:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 5: Test!

1. Go to: http://localhost:3000/pricing
2. Click "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check `/admin` - subscription should appear!

## Visual Flow

```
┌─────────────────┐
│  Your Computer  │
│                 │
│  localhost:3000 │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Ngrok       │
│                 │
│  Public HTTPS   │
│  URL Created    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Polar Sandbox  │
│                 │
│  Sends Webhooks │
│  to Ngrok URL   │
└─────────────────┘
```

## Important!

⚠️ **Ngrok URL changes** every time you restart ngrok (free plan)
- When ngrok restarts, update webhook URL in Polar
- Or upgrade to ngrok paid plan for static URL

⚠️ **Keep ngrok running** while testing
- Don't close the ngrok terminal
- If closed, webhooks won't work

## Quick Test

```bash
# Terminal 1
npm run dev

# Terminal 2  
ngrok http 3000

# Browser
# 1. Copy ngrok URL
# 2. Add to Polar: https://YOUR-NGROK-URL/api/polar-webhook
# 3. Test purchase at localhost:3000/pricing
```

## Ngrok Dashboard

While testing, open:
```
http://127.0.0.1:4040
```

See all webhook requests in real-time!

## Test Card

```
Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
```

## Done! 🎉

You can now test Polar subscriptions on localhost!
