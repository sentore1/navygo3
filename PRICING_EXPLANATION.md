# Where Do the Prices Come From?

## Answer: Your Polar Dashboard

The prices you see on `/pricing` ($4.97 and $8) come directly from your **Polar account**.

## How It Works

1. **You create products in Polar** (you already did this)
   - Navy goal: $4.97/month
   - Delta Goal: $8/month

2. **The pricing page fetches them** via API
   - File: `src/app/pricing/page.tsx`
   - Uses: `POLAR_API_KEY` and `POLAR_ORGANIZATION_ID`

3. **Displays them on your site**
   - Shows the exact prices from Polar
   - Shows features from `src/config/pricing.ts`

## Your Current Products

From the screenshot you showed:

### Navy goal - $4.97/month
Features shown:
- Goal Tracking
- AI Goal Writing  
- Progress Visualization
- Reminders & Notifications
- Map of challenges
- Data Sync
- Priority Support

### Delta Goal - $8/month
Features shown:
- Unlimited goals
- Advanced goal tracking
- Progress visualization
- Daily consistency tracking
- AI goal suggestions
- Priority support

## How to Change Prices

### To change the PRICES:
1. Go to https://polar.sh/dashboard
2. Click on Products
3. Edit your products
4. Change the prices
5. Save
6. Refresh your pricing page - new prices appear automatically!

### To change the FEATURES:
1. Edit `src/config/pricing.ts`
2. Update the `productFeatures` section
3. Restart your dev server
4. Refresh your pricing page

## Example: Adding Yearly Pricing

Right now you only have monthly prices. To add yearly:

1. Go to Polar dashboard
2. Click on "Navy goal"
3. Click "Add Price"
4. Set:
   - Amount: $49.70 (17% savings)
   - Interval: year
   - Currency: USD
5. Save
6. Do the same for "Delta Goal": $80/year

Now your pricing page will show both monthly and yearly options!

## Why This Approach?

✅ **Pros:**
- Prices update automatically from Polar
- Polar handles all billing
- Recurring subscriptions work automatically
- Easy to change prices without code changes

❌ **Cons:**
- Need to manage products in two places (Polar + config file for features)

## Quick Fix Checklist

If prices don't match what you want:

- [ ] Check Polar dashboard for actual product prices
- [ ] Verify product names match in `src/config/pricing.ts`
- [ ] Add yearly prices in Polar if you want yearly billing
- [ ] Update features in `src/config/pricing.ts` if needed
- [ ] Restart dev server after config changes

## Files to Know

- **Polar Dashboard**: Where you set prices
- **`src/config/pricing.ts`**: Where you set features
- **`src/app/pricing/page.tsx`**: Fetches products from Polar
- **`src/components/pricing-client.tsx`**: Displays the products

## Summary

The prices ($4.97 and $8) are coming from your Polar account. You created these products in Polar, and the pricing page is correctly fetching and displaying them. If you want different prices, update them in your Polar dashboard!
