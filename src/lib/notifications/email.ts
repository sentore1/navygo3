// Email notification service using Resend
// Install: npm install resend

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type NotificationType = 
  | 'goal_reminder'
  | 'achievement_unlocked'
  | 'account_update'
  | 'subscription_update';

interface EmailNotification {
  to: string;
  type: NotificationType;
  data: Record<string, any>;
}

export async function sendEmailNotification({ to, type, data }: EmailNotification) {
  try {
    let subject = '';
    let html = '';

    switch (type) {
      case 'goal_reminder':
        subject = '⏰ Daily Goal Reminder';
        html = `
          <h2>Don't forget your goals today!</h2>
          <p>Hi ${data.userName},</p>
          <p>You have ${data.pendingGoals} goals waiting for you.</p>
          <a href="${data.dashboardUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
            View Goals
          </a>
        `;
        break;

      case 'achievement_unlocked':
        subject = '🎉 Achievement Unlocked!';
        html = `
          <h2>Congratulations!</h2>
          <p>Hi ${data.userName},</p>
          <p>You've unlocked a new achievement: <strong>${data.achievementName}</strong></p>
          <p>${data.achievementDescription}</p>
          <a href="${data.dashboardUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
            View Achievement
          </a>
        `;
        break;

      case 'account_update':
        subject = '✅ Account Updated';
        html = `
          <h2>Account Update</h2>
          <p>Hi ${data.userName},</p>
          <p>Your account settings have been updated successfully.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
        `;
        break;

      case 'subscription_update':
        subject = '💳 Subscription Update';
        html = `
          <h2>Subscription Update</h2>
          <p>Hi ${data.userName},</p>
          <p>${data.message}</p>
          <a href="${data.dashboardUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
            View Subscription
          </a>
        `;
        break;
    }

    const result = await resend.emails.send({
      from: 'Your App <notifications@yourdomain.com>', // Update with your domain
      to,
      subject,
      html,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error };
  }
}
