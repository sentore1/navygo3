# How the Email System Knows Your Goals

## Overview
The email system fetches your active goals from the database and includes them in the daily reminder emails.

## How It Works

### 1. Database Query
When the cron job runs, it queries your Supabase database:

```sql
SELECT id, title, category 
FROM goals 
WHERE user_id = 'YOUR_USER_ID' 
  AND completed = false
ORDER BY created_at DESC
LIMIT 5
```

This gets your top 5 most recent incomplete goals.

### 2. Data Flow

```
Supabase Cron (9 AM daily)
    ↓
Edge Function: send-goal-reminders
    ↓
Queries database for each user's goals
    ↓
Calls API: /api/send-notification
    ↓
Email Service (Gmail SMTP)
    ↓
Email delivered to your inbox
```

### 3. What's Included in the Email

The email now shows:
- **Total count**: "3 active missions"
- **Goal titles**: Listed with their categories
  - Complete project documentation (Work)
  - Exercise for 30 minutes (Health)
  - Learn React hooks (Learning)

### 4. Test vs Production

**Test Script** (`test-goal-reminder-with-titles.js`):
- Uses hardcoded example goals
- Good for testing email design
- Run manually: `node test-goal-reminder-with-titles.js`

**Production** (Supabase Edge Function):
- Fetches real goals from your database
- Runs automatically via cron job
- Sends to all users with pending goals

## Updated Files

1. **supabase/functions/send-goal-reminders/index.ts**
   - Now fetches `title` and `category` (not just `id`)
   - Passes goal data to the email API

2. **src/lib/notifications/email-gmail.ts**
   - Updated to display goal titles in a list
   - Shows category in gray text next to each goal

3. **src/app/api/send-notification/route.ts**
   - Already configured to use production URL
   - Passes goal data to email template

## How to Deploy

```bash
# 1. Deploy the updated Edge Function
supabase functions deploy send-goal-reminders

# 2. Schedule it to run daily at 9 AM
supabase functions schedule send-goal-reminders --cron "0 9 * * *"

# 3. Set environment variable in Supabase
# Go to Supabase Dashboard > Edge Functions > Settings
# Add: APP_URL = https://navygoal.com
```

## Testing

### Test with fake data:
```bash
node test-goal-reminder-with-titles.js
```

### Test with real database data:
1. Make sure you have goals in your database
2. Call the Edge Function manually:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-goal-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Email Preview

Check your email at abdousentore@gmail.com - you should see:

```
DAILY MISSION BRIEFING
NAVYGOAL OPERATIVE

Operative Abdou,

Your command center has identified 3 active mission(s)...

[3 - Active Missions]

YOUR ACTIVE MISSIONS
• Complete project documentation (Work)
• Exercise for 30 minutes (Health)
• Learn React hooks (Learning)

STANDING ORDERS
"Victory belongs to those who believe in it..."

[VIEW YOUR MISSIONS button]
```

## Why "3 active missions"?

The system counts incomplete goals from your database:
- Queries the `goals` table
- Filters by `user_id` (your account)
- Filters by `completed = false`
- Returns the count and titles

When you complete a goal in the app, it updates `completed = true`, so it won't appear in the next day's email.
