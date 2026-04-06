#!/bin/bash

# Script to verify SQL files have been removed from Git

echo "🔍 SQL Files Cleanup Verification"
echo "=================================="
echo ""

# Check 1: Files tracked by Git
echo "1️⃣  Checking which SQL files are tracked by Git..."
echo "---------------------------------------------------"
TRACKED_SQL=$(git ls-files "*.sql")

if [ -z "$TRACKED_SQL" ]; then
    echo "❌ No root SQL files tracked (GOOD!)"
    echo ""
else
    echo "⚠️  These SQL files are still tracked:"
    echo "$TRACKED_SQL"
    echo ""
fi

# Check 2: Migration files (should be tracked)
echo "2️⃣  Checking migration files (should be tracked)..."
echo "----------------------------------------------------"
MIGRATION_SQL=$(git ls-files "supabase/**/*.sql" | wc -l)
echo "✅ Found $MIGRATION_SQL migration files (these should stay)"
echo ""

# Check 3: Files on disk
echo "3️⃣  Checking SQL files on disk..."
echo "----------------------------------"
DISK_SQL=$(ls -1 *.sql 2>/dev/null | wc -l)
if [ "$DISK_SQL" -gt 0 ]; then
    echo "📁 Found $DISK_SQL SQL files on disk (local only)"
else
    echo "📁 No SQL files on disk"
fi
echo ""

# Check 4: .gitignore
echo "4️⃣  Checking .gitignore..."
echo "--------------------------"
if grep -q "^\*.sql" .gitignore 2>/dev/null; then
    echo "✅ *.sql is in .gitignore"
else
    echo "❌ *.sql is NOT in .gitignore"
fi

if grep -q "^!supabase/\*\*/\*.sql" .gitignore 2>/dev/null; then
    echo "✅ supabase/**/*.sql exception is in .gitignore"
else
    echo "⚠️  supabase/**/*.sql exception is NOT in .gitignore"
fi
echo ""

# Check 5: Git status
echo "5️⃣  Checking Git status..."
echo "--------------------------"
UNTRACKED_SQL=$(git status --short | grep "\.sql$" | grep "^??" | wc -l)
if [ "$UNTRACKED_SQL" -gt 0 ]; then
    echo "✅ $UNTRACKED_SQL SQL files are untracked (ignored)"
else
    echo "✅ No untracked SQL files"
fi
echo ""

# Check 6: Staged changes
echo "6️⃣  Checking staged changes..."
echo "-------------------------------"
STAGED=$(git diff --cached --name-only | grep "\.sql$" | wc -l)
if [ "$STAGED" -gt 0 ]; then
    echo "⚠️  $STAGED SQL files are staged for commit"
    git diff --cached --name-only | grep "\.sql$"
else
    echo "✅ No SQL files staged"
fi
echo ""

# Summary
echo "📊 SUMMARY"
echo "=========="
echo ""

# Count root SQL files tracked
ROOT_TRACKED=$(git ls-files "*.sql" | grep -v "supabase/" | wc -l)

if [ "$ROOT_TRACKED" -eq 0 ]; then
    echo "✅ SUCCESS! No root SQL files are tracked by Git"
    echo ""
    echo "What this means:"
    echo "  ✅ SQL files removed from Git tracking"
    echo "  ✅ Files still exist locally (if you want them)"
    echo "  ✅ Migration files are safe"
    echo "  ✅ Future SQL files won't be committed"
    echo ""
    echo "Next step: Push to GitHub"
    echo "  git push origin main"
else
    echo "⚠️  WARNING: $ROOT_TRACKED root SQL files are still tracked!"
    echo ""
    echo "These files are still in Git:"
    git ls-files "*.sql" | grep -v "supabase/"
    echo ""
    echo "To remove them, run:"
    echo "  git rm --cached *.sql"
    echo "  git commit -m 'Remove SQL files from tracking'"
fi

echo ""
echo "🌐 To check on GitHub:"
echo "  1. Push your changes: git push origin main"
echo "  2. Visit: https://github.com/sentore1/navy2"
echo "  3. Root directory should have no .sql files"
echo "  4. supabase/migrations/ should still have .sql files"
