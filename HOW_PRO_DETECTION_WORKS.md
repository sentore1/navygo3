# How Pro Version Detection Works

## Overview

The system checks if a user has Pro access (for AI features) through multiple methods in priority order.

## Detection Flow

```
User Opens Dashboard
        ↓
Check if user is Admin
        ↓ NO
Check subscription_status = 'active'
        ↓ YES
Check Polar Subscription with AI access
        ↓ NO
Check Kpay Transaction (Delta Goal/Pro)
        ↓ NO
Check Polar Product Features
        ↓ NO
User is Basic (No AI access)
```

## Step-by-Step Process

### Step 1: Admin Check
```typescript
if (userData?.role === 'admin') {
  setIsPro(true); // ✅ Admin always has AI access
  return;
}
```

**Database Check:**
```sql
SELECT role FROM users WHERE id = 'user-id';
-- If role = 'admin' → Grant AI access
```

### Step 2: Subscription Status Check
```typescript
if (userData?.subscription_status === 'active') {
  // Continue to next checks
}
```

**Database Check:**
```sql
SELECT subscription_status FROM users WHERE id = 'user-id';
-- Must be 'active' to continue
```

### Step 3: Polar Subscription Check
```typescript
const { data: polarSub } = await supabase
  .from('polar_subscriptions')
  .select('product_id, status, has_ai_access')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .maybeSingle();

if (polarSub && polarSub.has_ai_access) {
  setIsPro(true); // ✅ Has Polar subscription with AI
  return;
}
```

**Database Check:**
```sql
SELECT has_ai_access 
FROM polar_subscriptions 
WHERE user_id = 'user-id' 
  AND status = 'active';
-- If has_ai_access = true → Grant AI access
```

### Step 4: Kpay Transaction Check
```typescript
const { data: transaction } = await supabase
  .from('kpay_transactions')
  .select('plan_name')
  .eq('user_id', user.id)
  .eq('status', 'completed')
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (transaction?.plan_name === 'Pro' || 
    transaction?.plan_name === 'Delta Goal') {
  setIsPro(true); // ✅ Has Pro/Delta Goal via Kpay
  return;
}
```

**Database Check:**
```sql
SELECT plan_name 
FROM kpay_transactions 
WHERE user_id = 'user-id' 
  AND status = 'completed'
ORDER BY created_at DESC 
LIMIT 1;
-- If plan_name = 'Pro' OR 'Delta Goal' → Grant AI access
```

### Step 5: Product Feature Check
```typescript
const { data: productFeature } = await supabase
  .from('polar_product_features')
  .select('has_ai_access')
  .eq('product_id', polarSub.product_id)
  .single();

if (productFeature?.has_ai_access) {
  setIsPro(true); // ✅ Product has AI enabled
}
```

**Database Check:**
```sql
SELECT has_ai_access 
FROM polar_product_features 
WHERE product_id = 'product-id';
-- If has_ai_access = true → Grant AI access
```

## Database Tables Involved

### 1. users
```sql
users (
  id UUID,
  role VARCHAR,              -- 'admin' for automatic access
  subscription_status VARCHAR -- Must be 'active'
)
```

### 2. polar_subscriptions
```sql
polar_subscriptions (
  user_id UUID,
  product_id TEXT,
  status VARCHAR,            -- Must be 'active'
  has_ai_access BOOLEAN      -- Direct AI access flag
)
```

### 3. kpay_transactions
```sql
kpay_transactions (
  user_id UUID,
  plan_name VARCHAR,         -- 'Pro' or 'Delta Goal'
  status VARCHAR             -- Must be 'completed'
)
```

### 4. polar_product_features
```sql
polar_product_features (
  product_id TEXT,
  product_name TEXT,
  has_ai_access BOOLEAN      -- Product-level AI access
)
```

## User Types & Access

### Admin Users
- **Check:** `users.role = 'admin'`
- **Access:** Always granted
- **No subscription needed**

### Polar Pro Subscribers
- **Check:** `polar_subscriptions.has_ai_access = true`
- **Access:** Granted if subscription is active
- **Requires:** Active Polar subscription

### Kpay Pro/Delta Goal Subscribers
- **Check:** `kpay_transactions.plan_name IN ('Pro', 'Delta Goal')`
- **Access:** Granted if transaction completed
- **Requires:** Completed Kpay transaction

### Basic Users
- **Check:** None of the above
- **Access:** Denied
- **Shown:** Upgrade prompt

## How to Grant Pro Access

### Method 1: Make User Admin
```sql
UPDATE users 
SET role = 'admin', 
    subscription_status = 'active'
WHERE email = 'user@example.com';
```

### Method 2: Enable Polar Product AI Access
```sql
-- Enable AI for product
INSERT INTO polar_product_features (product_id, product_name, has_ai_access)
VALUES ('pro', 'Pro', true)
ON CONFLICT (product_id) 
DO UPDATE SET has_ai_access = true;

-- Update user's subscription
UPDATE polar_subscriptions
SET has_ai_access = true
WHERE user_id = 'user-id' AND status = 'active';
```

### Method 3: Create Kpay Transaction
```sql
INSERT INTO kpay_transactions (
  user_id, 
  plan_name, 
  status, 
  amount
)
VALUES (
  'user-id',
  'Delta Goal',
  'completed',
  50.00
);

-- Also update user status
UPDATE users 
SET subscription_status = 'active'
WHERE id = 'user-id';
```

## API Endpoint Protection

The API endpoints also check Pro status:

### User Endpoint (`/api/goals/create-with-ai`)
```typescript
// Check if user has Pro subscription with AI access
const { data: userData } = await supabase
  .from('users')
  .select('subscription_status')
  .eq('id', user.id)
  .single();

if (userData?.subscription_status === 'active') {
  // Check Polar subscriptions for AI access
  const { data: polarSub } = await supabase
    .from('polar_subscriptions')
    .select('has_ai_access')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  
  hasAIAccess = polarSub?.has_ai_access || false;
}

if (!hasAIAccess) {
  return NextResponse.json(
    { error: 'AI goal creation requires an active Pro subscription' },
    { status: 403 }
  );
}
```

## Verification Queries

### Check Your Own Status
```sql
-- Replace with your email
SELECT 
    u.email,
    u.role,
    u.subscription_status,
    ps.product_id,
    ps.has_ai_access as polar_ai_access,
    pf.has_ai_access as product_ai_access,
    kt.plan_name as kpay_plan
FROM users u
LEFT JOIN polar_subscriptions ps 
    ON u.id = ps.user_id AND ps.status = 'active'
LEFT JOIN polar_product_features pf 
    ON ps.product_id = pf.product_id
LEFT JOIN LATERAL (
    SELECT plan_name 
    FROM kpay_transactions 
    WHERE user_id = u.id AND status = 'completed'
    ORDER BY created_at DESC 
    LIMIT 1
) kt ON true
WHERE u.email = 'your-email@example.com';
```

### Check All Pro Users
```sql
-- Users with AI access
SELECT DISTINCT
    u.email,
    CASE 
        WHEN u.role = 'admin' THEN 'Admin'
        WHEN ps.has_ai_access THEN 'Polar Pro'
        WHEN kt.plan_name IN ('Pro', 'Delta Goal') THEN 'Kpay Pro'
        ELSE 'Unknown'
    END as access_type
FROM users u
LEFT JOIN polar_subscriptions ps 
    ON u.id = ps.user_id AND ps.status = 'active'
LEFT JOIN LATERAL (
    SELECT plan_name 
    FROM kpay_transactions 
    WHERE user_id = u.id AND status = 'completed'
    ORDER BY created_at DESC 
    LIMIT 1
) kt ON true
WHERE u.role = 'admin'
   OR ps.has_ai_access = true
   OR kt.plan_name IN ('Pro', 'Delta Goal');
```

## Troubleshooting

### User Can't Access AI

**1. Check subscription status:**
```sql
SELECT subscription_status FROM users WHERE email = 'user@example.com';
-- Should be 'active'
```

**2. Check Polar subscription:**
```sql
SELECT * FROM polar_subscriptions 
WHERE user_id = 'user-id' AND status = 'active';
-- Should have has_ai_access = true
```

**3. Check Kpay transactions:**
```sql
SELECT * FROM kpay_transactions 
WHERE user_id = 'user-id' AND status = 'completed'
ORDER BY created_at DESC LIMIT 1;
-- Should have plan_name = 'Pro' or 'Delta Goal'
```

**4. Check product features:**
```sql
SELECT * FROM polar_product_features 
WHERE product_id = 'user-product-id';
-- Should have has_ai_access = true
```

## Summary

The system checks Pro status in this priority:
1. ✅ Admin role → Always granted
2. ✅ Polar subscription with AI → Granted
3. ✅ Kpay Pro/Delta Goal → Granted
4. ✅ Product has AI enabled → Granted
5. ❌ None of above → Denied

This multi-layered approach ensures users get AI access through any valid subscription method.
