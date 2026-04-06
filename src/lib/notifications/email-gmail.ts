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
        subject = 'MISSION BRIEFING: Your Daily Objectives Await';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: 'Courier New', monospace;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #0a0e27;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: #ffffff;
                border-radius: 4px;
                overflow: hidden;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                border: 3px solid #1e3a8a;
              }
              .header { 
                background: #1e3a8a; 
                color: #ffffff; 
                padding: 30px; 
                text-align: center;
                border-bottom: 4px solid #1e3a8a;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .rank-badge {
                display: inline-block;
                background: #fbbf24;
                color: #0f172a;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 8px;
                border-radius: 2px;
              }
              .content { 
                padding: 30px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .content p {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #374151;
              }
              .salutation {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 14px;
                letter-spacing: 1px;
              }
              .mission-box {
                background: #f0f4ff;
                padding: 24px;
                border-radius: 4px;
                margin: 24px 0;
                border-left: 6px solid #1e3a8a;
                text-align: center;
              }
              .mission-number {
                font-size: 56px;
                font-weight: 900;
                color: #1e3a8a;
                margin: 0;
                line-height: 1;
              }
              .mission-label {
                font-size: 13px;
                color: #1e40af;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: 700;
              }
              .button { 
                display: inline-block;
                background: #1e3a8a;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 700;
                margin-top: 24px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 14px;
                border: 2px solid #1e3a8a;
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
              }
              .orders {
                background: #f9fafb;
                border: 2px solid #e5e7eb;
                padding: 20px;
                margin: 24px 0;
                border-radius: 4px;
              }
              .orders-title {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
                margin-bottom: 12px;
              }
              .orders-text {
                color: #4b5563;
                font-size: 15px;
                line-height: 1.7;
                margin: 0;
              }
              .footer { 
                text-align: center; 
                padding: 24px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
                border-top: 2px solid #e5e7eb;
              }
              .footer a {
                color: #1e3a8a;
                text-decoration: none;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DAILY MISSION BRIEFING</h1>
                <div class="rank-badge">NAVYGOAL OPERATIVE</div>
              </div>
              <div class="content">
                <p class="salutation">Operative ${data.userName},</p>
                <p>Your command center has identified <strong>${data.pendingGoals}</strong> active mission(s) requiring your attention. You've got this - let's make today count.</p>
                
                <div class="mission-box">
                  <div class="mission-number">${data.pendingGoals}</div>
                  <div class="mission-label">Active Missions</div>
                </div>

                ${data.goals && data.goals.length > 0 ? `
                <div class="orders">
                  <div class="orders-title">YOUR ACTIVE MISSIONS</div>
                  <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                    ${data.goals.map(goal => `<li><strong>${goal.title}</strong>${goal.category ? ` <span style="color: #9ca3af;">(${goal.category})</span>` : ''}</li>`).join('')}
                  </ul>
                </div>
                ` : ''}

                <div class="orders">
                  <div class="orders-title">STANDING ORDERS</div>
                  <p class="orders-text">"Victory belongs to those who believe in it the most and believe in it the longest. We are going to win." — Admiral William F. Halsey Jr.</p>
                </div>

                <p><strong>Mission Protocol:</strong> Every objective you complete brings you closer to your goals. Small steps lead to big victories. Stay focused and keep moving forward.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">VIEW YOUR MISSIONS</a>
                </center>
              </div>
              <div class="footer">
                <p><strong>CLASSIFIED:</strong> Mission briefings enabled by your preferences.</p>
                <p><a href="${data.dashboardUrl}/settings">Modify notification settings</a></p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'achievement_unlocked':
        subject = 'COMMENDATION: Medal Awarded for Outstanding Performance';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: 'Courier New', monospace;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #0a0e27;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 4px;
                overflow: hidden;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                border: 3px solid #1e3a8a;
              }
              .header { 
                background: #1e3a8a; 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                border-bottom: 4px solid #1e3a8a;
              }
              .header h1 {
                margin: 0;
                font-size: 26px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .medal-icon {
                font-size: 64px;
                margin: 16px 0;
              }
              .content { 
                padding: 40px 30px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .salutation {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 14px;
                letter-spacing: 1px;
              }
              .commendation { 
                background: #f0f4ff;
                padding: 30px;
                border-radius: 4px;
                margin: 24px 0;
                border: 3px solid #1e3a8a;
                text-align: center;
              }
              .commendation h2 {
                margin: 0 0 12px 0;
                font-size: 22px;
                color: #1e3a8a;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 900;
              }
              .commendation p {
                margin: 0;
                font-size: 15px;
                color: #374151;
                line-height: 1.6;
              }
              .citation {
                background: #f9fafb;
                border-left: 6px solid #1e3a8a;
                padding: 20px;
                margin: 24px 0;
                border-radius: 4px;
              }
              .citation-title {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
                margin-bottom: 12px;
              }
              .button { 
                display: inline-block;
                background: #1e3a8a;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 900;
                margin-top: 24px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 14px;
                border: 2px solid #1e3a8a;
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
              }
              .footer { 
                text-align: center; 
                padding: 24px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
                border-top: 2px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>MEDAL OF ACHIEVEMENT</h1>
              </div>
              <div class="content">
                <p class="salutation">Operative ${data.userName},</p>
                <p>High Command has reviewed your recent performance and is pleased to recognize your exceptional dedication to the mission.</p>
                
                <div class="commendation">
                  <h2>${data.achievementName}</h2>
                  <p>${data.achievementDescription}</p>
                </div>

                <div class="citation">
                  <div class="citation-title">OFFICIAL CITATION</div>
                  <p style="color: #4b5563; margin: 0; font-size: 15px;">This operative has demonstrated unwavering commitment and the discipline required of elite NavyGoal personnel. Your dedication inspires the entire fleet. Keep up the outstanding work.</p>
                </div>

                <p><strong>Status Update:</strong> Your achievements have been recorded. Continue pushing forward with the same determination.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">VIEW YOUR ACHIEVEMENTS</a>
                </center>
              </div>
              <div class="footer">
                <p><strong>NAVYGOAL COMMAND</strong> • Excellence Through Discipline</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'account_update':
        subject = 'SECURITY ALERT: Account Credentials Modified';
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
                <h1>Account Update</h1>
              </div>
              <div class="content">
                <p>Hi ${data.userName},</p>
                <p>Your account settings have been updated successfully.</p>
                <div class="warning">
                  <strong>Security Notice:</strong> If you didn't make this change, please contact support immediately.
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
        subject = 'COMMAND NOTICE: Subscription Status Update';
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
                <h1>Subscription Update</h1>
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
        subject = 'URGENT: Mission Continuity at Risk - Immediate Action Required';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: 'Courier New', monospace;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #0a0e27;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 4px;
                overflow: hidden;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                border: 3px solid #1e3a8a;
              }
              .header { 
                background: #1e3a8a; 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                border-bottom: 4px solid #1e3a8a;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .rank-badge {
                display: inline-block;
                background: #ffffff;
                color: #1e3a8a;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 8px;
                border-radius: 2px;
              }
              .content { 
                padding: 40px 30px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .salutation {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 14px;
                letter-spacing: 1px;
              }
              .mission-box {
                background: #f0f4ff;
                padding: 24px;
                border-radius: 4px;
                margin: 24px 0;
                border-left: 6px solid #1e3a8a;
                text-align: center;
              }
              .mission-number {
                font-size: 56px;
                font-weight: 900;
                color: #1e3a8a;
                margin: 0;
                line-height: 1;
              }
              .mission-label {
                font-size: 13px;
                color: #1e40af;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: 700;
              }
              .orders {
                background: #f9fafb;
                border: 2px solid #e5e7eb;
                padding: 20px;
                margin: 24px 0;
                border-radius: 4px;
              }
              .orders-title {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
                margin-bottom: 12px;
              }
              .orders-text {
                color: #4b5563;
                font-size: 15px;
                line-height: 1.7;
                margin: 0;
              }
              .button { 
                display: inline-block;
                background: #1e3a8a;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 900;
                margin-top: 24px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 14px;
                border: 2px solid #1e3a8a;
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
              }
              .footer { 
                text-align: center; 
                padding: 24px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
                border-top: 2px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>MISSION CONTINUITY ALERT</h1>
                <div class="rank-badge">URGENT ACTION REQUIRED</div>
              </div>
              <div class="content">
                <p class="salutation">Operative ${data.userName},</p>
                <p><strong>SITUATION REPORT:</strong> We've noticed a gap in your activity. Your ${data.streakDays}-day streak is at risk. Don't let your momentum slip away - you've come too far!</p>
                
                <div class="mission-box">
                  <div class="mission-number">${data.streakDays}</div>
                  <div class="mission-label">Days of Continuous Deployment</div>
                </div>

                <div class="orders">
                  <div class="orders-title">COMMAND DIRECTIVE</div>
                  <p class="orders-text">"Success is the sum of small efforts repeated day in and day out. Your mission is waiting. Your progress matters. Get back on track today."</p>
                </div>

                <p><strong>Action Required:</strong> Log your progress within the next 24 hours to keep your streak alive. Every day counts toward your success.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">CONTINUE YOUR MISSION</a>
                </center>
              </div>
              <div class="footer">
                <p><strong>PRIORITY MESSAGE:</strong> Mission continuity alerts enabled.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'inactive_user':
        subject = 'RECALL NOTICE: Your Fleet Needs You Back in Formation';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: 'Courier New', monospace;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #0a0e27;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 4px;
                overflow: hidden;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                border: 3px solid #1e3a8a;
              }
              .header { 
                background: #1e3a8a; 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                border-bottom: 4px solid #1e3a8a;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .rank-badge {
                display: inline-block;
                background: #ffffff;
                color: #1e3a8a;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 8px;
                border-radius: 2px;
              }
              .content { 
                padding: 40px 30px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .salutation {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 14px;
                letter-spacing: 1px;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin: 24px 0;
              }
              .stat-card {
                background: #f0f4ff;
                padding: 20px;
                border-radius: 4px;
                text-align: center;
                border: 2px solid #1e3a8a;
              }
              .stat-number {
                font-size: 36px;
                font-weight: 900;
                color: #0c4a6e;
                margin: 0;
              }
              .stat-label {
                font-size: 11px;
                color: #075985;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 700;
              }
              .orders {
                background: #f9fafb;
                border-left: 6px solid #1e3a8a;
                padding: 20px;
                margin: 24px 0;
                border-radius: 4px;
              }
              .orders-title {
                font-weight: 700;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
                margin-bottom: 12px;
              }
              .button { 
                display: inline-block;
                background: #1e3a8a;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 900;
                margin-top: 24px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 14px;
                border: 2px solid #1e3a8a;
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
              }
              .footer { 
                text-align: center; 
                padding: 24px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
                border-top: 2px solid #e5e7eb;
              }
              .footer a {
                color: #0ea5e9;
                text-decoration: none;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>RECALL TO ACTIVE DUTY</h1>
                <div class="rank-badge">PERSONNEL NOTICE</div>
              </div>
              <div class="content">
                <p class="salutation">Operative ${data.userName},</p>
                <p><strong>SITUATION REPORT:</strong> It's been ${data.daysSinceLastLogin} days since your last login. Your missions are waiting, and we're here to help you get back on track.</p>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-number">${data.totalGoals || 0}</div>
                    <div class="stat-label">Assigned Missions</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">${data.completedGoals || 0}</div>
                    <div class="stat-label">Completed</div>
                  </div>
                </div>

                <div class="orders">
                  <div class="orders-title">FLEET ADMIRAL'S MESSAGE</div>
                  <p style="color: #4b5563; margin: 0; font-size: 15px; line-height: 1.7;">"The best time to start is now. Your goals are still achievable. Your progress still matters. Welcome back - we're glad to see you return."</p>
                </div>

                <p><strong>Orders:</strong> Jump back in and tackle one goal today. The fleet operates best when everyone is engaged. Your contribution makes a difference.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">RETURN TO YOUR MISSIONS</a>
                </center>
              </div>
              <div class="footer">
                <p>Not ready to return? <a href="${data.dashboardUrl}/settings">Update your status</a></p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'comeback_motivation':
        subject = 'REDEPLOYMENT ORDERS: Begin Your Next Campaign';
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: 'Courier New', monospace;
                line-height: 1.6; 
                color: #1a1a1a;
                margin: 0;
                padding: 0;
                background: #0a0e27;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 4px;
                overflow: hidden;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                border: 3px solid #1e3a8a;
              }
              .header { 
                background: #1e3a8a; 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                border-bottom: 4px solid #1e3a8a;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .rank-badge {
                display: inline-block;
                background: #ffffff;
                color: #1e3a8a;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 8px;
                border-radius: 2px;
              }
              .content { 
                padding: 40px 30px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .salutation {
                font-weight: 700;
                color: #15803d;
                text-transform: uppercase;
                font-size: 14px;
                letter-spacing: 1px;
              }
              .highlight-box {
                background: #f0f4ff;
                padding: 24px;
                border-radius: 4px;
                margin: 24px 0;
                border: 2px solid #1e3a8a;
              }
              .highlight-box h3 {
                margin: 0 0 12px 0;
                color: #1e3a8a;
                text-transform: uppercase;
                font-size: 13px;
                letter-spacing: 1px;
                font-weight: 900;
              }
              .highlight-box p {
                margin: 0;
                color: #374151;
                font-size: 15px;
                line-height: 1.7;
              }
              .tactics-list {
                margin: 24px 0;
                padding-left: 0;
                list-style: none;
              }
              .tactics-list li {
                padding: 12px 0;
                padding-left: 32px;
                position: relative;
                color: #374151;
                font-size: 15px;
              }
              .tactics-list li:before {
                content: "▸";
                position: absolute;
                left: 0;
                color: #1e3a8a;
                font-weight: 900;
                font-size: 18px;
              }
              .button { 
                display: inline-block;
                background: #1e3a8a;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 900;
                margin-top: 24px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 14px;
                border: 2px solid #1e3a8a;
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
              }
              .footer { 
                text-align: center; 
                padding: 24px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
                border-top: 2px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>NEW CAMPAIGN ORDERS</h1>
                <div class="rank-badge">REDEPLOYMENT AUTHORIZED</div>
              </div>
              <div class="content">
                <p class="salutation">Operative ${data.userName},</p>
                <p><strong>MISSION BRIEFING:</strong> Every elite operative experiences pauses. What matters is having the courage to start again. You've got what it takes.</p>
                
                <div class="highlight-box">
                  <h3>STRATEGIC INTELLIGENCE</h3>
                  <p>People who return after a break often achieve more than before. The pause gives you fresh perspective and renewed energy. This is your moment.</p>
                </div>

                <p><strong>Recommended Strategy:</strong></p>
                <ul class="tactics-list">
                  <li>Pick ONE goal to focus on today</li>
                  <li>Spend just 10 minutes getting started</li>
                  <li>Celebrate every small win</li>
                  <li>Progress over perfection - always</li>
                </ul>

                <p><strong>Command Assessment:</strong> Your past progress shows you have what it takes. Your goals are still within reach. All you need is to take that first step today.</p>
                
                <center>
                  <a href="${data.dashboardUrl}" class="button">BEGIN YOUR NEXT MISSION</a>
                </center>
              </div>
              <div class="footer">
                <p><strong>NAVYGOAL COMMAND</strong> • Discipline • Excellence • Victory</p>
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
