# How to Trigger Notifications

## Current Status

### ✅ What Works Now (No Setup Needed):
1. **Settings Page** - Users can toggle notification preferences
2. **Preferences Saved** - Toggles save to database automatically
3. **Browser Push** - Works immediately when user clicks "Enable Browser Notifications"

### ⚠️ What Needs Setup:
**Email notifications** - Need Gmail SMTP setup (see SETUP_GMAIL_SMTP.md)

---

## How Notifications Work

### 1. User Preferences (Already Working)
When users toggle switches in Settings → Notifications tab:
- Saves to `users.notifications` JSONB column
- Controls which notifications they receive

### 2. Email Notifications (Needs Gmail Setup)

#### Step 1: Install & Configure
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

Add to `.env.local`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Step 2: Trigger Notifications in Your Code

**Example: When a goal is completed**

In `src/components/goal-dashboard.tsx`, after milestone completion:

```typescript
import { notifyGoalCompleted } from '@/lib/notifications/triggers';

// After updating milestone
if (newProgress >= 100) {
  // Goal is complete!
  await notifyGoalCompleted(
    user.id,
    goal.title,
    goal.points || 100
  );
}
```

**Example: When achievement is unlocked**

```typescript
import { notifyAchievementUnlocked } from '@/lib/notifications/triggers';

// Check if user unlocked achievement
if (completedGoals === 10) {
  await notifyAchievementUnlocked(
    user.id,
    'Goal Master',
    'Complete 10 goals'
  );
}
```

**Example: When subscription changes**

In your Polar webhook handler:

```typescript
import { notifySubscriptionUpdate } from '@/lib/notifications/triggers';

// After subscription is activated
await notifySubscriptionUpdate(
  userId,
  'Your premium subscription is now active!'
);
```

### 3. Browser Push Notifications (Already Working!)

Browser notifications work immediately - no setup needed!

They trigger automatically when you call:
```typescript
import { sendBrowserNotification } from '@/lib/notifications/push';

await sendBrowserNotification({
  title: '🎉 Goal Completed!',
  body: 'You earned 100 points!',
  data: { url: '/dashboard' }
});
```

### 4. Scheduled Reminders (Optional)

For daily goal reminders, deploy the Edge Function:

```bash
supabase functions deploy send-goal-reminders
supabase functions schedule send-goal-reminders --cron "0 9 * * *"
```

This will send daily reminders at 9 AM to users with incomplete goals.

---

## Quick Test

### Test Browser Notifications (Works Now):
1. Go to Settings → Notifications
2. Click "Enable Browser Notifications"
3. Allow in browser prompt
4. Open browser console and run:
```javascript
new Notification('Test', { body: 'It works!' });
```

### Test Email Notifications (After Gmail Setup):
1. Complete Gmail SMTP setup
2. Run test script:
```bash
node test-gmail-smtp.js
```
3. Check your email inbox

---

## Where to Add Notification Triggers

### Goal Completion
**File:** `src/components/goal-dashboard.tsx`
**Location:** After milestone toggle, when progress reaches 100%
**Trigger:** `notifyGoalCompleted(userId, goalTitle, points)`

### Achievement Unlocked
**File:** `src/components/goal-dashboard.tsx`
**Location:** After checking achievement conditions
**Trigger:** `notifyAchievementUnlocked(userId, name, description)`

### Subscription Update
**File:** Your Polar webhook handler
**Location:** After subscription status changes
**Trigger:** `notifySubscriptionUpdate(userId, message)`

### Account Update
**File:** `src/app/settings/page.tsx`
**Location:** After profile save (already has auto-save)
**Trigger:** `notifyAccountUpdate(userId)` (optional)

---

## Example: Complete Integration

Here's how to add notifications to goal completion:

```typescript
// In src/components/goal-dashboard.tsx

import { notifyGoalCompleted } from '@/lib/notifications/triggers';

// Find the milestone toggle function
const handleMilestoneToggle = async (goalId, milestoneId, milestone) => {
  // ... existing code ...
  
  const newProgress = (completedCount / totalMilestones) * 100;
  
  // Update goal
  await supabase
    .from('goals')
    .update({ progress: newProgress })
    .eq('id', goalId);
  
  // NEW: Check if goal just completed
  if (newProgress >= 100 && goal.progress < 100) {
    // Goal just completed! Send notifications
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // This checks user preferences automatically
      await notifyGoalCompleted(
        user.id,
        goal.title,
        goal.points || 100
      );
    }
  }
  
  // ... rest of code ...
};
```

---

## Summary

1. **Browser notifications** → Work immediately, no setup
2. **Email notifications** → Need Gmail SMTP setup first
3. **User preferences** → Already working, saved to database
4. **Triggers** → Add to your code where events happen

Follow `SETUP_GMAIL_SMTP.md` to enable email notifications!
