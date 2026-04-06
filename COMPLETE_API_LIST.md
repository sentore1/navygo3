# Complete API List - Your Application

## Overview

Your application has **23 API endpoints** organized into these categories:
1. **User Management** (3 endpoints)
2. **Subscriptions** (7 endpoints)
3. **Goals & AI** (2 endpoints)
4. **Admin** (5 endpoints)
5. **Analytics** (1 endpoint)
6. **Utilities** (5 endpoints)

---

## 1. User Management APIs

### GET /api/current-user
**Purpose:** Get current authenticated user information

**Authentication:** Required (session cookie)

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user|admin"
  }
}
```

**Use Case:** Check who is logged in

---

### POST /api/contact
**Purpose:** Send contact form messages

**Authentication:** Optional

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Use Case:** Contact form submissions

---

### POST /api/send-notification
**Purpose:** Send email notifications to users

**Authentication:** Required

**Request:**
```json
{
  "to": "user@example.com",
  "subject": "Notification",
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true
}
```

**Use Case:** Email notifications

---

## 2. Subscription APIs

### GET /api/check-subscription
**Purpose:** Check user's subscription status

**Authentication:** Required

**Response:**
```json
{
  "status": "active|inactive",
  "plan": "Pro|Delta Goal|Basic",
  "provider": "polar|kpay"
}
```

**Use Case:** Verify if user has active subscription

---

### POST /api/activate-subscription
**Purpose:** Activate a subscription for a user

**Authentication:** Required

**Request:**
```json
{
  "subscriptionId": "sub_xxx",
  "provider": "polar|kpay"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {...}
}
```

**Use Case:** Activate subscription after payment

---

### POST /api/clear-subscription
**Purpose:** Clear/cancel user's subscription

**Authentication:** Required

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Use Case:** Cancel subscription

---

### POST /api/polar-checkout
**Purpose:** Create Polar checkout session

**Authentication:** Required

**Request:**
```json
{
  "productId": "prod_xxx",
  "priceId": "price_xxx"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://polar.sh/checkout/..."
}
```

**Use Case:** Start Polar subscription checkout

---

### POST /api/polar-webhook
**Purpose:** Handle Polar webhook events

**Authentication:** Webhook signature

**Request:** Polar webhook payload

**Response:**
```json
{
  "received": true
}
```

**Use Case:** Process Polar subscription events

---

### GET /api/polar-products
**Purpose:** Get available Polar products/plans

**Authentication:** Optional

**Response:**
```json
{
  "products": [
    {
      "id": "prod_xxx",
      "name": "Pro",
      "price": 50,
      "has_ai_access": true
    }
  ]
}
```

**Use Case:** Display pricing plans

---

### POST /api/kpay-checkout
**Purpose:** Create Kpay checkout session

**Authentication:** Required

**Request:**
```json
{
  "plan": "Pro|Delta Goal",
  "amount": 50
}
```

**Response:**
```json
{
  "checkoutUrl": "https://kpay.rw/checkout/...",
  "transactionId": "txn_xxx"
}
```

**Use Case:** Start Kpay payment

---

### POST /api/kpay-webhook
**Purpose:** Handle Kpay webhook events

**Authentication:** Webhook signature

**Request:** Kpay webhook payload

**Response:**
```json
{
  "received": true
}
```

**Use Case:** Process Kpay payment events

---

### POST /api/verify-checkout
**Purpose:** Verify checkout completion

**Authentication:** Required

**Request:**
```json
{
  "checkoutId": "checkout_xxx",
  "provider": "polar|kpay"
}
```

**Response:**
```json
{
  "verified": true,
  "subscription": {...}
}
```

**Use Case:** Confirm payment success

---

### POST /api/verify-payment
**Purpose:** Verify payment status

**Authentication:** Required

**Request:**
```json
{
  "paymentId": "pay_xxx"
}
```

**Response:**
```json
{
  "status": "completed|pending|failed",
  "amount": 50
}
```

**Use Case:** Check payment status

---

## 3. Goals & AI APIs

### POST /api/goals/create-with-ai
**Purpose:** Create a goal using AI for authenticated users

**Authentication:** Required (session cookie)

**Authorization:** Pro subscription with AI access

**Request:**
```json
{
  "prompt": "I want to learn Python",
  "difficulty": "medium",
  "targetDate": "2026-12-31T00:00:00.000Z",
  "apiKey": "your-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "goal": {
    "id": "goal-uuid",
    "title": "Learn Python",
    "description": "Learning goal...",
    "milestones": [
      {
        "id": "milestone-uuid",
        "title": "Research learning resources",
        "description": "Find books, courses...",
        "completed": false
      }
    ],
    "progress": 0,
    "createdAt": "2026-04-06T..."
  }
}
```

**Use Case:** Pro users creating goals with AI assistance

---

### POST /api/admin/goals/create-with-ai
**Purpose:** Generate goal data using AI (admin only)

**Authentication:** Admin API key

**Request:**
```json
{
  "prompt": "I want to run a marathon",
  "difficulty": "hard",
  "userId": "user-uuid",
  "adminApiKey": "your-admin-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "goal": {
    "title": "Run a Marathon",
    "description": "Fitness goal...",
    "milestones": [...]
  },
  "note": "Goal data returned but not saved"
}
```

**Use Case:** Admin generating goal templates

---

## 4. Admin APIs

### GET /api/admin/ai-settings
**Purpose:** Get AI configuration settings

**Authentication:** Admin only

**Response:**
```json
{
  "success": true,
  "settings": {
    "ai_enabled": true,
    "ai_model": "gpt-3.5-turbo",
    "ai_provider": "openai",
    "openai_api_key_configured": true,
    "grok_api_key_configured": false,
    "gemini_api_key_configured": false,
    "current_provider_configured": true
  }
}
```

**Use Case:** Check AI configuration status

---

### POST /api/admin/ai-settings
**Purpose:** Update AI configuration

**Authentication:** Admin only

**Request:**
```json
{
  "ai_enabled": true,
  "ai_model": "gpt-4",
  "ai_provider": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI settings updated successfully",
  "settings": {...}
}
```

**Use Case:** Configure AI provider and model

---

### GET /api/admin/check-env
**Purpose:** Check environment variables status

**Authentication:** Admin only

**Response:**
```json
{
  "status": {
    "OPENAI_API_KEY": true,
    "GROK_API_KEY": false,
    "GEMINI_API_KEY": true,
    "STRIPE_SECRET_KEY": true,
    "POLAR_API_KEY": true
  }
}
```

**Use Case:** Verify environment configuration

---

### POST /api/admin/block-user
**Purpose:** Block a user account

**Authentication:** Admin only

**Request:**
```json
{
  "userId": "user-uuid",
  "reason": "Violation of terms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

**Use Case:** Moderate user accounts

---

### POST /api/admin/unblock-user
**Purpose:** Unblock a user account

**Authentication:** Admin only

**Request:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

**Use Case:** Restore user access

---

## 5. Analytics API

### POST /api/analytics/track
**Purpose:** Track user events and analytics

**Authentication:** Required

**Request:**
```json
{
  "event": "goal_created",
  "properties": {
    "goalId": "goal-uuid",
    "difficulty": "medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "tracked": true
}
```

**Use Case:** Track user behavior and events

---

## 6. Utility APIs

### POST /api/convert-currency
**Purpose:** Convert between currencies

**Authentication:** Optional

**Request:**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "RWF"
}
```

**Response:**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "RWF",
  "converted": 130000,
  "rate": 1300
}
```

**Use Case:** Display prices in local currency

---

## API Summary by Category

### User Management (3)
- ✅ GET /api/current-user
- ✅ POST /api/contact
- ✅ POST /api/send-notification

### Subscriptions (10)
- ✅ GET /api/check-subscription
- ✅ POST /api/activate-subscription
- ✅ POST /api/clear-subscription
- ✅ POST /api/polar-checkout
- ✅ POST /api/polar-webhook
- ✅ GET /api/polar-products
- ✅ POST /api/kpay-checkout
- ✅ POST /api/kpay-webhook
- ✅ POST /api/verify-checkout
- ✅ POST /api/verify-payment

### Goals & AI (2)
- ✅ POST /api/goals/create-with-ai
- ✅ POST /api/admin/goals/create-with-ai

### Admin (5)
- ✅ GET /api/admin/ai-settings
- ✅ POST /api/admin/ai-settings
- ✅ GET /api/admin/check-env
- ✅ POST /api/admin/block-user
- ✅ POST /api/admin/unblock-user

### Analytics (1)
- ✅ POST /api/analytics/track

### Utilities (1)
- ✅ POST /api/convert-currency

**Total: 22 API Endpoints**

---

## Authentication Methods

### 1. Session Cookie
Used by most user-facing endpoints
- Automatic with Next.js
- Managed by Supabase Auth

### 2. API Key
Used by AI goal creation endpoints
- Set in environment variables
- Passed in request body

### 3. Admin Role
Used by admin endpoints
- Checks `users.role = 'admin'`
- Requires session + admin role

### 4. Webhook Signature
Used by webhook endpoints
- Verifies request from payment provider
- Prevents unauthorized calls

---

## Environment Variables Required

### Payment Providers
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
POLAR_API_KEY=polar_...
POLAR_ORGANIZATION_ID=org_...
POLAR_WEBHOOK_SECRET=polar_whsec_...
KPAY_API_URL=https://api.kpay.rw
KPAY_USERNAME=your_username
KPAY_PASSWORD=your_password
KPAY_RETAILER_ID=retailer_id
KPAY_BANK_ID=bank_id
```

### AI Providers
```bash
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...
GEMINI_API_KEY=AIzaSy...
```

### API Keys
```bash
GOALS_API_KEY=your-secure-key
ADMIN_API_KEY=your-admin-key
```

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## API Usage Examples

### Example 1: Check User Subscription
```javascript
const response = await fetch('/api/check-subscription', {
  credentials: 'include'
});
const data = await response.json();
console.log(data.status); // 'active' or 'inactive'
```

### Example 2: Create Goal with AI
```javascript
const response = await fetch('/api/goals/create-with-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    prompt: 'I want to learn Spanish',
    difficulty: 'medium',
    apiKey: process.env.NEXT_PUBLIC_GOALS_API_KEY
  })
});
const data = await response.json();
console.log(data.goal);
```

### Example 3: Update AI Settings (Admin)
```javascript
const response = await fetch('/api/admin/ai-settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    ai_enabled: true,
    ai_model: 'gpt-4',
    ai_provider: 'openai'
  })
});
const data = await response.json();
console.log(data.message);
```

---

## Rate Limiting

Currently, there is **no rate limiting** implemented. Consider adding:
- Rate limiting middleware
- Per-user limits
- Per-IP limits
- API key quotas

---

## Security Best Practices

1. ✅ API keys stored in environment variables
2. ✅ Admin endpoints check user role
3. ✅ Webhook endpoints verify signatures
4. ✅ Session-based authentication
5. ⚠️ Consider adding rate limiting
6. ⚠️ Consider adding request logging
7. ⚠️ Consider adding API versioning

---

## Next Steps

### Recommended Additions

1. **Rate Limiting**
   - Add middleware to limit requests
   - Prevent API abuse

2. **API Documentation**
   - Add Swagger/OpenAPI docs
   - Interactive API explorer

3. **Monitoring**
   - Log all API calls
   - Track errors and performance
   - Set up alerts

4. **Versioning**
   - Add /v1/ prefix to APIs
   - Plan for future versions

5. **Webhooks**
   - Add webhook management UI
   - Allow users to configure webhooks

---

## Support

For detailed documentation on specific APIs:
- Goals API: See `API_GOALS_DOCUMENTATION.md`
- AI Settings: See `MULTI_AI_PROVIDER_GUIDE.md`
- Pro Detection: See `HOW_PRO_DETECTION_WORKS.md`
