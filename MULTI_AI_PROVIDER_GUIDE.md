# Multi-AI Provider Guide

## Overview

The system now supports three AI providers for goal generation:
1. **OpenAI** (GPT-3.5, GPT-4, GPT-4 Turbo, GPT-4o)
2. **Grok** (xAI's models)
3. **Google Gemini** (Gemini Pro, 1.5 Pro, 1.5 Flash)

## Setup Instructions

### Step 1: Get API Keys

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy key (starts with `sk-`)

#### Grok (xAI)
1. Go to [xAI Console](https://x.ai)
2. Sign in with X/Twitter account
3. Navigate to API Keys
4. Create new API key
5. Copy key (starts with `xai-`)

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key (starts with `AIzaSy`)

### Step 2: Add to Environment Variables

Add to `.env.local`:
```bash
# Choose one or more AI providers
OPENAI_API_KEY=sk-your-openai-key
GROK_API_KEY=xai-your-grok-key
GEMINI_API_KEY=AIzaSy-your-gemini-key
```

You only need to add the key for the provider you want to use.

### Step 3: Apply Database Migration

```bash
# Run the new migration
supabase db push

# Or apply manually in Supabase SQL Editor
```

Run the migration file: `supabase/migrations/20260406000003_add_ai_providers.sql`

### Step 4: Configure in Admin Settings

1. Go to `/admin/settings`
2. Scroll to "AI Goal Creation"
3. Select your AI Provider from dropdown
4. Toggle "Enable AI Goal Creation" ON
5. Select your preferred model

## Available Models

### OpenAI Models

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| GPT-3.5 Turbo | Fast | Good | Low | Most use cases, high volume |
| GPT-4 | Slow | Excellent | High | Complex goals, best quality |
| GPT-4 Turbo | Medium | Very Good | Medium | Balance of speed and quality |
| GPT-4o | Very Fast | Excellent | Medium | Latest, fastest GPT-4 |

**Recommended:** GPT-3.5 Turbo for cost-effectiveness

### Grok Models

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Grok Beta | Fast | Good | Medium | Testing, general use |
| Grok 2 Latest | Medium | Excellent | Higher | Advanced reasoning, complex goals |

**Recommended:** Grok 2 Latest for best results

### Gemini Models

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Gemini Pro | Medium | Good | Low | Balanced performance |
| Gemini 1.5 Pro | Slow | Excellent | Medium | Complex tasks, long context |
| Gemini 1.5 Flash | Very Fast | Good | Very Low | High volume, speed priority |

**Recommended:** Gemini 1.5 Flash for cost and speed

## Cost Comparison

### Estimated Cost per Goal Generation

| Provider | Model | Cost per Goal | Notes |
|----------|-------|---------------|-------|
| OpenAI | GPT-3.5 Turbo | ~$0.002 | Most economical |
| OpenAI | GPT-4 | ~$0.06 | Highest quality |
| OpenAI | GPT-4 Turbo | ~$0.03 | Good balance |
| OpenAI | GPT-4o | ~$0.015 | Fast and affordable |
| Grok | Grok Beta | ~$0.01 | Competitive pricing |
| Grok | Grok 2 | ~$0.04 | Premium model |
| Gemini | Gemini Pro | ~$0.001 | Very economical |
| Gemini | Gemini 1.5 Pro | ~$0.007 | Good value |
| Gemini | Gemini 1.5 Flash | ~$0.0005 | Cheapest option |

*Costs are approximate and may vary based on actual usage*

## Admin Settings Interface

### Provider Selection

```
┌────────────────────────────────────────┐
│ AI Provider                            │
│ ┌────────────────────────────────────┐ │
│ │ OpenAI                    ✓       ▼│ │
│ └────────────────────────────────────┘ │
│                                        │
│ Options:                               │
│ • OpenAI (✓ if key configured)        │
│ • Grok (xAI) (✓ if key configured)    │
│ • Google Gemini (✓ if key configured) │
└────────────────────────────────────────┘
```

### Model Selection (Dynamic based on provider)

**When OpenAI selected:**
```
┌────────────────────────────────────────┐
│ AI Model                               │
│ ┌────────────────────────────────────┐ │
│ │ GPT-3.5 Turbo (Faster, Lower Cost)▼│ │
│ └────────────────────────────────────┘ │
│                                        │
│ • GPT-3.5 Turbo                       │
│ • GPT-4                                │
│ • GPT-4 Turbo                          │
│ • GPT-4o                               │
└────────────────────────────────────────┘
```

**When Grok selected:**
```
┌────────────────────────────────────────┐
│ AI Model                               │
│ ┌────────────────────────────────────┐ │
│ │ Grok Beta (Latest)                ▼│ │
│ └────────────────────────────────────┘ │
│                                        │
│ • Grok Beta                            │
│ • Grok 2 Latest                        │
└────────────────────────────────────────┘
```

**When Gemini selected:**
```
┌────────────────────────────────────────┐
│ AI Model                               │
│ ┌────────────────────────────────────┐ │
│ │ Gemini Pro (Balanced)             ▼│ │
│ └────────────────────────────────────┘ │
│                                        │
│ • Gemini Pro                           │
│ • Gemini 1.5 Pro                       │
│ • Gemini 1.5 Flash                     │
└────────────────────────────────────────┘
```

## How It Works

### Provider Selection Flow

```
Admin selects provider
        ↓
System checks if API key configured
        ↓ YES
Enable toggle becomes available
        ↓
Admin toggles ON
        ↓
Model dropdown shows provider-specific models
        ↓
Admin selects model
        ↓
Settings saved to database
        ↓
Pro users can now use AI with selected provider
```

### Database Schema

```sql
ai_settings (
  id UUID,
  ai_enabled BOOLEAN,
  ai_model VARCHAR(50),
  ai_provider VARCHAR(20),  -- 'openai', 'grok', or 'gemini'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Switching Providers

### Important Notes

1. **Disable AI first**: You must disable AI before switching providers
2. **Model resets**: When switching providers, the model resets to that provider's default
3. **No data loss**: Existing goals remain intact when switching providers

### Steps to Switch

1. Go to Admin Settings
2. Toggle AI OFF
3. Select new provider from dropdown
4. Wait for page to update
5. Select model for new provider
6. Toggle AI ON

## Troubleshooting

### "API Key Missing" Error

**Problem:** Badge shows red "API Key Missing"

**Solution:**
1. Check `.env.local` has the correct key for selected provider:
   - OpenAI: `OPENAI_API_KEY=sk-...`
   - Grok: `GROK_API_KEY=xai-...`
   - Gemini: `GEMINI_API_KEY=AIzaSy...`
2. Restart dev server: `npm run dev`
3. Refresh admin settings page

### Cannot Enable AI

**Problem:** Toggle won't turn on

**Solution:**
1. Verify API key is configured (green checkmark in provider dropdown)
2. Check the key is valid (test in provider's playground)
3. Verify you have credits/quota in provider account
4. Check server logs for detailed errors

### Provider Not Showing Checkmark

**Problem:** Provider dropdown doesn't show ✓ next to provider name

**Solution:**
1. API key not configured for that provider
2. Add the key to `.env.local`
3. Restart server
4. Refresh page

### Model Dropdown Empty

**Problem:** No models showing in dropdown

**Solution:**
1. Select a provider first
2. Wait for page to load
3. If still empty, check browser console for errors

## API Key Security

### Best Practices

1. **Never commit keys to git**
   - Add `.env.local` to `.gitignore`
   - Use environment variables only

2. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys in provider dashboard

3. **Use different keys for dev/prod**
   - Development: Test keys with limits
   - Production: Production keys with monitoring

4. **Monitor usage**
   - Set up spending alerts
   - Review usage dashboards regularly

### Where Keys Are Stored

- **Environment Variables**: `.env.local` (local) or hosting platform (production)
- **Database**: Only stores which provider is selected, NOT the API key
- **Client-Side**: Keys are NEVER exposed to client

## Provider-Specific Notes

### OpenAI
- Most mature and reliable
- Best documentation
- Widest model selection
- Higher costs for GPT-4

### Grok (xAI)
- Newer provider
- Competitive with GPT-4
- Good for users with X Premium+
- Limited model selection currently

### Gemini
- Most cost-effective
- Very fast (Flash model)
- Good for high-volume use
- Excellent for multilingual content

## Recommendations

### For Startups/Small Teams
**Use:** Gemini 1.5 Flash
- Lowest cost
- Fast enough for most use cases
- Good quality

### For Medium Businesses
**Use:** GPT-3.5 Turbo or Gemini 1.5 Pro
- Balance of cost and quality
- Reliable performance
- Good support

### For Enterprise/Premium
**Use:** GPT-4o or Grok 2
- Best quality
- Latest features
- Worth the cost for premium users

### For High Volume
**Use:** Gemini 1.5 Flash
- Cheapest per request
- Very fast
- Scales well

## Migration from OpenAI-Only

If you were using the old OpenAI-only system:

1. Your existing `OPENAI_API_KEY` still works
2. Run the new migration to add `ai_provider` column
3. System defaults to OpenAI
4. You can now add other providers anytime
5. No changes needed to existing goals

## Testing

### Test Each Provider

```bash
# 1. Add all three API keys to .env.local
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...
GEMINI_API_KEY=AIzaSy...

# 2. Restart server
npm run dev

# 3. Test each provider:
# - Go to /admin/settings
# - Select OpenAI, enable, test goal creation
# - Disable, select Grok, enable, test
# - Disable, select Gemini, enable, test
```

## Support Links

- **OpenAI**: https://platform.openai.com/docs
- **Grok**: https://x.ai/api
- **Gemini**: https://ai.google.dev/docs

## Summary

You now have three AI providers to choose from:
- ✅ OpenAI (most reliable, widest selection)
- ✅ Grok (competitive, good for X users)
- ✅ Gemini (most cost-effective, fastest)

Choose based on your needs for cost, speed, and quality!
