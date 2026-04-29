#!/bin/bash
# Quick AI Access Test - Run with: bash quick-test-ai.sh YOUR_PASSWORD

if [ -z "$1" ]; then
    echo "Usage: bash quick-test-ai.sh YOUR_PASSWORD"
    exit 1
fi

USER_PASSWORD="$1"

echo "🔐 Authenticating..."
AUTH_RESPONSE=$(curl -s -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"stokeoriginal@gmail.com\",\"password\":\"$USER_PASSWORD\"}")

ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Auth failed: $AUTH_RESPONSE"
    exit 1
fi

echo "✅ Authenticated"
echo ""
echo "🤖 Testing AI goal creation..."
echo ""

curl -X POST "https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/supabase-functions-generate-ai-goal" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Learn Spanish in 3 months","difficulty":"medium"}'

echo ""
echo ""
echo "============================================"
echo "If you see 'requiresSubscription: true', the type mismatch is blocking access."
echo "Run FIX_STEP_BY_STEP.sql in Supabase to fix it."
echo "============================================"
