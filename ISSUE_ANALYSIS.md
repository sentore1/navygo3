# Goal and Milestone Issues - Analysis & Solutions

## Problems Identified

### 1. Data Structure Inconsistency
- **Issue**: Two different milestone storage systems exist:
  - `milestones` table (relational)
  - `milestones` JSONB column in goals table
- **Impact**: Create and toggle operations use different storage methods

### 2. Create Goal Function
- **File**: `supabase/functions/create-goal/index.ts`
- **Issue**: Correctly inserts milestones into the `milestones` table
- **Status**: ✅ Working correctly

### 3. Get Goals Function
- **File**: `supabase/functions/get-goals/index.ts`
- **Issue**: Fetches from `milestones` table using `.select("*, milestones(*)")`
- **Status**: ✅ Working correctly

### 4. Toggle Milestone Function
- **File**: `supabase/functions/toggle-milestone/index.ts`
- **Issue**: ❌ Tries to update JSONB `milestones` column instead of the `milestones` table
- **Impact**: Milestone toggles fail because it's looking for wrong data structure

### 5. Goal Dashboard Toggle
- **File**: `src/components/goal-dashboard.tsx`
- **Issue**: ⚠️ Directly updates `milestones` table, which is correct, but doesn't use the edge function
- **Impact**: May work but bypasses the trigger that updates progress

## Solutions

### Option 1: Use Milestones Table (Recommended)
This is the proper relational database approach and matches the existing schema.

**Changes needed:**
1. Fix `toggle-milestone` function to update the `milestones` table
2. Ensure the trigger `update_goal_progress()` works correctly
3. Remove the JSONB `milestones` column (optional cleanup)

### Option 2: Use JSONB Column
Less recommended but simpler for small datasets.

**Changes needed:**
1. Modify `create-goal` to store milestones in JSONB column
2. Modify `get-goals` to read from JSONB column
3. Keep `toggle-milestone` as is
4. Drop the `milestones` table

## Recommended Fix: Option 1

### Step 1: Fix toggle-milestone function
Update to work with the `milestones` table instead of JSONB.

### Step 2: Verify database trigger
Ensure the `update_goal_progress()` trigger is working.

### Step 3: Test the flow
1. Create a goal with milestones
2. Toggle milestone completion
3. Verify progress updates automatically
