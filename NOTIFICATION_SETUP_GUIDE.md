# Notification System Setup Guide

## Overview
This guide explains how to implement email and push notifications for your app.

## 1. Email Notifications (Using Resend)

### Why Resend?
- Modern, developer-friendly API
- Free tier: 3,000 emails/month
- React Email template support
- Excellent deliverability
- Simple setup

### Setup Steps:

#### Step 1: Install Dependencies
```bash
npm install resend
npm install @react-email/components
```

#### Step 2: Get Resend API Key
1. Sign up at https://resend.com
2. Verify your domain (or use their test domain for development)
3. Get your API key from the dashboard
4. Add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### Step 3: Create Email Templates
See `src/emails/` folder for templates

#### Step 4: Create API Route
See `src/app/api/send-notification/route.ts`

#### Step 5: Trigger Notifications
Call the API from your app when events occur

---

## 2. Push Notifications (Web Push API)

### Why Web Push?
- Native browser notifications
- Works offline
- No third-party service needed (or use OneSignal for easier setup)

### Setup Steps:

#### Option A: Native Web Push (Free, More Control)
1. Generate VAPID keys
2. Register service worker
3. Request permission from users
4. Send notifications via Web Push API

#### Option B: OneSignal (Easier, Free Tier Available)
1. Sign up at https://onesignal.com
2. Add SDK to your app
3. Use their dashboard to send notifications

---

## 3. Notification Triggers

### When to Send Notifications:

1. **Goal Reminders**: Daily cron job checks users with incomplete goals
2. **Achievement Notifications**: Triggered when user completes a milestone
3. **Email Updates**: Account changes, subscription updates
4. **Push Notifications**: Real-time updates for active users

### Implementation:
- Use Supabase Edge Functions for scheduled tasks
- Use database triggers for event-based notifications
- Use API routes for immediate notifications

---

## 4. Alternative: Supabase Auth SMTP

You can also extend Supabase's built-in SMTP for custom emails:

1. Configure SMTP in Supabase Dashboard
2. Use Supabase's email templates
3. Trigger via database functions

---

## Recommended Approach:

**For Email**: Use Resend (easiest, best deliverability)
**For Push**: Start with Web Push API, add OneSignal later if needed
**For Scheduling**: Use Supabase Edge Functions with cron

---

## Cost Comparison:

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Resend | 3,000 emails/month | $20/month for 50k |
| SendGrid | 100 emails/day | $15/month for 40k |
| OneSignal | 10,000 subscribers | $9/month for unlimited |
| Web Push | Free (self-hosted) | Server costs only |

---

## Next Steps:

1. Choose your email provider (Resend recommended)
2. Set up email templates
3. Create notification API routes
4. Implement Web Push for browser notifications
5. Set up cron jobs for scheduled notifications
