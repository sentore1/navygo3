# API Quick Reference

## Your Application Has 22 APIs

### 🔐 User Management (3)
```
GET  /api/current-user          - Get logged in user
POST /api/contact               - Send contact message
POST /api/send-notification     - Send email notification
```

### 💳 Subscriptions (10)
```
GET  /api/check-subscription    - Check subscription status
POST /api/activate-subscription - Activate subscription
POST /api/clear-subscription    - Cancel subscription

POST /api/polar-checkout        - Start Polar checkout
POST /api/polar-webhook         - Handle Polar events
GET  /api/polar-products        - Get Polar products

POST /api/kpay-checkout         - Start Kpay payment
POST /api/kpay-webhook          - Handle Kpay events

POST /api/verify-checkout       - Verify checkout
POST /api/verify-payment        - Verify payment
```

### 🎯 Goals & AI (2)
```
POST /api/goals/create-with-ai        - User creates goal with AI
POST /api/admin/goals/create-with-ai  - Admin generates goal
```

### 👨‍💼 Admin (5)
```
GET  /api/admin/ai-settings     - Get AI config
POST /api/admin/ai-settings     - Update AI config
GET  /api/admin/check-env       - Check environment vars
POST /api/admin/block-user      - Block user
POST /api/admin/unblock-user    - Unblock user
```

### 📊 Analytics (1)
```
POST /api/analytics/track       - Track events
```

### 🛠️ Utilities (1)
```
POST /api/convert-currency      - Convert currency
```

---

## AI Providers Supported

### OpenAI
- GPT-3.5 Turbo
- GPT-4
- GPT-4 Turbo
- GPT-4o

### Grok (xAI)
- Grok Beta
- Grok 2 Latest

### Gemini (Google)
- Gemini Pro
- Gemini 1.5 Pro
- Gemini 1.5 Flash

---

## Payment Providers Supported

1. **Stripe** - Credit cards, digital wallets
2. **Polar** - Subscription management
3. **Kpay** - Rwanda mobile money

---

## Authentication Types

| Type | Used By | How |
|------|---------|-----|
| Session Cookie | Most endpoints | Automatic |
| API Key | AI endpoints | In request body |
| Admin Role | Admin endpoints | Session + role check |
| Webhook Signature | Webhooks | Provider signature |

---

## Quick Setup

### 1. Environment Variables
```bash
# AI Providers (choose one or more)
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...
GEMINI_API_KEY=AIzaSy...

# API Keys
GOALS_API_KEY=your-key
ADMIN_API_KEY=your-admin-key

# Payment Providers
STRIPE_SECRET_KEY=sk_...
POLAR_API_KEY=polar_...
KPAY_API_URL=https://api.kpay.rw
```

### 2. Database Migration
```sql
-- Add AI provider support
ALTER TABLE ai_settings 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(20) DEFAULT 'openai';
```

### 3. Configure in Admin
1. Go to `/admin/settings`
2. Select AI Provider
3. Enable AI
4. Select Model

---

## Most Used APIs

### For Users
1. `/api/goals/create-with-ai` - Create goals with AI
2. `/api/check-subscription` - Check subscription
3. `/api/polar-checkout` - Subscribe to Pro

### For Admins
1. `/api/admin/ai-settings` - Configure AI
2. `/api/admin/check-env` - Verify setup
3. `/api/admin/goals/create-with-ai` - Generate goals

---

## Testing APIs

### Test User API
```bash
curl http://localhost:3000/api/current-user \
  -H "Cookie: your-session-cookie"
```

### Test Admin API
```bash
curl -X POST http://localhost:3000/api/admin/ai-settings \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-session" \
  -d '{"ai_enabled": true}'
```

### Test AI Goal Creation
```bash
curl -X POST http://localhost:3000/api/goals/create-with-ai \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session" \
  -d '{
    "prompt": "I want to learn Python",
    "difficulty": "medium",
    "apiKey": "your-api-key"
  }'
```

---

## Documentation Files

- `COMPLETE_API_LIST.md` - Full API documentation
- `API_GOALS_DOCUMENTATION.md` - Goals API details
- `MULTI_AI_PROVIDER_GUIDE.md` - AI providers guide
- `HOW_PRO_DETECTION_WORKS.md` - Subscription detection

---

**Total: 22 APIs across 6 categories**
