# Curl Test Instructions for AI Access

## Quick Start

You asked to "run curl here" to test why stokeoriginal@gmail.com can't access AI goal creation.

### Option 1: Run the Bash Script (EASIEST)

```bash
bash quick-test-ai.sh YOUR_PASSWORD
```

Replace `YOUR_PASSWORD` with the actual password for stokeoriginal@gmail.com.

### Option 2: Manual Curl Commands

#### Step 1: Authenticate

```bash
curl -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d '{"email":"stokeoriginal@gmail.com","password":"YOUR_PASSWORD"}'
```

Copy the `access_token` from the response.

#### Step 2: Test AI Goal Creation

```bash
curl -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/supabase-functions-generate-ai-goal" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Learn Spanish in 3 months","difficulty":"medium"}'
```

Replace `YOUR_ACCESS_TOKEN` with the token from step 1.

## Expected Response (Current State)

If the type mismatch exists, you'll see:

```json
{
  "error": "AI goal creation requires a Pro subscription",
  "requiresSubscription": true
}
```

This means the Edge Function couldn't find the user's subscription because of the type mismatch.

## What This Proves

The curl test will show that:

1. ✅ User can authenticate successfully
2. ✅ Edge Function receives the request
3. ❌ Edge Function can't find the subscription (type mismatch)
4. ❌ User is denied access even if they have a subscription

## The Root Cause

The Edge Function runs this query:

```typescript
const { data: stripeData } = await supabaseClient
  .from("subscriptions")
  .select("count")
  .eq("user_id", user.id)  // user.id is UUID
  .eq("status", "active");
```

But `subscriptions.user_id` is TEXT, so the query fails silently and returns no results.

## The Fix

Run `FIX_STEP_BY_STEP.sql` to convert `subscriptions.user_id` from TEXT to UUID.

After the fix, the same curl test will return:

```json
{
  "title": "Learn Spanish in 3 months",
  "description": "...",
  "milestones": [...]
}
```

## Alternative: Check Without Password

If you don't have the password, run this SQL query instead:

```sql
-- Run SIMPLE_CHECK_TYPE_MISMATCH.sql
```

This will show:
- Whether type mismatch exists
- How many users are affected
- Whether stokeoriginal@gmail.com should have access

## Files Available

1. `quick-test-ai.sh` - Bash script for curl test
2. `test-ai-access.sh` - Interactive bash script (prompts for password)
3. `TEST_AI_ACCESS.ps1` - PowerShell version
4. `SIMPLE_CHECK_TYPE_MISMATCH.sql` - Check without password
5. `CHECK_STOKEORIGINAL_DETAILED.sql` - Detailed diagnostic
6. `FIX_STEP_BY_STEP.sql` - The fix

## Summary

To test with curl:
```bash
bash quick-test-ai.sh YOUR_PASSWORD
```

To check without password:
```sql
-- Run SIMPLE_CHECK_TYPE_MISMATCH.sql in Supabase
```

To fix:
```sql
-- Run FIX_STEP_BY_STEP.sql in Supabase (one statement at a time)
```

---

**The curl test will confirm that the type mismatch is blocking AI access for all Pro users.**
