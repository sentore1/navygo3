# Pricing Admin Guide

## Overview
Products and prices come from Polar API. You can only manage the feature descriptions in the admin dashboard.

## How It Works

### Products & Prices (From Polar)
- Product names, descriptions, and prices are fetched from Polar
- These cannot be edited in the admin panel
- They update automatically when you sync with Polar

### Feature Descriptions (Managed in Admin)
- You can add/edit/delete feature bullet points for each product
- Features are stored in your database
- Features are linked to Polar products by product ID

## Using the Admin Panel

### Step 1: Access the Admin Panel
1. Go to `/admin` in your app
2. Click the "Pricing" button in the top navigation
3. You'll see two tabs: "Page Settings" and "Product Features"

### Step 2: Sync with Polar
- Click the "Sync with Polar" button to load your latest products from Polar
- This fetches all active products with recurring prices

### Step 3: Manage Features

#### Add a Feature
1. Go to the "Product Features" tab
2. Find the product you want to add features to
3. Click "Add Feature"
4. Type the feature description (e.g., "Goal Tracking", "AI Goal Writing")
5. The feature saves automatically when you click outside the input

#### Edit a Feature
1. Click on any feature text to edit it
2. Make your changes
3. Click outside the input to save automatically

#### Delete a Feature
1. Click the trash icon next to the feature
2. Confirm the deletion

#### Enable/Disable a Feature
- Use the toggle switch next to each feature
- Disabled features won't show on the pricing page

### Step 4: Customize Page Settings
In the "Page Settings" tab, you can customize:
- **Page Title**: The main heading (default: "Choose Your Plan")
- **Page Subtitle**: The description text below the title
- **Yearly Savings Percent**: The discount percentage shown for yearly plans
- **Show Monthly/Yearly**: Toggle visibility of billing options

## Database Structure

### Table: `pricing_product_features`
- `polar_product_id`: The Polar product ID
- `polar_product_name`: The Polar product name (for reference)
- `feature_text`: The feature description
- `sort_order`: Display order
- `is_enabled`: Whether to show this feature

### Table: `pricing_settings`
- `page_title`: Pricing page title
- `page_subtitle`: Pricing page subtitle
- `yearly_savings_percent`: Discount percentage
- `show_monthly`: Show monthly billing option
- `show_yearly`: Show yearly billing option

## Setup Instructions

### 1. Run the Migration
```bash
supabase db push
```

Or run this SQL in Supabase:
```sql
-- See: supabase/migrations/20260405000001_create_pricing_cms.sql
```

### 2. Add Features for Your Products
1. Go to `/admin/pricing`
2. Click "Sync with Polar" to load your products
3. For each product, click "Add Feature" and enter your feature descriptions

## Example Features

For a "Navy Goal" product, you might add:
- Goal Tracking
- AI Goal Writing
- Progress Visualization
- Reminders & Notifications
- Map of challenges
- Data Sync
- Priority Support

## Troubleshooting

### Products not showing
- Make sure your Polar API credentials are configured in `.env.local`:
  ```
  POLAR_API_KEY=your_api_key
  POLAR_ORGANIZATION_ID=your_org_id
  ```
- Click "Sync with Polar" to refresh

### Features not appearing on pricing page
- Check if features are enabled (toggle switch)
- Verify the product ID matches between Polar and your database
- Check browser console for errors

### Can't save changes
- Make sure you're logged in as an admin
- Check that your user has `role = 'admin'` in the database

## Notes

- Products and prices always come from Polar (cannot be edited)
- Only feature descriptions are managed in the admin panel
- Changes to features appear immediately on the pricing page
- The config file (`src/config/pricing.ts`) is used as a fallback if no database features exist
