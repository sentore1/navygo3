# Visitor Tracking & Analytics Setup

## Features Added

Track every visitor to your website with detailed analytics:

1. **Real-time Visitor Tracking** - See who's visiting your site
2. **Geolocation Data** - Country, city, and coordinates
3. **Device Analytics** - Mobile, tablet, or desktop
4. **Browser & OS Detection** - Know what your visitors use
5. **Time on Page** - Track engagement
6. **Popular Pages** - See which pages get the most traffic
7. **Country Statistics** - Geographic distribution
8. **Session Tracking** - Unique visitor identification

## Setup Steps

### 1. Run Database Migration

```bash
# Apply the visitor tracking migration
supabase db push

# Or manually:
psql -h your-db-host -U postgres -d your-db -f supabase/migrations/20260404000003_create_visitor_tracking.sql
```

### 2. Visitor Tracker is Already Added

The `VisitorTracker` component has been added to your root layout (`src/app/layout.tsx`), so it will automatically track all page views across your entire site.

### 3. Access Analytics

Visit the admin dashboard:
- Go to `/admin`
- Click the "Visitors" button
- View analytics at `/admin/visitors`

## What Gets Tracked

### Automatic Data Collection:
- Page URL and title
- Referrer (where they came from)
- Device type (mobile/tablet/desktop)
- Browser and OS
- Time spent on each page
- Session ID (unique per visitor)
- User ID (if logged in)

### Geolocation Data (via IP):
- IP address
- Country and country code
- Region/state
- City
- Latitude/longitude
- Timezone

## Privacy & GDPR Compliance

### Important Notes:

1. **IP Addresses**: The system stores IP addresses for geolocation. Consider:
   - Adding a privacy policy
   - Getting user consent (cookie banner)
   - Anonymizing IPs after geolocation lookup

2. **Data Retention**: By default, all data is kept forever. To comply with GDPR:
   ```sql
   -- Clean up data older than 90 days
   SELECT public.cleanup_old_analytics(90);
   ```

3. **User Rights**: Users can request their data deletion:
   ```sql
   -- Delete specific user's tracking data
   DELETE FROM visitor_analytics WHERE user_id = 'user-uuid-here';
   ```

### Recommended Privacy Policy Addition:

```
We collect anonymous analytics data including:
- Pages you visit
- Time spent on pages
- Your approximate location (country/city)
- Device and browser information

This data helps us improve our service. We do not sell or share this data with third parties.
```

## How It Works

### 1. Session Tracking
- Each visitor gets a unique session ID
- Stored in sessionStorage (cleared when browser closes)
- Tracks unique visitors vs. total page views

### 2. Geolocation
- Uses free ipapi.co API for IP geolocation
- Runs client-side (no server needed)
- Falls back gracefully if API fails

### 3. Time Tracking
- Starts timer when page loads
- Updates database when user leaves page
- Tracks engagement per page

## Admin Analytics Views

### Recent Visitors Tab
- Last 100 page views
- Location with country flags
- Device and browser info
- Time on page
- Timestamp

### By Country Tab
- Visitors grouped by country
- Unique visitors per country
- Total page views
- Average time on site

### Popular Pages Tab
- Most visited pages
- View counts
- Unique visitors per page
- Average time on page

## API Endpoints

The system uses these database views (no API routes needed):

- `unique_visitors_view` - Daily unique visitor counts
- `visitors_by_country_view` - Geographic statistics
- `popular_pages_view` - Page popularity rankings
- `device_analytics_view` - Device/browser breakdown

## Performance Considerations

### Database Size
- Each page view = 1 row in `visitor_analytics`
- Estimate: ~1KB per row
- 10,000 page views/month = ~10MB/month

### Cleanup Strategy
```sql
-- Run monthly to keep last 90 days
SELECT public.cleanup_old_analytics(90);

-- Or set up a cron job (if using Supabase)
-- Database → Cron Jobs → Add new job
-- Schedule: 0 0 1 * * (monthly)
-- SQL: SELECT public.cleanup_old_analytics(90);
```

## Customization

### Disable Tracking for Specific Pages

Edit `src/components/visitor-tracker.tsx`:

```typescript
const trackPageView = async () => {
  // Don't track admin pages
  if (pathname.startsWith('/admin')) return;
  
  // Don't track settings pages
  if (pathname.startsWith('/settings')) return;
  
  // ... rest of tracking code
};
```

### Change Geolocation Provider

Replace ipapi.co with another service:

```typescript
const getGeolocation = async () => {
  // Option 1: ipinfo.io
  const response = await fetch("https://ipinfo.io/json");
  
  // Option 2: ip-api.com
  const response = await fetch("http://ip-api.com/json/");
  
  // Option 3: Your own backend
  const response = await fetch("/api/geolocation");
};
```

## Troubleshooting

### No Data Showing Up?

1. Check if migration ran:
   ```sql
   SELECT * FROM visitor_analytics LIMIT 1;
   ```

2. Check browser console for errors

3. Verify VisitorTracker is in layout.tsx

4. Check RLS policies allow inserts

### Geolocation Not Working?

1. ipapi.co has rate limits (free tier: 1000 requests/day)
2. Check browser console for API errors
3. Consider using a different geolocation service
4. Or implement server-side geolocation

### Performance Issues?

1. Add indexes (already included in migration)
2. Clean up old data regularly
3. Consider archiving old analytics
4. Use database views for aggregated queries

## Security

### What's Protected:
✅ Only admins can view analytics (RLS policy)
✅ Anyone can insert tracking data (needed for tracking)
✅ IP addresses stored but not exposed in UI
✅ User IDs linked but privacy-respecting

### What to Consider:
⚠️ Add cookie consent banner
⚠️ Update privacy policy
⚠️ Implement data retention policy
⚠️ Allow users to opt-out
⚠️ Anonymize IPs after geolocation

## Next Steps

1. Run the migration
2. Visit your site to generate test data
3. Check `/admin/visitors` to see analytics
4. Add privacy policy
5. Set up data cleanup cron job
6. Consider adding cookie consent banner
