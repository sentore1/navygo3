# Security Upgrade Summary

## Current Situation

You're using Supabase's **Service Role Key** everywhere, which:
- ❌ Has FULL ADMIN ACCESS to your database
- ❌ Bypasses ALL Row Level Security (RLS) policies
- ❌ Is extremely dangerous if exposed (which happened via GitGuardian)
- ❌ Violates principle of least privilege

## The Solution: Use Secret Key Instead

Supabase offers a **Secret Key** that:
- ✅ Works server-side only (like Service Role)
- ✅ Respects RLS policies (safer)
- ✅ Has limited access (less damage if exposed)
- ✅ Follows security best practices

## Quick Start

### 1. Get Your Secret Key (2 minutes)

Go to: https://supabase.com/dashboard → Your Project → Settings → API

You'll see:
- **Publishable Key** (same as anon key) - Public, safe
- **Secret Key** - Server-side, respects RLS ✅ GET THIS
- **Service Role Key** - Admin access, dangerous ⚠️

### 2. Add to .env.local

```env
# Add this new line
SUPABASE_SECRET_KEY=your_secret_key_here

# Keep this for admin operations only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Use the Helper Functions

I created `src/lib/supabase-admin.ts` with two functions:

```typescript
// For most operations (respects RLS)
import { createSecretClient } from '@/lib/supabase-admin';
const supabase = createSecretClient();

// For admin operations only (bypasses RLS)
import { createServiceRoleClient } from '@/lib/supabase-admin';
const supabase = createServiceRoleClient();
```

## Decision Tree: Which Key Should I Use?

```
Is this an external webhook (Stripe, Polar)?
├─ YES → Use Service Role Key
└─ NO → Does it need to bypass RLS?
    ├─ YES → Use Service Role Key
    └─ NO → Use Secret Key ✅ (Most cases)
```

## Files to Migrate

### ✅ Safe to Migrate (Use Secret Key):

1. `src/app/api/send-notification/route.ts`
2. `supabase/functions/send-goal-reminders/index.ts`
3. `supabase/functions/check-inactive-users/index.ts`
4. Most other API routes and Edge Functions

### ⚠️ Keep Service Role Key:

1. `src/app/api/polar-webhook/route.ts` - External webhook
2. `src/app/api/kpay-webhook/route.ts` - External webhook
3. `src/app/api/activate-subscription/route.ts` - Admin operation
4. `supabase/functions/payments-webhook/index.ts` - External webhook

## Example Migration

**Before:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!  // ❌ Overkill
);
```

**After:**
```typescript
import { createSecretClient } from '@/lib/supabase-admin';

const supabase = createSecretClient();  // ✅ Safer
```

## Benefits

### Security
- Less damage if key is exposed
- Respects your security policies
- Follows principle of least privilege

### Development
- RLS policies work as expected
- Easier to test permissions
- Catches bugs early

### Compliance
- Follows Supabase best practices
- Better audit trail
- Reduces attack surface

## Action Plan

### Immediate (Do Now):
1. ✅ Get Secret Key from Supabase Dashboard
2. ✅ Add to `.env.local`
3. ✅ Use `createSecretClient()` helper (already created)

### Short Term (This Week):
1. Migrate `send-notification` API route
2. Migrate Edge Functions
3. Test thoroughly

### Long Term (This Month):
1. Audit all Service Role Key usage
2. Migrate everything that doesn't need admin access
3. Document which files need Service Role Key and why

## Testing

After migration, test that RLS is working:

```typescript
const supabase = createSecretClient();

// Should only return user's own data
const { data } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', userId);
```

If you get permission errors, check your RLS policies.

## Rollback Plan

If something breaks:
1. Keep both keys in environment variables
2. Temporarily revert to `createServiceRoleClient()`
3. Debug the RLS policies
4. Fix policies, then migrate again

## Documentation Created

I've created these guides for you:

1. **MIGRATE_TO_SECRET_KEY.md** - Complete migration guide
2. **src/lib/supabase-admin.ts** - Helper functions
3. **EXAMPLE_MIGRATION.md** - Real example from your code
4. **FIX_EXPOSED_SUPABASE_KEY.md** - Security incident response
5. **SECURITY_UPGRADE_SUMMARY.md** - This file

## Questions?

**Q: Can I use both keys?**
A: Yes! Use Secret Key for most operations, Service Role Key for admin operations.

**Q: Will this break my app?**
A: Not if you have proper RLS policies. Test in development first.

**Q: What if I don't have RLS policies?**
A: You should! But you can keep using Service Role Key until you add them.

**Q: Is Secret Key safe to commit?**
A: NO! Never commit ANY keys. Keep them in `.env.local` (gitignored).

## Next Steps

1. Read `MIGRATE_TO_SECRET_KEY.md` for detailed instructions
2. Get your Secret Key from Supabase Dashboard
3. Start with migrating `send-notification` API route
4. Test thoroughly
5. Gradually migrate other files

Remember: When in doubt, use Secret Key - it's safer!
