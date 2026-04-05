# Quick Checkout Setup Guide

## Current Status
✅ Products loading from Polar API (1 recurring product: navygoal)
❌ Checkout failing - need to create checkout links

## Your Main Product
- **Product**: navygoal
- **Price**: $4.90/month
- **Price ID**: `1ab0d75a-a693-4afb-b7c2-74b1183d5dea`

## Steps to Fix Checkout

### 1. Create Checkout Link in Polar Dashboard

1. Go to: https://sandbox.polar.sh/dashboard
2. Click on **Products** in the sidebar
3. Find and click on **navygoal**
4. Click on the **Checkout Links** tab
5. Click **Create Checkout Link** button
6. Fill in the form:
   - **Name**: "Monthly Subscription"
   - **Price**: Select the $4.90/month price
   - **Success URL**: `http://localhost:3000/success?session_id={CHECKOUT_ID}`
     - Or use ngrok: `https://epistylar-tonya-nontemporally.ngrok-free.dev/success?session_id={CHECKOUT_ID}`
7. Click **Create**
8. **Copy the checkout link URL** (looks like: `https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_xxx/redirect`)

### 2. Add Checkout Link to Config

Open `src/config/pricing.ts` and update the `polarCheckoutLinks` section:

```typescript
polarCheckoutLinks: {
  "1ab0d75a-a693-4afb-b7c2-74b1183d5dea": "PASTE_YOUR_CHECKOUT_LINK_HERE",
} as Record<string, string>,
```

Replace `PASTE_YOUR_CHECKOUT_LINK_HERE` with the actual checkout link you copied.

### 3. Test the Checkout

1. Save the file
2. Go to http://localhost:3000/pricing
3. Click **Subscribe Now** on the navygoal plan
4. You should be redirected to Polar's checkout page
5. Complete the test payment
6. You'll be redirected back to your success page

## Example Config

After adding your checkout link, it should look like:

```typescript
polarCheckoutLinks: {
  "1ab0d75a-a693-4afb-b7c2-74b1183d5dea": "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_FSfuIA5D2WLNEGERbUeCkOfaPmzfPVT66vt402Ojk5w/redirect",
} as Record<string, string>,
```

## If You Want to Add Yearly Pricing

1. In Polar dashboard, go to your navygoal product
2. Click **Add Price**
3. Set:
   - Amount: $49.00 (or whatever you want)
   - Interval: Year
4. Save the price
5. Create a checkout link for the yearly price
6. Add it to the config with the new price ID

## Troubleshooting

If checkout still doesn't work:
- Make sure you copied the full checkout link URL
- Check that the price ID matches exactly
- Verify the checkout link is active in Polar dashboard
- Check browser console for errors

## Why This Approach?

Polar Sandbox doesn't support the `/v1/checkouts/custom` API endpoint. This is a sandbox limitation. When you move to production, you can use the dynamic checkout API instead of pre-created links.
