#!/bin/bash
# Test AI Access for stokeoriginal@gmail.com
# Bash version for Windows Git Bash

echo ""
echo "🔐 Testing AI Access for stokeoriginal@gmail.com"
echo "============================================"
echo ""

# Prompt for password
read -sp "Enter password for stokeoriginal@gmail.com: " USER_PASSWORD
echo ""

if [ -z "$USER_PASSWORD" ]; then
    echo "❌ Password is required"
    exit 1
fi

# Authenticate
echo ""
echo "🔐 Authenticating user..."

AUTH_RESPONSE=$(curl -s -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"stokeoriginal@gmail.com\",\"password\":\"$USER_PASSWORD\"}")

# Extract access token
ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Authentication failed"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

echo "✅ Authenticated successfully"
echo "Token: ${ACCESS_TOKEN:0:30}..."

# Test AI Goal Creation
echo ""
echo "🤖 Testing AI goal creation..."
echo ""

AI_RESPONSE=$(curl -s -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/supabase-functions-generate-ai-goal" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"I want to learn Spanish in 3 months","difficulty":"medium"}')

echo "📋 Response:"
echo "$AI_RESPONSE" | python -m json.tool 2>/dev/null || echo "$AI_RESPONSE"

# Analyze response
echo ""
echo "🔍 Analysis:"
echo "============================================"

if echo "$AI_RESPONSE" | grep -q '"error"'; then
    ERROR_MSG=$(echo $AI_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    echo "❌ ERROR FOUND: $ERROR_MSG"
    echo ""
    
    if echo "$AI_RESPONSE" | grep -q '"requiresSubscription":true'; then
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
    fi
elif echo "$AI_RESPONSE" | grep -q '"title"'; then
    echo "✅ SUCCESS: AI goal created!"
    echo ""
    
    TITLE=$(echo $AI_RESPONSE | grep -o '"title":"[^"]*' | cut -d'"' -f4)
    echo "📝 Title: $TITLE"
    
    MILESTONE_COUNT=$(echo $AI_RESPONSE | grep -o '"title"' | wc -l)
    echo "📊 Milestones: $((MILESTONE_COUNT - 1))"
    echo ""
    
    FIRST_MILESTONE=$(echo $AI_RESPONSE | grep -o '"milestones":\[{"[^}]*' | grep -o '"title":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if echo "$FIRST_MILESTONE" | grep -qE "Step|Milestone"; then
        echo "⚠️  WARNING: Milestones look generic (fallback mode)"
        echo "   First milestone: $FIRST_MILESTONE"
        echo ""
        echo "💡 This means AI is disabled or API key not configured"
    else
        echo "✅ Milestones look specific and relevant!"
        echo "   First milestone: $FIRST_MILESTONE"
        echo ""
        echo "🎉 AI goal creation is working correctly!"
    fi
fi

echo ""
echo "============================================"
echo "TEST COMPLETE"
echo "============================================"
