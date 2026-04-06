// Test goal reminder email with actual goal titles
// Run with: node test-goal-reminder-with-titles.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function sendGoalReminderWithTitles() {
  console.log('📬 Sending goal reminder with titles to abdousentore@gmail.com...\n');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS?.replace(/\s/g, ''),
    },
  });

  // Example goals (in real system, these come from database)
  const goals = [
    { title: 'Complete project documentation', category: 'Work' },
    { title: 'Exercise for 30 minutes', category: 'Health' },
    { title: 'Learn React hooks', category: 'Learning' },
  ];

  const pendingGoals = goals.length;

  const emailHtml = `
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
          <p class="salutation">Operative Abdou,</p>
          <p>Your command center has identified <strong>${pendingGoals}</strong> active mission(s) requiring your attention. You've got this - let's make today count.</p>
          
          <div class="mission-box">
            <div class="mission-number">${pendingGoals}</div>
            <div class="mission-label">Active Missions</div>
          </div>

          <div class="orders">
            <div class="orders-title">YOUR ACTIVE MISSIONS</div>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
              ${goals.map(goal => `<li><strong>${goal.title}</strong> <span style="color: #9ca3af;">(${goal.category})</span></li>`).join('')}
            </ul>
          </div>

          <div class="orders">
            <div class="orders-title">STANDING ORDERS</div>
            <p class="orders-text">"Victory belongs to those who believe in it the most and believe in it the longest. We are going to win." — Admiral William F. Halsey Jr.</p>
          </div>

          <p><strong>Mission Protocol:</strong> Every objective you complete brings you closer to your goals. Small steps lead to big victories. Stay focused and keep moving forward.</p>
          
          <center>
            <a href="https://navygoal.com/dashboard" class="button">VIEW YOUR MISSIONS</a>
          </center>
        </div>
        <div class="footer">
          <p><strong>CLASSIFIED:</strong> Mission briefings enabled by your preferences.</p>
          <p><a href="https://navygoal.com/settings">Modify notification settings</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"NavyGoal Command" <${process.env.SMTP_USER}>`,
      to: 'abdousentore@gmail.com',
      subject: 'MISSION BRIEFING: Your Daily Objectives Await',
      html: emailHtml,
    });

    console.log('✅ Goal reminder email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: abdousentore@gmail.com`);
    console.log(`🎯 Pending goals: ${pendingGoals}`);
    console.log(`📋 Goal titles included:\n`);
    goals.forEach((goal, i) => {
      console.log(`   ${i + 1}. ${goal.title} (${goal.category})`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

sendGoalReminderWithTitles();
