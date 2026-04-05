# Test Polar Payment Flow for Subscribers

## Current Configuration

✅ Polar API Key: `polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA`
✅ Organization ID: `2d4bea8d-3408-4672-a1b5-b906db0ee08d`
✅ Webhook Secret: `polar_whs_PC8ViaeyUNK7tJMWr8IImhf1Uhjcnqn1lxZnm1BrbGg`
✅ API URL: `https://sandbox-api.polar.sh`

## Test Plan

### Test 1: Verify Polar API Connection

Run this command to check if products are loading:

```bash
curl -X GET "https://sandbox-api.polar.sh/v1/products?organization_id=2d4bea8d-3408-4672-a1b5-b906db0ee08d&is_archived=false" \
  -H "Authorization: Bearer polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA" \
  -H "Content-Type: application/json"
```

Expected: List of products with prices

### Test 2: Check Pricing Page

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/pricing`
3. Check browser console for logs
4. Verify products are displayed

Expected: Products load from Polar API

### Test 3: Test Checkout Creation

1. Sign in to your app
2. Go to pricing page
3. Click "Subscribe Now" on any plan
4. Check browser console and network tab

Expected: Either redirects to Polar checkout OR shows error message

### Test 4: Verify Database Tables

Check if required tables exist:

```sql
-- Check users table
SELECT id, email, subscription_status, subscription_expires_at 
FROM users 
LIMIT 5;

-- Check polar_subscriptions table
SELECT * FROM polar_subscriptions LIMIT 5;

-- Check webhook_events table
SELECT * FROM webhook_events 
WHERE type = 'polar' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Test 5: Test Webhook Endpoint

Send a test webhook event:

```bash
curl -X POST "http://localhost:3000/api/polar-webhook" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: test" \
  -d '{
    "type": "subscription.created",
    "data": {
      "id": "test_sub_123",
      "status": "active",
      "product_id": "test_product",
      "price_id": "test_price",
      "current_period_start": "2026-04-03T00:00:00Z",
      "current_period_end": "2026-05-03T00:00:00Z",
      "metadata": {
        "user_id": "YOUR_USER_ID_HERE"
      }
    }
  }'
```

Expected: Event logged in webhook_events table

## Common Issues & Solutions

### Issue 1: Products Not Loading

**Symptoms:** Pricing page shows "Loading pricing plans..."

**Check:**
```bash
# Test API directly
curl -X GET "https://sandbox-api.polar.sh/v1/products?organization_id=2d4bea8d-3408-4672-a1b5-b906db0ee08d" \
  -H "Authorization: Bearer polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA"
```

**Solutions:**
- Verify API key is correct
- Check organization ID matches
- Ensure products exist in Polar dashboard

### Issue 2: Checkout Creation Fails

**Symptoms:** Error when clicking "Subscribe Now"

**Check:**
- Browser console for error messages
- Network tab for API response
- Server logs for detailed errors

**Solutions:**
- Verify user is signed in
- Check if price IDs are correct
- Ensure API key has checkout permissions

### Issue 3: Webhook Not Receiving Events

**Symptoms:** Subscription status not updating after payment

**Check:**
```sql
SELECT * FROM webhook_events 
WHERE type = 'polar' 
ORDER BY created_at DESC;
```

**Solutions:**
- Verify webhook URL is configured in Polar dashboard
- Check webhook secret matches
- Test webhook endpoint manually
- For local testing, use ngrok

### Issue 4: Subscription Status Not Updating

**Symptoms:** User paid but still shows as inactive

**Check:**
```sql
SELECT u.id, u.email, u.subscription_status, ps.status, ps.subscription_id
FROM users u
LEFT JOIN polar_subscriptions ps ON u.id = ps.user_id
WHERE u.email = 'YOUR_EMAIL_HERE';
```

**Solutions:**
- Check if webhook was received
- Verify user_id in webhook metadata
- Manually activate subscription using SQL

## Manual Testing Steps

### Step 1: Create Test User

1. Go to: `http://localhost:3000/sign-up`
2. Create account with test email
3. Verify email (check Supabase auth)

### Step 2: Test Checkout Flow

1. Sign in with test user
2. Go to: `http://localhost:3000/pricing`
3. Click "Subscribe Now"
4. Complete checkout in Polar
5. Return to success page

### Step 3: Verify Subscription

```sql
-- Check user subscription status
SELECT * FROM users WHERE email = 'test@example.com';

-- Check Polar subscription record
SELECT * FROM polar_subscriptions WHERE user_id = 'USER_ID';

-- Check webhook events
SELECT * FROM webhook_events WHERE type = 'polar' ORDER BY created_at DESC;
```

### Step 4: Test Subscription Access

1. Go to protected page (e.g., dashboard)
2. Verify user has access
3. Check subscription badge/indicator

## Automated Test Script

Create a test file to verify the flow:

```typescript
// test-polar-flow.ts
async function testPolarFlow() {
  console.log('🧪 Testing Polar Payment Flow...\n');

  // Test 1: API Connection
  console.log('1️⃣ Testing API connection...');
  const productsResponse = await fetch(
    'https://sandbox-api.polar.sh/v1/products?organization_id=2d4bea8d-3408-4672-a1b5-b906db0ee08d',
    {
      headers: {
        'Authorization': 'Bearer polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA',
        'Content-Type': 'application/json'
      }
    }
  );
  console.log('Products API:', productsResponse.ok ? '✅' : '❌');

  // Test 2: Checkout Endpoint
  console.log('\n2️⃣ Testing checkout endpoint...');
  const checkoutResponse = await fetch('http://localhost:3000/api/polar-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'test_price_id',
      interval: 'month'
    })
  });
  console.log('Checkout API:', checkoutResponse.status);

  // Test 3: Webhook Endpoint
  console.log('\n3️⃣ Testing webhook endpoint...');
  const webhookResponse = await fetch('http://localhost:3000/api/polar-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'subscription.created',
      data: { id: 'test_123' }
    })
  });
  console.log('Webhook API:', webhookResponse.ok ? '✅' : '❌');

  console.log('\n✅ Test complete!');
}

testPolarFlow();
```

## Expected Results

### ✅ Working Flow

1. Products load on pricing page
2. Clicking "Subscribe" redirects to Polar checkout
3. After payment, webhook updates database
4. User subscription status becomes "active"
5. User can access premium features

### ❌ Common Failures

1. **401 Unauthorized** - API key issue
2. **404 Not Found** - Wrong organization ID
3. **500 Server Error** - Database or configuration issue
4. **Webhook not received** - URL not configured in Polar

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Test with real payment (use test card)
3. ✅ Test subscription cancellation
4. ✅ Test subscription renewal
5. ✅ Deploy to production
6. ✅ Configure production webhook URL

## Quick Diagnostic Commands

```bash
# Check if server is running
curl http://localhost:3000/api/check-subscription

# Check Polar API
curl -H "Authorization: Bearer polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA" \
  https://sandbox-api.polar.sh/v1/products?organization_id=2d4bea8d-3408-4672-a1b5-b906db0ee08d

# Test webhook locally
curl -X POST http://localhost:3000/api/polar-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"subscription.created","data":{"id":"test"}}'
```

## Support Resources

- Polar Docs: https://docs.polar.sh
- Polar Dashboard: https://sandbox.polar.sh/dashboard
- Webhook Logs: Check Polar dashboard → Webhooks → Delivery logs
- Database: Supabase dashboard → Table Editor

---

**Ready to test?** Start with Test 1 and work through each step!
