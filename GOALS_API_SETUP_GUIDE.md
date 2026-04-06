# Goals API Setup Guide

This guide will help you set up and use the Goals API for creating goals with AI.

## Quick Start

### Step 1: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Generate secure API keys (see below for how)
GOALS_API_KEY=your-secure-api-key-here
ADMIN_API_KEY=your-secure-admin-api-key-here

# Your OpenAI API key (required for AI functionality)
OPENAI_API_KEY=sk-your-openai-api-key
```

### Step 2: Generate Secure API Keys

Run one of these commands to generate secure random keys:

```bash
# Option 1: Using OpenSSL (Linux/Mac)
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Generate two different keys - one for `GOALS_API_KEY` and one for `ADMIN_API_KEY`.

### Step 3: Restart Your Development Server

```bash
npm run dev
```

### Step 4: Test the API

#### Option A: Using the Test Script

```bash
# Set environment variables
export ADMIN_API_KEY=your-admin-api-key
export USER_ID=your-user-uuid
export API_URL=http://localhost:3000

# Run the test script
node test-goals-api.js
```

#### Option B: Using cURL

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

#### Option C: Using Postman or Insomnia

1. Create a new POST request
2. URL: `http://localhost:3000/api/admin/goals/create-with-ai`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "prompt": "I want to learn Python",
  "difficulty": "medium",
  "userId": "your-user-uuid",
  "adminApiKey": "your-admin-api-key"
}
```

## API Endpoints

### 1. User Endpoint (Requires Authentication)

**URL:** `/api/goals/create-with-ai`

**Use Case:** When a logged-in user wants to create a goal

**Requirements:**
- User must be logged in (session cookie)
- User must have Pro subscription with AI access
- Requires `GOALS_API_KEY`

**Example:**
```javascript
const response = await fetch('/api/goals/create-with-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    prompt: 'I want to run a 5K',
    difficulty: 'easy',
    apiKey: process.env.NEXT_PUBLIC_GOALS_API_KEY
  })
});
```

### 2. Admin Endpoint (No User Authentication Required)

**URL:** `/api/admin/goals/create-with-ai`

**Use Case:** When an admin wants to generate goal data for any user

**Requirements:**
- Requires `ADMIN_API_KEY`
- Requires `userId` of the target user

**Example:**
```javascript
const response = await fetch('/api/admin/goals/create-with-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'I want to learn guitar',
    difficulty: 'medium',
    userId: 'user-uuid-here',
    adminApiKey: process.env.ADMIN_API_KEY
  })
});
```

## Integration Examples

### Example 1: Admin Dashboard Integration

```typescript
// src/app/admin/goals/create/page.tsx
'use client';

import { useState } from 'react';

export default function AdminCreateGoal() {
  const [prompt, setPrompt] = useState('');
  const [userId, setUserId] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/goals/create-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userId,
          difficulty,
          adminApiKey: process.env.NEXT_PUBLIC_ADMIN_API_KEY
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create Goal with AI</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Goal Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating...' : 'Generate Goal'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Bulk Goal Creation Script

```javascript
// scripts/bulk-create-goals.js
const fetch = require('node-fetch');

const users = [
  { id: 'user-1-uuid', prompt: 'I want to learn Spanish' },
  { id: 'user-2-uuid', prompt: 'I want to save $5000' },
  { id: 'user-3-uuid', prompt: 'I want to run a marathon' },
];

async function createGoalsForUsers() {
  for (const user of users) {
    console.log(`Creating goal for user ${user.id}...`);
    
    const response = await fetch('http://localhost:3000/api/admin/goals/create-with-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: user.prompt,
        difficulty: 'medium',
        userId: user.id,
        adminApiKey: process.env.ADMIN_API_KEY
      })
    });

    const data = await response.json();
    console.log(`Result:`, data.success ? '✅ Success' : '❌ Failed');
    
    // Wait 1 second between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

createGoalsForUsers();
```

## Troubleshooting

### Issue: "Invalid or missing API key"

**Solution:** Make sure you've set the API key in `.env.local` and restarted your dev server.

### Issue: "User not found"

**Solution:** Verify the `userId` exists in your database. You can check by querying the `users` table.

### Issue: "Failed to generate goal with AI"

**Solution:** 
1. Check that `OPENAI_API_KEY` is set correctly
2. Verify your OpenAI API key has credits
3. Check the server logs for detailed error messages

### Issue: "AI goal creation requires an active Pro subscription"

**Solution:** This only applies to the user endpoint. Either:
1. Use the admin endpoint instead, or
2. Ensure the user has an active Pro subscription with `has_ai_access = true`

## Security Best Practices

1. **Never expose API keys in client-side code**
   - Use environment variables
   - Only use `NEXT_PUBLIC_` prefix for non-sensitive keys
   - Keep `ADMIN_API_KEY` server-side only

2. **Implement rate limiting**
   - Consider adding rate limiting middleware
   - Prevent abuse of the API

3. **Validate all inputs**
   - The API validates inputs, but add client-side validation too
   - Sanitize user inputs

4. **Use HTTPS in production**
   - Never send API keys over HTTP
   - Use secure cookies for session management

5. **Monitor API usage**
   - Log all API calls
   - Set up alerts for unusual activity

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test the API endpoints
3. 📝 Integrate into your admin dashboard
4. 🔒 Implement rate limiting (optional)
5. 📊 Add monitoring and logging (optional)
6. 🚀 Deploy to production

## Support

For more detailed information, see:
- [API_GOALS_DOCUMENTATION.md](./API_GOALS_DOCUMENTATION.md) - Complete API reference
- [test-goals-api.js](./test-goals-api.js) - Test script

Need help? Check the server logs for detailed error messages.
