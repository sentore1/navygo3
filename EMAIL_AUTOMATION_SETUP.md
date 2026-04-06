# Email Automation Setup Guide

## Current Status
✅ Email templates created with military theme
✅ Gmail SMTP configured and working
✅ API endpoint created (`/api/send-notification`)
✅ Supabase Edge Functions ready

## Why Emails Aren't Sending Automatically

The email system is ready but needs to be **triggered**. Right now, nothing is calling the email functions automatically.

## How to Enable Automatic Emails

### Option 1: Supabase Cron Jobs (Recommended)

Deploy and schedule the Edge Functions:

```bash
# 1. Deploy the functions
supabase functions deploy send-goal-reminders
supabase functions deploy check-inactive-users

# 2. Schedule them to run daily
supabase functions schedule send-goal-reminders --cron "0 9 * * *"  # 9 AM daily
supabase functions schedule check-inactive-users --cron "0 10 * * *"  # 10 AM daily
```

**What this does:**
- `send-goal-reminders`: Sends daily mission briefings to users with pending goals
- `check-inactive-users`: Sends recall notices to inactive users

### Option 2: Manual Testing (For Now)

Run these test scripts manually:

```bash
# Send goal reminder
node test-goal-reminder.js

# Send development status
node test-send-email.js
```

### Option 3: Trigger from Your App

Call the API endpoint when events happen:

```typescript
// When user completes a goal
await fetch('/api/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'achievement_unlocked',
    userId: user.id,
    data: {
      achievementName: 'First Mission Complete',
      achievementDescription: 'Completed your first goal',
    },
  }),
});
```

## Email Types Available

1. **goal_reminder** - Daily mission briefing
2. **achievement_unlocked** - Medal awarded
3. **streak_broken** - Mission continuity alert
4. **inactive_user** - Recall to active duty
5. **comeback_motivation** - Redeployment orders
6. **account_update** - Security alert
7. **subscription_update** - Command notice

## Environment Variables Needed

Already configured in `.env.local`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=4brohz@gmail.com
SMTP_PASS=**** (your app password)
```

For Edge Functions, add to Supabase:
```
APP_URL=http://localhost:3000  # or your production URL
```

## Next Steps

1. **Test locally**: Run `node test-goal-reminder.js` to see the email
2. **Deploy Edge Functions**: Use the Supabase CLI commands above
3. **Set up cron schedules**: Schedule the functions to run daily
4. **Monitor**: Check Supabase logs to see if emails are being sent

## Troubleshooting

### Emails not sending?
- Check Gmail app password is valid
- Verify SMTP credentials in `.env.local`
- Check Supabase Edge Function logs

### How to check if it's working?
```bash
# Check Edge Function logs
supabase functions logs send-goal-reminders

# Test the API endpoint
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"type":"goal_reminder","userId":"YOUR_USER_ID","data":{"pendingGoals":3}}'
```

## Production Deployment

When deploying to production:

1. Update `APP_URL` in Supabase Edge Function secrets
2. Update `NEXT_PUBLIC_SITE_URL` in your hosting platform
3. Ensure Gmail SMTP credentials are in production environment
4. Schedule the cron jobs in Supabase dashboard

## Cost

- Gmail SMTP: Free (500 emails/day limit)
- Supabase Edge Functions: Free tier includes 500K invocations/month
- Cron jobs: Included in Supabase free tier

---

**Current Test Results:**
✅ Email sent to abdousentore@gmail.com
✅ Military theme working perfectly
✅ SMTP connection stable
