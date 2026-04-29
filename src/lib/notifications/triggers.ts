// Notification trigger functions
// Call these when events occur in your app

import { sendBrowserNotification } from './push';
import { createClient } from '@supabase/supabase-js';

// Fetch user notification preferences from DB (server-side)
async function getUserPreferences(userId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false } }
    );
    const { data } = await supabase
      .from('users')
      .select('notifications')
      .eq('id', userId)
      .single();

    return data?.notifications || { email: true, push: true, goalReminders: true, achievements: true };
  } catch {
    // Default to all enabled if we can't fetch
    return { email: true, push: true, goalReminders: true, achievements: true };
  }
}

export async function notifyAchievementUnlocked(
  userId: string,
  achievementName: string,
  achievementDescription: string
) {
  try {
    const prefs = await getUserPreferences(userId);

    if (prefs.achievements && prefs.email) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'achievement_unlocked',
          userId,
          data: { achievementName, achievementDescription },
        }),
      });
    }

    if (prefs.achievements && prefs.push) {
      await sendBrowserNotification({
        title: '🎉 Achievement Unlocked!',
        body: achievementName,
        data: { url: '/dashboard', tag: 'achievement' },
      });
    }
  } catch (error) {
    console.error('Error sending achievement notification:', error);
  }
}

export async function notifyGoalCompleted(
  userId: string,
  goalTitle: string,
  pointsEarned: number
) {
  try {
    const prefs = await getUserPreferences(userId);

    if (prefs.goalReminders && prefs.email) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'goal_reminder',
          userId,
          data: {
            pendingGoals: 1,
            goals: [{ title: goalTitle }],
          },
        }),
      });
    }

    if (prefs.goalReminders && prefs.push) {
      await sendBrowserNotification({
        title: '✅ Goal Completed!',
        body: `${goalTitle} - You earned ${pointsEarned} points!`,
        data: { url: '/dashboard', tag: 'goal-completed' },
      });
    }
  } catch (error) {
    console.error('Error sending goal completion notification:', error);
  }
}

export async function notifySubscriptionUpdate(
  userId: string,
  message: string
) {
  try {
    const prefs = await getUserPreferences(userId);

    if (prefs.email) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription_update',
          userId,
          data: { message },
        }),
      });
    }
  } catch (error) {
    console.error('Error sending subscription notification:', error);
  }
}

export async function notifyGoalReminder(
  userId: string,
  pendingGoals: number,
  goals: Array<{ title: string; category?: string }>
) {
  try {
    const prefs = await getUserPreferences(userId);

    if (prefs.goalReminders && prefs.email) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'goal_reminder',
          userId,
          data: { pendingGoals, goals },
        }),
      });
    }

    if (prefs.goalReminders && prefs.push) {
      await sendBrowserNotification({
        title: '🎯 Mission Briefing',
        body: `You have ${pendingGoals} active goal${pendingGoals > 1 ? 's' : ''} waiting`,
        data: { url: '/dashboard', tag: 'goal-reminder' },
      });
    }
  } catch (error) {
    console.error('Error sending goal reminder notification:', error);
  }
}
