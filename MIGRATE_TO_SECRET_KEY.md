# Migrate from Service Role Key to Secret Key

## Understanding the Difference

### Legacy Keys (What You're Using Now):
- **Anon Key** - Public, safe to expose in frontend
- **Service Role Key** - FULL ADMIN ACCESS, bypasses ALL security rules ⚠️

### New Keys (More Secure):
- **Publishable Key** - Public, safe to expose in frontend (same as anon key)
- **Secret Key** - Server-side only, respects RLS policies ✅

## Key Differences

| Feature | Service Role Key | Secret Key |
|---------|-----------------|------------|
| Bypasses RLS | ✅ YES | ❌ NO |
| Admin Access | ✅ Full | ❌ Limited |
| Security | ⚠️ Dangerous if exposed | ✅ Safer |
| Use Case | Admin operations only | Most server operations |

## When You ACTUALLY Need Service Role Key

You only need the Service Role Key for:

1. **Admin operations that bypass RLS**
   - Creating users programmatically
   - Bulk data operations
   - System maintenance tasks

2. **Webhooks from external services**
   - Payment webhooks (Stripe, Polar)
   - Third-party integrations

3. **Scheduled functions that need admin access**
   - Sending notifications to all users
   - Cleanup jobs

## When You Can Use Secret Key Instead

Use Secret Key for:

1. **User-specific operations** (respects RLS)
   - Creating goals for authenticated users
   - Updating user profiles
   - Reading user data

2. **API routes that don't need admin access**
   - Most of your API endpoints
   - User-facing operations

## Migration Plan

### Step 1: Get Your Secret Key

1. Go to Supabase Dashboard → Settings → API
2. Look for "Secret Key" (not Service Role Key)
3. Copy it

### Step 2: Update .env.local

```env
# Public keys (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-side keys (NEVER expose)
SUPABASE_SECRET_KEY=your_new_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Keep for admin operations only
```

### Step 3: Create Helper Functions

Create `src/lib/supabase-admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// For operations that respect RLS (most operations)
export function createSecretClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

// For admin operations that bypass RLS (use sparingly!)
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
```

### Step 4: Migrate Your Code

#### Example 1: Send Notification API (Can Use Secret Key)

**Before:**
```typescript
// src/app/api/send-notification/route.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!  // ❌ Overkill
);
```

**After:**
```typescript
import { createSecretClient } from '@/lib/supabase-admin';

const supabase = createSecretClient();  // ✅ Respects RLS
```

#### Example 2: Webhook (Needs Service Role)

**Keep as is:**
```typescript
// src/app/api/polar-webhook/route.ts
import { createServiceRoleClient } from '@/lib/supabase-admin';

const supabase = createServiceRoleClient();  // ✅ Needs admin access
```

#### Example 3: Edge Function (Can Use Secret Key)

**Before:**
```typescript
// supabase/functions/send-goal-reminders/index.ts
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''  // ❌ Overkill
);
```

**After:**
```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SECRET_KEY') ?? ''  // ✅ Respects RLS
);
```

### Step 5: Audit Your Code

Go through each file and decide:

#### Use Secret Key (Safer):
- ✅ `src/app/api/send-notification/route.ts`
- ✅ `supabase/functions/send-goal-reminders/index.ts`
- ✅ `supabase/functions/check-inactive-users/index.ts`
- ✅ Most Edge Functions

#### Keep Service Role Key (Admin Access Needed):
- ⚠️ `src/app/api/polar-webhook/route.ts` (external webhook)
- ⚠️ `src/app/api/kpay-webhook/route.ts` (external webhook)
- ⚠️ `src/app/api/activate-subscription/route.ts` (admin operation)
- ⚠️ `supabase/functions/payments-webhook/index.ts` (external webhook)

## Files to Update

### High Priority (Use Secret Key):

1. **src/app/api/send-notification/route.ts**
   ```typescript
   import { createSecretClient } from '@/lib/supabase-admin';
   const supabase = createSecretClient();
   ```

2. **supabase/functions/send-goal-reminders/index.ts**
   ```typescript
   const supabaseClient = createClient(
     Deno.env.get('SUPABASE_URL') ?? '',
     Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
   );
   ```

3. **supabase/functions/check-inactive-users/index.ts**
   ```typescript
   const supabaseClient = createClient(
     Deno.env.get('SUPABASE_URL') ?? '',
     Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
   );
   ```

### Keep Service Role (Admin Access Required):

1. **src/app/api/polar-webhook/route.ts** - External webhook
2. **src/app/api/kpay-webhook/route.ts** - External webhook
3. **src/app/api/activate-subscription/route.ts** - Admin operation

## Update Environment Variables

### Local (.env.local):
```env
SUPABASE_SECRET_KEY=your_secret_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Vercel:
```bash
vercel env add SUPABASE_SECRET_KEY production
# Paste your secret key when prompted
```

### Supabase Edge Functions:
```bash
# Set secret key for Edge Functions
supabase secrets set SUPABASE_SECRET_KEY=your_secret_key_here
```

## Benefits of This Migration

1. **Better Security** ✅
   - Secret key respects RLS policies
   - Less damage if exposed
   - Follows principle of least privilege

2. **Easier Debugging** ✅
   - RLS policies work as expected
   - Can test with actual user permissions
   - Catches permission issues early

3. **Compliance** ✅
   - Follows Supabase best practices
   - Reduces attack surface
   - Better audit trail

## Testing After Migration

### Test 1: User Operations
```typescript
// Should work with Secret Key
const supabase = createSecretClient();
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);  // Respects RLS
```

### Test 2: Admin Operations
```typescript
// Should work with Service Role Key
const supabase = createServiceRoleClient();
const { data } = await supabase
  .from('users')
  .select('*');  // Bypasses RLS, gets all users
```

## Rollback Plan

If something breaks:

1. Keep both keys in environment variables
2. Revert specific files back to Service Role Key
3. Debug the RLS policies
4. Fix policies, then migrate again

## Summary

**Current State:**
- Using Service Role Key everywhere ⚠️
- Dangerous if exposed
- Bypasses all security

**Target State:**
- Use Secret Key for most operations ✅
- Use Service Role Key only for admin operations ⚠️
- Better security posture
- Follows best practices

**Action Items:**
1. Get Secret Key from Supabase Dashboard
2. Add to .env.local and production
3. Create helper functions
4. Migrate non-admin operations to Secret Key
5. Keep Service Role Key for webhooks and admin operations
6. Test thoroughly
7. Remove Service Role Key from Git history

This approach gives you the security benefits while maintaining functionality for operations that truly need admin access.
