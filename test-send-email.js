// Test email sending to abdousentore@gmail.com
// Run with: node test-send-email.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function sendTestEmail() {
  console.log('🚀 Preparing to send NavyGoal mission briefing...\n');

  // Log credentials for debugging (remove spaces from password)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS?.replace(/\s/g, ''); // Remove all spaces
  
  console.log('SMTP User:', smtpUser);
  console.log('SMTP Pass length:', smtpPass?.length);
  console.log('SMTP Pass (masked):', smtpPass ? smtpPass.substring(0, 4) + '****' : 'NOT SET');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

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
          background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); 
          color: #ffffff; 
          padding: 30px; 
          text-align: center;
          border-bottom: 4px solid #fbbf24;
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
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 24px;
          border-radius: 4px;
          margin: 24px 0;
          border-left: 6px solid #1e3a8a;
        }
        .mission-title {
          font-size: 18px;
          font-weight: 900;
          color: #1e3a8a;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .mission-item {
          padding: 8px 0;
          color: #1e40af;
          font-size: 15px;
        }
        .mission-item:before {
          content: "▸ ";
          font-weight: 900;
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
          background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
          color: white;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 700;
          margin-top: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 14px;
          border: 2px solid #fbbf24;
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
          color: #1e3a8a;
          text-decoration: none;
          font-weight: 600;
        }
        .status-badge {
          display: inline-block;
          background: #16a34a;
          color: white;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 2px;
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚓ DEVELOPMENT STATUS REPORT</h1>
          <div class="rank-badge">LEAD DEVELOPER</div>
        </div>
        <div class="content">
          <p class="salutation">Operative Abdou,</p>
          <p><strong>MISSION STATUS:</strong> NavyGoal platform development is progressing with exceptional momentum. Command has reviewed your recent activities and compiled this status report.</p>
          
          <div class="mission-box">
            <div class="mission-title">🎯 COMPLETED OPERATIONS</div>
            <div class="mission-item">Email notification system redesigned with military theme</div>
            <div class="mission-item">7 email templates transformed to NavyGoal command structure</div>
            <div class="mission-item">Military terminology and branding implemented</div>
            <div class="mission-item">User engagement strategy enhanced with navy discipline</div>
            <div class="mission-item">Gmail SMTP integration operational</div>
          </div>

          <div class="orders">
            <div class="orders-title">⚡ CURRENT DEPLOYMENT STATUS</div>
            <p class="orders-text">
              <strong>Platform Components:</strong><br>
              <span class="status-badge">✓ OPERATIONAL</span> Admin Dashboard & CMS<br>
              <span class="status-badge">✓ OPERATIONAL</span> Landing Page System<br>
              <span class="status-badge">✓ OPERATIONAL</span> Pricing & Subscription (Polar)<br>
              <span class="status-badge">✓ OPERATIONAL</span> Email Notification System<br>
              <span class="status-badge">✓ OPERATIONAL</span> User Authentication (Supabase)<br>
              <span class="status-badge">✓ OPERATIONAL</span> Database & Migrations<br>
            </p>
          </div>

          <p><strong>STRATEGIC ASSESSMENT:</strong> Your NavyGoal platform demonstrates elite-level architecture. The military theme creates a unique positioning in the goal-tracking market. Users will feel like they're part of an elite force, not just using another productivity app.</p>

          <div class="orders">
            <div class="orders-title">📋 RECOMMENDED NEXT OBJECTIVES</div>
            <p class="orders-text">
              1. Deploy email notification triggers (cron jobs/webhooks)<br>
              2. Test complete user journey from signup to first mission<br>
              3. Configure production email domain for Resend/Gmail<br>
              4. Launch beta campaign to recruit first operatives<br>
              5. Monitor engagement metrics and adjust tactics
            </p>
          </div>

          <p><strong>COMMAND NOTES:</strong> The transformation from generic productivity app to military-themed goal platform is complete. Your users will now receive communications that make them feel like elite operatives on important missions. This psychological positioning is powerful.</p>
          
          <center>
            <a href="http://localhost:3000" class="button">ACCESS COMMAND CENTER</a>
          </center>

          <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
            <strong>Test Email Sent:</strong> ${new Date().toLocaleString()}<br>
            <strong>From:</strong> NavyGoal Command<br>
            <strong>Classification:</strong> Development Status Report
          </p>
        </div>
        <div class="footer">
          <p><strong>NAVYGOAL COMMAND</strong> • Discipline • Excellence • Victory</p>
          <p>This is a test email from your development environment.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"NavyGoal Command" <${process.env.SMTP_USER}>`,
      to: 'abdousentore@gmail.com',
      subject: '⚓ MISSION STATUS: NavyGoal Development Report',
      html: emailHtml,
    });

    console.log('✅ Email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: abdousentore@gmail.com`);
    console.log('\n🎉 Check your inbox for the mission briefing!\n');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.log('\n💡 Make sure you have set up:');
    console.log('   - SMTP_USER in .env.local');
    console.log('   - SMTP_PASS in .env.local');
  }
}

sendTestEmail();
