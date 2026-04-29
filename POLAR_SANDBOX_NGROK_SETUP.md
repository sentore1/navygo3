# Polar Sandbox Setup with ngrok

## Overview
To test Polar payments in sandbox mode, you need a publicly accessible URL for webhooks and redirects. ngrok creates a secure tunnel from a public URL to your local development server.

## Requirements

### 1. ngrok Installation
Download and install ngrok:
- Visit: https://ngrok.com/download
- Or install via package manager:
  ```bash
  # Windows (Chocolatey)
  choco install ngrok
  
  # Or download directly
  # Extract ngrok.exe to a folder in your PATH
  ```

### 2. ngrok Account (Free)
- Sign up at: https://dashboard.ngrok.com/signup
- Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## Step-by-Step Setup

### Step 1: Start Your Development Server
```bash
cd navygoal
npm run dev
# Server should be running on http://localhost:3000
```

### Step 2: Start ngrok Tunnel
Open a new terminal and run:
```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

**Important**: Copy the `https://abc123.ngrok-free.app` URL (your ngrok URL will be different)

### Step 3: Update Environment Variables

Update your `.env.local` file:
```env
# Replace with your ngrok URL
NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app

# Keep these as-is for sandbox
POLAR_API_URL=https://sandbox-api.polar.sh
POLAR_API_KEY=polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA
POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d
POLAR_WEBHOOK_SECRET=polar_whs_YOUR_PRODUCTION_WEBHOOK_SECRET
```

### Step 4: Configure Polar Sandbox

1. **Login to Polar Sandbox**
   - Go to: https://sandbox.polar.sh
   - Login with your Polar account

2. **Configure Webhook Endpoint**
   - Navigate to: Settings → Webhooks
   - Add webhook URL: `https://YOUR_NGROK_URL/api/webhooks/polar`
   - Example: `https://abc123.ngrok-free.app/api/webhooks/polar`
   - Select events to listen for:
     - `checkout.created`
     - `checkout.updated`
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
   - Save and copy the webhook secret
   - Update `POLAR_WEBHOOK_SECRET` in `.env.local`

3. **Configure Product/Checkout**
   - Go to: Products → Your Product
   - Update success URL: `https://YOUR_NGROK_URL/checkout/success?session_id={CHECKOUT_ID}`
   - Update cancel URL: `https://YOUR_NGROK_URL/pricing`

4. **Update Checkout Links**
   - Go to your product checkout settings
   - Ensure redirect URLs use your ngrok domain

### Step 5: Restart Your Development Server
```bash
# Stop the dev server (Ctrl+C)
# Restart it to load new environment variables
npm run dev
```

## Testing the Integration

### Test Checkout Flow:
1. Visit: `https://YOUR_NGROK_URL/pricing`
2. Click on a subscription plan
3. Complete checkout with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

### Test Webhook Delivery:
1. Go to Polar Sandbox → Webhooks
2. View webhook delivery logs
3. Check your terminal for webhook processing logs
4. Verify subscription appears in your database

### Test Subscription Management:
1. Login to your app: `https://YOUR_NGROK_URL/sign-in`
2. Go to Settings
3. Test "Manage Billing" button
4. Test "Cancel Subscription" button

## Important Notes

### ngrok Free Tier Limitations:
- URL changes every time you restart ngrok
- Limited to 40 connections/minute
- Session expires after 2 hours (need to restart)

### When ngrok URL Changes:
You must update:
1. `.env.local` → `NEXT_PUBLIC_SITE_URL`
2. Polar Sandbox → Webhook URL
3. Polar Sandbox → Product redirect URLs
4. Restart your dev server

### ngrok Pro Benefits (Optional):
- Custom subdomain (e.g., `myapp.ngrok.io`)
- No session timeout
- More connections
- Cost: $8-10/month

## Troubleshooting

### Issue: "Invalid redirect URL"
**Solution**: Ensure all Polar product settings use your ngrok URL

### Issue: Webhooks not received
**Solution**: 
- Check ngrok is running
- Verify webhook URL in Polar matches ngrok URL
- Check firewall/antivirus isn't blocking ngrok

### Issue: "Site can't be reached"
**Solution**:
- Ensure dev server is running on port 3000
- Restart ngrok tunnel
- Check ngrok dashboard: https://dashboard.ngrok.com/observability/http-requests

### Issue: Environment variables not updating
**Solution**:
- Restart Next.js dev server after changing `.env.local`
- Clear browser cache
- Check `process.env.NEXT_PUBLIC_SITE_URL` in browser console

## Alternative: ngrok Configuration File

Create `ngrok.yml` for persistent settings:
```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  navygoal:
    proto: http
    addr: 3000
    subdomain: myapp  # Requires paid plan
```

Start with:
```bash
ngrok start navygoal
```

## Production Deployment

When deploying to production:
1. Replace ngrok URL with your actual domain
2. Update all Polar settings to use production URLs
3. Switch from sandbox to production Polar API
4. Update environment variables:
   ```env
   NEXT_PUBLIC_SITE_URL=https://navygoal.com
   POLAR_API_URL=https://api.polar.sh
   POLAR_API_KEY=polar_oat_PRODUCTION_KEY
   ```

## Quick Reference Commands

```bash
# Start ngrok
ngrok http 3000

# Start ngrok with custom region
ngrok http 3000 --region eu

# Start ngrok with custom subdomain (paid)
ngrok http 3000 --subdomain=myapp

# View ngrok web interface
# Open browser to: http://localhost:4040

# Check ngrok status
ngrok status

# Stop ngrok
# Press Ctrl+C in ngrok terminal
```

## Checklist

Before testing Polar payments:
- [ ] ngrok installed and authenticated
- [ ] ngrok tunnel running
- [ ] `.env.local` updated with ngrok URL
- [ ] Polar webhook URL configured
- [ ] Polar product redirect URLs updated
- [ ] Dev server restarted
- [ ] Test checkout page loads
- [ ] Test payment with test card
- [ ] Verify webhook received
- [ ] Check subscription in database
- [ ] Test subscription management buttons

## Support Resources

- ngrok Documentation: https://ngrok.com/docs
- Polar Sandbox: https://sandbox.polar.sh
- Polar Documentation: https://docs.polar.sh
- Polar Webhooks Guide: https://docs.polar.sh/webhooks
- Test Cards: https://docs.polar.sh/testing
