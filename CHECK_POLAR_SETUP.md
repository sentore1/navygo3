# Check Your Polar Setup

## The Issue

You're getting 401 Unauthorized even with a new API key. This usually means:

1. **Mismatch between API key and Organization ID**
   - Sandbox API key + Production Org ID = ❌
   - Production API key + Sandbox Org ID = ❌
   - Sandbox API key + Sandbox Org ID = ✅

2. **Wrong API key type**
   - Need a **Server-side** API key (starts with `polar_oat_`)
   - Not a **Client-side** key (starts with `polar_pk_`)

## How to Fix

### Step 1: Verify You're in Sandbox

Go to: **https://sandbox.polar.sh/dashboard**

Make sure the URL says **sandbox.polar.sh** (not just polar.sh)

### Step 2: Get Organization ID from Sandbox

1. In Sandbox dashboard, click **Settings**
2. Look for **Organization ID** or **Organization Settings**
3. Copy the UUID (looks like: `2d4bea8d-3408-4672-a1b5-b906db0ee08d`)

### Step 3: Create New API Key in Sandbox

1. Still in **https://sandbox.polar.sh/dashboard**
2. Go to **Settings** → **API Keys** (or **Developer**)
3. Click **"Create API Key"**
4. Name it: "NavyGoal Development"
5. Make sure it's a **Server-side** key
6. Copy the key (starts with `polar_oat_`)

### Step 4: Update .env.local

Make sure BOTH are from sandbox:

```env
# Both from https://sandbox.polar.sh/dashboard
POLAR_API_KEY=polar_oat_NEW_KEY_FROM_SANDBOX
POLAR_ORGANIZATION_ID=YOUR_ORG_ID_FROM_SANDBOX
```

### Step 5: Restart Server

```bash
# Close terminal completely
# Open new terminal
cd C:\Users\lenovo\navygoal\navygoal
npm run dev
```

## Double Check

### Your Current Values

Check your `.env.local`:

```env
POLAR_API_KEY=polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn
POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d
```

### Verify They Match

1. Go to https://sandbox.polar.sh/dashboard
2. Check if your organization ID matches
3. If not, you might be looking at production instead of sandbox

## Common Mistakes

### Mistake 1: Using Production Key with Sandbox Org

**Wrong:**
- API Key from: https://polar.sh (production)
- Org ID from: https://sandbox.polar.sh (sandbox)

**Right:**
- Both from: https://sandbox.polar.sh

### Mistake 2: Using Client-side Key

**Wrong:**
- Key starts with: `polar_pk_...` (client-side)

**Right:**
- Key starts with: `polar_oat_...` (server-side)

### Mistake 3: Wrong Organization

You might have multiple organizations. Make sure you're using the right one:

1. In Sandbox dashboard, check organization name
2. Make sure it's the one with your products
3. Copy the org ID from that specific organization

## Test Manually

After updating `.env.local`, test in PowerShell:

```powershell
# Load the new values
$env:POLAR_API_KEY = "polar_oat_YOUR_NEW_KEY"
$env:POLAR_ORGANIZATION_ID = "YOUR_ORG_ID"

# Test
$headers = @{
    "Authorization" = "Bearer $env:POLAR_API_KEY"
    "Content-Type" = "application/json"
}
Invoke-RestMethod -Uri "https://api.polar.sh/v1/products?organization_id=$env:POLAR_ORGANIZATION_ID" -Headers $headers
```

If this works, then update `.env.local` and restart your app.

## Still Not Working?

### Option 1: Use Polar Dashboard URL

Instead of API, you can use direct checkout links:

1. Create checkout links in Polar dashboard
2. Use those links directly
3. Skip the API entirely

### Option 2: Contact Polar Support

If API keys keep failing:
1. Check Polar documentation
2. Contact Polar support
3. They can verify your API key permissions

## Temporary Workaround

For now, I can add back the hardcoded products so you can test the rest of the functionality (webhooks, checkout, etc.) while we figure out the API issue.

Want me to do that?
