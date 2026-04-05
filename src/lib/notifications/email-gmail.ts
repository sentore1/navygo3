// Email notification service using Gmail SMTP
// Install: npm install nodemailer
// Install types: npm install -D @types/nodemailer

import nodemailer from 'nodemailer';

export type NotificationType = 
  | 'goal_reminder'
  | 'achievement_unlocked'
  | 'account_update'
  | 'subscription_update'
  | 'streak_broken'
  | 'inactive_user'
  | 'comeback_motivation';

interface EmailNotification {
  to: string;
  type: NotificationType;
  data: Record<string, any>;
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
  },
});

export async function sendEmailNotification({ to, type, data }: EmailNotification) {
  try {
    let subject = '';
    let html = '';

    switch (type) {
      case 'goal_reminder':
        subject = '⏰ Your Goals Are Waiting For You';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
              }
              .content { 
                padding: 40px 30px;
                background: white;
              }
              .content p {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #4a5568;
              }
              .stats {
                background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
                padding: 24px;
                border-radius: 12px;
                margin: 24px 0;
                text-align: center;
              }
              .stats-number {
                font-size: 48px;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0;
              }
              .stats-label {
                font-size: 14px;
                color: #718096;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .button { 
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 24px;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                transition: transform 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
              }
              .motivational-quote {
                border-left: 4px solid #667eea;
                padding: 16px 20px;
                margin: 24px 0;
                background: #f7fafc;
                border-radius: 4px;
                font-style: italic;
                color: #2d3748;
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                background: #f7fafc;
                color: #718096;
                font-size: 13px;
              }
              .footer a {
                color: #667eea;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Time to Shine!</h1>
              </div>
              <div class="content">
                <p>Hey ${data.userName},</p>
                <p>Your goals are calling! You've got momentum—let's keep it going.</p>
                
                <div class="stats">
                  <div class="stats-number">${data.pendingGoals}</div>
                  <div class="stats-label">Goals Waiting For You</div>
                </div>

                <div class="motivational-quote">
                  "The secret of getting ahead is getting started." — Mark Twain
                </div>

                <p>Every small step counts. Take just 5 minutes today to make progress on one goal.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">Let's Do This! 🚀</a>
                </center>
              </div>
              <div class="footer">
                <p>You're receiving this because you enabled goal reminders.</p>
                <p><a href="${data.dashboardUrl}/settings">Update preferences</a></p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'achievement_unlocked':
        subject = '🎉 You Did It! Achievement Unlocked';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                color: white; 
                padding: 50px 30px; 
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 32px;
                font-weight: 700;
              }
              .trophy {
                font-size: 80px;
                margin: 20px 0;
                animation: bounce 1s infinite;
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
              .content { 
                padding: 40px 30px;
                background: white;
              }
              .achievement { 
                background: linear-gradient(135deg, #fff5f7 0%, #ffe8ec 100%);
                padding: 30px;
                border-radius: 12px;
                margin: 24px 0;
                border: 2px solid #f5576c;
                text-align: center;
              }
              .achievement h2 {
                margin: 0 0 12px 0;
                font-size: 24px;
                color: #f5576c;
              }
              .achievement p {
                margin: 0;
                font-size: 16px;
                color: #4a5568;
              }
              .button { 
                display: inline-block;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 24px;
                box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                background: #f7fafc;
                color: #718096;
                font-size: 13px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="trophy">🏆</div>
                <h1>Congratulations!</h1>
              </div>
              <div class="content">
                <p>Hey ${data.userName},</p>
                <p>You're absolutely crushing it! 🎉</p>
                
                <div class="achievement">
                  <h2>${data.achievementName}</h2>
                  <p>${data.achievementDescription}</p>
                </div>

                <p>This is what dedication looks like. Keep pushing forward—you're inspiring!</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">View My Achievements 🌟</a>
                </center>
              </div>
              <div class="footer">
                <p>You're receiving this because you enabled achievement notifications.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'account_update':
        subject = '✅ Account Updated';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Account Update</h1>
              </div>
              <div class="content">
                <p>Hi ${data.userName},</p>
                <p>Your account settings have been updated successfully.</p>
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> If you didn't make this change, please contact support immediately.
                </div>
              </div>
              <div class="footer">
                <p>This is an automated security notification.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'subscription_update':
        subject = '💳 Subscription Update';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .content { 
                padding: 40px 30px;
                background: white;
              }
              .button { 
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 24px;
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                background: #f7fafc;
                color: #718096;
                font-size: 13px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💳 Subscription Update</h1>
              </div>
              <div class="content">
                <p>Hi ${data.userName},</p>
                <p>${data.message}</p>
                <center>
                  <a href="${data.dashboardUrl}" class="button">View Subscription</a>
                </center>
              </div>
              <div class="footer">
                <p>Questions? Contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'streak_broken':
        subject = '💔 Your Streak Needs You!';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
              }
              .content { 
                padding: 40px 30px;
                background: white;
              }
              .streak-info {
                background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
                padding: 24px;
                border-radius: 12px;
                margin: 24px 0;
                text-align: center;
                border: 2px solid #ff6b6b;
              }
              .streak-number {
                font-size: 48px;
                font-weight: 800;
                color: #ff6b6b;
                margin: 0;
              }
              .streak-label {
                font-size: 14px;
                color: #718096;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .motivational-quote {
                border-left: 4px solid #ff6b6b;
                padding: 16px 20px;
                margin: 24px 0;
                background: #f7fafc;
                border-radius: 4px;
                font-style: italic;
                color: #2d3748;
              }
              .button { 
                display: inline-block;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 24px;
                box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                background: #f7fafc;
                color: #718096;
                font-size: 13px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💔 Don't Break The Chain!</h1>
              </div>
              <div class="content">
                <p>Hey ${data.userName},</p>
                <p>We noticed you haven't logged progress in a while. Your ${data.streakDays}-day streak is at risk!</p>
                
                <div class="streak-info">
                  <div class="streak-number">${data.streakDays}</div>
                  <div class="streak-label">Day Streak at Risk</div>
                </div>

                <div class="motivational-quote">
                  "Success is the sum of small efforts repeated day in and day out." — Robert Collier
                </div>

                <p>You've come so far—don't let it slip away! Just 5 minutes today can save your streak and keep your momentum alive.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">Save My Streak! 🔥</a>
                </center>
              </div>
              <div class="footer">
                <p>You're receiving this because you enabled goal reminders.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'inactive_user':
        subject = '👋 We Miss You! Your Goals Are Waiting';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
              }
              .content { 
                padding: 40px 30px;
                background: white;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin: 24px 0;
              }
              .stat-card {
                background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
              }
              .stat-number {
                font-size: 32px;
                font-weight: 800;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0;
              }
              .stat-label {
                font-size: 12px;
                color: #718096;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .motivational-quote {
                border-left: 4px solid #4facfe;
                padding: 16px 20px;
                margin: 24px 0;
                background: #f7fafc;
                border-radius: 4px;
                font-style: italic;
                color: #2d3748;
              }
              .button { 
                display: inline-block;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 24px;
                box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                background: #f7fafc;
                color: #718096;
                font-size: 13px;
              }
              .footer a {
                color: #4facfe;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>👋 Welcome Back!</h1>
              </div>
              <div class="content">
                <p>Hey ${data.userName},</p>
                <p>It's been ${data.daysSinceLastLogin} days since we last saw you. We've been keeping your goals safe and sound!</p>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-number">${data.totalGoals || 0}</div>
                    <div class="stat-label">Your Goals</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">${data.completedGoals || 0}</div>
                    <div class="stat-label">Completed</div>
                  </div>
                </div>

                <div class="motivational-quote">
                  "The best time to plant a tree was 20 years ago. The second best time is now." — Chinese Proverb
                </div>

                <p>Life gets busy—we get it. But your future self will thank you for taking action today. Even small progress is still progress!</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">Let's Get Back On Track! 💪</a>
                </center>
              </div>
              <div class="footer">
                <p>Not interested anymore? <a href="${data.dashboardUrl}/settings">Update your preferences</a></p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'comeback_motivation':
        subject = '🌟 Ready For A Fresh Start?';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .content { 
                padding: 40px 30px;
                background: white;
              }
              .highlight-box {
                background: linear-gradient(135deg, #fff9e6 0%, #ffedd5 100%);
                padding: 24px;
                border-radius: 12px;
                margin: 24px 0;
                border: 2px solid #fbbf24;
              }
              .highlight-box h3 {
                margin: 0 0 12px 0;
                color: #92400e;
              }
              .tips-list {
                margin: 24px 0;
                padding-left: 0;
                list-style: none;
              }
              .tips-list li {
                padding: 12px 0;
                padding-left: 32px;
                position: relative;
              }
              .tips-list li:before {
                content: "✨";
                position: absolute;
                left: 0;
              }
              .button { 
                display: inline-block;
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 24px;
                box-shadow: 0 4px 12px rgba(250, 112, 154, 0.4);
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                background: #f7fafc;
                color: #718096;
                font-size: 13px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌟 Your Comeback Starts Now</h1>
              </div>
              <div class="content">
                <p>Hey ${data.userName},</p>
                <p>Every champion has a comeback story. This could be yours.</p>
                
                <div class="highlight-box">
                  <h3>💡 Did You Know?</h3>
                  <p>People who return after a break often achieve more than before. Why? Because they come back with renewed motivation and clarity.</p>
                </div>

                <p><strong>Here's how to restart strong:</strong></p>
                <ul class="tips-list">
                  <li>Start with just ONE small goal</li>
                  <li>Set aside 10 minutes today</li>
                  <li>Celebrate every tiny win</li>
                  <li>Don't aim for perfection—aim for progress</li>
                </ul>

                <p>Your past progress is still there. Your potential is still there. All you need is to take that first step.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">Start My Comeback 🚀</a>
                </center>
              </div>
              <div class="footer">
                <p>We believe in you. Let's make it happen together.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return { 
      success: true, 
      data: { 
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected 
      } 
    };
  } catch (error: any) {
    console.error('Gmail SMTP error:', error);
    return { success: false, error: error.message };
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    await transporter.verify();
    return { success: true, message: 'Gmail SMTP connection successful' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
