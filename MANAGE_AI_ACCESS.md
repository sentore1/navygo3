# Managing AI Access for Products

This guide explains how to control which subscription products include AI goal creation features.

## Overview

Instead of hardcoding product names, you can now manage AI access through the admin panel. This makes it easy to:
- Enable/disable AI features for any product
- Add new products without code changes
- Test different pricing tiers

## How It Works

1. **Database Table**: `polar_product_features` tracks which products have AI access
2. **Subscription Field**: `polar_subscriptions.has_ai_access` is automatically synced
3. **Admin Panel**: `/admin/product-features` lets you toggle AI access
4. **Automatic Updates**: When you change a product's AI access, all active subscriptions are updated immediately

## Setup Steps

### 1. Run the Migration

```bash
# Apply the new migration
psql $DATABASE_URL -f supabase/migrations/20260406000001_add_ai_access_to_products.sql
```

Or in Supabase dashboard:
1. Go to SQL Editor
2. Paste the contents of `supabase/migrations/20260406000001_add_ai_access_to_products.sql`
3. Click Run

### 2. Access Admin Panel

1. Go to `/admin/product-features`
2. You'll see all your Polar products
3. Toggle the switch to enable/disable AI access for each product

### 3. Configure Your Products

By default:
- **Delta Goal**: AI access enabled ✅
- **Navy goal**: AI access disabled ❌

Change these settings based on your pricing strategy.

## Adding New Products

When you add a new product in Polar:

1. The product will appear in your pricing page automatically
2. Go to `/admin/product-features`
3. Add the new product to the list:

```sql
INSERT INTO polar_product_features (product_id, product_name, has_ai_access)
VALUES ('your-new-product-id', 'Your Product Name', true);
```

Or use the admin interface (if you build a sync button).

## How Users Get AI Access

The system checks in this order:

1. **Polar Subscriptions**: Checks `polar_subscriptions.has_ai_access`
2. **Kpay Fallback**: Checks if plan_name is "Pro" or "Delta Goal"

## Testing

### Test AI Access is Working

1. Subscribe to a product with AI enabled (e.g., Delta Goal)
2. Go to your goals dashboard
3. You should see the AI sparkle button
4. Hover over it - tooltip should say "Create your goal with AI" with green "ACTIVE" badge

### Test AI Access is Blocked

1. Subscribe to a product without AI (e.g., Navy goal)
2. Go to your goals dashboard
3. You should see the AI sparkle button
4. Hover over it - tooltip should say "Create your goal with AI (Pro)" with green "PRO" badge
5. Clicking it redirects to `/pricing`

## Troubleshooting

### AI button not showing for Pro users

Check the subscription:
```sql
SELECT 
    ps.user_id,
    ps.product_id,
    ps.has_ai_access,
    pf.product_name,
    pf.has_ai_access as product_has_ai
FROM polar_subscriptions ps
LEFT JOIN polar_product_features pf ON ps.product_id = pf.product_id
WHERE ps.status = 'active';
```

### Product not in the list

Add it manually:
```sql
INSERT INTO polar_product_features (product_id, product_name, has_ai_access)
VALUES ('product-id-from-polar', 'Product Display Name', false)
ON CONFLICT (product_id) DO NOTHING;
```

### Changes not taking effect

The trigger should update subscriptions automatically, but you can force it:
```sql
UPDATE polar_subscriptions ps
SET has_ai_access = pf.has_ai_access
FROM polar_product_features pf
WHERE ps.product_id = pf.product_id
AND ps.status = 'active';
```

## Database Schema

### polar_product_features
```sql
- id: UUID (primary key)
- product_id: TEXT (unique, matches Polar product ID)
- product_name: TEXT (display name)
- has_ai_access: BOOLEAN (whether this product includes AI)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### polar_subscriptions (updated)
```sql
- has_ai_access: BOOLEAN (synced from product_features)
```

## Future Enhancements

You can extend this system to track other features:
- `has_unlimited_goals`: Whether the product allows unlimited goals
- `max_goals`: Maximum number of goals allowed
- `has_analytics`: Whether analytics features are included
- `has_priority_support`: Whether priority support is included

Just add columns to `polar_product_features` and update the admin panel.
