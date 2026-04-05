# Leaderboard Feature Setup Guide

## What's New?

A public leaderboard system that motivates users by showing top performers. Users can opt-in to display their name and rank on the leaderboard.

## Features Added

1. **Privacy Settings** - Users control leaderboard visibility
2. **Landing Page Widget** - Top 10 users displayed on homepage
3. **Full Leaderboard Page** - Complete rankings at `/leaderboard`
4. **Auto Score Calculation** - Scores update automatically when goals/milestones change
5. **Admin SEO Management** - Manage meta tags and SEO settings
6. **Admin Analytics** - Track user activity and conversions

## Setup Steps

### 1. Run Database Migrations

```bash
# Apply both migrations
supabase db push

# Or if using SQL directly, run in order:
# 1. Leaderboard features
psql -h your-db-host -U postgres -d your-db -f supabase/migrations/20260404000001_add_leaderboard_features.sql

# 2. SEO and admin tables
psql -h your-db-host -U postgres -d your-db -f supabase/migrations/20260404000002_create_seo_tables.sql
```

### 2. Initialize Existing User Scores

```bash
# Run the initialization script
psql -h your-db-host -U postgres -d your-db -f INITIALIZE_LEADERBOARD.sql
```

### 3. Test the Feature

1. Go to Settings → Privacy tab
2. Enable "Show on Leaderboard"
3. Complete some goals to increase your score
4. Visit `/leaderboard` to see rankings
5. Check the homepage for the leaderboard widget
6. Admin users can access `/admin/seo` for SEO management

## How Scoring Works

- **Completed Goal**: 100 points
- **Completed Milestone**: 20 points each
- **Daily Streak**: 5 points per day

## Rank Progression

| Rank | Score Required | Badge |
|------|---------------|-------|
| Recruit | 0 | Circle |
| Private | 150 | 1 Chevron |
| Corporal | 300 | 3 Chevrons |
| Sergeant | 600 | 1 Star |
| Lieutenant | 1000 | 2 Stars |
| Captain | 2000 | 3 Stars |
| Major | 3500 | 4 Stars |
| General | 5000 | 5 Stars |

## What's Displayed on Leaderboard?

**Public Info:**
- User's name
- Rank badge
- Total score
- Number of completed goals
- Max streak

**Never Shown:**
- Email address
- Personal details
- Private goals
- Subscription status

## Database Schema

### New Columns in `users` table:
- `show_on_leaderboard` (boolean) - Privacy setting
- `total_score` (integer) - Calculated score
- `rank_title` (text) - Current rank name

### New View:
- `leaderboard_view` - Optimized query for public leaderboard data

### New Function:
- `update_user_score(user_uuid)` - Recalculates user score

### Triggers:
- Auto-updates scores when goals or milestones change

## Files Modified/Created

### Database:
- `supabase/migrations/20260404000001_add_leaderboard_features.sql`
- `INITIALIZE_LEADERBOARD.sql`

### Components:
- `src/components/leaderboard-section.tsx` (new)
- `src/app/leaderboard/page.tsx` (new)
- `src/app/settings/page.tsx` (modified - added Privacy tab)
- `src/app/page.tsx` (modified - added leaderboard section)

## Troubleshooting

### Scores not updating?
```sql
-- Manually trigger score update for a user
SELECT public.update_user_score('user-uuid-here');
```

### Leaderboard empty?
- Users must opt-in via Settings → Privacy
- Users need completed goals to have scores > 0

### View not working?
```sql
-- Refresh the view
DROP VIEW IF EXISTS public.leaderboard_view;
-- Then re-run the migration
```

## Future Enhancements

Consider adding:
- Weekly/monthly leaderboards
- Category-specific rankings (fitness, career, etc.)
- Team leaderboards
- Achievement badges for top performers
- Leaderboard position history/trends
