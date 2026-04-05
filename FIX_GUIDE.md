# Goal & Milestone Fix Guide

## Issues Fixed

### 1. ✅ Toggle Milestone Function
**File**: `supabase/functions/toggle-milestone/index.ts`
- Changed from updating JSONB column to updating the `milestones` table
- Now properly updates the `completed` and `completed_at` fields
- Database trigger automatically updates goal progress

### 2. ✅ Goal Dashboard
**File**: `src/components/goal-dashboard.tsx`
- Fixed milestone data transformation to handle relational data
- Changed toggle function to use edge function instead of direct DB calls
- Ensures consistency across the application

### 3. ✅ Database Migration
**File**: `supabase/migrations/20250106000001_fix_milestone_system.sql`
- Improved the `update_goal_progress()` trigger function
- Added proper indexes for performance
- Ensures progress calculation works correctly

## How to Apply the Fixes

### Step 1: Apply Database Migration
```bash
cd supabase
npx supabase db push
```

Or if using Supabase CLI:
```bash
supabase migration up
```

### Step 2: Redeploy Edge Functions
```bash
# Deploy the fixed toggle-milestone function
npx supabase functions deploy toggle-milestone

# Or deploy all functions
npx supabase functions deploy
```

### Step 3: Test the Flow

1. **Create a Goal with Milestones**
   - Go to dashboard
   - Click "New Goal"
   - Add title, description, and at least 2 milestones
   - Submit

2. **Verify Goal Creation**
   - Check that the goal appears in the dashboard
   - Verify milestones are visible
   - Progress should be 0%

3. **Toggle Milestones**
   - Click on a goal to view details
   - Check/uncheck milestones
   - Verify progress updates automatically
   - Check that the UI updates immediately

4. **Check Database**
   - Go to Supabase dashboard
   - Check `goals` table - progress should update
   - Check `milestones` table - completed status should change

## Verification Queries

Run these in Supabase SQL Editor to verify:

```sql
-- Check goals and their milestones
SELECT 
  g.id,
  g.title,
  g.progress,
  COUNT(m.id) as total_milestones,
  COUNT(m.id) FILTER (WHERE m.completed = true) as completed_milestones
FROM goals g
LEFT JOIN milestones m ON m.goal_id = g.id
GROUP BY g.id, g.title, g.progress;

-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'milestone_progress_update';

-- Test progress calculation manually
SELECT 
  goal_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE completed = true) as completed,
  ROUND((COUNT(*) FILTER (WHERE completed = true)::DECIMAL / COUNT(*)) * 100) as calculated_progress
FROM milestones
GROUP BY goal_id;
```

## Common Issues & Solutions

### Issue: Milestones not showing
**Solution**: Check if milestones are in the `milestones` table, not JSONB column
```sql
SELECT * FROM milestones WHERE goal_id = 'YOUR_GOAL_ID';
```

### Issue: Progress not updating
**Solution**: Verify the trigger is working
```sql
-- Manually trigger progress update
UPDATE milestones SET completed = completed WHERE goal_id = 'YOUR_GOAL_ID';
```

### Issue: 400 Error when toggling
**Solution**: Check edge function logs
```bash
npx supabase functions logs toggle-milestone
```

## Architecture Overview

```
User Action (Toggle Milestone)
    ↓
Goal Detail Component
    ↓
Edge Function: toggle-milestone
    ↓
Update milestones table
    ↓
Database Trigger: milestone_progress_update
    ↓
Update goals.progress automatically
    ↓
UI Refreshes with new data
```

## Data Flow

1. **Create Goal**: 
   - Frontend → create-goal function → Insert into goals table
   - Insert milestones into milestones table

2. **Fetch Goals**:
   - Frontend → get-goals function → SELECT with JOIN
   - Returns goals with nested milestones array

3. **Toggle Milestone**:
   - Frontend → toggle-milestone function → UPDATE milestones table
   - Trigger fires → UPDATE goals.progress
   - Frontend refreshes data

## Rollback Plan

If issues occur, you can rollback:

```sql
-- Rollback the migration
-- This will remove the new trigger and indexes
DROP TRIGGER IF EXISTS milestone_progress_update ON milestones;
DROP INDEX IF EXISTS idx_milestones_goal_id;
DROP INDEX IF EXISTS idx_milestones_completed;
```

Then redeploy the old version of toggle-milestone function.
