# Goals API with AI - Complete Implementation

## 📋 Overview

This implementation adds API endpoints to your admin system that allow you to create goals using AI. The AI generates structured goals with detailed milestones based on natural language prompts.

## 🎯 What You Can Do

- Generate personalized goals with AI-powered milestones
- Create goals for any user via API
- Integrate goal creation into external systems
- Bulk create goals for multiple users
- Test and preview goals before saving

## 📁 Files Created

```
API Routes:
├── src/app/api/goals/create-with-ai/route.ts          # User endpoint
└── src/app/api/admin/goals/create-with-ai/route.ts    # Admin endpoint

Admin Interface:
└── src/app/admin/ai-goals/page.tsx                    # Visual interface

Documentation:
├── API_GOALS_DOCUMENTATION.md                          # Complete API docs
├── GOALS_API_SETUP_GUIDE.md                           # Setup instructions
├── GOALS_API_SUMMARY.md                               # Implementation details
├── QUICK_START_GOALS_API.md                           # Quick reference
└── README_GOALS_API.md                                # This file

Testing:
└── test-goals-api.js                                  # Automated test script
```

## 🚀 Quick Start

### 1. Environment Setup (2 minutes)

Add to `.env.local`:
```bash
# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
GOALS_API_KEY=your-secure-api-key
ADMIN_API_KEY=your-secure-admin-api-key

# Your OpenAI API key
OPENAI_API_KEY=sk-your-openai-api-key
```

### 2. Restart Server

```bash
npm run dev
```

### 3. Test via Admin UI

Visit: `http://localhost:3000/admin/ai-goals`

1. Enter a user UUID
2. Type a goal (e.g., "I want to learn Python")
3. Select difficulty
4. Click "Generate Goal with AI"

### 4. Or Test via API

```bash
curl -X POST http://localhost:3000/api/admin/goals/create-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to learn Python",
    "difficulty": "medium",
    "userId": "user-uuid-here",
    "adminApiKey": "your-admin-api-key"
  }'
```

## 🔑 Key Features

### Two Endpoints for Different Use Cases

#### User Endpoint
- **Path:** `/api/goals/create-with-ai`
- **Auth:** Session cookie (user must be logged in)
- **Access:** Requires Pro subscription with AI access
- **Action:** Creates and saves goal to database
- **Use Case:** User creates their own goal

#### Admin Endpoint
- **Path:** `/api/admin/goals/create-with-ai`
- **Auth:** Admin API key
- **Access:** Works for any user
- **Action:** Generates goal data (doesn't save)
- **Use Case:** Admin generates goals for users

### AI-Powered Goal Generation

The AI analyzes the prompt and:
- Creates a clear, actionable goal title
- Writes a detailed description
- Generates 3-7 milestones (based on difficulty)
- Provides descriptions for each milestone
- Adapts to different goal types (financial, fitness, learning, career)

### Difficulty Levels

- **Easy:** 3 milestones, gentle progression
- **Medium:** 5 milestones, balanced challenge
- **Hard:** 7 milestones, ambitious progression

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `QUICK_START_GOALS_API.md` | Get started in 3 steps |
| `API_GOALS_DOCUMENTATION.md` | Complete API reference with examples |
| `GOALS_API_SETUP_GUIDE.md` | Detailed setup and integration guide |
| `GOALS_API_SUMMARY.md` | Technical implementation details |

## 💻 Usage Examples

### JavaScript/TypeScript

```typescript
// Admin generating goal for a user
const response = await fetch('/api/admin/goals/create-with-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'I want to save $10,000 for a vacation',
    difficulty: 'medium',
    userId: 'user-uuid',
    adminApiKey: process.env.ADMIN_API_KEY
  })
});

const { goal } = await response.json();
console.log('Generated:', goal.title);
console.log('Milestones:', goal.milestones.length);
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/admin/goals/create-with-ai',
    json={
        'prompt': 'I want to run a marathon',
        'difficulty': 'hard',
        'userId': 'user-uuid',
        'adminApiKey': 'your-admin-api-key'
    }
)

goal = response.json()['goal']
print(f"Title: {goal['title']}")
print(f"Milestones: {len(goal['milestones'])}")
```

### Node.js Test Script

```bash
# Set environment variables
export ADMIN_API_KEY=your-admin-api-key
export USER_ID=user-uuid
export API_URL=http://localhost:3000

# Run automated tests
node test-goals-api.js
```

## 🎨 Admin Interface

The admin interface at `/admin/ai-goals` provides:

- User-friendly form for goal generation
- Difficulty selector with descriptions
- Example prompts
- Real-time result display
- Milestone preview
- JSON response viewer
- API information panel

## 🔒 Security

- **API Key Authentication:** Both endpoints require API keys
- **Subscription Validation:** User endpoint checks Pro status
- **Input Validation:** All inputs are validated
- **Error Handling:** Comprehensive error messages
- **Environment Variables:** Sensitive keys stored securely

## 🧪 Testing

### Manual Testing

1. **Admin UI:** Visit `/admin/ai-goals`
2. **cURL:** Use the examples in documentation
3. **Postman/Insomnia:** Import the API examples

### Automated Testing

```bash
node test-goals-api.js
```

Tests multiple goal types and difficulty levels.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check `.env.local` and restart server |
| "User not found" | Verify user UUID exists in database |
| "Failed to generate goal" | Check OPENAI_API_KEY is valid and has credits |
| "Requires Pro subscription" | Use admin endpoint or upgrade user |

## 📊 Example Goal Types

The AI handles various goal types:

- **Financial:** Saving money, buying items, paying off debt
- **Fitness:** Running, weight loss, strength training
- **Learning:** Languages, programming, skills
- **Career:** Job search, promotion, business
- **Personal:** Habits, relationships, hobbies

## 🔄 Integration Ideas

1. **Onboarding:** Create starter goals for new users
2. **Bulk Operations:** Generate goals for user cohorts
3. **External Systems:** Integrate with CRM or other tools
4. **Automated Suggestions:** Suggest goals based on user behavior
5. **Templates:** Create goal templates for common objectives

## 📈 Next Steps

### Optional Enhancements

- [ ] Add rate limiting
- [ ] Implement logging and monitoring
- [ ] Add webhook support
- [ ] Create batch processing endpoint
- [ ] Add goal templates
- [ ] Implement caching

### Production Checklist

- [ ] Set secure API keys in production
- [ ] Enable HTTPS
- [ ] Configure monitoring
- [ ] Set up rate limiting
- [ ] Test with production OpenAI key
- [ ] Document for your team
- [ ] Set up API key rotation

## 🆘 Support

1. Check the error message and status code
2. Review the documentation files
3. Check server logs for details
4. Verify environment variables
5. Test with the provided test script

## 📝 API Request/Response Examples

### Request
```json
{
  "prompt": "I want to learn Spanish in 3 months",
  "difficulty": "medium",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "adminApiKey": "your-admin-api-key"
}
```

### Response
```json
{
  "success": true,
  "goal": {
    "title": "Learn Spanish in 3 months",
    "description": "Learning goal to acquire new knowledge...",
    "milestones": [
      {
        "id": "milestone-1",
        "title": "Research learning resources and materials",
        "description": "Find books, courses, videos...",
        "completed": false
      }
    ],
    "targetDate": "2026-07-06T00:00:00.000Z"
  },
  "message": "Goal generated successfully with AI"
}
```

## 🎉 You're Ready!

Everything is set up and ready to use. Start by:

1. Adding environment variables
2. Visiting `/admin/ai-goals`
3. Generating your first goal

For detailed information, see the documentation files listed above.

---

**Questions?** Check the documentation files or review the code comments.
