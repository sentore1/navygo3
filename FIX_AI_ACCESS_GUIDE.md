# Fix AI Access for Delta Goal & Admin Users

## Problem
Users with "Delta Goal" subscription or admin role are being redirected to pricing page when trying to use AI goal creation.

## Solution
I've fixed the subscription checking logic to properly handle:
1. Admin users (always have AI access)
2. Delta Goal subscribers (Kpay transactions)
3. Polar subscriptions with AI access
4. Product-level AI access settings

## What Was Fixed

### 1. Updated Subscription Check Logic
**File:** `src/components/goal-dashboard.tsx`

**Changes:**
- Admins now automatically get AI access
- Checks Kpay transactions for "Delta Goal" plan
- Doesn't return early if Polar subscription lacks AI access
- Falls back to checking product-level AI access settings

### 2. Created SQL Fix Scripts

**FIX_DELTA_GOAL_AI_ACCESS.sql** - Enables AI access for Delta Goal products
**FIX_ADMIN_AI_ACCESS.sql** - Comprehensive fix for admins and all Pro plans
**CHECK_MY_SUBSCRIPTION_AI_ACCESS.sql** - Diagnostic script to check your status

## Quick Fix Steps

### Step 1: Run the SQL Fix

Open Supabase SQL Editor and run this:

```sql
-- Enable AI access for Delta Goal and Pro products
UPDATE products
SET has_ai_access = true
WHERE name IN ('Pro', 'Delta Goal', 'Premium', 'Professional')
   OR name LIKE '%Pro%'
   OR name LIKE '%Delta%';

-- Update existing subscriptions
UPDATE polar_subscriptions ps
SET has_ai_access = true
FROM products p
WHERE ps.product_id = p.id
  AND p.has_ai_access = true
  AND ps.status = 'active';

-- Ensure admins have active subscription status
UPDATE users
SET subscription_status = 'active'
WHERE role = 'admin'
  AND (subscription_status IS NULL OR subscription_status != 'active');
```

### Step 2: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or just:
- Chrome/Edge: Ctrl+Shift+Delete → Clear cache
- Firefox: Ctrl+Shift+Delete → Clear cache

### Step 3: Test

1. Refresh the page
2. Go to your goals dashboard
3. Click the sparkle (✨) button
4. Should now open AI Goal Creator instead of redirecting to pricing

## How It Works Now

### Priority Order:

1. **Admin Check** (NEW!)
   - If user is admin → AI access granted
   - No subscription check needed

2. **Polar Subscription Check**
   - If has active Polar subscription with `has_ai_access = true` → AI access granted

3. **Kpay Transaction Check**
   - If has "Delta Goal" or "Pro" plan → AI access granted

4. **Product-Level Check**
   - If Polar subscription exists, check if product has AI access enabled

### Code Flow:

```typescript
checkProStatus() {
  // 1. Check if admin
  if (user.role === 'admin') {
    setIsPro(true); // ✅ Admin always has access
    return;
  }

  // 2. Check Polar subscription
  if (polarSub && polarSub.has_ai_access) {
    setIsPro(true); // ✅ Polar with AI access
    return;
  }

  // 3. Check Kpay transactions
  if (transaction.plan_name === 'Delta Goal' || 'Pro') {
    setIsPro(true); // ✅ Delta Goal or Pro plan
    return;
  }

  // 4. Check product-level AI access
  if (product.has_ai_access) {
    setIsPro(true); // ✅ Product has AI enabled
  }
}
```

## Verify Your Fix

### Check Your Subscription Status

Run this in Supabase SQL Editor (replace with your email):

```sql
SELECT 
    u.email,
    u.role,
    u.subscription_status,
    ps.status as polar_status,
    ps.has_ai_access as polar_ai_access,
    p.name as product_name,
    p.has_ai_access as product_ai_access,
    kt.plan_name as kpay_plan
FROM users u
LEFT JOIN polar_subscriptions ps ON u.id = ps.user_id AND ps.status = 'active'
LEFT JOIN products p ON ps.product_id = p.id
LEFT JOIN LATERAL (
    SELECT plan_name 
    FROM kpay_transactions 
    WHERE user_id = u.id 
      AND status = 'completed'
    ORDER BY created_at DESC 
    LIMIT 1
) kt ON true
WHERE u.email = 'your-email@example.com';
```

### Expected Results:

**For Admin Users:**
- `role` = 'admin'
- Should see AI button regardless of subscription

**For Delta Goal Users:**
- `kpay_plan` = 'Delta Goal'
- Should see AI button

**For Polar Pro Users:**
- `polar_ai_access` = true OR `product_ai_access` = true
- Should see AI button

## Troubleshooting

### Still Redirecting to Pricing?

**1. Check if AI is enabled in admin settings:**
- Go to `/admin/settings`
- Scroll to "AI Goal Creation"
- Make sure toggle is ON

**2. Verify your subscription:**
```sql
-- Run this to check your subscription
SELECT * FROM users WHERE email = 'your-email@example.com';
SELECT * FROM kpay_transactions WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 5;
```

**3. Check browser console:**
- Open DevTools (F12)
- Go to Console tab
- Look for errors related to subscription check

**4. Clear localStorage:**
```javascript
// Run in browser console
localStorage.clear();
location.reload();
```

### AI Button Still Not Showing?

**Check if AI is enabled globally:**
```sql
SELECT * FROM ai_settings;
```

Should show:
- `ai_enabled` = true
- `openai_api_key_configured` = true (checked server-side)

**Enable AI in admin settings:**
1. Go to `/admin/settings`
2. Find "AI Goal Creation" section
3. Toggle ON

## Testing Checklist

- [ ] Run SQL fix script
- [ ] Clear browser cache
- [ ] Refresh page
- [ ] Check AI button appears
- [ ] Click AI button (should open creator, not redirect)
- [ ] Generate a test goal
- [ ] Verify goal is created successfully

## For Different User Types

### Admin Users
✅ Always have AI access
✅ No subscription check needed
✅ Can use AI even without paid subscription

### Delta Goal Subscribers (Kpay)
✅ AI access through Kpay transaction check
✅ Plan name must be "Delta Goal" or "Pro"
✅ Transaction status must be "completed"

### Polar Subscribers
✅ AI access if `has_ai_access = true` on subscription
✅ OR if product has `has_ai_access = true`
✅ Subscription status must be "active"

## Database Schema Reference

### Products Table
```sql
products (
  id UUID,
  name VARCHAR,
  has_ai_access BOOLEAN  -- Must be true for AI access
)
```

### Polar Subscriptions Table
```sql
polar_subscriptions (
  id UUID,
  user_id UUID,
  product_id UUID,
  status VARCHAR,
  has_ai_access BOOLEAN  -- Copied from product or set manually
)
```

### Kpay Transactions Table
```sql
kpay_transactions (
  id UUID,
  user_id UUID,
  plan_name VARCHAR,  -- 'Delta Goal' or 'Pro' for AI access
  status VARCHAR      -- Must be 'completed'
)
```

### Users Table
```sql
users (
  id UUID,
  role VARCHAR,              -- 'admin' for automatic AI access
  subscription_status VARCHAR -- 'active' required (except for admins)
)
```

## Summary

The fix ensures:
1. ✅ Admins always have AI access
2. ✅ Delta Goal subscribers have AI access
3. ✅ Pro subscribers have AI access
4. ✅ Proper fallback checking
5. ✅ No early returns that skip checks

Just run the SQL fix and clear your cache, and you should be good to go!
