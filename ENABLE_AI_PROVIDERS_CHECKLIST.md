# Enable AI Providers - Quick Checklist

## Step 1: Run Database Migration

Open Supabase SQL Editor and run this:

```sql
-- Add ai_provider column
ALTER TABLE ai_settings 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(20) DEFAULT 'openai';

-- Update existing records
UPDATE ai_settings 
SET ai_provider = 'openai' 
WHERE ai_provider IS NULL;

-- Verify
SELECT * FROM ai_settings;
```

Or run the file: `ADD_AI_PROVIDERS_NOW.sql`

## Step 2: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

Or:
- Chrome: Ctrl+Shift+Delete
- Clear "Cached images and files"
- Click "Clear data"

## Step 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## Step 4: Refresh Admin Settings

1. Go to `/admin/settings`
2. Scroll to "AI Goal Creation" section
3. You should now see:
   - **AI Provider** dropdown (OpenAI, Grok, Gemini)
   - **AI Model** dropdown (changes based on provider)

## What You Should See

### Before Migration
```
┌────────────────────────────────────┐
│ AI Goal Creation                   │
│                                    │
│ Enable AI Goal Creation [Toggle]  │
│ AI Model [Dropdown]                │
└────────────────────────────────────┘
```

### After Migration
```
┌────────────────────────────────────┐
│ AI Goal Creation                   │
│                                    │
│ AI Provider [Dropdown] ← NEW!      │
│ • OpenAI                           │
│ • Grok (xAI)                       │
│ • Google Gemini                    │
│                                    │
│ Enable AI Goal Creation [Toggle]  │
│ AI Model [Dropdown]                │
└────────────────────────────────────┘
```

## Troubleshooting

### Still Don't See Provider Dropdown?

**1. Check if migration ran:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ai_settings';
```

Should show `ai_provider` in the list.

**2. Check browser console:**
- Open DevTools (F12)
- Go to Console tab
- Look for errors
- Refresh page

**3. Check API response:**
```javascript
// Run in browser console
fetch('/api/admin/ai-settings')
  .then(r => r.json())
  .then(d => console.log(d));
```

Should show:
```json
{
  "success": true,
  "settings": {
    "ai_enabled": false,
    "ai_model": "gpt-3.5-turbo",
    "ai_provider": "openai",  ← Should be here
    "openai_api_key_configured": true,
    "grok_api_key_configured": false,
    "gemini_api_key_configured": false
  }
}
```

**4. Hard refresh:**
- Windows: Ctrl+F5
- Mac: Cmd+Shift+R

**5. Check if file saved:**
```bash
# Check if the admin settings file has the new code
grep "ai_provider" src/app/admin/settings/page.tsx
```

Should show multiple matches.

## Quick Test

After completing all steps, test by:

1. Go to `/admin/settings`
2. Find "AI Goal Creation" section
3. Click "AI Provider" dropdown
4. Should see 3 options:
   - OpenAI (with ✓ if key configured)
   - Grok (xAI) (with ✓ if key configured)
   - Google Gemini (with ✓ if key configured)

## If Still Not Working

Run this complete diagnostic:

```sql
-- 1. Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_settings'
ORDER BY ordinal_position;

-- 2. Check current settings
SELECT * FROM ai_settings;

-- 3. If no rows exist, insert default
INSERT INTO ai_settings (ai_enabled, ai_model, ai_provider)
VALUES (false, 'gpt-3.5-turbo', 'openai')
ON CONFLICT DO NOTHING;

-- 4. Verify again
SELECT * FROM ai_settings;
```

Then:
1. Clear browser cache completely
2. Restart dev server
3. Hard refresh browser (Ctrl+F5)
4. Check `/admin/settings` again

## Success Indicators

✅ Provider dropdown visible
✅ Can select different providers
✅ Model dropdown changes based on provider
✅ API key status shows for each provider
✅ Can enable/disable AI

## Next Steps After Setup

1. Add API keys to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   GROK_API_KEY=xai-...
   GEMINI_API_KEY=AIzaSy...
   ```

2. Restart server

3. Select provider in admin settings

4. Enable AI

5. Test goal creation

---

**Need more help?** Check `MULTI_AI_PROVIDER_GUIDE.md` for complete documentation.
