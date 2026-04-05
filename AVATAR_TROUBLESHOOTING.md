# Avatar Not Showing on Leaderboard - Troubleshooting Guide

## Quick Fixes

### 1. Run the Fix Script
```sql
-- In Supabase SQL Editor, run:
\i FIX_AVATAR_DISPLAY.sql
```

This will:
- Recreate the leaderboard view with avatar_url
- Set default avatars for users without one
- Verify everything is working

### 2. Clear Browser Cache
- Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or open DevTools (F12) → Network tab → Check "Disable cache"
- Refresh the page

### 3. Verify Avatar Saved in Settings
1. Go to Settings → Profile
2. Choose an avatar style or upload image
3. Click "Save Changes" button at the bottom
4. Wait for "Profile updated successfully!" message
5. Refresh the leaderboard page

## Common Issues

### Issue 1: Avatar Not Saving
**Symptoms:** You select an avatar but it doesn't save

**Solution:**
1. Make sure you click "Save Changes" button
2. Check browser console for errors (F12 → Console tab)
3. Verify you're signed in
4. Try a different avatar style

### Issue 2: Avatar Shows in Settings But Not Leaderboard
**Symptoms:** Avatar appears in settings but not on leaderboard

**Possible Causes:**
- Leaderboard is cached
- `show_on_leaderboard` is disabled
- View needs to be refreshed

**Solution:**
```sql
-- Check if leaderboard is enabled
SELECT name, avatar_url, show_on_leaderboard 
FROM users 
WHERE email = 'your-email@example.com';

-- If show_on_leaderboard is false, enable it:
UPDATE users 
SET show_on_leaderboard = true 
WHERE email = 'your-email@example.com';
```

### Issue 3: Avatar URL is NULL
**Symptoms:** Database shows NULL for avatar_url

**Solution:**
```sql
-- Set a default avatar
UPDATE users 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || name
WHERE email = 'your-email@example.com';
```

### Issue 4: Leaderboard Shows Initials Instead of Avatar
**Symptoms:** You see initials (like "JD") instead of avatar image

**Possible Causes:**
- Avatar URL is broken/invalid
- Image failed to load
- CORS issue with external image

**Solution:**
1. Use DiceBear avatars (they always work):
   ```
   https://api.dicebear.com/7.x/avataaars/svg?seed=yourname
   ```

2. Or check if your custom URL is accessible:
   - Open the URL in a new browser tab
   - Make sure it's HTTPS (not HTTP)
   - Verify the image loads

## Debug Steps

### Step 1: Check Database
```sql
-- See your current avatar_url
SELECT name, email, avatar_url, show_on_leaderboard
FROM users
WHERE email = 'your-email@example.com';
```

### Step 2: Check Leaderboard View
```sql
-- See what the leaderboard sees
SELECT name, avatar_url, total_score
FROM leaderboard_view
WHERE name LIKE '%YourName%';
```

### Step 3: Test Avatar URL
Copy your `avatar_url` from the database and paste it in a browser:
- ✅ If image loads → Avatar URL is valid
- ❌ If it doesn't load → Avatar URL is broken

### Step 4: Check Browser Console
1. Open leaderboard page
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for errors related to images or avatars
5. Check Network tab for failed image requests

## Manual Avatar Update

If settings page isn't working, update directly in database:

```sql
-- Option 1: Use DiceBear Avataaars style
UPDATE users 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=myname'
WHERE email = 'your-email@example.com';

-- Option 2: Use DiceBear Robots style
UPDATE users 
SET avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=myname'
WHERE email = 'your-email@example.com';

-- Option 3: Use DiceBear Emoji style
UPDATE users 
SET avatar_url = 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=myname'
WHERE email = 'your-email@example.com';

-- Option 4: Use custom image URL
UPDATE users 
SET avatar_url = 'https://your-image-url.com/avatar.jpg'
WHERE email = 'your-email@example.com';
```

## Verification Checklist

After making changes, verify:

- [ ] Avatar URL is not NULL in database
- [ ] `show_on_leaderboard` is true
- [ ] Avatar URL loads in browser
- [ ] Leaderboard view includes avatar_url column
- [ ] Browser cache is cleared
- [ ] Page is refreshed

## Still Not Working?

If avatars still don't show after trying everything:

1. **Check RLS Policies:**
   ```sql
   -- Verify leaderboard view is accessible
   SELECT * FROM leaderboard_view LIMIT 1;
   ```

2. **Recreate the View:**
   ```sql
   -- Run FIX_AVATAR_DISPLAY.sql
   ```

3. **Check Component:**
   - Verify `src/components/leaderboard-section.tsx` has:
     ```typescript
     <AvatarImage src={user.avatar_url} />
     ```

4. **Hard Refresh:**
   - Close all browser tabs
   - Clear all cache
   - Restart browser
   - Open leaderboard again

## Avatar Styles Available

When choosing in Settings → Profile:

1. **Avataaars** - Cartoon faces (most popular)
2. **Robots** - Robot characters
3. **Emoji** - Fun emoji faces
4. **Lorelei** - Illustrated portraits
5. **Pixel** - Retro pixel art
6. **Thumbs** - Thumbs up/down

All use format:
```
https://api.dicebear.com/7.x/{style}/svg?seed={your-name}
```

## Need More Help?

Run the debug script:
```sql
\i DEBUG_AVATAR_ISSUE.sql
```

This will show you exactly what's in your database and help identify the issue.
