# Admin Dashboard Setup Guide

## Overview
Your app now has:
1. **Admin Dashboard** - View all users and statistics at `/admin`
2. **Admin Settings** - Enable/disable payment gateways at `/admin/settings`
3. **Role-based Access Control** - Only users with `role = 'admin'` can access admin pages

## Setup Steps

### 1. Run the Database Migration

Go to your Supabase Dashboard → SQL Editor and run the migration:

```sql
-- File: supabase/migrations/20260403000001_add_admin_role.sql
```

Or if you have Supabase CLI installed:

```bash
supabase db push
```

This will:
- Add a `role` column to the `users` table
- Create the `payment_gateway_settings` table
- Set up Row Level Security (RLS) policies
- Insert default payment gateways (Stripe, KPay, Polar)

### 2. Make Your User an Admin

In Supabase SQL Editor, run:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

### 3. Access the Admin Dashboard

1. Sign in to your app
2. Navigate to `/admin` in your browser
3. You should see:
   - Total users count
   - Active subscriptions count
   - Total revenue
   - List of all users with their details

### 4. Configure Payment Gateways

1. Go to `/admin/settings`
2. Toggle payment gateways on/off:
   - **Stripe** - Currently enabled (you have the env vars)
   - **KPay** - Currently enabled (you have the env vars)
   - **Polar** - Currently disabled (you have the env vars, just enable it)

## Payment Gateway Configuration

### Current Status (from your .env.local):

✅ **Stripe** - Configured
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

✅ **KPay** - Configured
- KPAY_API_URL
- KPAY_USERNAME
- KPAY_PASSWORD
- KPAY_RETAILER_ID
- KPAY_BANK_ID

✅ **Polar** - Configured (just needs to be enabled)
- POLAR_API_KEY
- POLAR_ORGANIZATION_ID
- POLAR_WEBHOOK_SECRET
- POLAR_CHECKOUT_URL

### To Enable Polar:

1. Go to `/admin/settings`
2. Toggle the "Polar" switch to ON
3. The system will use the environment variables already in your `.env.local`

## Features

### Admin Dashboard (`/admin`)
- View total users
- View active subscriptions
- View total revenue
- List all users with:
  - Email
  - Name
  - Role (admin/user)
  - Subscription status
  - Registration date

### Admin Settings (`/admin/settings`)
- Enable/disable payment gateways
- View configuration status for each gateway
- See required environment variables

## Security

- Only users with `role = 'admin'` can access admin pages
- Non-admin users are automatically redirected to `/dashboard`
- Row Level Security (RLS) protects the payment gateway settings table
- All admin actions are protected by Supabase RLS policies

## Next Steps

1. Run the migration
2. Make yourself an admin
3. Access `/admin` to see all users
4. Go to `/admin/settings` to enable Polar
5. Test the payment gateways

## Troubleshooting

If you can't access the admin dashboard:
1. Check that the migration ran successfully
2. Verify your user has `role = 'admin'` in the database
3. Clear your browser cache and sign in again
4. Check the browser console for any errors

If payment gateways don't work:
1. Verify all required environment variables are set in `.env.local`
2. Restart your Next.js development server
3. Check that the gateway is enabled in `/admin/settings`
