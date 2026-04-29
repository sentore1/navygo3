#!/bin/bash

# Test AI Goal Creation for stokeoriginal@gmail.com using curl
# This will show exactly what error the Edge Function returns

# ============================================
# CONFIGURATION
# ============================================
SUPABASE_URL="YOUR_SUPABASE_URL"  # e.g., https://xxxxx.supabase.co
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
USER_EMAIL="stokeoriginal@gmail.com"
USER_PASSWORD="USER_PASSWORD"  # You'll need this

# ============================================
# STEP 1: Get User Auth Token
# ============================================
echo "Step 1: Authenticating user..."

AUTH_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${USER_EMAIL}\",
    \"password\": \"${USER_PASSWORD}\"
  }")

echo "Auth Response:"
echo "$AUTH_RESPONSE" | jq '.'

# Extract access token
ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to authenticate. Check email/password."
  exit 1
fi

echo "✅ Authenticated successfully"
echo "Access Token: ${ACCESS_TOKEN:0:20}..."

# ============================================
# STEP 2: Call AI Goal Creation Function
# ============================================
echo ""
echo "Step 2: Testing AI goal creation..."

AI_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/supabase-functions-generate-ai-goal" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to learn Spanish in 3 months",
    "difficulty": "medium"
  }')

echo "AI Function Response:"
echo "$AI_RESPONSE" | jq '.'

# ============================================
# STEP 3: Analyze Response
# ============================================
echo ""
echo "Step 3: Analysis..."

ERROR=$(echo "$AI_RESPONSE" | jq -r '.error // empty')
REQUIRES_SUB=$(echo "$AI_RESPONSE" | jq -r '.requiresSubscription // empty')
TITLE=$(echo "$AI_RESPONSE" | jq -r '.title // empty')

if [ ! -z "$ERROR" ]; then
  echo "❌ ERROR: $ERROR"
  
  if [ "$REQUIRES_SUB" = "true" ]; then
    echo "🔍 Reason: Subscription check failed"
    echo "💡 This means the Edge Function couldn't find an active subscription"
    echo "💡 Most likely cause: Type mismatch between users.id and subscriptions.user_id"
    echo "💡 Solution: Run FIX_STEP_BY_STEP.sql"
  fi
elif [ ! -z "$TITLE" ]; then
  echo "✅ SUCCESS: AI goal created"
  echo "Title: $TITLE"
  echo "Milestones: $(echo "$AI_RESPONSE" | jq '.milestones | length') found"
else
  echo "⚠️ Unexpected response format"
fi

echo ""
echo "============================================"
echo "DIAGNOSIS COMPLETE"
echo "============================================"
