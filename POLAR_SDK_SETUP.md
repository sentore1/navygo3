# Using Polar SDK (Simpler Approach)

## What Changed

I've updated your code to use the **Polar SDK** instead of manual API calls. This is simpler and more reliable!

## Environment Variables

You can use either name (both work):

```env
# Option 1: Use POLAR_ACCESS_TOKEN (Polar's recommended name)
POLAR_ACCESS_TOKEN=polar_oat_YOUR_KEY_HERE

# Option 2: Keep using POLAR_API_KEY (also works)
POLAR_API_KEY=polar_oat_YOUR_KEY_HERE

# Organization ID (still needed for fetching products)
POLAR_ORGANIZATION_ID=YOUR_ORG_ID_HERE
```

## Your .env.local Should Look Like:

```env
# Polar Configuration (use Sandbox for testing)
POLAR_ACCESS_TOKEN=polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn
POLAR_API_KEY=polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn
POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d
POLAR_WEBHOOK_SECRET=polar_whs_PC8ViaeyUNK7tJMWr8IImhf1Uhjcnqn1lxZnm1BrbGg
```

## What the SDK Does

The Polar SDK handles:
- ✅ Authentication
- ✅ API calls
- ✅ Error handling
- ✅ Type safety

Much simpler than manual fetch calls!

## How It Works Now

### Before (Manual API):
```typescript
const response = await fetch("https://api.polar.sh/v1/checkouts/custom", {
  method: "POST",
  headers: { "Authorization": `Bearer ${apiKey}` },
  body: JSON.stringify({...})
});
```

### After (Using SDK):
```typescript
const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN });
const checkout = await polar.checkouts.custom.create({
  productPriceId: productId,
  customerEmail: userEmail,
  successUrl: "...",
});
```

## Benefits

✅ Cleaner code
✅ Better error handling
✅ Type safety
✅ Automatic retries
✅ Less code to maintain

## Testing

1. Make sure your `.env.local` has the access token
2. Restart your server: `npm run dev`
3. Go to `/pricing`
4. Click "Subscribe Now"
5. Should redirect to Polar checkout!

## If Still Getting 401

The issue is likely:

1. **Wrong environment** - Make sure you're using Sandbox
   - Get key from: https://sandbox.polar.sh/dashboard
   - Not from: https://polar.sh

2. **Key doesn't match Org ID**
   - Both must be from the same environment (sandbox or production)

3. **Wrong key type**
   - Need server-side key (starts with `polar_oat_`)
   - Not client-side key (starts with `polar_pk_`)

## Get Fresh Credentials

### Step 1: Go to Sandbox
```
https://sandbox.polar.sh/dashboard
```

### Step 2: Get Organization ID
- Settings → Organization
- Copy the UUID

### Step 3: Create API Key
- Settings → API Keys
- Create new server-side key
- Copy it (starts with `polar_oat_`)

### Step 4: Update .env.local
```env
POLAR_ACCESS_TOKEN=polar_oat_NEW_KEY_FROM_SANDBOX
POLAR_ORGANIZATION_ID=ORG_ID_FROM_SANDBOX
```

### Step 5: Restart
```bash
npm run dev
```

## Success Criteria

When it works, you'll see:
- Pricing page loads products from Polar
- Click "Subscribe Now" redirects to Polar checkout
- Complete payment redirects back to success page
- Webhook updates subscription in database

You're using the right approach now with the SDK! Just need to get fresh credentials from Sandbox.
