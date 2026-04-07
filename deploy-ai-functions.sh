#!/bin/bash

# Deploy AI goal generation functions with subscription checks
echo "Deploying AI goal generation functions..."

echo "1. Deploying supabase-functions-generate-ai-goal..."
supabase functions deploy supabase-functions-generate-ai-goal

echo "2. Deploying supabase-functions-openai-goal..."
supabase functions deploy supabase-functions-openai-goal

echo ""
echo "✅ All AI functions deployed successfully!"
echo ""
echo "These functions now include:"
echo "  - Admin role check"
echo "  - Active subscription verification (Stripe or Polar)"
echo "  - Trial access support"
echo ""
echo "Users without Pro access will see: 'AI goal creation requires a Pro subscription'"
