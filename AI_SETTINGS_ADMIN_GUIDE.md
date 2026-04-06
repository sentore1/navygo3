# AI Settings - Admin Configuration Guide

## Overview

This guide explains how to configure AI-powered goal creation for your users through the admin settings panel.

## What This Does

Instead of hardcoding the OpenAI API key in the codebase, admins can now:
1. Add the OpenAI API key as an environment variable
2. Enable/disable AI goal creation for all Pro users
3. Choose which AI model to use (GPT-3.5, GPT-4, etc.)
4. Monitor the configuration status

## Setup Instructions

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Store it securely

### Step 2: Add Environment Variable

#### For Local Development

Add to your `.env.local` file:
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

#### For Production (Vercel)

1. Go to your Vercel project
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-api-key-here`
   - Environment: Production (and Preview if needed)
4. Click "Save"
5. Redeploy your application

#### For Other Hosting Platforms

**Netlify:**
1. Site Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your key

**Railway:**
1. Project → Variables
2. Add `OPENAI_API_KEY` with your key

**Render:**
1. Environment → Environment Variables
2. Add `OPENAI_API_KEY` with your key

### Step 3: Restart Your Application

After adding the environment variable:

**Local Development:**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

**Production:**
- Vercel: Automatic redeploy after env var change
- Others: Trigger a new deployment

### Step 4: Configure in Admin Panel

1. Log in as an admin
2. Go to Admin Dashboard
3. Click "Settings"
4. Scroll to "AI Goal Creation" section
5. You should see "API Key Configured" badge (green)
6. Toggle "Enable AI Goal Creation" to ON
7. (Optional) Select your preferred AI model

## Admin Settings Interface

### AI Goal Creation Section

The admin settings page now includes an "AI Goal Creation" card with:

#### Status Indicators

- **Green Badge (API Key Configured)**: OpenAI API key is set and ready
- **Red Badge (API Key Missing)**: OpenAI API key needs to be configured

#### Controls

1. **Enable AI Goal Creation Toggle**
   - Turn AI features on/off for all Pro users
   - Disabled if API key is not configured
   - When enabled, Pro users see the AI sparkle button

2. **AI Model Selector** (shown when AI is enabled)
   - **GPT-3.5 Turbo**: Faster, lower cost (recommended)
   - **GPT-4**: Higher quality, slower, more expensive
   - **GPT-4 Turbo**: Best balance of speed and quality

## How It Works

### For Pro Users

When AI is enabled:
1. Pro users see a sparkle (✨) button next to "New Goal"
2. Clicking it opens the AI Goal Creator
3. They enter what they want to achieve
4. AI generates a structured goal with milestones
5. They can accept or regenerate the goal

### For Basic Users

- They see the sparkle button but it's locked
- Clicking shows "Upgrade to Pro" message
- Directs them to the pricing page

### When AI is Disabled

- Pro users don't see the AI button
- Existing AI-created goals remain intact
- Users can still create goals manually

## AI Models Comparison

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| GPT-3.5 Turbo | Fast | Good | Low | Most use cases |
| GPT-4 | Slow | Excellent | High | Complex goals |
| GPT-4 Turbo | Medium | Very Good | Medium | Balance needed |

### Recommendations

- **Start with GPT-3.5 Turbo**: It's fast and cost-effective
- **Use GPT-4 for premium features**: If you want the best quality
- **Monitor your costs**: Check OpenAI usage dashboard regularly

## Cost Considerations

### Pricing (as of 2024)

- **GPT-3.5 Turbo**: ~$0.002 per goal
- **GPT-4**: ~$0.06 per goal
- **GPT-4 Turbo**: ~$0.03 per goal

### Cost Management Tips

1. **Start with GPT-3.5**: Test with the cheaper model first
2. **Set OpenAI Limits**: Configure spending limits in OpenAI dashboard
3. **Monitor Usage**: Check OpenAI usage regularly
4. **Consider Rate Limiting**: Limit goals per user per day

## Troubleshooting

### "API Key Missing" Badge

**Problem**: Red badge shows "API Key Missing"

**Solutions:**
1. Verify `OPENAI_API_KEY` is in environment variables
2. Check the key starts with `sk-`
3. Restart your application
4. Clear browser cache and refresh

### "Cannot Enable AI" Error

**Problem**: Toggle won't turn on

**Solutions:**
1. Ensure OpenAI API key is configured
2. Check the key is valid (test in OpenAI Playground)
3. Verify you have credits in your OpenAI account
4. Check server logs for detailed errors

### AI Generation Fails

**Problem**: Users report AI goal creation fails

**Solutions:**
1. Check OpenAI API status: https://status.openai.com
2. Verify API key has sufficient credits
3. Check rate limits in OpenAI dashboard
4. Review server logs for error messages
5. Test with a different AI model

### Slow Response Times

**Problem**: AI takes too long to generate goals

**Solutions:**
1. Switch to GPT-3.5 Turbo (faster)
2. Check OpenAI API status
3. Consider implementing caching
4. Add timeout handling

## Security Best Practices

### API Key Security

1. **Never commit API keys to version control**
   - Use `.env.local` for local development
   - Add `.env.local` to `.gitignore`

2. **Use environment variables only**
   - Never store keys in database
   - Never expose keys in client-side code

3. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys in OpenAI dashboard

4. **Monitor usage**
   - Set up alerts for unusual activity
   - Review usage logs regularly

### Access Control

1. **Admin-only configuration**
   - Only admins can enable/disable AI
   - Only admins can change AI model

2. **Pro-only access**
   - AI features require Pro subscription
   - Automatically checked before generation

## Monitoring

### What to Monitor

1. **API Key Status**
   - Check badge in admin settings
   - Verify key is active in OpenAI dashboard

2. **Usage Metrics**
   - Number of AI goals created
   - Success/failure rate
   - Response times

3. **Costs**
   - Daily/monthly OpenAI costs
   - Cost per user
   - Cost per goal

4. **User Feedback**
   - Quality of generated goals
   - User satisfaction
   - Feature adoption rate

### OpenAI Dashboard

Monitor your usage at: https://platform.openai.com/usage

- View API calls
- Check costs
- Set spending limits
- Review rate limits

## FAQ

### Q: Can I use a different AI provider?

A: Currently, only OpenAI is supported. Future updates may add support for other providers.

### Q: What happens if I run out of OpenAI credits?

A: AI goal creation will fail. Users will see an error message. Add credits to your OpenAI account to restore service.

### Q: Can I set different AI models for different users?

A: Not currently. The AI model setting applies to all users. This may be added in a future update.

### Q: How do I disable AI temporarily?

A: Go to Admin Settings → AI Goal Creation → Toggle OFF. This immediately disables AI for all users.

### Q: Will disabling AI delete existing AI-created goals?

A: No. Existing goals remain intact. Users just can't create new AI goals while it's disabled.

### Q: Can I test AI without affecting users?

A: Yes. Use the admin AI goals page at `/admin/ai-goals` to test goal generation.

## Database Schema

The AI settings are stored in the `ai_settings` table:

```sql
CREATE TABLE ai_settings (
    id UUID PRIMARY KEY,
    openai_api_key_configured BOOLEAN,
    ai_enabled BOOLEAN,
    ai_model VARCHAR(50),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### Fields

- `ai_enabled`: Whether AI is enabled for users
- `ai_model`: Which OpenAI model to use
- `openai_api_key_configured`: Server-side check (not stored)

## API Endpoints

### GET /api/admin/ai-settings

Check current AI configuration status.

**Response:**
```json
{
  "success": true,
  "settings": {
    "ai_enabled": true,
    "ai_model": "gpt-3.5-turbo",
    "openai_api_key_configured": true
  }
}
```

### POST /api/admin/ai-settings

Update AI configuration.

**Request:**
```json
{
  "ai_enabled": true,
  "ai_model": "gpt-3.5-turbo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI settings updated successfully",
  "settings": { ... }
}
```

## Migration

The database migration creates the `ai_settings` table:

**File:** `supabase/migrations/20260406000002_add_ai_settings.sql`

To apply:
```bash
# If using Supabase CLI
supabase db push

# Or apply manually in Supabase dashboard
# SQL Editor → Run the migration file
```

## Support

### Getting Help

1. Check this guide first
2. Review server logs for errors
3. Test in OpenAI Playground
4. Check OpenAI status page
5. Contact support if needed

### Useful Links

- [OpenAI Platform](https://platform.openai.com)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Status](https://status.openai.com)
- [OpenAI Pricing](https://openai.com/pricing)

---

## Quick Checklist

Before enabling AI:
- [ ] OpenAI API key obtained
- [ ] Environment variable configured
- [ ] Application restarted
- [ ] Green badge shows in admin settings
- [ ] AI model selected
- [ ] Tested with admin AI goals page

After enabling AI:
- [ ] Pro users can see sparkle button
- [ ] AI goal creation works
- [ ] Monitor OpenAI usage
- [ ] Check costs regularly
- [ ] Gather user feedback

---

**Last Updated:** April 6, 2026
