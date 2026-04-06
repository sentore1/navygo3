# How to See AI Provider Options in Admin Settings

## Quick Fix (2 Steps)

### Step 1: Run SQL Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste this:

```sql
ALTER TABLE ai_settings 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(20) DEFAULT 'openai';

UPDATE ai_settings 
SET ai_provider = 'openai' 
WHERE ai_provider IS NULL;
```

4. Click "Run"

**Or** run the complete setup file: `COMPLETE_AI_SETUP.sql`

### Step 2: Refresh Browser

1. Clear cache: Ctrl+Shift+Delete (Chrome) or Cmd+Shift+Delete (Mac)
2. Check "Cached images and files"
3. Click "Clear data"
4. Go to `/admin/settings`
5. Scroll to "AI Goal Creation"

## What You'll See

After running the migration, you'll see this in Admin Settings:

```
✨ AI Goal Creation
Configure AI-powered goal creation for Pro users

AI Provider
┌────────────────────────────────────┐
│ OpenAI                          ▼ │  ← NEW DROPDOWN!
└────────────────────────────────────┘

Options when you click:
• OpenAI (✓ if key configured)
• Grok (xAI) (✓ if key configured)  
• Google Gemini (✓ if key configured)

Enable AI Goal Creation [Toggle]

AI Model (changes based on provider)
┌────────────────────────────────────┐
│ GPT-3.5 Turbo                   ▼ │
└────────────────────────────────────┘
```

## Available Providers & Models

### OpenAI
- GPT-3.5 Turbo (Fast, cheap)
- GPT-4 (Best quality)
- GPT-4 Turbo (Balanced)
- GPT-4o (Latest)

### Grok (xAI)
- Grok Beta
- Grok 2 Latest

### Gemini (Google)
- Gemini Pro
- Gemini 1.5 Pro
- Gemini 1.5 Flash (Fastest, cheapest)

## Add API Keys

Add to `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Grok (xAI)
GROK_API_KEY=xai-your-key-here

# Gemini (Google)
GEMINI_API_KEY=AIzaSy-your-key-here
```

Then restart: `npm run dev`

## Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Grok**: https://x.ai (requires X Premium+)
- **Gemini**: https://makersuite.google.com/app/apikey

## Troubleshooting

### Still don't see provider dropdown?

1. **Check if migration ran:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'ai_settings';
   ```
   Should show `ai_provider` in the list.

2. **Hard refresh browser:**
   - Windows: Ctrl+F5
   - Mac: Cmd+Shift+R

3. **Check browser console:**
   - Press F12
   - Look for errors
   - Refresh page

4. **Verify API endpoint:**
   ```javascript
   // Run in browser console
   fetch('/api/admin/ai-settings')
     .then(r => r.json())
     .then(d => console.log(d));
   ```
   Should show `ai_provider` in response.

### Provider dropdown is empty?

- Clear all browser data
- Restart dev server
- Try different browser

### Can't click provider dropdown?

- Disable AI first (toggle OFF)
- Then you can change provider
- Enable AI again after selecting

## Complete Documentation

- `MULTI_AI_PROVIDER_GUIDE.md` - Full guide for all providers
- `ADMIN_SETTINGS_VISUAL_GUIDE.md` - Visual screenshots
- `ENABLE_AI_PROVIDERS_CHECKLIST.md` - Step-by-step checklist
- `HOW_PRO_DETECTION_WORKS.md` - How Pro users are detected

## Quick Test

After setup:
1. Go to `/admin/settings`
2. Find "AI Goal Creation"
3. Click "AI Provider" dropdown
4. Should see 3 options
5. Select one
6. Enable AI
7. Select model
8. Test goal creation

---

**That's it!** Just run the SQL and refresh your browser.
