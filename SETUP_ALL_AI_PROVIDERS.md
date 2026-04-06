# Setup All AI Providers

## Current Status
- ✅ OpenAI is configured and working
- ❌ Grok (xAI) - API key not configured
- ❌ Google Gemini - API key not configured

## Step 1: Run Database Migration

Run this migration in your Supabase SQL Editor:
```bash
# The migration file is already created at:
supabase/migrations/20260406000003_add_all_ai_providers.sql
```

Or run it directly in Supabase SQL Editor by copying the content.

## Step 2: Add API Keys to .env.local

Add these lines to your `.env.local` file:

```env
# Grok (xAI) API Key
GROK_API_KEY=your_grok_api_key_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 3: Get API Keys

### For Grok (xAI):
1. Visit: https://x.ai
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Copy and paste it into your .env.local

### For Google Gemini:
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste it into your .env.local

## Step 4: Restart Your Development Server

After adding the API keys, restart your Next.js server:
```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 5: Verify in Admin Settings

1. Go to Admin Settings page
2. You should now see checkmarks next to providers that have API keys configured
3. You can now select any provider from the dropdown

## Notes

- You only need to add API keys for providers you want to use
- OpenAI is already working, so you can keep using it
- Each provider has different pricing and capabilities
- You can switch between providers anytime (when AI is disabled)
