#!/bin/bash

# Script to push to new GitHub repo without SQL files

echo "🚀 Push to New GitHub Repo"
echo "=========================="
echo ""
echo "New repo: https://github.com/sentore1/navygo3.git"
echo ""

# Step 1: Update .gitignore
echo "Step 1: Update .gitignore to exclude SQL files..."
echo "---------------------------------------------------"

if ! grep -q "^# SQL debug/test files" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# SQL debug/test files
*.sql
!supabase/**/*.sql
EOF
    echo "✅ Added SQL files to .gitignore"
else
    echo "✅ .gitignore already configured"
fi

# Step 2: Remove SQL files from Git tracking
echo ""
echo "Step 2: Remove SQL files from Git tracking..."
echo "----------------------------------------------"

git rm --cached *.sql 2>/dev/null && echo "✅ Removed SQL files from tracking" || echo "✅ No SQL files to remove"

# Step 3: Check current remote
echo ""
echo "Step 3: Update Git remote..."
echo "----------------------------"

CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)

if [ -n "$CURRENT_REMOTE" ]; then
    echo "Current remote: $CURRENT_REMOTE"
    echo "Updating to new repo..."
    git remote set-url origin https://github.com/sentore1/navygo3.git
else
    echo "Adding new remote..."
    git remote add origin https://github.com/sentore1/navygo3.git
fi

echo "✅ Remote updated to: https://github.com/sentore1/navygo3.git"

# Step 4: Stage and commit
echo ""
echo "Step 4: Commit changes..."
echo "-------------------------"

git add .gitignore
git add -A

git commit -m "Initial commit to new repo

- Excluded SQL debug files from tracking
- Added proper .gitignore rules
- Migration files in supabase/ are included
- Clean repository without debug files" || echo "✅ No changes to commit"

# Step 5: Push
echo ""
echo "Step 5: Push to GitHub..."
echo "-------------------------"
echo ""
echo "Pushing to: https://github.com/sentore1/navygo3.git"
echo ""

git branch -M main
git push -u origin main --force

echo ""
echo "✅ Done!"
echo ""
echo "🌐 Check your repo:"
echo "   https://github.com/sentore1/navygo3"
echo ""
echo "📋 What was pushed:"
echo "   ✅ All source code"
echo "   ✅ supabase/migrations/*.sql files"
echo "   ❌ Root directory *.sql files (excluded)"
echo ""
