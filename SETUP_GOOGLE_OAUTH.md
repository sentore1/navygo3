# Google OAuth Setup Guide

## Step 1: Configure Google Cloud Console

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name

### 1.2 Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: Your app name (e.g., "NavyGoal")
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: email, profile, openid
   - Add test users if needed
4. Application type: "Web application"
5. Name: "NavyGoal Web Client" (or your app name)
6. Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Authorized redirect URIs:
   - For Supabase, use the format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
8. Click "Create"
9. Copy your "Client ID" and "Client Secret"

## Step 2: Configure Supabase

### 2.1 Add Google Provider in Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" > "Providers"
4. Find "Google" in the list
5. Toggle "Enable Sign in with Google"
6. Paste your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
7. Click "Save"

### 2.2 Get Your Supabase Callback URL
Your callback URL format is:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

To find your project ref:
1. Go to Supabase Dashboard > Settings > API
2. Look for "Project URL"
3. Your project ref is the subdomain (e.g., `abcdefghijklmnop` from `https://abcdefghijklmnop.supabase.co`)

### 2.3 Update Google Cloud Console with Supabase Callback
1. Go back to Google Cloud Console > Credentials
2. Click on your OAuth 2.0 Client ID
3. Add the Supabase callback URL to "Authorized redirect URIs"
4. Click "Save"

## Step 3: Update Your Environment Variables

Add these to your `.env.local` file (if needed):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Test the Integration

### 4.1 Development Testing
1. Start your development server: `npm run dev`
2. Go to `/sign-in` or `/sign-up`
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to your app

### 4.2 Verify User Creation
1. After signing in with Google, check your Supabase Dashboard
2. Go to "Authentication" > "Users"
3. You should see the new user with their Google email
4. The user's metadata will include their Google profile info

## Step 5: Handle User Data

The Google OAuth flow automatically creates a user in your Supabase auth.users table with:
- Email (from Google)
- Full name (from Google profile)
- Avatar URL (from Google profile picture)
- Provider: "google"

### 5.1 Sync to Your Users Table
If you have a custom `users` table, you may need to create a trigger or use a webhook to sync the data.

Example trigger (already in your migrations if you have one):
```sql
-- This trigger automatically creates a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
- Check for trailing slashes or http vs https

### Error: "Access blocked: This app's request is invalid"
- Configure the OAuth consent screen in Google Cloud Console
- Add your email as a test user if the app is not published

### Users not appearing in your custom users table
- Check if you have a trigger to sync auth.users to your users table
- Verify the trigger is working by checking Supabase logs

### Google button not working
- Check browser console for errors
- Verify your Supabase URL and anon key are correct
- Make sure the Google provider is enabled in Supabase

## Production Checklist

Before going to production:

- [ ] Update Google Cloud Console with production domain
- [ ] Add production redirect URIs to Google OAuth client
- [ ] Verify OAuth consent screen is configured properly
- [ ] Test sign-in flow on production domain
- [ ] Consider publishing your OAuth consent screen (if needed)
- [ ] Set up proper error handling and logging
- [ ] Test user data sync to your database

## Security Best Practices

1. Never commit your Google Client Secret to version control
2. Use environment variables for sensitive data
3. Regularly rotate your OAuth credentials
4. Monitor OAuth usage in Google Cloud Console
5. Set up proper CORS policies
6. Implement rate limiting for auth endpoints

## Additional Features

### One-Tap Sign-In (Google Identity Services)
For a more seamless experience, you can implement Google's One Tap sign-in:
- Requires additional setup with Google Identity Services
- Shows a popup for returning users
- Faster sign-in experience

### Account Linking
If users sign up with email first, then try Google:
- Supabase will link accounts if the email matches
- Users can have multiple auth methods for the same account

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard > Logs > Auth
2. Check Google Cloud Console logs
3. Review browser console for client-side errors
4. Consult Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google
