# Pricing CMS Setup Guide

## Overview
The Pricing CMS allows you to manage product features and descriptions from the admin dashboard instead of editing code files.

## What's Been Added

### 1. Database Tables
- `pricing_products` - Stores product information (name, description, popularity)
- `pricing_features` - Stores feature lists for each product
- `pricing_settings` - Stores global pricing page settings (title, subtitle, savings %)

### 2. Admin Interface
A new admin page at `/admin/pricing` with two tabs:

#### Page Settings Tab
- Page Title (e.g., "Choose Your Plan")
- Page Subtitle
- Yearly Savings Percent
- Toggle Monthly/Yearly billing options

#### Products & Features Tab
- Manage each product's display name and description
- Add/edit/delete features for each product
- Enable/disable products
- Mark products as "Popular"

### 3. Frontend Integration
The pricing page now:
1. First tries to load features from the database
2. Falls back to the config file if database is empty
3. Uses database settings for page title, subtitle, and savings percentage

## Setup Steps

### Step 1: Run the Migration
```bash
# Apply the migration to create the tables
supabase db push
```

Or run the migration file directly in your Supabase SQL editor:
```
supabase/migrations/20260405000001_create_pricing_cms.sql
```

### Step 2: Verify Data
Run the setup SQL to check if data was populated:
```sql
-- Check products
SELECT * FROM pricing_products;

-- Check features
SELECT * FROM pricing_features;

-- Check settings
SELECT * FROM pricing_settings;
```

### Step 3: Access Admin Panel
1. Go to `/admin` in your app
2. Click the "Pricing" button in the top navigation
3. You'll see two tabs: "Page Settings" and "Products & Features"

### Step 4: Customize Your Pricing
1. In "Page Settings" tab:
   - Update the page title and subtitle
   - Adjust the yearly savings percentage
   - Toggle monthly/yearly billing visibility

2. In "Products & Features" tab:
   - Edit product display names and descriptions
   - Add/remove/edit features for each product
   - Enable/disable products
   - Mark products as popular

## Product Name Matching

The system matches Polar products to database features using the product name. Make sure your database product names match your Polar product names:

- "navygoal" → matches Polar product "navygoal"
- "Navy goal" → matches Polar product "Navy goal"
- "navy goal" → matches Polar product "navy goal"

The system checks all variations (lowercase, capitalized) automatically.

## Adding New Products

To add a new product:

1. In the admin panel, you can't create new products (they come from Polar)
2. But you can add features for existing Polar products:
   - Go to Products & Features tab
   - Find your product
   - Click "Add Feature"
   - Enter the feature text
   - Save

Or via SQL:
```sql
-- Insert a new product
INSERT INTO pricing_products (product_name, display_name, description, is_popular, sort_order)
VALUES ('delta goal', 'Delta Goal', 'Advanced features for power users', false, 2);

-- Add features for the product
INSERT INTO pricing_features (product_id, feature_text, sort_order)
SELECT id, unnest(ARRAY[
    'Unlimited goals',
    'Advanced goal tracking',
    'Progress visualization',
    'Daily consistency tracking',
    'AI goal suggestions',
    'Priority support'
]), generate_series(1, 6)
FROM pricing_products
WHERE product_name = 'delta goal';
```

## Troubleshooting

### Features not showing on pricing page
1. Check if features are enabled: `SELECT * FROM pricing_features WHERE is_enabled = true;`
2. Verify product name matches Polar product name
3. Check browser console for errors

### Can't access admin page
1. Verify your user has admin role: `SELECT role FROM users WHERE email = 'your@email.com';`
2. If not admin, update: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';`

### Changes not saving
1. Check browser console for errors
2. Verify RLS policies are set up correctly
3. Make sure you're logged in as an admin

## Features

### Current Features
- ✅ Manage product descriptions
- ✅ Add/edit/delete features
- ✅ Enable/disable products
- ✅ Mark products as popular
- ✅ Customize page title and subtitle
- ✅ Adjust yearly savings percentage
- ✅ Toggle billing cycle visibility

### Future Enhancements
- Drag-and-drop feature reordering
- Product creation from admin panel
- Feature templates
- Bulk import/export
- Version history

## Notes

- The config file (`src/config/pricing.ts`) is still used as a fallback
- Database settings take priority over config file
- All changes are saved immediately
- Features are displayed in sort_order
