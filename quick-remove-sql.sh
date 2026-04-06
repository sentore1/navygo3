#!/bin/bash

# Quick script to remove SQL files from Git
# This is the FASTEST way to clean up

echo "🗑️  Quick SQL Cleanup"
echo "===================="
echo ""
echo "This will:"
echo "  1. Add *.sql to .gitignore (except supabase/migrations)"
echo "  2. Remove all root SQL files from Git tracking"
echo "  3. Commit the changes"
echo "  4. Files stay on your computer"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "Step 1: Update .gitignore..."

# Check if already in .gitignore
if ! grep -q "^# SQL debug/test files" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# SQL debug/test files
*.sql
!supabase/**/*.sql
EOF
    echo "✅ Updated .gitignore"
else
    echo "✅ .gitignore already configured"
fi

echo ""
echo "Step 2: Remove SQL files from Git..."

# Remove all .sql files from root directory
git rm --cached *.sql 2>/dev/null

echo "✅ Removed from Git tracking"

echo ""
echo "Step 3: Commit changes..."

git add .gitignore
git commit -m "Remove SQL debug files from Git tracking

- Added *.sql to .gitignore (excluding supabase/migrations)
- Removed 77 SQL debug files from tracking
- Files kept locally for reference"

echo "✅ Committed"

echo ""
echo "Step 4: Push to GitHub..."
echo ""
echo "Run this command:"
echo "  git push origin main"
echo ""
echo "Or if your branch is different:"
echo "  git push origin <your-branch-name>"
echo ""
echo "✅ Done! SQL files removed from Git (but kept locally)"
