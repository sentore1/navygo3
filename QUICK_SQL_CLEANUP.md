# Quick SQL Files Cleanup

## You Have 77 SQL Files to Remove! 🗑️

These are all debug/test files that shouldn't be in Git:
- ACTIVATE_MY_SUBSCRIPTION.sql
- CHECK_GOALS_TABLE.sql
- FIX_AVATAR_SAVE_ISSUE.sql
- ... and 74 more!

## Fastest Solution (Copy-Paste This)

### Option 1: One Command (Recommended)

```bash
bash quick-remove-sql.sh
```

Then push:
```bash
git push origin main
```

### Option 2: Manual Commands (If script doesn't work)

```bash
# 1. Update .gitignore
cat >> .gitignore << 'EOF'

# SQL debug/test files
*.sql
!supabase/**/*.sql
EOF

# 2. Remove from Git
git rm --cached *.sql

# 3. Commit
git add .gitignore
git commit -m "Remove SQL debug files from tracking"

# 4. Push
git push origin main
```

## What This Does

✅ Removes 77 SQL files from Git tracking
✅ Adds them to .gitignore so they won't be committed again
✅ Keeps the files on your computer (doesn't delete them)
✅ Protects supabase/migrations/*.sql files (they stay in Git)

## What Happens After

- SQL files disappear from GitHub
- Files still exist on your computer
- Future SQL files won't be committed
- Migration files in supabase/ are safe

## If You Want to Delete Them Locally Too

After removing from Git, you can delete them:

```bash
# Delete all root SQL files (CAREFUL!)
rm *.sql

# Or move them to a backup folder
mkdir sql-backup
mv *.sql sql-backup/
```

## Verify It Worked

```bash
# Check what SQL files are still tracked
git ls-files "*.sql"

# Should only show:
# supabase/migrations/...sql files
```

## Need to Remove from Git History Too?

If you want to completely erase them from Git history:

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove from history
git filter-repo --path-glob '*.sql' --path-glob '!supabase/**/*.sql' --invert-paths --force

# Force push
git push origin --force --all
```

⚠️ Only do this if you need to clean history (requires force push).

## Summary

**Quickest way:**
1. Run: `bash quick-remove-sql.sh`
2. Run: `git push origin main`
3. Done! ✅

Files removed from Git but kept locally for reference.
