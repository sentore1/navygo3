# Fix Ngrok Port Issue

## The Problem

Your ngrok is forwarding to port 80:
```
https://epistylar-tonya-nontemporally.ngrok-free.dev -> http://localhost:80
```

But your Next.js app runs on port 3000!

## The Fix

### Step 1: Stop Ngrok

In the terminal where ngrok is running, press:
```
Ctrl + C
```

### Step 2: Make Sure Your App is Running

In another terminal:
```bash
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### Step 3: Start Ngrok with Correct Port

```bash
ngrok http 3000
```

Now you should see:
```
Forwarding    https://something.ngrok-free.app -> http://localhost:3000
                                                                    ^^^^
                                                                    Port 3000!
```

## Your Webhook URL

Once ngrok is running on port 3000, your webhook URL will be:

```
https://epistylar-tonya-nontemporally.ngrok-free.dev/api/polar-webhook
```

(Or whatever new URL ngrok gives you)

## Quick Commands

```bash
# Terminal 1: Run your app
npm run dev

# Terminal 2: Run ngrok on port 3000
ngrok http 3000
```

## Verify It's Working

1. Copy your ngrok URL (e.g., `https://something.ngrok-free.app`)
2. Open it in your browser
3. You should see your Next.js app!
4. If you see your app, ngrok is working correctly

## Next Steps

After fixing the port:

1. Get your new ngrok URL
2. Add `/api/polar-webhook` to it
3. Configure in Polar Sandbox
4. Test!
