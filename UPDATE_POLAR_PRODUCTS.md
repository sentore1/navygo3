# Update Your Polar Products

## Current Products (from screenshot)

You currently have these products in Polar:

1. **Navy goal** - $4.97/month
2. **Delta Goal** - $8/month

## How to Update Pricing

### Option 1: Update in Polar Dashboard (Recommended)

1. Go to https://polar.sh/dashboard
2. Navigate to **Products**
3. Click on each product to edit

**For "Navy goal":**
- Keep monthly price: $4.97
- Add yearly price: $49.70 (saves 17%)
- Update description if needed
- Make sure it's set as "Recurring"

**For "Delta Goal":**
- Keep monthly price: $8.00
- Add yearly price: $80.00 (saves 17%)
- Update description if needed
- Make sure it's set as "Recurring"

### Option 2: Update the Config File

If you want to change the features displayed for each plan, edit:
`src/config/pricing.ts`

```typescript
productFeatures: {
  "Navy goal": [
    "Goal Tracking",
    "AI Goal Writing",
    "Progress Visualization",
    // Add or remove features here
  ],
  "Delta Goal": [
    "Unlimited goals",
    "Advanced goal tracking",
    // Add or remove features here
  ],
}
```

## Current Feature Mapping

Based on your screenshot, here's what's shown:

### Navy goal ($4.97/month)
- Goal Tracking
- AI Goal Writing
- Progress Visualization
- Reminders & Notifications
- Map of challenges
- Data Sync
- Priority Support

### Delta Goal ($8/month)
- Unlimited goals
- Advanced goal tracking
- Progress visualization
- Daily consistency tracking
- AI goal suggestions
- Priority support

## To Change Prices

### In Polar Dashboard:

1. **Login** to https://polar.sh/dashboard
2. **Go to Products** section
3. **Click on product** you want to edit
4. **Update prices:**
   - Monthly price
   - Yearly price (optional but recommended)
5. **Save changes**

### Recommended Pricing Structure:

**Navy goal (Popular Plan):**
- Monthly: $4.97
- Yearly: $49.70 (~$4.14/month, save 17%)

**Delta Goal (Premium Plan):**
- Monthly: $8.00
- Yearly: $80.00 (~$6.67/month, save 17%)

## To Add Yearly Billing

If your products don't have yearly prices yet:

1. Go to product in Polar dashboard
2. Click "Add Price"
3. Set:
   - Amount: (monthly × 10) for 17% savings
   - Interval: "year"
   - Currency: USD
4. Save

## To Update Features

Edit `src/config/pricing.ts`:

```typescript
productFeatures: {
  "Navy goal": [
    "Your feature 1",
    "Your feature 2",
    // etc.
  ],
  "Delta Goal": [
    "Your feature 1",
    "Your feature 2",
    // etc.
  ],
}
```

Then restart your dev server:
```bash
npm run dev
```

## Troubleshooting

### Products not showing correct prices?
- Check Polar dashboard for actual prices
- Verify product names match exactly (case-sensitive)
- Clear browser cache and refresh

### Features not displaying?
- Check product name in `src/config/pricing.ts`
- Product names must match exactly (including case)
- Restart dev server after changes

### Want to add more products?
1. Create product in Polar dashboard
2. Add feature mapping in `src/config/pricing.ts`
3. Refresh pricing page

## Quick Test

After making changes:

1. Go to `/pricing`
2. Toggle between Monthly/Yearly
3. Verify prices are correct
4. Check features are displayed
5. Test "Subscribe Now" button

## Need Different Pricing?

If you want completely different prices, you have two options:

1. **Update in Polar** (recommended)
   - Changes reflect immediately
   - Handles billing automatically

2. **Use static pricing** (not recommended)
   - Edit `src/config/pricing.ts`
   - Set `usePolarProducts: false`
   - Define prices in `staticPlans`
   - You'll need to handle billing manually
