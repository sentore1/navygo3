# Polar Checkout Flow

## Current Implementation

```
User clicks "Subscribe Now"
         ↓
pricing-client.tsx sends POST to /api/polar-checkout
         ↓
polar-checkout/route.ts checks for checkout link in config
         ↓
    ┌────────────────────────────────────┐
    │ Has checkout link in config?       │
    └────────────────────────────────────┘
         ↓                    ↓
        YES                  NO
         ↓                    ↓
    Return link         Try API (fails in sandbox)
         ↓
User redirected to Polar checkout page
         ↓
User completes payment
         ↓
Polar redirects to success URL
         ↓
Webhook notifies your app (if configured)
```

## What You Need to Do

### Step 1: Get Checkout Link from Polar
```
Polar Dashboard → Products → navygoal → Checkout Links → Create
```

### Step 2: Add to Config
```typescript
// src/config/pricing.ts
polarCheckoutLinks: {
  "1ab0d75a-a693-4afb-b7c2-74b1183d5dea": "YOUR_LINK_HERE"
}
```

### Step 3: Test
```
localhost:3000/pricing → Click Subscribe → Redirected to Polar
```

## Your Product Details

```
Product Name: navygoal
Product ID:   777b2579-2c82-4720-9156-76c3c9ce2af1
Price:        $4.90/month
Price ID:     1ab0d75a-a693-4afb-b7c2-74b1183d5dea
```

## Success URL Options

Choose one:

1. **Localhost** (for local testing without webhooks):
   ```
   http://localhost:3000/success?session_id={CHECKOUT_ID}
   ```

2. **Ngrok** (for testing with webhooks):
   ```
   https://epistylar-tonya-nontemporally.ngrok-free.dev/success?session_id={CHECKOUT_ID}
   ```

## After Checkout Works

Once basic checkout is working, you can:
1. Set up webhooks to handle subscription events
2. Add yearly pricing option
3. Create more subscription tiers
4. Move to production Polar API (supports dynamic checkout)
