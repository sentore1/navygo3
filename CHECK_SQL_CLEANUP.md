# How to Verify SQL Files Are Deleted

## Quick Verification Commands

### 1. Check What Git Is Tracking

```bash
# List all SQL files tracked by Git
git ls-files "*.sql"
```

**Expected result:**
- Should ONLY show `supabase/migrations/*.sql` files
- Should NOT show any root directory SQL files

### 2. Check Local Files vs Git

```bash
# Files on your computer
ls *.sql

# Files tracked by Git (should be empty for root)
git ls-files "*.sql" | grep -v "supabase/"
```

### 3. Check .gitignore

```bash
# Verify .gitignore has the rules
cat .gitignore | grep -A2 "SQL debug"
```

**Expected output:**
```
# SQL debug/test files
*.sql
!supabase/**/*.sql
```

### 4. Check Git Status

```bash
# Should show SQL files as untracked/ignored
git status --ignored | grep "\.sql"
```

### 5. Run Verification Script

```bash
# Run the complete verification
bash verify-sql-cleanup.sh
```

## What Success Looks Like

### ✅ Before Pushing (Local Check)

```bash
$ git ls-files "*.sql" | grep -v "supabase/"
# (empty - no output)

$ git status
On branch main
nothing to commit, working tree clean
```

### ✅ After Pushing (GitHub Check)

1. Go to: https://github.com/sentore1/navy2
2. Look at root directory
3. Should see NO .sql files
4. Go to `supabase/migrations/`
5. Should see migration .sql files ✅

## Detailed Verification Steps

### Step 1: Check Locally

```bash
# What's tracked by Git?
echo "=== Tracked SQL files ==="
git ls-files "*.sql"

# What's on disk?
echo "=== SQL files on disk ==="
ls -1 *.sql 2>/dev/null | wc -l

# What's ignored?
echo "=== Ignored SQL files ==="
git status --ignored | grep "\.sql"
```

### Step 2: Check Commit

```bash
# View your last commit
git log -1 --stat | grep "\.sql"

# Should show deletions like:
# CHECK_GOALS_TABLE.sql | 10 ----------
# FIX_AVATAR_SAVE_ISSUE.sql | 15 ---------------
```

### Step 3: Check Remote (After Push)

```bash
# Push first
git push origin main

# Then check what's on GitHub
git ls-remote --heads origin

# Or visit GitHub directly
```

### Step 4: Verify on GitHub Website

1. Go to https://github.com/sentore1/navy2
2. Click on root directory
3. Look for .sql files
4. Should see NONE (except in supabase/migrations/)

## Common Issues & Solutions

### Issue 1: Files Still Tracked

```bash
# Check
git ls-files "*.sql" | grep -v "supabase/"

# If you see files, remove them
git rm --cached *.sql
git commit -m "Remove SQL files"
git push
```

### Issue 2: Files Not in .gitignore

```bash
# Add to .gitignore
echo -e "\n# SQL debug/test files\n*.sql\n!supabase/**/*.sql" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore"
git push
```

### Issue 3: Files Still on GitHub

```bash
# Make sure you pushed
git push origin main

# Check push status
git status

# If behind, pull first
git pull origin main
git push origin main
```

## Quick Test Commands

Copy and paste these to verify everything:

```bash
echo "🔍 Verification Test"
echo "===================="
echo ""
echo "1. Root SQL files tracked by Git:"
git ls-files "*.sql" | grep -v "supabase/" | wc -l
echo "   (Should be 0)"
echo ""
echo "2. Migration files tracked by Git:"
git ls-files "supabase/**/*.sql" | wc -l
echo "   (Should be > 0)"
echo ""
echo "3. SQL files on disk:"
ls -1 *.sql 2>/dev/null | wc -l
echo "   (Can be any number - these are local only)"
echo ""
echo "4. .gitignore configured:"
grep -c "^\*.sql" .gitignore
echo "   (Should be 1)"
echo ""
echo "5. Uncommitted changes:"
git status --short | grep "\.sql" | wc -l
echo "   (Should be 0)"
```

## Visual Verification

### Before Cleanup:
```
GitHub Repo Root:
├── CHECK_GOALS_TABLE.sql ❌
├── FIX_AVATAR_SAVE_ISSUE.sql ❌
├── POPULATE_LEADERBOARD.sql ❌
├── ... (74 more) ❌
└── supabase/
    └── migrations/
        ├── 20260403000001_add_admin_role.sql ✅
        └── ... (more migrations) ✅
```

### After Cleanup:
```
GitHub Repo Root:
├── (no .sql files) ✅
└── supabase/
    └── migrations/
        ├── 20260403000001_add_admin_role.sql ✅
        └── ... (more migrations) ✅
```

## Final Checklist

- [ ] Ran `git ls-files "*.sql"` - only shows supabase/migrations
- [ ] Ran `git status` - no SQL files to commit
- [ ] Checked .gitignore - has `*.sql` and `!supabase/**/*.sql`
- [ ] Pushed to GitHub - `git push origin main`
- [ ] Visited GitHub repo - no SQL files in root
- [ ] Checked supabase/migrations on GitHub - files still there

If all checked ✅, you're done!
