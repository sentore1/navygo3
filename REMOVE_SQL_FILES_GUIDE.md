# Remove SQL Files from GitHub Repository

## Problem

You have many SQL debug/test files in the root directory that were committed to GitHub:
- `CHECK_GOALS_TABLE.sql`
- `FIX_AVATAR_SAVE_ISSUE.sql`
- `POPULATE_LEADERBOARD.sql`
- And many more...

These files should not be in Git because they're temporary debug files.

## Solution

### Option 1: Quick Fix (Remove from tracking only)

This removes files from Git but keeps them in history:

```bash
# 1. Add to .gitignore
echo "" >> .gitignore
echo "# SQL debug/test files" >> .gitignore
echo "*.sql" >> .gitignore
echo "!supabase/**/*.sql" >> .gitignore

# 2. Remove from Git tracking
git rm --cached *.sql

# 3. Commit
git add .gitignore
git commit -m "Remove SQL debug files from tracking"

# 4. Push
git push origin main
```

This is safe and quick, but files remain in Git history.

### Option 2: Complete Cleanup (Remove from history too)

This completely removes files from Git history:

```bash
# Run the script I created
bash remove-sql-files-from-git.sh
```

The script will:
1. ✅ List all SQL files to remove
2. ✅ Update .gitignore
3. ✅ Remove from Git tracking
4. ✅ Commit changes
5. ⚠️ Optionally remove from Git history
6. ⚠️ Force push to GitHub

### Option 3: Manual Cleanup (Step by Step)

#### Step 1: Update .gitignore

Add this to `.gitignore`:

```gitignore
# SQL debug/test files
*.sql
!supabase/**/*.sql
```

This ignores all `.sql` files EXCEPT those in `supabase/` folders.

#### Step 2: Remove from Git tracking

```bash
# Remove all SQL files from root directory
git rm --cached *.sql

# Or remove specific files
git rm --cached CHECK_GOALS_TABLE.sql
git rm --cached FIX_AVATAR_SAVE_ISSUE.sql
# ... etc
```

#### Step 3: Commit

```bash
git add .gitignore
git commit -m "Remove SQL debug files from tracking"
```

#### Step 4: Push

```bash
git push origin main
```

#### Step 5: Remove from history (optional)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove all root-level SQL files from history
git filter-repo --path-glob '*.sql' --invert-paths --force

# Force push
git push origin --force --all
```

## What Gets Removed vs Kept

### ✅ KEPT (Important files):
- `supabase/migrations/*.sql` - Database migrations
- All files in subdirectories

### 🗑️ REMOVED (Debug files):
- `CHECK_GOALS_TABLE.sql`
- `FIX_AVATAR_SAVE_ISSUE.sql`
- `POPULATE_LEADERBOARD.sql`
- `ADD_AI_PROVIDERS_NOW.sql`
- All other root-level `.sql` files

## After Cleanup

### Files will still exist locally
The SQL files will remain on your computer, just not in Git.

### Future SQL files won't be committed
The `.gitignore` update prevents accidentally committing new SQL files.

### Migration files are safe
Files in `supabase/migrations/` are protected by the `!supabase/**/*.sql` rule.

## Verification

Check what's tracked by Git:

```bash
# List tracked SQL files
git ls-files "*.sql"

# Should only show:
# supabase/migrations/...sql files
```

Check what's ignored:

```bash
# This should show your root SQL files
git status --ignored
```

## Recommended Approach

I recommend **Option 1** (Quick Fix) because:
- ✅ Fast and safe
- ✅ No force push needed
- ✅ No team disruption
- ✅ Files stop appearing in future commits

Only use Option 2 if you need to completely clean Git history (like for security reasons).

## Quick Commands

### Just stop tracking them (recommended):

```bash
echo -e "\n# SQL debug/test files\n*.sql\n!supabase/**/*.sql" >> .gitignore
git rm --cached *.sql
git add .gitignore
git commit -m "Remove SQL debug files from tracking"
git push origin main
```

### Complete cleanup (advanced):

```bash
bash remove-sql-files-from-git.sh
```

## Notes

- The files will still exist on your computer
- They just won't be tracked by Git anymore
- Future SQL files in the root directory will be automatically ignored
- Migration files in `supabase/migrations/` are safe

## Need Help?

If you get errors:
1. Make sure you're in the repository root
2. Check if files are actually tracked: `git ls-files "*.sql"`
3. Try removing files one by one instead of using `*.sql`
