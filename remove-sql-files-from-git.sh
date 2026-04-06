#!/bin/bash

# Script to remove SQL files from Git repository and history
# This will remove all .sql files from the root directory (not supabase/migrations)

echo "🗑️  SQL Files Cleanup Script"
echo "=============================="
echo ""
echo "⚠️  WARNING: This will:"
echo "   1. Remove SQL files from Git tracking"
echo "   2. Remove them from Git history"
echo "   3. Keep the files locally (won't delete them)"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "📋 Step 1: List SQL files to remove"
echo "-----------------------------------"

# List all .sql files in root directory (excluding supabase/migrations)
SQL_FILES=$(find . -maxdepth 1 -name "*.sql" -type f)

if [ -z "$SQL_FILES" ]; then
    echo "✅ No SQL files found in root directory"
    exit 0
fi

echo "Found these SQL files:"
echo "$SQL_FILES"
echo ""

echo "📝 Step 2: Add to .gitignore"
echo "----------------------------"

# Add pattern to .gitignore if not already there
if ! grep -q "^# SQL debug/test files" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# SQL debug/test files" >> .gitignore
    echo "*.sql" >> .gitignore
    echo "!supabase/**/*.sql" >> .gitignore
    echo "✅ Added SQL files to .gitignore (excluding supabase/migrations)"
else
    echo "✅ .gitignore already configured"
fi

echo ""
echo "🗑️  Step 3: Remove from Git tracking"
echo "------------------------------------"

# Remove each SQL file from Git tracking
for file in $SQL_FILES; do
    filename=$(basename "$file")
    echo "Removing: $filename"
    git rm --cached "$filename" 2>/dev/null || echo "  (not tracked)"
done

echo "✅ Removed from Git tracking"

echo ""
echo "💾 Step 4: Commit the changes"
echo "-----------------------------"

git add .gitignore
git commit -m "Remove SQL debug files from tracking

- Added *.sql to .gitignore (excluding supabase/migrations)
- Removed SQL files from Git tracking
- Files kept locally for reference"

echo "✅ Changes committed"

echo ""
echo "🧹 Step 5: Remove from Git history (OPTIONAL)"
echo "----------------------------------------------"
echo ""
echo "⚠️  This will rewrite Git history!"
echo "   - All team members will need to re-clone"
echo "   - Force push required"
echo ""
read -p "Remove SQL files from Git history? (yes/no): " remove_history

if [ "$remove_history" = "yes" ]; then
    echo ""
    echo "Installing git-filter-repo if needed..."
    
    # Check if git-filter-repo is installed
    if ! command -v git-filter-repo &> /dev/null; then
        echo "Installing git-filter-repo..."
        pip install git-filter-repo || {
            echo "❌ Failed to install git-filter-repo"
            echo "   Install manually: pip install git-filter-repo"
            exit 1
        }
    fi
    
    echo "Removing SQL files from history..."
    
    # Create a list of files to remove
    echo "$SQL_FILES" | while read file; do
        filename=$(basename "$file")
        echo "  Removing $filename from history..."
        git filter-repo --path "$filename" --invert-paths --force
    done
    
    echo "✅ Removed from Git history"
    echo ""
    echo "📤 Step 6: Force push to GitHub"
    echo "--------------------------------"
    echo ""
    echo "Run this command to update GitHub:"
    echo "  git push origin --force --all"
    echo ""
    echo "⚠️  WARNING: All team members must re-clone the repo!"
else
    echo "⏭️  Skipped history cleanup"
    echo ""
    echo "📤 Step 6: Push to GitHub"
    echo "-------------------------"
    echo ""
    echo "Run this command to update GitHub:"
    echo "  git push origin main"
fi

echo ""
echo "✅ Done!"
echo ""
echo "📋 Summary:"
echo "  - SQL files removed from Git tracking"
echo "  - Files still exist locally"
echo "  - .gitignore updated"
echo "  - supabase/migrations/*.sql files are safe"
echo ""
echo "🔍 Local SQL files (still on disk):"
ls -1 *.sql 2>/dev/null || echo "  (none)"
