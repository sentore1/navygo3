# Gmail SMTP Setup Guide

## Why Gmail SMTP?
- Free for Google Workspace users
- Reliable delivery
- No additional service needed
- 500 emails/day limit (2,000/day for Google Workspace)

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com
2. Click "Security" in the left menu
3. Under "Signing in to Google", enable "2-Step Verification"
4. Follow the setup process

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "Your App Notifications" as the name
5. Click "Generate"
6. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

## Step 3: Install Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

## Step 4: Add Environment Variables

Add to your `.env.local`:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Use the App Password, NOT your regular Gmail password!

## Step 5: Update API Route

Replace the import in `src/app/api/send-notification/route.ts`:

```typescript
// Change this:
import { sendEmailNotification } from '@/lib/notifications/email';

// To this:
import { sendEmailNotification } from '@/lib/notifications/email-gmail';
```

## Step 6: Test the Connection

Create a test file `test-gmail.ts`:

```typescript
import { testEmailConnection, sendEmailNotification } from './src/lib/notifications/email-gmail';

async function test() {
  // Test connection
  const connectionTest = await testEmailConnection();
  console.log('Connection test:', connectionTest);

  // Send test email
  const result = await sendEmailNotification({
    to: 'your-email@gmail.com',
    type: 'achievement_unlocked',
    data: {
      userName: 'Test User',
      achievementName: 'Test Achievement',
      achievementDescription: 'This is a test email',
      dashboardUrl: 'http://localhost:3000/dashboard',
    },
  });
  
  console.log('Email result:', result);
}

test();
```

Run it:
```bash
npx tsx test-gmail.ts
```

## Step 7: Update Edge Function (Optional)

If using Supabase Edge Functions, update `supabase/functions/send-goal-reminders/index.ts` to use your API route.

## Sending Limits

### Gmail (Free)
- 500 emails per day
- 100 recipients per email
- Good for: Small apps, personal projects

### Google Workspace
- 2,000 emails per day
- 2,000 recipients per email
- Good for: Business apps, growing startups

### If you need more:
- Use Resend (3,000/month free, then $20/month for 50k)
- Use SendGrid (100/day free, then $15/month for 40k)
- Use AWS SES (62,000/month free, then $0.10 per 1,000)

## Troubleshooting

### Error: "Invalid login"
- Make sure you're using the App Password, not your regular password
- Check that 2-Step Verification is enabled
- Regenerate the App Password

### Error: "Daily sending quota exceeded"
- You've hit the 500/day limit
- Wait 24 hours or upgrade to Google Workspace
- Consider using a dedicated email service

### Emails going to spam
- Add SPF record to your domain
- Add DKIM record to your domain
- Use a custom domain instead of @gmail.com
- Warm up your sending (start with few emails, gradually increase)

### Error: "Connection timeout"
- Check your firewall settings
- Make sure port 587 is not blocked
- Try using port 465 instead (SSL)

## Security Best Practices

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Use App Passwords**: Never use your main Gmail password
3. **Rotate passwords**: Change App Password every 90 days
4. **Monitor usage**: Check Gmail sent folder regularly
5. **Rate limiting**: Implement rate limiting in your API

## Alternative SMTP Ports

If port 587 doesn't work, try:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // SSL
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
```

## Production Considerations

For production, consider:

1. **Custom Domain**: Use your own domain instead of @gmail.com
2. **Dedicated Service**: Use Resend, SendGrid, or AWS SES for better deliverability
3. **Email Queue**: Implement a queue system for high volume
4. **Monitoring**: Track delivery rates and bounces
5. **Unsubscribe**: Add unsubscribe links to comply with regulations

## Cost Comparison

| Solution | Free Tier | Best For |
|----------|-----------|----------|
| Gmail SMTP | 500/day | Personal projects |
| Google Workspace | 2,000/day | Small business |
| Resend | 3,000/month | Startups |
| SendGrid | 100/day | Testing |
| AWS SES | 62,000/month | High volume |

## Next Steps

1. ✅ Enable 2-Step Verification
2. ✅ Generate App Password
3. ✅ Install nodemailer
4. ✅ Add environment variables
5. ✅ Update API route import
6. ✅ Test email sending
7. ✅ Deploy to production
