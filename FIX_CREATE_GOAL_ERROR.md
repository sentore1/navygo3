# Fix: "Edge Function returned a non-2xx status code"

## Problem
When creating a goal, you get the error: "Edge Function returned a non-2xx status code"

## Root Cause
The frontend is calling `supabase-functions-create-goal` but this Edge Function wasn't deployed to your Supabase project.

## Solution

### Option 1: Deploy the Edge Function (Recommended)

```bash
# Deploy the create-goal function
supabase functions deploy supabase-functions-create-goal
```

### Option 2: Use Local Development

If you're running locally:

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve
```

### Option 3: Check if Function is Deployed

```bash
# List all deployed functions
supabase functions list
```

## What I Fixed

1. ✅ Created the missing Edge Function file:
   - `supabase/functions/supabase-functions-create-goal/index.ts`

2. ✅ Added proper error logging to help debug issues

3. ✅ Function handles:
   - User authentication
   - Goal creation with title, description, targetDate
   - Milestone creation (if provided)
   - Proper error responses

## Test After Deploying

1. Deploy the function:
   ```bash
   supabase functions deploy supabase-functions-create-goal
   ```

2. Try creating a goal in your dashboard

3. If it still fails, check the logs:
   ```bash
   supabase functions logs supabase-functions-create-goal
   ```

## Alternative: Use Direct Database Insert

If you don't want to use Edge Functions, you can modify the frontend to insert directly:

```typescript
// In goal-dashboard.tsx, replace the Edge Function call with:
const { data: goal, error } = await supabase
  .from('goals')
  .insert({
    user_id: user.id,
    title: goalData.title,
    description: goalData.description,
    progress: 0,
    streak: 0,
  })
  .select()
  .single();
```

## Quick Fix (If Supabase CLI Not Available)

Go to your Supabase Dashboard:
1. Navigate to Edge Functions
2. Create new function: `supabase-functions-create-goal`
3. Copy the code from `supabase/functions/supabase-functions-create-goal/index.ts`
4. Deploy

---

**Status:** Function created locally, needs deployment to Supabase
