# Testing Polar on Localhost WITHOUT Webhooks

## Yes, You Can Test Without Webhooks!

You can test the full payment flow on localhost without ngrok. The only limitation is that subscription status won't update automatically - you'll need to check manually or update the database yourself.

## What Works Without Webhooks

✅ Pricing page displays products
✅ "Subscribe Now" button works
✅ Redirects to Polar checkout
✅ Payment processing works
✅ User completes purchase
✅ Redirects back to your app

## What Doesn't Work Without Webhooks

❌ Subscription status doesn't auto-update in database
❌ User doesn't automatically get access
❌ Admin dashboard won't show subscription

## How to Test Without Webhooks

### Step 1: Just Run Your App

```bash
npm run dev
```

That's it! No ngrok needed.

### Step 2: Test the Checkout Flow

1. Go to: http://localhost:3000/pricing
2. Click "Subscribe Now"
3. You'll be redirected to Polar Sandbox checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete the purchase
6. You'll be redirected back to your app

### Step 3: Manually Update Subscription (For Testing)

After completing a purchase, manually activate the subscription in Supabase:

**Go to Supabase → SQL Editor and run:**

```sql
-- Update user subscription status
UPDATE users 
SET 
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '1 month',
  updated_at = NOW()
WHERE email = 'your-test-email@example.com';

-- Verify it worked
SELECT id, email, subscription_status, subscription_expires_at 
FROM users 
WHERE email = 'your-test-email@example.com';
```

Replace `your-test-email@example.com` with the email you used for testing.

### Step 4: Verify Access

1. Go to: http://localhost:3000/admin
2. You should see the user with active subscription
3. User now has access to premium features

## Alternative: Check Polar Dashboard

Instead of webhooks, you can verify purchases in Polar:

1. Go to: https://sandbox.polar.sh/dashboard
2. Click **Subscriptions** or **Orders**
3. You'll see all test purchases
4. Manually update your database based on what you see

## For Production: You'll Need Webhooks

This manual approach is fine for testing, but for production you need webhooks so:
- Subscriptions activate automatically
- Users get instant access
- Cancellations are handled
- Renewals are tracked

## Quick Test Flow (No Webhooks)

```bash
# 1. Run app
npm run dev

# 2. Test purchase
# Go to localhost:3000/pricing
# Click "Subscribe Now"
# Use card: 4242 4242 4242 4242
# Complete checkout

# 3. Check Polar Dashboard
# https://sandbox.polar.sh/dashboard
# Verify purchase appears

# 4. Manually update database
# Run SQL in Supabase to activate subscription

# 5. Verify in app
# Go to localhost:3000/admin
# See active subscription
```

## Simplified Testing Approach

For now, you can:

1. **Test the UI/UX:**
   - Pricing page layout
   - Checkout flow
   - Redirect behavior
   - Success page

2. **Verify in Polar Dashboard:**
   - Check subscriptions appear
   - Verify amounts are correct
   - Test different plans

3. **Manually activate for testing:**
   - Update database with SQL
   - Test premium features
   - Verify access control

4. **Add webhooks later:**
   - When you deploy to production
   - Or when you want to test full automation

## Update Database Helper Script

Save this as a quick reference:

```sql
-- Activate subscription for testing
UPDATE users 
SET 
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '1 month',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';

-- Deactivate subscription
UPDATE users 
SET 
  subscription_status = 'inactive',
  subscription_expires_at = NULL,
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';

-- Check subscription status
SELECT 
  email, 
  subscription_status, 
  subscription_expires_at,
  created_at
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';
```

## What You Can Test Without Webhooks

✅ **Pricing Page:**
- Products display correctly
- Prices are accurate
- Monthly/Yearly toggle works
- Features list shows properly

✅ **Checkout Flow:**
- "Subscribe Now" button works
- Redirects to Polar
- Checkout page loads
- Payment processes
- Returns to your app

✅ **User Interface:**
- Success page displays
- Error handling works
- Loading states work
- Navigation is correct

✅ **Admin Dashboard:**
- Can view users
- Can manually update subscriptions
- Statistics display correctly

## When You Need Webhooks

You'll need webhooks when:
- Deploying to production
- Want automatic subscription activation
- Need to handle renewals automatically
- Want to track cancellations
- Need real-time updates

## Production Deployment Options

When you're ready to deploy:

**Option 1: Deploy to Vercel/Netlify**
- Get a public URL automatically
- Add webhook URL in Polar
- Everything works automatically

**Option 2: Use Ngrok for Extended Testing**
- Sign up for free ngrok account
- Get stable HTTPS URL
- Test webhooks locally

**Option 3: Deploy to Your Domain**
- Use your navygoal.com domain
- Add webhook: https://navygoal.com/api/polar-webhook
- Production ready!

## Summary

**For Local Testing (No Webhooks):**
1. Run `npm run dev`
2. Test checkout at localhost:3000/pricing
3. Verify in Polar dashboard
4. Manually update database
5. Test features

**For Full Testing (With Webhooks):**
1. Use ngrok or deploy to production
2. Add webhook in Polar
3. Everything updates automatically

**Recommendation:**
- Start without webhooks to test UI/UX
- Add webhooks when deploying to production
- Or use ngrok if you want to test full automation locally

## You Can Start Testing Right Now!

```bash
npm run dev
```

Then go to http://localhost:3000/pricing and test the checkout flow!
