# Quick Notification Setup

## Choose Your Email Provider

### Option A: Gmail SMTP (Recommended if you have Google Workspace)
- Free for Google users
- 500 emails/day (2,000/day for Workspace)
- See `SETUP_GMAIL_SMTP.md` for detailed setup

### Option B: Resend (Recommended for new projects)
- Modern, developer-friendly
- 3,000 emails/month free
- Better deliverability
- See below for setup

---

## Gmail SMTP Setup (Quick Start)

### Step 1: Install Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### Step 2: Generate Gmail App Password

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password

### Step 3: Add to `.env.local`

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Test Gmail SMTP

```bash
node test-gmail-smtp.js
```

You should receive a test email! ✅

---

## Resend Setup (Alternative)

1. Go to https://resend.com and sign up
2. Verify your domain (or use `onboarding@resend.dev` for testing)
3. Get your API key from the dashboard
4. Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Update Email Sender

Edit `src/lib/notifications/email.ts` line 62:
```typescript
from: 'Your App <notifications@yourdomain.com>', // Change to your verified domain
```

For testing, use:
```typescript
from: 'onboarding@resend.dev', // Resend's test email
```

## Step 4: Test Email Notifications

```bash
# Start your dev server
npm run dev

# Test the notification API
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "achievement_unlocked",
    "userId": "your-user-id",
    "data": {
      "achievementName": "First Goal",
      "achievementDescription": "You completed your first goal!"
    }
  }'
```

## Step 5: Test Browser Notifications

1. Go to Settings page
2. Click "Enable Browser Notifications"
3. Allow notifications in browser prompt
4. Test by completing a goal

## Step 6: Deploy Scheduled Reminders (Optional)

```bash
# Deploy the edge function
supabase functions deploy send-goal-reminders

# Schedule it to run daily at 9 AM
supabase functions schedule send-goal-reminders --cron "0 9 * * *"
```

## Step 7: Trigger Notifications in Your Code

### When a goal is completed:
```typescript
import { notifyGoalCompleted } from '@/lib/notifications/triggers';

// In your goal completion handler
await notifyGoalCompleted(userId, goalTitle, pointsEarned);
```

### When an achievement is unlocked:
```typescript
import { notifyAchievementUnlocked } from '@/lib/notifications/triggers';

await notifyAchievementUnlocked(
  userId,
  'Goal Master',
  'Complete 10 goals in a week'
);
```

### When subscription changes:
```typescript
import { notifySubscriptionUpdate } from '@/lib/notifications/triggers';

await notifySubscriptionUpdate(
  userId,
  'Your subscription has been activated!'
);
```

## How It Works

### Email Notifications:
1. User enables email notifications in settings
2. Preferences saved to `users.notifications` JSONB column
3. When event occurs, API checks user preferences
4. If enabled, sends email via Resend
5. User receives email with action button

### Push Notifications:
1. User clicks "Enable Browser Notifications"
2. Browser requests permission
3. Permission stored in browser
4. When event occurs, browser notification appears
5. Clicking notification opens the app

### Scheduled Reminders:
1. Supabase Edge Function runs daily (cron job)
2. Queries users with incomplete goals
3. Checks if they have reminders enabled
4. Sends email reminder via API
5. Logs results for monitoring

## Notification Types

- `goal_reminder`: Daily reminder for incomplete goals
- `achievement_unlocked`: When user earns an achievement
- `account_update`: When account settings change
- `subscription_update`: When subscription status changes

## Cost Estimate

For 1,000 active users:
- Email: ~3,000 emails/month = FREE (Resend free tier)
- Push: FREE (browser native)
- Edge Functions: FREE (Supabase free tier)

Total: $0/month for small apps!

## Troubleshooting

### Emails not sending?
- Check RESEND_API_KEY in .env.local
- Verify domain in Resend dashboard
- Check console for errors

### Push notifications not working?
- Check browser permissions
- Must be HTTPS in production
- Check console for errors

### Scheduled reminders not running?
- Verify edge function is deployed
- Check cron schedule syntax
- View logs: `supabase functions logs send-goal-reminders`
