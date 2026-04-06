# Redeploy Edge Function

The edge function code has been updated, but you need to deploy it to Supabase.

## Steps:

### 1. Run the SQL Fix
Go to Supabase Dashboard → SQL Editor and run:
```sql
ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;
```

### 2. Deploy the Edge Function
Run this command in your terminal:
```bash
npx supabase functions deploy supabase-functions-create-goal
```

Or if you have Supabase CLI installed globally:
```bash
supabase functions deploy supabase-functions-create-goal
```

### 3. Test
Try creating a goal again. It should work now!

## If it still fails:
Check the edge function logs in Supabase Dashboard:
1. Go to Edge Functions
2. Click on `supabase-functions-create-goal`
3. Click "Logs" tab
4. Look for the error message

The logs will show you the exact database error.
