# Quick Google OAuth Setup (Using Your Existing Google Project)

## You Already Have Firebase - Here's What to Do

Since you already have a Google Cloud project (navygoal-5584b), you can use the same project for OAuth.

## Step 1: Create OAuth Credentials in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials?project=navygoal-5584b
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - App name: NavyGoal
   - User support email: your email
   - Scopes: email, profile, openid
4. Application type: "Web application"
5. Name: "NavyGoal OAuth Client"
6. Authorized redirect URIs - Add your Supabase callback URL:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   
   To find YOUR_SUPABASE_PROJECT_REF:
   - Go to your Supabase dashboard
   - Look at the URL or Project Settings
   - It's the subdomain before `.supabase.co`

7. Click "Create"
8. **COPY** the Client ID and Client Secret

## Step 2: Add to Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to "Authentication" → "Providers"
4. Find "Google" and toggle it ON
5. Paste:
   - **Client ID**: (from step 1)
   - **Client Secret**: (from step 1)
6. Click "Save"

## Step 3: Test It

1. Run your app: `npm run dev`
2. Go to: http://localhost:3000/sign-in
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected to /dashboard

## Important Notes

### Firebase vs Supabase Auth

You have Firebase config in your code, but you're using Supabase for authentication. Here's what you should know:

- **Firebase Analytics**: You can keep using Firebase for analytics (that's fine)
- **Firebase Auth**: You're NOT using this (you're using Supabase auth)
- **Google OAuth**: Works with Supabase, no Firebase auth needed

### If You Want to Use Firebase for Analytics

Keep your Firebase config but only for analytics. Create a separate file:

```typescript
// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDcbEi3ofOHL3Rvpml2LcoWY17U8Pl6K9Q",
  authDomain: "navygoal-5584b.firebaseapp.com",
  projectId: "navygoal-5584b",
  storageBucket: "navygoal-5584b.firebasestorage.app",
  messagingSenderId: "771673146536",
  appId: "1:771673146536:web:fa1c4996956ebbf680ae9d",
  measurementId: "G-W9QGCB0L6G"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };
```

Then use it only for tracking events, NOT for authentication.

## What I've Already Set Up For You

✅ Google OAuth button component (`src/components/google-oauth-button.tsx`)
✅ Updated sign-in page with Google button
✅ Updated sign-up page with Google button
✅ Auth callback handler (already existed)
✅ Database trigger to create user profile on OAuth sign-in

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
- Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### Button doesn't work
- Check browser console for errors
- Verify Supabase URL and anon key in `.env.local`
- Make sure Google provider is enabled in Supabase dashboard

### User not created in database
- Check if the trigger exists: `supabase/migrations/initial-setup.sql`
- The trigger should automatically create a user in your `users` table

## Next Steps

1. Get OAuth credentials from Google Cloud Console
2. Add them to Supabase dashboard
3. Test the sign-in flow
4. Verify user is created in your database

## Need Help?

Check the detailed guide: `SETUP_GOOGLE_OAUTH.md`
