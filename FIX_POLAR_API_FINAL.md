# Fix Polar API - Final Steps

## The Problem

Your API key and Organization ID don't match. They're from different accounts or environments.

Current Org ID: `2d4bea8d-3408-4672-a1b5-b906db0ee08d`
Current API Key: Returns 401 Unauthorized

## The Solution

You need to get BOTH the API key AND Organization ID from the SAME place.

## Step-by-Step Fix

### 1. Go to Your Polar Dashboard

**For Sandbox (testing):**
```
https://sandbox.polar.sh/dashboard
```

**For Production (real payments):**
```
https://polar.sh/dashboard
```

Choose ONE and stick with it!

### 2. Get Your Organization ID

1. In the dashboard, click **Settings**
2. Look for **Organization** or **Organization Settings**
3. Find the **Organization ID** (a UUID like: `abc123-def456-...`)
4. **COPY IT**

### 3. Create a New API Key

1. Still in the same dashboard (sandbox or production)
2. Go to **Settings** → **API Keys** or **Developer**
3. Click **"Create API Key"** or **"New API Key"**
4. Give it a name: "NavyGoal API"
5. Make sure it's **Server-side** (not client-side)
6. **COPY THE KEY** (starts with `polar_oat_`)

### 4. Update Your .env.local

Replace with the values you just copied:

```env
# Polar Configuration
POLAR_API_KEY=polar_oat_PASTE_YOUR_NEW_KEY_HERE
POLAR_ACCESS_TOKEN=polar_oat_PASTE_YOUR_NEW_KEY_HERE
POLAR_ORGANIZATION_ID=PASTE_YOUR_ORG_ID_HERE
POLAR_WEBHOOK_SECRET=polar_whs_PC8ViaeyUNK7tJMWr8IImhf1Uhjcnqn1lxZnm1BrbGg
```

### 5. Completely Restart Your Server

**Important:** Close the terminal completely and open a new one:

```bash
# Close current terminal (Ctrl+C won't reload env vars properly)
# Open NEW terminal
cd C:\Users\lenovo\navygoal\navygoal
npm run dev
```

### 6. Test

Go to: `http://localhost:3000/pricing`

Check your terminal - you should see:
```
Polar API response status: 200
Polar products fetched: 2
```

## Common Mistakes

### ❌ Mistake 1: Mixed Environments
- API Key from Sandbox
- Org ID from Production
- **Fix:** Get both from the same place

### ❌ Mistake 2: Wrong Key Type
- Using client-side key (`polar_pk_...`)
- **Fix:** Use server-side key (`polar_oat_...`)

### ❌ Mistake 3: Not Restarting Properly
- Just pressing Ctrl+C and restarting
- **Fix:** Close terminal completely, open new one

### ❌ Mistake 4: Wrong Organization
- Multiple organizations in account
- Using wrong org ID
- **Fix:** Make sure org ID matches the one with your products

## Verify Your Products Exist

Before testing, make sure you have products in Polar:

1. In Polar dashboard, go to **Products**
2. You should see:
   - Navy goal ($4.97/month)
   - Delta Goal ($8/month)
3. Make sure they're **not archived**
4. Make sure they have **prices** set

## If It Still Doesn't Work

### Option 1: Share Your Dashboard URL

Tell me which dashboard you're using:
- Sandbox: https://sandbox.polar.sh
- Production: https://polar.sh

### Option 2: Check API Key Permissions

Some API keys have limited permissions. Make sure your key can:
- Read products
- Create checkouts
- Access organization data

### Option 3: Contact Polar Support

If credentials keep failing, contact Polar support to verify:
- Your API key is valid
- Your organization ID is correct
- Your account has proper permissions

## What Should Happen

When it works:
1. Pricing page loads instantly
2. Shows your real products from Polar
3. Prices match what's in Polar dashboard
4. Click "Subscribe Now" redirects to Polar checkout
5. Complete payment updates your database

## Current Status

Right now:
- ❌ API returns 401 Unauthorized
- ❌ Can't fetch products from Polar
- ✅ Hardcoded products work as temporary solution

After fix:
- ✅ API returns 200 OK
- ✅ Fetches real products from Polar
- ✅ Everything works automatically

## Need Help?

After you update the credentials:
1. Show me what you see in terminal
2. Tell me if it's sandbox or production
3. I can help debug further

The key is: **Both API key and Org ID must be from the exact same Polar account/environment.**
