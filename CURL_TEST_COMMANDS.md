# Curl Commands to Test AI Access

## Step 1: Get Your Supabase Credentials

From your `.env.local` or Supabase dashboard:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your anon/public key

## Step 2: Authenticate the User

Replace the placeholders and run:

```bash
curl -X POST "YOUR_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "stokeoriginal@gmail.com",
    "password": "USER_PASSWORD"
  }'
```

This will return:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {...}
}
```

Copy the `access_token` value.

## Step 3: Test AI Goal Creation

Replace `ACCESS_TOKEN` with the token from Step 2:

```bash
curl -X POST "YOUR_SUPABASE_URL/functions/v1/supabase-functions-generate-ai-goal" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to learn Spanish in 3 months",
    "difficulty": "medium"
  }'
```

## Expected Responses

### Success ✅
```json
{
  "title": "Learn Spanish in 3 Months",
  "description": "...",
  "milestones": [
    {
      "id": "...",
      "title": "Complete beginner course",
      "description": "...",
      "completed": false
    },
    ...
  ],
  "targetDate": "2026-05-07T..."
}
```

### No Subscription ❌
```json
{
  "error": "AI goal creation requires a Pro subscription",
  "requiresSubscription": true
}
```

**Diagnosis**: Subscription check failed
**Cause**: Type mismatch or no active subscription
**Solution**: Run `DIAGNOSE_WHY_NO_AI_ACCESS.sql` to find exact issue

### AI Disabled ❌
```json
{
  "title": "I want to learn Spanish in 3 months",
  "description": "Goal based on: ...",
  "milestones": [
    {
      "title": "Step 1: Get started with...",
      ...
    }
  ]
}
```

**Diagnosis**: AI is disabled or API key missing, using fallback
**Cause**: Admin disabled AI or API key not configured
**Solution**: Enable AI in `/admin/settings` or add API key

### Unauthorized ❌
```json
{
  "error": "Unauthorized"
}
```

**Diagnosis**: Authentication failed
**Cause**: Invalid or expired token
**Solution**: Re-authenticate (Step 2)

## Quick Test (All in One)

Replace all placeholders and run:

```bash
# Set variables
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
USER_EMAIL="stokeoriginal@gmail.com"
USER_PASSWORD="USER_PASSWORD"

# Authenticate
AUTH_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${USER_EMAIL}\",\"password\":\"${USER_PASSWORD}\"}")

# Extract token
ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token')

echo "Token: ${ACCESS_TOKEN:0:20}..."

# Test AI
curl -X POST "${SUPABASE_URL}/functions/v1/supabase-functions-generate-ai-goal" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to learn Spanish in 3 months",
    "difficulty": "medium"
  }' | jq '.'
```

## Interpreting Results

### If you see: "requiresSubscription": true
**Problem**: Edge Function can't find active subscription
**Most likely**: Type mismatch (users.id is UUID, subscriptions.user_id is TEXT)
**Fix**: Run `FIX_STEP_BY_STEP.sql`

### If you see: Generic milestones like "Step 1: Get started"
**Problem**: AI is disabled or API key missing
**Fix**: 
1. Check AI settings: Run `SELECT * FROM ai_settings;`
2. Enable AI in `/admin/settings`
3. Add API key to environment variables

### If you see: Specific, relevant milestones
**Success**: AI is working! User has access.

## Alternative: Use Supabase Dashboard

1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Click "supabase-functions-generate-ai-goal"
4. Click "Invoke"
5. Set Authorization header with user's token
6. Set body:
```json
{
  "prompt": "I want to learn Spanish",
  "difficulty": "medium"
}
```
7. Click "Invoke"
8. Check response

## What to Look For

The curl test will show you EXACTLY what error the Edge Function returns:

1. **"requiresSubscription": true** → Subscription check failed (type mismatch)
2. **Generic milestones** → AI disabled or API key missing
3. **"Unauthorized"** → Authentication issue
4. **Specific milestones** → Working correctly!

This tells you the exact problem without needing to check the database.
