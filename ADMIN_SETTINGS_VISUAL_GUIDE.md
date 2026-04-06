# Admin Settings - Visual Guide for AI Providers

## What You Should See

### Full AI Settings Section

```
┌─────────────────────────────────────────────────────────────────┐
│  ✨ AI Goal Creation                                            │
│  Configure AI-powered goal creation for Pro users               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AI Provider                                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ OpenAI                                                  ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Choose your preferred AI provider for goal generation.         │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Enable AI Goal Creation  [✓ API Key Configured]    [ON] ●──○  │
│  Allow Pro users to create goals using AI assistance            │
│  Required: ✓ OPENAI_API_KEY                                     │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  AI Model                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ GPT-3.5 Turbo (Faster, Lower Cost)                     ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Choose the AI model for goal generation.                       │
│  GPT-3.5 is recommended for most use cases.                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Provider Dropdown (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Provider                                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ OpenAI                                                  ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│         │                                                        │
│         ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ● OpenAI                                            ✓      │ │
│  │   Grok (xAI)                                               │ │
│  │   Google Gemini                                      ✓      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ✓ = API key is configured for this provider                   │
└─────────────────────────────────────────────────────────────────┘
```

### Model Dropdown - OpenAI

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Model                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ GPT-3.5 Turbo (Faster, Lower Cost)                     ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│         │                                                        │
│         ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ● GPT-3.5 Turbo (Faster, Lower Cost)                      │ │
│  │   GPT-4 (Higher Quality)                                   │ │
│  │   GPT-4 Turbo (Best Balance)                               │ │
│  │   GPT-4o (Latest, Fastest)                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Model Dropdown - Grok

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Model                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Grok Beta (Latest)                                      ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│         │                                                        │
│         ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ● Grok Beta (Latest)                                       │ │
│  │   Grok 2 Latest (Most Advanced)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Model Dropdown - Gemini

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Model                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Gemini Pro (Balanced)                                   ▼ │ │
│  └────────────────────────────────────────────────────────────┘ │
│         │                                                        │
│         ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ● Gemini Pro (Balanced)                                    │ │
│  │   Gemini 1.5 Pro (Advanced)                                │ │
│  │   Gemini 1.5 Flash (Fastest)                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Location in Admin Settings

```
Admin Dashboard
    ↓
Settings (in sidebar or top menu)
    ↓
Scroll down past "Payment Gateways"
    ↓
"AI Goal Creation" section
    ↓
Provider dropdown is at the TOP of this section
```

## Step-by-Step Visual Flow

### Step 1: Navigate to Settings
```
┌─────────────────────────────────────┐
│  Admin Dashboard                    │
│                                     │
│  [Dashboard] [Users] [Settings] ←  │
│                                     │
└─────────────────────────────────────┘
```

### Step 2: Scroll to AI Section
```
┌─────────────────────────────────────┐
│  Payment Gateways                   │
│  [Stripe] [Kpay] [Polar]           │
└─────────────────────────────────────┘
         ↓ Scroll down
┌─────────────────────────────────────┐
│  ✨ AI Goal Creation  ← HERE!       │
│  [Provider Dropdown]                │
│  [Enable Toggle]                    │
│  [Model Dropdown]                   │
└─────────────────────────────────────┘
```

### Step 3: Select Provider
```
Click on "AI Provider" dropdown
         ↓
┌─────────────────────────────────────┐
│  ● OpenAI              ✓            │
│    Grok (xAI)                       │
│    Google Gemini       ✓            │
└─────────────────────────────────────┘
         ↓
Select your preferred provider
```

### Step 4: Enable AI
```
┌─────────────────────────────────────┐
│  Enable AI Goal Creation            │
│  [✓ API Key Configured]  [OFF] ○──○ │
└─────────────────────────────────────┘
         ↓ Click toggle
┌─────────────────────────────────────┐
│  Enable AI Goal Creation            │
│  [✓ API Key Configured]  [ON] ●──○  │
└─────────────────────────────────────┘
```

### Step 5: Select Model
```
Model dropdown appears when AI is enabled
         ↓
┌─────────────────────────────────────┐
│  AI Model                           │
│  [GPT-3.5 Turbo ▼]                 │
└─────────────────────────────────────┘
         ↓
Select your preferred model
```

## Color Coding

### Green (✓) - Configured
```
[✓ API Key Configured]  ← Green badge
✓ OPENAI_API_KEY        ← Green checkmark
```

### Red (✗) - Not Configured
```
[✗ API Key Missing]     ← Red badge
✗ GROK_API_KEY          ← Red X
```

### Blue - Active/Enabled
```
[ON] ●──○               ← Blue toggle (right side)
```

### Gray - Inactive/Disabled
```
[OFF] ○──○              ← Gray toggle (left side)
```

## Common Issues

### Issue 1: Don't See Provider Dropdown

**What you see:**
```
┌─────────────────────────────────────┐
│  ✨ AI Goal Creation                │
│                                     │
│  Enable AI Goal Creation [Toggle]  │
│  AI Model [Dropdown]                │
│                                     │
│  ← No "AI Provider" dropdown!       │
└─────────────────────────────────────┘
```

**Solution:** Run the database migration first!

### Issue 2: Provider Dropdown is Empty

**What you see:**
```
┌─────────────────────────────────────┐
│  AI Provider                        │
│  [                              ▼] │
│  ← Empty dropdown!                  │
└─────────────────────────────────────┘
```

**Solution:** Clear cache and hard refresh (Ctrl+F5)

### Issue 3: Can't Select Provider

**What you see:**
```
┌─────────────────────────────────────┐
│  AI Provider                        │
│  [OpenAI                        ▼] │
│  ← Grayed out, can't click!         │
└─────────────────────────────────────┘
```

**Solution:** Disable AI first, then you can change provider

## Success Checklist

After setup, you should be able to:

- [ ] See "AI Provider" dropdown at top of AI section
- [ ] Click dropdown and see 3 providers
- [ ] See checkmarks (✓) next to providers with configured keys
- [ ] Select a provider
- [ ] See "Enable AI Goal Creation" toggle
- [ ] See green "API Key Configured" badge
- [ ] Toggle AI ON
- [ ] See "AI Model" dropdown appear
- [ ] Select a model from the list
- [ ] Models change when you switch providers

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Brave (latest)

## Mobile View

On mobile, the layout stacks vertically:

```
┌──────────────────────┐
│  AI Provider         │
│  [OpenAI         ▼] │
│                      │
│  Enable AI           │
│  [✓ Configured]      │
│  [ON] ●──○           │
│                      │
│  AI Model            │
│  [GPT-3.5        ▼] │
└──────────────────────┘
```

---

**Still don't see it?** Run `ADD_AI_PROVIDERS_NOW.sql` in Supabase SQL Editor, then refresh!
