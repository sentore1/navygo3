# Fix: Stripe Build Error - "Neither apiKey nor config.authenticator provided"

## Error
```
Error: Neither apiKey nor config.authenticator provided
    at i._setAuthenticator (/vercel/path0/.next/server/chunks/2697.js:1:127189)
    at new i (/vercel/path0/.next/server/chunks/2697.js:1:125998)
    at 94500 (/vercel/path0/.next/server/app/api/cancel-subscription/route.js:1:1047)
```

## Root Cause

The Stripe client was being initialized at the module level:

```typescript
// ❌ WRONG - Initializes during build time
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
});
```

During the Next.js build process, environment variables may not be available, causing Stripe initialization to fail with an empty API key.

## Solution

Changed to lazy initialization - Stripe is only created when the API route is actually called:

```typescript
// ✅ CORRECT - Initializes only when needed
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
  });
};

// Then use it in the handler
export async function POST(request: NextRequest) {
  // ...
  const stripe = getStripe();
  // ...
}
```

## Files Fixed

1. ✅ `src/app/api/cancel-subscription/route.ts`
2. ✅ `src/app/api/create-portal-session/route.ts`

## Changes Made

### Before (Module-level initialization)
```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: NextRequest) {
  // Use stripe directly
  await stripe.subscriptions.update(...);
}
```

### After (Lazy initialization)
```typescript
import Stripe from "stripe";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
  });
};

export async function POST(request: NextRequest) {
  // Initialize only when needed
  const stripe = getStripe();
  await stripe.subscriptions.update(...);
}
```

## Why This Works

1. **Build Time**: During `next build`, the module is loaded but `getStripe()` is never called, so Stripe is never initialized
2. **Runtime**: When a request comes in, `getStripe()` is called and Stripe is initialized with the environment variable
3. **Error Handling**: If the API key is missing at runtime, we get a clear error message

## Benefits

- ✅ Build succeeds even without Stripe API key
- ✅ Clear error messages at runtime if key is missing
- ✅ No performance impact (Stripe is still initialized once per request)
- ✅ Follows Next.js best practices for API routes

## Testing

After this fix:
1. Build completes successfully ✅
2. Subscription cancellation works at runtime ✅
3. Portal session creation works at runtime ✅
4. Clear error if STRIPE_SECRET_KEY is missing ✅

## Environment Variables

Make sure to set in your deployment platform (Vercel, etc.):

```bash
STRIPE_SECRET_KEY=sk_live_xxxxx  # or sk_test_xxxxx for testing
```

## Related Issues

This is a common pattern for Next.js API routes that use external services:
- Database connections
- API clients (Stripe, SendGrid, etc.)
- Third-party SDKs

**Rule of thumb**: Never initialize external clients at module level in Next.js API routes. Always use lazy initialization.

## Status

✅ Fixed and verified - Build now succeeds
