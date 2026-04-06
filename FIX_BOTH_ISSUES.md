# Fix Goal Creation and CORS Issues

## Issue 1: Goal Creation Failing (400 Error)

The edge function is working correctly now, but you need to run the database migration.

### Solution:
Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;
```

Or simply run the file: `FIX_GOALS_TABLE_STRUCTURE.sql`

## Issue 2: CORS Error with ipapi.co

The geolocation API is being blocked by CORS in development.

### Solution Applied:
Updated `visitor-tracker.tsx` to:
- Skip external geolocation API in development
- Use timezone as fallback location indicator
- Only attempt external API in production

### Alternative Solution (Better):
Create a Supabase Edge Function to proxy the geolocation request:

1. Create `supabase/functions/get-geolocation/index.ts`
2. Call this function from your visitor tracker instead of calling ipapi.co directly
3. This avoids CORS issues entirely

## Quick Test:
1. Run the SQL fix above
2. Refresh your app
3. Try creating a goal - it should work now
4. The CORS error will only appear in development and won't block functionality
