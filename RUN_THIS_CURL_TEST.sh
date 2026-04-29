#!/bin/bash

# Test AI Access for stokeoriginal@gmail.com
# You need to provide the user's password

# ============================================
# STEP 1: Set the password
# ============================================
echo "Enter password for stokeoriginal@gmail.com:"
read -s USER_PASSWORD

if [ -z "$USER_PASSWORD" ]; then
  echo "❌ Password is required"
  exit 1
fi

# ============================================
# STEP 2: Authenticate
# ============================================
echo ""
echo "🔐 Authenticating user..."

AUTH_RESPONSE=$(curl -s -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"stokeoriginal@gmail.com\",\"password\":\"${USER_PASSWORD}\"}")

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "Response:"
  echo "$AUTH_RESPONSE"
  echo ""
  echo "⚠️  jq not installed. Install it for better output: sudo apt install jq"
  echo ""
  echo "Please extract the access_token manually and run:"
  echo "curl -X POST \"https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/supabase-functions-generate-ai-goal\" \\"
  echo "  -H \"Authorization: Bearer YOUR_ACCESS_TOKEN\" \\"
  echo "  -H \"apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc\" \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '{\"prompt\":\"I want to learn Spanish\",\"difficulty\":\"medium\"}'"
  exit 1
fi

# Extract access token
ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Authentication failed"
  echo "Response:"
  echo "$AUTH_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Authenticated successfully"
echo "Token: ${ACCESS_TOKEN:0:30}..."

# ============================================
# STEP 3: Test AI Goal Creation
# ============================================
echo ""
echo "🤖 Testing AI goal creation..."

AI_RESPONSE=$(curl -s -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/supabase-functions-generate-ai-goal" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"I want to learn Spanish in 3 months","difficulty":"medium"}')

echo ""
echo "📋 Response:"
echo "$AI_RESPONSE" | jq '.'

# ============================================
# STEP 4: Analyze Response
# ============================================
echo ""
echo "🔍 Analysis:"
echo "============================================"

ERROR=$(echo "$AI_RESPONSE" | jq -r '.error // empty')
REQUIRES_SUB=$(echo "$AI_RESPONSE" | jq -r '.requiresSubscription // empty')
TITLE=$(echo "$AI_RESPONSE" | jq -r '.title // empty')
MILESTONE_COUNT=$(echo "$AI_RESPONSE" | jq '.milestones | length' 2>/dev/null || echo "0")

if [ ! -z "$ERROR" ]; then
  echo "❌ ERROR FOUND: $ERROR"
  echo ""
  
  if [ "$REQUIRES_SUB" = "true" ]; then
    echo "🔍 DIAGNOSIS: Subscription check failed"
    echo ""
    echo "💡 ROOT CAUSE:"
    echo "   The Edge Function couldn't find an active subscription."
    echo "   This is most likely due to TYPE MISMATCH:"
    echo "   - users.id is UUID"
    echo "   - subscriptions.user_id is TEXT"
    echo "   - They can't be joined, so subscription check fails"
    echo ""
    echo "✅ SOLUTION:"
    echo "   Run FIX_STEP_BY_STEP.sql in Supabase SQL Editor"
    echo "   This will convert subscriptions.user_id from TEXT to UUID"
    echo ""
  else
    echo "💡 Other possible causes:"
    echo "   - AI disabled in admin settings"
    echo "   - API key not configured"
    echo "   - User has no active subscription"
    echo ""
    echo "✅ NEXT STEPS:"
    echo "   Run DIAGNOSE_WHY_NO_AI_ACCESS.sql to find exact issue"
  fi
  
elif [ ! -z "$TITLE" ]; then
  echo "✅ SUCCESS: AI goal created!"
  echo ""
  echo "📝 Title: $TITLE"
  echo "📊 Milestones: $MILESTONE_COUNT"
  echo ""
  
  # Check if milestones are generic (fallback) or specific (real AI)
  FIRST_MILESTONE=$(echo "$AI_RESPONSE" | jq -r '.milestones[0].title // empty')
  
  if [[ "$FIRST_MILESTONE" == *"Step"* ]] || [[ "$FIRST_MILESTONE" == *"Milestone"* ]]; then
    echo "⚠️  WARNING: Milestones look generic (fallback mode)"
    echo "   First milestone: $FIRST_MILESTONE"
    echo ""
    echo "💡 This means:"
    echo "   - AI is disabled OR"
    echo "   - API key is not configured OR"
    echo "   - API call failed"
    echo ""
    echo "✅ SOLUTION:"
    echo "   1. Check AI settings: SELECT * FROM ai_settings;"
    echo "   2. Enable AI in /admin/settings"
    echo "   3. Verify API key is set in environment variables"
  else
    echo "✅ Milestones look specific and relevant!"
    echo "   First milestone: $FIRST_MILESTONE"
    echo ""
    echo "🎉 AI goal creation is working correctly!"
  fi
else
  echo "⚠️  Unexpected response format"
  echo "   Could not determine success or failure"
fi

echo ""
echo "============================================"
echo "TEST COMPLETE"
echo "============================================"
