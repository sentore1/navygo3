# Polar Sandbox + Localhost Testing Guide

## Overview

You're using:
- ✅ Polar Sandbox (test mode)
- ✅ Localhost development (http://localhost:3000)

To test webhooks on localhost, you need **ngrok** to create a public URL.

## Step 1: Install Ngrok

### Windows:
1. Download from: https://ngrok.com/download
2. Extract the zip file
3. Move `ngrok.exe` to a folder in your PATH, or just keep it in a folder you remember

### Or use Chocolatey:
```bash
choco install ngrok
```

### Or use npm:
```bash
npm install -g ngrok
```

## Step 2: Start Your App

```bash
npm run dev
```

Your app should be running on `http://localhost:3000`

## Step 3: Start Ngrok

Open a **NEW terminal** (keep your app running in the first one):

```bash
ngrok http 3000
```

You'll see output like this:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**COPY THE HTTPS URL!** (e.g., `https://abc123def456.ngrok-free.app`)

## Step 4: Configure Polar Sandbox Webhook

1. Go to https://sandbox.polar.sh/dashboard (SANDBOX, not production!)
2. Click **Settings** → **Webhooks**
3. Click **"Add Webhook"** or **"Create Webhook"**

**Fill in:**
- **Webhook URL:** `https://abc123def456.ngrok-free.app/api/polar-webhook`
  (Replace with YOUR ngrok URL + `/api/polar-webhook`)
- **Events:** Select these:
  - ✅ subscription.created
  - ✅ subscription.updated
  - ✅ subscription.canceled
  - ✅ checkout.created
  - ✅ checkout.updated
- **Description:** `Localhost testing via ngrok`

4. Click **"Create"**
5. **COPY THE WEBHOOK SECRET** (starts with `whsec_`)

## Step 5: Update .env.local

Add or update the webhook secret:

```env
# Polar Sandbox Configuration
POLAR_API_KEY=polar_oat_EVf72t41o4hskl2ycZJ8zQuF1fP256wtQpsND0fO8lC
POLAR_ORGANIZATION_ID=e80dcdcd-a93a-438c-91ef-d7981855377e
POLAR_WEBHOOK_SECRET=whsec_your_new_secret_from_sandbox
```

**Save the file!**

## Step 6: Restart Your App

Stop your dev server (Ctrl+C) and restart:

```bash
npm run dev
```

**Keep ngrok running!** Don't close that terminal.

## Step 7: Test the Webhook

### In Polar Sandbox Dashboard:

1. Go to **Settings** → **Webhooks**
2. Find your webhook
3. Click **"Test"** or **"Send Test Event"**
4. Select event: `subscription.created`
5. Click **"Send"**

### Check Your Terminal:

You should see logs like:
```
Polar webhook event: subscription.created
```

### Check Ngrok Dashboard:

Open http://127.0.0.1:4040 in your browser to see:
- All requests to your ngrok URL
- Request/response details
- Webhook payloads

## Step 8: Test a Real Purchase

1. Go to `http://localhost:3000/pricing`
2. Click **"Subscribe Now"** on any plan
3. You'll be redirected to Polar Sandbox checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
5. Complete the purchase
6. You should be redirected back to your app
7. Check your terminal - webhook should fire!
8. Go to `/admin` - subscription should appear

## Important Notes

### Ngrok URL Changes
⚠️ **Free ngrok URLs change every time you restart ngrok!**

When you restart ngrok:
1. You get a NEW URL
2. Update the webhook URL in Polar Sandbox
3. No need to change the secret

### Keep Ngrok Running
- Keep the ngrok terminal open while testing
- If you close it, webhooks won't work
- Restart ngrok if needed, then update Polar webhook URL

### Sandbox vs Production

**Sandbox (Testing):**
- URL: https://sandbox.polar.sh
- Use test cards
- Free to test
- Webhooks go to ngrok URL

**Production (Real):**
- URL: https://polar.sh
- Real payments
- Webhooks go to your deployed URL

## Troubleshooting

### Ngrok Not Found
```bash
# Install with npm
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### Webhook Returns 401
- Check webhook secret in `.env.local`
- Make sure you copied the correct secret from Polar
- Restart your dev server

### Webhook Not Received
- Check ngrok is running
- Verify webhook URL in Polar includes `/api/polar-webhook`
- Check ngrok dashboard at http://127.0.0.1:4040
- Look for errors in your terminal

### "Invalid Host Header" Error
Add to your `next.config.js`:
```javascript
module.exports = {
  // ... other config
  async headers() {
    return [
      {
        source: '/api/polar-webhook',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

### Ngrok URL Changed
1. Get new URL from ngrok terminal
2. Update webhook in Polar Sandbox
3. Keep testing!

## Complete Testing Flow

```
Terminal 1: npm run dev (localhost:3000)
    ↓
Terminal 2: ngrok http 3000 (get public URL)
    ↓
Polar Sandbox: Add webhook with ngrok URL
    ↓
Update .env.local with webhook secret
    ↓
Restart dev server
    ↓
Test: Send test event from Polar
    ↓
Test: Make test purchase
    ↓
Verify: Check admin dashboard
```

## Quick Commands

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the https URL from ngrok output
# Example: https://abc123.ngrok-free.app

# Your webhook URL:
# https://abc123.ngrok-free.app/api/polar-webhook
```

## Ngrok Dashboard

While ngrok is running, open:
```
http://127.0.0.1:4040
```

This shows:
- All incoming requests
- Request/response details
- Webhook payloads
- Errors and status codes

Very useful for debugging!

## Environment Variables for Sandbox

```env
# Polar Sandbox (Testing)
POLAR_API_KEY=polar_oat_EVf72t41o4hskl2ycZJ8zQuF1fP256wtQpsND0fO8lC
POLAR_ORGANIZATION_ID=e80dcdcd-a93a-438c-91ef-d7981855377e
POLAR_WEBHOOK_SECRET=whsec_your_sandbox_secret

# When you go to production, you'll get new keys from:
# https://polar.sh (not sandbox)
```

## Test Cards for Sandbox

Use these test cards in Polar Sandbox:

**Success:**
- `4242 4242 4242 4242` - Always succeeds

**Decline:**
- `4000 0000 0000 0002` - Card declined

**Requires Authentication:**
- `4000 0025 0000 3155` - 3D Secure

**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3 digits (e.g., 123)

## Moving to Production

When ready for production:

1. Deploy your app (Vercel, Netlify, etc.)
2. Get production Polar keys from https://polar.sh
3. Update webhook URL to your production domain
4. Update `.env.local` with production keys
5. Test with real payment

## Summary

For localhost testing:
1. ✅ Run app: `npm run dev`
2. ✅ Run ngrok: `ngrok http 3000`
3. ✅ Copy ngrok URL
4. ✅ Add webhook in Polar Sandbox with ngrok URL
5. ✅ Copy webhook secret to `.env.local`
6. ✅ Restart app
7. ✅ Test with test card `4242 4242 4242 4242`

You're all set for sandbox testing! 🎉
