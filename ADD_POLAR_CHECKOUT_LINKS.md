# Using Polar Checkout Links (Simpler!)

## ✅ What I Did

I've updated your app to use **direct Polar checkout links** instead of the API. This is much simpler and doesn't require API credentials!

## How It Works Now

1. You create checkout links in Polar dashboard
2. Add them to `src/config/polar-checkout-links.ts`
3. Users click "Subscribe Now" → Direct to Polar checkout
4. No API calls needed!

## Your Current Setup

I've added your Navy goal monthly link:
```
https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_FSfuIA5D2WLNEGERbUeCkOfaPmzfPVT66vt402Ojk5w/redirect
```

## Add More Checkout Links

### Step 1: Create Checkout Links in Polar

1. Go to: https://sandbox.polar.sh/dashboard
2. Click **Checkout Links** (or **Products** → **Checkout Links**)
3. Click **"Create Checkout Link"**
4. Select product and price
5. Copy the link

### Step 2: Add to Config File

Open `src/config/polar-checkout-links.ts` and add your links:

```typescript
export const polarCheckoutLinks = {
  'navy-goal-monthly': 'https://sandbox-api.polar.sh/v1/checkout-links/YOUR_LINK_1/redirect',
  'navy-goal-yearly': 'https://sandbox-api.polar.sh/v1/checkout-links/YOUR_LINK_2/redirect',
  'delta-goal-monthly': 'https://sandbox-api.polar.sh/v1/checkout-links/YOUR_LINK_3/redirect',
  'delta-goal-yearly': 'https://sandbox-api.polar.sh/v1/checkout-links/YOUR_LINK_4/redirect',
};
```

### Step 3: Update Products

In the same file, uncomment the prices and add checkout links:

```typescript
export const products = [
  {
    id: 'navy-goal',
    name: 'Navy goal',
    description: 'Perfect for getting started',
    prices: [
      {
        id: 'navy-goal-monthly',
        price_amount: 497,
        price_currency: 'USD',
        recurring_interval: 'month',
        checkoutLink: polarCheckoutLinks['navy-goal-monthly'],
      },
      {
        id: 'navy-goal-yearly',
        price_amount: 4970,
        price_currency: 'USD',
        recurring_interval: 'year',
        checkoutLink: polarCheckoutLinks['navy-goal-yearly'],
      },
    ],
  },
  {
    id: 'delta-goal',
    name: 'Delta Goal',
    description: 'For power users',
    prices: [
      {
        id: 'delta-goal-monthly',
        price_amount: 800,
        price_currency: 'USD',
        recurring_interval: 'month',
        checkoutLink: polarCheckoutLinks['delta-goal-monthly'],
      },
      {
        id: 'delta-goal-yearly',
        price_amount: 8000,
        price_currency: 'USD',
        recurring_interval: 'year',
        checkoutLink: polarCheckoutLinks['delta-goal-yearly'],
      },
    ],
  },
];
```

### Step 4: Restart Server

```bash
npm run dev
```

## Benefits of This Approach

✅ No API credentials needed
✅ No 401 errors
✅ Simpler code
✅ Direct to checkout
✅ Works immediately

## How to Get Checkout Links

### In Polar Sandbox Dashboard:

1. **Products** → Select a product
2. Click **"Create Checkout Link"**
3. Configure:
   - Product: Navy goal
   - Price: Monthly ($4.97)
   - Success URL: `http://localhost:3000/success`
4. Click **"Create"**
5. Copy the link

Repeat for each plan/price combination:
- Navy goal Monthly
- Navy goal Yearly
- Delta Goal Monthly
- Delta Goal Yearly

## Testing

1. Go to: `http://localhost:3000/pricing`
2. Click "Subscribe Now" on Navy goal
3. Should redirect directly to Polar checkout
4. Complete payment
5. Redirects back to success page
6. Webhook updates subscription

## Webhook Still Works!

The webhook will still receive events and update your database automatically. You just don't need the API for creating checkouts anymore.

## Success URL Configuration

When creating checkout links in Polar, set:

**Success URL:**
```
http://localhost:3000/success
```

**For production:**
```
https://navygoal.com/success
```

## Quick Reference

| Plan | Price | Checkout Link Variable |
|------|-------|----------------------|
| Navy goal | $4.97/month | `navy-goal-monthly` |
| Navy goal | $49.70/year | `navy-goal-yearly` |
| Delta Goal | $8/month | `delta-goal-monthly` |
| Delta Goal | $80/year | `delta-goal-yearly` |

## Next Steps

1. Create checkout links for all your plans in Polar
2. Add them to `src/config/polar-checkout-links.ts`
3. Test each one
4. Deploy to production

No more API credential issues! 🎉
