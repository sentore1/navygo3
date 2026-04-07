# Fix OAuth Redirect URL Issue

## Problem

After Google login, you're being redirected to:
```
http://localhost:3000/?code=08990e4e-b561-407f-b7eb-b04c5ae05a13
```

Instead of:
```
https://navygoal.com/auth/callback?code=...
```

## Root Cause

Supabase's redirect URL configuration doesn't include your production domain.

## Solution

### Step 1: Update Supabase Redirect URLs

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (rilhdwxirwxqfgsqpiww)
3. Go to **Authentication** → **URL Configuration**
4. Update these settings:

#### Site URL:
```
https://navygoal.com
```

#### Redirect URLs (Add all of these):
```
http://localhost:3000/auth/callback
http://localhost:3000/**
https://navygoal.com/auth/callback
https://navygoal.com/**
```

The `**` wildcard allows any path under your domain.

### Step 2: Configure Google OAuth Redirect URIs

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Add these Authorized redirect URIs:

```
https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback
https://navygoal.com/auth/callback
http://localhost:3000/auth/callback
```

### Step 3: Verify Environment Variables

Check your production environment variables (Vercel/Netlify):

```env
NEXT_PUBLIC_SITE_URL=https://navygoal.com
NEXT_PUBLIC_SUPABASE_URL=https://rilhdwxirwxqfgsqpiww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 4: Test the Flow

1. Go to https://navygoal.com/sign-in
2. Click "Continue with Google"
3. After Google auth, you should be redirected to:
   ```
   https://navygoal.com/auth/callback?code=...&redirect_to=/dashboard
   ```
4. Then automatically redirected to:
   ```
   https://navygoal.com/dashboard
   ```

## Why This Happens

The OAuth flow works like this:

1. User clicks "Continue with Google"
2. Redirected to Google for authentication
3. Google redirects back to Supabase: `https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback`
4. Supabase redirects to your app: `https://navygoal.com/auth/callback?code=...`
5. Your app exchanges code for session
6. User is redirected to dashboard

If Supabase doesn't have the correct redirect URL configured, it defaults to localhost.

## Quick Fix Commands

### For Supabase Dashboard:

**Authentication → URL Configuration:**

Site URL:
```
https://navygoal.com
```

Redirect URLs (one per line):
```
http://localhost:3000/**
https://navygoal.com/**
```

### For Google Cloud Console:

**APIs & Services → Credentials → OAuth 2.0 Client → Authorized redirect URIs:**

```
https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback
```

## Verification Checklist

- [ ] Supabase Site URL set to `https://navygoal.com`
- [ ] Supabase Redirect URLs include `https://navygoal.com/**`
- [ ] Google OAuth redirect URI includes Supabase callback URL
- [ ] Production env has `NEXT_PUBLIC_SITE_URL=https://navygoal.com`
- [ ] Tested login flow on production

## Common Issues

### Issue 1: Still redirecting to localhost

**Solution:** Clear browser cache and cookies, or test in incognito mode.

### Issue 2: "Invalid redirect URL" error

**Solution:** Make sure the redirect URL in Supabase exactly matches what your app is sending.

### Issue 3: Code exchange fails

**Solution:** Check that your auth callback route (`/auth/callback`) exists and is working.

## Testing

### Test Locally:
```bash
npm run dev
# Visit http://localhost:3000/sign-in
# Click Google login
# Should redirect to http://localhost:3000/auth/callback
```

### Test Production:
```bash
# Visit https://navygoal.com/sign-in
# Click Google login
# Should redirect to https://navygoal.com/auth/callback
```

## Screenshots Guide

### Supabase Dashboard:

1. **Authentication** → **URL Configuration**
   - Site URL: `https://navygoal.com`
   - Redirect URLs: Add `https://navygoal.com/**`

2. **Authentication** → **Providers** → **Google**
   - Make sure Google is enabled
   - Client ID and Secret are configured

### Google Cloud Console:

1. **APIs & Services** → **Credentials**
2. Click your OAuth 2.0 Client ID
3. **Authorized redirect URIs** section
4. Add: `https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback`

## After Fixing

Once configured correctly, the flow will be:

1. User on `https://navygoal.com/sign-in`
2. Clicks Google login
3. Google auth page
4. Redirects to `https://navygoal.com/auth/callback?code=...`
5. Code exchanged for session
6. Redirects to `https://navygoal.com/dashboard`
7. User is logged in ✅

No more localhost redirects!
