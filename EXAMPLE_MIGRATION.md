# Example Migration: send-notification API

## Before (Using Service Role Key - Dangerous)

```typescript
// src/app/api/send-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/notifications/email-gmail';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, data } = body;

    // ❌ Using Service Role Key - overkill for this operation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!  // Bypasses ALL security
    );

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name, display_name')
      .eq('id', userId)
      .single();

    // ... rest of code
  }
}
```

## After (Using Secret Key - Safer)

```typescript
// src/app/api/send-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/notifications/email-gmail';
import { createSecretClient } from '@/lib/supabase-admin';  // ✅ New import

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, data } = body;

    // Validate input
    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, userId' },
        { status: 400 }
      );
    }

    // ✅ Using Secret Key - respects RLS policies
    const supabase = createSecretClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name, display_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare email data
    const userName = user.display_name || user.name || 'Operative';
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://navygoal.com'}/dashboard`;

    // Send email notification
    const result = await sendEmailNotification({
      to: user.email,
      type: type,
      data: {
        userName,
        dashboardUrl,
        ...data,
      },
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      messageId: result.data?.messageId,
    });
  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## What Changed?

1. **Import**: Changed from `createClient` to `createSecretClient`
2. **Client Creation**: Simplified - no need to pass credentials
3. **Security**: Now respects RLS policies instead of bypassing them

## Why This Is Better

### Security
- If Secret Key is exposed, attacker can only access data allowed by RLS
- Service Role Key exposure = full database access

### Debugging
- RLS policies work as expected
- Easier to test permissions
- Catches permission issues early

### Best Practices
- Follows principle of least privilege
- Matches Supabase recommendations
- Easier to audit

## Files You Should Migrate

### High Priority (Safe to Migrate):

1. **src/app/api/send-notification/route.ts** ✅ (shown above)
2. **supabase/functions/send-goal-reminders/index.ts**
3. **supabase/functions/check-inactive-users/index.ts**

### Keep Service Role (Need Admin Access):

1. **src/app/api/polar-webhook/route.ts** - External webhook
2. **src/app/api/kpay-webhook/route.ts** - External webhook
3. **src/app/api/activate-subscription/route.ts** - Admin operation

## Quick Migration Checklist

For each file:

1. ✅ Does it operate on behalf of a specific user?
2. ✅ Should it respect RLS policies?
3. ✅ Is it NOT an external webhook?

If yes to all → Migrate to Secret Key

If no to any → Keep Service Role Key

## Testing After Migration

```typescript
// Test that RLS is working
const supabase = createSecretClient();

// This should only return the user's own data
const { data, error } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', userId);

// If you get permission errors, check your RLS policies
```

## Rollback If Needed

If something breaks:

```typescript
// Temporarily revert to Service Role
import { createServiceRoleClient } from '@/lib/supabase-admin';
const supabase = createServiceRoleClient();
```

Then debug the RLS policies and migrate again.
