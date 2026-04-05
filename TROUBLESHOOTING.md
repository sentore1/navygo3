# Troubleshooting: "column role does not exist"

## The Issue

You're getting this error because the `role` column hasn't been added to your `users` table yet.

## Solution: Try These Steps in Order

---

### Option 1: Simplest Fix (Try This First!)

1. Open Supabase SQL Editor
2. Copy and paste this ONE line:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
```

3. Click "Run"
4. If successful, then run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

(Replace with your actual email)

---

### Option 2: If Option 1 Fails

The users table might not exist or might be in a different schema. Let's check:

1. Run this diagnostic query:

```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'users';
```

2. If you see the table is in a different schema (like `auth.users`), you need to add the column to the correct table.

---

### Option 3: Check Your Database Structure

Run the queries in `DEBUG_DATABASE.sql` to see:
- If the users table exists
- What columns it currently has
- If the role column is already there

---

### Option 4: Full Setup Script

If the simple fix doesn't work, run the complete script in `STEP_BY_STEP.sql`

This will:
1. Add the role column
2. Create the payment_gateway_settings table
3. Set up all security policies

---

## Common Issues

### Issue: "permission denied for table users"

**Solution:** You need to be the database owner or have ALTER TABLE permissions.

In Supabase, go to:
- Settings → Database → Connection string
- Make sure you're using the correct credentials

### Issue: "table users does not exist"

**Solution:** The users table might not be created yet.

Check if you have users in your auth system:
```sql
SELECT * FROM auth.users LIMIT 1;
```

If users are in `auth.users`, you might need to create a `public.users` table first.

### Issue: Column already exists but still getting error

**Solution:** Clear your connection and try again:
1. Close the SQL Editor tab
2. Open a new SQL Editor tab
3. Run the ALTER TABLE command again

---

## Step-by-Step Debugging

### Step 1: Verify Table Exists
```sql
SELECT * FROM users LIMIT 1;
```

If this fails, the table doesn't exist.

### Step 2: Check Current Columns
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
```

This shows all columns. Look for 'role' in the list.

### Step 3: Try Adding Column
```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
```

If this works, proceed to make yourself admin.

### Step 4: Make Yourself Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 5: Verify
```sql
SELECT email, role FROM users WHERE role = 'admin';
```

---

## Quick Files Reference

- **`SIMPLE_FIX.sql`** ← Start here! Just 3 commands
- **`DEBUG_DATABASE.sql`** ← Run this to see what's wrong
- **`STEP_BY_STEP.sql`** ← Complete setup script
- **`supabase/migrations/20260403000001_add_admin_role.sql`** ← Full migration

---

## Still Not Working?

If none of the above works, please check:

1. **Are you connected to the right database?**
   - Check your Supabase project name
   - Verify you're in the correct project

2. **Do you have the right permissions?**
   - You need to be the project owner or have admin access
   - Check Settings → Database → Roles

3. **Is the table in a different schema?**
   - Try: `ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';`
   - Or: Check what schema your users table is in

4. **Database connection issues?**
   - Try refreshing the Supabase dashboard
   - Close and reopen the SQL Editor
   - Check if Supabase is having any outages

---

## After It Works

Once the role column is added and you're an admin:

1. Sign out of your app
2. Sign in again
3. Go to `/admin` or click "Admin Dashboard" in the navbar
4. You should see the admin dashboard with all users

Then go to `/admin/settings` to enable Polar payment gateway!
