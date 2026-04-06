#!/bin/bash

# Deploy the updated create-goal edge function to Supabase

echo "Deploying supabase-functions-create-goal edge function..."

supabase functions deploy supabase-functions-create-goal

echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Run FIX_GOALS_TABLE_STRUCTURE.sql in Supabase SQL Editor"
echo "2. Test creating a goal"
