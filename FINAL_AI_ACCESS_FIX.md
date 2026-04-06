# Final AI Access Fix - Delta Goal & Admin Users

## The Issue
You have a Delta Goal subscription but the AI button redirects you to the pricing page.

## The Solution
Run this SQL script to enable AI access for Delta Goal and admin users.

---

## Quick Fix (Copy & Paste)

**Open Supabase SQL Editor and run this:**

```sql
-- Enable AI access for Delta Goal in polar_product_features
INSERT INTO polar_product_features (product_id, product_name, has_ai_access)
VALUES 
    ('delta-goal', 'Delta Goal', true),
    ('pro', 'Pro', true),
    ('premium', 'Premium', true)
ON CONFLICT (product_id) 
DO UPDATE SET 
    has_ai_access = true,
    updated_at = NOW();

-- Update all active polar subscriptions
UPDATE polar_subscriptions
SET has_ai_access = true
WHERE product_id IN ('delta-goal', 'pro', 'premium')
  AND status = 'active';

-- Ensure admin users have active status
UPDATE users
SET subscription_status = 'active'
WHERE role = 'admin';
```

**Then:**
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Refresh the page
3. Try the AI button again

---

## What This Does

### 1. Enables AI for Delta Goal Product
```sql
INSERT INTO polar_product_features (product_id, product_name, has_ai_access)
VALUES ('delta-goal', 'Delta Goal', true)
```
This marks the Delta Goal product as having AI access.

### 2. Updates Active Subscriptions
```sql
UPDATE polar_subscriptions
SET has_ai_access = true
WHERE product_id = 'delta-goal'
```
This gives AI access to all active Delta Goal subscribers.

### 3. Fixes Admin Access
```sql
UPDATE users
SET subscription_status = 'active'
WHERE role = 'admin'
```
This ensures admins have active status for AI access.

---

## Verify It Worked

Run this to check your status:

```sql
-- Check your subscription (replace with your email)
SELECT 
    u.email,
    u.role,
    u.subscription_status,
    ps.product_id,
    ps.has_ai_access as subscription_ai_access,
    pf.has_ai_access as product_ai_access,
    ps.status
FROM users u
LEFT JOIN polar_subscriptions ps ON u.id = ps.user_id AND ps.status = 'active'
LEFT JOIN polar_product_features pf ON ps.product_id = pf.product_id
WHERE u.email = 'your-email@example.com';
```

**Expected Results:**
- If you're admin: `role = 'admin'` and `subscription_status = 'active'`
- If you have Delta Goal: `product_id = 'delta-goal'` and `subscription_ai_access = true`

---

## How the Code Works Now

The updated code checks in this order:

```typescript
1. Is user an admin?
   ✅ YES → Grant AI access (no subscription needed)
   ❌ NO → Continue to step 2

2. Does user have active Polar subscription with has_ai_access = true?
   ✅ YES → Grant AI access
   ❌ NO → Continue to step 3

3. Does user have Delta Goal or Pro in Kpay transactions?
   ✅ YES → Grant AI access
   ❌ NO → Continue to step 4

4. Does the Polar product have AI access enabled?
   ✅ YES → Grant AI access
   ❌ NO → No AI access
```

---

## Troubleshooting

### Still Not Working?

**1. Check if you ran the SQL:**
```sql
SELECT * FROM polar_product_features WHERE product_id = 'delta-goal';
```
Should show `has_ai_access = true`

**2. Check your subscription:**
```sql
SELECT * FROM polar_subscriptions 
WHERE user_id = 'your-user-id' 
AND status = 'active';
```
Should show `has_ai_access = true`

**3. Check if AI is enabled globally:**
```sql
SELECT * FROM ai_settings;
```
Should show `ai_enabled = true`

**4. Clear browser cache:**
- Chrome: Ctrl+Shift+Delete → Clear cache
- Or: DevTools (F12) → Right-click refresh → Empty cache and hard reload

**5. Check browser console:**
- Open DevTools (F12)
- Go to Console tab
- Look for errors when clicking AI button

### AI Button Still Redirects?

**Check if AI is enabled in admin settings:**
1. Go to `/admin/settings`
2. Scroll to "AI Goal Creation" section
3. Make sure:
   - Badge shows "✓ API Key Configured" (green)
   - Toggle is ON

**If badge is red:**
1. Add `OPENAI_API_KEY` to your `.env.local`
2. Restart your dev server: `npm run dev`
3. Refresh admin settings page

---

## For Different Subscription Types

### If You Have Delta Goal (Kpay)
The code checks `kpay_transactions` table for:
- `plan_name = 'Delta Goal'`
- `status = 'completed'`

No additional setup needed after running the SQL fix.

### If You Have Polar Subscription
The code checks:
1. `polar_subscriptions.has_ai_access = true`
2. OR `polar_product_features.has_ai_access = true`

The SQL fix sets both of these.

### If You're an Admin
The code checks:
- `users.role = 'admin'`
- `users.subscription_status = 'active'`

The SQL fix ensures both are set.

---

## Database Tables Reference

### polar_product_features
Defines which products have AI access:
```sql
product_id | product_name | has_ai_access
-----------|--------------|---------------
delta-goal | Delta Goal   | true
pro        | Pro          | true
```

### polar_subscriptions
User subscriptions with AI access flag:
```sql
user_id | product_id | status | has_ai_access
--------|------------|--------|---------------
uuid    | delta-goal | active | true
```

### kpay_transactions
Kpay payment records:
```sql
user_id | plan_name   | status
--------|-------------|----------
uuid    | Delta Goal  | completed
```

### users
User accounts:
```sql
id   | role  | subscription_status
-----|-------|--------------------
uuid | admin | active
```

---

## Summary

**What was fixed:**
1. ✅ Updated code to check admin role first
2. ✅ Fixed table name from `products` to `polar_product_features`
3. ✅ Added proper fallback checks for Kpay transactions
4. ✅ Created SQL script to enable AI for Delta Goal

**What you need to do:**
1. Run the SQL script above
2. Clear browser cache
3. Refresh the page
4. Test the AI button

That's it! The AI button should now work for you.

---

## Need More Help?

**Check these files:**
- `SIMPLE_FIX_AI_ACCESS.sql` - The SQL fix script
- `CHECK_EXISTING_TABLES.sql` - Check your database structure
- `FIX_AI_ACCESS_GUIDE.md` - Detailed troubleshooting guide

**Or run diagnostics:**
```sql
-- Check everything at once
SELECT 'Your Email' as check_type, email as value FROM users WHERE email = 'your-email@example.com'
UNION ALL
SELECT 'Your Role', role FROM users WHERE email = 'your-email@example.com'
UNION ALL
SELECT 'Subscription Status', subscription_status FROM users WHERE email = 'your-email@example.com'
UNION ALL
SELECT 'Polar Product', product_id FROM polar_subscriptions ps JOIN users u ON ps.user_id = u.id WHERE u.email = 'your-email@example.com' AND ps.status = 'active'
UNION ALL
SELECT 'Has AI Access', has_ai_access::text FROM polar_subscriptions ps JOIN users u ON ps.user_id = u.id WHERE u.email = 'your-email@example.com' AND ps.status = 'active'
UNION ALL
SELECT 'Kpay Plan', plan_name FROM kpay_transactions kt JOIN users u ON kt.user_id = u.id WHERE u.email = 'your-email@example.com' AND kt.status = 'completed' ORDER BY kt.created_at DESC LIMIT 1;
```

Replace `'your-email@example.com'` with your actual email.
