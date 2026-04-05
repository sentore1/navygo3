# Fix Pricing Page Loading Issue

## Common Causes

The pricing page is stuck loading because:

1. **Polar API call is failing or timing out**
2. **Wrong API key or Organization ID**
3. **Polar API is slow to respond**
4. **Database query is hanging**

## Quick Fixes

### Fix 1: Check Your Terminal

Look at your terminal where `npm run dev` is running. You should see logs like:
```
Fetching Polar products...
Polar API response status: 200
Polar products fetched: 2
```

If you see errors, that's the issue!

### Fix 2: Verify Environment Variables

Check your `.env.local`:

```env
POLAR_API_KEY=polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn
POLAR_ORGANIZATION_ID=2d4bea8d-3408-4672-a1b5-b906db0ee08d
```

Make sure:
- ✅ API key starts with `polar_oat_`
- ✅ Organization ID is a UUID format
- ✅ No extra spaces or quotes

### Fix 3: Test Polar API Manually

Open a new terminal and test:

```bash
curl -H "Authorization: Bearer polar_oat_Fy7vAHCbqLbr1iBRe4eh481jjwq4QL0sa4Wxj1sHFZn" "https://api.polar.sh/v1/products?organization_id=2d4bea8d-3408-4672-a1b5-b906db0ee08d&is_archived=false"
```

If this returns products, the API is working.

### Fix 4: Use Fallback Products

If Polar API is not working, temporarily use static products.

Update `src/app/pricing/page.tsx`:

```typescript
// Add this at the top after imports
const FALLBACK_PRODUCTS = [
    {
        id: 'basic',
        name: 'Navy Goal',
        description: 'Perfect for getting started',
        prices: [
            { id: 'price_monthly', price_amount: 497, price_currency: 'USD', recurring_interval: 'month' },
            { id: 'price_yearly', price_amount: 4970, price_currency: 'USD', recurring_interval: 'year' },
        ]
    },
    {
        id: 'pro',
        name: 'Delta Goal',
        description: 'For power users',
        prices: [
            { id: 'price_monthly', price_amount: 800, price_currency: 'USD', recurring_interval: 'month' },
            { id: 'price_yearly', price_amount: 8000, price_currency: 'USD', recurring_interval: 'year' },
        ]
    }
];

// Then in the try-catch, use fallback if API fails:
if (polarProducts.length === 0) {
    polarProducts = FALLBACK_PRODUCTS;
}
```

### Fix 5: Restart Everything

```bash
# Stop your dev server (Ctrl+C)
# Restart
npm run dev
```

Then try accessing `/pricing` again.

## Check Browser Console

Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab to see if requests are pending

## Temporary Workaround

If Polar API is not working, you can temporarily bypass it:

1. Go to `src/app/pricing/page.tsx`
2. Comment out the Polar API call
3. Use static products instead

```typescript
// Temporary: Use static products
const polarProducts = [
    {
        id: 'navy-goal',
        name: 'Navy Goal',
        description: 'Perfect for getting started',
        prices: [
            { 
                id: 'price_monthly', 
                price_amount: 497, 
                price_currency: 'USD', 
                recurring_interval: 'month' 
            },
        ]
    },
    {
        id: 'delta-goal',
        name: 'Delta Goal',
        description: 'For power users',
        prices: [
            { 
                id: 'price_monthly', 
                price_amount: 800, 
                price_currency: 'USD', 
                recurring_interval: 'month' 
            },
        ]
    }
];
```

## Debug Steps

1. **Check terminal logs** - Look for error messages
2. **Check browser console** - Look for JavaScript errors
3. **Test Polar API** - Use curl command above
4. **Verify env variables** - Make sure they're correct
5. **Restart server** - Stop and start `npm run dev`

## Most Likely Issues

### Issue 1: Wrong API Key

**Symptom:** 401 Unauthorized error in terminal

**Fix:** 
1. Go to https://sandbox.polar.sh/dashboard
2. Get a new API key
3. Update `.env.local`
4. Restart server

### Issue 2: Wrong Organization ID

**Symptom:** 404 Not Found or empty products

**Fix:**
1. Go to https://sandbox.polar.sh/dashboard
2. Check your organization ID in settings
3. Update `.env.local`
4. Restart server

### Issue 3: No Products in Polar

**Symptom:** Page loads but shows "Loading pricing plans..."

**Fix:**
1. Go to https://sandbox.polar.sh/dashboard
2. Create products (Navy Goal, Delta Goal)
3. Make sure they're not archived
4. Refresh pricing page

### Issue 4: Slow API Response

**Symptom:** Page takes 30+ seconds to load

**Fix:** Use fallback products (see Fix 4 above)

## Quick Test

After making changes:

1. Stop server (Ctrl+C)
2. Start server: `npm run dev`
3. Go to: `http://localhost:3000/pricing`
4. Check terminal for logs
5. Check browser console for errors

## What to Look For in Terminal

**Good:**
```
Fetching Polar products...
Polar API response status: 200
Polar products fetched: 2
```

**Bad:**
```
Polar API error: 401 Unauthorized
```

or

```
Error fetching Polar products: TypeError: fetch failed
```

## Need More Help?

Show me:
1. What you see in the terminal
2. What you see in browser console (F12)
3. Any error messages

And I can help you fix it!
