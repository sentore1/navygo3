# Security Best Practices for Environment Variables

## ⚠️ IMPORTANT: Never Store Secrets in Database

The admin settings page I created stores env vars in the database, which is **NOT SECURE** for production.

## Recommended Approach

### 1. Use Environment Variables Directly

Store secrets in your hosting platform's environment variables:

**Vercel:**
```bash
# Go to Project Settings → Environment Variables
# Add each variable there
```

**Netlify:**
```bash
# Go to Site Settings → Environment Variables
# Add each variable there
```

**Railway/Render:**
```bash
# Use their dashboard to add environment variables
```

### 2. Local Development

Use `.env.local` file (already in `.gitignore`):

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
KPAY_API_URL=https://api.kpay.rw
KPAY_USERNAME=your_username
KPAY_PASSWORD=your_password
POLAR_API_KEY=polar_xxxxx
POLAR_ORGANIZATION_ID=org_xxxxx
```

### 3. Secure Admin Settings Page

The admin settings page should:
- ✅ Show which env vars are configured (without showing values)
- ✅ Allow toggling gateways on/off
- ❌ NOT allow editing secrets through the UI
- ❌ NOT store secrets in database

## Security Checklist

### Database Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Admin role required for sensitive operations
- ✅ Secrets NOT stored in database
- ✅ Use Supabase Vault for any DB-stored secrets (encrypted)

### API Security
- ✅ All API routes check authentication
- ✅ Admin endpoints verify admin role
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS properly configured

### Frontend Security
- ✅ Never expose secrets in client-side code
- ✅ Admin pages check role before rendering
- ✅ Sensitive data masked in UI
- ✅ HTTPS only in production

### Access Control
- ✅ Only admins can access `/admin/*` routes
- ✅ Regular users cannot see admin features
- ✅ Database policies enforce role-based access
- ✅ Audit log for admin actions

## How to Secure Your Current Setup

### Option 1: Remove Database Storage (Recommended)

1. Don't store secrets in `payment_gateway_settings.config`
2. Use the admin page only to toggle gateways on/off
3. Configure secrets via hosting platform environment variables

### Option 2: Use Supabase Vault (Advanced)

If you must store secrets in database:

```sql
-- Use Supabase Vault for encrypted storage
INSERT INTO vault.secrets (name, secret)
VALUES ('stripe_secret_key', 'sk_test_xxxxx');

-- Retrieve in your functions
SELECT decrypted_secret 
FROM vault.decrypted_secrets 
WHERE name = 'stripe_secret_key';
```

### Option 3: Encrypt Before Storing (Medium Security)

```typescript
// Use a server-side encryption key
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

## What Hackers Can Do

### If Database is Compromised:
- ❌ Access all user data
- ❌ Read payment gateway secrets (if stored in DB)
- ❌ Modify admin settings
- ✅ RLS policies prevent unauthorized access
- ✅ Encrypted secrets are harder to use

### If Environment Variables are Compromised:
- ❌ Access payment gateway APIs
- ❌ Process fraudulent transactions
- ✅ Harder to compromise (server-side only)
- ✅ Can rotate keys without DB changes

## Recommended Production Setup

1. **Never commit `.env.local` to git** (already in .gitignore)
2. **Use hosting platform environment variables**
3. **Rotate secrets regularly**
4. **Monitor for suspicious activity**
5. **Use webhook signature verification**
6. **Enable 2FA for admin accounts**
7. **Audit log all admin actions**
8. **Rate limit API endpoints**

## Current Implementation Status

✅ Admin role required for settings page
✅ RLS policies on all tables
✅ Admin activity logging
⚠️ Secrets stored in database (not recommended)
⚠️ No encryption on stored secrets
⚠️ No rate limiting on admin endpoints

## Next Steps to Improve Security

1. Remove secret storage from database
2. Add rate limiting middleware
3. Implement webhook signature verification
4. Add 2FA for admin accounts
5. Set up monitoring and alerts
6. Regular security audits
