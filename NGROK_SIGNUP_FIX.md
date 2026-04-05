# Ngrok Showing Only IP? Here's the Fix

## The Issue

Ngrok free tier without authentication only shows IP addresses. You need to sign up (free) to get HTTPS URLs.

## Quick Fix (2 Minutes)

### Step 1: Sign Up for Free Ngrok Account

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with email or GitHub (it's FREE!)
3. After signing in, you'll see your dashboard

### Step 2: Get Your Authtoken

1. On the ngrok dashboard, look for **"Your Authtoken"**
2. Or go directly to: https://dashboard.ngrok.com/get-started/your-authtoken
3. Click **"Copy"** to copy your authtoken
4. It looks like: `2abc123def456ghi789jkl0mnop1qrs2_3tuv4wxy5z6ABC7DEF8GHI`

### Step 3: Add Authtoken to Ngrok

In your terminal, run:

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

Example:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl0mnop1qrs2_3tuv4wxy5z6ABC7DEF8GHI
```

You should see:
```
Authtoken saved to configuration file: C:\Users\lenovo\.ngrok2\ngrok.yml
```

### Step 4: Start Ngrok Again

```bash
ngrok http 3000
```

Now you should see:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.3.1
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-def456-ghi789.ngrok-free.app -> http://localhost:3000
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              THIS IS YOUR HTTPS URL!

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

## What You Get with Free Account

✅ HTTPS URLs (not just IP)
✅ Longer session times
✅ More stable connections
✅ Access to ngrok dashboard
✅ Request inspection at http://127.0.0.1:4040

## Alternative: Use Localtunnel (No Signup Required)

If you don't want to sign up, you can use localtunnel instead:

### Install Localtunnel:
```bash
npm install -g localtunnel
```

### Start Localtunnel:
```bash
lt --port 3000
```

You'll get a URL like:
```
your url is: https://funny-cat-123.loca.lt
```

Use this URL for your webhook: `https://funny-cat-123.loca.lt/api/polar-webhook`

**Note:** First time you visit, you'll see a page asking for the IP. Just click "Continue" and it will work.

## Which Should You Use?

**Ngrok (Recommended):**
- ✅ More reliable
- ✅ Better dashboard
- ✅ Industry standard
- ⚠️ Requires free signup

**Localtunnel:**
- ✅ No signup needed
- ✅ Quick to start
- ⚠️ Less stable
- ⚠️ Shows IP confirmation page first time

## Complete Flow with Ngrok

```bash
# 1. Sign up at https://dashboard.ngrok.com/signup

# 2. Get authtoken from dashboard

# 3. Add authtoken
ngrok config add-authtoken YOUR_TOKEN

# 4. Start your app
npm run dev

# 5. Start ngrok (in new terminal)
ngrok http 3000

# 6. Copy the HTTPS URL
# Example: https://abc123.ngrok-free.app

# 7. Use in Polar webhook
# https://abc123.ngrok-free.app/api/polar-webhook
```

## Troubleshooting

### Still showing IP?

Make sure you:
1. Signed up for ngrok account
2. Copied the authtoken correctly
3. Ran `ngrok config add-authtoken YOUR_TOKEN`
4. Restarted ngrok

### "Invalid authtoken"

- Check you copied the full token
- Make sure no extra spaces
- Get a new token from dashboard

### Want to check your config?

```bash
ngrok config check
```

This shows your current configuration.

## Quick Commands

```bash
# Sign up (in browser)
https://dashboard.ngrok.com/signup

# Add authtoken (in terminal)
ngrok config add-authtoken YOUR_TOKEN

# Start ngrok
ngrok http 3000

# Check version
ngrok version

# Check config
ngrok config check
```

## What's Next?

Once you have the HTTPS URL:

1. Copy it (e.g., `https://abc123.ngrok-free.app`)
2. Go to Polar Sandbox: https://sandbox.polar.sh/dashboard
3. Settings → Webhooks → Add Webhook
4. URL: `https://abc123.ngrok-free.app/api/polar-webhook`
5. Copy webhook secret
6. Add to `.env.local`
7. Test!

## Need Help?

Show me what you see when you run `ngrok http 3000` and I can help you fix it!
