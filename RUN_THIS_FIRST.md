# ⚠️ IMPORTANT: Run This First!

## You got the error because you need to run the migration BEFORE setting the admin role.

Follow these steps IN ORDER:

---

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

---

## Step 2: Run the Migration

1. Open this file: `supabase/migrations/20260403000001_add_admin_role.sql`
2. Copy the ENTIRE content (all 47 lines)
3. Paste it into the Supabase SQL Editor
4. Click "Run" (or press Ctrl+Enter)

You should see: ✅ "Success. No rows returned"

This creates:
- `role` column in users table
- `payment_gateway_settings` table
- Security policies

---

## Step 3: Make Yourself Admin

Now that the `role` column exists, run this query:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Replace `your-email@example.com` with YOUR actual email!**

You should see: ✅ "Success. 1 row updated"

---

## Step 4: Verify It Worked

Run this query:

```sql
SELECT id, email, role, created_at 
FROM users 
WHERE role = 'admin';
```

You should see your user with `role = 'admin'`

---

## Step 5: Access Admin Dashboard

1. Go to your app: http://localhost:3000
2. Sign out and sign in again (to refresh your session)
3. Click your profile icon (top right)
4. You should now see "Admin Dashboard" option
5. Click it or go to: http://localhost:3000/admin

---

## Troubleshooting

**Still getting "column role does not exist"?**
- Make sure you ran Step 2 (the migration) first
- Check if the migration ran successfully (no errors)
- Try running the migration again (it's safe to run multiple times)

**Can't see Admin Dashboard link?**
- Sign out completely
- Sign in again
- Hard refresh the page (Ctrl+Shift+R)

**Migration fails?**
- Check if you have the correct database permissions
- Make sure you're connected to the right project
- Check the Supabase logs for detailed errors

---

## Quick Reference

Migration file: `supabase/migrations/20260403000001_add_admin_role.sql`
Admin SQL: `MAKE_ADMIN.sql`
Full guide: `ADMIN_SETUP_GUIDE.md`

---

## What You'll Get

Once setup is complete:

✅ Admin Dashboard at `/admin`
- View all users
- See subscription statistics
- Monitor revenue

✅ Admin Settings at `/admin/settings`
- Enable/disable Stripe
- Enable/disable KPay
- Enable/disable Polar (you already have the credentials!)

✅ Secure Access
- Only admins can access these pages
- Protected by Row Level Security
