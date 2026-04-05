# Admin Dashboard & Payment Gateway Management

## What's New

Your app now includes:

1. **Admin Dashboard** (`/admin`)
   - View all registered users
   - See total users, active subscriptions, and revenue stats
   - Monitor user subscription status
   - View user roles and registration dates

2. **Admin Settings** (`/admin/settings`)
   - Enable/disable payment gateways (Stripe, KPay, Polar)
   - View configuration status for each gateway
   - See required environment variables

3. **Role-Based Access Control**
   - Admin role system added to users table
   - Only admins can access `/admin` routes
   - Admin link appears in navbar for admin users only

## Quick Setup (3 Steps)

### Step 1: Run the Database Migration

Open your Supabase Dashboard → SQL Editor and paste the contents of:
`supabase/migrations/20260403000001_add_admin_role.sql`

Or if you have Supabase CLI:
```bash
supabase db push
```

### Step 2: Make Yourself an Admin

In Supabase SQL Editor, run:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

(Replace with your actual email)

### Step 3: Access Admin Dashboard

1. Sign in to your app
2. Click your profile icon in the navbar
3. You'll see "Admin Dashboard" option
4. Or navigate directly to `/admin`

## Features in Detail

### Admin Dashboard (`/admin`)

**Statistics Cards:**
- Total Users: Count of all registered users
- Active Subscriptions: Users with active subscription status
- Total Revenue: Sum of all completed transactions

**Users Table:**
- Email address
- Name
- Role (admin/user badge)
- Subscription status (active/inactive badge)
- Registration date

### Admin Settings (`/admin/settings`)

**Payment Gateway Management:**

Each gateway shows:
- Name (Stripe, KPay, Polar)
- Description of what it does
- Configuration status (Configured/Not configured)
- Enable/disable toggle

**Your Current Setup:**

✅ **Stripe** - Configured & Enabled
- For credit card payments worldwide
- Environment variables present

✅ **KPay** - Configured & Enabled
- For Rwanda Mobile Money payments
- Environment variables present

✅ **Polar** - Configured but Disabled
- For subscription management
- Environment variables present
- **Just toggle it ON to enable!**

**Environment Variables Reference:**
The settings page shows which env vars are needed for each gateway.

## Enabling Polar

Since you already have Polar credentials in `.env.local`:

1. Go to `/admin/settings`
2. Find the "Polar" section
3. Toggle the switch to ON
4. That's it! Polar is now enabled

The system will automatically use these env vars:
- `POLAR_API_KEY`
- `POLAR_ORGANIZATION_ID`
- `POLAR_WEBHOOK_SECRET`
- `POLAR_CHECKOUT_URL`

## Security Features

- **Row Level Security (RLS)**: All admin tables are protected
- **Role Checking**: Admin routes verify user role on every request
- **Auto-Redirect**: Non-admin users are sent to `/dashboard`
- **Secure Policies**: Only admins can view/modify payment settings

## Database Schema Changes

### New Column: `users.role`
- Type: TEXT
- Default: 'user'
- Values: 'user' | 'admin'
- Indexed for fast lookups

### New Table: `payment_gateway_settings`
```sql
- id: UUID (primary key)
- gateway_name: TEXT (unique)
- is_enabled: BOOLEAN
- config: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Usage Examples

### Check if a user is admin (in your code):
```typescript
const { data } = await supabase
  .from("users")
  .select("role")
  .eq("id", userId)
  .single();

const isAdmin = data?.role === "admin";
```

### Get enabled payment gateways:
```typescript
const { data } = await supabase
  .from("payment_gateway_settings")
  .select("*")
  .eq("is_enabled", true);
```

### Make another user an admin:
```sql
UPDATE users 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

## Troubleshooting

**Can't access admin dashboard?**
1. Verify migration ran: Check `payment_gateway_settings` table exists
2. Check your role: `SELECT role FROM users WHERE email = 'your-email'`
3. Clear browser cache and sign in again
4. Check browser console for errors

**Payment gateway not working?**
1. Verify env vars are set in `.env.local`
2. Restart your Next.js dev server: `npm run dev`
3. Check gateway is enabled in `/admin/settings`
4. Check Supabase logs for errors

**Admin link not showing in navbar?**
1. Sign out and sign in again
2. Check your role in database
3. Hard refresh the page (Ctrl+Shift+R)

## Next Steps

1. ✅ Run the migration
2. ✅ Make yourself admin
3. ✅ Access `/admin` dashboard
4. ✅ Enable Polar in `/admin/settings`
5. Test payment flows with each gateway
6. Monitor user subscriptions
7. Add more admins as needed

## Files Created/Modified

**New Files:**
- `src/app/admin/page.tsx` - Admin dashboard
- `src/app/admin/settings/page.tsx` - Payment gateway settings
- `src/components/ui/table.tsx` - Table component
- `supabase/migrations/20260403000001_add_admin_role.sql` - Database migration
- `ADMIN_SETUP_GUIDE.md` - Setup instructions
- `MAKE_ADMIN.sql` - Quick SQL to make user admin
- `ADMIN_FEATURES.md` - This file

**Modified Files:**
- `src/components/dashboard-navbar.tsx` - Added admin link for admin users

## Support

If you need help:
1. Check the troubleshooting section above
2. Review the setup guide: `ADMIN_SETUP_GUIDE.md`
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly
