# Fix Avatar Generation Issue

## Problem
When clicking "Generate Avatar" on the settings page, the avatar appears temporarily but disappears after refresh. The avatar is not being saved to the database.

## Root Causes
1. **Missing UPDATE policy**: The users table only had a SELECT policy, no UPDATE policy for RLS
2. **Policy mismatch**: The policy was checking `user_id` (text) but the code was using `id` (UUID)
3. **User might not exist**: New users might not have a row in the users table yet
4. **Silent errors**: Errors were being caught but not properly displayed

## Solution

### Step 1: Run the SQL Fix
Open Supabase SQL Editor and run the file: `FIX_AVATAR_SAVE_ISSUE.sql`

This will:
- Create proper RLS policies for SELECT, UPDATE, and INSERT
- Support both `id` (UUID) and `user_id` (text) columns
- Add missing columns (`display_name`, `show_on_leaderboard`)
- Set up auto-updating timestamps
- Verify the configuration

### Step 2: Test the Fix
1. Go to Settings page
2. Click "Generate Avatar" or select an avatar style
3. Check browser console for "Avatar saved successfully!" message
4. Refresh the page - avatar should persist

### Step 3: If Still Not Working
If you see an error message, it will now show the specific issue:
- Check the browser console for detailed error messages
- Run this query in Supabase to check your user exists:
  ```sql
  SELECT id, user_id, email, avatar_url 
  FROM public.users 
  WHERE id = auth.uid();
  ```
- Verify RLS is enabled and policies are correct:
  ```sql
  SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
  ```

## What Changed in the Code
The settings page now:
1. Checks if user exists before updating
2. Inserts a new user row if needed
3. Shows detailed error messages with instructions
4. Logs success to console
5. Updates local state immediately for better UX

## Testing
After running the SQL fix:
- Generate Avatar button should work
- Avatar style picker should work
- Avatar should persist after page refresh
- No errors in console
