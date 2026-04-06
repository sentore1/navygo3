# Quick Start - Goals API

## 🚀 Get Started in 3 Steps

### Step 1: Add Environment Variables

Add to `.env.local`:
```bash
GOALS_API_KEY=generate-a-secure-random-key-here
ADMIN_API_KEY=generate-another-secure-random-key-here
OPENAI_API_KEY=sk-your-openai-api-key
```

Generate keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Restart Server

```bash
npm run dev
```

### Step 3: Test It!

Visit: `http://localhost:3000/admin/ai-goals`

Or use cURL:
```bash
curl -X POST http://localhost:3000/api/admin/goals/create-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to learn Python",
    "difficulty": "medium",
    "userId": "your-user-uuid",
    "adminApiKey": "your-admin-api-key"
  }'
```

---

## 📚 Two Endpoints

### 1. User Endpoint (Authenticated)
```
POST /api/goals/create-with-ai
```
- Requires: User logged in + Pro subscription
- Creates and saves goal to database

### 2. Admin Endpoint (API Key)
```
POST /api/admin/goals/create-with-ai
```
- Requires: Admin API key
- Generates goal data (doesn't save)
- Works for any user

---

## 💡 Quick Examples

### JavaScript
```javascript
const response = await fetch('/api/admin/goals/create-with-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'I want to run a marathon',
    difficulty: 'hard',
    userId: 'user-uuid',
    adminApiKey: process.env.ADMIN_API_KEY
  })
});

const data = await response.json();
console.log(data.goal);
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3000/api/admin/goals/create-with-ai',
    json={
        'prompt': 'I want to learn guitar',
        'difficulty': 'medium',
        'userId': 'user-uuid',
        'adminApiKey': 'your-admin-api-key'
    }
)

print(response.json())
```

---

## 🎯 Difficulty Levels

- **easy**: 3 milestones
- **medium**: 5 milestones (default)
- **hard**: 7 milestones

---

## 📖 Full Documentation

- `API_GOALS_DOCUMENTATION.md` - Complete API reference
- `GOALS_API_SETUP_GUIDE.md` - Detailed setup guide
- `GOALS_API_SUMMARY.md` - Implementation overview

---

## 🔧 Troubleshooting

**"Invalid API key"**
→ Check `.env.local` and restart server

**"User not found"**
→ Verify user UUID exists in database

**"Failed to generate goal"**
→ Check OPENAI_API_KEY is valid

---

## ✅ That's It!

You now have a working API to create goals with AI. Visit `/admin/ai-goals` to try it out!
