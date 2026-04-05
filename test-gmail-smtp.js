// Quick test script for Gmail SMTP
// Run with: node test-gmail-smtp.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testGmailSMTP() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  // Check environment variables
  if (!process.env.GMAIL_USER) {
    console.error('❌ GMAIL_USER not found in .env.local');
    return;
  }
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ GMAIL_APP_PASSWORD not found in .env.local');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`📧 Gmail User: ${process.env.GMAIL_USER}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Test connection
  console.log('🔌 Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure 2-Step Verification is enabled');
    console.log('2. Generate an App Password at: https://myaccount.google.com/apppasswords');
    console.log('3. Use the App Password, not your regular Gmail password');
    return;
  }

  // Send test email
  console.log('📨 Sending test email...');
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Test App'}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to yourself
      subject: '🎉 Gmail SMTP Test - Success!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>✅ Gmail SMTP is Working!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Congratulations! Your Gmail SMTP configuration is working correctly.</p>
            <p><strong>Configuration:</strong></p>
            <ul>
              <li>Gmail User: ${process.env.GMAIL_USER}</li>
              <li>Service: Gmail SMTP</li>
              <li>Status: ✅ Active</li>
            </ul>
            <p>You can now send email notifications from your app!</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated test email from your notification system.</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Check your inbox: ${process.env.GMAIL_USER}\n`);
    console.log('🎉 Gmail SMTP is ready to use!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

testGmailSMTP();
