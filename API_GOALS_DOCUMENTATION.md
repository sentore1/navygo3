# Goals API Documentation

This document describes the API endpoints available for creating goals using AI.

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [User Goal Creation with AI](#user-goal-creation-with-ai)
  - [Admin Goal Generation with AI](#admin-goal-generation-with-ai)
- [Examples](#examples)
- [Error Handling](#error-handling)

---

## Authentication

### User API Key
For user endpoints, you need:
1. A valid session cookie (user must be logged in)
2. An API key set in environment variable `GOALS_API_KEY`

### Admin API Key
For admin endpoints, you need:
1. An admin API key set in environment variable `ADMIN_API_KEY`

---

## Endpoints

### User Goal Creation with AI

**Endpoint:** `POST /api/goals/create-with-ai`

**Description:** Creates a goal for the authenticated user using AI to generate milestones.

**Requirements:**
- User must be authenticated (logged in)
- User must have an active Pro subscription with AI access

**Request Body:**
```json
{
  "prompt": "I want to buy a car in 6 months",
  "difficulty": "medium",
  "targetDate": "2026-10-06T00:00:00.000Z",
  "apiKey": "your-api-key-here"
}
```

**Parameters:**
- `prompt` (required): Description of the goal you want to create
- `difficulty` (optional): One of "easy", "medium", or "hard". Default: "medium"
- `targetDate` (optional): ISO 8601 date string. Default: 30 days from now
- `apiKey` (required): Your API key for authentication

**Response (Success - 201):**
```json
{
  "success": true,
  "goal": {
    "id": "goal-uuid",
    "title": "Buy a car in 6 months",
    "description": "Financial goal to purchase a car...",
    "milestones": [
      {
        "id": "milestone-uuid",
        "title": "Research options and set a specific budget",
        "description": "Research different models...",
        "completed": false
      }
    ],
    "progress": 0,
    "streak": 0,
    "createdAt": "2026-04-06T...",
    "targetDate": "2026-10-06T..."
  },
  "message": "Goal created successfully with AI"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid or missing API key"
}
```

**Response (Error - 403):**
```json
{
  "error": "AI goal creation requires an active Pro subscription"
}
```

---

### Admin Goal Generation with AI

**Endpoint:** `POST /api/admin/goals/create-with-ai`

**Description:** Generates goal data using AI for any user (admin only). Does not save the goal to the database.

**Requirements:**
- Valid admin API key

**Request Body:**
```json
{
  "prompt": "I want to learn Spanish",
  "difficulty": "hard",
  "targetDate": "2026-12-31T00:00:00.000Z",
  "userId": "user-uuid",
  "adminApiKey": "your-admin-api-key"
}
```

**Parameters:**
- `prompt` (required): Description of the goal
- `difficulty` (optional): One of "easy", "medium", or "hard". Default: "medium"
- `targetDate` (optional): ISO 8601 date string. Default: 30 days from now
- `userId` (required): The UUID of the user for whom to generate the goal
- `adminApiKey` (required): Your admin API key

**Response (Success - 200):**
```json
{
  "success": true,
  "goal": {
    "title": "Learn Spanish",
    "description": "Learning goal to acquire new knowledge...",
    "milestones": [
      {
        "id": "milestone-temp-id",
        "title": "Research learning resources and materials",
        "description": "Find books, courses, videos...",
        "completed": false
      }
    ],
    "targetDate": "2026-12-31T..."
  },
  "message": "Goal generated successfully with AI",
  "note": "Goal data returned but not saved. Use the create-goal endpoint to save it."
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid or missing admin API key"
}
```

**Response (Error - 404):**
```json
{
  "error": "User not found"
}
```

---

## Examples

### Example 1: User Creating a Goal (cURL)

```bash
curl -X POST https://your-domain.com/api/goals/create-with-ai \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "prompt": "I want to run a marathon",
    "difficulty": "hard",
    "apiKey": "your-api-key"
  }'
```

### Example 2: User Creating a Goal (JavaScript/Fetch)

```javascript
const response = await fetch('/api/goals/create-with-ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for sending cookies
  body: JSON.stringify({
    prompt: 'I want to save $10,000 for a vacation',
    difficulty: 'medium',
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    apiKey: process.env.NEXT_PUBLIC_GOALS_API_KEY
  })
});

const data = await response.json();
console.log(data);
```

### Example 3: Admin Generating Goal Data (Node.js)

```javascript
const axios = require('axios');

async function generateGoalForUser(userId, prompt) {
  try {
    const response = await axios.post(
      'https://your-domain.com/api/admin/goals/create-with-ai',
      {
        prompt: prompt,
        difficulty: 'medium',
        userId: userId,
        adminApiKey: process.env.ADMIN_API_KEY
      }
    );
    
    console.log('Generated goal:', response.data.goal);
    return response.data.goal;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
generateGoalForUser('user-uuid-here', 'I want to learn to play guitar');
```

### Example 4: Admin Generating Goal Data (Python)

```python
import requests
import os

def generate_goal_for_user(user_id, prompt, difficulty='medium'):
    url = 'https://your-domain.com/api/admin/goals/create-with-ai'
    
    payload = {
        'prompt': prompt,
        'difficulty': difficulty,
        'userId': user_id,
        'adminApiKey': os.environ.get('ADMIN_API_KEY')
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print('Generated goal:', data['goal'])
        return data['goal']
    else:
        print('Error:', response.json())
        return None

# Usage
generate_goal_for_user('user-uuid-here', 'I want to write a book')
```

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Missing required fields, invalid difficulty value |
| 401 | Unauthorized | Invalid or missing API key, user not authenticated |
| 403 | Forbidden | User doesn't have Pro subscription with AI access |
| 404 | Not Found | User ID doesn't exist (admin endpoint) |
| 500 | Internal Server Error | AI service unavailable, database error |

### Error Response Format

All errors follow this format:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

---

## Setup Instructions

### 1. Set Environment Variables

Add these to your `.env.local` file:

```bash
# User API Key (generate a secure random string)
GOALS_API_KEY=your-secure-api-key-here

# Admin API Key (generate a different secure random string)
ADMIN_API_KEY=your-secure-admin-api-key-here

# OpenAI API Key (required for AI functionality)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 2. Generate Secure API Keys

You can generate secure API keys using:

```bash
# On Linux/Mac
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Test the Endpoints

Use the examples above to test your endpoints. Start with the admin endpoint as it's simpler to test.

---

## Best Practices

1. **Keep API Keys Secret**: Never commit API keys to version control
2. **Use HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
4. **Validate Input**: The API validates input, but additional client-side validation improves UX
5. **Error Handling**: Always handle errors gracefully in your client code
6. **Logging**: Monitor API usage and errors for debugging

---

## Difficulty Levels

### Easy
- Creates 3 milestones
- Gentle progression
- Suitable for simple, short-term goals

### Medium (Default)
- Creates 5 milestones
- Balanced challenge
- Suitable for most goals

### Hard
- Creates 7 milestones
- Ambitious progression
- Suitable for complex, long-term goals

---

## Support

For issues or questions:
1. Check the error message and status code
2. Verify your API keys are correct
3. Ensure the user has the required subscription (for user endpoint)
4. Check that OpenAI API key is configured
5. Review server logs for detailed error information
