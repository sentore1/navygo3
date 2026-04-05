# Quick Start: Admin Dashboard

## 3 Simple Steps

### 1️⃣ Run Migration in Supabase

Go to Supabase Dashboard → SQL Editor → New Query

Copy and paste the entire content from:
```
supabase/migrations/20260403000001_add_admin_role.sql
```

Click "Run" ▶️

### 2️⃣ Make Yourself Admin

In the same SQL Editor, run:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE';
```

Replace `YOUR_EMAIL_HERE` with your actual email address.

### 3️⃣ Access Admin Dashboard

1. Go to your app
2. Sign in (or refresh if already signed in)
3. Click your profile icon (top right)
4. Click "Admin Dashboard"

Or go directly to: `http://localhost:3000/admin`

## Enable Polar Payment Gateway

1. Go to `/admin/settings`
2. Find "Polar" section
3. Toggle switch to ON ✅
4. Done!

## What You Get

- **Admin Dashboard**: View all users, subscriptions, revenue
- **Payment Settings**: Enable/disable Stripe, KPay, Polar
- **User Management**: See all user details and subscription status

## Already Configured

Your `.env.local` already has:
- ✅ Stripe credentials
- ✅ KPay credentials  
- ✅ Polar credentials

Just enable Polar in the admin settings!

## Need Help?

See detailed guides:
- `ADMIN_SETUP_GUIDE.md` - Full setup instructions
- `ADMIN_FEATURES.md` - Complete feature documentation
