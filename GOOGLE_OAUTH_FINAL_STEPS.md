# Google OAuth - Final Setup Steps

## ✅ What's Already Done

1. ✅ Google OAuth button component created
2. ✅ Sign-in page updated with Google button
3. ✅ Sign-up page updated with Google button
4. ✅ Auth callback handler ready
5. ✅ Database trigger for user creation exists
6. ✅ Supabase credentials configured in .env.local

## 🔧 What You Need to Do Now

### Step 1: Get OAuth Credentials from Google Cloud Console

Your Supabase callback URL is:
```
https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback
```

1. Go to: https://console.cloud.google.com/apis/credentials?project=navygoal-5584b

2. Click "Create Credentials" → "OAuth client ID"

3. If you need to configure OAuth consent screen first:
   - Click "Configure Consent Screen"
   - User Type: External
   - App name: NavyGoal
   - User support email: abdousentore@gmail.com
   - Developer contact: abdousentore@gmail.com
   - Scopes: Add email, profile, openid
   - Save and continue

4. Back to "Create OAuth client ID":
   - Application type: Web application
   - Name: NavyGoal OAuth Client
   - Authorized JavaScript origins:
     - http://localhost:3000
     - (add your production domain later)
   - Authorized redirect URIs:
     - https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback
   - Click "Create"

5. **COPY** the Client ID and Client Secret that appear

### Step 2: Add Credentials to Supabase

1. Go to: https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/auth/providers

2. Find "Google" in the providers list

3. Toggle it ON

4. Paste your credentials:
   - Client ID: (from step 1)
   - Client Secret: (from step 1)

5. Click "Save"

### Step 3: Test It

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/sign-in

3. Click "Continue with Google"

4. Sign in with your Google account

5. You should be redirected to /dashboard

6. Check your Supabase dashboard to verify the user was created:
   - Go to: https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/auth/users

## 📋 Verification Checklist

After testing, verify:

- [ ] Google sign-in button appears on /sign-in page
- [ ] Google sign-in button appears on /sign-up page
- [ ] Clicking the button redirects to Google
- [ ] After Google sign-in, redirects back to your app
- [ ] User is created in Supabase auth.users table
- [ ] User is created in your public.users table
- [ ] User can access /dashboard after sign-in

## 🐛 Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Make sure you added the exact callback URL to Google Cloud Console:
```
https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback
```

### Issue: "Access blocked: This app's request is invalid"
**Solution**: Configure the OAuth consent screen in Google Cloud Console

### Issue: Button doesn't do anything
**Solution**: 
- Check browser console for errors
- Verify Google provider is enabled in Supabase
- Make sure you saved the credentials in Supabase

### Issue: User not in database
**Solution**: Check if the trigger exists by running this in Supabase SQL Editor:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 🚀 Production Setup (Later)

When you're ready to deploy:

1. Add your production domain to Google Cloud Console:
   - Authorized JavaScript origins: https://yourdomain.com
   - Authorized redirect URIs: https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/callback

2. Update NEXT_PUBLIC_SITE_URL in your production environment

3. Consider publishing your OAuth consent screen (if you want public access)

## 📝 Notes

- You don't need Firebase Auth for this - Supabase handles everything
- You can still use Firebase for analytics if you want
- The same Google Cloud project (navygoal-5584b) can be used for both OAuth and Firebase services
- OAuth credentials are separate from Firebase config

## 🆘 Need Help?

If something doesn't work:
1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs → Auth
3. Verify all credentials are correct
4. Make sure the Google provider is enabled in Supabase

## 📚 Additional Resources

- Detailed setup guide: `SETUP_GOOGLE_OAUTH.md`
- Quick setup: `GOOGLE_OAUTH_QUICK_SETUP.md`
- Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google
