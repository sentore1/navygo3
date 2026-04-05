# 🧪 Run Polar Payment Tests

## Quick Start

### 1. Start Your Dev Server

```bash
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

### 2. Run API Tests

```bash
# Test 1: Verify API connection
node test-polar-api.js

# Test 2: Verify checkout creation
node test-checkout.js
```

Expected output:
- ✅ API connection working
- ✅ 9 products found
- ✅ Checkout session created
- 🔗 Checkout URL generated

### 3. Test in Browser

Open: `http://localhost:3000/pricing`

Expected:
- Products load from Polar
- "Subscribe Now" buttons visible
- Clicking button redirects to Polar checkout

---

## Full Test Procedure

### Test A: API Integration ✅ PASSED

```bash
node test-polar-api.js
```

**What it tests:**
- Polar API connection
- Product fetching
- API key validity
- Organization ID correctness

**Expected result:**
```
✅ SUCCESS: API connection working!
📦 Found 9 products:
1. navygoal - $4.90/month
```

---

### Test B: Checkout Creation ✅ PASSED

```bash
node test-checkout.js
```

**What it tests:**
- Checkout session creation
- Price ID validity
- Metadata passing
- URL generation

**Expected result:**
```
✅ SUCCESS: Checkout session created!
🔗 Checkout URL: https://sandbox.polar.sh/checkout/...
```

---

### Test C: Pricing Page

1. Start server: `npm run dev`
2. Open: `http://localhost:3000/pricing`
3. Check browser console for logs

**What to verify:**
- Products display correctly
- Prices show as $4.90/month
- "Subscribe Now" buttons work
- No console errors

**Expected console logs:**
```
Fetching Polar products from API...
✅ Polar products fetched: 1
Products: navygoal
```

---

### Test D: Checkout Flow

1. Sign in to your app
2. Go to pricing page
3. Click "Subscribe Now"
4. Should redirect to Polar checkout

**What to verify:**
- Redirects to `https://sandbox.polar.sh/checkout/...`
- Shows correct product (navygoal - $4.90/month)
- Email pre-filled
- Can complete checkout

---

### Test E: Webhook Processing

#### Option 1: Manual Test (Without Real Payment)

```bash
# Replace YOUR_USER_ID with actual user ID from database
curl -X POST http://localhost:3000/api/polar-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription.created",
    "data": {
      "id": "test_sub_123",
      "status": "active",
      "product_id": "777b2579-2c82-4720-9156-76c3c9ce2af1",
      "price_id": "1ab0d75a-a693-4afb-b7c2-74b1183d5dea",
      "current_period_start": "2026-04-03T00:00:00Z",
      "current_period_end": "2026-05-03T00:00:00Z",
      "metadata": {
        "user_id": "YOUR_USER_ID"
      }
    }
  }'
```

**Then check database:**
```sql
SELECT * FROM webhook_events WHERE type = 'polar' ORDER BY created_at DESC LIMIT 1;
SELECT * FROM users WHERE id = 'YOUR_USER_ID';
SELECT * FROM polar_subscriptions WHERE user_id = 'YOUR_USER_ID';
```

#### Option 2: Real Payment Test

1. Set up ngrok for local webhook:
```bash
ngrok http 3000
```

2. Copy ngrok URL (e.g., `https://abc123.ngrok.io`)

3. Add webhook in Polar dashboard:
   - URL: `https://abc123.ngrok.io/api/polar-webhook`
   - Events: `subscription.created`, `subscription.updated`, `subscription.canceled`

4. Complete a real checkout with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

5. Check webhook received:
```sql
SELECT * FROM webhook_events WHERE type = 'polar' ORDER BY created_at DESC;
```

---

## Test Results Summary

### ✅ Completed Tests

| Test | Status | Result |
|------|--------|--------|
| API Connection | ✅ PASSED | Products fetched successfully |
| Checkout Creation | ✅ PASSED | Checkout URL generated |
| Configuration | ✅ PASSED | All env vars correct |

### 🔄 Pending Tests

| Test | Status | Action Required |
|------|--------|-----------------|
| Pricing Page | 🔄 PENDING | Start dev server and test |
| Checkout Flow | 🔄 PENDING | Test with signed-in user |
| Webhook | 🔄 PENDING | Test with real payment or curl |
| Database Updates | 🔄 PENDING | Verify after webhook |

---

## Verification Queries

### Check User Subscription

```sql
SELECT 
  u.id,
  u.email,
  u.subscription_status,
  u.subscription_expires_at,
  ps.subscription_id,
  ps.status as polar_status,
  ps.product_id
FROM users u
LEFT JOIN polar_subscriptions ps ON u.id = ps.user_id
WHERE u.email = 'YOUR_EMAIL';
```

### Check Recent Webhooks

```sql
SELECT 
  id,
  event_type,
  type,
  data->>'status' as status,
  data->'metadata'->>'user_id' as user_id,
  created_at
FROM webhook_events
WHERE type = 'polar'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Active Subscriptions

```sql
SELECT 
  ps.user_id,
  u.email,
  ps.subscription_id,
  ps.status,
  ps.product_id,
  ps.current_period_end
FROM polar_subscriptions ps
JOIN users u ON ps.user_id = u.id
WHERE ps.status = 'active'
ORDER BY ps.created_at DESC;
```

---

## Common Issues & Solutions

### Issue 1: Server Not Running

**Symptom:** Can't access `http://localhost:3000`

**Solution:**
```bash
# Kill any existing processes
taskkill /F /IM node.exe

# Start fresh
npm run dev
```

### Issue 2: Products Not Loading

**Symptom:** Pricing page shows "Loading pricing plans..."

**Solution:**
```bash
# Test API directly
node test-polar-api.js

# If fails, check .env.local:
# - POLAR_API_KEY
# - POLAR_ORGANIZATION_ID
```

### Issue 3: Checkout Fails

**Symptom:** Error when clicking "Subscribe Now"

**Solution:**
1. Check browser console for error
2. Verify user is signed in
3. Test checkout API:
```bash
node test-checkout.js
```

### Issue 4: Webhook Not Received

**Symptom:** Payment completes but subscription not activated

**Solution:**
1. Check webhook URL in Polar dashboard
2. Verify webhook secret in `.env.local`
3. For local testing, use ngrok
4. Check server logs for webhook errors

---

## Test Card Numbers

Use these for testing in Polar Sandbox:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

**Expiry:** Any future date
**CVC:** Any 3 digits
**ZIP:** Any 5 digits

---

## Success Criteria

Your Polar payment integration is working if:

- [x] ✅ API connection successful
- [x] ✅ Products load from Polar
- [x] ✅ Checkout sessions created
- [ ] 🔄 Pricing page displays products
- [ ] 🔄 Checkout redirects work
- [ ] 🔄 Webhooks received and processed
- [ ] 🔄 Database updates correctly
- [ ] 🔄 Users get access after payment

---

## Next Steps

1. **Start dev server:** `npm run dev`
2. **Test pricing page:** Open `http://localhost:3000/pricing`
3. **Test checkout:** Sign in and click "Subscribe Now"
4. **Set up webhook:** Use ngrok for local testing
5. **Complete payment:** Use test card to verify full flow
6. **Verify database:** Check subscription status updated

---

## Support

If tests fail:

1. Check `POLAR_TEST_RESULTS.md` for detailed results
2. Review `TEST_POLAR_PAYMENT.md` for troubleshooting
3. Check Polar dashboard for webhook delivery logs
4. Review server logs for errors

---

**Ready to test?** Start with: `npm run dev` then `node test-polar-api.js`
