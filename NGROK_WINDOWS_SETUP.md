# Ngrok Setup for Windows

## ✅ Ngrok is Now Installed!

I just installed ngrok for you using Windows Package Manager.

## Next Steps

### 1. Close and Reopen Your Terminal

**IMPORTANT:** You must restart your terminal/PowerShell for ngrok to work.

1. Close your current PowerShell/Terminal window
2. Open a NEW PowerShell/Terminal window
3. Navigate back to your project:
   ```bash
   cd C:\Users\lenovo\navygoal\navygoal
   ```

### 2. Verify Ngrok is Installed

```bash
ngrok version
```

You should see something like:
```
ngrok version 3.3.1
```

### 3. Sign Up for Ngrok (Optional but Recommended)

Free account gives you:
- Longer session times
- More connections
- Better URLs

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (free)
3. Copy your authtoken
4. Run:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

### 4. Start Ngrok

**Make sure your app is running first:**

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2 (NEW terminal):**
```bash
ngrok http 3000
```

You should see:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.3.1
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**COPY THE HTTPS URL!** (e.g., `https://abc123.ngrok-free.app`)

## Troubleshooting

### "ngrok: command not found" or nothing happens

**Solution:** Restart your terminal!
1. Close PowerShell completely
2. Open a NEW PowerShell window
3. Try `ngrok version` again

### Still not working?

Try running ngrok with full path:
```bash
C:\Users\lenovo\AppData\Local\Microsoft\WinGet\Links\ngrok.exe http 3000
```

Or add to PATH manually:
1. Search "Environment Variables" in Windows
2. Edit "Path" variable
3. Add: `C:\Users\lenovo\AppData\Local\Microsoft\WinGet\Links\`
4. Restart terminal

### "Failed to start tunnel"

**Solution:** Make sure your app is running on port 3000 first!
```bash
# Terminal 1
npm run dev

# Wait for "ready" message, then in Terminal 2
ngrok http 3000
```

## Quick Test

After restarting terminal:

```bash
# Check ngrok is installed
ngrok version

# Start your app (Terminal 1)
npm run dev

# Start ngrok (Terminal 2)
ngrok http 3000

# Copy the https URL from ngrok output
```

## What You'll See

When ngrok starts successfully, you'll see:
```
ngrok

Session Status                online
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              THIS IS YOUR PUBLIC URL!

Web Interface                 http://127.0.0.1:4040
```

## Next Steps

Once ngrok is running:

1. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
2. Go to Polar Sandbox: https://sandbox.polar.sh/dashboard
3. Add webhook: `https://abc123.ngrok-free.app/api/polar-webhook`
4. Copy webhook secret
5. Add to `.env.local`
6. Restart your app
7. Test!

## Ngrok Dashboard

While ngrok is running, open:
```
http://127.0.0.1:4040
```

This shows all requests to your ngrok URL in real-time!

## Remember

- ✅ Ngrok is installed
- ⚠️ Must restart terminal for it to work
- ⚠️ Keep ngrok running while testing
- ⚠️ Free plan URL changes when you restart ngrok
