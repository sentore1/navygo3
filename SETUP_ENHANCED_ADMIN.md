# Quick Setup - Enhanced Admin Dashboard

## ✅ Prerequisites

Before you start, make sure you have:
- [x] Supabase project set up
- [x] Admin role migration already run
- [x] At least one admin user created

## 🚀 Setup Steps (5 Minutes)

### Step 1: Run the Enhanced Features Migration

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- This migration is already in your project:
-- supabase/migrations/20260404000001_add_admin_features.sql
```

Or if you have Supabase CLI:

```bash
supabase db push
```

This adds:
- User blocking columns
- Analytics events table
- SEO settings table
- Admin activity log table
- RLS policies

### Step 2: Verify Tables Created

Check that these tables exist in Supabase:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'analytics_events',
  'admin_activity_log',
  'seo_settings'
);
```

Expected result: 3 rows

### Step 3: Test the Admin Dashboard

1. Sign in to your app as an admin user
2. Navigate to `/admin`
3. You should see the enhanced dashboard with 4 tabs

### Step 4: Test User Blocking

1. Go to Users tab
2. Click "Block" on a test user
3. Enter a reason
4. Confirm
5. Check Activity Log tab to see the action logged

### Step 5: Test Analytics

1. Go to Analytics tab
2. Select different time ranges
3. View metrics and top pages
4. Check revenue trend

## 🎯 Quick Test Checklist

- [ ] Admin dashboard loads
- [ ] All 4 tabs visible (Users, Analytics, Activity, SEO)
- [ ] User statistics show correct numbers
- [ ] Can search and filter users
- [ ] Can block/unblock users
- [ ] Activity log shows actions
- [ ] Analytics tab displays metrics
- [ ] SEO tab shows recommendations
- [ ] Export users to CSV works

## 🔧 Troubleshooting

### Issue: Tables not created

**Solution:**
```sql
-- Run the migration manually
-- Copy contents from: supabase/migrations/20260404000001_add_admin_features.sql
-- Paste into Supabase SQL Editor
-- Execute
```

### Issue: Can't access admin dashboard

**Solution:**
```sql
-- Verify you're an admin
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

-- If role is not 'admin', update it:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Issue: Analytics not showing

**Solution:**
```sql
-- Insert test analytics event
INSERT INTO analytics_events (event_type, page_url, event_data)
VALUES ('page_view', '/dashboard', '{}');

-- Refresh the Analytics tab
```

### Issue: Activity log empty

**Solution:**
- Perform an admin action (block/unblock a user)
- The action will be automatically logged
- Refresh the Activity Log tab

## 📊 Sample Data (Optional)

Want to test with sample data? Run this:

```sql
-- Insert sample analytics events
INSERT INTO analytics_events (event_type, page_url, event_data, created_at)
VALUES 
  ('page_view', '/dashboard', '{}', NOW() - INTERVAL '1 day'),
  ('page_view', '/pricing', '{}', NOW() - INTERVAL '2 days'),
  ('signup', '/sign-up', '{}', NOW() - INTERVAL '3 days'),
  ('page_view', '/', '{}', NOW() - INTERVAL '4 days'),
  ('subscription_created', '/checkout', '{}', NOW() - INTERVAL '5 days');

-- Insert sample SEO settings
INSERT INTO seo_settings (page_path, title, description, keywords)
VALUES 
  ('/', 'NavyGoal - Achieve Your Goals', 'Track and achieve your goals with AI-powered insights', ARRAY['goals', 'productivity']),
  ('/pricing', 'Pricing - NavyGoal', 'Choose the perfect plan', ARRAY['pricing', 'plans'])
ON CONFLICT (page_path) DO NOTHING;
```

## 🎨 Customization

### Change Color Scheme

Edit `src/app/admin/page.tsx` and modify the Badge variants:

```typescript
// Current: variant="destructive" for blocked users
// Change to: variant="secondary" for softer look
```

### Add More Metrics

Add custom metrics in the `loadStats` function:

```typescript
const loadStats = async () => {
  // Add your custom queries here
  const { data: customMetric } = await supabase
    .from('your_table')
    .select('*');
  
  setStats({
    ...stats,
    customMetric: customMetric?.length || 0
  });
};
```

### Customize Time Ranges

Edit the time range selector:

```typescript
<SelectItem value="1">Last 24 hours</SelectItem>
<SelectItem value="7">Last 7 days</SelectItem>
<SelectItem value="30">Last 30 days</SelectItem>
<SelectItem value="90">Last 90 days</SelectItem>
<SelectItem value="365">Last year</SelectItem>
<SelectItem value="all">All time</SelectItem>
```

## 📱 Mobile Testing

Test on mobile devices:

1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device
4. Navigate to `/admin`
5. Test all features

## 🔐 Security Checklist

- [ ] Only admin users can access `/admin`
- [ ] Non-admin users are redirected
- [ ] RLS policies are enabled
- [ ] Activity log tracks all actions
- [ ] Blocked users cannot access system
- [ ] Admin actions require authentication

## 📈 Next Steps

After setup:

1. **Monitor Analytics** - Check metrics daily
2. **Review Activity Log** - Weekly audit
3. **Optimize SEO** - Monthly updates
4. **Export Data** - Regular backups
5. **Train Team** - Share admin guide

## 🎓 Learn More

- **Full Documentation:** `ADMIN_ENHANCED_FEATURES.md`
- **Original Features:** `ADMIN_FEATURES.md`
- **Setup Guide:** `ADMIN_SETUP_GUIDE.md`

## ✅ Verification

Run this query to verify everything is set up:

```sql
-- Check all required tables exist
SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') as analytics_table,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_activity_log') as activity_table,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'seo_settings') as seo_table,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_blocked') as blocked_column,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') as login_column;
```

Expected result: All columns should be `true`

## 🎉 You're Done!

Your enhanced admin dashboard is ready to use!

Access it at: `https://your-domain.com/admin`

---

**Need help?** Check the troubleshooting section or review the full documentation.
