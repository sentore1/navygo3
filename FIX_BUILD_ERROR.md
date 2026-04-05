# Fix Build Error - Quick Steps

The error you're seeing is likely a build cache issue, not an actual syntax error.

## Solution 1: Clear Next.js Cache (Fastest)

```bash
# Delete the .next folder and rebuild
rm -rf .next
npm run dev
```

## Solution 2: Full Clean (If Solution 1 doesn't work)

```bash
# Stop the dev server (Ctrl+C)

# Delete cache folders
rm -rf .next
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

## Solution 3: Complete Reset (Nuclear option)

```bash
# Stop the dev server

# Delete everything
rm -rf .next
rm -rf node_modules

# Reinstall dependencies
npm install

# Start dev server
npm run dev
```

## Why This Happens

Next.js sometimes caches old file states. When you modify files (like we did with settings/page.tsx), the cache can get confused and show phantom errors.

## Verify the Fix

After clearing cache, you should see:
1. No build errors
2. Settings page has a new "Privacy" tab
3. Landing page shows leaderboard section
4. `/leaderboard` route works

## If Error Persists

The admin page might have an unrelated issue. Run:

```bash
# Check for actual syntax errors
npm run build
```

This will show the real error location if it exists.
