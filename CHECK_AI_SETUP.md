# AI Setup Checklist

## ✅ What's Done:
1. ✅ Groq API is working (tested successfully)
2. ✅ Edge Function updated to support Groq
3. ✅ Edge Function deployed to Supabase

## 🔧 What You Need to Do:

### 1. Add Groq API Key to Supabase Edge Functions
Go to: https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/settings/functions

Click "Add secret" and add:
- Name: `GROQ_API_KEY`
- Value: Your Groq API key (starts with `gsk_`)

### 2. Configure AI Settings in Your App
Option A - Via Admin UI (Recommended):
1. Go to your app's Admin Settings page
2. Scroll to "AI Goal Creation" section
3. Select "Groq (Fast Inference)" from the provider dropdown
4. Select "Llama 3.3 70B (Latest, Best)" from the model dropdown
5. Toggle "Enable AI Goal Creation" to ON

Option B - Via SQL (Quick):
Run this in Supabase SQL Editor:
```sql
INSERT INTO ai_settings (ai_enabled, ai_model, ai_provider, created_at, updated_at)
VALUES (true, 'llama-3.3-70b-versatile', 'groq', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET 
  ai_enabled = true,
  ai_model = 'llama-3.3-70b-versatile',
  ai_provider = 'groq',
  updated_at = NOW();
```

### 3. Test AI Goal Generation
1. Go to your dashboard
2. Click the "Generate Goals with AI" button (sparkle icon)
3. Enter a goal like "I want to learn Python programming"
4. Click "Generate Goal"
5. You should see AI-generated milestones (not hardcoded ones)

## 🐛 Troubleshooting

If milestones still appear hardcoded:
1. Check browser console for errors
2. Verify the Edge Function logs in Supabase Dashboard
3. Make sure GROQ_API_KEY is set in Supabase Edge Functions settings (not just .env.local)
4. Clear browser cache and try again

The key difference:
- **Hardcoded**: Milestones like "Research options and set a specific budget", "Create a detailed savings plan"
- **AI-generated**: Milestones specific to your prompt like "Setup Development Environment", "Learn Basic Syntax and Data Types"
