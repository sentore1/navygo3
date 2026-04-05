# Setup Polar Checkout Links (Sandbox)

Since Polar Sandbox doesn't support the `/v1/checkouts/custom` API endpoint, you need to create checkout links manually in the Polar dashboard.

## Step 1: Get Your Product Price IDs

Your products are already loading successfully. To see the price IDs, check your browser console on the pricing page or run this command:

```bash
curl -H "Authorization: Bearer polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA" \
  "https://sandbox-api.polar.sh/v1/products?organization_id=2d4bea8d-3408-4672-a1b5-b906db0ee08d&is_archived=false"
```

This will show you all products with their price IDs.

## Step 2: Create Checkout Links in Polar Dashboard

1. Go to Polar Sandbox Dashboard: https://sandbox.polar.sh/dashboard
2. Navigate to **Products**
3. Click on your product (e.g., "navygoal")
4. Go to **Checkout Links** tab
5. Click **Create Checkout Link**
6. Configure the checkout link:
   - **Name**: "Monthly Checkout" or "Yearly Checkout"
   - **Success URL**: `http://localhost:3000/success?session_id={CHECKOUT_ID}`
   - Or use your ngrok URL: `https://epistylar-tonya-nontemporally.ngrok-free.dev/success?session_id={CHECKOUT_ID}`
   - **Price**: Select the monthly or yearly price
7. Click **Create**
8. Copy the checkout link URL (it will look like: `https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_xxx/redirect`)

## Step 3: Add Checkout Links to Config

Open `src/config/pricing.ts` and add your checkout links:

```typescript
polarCheckoutLinks: {
  // Monthly price ID
  "price_01JEXAMPLE123": "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_xxx/redirect",
  
  // Yearly price ID
  "price_01JEXAMPLE456": "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_yyy/redirect",
}
```

## Step 4: Test the Checkout Flow

1. Go to http://localhost:3000/pricing
2. Click "Subscribe Now" on any plan
3. You should be redirected to the Polar checkout page
4. Complete the test payment
5. You'll be redirected back to your success page

## Quick Script to Get Price IDs

Create a file `get-polar-prices.js`:

```javascript
const fetch = require('node-fetch');

const apiKey = 'polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA';
const orgId = '2d4bea8d-3408-4672-a1b5-b906db0ee08d';

fetch(`https://sandbox-api.polar.sh/v1/products?organization_id=${orgId}&is_archived=false`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('\n=== POLAR PRODUCTS & PRICES ===\n');
  data.items.forEach(product => {
    console.log(`Product: ${product.name}`);
    console.log(`ID: ${product.id}`);
    console.log('Prices:');
    product.prices.forEach(price => {
      console.log(`  - ${price.recurring_interval}: ${price.id} ($${price.price_amount/100})`);
    });
    console.log('');
  });
})
.catch(err => console.error('Error:', err));
```

Run it:
```bash
node get-polar-prices.js
```

## Example Output

You should see something like:

```
Product: navygoal
ID: prod_01JEXAMPLE
Prices:
  - month: price_01JEXAMPLE123 ($4.90)
  - year: price_01JEXAMPLE456 ($49.00)
```

Use these price IDs when creating checkout links and adding them to the config.

## Notes

- Polar Sandbox has limited API functionality compared to production
- The `/v1/checkouts/custom` endpoint only works in production
- For sandbox testing, you must use pre-created checkout links
- When you move to production, the dynamic checkout API will work
