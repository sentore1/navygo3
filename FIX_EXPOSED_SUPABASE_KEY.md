# Fix Exposed Supabase Service Role Key

## ⚠️ CRITICAL SECURITY ISSUE

Your Supabase Service Role JWT has been exposed on GitHub. This key has FULL ADMIN ACCESS to your database and can bypass all security rules.

## Immediate Actions Required

### Step 1: Rotate the Service Role Key IMMEDIATELY

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Under "Service Role Key", click **"Regenerate"** or **"Reset"**
5. Copy the new key

**This will invalidate the old exposed key immediately.**

### Step 2: Update Your Local Environment

Update `.env.local` with the new key:
```env
SUPABASE_SERVICE_KEY=<your-new-service-role-key>
```

**NEVER commit this file to Git!**

### Step 3: Verify .gitignore

Make sure `.env.local` is in your `.gitignore`:

```bash
# Check if it's already there
cat .gitignore | grep ".env.local"
```

If not found, add it:
```bash
echo ".env.local" >> .gitignore
```

### Step 4: Remove the Key from Git History

The exposed key is still in your Git history. You need to remove it:

#### Option A: Using git-filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove .env.local from entire history
git filter-repo --path .env.local --invert-paths --force

# Force push to GitHub
git push origin --force --all
```

#### Option B: Using BFG Repo-Cleaner

```bash
# Download BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env.local from history
java -jar bfg.jar --delete-files .env.local

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

#### Option C: Nuclear Option - Delete and Recreate Repo

If the above is too complex:
1. Download your code locally
2. Delete the GitHub repository
3. Create a new repository
4. Make sure `.env.local` is in `.gitignore`
5. Push clean code to new repo

### Step 5: Update Production Environment Variables

If you're deployed on Vercel/Netlify/etc:

**Vercel:**
```bash
vercel env rm SUPABASE_SERVICE_KEY production
vercel env add SUPABASE_SERVICE_KEY production
# Paste the new key when prompted
```

**Netlify:**
1. Go to Site Settings → Environment Variables
2. Delete old `SUPABASE_SERVICE_KEY`
3. Add new one with the regenerated key

**Other platforms:**
Update the environment variable in your hosting dashboard.

### Step 6: Redeploy Your Application

```bash
# Trigger a new deployment with the updated key
git commit --allow-empty -m "Rotate Supabase service key"
git push
```

### Step 7: Audit Your Database

Check for any suspicious activity:

```sql
-- Check recent database changes
SELECT * FROM auth.audit_log_entries 
ORDER BY created_at DESC 
LIMIT 100;

-- Check for unauthorized users
SELECT * FROM auth.users 
ORDER BY created_at DESC;

-- Check for unusual data modifications
SELECT * FROM your_important_tables 
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;
```

## Prevention: What Files Should NEVER Be Committed

Add these to `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Supabase
.supabase/

# API Keys and Secrets
**/secrets.json
**/*-key.json
**/*.pem
**/*.key

# Database dumps
*.sql.gz
*.dump
```

## How to Safely Use Environment Variables

### For Local Development:
- Use `.env.local` (gitignored)
- Never commit this file

### For Team Sharing:
Create `.env.example` with placeholder values:

```env
# .env.example - Safe to commit
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
GMAIL_USER=your_gmail_here
GMAIL_APP_PASSWORD=your_gmail_app_password_here
```

### For Production:
- Use your hosting platform's environment variable system
- Never hardcode keys in your code

## Check What Was Exposed

Search your GitHub repo for exposed secrets:

```bash
# Search for Supabase keys in history
git log -p | grep -i "supabase"

# Search for any JWT tokens
git log -p | grep -E "eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"
```

## Additional Security Measures

### 1. Enable Row Level Security (RLS)
Make sure all tables have RLS enabled:

```sql
-- Check which tables don't have RLS
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT tablename 
  FROM pg_policies
);
```

### 2. Use Supabase Vault for Secrets
Store sensitive data in Supabase Vault instead of environment variables:

```sql
-- Store a secret
SELECT vault.create_secret('my-secret-value', 'my-secret-name');

-- Retrieve a secret
SELECT decrypted_secret 
FROM vault.decrypted_secrets 
WHERE name = 'my-secret-name';
```

### 3. Set Up GitHub Secret Scanning

1. Go to your GitHub repo
2. Settings → Security → Code security and analysis
3. Enable "Secret scanning"
4. Enable "Push protection"

This will prevent future accidental commits of secrets.

## Checklist

- [ ] Regenerated Supabase Service Role key
- [ ] Updated `.env.local` with new key
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Removed exposed key from Git history
- [ ] Updated production environment variables
- [ ] Redeployed application
- [ ] Audited database for suspicious activity
- [ ] Enabled GitHub secret scanning
- [ ] Created `.env.example` for team reference
- [ ] Documented incident (date, what was exposed, actions taken)

## Why This Matters

The Service Role key can:
- ✅ Bypass ALL Row Level Security policies
- ✅ Read/write/delete ANY data in your database
- ✅ Create/modify/delete users
- ✅ Access authentication data
- ✅ Modify database schema
- ✅ Execute any SQL query

**Anyone with this key has complete control over your database.**

## Questions?

If you're unsure about any step, it's better to:
1. Rotate the key immediately (Step 1)
2. Update your local and production environments (Steps 2 & 5)
3. Ask for help with Git history cleanup later

The most important thing is to invalidate the exposed key ASAP.
