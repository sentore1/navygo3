# How to Add Yearly Packages in Polar

## Steps to Add Yearly Recurring Prices

### 1. Go to Your Polar Dashboard
- Sandbox: https://sandbox.polar.sh/dashboard
- Production: https://polar.sh/dashboard

### 2. Navigate to Products
- Click on "Products" in the sidebar
- You'll see your existing products (Navy Goal, Delta Goal, etc.)

### 3. Add Yearly Price to Each Product
For each product:

1. Click on the product name
2. Scroll to the "Prices" section
3. Click "Add Price" or "New Price"
4. Fill in the details:
   - **Amount**: Enter the yearly price (e.g., 4970 for $49.70)
   - **Currency**: USD
   - **Type**: Recurring
   - **Billing Interval**: Year
   - **Billing Period**: 1
5. Click "Create Price"

### 4. Example Pricing Structure

#### Navy Goal
- Monthly: $4.97/month (already exists)
- Yearly: $49.70/year (17% savings = ~$4.14/month)

#### Delta Goal
- Monthly: $8.00/month (already exists)
- Yearly: $80.00/year (17% savings = ~$6.67/month)

### 5. Verify in Your App

After adding yearly prices in Polar:

1. Restart your development server
2. Go to `/pricing` page
3. Check browser console for debug logs showing:
   - Product names
   - Available prices (monthly and yearly)
4. Toggle between "Monthly" and "Yearly" tabs
5. Verify prices update correctly

### 6. What the System Does Automatically

The pricing page will:
- Fetch all products from Polar API
- Filter products that have recurring prices (month or year)
- Show the appropriate price based on the selected billing cycle
- Hide products that don't have the selected billing interval

### 7. Troubleshooting

If yearly prices don't show up:

1. Check browser console for debug logs
2. Verify the price has `recurring_interval: "year"` in Polar
3. Make sure the product is not archived
4. Clear cache and refresh the page

### 8. Adding Features for New Products

If you add new products, update `src/config/pricing.ts`:

```typescript
productFeatures: {
  "your-product-name": [
    "Feature 1",
    "Feature 2",
    "Feature 3",
  ],
  // Add lowercase version too for safety
  "your product name": [
    "Feature 1",
    "Feature 2",
    "Feature 3",
  ],
}
```

## Current System Behavior

- ✅ Automatically fetches products from Polar
- ✅ Shows monthly and yearly prices
- ✅ Filters products by selected billing cycle
- ✅ Displays "Save 17%" badge on yearly option
- ✅ Handles products without features (shows defaults)
- ✅ Debug logs in console to help troubleshoot
- ✅ Centered layout with proper alignment

## Next Steps

1. Add yearly prices in Polar dashboard
2. Test the pricing page
3. Check console logs to verify prices are loaded
4. Update product features in config if needed
