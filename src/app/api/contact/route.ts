import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email to admin (4brohz@gmail.com)
    const adminEmailHtml = `
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
          .info-row {
            margin: 16px 0;
            padding: 16px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .info-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #718096;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
          }
          .message-box {
            background: #f7fafc;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
          }
          .message-box p {
            margin: 0;
            color: #2d3748;
            white-space: pre-wrap;
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
            <h1>📬 New Contact Form Submission</h1>
          </div>
          <div class="content">
            <p>You have received a new message from your website contact form.</p>
            
            <div class="info-row">
              <div class="info-label">From</div>
              <div class="info-value">${name}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Email</div>
              <div class="info-value">
                <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
              </div>
            </div>

            <div class="info-row">
              <div class="info-label">Received</div>
              <div class="info-value">${new Date().toLocaleString()}</div>
            </div>

            <div style="margin-top: 24px;">
              <div class="info-label">Message</div>
              <div class="message-box">
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>

            <p style="margin-top: 24px; color: #718096; font-size: 14px;">
              💡 Reply directly to this email to respond to ${name}.
            </p>
          </div>
          <div class="footer">
            <p>This email was sent from your NavyGoal contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: `"NavyGoal Contact Form" <${process.env.GMAIL_USER}>`,
      to: '4brohz@gmail.com',
      replyTo: email, // Allow direct reply to the sender
      subject: `New Contact Form Message from ${name}`,
      html: adminEmailHtml,
    });

    // Send confirmation email to user
    const userEmailHtml = `
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
          .message-copy {
            background: #f7fafc;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #4facfe;
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
            <h1>✅ Message Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to us! We've received your message and will get back to you as soon as possible, typically within 24 hours.</p>
            
            <div class="message-copy">
              <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #718096;">Your Message</p>
              <p style="margin: 0; color: #2d3748;">${message.replace(/\n/g, '<br>')}</p>
            </div>

            <p>If you have any urgent questions, feel free to reply to this email directly.</p>
            
            <p style="margin-top: 24px;">
              Best regards,<br>
              <strong>The NavyGoal Team</strong>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email from NavyGoal.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation to user
    await transporter.sendMail({
      from: `"NavyGoal" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'We received your message - NavyGoal',
      html: userEmailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
