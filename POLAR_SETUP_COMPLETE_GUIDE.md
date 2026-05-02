# Complete Polar Setup Guide for navygoall.com

## Step 1: Switch from Sandbox to Live

### 1.1 Update Environment Variables

Your `.env.local` already has:
```bash
POLAR_API_URL=https://api.polar.sh  ✅ Already set to live
```

### 1.2 Get Live Credentials from Polar

1. Go to **https://polar.sh/dashboard** (NOT sandbox)
2. Navigate to **Settings → API**
3. Copy these credentials:

```bash
# Replace these in your .env.local with LIVE values:
POLAR_API_KEY=polar_oat_YOUR_LIVE_KEY_HERE
POLAR_WEBHOOK_SECRET=polar_whs_YOUR_LIVE_SECRET_HERE
POLAR_ORGANIZATION_ID=YOUR_LIVE_ORG_ID_HERE
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=YOUR_LIVE_ORG_ID_HERE
```

---

## Step 2: Create Products in Polar

### 2.1 Create Navy Goal Plan

1. Go to **https://polar.sh/dashboard/products**
2. Click **"Create Product"**
3. Fill in:
   - **Name**: Navy Goal
   - **Description**: Perfect for getting started with goal tracking
   - **Type**: Subscription

4. Add Prices:
   - **Monthly**: $4.97
   - **Yearly**: $44.73 (or $47 for clean pricing)

5. **Save** and copy the **Product ID**

### 2.2 Create Pro Plan

1. Click **"Create Product"** again
2. Fill in:
   - **Name**: Pro Plan
   - **Description**: Unlimited features with advanced AI
   - **Type**: Subscription

3. Add Prices:
   - **Monthly**: $9.97
   - **Yearly**: $89.73 (or $97 for clean pricing)

4. **Save** and copy the **Product ID**

### 2.3 Create Delta Goal Plan

1. Click **"Create Product"** again
2. Fill in:
   - **Name**: Delta Goal
   - **Description**: Premium plan for teams and power users
   - **Type**: Subscription

3. Add Prices:
   - **Monthly**: $19.97
   - **Yearly**: $179.73 (or $197 for clean pricing)

4. **Save** and copy the **Product ID**

---

## Step 3: Configure Webhooks

### 3.1 Set Up Webhook Endpoint

You have two options for the webhook URL:

**Option 1: Using Your Domain (Recommended for Production)**
```
https://navygoall.com/api/polar-webhook
```

**Option 2: Using Supabase Edge Function (If using Supabase Functions)**
```
https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/polar-webhook
```

**Steps:**
1. Go to **https://polar.sh/dashboard/settings/webhooks**
2. Click **"Add Webhook"**
3. Enter your webhook URL (choose Option 1 or 2 above)

4. Select these events:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `checkout.created`
   - ✅ `checkout.updated`

5. Copy the **Webhook Secret** and update your `.env.local`:

```bash
POLAR_WEBHOOK_SECRET=polar_whs_YOUR_NEW_SECRET
```

---

## Step 4: Create Checkout Links

### 4.1 For Each Product

1. Go to **Products** → Select a product (e.g., Navy Goal)
2. Click **"Checkout Links"** tab
3. Click **"Create Checkout Link"**
4. Configure:
   - **Success URL**: `https://navygoall.com/dashboard?success=true`
   - **Cancel URL**: `https://navygoall.com/pricing`
   - **Allow discount codes**: Yes (optional)

5. **Save** and copy the **Checkout Link ID**

### 4.2 Update Your Config

Open `src/config/pricing.ts` and update:

```typescript
polarCheckoutLinks: {
  // Navy Goal Monthly
  "navy_monthly_product_id": "https://api.polar.sh/v1/checkout-links/YOUR_NAVY_CHECKOUT_ID/redirect",
  
  // Pro Plan Monthly
  "pro_monthly_product_id": "https://api.polar.sh/v1/checkout-links/YOUR_PRO_CHECKOUT_ID/redirect",
  
  // Delta Goal Monthly
  "delta_monthly_product_id": "https://api.polar.sh/v1/checkout-links/YOUR_DELTA_CHECKOUT_ID/redirect",
}
```

---

## Step 5: Update Domain Configuration

### 5.1 Update Site URL

In your `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://navygoall.com
```

### 5.2 Configure CORS in Polar

1. Go to **https://polar.sh/dashboard/settings/api**
2. Add allowed origins:
   - `https://navygoall.com`
   - `https://www.navygoall.com` (if using www)

---

## Step 6: Add Features to Database

### 6.1 Run SQL in Supabase

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Navy Goal Features
INSERT INTO pricing_product_features (polar_product_id, polar_product_name, feature_text, sort_order)
VALUES
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'Up to 5 active goals', 1),
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'AI Goal Writing (3 per month)', 2),
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'Progress Visualization', 3),
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'Reminders & Notifications', 4),
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'Map of Challenges', 5),
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'Weekly Progress Reports', 6),
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'Mobile App Access', 7),
    ('YOUR_NAVY_PRODUCT_ID', 'Navy Goal', 'Email Support', 8)
ON CONFLICT (polar_product_id, feature_text) DO NOTHING;

-- Pro Plan Features
INSERT INTO pricing_product_features (polar_product_id, polar_product_name, feature_text, sort_order)
VALUES
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Everything in Navy Goal', 1),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Unlimited Goals', 2),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Unlimited AI Generation', 3),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Advanced Analytics', 4),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Goal Templates Library', 5),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Habit Tracking', 6),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Custom Reminders', 7),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Export Data (PDF/CSV)', 8),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Priority Support', 9),
    ('YOUR_PRO_PRODUCT_ID', 'Pro Plan', 'Early Access Features', 10)
ON CONFLICT (polar_product_id, feature_text) DO NOTHING;

-- Delta Goal Features
INSERT INTO pricing_product_features (polar_product_id, polar_product_name, feature_text, sort_order)
VALUES
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Everything in Pro', 1),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Team Collaboration (5 members)', 2),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Shared Goals', 3),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Advanced AI Coaching', 4),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Calendar Integrations', 5),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'API Access', 6),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'White-Label Options', 7),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Account Manager', 8),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Video Support', 9),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Custom AI Training', 10),
    ('YOUR_DELTA_PRODUCT_ID', 'Delta Goal', 'Advanced Dashboards', 11)
ON CONFLICT (polar_product_id, feature_text) DO NOTHING;

-- Update yearly savings to 25%
UPDATE pricing_settings
SET yearly_savings_percent = 25,
    page_subtitle = 'Select a plan that fits your goals. Save 25% with yearly billing.';
```

---

## Step 7: Test the Integration

### 7.1 Test Webhook

1. Go to **https://polar.sh/dashboard/settings/webhooks**
2. Click on your webhook
3. Click **"Send Test Event"**
4. Check your app logs to verify it received the webhook

### 7.2 Test Checkout Flow

1. Go to **https://navygoall.com/pricing**
2. Click **"Get It Done"** on any plan
3. Complete the checkout (use test card if available)
4. Verify:
   - User is redirected to dashboard
   - Subscription appears in database
   - User gets access to features

### 7.3 Verify Database

Run in Supabase SQL Editor:

```sql
-- Check if subscription was created
SELECT * FROM polar_subscriptions ORDER BY created_at DESC LIMIT 5;

-- Check user access
SELECT 
    u.email,
    ps.status,
    ps.product_id,
    ps.current_period_end
FROM users u
LEFT JOIN polar_subscriptions ps ON ps.user_id = u.id
WHERE u.email = 'your-test-email@example.com';
```

---

## Step 8: Deploy to Production

### 8.1 Update Environment Variables on Vercel/Hosting

Add these to your production environment:

```bash
POLAR_API_URL=https://api.polar.sh
POLAR_API_KEY=polar_oat_YOUR_LIVE_KEY
POLAR_WEBHOOK_SECRET=polar_whs_YOUR_LIVE_SECRET
POLAR_ORGANIZATION_ID=YOUR_LIVE_ORG_ID
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=YOUR_LIVE_ORG_ID
NEXT_PUBLIC_SITE_URL=https://navygoall.com
```

### 8.2 Redeploy Your App

```bash
git add .
git commit -m "feat: configure Polar for production"
git push origin main
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct: `https://navygoall.com/api/polar-webhook`
2. Verify webhook secret matches `.env.local`
3. Check app logs for errors
4. Test with Polar's "Send Test Event" button

### Checkout Not Working

1. Verify `POLAR_API_KEY` is from live dashboard (not sandbox)
2. Check product IDs are correct
3. Ensure `NEXT_PUBLIC_SITE_URL` is set to `https://navygoall.com`
4. Check browser console for errors

### Features Not Showing

1. Run the SQL to insert features
2. Verify features in Supabase: `SELECT * FROM pricing_product_features;`
3. Check product names match exactly (case-sensitive)
4. Clear browser cache and refresh

---

## Quick Reference

### Your URLs

- **Website**: https://navygoall.com
- **Pricing Page**: https://navygoall.com/pricing
- **Dashboard**: https://navygoall.com/dashboard
- **Webhook**: https://navygoall.com/api/polar-webhook

### Polar Dashboard Links

- **Products**: https://polar.sh/dashboard/products
- **Webhooks**: https://polar.sh/dashboard/settings/webhooks
- **API Settings**: https://polar.sh/dashboard/settings/api
- **Checkout Links**: https://polar.sh/dashboard/products → Select product → Checkout Links

### Important Files

- Environment: `.env.local`
- Pricing Config: `src/config/pricing.ts`
- Webhook Handler: `src/app/api/polar-webhook/route.ts`
- Pricing Page: `src/components/pricing-client.tsx`

---

## Next Steps

1. ✅ Switch to live Polar API
2. ✅ Create 3 products (Navy, Pro, Delta)
3. ✅ Set up webhook for navygoall.com
4. ✅ Create checkout links
5. ✅ Add features to database
6. ✅ Test checkout flow
7. ✅ Deploy to production

**Need help?** Check the Polar documentation: https://docs.polar.sh
