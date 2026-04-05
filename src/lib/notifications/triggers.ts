// Notification trigger functions
// Call these when events occur in your app

import { sendBrowserNotification } from './push';

export async function notifyAchievementUnlocked(
  userId: string,
  achievementName: string,
  achievementDescription: string
) {
  try {
    // Send email notification via API
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'achievement_unlocked',
        userId,
        data: {
          achievementName,
          achievementDescription,
        },
      }),
    });

    // Send browser push notification
    await sendBrowserNotification({
      title: '🎉 Achievement Unlocked!',
      body: achievementName,
      data: {
        url: '/dashboard',
        tag: 'achievement',
      },
    });
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
    await sendBrowserNotification({
      title: '✅ Goal Completed!',
      body: `${goalTitle} - You earned ${pointsEarned} points!`,
      data: {
        url: '/dashboard',
        tag: 'goal-completed',
      },
    });
  } catch (error) {
    console.error('Error sending goal completion notification:', error);
  }
}

export async function notifySubscriptionUpdate(
  userId: string,
  message: string
) {
  try {
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'subscription_update',
        userId,
        data: { message },
      }),
    });
  } catch (error) {
    console.error('Error sending subscription notification:', error);
  }
}
