#!/bin/bash

# Script to help rotate exposed Supabase Service Role key
# Run this AFTER you've regenerated the key in Supabase Dashboard

echo "🔐 Supabase Service Role Key Rotation Helper"
echo "=============================================="
echo ""
echo "⚠️  IMPORTANT: Have you already regenerated the key in Supabase Dashboard?"
echo "   Go to: https://supabase.com/dashboard → Your Project → Settings → API"
echo "   Click 'Regenerate' next to Service Role Key"
echo ""
read -p "Have you regenerated the key? (yes/no): " regenerated

if [ "$regenerated" != "yes" ]; then
    echo "❌ Please regenerate the key in Supabase Dashboard first!"
    echo "   This will immediately invalidate the exposed key."
    exit 1
fi

echo ""
echo "📝 Step 1: Update .env.local"
echo "----------------------------"
read -p "Enter your NEW Supabase Service Role Key: " new_key

if [ -z "$new_key" ]; then
    echo "❌ No key provided. Exiting."
    exit 1
fi

# Backup existing .env.local
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "✅ Backed up existing .env.local to .env.local.backup"
fi

# Update or add the key
if grep -q "SUPABASE_SERVICE_KEY=" .env.local 2>/dev/null; then
    # Key exists, replace it
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$new_key|g" .env.local
    else
        # Linux/Windows Git Bash
        sed -i "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$new_key|g" .env.local
    fi
    echo "✅ Updated SUPABASE_SERVICE_KEY in .env.local"
else
    # Key doesn't exist, add it
    echo "" >> .env.local
    echo "SUPABASE_SERVICE_KEY=$new_key" >> .env.local
    echo "✅ Added SUPABASE_SERVICE_KEY to .env.local"
fi

echo ""
echo "📝 Step 2: Verify .gitignore"
echo "----------------------------"
if grep -q ".env*.local" .gitignore && grep -q ".env" .gitignore; then
    echo "✅ .env files are already in .gitignore"
else
    echo "⚠️  Adding .env files to .gitignore"
    echo "" >> .gitignore
    echo "# Environment variables" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env*.local" >> .gitignore
    echo "✅ Updated .gitignore"
fi

echo ""
echo "📝 Step 3: Check if .env.local is tracked by Git"
echo "------------------------------------------------"
if git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo "⚠️  .env.local IS tracked by Git!"
    echo ""
    read -p "Remove .env.local from Git tracking? (yes/no): " remove_tracking
    
    if [ "$remove_tracking" = "yes" ]; then
        git rm --cached .env.local
        echo "✅ Removed .env.local from Git tracking"
        echo "⚠️  You still need to remove it from Git history!"
    fi
else
    echo "✅ .env.local is not tracked by Git"
fi

echo ""
echo "📝 Step 4: Update Production Environment"
echo "----------------------------------------"
echo "You need to manually update your production environment variables:"
echo ""
echo "For Vercel:"
echo "  vercel env rm SUPABASE_SERVICE_KEY production"
echo "  vercel env add SUPABASE_SERVICE_KEY production"
echo ""
echo "For Netlify:"
echo "  Go to: Site Settings → Environment Variables"
echo "  Delete old SUPABASE_SERVICE_KEY and add new one"
echo ""
echo "For other platforms:"
echo "  Update in your hosting dashboard"
echo ""

echo "📝 Step 5: Remove from Git History (CRITICAL)"
echo "----------------------------------------------"
echo "The exposed key is still in your Git history!"
echo ""
echo "Option 1 - Using git-filter-repo (recommended):"
echo "  pip install git-filter-repo"
echo "  git filter-repo --path .env.local --invert-paths --force"
echo "  git push origin --force --all"
echo ""
echo "Option 2 - Using BFG Repo-Cleaner:"
echo "  Download from: https://rtyley.github.io/bfg-repo-cleaner/"
echo "  java -jar bfg.jar --delete-files .env.local"
echo "  git reflog expire --expire=now --all"
echo "  git gc --prune=now --aggressive"
echo "  git push origin --force --all"
echo ""
echo "⚠️  WARNING: These commands rewrite Git history!"
echo "   Make sure all team members are aware and re-clone the repo."
echo ""

echo "✅ Local environment updated!"
echo ""
echo "📋 Next Steps:"
echo "1. Update production environment variables"
echo "2. Remove .env.local from Git history (see options above)"
echo "3. Redeploy your application"
echo "4. Audit your database for suspicious activity"
echo ""
echo "📖 See FIX_EXPOSED_SUPABASE_KEY.md for detailed instructions"
