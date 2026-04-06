# Goal Creation Error Fix

## Problem
Getting "Edge Function returned a non-2xx status code" when creating new goals.

## Root Causes
1. The `goals` table is missing the `notes` and `target_date` columns
2. The edge function tries to insert these columns, causing a database error

## Solution

### Step 1: Fix the Database Schema
Run the SQL file `FIX_GOALS_TABLE_STRUCTURE.sql` in your Supabase SQL Editor to add the missing columns.

### Step 2: Check Edge Function Logs
To see the exact error:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → supabase-functions-create-goal
3. Click on "Logs" to see detailed error messages

### Step 3: Verify the Fix
After running the SQL:
1. Try creating a new goal
2. If it still fails, check the logs for the specific error
3. The error message will tell us exactly what's wrong

## Common Issues
- Missing columns in database
- RLS policies blocking inserts
- Invalid data types being sent
- Authentication issues
