# Admin AI Settings Interface - Visual Guide

## Admin Settings Page Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  ← Back to Admin          Admin Settings                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ⚠️  Security Notice: Environment Variables                        │
│  For security, environment variables should be configured in       │
│  your hosting platform or .env.local file.                         │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Payment Gateways                                                  │
│  Enable or disable payment gateways for your application           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Stripe  [✓ Configured]                          [ON] ●──○   │ │
│  │  Accept credit cards and digital wallets worldwide            │ │
│  │  Required: ✓ STRIPE_SECRET_KEY  ✓ STRIPE_WEBHOOK_SECRET      │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │  Kpay  [⚠ Partially Configured]                  [OFF] ○──○  │ │
│  │  Local payment gateway for Rwanda (Mobile Money)              │ │
│  │  Required: ✓ KPAY_API_URL  ✗ KPAY_USERNAME  ✗ KPAY_PASSWORD  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │  Polar  [✓ Configured]                           [ON] ●──○   │ │
│  │  Subscription management and billing platform                 │ │
│  │  Required: ✓ POLAR_API_KEY  ✓ POLAR_ORGANIZATION_ID          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✨ AI Goal Creation                                               │
│  Configure AI-powered goal creation for Pro users                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Enable AI Goal Creation  [✓ API Key Configured]  [ON] ●──○  │ │
│  │  Allow Pro users to create goals using AI assistance          │ │
│  │  Required: ✓ OPENAI_API_KEY                                   │ │
│  │                                                                │ │
│  │  ─────────────────────────────────────────────────────────    │ │
│  │                                                                │ │
│  │  AI Model                                                      │ │
│  │  [GPT-3.5 Turbo (Faster, Lower Cost)        ▼]               │ │
│  │  Choose the AI model for goal generation.                     │ │
│  │  GPT-3.5 is recommended for most use cases.                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  How to Configure Environment Variables                            │
│  Add these variables to your hosting platform or .env.local file   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Local Development (.env.local)                               │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ # Payment Gateways                                      │  │ │
│  │  │ STRIPE_SECRET_KEY=sk_test_xxxxx                         │  │ │
│  │  │ STRIPE_WEBHOOK_SECRET=whsec_xxxxx                       │  │ │
│  │  │ KPAY_API_URL=https://api.kpay.rw                        │  │ │
│  │  │ POLAR_API_KEY=polar_xxxxx                               │  │ │
│  │  │                                                          │  │ │
│  │  │ # AI Settings                                            │  │ │
│  │  │ OPENAI_API_KEY=sk-xxxxx                                 │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Production (Hosting Platform)                                     │
│  • Vercel: Project Settings → Environment Variables               │
│  • Netlify: Site Settings → Environment Variables                 │
│  • Railway: Project → Variables                                    │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## AI Settings States

### State 1: API Key Not Configured

```
┌──────────────────────────────────────────────────────────────┐
│  ✨ AI Goal Creation                                         │
│  Configure AI-powered goal creation for Pro users            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Enable AI Goal Creation  [✗ API Key Missing]  [OFF]  │ │
│  │  (Toggle is disabled - grayed out)                     │ │
│  │  Allow Pro users to create goals using AI assistance   │ │
│  │  Required: ✗ OPENAI_API_KEY                            │ │
│  │                                                         │ │
│  │  ⚠️  OpenAI API Key Required                           │ │
│  │  To enable AI goal creation, you need to add your      │ │
│  │  OpenAI API key to the environment variables.          │ │
│  │  Get your API key from OpenAI Platform.                │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### State 2: API Key Configured, AI Disabled

```
┌──────────────────────────────────────────────────────────────┐
│  ✨ AI Goal Creation                                         │
│  Configure AI-powered goal creation for Pro users            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Enable AI Goal Creation  [✓ API Key Configured]       │ │
│  │                                          [OFF] ○──○     │ │
│  │  Allow Pro users to create goals using AI assistance   │ │
│  │  Required: ✓ OPENAI_API_KEY                            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### State 3: API Key Configured, AI Enabled

```
┌──────────────────────────────────────────────────────────────┐
│  ✨ AI Goal Creation                                         │
│  Configure AI-powered goal creation for Pro users            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Enable AI Goal Creation  [✓ API Key Configured]       │ │
│  │                                          [ON] ●──○      │ │
│  │  Allow Pro users to create goals using AI assistance   │ │
│  │  Required: ✓ OPENAI_API_KEY                            │ │
│  │                                                         │ │
│  │  ─────────────────────────────────────────────────     │ │
│  │                                                         │ │
│  │  AI Model                                               │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ GPT-3.5 Turbo (Faster, Lower Cost)          ▼  │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  Choose the AI model for goal generation.              │ │
│  │  GPT-3.5 is recommended for most use cases.            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## AI Model Dropdown Options

```
┌──────────────────────────────────────────────────────┐
│  AI Model                                            │
│  ┌────────────────────────────────────────────────┐ │
│  │ GPT-3.5 Turbo (Faster, Lower Cost)        ▼  │ │
│  └────────────────────────────────────────────────┘ │
│         │                                            │
│         ▼                                            │
│  ┌────────────────────────────────────────────────┐ │
│  │ ● GPT-3.5 Turbo (Faster, Lower Cost)         │ │
│  │   GPT-4 (Higher Quality)                      │ │
│  │   GPT-4 Turbo (Best Balance)                  │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## User Experience Flow

### Pro User - AI Enabled

```
┌─────────────────────────────────────────────────────────┐
│  My Goals                                               │
│  Track your progress and achieve your goals             │
│                                                         │
│  [+ New Goal]  [✨]  ← Sparkle button visible          │
│                                                         │
│  User clicks sparkle button                            │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ✨ AI Goal Creator                             │   │
│  │                                                  │   │
│  │  Difficulty: [Easy] [Medium] [Hard]             │   │
│  │                                                  │   │
│  │  Goal Description:                               │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ I want to learn Python programming        │ │   │
│  │  │                                            │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  │                                                  │   │
│  │  [Cancel]              [✨ Generate Goal]       │   │
│  └─────────────────────────────────────────────────┘   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ✨ AI-Generated Goal                           │   │
│  │                                                  │   │
│  │  🎯 Learn Python Programming                    │   │
│  │  Learning goal to acquire new knowledge...      │   │
│  │                                                  │   │
│  │  Milestones (5):                                │   │
│  │  1. Research learning resources                 │   │
│  │  2. Create a structured learning plan           │   │
│  │  3. Complete introductory materials             │   │
│  │  4. Practice with real projects                 │   │
│  │  5. Achieve proficiency                         │   │
│  │                                                  │   │
│  │  [Regenerate]              [🎯 Use Goal]        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Basic User - AI Enabled

```
┌─────────────────────────────────────────────────────────┐
│  My Goals                                               │
│  Track your progress and achieve your goals             │
│                                                         │
│  [+ New Goal]  [✨]  ← Sparkle button visible          │
│                                                         │
│  User clicks sparkle button                            │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔒 Upgrade to Pro                              │   │
│  │                                                  │   │
│  │  AI goal creation is a Pro feature.             │   │
│  │  Upgrade to create goals with AI assistance.    │   │
│  │                                                  │   │
│  │  [View Pricing]                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Any User - AI Disabled

```
┌─────────────────────────────────────────────────────────┐
│  My Goals                                               │
│  Track your progress and achieve your goals             │
│                                                         │
│  [+ New Goal]  ← No sparkle button                     │
│                                                         │
│  (AI feature is hidden when disabled by admin)         │
└─────────────────────────────────────────────────────────┘
```

## Admin Decision Flow

```
                    ┌─────────────────┐
                    │  Admin Logs In  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Go to Settings  │
                    └────────┬────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │ Check AI Settings Section  │
                └────────┬───────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐    ┌──────────┐    ┌──────────┐
    │ Green  │    │  Yellow  │    │   Red    │
    │ Badge  │    │  Badge   │    │  Badge   │
    └───┬────┘    └────┬─────┘    └────┬─────┘
        │              │               │
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ Toggle  │   │  Check   │   │   Add    │
   │   ON    │   │   Env    │   │ API Key  │
   └─────────┘   │   Vars   │   └──────────┘
                 └──────────┘
                      │
                      ▼
                 ┌──────────┐
                 │ Restart  │
                 │   App    │
                 └──────────┘
```

## Badge Color Meanings

### Green Badge: "✓ API Key Configured"
```
┌──────────────────────────┐
│ ✓ API Key Configured     │  ← Green background
└──────────────────────────┘

Meaning: Everything is ready
Action: Can enable AI
```

### Red Badge: "✗ API Key Missing"
```
┌──────────────────────────┐
│ ✗ API Key Missing        │  ← Red background
└──────────────────────────┘

Meaning: OpenAI key not found
Action: Add OPENAI_API_KEY to environment
```

### Yellow Badge: "⚠ Partially Configured"
```
┌──────────────────────────┐
│ ⚠ Partially Configured   │  ← Yellow background
└──────────────────────────┘

Meaning: Some env vars missing (for payment gateways)
Action: Add missing environment variables
```

## Toggle States

### Enabled (ON)
```
[ON] ●──○
     ^
     Blue/Primary color
     Slider on the right
```

### Disabled (OFF)
```
[OFF] ○──○
      ^
      Gray color
      Slider on the left
```

### Disabled (Grayed Out)
```
[OFF] ○──○  (Cannot click)
      ^
      Light gray
      Cursor: not-allowed
```

## Responsive Design

### Desktop View
```
┌────────────────────────────────────────────────────────┐
│  Enable AI Goal Creation  [✓ Configured]    [ON] ●──○ │
│  Full text visible                                     │
└────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────────────────┐
│  Enable AI Goal Creation     │
│  [✓ Configured]   [ON] ●──○  │
│  Stacked layout              │
└──────────────────────────────┘
```

## Success Messages

### When Enabling AI
```
┌────────────────────────────────────────┐
│  ✓ Success                             │
│  AI goal creation enabled for Pro users│
└────────────────────────────────────────┘
```

### When Changing Model
```
┌────────────────────────────────────────┐
│  ✓ Success                             │
│  AI model updated to GPT-4 Turbo       │
└────────────────────────────────────────┘
```

## Error Messages

### Cannot Enable Without API Key
```
┌────────────────────────────────────────┐
│  ✗ Error                               │
│  Cannot enable AI: OPENAI_API_KEY      │
│  environment variable is not configured│
└────────────────────────────────────────┘
```

### API Key Invalid
```
┌────────────────────────────────────────┐
│  ✗ Error                               │
│  OpenAI API key is invalid or expired  │
│  Please check your API key             │
└────────────────────────────────────────┘
```

---

## Quick Visual Reference

### Status Indicators
- 🟢 Green Badge = Ready to use
- 🔴 Red Badge = Configuration needed
- 🟡 Yellow Badge = Partial configuration

### Toggle States
- ●──○ (Blue) = Enabled
- ○──○ (Gray) = Disabled
- ○──○ (Light Gray) = Cannot enable

### Icons
- ✨ = AI features
- ✓ = Configured/Success
- ✗ = Missing/Error
- ⚠️ = Warning/Attention needed

---

This visual guide helps you understand the admin interface at a glance!
