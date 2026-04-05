# How to Get Polar Credentials - Step by Step

## You Need 3 Things:

1. **POLAR_API_KEY** (or POLAR_ACCESS_TOKEN) - Server-side API key
2. **POLAR_ORGANIZATION_ID** - Your organization UUID
3. **POLAR_WEBHOOK_SECRET** - For webhook verification

---

## Step 1: Go to Polar Sandbox Dashboard

Open your browser and go to:
```
https://sandbox.polar.sh/dashboard
```

**Important:** Use **sandbox.polar.sh** for testing, NOT polar.sh

---

## Step 2: Get Organization ID

### Where to Find It:

1. In the Polar dashboard, look at the **left sidebar**
2. Click on **"Settings"** (gear icon ⚙️)
3. Click on **"Organization"** or **"General"**
4. You'll see **"Organization ID"** - it's a long UUID like:
   ```
   2d4bea8d-3408-4672-a1b5-b906db0ee08d
   ```
5. **Click the copy icon** or select and copy it

### Alternative Way:

Look at your browser URL when you're in the dashboard:
```
https://sandbox.polar.sh/dashboard/YOUR-ORG-NAME
```

The organization ID might also be visible in the URL or in the organization settings.

---

## Step 3: Create API Key

### Where to Find It:

1. Still in **Settings** (left sidebar)
2. Look for **"API Keys"** or **"Developer"** or **"Integrations"**
3. Click on it
4. You'll see a list of API keys (might be empty)
5. Click **"Create API Key"** or **"New API Key"** button

### When Creating:

**Name:** `NavyGoal Development`

**Type:** Make sure it's **"Server-side"** (NOT client-side)
- Server-side keys start with: `polar_oat_...`
- Client-side keys start with: `polar_pk_...`
- You need the **server-side** one!

**Permissions:** Select all or at least:
- Read products
- Create checkouts
- Read subscriptions

**Click "Create"**

### Copy the Key:

After creating, you'll see the key **ONCE**. Copy it immediately!

It looks like:
```
polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn
```

**⚠️ Important:** You won't see this key again! If you lose it, you'll need to create a new one.

---

## Step 4: Get Webhook Secret

### Where to Find It:

1. In **Settings** (left sidebar)
2. Click **"Webhooks"**
3. If you already created a webhook, click on it
4. You'll see **"Webhook Secret"** or **"Signing Secret"**
5. Copy it (starts with `polar_whs_...` or `whsec_...`)

### If You Haven't Created a Webhook Yet:

1. Click **"Add Webhook"** or **"Create Webhook"**
2. **Webhook URL:** `https://your-ngrok-url.ngrok-free.app/api/polar-webhook`
3. **Events:** Select:
   - subscription.created
   - subscription.updated
   - subscription.canceled
   - checkout.created
4. Click **"Create"**
5. Copy the **Webhook Secret** that appears

---

## Step 5: Update Your .env.local

Open your `.env.local` file and update these values:

```env
# Polar Sandbox Credentials
POLAR_API_KEY=polar_oat_PASTE_YOUR_API_KEY_HERE
POLAR_ACCESS_TOKEN=polar_oat_PASTE_YOUR_API_KEY_HERE
POLAR_ORGANIZATION_ID=PASTE_YOUR_ORG_ID_HERE
POLAR_WEBHOOK_SECRET=polar_whs_PASTE_YOUR_WEBHOOK_SECRET_HERE
```

**Example:**
```env
POLAR_API_KEY=polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn
POLAR_ACCESS_TOKEN=polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn
POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d
POLAR_WEBHOOK_SECRET=polar_whs_PC8ViaeyUNK7tJMWr8IImhf1Uhjcnqn1lxZnm1BrbGg
```

---

## Step 6: Restart Your Server

**Important:** Close the terminal completely and open a new one:

```bash
# Close current terminal
# Open NEW terminal
cd C:\Users\lenovo\navygoal\navygoal
npm run dev
```

---

## Step 7: Test

Go to: `http://localhost:3000/pricing`

Check your terminal. You should see:
```
Fetching Polar products from API...
Polar API response status: 200
✅ Polar products fetched: 2
Products: Navy goal, Delta Goal
```

---

## Visual Guide - Where to Click

### Dashboard Home:
```
┌─────────────────────────────────────┐
│  Polar Dashboard                    │
├─────────────────────────────────────┤
│  📊 Dashboard                       │
│  📦 Products                        │
│  💳 Subscriptions                   │
│  🔗 Checkout Links                  │
│  ⚙️  Settings  ← CLICK HERE        │
└─────────────────────────────────────┘
```

### Settings Menu:
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│  🏢 Organization  ← GET ORG ID      │
│  🔑 API Keys      ← CREATE KEY      │
│  🪝 Webhooks      ← GET SECRET      │
│  👥 Team                            │
│  💰 Billing                         │
└─────────────────────────────────────┘
```

---

## Checklist

- [ ] Logged into https://sandbox.polar.sh/dashboard
- [ ] Found Organization ID in Settings → Organization
- [ ] Created API Key in Settings → API Keys (server-side)
- [ ] Got Webhook Secret from Settings → Webhooks
- [ ] Updated all 3 values in .env.local
- [ ] Closed terminal completely
- [ ] Opened new terminal and ran `npm run dev`
- [ ] Tested /pricing page
- [ ] Saw "✅ Polar products fetched" in terminal

---

## Common Issues

### Can't Find Organization ID?

Try:
- Settings → Organization
- Settings → General
- Look at the URL: `sandbox.polar.sh/dashboard/YOUR-ORG-NAME`
- Contact Polar support

### Can't Find API Keys?

Try:
- Settings → API Keys
- Settings → Developer
- Settings → Integrations
- If not visible, your account might not have permission

### API Key Still Returns 401?

Make sure:
- ✅ Both API key and Org ID are from **sandbox.polar.sh**
- ✅ API key is **server-side** (starts with `polar_oat_`)
- ✅ You copied the full key (no spaces or line breaks)
- ✅ You restarted the terminal completely

---

## Need Help?

If you still can't find the credentials:

1. Take a screenshot of your Polar dashboard
2. Show me what you see in Settings
3. I can guide you to the exact location

Or contact Polar support: support@polar.sh
