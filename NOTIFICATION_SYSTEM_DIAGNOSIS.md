# Notification System Diagnosis

## Current Status: NOT SENDING NOTIFICATIONS ❌

## What Notifications Are Supposed to Be Sent?

Your system has 7 types of email notifications configured:

1. **goal_reminder** - Daily mission briefing for users with pending goals
2. **achievement_unlocked** - Medal awarded when achievements are earned
3. **account_update** - Security alert for account changes
4. **subscription_update** - Subscription status changes
5. **streak_broken** - Alert when user's streak is at risk
6. **inactive_user** - Recall notice for users inactive 7+ days
7. **comeback_motivation** - Redeployment orders for users inactive 14+ days

## Why Notifications Are NOT Being Sent

### 1. Scheduled Functions Are NOT Deployed/Running ⚠️

You have two Supabase Edge Functions that should run on a schedule:

- **send-goal-reminders** - Should run daily at 9 AM (cron: "0 9 * * *")
  - Location: `supabase/functions/send-goal-reminders/index.ts`
  - Status: ❌ NOT SCHEDULED

- **check-inactive-users** - Should run daily at 10 AM (cron: "0 10 * * *")
  - Location: `supabase/functions/check-inactive-users/index.ts`
  - Status: ❌ NOT SCHEDULED

### 2. Database Triggers Only Create Records, Don't Send Emails ⚠️

Your database has triggers that INSERT into the `notifications` table:
- `notify_milestone_completed()` - When a milestone is marked complete
- `notify_goal_completed()` - When a goal reaches 100% progress

**Problem**: These triggers only create database records. They don't actually send emails!

### 3. Notification Functions Are Never Called ⚠️

The functions in `src/lib/notifications/triggers.ts` are defined but NEVER called:
- `notifyAchievementUnlocked()`
- `notifyGoalCompleted()`
- `notifySubscriptionUpdate()`

No code in your app actually invokes these functions.

### 4. Missing Environment Variable ⚠️

The Edge Functions need `APP_URL` environment variable to call your API:
```typescript
`${Deno.env.get('APP_URL')}/api/send-notification`
```

This is likely not configured in Supabase.

## What IS Working ✅

1. **Email Service**: Gmail SMTP is configured and working
   - Transporter is set up correctly
   - Email templates are beautiful and complete
   - Test scripts work (test-send-email.js, test-gmail-smtp.js)

2. **API Route**: `/api/send-notification` is properly implemented
   - Accepts notification requests
   - Fetches user data from database
   - Calls email service
   - Returns success/failure

3. **Database Structure**: 
   - `notifications` table exists
   - Triggers are in place
   - RLS policies are configured

## How to Fix This

### Step 1: Deploy and Schedule Edge Functions

```bash
# Deploy the functions
supabase functions deploy send-goal-reminders
supabase functions deploy check-inactive-users

# Schedule them to run daily
supabase functions schedule send-goal-reminders --cron "0 9 * * *"
supabase functions schedule check-inactive-users --cron "0 10 * * *"
```

### Step 2: Set Environment Variables in Supabase

Go to Supabase Dashboard → Edge Functions → Settings and add:
```
APP_URL=https://navygoal.com
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Step 3: Connect Database Triggers to Email Sending

Modify the database triggers to actually send emails:

```sql
CREATE OR REPLACE FUNCTION notify_milestone_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    SELECT g.user_id INTO v_user_id FROM goals g WHERE g.id = NEW.goal_id;
    SELECT u.email INTO v_email FROM auth.users u WHERE u.id = v_user_id;
    
    -- Insert notification record
    INSERT INTO notifications (user_id, type, title, message, goal_id, milestone_id)
    VALUES (v_user_id, 'milestone_completed', 'Milestone Completed! 🎉', 
            'You completed: ' || NEW.title, NEW.goal_id, NEW.id);
    
    -- Send email via API (requires http extension)
    PERFORM net.http_post(
      url := current_setting('app.api_url') || '/api/send-notification',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'type', 'achievement_unlocked',
        'userId', v_user_id,
        'data', jsonb_build_object(
          'achievementName', 'Milestone Completed!',
          'achievementDescription', 'You completed: ' || NEW.title
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Step 4: Call Notification Functions in Your App

When achievements are unlocked, add this to your code:

```typescript
import { notifyAchievementUnlocked } from '@/lib/notifications/triggers';

// After unlocking an achievement
await notifyAchievementUnlocked(
  userId,
  'First Goal Completed',
  'You completed your first goal!'
);
```

## Quick Test

To test if email sending works right now:

```bash
node test-gmail-smtp.js
```

This will send a test email to verify Gmail SMTP is working.

## Summary

Your notification system is **fully built but not activated**. It's like having a car with no gas - everything is there, it just needs to be turned on:

1. ❌ Scheduled functions exist but aren't deployed/scheduled
2. ❌ Database triggers create records but don't send emails
3. ❌ Notification functions exist but are never called
4. ✅ Email service works perfectly
5. ✅ API endpoint works perfectly
6. ✅ Templates are beautiful and ready

**Bottom line**: Deploy the Edge Functions and schedule them, and your users will start receiving notifications!
